// src/components/ErrorBoundary.test.tsx — Tests for ErrorBoundary (STORY-017)
//
// Tests the class-component ErrorBoundary to ensure:
// 1. Renders children normally when no error occurs
// 2. Catches errors thrown by child components and renders fallback UI
// 3. Logs errors to console.error on catch
// 4. Fallback UI contains expected messaging ("3D rendering error")
// 5. Refresh button triggers window.location.reload

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// ── Helper: component that throws ──────────────────────────────────────
function ThrowingComponent({ message }: { message: string }): ReactNode {
  throw new Error(message);
}

// ── Test setup ─────────────────────────────────────────────────────────
describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress expected console.error output from ErrorBoundary logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child-content">Hello World</div>
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('shows fallback UI when a child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="WebGL context lost" />
      </ErrorBoundary>,
    );

    // Fallback heading and message should appear
    expect(screen.getByText('Rendering Error')).toBeInTheDocument();
    expect(
      screen.getByText('3D rendering error. Please refresh the page.'),
    ).toBeInTheDocument();

    // The original error message should be visible
    expect(screen.getByText('WebGL context lost')).toBeInTheDocument();
  });

  it('renders a Refresh button in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="test error" />
      </ErrorBoundary>,
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('calls console.error with error and component stack when catching', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent message="shader compilation failed" />
      </ErrorBoundary>,
    );

    // ErrorBoundary should log to console.error
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Verify the logged message includes the [ErrorBoundary] prefix
    const calls = consoleErrorSpy.mock.calls;
    const errorBoundaryCall = calls.find(
      (call: unknown[]) => typeof call[0] === 'string' && (call[0] as string).includes('[ErrorBoundary]'),
    );
    expect(errorBoundaryCall).toBeDefined();
  });

  it('Refresh button triggers window.location.reload', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadMock },
    });

    render(
      <ErrorBoundary>
        <ThrowingComponent message="test" />
      </ErrorBoundary>,
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    refreshButton.click();

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('does not show fallback UI when children render successfully', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>,
    );

    expect(screen.queryByText('Rendering Error')).not.toBeInTheDocument();
    expect(
      screen.queryByText('3D rendering error. Please refresh the page.'),
    ).not.toBeInTheDocument();
  });

  it('handles null error message gracefully', () => {
    // Component that throws without a message
    function ThrowsNull(): ReactNode {
      throw new Error();
    }

    render(
      <ErrorBoundary>
        <ThrowsNull />
      </ErrorBoundary>,
    );

    // Should still show the fallback UI without crashing
    expect(screen.getByText('Rendering Error')).toBeInTheDocument();
    expect(
      screen.getByText('3D rendering error. Please refresh the page.'),
    ).toBeInTheDocument();
  });
});
