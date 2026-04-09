interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'camaleonte'
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Annulla',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!open) return null

  const confirmClass = variant === 'camaleonte'
    ? 'bg-teal-500 hover:bg-teal-400 text-black'
    : variant === 'warning'
    ? 'bg-teal-500 hover:bg-teal-400 text-black'
    : 'bg-rose-600 hover:bg-rose-500 text-white'

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
      <div className="glass-strong rounded-3xl px-6 py-6 w-full max-w-xs flex flex-col gap-4">
        <h3 className="text-white font-bold text-lg text-center">{title}</h3>
        <p className="text-slate-400 text-sm text-center">{description}</p>
        <button
          onClick={onConfirm}
          className={`w-full font-bold py-4 rounded-2xl transition-colors ${confirmClass}`}
        >
          {confirmLabel}
        </button>
        <button
          onClick={onCancel}
          className="w-full glass-button-secondary py-3 rounded-2xl transition-colors"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}
