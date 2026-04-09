import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import ConfirmDialog from '../components/ConfirmDialog'
import RoleTag from '../components/RoleTag'
import { AVATAR_COLORS } from '../constants/avatarColors'
import { springTap } from '../constants/animations'
import talpaPng from '../assets/talpa.png'
import camaleontePng from '../assets/camaleonte.png'

const SPECIAL_ROLE_BADGES: Record<string, { emoji: string; label: string; classes: string }> = {
  buffone: { emoji: '🃏', label: 'Buffone', classes: 'bg-red-500/20 border-red-400/30 text-red-400' },
  spettro: { emoji: '🎐', label: 'Spettro', classes: 'bg-cyan-500/20 border-cyan-400/30 text-cyan-400' },
  duellante: { emoji: '⚔️', label: 'Duellante', classes: 'bg-blue-900/20 border-blue-700/30 text-blue-400' },
  romeo: { emoji: '💕', label: 'Romeo', classes: 'bg-rose-400/20 border-rose-300/30 text-rose-300' },
  giulietta: { emoji: '💕', label: 'Giulietta', classes: 'bg-rose-400/20 border-rose-300/30 text-rose-300' },
  riccio: { emoji: '🦔', label: 'Riccio', classes: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400' },
  oracolo: { emoji: '🔮', label: 'Oracolo', classes: 'bg-purple-900/20 border-purple-700/30 text-purple-400' },
}

type Phase = 'select' | 'reveal'

export default function OracoloRevealScreen() {
  const players = useGameStore(s => s.players)
  const eliminatedThisTurno = useGameStore(s => s.eliminatedThisTurno)
  const oracoloReveal = useGameStore(s => s.oracoloReveal)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('select')
  const [revealedId, setRevealedId] = useState<string | null>(null)

  const targets = players.filter(p => !p.eliminated)
  const selectedPlayer = selectedId ? players.find(p => p.id === selectedId) : null
  const revealedPlayer = revealedId ? players.find(p => p.id === revealedId) : null

  const handleConfirm = () => {
    if (selectedId) {
      setRevealedId(selectedId)
      setSelectedId(null)
      setPhase('reveal')
    }
  }

  if (phase === 'reveal' && revealedPlayer) {
    const badge = revealedPlayer.specialRole ? SPECIAL_ROLE_BADGES[revealedPlayer.specialRole] : null
    const isCamaleonte = revealedPlayer.role === 'camaleonte'
    const isTalpa = revealedPlayer.role === 'talpa'

    return (
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6">
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.6] }}
          transition={{ duration: 0.8 }}
        />

        <div className="flex flex-col items-center gap-3 relative z-10">
          <motion.div
            className="text-5xl"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            🔮
          </motion.div>
          <p className="text-slate-400 text-sm uppercase tracking-widest">L'Oracolo rivela</p>
          <motion.h2
            className="text-3xl font-black text-white text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {revealedPlayer.name}
          </motion.h2>
        </div>

        <motion.div
          className="flex flex-col items-center gap-4 w-full max-w-xs relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass rounded-2xl px-6 py-5 text-center w-full" style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}>
            <motion.div
              className="text-5xl mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.4, stiffness: 300, damping: 15 }}
            >
              {isCamaleonte ? <img src={camaleontePng} alt="Il Camaleonte" className="w-12 h-12 mx-auto" /> : isTalpa ? <img src={talpaPng} alt="La Talpa" className="w-12 h-12 mx-auto" /> : '😇'}
            </motion.div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <RoleTag role={revealedPlayer.role} size="lg" />
              {badge && (
                <span className={`inline-block rounded-full border text-sm font-bold px-3 py-1 ${badge.classes}`}>
                  {badge.emoji} {badge.label}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <motion.button
          onClick={() => oracoloReveal(revealedPlayer.id)}
          className="w-full max-w-xs glass-button font-bold py-5 rounded-2xl text-lg relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          {...springTap}
          transition={{ ...springTap.transition, delay: 0.6 }}
        >
          Continua →
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-5 overflow-y-auto">
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl">🔮</span>
        <h2 className="text-2xl font-black text-purple-400">L'Oracolo rivela!</h2>
        <p className="text-slate-400 text-sm text-center">
          {eliminatedThisTurno?.name} può svelare il ruolo di un giocatore
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {targets.map((player, i) => {
          const originalIndex = players.indexOf(player)
          return (
            <motion.button
              key={player.id}
              onClick={() => setSelectedId(player.id)}
              className="flex items-center gap-3 glass rounded-2xl px-4 py-3 hover:bg-purple-900/10 transition-colors border border-transparent hover:border-purple-700/20"
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
        title="Conferma rivelazione"
        description={`Vuoi svelare il ruolo di ${selectedPlayer?.name}? Questa scelta è definitiva.`}
        confirmLabel="Rivela"
        onConfirm={handleConfirm}
        onCancel={() => setSelectedId(null)}
      />
    </div>
  )
}
