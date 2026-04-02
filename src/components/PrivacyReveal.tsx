import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Role } from '../store/types'
import Particles from './Particles'
import { vibrate } from '../utils/vibrate'

interface Props {
  playerName: string
  word: string | null
  role: Role
  onDone: () => void
  isLast?: boolean
}

type Phase = 'waiting' | 'revealed' | 'hidden'

// Infiltrato usa stessi colori del civile — non deve sapere di esserlo
const ROLE_COLORS: Record<Role, string> = {
  civile: 'from-indigo-700 to-indigo-900',
  infiltrato: 'from-indigo-700 to-indigo-900',
  mrwhite: 'from-slate-200 to-slate-400',
}

const ROLE_TEXT_COLORS: Record<Role, string> = {
  civile: 'text-white',
  infiltrato: 'text-white',
  mrwhite: 'text-black',
}

export default function PrivacyReveal({ playerName, word, role, onDone, isLast }: Props) {
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
            {role === 'mrwhite' ? (
              <>
                <div className={`text-4xl font-black ${textColor}`}>🕵️</div>
                <p className={`text-2xl font-black ${textColor}`}>Sei Mr. White</p>
                <p className={`text-sm text-center ${textColor} opacity-80`}>Non hai nessuna parola. Bluffa!</p>
              </>
            ) : (
              <>
                <p className={`text-xs uppercase tracking-widest ${textColor} opacity-70`}>
                  La tua parola
                </p>
                <p className={`text-3xl font-black text-center ${textColor}`}>{word}</p>
              </>
            )}
          </div>
        </div>

        {/* Particles on reveal */}
        {showParticles && (
          <>
            <Particles
              colors={role === 'mrwhite'
                ? ['#ffffff', '#e2e8f0', '#cbd5e1']
                : ['#818cf8', '#6366f1', '#a5b4fc']
              }
              style="burst"
              origin="center"
            />
            {role === 'mrwhite' && (
              <motion.div
                className="absolute inset-0 rounded-3xl bg-white pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Ho visto — Nascondi
        </motion.button>
      )}

      {phase === 'hidden' && (
        <motion.button
          onClick={onDone}
          className="w-full max-w-xs glass-button font-semibold py-4 rounded-2xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {isLast ? 'Tutti pronti — Inizia!' : 'Prossimo giocatore →'}
        </motion.button>
      )}
    </motion.div>
    </AnimatePresence>
  )
}
