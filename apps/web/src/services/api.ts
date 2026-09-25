import { AuthResponse, User, UserRole } from '../types/auth';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface HealthStatus {
  online: boolean;
  status: 'ok' | 'degraded' | 'offline';
  backend: string;
  database: string;
  timestamp: string;
  latencyMs: number;
  error?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

/**
 * Consulta en tiempo real el estado del backend y la base de datos PostgreSQL
 */
export async function checkBackendHealth(): Promise<HealthStatus> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);

    if (!response.ok) {
      return {
        online: true,
        status: 'degraded',
        backend: 'error',
        database: 'error',
        timestamp: new Date().toISOString(),
        latencyMs,
        error: `El servidor respondió con código HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      online: true,
      status: data.database === 'connected' ? 'ok' : 'degraded',
      backend: data.backend || 'online',
      database: data.database || 'unknown',
      timestamp: data.timestamp || new Date().toISOString(),
      latencyMs,
      error: data.error,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    const isTimeout = err.name === 'AbortError';
    return {
      online: false,
      status: 'offline',
      backend: 'offline',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      latencyMs,
      error: isTimeout
        ? 'Tiempo de espera agotado al conectar con el backend (puerto 3000)'
        : 'No se pudo conectar con el backend (http://localhost:3000). Comprueba que el servidor esté activo.',
    };
  }
}

/**
 * Inicia sesión contra el backend
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
      }
      throw new Error(data.message || `Error del servidor (${response.status})`);
    }

    setStoredAuth(data);
    return data;
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('No hay conexión con el servidor (Backend en http://localhost:3000 caído).');
    }
    throw err;
  }
}

/**
 * Registra un nuevo usuario en la base de datos
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        fullName: payload.fullName.trim(),
        role: payload.role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
      }
      if (response.status === 400) {
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(msg || 'Datos de registro inválidos.');
      }
      throw new Error(data.message || `Error al crear la cuenta (${response.status})`);
    }

    setStoredAuth(data);
    return data;
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('No hay conexión con el servidor o la base de datos PostgreSQL.');
    }
    throw err;
  }
}

/**
 * Gestión de almacenamiento local para la sesión
 */
export function setStoredAuth(auth: AuthResponse): void {
  try {
    localStorage.setItem('auth_tokens', JSON.stringify({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    }));
    localStorage.setItem('auth_user', JSON.stringify(auth.user));
  } catch {}
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearStoredAuth(): void {
  try {
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
  } catch {}
}
