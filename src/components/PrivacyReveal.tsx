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
  civile: 'from-indigo-500/75 via-indigo-800/90 to-slate-950',
  talpa: 'from-indigo-500/75 via-indigo-800/90 to-slate-950',
  camaleonte: 'from-teal-400/70 via-teal-800/90 to-slate-950',
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
      className="flex flex-col items-center gap-5 w-full"
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
            className="absolute inset-0 backface-hidden overflow-hidden rounded-[28px] border border-white/15 bg-slate-900/95 shadow-[0_20px_55px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.08)]"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(45,212,191,0.12), transparent 42%), linear-gradient(145deg, rgba(30,41,59,0.98), rgba(15,23,42,0.98))',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-70"
              style={{ background: 'linear-gradient(120deg, transparent 22%, rgba(255,255,255,0.035) 48%, transparent 74%)' }}
            />
            <img
              src={camaleontePng}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 w-32 -translate-x-1/2 -translate-y-1/2 opacity-[0.055] grayscale"
            />
            <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-white/[0.06]" />

            {phase === 'hidden' ? (
              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
                <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-300/20 bg-teal-300/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <svg className="h-8 w-8 text-teal-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4 4L19 6.5" />
                  </svg>
                </div>
                <p className="text-base font-bold text-white">Parola vista</p>
                <p className="text-xs text-slate-400">Ora è nascosta</p>
              </div>
            ) : (
              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
                <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-300/20 bg-indigo-300/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <svg className="h-8 w-8 text-indigo-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-200/70">Carta privata</p>
                <p className="text-base font-bold text-white">Tocca per rivelare</p>
              </div>
            )}
          </motion.div>
          {/* Front — word */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 overflow-hidden rounded-[28px] bg-gradient-to-br ${roleColor} border border-white/15 shadow-[0_20px_55px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.1)] px-6`}
          >
            <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/[0.08] blur-2xl" />
            <div className="pointer-events-none absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-black/25 blur-2xl" />
            <div className="pointer-events-none absolute inset-3 rounded-[22px] border border-white/[0.08]" />
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3">
            {role === 'camaleonte' ? (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                  <img src={camaleontePng} alt="Il Camaleonte" className="h-11 w-11 drop-shadow-[0_5px_10px_rgba(0,0,0,0.25)]" />
                </div>
                <p className={`text-2xl font-black tracking-tight ${textColor}`}>Sei il Camaleonte</p>
                <p className={`text-sm text-center ${textColor} opacity-80`}>Non hai nessuna parola. Bluffa!</p>
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
                    <span className="inline-block rounded-full bg-rose-600/30 border border-rose-400/30 text-rose-200 text-sm font-bold px-4 py-1">
                      💕 Romeo
                    </span>
                    <p className={`text-xs text-center ${textColor} opacity-60`}>
                      Il tuo destino è legato a Giulietta.
                    </p>
                  </div>
                )}
                {specialRole === 'giulietta' && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="inline-block rounded-full bg-rose-600/30 border border-rose-400/30 text-rose-200 text-sm font-bold px-4 py-1">
                      💕 Giulietta
                    </span>
                    <p className={`text-xs text-center ${textColor} opacity-60`}>
                      Il tuo destino è legato a Romeo.
                    </p>
                  </div>
                )}
                {specialRole === 'riccio' && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="inline-block rounded-full bg-yellow-800/30 border border-yellow-600/30 text-yellow-200 text-sm font-bold px-4 py-1">
                      🦔 Il Riccio
                    </span>
                    <p className={`text-xs text-center ${textColor} opacity-60`}>
                      Se eliminato, trascini qualcuno con te.
                    </p>
                  </div>
                )}
                {specialRole === 'oracolo' && (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <span className="inline-block rounded-full bg-purple-950/40 border border-purple-700/30 text-purple-300 text-sm font-bold px-4 py-1">
                      🔮 L'Oracolo
                    </span>
                    <p className={`text-xs text-center ${textColor} opacity-60`}>
                      Se eliminato, sveli il ruolo di un giocatore.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${textColor} opacity-65`}>
                  La tua parola
                </p>
                <p className={`text-4xl font-black tracking-tight text-center ${textColor}`}>{word}</p>
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
                      Sfidi <span className="font-bold">{specialRoleExtra}</span>! Eliminalo per rubargli 1 pt.
                    </p>
                  </div>
                )}
                {specialRole === 'romeo' && (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <span className="inline-block rounded-full bg-rose-400/20 border border-rose-300/30 text-rose-300 text-sm font-bold px-4 py-1">
                      💕 Romeo
                    </span>
                    <p className={`text-sm text-center ${textColor} opacity-60`}>
                      Il tuo destino è legato a Giulietta. Se uno di voi viene eliminato, anche l'altro lo sarà.
                    </p>
                  </div>
                )}
                {specialRole === 'giulietta' && (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <span className="inline-block rounded-full bg-rose-400/20 border border-rose-300/30 text-rose-300 text-sm font-bold px-4 py-1">
                      💕 Giulietta
                    </span>
                    <p className={`text-sm text-center ${textColor} opacity-60`}>
                      Il tuo destino è legato a Romeo. Se uno di voi viene eliminato, anche l'altro lo sarà.
                    </p>
                  </div>
                )}
                {specialRole === 'riccio' && (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <span className="inline-block rounded-full bg-yellow-500/20 border border-yellow-400/30 text-yellow-400 text-sm font-bold px-4 py-1">
                      🦔 Il Riccio
                    </span>
                    <p className={`text-sm text-center ${textColor} opacity-60`}>
                      Se vieni eliminato, potrai scegliere un giocatore da eliminare con te.
                    </p>
                  </div>
                )}
                {specialRole === 'oracolo' && (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    <span className="inline-block rounded-full bg-purple-900/20 border border-purple-700/30 text-purple-400 text-sm font-bold px-4 py-1">
                      🔮 L'Oracolo
                    </span>
                    <p className={`text-sm text-center ${textColor} opacity-60`}>
                      Se vieni eliminato, potrai svelare il ruolo di un giocatore a tua scelta.
                    </p>
                  </div>
                )}
              </>
            )}
            </div>
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
        <p className="text-slate-400 text-sm">Solo {playerName} deve guardare</p>
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
