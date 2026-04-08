# Implementa il ruolo: Il Buffone

## Contesto del gioco

Undercover e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

Ogni turno: tutti danno un indizio -> si vota -> il piu' votato viene eliminato -> si controlla la win condition.

**Punteggio attuale:**
- Civili vincono (tutti impostori eliminati, MW non indovina): civili +2 pts ciascuno
- MW indovina la parola: MW +3/4 pts (basato su numero giocatori)
- MW sopravvive fino alla fine: MW +3/5 pts
- Infiltrato sopravvive: +3/5 pts
- Infiltrato eliminato: +1 pt per civile eliminato (max 3)

## Il ruolo: Il Buffone

### Specifica
- **Assegnazione**: Solo a un civile (ha la parola corretta)
- **Minimo giocatori**: 5 (non mostrare l'opzione se ci sono meno di 5 giocatori validi)
- **Meccanica**: Se il Buffone viene eliminato al **turno 1** (esattamente `turno === 1`), guadagna **+2 punti extra**
- **Punti**: I +2 bonus si guadagnano SEMPRE se eliminato al T1, indipendentemente dall'esito della partita. Si sommano ai punti normali (es. se civili vincono: 2 + 2 = 4 pts totali)
- **Se eliminato dopo il T1**: nessun bonus, il ruolo non ha effetto

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi un tipo `SpecialRole` (union type, per ora solo `'buffone'`). Rendilo estensibile per futuri ruoli
- Aggiungi campo opzionale `specialRole?: SpecialRole` all'interfaccia `Player`
- Aggiungi campo opzionale `specialRoles?: { buffone?: boolean }` all'interfaccia `GameConfig` (o un approccio simile per tracciare quali ruoli speciali sono attivi)

#### 2. `src/utils/assignRoles.ts`
- **REGOLA FONDAMENTALE**: I ruoli speciali NON sono cumulabili. Ogni giocatore puo' avere al massimo un `specialRole`. Assegna solo a giocatori che non hanno gia' un ruolo speciale.
- Dopo l'assegnazione dei ruoli base, se `config.specialRoles?.buffone` e' attivo E ci sono almeno 5 giocatori:
  - Scegli un giocatore civile a caso **che non ha gia' un `specialRole`** e assegnagli `specialRole: 'buffone'`
  - Se non ci sono civili disponibili (tutti hanno gia' un ruolo speciale), il Buffone non viene assegnato

#### 3. `src/store/gameStore.ts` - funzione `calcFinalScores`
- Nella funzione `calcFinalScores`, dopo il calcolo dei punti normali, controlla se il giocatore ha `specialRole === 'buffone'` E `eliminatedInTurno === 1`
- Se si', aggiungi +2 ai suoi punti del round

#### 4. `src/screens/SetupScreen.tsx`
- Aggiungi una sezione "Ruoli Speciali" sotto la sezione "Ruoli" esistente
- Mostra un toggle per "Il Buffone" con descrizione "Un civile che guadagna +2 punti se eliminato al primo turno"
- Il toggle deve essere visibile solo se ci sono almeno 5 giocatori validi
- Passa il valore al `config` tramite `setConfig`

#### 5. `src/screens/DealScreen.tsx` / `src/components/PrivacyReveal.tsx`
- Se il giocatore ha `specialRole === 'buffone'`, mostra un'indicazione aggiuntiva sulla carta (es. sotto la parola, un piccolo tag "Buffone" o un'icona). ATTENZIONE: l'infiltrato e il civile hanno la stessa UI, quindi il tag Buffone deve apparire solo sulla carta del Buffone stesso, non rivelare nulla agli altri
- Aggiungi una breve spiegazione: "Se vieni eliminato al primo turno, guadagni +2 punti extra!"

#### 6. `src/screens/ResultScreen.tsx`
- Nella sezione "Ruoli e punti partita", se il Buffone ha ottenuto il bonus, mostra un'etichetta tipo "bonus buffone!" accanto ai punti (simile a come si mostra "ha indovinato!" per MW o "parziale" per infiltrato)
- Nella legenda punti (sezione collassabile), aggiungi la spiegazione del Buffone se il ruolo era attivo

### Stile UI
- Mantieni lo stile esistente: glass morphism, colori coerenti (indigo per civili, amber per infiltrati, white per MW)
- Per il Buffone usa **rosso** (`text-red-400`, `bg-red-500/20`, `border-red-400/30`)
- Usa le animazioni esistenti (`springTap`, `framer-motion`)

### Verifica
1. Crea una partita con 5+ giocatori e attiva il Buffone
2. Nella DealScreen, verifica che un solo civile mostri il tag "Buffone"
3. Elimina il Buffone al turno 1 -> verifica che nella ResultScreen abbia +2 extra
4. Elimina il Buffone al turno 2+ -> verifica che NON abbia il bonus
5. Verifica che il Buffone funzioni sia quando i civili vincono che quando perdono
6. Verifica che con meno di 5 giocatori il toggle non sia visibile
