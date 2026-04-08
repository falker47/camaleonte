import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
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
  slotCost: number
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

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative glass-strong rounded-3xl w-full max-w-sm flex flex-col overflow-hidden max-h-[80vh]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h3 className="text-white font-bold text-lg">Ruoli Speciali</h3>
            <p className="text-slate-500 text-xs mt-0.5">Rendono il gioco più imprevedibile</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Roles list */}
        <div className="flex flex-col gap-3 px-6 py-4 overflow-y-auto">
          {[...roles]
            .map(role => {
              const tooFewPlayers = playerCount < role.minPlayers
              const noSlotsLeft = !role.enabled && slotsRemaining < role.slotCost
              const locked = tooFewPlayers || noSlotsLeft
              const active = role.enabled && !tooFewPlayers
              return { role, locked, active }
            })
            .sort((a, b) => (a.locked === b.locked ? 0 : a.locked ? 1 : -1))
            .map(({ role, locked, active }) => (
              <motion.button
                key={role.id}
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={() => !locked && onToggle(role.id)}
                disabled={locked}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all border ${
                  locked
                    ? 'opacity-35 cursor-not-allowed border-white/5 bg-white/[0.03]'
                    : active
                      ? `${role.bgActive} ${role.borderActive}`
                      : `${role.bgBase} ${role.borderBase} hover:brightness-125`
                }`}
              >
                <span className="text-4xl shrink-0">{role.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-bold">{role.label}</p>
                  <span className="text-slate-500 text-[10px] -mt-0.5 block">Min. {role.minPlayers} giocatori</span>
                  <p className="text-slate-400 text-xs mt-0.5">{role.description}</p>
                </div>
                <div className={`w-12 h-7 rounded-full transition-colors shrink-0 flex items-center ${
                  active ? role.toggleColor : 'bg-white/10'
                }`}>
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ x: active ? 22 : 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />
                </div>
              </motion.button>
            ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-1">
          <motion.button
            onClick={onClose}
            className="w-full glass-button font-semibold py-3.5 rounded-2xl text-sm"
            {...springTap}
          >
            {activeCount > 0 ? `Conferma (${activeCount} attiv${activeCount === 1 ? 'o' : 'i'})` : 'Chiudi'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}
