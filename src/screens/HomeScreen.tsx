import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { usePwaInstall } from '../hooks/usePwaInstall'
import Tutorial from '../components/Tutorial'
import camaleontePng from '../assets/camaleonte.png'
import { Bunting, TropicalFoliage } from '../components/HomeDecorations'

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
      <Bunting />

      {/* Ambient blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Center glow */}
      <div className="center-glow" />

      {/* Confetti — mostly on the sides */}
      <div className="confetti confetti-1" />
      <div className="confetti confetti-2" />
      <div className="confetti confetti-3" />
      <div className="confetti confetti-4" />
      <div className="confetti confetti-5" />
      <div className="confetti confetti-6" />
      <div className="confetti confetti-7" />
      <div className="confetti confetti-8" />
      <div className="confetti confetti-9" />
      <div className="confetti confetti-10" />
      <div className="confetti confetti-11" />
      <div className="confetti confetti-12" />
      <div className="confetti confetti-13" />
      <div className="confetti confetti-14" />
      <div className="confetti confetti-15" />
      <div className="confetti confetti-16" />

      {/* Camaleonte icon */}
      <motion.div className="z-10" variants={fadeUp}>
        <img
          src={camaleontePng}
          alt="Camaleonte"
          className="w-[160px] h-[160px] object-contain"
          style={{
            filter:
              'drop-shadow(0 0 30px rgba(45,212,191,0.5)) drop-shadow(0 0 50px rgba(139,92,246,0.3)) drop-shadow(0 0 20px rgba(74,222,128,0.3))',
          }}
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-5xl z-10 mt-3 title-glow bg-gradient-to-r from-green-400 via-teal-300 to-violet-400 bg-clip-text text-transparent"
        style={{ fontFamily: "'Bangers', cursive" }}
        variants={fadeUp}
      >
        CAMALEONTE
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-teal-200 tracking-[2px] text-base z-10 mt-2"
        style={{ fontFamily: "'Permanent Marker', cursive" }}
        variants={fadeUp}
      >
        Chi si mimetizza fra voi?
      </motion.p>

      {/* Divider */}
      <motion.div
        className="w-15 h-0.5 my-5 z-10"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.5), transparent)' }}
        variants={fadeUp}
      />

      {/* Stats row */}
      <motion.div className="flex gap-6 z-10" variants={fadeUp}>
        <div className="text-center">
          <div className="text-xl font-extrabold text-white">3-12</div>
          <div className="text-[10px] text-teal-400/70 uppercase tracking-[1.5px]">Giocatori</div>
        </div>
        <div className="w-px bg-white/10 self-stretch" />
        <div className="text-center">
          <div className="text-xl font-extrabold text-white">5-15</div>
          <div className="text-[10px] text-teal-400/70 uppercase tracking-[1.5px]">Minuti</div>
        </div>
        <div className="w-px bg-white/10 self-stretch" />
        <div className="text-center">
          <div className="text-xl font-extrabold text-white">1</div>
          <div className="text-[10px] text-teal-400/70 uppercase tracking-[1.5px]">Device</div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        onClick={() => goTo('setup')}
        className="z-10 mt-7 font-bold py-4 px-14 rounded-2xl text-lg transition-colors text-white"
        style={{
          background: 'linear-gradient(135deg, rgba(20,184,166,0.85), rgba(16,185,129,0.9))',
          border: '1px solid rgba(45,212,191,0.5)',
          boxShadow: '0 8px 32px rgba(20,184,166,0.35), 0 0 60px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
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

      <TropicalFoliage />

      {/* Footer */}
      <motion.a
        href="https://falker47.github.io/Nexus-portfolio/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-5 z-10 text-xs text-slate-500 hover:text-slate-300 transition-colors tracking-wide"
        variants={fadeUp}
      >
        &copy; {new Date().getFullYear()} Maurizio Falconi - falker47
      </motion.a>

      <AnimatePresence>
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
