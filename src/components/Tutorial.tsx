import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import camaleontePng from '../assets/camaleonte.png'
import ScoreReference from './ScoreReference'

const STEPS: { emoji?: string; image?: string; title: string; text: string }[] = [
  { emoji: '🎭', title: 'I tre ruoli', text: 'Ogni partita ha Civili, Talpa e Camaleonte. I Civili ricevono una parola, la Talpa una simile ma diversa, e il Camaleonte non riceve nulla!' },
  { emoji: '🔤', title: 'Le parole', text: 'Civili e Talpa ricevono parole della stessa categoria (es. Pizza e Focaccia), ma non sanno quale delle due hanno. Il Camaleonte deve bluffare senza parola.' },
  { emoji: '💬', title: 'Dai un indizio', text: 'A turno, ognuno dice una parola o frase breve per descrivere la propria parola. Attenti a non rivelare troppo... e a non tradirvi!' },
  { emoji: '🗳️', title: 'Votate', text: 'Dopo il giro di indizi, votate chi eliminare. In caso di parità si rivota o si procede con eliminazione casuale.' },
  { emoji: '🎯', title: 'Obiettivi', text: 'I Civili devono eliminare tutti gli impostori. La Talpa e il Camaleonte vincono se sopravvivono abbastanza a lungo \u2014 più siete, più turni dovranno resistere!' },
  { image: camaleontePng, title: 'L\'ultima chance', text: 'Se il Camaleonte viene eliminato, può tentare di indovinare la parola dei Civili. Se ci riesce, vince comunque!' },
  { emoji: '⭐', title: 'Ruoli Speciali', text: 'Nel setup puoi attivare ruoli speciali pensati per giocatori già rodati che vogliono aggiungere un tocco di pepe in più alle loro partite!' },
  { emoji: '🏆', title: 'Punteggi', text: 'Ogni round assegna punti in base al ruolo e all\'esito della partita. I Civili guadagnano eliminando gli impostori, il Camaleonte e la Talpa puntano a sopravvivere o a sfruttare le loro abilità speciali. I punti variano in base al numero di giocatori.' },
]

const swipeThreshold = 50

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -300 : 300,
    opacity: 0,
  }),
}

export default function Tutorial({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [showScoreRef, setShowScoreRef] = useState(false)

  const go = (next: number) => {
    if (next < 0 || next >= STEPS.length) return
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  return (
    <motion.div
      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative glass-strong rounded-3xl w-full max-w-xs flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full glass text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          aria-label="Chiudi"
        >
          ✕
        </button>

        {/* Content area */}
        <div
          className="relative px-6 pt-8 pb-4 min-h-[260px] flex items-center"
          onPointerDown={(e) => {
            const startX = e.clientX
            const onUp = (ev: PointerEvent) => {
              const dx = ev.clientX - startX
              if (dx < -swipeThreshold) go(step + 1)
              else if (dx > swipeThreshold) go(step - 1)
              window.removeEventListener('pointerup', onUp)
            }
            window.addEventListener('pointerup', onUp)
          }}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 200, damping: 28 },
                opacity: { duration: 0.25 },
              }}
              className="flex flex-col items-center text-center gap-3 w-full"
            >
              {STEPS[step].image
                ? <img src={STEPS[step].image} alt={STEPS[step].title} className="w-16 h-16 object-contain" />
                : <div className="text-6xl">{STEPS[step].emoji}</div>
              }
              <h3 className="text-white font-bold text-lg">{STEPS[step].title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{STEPS[step].text}</p>
              {step === STEPS.length - 1 && (
                <button
                  onClick={() => setShowScoreRef(true)}
                  className="mt-1 text-teal-400 text-sm font-semibold underline underline-offset-2 hover:text-teal-300 transition-colors"
                >
                  Vedi tabella punteggi
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-teal-400 w-4' : 'bg-slate-600'
                }`}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3 px-5 pb-5">
          {step > 0 ? (
            <button
              onClick={() => go(step - 1)}
              className="glass-button-secondary flex-1 py-3 rounded-2xl text-sm transition-colors"
            >
              Indietro
            </button>
          ) : (
            <div className="flex-1" />
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => go(step + 1)}
              className="glass-button flex-1 py-3 rounded-2xl text-sm transition-colors"
            >
              Avanti
            </button>
          ) : (
            <button
              onClick={onClose}
              className="glass-button flex-1 py-3 rounded-2xl text-sm transition-colors"
            >
              Ho capito!
            </button>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {showScoreRef && <ScoreReference onClose={() => setShowScoreRef(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
