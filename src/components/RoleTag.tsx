import type { Role } from '../store/types'

interface Props {
  role: Role
  size?: 'sm' | 'md' | 'lg'
}

const CONFIG: Record<Role, { label: string; classes: string }> = {
  civile: {
    label: 'Civile',
    classes: 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-300',
  },
  infiltrato: {
    label: 'Infiltrato',
    classes: 'bg-amber-500/20 border border-amber-400/30 text-amber-300',
  },
  mrwhite: {
    label: 'Mr. White',
    classes: 'bg-white/15 border border-white/20 text-white',
  },
}

export default function RoleTag({ role, size = 'md' }: Props) {
  const { label, classes } = CONFIG[role]
  const sizeClasses =
    size === 'sm' ? 'text-xs px-2 py-0.5' :
    size === 'lg' ? 'text-lg px-4 py-1.5' :
    'text-sm px-3 py-1'
  return (
    <span className={`inline-block rounded-full font-bold ${classes} ${sizeClasses}`}>
      {label}
    </span>
  )
}
