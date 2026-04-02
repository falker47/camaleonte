import { motion } from 'framer-motion'
import type { Player } from '../store/types'

interface Props {
  players: Player[]
  votes: Record<string, number>
  voterCount: number
  onVote: (targetId: string) => void
  disabled?: boolean
}

const AVATAR_COLORS = [
  'from-indigo-500 to-indigo-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700',
  'from-rose-500 to-rose-700',
  'from-cyan-500 to-cyan-700',
  'from-purple-500 to-purple-700',
  'from-pink-500 to-pink-700',
  'from-lime-500 to-lime-700',
  'from-orange-500 to-orange-700',
  'from-teal-500 to-teal-700',
  'from-fuchsia-500 to-fuchsia-700',
  'from-sky-500 to-sky-700',
]

export default function VoteGrid({ players, votes, voterCount, onVote, disabled }: Props) {
  const active = players.filter(p => !p.eliminated)
  const maxVotes = Math.max(0, ...Object.values(votes))

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {active.map((player, idx) => {
        const voteCount = votes[player.id] ?? 0
        const pct = voterCount > 0 ? (voteCount / voterCount) * 100 : 0
        const isLeading = voteCount > 0 && voteCount === maxVotes
        const initial = player.name.charAt(0).toUpperCase()
        const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]

        return (
          <motion.button
            key={player.id}
            onClick={() => !disabled && onVote(player.id)}
            className={`relative overflow-hidden rounded-2xl p-4 text-left min-h-[88px] flex items-center gap-3
              ${voteCount > 0
                ? isLeading
                  ? 'glass border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                  : 'glass border-rose-500/30'
                : 'glass hover:border-white/15'
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

            {/* Avatar */}
            <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md`}>
              {initial}
            </div>

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
