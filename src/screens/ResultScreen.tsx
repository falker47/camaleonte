import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import RoleTag from '../components/RoleTag'
import Particles from '../components/Particles'

function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, v => Math.round(v))
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    spring.set(value)
    return display.on('change', v => setDisplayValue(v))
  }, [value, spring, display])

  if (value <= 0) return <span>0</span>
  return <span>+{displayValue}</span>
}

export default function ResultScreen() {
  const players = useGameStore(s => s.players)
  const wordPair = useGameStore(s => s.wordPair)
  const winner = useGameStore(s => s.winner)
  const mrWhiteCorrectIds = useGameStore(s => s.mrWhiteCorrectIds)
  const scores = useGameStore(s => s.scores)
  const roundScores = useGameStore(s => s.roundScores)
  const resetGame = useGameStore(s => s.resetGame)
  const rematch = useGameStore(s => s.rematch)
  const resetScores = useGameStore(s => s.resetScores)

  const [showLegend, setShowLegend] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const mwPoisoned = mrWhiteCorrectIds.length > 0
  const isCiviliansWin = winner === 'civilians' && !mwPoisoned
  const isPoisoned = winner === 'civilians' && mwPoisoned

  // Sub-cases for last_two: who survived?
  const activePlayers = players.filter(p => !p.eliminated)
  const hasMwSurvivor = activePlayers.some(p => p.role === 'mrwhite')
  const hasInfiltratoSurvivor = activePlayers.some(p => p.role === 'infiltrato')

  const isMwSurvived = winner === 'last_two' && hasMwSurvivor && !hasInfiltratoSurvivor
  const isInfiltratoSurvived = winner === 'last_two' && hasInfiltratoSurvivor && !hasMwSurvivor
  const isBothSurvived = winner === 'last_two' && hasMwSurvivor && hasInfiltratoSurvivor

  // Leaderboard sorted by cumulative score
  const leaderboard = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
  const hasScoreHistory = leaderboard.some(([, s]) => s > 0)

  return (
    <div className="relative flex flex-col flex-1 min-h-0 px-5 py-6 gap-4 overflow-y-auto">
      {/* Confetti / Particles */}
      {isCiviliansWin && (
        <Particles
          count={20}
          colors={['#818cf8', '#fbbf24', '#34d399', '#f43f5e', '#22d3ee']}
          style="fall"
          origin="top"
        />
      )}
      {isMwSurvived && (
        <>
          <Particles
            count={15}
            colors={['#ffffff', '#e2e8f0', '#cbd5e1']}
            style="burst"
            origin="center"
          />
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.6 }}
          />
        </>
      )}
      {isInfiltratoSurvived && (
        <Particles
          count={15}
          colors={['#fbbf24', '#f59e0b', '#d97706', '#b45309']}
          style="burst"
          origin="center"
        />
      )}
      {isBothSurvived && (
        <Particles
          count={15}
          colors={['#ef4444', '#f59e0b', '#dc2626', '#d97706']}
          style="burst"
          origin="center"
        />
      )}
      {isPoisoned && (
        <>
          <Particles
            count={15}
            colors={['#ffffff', '#e2e8f0', '#cbd5e1']}
            style="burst"
            origin="center"
          />
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 0.6 }}
          />
        </>
      )}

      {/* Winner banner */}
      {isCiviliansWin && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-indigo-700 to-indigo-900 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl font-black text-white">I Civili vincono!</h2>
          <p className="text-indigo-200 text-sm mt-1">Tutti gli impostori sono stati eliminati.</p>
        </motion.div>
      )}

      {isPoisoned && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-slate-100 to-slate-300 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="text-5xl mb-2">🕵️</div>
          <h2 className="text-2xl font-black text-slate-900">Mr. White vince!</h2>
          <p className="text-slate-600 text-sm mt-1">
            Ha indovinato la parola dei civili.
          </p>
        </motion.div>
      )}

      {isMwSurvived && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-slate-100 to-slate-300 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="text-5xl mb-2">🕵️</div>
          <h2 className="text-2xl font-black text-slate-900">Mr. White vince!</h2>
          <p className="text-slate-600 text-sm mt-1">
            È sopravvissuto fino alla fine.
          </p>
        </motion.div>
      )}

      {isInfiltratoSurvived && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-amber-600 to-amber-800 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="text-5xl mb-2">🎭</div>
          <h2 className="text-2xl font-black text-white">L'infiltrato vince!</h2>
          <p className="text-amber-200 text-sm mt-1">
            È sopravvissuto fino alla fine.
          </p>
        </motion.div>
      )}

      {isBothSurvived && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-rose-700 to-rose-900 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="text-5xl mb-2">😈</div>
          <h2 className="text-2xl font-black text-white">Gli impostori vincono!</h2>
          <p className="text-rose-200 text-sm mt-1">
            Sono sopravvissuti fino alla fine.
          </p>
        </motion.div>
      )}

      {/* Word reveal */}
      {wordPair && (
        <div className="glass rounded-2xl px-5 py-4">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Le parole segrete</p>
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-indigo-400">Civili</p>
              <p className="text-white font-bold">{wordPair.civilian}</p>
            </div>
            <div className="w-px bg-white/8" />
            <div>
              <p className="text-xs text-amber-400">Infiltrati</p>
              <p className="text-white font-bold">{wordPair.undercover}</p>
            </div>
          </div>
        </div>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Player list with round points */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Ruoli e punti partita
        </p>
        <div className="flex flex-col gap-2">
          {players.map((player, i) => {
            const pts = roundScores[player.name] ?? 0
            const isInfiltrateSurvivor = player.role === 'infiltrato' && !player.eliminated
            const isMwCorrect = player.role === 'mrwhite' && mrWhiteCorrectIds.includes(player.id)
            return (
              <motion.div
                key={player.id}
                className={`flex items-center justify-between glass rounded-2xl px-4 py-3 ${player.eliminated ? 'opacity-50' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: player.eliminated ? 0.5 : 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {player.eliminated && <span className="text-slate-500 text-sm">✕</span>}
                  <span className={`font-medium truncate ${player.eliminated ? 'line-through text-slate-500' : 'text-white'}`}>
                    {player.name}
                  </span>
                  {isInfiltrateSurvivor && (isInfiltratoSurvived || isBothSurvived) && (
                    <span className="text-amber-400 text-xs shrink-0">sopravvissuto!</span>
                  )}
                  {player.role === 'mrwhite' && !player.eliminated && isMwSurvived && (
                    <span className="text-white text-xs shrink-0">sopravvissuto!</span>
                  )}
                  {isMwCorrect && (
                    <span className="text-emerald-400 text-xs shrink-0">ha indovinato!</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RoleTag role={player.role} size="sm" />
                  <span className={`text-sm font-bold min-w-[32px] text-right ${
                    pts > 0 ? 'text-emerald-400' : 'text-slate-600'
                  }`}>
                    <AnimatedCounter value={pts} />
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Leaderboard (cumulative) */}
      {hasScoreHistory && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Classifica generale
            </p>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-rose-400 text-xs">Sicuro?</span>
                <button
                  onClick={() => { resetScores(); setConfirmReset(false) }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                >
                  Si
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs text-slate-600 hover:text-rose-400 transition-colors"
              >
                Azzera punteggi
              </button>
            )}
          </div>
          <div className="glass-strong rounded-2xl overflow-hidden">
            {leaderboard.map(([name, total], i) => {
              const isFirst = i === 0 && total > 0
              return (
                <motion.div
                  key={name}
                  layout
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < leaderboard.length - 1 ? 'border-b border-white/8' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-bold text-sm ${
                      isFirst ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                      {isFirst ? '👑' : `${i + 1}`}
                    </span>
                    <span className="text-white font-medium text-sm">{name}</span>
                  </div>
                  <span className={`font-bold text-sm ${
                    isFirst ? 'text-amber-400' : 'text-white'
                  }`}>
                    {total} pt
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Points legend (collapsible) */}
      <div className="glass rounded-xl overflow-hidden">
        <button
          onClick={() => setShowLegend(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-slate-500 text-xs font-semibold"
        >
          <span>ℹ Punteggi</span>
          <motion.span
            animate={{ rotate: showLegend ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▾
          </motion.span>
        </button>
        <AnimatePresence>
          {showLegend && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 flex flex-col gap-1 text-xs">
                <span className="text-indigo-400">Civile: 2 pt (se tutti impostori eliminati e MW non indovina)</span>
                <span className="text-white">Mr. White: 6 pt (se indovina la parola o sopravvive)</span>
                <span className="text-amber-400">Infiltrato: 5 pt (se sopravvive fino alla fine)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3">
        <motion.button
          onClick={rematch}
          className="w-full glass-button font-bold py-5 rounded-2xl text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Continua
        </motion.button>
        <motion.button
          onClick={resetGame}
          className="w-full glass-button-secondary font-semibold py-4 rounded-2xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Fine partita
        </motion.button>
      </div>
    </div>
  )
}
