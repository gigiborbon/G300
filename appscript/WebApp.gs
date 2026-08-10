/**
 * ============================================================================
 * WebApp.gs — Mobile app API endpoints.
 *
 * Add this file, Config.gs, Auth.gs, and API.gs to the SAME Apps Script
 * project as your existing Code.gs (the one with onOpen/onEdit/the menu).
 * Nothing here touches the Form sheet, the menu buttons, or onEdit — this
 * is a separate, independent path used only by the mobile app.
 *
 * It reuses getLastRowInColumn() which already exists in your Code.gs —
 * do not duplicate that function.
 * ============================================================================
 */

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * GET endpoints — read-only.
 *   ?action=ping                      -> health check, no auth
 *   ?action=dashboard&idToken=...     -> wallet balances + OVER
 *   ?action=categories&idToken=...    -> category dropdown list
 */
function doGet(e) {
  var action = e.parameter.action;

  if (action === 'ping') {
    return jsonOut({ ok: true, message: 'Wallet API is live.' });
  }

  var auth = verifyIdToken(e.parameter.idToken);
  if (!auth.ok) {
    return jsonOut({ ok: false, error: auth.error });
  }

  if (action === 'dashboard') {
    try {
      var data = buildDashboardData();
      return jsonOut({ ok: true, data: data });
    } catch (err) {
      return jsonOut({ ok: false, error: 'Could not load dashboard: ' + err.message });
    }
  }

  if (action === 'categories') {
    try {
      var categories = getCategoryList();
      return jsonOut({ ok: true, data: categories });
    } catch (err) {
      return jsonOut({ ok: false, error: 'Could not load categories: ' + err.message });
    }
  }

  return jsonOut({ ok: false, error: 'Unknown action.' });
}

/**
 * POST endpoint — add a new record.
 * Body (JSON, sent as text/plain to avoid CORS preflight):
 * {
 *   idToken, wallet, isIncome, amount, category, particulars, notes, date
 * }
 */
function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut({ ok: false, error: 'Malformed request body.' });
  }

  var auth = verifyIdToken(body.idToken);
  if (!auth.ok) {
    return jsonOut({ ok: false, error: auth.error });
  }

  var wallet = String(body.wallet || '').trim();
  if (WALLET_SHEETS.indexOf(wallet) === -1) {
    return jsonOut({ ok: false, error: 'Unknown wallet: ' + wallet });
  }

  var amount = Number(body.amount);
  if (!amount || amount <= 0 || isNaN(amount)) {
    return jsonOut({ ok: false, error: 'Amount must be a positive number.' });
  }

  var isIncome = !!body.isIncome;
  var cashOut = isIncome ? 0 : amount;
  var cashIn = isIncome ? amount : 0;

  var dateVal = body.date ? new Date(body.date) : new Date();
  var category = String(body.category || '').trim();
  var particulars = String(body.particulars || '').trim();
  var notes = String(body.notes || '').trim();

  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var targetSheet = ss.getSheetByName(wallet);
    if (!targetSheet) {
      return jsonOut({ ok: false, error: "Target sheet '" + wallet + "' not found." });
    }

    var maxLastRow = 0;
    for (var col = 1; col <= 6; col++) {
      var lastRowInCol = getLastRowInColumn(targetSheet, col); // reused from Code.gs
      if (lastRowInCol > maxLastRow) maxLastRow = lastRowInCol;
    }
    var nextRow = maxLastRow + 1;

    var rowData = [dateVal, category, particulars, notes, cashOut, cashIn];
    targetSheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);

    var balanceCell = targetSheet.getRange(nextRow, 7); // column G
    balanceCell.setFormula('=G' + (nextRow - 1) + ' + F' + nextRow + ' - E' + nextRow);
    SpreadsheetApp.flush();

    var newBalance = balanceCell.getValue();

    return jsonOut({
      ok: true,
      message: 'Saved to ' + wallet + '.',
      row: nextRow,
      newBalance: newBalance
    });
  } catch (err) {
    return jsonOut({ ok: false, error: 'Could not save record: ' + err.message });
  }
}
