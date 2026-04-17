import { motion } from 'framer-motion'

export default function PrivacyOverlay({ onClose }: { onClose: () => void }) {
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
          <h2 className="text-white font-bold text-lg">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-6 flex flex-col gap-4">
          <p className="text-slate-500 text-xs italic">
            Ultimo aggiornamento: 16 aprile 2026
          </p>

          <section className="flex flex-col gap-1.5">
            <h3 className="text-teal-400 font-semibold text-sm">Raccolta dati</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Camaleonte <span className="text-white font-semibold">non raccoglie, memorizza o trasmette alcun dato personale</span>. L'app funziona interamente offline e tutti i dati di gioco restano sul dispositivo.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h3 className="text-teal-400 font-semibold text-sm">Servizi di terze parti</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              L'app non utilizza servizi di analisi, pubblicità, tracciamento o altri servizi di terze parti. L'unico link esterno presente è un collegamento facoltativo a PayPal per donazioni volontarie: cliccandolo si viene reindirizzati al sito di PayPal, soggetto alla propria{' '}
              <a
                href="https://www.paypal.com/it/legalhub/privacy-full"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 underline"
              >
                privacy policy
              </a>.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h3 className="text-teal-400 font-semibold text-sm">Permessi</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              L'app non richiede permessi speciali del dispositivo (fotocamera, microfono, posizione, contatti, ecc.).
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h3 className="text-teal-400 font-semibold text-sm">Dati dei minori</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              L'app non è rivolta a bambini di età inferiore a 13 anni e non raccoglie consapevolmente dati personali da minori.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h3 className="text-teal-400 font-semibold text-sm">Modifiche alla privacy policy</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Eventuali modifiche a questa policy saranno pubblicate su questa pagina con la data di aggiornamento.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h3 className="text-teal-400 font-semibold text-sm">Contatti</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Per domande sulla privacy, contattare:<br />{' '}
              <a
                href="mailto:falker.dev@gmail.com?subject=Camaleonte%20-%20Privacy"
                className="text-teal-400 underline break-all"
              >
                falker.dev@gmail.com
              </a>
            </p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}
