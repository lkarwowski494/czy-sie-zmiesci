import {
  analyzeAtticSlope,
  evaluateFurnitureUnderSlope,
  calculateSelfStorageCapacity,
  evaluateFunctionalClearance,
  evaluatePorterManualHandling,
  RECOMMENDED_CLEARANCES_MM,
  FurnitureClearanceType,
} from '../room-fitting/atticAndErgonomics';

describe('Attic Slope Geometry & Room Ergonomics (RD-48, RD-50, RD-51, RD-53, DEC-45, DEC-57)', () => {
  describe('analyzeAtticSlope (RD-48, T-RD-48)', () => {
    it('calculates standing height distance accurately according to test vector T-RD-48', () => {
      // T-RD-48: H_k = 800 mm, alpha = 40 deg
      // tan(40 deg) ~ 0.8391
      // x_190 = (1900 - 800) / 0.8391 = 1100 / 0.8391 ~ 1311 mm
      const result = analyzeAtticSlope({
        kneeWallHeightMm: 800,
        roofPitchDeg: 40,
      });

      expect(result.kneeWallHeightMm).toBe(800);
      expect(result.roofPitchDeg).toBe(40);
      expect(result.roofPitchTan).toBeCloseTo(0.8391, 3);
      expect(result.standingHeightAchievedAtWall).toBe(false);
      expect(Math.round(result.distanceToStandingHeight190Mm)).toBe(1311);
      // Low zone 1400: (1400 - 800) / 0.8391 = 600 / 0.8391 ~ 715 mm
      expect(Math.round(result.distanceToLowZone140Mm)).toBe(715);

      // Height function
      expect(result.heightAtDistance(0)).toBe(800);
      expect(result.heightAtDistance(1311)).toBeCloseTo(1900, -1);
      // Clamped negative distance
      expect(result.heightAtDistance(-50)).toBe(800);
    });

    it('returns distance 0 when knee wall is already >= standing height (1900 mm)', () => {
      const result = analyzeAtticSlope({
        kneeWallHeightMm: 2000,
        roofPitchDeg: 45,
      });

      expect(result.standingHeightAchievedAtWall).toBe(true);
      expect(result.distanceToStandingHeight190Mm).toBe(0);
      expect(result.distanceToLowZone140Mm).toBe(0);
    });

    it('returns distance 0 for low zone when knee wall is between 1400 mm and 1900 mm', () => {
      const result = analyzeAtticSlope({
        kneeWallHeightMm: 1500,
        roofPitchDeg: 45,
      });

      expect(result.standingHeightAchievedAtWall).toBe(false);
      expect(result.distanceToStandingHeight190Mm).toBe(400); // (1900 - 1500)/1
      expect(result.distanceToLowZone140Mm).toBe(0);
    });

    it('throws error for invalid slope angle or negative knee wall', () => {
      expect(() =>
        analyzeAtticSlope({ kneeWallHeightMm: 800, roofPitchDeg: 0 })
      ).toThrow('Kąt nachylenia dachu musi mieścić się w przedziale (0°, 90°)');

      expect(() =>
        analyzeAtticSlope({ kneeWallHeightMm: 800, roofPitchDeg: 90 })
      ).toThrow('Kąt nachylenia dachu musi mieścić się w przedziale (0°, 90°)');

      expect(() =>
        analyzeAtticSlope({ kneeWallHeightMm: -10, roofPitchDeg: 45 })
      ).toThrow('Wysokość ścianki kolankowej nie może być ujemna');
    });
  });

  describe('evaluateFurnitureUnderSlope (RD-48)', () => {
    it('verifies furniture that fits comfortably under slope', () => {
      const slope = { kneeWallHeightMm: 1000, roofPitchDeg: 45 };
      // at distance 500 mm: ceiling back = 1000 + 500 = 1500 mm
      // front (depth 600 mm): ceiling front = 1000 + 1100 = 2100 mm
      const furniture = { widthMm: 1200, depthMm: 600, heightMm: 1400 };

      const result = evaluateFurnitureUnderSlope(furniture, slope, 500);

      expect(result.fitsUnderSlope).toBe(true);
      expect(result.ceilingHeightAtBackMm).toBe(1500);
      expect(result.ceilingHeightAtFrontMm).toBe(2100);
      expect(result.collisionDepthMm).toBe(0);
      expect(result.warnings.length).toBe(0);
    });

    it('detects collision when furniture is too tall at current distance and provides offset advice', () => {
      const slope = { kneeWallHeightMm: 800, roofPitchDeg: 45 }; // tan(45) = 1
      const furniture = { widthMm: 1500, depthMm: 600, heightMm: 1600 };

      // at distance 200 mm: ceiling back = 800 + 200 = 1000 mm < 1600 mm
      const result = evaluateFurnitureUnderSlope(furniture, slope, 200);

      expect(result.fitsUnderSlope).toBe(false);
      expect(result.ceilingHeightAtBackMm).toBe(1000);
      expect(result.minRequiredDistanceFromWallMm).toBe(800); // (1600 - 800) / 1 = 800 mm
      expect(result.collisionDepthMm).toBe(600); // 800 - 200 = 600 mm
      expect(result.warnings.some((w) => w.includes('Kolizja ze skosem'))).toBe(true);
      expect(result.warnings.some((w) => w.includes('odsuń go o min. 800 mm'))).toBe(true);
    });

    it('handles furniture that is lower than the knee wall height', () => {
      const slope = { kneeWallHeightMm: 1200, roofPitchDeg: 35 };
      const lowDesk = { widthMm: 1000, depthMm: 600, heightMm: 750 };

      const result = evaluateFurnitureUnderSlope(lowDesk, slope, 0);

      expect(result.fitsUnderSlope).toBe(true);
      expect(result.minRequiredDistanceFromWallMm).toBe(0);
      expect(result.warnings.length).toBe(0);
    });

    it('throws error for non-positive furniture dimensions', () => {
      const slope = { kneeWallHeightMm: 800, roofPitchDeg: 45 };
      expect(() =>
        evaluateFurnitureUnderSlope({ widthMm: 0, depthMm: 500, heightMm: 1000 }, slope, 100)
      ).toThrow('Wymiary mebla muszą być dodatnie');

      expect(() =>
        evaluateFurnitureUnderSlope({ widthMm: 500, depthMm: -10, heightMm: 1000 }, slope, 100)
      ).toThrow('Wymiary mebla muszą być dodatnie');

      expect(() =>
        evaluateFurnitureUnderSlope({ widthMm: 500, depthMm: 500, heightMm: 0 }, slope, 100)
      ).toThrow('Wymiary mebla muszą być dodatnie');
    });
  });

  describe('calculateSelfStorageCapacity (RD-50, T-RD-50, DEC-50)', () => {
    it('verifies test vector T-RD-50 (3.0m x 2.0m box with 0.50m inspection corridor)', () => {
      // T-RD-50: 3.0 x 2.0 m (6.0 m2). Usable = 3.0 * (2.0 - 0.50) = 4.5 m2
      const result = calculateSelfStorageCapacity({
        lengthM: 3.0,
        widthM: 2.0,
        heightM: 2.5,
        hasInspectionCorridor: true,
        corridorWidthM: 0.50,
      });

      expect(result.totalFloorAreaM2).toBe(6.0);
      expect(result.usableStorageAreaM2).toBe(4.5);
      expect(result.corridorAreaM2).toBe(1.5);
      expect(result.totalVolumeM3).toBe(15.0);
      expect(result.usableVolumeM3).toBe(11.25);
      expect(result.corridorLossPct).toBe(25);
    });

    it('uses default 0.50m corridor width when corridorWidthM is undefined', () => {
      const result = calculateSelfStorageCapacity({
        lengthM: 3.0,
        widthM: 2.0,
        heightM: 2.5,
        hasInspectionCorridor: true,
      });

      expect(result.usableStorageAreaM2).toBe(4.5);
      expect(result.corridorAreaM2).toBe(1.5);
    });

    it('calculates full area when no inspection corridor is requested', () => {
      const result = calculateSelfStorageCapacity({
        lengthM: 4.0,
        widthM: 2.5,
        heightM: 3.0,
        hasInspectionCorridor: false,
      });

      expect(result.totalFloorAreaM2).toBe(10.0);
      expect(result.usableStorageAreaM2).toBe(10.0);
      expect(result.corridorAreaM2).toBe(0);
      expect(result.corridorLossPct).toBe(0);
    });

    it('throws error for invalid dimensions or corridor larger than box width', () => {
      expect(() =>
        calculateSelfStorageCapacity({
          lengthM: 0,
          widthM: 2.0,
          heightM: 2.5,
          hasInspectionCorridor: true,
        })
      ).toThrow('Wymiary boksu self-storage muszą być dodatnie');

      expect(() =>
        calculateSelfStorageCapacity({
          lengthM: 3.0,
          widthM: 1.0,
          heightM: 2.5,
          hasInspectionCorridor: true,
          corridorWidthM: 1.2,
        })
      ).toThrow('Szerokość korytarza nie może przekraczać szerokości boksu');
    });
  });

  describe('evaluateFunctionalClearance (RD-51, T-RD-51, DEC-45)', () => {
    it('verifies dishwasher clearance test vector T-RD-51', () => {
      // T-RD-51: available 900 mm vs required 1050 mm
      const result = evaluateFunctionalClearance('DISHWASHER', 900);

      expect(result.isErgonomic).toBe(false);
      expect(result.requiredClearanceMm).toBe(1050);
      expect(result.marginMm).toBe(-150);
      expect(result.recommendation).toContain('Zbyt wąska strefa: brakuje 150 mm');
    });

    it('verifies compliant ergonomic clearance for wardrobe doors (700 mm)', () => {
      const result = evaluateFunctionalClearance('HINGED_WARDROBE', 850);

      expect(result.isErgonomic).toBe(true);
      expect(result.requiredClearanceMm).toBe(700);
      expect(result.marginMm).toBe(150);
      expect(result.recommendation).toContain('Optymalna przestrzeń użytkowa');
      expect(result.recommendation).toContain('150 mm');
    });

    it('covers all standard furniture clearance types', () => {
      const types: FurnitureClearanceType[] = [
        'HINGED_WARDROBE',
        'CHEST_OF_DRAWERS',
        'DINING_CHAIR',
        'DINING_PASSAGE',
        'DISHWASHER',
        'BED_SIDE',
      ];

      for (const t of types) {
        const standard = RECOMMENDED_CLEARANCES_MM[t];
        const res = evaluateFunctionalClearance(t, standard.requiredMm);
        expect(res.isErgonomic).toBe(true);
        expect(res.marginMm).toBe(0);
        expect(res.label).toBe(standard.label);
      }
    });
  });

  describe('evaluatePorterManualHandling (RD-53, T-RD-53)', () => {
    it('verifies safe handling test vector T-RD-53 with 160 kg safe', () => {
      // T-RD-53: Safe 160 kg, team of 2 porters (2 x 50 = 100 kg limit)
      const result2Porters = evaluatePorterManualHandling(160, 2, true);

      expect(result2Porters.isCompliant).toBe(false);
      expect(result2Porters.maxAllowedTotalWeightKg).toBe(100);
      expect(result2Porters.weightPerPorterKg).toBe(80);
      expect(result2Porters.recommendedMinPorters).toBe(4);
      expect(result2Porters.requiresMechanicalEquipment).toBe(true);
      expect(result2Porters.legalAdvisory).toContain('ZAKAZ WNOSZENIA: 80 kg/os.');

      // With 4 porters: 4 x 50 = 200 kg limit
      const result4Porters = evaluatePorterManualHandling(160, 4, true);
      expect(result4Porters.isCompliant).toBe(true);
      expect(result4Porters.weightPerPorterKg).toBe(40);
      expect(result4Porters.legalAdvisory).toContain('Zgodne z BHP: obciążenie 40 kg/os.');
    });

    it('handles continuous handling mode (30 kg limit per man)', () => {
      const continuousResult = evaluatePorterManualHandling(70, 2, false);

      expect(continuousResult.isCompliant).toBe(false);
      expect(continuousResult.maxAllowedTotalWeightKg).toBe(60); // 2 x 30
      expect(continuousResult.recommendedMinPorters).toBe(3); // ceil(70/30) = 3
    });

    it('throws error for non-positive mass or porters count', () => {
      expect(() => evaluatePorterManualHandling(0, 2)).toThrow(
        'Masa ładunku i liczba tragarzy muszą być dodatnie'
      );
      expect(() => evaluatePorterManualHandling(100, 0)).toThrow(
        'Masa ładunku i liczba tragarzy muszą być dodatnie'
      );
    });
  });
});
