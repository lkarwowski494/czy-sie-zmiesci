/**
 * Czy się zmieści? (FitCheck) — Strażnicy Zgodności Prawnej i Marek (Warstwa 9)
 * Weryfikuje obowiązkowe klauzule prawne (art. 61 PoRD, DMC, siła bezwładności) oraz ochronę znaków towarowych.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Safety Disclaimer & Brand Compatibility Guards (Warstwa 9)', () => {
  const rootDir = path.resolve(__dirname, '../../../');
  const readmePath = path.join(rootDir, 'README.md');
  const readmeContent = fs.readFileSync(readmePath, 'utf-8');

  describe('GUARD: Legal & Physics Safety Disclaimers', () => {
    it('verifies that documentation and legal rules explicitly cite Polish Road Traffic Act (art. 61 PoRD)', () => {
      expect(readmeContent).toContain('art. 61');
      expect(readmeContent).toContain('DMC');
    });

    it('verifies that kinetic impact warning (15 kg at 50 km/h gives ~750 kg) is documented for user education', () => {
      expect(readmeContent).toContain('750 kg');
      expect(readmeContent).toContain('50 km/h');
    });

    it('verifies that towbar tongue load S safety parameter is documented with accuracy guarantees', () => {
      expect(readmeContent).toContain('haka');
      expect(readmeContent).toContain('0.5 kg');
    });
  });

  describe('GUARD: Third-Party Trademark & Compatibility Protection', () => {
    const THIRD_PARTY_BRANDS = ['IKEA', 'Bosch', 'Samsung', 'Thule', 'InPost', 'Ryanair', 'Wizz Air'];

    it('verifies that third-party brands are documented in compatibility or benchmark context', () => {
      for (const brand of THIRD_PARTY_BRANDS) {
        expect(readmeContent).toContain(brand);
      }
    });

    it('ensures domain models remain vendor-neutral without hardcoded proprietary protocols', () => {
      const typesPath = path.join(rootDir, 'src/domain/geometry/types.ts');
      const typesContent = fs.readFileSync(typesPath, 'utf-8');

      // Czyste typy domenowe muszą operować na pojęciach geometrycznych (CargoItem, TrunkGeometry)
      expect(typesContent).toContain('export interface CargoItem');
      expect(typesContent).toContain('export interface TrunkGeometry');
      expect(typesContent).not.toContain('IKEA');
      expect(typesContent).not.toContain('Bosch');
    });
  });
});
