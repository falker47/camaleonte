import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import RoleTag from '../components/RoleTag'

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

  const mwPoisoned = mrWhiteCorrectIds.length > 0
  const isCiviliansWin = winner === 'civilians' && !mwPoisoned
  const isLastTwo = winner === 'last_two'
  const isPoisoned = winner === 'civilians' && mwPoisoned

  // Leaderboard sorted by cumulative score
  const leaderboard = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
  const hasScoreHistory = leaderboard.some(([, s]) => s > 0)

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-4 overflow-y-auto">
      {/* Winner banner */}
      {isCiviliansWin && (
        <div className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-indigo-700 to-indigo-900 border border-white/10">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl font-black text-white">I Civili vincono!</h2>
          <p className="text-indigo-200 text-sm mt-1">Tutti gli impostori sono stati eliminati.</p>
        </div>
      )}

      {isPoisoned && (
        <div className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-slate-100 to-slate-300 border border-white/10">
          <div className="text-5xl mb-2">🕵️</div>
          <h2 className="text-2xl font-black text-slate-900">Mr. White vince!</h2>
          <p className="text-slate-600 text-sm mt-1">
            Ha indovinato la parola dei civili.
          </p>
        </div>
      )}

      {isLastTwo && (
        <div className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-rose-700 to-rose-900 border border-white/10">
          <div className="text-5xl mb-2">😈</div>
          <h2 className="text-2xl font-black text-white">Gli impostori vincono!</h2>
          <p className="text-rose-200 text-sm mt-1">
            Sono sopravvissuti fino alla fine.
          </p>
        </div>
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

      {/* Player list with round points */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Ruoli e punti partita
        </p>
        <div className="flex flex-col gap-2">
          {players.map(player => {
            const pts = roundScores[player.name] ?? 0
            const isInfiltrateSurvivor = player.role === 'infiltrato' && !player.eliminated
            const isMwCorrect = player.role === 'mrwhite' && mrWhiteCorrectIds.includes(player.id)
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                  player.eliminated ? 'glass opacity-50' : 'glass'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {player.eliminated && <span className="text-slate-500 text-sm">✕</span>}
                  <span className={`font-medium truncate ${player.eliminated ? 'line-through text-slate-500' : 'text-white'}`}>
                    {player.name}
                  </span>
                  {isInfiltrateSurvivor && isLastTwo && (
                    <span className="text-amber-400 text-xs shrink-0">sopravvissuto!</span>
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
                    {pts > 0 ? `+${pts}` : '0'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leaderboard (cumulative) */}
      {hasScoreHistory && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Classifica generale
            </p>
            <button
              onClick={resetScores}
              className="text-xs text-slate-600 hover:text-rose-400 transition-colors"
            >
              Azzera punteggi
            </button>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            {leaderboard.map(([name, total], i) => {
              const isFirst = i === 0 && total > 0
              return (
                <div
                  key={name}
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
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Points legend */}
      <div className="glass rounded-xl px-4 py-3">
        <p className="text-slate-500 text-xs mb-1.5">Punteggio</p>
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-indigo-400">Civile: 2 pt (se tutti impostori eliminati e MW non indovina)</span>
          <span className="text-white">Mr. White: 6 pt (se indovina la parola o sopravvive)</span>
          <span className="text-amber-400">Infiltrato: 5 pt (se sopravvive fino alla fine)</span>
        </div>
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
