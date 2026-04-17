import { motion } from 'framer-motion'

export default function SupportOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative glass-strong rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-white font-bold text-lg">Perché è gratis?</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-6 flex flex-col gap-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Camaleonte è <span className="text-white font-semibold">completamente gratuito</span>, senza pubblicità e senza acquisti in-app. Non è un caso.
          </p>

          <p className="text-slate-400 text-sm leading-relaxed">
            Credo che i giochi debbano essere divertenti e basta. I banner pubblicitari rovinano l'esperienza, i paywall tagliano fuori chi non può permetterseli. Un gioco da festa deve essere alla portata di tutti, sempre.
          </p>

          <p className="text-slate-400 text-sm leading-relaxed">
            Dietro quest'app ci sono mesi di lavoro: design, sviluppo, test e tanto bilanciamento. E l'obiettivo è continuare così — creare nuovi giochi con la stessa filosofia, tutti gratuiti e senza compromessi.
          </p>

          <p className="text-slate-300 text-sm leading-relaxed">
            Se ti piace quello che faccio e vuoi aiutarmi a continuare, puoi lasciarmi un piccolo contributo. Non è obbligatorio, ma fa una grande differenza.
          </p>

          <motion.a
            href="https://www.paypal.com/paypalme/falker47"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-center font-bold py-3 px-8 rounded-2xl text-base text-white"
            style={{
              background: 'linear-gradient(135deg, rgba(20,184,166,0.85), rgba(16,185,129,0.9))',
              border: '1px solid rgba(45,212,191,0.5)',
              boxShadow: '0 8px 32px rgba(20,184,166,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            Supporta il progetto
          </motion.a>

          <p className="text-slate-500 text-xs text-center">
            Grazie di cuore a chi contribuisce.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
