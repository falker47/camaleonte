import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getSurvivalThreshold } from '../utils/winCondition'
import RoleTag from '../components/RoleTag'
import Particles from '../components/Particles'
import { useAnimatedValue } from '../hooks/useAnimatedValue'
import { springTap } from '../constants/animations'

function AnimatedCounter({ value }: { value: number }) {
  const displayValue = useAnimatedValue(value, 0)
  if (value <= 0) return <span>0</span>
  return <span>+{displayValue}</span>
}

function AnimatedScore({ value }: { value: number }) {
  const displayValue = useAnimatedValue(value)
  return <span>{displayValue} pt</span>
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

  const config = useGameStore(s => s.config)
  const hasMw = config.mrWhiteCount > 0
  const hasInf = config.infiltratoCount > 0

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
  const hasScoreHistory = leaderboard.length > 0

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
      {hasMw && isMwSurvived && (
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
      {hasInf && isInfiltratoSurvived && (
        <Particles
          count={15}
          colors={['#fbbf24', '#f59e0b', '#d97706', '#b45309']}
          style="burst"
          origin="center"
        />
      )}
      {hasMw && hasInf && isBothSurvived && (
        <Particles
          count={15}
          colors={['#ef4444', '#f59e0b', '#dc2626', '#d97706']}
          style="burst"
          origin="center"
        />
      )}
      {hasMw && isPoisoned && (
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

      {hasMw && isPoisoned && (
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

      {hasMw && isMwSurvived && (
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

      {hasInf && isInfiltratoSurvived && (
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

      {hasMw && hasInf && isBothSurvived && (
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
            {hasInf && (
              <>
                <div className="w-px bg-white/8" />
                <div>
                  <p className="text-xs text-amber-400">Infiltrati</p>
                  <p className="text-white font-bold">{wordPair.undercover}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Player list grouped by role, sorted by group round points */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Ruoli e punti partita
        </p>
        <div className="flex flex-col gap-3">
          {(() => {
            const roles = [...new Set(players.map(p => p.role))]
            const groupPoints = (role: typeof roles[number]) =>
              players.filter(p => p.role === role).reduce((sum, p) => sum + (roundScores[p.name] ?? 0), 0)
            const sorted = roles.sort((a, b) => groupPoints(b) - groupPoints(a))
            let chipIndex = 0

            return sorted.map((role, gi) => {
              const group = players.filter(p => p.role === role)
              return (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.08 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <RoleTag role={role} size="sm" />
                    <div className="flex-1 h-px bg-white/8" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.map(player => {
                      const pts = roundScores[player.name] ?? 0
                      const isInfiltrateSurvivor = player.role === 'infiltrato' && !player.eliminated
                      const isMwCorrect = player.role === 'mrwhite' && mrWhiteCorrectIds.includes(player.id)
                      const idx = chipIndex++
                      return (
                        <motion.div
                          key={player.id}
                          className={`flex items-center gap-2 glass rounded-xl px-3 py-2 ${player.eliminated ? 'opacity-50' : ''}`}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: player.eliminated ? 0.5 : 1, x: 0 }}
                          transition={{ delay: gi * 0.08 + idx * 0.03 }}
                        >
                          {player.eliminated && <span className="text-slate-500 text-xs">✕</span>}
                          {player.specialRole === 'buffone' && <span className="text-red-400 text-xs">🃏</span>}
                          {player.specialRole === 'mimo' && <span className="text-slate-300 text-xs">🤫</span>}
                          <span className={`font-medium text-sm ${player.eliminated ? 'line-through text-slate-500' : 'text-white'}`}>
                            {player.name}
                          </span>
                          {isInfiltrateSurvivor && (isInfiltratoSurvived || isBothSurvived) && (
                            <span className="text-amber-400 text-[10px] shrink-0">sopravvissuto!</span>
                          )}
                          {player.role === 'mrwhite' && !player.eliminated && isMwSurvived && (
                            <span className="text-white text-[10px] shrink-0">sopravvissuto!</span>
                          )}
                          {player.role === 'infiltrato' && player.eliminated && pts > 0 && (
                            <span className="text-amber-400/70 text-[10px] shrink-0">parziale</span>
                          )}
                          {isMwCorrect && (
                            <span className="text-emerald-400 text-[10px] shrink-0">ha indovinato!</span>
                          )}
                          {player.specialRole === 'buffone' && player.eliminatedInTurno === 1 && (
                            <span className="text-red-400 text-[10px] shrink-0">bonus buffone!</span>
                          )}
                          <span className={`text-xs font-bold ${pts > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                            <AnimatedCounter value={pts} />
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })
          })()}
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
                  className="px-4 text-sm bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-semibold rounded-lg transition-colors"
                >
                  Si
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-4 text-sm bg-white/5 text-slate-400 hover:bg-white/10 rounded-lg transition-colors"
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
                    <AnimatedScore value={total} />
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Points legend (collapsible) */}
      <div className="shrink-0 rounded-xl overflow-hidden bg-white/[0.07] border border-white/10 border-l-2 border-l-indigo-500">
        <button
          onClick={() => setShowLegend(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-slate-200 text-sm font-semibold"
        >
          <span>ℹ Come funzionano i punteggi?</span>
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
              <div className="px-4 pb-3 flex flex-col gap-2.5 text-xs">
                <div className="text-slate-400">
                  🎯 Soglia sopravvivenza: <span className="text-white font-semibold">ultimi {getSurvivalThreshold(players.length)}</span>
                </div>
                <div>
                  <div className="text-indigo-400 font-semibold">Civile — 2{'\u00A0'}pt</div>
                  <div className="text-slate-500 mt-0.5">
                    {hasMw
                      ? 'Se tutti gli impostori vengono eliminati (e Mr.\u00A0White non indovina)'
                      : 'Se tutti gli impostori vengono eliminati'}
                  </div>
                </div>
                {hasMw && (
                  <div>
                    <div className="text-white font-semibold">Mr.{'\u00A0'}White — {players.length <= 4 ? '4' : '3'}{'\u00A0'}pt indovina / {players.length <= 3 ? '3' : players.length <= 4 ? '4' : '5'}{'\u00A0'}pt sopravvive</div>
                    <div className="text-slate-500 mt-0.5">Se eliminato, può tentare di indovinare la parola dei civili</div>
                  </div>
                )}
                {hasInf && (
                  <div>
                    <div className="text-amber-400 font-semibold">Infiltrato — {players.length <= 4 ? '3' : '5'}{'\u00A0'}pt sopravvive</div>
                    <div className="text-slate-500 mt-0.5">Se eliminato: +1{'\u00A0'}pt per ogni civile eliminato (max 3{'\u00A0'}pt)</div>
                  </div>
                )}
                {players.some(p => p.specialRole === 'buffone') && (
                  <div>
                    <div className="text-red-400 font-semibold">Il Buffone — +2{'\u00A0'}pt bonus</div>
                    <div className="text-slate-500 mt-0.5">Se eliminato al primo turno di votazione</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3">
        <motion.button
          onClick={rematch}
          className="w-full glass-button font-bold py-5 rounded-2xl text-lg"
          {...springTap}
        >
          Continua
        </motion.button>
        <motion.button
          onClick={resetGame}
          className="w-full glass-button-secondary font-semibold py-4 rounded-2xl"
          {...springTap}
        >
          Fine partita
        </motion.button>
      </div>
    </div>
  )
}
