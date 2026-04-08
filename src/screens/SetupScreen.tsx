import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import BackButton from '../components/BackButton'
import SpecialRolesOverlay from '../components/SpecialRolesOverlay'
import { springTap } from '../constants/animations'
import { MAX_PLAYERS, MAX_MR_WHITE, MAX_INFILTRATI } from '../constants/gameConfig'

const SUGGESTED_ROLES: Record<number, [number, number]> = {
  3: [1, 0], 4: [1, 0],
  5: [1, 1], 6: [1, 1],
  7: [1, 2], 8: [1, 2],
  9: [1, 3], 10: [1, 3],
  11: [2, 3], 12: [2, 3],
}

interface Slot { id: number; name: string }
let nextSlotId = 3

export default function SetupScreen() {
  const config = useGameStore(s => s.config)
  const setPlayerNames = useGameStore(s => s.setPlayerNames)
  const setConfig = useGameStore(s => s.setConfig)
  const startGame = useGameStore(s => s.startGame)
  const goTo = useGameStore(s => s.goTo)

  const [slots, setSlots] = useState<Slot[]>([{ id: 0, name: '' }, { id: 1, name: '' }, { id: 2, name: '' }])
  const [mrWhiteCount, setMrWhiteCount] = useState(config.mrWhiteCount)
  const [infiltratoCount, setInfiltratoCount] = useState(config.infiltratoCount)
  const [manualOverride, setManualOverride] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const pendingFocus = useRef<number | null>(null)
  const ctaInputRef = useRef<HTMLInputElement | null>(null)
  const [ctaValue, setCtaValue] = useState('')
  const [ctaError, setCtaError] = useState('')
  const [buffoneEnabled, setBuffoneEnabled] = useState(false)
  const [mimoEnabled, setMimoEnabled] = useState(false)
  const [showSpecialRoles, setShowSpecialRoles] = useState(false)

  // Auto-focus CTA input on mount
  useEffect(() => {
    ctaInputRef.current?.focus()
  }, [])

  // Auto-focus new field after adding
  useEffect(() => {
    if (pendingFocus.current !== null) {
      inputRefs.current[pendingFocus.current]?.focus()
      pendingFocus.current = null
    }
  }, [slots.length])

  const names = slots.map(s => s.name)
  const validNames = names.filter(n => n.trim().length > 0)

  // Auto-suggest roles based on player count (unless manually overridden)
  useEffect(() => {
    if (manualOverride) return
    const count = validNames.length
    const suggestion = SUGGESTED_ROLES[count]
    if (suggestion) {
      setMrWhiteCount(suggestion[0])
      setInfiltratoCount(suggestion[1])
    }
  }, [validNames.length, manualOverride])

  // Clamp role counts when players are removed
  useEffect(() => {
    const maxTotal = Math.max(0, validNames.length - 2)
    const clampedMw = Math.min(mrWhiteCount, MAX_MR_WHITE, Math.max(0, maxTotal - infiltratoCount))
    const clampedInf = Math.min(infiltratoCount, MAX_INFILTRATI, Math.max(0, maxTotal - clampedMw))
    if (clampedMw !== mrWhiteCount) setMrWhiteCount(clampedMw)
    if (clampedInf !== infiltratoCount) setInfiltratoCount(clampedInf)
  }, [validNames.length, mrWhiteCount, infiltratoCount])

  // Auto-disable buffone if not enough players
  useEffect(() => {
    if (validNames.length < 5) setBuffoneEnabled(false)
  }, [validNames.length])

  const handleMrWhiteChange = (v: number) => {
    setManualOverride(true)
    setMrWhiteCount(v)
  }

  const handleInfiltratoChange = (v: number) => {
    setManualOverride(true)
    setInfiltratoCount(v)
  }

  // Dynamic max: always guarantee at least 2 civilians
  const maxTotalImpostors = Math.max(0, validNames.length - 2)
  const effectiveMaxMrWhite = Math.min(MAX_MR_WHITE, Math.max(0, maxTotalImpostors - infiltratoCount))
  const effectiveMaxInfiltrato = Math.min(MAX_INFILTRATI, Math.max(0, maxTotalImpostors - mrWhiteCount))

  const suggestion = SUGGESTED_ROLES[validNames.length]
  const isCustomRoles = manualOverride && suggestion != null &&
    (mrWhiteCount !== suggestion[0] || infiltratoCount !== suggestion[1])

  const impostorCount = mrWhiteCount + infiltratoCount
  const civilianCount = Math.max(0, validNames.length - impostorCount)
  const hasDuplicates = new Set(validNames.map(n => n.trim().toLowerCase())).size < validNames.length

  // Track which slot indices have duplicate names
  const duplicateIndices = new Set<number>()
  if (hasDuplicates) {
    const seen = new Map<string, number>()
    slots.forEach((slot, i) => {
      const key = slot.name.trim().toLowerCase()
      if (key.length === 0) return
      if (seen.has(key)) {
        duplicateIndices.add(seen.get(key)!)
        duplicateIndices.add(i)
      } else {
        seen.set(key, i)
      }
    })
  }
  const hasEmptySlots = slots.some(s => s.name.trim().length === 0)
  const canStart =
    validNames.length >= 3 &&
    impostorCount >= 1 &&
    impostorCount < validNames.length - 1 &&
    !hasDuplicates &&
    !hasEmptySlots

  const addPlayer = () => {
    if (slots.length < MAX_PLAYERS) setSlots([...slots, { id: nextSlotId++, name: '' }])
  }

  const removePlayer = (i: number) => {
    if (slots.length <= 3) return
    setSlots(slots.filter((_, idx) => idx !== i))
  }

  const updateName = (i: number, value: string) => {
    const next = [...slots]
    next[i] = { ...next[i], name: value }
    setSlots(next)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (i === slots.length - 1) {
      if (slots.length < MAX_PLAYERS) {
        pendingFocus.current = i + 1
        addPlayer()
      }
    } else {
      inputRefs.current[i + 1]?.focus()
    }
  }

  const handleCtaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const trimmed = ctaValue.trim()
    if (!trimmed) return
    if (slots.length >= MAX_PLAYERS) return
    // Check duplicate
    const isDuplicate = slots.some(s => s.name.trim().toLowerCase() === trimmed.toLowerCase())
    if (isDuplicate) {
      setCtaError('Nome già inserito')
      return
    }
    setCtaError('')
    // Fill first empty slot if one exists, otherwise add a new one
    const emptyIndex = slots.findIndex(s => s.name.trim().length === 0)
    if (emptyIndex !== -1) {
      const next = [...slots]
      next[emptyIndex] = { ...next[emptyIndex], name: trimmed }
      setSlots(next)
    } else {
      setSlots([...slots, { id: nextSlotId++, name: trimmed }])
    }
    setCtaValue('')
  }

  const handleStart = () => {
    const filtered = names.filter(n => n.trim().length > 0)
    setPlayerNames(filtered)
    setConfig({ mrWhiteCount, infiltratoCount, specialRoles: { buffone: buffoneEnabled && filtered.length >= 5, mimo: mimoEnabled } })
    startGame()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-5 overflow-y-auto">
      <div className="flex items-center gap-3">
        <BackButton onClick={() => goTo('home')} />
        <h2 className="text-xl font-bold text-white">Nuova Partita</h2>
      </div>

      {/* CTA Input */}
      <div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-lg font-bold pointer-events-none">+</span>
          <input
            ref={ctaInputRef}
            type="text"
            value={ctaValue}
            onChange={e => { setCtaValue(e.target.value); setCtaError('') }}
            onKeyDown={handleCtaKeyDown}
            placeholder="Aggiungi giocatore..."
            disabled={slots.length >= MAX_PLAYERS}
            className="w-full rounded-2xl pl-10 pr-12 py-4 text-base bg-indigo-500/8 border-2 border-indigo-400/45 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/70 focus:shadow-[0_0_30px_rgba(99,102,241,0.12)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ userSelect: 'text', touchAction: 'auto' }}
            maxLength={20}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] border border-white/10 rounded px-1.5 py-0.5 font-mono pointer-events-none">⏎</span>
        </div>
        {ctaError && (
          <p className="text-rose-400 text-xs mt-1 ml-1">{ctaError}</p>
        )}
        {!ctaError && (
          <p className="text-slate-600 text-xs mt-1 ml-1">Scrivi un nome e premi Invio</p>
        )}
      </div>

      {/* Player names */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Giocatori ({validNames.length})
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence initial={false}>
            {slots.map((slot, i) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative"
              >
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-indigo-400 text-xs font-bold pointer-events-none z-10">
                    {i + 1}.
                  </span>
                  {slots.length > 3 && (
                    <button
                      onClick={() => removePlayer(i)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 text-xs z-10 w-4 h-4 flex items-center justify-center"
                      aria-label="Rimuovi"
                    >
                      ✕
                    </button>
                  )}
                  <input
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    value={slot.name}
                    onChange={e => updateName(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    placeholder={`Gioc. ${i + 1}`}
                    className={`w-full glass-input rounded-lg pl-6 pr-2.5 py-2 text-sm ${duplicateIndices.has(i) ? 'border-rose-500/60' : ''}`}
                    style={{ userSelect: 'text', touchAction: 'auto' }}
                    maxLength={20}
                  />
                </div>
                {duplicateIndices.has(i) && (
                  <p className="text-rose-400 text-[10px] mt-0.5 ml-1">Duplicato</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {slots.length < MAX_PLAYERS && (
          <>
            <p className="text-slate-600 text-xs mt-1">
              Premi Invio per aggiungere
            </p>
            <button
              onClick={addPlayer}
              className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm py-2 transition-colors"
            >
              + Aggiungi giocatore
            </button>
          </>
        )}
      </div>

      {/* Role counts */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Ruoli
        </h3>
        <div className="flex flex-col gap-3">
          <RoleCounter
            label="Mr. White"
            description={"Non ha nessuna parola.\nDeve bluffare e indovinarla!"}
            value={mrWhiteCount}
            min={0}
            max={effectiveMaxMrWhite}
            color="white"
            onChange={handleMrWhiteChange}
          />
          <RoleCounter
            label="Infiltrato"
            description={"Ha una parola diversa...\nMa non lo sa!"}
            value={infiltratoCount}
            min={0}
            max={effectiveMaxInfiltrato}
            color="amber"
            onChange={handleInfiltratoChange}
          />
        </div>

        {isCustomRoles && (
          <p className="text-amber-400/80 text-xs mt-2">
            ⚠️ I valori predefiniti sono quelli consigliati per un gioco bilanciato. Modificarli potrebbe sbilanciare la partita.
          </p>
        )}

        {/* Validation errors */}
        {validNames.length < 3 && (
          <p className="text-rose-400 text-xs mt-2">Servono almeno 3 giocatori</p>
        )}
        {validNames.length >= 3 && impostorCount === 0 && (
          <p className="text-rose-400 text-xs mt-2">Aggiungi almeno 1 impostore</p>
        )}
        {hasDuplicates && (
          <p className="text-rose-400 text-xs mt-2">Ci sono nomi duplicati</p>
        )}

        {/* Info box */}
        {validNames.length >= 3 && impostorCount >= 1 && (
          <div className="glass rounded-2xl px-4 py-3 mt-3">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              <span className="text-indigo-400">{civilianCount} Civili</span>
              <span className="text-slate-600">·</span>
              <span className="text-white">{mrWhiteCount} Mr. White</span>
              {infiltratoCount > 0 && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400">{infiltratoCount} Infiltrat{infiltratoCount === 1 ? 'o' : 'i'}</span>
                </>
              )}
            </div>
            {infiltratoCount > 0 && (
              <p className="text-slate-500 text-xs mt-1.5">
                L'infiltrato riceve una parola diversa ma non sa di esserlo!
              </p>
            )}
            {mrWhiteCount > 0 && (
              <p className="text-slate-500 text-xs mt-1">
                Mr. White non ha nessuna parola e deve bluffare.
              </p>
            )}
          </div>
        )}

        {/* Special roles button */}
        <div className="glass rounded-2xl overflow-hidden mt-3">
          <motion.button
            onClick={() => setShowSpecialRoles(true)}
            className="w-full px-4 py-3 flex items-center justify-between"
            {...springTap}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🎭</span>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Ruoli Speciali</p>
                {(() => {
                  const active = [buffoneEnabled && validNames.length >= 5, mimoEnabled].filter(Boolean).length
                  return active > 0
                    ? <p className="text-indigo-400 text-xs">{active} attiv{active === 1 ? 'o' : 'i'}</p>
                    : <p className="text-slate-500 text-xs">Nessuno attivo</p>
                })()}
              </div>
            </div>
            <span className="text-slate-500 text-sm">›</span>
          </motion.button>
          {(buffoneEnabled && validNames.length >= 5 || mimoEnabled) && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {buffoneEnabled && validNames.length >= 5 && (
                <span className="inline-block rounded-full bg-red-500/20 border border-red-400/30 text-red-400 text-xs font-bold px-2.5 py-0.5">
                  🃏 Buffone
                </span>
              )}
              {mimoEnabled && (
                <span className="inline-block rounded-full bg-slate-500/20 border border-slate-400/30 text-slate-200 text-xs font-bold px-2.5 py-0.5">
                  🤫 Mimo
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <motion.button
        onClick={handleStart}
        disabled={!canStart}
        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all mt-auto ${
          canStart
            ? 'glass-button'
            : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
        }`}
        whileHover={canStart ? springTap.whileHover : {}}
        whileTap={canStart ? springTap.whileTap : {}}
        transition={springTap.transition}
      >
        Inizia Partita
      </motion.button>

      <AnimatePresence>
        {showSpecialRoles && (
          <SpecialRolesOverlay
            roles={[
              {
                id: 'buffone',
                label: 'Il Buffone',
                emoji: '🃏',
                description: 'Un civile che guadagna +2 punti se eliminato al primo turno.',
                bgBase: 'bg-red-500/10',
                bgActive: 'bg-red-500/25',
                borderBase: 'border-red-400/20',
                borderActive: 'border-red-400/50',
                toggleColor: 'bg-red-500',
                enabled: buffoneEnabled,
                minPlayers: 5,
              },
              {
                id: 'mimo',
                label: 'Il Mimo',
                emoji: '🤫',
                description: 'Un giocatore deve mimare gli indizi anziché parlare.',
                bgBase: 'bg-slate-500/10',
                bgActive: 'bg-slate-500/25',
                borderBase: 'border-slate-400/20',
                borderActive: 'border-slate-400/50',
                toggleColor: 'bg-slate-400',
                enabled: mimoEnabled,
                minPlayers: 3,
              },
            ]}
            playerCount={validNames.length}
            onToggle={(id) => {
              if (id === 'buffone') setBuffoneEnabled(v => !v)
              if (id === 'mimo') setMimoEnabled(v => !v)
            }}
            onClose={() => setShowSpecialRoles(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface RoleCounterProps {
  label: string
  description: string
  value: number
  min: number
  max: number
  color: 'white' | 'amber'
  onChange: (v: number) => void
}

function RoleCounter({ label, description, value, min, max, color, onChange }: RoleCounterProps) {
  const dotColor = color === 'white' ? 'bg-white' : 'bg-amber-400'
  return (
    <div className="flex items-center justify-between glass rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${dotColor}`} />
        <div>
          <p className="text-white text-sm font-semibold">{label}</p>
          <p className="text-slate-500 text-xs whitespace-pre-line">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={`w-9 h-9 rounded-full border border-white/10 font-bold flex items-center justify-center transition-colors ${
            value <= min ? 'bg-white/3 text-slate-600 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-white'
          }`}
        >
          −
        </button>
        <span className="text-white font-bold w-4 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={`w-9 h-9 rounded-full border border-white/10 font-bold flex items-center justify-center transition-colors ${
            value >= max ? 'bg-white/3 text-slate-600 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 text-white'
          }`}
        >
          +
        </button>
      </div>
    </div>
  )
}
