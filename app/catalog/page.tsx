"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { chapters, figuresForChapter, readyFigureCount } from "@/lib/data";

export default function CatalogPage() {
  const [tab, setTab] = useState<11 | 12>(11);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chapters.filter((c) => {
      if (c.classLevel !== tab) return false;
      if (!q) return true;
      const figs = figuresForChapter(c.classLevel, c.number);
      return (
        c.title.toLowerCase().includes(q) ||
        c.unit.toLowerCase().includes(q) ||
        figs.some((f) => f.title.toLowerCase().includes(q))
      );
    });
  }, [tab, query]);

  // Group by unit, preserving chapter order
  const grouped = useMemo(() => {
    const groups: { unit: string; items: typeof list }[] = [];
    for (const c of list) {
      const g = groups.find((g) => g.unit === c.unit);
      if (g) g.items.push(c);
      else groups.push({ unit: c.unit, items: [c] });
    }
    return groups;
  }, [list]);

  return (
    <div className="min-h-screen bg-abyss">
      <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-abyss/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="13" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="15" cy="15" r="5.5" fill="#38bdf8" opacity="0.85" />
              <circle cx="21.5" cy="9.5" r="2.2" fill="#a78bfa" />
              <circle cx="9" cy="20.5" r="1.6" fill="#f472b6" />
            </svg>
            <span className="text-lg font-bold tracking-tight text-white">
              BioVerse <span className="text-cyan-400">3D</span>
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10">
        <h1 className="text-3xl font-bold text-white">Chapter catalog</h1>
        <p className="mt-2 text-slate-400">
          {readyFigureCount()} interactive models live ·{" "}
          {chapters.length} chapters across Class 11 &amp; 12
        </p>

        {/* Tabs + search */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-full border border-slate-700 bg-deep p-1">
            {([11, 12] as const).map((c) => (
              <button
                key={c}
                onClick={() => setTab(c)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  tab === c
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Class {c}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters or topics…"
            className="w-full rounded-full border border-slate-700 bg-deep px-5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-400/60 focus:outline-none sm:w-72"
          />
        </div>

        {/* Chapter groups */}
        {grouped.length === 0 && (
          <div className="mt-16 text-center text-slate-500">
            No chapters match “{query}”.
          </div>
        )}
        {grouped.map((g) => (
          <section key={g.unit} className="mt-10">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {g.unit}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((c) => {
                const figs = figuresForChapter(c.classLevel, c.number);
                const ready = figs.filter((f) => f.status === "ready");
                return (
                  <div
                    key={`${c.classLevel}-${c.number}`}
                    className="rounded-2xl border border-slate-800 bg-deep p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-sm font-bold text-cyan-300 ring-1 ring-cyan-400/30">
                        {c.number}
                      </div>
                      {ready.length > 0 ? (
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                          {ready.length} live
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-semibold leading-snug text-white">
                      {c.title}
                    </h3>
                    <div className="mt-4 flex flex-col gap-2">
                      {ready.map((f) => (
                        <Link
                          key={f.id}
                          href={`/viewer/${f.id}`}
                          className="rounded-xl border border-cyan-400/25 bg-cyan-500/5 px-3.5 py-2.5 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
                        >
                          {f.title} →
                        </Link>
                      ))}
                      {ready.length === 0 && (
                        <p className="text-xs text-slate-500">
                          Interactive models for this chapter are in production.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
