"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BioViewer } from "@/components/viewer/BioViewer";
import DiagramViewer from "@/components/diagrams/DiagramViewer";
import { chapterTitle, figuresForChapter, getFigure } from "@/lib/data";

export default function ViewerPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const figure = getFigure(id);

  if (!figure) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-abyss p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Model not found</h1>
        <p className="text-slate-400">
          There&apos;s no model with the id “{id}”.
        </p>
        <Link
          href="/catalog"
          className="rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  const chTitle = chapterTitle(figure.classLevel, figure.chapterNo);
  const siblings = figuresForChapter(figure.classLevel, figure.chapterNo).filter(
    (f) => f.status === "ready" && f.id !== figure.id
  );

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
            href="/catalog"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Catalog
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8">
        {/* Breadcrumb */}
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/catalog" className="hover:text-cyan-300">
            Catalog
          </Link>
          <span>/</span>
          <span>Class {figure.classLevel}</span>
          <span>/</span>
          <span className="text-slate-300">
            Ch {figure.chapterNo} · {chTitle}
          </span>
        </nav>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{figure.title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {figure.figureNo} · {chTitle}
          </p>
        </div>

        {figure.status === "ready" && figure.diagram ? (
          <>
            <DiagramViewer figure={figure} />
            <p className="mt-4 text-center text-xs text-slate-500">
              Click elements in the diagram to explore · Use the zoom controls
              to inspect details
            </p>
          </>
        ) : figure.status === "ready" && figure.modelKey ? (
          <>
            <BioViewer figure={figure} />
            <p className="mt-4 text-center text-xs text-slate-500">
              Drag to rotate · Scroll or pinch to zoom · Right-drag to pan ·
              Click a structure to learn about it
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-700 bg-deep/50 px-8 py-20 text-center">
            <div className="text-4xl">🧬</div>
            <h2 className="text-xl font-bold text-white">
              This model is in production
            </h2>
            <p className="max-w-md text-sm text-slate-400">
              {figure.description}
            </p>
            <Link
              href="/catalog"
              className="mt-2 rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Explore live models
            </Link>
          </div>
        )}

        {/* Related in chapter */}
        {siblings.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-white">
              More in this chapter
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((s) => (
                <Link
                  key={s.id}
                  href={`/viewer/${s.id}`}
                  className="rounded-2xl border border-slate-800 bg-deep p-5 transition hover:border-cyan-400/50"
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                    {s.figureNo}
                  </div>
                  <h3 className="mt-1.5 font-semibold text-white">{s.title}</h3>
                  <div className="mt-3 text-sm font-medium text-cyan-400">
                    {s.diagram ? "Open diagram →" : "Open in 3D →"}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
