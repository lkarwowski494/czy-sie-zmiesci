/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/var/mobile/Documents/',
  cacheDirectory: '/var/mobile/Caches/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  readDirectoryAsync: jest.fn().mockResolvedValue([]),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

import {
  buildBackup,
  AUTO_RE,
  SAFETY_RE,
  stampOf,
  SCHEMA_VERSION,
  FitCheckBackupData,
  parseAndValidateBackup,
  poolKey,
  autoBackup,
  safetyBackup,
  exportBackup,
} from '../backup';

describe('Apps4Brew Backup & Safety Snapshot Specification (lib/backup)', () => {
  const sampleState: FitCheckBackupData = {
    custom_spaces: [{ id: 'cs1', name: 'Pawlacz w korytarzu' }],
    user_cargo_items: [{ id: 'ci1', name: 'Rower gravel' }],
    pack_sessions: [{ id: 'ps1', name: 'Wyjazd na Mazury' }],
    pack_session_items: [],
    relocation_projects: [],
    rooms: [],
    room_fixtures: [],
    access_pathways: [],
    relocation_items: [],
    garage_profiles: [],
    towbar_roof_configs: [],
  };

  it('buildBackup creates valid envelope with metadata', () => {
    const backup = buildBackup(sampleState);

    expect(backup.format).toBe('fitcheck-backup');
    expect(backup.schemaVersion).toBe(SCHEMA_VERSION);
    expect(typeof backup.exportedAt).toBe('string');
    expect(backup.bundleId).toBe('com.apps4brew.fitcheck');
    expect(backup.state).toEqual(sampleState);
  });

  it('AUTO_RE validates valid auto-backup filename formats', () => {
    expect(AUTO_RE.test('fitcheck-2026-10-15-123045.json')).toBe(true);
    expect(AUTO_RE.test('fitcheck-2026-10-15-123045-2.json')).toBe(true);
    expect(AUTO_RE.test('fitcheck-2026-10-15-123045-999.json')).toBe(true);

    // Invalid
    expect(AUTO_RE.test('fitcheck-2026-10-15.json')).toBe(false);
    expect(AUTO_RE.test('fitcheck-backup-2026-10-15.json')).toBe(false);
    expect(AUTO_RE.test('random-file.txt')).toBe(false);
  });

  it('SAFETY_RE validates safety snapshot filenames before import or reset', () => {
    expect(SAFETY_RE.test('fitcheck-przed-importem-2026-10-15-123045.json')).toBe(true);
    expect(SAFETY_RE.test('fitcheck-przed-czyszczeniem-2026-10-15-123045.json')).toBe(true);
    expect(SAFETY_RE.test('fitcheck-przed-importem-2026-10-15-123045-3.json')).toBe(true);

    // Invalid
    expect(SAFETY_RE.test('fitcheck-przed-edycja-2026-10-15-123045.json')).toBe(false);
  });

  it('stampOf formats predictable timestamp strings', () => {
    const fixedDate = new Date(2026, 9, 15, 14, 5, 9); // Oct 15, 2026 14:05:09
    const stamp = stampOf(fixedDate);
    expect(stamp).toBe('2026-10-15-140509');
  });

  it('poolKey generates zero-padded collation keys for rotation ordering', () => {
    const match1 = AUTO_RE.exec('fitcheck-2026-10-15-123045.json');
    const match2 = AUTO_RE.exec('fitcheck-2026-10-15-123045-2.json');
    expect(match1).not.toBeNull();
    expect(match2).not.toBeNull();

    expect(poolKey(match1!)).toBe('2026-10-15-123045-001');
    expect(poolKey(match2!)).toBe('2026-10-15-123045-002');
  });

  describe('parseAndValidateBackup validation rules', () => {
    it('successfully parses and validates valid backup JSON', () => {
      const backup = buildBackup(sampleState);
      const jsonStr = JSON.stringify(backup);
      const parsed = parseAndValidateBackup(jsonStr);

      expect(parsed.format).toBe('fitcheck-backup');
      expect(parsed.schemaVersion).toBe(SCHEMA_VERSION);
      expect(parsed.state.custom_spaces).toHaveLength(1);
      expect(parsed.state.user_cargo_items).toHaveLength(1);
      expect(parsed.state.pack_sessions).toHaveLength(1);
    });

    it('rejects invalid JSON syntax', () => {
      expect(() => parseAndValidateBackup('{ not valid json')).toThrow('Nieprawidłowy format JSON');
    });

    it('rejects primitive JSON values or null', () => {
      expect(() => parseAndValidateBackup('"just a string"')).toThrow('Plik kopii musi być obiektem JSON');
      expect(() => parseAndValidateBackup('123')).toThrow('Plik kopii musi być obiektem JSON');
      expect(() => parseAndValidateBackup('null')).toThrow('Plik kopii musi być obiektem JSON');
    });

    it('rejects unknown format envelope', () => {
      const invalid = { format: 'other-app', schemaVersion: 2, state: sampleState };
      expect(() => parseAndValidateBackup(JSON.stringify(invalid))).toThrow('Nieznany format pliku');
    });

    it('rejects missing or invalid schema version', () => {
      const invalid = { format: 'fitcheck-backup', schemaVersion: -1, state: sampleState };
      expect(() => parseAndValidateBackup(JSON.stringify(invalid))).toThrow('Nieprawidłowa wersja schematu');
    });

    it('rejects backup from future schema version', () => {
      const future = { format: 'fitcheck-backup', schemaVersion: SCHEMA_VERSION + 1, state: sampleState };
      expect(() => parseAndValidateBackup(JSON.stringify(future))).toThrow('Kopia pochodzi z nowszej wersji aplikacji');
    });

    it('rejects missing state object', () => {
      const noState = { format: 'fitcheck-backup', schemaVersion: 2 };
      expect(() => parseAndValidateBackup(JSON.stringify(noState))).toThrow('Brak danych stanu');
    });

    it('rejects invalid nested collections', () => {
      const invalidCustom = {
        format: 'fitcheck-backup',
        schemaVersion: 2,
        state: { ...sampleState, custom_spaces: 'not an array' },
      };
      expect(() => parseAndValidateBackup(JSON.stringify(invalidCustom))).toThrow('Nieprawidłowa struktura custom_spaces');
    });
  });

  describe('file operations with mocked expo-file-system', () => {
    it('autoBackup writes JSON file with fitcheck prefix', async () => {
      const path = await autoBackup(sampleState);
      expect(path).toContain('fitcheck-');
      expect(path).toContain('.json');
    });

    it('safetyBackup writes safety snapshot with requested prefix', async () => {
      const importSnap = await safetyBackup('import', sampleState);
      expect(importSnap).toContain('fitcheck-przed-importem-');

      const resetSnap = await safetyBackup('reset', sampleState);
      expect(resetSnap).toContain('fitcheck-przed-czyszczeniem-');
    });

    it('exportBackup shares temp file through expo-sharing', async () => {
      const success = await exportBackup(sampleState);
      expect(success).toBe(true);
    });
  });
});
