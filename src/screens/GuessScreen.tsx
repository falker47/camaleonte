import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { springTap } from '../constants/animations'
import { getCamaleonteGuessPoints } from '../constants/gameConfig'
import { createInitialGuessSession } from '../store/gameSnapshot'
import { getSessionResultScreen } from '../utils/gameDuration'

export default function GuessScreen() {
  const eliminatedThisTurno = useGameStore(s => s.eliminatedThisTurno)
  const linkedEliminatedThisTurno = useGameStore(s => s.linkedEliminatedThisTurno)
  const players = useGameStore(s => s.players)
  const submitCamaleonteGuess = useGameStore(s => s.submitCamaleonteGuess)
  const camaleonteGuessResult = useGameStore(s => s.camaleonteGuessResult)
  const winner = useGameStore(s => s.winner)
  const nextTurno = useGameStore(s => s.nextTurno)
  const guessSession = useGameStore(s => s.guessSession)
  const setGuessSession = useGameStore(s => s.setGuessSession)

  const camaleonteGuessPoints = getCamaleonteGuessPoints(players.length)
  const { phase, draft: guess, timeLeft, privacyLocked } = guessSession

  const gameOver = winner !== null

  // Countdown is part of the resumable game state. It pauses while privacy-locked.
  useEffect(() => {
    if (phase !== 'input' || privacyLocked || timeLeft <= 0) return

    const id = setInterval(() => {
      setGuessSession(session => {
        if (session.phase !== 'input' || session.privacyLocked) return session
        return { ...session, timeLeft: Math.max(0, session.timeLeft - 1) }
      })
    }, 1000)

    return () => clearInterval(id)
  }, [phase, privacyLocked, timeLeft, setGuessSession])

  // Auto-submit exactly once when the persisted timer reaches zero.
  useEffect(() => {
    if (phase === 'input' && !privacyLocked && timeLeft === 0) {
      submitCamaleonteGuess('')
      setGuessSession({ phase: 'result', privacyLocked: false })
    }
  }, [phase, privacyLocked, timeLeft, submitCamaleonteGuess, setGuessSession])

  const handleSubmit = () => {
    if (guess.trim().length === 0) return
    submitCamaleonteGuess(guess.trim())
    setGuessSession({ phase: 'result', privacyLocked: false })
  }

  const handleContinue = () => {
    const store = useGameStore.getState()
    // If linked partner is a camaleonte that hasn't guessed yet, give them a turn
    if (linkedEliminatedThisTurno?.role === 'camaleonte' && linkedEliminatedThisTurno.id !== eliminatedThisTurno?.id) {
      store.goTo('camaleonte_guess')
      useGameStore.setState({
        eliminatedThisTurno: linkedEliminatedThisTurno,
        linkedEliminatedThisTurno: null,
        camaleonteGuessResult: null,
        guessSession: createInitialGuessSession(),
      })
      return
    }
    // If Riccio strike is pending, go to strike screen (even if last_two triggered — Riccio can invalidate it)
    if (store.riccioStrikeActive) {
      store.goTo('riccio_strike')
      return
    }
    // If Oracolo reveal is pending, go to reveal screen
    if (store.oracoloRevealActive && !gameOver) {
      store.goTo('oracolo_reveal')
      return
    }
    if (gameOver) {
      store.goTo(getSessionResultScreen(store.manche, store.players.length, store.config.duration))
    } else {
      nextTurno()
    }
  }

  // Privacy screen — also shown again after background/restore while input was private.
  if (phase === 'privacy' || (phase === 'input' && privacyLocked)) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">📱</div>
          <p className="text-slate-400 text-sm">Passa il telefono a</p>
          <h2 className="text-3xl font-black text-white text-center">
            {eliminatedThisTurno?.name}
          </h2>
          <p className="text-slate-500 text-center text-sm max-w-xs">
            Gli altri giocatori non devono guardare lo schermo!
          </p>
          <p className="text-teal-400 text-sm font-semibold mt-1">
            {phase === 'privacy'
              ? 'Avrai 60 secondi per indovinare la parola!'
              : `Tentativo in pausa — restano ${timeLeft} secondi.`}
          </p>
        </div>
        <motion.button
          onClick={() => setGuessSession({ phase: 'input', privacyLocked: false })}
          className="w-full max-w-xs bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-black font-bold py-5 rounded-2xl text-lg transition-colors shadow-[0_8px_32px_rgba(20,184,166,0.3)]"
          {...springTap}
        >
          {phase === 'privacy' ? 'Sono pronto' : 'Riprendi tentativo'}
        </motion.button>
      </div>
    )
  }

  // Input screen — secret word guess
  if (phase === 'input') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6">
        <div className={`glass rounded-2xl px-6 py-3 text-center transition-colors ${timeLeft <= 10 ? 'border-rose-500/30' : 'border-amber-500/20'}`}
          style={{ borderWidth: 1 }}
        >
          <span className={`text-4xl font-black tabular-nums ${timeLeft <= 10 ? 'text-rose-400' : 'text-amber-400'}`}>
            {timeLeft}
          </span>
          <p className="text-slate-500 text-xs">secondi</p>
        </div>
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
          <input
            type="text"
            value={guess}
            onChange={e => setGuessSession({ draft: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Scrivi la parola..."
            className="w-full glass-input rounded-2xl px-4 py-4 text-lg text-center"
            style={{ userSelect: 'text', touchAction: 'auto' }}
            autoFocus
            maxLength={40}
          />
          <motion.button
            onClick={handleSubmit}
            disabled={guess.trim().length === 0}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
              guess.trim().length > 0
                ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-black shadow-[0_8px_32px_rgba(20,184,166,0.3)]'
                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
            whileHover={guess.trim().length > 0 ? springTap.whileHover : {}}
            whileTap={guess.trim().length > 0 ? springTap.whileTap : {}}
            transition={springTap.transition}
          >
            Rispondo!
          </motion.button>
        </div>
      </div>
    )
  }

  // Result screen — show correct/wrong, then continue
  const isCorrect = camaleonteGuessResult === 'correct'

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6">
      {isCorrect ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="text-6xl">🎉</div>
          <div className="glass rounded-2xl px-6 py-4 text-center w-full" style={{ borderColor: 'rgba(52, 211, 153, 0.2)' }}>
            <p className="text-emerald-300 font-bold text-lg">Parola indovinata!</p>
            <p className="text-white text-sm mt-1">{eliminatedThisTurno?.name} guadagna {camaleonteGuessPoints} punti</p>
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

      <motion.button
        onClick={handleContinue}
        className="w-full max-w-xs glass-button font-bold py-5 rounded-2xl text-lg"
        {...springTap}
      >
        Continua →
      </motion.button>
    </div>
  )
}
