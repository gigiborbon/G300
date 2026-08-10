// ============================================================================
// AUTH — Google Identity Services sign-in, token storage, sign-out.
// ============================================================================

var Auth = (function () {
  var STORAGE_KEY = 'ledger_id_token';
  var STORAGE_EMAIL_KEY = 'ledger_email';

  function getToken() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function getEmail() {
    return localStorage.getItem(STORAGE_EMAIL_KEY);
  }

  function decodeJwt(token) {
    try {
      var payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch (e) {
      return null;
    }
  }

  function handleCredentialResponse(response) {
    var idToken = response.credential;
    var payload = decodeJwt(idToken);

    localStorage.setItem(STORAGE_KEY, idToken);
    if (payload && payload.email) {
      localStorage.setItem(STORAGE_EMAIL_KEY, payload.email);
    }

    // Confirm the token is actually accepted by the backend before
    // dropping the gate — a token can decode fine but still be
    // unauthorized (wrong account, not on the allow list).
    document.getElementById('authError').textContent = '';
    Api.ping(idToken).then(function (res) {
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('ledger:signed-in'));
      } else {
        signOut();
        document.getElementById('authError').textContent = res.error || 'Sign-in failed.';
      }
    }).catch(function () {
      // Ping endpoint itself doesn't require auth, so a failure here is
      // network-level; let the user proceed and surface errors on first
      // real request instead of blocking sign-in on connectivity.
      window.dispatchEvent(new CustomEvent('ledger:signed-in'));
    });
  }

  function init() {
    if (getToken()) {
      window.dispatchEvent(new CustomEvent('ledger:signed-in'));
      return;
    }

    if (!window.google || !window.google.accounts) {
      // GIS script hasn't loaded yet — retry shortly.
      setTimeout(init, 300);
      return;
    }

    google.accounts.id.initialize({
      client_id: APP_CONFIG.GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
      document.getElementById('googleSignInBtn'),
      { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with' }
    );
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_EMAIL_KEY);
    if (window.google && window.google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    window.dispatchEvent(new CustomEvent('ledger:signed-out'));
  }

  return { init: init, getToken: getToken, getEmail: getEmail, signOut: signOut };
})();
