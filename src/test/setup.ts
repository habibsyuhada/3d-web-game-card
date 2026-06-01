// src/test/setup.ts — Vitest global test setup (STORY-021 enhanced)
//
// Configures:
// - @testing-library/jest-dom matchers (toBeInTheDocument, toHaveTextContent, etc.)
// - WebGL context mock for jsdom (R3F can't render WebGL in jsdom)
// - Fullscreen API mock (not available in jsdom)
// - requestAnimationFrame polyfill for headless environments

import '@testing-library/jest-dom';

// ── WebGL Context Mock ───────────────────────────────────────────────────
// jsdom doesn't have a WebGL context. We provide a minimal mock so that
// any code that checks for WebGL support won't crash during tests.
if (typeof HTMLCanvasElement !== 'undefined') {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
    ...args: unknown[]
  ) {
    if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
      return {
        canvas: this,
        drawingBufferWidth: 1024,
        drawingBufferHeight: 768,
        getExtension: () => null,
        getParameter: () => '',
        createShader: () => ({}),
        createProgram: () => ({}),
        createTexture: () => ({}),
        createBuffer: () => ({}),
        bindTexture: () => {},
        bindBuffer: () => {},
        texImage2D: () => {},
        texParameteri: () => {},
        viewport: () => {},
        clear: () => {},
        clearColor: () => {},
        enable: () => {},
        disable: () => {},
        blendFunc: () => {},
        depthFunc: () => {},
        useProgram: () => {},
        shaderSource: () => {},
        compileShader: () => {},
        attachShader: () => {},
        linkProgram: () => {},
        getShaderParameter: () => true,
        getProgramParameter: () => true,
        getAttribLocation: () => 0,
        getUniformLocation: () => ({}),
        uniform1i: () => {},
        uniform1f: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        uniformMatrix4fv: () => {},
        vertexAttribPointer: () => {},
        enableVertexAttribArray: () => {},
        drawArrays: () => {},
        drawElements: () => {},
        bufferData: () => {},
        activeTexture: () => {},
        generateMipmap: () => {},
        pixelStorei: () => {},
        scissor: () => {},
        colorMask: () => {},
        depthMask: () => {},
        stencilMask: () => {},
        cullFace: () => {},
        frontFace: () => {},
        lineWidth: () => {},
        polygonOffset: () => {},
        sampleCoverage: () => {},
        createFramebuffer: () => ({}),
        bindFramebuffer: () => {},
        framebufferTexture2D: () => {},
        checkFramebufferStatus: () => 0x8CD5, // FRAMEBUFFER_COMPLETE
        createRenderbuffer: () => ({}),
        bindRenderbuffer: () => {},
        renderbufferStorage: () => {},
        framebufferRenderbuffer: () => {},
      } as unknown as WebGLRenderingContext;
    }
    // For all other contexts, fall back to the original implementation
    return originalGetContext.call(this, contextId as never, ...args) as never;
  } as typeof HTMLCanvasElement.prototype.getContext;
}

// ── Fullscreen API Mock ─────────────────────────────────────────────────
// jsdom doesn't implement the Fullscreen API. We provide stubs so tests
// don't crash when components/hooks access fullscreen properties.
if (typeof document !== 'undefined') {
  if (!('fullscreenEnabled' in document)) {
    Object.defineProperty(document, 'fullscreenEnabled', {
      value: false,
      writable: true,
      configurable: true,
    });
  }

  if (!('fullscreenElement' in document)) {
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true,
    });
  }

  if (!(document.documentElement as unknown as Record<string, unknown>).requestFullscreen) {
    (document.documentElement as unknown as Record<string, unknown>).requestFullscreen = () =>
      Promise.resolve();
  }

  if (!document.exitFullscreen) {
    document.exitFullscreen = () => Promise.resolve();
  }
}

// ── requestAnimationFrame polyfill ──────────────────────────────────────
// jsdom may not provide rAF; use setTimeout fallback for headless tests.
if (typeof globalThis !== 'undefined' && typeof globalThis.requestAnimationFrame === 'undefined') {
  (globalThis as Record<string, unknown>).requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0);
  (globalThis as Record<string, unknown>).cancelAnimationFrame = (id: number) =>
    clearTimeout(id);
}
