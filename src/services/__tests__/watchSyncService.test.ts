/**
 * Czy się zmieści? (FitCheck) — WatchSyncService & Presets Tests
 * Weryfikacja integracji z Apple Watch (DEC-03, DEC-31) i kompletności bazy presetów.
 */

import { WatchSyncService } from '../WatchSyncService';
import { DatabaseService } from '../../data/db/database';
import { MemorySQLiteDriver } from '../../data/db/driver';
import { POPULAR_VEHICLES_PRESETS } from '../../data/presets/vehicles';
import { CARGO_ITEMS_PRESETS } from '../../data/presets/cargoItems';
import { MOVING_FLEET_PRESETS } from '../../data/presets/movingFleet';
import { PackedPlacement } from '../../domain/geometry/types';

describe('WatchSyncService & Presets Integration', () => {
  let driver: MemorySQLiteDriver;
  let db: DatabaseService;
  let watchService: WatchSyncService;

  beforeEach(() => {
    driver = new MemorySQLiteDriver();
    db = new DatabaseService(driver);
    db.initialize();
    watchService = new WatchSyncService(db);
  });

  describe('Presets Quality & Completeness', () => {
    it('verifies that all vehicle presets have valid geometry and positive VDA volume', () => {
      expect(POPULAR_VEHICLES_PRESETS.length).toBeGreaterThanOrEqual(8);
      for (const v of POPULAR_VEHICLES_PRESETS) {
        expect(v.id).toBeDefined();
        expect(v.make.length).toBeGreaterThan(0);
        expect(v.model.length).toBeGreaterThan(0);
        expect(v.vdaVolumeLiters).toBeGreaterThan(300);
        expect(v.trunk.lengthFloorMm).toBeGreaterThan(700);
        expect(v.trunk.widthMinMm).toBeGreaterThan(800);
        expect(v.trunk.heightRoofMm).toBeGreaterThan(600);
        expect(v.specs.curbWeightKg).toBeGreaterThan(1000);
        expect(v.specs.grossVehicleWeightKg).toBeGreaterThan(v.specs.curbWeightKg);
        expect(v.specs.maxRoofLoadKg).toBeGreaterThanOrEqual(50);
        expect(v.specs.maxTowbarLoadKg).toBeGreaterThanOrEqual(50);
      }
    });

    it('verifies that cargo items have valid dimensions and categories', () => {
      expect(CARGO_ITEMS_PRESETS.length).toBeGreaterThanOrEqual(15);
      const categories = new Set(CARGO_ITEMS_PRESETS.map((c) => c.category));
      expect(categories.has('karton')).toBe(true);
      expect(categories.has('walizka')).toBe(true);
      expect(categories.has('mebel_ikea')).toBe(true);
      expect(categories.has('agd')).toBe(true);
      expect(categories.has('sport')).toBe(true);

      for (const item of CARGO_ITEMS_PRESETS) {
        expect(item.dimensionsMm.lengthMm).toBeGreaterThan(0);
        expect(item.dimensionsMm.widthMm).toBeGreaterThan(0);
        expect(item.dimensionsMm.heightMm).toBeGreaterThan(0);
        expect(item.weightKg).toBeGreaterThan(0);
        expect(['XYZ', 'Z_ONLY']).toContain(item.rotationConstraint);
      }
    });

    it('verifies that moving fleet presets cover L1H1 to 20m3 box van', () => {
      expect(MOVING_FLEET_PRESETS.length).toBe(5);
      const codes = MOVING_FLEET_PRESETS.map((f) => f.code);
      expect(codes).toEqual(['L1H1', 'L2H2', 'L3H2', 'L4H3', 'BOX_20M3']);

      for (const van of MOVING_FLEET_PRESETS) {
        expect(van.cargoVolumeM3).toBeGreaterThan(7.0);
        expect(van.cargoLengthMm).toBeGreaterThan(2500);
        expect(van.maxPayloadKg).toBeGreaterThan(900);
        expect(van.categoryB).toBe(true);
      }
    });
  });

  describe('Apple Watch Session Snapshot Generation', () => {
    it('generates sorted loading sequence with haptic feedback assignments', () => {
      const sessionId = 'session_watch_test';
      db.createPackSession({
        id: sessionId,
        name: 'Sesja Octavia',
        target_space_id: 'space-1',
        passengers_count: 2,
      });

      const placements: PackedPlacement[] = [
        {
          itemId: 'appliance-washing-machine',
          positionMm: { xMm: 100, yMm: 200, zMm: 0 },
          orientedDimensionsMm: { lengthMm: 600, widthMm: 600, heightMm: 850 },
          sequenceOrder: 1,
        },
        {
          itemId: 'rtv-tv-55-box',
          positionMm: { xMm: 700, yMm: 100, zMm: 0 },
          orientedDimensionsMm: { lengthMm: 1350, widthMm: 150, heightMm: 820 },
          sequenceOrder: 2,
        },
        {
          itemId: 'box-s',
          positionMm: { xMm: 150, yMm: 200, zMm: 850 },
          orientedDimensionsMm: { lengthMm: 400, widthMm: 300, heightMm: 300 },
          sequenceOrder: 3,
        },
      ];

      const snapshot = watchService.generateWatchSnapshot(
        sessionId,
        'Škoda Octavia IV Combi',
        placements,
        CARGO_ITEMS_PRESETS
      );

      expect(snapshot.sessionId).toBe(sessionId);
      expect(snapshot.vehicleName).toBe('Škoda Octavia IV Combi');
      expect(snapshot.totalItemsCount).toBe(3);
      expect(snapshot.packedItemsCount).toBe(0);
      expect(snapshot.progressPercentage).toBe(0);
      expect(snapshot.steps).toHaveLength(3);

      // Krok 1 powinien być ciężką pralką przy grodzi (x=100)
      const step1 = snapshot.steps[0];
      expect(step1.itemId).toBe('appliance-washing-machine');
      expect(step1.isHeavy).toBe(true);
      expect(step1.recommendedHaptic).toBe('HEAVY_ITEM_WARNING');
      expect(step1.positionDescription).toContain('Przy samej ścianie grodziowej');

      // Krok 3 powinien mieć telewizor z ostrzeżeniem FRAGILE
      const tvStep = snapshot.steps.find((s) => s.itemId === 'rtv-tv-55-box')!;
      expect(tvStep.isFragile).toBe(true);
      expect(tvStep.recommendedHaptic).toBe('FRAGILE_ITEM_WARNING');
    });

    it('updates item status when packed on watch and triggers session finish haptic', () => {
      const sessionId = 'session_watch_toggle';
      db.createPackSession({
        id: sessionId,
        name: 'Sesja Passat',
        target_space_id: 'space-1',
        passengers_count: 1,
      });

      // Zapisujemy pozycję w bazie
      db.insertSessionItem({
        id: 'item_1',
        session_id: sessionId,
        cargo_item_id: 'preset_suitcase_m',
        pos_x_cm: 10,
        pos_y_cm: 20,
        pos_z_cm: 0,
        dim_x_cm: 40,
        dim_y_cm: 30,
        dim_z_cm: 30,
        sequence_order: 1,
        is_packed: false,
      });

      const res1 = watchService.toggleWatchStepPacked(sessionId, 'item_1', true);
      expect(res1.isFinished).toBe(true);
      expect(res1.nextHaptic).toBe('SESSION_FINISHED');

      const items = db.getSessionItems(sessionId);
      expect(items[0].is_packed).toBe(1);
    });
  });
});
