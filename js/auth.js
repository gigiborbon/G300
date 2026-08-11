var Auth = (function () {
  var SESSION_KEY = 'ledger_session_token';
  var EMAIL_KEY = 'ledger_user_email';
  var BIOMETRIC_KEY = 'ledger_biometric_id';

  function sessionToken() { return localStorage.getItem(SESSION_KEY); }
  function getEmail() { return localStorage.getItem(EMAIL_KEY); }

  function showError(message) {
    var el = document.getElementById('authError');
    el.textContent = message;
    el.style.display = 'block';
  }

  function clearError() {
    var el = document.getElementById('authError');
    el.textContent = '';
    el.style.display = 'none';
  }

  function openApp() {
    document.getElementById('authGate').classList.add('is-hidden');
    document.querySelector('.app-shell').classList.add('is-ready');
    window.dispatchEvent(new CustomEvent('ledger:signed-in'));
    RecordForm.loadCategories();
  }

  function showLogin() {
    document.getElementById('authGate').classList.remove('is-hidden');
    document.querySelector('.app-shell').classList.remove('is-ready');
  }

  function initGoogleSignIn() {
    if (!window.google) {
      setTimeout(initGoogleSignIn, 100);
      return;
    }
    google.accounts.id.initialize({
      client_id: APP_CONFIG.GOOGLE_CLIENT_ID,
      callback: function (response) {
        clearError();
        Api.login(response.credential).then(function (result) {
          if (!result.ok || !result.sessionToken) throw new Error(result.error || 'Sign-in failed');
          localStorage.setItem(SESSION_KEY, result.sessionToken);
          localStorage.setItem(EMAIL_KEY, result.email);
          showBiometricEnrollment();
        }).catch(function (error) { showError(error.message); });
      }
    });
    google.accounts.id.renderButton(document.getElementById('googleSignInBtn'), {
      theme: 'outline', size: 'large', width: 300, text: 'signin_with'
    });
  }

  function showBiometricEnrollment() {
    if (!window.PublicKeyCredential || localStorage.getItem(BIOMETRIC_KEY)) {
      openApp();
      return;
    }
    document.getElementById('googleSignInBtn').style.display = 'none';
    document.getElementById('biometricSection').style.display = 'block';
  }

  async function enrollBiometric() {
    try {
      var challenge = crypto.getRandomValues(new Uint8Array(32));
      var userId = new TextEncoder().encode(getEmail());
      var credential = await navigator.credentials.create({ publicKey: {
        challenge: challenge,
        rp: { name: 'G', id: location.hostname },
        user: { id: userId, name: getEmail(), displayName: getEmail() },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
        attestation: 'none'
      }});
      localStorage.setItem(BIOMETRIC_KEY, JSON.stringify({ rawId: Array.from(new Uint8Array(credential.rawId)) }));
      openApp();
    } catch (error) {
      showError('Fingerprint setup was not completed: ' + error.message);
    }
  }

  async function biometricUnlock() {
    var stored = JSON.parse(localStorage.getItem(BIOMETRIC_KEY));
    var assertion = await navigator.credentials.get({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{ type: 'public-key', id: new Uint8Array(stored.rawId) }],
      userVerification: 'required',
      timeout: 60000
    }});
    return !!assertion;
  }

  function verifyExistingSession() {
    var token = sessionToken();
    if (!token) return Promise.resolve(false);
    var biometric = localStorage.getItem(BIOMETRIC_KEY);
    var unlock = biometric && window.PublicKeyCredential ? biometricUnlock() : Promise.resolve(true);
    return unlock.then(function () { return Api.verifySession(token); }).then(function (result) {
      if (!result.ok) throw new Error(result.error || 'Session is no longer valid');
      localStorage.setItem(EMAIL_KEY, result.email);
      openApp();
      return true;
    }).catch(function () {
      showLogin();
      return false;
    });
  }

  function signOut() {
    var token = sessionToken();
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(BIOMETRIC_KEY);
    var request = token ? Api.signOut(token) : Promise.resolve();
    request.finally(function () { location.reload(); });
  }

  function init() {
    showLogin();
    document.getElementById('enrollBiometricBtn').addEventListener('click', enrollBiometric);
    document.getElementById('skipBiometricBtn').addEventListener('click', openApp);
    verifyExistingSession().then(function (signedIn) {
      if (!signedIn) initGoogleSignIn();
    });
  }

  return { init: init, getToken: sessionToken, getEmail: getEmail, signOut: signOut };
})();

document.addEventListener('DOMContentLoaded', Auth.init);
