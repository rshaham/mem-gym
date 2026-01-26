import type { SemanticChainCategory } from '../types';
import {
  isReady as isEmbeddingsReady,
  isValidWordEmbedding,
  isKnownWord,
} from '../utils/embeddings';

/**
 * Core word lists for Semantic Chain game.
 * These serve as:
 * 1. Starting words (game provides first word)
 * 2. Fallback when embeddings not loaded
 * 3. High-confidence matches (always valid)
 *
 * When embeddings are loaded, words not in these lists
 * are validated using semantic similarity.
 */
export const CATEGORY_WORDS: Record<SemanticChainCategory, string[]> = {
  animals: [
    'aardvark', 'albatross', 'alligator', 'antelope', 'ape', 'armadillo',
    'baboon', 'badger', 'bat', 'bear', 'beaver', 'beetle', 'bison', 'boar', 'buffalo',
    'camel', 'canary', 'caribou', 'cat', 'caterpillar', 'cheetah', 'chicken', 'chimpanzee', 'cobra', 'cod', 'coyote', 'crab', 'crane', 'crocodile', 'crow',
    'deer', 'dog', 'dolphin', 'donkey', 'dove', 'dragonfly', 'duck',
    'eagle', 'eel', 'elephant', 'elk', 'emu',
    'falcon', 'ferret', 'finch', 'flamingo', 'fly', 'fox', 'frog',
    'gazelle', 'gerbil', 'giraffe', 'goat', 'goldfish', 'goose', 'gorilla', 'grasshopper',
    'hamster', 'hare', 'hawk', 'hedgehog', 'heron', 'hippopotamus', 'hornet', 'horse', 'hummingbird', 'hyena',
    'iguana', 'impala',
    'jackal', 'jaguar', 'jellyfish',
    'kangaroo', 'kingfisher', 'kiwi', 'koala',
    'ladybug', 'lamb', 'lemur', 'leopard', 'lion', 'lizard', 'llama', 'lobster', 'locust', 'lynx',
    'macaw', 'magpie', 'manatee', 'meerkat', 'mole', 'mongoose', 'monkey', 'moose', 'mosquito', 'moth', 'mouse', 'mule',
    'newt', 'nightingale',
    'octopus', 'opossum', 'orangutan', 'orca', 'ostrich', 'otter', 'owl', 'ox', 'oyster',
    'panda', 'panther', 'parrot', 'peacock', 'pelican', 'penguin', 'pheasant', 'pig', 'pigeon', 'piranha', 'platypus', 'porcupine', 'puma',
    'quail',
    'rabbit', 'raccoon', 'ram', 'rat', 'raven', 'reindeer', 'rhinoceros', 'robin', 'rooster',
    'salamander', 'salmon', 'sardine', 'scorpion', 'seahorse', 'seal', 'shark', 'sheep', 'shrimp', 'skunk', 'sloth', 'snail', 'snake', 'sparrow', 'spider', 'squid', 'squirrel', 'starfish', 'stork', 'swallow', 'swan',
    'tapir', 'termite', 'tiger', 'toad', 'toucan', 'trout', 'turkey', 'turtle',
    'viper', 'vulture',
    'walrus', 'wasp', 'weasel', 'whale', 'wolf', 'wombat', 'woodpecker', 'worm',
    'yak',
    'zebra',
  ],

  foods: [
    'almond', 'anchovy', 'apple', 'apricot', 'artichoke', 'asparagus', 'avocado',
    'bacon', 'bagel', 'banana', 'barley', 'basil', 'bean', 'beef', 'beet', 'berry', 'biscuit', 'blackberry', 'blueberry', 'bread', 'broccoli', 'brownie', 'butter',
    'cabbage', 'cake', 'candy', 'cantaloupe', 'caramel', 'carrot', 'cashew', 'cauliflower', 'celery', 'cereal', 'cheese', 'cherry', 'chicken', 'chickpea', 'chili', 'chip', 'chocolate', 'cinnamon', 'clam', 'coconut', 'cookie', 'corn', 'cracker', 'cranberry', 'cream', 'croissant', 'cucumber', 'cupcake', 'curry',
    'date', 'doughnut', 'dumpling',
    'edamame', 'egg', 'eggplant',
    'fennel', 'fig', 'fish', 'flour', 'fudge',
    'garlic', 'ginger', 'grape', 'grapefruit', 'gravy', 'guava',
    'ham', 'hamburger', 'hazelnut', 'herb', 'honey', 'hummus',
    'ice',
    'jam', 'jelly',
    'kale', 'ketchup', 'kiwi',
    'lamb', 'lasagna', 'leek', 'lemon', 'lemonade', 'lentil', 'lettuce', 'lime', 'lobster',
    'macaroni', 'mango', 'maple', 'marshmallow', 'mayonnaise', 'meat', 'melon', 'milk', 'mint', 'muffin', 'mushroom', 'mussel', 'mustard',
    'naan', 'nacho', 'nectarine', 'noodle', 'nut', 'nutmeg',
    'oat', 'olive', 'onion', 'orange', 'oregano', 'oyster',
    'pancake', 'papaya', 'parsley', 'pasta', 'peach', 'peanut', 'pear', 'pea', 'pecan', 'pepper', 'pickle', 'pie', 'pineapple', 'pistachio', 'pizza', 'plum', 'pomegranate', 'popcorn', 'pork', 'potato', 'pretzel', 'prune', 'pumpkin',
    'quinoa',
    'radish', 'raisin', 'raspberry', 'rice', 'roll', 'rosemary',
    'salad', 'salmon', 'salsa', 'salt', 'sandwich', 'sardine', 'sauce', 'sausage', 'scallop', 'shrimp', 'soup', 'spinach', 'squash', 'steak', 'strawberry', 'sugar', 'sushi', 'syrup',
    'taco', 'tangerine', 'tea', 'toast', 'tofu', 'tomato', 'tortilla', 'truffle', 'tuna', 'turkey',
    'vanilla', 'veal', 'vinegar',
    'waffle', 'walnut', 'watermelon', 'wheat', 'wine',
    'yam', 'yogurt',
    'zucchini',
  ],

  countries: [
    'afghanistan', 'albania', 'algeria', 'andorra', 'angola', 'argentina', 'armenia', 'australia', 'austria', 'azerbaijan',
    'bahamas', 'bahrain', 'bangladesh', 'barbados', 'belarus', 'belgium', 'belize', 'benin', 'bhutan', 'bolivia', 'botswana', 'brazil', 'brunei', 'bulgaria', 'burundi',
    'cambodia', 'cameroon', 'canada', 'chad', 'chile', 'china', 'colombia', 'comoros', 'congo', 'croatia', 'cuba', 'cyprus', 'czechia',
    'denmark', 'djibouti', 'dominica',
    'ecuador', 'egypt', 'eritrea', 'estonia', 'eswatini', 'ethiopia',
    'fiji', 'finland', 'france',
    'gabon', 'gambia', 'georgia', 'germany', 'ghana', 'greece', 'grenada', 'guatemala', 'guinea', 'guyana',
    'haiti', 'honduras', 'hungary',
    'iceland', 'india', 'indonesia', 'iran', 'iraq', 'ireland', 'israel', 'italy',
    'jamaica', 'japan', 'jordan',
    'kazakhstan', 'kenya', 'kiribati', 'kuwait', 'kyrgyzstan',
    'laos', 'latvia', 'lebanon', 'lesotho', 'liberia', 'libya', 'liechtenstein', 'lithuania', 'luxembourg',
    'madagascar', 'malawi', 'malaysia', 'maldives', 'mali', 'malta', 'mauritania', 'mauritius', 'mexico', 'micronesia', 'moldova', 'monaco', 'mongolia', 'montenegro', 'morocco', 'mozambique', 'myanmar',
    'namibia', 'nauru', 'nepal', 'netherlands', 'nicaragua', 'niger', 'nigeria', 'norway',
    'oman',
    'pakistan', 'palau', 'panama', 'paraguay', 'peru', 'philippines', 'poland', 'portugal',
    'qatar',
    'romania', 'russia', 'rwanda',
    'samoa', 'senegal', 'serbia', 'seychelles', 'singapore', 'slovakia', 'slovenia', 'somalia', 'spain', 'sudan', 'suriname', 'sweden', 'switzerland', 'syria',
    'taiwan', 'tajikistan', 'tanzania', 'thailand', 'togo', 'tonga', 'tunisia', 'turkey', 'turkmenistan', 'tuvalu',
    'uganda', 'ukraine', 'uruguay', 'uzbekistan',
    'vanuatu', 'vatican', 'venezuela', 'vietnam',
    'yemen',
    'zambia', 'zimbabwe',
  ],

  colors: [
    'amber', 'amethyst', 'apricot', 'aqua', 'aquamarine', 'auburn', 'azure',
    'beige', 'bisque', 'black', 'blonde', 'blue', 'blush', 'brass', 'bronze', 'brown', 'buff', 'burgundy',
    'camel', 'caramel', 'cardinal', 'carmine', 'carnation', 'celadon', 'cerise', 'cerulean', 'champagne', 'charcoal', 'chartreuse', 'chestnut', 'chocolate', 'cinnamon', 'citrine', 'claret', 'cobalt', 'cocoa', 'coffee', 'copper', 'coral', 'cordovan', 'corn', 'cornflower', 'cream', 'crimson', 'cyan',
    'denim', 'desert',
    'ebony', 'ecru', 'eggplant', 'eggshell', 'electric', 'emerald',
    'fawn', 'fern', 'firebrick', 'flame', 'flax', 'forest', 'fuchsia',
    'garnet', 'ginger', 'gold', 'goldenrod', 'grape', 'graphite', 'gray', 'green',
    'hazel', 'heather', 'honeydew', 'hunter',
    'ice', 'indigo', 'ivory',
    'jade', 'jasmine', 'jet',
    'khaki',
    'lavender', 'lemon', 'licorice', 'lilac', 'lime', 'linen',
    'magenta', 'mahogany', 'mango', 'maroon', 'mauve', 'melon', 'midnight', 'mint', 'mocha', 'moss', 'mulberry', 'mustard',
    'navy', 'nude',
    'ochre', 'olive', 'onyx', 'opal', 'orange', 'orchid',
    'paprika', 'peach', 'pear', 'pearl', 'periwinkle', 'persimmon', 'pewter', 'pink', 'pistachio', 'platinum', 'plum', 'powder', 'puce', 'pumpkin', 'purple',
    'raspberry', 'red', 'rose', 'rouge', 'royal', 'ruby', 'russet', 'rust',
    'saffron', 'sage', 'salmon', 'sand', 'sangria', 'sapphire', 'scarlet', 'seashell', 'sepia', 'shamrock', 'sienna', 'silver', 'sky', 'slate', 'smoke', 'snow', 'steel', 'strawberry', 'sunflower',
    'tan', 'tangerine', 'taupe', 'teal', 'terracotta', 'thistle', 'tomato', 'topaz', 'turquoise',
    'ultramarine', 'umber',
    'vanilla', 'vermilion', 'violet', 'viridian',
    'walnut', 'wheat', 'white', 'wine', 'wisteria',
    'xanadu',
    'yellow',
    'zinc',
  ],

  occupations: [
    'accountant', 'actor', 'actuary', 'administrator', 'agent', 'analyst', 'animator', 'announcer', 'appraiser', 'architect', 'artist', 'astronaut', 'astronomer', 'athlete', 'attorney', 'auditor',
    'baker', 'banker', 'barber', 'bartender', 'biologist', 'blacksmith', 'blogger', 'bookkeeper', 'botanist', 'bricklayer', 'broadcaster', 'broker', 'butcher',
    'captain', 'cardiologist', 'caregiver', 'carpenter', 'cartographer', 'cashier', 'caterer', 'chef', 'chemist', 'choreographer', 'cinematographer', 'clerk', 'coach', 'comedian', 'composer', 'consultant', 'contractor', 'cook', 'copywriter', 'coroner', 'counselor', 'curator',
    'dancer', 'decorator', 'dentist', 'designer', 'detective', 'developer', 'dietitian', 'diplomat', 'director', 'diver', 'doctor', 'doorman', 'driver',
    'ecologist', 'economist', 'editor', 'electrician', 'embalmer', 'engineer', 'entertainer', 'entrepreneur', 'examiner', 'explorer',
    'farmer', 'firefighter', 'fisherman', 'florist', 'forester',
    'gardener', 'geographer', 'geologist', 'glazier', 'goldsmith', 'governor', 'grocer', 'guide',
    'hairdresser', 'handyman', 'herbalist', 'historian', 'hostess', 'hydrologist',
    'illustrator', 'inspector', 'instructor', 'interpreter', 'investigator',
    'janitor', 'jeweler', 'jockey', 'journalist', 'judge',
    'landscaper', 'lawyer', 'lecturer', 'librarian', 'lifeguard', 'linguist', 'locksmith', 'lyricist',
    'machinist', 'magician', 'manager', 'manufacturer', 'marketer', 'mason', 'mathematician', 'mechanic', 'mediator', 'meteorologist', 'midwife', 'miner', 'missionary', 'model', 'mortician', 'musician',
    'nanny', 'navigator', 'negotiator', 'neurologist', 'notary', 'nurse', 'nutritionist',
    'obstetrician', 'oncologist', 'operator', 'optician', 'optometrist', 'orator', 'organizer', 'orthodontist',
    'painter', 'paralegal', 'paramedic', 'pathologist', 'pediatrician', 'pharmacist', 'philosopher', 'photographer', 'physician', 'physicist', 'pilot', 'planner', 'plumber', 'poet', 'politician', 'porter', 'priest', 'principal', 'printer', 'producer', 'professor', 'programmer', 'promoter', 'psychiatrist', 'psychologist', 'publicist', 'publisher',
    'radiologist', 'rancher', 'ranger', 'realtor', 'receptionist', 'recruiter', 'referee', 'registrar', 'reporter', 'researcher', 'retailer',
    'sailor', 'salesman', 'sanitarian', 'scientist', 'sculptor', 'secretary', 'senator', 'sheriff', 'singer', 'sociologist', 'soldier', 'solicitor', 'sommelier', 'specialist', 'statistician', 'steward', 'stockbroker', 'stonemason', 'strategist', 'stylist', 'superintendent', 'supervisor', 'surgeon', 'surveyor',
    'tailor', 'taxidermist', 'teacher', 'technician', 'therapist', 'trader', 'trainer', 'translator', 'treasurer', 'tutor',
    'underwriter', 'upholsterer', 'urologist', 'usher',
    'valet', 'vendor', 'veterinarian', 'videographer', 'vintner',
    'waiter', 'warden', 'welder', 'wholesaler', 'woodworker', 'writer',
    'zoologist',
  ],

  science: [
    'acid', 'adaptation', 'algorithm', 'alloy', 'amino', 'ampere', 'anatomy', 'antibiotic', 'antigen', 'asteroid', 'atmosphere', 'atom', 'aurora',
    'bacteria', 'barometer', 'biodiversity', 'biology', 'biome', 'botany',
    'calcium', 'calorie', 'carbon', 'catalyst', 'cell', 'centrifuge', 'chemistry', 'chlorophyll', 'chromosome', 'climate', 'compound', 'conduction', 'coral', 'cortex', 'cosmic', 'crystal', 'cytoplasm',
    'density', 'diffusion', 'dinosaur', 'dna',
    'earthquake', 'eclipse', 'ecosystem', 'electricity', 'electron', 'element', 'embryo', 'emission', 'energy', 'entropy', 'enzyme', 'erosion', 'evolution', 'experiment',
    'fauna', 'fission', 'flora', 'force', 'formula', 'fossil', 'frequency', 'friction', 'fungus', 'fusion',
    'galaxy', 'gene', 'genetics', 'geology', 'germ', 'glacier', 'glucose', 'gravity',
    'habitat', 'halogen', 'helium', 'hemisphere', 'heredity', 'hormone', 'humidity', 'hydrogen', 'hypothesis',
    'immunity', 'inertia', 'infrared', 'insulation', 'ion', 'isotope',
    'joule',
    'kelvin', 'kinetic',
    'laser', 'latitude', 'lava', 'longitude',
    'magnet', 'magnitude', 'mammal', 'mass', 'matter', 'membrane', 'metabolism', 'meteor', 'microbe', 'microscope', 'mineral', 'mitosis', 'molecule', 'momentum', 'mutation',
    'nebula', 'neuron', 'neutron', 'nitrogen', 'nucleus', 'nutrient',
    'orbit', 'organ', 'organism', 'osmosis', 'oxygen', 'ozone',
    'parasite', 'particle', 'pathogen', 'periodic', 'petroleum', 'photon', 'photosynthesis', 'physics', 'plasma', 'pollination', 'polymer', 'predator', 'pressure', 'prism', 'protein', 'proton',
    'quantum', 'quark', 'quasar',
    'radiation', 'radioactive', 'reactor', 'recessive', 'reflection', 'refraction', 'relativity', 'reproduction', 'respiration', 'ribosome',
    'satellite', 'sediment', 'seismic', 'semiconductor', 'solar', 'solvent', 'sound', 'species', 'spectrum', 'spore', 'stimulus', 'stratum', 'supernova', 'symbiosis', 'synapse',
    'taxonomy', 'temperature', 'theory', 'thermodynamics', 'tissue', 'tornado', 'toxin', 'tsunami',
    'ultraviolet', 'universe',
    'vaccine', 'vacuum', 'vapor', 'velocity', 'vertebrate', 'virus', 'viscosity', 'volcano', 'volt', 'volume',
    'watt', 'wavelength', 'weathering',
    'xenon',
    'yeast',
    'zoology',
  ],

  psychology: [
    'abstraction', 'addiction', 'adolescence', 'affect', 'aggression', 'amnesia', 'amygdala', 'analysis', 'anger', 'anxiety', 'apathy', 'arousal', 'assertion', 'attachment', 'attention', 'attitude', 'attribution', 'autism', 'autonomy', 'aversion',
    'behavior', 'belief', 'bias', 'bonding', 'boredom', 'burnout',
    'catharsis', 'cognition', 'compassion', 'complex', 'compulsion', 'conditioning', 'confidence', 'conflict', 'conformity', 'consciousness', 'coping', 'cortisol', 'creativity', 'crisis',
    'defense', 'delusion', 'denial', 'depression', 'desire', 'development', 'deviance', 'disgust', 'dissociation', 'distress', 'dopamine', 'dream', 'drive', 'dysfunction',
    'ego', 'emotion', 'empathy', 'endorphin', 'envy', 'esteem', 'euphoria', 'extinction', 'extraversion',
    'fantasy', 'fatigue', 'fear', 'fixation', 'flashback', 'focus', 'frustration',
    'grief', 'group', 'guilt',
    'habit', 'hallucination', 'happiness', 'heredity', 'hierarchy', 'hippocampus', 'homeostasis', 'hostility', 'hypnosis', 'hysteria',
    'identity', 'illusion', 'imagery', 'imitation', 'impulse', 'incentive', 'individuation', 'inferiority', 'inhibition', 'insight', 'instinct', 'intelligence', 'interaction', 'internalization', 'interpretation', 'intimacy', 'introspection', 'introversion', 'intuition',
    'jealousy', 'judgment',
    'kinship',
    'latency', 'learning', 'libido', 'loneliness',
    'mania', 'manipulation', 'mastery', 'meditation', 'melancholy', 'memory', 'mentality', 'mindfulness', 'modeling', 'mood', 'motivation',
    'narcissism', 'need', 'neglect', 'neurosis', 'neurotransmitter', 'norm',
    'obedience', 'obsession', 'optimism',
    'panic', 'paranoia', 'parenting', 'passion', 'pathology', 'perception', 'persona', 'personality', 'persuasion', 'pessimism', 'phobia', 'placebo', 'pleasure', 'prejudice', 'projection', 'psyche', 'psychosis', 'punishment',
    'rapport', 'rationalization', 'reaction', 'reasoning', 'recall', 'recognition', 'reflex', 'regression', 'reinforcement', 'rejection', 'relaxation', 'repression', 'resentment', 'resilience', 'resistance', 'response', 'retrieval', 'reward', 'rumination',
    'sadness', 'satisfaction', 'schema', 'schizophrenia', 'security', 'self', 'sensation', 'sensitivity', 'serotonin', 'shame', 'shock', 'sleep', 'socialization', 'stigma', 'stimulus', 'stress', 'subconscious', 'sublimation', 'suggestion', 'superego', 'suppression', 'sympathy', 'syndrome',
    'temperament', 'temptation', 'tension', 'therapy', 'thinking', 'tolerance', 'trait', 'transference', 'trauma', 'trust',
    'unconscious',
    'validation', 'value', 'vulnerability',
    'wellbeing', 'willpower', 'withdrawal', 'worry',
  ],

  technology: [
    'adapter', 'address', 'algorithm', 'analog', 'android', 'animation', 'antivirus', 'application', 'architecture', 'array', 'artificial', 'authentication', 'automation',
    'backup', 'bandwidth', 'battery', 'binary', 'biometric', 'bitcoin', 'blockchain', 'bluetooth', 'boolean', 'boot', 'browser', 'buffer', 'bug', 'bus', 'byte',
    'cache', 'calibration', 'camera', 'capacity', 'captcha', 'cellular', 'chip', 'circuit', 'click', 'client', 'clipboard', 'cloud', 'cluster', 'codec', 'code', 'compiler', 'compression', 'computer', 'configuration', 'connection', 'console', 'container', 'cookie', 'core', 'crash', 'cryptocurrency', 'cursor', 'cybersecurity',
    'dashboard', 'data', 'database', 'debug', 'decryption', 'default', 'deployment', 'desktop', 'developer', 'device', 'digital', 'directory', 'disk', 'display', 'domain', 'download', 'driver', 'drone',
    'email', 'emulator', 'encryption', 'endpoint', 'engine', 'enterprise', 'ethernet', 'execution', 'export',
    'fiber', 'file', 'filter', 'fingerprint', 'firewall', 'firmware', 'flash', 'folder', 'font', 'format', 'framework', 'frequency', 'frontend', 'function',
    'gateway', 'gigabyte', 'gpu', 'graphics', 'grid',
    'hacker', 'hardware', 'hash', 'header', 'heap', 'hertz', 'hexadecimal', 'host', 'html', 'http', 'hub', 'hyperlink',
    'icon', 'import', 'index', 'infrastructure', 'input', 'installation', 'integration', 'intelligence', 'interface', 'internet', 'interpreter', 'intranet', 'iteration',
    'javascript', 'joystick',
    'kernel', 'keyboard', 'kilobyte',
    'laptop', 'latency', 'layer', 'library', 'linux', 'load', 'localhost', 'log', 'logic', 'login', 'loop',
    'machine', 'macro', 'malware', 'matrix', 'megabyte', 'memory', 'menu', 'metadata', 'method', 'microchip', 'microprocessor', 'middleware', 'mobile', 'modem', 'module', 'monitor', 'motherboard', 'mouse', 'multimedia',
    'network', 'node', 'notification',
    'object', 'offline', 'online', 'opensource', 'operating', 'optimization', 'output', 'overflow',
    'packet', 'parameter', 'partition', 'password', 'patch', 'path', 'payload', 'peripheral', 'permission', 'pixel', 'platform', 'plugin', 'pointer', 'port', 'portal', 'printer', 'privacy', 'processor', 'programming', 'protocol', 'proxy', 'python',
    'query', 'queue',
    'ram', 'ransomware', 'reboot', 'refresh', 'registry', 'remote', 'render', 'repository', 'resolution', 'response', 'restart', 'router', 'runtime',
    'satellite', 'scalar', 'scanner', 'schema', 'screen', 'script', 'search', 'security', 'semiconductor', 'sensor', 'sequence', 'server', 'session', 'simulation', 'smartphone', 'socket', 'software', 'source', 'spam', 'specification', 'spreadsheet', 'sql', 'stack', 'startup', 'storage', 'streaming', 'string', 'subroutine', 'sync', 'syntax', 'system',
    'tablet', 'tag', 'template', 'terabyte', 'terminal', 'testing', 'thread', 'throughput', 'timestamp', 'token', 'toolbar', 'touchscreen', 'traffic', 'transaction', 'transfer', 'transistor', 'trojan', 'troubleshoot',
    'unicode', 'upload', 'url', 'usb', 'user', 'utility',
    'validation', 'variable', 'vector', 'version', 'video', 'virtual', 'virus', 'visualization', 'voip', 'vpn',
    'wearable', 'webcam', 'webpage', 'website', 'widget', 'wifi', 'window', 'wireless', 'workstation',
    'xml',
    'zip', 'zoom',
  ],
};

/**
 * Check if a word is valid for the given category.
 * Uses curated list first (fast path), then falls back to embeddings.
 */
export function isValidWord(word: string, category: SemanticChainCategory): boolean {
  const normalizedWord = word.toLowerCase().trim();

  // Fast path: check curated list
  if (CATEGORY_WORDS[category].includes(normalizedWord)) {
    return true;
  }

  // Slow path: check embeddings if loaded
  if (isEmbeddingsReady()) {
    return isValidWordEmbedding(normalizedWord, category);
  }

  // Fallback: only accept words in curated list
  return false;
}

/**
 * Check if a word is known (exists in vocabulary).
 * Uses embeddings if loaded, otherwise checks curated lists.
 */
export function isWordKnown(word: string): boolean {
  const normalizedWord = word.toLowerCase().trim();

  // Check embeddings first
  if (isEmbeddingsReady()) {
    return isKnownWord(normalizedWord);
  }

  // Fallback: check if word exists in any category list
  for (const words of Object.values(CATEGORY_WORDS)) {
    if (words.includes(normalizedWord)) {
      return true;
    }
  }

  return false;
}

/**
 * Get a random starting word for a category
 */
export function getStartingWord(category: SemanticChainCategory): string {
  const words = CATEGORY_WORDS[category];
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

/**
 * Get all valid words starting with a specific letter for a category.
 * Only returns words from the curated list (for game hints).
 */
export function getWordsStartingWith(
  letter: string,
  category: SemanticChainCategory,
  excludeWords: string[] = []
): string[] {
  const normalizedLetter = letter.toLowerCase();
  const excludeSet = new Set(excludeWords.map((w) => w.toLowerCase()));

  return CATEGORY_WORDS[category].filter(
    (word) => word.startsWith(normalizedLetter) && !excludeSet.has(word)
  );
}

/**
 * Check if a chain can continue from the current word.
 * Returns true if there exists at least one valid word starting with the last letter.
 */
export function canChainContinue(
  currentWord: string,
  category: SemanticChainCategory,
  usedWords: string[]
): boolean {
  const lastLetter = currentWord.slice(-1).toLowerCase();
  const availableWords = getWordsStartingWith(lastLetter, category, usedWords);
  return availableWords.length > 0;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: SemanticChainCategory): string {
  const names: Record<SemanticChainCategory, string> = {
    animals: 'Animals',
    foods: 'Foods',
    countries: 'Countries',
    colors: 'Colors',
    occupations: 'Occupations',
    science: 'Science',
    psychology: 'Psychology',
    technology: 'Technology',
  };
  return names[category];
}

/**
 * Get all categories
 */
export function getAllCategories(): SemanticChainCategory[] {
  return [
    'animals',
    'foods',
    'countries',
    'colors',
    'occupations',
    'science',
    'psychology',
    'technology',
  ];
}
