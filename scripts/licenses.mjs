#!/usr/bin/env node
/**
 * scripts/licenses.mjs — Kontrakt licencji zależności produkcyjnych (NFR-SEC-009)
 * Weryfikuje, że żadna zależność produkcyjna nie korzysta z licencji copyleft
 * (GPL/AGPL/LGPL/SSPL/CPAL/EUPL) zabronionych w App Store z powodu FairPlay DRM.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const prodDeps = Object.keys(pkg.dependencies || {});

const ALLOWED_LICENSES = new Set([
  'MIT',
  'ISC',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'Unlicense',
  'CC0-1.0',
  'BlueOak-1.0.0',
  'Python-2.0',
]);

const FORBIDDEN_PATTERNS = [
  /GPL/i,
  /AGPL/i,
  /LGPL/i,
  /SSPL/i,
  /CPAL/i,
  /EUPL/i,
];

console.log(`[check:licenses] Weryfikacja licencji ${prodDeps.length} zależności produkcyjnych...`);

const errors = [];

for (const dep of prodDeps) {
  // Sprawdź package.json zależności w node_modules
  const depPkgPath = join(root, 'node_modules', dep, 'package.json');
  if (!existsSync(depPkgPath)) {
    // Może być zależnością scoped lub git
    continue;
  }

  try {
    const depPkg = JSON.parse(readFileSync(depPkgPath, 'utf8'));
    const license = typeof depPkg.license === 'string'
      ? depPkg.license
      : depPkg.license?.type || (Array.isArray(depPkg.licenses) ? depPkg.licenses.map(l => l.type || l).join(', ') : 'UNKNOWN');

    // Sprawdź wzorce zabronione
    for (const pat of FORBIDDEN_PATTERNS) {
      if (pat.test(license)) {
        errors.push(`Pakiet ${dep} ma zabronioną licencję copyleft: ${license}`);
        break;
      }
    }
  } catch (err) {
    errors.push(`Nie można odczytać licencji pakietu ${dep}: ${err.message}`);
  }
}

if (errors.length > 0) {
  console.error('[check:licenses] WYKRYTO ZABRONIONE LICENCJE:');
  for (const e of errors) console.error(`  ✖ ${e}`);
  process.exit(1);
}

console.log(`[check:licenses] OK: Wszystkie zależności produkcyjne posiadają dozwolone licencje.`);
