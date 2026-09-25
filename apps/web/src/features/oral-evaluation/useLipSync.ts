import { useState, useRef, useCallback } from 'react';

export interface LipSyncControls {
  jawOpen: number;
  isSpeaking: boolean;
  speakText: (text: string, isFemale?: boolean, onEnd?: () => void) => void;
  stopSpeaking: () => void;
}

export const useLipSync = (): LipSyncControls => {
  const [jawOpen, setJawOpen] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const animationIntervalRef = useRef<any>(null);

  const stopSpeaking = useCallback(() => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    setJawOpen(0);
    setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speakText = useCallback(
    (text: string, isFemale = true, onEnd?: () => void) => {
      stopSpeaking();
      setIsSpeaking(true);

      // Simular apertura mandibular rítmica basada en sílabas y fonemas (Web Audio API fallback)
      let phase = 0;
      animationIntervalRef.current = setInterval(() => {
        phase += 0.2;
        // Modulación oscilatoria entre 0.1 y 0.8 imitando apertura de boca (jawOpen)
        const openVal = Math.max(0, Math.sin(phase * 4) * 0.4 + Math.sin(phase * 8) * 0.2 + 0.2);
        setJawOpen(openVal);
      }, 50);

      // Síntesis de voz con Web Speech API si está disponible en el navegador
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        utterance.pitch = isFemale ? 1.2 : 0.9;

        utterance.onend = () => {
          stopSpeaking();
          if (onEnd) onEnd();
        };

        utterance.onerror = () => {
          stopSpeaking();
          if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // En tests o navegadores sin síntesis de voz, simular duración estimada
        const estimatedDurationMs = Math.min(Math.max(text.length * 50, 1500), 6000);
        setTimeout(() => {
          stopSpeaking();
          if (onEnd) onEnd();
        }, estimatedDurationMs);
      }
    },
    [stopSpeaking]
  );

  return {
    jawOpen,
    isSpeaking,
    speakText,
    stopSpeaking,
  };
};
