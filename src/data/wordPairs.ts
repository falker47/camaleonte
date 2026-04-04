import type { WordPair } from '../store/types'

export const wordPairs: WordPair[] = [
  // ──── Bevande ────
  { civilian: 'Succo d\'arancia', undercover: 'Aranciata', category: 'Bevande' },
  { civilian: 'Caffè', undercover: 'Tè', category: 'Bevande' },
  { civilian: 'Birra', undercover: 'Vino', category: 'Bevande' },
  { civilian: 'Cappuccino', undercover: 'Cioccolata calda', category: 'Bevande' },

  // ──── Cibo ────
  { civilian: 'Pizza', undercover: 'Focaccia', category: 'Cibo' },
  { civilian: 'Hamburger', undercover: 'Patatine fritte', category: 'Cibo' },
  { civilian: 'Lasagne', undercover: 'Carbonara', category: 'Cibo' },
  { civilian: 'Riso', undercover: 'Pasta', category: 'Cibo' },
  { civilian: 'Pollo', undercover: 'Manzo', category: 'Cibo' },
  { civilian: 'Mela', undercover: 'Banana', category: 'Cibo' },
  { civilian: 'Cipolla', undercover: 'Aglio', category: 'Cibo' },
  { civilian: 'Peperoncino', undercover: 'Pepe', category: 'Cibo' },
  { civilian: 'Zucchero', undercover: 'Miele', category: 'Cibo' },
  { civilian: 'Tiramisù', undercover: 'Gelato', category: 'Cibo' },
  { civilian: 'Melanzana', undercover: 'Zucchina', category: 'Cibo' },
  { civilian: 'Patata', undercover: 'Pomodoro', category: 'Cibo' },
  { civilian: 'Salsiccia', undercover: 'Salame', category: 'Cibo' },
  { civilian: 'Pane', undercover: 'Cracker', category: 'Cibo' },
  { civilian: 'Nutella', undercover: 'Marmellata', category: 'Cibo' },

  // ──── Sport ────
  { civilian: 'Calcio', undercover: 'Rugby', category: 'Sport' },
  { civilian: 'Tennis', undercover: 'Badminton', category: 'Sport' },
  { civilian: 'Sci', undercover: 'Snowboard', category: 'Sport' },
  { civilian: 'Scherma', undercover: 'Tiro con l\'arco', category: 'Sport' },
  { civilian: 'Hockey', undercover: 'Baseball', category: 'Sport' },
  { civilian: 'Pallavolo', undercover: 'Basket', category: 'Sport' },
  { civilian: 'Surf', undercover: 'Skateboard', category: 'Sport' },
  { civilian: 'Bowling', undercover: 'Golf', category: 'Sport' },
  { civilian: 'Boxe', undercover: 'Karate', category: 'Sport' },

  // ──── Tecnologia ────
  { civilian: 'Instagram', undercover: 'TikTok', category: 'Tecnologia' },
  { civilian: 'PlayStation', undercover: 'Xbox', category: 'Tecnologia' },
  { civilian: 'Facebook', undercover: 'Twitter', category: 'Tecnologia' },
  { civilian: 'Smartphone', undercover: 'Tablet', category: 'Tecnologia' },
  { civilian: 'Netflix', undercover: 'YouTube', category: 'Tecnologia' },

  // ──── Luoghi ────
  { civilian: 'Roma', undercover: 'Napoli', category: 'Luoghi' },
  { civilian: 'Montagna', undercover: 'Collina', category: 'Luoghi' },
  { civilian: 'Aeroporto', undercover: 'Stazione', category: 'Luoghi' },
  { civilian: 'Supermercato', undercover: 'Mercato', category: 'Luoghi' },
  { civilian: 'Cinema', undercover: 'Teatro', category: 'Luoghi' },
  { civilian: 'Parigi', undercover: 'Londra', category: 'Luoghi' },
  { civilian: 'Spiaggia', undercover: 'Piscina', category: 'Luoghi' },
  { civilian: 'Biblioteca', undercover: 'Università', category: 'Luoghi' },
  { civilian: 'Museo', undercover: 'Galleria', category: 'Luoghi' },
  { civilian: 'Castello', undercover: 'Villa', category: 'Luoghi' },
  { civilian: 'Vulcano', undercover: 'Geyser', category: 'Luoghi' },
  { civilian: 'Deserto', undercover: 'Savana', category: 'Luoghi' },
  { civilian: 'Foresta', undercover: 'Parco', category: 'Luoghi' },
  { civilian: 'Oceano', undercover: 'Fiume', category: 'Luoghi' },
  { civilian: 'Lago', undercover: 'Stagno', category: 'Luoghi' },
  { civilian: 'Ponte', undercover: 'Tunnel', category: 'Luoghi' },
  { civilian: 'Paradiso', undercover: 'Oasi', category: 'Luoghi' },

  // ──── Animali ────
  { civilian: 'Gatto', undercover: 'Cane', category: 'Animali' },
  { civilian: 'Aquila', undercover: 'Piccione', category: 'Animali' },
  { civilian: 'Elefante', undercover: 'Rinoceronte', category: 'Animali' },
  { civilian: 'Leone', undercover: 'Tigre', category: 'Animali' },
  { civilian: 'Pappagallo', undercover: 'Corvo', category: 'Animali' },
  { civilian: 'Delfino', undercover: 'Squalo', category: 'Animali' },
  { civilian: 'Topo', undercover: 'Criceto', category: 'Animali' },
  { civilian: 'Lupo', undercover: 'Volpe', category: 'Animali' },
  { civilian: 'Medusa', undercover: 'Polpo', category: 'Animali' },
  { civilian: 'Pinguino', undercover: 'Gabbiano', category: 'Animali' },
  { civilian: 'Giraffa', undercover: 'Zebra', category: 'Animali' },
  { civilian: 'Pipistrello', undercover: 'Gufo', category: 'Animali' },
  { civilian: 'Fantasma', undercover: 'Zombie', category: 'Fantasy' },
  { civilian: 'Vampiro', undercover: 'Lupo mannaro', category: 'Fantasy' },

  // ──── Oggetti ────
  { civilian: 'Orologio', undercover: 'Sveglia', category: 'Oggetti' },
  { civilian: 'Zaino', undercover: 'Borsa', category: 'Oggetti' },
  { civilian: 'Coltello', undercover: 'Forbici', category: 'Oggetti' },
  { civilian: 'Libro', undercover: 'Rivista', category: 'Oggetti' },
  { civilian: 'Chitarra', undercover: 'Pianoforte', category: 'Oggetti' },
  { civilian: 'Matita', undercover: 'Penna', category: 'Oggetti' },
  { civilian: 'Candela', undercover: 'Lanterna', category: 'Oggetti' },
  { civilian: 'Specchio', undercover: 'Vetro', category: 'Oggetti' },
  { civilian: 'Sedia', undercover: 'Panchina', category: 'Oggetti' },
  { civilian: 'Cuscino', undercover: 'Coperta', category: 'Oggetti' },
  { civilian: 'Cucchiaio', undercover: 'Forchetta', category: 'Oggetti' },
  { civilian: 'Piatto', undercover: 'Ciotola', category: 'Oggetti' },
  { civilian: 'Lampada', undercover: 'Torcia', category: 'Oggetti' },
  { civilian: 'Collana', undercover: 'Braccialetto', category: 'Oggetti' },
  { civilian: 'Ombrello', undercover: 'Ombrellone', category: 'Oggetti' },

  // ──── Professioni ────
  { civilian: 'Dottore', undercover: 'Infermiere', category: 'Professioni' },
  { civilian: 'Cuoco', undercover: 'Pasticciere', category: 'Professioni' },
  { civilian: 'Avvocato', undercover: 'Giudice', category: 'Professioni' },
  { civilian: 'Pompiere', undercover: 'Poliziotto', category: 'Professioni' },
  { civilian: 'Ingegnere', undercover: 'Architetto', category: 'Professioni' },
  { civilian: 'Pilota', undercover: 'Astronauta', category: 'Professioni' },
  { civilian: 'Panettiere', undercover: 'Pizzaiolo', category: 'Professioni' },
  { civilian: 'Contadino', undercover: 'Pescatore', category: 'Professioni' },
  { civilian: 'Fabbro', undercover: 'Falegname', category: 'Professioni' },

  // ──── Cinema / Personaggi ────
  { civilian: 'Superman', undercover: 'Batman', category: 'Cinema' },
  { civilian: 'Harry Potter', undercover: 'Mago Merlino', category: 'Cinema' },
  { civilian: 'Dracula', undercover: 'Frankenstein', category: 'Cinema' },
  { civilian: 'Godzilla', undercover: 'King Kong', category: 'Cinema' },
  { civilian: 'Pinocchio', undercover: 'Peter Pan', category: 'Cinema' },
  { civilian: 'Shrek', undercover: 'Toy Story', category: 'Cinema' },


  // ──── Abbigliamento ────
  { civilian: 'Camicia', undercover: 'Maglione', category: 'Abbigliamento' },
  { civilian: 'Stivali', undercover: 'Sandali', category: 'Abbigliamento' },
  { civilian: 'Casco', undercover: 'Cappello', category: 'Abbigliamento' },
  { civilian: 'Sciarpa', undercover: 'Cravatta', category: 'Abbigliamento' },
  { civilian: 'Guanti', undercover: 'Calzini', category: 'Abbigliamento' },
  { civilian: 'Pigiama', undercover: 'Accappatoio', category: 'Abbigliamento' },

  // ──── Musica / Cultura ────
  { civilian: 'Picasso', undercover: 'Van Gogh', category: 'Cultura' },
  { civilian: 'Leonardo da Vinci', undercover: 'Michelangelo', category: 'Cultura' },
  { civilian: 'Napoleone', undercover: 'Giulio Cesare', category: 'Cultura' },
  { civilian: 'Lionel Messi', undercover: 'Cristiano Ronaldo', category: 'Cultura' },
  { civilian: 'Radio', undercover: 'Podcast', category: 'Cultura' },
  { civilian: 'Romanzo', undercover: 'Poesia', category: 'Cultura' },
  { civilian: 'Quadro', undercover: 'Disegno', category: 'Cultura' },

  // ──── Giochi / Svago ────
  { civilian: 'Risiko', undercover: 'Monopoly', category: 'Giochi' },
  { civilian: 'Poker', undercover: 'Blackjack', category: 'Giochi' },
  { civilian: 'Puzzle', undercover: 'Cruciverba', category: 'Giochi' },
  { civilian: 'Scacchi', undercover: 'Dama', category: 'Giochi' },

  // ──── Trasporti ────
  { civilian: 'Auto', undercover: 'Moto', category: 'Trasporti' },
  { civilian: 'Treno', undercover: 'Autobus', category: 'Trasporti' },
  { civilian: 'Aereo', undercover: 'Elicottero', category: 'Trasporti' },
  { civilian: 'Bicicletta', undercover: 'Monopattino', category: 'Trasporti' },
  { civilian: 'Barca', undercover: 'Sottomarino', category: 'Trasporti' },
  { civilian: 'Ascensore', undercover: 'Scale', category: 'Trasporti' },
  { civilian: 'Metro', undercover: 'Taxi', category: 'Trasporti' },
  { civilian: 'Crociera', undercover: 'Nave', category: 'Trasporti' },

  // ──── Scienza / Natura ────
  { civilian: 'Sole', undercover: 'Luna', category: 'Scienza' },
  { civilian: 'Pianeta', undercover: 'Stella', category: 'Scienza' },
  { civilian: 'Terremoto', undercover: 'Tsunami', category: 'Scienza' },
  { civilian: 'Cometa', undercover: 'Asteroide', category: 'Scienza' },
  { civilian: 'Nuvola', undercover: 'Nebbia', category: 'Scienza' },
  { civilian: 'Neve', undercover: 'Grandine', category: 'Scienza' },
  { civilian: 'Virus', undercover: 'Batterio', category: 'Scienza' },
  { civilian: 'Oro', undercover: 'Argento', category: 'Scienza' },

  // ──── Concetti ────
  { civilian: 'Lavoro', undercover: 'Hobby', category: 'Concetti' },
]
