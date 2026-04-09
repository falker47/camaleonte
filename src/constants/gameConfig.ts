export const MAX_PLAYERS = 12
export const MIN_PLAYERS = 3
export const MAX_CAMALEONTE = 2
export const MAX_TALPE = 2
export const MAX_PARTICLES = 20

// --- Scoring ---

export const CIVILE_WIN_POINTS = 2
export const CIVILE_POISONED_POINTS = 1
export const BUFFONE_BONUS_POINTS = 2
export const DUELLANTE_TRANSFER_POINTS = 1
export const MAX_TALPA_PARTIAL_POINTS = 3

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
