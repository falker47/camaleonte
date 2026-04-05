import { useEffect, useState } from 'react'
import { useSpring, useTransform } from 'framer-motion'

export function useAnimatedValue(value: number, initialValue = value) {
  const spring = useSpring(initialValue, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, v => Math.round(v))
  const [displayValue, setDisplayValue] = useState(initialValue)

  useEffect(() => {
    spring.set(value)
    return display.on('change', v => setDisplayValue(v))
  }, [value, spring, display])

  return displayValue
}
