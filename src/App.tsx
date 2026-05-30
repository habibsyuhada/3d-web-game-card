// src/App.tsx — Root component: conditionally renders TitleScreen or Game container
// When showTitleScreen is true, the TitleScreen overlay is shown.
// When false, the R3F Canvas with GameScene is rendered.

import { Canvas } from '@react-three/fiber';
import { useGameStore } from './store';
import { TitleScreen } from './components/ui/TitleScreen';
import { GameScene } from './components/three/GameScene';

/**
 * Root application component.
 *
 * Renders:
 * - `<TitleScreen />` when `showTitleScreen === true`
 * - Full-viewport `<Canvas>` with `<GameScene />` when `showTitleScreen === false`
 *
 * Canvas is configured for mobile performance:
 * - dpr capped at 1.5 to avoid excessive pixel density on high-DPI screens
 * - antialias disabled (mobile screens naturally anti-aliased)
 * - powerPreference 'high-performance' to request discrete GPU
 * - alpha false for solid (non-transparent) background
 * - Camera at [0, 8, 6] with FOV 50 for elevated portrait view
 * - touchAction 'none' to prevent browser touch gestures
 */
function App() {
  const showTitleScreen = useGameStore((s) => s.showTitleScreen);

  if (showTitleScreen) {
    return <TitleScreen />;
  }

  return (
    <div
      className="w-screen h-screen touch-none"
      data-testid="game-container"
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        camera={{
          position: [0, 8, 6],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        style={{ touchAction: 'none' }}
      >
        <GameScene />
      </Canvas>
    </div>
  );
}

export default App;
