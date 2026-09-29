import test from 'node:test'
import assert from 'node:assert/strict'

import {
  createGameSnapshot,
  createInitialGuessSession,
  createInitialVoteSession,
  getSavedGameSummary,
  parseGameSnapshot,
  serializeGameSnapshot,
} from '../.test-build/store/gameSnapshot.js'

function player(id, name, role, word) {
  return {
    id,
    name,
    role,
    word,
    eliminated: false,
    eliminatedInTurno: null,
  }
}

function persistedState(overrides = {}) {
  const players = [
    player('p1', 'Anna', 'civile', 'mare'),
    player('p2', 'Luca', 'talpa', 'lago'),
    player('p3', 'Marta', 'camaleonte', null),
  ]

  return {
    screen: 'vote',
    playerNames: players.map(p => p.name),
    config: {
      camaleonteCount: 1,
      talpaCount: 1,
      specialRoles: { oracolo: true },
    },
    players,
    wordPair: { wordA: 'mare', wordB: 'lago', category: 'Natura' },
    dealIndex: 2,
    turno: 2,
    eliminatedThisTurnoId: null,
    linkedEliminatedThisTurnoId: null,
    camaleonteGuessResult: null,
    camaleonteCorrectIds: [],
    winner: null,
    scores: { Anna: 2, Luca: 0, Marta: 1 },
    roundScores: {},
    riccioStrikeActive: false,
    postRiccioStrike: false,
    oracoloRevealActive: false,
    oracoloRevealedIds: [],
    usedPairIndices: [4, 9],
    voteSession: {
      ...createInitialVoteSession(),
      votes: { p1: 1, p3: 1 },
      voteHistory: ['p1', 'p3'],
      tieBreakIds: ['p1', 'p3'],
    },
    guessSession: createInitialGuessSession(),
    oracoloPendingRevealId: null,
    ...overrides,
  }
}

test('versioned snapshot round-trips the active game state', () => {
  const snapshot = createGameSnapshot(persistedState(), 123456)
  const parsed = parseGameSnapshot(serializeGameSnapshot(snapshot))

  assert.deepEqual(parsed, snapshot)
  assert.deepEqual(getSavedGameSummary(parsed), {
    savedAt: 123456,
    playerCount: 3,
    turno: 2,
    screen: 'vote',
  })
})

test('Camaleonte private input is locked again when restored', () => {
  const state = persistedState({
    screen: 'camaleonte_guess',
    eliminatedThisTurnoId: 'p3',
    guessSession: {
      phase: 'input',
      draft: 'ma',
      timeLeft: 37,
      privacyLocked: false,
    },
  })

  const parsed = parseGameSnapshot(serializeGameSnapshot(createGameSnapshot(state, 10)))

  assert.equal(parsed.state.guessSession.phase, 'input')
  assert.equal(parsed.state.guessSession.draft, 'ma')
  assert.equal(parsed.state.guessSession.timeLeft, 37)
  assert.equal(parsed.state.guessSession.privacyLocked, true)
})

test('committed vote draw and pending Oracolo target survive serialization', () => {
  const state = persistedState({
    screen: 'oracolo_reveal',
    voteSession: {
      votes: {},
      voteHistory: [],
      tieBreakIds: ['p1', 'p3'],
      pendingDrawIds: ['p1', 'p3'],
      randomPickId: 'p3',
    },
    oracoloRevealActive: true,
    oracoloPendingRevealId: 'p2',
  })

  const parsed = parseGameSnapshot(serializeGameSnapshot(createGameSnapshot(state, 20)))

  assert.equal(parsed.state.voteSession.randomPickId, 'p3')
  assert.deepEqual(parsed.state.voteSession.pendingDrawIds, ['p1', 'p3'])
  assert.equal(parsed.state.oracoloPendingRevealId, 'p2')
})

test('corrupt, unsupported or dangling snapshots are rejected', () => {
  assert.equal(parseGameSnapshot('{not json'), null)

  const unsupported = createGameSnapshot(persistedState(), 30)
  unsupported.version = 2
  assert.equal(parseGameSnapshot(JSON.stringify(unsupported)), null)

  const dangling = createGameSnapshot(persistedState({
    eliminatedThisTurnoId: 'missing-player',
  }), 40)
  assert.equal(parseGameSnapshot(JSON.stringify(dangling)), null)
})

test('a snapshot cannot resume setup or home', () => {
  for (const screen of ['home', 'setup']) {
    const snapshot = createGameSnapshot(persistedState({ screen }), 50)
    assert.equal(parseGameSnapshot(JSON.stringify(snapshot)), null)
  }
})
