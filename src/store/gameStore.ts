import { create } from 'zustand'
import type { Screen, Player, WordPair, GameConfig } from './types'
import { wordPairs } from '../data/wordPairs'
import { shuffle } from '../utils/shuffle'
import { assignRoles } from '../utils/assignRoles'
import { checkWinCondition } from '../utils/winCondition'
import { isWordMatch } from '../utils/matchWord'
import {
  getCamaleonteGuessPoints,
  getCamaleonteSurvivalPoints,
  getTalpaWinPoints,
  MAX_TALPA_PARTIAL_POINTS,
  CIVILE_WIN_POINTS,
  BUFFONE_BONUS_POINTS,
  DUELLANTE_TRANSFER_POINTS,
} from '../constants/gameConfig'

function getTalpaPartialPoints(players: Player[]): number {
  const eliminatedCivili = players.filter(p => p.role === 'civile' && p.eliminated).length
  return Math.min(MAX_TALPA_PARTIAL_POINTS, eliminatedCivili)
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
      if (p.role === 'civile' && !camaleontePoisoned) pts = CIVILE_WIN_POINTS
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

    // Buffone bonus if eliminated in turno 1
    if (p.specialRole === 'buffone' && p.eliminatedInTurno === 1) pts += BUFFONE_BONUS_POINTS

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
    } else if (a.eliminated && b.eliminated && a.eliminatedInTurno != null && b.eliminatedInTurno != null && a.eliminatedInTurno !== b.eliminatedInTurno) {
      loser = a.eliminatedInTurno < b.eliminatedInTurno ? a : b
      winnerId = loser === a ? b.id : a.id
    }

    if (loser && winnerId) {
      roundScores[loser.name] = (roundScores[loser.name] ?? 0) - DUELLANTE_TRANSFER_POINTS
      scores[loser.name] = (scores[loser.name] ?? 0) - DUELLANTE_TRANSFER_POINTS
      const winnerPlayer = players.find(p => p.id === winnerId)
      if (!winnerPlayer) return { scores, roundScores }
      const winnerName = winnerPlayer.name
      roundScores[winnerName] = (roundScores[winnerName] ?? 0) + DUELLANTE_TRANSFER_POINTS
      scores[winnerName] = (scores[winnerName] ?? 0) + DUELLANTE_TRANSFER_POINTS
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
  riccioStrikeActive: boolean
  postRiccioStrike: boolean
  oracoloRevealActive: boolean
  oracoloRevealedIds: string[]
  usedPairIndices: number[]

  goTo: (screen: Screen) => void
  setPlayerNames: (names: string[]) => void
  setConfig: (config: GameConfig) => void
  startGame: () => void
  advanceDeal: () => void
  castVote: (votes: Record<string, number>) => void
  confirmElimination: () => void
  riccioStrike: (targetId: string) => void
  oracoloReveal: (targetId: string) => void
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
  riccioStrikeActive: false,
  postRiccioStrike: false,
  oracoloRevealActive: false,
  oracoloRevealedIds: [],
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
      riccioStrikeActive: false,
      postRiccioStrike: false,
      oracoloRevealActive: false,
      oracoloRevealedIds: [],
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
    const { eliminatedThisTurno, players, wordPair, scores, camaleonteCorrectIds, turno, postRiccioStrike, linkedEliminatedThisTurno } = get()
    if (!eliminatedThisTurno) return

    // Post-riccio: elimination already done in riccioStrike(), only handle navigation
    if (postRiccioStrike) {
      set({ postRiccioStrike: false })

      // Compute oracolo upfront — camaleonte guess may return early but oracolo must still activate after
      const isOracolo = eliminatedThisTurno.specialRole === 'oracolo' || linkedEliminatedThisTurno?.specialRole === 'oracolo'
      const oracoloCanReveal = isOracolo && !checkWinCondition(players, players.length)
      if (oracoloCanReveal) {
        set({ oracoloRevealActive: true })
      }

      if (eliminatedThisTurno.role === 'camaleonte' && wordPair) {
        set({ screen: 'camaleonte_guess', camaleonteGuessResult: null })
        return
      }
      if (linkedEliminatedThisTurno?.role === 'camaleonte' && wordPair) {
        set({ eliminatedThisTurno: linkedEliminatedThisTurno, screen: 'camaleonte_guess', camaleonteGuessResult: null })
        return
      }

      // Oracolo ability triggers even when eliminated by Riccio (no camaleonte to guess first)
      if (oracoloCanReveal) {
        set({ screen: 'oracolo_reveal' })
        return
      }

      const win = checkWinCondition(players, players.length)
      if (win) {
        const correctSet = new Set(camaleonteCorrectIds)
        const { scores: newScores, roundScores } = calcFinalScores(players, win, correctSet, scores)
        set({ winner: win, scores: newScores, roundScores, screen: 'result', eliminatedThisTurno: null, linkedEliminatedThisTurno: null })
      } else {
        set({ screen: 'round', turno: turno + 1, currentVotes: {}, eliminatedThisTurno: null, linkedEliminatedThisTurno: null })
      }
      return
    }

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

    // Check if Riccio ability should activate (voted player OR linked partner)
    // Riccio strikes even on 'last_two' — can invalidate impostor survival by eliminating one
    // Only skips on 'civilians' (all impostors already gone, nothing to change)
    const isRiccio = eliminatedThisTurno.specialRole === 'riccio' || linkedPartner?.specialRole === 'riccio'
    const riccioCanStrike = isRiccio && checkWinCondition(updatedPlayers, players.length) !== 'civilians'

    // Check if Oracolo ability should activate (voted player OR linked partner)
    const isOracolo = eliminatedThisTurno.specialRole === 'oracolo' || linkedPartner?.specialRole === 'oracolo'
    const oracoloCanReveal = isOracolo && !checkWinCondition(updatedPlayers, players.length)

    set({ players: updatedPlayers, linkedEliminatedThisTurno: linkedPartner, riccioStrikeActive: riccioCanStrike, oracoloRevealActive: oracoloCanReveal })

    // Voted camaleonte gets a guess first (riccio strike will happen after via GuessScreen)
    if (eliminatedThisTurno.role === 'camaleonte' && wordPair) {
      set({ screen: 'camaleonte_guess', camaleonteGuessResult: null })
      return
    }

    // Linked partner camaleonte also gets a guess
    if (linkedPartner?.role === 'camaleonte' && wordPair) {
      set({ eliminatedThisTurno: linkedPartner, screen: 'camaleonte_guess', camaleonteGuessResult: null })
      return
    }

    // Riccio strikes before win check
    if (riccioCanStrike) {
      set({ screen: 'riccio_strike' })
      return
    }

    // Oracolo reveals before win check
    if (oracoloCanReveal) {
      set({ screen: 'oracolo_reveal' })
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

  riccioStrike: (targetId) => {
    const { players, turno } = get()

    let updatedPlayers = players.map(p =>
      p.id === targetId ? { ...p, eliminated: true, eliminatedInTurno: turno } : p
    )

    // R&G linked elimination for target
    const target = updatedPlayers.find(p => p.id === targetId)
    if (!target) return
    let linkedPartner: Player | null = null
    if (target.specialRole === 'romeo' || target.specialRole === 'giulietta') {
      const partnerRole = target.specialRole === 'romeo' ? 'giulietta' : 'romeo'
      const partner = updatedPlayers.find(p => p.specialRole === partnerRole && !p.eliminated)
      if (partner) {
        linkedPartner = partner
        updatedPlayers = updatedPlayers.map(p =>
          p.id === partner.id ? { ...p, eliminated: true, eliminatedInTurno: turno } : p
        )
      }
    }

    // Show elimination screen for the target — navigation handled by confirmElimination()
    set({
      players: updatedPlayers,
      riccioStrikeActive: false,
      postRiccioStrike: true,
      eliminatedThisTurno: target,
      linkedEliminatedThisTurno: linkedPartner,
      screen: 'elimination',
    })
  },

  oracoloReveal: (targetId) => {
    const { players, turno, scores, camaleonteCorrectIds, oracoloRevealedIds } = get()

    set({ oracoloRevealActive: false, oracoloRevealedIds: [...oracoloRevealedIds, targetId] })

    const win = checkWinCondition(players, players.length)
    if (win) {
      const correctSet = new Set(camaleonteCorrectIds)
      const { scores: newScores, roundScores } = calcFinalScores(players, win, correctSet, scores)
      set({ winner: win, scores: newScores, roundScores, screen: 'result', eliminatedThisTurno: null, linkedEliminatedThisTurno: null })
    } else {
      set({ screen: 'round', turno: turno + 1, currentVotes: {}, eliminatedThisTurno: null, linkedEliminatedThisTurno: null })
    }
  },

  submitCamaleonteGuess: (guess) => {
    const { wordPair, players, scores, camaleonteCorrectIds, eliminatedThisTurno, riccioStrikeActive } = get()
    if (!wordPair || !eliminatedThisTurno) return

    const isCorrect = isWordMatch(guess, wordPair.civilian)

    if (isCorrect) {
      const camaleonteId = eliminatedThisTurno.id
      const newCorrectIds = [...camaleonteCorrectIds, camaleonteId]

      // Defer scoring if Riccio strike is pending — final state not yet determined
      if (!riccioStrikeActive) {
        const win = checkWinCondition(players, players.length)
        if (win) {
          const correctSet = new Set(newCorrectIds)
          const { scores: finalScores, roundScores } = calcFinalScores(players, win, correctSet, scores)
          set({ camaleonteGuessResult: 'correct', camaleonteCorrectIds: newCorrectIds, winner: win, scores: finalScores, roundScores })
          return
        }
      }
      set({ camaleonteGuessResult: 'correct', camaleonteCorrectIds: newCorrectIds })
    } else {
      // Defer scoring if Riccio strike is pending
      if (!riccioStrikeActive) {
        const win = checkWinCondition(players, players.length)
        if (win) {
          const correctSet = new Set(camaleonteCorrectIds)
          const { scores: newScores, roundScores } = calcFinalScores(players, win, correctSet, scores)
          set({ camaleonteGuessResult: 'wrong', winner: win, scores: newScores, roundScores })
          return
        }
      }
      set({ camaleonteGuessResult: 'wrong' })
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
      riccioStrikeActive: false,
      postRiccioStrike: false,
      oracoloRevealActive: false,
      oracoloRevealedIds: [],
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
