import React, { useState } from 'react';
import { DiagnosticQuestion, StudentAnswer, DiagnosticResult } from '../../types/diagnostic';

interface DiagnosticQuizProps {
  questions: DiagnosticQuestion[];
  onSubmit: (answers: StudentAnswer[]) => Promise<DiagnosticResult>;
  onGoToLesson: (courseId: string, lessonId: string) => void;
  onCancel?: () => void;
}

export const DiagnosticQuiz: React.FC<DiagnosticQuizProps> = ({
  questions,
  onSubmit,
  onGoToLesson,
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <p className="text-slate-400">No hay preguntas de diagnóstico disponibles en este momento.</p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
            >
              Volver
            </button>
          )}
        </div>
      </div>
    );
  }

  // Si ya tenemos el resultado del posicionamiento
  if (result) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6" data-testid="diagnostic-result-view">
        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Diagnóstico Completado
            </span>
            <h2 className="text-2xl font-bold text-white">¡Punto de Partida Determinado!</h2>
            <p className="text-slate-300 text-sm">
              Analizamos tus respuestas para personalizar tu ruta de aprendizaje de forma adaptativa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <span className="text-xs text-slate-400">Puntaje Obtenido</span>
              <p className="text-2xl font-black text-white mt-1">{result.scorePercentage}%</p>
            </div>
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
              <span className="text-xs text-slate-400">Créditos de Bienvenida</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">+{result.creditsGranted} Créditos</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-left space-y-1">
            <span className="text-xs font-semibold text-indigo-300 uppercase">Lección Recomendada para Iniciar:</span>
            <p className="text-white font-bold text-base" data-testid="assigned-lesson-name">
              {result.assignedLessonTitle}
            </p>
          </div>

          <button
            type="button"
            data-testid="go-to-assigned-lesson-btn"
            onClick={() => onGoToLesson(result.assignedCourseId, result.assignedLessonId)}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Comenzar Aprendizaje
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercentage = Math.round(((currentIndex + 1) / questions.length) * 100);
  const selectedOption = selectedAnswers[currentQuestion.id];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isOptionSelected = typeof selectedOption === 'number';

  const handleSelectOption = (index: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: index,
    }));
  };

  const handleNext = async () => {
    if (!isOptionSelected) return;

    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Enviar cuestionario completo
      setIsSubmitting(true);
      setError(null);
      try {
        const payload: StudentAnswer[] = questions.map((q) => ({
          questionId: q.id,
          lessonId: q.lessonId,
          selectedOptionIndex: selectedAnswers[q.id] ?? 0,
        }));
        const response = await onSubmit(payload);
        setResult(response);
      } catch (err: any) {
        setError(err.message || 'Error al procesar el diagnóstico');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 max-w-4xl mx-auto" data-testid="diagnostic-quiz-container">
      {/* Header con progreso */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="uppercase tracking-wider text-indigo-400">Preevaluación Diagnóstica Inicial</span>
          <span>
            Pregunta {currentIndex + 1} de {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Tarjeta de Pregunta */}
      <div className="my-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <h3 className="text-xl md:text-2xl font-bold text-white leading-snug" data-testid="current-question-text">
          {currentQuestion.question}
        </h3>

        {/* Opciones de respuesta */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                type="button"
                data-testid={`quiz-option-${idx}`}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-2xl border text-sm md:text-base font-medium transition-all flex items-center gap-4 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="text-rose-400 text-xs text-center">{error}</p>}
      </div>

      {/* Footer / Navegación */}
      <div className="flex items-center justify-between pb-6">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0 || isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Anterior
        </button>

        <button
          type="button"
          data-testid="quiz-next-button"
          onClick={handleNext}
          disabled={!isOptionSelected || isSubmitting}
          className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          {isSubmitting ? (
            'Evaluando respuestas...'
          ) : isLastQuestion ? (
            'Finalizar y Posicionar'
          ) : (
            <>
              Siguiente
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
