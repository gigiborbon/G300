const DASHBOARD = (() => {

  function initDashboard() {
    const dashboardBtn = document.querySelector('[data-view="dashboard"]');
    const refreshBtn = document.getElementById("refreshBtn");

    if (dashboardBtn) {
      dashboardBtn.addEventListener("click", loadDashboard);
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", loadDashboard);
    }
  }

  function loadDashboard() {
    const content = document.getElementById("dashboardContent");

    if (content) {
      content.innerHTML =
        "<div class='dashboard-skeleton'>Loading balances…</div>";
    }

    API.get("/dashboard")
      .then((data) => {
        renderDashboard(
          Number(data.cash || 0),
          Number(data.total || 0),
          Number(data.overShort || 0)
        );

        updateSyncNote("Just now");
      })
      .catch((err) => {
        if (content) {
          content.innerHTML = `
            <div class="error-card">
              Failed to load dashboard: ${err.message}
            </div>`;
        }

        updateSyncNote("Error");
      });
  }

  function renderDashboard(cash, total, overShort) {
    const content = document.getElementById("dashboardContent");
    if (!content) return;

    const isOver = overShort >= 0;
    const label = isOver ? "Over" : "Short";
    const amount = Math.abs(overShort);
    const color = isOver ? "var(--success)" : "var(--error)";

    content.innerHTML = `
      <div class="dashboard-grid">

        <div class="dashboard-card">
          <div class="card-label">Cash</div>
          <div class="card-value">₱${formatCurrency(cash)}</div>
        </div>

        <div class="dashboard-card">
          <div class="card-label">Total</div>
          <div class="card-value">₱${formatCurrency(total)}</div>
        </div>

        <div class="dashboard-card highlight" style="border-left:4px solid ${color};">
          <div class="card-label">${label}</div>
          <div class="card-value" style="color:${color};">
            ${isOver ? "+" : "−"}₱${formatCurrency(amount)}
          </div>
        </div>

      </div>

      <div class="dashboard-summary">
        <p>
          <strong>Summary:</strong><br>
          Cash: <strong>₱${formatCurrency(cash)}</strong><br>
          Total: <strong>₱${formatCurrency(total)}</strong><br>
          ${label}: <strong style="color:${color};">
          ${isOver ? "+" : "−"}₱${formatCurrency(amount)}
          </strong>
        </p>
      </div>
    `;
  }

  function formatCurrency(value) {
    return Number(value).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function updateSyncNote(note) {
    const syncNote = document.getElementById("dashSyncNote");
    if (syncNote) {
      syncNote.textContent = note;
    }
  }

  return {
    init: initDashboard,
    load: loadDashboard,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  DASHBOARD.init();
});
