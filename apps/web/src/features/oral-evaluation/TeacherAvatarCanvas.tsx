import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AvatarIdentity } from './TeacherSelector';
import { GestureState } from './useAvatarGestures';
import * as THREE from 'three';

interface TeacherAvatarCanvasProps {
  selectedAvatar: AvatarIdentity;
  gestureState: GestureState;
  jawOpen: number;
  headRotation?: [number, number, number];
}

// Representación 3D del Avatar (Head, Neck, Torso con morph targets)
const AvatarModel: React.FC<{
  selectedAvatar: AvatarIdentity;
  gestureState: GestureState;
  jawOpen: number;
  headRotation?: [number, number, number];
}> = ({ selectedAvatar, jawOpen, headRotation = [0, 0, 0] }) => {
  const headRef = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (headRef.current) {
      headRef.current.rotation.x = headRotation[0];
      headRef.current.rotation.y = headRotation[1];
      headRef.current.rotation.z = headRotation[2];
    }
    if (jawRef.current) {
      // Desplazamiento mandibular proporcional a jawOpen
      jawRef.current.position.y = -0.35 - jawOpen * 0.12;
    }
  });

  const isElena = selectedAvatar === 'PROF_ELENA';
  const hairColor = isElena ? '#5c2c16' : '#2b2b2b';
  const shirtColor = isElena ? '#4f46e5' : '#0891b2';

  return (
    <group position={[0, -0.6, 0]}>
      {/* Torso / Hombros (Medio cuerpo) */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.7, 0.9, 1.2, 32]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>

      {/* Cuello */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.35, 24]} />
        <meshStandardMaterial color="#f5d0b5" roughness={0.4} />
      </mesh>

      {/* Cabeza del Avatar */}
      <group ref={headRef} position={[0, 0.35, 0]}>
        {/* Cráneo / Rostro */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial color="#f5d0b5" roughness={0.3} />
        </mesh>

        {/* Cabello */}
        <mesh position={[0, 0.2, -0.05]}>
          <sphereGeometry args={[0.45, 24, 24]} />
          <meshStandardMaterial color={hairColor} roughness={0.8} />
        </mesh>

        {/* Ojos */}
        <mesh position={[-0.14, 0.06, 0.36]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.14, 0.06, 0.36]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Mandíbula Móvil (Lip-sync jawOpen) */}
        <mesh ref={jawRef} position={[0, -0.35, 0.2]}>
          <boxGeometry args={[0.24, 0.09, 0.2]} />
          <meshStandardMaterial color="#e2a882" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};

export const TeacherAvatarCanvas: React.FC<TeacherAvatarCanvasProps> = ({
  selectedAvatar,
  gestureState,
  jawOpen,
  headRotation,
}) => {
  return (
    <div
      data-testid="teacher-avatar-canvas"
      className="relative w-full h-full min-h-[450px] bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center"
    >
      {/* Indicador de estado del avatar en vivo */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs">
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${
            gestureState === 'talking'
              ? 'bg-emerald-400'
              : gestureState === 'listening'
              ? 'bg-amber-400'
              : gestureState === 'feedback'
              ? 'bg-indigo-400'
              : 'bg-slate-400'
          }`}
        />
        <span className="font-semibold text-slate-300 capitalize">{gestureState}</span>
      </div>

      <Canvas
        camera={{ position: [0, 0.2, 2.5], fov: 42 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <directionalLight position={[-2, 1, 1]} intensity={0.5} />
        <AvatarModel
          selectedAvatar={selectedAvatar}
          gestureState={gestureState}
          jawOpen={jawOpen}
          headRotation={headRotation}
        />
      </Canvas>
    </div>
  );
};
