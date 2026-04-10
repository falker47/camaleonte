import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

const pt = (n: number) => `${n}\u00A0pt`

const SURVIVAL_THRESHOLDS = [
  { range: '3–5', threshold: 2 },
  { range: '6–8', threshold: 3 },
  { range: '9+', threshold: 4 },
]

const CIVILE_ROWS = [
  { scenario: 'Tutti gli impostori eliminati', points: pt(2), color: 'text-white' },
  { scenario: 'Impostori eliminati, ma Camaleonte indovina', points: pt(1), color: 'text-amber-400' },
  { scenario: 'Impostori sopravvivono', points: pt(0), color: 'text-slate-500' },
]

const CAMALEONTE_ROWS: ScoreRow[] = [
  { scenario: 'Eliminato, indovina la parola', small: pt(4), large: pt(3) },
  { scenario: 'Sopravvive fino alla soglia', small: pt(3), large: pt(4) },
  { scenario: 'Eliminato, non indovina', merged: pt(0), color: 'text-slate-500' },
]

const TALPA_ROWS: ScoreRow[] = [
  { scenario: 'Sopravvive fino alla soglia', small: pt(3), large: pt(4) },
  { scenario: 'Eliminata, civili vincono', merged: `1\u00A0pt / civile eliminato (max 2)` },
  { scenario: 'Eliminata, impostori sopravvivono', merged: pt(0), color: 'text-slate-500' },
]

const SPECIAL_ROLES = [
  { name: '🃏 Buffone', color: 'text-red-400', effect: `+${pt(2)} se eliminato al 1° turno` },
  { name: '⚔️ Duellanti', color: 'text-blue-400', effect: `Il primo eliminato perde 1\u00A0pt, l'altro guadagna 1\u00A0pt. Pareggio se eliminati nello stesso turno.` },
  { name: '💕 Romeo & Giulietta', color: 'text-rose-300', effect: 'Nessun effetto sui punti. Se uno cade, cade anche l\'altro.' },
  { name: '🦔 Riccio', color: 'text-yellow-400', effect: 'Nessun bonus punti. Se eliminato, trascina un avversario con sé.' },
  { name: '🎐 Spettro', color: 'text-cyan-400', effect: 'Nessun bonus punti. Continua a votare dopo eliminazione.' },
  { name: '🔮 Oracolo', color: 'text-purple-400', effect: 'Nessun bonus punti. Se eliminato, svela il ruolo di un giocatore.' },
]

type ScoreRow = {
  scenario: string
  small?: string
  large?: string
  merged?: string
  color?: string
}

function Section({ icon, title, color, description, children }: { icon: string; title: string; color: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <h3 className={`${color} font-semibold text-sm mb-2`}>{icon} {title}</h3>
      {description}
      <div className="rounded-xl overflow-hidden border border-white/10">
        {children}
      </div>
    </section>
  )
}

function ScoreTable({ columns, children }: { columns: { label: string; align?: 'left' | 'right' }[]; children: ReactNode }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-white/[0.07]">
          {columns.map(({ label, align = 'left' }) => (
            <th key={label} className={`text-${align} px-3 py-2 text-slate-300 font-semibold`}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

function TwoColScoreRows({ rows }: { rows: ScoreRow[] }) {
  return rows.map(({ scenario, small, large, merged, color = 'text-white' }) => (
    <tr key={scenario} className="border-t border-white/5">
      <td className="px-3 py-2 text-slate-400">{scenario}</td>
      {merged !== undefined ? (
        <td className={`px-3 py-2 ${color} font-semibold text-right`} colSpan={2}>{merged}</td>
      ) : (
        <>
          <td className={`px-3 py-2 ${color} font-semibold text-right`}>{small}</td>
          <td className={`px-3 py-2 ${color} font-semibold text-right`}>{large}</td>
        </>
      )}
    </tr>
  ))
}

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

        <div className="overflow-y-auto px-5 pb-5 flex flex-col gap-4">
          <Section
            icon="🎯"
            title="Soglia di sopravvivenza"
            color="text-teal-400"
            description={
              <p className="text-slate-400 text-xs mb-2">
                Ogni impostore (camaleonte e talpa) gioca per sé: <br />esso vince se è ancora in gioco quando i giocatori attivi scendono alla soglia.
              </p>
            }
          >
            <ScoreTable columns={[{ label: 'Giocatori' }, { label: 'Ultimi N' }]}>
              {SURVIVAL_THRESHOLDS.map(({ range, threshold }) => (
                <tr key={range} className="border-t border-white/5">
                  <td className="px-3 py-2 text-slate-400">{range}</td>
                  <td className="px-3 py-2 text-white font-semibold">{threshold}</td>
                </tr>
              ))}
            </ScoreTable>
          </Section>

          <Section icon="🛡️" title="Civile" color="text-indigo-400">
            <ScoreTable columns={[{ label: 'Scenario' }, { label: 'Punti', align: 'right' }]}>
              {CIVILE_ROWS.map(({ scenario, points, color }) => (
                <tr key={scenario} className="border-t border-white/5">
                  <td className="px-3 py-2 text-slate-400">{scenario}</td>
                  <td className={`px-3 py-2 ${color} font-semibold text-right`}>{points}</td>
                </tr>
              ))}
            </ScoreTable>
          </Section>

          <Section icon="🦎" title="Camaleonte" color="text-teal-400">
            <ScoreTable columns={[{ label: 'Scenario' }, { label: '≤4', align: 'right' }, { label: '5+', align: 'right' }]}>
              <TwoColScoreRows rows={CAMALEONTE_ROWS} />
            </ScoreTable>
          </Section>

          <Section icon="🕵️" title="Talpa" color="text-orange-500">
            <ScoreTable columns={[{ label: 'Scenario' }, { label: '≤4', align: 'right' }, { label: '5+', align: 'right' }]}>
              <TwoColScoreRows rows={TALPA_ROWS} />
            </ScoreTable>
          </Section>

          <Section icon="⭐" title="Ruoli Speciali" color="text-purple-400">
            <ScoreTable columns={[{ label: 'Ruolo' }, { label: 'Effetto' }]}>
              {SPECIAL_ROLES.map(({ name, color, effect }) => (
                <tr key={name} className="border-t border-white/5">
                  <td className={`px-3 py-2 ${color} font-semibold`}>{name}</td>
                  <td className="px-3 py-2 text-slate-400">{effect}</td>
                </tr>
              ))}
            </ScoreTable>
          </Section>
        </div>
      </motion.div>
    </motion.div>
  )
}
