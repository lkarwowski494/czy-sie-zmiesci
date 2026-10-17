// scripts/check-corpus.mjs
// Strażnik aktualności korpusów prawdy w Pythonie (BR-TEST-012)
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const generators = [
  {
    script: 'scripts/gen-geometry3d-corpus.py',
    corpus: 'src/domain/__tests__/fixtures/geometry3d-corpus.json',
  },
  {
    script: 'scripts/gen-theme-contrast-corpus.py',
    corpus: 'src/domain/__tests__/fixtures/theme-contrast-corpus.json',
  },
];

console.log('--- Weryfikacja korpusów prawdy w Pythonie (BR-TEST-012) ---');

let hasDiff = false;

// Sprawdź czy python3 lub python jest dostępny
const pythonBin = process.platform === 'win32' ? 'python' : 'python3';

for (const gen of generators) {
  const scriptPath = join(root, gen.script);
  const corpusPath = join(root, gen.corpus);

  const beforeContent = readFileSync(corpusPath, 'utf8');

  try {
    execFileSync(pythonBin, ['-I', scriptPath], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'inherit'],
    });

    const afterContent = readFileSync(corpusPath, 'utf8');

    if (beforeContent !== afterContent) {
      console.error(`[check:corpus] BŁĄD: Korpus ${gen.corpus} różni się po uruchomieniu ${gen.script}!`);
      hasDiff = true;
    } else {
      console.log(`[check:corpus] OK: ${gen.corpus} jest w 100% zsynchronizowany z ${gen.script}`);
    }
  } catch (err) {
    console.error(`[check:corpus] BŁĄD wykonania ${gen.script}:`, err.message);
    hasDiff = true;
  }
}

if (hasDiff) {
  console.error('[check:corpus] Wykryto niezgodności w plikach korpusu!');
  process.exit(1);
} else {
  console.log('[check:corpus] Wszystkie korpusy prawdy są w 100% aktualne.');
  process.exit(0);
}
