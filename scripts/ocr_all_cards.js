import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

const cardsDir = 'd:/dev/req/public/cards';

const folders = [
  'COMMON CARDS',
  'UNCOMMON CARDS',
  'RARE CARDS',
  'EPIC CARDS',
  'LEGENDARY CARDS',
  'VALUE CARDS'
];

const MANUAL_OVERRIDES = {
  "/cards/RARE CARDS/carta_054.png": {
    name: "SURFING PANDA",
    description: "Surfing the sea with bamboo boards!"
  }
};

function cleanTextName(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const candidates = [];

  for (let line of lines) {
    line = line.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim();
    line = line.replace(/\s+/g, ' ');

    if (line.length < 3) continue;

    const upperLine = line.toUpperCase();
    
    if ([
      'CREATURE', 'ITEM', 'EFFECT', 'VALUE', 
      'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY',
      'DURATION', 'CLASH', 'CLASHES', 'ENEMY', 'YOUR'
    ].includes(upperLine)) {
      continue;
    }

    const isUppercase = /^[A-Z\s'\-]+$/.test(line);
    if (isUppercase) {
      candidates.push(line);
    }
  }

  if (candidates.length > 0) {
    let best = candidates[0];
    for (const c of candidates) {
      if (c.length > best.length) {
        best = c;
      }
    }
    return best;
  }
  return null;
}

function extractDescription(text) {
  if (!text) return null;

  // Match text inside curly quotes or regular quotes across newlines
  const matches = [...text.matchAll(/[“"']([^”"']+)[”"']/g)];
  if (matches.length > 0) {
    let best = "";
    for (const m of matches) {
      let candidate = m[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      if (candidate.length > best.length && 
          !candidate.includes("Common") && 
          !candidate.includes("Rare") && 
          !candidate.includes("Epic") && 
          !candidate.includes("Legendary")) {
        best = candidate;
      }
    }
    if (best.length > 5) {
      return best;
    }
  }

  // Fallback: lines containing quotes
  const lines = text.split('\n');
  for (const line of lines) {
    if ((line.includes('“') || line.includes('”') || line.includes('"')) && !/^[A-Z\s'\-]+$/.test(line)) {
      const clean = line.replace(/[“”"']/g, '').replace(/\s+/g, ' ').trim();
      if (clean.length > 10) {
        return clean;
      }
    }
  }

  return null;
}

async function main() {
  const allFiles = [];

  for (const folder of folders) {
    const dirPath = path.join(cardsDir, folder);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.png') && f.startsWith('carta_'));
    for (const file of files) {
      allFiles.push({ folder, file });
    }
  }

  console.log(`Found ${allFiles.length} card images to scan.`);

  const results = {};
  const CONCURRENCY = 8;
  let activeCount = 0;
  let finishedCount = 0;
  let index = 0;

  return new Promise((resolve) => {
    async function next() {
      if (index >= allFiles.length) {
        if (activeCount === 0) {
          resolve(results);
        }
        return;
      }

      const currentIdx = index++;
      const { folder, file } = allFiles[currentIdx];
      const imagePath = path.join(cardsDir, folder, file);
      const relativePath = `/cards/${folder}/${file}`;
      
      activeCount++;

      // Check manual override first
      if (MANUAL_OVERRIDES[relativePath]) {
        console.log(`[${finishedCount + 1}/${allFiles.length}] ${relativePath} => MANUAL OVERRIDE`);
        results[relativePath] = MANUAL_OVERRIDES[relativePath];
        activeCount--;
        finishedCount++;
        next();
        return;
      }

      try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
        const name = cleanTextName(text);
        const description = extractDescription(text);
        
        results[relativePath] = {
          name: name || null,
          description: description || null
        };
        
        console.log(`[${finishedCount + 1}/${allFiles.length}] ${relativePath} => "${name}" | "${description}"`);
      } catch (err) {
        console.error(`Error scanning ${relativePath}:`, err.message);
      } finally {
        activeCount--;
        finishedCount++;
        
        if (finishedCount % 20 === 0 || finishedCount === allFiles.length) {
          console.log(`--- Progress: ${finishedCount}/${allFiles.length} done (${Math.round(finishedCount/allFiles.length*100)}%) ---`);
        }

        next();
      }
    }

    for (let i = 0; i < CONCURRENCY; i++) {
      next();
    }
  });
}

main().then(mapping => {
  const outputPath = 'd:/dev/req/scripts/card_names_ocr.json';
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2), 'utf-8');
  console.log(`Done! Saved ${Object.keys(mapping).length} mappings to ${outputPath}`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
