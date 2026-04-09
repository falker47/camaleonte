export const MAX_PLAYERS = 12
export const MIN_PLAYERS = 3
export const MAX_CAMALEONTE = 2
export const MAX_TALPE = 3
export const MAX_PARTICLES = 20

// --- Scoring ---

export const CIVILE_WIN_POINTS = 2
export const BUFFONE_BONUS_POINTS = 2
export const DUELLANTE_TRANSFER_POINTS = 2
export const MAX_TALPA_PARTIAL_POINTS = 3

export function getCamaleonteGuessPoints(totalPlayers: number): number {
  return totalPlayers <= 4 ? 4 : 3
}

export function getCamaleonteSurvivalPoints(totalPlayers: number): number {
  if (totalPlayers <= 3) return 3
  if (totalPlayers <= 4) return 4
  return 5
}

export function getTalpaWinPoints(totalPlayers: number): number {
  return totalPlayers <= 4 ? 3 : 5
}
