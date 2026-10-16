import {
  calculateRoofRackLoad,
  validateCargoOverhang,
  evaluateFalseFloorLoad,
  LEGAL_MAX_REAR_OVERHANG_MM,
  LEGAL_MAX_FRONT_OVERHANG_MM,
  LEGAL_MAX_SIDE_PROTRUSION_MM,
  LEGAL_MAX_TOTAL_WIDTH_MM,
} from '../garage/roofAndOverhang';

describe('Roof Rack Capacity, Cargo Overhang & False Floor Load (RD-45, RD-47, RD-52, art. 61 PoRD, DEC-52, DEC-54, DEC-55)', () => {
  describe('calculateRoofRackLoad (RD-52, T-RD-52, DEC-55)', () => {
    it('verifies roof rack overload test vector T-RD-52', () => {
      // T-RD-52: Roof limit 75 kg, crossbars 5 kg, empty box 18 kg, cargo 60 kg
      // Total: 5 + 18 + 60 = 83 kg > 75 kg -> Overload by 8 kg!
      const result = calculateRoofRackLoad({
        roofRailLimitKg: 75,
        crossbarsWeightKg: 5,
        roofBoxWeightKg: 18,
        cargoItemsWeightKg: 60,
      });

      expect(result.effectiveLimitKg).toBe(75);
      expect(result.totalMountedWeightKg).toBe(83);
      expect(result.maxUsableCargoPayloadKg).toBe(52); // 75 - 5 - 18
      expect(result.isOverloaded).toBe(true);
      expect(result.overloadKg).toBe(8);
      expect(result.remainingCapacityKg).toBe(0);
      expect(result.capacityUtilizationPct).toBe(111);
      expect(result.warnings.some((w) => w.includes('PRZECIĄŻENIE DACHU O 8 KG'))).toBe(true);
      expect(result.recommendations.some((r) => r.includes('Przełóż najcięższe przedmioty'))).toBe(true);
    });

    it('respects lower crossbar limit if specified', () => {
      // Rails support 100 kg, but cheap crossbars only support 60 kg
      const result = calculateRoofRackLoad({
        roofRailLimitKg: 100,
        crossbarsLimitKg: 60,
        crossbarsWeightKg: 4,
        roofBoxWeightKg: 16,
        cargoItemsWeightKg: 35,
      });

      expect(result.effectiveLimitKg).toBe(60);
      expect(result.totalMountedWeightKg).toBe(55);
      expect(result.isOverloaded).toBe(false);
      expect(result.remainingCapacityKg).toBe(5);
      expect(result.capacityUtilizationPct).toBe(92);
      expect(result.warnings.some((w) => w.includes('wykorzystano 92%'))).toBe(true);
    });

    it('handles safe light load and warns when approaching net payload', () => {
      const result = calculateRoofRackLoad({
        roofRailLimitKg: 75,
        crossbarsWeightKg: 4,
        roofBoxWeightKg: 16,
        cargoItemsWeightKg: 56, // Total 76 is overload, but let's test safe: 54 kg -> total 74 kg
      });

      expect(result.totalMountedWeightKg).toBe(76);
      expect(result.isOverloaded).toBe(true);

      const safeResult = calculateRoofRackLoad({
        roofRailLimitKg: 75,
        crossbarsWeightKg: 4,
        roofBoxWeightKg: 16,
        cargoItemsWeightKg: 54, // total 74 kg, max usable cargo = 55 kg
      });
      expect(safeResult.isOverloaded).toBe(false);
      expect(safeResult.remainingCapacityKg).toBe(1);
      expect(safeResult.recommendations.some((r) => r.includes('Zbliżasz się do dopuszczalnej'))).toBe(true);
    });

    it('throws error for non-positive roof limit or negative weights', () => {
      expect(() =>
        calculateRoofRackLoad({
          roofRailLimitKg: 0,
          crossbarsWeightKg: 5,
          roofBoxWeightKg: 15,
          cargoItemsWeightKg: 20,
        })
      ).toThrow('Wartości masy i limitów muszą być nieujemne');

      expect(() =>
        calculateRoofRackLoad({
          roofRailLimitKg: 75,
          crossbarsWeightKg: -2,
          roofBoxWeightKg: 15,
          cargoItemsWeightKg: 20,
        })
      ).toThrow('Wartości masy i limitów muszą być nieujemne');
    });
  });

  describe('validateCargoOverhang (RD-45, T-RD-45, DEC-54, art. 61 PoRD)', () => {
    it('verifies excessive rear overhang test vector T-RD-45 (2.2 m rear overhang)', () => {
      // T-RD-45: 3.0m pipes protruding 2.2 m beyond rear bumper (legal limit: 2.0 m)
      const result = validateCargoOverhang({
        vehicleLengthMm: 4500,
        vehicleWidthMm: 1800,
        frontOverhangMm: 0,
        rearOverhangMm: 2200,
        sideProtrusionLeftMm: 0,
        sideProtrusionRightMm: 0,
      });

      expect(result.isLegal).toBe(false);
      expect(result.isRearOverhangLegal).toBe(false);
      expect(result.rearOverhangMm).toBe(2200);
      expect(result.maxRearOverhangAllowedMm).toBe(LEGAL_MAX_REAR_OVERHANG_MM);
      expect(result.violations.some((v) => v.includes('ZAKAZ JAZDY'))).toBe(true);
      expect(result.requiredMarkings.some((m) => m.includes('Czerwona chorągiewka'))).toBe(true);
      expect(result.requiredMarkings.some((m) => m.includes('czerwone światło odblaskowe'))).toBe(true);
    });

    it('verifies compliant rear overhang with mandatory red flag (> 500 mm)', () => {
      const result = validateCargoOverhang({
        vehicleLengthMm: 4600,
        vehicleWidthMm: 1820,
        frontOverhangMm: 0,
        rearOverhangMm: 1200, // Legal <= 2000 mm, but requires flag because > 500 mm
        sideProtrusionLeftMm: 0,
        sideProtrusionRightMm: 0,
      });

      expect(result.isLegal).toBe(true);
      expect(result.isRearOverhangLegal).toBe(true);
      expect(result.violations.length).toBe(0);
      expect(result.requiredMarkings.some((m) => m.includes('Czerwona chorągiewka'))).toBe(true);
    });

    it('detects violations for front overhang, driver seat distance, and side protrusions', () => {
      const result = validateCargoOverhang({
        vehicleLengthMm: 4200,
        vehicleWidthMm: 1800,
        frontOverhangMm: 650, // exceeds 500 mm
        rearOverhangMm: 300,  // <= 500 mm (recommends flag)
        sideProtrusionLeftMm: 250, // exceeds 230 mm
        sideProtrusionRightMm: 200,
        distanceFromDriverSeatToFrontMm: 600, // 650 mm > 600 mm
      });

      expect(result.isLegal).toBe(false);
      expect(result.isFrontOverhangLegal).toBe(false);
      expect(result.isSideProtrusionLegal).toBe(false);
      expect(result.violations.some((v) => v.includes('Zwis przedni (650 mm) przekracza'))).toBe(true);
      expect(result.violations.some((v) => v.includes('płaszczyzny fotela'))).toBe(true);
      expect(result.violations.some((v) => v.includes('Wystawanie boczne (250 mm)'))).toBe(true);
      expect(result.requiredMarkings.some((m) => m.includes('chorągiewka pomarańczowa'))).toBe(true);
      expect(result.requiredMarkings.some((m) => m.includes('Zalecane oznaczenie końca'))).toBe(true);
    });

    it('detects total width violation exceeding 2550 mm', () => {
      const result = validateCargoOverhang({
        vehicleLengthMm: 4800,
        vehicleWidthMm: 2200,
        frontOverhangMm: 0,
        rearOverhangMm: 0,
        sideProtrusionLeftMm: 200,
        sideProtrusionRightMm: 200, // Total = 2200 + 400 = 2600 mm > 2550 mm
      });

      expect(result.isLegal).toBe(false);
      expect(result.isTotalWidthLegal).toBe(false);
      expect(result.totalVehicleWithCargoWidthMm).toBe(2600);
      expect(result.violations.some((v) => v.includes('2.55 m'))).toBe(true);
    });

    it('throws error for non-positive vehicle dimensions', () => {
      expect(() =>
        validateCargoOverhang({
          vehicleLengthMm: 0,
          vehicleWidthMm: 1800,
          frontOverhangMm: 0,
          rearOverhangMm: 0,
          sideProtrusionLeftMm: 0,
          sideProtrusionRightMm: 0,
        })
      ).toThrow('Wymiary pojazdu muszą być dodatnie');

      expect(() =>
        validateCargoOverhang({
          vehicleLengthMm: 4500,
          vehicleWidthMm: -100,
          frontOverhangMm: 0,
          rearOverhangMm: 0,
          sideProtrusionLeftMm: 0,
          sideProtrusionRightMm: 0,
        })
      ).toThrow('Wymiary pojazdu muszą być dodatnie');
    });
  });

  describe('evaluateFalseFloorLoad (RD-47, T-RD-47, DEC-52)', () => {
    it('verifies collapse risk test vector T-RD-47 (150 kg cement on 120 kg false floor)', () => {
      // T-RD-47: 6 bags cement x 25 kg = 150 kg on 120 kg double floor
      const result = evaluateFalseFloorLoad({
        hasModularFalseFloor: true,
        maxFloorRatingKg: 120,
        cargoWeightKg: 150,
      });

      expect(result.isSafe).toBe(false);
      expect(result.maxAllowedKg).toBe(120);
      expect(result.excessWeightKg).toBe(30);
      expect(result.warningRisk).toBe('CRITICAL_COLLAPSE');
      expect(result.advice).toContain('RYZYKO ZAŁAMANIA PÓŁKI');
    });

    it('detects point load risk near limit on false floor', () => {
      const result = evaluateFalseFloorLoad({
        hasModularFalseFloor: true,
        maxFloorRatingKg: 120,
        cargoWeightKg: 95, // > 70% of 120 kg = 84 kg
        isPointLoadConcentrated: true,
      });

      expect(result.isSafe).toBe(true);
      expect(result.warningRisk).toBe('MODERATE');
      expect(result.advice).toContain('Ciężki ładunek punktowy');
    });

    it('evaluates safe load on false floor', () => {
      const result = evaluateFalseFloorLoad({
        hasModularFalseFloor: true,
        maxFloorRatingKg: 120,
        cargoWeightKg: 50,
        isPointLoadConcentrated: false,
      });

      expect(result.isSafe).toBe(true);
      expect(result.warningRisk).toBe('NONE');
      expect(result.excessWeightKg).toBe(0);
      expect(result.advice).toContain('Bezpieczne obciążenie');
    });

    it('uses DEFAULT_MODULAR_FLOOR_LIMIT_KG (120 kg) when maxFloorRatingKg is omitted', () => {
      const result = evaluateFalseFloorLoad({
        hasModularFalseFloor: true,
        cargoWeightKg: 80,
      });

      expect(result.isSafe).toBe(true);
      expect(result.maxAllowedKg).toBe(120);
    });

    it('handles vehicles without false floor (solid steel floor)', () => {
      const result = evaluateFalseFloorLoad({
        hasModularFalseFloor: false,
        cargoWeightKg: 250,
      });

      expect(result.isSafe).toBe(true);
      expect(result.warningRisk).toBe('NONE');
      expect(result.advice).toContain('fabrycznej stalowej podłodze');
    });

    it('throws error for negative cargo weight', () => {
      expect(() =>
        evaluateFalseFloorLoad({
          hasModularFalseFloor: true,
          cargoWeightKg: -5,
        })
      ).toThrow('Masa ładunku nie może być ujemna');
    });
  });
});
