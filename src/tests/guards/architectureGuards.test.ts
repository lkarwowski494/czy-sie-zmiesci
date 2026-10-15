/**
 * Czy się zmieści? (FitCheck) — Strażnicy Architektury i Bezpieczeństwa (Warstwa 3)
 * Wzorem standardów z repozytorium 'organizer' i wytycznych BRD D4 (rozdz. 17).
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Architecture & Safety Guards (Warstwa 3: Strażnicy Inżynierscy)', () => {
  const rootDir = path.resolve(__dirname, '../../../');
  const srcDir = path.join(rootDir, 'src');
  const domainDir = path.join(srcDir, 'domain');
  const servicesDir = path.join(srcDir, 'services');

  // Funkcja pomocnicza do rekursywnego przeszukiwania plików .ts
  function getTsFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('__tests__') && !entry.name.startsWith('.')) {
          files.push(...getTsFiles(fullPath));
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
    return files;
  }

  describe('GUARD 1: 100% Offline-First (Zero Network Imports in Domain & Services)', () => {
    const FORBIDDEN_NETWORK_MODULES = [
      'axios',
      'fetch',
      'node-fetch',
      'apollo',
      '@apollo/client',
      'firebase',
      '@supabase',
      'ky',
      'got',
      'superagent',
      'http',
      'https',
    ];

    it('ensures domain layer contains zero HTTP/network dependencies', () => {
      const domainFiles = getTsFiles(domainDir);
      expect(domainFiles.length).toBeGreaterThan(5);

      for (const filePath of domainFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        for (const forbidden of FORBIDDEN_NETWORK_MODULES) {
          const importRegex = new RegExp(`from ['"]${forbidden}['"]`, 'i');
          const requireRegex = new RegExp(`require\\(['"]${forbidden}['"]\\)`, 'i');
          expect(importRegex.test(content)).toBe(false);
          expect(requireRegex.test(content)).toBe(false);
        }
      }
    });

    it('ensures application services contain zero HTTP/network dependencies', () => {
      const serviceFiles = getTsFiles(servicesDir);
      expect(serviceFiles.length).toBeGreaterThan(0);

      for (const filePath of serviceFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        for (const forbidden of FORBIDDEN_NETWORK_MODULES) {
          const importRegex = new RegExp(`from ['"]${forbidden}['"]`, 'i');
          expect(importRegex.test(content)).toBe(false);
        }
      }
    });
  });

  describe('GUARD 2: Pure Domain Isolation (Zero UI Dependencies in src/domain)', () => {
    const FORBIDDEN_UI_MODULES = [
      'react',
      'react-native',
      'expo',
      'expo-router',
      '@react-navigation',
      'react-native-safe-area-context',
    ];

    it('ensures domain files never import React or React Native', () => {
      const domainFiles = getTsFiles(domainDir);

      for (const filePath of domainFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        for (const forbidden of FORBIDDEN_UI_MODULES) {
          const importRegex = new RegExp(`from ['"]${forbidden}['"]`, 'i');
          expect(importRegex.test(content)).toBe(false);
        }
      }
    });
  });

  describe('GUARD 3: Safety Guardrails & Mandatory Warning Generation', () => {
    it('verifies that garage and towbar checks generate explicit warnings on safety breach', () => {
      const { evaluateRoofSetupHeight } = require('../../domain/garage/garageClearance');
      const res = evaluateRoofSetupHeight({
        vehicleHeightMm: 1700,
        roofBarsHeightMm: 100,
        roofCargoHeightMm: 450, // total with bounce = 2280 mm > 2000 mm
      });

      expect(res.canEnterSign200m).toBe(false);
      expect(res.marginForSign200mMm).toBeLessThan(0);
    });

    it('verifies that towbar check alerts on vertical load overload', () => {
      const { evaluateTowbarLoad } = require('../../domain/garage/towbarPhysics');
      const overloadedResult = evaluateTowbarLoad(
        [
          { id: '1', name: 'E-Bike Heavy 1', weightKg: 28, isElectric: true },
          { id: '2', name: 'E-Bike Heavy 2', weightKg: 28, isElectric: true },
        ],
        { towbarSLimitKg: 50, rackWeightKg: 18, maxBikesCapacity: 2 } // total 74 kg > 50 kg
      );

      expect(overloadedResult.isOverloaded).toBe(true);
      expect(overloadedResult.warnings.length).toBeGreaterThan(0);
      expect(overloadedResult.warnings[0]).toContain('Przeciążenie kuli haka');
      expect(overloadedResult.recommendations.length).toBeGreaterThan(0);
    });

    it('verifies that vehicle DMC violation emits legal safety warning', () => {
      const { calculatePayloadDMC } = require('../../domain/physics/payloadDMC');
      const overloadDmc = calculatePayloadDMC(
        { curbWeightKg: 1400, grossVehicleWeightKg: 1900, maxRoofLoadKg: 75 },
        4, // 4 dodatkowych pasażerów * 75 kg = 300 kg. Dopuszczalny ładunek = 500 - 300 = 200 kg
        350 // 350 kg ładunku > 200 kg limitu
      );

      expect(overloadDmc.status).toBe('CRITICAL_OVERLOAD');
      expect(overloadDmc.overloadKg).toBe(150);
      expect(overloadDmc.warnings.length).toBeGreaterThan(0);
      expect(overloadDmc.warnings[0]).toContain('DMC');
    });
  });

  describe('GUARD 4: Database Safety & ACID Transactions', () => {
    it('ensures database driver enforces rollback on failed transactions', () => {
      const { MemorySQLiteDriver } = require('../../data/db/driver');
      const driver = new MemorySQLiteDriver();

      driver.runSync('CREATE TABLE guard_test (id TEXT PRIMARY KEY, val INT);');
      driver.runSync('INSERT INTO guard_test (id, val) VALUES (?, ?);', ['1', 100]);

      expect(() => {
        driver.withTransactionSync(() => {
          driver.runSync('INSERT INTO guard_test (id, val) VALUES (?, ?);', ['2', 200]);
          throw new Error('Simulated failure during multi-step operation');
        });
      }).toThrow('Simulated failure');

      const rows = driver.getAllSync('SELECT * FROM guard_test');
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe('1');
    });
  });
});
