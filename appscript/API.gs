/**
 * ============================================================================
 * API.gs — Read-side helpers: dashboard balances + category list.
 * These are called by doGet() in Code.gs.
 * ============================================================================
 */

/**
 * Returns the latest running balance (last non-empty value in column G)
 * for a single wallet tab.
 */
function getWalletBalance(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;

  var lastRow = sheet.getLastRow();
  if (lastRow < 1) return 0;

  var values = sheet.getRange(1, 7, lastRow, 1).getValues(); // column G
  for (var i = values.length - 1; i >= 0; i--) {
    if (values[i][0] !== '' && values[i][0] !== null) {
      return Number(values[i][0]);
    }
  }
  return 0;
}

/**
 * Builds the dashboard payload from the summary cells on the Form sheet.
 */
function buildDashboardData() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var dashSheet = ss.getSheetByName(DASHBOARD_SHEET);
  if (!dashSheet) throw new Error("Dashboard sheet '" + DASHBOARD_SHEET + "' not found.");

  var cells = [
    DASHBOARD_CASH_CELL,
    DASHBOARD_TOTAL_CELL,
    DASHBOARD_OVER_SHORT_CELL
  ].concat(DASHBOARD_BREAKDOWN.map(function (item) { return item.cell; }));

  var values = dashSheet.getRangeList(cells).getRanges().map(function (range) {
    var value = Number(range.getValue());
    return isNaN(value) ? 0 : value;
  });

  var breakdown = DASHBOARD_BREAKDOWN.map(function (item, index) {
    return { name: item.name, balance: values[index + 3] };
  });

  return {
    cash: values[0],
    total: values[1],
    overShort: values[2],
    breakdown: breakdown,
    lastSynced: new Date().toISOString()
  };
}

/**
 * Returns the category dropdown list from Sum!C3:C, skipping blanks.
 */
function getCategoryList() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CATEGORY_SHEET);
  if (!sheet) return [];

  var range = sheet.getRange(CATEGORY_RANGE);
  var values = range.getValues();

  var categories = [];
  for (var i = 0; i < values.length; i++) {
    var val = values[i][0];
    if (val !== '' && val !== null) {
      categories.push(String(val));
    }
  }
  return categories;
}
