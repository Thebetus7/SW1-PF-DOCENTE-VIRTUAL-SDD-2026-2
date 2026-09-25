import React from 'react';
import { Course } from '../../types/course';

interface CourseCatalogProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onStartDiagnostic?: () => void;
  userCredits?: number;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({
  courses,
  onSelectCourse,
  onStartDiagnostic,
  userCredits,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner de diagnóstico / créditos */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Preevaluación Adaptativa
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                ¿No sabes por dónde comenzar?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Realiza nuestra preevaluación diagnóstica inteligente sin costo. Evaluaremos tu nivel y te posicionaremos exactamente en la lección adecuada, otorgándote 3 créditos iniciales.
              </p>
            </div>
            {onStartDiagnostic && (
              <button
                type="button"
                data-testid="start-diagnostic-banner-btn"
                onClick={onStartDiagnostic}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                Comenzar Diagnóstico
              </button>
            )}
          </div>
        </div>

        {/* Sección de Cursos */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Catálogo de Cursos Disponibles</h2>
              <p className="text-slate-400 text-sm">Explora rutas formativas diseñadas con tutoría 3D e IA.</p>
            </div>
            {typeof userCredits === 'number' && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm">
                <span className="text-slate-400">Tus Créditos:</span>
                <span className="font-bold text-indigo-400">{userCredits}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const totalLessons = course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0;
              return (
                <div
                  key={course.id}
                  data-testid={`course-card-${course.id}`}
                  className="group bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-indigo-400 uppercase tracking-wider">
                        {course.modules?.length || 0} Módulos
                      </span>
                      <span>{totalLessons} Lecciones</span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                      {course.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Evaluación Oral 3D al final</span>
                    <button
                      type="button"
                      data-testid={`select-course-${course.id}`}
                      onClick={() => onSelectCourse(course)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-indigo-600 text-white transition-colors"
                    >
                      Ver Curso
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
