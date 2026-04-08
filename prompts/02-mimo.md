# Implementa il ruolo: Il Mimo

## Contesto del gioco

Undercover e' un party game di deduzione. I giocatori ricevono una parola segreta e danno indizi a turno. I ruoli base sono:
- **Civile**: conosce la parola corretta, vuole eliminare gli impostori
- **Infiltrato**: riceve una parola diversa (non sa di essere infiltrato), vuole sopravvivere
- **Mr. White**: non ha parola, deve bluffare, puo' tentare di indovinare la parola se eliminato

Ogni turno: tutti danno un indizio -> si vota -> il piu' votato viene eliminato -> si controlla la win condition.

## Infrastruttura esistente (implementata col Buffone)

Il sistema dei ruoli speciali e' gia' in piedi:

**Tipi** (`src/store/types.ts`):
- `SpecialRole = 'buffone'` (union type da estendere)
- `Player` ha campo `specialRole?: SpecialRole`
- `GameConfig` ha campo `specialRoles?: { buffone?: boolean }`

**Assegnazione** (`src/utils/assignRoles.ts`):
- I ruoli speciali vengono assegnati DOPO i ruoli base
- Pattern: filtra giocatori `eligible` (senza `specialRole`), shuffle, prendi il primo
- Il Buffone filtra solo civili: `p.role === 'civile' && !p.specialRole`

**SetupScreen** (`src/screens/SetupScreen.tsx`):
- Stato locale `buffoneEnabled` (boolean) + `showSpecialRoles` (boolean)
- Bottone "Ruoli Speciali" che apre `SpecialRolesOverlay`
- Badge dei ruoli attivi sotto il bottone
- `handleStart` passa `specialRoles: { buffone: buffoneEnabled && filtered.length >= 5 }` al config
- Auto-disable del buffone se giocatori < 5 via useEffect

**SpecialRolesOverlay** (`src/components/SpecialRolesOverlay.tsx`):
- Componente generico che riceve un array `roles: SpecialRoleConfig[]`
- Ogni ruolo ha: `id, label, emoji, description, bgBase, bgActive, borderBase, borderActive, toggleColor, enabled, minPlayers`
- Toggle on/off per ogni ruolo, con lock se giocatori insufficienti

**PrivacyReveal** (`src/components/PrivacyReveal.tsx`):
- Riceve `specialRole?: SpecialRole` come prop
- Per il Buffone: mostra badge rosso + spiegazione sotto la parola (solo su carte non-MW)
- Per MW: la carta mostra "Sei Mr. White" con layout diverso

**DealScreen** (`src/screens/DealScreen.tsx`):
- Passa `specialRole={current.specialRole}` a `PrivacyReveal`

**ResultScreen** (`src/screens/ResultScreen.tsx`):
- Mostra emoji del ruolo speciale accanto al nome del giocatore
- Mostra badge "bonus buffone!" se il bonus e' stato attivato
- Legenda punti mostra spiegazione del Buffone se un giocatore lo aveva

## Il ruolo: Il Mimo

### Specifica
- **Assegnazione**: Qualsiasi giocatore (civile, infiltrato, o Mr. White)
- **Minimo giocatori**: 3 (nessun vincolo aggiuntivo)
- **Meccanica**: Il Mimo deve mimare gli indizi anziche' parlare. Non e' un effetto meccanico nel codice, e' una regola sociale. L'app deve solo:
  1. Mostrare chiaramente chi e' il Mimo durante la distribuzione carte
  2. Ricordare a tutti durante il round che quel giocatore deve mimare
- **Punti**: Nessuna modifica al punteggio
- **Regole di mimo valido** (da mostrare): no lettere disegnate nell'aria, no labiale, no scrittura. Solo gesti e mimica corporea

### Cosa modificare

#### 1. `src/store/types.ts`
- Aggiungi `'mimo'` al tipo `SpecialRole`: `export type SpecialRole = 'buffone' | 'mimo'`
- Aggiungi `mimo?: boolean` a `specialRoles` in `GameConfig`: `specialRoles?: { buffone?: boolean; mimo?: boolean }`

#### 2. `src/utils/assignRoles.ts`
- **REGOLA FONDAMENTALE**: I ruoli speciali NON sono cumulabili. Ogni giocatore puo' avere al massimo un `specialRole`.
- Aggiungi un nuovo blocco DOPO quello del Buffone, seguendo lo stesso pattern:
  ```
  if (config.specialRoles?.mimo) {
    const eligible = result.map((p, i) => ({ p, i })).filter(({ p }) => !p.specialRole)
    // Nota: nessun filtro su role, il Mimo puo' essere chiunque
    if (eligible.length > 0) {
      const chosen = shuffle(eligible)[0]
      result[chosen.i] = { ...result[chosen.i], specialRole: 'mimo' }
    }
  }
  ```

#### 3. `src/screens/SetupScreen.tsx`
- Aggiungi stato locale: `const [mimoEnabled, setMimoEnabled] = useState(false)`
- Nell'array `roles` passato a `SpecialRolesOverlay`, aggiungi un secondo oggetto dopo il Buffone:
  ```
  {
    id: 'mimo',
    label: 'Il Mimo',
    emoji: '🤫',
    description: 'Un giocatore deve mimare gli indizi anziche\' parlare.',
    bgBase: 'bg-slate-500/10',
    bgActive: 'bg-slate-500/25',
    borderBase: 'border-slate-400/20',
    borderActive: 'border-slate-400/50',
    toggleColor: 'bg-slate-400',
    enabled: mimoEnabled,
    minPlayers: 3,
  }
  ```
- Nell'`onToggle`, aggiungi: `if (id === 'mimo') setMimoEnabled(v => !v)`
- Nel conteggio ruoli attivi (riga ~365), aggiungi `mimoEnabled` all'array
- Nei badge sotto il bottone, aggiungi il badge Mimo se attivo:
  ```
  {mimoEnabled && (
    <span className="inline-block rounded-full bg-slate-500/20 border border-slate-400/30 text-slate-200 text-xs font-bold px-2.5 py-0.5">
      🤫 Mimo
    </span>
  )}
  ```
- In `handleStart`, aggiungi `mimo: mimoEnabled` dentro `specialRoles`

#### 4. `src/components/PrivacyReveal.tsx`
- Aggiungi un blocco per il Mimo simile a quello del Buffone. Il Mimo puo' essere anche MW, quindi servono DUE posizioni:
  - **Per civile/infiltrato** (dentro il blocco `role !== 'mrwhite'`): sotto la parola, aggiungi:
    ```
    {specialRole === 'mimo' && (
      <div className="mt-3 flex flex-col items-center gap-1.5">
        <span className="inline-block rounded-full bg-slate-700/30 border border-slate-400/30 text-slate-200 text-sm font-bold px-4 py-1">
          🤫 Il Mimo
        </span>
        <p className={`text-sm text-center ${textColor} opacity-60`}>
          Devi mimare i tuoi indizi! No parole, no labiale, no lettere nell'aria.
        </p>
      </div>
    )}
    ```
  - **Per Mr. White** (dentro il blocco `role === 'mrwhite'`): sotto "Non hai nessuna parola. Bluffa!", aggiungi lo stesso badge ma con `textColor` adattato (nero su sfondo chiaro MW):
    ```
    {specialRole === 'mimo' && (
      <div className="mt-2 flex flex-col items-center gap-1">
        <span className="inline-block rounded-full bg-slate-800/30 border border-slate-600/30 text-slate-700 text-sm font-bold px-4 py-1">
          🤫 Il Mimo
        </span>
        <p className={`text-xs text-center ${textColor} opacity-60`}>
          Devi mimare! No parole.
        </p>
      </div>
    )}
    ```

#### 5. `src/screens/RoundScreen.tsx`
- Nella lista dei giocatori attivi, accanto al nome, mostra un badge se il giocatore ha `specialRole === 'mimo'`:
  ```
  {player.specialRole === 'mimo' && (
    <span className="text-xs bg-slate-700/30 border border-slate-400/30 text-slate-200 px-2 py-0.5 rounded-full font-bold">
      🤫 Mimo
    </span>
  )}
  ```
- Questo serve come promemoria per tutti: quel giocatore deve mimare, non parlare

#### 6. `src/screens/ResultScreen.tsx`
- Nella lista giocatori (player chips), accanto al nome, aggiungi l'indicatore Mimo:
  ```
  {player.specialRole === 'mimo' && <span className="text-slate-300 text-xs">🤫</span>}
  ```
  (Stesso pattern dell'emoji Buffone gia' presente: `{player.specialRole === 'buffone' && <span className="text-red-400 text-xs">🃏</span>}`)

### Stile UI
- Per il Mimo usa **nero/bianco** (`text-slate-200`, `bg-slate-700/30`, `border-slate-400/30`, toggle `bg-slate-400`)
- Emoji: 🤫
- Mantieni lo stile glass morphism esistente

### Verifica
1. Attiva il Mimo nella SetupScreen -> verifica che il badge appaia
2. Verifica che esattamente un giocatore riceva il tag "Mimo" nella DealScreen
3. Verifica che sulla carta civile/infiltrato il badge Mimo appaia sotto la parola
4. Verifica che sulla carta MW il badge Mimo appaia sotto "Bluffa!"
5. Verifica che nella RoundScreen il giocatore Mimo abbia il badge accanto al nome
6. Se sia Buffone che Mimo sono attivi, verifica che vengano assegnati a giocatori diversi
7. Verifica che nella ResultScreen l'emoji Mimo sia visibile
