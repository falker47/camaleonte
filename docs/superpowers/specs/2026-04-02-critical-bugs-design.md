# Critical Bugs Fix — Design Spec

## Context

Il gioco Impostor/Undercover ha 4 bug critici scoperti durante ispezione del codice. Questi bug impattano la correttezza del gameplay (guess Mr. White con accenti) e l'equità (tie-break silenzioso). Questa spec copre solo i fix, nessun refactoring.

---

## Bug 1: Normalizzazione diacritici nel guess di Mr. White

**File:** `src/store/gameStore.ts:164-165`

**Problema:** La funzione `normalize` usa `NFC` che compone i caratteri ma non rimuove gli accenti. Parole come "Caffè", "Tiramisù", "Tè freddo"/"Tè caldo" non matchano se il giocatore scrive "Caffe", "Tiramisu", "Te freddo".

**Fix:** Cambiare la normalizzazione da `NFC` a `NFD` + rimozione combining marks:

```typescript
const normalize = (s: string) =>
  s.trim().toLowerCase()
   .normalize('NFD')
   .replace(/[\u0300-\u036f]/g, '')
```

**Parole dataset impattate:** "Caffè", "Tiramisù", "Tè freddo", "Tè caldo" (4 su ~60 coppie).

---

## Bug 2: Tie-break silenzioso con eliminazione alfabetica

**File:** `src/screens/VoteScreen.tsx:56-70`

**Problema:** Se il ri-voto tra giocatori in parità produce ancora un pareggio, il gioco sceglie silenziosamente il primo in ordine alfabetico. Nessun feedback visivo.

**Fix:** Sostituire l'eliminazione alfabetica con sorteggio casuale + messaggio.

### Implementazione — flusso a 2 fasi:

**Fase A — Messaggio di conferma (pre-sorteggio):**

1. In `handleTieConfirm`, se `tied.length > 1`:
   - NON sorteggiare subito. Settare uno state `pendingDraw: Player[]` con i giocatori pareggiati.
   - Mostrare un pannello di conferma:
     ```
     Parità tra [Nome1] e [Nome2]!
     Verrà sorteggiato un giocatore da eliminare.
     [Bottone: Sorteggia]
     ```

**Fase B — Sorteggio e risultato:**

2. Al click su "Sorteggia":
   - Estrarre un giocatore casuale da `pendingDraw` usando `crypto.getRandomValues`
   - Settare `randomPick: Player` con il risultato
   - Mostrare il risultato:
     ```
     [Nome] è stato estratto a sorte!
     [Bottone: Continua]
     ```

3. Al click su "Continua":
   - Chiamare `castVote({ [randomPick.id]: 1 })`
   - Procedere normalmente all'eliminazione

### State del componente:

```typescript
const [pendingDraw, setPendingDraw] = useState<Player[] | null>(null)  // fase A
const [randomPick, setRandomPick] = useState<Player | null>(null)       // fase B
```

### Funzione helper per pick casuale:

- Usare `crypto.getRandomValues` (già usato in `shuffle.ts`) per scegliere un indice casuale nell'array
- Non serve importare shuffle — basta un semplice random int

---

## Bug 3: Non-null assertion crash nel tie handler

**File:** `src/screens/VoteScreen.tsx:63-64`

**Problema:** `active.find(p => p.id === id)!` — se l'ID non corrisponde a nessun giocatore attivo, il non-null assertion causa un crash runtime.

**Fix:** Questo codice viene sostituito dal fix del Bug 2 (sorteggio casuale). La nuova implementazione userà un approccio safe:

```typescript
const tiedPlayers = tied
  .map(id => active.find(p => p.id === id))
  .filter((p): p is Player => p !== undefined)
```

Se `tiedPlayers` è vuoto dopo il filtro (caso impossibile ma safe), non procedere.

---

## Bug 4: ID vuoto in mrWhiteCorrectIds

**File:** `src/store/gameStore.ts:171`

**Problema:** `eliminatedThisRound?.id ?? ''` potrebbe inserire una stringa vuota nell'array se `eliminatedThisRound` è null. Non causa scoring errato (l'ID vuoto non matcha nessun giocatore in `calcFinalScores`), ma è codice fragile.

**Fix:** Early return se `eliminatedThisRound` è null:

```typescript
submitMrWhiteGuess: (guess) => {
  const { wordPair, players, scores, mrWhiteCorrectIds, eliminatedThisRound } = get()
  if (!wordPair || !eliminatedThisRound) return
  // ... rest of the function
```

Rimuovere `?? ''` e usare direttamente `eliminatedThisRound.id`.

---

## File da modificare

| File | Bug | Tipo di modifica |
|------|-----|-----------------|
| `src/store/gameStore.ts` | #1, #4 | Fix normalize, early return |
| `src/screens/VoteScreen.tsx` | #2, #3 | Sorteggio casuale, rimuovi non-null assertion |

---

## Verifica

1. **Bug 1:** Avviare il gioco → assegnare "Caffè" come parola civile → Mr. White indovina scrivendo "caffe" (senza accento) → deve risultare corretto
2. **Bug 2:** Forzare un pareggio al ri-voto (serve partita con ≥4 giocatori) → verificare che appaia il pannello "Sorteggio!" con nome casuale
3. **Bug 3:** Coperto dal fix del Bug 2 — il nuovo codice non usa non-null assertions
4. **Bug 4:** Ispezionare il codice — `eliminatedThisRound` non può più essere null quando si accede a `.id`
5. **Build:** `npm run build` deve passare senza errori TypeScript