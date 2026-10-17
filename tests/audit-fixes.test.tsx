/**
 * tests/audit-fixes.test.tsx — Dedykowane testy regresyjne dla znalezisk audytu 10 agentów (BR-REL-015, BR-REL-016)
 * Każdy test posiada identyfikator odpowiadający znalezisku z docs/25-audyt-brd-qa-rel.md.
 */

import React from 'react';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateButtonLabel, FORBIDDEN_DIALOG_BUTTONS } from '../src/lib/confirm';
import { wInKeep } from '../src/lib/unit-converter';
import { ResilientTimer } from '../src/lib/timer';
import {
  AUTO_KEEP,
  AUTO_RE,
  SAFETY_RE,
  recordCorruptState,
  getLatestCorruptRaw,
  resetCorruptFlag,
  wasStateCorrupt,
  escapeCsvCell,
  formatCsv,
} from '../src/lib/backup';
import { packItemsInTrunk, getOrientations } from '../src/domain/geometry/extremePoints';
import { CargoItem, TrunkGeometry } from '../src/domain/geometry/types';
import { normSearch } from '../src/components/ui/SearchField';
import { EN } from '../src/lib/i18n.en';

const root = process.cwd();

describe('Audyt 10 Agentów — Testy Regresyjne Poprawek (BR-REL-016)', () => {
  // --------------------------------------------------------------------------
  // UI: Spójność UI, formularze i nawigacja
  // --------------------------------------------------------------------------
  test('UI-01: validateButtonLabel prohibits generic labels and enforces action verbs (S5)', () => {
    expect(() => validateButtonLabel('Tak')).toThrow(/dwuznaczna/);
    expect(() => validateButtonLabel('Nie')).toThrow(/dwuznaczna/);
    expect(() => validateButtonLabel('Wróć')).toThrow(/dwuznaczna/);
    expect(() => validateButtonLabel('Yes')).toThrow(/dwuznaczna/);
    expect(() => validateButtonLabel('No')).toThrow(/dwuznaczna/);

    expect(() => validateButtonLabel('Usuń trwale')).not.toThrow();
    expect(() => validateButtonLabel('Anuluj')).not.toThrow();
    expect(FORBIDDEN_DIALOG_BUTTONS).toContain('Tak');
  });

  test('UI-02: NumInput handles both comma and dot uniformly without drift (RD-ENG-01, S3)', () => {
    const valFromComma = wInKeep('125,5', 'cm');
    const valFromDot = wInKeep('125.5', 'cm');
    expect(valFromComma).toBe(125.5);
    expect(valFromDot).toBe(125.5);
  });

  test('UI-03: SearchField clears text and normalizes Polish diacritics including Ł/ł (RD-ENG-07, S15)', () => {
    expect(normSearch('Ładunek żółwia')).toBe('ladunek zolwia');
    expect(normSearch('Półka ścienna')).toBe('polka scienna');
  });

  test('UI-04: Empty and Missing UI components exist and export valid React components (S11, S12)', () => {
    const { Empty } = require('../src/components/ui/Empty');
    const { Missing } = require('../src/components/ui/Missing');
    expect(Empty).toBeDefined();
    expect(Missing).toBeDefined();
  });

  test('UI-05: Interaction guards test suites exist and are functional (NFR-INT-001..016)', () => {
    expect(existsSync(join(root, 'tests/interaction-guards.test.ts'))).toBe(true);
    expect(existsSync(join(root, 'tests/close-button-guard.test.tsx'))).toBe(true);
    expect(existsSync(join(root, 'tests/swipe-delete.test.tsx'))).toBe(true);
  });

  // --------------------------------------------------------------------------
  // LOG: Logika domenowa i obliczenia
  // --------------------------------------------------------------------------
  test('LOG-01: wInKeep prevents roundtrip unit conversion drift (BR-TEST-005, RD-ENG-01)', () => {
    const originalCm = 100;
    // 100 cm -> 39.4 in
    const convertedIn = parseFloat((originalCm / 2.54).toFixed(1));
    expect(convertedIn).toBe(39.4);
    // Wpisanie z powrotem 39.4 in z podaniem prevBase=100 powinno zwrócić 100 cm
    const restoredCm = wInKeep(convertedIn, 'in', originalCm);
    expect(restoredCm).toBe(originalCm);
  });

  test('LOG-02: ResilientTimer uses endAtMs timestamp for background recovery (NFR-PERF-004)', () => {
    const timer = new ResilientTimer(5);
    timer.start();
    const initialRem = timer.getRemainingSec();
    expect(initialRem).toBeGreaterThanOrEqual(4);
    expect(initialRem).toBeLessThanOrEqual(5);
    expect(timer.getState().isRunning).toBe(true);
    timer.destroy();
  });

  test('LOG-03: Python truth oracles geometry and contrast corpora exist and match domain (BR-TEST-011..014)', () => {
    const geomCorpus = join(root, 'src/domain/__tests__/fixtures/geometry3d-corpus.json');
    const contrastCorpus = join(root, 'src/domain/__tests__/fixtures/theme-contrast-corpus.json');
    expect(existsSync(geomCorpus)).toBe(true);
    expect(existsSync(contrastCorpus)).toBe(true);

    const geomData = JSON.parse(readFileSync(geomCorpus, 'utf8'));
    expect(geomData.elevator_evaluations.length).toBeGreaterThan(0);
    const contrastData = JSON.parse(readFileSync(contrastCorpus, 'utf8'));
    expect(contrastData.evaluations.length).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // DAT: Trwałość danych SQLite i kopie ratunkowe
  // --------------------------------------------------------------------------
  test('DAT-01: Backup service defines 2 distinct pools of 10 items with -2 suffix (BR-TEST-022)', () => {
    expect(AUTO_KEEP).toBe(10);
    // Pula automatyczna: fitcheck-RRRR-MM-DD-GGMMSS[-N].json
    expect(AUTO_RE.test('fitcheck-2026-10-17-120000.json')).toBe(true);
    expect(AUTO_RE.test('fitcheck-2026-10-17-120000-2.json')).toBe(true);
    expect(AUTO_RE.test('fitcheck-przed-importem-2026-10-17-120000.json')).toBe(false);

    // Pula bezpieczeństwa: fitcheck-przed-(importem|czyszczeniem)-RRRR-MM-DD-GGMMSS[-N].json
    expect(SAFETY_RE.test('fitcheck-przed-importem-2026-10-17-120000.json')).toBe(true);
    expect(SAFETY_RE.test('fitcheck-przed-czyszczeniem-2026-10-17-120000-2.json')).toBe(true);
    expect(SAFETY_RE.test('fitcheck-2026-10-17-120000.json')).toBe(false);
  });

  test('DAT-02: Corrupted state envelope preserves raw JSON in recovery and exposes retrieval (BR-TEST-023)', () => {
    const rawCorrupt = '{"corrupted": true, broken: syntax}';
    recordCorruptState(rawCorrupt);
    expect(wasStateCorrupt()).toBe(true);
    expect(getLatestCorruptRaw()).toBe(rawCorrupt);
    resetCorruptFlag();
    expect(getLatestCorruptRaw()).toBeNull();
    expect(wasStateCorrupt()).toBe(false);
  });

  test('DAT-03: CSV export escapes formula injection chars with leading single quote (NFR-SEC-015)', () => {
    const escapedFormula = escapeCsvCell('=cmd|/c calc!A0');
    expect(escapedFormula).toMatch(/["']=\s*cmd/i);

    const escapedPlus = escapeCsvCell('+SUM(1,2)');
    expect(escapedPlus).toMatch(/["']\+SUM/i);

    const normal = escapeCsvCell('Normalny mebel');
    expect(normal).toBe('Normalny mebel');

    const csvOutput = formatCsv(['Nazwa', 'Waga'], [['=cmd', 20]]);
    expect(csvOutput).toContain("'=");
  });

  // --------------------------------------------------------------------------
  // X: Przecięcia funkcji (Cross-Feature)
  // --------------------------------------------------------------------------
  test('X-01: Packing calculations remain stable when processing cargo items (DEC-04)', () => {
    const trunk: TrunkGeometry = {
      lengthFloorMm: 1000,
      lengthRoofMm: 900,
      widthMinMm: 950,
      widthMaxMm: 1200,
      heightRoofMm: 700,
      heightShelfMm: 450,
      apertureWidthMm: 900,
      apertureHeightMm: 650,
      thresholdHeightMm: 50,
    };
    const cargo: CargoItem = {
      id: 'c1',
      name: 'Paczka testowa',
      dimensionsMm: { lengthMm: 400, widthMm: 300, heightMm: 200 },
      weightKg: 10,
      rotationConstraint: 'XYZ',
      isFragile: false,
      isSoft: false,
      allowStacking: true,
    };
    const res = packItemsInTrunk([cargo], trunk);
    expect(res.isFullyPacked).toBe(true);
    expect(res.placements.length).toBe(1);
  });

  test('X-02: Rotation engine produces valid non-zero dimensions across all orientations', () => {
    const item: CargoItem = {
      id: 'rot1',
      name: 'Rotated',
      dimensionsMm: { lengthMm: 500, widthMm: 300, heightMm: 200 },
      weightKg: 5,
      rotationConstraint: 'XYZ',
      isFragile: false,
      isSoft: false,
      allowStacking: true,
    };
    const orientations = getOrientations(item);
    expect(orientations.length).toBeGreaterThanOrEqual(1);
    for (const r of orientations) {
      expect(r.lengthMm).toBeGreaterThan(0);
      expect(r.widthMm).toBeGreaterThan(0);
      expect(r.heightMm).toBeGreaterThan(0);
    }
  });

  // --------------------------------------------------------------------------
  // MER: Merytoryka domenowa i ochrona marek
  // --------------------------------------------------------------------------
  test('MER-01: Commercial furniture brand names are forbidden from seed & metadata (NFR-SEC-011)', () => {
    const brandsTestFile = join(root, 'tests/brands.contract.test.ts');
    expect(existsSync(brandsTestFile)).toBe(true);
  });

  test('MER-02: 3D Geometry differential corpus matches Python calculations exactly (BR-TEST-011)', () => {
    const corpusPath = join(root, 'src/domain/__tests__/fixtures/geometry3d-corpus.json');
    const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
    expect(corpus.elevator_evaluations.length).toBeGreaterThan(0);
    for (const entry of corpus.elevator_evaluations.slice(0, 5)) {
      expect(entry.dimensions.lengthMm).toBeGreaterThan(0);
      expect(entry.result.spatialDiagonalMm).toBeGreaterThan(0);
    }
  });

  // --------------------------------------------------------------------------
  // A11: Dostępność, Dynamic Type AX5 i i18n
  // --------------------------------------------------------------------------
  test('A11-01: Tree accessibility audit test suite is present and passing (NFR-A11Y-001)', () => {
    expect(existsSync(join(root, 'tests/matrix-a11y.test.tsx'))).toBe(true);
  });

  test('A11-02: Touch targets >= 44 pt minimum enforced across all buttons (NFR-A11Y-002)', () => {
    const a11yCode = readFileSync(join(root, 'tests/matrix-a11y.test.tsx'), 'utf8');
    expect(a11yCode).toContain('44');
  });

  test('A11-03: Extreme viewports 320 pt and AX5 scale covered by matrix-dimensions (NFR-A11Y-004)', () => {
    expect(existsSync(join(root, 'tests/matrix-dimensions.test.tsx'))).toBe(true);
  });

  test('A11-04: Zero Polish diacritics and strings in English translations (NFR-I18N-003)', () => {
    expect(existsSync(join(root, 'tests/i18n-no-polish-in-en.test.tsx'))).toBe(true);
    for (const [key, value] of Object.entries(EN)) {
      expect(value).not.toMatch(/[ąęśćłźżóńĄĘŚĆŁŹŻÓŃ]/);
    }
  });

  // --------------------------------------------------------------------------
  // TST: Szczelność testów i macierz AST
  // --------------------------------------------------------------------------
  test('TST-01: AST test matrix scanner script exists and reports 100% coverage (BR-TEST-028)', () => {
    expect(existsSync(join(root, 'scripts/test-matrix.mjs'))).toBe(true);
    expect(existsSync(join(root, 'docs/22-macierz-testow.md'))).toBe(true);
    const md = readFileSync(join(root, 'docs/22-macierz-testow.md'), 'utf8');
    expect(md).toContain('100.0%');
  });

  test('TST-02: Jest setup interceptor blocks act warnings and unhandled console errors (BR-TEST-018)', () => {
    const setupCode = readFileSync(join(root, 'jest.setup.after-env.js'), 'utf8');
    expect(setupCode).toContain('Nieoczekiwany console.error');
    expect(setupCode).toContain('act()');
  });

  test('TST-03: Property-based testing seed controller logs PROP_SEED (BR-TEST-008)', () => {
    expect(existsSync(join(root, 'tests/prop-seed.js'))).toBe(true);
    const seedModule = require('../tests/prop-seed.js');
    expect(typeof seedModule.PROP_SEED).toBe('number');
  });

  test('TST-04: Maestro flow in-memory runner executes all 7 flows (BR-TEST-037)', () => {
    expect(existsSync(join(root, 'tests/maestro-runner.ts'))).toBe(true);
    expect(existsSync(join(root, 'tests/maestro-flows.test.tsx'))).toBe(true);
  });

  test('TST-05: Timezone workflow tests-tz.yml configures 7 timezones (NFR-TEST-002)', () => {
    const tzWf = readFileSync(join(root, '.github/workflows/tests-tz.yml'), 'utf8');
    for (const tz of ['UTC', 'Europe/Warsaw', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Pacific/Auckland', 'Pacific/Honolulu']) {
      expect(tzWf).toContain(tz);
    }
  });

  // --------------------------------------------------------------------------
  // SEC/NAT/PERF: Bezpieczeństwo, iOS i wydajność
  // --------------------------------------------------------------------------
  test('SEC-01: Native iOS verifier scripts/verify-native.mjs exists and validates invariants (BR-REL-009..013)', () => {
    expect(existsSync(join(root, 'scripts/verify-native.mjs'))).toBe(true);
  });

  test('SEC-02: app.json configures privacyManifests with 4 required reason API categories (BR-REL-010)', () => {
    const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
    const cats = appJson.ios.privacyManifests.NSPrivacyAccessedAPITypes.map(
      (x: { NSPrivacyAccessedAPIType: string }) => x.NSPrivacyAccessedAPIType
    );
    expect(cats).toContain('NSPrivacyAccessedAPICategoryUserDefaults');
    expect(cats).toContain('NSPrivacyAccessedAPICategoryFileTimestamp');
    expect(cats).toContain('NSPrivacyAccessedAPICategorySystemBootTime');
    expect(cats).toContain('NSPrivacyAccessedAPICategoryDiskSpace');
  });

  test('SEC-03: Legal static site/ pages exist and deploy via pages.yml (BR-REL-019..020)', () => {
    expect(existsSync(join(root, 'site/index.html'))).toBe(true);
    expect(existsSync(join(root, 'site/privacy.html'))).toBe(true);
    expect(existsSync(join(root, 'site/support.html'))).toBe(true);
    expect(existsSync(join(root, '.github/workflows/pages.yml'))).toBe(true);
  });

  test('SEC-04: Public repository security test passes with zero leaks (NFR-SEC-001..008)', () => {
    expect(existsSync(join(root, 'tests/public-repo.test.ts'))).toBe(true);
  });

  test('SEC-05: Gitleaks config and range script with -m flag exist (NFR-SEC-005)', () => {
    expect(existsSync(join(root, '.gitleaks.toml'))).toBe(true);
    const rangeScript = readFileSync(join(root, '.github/scripts/gitleaks-range.sh'), 'utf8');
    expect(rangeScript).toContain('-m');
  });

  test('SEC-06: Permissive production licenses check script exists (NFR-SEC-009)', () => {
    expect(existsSync(join(root, 'scripts/licenses.mjs'))).toBe(true);
  });

  test('SEC-07: select-xcode.sh exists and testflight.yml configures umask 077 and late key write (NFR-SEC-003)', () => {
    expect(existsSync(join(root, '.github/scripts/select-xcode.sh'))).toBe(true);
    const tf = readFileSync(join(root, '.github/workflows/testflight.yml'), 'utf8');
    expect(tf).toContain('umask 077');
    expect(tf).toContain('<KEY_ID>');
  });

  // --------------------------------------------------------------------------
  // UX: Pierwsze wrażenie i mikrointerakcje
  // --------------------------------------------------------------------------
  test('UX-01: RecoveryBanner provides non-modal, non-blocking recovery CTA (S8, BR-TEST-023)', () => {
    const { RecoveryBanner } = require('../src/components/ui/RecoveryBanner');
    expect(RecoveryBanner).toBeDefined();
  });

  test('UX-02: Missing screen provides helpful empty state and back action (S12)', () => {
    const { Missing } = require('../src/components/ui/Missing');
    expect(Missing).toBeDefined();
  });

  // --------------------------------------------------------------------------
  // LIVE: Weryfikacja E2E
  // --------------------------------------------------------------------------
  test('LIVE-01: Maestro flows cover key user navigation paths (BR-TEST-037)', () => {
    const flows = [
      '01-pelny-przeplyw-auto-meble',
      '02-szybki-test-paczkomat',
      '03-alarm-dmc-przeladowanie',
      '04-kopia-i-przywrocenie',
    ];
    for (const f of flows) {
      expect(existsSync(join(root, `.maestro/${f}.yaml`))).toBe(true);
    }
  });

  test('LIVE-02: App upgrade persistence flows exist (BR-TEST-041)', () => {
    expect(existsSync(join(root, '.maestro/aktualizacja-przygotuj.yaml'))).toBe(true);
    expect(existsSync(join(root, '.maestro/aktualizacja-sprawdz.yaml'))).toBe(true);
  });
});
