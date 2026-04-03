# Homepage Redesign — "Dramatic + Alive"

## Context

La homepage attuale è minimale: emoji spia, titolo, sottotitolo e bottoni. L'obiettivo è trasformarla in un'esperienza visiva drammatica e coinvolgente che comunichi immediatamente il mood del gioco (mistero + party), mantenendo il tono invitante.

## Design

### Layout (dall'alto al basso, centrato verticalmente)

1. **Glow radiale pulsante** — sfondo animato al centro della pagina
2. **Icona spia 🕵️** — grande (text-7xl), con drop-shadow indaco e animazione float lenta
3. **"Undercover"** — titolo 40px, font-black, text-shadow indaco
4. **"Chi è l'impostore?"** — tagline uppercase, letter-spacing 3px, colore `#c4b5fd` (violet-300), italic
5. **Divisore** — linea gradiente 60px (transparent → indaco → transparent)
6. **Stats row** — 3 colonne separate da divider verticali:
   - "3-10" / Giocatori
   - "5-15" / Minuti
   - "1" / Device
7. **CTA "Gioca Ora"** — bottone glass-button, più grande dell'attuale (py-5, px-14, text-lg), glow shadow potenziato
8. **Bottoni secondari** — "Come si gioca" + "Installa App" (condizionale PWA)

### Animazioni (Framer Motion)

- **Entrata a cascata** — ogni elemento appare dal basso con `fadeSlideUp`, stagger ~100ms tra elementi
- **Glow pulsante** — il radial gradient al centro pulsa con ciclo 4s infinito (opacity 0.6→1, scale 1→1.1)
- **Icona float** — l'emoji spia oscilla verticalmente con ciclo 3s (translateY 0→-6px)
- **Particelle flottanti** — 6-8 particelle CSS (non il componente Particles.tsx che è per burst/fall) con colori indaco/viola/ambra, animazione drift infinita
- **Blob ambientali** — 2-3 div sfocati con radial-gradient che fluttuano lentamente (ciclo 8s)
- **Hover/tap bottoni** — spring scale come attuale (1.02 hover, 0.97 tap)

### Cosa non cambia

- Stack tecnico (React 19 + Tailwind v4 + Framer Motion + Zustand)
- Logica navigazione (`goTo('setup')`) e store
- Componente Tutorial e hook `usePwaInstall`
- Palette colori base (dark purple #0f0a1e + indaco)
- Classi glass esistenti in index.css

## File da modificare

- **`src/screens/HomeScreen.tsx`** — riscrittura del JSX e aggiunta animazioni Framer Motion
- **`src/index.css`** — eventuali nuove utility classes per glow/float (se non gestibili solo con Framer Motion)

## Dettagli implementativi

### Particelle e blob

Implementare direttamente in HomeScreen come elementi `motion.div` con animazioni CSS keyframes (più leggeri delle Framer Motion per animazioni infinite). Non riusare `Particles.tsx` che è pensato per effetti one-shot (burst/fall).

### Stats row

Componente inline, non estrarre in componente separato (usato solo qui).

### Responsive

Il layout è già mobile-first con `max-w-md`. Mantenere questo constraint. Le stats devono rimanere leggibili su schermi da 320px.

## Mockup di riferimento

Il mockup approvato si trova in:
`.superpowers/brainstorm/765-1775173586/content/homepage-detailed.html`

## Verifica

1. `npm run build` — deve compilare senza errori
2. `npm run dev` — verificare visivamente nel browser:
   - Animazioni fluide (glow, float, particelle, entrata a cascata)
   - Layout centrato e responsive
   - Bottoni funzionanti (Nuova Partita → setup, Come si gioca → tutorial, Installa → PWA)
   - Nessun layout shift al caricamento
