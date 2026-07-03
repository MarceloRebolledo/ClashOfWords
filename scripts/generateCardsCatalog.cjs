const fs = require('fs');
const path = require('path');

const CARDS_ROOT = path.join(__dirname, '../public/cards');
const OUTPUT_FILE = path.join(__dirname, '../src/app/cardsData.ts');

// Word lists for generating educational card names based on grammatical classes
const words = {
  nouns: [
    "Dragon", "Knight", "Castle", "Wizard", "Forest", "Mountain", "River", "Shield", "Sword", "Explorer",
    "Kingdom", "Phoenix", "Unicorn", "Compass", "Map", "Key", "Mirror", "Shadow", "Crown", "Lantern",
    "Grizzly", "Falcon", "Dolphin", "Oasis", "Glacier", "Thunder", "Lightning", "Echo", "Voyage", "Anchor",
    "Troll", "Goblin", "Elf", "Fairy", "Giant", "Dwarf", "Canyon", "Valley", "Ocean", "Island",
    "Galaxy", "Comet", "Meteor", "Planet", "Telescope", "Chronicle", "Legend", "Fable", "Riddle", "Whisper",
    "Flame", "Blizzard", "Tempest", "Harvest", "Meadow", "Orchard", "Summit", "Cavern", "Beacon", "Sentry",
    "Alchemist", "Blacksmith", "Merchant", "Scholar", "Scribe", "Navigator", "Hunter", "Herbalist", "Captain", "Pilot"
  ],
  verbs: [
    "Defend", "Attack", "Protect", "Create", "Discover", "Explore", "Challenge", "Achieve", "Conquer", "Transform",
    "Observe", "Evaluate", "Analyze", "Design", "Construct", "Investigate", "Formulate", "Synthesize", "Examine", "Inspect",
    "Enhance", "Diminish", "Accelerate", "Decelerate", "Magnify", "Neutralize", "Rejuvenate", "Fortify", "Demolish", "Restore",
    "Navigate", "Traverse", "Ascend", "Descend", "Improvis", "Replicate", "Illuminate", "Shadow", "Resonate", "Vibrate",
    "Flourish", "Wither", "Assemble", "Disperse", "Liberate", "Confine", "Deceive", "Reveal", "Acquire", "Relinquish"
  ],
  adjectives: [
    "Brilliant", "Mysterious", "Ancient", "Modern", "Courageous", "Timid", "Gigantic", "Minuscule", "Silent", "Boisterous",
    "Benevolent", "Malevolent", "Swift", "Leisured", "Fragile", "Resilient", "Luminous", "Obscure", "Fierce", "Serene",
    "Grateful", "Spiteful", "Diligent", "Slothful", "Abundant", "Scarce", "Harmonious", "Discordant", "Exotic", "Familiar",
    "Intrepid", "Apprehensive", "Vibrant", "Drab", "Colossal", "Microscopic", "Eloquent", "Taciturn", "Peculiar", "Ordinary",
    "Majestic", "Humble", "Sovereign", "Vassal", "Optimal", "Substandard", "Pristine", "Tarnished", "Infinite", "Finite"
  ],
  adverbs: [
    "Swiftly", "Silently", "Bravely", "Cautiously", "Brilliantly", "Mysteriously", "Eagerly", "Reluctantly", "Boldly", "Timidly",
    "Gently", "Fiercely", "Happily", "Sorrowfully", "Calmly", "Frantically", "Patiently", "Impatiently", "Gracefully", "Clumsily",
    "Intentionally", "Accidentally", "Deliberately", "Haphazardly", "Solemnly", "Joyfully", "Anxiously", "Serenely", "Vigorously", "Feebly",
    "Precisely", "Vaguely", "Adequately", "Superbly", "Defiantly", "Obediently", "Relentlessly", "Sporadically", "Perpetually", "Momentarily"
  ],
  prefixes: [
    "Pre-", "Re-", "Un-", "Dis-", "Mis-", "Sub-", "Inter-", "Super-", "Anti-", "Pro-",
    "Non-", "De-", "Co-", "Ex-", "Over-", "Under-", "Post-", "Semi-", "Mono-", "Multi-"
  ],
  suffixes: [
    "-ful", "-less", "-able", "-ible", "-ness", "-ment", "-tion", "-sion", "-ise", "-ize",
    "-ly", "-ous", "-al", "-ive", "-ity", "-ment", "-er", "-or", "-est", "-ish"
  ],
  figuratives: [
    "Piece of Cake", "Break a Leg", "Hit the Nail", "Bite the Bullet", "Spill the Beans", "Rule of Thumb", "Cold Shoulder", "Under the Weather",
    "Blessing in Disguise", "Burn the Midnight Oil", "Barking Up Wrong Tree", "Cry Over Spilt Milk", "Curiosity Killed Cat", "Don't Put Eggs in One Basket", "Every Cloud Silver Lining", "Face the Music",
    "Heart of Gold", "Mind of Steel", "Busy as a Bee", "Strong as an Ox", "Quiet as a Mouse", "Sharp as a Tack", "Fresh as a Daisy", "Light as a Feather"
  ],
  values: [
    "Empathy", "Integrity", "Honesty", "Respect", "Responsibility", "Fairness", "Compassion", "Kindness",
    "Courage", "Gratitude", "Perseverance", "Cooperation", "Humility", "Generosity", "Tolerance", "Citizenship"
  ]
};

// Cycle generators to ensure we distribute properties evenly and uniquely
function createCycler(arr) {
  let index = 0;
  return () => {
    const val = arr[index];
    index = (index + 1) % arr.length;
    return val;
  };
}

const typeCycler = createCycler(["Creature", "Item", "Effect"]);
const classCycler = createCycler(["Noun", "Verb", "Adjective", "Adverb", "Prefix", "Suffix", "Grammar", "Figurative", "Strategy", "Word-building", "Phonetics"]);

function generateName(rarity, index, cardType, grammarClass) {
  // Select word based on grammar class
  if (grammarClass === "Value" || rarity === "Value") {
    const valWord = words.values[index % words.values.length];
    return `Value of ${valWord}`;
  }
  
  if (grammarClass === "Noun") {
    const adj = words.adjectives[index % words.adjectives.length];
    const noun = words.nouns[(index * 3) % words.nouns.length];
    return `${adj} ${noun}`;
  }
  if (grammarClass === "Verb") {
    const adv = words.adverbs[index % words.adverbs.length];
    const verb = words.verbs[(index * 2) % words.verbs.length];
    return `${adv} ${verb}`;
  }
  if (grammarClass === "Adjective") {
    const adj = words.adjectives[index % words.adjectives.length];
    return `${adj}`;
  }
  if (grammarClass === "Adverb") {
    const adv = words.adverbs[index % words.adverbs.length];
    return `${adv}`;
  }
  if (grammarClass === "Prefix") {
    const pre = words.prefixes[index % words.prefixes.length];
    const noun = words.nouns[(index * 7) % words.nouns.length];
    return `${pre}${noun.toLowerCase()}`;
  }
  if (grammarClass === "Suffix") {
    const noun = words.nouns[index % words.nouns.length];
    const suf = words.suffixes[(index * 5) % words.suffixes.length];
    return `${noun.toLowerCase()}${suf}`;
  }
  if (grammarClass === "Figurative") {
    return words.figuratives[index % words.figuratives.length];
  }
  
  // For Grammar, Strategy, Word-building, Phonetics: mix some terminology
  const termTemplates = [
    (i) => `Grammar ${words.nouns[i % words.nouns.length]}`,
    (i) => `Phonetic ${words.nouns[(i * 2) % words.nouns.length]}`,
    (i) => `Syllable ${words.nouns[(i * 3) % words.nouns.length]}`,
    (i) => `Synonym ${words.nouns[(i * 4) % words.nouns.length]}`,
    (i) => `Antonym ${words.nouns[(i * 5) % words.nouns.length]}`,
    (i) => `Homophone ${words.nouns[(i * 6) % words.nouns.length]}`,
    (i) => `Context Clue ${words.nouns[(i * 7) % words.nouns.length]}`
  ];
  return termTemplates[index % termTemplates.length](index);
}

function scanRarityFolder(folderName) {
  const dirPath = path.join(CARDS_ROOT, folderName);
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return [];
  }
  
  return fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.png'))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
}

function main() {
  console.log('Scanning cards directory...');
  
  const folders = {
    Common: "COMMON CARDS",
    Uncommon: "UNCOMMON CARDS",
    Rare: "RARE CARDS",
    Epic: "EPIC CARDS",
    Legendary: "LEGENDARY CARDS",
    Value: "VALUE CARDS"
  };
  
  const allGeneratedCards = [];
  
  // We'll gather counts to check
  const counts = {};
  
  Object.keys(folders).forEach(rarityKey => {
    const folderName = folders[rarityKey];
    const files = scanRarityFolder(folderName);
    counts[rarityKey] = files.length;
    
    files.forEach((file, idx) => {
      const indexOneBased = idx + 1;
      const id = `${rarityKey.toLowerCase()}_${String(indexOneBased).padStart(3, '0')}`;
      
      let type = typeCycler();
      let englishClass = classCycler();
      let power = 1;
      let mappedRarity = rarityKey;
      
      // Fine-tune parameters based on Rarity and Type
      if (rarityKey === "Common") {
        power = (idx % 3) + 2; // 2, 3, 4
      } else if (rarityKey === "Uncommon") {
        power = (idx % 3) + 4; // 4, 5, 6
      } else if (rarityKey === "Rare") {
        power = (idx % 3) + 6; // 6, 7, 8
      } else if (rarityKey === "Epic") {
        power = (idx % 2) + 8; // 8, 9
      } else if (rarityKey === "Legendary") {
        power = 9;
      } else if (rarityKey === "Value") {
        // Value cards behave as Legendary in rarity rules, but Type is Value
        type = "Value";
        englishClass = "Value";
        mappedRarity = "Legendary";
        power = (idx % 3) + 7; // 7, 8, 9
      }
      
      const name = generateName(rarityKey, idx, type, englishClass);
      const relativeImagePath = `/cards/${folderName}/${file}`;
      
      // Let's create an ability text for Epic/Legendary/Value
      let ability = undefined;
      if (rarityKey === "Legendary") {
        ability = `Unleashes powerful vocabulary boost of +${power - 2}`;
      } else if (rarityKey === "Epic") {
        ability = `Synergizes with other ${englishClass} cards`;
      } else if (rarityKey === "Value") {
        ability = `Permanent value boost of +${power} points`;
      }
      
      allGeneratedCards.push({
        id,
        name,
        type,
        rarity: mappedRarity,
        power,
        englishClass,
        ability,
        active: true,
        image: relativeImagePath
      });
    });
  });
  
  console.log('Folder counts detected:', counts);
  console.log(`Total cards generated: ${allGeneratedCards.length}`);
  
  // Write the file src/app/cardsData.ts
  const fileContent = `// Autogenerated by scripts/generateCardsCatalog.js
import { Card } from './App';

export const allCards: Card[] = ${JSON.stringify(allGeneratedCards, null, 2)};
`;
  
  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
  console.log(`Successfully wrote cards database to ${OUTPUT_FILE}`);
}

main();
