"use client";

import { useId, useState } from "react";
import { ACCENTS, type CycleSpec } from "./types";
import { T, labelStyle, subLabelStyle, smallMuted } from "./theme";

const W = 720;
const H = 560;
const CX = W / 2;
const CY = H / 2 + 10;
const R = 195;

function polar(angleDeg: number, r: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

/** Arc path between two angles on radius r (for arrow connectors). */
function arcPath(a1: number, a2: number, r: number): string {
  const [x1, y1] = polar(a1, r);
  const [x2, y2] = polar(a2, r);
  let sweep = a2 - a1;
  while (sweep < 0) sweep += 360;
  const large = sweep > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export default function CycleDiagram({ spec }: { spec: CycleSpec }) {
  const uid = useId().replace(/:/g, "");
  const [sel, setSel] = useState<number | null>(null);
  const n = spec.nodes.length;
  const step = 360 / n;

  const arrows =
    spec.arrows ??
    spec.nodes.map((_, i) => ({ from: i, to: (i + 1) % n, label: undefined as string | undefined }));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        <defs>
          <marker id={`ah-${uid}`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L8,4.5 L0,9 Z" fill={T.faint} />
          </marker>
          <marker id={`ahs-${uid}`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L8,4.5 L0,9 Z" fill={T.accent} />
          </marker>
        </defs>

        {/* faint orbit ring */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={T.line} strokeWidth={1} strokeDasharray="4 6" opacity={0.7} />

        {/* arrows */}
        {arrows.map((ar, i) => {
          const a1 = ar.from * step + step * 0.32;
          const a2 = ar.to * step - step * 0.32;
          const mid = (a1 + a2) / 2;
          const [lx, ly] = polar(mid, R);
          return (
            <g key={i}>
              <path d={arcPath(a1, a2, R)} fill="none" stroke={T.faint} strokeWidth={1.6} markerEnd={`url(#ah-${uid})`} />
              {ar.label && (
                <text x={lx} y={ly} textAnchor="middle" fontSize={11} fill={T.muted} fontWeight={500}>
                  {ar.label}
                </text>
              )}
            </g>
          );
        })}

        {/* centre */}
        {(spec.centerLabel || spec.centerSub) && (
          <g>
            {spec.centerLabel && (
              <text x={CX} y={CY - 4} textAnchor="middle" fontSize={17} fontWeight={700} fill={T.text}>
                {spec.centerLabel}
              </text>
            )}
            {spec.centerSub && (
              <text x={CX} y={CY + 18} textAnchor="middle" fontSize={12} fill={T.muted}>
                {spec.centerSub}
              </text>
            )}
          </g>
        )}

        {/* nodes */}
        {spec.nodes.map((node, i) => {
          const [x, y] = polar(i * step, R);
          const accent = ACCENTS[node.accent ?? "cyan"];
          const active = sel === i;
          const w = 196;
          const h = node.sub ? 62 : 46;
          return (
            <g
              key={i}
              transform={`translate(${x - w / 2}, ${y - h / 2})`}
              onClick={() => setSel(active ? null : i)}
              className="cursor-pointer"
            >
              <rect
                width={w}
                height={h}
                rx={12}
                fill={active ? "#14324f" : T.chipFill}
                stroke={active ? T.selected : accent}
                strokeWidth={active ? 2.4 : 1.6}
                opacity={sel !== null && !active ? 0.55 : 1}
              />
              <circle cx={14} cy={h / 2} r={4.5} fill={accent} />
              <text x={28} y={node.sub ? 24 : h / 2 + 4.5} {...labelStyle}>
                {node.label}
              </text>
              {node.sub && (
                <text x={28} y={43} {...subLabelStyle}>
                  {node.sub}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {sel !== null && spec.nodes[sel].info && (
        <div className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-4 py-3">
          <div className="text-sm font-semibold text-cyan-300">{spec.nodes[sel].label}</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{spec.nodes[sel].info}</p>
        </div>
      )}
      {sel === null && (
        <p className="mt-2 text-center text-xs" style={{ color: T.faint }}>
          Click a stage to learn more
        </p>
      )}
    </div>
  );
}
