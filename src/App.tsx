import { Component, type ComponentType, type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import type { Screen } from './store/types'
import { useBackGuard } from './hooks/useBackGuard'
import { useAppLifecyclePrivacy } from './hooks/useAppLifecyclePrivacy'
import ConfirmDialog from './components/ConfirmDialog'
import HomeScreen from './screens/HomeScreen'
import SetupScreen from './screens/SetupScreen'
import DealScreen from './screens/DealScreen'
import RoundScreen from './screens/RoundScreen'
import VoteScreen from './screens/VoteScreen'
import EliminationScreen from './screens/EliminationScreen'
import GuessScreen from './screens/GuessScreen'
import RiccioStrikeScreen from './screens/RiccioStrikeScreen'
import OracoloRevealScreen from './screens/OracoloRevealScreen'
import ResultScreen from './screens/ResultScreen'
import FinalResultScreen from './screens/FinalResultScreen'

const SCREENS: Record<Screen, ComponentType> = {
  home: HomeScreen,
  setup: SetupScreen,
  deal: DealScreen,
  round: RoundScreen,
  vote: VoteScreen,
  elimination: EliminationScreen,
  camaleonte_guess: GuessScreen,
  riccio_strike: RiccioStrikeScreen,
  oracolo_reveal: OracoloRevealScreen,
  result: ResultScreen,
  final_result: FinalResultScreen,
}

const SCREEN_ORDER: Screen[] = [
  'home', 'setup', 'deal', 'round', 'vote', 'elimination', 'camaleonte_guess', 'riccio_strike', 'oracolo_reveal', 'result', 'final_result',
]

const SCALE_SCREENS: Set<Screen> = new Set(['elimination', 'riccio_strike', 'oracolo_reveal', 'result', 'final_result'])

function getScreenEntrance(prev: Screen | null, current: Screen) {
  if (SCALE_SCREENS.has(current)) {
    return { scale: 0.95 }
  }

  if (prev === null) {
    return false
  }

  const prevIdx = SCREEN_ORDER.indexOf(prev)
  const currIdx = SCREEN_ORDER.indexOf(current)

  if ((prev === 'deal' && current === 'round') ||
      ((prev === 'elimination' || prev === 'camaleonte_guess' || prev === 'riccio_strike' || prev === 'oracolo_reveal') && current === 'round')) {
    return false
  }

  const direction = currIdx >= prevIdx ? 1 : -1

  return { x: direction * 30 }
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

const IN_GAME_SCREENS: Set<Screen> = new Set(['deal', 'round', 'vote', 'elimination', 'camaleonte_guess', 'riccio_strike', 'oracolo_reveal'])
const INVALIDATE_SCREENS: Set<Screen> = new Set(['deal', 'round', 'vote', 'elimination', 'camaleonte_guess', 'riccio_strike', 'oracolo_reveal'])

function InGameUtilityControls({
  onRequestQuit,
  onRequestInvalidate,
}: {
  onRequestQuit: () => void
  onRequestInvalidate: () => void
}) {
  const screen = useGameStore(s => s.screen)

  if (!IN_GAME_SCREENS.has(screen)) return null

  const canInvalidate = INVALIDATE_SCREENS.has(screen)

  return (
    <div className="absolute top-2 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2">
      {canInvalidate && (
        <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <button
            onClick={onRequestInvalidate}
            className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-amber-300/10 hover:text-white active:bg-amber-300/15"
            aria-label="Ricomincia manche"
          >
            <svg className="h-4 w-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v6h6" />
            </svg>
            <span>Ricomincia</span>
          </button>
        </div>
      )}
      <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        <button
          onClick={onRequestQuit}
          className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-xs font-semibold text-slate-200 transition-colors hover:bg-rose-300/10 hover:text-white active:bg-rose-300/15"
          aria-label="Esci dalla partita"
        >
          <svg className="h-4 w-4 text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
          </svg>
          <span>Esci</span>
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
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)' }}
      />
      <div
        className="fixed pointer-events-none -bottom-40 -right-40 w-[500px] h-[500px] opacity-100"
        style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)' }}
      />
    </>
  )
}

function AnimatedScreen() {
  const screen = useGameStore(s => s.screen)
  const shouldReduceMotion = useReducedMotion()
  const prevScreen = useRef<Screen | null>(null)
  const ScreenComponent = SCREENS[screen]

  const entrance = getScreenEntrance(prevScreen.current, screen)

  useEffect(() => {
    prevScreen.current = screen
  }, [screen])

  // Replace the old screen immediately; sequential fades expose an empty background.
  return (
    <motion.div
      key={screen}
      initial={shouldReduceMotion ? false : entrance}
      animate={{ x: 0, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
      className={`flex flex-col flex-1 min-h-0 ${IN_GAME_SCREENS.has(screen) ? 'pt-[60px] overflow-y-auto' : ''}`}
    >
      <ScreenComponent />
    </motion.div>
  )
}

export default function App() {
  const [showQuit, setShowQuit] = useState(false)
  const [showInvalidate, setShowInvalidate] = useState(false)
  const requestQuit = useCallback(() => setShowQuit(true), [])
  const requestInvalidate = useCallback(() => setShowInvalidate(true), [])

  useBackGuard(requestQuit)
  useAppLifecyclePrivacy()

  return (
    <div className="h-full bg-slate-950 text-white flex flex-col max-w-md mx-auto overflow-hidden relative">
      <AmbientBlobs />
      <ErrorBoundary>
        <InGameUtilityControls
          onRequestInvalidate={requestInvalidate}
          onRequestQuit={requestQuit}
        />
        <AnimatedScreen />
        <ConfirmDialog
          open={showQuit}
          title="Abbandonare la partita?"
          description="La partita salvata su questo dispositivo verrà cancellata."
          confirmLabel="Abbandona"
          onConfirm={() => { setShowQuit(false); useGameStore.getState().resetGame() }}
          onCancel={() => setShowQuit(false)}
        />
        <ConfirmDialog
          open={showInvalidate}
          title="Ricominciare la manche?"
          description="La manche attuale verrà annullata e ne inizierà una nuova."
          confirmLabel="Ricomincia"
          variant="camaleonte"
          onConfirm={() => { setShowInvalidate(false); useGameStore.getState().invalidateRound() }}
          onCancel={() => setShowInvalidate(false)}
        />
      </ErrorBoundary>
    </div>
  )
}
