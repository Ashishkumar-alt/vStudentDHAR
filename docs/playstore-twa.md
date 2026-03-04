# Publish to Google Play (TWA wrapper)

This project is a Next.js PWA. To list it on the Play Store, deploy the website first, then wrap it as an Android app using a Trusted Web Activity (TWA).

## 0) Prereqs

- A deployed **HTTPS** URL (recommended: Vercel)
- Android Studio installed (includes Android SDK + build tools)
- Java JDK 17+
- Node.js (for Bubblewrap)
- A Google Play Console account

## 1) Deploy the site

- Deploy to Vercel (or any HTTPS host).
- Confirm these load in a browser:
  - `https://YOUR_DOMAIN/`
  - `https://YOUR_DOMAIN/manifest.webmanifest`
  - `https://YOUR_DOMAIN/sw.js` (should exist in production with `next-pwa`)

## 2) Generate the Android wrapper (Bubblewrap)

Install Bubblewrap:

```bash
npm i -g @bubblewrap/cli
```

Initialize an Android project (run this in an empty folder, not inside `pgd`):

```bash
mkdir vstudent-twa
cd vstudent-twa
bubblewrap init --manifest https://YOUR_DOMAIN/manifest.webmanifest
```

Notes:
- Pick your `applicationId` carefully (example: `com.vstudent.app`) — changing it later is painful.
- Bubblewrap will ask you for:
  - App name
  - Launcher icon
  - Signing key (you can create a new keystore)

Build an Android App Bundle (AAB):

```bash
bubblewrap build
```

The output `.aab` is what you upload to Play Console.

## 3) Create `assetlinks.json` (required for TWA)

TWA requires Digital Asset Links so Android can verify your app is allowed to open your domain.

1) Get the SHA-256 fingerprint of the cert Google Play uses.

If you enable **Play App Signing**, use the **App signing certificate** SHA-256 shown in Play Console:
- Play Console → your app → Setup → App integrity → App signing key certificate

2) Create this file in the website repo:

`public/.well-known/assetlinks.json`

Example (replace values):

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.vstudent.app",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:...:FF"
      ]
    }
  }
]
```

3) Redeploy the website, then confirm:

`https://YOUR_DOMAIN/.well-known/assetlinks.json`

## 4) Upload to Play Console

- Create a new app
- Upload the generated `.aab`
- Complete:
  - App details + screenshots
  - Content rating
  - Privacy policy URL
  - Data safety form
  - Target audience (if applicable)
- Roll out to Internal testing first, then Production

## Troubleshooting

- If TWA opens Chrome instead of full-screen: `assetlinks.json` is missing/incorrect, or fingerprint/package name mismatch.
- If Bubblewrap can’t find your service worker/manifest: verify production URLs and that the site is HTTPS.

