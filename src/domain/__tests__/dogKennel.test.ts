import {
  evaluateDogKennelFit,
  calculateKennelBevelAngle,
  DEFAULT_KENNEL_SAFETY_CLEARANCE_MM,
} from '../garage/dogKennel';

describe('Dog Kennel Fitting Under Rear Window Profile (RD-46, T-RD-46, Z-184)', () => {
  describe('calculateKennelBevelAngle', () => {
    it('calculates angle accurately for sloped kennel back', () => {
      // deltaDepth = 900 - 500 = 400 mm, height = 700 mm
      // tan = 400/700 = 0.5714 -> atan ~ 29.7 deg
      const angle = calculateKennelBevelAngle(900, 500, 700);
      expect(angle).toBeCloseTo(29.7, 1);
    });

    it('returns 0 for vertical back (depthBottom === depthTop)', () => {
      const angle = calculateKennelBevelAngle(800, 800, 650);
      expect(angle).toBe(0);
    });

    it('returns 0 for non-positive height', () => {
      expect(calculateKennelBevelAngle(800, 600, 0)).toBe(0);
      expect(calculateKennelBevelAngle(800, 600, -10)).toBe(0);
    });
  });

  describe('evaluateDogKennelFit (RD-46, T-RD-46)', () => {
    it('verifies test vector T-RD-46: straight vertical cage collides with 35° rear window', () => {
      // T-RD-46: Window slope 35 deg, straight cage (depthBottom = depthTop = 750 mm, height = 650 mm)
      // Trunk Z_0 at seats = 750 mm, floor = 950 mm, widthMin = 1000 mm
      const result = evaluateDogKennelFit(
        {
          widthMm: 650,
          depthBottomMm: 750,
          depthTopMm: 750, // Straight back (0 deg bevel)
          heightMm: 650,
        },
        {
          lengthFloorMm: 950,
          widthMinMm: 1000,
          heightApertureMm: 700,
          heightAtSeatBackMm: 750,
          windowSlopeAngleDeg: 35, // tan(35) ~ 0.7002
        }
      );

      // Window height at 750 mm: 750 - 750 * 0.7002 = 750 - 525 = 225 mm < 650 mm -> collision!
      expect(result.fitsInTrunk).toBe(false);
      expect(result.fitsWindowSlope).toBe(false);
      expect(result.rearBevelAngleDeg).toBe(0);
      expect(result.collisionPointMm).toBeDefined();
      expect(result.warnings.some((w) => w.includes('Kolizja górnego tylnego rantu klatki'))).toBe(true);
      expect(result.recommendations.some((r) => r.includes('Wybierz klatkę ze skośną ścianą'))).toBe(true);
    });

    it('verifies fitting when cage has beveled rear wall matching window angle', () => {
      // Beveled cage: depthBottom = 850 mm, depthTop = 350 mm, height = 600 mm
      // deltaDepth = 500 mm -> tan = 500/600 = 0.833 -> ~39.8 deg bevel > 35 deg slope
      const result = evaluateDogKennelFit(
        {
          widthMm: 650,
          depthBottomMm: 850,
          depthTopMm: 350,
          heightMm: 600,
        },
        {
          lengthFloorMm: 950,
          widthMinMm: 1000,
          heightApertureMm: 700,
          heightAtSeatBackMm: 880,
          windowSlopeAngleDeg: 35,
        }
      );

      // Window height at 350 mm: 880 - 350 * 0.7002 = 880 - 245 = 635 mm.
      // Max allowed = 635 - 30 = 605 mm > 600 mm cage height -> FITS!
      expect(result.fitsInTrunk).toBe(true);
      expect(result.fitsWindowSlope).toBe(true);
      expect(result.fitsWidth).toBe(true);
      expect(result.fitsFloorLength).toBe(true);
      expect(result.fitsHeightAtSeat).toBe(true);
      expect(result.collisionPointMm).toBeUndefined();
      expect(result.recommendations).toContain('Klatka pasuje idealnie z zachowaniem bezpiecznego odstępu od szyby.');
    });

    it('uses provided rearBevelAngleDeg if explicitly specified', () => {
      const result = evaluateDogKennelFit(
        {
          widthMm: 650,
          depthBottomMm: 850,
          depthTopMm: 350,
          heightMm: 600,
          rearBevelAngleDeg: 42,
        },
        {
          lengthFloorMm: 950,
          widthMinMm: 1000,
          heightApertureMm: 700,
          heightAtSeatBackMm: 880,
          windowSlopeAngleDeg: 35,
          safetyClearanceMm: 25,
        }
      );

      expect(result.rearBevelAngleDeg).toBe(42);
      expect(result.fitsInTrunk).toBe(true);
    });

    it('detects violations when cage is too wide, too deep on floor, or taller than seat back', () => {
      const result = evaluateDogKennelFit(
        {
          widthMm: 1100, // > 1000 mm
          depthBottomMm: 1050, // > 950 mm
          depthTopMm: 600,
          heightMm: 800, // > 750 mm
          rearBevelAngleDeg: 40, // bevel >= slope, but still collides
        },
        {
          lengthFloorMm: 950,
          widthMinMm: 1000,
          heightApertureMm: 700,
          heightAtSeatBackMm: 750,
          windowSlopeAngleDeg: 35,
        }
      );

      expect(result.fitsInTrunk).toBe(false);
      expect(result.fitsWidth).toBe(false);
      expect(result.fitsFloorLength).toBe(false);
      expect(result.fitsHeightAtSeat).toBe(false);
      expect(result.marginWidthMm).toBe(-100);
      expect(result.marginFloorMm).toBe(-100);
      expect(result.warnings.some((w) => w.includes('za szeroka'))).toBe(true);
      expect(result.warnings.some((w) => w.includes('za głęboka'))).toBe(true);
      expect(result.warnings.some((w) => w.includes('wyższa niż sufit'))).toBe(true);
      expect(result.recommendations.some((r) => r.includes('Zmniejsz wysokość klatki'))).toBe(true);
    });

    it('throws errors for invalid inputs', () => {
      const validTrunk = {
        lengthFloorMm: 950,
        widthMinMm: 1000,
        heightApertureMm: 700,
        heightAtSeatBackMm: 750,
        windowSlopeAngleDeg: 35,
      };

      // Non-positive kennel dimensions
      expect(() =>
        evaluateDogKennelFit({ widthMm: 0, depthBottomMm: 800, depthTopMm: 600, heightMm: 600 }, validTrunk)
      ).toThrow('Wymiary klatki kennelowej muszą być dodatnie');

      expect(() =>
        evaluateDogKennelFit({ widthMm: 600, depthBottomMm: -10, depthTopMm: 600, heightMm: 600 }, validTrunk)
      ).toThrow('Wymiary klatki kennelowej muszą być dodatnie');

      expect(() =>
        evaluateDogKennelFit({ widthMm: 600, depthBottomMm: 800, depthTopMm: 0, heightMm: 600 }, validTrunk)
      ).toThrow('Wymiary klatki kennelowej muszą być dodatnie');

      expect(() =>
        evaluateDogKennelFit({ widthMm: 600, depthBottomMm: 800, depthTopMm: 600, heightMm: -5 }, validTrunk)
      ).toThrow('Wymiary klatki kennelowej muszą być dodatnie');

      // depthTop > depthBottom
      expect(() =>
        evaluateDogKennelFit({ widthMm: 600, depthBottomMm: 600, depthTopMm: 800, heightMm: 600 }, validTrunk)
      ).toThrow('Głębokość górna klatki nie może być większa niż dolna');

      // Invalid trunk geometry
      expect(() =>
        evaluateDogKennelFit(
          { widthMm: 600, depthBottomMm: 800, depthTopMm: 600, heightMm: 600 },
          { ...validTrunk, lengthFloorMm: 0 }
        )
      ).toThrow('Parametry geometryczne bagażnika muszą być prawidłowe');

      expect(() =>
        evaluateDogKennelFit(
          { widthMm: 600, depthBottomMm: 800, depthTopMm: 600, heightMm: 600 },
          { ...validTrunk, widthMinMm: -10 }
        )
      ).toThrow('Parametry geometryczne bagażnika muszą być prawidłowe');

      expect(() =>
        evaluateDogKennelFit(
          { widthMm: 600, depthBottomMm: 800, depthTopMm: 600, heightMm: 600 },
          { ...validTrunk, heightAtSeatBackMm: 0 }
        )
      ).toThrow('Parametry geometryczne bagażnika muszą być prawidłowe');

      expect(() =>
        evaluateDogKennelFit(
          { widthMm: 600, depthBottomMm: 800, depthTopMm: 600, heightMm: 600 },
          { ...validTrunk, windowSlopeAngleDeg: 0 }
        )
      ).toThrow('Parametry geometryczne bagażnika muszą być prawidłowe');

      expect(() =>
        evaluateDogKennelFit(
          { widthMm: 600, depthBottomMm: 800, depthTopMm: 600, heightMm: 600 },
          { ...validTrunk, windowSlopeAngleDeg: 90 }
        )
      ).toThrow('Parametry geometryczne bagażnika muszą być prawidłowe');
    });
  });
});
