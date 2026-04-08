import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import ConfirmDialog from '../components/ConfirmDialog'
import { AVATAR_COLORS } from '../constants/avatarColors'
import { springTap } from '../constants/animations'

export default function RiccioStrikeScreen() {
  const players = useGameStore(s => s.players)
  const eliminatedThisTurno = useGameStore(s => s.eliminatedThisTurno)
  const riccioStrike = useGameStore(s => s.riccioStrike)

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const targets = players.filter(p => !p.eliminated)
  const selectedPlayer = selectedId ? players.find(p => p.id === selectedId) : null

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-5 overflow-y-auto">
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl">🦔</span>
        <h2 className="text-2xl font-black text-yellow-400">Il Riccio colpisce!</h2>
        <p className="text-slate-400 text-sm text-center">
          {eliminatedThisTurno?.name} puo' trascinare qualcuno con se'
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {targets.map((player, i) => {
          const originalIndex = players.indexOf(player)
          return (
            <motion.button
              key={player.id}
              onClick={() => setSelectedId(player.id)}
              className="flex items-center gap-3 glass rounded-2xl px-4 py-3 hover:bg-yellow-500/10 transition-colors border border-transparent hover:border-yellow-400/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              {...springTap}
              transition={{ ...springTap.transition, delay: i * 0.05 }}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[originalIndex % AVATAR_COLORS.length]} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                {originalIndex + 1}
              </div>
              <span className="text-white font-medium">{player.name}</span>
            </motion.button>
          )
        })}
      </div>

      <ConfirmDialog
        open={selectedId !== null}
        title="Conferma eliminazione"
        description={`Vuoi eliminare ${selectedPlayer?.name}? Questa scelta e' definitiva.`}
        confirmLabel="Elimina"
        onConfirm={() => { if (selectedId) riccioStrike(selectedId) }}
        onCancel={() => setSelectedId(null)}
      />
    </div>
  )
}
