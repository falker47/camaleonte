# Implementa il ruolo: I Duellanti

## Contesto del gioco

Undercover e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

Ogni turno: tutti danno un indizio -> si vota -> il piu' votato viene eliminato -> si controlla la win condition.

**Punteggio attuale:**
- Civili vincono: civili +2 pts ciascuno (0 se MW indovina)
- MW indovina: +3/4 pts | MW sopravvive: +3/5 pts
- Infiltrato sopravvive: +3/5 pts | Infiltrato eliminato: +1 pt per civile eliminato (max 3)

Il gioco supporta ruoli speciali facoltativi. Il tipo `SpecialRole` e il campo `specialRole?: SpecialRole` sul `Player` esistono gia'. Anche `specialRoles` in `GameConfig` esiste gia'.

## Il ruolo: I Duellanti

### Specifica
- **Assegnazione**: Due giocatori qualsiasi (possono essere civili, infiltrati, MW, qualsiasi combinazione)
- **Minimo giocatori**: nessun vincolo aggiuntivo
- **Meccanica**: I due duellanti sono nemici. **Entrambi sanno chi e' il proprio nemico** (vedono il nome sulla carta), ma NON sanno il ruolo dell'altro. Il primo dei due a essere eliminato perde **2 punti** e li da' al nemico sopravvissuto
- **Punti**: Trasferimento di 2 punti a fine partita. **Punteggi negativi CONSENTITI** (il giocatore puo' andare sotto zero)
- **Se entrambi eliminati nello stesso turno** (es. via Romeo & Giulietta): nessun trasferimento, il duello finisce in pareggio
- **Il trasferimento si applica a fine partita**, sommato ai punti normali del round

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi `'duellante'` al tipo `SpecialRole`
- Aggiungi `duellanti?: boolean` a `specialRoles` in `GameConfig`

#### 2. `src/utils/assignRoles.ts`
- Dopo l'assegnazione dei ruoli base, se `config.specialRoles?.duellanti` e' attivo:
  - Scegli due giocatori a caso (preferibilmente senza altri ruoli speciali, ma se non possibile va bene sovrascrivere)
  - Assegna `specialRole: 'duellante'` a entrambi
  - Per far sapere a ciascun duellante chi e' il nemico, salva l'id del nemico nel Player. Aggiungi un campo opzionale `duelOpponentId?: string` all'interfaccia `Player`

#### 3. `src/store/gameStore.ts` - funzione `calcFinalScores`
- Dopo il calcolo dei punti normali, cerca i duellanti:
  1. Trova i due giocatori con `specialRole === 'duellante'`
  2. Se uno e' eliminato e l'altro no: il primo perde 2 pts, il secondo guadagna +2 pts
  3. Se entrambi eliminati: confronta `eliminatedInTurno` - chi e' stato eliminato PRIMA perde 2 pts e l'altro guadagna +2
  4. Se entrambi eliminati nello stesso turno (`eliminatedInTurno` uguale): nessun trasferimento
  5. Se entrambi vivi a fine partita: nessun trasferimento (il duello non si e' risolto)
  6. I punti negativi sono consentiti: se un giocatore ha 0 pts e perde 2, va a -2

#### 4. `src/screens/SetupScreen.tsx`
- Aggiungi un toggle per "I Duellanti" nella sezione "Ruoli Speciali"
- Descrizione: "Due nemici: il primo eliminato perde 2 punti e li da' all'altro"
- Passa il valore al `config`

#### 5. `src/screens/DealScreen.tsx` / `src/components/PrivacyReveal.tsx`
- Se il giocatore ha `specialRole === 'duellante'`, mostra sulla carta:
  - "Sei un Duellante! Il tuo nemico e': **[nome nemico]**"
  - "Se vieni eliminato prima del tuo nemico, perdi 2 punti e li dai a lui!"
  - Trova il nome del nemico usando `duelOpponentId` e la lista `players`

#### 6. `src/screens/ResultScreen.tsx`
- Nella sezione "Ruoli e punti partita":
  - Se un duellante ha perso il duello, mostra un tag tipo "duello perso -2" in rosso
  - Se un duellante ha vinto il duello, mostra un tag tipo "duello vinto +2" in verde
  - Se pareggio (stesso turno o entrambi vivi), mostra "duello pari" in grigio
- Nella leaderboard generale, i punti negativi devono essere mostrati (es. "-2 pt" in rosso)
- Nella legenda punti, aggiungi la spiegazione dei Duellanti se il ruolo era attivo
- **IMPORTANTE**: Il componente `AnimatedCounter` e `AnimatedScore` devono gestire numeri negativi. Verifica che funzionino con valori < 0

#### 7. Gestione punti negativi nella leaderboard
- La leaderboard in `ResultScreen.tsx` ordina per punteggio decrescente. Assicurati che i punteggi negativi siano mostrati correttamente (es. "-2 pt" con colore rosso)
- Nella logica di `AnimatedCounter`: se il valore e' negativo, mostra il segno meno anziche' il "+"

### Stile UI
- Per i Duellanti usa **marrone chiaro / stile Far West** (`text-amber-600`, `bg-amber-800/20`, `border-amber-700/30`) — un tono caldo e sabbioso che evoca il duello western
- Il tag del nemico sulla carta puo' avere un bordo amber-700 per evidenziare la rivalita'
- Il tag "duello perso" usa `text-rose-400`, "duello vinto" usa `text-emerald-400`

### Verifica
1. Attiva i Duellanti nella SetupScreen
2. Verifica che esattamente 2 giocatori ricevano `specialRole: 'duellante'`
3. Nella DealScreen, verifica che ogni duellante veda il nome del nemico
4. Elimina un duellante -> a fine partita verifica: -2 al perdente, +2 al vincitore
5. Elimina entrambi nello stesso turno -> verifica che non ci sia trasferimento
6. Testa un caso dove il perdente va in negativo (es. civile duellante eliminato per primo, civili perdono -> 0 - 2 = -2)
7. Verifica che la leaderboard mostri correttamente i punteggi negativi
