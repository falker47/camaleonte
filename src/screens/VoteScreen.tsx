import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import type { Player } from '../store/types'
import VoteGrid from '../components/VoteGrid'
import BackButton from '../components/BackButton'
import { vibrate } from '../utils/vibrate'
import { springTap } from '../constants/animations'

export default function VoteScreen() {
  const players = useGameStore(s => s.players)
  const castVote = useGameStore(s => s.castVote)
  const goTo = useGameStore(s => s.goTo)

  const active = players.filter(p => !p.eliminated)
  const eliminatedSpettro = players.find(p => p.eliminated && p.specialRole === 'spettro')
  const voterCount = active.length + (eliminatedSpettro ? 1 : 0)

  const [votes, setVotes] = useState<Record<string, number>>({})
  const [voteHistory, setVoteHistory] = useState<string[]>([]) // track order for undo
  const [tieBreak, setTieBreak] = useState<string[] | null>(null)
  const [pendingDraw, setPendingDraw] = useState<Player[] | null>(null)
  const [randomPick, setRandomPick] = useState<Player | null>(null)

  const totalVotesCast = Object.values(votes).reduce((a, b) => a + b, 0)
  const votersLeft = voterCount - totalVotesCast
  const allVoted = totalVotesCast >= voterCount
  const progress = voterCount > 0 ? (totalVotesCast / voterCount) * 100 : 0

  const handleVote = (targetId: string) => {
    if (votersLeft <= 0) return
    vibrate()
    setVotes(v => ({ ...v, [targetId]: (v[targetId] ?? 0) + 1 }))
    setVoteHistory(h => [...h, targetId])
  }

  const handleUndo = () => {
    if (voteHistory.length === 0) return
    const lastId = voteHistory[voteHistory.length - 1]
    setVoteHistory(h => h.slice(0, -1))
    setVotes(v => {
      const next = { ...v }
      next[lastId] = (next[lastId] ?? 1) - 1
      if (next[lastId] <= 0) delete next[lastId]
      return next
    })
  }

  const resolveVotes = () => {
    const maxVotes = Math.max(...Object.values(votes))
    const tied = Object.entries(votes)
      .filter(([, v]) => v === maxVotes)
      .map(([id]) => id)

    if (tied.length <= 1) {
      castVote(votes)
      return
    }

    // First tie → re-vote among tied players
    if (!tieBreak) {
      setTieBreak(tied)
    } else {
      // Second tie → go to random draw
      const tiedPlayers = tied
        .map(id => active.find(p => p.id === id))
        .filter((p): p is Player => p !== undefined)
      if (tiedPlayers.length === 0) return
      setPendingDraw(tiedPlayers)
    }
    setVotes({})
    setVoteHistory([])
  }

  const handleDraw = () => {
    if (!pendingDraw || pendingDraw.length === 0) return
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    const idx = arr[0] % pendingDraw.length
    setRandomPick(pendingDraw[idx])
  }

  const handleDrawConfirm = () => {
    if (!randomPick) return
    castVote({ [randomPick.id]: 1 })
  }

  const tiePlayers = tieBreak
    ? active.filter(p => tieBreak.includes(p.id))
    : null

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BackButton onClick={() => goTo('round')} />
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white">
            {tieBreak ? 'Pareggio! Ri-voto' : 'Chi eliminare?'}
          </h2>
        </div>
      </div>

      {/* Draw flow — replaces voting UI when active */}
      {pendingDraw && !randomPick && (
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          <div className="glass rounded-2xl px-6 py-5 text-center w-full" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
            <p className="text-amber-400 font-bold text-lg mb-2">Ancora parità!</p>
            <p className="text-slate-300 text-sm">
              Parità tra {pendingDraw.map(p => p.name).join(' e ')}.
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Verrà sorteggiato un giocatore da eliminare.
            </p>
          </div>
          <motion.button
            onClick={handleDraw}
            className="w-full py-5 rounded-2xl font-bold text-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black transition-colors shadow-[0_8px_32px_rgba(245,158,11,0.3)]"
            {...springTap}
          >
            Sorteggia
          </motion.button>
        </div>
      )}

      {randomPick && (
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          <div className="glass rounded-2xl px-6 py-5 text-center w-full" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}>
            <p className="text-3xl mb-3">🎲</p>
            <p className="text-rose-300 font-bold text-lg">{randomPick.name}</p>
            <p className="text-slate-400 text-sm mt-1">è stato estratto a sorte!</p>
          </div>
          <motion.button
            onClick={handleDrawConfirm}
            className="w-full py-5 rounded-2xl font-bold text-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white transition-colors shadow-[0_0_32px_rgba(244,63,94,0.3)]"
            {...springTap}
          >
            Continua
          </motion.button>
        </div>
      )}

      {/* Normal voting flow */}
      {!pendingDraw && !randomPick && (<>
        {/* Progress bar */}
        <div className="flex flex-col gap-2">
          <div className="h-2 bg-white/5 rounded-full border border-white/5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${allVoted ? 'bg-rose-500' : 'bg-indigo-500'}`}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-baseline gap-1">
              <span className="text-white font-black text-lg">{totalVotesCast}/{voterCount}</span>
              <span className="text-slate-500 text-xs">
                {allVoted ? 'tutti votato!' : 'voti'}
              </span>
            </div>
            <div className="flex gap-2">
              {voteHistory.length > 0 && (
                <button
                  onClick={() => { setVotes({}); setVoteHistory([]) }}
                  className="glass rounded-full px-3 py-1.5 text-rose-400 hover:text-rose-300 text-xs font-medium transition-colors"
                >
                  Azzera
                </button>
              )}
              {voteHistory.length > 0 && !allVoted && (
                <button
                  onClick={handleUndo}
                  className="glass rounded-full px-3 py-1.5 text-amber-400 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>↩</span> Annulla
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tie info */}
        {tieBreak && (
          <p className="text-amber-400 text-sm glass rounded-xl px-4 py-2" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
            Pareggio tra {tiePlayers!.map(p => p.name).join(' e ')}. Votate di nuovo.
          </p>
        )}

        {/* Spettro banner */}
        {eliminatedSpettro && (
          <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
            style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
            <span className="text-lg">🎐</span>
            <div>
              <p className="text-cyan-400 font-bold text-[13px]">
                {eliminatedSpettro.name} vota dall'aldilà
              </p>
              <p className="text-cyan-400/60 text-[11px]">
                Lo Spettro ha ancora 1 voto
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        <VoteGrid
          players={tieBreak ? tiePlayers! : active}
          votes={votes}
          voterCount={voterCount}
          onVote={handleVote}
          disabled={votersLeft <= 0}
        />

        {/* Confirm button */}
        <motion.button
          onClick={resolveVotes}
          disabled={!allVoted}
          className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
            allVoted
              ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-[0_0_32px_rgba(244,63,94,0.3)]'
              : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
          animate={allVoted ? {
            boxShadow: [
              '0 0 20px rgba(244,63,94,0.2)',
              '0 0 40px rgba(244,63,94,0.4)',
              '0 0 20px rgba(244,63,94,0.2)',
            ],
          } : {}}
          transition={allVoted ? { duration: 1.5, repeat: Infinity } : {}}
          whileHover={allVoted ? { scale: 1.02 } : {}}
          whileTap={allVoted ? { scale: 0.97 } : {}}
        >
          {tieBreak ? 'Conferma eliminazione' : 'Elimina il pi\u00f9 votato'}
        </motion.button>
      </>)}
    </div>
  )
}
