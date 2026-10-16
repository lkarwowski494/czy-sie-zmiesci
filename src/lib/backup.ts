/**
 * Czy się zmieści? (FitCheck) — Moduł Kopii Zapasowych i Rotacji JSON (Zadanie C5, ZP-06)
 * Standaryzowany silnik Apps4Brew: 10 rotacyjnych kopii w Documents/Backup/,
 * kopie bezpieczeństwa przed importem/resetem oraz udostępnianie JSON przez systemowy arkusz iOS/Android.
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { t } from './i18n';
import { BackupExportPayload } from '../data/db';

export const SCHEMA_VERSION = 2;
export const AUTO_DIR = 'Backup/';
export const AUTO_KEEP = 10;

/**
 * Wzorzec nazw kopii automatycznych: fitcheck-RRRR-MM-DD-GGMMSS[-N].json
 */
export const AUTO_RE = /^fitcheck-(\d{4}-\d{2}-\d{2}-\d{6})(?:-(\d{1,3}))?\.json$/;

/**
 * Wzorzec nazw kopii bezpieczeństwa: fitcheck-przed-(importem|czyszczeniem)-RRRR-MM-DD-GGMMSS[-N].json
 */
export const SAFETY_RE =
  /^fitcheck-przed-(?:importem|czyszczeniem)-(\d{4}-\d{2}-\d{2}-\d{6})(?:-(\d{1,3}))?\.json$/;

export type FitCheckBackupData = BackupExportPayload['data'];

export interface FitCheckBackupEnvelope {
  format: 'fitcheck-backup';
  schemaVersion: number;
  exportedAt: string;
  bundleId: string;
  state: FitCheckBackupData;
}

export function buildBackup(state: FitCheckBackupData): FitCheckBackupEnvelope {
  return {
    format: 'fitcheck-backup',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    bundleId: 'com.apps4brew.fitcheck',
    state,
  };
}

export function localISODate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function stampOf(d: Date = new Date()): string {
  const iso = localISODate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${iso}-${hours}${minutes}${seconds}`;
}

export const poolKey = (m: RegExpExecArray): string =>
  `${m[1]}-${(m[2] ?? '1').padStart(3, '0')}`;

/**
 * Udostępnienie pliku tymczasowego w Caches z gwarantowanym usunięciem w bloku finally (Apps4Brew SEC-09).
 */
async function shareTemp(
  name: string,
  body: string,
  opts: { mimeType: string; dialogTitle: string }
): Promise<boolean> {
  const path = `${FileSystem.cacheDirectory}${name}`;
  try {
    await FileSystem.writeAsStringAsync(path, body);
    if (!(await Sharing.isAvailableAsync())) {
      return false;
    }
    await Sharing.shareAsync(path, opts);
    return true;
  } finally {
    await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {});
  }
}

/**
 * Eksport kopii zapasowej do pliku JSON i wywołanie arkusza udostępniania.
 */
export async function exportBackup(state: FitCheckBackupData): Promise<boolean> {
  const envelope = buildBackup(state);
  const fileName = `fitcheck-backup-${localISODate()}.json`;
  return await shareTemp(fileName, JSON.stringify(envelope, null, 2), {
    mimeType: 'application/json',
    dialogTitle: t('Kopia zapasowa'),
  });
}

/**
 * Zapis kopii zapasowej w katalogu Dokumentów (Backup/...) z rotacją do AUTO_KEEP najnowszych.
 */
async function writeBackupFile(
  prefix: string,
  re: RegExp,
  state: FitCheckBackupData
): Promise<string> {
  if (!FileSystem.documentDirectory) {
    throw new Error('Brak katalogu dokumentów aplikacji');
  }

  const dir = `${FileSystem.documentDirectory}${AUTO_DIR}`;
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const stamp = stampOf(new Date());
  let name = `${prefix}${stamp}.json`;

  for (let n = 2; n < 1000 && (await FileSystem.getInfoAsync(`${dir}${name}`)).exists; n++) {
    name = `${prefix}${stamp}-${n}.json`;
  }

  const envelope = buildBackup(state);
  const targetPath = `${dir}${name}`;

  try {
    await FileSystem.writeAsStringAsync(targetPath, JSON.stringify(envelope, null, 2));
  } catch (e) {
    await FileSystem.deleteAsync(targetPath, { idempotent: true }).catch(() => {});
    throw e;
  }

  // Rotacja puli: zachowaj wyłącznie AUTO_KEEP najświeższych kopii
  try {
    const files = await FileSystem.readDirectoryAsync(dir);
    const pool = files
      .map((f) => [f, re.exec(f)] as const)
      .filter((x): x is readonly [string, RegExpExecArray] => !!x[1]);

    const oldFiles = pool
      .map(([f, m]) => [f, poolKey(m)] as const)
      .sort((a, b) => (a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0))
      .slice(AUTO_KEEP);

    for (const [f] of oldFiles) {
      await FileSystem.deleteAsync(`${dir}${f}`, { idempotent: true });
    }
  } catch {
    // Nieprzerwana praca przy ewentualnym błędzie sprzątania starych plików
  }

  return targetPath;
}

/**
 * Automatyczna rotacyjna kopia po zapisaniu sesji pakowania lub projektu (Apps4Brew T-012).
 */
export async function autoBackup(state: FitCheckBackupData): Promise<string | null> {
  try {
    return await writeBackupFile('fitcheck-', AUTO_RE, state);
  } catch {
    return null;
  }
}

/**
 * Kopia bezpieczeństwa przed operacjami niszczącymi (import, reset).
 * Bezwzględnie wymagana: nieudany zapis rzuca błąd i blokuje operację niszczącą.
 */
export async function safetyBackup(
  kind: 'import' | 'reset',
  state: FitCheckBackupData
): Promise<string> {
  const prefix = kind === 'import' ? 'fitcheck-przed-importem-' : 'fitcheck-przed-czyszczeniem-';
  return await writeBackupFile(prefix, SAFETY_RE, state);
}

/**
 * Waliduje poprawność schematu pliku kopii zapasowej (Apps4Brew envelope).
 */
export function parseAndValidateBackup(rawJson: string): FitCheckBackupEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('Nieprawidłowy format JSON');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Plik kopii musi być obiektem JSON');
  }

  const envelope = parsed as Partial<FitCheckBackupEnvelope>;

  if (envelope.format !== 'fitcheck-backup') {
    throw new Error('Nieznany format pliku (oczekiwano "fitcheck-backup")');
  }

  if (typeof envelope.schemaVersion !== 'number' || envelope.schemaVersion <= 0) {
    throw new Error('Nieprawidłowa wersja schematu kopii');
  }

  if (envelope.schemaVersion > SCHEMA_VERSION) {
    throw new Error(
      `Kopia pochodzi z nowszej wersji aplikacji (v${envelope.schemaVersion}). Zaktualizuj aplikację.`
    );
  }

  if (!envelope.state || typeof envelope.state !== 'object') {
    throw new Error('Brak danych stanu (sekcja "state") w pliku kopii');
  }

  const state = envelope.state;
  if (state.custom_spaces && !Array.isArray(state.custom_spaces)) {
    throw new Error('Nieprawidłowa struktura custom_spaces');
  }
  if (state.user_cargo_items && !Array.isArray(state.user_cargo_items)) {
    throw new Error('Nieprawidłowa struktura user_cargo_items');
  }
  if (state.pack_sessions && !Array.isArray(state.pack_sessions)) {
    throw new Error('Nieprawidłowa struktura pack_sessions');
  }

  return envelope as FitCheckBackupEnvelope;
}
