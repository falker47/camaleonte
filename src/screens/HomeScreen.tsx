import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { usePwaInstall } from '../hooks/usePwaInstall'
import Tutorial from '../components/Tutorial'
import ScoreReference from '../components/ScoreReference'
import SupportOverlay from '../components/SupportOverlay'
import PrivacyOverlay from '../components/PrivacyOverlay'
import ConfirmDialog from '../components/ConfirmDialog'
import { discardSavedGame, getSavedGame, restoreSavedGame } from '../store/gamePersistence'
import type { SavedGameSummary } from '../store/gameSnapshot'
import camaleonteBrand from '../assets/brand/camaleonte-foreground.webp'
import { Bunting, TropicalFoliage } from '../components/HomeDecorations'

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
  const [savedGame, setSavedGame] = useState<SavedGameSummary | null>(null)
  const [resumingSavedGame, setResumingSavedGame] = useState(false)
  const [showDiscardSaved, setShowDiscardSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    void getSavedGame()
      .then(summary => {
        if (!cancelled) setSavedGame(summary)
      })
      .catch(error => {
        console.error('Unable to inspect saved game', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleContinueSavedGame = async () => {
    if (resumingSavedGame) return

    setResumingSavedGame(true)
    try {
      const restored = await restoreSavedGame()
      if (!restored) setSavedGame(null)
    } catch (error) {
      console.error('Unable to restore saved game', error)
      setSavedGame(null)
    } finally {
      setResumingSavedGame(false)
    }
  }

  const handleDiscardSavedGame = async () => {
    try {
      await discardSavedGame()
      setSavedGame(null)
      setShowDiscardSaved(false)
    } catch (error) {
      console.error('Unable to discard saved game', error)
    }
  }

  return (
    <div className="home-screen relative flex flex-col items-center flex-1 min-h-0 px-6 pb-4 overflow-y-auto overflow-x-hidden">
      <Bunting />

      {/* Score reference button */}
      <motion.button
        onClick={() => setShowScoreRef(true)}
        className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full glass-strong text-teal-100 hover:text-white flex items-center justify-center text-lg font-black ring-1 ring-teal-300/20 shadow-[0_6px_24px_rgba(45,212,191,0.16)] transition-all"
        aria-label="Punteggi"
        {...springTap}
      >
        ?
      </motion.button>

      {/* A static glow keeps the illustration separate from the background. */}
      <div className="home-brand-glow" aria-hidden="true" />

      <div className="home-content z-10 flex flex-col items-center w-full shrink-0 my-auto">
        {/* The same transparent brand artwork is used by the launch screen. */}
        <h1 className="z-10 w-full max-w-[400px] shrink-0">
          <img
            src={camaleonteBrand}
            alt="Camaleonte"
            width={1280}
            height={747}
            fetchPriority="high"
            decoding="async"
            className="home-brand-image block w-full h-auto object-contain"
          />
        </h1>

        {/* Tagline */}
        <motion.p
          className="home-tagline text-teal-100 tracking-[2px] text-base z-10 mt-2"
          style={{ fontFamily: "'Permanent Marker', cursive" }}
        >
          Chi si mimetizza fra voi?
        </motion.p>

        {/* Divider */}
        <motion.div
          className="home-divider w-15 h-0.5 z-10"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.5), transparent)' }}
        />

        {/* Stats row */}
        <motion.div className="flex gap-6 z-10">
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

        {/* Recovery card: show useful progress without growing the Home layout. */}
        {savedGame && (
          <div className="relative z-10 mt-5 w-full max-w-sm overflow-hidden rounded-2xl border border-teal-300/30 bg-slate-950/80 p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-2.5">
              <div aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-300/25 bg-teal-400/15 text-teal-200">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a9 9 0 1 1-9 9" />
                  <path d="M3 3v6h6" />
                  <path d="m10 8 6 4-6 4V8Z" />
                </svg>
              </div>
              <p className="min-w-0 flex-1 text-sm font-bold text-white">Partita salvata</p>
              <button
                type="button"
                onClick={() => setShowDiscardSaved(true)}
                className="shrink-0 rounded-lg px-2 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-400/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-rose-300"
                aria-label="Abbandona partita salvata"
              >
                Abbandona
              </button>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-300">
              <span>{savedGame.playerCount} giocatori</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="font-semibold text-teal-200">Manche {savedGame.manche}{savedGame.totalManche !== null ? `/${savedGame.totalManche}` : ''}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>Turno {savedGame.turno}</span>
            </div>

            {savedGame.totalManche !== null && savedGame.totalManche > 0 && (
              <div
                role="progressbar"
                aria-label="Avanzamento delle manche"
                aria-valuemin={0}
                aria-valuemax={savedGame.totalManche}
                aria-valuenow={Math.min(savedGame.manche, savedGame.totalManche)}
                className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10"
              >
                <div
                  className="h-full rounded-full bg-teal-400/80"
                  style={{ width: `${Math.min(100, Math.max(0, savedGame.manche / savedGame.totalManche * 100))}%` }}
                />
              </div>
            )}

            <motion.button
              type="button"
              onClick={() => { void handleContinueSavedGame() }}
              disabled={resumingSavedGame}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-teal-200/35 bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-base font-bold text-white shadow-[0_6px_18px_rgba(13,148,136,0.18)] transition-colors hover:from-teal-500 hover:to-emerald-500 disabled:cursor-wait disabled:opacity-60"
              {...springTap}
            >
              {resumingSavedGame ? 'Ripristino…' : 'Continua partita'}
              {!resumingSavedGame && (
                <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
            </motion.button>
          </div>
        )}

        <motion.button
          onClick={() => goTo('setup')}
          className={`z-10 ${savedGame ? 'mt-3 w-full max-w-sm py-3.5 px-10 text-base' : 'mt-7 py-4 px-14 text-lg'} rounded-2xl font-bold transition-colors text-white`}
          style={savedGame ? {
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
          } : {
            background: 'linear-gradient(135deg, rgba(20,184,166,0.85), rgba(16,185,129,0.9))',
            border: '1px solid rgba(45,212,191,0.5)',
            boxShadow: '0 8px 32px rgba(20,184,166,0.35), 0 0 60px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
          {...springTap}
        >
          {savedGame ? 'Nuova partita' : 'Gioca Ora'}
        </motion.button>

        {/* Secondary buttons */}
        <motion.div className="flex gap-3 mt-3.5 z-10">
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
            >
              Installa App
            </motion.button>
          )}
        </motion.div>
      </div>

      <TropicalFoliage />

      {/* Footer area */}
      <motion.div
        className="home-footer z-10 flex flex-col items-center shrink-0 gap-1.5 mt-6 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2.5"
      >
        <button
          onClick={() => setShowSupport(true)}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          100% gratis, senza pubblicità e acquisti in-app. <span className="text-teal-400">Scopri perché</span>
        </button>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <a
            href="https://falker47.github.io/"
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

      <ConfirmDialog
        open={showDiscardSaved}
        title="Abbandonare la partita salvata?"
        description="Il salvataggio locale verrà cancellato definitivamente."
        confirmLabel="Abbandona"
        onConfirm={() => { void handleDiscardSavedGame() }}
        onCancel={() => setShowDiscardSaved(false)}
      />
    </div>
  )
}
