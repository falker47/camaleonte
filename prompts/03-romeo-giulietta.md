# Implementa il ruolo: Romeo & Giulietta

## Contesto del gioco

Undercover e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

Ogni turno: tutti danno un indizio -> si vota -> il piu' votato viene eliminato -> si controlla la win condition.

**Win conditions:**
- `'civilians'`: tutti gli impostori eliminati
- `'last_two'`: giocatori attivi <= soglia (2 per 3-5 giocatori, 3 per 6-8, 4 per 9+) con almeno 1 impostore vivo

Il gioco supporta ruoli speciali facoltativi. Il tipo `SpecialRole` e il campo `specialRole?: SpecialRole` sul `Player` esistono gia'. Anche `specialRoles` in `GameConfig` esiste gia'.

## Il ruolo: Romeo & Giulietta

### Specifica
- **Assegnazione**: Due giocatori casuali, qualsiasi ruolo (completamente random)
- **Minimo giocatori**: 6 (non mostrare l'opzione con meno di 6 giocatori validi)
- **Meccanica**: Se uno dei due viene eliminato (dal voto, dal Cobra, o qualsiasi altra causa), anche l'altro viene eliminato simultaneamente
- **Punti**: Nessuna modifica al punteggio base. Entrambi ricevono i punti normali del proprio ruolo
- **Annuncio**: All'inizio della partita (dopo la distribuzione carte, prima del primo turno) viene annunciato che Romeo e Giulietta sono in gioco, ma NON chi sono
- **MW e legame**: Se un MW viene eliminato PER LEGAME (cioe' e' il partner di chi e' stato votato), NON ha diritto al tentativo di indovinare la parola. Solo il MW eliminato direttamente dal voto ha questo diritto

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi `'romeo'` e `'giulietta'` al tipo `SpecialRole`
- Aggiungi `romeoGiulietta?: boolean` a `specialRoles` in `GameConfig`

#### 2. `src/utils/assignRoles.ts`
- Dopo l'assegnazione dei ruoli base, se `config.specialRoles?.romeoGiulietta` e' attivo E ci sono almeno 6 giocatori:
  - Scegli due giocatori a caso che non hanno gia' un ruolo speciale
  - Assegna `specialRole: 'romeo'` al primo e `specialRole: 'giulietta'` al secondo
  - Se non ci sono abbastanza giocatori senza ruoli speciali, puoi sovrascrivere (R&G ha priorita')

#### 3. `src/store/gameStore.ts` - funzione `confirmElimination`
Questa e' la modifica piu' critica. Dopo aver segnato il giocatore eliminato come `eliminated: true`:

1. Controlla se il giocatore eliminato ha `specialRole === 'romeo'` o `specialRole === 'giulietta'`
2. Se si', trova il partner (l'altro romeo/giulietta) tra i giocatori attivi
3. Se il partner esiste e non e' gia' eliminato, eliminalo anche lui settando `eliminated: true` e `eliminatedInTurno: turno`
4. **IMPORTANTE**: Se il partner e' un MW, NON mandare alla schermata `mrwhite_guess`. Il partner eliminato per legame non ha diritto al tentativo
5. Se il giocatore eliminato direttamente (dal voto) e' un MW, procedi normalmente con `mrwhite_guess`
6. Dopo entrambe le eliminazioni, controlla la win condition con la lista aggiornata

#### 4. `src/screens/SetupScreen.tsx`
- Aggiungi un toggle per "Romeo & Giulietta" nella sezione "Ruoli Speciali"
- Descrizione: "Due giocatori legati: se uno cade, cade anche l'altro"
- Visibile solo con 6+ giocatori validi
- Passa il valore al `config`

#### 5. `src/screens/DealScreen.tsx` / `src/components/PrivacyReveal.tsx`
- Se il giocatore ha `specialRole === 'romeo'`, mostra sulla carta: "Sei Romeo! Il tuo destino e' legato a quello di Giulietta. Se uno di voi viene eliminato, anche l'altro lo sara'."
- Se `specialRole === 'giulietta'`, messaggio analogo con ruoli invertiti
- NON rivelare chi e' il partner! Ogni giocatore sa solo di essere Romeo o Giulietta, non chi e' l'altro

#### 6. `src/screens/RoundScreen.tsx`
- Al primo turno (`turno === 1`), se Romeo & Giulietta sono attivi, mostra un banner/avviso in cima: "Romeo e Giulietta sono in gioco! Due giocatori sono legati: se uno cade, cade anche l'altro."
- Il banner puo' essere un `glass` box con bordo rosa/pink

#### 7. `src/screens/EliminationScreen.tsx`
- Se il giocatore eliminato ha un partner R&G che viene eliminato per legame, mostra un messaggio aggiuntivo dopo la rivelazione del ruolo:
  - "Il legame si spezza! Anche [nome partner] ([ruolo partner]) viene eliminato!"
  - Mostra il ruolo del partner (civile/infiltrato/mrwhite) con il relativo RoleTag
  - Usa un'animazione per drammatizzare il momento (es. un secondo reveal con delay)

#### 8. `src/screens/ResultScreen.tsx`
- Nella lista giocatori, mostra i tag "Romeo"/"Giulietta" accanto ai nomi dei due giocatori

### Stile UI
- Per Romeo & Giulietta usa **rosa/pink** (`text-pink-400`, `bg-pink-500/20`, `border-pink-400/30`)
- Il banner di annuncio nel RoundScreen usa lo stesso stile pink
- Mantieni lo stile glass morphism

### Verifica
1. Crea una partita con 6+ giocatori e attiva Romeo & Giulietta
2. Verifica che esattamente 2 giocatori ricevano i ruoli Romeo e Giulietta
3. Elimina Romeo -> verifica che anche Giulietta venga eliminata
4. Verifica che la doppia eliminazione triggeri correttamente la win condition
5. Testa il caso: MW e' Giulietta, Romeo viene eliminato -> MW-Giulietta NON deve avere il tentativo di indovinare
6. Testa il caso: MW e' Romeo e viene eliminato dal voto -> MW-Romeo DEVE avere il tentativo di indovinare (e Giulietta viene eliminata)
7. Verifica che con meno di 6 giocatori il toggle non sia visibile
8. Verifica il banner di annuncio al turno 1
