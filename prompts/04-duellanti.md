# Implementa il ruolo: I Duellanti

## Contesto del gioco

Undercover e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

**Punteggio attuale** (`src/store/gameStore.ts` -> `calcFinalScores`):
- Civili vincono: +2 pts ciascuno (0 se MW indovina)
- MW indovina: +3/4 pts | MW sopravvive: +3/5 pts
- Infiltrato sopravvive: +3/5 pts | eliminato: +1 pt per civile eliminato (max 3)
- Buffone eliminato al T1: +2 pts bonus (sempre)

## Infrastruttura esistente

**Tipi** (`src/store/types.ts`):
- `SpecialRole` e' un union type (contiene ruoli gia' implementati)
- `Player` ha `specialRole?: SpecialRole`
- `GameConfig.specialRoles` ha campi boolean opzionali per ogni ruolo

**Assegnazione** (`src/utils/assignRoles.ts`):
- Pattern: `eligible = result.filter(p => !p.specialRole)` -> shuffle -> pick

**SetupScreen** (`src/screens/SetupScreen.tsx`):
- Stato locale per ogni ruolo (es. `buffoneEnabled`)
- `SpecialRolesOverlay` riceve array `roles: SpecialRoleConfig[]` con config visiva
- Badge attivi sotto il bottone "Ruoli Speciali"
- `handleStart` passa tutti i flag in `specialRoles: { ... }`

**PrivacyReveal** (`src/components/PrivacyReveal.tsx`):
- Riceve `specialRole?: SpecialRole`
- Badge + spiegazione sotto la parola (civile/infiltrato) o sotto "Bluffa!" (MW)

**ResultScreen** (`src/screens/ResultScreen.tsx`):
- Emoji del ruolo speciale nei player chips
- Badge bonus se attivato
- Legenda punti collassabile

## Il ruolo: I Duellanti

### Specifica
- **Assegnazione**: Qualsiasi due giocatori (entrambi conoscono chi e' il nemico)
- **Minimo giocatori**: 3 (nessun vincolo aggiuntivo)
- **Meccanica**: Il primo dei due a essere eliminato perde **2 punti** e li da' al nemico
- **Punti**: Trasferimento di 2 punti. **Punteggi negativi CONSENTITI**
- **Se entrambi eliminati stesso turno**: nessun trasferimento (pareggio)
- **REGOLA FONDAMENTALE**: I ruoli speciali NON sono cumulabili

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi `'duellante'` al tipo `SpecialRole`
- Aggiungi `duellanti?: boolean` a `specialRoles` in `GameConfig`
- Aggiungi campo opzionale `duelOpponentId?: string` all'interfaccia `Player` (per sapere chi e' il nemico)

#### 2. `src/utils/assignRoles.ts`
- Aggiungi un nuovo blocco DOPO i ruoli precedenti:
  ```
  if (config.specialRoles?.duellanti) {
    const eligible = result.map((p, i) => ({ p, i })).filter(({ p }) => !p.specialRole)
    if (eligible.length >= 2) {
      const chosen = shuffle(eligible).slice(0, 2)
      result[chosen[0].i] = { ...result[chosen[0].i], specialRole: 'duellante', duelOpponentId: result[chosen[1].i].id }
      result[chosen[1].i] = { ...result[chosen[1].i], specialRole: 'duellante', duelOpponentId: result[chosen[0].i].id }
    }
  }
  ```

#### 3. `src/store/gameStore.ts` - funzione `calcFinalScores`
- Dopo il calcolo dei punti normali e il bonus Buffone, gestisci i Duellanti:
  ```
  // Duellanti: trasferimento punti
  const duellanti = players.filter(p => p.specialRole === 'duellante')
  if (duellanti.length === 2) {
    const [a, b] = duellanti
    let loser: Player | null = null
    let winnerId: string | null = null
    
    if (a.eliminated && !b.eliminated) {
      loser = a; winnerId = b.id
    } else if (b.eliminated && !a.eliminated) {
      loser = b; winnerId = a.id
    } else if (a.eliminated && b.eliminated && a.eliminatedInTurno !== b.eliminatedInTurno) {
      // Entrambi eliminati in turni diversi: chi e' stato eliminato prima perde
      loser = (a.eliminatedInTurno! < b.eliminatedInTurno!) ? a : b
      winnerId = loser === a ? b.id : a.id
    }
    // Se entrambi vivi o eliminati nello stesso turno: nessun trasferimento
    
    if (loser && winnerId) {
      roundScores[loser.name] = (roundScores[loser.name] ?? 0) - 2
      scores[loser.name] = (scores[loser.name] ?? 0) - 2
      const winnerName = players.find(p => p.id === winnerId)!.name
      roundScores[winnerName] = (roundScores[winnerName] ?? 0) + 2
      scores[winnerName] = (scores[winnerName] ?? 0) + 2
    }
  }
  ```

#### 4. `src/screens/SetupScreen.tsx`
- Aggiungi stato: `const [duellantiEnabled, setDuellantiEnabled] = useState(false)`
- Aggiungi all'array `roles` dell'overlay:
  ```
  {
    id: 'duellanti',
    label: 'I Duellanti',
    emoji: '⚔️',
    description: 'Due nemici: il primo eliminato perde 2 punti e li da\' all\'altro.',
    bgBase: 'bg-amber-800/10',
    bgActive: 'bg-amber-800/25',
    borderBase: 'border-amber-700/20',
    borderActive: 'border-amber-700/50',
    toggleColor: 'bg-amber-700',
    enabled: duellantiEnabled,
    minPlayers: 3,
  }
  ```
- `onToggle`: `if (id === 'duellanti') setDuellantiEnabled(v => !v)`
- Badge: `bg-amber-800/20 border-amber-700/30 text-amber-600` con emoji ⚔️
- In `handleStart`: `duellanti: duellantiEnabled` in `specialRoles`
- Aggiorna conteggio ruoli attivi

#### 5. `src/components/PrivacyReveal.tsx`
- Per i Duellanti, serve mostrare il nome del nemico. Il componente riceve gia' `specialRole` ma non ha accesso alla lista giocatori. Aggiungi una prop opzionale `specialRoleExtra?: string` per passare info aggiuntive (come il nome del nemico)
- In `DealScreen.tsx`, calcola il nome del nemico e passalo:
  ```
  const duelOpponentName = current.specialRole === 'duellante' && current.duelOpponentId
    ? players.find(p => p.id === current.duelOpponentId)?.name ?? null
    : null
  // ...
  <PrivacyReveal specialRoleExtra={duelOpponentName ?? undefined} ... />
  ```
- In `PrivacyReveal`, per `specialRole === 'duellante'`:
  - Badge: `bg-amber-800/20 border-amber-700/30 text-amber-600` con "⚔️ Duellante"
  - Testo: "Il tuo nemico e': **[specialRoleExtra]**. Se vieni eliminato prima di lui, perdi 2 punti!"
  - Mostra anche su carta MW

#### 6. `src/screens/ResultScreen.tsx`
- Emoji nei player chips: `{player.specialRole === 'duellante' && <span className="text-amber-600 text-xs">⚔️</span>}`
- Badge risultato duello:
  - Se il duellante ha perso (roundScores negativo dal duello): `<span className="text-rose-400 text-[10px]">duello perso</span>`
  - Se ha vinto: `<span className="text-emerald-400 text-[10px]">duello vinto</span>`
  - Se pareggio: `<span className="text-slate-500 text-[10px]">duello pari</span>`
  - Per determinarlo: confronta i due duellanti e chi ha subito il -2
- **IMPORTANTE: Gestione punteggi negativi**:
  - `AnimatedCounter`: se il valore e' negativo, mostra il segno meno. Attualmente mostra `+{value}` per positivi e `0` per zero. Aggiungi: se `value < 0`, mostra `{value}` (il segno meno e' incluso nel numero)
  - `AnimatedScore`: deve gestire valori negativi nella leaderboard (es. "-2 pt" in rosso)
  - Nella leaderboard, i punteggi negativi devono avere colore `text-rose-400`
- Legenda punti: aggiungi spiegazione Duellanti se attivi

#### 7. Nessuna modifica al flusso di eliminazione
I Duellanti non modificano il flusso di gioco - il trasferimento punti avviene solo in `calcFinalScores`.

### Stile UI
- Colore: **marrone chiaro / Far West** (`text-amber-600`, `bg-amber-800/20`, `border-amber-700/30`, toggle `bg-amber-700`)
- Emoji: ⚔️

### Verifica
1. Attiva i Duellanti -> verifica che 2 giocatori ricevano il ruolo
2. Nella DealScreen, verifica che ogni duellante veda il nome del nemico
3. Elimina un duellante -> a fine partita: -2 al perdente, +2 al vincitore
4. Elimina entrambi stesso turno -> nessun trasferimento
5. Testa punteggio negativo: civile duellante eliminato per primo, civili perdono -> 0 - 2 = -2
6. Verifica che la leaderboard mostri correttamente i negativi
7. Verifica che `AnimatedCounter` mostri valori negativi senza "+"
