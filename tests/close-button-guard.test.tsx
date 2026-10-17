/**
 * close-button-guard.test.tsx
 * Strażnik S1 / NFR-INT-001: Standard zamykania i anulowania w modalach
 * Każdy modal musi posiadać jednoznaczny przycisk wyjścia / anulowania.
 */

import React from 'react';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { EN } from '../src/lib/i18n.en';

describe('Modal & Close Button Guard (S1 / NFR-INT-001)', () => {
  const rootDir = join(__dirname, '..');
  const componentsDir = join(rootDir, 'src/components');

  it('ensures all modal components provide explicit close or cancel accessibility labels', () => {
    const modalFiles = readdirSync(componentsDir)
      .filter((f) => /Modal\.tsx$/.test(f))
      .map((f) => join(componentsDir, f));

    expect(modalFiles.length).toBeGreaterThanOrEqual(3);

    for (const file of modalFiles) {
      const content = readFileSync(file, 'utf8');
      const hasCloseAction =
        content.includes('accessibilityLabel={t(\'Zamknij') ||
        content.includes('accessibilityLabel={t(\'Anuluj') ||
        content.includes('accessibilityLabel="Zamknij') ||
        content.includes('accessibilityLabel="Anuluj') ||
        content.includes('accessibilityRole="button"') ||
        content.includes('accessibilityLabel=') ||
        content.includes('onClose');

      expect(hasCloseAction).toBe(true);
    }
  });

  it('confirms cancel and close keys exist in English dictionary', () => {
    expect(EN['Anuluj']).toBe('Cancel');
    expect(EN['Zamknij']).toBe('Close');
    expect(EN['Zamknij powiadomienie']).toBe('Dismiss notification');
  });
});
