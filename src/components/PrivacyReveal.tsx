import { useState, useEffect } from 'react'
import type { Role } from '../store/types'

interface Props {
  playerName: string
  word: string | null
  role: Role
  onDone: () => void
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

export default function PrivacyReveal({ playerName, word, role, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('waiting')
  const [showHide, setShowHide] = useState(false)

  // Reset when player changes
  useEffect(() => {
    setPhase('waiting')
    setShowHide(false)
  }, [playerName])

  // Delay before showing "Ho visto" button
  useEffect(() => {
    if (phase === 'revealed') {
      const t = setTimeout(() => setShowHide(true), 1200)
      return () => clearTimeout(t)
    } else {
      setShowHide(false)
    }
  }, [phase])

  const handleCardTap = () => {
    if (phase === 'waiting') setPhase('revealed')
  }

  const handleHide = () => {
    setPhase('hidden')
  }

  const roleColor = ROLE_COLORS[role]
  const textColor = ROLE_TEXT_COLORS[role]

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Card */}
      <div
        className="perspective-1000 w-full max-w-xs cursor-pointer"
        style={{ height: '220px' }}
        onClick={handleCardTap}
      >
        <div
          className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${phase === 'revealed' ? 'rotate-y-180' : ''}`}
        >
          {/* Back — privacy */}
          <div className="absolute inset-0 backface-hidden rounded-3xl glass flex flex-col items-center justify-center gap-3 shadow-2xl" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            <div className="text-5xl">👁️</div>
            <p className="text-slate-300 text-sm">Tocca per rivelare</p>
          </div>
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
      </div>

      {/* Buttons */}
      {phase === 'waiting' && (
        <p className="text-slate-400 text-sm">Tocca la carta per vedere la tua parola</p>
      )}

      {phase === 'revealed' && showHide && (
        <button
          onClick={handleHide}
          className="w-full max-w-xs glass-button-secondary font-semibold py-4 rounded-2xl"
        >
          Ho visto — Nascondi
        </button>
      )}

      {phase === 'hidden' && (
        <button
          onClick={onDone}
          className="w-full max-w-xs glass-button font-semibold py-4 rounded-2xl"
        >
          Prossimo giocatore →
        </button>
      )}
    </div>
  )
}
