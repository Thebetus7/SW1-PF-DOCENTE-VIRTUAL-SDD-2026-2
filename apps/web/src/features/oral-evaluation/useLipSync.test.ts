import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLipSync } from './useLipSync';

describe('useLipSync hook', () => {
  it('modulates jawOpen value when speaking and resets when stopped', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useLipSync());

    expect(result.current.jawOpen).toBe(0);
    expect(result.current.isSpeaking).toBe(false);

    act(() => {
      result.current.speakText('Hola, bienvenido al examen oral.');
    });

    expect(result.current.isSpeaking).toBe(true);

    // Avanzar reloj para que el oscilador modularice jawOpen
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.jawOpen).toBeGreaterThanOrEqual(0);

    act(() => {
      result.current.stopSpeaking();
    });

    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.jawOpen).toBe(0);

    vi.useRealTimers();
  });
});
