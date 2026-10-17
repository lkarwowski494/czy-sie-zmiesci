/**
 * Test wyroczni kontrastu motywu WCAG 2.1 (BR-TEST-014, NFR-A11Y-005)
 * Weryfikuje kontrast kolorow bezposrednio z korpusem wygenerowanym przez Pythona
 */

import corpus from './fixtures/theme-contrast-corpus.json';

describe('Theme Contrast WCAG 2.1 Corpus (BR-TEST-014, NFR-A11Y-005)', () => {
  it('contains at least 10 semantic color pair evaluations', () => {
    expect(corpus.evaluations.length).toBeGreaterThanOrEqual(10);
  });

  it('all critical body text pairs satisfy WCAG AAA (>= 7.0:1)', () => {
    const aaaPairs = corpus.evaluations.filter((e) => e.requiredLevel === 'AAA');
    expect(aaaPairs.length).toBeGreaterThanOrEqual(3);

    for (const pair of aaaPairs) {
      expect(pair.calculatedRatio).toBeGreaterThanOrEqual(pair.minRequiredRatio);
      expect(pair.passes).toBe(true);
    }
  });

  it('all secondary text pairs satisfy WCAG AA (>= 4.5:1)', () => {
    const aaPairs = corpus.evaluations.filter((e) => e.requiredLevel === 'AA');
    expect(aaPairs.length).toBeGreaterThanOrEqual(3);

    for (const pair of aaPairs) {
      expect(pair.calculatedRatio).toBeGreaterThanOrEqual(pair.minRequiredRatio);
      expect(pair.passes).toBe(true);
    }
  });

  it('all UI element and large text pairs satisfy WCAG AA UI (>= 3.0:1)', () => {
    const uiPairs = corpus.evaluations.filter((e) => e.requiredLevel === 'AA_large_ui');
    expect(uiPairs.length).toBeGreaterThanOrEqual(3);

    for (const pair of uiPairs) {
      expect(pair.calculatedRatio).toBeGreaterThanOrEqual(pair.minRequiredRatio);
      expect(pair.passes).toBe(true);
    }
  });
});
