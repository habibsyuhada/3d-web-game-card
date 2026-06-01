// src/components/three/vfx/SkipVFX.tsx — Skip card VFX (STORY-018)
//
// Dash trail / speed lines indicating the skipped player.
// Colors: white (#ffffff) to light blue (#87ceeb).
// Duration: ~400ms (quick dash).
//
// Implementation:
// - Multiple thin box meshes arranged as speed lines
// - Lines extend outward and fade quickly
// - React.memo wrapper

import { memo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface SkipVFXProps {
  position: [number, number, number];
  onComplete: () => void;
}

/** Duration for the skip VFX (quick dash). */
const SKIP_DURATION_MS = 400;

/** Number of speed lines. */
const LINE_COUNT = 8;

/**
 * Skip dash trail VFX — white/blue speed lines radiating quickly.
 *
 * @param position - 3D world-space center for the effect
 * @param onComplete - Called after duration to trigger unmount
 */
export const SkipVFX = memo(function SkipVFX({
  position,
  onComplete,
}: SkipVFXProps) {
  const groupRef = useRef<any>(null);
  const lineRefs = useRef<(any | null)[]>([]);
  const startTimeRef = useRef<number | null>(null);

  // Auto-cleanup after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, SKIP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Per-frame animation: extend lines outward and fade
  useFrame(() => {
    if (!startTimeRef.current) startTimeRef.current = performance.now();
    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / SKIP_DURATION_MS, 1);

    for (let i = 0; i < LINE_COUNT; i++) {
      const line = lineRefs.current[i];
      if (!line) continue;

      // Extend outward
      const angle = (i / LINE_COUNT) * Math.PI * 2;
      const dist = progress * 1.5;
      line.position.x = Math.cos(angle) * dist;
      line.position.z = Math.sin(angle) * dist;

      // Rotate to point outward
      line.rotation.y = -angle;

      // Fade
      if (line.material) {
        line.material.opacity = 1 - progress;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: LINE_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { lineRefs.current[i] = el; }}
          position={[0, 0, 0]}
        >
          <boxGeometry args={[0.6, 0.02, 0.04]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#ffffff' : '#87ceeb'}
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  );
});
