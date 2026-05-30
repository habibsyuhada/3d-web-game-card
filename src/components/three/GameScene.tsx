// src/components/three/GameScene.tsx — Root 3D scene component
//
// Renders inside an R3F <Canvas> and sets up:
// - Lighting rig: ambient, key directional, fill directional, spot (pile)
// - Table (procedural green felt surface)
// - Middle pile placeholder (STORY-013)
// - 4 player slot placeholders at cardinal positions (STORY-012)

import { Table3D } from './Table3D';
import { MiddlePile3D } from './MiddlePile3D';
import { PlayerSlot3D } from './PlayerSlot3D';

export function GameScene() {
  return (
    <>
      {/* Lighting rig — per architecture Section 9 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} />
      <spotLight
        position={[0, 6, 0]}
        intensity={0.5}
        angle={0.6}
        penumbra={0.3}
      />

      {/* Table at center */}
      <Table3D />

      {/* Middle pile placeholder — populated in STORY-013 */}
      <MiddlePile3D />

      {/* 4 player slots at cardinal positions */}
      <PlayerSlot3D playerIndex={0} position={[0, 0, 3.5]} rotation={[0, 0, 0]} />
      <PlayerSlot3D playerIndex={1} position={[-3, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <PlayerSlot3D playerIndex={2} position={[0, 0, -3.5]} rotation={[0, Math.PI, 0]} />
      <PlayerSlot3D playerIndex={3} position={[3, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
    </>
  );
}
