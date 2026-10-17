/**
 * interaction-guards.test.ts
 * Weryfikacja 16 żelaznych reguł interakcji (S1–S16, NFR-INT-001..016)
 * Zgodnie ze standardem Role-Model (trening/organizer)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { EN } from '../src/lib/i18n.en';

describe('Studio Interaction Guards (S1–S16, NFR-INT-001..016)', () => {
  const rootDir = join(__dirname, '..');
  const appDir = join(rootDir, 'app');
  const srcDir = join(rootDir, 'src');

  const getAllFiles = (dir: string, ext = /\.(ts|tsx)$/): string[] => {
    if (!existsSync(dir)) return [];
    const results: string[] = [];
    const walk = (d: string) => {
      for (const entry of readdirSync(d)) {
        const full = join(d, entry);
        if (statSync(full).isDirectory()) {
          if (
            entry !== 'node_modules' &&
            entry !== '.expo' &&
            entry !== 'scratch' &&
            entry !== 'dist' &&
            entry !== '.git'
          ) {
            walk(full);
          }
        } else if (ext.test(entry) && !entry.endsWith('.test.ts') && !entry.endsWith('.test.tsx')) {
          results.push(full);
        }
      }
    };
    walk(dir);
    return results;
  };

  const appFiles = getAllFiles(appDir);
  const srcFiles = getAllFiles(srcDir);
  const allSourceFiles = [...appFiles, ...srcFiles];

  // S2 / NFR-INT-002: Zakaz Alert.prompt
  it('S2: prohibits Alert.prompt across all source files (iOS-only, non-cross-platform)', () => {
    const violations: string[] = [];
    for (const f of allSourceFiles) {
      const content = readFileSync(f, 'utf8');
      if (content.includes('Alert.prompt')) {
        violations.push(f.replace(rootDir, ''));
      }
    }
    expect(violations).toEqual([]);
  });

  // S5 / NFR-INT-005: Zakaz dwuznacznych przycisków "Nie", "Tak", "Wróć" w oknach dialogowych
  it('S5: confirms all destructive operations use unambiguous verbs (no "Nie", "Tak", "Wróć")', () => {
    const forbiddenLabels = ['"Nie"', "'Nie'", '"Tak"', "'Tak'", '"Wróć"', "'Wróć'"];
    const violations: string[] = [];

    for (const f of allSourceFiles) {
      if (f.includes('lib\\confirm.ts') || f.includes('lib/confirm.ts')) continue;
      const content = readFileSync(f, 'utf8');
      if (content.includes('Alert.alert(')) {
        for (const bad of forbiddenLabels) {
          if (content.includes(`text: ${bad}`) || content.includes(`text:${bad}`)) {
            violations.push(`${f.replace(rootDir, '')}: uses ambiguous dialog label ${bad}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  // S6 / NFR-INT-006: Segmented selector max 4 opcje
  it('S6: ensures Segmented control receives maximum 4 options to avoid clipping', () => {
    const violations: string[] = [];
    for (const f of allSourceFiles) {
      const content = readFileSync(f, 'utf8');
      // Szukanie definicji opcji Segmented z > 4 elementami
      const matches = content.matchAll(/options\s*=\s*\{\[([^\]]+)\]\}/g);
      for (const m of matches) {
        const items = m[1].split(',').filter((s) => s.trim().length > 0);
        if (items.length > 4) {
          violations.push(`${f.replace(rootDir, '')}: Segmented options length ${items.length} > 4`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  // S7 / NFR-INT-007: ScrollView / FlatList posiadaja keyboardShouldPersistTaps="handled"
  it('S7: ensures ScrollView and FlatList configure keyboardShouldPersistTaps="handled"', () => {
    const violations: string[] = [];
    for (const f of allSourceFiles) {
      const content = readFileSync(f, 'utf8');
      if (
        (content.includes('<ScrollView') || content.includes('<FlatList')) &&
        !content.includes('keyboardShouldPersistTaps')
      ) {
        // Ignorujemy jesli plik to wrapper bazowy lub test
        violations.push(f.replace(rootDir, ''));
      }
    }
    expect(violations).toEqual([]);
  });

  // S8 / NFR-INT-008: Brak generycznego "Błąd" / "Error" jako tytuł powiadomienia
  it('S8: prohibits generic "Błąd" or "Error" as dialog titles in i18n dictionary', () => {
    const forbiddenTitles = ['Błąd', 'Error', 'Uwaga'];
    const violations: string[] = [];

    for (const title of forbiddenTitles) {
      if (EN[title] !== undefined) {
        // Tylko jesli nie ma kontekstu
        violations.push(`Dictionary contains standalone generic title: "${title}"`);
      }
    }
    expect(violations).toEqual([]);
  });

  // S14 / NFR-INT-014: Zakaz ręcznego sklejania jednostek w szablonach JSX (${w} kg)
  it('S14: prohibits raw template string concatenation of numbers with units in views', () => {
    const regex = /\$\{[^}]+\}\s*(kg|lb|kcal|min|ml|oz)\b/;
    const violations: string[] = [];

    for (const f of appFiles) {
      const content = readFileSync(f, 'utf8');
      if (regex.test(content)) {
        violations.push(f.replace(rootDir, ''));
      }
    }
    expect(violations).toEqual([]);
  });

  // S15 / NFR-INT-015: Normalizacja znaków diakrytycznych w SearchField (w tym ł/Ł)
  it('S15: normSearch accurately removes diacritics including Polish ł/Ł', () => {
    const { normSearch } = require('../src/lib/search');
    expect(normSearch).toBeDefined();

    expect(normSearch('Żółty liść')).toBe('zolty lisc');
    expect(normSearch('Ładunek')).toBe('ladunek');
    expect(normSearch('Korytarz')).toBe('korytarz');
    expect(normSearch('Ściana')).toBe('sciana');
  });

  // S16 / NFR-INT-016: Zakaz bezpośrednich importów niskopoziomowych w app/**/*.tsx
  it('S16: views in app/**/*.tsx must not import native low-level SDKs directly', () => {
    const forbiddenModules = ['expo-file-system', 'expo-sqlite'];
    const violations: string[] = [];

    for (const f of appFiles) {
      const content = readFileSync(f, 'utf8');
      for (const mod of forbiddenModules) {
        if (content.includes(`from '${mod}'`) || content.includes(`from "${mod}"`)) {
          violations.push(`${f.replace(rootDir, '')}: imports native SDK "${mod}" directly`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
