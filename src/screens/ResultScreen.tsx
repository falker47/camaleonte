import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getSurvivalThreshold } from '../utils/winCondition'
import RoleTag from '../components/RoleTag'
import Particles from '../components/Particles'
import { useAnimatedValue } from '../hooks/useAnimatedValue'
import { springTap } from '../constants/animations'
import talpaPng from '../assets/talpa.png'
import camaleontePng from '../assets/camaleonte.png'

function AnimatedCounter({ value }: { value: number }) {
  const displayValue = useAnimatedValue(value, 0)
  if (value === 0) return <span>0</span>
  if (value < 0) return <span>{displayValue}</span>
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
  const camaleonteCorrectIds = useGameStore(s => s.camaleonteCorrectIds)
  const scores = useGameStore(s => s.scores)
  const roundScores = useGameStore(s => s.roundScores)
  const resetGame = useGameStore(s => s.resetGame)
  const rematch = useGameStore(s => s.rematch)
  const resetScores = useGameStore(s => s.resetScores)

  const config = useGameStore(s => s.config)
  const hasCamaleonte = config.camaleonteCount > 0
  const hasTalpa = config.talpaCount > 0

  const [showLegend, setShowLegend] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const camaleontePoisoned = camaleonteCorrectIds.length > 0
  const isCiviliansWin = winner === 'civilians' && !camaleontePoisoned
  const isPoisoned = winner === 'civilians' && camaleontePoisoned

  // Sub-cases for last_two: who survived?
  const activePlayers = players.filter(p => !p.eliminated)
  const hasCamaleonteSurvivor = activePlayers.some(p => p.role === 'camaleonte')
  const hasTalpaSurvivor = activePlayers.some(p => p.role === 'talpa')

  const isCamaleonteSurvived = winner === 'last_two' && hasCamaleonteSurvivor && !hasTalpaSurvivor
  const isTalpaSurvived = winner === 'last_two' && hasTalpaSurvivor && !hasCamaleonteSurvivor
  const isBothSurvived = winner === 'last_two' && hasCamaleonteSurvivor && hasTalpaSurvivor

  // Leaderboard sorted by cumulative score
  const leaderboard = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
  const hasScoreHistory = leaderboard.length > 0

  // Duellanti: compute duel result for display
  const duelists = players.filter(p => p.specialRole === 'duellante')
  const duelResult = (playerId: string): 'won' | 'lost' | 'draw' | null => {
    if (duelists.length !== 2) return null
    const me = duelists.find(p => p.id === playerId)
    const opponent = duelists.find(p => p.id !== playerId)
    if (!me || !opponent) return null
    if (!me.eliminated && !opponent.eliminated) return null
    if (me.eliminated && opponent.eliminated) {
      if (me.eliminatedInTurno === opponent.eliminatedInTurno) return 'draw'
      return me.eliminatedInTurno! < opponent.eliminatedInTurno! ? 'lost' : 'won'
    }
    return me.eliminated ? 'lost' : 'won'
  }

  return (
    <div className="relative flex flex-col flex-1 min-h-0 px-5 py-6 gap-4 overflow-y-auto">
      {/* Confetti / Particles */}
      {isCiviliansWin && (
        <Particles
          count={20}
          colors={['#2dd4bf', '#fbbf24', '#34d399', '#f43f5e', '#22d3ee']}
          style="fall"
          origin="top"
        />
      )}
      {hasCamaleonte && isCamaleonteSurvived && (
        <>
          <Particles
            count={15}
            colors={['#2dd4bf', '#14b8a6', '#0d9488']}
            style="burst"
            origin="center"
          />
          <motion.div
            className="absolute inset-0 bg-teal-400 pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.6 }}
          />
        </>
      )}
      {hasTalpa && isTalpaSurvived && (
        <Particles
          count={15}
          colors={['#ea580c', '#c2410c', '#9a3412', '#7c2d12']}
          style="burst"
          origin="center"
        />
      )}
      {hasCamaleonte && hasTalpa && isBothSurvived && (
        <Particles
          count={15}
          colors={['#ef4444', '#f59e0b', '#dc2626', '#d97706']}
          style="burst"
          origin="center"
        />
      )}
      {hasCamaleonte && isPoisoned && (
        <>
          <Particles
            count={15}
            colors={['#2dd4bf', '#14b8a6', '#0d9488']}
            style="burst"
            origin="center"
          />
          <motion.div
            className="absolute inset-0 bg-teal-400 pointer-events-none z-40"
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

      {hasCamaleonte && isPoisoned && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-teal-600 to-teal-800 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <img src={camaleontePng} alt="Il Camaleonte" className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-2xl font-black text-white">Il Camaleonte vince!</h2>
          <p className="text-teal-200 text-sm mt-1">
            Ha indovinato la parola dei civili.
          </p>
        </motion.div>
      )}

      {hasCamaleonte && isCamaleonteSurvived && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-teal-600 to-teal-800 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <img src={camaleontePng} alt="Il Camaleonte" className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-2xl font-black text-white">Il Camaleonte vince!</h2>
          <p className="text-teal-200 text-sm mt-1">
            È sopravvissuto fino alla fine.
          </p>
        </motion.div>
      )}

      {hasTalpa && isTalpaSurvived && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-orange-800 to-orange-950 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <img src={talpaPng} alt="La Talpa" className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-2xl font-black text-white">La Talpa vince!</h2>
          <p className="text-orange-300 text-sm mt-1">
            È sopravvissuta fino alla fine.
          </p>
        </motion.div>
      )}

      {hasCamaleonte && hasTalpa && isBothSurvived && (
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
            {hasTalpa && (
              <>
                <div className="w-px bg-white/8" />
                <div>
                  <p className="text-xs text-orange-500">Talpe</p>
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
                      const isTalpaSurvivor = player.role === 'talpa' && !player.eliminated
                      const isCamaleonteCorrect = player.role === 'camaleonte' && camaleonteCorrectIds.includes(player.id)
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
                          {player.specialRole === 'spettro' && <span className="text-cyan-400 text-xs">🎐</span>}
                          {player.specialRole === 'duellante' && <span className="text-blue-400 text-xs">⚔️</span>}
                          {(player.specialRole === 'romeo' || player.specialRole === 'giulietta') && <span className="text-rose-300 text-xs">💕</span>}
                          {player.specialRole === 'riccio' && <span className="text-yellow-400 text-xs">🦔</span>}
                          {player.specialRole === 'oracolo' && <span className="text-purple-400 text-xs">🔮</span>}
                          <span className={`font-medium text-sm ${player.eliminated ? 'line-through text-slate-500' : 'text-white'}`}>
                            {player.name}
                          </span>
                          {isTalpaSurvivor && (isTalpaSurvived || isBothSurvived) && (
                            <span className="text-orange-500 text-[10px] shrink-0">sopravvissuta!</span>
                          )}
                          {player.role === 'camaleonte' && !player.eliminated && isCamaleonteSurvived && (
                            <span className="text-teal-400 text-[10px] shrink-0">sopravvissuto!</span>
                          )}
                          {player.role === 'talpa' && player.eliminated && pts > 0 && (
                            <span className="text-orange-500/70 text-[10px] shrink-0">parziale</span>
                          )}
                          {isCamaleonteCorrect && (
                            <span className="text-emerald-400 text-[10px] shrink-0">ha indovinato!</span>
                          )}
                          {player.specialRole === 'buffone' && player.eliminatedInTurno === 1 && (
                            <span className="text-red-400 text-[10px] shrink-0">bonus buffone!</span>
                          )}
                          {player.specialRole === 'duellante' && (() => {
                            const result = duelResult(player.id)
                            if (result === 'won') return <span className="text-blue-400 text-[10px] shrink-0">duello vinto!</span>
                            if (result === 'lost') return <span className="text-rose-400 text-[10px] shrink-0">duello perso!</span>
                            if (result === 'draw') return <span className="text-slate-400 text-[10px] shrink-0">duello pari</span>
                            return null
                          })()}
                          <span className={`text-xs font-bold ${pts > 0 ? 'text-emerald-400' : pts < 0 ? 'text-rose-400' : 'text-slate-600'}`}>
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
                    isFirst ? 'text-amber-400' : total < 0 ? 'text-rose-400' : 'text-white'
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
      <div className="shrink-0 rounded-xl overflow-hidden bg-white/[0.07] border border-white/10 border-l-2 border-l-teal-500">
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
                    {hasCamaleonte
                      ? 'Se tutti gli impostori vengono eliminati (e il Camaleonte non indovina)'
                      : 'Se tutti gli impostori vengono eliminati'}
                  </div>
                </div>
                {hasCamaleonte && (
                  <div>
                    <div className="text-teal-400 font-semibold">Il Camaleonte — {players.length <= 4 ? '4' : '3'}{'\u00A0'}pt indovina / {players.length <= 3 ? '3' : players.length <= 4 ? '4' : '5'}{'\u00A0'}pt sopravvive</div>
                    <div className="text-slate-500 mt-0.5">Se eliminato, può tentare di indovinare la parola dei civili</div>
                  </div>
                )}
                {hasTalpa && (
                  <div>
                    <div className="text-orange-500 font-semibold">La Talpa — {players.length <= 4 ? '3' : '5'}{'\u00A0'}pt sopravvive</div>
                    <div className="text-slate-500 mt-0.5">Se eliminata: +1{'\u00A0'}pt per ogni civile eliminato (max 3{'\u00A0'}pt)</div>
                  </div>
                )}
                {players.some(p => p.specialRole === 'buffone') && (
                  <div>
                    <div className="text-red-400 font-semibold">Il Buffone — +2{'\u00A0'}pt bonus</div>
                    <div className="text-slate-500 mt-0.5">Se eliminato al primo turno di votazione</div>
                  </div>
                )}
                {players.some(p => p.specialRole === 'spettro') && (
                  <div>
                    <div className="text-cyan-400 font-semibold">Lo Spettro — vota dopo eliminazione</div>
                    <div className="text-slate-500 mt-0.5">Continua a votare anche dopo essere stato eliminato</div>
                  </div>
                )}
                {players.some(p => p.specialRole === 'duellante') && (
                  <div>
                    <div className="text-blue-400 font-semibold">I Duellanti — ±2{'\u00A0'}pt trasferimento</div>
                    <div className="text-slate-500 mt-0.5">Il primo dei due eliminato perde 2 pt, l'avversario ne guadagna 2. Pareggio se eliminati nello stesso turno.</div>
                  </div>
                )}
                {players.some(p => p.specialRole === 'romeo' || p.specialRole === 'giulietta') && (
                  <div>
                    <div className="text-rose-300 font-semibold">Romeo & Giulietta — legame fatale</div>
                    <div className="text-slate-500 mt-0.5">Due giocatori legati: se uno viene eliminato, anche l'altro cade.</div>
                  </div>
                )}
                {players.some(p => p.specialRole === 'riccio') && (
                  <div>
                    <div className="text-yellow-400 font-semibold">Il Riccio — colpo finale</div>
                    <div className="text-slate-500 mt-0.5">Se eliminato, sceglie un giocatore da trascinare con sé.</div>
                  </div>
                )}
                {players.some(p => p.specialRole === 'oracolo') && (
                  <div>
                    <div className="text-purple-400 font-semibold">L'Oracolo — rivelazione</div>
                    <div className="text-slate-500 mt-0.5">Se eliminato, svela il ruolo di un giocatore a sua scelta.</div>
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
