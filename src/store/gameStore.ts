import { create } from 'zustand'
import type { Screen, Player, WordPair, GameConfig } from './types'
import { wordPairs } from '../data/wordPairs'
import { shuffle } from '../utils/shuffle'
import { assignRoles } from '../utils/assignRoles'
import { checkWinCondition } from '../utils/winCondition'
import { isWordMatch } from '../utils/matchWord'

function getCamaleonteGuessPoints(totalPlayers: number): number {
  return totalPlayers <= 4 ? 4 : 3
}

function getCamaleonteSurvivalPoints(totalPlayers: number): number {
  if (totalPlayers <= 3) return 3
  if (totalPlayers <= 4) return 4
  return 5
}

function getTalpaWinPoints(totalPlayers: number): number {
  return totalPlayers <= 4 ? 3 : 5
}

function getTalpaPartialPoints(players: Player[]): number {
  const eliminatedCivili = players.filter(p => p.role === 'civile' && p.eliminated).length
  return Math.min(3, eliminatedCivili)
}

function calcFinalScores(
  players: Player[],
  winner: 'civilians' | 'last_two',
  camaleonteCorrectIds: Set<string>,
  prevScores: Record<string, number>
): { scores: Record<string, number>; roundScores: Record<string, number> } {
  const roundScores: Record<string, number> = {}
  const scores = { ...prevScores }
  const camaleontePoisoned = camaleonteCorrectIds.size > 0
  const totalPlayers = players.length

  for (const p of players) {
    let pts = 0

    if (winner === 'civilians') {
      if (p.role === 'civile' && !camaleontePoisoned) pts = 2
      if (p.role === 'camaleonte' && camaleonteCorrectIds.has(p.id)) pts = getCamaleonteGuessPoints(totalPlayers)
      // Talpa eliminata → punti parziali
      if (p.role === 'talpa' && p.eliminated) pts = getTalpaPartialPoints(players)
    }

    if (winner === 'last_two') {
      if (p.role === 'camaleonte' && !p.eliminated) pts = getCamaleonteSurvivalPoints(totalPlayers)
      if (p.role === 'talpa' && !p.eliminated) pts = getTalpaWinPoints(totalPlayers)
      // Camaleonte eliminato ma ha indovinato
      if (p.role === 'camaleonte' && p.eliminated && camaleonteCorrectIds.has(p.id)) pts = getCamaleonteGuessPoints(totalPlayers)
      // Talpa eliminata → punti parziali
      if (p.role === 'talpa' && p.eliminated) pts = getTalpaPartialPoints(players)
    }

    // Buffone bonus: +2 if eliminated in turno 1
    if (p.specialRole === 'buffone' && p.eliminatedInTurno === 1) pts += 2

    roundScores[p.name] = pts
    scores[p.name] = (scores[p.name] ?? 0) + pts
  }

  // Duellanti: trasferimento punti
  const duellanti = players.filter(p => p.specialRole === 'duellante')
  if (duellanti.length === 2) {
    const [a, b] = duellanti
    let loser: Player | null = null
    let winnerId: string | null = null

    if (a.eliminated && !b.eliminated) {
      loser = a; winnerId = b.id
    } else if (b.eliminated && !a.eliminated) {
      loser = b; winnerId = a.id
    } else if (a.eliminated && b.eliminated && a.eliminatedInTurno !== b.eliminatedInTurno) {
      loser = (a.eliminatedInTurno! < b.eliminatedInTurno!) ? a : b
      winnerId = loser === a ? b.id : a.id
    }

    if (loser && winnerId) {
      roundScores[loser.name] = (roundScores[loser.name] ?? 0) - 2
      scores[loser.name] = (scores[loser.name] ?? 0) - 2
      const winnerName = players.find(p => p.id === winnerId)!.name
      roundScores[winnerName] = (roundScores[winnerName] ?? 0) + 2
      scores[winnerName] = (scores[winnerName] ?? 0) + 2
    }
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
  turno: number
  currentVotes: Record<string, number>
  eliminatedThisTurno: Player | null
  linkedEliminatedThisTurno: Player | null
  camaleonteGuessResult: 'correct' | 'wrong' | null
  camaleonteCorrectIds: string[]
  winner: 'civilians' | 'last_two' | null
  scores: Record<string, number>
  roundScores: Record<string, number>
  usedPairIndices: number[]

  goTo: (screen: Screen) => void
  setPlayerNames: (names: string[]) => void
  setConfig: (config: GameConfig) => void
  startGame: () => void
  advanceDeal: () => void
  castVote: (votes: Record<string, number>) => void
  confirmElimination: () => void
  submitCamaleonteGuess: (guess: string) => void
  nextTurno: () => void
  invalidateRound: () => void
  resetGame: () => void
  rematch: () => void
  resetScores: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'home',
  playerNames: [],
  config: { camaleonteCount: 1, talpaCount: 0, specialRoles: {} },
  players: [],
  wordPair: null,
  dealIndex: 0,
  turno: 1,
  currentVotes: {},
  eliminatedThisTurno: null,
  linkedEliminatedThisTurno: null,
  camaleonteGuessResult: null,
  camaleonteCorrectIds: [],
  winner: null,
  scores: {},
  roundScores: {},
  usedPairIndices: [],

  goTo: (screen) => set({ screen }),

  setPlayerNames: (names) => set({ playerNames: names }),

  setConfig: (config) => set({ config }),

  startGame: () => {
    const { playerNames, config, usedPairIndices } = get()

    let available = wordPairs
      .map((pair, i) => ({ pair, i }))
      .filter(({ i }) => !usedPairIndices.includes(i))

    if (available.length === 0) {
      const lastUsed = usedPairIndices[usedPairIndices.length - 1]
      available = wordPairs
        .map((pair, i) => ({ pair, i }))
        .filter(({ i }) => i !== lastUsed)
    }

    const chosen = shuffle(available)[0]
    const raw = chosen.pair
    const pair = Math.random() < 0.5
      ? { ...raw, civilian: raw.undercover, undercover: raw.civilian }
      : raw
    const players = assignRoles(playerNames, config, pair)
    set({
      players,
      wordPair: pair,
      usedPairIndices: [...usedPairIndices, chosen.i],
      dealIndex: 0,
      turno: 1,
      currentVotes: {},
      eliminatedThisTurno: null,
      linkedEliminatedThisTurno: null,
      camaleonteGuessResult: null,
      camaleonteCorrectIds: [],
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
    set({ currentVotes: votes, eliminatedThisTurno: eliminated, screen: 'elimination' })
  },

  confirmElimination: () => {
    const { eliminatedThisTurno, players, wordPair, scores, camaleonteCorrectIds, turno } = get()
    if (!eliminatedThisTurno) return

    let updatedPlayers = players.map(p =>
      p.id === eliminatedThisTurno.id ? { ...p, eliminated: true, eliminatedInTurno: turno } : p
    )

    // Romeo & Giulietta linked elimination
    let linkedPartner: Player | null = null
    const sr = eliminatedThisTurno.specialRole
    if (sr === 'romeo' || sr === 'giulietta') {
      const partnerRole = sr === 'romeo' ? 'giulietta' : 'romeo'
      const partner = updatedPlayers.find(p => p.specialRole === partnerRole && !p.eliminated)
      if (partner) {
        linkedPartner = partner
        updatedPlayers = updatedPlayers.map(p =>
          p.id === partner.id ? { ...p, eliminated: true, eliminatedInTurno: turno } : p
        )
      }
    }

    set({ players: updatedPlayers, linkedEliminatedThisTurno: linkedPartner })

    // Voted camaleonte gets a guess first
    if (eliminatedThisTurno.role === 'camaleonte' && wordPair) {
      set({ screen: 'camaleonte_guess', camaleonteGuessResult: null })
      return
    }

    // Linked partner camaleonte also gets a guess
    if (linkedPartner?.role === 'camaleonte' && wordPair) {
      set({ eliminatedThisTurno: linkedPartner, screen: 'camaleonte_guess', camaleonteGuessResult: null })
      return
    }

    const win = checkWinCondition(updatedPlayers, players.length)
    if (win) {
      const correctSet = new Set(camaleonteCorrectIds)
      const { scores: newScores, roundScores } = calcFinalScores(updatedPlayers, win, correctSet, scores)
      set({ winner: win, scores: newScores, roundScores, screen: 'result', eliminatedThisTurno: null, linkedEliminatedThisTurno: null })
    } else {
      set({ screen: 'round', turno: get().turno + 1, currentVotes: {}, eliminatedThisTurno: null, linkedEliminatedThisTurno: null })
    }
  },

  submitCamaleonteGuess: (guess) => {
    const { wordPair, players, scores, camaleonteCorrectIds, eliminatedThisTurno } = get()
    if (!wordPair || !eliminatedThisTurno) return

    const isCorrect = isWordMatch(guess, wordPair.civilian)

    if (isCorrect) {
      // Track this MW — points will be awarded by calcFinalScores at game end
      const camaleonteId = eliminatedThisTurno.id
      const newCorrectIds = [...camaleonteCorrectIds, camaleonteId]

      // Check if game is over
      const win = checkWinCondition(players, players.length)
      if (win) {
        const correctSet = new Set(newCorrectIds)
        const { scores: finalScores, roundScores } = calcFinalScores(players, win, correctSet, scores)
        set({ camaleonteGuessResult: 'correct', camaleonteCorrectIds: newCorrectIds, winner: win, scores: finalScores, roundScores })
      } else {
        set({ camaleonteGuessResult: 'correct', camaleonteCorrectIds: newCorrectIds })
      }
      // GuessScreen shows feedback, then handleContinue navigates
    } else {
      const win = checkWinCondition(players, players.length)
      if (win) {
        const correctSet = new Set(camaleonteCorrectIds)
        const { scores: newScores, roundScores } = calcFinalScores(players, win, correctSet, scores)
        set({ camaleonteGuessResult: 'wrong', winner: win, scores: newScores, roundScores })
      } else {
        set({ camaleonteGuessResult: 'wrong' })
      }
      // GuessScreen shows feedback, then handleContinue navigates
    }
  },

  nextTurno: () => {
    set({ screen: 'round', turno: get().turno + 1, currentVotes: {}, linkedEliminatedThisTurno: null })
  },

  invalidateRound: () => {
    const { usedPairIndices } = get()
    set({ usedPairIndices: usedPairIndices.slice(0, -1) })
    get().startGame()
  },

  resetGame: () => {
    set({
      screen: 'home',
      players: [],
      wordPair: null,
      dealIndex: 0,
      turno: 1,
      currentVotes: {},
      eliminatedThisTurno: null,
      linkedEliminatedThisTurno: null,
      camaleonteGuessResult: null,
      camaleonteCorrectIds: [],
      winner: null,
      roundScores: {},
      scores: {},
      usedPairIndices: [],
    })
  },

  rematch: () => {
    const { playerNames } = get()
    const rotated = [...playerNames.slice(1), playerNames[0]]
    set({ playerNames: rotated })
    get().startGame()
  },

  resetScores: () => {
    const zeroed = Object.fromEntries(
      Object.keys(get().scores).map(name => [name, 0])
    )
    set({ scores: zeroed })
  },
}))
