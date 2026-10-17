import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { EN } from '../../lib/i18n.en';
import { t, setLang, lang, LANGS } from '../../lib/i18n';
import { RITUAL_PROFILES } from '../../services/ritual-profile';
import { CRAFT_APPS } from '../../core/craft-suite-theme';

describe('i18n Completeness & Contract Guard (Apps4Craft T-040, NFR-I18N)', () => {
  const rootDir = join(__dirname, '../../..');

  afterEach(() => {
    setLang('pl');
  });

  it('exposes supported languages (pl, en) and defaults to pl', () => {
    expect(LANGS).toContain('pl');
    expect(LANGS).toContain('en');
    expect(LANGS.length).toBe(2);
    expect(lang()).toBe('pl');
  });

  it('contains over 500 validated English translation keys in dictionary', () => {
    const keys = Object.keys(EN);
    expect(keys.length).toBeGreaterThan(500);
    keys.forEach((key) => {
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
      expect(typeof EN[key]).toBe('string');
      expect(EN[key].length).toBeGreaterThan(0);
    });
  });

  it('ensures 100% parameter symmetry between Polish and English translations', () => {
    const extractParams = (str: string): string[] => {
      const matches = str.matchAll(/\{(\w+)\}/g);
      return Array.from(matches, (m) => m[1]).sort();
    };

    const asymmetricalKeys: string[] = [];

    for (const [plKey, enValue] of Object.entries(EN)) {
      const plParams = extractParams(plKey);
      const enParams = extractParams(enValue);

      if (plParams.join(',') !== enParams.join(',')) {
        asymmetricalKeys.push(
          `Key "${plKey}" has params [${plParams}] but EN has [${enParams}]`
        );
      }
    }

    expect(asymmetricalKeys).toEqual([]);
  });

  it('every t("literal") in source code is present in English dictionary', () => {
    const sourceFiles: string[] = [];

    const walk = (dir: string) => {
      if (!existsSync(dir)) return;
      for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        if (statSync(fullPath).isDirectory()) {
          if (
            entry !== 'node_modules' &&
            entry !== '.expo' &&
            entry !== 'scratch' &&
            entry !== 'dist' &&
            entry !== '.git'
          ) {
            walk(fullPath);
          }
        } else if (
          /\.(ts|tsx)$/.test(entry) &&
          !/i18n(\.en)?\.ts$/.test(entry) &&
          !/\.test\.(ts|tsx)$/.test(entry)
        ) {
          sourceFiles.push(fullPath);
        }
      }
    };

    ['src', 'app'].forEach((d) => walk(join(rootDir, d)));
    if (existsSync(join(rootDir, 'App.tsx'))) {
      sourceFiles.push(join(rootDir, 'App.tsx'));
    }

    const unquote = (s: string) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    const usedLiterals = new Set<string>();

    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf8');
      const matches = content.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g);
      for (const m of matches) {
        usedLiterals.add(unquote(m[1]));
      }
    }

    const enKeys = new Set(Object.keys(EN));
    const missingKeys: string[] = [];

    for (const literal of usedLiterals) {
      if (!enKeys.has(literal)) {
        missingKeys.push(literal);
      }
    }

    expect(missingKeys).toEqual([]);
  });

  it('translates core studio domain entities without throw or missing translations', () => {
    setLang('en');

    // Test essential UI terms
    expect(t('Symulator 3D')).toBe('3D Simulator');
    expect(t('Wnętrza')).toBe('Interiors');
    expect(t('Garaż')).toBe('Garage');
    expect(t('Ustawienia')).toBe('Settings');
    expect(t('Kopia zapasowa')).toBe('Backup');

    // Test interpolation
    const interpolated = t('Asymetria ({offset} mm)', { offset: 120 });
    expect(interpolated).toBe('Asymmetry (120 mm)');

    setLang('pl');
    expect(t('Symulator 3D')).toBe('Symulator 3D');
  });

  it('validates Apps4Craft Studio Family ecosystem titles and descriptions are all present', () => {
    Object.values(CRAFT_APPS).forEach((app) => {
      expect(app.name).toBeDefined();
      expect(app.domain).toBeDefined();
      expect(app.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('validates all Ritual Profile metadata is defined and non-empty', () => {
    const profileIds = Object.keys(RITUAL_PROFILES);
    expect(profileIds).toEqual(['daily', 'architect', 'expedition']);

    profileIds.forEach((id) => {
      const p = RITUAL_PROFILES[id as keyof typeof RITUAL_PROFILES];
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.subtitle.length).toBeGreaterThan(0);
      expect(p.badge.length).toBeGreaterThan(0);
      expect(p.primaryTools.length).toBeGreaterThanOrEqual(3);
    });
  });
});
