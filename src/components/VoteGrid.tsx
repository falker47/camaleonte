import { motion } from 'framer-motion'
import type { Player, Role } from '../store/types'
import { AVATAR_COLORS } from '../constants/avatarColors'
import talpaPng from '../assets/talpa.png'
import camaleontePng from '../assets/camaleonte.png'

const ROLE_BORDER_COLORS: Record<Role, string> = {
  civile: 'border-indigo-400/50',
  talpa: 'border-orange-500/50',
  camaleonte: 'border-teal-400/50',
}

const ROLE_AVATAR_BG: Record<Role, string> = {
  civile: 'from-indigo-600 to-indigo-800',
  talpa: 'from-orange-700 to-orange-900',
  camaleonte: 'from-teal-600 to-teal-800',
}

interface Props {
  players: Player[]
  votes: Record<string, number>
  voterCount: number
  onVote: (targetId: string) => void
  disabled?: boolean
  revealedIds?: string[]
}

export default function VoteGrid({ players, votes, voterCount, onVote, disabled, revealedIds = [] }: Props) {
  const maxVotes = Math.max(0, ...Object.values(votes))

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {players.map((player, idx) => {
        const voteCount = votes[player.id] ?? 0
        const pct = voterCount > 0 ? (voteCount / voterCount) * 100 : 0
        const isLeading = voteCount > 0 && voteCount === maxVotes
        const initial = player.name.charAt(0).toUpperCase()
        const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]
        const isRevealed = revealedIds.includes(player.id)

        return (
          <motion.button
            key={player.id}
            onClick={() => !disabled && onVote(player.id)}
            className={`relative overflow-hidden rounded-2xl p-4 text-left min-h-[88px] flex items-center gap-3
              ${voteCount > 0
                ? isLeading
                  ? `glass ${isRevealed ? ROLE_BORDER_COLORS[player.role] : 'border-rose-400/60'} shadow-[0_0_20px_rgba(244,63,94,0.25)]`
                  : `glass ${isRevealed ? ROLE_BORDER_COLORS[player.role] : 'border-rose-500/30'}`
                : `glass ${isRevealed ? ROLE_BORDER_COLORS[player.role] : 'hover:border-white/15'}`
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            whileTap={disabled ? {} : { scale: 0.95 }}
            animate={isLeading ? {
              boxShadow: [
                '0 0 16px rgba(244,63,94,0.2)',
                '0 0 24px rgba(244,63,94,0.4)',
                '0 0 16px rgba(244,63,94,0.2)',
              ],
            } : {}}
            transition={isLeading ? { duration: 1.5, repeat: Infinity } : { type: 'spring', stiffness: 400, damping: 25 }}
          >
            {/* Vote fill bar — from bottom */}
            {voteCount > 0 && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-rose-500/15"
                animate={{ height: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
            )}

            {/* Tap flash */}
            {voteCount > 0 && (
              <motion.div
                key={`flash-${voteCount}`}
                className="absolute inset-0 rounded-2xl bg-white/10 pointer-events-none"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Avatar — role icon if revealed, initial otherwise */}
            {isRevealed ? (
              <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${ROLE_AVATAR_BG[player.role]} flex items-center justify-center shrink-0 shadow-md`}>
                {player.role === 'camaleonte' ? (
                  <img src={camaleontePng} alt="" className="w-6 h-6" />
                ) : player.role === 'talpa' ? (
                  <img src={talpaPng} alt="" className="w-6 h-6" />
                ) : (
                  <span className="text-lg">😇</span>
                )}
              </div>
            ) : (
              <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md`}>
                {initial}
              </div>
            )}

            {/* Name */}
            <span className="relative font-semibold text-white text-sm flex-1">
              {player.name}
            </span>

            {/* Vote badge */}
            {voteCount > 0 && (
              <motion.div
                key={voteCount}
                className={`relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isLeading ? 'bg-rose-500 text-white' : 'bg-rose-500/30 text-rose-200'
                }`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {voteCount}
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
