# Schermata "Ultima Possibilità" — Design Spec

## Contesto

Nel gioco Undercover, quando i giocatori attivi sono a una sola eliminazione dalla soglia di sopravvivenza degli impostori, i civili hanno un'unica possibilità di votare correttamente. Attualmente non c'è alcun segnale visivo che comunichi questa tensione. Questa feature aggiunge un overlay cinematico e un banner persistente nella RoundScreen per creare tensione drammatica e spingere i civili a riflettere bene prima di votare.

## Condizione di attivazione

L'overlay si attiva quando:

```
active.length === getSurvivalThreshold(totalPlayers) + 1
```

Cioè: il numero di giocatori attivi è esattamente uno in più rispetto alla soglia di sopravvivenza. La prossima eliminazione di un civile farebbe vincere gli impostori.

Soglie di riferimento (da `utils/winCondition.ts`):
- 9+ giocatori totali: soglia = 4, overlay a 5 attivi
- 6-8 giocatori totali: soglia = 3, overlay a 4 attivi
- 3-5 giocatori totali: soglia = 2, overlay a 3 attivi

## Comportamento

### Fase 1 — Overlay Cinematico

Quando la RoundScreen monta e la condizione è vera, si mostra un overlay full-screen **prima** del contenuto normale:

- **Sfondo**: nero/scurissimo con gradiente radiale rosso al centro (glow pulsante)
- **Particelle**: piccoli punti rosso/arancione sparsi che fluttuano lentamente
- **Testo principale**: "ULTIMA POSSIBILITÀ" — grande (text-3xl/text-4xl), font-black, bianco con text-shadow rosso (`0 0 40px rgba(220,38,38,0.5)`)
- **Sottotitolo sopra**: "⚠ TURNO FINALE" — piccolo, uppercase, letter-spacing largo, rosso tenue
- **Sottotitolo sotto**: "Scegliete con cura." — testo slate chiaro, peso normale
- **Hint in basso**: "TOCCA PER CONTINUARE" — molto piccolo, quasi invisibile, slate-600
- **Vibrazione**: `navigator.vibrate([100, 50, 100])` al mount (doppio pulse)
- **Animazione di entrata**: fade-in del background (0.5s), poi il testo principale appare con scale da 0.8 a 1 + opacity (delay 0.3s, durata 0.8s)
- **Chiusura**: al tap/click ovunque, l'overlay fa fade-out (0.3s) e viene rimosso. In alternativa, si auto-chiude dopo 4 secondi

### Fase 2 — RoundScreen con Banner Persistente

Dopo che l'overlay si chiude, la RoundScreen mostra il suo contenuto normale **con queste modifiche**:

- **Banner rosso in cima**: `background: rgba(220,38,38,0.1)`, bordo `rgba(220,38,38,0.3)`, bordi arrotondati. Contiene:
  - Icona ⚠
  - Titolo: "Ultima possibilità" (rosso, bold)
  - Sottotitolo: "Un errore e gli impostori vincono" (rosso tenue)
- **Testo CTA modificato**: il testo sopra il pulsante diventa "Scegliete bene — non ci saranno altre occasioni" (colore rosso tenue al posto di slate)
- **Pulsante voto rosso**: il pulsante "Vota l'impostore →" mantiene il suo stile `bg-rose-600` (già rosso, nessun cambiamento necessario)

## Architettura

### Componenti

**`LastChanceOverlay`** — Nuovo componente in `src/components/LastChanceOverlay.tsx`
- Props: `onDismiss: () => void`
- Usa Framer Motion per le animazioni (fade, scale)
- Chiama `vibrate([100, 50, 100])` al mount
- Timer auto-dismiss a 4 secondi con `useEffect` + `setTimeout`
- Al click/tap chiama `onDismiss`

**Modifiche a `RoundScreen.tsx`**:
- Importa `getSurvivalThreshold` da `utils/winCondition.ts`
- Calcola `isLastChance = active.length === getSurvivalThreshold(players.length) + 1`
- State locale `showOverlay` inizializzato a `isLastChance`
- Quando `showOverlay` è true, renderizza `<LastChanceOverlay onDismiss={() => setShowOverlay(false)} />`
- Quando `isLastChance` è true (anche dopo overlay chiuso), mostra il banner rosso e il testo CTA modificato

### Nuove animazioni CSS

Nessuna nuova animazione CSS necessaria — tutto gestito con Framer Motion (`animate`, `initial`, `transition`).

### Stili del banner

Usa classi Tailwind inline, coerenti con il design system glass-morphism esistente.

## File da modificare

| File | Modifica |
|------|----------|
| `src/components/LastChanceOverlay.tsx` | **Nuovo** — overlay cinematico |
| `src/screens/RoundScreen.tsx` | Aggiungere logica `isLastChance`, stato overlay, banner, testo CTA |

## Verifica

1. Avviare il gioco con 6 giocatori (soglia = 3, overlay a 4 attivi)
2. Eliminare giocatori fino a quando ne restano 4 attivi
3. Verificare che al turno successivo appaia l'overlay cinematico con vibrazione
4. Verificare che il tap chiuda l'overlay
5. Verificare che il banner rosso persista nella RoundScreen
6. Verificare che il testo CTA sia modificato
7. Verificare che con 5+ giocatori attivi l'overlay NON appaia
8. Verificare che dopo aver eliminato l'impostore corretto, il gioco finisca normalmente
