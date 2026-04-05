import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { MAX_PARTICLES } from '../constants/gameConfig'

interface Props {
  count?: number
  colors: string[]
  origin?: 'center' | 'top'
  style?: 'burst' | 'fall'
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

interface ParticleData {
  id: number
  color: string
  x: number
  y: number
  size: number
  delay: number
  angle: number
  distance: number
}

export default function Particles({ count = 20, colors, origin = 'center', style = 'burst' }: Props) {
  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: Math.min(count, MAX_PARTICLES) }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: style === 'fall' ? randomBetween(5, 95) : 50,
      y: origin === 'top' ? -5 : 50,
      size: randomBetween(4, 8),
      delay: randomBetween(0, 0.3),
      angle: randomBetween(0, 360),
      distance: randomBetween(60, 150),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, colors.join(','), origin, style])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => {
        if (style === 'burst') {
          const rad = (p.angle * Math.PI) / 180
          const endX = Math.cos(rad) * p.distance
          const endY = Math.sin(rad) * p.distance + 40

          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: endX,
                y: endY,
                opacity: 0,
                scale: 0.3,
              }}
              transition={{
                duration: 1.2,
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          )
        }

        const swayX = randomBetween(-30, 30)
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: `${p.x}%`,
              top: '-2%',
            }}
            initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
            animate={{
              y: '110vh',
              x: [0, swayX, -swayX, swayX * 0.5],
              opacity: [1, 1, 0.8, 0],
              rotate: randomBetween(-180, 180),
            }}
            transition={{
              duration: randomBetween(2, 3),
              delay: p.delay,
              ease: 'easeIn',
            }}
          />
        )
      })}
    </div>
  )
}
