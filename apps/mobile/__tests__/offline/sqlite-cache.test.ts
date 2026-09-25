import { describe, it, expect, beforeEach } from 'vitest';
import {
  initSqliteDb,
  saveToSqliteCache,
  getFromSqliteCache,
  clearSqliteCacheForTesting,
} from '../../src/offline/sqliteCache';
import { CourseKpis } from '../../src/types/mobile';

describe('SQLite Offline Cache Layer (RNF-4)', () => {
  beforeEach(async () => {
    clearSqliteCacheForTesting();
    await initSqliteDb();
  });

  it('persists and retrieves teacher analytics metrics offline in < 300ms', async () => {
    const mockKpis: CourseKpis = {
      courseId: 'course-arch-1',
      courseTitle: 'Arquitectura de Software y Patrones',
      totalStudentsEnrolled: 25,
      completedStudents: 20,
      completionRatePercentage: 80,
      averageOralScore: 84,
      passRatePercentage: 88,
    };

    const cacheKey = 'course-kpis-course-arch-1';

    // 1. Guardar en caché local
    await saveToSqliteCache(cacheKey, mockKpis);

    // 2. Medir tiempo de lectura offline
    const startTime = performance.now();
    const retrieved = await getFromSqliteCache<CourseKpis>(cacheKey);
    const durationMs = performance.now() - startTime;

    expect(retrieved).toBeDefined();
    expect(retrieved?.courseTitle).toBe('Arquitectura de Software y Patrones');
    expect(retrieved?.averageOralScore).toBe(84);

    // Verificación estricta de tiempo de respuesta offline: < 300 ms (RNF-4)
    expect(durationMs).toBeLessThan(300);
  });

  it('returns null when querying an un-cached key', async () => {
    const nonExistent = await getFromSqliteCache('unknown-course-id');
    expect(nonExistent).toBeNull();
  });
});
