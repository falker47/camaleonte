import type { Player, Role, GameConfig, WordPair } from '../store/types'
import { shuffle } from './shuffle'

export function assignRoles(
  names: string[],
  config: GameConfig,
  pair: WordPair
): Player[] {
  const roles: Role[] = [
    ...Array(config.camaleonteCount).fill('camaleonte' as Role),
    ...Array(config.talpaCount).fill('talpa' as Role),
    ...Array(names.length - config.camaleonteCount - config.talpaCount).fill('civile' as Role),
  ]
  let shuffledRoles = shuffle(roles)
  // Camaleonte as first player is a big handicap — reshuffle with 50% chance to mitigate
  if (shuffledRoles[0] === 'camaleonte' && Math.random() < 0.5) {
    shuffledRoles = shuffle(roles)
  }
  const talpaWords = shuffle([pair.undercover, pair.undercover2])
  let talpaIndex = 0
  const result = names.map((name, i) => {
    const role = shuffledRoles[i]
    let word: string | null = null
    if (role === 'civile') word = pair.civilian
    else if (role === 'talpa') word = talpaWords[talpaIndex++] ?? pair.undercover
    return {
      id: crypto.randomUUID(),
      name,
      role,
      word,
      eliminated: false,
      eliminatedInTurno: null,
    } as Player
  })

  // Assign special roles
  if (config.specialRoles?.buffone && names.length >= 5) {
    const eligible = result
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p.role === 'civile' && !p.specialRole)
    if (eligible.length > 0) {
      const chosen = shuffle(eligible)[0]
      result[chosen.i] = { ...result[chosen.i], specialRole: 'buffone' }
    }
  }

  if (config.specialRoles?.spettro) {
    const eligible = result
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !p.specialRole)
    if (eligible.length > 0) {
      const chosen = shuffle(eligible)[0]
      result[chosen.i] = { ...result[chosen.i], specialRole: 'spettro' }
    }
  }

  if (config.specialRoles?.duellanti && names.length >= 4) {
    const eligible = result
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !p.specialRole)
    if (eligible.length >= 2) {
      const [a, b] = shuffle(eligible)
      result[a.i] = { ...result[a.i], specialRole: 'duellante', duelOpponentId: result[b.i].id }
      result[b.i] = { ...result[b.i], specialRole: 'duellante', duelOpponentId: result[a.i].id }
    }
  }

  if (config.specialRoles?.romeoGiulietta && names.length >= 5) {
    const eligible = result
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !p.specialRole)
    if (eligible.length >= 2) {
      const chosen = shuffle(eligible).slice(0, 2)
      result[chosen[0].i] = { ...result[chosen[0].i], specialRole: 'romeo' }
      result[chosen[1].i] = { ...result[chosen[1].i], specialRole: 'giulietta' }
    }
  }

  if (config.specialRoles?.riccio && names.length >= 5) {
    const eligible = result
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !p.specialRole)
    if (eligible.length > 0) {
      const chosen = shuffle(eligible)[0]
      result[chosen.i] = { ...result[chosen.i], specialRole: 'riccio' }
    }
  }

  if (config.specialRoles?.oracolo && names.length >= 4) {
    const eligible = result
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !p.specialRole)
    if (eligible.length > 0) {
      const chosen = shuffle(eligible)[0]
      result[chosen.i] = { ...result[chosen.i], specialRole: 'oracolo' }
    }
  }

  return result
}
