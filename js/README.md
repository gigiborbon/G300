# G login fix v001

Upload the two files in this package to the matching locations in the `G300` GitHub repository:

- `js/auth.js`
- `service-worker.js`

Also add this exact OAuth redirect URI in Google Cloud Console:

`https://gigiborbon.github.io/G300/`

Open **Google Cloud Console > APIs & Services > Credentials**, edit the OAuth web client, and add the URL under **Authorized redirect URIs**. Keep `https://gigiborbon.github.io` under **Authorized JavaScript origins**.

After GitHub Pages finishes publishing, open:

`https://gigiborbon.github.io/G300/?v=v001`
