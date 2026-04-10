# Implementa il ruolo: Romeo & Giulietta

## Contesto del gioco

Camaleonte e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

Ogni turno: tutti danno un indizio -> si vota -> il piu' votato viene eliminato -> si controlla la win condition.

**Win conditions** (`src/utils/winCondition.ts`):
- `'civilians'`: tutti gli impostori eliminati
- `'last_two'`: giocatori attivi <= soglia (2 per 3-5, 3 per 6-8, 4 per 9+) con almeno 1 impostore vivo

## Infrastruttura esistente (implementata col Buffone)

**Tipi** (`src/store/types.ts`):
- `SpecialRole` e' un union type (contiene almeno `'buffone'`, potrebbe contenere anche `'mimo'` se gia' implementato)
- `Player` ha campo `specialRole?: SpecialRole`
- `GameConfig.specialRoles` e' un oggetto con campi boolean opzionali

**Assegnazione** (`src/utils/assignRoles.ts`):
- I ruoli speciali vengono assegnati DOPO i ruoli base in blocchi sequenziali
- Pattern: `eligible = result.filter(p => !p.specialRole)`, poi shuffle e pick

**SetupScreen** (`src/screens/SetupScreen.tsx`):
- Usa stati locali per ogni ruolo (es. `buffoneEnabled`)
- Bottone "Ruoli Speciali" apre `SpecialRolesOverlay`
- L'overlay riceve un array `roles: SpecialRoleConfig[]` con la configurazione visiva di ogni ruolo
- Badge dei ruoli attivi sotto il bottone
- `handleStart` passa tutti i flag in `specialRoles: { buffone: ..., ... }`

**PrivacyReveal** (`src/components/PrivacyReveal.tsx`):
- Riceve `specialRole?: SpecialRole`
- Mostra badge + spiegazione sulla carta (posizione diversa per MW vs civile/infiltrato)

**Flusso eliminazione** (`src/store/gameStore.ts` -> `confirmElimination()`):
1. Segna il giocatore come `eliminated: true, eliminatedInTurno: turno`
2. Se e' MW -> va a `mrwhite_guess`
3. Altrimenti -> `checkWinCondition()` -> se vinta va a `result`, altrimenti `round` con turno+1

## Il ruolo: Romeo & Giulietta

### Specifica
- **Assegnazione**: Due giocatori casuali, qualsiasi ruolo (completamente random)
- **Minimo giocatori**: 6
- **Meccanica**: Se uno dei due viene eliminato, anche l'altro viene eliminato simultaneamente
- **Punti**: Nessuna modifica al punteggio base
- **Annuncio**: Al primo turno viene annunciato che R&G sono in gioco (ma NON chi sono)
- **MW e legame**: Se un MW viene eliminato PER LEGAME (non votato), NON ha diritto al tentativo di indovinare. Solo il MW eliminato direttamente dal voto puo' provare a indovinare
- **REGOLA FONDAMENTALE**: I ruoli speciali NON sono cumulabili. Ogni giocatore ha al massimo un `specialRole`

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi `'romeo' | 'giulietta'` al tipo `SpecialRole`
- Aggiungi `romeoGiulietta?: boolean` a `specialRoles` in `GameConfig`

#### 2. `src/utils/assignRoles.ts`
- Aggiungi un nuovo blocco DOPO quelli dei ruoli precedenti:
  ```
  if (config.specialRoles?.romeoGiulietta && names.length >= 6) {
    const eligible = result.map((p, i) => ({ p, i })).filter(({ p }) => !p.specialRole)
    if (eligible.length >= 2) {
      const chosen = shuffle(eligible).slice(0, 2)
      result[chosen[0].i] = { ...result[chosen[0].i], specialRole: 'romeo' }
      result[chosen[1].i] = { ...result[chosen[1].i], specialRole: 'giulietta' }
    }
  }
  ```

#### 3. `src/store/gameStore.ts` - funzione `confirmElimination`
Questa e' la modifica piu' critica. Dopo `set({ players: updatedPlayers })`:

1. Controlla se il giocatore eliminato ha `specialRole === 'romeo'` o `'giulietta'`
2. Se si', trova il partner (l'altro romeo/giulietta) tra i giocatori NON ancora eliminati
3. Se il partner esiste e non e' eliminato, eliminalo: `eliminated: true, eliminatedInTurno: turno`
4. **Se il giocatore votato e' un MW** -> procedi normalmente con `mrwhite_guess` (ha il diritto). Il partner verra' eliminato comunque, ma se il PARTNER e' MW eliminato per legame, NON va a `mrwhite_guess`
5. **Salva chi e' stato eliminato per legame** per mostrarlo nella EliminationScreen. Aggiungi un campo allo store: `linkedEliminatedThisTurno: Player | null`
6. Dopo le eliminazioni (inclusa quella per legame), controlla `checkWinCondition` con la lista completamente aggiornata

#### 4. `src/screens/SetupScreen.tsx`
- Aggiungi stato: `const [romeoGiuliettaEnabled, setRomeoGiuliettaEnabled] = useState(false)`
- Auto-disable se giocatori < 6 (useEffect, come il Buffone)
- Aggiungi all'array `roles` dell'overlay:
  ```
  {
    id: 'romeoGiulietta',
    label: 'Romeo & Giulietta',
    emoji: '💕',
    description: 'Due giocatori legati: se uno cade, cade anche l\'altro.',
    bgBase: 'bg-pink-500/10',
    bgActive: 'bg-pink-500/25',
    borderBase: 'border-pink-400/20',
    borderActive: 'border-pink-400/50',
    toggleColor: 'bg-pink-500',
    enabled: romeoGiuliettaEnabled,
    minPlayers: 6,
  }
  ```
- `onToggle`: `if (id === 'romeoGiulietta') setRomeoGiuliettaEnabled(v => !v)`
- Badge sotto il bottone:
  ```
  {romeoGiuliettaEnabled && validNames.length >= 6 && (
    <span className="inline-block rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-400 text-xs font-bold px-2.5 py-0.5">
      💕 R&G
    </span>
  )}
  ```
- In `handleStart`: aggiungi `romeoGiulietta: romeoGiuliettaEnabled && filtered.length >= 6` in `specialRoles`
- Aggiorna il conteggio ruoli attivi

#### 5. `src/components/PrivacyReveal.tsx`
- Per civile/infiltrato con `specialRole === 'romeo'`:
  ```
  <span className="... bg-pink-500/20 border-pink-400/30 text-pink-400 ...">💕 Romeo</span>
  <p>Il tuo destino e' legato a Giulietta. Se uno di voi viene eliminato, anche l'altro lo sara'.</p>
  ```
- Per `specialRole === 'giulietta'`: stesso badge ma "Giulietta" e testo invertito
- Per MW con romeo/giulietta: aggiungi il badge anche nella sezione MW (sotto "Bluffa!")
- **NON rivelare chi e' il partner!**

#### 6. `src/screens/RoundScreen.tsx`
- Al primo turno (`turno === 1`), se R&G sono attivi (almeno un giocatore ha `specialRole === 'romeo'` o `'giulietta'`), mostra un banner in cima:
  ```
  <div className="glass rounded-xl px-4 py-3 border border-pink-400/20">
    <p className="text-pink-400 text-sm font-semibold">💕 Romeo e Giulietta sono in gioco!</p>
    <p className="text-slate-400 text-xs mt-1">Due giocatori sono legati: se uno cade, cade anche l'altro.</p>
  </div>
  ```

#### 7. `src/screens/EliminationScreen.tsx`
- Leggi `linkedEliminatedThisTurno` dallo store
- Se esiste (eliminazione per legame), dopo la rivelazione del ruolo del giocatore votato, mostra un messaggio aggiuntivo con delay:
  ```
  "Il legame si spezza! Anche [nome partner] viene eliminato!"
  ```
  - Mostra il `RoleTag` del partner
  - Usa un'animazione con delay (es. `transition={{ delay: 0.5 }}`)
  - Stile pink

#### 8. `src/screens/ResultScreen.tsx`
- Aggiungi emoji R&G nei player chips:
  ```
  {(player.specialRole === 'romeo' || player.specialRole === 'giulietta') && (
    <span className="text-pink-400 text-xs">💕</span>
  )}
  ```

#### 9. `src/store/gameStore.ts` - stato e reset
- Aggiungi `linkedEliminatedThisTurno: Player | null` allo stato iniziale (null)
- Resettalo in `startGame`, `resetGame`, `rematch`, e `nextTurno`

### Stile UI
- Colore: **rosa/pink** (`text-pink-400`, `bg-pink-500/20`, `border-pink-400/30`, toggle `bg-pink-500`)
- Emoji: 💕

### Verifica
1. Attiva R&G con 6+ giocatori -> verifica che 2 giocatori ricevano romeo/giulietta
2. Verifica il banner al turno 1
3. Elimina Romeo -> verifica che anche Giulietta venga eliminata
4. Verifica il messaggio di eliminazione per legame nella EliminationScreen
5. Verifica che la doppia eliminazione triggeri correttamente la win condition
6. Testa: MW e' Giulietta, Romeo viene votato -> MW-Giulietta eliminata per legame, NO tentativo guess
7. Testa: MW e' Romeo e viene votato -> MW-Romeo HA il tentativo guess, Giulietta eliminata per legame
8. Con <6 giocatori il toggle non e' visibile
9. Se Buffone + R&G attivi, tutti su giocatori diversi
