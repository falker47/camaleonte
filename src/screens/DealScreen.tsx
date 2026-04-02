import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import PrivacyReveal from '../components/PrivacyReveal'

export default function DealScreen() {
  const players = useGameStore(s => s.players)
  const dealIndex = useGameStore(s => s.dealIndex)
  const advanceDeal = useGameStore(s => s.advanceDeal)

  const current = players[dealIndex]
  const total = players.length

  // Wake Lock — keep screen on while passing device
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLock = lock
      }).catch(() => {})
    }
    return () => {
      wakeLock?.release().catch(() => {})
    }
  }, [])

  if (!current) return null

  return (
    <div className="flex flex-col items-center flex-1 px-5 py-8 gap-6">
      {/* Progress */}
      <div className="flex gap-1.5">
        {players.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === dealIndex ? 24 : 16,
              backgroundColor: i < dealIndex ? '#818cf8' : i === dealIndex ? '#ffffff' : 'rgba(255,255,255,0.1)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="h-1.5 rounded-full"
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-slate-400 text-sm">Passa il telefono a</p>
        <h2 className="text-3xl font-black text-white">{current.name}</h2>
        <p className="text-slate-500 text-xs">{dealIndex + 1} di {total}</p>
      </div>

      <PrivacyReveal
        playerName={current.name}
        word={current.word}
        role={current.role}
        onDone={advanceDeal}
      />
    </div>
  )
}
