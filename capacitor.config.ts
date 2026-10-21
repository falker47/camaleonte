/// <reference types="@capacitor/splash-screen" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.falker.camaleonte',
  appName: 'Camaleonte',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      // hide() yields to the HTML launch shell as soon as its artwork is ready.
      // This short ceiling still releases the native window if JS/plugin fails.
      launchAutoHide: true,
      launchShowDuration: 500,
      launchFadeOutDuration: 0,
      backgroundColor: '#0f0a1e',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f0a1e',
    },
  },
};

export default config;
