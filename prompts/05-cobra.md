# Implementa il ruolo: Il Cobra

## Contesto del gioco

Undercover e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

Ogni turno: tutti danno un indizio -> si vota -> il piu' votato viene eliminato -> si controlla la win condition.

**Win conditions (da `src/utils/winCondition.ts`):**
- `'civilians'`: tutti gli impostori eliminati
- `'last_two'`: giocatori attivi <= soglia con almeno 1 impostore vivo
- Soglia: 2 (3-5 giocatori), 3 (6-8), 4 (9+)

**Flusso eliminazione attuale (da `src/store/gameStore.ts`):**
1. `castVote(votes)` -> determina eliminato -> va a schermata `elimination`
2. `confirmElimination()` -> segna `eliminated: true` -> se MW va a `mrwhite_guess`, altrimenti controlla win condition -> se vinta va a `result`, altrimenti `round` con turno+1

Il gioco supporta ruoli speciali facoltativi. Il tipo `SpecialRole` e il campo `specialRole?: SpecialRole` sul `Player` esistono gia'. Anche `specialRoles` in `GameConfig` esiste gia'.

**IMPORTANTE**: Potrebbero essere gia' implementati altri ruoli speciali (Buffone, Mimo, Romeo & Giulietta, Duellanti). Controlla lo stato attuale dei file prima di modificarli per non sovrascrivere implementazioni esistenti.

## Il ruolo: Il Cobra

### Specifica
- **Assegnazione**: Qualsiasi giocatore
- **Minimo giocatori**: nessun vincolo aggiuntivo
- **Meccanica**: Quando il Cobra viene eliminato dal voto, sceglie un giocatore attivo da eliminare immediatamente
- **Punti**: Nessuna modifica al punteggio base
- **Regola anti-catena**: Se il Cobra elimina un altro Cobra, il secondo NON attiva la propria abilita'
- **Condizione di attivazione**: L'abilita' si attiva SOLO se dopo l'eliminazione del Cobra la partita non e' gia' finita. Se l'eliminazione del Cobra fa scattare la win condition, il Cobra NON puo' colpire
- **Avviso in-game**: A inizio turno, se il Cobra e' vivo e il turno corrente e' l'ultimo possibile (cioe' la prossima eliminazione concluderebbe la partita), mostrare un avviso
- **Interazione con MW**: Se un MW viene eliminato dal Cobra, ha comunque diritto al tentativo di indovinare la parola
- **Interazione con Romeo & Giulietta**: Se il Cobra elimina un Romeo/Giulietta, si attiva il legame e anche l'altro viene eliminato

### Flusso di gioco modificato

Il Cobra introduce un nuovo step nel flusso di eliminazione:

```
voto -> eliminazione -> [se MW: guess] -> [se Cobra E gioco non finito: scelta bersaglio Cobra] -> [se bersaglio e' MW: guess MW] -> [se bersaglio e' R&G: elimina partner] -> check win condition -> result o round
```

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi `'cobra'` al tipo `SpecialRole`
- Aggiungi `cobra?: boolean` a `specialRoles` in `GameConfig`
- Aggiungi una nuova Screen: `'cobra_strike'` al tipo `Screen`

#### 2. `src/utils/assignRoles.ts`
- Dopo l'assegnazione dei ruoli base, se `config.specialRoles?.cobra` e' attivo:
  - Scegli un giocatore a caso (preferibilmente senza altri ruoli speciali)
  - Assegna `specialRole: 'cobra'`

#### 3. `src/store/gameStore.ts`

**Modifica `confirmElimination()`:**
Dopo l'eliminazione normale e dopo l'eventuale MW guess, prima di controllare la win condition:

1. Controlla se il giocatore appena eliminato ha `specialRole === 'cobra'`
2. Controlla se il gioco NON e' gia' finito (la win condition con i giocatori aggiornati restituisce `null`)
3. Se entrambe le condizioni sono vere:
   - Salva lo stato del Cobra (es. `cobraStrikeActive: true` nello store)
   - Vai alla schermata `cobra_strike` invece di proseguire
4. Se il gioco e' gia' finito, il Cobra non colpisce

**Aggiungi azione `cobraStrike(targetId: string)`:**
1. Trova il giocatore bersaglio e segnalo come `eliminated: true`, `eliminatedInTurno: turno`
2. **Anti-catena**: Se il bersaglio ha `specialRole === 'cobra'`, NON attivare la sua abilita'
3. Se il bersaglio e' un MW, salva che deve fare il tentativo di guess -> vai a `mrwhite_guess`
4. Se il bersaglio ha `specialRole === 'romeo'` o `'giulietta'`, elimina anche il partner (il partner MW per legame NON ha diritto al guess, come specificato nel ruolo R&G)
5. Controlla la win condition e procedi di conseguenza

**IMPORTANTE sul flusso MW + Cobra:**
Il flusso complesso e':
- Cobra (che e' MW) viene eliminato -> prima fa il MW guess -> poi se il gioco non e' finito -> Cobra strike
- Cobra colpisce un MW -> quel MW fa il guess
- Gestisci entrambi i casi

**Aggiungi logica per l'avviso "ultimo turno":**
- Aggiungi una funzione helper `isLastTurn(players, totalPlayers)` che controlla: se si elimina un qualsiasi giocatore attivo, la win condition scatterebbe per tutti i possibili eliminati?
- In pratica: `attivi - 1 <= soglia` (per il caso last_two) OPPURE eliminando qualsiasi impostore rimasto tutti gli impostori sarebbero eliminati (per il caso civilians, ma questo dipende da chi viene eliminato)
- Approccio semplificato: mostra l'avviso se `attivi - 1 <= soglia` (cioe' siamo a soglia+1 giocatori attivi). Non serve coprire il caso "ultimo impostore" perche' in quel caso i civili vincono e il Cobra-impostore non avrebbe comunque interesse a colpire

#### 4. `src/screens/CobraStrikeScreen.tsx` (NUOVO FILE)
Crea una nuova schermata per la scelta del bersaglio del Cobra:

- Header: "Il Cobra colpisce!" con un'icona serpente (emoji cobra: nope, non esiste. Usa l'emoji serpente unicode)
- Sottotitolo: "[Nome Cobra] e' stato eliminato ma puo' trascinare qualcuno con se'!"
- Mostra la lista dei giocatori attivi (escluso il Cobra stesso, gia' eliminato) come bottoni cliccabili
- Ogni bottone mostra il nome del giocatore
- Al click, chiedi conferma con un dialog: "Vuoi eliminare [nome]? Questa scelta e' definitiva."
- Alla conferma, chiama `cobraStrike(targetId)`
- Stile: usa tema scuro con accenti verdi (verde veleno/tossico: `text-lime-400`, `bg-lime-500/20`) per dare un feeling "velenoso"
- Animazioni: i giocatori appaiono con stagger animation

#### 5. `src/App.tsx`
- Importa `CobraStrikeScreen`
- Aggiungilo alla mappa `SCREENS` con chiave `'cobra_strike'`
- Aggiungilo a `SCREEN_ORDER` dopo `'mrwhite_guess'`
- Aggiungilo a `IN_GAME_SCREENS` e `INVALIDATE_SCREENS`

#### 6. `src/screens/SetupScreen.tsx`
- Aggiungi un toggle per "Il Cobra" nella sezione "Ruoli Speciali"
- Descrizione: "Se eliminato, trascina un altro giocatore con se'"

#### 7. `src/screens/DealScreen.tsx` / `src/components/PrivacyReveal.tsx`
- Se il giocatore ha `specialRole === 'cobra'`, mostra sulla carta:
  - "Sei il Cobra! Se vieni eliminato, potrai scegliere un giocatore da eliminare con te."
  - Usa il tema verde velenoso

#### 8. `src/screens/RoundScreen.tsx`
- Se il Cobra e' vivo E siamo all'ultimo turno possibile (usa la funzione helper), mostra un banner di avviso:
  - "Il Cobra non potra' colpire in questo turno" con icona serpente
  - Stile: glass box con bordo lime/verde

#### 9. `src/screens/ResultScreen.tsx`
- Mostra il tag "Cobra" accanto al nome del giocatore
- Se il Cobra ha colpito qualcuno, mostra chi ha colpito (es. "ha colpito [nome]!")

### Stile UI
- Per il Cobra usa **verde lime/velenoso** (`text-lime-400`, `bg-lime-500/20`, `border-lime-400/30`)
- La schermata CobraStrike deve avere un'atmosfera "pericolosa": sfondo piu' scuro, accenti verdi
- Mantieni lo stile glass morphism

### Verifica
1. Attiva il Cobra nella SetupScreen
2. Elimina il Cobra -> verifica che appaia la schermata di scelta bersaglio
3. Scegli un bersaglio -> verifica che venga eliminato
4. Testa: Cobra eliminato quando il gioco finirebbe (ultimo impostore o soglia raggiunta) -> il Cobra NON deve colpire
5. Testa: Cobra colpisce un MW -> il MW deve avere il tentativo di guess
6. Testa: Cobra colpisce un Romeo/Giulietta -> il partner viene eliminato per legame
7. Testa: Cobra colpisce un altro Cobra -> il secondo Cobra NON attiva l'abilita'
8. Testa l'avviso "ultimo turno" nel RoundScreen
9. Testa: Cobra che e' anche MW -> prima fa il guess, poi (se gioco non finito) colpisce
