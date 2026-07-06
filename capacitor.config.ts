import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.netlify.gettempo_mobile.twa',
  appName: 'Tempo Fitness',
  webDir: 'out', // only used for fully-static builds; remote-URL mode is used in native builds
  server: {
    // Point the native WebView at the live Netlify deployment.
    // This keeps SSR, auth cookies, and Supabase working identically to the browser.
    url: 'https://gettempo-mobile.netlify.app',
    cleartext: false,
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0a',
      overlaysWebView: false,
    },
  },
  android: {
    buildOptions: {
      keystorePath: 'android/android.keystore',
      keystoreAlias: 'android',
    },
  },
};

export default config;
