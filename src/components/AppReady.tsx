import { useLayoutEffect } from 'react'
import { markAppReady } from '../lib/launch'

/** A sibling of App so a rendered error boundary can also dismiss launch. */
export default function AppReady() {
  useLayoutEffect(markAppReady, [])
  return null
}
