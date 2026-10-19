"use client";

import { useState } from "react";
import type { FigureDef } from "@/lib/data";
import DiagramRenderer from "./DiagramRenderer";
import { T } from "./theme";

const VIZ_BADGE: Record<string, string> = {
  "diagram-2d": "Interactive diagram",
  graph: "Data graph",
  timeline: "Timeline",
};

/**
 * Panel wrapper for 2D diagram figures: zoom controls, the diagram itself,
 * the original explanation, and key terms.
 */
export default function DiagramViewer({ figure }: { figure: FigureDef }) {
  const [zoom, setZoom] = useState(1);
  if (!figure.diagram) return null;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0c1a30]/80">
        {/* toolbar */}
        <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-2.5">
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
            {VIZ_BADGE[figure.vizType] ?? "Diagram"}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-lg text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="w-12 text-center text-xs font-medium text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.2).toFixed(1)))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 text-lg text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => setZoom(1)}
              className="ml-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>

        {/* diagram */}
        <div className="overflow-auto p-4 sm:p-8">
          <div
            className="mx-auto max-w-4xl transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
          >
            <DiagramRenderer diagram={figure.diagram} />
          </div>
        </div>
      </div>

      {/* explanation */}
      <div className="mt-6 rounded-2xl border border-slate-800 bg-deep/60 p-5 sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
          What this shows
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-200">{figure.description}</p>
      </div>

      {/* key terms */}
      {figure.labels.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Key terms
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {figure.labels.map((l) => (
              <div key={l.id} className="rounded-xl border border-slate-800 bg-deep/60 p-4">
                <div className="text-sm font-bold text-white">{l.name}</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{l.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
