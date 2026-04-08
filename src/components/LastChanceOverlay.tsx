import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onDismiss: () => void
}

export default function LastChanceOverlay({ onDismiss }: Props) {
  useEffect(() => {
    try { navigator?.vibrate?.([100, 50, 100]) } catch {}

    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ background: 'linear-gradient(180deg, #0a0010 0%, #1a0a20 50%, #0a0010 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onDismiss}
    >
      {/* Glow */}
      <div className="absolute w-72 h-72 rounded-full animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)' }}
      />

      {/* Particles */}
      <div className="absolute top-[18%] left-[14%] w-[3px] h-[3px] rounded-full opacity-60"
        style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.4)' }} />
      <div className="absolute top-[42%] right-[18%] w-[2px] h-[2px] rounded-full opacity-50"
        style={{ background: '#fb923c', boxShadow: '0 0 4px rgba(251,146,60,0.3)' }} />
      <div className="absolute bottom-[28%] left-[22%] w-[4px] h-[4px] rounded-full opacity-40"
        style={{ background: '#dc2626', boxShadow: '0 0 8px rgba(220,38,38,0.3)' }} />
      <div className="absolute top-[62%] right-[28%] w-[2px] h-[2px] rounded-full opacity-50"
        style={{ background: '#ef4444' }} />
      <div className="absolute top-[14%] right-[38%] w-[3px] h-[3px] rounded-full opacity-40"
        style={{ background: '#fb923c', boxShadow: '0 0 6px rgba(251,146,60,0.3)' }} />

      {/* Text */}
      <motion.div
        className="text-center z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
      >
        <p className="text-sm tracking-[6px] uppercase font-semibold mb-4"
          style={{ color: 'rgba(239,68,68,0.7)' }}>
          ⚠ Turno Finale
        </p>
        <h1 className="text-4xl font-black text-white leading-tight -tracking-wide"
          style={{ textShadow: '0 0 40px rgba(220,38,38,0.5), 0 0 80px rgba(220,38,38,0.2)' }}>
          ULTIMA<br />POSSIBILITÀ
        </h1>
        <p className="mt-5 text-[15px] text-slate-400">
          Scegliete con cura.
        </p>
      </motion.div>

      {/* Hint */}
      <p className="absolute bottom-6 text-xs tracking-[2px] text-slate-600">
        TOCCA PER CONTINUARE
      </p>
    </motion.div>
  )
}
