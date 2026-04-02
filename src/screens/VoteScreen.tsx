import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import VoteGrid from '../components/VoteGrid'

export default function VoteScreen() {
  const players = useGameStore(s => s.players)
  const castVote = useGameStore(s => s.castVote)
  const goTo = useGameStore(s => s.goTo)

  const active = players.filter(p => !p.eliminated)
  const voterCount = active.length

  const [votes, setVotes] = useState<Record<string, number>>({})
  const [voteHistory, setVoteHistory] = useState<string[]>([]) // track order for undo
  const [tieBreak, setTieBreak] = useState<string[] | null>(null)

  const totalVotesCast = Object.values(votes).reduce((a, b) => a + b, 0)
  const votersLeft = voterCount - totalVotesCast
  const allVoted = totalVotesCast >= voterCount
  const progress = voterCount > 0 ? (totalVotesCast / voterCount) * 100 : 0

  const handleVote = (targetId: string) => {
    if (votersLeft <= 0) return
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

  const handleConfirm = () => {
    const maxVotes = Math.max(...Object.values(votes))
    const tied = Object.entries(votes)
      .filter(([, v]) => v === maxVotes)
      .map(([id]) => id)

    if (tied.length > 1) {
      setTieBreak(tied)
      setVotes({})
      setVoteHistory([])
    } else {
      castVote(votes)
    }
  }

  const handleTieConfirm = () => {
    const maxVotes = Math.max(...Object.values(votes))
    const tied = Object.entries(votes)
      .filter(([, v]) => v === maxVotes)
      .map(([id]) => id)

    if (tied.length > 1) {
      const eliminated = tied
        .map(id => active.find(p => p.id === id)!)
        .sort((a, b) => a.name.localeCompare(b.name))[0]
      castVote({ [eliminated.id]: 1 })
    } else {
      castVote(votes)
    }
  }

  const tiePlayers = tieBreak
    ? active.filter(p => tieBreak.includes(p.id))
    : null

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => goTo('round')}
          className="text-slate-400 hover:text-white p-1 transition-colors"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white">
            {tieBreak ? 'Pareggio! Ri-voto' : 'Chi eliminare?'}
          </h2>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="h-2 bg-white/5 rounded-full border border-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              allVoted ? 'bg-rose-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-slate-400 text-xs">
            {allVoted
              ? 'Tutti hanno votato!'
              : `${votersLeft} ${votersLeft === 1 ? 'voto rimasto' : 'voti rimasti'}`
            }
          </p>
          <div className="flex gap-3">
            {voteHistory.length > 0 && (
              <button
                onClick={() => { setVotes({}); setVoteHistory([]) }}
                className="text-rose-400 hover:text-rose-300 text-xs font-medium transition-colors"
              >
                Azzera tutto
              </button>
            )}
            {voteHistory.length > 0 && !allVoted && (
              <button
                onClick={handleUndo}
                className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
              >
                Annulla ultimo
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

      {/* Grid */}
      <VoteGrid
        players={tieBreak ? tiePlayers! : active}
        votes={votes}
        voterCount={voterCount}
        onVote={handleVote}
        disabled={votersLeft <= 0}
      />

      {/* Confirm button */}
      <button
        onClick={tieBreak ? handleTieConfirm : handleConfirm}
        disabled={!allVoted}
        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
          allVoted
            ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-[0_0_32px_rgba(244,63,94,0.3)]'
            : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
        }`}
      >
        {tieBreak ? 'Conferma eliminazione' : 'Elimina il pi\u00f9 votato'}
      </button>
    </div>
  )
}
