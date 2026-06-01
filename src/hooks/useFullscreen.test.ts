// src/hooks/useFullscreen.test.ts — Tests for useFullscreen hook (STORY-020)
//
// Test cases:
// 1. iOS detection via detectIOS (user agent patterns)
// 2. isIOS return value from hook
// 3. CSS fullscreen class applied on iOS enterFullscreen
// 4. CSS fullscreen class removed on iOS exitFullscreen
// 5. Native fullscreen API path still works when not on iOS
// 6. isSupported detects native API correctly

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFullscreen, detectIOS, detectStandalone } from './useFullscreen';

// ── Helper to set navigator properties ─────────────────────────────────────
const originalUserAgent = navigator.userAgent;

function mockNavigator(overrides: Partial<Navigator>) {
  Object.defineProperty(navigator, 'userAgent', {
    value: overrides.userAgent ?? navigator.userAgent,
    configurable: true,
  });
  Object.defineProperty(navigator, 'platform', {
    value: overrides.platform ?? navigator.platform,
    configurable: true,
  });
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: overrides.maxTouchPoints ?? navigator.maxTouchPoints,
    configurable: true,
  });
}

function mockStandalone(value: boolean): void {
  Object.defineProperty(navigator, 'standalone', {
    value,
    configurable: true,
  });
}

function restoreStandalone(): void {
  delete (navigator as unknown as Record<string, unknown>).standalone;
}

function restoreNavigator() {
  mockNavigator({
    userAgent: originalUserAgent,
    platform: 'Win32',
    maxTouchPoints: 0,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Default: non-iOS environment (test browser is not iOS)
  mockNavigator({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: 'Win32',
    maxTouchPoints: 0,
  });
  // Remove any CSS fullscreen class
  document.body.classList.remove('css-fullscreen-active');
  vi.restoreAllMocks();
});

afterEach(() => {
  restoreNavigator();
  restoreStandalone();
  document.body.classList.remove('css-fullscreen-active');
});

describe('detectIOS', () => {
  it('returns false for desktop Chrome on Windows', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    expect(detectIOS()).toBe(false);
  });

  it('returns true for iPhone user agent', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    expect(detectIOS()).toBe(true);
  });

  it('returns true for iPad user agent', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPad',
      maxTouchPoints: 5,
    });
    expect(detectIOS()).toBe(true);
  });

  it('returns true for iPod user agent', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      platform: 'iPod',
      maxTouchPoints: 5,
    });
    expect(detectIOS()).toBe(true);
  });

  it('returns true for iPadOS 13+ (MacIntel platform with maxTouchPoints > 1)', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 5,
    });
    expect(detectIOS()).toBe(true);
  });

  it('returns false for Mac (MacIntel platform with maxTouchPoints <= 1)', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      platform: 'MacIntel',
      maxTouchPoints: 0,
    });
    expect(detectIOS()).toBe(false);
  });

  it('returns true for Android device (has "Linux; Android" but no iOS tokens)', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      platform: 'Linux armv8l',
      maxTouchPoints: 5,
    });
    expect(detectIOS()).toBe(false);
  });
});

describe('useFullscreen — return shape', () => {
  it('returns an object with isFullscreen, enterFullscreen, exitFullscreen, isSupported, isIOS, isStandalone', () => {
    const { result } = renderHook(() => useFullscreen());

    expect(result.current).toHaveProperty('isFullscreen');
    expect(result.current).toHaveProperty('enterFullscreen');
    expect(result.current).toHaveProperty('exitFullscreen');
    expect(result.current).toHaveProperty('isSupported');
    expect(result.current).toHaveProperty('isIOS');
    expect(result.current).toHaveProperty('isStandalone');
    expect(typeof result.current.enterFullscreen).toBe('function');
    expect(typeof result.current.exitFullscreen).toBe('function');
    expect(typeof result.current.isFullscreen).toBe('boolean');
    expect(typeof result.current.isSupported).toBe('boolean');
    expect(typeof result.current.isIOS).toBe('boolean');
    expect(typeof result.current.isStandalone).toBe('boolean');
  });

  it('isFullscreen is false initially', () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isFullscreen).toBe(false);
  });
});

describe('useFullscreen — iOS CSS fallback', () => {
  it('isIOS is true when running on iOS', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isIOS).toBe(true);
  });

  it('isIOS is false when running on desktop', () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isIOS).toBe(false);
  });

  it('adds css-fullscreen-active class to body on iOS enterFullscreen', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    const { result } = renderHook(() => useFullscreen());

    expect(document.body.classList.contains('css-fullscreen-active')).toBe(false);

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(document.body.classList.contains('css-fullscreen-active')).toBe(true);
  });

  it('removes css-fullscreen-active class from body on iOS exitFullscreen', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    const { result } = renderHook(() => useFullscreen());

    // Enter fullscreen first
    await act(async () => {
      await result.current.enterFullscreen();
    });
    expect(document.body.classList.contains('css-fullscreen-active')).toBe(true);

    // Exit fullscreen
    await act(async () => {
      await result.current.exitFullscreen();
    });
    expect(document.body.classList.contains('css-fullscreen-active')).toBe(false);
  });

  it('scrolls to (0, 1) on iOS enterFullscreen to hide status bar', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(scrollToSpy).toHaveBeenCalledWith(0, 1);
  });

  it('does not call native requestFullscreen on iOS', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    // Mock requestFullscreen to detect if it's called
    const requestFullscreenSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: requestFullscreenSpy,
      configurable: true,
    });

    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(requestFullscreenSpy).not.toHaveBeenCalled();
    // Clean up
    delete (document.documentElement as unknown as Record<string, unknown>).requestFullscreen;
  });
});

describe('useFullscreen — native API path (non-iOS)', () => {
  it('calls native requestFullscreen when not on iOS', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      platform: 'Linux armv8l',
      maxTouchPoints: 5,
    });
    // Mock requestFullscreen
    const requestFullscreenSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: requestFullscreenSpy,
      configurable: true,
    });

    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(requestFullscreenSpy).toHaveBeenCalled();
    expect(document.body.classList.contains('css-fullscreen-active')).toBe(false);
    // Clean up
    delete (document.documentElement as unknown as Record<string, unknown>).requestFullscreen;
  });

  it('does not add CSS class when using native fullscreen', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    const requestFullscreenSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: requestFullscreenSpy,
      configurable: true,
    });

    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(document.body.classList.contains('css-fullscreen-active')).toBe(false);
    // Clean up
    delete (document.documentElement as unknown as Record<string, unknown>).requestFullscreen;
  });

  it('handles native fullscreen request failure gracefully', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    // Mock requestFullscreen to reject
    const requestFullscreenSpy = vi.fn().mockRejectedValue(new Error('User denied'));
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: requestFullscreenSpy,
      configurable: true,
    });

    const { result } = renderHook(() => useFullscreen());

    // Should not throw
    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(requestFullscreenSpy).toHaveBeenCalled();
    // Clean up
    delete (document.documentElement as unknown as Record<string, unknown>).requestFullscreen;
  });
});

describe('useFullscreen — isSupported detection', () => {
  it('isSupported is true when document.fullscreenEnabled is true', () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true,
      configurable: true,
    });

    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isSupported).toBe(true);

    delete (document as unknown as Record<string, unknown>).fullscreenEnabled;
  });

  it('isSupported is false when document.fullscreenEnabled is false and no webkit', () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: false,
      configurable: true,
    });

    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isSupported).toBe(false);

    delete (document as unknown as Record<string, unknown>).fullscreenEnabled;
  });
});

describe('detectStandalone', () => {
  it('returns false when navigator.standalone is undefined', () => {
    restoreStandalone();
    expect(detectStandalone()).toBe(false);
  });

  it('returns false when navigator.standalone is false', () => {
    mockStandalone(false);
    expect(detectStandalone()).toBe(false);
  });

  it('returns true when navigator.standalone is true (iOS Add to Home Screen)', () => {
    mockStandalone(true);
    expect(detectStandalone()).toBe(true);
  });
});

describe('useFullscreen — isStandalone', () => {
  it('isStandalone is false when navigator.standalone is not set', () => {
    restoreStandalone();
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isStandalone).toBe(false);
  });

  it('isStandalone is true when navigator.standalone is true', () => {
    mockStandalone(true);
    const { result } = renderHook(() => useFullscreen());
    expect(result.current.isStandalone).toBe(true);
  });
});

describe('useFullscreen — CSS fullscreen state reactivity', () => {
  it('isFullscreen updates to true after enterFullscreen on iOS (useState reactivity)', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isFullscreen).toBe(false);

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(result.current.isFullscreen).toBe(true);
  });

  it('isFullscreen updates to false after exitFullscreen on iOS (useState reactivity)', async () => {
    mockNavigator({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    const { result } = renderHook(() => useFullscreen());

    // Enter fullscreen first
    await act(async () => {
      await result.current.enterFullscreen();
    });
    expect(result.current.isFullscreen).toBe(true);

    // Exit fullscreen
    await act(async () => {
      await result.current.exitFullscreen();
    });
    expect(result.current.isFullscreen).toBe(false);
  });
});
