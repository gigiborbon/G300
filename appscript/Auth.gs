/**
 * ============================================================================
 * AUTH.gs — Verifies Google Sign-In ID tokens from the mobile app.
 * ============================================================================
 */

/**
 * Verifies a Google ID token and checks the email against AUTHORIZED_EMAILS.
 * Returns { ok: true, email } or { ok: false, error }.
 */
function verifyIdToken(idToken) {
  if (!idToken) {
    return { ok: false, error: 'Missing sign-in token.' };
  }

  try {
    var resp = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
      { muteHttpExceptions: true }
    );

    if (resp.getResponseCode() !== 200) {
      return { ok: false, error: 'Invalid or expired sign-in token.' };
    }

    var payload = JSON.parse(resp.getContentText());

    if (payload.aud !== GOOGLE_CLIENT_ID) {
      return { ok: false, error: 'Token was not issued for this app.' };
    }

    if (payload.email_verified !== 'true' && payload.email_verified !== true) {
      return { ok: false, error: 'Email is not verified on this Google account.' };
    }

    var email = (payload.email || '').toLowerCase().trim();
    var allowed = AUTHORIZED_EMAILS.map(function (e) { return e.toLowerCase().trim(); });

    if (allowed.indexOf(email) === -1) {
      return { ok: false, error: 'This Google account is not authorized to use this app.' };
    }

    return { ok: true, email: email };
  } catch (err) {
    return { ok: false, error: 'Could not verify sign-in token: ' + err.message };
  }
}
