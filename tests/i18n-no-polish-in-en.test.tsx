/**
 * i18n-no-polish-in-en.test.tsx
 * Zakaz wycieku polskich znaków diakrytycznych i polskich słów kluczowych do wersji EN (NFR-I18N-003)
 */

import { EN } from '../src/lib/i18n.en';

describe('No Polish Leakage in English Dictionary Guard (NFR-I18N-003)', () => {
  const polishDiacriticsRegex = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;

  const polishBlacklistWords = [
    'Zapisz',
    'Usuń',
    'Anuluj',
    'Gotowe',
    'Ustawienia',
    'Katalog',
    'Załadunek',
    'Wnęka',
    'Korytarz',
    'Schody',
    'Ościeżnica',
    'Hak',
    'Przyczepa',
  ];

  it('ensures zero Polish diacritics in English translations (except allowed proper brand names)', () => {
    const allowedExceptions = new Set([
      'Škoda Octavia IV Combi',
      'Škoda Fabia IV',
      'Škoda Superb Combi',
      'Škoda Kamiq',
      'Škoda Karoq',
      'Škoda Kodiaq',
      'Škoda Enyaq iV',
    ]);

    const violations: string[] = [];

    for (const [plKey, enVal] of Object.entries(EN)) {
      if (allowedExceptions.has(enVal)) continue;

      if (polishDiacriticsRegex.test(enVal)) {
        violations.push(`Key "${plKey}" has EN translation containing Polish diacritics: "${enVal}"`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('ensures zero untranslated Polish blacklist UI words in English values', () => {
    const violations: string[] = [];

    for (const [plKey, enVal] of Object.entries(EN)) {
      for (const word of polishBlacklistWords) {
        // Sprawdzanie czy całe polskie słowo zostało bezpośrednio jako wartość EN
        if (enVal === word || enVal.startsWith(`${word} `) || enVal.endsWith(` ${word}`)) {
          violations.push(`Key "${plKey}" has untranslated Polish keyword "${word}" in EN: "${enVal}"`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
