"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches WebGL / renderer failures (missing GPU, blocked context, etc.)
 * and shows a graceful message instead of a blank page.
 */
export class WebGLErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("[BioVerse 3D] 3D renderer failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 bg-abyss p-8 text-center">
          <div className="text-3xl">🔬</div>
          <h3 className="text-lg font-semibold text-slate-100">
            3D view unavailable
          </h3>
          <p className="max-w-sm text-sm text-slate-400">
            Your browser or device couldn&apos;t start WebGL, which BioVerse 3D
            needs to render models. Try a recent version of Chrome, Edge,
            Firefox or Safari with hardware acceleration enabled.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-full bg-cyan-500/15 px-5 py-2 text-sm font-medium text-cyan-300 ring-1 ring-cyan-400/40 transition hover:bg-cyan-500/25"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
