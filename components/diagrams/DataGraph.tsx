"use client";

import { useState } from "react";
import type { GraphSpec } from "./types";
import { T } from "./theme";

const W = 720;
const H = 460;
const ML = 64; // left margin
const MR = 30;
const MT = 26;
const MB = 58;
const PW = W - ML - MR;
const PH = H - MT - MB;

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0]} ${pts[i][1]} ${mx} ${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` T ${last[0]} ${last[1]}`;
  return d;
}

export default function DataGraph({ spec }: { spec: GraphSpec }) {
  const [hover, setHover] = useState<{ si: number; pi: number } | null>(null);
  const x = (v: number) => ML + ((v - spec.xMin) / (spec.xMax - spec.xMin)) * PW;
  const y = (v: number) => MT + PH - ((v - spec.yMin) / (spec.yMax - spec.yMin)) * PH;

  const xTicks = 5;
  const yTicks = 5;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        onMouseLeave={() => setHover(null)}
      >
        {/* gridlines */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = spec.yMin + ((spec.yMax - spec.yMin) * i) / yTicks;
          const yy = y(v);
          return (
            <g key={i}>
              <line x1={ML} y1={yy} x2={W - MR} y2={yy} stroke={T.line} strokeWidth={1} opacity={0.6} />
              <text x={ML - 10} y={yy + 4} textAnchor="end" fontSize={11} fill={T.muted}>
                {Number(v.toFixed(2)).toString()}
              </text>
            </g>
          );
        })}
        {Array.from({ length: xTicks + 1 }).map((_, i) => {
          const v = spec.xMin + ((spec.xMax - spec.xMin) * i) / xTicks;
          const xx = x(v);
          return (
            <g key={i}>
              <line x1={xx} y1={MT} x2={xx} y2={H - MB} stroke={T.line} strokeWidth={1} opacity={0.35} />
              <text x={xx} y={H - MB + 20} textAnchor="middle" fontSize={11} fill={T.muted}>
                {Number(v.toFixed(2)).toString()}
              </text>
            </g>
          );
        })}

        {/* axes */}
        <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke={T.faint} strokeWidth={1.6} />
        <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke={T.faint} strokeWidth={1.6} />
        <text x={ML - 44} y={MT + PH / 2} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={T.text}
          transform={`rotate(-90, ${ML - 44}, ${MT + PH / 2})`}>
          {spec.yLabel}
        </text>
        <text x={ML + PW / 2} y={H - 12} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={T.text}>
          {spec.xLabel}
        </text>

        {/* data */}
        {spec.kind === "line" &&
          spec.series.map((s, si) => {
            const pts = s.points.map(([px, py]) => [x(px), y(py)] as [number, number]);
            return (
              <g key={si}>
                <path d={smoothPath(pts)} fill="none" stroke={s.color} strokeWidth={2.6}
                  strokeDasharray={s.dashed ? "8 6" : undefined} strokeLinecap="round" />
                {pts.map(([px, py], pi) => (
                  <circle
                    key={pi}
                    cx={px} cy={py} r={hover?.si === si && hover?.pi === pi ? 6 : 3.6}
                    fill={s.color} stroke="#0a1628" strokeWidth={1.5}
                    className="cursor-pointer"
                    onMouseEnter={() => setHover({ si, pi })}
                  />
                ))}
              </g>
            );
          })}

        {spec.kind === "bar" &&
          (spec.bars ?? []).map((b, i) => {
            const bw = Math.min(64, (PW / spec.bars!.length) * 0.55);
            const bx = ML + ((i + 0.5) / spec.bars!.length) * PW - bw / 2;
            const by = y(Math.max(b.value, spec.yMin));
            const bh = H - MB - by;
            return (
              <g key={i}>
                <rect x={bx} y={by} width={bw} height={Math.max(bh, 2)} rx={5}
                  fill={b.color ?? T.accent} opacity={0.85} />
                <text x={bx + bw / 2} y={H - MB + 20} textAnchor="middle" fontSize={11} fill={T.muted}>
                  {b.label}
                </text>
                <text x={bx + bw / 2} y={by - 8} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={T.text}>
                  {b.value}
                </text>
              </g>
            );
          })}

        {/* annotations */}
        {spec.annotations?.map((a, i) => (
          <g key={i}>
            <circle cx={x(a.x)} cy={y(a.y)} r={3.5} fill={T.accent} />
            <text x={x(a.x) + 10} y={y(a.y) - 8} fontSize={11.5} fill={T.text} fontWeight={600}>
              {a.text}
            </text>
          </g>
        ))}
      </svg>

      {/* legend + hover readout */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
        {spec.kind === "line" &&
          spec.series.map((s, i) => (
            <span key={i} className="flex items-center gap-2 text-xs" style={{ color: T.muted }}>
              <span className="inline-block h-[3px] w-6 rounded" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        {hover && spec.kind === "line" && (
          <span className="text-xs font-semibold text-cyan-300">
            {spec.series[hover.si].name}: ({spec.series[hover.si].points[hover.pi][0]},{" "}
            {spec.series[hover.si].points[hover.pi][1]})
          </span>
        )}
      </div>
      {spec.note && (
        <p className="mx-auto mt-3 max-w-2xl text-center text-xs leading-relaxed" style={{ color: T.faint }}>
          {spec.note}
        </p>
      )}
    </div>
  );
}
