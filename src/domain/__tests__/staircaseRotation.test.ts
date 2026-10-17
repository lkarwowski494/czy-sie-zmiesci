import {
  evaluateStaircaseLandingTurn,
  STAIRCASE_SAFETY_MARGIN_MM,
  StaircaseLandingSpecs,
} from '../doors-stairs/staircaseRotation';

describe('StaircaseRotation & Moving Sofa Heuristic Deep Testing (RD-34)', () => {
  const landing90Specs: StaircaseLandingSpecs = {
    flightWidthMm: 1100,
    landingDepthMm: 1200,
    ceilingHeightMm: 2400,
    turnAngleDeg: 90,
    hasHandrailObstruction: true,
    handrailWidthMm: 80,
  };

  it('verifies standard safety margin constant is 50 mm', () => {
    expect(STAIRCASE_SAFETY_MARGIN_MM).toBe(50);
  });

  describe('90-Degree L-Turn Staircases', () => {
    it('allows small armchair to turn horizontally on landing without tilting', () => {
      const res = evaluateStaircaseLandingTurn(
        { lengthMm: 800, widthMm: 750, heightMm: 750 },
        landing90Specs
      );

      expect(res.canPass).toBe(true);
      expect(res.canTurnHorizontally).toBe(true);
      expect(res.bottleneckDescription).toContain('Brak kolizji');
      expect(res.warnings).toHaveLength(0);
    });

    it('identifies need for vertical tilting when horizontal turn is blocked by sofa length', () => {
      // 2000 mm sofa cannot turn flat in 1020 mm flight, but can turn with vertical tilt under 2400 mm ceiling
      const res = evaluateStaircaseLandingTurn(
        { lengthMm: 2000, widthMm: 850, heightMm: 800 },
        landing90Specs
      );

      expect(res.canPass).toBe(true);
      expect(res.canTurnHorizontally).toBe(false);
      expect(res.canTurnWithVerticalTilt).toBe(true);
      expect(res.requiredTiltAngleDeg).toBeDefined();
      expect(res.requiredTiltAngleDeg).toBeGreaterThanOrEqual(30);
      expect(res.requiredTiltAngleDeg).toBeLessThanOrEqual(85);
      expect(res.bottleneckDescription).toContain('Wymagana pionizacja');
      expect(res.recommendations.some((r) => r.includes('półpiętrze'))).toBe(true);
    });

    it('blocks sofa when low ceiling prevents both horizontal and tilted passage', () => {
      const lowCeilingSpecs: StaircaseLandingSpecs = {
        ...landing90Specs,
        ceilingHeightMm: 1700, // Very low attic stair ceiling
      };

      const res = evaluateStaircaseLandingTurn(
        { lengthMm: 2100, widthMm: 850, heightMm: 800 },
        lowCeilingSpecs
      );

      expect(res.canPass).toBe(false);
      expect(res.canTurnHorizontally).toBe(false);
      expect(res.canTurnWithVerticalTilt).toBe(false);
      expect(res.bottleneckDescription).toContain('Zablokowanie na spoczniku');
      expect(res.warnings.some((w) => w.includes('skosem sufitu'))).toBe(true);
      expect(res.recommendations.some((r) => r.includes('Demontaż'))).toBe(true);
    });

    it('rejects monolith item that is too wide for the flight of stairs itself', () => {
      // 1200 mm width exceeds 1020 mm effective flight width
      const res = evaluateStaircaseLandingTurn(
        { lengthMm: 1500, widthMm: 1200, heightMm: 1200 },
        landing90Specs
      );

      expect(res.canPass).toBe(false);
      expect(res.bottleneckDescription).toContain('zbyt szeroki na sam bieg');
      expect(res.warnings.some((w) => w.includes('przekracza skrajnię'))).toBe(true);
      expect(res.recommendations.some((r) => r.includes('transport zewnętrzny'))).toBe(true);
    });
  });

  describe('Handrail Obstruction Effects', () => {
    it('applies default 80 mm handrail deduction when handrailWidthMm is omitted', () => {
      const specsWithDefaultHandrail: StaircaseLandingSpecs = {
        flightWidthMm: 1000,
        landingDepthMm: 1200,
        ceilingHeightMm: 2400,
        turnAngleDeg: 90,
        hasHandrailObstruction: true,
      };

      // Item width 890 mm:
      // With handrail (1000 - 80 = 920 mm), margin is 2 * 50 = 100 mm => max allowed width is 820 mm!
      // So 890 mm exceeds 820 mm!
      const resWithHandrail = evaluateStaircaseLandingTurn(
        { lengthMm: 900, widthMm: 850, heightMm: 800 },
        specsWithDefaultHandrail
      );
      expect(resWithHandrail.canTurnHorizontally).toBe(false);

      // Without handrail (effective width 1000 mm, max allowed 900 mm):
      const specsWithoutHandrail: StaircaseLandingSpecs = {
        ...specsWithDefaultHandrail,
        hasHandrailObstruction: false,
      };
      const resWithoutHandrail = evaluateStaircaseLandingTurn(
        { lengthMm: 900, widthMm: 850, heightMm: 800 },
        specsWithoutHandrail
      );
      // Now max allowed width is 1000 - 100 = 900 mm >= 850 mm
      expect(resWithoutHandrail.canTurnHorizontally).toBe(true);
    });

    it('respects custom heavy-duty handrail width (e.g. 120 mm)', () => {
      const customHandrailSpecs: StaircaseLandingSpecs = {
        flightWidthMm: 1100,
        landingDepthMm: 1200,
        ceilingHeightMm: 2400,
        turnAngleDeg: 90,
        hasHandrailObstruction: true,
        handrailWidthMm: 150, // 150 mm thick timber handrail
      };

      const res = evaluateStaircaseLandingTurn(
        { lengthMm: 1000, widthMm: 900, heightMm: 900 },
        customHandrailSpecs
      );
      // Effective width: 1100 - 150 = 950 mm. Smallest section 900 > 950 - 100 = 850 (fails)
      expect(res.canPass).toBe(false);
    });
  });

  describe('180-Degree U-Turn Staircases', () => {
    it('evaluates U-turn with generous double landing depth as passing horizontally', () => {
      const landing180Generous: StaircaseLandingSpecs = {
        flightWidthMm: 1200,
        landingDepthMm: 2200,
        ceilingHeightMm: 2600,
        turnAngleDeg: 180,
        hasHandrailObstruction: false,
      };

      // 1800 mm sofa on 2200 mm landing: L (1800) <= 2200 - 50 = 2150 mm, W (800) <= 1200 - 100 = 1100 mm
      const res = evaluateStaircaseLandingTurn(
        { lengthMm: 1800, widthMm: 800, heightMm: 700 },
        landing180Generous
      );

      expect(res.canPass).toBe(true);
      expect(res.canTurnHorizontally).toBe(true);
      expect(res.warnings).toHaveLength(0);
    });

    it('requires tilt on U-turn staircase when landing depth is narrower than sofa length', () => {
      const landing180Tight: StaircaseLandingSpecs = {
        flightWidthMm: 1100,
        landingDepthMm: 1400,
        ceilingHeightMm: 2500,
        turnAngleDeg: 180,
        hasHandrailObstruction: false,
      };

      // 1900 mm sofa exceeds 1400 mm landing depth -> cannot turn flat!
      const res = evaluateStaircaseLandingTurn(
        { lengthMm: 1900, widthMm: 800, heightMm: 700 },
        landing180Tight
      );

      expect(res.canTurnHorizontally).toBe(false);
      expect(res.canTurnWithVerticalTilt).toBe(true);
      expect(res.canPass).toBe(true);
      expect(res.requiredTiltAngleDeg).toBeDefined();
    });
  });
});
