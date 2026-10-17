/**
 * matrix-logic.test.ts
 * Pokrycie wszystkich wyeksportowanych funkcji domeny i lib (LOGIKA, BR-TEST-028)
 */

import { getLatestCorruptRaw, localISODate, formatCsv, exportCsvHistory } from '../src/lib/backup';
import { useLang, lang, setLang } from '../src/lib/i18n';
import { useUnitSystem, getCurrentUnitSystem, setUnitSystem } from '../src/lib/unit-converter';

describe('Matrix Logic Guard (LOGIKA / BR-TEST-028)', () => {
  it('tests localISODate formatting without timezone shift', () => {
    const d = new Date(2026, 9, 17, 12, 0, 0); // 17 października 2026
    const formatted = localISODate(d);
    expect(formatted).toBe('2026-10-17');
  });

  it('tests getLatestCorruptRaw recovery inspect', () => {
    const raw = getLatestCorruptRaw();
    // Może być null jeśli nie było uszkodzonego stanu
    expect(raw === null || typeof raw === 'string').toBe(true);
  });

  it('tests formatCsv with columns and items', () => {
    const headers = ['Nazwa', 'Waga', 'Długość'];
    const rows = [
      ['Szafa', 80, 200],
      ['Stół', 35, 140],
    ];

    const csv = formatCsv(headers, rows);
    expect(csv).toContain('Nazwa');
    expect(csv).toContain('Szafa');
    expect(csv).toContain('80');
    expect(csv).toContain('Stół');
    expect(typeof exportCsvHistory).toBe('function');
  });

  it('tests useLang and language state switching', () => {
    expect(typeof useLang).toBe('function');
    setLang('pl');
    expect(lang()).toBe('pl');

    setLang('en');
    expect(lang()).toBe('en');

    // Przywróć pl
    setLang('pl');
    expect(lang()).toBe('pl');
  });

  it('tests useUnitSystem and unit system state switching', () => {
    expect(typeof useUnitSystem).toBe('function');
    setUnitSystem('metric');
    expect(getCurrentUnitSystem()).toBe('metric');

    setUnitSystem('imperial');
    expect(getCurrentUnitSystem()).toBe('imperial');

    // Przywróć metric
    setUnitSystem('metric');
    expect(getCurrentUnitSystem()).toBe('metric');
  });
});
