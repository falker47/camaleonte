import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Role, SpecialRole } from '../store/types'
import Particles from './Particles'
import { vibrate } from '../utils/vibrate'
import { springTap } from '../constants/animations'
import camaleontePng from '../assets/camaleonte.png'

interface Props {
  playerName: string
  word: string | null
  role: Role
  specialRole?: SpecialRole
  specialRoleExtra?: string
  onDone: () => void
  isLast?: boolean
}

type Phase = 'waiting' | 'revealed' | 'hidden'

// La Talpa usa stessi colori del civile — non deve sapere di esserlo
const ROLE_COLORS: Record<Role, string> = {
  civile: 'from-indigo-700 to-indigo-900',
  talpa: 'from-indigo-700 to-indigo-900',
  camaleonte: 'from-teal-700 to-teal-900',
}

const ROLE_TEXT_COLORS: Record<Role, string> = {
  civile: 'text-white',
  talpa: 'text-white',
  camaleonte: 'text-white',
}

export default function PrivacyReveal({ playerName, word, role, specialRole, specialRoleExtra, onDone, isLast }: Props) {
  const [phase, setPhase] = useState<Phase>('waiting')
  const [showHide, setShowHide] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  // Reset when player changes
  useEffect(() => {
    setPhase('waiting')
    setShowHide(false)
    setShowParticles(false)
  }, [playerName])

  // Delay before showing "Ho visto" button
  useEffect(() => {
    if (phase === 'revealed') {
      const t = setTimeout(() => setShowHide(true), 800)
      return () => clearTimeout(t)
    } else {
      setShowHide(false)
    }
  }, [phase])

  const handleCardTap = () => {
    if (phase === 'waiting') {
      vibrate(25)
      setPhase('revealed')
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 1500)
    }
  }

  const handleHide = () => {
    setPhase('hidden')
  }

  const roleColor = ROLE_COLORS[role]
  const textColor = ROLE_TEXT_COLORS[role]

  return (
    <AnimatePresence mode="wait">
    <motion.div
      key={playerName}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center gap-6 w-full"
    >
      {/* Card */}
      <div
        className={`relative perspective-1000 w-full max-w-xs ${phase === 'waiting' ? 'cursor-pointer' : ''}`}
        style={{ height: '220px' }}
        onClick={handleCardTap}
      >
        <div
          className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${phase === 'revealed' ? 'rotate-y-180' : ''}`}
        >
          {/* Back — privacy */}
          <motion.div
            className="absolute inset-0 backface-hidden rounded-3xl glass flex flex-col items-center justify-center gap-3 shadow-2xl"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            animate={phase === 'waiting' ? {
              borderColor: [
                'rgba(255,255,255,0.12)',
                'rgba(99,102,241,0.6)',
                'rgba(255,255,255,0.12)',
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {phase === 'hidden' ? (
              <>
                <div className="text-5xl">✓</div>
                <p className="text-slate-300 text-sm">Parola vista</p>
              </>
            ) : (
              <>
                <div className="text-5xl">👁️</div>
                <p className="text-slate-300 text-sm">Tocca per rivelare</p>
              </>
            )}
          </motion.div>
          {/* Front — word */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br ${roleColor} border border-white/10 flex flex-col items-center justify-center gap-3 shadow-2xl px-6`}
          >
            {role === 'camaleonte' ? (
              <>
                <img src={camaleontePng} alt="Il Camaleonte" className="w-12 h-12" />
                <p className={`text-2xl font-black ${textColor}`}>Sei Il Camaleonte</p>
                <p className={`text-sm text-center ${textColor} opacity-80`}>Non hai nessuna parola. Bluffa!</p>
                {specialRole === 'mimo' && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="inline-block rounded-full bg-slate-800/30 border border-slate-600/30 text-slate-200 text-sm font-bold px-4 py-1">
                      🤫 Il Mimo
                    </span>
                    <p className={`text-xs text-center ${textColor} opacity-60`}>
                      Devi mimare! No parole.
                    </p>
                  </div>
                )}
                {specialRole === 'spettro' && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="inline-block rounded-full bg-cyan-800/30 border border-cyan-600/30 text-cyan-200 text-sm font-bold px-4 py-1">
                      🎐 Lo Spettro
                    </span>
                    <p className={`text-xs text-center ${textColor} opacity-60`}>
                      Se eliminato, continui a votare!
                    </p>
                  </div>
                )}
                {specialRole === 'duellante' && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="inline-block rounded-full bg-blue-800/30 border border-blue-600/30 text-blue-200 text-sm font-bold px-4 py-1">
                      ⚔️ Il Duellante
                    </span>
                    <p className={`text-xs text-center ${textColor} opacity-60`}>
                      Il tuo nemico è <span className="font-bold">{specialRoleExtra}</span>
                    </p>
                  </div>
                )}
                {specialRole === 'romeo' && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="inline-block rounded-full bg-pink-800/30 border border-pink-600/30 text-pink-200 text-sm font-bold px-4 py-1">
                      💕 Romeo
                    </span>
                    <p className={`text-xs text-center ${textColor} opacity-60`}>
                      Il tuo destino è legato a Giulietta.
                    </p>
                  </div>
                )}
                {specialRole === 'giulietta' && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="inline-block rounded-full bg-pink-800/30 border border-pink-600/30 text-pink-200 text-sm font-bold px-4 py-1">
                      💕 Giulietta
                    </span>
                    <p className={`text-xs text-center ${textColor} opacity-60`}>
                      Il tuo destino è legato a Romeo.
                    </p>
                  </div>
                )}
                {specialRole === 'riccio' && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="inline-block rounded-full bg-orange-800/30 border border-orange-600/30 text-orange-200 text-sm font-bold px-4 py-1">
                      🦔 Il Riccio
                    </span>
                    <p className={`text-xs text-center ${textColor} opacity-60`}>
                      Se eliminato, trascini qualcuno con te.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className={`text-xs uppercase tracking-widest ${textColor} opacity-70`}>
                  La tua parola
                </p>
                <p className={`text-3xl font-black text-center ${textColor}`}>{word}</p>
                {specialRole === 'buffone' && (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <span className="inline-block rounded-full bg-red-500/20 border border-red-400/30 text-red-400 text-sm font-bold px-4 py-1">
                      🃏 Il Buffone
                    </span>
                    <p className={`text-sm text-center ${textColor} opacity-60`}>
                      Se vieni eliminato al turno 1, guadagni +2 pt bonus!
                    </p>
                  </div>
                )}
                {specialRole === 'mimo' && (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <span className="inline-block rounded-full bg-slate-700/30 border border-slate-400/30 text-slate-200 text-sm font-bold px-4 py-1">
                      🤫 Il Mimo
                    </span>
                    <p className={`text-sm text-center ${textColor} opacity-60`}>
                      Devi mimare i tuoi indizi! No parole, no labiale, no lettere nell'aria.
                    </p>
                  </div>
                )}
                {specialRole === 'spettro' && (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <span className="inline-block rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 text-sm font-bold px-4 py-1">
                      🎐 Lo Spettro
                    </span>
                    <p className={`text-sm text-center ${textColor} opacity-60`}>
                      Anche se verrai eliminato, potrai continuare a votare!
                    </p>
                  </div>
                )}
                {specialRole === 'duellante' && (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <span className="inline-block rounded-full bg-blue-900/20 border border-blue-700/30 text-blue-400 text-sm font-bold px-4 py-1">
                      ⚔️ Il Duellante
                    </span>
                    <p className={`text-sm text-center ${textColor} opacity-60`}>
                      Sfidi <span className="font-bold">{specialRoleExtra}</span>! Eliminalo per rubargli 2 pt.
                    </p>
                  </div>
                )}
                {specialRole === 'romeo' && (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <span className="inline-block rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-400 text-sm font-bold px-4 py-1">
                      💕 Romeo
                    </span>
                    <p className={`text-sm text-center ${textColor} opacity-60`}>
                      Il tuo destino è legato a Giulietta. Se uno di voi viene eliminato, anche l'altro lo sarà.
                    </p>
                  </div>
                )}
                {specialRole === 'giulietta' && (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <span className="inline-block rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-400 text-sm font-bold px-4 py-1">
                      💕 Giulietta
                    </span>
                    <p className={`text-sm text-center ${textColor} opacity-60`}>
                      Il tuo destino è legato a Romeo. Se uno di voi viene eliminato, anche l'altro lo sarà.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Particles on reveal */}
        {showParticles && (
          <>
            <Particles
              colors={role === 'camaleonte'
                ? ['#2dd4bf', '#14b8a6', '#0d9488']
                : ['#818cf8', '#6366f1', '#a5b4fc']
              }
              style="burst"
              origin="center"
            />
            {role === 'camaleonte' && (
              <motion.div
                className="absolute inset-0 rounded-3xl bg-teal-400 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.2, 0] }}
                transition={{ duration: 0.6 }}
              />
            )}
          </>
        )}
      </div>

      {/* Buttons */}
      {phase === 'waiting' && (
        <p className="text-slate-400 text-sm">Tocca la carta per vedere la tua parola</p>
      )}

      {phase === 'revealed' && showHide && (
        <motion.button
          onClick={handleHide}
          className="w-full max-w-xs glass-button-secondary font-semibold py-4 rounded-2xl"
          {...springTap}
        >
          Ho visto — Nascondi
        </motion.button>
      )}

      {phase === 'hidden' && (
        <motion.button
          onClick={onDone}
          className="w-full max-w-xs font-semibold py-4 rounded-2xl text-white"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(79,70,229,0.9))',
            border: '1px solid rgba(99,102,241,0.4)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
          {...springTap}
        >
          {isLast ? 'Tutti pronti — Inizia!' : 'Prossimo giocatore →'}
        </motion.button>
      )}
    </motion.div>
    </AnimatePresence>
  )
}
