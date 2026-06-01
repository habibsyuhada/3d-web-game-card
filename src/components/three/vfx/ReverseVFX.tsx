// src/components/three/vfx/ReverseVFX.tsx — Reverse card VFX (STORY-018)
//
// Two arrow shapes rotating 180° to indicate direction change.
// Colors: blue/cyan (#00bcd4).
// Duration: ~600ms.
//
// Implementation:
// - Two arrow-like geometries (elongated cones/boxes) rotating around Y-axis
// - Smooth rotation animation using useFrame
// - React.memo wrapper

import { memo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface ReverseVFXProps {
  position: [number, number, number];
  onComplete: () => void;
}

/** Duration for the reverse VFX. */
const REVERSE_DURATION_MS = 600;

/**
 * Reverse direction VFX — two cyan arrows spinning 180°.
 *
 * @param position - 3D world-space center for the effect
 * @param onComplete - Called after duration to trigger unmount
 */
export const ReverseVFX = memo(function ReverseVFX({
  position,
  onComplete,
}: ReverseVFXProps) {
  const groupRef = useRef<any>(null);
  const arrow1Ref = useRef<any>(null);
  const arrow2Ref = useRef<any>(null);
  const startTimeRef = useRef<number | null>(null);

  // Auto-cleanup after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, REVERSE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Per-frame animation: rotate arrows 180°
  useFrame(() => {
    if (!startTimeRef.current) startTimeRef.current = performance.now();
    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / REVERSE_DURATION_MS, 1);

    // Ease-out curve
    const eased = 1 - Math.pow(1 - progress, 3);
    const rotation = eased * Math.PI; // 0 → 180°

    if (arrow1Ref.current) {
      arrow1Ref.current.rotation.y = rotation;
    }
    if (arrow2Ref.current) {
      arrow2Ref.current.rotation.y = rotation + Math.PI; // opposite start
    }

    // Fade out in the last 30%
    const opacity = progress < 0.7 ? 1 : 1 - ((progress - 0.7) / 0.3);
    if (groupRef.current) {
      groupRef.current.children.forEach((child: any) => {
        if (child.material) {
          child.material.opacity = opacity;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Arrow 1 — forward pointing */}
      <mesh ref={arrow1Ref} position={[0.3, 0, 0]}>
        <coneGeometry args={[0.15, 0.5, 4]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={1} side={2} />
      </mesh>

      {/* Arrow 2 — backward pointing */}
      <mesh ref={arrow2Ref} position={[-0.3, 0, 0]} rotation={[0, Math.PI, 0]}>
        <coneGeometry args={[0.15, 0.5, 4]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={1} side={2} />
      </mesh>
    </group>
  );
});
