import { useGameStore } from './gameStore'
import {
  createGameSnapshot,
  getSavedGameSummary,
  parseGameSnapshot,
  serializeGameSnapshot,
  type PersistedGameState,
  type SavedGameSummary,
} from './gameSnapshot'
import {
  clearStoredGameSnapshot,
  readStoredGameSnapshot,
  writeStoredGameSnapshot,
} from './gameStorage'

let persistenceStarted = false
let restoringSnapshot = false

function isPersistableGameState(state: ReturnType<typeof useGameStore.getState>): boolean {
  return state.screen !== 'home'
    && state.screen !== 'setup'
    && state.players.length >= 3
    && state.wordPair !== null
}

function toPersistedGameState(state: ReturnType<typeof useGameStore.getState>): PersistedGameState | null {
  if (!isPersistableGameState(state) || state.wordPair === null || state.screen === 'home' || state.screen === 'setup') {
    return null
  }

  return {
    screen: state.screen,
    playerNames: [...state.playerNames],
    config: {
      ...state.config,
      specialRoles: state.config.specialRoles ? { ...state.config.specialRoles } : undefined,
    },
    players: state.players.map(player => ({ ...player })),
    wordPair: { ...state.wordPair },
    dealIndex: state.dealIndex,
    turno: state.turno,
    eliminatedThisTurnoId: state.eliminatedThisTurno?.id ?? null,
    linkedEliminatedThisTurnoId: state.linkedEliminatedThisTurno?.id ?? null,
    camaleonteGuessResult: state.camaleonteGuessResult,
    camaleonteCorrectIds: [...state.camaleonteCorrectIds],
    winner: state.winner,
    scores: { ...state.scores },
    roundScores: { ...state.roundScores },
    riccioStrikeActive: state.riccioStrikeActive,
    postRiccioStrike: state.postRiccioStrike,
    oracoloRevealActive: state.oracoloRevealActive,
    oracoloRevealedIds: [...state.oracoloRevealedIds],
    usedPairIndices: [...state.usedPairIndices],
    voteSession: {
      votes: { ...state.voteSession.votes },
      voteHistory: [...state.voteSession.voteHistory],
      tieBreakIds: state.voteSession.tieBreakIds ? [...state.voteSession.tieBreakIds] : null,
      pendingDrawIds: state.voteSession.pendingDrawIds ? [...state.voteSession.pendingDrawIds] : null,
      randomPickId: state.voteSession.randomPickId,
    },
    guessSession: { ...state.guessSession },
    oracoloPendingRevealId: state.oracoloPendingRevealId,
  }
}

function persistState(state: ReturnType<typeof useGameStore.getState>): void {
  const persistedState = toPersistedGameState(state)
  if (!persistedState) return

  const snapshot = createGameSnapshot(persistedState)
  void writeStoredGameSnapshot(serializeGameSnapshot(snapshot)).catch(error => {
    console.error('Unable to save game snapshot', error)
  })
}

async function readValidSnapshot() {
  const raw = await readStoredGameSnapshot()
  if (raw === null) return null

  const snapshot = parseGameSnapshot(raw)
  if (snapshot) return snapshot

  await clearStoredGameSnapshot()
  return null
}

export function startGamePersistence(): void {
  if (persistenceStarted) return
  persistenceStarted = true

  useGameStore.subscribe(state => {
    if (restoringSnapshot) return
    persistState(state)
  })
}

export async function getSavedGame(): Promise<SavedGameSummary | null> {
  const snapshot = await readValidSnapshot()
  return snapshot ? getSavedGameSummary(snapshot) : null
}

export async function restoreSavedGame(): Promise<boolean> {
  const snapshot = await readValidSnapshot()
  if (!snapshot) return false

  const persisted = snapshot.state
  const players = persisted.players.map(player => ({ ...player }))
  const playersById = new Map(players.map(player => [player.id, player]))

  restoringSnapshot = true
  try {
    useGameStore.setState(current => ({
      screen: persisted.screen,
      playerNames: [...persisted.playerNames],
      config: {
        ...persisted.config,
        specialRoles: persisted.config.specialRoles ? { ...persisted.config.specialRoles } : undefined,
      },
      players,
      wordPair: { ...persisted.wordPair },
      dealIndex: persisted.dealIndex,
      turno: persisted.turno,
      currentVotes: {},
      eliminatedThisTurno: persisted.eliminatedThisTurnoId
        ? playersById.get(persisted.eliminatedThisTurnoId) ?? null
        : null,
      linkedEliminatedThisTurno: persisted.linkedEliminatedThisTurnoId
        ? playersById.get(persisted.linkedEliminatedThisTurnoId) ?? null
        : null,
      camaleonteGuessResult: persisted.camaleonteGuessResult,
      camaleonteCorrectIds: [...persisted.camaleonteCorrectIds],
      winner: persisted.winner,
      scores: { ...persisted.scores },
      roundScores: { ...persisted.roundScores },
      riccioStrikeActive: persisted.riccioStrikeActive,
      postRiccioStrike: persisted.postRiccioStrike,
      oracoloRevealActive: persisted.oracoloRevealActive,
      oracoloRevealedIds: [...persisted.oracoloRevealedIds],
      usedPairIndices: [...persisted.usedPairIndices],
      voteSession: {
        votes: { ...persisted.voteSession.votes },
        voteHistory: [...persisted.voteSession.voteHistory],
        tieBreakIds: persisted.voteSession.tieBreakIds ? [...persisted.voteSession.tieBreakIds] : null,
        pendingDrawIds: persisted.voteSession.pendingDrawIds ? [...persisted.voteSession.pendingDrawIds] : null,
        randomPickId: persisted.voteSession.randomPickId,
      },
      guessSession: {
        ...persisted.guessSession,
        privacyLocked: persisted.guessSession.phase === 'input'
          ? true
          : persisted.guessSession.privacyLocked,
      },
      oracoloPendingRevealId: persisted.oracoloPendingRevealId,
      privacyEpoch: current.privacyEpoch + 1,
    }))
  } finally {
    restoringSnapshot = false
  }

  persistState(useGameStore.getState())
  return true
}

export async function discardSavedGame(): Promise<void> {
  await clearStoredGameSnapshot()
}
