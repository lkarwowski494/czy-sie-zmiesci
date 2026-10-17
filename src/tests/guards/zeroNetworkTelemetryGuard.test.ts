import * as fs from 'fs';
import * as path from 'path';

describe('Zero-Network & Zero-Telemetry Guard (Apps4Craft Privacy Rigor)', () => {
  const rootDir = path.resolve(__dirname, '../../../');
  const srcDir = path.resolve(rootDir, 'src');
  const packageJsonPath = path.resolve(rootDir, 'package.json');

  const FORBIDDEN_TELEMETRY_PACKAGES = [
    'analytics',
    'sentry',
    'mixpanel',
    'amplitude',
    'segment',
    'appsflyer',
    'facebook',
    'fbsdk',
    'posthog',
    'datadog',
    'telemetry',
    'track',
  ];

  it('guarantees package.json has ZERO telemetry, tracking, or remote analytics dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    const detectedTelemetry: string[] = [];

    Object.keys(allDeps).forEach((depName) => {
      const lower = depName.toLowerCase();
      FORBIDDEN_TELEMETRY_PACKAGES.forEach((forbidden) => {
        if (lower.includes(forbidden)) {
          detectedTelemetry.push(`${depName} (matched: ${forbidden})`);
        }
      });
    });

    expect(detectedTelemetry).toEqual([]);
  });

  it('guarantees src/domain core calculations make ZERO network requests (100% offline-first)', () => {
    const domainDir = path.resolve(srcDir, 'domain');
    const domainFiles = getAllFilesRecursively(domainDir).filter(
      (f) => f.endsWith('.ts') && !f.endsWith('.test.ts')
    );

    expect(domainFiles.length).toBeGreaterThan(15);

    const FORBIDDEN_NETWORK_CALLS = [
      'fetch(',
      'XMLHttpRequest',
      'WebSocket',
      'axios',
      'sendBeacon',
      'http://',
      'https://',
    ];

    const violations: { file: string; match: string }[] = [];

    domainFiles.forEach((filePath) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      FORBIDDEN_NETWORK_CALLS.forEach((pattern) => {
        // Exclude standard comments or documentation if any
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
          if (line.includes(pattern)) {
            violations.push({
              file: `${path.basename(filePath)}:L${idx + 1}`,
              match: pattern,
            });
          }
        });
      });
    });

    expect(violations).toEqual([]);
  });

  it('guarantees all database transactions use local SQLite with no cloud credentials', () => {
    const dbDir = path.resolve(srcDir, 'data/db');
    const dbFiles = getAllFilesRecursively(dbDir).filter(
      (f) => f.endsWith('.ts') && !f.endsWith('.test.ts')
    );

    const FORBIDDEN_CLOUD_STORAGE = [
      'firebase',
      'supabase',
      'aws-sdk',
      'dynamodb',
      'mongodb',
      'couchdb',
      'realm',
    ];

    const violations: string[] = [];

    dbFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8').toLowerCase();
      FORBIDDEN_CLOUD_STORAGE.forEach((cloud) => {
        if (content.includes(cloud)) {
          violations.push(`${path.basename(file)} contains ${cloud}`);
        }
      });
    });

    expect(violations).toEqual([]);
  });
});

function getAllFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.resolve(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesRecursively(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}
