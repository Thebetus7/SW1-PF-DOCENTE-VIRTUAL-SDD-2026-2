let SQLite: any = null;
try {
  SQLite = require('expo-sqlite');
} catch {
  // Entorno sin expo-sqlite nativo (tests o web)
}

let memoryCache = new Map<string, { value: string; updatedAt: number }>();
let isDbInitialized = false;

/**
 * Inicializa la tabla de SQLite para persistencia offline docente
 */
export async function initSqliteDb(): Promise<void> {
  if (isDbInitialized) return;

  try {
    if (SQLite && typeof SQLite.openDatabaseAsync === 'function') {
      const db = await SQLite.openDatabaseAsync('teacher_analytics.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS analytics_cache (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);
      isDbInitialized = true;
    }
  } catch {
    // Fallback a caché en memoria ultra-rápido si corre en entorno sin driver nativo
    isDbInitialized = true;
  }
}

/**
 * Guarda datos en caché local SQLite (o memoria fallback)
 */
export async function saveToSqliteCache(key: string, data: any): Promise<void> {
  const jsonStr = JSON.stringify(data);
  const now = Date.now();

  try {
    if (SQLite && typeof SQLite.openDatabaseAsync === 'function') {
      const db = await SQLite.openDatabaseAsync('teacher_analytics.db');
      await db.runAsync(
        'INSERT OR REPLACE INTO analytics_cache (key, value, updated_at) VALUES (?, ?, ?);',
        [key, jsonStr, now]
      );
      return;
    }
  } catch {
    // Silently proceed to memory fallback
  }

  memoryCache.set(key, { value: jsonStr, updatedAt: now });
}

/**
 * Recupera datos de caché local SQLite en < 300 ms (RNF-4)
 */
export async function getFromSqliteCache<T>(key: string): Promise<T | null> {
  try {
    if (SQLite && typeof SQLite.openDatabaseAsync === 'function') {
      const db = await SQLite.openDatabaseAsync('teacher_analytics.db');
      const row = await db.getFirstAsync<{ value: string; updated_at: number }>(
        'SELECT value, updated_at FROM analytics_cache WHERE key = ?;',
        [key]
      );
      if (row && row.value) {
        return JSON.parse(row.value) as T;
      }
    }
  } catch {
    // Proceed to memory fallback
  }

  const cached = memoryCache.get(key);
  if (cached) {
    return JSON.parse(cached.value) as T;
  }

  return null;
}

/**
 * Limpia la caché (usado en tests)
 */
export function clearSqliteCacheForTesting(): void {
  memoryCache.clear();
  isDbInitialized = false;
}
