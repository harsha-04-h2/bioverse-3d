"use client";

import { useState } from "react";
import { ACCENTS, type TimelineSpec } from "./types";
import { T } from "./theme";

export default function Timeline({ spec }: { spec: TimelineSpec }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative ml-4 border-l-2 pl-8" style={{ borderColor: T.line }}>
        {spec.events.map((e, i) => {
          const accent = ACCENTS[e.accent ?? "cyan"];
          const isOpen = open === i;
          return (
            <div key={i} className="relative pb-7 last:pb-1">
              {/* node dot */}
              <span
                className="absolute top-1 h-4 w-4 rounded-full border-[2.5px]"
                style={{
                  left: "-41px",
                  borderColor: accent,
                  background: isOpen ? accent : "#0a1628",
                }}
              />
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full rounded-xl border p-4 text-left transition"
                style={{
                  borderColor: isOpen ? accent : T.panelBorder,
                  background: isOpen ? "#10294a" : T.panel,
                }}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: accent + "22", color: accent }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[15px] font-bold" style={{ color: T.text }}>
                    {e.title}
                  </span>
                  {e.tag && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: accent + "1e", color: accent }}
                    >
                      {e.tag}
                    </span>
                  )}
                </div>
                {e.detail && (
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: T.muted }}>
                    {e.detail}
                  </p>
                )}
                {isOpen && e.info && (
                  <p className="mt-2.5 border-t pt-2.5 text-sm leading-relaxed text-slate-200"
                    style={{ borderColor: T.line }}>
                    {e.info}
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>
      {spec.events.some((e) => e.info) && (
        <p className="mt-2 text-center text-xs" style={{ color: T.faint }}>
          Click an event to expand it
        </p>
      )}
    </div>
  );
}
