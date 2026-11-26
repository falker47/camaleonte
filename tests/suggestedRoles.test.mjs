import test from 'node:test'
import assert from 'node:assert/strict'

import {
  MAX_CAMALEONTE,
  MAX_TALPE,
  SUGGESTED_ROLES,
} from '../.test-build/constants/gameConfig.js'

test('3-4 players suggest 0 Camaleonti and 1 Talpa', () => {
  assert.deepEqual(SUGGESTED_ROLES[3], [0, 1])
  assert.deepEqual(SUGGESTED_ROLES[4], [0, 1])
})

test('suggestions from 5 players up are unchanged', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(SUGGESTED_ROLES).filter(([count]) => Number(count) >= 5)),
    {
      5: [1, 0], 6: [1, 1],
      7: [1, 1], 8: [1, 2],
      9: [1, 2], 10: [1, 2],
      11: [2, 2], 12: [2, 2],
    }
  )
})

test('every suggestion is startable from the setup', () => {
  for (let playerCount = 3; playerCount <= 12; playerCount += 1) {
    const [camaleonti, talpe] = SUGGESTED_ROLES[playerCount]
    const impostors = camaleonti + talpe
    assert.ok(camaleonti <= MAX_CAMALEONTE, `${playerCount} players: too many Camaleonti`)
    assert.ok(talpe <= MAX_TALPE, `${playerCount} players: too many Talpe`)
    assert.ok(impostors >= 1, `${playerCount} players: no impostor`)
    assert.ok(impostors <= playerCount - 2, `${playerCount} players: fewer than 2 Civili`)
  }
})
