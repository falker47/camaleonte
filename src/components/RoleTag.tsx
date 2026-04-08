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
  talpa: {
    label: 'La Talpa',
    classes: 'bg-yellow-600/20 border border-yellow-500/30 text-yellow-400',
  },
  camaleonte: {
    label: 'Il Camaleonte',
    classes: 'bg-teal-500/20 border border-teal-400/30 text-teal-300',
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
