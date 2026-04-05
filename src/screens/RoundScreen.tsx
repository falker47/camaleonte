import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { AVATAR_COLORS } from '../constants/avatarColors'
import { springTap } from '../constants/animations'

export default function RoundScreen() {
  const players = useGameStore(s => s.players)
  const round = useGameStore(s => s.round)
  const goTo = useGameStore(s => s.goTo)

  const active = players.filter(p => !p.eliminated)
  const eliminated = players.filter(p => p.eliminated)

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Round {round}</h2>
          <p className="text-slate-400 text-sm">Ogni giocatore dà un indizio</p>
        </div>
        <div className="glass rounded-xl px-3 py-2 text-center">
          <p className="text-white font-bold text-lg">{active.length}</p>
          <p className="text-slate-500 text-xs">attivi</p>
        </div>
      </div>

      {/* Active players */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Giocatori in gioco
        </p>
        <div className="flex flex-col gap-2">
          {active.map((player) => {
            const originalIndex = players.indexOf(player)
            return (
              <div
                key={player.id}
                className="flex items-center gap-3 glass rounded-2xl px-4 py-3"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[originalIndex % AVATAR_COLORS.length]} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                  {originalIndex + 1}
                </div>
                <span className="text-white font-medium">{player.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
            Eliminati ({eliminated.length})
          </span>
          <span className="text-slate-600">·</span>
          {eliminated.map((player, i) => (
            <span key={player.id} className="flex items-center gap-1 text-slate-500 text-sm">
              <span className="text-xs">✕</span>
              <span className="line-through">{player.name}</span>
              {i < eliminated.length - 1 && <span className="text-slate-700">,</span>}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto">
        <p className="text-slate-400 text-sm text-center mb-4">
          Dopo che tutti hanno dato il loro indizio, passate al voto
        </p>
        <motion.button
          onClick={() => goTo('vote')}
          className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold py-5 rounded-2xl text-lg transition-colors shadow-[0_8px_32px_rgba(244,63,94,0.3)]"
          {...springTap}
        >
          Vota l'impostore →
        </motion.button>
      </div>
    </div>
  )
}
