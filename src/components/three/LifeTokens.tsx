// src/components/three/LifeTokens.tsx — Life token gems for each player (STORY-013)
//
// Renders a horizontal row of small sphere gem meshes representing a player's lives.
// - Active lives (index < count): bright red/pink (#e74c3c), full opacity
// - Lost lives (index >= count): dark gray (#333), opacity 0.3
//
// Performance:
// - React.memo prevents re-renders when props haven't changed
// - Shared geometry via useMemo — all tokens use the same SphereGeometry instance
// - Max 5 tokens per player, max 20 tokens in scene (4 players × 5)
//
// Geometry: sphereGeometry [0.08, 8, 6] ≈ 60 tris each (per architecture Section 9)

import { memo, useMemo } from 'react';
import { INITIAL_LIVES } from '../../types';

interface LifeTokensProps {
  /** Number of active (remaining) lives. */
  count: number;
  /** 3D position of the token row group. */
  position: [number, number, number];
  /** Maximum number of lives (tokens to render). Default: INITIAL_LIVES (5). */
  maxLives?: number;
}

/** Horizontal spacing between adjacent tokens. */
const TOKEN_SPACING = 0.2;

/**
 * Row of life token gem meshes for a single player.
 *
 * Renders `maxLives` spheres in a horizontal row. The first `count`
 * tokens are active (bright red) and the rest are lost (dim gray).
 */
export const LifeTokens = memo(function LifeTokens({
  count,
  position,
  maxLives = INITIAL_LIVES,
}: LifeTokensProps) {
  // Shared geometry for all tokens — created once, reused across all meshes
  const sharedGeometry = useMemo(
    () => <sphereGeometry args={[0.08, 8, 6]} />,
    [],
  );

  // Center the row: offset the first token so the row is centered on position
  const startOffset = -((maxLives - 1) * TOKEN_SPACING) / 2;

  const tokens = useMemo(() => {
    const result: { key: number; x: number; active: boolean }[] = [];
    for (let i = 0; i < maxLives; i++) {
      result.push({
        key: i,
        x: startOffset + i * TOKEN_SPACING,
        active: i < count,
      });
    }
    return result;
  }, [count, maxLives, startOffset]);

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {tokens.map((token) => (
        <mesh key={token.key} position={[token.x, 0, 0]}>
          {sharedGeometry}
          <meshStandardMaterial
            color={token.active ? '#e74c3c' : '#333333'}
            transparent={!token.active}
            opacity={token.active ? 1.0 : 0.3}
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
});
