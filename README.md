# Undercover

Un gioco di deduzione sociale per 3-12 giocatori su un singolo dispositivo. Non serve internet.

## Come funziona

Ogni giocatore riceve una parola segreta. **Mr. White** non ha nessuna parola e deve bluffare. Gli **Infiltrati** ricevono una parola diversa ma non sanno di essere impostori. A turno, ogni giocatore dà un indizio di una sola parola per descrivere la propria, poi si vota per eliminare il sospettato. Trovate gli impostori prima che vi superino in numero!

### Ruoli

| Ruolo | Descrizione |
|-------|-------------|
| Civile | Conosce la parola principale. Deve individuare gli impostori. |
| Infiltrato | Ha una parola simile ma diversa. Non sa di essere un impostore. |
| Mr. White | Non ha nessuna parola. Deve bluffare e, se eliminato, può tentare di indovinare la parola dei civili per vincere. |

### Meccaniche

- **Indizi e voto**: a turno ogni giocatore dà un indizio di una parola, poi si vota per eliminare il sospettato.
- **Guess di Mr. White**: se eliminato, Mr. White ha 60 secondi per indovinare la parola dei civili e vincere.
- **Punteggio persistente**: punti diversi in base al ruolo e all'esito della partita, con classifica che si mantiene tra le rivincite.
- **Rivincita**: rimescola ruoli e ordine dei giocatori mantenendo i punteggi.
- **Invalida turno**: possibilità di ripetere un turno se qualcosa è andato storto.

### Parole

248 coppie di parole in 16 categorie: Cibo, Bevande, Sport, Tecnologia, Luoghi, Animali, Oggetti, Professioni, Cinema, Abbigliamento, Cultura, Concetti, Fantasy, Giochi, Trasporti, Scienza.

## Gioca

**[Gioca ora](https://falker47.github.io/undercover/)**

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
