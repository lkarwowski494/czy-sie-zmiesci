import { evaluateNicheFit } from '../room-fitting/nicheCalculator';

describe('NicheCalculator (RD-36, SPRZ-08)', () => {
  const standardNiche = {
    widthTopMm: 1520,
    widthMiddleMm: 1520,
    widthBottomMm: 1520,
    depthMm: 650,
    heightMm: 2400,
    skirtingBoardThicknessMm: 20,
    hasSkirtingBoards: true,
  };

  it('detects skirting board collision when wardrobe fits raw width but collides at floor', () => {
    // 1500 mm wide wardrobe in 1520 mm raw niche.
    // At floor level: 1520 - 2 * 20 = 1480 mm.
    // 1500 > 1480 mm -> skirting collision!
    const res = evaluateNicheFit(
      { widthMm: 1500, depthMm: 600, heightMm: 2360 },
      standardNiche
    );

    expect(res.isSkirtingCollision).toBe(true);
    expect(res.fitsWidth).toBe(false);
    expect(res.fitsOverall).toBe(false);
    expect(res.effectiveWidthAtFloorMm).toBe(1480);
    expect(res.warnings.some(w => w.includes('listwami'))).toBe(true);
    expect(res.recommendations.some(r => r.includes('Podetnij'))).toBe(true);
  });

  it('allows fit when skirting boards are removed or absent', () => {
    const nicheWithoutSkirting = {
      ...standardNiche,
      hasSkirtingBoards: false,
    };

    // Usable width = 1520 - 10 (plumbness buffer) = 1510 mm. 1500 <= 1510 mm -> fits!
    const res = evaluateNicheFit(
      { widthMm: 1500, depthMm: 600, heightMm: 2360 },
      nicheWithoutSkirting
    );

    expect(res.isSkirtingCollision).toBe(false);
    expect(res.fitsWidth).toBe(true);
    expect(res.fitsOverall).toBe(true);
  });

  it('accounts for protruding radiator and window sill', () => {
    const nicheWithRadiator = {
      ...standardNiche,
      hasSkirtingBoards: false,
      radiatorProtrusionMm: 120,
      windowSillProtrusionMm: 30,
    };

    // Depth = 650 - 120 - 30 = 500 mm. Wardrobe depth = 550 mm -> depth collision!
    const res = evaluateNicheFit(
      { widthMm: 1400, depthMm: 550, heightMm: 2000 },
      nicheWithRadiator
    );

    expect(res.effectiveDepthMm).toBe(500);
    expect(res.fitsDepth).toBe(false);
    expect(res.fitsOverall).toBe(false);
  });

  it('detects height collision when furniture exceeds niche height', () => {
    // Niche height 2400 - 10 mm buffer = 2390 mm max. Furniture is 2450 mm.
    const res = evaluateNicheFit(
      { widthMm: 1000, depthMm: 500, heightMm: 2450 },
      standardNiche
    );

    expect(res.fitsHeight).toBe(false);
    expect(res.fitsOverall).toBe(false);
    expect(res.warnings.some(w => w.includes('zbyt wysoki'))).toBe(true);
  });
});
