import type { Role } from '../store/types'

export const ROLE_BORDER_COLORS: Record<Role, string> = {
  civile: 'border-indigo-400/50',
  talpa: 'border-orange-500/50',
  camaleonte: 'border-teal-400/50',
}

export const ROLE_AVATAR_BG: Record<Role, string> = {
  civile: 'from-indigo-600 to-indigo-800',
  talpa: 'from-orange-700 to-orange-900',
  camaleonte: 'from-teal-600 to-teal-800',
}

export const ROLE_FLASH_COLORS: Record<Role, string> = {
  camaleonte: 'rgba(20,184,166,0.15)',
  talpa: 'rgba(234,88,12,0.15)',
  civile: 'rgba(99,102,241,0.15)',
}
