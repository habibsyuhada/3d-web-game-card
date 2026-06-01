// src/components/three/vfx/BombVFX.tsx — Bomb card VFX (STORY-018)
//
// Particle burst / explosion effect triggered when a Bomb card is played.
// ~60 small particles expand outward from the center with fire-palette colors.
// Duration: VFX_DURATION_MS (800ms), then calls onComplete to unmount.
//
// Implementation:
// - Particles as small <mesh> with <sphereGeometry> expanding outward
// - useFrame updates positions + opacity each frame
// - useEffect setTimeout calls onComplete after duration
// - React.memo wrapper for render optimization
// - Geometry disposed on unmount to prevent memory leaks

import { memo, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { VFX_DURATION_MS } from '../../../types';

interface BombVFXProps {
  position: [number, number, number];
  onComplete: () => void;
}

/** Number of particles in the explosion. */
const PARTICLE_COUNT = 60;

/** Fire palette colors. */
const COLORS = ['#ff8c00', '#ff0000', '#ffff00', '#ff4500', '#ffa500'];

/**
 * Generates random velocity vectors for each particle (unit sphere distribution).
 */
function generateVelocities(count: number): Float32Array {
  const velocities = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const speed = 1.5 + Math.random() * 2.5;
    velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
    velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
    velocities[i * 3 + 2] = Math.cos(phi) * speed;
  }
  return velocities;
}

/**
 * Bomb explosion VFX — particles expand outward from the play position.
 *
 * @param position - 3D world-space origin for the explosion
 * @param onComplete - Called after VFX_DURATION_MS to trigger unmount
 */
export const BombVFX = memo(function BombVFX({
  position,
  onComplete,
}: BombVFXProps) {
  const groupRef = useRef<any>(null);
  const meshRefs = useRef<(any | null)[]>([]);
  const startTimeRef = useRef<number | null>(null);

  /** Pre-computed velocity vectors for each particle. */
  const velocities = useMemo(() => generateVelocities(PARTICLE_COUNT), []);

  /** Pre-assigned color per particle. */
  const particleColors = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, () => COLORS[Math.floor(Math.random() * COLORS.length)]),
    [],
  );

  // Auto-cleanup after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, VFX_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Per-frame animation
  useFrame((_) => {
    if (!startTimeRef.current) startTimeRef.current = performance.now();
    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / VFX_DURATION_MS, 1);
    const opacity = 1 - progress;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      // Move particle outward based on velocity and elapsed time
      const t = progress * 2; // scale factor for distance
      mesh.position.x = velocities[i * 3] * t;
      mesh.position.y = velocities[i * 3 + 1] * t;
      mesh.position.z = velocities[i * 3 + 2] * t;

      // Fade opacity
      if (mesh.material) {
        mesh.material.opacity = opacity;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={[0, 0, 0]}
        >
          <sphereGeometry args={[0.04, 4, 4]} />
          <meshBasicMaterial
            color={particleColors[i]}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  );
});
