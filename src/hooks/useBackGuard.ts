import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import type { Screen } from '../store/types'

/** Screens where back navigates to a previous in-game screen */
const BACK_NAV: Partial<Record<Screen, Screen>> = {
  setup: 'home',
  deal: 'setup',
  vote: 'round',
}

/**
 * Pushes history entries on screen changes and intercepts the browser/Android
 * back button. Navigates back in-game where logical, otherwise requests a
 * quit-confirmation dialog via the returned callback.
 */
export function useBackGuard(onRequestQuit: () => void) {
  const screen = useGameStore(s => s.screen)
  const goTo = useGameStore(s => s.goTo)
  const screenRef = useRef(screen)

  // Keep ref in sync so the popstate handler always sees latest screen
  useEffect(() => {
    screenRef.current = screen
  }, [screen])

  // Push a history entry every time the screen changes (except home)
  useEffect(() => {
    if (screen !== 'home') {
      history.pushState({ screen }, '')
    }
  }, [screen])

  // Single popstate listener for the lifetime of the app
  useEffect(() => {
    function handlePopState() {
      const current = screenRef.current

      if (current === 'home') {
        // Let the browser navigate away normally
        return
      }

      // Re-push so the history stack stays "blocked"
      history.pushState({ screen: current }, '')

      const backTarget = BACK_NAV[current]
      if (backTarget) {
        goTo(backTarget)
      } else {
        // Screens without logical back → show quit confirmation
        onRequestQuit()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [goTo, onRequestQuit])

  // beforeunload warning when a game is in progress
  useEffect(() => {
    if (screen === 'home') return

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [screen])
}
