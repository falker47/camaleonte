import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { springTap } from '../constants/animations'

interface SpecialRoleConfig {
  id: string
  label: string
  emoji: string
  description: string
  bgBase: string
  bgActive: string
  borderBase: string
  borderActive: string
  toggleColor: string
  enabled: boolean
  minPlayers: number
  slotCost?: number
}

interface Props {
  roles: SpecialRoleConfig[]
  playerCount: number
  slotsRemaining: number
  onToggle: (id: string) => void
  onClose: () => void
}

export default function SpecialRolesOverlay({ roles, playerCount, slotsRemaining, onToggle, onClose }: Props) {
  const activeCount = roles.filter(r => r.enabled && playerCount >= r.minPlayers).length
  const reduceMotion = useReducedMotion()
  const [feedback, setFeedback] = useState<string | null>(null)
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (feedbackTimeout.current !== null) clearTimeout(feedbackTimeout.current)
  }, [])

  const showFeedback = (message: string) => {
    if (feedbackTimeout.current !== null) clearTimeout(feedbackTimeout.current)
    setFeedback(message)
    feedbackTimeout.current = setTimeout(() => {
      setFeedback(null)
      feedbackTimeout.current = null
    }, 2200)
  }

  const handleRolePress = (role: SpecialRoleConfig) => {
    if (playerCount < role.minPlayers) {
      showFeedback(`Servono almeno ${role.minPlayers} giocatori per attivare ${role.label}.`)
      return
    }
    if (!role.enabled && slotsRemaining < (role.slotCost ?? 1)) {
      showFeedback(`Non ci sono abbastanza slot liberi per ${role.label}.`)
      return
    }

    if (feedbackTimeout.current !== null) clearTimeout(feedbackTimeout.current)
    feedbackTimeout.current = null
    setFeedback(null)
    onToggle(role.id)
  }

  const sortedRoles = [...roles].sort((a, b) => {
    const aLocked = playerCount < a.minPlayers ? 1 : 0
    const bLocked = playerCount < b.minPlayers ? 1 : 0
    return aLocked - bLocked
  })

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-3"
      onClick={onClose}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="special-roles-title"
        className="relative isolate flex max-h-[85dvh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-teal-200/25 bg-[#162b3b] shadow-[0_22px_72px_rgba(0,0,0,0.60)]"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.14 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Lightweight, static tropical accents; no fullscreen filters or scaling. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-teal-400/15 via-cyan-300/[0.04] to-transparent" />
        <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-16 w-full opacity-30" viewBox="0 0 400 72" preserveAspectRatio="none">
          <path d="M-20 0 Q200 82 420 0" fill="none" stroke="#a7f3d0" strokeWidth="1.5" />
          <path d="M34 15l18 5-12 22z" fill="#4ade80" />
          <path d="M105 32l18 3-11 23z" fill="#fbbf24" />
          <path d="M183 39l18 0-9 24z" fill="#a78bfa" />
          <path d="M270 30l19-4-4 25z" fill="#22d3ee" />
          <path d="M350 13l19-6-2 25z" fill="#f472b6" />
        </svg>
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-5 pb-3 pt-6">
          <div>
            <h3 id="special-roles-title" className="text-lg font-bold text-white">Ruoli Speciali</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-300">Rendono il gioco più imprevedibile</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-bold text-slate-200 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-teal-300"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Roles list */}
        <div className="relative z-10 flex min-h-0 flex-col gap-2.5 overflow-y-auto overscroll-contain px-4 py-3">
          {sortedRoles.map(role => {
            const locked = playerCount < role.minPlayers
            const active = role.enabled && !locked
            const noSlots = !active && slotsRemaining < (role.slotCost ?? 1)
            const disabled = locked || noSlots
            return (
              <button
                key={role.id}
                type="button"
                aria-pressed={active}
                aria-disabled={disabled}
                onClick={() => handleRolePress(role)}
                className={`relative isolate flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-2.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 ${disabled
                  ? 'border-white/10 bg-slate-900/65'
                  : active
                    ? `${role.borderActive} bg-slate-700/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]`
                    : `${role.borderBase} bg-slate-800/85 hover:border-teal-200/40 hover:bg-slate-700/85`
                  }`}
              >
                <span aria-hidden="true" className={`pointer-events-none absolute inset-0 ${role.bgActive} ${disabled ? 'opacity-20' : active ? 'opacity-80' : 'opacity-60'}`} />
                <span aria-hidden="true" className={`pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full ${role.toggleColor} ${disabled ? 'opacity-30' : active ? 'opacity-100' : 'opacity-65'}`} />
                <span aria-hidden="true" className={`relative z-10 shrink-0 text-3xl ${disabled ? 'saturate-75 opacity-75' : ''}`}>{role.emoji}</span>
                <div className="relative z-10 min-w-0 flex-1">
                  <p className={`text-base font-bold leading-tight ${disabled ? 'text-slate-200' : 'text-white'}`}>{role.label}</p>
                  <p className={`mt-0.5 text-[11px] font-medium leading-tight ${disabled ? 'text-amber-200/75' : 'text-slate-400'}`}>
                    {locked ? `Minimo ${role.minPlayers} giocatori` : noSlots ? 'Slot insufficienti' : `Min. ${role.minPlayers} giocatori`}
                  </p>
                  <p className={`mt-1 text-[13px] leading-snug ${disabled ? 'text-slate-400' : 'text-slate-200'}`}>{role.description}</p>
                </div>
                <div aria-hidden="true" className={`relative z-10 flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${active ? role.toggleColor : disabled ? 'bg-slate-500/15 opacity-65' : 'bg-slate-400/25'}`}>
                  <motion.div
                    className="h-5 w-5 rounded-full bg-white shadow-md"
                    animate={{ x: active ? 22 : 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="relative z-10 shrink-0 border-t border-white/10 bg-slate-950/35 px-5 pb-5 pt-3">
          <motion.button
            onClick={onClose}
            className="w-full glass-button font-semibold py-3.5 rounded-2xl text-sm"
            {...springTap}
          >
            {activeCount > 0 ? `Conferma (${activeCount} attiv${activeCount === 1 ? 'o' : 'i'})` : 'Chiudi'}
          </motion.button>
        </div>
        {/* Explain locked roles without shifting the list or the CTA. */}
        <div role="status" aria-live="polite" aria-atomic="true" className="pointer-events-none absolute bottom-[86px] left-4 right-4 z-20">
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.p
                key={feedback}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.15 }}
                className="rounded-xl border border-amber-300/35 bg-slate-950/95 px-3 py-2.5 text-center text-xs font-semibold leading-snug text-amber-100 shadow-lg"
              >
                {feedback}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </div>,
    document.body
  )
}
