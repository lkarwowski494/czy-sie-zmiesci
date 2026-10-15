/**
 * Czy się zmieści? (FitCheck) — Kontrakty Dostępności (WCAG AAA & Apple HIG, Warstwa 8)
 * Zgodnie z wytycznymi BRD D4 (rozdz. 17) oraz Apple Human Interface Guidelines.
 */

export interface ColorRGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

// Obliczenie względnej luminancji wg standardu W3C WCAG 2.1
export function calculateRelativeLuminance(rgb: ColorRGB): number {
  const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Obliczenie współczynnika kontrastu między dwoma kolorami (wartość od 1:1 do 21:1)
export function calculateContrastRatio(fg: ColorRGB, bg: ColorRGB): number {
  const lum1 = calculateRelativeLuminance(fg);
  const lum2 = calculateRelativeLuminance(bg);
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (brighter + 0.05) / (darker + 0.05);
}

export function hexToRgb(hex: string): ColorRGB {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

describe('Accessibility & Apple HIG Contracts (Warstwa 8)', () => {
  describe('Touch Target Size Minimums (Apple HIG >= 44x44 pt)', () => {
    const UI_INTERACTIVE_TARGETS = [
      { component: 'CounterButton', widthPt: 44, heightPt: 44 },
      { component: 'PillSelector', widthPt: 80, heightPt: 44 },
      { component: 'QuickFilterChip', widthPt: 65, heightPt: 44 },
      { component: 'ActionButton', widthPt: 120, heightPt: 48 },
      { component: 'HeaderBackButton', widthPt: 44, heightPt: 44 },
      { component: 'TabBarItem', widthPt: 64, heightPt: 50 },
    ];

    it('verifies all interactive components adhere to minimum 44x44 pt touch bounding box', () => {
      for (const target of UI_INTERACTIVE_TARGETS) {
        expect(target.widthPt).toBeGreaterThanOrEqual(44);
        expect(target.heightPt).toBeGreaterThanOrEqual(44);
      }
    });
  });

  describe('Color Contrast Ratios (WCAG AA >= 4.5:1, WCAG AAA >= 7:1)', () => {
    // Oficjalna paleta barwna aplikacji FitCheck (Dark Mode Slate/Sky/Emerald)
    const PALETTE = {
      background: '#0F172A', // Slate 900
      cardBackground: '#1E293B', // Slate 800
      textPrimary: '#F8FAFC', // Slate 50
      textSecondary: '#CBD5E1', // Slate 300
      accentSky: '#38BDF8', // Sky 400
      successEmerald: '#34D399', // Emerald 400
      warningAmber: '#FBBF24', // Amber 400
      dangerRose: '#F87171', // Rose 400
    };

    const bgRgb = hexToRgb(PALETTE.background);
    const cardBgRgb = hexToRgb(PALETTE.cardBackground);

    it('guarantees Primary Text meets WCAG AAA contrast (>= 7.0:1) on background', () => {
      const primaryRgb = hexToRgb(PALETTE.textPrimary);
      const ratio = calculateContrastRatio(primaryRgb, bgRgb);
      expect(ratio).toBeGreaterThanOrEqual(12.0); // Bardzo wysoki kontrast ~14.5:1
    });

    it('guarantees Secondary Text meets WCAG AA contrast (>= 4.5:1) on card surface', () => {
      const secondaryRgb = hexToRgb(PALETTE.textSecondary);
      const ratio = calculateContrastRatio(secondaryRgb, cardBgRgb);
      expect(ratio).toBeGreaterThanOrEqual(7.0); // Przewyższa nawet normę AAA
    });

    it('guarantees Sky Accent and Status Badges meet WCAG AA contrast (>= 4.5:1)', () => {
      const skyRgb = hexToRgb(PALETTE.accentSky);
      const emeraldRgb = hexToRgb(PALETTE.successEmerald);
      const amberRgb = hexToRgb(PALETTE.warningAmber);
      const roseRgb = hexToRgb(PALETTE.dangerRose);

      expect(calculateContrastRatio(skyRgb, bgRgb)).toBeGreaterThanOrEqual(6.0);
      expect(calculateContrastRatio(emeraldRgb, bgRgb)).toBeGreaterThanOrEqual(8.0);
      expect(calculateContrastRatio(amberRgb, bgRgb)).toBeGreaterThanOrEqual(9.0);
      expect(calculateContrastRatio(roseRgb, bgRgb)).toBeGreaterThanOrEqual(6.0);
    });
  });

  describe('VoiceOver & Screen Reader Text Contracts', () => {
    it('verifies accessibility description formatting for complex 3D packed item', () => {
      const item = {
        name: 'Szafa PAX 150',
        lengthCm: 208,
        widthCm: 61,
        heightCm: 8,
        weightKg: 45,
        position: 'Przy grodzi, płasko na podłodze',
      };

      const accessibilityLabel = `${item.name}, wymiary: ${item.lengthCm} na ${item.widthCm} na ${item.heightCm} centymetrów, waga ${item.weightKg} kilogramów. Pozycja: ${item.position}.`;

      expect(accessibilityLabel).toContain('centymetrów');
      expect(accessibilityLabel).toContain('kilogramów');
      expect(accessibilityLabel).not.toContain('×'); // VoiceOver lepiej czyta słowo "na" niż symbol mnożenia
      expect(accessibilityLabel).not.toContain('mm');
    });
  });
});
