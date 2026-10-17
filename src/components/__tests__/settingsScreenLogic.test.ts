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

import { getDatabaseService } from '../../data/db';
import { WatchSyncService } from '../../services/WatchSyncService';
import {
  useRitualProfile,
  RITUAL_PROFILES,
  getStoredRitualProfile,
  setStoredRitualProfile,
} from '../../services/ritual-profile';
import { exportBackup, safetyBackup, buildBackup, parseAndValidateBackup } from '../../lib/backup';
import { CRAFT_APPS, getCraftTheme } from '../../core/craft-suite-theme';
import { setLang, useLang, t } from '../../lib/i18n';
import { setUnitSystem, getUnitSystem } from '../../lib/unit-converter';

describe('Settings Screen Business Logic & Craft Studio Guarantees', () => {
  const db = getDatabaseService();
  const watchSync = new WatchSyncService(db);

  beforeEach(() => {
    db.initialize();
  });

  describe('Ritual Profile Management & Dynamic UI Switcher', () => {
    it('supports selecting and persisting all 3 artisan profiles', () => {
      setStoredRitualProfile('daily');
      expect(getStoredRitualProfile()).toBe('daily');
      expect(RITUAL_PROFILES.daily.title).toBe('Codzienny Transport & Zakupy');

      setStoredRitualProfile('architect');
      expect(getStoredRitualProfile()).toBe('architect');
      expect(RITUAL_PROFILES.architect.title).toBe('Wnętrza & Przeprowadzki');
      expect(RITUAL_PROFILES.architect.subtitle).toBe(
        'Problem ruchomej sofy (Moving Sofa), ościeżnice, wnęki i skosy poddasza'
      );

      setStoredRitualProfile('expedition');
      expect(getStoredRitualProfile()).toBe('expedition');
      expect(RITUAL_PROFILES.expedition.title).toBe('Wyprawy & Przyczepa');
    });

    it('each ritual profile defines at least 3 high-craft primary tools', () => {
      Object.values(RITUAL_PROFILES).forEach((p) => {
        expect(p.primaryTools.length).toBeGreaterThanOrEqual(3);
        p.primaryTools.forEach((tool) => {
          expect(typeof tool).toBe('string');
          expect(tool.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Apps4Craft Studio Family Ecosystem Integrity', () => {
    it('defines all 6 artisanal studio apps with unique themes and domains', () => {
      const requiredApps = ['fitcheck', 'napar', 'piekarz', 'sloik', 'masaz', 'ferment'] as const;

      requiredApps.forEach((appId) => {
        const app = CRAFT_APPS[appId];
        expect(app).toBeDefined();
        expect(app.id).toBe(appId);
        expect(app.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(app.name.length).toBeGreaterThan(0);
        expect(app.domain.length).toBeGreaterThan(0);
        expect(app.heroDescriptor.length).toBeGreaterThan(0);
      });
    });

    it('returns fitcheck theme as default studio theme with anodized titanium sky accent', () => {
      const theme = getCraftTheme('fitcheck');
      expect(theme.id).toBe('fitcheck');
      expect(theme.accent).toBe('#38BDF8');
      expect(theme.name).toContain('FitCheck');
    });
  });

  describe('Apple Watch Companion & Taptic Feedback (DEC-03, DEC-31)', () => {
    it('generates session data for Apple Watch with accurate step orders', () => {
      const snapshot = watchSync.generateWatchSnapshot(
        'sess-watch-test',
        'Škoda Octavia IV',
        [
          {
            itemId: 'heavy-item',
            sequenceOrder: 1,
            positionMm: { xMm: 100, yMm: 200, zMm: 0 },
            orientedDimensionsMm: { lengthMm: 500, widthMm: 400, heightMm: 400 },
          },
        ],
        [{ id: 'heavy-item', name: 'Pralka 68kg', weightKg: 68, isFragile: true }]
      );

      expect(snapshot).toBeDefined();
      expect(snapshot.sessionId).toBe('sess-watch-test');
      expect(snapshot.vehicleName).toBe('Škoda Octavia IV');
      expect(snapshot.totalItemsCount).toBe(1);
      expect(snapshot.steps[0].isHeavy).toBe(true);
      expect(snapshot.steps[0].isFragile).toBe(true);
      expect(snapshot.steps[0].recommendedHaptic).toBe('FRAGILE_ITEM_WARNING');
    });

    it('toggles packing state and returns session completion status', () => {
      const toggleRes = watchSync.toggleWatchStepPacked('sess-watch-test', 'heavy-item', true);
      expect(toggleRes).toBeDefined();
      expect(toggleRes.nextHaptic).toBeDefined();
    });
  });

  describe('Database Export, Backup Safety & Rollback (ZP-06)', () => {
    it('generates compliant JSON Schema v2 export payload', () => {
      const payload = db.exportBackupJson();
      expect(payload.schema_version).toBe(2);
      expect(payload.exported_at).toBeDefined();
      expect(payload.bundle_id).toBe('com.apps4brew.fitcheck');
      expect(payload.data).toBeDefined();
      expect(Array.isArray(payload.data.custom_spaces)).toBe(true);
      expect(Array.isArray(payload.data.user_cargo_items)).toBe(true);
    });

    it('creates automatic safety snapshot before major data operations', async () => {
      const currentData = db.exportBackupJson().data;
      const snapshotPath = await safetyBackup('reset', currentData);

      expect(snapshotPath).toBeDefined();
      expect(typeof snapshotPath).toBe('string');
      expect(snapshotPath).toContain('fitcheck-przed-czyszczeniem-');
    });

    it('validates corrupted backup JSON and rejects invalid schema safely', () => {
      const corruptPayload = '{"invalid": true, "missingVersion": true}';
      expect(() => parseAndValidateBackup(corruptPayload)).toThrow(
        'Nieznany format pliku (oczekiwano "fitcheck-backup")'
      );

      const invalidJson = 'not valid json at all';
      expect(() => parseAndValidateBackup(invalidJson)).toThrow('Nieprawidłowy format JSON');
    });

    it('builds compliant backup envelope', () => {
      const currentData = db.exportBackupJson().data;
      const envelope = buildBackup(currentData);
      expect(envelope.schemaVersion).toBe(2);
      expect(envelope.format).toBe('fitcheck-backup');
      expect(envelope.bundleId).toBe('com.apps4brew.fitcheck');
      expect(envelope.state).toEqual(currentData);
    });
  });

  describe('Internationalization & Unit Preferences', () => {
    it('persists and triggers translation changes between PL and EN', () => {
      setLang('pl');
      expect(t('Załadunek')).toBe('Załadunek');

      setLang('en');
      expect(t('Załadunek')).toBe('Pack');

      // Reset back to PL
      setLang('pl');
      expect(t('Załadunek')).toBe('Załadunek');
    });

    it('switches between metric (mm/cm/kg) and imperial (in/ft/lbs) smoothly', () => {
      setUnitSystem('metric');
      expect(getUnitSystem()).toBe('metric');

      setUnitSystem('imperial');
      expect(getUnitSystem()).toBe('imperial');

      // Reset to metric
      setUnitSystem('metric');
      expect(getUnitSystem()).toBe('metric');
    });
  });
});
