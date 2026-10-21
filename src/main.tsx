import { Capacitor } from '@capacitor/core'
import { prepareLaunch, showLaunchError } from './lib/launch'

prepareLaunch()

if (Capacitor.isNativePlatform()) {
  void import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
    return Promise.all([
      StatusBar.setBackgroundColor({ color: '#0f0a1e' }),
      StatusBar.setStyle({ style: Style.Dark }),
    ])
  }).catch(error => {
    console.warn('Unable to configure status bar', error)
  })
}

if (!Capacitor.isNativePlatform()) {
  void import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      onRegisteredSW(_swUrl, registration) {
        if (registration) {
          setInterval(() => { void registration.update().catch(() => {}) }, 60 * 1000)
        }
      },
    })
  }).catch(error => {
    console.warn('Unable to register service worker', error)
  })
}

// Keep the shell/native handoff available while React and the game load.
void Promise.all([
  import('react'),
  import('react-dom/client'),
  import('./App'),
  import('./components/AppReady'),
  import('./store/gamePersistence'),
  import('./index.css'),
]).then(([{ StrictMode, createElement }, { createRoot }, { default: App }, { default: AppReady }, { startGamePersistence }]) => {
  startGamePersistence()

  createRoot(document.getElementById('root')!, {
    onUncaughtError: showLaunchError,
  }).render(
    createElement(StrictMode, null, createElement(App), createElement(AppReady)),
  )
}).catch(showLaunchError)
