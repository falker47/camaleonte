import { motion } from 'framer-motion'

const SURVIVAL_THRESHOLDS = [
  { range: '3–5', threshold: 2 },
  { range: '6–8', threshold: 3 },
  { range: '9+', threshold: 4 },
]

export default function ScoreReference({ onClose }: { onClose: () => void }) {
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-white font-bold text-lg">Tabella Punteggi</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pb-5 flex flex-col gap-4">
          {/* Soglia sopravvivenza */}
          <section>
            <h3 className="text-teal-400 font-semibold text-sm mb-2">🎯 Soglia di sopravvivenza</h3>
            <p className="text-slate-400 text-xs mb-2">
              Camaleonte e Talpa vincono se il numero di giocatori attivi scende alla soglia con almeno un impostore vivo.
            </p>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/[0.07]">
                    <th className="text-left px-3 py-2 text-slate-300 font-semibold">Giocatori</th>
                    <th className="text-left px-3 py-2 text-slate-300 font-semibold">Ultimi N</th>
                  </tr>
                </thead>
                <tbody>
                  {SURVIVAL_THRESHOLDS.map(({ range, threshold }) => (
                    <tr key={range} className="border-t border-white/5">
                      <td className="px-3 py-2 text-slate-400">{range}</td>
                      <td className="px-3 py-2 text-white font-semibold">{threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Civile */}
          <section>
            <h3 className="text-indigo-400 font-semibold text-sm mb-2">🛡️ Civile</h3>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/[0.07]">
                    <th className="text-left px-3 py-2 text-slate-300 font-semibold">Scenario</th>
                    <th className="text-right px-3 py-2 text-slate-300 font-semibold">Punti</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-slate-400">Tutti gli impostori eliminati</td>
                    <td className="px-3 py-2 text-white font-semibold text-right">2{'\u00A0'}pt</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-slate-400">Impostori eliminati, ma Camaleonte indovina</td>
                    <td className="px-3 py-2 text-amber-400 font-semibold text-right">1{'\u00A0'}pt</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-slate-400">Impostori sopravvivono</td>
                    <td className="px-3 py-2 text-slate-500 font-semibold text-right">0{'\u00A0'}pt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Camaleonte */}
          <section>
            <h3 className="text-teal-400 font-semibold text-sm mb-2">🦎 Camaleonte</h3>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/[0.07]">
                    <th className="text-left px-3 py-2 text-slate-300 font-semibold">Scenario</th>
                    <th className="text-right px-3 py-2 text-slate-300 font-semibold">≤4</th>
                    <th className="text-right px-3 py-2 text-slate-300 font-semibold">5+</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-slate-400">Eliminato, indovina la parola</td>
                    <td className="px-3 py-2 text-white font-semibold text-right">4{'\u00A0'}pt</td>
                    <td className="px-3 py-2 text-white font-semibold text-right">3{'\u00A0'}pt</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-slate-400">Sopravvive fino alla soglia</td>
                    <td className="px-3 py-2 text-white font-semibold text-right">3{'\u00A0'}pt</td>
                    <td className="px-3 py-2 text-white font-semibold text-right">4{'\u00A0'}pt</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-slate-400">Eliminato, non indovina</td>
                    <td className="px-3 py-2 text-slate-500 font-semibold text-right" colSpan={2}>0{'\u00A0'}pt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Talpa */}
          <section>
            <h3 className="text-orange-500 font-semibold text-sm mb-2">🕵️ Talpa</h3>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/[0.07]">
                    <th className="text-left px-3 py-2 text-slate-300 font-semibold">Scenario</th>
                    <th className="text-right px-3 py-2 text-slate-300 font-semibold">≤4</th>
                    <th className="text-right px-3 py-2 text-slate-300 font-semibold">5+</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-slate-400">Sopravvive fino alla soglia</td>
                    <td className="px-3 py-2 text-white font-semibold text-right">3{'\u00A0'}pt</td>
                    <td className="px-3 py-2 text-white font-semibold text-right">4{'\u00A0'}pt</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-slate-400">Eliminata, civili vincono</td>
                    <td className="px-3 py-2 text-white font-semibold text-right" colSpan={2}>1{'\u00A0'}pt / civile eliminato (max 2)</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-slate-400">Eliminata, impostori sopravvivono</td>
                    <td className="px-3 py-2 text-slate-500 font-semibold text-right" colSpan={2}>0{'\u00A0'}pt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Ruoli Speciali */}
          <section>
            <h3 className="text-purple-400 font-semibold text-sm mb-2">⭐ Ruoli Speciali</h3>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/[0.07]">
                    <th className="text-left px-3 py-2 text-slate-300 font-semibold">Ruolo</th>
                    <th className="text-left px-3 py-2 text-slate-300 font-semibold">Effetto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-red-400 font-semibold">🃏 Buffone</td>
                    <td className="px-3 py-2 text-slate-400">+2{'\u00A0'}pt se eliminato al 1° turno</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-blue-400 font-semibold">⚔️ Duellanti</td>
                    <td className="px-3 py-2 text-slate-400">Il primo eliminato perde 1{'\u00A0'}pt, l'altro guadagna 1{'\u00A0'}pt. Pareggio se eliminati nello stesso turno.</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-rose-300 font-semibold">💕 Romeo & Giulietta</td>
                    <td className="px-3 py-2 text-slate-400">Nessun effetto sui punti. Se uno cade, cade anche l'altro.</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-yellow-400 font-semibold">🦔 Riccio</td>
                    <td className="px-3 py-2 text-slate-400">Nessun bonus punti. Se eliminato, trascina un avversario con se'.</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-cyan-400 font-semibold">🎐 Spettro</td>
                    <td className="px-3 py-2 text-slate-400">Nessun bonus punti. Continua a votare dopo eliminazione.</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="px-3 py-2 text-purple-400 font-semibold">🔮 Oracolo</td>
                    <td className="px-3 py-2 text-slate-400">Nessun bonus punti. Se eliminato, svela il ruolo di un giocatore.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}
