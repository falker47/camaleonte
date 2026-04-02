import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'

export default function HomeScreen() {
  const goTo = useGameStore(s => s.goTo)

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-2">
        <div className="text-7xl">🕵️</div>
        <h1 className="text-4xl font-black text-white text-center">Mr. White</h1>
        <p className="text-slate-400 text-center text-sm max-w-xs">
          Il gioco di deduzione sociale per feste.
          Chi è l'impostore tra voi?
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <motion.button
          onClick={() => goTo('setup')}
          className="glass-button w-full font-bold py-5 rounded-2xl text-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Nuova Partita
        </motion.button>
      </div>

      <div className="glass rounded-2xl px-4 py-3 text-xs text-center max-w-xs mt-4">
        <p className="font-semibold text-slate-300 mb-1">Come si gioca</p>
        <p className="text-slate-400">Ogni giocatore riceve una parola segreta. Mr. White non ha nessuna parola. Descrivete la vostra parola con un solo indizio. Trovate Mr. White prima che lui scopra la vostra parola!</p>
      </div>
    </div>
  )
}
