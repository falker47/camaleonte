const STOP_WORDS = new Set([
  'di', 'da', 'del', 'della', 'delle', 'dei', 'degli',
  'con', 'per', 'tra', 'fra', 'il', 'lo', 'la', 'le', 'gli', 'un', 'una', 'uno',
  'the', 'of', 'and',
])

export function normalizeWord(s: string): string {
  return s.trim().toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['\u2019\-]/g, '')
    .replace(/\s+/g, ' ')
}

export function isWordMatch(guess: string, target: string): boolean {
  const normalizedGuess = normalizeWord(guess)
  const normalizedTarget = normalizeWord(target)

  const stripSpaces = (s: string) => s.replace(/\s/g, '')

  if (normalizedGuess === normalizedTarget
    || stripSpaces(normalizedGuess) === stripSpaces(normalizedTarget)) {
    return true
  }

  // Fallback: match a significant keyword (>1 char, no stop words)
  if (normalizedGuess.length > 1) {
    const targetWords = normalizedTarget.split(' ')
      .filter(w => w.length > 1 && !STOP_WORDS.has(w))
    if (targetWords.some(w => w === normalizedGuess)) return true
  }

  return false
}
