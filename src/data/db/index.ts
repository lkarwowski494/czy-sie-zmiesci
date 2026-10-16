/**
 * Czy się zmieści? (FitCheck) — Moduł Bazy Danych SQLite
 * Wykorzystuje bezpieczny katalog /Library/SQLite oraz ExpoSQLiteDriver w środowisku natywnym (SEC-09)
 * z zachowaniem MemorySQLiteDriver dla testów jednostkowych w środowisku Node.js.
 */

import { DatabaseService } from './database';
import { MemorySQLiteDriver, ExpoSQLiteDriver } from './driver';
import { dbDirectory } from '../../lib/db-path';

let defaultInstance: DatabaseService | null = null;

export const DB_NAME = 'fitcheck.db';

export function getDatabaseService(): DatabaseService {
  if (!defaultInstance) {
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    
    if (!isTest) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const SQLite = require('expo-sqlite');
        if (SQLite && typeof SQLite.openDatabaseSync === 'function') {
          const safeDir = dbDirectory(SQLite.defaultDatabaseDirectory);
          const nativeDb = safeDir
            ? SQLite.openDatabaseSync(DB_NAME, undefined, safeDir)
            : SQLite.openDatabaseSync(DB_NAME);
          const driver = new ExpoSQLiteDriver(nativeDb);
          defaultInstance = new DatabaseService(driver);
        }
      } catch {
        // Fallback if expo-sqlite is not available
        defaultInstance = new DatabaseService(new MemorySQLiteDriver());
      }
    }

    if (!defaultInstance) {
      const driver = new MemorySQLiteDriver();
      defaultInstance = new DatabaseService(driver);
    }
    defaultInstance.initialize();
  }
  return defaultInstance;
}

export function resetDefaultDatabaseInstance(): void {
  if (defaultInstance) {
    defaultInstance.close();
    defaultInstance = null;
  }
}

export function getAppSetting(key: string, defaultValue: string = ''): string {
  return getDatabaseService().getAppSetting(key, defaultValue);
}

export function setAppSetting(key: string, value: string): void {
  getDatabaseService().setAppSetting(key, value);
}

export async function triggerAutoBackup(): Promise<void> {
  try {
    const { autoBackup } = require('../../lib/backup');
    const db = getDatabaseService();
    const backup = db.exportBackupJson();
    await autoBackup(backup.data);
  } catch {
    // Graceful fallback in environments without file system
  }
}

export { DatabaseService, BackupExportPayload, BackupImportResult } from './database';
export * from './schema';
export * from './driver';
