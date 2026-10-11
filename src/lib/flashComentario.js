#!/usr/bin/env node
/**
 * flash.js — tiny CLI to edit a single comma-separated values (CSV) file of
 * bilingual flashcards.
 *
 * Supported operations (mutually exclusive, last flag wins):
 *   --add "front,back"
 *   --set 2 "new front,new back"
 *   --remove 2
 *   --swap   (swap all front/back pairs in place)
 *
 * The file must consist of lines like:
 *   front,back
 * One pair per line. Blank lines and leading/trailing spaces are ignored.
 *
 * Example:
 *   node flash.js --add "casa,house"
 *   node flash.js --set 1 "livro,book"
 *   node flash.js --remove 2
 *   node flash.js --swap
 */

'use strict';

const fs = require('fs');
const path = require('path');

const USAGE = `
Usage: node flash.js --add "front,back"
       node flash.js --set <index> "front,back"
       node flash.js --remove <index>
       node flash.js --swap

Operates on flashcards.csv in the current working directory.
`.trim();

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = {
    add: null,
    set: null,   // [index, text]
    remove: null, // index
    swap: false,
    file: 'flashcards.csv',
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--add' && i + 1 < args.length) {
      command.add = args[++i];
    } else if (a === '--set' && i + 2 < args.length) {
      command.set = [parseInt(args[++i], 10), args[++i]];
    } else if (a === '--remove' && i + 1 < args.length) {
      command.remove = parseInt(args[++i], 10);
    } else if (a === '--swap') {
      command.swap = true;
    } else if (a === '--file' && i + 1 < args.length) {
      command.file = args[++i];
    } else if (a === '--help' || a === '-h') {
      console.log(USAGE);
      process.exit(0);
    }
  }

  // Exactly one operation
  const ops = [
    Boolean(command.add),
    Boolean(command.set),
    Boolean(command.remove),
    command.swap
  ].filter(Boolean).length;

  if (ops !== 1) {
    throw new Error('Exactly one of --add, --set, --remove, --swap is required.\n' + USAGE);
  }

  return command;
}

function readCards(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const cards = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) continue;
    const parts = line.split(',').map(s => s.trim());
    if (parts.length < 2) continue;
    cards.push({ front: parts[0], back: parts.slice(1).join(',') });
  }
  return cards;
}

function writeCards(filePath, cards) {
  const text = cards.map(c => `${c.front},${c.back}`).join('\n') + (cards.length ? '\n' : '');
  fs.writeFileSync(filePath, text, 'utf8');
}

function oneToTwo(arr) {
  return [arr[0], arr[1]];
}

function run() {
  let command;
  try {
    command = parseArgs(process.argv);
  } catch (err) {
    console.error(err.message);
    process.exit(2);
  }

  const { add, set, remove, swap, file } = command;
  const cards = readCards(file);

  if (add !== null) {
    const [front, ...backParts] = add.split(',').map(s => s.trim());
    if (!front || backParts.length === 0) {
      console.error('--add requires "front,back" with at least one comma.');
      process.exit(1);
    }
    cards.push({ front, back: backParts.join(',') });
    writeCards(file, cards);
    console.log(`Added: "${front},${backParts.join(',')}"`);
  } else if (set !== null) {
    const [idx, text] = set;
    const i = idx - 1;
    if (!Number.isInteger(idx) || idx < 1 || i < 0 || i >= cards.length) {
      console.error(`--set index must be between 1 and ${cards.length}.`);
      process.exit(1);
    }
    const [front, ...backParts] = text.split(',').map(s => s.trim());
    if (!front || backParts.length === 0) {
      console.error('--set requires "front,back" with at least one comma.');
      process.exit(1);
    }
    cards[i] = { front, back: backParts.join(',') };
    writeCards(file, cards);
    console.log(`Set #${idx}: "${front},${backParts.join(',')}"`);
  } else if (remove !== null) {
    const i = remove - 1;
    if (!Number.isInteger(remove) || remove < 1 || i < 0 || i >= cards.length) {
      console.error(`--remove index must be between 1 and ${cards.length}.`);
      process.exit(1);
    }
    const [removed] = cards.splice(i, 1);
    writeCards(file, cards);
    console.log(`Removed #${remove}: "${removed.front},${removed.back}"`);
  } else if (swap) {
    for (const c of cards) {
      const tmp = c.front;
      c.front = c.back;
      c.back = tmp;
    }
    writeCards(file, cards);
    console.log(`Swapped front/back in ${cards.length} card(s).`);
  }
}

try {
  run();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
