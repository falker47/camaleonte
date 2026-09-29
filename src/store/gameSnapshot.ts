import type { GameConfig, Player, Screen, WordPair } from './types'

export type PersistedScreen = Exclude<Screen, 'home' | 'setup'>
export type GuessPhase = 'privacy' | 'input' | 'result'

export interface VoteSession {
  votes: Record<string, number>
  voteHistory: string[]
  tieBreakIds: string[] | null
  pendingDrawIds: string[] | null
  randomPickId: string | null
}

export interface GuessSession {
  phase: GuessPhase
  draft: string
  timeLeft: number
  privacyLocked: boolean
}

export interface PersistedGameState {
  screen: PersistedScreen
  playerNames: string[]
  config: GameConfig
  players: Player[]
  wordPair: WordPair
  dealIndex: number
  turno: number
  eliminatedThisTurnoId: string | null
  linkedEliminatedThisTurnoId: string | null
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
  voteSession: VoteSession
  guessSession: GuessSession
  oracoloPendingRevealId: string | null
}

export interface GameSnapshotV1 {
  version: 1
  savedAt: number
  state: PersistedGameState
}

export interface SavedGameSummary {
  savedAt: number
  playerCount: number
  manche: number
  turno: number
  screen: PersistedScreen
}

const PERSISTED_SCREENS: ReadonlySet<string> = new Set([
  'deal',
  'round',
  'vote',
  'elimination',
  'camaleonte_guess',
  'riccio_strike',
  'oracolo_reveal',
  'result',
])

const ROLES = new Set(['civile', 'talpa', 'camaleonte'])
const SPECIAL_ROLES = new Set(['buffone', 'spettro', 'duellante', 'romeo', 'giulietta', 'riccio', 'oracolo'])
const GUESS_PHASES = new Set(['privacy', 'input', 'result'])

export function createInitialVoteSession(): VoteSession {
  return {
    votes: {},
    voteHistory: [],
    tieBreakIds: null,
    pendingDrawIds: null,
    randomPickId: null,
  }
}

export function createInitialGuessSession(): GuessSession {
  return {
    phase: 'privacy',
    draft: '',
    timeLeft: 60,
    privacyLocked: false,
  }
}

export function createGameSnapshot(state: PersistedGameState, savedAt = Date.now()): GameSnapshotV1 {
  return {
    version: 1,
    savedAt,
    state,
  }
}

export function serializeGameSnapshot(snapshot: GameSnapshotV1): string {
  return JSON.stringify(snapshot)
}

export function getSavedGameSummary(snapshot: GameSnapshotV1): SavedGameSummary {
  return {
    savedAt: snapshot.savedAt,
    playerCount: snapshot.state.players.length,
    manche: Math.max(1, snapshot.state.usedPairIndices.length),
    turno: snapshot.state.turno,
    screen: snapshot.state.screen,
  }
}

export function parseGameSnapshot(raw: string): GameSnapshotV1 | null {
  try {
    return migrateGameSnapshot(JSON.parse(raw))
  } catch {
    return null
  }
}

export function migrateGameSnapshot(input: unknown): GameSnapshotV1 | null {
  if (!isRecord(input) || input.version !== 1) return null
  if (!isFiniteNumber(input.savedAt) || input.savedAt < 0) return null
  if (!isPersistedGameState(input.state)) return null

  const snapshot = input as unknown as GameSnapshotV1

  // A private Camaleonte input must never reappear automatically exposed.
  if (snapshot.state.screen === 'camaleonte_guess' && snapshot.state.guessSession.phase === 'input') {
    snapshot.state.guessSession = {
      ...snapshot.state.guessSession,
      privacyLocked: true,
    }
  }

  return snapshot
}

function isPersistedGameState(value: unknown): value is PersistedGameState {
  if (!isRecord(value)) return false
  if (typeof value.screen !== 'string' || !PERSISTED_SCREENS.has(value.screen)) return false
  if (!isStringArray(value.playerNames)) return false
  if (!isGameConfig(value.config)) return false
  if (!Array.isArray(value.players) || value.players.length < 3 || !value.players.every(isPlayer)) return false
  if (!isWordPair(value.wordPair)) return false
  if (!isIntegerInRange(value.dealIndex, 0, value.players.length - 1)) return false
  if (!isIntegerInRange(value.turno, 1, Number.MAX_SAFE_INTEGER)) return false

  const playerIds = new Set(value.players.map(player => player.id))
  if (playerIds.size !== value.players.length) return false

  if (!isNullablePlayerId(value.eliminatedThisTurnoId, playerIds)) return false
  if (!isNullablePlayerId(value.linkedEliminatedThisTurnoId, playerIds)) return false

  if (value.camaleonteGuessResult !== null && value.camaleonteGuessResult !== 'correct' && value.camaleonteGuessResult !== 'wrong') return false
  if (!isPlayerIdArray(value.camaleonteCorrectIds, playerIds)) return false
  if (value.winner !== null && value.winner !== 'civilians' && value.winner !== 'last_two') return false
  if (!isNumberRecord(value.scores) || !isNumberRecord(value.roundScores)) return false

  if (typeof value.riccioStrikeActive !== 'boolean') return false
  if (typeof value.postRiccioStrike !== 'boolean') return false
  if (typeof value.oracoloRevealActive !== 'boolean') return false
  if (!isPlayerIdArray(value.oracoloRevealedIds, playerIds)) return false
  if (!Array.isArray(value.usedPairIndices) || !value.usedPairIndices.every(index => isIntegerInRange(index, 0, Number.MAX_SAFE_INTEGER))) return false

  if (!isVoteSession(value.voteSession, playerIds)) return false
  if (!isGuessSession(value.guessSession)) return false
  if (!isNullablePlayerId(value.oracoloPendingRevealId, playerIds)) return false

  return true
}

function isVoteSession(value: unknown, playerIds: Set<string>): value is VoteSession {
  if (!isRecord(value)) return false
  if (!isVoteRecord(value.votes, playerIds)) return false
  if (!isPlayerIdArray(value.voteHistory, playerIds)) return false
  if (!isNullablePlayerIdArray(value.tieBreakIds, playerIds)) return false
  if (!isNullablePlayerIdArray(value.pendingDrawIds, playerIds)) return false
  if (!isNullablePlayerId(value.randomPickId, playerIds)) return false
  return true
}

function isGuessSession(value: unknown): value is GuessSession {
  if (!isRecord(value)) return false
  if (typeof value.phase !== 'string' || !GUESS_PHASES.has(value.phase)) return false
  if (typeof value.draft !== 'string' || value.draft.length > 40) return false
  if (!isIntegerInRange(value.timeLeft, 0, 60)) return false
  if (typeof value.privacyLocked !== 'boolean') return false
  return true
}

function isGameConfig(value: unknown): value is GameConfig {
  if (!isRecord(value)) return false
  if (!isIntegerInRange(value.camaleonteCount, 0, 12)) return false
  if (!isIntegerInRange(value.talpaCount, 0, 12)) return false

  if (value.specialRoles !== undefined) {
    if (!isRecord(value.specialRoles)) return false
    for (const roleValue of Object.values(value.specialRoles)) {
      if (typeof roleValue !== 'boolean') return false
    }
  }

  return true
}

function isPlayer(value: unknown): value is Player {
  if (!isRecord(value)) return false
  if (typeof value.id !== 'string' || value.id.length === 0) return false
  if (typeof value.name !== 'string' || value.name.length === 0) return false
  if (typeof value.role !== 'string' || !ROLES.has(value.role)) return false
  if (value.specialRole !== undefined && (typeof value.specialRole !== 'string' || !SPECIAL_ROLES.has(value.specialRole))) return false
  if (value.word !== null && typeof value.word !== 'string') return false
  if (typeof value.eliminated !== 'boolean') return false
  if (value.eliminatedInTurno !== null && !isIntegerInRange(value.eliminatedInTurno, 1, Number.MAX_SAFE_INTEGER)) return false
  if (value.duelOpponentId !== undefined && typeof value.duelOpponentId !== 'string') return false
  return true
}

function isWordPair(value: unknown): value is WordPair {
  if (!isRecord(value)) return false
  if (typeof value.wordA !== 'string' || typeof value.wordB !== 'string') return false
  if (value.wordC !== undefined && typeof value.wordC !== 'string') return false
  if (value.category !== undefined && typeof value.category !== 'string') return false
  return true
}

function isVoteRecord(value: unknown, playerIds: Set<string>): value is Record<string, number> {
  if (!isRecord(value)) return false

  for (const [id, count] of Object.entries(value)) {
    if (!playerIds.has(id) || !isIntegerInRange(count, 0, Number.MAX_SAFE_INTEGER)) return false
  }

  return true
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  if (!isRecord(value)) return false
  return Object.values(value).every(isFiniteNumber)
}

function isNullablePlayerId(value: unknown, playerIds: Set<string>): value is string | null {
  return value === null || (typeof value === 'string' && playerIds.has(value))
}

function isNullablePlayerIdArray(value: unknown, playerIds: Set<string>): value is string[] | null {
  return value === null || isPlayerIdArray(value, playerIds)
}

function isPlayerIdArray(value: unknown, playerIds: Set<string>): value is string[] {
  return Array.isArray(value) && value.every(id => typeof id === 'string' && playerIds.has(id))
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
