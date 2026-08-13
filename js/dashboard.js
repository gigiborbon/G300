var DASHBOARD = (function () {

  function initDashboard() {
    var dashboardBtn = document.querySelector('[data-view="dashboard"]');
    var refreshBtn = document.getElementById("refreshBtn");

    if (dashboardBtn) {
      dashboardBtn.addEventListener("click", function () {
        loadDashboard();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        loadDashboard();
      });
    }
  }

  function loadDashboard() {
    var content = document.getElementById("dashboardContent");

    if (content) {
      content.innerHTML =
        "<div class='dashboard-skeleton'>Loading balances…</div>";
    }

    var sessionToken = Auth.getToken();

    Api.dashboard(sessionToken)
      .then(function (result) {

        if (!result.ok) {
          throw new Error(result.error || "Unable to load dashboard.");
        }

        var data = result.data || {};

        renderDashboard(
          Number(data.cash || 0),
          Number(data.total || 0),
          Number(data.overShort || 0)
        );

        updateSyncNote("Just now");
      })
      .catch(function (err) {

        if (content) {
          content.innerHTML =
            "<div class='error-card'>" +
            "Failed to load dashboard: " +
            escapeHtml(err.message) +
            "</div>";
        }

        updateSyncNote("Error");
      });
  }

  function renderDashboard(cash, total, overShort) {

    var content = document.getElementById("dashboardContent");

    if (!content) return;

    var isOver = overShort >= 0;

    var label = isOver ? "Over" : "Short";

    var amount = Math.abs(overShort);

    var color = isOver
      ? "var(--success)"
      : "var(--error)";

    content.innerHTML =

      "<div class='dashboard-grid'>" +

        "<div class='dashboard-card'>" +
          "<div class='card-label'>Cash</div>" +
          "<div class='card-value'>₱" +
            formatCurrency(cash) +
          "</div>" +
        "</div>" +

        "<div class='dashboard-card'>" +
          "<div class='card-label'>Total</div>" +
          "<div class='card-value'>₱" +
            formatCurrency(total) +
          "</div>" +
        "</div>" +

        "<div class='dashboard-card highlight' " +
          "style='border-left:4px solid " + color + ";'>" +

          "<div class='card-label'>" +
            label +
          "</div>" +

          "<div class='card-value' " +
            "style='color:" + color + ";'>" +

            (isOver ? "+" : "−") +
            "₱" +
            formatCurrency(amount) +

          "</div>" +

        "</div>" +

      "</div>" +

      "<div class='dashboard-summary'>" +
        "<p>" +
          "<strong>Summary:</strong> " +

          "You have ₱" +
          formatCurrency(cash) +
          " in cash, " +

          "total is ₱" +
          formatCurrency(total) +
          ", " +

          "and you're " +
          label.toLowerCase() +
          " by ₱" +
          formatCurrency(amount) +
          "." +

        "</p>" +
      "</div>";
  }

  function formatCurrency(value) {

    return Number(value).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  }

  function updateSyncNote(note) {

    var syncNote = document.getElementById("dashSyncNote");

    if (syncNote) {
      syncNote.textContent = note;
    }

  }

  function escapeHtml(value) {

    var div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

  }

  return {
    init: initDashboard,
    load: loadDashboard
  };

})();

document.addEventListener("DOMContentLoaded", function () {
  DASHBOARD.init();
});
