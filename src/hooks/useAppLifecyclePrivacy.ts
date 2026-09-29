import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { useGameStore } from '../store/gameStore'

export function useAppLifecyclePrivacy() {
  useEffect(() => {
    let disposed = false
    let removeListener: (() => Promise<void>) | null = null

    void App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        useGameStore.getState().maskSensitiveUi()
      }
    }).then(handle => {
      if (disposed) {
        void handle.remove()
      } else {
        removeListener = () => handle.remove()
      }
    })

    return () => {
      disposed = true
      if (removeListener) void removeListener()
    }
  }, [])
}
