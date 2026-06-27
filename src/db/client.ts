/**
 * Breathe — SQLite client + migration runner (expo-sqlite, async API).
 *
 * Opens a single shared connection, enables WAL + foreign keys, and applies any pending
 * migrations tracked by PRAGMA user_version. Offline-first: this runs entirely on-device
 * with no network.
 */
import * as SQLite from 'expo-sqlite';

import { MIGRATIONS } from './schema';

const DB_NAME = 'breathe.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Open (once) and migrate the database. Idempotent — safe to call from multiple screens. */
export function openDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await runMigrations(db);
      return db;
    })();
  }
  return dbPromise;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  let current = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue;
    await db.withTransactionAsync(async () => {
      for (const statement of migration.statements) {
        await db.execAsync(statement);
      }
    });
    // PRAGMA user_version cannot be parameterized; version is an integer from our own code.
    await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    current = migration.version;
  }
}

/** Drop the cached connection handle (e.g. for tests). Does not delete the file. */
export function resetDbHandle(): void {
  dbPromise = null;
}
