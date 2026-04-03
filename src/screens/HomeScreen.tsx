import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { usePwaInstall } from '../hooks/usePwaInstall'
import Tutorial from '../components/Tutorial'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

const springTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
}

export default function HomeScreen() {
  const goTo = useGameStore(s => s.goTo)
  const { canInstall, install } = usePwaInstall()
  const [showTutorial, setShowTutorial] = useState(false)

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center flex-1 px-6 py-12 overflow-hidden"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Center glow */}
      <div className="center-glow" />

      {/* Floating particles */}
      <div className="particle particle-1" />
      <div className="particle particle-2" />
      <div className="particle particle-3" />
      <div className="particle particle-4" />
      <div className="particle particle-5" />
      <div className="particle particle-6" />

      {/* Spy icon */}
      <motion.div
        className="text-7xl z-10 spy-float"
        style={{ filter: 'drop-shadow(0 0 30px rgba(129,140,248,0.5))' }}
        variants={fadeUp}
      >
        🕵️
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-4xl font-black text-white z-10 mt-3 title-glow"
        variants={fadeUp}
      >
        Undercover
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-violet-300 italic uppercase tracking-[3px] text-sm z-10 mt-2"
        variants={fadeUp}
      >
        Chi è l'impostore?
      </motion.p>

      {/* Divider */}
      <motion.div
        className="w-15 h-0.5 my-5 z-10"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(129,140,248,0.5), transparent)' }}
        variants={fadeUp}
      />

      {/* Stats row */}
      <motion.div className="flex gap-6 z-10" variants={fadeUp}>
        <div className="text-center">
          <div className="text-xl font-extrabold text-white">3-10</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-[1.5px]">Giocatori</div>
        </div>
        <div className="w-px bg-white/10 self-stretch" />
        <div className="text-center">
          <div className="text-xl font-extrabold text-white">5-15</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-[1.5px]">Minuti</div>
        </div>
        <div className="w-px bg-white/10 self-stretch" />
        <div className="text-center">
          <div className="text-xl font-extrabold text-white">1</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-[1.5px]">Device</div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        onClick={() => goTo('setup')}
        className="glass-button z-10 mt-7 font-bold py-4 px-14 rounded-2xl text-lg transition-colors"
        style={{ boxShadow: '0 0 30px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.1)' }}
        variants={fadeUp}
        {...springTap}
      >
        Gioca Ora
      </motion.button>

      {/* Secondary buttons */}
      <motion.div className="flex gap-3 mt-3.5 z-10" variants={fadeUp}>
        <motion.button
          onClick={() => setShowTutorial(true)}
          className="glass-button-secondary py-2.5 px-5 rounded-xl text-sm transition-colors"
          {...springTap}
        >
          Come si gioca
        </motion.button>

        {canInstall && (
          <motion.button
            onClick={install}
            className="glass-button-secondary py-2.5 px-5 rounded-xl text-sm transition-colors"
            {...springTap}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Installa App
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
