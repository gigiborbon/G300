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
var WALLET_SHEETS = ['Cash', 'GCash', 'BDOEqual', 'PNBReg', 'BPI', 'GoTyme', 'Atome'];

// Where the category dropdown list lives.
var CATEGORY_SHEET = 'Sum';
var CATEGORY_RANGE = 'C3:C';

// Dashboard sheet + the cell holding the "OVER" variance value.
var DASHBOARD_SHEET = 'Form'; // adjust if OVER lives on a different tab
var OVER_CELL = 'F13';
