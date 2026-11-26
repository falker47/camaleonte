export const MAX_PLAYERS = 12
export const MIN_PLAYERS = 3
export const MAX_CAMALEONTE = 2
export const MAX_TALPE = 2
export const MAX_PARTICLES = 20

// --- Suggested roles: [camaleonti, talpe] per player count ---

export const SUGGESTED_ROLES: Record<number, [number, number]> = {
  3: [1, 0], 4: [1, 0],
  5: [1, 0], 6: [1, 1],
  7: [1, 1], 8: [1, 2],
  9: [1, 2], 10: [1, 2],
  11: [2, 2], 12: [2, 2],
}

// --- Scoring ---

export const CIVILE_WIN_POINTS = 2
export const CIVILE_POISONED_POINTS = 1
export const BUFFONE_BONUS_POINTS = 2
export const DUELLANTE_TRANSFER_POINTS = 1
export const MAX_TALPA_PARTIAL_POINTS = 2

export function getCamaleonteGuessPoints(totalPlayers: number): number {
  return totalPlayers <= 4 ? 4 : 3
}

export function getCamaleonteSurvivalPoints(totalPlayers: number): number {
  if (totalPlayers <= 4) return 3
  return 4
}

export function getTalpaWinPoints(totalPlayers: number): number {
  return totalPlayers <= 4 ? 3 : 4
}
