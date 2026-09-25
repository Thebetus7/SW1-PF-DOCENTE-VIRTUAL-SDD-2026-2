import { useState, useEffect } from 'react';

export type GestureState = 'idle' | 'talking' | 'listening' | 'feedback';

export interface AvatarTransformState {
  gestureState: GestureState;
  setGestureState: (state: GestureState) => void;
  headRotation: [number, number, number];
  blinkWeight: number;
  breathingOffset: number;
}

export const useAvatarGestures = (initialState: GestureState = 'idle'): AvatarTransformState => {
  const [gestureState, setGestureState] = useState<GestureState>(initialState);
  const [blinkWeight, setBlinkWeight] = useState(0);
  const [breathingOffset, setBreathingOffset] = useState(0);
  const [headRotation, setHeadRotation] = useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    let time = 0;
    const interval = setInterval(() => {
      time += 0.05;

      // 1. Respiración cíclica (idle, listening, feedback)
      const breath = Math.sin(time * 2) * 0.03;
      setBreathingOffset(breath);

      // 2. Parpadeo aleatorio/periódico cada ~3 segundos
      const shouldBlink = Math.sin(time * 1.5) > 0.95;
      setBlinkWeight(shouldBlink ? 1 : 0);

      // 3. Orientación y rotación de cabeza según estado de gesticulación
      switch (gestureState) {
        case 'talking':
          // Micro movimientos dinámicos de cabeza al hablar
          setHeadRotation([
            Math.sin(time * 4) * 0.04,
            Math.cos(time * 3) * 0.03,
            0,
          ]);
          break;
        case 'listening':
          // Cabeza ligeramente ladeada hacia adelante en escucha atenta
          setHeadRotation([0.08, 0.05, 0.02]);
          break;
        case 'feedback':
          // Asentimiento afirmativo/reflexivo
          setHeadRotation([Math.abs(Math.sin(time * 5)) * 0.1, 0, 0]);
          break;
        case 'idle':
        default:
          setHeadRotation([0, 0, 0]);
          break;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gestureState]);

  return {
    gestureState,
    setGestureState,
    headRotation,
    blinkWeight,
    breathingOffset,
  };
};
