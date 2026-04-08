import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import RoleTag from '../components/RoleTag'
import { vibrate } from '../utils/vibrate'
import { springTap } from '../constants/animations'

const ROLE_FLASH_COLORS: Record<string, string> = {
  mrwhite: 'rgba(255,255,255,0.15)',
  infiltrato: 'rgba(251,191,36,0.15)',
  civile: 'rgba(99,102,241,0.15)',
}

export default function EliminationScreen() {
  const eliminatedThisTurno = useGameStore(s => s.eliminatedThisTurno)
  const confirmElimination = useGameStore(s => s.confirmElimination)
  const players = useGameStore(s => s.players)
  const turno = useGameStore(s => s.turno)

  const processing = useRef(false)

  if (!eliminatedThisTurno) return null

  const { name, role } = eliminatedThisTurno
  const isMrWhite = role === 'mrwhite'
  const isBuffoneBonus = eliminatedThisTurno.specialRole === 'buffone' && turno === 1
  const isSpettro = eliminatedThisTurno.specialRole === 'spettro'

  // Count remaining impostors (excluding the one being eliminated right now)
  const remainingMrWhite = players.filter(p => !p.eliminated && p.role === 'mrwhite' && p.id !== eliminatedThisTurno.id).length
  const remainingInfiltrati = players.filter(p => !p.eliminated && p.role === 'infiltrato' && p.id !== eliminatedThisTurno.id).length
  const remainingImpostors = remainingMrWhite + remainingInfiltrati

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-8">
      {/* Background flash */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundColor: isBuffoneBonus ? 'rgba(239,68,68,0.2)' : ROLE_FLASH_COLORS[role] }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.6 }}
      />

      <div className="flex flex-col items-center gap-3 relative z-10">
        <motion.div
          className="text-6xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {isMrWhite ? '🕵️' : role === 'infiltrato' ? '🎭' : isBuffoneBonus ? '🃏' : isSpettro ? '🎐' : '😇'}
        </motion.div>
        <p className="text-slate-400 text-sm uppercase tracking-widest">Eliminato</p>
        <motion.h2
          className="text-4xl font-black text-white"
          initial={{ scale: 0.5, filter: 'blur(8px)' }}
          animate={{ scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
        >
          {name}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <RoleTag role={role} size="lg" />
          {isBuffoneBonus && (
            <span className="inline-block rounded-full bg-red-500/20 border border-red-400/30 text-red-400 text-sm font-bold px-3 py-1">
              🃏 Buffone
            </span>
          )}
          {isSpettro && (
            <span className="inline-block rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 text-sm font-bold px-3 py-1">
              🎐 Spettro
            </span>
          )}
        </motion.div>
      </div>

      {isMrWhite && (
        <motion.div
          className="glass rounded-2xl px-6 py-4 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-amber-400 font-semibold">Mr. White eliminato!</p>
          <p className="text-slate-400 text-sm mt-1">
            Potrà tentare di indovinare la parola dei civili per vincere ancora.
          </p>
          {remainingInfiltrati > 0 && (
            <p className="text-amber-400/70 text-xs mt-2">
              Attenzione: {remainingInfiltrati === 1 ? 'c\'è ancora 1 infiltrato' : `ci sono ancora ${remainingInfiltrati} infiltrati`} in gioco!
            </p>
          )}
        </motion.div>
      )}

      {role === 'infiltrato' && (
        <motion.div
          className="glass rounded-2xl px-6 py-4 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-amber-400 font-semibold">Infiltrato scoperto!</p>
          {remainingImpostors > 0 ? (
            <p className="text-slate-400 text-sm mt-1">
              {remainingImpostors === 1 ? 'Resta ancora 1 impostore' : `Restano ancora ${remainingImpostors} impostori`} da trovare.
            </p>
          ) : (
            <p className="text-slate-400 text-sm mt-1">Era l'ultimo!</p>
          )}
        </motion.div>
      )}

      {role === 'civile' && isBuffoneBonus && (
        <motion.div
          className="glass rounded-2xl px-6 py-5 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-red-400 font-bold text-lg">Il Buffone ride!</p>
          <p className="text-slate-300 text-sm mt-2">
            Eliminato al primo turno — guadagna <span className="text-red-400 font-bold">+2 punti bonus</span>!
          </p>
          <p className="text-slate-500 text-xs mt-2">Era proprio quello che voleva...</p>
        </motion.div>
      )}

      {role === 'civile' && !isBuffoneBonus && (
        <motion.div
          className="glass rounded-2xl px-6 py-4 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-rose-400 font-semibold">Un civile eliminato!</p>
          <p className="text-slate-400 text-sm mt-1">Attenzione, gli impostori guadagnano terreno.</p>
        </motion.div>
      )}

      {isSpettro && (
        <motion.div
          className="glass rounded-2xl px-6 py-4 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-cyan-400 font-bold text-lg">Lo Spettro non svanisce!</p>
          <p className="text-slate-300 text-sm mt-2">
            Continuerà a <span className="text-cyan-400 font-bold">votare</span> anche dall'aldilà.
          </p>
          <p className="text-slate-500 text-xs mt-2">Non darà indizi e non potrà essere votato.</p>
        </motion.div>
      )}

      <motion.button
        onClick={() => { if (processing.current) return; processing.current = true; vibrate(30); confirmElimination() }}
        className="w-full max-w-xs glass-button font-bold py-5 rounded-2xl text-lg relative z-10"
        {...springTap}
      >
        {isMrWhite ? 'Vai al tentativo →' : 'Continua →'}
      </motion.button>
    </div>
  )
}
