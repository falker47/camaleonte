import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import RoleTag from '../components/RoleTag'

export default function EliminationScreen() {
  const eliminatedThisRound = useGameStore(s => s.eliminatedThisRound)
  const confirmElimination = useGameStore(s => s.confirmElimination)
  const players = useGameStore(s => s.players)

  if (!eliminatedThisRound) return null

  const { name, role } = eliminatedThisRound
  const isMrWhite = role === 'mrwhite'

  // Count remaining impostors (excluding the one being eliminated right now)
  const remainingMrWhite = players.filter(p => !p.eliminated && p.role === 'mrwhite' && p.id !== eliminatedThisRound.id).length
  const remainingInfiltrati = players.filter(p => !p.eliminated && p.role === 'infiltrato' && p.id !== eliminatedThisRound.id).length
  const remainingImpostors = remainingMrWhite + remainingInfiltrati

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="text-6xl">{isMrWhite ? '🕵️' : role === 'infiltrato' ? '🎭' : '😇'}</div>
        <p className="text-slate-400 text-sm uppercase tracking-widest">Eliminato</p>
        <h2 className="text-4xl font-black text-white">{name}</h2>
        <RoleTag role={role} size="lg" />
      </div>

      {isMrWhite && (
        <div className="glass rounded-2xl px-6 py-4 text-center max-w-xs" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
          <p className="text-amber-400 font-semibold">Mr. White eliminato!</p>
          <p className="text-slate-400 text-sm mt-1">
            Potrà tentare di indovinare la parola dei civili per vincere ancora.
          </p>
          {remainingInfiltrati > 0 && (
            <p className="text-amber-400/70 text-xs mt-2">
              Attenzione: {remainingInfiltrati === 1 ? 'c\'è ancora 1 infiltrato' : `ci sono ancora ${remainingInfiltrati} infiltrati`} in gioco!
            </p>
          )}
        </div>
      )}

      {role === 'infiltrato' && (
        <div className="glass rounded-2xl px-6 py-4 text-center max-w-xs" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
          <p className="text-amber-400 font-semibold">Infiltrato scoperto!</p>
          {remainingImpostors > 0 ? (
            <p className="text-slate-400 text-sm mt-1">
              {remainingImpostors === 1 ? 'Resta ancora 1 impostore' : `Restano ancora ${remainingImpostors} impostori`} da trovare.
            </p>
          ) : (
            <p className="text-slate-400 text-sm mt-1">Era l'ultimo!</p>
          )}
        </div>
      )}

      {role === 'civile' && (
        <div className="glass rounded-2xl px-6 py-4 text-center max-w-xs" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}>
          <p className="text-rose-400 font-semibold">Un civile eliminato!</p>
          <p className="text-slate-400 text-sm mt-1">Attenzione, gli impostori guadagnano terreno.</p>
        </div>
      )}

      <motion.button
        onClick={confirmElimination}
        className="w-full max-w-xs glass-button font-bold py-5 rounded-2xl text-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {isMrWhite ? 'Vai al tentativo →' : 'Continua →'}
      </motion.button>
    </div>
  )
}
