import React, { useState, useEffect } from 'react';
import { TeacherAvatarCanvas } from './TeacherAvatarCanvas';
import { TeacherSelector, AvatarIdentity } from './TeacherSelector';
import { OralExamHUD, ExamState } from './OralExamHUD';
import { useAvatarGestures } from './useAvatarGestures';
import { useLipSync } from './useLipSync';

interface OralExamContainerProps {
  courseId: string;
  courseTitle: string;
  onExit: () => void;
  onFinish?: (finalScore: number, passed: boolean) => void;
}

export const OralExamContainer: React.FC<OralExamContainerProps> = ({
  courseId: _courseId,
  courseTitle,
  onExit,
  onFinish,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarIdentity>('PROF_ELENA');
  const [examState, setExamState] = useState<ExamState>('QUESTION_DELIVERY');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [studentTranscription, setStudentTranscription] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [lastScore, setLastScore] = useState<number | undefined>(undefined);
  const [finalScore, setFinalScore] = useState<number | undefined>(undefined);
  const [isPassed, setIsPassed] = useState<boolean | undefined>(undefined);

  const { gestureState, setGestureState, headRotation } = useAvatarGestures('talking');
  const { jawOpen, speakText, stopSpeaking } = useLipSync();

  const questions = [
    `Explica detalladamente con tus propias palabras los principios y conceptos fundamentales del curso "${courseTitle}".`,
    `¿Cómo resolverías un problema de diseño o escalabilidad aplicando las técnicas aprendidas?`,
    `Describe una situación real donde aplicarías estos conocimientos y qué métricas usarías para evaluar el éxito.`,
  ];

  const currentQuestionText = questions[questionIndex] || '';

  // Formular la pregunta con voz y lip-sync al cambiar de pregunta
  useEffect(() => {
    if (examState === 'QUESTION_DELIVERY') {
      setGestureState('talking');
      const isFemale = selectedAvatar === 'PROF_ELENA';
      speakText(currentQuestionText, isFemale, () => {
        setGestureState('idle');
      });
    }
    return () => {
      stopSpeaking();
    };
  }, [examState, questionIndex, selectedAvatar]);

  const handleStartRecording = () => {
    stopSpeaking();
    setExamState('STUDENT_RECORDING');
    setGestureState('listening');
    setStudentTranscription('');
  };

  const handleSubmitAnswer = () => {
    setExamState('SEMANTIC_ANALYSIS');
    setGestureState('idle');

    // Simular evaluación semántica con GroqCloud (o recibir via socket)
    setTimeout(() => {
      const isGoodAnswer = studentTranscription.length >= 25;
      const score = isGoodAnswer ? 85 : 55;
      const passed = score >= 70;
      const feedback = passed
        ? 'Muy buen razonamiento técnico y respuesta estructurada. Demuestras dominio conceptual.'
        : 'Tu respuesta necesita mayor profundidad y precisión técnica en los conceptos clave.';

      setLastScore(score);
      setFeedbackText(feedback);
      setExamState('FEEDBACK_DELIVERY');
      setGestureState('feedback');

      const isFemale = selectedAvatar === 'PROF_ELENA';
      speakText(feedback, isFemale, () => {
        if (questionIndex < questions.length - 1) {
          setQuestionIndex((prev) => prev + 1);
          setExamState('QUESTION_DELIVERY');
        } else {
          // Finalizar examen completo
          const calculatedFinalScore = 80;
          const examPassed = calculatedFinalScore >= 70;
          setFinalScore(calculatedFinalScore);
          setIsPassed(examPassed);
          setExamState('COMPLETED');
          setGestureState('idle');
          if (onFinish) onFinish(calculatedFinalScore, examPassed);
        }
      });
    }, 1200);
  };

  return (
    <div
      data-testid="oral-exam-container"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col"
    >
      {/* Barra superior */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Evaluación Oral 3D
          </span>
          <h1 className="text-base md:text-lg font-bold text-white">{courseTitle}</h1>
        </div>
        <button
          type="button"
          onClick={onExit}
          data-testid="exit-oral-exam-btn"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          Salir de la Evaluación
        </button>
      </header>

      {/* Layout Split-Screen 60/40 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 60% Columna Izquierda: Canvas 3D */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <TeacherAvatarCanvas
            selectedAvatar={selectedAvatar}
            gestureState={gestureState}
            jawOpen={jawOpen}
            headRotation={headRotation}
          />
        </div>

        {/* 40% Columna Derecha: Selector de Docente y HUD Interactivo */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <TeacherSelector
            selectedAvatar={selectedAvatar}
            onSelectAvatar={(avatar) => {
              setSelectedAvatar(avatar);
            }}
            disabled={examState === 'STUDENT_RECORDING' || examState === 'SEMANTIC_ANALYSIS'}
          />

          <div className="flex-1">
            <OralExamHUD
              examState={examState}
              currentQuestionText={currentQuestionText}
              questionIndex={questionIndex}
              totalQuestions={questions.length}
              studentTranscription={studentTranscription}
              onTranscriptionChange={setStudentTranscription}
              onStartRecording={handleStartRecording}
              onSubmitAnswer={handleSubmitAnswer}
              feedbackText={feedbackText}
              lastScore={lastScore}
              finalScore={finalScore}
              isPassed={isPassed}
              onFinishExam={onExit}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
