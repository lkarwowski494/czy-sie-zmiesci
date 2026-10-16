/**
 * Czy się zmieści? (FitCheck) — Wyczerpująca macierz kombinatoryczna: Pasowanie Wnęk i Poddaszy
 * Testuje reguły RD-36 (Wnęki ścienne), RD-48 (Skosy poddasza) oraz DEC-45, DEC-57.
 */

import {
  evaluateNicheFit,
  WallNicheSpecs,
  SKIRTING_DEFAULT_MM,
  PLUMBNESS_SAFETY_BUFFER_MM,
} from '../../domain/room-fitting/nicheCalculator';
import {
  analyzeAtticSlope,
  evaluateFurnitureUnderSlope,
  AtticSlopeSpecs,
} from '../../domain/room-fitting/atticAndErgonomics';

describe('Exhaustive Combinatorial: Room Fitting, Niches and Attic Slopes Matrix', () => {
  describe('Wnęki ścienne: Pasowanie mebla (9x3x3 x 4 profile x 2 listwy x 2 kaloryfer)', () => {
    const furnitureWidths = [400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000];
    const furnitureDepths = [350, 450, 600];
    const furnitureHeights = [1800, 2000, 2300];

    const nicheProfiles = [
      { name: 'Równa 1200mm', top: 1200, mid: 1200, bot: 1200, depth: 650, height: 2400 },
      { name: 'Krzywa zwężana góra', top: 1180, mid: 1200, bot: 1210, depth: 650, height: 2400 },
      { name: 'Wąski dół', top: 1200, mid: 1200, bot: 1170, depth: 650, height: 2400 },
      { name: 'Szeroka wnęka 2050mm', top: 2050, mid: 2050, bot: 2050, depth: 700, height: 2500 },
    ];

    const skirtingOptions = [true, false];
    const radiatorOptions = [0, 60];

    const testCases: Array<{
      fWidth: number;
      fDepth: number;
      fHeight: number;
      profile: (typeof nicheProfiles)[number];
      hasSkirting: boolean;
      radiatorMm: number;
    }> = [];

    for (const fWidth of furnitureWidths) {
      for (const fDepth of furnitureDepths) {
        for (const fHeight of furnitureHeights) {
          for (const profile of nicheProfiles) {
            for (const hasSkirting of skirtingOptions) {
              for (const radiatorMm of radiatorOptions) {
                testCases.push({
                  fWidth,
                  fDepth,
                  fHeight,
                  profile,
                  hasSkirting,
                  radiatorMm,
                });
              }
            }
          }
        }
      }
    }

    test.each(
      testCases.map(tc => [
        `Mebel_${tc.fWidth}x${tc.fDepth}x${tc.fHeight}_Wnęka_${tc.profile.name}_Listwa=${tc.hasSkirting}_Grzejnik=${tc.radiatorMm}`,
        tc,
      ])
    )('Wnęka: %s', (_label, tc) => {
      const nicheSpecs: WallNicheSpecs = {
        widthTopMm: tc.profile.top,
        widthMiddleMm: tc.profile.mid,
        widthBottomMm: tc.profile.bot,
        depthMm: tc.profile.depth,
        heightMm: tc.profile.height,
        skirtingBoardThicknessMm: SKIRTING_DEFAULT_MM,
        hasSkirtingBoards: tc.hasSkirting,
        radiatorProtrusionMm: tc.radiatorMm,
      };

      const res = evaluateNicheFit(
        { widthMm: tc.fWidth, depthMm: tc.fDepth, heightMm: tc.fHeight },
        nicheSpecs
      );

      const minRawWidth = Math.min(tc.profile.top, tc.profile.mid, tc.profile.bot);
      const skirtingDeduction = tc.hasSkirting ? 2 * SKIRTING_DEFAULT_MM : 0;
      const expectedFloorWidth = Math.max(0, tc.profile.bot - skirtingDeduction);
      const expectedEffectiveUsableWidth = Math.min(
        minRawWidth - PLUMBNESS_SAFETY_BUFFER_MM,
        expectedFloorWidth
      );
      const expectedDepth = tc.profile.depth - tc.radiatorMm;

      expect(res.minimumWidthRawMm).toBe(minRawWidth);
      expect(res.effectiveWidthAtFloorMm).toBe(expectedFloorWidth);
      expect(res.effectiveDepthMm).toBe(expectedDepth);

      const expectedFitsWidth = tc.fWidth <= expectedEffectiveUsableWidth;
      const expectedFitsDepth = tc.fDepth <= expectedDepth;
      const expectedFitsHeight = tc.fHeight <= tc.profile.height - PLUMBNESS_SAFETY_BUFFER_MM;
      const expectedFitsOverall = expectedFitsWidth && expectedFitsDepth && expectedFitsHeight;

      expect(res.fitsWidth).toBe(expectedFitsWidth);
      expect(res.fitsDepth).toBe(expectedFitsDepth);
      expect(res.fitsHeight).toBe(expectedFitsHeight);
      expect(res.fitsOverall).toBe(expectedFitsOverall);

      if (tc.hasSkirting && tc.fWidth > expectedFloorWidth) {
        expect(res.isSkirtingCollision).toBe(true);
      } else {
        expect(res.isSkirtingCollision).toBe(false);
      }

      if (tc.radiatorMm > 0) {
        expect(res.warnings.some(w => w.includes('Grzejnik wystaje'))).toBe(true);
      }
    });
  });

  describe('Poddasza: Skosy dachu i wstawianie mebla pod skos (RD-48)', () => {
    const kneeWallHeights = [500, 800, 1000, 1200, 1400, 1950];
    const roofPitches = [25, 30, 35, 40, 45, 50, 60];
    const furnitureHeights = [750, 1100, 1500, 1900];
    const distancesFromWall = [0, 200, 500, 1000];

    const slopeCases: Array<{
      kneeWall: number;
      pitch: number;
      fHeight: number;
      dist: number;
    }> = [];

    for (const kneeWall of kneeWallHeights) {
      for (const pitch of roofPitches) {
        for (const fHeight of furnitureHeights) {
          for (const dist of distancesFromWall) {
            slopeCases.push({ kneeWall, pitch, fHeight, dist });
          }
        }
      }
    }

    test.each(
      slopeCases.map(sc => [
        `Kolankowa=${sc.kneeWall}mm_Dach=${sc.pitch}deg_MebelH=${sc.fHeight}mm_Odleglosc=${sc.dist}mm`,
        sc,
      ])
    )('Skos: %s', (_label, sc) => {
      const slopeSpecs: AtticSlopeSpecs = {
        kneeWallHeightMm: sc.kneeWall,
        roofPitchDeg: sc.pitch,
      };

      const analysis = analyzeAtticSlope(slopeSpecs);
      expect(analysis.kneeWallHeightMm).toBe(sc.kneeWall);
      expect(analysis.roofPitchDeg).toBe(sc.pitch);
      expect(analysis.roofPitchTan).toBeGreaterThan(0);

      if (sc.kneeWall >= 1900) {
        expect(analysis.standingHeightAchievedAtWall).toBe(true);
        expect(analysis.distanceToStandingHeight190Mm).toBe(0);
      } else {
        expect(analysis.standingHeightAchievedAtWall).toBe(false);
        expect(analysis.distanceToStandingHeight190Mm).toBeGreaterThan(0);
      }

      const furniture = {
        widthMm: 1000,
        depthMm: 500,
        heightMm: sc.fHeight,
      };

      const fitResult = evaluateFurnitureUnderSlope(furniture, slopeSpecs, sc.dist);

      expect(fitResult.furnitureHeightMm).toBe(sc.fHeight);
      expect(fitResult.distanceFromKneeWallMm).toBe(sc.dist);
      expect(fitResult.ceilingHeightAtBackMm).toBe(analysis.heightAtDistance(sc.dist));
      expect(fitResult.ceilingHeightAtFrontMm).toBe(analysis.heightAtDistance(sc.dist + 500));

      const expectedFits =
        fitResult.ceilingHeightAtBackMm >= sc.fHeight &&
        fitResult.ceilingHeightAtFrontMm >= sc.fHeight;
      expect(fitResult.fitsUnderSlope).toBe(expectedFits);

      if (!expectedFits) {
        expect(fitResult.warnings.length).toBeGreaterThan(0);
      }
    });
  });
});
