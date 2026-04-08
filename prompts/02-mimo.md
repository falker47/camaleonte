# Implementa il ruolo: Il Mimo

## Contesto del gioco

Undercover e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

Ogni turno: tutti danno un indizio -> si vota -> il piu' votato viene eliminato -> si controlla la win condition.

Il gioco supporta ruoli speciali facoltativi. Il tipo `SpecialRole` e il campo `specialRole?: SpecialRole` sul `Player` esistono gia' (aggiunti col Buffone). Anche `specialRoles` in `GameConfig` esiste gia'.

## Il ruolo: Il Mimo

### Specifica
- **Assegnazione**: Qualsiasi giocatore (civile, infiltrato, o Mr. White)
- **Minimo giocatori**: nessun vincolo aggiuntivo
- **Meccanica**: Il Mimo deve mimare gli indizi anziche' parlare. Non e' un effetto meccanico nel codice, e' una regola sociale. L'app deve solo:
  1. Mostrare chiaramente chi e' il Mimo durante la distribuzione carte
  2. Ricordare a tutti durante il round che quel giocatore deve mimare
- **Punti**: Nessuna modifica al punteggio
- **Regole di mimo valido** (da mostrare): no lettere disegnate nell'aria, no labiale, no scrittura. Solo gesti e mimica corporea

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi `'mimo'` al tipo `SpecialRole` (union type gia' esistente)
- Aggiungi `mimo?: boolean` a `specialRoles` in `GameConfig`

#### 2. `src/utils/assignRoles.ts`
- Dopo l'assegnazione dei ruoli base, se `config.specialRoles?.mimo` e' attivo:
  - Scegli un giocatore qualsiasi a caso e assegnagli `specialRole: 'mimo'`
  - Se il giocatore ha gia' un altro `specialRole` (es. Buffone), scegli un altro giocatore che non ha ruoli speciali

#### 3. `src/screens/SetupScreen.tsx`
- Aggiungi un toggle per "Il Mimo" nella sezione "Ruoli Speciali" (sotto il Buffone se esiste gia')
- Descrizione: "Un giocatore deve mimare gli indizi anziche' parlare"
- Nessun vincolo di giocatori minimi
- Passa il valore al `config`

#### 4. `src/screens/DealScreen.tsx` / `src/components/PrivacyReveal.tsx`
- Se il giocatore ha `specialRole === 'mimo'`, mostra un'indicazione sulla carta
- Mostra le regole: "Devi mimare i tuoi indizi! No parole, no labiale, no lettere nell'aria. Solo gesti!"
- ATTENZIONE: Per l'infiltrato-mimo e il civile-mimo l'UI della carta deve rimanere identica (stessi colori indigo), aggiungere solo il tag Mimo sotto la parola. Per MW-mimo, aggiungere il tag sulla carta bianca

#### 5. `src/screens/RoundScreen.tsx`
- Nella lista dei giocatori attivi, se un giocatore ha `specialRole === 'mimo'`, mostra un indicatore visivo accanto al suo nome (es. un'icona o un tag colorato "MIMO")
- Questo serve come promemoria per tutti: quel giocatore deve mimare, non parlare
- Suggerimento: usa un piccolo badge/tag accanto al nome, tipo `<span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Mimo</span>`

#### 6. `src/screens/ResultScreen.tsx`
- Nella lista giocatori, mostra il tag "Mimo" accanto al nome del giocatore che aveva quel ruolo (per ricordare chi era)

### Stile UI
- Per il Mimo usa **nero/bianco** (`text-slate-200`, `bg-slate-700/30`, `border-slate-400/30`) — un look sobrio e neutro che evoca il silenzio del mimo
- Mantieni lo stile glass morphism esistente
- Usa le animazioni esistenti

### Verifica
1. Attiva il Mimo nella SetupScreen
2. Verifica che esattamente un giocatore riceva il tag "Mimo" nella DealScreen
3. Verifica che nella RoundScreen il giocatore Mimo abbia un indicatore visivo
4. Verifica che il Mimo possa essere un civile, un infiltrato, o un Mr. White
5. Se sia Buffone che Mimo sono attivi, verifica che vengano assegnati a giocatori diversi
6. Verifica che nella ResultScreen il tag Mimo sia visibile
