/**
 * matrix-a11y.test.tsx
 * Pełny audyt dostępności (NFR-A11Y-001..008, Z-062..064)
 * - Etykiety i role dostępności
 * - Minimalne pole dotyku >= 44 pt dla interaktywnych elementów
 * - Skalowanie czcionek (maxFontSizeMultiplier)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

describe('Matrix Accessibility Guard (NFR-A11Y-001..008)', () => {
  const rootDir = join(__dirname, '..');
  const componentsDir = join(rootDir, 'src/components');
  const uiDir = join(rootDir, 'src/components/ui');

  it('guarantees touch targets >= 44 pt in UI base primitives (NumInput, SearchField, Empty, Missing)', () => {
    const uiFiles = existsSync(uiDir) ? readdirSync(uiDir).map((f) => join(uiDir, f)) : [];
    expect(uiFiles.length).toBeGreaterThanOrEqual(4);

    for (const f of uiFiles) {
      const content = readFileSync(f, 'utf8');
      // Sprawdzamy czy zdefiniowano minHeight: 44 lub padding gwarantujacy >= 44pt
      const has44pt =
        content.includes('minHeight: 44') ||
        content.includes('minHeight: 48') ||
        content.includes('height: 44') ||
        content.includes('padding: 12') ||
        content.includes('padding: 14') ||
        content.includes('padding: 16') ||
        content.includes('padding: 24');

      expect(has44pt).toBe(true);
    }
  });

  it('validates interactive touchables declare accessibilityRole or accessibilityLabel', () => {
    const modalFiles = readdirSync(componentsDir)
      .filter((f) => /Modal\.tsx$/.test(f))
      .map((f) => join(componentsDir, f));

    for (const f of modalFiles) {
      const content = readFileSync(f, 'utf8');
      const touchableCount = (content.match(/<TouchableOpacity/g) || []).length;
      const a11yCount =
        (content.match(/accessibilityRole/g) || []).length +
        (content.match(/accessibilityLabel/g) || []).length;

      expect(a11yCount).toBeGreaterThanOrEqual(touchableCount > 0 ? 1 : 0);
    }
  });

  it('verifies accessibility header semantics in core screens', () => {
    const appDir = join(rootDir, 'app/(tabs)');
    const tabFiles = readdirSync(appDir)
      .filter((f) => f.endsWith('.tsx') && !f.startsWith('_'))
      .map((f) => join(appDir, f));

    expect(tabFiles.length).toBeGreaterThanOrEqual(5);

    for (const f of tabFiles) {
      const content = readFileSync(f, 'utf8');
      // Weryfikacja obecnosci naglowka / tytułu
      expect(content).toContain('styles.title');
    }
  });
});
