"use client";

import { useState } from "react";
import type { PunnettSpec } from "./types";
import { T } from "./theme";

export default function PunnettSquare({ spec }: { spec: PunnettSpec }) {
  const [sel, setSel] = useState<[number, number] | null>(null);
  const rows = spec.gametesLeft.length;
  const cols = spec.gametesTop.length;
  const cell = 92;
  const head = 64;
  const W = head + cols * cell + 20;
  const H = head + rows * cell + 20;

  const genotype = (r: number, c: number) => {
    const g = (spec.gametesLeft[r] + spec.gametesTop[c]).split("").sort().join("");
    // normalise order: uppercase first (dominant convention)
    return g;
  };

  const hasDominant = (g: string) => {
    if (!spec.dominant) return false;
    const d = spec.dominant.toUpperCase();
    return g.toUpperCase().includes(d) && g.split("").some((ch) => ch === d);
  };

  const phenotypeOf = (g: string) => {
    if (!spec.dominant) return undefined;
    return hasDominant(g) ? spec.dominantPhenotype : spec.recessivePhenotype;
  };

  const selG = sel ? genotype(sel[0], sel[1]) : null;

  return (
    <div>
      <div className="mb-3 text-center text-sm font-semibold" style={{ color: T.text }}>
        {spec.trait}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[560px]" role="img">
        {/* corner */}
        <text x={head / 2} y={head / 2 + 4} textAnchor="middle" fontSize={11} fill={T.faint} fontWeight={600}>
          ♀ \ ♂
        </text>
        {/* top gametes */}
        {spec.gametesTop.map((g, c) => (
          <text key={c} x={head + c * cell + cell / 2} y={head / 2 + 5} textAnchor="middle"
            fontSize={15} fontWeight={700} fill={T.accent}>
            {g}
          </text>
        ))}
        {/* left gametes */}
        {spec.gametesLeft.map((g, r) => (
          <text key={r} x={head / 2} y={head + r * cell + cell / 2 + 5} textAnchor="middle"
            fontSize={15} fontWeight={700} fill={T.accent}>
            {g}
          </text>
        ))}
        {/* cells */}
        {spec.gametesLeft.map((_, r) =>
          spec.gametesTop.map((_, c) => {
            const g = genotype(r, c);
            const active = sel?.[0] === r && sel?.[1] === c;
            const dom = hasDominant(g);
            return (
              <g key={`${r}-${c}`} onClick={() => setSel(active ? null : [r, c])} className="cursor-pointer">
                <rect
                  x={head + c * cell} y={head + r * cell} width={cell} height={cell}
                  fill={active ? "#14324f" : dom ? "#12303f" : T.chipFill}
                  stroke={active ? T.selected : T.chipStroke}
                  strokeWidth={active ? 2.4 : 1.4}
                />
                <text x={head + c * cell + cell / 2} y={head + r * cell + cell / 2 + 7}
                  textAnchor="middle" fontSize={20} fontWeight={700}
                  fill={dom ? "#7dd3fc" : T.text}>
                  {g}
                </text>
              </g>
            );
          })
        )}
      </svg>

      {spec.ratioNote && (
        <p className="mt-3 text-center text-sm font-medium text-amber-300">{spec.ratioNote}</p>
      )}

      {selG && (
        <div className="mx-auto mt-3 max-w-md rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-4 py-3 text-center">
          <div className="text-lg font-bold text-white">{selG}</div>
          {phenotypeOf(selG) && (
            <p className="mt-1 text-sm text-slate-300">Phenotype: {phenotypeOf(selG)}</p>
          )}
        </div>
      )}
      {!sel && (
        <p className="mt-2 text-center text-xs" style={{ color: T.faint }}>
          Click any cell to read its genotype
        </p>
      )}
    </div>
  );
}
