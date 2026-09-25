import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DiagnosticQuiz } from './DiagnosticQuiz';
import { DiagnosticQuestion, DiagnosticResult } from '../../types/diagnostic';

describe('DiagnosticQuiz Component', () => {
  const mockQuestions: DiagnosticQuestion[] = [
    {
      id: 'q-1',
      courseId: 'course-1',
      lessonId: 'les-1',
      question: '¿Qué es el aprendizaje supervisado?',
      options: ['Usa datos etiquetados', 'No usa datos', 'Es solo hardware', 'No requiere entrenamiento'],
    },
    {
      id: 'q-2',
      courseId: 'course-1',
      lessonId: 'les-2',
      question: '¿Cuál es la función del descenso de gradiente?',
      options: ['Minimizar la función de pérdida', 'Aumentar el error', 'Cerrar la sesión', 'Formatear el disco'],
    },
  ];

  it('renders without any 3D avatar canvas (strictly adheres to spec)', () => {
    render(
      <DiagnosticQuiz
        questions={mockQuestions}
        onSubmit={vi.fn()}
        onGoToLesson={vi.fn()}
      />
    );

    // Verificación estricta: NO debe existir canvas 3D ni avatares en la preevaluación diagnóstica
    const canvases = document.querySelectorAll('canvas');
    expect(canvases.length).toBe(0);

    const avatarElement = screen.queryByTestId('avatar-3d-canvas');
    expect(avatarElement).toBeNull();
  });

  it('allows answering questions sequentially and renders placement results with 3 credits', async () => {
    const mockResult: DiagnosticResult = {
      attemptId: 'att-123',
      assignedCourseId: 'course-1',
      assignedLessonId: 'les-2',
      assignedLessonTitle: 'Descenso de Gradiente',
      scorePercentage: 50,
      creditsGranted: 3,
      newCreditsBalance: 3,
    };

    const onSubmit = vi.fn().mockResolvedValue(mockResult);
    const onGoToLesson = vi.fn();

    render(
      <DiagnosticQuiz
        questions={mockQuestions}
        onSubmit={onSubmit}
        onGoToLesson={onGoToLesson}
      />
    );

    // Pregunta 1
    expect(screen.getByTestId('current-question-text')).toHaveTextContent('¿Qué es el aprendizaje supervisado?');
    // Seleccionar opción 0
    fireEvent.click(screen.getByTestId('quiz-option-0'));
    // Botón siguiente
    fireEvent.click(screen.getByTestId('quiz-next-button'));

    // Pregunta 2
    expect(screen.getByTestId('current-question-text')).toHaveTextContent('¿Cuál es la función del descenso de gradiente?');
    // Seleccionar opción 0
    fireEvent.click(screen.getByTestId('quiz-option-0'));
    // Finalizar
    fireEvent.click(screen.getByTestId('quiz-next-button'));

    // Esperar a que se despliegue el resultado
    await waitFor(() => {
      expect(screen.getByTestId('diagnostic-result-view')).toBeInTheDocument();
    });

    expect(screen.getByTestId('assigned-lesson-name')).toHaveTextContent('Descenso de Gradiente');
    expect(screen.getByText('+3 Créditos')).toBeInTheDocument();

    // Click en ir a lección asignada
    fireEvent.click(screen.getByTestId('go-to-assigned-lesson-btn'));
    expect(onGoToLesson).toHaveBeenCalledWith('course-1', 'les-2');
  });
});
