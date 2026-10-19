"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useProgress } from "@react-three/drei";
import * as THREE from "three";
import type { FigureDef } from "@/lib/data";
import { getModelComponent } from "../models/registry";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

/* ---------------------------------- helpers --------------------------------- */

function CameraRig({
  request,
  onDone,
}: {
  request: [number, number, number] | null;
  onDone: () => void;
}) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as {
    update: () => void;
  } | null;
  const target = useRef<THREE.Vector3 | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (request) target.current = new THREE.Vector3(request[0], request[1], request[2]);
  }, [request]);

  useFrame(() => {
    const t = target.current;
    if (!t) return;
    camera.position.lerp(t, 0.14);
    if (camera.position.distanceTo(t) < 0.03) {
      target.current = null;
      doneRef.current();
    }
    controls?.update();
  });

  return null;
}

function ProgressReporter({ onDone }: { onDone: () => void }) {
  const { progress } = useProgress();
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    if (progress >= 100) doneRef.current();
  }, [progress]);
  return null;
}

function ControlButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 backdrop-blur transition ${
        active
          ? "bg-cyan-500/20 text-cyan-200 ring-cyan-400/60"
          : "bg-slate-950/60 text-slate-300 ring-slate-700 hover:text-white hover:ring-cyan-400/50"
      }`}
    >
      {children}
    </button>
  );
}

/* --------------------------------- main view -------------------------------- */

export function BioViewer({ figure }: { figure: FigureDef }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [explode, setExplode] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cutaway, setCutaway] = useState(false);
  const [camRequest, setCamRequest] = useState<[number, number, number] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  const anim = figure.animation;
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  const Model = useMemo(
    () => (figure.modelKey ? getModelComponent(figure.modelKey) : null),
    [figure.modelKey]
  );

  // Reset state when switching figures
  useEffect(() => {
    setExplode(0);
    setSelectedId(null);
    setCutaway(false);
    setTime(0);
    setPlaying(true);
    setSpeed(1);
    setModelReady(false);
    setCamRequest(figure.camera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [figure.id]);

  // Animation clock — 30fps, deterministic: the model is a pure function of `time`
  useEffect(() => {
    if (!anim || !playing) return;
    const id = setInterval(() => {
      setTime((t) => {
        const nt = t + (1 / 30) * speed;
        return nt >= anim.duration ? 0 : nt;
      });
    }, 1000 / 30);
    return () => clearInterval(id);
  }, [anim, playing, speed]);

  // Keyboard: space = play/pause, arrows = scrub
  useEffect(() => {
    if (!anim) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "ArrowRight") {
        setTime((t) => Math.min(anim.duration - 0.01, t + 1));
      } else if (e.key === "ArrowLeft") {
        setTime((t) => Math.max(0, t - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [anim]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen();
  };

  const selectedLabel =
    figure.labels.find((l) => l.id === selectedId) ?? null;
  const stages = anim?.stages;
  const currentStage =
    stages?.find((s) => time >= s.start && time < s.end) ??
    (stages ? stages[stages.length - 1] : null);

  const jumpToStage = (start: number, name: string) => {
    setTime(start + 0.05);
    const labelId = name.split(" ")[0].toLowerCase();
    if (figure.labels.some((l) => l.id === labelId)) setSelectedId(labelId);
  };

  const presets: { name: string; pos: [number, number, number] }[] = [
    { name: "Front", pos: [0, 0.6, 7.4] },
    { name: "Side", pos: [7.4, 0.6, 0] },
    { name: "Top", pos: [0.1, 7.8, 0.8] },
    { name: "Reset", pos: figure.camera },
  ];

  return (
    <div
      ref={wrapRef}
      className="overflow-hidden rounded-2xl border border-slate-800 bg-abyss"
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Canvas column */}
        <div>
          <div className="relative h-[54vh] min-h-[380px] lg:h-[66vh]">
            <WebGLErrorBoundary>
              <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: figure.camera, fov: 42 }}
                gl={{ antialias: true, localClippingEnabled: true }}
                onPointerMissed={() => setSelectedId(null)}
              >
                <color attach="background" args={["#0a1628"]} />
                <ambientLight intensity={0.55} />
                <directionalLight position={[6, 8, 4]} intensity={1.5} />
                <directionalLight
                  position={[-6, 3, -5]}
                  intensity={0.5}
                  color="#7dd3fc"
                />
                <Suspense fallback={null}>
                  <ProgressReporter onDone={() => setModelReady(true)} />
                  {Model ? (
                    <Model
                      explode={explode}
                      showLabels={showLabels}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                      animTime={time}
                      cutaway={cutaway}
                    />
                  ) : null}
                  <ContactShadows
                    position={[0, -2.7, 0]}
                    opacity={0.55}
                    scale={14}
                    blur={2.6}
                    far={5}
                    color="#010813"
                  />
                </Suspense>
                <OrbitControls
                  makeDefault
                  enableDamping
                  dampingFactor={0.08}
                  minDistance={2.5}
                  maxDistance={16}
                />
                <CameraRig
                  request={camRequest}
                  onDone={() => setCamRequest(null)}
                />
              </Canvas>
            </WebGLErrorBoundary>

            {/* Loading overlay */}
            {!modelReady && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-abyss">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
                <p className="text-sm text-slate-400">Preparing 3D model…</p>
              </div>
            )}

            {/* Top-left: figure chip */}
            <div className="absolute left-4 top-4 rounded-full bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300 ring-1 ring-slate-700 backdrop-blur">
              {figure.figureNo} · {figure.vizType}
            </div>

            {/* Top-right: view controls */}
            <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
              <ControlButton
                active={showLabels}
                onClick={() => setShowLabels((v) => !v)}
                title="Toggle labels"
              >
                Labels
              </ControlButton>
              {figure.cutaway && (
                <ControlButton
                  active={cutaway}
                  onClick={() => setCutaway((v) => !v)}
                  title="Cutaway view"
                >
                  Cutaway
                </ControlButton>
              )}
              {presets.map((p) => (
                <ControlButton
                  key={p.name}
                  onClick={() => setCamRequest(p.pos)}
                  title={`${p.name} view`}
                >
                  {p.name}
                </ControlButton>
              ))}
              <ControlButton onClick={toggleFullscreen} title="Fullscreen">
                {isFullscreen ? "Exit ⤢" : "⤢ Full"}
              </ControlButton>
            </div>

            {/* Bottom-left: explode slider */}
            {figure.explode && (
              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-slate-950/60 px-4 py-2 ring-1 ring-slate-700 backdrop-blur">
                <span className="text-xs font-medium text-slate-300">
                  Exploded view
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(explode * 100)}
                  onChange={(e) => setExplode(Number(e.target.value) / 100)}
                  className="h-1 w-28 cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-400"
                  aria-label="Exploded view amount"
                />
              </div>
            )}
          </div>

          {/* Timeline (animated figures) */}
          {anim && (
            <div className="border-t border-slate-800 bg-deep/50 p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/40 transition hover:bg-cyan-500/25"
                  title={playing ? "Pause" : "Play"}
                  aria-label={playing ? "Pause animation" : "Play animation"}
                >
                  {playing ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <rect x="2" y="1" width="3.5" height="12" rx="1" />
                      <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <path d="M3 1.5v11l9-5.5z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setTime(0)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 ring-1 ring-slate-700 transition hover:text-white"
                  title="Restart"
                  aria-label="Restart animation"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 7a5 5 0 1 1 1.5 3.6M2 7V3.5M2 7h3.5" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="w-24 shrink-0 text-xs tabular-nums text-slate-400">
                  {time.toFixed(1)}s / {anim.duration}s
                </span>
                <input
                  type="range"
                  min={0}
                  max={anim.duration}
                  step={0.1}
                  value={time}
                  onChange={(e) => setTime(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-400"
                  aria-label="Animation timeline"
                />
                <div className="flex shrink-0 gap-1">
                  {[0.5, 1, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition ${
                        speed === s
                          ? "bg-cyan-500/20 text-cyan-200 ring-cyan-400/60"
                          : "bg-slate-800 text-slate-400 ring-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
              {stages && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {stages.map((s) => {
                    const active = currentStage?.name === s.name;
                    return (
                      <button
                        key={s.name}
                        onClick={() => jumpToStage(s.start, s.name)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                          active
                            ? "bg-cyan-500/20 text-cyan-100 ring-cyan-400/60"
                            : "bg-slate-800/70 text-slate-400 ring-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              )}
              {currentStage && (
                <p className="mt-2 text-sm text-slate-300">
                  <span className="font-semibold text-cyan-300">
                    {currentStage.name}:{" "}
                  </span>
                  {currentStage.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Info panel */}
        <aside className="border-t border-slate-800 bg-deep/40 p-5 lg:border-l lg:border-t-0">
          {selectedLabel ? (
            <div className="mb-5 rounded-xl border border-cyan-400/30 bg-cyan-500/5 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-cyan-200">
                  {selectedLabel.name}
                </h3>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-slate-500 hover:text-slate-200"
                  aria-label="Clear selection"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                {selectedLabel.description}
              </p>
            </div>
          ) : (
            <div className="mb-5">
              <h3 className="font-semibold text-slate-100">About this model</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                {figure.description}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Tip: click any structure in the 3D view to learn about it.
              </p>
            </div>
          )}

          {figure.labels.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Structures
              </h4>
              <div className="flex flex-col gap-1.5">
                {figure.labels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() =>
                      setSelectedId(selectedId === l.id ? null : l.id)
                    }
                    className={`rounded-lg px-3 py-2 text-left text-sm ring-1 transition ${
                      selectedId === l.id
                        ? "bg-cyan-500/15 text-cyan-100 ring-cyan-400/50"
                        : "bg-slate-800/50 text-slate-300 ring-slate-700/60 hover:text-white hover:ring-slate-600"
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
