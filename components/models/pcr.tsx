'use client';

import { type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Fig 9.6 — polymerase chain reaction (total 24 s):
   0–6   denaturation ≈ 94 °C: strands separate
   6–12  annealing ≈ 54 °C: primers bind
   12–18 extension ≈ 72 °C: Taq polymerase extends → two duplexes
   18–24 amplification: 2ⁿ counter doubling to 32 copies */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

const BASE_COLORS: Record<string, string> = { A: '#34d399', T: '#f87171', G: '#60a5fa', C: '#fbbf24' };
const SEQ = 'ATGCCGTAAC'.split(''); // 10 bp template strand (5'→3' top→bottom)
const COMP = (b: string) => ({ A: 'T', T: 'A', G: 'C', C: 'G' }[b] ?? 'A');
const RUNGS = 10;
const Y = (j: number) => -1.98 + j * 0.44;

const STAGES = [
  { id: 'denaturation', name: 'Denaturation ≈ 94 °C', start: 0, end: 6, desc: 'Heat breaks the hydrogen bonds, so the two template strands drift apart.' },
  { id: 'annealing', name: 'Annealing ≈ 54 °C', start: 6, end: 12, desc: 'Cooling lets short primer pieces latch onto the exposed single strands.' },
  { id: 'extension', name: 'Extension ≈ 72 °C', start: 12, end: 18, desc: 'Heat-proof Taq polymerase builds a new partner strand off each primer.' },
  { id: 'amplification', name: 'Amplification · 2ⁿ copies', start: 18, end: 24, desc: 'Every cycle doubles the DNA — after n cycles there are 2ⁿ copies of the target.' },
];
function stageIndex(t: number): number {
  if (t < 6) return 0;
  if (t < 12) return 1;
  if (t < 18) return 2;
  return 3;
}

function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected ? { emissive: '#38bdf8', emissiveIntensity: 0.45 } : { emissive: '#000000', emissiveIntensity: 0 };
}

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

function Clickable({
  id, onSelect, children,
}: { id: string; onSelect: (id: string | null) => void; children: ReactNode }): JSX.Element {
  return (
    <group
      onClick={(e) => { e.stopPropagation(); onSelect(id); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {children}
    </group>
  );
}

/** Vertical backbone rail along y. */
function VRail({ x, y0, y1, color, opacity, selected }: {
  x: number; y0: number; y1: number; color: string; opacity: number; selected: boolean;
}): JSX.Element {
  return (
    <mesh position={[x, (y0 + y1) / 2, 0]}>
      <cylinderGeometry args={[0.07, 0.07, y1 - y0, 10]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.45} metalness={0.1} {...emissiveProps(selected)} />
    </mesh>
  );
}

/** One base-pair rung between two rails at x0 (left) and x1 (right). */
function Rung({ j, x0, x1, opacity, selectedId }: {
  j: number; x0: number; x1: number; opacity: number; selectedId: string | null;
}): JSX.Element {
  const selT = selectedId === 'template-dna';
  const mid = (x0 + x1) / 2;
  return (
    <group position={[0, Y(j), 0]}>
      <mesh position={[(x0 + mid) / 2, 0, 0]}>
        <boxGeometry args={[Math.abs(mid - x0), 0.15, 0.15]} />
        <meshStandardMaterial color={BASE_COLORS[SEQ[j]]} transparent opacity={opacity} roughness={0.45} {...emissiveProps(selT)} />
      </mesh>
      <mesh position={[(x1 + mid) / 2, 0, 0]}>
        <boxGeometry args={[Math.abs(mid - x1), 0.15, 0.15]} />
        <meshStandardMaterial color={BASE_COLORS[COMP(SEQ[j])]} transparent opacity={opacity} roughness={0.45} {...emissiveProps(selT)} />
      </mesh>
    </group>
  );
}

export default function PCR(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stageIndex(t);
  const sel = (id: string) => selectedId === id;

  const denK = smooth(t / 5);                    // strands separate
  const annK = smooth((t - 6) / 3);              // primers fly in
  const extK = smooth((t - 12) / 5);             // extension progress 0..1
  const bigOp = 1 - smooth((t - 17.6) / 0.8);    // big DNA fades during amplification
  const sep = 1.5 * denK + explode * 0.6;

  const ax = -0.45 - sep;   // template A rail x
  const bx = 0.45 + sep;    // template B rail x
  const grown = Math.floor(extK * RUNGS);       // rungs of new strand built so far
  const extOn = t >= 12 && t < 18;

  // New-strand geometry: on A, primer sits at bottom (j 0..2), new rail grows upward.
  const newAx = ax + 0.9;   // new strand rail x for template A
  const newBx = bx - 0.9;   // new strand rail x for template B
  const taqAy = extOn ? -1.98 + 2 * 0.44 + extK * 7 * 0.44 : -1.1;
  const taqBy = extOn ? 1.98 - 2 * 0.44 - extK * 7 * 0.44 : 1.1;

  const cycle = Math.min(4, Math.floor((t - 18) / 6 * 5));
  const copies = 2 ** (cycle + 1);

  return (
    <group
      onClick={(e) => { e.stopPropagation(); onSelect(STAGES[si].id); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {showLabels && (
        <Html position={[0, 3.2, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{STAGES[si].name}</span>
        </Html>
      )}

      {/* ---- template strands ---- */}
      <group visible={bigOp > 0.01}>
        <Clickable id="template-dna" onSelect={onSelect}>
          <VRail x={ax} y0={-2.2} y1={2.2} color="#22d3ee" opacity={bigOp} selected={sel('template-dna')} />
          <VRail x={bx} y0={-2.2} y1={2.2} color="#22d3ee" opacity={bigOp} selected={sel('template-dna')} />
        </Clickable>
        {/* intact rungs while annealed */}
        {denK < 0.5 &&
          Array.from({ length: RUNGS }, (_, j) => (
            <Rung key={j} j={j} x0={ax} x1={bx} opacity={bigOp * (1 - denK)} selectedId={selectedId} />
          ))}
        {/* separated single strands: bases face inward */}
        {denK >= 0.5 && (
          <Clickable id="template-dna" onSelect={onSelect}>
            {Array.from({ length: RUNGS }, (_, j) => (
              <group key={j} position={[0, Y(j), 0]}>
                <mesh position={[ax + 0.22, 0, 0]}>
                  <boxGeometry args={[0.3, 0.15, 0.15]} />
                  <meshStandardMaterial color={BASE_COLORS[SEQ[j]]} transparent opacity={bigOp} roughness={0.45} {...emissiveProps(sel('template-dna'))} />
                </mesh>
                <mesh position={[bx - 0.22, 0, 0]}>
                  <boxGeometry args={[0.3, 0.15, 0.15]} />
                  <meshStandardMaterial color={BASE_COLORS[COMP(SEQ[j])]} transparent opacity={bigOp} roughness={0.45} {...emissiveProps(sel('template-dna'))} />
                </mesh>
              </group>
            ))}
          </Clickable>
        )}
        {showLabels && t < 6 && <PartLabel position={[0, -2.75, 0]} name="Template DNA" />}
      </group>

      {/* ---- primers ---- */}
      {annK > 0.01 && (
        <Clickable id="primers" onSelect={onSelect}>
          {/* primer 1: binds bottom of strand A, rail to its right */}
          <group position={[ax + 3 * (1 - annK), 0, 0]}>
            <VRail x={0.9} y0={Y(0) - 0.25} y1={Y(2) + 0.25} color="#f472b6" opacity={annK * bigOp} selected={sel('primers')} />
            {[0, 1, 2].map((j) => (
              <mesh key={j} position={[0.62, Y(j), 0]}>
                <boxGeometry args={[0.3, 0.15, 0.15]} />
                <meshStandardMaterial color={BASE_COLORS[COMP(SEQ[j])]} transparent opacity={annK * bigOp} roughness={0.45} {...emissiveProps(sel('primers'))} />
              </mesh>
            ))}
          </group>
          {/* primer 2: binds top of strand B, rail to its left */}
          <group position={[bx - 3 * (1 - annK), 0, 0]}>
            <VRail x={-0.9} y0={Y(7) - 0.25} y1={Y(9) + 0.25} color="#f472b6" opacity={annK * bigOp} selected={sel('primers')} />
            {[7, 8, 9].map((j) => (
              <mesh key={j} position={[-0.62, Y(j), 0]}>
                <boxGeometry args={[0.3, 0.15, 0.15]} />
                <meshStandardMaterial color={BASE_COLORS[COMP(SEQ[j])]} transparent opacity={annK * bigOp} roughness={0.45} {...emissiveProps(sel('primers'))} />
              </mesh>
            ))}
          </group>
          {showLabels && t >= 6 && t < 12 && <PartLabel position={[0, 2.75, 0]} name="Primers anneal" />}
        </Clickable>
      )}

      {/* ---- extension: new strands grow from primers ---- */}
      {extK > 0.01 && (
        <group visible={bigOp > 0.01}>
          <Clickable id="template-dna" onSelect={onSelect}>
            {/* new strand on A: rail grows upward */}
            <VRail x={newAx} y0={Y(0) - 0.25} y1={Y(0) + (grown - 1) * 0.44 + 0.25} color="#a78bfa" opacity={bigOp} selected={false} />
            {Array.from({ length: grown }, (_, j) => (
              <mesh key={j} position={[(ax + newAx) / 2 + 0.06, Y(j), 0]}>
                <boxGeometry args={[0.68, 0.15, 0.15]} />
                <meshStandardMaterial color={BASE_COLORS[COMP(SEQ[j])]} transparent opacity={bigOp} roughness={0.45} />
              </mesh>
            ))}
            {/* new strand on B: rail grows downward */}
            <VRail x={newBx} y0={Y(RUNGS - grown) - 0.25} y1={Y(9) + 0.25} color="#a78bfa" opacity={bigOp} selected={false} />
            {Array.from({ length: grown }, (_, k) => {
              const j = RUNGS - 1 - k;
              return (
                <mesh key={k} position={[(bx + newBx) / 2 - 0.06, Y(j), 0]}>
                  <boxGeometry args={[0.68, 0.15, 0.15]} />
                  <meshStandardMaterial color={BASE_COLORS[SEQ[j]]} transparent opacity={bigOp} roughness={0.45} />
                </mesh>
              );
            })}
          </Clickable>
          {/* Taq polymerase blobs riding the growth fronts */}
          <Clickable id="taq" onSelect={onSelect}>
            {extOn && (
              <group>
                <mesh position={[newAx, taqAy, 0.35]} scale={1 + 0.08 * Math.sin(t * 8)}>
                  <sphereGeometry args={[0.34, 20, 14]} />
                  <meshStandardMaterial color="#fb923c" transparent opacity={bigOp} roughness={0.35} {...emissiveProps(sel('taq'))} />
                </mesh>
                <mesh position={[newBx, taqBy, 0.35]} scale={1 + 0.08 * Math.sin(t * 8 + 2)}>
                  <sphereGeometry args={[0.34, 20, 14]} />
                  <meshStandardMaterial color="#fb923c" transparent opacity={bigOp} roughness={0.35} {...emissiveProps(sel('taq'))} />
                </mesh>
              </group>
            )}
          </Clickable>
          {showLabels && t >= 12 && t < 18 && <PartLabel position={[newAx + 0.9, taqAy, 0]} name="Taq polymerase extends" />}
        </group>
      )}

      {/* ---- amplification: 2ⁿ copy counter ---- */}
      {t >= 18 && (
        <group>
          {showLabels && (
            <Html position={[0, 2.6, 0]} center zIndexRange={[40, 0]} className="bv-label">
              <span>{`Cycle ${cycle + 1} → 2^${cycle + 1} = ${copies} copies`}</span>
            </Html>
          )}
          <Clickable id="product" onSelect={onSelect}>
          {Array.from({ length: 32 }, (_, i) => {
            const c = i % 8;
            const r = Math.floor(i / 8);
            return (
              <group key={i} position={[(c - 3.5) * 0.78, (1.5 - r) * 0.85 - 0.2, 0]} visible={i < copies}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.62, 8]} />
                  <meshStandardMaterial
                    color="#22d3ee" roughness={0.45}
                    emissive={sel('product') ? '#38bdf8' : '#000000'} emissiveIntensity={sel('product') ? 0.45 : 0}
                  />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.62, 0.14, 0.14]} />
                  <meshStandardMaterial
                    color={i % 2 ? '#f87171' : '#34d399'} roughness={0.45}
                    emissive={sel('product') ? '#38bdf8' : '#000000'} emissiveIntensity={sel('product') ? 0.45 : 0}
                  />
                </mesh>
              </group>
            );
          })}
        </Clickable>
        </group>
      )}
    </group>
  );
}
