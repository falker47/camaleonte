# Implementa il ruolo: Il Cobra

## Contesto del gioco

Camaleonte e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

**Win conditions** (`src/utils/winCondition.ts`):
- `'civilians'`: tutti gli impostori eliminati
- `'last_two'`: giocatori attivi <= soglia (2 per 3-5, 3 per 6-8, 4 per 9+) con almeno 1 impostore vivo
- `getSurvivalThreshold(totalPlayers)` restituisce la soglia

**Flusso eliminazione attuale** (`src/store/gameStore.ts` -> `confirmElimination()`):
1. Segna eliminato come `eliminated: true, eliminatedInTurno: turno`
2. Se ha R&G (`specialRole === 'romeo'|'giulietta'`), elimina anche il partner (potrebbe non essere ancora implementato - controlla)
3. Se e' MW -> `mrwhite_guess`
4. Altrimenti -> `checkWinCondition()` -> `result` o `round + turno+1`

## Infrastruttura esistente

**Tipi** (`src/store/types.ts`):
- `SpecialRole` union type, `Player.specialRole?: SpecialRole`
- `GameConfig.specialRoles` oggetto con boolean opzionali
- `Screen` union type per le schermate

**Assegnazione** (`src/utils/assignRoles.ts`):
- Pattern: `eligible = result.filter(p => !p.specialRole)` -> shuffle -> pick

**SetupScreen**: overlay generico `SpecialRolesOverlay`, stati locali per toggle, badge sotto bottone

**PrivacyReveal**: prop `specialRole`, badge + spiegazione sulla carta

**IMPORTANTE**: Controlla lo stato attuale dei file prima di modificarli. Potrebbero essere gia' implementati Buffone, Mimo, R&G, Duellanti.

## Il ruolo: Il Cobra

### Specifica
- **Assegnazione**: Qualsiasi giocatore
- **Minimo giocatori**: 3 (nessun vincolo aggiuntivo)
- **Meccanica**: Quando il Cobra viene eliminato dal voto, sceglie un giocatore attivo da eliminare
- **Punti**: Nessuna modifica al punteggio base
- **Regola anti-catena**: Se il Cobra elimina un altro Cobra, il secondo NON attiva l'abilita'
- **Condizione di attivazione**: L'abilita' si attiva SOLO se dopo l'eliminazione del Cobra la partita non e' gia' finita
- **Avviso in-game**: A inizio turno, se il Cobra e' vivo e siamo all'ultimo turno possibile, mostrare avviso
- **Interazione con MW**: Se un MW viene eliminato dal Cobra, ha diritto al tentativo di indovinare
- **Interazione con R&G**: Se il Cobra elimina un R&G, il partner viene eliminato per legame
- **REGOLA FONDAMENTALE**: I ruoli speciali NON sono cumulabili

### Flusso di gioco modificato

Il Cobra introduce una nuova schermata `cobra_strike` nel flusso:

```
voto -> eliminazione -> [se MW: guess] -> [se Cobra E gioco non finito: cobra_strike] -> [se bersaglio MW: guess] -> [se bersaglio R&G: elimina partner] -> check win -> result o round
```

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi `'cobra'` al tipo `SpecialRole`
- Aggiungi `cobra?: boolean` a `specialRoles` in `GameConfig`
- Aggiungi `'cobra_strike'` al tipo `Screen`

#### 2. `src/utils/assignRoles.ts`
- Aggiungi blocco:
  ```
  if (config.specialRoles?.cobra) {
    const eligible = result.map((p, i) => ({ p, i })).filter(({ p }) => !p.specialRole)
    if (eligible.length > 0) {
      const chosen = shuffle(eligible)[0]
      result[chosen.i] = { ...result[chosen.i], specialRole: 'cobra' }
    }
  }
  ```

#### 3. `src/store/gameStore.ts`

**Aggiungi stato:**
- `cobraStrikeActive: boolean` (default false) - indica che il Cobra deve colpire
- Resetta in `startGame`, `resetGame`, `rematch`, `nextTurno`

**Modifica `confirmElimination()`:**
Dopo l'eliminazione (e dopo eventuale MW guess se il Cobra era MW), prima di controllare la win condition finale:

```
// Controlla se il Cobra deve colpire
const eliminated = updatedPlayers.find(p => p.id === eliminatedThisTurno.id)!
if (eliminated.specialRole === 'cobra') {
  // Controlla se il gioco non e' gia' finito
  const win = checkWinCondition(updatedPlayers, players.length)
  if (!win) {
    // Il Cobra puo' colpire!
    set({ cobraStrikeActive: true, screen: 'cobra_strike' })
    return
  }
}
// Procedi normalmente con win check...
```

**ATTENZIONE al caso Cobra + MW**: Se il Cobra e' anche un MW, il flusso e':
1. Cobra-MW viene eliminato
2. Va a `mrwhite_guess` (e' MW)
3. Dopo il guess (in `submitMrWhiteGuess` -> nella navigazione successiva), controlla se era anche Cobra
4. Se il gioco non e' finito dopo il guess -> vai a `cobra_strike`
5. Gestisci questo nel punto dove si naviga dopo il guess (probabilmente in `GuessScreen.tsx` -> `handleContinue`, o nel flusso dello store)

**Aggiungi azione `cobraStrike(targetId: string)`:**
```
cobraStrike: (targetId: string) => {
  const { players, turno, scores, mrWhiteCorrectIds } = get()
  
  // Elimina il bersaglio
  let updatedPlayers = players.map(p =>
    p.id === targetId ? { ...p, eliminated: true, eliminatedInTurno: turno } : p
  )
  
  // Se bersaglio ha R&G, elimina anche il partner (se implementato)
  const target = updatedPlayers.find(p => p.id === targetId)!
  if (target.specialRole === 'romeo' || target.specialRole === 'giulietta') {
    const partnerRole = target.specialRole === 'romeo' ? 'giulietta' : 'romeo'
    updatedPlayers = updatedPlayers.map(p =>
      p.specialRole === partnerRole && !p.eliminated 
        ? { ...p, eliminated: true, eliminatedInTurno: turno } 
        : p
    )
  }
  
  set({ players: updatedPlayers, cobraStrikeActive: false })
  
  // Se bersaglio e' MW -> va al tentativo di guess
  if (target.role === 'mrwhite') {
    set({ eliminatedThisTurno: target, screen: 'mrwhite_guess', mrWhiteGuessResult: null })
    return
  }
  
  // Check win condition
  const win = checkWinCondition(updatedPlayers, players.length)
  if (win) {
    const correctSet = new Set(mrWhiteCorrectIds)
    const { scores: newScores, roundScores } = calcFinalScores(updatedPlayers, win, correctSet, scores)
    set({ winner: win, scores: newScores, roundScores, screen: 'result' })
  } else {
    set({ screen: 'round', turno: turno + 1, currentVotes: {} })
  }
}
```

#### 4. `src/screens/CobraStrikeScreen.tsx` (NUOVO FILE)
Schermata per la scelta del bersaglio:

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import ConfirmDialog from '../components/ConfirmDialog'
import { AVATAR_COLORS } from '../constants/avatarColors'
import { springTap } from '../constants/animations'

export default function CobraStrikeScreen() {
  const players = useGameStore(s => s.players)
  const eliminatedThisTurno = useGameStore(s => s.eliminatedThisTurno)
  const cobraStrike = useGameStore(s => s.cobraStrike)
  
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  // Giocatori attivi (escluso il Cobra appena eliminato)
  const targets = players.filter(p => !p.eliminated)
  const selectedPlayer = selectedId ? players.find(p => p.id === selectedId) : null
  
  return (
    <div className="flex flex-col flex-1 min-h-0 px-5 py-6 gap-5 overflow-y-auto">
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl">🐍</span>
        <h2 className="text-2xl font-black text-lime-400">Il Cobra colpisce!</h2>
        <p className="text-slate-400 text-sm text-center">
          {eliminatedThisTurno?.name} puo' trascinare qualcuno con se'
        </p>
      </div>
      
      <div className="flex flex-col gap-2">
        {targets.map((player, i) => {
          const originalIndex = players.indexOf(player)
          return (
            <motion.button
              key={player.id}
              onClick={() => setSelectedId(player.id)}
              className="flex items-center gap-3 glass rounded-2xl px-4 py-3 hover:bg-lime-500/10 transition-colors border border-transparent hover:border-lime-400/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              {...springTap}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[originalIndex % AVATAR_COLORS.length]} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                {originalIndex + 1}
              </div>
              <span className="text-white font-medium">{player.name}</span>
            </motion.button>
          )
        })}
      </div>
      
      <ConfirmDialog
        open={selectedId !== null}
        title="Conferma eliminazione"
        description={`Vuoi eliminare ${selectedPlayer?.name}? Questa scelta e' definitiva.`}
        confirmLabel="Elimina"
        onConfirm={() => { if (selectedId) cobraStrike(selectedId) }}
        onCancel={() => setSelectedId(null)}
      />
    </div>
  )
}
```

#### 5. `src/App.tsx`
- Importa `CobraStrikeScreen`
- Aggiungi a `SCREENS`: `cobra_strike: CobraStrikeScreen`
- Aggiungi a `SCREEN_ORDER` dopo `'mrwhite_guess'`
- Aggiungi a `IN_GAME_SCREENS` e `INVALIDATE_SCREENS`

#### 6. `src/screens/SetupScreen.tsx`
- Stato: `const [cobraEnabled, setCobraEnabled] = useState(false)`
- Array roles overlay:
  ```
  {
    id: 'cobra',
    label: 'Il Cobra',
    emoji: '🐍',
    description: 'Se eliminato, trascina un altro giocatore con se\'.',
    bgBase: 'bg-lime-500/10',
    bgActive: 'bg-lime-500/25',
    borderBase: 'border-lime-400/20',
    borderActive: 'border-lime-400/50',
    toggleColor: 'bg-lime-500',
    enabled: cobraEnabled,
    minPlayers: 3,
  }
  ```
- `onToggle`: `if (id === 'cobra') setCobraEnabled(v => !v)`
- Badge: `bg-lime-500/20 border-lime-400/30 text-lime-400` con 🐍
- `handleStart`: `cobra: cobraEnabled` in `specialRoles`

#### 7. `src/components/PrivacyReveal.tsx`
- Per `specialRole === 'cobra'` (sia civile/infiltrato che MW):
  - Badge: `bg-lime-500/20 border-lime-400/30 text-lime-400` con "🐍 Il Cobra"
  - Testo: "Se vieni eliminato, potrai scegliere un giocatore da eliminare con te."

#### 8. `src/screens/RoundScreen.tsx`
- Aggiungi logica per l'avviso "ultimo turno":
  ```
  const cobraAlive = players.some(p => !p.eliminated && p.specialRole === 'cobra')
  const active = players.filter(p => !p.eliminated)
  const threshold = getSurvivalThreshold(players.length)
  const isLastTurn = active.length - 1 <= threshold
  ```
  - Se `cobraAlive && isLastTurn`, mostra banner:
    ```
    <div className="glass rounded-xl px-4 py-3 border border-lime-400/20">
      <p className="text-lime-400 text-sm font-semibold">🐍 Il Cobra non potra' colpire in questo turno</p>
      <p className="text-slate-400 text-xs mt-1">La prossima eliminazione concludera' la partita.</p>
    </div>
    ```
  - Importa `getSurvivalThreshold` da `../utils/winCondition`

#### 9. `src/screens/ResultScreen.tsx`
- Emoji: `{player.specialRole === 'cobra' && <span className="text-lime-400 text-xs">🐍</span>}`

### Stile UI
- Colore: **verde lime / velenoso** (`text-lime-400`, `bg-lime-500/20`, `border-lime-400/30`, toggle `bg-lime-500`)
- Emoji: 🐍

### Verifica
1. Attiva il Cobra -> verifica assegnazione
2. Elimina il Cobra -> verifica che appaia `CobraStrikeScreen`
3. Scegli un bersaglio -> verifica eliminazione e conferma dialog
4. Testa: Cobra eliminato quando il gioco finirebbe -> il Cobra NON colpisce (niente `cobra_strike`)
5. Testa: Cobra colpisce un MW -> il MW ha il tentativo di guess
6. Testa: Cobra colpisce un R&G -> partner eliminato per legame (se R&G implementato)
7. Testa: Cobra colpisce un altro Cobra -> il secondo NON attiva l'abilita'
8. Testa l'avviso "ultimo turno" nel RoundScreen
9. Testa: Cobra che e' anche MW -> prima guess, poi (se gioco non finito) cobra_strike
