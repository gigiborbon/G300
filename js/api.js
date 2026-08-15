// ============================================================================
// API — thin wrapper around the Apps Script Web App endpoints.
// GET requests use query params; POST sends text/plain to avoid a CORS
// preflight, which Apps Script Web Apps do not handle.
// ============================================================================

var Api = (function () {
  function get(action, sessionToken) {
    var url = APP_CONFIG.API_BASE_URL + '?action=' + encodeURIComponent(action);
    if (sessionToken) url += '&sessionToken=' + encodeURIComponent(sessionToken);

    return fetch(url).then(function (r) { return r.json(); });
  }

  function post(payload) {
    return fetch(APP_CONFIG.API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  return {
    ping: function () { return get('ping'); },
    login: function (idToken) { return post({ action: 'login', idToken: idToken }); },
    verifySession: function (sessionToken) { return post({ action: 'verifySession', sessionToken: sessionToken }); },
    signOut: function (sessionToken) { return post({ action: 'signOut', sessionToken: sessionToken }); },
    dashboard: function (sessionToken) { return get('dashboard', sessionToken); },
    cashCount: function (sessionToken) { return get('cashCount', sessionToken); },
    updateCashCount: function (sessionToken, values) {
      return post({ action: 'updateCashCount', sessionToken: sessionToken, values: values });
    },
    categories: function (sessionToken) { return get('categories', sessionToken); },
    addRecord: function (sessionToken, record) {
      var body = Object.assign({ action: 'addRecord', sessionToken: sessionToken }, record);
      return post(body);
    }
  };
})();
