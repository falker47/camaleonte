/**
 * Mappa di sinonimi accettati per il guess del Camaleonte.
 * Chiave: parola esattamente come appare in wordPairs.ts (case-sensitive).
 * Valore: lista di sinonimi accettabili.
 *
 * Non serve inserire singolari/plurali regolari: lo stemming italiano
 * in matchWord.ts li gestisce automaticamente.
 */
const WORD_ALIASES: Record<string, string[]> = {
  // Animali
  'Polpo': ['Piovra'],
  'Topo': ['Ratto'],

  // Bevande
  'Frullato': ['Smoothie'],

  // Cibo
  'Anguria': ['Cocomero'],

  // Concetti
  'Sbornia': ['Sbronza', 'Ubriacatura'],

  // Oggetti
  'Lente d\'ingrandimento': ['Lente'],
  'Navigatore GPS': ['GPS', 'Navigatore'],
  'Climatizzatore': ['Condizionatore', 'Aria condizionata'],
  'Stampella': ['Gruccia', 'Stampelle'],
  'Sedia a Rotelle': ['Carrozzina', 'Carrozzella'],

  // Professioni
  'Dottore': ['Medico'],
  'Cuoco': ['Chef'],

  // Sport
  'Calciobalilla': ['Biliardino', 'Calcetto', 'Calcio balilla'],
  'Ping Pong': ['Tennis da tavolo', 'Tennistavolo'],

  // Tecnologia
  'Smartphone': ['Cellulare', 'Telefonino'],
  'Computer portatile': ['Portatile', 'Laptop'],
  'Televisione': ['TV', 'Tele'],
  'Email': ['Mail', 'Posta elettronica'],
  'Sms': ['Messaggio'],

  // Trasporti
  'Bicicletta': ['Bici'],
  'Moto': ['Motocicletta'],
  'Automobile': ['Macchina', 'Auto'],

  // Nomi Propri
  'Capitan America': ['Captain America', 'Cap'],
  'Spider Man': ['Uomo Ragno'],
  'Topolino': ['Mickey Mouse'],
  'Paperino': ['Donald Duck'],
  'Cenerentola': ['Cinderella'],
  'Biancaneve': ['Snow White'],
  'La Bella Addormentata': ['Sleeping Beauty'],
  'La Sirenetta': ['The Little Mermaid'],
  'Il Re Leone': ['The Lion King'],
  'Il Libro Della Giungla': ['The Jungle Book'],
  'La Bella e la Bestia': ['Beauty and the Beast'],
  'Aladdin': ['Aladino'],
}

export function getAliases(word: string): string[] | undefined {
  return WORD_ALIASES[word]
}
