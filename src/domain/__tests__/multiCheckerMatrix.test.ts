import {
  evaluateMultiCheckerMatrix,
  POPULAR_10_AIRLINES,
} from '../standards/multiCheckerMatrix';

describe('MultiCheckerMatrix (BR-LOT-001, BR-LOT-002, BR-LOT-003, BR-LOT-004)', () => {
  it('covers all 10 popular airlines with valid metadata', () => {
    expect(POPULAR_10_AIRLINES.length).toBe(10);
    const codes = POPULAR_10_AIRLINES.map((a) => a.code);
    expect(codes).toContain('ryanair');
    expect(codes).toContain('wizzair');
    expect(codes).toContain('lot');
    expect(codes).toContain('lufthansa');
    expect(codes).toContain('easyjet');
    expect(codes).toContain('klm');
    expect(codes).toContain('airfrance');
    expect(codes).toContain('british_airways');
    expect(codes).toContain('norwegian');
    expect(codes).toContain('sas');
  });

  it('matches BR-LOT-001 Gherkin criteria: 36x24x17 cm, 4 kg', () => {
    const result = evaluateMultiCheckerMatrix({
      lengthMm: 360,
      widthMm: 240,
      heightMm: 170,
      weightKg: 4,
    });

    // InPost: Gabaryt B
    const inpost = result.lockers.find((l) => l.network === 'inpost');
    expect(inpost?.fits).toBe(true);
    expect(inpost?.recommendedBox).toBe('Gabaryt B');

    // Ryanair: Small fails (240mm > 200mm), Priority passes
    const ryanair = result.airlines.find((a) => a.code === 'ryanair');
    expect(ryanair?.fitsSmallFree).toBe(false);
    expect(ryanair?.fitsPriorityCabin).toBe(true);
    expect(ryanair?.advisory).toContain('Wymaga taryfy Priority');

    // Wizz Air: Small passes (400x300x200mm fits 360x240x170mm)
    const wizzair = result.airlines.find((a) => a.code === 'wizzair');
    expect(wizzair?.fitsSmallFree).toBe(true);
    expect(wizzair?.advisory).toContain('Darmowy mały bagaż');
  });

  it('matches BR-LOT-003 Gherkin criteria: 62 cm length comparison (InPost vs Orlen)', () => {
    // 620 x 200 x 70 mm, 2 kg
    const result = evaluateMultiCheckerMatrix({
      lengthMm: 620,
      widthMm: 200,
      heightMm: 70,
      weightKg: 2,
    });

    const inpost = result.lockers.find((l) => l.network === 'inpost');
    const orlen = result.lockers.find((l) => l.network === 'orlen');

    // InPost ma długość 640 mm -> mieści się (Gabaryt A)
    expect(inpost?.fits).toBe(true);
    expect(inpost?.recommendedBox).toBe('Gabaryt A');

    // Orlen ma długość 600 mm -> nie mieści się!
    expect(orlen?.fits).toBe(false);
    expect(orlen?.recommendedBox).toBeNull();
  });

  it('handles defaults when weightKg and isSoftBag are omitted', () => {
    const result = evaluateMultiCheckerMatrix({
      lengthMm: 150,
      widthMm: 100,
      heightMm: 50,
    });

    expect(result.weightKg).toBe(1.0);
    expect(result.totalLockersPassed).toBe(4);
    expect(result.totalAirlinesPassed).toBe(10);
    expect(result.effectiveDimensionsMm.height).toBe(50);
  });

  it('applies 10% soft bag compression when isSoftBag is true', () => {
    // Torba 570 x 420 x 210 mm normalnie przekracza limit Ryanair Priority (550x400x200)
    // Po ugnieceniu (x 0.9): 513 x 378 x 189 mm -> mieści się!
    const stiffResult = evaluateMultiCheckerMatrix({
      lengthMm: 570,
      widthMm: 420,
      heightMm: 210,
      isSoftBag: false,
    });
    const softResult = evaluateMultiCheckerMatrix({
      lengthMm: 570,
      widthMm: 420,
      heightMm: 210,
      isSoftBag: true,
    });

    const stiffRyanair = stiffResult.airlines.find((a) => a.code === 'ryanair');
    const softRyanair = softResult.airlines.find((a) => a.code === 'ryanair');

    expect(stiffRyanair?.fitsPriorityCabin).toBe(false);
    expect(softRyanair?.fitsPriorityCabin).toBe(true);
  });

  it('evaluates overweight cabin baggage correctly', () => {
    // Wymiary małe (350x250x150 mm), ale waga 9 kg (limit LOT i Lufthansa to 8 kg)
    const result = evaluateMultiCheckerMatrix({
      lengthMm: 350,
      widthMm: 250,
      heightMm: 150,
      weightKg: 9,
    });

    const lot = result.airlines.find((a) => a.code === 'lot');
    expect(lot?.fitsPriorityCabin).toBe(false);
    expect(lot?.advisory).toContain('Przekroczona waga podręczna (9 kg > 8 kg)');
  });

  it('evaluates oversized baggage that exceeds priority dimensions', () => {
    const result = evaluateMultiCheckerMatrix({
      lengthMm: 800,
      widthMm: 600,
      heightMm: 400,
      weightKg: 20,
    });

    for (const a of result.airlines) {
      expect(a.fitsSmallFree).toBe(false);
      expect(a.fitsPriorityCabin).toBe(false);
      expect(a.advisory).toContain('Wymaga nadania jako bagaż rejestrowany');
    }

    // Sprawdzenie skrytek
    const inpost = result.lockers.find((l) => l.network === 'inpost');
    const orlen = result.lockers.find((l) => l.network === 'orlen');
    const dpd = result.lockers.find((l) => l.network === 'dpd');
    const pocztex = result.lockers.find((l) => l.network === 'pocztex');

    expect(inpost?.fits).toBe(false);
    expect(orlen?.fits).toBe(false);
    expect(dpd?.fits).toBe(false);
    expect(pocztex?.fits).toBe(false);
  });

  it('correctly qualifies DPD Pickup and Pocztex boxes', () => {
    // 450 x 350 x 250 mm, 15 kg -> mieści się w DPD (max 500x400x300, 31.5kg) i Pocztex Gabaryt L
    const result = evaluateMultiCheckerMatrix({
      lengthMm: 450,
      widthMm: 350,
      heightMm: 250,
      weightKg: 15,
    });

    const dpd = result.lockers.find((l) => l.network === 'dpd');
    const pocztex = result.lockers.find((l) => l.network === 'pocztex');

    expect(dpd?.fits).toBe(true);
    expect(dpd?.recommendedBox).toBe('Skrytka DPD');
    expect(pocztex?.fits).toBe(true);
    expect(pocztex?.recommendedBox).toBe('Gabaryt L');
  });

  it('correctly qualifies InPost and Orlen Gabaryt C / M', () => {
    // 580 x 370 x 185 mm -> InPost Gabaryt B, Orlen Gabaryt M, Pocztex Gabaryt M
    const result = evaluateMultiCheckerMatrix({
      lengthMm: 580,
      widthMm: 370,
      heightMm: 185,
      weightKg: 10,
    });

    const inpost = result.lockers.find((l) => l.network === 'inpost');
    const orlen = result.lockers.find((l) => l.network === 'orlen');
    const pocztex = result.lockers.find((l) => l.network === 'pocztex');

    expect(inpost?.recommendedBox).toBe('Gabaryt B');
    expect(orlen?.recommendedBox).toBe('Gabaryt M');
    expect(pocztex?.recommendedBox).toBe('Gabaryt M');

    // 580 x 370 x 350 mm -> InPost Gabaryt C, Orlen Gabaryt L
    const resultC = evaluateMultiCheckerMatrix({
      lengthMm: 580,
      widthMm: 370,
      heightMm: 350,
      weightKg: 10,
    });

    expect(resultC.lockers.find((l) => l.network === 'inpost')?.recommendedBox).toBe('Gabaryt C');
    expect(resultC.lockers.find((l) => l.network === 'orlen')?.recommendedBox).toBe('Gabaryt L');
    expect(resultC.lockers.find((l) => l.network === 'pocztex')?.recommendedBox).toBe('Gabaryt L');
  });
});
