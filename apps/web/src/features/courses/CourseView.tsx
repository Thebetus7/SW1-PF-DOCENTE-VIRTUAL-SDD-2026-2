import React, { useState } from 'react';
import { Course, Lesson } from '../../types/course';
import { LessonPlayer } from './LessonPlayer';

interface CourseViewProps {
  course: Course;
  unlockedLessonIds?: string[];
  completedLessonIds?: string[];
  onSelectLesson?: (lesson: Lesson) => void;
  onCompleteLesson?: (lessonId: string) => void;
  onSkipToOralExam: (courseId: string) => void;
  onBackToCatalog?: () => void;
}

export const CourseView: React.FC<CourseViewProps> = ({
  course,
  completedLessonIds = [],
  onCompleteLesson,
  onSkipToOralExam,
  onBackToCatalog,
}) => {
  // Encontrar la primera lección por defecto
  const allLessons = course.modules?.flatMap((m) => m.lessons) || [];
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    allLessons[0]?.id || ''
  );

  const activeLesson = allLessons.find((l) => l.id === selectedLessonId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header del curso */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBackToCatalog && (
            <button
              onClick={onBackToCatalog}
              data-testid="back-to-catalog-button"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Volver al catálogo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Curso LMS
            </span>
            <h1 className="text-lg font-bold text-white leading-tight">{course.title}</h1>
          </div>
        </div>

        {/* Demo Académica: Saltar al examen oral final */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="skip-to-oral-exam-button"
            onClick={() => onSkipToOralExam(course.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 border border-violet-400/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4 text-violet-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Saltar al examen oral final
          </button>
        </div>
      </header>

      {/* Contenido principal: Grid de 2 columnas (Player 70%, Módulos 30%) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Reproductor */}
        <div className="lg:col-span-8 space-y-6">
          {activeLesson ? (
            <LessonPlayer
              lesson={activeLesson}
              isCompleted={completedLessonIds.includes(activeLesson.id)}
              onComplete={() => onCompleteLesson && onCompleteLesson(activeLesson.id)}
            />
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <p className="text-slate-400">Selecciona una lección para comenzar.</p>
            </div>
          )}
        </div>

        {/* Columna Derecha: Árbol de navegación jerárquica */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Contenido del Curso
            </h3>

            <div className="space-y-4">
              {course.modules?.map((mod) => (
                <div key={mod.id} className="space-y-2">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                    {mod.title}
                  </div>
                  <div className="space-y-1">
                    {mod.lessons.map((lesson) => {
                      const isSelected = lesson.id === selectedLessonId;
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          data-testid={`lesson-item-${lesson.id}`}
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                              : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="truncate pr-2">
                            {lesson.orderIndex}. {lesson.title}
                          </span>
                          {isCompleted && (
                            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
