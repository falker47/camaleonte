import type { Role } from '../store/types'

interface Props {
  role: Role
  size?: 'sm' | 'md' | 'lg'
  plural?: boolean
}

const CONFIG: Record<Role, { label: string; pluralLabel: string; classes: string }> = {
  civile: {
    label: 'Civile',
    pluralLabel: 'Civili',
    classes: 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-300',
  },
  talpa: {
    label: 'La Talpa',
    pluralLabel: 'Le Talpe',
    classes: 'bg-orange-600/20 border border-orange-500/30 text-orange-400',
  },
  camaleonte: {
    label: 'Il Camaleonte',
    pluralLabel: 'I Camaleonti',
    classes: 'bg-teal-500/20 border border-teal-400/30 text-teal-300',
  },
}

export default function RoleTag({ role, size = 'md', plural = false }: Props) {
  const { label, pluralLabel, classes } = CONFIG[role]
  const sizeClasses =
    size === 'sm' ? 'text-xs px-2 py-0.5' :
    size === 'lg' ? 'text-lg px-4 py-1.5' :
    'text-sm px-3 py-1'
  return (
    <span className={`inline-block rounded-full font-bold ${classes} ${sizeClasses}`}>
      {plural ? pluralLabel : label}
    </span>
  )
}
