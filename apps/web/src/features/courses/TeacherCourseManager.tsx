import React, { useState, useEffect } from 'react';
import {
  BookPlus,
  Layers,
  Video,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { createCourse, createModule, createLesson, fetchCourses, fetchCourseById } from '../../services/api';
import { Course } from '../../types/course';

interface TeacherCourseManagerProps {
  onCourseCreated?: () => void;
  onSelectCourseView?: (courseId: string) => void;
}

export const TeacherCourseManager: React.FC<TeacherCourseManagerProps> = ({
  onSelectCourseView,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Modales
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '' });

  // Módulos y Lecciones
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<string | null>(null);
  const [detailedCourse, setDetailedCourse] = useState<Course | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [activeModuleModalCourseId, setActiveModuleModalCourseId] = useState<string | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: '', orderIndex: 1 });
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);

  const [activeLessonModalModuleId, setActiveLessonModalModuleId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    videoResourceId: 'dQw4w9WgXcQ',
    pedagogicalContext: '',
    orderIndex: 1,
  });
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  const loadCourses = async () => {
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch (err: any) {
      setErrorNotice(err.message || 'Error al cargar cursos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenCourseDetails = async (courseId: string) => {
    if (selectedCourseForDetails === courseId) {
      setSelectedCourseForDetails(null);
      setDetailedCourse(null);
      return;
    }
    setSelectedCourseForDetails(courseId);
    setIsLoadingDetails(true);
    try {
      const details = await fetchCourseById(courseId);
      setDetailedCourse(details);
    } catch (err: any) {
      setErrorNotice(err.message || 'Error al obtener detalles del curso');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;

    setIsSubmittingCourse(true);
    setErrorNotice(null);
    try {
      const newCourse = await createCourse(courseForm);
      setSuccessNotice(`¡Curso "${newCourse.title}" creado exitosamente!`);
      setCourseForm({ title: '', description: '' });
      setIsCourseModalOpen(false);
      await loadCourses();
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Error al crear curso');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleModalCourseId || !moduleForm.title.trim()) return;

    setIsSubmittingModule(true);
    setErrorNotice(null);
    try {
      await createModule(activeModuleModalCourseId, moduleForm);
      setSuccessNotice(`Módulo "${moduleForm.title}" añadido con éxito.`);
      setModuleForm({ title: '', orderIndex: 1 });
      setActiveModuleModalCourseId(null);
      // Recargar detalles
      const updated = await fetchCourseById(activeModuleModalCourseId);
      setDetailedCourse(updated);
      await loadCourses();
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Error al crear módulo');
    } finally {
      setIsSubmittingModule(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLessonModalModuleId || !lessonForm.title.trim()) return;

    setIsSubmittingLesson(true);
    setErrorNotice(null);
    try {
      await createLesson(activeLessonModalModuleId, lessonForm);
      setSuccessNotice(`Lección "${lessonForm.title}" agregada al módulo.`);
      setLessonForm({ title: '', videoResourceId: 'dQw4w9WgXcQ', pedagogicalContext: '', orderIndex: 1 });
      setActiveLessonModalModuleId(null);
      if (selectedCourseForDetails) {
        const updated = await fetchCourseById(selectedCourseForDetails);
        setDetailedCourse(updated);
      }
      await loadCourses();
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Error al crear lección');
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-left">
      {/* Notificaciones de Éxito / Error */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}
      {errorNotice && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Cabecera del Panel Docente */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Gestión Académica Docente
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Panel de Creación de Cursos</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Diseña tus cursos, organiza módulos temáticos y agrega lecciones audiovisuales con contexto para la IA.
          </p>
        </div>

        <button
          type="button"
          data-testid="create-new-course-btn"
          onClick={() => setIsCourseModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <BookPlus className="w-4 h-4" />
          + Crear Nuevo Curso
        </button>
      </div>

      {/* Listado de Cursos */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Cursos Registrados ({courses.length})
        </h3>

        {isLoading ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800/60 rounded-3xl">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Cargando cursos disponibles...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800/60 rounded-3xl space-y-3">
            <p className="text-slate-400 text-sm">Aún no has creado ningún curso en la plataforma.</p>
            <button
              onClick={() => setIsCourseModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Comenzar creando el primer curso
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courses.map((course) => {
              const isExpanded = selectedCourseForDetails === course.id;
              return (
                <div
                  key={course.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                          Publicado
                        </span>
                        <h4 className="text-lg font-bold text-white">{course.title}</h4>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2">{course.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenCourseDetails(course.id)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span>{isExpanded ? 'Ocultar Estructura' : 'Gestionar Contenido'}</span>
                      </button>

                      {onSelectCourseView && (
                        <button
                          onClick={() => onSelectCourseView(course.id)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                          title="Vista de estudiante"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver en Aula</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detalle desplegable de Módulos y Lecciones */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-800/80 space-y-4">
                      {isLoadingDetails ? (
                        <div className="p-6 text-center">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">Cargando módulos y lecciones...</p>
                        </div>
                      ) : detailedCourse ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                              <Layers className="w-4 h-4" />
                              Módulos del Curso ({detailedCourse.modules?.length || 0})
                            </span>
                            <button
                              onClick={() => {
                                setActiveModuleModalCourseId(course.id);
                                setModuleForm({ title: '', orderIndex: (detailedCourse.modules?.length || 0) + 1 });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Añadir Módulo
                            </button>
                          </div>

                          {detailedCourse.modules?.length === 0 ? (
                            <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl">
                              No hay módulos creados aún. Haz clic en "Añadir Módulo".
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {detailedCourse.modules?.map((mod) => (
                                <div
                                  key={mod.id}
                                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-sm font-bold text-slate-200">
                                      Módulo {mod.orderIndex}: {mod.title}
                                    </h5>
                                    <button
                                      onClick={() => {
                                        setActiveLessonModalModuleId(mod.id);
                                        setLessonForm({
                                          title: '',
                                          videoResourceId: 'dQw4w9WgXcQ',
                                          pedagogicalContext: '',
                                          orderIndex: (mod.lessons?.length || 0) + 1,
                                        });
                                      }}
                                      className="px-2.5 py-1 rounded-md bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                                    >
                                      <Plus className="w-3 h-3" />
                                      Añadir Lección
                                    </button>
                                  </div>

                                  {/* Lista de lecciones del módulo */}
                                  <div className="space-y-1.5 pl-2 border-l-2 border-indigo-500/30">
                                    {mod.lessons?.length === 0 ? (
                                      <p className="text-[11px] text-slate-500 italic">Sin lecciones todavía.</p>
                                    ) : (
                                      mod.lessons?.map((les) => (
                                        <div
                                          key={les.id}
                                          className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-slate-900/60 text-xs"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Video className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                            <span className="font-medium text-slate-300">{les.title}</span>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                              [YouTube: {les.videoResourceId}]
                                            </span>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Crear Nuevo Curso */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Nuevo Curso</span>
              <h3 className="text-xl font-bold text-white mt-1">Registrar Curso en el Catálogo</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingresa los datos formativos. Se publicará automáticamente para tus alumnos.
              </p>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título del Curso *</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Ej: Fundamentos de Inteligencia Artificial"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción Conceptual *</label>
                <textarea
                  required
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Explica las competencias y temas que abarcará este curso formativo..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCourse}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {isSubmittingCourse ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookPlus className="w-4 h-4" />}
                  Guardar y Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Añadir Módulo */}
      {activeModuleModalCourseId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">Estructura Modular</span>
              <h3 className="text-xl font-bold text-white mt-1">Añadir Módulo Temático</h3>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título del Módulo *</label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="Ej: Módulo 1: Introducción a Redes Neuronales"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Índice de Orden</label>
                <input
                  type="number"
                  min={1}
                  value={moduleForm.orderIndex}
                  onChange={(e) => setModuleForm({ ...moduleForm, orderIndex: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModuleModalCourseId(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModule}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2"
                >
                  {isSubmittingModule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Crear Módulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Añadir Lección */}
      {activeLessonModalModuleId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-violet-400">Contenido Pedagógico</span>
              <h3 className="text-xl font-bold text-white mt-1">Añadir Lección Audiovisual</h3>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Lección *</label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Ej: Perceptrón Simple y Funciones de Activación"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ID o Recurso de YouTube *</label>
                <input
                  type="text"
                  required
                  value={lessonForm.videoResourceId}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoResourceId: e.target.value })}
                  placeholder="Ej: dQw4w9WgXcQ (ID del video en YouTube)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contexto Pedagógico para la IA</label>
                <textarea
                  rows={2}
                  value={lessonForm.pedagogicalContext}
                  onChange={(e) => setLessonForm({ ...lessonForm, pedagogicalContext: e.target.value })}
                  placeholder="Describe los conceptos clave para que GroqCloud y el Docente 3D formulen preguntas..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveLessonModalModuleId(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLesson}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2"
                >
                  {isSubmittingLesson ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Crear Lección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
