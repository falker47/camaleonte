export function vibrate(ms = 15): void {
  try {
    navigator?.vibrate?.(ms)
  } catch {
    // Silently fail on unsupported devices
  }
}
