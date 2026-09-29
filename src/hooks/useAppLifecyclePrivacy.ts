import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { useGameStore } from '../store/gameStore'
import { flushGamePersistence } from '../store/gamePersistence'

export function useAppLifecyclePrivacy() {
  useEffect(() => {
    let disposed = false
    let removeListener: (() => Promise<void>) | null = null

    void App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        useGameStore.getState().maskSensitiveUi()
        void flushGamePersistence().catch(error => {
          console.error('Unable to flush game snapshot on background', error)
        })
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
