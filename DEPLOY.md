# Deployment checklist

## 1. Update Google Apps Script

Copy these four files into the spreadsheet's Apps Script project, replacing the corresponding files there:

- `appscript/Config.gs`
- `appscript/Auth.gs`
- `appscript/API.gs`
- `appscript/WebApp.gs`

Then select **Deploy > Manage deployments > Edit**, choose **New version**, and deploy it. Keep the existing `/exec` URL.

The deployment must execute as **Me** and allow access to **Anyone**.

## 2. Publish the frontend

Publish the contents of this folder to the repository served at:

`https://gigiborbon.github.io/wallet-app/`

Do not publish any OAuth client secret. The frontend only contains the public OAuth client ID.

## 3. Google OAuth configuration

Keep `https://gigiborbon.github.io` in the OAuth client's Authorized JavaScript origins.

## 4. Clear the old app cache

After publishing, reload the site. If an installed copy still shows the old UI, close it fully and reopen it. The service-worker cache version has been increased so the corrected assets replace the old ones.
