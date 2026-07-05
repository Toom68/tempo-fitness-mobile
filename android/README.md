# Tempo Fitness — Android (TWA)

This directory contains the **Trusted Web Activity (TWA)** wrapper project that packages the Tempo Fitness web app into an Android App Bundle (`.aab`) for the Google Play Store.

## How it works

The TWA wraps your deployed web app (`https://gettempo.netlify.app`) in a full-screen Android WebView. No browser URL bar is shown because the app is "trusted" via `assetlinks.json`.

## Prerequisites

1. **Node.js 18+** (already installed)
2. **Android Studio** (for the SDK / build tools) — download from https://developer.android.com/studio
3. **Google Play Developer account** ($25 one-time fee) — https://play.google.com/console/signup
4. **Bubblewrap CLI** — install globally:
   ```bash
   npm install -g @bubblewrap/cli
   ```

## Setup

### 1. Initialize the Android project

From this `android/` directory:

```bash
bubblewrap init --manifest ./twa-manifest.json
```

This will generate the full Android Gradle project, download the SDK, and create the signing keystore.

### 2. Build the App Bundle

```bash
bubblewrap build
```

This produces an `.aab` file (Android App Bundle) in `app/build/outputs/bundle/release/app-release.aab`.

### 3. Update `assetlinks.json`

After Bubblewrap generates your signing key, get its SHA256 fingerprint:

```bash
keytool -list -v -keystore android.keystore -alias android -storepass android
```

Copy the `SHA256:` fingerprint and update `public/.well-known/assetlinks.json` in the **web project root** with the real fingerprint. Then redeploy the web app to Netlify.

> **Critical:** The SHA256 fingerprint in `assetlinks.json` must match your Android signing key, or the TWA will show a browser URL bar.

### 4. Upload to Google Play

1. Go to the [Google Play Console](https://play.google.com/console)
2. Create a new app → fill in store listing details
3. Navigate to **Release → Production → Create release**
4. Upload the `.aab` file
5. Complete the **Content rating** questionnaire
6. Complete the **Data safety** form (you collect emails via Supabase auth)
7. Add a **Privacy Policy** URL
8. Submit for review

## Updating

When you change the web app, just redeploy to Netlify — the Android app automatically loads the latest version. No need to rebuild the APK unless you change the app icon, name, or signing key.

To change app version/metadata, edit `twa-manifest.json` then:

```bash
bubblewrap update
bubblewrap build
```

## Alternative: PWABuilder

If you don't want to use the CLI, you can also use [PWABuilder](https://www.pwabuilder.com/):

1. Enter `https://gettempo.netlify.app` as the URL
2. Click "Package for Stores" → Android
3. Download the generated `.aab`
4. Upload to Google Play Console

PWABuilder generates the same TWA wrapper but through a web UI instead of the CLI.
