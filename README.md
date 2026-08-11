# G — Mobile Wallet Companion App

A fast, installable mobile app for adding transactions and viewing wallet
balances, backed entirely by your existing Google Sheet. The sheet stays the
only database — this app never duplicates data, it just gives you a faster
way to write to it and read from it on your phone.

## How it's built

- **Backend**: Google Apps Script, bound to your spreadsheet, exposed as a
  Web App JSON API (`doGet` / `doPost`). Does not touch your existing
  `Code.gs` menu, `onEdit`, or the `Form` sheet.
- **Frontend**: plain HTML/CSS/JS, installable as a PWA. Hosted separately
  from Apps Script (see why below).

### Why the frontend is hosted separately from Apps Script

Apps Script Web Apps render inside a sandboxed `googleusercontent.com`
iframe. That sandbox blocks service worker registration, so an Apps
Script-hosted page **cannot** be installed as a real PWA with offline
support. Splitting the app into a static frontend (installable, offline
shell) + an Apps Script JSON API (read/write to the sheet) is the standard
way around this, and is what's built here.

You'll host the frontend for free on GitHub Pages, Firebase Hosting, or
Netlify — any of the three take about five minutes.

---

## Setup — do this in order

### 1. Add the backend files to your spreadsheet's Apps Script project

Open your sheet → Extensions → Apps Script. Your existing `Code.gs` (with
`onOpen`, `onEdit`, the menu, `submitToFirstEmptyRowAF`, etc.) stays exactly
as-is. Add four **new** files from the `appscript/` folder here:

- `Config.gs`
- `Auth.gs`
- `API.gs`
- `WebApp.gs`

Edit `Config.gs`:
- `SPREADSHEET_ID` — already filled in from your sheet's URL.
- `GOOGLE_CLIENT_ID` — you'll get this in step 2, come back and paste it in.
- `AUTHORIZED_EMAILS` — the Google account(s) allowed to use the app.
- `WALLET_SHEETS` — confirm this matches your actual tab names exactly
  (case-sensitive): `Cash, GCash, BDOEqual, PNBReg, BPI, GoTyme, Atome`.
- `DASHBOARD_SHEET` / `OVER_CELL` — confirm which tab and cell actually
  holds your live "OVER" value; adjust if it's not on the `Form` tab.

### 2. Create a Google OAuth Client ID (for Sign-In)

1. Go to [Google Cloud Console](https://console.cloud.google.com/) →
   create or select a project.
2. **APIs & Services → OAuth consent screen** → set up as "External" (or
   "Internal" if you're on Google Workspace), add your email as a test
   user if prompted.
3. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   → Application type: **Web application**.
4. Under **Authorized JavaScript origins**, add the URL you'll host the
   frontend on (e.g. `https://yourname.github.io`). You can add this after
   step 4 once you know the URL, then come back and edit it.
5. Copy the generated **Client ID** — paste it into both:
   - `appscript/Config.gs` → `GOOGLE_CLIENT_ID`
   - `js/config.js` → `APP_CONFIG.GOOGLE_CLIENT_ID`

### 3. Deploy the Apps Script Web App

In the Apps Script editor: **Deploy → New deployment**.
- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone** (auth is handled inside the script via
  `verifyIdToken`, not by Apps Script's own access control)
- Deploy, and copy the **Web App URL** (ends in `/exec`).

Paste that URL into `js/config.js` → `APP_CONFIG.API_BASE_URL`.

Every time you edit the `.gs` files afterward, use **Deploy → Manage
deployments → Edit → New version** to push the update live.

### 4. Host the frontend

Pick one:

**GitHub Pages** (simplest if you already use GitHub)
1. Create a new repo, push everything except the `appscript/` folder
   (that part lives only in Apps Script, not in your web host).
2. Repo Settings → Pages → deploy from the `main` branch, root folder.
3. Your app will be live at `https://yourname.github.io/reponame/`.

**Firebase Hosting**
```
npm install -g firebase-tools
firebase login
firebase init hosting     # choose this project's folder as public dir
firebase deploy
```

Either way, once you have the live URL, go back to Google Cloud Console →
your OAuth Client → add that exact URL under **Authorized JavaScript
origins**, and save.

### 5. Install it on your phone

Open the hosted URL in Chrome (Android) or Safari (iOS) → "Add to Home
Screen" / the install prompt. It'll behave like a native app from there.

---

## Project structure

```
/
├── index.html            # App shell — Add Record, Dashboard, Settings views
├── offline.html           # Shown when there's no connection
├── manifest.json
├── service-worker.js
├── css/
│   ├── styles.css         # Design tokens, shared layout, nav
│   ├── form.css            # Add Record screen
│   └── dashboard.css       # Dashboard screen
├── js/
│   ├── config.js           # API URL + OAuth client ID — EDIT THIS
│   ├── api.js               # fetch() wrapper for the Apps Script API
│   ├── auth.js               # Google Sign-In handling
│   ├── form.js                # Add Record logic
│   ├── dashboard.js            # Dashboard logic
│   └── app.js                   # View routing, theme, SW registration
├── assets/icons/            # App icons (192, 512, maskable)
└── appscript/                # Add these files to your EXISTING Apps Script project
    ├── Config.gs
    ├── Auth.gs
    ├── API.gs
    └── WebApp.gs
```

## What this app does — and deliberately doesn't

**Does:**
- Add a record to any wallet tab in ~5 taps, defaulting to Expense
- Show live per-wallet balances + the OVER variance tile, read-only

**Doesn't (by design, keeps it fast):**
- Edit or delete existing records
- Multi-user collaboration or user management
- Cash-count / denomination entry from mobile — that stays a desktop task
- Complex reporting, charts, or history browsing

## Notes on the balance formula

Every wallet tab keeps its running balance in column **G**:
`G[row] = G[row-1] + F[row] (cash in) − E[row] (cash out)`

The mobile app's `doPost` reproduces this exact logic when appending a new
row, so wallet tabs behave identically whether the entry came from your
desktop menu button or from your phone.
