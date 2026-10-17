#!/usr/bin/env node
/**
 * Weryfikuje wygenerowany projekt natywny iOS (expo prebuild --no-install)
 * na Linuksie, macOS lub Windowsie bez konieczności uruchamiania Xcode (BR-REL-009..013).
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
const appName = appJson.name;
const iosDir = join(root, 'ios');
const hadIos = existsSync(iosDir);

const errors = [];
const check = (cond, msg) => {
  if (!cond) errors.push(msg);
};

// Sprawdzenie statyczne konfiguracji app.json (działa zawsze natychmiast)
check(appJson.ios?.supportsTablet === false, 'app.json: ios.supportsTablet musi być false');
check(appJson.ios?.infoPlist?.ITSAppUsesNonExemptEncryption === false, 'app.json: ITSAppUsesNonExemptEncryption musi być false');
check(appJson.ios?.infoPlist?.UIRequiresFullScreen === true, 'app.json: UIRequiresFullScreen musi być true');

const apiTypes = (appJson.ios?.privacyManifests?.NSPrivacyAccessedAPITypes || []).map(
  (x) => x.NSPrivacyAccessedAPIType
);
for (const cat of [
  'NSPrivacyAccessedAPICategoryUserDefaults',
  'NSPrivacyAccessedAPICategoryFileTimestamp',
  'NSPrivacyAccessedAPICategorySystemBootTime',
  'NSPrivacyAccessedAPICategoryDiskSpace',
]) {
  check(apiTypes.includes(cat), `app.json: brak kategorii ${cat} w privacyManifests`);
}

// Jeśli nie zażądano pominięcia prebuilda lub ios/ już istnieje
if (!process.argv.includes('--app-json-only')) {
  try {
    if (!hadIos) {
      console.log('[verify-native] Generowanie katalogu ios/ przez expo prebuild --no-install...');
      execSync('npx expo prebuild --platform ios --no-install --clean', {
        cwd: root,
        stdio: 'inherit',
      });
    }

    let actualScheme = appJson.slug?.replace(/[^a-zA-Z0-9]/g, '') || appName.replace(/[^a-zA-Z0-9]/g, '');
    if (existsSync(iosDir)) {
      const xcodeProj = readdirSync(iosDir).find((f) => f.endsWith('.xcodeproj'));
      if (xcodeProj) {
        actualScheme = xcodeProj.replace('.xcodeproj', '');
      }
    }

    const pbxPath = join(iosDir, `${actualScheme}.xcodeproj`, 'project.pbxproj');
    const plistPath = join(iosDir, actualScheme, 'Info.plist');
    const privPath = join(iosDir, actualScheme, 'PrivacyInfo.xcprivacy');
    const entPath = join(iosDir, actualScheme, `${actualScheme}.entitlements`);

    check(existsSync(pbxPath), `Brak pliku projektu Xcode: ${pbxPath}`);
    check(existsSync(plistPath), `Brak pliku Info.plist: ${plistPath}`);
    check(existsSync(privPath), `Brak pliku PrivacyInfo.xcprivacy: ${privPath}`);

    // 1. Brak pustego pliku .entitlements w aplikacjach offline
    if (existsSync(entPath) && (!appJson.ios?.entitlements || Object.keys(appJson.ios?.entitlements || {}).length === 0)) {
      const entContent = readFileSync(entPath, 'utf8');
      const hasKeys = /<key>[^<]+<\/key>/.test(entContent);
      check(hasKeys, `Plik ${entPath} jest pusty — usuń go w wtyczce prebuild, aby nie blokować automatycznego podpisywania`);
    }

    if (existsSync(pbxPath) && existsSync(plistPath)) {
      const pbx = readFileSync(pbxPath, 'utf8');
      const plist = readFileSync(plistPath, 'utf8');

      // 2. Bundle Identifier
      const expectedBundleId = appJson.ios?.bundleIdentifier;
      check(
        pbx.includes(`PRODUCT_BUNDLE_IDENTIFIER = ${expectedBundleId};`) ||
          pbx.includes(`PRODUCT_BUNDLE_IDENTIFIER = "${expectedBundleId}";`),
        `PRODUCT_BUNDLE_IDENTIFIER w project.pbxproj nie zgadza się z ${expectedBundleId}`
      );

      // 3. ITSAppUsesNonExemptEncryption = false
      check(
        /<key>ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/.test(plist),
        'Info.plist musi mieć ITSAppUsesNonExemptEncryption = false'
      );

      // 4. Format wersji
      const ver = appJson.version;
      check(/^\d+\.\d+(\.\d+)?$/.test(ver), `Wersja '${ver}' w app.json musi mieć format X.Y lub X.Y.Z`);
      check(
        pbx.includes(`MARKETING_VERSION = ${ver};`),
        `MARKETING_VERSION w project.pbxproj nie zgadza się z ${ver}`
      );

      // 5. Zakaz niechcianych uprawnień śledzących w Info.plist
      const forbiddenPermissions = [
        'NSMicrophoneUsageDescription',
        'NSLocationWhenInUseUsageDescription',
        'NSLocationAlwaysUsageDescription',
        'NSContactsUsageDescription',
        'NSBluetoothAlwaysUsageDescription',
        'NSUserTrackingUsageDescription',
        'NSAppleMusicUsageDescription',
      ];
      for (const perm of forbiddenPermissions) {
        check(!plist.includes(`<key>${perm}</key>`), `Info.plist zawiera niedozwolone uprawnienie: ${perm}`);
      }

      // 6. Orientacja pionowa i pełny ekran
      if (appJson.ios?.supportsTablet === false) {
        check(
          /<key>UIRequiresFullScreen<\/key>\s*<true\/>/.test(plist),
          'Info.plist musi mieć UIRequiresFullScreen = true przy supportsTablet: false'
        );
        check(
          pbx.includes('TARGETED_DEVICE_FAMILY = "1";') || pbx.includes('TARGETED_DEVICE_FAMILY = 1;'),
          'project.pbxproj musi mieć TARGETED_DEVICE_FAMILY = "1" (tylko iPhone)'
        );
      }
    }

    // 7. Weryfikacja 4 kategorii Required Reason APIs w PrivacyInfo.xcprivacy
    if (existsSync(privPath)) {
      const priv = readFileSync(privPath, 'utf8');
      check(
        /<key>NSPrivacyTracking<\/key>\s*<false\/>/.test(priv),
        'PrivacyInfo.xcprivacy musi mieć NSPrivacyTracking = false'
      );
      for (const cat of [
        'NSPrivacyAccessedAPICategoryUserDefaults',
        'NSPrivacyAccessedAPICategoryFileTimestamp',
        'NSPrivacyAccessedAPICategorySystemBootTime',
        'NSPrivacyAccessedAPICategoryDiskSpace',
      ]) {
        check(priv.includes(cat), `PrivacyInfo.xcprivacy musi deklarować kategorię Required Reason API: ${cat}`);
      }
    }
  } finally {
    if (!hadIos && existsSync(iosDir)) {
      rmSync(iosDir, { recursive: true, force: true });
    }
  }
}

if (errors.length > 0) {
  console.error('\n[verify-native] BŁĘDY KONFIGURACJI NATYWNEJ iOS:');
  for (const e of errors) console.error(`  ✖ ${e}`);
  process.exit(1);
}
console.log('[verify-native] Wszystkie niezmienniki natywnego projektu iOS spełnione.');
