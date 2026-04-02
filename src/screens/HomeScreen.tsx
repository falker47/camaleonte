import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { usePwaInstall } from '../hooks/usePwaInstall'
import Tutorial from '../components/Tutorial'

export default function HomeScreen() {
  const goTo = useGameStore(s => s.goTo)
  const { canInstall, install } = usePwaInstall()
  const [showTutorial, setShowTutorial] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-2">
        <div className="text-7xl">🕵️</div>
        <h1 className="text-4xl font-black text-white text-center">Undercover</h1>
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

        <div className="flex gap-3">
          <motion.button
            onClick={() => setShowTutorial(true)}
            className="glass-button-secondary flex-1 py-3 rounded-2xl text-sm transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            Come si gioca
          </motion.button>

          {canInstall && (
            <motion.button
              onClick={install}
              className="glass-button-secondary flex-1 py-3 rounded-2xl text-sm transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              Installa App
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>
    </div>
  )
}
