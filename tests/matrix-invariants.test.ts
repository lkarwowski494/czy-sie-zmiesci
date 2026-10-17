/**
 * matrix-invariants.test.ts
 * Losowe sekwencje akcji na pełnym stanie z gwarantowanym krokiem otwierającym (BR-TEST-007..010)
 */

import { PROP_SEED } from './prop-seed';
import { DatabaseService } from '../src/data/db/database';
import { MemorySQLiteDriver } from '../src/data/db/driver';
import { CARGO_ITEMS_PRESETS } from '../src/data/presets/cargoItems';
import { POPULAR_VEHICLES_PRESETS } from '../src/data/presets/vehicles';
import { calculateElevatorFit } from '../src/domain/doors-stairs/elevatorDiagonal';

interface InvariantStats {
  openingStepExecuted: number;
  customItemAdded: number;
  fitCalculated: number;
  backupExported: number;
  invariantsChecked: number;
}

describe('State Invariants & Guaranteed Opening Step (BR-TEST-007..010)', () => {
  const stats: InvariantStats = {
    openingStepExecuted: 0,
    customItemAdded: 0,
    fitCalculated: 0,
    backupExported: 0,
    invariantsChecked: 0,
  };

  let driver: MemorySQLiteDriver;
  let db: DatabaseService;

  beforeEach(() => {
    driver = new MemorySQLiteDriver();
    db = new DatabaseService(driver);
    db.initialize();
  });

  afterEach(() => {
    // BR-TEST-010: Zwalnianie uchwytów natywnych/pamięciowych przeciw wyciekom
    db.close();
    driver.closeSync();
  });

  function assertStateInvariants(dbInstance: DatabaseService) {
    stats.invariantsChecked++;
    const items = dbInstance.getCargoItems();
    const vehicles = dbInstance.getAllVehicles();

    // Inwariant 1: Liczba presetów pojazdów >= 2
    expect(vehicles.length).toBeGreaterThanOrEqual(2);

    // Inwariant 2: Wszystkie identyfikatory przedmiotów są unikalne
    const ids = items.map((i: any) => String(i.id));
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    // Inwariant 3: Wymiary fizyczne muszą być dodatnie (> 0)
    for (const it of items) {
      expect(Number(it.length_cm)).toBeGreaterThan(0);
      expect(Number(it.width_cm)).toBeGreaterThan(0);
      expect(Number(it.height_cm)).toBeGreaterThan(0);
      expect(Number(it.weight_kg)).toBeGreaterThan(0);
    }

    // Inwariant 4: Presety mebli nie mogą być puste
    const presetItems = items.filter((i: any) => i.is_preset === 1 || i.is_preset === true);
    expect(presetItems.length).toBeGreaterThanOrEqual(5);

    // Inwariant 5: Każdy pojazd posiada prawidłową masę całkowitą DMC > masy własnej
    for (const v of vehicles) {
      expect(Number(v.gvw_kg)).toBeGreaterThan(Number(v.curb_weight_kg));
    }
  }

  it('executes guaranteed opening step followed by randomized state actions', () => {
    assertStateInvariants(db);

    // --- KROK OTWIERAJĄCY (Guaranteed Opening Step, BR-TEST-007, BR-TEST-008) ---
    // Gwarantuje przetestowanie dodania mebla o nietypowych gabarytach,
    // wyliczenia skrajni windy z uderzeniem w ścianę oraz eksportu kopii
    db.insertCustomCargoItem({
      id: 'custom_opening_sofa',
      name: '__GUARANTEED_OPENING_SOFA__',
      category: 'furniture',
      length_cm: 245,
      width_cm: 95,
      height_cm: 85,
      weight_kg: 78,
    });
    stats.openingStepExecuted++;
    assertStateInvariants(db);

    // Wyliczenie skrajni windy dla przedmiotu otwierającego
    const fitRes = calculateElevatorFit(
      { lengthMm: 2450, widthMm: 950, heightMm: 850 },
      { depthMm: 1000, widthMm: 900, heightMm: 2100, doorWidthMm: 700, doorHeightMm: 2000 }
    );
    expect(fitRes.fitsThroughDoor).toBe(false); // Za szeroki na drzwi 700 mm
    stats.fitCalculated++;

    // Eksport kopii zapasowej
    const backup = db.exportBackupJson();
    expect(backup.schema_version).toBeDefined();
    stats.backupExported++;

    // --- PĘTLA DETERMINISTYCZNYCH SEKWENCJI LOSOWYCH Z PROP_SEED ---
    const runs = Number(process.env.MATRIX_RUNS) || 30;
    let seed = PROP_SEED;

    const nextRandom = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let i = 0; i < runs; i++) {
      const action = Math.floor(nextRandom() * 3);

      if (action === 0) {
        // Dodaj losowy mebel
        const len = Math.floor(nextRandom() * 200) + 20;
        const wid = Math.floor(nextRandom() * 100) + 10;
        const hgt = Math.floor(nextRandom() * 100) + 10;
        const wgt = Math.floor(nextRandom() * 80) + 1;
        db.insertCustomCargoItem({
          id: `rand_item_${i}_${Math.floor(nextRandom() * 10000)}`,
          name: `RandItem_${i}`,
          category: 'boxes',
          length_cm: len,
          width_cm: wid,
          height_cm: hgt,
          weight_kg: wgt,
        });
        stats.customItemAdded++;
      } else if (action === 1) {
        // Wykonaj obliczenie dopasowania
        calculateElevatorFit(
          { lengthMm: 1800, widthMm: 800, heightMm: 700 },
          { depthMm: 1400, widthMm: 1100, heightMm: 2200, doorWidthMm: 800, doorHeightMm: 2000 }
        );
        stats.fitCalculated++;
      } else {
        // Eksport kopii
        db.exportBackupJson();
        stats.backupExported++;
      }

      assertStateInvariants(db);
    }

    // --- WERYFIKACJA LICZNIKÓW TRAFIEŃ (BR-TEST-009, zakaz vacuous truth) ---
    expect(stats.openingStepExecuted).toBe(1);
    expect(stats.customItemAdded).toBeGreaterThan(0);
    expect(stats.fitCalculated).toBeGreaterThan(0);
    expect(stats.backupExported).toBeGreaterThan(0);
    expect(stats.invariantsChecked).toBeGreaterThan(20);
  });
});
