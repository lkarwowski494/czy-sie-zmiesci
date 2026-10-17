/**
 * tests/brands.contract.test.ts — Kontrakt czystości marek i znaków towarowych (NFR-SEC-011)
 * Weryfikuje brak zastrzeżonych znaków towarowych firm trzecich w słownikach i metadanych.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

describe('Kontrakt czystości marek i znaków towarowych (NFR-SEC-011)', () => {
  // Dla czy-sie-zmiesci: zakaz uzywania komercyjnych nazw mebli jako wbudowanych nazw modeli
  const FORBIDDEN_BRANDS = [
    /\bIKEA\b/i,
    /\bKALLAX\b/i,
    /\bBILLY\b/i,
    /\bMALM\b/i,
    /\bPAX\b/i,
    /\bHEMNES\b/i,
  ];

  test('app.json oraz pliki site/ nie zawierają zastrzeżonych znaków towarowych mebli', () => {
    const appJsonStr = readFileSync(join(root, 'app.json'), 'utf8');
    for (const pat of FORBIDDEN_BRANDS) {
      expect(appJsonStr).not.toMatch(pat);
    }

    const siteDir = join(root, 'site');
    if (existsSync(siteDir)) {
      const pages = readdirSync(siteDir).filter((f) => f.endsWith('.html'));
      for (const page of pages) {
        const content = readFileSync(join(siteDir, page), 'utf8');
        for (const pat of FORBIDDEN_BRANDS) {
          expect(content).not.toMatch(pat);
        }
      }
    }
  });

  test('słowniki językowe (i18n) i dane początkowe nie zawierają zastrzeżonych znaków towarowych', () => {
    const i18nPath = join(root, 'src/i18n/translations.ts');
    if (existsSync(i18nPath)) {
      const i18nContent = readFileSync(i18nPath, 'utf8');
      for (const pat of FORBIDDEN_BRANDS) {
        expect(i18nContent).not.toMatch(pat);
      }
    }
  });
});
