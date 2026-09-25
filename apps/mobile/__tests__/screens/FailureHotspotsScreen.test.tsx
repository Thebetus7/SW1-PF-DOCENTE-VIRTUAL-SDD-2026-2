import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FailureHotspotsScreen } from '../../src/screens/FailureHotspotsScreen';
import { TeacherFeedbackReport } from '../../src/types/mobile';

describe('FailureHotspotsScreen Component (AI Pedagogical Hotspots)', () => {
  const mockReport: TeacherFeedbackReport = {
    courseId: 'course-ml-1',
    courseTitle: 'Fundamentos de Machine Learning',
    totalAttemptsAnalyzed: 15,
    hotspots: [
      {
        concept: 'Función de Pérdida vs Métrica de Evaluación',
        failureFrequency: 6,
        affectedStudentsCount: 5,
        sampleQuestion: '¿Por qué no usamos directamente accuracy como función de pérdida en clasificación binaria?',
        aiPedagogicalRecommendation: 'Dedicar 15 minutos en la próxima clase a graficar la no-diferenciabilidad de step function.',
      },
    ],
    overallPedagogicalAdvice: 'Los estudiantes tienen dificultades con la optimización por gradiente.',
  };

  it('renders pedagogical advice card and failure hotspot cards with AI recommendation', () => {
    render(
      <FailureHotspotsScreen
        report={mockReport}
        onBack={vi.fn()}
      />
    );

    expect(screen.getByTestId('failure-hotspots-screen')).toBeInTheDocument();
    expect(screen.getByText('Fundamentos de Machine Learning')).toBeInTheDocument();
    expect(screen.getByText(/Los estudiantes tienen dificultades con la optimización por gradiente/i)).toBeInTheDocument();

    // Hotspot específico
    expect(screen.getByText('Función de Pérdida vs Métrica de Evaluación')).toBeInTheDocument();
    expect(screen.getByText('6 fallas')).toBeInTheDocument();
    expect(screen.getByText(/Dedicar 15 minutos en la próxima clase/i)).toBeInTheDocument();
  });

  it('triggers onBack callback when clicking back button', () => {
    const onBack = vi.fn();
    render(
      <FailureHotspotsScreen
        report={mockReport}
        onBack={onBack}
      />
    );

    const backBtn = screen.getByTestId('back-from-hotspots-btn');
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
