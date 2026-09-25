import React, { useEffect, useState, useCallback } from 'react';
import { checkBackendHealth, HealthStatus } from '../services/api';
import { Activity, Database, Server, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BackendStatusBadgeProps {
  onStatusChange?: (status: HealthStatus) => void;
}

export const BackendStatusBadge: React.FC<BackendStatusBadgeProps> = ({ onStatusChange }) => {
  const [health, setHealth] = useState<HealthStatus>({
    online: false,
    status: 'offline',
    backend: 'comprobando...',
    database: 'comprobando...',
    timestamp: new Date().toISOString(),
    latencyMs: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchHealth = useCallback(async () => {
    setIsRefreshing(true);
    const result = await checkBackendHealth();
    setHealth(result);
    setIsRefreshing(false);
    if (onStatusChange) {
      onStatusChange(result);
    }
  }, [onStatusChange]);

  useEffect(() => {
    fetchHealth();
    // Consultar cada 8 segundos para mantener informado al usuario en todo momento
    const interval = setInterval(fetchHealth, 8000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const isFullyConnected = health.online && health.database === 'connected';
  const isDegraded = health.online && health.database !== 'connected';

  return (
    <div className="relative inline-block text-left" data-testid="backend-status-badge">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-sm ${
          isFullyConnected
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60'
            : isDegraded
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/60'
            : 'bg-rose-950/50 border-rose-500/40 text-rose-300 hover:bg-rose-950/70'
        }`}
        title="Clic para ver detalles de conexión con el backend y base de datos"
      >
        <span className="relative flex h-2 w-2">
          {isFullyConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isFullyConnected ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          ></span>
        </span>

        <span className="font-semibold tracking-wide">
          {isFullyConnected ? 'Backend Activo' : isDegraded ? 'BD Desconectada' : 'Backend Sin Conexión'}
        </span>

        {isFullyConnected && (
          <span className="text-[10px] opacity-75 font-mono bg-emerald-900/40 px-1.5 py-0.5 rounded">
            {health.latencyMs}ms
          </span>
        )}

        <RefreshCw
          className={`w-3 h-3 ml-0.5 text-slate-400 hover:text-white transition-transform ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            fetchHealth();
          }}
        />
      </button>

      {/* Menú desplegable flotante con detalles técnicos completos */}
      {isExpanded && (
        <div
          className="absolute right-0 mt-2 w-80 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl z-50 text-slate-200 text-xs space-y-3"
          role="dialog"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Monitor del Servidor
            </span>
            <button
              onClick={() => fetchHealth()}
              disabled={isRefreshing}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Verificar Ahora
            </button>
          </div>

          <div className="space-y-2">
            {/* Estado del Backend */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" />
                <span>API REST (NestJS)</span>
              </div>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  health.online ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {health.online ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> ONLINE (3000)
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" /> OFFLINE
                  </>
                )}
              </span>
            </div>

            {/* Estado de la Base de Datos */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-400" />
                <span>Base de Datos (PostgreSQL)</span>
              </div>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  health.database === 'connected' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {health.database === 'connected' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> CONECTADA
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" /> DESCONECTADA
                  </>
                )}
              </span>
            </div>

            {/* Latencia */}
            <div className="flex items-center justify-between px-2 py-1 text-slate-400 text-[11px]">
              <span>Latencia de respuesta:</span>
              <span className="font-mono text-slate-300">{health.latencyMs} ms</span>
            </div>
          </div>

          {/* Mensaje de error si no conecta */}
          {health.error && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-300 leading-tight">
              <strong>Diagnóstico:</strong> {health.error}
            </div>
          )}

          <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800/60">
            Actualización automática cada 8 segundos
          </div>
        </div>
      )}
    </div>
  );
};
