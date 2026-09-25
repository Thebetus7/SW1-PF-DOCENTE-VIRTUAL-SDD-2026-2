import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CourseView } from './CourseView';
import { Course } from '../../types/course';

describe('CourseView Component', () => {
  const mockCourse: Course = {
    id: 'course-123',
    title: 'Fundamentos de Inteligencia Artificial',
    description: 'Curso completo de IA y Machine Learning.',
    teacherId: 'teacher-1',
    published: true,
    modules: [
      {
        id: 'mod-1',
        courseId: 'course-123',
        title: 'Módulo 1: Introducción',
        orderIndex: 1,
        lessons: [
          {
            id: 'lesson-1',
            moduleId: 'mod-1',
            title: 'Qué es la IA',
            videoResourceId: 'JMUxmLyrhSk',
            orderIndex: 1,
          },
          {
            id: 'lesson-2',
            moduleId: 'mod-1',
            title: 'Tipos de Aprendizaje',
            videoResourceId: 'aircAruvnKk',
            orderIndex: 2,
          },
        ],
      },
    ],
  };

  it('renders course title and lesson navigation tree', () => {
    render(
      <CourseView
        course={mockCourse}
        onSkipToOralExam={vi.fn()}
      />
    );

    expect(screen.getByText('Fundamentos de Inteligencia Artificial')).toBeInTheDocument();
    expect(screen.getByText('Módulo 1: Introducción')).toBeInTheDocument();
    expect(screen.getByText('1. Qué es la IA')).toBeInTheDocument();
    expect(screen.getByText('2. Tipos de Aprendizaje')).toBeInTheDocument();
  });

  it('directly redirects to final oral exam when "Saltar al examen oral final" is clicked without requiring prior lessons', () => {
    const onSkipToOralExam = vi.fn();
    render(
      <CourseView
        course={mockCourse}
        completedLessonIds={[]} // Ninguna lección completada
        onSkipToOralExam={onSkipToOralExam}
      />
    );

    const skipButton = screen.getByTestId('skip-to-oral-exam-button');
    expect(skipButton).toBeInTheDocument();
    expect(skipButton).toHaveTextContent('Saltar al examen oral final');

    // Click en el botón de salto directo (HU-07, RF-08, ESC-9)
    fireEvent.click(skipButton);

    expect(onSkipToOralExam).toHaveBeenCalledTimes(1);
    expect(onSkipToOralExam).toHaveBeenCalledWith('course-123');
  });
});
