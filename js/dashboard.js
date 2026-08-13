const DASHBOARD = (() => {
  const FORM_SHEET = "Form";
  const CASH_CELL = "H11";
  const TOTAL_CELL = "H19";
  const OVER_SHORT_CELL = "H13";

  function initDashboard() {
    const dashboardBtn = document.querySelector('[data-view="dashboard"]');
    const refreshBtn = document.getElementById("refreshBtn");

    if (dashboardBtn) {
      dashboardBtn.addEventListener("click", () => {
        loadDashboard();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        loadDashboard();
      });
    }
  }

  function loadDashboard() {
    const content = document.getElementById("dashboardContent");
    if (content) content.innerHTML = "<div class='dashboard-skeleton'>Loading balances…</div>";

    // Fetch all three values from Form sheet
    Promise.all([
      fetchCellValue(FORM_SHEET, CASH_CELL),
      fetchCellValue(FORM_SHEET, TOTAL_CELL),
      fetchCellValue(FORM_SHEET, OVER_SHORT_CELL),
    ])
      .then(([cashValue, totalValue, overShortValue]) => {
        renderDashboard(
          parseFloat(cashValue) || 0,
          parseFloat(totalValue) || 0,
          parseFloat(overShortValue) || 0
        );
        updateSyncNote("Just now");
      })
      .catch((err) => {
        if (content) {
          content.innerHTML = `<div class="error-card">Failed to load balances: ${err.message}</div>`;
        }
        updateSyncNote("Error");
      });
  }

  function fetchCellValue(sheet, cell) {
    return API.post("/getCellValue", {
      sheet,
      cell,
    }).then((data) => {
      return data.value || 0;
    });
  }

  function renderDashboard(cash, total, overShort) {
    const content = document.getElementById("dashboardContent");
    if (!content) return;

    const isOver = overShort >= 0;
    const overShortLabel = isOver ? "Over" : "Short";
    const overShortAmount = Math.abs(overShort);
    const overShortColor = isOver ? "var(--success)" : "var(--error)";

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

        <div class="dashboard-card highlight" style="border-left: 4px solid ${overShortColor};">
          <div class="card-label">${overShortLabel}</div>
          <div class="card-value" style="color: ${overShortColor};">
            ${isOver ? "+" : "−"}₱${formatCurrency(overShortAmount)}
          </div>
        </div>
      </div>

      <div class="dashboard-summary">
        <p>
          <strong>Summary:</strong> You have ₱${formatCurrency(cash)} in cash, 
          total budget is ₱${formatCurrency(total)}, 
          and you're ${overShortLabel.toLowerCase()} by ₱${formatCurrency(overShortAmount)}.
        </p>
      </div>
    `;
  }

  function formatCurrency(value) {
    if (!value && value !== 0) return "0.00";
    return parseFloat(value).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function updateSyncNote(note) {
    const syncNote = document.getElementById("dashSyncNote");
    if (syncNote) syncNote.textContent = note;
  }

  return {
    init: initDashboard,
  };
})();

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  DASHBOARD.init();
});
