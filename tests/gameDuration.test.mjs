import test from 'node:test'
import assert from 'node:assert/strict'

import {
  canStartNextManche,
  formatMancheProgress,
  getMancheNumberForStart,
  getSuggestedGameDuration,
  getTotalManche,
  isGameComplete,
  resolveGameDuration,
} from '../.test-build/utils/gameDuration.js'

test('default duration is 2 giri for 3-5 players', () => {
  for (const playerCount of [3, 4, 5]) {
    assert.equal(getSuggestedGameDuration(playerCount), 2)
  }
})

test('default duration is 1 giro for 6-12 players', () => {
  for (let playerCount = 6; playerCount <= 12; playerCount += 1) {
    assert.equal(getSuggestedGameDuration(playerCount), 1)
  }
})

test('manual duration override is not overwritten by player-count changes', () => {
  assert.equal(resolveGameDuration(3, true, 12), 3)
  assert.equal(resolveGameDuration('unlimited', true, 3), 'unlimited')
  assert.equal(resolveGameDuration(3, false, 4), 2)
  assert.equal(resolveGameDuration(3, false, 8), 1)
})

test('finite duration derives total manche from players times giri', () => {
  assert.equal(getTotalManche(3, 2), 6)
  assert.equal(getTotalManche(5, 2), 10)
  assert.equal(getTotalManche(7, 1), 7)
  assert.equal(getTotalManche(4, 3), 12)
})

test('progress formatting distinguishes finite and unlimited sessions', () => {
  assert.equal(formatMancheProgress(5, 4, 2), 'Manche 5 / 8')
  assert.equal(formatMancheProgress(5, 4, 'unlimited'), 'Manche 5')
})

test('finite sessions block another manche at the target', () => {
  assert.equal(canStartNextManche(7, 4, 2), true)
  assert.equal(canStartNextManche(8, 4, 2), false)
  assert.equal(isGameComplete(7, 4, 2), false)
  assert.equal(isGameComplete(8, 4, 2), true)
})

test('unlimited sessions remain open-ended', () => {
  assert.equal(getTotalManche(4, 'unlimited'), null)
  assert.equal(canStartNextManche(500, 4, 'unlimited'), true)
  assert.equal(isGameComplete(500, 4, 'unlimited'), false)
})

test('invalidating a manche replaces it without consuming the session limit', () => {
  assert.equal(getMancheNumberForStart(5, 'invalidate'), 5)
  assert.equal(getMancheNumberForStart(5, 'continue'), 6)
  assert.equal(getMancheNumberForStart(0, 'initial'), 1)
})
