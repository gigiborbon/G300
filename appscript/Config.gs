/**
 * ============================================================================
 * CONFIG.gs — All app-specific settings live here.
 * Edit these values, then redeploy the Web App.
 * ============================================================================
 */

// The Spreadsheet ID from your sheet's URL:
// https://docs.google.com/spreadsheets/d/  <-- THIS PART -->  /edit
var SPREADSHEET_ID = '17lE_ECjgm5azEQD7ql1vRvDrbmxfSnfPWiO9JK5d-C0';

// OAuth 2.0 Web Client ID from Google Cloud Console (Credentials page).
// Used to verify Google Sign-In tokens sent from the mobile app.
var GOOGLE_CLIENT_ID = '281773254383-evsga4v740i5tsjh8qm2muaoefosh99i.apps.googleusercontent.com';

// Only these Google accounts are allowed to use the mobile app.
// Add/remove emails as needed.
var AUTHORIZED_EMAILS = [
  'lafay3tte@gmail.com',
  'gigi.borbon@gmail.com'
];

// Wallet tabs the mobile app is allowed to write to.
// Must match actual sheet tab names exactly.
var WALLET_SHEETS = ['CASH', 'GCASH-E', 'PNBReg', 'GoTyme', 'BDOEqual', 'BPI', 'GCASH-G'];

// Where the category dropdown list lives.
var CATEGORY_SHEET = 'Sum';
var CATEGORY_RANGE = 'C3:C';

// Dashboard values shown by the mobile app.
var DASHBOARD_SHEET = 'Form';
var DASHBOARD_OVER_SHORT_CELL = 'H13';

// The dashboard reads these live wallet tabs directly. Keep GCASH-E and GCASH-G separate.
var BANK_ACCOUNTS = [
  { name: 'GCASH', sheet: 'GCASH-E' },
  { name: 'PNBREG', sheet: 'PNBReg' },
  { name: 'GOTYME', sheet: 'GoTyme' },
  { name: 'BDO EQUAL', sheet: 'BDOEqual' },
  { name: 'BPI', sheet: 'BPI' },
  { name: 'GCASH-G', sheet: 'GCASH-G' }
];

// Mobile cash-count editor. Row 11 is the calculated total and is read-only.
var CASH_COUNT_SHEET = 'Form';
var CASH_COUNT_RANGE = 'F2:H11';
var CASH_COUNT_INPUT_RANGE = 'G2:G10';

