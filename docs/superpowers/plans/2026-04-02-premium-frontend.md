# Premium Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Mr. White's frontend from functional to premium with glassmorphism surfaces, smooth screen transitions, micro-interactions, and wow effects.

**Architecture:** Layer-by-layer approach — glass CSS utilities first, then apply to all screens, then add AnimatePresence for screen transitions, then micro-interactions per component, then wow effects (particles, confetti, dramatic reveals). Each layer builds on top of the previous and is independently verifiable.

**Tech Stack:** React 19, Tailwind CSS v4, Framer Motion (new dep), Zustand

**Note:** This is a purely visual/animation project. No unit tests exist and TDD is not applicable. Each task uses `npm run build` for compilation checks and `npm run dev` for visual verification.

---

### Task 1: Foundation — Install Framer Motion + Glass CSS Utilities + Ambient Blobs

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/index.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Install Framer Motion**

Run: `npm install framer-motion`

- [ ] **Step 2: Add glass utility classes to index.css**

Replace the entire contents of `src/index.css` with:

```css
@import "tailwindcss";

@layer base {
  html {
    height: 100%;
  }

  body {
    height: 100%;
    overscroll-behavior: none;
    touch-action: manipulation;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    background-color: #0f0a1e;
    color: white;
  }

  #root {
    height: 100%;
  }
}

@layer components {
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .glass-strong {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .glass-button {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(79, 70, 229, 0.9));
    border: 1px solid rgba(99, 102, 241, 0.4);
    box-shadow:
      0 8px 32px rgba(99, 102, 241, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    color: white;
    font-weight: 700;
  }

  .glass-button:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(79, 70, 229, 1));
    box-shadow:
      0 8px 40px rgba(99, 102, 241, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .glass-button:active {
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.9), rgba(67, 56, 202, 1));
    box-shadow:
      0 4px 16px rgba(99, 102, 241, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .glass-button-secondary {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    color: #94a3b8;
    font-weight: 600;
  }

  .glass-button-secondary:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .glass-input {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    color: white;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .glass-input:focus {
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow:
      0 0 0 3px rgba(99, 102, 241, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
    outline: none;
  }

  .glass-input::placeholder {
    color: #64748b;
  }
}

@layer utilities {
  .perspective-1000 {
    perspective: 1000px;
  }
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
}
```

- [ ] **Step 3: Add ambient blobs and glass QuitButton to App.tsx**

Replace `src/App.tsx` with:

```tsx
import { Component, type ComponentType, type ReactNode, useState } from 'react'
import { useGameStore } from './store/gameStore'
import type { Screen } from './store/types'
import HomeScreen from './screens/HomeScreen'
import SetupScreen from './screens/SetupScreen'
import DealScreen from './screens/DealScreen'
import RoundScreen from './screens/RoundScreen'
import VoteScreen from './screens/VoteScreen'
import EliminationScreen from './screens/EliminationScreen'
import GuessScreen from './screens/GuessScreen'
import ResultScreen from './screens/ResultScreen'

const SCREENS: Record<Screen, ComponentType> = {
  home: HomeScreen,
  setup: SetupScreen,
  deal: DealScreen,
  round: RoundScreen,
  vote: VoteScreen,
  elimination: EliminationScreen,
  mrwhite_guess: GuessScreen,
  result: ResultScreen,
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 text-rose-400">
          <h2 className="text-xl font-bold mb-2">Errore</h2>
          <pre className="text-sm whitespace-pre-wrap">{this.state.error}</pre>
          <button
            onClick={() => {
              this.setState({ error: null })
              useGameStore.getState().resetGame()
            }}
            className="mt-4 glass-button px-4 py-2 rounded-xl"
          >
            Torna alla Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const IN_GAME_SCREENS: Set<Screen> = new Set(['deal', 'round', 'vote', 'elimination', 'mrwhite_guess'])

function QuitButton() {
  const screen = useGameStore(s => s.screen)
  const resetGame = useGameStore(s => s.resetGame)
  const [confirm, setConfirm] = useState(false)

  if (!IN_GAME_SCREENS.has(screen)) return null

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full glass text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
        aria-label="Esci"
      >
        ✕
      </button>

      {confirm && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
          <div className="glass-strong rounded-3xl px-6 py-6 w-full max-w-xs flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg text-center">Uscire dalla partita?</h3>
            <p className="text-slate-400 text-sm text-center">I progressi della partita andranno persi.</p>
            <button
              onClick={() => { setConfirm(false); resetGame() }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl transition-colors"
            >
              Esci
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="w-full glass-button-secondary py-3 rounded-2xl transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function AmbientBlobs() {
  return (
    <>
      <div
        className="fixed pointer-events-none -top-40 -left-40 w-[500px] h-[500px] opacity-100"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
      />
      <div
        className="fixed pointer-events-none -bottom-40 -right-40 w-[500px] h-[500px] opacity-100"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
      />
    </>
  )
}

export default function App() {
  const screen = useGameStore(s => s.screen)
  const Screen = SCREENS[screen]
  return (
    <div className="h-full bg-slate-950 text-white flex flex-col max-w-md mx-auto overflow-hidden relative">
      <AmbientBlobs />
      <ErrorBoundary>
        <QuitButton />
        <Screen />
      </ErrorBoundary>
    </div>
  )
}
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds with no errors.

Run: `npm run dev`
Expected: Ambient blobs visible behind the dark background. QuitButton (visible during gameplay) uses glass styling. All other screens still functional.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/App.tsx package.json package-lock.json
git commit -m "feat: add glassmorphism foundation — CSS utilities, ambient blobs, framer-motion"
```

---

### Task 2: Glass — HomeScreen + RoleTag

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/components/RoleTag.tsx`

- [ ] **Step 1: Apply glass to HomeScreen**

Replace `src/screens/HomeScreen.tsx` with:

```tsx
import { useGameStore } from '../store/gameStore'

export default function HomeScreen() {
  const goTo = useGameStore(s => s.goTo)

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-2">
        <div className="text-7xl">🕵️</div>
        <h1 className="text-4xl font-black text-white text-center">Mr. White</h1>
        <p className="text-slate-400 text-center text-sm max-w-xs">
          Il gioco di deduzione sociale per feste.
          Chi è l'impostore tra voi?
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => goTo('setup')}
          className="glass-button py-5 rounded-2xl text-lg transition-colors"
        >
          Nuova Partita
        </button>
      </div>

      <div className="glass rounded-2xl px-4 py-3 max-w-xs mt-4">
        <p className="font-semibold text-slate-300 mb-1 text-xs">Come si gioca</p>
        <p className="text-slate-400 text-xs">Ogni giocatore riceve una parola segreta. Mr. White non ha nessuna parola. Descrivete la vostra parola con un solo indizio. Trovate Mr. White prima che lui scopra la vostra parola!</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Apply glass to RoleTag**

Replace `src/components/RoleTag.tsx` with:

```tsx
import type { Role } from '../store/types'

interface Props {
  role: Role
  size?: 'sm' | 'md' | 'lg'
}

const CONFIG: Record<Role, { label: string; classes: string }> = {
  civile: {
    label: 'Civile',
    classes: 'bg-indigo-500/20 border border-indigo-400/30 text-indigo-300',
  },
  infiltrato: {
    label: 'Infiltrato',
    classes: 'bg-amber-500/20 border border-amber-400/30 text-amber-300',
  },
  mrwhite: {
    label: 'Mr. White',
    classes: 'bg-white/15 border border-white/20 text-white',
  },
}

export default function RoleTag({ role, size = 'md' }: Props) {
  const { label, classes } = CONFIG[role]
  const sizeClasses =
    size === 'sm' ? 'text-xs px-2 py-0.5' :
    size === 'lg' ? 'text-lg px-4 py-1.5' :
    'text-sm px-3 py-1'
  return (
    <span className={`inline-block rounded-full font-bold ${classes} ${sizeClasses}`}>
      {label}
    </span>
  )
}
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev`
Expected: HomeScreen button has glass glow. "Come si gioca" box has frosted glass surface. RoleTag badges show tinted glass style (verify on EliminationScreen or ResultScreen during a game).

- [ ] **Step 4: Commit**

```bash
git add src/screens/HomeScreen.tsx src/components/RoleTag.tsx
git commit -m "feat: apply glassmorphism to HomeScreen and RoleTag"
```

---

### Task 3: Glass — SetupScreen

**Files:**
- Modify: `src/screens/SetupScreen.tsx`

- [ ] **Step 1: Apply glass to SetupScreen**

Replace `src/screens/SetupScreen.tsx` with:

```tsx
import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const SUGGESTED_ROLES: Record<number, [number, number]> = {
  3: [1, 0], 4: [1, 0],
  5: [1, 1], 6: [1, 1],
  7: [1, 2], 8: [1, 2],
  9: [1, 3], 10: [1, 3],
  11: [2, 3], 12: [2, 3],
}

export default function SetupScreen() {
  const config = useGameStore(s => s.config)
  const setPlayerNames = useGameStore(s => s.setPlayerNames)
  const setConfig = useGameStore(s => s.setConfig)
  const startGame = useGameStore(s => s.startGame)
  const goTo = useGameStore(s => s.goTo)

  const [names, setNames] = useState<string[]>(['', '', '', ''])
  const [mrWhiteCount, setMrWhiteCount] = useState(config.mrWhiteCount)
  const [infiltratoCount, setInfiltratoCount] = useState(config.infiltratoCount)
  const [manualOverride, setManualOverride] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const pendingFocus = useRef<number | null>(null)

  useEffect(() => {
    if (pendingFocus.current !== null) {
      inputRefs.current[pendingFocus.current]?.focus()
      pendingFocus.current = null
    }
  }, [names.length])

  const validNames = names.filter(n => n.trim().length > 0)

  useEffect(() => {
    if (manualOverride) return
    const count = validNames.length
    const suggestion = SUGGESTED_ROLES[count]
    if (suggestion) {
      setMrWhiteCount(suggestion[0])
      setInfiltratoCount(suggestion[1])
    }
  }, [validNames.length, manualOverride])

  const handleMrWhiteChange = (v: number) => {
    setManualOverride(true)
    setMrWhiteCount(v)
  }

  const handleInfiltratoChange = (v: number) => {
    setManualOverride(true)
    setInfiltratoCount(v)
  }

  const impostorCount = mrWhiteCount + infiltratoCount
  const civilianCount = Math.max(0, validNames.length - impostorCount)
  const canStart =
    validNames.length >= 3 &&
    impostorCount >= 1 &&
    impostorCount < validNames.length - 1

  const addPlayer = () => {
    if (names.length < 12) setNames([...names, ''])
  }

  const removePlayer = (i: number) => {
    if (names.length <= 3) return
    setNames(names.filter((_, idx) => idx !== i))
  }

  const updateName = (i: number, value: string) => {
    const next = [...names]
    next[i] = value
    setNames(next)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (i === names.length - 1) {
      if (names.length < 12) {
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
      <div className="flex items-center gap-3">
        <button
          onClick={() => goTo('home')}
          className="text-slate-400 hover:text-white p-1 transition-colors"
          aria-label="Indietro"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-white">Nuova Partita</h2>
      </div>

      {/* Player names */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Giocatori ({validNames.length})
        </h3>
        <div className="flex flex-col gap-2">
          {names.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                ref={el => { inputRefs.current[i] = el }}
                type="text"
                value={name}
                onChange={e => updateName(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                placeholder={`Giocatore ${i + 1}`}
                className="flex-1 glass-input rounded-xl px-4 py-3 text-sm"
                style={{ userSelect: 'text', touchAction: 'auto' }}
                maxLength={20}
              />
              {names.length > 3 && (
                <button
                  onClick={() => removePlayer(i)}
                  className="text-slate-500 hover:text-rose-400 px-3 py-3 rounded-xl transition-colors"
                  aria-label="Rimuovi"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {names.length < 12 && (
          <button
            onClick={addPlayer}
            className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm py-2 transition-colors"
          >
            + Aggiungi giocatore
          </button>
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
            max={2}
            color="white"
            onChange={handleMrWhiteChange}
          />
          <RoleCounter
            label="Infiltrati"
            description="Hanno una parola diversa — non lo sanno!"
            value={infiltratoCount}
            min={0}
            max={3}
            color="amber"
            onChange={handleInfiltratoChange}
          />
        </div>

        {impostorCount === 0 && (
          <p className="text-rose-400 text-xs mt-2">Aggiungi almeno 1 impostore</p>
        )}
        {impostorCount > 0 && impostorCount >= validNames.length - 1 && (
          <p className="text-rose-400 text-xs mt-2">Ci vogliono almeno 2 civili</p>
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

      <button
        onClick={handleStart}
        disabled={!canStart}
        className={`w-full py-5 rounded-2xl text-lg transition-all mt-auto ${
          canStart
            ? 'glass-button'
            : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
        }`}
      >
        Inizia Partita
      </button>
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
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold flex items-center justify-center transition-colors"
        >
          −
        </button>
        <span className="text-white font-bold w-4 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev`
Expected: Setup screen shows frosted glass inputs, glass role counters, glass info panel, and glass button. Blur effect visible through ambient blobs.

- [ ] **Step 3: Commit**

```bash
git add src/screens/SetupScreen.tsx
git commit -m "feat: apply glassmorphism to SetupScreen"
```

---

### Task 4: Glass — DealScreen + RoundScreen + GuessScreen

**Files:**
- Modify: `src/screens/DealScreen.tsx`
- Modify: `src/screens/RoundScreen.tsx`
- Modify: `src/screens/GuessScreen.tsx`

- [ ] **Step 1: Apply glass to DealScreen**

Replace `src/screens/DealScreen.tsx` with:

```tsx
import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import PrivacyReveal from '../components/PrivacyReveal'

export default function DealScreen() {
  const players = useGameStore(s => s.players)
  const dealIndex = useGameStore(s => s.dealIndex)
  const advanceDeal = useGameStore(s => s.advanceDeal)

  const current = players[dealIndex]
  const total = players.length

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLock = lock
      }).catch(() => {})
    }
    return () => {
      wakeLock?.release().catch(() => {})
    }
  }, [])

  if (!current) return null

  return (
    <div className="flex flex-col items-center flex-1 px-5 py-8 gap-6">
      {/* Progress */}
      <div className="flex gap-1.5">
        {players.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < dealIndex ? 'bg-indigo-400 w-4' :
              i === dealIndex ? 'bg-white w-6' :
              'bg-white/10 w-4'
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-slate-400 text-sm">Passa il telefono a</p>
        <h2 className="text-3xl font-black text-white">{current.name}</h2>
        <p className="text-slate-500 text-xs">{dealIndex + 1} di {total}</p>
      </div>

      <PrivacyReveal
        playerName={current.name}
        word={current.word}
        role={current.role}
        onDone={advanceDeal}
      />
    </div>
  )
}
```

- [ ] **Step 2: Apply glass to RoundScreen**

Replace `src/screens/RoundScreen.tsx` with:

```tsx
import { useGameStore } from '../store/gameStore'

export default function RoundScreen() {
  const players = useGameStore(s => s.players)
  const round = useGameStore(s => s.round)
  const goTo = useGameStore(s => s.goTo)

  const active = players.filter(p => !p.eliminated)
  const eliminated = players.filter(p => p.eliminated)

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Round {round}</h2>
          <p className="text-slate-400 text-sm">Ogni giocatore dà un indizio</p>
        </div>
        <div className="glass rounded-xl px-3 py-2 text-center">
          <p className="text-white font-bold text-lg">{active.length}</p>
          <p className="text-slate-500 text-xs">attivi</p>
        </div>
      </div>

      {/* Active players */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Giocatori in gioco
        </p>
        <div className="flex flex-col gap-2">
          {active.map((player, i) => (
            <div
              key={player.id}
              className="flex items-center gap-3 glass rounded-2xl px-4 py-3"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {i + 1}
              </div>
              <span className="text-white font-medium">{player.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Eliminati
          </p>
          <div className="flex flex-wrap gap-2">
            {eliminated.map(player => (
              <span key={player.id} className="text-slate-600 text-sm line-through">
                {player.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <p className="text-slate-500 text-xs text-center mb-4">
          Dopo che tutti hanno dato il loro indizio, passate al voto
        </p>
        <button
          onClick={() => goTo('vote')}
          className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold py-5 rounded-2xl text-lg transition-colors shadow-[0_8px_32px_rgba(244,63,94,0.3)]"
        >
          Vota l'impostore →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Apply glass to GuessScreen**

Replace `src/screens/GuessScreen.tsx` with:

```tsx
import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

type Phase = 'privacy' | 'input' | 'result'

export default function GuessScreen() {
  const eliminatedThisRound = useGameStore(s => s.eliminatedThisRound)
  const submitMrWhiteGuess = useGameStore(s => s.submitMrWhiteGuess)
  const mrWhiteGuessResult = useGameStore(s => s.mrWhiteGuessResult)
  const winner = useGameStore(s => s.winner)
  const nextRound = useGameStore(s => s.nextRound)

  const [guess, setGuess] = useState('')
  const [phase, setPhase] = useState<Phase>('privacy')
  const [showGuess, setShowGuess] = useState(false)

  const handleSubmit = () => {
    if (guess.trim().length === 0) return
    submitMrWhiteGuess(guess.trim())
    setPhase('result')
  }

  const handleContinue = () => {
    if (gameOver) {
      useGameStore.getState().goTo('result')
    } else {
      nextRound()
    }
  }

  if (phase === 'privacy') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">📱</div>
          <p className="text-slate-400 text-sm">Passa il telefono a</p>
          <h2 className="text-3xl font-black text-white text-center">
            {eliminatedThisRound?.name}
          </h2>
          <p className="text-slate-500 text-center text-sm max-w-xs">
            Gli altri giocatori non devono guardare lo schermo!
          </p>
        </div>
        <button
          onClick={() => setPhase('input')}
          className="w-full max-w-xs bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold py-5 rounded-2xl text-lg transition-colors shadow-[0_8px_32px_rgba(245,158,11,0.3)]"
        >
          Sono pronto
        </button>
      </div>
    )
  }

  if (phase === 'input') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl">🎯</div>
          <h2 className="text-2xl font-black text-white text-center">
            Qual è la parola dei civili?
          </h2>
          <p className="text-slate-400 text-center text-sm max-w-xs">
            Scrivi la tua risposta. Nessuno vedrà cosa hai scritto.
          </p>
        </div>
        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className="relative">
            <input
              type={showGuess ? 'text' : 'password'}
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Scrivi la parola..."
              className="w-full glass-input rounded-2xl px-4 py-4 pr-14 text-lg text-center"
              style={{ userSelect: 'text', touchAction: 'auto' }}
              autoFocus
              maxLength={40}
            />
            <button
              type="button"
              onClick={() => setShowGuess(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xl p-1 transition-colors"
              aria-label={showGuess ? 'Nascondi' : 'Mostra'}
            >
              {showGuess ? '🙈' : '👁️'}
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={guess.trim().length === 0}
            className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
              guess.trim().length > 0
                ? 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black shadow-[0_8px_32px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            Rispondo!
          </button>
        </div>
      </div>
    )
  }

  const isCorrect = mrWhiteGuessResult === 'correct'
  const gameOver = winner !== null

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-6">
      {isCorrect ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="text-6xl">🎉</div>
          <div className="glass rounded-2xl px-6 py-4 text-center w-full" style={{ borderColor: 'rgba(52, 211, 153, 0.2)' }}>
            <p className="text-emerald-300 font-bold text-lg">Parola indovinata!</p>
            <p className="text-white text-sm mt-1">{eliminatedThisRound?.name} guadagna 6 punti</p>
          </div>
          {!gameOver && (
            <div className="glass rounded-2xl px-6 py-4 text-center w-full" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
              <p className="text-amber-400 font-semibold">Il gioco continua!</p>
              <p className="text-slate-400 text-sm mt-1">Ci sono ancora impostori tra voi.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="text-6xl">❌</div>
          <div className="glass rounded-2xl px-6 py-4 text-center w-full" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}>
            <p className="text-rose-300 font-bold text-lg">Risposta sbagliata!</p>
          </div>
          {!gameOver && (
            <div className="glass rounded-2xl px-6 py-4 text-center w-full" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
              <p className="text-amber-400 font-semibold">Il gioco continua!</p>
              <p className="text-slate-400 text-sm mt-1">Ci sono ancora impostori tra voi.</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleContinue}
        className="w-full max-w-xs glass-button py-5 rounded-2xl text-lg transition-colors"
      >
        Continua →
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev`
Expected: DealScreen progress dots use glass colors. RoundScreen player list and badge are glass. GuessScreen input and result boxes are glass. Rose/amber buttons have glow shadows.

- [ ] **Step 5: Commit**

```bash
git add src/screens/DealScreen.tsx src/screens/RoundScreen.tsx src/screens/GuessScreen.tsx
git commit -m "feat: apply glassmorphism to DealScreen, RoundScreen, GuessScreen"
```

---

### Task 5: Glass — VoteScreen + VoteGrid + EliminationScreen + ResultScreen

**Files:**
- Modify: `src/screens/VoteScreen.tsx`
- Modify: `src/components/VoteGrid.tsx`
- Modify: `src/screens/EliminationScreen.tsx`
- Modify: `src/screens/ResultScreen.tsx`

- [ ] **Step 1: Apply glass to VoteGrid**

Replace `src/components/VoteGrid.tsx` with:

```tsx
import type { Player } from '../store/types'

interface Props {
  players: Player[]
  votes: Record<string, number>
  voterCount: number
  onVote: (targetId: string) => void
  disabled?: boolean
}

const AVATAR_COLORS = [
  'from-indigo-500 to-indigo-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700',
  'from-rose-500 to-rose-700',
  'from-cyan-500 to-cyan-700',
  'from-purple-500 to-purple-700',
  'from-pink-500 to-pink-700',
  'from-lime-500 to-lime-700',
  'from-orange-500 to-orange-700',
  'from-teal-500 to-teal-700',
  'from-fuchsia-500 to-fuchsia-700',
  'from-sky-500 to-sky-700',
]

export default function VoteGrid({ players, votes, voterCount, onVote, disabled }: Props) {
  const active = players.filter(p => !p.eliminated)
  const maxVotes = Math.max(0, ...Object.values(votes))

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {active.map((player, idx) => {
        const voteCount = votes[player.id] ?? 0
        const pct = voterCount > 0 ? (voteCount / voterCount) * 100 : 0
        const isLeading = voteCount > 0 && voteCount === maxVotes
        const initial = player.name.charAt(0).toUpperCase()
        const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]

        return (
          <button
            key={player.id}
            onClick={() => !disabled && onVote(player.id)}
            className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200 min-h-[88px] flex items-center gap-3
              ${voteCount > 0
                ? isLeading
                  ? 'glass border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                  : 'glass border-rose-500/30'
                : 'glass hover:border-white/15'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 transition-transform'}
            `}
          >
            {/* Vote fill bar */}
            {voteCount > 0 && (
              <div
                className="absolute bottom-0 left-0 right-0 bg-rose-500/15 transition-all duration-500"
                style={{ height: `${pct}%` }}
              />
            )}

            {/* Avatar */}
            <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md`}>
              {initial}
            </div>

            {/* Name */}
            <span className="relative font-semibold text-white text-sm flex-1">
              {player.name}
            </span>

            {/* Vote badge */}
            {voteCount > 0 && (
              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                isLeading ? 'bg-rose-500 text-white' : 'bg-rose-500/30 text-rose-200'
              }`}>
                {voteCount}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Apply glass to VoteScreen**

Replace `src/screens/VoteScreen.tsx` with:

```tsx
import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import VoteGrid from '../components/VoteGrid'

export default function VoteScreen() {
  const players = useGameStore(s => s.players)
  const castVote = useGameStore(s => s.castVote)
  const goTo = useGameStore(s => s.goTo)

  const active = players.filter(p => !p.eliminated)
  const voterCount = active.length

  const [votes, setVotes] = useState<Record<string, number>>({})
  const [voteHistory, setVoteHistory] = useState<string[]>([])
  const [tieBreak, setTieBreak] = useState<string[] | null>(null)

  const totalVotesCast = Object.values(votes).reduce((a, b) => a + b, 0)
  const votersLeft = voterCount - totalVotesCast
  const allVoted = totalVotesCast >= voterCount
  const progress = voterCount > 0 ? (totalVotesCast / voterCount) * 100 : 0

  const handleVote = (targetId: string) => {
    if (votersLeft <= 0) return
    setVotes(v => ({ ...v, [targetId]: (v[targetId] ?? 0) + 1 }))
    setVoteHistory(h => [...h, targetId])
  }

  const handleUndo = () => {
    if (voteHistory.length === 0) return
    const lastId = voteHistory[voteHistory.length - 1]
    setVoteHistory(h => h.slice(0, -1))
    setVotes(v => {
      const next = { ...v }
      next[lastId] = (next[lastId] ?? 1) - 1
      if (next[lastId] <= 0) delete next[lastId]
      return next
    })
  }

  const handleConfirm = () => {
    const maxVotes = Math.max(...Object.values(votes))
    const tied = Object.entries(votes)
      .filter(([, v]) => v === maxVotes)
      .map(([id]) => id)

    if (tied.length > 1) {
      setTieBreak(tied)
      setVotes({})
      setVoteHistory([])
    } else {
      castVote(votes)
    }
  }

  const handleTieConfirm = () => {
    const maxVotes = Math.max(...Object.values(votes))
    const tied = Object.entries(votes)
      .filter(([, v]) => v === maxVotes)
      .map(([id]) => id)

    if (tied.length > 1) {
      const eliminated = tied
        .map(id => active.find(p => p.id === id)!)
        .sort((a, b) => a.name.localeCompare(b.name))[0]
      castVote({ [eliminated.id]: 1 })
    } else {
      castVote(votes)
    }
  }

  const tiePlayers = tieBreak
    ? active.filter(p => tieBreak.includes(p.id))
    : null

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => goTo('round')}
          className="text-slate-400 hover:text-white p-1 transition-colors"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white">
            {tieBreak ? 'Pareggio! Ri-voto' : 'Chi eliminare?'}
          </h2>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              allVoted ? 'bg-rose-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-slate-400 text-xs">
            {allVoted
              ? 'Tutti hanno votato!'
              : `${votersLeft} ${votersLeft === 1 ? 'voto rimasto' : 'voti rimasti'}`
            }
          </p>
          <div className="flex gap-3">
            {voteHistory.length > 0 && (
              <button
                onClick={() => { setVotes({}); setVoteHistory([]) }}
                className="text-rose-400 hover:text-rose-300 text-xs font-medium transition-colors"
              >
                Azzera tutto
              </button>
            )}
            {voteHistory.length > 0 && !allVoted && (
              <button
                onClick={handleUndo}
                className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
              >
                Annulla ultimo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tie info */}
      {tieBreak && (
        <p className="text-amber-400 text-sm glass rounded-xl px-4 py-2" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
          Pareggio tra {tiePlayers!.map(p => p.name).join(' e ')}. Votate di nuovo.
        </p>
      )}

      {/* Grid */}
      <VoteGrid
        players={tieBreak ? tiePlayers! : active}
        votes={votes}
        voterCount={voterCount}
        onVote={handleVote}
        disabled={votersLeft <= 0}
      />

      {/* Confirm button */}
      <button
        onClick={tieBreak ? handleTieConfirm : handleConfirm}
        disabled={!allVoted}
        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
          allVoted
            ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-[0_0_32px_rgba(244,63,94,0.3)] animate-pulse'
            : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
        }`}
      >
        {tieBreak ? 'Conferma eliminazione' : 'Elimina il più votato'}
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Apply glass to EliminationScreen**

Replace `src/screens/EliminationScreen.tsx` with:

```tsx
import { useGameStore } from '../store/gameStore'
import RoleTag from '../components/RoleTag'

export default function EliminationScreen() {
  const eliminatedThisRound = useGameStore(s => s.eliminatedThisRound)
  const confirmElimination = useGameStore(s => s.confirmElimination)
  const players = useGameStore(s => s.players)

  if (!eliminatedThisRound) return null

  const { name, role } = eliminatedThisRound
  const isMrWhite = role === 'mrwhite'

  const remainingMrWhite = players.filter(p => !p.eliminated && p.role === 'mrwhite' && p.id !== eliminatedThisRound.id).length
  const remainingInfiltrati = players.filter(p => !p.eliminated && p.role === 'infiltrato' && p.id !== eliminatedThisRound.id).length
  const remainingImpostors = remainingMrWhite + remainingInfiltrati

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-8">
      <div className="flex flex-col items-center gap-3">
        <div className="text-6xl">{isMrWhite ? '🕵️' : role === 'infiltrato' ? '🎭' : '😇'}</div>
        <p className="text-slate-400 text-sm uppercase tracking-widest">Eliminato</p>
        <h2 className="text-4xl font-black text-white">{name}</h2>
        <RoleTag role={role} size="lg" />
      </div>

      {isMrWhite && (
        <div className="glass rounded-2xl px-6 py-4 text-center max-w-xs" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
          <p className="text-amber-400 font-semibold">Mr. White eliminato!</p>
          <p className="text-slate-400 text-sm mt-1">
            Potrà tentare di indovinare la parola dei civili per vincere ancora.
          </p>
          {remainingInfiltrati > 0 && (
            <p className="text-amber-400/70 text-xs mt-2">
              Attenzione: {remainingInfiltrati === 1 ? 'c\'è ancora 1 infiltrato' : `ci sono ancora ${remainingInfiltrati} infiltrati`} in gioco!
            </p>
          )}
        </div>
      )}

      {role === 'infiltrato' && (
        <div className="glass rounded-2xl px-6 py-4 text-center max-w-xs" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
          <p className="text-amber-400 font-semibold">Infiltrato scoperto!</p>
          {remainingImpostors > 0 ? (
            <p className="text-slate-400 text-sm mt-1">
              {remainingImpostors === 1 ? 'Resta ancora 1 impostore' : `Restano ancora ${remainingImpostors} impostori`} da trovare.
            </p>
          ) : (
            <p className="text-slate-400 text-sm mt-1">Era l'ultimo!</p>
          )}
        </div>
      )}

      {role === 'civile' && (
        <div className="glass rounded-2xl px-6 py-4 text-center max-w-xs" style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}>
          <p className="text-rose-400 font-semibold">Un civile eliminato!</p>
          <p className="text-slate-400 text-sm mt-1">Attenzione, gli impostori guadagnano terreno.</p>
        </div>
      )}

      <button
        onClick={confirmElimination}
        className="w-full max-w-xs glass-button py-5 rounded-2xl text-lg transition-colors"
      >
        {isMrWhite ? 'Vai al tentativo →' : 'Continua →'}
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Apply glass to ResultScreen**

Replace `src/screens/ResultScreen.tsx` with:

```tsx
import { useGameStore } from '../store/gameStore'
import RoleTag from '../components/RoleTag'

export default function ResultScreen() {
  const players = useGameStore(s => s.players)
  const wordPair = useGameStore(s => s.wordPair)
  const winner = useGameStore(s => s.winner)
  const mrWhiteCorrectIds = useGameStore(s => s.mrWhiteCorrectIds)
  const scores = useGameStore(s => s.scores)
  const roundScores = useGameStore(s => s.roundScores)
  const resetGame = useGameStore(s => s.resetGame)
  const rematch = useGameStore(s => s.rematch)
  const resetScores = useGameStore(s => s.resetScores)

  const mwPoisoned = mrWhiteCorrectIds.length > 0
  const isCiviliansWin = winner === 'civilians' && !mwPoisoned
  const isLastTwo = winner === 'last_two'
  const isPoisoned = winner === 'civilians' && mwPoisoned

  const leaderboard = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
  const hasScoreHistory = leaderboard.some(([, s]) => s > 0)

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-4 overflow-y-auto">
      {/* Winner banner */}
      {isCiviliansWin && (
        <div className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-indigo-700 to-indigo-900 border border-white/10">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl font-black text-white">I Civili vincono!</h2>
          <p className="text-indigo-200 text-sm mt-1">Tutti gli impostori sono stati eliminati.</p>
        </div>
      )}

      {isPoisoned && (
        <div className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-slate-100 to-slate-300 border border-white/20">
          <div className="text-5xl mb-2">🕵️</div>
          <h2 className="text-2xl font-black text-slate-900">Mr. White vince!</h2>
          <p className="text-slate-600 text-sm mt-1">
            Ha indovinato la parola dei civili.
          </p>
        </div>
      )}

      {isLastTwo && (
        <div className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-rose-700 to-rose-900 border border-white/10">
          <div className="text-5xl mb-2">😈</div>
          <h2 className="text-2xl font-black text-white">Gli impostori vincono!</h2>
          <p className="text-rose-200 text-sm mt-1">
            Sono sopravvissuti fino alla fine.
          </p>
        </div>
      )}

      {/* Word reveal */}
      {wordPair && (
        <div className="glass rounded-2xl px-5 py-4">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Le parole segrete</p>
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-indigo-400">Civili</p>
              <p className="text-white font-bold">{wordPair.civilian}</p>
            </div>
            <div className="w-px bg-white/8" />
            <div>
              <p className="text-xs text-amber-400">Infiltrati</p>
              <p className="text-white font-bold">{wordPair.undercover}</p>
            </div>
          </div>
        </div>
      )}

      {/* Player list with round points */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Ruoli e punti partita
        </p>
        <div className="flex flex-col gap-2">
          {players.map(player => {
            const pts = roundScores[player.name] ?? 0
            const isInfiltrateSurvivor = player.role === 'infiltrato' && !player.eliminated
            const isMwCorrect = player.role === 'mrwhite' && mrWhiteCorrectIds.includes(player.id)
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between glass rounded-2xl px-4 py-3 ${
                  player.eliminated ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {player.eliminated && <span className="text-slate-500 text-sm">✕</span>}
                  <span className={`font-medium truncate ${player.eliminated ? 'line-through text-slate-500' : 'text-white'}`}>
                    {player.name}
                  </span>
                  {isInfiltrateSurvivor && isLastTwo && (
                    <span className="text-amber-400 text-xs shrink-0">sopravvissuto!</span>
                  )}
                  {isMwCorrect && (
                    <span className="text-emerald-400 text-xs shrink-0">ha indovinato!</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RoleTag role={player.role} size="sm" />
                  <span className={`text-sm font-bold min-w-[32px] text-right ${
                    pts > 0 ? 'text-emerald-400' : 'text-slate-600'
                  }`}>
                    {pts > 0 ? `+${pts}` : '0'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Leaderboard */}
      {hasScoreHistory && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Classifica generale
            </p>
            <button
              onClick={resetScores}
              className="text-xs text-slate-600 hover:text-rose-400 transition-colors"
            >
              Azzera punteggi
            </button>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            {leaderboard.map(([name, total], i) => {
              const isFirst = i === 0 && total > 0
              return (
                <div
                  key={name}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < leaderboard.length - 1 ? 'border-b border-white/8' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-bold text-sm ${
                      isFirst ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                      {isFirst ? '👑' : `${i + 1}`}
                    </span>
                    <span className="text-white font-medium text-sm">{name}</span>
                  </div>
                  <span className={`font-bold text-sm ${
                    isFirst ? 'text-amber-400' : 'text-white'
                  }`}>
                    {total} pt
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Points legend */}
      <div className="glass rounded-xl px-4 py-3">
        <p className="text-slate-500 text-xs mb-1.5">Punteggio</p>
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-indigo-400">Civile: 2 pt (se tutti impostori eliminati e MW non indovina)</span>
          <span className="text-white">Mr. White: 6 pt (se indovina la parola o sopravvive)</span>
          <span className="text-amber-400">Infiltrato: 5 pt (se sopravvive fino alla fine)</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={rematch}
          className="w-full glass-button py-5 rounded-2xl text-lg transition-colors"
        >
          Continua
        </button>
        <button
          onClick={resetGame}
          className="w-full glass-button-secondary py-4 rounded-2xl transition-colors"
        >
          Fine partita
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev`
Expected: All vote, elimination, and result screens show consistent glass surfaces. Leaderboard rows separated by glass borders. VoteGrid cards have glass with rose tints on votes.

- [ ] **Step 6: Commit**

```bash
git add src/screens/VoteScreen.tsx src/components/VoteGrid.tsx src/screens/EliminationScreen.tsx src/screens/ResultScreen.tsx
git commit -m "feat: apply glassmorphism to VoteScreen, VoteGrid, EliminationScreen, ResultScreen"
```

---

### Task 6: Glass — PrivacyReveal Card

**Files:**
- Modify: `src/components/PrivacyReveal.tsx`

- [ ] **Step 1: Apply glass to PrivacyReveal**

Replace `src/components/PrivacyReveal.tsx` with:

```tsx
import { useState, useEffect } from 'react'
import type { Role } from '../store/types'

interface Props {
  playerName: string
  word: string | null
  role: Role
  onDone: () => void
}

type Phase = 'waiting' | 'revealed' | 'hidden'

const ROLE_COLORS: Record<Role, string> = {
  civile: 'from-indigo-700 to-indigo-900',
  infiltrato: 'from-indigo-700 to-indigo-900',
  mrwhite: 'from-slate-200 to-slate-400',
}

const ROLE_TEXT_COLORS: Record<Role, string> = {
  civile: 'text-white',
  infiltrato: 'text-white',
  mrwhite: 'text-black',
}

export default function PrivacyReveal({ playerName, word, role, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('waiting')
  const [showHide, setShowHide] = useState(false)

  useEffect(() => {
    setPhase('waiting')
    setShowHide(false)
  }, [playerName])

  useEffect(() => {
    if (phase === 'revealed') {
      const t = setTimeout(() => setShowHide(true), 1200)
      return () => clearTimeout(t)
    } else {
      setShowHide(false)
    }
  }, [phase])

  const handleCardTap = () => {
    if (phase === 'waiting') setPhase('revealed')
  }

  const handleHide = () => {
    setPhase('hidden')
  }

  const roleColor = ROLE_COLORS[role]
  const textColor = ROLE_TEXT_COLORS[role]

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Card */}
      <div
        className="perspective-1000 w-full max-w-xs cursor-pointer"
        style={{ height: '220px' }}
        onClick={handleCardTap}
      >
        <div
          className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${phase === 'revealed' ? 'rotate-y-180' : ''}`}
        >
          {/* Back — privacy */}
          <div className="absolute inset-0 backface-hidden rounded-3xl glass flex flex-col items-center justify-center gap-3 shadow-2xl" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            <div className="text-5xl">👁️</div>
            <p className="text-slate-300 text-sm">Tocca per rivelare</p>
          </div>
          {/* Front — word */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br ${roleColor} border border-white/10 flex flex-col items-center justify-center gap-3 shadow-2xl px-6`}
          >
            {role === 'mrwhite' ? (
              <>
                <div className={`text-4xl font-black ${textColor}`}>🕵️</div>
                <p className={`text-2xl font-black ${textColor}`}>Sei Mr. White</p>
                <p className={`text-sm text-center ${textColor} opacity-80`}>Non hai nessuna parola. Bluffa!</p>
              </>
            ) : (
              <>
                <p className={`text-xs uppercase tracking-widest ${textColor} opacity-70`}>
                  La tua parola
                </p>
                <p className={`text-3xl font-black text-center ${textColor}`}>{word}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      {phase === 'waiting' && (
        <p className="text-slate-400 text-sm">Tocca la carta per vedere la tua parola</p>
      )}

      {phase === 'revealed' && showHide && (
        <button
          onClick={handleHide}
          className="w-full max-w-xs glass-button-secondary py-4 rounded-2xl transition-colors"
        >
          Ho visto — Nascondi
        </button>
      )}

      {phase === 'hidden' && (
        <button
          onClick={onDone}
          className="w-full max-w-xs glass-button py-4 rounded-2xl transition-colors"
        >
          Prossimo giocatore →
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev`
Expected: Card back face shows frosted glass. Front face keeps gradient. Buttons have glass styling.

- [ ] **Step 3: Commit**

```bash
git add src/components/PrivacyReveal.tsx
git commit -m "feat: apply glassmorphism to PrivacyReveal card"
```

---

### Task 7: Screen Transitions — AnimatePresence

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add AnimatePresence screen transitions**

Replace `src/App.tsx` with:

```tsx
import { Component, type ComponentType, type ReactNode, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import type { Screen } from './store/types'
import HomeScreen from './screens/HomeScreen'
import SetupScreen from './screens/SetupScreen'
import DealScreen from './screens/DealScreen'
import RoundScreen from './screens/RoundScreen'
import VoteScreen from './screens/VoteScreen'
import EliminationScreen from './screens/EliminationScreen'
import GuessScreen from './screens/GuessScreen'
import ResultScreen from './screens/ResultScreen'

const SCREENS: Record<Screen, ComponentType> = {
  home: HomeScreen,
  setup: SetupScreen,
  deal: DealScreen,
  round: RoundScreen,
  vote: VoteScreen,
  elimination: EliminationScreen,
  mrwhite_guess: GuessScreen,
  result: ResultScreen,
}

const SCREEN_ORDER: Screen[] = [
  'home', 'setup', 'deal', 'round', 'vote', 'elimination', 'mrwhite_guess', 'result',
]

const FADE_SCALE_SCREENS: Set<Screen> = new Set(['elimination', 'result'])

function getTransitionVariants(prev: Screen | null, current: Screen) {
  if (FADE_SCALE_SCREENS.has(current)) {
    return {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    }
  }

  if (prev === null) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    }
  }

  const prevIdx = SCREEN_ORDER.indexOf(prev)
  const currIdx = SCREEN_ORDER.indexOf(current)

  // deal -> round and elimination/guess -> round use fade
  if ((prev === 'deal' && current === 'round') ||
      ((prev === 'elimination' || prev === 'mrwhite_guess') && current === 'round')) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    }
  }

  const direction = currIdx >= prevIdx ? 1 : -1

  return {
    initial: { x: direction * 30, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: direction * -30, opacity: 0 },
  }
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 text-rose-400">
          <h2 className="text-xl font-bold mb-2">Errore</h2>
          <pre className="text-sm whitespace-pre-wrap">{this.state.error}</pre>
          <button
            onClick={() => {
              this.setState({ error: null })
              useGameStore.getState().resetGame()
            }}
            className="mt-4 glass-button px-4 py-2 rounded-xl"
          >
            Torna alla Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const IN_GAME_SCREENS: Set<Screen> = new Set(['deal', 'round', 'vote', 'elimination', 'mrwhite_guess'])

function QuitButton() {
  const screen = useGameStore(s => s.screen)
  const resetGame = useGameStore(s => s.resetGame)
  const [confirm, setConfirm] = useState(false)

  if (!IN_GAME_SCREENS.has(screen)) return null

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full glass text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
        aria-label="Esci"
      >
        ✕
      </button>

      {confirm && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
          <div className="glass-strong rounded-3xl px-6 py-6 w-full max-w-xs flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg text-center">Uscire dalla partita?</h3>
            <p className="text-slate-400 text-sm text-center">I progressi della partita andranno persi.</p>
            <button
              onClick={() => { setConfirm(false); resetGame() }}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl transition-colors"
            >
              Esci
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="w-full glass-button-secondary py-3 rounded-2xl transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function AmbientBlobs() {
  return (
    <>
      <div
        className="fixed pointer-events-none -top-40 -left-40 w-[500px] h-[500px] opacity-100"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
      />
      <div
        className="fixed pointer-events-none -bottom-40 -right-40 w-[500px] h-[500px] opacity-100"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
      />
    </>
  )
}

function AnimatedScreen() {
  const screen = useGameStore(s => s.screen)
  const prevScreen = useRef<Screen | null>(null)
  const ScreenComponent = SCREENS[screen]

  const variants = getTransitionVariants(prevScreen.current, screen)

  // Update prev after computing variants
  const currentScreen = screen
  if (prevScreen.current !== currentScreen) {
    // We need to update after render, but since getTransitionVariants already read prevScreen.current,
    // we can safely update now for next render
    setTimeout(() => { prevScreen.current = currentScreen }, 0)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col flex-1 min-h-0"
      >
        <ScreenComponent />
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <div className="h-full bg-slate-950 text-white flex flex-col max-w-md mx-auto overflow-hidden relative">
      <AmbientBlobs />
      <ErrorBoundary>
        <QuitButton />
        <AnimatedScreen />
      </ErrorBoundary>
    </div>
  )
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev`
Expected: Navigate through all screens — each transition animates smoothly. home→setup slides right, setup→deal slides right, deal→round fades, vote→elimination fades+scales, result fades+scales. No layout jumps or scroll issues.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add AnimatePresence screen transitions"
```

---

### Task 8: Micro-interactions — Motion Buttons + Input Animations + Progress Bars + Breathing Glow

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/screens/SetupScreen.tsx`
- Modify: `src/screens/DealScreen.tsx`
- Modify: `src/screens/RoundScreen.tsx`
- Modify: `src/screens/VoteScreen.tsx`
- Modify: `src/screens/EliminationScreen.tsx`
- Modify: `src/screens/GuessScreen.tsx`
- Modify: `src/screens/ResultScreen.tsx`
- Modify: `src/components/PrivacyReveal.tsx`

- [ ] **Step 1: Add motion buttons to HomeScreen**

In `src/screens/HomeScreen.tsx`, add import at top:
```tsx
import { motion } from 'framer-motion'
```

Replace the `<button>` for "Nuova Partita" with:
```tsx
<motion.button
  onClick={() => goTo('setup')}
  className="glass-button py-5 rounded-2xl text-lg transition-colors"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  Nuova Partita
</motion.button>
```

- [ ] **Step 2: Add motion buttons + input animations to SetupScreen**

In `src/screens/SetupScreen.tsx`, add import at top:
```tsx
import { motion, AnimatePresence } from 'framer-motion'
```

Replace the player input list `<div className="flex flex-col gap-2">` section with:
```tsx
<div className="flex flex-col gap-2">
  <AnimatePresence initial={false}>
    {names.map((name, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex gap-2"
      >
        <input
          ref={el => { inputRefs.current[i] = el }}
          type="text"
          value={name}
          onChange={e => updateName(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          placeholder={`Giocatore ${i + 1}`}
          className="flex-1 glass-input rounded-xl px-4 py-3 text-sm"
          style={{ userSelect: 'text', touchAction: 'auto' }}
          maxLength={20}
        />
        {names.length > 3 && (
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
```

Replace the "Inizia Partita" `<button>` with:
```tsx
<motion.button
  onClick={handleStart}
  disabled={!canStart}
  className={`w-full py-5 rounded-2xl text-lg transition-all mt-auto ${
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
```

- [ ] **Step 3: Add motion to DealScreen progress dots**

In `src/screens/DealScreen.tsx`, add import:
```tsx
import { motion } from 'framer-motion'
```

Replace the progress dots mapping with:
```tsx
<div className="flex gap-1.5">
  {players.map((_, i) => (
    <motion.div
      key={i}
      animate={{
        width: i === dealIndex ? 24 : 16,
        backgroundColor: i < dealIndex ? '#818cf8' : i === dealIndex ? '#ffffff' : 'rgba(255,255,255,0.1)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="h-1.5 rounded-full"
    />
  ))}
</div>
```

- [ ] **Step 4: Add motion buttons to RoundScreen**

In `src/screens/RoundScreen.tsx`, add import:
```tsx
import { motion } from 'framer-motion'
```

Replace the "Vota l'impostore" `<button>` with:
```tsx
<motion.button
  onClick={() => goTo('vote')}
  className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold py-5 rounded-2xl text-lg transition-colors shadow-[0_8px_32px_rgba(244,63,94,0.3)]"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  Vota l'impostore →
</motion.button>
```

- [ ] **Step 5: Add spring progress bar to VoteScreen**

In `src/screens/VoteScreen.tsx`, add import:
```tsx
import { motion } from 'framer-motion'
```

Replace the progress bar fill `<div>` (inside the track) with:
```tsx
<motion.div
  className={`h-full rounded-full ${
    allVoted ? 'bg-rose-500' : 'bg-indigo-500'
  }`}
  animate={{ width: `${progress}%` }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
/>
```

Remove the `style={{ width: ... }}` since motion handles it.

Replace the confirm `<button>` with:
```tsx
<motion.button
  onClick={tieBreak ? handleTieConfirm : handleConfirm}
  disabled={!allVoted}
  className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${
    allVoted
      ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-[0_0_32px_rgba(244,63,94,0.3)]'
      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
  }`}
  animate={allVoted ? {
    boxShadow: [
      '0 0 20px rgba(244,63,94,0.2)',
      '0 0 40px rgba(244,63,94,0.4)',
      '0 0 20px rgba(244,63,94,0.2)',
    ],
  } : {}}
  transition={allVoted ? { duration: 1.5, repeat: Infinity } : {}}
  whileHover={allVoted ? { scale: 1.02 } : {}}
  whileTap={allVoted ? { scale: 0.97 } : {}}
>
  {tieBreak ? 'Conferma eliminazione' : 'Elimina il più votato'}
</motion.button>
```

Note: Remove `animate-pulse` from the className since we're replacing it with Framer Motion glow.

- [ ] **Step 6: Add motion button to EliminationScreen**

In `src/screens/EliminationScreen.tsx`, add import:
```tsx
import { motion } from 'framer-motion'
```

Replace the continue `<button>` with:
```tsx
<motion.button
  onClick={confirmElimination}
  className="w-full max-w-xs glass-button py-5 rounded-2xl text-lg transition-colors"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
  {isMrWhite ? 'Vai al tentativo →' : 'Continua →'}
</motion.button>
```

- [ ] **Step 7: Add motion buttons to GuessScreen**

In `src/screens/GuessScreen.tsx`, add import:
```tsx
import { motion } from 'framer-motion'
```

Replace all three `<button>` elements ("Sono pronto", "Rispondo!", "Continua →") with `<motion.button>` equivalents adding:
```tsx
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.97 }}
transition={{ type: "spring", stiffness: 400, damping: 25 }}
```

Keep the disabled logic on "Rispondo!" — only apply whileHover/whileTap when `guess.trim().length > 0`.

- [ ] **Step 8: Add motion buttons to ResultScreen**

In `src/screens/ResultScreen.tsx`, add import:
```tsx
import { motion } from 'framer-motion'
```

Replace both buttons ("Continua", "Fine partita") with `<motion.button>` equivalents adding `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.97 }}`.

- [ ] **Step 9: Add breathing glow to PrivacyReveal**

In `src/components/PrivacyReveal.tsx`, add import:
```tsx
import { motion } from 'framer-motion'
```

Replace the card back `<div>` (the one with `backface-hidden rounded-3xl glass`) with:
```tsx
<motion.div
  className="absolute inset-0 backface-hidden rounded-3xl glass flex flex-col items-center justify-center gap-3 shadow-2xl"
  animate={{
    borderColor: [
      'rgba(255,255,255,0.08)',
      'rgba(99,102,241,0.3)',
      'rgba(255,255,255,0.08)',
    ],
  }}
  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
>
  <div className="text-5xl">👁️</div>
  <p className="text-slate-300 text-sm">Tocca per rivelare</p>
</motion.div>
```

Replace both buttons ("Ho visto — Nascondi" and "Prossimo giocatore →") with `<motion.button>` equivalents adding `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.97 }}`.

- [ ] **Step 10: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev`
Expected: All buttons spring on tap. SetupScreen inputs animate in/out. Progress bars overshoot with spring. PrivacyReveal card back breathes with indigo glow. VoteScreen confirm button glows dramatically when all votes cast.

- [ ] **Step 11: Commit**

```bash
git add src/screens/ src/components/PrivacyReveal.tsx
git commit -m "feat: add micro-interactions — motion buttons, input animations, spring progress bars, breathing glow"
```

---

### Task 9: Micro-interactions — VoteGrid Springs

**Files:**
- Modify: `src/components/VoteGrid.tsx`

- [ ] **Step 1: Add spring animations to VoteGrid**

Replace `src/components/VoteGrid.tsx` with:

```tsx
import { motion } from 'framer-motion'
import type { Player } from '../store/types'

interface Props {
  players: Player[]
  votes: Record<string, number>
  voterCount: number
  onVote: (targetId: string) => void
  disabled?: boolean
}

const AVATAR_COLORS = [
  'from-indigo-500 to-indigo-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700',
  'from-rose-500 to-rose-700',
  'from-cyan-500 to-cyan-700',
  'from-purple-500 to-purple-700',
  'from-pink-500 to-pink-700',
  'from-lime-500 to-lime-700',
  'from-orange-500 to-orange-700',
  'from-teal-500 to-teal-700',
  'from-fuchsia-500 to-fuchsia-700',
  'from-sky-500 to-sky-700',
]

export default function VoteGrid({ players, votes, voterCount, onVote, disabled }: Props) {
  const active = players.filter(p => !p.eliminated)
  const maxVotes = Math.max(0, ...Object.values(votes))

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {active.map((player, idx) => {
        const voteCount = votes[player.id] ?? 0
        const pct = voterCount > 0 ? (voteCount / voterCount) * 100 : 0
        const isLeading = voteCount > 0 && voteCount === maxVotes
        const initial = player.name.charAt(0).toUpperCase()
        const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length]

        return (
          <motion.button
            key={player.id}
            onClick={() => !disabled && onVote(player.id)}
            className={`relative overflow-hidden rounded-2xl p-4 text-left min-h-[88px] flex items-center gap-3
              ${voteCount > 0
                ? isLeading
                  ? 'glass border-rose-400/60'
                  : 'glass border-rose-500/30'
                : 'glass hover:border-white/15'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            whileTap={disabled ? {} : { scale: 0.95 }}
            animate={isLeading ? {
              boxShadow: [
                '0 0 16px rgba(244,63,94,0.2)',
                '0 0 24px rgba(244,63,94,0.4)',
                '0 0 16px rgba(244,63,94,0.2)',
              ],
            } : {}}
            transition={isLeading ? { duration: 1.5, repeat: Infinity } : { type: 'spring', stiffness: 400, damping: 25 }}
          >
            {/* Vote fill bar — spring animated */}
            {voteCount > 0 && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-rose-500/15"
                animate={{ height: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
            )}

            {/* Avatar */}
            <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md`}>
              {initial}
            </div>

            {/* Name */}
            <span className="relative font-semibold text-white text-sm flex-1">
              {player.name}
            </span>

            {/* Vote badge — pop on change */}
            {voteCount > 0 && (
              <motion.div
                key={voteCount}
                className={`relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isLeading ? 'bg-rose-500 text-white' : 'bg-rose-500/30 text-rose-200'
                }`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {voteCount}
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev`
Expected: Vote cards spring on tap. Vote bar fills with spring overshoot. Badge pops when count changes. Leading card pulses with rose glow.

- [ ] **Step 3: Commit**

```bash
git add src/components/VoteGrid.tsx
git commit -m "feat: add spring animations to VoteGrid — fill bar, badge pop, leading glow"
```

---

### Task 10: Wow Effects — Particles + Confetti + Dramatic Reveals + Animated Counters

**Files:**
- Create: `src/components/Particles.tsx`
- Modify: `src/components/PrivacyReveal.tsx`
- Modify: `src/screens/EliminationScreen.tsx`
- Modify: `src/screens/ResultScreen.tsx`

- [ ] **Step 1: Create Particles component**

Create `src/components/Particles.tsx`:

```tsx
import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface Props {
  count?: number
  colors: string[]
  origin?: 'center' | 'top'
  style?: 'burst' | 'fall'
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

interface ParticleData {
  id: number
  color: string
  x: number
  y: number
  size: number
  delay: number
  angle: number
  distance: number
}

export default function Particles({ count = 20, colors, origin = 'center', style = 'burst' }: Props) {
  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: Math.min(count, 20) }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: style === 'fall' ? randomBetween(5, 95) : 50,
      y: origin === 'top' ? -5 : 50,
      size: randomBetween(4, 8),
      delay: randomBetween(0, 0.3),
      angle: randomBetween(0, 360),
      distance: randomBetween(60, 150),
    }))
  }, [count, colors, origin, style])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => {
        if (style === 'burst') {
          const rad = (p.angle * Math.PI) / 180
          const endX = Math.cos(rad) * p.distance
          const endY = Math.sin(rad) * p.distance + 40 // gravity pull

          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: endX,
                y: endY,
                opacity: 0,
                scale: 0.3,
              }}
              transition={{
                duration: 1.2,
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          )
        }

        // fall style
        const swayX = randomBetween(-30, 30)
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: `${p.x}%`,
              top: '-2%',
            }}
            initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
            animate={{
              y: '110vh',
              x: [0, swayX, -swayX, swayX * 0.5],
              opacity: [1, 1, 0.8, 0],
              rotate: randomBetween(-180, 180),
            }}
            transition={{
              duration: randomBetween(2, 3),
              delay: p.delay,
              ease: 'easeIn',
            }}
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Add particles + flash to PrivacyReveal**

In `src/components/PrivacyReveal.tsx`, add import:
```tsx
import Particles from './Particles'
```

Add a `showParticles` state alongside the existing states:
```tsx
const [showParticles, setShowParticles] = useState(false)
```

In the `useEffect` that resets on playerName change, also reset `setShowParticles(false)`.

In the `handleCardTap` function, trigger particles:
```tsx
const handleCardTap = () => {
  if (phase === 'waiting') {
    setPhase('revealed')
    setShowParticles(true)
    setTimeout(() => setShowParticles(false), 1500)
  }
}
```

Inside the card container div (after the card `<div>` but still inside the outer wrapper), add:
```tsx
{/* Particles on reveal */}
{showParticles && (
  <>
    <Particles
      colors={role === 'mrwhite'
        ? ['#ffffff', '#e2e8f0', '#cbd5e1']
        : ['#818cf8', '#6366f1', '#a5b4fc']
      }
      style="burst"
      origin="center"
    />
    {role === 'mrwhite' && (
      <motion.div
        className="absolute inset-0 rounded-3xl bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ duration: 0.6 }}
      />
    )}
  </>
)}
```

Note: The outer card container (`perspective-1000 w-full max-w-xs`) needs `relative` added to its className for the particles to position correctly.

- [ ] **Step 3: Add dramatic reveal to EliminationScreen**

Replace `src/screens/EliminationScreen.tsx` with:

```tsx
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import RoleTag from '../components/RoleTag'

const ROLE_FLASH_COLORS: Record<string, string> = {
  mrwhite: 'rgba(255,255,255,0.15)',
  infiltrato: 'rgba(251,191,36,0.15)',
  civile: 'rgba(99,102,241,0.15)',
}

export default function EliminationScreen() {
  const eliminatedThisRound = useGameStore(s => s.eliminatedThisRound)
  const confirmElimination = useGameStore(s => s.confirmElimination)
  const players = useGameStore(s => s.players)

  if (!eliminatedThisRound) return null

  const { name, role } = eliminatedThisRound
  const isMrWhite = role === 'mrwhite'

  const remainingMrWhite = players.filter(p => !p.eliminated && p.role === 'mrwhite' && p.id !== eliminatedThisRound.id).length
  const remainingInfiltrati = players.filter(p => !p.eliminated && p.role === 'infiltrato' && p.id !== eliminatedThisRound.id).length
  const remainingImpostors = remainingMrWhite + remainingInfiltrati

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5 py-8 gap-8">
      {/* Background flash */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundColor: ROLE_FLASH_COLORS[role] }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.6 }}
      />

      <div className="flex flex-col items-center gap-3 relative z-10">
        <motion.div
          className="text-6xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {isMrWhite ? '🕵️' : role === 'infiltrato' ? '🎭' : '😇'}
        </motion.div>
        <p className="text-slate-400 text-sm uppercase tracking-widest">Eliminato</p>
        <motion.h2
          className="text-4xl font-black text-white"
          initial={{ scale: 0.5, filter: 'blur(8px)' }}
          animate={{ scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
        >
          {name}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RoleTag role={role} size="lg" />
        </motion.div>
      </div>

      {isMrWhite && (
        <motion.div
          className="glass rounded-2xl px-6 py-4 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-amber-400 font-semibold">Mr. White eliminato!</p>
          <p className="text-slate-400 text-sm mt-1">
            Potrà tentare di indovinare la parola dei civili per vincere ancora.
          </p>
          {remainingInfiltrati > 0 && (
            <p className="text-amber-400/70 text-xs mt-2">
              Attenzione: {remainingInfiltrati === 1 ? 'c\'è ancora 1 infiltrato' : `ci sono ancora ${remainingInfiltrati} infiltrati`} in gioco!
            </p>
          )}
        </motion.div>
      )}

      {role === 'infiltrato' && (
        <motion.div
          className="glass rounded-2xl px-6 py-4 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-amber-400 font-semibold">Infiltrato scoperto!</p>
          {remainingImpostors > 0 ? (
            <p className="text-slate-400 text-sm mt-1">
              {remainingImpostors === 1 ? 'Resta ancora 1 impostore' : `Restano ancora ${remainingImpostors} impostori`} da trovare.
            </p>
          ) : (
            <p className="text-slate-400 text-sm mt-1">Era l'ultimo!</p>
          )}
        </motion.div>
      )}

      {role === 'civile' && (
        <motion.div
          className="glass rounded-2xl px-6 py-4 text-center max-w-xs relative z-10"
          style={{ borderColor: 'rgba(244, 63, 94, 0.2)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-rose-400 font-semibold">Un civile eliminato!</p>
          <p className="text-slate-400 text-sm mt-1">Attenzione, gli impostori guadagnano terreno.</p>
        </motion.div>
      )}

      <motion.button
        onClick={confirmElimination}
        className="w-full max-w-xs glass-button py-5 rounded-2xl text-lg transition-colors relative z-10"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {isMrWhite ? 'Vai al tentativo →' : 'Continua →'}
      </motion.button>
    </div>
  )
}
```

- [ ] **Step 4: Add confetti + animated counters to ResultScreen**

Replace `src/screens/ResultScreen.tsx` with:

```tsx
import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import RoleTag from '../components/RoleTag'
import Particles from '../components/Particles'

function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, v => Math.round(v))
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    spring.set(value)
    return display.on('change', v => setDisplayValue(v))
  }, [value, spring, display])

  if (value <= 0) return <span>0</span>
  return <span>+{displayValue}</span>
}

export default function ResultScreen() {
  const players = useGameStore(s => s.players)
  const wordPair = useGameStore(s => s.wordPair)
  const winner = useGameStore(s => s.winner)
  const mrWhiteCorrectIds = useGameStore(s => s.mrWhiteCorrectIds)
  const scores = useGameStore(s => s.scores)
  const roundScores = useGameStore(s => s.roundScores)
  const resetGame = useGameStore(s => s.resetGame)
  const rematch = useGameStore(s => s.rematch)
  const resetScores = useGameStore(s => s.resetScores)

  const mwPoisoned = mrWhiteCorrectIds.length > 0
  const isCiviliansWin = winner === 'civilians' && !mwPoisoned
  const isLastTwo = winner === 'last_two'
  const isPoisoned = winner === 'civilians' && mwPoisoned

  const leaderboard = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
  const hasScoreHistory = leaderboard.some(([, s]) => s > 0)

  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-4 overflow-y-auto relative">
      {/* Confetti / Particles */}
      {isCiviliansWin && (
        <Particles
          count={20}
          colors={['#818cf8', '#fbbf24', '#34d399', '#f43f5e', '#22d3ee']}
          style="fall"
          origin="top"
        />
      )}
      {(isLastTwo) && (
        <Particles
          count={15}
          colors={['#ef4444', '#f59e0b', '#dc2626', '#d97706']}
          style="burst"
          origin="center"
        />
      )}
      {isPoisoned && (
        <>
          <Particles
            count={15}
            colors={['#ffffff', '#e2e8f0', '#cbd5e1']}
            style="burst"
            origin="center"
          />
          <motion.div
            className="absolute inset-0 bg-white pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 0.6 }}
          />
        </>
      )}

      {/* Winner banner */}
      {isCiviliansWin && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-indigo-700 to-indigo-900 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl font-black text-white">I Civili vincono!</h2>
          <p className="text-indigo-200 text-sm mt-1">Tutti gli impostori sono stati eliminati.</p>
        </motion.div>
      )}

      {isPoisoned && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-slate-100 to-slate-300 border border-white/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="text-5xl mb-2">🕵️</div>
          <h2 className="text-2xl font-black text-slate-900">Mr. White vince!</h2>
          <p className="text-slate-600 text-sm mt-1">
            Ha indovinato la parola dei civili.
          </p>
        </motion.div>
      )}

      {isLastTwo && (
        <motion.div
          className="rounded-3xl px-6 py-6 text-center bg-gradient-to-br from-rose-700 to-rose-900 border border-white/10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="text-5xl mb-2">😈</div>
          <h2 className="text-2xl font-black text-white">Gli impostori vincono!</h2>
          <p className="text-rose-200 text-sm mt-1">
            Sono sopravvissuti fino alla fine.
          </p>
        </motion.div>
      )}

      {/* Word reveal */}
      {wordPair && (
        <div className="glass rounded-2xl px-5 py-4">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Le parole segrete</p>
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-indigo-400">Civili</p>
              <p className="text-white font-bold">{wordPair.civilian}</p>
            </div>
            <div className="w-px bg-white/8" />
            <div>
              <p className="text-xs text-amber-400">Infiltrati</p>
              <p className="text-white font-bold">{wordPair.undercover}</p>
            </div>
          </div>
        </div>
      )}

      {/* Player list with animated round points */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Ruoli e punti partita
        </p>
        <div className="flex flex-col gap-2">
          {players.map((player, i) => {
            const pts = roundScores[player.name] ?? 0
            const isInfiltrateSurvivor = player.role === 'infiltrato' && !player.eliminated
            const isMwCorrect = player.role === 'mrwhite' && mrWhiteCorrectIds.includes(player.id)
            return (
              <motion.div
                key={player.id}
                className={`flex items-center justify-between glass rounded-2xl px-4 py-3 ${
                  player.eliminated ? 'opacity-50' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: player.eliminated ? 0.5 : 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {player.eliminated && <span className="text-slate-500 text-sm">✕</span>}
                  <span className={`font-medium truncate ${player.eliminated ? 'line-through text-slate-500' : 'text-white'}`}>
                    {player.name}
                  </span>
                  {isInfiltrateSurvivor && isLastTwo && (
                    <span className="text-amber-400 text-xs shrink-0">sopravvissuto!</span>
                  )}
                  {isMwCorrect && (
                    <span className="text-emerald-400 text-xs shrink-0">ha indovinato!</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RoleTag role={player.role} size="sm" />
                  <span className={`text-sm font-bold min-w-[32px] text-right ${
                    pts > 0 ? 'text-emerald-400' : 'text-slate-600'
                  }`}>
                    <AnimatedCounter value={pts} />
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Leaderboard */}
      {hasScoreHistory && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Classifica generale
            </p>
            <button
              onClick={resetScores}
              className="text-xs text-slate-600 hover:text-rose-400 transition-colors"
            >
              Azzera punteggi
            </button>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            {leaderboard.map(([name, total], i) => {
              const isFirst = i === 0 && total > 0
              return (
                <motion.div
                  key={name}
                  layout
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < leaderboard.length - 1 ? 'border-b border-white/8' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-bold text-sm ${
                      isFirst ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                      {isFirst ? '👑' : `${i + 1}`}
                    </span>
                    <span className="text-white font-medium text-sm">{name}</span>
                  </div>
                  <span className={`font-bold text-sm ${
                    isFirst ? 'text-amber-400' : 'text-white'
                  }`}>
                    {total} pt
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Points legend */}
      <div className="glass rounded-xl px-4 py-3">
        <p className="text-slate-500 text-xs mb-1.5">Punteggio</p>
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-indigo-400">Civile: 2 pt (se tutti impostori eliminati e MW non indovina)</span>
          <span className="text-white">Mr. White: 6 pt (se indovina la parola o sopravvive)</span>
          <span className="text-amber-400">Infiltrato: 5 pt (se sopravvive fino alla fine)</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <motion.button
          onClick={rematch}
          className="w-full glass-button py-5 rounded-2xl text-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Continua
        </motion.button>
        <motion.button
          onClick={resetGame}
          className="w-full glass-button-secondary py-4 rounded-2xl transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Fine partita
        </motion.button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev`
Expected: Full game playthrough verification:
- DealScreen: card flip triggers particle burst. Mr. White gets white flash + white particles. Civile/Infiltrato gets indigo particles.
- EliminationScreen: emoji bounces in, name deblurs, RoleTag fades in with delay, background flashes role color.
- ResultScreen: civilians win → confetti falls from top. Impostors win → red/amber burst. Mr. White wins → white flash + white burst. Score numbers animate from 0 to value. Leaderboard rows have layout animation.
- No animation blocks interaction. All particles are pointer-events: none.

- [ ] **Step 6: Commit**

```bash
git add src/components/Particles.tsx src/components/PrivacyReveal.tsx src/screens/EliminationScreen.tsx src/screens/ResultScreen.tsx
git commit -m "feat: add wow effects — particles, confetti, dramatic reveals, animated counters"
```

---

## Final Verification

After all tasks are complete, run a full end-to-end check:

1. `npm run build` — must succeed with zero errors
2. `npm run dev` — manual playthrough on mobile devtools:
   - **HomeScreen**: glass button, glass "come si gioca" box, ambient blobs visible
   - **SetupScreen**: glass inputs with focus glow, glass role counters, glass info box, input add/remove animates
   - **DealScreen**: spring progress dots, glass card back with breathing glow, particle burst on flip
   - **RoundScreen**: glass player cards, glass badge, rose glow button
   - **VoteScreen**: glass vote cards, spring fill bar, badge pop, leading glow pulse, spring progress bar, dramatic confirm glow
   - **EliminationScreen**: emoji bounce, name deblur, RoleTag delay, background flash, glass info box
   - **GuessScreen**: glass input, glass result boxes, glow buttons
   - **ResultScreen**: confetti/particles per winner, glass cards, animated counters, layout leaderboard
   - **Transitions**: slide/fade between all screens, no layout jumps
   - **QuitButton**: glass styling, glass modal
3. Performance: no visible frame drops or jank on mobile
