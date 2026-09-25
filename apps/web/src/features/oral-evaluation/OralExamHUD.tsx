import React from 'react';

export type ExamState =
  | 'INITIAL'
  | 'QUESTION_DELIVERY'
  | 'STUDENT_RECORDING'
  | 'SEMANTIC_ANALYSIS'
  | 'FEEDBACK_DELIVERY'
  | 'COMPLETED';

interface OralExamHUDProps {
  examState: ExamState;
  currentQuestionText: string;
  questionIndex: number;
  totalQuestions: number;
  studentTranscription: string;
  onTranscriptionChange: (text: string) => void;
  onStartRecording: () => void;
  onSubmitAnswer: () => void;
  feedbackText?: string;
  lastScore?: number;
  finalScore?: number;
  isPassed?: boolean;
  onFinishExam?: () => void;
}

export const OralExamHUD: React.FC<OralExamHUDProps> = ({
  examState,
  currentQuestionText,
  questionIndex,
  totalQuestions,
  studentTranscription,
  onTranscriptionChange,
  onStartRecording,
  onSubmitAnswer,
  feedbackText,
  lastScore,
  finalScore,
  isPassed,
  onFinishExam,
}) => {
  const isRecording = examState === 'STUDENT_RECORDING';
  const isAnalyzing = examState === 'SEMANTIC_ANALYSIS';
  const isDeliveringQuestion = examState === 'QUESTION_DELIVERY';
  const isCompleted = examState === 'COMPLETED';

  return (
    <div
      data-testid="oral-exam-hud"
      className="h-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6"
    >
      {/* 1. Encabezado de Progreso */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="uppercase tracking-wider text-indigo-400">Examen Oral 3D</span>
          <span>
            {isCompleted ? 'Examen Concluido' : `Pregunta ${questionIndex + 1} de ${totalQuestions}`}
          </span>
        </div>

        {/* Estado FSM Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              examState === 'QUESTION_DELIVERY'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : examState === 'STUDENT_RECORDING'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                : examState === 'SEMANTIC_ANALYSIS'
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : examState === 'FEEDBACK_DELIVERY'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
            }`}
          >
            FSM: {examState}
          </span>
        </div>
      </div>

      {/* 2. Tarjeta de Pregunta Actual */}
      {!isCompleted ? (
        <div
          data-testid="current-question-card"
          className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2"
        >
          <span className="text-xs font-semibold text-indigo-300 uppercase">
            Pregunta del Docente Virtual:
          </span>
          <p className="text-white font-medium text-sm md:text-base leading-relaxed">
            {currentQuestionText || 'Esperando inicio del examen...'}
          </p>
        </div>
      ) : (
        /* Vista de Resultados Finales */
        <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Resultado del Examen Oral
          </span>
          <div className="text-4xl font-black text-white">
            {finalScore} <span className="text-base text-slate-400">/ 100</span>
          </div>
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border ${
              isPassed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {isPassed ? 'Aprobado (>= 70%)' : 'No Aprobado (< 70%)'}
          </span>
          <p className="text-slate-300 text-xs">
            Snapshot inmutable persistido exitosamente en el expediente del estudiante.
          </p>
        </div>
      )}

      {/* 3. Onda de Audio Animada durante la respuesta */}
      {isRecording && (
        <div
          data-testid="audio-waveform"
          className="flex items-center justify-center gap-1.5 h-12 bg-slate-950/60 rounded-xl border border-slate-800"
        >
          <span className="text-xs text-amber-400 font-semibold mr-2">Grabando Voz:</span>
          {[40, 75, 55, 90, 60, 85, 45, 95, 50].map((h, i) => (
            <span
              key={i}
              className="w-1 bg-amber-400 rounded-full animate-bounce"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>
      )}

      {/* 4. Transcripción en vivo del estudiante */}
      {!isCompleted && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Transcripción de tu Respuesta (Web Speech API)
          </label>
          <textarea
            data-testid="student-transcription-input"
            rows={4}
            value={studentTranscription}
            onChange={(e) => onTranscriptionChange(e.target.value)}
            placeholder={
              isRecording
                ? 'Habla por el micrófono. Tu voz se transcribe en tiempo real...'
                : 'Presiona "Comenzar a Responder" para hablar o escribe tu respuesta aquí.'
            }
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
          />
        </div>
      )}

      {/* 5. Feedback inmediato recibido */}
      {feedbackText && !isCompleted && (
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Retroalimentación Docente:</span>
            {typeof lastScore === 'number' && (
              <span className="text-xs font-bold text-indigo-400">{lastScore} / 100</span>
            )}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">"{feedbackText}"</p>
        </div>
      )}

      {/* 6. Botones de Acción */}
      <div className="pt-2">
        {isCompleted ? (
          <button
            type="button"
            data-testid="finish-exam-button"
            onClick={onFinishExam}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition"
          >
            Regresar al Menú Principal
          </button>
        ) : isRecording ? (
          <button
            type="button"
            data-testid="submit-turn-button"
            onClick={onSubmitAnswer}
            disabled={!studentTranscription.trim()}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 transition disabled:opacity-40"
          >
            Finalizar Respuesta y Enviar
          </button>
        ) : (
          <button
            type="button"
            data-testid="start-turn-recording-button"
            onClick={onStartRecording}
            disabled={isDeliveringQuestion || isAnalyzing}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-600/30 transition disabled:opacity-40"
          >
            {isDeliveringQuestion
              ? 'Docente formulando pregunta...'
              : isAnalyzing
              ? 'Evaluando semánticamente...'
              : 'Comenzar a Responder'}
          </button>
        )}
      </div>
    </div>
  );
};
