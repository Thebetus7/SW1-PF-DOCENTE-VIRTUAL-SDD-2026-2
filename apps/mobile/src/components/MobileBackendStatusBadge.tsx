import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface MobileHealthStatus {
  online: boolean;
  status: 'ok' | 'degraded' | 'offline';
  backend: string;
  database: string;
  latencyMs: number;
  error?: string;
}

export const MobileBackendStatusBadge: React.FC = () => {
  const [health, setHealth] = useState<MobileHealthStatus>({
    online: false,
    status: 'offline',
    backend: 'comprobando...',
    database: 'comprobando...',
    latencyMs: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkHealth = async () => {
    setIsRefreshing(true);
    const start = Date.now();

    // Intentar localhost y fallback a 10.0.2.2 para Android Emulator
    const endpoints = [
      'http://localhost:3000/api/v1/health',
      'http://127.0.0.1:3000/api/v1/health',
      'http://10.0.2.2:3000/api/v1/health',
    ];

    let success = false;
    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          setHealth({
            online: true,
            status: data.database === 'connected' ? 'ok' : 'degraded',
            backend: data.backend || 'online',
            database: data.database || 'unknown',
            latencyMs: Date.now() - start,
            error: data.error,
          });
          success = true;
          break;
        }
      } catch {}
    }

    if (!success) {
      setHealth({
        online: false,
        status: 'offline',
        backend: 'offline',
        database: 'disconnected',
        latencyMs: Date.now() - start,
        error: 'No se pudo conectar al backend (http://localhost:3000).',
      });
    }

    setIsRefreshing(false);
  };

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 8000);
    return () => clearInterval(timer);
  }, []);

  const isConnected = health.online && health.database === 'connected';

  return (
    <View style={styles.card} testID="mobile-backend-status-card">
      <View style={styles.row}>
        <View style={styles.statusIndicatorContainer}>
          <View
            style={[
              styles.dot,
              { backgroundColor: isConnected ? '#10b981' : health.online ? '#f59e0b' : '#ef4444' },
            ]}
          />
          <Text style={styles.statusTitle}>
            {isConnected
              ? 'Backend & BD Conectados'
              : health.online
              ? 'BD Desconectada'
              : 'Backend Sin Conexión'}
          </Text>
        </View>

        <TouchableOpacity onPress={checkHealth} disabled={isRefreshing} style={styles.refreshButton}>
          <Text style={styles.refreshText}>{isRefreshing ? '...' : '↻ Verificar'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>
          API: <Text style={{ color: health.online ? '#34d399' : '#f87171' }}>{health.online ? 'ONLINE (3000)' : 'OFFLINE'}</Text>
        </Text>
        <Text style={styles.detailText}>
          BD: <Text style={{ color: health.database === 'connected' ? '#34d399' : '#f87171' }}>{health.database === 'connected' ? 'POSTGRESQL OK' : 'NO CONECTADA'}</Text>
        </Text>
        {health.online && (
          <Text style={styles.latencyText}>{health.latencyMs}ms</Text>
        )}
      </View>

      {!health.online && (
        <Text style={styles.errorMessage}>
          Asegúrate de que el servidor NestJS esté iniciado con `pnpm --filter @repo/backend dev`
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  refreshButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  refreshText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  detailText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
  },
  latencyText: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  errorMessage: {
    color: '#f87171',
    fontSize: 10,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
