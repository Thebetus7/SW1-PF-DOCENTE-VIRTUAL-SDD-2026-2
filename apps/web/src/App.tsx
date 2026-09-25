import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Layers,
  LogIn,
  LogOut,
  User as UserIcon,
  Coins,
  BrainCircuit,
  MessageSquare,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';
import { AuthModal } from './features/auth/AuthModal';
import { BackendStatusBadge } from './components/BackendStatusBadge';
import { User } from './types/auth';
import { getStoredUser, clearStoredAuth, HealthStatus } from './services/api';

export const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [serverHealth, setServerHealth] = useState<HealthStatus | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setFeedbackNotice('Sesión cerrada correctamente.');
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleAuthSuccess = (data: { email: string; user?: User; isLogin: boolean }) => {
    if (data.user) {
      setCurrentUser(data.user);
      setFeedbackNotice(
        data.isLogin
          ? `¡Bienvenido de nuevo, ${data.user.fullName}!`
          : `¡Cuenta creada exitosamente para ${data.user.fullName}!`
      );
    } else {
      // Fallback
      setFeedbackNotice(`Autenticado exitosamente como ${data.email}`);
    }
    setTimeout(() => setFeedbackNotice(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
      {/* Banner de Notificación */}
      {feedbackNotice && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-center text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all">
          <Sparkles className="w-4 h-4" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Encabezado Principal */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
              Docente Virtual 3D
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-mono">
              LMS Adaptativo
            </span>
          </div>
        </div>

        {/* Sección de Estado y Autenticación */}
        <div className="flex items-center gap-3">
          {/* CUADRO VISUAL DE RECONOCIMIENTO DEL BACKEND EN TIEMPO REAL */}
          <BackendStatusBadge onStatusChange={setServerHealth} />

          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser.fullName}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {currentUser.role === 'STUDENT' ? 'Estudiante' : currentUser.role === 'TEACHER' ? 'Profesor' : 'Admin'}
                  </p>
                </div>
              </div>

              {currentUser.role === 'STUDENT' && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{currentUser.creditsBalance ?? 0}</span>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
            >
              <LogIn className="w-4 h-4" />
              Acceder / Crear Cuenta
            </button>
          )}
        </div>
      </header>

      {/* Alerta si el backend está desconectado */}
      {serverHealth && !serverHealth.online && (
        <div className="bg-rose-950/70 border-b border-rose-800/80 px-4 py-2 text-rose-300 text-xs text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Sin conexión con el backend:</strong> El servidor en <code className="bg-rose-900/50 px-1 py-0.5 rounded">http://localhost:3000</code> no responde. Verifica que el proceso de NestJS esté activo.
          </span>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-4xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Plataforma LMS Adaptativa con Evaluación Oral 3D
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
          Aprende a tu propio ritmo con{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Tutoría Virtual Inteligente
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
          Diagnóstico de entrada dinámico, posicionamiento adaptativo por lección y evaluación de dominio conceptual en tiempo real con avatares 3D gesticulares sincronizados.
        </p>

        {currentUser ? (
          <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-2xl mb-8">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-indigo-400">Panel del Estudiante</p>
                <h2 className="text-xl font-bold text-white">Hola, {currentUser.fullName}</h2>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Balance de Créditos</span>
                <p className="text-2xl font-black text-amber-400 flex items-center gap-1 justify-end">
                  <Coins className="w-5 h-5" />
                  {currentUser.creditsBalance ?? 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Preevaluación Diagnóstica</h3>
                    <p className="text-xs text-slate-400">Determina tu punto de partida exacto</p>
                  </div>
                </div>
                <button
                  onClick={() => alert('Para realizar el diagnóstico dinámico, se cargarán 5 a 15 preguntas generadas por GroqCloud.')}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Iniciar Diagnóstico
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-500/20 flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Docente Virtual 3D</h3>
                    <p className="text-xs text-slate-400">Examen oral final con lip-sync</p>
                  </div>
                </div>
                <button
                  onClick={() => alert('El examen oral 3D se activa al término de cada curso conectándose al Gateway WebSockets en el puerto 3000.')}
                  className="w-full py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Conocer al Docente 3D
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              Crear Cuenta o Iniciar Sesión
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-indigo-400 mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">3 Créditos Iniciales</h3>
              <p className="text-xs text-slate-400 mt-0.5">Desbloquea lecciones adaptadas a tu nivel tras la preevaluación.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <Layers className="w-5 h-5 text-violet-400 mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">Exámenes Orales 3D</h3>
              <p className="text-xs text-slate-400 mt-0.5">Evaluación sincrónica con síntesis de voz y gesticulación facial.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 max-w-4xl mx-auto w-full">
        <span>SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2 &copy; {new Date().getFullYear()}</span>
        <span className="text-[11px] text-slate-400">Backend API: http://localhost:3000/api/v1</span>
      </footer>

      {/* Modal de Autenticación con llamadas reales al backend */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
