import test from 'node:test'
import assert from 'node:assert/strict'

import {
  checkWinCondition,
  getSurvivalThreshold,
} from '../.test-build/utils/winCondition.js'

let nextId = 0

function player(role, eliminated = false) {
  nextId += 1
  return {
    id: `p${nextId}`,
    name: `${role}-${nextId}`,
    role,
    word: null,
    eliminated,
    eliminatedInTurno: eliminated ? 1 : null,
  }
}

test('survival threshold scales with initial player count', () => {
  assert.equal(getSurvivalThreshold(3), 2)
  assert.equal(getSurvivalThreshold(5), 2)
  assert.equal(getSurvivalThreshold(6), 3)
  assert.equal(getSurvivalThreshold(8), 3)
  assert.equal(getSurvivalThreshold(9), 4)
  assert.equal(getSurvivalThreshold(12), 4)
})

test('civilians win when all impostors are eliminated', () => {
  const players = [
    player('civile'),
    player('civile'),
    player('camaleonte', true),
    player('civile', true),
    player('civile', true),
    player('civile', true),
  ]

  assert.equal(checkWinCondition(players, 6), 'civilians')
})

test('a surviving impostor wins at the dynamic threshold', () => {
  const players = [
    player('camaleonte'),
    player('civile'),
    player('civile'),
    player('civile', true),
    player('civile', true),
    player('civile', true),
  ]

  assert.equal(checkWinCondition(players, 6), 'last_two')
})

test('the game continues above the dynamic threshold', () => {
  const players = [
    player('talpa'),
    player('civile'),
    player('civile'),
    player('civile'),
    player('civile'),
    player('civile', true),
    player('civile', true),
    player('civile', true),
    player('civile', true),
  ]

  assert.equal(checkWinCondition(players, 9), null)
})
