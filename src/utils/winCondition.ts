import type { Player } from '../store/types'

export function getSurvivalThreshold(totalPlayers: number): number {
  if (totalPlayers >= 9) return 4
  if (totalPlayers >= 6) return 3
  return 2
}

export function checkWinCondition(players: Player[], totalPlayers: number): 'civilians' | 'last_two' | null {
  const active = players.filter(p => !p.eliminated)
  const activeImpostors = active.filter(p => p.role === 'camaleonte' || p.role === 'talpa')

  // Tutti gli impostori eliminati → civili vincono
  // (se un MW ha indovinato, i civili non prendono punti — gestito in calcFinalScores)
  if (activeImpostors.length === 0) return 'civilians'

  // Soglia dinamica: ultimi N giocatori con almeno 1 impostore → impostori sopravvissuti vincono
  const threshold = getSurvivalThreshold(totalPlayers)
  if (active.length <= threshold) return 'last_two'

  return null
}
