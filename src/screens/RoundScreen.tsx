import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { AVATAR_COLORS } from '../constants/avatarColors'
import { springTap } from '../constants/animations'
import { getSurvivalThreshold } from '../utils/winCondition'
import LastChanceOverlay from '../components/LastChanceOverlay'

export default function RoundScreen() {
  const players = useGameStore(s => s.players)
  const turno = useGameStore(s => s.turno)
  const goTo = useGameStore(s => s.goTo)

  const active = players.filter(p => !p.eliminated)
  const eliminated = players.filter(p => p.eliminated)

  const isLastChance = active.length === getSurvivalThreshold(players.length) + 1
  const [showOverlay, setShowOverlay] = useState(isLastChance)
  const dismissOverlay = useCallback(() => setShowOverlay(false), [])

  const civili = active.filter(p => p.role === 'civile').length
  const camaleonti = active.filter(p => p.role === 'camaleonte').length
  const talpe = active.filter(p => p.role === 'talpa').length

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-5 overflow-y-auto">
      <AnimatePresence>
        {showOverlay && <LastChanceOverlay onDismiss={dismissOverlay} />}
      </AnimatePresence>

      <div>
        <h2 className="text-2xl font-black text-white">Turno {turno}</h2>
        <p className="text-slate-400 text-sm">Ogni giocatore dà un indizio</p>
      </div>

      {turno === 1 && players.some(p => p.specialRole === 'romeo' || p.specialRole === 'giulietta') && (
        <div className="glass rounded-xl px-4 py-3 border border-pink-400/20">
          <p className="text-pink-400 text-sm font-semibold">💕 Romeo e Giulietta sono in gioco!</p>
          <p className="text-slate-400 text-xs mt-1">Due giocatori sono legati: se uno cade, cade anche l'altro.</p>
        </div>
      )}

      {active.some(p => p.specialRole === 'riccio') && isLastChance && (
        <div className="glass rounded-xl px-4 py-3 border border-orange-400/20">
          <p className="text-orange-400 text-sm font-semibold">🦔 Il Riccio non potrà colpire in questo turno</p>
          <p className="text-slate-400 text-xs mt-1">La prossima eliminazione concluderà la partita.</p>
        </div>
      )}

      {isLastChance && (
        <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
          style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <span className="text-lg">⚠</span>
          <div>
            <p className="text-red-500 font-bold text-[13px]">Ultima possibilità</p>
            <p className="text-red-400/70 text-[11px]">Un errore e gli impostori vincono</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <div className="glass rounded-xl px-3 py-2 text-center flex-1">
          <p className="text-indigo-400 font-bold text-lg">{civili}</p>
          <p className="text-slate-500 text-xs">civili</p>
        </div>
        {camaleonti > 0 && (
          <div className="glass rounded-xl px-3 py-2 text-center flex-1">
            <p className="text-teal-400 font-bold text-lg">{camaleonti}</p>
            <p className="text-slate-500 text-xs">camaleont{camaleonti === 1 ? 'e' : 'i'}</p>
          </div>
        )}
        {talpe > 0 && (
          <div className="glass rounded-xl px-3 py-2 text-center flex-1">
            <p className="text-yellow-500 font-bold text-lg">{talpe}</p>
            <p className="text-slate-500 text-xs">talp{talpe === 1 ? 'a' : 'e'}</p>
          </div>
        )}
      </div>

      {/* Active players */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Giocatori in gioco
        </p>
        <div className="grid grid-cols-2 gap-2">
          {active.map((player) => {
            const originalIndex = players.indexOf(player)
            return (
              <div
                key={player.id}
                className="flex items-center gap-3 glass rounded-2xl px-4 py-3"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[originalIndex % AVATAR_COLORS.length]} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                  {originalIndex + 1}
                </div>
                <span className="text-white font-medium">{player.name}</span>
                {player.specialRole === 'mimo' && (
                  <span className="text-slate-300 text-xs">🤫</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
            Eliminati ({eliminated.length})
          </span>
          <span className="text-slate-600">·</span>
          {eliminated.map((player, i) => (
            <span key={player.id} className={`flex items-center gap-1 text-sm ${
              player.specialRole === 'spettro' ? 'text-cyan-400' : 'text-slate-500'
            }`}>
              {player.specialRole !== 'spettro' && <span className="text-xs">✕</span>}
              {player.specialRole === 'spettro' && <span className="text-xs">🎐</span>}
              <span className={player.specialRole === 'spettro' ? '' : 'line-through'}>{player.name}</span>
              {player.specialRole === 'spettro' && <span className="text-[10px] text-cyan-400/70">vota ancora</span>}
              {i < eliminated.length - 1 && <span className="text-slate-700">,</span>}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto">
        <p className={`text-sm text-center mb-4 ${isLastChance ? 'text-red-400/70' : 'text-slate-400'}`}>
          {isLastChance
            ? 'Scegliete bene — non ci saranno altre occasioni'
            : 'Dopo che tutti hanno dato il loro indizio, passate al voto'}
        </p>
        <motion.button
          onClick={() => goTo('vote')}
          className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold py-5 rounded-2xl text-lg transition-colors shadow-[0_8px_32px_rgba(244,63,94,0.3)]"
          {...springTap}
        >
          Vota l'impostore →
        </motion.button>
      </div>
    </div>
  )
}
