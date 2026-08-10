// ============================================================================
// DASHBOARD — read-only balances + OVER tile.
// ============================================================================

var Dashboard = (function () {
  var stale = true;
  var loading = false;

  function fmt(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return '₱' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function render(data) {
    var content = document.getElementById('dashboardContent');
    var over = data.over;
    var balanced = over !== null && Math.abs(over) < 0.005;

    var html = '';
    html += '<div class="over-card">';
    html += '  <div class="label">Over / short</div>';
    html += '  <div class="value"><span class="status-dot' + (balanced ? '' : ' is-off') + '"></span>' + fmt(over) + '</div>';
    html += '</div>';

    html += '<div class="wallet-stack">';
    data.wallets.forEach(function (w) {
      html += '<div class="wallet-card"><span class="name">' + w.name + '</span><span class="balance">' + fmt(w.balance) + '</span></div>';
    });
    html += '</div>';

    content.innerHTML = html;

    var synced = new Date(data.lastSynced);
    document.getElementById('dashSyncNote').textContent = 'Synced ' + synced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function load(force) {
    if (loading) return;
    if (!force && !stale) return;

    loading = true;
    document.getElementById('dashboardContent').innerHTML = '<div class="dashboard-skeleton">Loading balances…</div>';

    Api.dashboard(Auth.getToken()).then(function (res) {
      loading = false;
      if (!res.ok) {
        document.getElementById('dashboardContent').innerHTML =
          '<div class="dashboard-empty">' + (res.error || 'Could not load the dashboard.') + '</div>';
        return;
      }
      stale = false;
      render(res.data);
    }).catch(function () {
      loading = false;
      document.getElementById('dashboardContent').innerHTML =
        '<div class="dashboard-empty">Network error — pull to refresh once you\'re back online.</div>';
    });
  }

  function invalidate() { stale = true; }

  function init() {
    document.getElementById('refreshBtn').addEventListener('click', function () { load(true); });
  }

  return { init: init, load: load, invalidate: invalidate };
})();
