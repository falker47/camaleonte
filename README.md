# Camaleonte

Gioco di deduzione sociale **offline e single-device** per 3–12 giocatori. Il telefono passa di mano in mano: ognuno scopre in privato il proprio ruolo e la propria parola, poi il gruppo discute, vota ed elimina i sospetti.

**[Gioca ora](https://falker47.github.io/camaleonte/)** · installabile come PWA · build Android tramite Capacitor

![Anteprima di Camaleonte](public/preview.png)

## Il problema di gioco

Tutti devono riuscire a partecipare senza account, backend o dispositivi multipli, ma con informazioni private differenti.

Camaleonte gestisce localmente l'intero flusso: setup, distribuzione segreta di ruoli/parole, turni, voto, eliminazioni, abilità speciali, condizioni di vittoria, punteggi e rivincita. Dopo il primo caricamento la PWA è progettata per funzionare anche offline.

## Ruoli base

| Ruolo | Informazione | Obiettivo |
|---|---|---|
| **Civile** | Conosce la parola principale | Eliminare tutti gli impostori |
| **Talpa** | Riceve una parola simile ma diversa, senza sapere di essere un impostore | Sopravvivere abbastanza a lungo |
| **Camaleonte** | Non riceve alcuna parola | Bluffare; se eliminato può tentare di indovinare la parola dei civili |

Gli impostori non vincono semplicemente quando superano numericamente i civili. La partita usa una **soglia dinamica di sopravvivenza** basata sul numero iniziale di giocatori:

- 3–5 giocatori → vittoria degli impostori quando restano al massimo 2 giocatori attivi;
- 6–8 giocatori → soglia 3;
- 9–12 giocatori → soglia 4.

I civili vincono appena non rimane alcun Camaleonte o Talpa attivo.

## Ruoli speciali

Sono opzionali e aggiungono interazioni senza cambiare il modello single-device.

| Ruolo | Min. giocatori | Effetto |
|---|---:|---|
| **Buffone** | 5 | Ottiene un bonus se viene eliminato al primo turno |
| **Spettro** | 3 | Continua a votare dopo l'eliminazione |
| **Duellanti** | 4 | Due rivali: chi cade per primo trasferisce punti all'altro |
| **Romeo & Giulietta** | 5 | Se uno viene eliminato, cade anche l'altro |
| **Riccio** | 5 | Quando viene eliminato trascina con sé un altro giocatore |
| **Oracolo** | 4 | Quando viene eliminato può rivelare il ruolo di un giocatore |

## Contenuto e flusso

Il dataset corrente contiene **507 set di parole in 16 categorie**. Molti set includono una terza parola, usata quando la configurazione richiede più Talpe.

Il flusso principale comprende:

1. configurazione di giocatori, impostori e ruoli speciali;
2. rivelazione privata di ruolo e parola;
3. indizi a turno;
4. voto ed eliminazione;
5. eventuali abilità/guess del Camaleonte;
6. verifica della condizione di vittoria e punteggio;
7. rivincita con ruoli e ordine rimescolati, mantenendo la classifica.

## Architettura

- **React 19 + TypeScript** per UI e logica applicativa;
- **Zustand** per la macchina di stato del gioco;
- **Tailwind CSS v4** e **Framer Motion** per interfaccia mobile-first e animazioni;
- **Vite 5 + vite-plugin-pwa** per build e funzionamento offline;
- **Capacitor 8** per il wrapper Android;
- **GitHub Pages** per la versione web pubblica.

La logica di dominio è separata in utility dedicate (`src/utils`), mentre `src/store/gameStore.ts` orchestra stato, eliminazioni, abilità speciali e scoring.

## Verifica

La pipeline GitHub Actions esegue su ogni push e pull request:

```bash
npm ci
npm run test:core
npm run build
```

I test core coprono le soglie dinamiche e le principali condizioni di vittoria. Il deploy su GitHub Pages avviene solo dopo il superamento della verifica su `master`.

## Sviluppo locale

Richiede Node.js 20+.

```bash
npm ci
npm run dev
```

Per la build di produzione:

```bash
npm run test:core
npm run build
```

Per sincronizzare la build web nel progetto Android:

```bash
npm run build:android
```

## Privacy

Il gioco non richiede account o backend e lo stato della partita resta sul dispositivo. La pagina informativa è disponibile in [public/privacy.html](public/privacy.html).

## Licenza

**All Rights Reserved.** Vedi [LICENSE](LICENSE).
