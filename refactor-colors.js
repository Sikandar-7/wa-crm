import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// Simple mapping from hardcoded to semantic
const REPLACEMENTS = [
  { regex: /\bbg-slate-950\b/g, replace: 'bg-background' },
  { regex: /\bbg-slate-900\b/g, replace: 'bg-card' },
  { regex: /\bbg-slate-800\b/g, replace: 'bg-secondary border-border' }, // approximate, we'll see
  { regex: /\border-slate-800\b/g, replace: 'border-border' },
  { regex: /\border-slate-700\b/g, replace: 'border-border' },
  { regex: /\btext-slate-400\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-slate-500\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-white\b/g, replace: 'text-foreground' },
  { regex: /\btext-slate-100\b/g, replace: 'text-foreground' },
  { regex: /\btext-slate-200\b/g, replace: 'text-foreground' },
  { regex: /\btext-slate-300\b/g, replace: 'text-muted-foreground' },
  { regex: /\bring-slate-700\b/g, replace: 'ring-border' }
];

const files = globSync('src/**/*.{tsx,ts}', { ignore: ['node_modules/**'] });

let changedFiles = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  for (const { regex, replace } of REPLACEMENTS) {
    newContent = newContent.replace(regex, replace);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
}

console.log(`\nUpdated ${changedFiles} files!`);
