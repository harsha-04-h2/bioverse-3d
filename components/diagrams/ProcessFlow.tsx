"use client";

import { useId, useState } from "react";
import { ACCENTS, type FlowSpec } from "./types";
import { T, subLabelStyle } from "./theme";

export default function ProcessFlow({ spec }: { spec: FlowSpec }) {
  const uid = useId().replace(/:/g, "");
  const [sel, setSel] = useState<number | null>(null);
  const vertical = spec.direction === "vertical";
  const n = spec.steps.length;

  // layout constants
  const cardW = 200;
  const cardH = 92;
  const gap = 64;
  const W = vertical ? 460 : n * cardW + (n - 1) * gap + 40;
  const H = vertical ? n * cardH + (n - 1) * gap + 40 : 300;

  const pos = (i: number): [number, number] =>
    vertical ? [230 - cardW / 2, 20 + i * (cardH + gap)] : [20 + i * (cardW + gap), 110];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        <defs>
          <marker id={`fh-${uid}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill={T.accent} />
          </marker>
        </defs>

        {/* connectors */}
        {spec.steps.slice(0, -1).map((_, i) => {
          const [x, y] = pos(i);
          const x1 = vertical ? x + cardW / 2 : x + cardW;
          const y1 = vertical ? y + cardH : y + cardH / 2;
          const x2 = vertical ? x1 : x1 + gap;
          const y2 = vertical ? y1 + gap : y1;
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const lbl = spec.arrowLabels?.[i];
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.accent} strokeWidth={2} markerEnd={`url(#fh-${uid})`} opacity={0.85} />
              {lbl && (
                <text
                  x={vertical ? mx + 10 : mx}
                  y={vertical ? my + 4 : my - 8}
                  textAnchor={vertical ? "start" : "middle"}
                  fontSize={11}
                  fill={T.muted}
                  fontWeight={500}
                >
                  {lbl}
                </text>
              )}
            </g>
          );
        })}

        {/* step cards */}
        {spec.steps.map((s, i) => {
          const [x, y] = pos(i);
          const accent = ACCENTS[s.accent ?? "cyan"];
          const active = sel === i;
          return (
            <g key={i} transform={`translate(${x}, ${y})`} onClick={() => setSel(active ? null : i)} className="cursor-pointer">
              <rect
                width={cardW}
                height={cardH}
                rx={14}
                fill={active ? "#14324f" : T.chipFill}
                stroke={active ? T.selected : T.chipStroke}
                strokeWidth={active ? 2.4 : 1.5}
                opacity={sel !== null && !active ? 0.55 : 1}
              />
              <rect x={0} y={0} width={5} height={cardH} rx={2.5} fill={accent} />
              <text x={44} y={22} fontSize={11} fontWeight={700} fill={accent} letterSpacing={1.5}>
                STEP {i + 1}
              </text>
              <text x={18} y={48} fontSize={13.5} fontWeight={700} fill={T.text}>
                {s.title}
              </text>
              {s.detail && (
                <text x={18} y={70} fontSize={11} fill={T.muted}>
                  {s.detail.length > 34 ? s.detail.slice(0, 34) + "…" : s.detail}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {sel !== null && (
        <div className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-4 py-3">
          <div className="text-sm font-semibold text-cyan-300">
            Step {sel + 1} · {spec.steps[sel].title}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">
            {spec.steps[sel].info ?? spec.steps[sel].detail ?? "No further detail."}
          </p>
        </div>
      )}
      {sel === null && (
        <p className="mt-2 text-center text-xs" style={{ color: T.faint }}>
          Click a step to learn more
        </p>
      )}
    </div>
  );
}
