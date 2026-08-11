// ============================================================================
// APP — view routing, toast, theme, auth gate wiring, SW registration.
// ============================================================================

var Toast = (function () {
  var timer;
  function show(msg, isError) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.toggle('is-error', !!isError);
    el.classList.add('is-visible');
    clearTimeout(timer);
    timer = setTimeout(function () { el.classList.remove('is-visible'); }, 2400);
  }
  return { show: show };
})();

function showView(name) {
  document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('is-active'); });
  document.getElementById('view-' + name).classList.add('is-active');

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    var active = btn.dataset.view === name;
    btn.classList.toggle('is-active', active);
    if (active) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
  });

  if (name === 'dashboard') Dashboard.load(false);
}

function initNav() {
  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { showView(btn.dataset.view); });
  });
}

function initTheme() {
  var toggle = document.getElementById('darkModeToggle');
  var saved = localStorage.getItem('ledger_theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var isDark = saved ? saved === 'dark' : prefersDark;

  applyTheme(isDark);
  toggle.checked = isDark;

  toggle.addEventListener('change', function () {
    applyTheme(toggle.checked);
    localStorage.setItem('ledger_theme', toggle.checked ? 'dark' : 'light');
  });
}

function applyTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

function initSettings() {
  document.getElementById('settingsEmail').textContent = Auth.getEmail() || '—';
  document.getElementById('signOutBtn').addEventListener('click', function () {
    Auth.signOut();
  });
}

function onSignedIn() {
  document.getElementById('authGate').classList.add('is-hidden');
  initSettings();
}

window.addEventListener('ledger:signed-in', onSignedIn);

document.addEventListener('DOMContentLoaded', function () {
  initNav();
  initTheme();
  RecordForm.init();
  Dashboard.init();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js').catch(function () {
      // Non-fatal — app still works online without the service worker.
    });
  });
}
