// src/components/three/vfx/NuclearVFX.tsx — Nuclear card VFX (STORY-018)
//
// Expanding radiation ring/wave triggered when a Nuclear card is played.
// A bright green ring expands outward from center and fades.
// Duration: ~1000ms (slightly longer for dramatic effect).
//
// Implementation:
// - <mesh> with <ringGeometry> scaled up each frame
// - Green color (#00ff00) fading to transparent
// - React.memo wrapper

import { memo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface NuclearVFXProps {
  position: [number, number, number];
  onComplete: () => void;
}

/** Duration for the nuclear VFX (slightly longer for drama). */
const NUCLEAR_DURATION_MS = 1000;

/**
 * Nuclear radiation ring VFX — a green ring expands outward and fades.
 *
 * @param position - 3D world-space origin for the ring center
 * @param onComplete - Called after duration to trigger unmount
 */
export const NuclearVFX = memo(function NuclearVFX({
  position,
  onComplete,
}: NuclearVFXProps) {
  const ringRef = useRef<any>(null);
  const innerRingRef = useRef<any>(null);
  const startTimeRef = useRef<number | null>(null);

  // Auto-cleanup after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, NUCLEAR_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Per-frame animation: scale ring outward, fade opacity
  useFrame(() => {
    if (!startTimeRef.current) startTimeRef.current = performance.now();
    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / NUCLEAR_DURATION_MS, 1);

    const scale = 0.5 + progress * 4; // expand from 0.5 to 4.5
    const opacity = 1 - progress;

    if (ringRef.current) {
      ringRef.current.scale.set(scale, scale, scale);
      if (ringRef.current.material) {
        ringRef.current.material.opacity = opacity;
      }
    }
    if (innerRingRef.current) {
      const innerScale = 0.3 + progress * 3;
      innerRingRef.current.scale.set(innerScale, innerScale, innerScale);
      if (innerRingRef.current.material) {
        innerRingRef.current.material.opacity = opacity * 0.7;
      }
    }
  });

  return (
    <group position={position}>
      {/* Outer radiation ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 32]} />
        <meshBasicMaterial color="#00ff00" transparent opacity={1} side={2} />
      </mesh>

      {/* Inner radiation ring (brighter, smaller) */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial color="#88ff00" transparent opacity={0.7} side={2} />
      </mesh>

      {/* Central flash */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#ffff00" transparent opacity={0.5} side={2} />
      </mesh>
    </group>
  );
});
