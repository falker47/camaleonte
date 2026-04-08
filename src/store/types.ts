export type Role = 'civile' | 'talpa' | 'camaleonte'

export type SpecialRole = 'buffone' | 'mimo' | 'spettro' | 'duellante'

export type Screen =
  | 'home'
  | 'setup'
  | 'deal'
  | 'round'
  | 'vote'
  | 'elimination'
  | 'camaleonte_guess'
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
  category?: string
}

export interface GameConfig {
  camaleonteCount: number
  talpaCount: number
  specialRoles?: { buffone?: boolean; mimo?: boolean; spettro?: boolean; duellanti?: boolean }
}
