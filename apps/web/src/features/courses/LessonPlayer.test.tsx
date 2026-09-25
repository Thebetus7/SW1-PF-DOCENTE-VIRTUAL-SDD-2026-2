import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LessonPlayer } from './LessonPlayer';
import { Lesson } from '../../types/course';

describe('LessonPlayer Component', () => {
  const mockLesson: Lesson = {
    id: 'lesson-1',
    moduleId: 'mod-1',
    title: 'Introducción a Machine Learning',
    videoResourceId: 'JMUxmLyrhSk',
    pedagogicalContext: 'Conceptos fundamentales de IA y algoritmos.',
    orderIndex: 1,
  };

  it('renders youtube iframe with correct videoResourceId', () => {
    render(<LessonPlayer lesson={mockLesson} onComplete={vi.fn()} />);

    const iframe = screen.getByTestId('lesson-player-iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/JMUxmLyrhSk?enablejsapi=1&rel=0');
  });

  it('triggers onComplete callback when complete button is clicked', () => {
    const onComplete = vi.fn();
    render(<LessonPlayer lesson={mockLesson} onComplete={onComplete} isCompleted={false} />);

    const completeBtn = screen.getByTestId('complete-lesson-button');
    expect(completeBtn).toBeInTheDocument();
    expect(completeBtn).not.toBeDisabled();

    fireEvent.click(completeBtn);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('disables completion button when isCompleted is true', () => {
    render(<LessonPlayer lesson={mockLesson} onComplete={vi.fn()} isCompleted={true} />);

    const completeBtn = screen.getByTestId('complete-lesson-button');
    expect(completeBtn).toBeDisabled();
    expect(screen.getByText('Lección completada')).toBeInTheDocument();
  });
});
