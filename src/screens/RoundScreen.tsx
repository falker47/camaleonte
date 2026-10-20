import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { AVATAR_COLORS } from '../constants/avatarColors'
import { springTap } from '../constants/animations'
import { ROLE_BORDER_COLORS, ROLE_AVATAR_BG } from '../constants/roleColors'
import { getSurvivalThreshold } from '../utils/winCondition'
import { formatMancheProgress } from '../utils/gameDuration'
import { vibrate } from '../utils/vibrate'
import LastChanceOverlay from '../components/LastChanceOverlay'
import talpaPng from '../assets/talpa.png'
import camaleontePng from '../assets/camaleonte.png'

export default function RoundScreen() {
  const players = useGameStore(s => s.players)
  const turno = useGameStore(s => s.turno)
  const manche = useGameStore(s => s.manche)
  const config = useGameStore(s => s.config)
  const goTo = useGameStore(s => s.goTo)
  const castVote = useGameStore(s => s.castVote)
  const voteSession = useGameStore(s => s.voteSession)
  const setVoteSession = useGameStore(s => s.setVoteSession)
  const oracoloRevealedIds = useGameStore(s => s.oracoloRevealedIds)

  const active = players.filter(p => !p.eliminated)
  const eliminated = players.filter(p => p.eliminated)
  const eliminatedSpettro = players.find(p => p.eliminated && p.specialRole === 'spettro')
  const voterCount = active.length + (eliminatedSpettro ? 1 : 0)
  const { votes, voteHistory } = voteSession
  const totalVotesCast = Object.values(votes).reduce((sum, count) => sum + count, 0)
  const votersLeft = voterCount - totalVotesCast
  const allVoted = totalVotesCast >= voterCount

  const isLastChance = active.length === getSurvivalThreshold(players.length) + 1
  const [showOverlay, setShowOverlay] = useState(isLastChance)
  const dismissOverlay = useCallback(() => setShowOverlay(false), [])

  const civili = active.filter(p => p.role === 'civile').length
  const camaleonti = active.filter(p => p.role === 'camaleonte').length
  const talpe = active.filter(p => p.role === 'talpa').length

  const handleVote = (targetId: string) => {
    if (votersLeft <= 0) return
    vibrate()
    setVoteSession(session => ({
      ...session,
      votes: { ...session.votes, [targetId]: (session.votes[targetId] ?? 0) + 1 },
      voteHistory: [...session.voteHistory, targetId],
    }))
  }

  const handleUndoVote = () => {
    if (voteHistory.length === 0) return
    const lastId = voteHistory[voteHistory.length - 1]
    setVoteSession(session => {
      const nextVotes = { ...session.votes }
      nextVotes[lastId] = (nextVotes[lastId] ?? 1) - 1
      if (nextVotes[lastId] <= 0) delete nextVotes[lastId]

      return {
        ...session,
        votes: nextVotes,
        voteHistory: session.voteHistory.slice(0, -1),
      }
    })
  }

  const resolveVotes = () => {
    if (!allVoted) return

    const maxVotes = Math.max(0, ...Object.values(votes))
    const tied = Object.entries(votes)
      .filter(([, count]) => count === maxVotes)
      .map(([id]) => id)

    if (tied.length <= 1) {
      castVote(votes)
      return
    }

    // The normal vote stays on this screen; only a tie needs the dedicated re-vote flow.
    goTo('vote')
    setVoteSession({
      tieBreakIds: tied,
      pendingDrawIds: null,
      randomPickId: null,
      votes: {},
      voteHistory: [],
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-5 overflow-y-auto">
      <AnimatePresence>
        {showOverlay && <LastChanceOverlay onDismiss={dismissOverlay} />}
      </AnimatePresence>

      <div>
        <p className="text-teal-400/80 text-xs font-semibold mb-1">{formatMancheProgress(manche, players.length, config.duration)}</p>
        <h2 className="text-2xl font-black text-white">Turno {turno}</h2>
        <p className="text-slate-400 text-sm">Ogni giocatore dà un indizio</p>
      </div>

      {turno === 1 && players.some(p => p.specialRole === 'romeo' || p.specialRole === 'giulietta') && (
        <div className="glass rounded-xl px-4 py-3 border border-pink-400/20">
          <p className="text-pink-400 text-sm font-semibold">💕 Romeo e Giulietta sono in gioco!</p>
          <p className="text-slate-400 text-xs mt-1">Due giocatori sono legati: se uno cade, cade anche l'altro.</p>
        </div>
      )}

      {active.some(p => p.specialRole === 'riccio') && isLastChance && (
        <div className="glass rounded-xl px-4 py-3 border border-yellow-400/20">
          <p className="text-yellow-400 text-sm font-semibold">🦔 Il Riccio potrebbe ribaltare tutto!</p>
          <p className="text-slate-400 text-xs mt-1">Se eliminato, potrà trascinare un altro giocatore con sé.</p>
        </div>
      )}

      {isLastChance && (
        <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
          style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <span className="text-lg">⚠</span>
          <div>
            <p className="text-red-500 font-bold text-[13px]">Ultima possibilità</p>
            <p className="text-red-400/70 text-[11px]">Un errore e gli impostori vincono</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <div className="glass rounded-xl px-3 py-2 text-center flex-1">
          <p className="text-indigo-400 font-bold text-lg">{civili}</p>
          <p className="text-slate-500 text-xs">civili</p>
        </div>
        {camaleonti > 0 && (
          <div className="glass rounded-xl px-3 py-2 text-center flex-1">
            <p className="text-teal-400 font-bold text-lg">{camaleonti}</p>
            <p className="text-slate-500 text-xs">camaleont{camaleonti === 1 ? 'e' : 'i'}</p>
          </div>
        )}
        {talpe > 0 && (
          <div className="glass rounded-xl px-3 py-2 text-center flex-1">
            <p className="text-orange-500 font-bold text-lg">{talpe}</p>
            <p className="text-slate-500 text-xs">talp{talpe === 1 ? 'a' : 'e'}</p>
          </div>
        )}
      </div>

      {/* Active players — the first vote now happens directly here. */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Giocatori in gioco
          </p>
          <div className="flex items-center gap-2">
            {voteHistory.length > 0 && (
              <button
                onClick={handleUndoVote}
                className="text-amber-400/80 hover:text-amber-300 text-[11px] font-semibold transition-colors"
              >
                ↩ Annulla
              </button>
            )}
            <span className={`text-[11px] font-semibold ${allVoted ? 'text-rose-300' : 'text-slate-500'}`}>
              {totalVotesCast}/{voterCount} voti
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {active.map((player) => {
            const originalIndex = players.indexOf(player)
            const isRevealed = oracoloRevealedIds.includes(player.id)
            const voteCount = votes[player.id] ?? 0
            return (
              <motion.button
                key={player.id}
                type="button"
                onClick={() => handleVote(player.id)}
                disabled={allVoted}
                aria-label={`Vota ${player.name}`}
                className={`flex items-center gap-3 glass rounded-2xl px-4 py-3 text-left transition-all ${isRevealed ? ROLE_BORDER_COLORS[player.role] : ''} ${voteCount > 0 ? 'ring-1 ring-rose-400/50 bg-rose-500/[0.06]' : 'hover:border-white/15'}`}
                {...(!allVoted ? springTap : {})}
              >
                {isRevealed ? (
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${ROLE_AVATAR_BG[player.role]} flex items-center justify-center shrink-0`}>
                    {player.role === 'camaleonte' ? (
                      <img src={camaleontePng} alt="" className="w-5 h-5" />
                    ) : player.role === 'talpa' ? (
                      <img src={talpaPng} alt="" className="w-5 h-5" />
                    ) : (
                      <span className="text-sm">😇</span>
                    )}
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[originalIndex % AVATAR_COLORS.length]} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                    {originalIndex + 1}
                  </div>
                )}
                <span className="text-white font-medium flex-1">{player.name}</span>
                {voteCount > 0 && (
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {voteCount}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
            Eliminati ({eliminated.length})
          </span>
          <span className="text-slate-600">·</span>
          {eliminated.map((player, i) => (
            <span key={player.id} className={`flex items-center gap-1 text-sm ${
              player.specialRole === 'spettro' ? 'text-cyan-400' : 'text-slate-500'
            }`}>
              {player.specialRole !== 'spettro' && <span className="text-xs">✕</span>}
              {player.specialRole === 'spettro' && <span className="text-xs">🎐</span>}
              <span className={player.specialRole === 'spettro' ? '' : 'line-through'}>{player.name}</span>
              {player.specialRole === 'spettro' && <span className="text-[10px] text-cyan-400/70">vota ancora</span>}
              {i < eliminated.length - 1 && <span className="text-slate-700">,</span>}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto">
        <p className={`text-sm text-center mb-4 ${isLastChance ? 'text-red-400/70' : 'text-slate-400'}`}>
          {allVoted
            ? 'Votazione completa — conferma per continuare'
            : isLastChance
              ? 'Scegliete bene — toccate un giocatore per votarlo'
              : 'Dopo gli indizi, toccate un giocatore per assegnare ciascun voto'}
        </p>
        <motion.button
          onClick={resolveVotes}
          disabled={!allVoted}
          className={`w-full font-bold py-5 rounded-2xl text-lg transition-all ${
            allVoted
              ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-[0_8px_32px_rgba(244,63,94,0.3)]'
              : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
          {...(allVoted ? springTap : {})}
        >
          Conferma votazione
        </motion.button>
      </div>
    </div>
  )
}
