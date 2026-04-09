export type Role = 'civile' | 'talpa' | 'camaleonte'

export type SpecialRole = 'buffone' | 'spettro' | 'duellante' | 'romeo' | 'giulietta' | 'riccio' | 'oracolo'

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
  civilian: string
  undercover: string
  undercover2: string
  category?: string
}

export interface GameConfig {
  camaleonteCount: number
  talpaCount: number
  specialRoles?: { buffone?: boolean; spettro?: boolean; duellanti?: boolean; romeoGiulietta?: boolean; riccio?: boolean; oracolo?: boolean }
}
