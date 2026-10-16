import fs from 'fs';
import path from 'path';

describe('The Craft Purge Verification (FAZA 1 & 4 Audit Compliance)', () => {
  const rootDir = path.resolve(__dirname, '../../..');

  it('confirms SafetyEducationView has been purged from catalog.tsx', () => {
    const catalogFile = fs.readFileSync(
      path.join(rootDir, 'app/(tabs)/catalog.tsx'),
      'utf-8'
    );
    expect(catalogFile).not.toContain('<SafetyEducationView');
    expect(catalogFile).not.toContain("from '../../src/components/SafetyEducationView'");
  });

  it('confirms compareCarVsVanRelocation has been purged from relocation.tsx', () => {
    const relocFile = fs.readFileSync(
      path.join(rootDir, 'app/(tabs)/relocation.tsx'),
      'utf-8'
    );
    expect(relocFile).not.toContain('compareCarVsVanRelocation');
    expect(relocFile).not.toContain('tripComparison');
    expect(relocFile).not.toContain('vanDailyRentalFeePln');
  });

  it('confirms Apple Watch mockup has been purged from settings.tsx', () => {
    const settingsFile = fs.readFileSync(
      path.join(rootDir, 'app/(tabs)/settings.tsx'),
      'utf-8'
    );
    expect(settingsFile).not.toContain('watchScreen');
    expect(settingsFile).not.toContain('watchCase');
    expect(settingsFile).not.toContain('watchCrownControls');
  });

  it('confirms bottom tabs are consolidated to 4 primary tabs in _layout.tsx', () => {
    const layoutFile = fs.readFileSync(
      path.join(rootDir, 'app/(tabs)/_layout.tsx'),
      'utf-8'
    );
    // Exact 4 visible tab titles
    expect(layoutFile).toContain("title: t('Załadunek')");
    expect(layoutFile).toContain("title: t('Przestrzenie')");
    expect(layoutFile).toContain("title: t('Ekwipunek')");
    expect(layoutFile).toContain("title: t('Ustawienia')");

    // Garage tab is hidden from bottom bar
    expect(layoutFile).toContain('href: null');

    // Basalt ceramic background
    expect(layoutFile).toContain('sharedCraftTokens.colors.bgBasalt');
  });
});
