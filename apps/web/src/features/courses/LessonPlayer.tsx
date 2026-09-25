import React from 'react';
import { Lesson } from '../../types/course';

interface LessonPlayerProps {
  lesson: Lesson;
  onComplete: () => void;
  isCompleted?: boolean;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  onComplete,
  isCompleted = false,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
            Lección {lesson.orderIndex}
          </span>
          <h2 className="text-xl font-bold text-white mt-1">{lesson.title}</h2>
        </div>
        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Completada
          </span>
        )}
      </div>

      {/* YouTube Video Player IFrame */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner">
        <iframe
          data-testid="lesson-player-iframe"
          title={lesson.title}
          src={`https://www.youtube.com/embed/${lesson.videoResourceId}?enablejsapi=1&rel=0`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Pedagogical context / notes */}
      {lesson.pedagogicalContext && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm leading-relaxed">
          <p className="font-semibold text-slate-200 mb-1">Contexto Pedagógico:</p>
          <p>{lesson.pedagogicalContext}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          data-testid="complete-lesson-button"
          onClick={onComplete}
          disabled={isCompleted}
          className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
            isCompleted
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
          }`}
        >
          {isCompleted ? (
            'Lección completada'
          ) : (
            <>
              Marcar como completada
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
