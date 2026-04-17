import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { usePwaInstall } from '../hooks/usePwaInstall'
import Tutorial from '../components/Tutorial'
import ScoreReference from '../components/ScoreReference'
import SupportOverlay from '../components/SupportOverlay'
import PrivacyOverlay from '../components/PrivacyOverlay'
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
  const [showScoreRef, setShowScoreRef] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center flex-1 px-6 py-12 overflow-hidden"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <Bunting />

      {/* Score reference button */}
      <motion.button
        onClick={() => setShowScoreRef(true)}
        className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full glass text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
        aria-label="Punteggi"
        variants={fadeUp}
        {...springTap}
      >
        ?
      </motion.button>

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
        className="text-6xl z-10 mt-3 bg-clip-text text-transparent"
        style={{
          fontFamily: "'Luckiest Guy', cursive",
          letterSpacing: '0.04em',
          backgroundImage:
            'linear-gradient(95deg, #0e7490 0%, #0f766e 18%, #15803d 34%, #a16207 52%, #b45309 66%, #9f1239 80%, #6b21a8 95%)',
          WebkitTextStroke: '1.5px #0a0118',
          paintOrder: 'stroke fill',
          filter:
            'brightness(1.5) saturate(0.7) drop-shadow(0 3px 6px rgba(0,0,0,0.25)) drop-shadow(0 0 20px rgba(45,212,191,0.25)) drop-shadow(0 0 30px rgba(168,85,247,0.18))',
        }}
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

      {/* Footer area */}
      <motion.div
        className="absolute bottom-4 z-10 flex flex-col items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2.5"
        variants={fadeUp}
      >
        <button
          onClick={() => setShowSupport(true)}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          100% gratis, senza pubblicità e acquisti in-app. <span className="text-teal-400">Scopri perché</span>
        </button>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <a
            href="https://falker47.github.io/Nexus-portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors tracking-wide"
          >
            &copy; falker47 - Maurizio Falconi
          </a>
          <span>·</span>
          <button
            onClick={() => setShowPrivacy(true)}
            className="hover:text-slate-300 transition-colors tracking-wide"
          >
            Privacy Policy
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showScoreRef && <ScoreReference onClose={() => setShowScoreRef(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showSupport && <SupportOverlay onClose={() => setShowSupport(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showPrivacy && <PrivacyOverlay onClose={() => setShowPrivacy(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
