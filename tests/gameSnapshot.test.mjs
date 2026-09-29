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
      duration: 2,
      specialRoles: { oracolo: true },
    },
    players,
    wordPair: { wordA: 'mare', wordB: 'lago', category: 'Natura' },
    dealIndex: 2,
    manche: 2,
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
    manche: 2,
    totalManche: 6,
    turno: 2,
    screen: 'vote',
  })
})

test('saved-game summary exposes both session manche and in-game turn', () => {
  const snapshot = createGameSnapshot(persistedState({
    screen: 'deal',
    manche: 4,
    turno: 1,
    usedPairIndices: [153, 438, 266, 75],
  }), 15)

  assert.deepEqual(getSavedGameSummary(snapshot), {
    savedAt: 15,
    playerCount: 3,
    manche: 4,
    totalManche: 6,
    turno: 1,
    screen: 'deal',
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


test('legacy snapshots without duration restore as unlimited and migrate manche once', () => {
  const legacy = createGameSnapshot(persistedState({
    manche: 3,
    usedPairIndices: [4, 9, 12],
  }), 60)

  delete legacy.state.config.duration
  delete legacy.state.manche

  const parsed = parseGameSnapshot(JSON.stringify(legacy))

  assert.ok(parsed)
  assert.equal(parsed.state.config.duration, 'unlimited')
  assert.equal(parsed.state.manche, 3)
  assert.deepEqual(getSavedGameSummary(parsed), {
    savedAt: 60,
    playerCount: 3,
    manche: 3,
    totalManche: null,
    turno: 2,
    screen: 'vote',
  })
})

test('finite duration and explicit manche progress survive snapshot restore parsing', () => {
  const parsed = parseGameSnapshot(JSON.stringify(createGameSnapshot(persistedState({
    manche: 5,
    config: {
      camaleonteCount: 1,
      talpaCount: 1,
      duration: 3,
      specialRoles: { oracolo: true },
    },
  }), 70)))

  assert.ok(parsed)
  assert.equal(parsed.state.config.duration, 3)
  assert.equal(parsed.state.manche, 5)
  assert.equal(getSavedGameSummary(parsed).totalManche, 9)
})


test('pre-polish finite result snapshots migrate to the dedicated final screen', () => {
  const parsed = parseGameSnapshot(JSON.stringify(createGameSnapshot(persistedState({
    screen: 'result',
    manche: 6,
    config: {
      camaleonteCount: 1,
      talpaCount: 1,
      duration: 2,
      specialRoles: { oracolo: true },
    },
  }), 80)))

  assert.ok(parsed)
  assert.equal(parsed.state.screen, 'final_result')
})

test('dedicated final result snapshots remain resumable', () => {
  const parsed = parseGameSnapshot(JSON.stringify(createGameSnapshot(persistedState({
    screen: 'final_result',
    manche: 6,
  }), 90)))

  assert.ok(parsed)
  assert.equal(parsed.state.screen, 'final_result')
})

test('a snapshot cannot resume setup or home', () => {
  for (const screen of ['home', 'setup']) {
    const snapshot = createGameSnapshot(persistedState({ screen }), 50)
    assert.equal(parseGameSnapshot(JSON.stringify(snapshot)), null)
  }
})
