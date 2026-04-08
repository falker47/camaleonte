# Il Riccio - Design Spec

## Context

Il Riccio is the last special role to implement in the Undercover party game. It introduces a retaliatory elimination mechanic: when eliminated by vote, the Riccio drags another active player down with them. The name "Il Riccio" (hedgehog) captures the concept of "touch it and you hurt yourself."

## Role Identity

- **Name:** Il Riccio
- **Emoji:** 🦔
- **Color theme:** Orange (`orange-400`/`orange-500`)
- **Min players:** 3
- **Eligibility:** Any player without an existing special role

## Mechanic

When Il Riccio is eliminated by vote, they choose one active player to eliminate with them. This only triggers if the game hasn't already ended from the Riccio's own elimination.

### Rules

1. **Anti-chain:** If the Riccio eliminates another Riccio, the second one does NOT activate their ability
2. **Camaleonte interaction:** If the Riccio's target is a Camaleonte, the target gets their guess attempt (via `camaleonte_guess`)
3. **Romeo & Giulietta interaction:** If the target is Romeo/Giulietta, the partner is also eliminated via linked elimination
4. **Riccio is Camaleonte:** If the Riccio themselves is a Camaleonte, the flow is: guess first, then (if game not over) riccio_strike
5. **Last turn warning:** Show a banner in RoundScreen when the Riccio is alive and the next elimination would end the game (meaning the Riccio won't get to strike)
6. **No score modification:** The Riccio does not alter scoring, only elimination flow

## Modified Game Flow

```
vote → elimination → [if Camaleonte: guess] → [if Riccio AND game not over: riccio_strike]
  → [if target is Camaleonte: guess] → [if target is R&G: linked elimination]
  → check win → result or next round
```

## New Screen: `riccio_strike`

A target selection screen where the eliminated Riccio chooses who to drag down:

- Header: 🦔 emoji + "Il Riccio colpisce!" in orange
- Subtitle: "{name} puo' trascinare qualcuno con se'"
- List of active players as selectable buttons (orange hover theme)
- On selection: ConfirmDialog asking for confirmation
- On confirm: execute `riccioStrike(targetId)`

## Files to Modify

### 1. `src/store/types.ts`
- Add `'riccio'` to `SpecialRole` union type
- Add `'riccio_strike'` to `Screen` union type
- Add `riccio?: boolean` to `GameConfig.specialRoles`

### 2. `src/utils/assignRoles.ts`
- Add assignment block for Riccio (same pattern as other roles):
  - Filter eligible players (no existing specialRole)
  - Random pick from shuffled eligible list
  - Assign `specialRole: 'riccio'`

### 3. `src/store/gameStore.ts`

**New state:**
- `riccioStrikeActive: boolean` (default `false`)
- Reset in `startGame`, `resetGame`, `rematch`

**Modify `GameState` interface:**
- Add `riccioStrikeActive` property
- Add `riccioStrike: (targetId: string) => void` action

**Modify `confirmElimination()`:**
After the existing R&G linked elimination and Camaleonte guess handling, before final win check:
- If eliminated player has `specialRole === 'riccio'` AND `checkWinCondition()` returns `null`:
  - Set `riccioStrikeActive: true`, navigate to `'riccio_strike'`
  - Return early (don't check win yet)

**Modify `GuessScreen` flow (`handleContinue`):**
After camaleonte guess resolves, before going to result/nextTurno:
- Check if the *original* eliminated player (the one who triggered this flow) was a Riccio
- If yes AND game not over → navigate to `riccio_strike`
- This handles the case where the Riccio is also a Camaleonte

**New action `riccioStrike(targetId)`:**
1. Mark target as eliminated (`eliminatedInTurno: turno`)
2. If target is Romeo/Giulietta → linked elimination of partner
3. Set `riccioStrikeActive: false`
4. If target is Camaleonte → navigate to `camaleonte_guess` (target gets guess)
5. Otherwise → check win condition → result or next round

### 4. `src/screens/RiccioStrikeScreen.tsx` (NEW)
- Orange-themed target selection screen
- Lists all active (non-eliminated) players
- Uses existing `ConfirmDialog` component
- Uses `AVATAR_COLORS` and `springTap` for consistency
- Calls `riccioStrike(targetId)` on confirmation

### 5. `src/App.tsx`
- Import `RiccioStrikeScreen`
- Add to `SCREENS` map: `riccio_strike: RiccioStrikeScreen`
- Add `'riccio_strike'` to `SCREEN_ORDER` after `'camaleonte_guess'`
- Add to `IN_GAME_SCREENS` and `INVALIDATE_SCREENS`
- Add to `FADE_SCALE_SCREENS` for smooth transition

### 6. `src/screens/SetupScreen.tsx`
- New state: `riccioEnabled` (default `false`)
- Add role entry to SpecialRolesOverlay roles array:
  ```
  id: 'riccio', label: 'Il Riccio', emoji: '🦔',
  description: 'Se eliminato, trascina un altro giocatore con se.',
  colors: orange-500/orange-400 theme,
  minPlayers: 3
  ```
- Add toggle handler for `'riccio'`
- Add orange badge when enabled
- Include `riccio: riccioEnabled` in `specialRoles` config on game start

### 7. `src/components/PrivacyReveal.tsx`
- For `specialRole === 'riccio'`:
  - Badge: orange theme (`bg-orange-500/20 border-orange-400/30 text-orange-400`)
  - Icon: "🦔 Il Riccio"
  - Text: "Se vieni eliminato, potrai scegliere un giocatore da eliminare con te."

### 8. `src/screens/RoundScreen.tsx`
- Last turn warning logic:
  - Check if Riccio is alive: `players.some(p => !p.eliminated && p.specialRole === 'riccio')`
  - Check if next elimination ends game: `activePlayers.length - 1 <= getSurvivalThreshold(players.length)`
  - If both true, show orange banner: "🦔 Il Riccio non potra' colpire in questo turno"
  - Import `getSurvivalThreshold` from `../utils/winCondition`

### 9. `src/screens/EliminationScreen.tsx`
- Show 🦔 badge for Riccio elimination with context message
- Orange flash background when Riccio is eliminated

### 10. `src/screens/ResultScreen.tsx`
- Show 🦔 emoji next to Riccio player in results list (orange color)

## Verification Plan

1. Enable Il Riccio in setup → verify it appears in SpecialRolesOverlay with orange theme
2. Start game → verify Riccio is assigned to a player and shown in PrivacyReveal
3. Eliminate the Riccio → verify `RiccioStrikeScreen` appears
4. Choose a target → verify ConfirmDialog, then target is eliminated
5. **Edge: game would end from Riccio's elimination** → Riccio does NOT get to strike
6. **Edge: Riccio targets a Camaleonte** → target gets their guess attempt
7. **Edge: Riccio targets a R&G member** → partner is also eliminated
8. **Edge: Riccio targets another Riccio** → second Riccio does NOT activate ability (anti-chain)
9. **Edge: Riccio is a Camaleonte** → guess first, then strike (if game not over)
10. **Last turn warning** → banner shows in RoundScreen when applicable
11. Run `npm run build` to verify no type errors
