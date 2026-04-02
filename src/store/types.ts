export type Role = 'civile' | 'infiltrato' | 'mrwhite'

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
  word: string | null
  eliminated: boolean
}

export interface WordPair {
  civilian: string
  undercover: string
  category?: string
}

export interface GameConfig {
  mrWhiteCount: number
  infiltratoCount: number
}
