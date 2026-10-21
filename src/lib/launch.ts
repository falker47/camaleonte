import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'

// A ceiling for unavailable artwork, never a minimum display duration.
const IMAGE_SETTLE_TIMEOUT_MS = 1800

let artworkReady: Promise<void> | null = null
let appCommitted = false
let nativeHideRequested = false

function settleImage(image: HTMLImageElement): Promise<void> {
  return new Promise(resolve => {
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      image.removeEventListener('load', onLoad)
      image.removeEventListener('error', onError)
      resolve()
    }
    const onError = () => {
      image.hidden = true
      if (image.classList.contains('launch-brand')) {
        document.getElementById('app-launch')?.setAttribute('data-artwork-unavailable', '')
      }
      finish()
    }
    const onLoad = () => {
      // decode() can reject even after load; neither rejection nor a hung
      // decode may prevent the app from being revealed.
      if (typeof image.decode === 'function') {
        void image.decode().catch(() => {}).then(finish)
      } else {
        finish()
      }
    }
    const timeout = window.setTimeout(finish, IMAGE_SETTLE_TIMEOUT_MS)

    if (image.complete) {
      if (image.naturalWidth > 0) onLoad()
      else onError()
    } else {
      image.addEventListener('load', onLoad, { once: true })
      image.addEventListener('error', onError, { once: true })
    }
  })
}

function hideNativeSplash(): void {
  if (nativeHideRequested || !Capacitor.isNativePlatform()) return
  nativeHideRequested = true

  // Do not await the bridge, or a requestAnimationFrame before calling it:
  // Android's starting window may be holding the WebView's first draw.
  void SplashScreen.hide().catch(error => {
    nativeHideRequested = false
    console.warn('Unable to hide native splash; using its automatic fallback', error)
  })
}

export function prepareLaunch(): Promise<void> {
  if (artworkReady) return artworkReady

  const images = Array.from(document.querySelectorAll<HTMLImageElement>('#app-launch img'))
  artworkReady = Promise.all(images.map(settleImage)).then(() => {})
  void artworkReady.then(hideNativeSplash)
  return artworkReady
}

/** Called only after React has committed its first usable screen. */
export function markAppReady(): void {
  if (appCommitted) return
  appCommitted = true

  void prepareLaunch().then(() => {
    // The same image URLs are shared with the menu, so its artwork is already
    // decoded. A missing image still settles and cannot trap users here.
    const root = document.getElementById('root')
    root?.removeAttribute('inert')
    root?.removeAttribute('aria-busy')
    document.getElementById('app-launch')?.remove()
    window.dispatchEvent(new Event('camaleonte:ready'))
    hideNativeSplash()
  })
}

export function showLaunchError(error: unknown): void {
  console.error('Unable to start Camaleonte', error)
  window.dispatchEvent(new Event('camaleonte:launch-error'))
  hideNativeSplash()
}
