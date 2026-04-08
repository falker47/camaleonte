export type Role = 'civile' | 'infiltrato' | 'mrwhite'

export type SpecialRole = 'buffone' | 'mimo'

export type Screen =
  | 'home'
  | 'setup'
  | 'deal'
  | 'round'
  | 'vote'
  | 'elimination'
  | 'mrwhite_guess'
  | 'result'

export interface Player {
  id: string
  name: string
  role: Role
  specialRole?: SpecialRole
  word: string | null
  eliminated: boolean
  eliminatedInTurno: number | null
}

export interface WordPair {
  civilian: string
  undercover: string
  category?: string
}

export interface GameConfig {
  mrWhiteCount: number
  infiltratoCount: number
  specialRoles?: { buffone?: boolean; mimo?: boolean }
}
