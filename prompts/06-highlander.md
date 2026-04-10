# Implementa il ruolo: Highlander

## Contesto del gioco

Camaleonte e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

**Flusso votazione** (`src/screens/VoteScreen.tsx`):
- `active = players.filter(p => !p.eliminated)` - solo giocatori attivi
- `voterCount = active.length` - numero di voti totali necessari
- Componente `VoteGrid` mostra i giocatori come bersagli votabili
- Pareggio: ri-voto tra i pareggiati -> se ancora pari: sorteggio casuale
- I voti vengono tracciati in `votes: Record<string, number>` e `voteHistory: string[]`

## Infrastruttura esistente

**Tipi** (`src/store/types.ts`):
- `SpecialRole` union type, `Player.specialRole?: SpecialRole`
- `GameConfig.specialRoles` oggetto con boolean opzionali

**Assegnazione** (`src/utils/assignRoles.ts`):
- Pattern: `eligible = result.filter(p => !p.specialRole)` -> shuffle -> pick

**SetupScreen**: overlay generico `SpecialRolesOverlay`, stati locali per toggle, badge sotto bottone

**PrivacyReveal**: prop `specialRole`, badge + spiegazione sulla carta

**IMPORTANTE**: Controlla lo stato attuale dei file prima di modificarli. Potrebbero essere gia' implementati altri ruoli speciali.

## Il ruolo: Highlander

### Specifica
- **Assegnazione**: Qualsiasi giocatore
- **Minimo giocatori**: 3 (nessun vincolo aggiuntivo)
- **Meccanica**: Puo' continuare a votare anche dopo essere stato eliminato (1 voto pieno)
- **Punti**: Nessuna modifica al punteggio base
- **L'Highlander eliminato NON partecipa al round degli indizi** (non da' parole)
- **L'Highlander eliminato NON puo' essere votato** (gia' eliminato, non compare tra i bersagli)
- **L'Highlander vota anche durante i ri-voti** (in caso di pareggio)
- **REGOLA FONDAMENTALE**: I ruoli speciali NON sono cumulabili

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi `'highlander'` al tipo `SpecialRole`
- Aggiungi `highlander?: boolean` a `specialRoles` in `GameConfig`

#### 2. `src/utils/assignRoles.ts`
- Aggiungi blocco:
  ```
  if (config.specialRoles?.highlander) {
    const eligible = result.map((p, i) => ({ p, i })).filter(({ p }) => !p.specialRole)
    if (eligible.length > 0) {
      const chosen = shuffle(eligible)[0]
      result[chosen.i] = { ...result[chosen.i], specialRole: 'highlander' }
    }
  }
  ```

#### 3. `src/screens/VoteScreen.tsx`
Questa e' la modifica principale. I bersagli restano solo i giocatori attivi, ma il conteggio votanti cambia:

**Calcolo votanti:**
```typescript
const active = players.filter(p => !p.eliminated)
const highlander = players.find(p => p.eliminated && p.specialRole === 'highlander')
const voterCount = active.length + (highlander ? 1 : 0)
```

**Nessuna modifica a VoteGrid**: i bersagli votabili restano `active` (o `tiePlayers` in caso di ri-voto). L'Highlander vota come un giocatore normale - l'unica differenza e' che il `voterCount` include un voto extra.

**Il voterCount corretto deve valere anche durante i ri-voti**: quando c'e' un pareggio e si ri-vota tra i pareggiati, il `voterCount` rimane lo stesso (include l'Highlander). Il codice attuale usa `voterCount` ovunque per il progress e la validazione "tutti hanno votato", quindi basta aggiornare il calcolo iniziale.

**Banner indicativo** (se Highlander eliminato e presente):
Sopra la griglia di voto, mostra:
```
{highlander && (
  <div className="glass rounded-xl px-4 py-2 border border-cyan-400/20">
    <p className="text-cyan-400 text-sm font-semibold">
      ⚔️ {highlander.name} vota dall'aldila'!
    </p>
  </div>
)}
```

#### 4. `src/screens/SetupScreen.tsx`
- Stato: `const [highlanderEnabled, setHighlanderEnabled] = useState(false)`
- Array roles overlay:
  ```
  {
    id: 'highlander',
    label: 'Highlander',
    emoji: '⚔️',
    description: 'Puo\' continuare a votare anche dopo essere stato eliminato.',
    bgBase: 'bg-cyan-500/10',
    bgActive: 'bg-cyan-500/25',
    borderBase: 'border-cyan-400/20',
    borderActive: 'border-cyan-400/50',
    toggleColor: 'bg-cyan-500',
    enabled: highlanderEnabled,
    minPlayers: 3,
  }
  ```
- `onToggle`: `if (id === 'highlander') setHighlanderEnabled(v => !v)`
- Badge: `bg-cyan-500/20 border-cyan-400/30 text-cyan-400` con ⚔️
- `handleStart`: `highlander: highlanderEnabled` in `specialRoles`

#### 5. `src/components/PrivacyReveal.tsx`
- Per `specialRole === 'highlander'` (sia civile/infiltrato che MW):
  - Badge: `bg-cyan-500/20 border-cyan-400/30 text-cyan-400` con "⚔️ Highlander"
  - Testo: "Anche se verrai eliminato, potrai continuare a votare!"

#### 6. `src/screens/RoundScreen.tsx`
- Nella sezione "Eliminati", se un giocatore eliminato ha `specialRole === 'highlander'`, mostralo in modo diverso dagli altri:
  - Non barrare il nome (o barralo ma con un badge "vota ancora")
  - Usa colore `text-cyan-400` anziche' `text-slate-500`
  - Es:
    ```
    <span className={`flex items-center gap-1 text-sm ${
      player.specialRole === 'highlander' ? 'text-cyan-400' : 'text-slate-500'
    }`}>
      {player.specialRole !== 'highlander' && <span className="text-xs">✕</span>}
      <span className={player.specialRole === 'highlander' ? '' : 'line-through'}>{player.name}</span>
      {player.specialRole === 'highlander' && <span className="text-[10px] text-cyan-400/70">vota ancora</span>}
    </span>
    ```

#### 7. `src/screens/EliminationScreen.tsx`
- Quando l'Highlander viene eliminato, mostra un messaggio aggiuntivo:
  ```
  {eliminatedThisTurno.specialRole === 'highlander' && (
    <motion.div className="glass rounded-2xl px-6 py-4 text-center max-w-xs relative z-10"
      style={{ borderColor: 'rgba(34, 211, 238, 0.2)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <p className="text-cyan-400 font-semibold">Ma l'Highlander non muore mai!</p>
      <p className="text-slate-400 text-sm mt-1">Potra' ancora votare nei prossimi turni.</p>
    </motion.div>
  )}
  ```

#### 8. `src/screens/ResultScreen.tsx`
- Emoji: `{player.specialRole === 'highlander' && <span className="text-cyan-400 text-xs">⚔️</span>}`

### Stile UI
- Colore: **ciano/cyan** (`text-cyan-400`, `bg-cyan-500/20`, `border-cyan-400/30`, toggle `bg-cyan-500`)
- Emoji: ⚔️

### Verifica
1. Attiva l'Highlander -> verifica assegnazione
2. Verifica badge sulla carta nella DealScreen
3. Elimina l'Highlander -> verifica messaggio speciale nella EliminationScreen
4. Nel turno successivo, verifica che `voterCount` nel VoteScreen includa l'Highlander (+1)
5. Verifica che l'Highlander NON compaia tra i bersagli votabili
6. Verifica il banner "vota dall'aldila'"
7. Testa un pareggio: il voterCount resta corretto anche nel ri-voto
8. Nella RoundScreen, verifica che l'Highlander eliminato abbia indicatore speciale (non barrato, "vota ancora")
9. Nella ResultScreen, emoji visibile
