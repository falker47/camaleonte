import type { Player, Role, GameConfig, WordPair } from '../store/types'
import { shuffle } from './shuffle'

export function assignRoles(
  names: string[],
  config: GameConfig,
  pair: WordPair
): Player[] {
  const roles: Role[] = [
    ...Array(config.mrWhiteCount).fill('mrwhite' as Role),
    ...Array(config.infiltratoCount).fill('infiltrato' as Role),
    ...Array(names.length - config.mrWhiteCount - config.infiltratoCount).fill('civile' as Role),
  ]
  let shuffledRoles = shuffle(roles)
  // Mr. White as first player is a big handicap — reshuffle with 50% chance to mitigate
  if (shuffledRoles[0] === 'mrwhite' && Math.random() < 0.5) {
    shuffledRoles = shuffle(roles)
  }
  return names.map((name, i) => {
    const role = shuffledRoles[i]
    return {
      id: crypto.randomUUID(),
      name,
      role,
      word: role === 'civile' ? pair.civilian : role === 'infiltrato' ? pair.undercover : null,
      eliminated: false,
      eliminatedInTurno: null,
    }
  })
}
