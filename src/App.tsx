import { Component, type ComponentType, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import type { Screen } from './store/types'
import { useBackGuard } from './hooks/useBackGuard'
import HomeScreen from './screens/HomeScreen'
import SetupScreen from './screens/SetupScreen'
import DealScreen from './screens/DealScreen'
import RoundScreen from './screens/RoundScreen'
import VoteScreen from './screens/VoteScreen'
import EliminationScreen from './screens/EliminationScreen'
import GuessScreen from './screens/GuessScreen'
import ResultScreen from './screens/ResultScreen'

const SCREENS: Record<Screen, ComponentType> = {
  home: HomeScreen,
  setup: SetupScreen,
  deal: DealScreen,
  round: RoundScreen,
  vote: VoteScreen,
  elimination: EliminationScreen,
  mrwhite_guess: GuessScreen,
  result: ResultScreen,
}

const SCREEN_ORDER: Screen[] = [
  'home', 'setup', 'deal', 'round', 'vote', 'elimination', 'mrwhite_guess', 'result',
]

const FADE_SCALE_SCREENS: Set<Screen> = new Set(['elimination', 'result'])

function getTransitionVariants(prev: Screen | null, current: Screen) {
  if (FADE_SCALE_SCREENS.has(current)) {
    return {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    }
  }

  if (prev === null) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    }
  }

  const prevIdx = SCREEN_ORDER.indexOf(prev)
  const currIdx = SCREEN_ORDER.indexOf(current)

  if ((prev === 'deal' && current === 'round') ||
      ((prev === 'elimination' || prev === 'mrwhite_guess') && current === 'round')) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    }
  }

  const direction = currIdx >= prevIdx ? 1 : -1

  return {
    initial: { x: direction * 30, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: direction * -30, opacity: 0 },
  }
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 text-rose-400">
          <h2 className="text-xl font-bold mb-2">Errore</h2>
          <pre className="text-sm whitespace-pre-wrap">{this.state.error}</pre>
          <button
            onClick={() => {
              this.setState({ error: null })
              useGameStore.getState().resetGame()
            }}
            className="mt-4 glass-button px-4 py-2 rounded-xl"
          >
            Torna alla Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const IN_GAME_SCREENS: Set<Screen> = new Set(['deal', 'round', 'vote', 'elimination', 'mrwhite_guess'])

function QuitButton({ onRequestQuit }: { onRequestQuit: () => void }) {
  const screen = useGameStore(s => s.screen)

  if (!IN_GAME_SCREENS.has(screen)) return null

  return (
    <button
      onClick={onRequestQuit}
      className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full glass text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
      aria-label="Esci"
    >
      ✕
    </button>
  )
}

function QuitDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const resetGame = useGameStore(s => s.resetGame)

  if (!open) return null

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
      <div className="glass-strong rounded-3xl px-6 py-6 w-full max-w-xs flex flex-col gap-4">
        <h3 className="text-white font-bold text-lg text-center">Uscire dalla partita?</h3>
        <p className="text-slate-400 text-sm text-center">I progressi della partita andranno persi.</p>
        <button
          onClick={() => { onClose(); resetGame() }}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl transition-colors"
        >
          Esci
        </button>
        <button
          onClick={onClose}
          className="w-full glass-button-secondary py-3 rounded-2xl transition-colors"
        >
          Annulla
        </button>
      </div>
    </div>
  )
}

function AmbientBlobs() {
  return (
    <>
      <div
        className="fixed pointer-events-none -top-40 -left-40 w-[500px] h-[500px] opacity-100"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
      />
      <div
        className="fixed pointer-events-none -bottom-40 -right-40 w-[500px] h-[500px] opacity-100"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
      />
    </>
  )
}

function AnimatedScreen() {
  const screen = useGameStore(s => s.screen)
  const prevScreen = useRef<Screen | null>(null)
  const ScreenComponent = SCREENS[screen]

  const prevForVariants = prevScreen.current
  const variants = getTransitionVariants(prevForVariants, screen)

  useEffect(() => {
    prevScreen.current = screen
  }, [screen])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col flex-1 min-h-0"
      >
        <ScreenComponent />
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const [showQuit, setShowQuit] = useState(false)
  const requestQuit = useCallback(() => setShowQuit(true), [])

  useBackGuard(requestQuit)

  return (
    <div className="h-full bg-slate-950 text-white flex flex-col max-w-md mx-auto overflow-hidden relative">
      <AmbientBlobs />
      <ErrorBoundary>
        <QuitButton onRequestQuit={requestQuit} />
        <AnimatedScreen />
        <QuitDialog open={showQuit} onClose={() => setShowQuit(false)} />
      </ErrorBoundary>
    </div>
  )
}
