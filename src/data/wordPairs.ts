import type { WordPair } from '../store/types'

export const wordPairs: WordPair[] = [
  // Bevande
  { civilian: 'Coca-Cola', undercover: 'Pepsi', category: 'Bevande' },
  { civilian: 'Vino rosso', undercover: 'Vino bianco', category: 'Bevande' },
  { civilian: 'Birra', undercover: 'Sidro', category: 'Bevande' },
  { civilian: 'Caffè', undercover: 'Espresso', category: 'Bevande' },
  { civilian: 'Acqua frizzante', undercover: 'Acqua naturale', category: 'Bevande' },
  { civilian: 'Succo d\'arancia', undercover: 'Aranciata', category: 'Bevande' },
  { civilian: 'Tè freddo', undercover: 'Tè caldo', category: 'Bevande' },

  // Cibo
  { civilian: 'Pizza', undercover: 'Focaccia', category: 'Cibo' },
  { civilian: 'Spaghetti', undercover: 'Linguine', category: 'Cibo' },
  { civilian: 'Gelato', undercover: 'Sorbetto', category: 'Cibo' },
  { civilian: 'Tiramisù', undercover: 'Charlotte', category: 'Cibo' },
  { civilian: 'Panino', undercover: 'Tramezzino', category: 'Cibo' },
  { civilian: 'Nutella', undercover: 'Crema di nocciole', category: 'Cibo' },
  { civilian: 'Patatine fritte', undercover: 'Chips', category: 'Cibo' },
  { civilian: 'Cornetto', undercover: 'Brioche', category: 'Cibo' },
  { civilian: 'Lasagne', undercover: 'Cannelloni', category: 'Cibo' },
  { civilian: 'Risotto', undercover: 'Pilaf', category: 'Cibo' },

  // Sport
  { civilian: 'Calcio', undercover: 'Rugby', category: 'Sport' },
  { civilian: 'Tennis', undercover: 'Badminton', category: 'Sport' },
  { civilian: 'Nuoto', undercover: 'Pallanuoto', category: 'Sport' },
  { civilian: 'Sci', undercover: 'Snowboard', category: 'Sport' },
  { civilian: 'Ciclismo', undercover: 'BMX', category: 'Sport' },
  { civilian: 'Pallavolo', undercover: 'Beach volley', category: 'Sport' },
  { civilian: 'Boxe', undercover: 'Kickboxing', category: 'Sport' },
  { civilian: 'Maratona', undercover: 'Triathlon', category: 'Sport' },

  // Tecnologia
  { civilian: 'iPhone', undercover: 'Samsung Galaxy', category: 'Tecnologia' },
  { civilian: 'WhatsApp', undercover: 'Telegram', category: 'Tecnologia' },
  { civilian: 'Netflix', undercover: 'Disney+', category: 'Tecnologia' },
  { civilian: 'Instagram', undercover: 'TikTok', category: 'Tecnologia' },
  { civilian: 'Google', undercover: 'Bing', category: 'Tecnologia' },
  { civilian: 'PlayStation', undercover: 'Xbox', category: 'Tecnologia' },
  { civilian: 'Windows', undercover: 'Mac OS', category: 'Tecnologia' },
  { civilian: 'YouTube', undercover: 'Twitch', category: 'Tecnologia' },

  // Luoghi
  { civilian: 'Roma', undercover: 'Napoli', category: 'Luoghi' },
  { civilian: 'Spiaggia', undercover: 'Lago', category: 'Luoghi' },
  { civilian: 'Montagna', undercover: 'Collina', category: 'Luoghi' },
  { civilian: 'Ospedale', undercover: 'Clinica', category: 'Luoghi' },
  { civilian: 'Aeroporto', undercover: 'Stazione', category: 'Luoghi' },
  { civilian: 'Supermercato', undercover: 'Mercato', category: 'Luoghi' },
  { civilian: 'Cinema', undercover: 'Teatro', category: 'Luoghi' },
  { civilian: 'Palestra', undercover: 'Piscina', category: 'Luoghi' },

  // Animali
  { civilian: 'Gatto', undercover: 'Ghepardo', category: 'Animali' },
  { civilian: 'Cane', undercover: 'Lupo', category: 'Animali' },
  { civilian: 'Delfino', undercover: 'Foca', category: 'Animali' },
  { civilian: 'Aquila', undercover: 'Falco', category: 'Animali' },
  { civilian: 'Elefante', undercover: 'Rinoceronte', category: 'Animali' },
  { civilian: 'Leone', undercover: 'Tigre', category: 'Animali' },
  { civilian: 'Pappagallo', undercover: 'Corvo', category: 'Animali' },

  // Oggetti
  { civilian: 'Ombrello', undercover: 'Impermeabile', category: 'Oggetti' },
  { civilian: 'Orologio', undercover: 'Sveglia', category: 'Oggetti' },
  { civilian: 'Zaino', undercover: 'Borsa', category: 'Oggetti' },
  { civilian: 'Coltello', undercover: 'Forbici', category: 'Oggetti' },
  { civilian: 'Libro', undercover: 'Rivista', category: 'Oggetti' },
  { civilian: 'Chitarra', undercover: 'Basso', category: 'Oggetti' },
  { civilian: 'Tenda', undercover: 'Sacco a pelo', category: 'Oggetti' },

  // Professioni
  { civilian: 'Dottore', undercover: 'Infermiere', category: 'Professioni' },
  { civilian: 'Poliziotto', undercover: 'Carabiniere', category: 'Professioni' },
  { civilian: 'Cuoco', undercover: 'Pasticciere', category: 'Professioni' },
  { civilian: 'Maestro', undercover: 'Professore', category: 'Professioni' },
  { civilian: 'Avvocato', undercover: 'Giudice', category: 'Professioni' },
  { civilian: 'Pompiere', undercover: 'Soccorritore', category: 'Professioni' },

  // Cinema / Personaggi
  { civilian: 'Superman', undercover: 'Batman', category: 'Cinema' },
  { civilian: 'Disney', undercover: 'Pixar', category: 'Cinema' },
  { civilian: 'Spider-Man', undercover: 'Ant-Man', category: 'Cinema' },
  { civilian: 'Joker', undercover: 'Harley Quinn', category: 'Cinema' },
  { civilian: 'James Bond', undercover: 'Jason Bourne', category: 'Cinema' },
]
