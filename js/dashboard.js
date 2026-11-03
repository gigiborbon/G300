// ============================================================================
// DASHBOARD - read the balance summary and breakdown from the Form sheet.
// ============================================================================

var Dashboard = (function () {
  var stale = true;
  var loading = false;

  function formatCurrency(value) {
    var number = Number(value);
    if (!isFinite(number)) number = 0;

    return number.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function render(data) {
    var content = document.getElementById('dashboardContent');
    if (!content) return;

    var cash = Number(data.cash);
    var bankTotal = Number(data.bankTotal);
    var total = Number(data.total);
    var overShort = Number(data.overShort);

    if (!isFinite(cash)) cash = 0;
    if (!isFinite(bankTotal)) bankTotal = 0;
    if (!isFinite(total)) total = 0;
    if (!isFinite(overShort)) overShort = 0;

    var isOver = overShort >= 0;
    var label = isOver ? 'Over' : 'Short';
    var color = 'var(--text-light)';
    var sign = isOver ? '+' : '\u2212';
    var amount = Math.abs(overShort);
    var breakdown = Array.isArray(data.breakdown) ? data.breakdown : [];

    var breakdownHtml = breakdown.map(function (item) {
      return '<div class="dashboard-card">' +
        '<div class="card-label">' + escapeHtml(item.name) + '</div>' +
        '<div class="card-value">\u20b1' + formatCurrency(item.balance) + '</div>' +
      '</div>';
    }).join('');

    content.innerHTML =
      '<div class="dashboard-grid">' +
        '<div class="dashboard-card">' +
          '<div class="card-label">Cash</div>' +
          '<div class="card-value">\u20b1' + formatCurrency(cash) + '</div>' +
        '</div>' +
        breakdownHtml +
        '<div class="dashboard-card">' +
          '<div class="card-label">Total Bank Balance</div>' +
          '<div class="card-value">\u20b1' + formatCurrency(bankTotal) + '</div>' +
        '</div>' +
        '<div class="dashboard-card">' +
          '<div class="card-label">Total Wallet Balance</div>' +
          '<div class="card-value">\u20b1' + formatCurrency(total) + '</div>' +
        '</div>' +
        '<div class="dashboard-card highlight" style="border-left:4px solid ' + color + ';">' +
          '<div class="card-label" style="color:' + color + ';">' + label + '</div>' +
          '<div class="card-value" style="color:' + color + ';">' +
            sign + '\u20b1' + formatCurrency(amount) +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="dashboard-summary">' +
        '<p><strong>Summary:</strong> Cash is \u20b1' + formatCurrency(cash) +
        ', bank accounts total \u20b1' + formatCurrency(bankTotal) +
        ', all wallets total \u20b1' + formatCurrency(total) +
        ', and cash is ' + label.toLowerCase() + ' by \u20b1' + formatCurrency(amount) + '.</p>' +
      '</div>';

    var synced = data.lastSynced ? new Date(data.lastSynced) : new Date();
    var syncNote = document.getElementById('dashSyncNote');
    if (syncNote) {
      syncNote.textContent = 'Synced ' + synced.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = String(value || '');
    return div.innerHTML;
  }

  function load(force) {
    if (loading || (!force && !stale)) return;

    loading = true;
    var content = document.getElementById('dashboardContent');
    if (content) {
      content.innerHTML = '<div class="dashboard-skeleton">Loading balances\u2026</div>';
    }

    Api.dashboard(Auth.getToken()).then(function (result) {
      loading = false;

      if (!result.ok) {
        throw new Error(result.error || 'Unable to load dashboard.');
      }

      stale = false;
      render(result.data || {});
    }).catch(function (error) {
      loading = false;
      if (content) {
        content.innerHTML = '<div class="error-card"></div>';
        content.firstChild.textContent = 'Failed to load dashboard: ' + error.message;
      }

      var syncNote = document.getElementById('dashSyncNote');
      if (syncNote) syncNote.textContent = 'Error';
    });
  }

  function invalidate() {
    stale = true;
  }

  function init() {
    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () { load(true); });
    }
  }

  return { init: init, load: load, invalidate: invalidate };
})();

