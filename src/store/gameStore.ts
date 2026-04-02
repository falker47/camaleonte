import { create } from 'zustand'
import type { Screen, Player, WordPair, GameConfig } from './types'
import { wordPairs } from '../data/wordPairs'
import { shuffle } from '../utils/shuffle'
import { assignRoles } from '../utils/assignRoles'
import { checkWinCondition } from '../utils/winCondition'

function calcFinalScores(
  players: Player[],
  winner: 'civilians' | 'last_two',
  mrWhiteCorrectIds: Set<string>,
  prevScores: Record<string, number>
): { scores: Record<string, number>; roundScores: Record<string, number> } {
  const roundScores: Record<string, number> = {}
  const scores = { ...prevScores }
  const mwPoisoned = mrWhiteCorrectIds.size > 0

  for (const p of players) {
    let pts = 0

    if (winner === 'civilians') {
      if (p.role === 'civile' && !mwPoisoned) pts = 2
      // MW that guessed correctly already got 6pt live — show in roundScores
      if (p.role === 'mrwhite' && mrWhiteCorrectIds.has(p.id)) pts = 6
    }

    if (winner === 'last_two') {
      if (p.role === 'mrwhite' && !p.eliminated) pts = 6
      if (p.role === 'infiltrato' && !p.eliminated) pts = 5
      // MW that guessed correctly (but were eliminated) already got 6pt live
      if (p.role === 'mrwhite' && p.eliminated && mrWhiteCorrectIds.has(p.id)) pts = 6
    }

    roundScores[p.name] = pts
    scores[p.name] = (scores[p.name] ?? 0) + pts
  }

  return { scores, roundScores }
}

interface GameState {
  screen: Screen
  playerNames: string[]
  config: GameConfig
  players: Player[]
  wordPair: WordPair | null
  dealIndex: number
  round: number
  currentVotes: Record<string, number>
  eliminatedThisRound: Player | null
  mrWhiteGuessResult: 'correct' | 'wrong' | null
  mrWhiteCorrectIds: string[]
  winner: 'civilians' | 'last_two' | null
  scores: Record<string, number>
  roundScores: Record<string, number>

  goTo: (screen: Screen) => void
  setPlayerNames: (names: string[]) => void
  setConfig: (config: GameConfig) => void
  startGame: () => void
  advanceDeal: () => void
  castVote: (votes: Record<string, number>) => void
  confirmElimination: () => void
  submitMrWhiteGuess: (guess: string) => void
  nextRound: () => void
  resetGame: () => void
  rematch: () => void
  resetScores: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'home',
  playerNames: [],
  config: { mrWhiteCount: 1, infiltratoCount: 0 },
  players: [],
  wordPair: null,
  dealIndex: 0,
  round: 1,
  currentVotes: {},
  eliminatedThisRound: null,
  mrWhiteGuessResult: null,
  mrWhiteCorrectIds: [],
  winner: null,
  scores: {},
  roundScores: {},

  goTo: (screen) => set({ screen }),

  setPlayerNames: (names) => set({ playerNames: names }),

  setConfig: (config) => set({ config }),

  startGame: () => {
    const { playerNames, config } = get()
    const shuffledPairs = shuffle(wordPairs)
    const pair = shuffledPairs[0]
    const players = assignRoles(playerNames, config, pair)
    set({
      players,
      wordPair: pair,
      dealIndex: 0,
      round: 1,
      currentVotes: {},
      eliminatedThisRound: null,
      mrWhiteGuessResult: null,
      mrWhiteCorrectIds: [],
      winner: null,
      roundScores: {},
      screen: 'deal',
    })
  },

  advanceDeal: () => {
    const { dealIndex, players } = get()
    const next = dealIndex + 1
    if (next >= players.length) {
      set({ screen: 'round' })
    } else {
      set({ dealIndex: next })
    }
  },

  castVote: (votes) => {
    const { players } = get()
    let maxVotes = 0
    let eliminated: Player | null = null
    for (const [id, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count
        eliminated = players.find(p => p.id === id) ?? null
      }
    }
    set({ currentVotes: votes, eliminatedThisRound: eliminated, screen: 'elimination' })
  },

  confirmElimination: () => {
    const { eliminatedThisRound, players, wordPair, scores, mrWhiteCorrectIds } = get()
    if (!eliminatedThisRound) return

    const updatedPlayers = players.map(p =>
      p.id === eliminatedThisRound.id ? { ...p, eliminated: true } : p
    )
    set({ players: updatedPlayers })

    if (eliminatedThisRound.role === 'mrwhite' && wordPair) {
      set({ screen: 'mrwhite_guess', mrWhiteGuessResult: null })
      return
    }

    const win = checkWinCondition(updatedPlayers)
    if (win) {
      const correctSet = new Set(mrWhiteCorrectIds)
      const { scores: newScores, roundScores } = calcFinalScores(updatedPlayers, win, correctSet, scores)
      set({ winner: win, scores: newScores, roundScores, screen: 'result' })
    } else {
      set({ screen: 'round', round: get().round + 1, currentVotes: {} })
    }
  },

  submitMrWhiteGuess: (guess) => {
    const { wordPair, players, scores, mrWhiteCorrectIds, eliminatedThisRound } = get()
    if (!wordPair || !eliminatedThisRound) return

    const normalize = (s: string) =>
      s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    const isCorrect = normalize(guess) === normalize(wordPair.civilian)

    if (isCorrect) {
      // Track this MW — points will be awarded by calcFinalScores at game end
      const mwId = eliminatedThisRound.id
      const newCorrectIds = [...mrWhiteCorrectIds, mwId]

      set({ mrWhiteGuessResult: 'correct', mrWhiteCorrectIds: newCorrectIds })

      // Check if game is over
      const win = checkWinCondition(players)
      if (win) {
        // calcFinalScores will include the MW 6pt in roundScores
        const correctSet = new Set(newCorrectIds)
        const { scores: finalScores, roundScores } = calcFinalScores(players, win, correctSet, scores)
        set({ winner: win, scores: finalScores, roundScores, screen: 'result' })
      }
      // If not over, GuessScreen shows "correct" + continue button
    } else {
      set({ mrWhiteGuessResult: 'wrong' })

      const win = checkWinCondition(players)
      if (win) {
        const correctSet = new Set(mrWhiteCorrectIds)
        const { scores: newScores, roundScores } = calcFinalScores(players, win, correctSet, scores)
        set({ winner: win, scores: newScores, roundScores, screen: 'result' })
      }
      // If not over, GuessScreen shows "wrong" + continue button
    }
  },

  nextRound: () => {
    set({ screen: 'round', round: get().round + 1, currentVotes: {} })
  },

  resetGame: () => {
    set({
      screen: 'home',
      players: [],
      wordPair: null,
      dealIndex: 0,
      round: 1,
      currentVotes: {},
      eliminatedThisRound: null,
      mrWhiteGuessResult: null,
      mrWhiteCorrectIds: [],
      winner: null,
      roundScores: {},
    })
  },

  rematch: () => {
    get().startGame()
  },

  resetScores: () => {
    set({ scores: {} })
  },
}))
