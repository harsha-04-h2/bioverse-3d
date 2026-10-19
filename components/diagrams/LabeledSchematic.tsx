"use client";

import { useId, useState } from "react";
import { ACCENTS, type SchematicShape, type SchematicSpec } from "./types";
import { T } from "./theme";

function Shape({ shape, uid }: { shape: SchematicShape; uid: string }) {
  switch (shape.kind) {
    case "rect":
      return (
        <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx ?? 8}
          fill={shape.fill ?? "none"} stroke={shape.stroke ?? T.line} strokeWidth={shape.strokeWidth ?? 1.6}
          strokeDasharray={shape.dashed ? "6 5" : undefined} opacity={shape.opacity ?? 1} />
      );
    case "ellipse":
      return (
        <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry}
          fill={shape.fill ?? "none"} stroke={shape.stroke ?? T.line} strokeWidth={shape.strokeWidth ?? 1.6}
          strokeDasharray={shape.dashed ? "6 5" : undefined} opacity={shape.opacity ?? 1} />
      );
    case "circle":
      return (
        <circle cx={shape.cx} cy={shape.cy} r={shape.r}
          fill={shape.fill ?? "none"} stroke={shape.stroke ?? T.line} strokeWidth={shape.strokeWidth ?? 1.6}
          strokeDasharray={shape.dashed ? "6 5" : undefined} opacity={shape.opacity ?? 1} />
      );
    case "line":
      return (
        <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2}
          stroke={shape.stroke ?? T.line} strokeWidth={shape.strokeWidth ?? 1.6}
          strokeDasharray={shape.dashed ? "6 5" : undefined} opacity={shape.opacity ?? 1} />
      );
    case "arrow":
      return (
        <line x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2}
          stroke={shape.stroke ?? T.accent} strokeWidth={shape.strokeWidth ?? 2}
          strokeDasharray={shape.dashed ? "6 5" : undefined} markerEnd={`url(#sa-${uid})`}
          opacity={shape.opacity ?? 1} />
      );
    case "path":
      return (
        <path d={shape.d} fill={shape.fill ?? "none"} stroke={shape.stroke ?? T.line}
          strokeWidth={shape.strokeWidth ?? 1.6} strokeDasharray={shape.dashed ? "6 5" : undefined}
          opacity={shape.opacity ?? 1} />
      );
    case "text":
      return (
        <text x={shape.x} y={shape.y} fontSize={shape.size ?? 13} fill={shape.color ?? T.text}
          fontWeight={shape.weight ?? 500} textAnchor={shape.anchor ?? "start"}>
          {shape.text}
        </text>
      );
  }
}

export default function LabeledSchematic({ spec }: { spec: SchematicSpec }) {
  const uid = useId().replace(/:/g, "");
  const [sel, setSel] = useState<number | null>(null);

  return (
    <div>
      <svg viewBox={`0 0 ${spec.width} ${spec.height}`} className="w-full" role="img">
        <defs>
          <marker id={`sa-${uid}`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L8,4.5 L0,9 Z" fill={T.accent} />
          </marker>
          <marker id={`sl-${uid}`} markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
            <circle cx="3.5" cy="3.5" r="2.6" fill={T.leader} />
          </marker>
        </defs>

        {spec.shapes.map((s, i) => (
          <Shape key={i} shape={s} uid={uid} />
        ))}

        {spec.labels.map((l, i) => {
          const accent = ACCENTS[l.accent ?? "cyan"];
          const active = sel === i;
          // elbow leader: from anchor point, horizontal jog then to text
          const midX = l.lx + (l.anchor === "end" ? 6 : l.anchor === "start" ? -6 : 0);
          return (
            <g key={i} onClick={() => setSel(active ? null : i)} className="cursor-pointer">
              <polyline
                points={`${l.x},${l.y} ${midX},${l.y} ${l.lx},${l.ly}`}
                fill="none"
                stroke={active ? T.selected : T.leader}
                strokeWidth={active ? 1.8 : 1.2}
              />
              <circle cx={l.x} cy={l.y} r={3} fill={active ? T.selected : accent} />
              <text
                x={l.lx}
                y={l.ly}
                textAnchor={l.anchor ?? "middle"}
                fontSize={12.5}
                fontWeight={active ? 700 : 600}
                fill={active ? "#ffffff" : T.text}
                dy={-6}
              >
                {l.text}
              </text>
            </g>
          );
        })}
      </svg>

      {sel !== null && spec.labels[sel].info && (
        <div className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-4 py-3">
          <div className="text-sm font-semibold text-cyan-300">{spec.labels[sel].text}</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{spec.labels[sel].info}</p>
        </div>
      )}
      {sel === null && spec.labels.some((l) => l.info) && (
        <p className="mt-2 text-center text-xs" style={{ color: T.faint }}>
          Click a label to learn more
        </p>
      )}
    </div>
  );
}
