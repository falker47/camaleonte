import type { GameDuration } from '../store/types'

export type MancheStartReason = 'initial' | 'continue' | 'invalidate'

export function getSuggestedGameDuration(playerCount: number): 1 | 2 {
  return playerCount >= 6 ? 1 : 2
}

export function resolveGameDuration(
  current: GameDuration,
  manuallyOverridden: boolean,
  playerCount: number
): GameDuration {
  return manuallyOverridden ? current : getSuggestedGameDuration(playerCount)
}

export function getTotalManche(playerCount: number, duration: GameDuration): number | null {
  return duration === 'unlimited' ? null : playerCount * duration
}

export function getMancheNumberForStart(
  currentManche: number,
  reason: MancheStartReason
): number {
  if (reason === 'initial' || currentManche < 1) return 1
  return reason === 'continue' ? currentManche + 1 : currentManche
}

export function canStartNextManche(
  currentManche: number,
  playerCount: number,
  duration: GameDuration
): boolean {
  const total = getTotalManche(playerCount, duration)
  return total === null || currentManche < total
}

export function isGameComplete(
  currentManche: number,
  playerCount: number,
  duration: GameDuration
): boolean {
  const total = getTotalManche(playerCount, duration)
  return total !== null && currentManche >= total
}

export function formatMancheProgress(
  currentManche: number,
  playerCount: number,
  duration: GameDuration
): string {
  const total = getTotalManche(playerCount, duration)
  return total === null
    ? `Manche ${currentManche}`
    : `Manche ${currentManche} / ${total}`
}

export function getSessionResultScreen(
  currentManche: number,
  playerCount: number,
  duration: GameDuration
): 'result' | 'final_result' {
  return isGameComplete(currentManche, playerCount, duration)
    ? 'final_result'
    : 'result'
}
