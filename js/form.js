// ============================================================================
// FORM — Add Record screen behavior.
// ============================================================================

var RecordForm = (function () {
  var state = { wallet: null, type: 'expense' };
  var categoriesLoaded = false;

  function renderWalletChips() {
    var container = document.getElementById('walletChips');
    container.innerHTML = '';
    APP_CONFIG.WALLETS.forEach(function (name, i) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'wallet-chip' + (i === 0 ? ' is-selected' : '');
      chip.textContent = name;
      chip.dataset.wallet = name;
      chip.addEventListener('click', function () { selectWallet(name); });
      container.appendChild(chip);
    });
    if (APP_CONFIG.WALLETS.length) state.wallet = APP_CONFIG.WALLETS[0];
  }

  function selectWallet(name) {
    state.wallet = name;
    document.querySelectorAll('.wallet-chip').forEach(function (chip) {
      chip.classList.toggle('is-selected', chip.dataset.wallet === name);
    });
  }

  function selectType(type) {
    state.type = type;
    document.querySelectorAll('.type-toggle button').forEach(function (btn) {
      var active = btn.dataset.type === type;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active);
    });
  }

  function setToday() {
    var now = new Date();
    document.getElementById('dateInput').valueAsDate = now;
    document.getElementById('dateDisplay').textContent = 'Today';
  }

  function loadCategories() {
    if (categoriesLoaded) return;
    Api.categories(Auth.getToken()).then(function (res) {
      var select = document.getElementById('categorySelect');
      if (!res.ok) {
        Toast.show(res.error || 'Could not load categories', true);
        return;
      }
      res.data.forEach(function (cat) {
        var opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
      });
      categoriesLoaded = true;
    }).catch(function () {
      Toast.show('Could not reach the server for categories', true);
    });
  }

  function resetAfterSubmit() {
    // Mirrors clearForm() behavior on the sheet: wallet + amount reset,
    // category/particulars/notes/date are left as-is for quick repeat entries.
    if (APP_CONFIG.WALLETS.length) selectWallet(APP_CONFIG.WALLETS[0]);
    document.getElementById('amountInput').value = '';
    selectType('expense');
    document.getElementById('amountInput').focus();
  }

  function validate() {
    var amount = parseFloat(document.getElementById('amountInput').value);
    var amountError = document.getElementById('amountError');
    amountError.textContent = '';

    if (!state.wallet) { Toast.show('Choose a wallet', true); return false; }
    if (!amount || amount <= 0) {
      amountError.textContent = 'Enter an amount greater than 0.';
      return false;
    }
    if (!document.getElementById('categorySelect').value) {
      Toast.show('Choose a category', true);
      return false;
    }
    return true;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;

    var submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    var record = {
      wallet: state.wallet,
      isIncome: state.type === 'income',
      amount: parseFloat(document.getElementById('amountInput').value),
      category: document.getElementById('categorySelect').value,
      particulars: document.getElementById('particularsInput').value.trim(),
      notes: document.getElementById('notesInput').value.trim(),
      date: document.getElementById('dateInput').value
    };

    Api.addRecord(Auth.getToken(), record).then(function (res) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save entry';

      if (!res.ok) {
        Toast.show(res.error || 'Could not save entry', true);
        return;
      }
      Toast.show('Saved to ' + record.wallet);
      resetAfterSubmit();
      Dashboard.invalidate(); // next Dashboard visit refetches fresh balances
    }).catch(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save entry';
      Toast.show('Network error — entry not saved', true);
    });
  }

  function init() {
    renderWalletChips();
    setToday();
    loadCategories();

    document.querySelectorAll('.type-toggle button').forEach(function (btn) {
      btn.addEventListener('click', function () { selectType(btn.dataset.type); });
    });

    document.getElementById('notesToggle').addEventListener('click', function () {
      var field = document.getElementById('notesField');
      var open = field.classList.toggle('is-open');
      this.textContent = open ? '– Hide note' : '+ Add note';
    });

    document.getElementById('dateEditBtn').addEventListener('click', function () {
      document.getElementById('dateInput').classList.remove('visually-hidden');
      document.getElementById('dateInput').showPicker && document.getElementById('dateInput').showPicker();
      document.getElementById('dateInput').focus();
    });
    document.getElementById('dateInput').addEventListener('change', function () {
      var d = this.valueAsDate;
      var today = new Date();
      var isToday = d && d.toDateString() === today.toDateString();
      document.getElementById('dateDisplay').textContent = isToday
        ? 'Today'
        : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });

    document.getElementById('recordForm').addEventListener('submit', submit);
  }

  return { init: init };
})();
