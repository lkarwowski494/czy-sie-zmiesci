// scripts/gen-matrix-translations.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dictPath = join(root, 'src/lib/i18n.en.ts');
const targetPath = join(root, 'tests/matrix-translations.test.ts');

const src = readFileSync(dictPath, 'utf8');
const matches = [...src.matchAll(/'((?:[^'\\]|\\.)*)'\s*:\s*'((?:[^'\\]|\\.)*)'/g)];
const keys = matches.map((m) => m[1]);

const content = `/**
 * matrix-translations.test.ts
 * Weryfikacja wszystkich kluczy tłumaczeń UI i TEKST (BR-TEST-028)
 */

import { t } from '../src/lib/i18n';

describe('Matrix Translations and UI Strings (UI and TEKST / BR-TEST-028)', () => {
  const allKeys: string[] = ${JSON.stringify(keys, null, 2)};

  it('validates all ' + allKeys.length + ' UI and text string literals with t()', () => {
    for (const key of allKeys) {
      const res = t(key);
      expect(typeof res).toBe('string');
      expect(res.length).toBeGreaterThan(0);
    }
  });
});
`;

writeFileSync(targetPath, content, 'utf8');
console.log(`Generated ${targetPath} with ${keys.length} keys.`);
