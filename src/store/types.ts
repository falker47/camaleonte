export type Role = 'civile' | 'talpa' | 'camaleonte'

export type SpecialRole = 'buffone' | 'spettro' | 'duellante' | 'romeo' | 'giulietta' | 'riccio' | 'oracolo'

export type GameDuration = 1 | 2 | 3 | 'unlimited'

export type Screen =
  | 'home'
  | 'setup'
  | 'deal'
  | 'round'
  | 'vote'
  | 'elimination'
  | 'camaleonte_guess'
  | 'riccio_strike'
  | 'oracolo_reveal'
  | 'result'
  | 'final_result'

export interface Player {
  id: string
  name: string
  role: Role
  specialRole?: SpecialRole
  word: string | null
  eliminated: boolean
  eliminatedInTurno: number | null
  duelOpponentId?: string
}

export interface WordPair {
  wordA: string
  wordB: string
  wordC?: string
  category?: string
}

export interface GameConfig {
  camaleonteCount: number
  talpaCount: number
  duration: GameDuration
  specialRoles?: { buffone?: boolean; spettro?: boolean; duellanti?: boolean; romeoGiulietta?: boolean; riccio?: boolean; oracolo?: boolean }
}
