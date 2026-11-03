# G300 Mobile Update v001

This package updates the separate G300 wallet app.

## What changed

- Reads the latest balances directly from the six bank ledger tabs.
- Keeps GCASH-E and GCASH-G as separate accounts.
- Shows each bank, the combined bank total, cash, and total wallet balance.
- Adds Cash and all six banks as destinations for new phone entries.
- Uses the spreadsheet's exact tab names when writing records.
- Bumps the service worker cache so updated phone files replace the old copy.

## Files to replace

Copy the files in this package over the matching paths in the G300 source:

- `appscript/Config.gs`
- `appscript/API.gs`
- `js/config.js`
- `js/form.js`
- `js/dashboard.js`
- `service-worker.js`

The spreadsheet tabs were checked and match these exact destinations: CASH, GCASH-E, PNBReg, GoTyme, BDOEqual, BPI, and GCASH-G.

## Publish sequence

1. Update Config.gs and API.gs in the Apps Script project used by G300's API.
2. Save and test the API deployment with the existing endpoint.
3. Replace the four frontend files in the G300 static app source.
4. Publish the frontend through the existing phone app host.
5. Reopen the phone app and confirm all six bank balances and transaction destinations.

This is a source package only. Nothing was committed to GitHub or published to Apps Script, GitHub Pages, or Netlify.
