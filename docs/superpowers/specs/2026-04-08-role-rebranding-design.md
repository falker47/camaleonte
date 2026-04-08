# Home Screen Rebranding — Camaleonte

## Contesto

Il commit `8e93abe` ha rinominato i ruoli base (Infiltrato → La Talpa, Mr. White → Il Camaleonte) e aggiunto asset custom (`camaleonte.png`, `talpa.png`). La HomeScreen non è stata aggiornata e mantiene ancora il brand "Undercover" con icona spy e palette indigo/viola. Questa spec allinea la home al nuovo brand.

## Modifiche

### 1. HomeScreen (`src/screens/HomeScreen.tsx`)

| Elemento | Prima | Dopo |
|----------|-------|------|
| Icona | Emoji 🕵️ | `<img>` di `camaleonte.png` (~90px), glow teal, con 🦎 come accento decorativo |
| Icona filter | `drop-shadow(0 0 30px rgba(129,140,248,0.5))` | `drop-shadow(0 0 30px rgba(45,212,191,0.5))` |
| Titolo | "Undercover" | "Camaleonte" |
| Tagline | "Chi è l'impostore?" | "Chi si mimetizza fra voi?" |
| Tagline color | `text-violet-300` | `text-teal-300` |
| Divider | `rgba(129,140,248,0.5)` | `rgba(45,212,191,0.5)` |
| CTA button | classe `glass-button` | Inline style con gradient teal (vedi sotto) |
| CTA box-shadow | `rgba(99,102,241,0.35)` | `rgba(20,184,166,0.35)` |

**CTA inline style** (non modificare la classe globale `glass-button` usata in tutto il progetto):
```
background: linear-gradient(135deg, rgba(20,184,166,0.8), rgba(13,148,136,0.9))
border: 1px solid rgba(45,212,191,0.4)
box-shadow: 0 8px 32px rgba(20,184,166,0.3), inset 0 1px 0 rgba(255,255,255,0.15)
```

### 2. CSS — blobs, center-glow, particles, title-glow (`src/index.css`)

Queste classi sono usate SOLO nella HomeScreen. Aggiornare i colori:

| Classe | Colore prima | Colore dopo |
|--------|-------------|-------------|
| `.blob-1` | `rgba(99,102,241,0.35)` | `rgba(45,212,191,0.35)` |
| `.blob-2` | `rgba(139,92,246,0.25)` | `rgba(20,184,166,0.25)` |
| `.blob-3` | `rgba(251,191,36,0.12)` | `rgba(16,185,129,0.12)` (emerald accento) |
| `.center-glow` | `rgba(99,102,241,0.18)` | `rgba(45,212,191,0.18)` |
| `.title-glow` | `rgba(129,140,248,0.5)` | `rgba(45,212,191,0.5)` |
| `.particle-1` | `rgba(129,140,248,0.6)` | `rgba(45,212,191,0.6)` |
| `.particle-2` | `rgba(129,140,248,0.45)` | `rgba(45,212,191,0.45)` |
| `.particle-3` | `rgba(251,191,36,0.5)` | `rgba(16,185,129,0.5)` |
| `.particle-4` | `rgba(244,63,94,0.45)` | `rgba(94,234,212,0.45)` |
| `.particle-5` | `rgba(129,140,248,0.55)` | `rgba(45,212,191,0.55)` |
| `.particle-6` | `rgba(167,139,250,0.45)` | `rgba(20,184,166,0.45)` |
| `.particle-7` | `rgba(251,191,36,0.55)` | `rgba(16,185,129,0.55)` |
| `.particle-8` | `rgba(129,140,248,0.5)` | `rgba(45,212,191,0.5)` |
| `.particle-9` | `rgba(244,63,94,0.5)` | `rgba(94,234,212,0.5)` |
| `.particle-10` | `rgba(167,139,250,0.6)` | `rgba(20,184,166,0.6)` |
| `.particle-11` | `rgba(251,191,36,0.5)` | `rgba(16,185,129,0.5)` |

### 3. NON toccare — elementi globali

- `AmbientBlobs` in `App.tsx` — radial gradients indigo/viola visibili su tutte le schermate
- Classe `.glass-button` in `index.css` — usata globalmente (CTA HomeScreen usa inline style)
- Classe `.glass-button-secondary` — usata globalmente, nessuna modifica

### 4. `index.html`

| Attributo | Prima | Dopo |
|-----------|-------|------|
| `<title>` | Undercover | Camaleonte |
| `meta[description]` | "Il gioco di deduzione sociale per feste" | invariato |
| `meta[apple-mobile-web-app-title]` | Undercover | Camaleonte |
| `og:title` | Undercover | Camaleonte |
| `twitter:title` | Undercover | Camaleonte |

### 5. Immagine camaleonte

Importare `camaleonte.png` da `src/assets/camaleonte.png` e renderizzarla come `<img>` al posto dell'emoji 🕵️. Applicare:
- `drop-shadow` teal
- Dimensione circa 80-100px
- Contenitore circolare con glow `rgba(45,212,191,0.2)`

### Non cambia

- Layout e struttura della HomeScreen (stagger animations, stats row, footer, secondary buttons)
- Contenuto stats (3-12, 5-15, 1)
- Logica PWA install
- Tutorial (già aggiornato nel commit di rebrand)
- Sfondo base `slate-950` / `#0f0a1e`
- `AmbientBlobs` globali in App.tsx
- Classi `.glass-button` / `.glass-button-secondary` globali

## Verifica

1. Aprire la home — verificare immagine camaleonte, titolo "Camaleonte", tagline, palette teal
2. Verificare che blobs, particles e glow animino correttamente in teal
3. Navigare a Setup e verificare che `glass-button` sia ancora indigo (non teal)
4. Verificare che `<title>` e og tags siano "Camaleonte" con View Source
5. Testare PWA install (se disponibile)
