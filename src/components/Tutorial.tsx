import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  { emoji: '🎭', title: 'I tre ruoli', text: 'Ogni partita ha Civili, Infiltrati e Mr.\u00A0White. I Civili ricevono una parola, gli Infiltrati una simile ma diversa, e Mr.\u00A0White non riceve nulla!' },
  { emoji: '🔤', title: 'Le parole', text: 'Civili e Infiltrati ricevono parole della stessa categoria (es. Pizza e Focaccia), ma non sanno quale delle due hanno. Mr.\u00A0White deve bluffare senza parola.' },
  { emoji: '💬', title: 'Dai un indizio', text: 'A turno, ognuno dice una parola o frase breve per descrivere la propria parola. Attenti a non rivelare troppo... e a non tradirvi!' },
  { emoji: '🗳️', title: 'Votate', text: 'Dopo il giro di indizi, votate chi eliminare. In caso di parità si rivota o si procede con eliminazione casuale.' },
  { emoji: '🎯', title: 'Obiettivi', text: 'I Civili devono eliminare tutti gli impostori. Infiltrato e Mr.\u00A0White vincono se sopravvivono fino a quando restano solo 2\u00A0giocatori.' },
  { emoji: '🕵️', title: 'L\'ultima chance', text: 'Se Mr.\u00A0White viene eliminato, può tentare di indovinare la parola dei Civili. Se ci riesce, vince comunque!' },
  { emoji: '🏆', title: 'Punteggi', text: 'Civile: 2\u00A0pt se vincono. Infiltrato: 5\u00A0pt se sopravvive. Mr.\u00A0White: 6\u00A0pt se sopravvive o indovina la parola.' },
]

const swipeThreshold = 50

export default function Tutorial({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)

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
        className="glass-strong rounded-3xl w-full max-w-xs flex flex-col overflow-hidden"
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
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ x: direction * 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -60, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex flex-col items-center text-center gap-3 w-full"
            >
              <div className="text-6xl">{STEPS[step].emoji}</div>
              <h3 className="text-white font-bold text-lg">{STEPS[step].title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{STEPS[step].text}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-indigo-400 w-4' : 'bg-slate-600'
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
    </motion.div>
  )
}
