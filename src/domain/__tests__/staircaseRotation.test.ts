import { evaluateStaircaseLandingTurn } from '../doors-stairs/staircaseRotation';

describe('StaircaseRotation (RD-34, Moving Sofa Heuristic)', () => {
  const landing90Specs = {
    flightWidthMm: 1100,
    landingDepthMm: 1200,
    ceilingHeightMm: 2400,
    turnAngleDeg: 90 as const,
    hasHandrailObstruction: true,
    handrailWidthMm: 80,
  };

  it('allows small armchair to turn horizontally on landing', () => {
    const res = evaluateStaircaseLandingTurn(
      { lengthMm: 800, widthMm: 750, heightMm: 750 },
      landing90Specs
    );

    expect(res.canPass).toBe(true);
    expect(res.canTurnHorizontally).toBe(true);
    expect(res.warnings).toHaveLength(0);
  });

  it('identifies need for vertical tilting when horizontal turn is blocked by length', () => {
    // 2000 mm sofa cannot turn flat in 1020 mm flight, but can turn with vertical tilt under 2400 mm ceiling
    const res = evaluateStaircaseLandingTurn(
      { lengthMm: 2000, widthMm: 850, heightMm: 800 },
      landing90Specs
    );

    expect(res.canTurnHorizontally).toBe(false);
    expect(res.canTurnWithVerticalTilt).toBe(true);
    expect(res.canPass).toBe(true);
    expect(res.requiredTiltAngleDeg).toBeDefined();
    expect(res.recommendations.length).toBeGreaterThan(0);
  });

  it('rejects monolith item that is too wide for flight of stairs', () => {
    // 1200 mm width exceeds 1020 mm effective flight width
    const res = evaluateStaircaseLandingTurn(
      { lengthMm: 1500, widthMm: 1200, heightMm: 1200 },
      landing90Specs
    );

    expect(res.canPass).toBe(false);
    expect(res.bottleneckDescription).toContain('zbyt szeroki na sam bieg');
  });

  it('evaluates 180 degree U-turn staircase correctly', () => {
    const landing180Specs = {
      flightWidthMm: 1000,
      landingDepthMm: 2100,
      ceilingHeightMm: 2300,
      turnAngleDeg: 180 as const,
      hasHandrailObstruction: false,
    };

    const res = evaluateStaircaseLandingTurn(
      { lengthMm: 1900, widthMm: 800, heightMm: 700 },
      landing180Specs
    );

    expect(res.canPass).toBe(true);
  });

  it('rejects extremely long sofa that cannot rotate horizontally or vertically under ceiling', () => {
    // 3500 mm length fits in 1020 mm flight width, but cannot turn on landing under 2400 mm ceiling
    const res = evaluateStaircaseLandingTurn(
      { lengthMm: 3500, widthMm: 900, heightMm: 800 },
      landing90Specs
    );

    expect(res.canPass).toBe(false);
    expect(res.canTurnHorizontally).toBe(false);
    expect(res.canTurnWithVerticalTilt).toBe(false);
    expect(res.bottleneckDescription).toContain('Zablokowanie na spoczniku');
    expect(res.warnings.length).toBeGreaterThan(0);
    expect(res.recommendations.length).toBeGreaterThan(0);
  });

  it('uses default 80 mm handrail width when handrailWidthMm is omitted', () => {
    const specsDefaultHandrail = {
      flightWidthMm: 1100,
      landingDepthMm: 1200,
      ceilingHeightMm: 2400,
      turnAngleDeg: 90 as const,
      hasHandrailObstruction: true, // no handrailWidthMm specified
    };

    const res = evaluateStaircaseLandingTurn(
      { lengthMm: 800, widthMm: 750, heightMm: 750 },
      specsDefaultHandrail
    );

    expect(res.canPass).toBe(true);
  });
});
