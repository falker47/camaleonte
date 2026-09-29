import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import Particles from '../components/Particles'
import { useAnimatedValue } from '../hooks/useAnimatedValue'
import { springTap } from '../constants/animations'

function AnimatedTotal({ value }: { value: number }) {
  const displayValue = useAnimatedValue(value)
  return <span>{displayValue} pt</span>
}

export default function FinalResultScreen() {
  const players = useGameStore(s => s.players)
  const scores = useGameStore(s => s.scores)
  const manche = useGameStore(s => s.manche)
  const resetGame = useGameStore(s => s.resetGame)

  const leaderboard = Object.entries(scores).sort(([, a], [, b]) => b - a)
  const topScore = leaderboard[0]?.[1] ?? 0
  const leaders = leaderboard.filter(([, score]) => score === topScore).map(([name]) => name)
  const isTie = leaders.length > 1

  return (
    <div className="relative flex flex-col flex-1 min-h-0 overflow-y-auto px-5 py-7">
      <Particles
        count={24}
        colors={['#fbbf24', '#2dd4bf', '#818cf8', '#f472b6', '#ffffff']}
        style="burst"
        origin="center"
      />
      <Particles
        count={18}
        colors={['#fbbf24', '#fde68a', '#2dd4bf', '#a5b4fc']}
        style="fall"
        origin="top"
      />

      <div
        className="absolute inset-x-8 top-10 h-56 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.16) 0%, rgba(45,212,191,0.08) 38%, transparent 72%)' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.55, rotate: -12 }}
          animate={{ opacity: 1, y: 0, scale: [0.55, 1.12, 1], rotate: [-12, 5, 0] }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl border border-amber-300/25"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(251,191,36,0.32), rgba(20,184,166,0.16) 55%, rgba(255,255,255,0.04) 100%)',
            boxShadow: '0 0 55px rgba(251,191,36,0.18), 0 0 90px rgba(45,212,191,0.10)',
          }}
        >
          🏆
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="text-teal-300 text-xs font-bold uppercase tracking-[0.22em] mt-5"
        >
          Partita completata
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.45 }}
          className="text-3xl font-black text-white mt-2"
        >
          {isTie ? 'Pareggio in vetta!' : `${leaders[0] ?? 'Partita'} vince!`}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-slate-400 text-sm mt-2 max-w-xs"
        >
          {isTie
            ? `${leaders.join(' · ')} chiudono a pari merito con ${topScore} pt.`
            : `${manche} manche concluse · ${players.length} giocatori`}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.58, duration: 0.5 }}
        className="relative z-10 mt-7"
      >
        <div className="flex items-end justify-between px-1 mb-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.18em]">Risultato definitivo</p>
            <h2 className="text-lg font-black text-white mt-0.5">Classifica finale</h2>
          </div>
          <span className="text-xs text-slate-500">{manche} manche</span>
        </div>

        <div className="glass-strong rounded-3xl overflow-hidden border border-white/10">
          {leaderboard.map(([name, total], index) => {
            const rank = 1 + leaderboard.filter(([, score]) => score > total).length
            const isLeader = rank === 1
            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.68 + index * 0.07, duration: 0.35 }}
                className={`relative flex items-center justify-between px-4 py-4 ${index < leaderboard.length - 1 ? 'border-b border-white/8' : ''} ${isLeader ? 'bg-amber-400/[0.07]' : ''}`}
              >
                {isLeader && (
                  <div
                    className="absolute inset-y-0 left-0 w-0.5"
                    style={{ background: 'linear-gradient(#fbbf24, #2dd4bf)' }}
                  />
                )}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black ${isLeader ? 'bg-amber-400/15 text-amber-300 border border-amber-300/20' : 'bg-white/5 text-slate-500 border border-white/8'}`}>
                    {isLeader ? '🏆' : rank}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className={`font-bold truncate ${isLeader ? 'text-white' : 'text-slate-200'}`}>{name}</p>
                    {isLeader && (
                      <p className="text-[10px] uppercase tracking-wide text-amber-300/75">
                        {isTie ? 'Primo posto a pari merito' : 'Vincitore'}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`font-black tabular-nums ${isLeader ? 'text-amber-300 text-lg' : 'text-white'}`}>
                  <AnimatedTotal value={total} />
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="relative z-10 mt-auto pt-6"
      >
        <motion.button
          onClick={resetGame}
          className="w-full glass-button font-black py-5 rounded-2xl text-lg"
          {...springTap}
        >
          Fine partita
        </motion.button>
        <p className="text-center text-slate-600 text-[11px] mt-2">
          Torna alla Home
        </p>
      </motion.div>
    </div>
  )
}
