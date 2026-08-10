// ============================================================================
// API — thin wrapper around the Apps Script Web App endpoints.
// GET requests use query params; POST sends text/plain to avoid a CORS
// preflight, which Apps Script Web Apps do not handle.
// ============================================================================

var Api = (function () {
  function get(action, idToken) {
    var url = APP_CONFIG.API_BASE_URL + '?action=' + encodeURIComponent(action);
    if (idToken) url += '&idToken=' + encodeURIComponent(idToken);

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
    dashboard: function (idToken) { return get('dashboard', idToken); },
    categories: function (idToken) { return get('categories', idToken); },
    addRecord: function (idToken, record) {
      var body = Object.assign({ idToken: idToken }, record);
      return post(body);
    }
  };
})();
