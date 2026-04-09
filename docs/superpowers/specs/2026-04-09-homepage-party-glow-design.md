# Homepage "Party Glow" Redesign

## Context

L'immagine `camaleonte-square.png` trasmette energia da party game: colori vivaci, disco ball, coriandoli, bandierine, bambini che ridono. La homepage attuale invece è dark/monocromatica teal con glassmorphism freddo — l'estetica è "tech startup" più che "gioco di società tra amici." L'obiettivo è colmare questo gap mantenendo il dark theme e il glassmorphism esistenti, rendendo la homepage più colorata, vivace e festosa.

**Approccio**: Evoluzione, non rivoluzione. La homepage può essere "speciale" rispetto alle altre schermate.

**File coinvolti**:
- `src/screens/HomeScreen.tsx` — componente homepage principale
- `src/index.css` — CSS per blob, particelle, glow, animazioni

## 1. Mascotte Hero

**File**: `src/screens/HomeScreen.tsx` (linee 62-68)

- Dimensione da 90px → **200px** (`w-[200px] h-[200px]`)
- Drop-shadow multicolore: verde + viola + teal sovrapposti
  ```css
  filter: drop-shadow(0 0 30px rgba(45,212,191,0.5))
          drop-shadow(0 0 50px rgba(139,92,246,0.3))
          drop-shadow(0 0 20px rgba(74,222,128,0.3));
  ```
- Animazione floating più accentuata (da 6px a 10px nel keyframe `spy-float`)
- Aggiungere anello luminoso pulsante attorno alla mascotte — un `div` circolare con bordo sfumato che pulsa (richiama la disco ball dell'immagine)

## 2. Titolo e Tagline

**File**: `src/screens/HomeScreen.tsx` (linee 71-86), `src/index.css` (`.title-glow`)

**Titolo "CAMALEONTE"**:
- Gradiente testo con `background-clip: text`: verde brillante (#4ade80) → teal (#2dd4bf) → viola (#a78bfa)
- Text-shadow multicolore: glow verde + glow viola sovrapposti (più forte dell'attuale solo-teal)
- Mantiene font Bangers e letter-spacing 4px

**Tagline "Chi si mimetizza fra voi?"**:
- Dimensione leggermente più grande (da `text-sm` a `text-base`)
- Colore sfumato dal teal al viola chiaro, oppure teal-200 per più visibilità

## 3. Coriandoli Festosi (sostituiscono le particelle)

**File**: `src/index.css` (`.particle-*`), `src/screens/HomeScreen.tsx` (linee 45-59)

Le 15 particelle attuali (puntini 3-5px quasi invisibili) vengono sostituite da ~10 coriandoli/scintille:

- **Forme variate**: rettangolini (coriandoli) e cerchi (scintille) — i rettangolini usano `border-radius: 2px` con dimensioni tipo 4x10px, i cerchi restano rotondi
- **Dimensioni**: 6-12px (attualmente 3-5px)
- **Colori saturi**: verde brillante (#4ade80), viola/fucsia (#a78bfa, #f472b6), ambra/oro (#fbbf24), cyan (#22d3ee), rosa (#fb7185)
- **Animazione**: caduta lenta dall'alto con rotazione (`translateY` + `rotate`) — keyframe `confetti-fall`
- **Opacità**: 0.6-0.9 (più visibili di prima)
- **Quantità**: ~10 elementi ben visibili

## 4. Blob Ambient e Center Glow

**File**: `src/index.css` (`.blob-*`, `.center-glow`)

**Blob**:
- `blob-1` (teal): opacità interna da 0.35 → 0.45
- `blob-2` (viola): opacità da 0.2 → 0.35 (viola più presente)
- `blob-3` (cyan → verde): cambio colore a verde/lime (`rgba(74,222,128,0.25)`) per richiamare il camaleonte
- Tutti: `opacity` da 0.4 → 0.55

**Center glow**:
- Gradiente radiale teal → verde → viola (invece di solo teal → viola)
- Pulsazione leggermente più intensa (scale da 1.1 → 1.15)

## 5. Pulsante CTA e UI

**File**: `src/screens/HomeScreen.tsx` (linee 114-126, 129-149)

**CTA "Gioca Ora"**:
- Gradiente da teal puro → teal-verde smeraldo: `linear-gradient(135deg, rgba(20,184,166,0.85), rgba(16,185,129,0.9))`
- Glow più forte con sfumatura viola: `0 8px 32px rgba(20,184,166,0.35), 0 0 60px rgba(139,92,246,0.15)`

**Buttons secondari**:
- Bordo leggermente più visibile (`rgba(255,255,255,0.18)` da 0.12)
- Hover con tinta teal sottile invece di solo bianco

**Stats row**:
- Label da `text-slate-400` → `text-teal-400/70` (più integrate col tema)

## 6. Bandierine Festose (Bunting)

**File**: `src/screens/HomeScreen.tsx` (nuovo elemento), `src/index.css` (nuovi stili)

Nuovo elemento decorativo nella parte alta della pagina:

- Fila di triangolini CSS posizionata `absolute` in alto
- ~8-10 triangolini alternati nei colori: verde, viola, ambra, cyan, rosa
- Opacità ~0.3-0.4 (decorativi, non dominanti)
- Implementazione con `clip-path: polygon(50% 0%, 0% 100%, 100% 100%)` su piccoli div
- Animazione sottile di ondeggiamento (`sway` keyframe) per simulare il vento
- Filo/corda sottile con `border-top` o SVG path curvo

## Verifica

1. **Avvia dev server**: `npm run dev`
2. **Controlla homepage**: la mascotte deve essere grande e luminosa, il titolo deve avere il gradiente multicolore, i coriandoli devono essere visibili e colorati, le bandierine devono apparire in alto
3. **Confronto con l'immagine**: l'energia e la palette di colori della homepage devono richiamare `camaleonte-square.png`
4. **Performance**: verificare che le animazioni CSS non causino jank (usare Chrome DevTools > Performance)
5. **Mobile**: testare su viewport 375px — tutto deve restare centrato e non overflow
6. **Altre schermate**: verificare che le modifiche a `index.css` non impattino negativamente le altre schermate (le nuove classi sono specifiche della homepage)
