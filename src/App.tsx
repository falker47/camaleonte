import { Component, type ComponentType, type ReactNode, useState } from 'react'
import { useGameStore } from './store/gameStore'
import type { Screen } from './store/types'
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
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-xl"
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

function QuitButton() {
  const screen = useGameStore(s => s.screen)
  const resetGame = useGameStore(s => s.resetGame)
  const [confirm, setConfirm] = useState(false)

  if (!IN_GAME_SCREENS.has(screen)) return null

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
        aria-label="Esci"
      >
        ✕
      </button>

      {confirm && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
          <div className="bg-slate-800 rounded-3xl px-6 py-6 w-full max-w-xs flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg text-center">Uscire dalla partita?</h3>
            <p className="text-slate-400 text-sm text-center">I progressi della partita andranno persi.</p>
            <button
              onClick={() => { setConfirm(false); resetGame() }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl transition-colors"
            >
              Esci
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="w-full border-2 border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white font-semibold py-3 rounded-2xl transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function App() {
  const screen = useGameStore(s => s.screen)
  const Screen = SCREENS[screen]
  return (
    <div className="h-full bg-slate-950 text-white flex flex-col max-w-md mx-auto overflow-hidden relative">
      <ErrorBoundary>
        <QuitButton />
        <Screen />
      </ErrorBoundary>
    </div>
  )
}
