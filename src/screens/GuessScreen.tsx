import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

type Phase = 'privacy' | 'input' | 'result'

export default function GuessScreen() {
  const eliminatedThisRound = useGameStore(s => s.eliminatedThisRound)
  const submitMrWhiteGuess = useGameStore(s => s.submitMrWhiteGuess)
  const mrWhiteGuessResult = useGameStore(s => s.mrWhiteGuessResult)
  const winner = useGameStore(s => s.winner)
  const nextRound = useGameStore(s => s.nextRound)

  const [guess, setGuess] = useState('')
  const [phase, setPhase] = useState<Phase>('privacy')
  const [showGuess, setShowGuess] = useState(false)

  const handleSubmit = () => {
    if (guess.trim().length === 0) return
    submitMrWhiteGuess(guess.trim())
    setPhase('result')
  }

  const handleContinue = () => {
    if (gameOver) {
      // winner is already set in store, screen will change via goTo
      useGameStore.getState().goTo('result')
    } else {
      nextRound()
    }
  }

  // Privacy screen — others must not see the input
  if (phase === 'privacy') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">📱</div>
          <p className="text-slate-400 text-sm">Passa il telefono a</p>
          <h2 className="text-3xl font-black text-white text-center">
            {eliminatedThisRound?.name}
          </h2>
          <p className="text-slate-500 text-center text-sm max-w-xs">
            Gli altri giocatori non devono guardare lo schermo!
          </p>
        </div>
        <button
          onClick={() => setPhase('input')}
          className="w-full max-w-xs bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold py-5 rounded-2xl text-lg transition-colors shadow-[0_8px_32px_rgba(245,158,11,0.3)]"
        >
          Sono pronto
        </button>
      </div>
    )
  }

  // Input screen — secret word guess
  if (phase === 'input') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">🎯</div>
          <h2 className="text-2xl font-black text-white text-center">
            Qual è la parola dei civili?
          </h2>
          <p className="text-slate-400 text-center text-sm max-w-xs">
            Scrivi la tua risposta. Nessuno vedrà cosa hai scritto.
          </p>
        </div>
        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className="relative">
            <input
              type={showGuess ? 'text' : 'password'}
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Scrivi la parola..."
              className="w-full glass-input rounded-2xl px-4 py-4 pr-14 text-lg text-center"
              style={{ userSelect: 'text', touchAction: 'auto' }}
              autoFocus
              maxLength={40}
            />
            <button
              type="button"
              onClick={() => setShowGuess(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xl p-1 transition-colors"
              aria-label={showGuess ? 'Nascondi' : 'Mostra'}
            >
              {showGuess ? '🙈' : '👁️'}
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={guess.trim().length === 0}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
              guess.trim().length > 0
                ? 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black shadow-[0_8px_32px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            Rispondo!
          </button>
        </div>
      </div>
    )
  }

  // Result screen — show correct/wrong, then continue
  const isCorrect = mrWhiteGuessResult === 'correct'
  const gameOver = winner !== null

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6">
      {isCorrect ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="text-6xl">🎉</div>
          <div className="glass rounded-2xl px-6 py-4 text-center w-full" style={{ borderColor: 'rgba(52, 211, 153, 0.2)' }}>
            <p className="text-emerald-300 font-bold text-lg">Parola indovinata!</p>
            <p className="text-white text-sm mt-1">{eliminatedThisRound?.name} guadagna 6 punti</p>
          </div>
          {!gameOver && (
            <div className="glass rounded-2xl px-6 py-4 text-center w-full" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
              <p className="text-amber-400 font-semibold">Il gioco continua!</p>
              <p className="text-slate-400 text-sm mt-1">Ci sono ancora impostori tra voi.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="text-6xl">❌</div>
          <div className="glass rounded-2xl px-6 py-4 text-center w-full" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}>
            <p className="text-rose-300 font-bold text-lg">Risposta sbagliata!</p>
          </div>
          {!gameOver && (
            <div className="glass rounded-2xl px-6 py-4 text-center w-full" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
              <p className="text-amber-400 font-semibold">Il gioco continua!</p>
              <p className="text-slate-400 text-sm mt-1">Ci sono ancora impostori tra voi.</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleContinue}
        className="w-full max-w-xs glass-button font-bold py-5 rounded-2xl text-lg"
      >
        Continua →
      </button>
    </div>
  )
}
