import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'

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
    const clampedMw = Math.min(mrWhiteCount, 2, Math.max(0, maxTotal - infiltratoCount))
    const clampedInf = Math.min(infiltratoCount, 3, Math.max(0, maxTotal - clampedMw))
    if (clampedMw !== mrWhiteCount) setMrWhiteCount(clampedMw)
    if (clampedInf !== infiltratoCount) setInfiltratoCount(clampedInf)
  }, [validNames.length, mrWhiteCount, infiltratoCount])

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
  const effectiveMaxMrWhite = Math.min(2, Math.max(0, maxTotalImpostors - infiltratoCount))
  const effectiveMaxInfiltrato = Math.min(3, Math.max(0, maxTotalImpostors - mrWhiteCount))

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
  const canStart =
    validNames.length >= 3 &&
    impostorCount >= 1 &&
    impostorCount < validNames.length - 1 &&
    !hasDuplicates

  const addPlayer = () => {
    if (slots.length < 12) setSlots([...slots, { id: nextSlotId++, name: '' }])
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
      if (slots.length < 12) {
        pendingFocus.current = i + 1
        addPlayer()
      }
    } else {
      inputRefs.current[i + 1]?.focus()
    }
  }

  const handleStart = () => {
    const filtered = names.filter(n => n.trim().length > 0)
    setPlayerNames(filtered)
    setConfig({ mrWhiteCount, infiltratoCount })
    startGame()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Nuova Partita</h2>
        <button
          onClick={() => goTo('home')}
          className="text-slate-400 hover:text-white w-9 h-9 glass rounded-full flex items-center justify-center transition-colors text-lg"
          aria-label="Indietro"
        >
          ✕
        </button>
      </div>

      {/* Player names */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Giocatori ({validNames.length})
        </h3>
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {slots.map((slot, i) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="relative">
                    <input
                      ref={el => { inputRefs.current[i] = el }}
                      type="text"
                      value={slot.name}
                      onChange={e => updateName(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      placeholder={`Giocatore ${i + 1}`}
                      className={`w-full glass-input rounded-xl px-4 py-3 text-sm ${duplicateIndices.has(i) ? 'border-rose-500/60' : ''}`}
                      style={{ userSelect: 'text', touchAction: 'auto' }}
                      maxLength={20}
                    />
                    {slot.name.length > 15 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
                        {slot.name.length}/20
                      </span>
                    )}
                  </div>
                  {duplicateIndices.has(i) && (
                    <p className="text-rose-400 text-xs ml-1">Nome duplicato</p>
                  )}
                </div>
                {slots.length > 3 && (
                  <button
                    onClick={() => removePlayer(i)}
                    className="text-slate-500 hover:text-rose-400 px-3 py-3 rounded-xl transition-colors"
                    aria-label="Rimuovi"
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {slots.length < 12 && (
          <>
            <p className="text-slate-600 text-xs mt-1 ml-10">
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
            description="Non conosce la parola — deve bluffare"
            value={mrWhiteCount}
            min={0}
            max={effectiveMaxMrWhite}
            color="white"
            onChange={handleMrWhiteChange}
          />
          <RoleCounter
            label="Infiltrati"
            description="Hanno una parola diversa — non lo sanno!"
            value={infiltratoCount}
            min={0}
            max={effectiveMaxInfiltrato}
            color="amber"
            onChange={handleInfiltratoChange}
          />
        </div>

        {/* Validation errors */}
        {impostorCount === 0 && (
          <p className="text-rose-400 text-xs mt-2">Aggiungi almeno 1 impostore</p>
        )}
        {impostorCount > 0 && validNames.length < 3 && (
          <p className="text-rose-400 text-xs mt-2">Servono almeno 3 giocatori</p>
        )}
        {hasDuplicates && (
          <p className="text-rose-400 text-xs mt-2">Ci sono nomi duplicati</p>
        )}
      </div>

      {/* Info box */}
      {validNames.length >= 3 && impostorCount >= 1 && (
        <div className="glass rounded-2xl px-4 py-3">
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

      <motion.button
        onClick={handleStart}
        disabled={!canStart}
        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all mt-auto ${
          canStart
            ? 'glass-button'
            : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
        }`}
        whileHover={canStart ? { scale: 1.02 } : {}}
        whileTap={canStart ? { scale: 0.97 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        Inizia Partita
      </motion.button>
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
          <p className="text-slate-500 text-xs">{description}</p>
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
