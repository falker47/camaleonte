# Camaleonte

Un gioco di deduzione sociale per 3-12 giocatori su un singolo dispositivo. Non serve internet.

## Come funziona

Ogni giocatore riceve una parola segreta. **Il Camaleonte** non ha nessuna parola e deve bluffare. **Le Talpe** ricevono una parola diversa ma non sanno di essere impostori. A turno, ogni giocatore dà un indizio di una sola parola per descrivere la propria, poi si vota per eliminare il sospettato. Trovate gli impostori prima che vi superino in numero!

### Ruoli

| Ruolo | Descrizione |
|-------|-------------|
| Civile | Conosce la parola principale. Deve individuare gli impostori. |
| La Talpa | Ha una parola simile ma diversa. Non sa di essere un impostore. |
| Il Camaleonte | Non ha nessuna parola. Deve bluffare e, se eliminato, può tentare di indovinare la parola dei civili per vincere. |

### Ruoli Speciali

Attivabili dal setup per rendere il gioco più imprevedibile.

| Ruolo | Min. | Descrizione |
|-------|------|-------------|
| 🃏 Il Buffone | 5 | Un civile che guadagna 2 punti bonus se si fa eliminare al primo turno. |
| 🎐 Lo Spettro | 3 | Anche dopo essere eliminato, continua a votare. |
| ⚔️ I Duellanti | 4 | Due nemici: chi viene eliminato per primo cede 2 punti all'altro. |
| 💕 Romeo & Giulietta | 5 | Due giocatori legati: se uno cade, cade anche l'altro. |
| 🦔 Il Riccio | 5 | Se eliminato, trascina un altro giocatore con sé. |
| 🔮 L'Oracolo | 4 | Se eliminato, svela il ruolo di un giocatore a sua scelta. |

### Meccaniche

- **Indizi e voto**: a turno ogni giocatore dà un indizio di una parola, poi si vota per eliminare il sospettato.
- **Guess del Camaleonte**: se eliminato, il Camaleonte ha 60 secondi per indovinare la parola dei civili e vincere.
- **Punteggio persistente**: punti diversi in base al ruolo e all'esito della partita, con classifica che si mantiene tra le rivincite.
- **Rivincita**: rimescola ruoli e ordine dei giocatori mantenendo i punteggi.
- **Invalida turno**: possibilità di ripetere un turno se qualcosa è andato storto.

### Parole

248 coppie di parole in 16 categorie: Cibo, Bevande, Sport, Tecnologia, Luoghi, Animali, Oggetti, Professioni, Cinema, Abbigliamento, Cultura, Concetti, Fantasy, Giochi, Trasporti, Scienza.

## Gioca

**[Gioca ora](https://falker47.github.io/camaleonte/)**

Installa come PWA sul telefono per la migliore esperienza.

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion
- Zustand (state management)
- Vite 5 + vite-plugin-pwa

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

All Rights Reserved. Vedi [LICENSE](LICENSE) per i dettagli.
