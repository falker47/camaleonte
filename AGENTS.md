# AGENTS.md - Camaleonte

Guida operativa per Codex in questo repository. Tenere questo file corto,
pratico e aggiornato solo con regole stabili del progetto.

## Prima Di Modificare

- Leggere i file rilevanti prima di cambiare codice, dati, documentazione o
  configurazione.
- Controllare lo stato del worktree con `git status --short` e non sovrascrivere
  modifiche non proprie.
- Preferire cambi piccoli e mirati. Evitare refactor non richiesti mentre si
  corregge una meccanica o una schermata.
- Non salvare segreti, token o credenziali nel repository.
- Se una regola di gioco non e' chiara dai file locali, chiedere conferma prima
  di codificarla.

## Progetto

Camaleonte e' un gioco di deduzione sociale in italiano, per 3-12 giocatori su
un singolo dispositivo. Deve funzionare offline come PWA e anche tramite build
Android con Capacitor.

Stack verificato:

- React 19 + TypeScript
- Vite 5
- Tailwind CSS v4
- Framer Motion
- Zustand
- vite-plugin-pwa
- Capacitor Android

## Comandi

- `npm install` per installare le dipendenze.
- `npm run dev` per sviluppo locale con Vite.
- `npm run build` e' il controllo principale: TypeScript build + Vite build.
- `npm run preview` per provare la build.
- `npm run build:android` per build web e sync Capacitor Android.
- `npm run open:android` per aprire il progetto Android.

Non modificare `package-lock.json` salvo aggiornamenti reali di dipendenze.

## Architettura

- `src/App.tsx` gestisce il flusso schermate senza router esterno.
- Le schermate possibili sono definite in `src/store/types.ts` come `Screen` e
  mappate in `SCREENS` dentro `src/App.tsx`.
- Lo stato principale vive in `src/store/gameStore.ts` con Zustand: setup,
  distribuzione ruoli/parole, turni, voti, eliminazioni, guess del Camaleonte,
  poteri speciali, punteggi e rivincita.
- Le regole pure stanno in `src/utils/`: assegnazione ruoli, win condition,
  matching parole, shuffle, vibrazione.
- Costanti numeriche e punteggi stanno in `src/constants/gameConfig.ts`.
- Parole e alias stanno in `src/data/wordPairs.ts` e `src/data/wordAliases.ts`.
- Componenti riusabili stanno in `src/components/`; schermate in `src/screens/`;
  hook in `src/hooks/`.
- Asset web/PWA stanno in `public/` e `src/assets/`.
- La cartella `android/` e' per Capacitor/Android; toccarla solo per modifiche
  Android-specifiche.

## Regole Di Gioco Da Preservare

- Ruoli base: `civile`, `talpa`, `camaleonte`.
- Ruoli speciali: `buffone`, `spettro`, `duellante`, `romeo`, `giulietta`,
  `riccio`, `oracolo`.
- La Talpa riceve una parola diversa ma non sa di essere impostore.
- Il Camaleonte non riceve una parola; se eliminato puo' indovinare la parola
  civile tramite `submitCamaleonteGuess`.
- Con piu' Talpe servono coppie/triple con `wordC`: `startGame` filtra
  `wordPairs` quando `talpaCount > 1`.
- La win condition e' in `checkWinCondition`: civili vincono se non ci sono
  impostori attivi; gli impostori vincono quando i giocatori attivi scendono
  sotto la soglia dinamica di sopravvivenza.
- I punteggi sono calcolati in `calcFinalScores`; aggiornare anche
  `ScoreReference`, risultati, README o tutorial quando cambiano regole o punti.

Quando si aggiunge o cambia una schermata, aggiornare almeno:

- `Screen` in `src/store/types.ts`
- `SCREENS` e, se serve, `SCREEN_ORDER` in `src/App.tsx`
- transizioni/navigazione nel `gameStore`
- eventuali pulsanti globali in `App.tsx`

Quando si aggiunge o cambia un ruolo speciale, controllare almeno:

- tipi in `src/store/types.ts`
- vincoli e UI in `SetupScreen` e `SpecialRolesOverlay`
- assegnazione in `assignRoles`
- flusso di eliminazione nel `gameStore`
- punteggi, risultato, README/tutorial e riferimenti UI

## UI E Stile

- Copy e naming visibili all'utente devono restare in italiano.
- L'app e' mobile-first, con contenitore massimo tipo telefono (`max-w-md`) e
  interazioni pensate per un dispositivo passato di mano in mano.
- Conservare lo stile esistente: sfondo scuro, vetro/glass classes,
  Tailwind inline, animazioni Framer Motion leggere.
- Non introdurre dipendenze UI pesanti senza necessita reale.
- Attenzione a touch, focus, tastiera mobile e PWA offline.
- Non presumere rete o backend: il gioco deve restare locale e single-device.

## Dati Parole

- Mantenere parole e categorie coerenti con il tono del gioco.
- Per nuove parole con grafie variabili, aggiornare anche `wordAliases.ts` se
  aiuta il guess del Camaleonte.
- Evitare duplicati evidenti o coppie troppo sbilanciate.
- Se `wordC` e' assente, quella voce non puo' supportare piu' di una Talpa.

## Verifica

- Dopo modifiche a codice TypeScript, regole, schermate, dati o config, eseguire
  `npm run build` quando possibile.
- Per modifiche visuali o di flusso, provare anche `npm run dev` e verificare
  almeno una viewport mobile.
- Per modifiche PWA/asset/config Capacitor, usare `npm run build`; se la modifica
  impatta Android, usare `npm run build:android`.
- Se una verifica non puo' essere eseguita, dirlo chiaramente nel resoconto.

## Memoria Del Progetto

- Questo repo non usa di default la struttura completa del template generico
  (`CURRENT_STATUS.md`, task folder, evidence log, ecc.).
- Aggiornare `AGENTS.md` solo per regole operative stabili e riutilizzabili.
- Per conoscenza utente-facing o regole di gioco, preferire README, componenti
  informativi o file dati dedicati.
- Non trasformare questo file in diario di task o changelog.
