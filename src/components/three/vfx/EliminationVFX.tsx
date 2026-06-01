// src/components/three/vfx/EliminationVFX.tsx — Player elimination VFX (STORY-018)
//
// Fade-to-gray + scale-down animation at the eliminated player's position.
// Triggered when a player's lives reach 0 (FR-050, AC-013).
// Colors: red fading to gray.
// Duration: ~1000ms.
//
// Implementation:
// - Group at player position with multiple "fragment" meshes
// - Fragments scale down and fade to gray/transparent
// - React.memo wrapper

import { memo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface EliminationVFXProps {
  position: [number, number, number];
  onComplete: () => void;
}

/** Duration for the elimination VFX. */
const ELIMINATION_DURATION_MS = 1000;

/** Number of fragments to scatter. */
const FRAGMENT_COUNT = 12;

/**
 * Elimination VFX — fragments at player position fade to gray and scale down.
 *
 * @param position - 3D world-space position of the eliminated player's slot
 * @param onComplete - Called after duration to trigger unmount
 */
export const EliminationVFX = memo(function EliminationVFX({
  position,
  onComplete,
}: EliminationVFXProps) {
  const groupRef = useRef<any>(null);
  const fragmentRefs = useRef<(any | null)[]>([]);
  const startTimeRef = useRef<number | null>(null);

  // Auto-cleanup after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, ELIMINATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Per-frame animation: scale down + fade
  useFrame(() => {
    if (!startTimeRef.current) startTimeRef.current = performance.now();
    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / ELIMINATION_DURATION_MS, 1);

    const scale = 1 - progress * 0.8; // scale from 1.0 to 0.2
    const opacity = 1 - progress;

    if (groupRef.current) {
      groupRef.current.scale.set(scale, scale, scale);
    }

    for (let i = 0; i < FRAGMENT_COUNT; i++) {
      const frag = fragmentRefs.current[i];
      if (!frag) continue;

      // Scatter fragments outward
      const angle = (i / FRAGMENT_COUNT) * Math.PI * 2;
      const dist = progress * 0.5;
      frag.position.x = Math.cos(angle) * dist;
      frag.position.y = progress * 0.3; // slight upward drift
      frag.position.z = Math.sin(angle) * dist;

      if (frag.material) {
        frag.material.opacity = opacity;
        // Transition from red to gray
        const gray = progress;
        frag.material.color.setRGB(
          1 - gray * 0.5,
          0 + gray * 0.5,
          0 + gray * 0.5,
        );
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: FRAGMENT_COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { fragmentRefs.current[i] = el; }}
          position={[0, 0, 0]}
        >
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshBasicMaterial
            color="#ff0000"
            transparent
            opacity={1}
          />
        </mesh>
      ))}
    </group>
  );
});
