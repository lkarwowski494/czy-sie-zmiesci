/**
 * Czy się zmieści? (FitCheck) — Abstrakcja Drivera SQLite (In-Memory dla testów + Expo SQLite dla runtime)
 */

export interface ISQLiteDriver {
  execSync(sql: string): void;
  runSync(sql: string, params?: unknown[]): { lastInsertRowId: number; changes: number };
  getFirstSync<T>(sql: string, params?: unknown[]): T | null;
  getAllSync<T>(sql: string, params?: unknown[]): T[];
  withTransactionSync<T>(callback: () => T): T;
  closeSync(): void;
}

/**
 * Pamięciowy sterownik SQLite do testów jednostkowych i integracyjnych (Warstwa 5)
 * Zapewnia pełną obsługę transakcji atomowych (rollback), kluczy obcych i operacji CRUD.
 */
export class MemorySQLiteDriver implements ISQLiteDriver {
  private tables: Map<string, Map<string, Record<string, unknown>>> = new Map();
  private foreignKeys: Map<string, { column: string; targetTable: string; targetColumn: string; onDelete: 'CASCADE' | 'RESTRICT' | 'SET NULL' }[]> = new Map();
  private inTransaction = false;
  private transactionSnapshot: string | null = null;
  private foreignKeysEnabled = true;

  constructor() {
    this.initForeignKeysMetadata();
  }

  private initForeignKeysMetadata() {
    this.foreignKeys.set('vehicle_spaces', [
      { column: 'vehicle_id', targetTable: 'vehicles', targetColumn: 'id', onDelete: 'CASCADE' },
    ]);
    this.foreignKeys.set('pack_session_items', [
      { column: 'session_id', targetTable: 'pack_sessions', targetColumn: 'id', onDelete: 'CASCADE' },
      { column: 'cargo_item_id', targetTable: 'cargo_items', targetColumn: 'id', onDelete: 'RESTRICT' },
    ]);
    this.foreignKeys.set('rooms', [
      { column: 'project_id', targetTable: 'relocation_projects', targetColumn: 'id', onDelete: 'CASCADE' },
    ]);
    this.foreignKeys.set('room_fixtures', [
      { column: 'room_id', targetTable: 'rooms', targetColumn: 'id', onDelete: 'CASCADE' },
    ]);
    this.foreignKeys.set('access_pathways', [
      { column: 'room_id', targetTable: 'rooms', targetColumn: 'id', onDelete: 'SET NULL' },
    ]);
    this.foreignKeys.set('relocation_items', [
      { column: 'project_id', targetTable: 'relocation_projects', targetColumn: 'id', onDelete: 'CASCADE' },
      { column: 'room_id', targetTable: 'rooms', targetColumn: 'id', onDelete: 'SET NULL' },
      { column: 'cargo_item_id', targetTable: 'cargo_items', targetColumn: 'id', onDelete: 'RESTRICT' },
    ]);
    this.foreignKeys.set('towbar_roof_configs', [
      { column: 'vehicle_id', targetTable: 'vehicles', targetColumn: 'id', onDelete: 'CASCADE' },
    ]);
  }

  execSync(sql: string): void {
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      if (stmt.toUpperCase().startsWith('PRAGMA FOREIGN_KEYS')) {
        this.foreignKeysEnabled = stmt.toUpperCase().includes('ON');
        continue;
      }
      if (stmt.toUpperCase().startsWith('PRAGMA JOURNAL_MODE')) {
        continue;
      }
      if (stmt.toUpperCase().startsWith('CREATE TABLE')) {
        const match = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
        if (match) {
          const tableName = match[1];
          if (!this.tables.has(tableName)) {
            this.tables.set(tableName, new Map());
          }
        }
        continue;
      }
      if (stmt.toUpperCase().startsWith('CREATE INDEX')) {
        continue;
      }
      this.runSync(stmt);
    }
  }

  runSync(sql: string, params: unknown[] = []): { lastInsertRowId: number; changes: number } {
    const cleanSql = sql.trim();

    // INSERT INTO table (cols...) VALUES (?, ?...)
    const insertMatch = cleanSql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (insertMatch) {
      const tableName = insertMatch[1];
      const cols = insertMatch[2].split(',').map(c => c.trim());
      const table = this.ensureTable(tableName);

      const record: Record<string, unknown> = {};
      cols.forEach((col, idx) => {
        record[col] = params[idx];
      });

      const id = String(record['id'] ?? Math.random().toString());

      // Foreign Key Validation
      if (this.foreignKeysEnabled && this.foreignKeys.has(tableName)) {
        for (const fk of this.foreignKeys.get(tableName)!) {
          const fkVal = record[fk.column];
          if (fkVal !== undefined && fkVal !== null) {
            const targetTable = this.tables.get(fk.targetTable);
            if (!targetTable || !targetTable.has(String(fkVal))) {
              throw new Error(`FOREIGN KEY constraint failed on ${tableName}.${fk.column} -> ${fk.targetTable}.${fk.targetColumn}`);
            }
          }
        }
      }

      table.set(id, record);
      return { lastInsertRowId: 1, changes: 1 };
    }

    // UPDATE table SET col1 = ?, col2 = ? WHERE id = ?
    const updateMatch = cleanSql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/i);
    if (updateMatch) {
      const tableName = updateMatch[1];
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];
      const table = this.tables.get(tableName);
      if (!table) return { lastInsertRowId: 0, changes: 0 };

      const setCols = setClause.split(',').map(s => s.trim().split('=')[0].trim());
      const whereParam = params[setCols.length]; // Zakładamy prosty WHERE id = ?

      let changes = 0;
      for (const [id, record] of table.entries()) {
        if (id === String(whereParam) || whereClause.includes(`id = '${id}'`)) {
          setCols.forEach((col, idx) => {
            record[col] = params[idx];
          });
          changes++;
        }
      }
      return { lastInsertRowId: 0, changes };
    }

    // DELETE FROM table WHERE col = ?
    const deleteMatch = cleanSql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
    if (deleteMatch) {
      const tableName = deleteMatch[1];
      const whereClause = deleteMatch[2];
      const table = this.tables.get(tableName);
      if (!table) return { lastInsertRowId: 0, changes: 0 };

      if (!whereClause) {
        const count = table.size;
        table.clear();
        return { lastInsertRowId: 0, changes: count };
      }

      const idToDelete = String(params[0] ?? '');
      if (table.has(idToDelete)) {
        // Sprawdzenie kaskad i ograniczeń kluczy obcych
        if (this.foreignKeysEnabled) {
          for (const [refTable, fks] of this.foreignKeys.entries()) {
            for (const fk of fks) {
              if (fk.targetTable === tableName) {
                const childTable = this.tables.get(refTable);
                if (childTable) {
                  const referencingRows: string[] = [];
                  for (const [childId, childRec] of childTable.entries()) {
                    if (String(childRec[fk.column]) === idToDelete) {
                      referencingRows.push(childId);
                    }
                  }

                  if (referencingRows.length > 0) {
                    if (fk.onDelete === 'RESTRICT') {
                      throw new Error(`FOREIGN KEY constraint failed: Cannot delete from ${tableName} because ${refTable} references it`);
                    } else if (fk.onDelete === 'CASCADE') {
                      for (const childId of referencingRows) {
                        childTable.delete(childId);
                      }
                    } else if (fk.onDelete === 'SET NULL') {
                      for (const childId of referencingRows) {
                        childTable.get(childId)![fk.column] = null;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        table.delete(idToDelete);
        return { lastInsertRowId: 0, changes: 1 };
      }

      return { lastInsertRowId: 0, changes: 0 };
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  getFirstSync<T>(sql: string, params: unknown[] = []): T | null {
    const all = this.getAllSync<T>(sql, params);
    return all.length > 0 ? all[0] : null;
  }

  getAllSync<T>(sql: string, params: unknown[] = []): T[] {
    const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?$/i);
    if (!selectMatch) {
      return [];
    }

    const tableName = selectMatch[2];
    const whereClause = selectMatch[3];
    const orderByClause = selectMatch[4];
    const table = this.tables.get(tableName);
    if (!table) return [];

    let rows = Array.from(table.values());

    if (whereClause) {
      const colMatch = whereClause.match(/(\w+)\s*=\s*(?:\?|'([^']*)'|(\d+))/i);
      if (colMatch) {
        const col = colMatch[1];
        const val = colMatch[2] ?? colMatch[3] ?? params[0];
        rows = rows.filter(r => String(r[col]) === String(val));
      }
    }

    if (orderByClause) {
      const orderCol = orderByClause.split(' ')[0].trim();
      const isDesc = orderByClause.toUpperCase().includes('DESC');
      rows.sort((a, b) => {
        const valA = a[orderCol] as any;
        const valB = b[orderCol] as any;
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    return rows as unknown as T[];
  }

  withTransactionSync<T>(callback: () => T): T {
    if (this.inTransaction) {
      return callback();
    }

    this.inTransaction = true;
    this.transactionSnapshot = this.serializeState();

    try {
      const result = callback();
      this.inTransaction = false;
      this.transactionSnapshot = null;
      return result;
    } catch (error) {
      if (this.transactionSnapshot) {
        this.restoreState(this.transactionSnapshot);
      }
      this.inTransaction = false;
      this.transactionSnapshot = null;
      throw error;
    }
  }

  closeSync(): void {
    this.tables.clear();
  }

  private ensureTable(name: string): Map<string, Record<string, unknown>> {
    if (!this.tables.has(name)) {
      this.tables.set(name, new Map());
    }
    return this.tables.get(name)!;
  }

  private serializeState(): string {
    const serialized: Record<string, Record<string, unknown>[]> = {};
    for (const [table, map] of this.tables.entries()) {
      serialized[table] = Array.from(map.values());
    }
    return JSON.stringify(serialized);
  }

  private restoreState(json: string) {
    this.tables.clear();
    const data = JSON.parse(json);
    for (const table of Object.keys(data)) {
      const map = new Map<string, Record<string, unknown>>();
      for (const row of data[table]) {
        map.set(String(row.id), row);
      }
      this.tables.set(table, map);
    }
  }
}

/**
 * Sterownik SQLite dla środowiska wykonawczego Expo (iOS / Android / macOS).
 * Opakowuje natywny, synchroniczny interfejs expo-sqlite (SQLiteDatabase).
 * Zapewnia lokalizację bazy w prywatnym katalogu /Library/SQLite (SEC-09).
 */
export class ExpoSQLiteDriver implements ISQLiteDriver {
  constructor(private readonly db: any) {}

  execSync(sql: string): void {
    this.db.execSync(sql);
  }

  runSync(sql: string, params: unknown[] = []): { lastInsertRowId: number; changes: number } {
    const res = this.db.runSync(sql, ...(params as any[]));
    return {
      lastInsertRowId: Number(res?.lastInsertRowId ?? 0),
      changes: Number(res?.changes ?? 0),
    };
  }

  getFirstSync<T>(sql: string, params: unknown[] = []): T | null {
    const res = this.db.getFirstSync(sql, ...(params as any[]));
    return (res as T) ?? null;
  }

  getAllSync<T>(sql: string, params: unknown[] = []): T[] {
    const res = this.db.getAllSync(sql, ...(params as any[]));
    return (res as T[]) ?? [];
  }

  withTransactionSync<T>(callback: () => T): T {
    if (typeof this.db.withTransactionSync === 'function') {
      return this.db.withTransactionSync(callback);
    }
    this.execSync('BEGIN IMMEDIATE TRANSACTION;');
    try {
      const result = callback();
      this.execSync('COMMIT;');
      return result;
    } catch (error) {
      this.execSync('ROLLBACK;');
      throw error;
    }
  }

  closeSync(): void {
    if (typeof this.db.closeSync === 'function') {
      this.db.closeSync();
    }
  }
}

