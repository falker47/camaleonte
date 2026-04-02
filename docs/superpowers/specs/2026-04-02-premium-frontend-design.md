# Premium Frontend — Glassmorphism + Animazioni

## Obiettivo

Trasformare il frontend di Mr. White da funzionale a premium, intervenendo su due assi:
1. **Raffinatezza grafica** — glassmorphism su tutte le superfici
2. **Animazioni e micro-interazioni** — transizioni fluide ovunque, effetti wow nei momenti chiave

Tipografia e branding sono esclusi da questo intervento (fase successiva).

## Dipendenze

- **Framer Motion** (`framer-motion`) — libreria di animazioni per React

## Approccio: Layer by Layer

Lavoriamo per livelli sovrapposti, ognuno testabile indipendentemente.

---

## Layer 1 — Glassmorphism Design System

### Utility CSS in `index.css`

Definire classi riutilizzabili nel layer `@layer components`:

| Classe | Scopo |
|---|---|
| `.glass` | Contenitore base: `bg-white/5 backdrop-blur-xl border border-white/8` + ombra stratificata + inner highlight top |
| `.glass-strong` | Versione più opaca per elementi in primo piano: `bg-white/10` |
| `.glass-button` | Pulsante primario con gradient indigo + glow shadow + inner highlight |
| `.glass-button-secondary` | Pulsante secondario con bordo glass |
| `.glass-input` | Input con background glass + focus ring con glow indigo |

### Background ambient

Aggiungere al container principale in `App.tsx` (o come pseudo-element) blob sfumati fissi:
- Blob indigo in alto a sinistra: `radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)`
- Blob viola in basso a destra: `radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)`
- Posizionati con `position: fixed` + `pointer-events: none`

### Applicazione alle schermate

Ogni schermata esistente viene aggiornata sostituendo:
- `bg-slate-800` → `glass`
- `bg-slate-800/60` → `glass` (già semi-trasparente)
- `bg-slate-900` → `glass` con opacità ridotta
- Pulsanti primari `bg-indigo-600` → `glass-button`
- Pulsanti secondari `border-2 border-slate-600` → `glass-button-secondary`
- Input `bg-slate-800 border border-slate-600` → `glass-input`
- Separatori `bg-slate-700` / `w-px bg-slate-700` → `border-white/8`

### File coinvolti
- `src/index.css` — nuove classi
- `src/App.tsx` — blob ambient nel container
- Tutte le 8 schermate in `src/screens/`
- `src/components/PrivacyReveal.tsx` — carta glass
- `src/components/VoteGrid.tsx` — vote cards glass
- `src/components/RoleTag.tsx` — badge glass

---

## Layer 2 — Transizioni tra schermate

### Architettura

In `App.tsx`, wrappare il rendering della schermata con `AnimatePresence` di Framer Motion:

```
<AnimatePresence mode="wait">
  <motion.div key={screen} variants={...} initial="enter" animate="center" exit="exit">
    <Screen />
  </motion.div>
</AnimatePresence>
```

### Direzione delle transizioni

Calcolare la direzione confrontando l'indice della schermata precedente vs attuale nell'array ordinato del flusso di gioco. Avanzare = slide da destra, tornare indietro = slide da sinistra.

| Transizione | Effetto |
|---|---|
| home → setup | slide dx (x: 30→0, opacity: 0→1) |
| setup → home | slide sx (x: -30→0) |
| setup → deal | slide dx |
| deal → round | fade (opacity only) |
| round → vote | slide dx |
| vote → elimination | fade + scale (0.95→1) |
| elimination → guess | slide dx |
| elimination/guess → round | fade |
| qualsiasi → result | fade + scale (0.95→1) |

### Parametri animazione
- Durata: ~300ms
- Easing: `ease-out` per entrata, `ease-in` per uscita
- Spostamento x: ±30px (leggero, non full-screen)

### File coinvolti
- `src/App.tsx` — AnimatePresence wrapper, logica direzione, ref screen precedente

---

## Layer 3 — Micro-interazioni

### Pulsanti

Usare `motion.button` direttamente nelle schermate (no componente wrapper separato):
- `whileHover={{ scale: 1.02 }}` + intensificazione glow
- `whileTap={{ scale: 0.97 }}` + ombra ridotta
- Transizione spring: `type: "spring", stiffness: 400, damping: 25`

### Input fields (SetupScreen)
- Focus: transizione bordo a indigo con glow ring
- Aggiunta giocatore: `motion.div` con `animate={{ opacity: 1, height: "auto" }}` dal nulla
- Rimozione: `AnimatePresence` con slide out + collapse

### VoteGrid
- Barra voti: spring animation con `motion.div` al posto di CSS transition
- Badge voti: `animate={{ scale: [1.3, 1] }}` al cambio valore (pop)
- Leading vote: glow pulsante con `animate={{ boxShadow: [...] }}` loop

### Progress bars (DealScreen, VoteScreen)
- `motion.div` con spring + leggero overshoot al posto di CSS transition

### PrivacyReveal card
- Idle: breathing glow animato sul bordo (`animate={{ borderColor: [...] }}` loop infinito)
- Il flip resta CSS (funziona bene), aggiungere bounce finale opzionale

### File coinvolti
- `src/screens/SetupScreen.tsx` — input animations
- `src/screens/VoteScreen.tsx` — progress bar
- `src/screens/DealScreen.tsx` — progress bar
- `src/components/VoteGrid.tsx` — vote bar, badge, glow
- `src/components/PrivacyReveal.tsx` — breathing glow

---

## Layer 4 — Effetti wow

### Particelle (utility condivisa)

Creare `src/components/Particles.tsx` — componente riutilizzabile che genera N div animati con Framer Motion:
- Props: `count`, `colors`, `origin` (center/top), `style` (burst/fall)
- Ogni particella: posizione random, animazione con gravità simulata via keyframes
- Durata: ~1.5s, auto-cleanup
- Max 20 particelle per non impattare performance

### Confetti (ResultScreen vittoria civili)

Usare `Particles` con `style="fall"` + `origin="top"`:
- ~20 particelle colorate (indigo, amber, emerald, rose, cyan)
- Cadono dall'alto con oscillazione laterale random
- Triggerato al mount della schermata

### Reveal del ruolo (PrivacyReveal)

Al flip della carta, triggerare `Particles` con `style="burst"` + `origin="center"`:
- Mr. White: particelle bianche/argento + flash bianco momentaneo (div overlay con opacity 0→0.3→0)
- Civile/Infiltrato: particelle indigo

### Eliminazione (EliminationScreen)

- Emoji: entra con bounce elastico (`spring: { stiffness: 300, damping: 15 }`)
- Nome: `scale: 0.5→1` + `filter: blur(8px)→blur(0)` simultanei
- RoleTag: appare con delay 200ms dopo il nome
- Background flash: div full-screen con colore ruolo, opacity `0→0.15→0` in 600ms

### Votazione (VoteScreen)

- Pulsante conferma: glow pulsante teatrale (box-shadow che oscilla tra intensità) al posto del semplice `animate-pulse`

### Risultato (ResultScreen)

- Vittoria civili: confetti (vedi sopra)
- Vittoria impostori: particelle rosse/ambra burst dal titolo
- Mr. White indovina: flash bianco + burst bianco
- Punteggi: counter animato `0 → valore finale` con `useMotionValue` + `animate`
- Classifica: `layout` prop di Framer Motion per reorder animato

### Vincolo UX
- Nessuna animazione blocca l'interazione
- Particelle sono decorative (pointer-events: none)
- Durata massima effetti: 1.5s

### File coinvolti
- `src/components/Particles.tsx` — nuovo componente
- `src/components/PrivacyReveal.tsx` — burst al flip
- `src/screens/EliminationScreen.tsx` — dramatic reveal
- `src/screens/VoteScreen.tsx` — glow pulsante
- `src/screens/ResultScreen.tsx` — confetti, counter, layout reorder

---

## File modificati (riepilogo)

| File | Layer |
|---|---|
| `src/index.css` | L1 |
| `src/App.tsx` | L1, L2 |
| `src/screens/HomeScreen.tsx` | L1, L3 |
| `src/screens/SetupScreen.tsx` | L1, L3 |
| `src/screens/DealScreen.tsx` | L1, L3 |
| `src/screens/RoundScreen.tsx` | L1 |
| `src/screens/VoteScreen.tsx` | L1, L3, L4 |
| `src/screens/EliminationScreen.tsx` | L1, L4 |
| `src/screens/GuessScreen.tsx` | L1 |
| `src/screens/ResultScreen.tsx` | L1, L4 |
| `src/components/PrivacyReveal.tsx` | L1, L3, L4 |
| `src/components/VoteGrid.tsx` | L1, L3 |
| `src/components/RoleTag.tsx` | L1 |
| `src/components/Particles.tsx` | L4 (nuovo) |

## Verifica

1. `npm install framer-motion` — installa dipendenza
2. `npm run build` — verifica che compili senza errori
3. `npm run dev` — test manuale su browser mobile (o devtools mobile):
   - Navigare tutto il flusso: home → setup → deal → round → vote → elimination → (guess) → result
   - Verificare glassmorphism su ogni schermata (blur visibile, bordi, ombre)
   - Verificare transizioni fluide tra ogni cambio schermata
   - Verificare micro-interazioni: hover/tap pulsanti, focus input, vote bar spring, badge pop
   - Verificare effetti wow: particelle al reveal, dramatic entrance eliminazione, confetti risultato
   - Verificare che nessuna animazione blocchi l'interazione
   - Verificare performance su dispositivo reale (no jank, no frame drops)
