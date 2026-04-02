import type { Role } from '../store/types'

interface Props {
  role: Role
  size?: 'sm' | 'md' | 'lg'
}

const CONFIG: Record<Role, { label: string; classes: string }> = {
  civile: {
    label: 'Civile',
    classes: 'bg-indigo-600 text-white',
  },
  infiltrato: {
    label: 'Infiltrato',
    classes: 'bg-amber-500 text-black',
  },
  mrwhite: {
    label: 'Mr. White',
    classes: 'bg-white text-black',
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
