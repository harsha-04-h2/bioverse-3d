"use client";

import { useState } from "react";
import type { PedigreePerson, PedigreeSpec } from "./types";
import { T } from "./theme";

const SYM_R = 17;

function PersonSymbol({ p, active }: { p: PedigreePerson; active: boolean }) {
  const stroke = active ? T.selected : T.text;
  const sw = active ? 2.6 : 1.8;
  const fillMain = p.affected ? "#38bdf8" : "none";
  return (
    <g>
      {p.sex === "m" ? (
        <rect x={p.x - SYM_R} y={p.y - SYM_R} width={SYM_R * 2} height={SYM_R * 2} rx={3}
          fill={fillMain} stroke={stroke} strokeWidth={sw} opacity={0.95} />
      ) : (
        <circle cx={p.x} cy={p.y} r={SYM_R} fill={fillMain} stroke={stroke} strokeWidth={sw} opacity={0.95} />
      )}
      {p.carrier && !p.affected && (
        <circle cx={p.x} cy={p.y} r={4.5} fill="#38bdf8" opacity={0.9} />
      )}
      {p.deceased && (
        <line x1={p.x - SYM_R - 4} y1={p.y + SYM_R + 4} x2={p.x + SYM_R + 4} y2={p.y - SYM_R - 4}
          stroke={T.text} strokeWidth={1.6} />
      )}
      {p.label && (
        <text x={p.x} y={p.y + SYM_R + 16} textAnchor="middle" fontSize={11} fill={T.muted} fontWeight={500}>
          {p.label}
        </text>
      )}
    </g>
  );
}

export default function PedigreeChart({ spec }: { spec: PedigreeSpec }) {
  const [sel, setSel] = useState<string | null>(null);
  const byId = new Map(spec.persons.map((p) => [p.id, p]));
  const selPerson = sel ? byId.get(sel) : undefined;

  return (
    <div>
      <svg viewBox={`0 0 ${spec.width} ${spec.height}`} className="w-full" role="img">
        {/* generation labels */}
        {spec.generations?.map((g, i) => (
          <text key={i} x={26} y={g.y + 5} fontSize={14} fontWeight={700} fill={T.faint}>
            {g.label}
          </text>
        ))}

        {/* mating lines */}
        {spec.matings.map((mt, i) => {
          const a = byId.get(mt.a)!;
          const b = byId.get(mt.b)!;
          const y = a.y;
          const kids = mt.children.map((c) => byId.get(c)!).filter(Boolean);
          const midX = (a.x + b.x) / 2;
          const dropY = y + 34;
          const leftX = Math.min(a.x, b.x);
          const rightX = Math.max(a.x, b.x);
          return (
            <g key={i} stroke={T.faint} strokeWidth={1.6}>
              {/* partner link (symbol edges) */}
              <line x1={leftX + SYM_R} y1={y} x2={rightX - SYM_R} y2={y} />
              {/* drop to sibship */}
              <line x1={midX} y1={y} x2={midX} y2={dropY} />
              {kids.length > 0 && (
                <>
                  <line
                    x1={Math.min(...kids.map((k) => k.x))}
                    y1={dropY}
                    x2={Math.max(...kids.map((k) => k.x))}
                    y2={dropY}
                  />
                  {kids.map((k) => (
                    <line key={k.id} x1={k.x} y1={dropY} x2={k.x} y2={k.y - SYM_R} />
                  ))}
                </>
              )}
            </g>
          );
        })}

        {/* persons */}
        {spec.persons.map((p) => (
          <g key={p.id} onClick={() => setSel(sel === p.id ? null : p.id)} className="cursor-pointer">
            <PersonSymbol p={p} active={sel === p.id} />
          </g>
        ))}
      </svg>

      {/* legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs" style={{ color: T.muted }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 border-[1.5px] border-slate-200" /> Male
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border-[1.5px] border-slate-200" /> Female
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-sky-400" /> Affected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border-[1.5px] border-slate-200">
            <span className="h-1 w-1 rounded-full bg-sky-400" />
          </span>{" "}
          Carrier
        </span>
      </div>

      {selPerson?.info && (
        <div className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-4 py-3">
          <div className="text-sm font-semibold text-cyan-300">
            {selPerson.label ?? (selPerson.sex === "m" ? "Male" : "Female")}
            {selPerson.affected ? " — affected" : selPerson.carrier ? " — carrier" : " — unaffected"}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{selPerson.info}</p>
        </div>
      )}
      {spec.note && (
        <p className="mx-auto mt-3 max-w-2xl text-center text-xs leading-relaxed" style={{ color: T.faint }}>
          {spec.note}
        </p>
      )}
    </div>
  );
}
