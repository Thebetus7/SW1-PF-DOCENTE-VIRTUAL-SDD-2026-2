import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAvatarGestures } from './useAvatarGestures';

describe('useAvatarGestures hook', () => {
  it('initializes with default idle state and allows state mutations', () => {
    const { result } = renderHook(() => useAvatarGestures('idle'));

    expect(result.current.gestureState).toBe('idle');

    act(() => {
      result.current.setGestureState('talking');
    });

    expect(result.current.gestureState).toBe('talking');

    act(() => {
      result.current.setGestureState('listening');
    });

    expect(result.current.gestureState).toBe('listening');

    act(() => {
      result.current.setGestureState('feedback');
    });

    expect(result.current.gestureState).toBe('feedback');
  });
});
