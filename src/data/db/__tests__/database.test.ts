import { DatabaseService } from '../database';
import { MemorySQLiteDriver } from '../driver';
import { SCHEMA_VERSION } from '../schema';

describe('DatabaseService & SQLite Transactions (Warstwa 5: Baza danych i JSON roundtrip)', () => {
  let driver: MemorySQLiteDriver;
  let db: DatabaseService;

  beforeEach(() => {
    driver = new MemorySQLiteDriver();
    db = new DatabaseService(driver);
    db.initialize();
  });

  afterEach(() => {
    driver.closeSync();
  });

  it('initializes 13 tables and seeds standard vehicles and cargo presets', () => {
    const vehicles = db.getAllVehicles();
    expect(vehicles.length).toBeGreaterThanOrEqual(2);

    const octavia = vehicles.find(v => v.make === 'Skoda');
    expect(octavia).toBeDefined();

    const spaces = db.getVehicleSpaces(String(octavia!.id));
    expect(spaces.length).toBe(2);

    const cargo = db.getCargoItems();
    expect(cargo.length).toBeGreaterThanOrEqual(7);
    expect(cargo.some(c => c.id === 'preset_suitcase_l')).toBe(true);
    expect(cargo.some(c => c.id === 'preset_washing_machine')).toBe(true);
  });

  it('allows creating custom cargo items and retrieving them', () => {
    db.insertCustomCargoItem({
      id: 'custom_guitar',
      category: 'luggage',
      name: 'Gitara akustyczna w futerale',
      length_cm: 110,
      width_cm: 45,
      height_cm: 18,
      weight_kg: 5.5,
      is_fragile: true,
      color_hex: '#EF4444',
    });

    const items = db.getCargoItems();
    const guitar = items.find(i => i.id === 'custom_guitar');
    expect(guitar).toBeDefined();
    expect(guitar!.is_fragile).toBe(1);
    expect(guitar!.is_preset).toBe(0);
  });

  it('creates and retrieves pack sessions', () => {
    db.createPackSession({
      id: 'session_holiday_2026',
      name: 'Wakacje Chorwacja 2026',
      target_space_id: 'space_octavia_standard',
      passengers_count: 3,
    });

    const session = db.getPackSession('session_holiday_2026');
    expect(session).toBeDefined();
    expect(session!.name).toBe('Wakacje Chorwacja 2026');
    expect(session!.passengers_count).toBe(3);
  });

  it('enforces foreign key cascading delete when deleting a session with items', () => {
    db.createPackSession({
      id: 'session_to_delete',
      name: 'Sesja testowa',
      target_space_id: 'space_octavia_standard',
      passengers_count: 1,
    });

    // Add item to session
    driver.runSync(
      `INSERT INTO pack_session_items (id, session_id, cargo_item_id, pos_x_cm, pos_y_cm, pos_z_cm, dim_x_cm, dim_y_cm, dim_z_cm, sequence_order, is_packed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['psi_1', 'session_to_delete', 'preset_suitcase_l', 0, 0, 0, 75, 50, 30, 1, 0]
    );

    const itemsBefore = driver.getAllSync('SELECT * FROM pack_session_items WHERE session_id = ?', ['session_to_delete']);
    expect(itemsBefore.length).toBe(1);

    // Delete session
    db.deletePackSession('session_to_delete');

    const sessionAfter = db.getPackSession('session_to_delete');
    expect(sessionAfter).toBeNull();

    // Cascaded items should be deleted
    const itemsAfter = driver.getAllSync('SELECT * FROM pack_session_items WHERE session_id = ?', ['session_to_delete']);
    expect(itemsAfter.length).toBe(0);
  });

  it('enforces foreign key restrict constraint when deleting a referenced cargo item', () => {
    db.createPackSession({
      id: 'session_active',
      name: 'Sesja z walizką',
      target_space_id: 'space_octavia_standard',
      passengers_count: 2,
    });

    driver.runSync(
      `INSERT INTO pack_session_items (id, session_id, cargo_item_id, pos_x_cm, pos_y_cm, pos_z_cm, dim_x_cm, dim_y_cm, dim_z_cm, sequence_order, is_packed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['psi_locked', 'session_active', 'preset_suitcase_l', 0, 0, 0, 75, 50, 30, 1, 0]
    );

    // Attempting to delete preset_suitcase_l must throw due to RESTRICT
    expect(() => {
      driver.runSync('DELETE FROM cargo_items WHERE id = ?', ['preset_suitcase_l']);
    }).toThrow(/FOREIGN KEY constraint failed/);
  });

  it('guarantees atomic rollback on transaction failure', () => {
    const beforeSessions = driver.getAllSync('SELECT * FROM pack_sessions');

    expect(() => {
      driver.withTransactionSync(() => {
        driver.runSync(
          `INSERT INTO pack_sessions (id, name, target_space_id, passengers_count, total_weight_kg, packing_efficiency_pct, is_valid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ['s_atomic_1', 'Sesja 1', 'space_octavia_standard', 1, 0, 0, 1, 100, 100]
        );
        // Intentional error inside transaction
        throw new Error('Database unexpected IO error');
      });
    }).toThrow('Database unexpected IO error');

    const afterSessions = driver.getAllSync('SELECT * FROM pack_sessions');
    // Ensure 's_atomic_1' was NOT committed and database was completely restored
    expect(afterSessions.length).toBe(beforeSessions.length);
    expect(afterSessions.find(s => (s as any).id === 's_atomic_1')).toBeUndefined();
  });

  it('exports and restores complete JSON backup (roundtrip)', () => {
    // 1. Create user data
    db.insertCustomCargoItem({
      id: 'user_item_roundtrip',
      category: 'diy',
      name: 'Wiertarka udarowa',
      length_cm: 35,
      width_cm: 25,
      height_cm: 12,
      weight_kg: 3.8,
    });

    db.createPackSession({
      id: 'session_roundtrip',
      name: 'Remont mieszkania',
      target_space_id: 'space_passat_standard',
      passengers_count: 1,
    });

    db.createRelocationProject({
      id: 'reloc_roundtrip',
      name: 'Przeprowadzka do Krakowa',
      origin_type: 'apartment',
      origin_area_m2: 64,
      residents_count: 2,
      clutter_level: 'standard',
      total_volume_m3: 25.5,
      total_weight_kg: 1650,
      recommended_vehicle_type: 'box_truck',
    });

    // 2. Export backup JSON
    const backup = db.exportBackupJson();

    expect(backup.schema_version).toBe(SCHEMA_VERSION);
    expect(backup.bundle_id).toBe('com.apps4brew.fitcheck');
    expect(backup.data.user_cargo_items.length).toBe(1);
    expect(backup.data.pack_sessions.length).toBe(1);
    expect(backup.data.relocation_projects.length).toBe(1);

    // 3. Clear and import into fresh database
    const freshDriver = new MemorySQLiteDriver();
    const freshDb = new DatabaseService(freshDriver);
    freshDb.initialize();

    const importRes = freshDb.importBackupJson(backup);
    expect(importRes.success).toBe(true);
    expect(importRes.restoredRecordsCount).toBe(3);

    const restoredItems = freshDb.getCargoItems();
    expect(restoredItems.some(i => i.id === 'user_item_roundtrip')).toBe(true);

    const restoredSession = freshDb.getPackSession('session_roundtrip');
    expect(restoredSession).toBeDefined();
    expect(restoredSession!.name).toBe('Remont mieszkania');

    const restoredReloc = freshDb.getRelocationProject('reloc_roundtrip');
    expect(restoredReloc).toBeDefined();
    expect(restoredReloc!.name).toBe('Przeprowadzka do Krakowa');

    freshDriver.closeSync();
  });

  it('rejects backup with invalid or mismatched schema_version', () => {
    const invalidBackup: any = {
      schema_version: 999, // Incompatible future schema
      bundle_id: 'com.apps4brew.fitcheck',
      exported_at: new Date().toISOString(),
      data: {},
    };

    const res = db.importBackupJson(invalidBackup);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Niezgodna wersja schematu');
  });

  it('rejects malformed backup payload', () => {
    const res = db.importBackupJson(null as any);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Nieprawidłowy format');
  });

  it('provides initialized singleton through getDatabaseService() and supports reset', () => {
    const { getDatabaseService, resetDefaultDatabaseInstance } = require('../index');
    const instance1 = getDatabaseService();
    const instance2 = getDatabaseService();
    expect(instance1).toBe(instance2);
    expect(instance1.getAllVehicles().length).toBeGreaterThan(0);

    resetDefaultDatabaseInstance();
    const instance3 = getDatabaseService();
    expect(instance3).toBeDefined();
    resetDefaultDatabaseInstance();
  });

  describe('Apps4Brew SEC-09 dbDirectory Path Protection', () => {
    it('redirects default Documents/SQLite to private /Library/SQLite', () => {
      const { dbDirectory } = require('../../../lib/db-path');
      expect(dbDirectory('/var/mobile/Containers/Data/Application/123/Documents/SQLite/')).toBe(
        '/var/mobile/Containers/Data/Application/123/Library/SQLite'
      );
      expect(dbDirectory('/var/mobile/Containers/Data/Application/123/Documents/SQLite')).toBe(
        '/var/mobile/Containers/Data/Application/123/Library/SQLite'
      );
    });

    it('returns undefined when directory is already custom or undefined', () => {
      const { dbDirectory } = require('../../../lib/db-path');
      expect(dbDirectory(null)).toBeUndefined();
      expect(dbDirectory(undefined)).toBeUndefined();
      expect(dbDirectory('/some/custom/path')).toBeUndefined();
    });
  });

  describe('ExpoSQLiteDriver wrapper contract', () => {
    it('wraps native expo-sqlite methods correctly', () => {
      const { ExpoSQLiteDriver } = require('../driver');
      let executedSql = '';
      let closed = false;

      const mockNativeDb = {
        execSync: (sql: string) => {
          executedSql = sql;
        },
        runSync: (sql: string, ...params: any[]) => ({
          lastInsertRowId: 42,
          changes: 1,
        }),
        getFirstSync: (sql: string, ...params: any[]) => ({ id: 'row1' }),
        getAllSync: (sql: string, ...params: any[]) => [{ id: 'row1' }, { id: 'row2' }],
        withTransactionSync: (cb: () => any) => cb(),
        closeSync: () => {
          closed = true;
        },
      };

      const driver = new ExpoSQLiteDriver(mockNativeDb);
      driver.execSync('PRAGMA foreign_keys = ON;');
      expect(executedSql).toBe('PRAGMA foreign_keys = ON;');

      const runRes = driver.runSync('INSERT INTO test VALUES (?)', ['val']);
      expect(runRes.lastInsertRowId).toBe(42);
      expect(runRes.changes).toBe(1);

      const first = driver.getFirstSync('SELECT * FROM test');
      expect(first).toEqual({ id: 'row1' });

      const all = driver.getAllSync('SELECT * FROM test');
      expect(all.length).toBe(2);

      const txRes = driver.withTransactionSync(() => 'tx_success');
      expect(txRes).toBe('tx_success');

      driver.closeSync();
      expect(closed).toBe(true);
    });

    it('handles fallback transaction execution when native withTransactionSync is missing', () => {
      const { ExpoSQLiteDriver } = require('../driver');
      const sqlLog: string[] = [];

      const mockNativeDb = {
        execSync: (sql: string) => {
          sqlLog.push(sql);
        },
        runSync: () => ({ lastInsertRowId: 1, changes: 1 }),
        getFirstSync: () => null,
        getAllSync: () => [],
      };

      const driver = new ExpoSQLiteDriver(mockNativeDb);
      const res = driver.withTransactionSync(() => 'fallback_ok');
      expect(res).toBe('fallback_ok');
      expect(sqlLog).toContain('BEGIN IMMEDIATE TRANSACTION;');
      expect(sqlLog).toContain('COMMIT;');

      expect(() => {
        driver.withTransactionSync(() => {
          throw new Error('tx_fail');
        });
      }).toThrow('tx_fail');
      expect(sqlLog).toContain('ROLLBACK;');
    });
  });
});


