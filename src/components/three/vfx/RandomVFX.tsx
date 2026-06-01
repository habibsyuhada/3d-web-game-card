// src/components/three/vfx/RandomVFX.tsx — Random card VFX (STORY-018)
//
// Number scramble / dice-shuffle effect: rapidly cycling numbers 1-13
// displayed as <Text> from Drei, then settling on the final value.
// Colors: purple/gold (#9c27b0 / #ffd700).
// Duration: ~800ms total (scramble ~600ms + reveal ~200ms).
//
// Implementation:
// - <Text> from @react-three/drei for the number display
// - useEffect + setInterval for rapid number cycling (~50ms)
// - After scramble period, lock on finalValue
// - React.memo wrapper

import { memo, useEffect, useRef, useState } from 'react';
import { Text } from '@react-three/drei';

interface RandomVFXProps {
  position: [number, number, number];
  finalValue: number;
  onComplete: () => void;
}

/** Total duration for the random VFX. */
const RANDOM_DURATION_MS = 800;
/** How long the scramble phase lasts (before locking on final value). */
const SCRAMBLE_DURATION_MS = 600;
/** Interval between number changes during scramble. */
const SCRAMBLE_INTERVAL_MS = 50;

/**
 * Random number scramble VFX — rapidly cycles numbers then reveals finalValue.
 *
 * @param position - 3D world-space position for the number display
 * @param finalValue - The number to settle on after scramble
 * @param onComplete - Called after duration to trigger unmount
 */
export const RandomVFX = memo(function RandomVFX({
  position,
  finalValue,
  onComplete,
}: RandomVFXProps) {
  const [displayText, setDisplayText] = useState<string>(
    String(Math.floor(Math.random() * 13) + 1),
  );
  const scrambleEndedRef = useRef(false);

  // Auto-cleanup after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, RANDOM_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Rapid number cycling during scramble phase
  useEffect(() => {
    const scrambleTimer = setTimeout(() => {
      // Lock on final value
      scrambleEndedRef.current = true;
      setDisplayText(String(finalValue));
    }, SCRAMBLE_DURATION_MS);

    const interval = setInterval(() => {
      if (!scrambleEndedRef.current) {
        setDisplayText(String(Math.floor(Math.random() * 13) + 1));
      }
    }, SCRAMBLE_INTERVAL_MS);

    return () => {
      clearTimeout(scrambleTimer);
      clearInterval(interval);
    };
  }, [finalValue]);

  // Determine color: purple during scramble, gold when settled
  const isSettled = scrambleEndedRef.current;
  const textColor = isSettled ? '#ffd700' : '#9c27b0';

  return (
    <group position={position}>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.6}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {displayText}
      </Text>
    </group>
  );
});
