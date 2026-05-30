// src/components/three/Table3D.tsx — Procedural table mesh with green felt material
//
// Design notes:
// - Dimensions: 8 x 6 units (landscape on table surface, viewed from above)
// - Height 0.1 (thin) + positioned at y=-0.1 so top face is at y=0
// - Green felt color: #1a472a (deep green, matte)
// - Roughness 0.8, metalness 0.1 for fabric look
// - RoundedBox from Drei with radius 0.05, smoothness 2 (low-poly ~200 triangles)

import { RoundedBox } from '@react-three/drei';

export function Table3D() {
  return (
    <RoundedBox
      args={[8, 0.1, 6]}
      radius={0.05}
      smoothness={2}
      position={[0, -0.1, 0]}
    >
      <meshStandardMaterial color="#1a472a" roughness={0.8} metalness={0.1} />
    </RoundedBox>
  );
}
