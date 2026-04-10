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

/** Riduce una parola italiana normalizzata a una radice comune per singolare/plurale. */
function italianStem(normalized: string): string {
  if (normalized.length <= 3) return normalized
  // -cia/-cie → -ci,  -gia/-gie → -gi  (ciliegia/ciliegie, frangia/frange)
  if (normalized.endsWith('cia') || normalized.endsWith('cie'))
    return normalized.slice(0, -2) + 'i'
  if (normalized.endsWith('gia') || normalized.endsWith('gie'))
    return normalized.slice(0, -2) + 'i'
  // Standard: togliere vocale finale → unifica -o/-i, -a/-e, -e/-i
  return normalized.replace(/[aeio]$/, '')
}

export function isWordMatch(guess: string, target: string, aliases?: string[]): boolean {
  const normalizedGuess = normalizeWord(guess)
  const stripSpaces = (s: string) => s.replace(/\s/g, '')

  const allTargets = [target, ...(aliases ?? [])].map(normalizeWord)

  for (const nt of allTargets) {
    // Match esatto (con e senza spazi)
    if (normalizedGuess === nt
      || stripSpaces(normalizedGuess) === stripSpaces(nt)) {
      return true
    }

    // Match per radice italiana (singolare/plurale)
    if (normalizedGuess.length > 2 && nt.length > 2
      && italianStem(normalizedGuess) === italianStem(nt)) {
      return true
    }

    // Fallback: match a significant keyword (>1 char, no stop words)
    if (normalizedGuess.length > 1) {
      const targetWords = nt.split(' ')
        .filter(w => w.length > 1 && !STOP_WORDS.has(w))
      if (targetWords.some(w => w === normalizedGuess
        || (w.length > 2 && italianStem(w) === italianStem(normalizedGuess)))) {
        return true
      }
    }
  }

  return false
}
