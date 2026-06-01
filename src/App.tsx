// src/App.tsx — Root component: conditionally renders TitleScreen or Game container
// When showTitleScreen is true, the TitleScreen overlay is shown.
// When false, the R3F Canvas with GameScene is rendered alongside game loop hooks.
//
// STORY-015: Integrates useGameLoop and useBotTurn for full turn orchestration.
// STORY-016: Integrates HUD overlay for player info, deck counter, direction, pile value.
// STORY-017: Wraps Canvas in ErrorBoundary for WebGL error handling.

import { Canvas } from '@react-three/fiber';
import { useGameStore } from './store';
import { TitleScreen } from './components/ui/TitleScreen';
import { GameScene } from './components/three/GameScene';
import { HUD } from './components/ui/HUD';
import { GameOverScreen } from './components/ui/GameOverScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useGameLoop } from './hooks/useGameLoop';
import { useBotTurn } from './hooks/useBotTurn';

/**
 * Inner game container that initializes the game loop hooks
 * and renders the 3D canvas alongside UI overlays.
 *
 * This is separated from App to ensure hooks only run when
 * the game scene is active (not on the title screen).
 */
function GameContainer() {
  // STORY-015: Orchestrate game loop and bot turns
  useGameLoop();
  useBotTurn();

  return (
    <div
      className="w-screen h-screen touch-none relative"
      data-testid="game-container"
    >
      {/* STORY-017: ErrorBoundary catches WebGL/R3F rendering errors */}
      <ErrorBoundary>
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
      </ErrorBoundary>

      {/* STORY-016: HUD overlay — all game info & turn messages */}
      <HUD />

      {/* STORY-019: Game Over Screen — victory/defeat overlay with Play Again */}
      <GameOverScreen />
    </div>
  );
}

/**
 * Root application component.
 *
 * Renders:
 * - `<TitleScreen />` when `showTitleScreen === true`
 * - `<GameContainer />` with 3D Canvas + overlays when `showTitleScreen === false`
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

  return <GameContainer />;
}

export default App;
