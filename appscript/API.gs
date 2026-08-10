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
 * Builds the full dashboard payload: every wallet balance + the OVER tile.
 */
function buildDashboardData() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  var wallets = WALLET_SHEETS.map(function (name) {
    return { name: name, balance: getWalletBalance(ss, name) };
  });

  var over = null;
  try {
    var dashSheet = ss.getSheetByName(DASHBOARD_SHEET);
    if (dashSheet) {
      over = Number(dashSheet.getRange(OVER_CELL).getValue());
    }
  } catch (err) {
    over = null;
  }

  return {
    wallets: wallets,
    over: over,
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
