# Implementa il ruolo: Highlander

## Contesto del gioco

Undercover e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

Ogni turno: tutti danno un indizio -> si vota -> il piu' votato viene eliminato -> si controlla la win condition.

**Flusso votazione attuale (da `src/screens/VoteScreen.tsx`):**
- Solo i giocatori attivi (`!p.eliminated`) possono votare
- `voterCount = active.length` determina quanti voti servono
- Il componente `VoteGrid` mostra i giocatori attivi come bersagli votabili
- Pareggio: ri-voto tra i pareggiati -> se ancora pari: sorteggio casuale

Il gioco supporta ruoli speciali facoltativi. Il tipo `SpecialRole` e il campo `specialRole?: SpecialRole` sul `Player` esistono gia'. Anche `specialRoles` in `GameConfig` esiste gia'.

**IMPORTANTE**: Potrebbero essere gia' implementati altri ruoli speciali. Controlla lo stato attuale dei file prima di modificarli per non sovrascrivere implementazioni esistenti.

## Il ruolo: Highlander

### Specifica
- **Assegnazione**: Qualsiasi giocatore
- **Minimo giocatori**: nessun vincolo aggiuntivo
- **Meccanica**: L'Highlander puo' continuare a votare anche dopo essere stato eliminato (1 voto pieno, uguale agli altri)
- **Punti**: Nessuna modifica al punteggio base
- **Limitazioni**: L'Highlander eliminato NON partecipa al round degli indizi (non da' parole). Vota solo basandosi sull'osservazione degli altri. Il suo ruolo viene comunque rivelato all'eliminazione come per tutti
- **L'Highlander NON puo' essere votato** dopo l'eliminazione (e' gia' eliminato, non compare tra i bersagli)

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi `'highlander'` al tipo `SpecialRole`
- Aggiungi `highlander?: boolean` a `specialRoles` in `GameConfig`

#### 2. `src/utils/assignRoles.ts`
- Dopo l'assegnazione dei ruoli base, se `config.specialRoles?.highlander` e' attivo:
  - Scegli un giocatore a caso (preferibilmente senza altri ruoli speciali)
  - Assegna `specialRole: 'highlander'`

#### 3. `src/screens/VoteScreen.tsx`
Questa e' la modifica principale:

**Calcolo votanti:**
Attualmente:
```typescript
const active = players.filter(p => !p.eliminated)
const voterCount = active.length
```

Deve diventare:
```typescript
const active = players.filter(p => !p.eliminated)
const highlander = players.find(p => p.eliminated && p.specialRole === 'highlander')
const voterCount = active.length + (highlander ? 1 : 0)
```

**Bersagli votabili:**
I bersagli restano SOLO i giocatori attivi (non eliminati). L'Highlander eliminato NON compare tra i bersagli. Modifica solo il conteggio dei votanti, non la griglia dei bersagli.

**Il VoteGrid non cambia**: continua a mostrare solo i giocatori attivi come bersagli. L'unica differenza e' che `voterCount` include l'Highlander eliminato, quindi servira' un voto in piu' prima che "tutti abbiano votato".

**Indicatore visivo:**
Nella schermata di voto, se l'Highlander e' eliminato e sta votando, mostra un piccolo banner sopra la griglia: "L'Highlander [nome] vota dall'aldila'!" con il tema stilistico del ruolo.

#### 4. `src/screens/SetupScreen.tsx`
- Aggiungi un toggle per "Highlander" nella sezione "Ruoli Speciali"
- Descrizione: "Puo' continuare a votare anche dopo essere stato eliminato"

#### 5. `src/screens/DealScreen.tsx` / `src/components/PrivacyReveal.tsx`
- Se il giocatore ha `specialRole === 'highlander'`, mostra sulla carta:
  - "Sei l'Highlander! Anche se verrai eliminato, potrai continuare a votare."

#### 6. `src/screens/RoundScreen.tsx`
- Se l'Highlander e' stato eliminato, nella sezione "Eliminati" mostra il suo nome con un indicatore speciale (es. non barrato come gli altri, o con un tag "vota ancora")
- Questo serve come promemoria visivo che l'Highlander e' ancora attivo nel voto

#### 7. `src/screens/EliminationScreen.tsx`
- Quando l'Highlander viene eliminato, mostra un messaggio aggiuntivo:
  - "Ma l'Highlander non muore mai del tutto... potra' ancora votare!"
  - Questo informa tutti i giocatori dell'abilita'

#### 8. `src/screens/ResultScreen.tsx`
- Mostra il tag "Highlander" accanto al nome del giocatore

### Stile UI
- Per l'Highlander usa **ciano/cyan** (`text-cyan-400`, `bg-cyan-500/20`, `border-cyan-400/30`)
- Il tag "vota dall'aldila'" puo' avere un effetto leggermente "ethereo" (opacity ridotta, bordo sfumato)
- Mantieni lo stile glass morphism

### Attenzione: interazione col sistema di pareggio
Il VoteScreen gestisce i pareggi con ri-voto e sorteggio. L'Highlander eliminato deve continuare a votare anche durante i ri-voti. Assicurati che:
- `voterCount` includa l'Highlander in tutti i round di voto (iniziale, ri-voto, ecc.)
- Il conteggio dei voti rimasti (`votersLeft = voterCount - totalVotesCast`) sia corretto

### Verifica
1. Attiva l'Highlander nella SetupScreen
2. Verifica che un giocatore riceva il ruolo Highlander nella DealScreen
3. Elimina l'Highlander -> verifica il messaggio speciale nella EliminationScreen
4. Nel turno successivo, verifica che nel VoteScreen il conteggio votanti includa l'Highlander (+1)
5. Verifica che l'Highlander NON compaia tra i bersagli votabili
6. Verifica che il banner "vota dall'aldila'" sia visibile
7. Testa un pareggio: verifica che il voterCount resti corretto anche nel ri-voto
8. Verifica che nel RoundScreen l'Highlander eliminato abbia un indicatore speciale nella sezione eliminati
9. Verifica che nella ResultScreen il tag Highlander sia visibile
