// src/components/ErrorBoundary.tsx — Error boundary for 3D rendering errors
//
// STORY-017: Catches rendering errors (especially WebGL context errors)
// from the R3F Canvas and its children. Displays a user-friendly fallback
// message with a refresh button instead of crashing the entire app.
//
// Usage: Wraps <Canvas> inside App.tsx / GameContainer so any R3F
// error (context lost, shader compilation failure, GPU driver crash)
// is caught and surfaced cleanly.

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary that catches rendering errors in its child tree.
 *
 * Primarily used to wrap the R3F `<Canvas>` component so that
 * WebGL or 3D rendering failures are handled gracefully instead
 * of propagating up and crashing the entire app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log the full error and component stack for debugging
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-screen h-screen bg-gray-900">
          <div className="text-center p-8 rounded-lg bg-gray-800 max-w-md">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Rendering Error
            </h2>
            <p className="text-gray-300 mb-6">
              3D rendering error. Please refresh the page.
            </p>
            <p className="text-xs text-gray-500">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
