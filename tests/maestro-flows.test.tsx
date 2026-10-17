/**
 * maestro-flows.test.tsx
 * Wykonanie wszystkich scenariuszy .maestro/*.yaml w pamięci w Jest (BR-TEST-037)
 * Badane 3 krytyczne punkty czasowe: poniedziałek, niedziela oraz 23:55 UTC
 */

import { MaestroRunner } from './maestro-runner';

describe('Maestro Scenarios in Jest Runner (BR-TEST-037, Z-042)', () => {
  const runner = new MaestroRunner();
  const flows = runner.loadFlows();

  it('loads all 7 certified E2E flows from .maestro directory', () => {
    expect(flows.length).toBeGreaterThanOrEqual(7);
    const flowIds = flows.map((f) => f.id);
    expect(flowIds).toContain('01-pelny-przeplyw-auto-meble');
    expect(flowIds).toContain('02-szybki-test-paczkomat');
    expect(flowIds).toContain('03-alarm-dmc-przeladowanie');
    expect(flowIds).toContain('04-kopia-i-przywrocenie');
    expect(flowIds).toContain('05-przeprowadzka-mieszkania');
    expect(flowIds).toContain('06-wneka-scienna-listwy');
    expect(flowIds).toContain('07-garaz-box-dachowy');
  });

  // Punkt 1: Zwykły roboczy poniedziałek 10:00 UTC
  describe('Execution for Monday 10:00 UTC', () => {
    const monday = new Date('2026-10-19T10:00:00.000Z');

    for (const flow of flows) {
      it(`runs ${flow.id} cleanly on Monday`, () => {
        const result = runner.runFlow(flow, monday);
        expect(result.errors).toEqual([]);
        expect(result.success).toBe(true);
        expect(result.executedStepsCount).toBeGreaterThan(0);
      });
    }
  });

  // Punkt 2: Niedziela (start tygodnia / podsumowania) 10:00 UTC
  describe('Execution for Sunday 10:00 UTC', () => {
    const sunday = new Date('2026-10-18T10:00:00.000Z');

    for (const flow of flows) {
      it(`runs ${flow.id} cleanly on Sunday`, () => {
        const result = runner.runFlow(flow, sunday);
        expect(result.errors).toEqual([]);
        expect(result.success).toBe(true);
      });
    }
  });

  // Punkt 3: 23:55 UTC (granica doby i przesunięcia dat w strefach czasowych)
  describe('Execution for 23:55 UTC Day-Boundary', () => {
    const lateUtc = new Date('2026-10-17T23:55:00.000Z');

    for (const flow of flows) {
      it(`runs ${flow.id} cleanly at 23:55 UTC`, () => {
        const result = runner.runFlow(flow, lateUtc);
        expect(result.errors).toEqual([]);
        expect(result.success).toBe(true);
      });
    }
  });
});
