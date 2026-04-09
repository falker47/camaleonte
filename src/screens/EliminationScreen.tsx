import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import RoleTag from '../components/RoleTag'
import { vibrate } from '../utils/vibrate'
import { springTap } from '../constants/animations'
import talpaPng from '../assets/talpa.png'
import camaleontePng from '../assets/camaleonte.png'

const ROLE_FLASH_COLORS: Record<string, string> = {
  camaleonte: 'rgba(20,184,166,0.15)',
  talpa: 'rgba(234,88,12,0.15)',
  civile: 'rgba(99,102,241,0.15)',
}

export default function EliminationScreen() {
  const eliminatedThisTurno = useGameStore(s => s.eliminatedThisTurno)
  const confirmElimination = useGameStore(s => s.confirmElimination)
  const players = useGameStore(s => s.players)
  const turno = useGameStore(s => s.turno)
  const postRiccioStrike = useGameStore(s => s.postRiccioStrike)
  const storeLinkedPartner = useGameStore(s => s.linkedEliminatedThisTurno)

  const processing = useRef(false)

  if (!eliminatedThisTurno) return null

  const { name, role } = eliminatedThisTurno
  const isCamaleonte = role === 'camaleonte'
  const isBuffoneBonus = eliminatedThisTurno.specialRole === 'buffone' && turno === 1
  const isSpettro = eliminatedThisTurno.specialRole === 'spettro'
  const isRiccio = eliminatedThisTurno.specialRole === 'riccio'
  const isOracolo = eliminatedThisTurno.specialRole === 'oracolo'
  const isRomeoGiulietta = eliminatedThisTurno.specialRole === 'romeo' || eliminatedThisTurno.specialRole === 'giulietta'
  const linkedPartner = isRomeoGiulietta
    ? (players.find(p => (p.specialRole === 'romeo' || p.specialRole === 'giulietta') && p.id !== eliminatedThisTurno.id && !p.eliminated)
      ?? storeLinkedPartner)
    : null

  // Count remaining impostors (excluding the one being eliminated right now)
  const remainingCamaleonti = players.filter(p => !p.eliminated && p.role === 'camaleonte' && p.id !== eliminatedThisTurno.id).length
  const remainingTalpe = players.filter(p => !p.eliminated && p.role === 'talpa' && p.id !== eliminatedThisTurno.id).length
  const remainingImpostors = remainingCamaleonti + remainingTalpe

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-8">
      {/* Background flash */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundColor: isBuffoneBonus ? 'rgba(239,68,68,0.2)' : isRiccio ? 'rgba(234,179,8,0.15)' : isOracolo ? 'rgba(126,34,206,0.15)' : ROLE_FLASH_COLORS[role] }}
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
          {isCamaleonte ? <img src={camaleontePng} alt="Il Camaleonte" className="w-12 h-12" /> : role === 'talpa' ? <img src={talpaPng} alt="La Talpa" className="w-12 h-12" /> : isBuffoneBonus ? '🃏' : isSpettro ? '🎐' : isRiccio ? '🦔' : isOracolo ? '🔮' : '😇'}
        </motion.div>
        <p className="text-slate-400 text-sm uppercase tracking-widest">
          {postRiccioStrike ? '🦔 Eliminato dal Riccio' : 'Eliminato'}
        </p>
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
          {isRiccio && (
            <span className="inline-block rounded-full bg-yellow-500/20 border border-yellow-400/30 text-yellow-400 text-sm font-bold px-3 py-1">
              🦔 Riccio
            </span>
          )}
          {isOracolo && (
            <span className="inline-block rounded-full bg-purple-900/20 border border-purple-700/30 text-purple-400 text-sm font-bold px-3 py-1">
              🔮 Oracolo
            </span>
          )}
        </motion.div>
      </div>

      {isCamaleonte && (
        <motion.div
          className="glass rounded-2xl px-6 py-4 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(20, 184, 166, 0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-teal-400 font-semibold">Il Camaleonte eliminato!</p>
          <p className="text-slate-400 text-sm mt-1">
            Potrà tentare di indovinare la parola dei civili per vincere ancora.
          </p>
          {remainingTalpe > 0 && (
            <p className="text-orange-500/70 text-xs mt-2">
              Attenzione: {remainingTalpe === 1 ? 'c\'è ancora 1 talpa' : `ci sono ancora ${remainingTalpe} talpe`} in gioco!
            </p>
          )}
        </motion.div>
      )}

      {role === 'talpa' && (
        <motion.div
          className="glass rounded-2xl px-6 py-4 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(234, 88, 12, 0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-orange-500 font-semibold">La Talpa scoperta!</p>
          {remainingImpostors > 0 ? (
            <p className="text-slate-400 text-sm mt-1">
              {remainingImpostors === 1 ? 'Resta ancora 1 impostore' : `Restano ancora ${remainingImpostors} impostori`} da trovare.
            </p>
          ) : (
            <p className="text-slate-400 text-sm mt-1">Era l'ultima!</p>
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

      {isRiccio && !postRiccioStrike && (
        <motion.div
          className="glass rounded-2xl px-6 py-5 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(234, 179, 8, 0.3)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-yellow-400 font-bold text-lg">Il Riccio!</p>
          <p className="text-slate-300 text-sm mt-2">
            Se il gioco non è finito, potrà scegliere un giocatore da <span className="text-yellow-400 font-bold">eliminare</span> con sé.
          </p>
        </motion.div>
      )}

      {isOracolo && (
        <motion.div
          className="glass rounded-2xl px-6 py-5 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(126, 34, 206, 0.3)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-purple-400 font-bold text-lg">L'Oracolo!</p>
          <p className="text-slate-300 text-sm mt-2">
            Se il gioco non è finito, potrà svelare il <span className="text-purple-400 font-bold">ruolo</span> di un giocatore a sua scelta.
          </p>
        </motion.div>
      )}

      {linkedPartner && (
        <motion.div
          className="glass rounded-2xl px-6 py-5 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(236, 72, 153, 0.3)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-rose-300 font-bold text-lg">{eliminatedThisTurno.specialRole === 'romeo' ? 'Era Romeo!' : 'Era Giulietta!'}</p>
          <p className="text-slate-300 text-sm mt-2">
            Anche <span className="text-rose-300 font-bold">{linkedPartner.name}</span> viene eliminato!
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <RoleTag role={linkedPartner.role} size="lg" />
          </div>
        </motion.div>
      )}

      <motion.button
        onClick={() => { if (processing.current) return; processing.current = true; vibrate(30); confirmElimination() }}
        className="w-full max-w-xs glass-button font-bold py-5 rounded-2xl text-lg relative z-10"
        {...springTap}
      >
        {isCamaleonte ? 'Vai al tentativo →' : 'Continua →'}
      </motion.button>
    </div>
  )
}
