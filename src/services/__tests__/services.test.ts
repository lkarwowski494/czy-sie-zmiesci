import { DatabaseService } from '../../data/db/database';
import { MemorySQLiteDriver } from '../../data/db/driver';
import { PackSessionService } from '../PackSessionService';
import { RelocationService } from '../RelocationService';
import { RoomFittingService } from '../RoomFittingService';
import { GarageSafetyService } from '../GarageSafetyService';

describe('Application Services Integration (Warstwa 4: Integracja logiki biznesowej)', () => {
  let driver: MemorySQLiteDriver;
  let db: DatabaseService;
  let packSessionService: PackSessionService;
  let relocationService: RelocationService;
  let roomFittingService: RoomFittingService;
  let garageSafetyService: GarageSafetyService;

  beforeEach(() => {
    driver = new MemorySQLiteDriver();
    db = new DatabaseService(driver);
    db.initialize();

    packSessionService = new PackSessionService(db);
    relocationService = new RelocationService(db);
    roomFittingService = new RoomFittingService();
    garageSafetyService = new GarageSafetyService();
  });

  afterEach(() => {
    driver.closeSync();
  });

  describe('PackSessionService', () => {
    it('creates pack session, packs items, saves 3D placements to database and returns comprehensive report', () => {
      packSessionService.createSession({
        id: 'session_holiday',
        name: 'Wakacje z rodziną',
        targetSpaceId: 'space_octavia_standard',
        passengersCount: 3,
      });

      const report = packSessionService.runPacking('session_holiday', [
        'preset_suitcase_l',
        'preset_suitcase_m',
        'preset_moving_box_std',
      ]);

      expect(report.sessionId).toBe('session_holiday');
      expect(report.vehicleName).toContain('Skoda');
      expect(report.isFullyPacked).toBe(true);
      expect(report.packingResult.placements.length).toBe(3);
      expect(report.payloadResult.status).toBe('SAFE');
      expect(report.cogResult.isLateralSymmetric).toBe(true);

      // Verify records in database
      const sessionInDb = db.getPackSession('session_holiday');
      expect(sessionInDb).toBeDefined();
      expect(Number(sessionInDb!['packing_efficiency_pct'])).toBeGreaterThan(0);
      expect(Number(sessionInDb!['total_weight_kg'])).toBe(52); // 22 + 10 + 20

      const sessionItems = db.getSessionItems('session_holiday');
      expect(sessionItems.length).toBe(3);
      expect(sessionItems.every(i => typeof i['pos_x_cm'] === 'number')).toBe(true);
    });

    it('throws error when packing unknown session or unknown space', () => {
      expect(() => {
        packSessionService.runPacking('non_existent_session', ['preset_suitcase_l']);
      }).toThrow(/nie istnieje/);
    });
  });

  describe('RelocationService', () => {
    it('creates relocation project and divides inventory into 4 distinct phases', () => {
      relocationService.createProject({
        id: 'reloc_warsaw',
        name: 'Mokotów do Wilanowa',
        originAreaM2: 65,
        residentsCount: 3,
        clutterLevel: 'standard',
      });

      const plan = relocationService.planPhasedLoading('reloc_warsaw', [
        { itemId: 'preset_washing_machine' },
        { itemId: 'preset_fridge_standard' },
        { itemId: 'preset_ikea_billy' },
        { itemId: 'preset_moving_box_std' },
        { itemId: 'preset_moving_box_std', isFirstNightBox: true },
      ]);

      expect(plan.projectId).toBe('reloc_warsaw');
      expect(plan.volumeEstimation.estimatedVolumeM3).toBeGreaterThan(20);
      expect(plan.phases.length).toBe(4);

      // Phase 1: heavy appliances (washing machine, fridge)
      const phase1 = plan.phases.find(p => p.phase === 'heavy_appliance');
      expect(phase1!.items.length).toBe(2);

      // Phase 2: base items (billy, std moving box)
      const phase2 = plan.phases.find(p => p.phase === 'base');
      expect(phase2!.items.length).toBe(2);

      // Phase 4: first night box
      const phase4 = plan.phases.find(p => p.phase === 'first_night');
      expect(phase4!.items.length).toBe(1);

      expect(plan.recommendations.length).toBeGreaterThan(0);

      const manifest = relocationService.generateMarkdownManifest(plan);
      expect(manifest).toContain('# 🚚 Plan Przeprowadzki');
      expect(manifest).toContain('reloc_warsaw');
      expect(manifest).toContain('Faza 1: Ciężkie AGD');
      expect(manifest).toContain('Karton „Pierwsza Noc”');
    });
  });

  describe('RoomFittingService', () => {
    it('evaluates complete furniture journey through doorway, stairs and niche', () => {
      const result = roomFittingService.assessFurnitureInstallation({
        itemName: 'Szafa Pax 150',
        itemDimensionsMm: { lengthMm: 600, widthMm: 1500, heightMm: 2010 },
        niche: {
          widthTopMm: 1540,
          widthMiddleMm: 1540,
          widthBottomMm: 1540,
          depthMm: 650,
          heightMm: 2500,
          skirtingBoardThicknessMm: 15,
          hasSkirtingBoards: true,
        },
        doorway: {
          nominalWidthMm: 900,
          doorSwingAngleDeg: 180,
          isDoorLeafRemovable: true,
          isHandleRemovable: true,
        },
        staircase: {
          flightWidthMm: 1200,
          landingDepthMm: 1300,
          ceilingHeightMm: 2600,
          turnAngleDeg: 90,
          hasHandrailObstruction: false,
        },
      });

      expect(result.itemName).toBe('Szafa Pax 150');
      expect(result.nicheFit.fitsOverall).toBe(true);
      expect(result.doorwayClearance.canPass).toBe(true);
      expect(result.staircaseTurn?.canPass).toBe(true);
      expect(result.isFullyFeasible).toBe(true);
      expect(result.summaryVerdict).toContain('zmieści się we wnęce');
    });

    it('evaluates refrigerator side ventilation and door clearance', () => {
      const fridge = {
        widthMm: 600,
        depthMm: 650,
        heightMm: 1850,
        distanceToSideWallMm: 120,
        doorSwingAngleDeg: 125,
      };

      const fit = roomFittingService.assessRefrigerator(fridge, {
        widthMm: 700,
        depthMm: 720,
        heightMm: 1900,
      });

      expect(fit.canVentilateSafely).toBe(true);
      expect(fit.canOpenFreezerDrawers).toBe(true);
    });

    it('evaluates washing machine installation depth with plumbing', () => {
      const fit = roomFittingService.assessWashingMachine(
        { catalogDepthMm: 550, widthMm: 600, heightMm: 850 },
        680
      );

      expect(fit.canFitInEnclosure).toBe(true);
      expect(fit.marginMm).toBe(15); // 680 - (550 + 80 + 35) = 15
    });
  });

  describe('GarageSafetyService', () => {
    it('evaluates garage parking with folded mirrors and towbar bike rack', () => {
      const vehicle = {
        bodyWidthMm: 1850,
        widthWithMirrorsMm: 2120,
        widthWithFoldedMirrorsMm: 1930,
        baseHeightMm: 1650,
        tailgateMaxOpenHeightMm: 2050,
      };

      const garage = {
        gateWidthMm: 2100, // tight gate: open mirrors will fail, folded will pass
        interiorWidthMm: 2800,
        ceilingHeightMm: 2200,
        gateRunnerHeightMm: 2150,
        maxEntrySignHeightM: 2.0,
      };

      const roofSetup = {
        vehicleHeightMm: 1650,
        roofBarsHeightMm: 80,
        roofCargoHeightMm: 400,
      }; // Total = 1650 + 80 + 400 + 30 bounce = 2160 mm > 2000 mm sign!

      const report = garageSafetyService.checkGarageParking(
        vehicle,
        garage,
        roofSetup
      );

      expect(report.garageFit.canEnterWithOpenMirrors).toBe(false);
      expect(report.garageFit.canEnterWithFoldedMirrors).toBe(true);
      expect(report.roofFit?.canEnterSign200m).toBe(false);
      expect(report.isSafeToEnter).toBe(false);
      expect(report.summaryVerdict).toContain('Zestaw dachowy przekracza skrajnię');
    });
  });
});
