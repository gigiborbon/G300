// ============================================================================
// CASH COUNT - edit Form!G2:G10 and display the calculated total from H11.
// ============================================================================

var CashCount = (function () {
  var stale = true;
  var loading = false;

  function formatCurrency(value) {
    if (value === null || value === '' || typeof value === 'undefined') return '\u2014';
    var number = Number(value);
    if (!isFinite(number)) return '\u2014';
    return '\u20b1' + number.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = String(value || '');
    return div.innerHTML;
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function render(data) {
    var content = document.getElementById('cashCountContent');
    if (!content) return;

    var rows = Array.isArray(data.rows) ? data.rows : [];
    var rowsHtml = rows.map(function (row, index) {
      var inputValue = row.input === '' || row.input === null ? '' : String(row.input);
      return '<div class="cash-count-row">' +
        '<div class="cash-count-label">' + escapeHtml(row.label) + '</div>' +
        '<input class="cash-count-input" type="number" inputmode="decimal" min="0" step="any" ' +
          'data-index="' + index + '" value="' + escapeAttribute(inputValue) + '" aria-label="' +
          escapeAttribute(row.label) + ' value">' +
        '<div class="cash-count-amount">' + formatCurrency(row.amount) + '</div>' +
      '</div>';
    }).join('');

    content.innerHTML =
      '<form id="cashCountForm" novalidate>' +
        '<div class="cash-count-table">' +
          '<div class="cash-count-row is-header"><span>Item</span><span>Value</span><span>Amount</span></div>' +
          rowsHtml +
        '</div>' +
        '<div class="cash-count-total"><span>Total</span><strong>' + formatCurrency(data.total) + '</strong></div>' +
        '<button type="submit" class="btn-primary" id="cashCountSaveBtn">Save cash count</button>' +
      '</form>';

    document.getElementById('cashCountForm').addEventListener('submit', save);
    updateSyncNote(data.lastSynced);
  }

  function updateSyncNote(timestamp) {
    var note = document.getElementById('cashCountSyncNote');
    if (!note) return;
    var synced = timestamp ? new Date(timestamp) : new Date();
    note.textContent = 'Synced ' + synced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function showError(message) {
    var content = document.getElementById('cashCountContent');
    if (!content) return;
    content.innerHTML = '<div class="error-card"></div>';
    content.firstChild.textContent = message;
    document.getElementById('cashCountSyncNote').textContent = 'Error';
  }

  function load(force) {
    if (loading || (!force && !stale)) return;
    loading = true;

    var content = document.getElementById('cashCountContent');
    if (content) content.innerHTML = '<div class="dashboard-skeleton">Loading cash count\u2026</div>';

    Api.cashCount(Auth.getToken()).then(function (result) {
      loading = false;
      if (!result.ok) throw new Error(result.error || 'Unable to load cash count.');
      stale = false;
      render(result.data || {});
    }).catch(function (error) {
      loading = false;
      showError('Failed to load cash count: ' + error.message);
    });
  }

  function save(event) {
    event.preventDefault();
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.cash-count-input'));
    var values = [];

    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].value === '') {
        values.push('');
        continue;
      }
      var number = Number(inputs[i].value);
      if (!isFinite(number) || number < 0) {
        Toast.show('Enter blank or non-negative values only.', true);
        inputs[i].focus();
        return;
      }
      values.push(number);
    }

    var button = document.getElementById('cashCountSaveBtn');
    button.disabled = true;
    button.textContent = 'Saving\u2026';

    Api.updateCashCount(Auth.getToken(), values).then(function (result) {
      if (!result.ok) throw new Error(result.error || 'Unable to save cash count.');
      stale = false;
      render(result.data || {});
      Dashboard.invalidate();
      Toast.show('Cash count saved');
    }).catch(function (error) {
      button.disabled = false;
      button.textContent = 'Save cash count';
      Toast.show(error.message, true);
    });
  }

  function init() {
    var refresh = document.getElementById('cashCountRefreshBtn');
    if (refresh) refresh.addEventListener('click', function () { load(true); });
  }

  return { init: init, load: load };
})();
