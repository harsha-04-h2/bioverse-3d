import Link from "next/link";
import { chapters, figures, readyFigureCount } from "@/lib/data";

const FEATURED = [
  {
    id: "animal-cell",
    title: "Animal Cell",
    chapter: "Class 11 · Ch 8",
    blurb: "Organelles you can pull apart and click.",
  },
  {
    id: "dna-helix",
    title: "DNA Double Helix",
    chapter: "Class 12 · Ch 5",
    blurb: "Base pairs, backbones and hydrogen bonds.",
  },
  {
    id: "human-heart",
    title: "Human Heart",
    chapter: "Class 11 · Ch 15",
    blurb: "Four chambers with a cutaway view.",
  },
  {
    id: "flower-ls",
    title: "Flower L.S.",
    chapter: "Class 12 · Ch 1",
    blurb: "Every reproductive part in place.",
  },
  {
    id: "mitosis",
    title: "Mitosis",
    chapter: "Class 11 · Ch 10",
    blurb: "Cell division, animated step by step.",
  },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <circle cx="15" cy="15" r="13" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="15" cy="15" r="5.5" fill="#38bdf8" opacity="0.85" />
        <circle cx="21.5" cy="9.5" r="2.2" fill="#a78bfa" />
        <circle cx="9" cy="20.5" r="1.6" fill="#f472b6" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-white">
        BioVerse <span className="text-cyan-400">3D</span>
      </span>
    </div>
  );
}

export default function LandingPage() {
  const c11 = chapters.filter((c) => c.classLevel === 11);
  const c12 = chapters.filter((c) => c.classLevel === 12);
  const ready = readyFigureCount();

  return (
    <div className="min-h-screen bg-abyss">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-abyss/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/catalog"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Catalog
            </Link>
            <Link
              href="/viewer/animal-cell"
              className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Try a model
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 text-center sm:pt-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-deep px-4 py-1.5 text-xs font-medium text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          NCERT Class 11 + 12 Biology · Interactive 3D
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
          See inside the biology
          <br />
          you&apos;re <span className="text-cyan-400">studying.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          BioVerse 3D turns the NCERT syllabus into interactive 3D models you
          can rotate, dissect and explore — every structure labelled, every
          process animated.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/catalog"
            className="rounded-full bg-cyan-500 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Browse the catalog
          </Link>
          <Link
            href="/viewer/mitosis"
            className="rounded-full border border-slate-700 px-7 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-white"
          >
            Watch mitosis happen
          </Link>
        </div>
        <div className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-8 text-center">
          {[
            [`${chapters.length}`, "Chapters"],
            [`${ready}`, "Interactive models live"],
            ["2", "Classes covered"],
          ].map(([n, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold text-white">{n}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured models */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Live now</h2>
            <p className="mt-1 text-sm text-slate-400">
              Five fully interactive models. Click any structure to learn it.
            </p>
          </div>
          <Link
            href="/catalog"
            className="hidden text-sm font-medium text-cyan-400 hover:text-cyan-300 sm:block"
          >
            Full catalog →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED.map((f) => (
            <Link
              key={f.id}
              href={`/viewer/${f.id}`}
              className="group rounded-2xl border border-slate-800 bg-deep p-6 transition hover:border-cyan-400/50"
            >
              <div className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                {f.chapter}
              </div>
              <h3 className="mt-2 text-xl font-bold text-white group-hover:text-cyan-200">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{f.blurb}</p>
              <div className="mt-4 text-sm font-medium text-cyan-400">
                Open in 3D →
              </div>
            </Link>
          ))}
          <Link
            href="/catalog"
            className="flex min-h-[160px] flex-col justify-center rounded-2xl border border-dashed border-slate-700 bg-deep/50 p-6 transition hover:border-cyan-400/40"
          >
            <h3 className="text-xl font-bold text-slate-200">
              + {chapters.length - ready} chapters in production
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              New models are added as they&apos;re reviewed and published.
            </p>
            <div className="mt-4 text-sm font-medium text-cyan-400">
              See the roadmap →
            </div>
          </Link>
        </div>
      </section>

      {/* Coverage */}
      <section className="border-t border-slate-800/70 bg-deep/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-bold text-white">Full syllabus coverage</h2>
          <p className="mt-1 text-sm text-slate-400">
            Aligned to the NCERT rationalised syllabus — every chapter accounted for.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              { cls: "Class 11", list: c11 },
              { cls: "Class 12", list: c12 },
            ].map(({ cls, list }) => (
              <div
                key={cls}
                className="rounded-2xl border border-slate-800 bg-abyss p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{cls} Biology</h3>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                    {list.length} chapters
                  </span>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {list.map((c) => {
                    const live = figures.some(
                      (f) =>
                        f.classLevel === c.classLevel &&
                        f.chapterNo === c.number &&
                        f.status === "ready"
                    );
                    return (
                      <li
                        key={c.number}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-400">
                          <span className="mr-2 text-slate-600">{c.number}.</span>
                          {c.title}
                        </span>
                        {live && (
                          <span className="ml-2 shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                            Live
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <p>Built for Vidya Mandir Independent PU College.</p>
          <p>Content aligned to the NCERT rationalised syllabus.</p>
        </div>
      </footer>
    </div>
  );
}
