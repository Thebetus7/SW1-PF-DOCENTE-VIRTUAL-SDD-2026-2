import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherCourseManager } from './TeacherCourseManager';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  fetchCourses: vi.fn(),
  fetchCourseById: vi.fn(),
  createCourse: vi.fn(),
  createModule: vi.fn(),
  createLesson: vi.fn(),
}));

describe('TeacherCourseManager Component', () => {
  const mockCourses = [
    {
      id: 'course-1',
      title: 'Fundamentos de IA y Machine Learning',
      description: 'Aprende los principios matemáticos y algorítmicos.',
      teacherId: 'teacher-123',
      published: true,
      modules: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchCourses).mockResolvedValue(mockCourses);
  });

  it('renders teacher course dashboard and list of courses', async () => {
    render(<TeacherCourseManager />);

    expect(screen.getByText('Panel de Creación de Cursos')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Fundamentos de IA y Machine Learning')).toBeInTheDocument();
    });
  });

  it('opens create course modal and submits new course', async () => {
    vi.mocked(api.createCourse).mockResolvedValue({
      id: 'course-2',
      title: 'Arquitectura de Software Limpia',
      description: 'Patrones modernos DDD y Hexagonal.',
      teacherId: 'teacher-123',
      published: true,
    });

    render(<TeacherCourseManager />);

    const openModalBtn = screen.getByTestId('create-new-course-btn');
    fireEvent.click(openModalBtn);

    expect(screen.getByText('Registrar Curso en el Catálogo')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/Ej: Fundamentos de Inteligencia Artificial/i);
    const descInput = screen.getByPlaceholderText(/Explica las competencias/i);

    fireEvent.change(titleInput, { target: { value: 'Arquitectura de Software Limpia' } });
    fireEvent.change(descInput, { target: { value: 'Patrones modernos DDD y Hexagonal.' } });

    const submitBtn = screen.getByText('Guardar y Publicar');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createCourse).toHaveBeenCalledWith({
        title: 'Arquitectura de Software Limpia',
        description: 'Patrones modernos DDD y Hexagonal.',
      });
    });
  });
});
