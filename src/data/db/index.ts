/**
 * Czy się zmieści? (FitCheck) — Moduł Bazy Danych SQLite
 */

import { DatabaseService } from './database';
import { MemorySQLiteDriver } from './driver';

let defaultInstance: DatabaseService | null = null;

export function getDatabaseService(): DatabaseService {
  if (!defaultInstance) {
    const driver = new MemorySQLiteDriver();
    defaultInstance = new DatabaseService(driver);
    defaultInstance.initialize();
  }
  return defaultInstance;
}

export { DatabaseService, BackupExportPayload, BackupImportResult } from './database';
export * from './schema';
export * from './driver';
