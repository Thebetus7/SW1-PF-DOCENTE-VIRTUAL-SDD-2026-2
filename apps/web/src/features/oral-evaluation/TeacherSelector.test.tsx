import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TeacherSelector } from './TeacherSelector';

describe('TeacherSelector Component', () => {
  it('renders Elena and David teacher options', () => {
    render(
      <TeacherSelector
        selectedAvatar="PROF_ELENA"
        onSelectAvatar={vi.fn()}
      />
    );

    expect(screen.getByText('Prof. Elena')).toBeInTheDocument();
    expect(screen.getByText('Prof. David')).toBeInTheDocument();
  });

  it('triggers onSelectAvatar when clicking Prof. David button', () => {
    const onSelect = vi.fn();
    render(
      <TeacherSelector
        selectedAvatar="PROF_ELENA"
        onSelectAvatar={onSelect}
      />
    );

    const davidBtn = screen.getByTestId('select-teacher-david');
    fireEvent.click(davidBtn);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('PROF_DAVID');
  });
});
