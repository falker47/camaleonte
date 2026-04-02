import type { Player } from '../store/types'

export function checkWinCondition(players: Player[]): 'civilians' | 'last_two' | null {
  const active = players.filter(p => !p.eliminated)
  const activeImpostors = active.filter(p => p.role === 'mrwhite' || p.role === 'infiltrato')

  // Tutti gli impostori eliminati → civili vincono
  // (se un MW ha indovinato, i civili non prendono punti — gestito in calcFinalScores)
  if (activeImpostors.length === 0) return 'civilians'

  // 2 giocatori rimasti con almeno 1 impostore → impostori sopravvissuti vincono
  if (active.length <= 2) return 'last_two'

  return null
}
