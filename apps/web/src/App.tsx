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
  PlusCircle,
  Loader2,
  Home,
} from 'lucide-react';
import { AuthModal } from './features/auth/AuthModal';
import { BackendStatusBadge } from './components/BackendStatusBadge';
import { User } from './types/auth';
import { Course } from './types/course';
import { DiagnosticQuestion, StudentAnswer, DiagnosticResult } from './types/diagnostic';
import {
  getStoredUser,
  clearStoredAuth,
  HealthStatus,
  fetchCourses,
  fetchCourseById,
  fetchDiagnosticQuiz,
  submitDiagnostic,
} from './services/api';
import { TeacherCourseManager } from './features/courses/TeacherCourseManager';
import { CourseCatalog } from './features/courses/CourseCatalog';
import { CourseView } from './features/courses/CourseView';
import { DiagnosticQuiz } from './features/diagnostics/DiagnosticQuiz';
import { OralExamContainer } from './features/oral-evaluation/OralExamContainer';

type ActiveView = 'home' | 'courses' | 'course-view' | 'diagnostic' | 'oral-exam';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [serverHealth, setServerHealth] = useState<HealthStatus | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Estados de Cursos
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);

  // Estados de Diagnóstico
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<DiagnosticQuestion[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Estados de Examen Oral
  const [oralExamCourse, setOralExamCourse] = useState<{ id: string; title: string }>({
    id: 'demo-course',
    title: 'Fundamentos de Inteligencia Artificial y Machine Learning',
  });

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setCurrentUser(user);
    }
    loadCoursesList();
  }, []);

  const loadCoursesList = async () => {
    try {
      const data = await fetchCourses();
      setCoursesList(data);
    } catch {
      // Ignorar silencio en inicio
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setActiveView('home');
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
      setFeedbackNotice(`Autenticado exitosamente como ${data.email}`);
    }
    setTimeout(() => setFeedbackNotice(null), 5000);
  };

  const handleSelectCourse = async (course: Course) => {
    setIsLoadingCourse(true);
    try {
      const full = await fetchCourseById(course.id);
      setSelectedCourse(full);
      setActiveView('course-view');
    } catch {
      setSelectedCourse(course);
      setActiveView('course-view');
    } finally {
      setIsLoadingCourse(false);
    }
  };

  // 1. Iniciar Preevaluación Diagnóstica real
  const handleStartDiagnostic = async () => {
    if (!currentUser) {
      setFeedbackNotice('Debes iniciar sesión o registrarte para realizar el diagnóstico.');
      setIsAuthOpen(true);
      return;
    }
    setIsLoadingQuiz(true);
    setQuizError(null);
    try {
      const questions = await fetchDiagnosticQuiz();
      setDiagnosticQuestions(questions);
      setActiveView('diagnostic');
    } catch (err: any) {
      setQuizError(err.message || 'Error al generar preguntas de diagnóstico');
      setFeedbackNotice('No se pudo inicializar el cuestionario. Verifica el backend.');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Envío del cuestionario diagnóstico
  const handleSubmitDiagnostic = async (answers: StudentAnswer[]): Promise<DiagnosticResult> => {
    const result = await submitDiagnostic(answers);
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        creditsBalance: result.newCreditsBalance,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
    return result;
  };

  // 2. Conocer al Docente Virtual 3D
  const handleStartOralExam = (courseId?: string, courseTitle?: string) => {
    setOralExamCourse({
      id: courseId || 'oral-exam-demo',
      title: courseTitle || (coursesList[0]?.title || 'Fundamentos de Inteligencia Artificial y Machine Learning'),
    });
    setActiveView('oral-exam');
  };

  const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
      {/* Banner de Notificación */}
      {feedbackNotice && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-center text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all">
          <Sparkles className="w-4 h-4" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Encabezado Principal / Layout Menu */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 text-left focus:outline-none group"
          >
            <div className="p-2 bg-indigo-600/20 text-indigo-400 group-hover:text-indigo-300 rounded-xl border border-indigo-500/30 transition">
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
          </button>

          {/* MENÚ DE NAVEGACIÓN EN EL LAYOUT */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-medium">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeView === 'home'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Inicio
            </button>

            {/* Módulo CURSO en el Layout Menu */}
            <button
              data-testid="nav-menu-courses-btn"
              onClick={() => setActiveView('courses')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeView === 'courses'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cursos</span>
              {isTeacherOrAdmin && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  + Crear
                </span>
              )}
            </button>

            {/* Accesos rápidos exclusivos para Estudiantes */}
            {!isTeacherOrAdmin && (
              <>
                <button
                  onClick={handleStartDiagnostic}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    activeView === 'diagnostic'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                  Diagnóstico
                </button>

                <button
                  onClick={() => handleStartOralExam()}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                    activeView === 'oral-exam'
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                  Docente 3D
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Sección de Estado y Autenticación */}
        <div className="flex items-center gap-3">
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

      {/* Alerta de conexión */}
      {serverHealth && !serverHealth.online && (
        <div className="bg-rose-950/70 border-b border-rose-800/80 px-4 py-2 text-rose-300 text-xs text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Sin conexión con el backend:</strong> El servidor en <code className="bg-rose-900/50 px-1 py-0.5 rounded">http://localhost:3000</code> no responde. Verifica que el proceso de NestJS esté activo.
          </span>
        </div>
      )}

      {/* Vistas Dinámicas */}
      <div className="flex-1 flex flex-col">
        {/* VISTA 1: MÓDULO CURSO (TEACHER -> TeacherCourseManager / STUDENT -> CourseCatalog) */}
        {activeView === 'courses' && (
          <div className="p-6 flex-1">
            {isTeacherOrAdmin ? (
              <TeacherCourseManager
                onCourseCreated={loadCoursesList}
                onSelectCourseView={(courseId) => {
                  fetchCourseById(courseId).then((c) => {
                    setSelectedCourse(c);
                    setActiveView('course-view');
                  });
                }}
              />
            ) : (
              <CourseCatalog
                courses={coursesList}
                userCredits={currentUser?.creditsBalance}
                onSelectCourse={handleSelectCourse}
                onStartDiagnostic={handleStartDiagnostic}
              />
            )}
          </div>
        )}

        {/* VISTA 2: CURSO COMPLETO Y LECCIONES */}
        {activeView === 'course-view' && (
          isLoadingCourse ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-xs text-slate-400">Cargando contenido y lecciones del curso...</p>
            </div>
          ) : selectedCourse ? (
            <CourseView
              course={selectedCourse}
              onBackToCatalog={() => setActiveView('courses')}
              onSkipToOralExam={(courseId) => handleStartOralExam(courseId, selectedCourse.title)}
            />
          ) : null
        )}

        {/* VISTA 3: PREEVALUACIÓN DIAGNÓSTICA REAL */}
        {activeView === 'diagnostic' && (
          <div className="flex-1">
            {isLoadingQuiz ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Generando Evaluación Diagnóstica con IA...</h3>
                <p className="text-slate-400 text-xs max-w-sm text-center">
                  GroqCloud (LLaMA 3) está analizando las lecciones del catálogo para construir tu cuestionario dinámico adaptativo.
                </p>
              </div>
            ) : quizError ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8 text-center max-w-md mx-auto">
                <AlertCircle className="w-10 h-10 text-rose-400" />
                <h3 className="text-lg font-bold text-white">No se pudo cargar el diagnóstico</h3>
                <p className="text-slate-400 text-xs">{quizError}</p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveView('home')}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Volver al Inicio
                  </button>
                  <button
                    onClick={handleStartDiagnostic}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : (
              <DiagnosticQuiz
                questions={diagnosticQuestions}
                onSubmit={handleSubmitDiagnostic}
                onGoToLesson={(courseId) => {
                  fetchCourseById(courseId).then((c) => {
                    setSelectedCourse(c);
                    setActiveView('course-view');
                  });
                }}
                onCancel={() => setActiveView('home')}
              />
            )}
          </div>
        )}

        {/* VISTA 4: DOCENTE VIRTUAL 3D (EXAMEN ORAL INTERACTIVO) */}
        {activeView === 'oral-exam' && (
          <OralExamContainer
            courseId={oralExamCourse.id}
            courseTitle={oralExamCourse.title}
            onExit={() => setActiveView('home')}
            onFinish={(_score, _passed) => {
              setFeedbackNotice('¡Examen oral 3D culminado con éxito! Registro persistido.');
              setTimeout(() => setFeedbackNotice(null), 5000);
            }}
          />
        )}

        {/* VISTA 5: INICIO / DASHBOARD */}
        {activeView === 'home' && (
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
                    <p className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                      {isTeacherOrAdmin ? 'Panel del Profesor' : 'Panel del Estudiante'}
                    </p>
                    <h2 className="text-xl font-bold text-white">Hola, {currentUser.fullName}</h2>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                  </div>
                  {!isTeacherOrAdmin && (
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Balance de Créditos</span>
                      <p className="text-2xl font-black text-amber-400 flex items-center gap-1 justify-end">
                        <Coins className="w-5 h-5" />
                        {currentUser.creditsBalance ?? 0}
                      </p>
                    </div>
                  )}
                </div>

                {/* Si es Profesor: Botón directo para crear cursos */}
                {isTeacherOrAdmin ? (
                  <div className="p-6 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400">
                        <PlusCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Módulo de Gestión de Cursos</h3>
                        <p className="text-xs text-slate-400">
                          Diseña cursos, añade módulos secuenciales e integra recursos audiovisuales.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid="teacher-open-course-manager-btn"
                      onClick={() => setActiveView('courses')}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                    >
                      <Layers className="w-4 h-4" />
                      Abrir Gestor de Cursos y Crear Nuevo Curso
                    </button>
                  </div>
                ) : (
                  /* Si es Estudiante: Preevaluación y Docente 3D funcionales */
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
                        type="button"
                        data-testid="start-diagnostic-btn"
                        onClick={handleStartDiagnostic}
                        disabled={isLoadingQuiz}
                        className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                      >
                        {isLoadingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
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
                        type="button"
                        data-testid="meet-3d-teacher-btn"
                        onClick={() => handleStartOralExam()}
                        className="w-full py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-violet-600/20"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Conocer al Docente 3D
                      </button>
                    </div>
                  </div>
                )}
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
        )}
      </div>

      <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 max-w-5xl mx-auto w-full">
        <span>SW1-PF-DOCENTE-VIRTUAL-SDD-2026-2 &copy; {new Date().getFullYear()}</span>
        <span className="text-[11px] text-slate-400">Backend API: http://localhost:3000/api/v1</span>
      </footer>

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
