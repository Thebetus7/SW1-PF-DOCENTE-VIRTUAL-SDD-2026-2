import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OralExamHUD } from './OralExamHUD';

describe('OralExamHUD Component', () => {
  it('renders question delivery state with teacher question', () => {
    render(
      <OralExamHUD
        examState="QUESTION_DELIVERY"
        currentQuestionText="¿Qué es una red neuronal convolucional?"
        questionIndex={0}
        totalQuestions={3}
        studentTranscription=""
        onTranscriptionChange={vi.fn()}
        onStartRecording={vi.fn()}
        onSubmitAnswer={vi.fn()}
      />
    );

    expect(screen.getByTestId('oral-exam-hud')).toBeInTheDocument();
    expect(screen.getByTestId('current-question-card')).toHaveTextContent(
      '¿Qué es una red neuronal convolucional?'
    );
    expect(screen.getByText('Pregunta 1 de 3')).toBeInTheDocument();
  });

  it('renders audio waveform when student is recording', () => {
    render(
      <OralExamHUD
        examState="STUDENT_RECORDING"
        currentQuestionText="Pregunta de prueba"
        questionIndex={1}
        totalQuestions={3}
        studentTranscription="Mi respuesta oral..."
        onTranscriptionChange={vi.fn()}
        onStartRecording={vi.fn()}
        onSubmitAnswer={vi.fn()}
      />
    );

    expect(screen.getByTestId('audio-waveform')).toBeInTheDocument();
    expect(screen.getByTestId('student-transcription-input')).toHaveValue('Mi respuesta oral...');
  });

  it('renders completion screen with final score and passed status', () => {
    const onFinish = vi.fn();
    render(
      <OralExamHUD
        examState="COMPLETED"
        currentQuestionText=""
        questionIndex={2}
        totalQuestions={3}
        studentTranscription=""
        onTranscriptionChange={vi.fn()}
        onStartRecording={vi.fn()}
        onSubmitAnswer={vi.fn()}
        finalScore={88}
        isPassed={true}
        onFinishExam={onFinish}
      />
    );

    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('Aprobado (>= 70%)')).toBeInTheDocument();

    const finishBtn = screen.getByTestId('finish-exam-button');
    fireEvent.click(finishBtn);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
