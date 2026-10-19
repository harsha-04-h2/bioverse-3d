'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Explode offset for a part: base + normalize(base) * explode * 1.4. */
function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

/** Emissive highlight applied to a part's materials when it is selected. */
function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected
    ? { emissive: '#38bdf8', emissiveIntensity: 0.4 }
    : { emissive: '#000000', emissiveIntensity: 0 };
}

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

function SmallLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label bv-label-sm">
      <span>{name}</span>
    </Html>
  );
}

function PartGroup({
  id,
  position,
  onSelect,
  children,
}: {
  id: string;
  position: [number, number, number];
  onSelect: (id: string | null) => void;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {children}
    </group>
  );
}

/** Animation loop: 18 s, three 6 s stages. */
const LOOP = 18;
const R = 1.7;
const PACKETS = 16;
const D2R = Math.PI / 180;

const STAGES = [
  {
    id: 'carboxylation',
    name: 'Carboxylation',
    range: '0–6 s',
    desc: 'RuBisCO pins CO₂ onto RuBP; the 6-carbon product splits into two 3-PGA.',
  },
  {
    id: 'reduction',
    name: 'Reduction',
    range: '6–12 s',
    desc: 'ATP and NADPH spend their energy turning 3-PGA into G3P — one G3P leaves to build sugar.',
  },
  {
    id: 'regeneration',
    name: 'Regeneration',
    range: '12–18 s',
    desc: 'The remaining G3P is rearranged back into RuBP, rearming the cycle.',
  },
];

function stageIndex(t: number): number {
  return Math.min(2, Math.floor(t / 6));
}

function ringXY(deg: number): [number, number] {
  return [R * Math.cos(deg * D2R), R * Math.sin(deg * D2R)];
}

/** Molecule carried on a ring segment: 0 = 3-PGA, 1 = G3P, 2 = RuBP. */
function segmentOf(deg: number): number {
  const a = ((deg - 90) % 360 + 360) % 360;
  return Math.floor(a / 120);
}
const SEG_COLOR = ['#fbbf24', '#4ade80', '#38bdf8'];

const NODES = [
  { id: 'carboxylation', deg: 90, color: '#16a34a' },
  { id: 'reduction', deg: 210, color: '#0d9488' },
  { id: 'regeneration', deg: 330, color: '#7c3aed' },
];

export default function CalvinCycle(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const t = animTime % LOOP;
  const si = stageIndex(t);
  const stageT = t - si * 6;

  // Molecule packets circulating the ring (20°/s = one lap per loop).
  const packets = useMemo(() => {
    const out: { pos: [number, number, number]; seg: number }[] = [];
    for (let j = 0; j < PACKETS; j++) {
      const deg = (90 + t * 20 + j * (360 / PACKETS)) % 360;
      const [x, y] = ringXY(deg);
      out.push({ pos: [x, y, 0], seg: segmentOf(deg) });
    }
    return out;
  }, [t]);

  // CO2 drifting into the carboxylation node (stage 0).
  const co2 = useMemo(
    () =>
      si === 0
        ? Array.from({ length: 3 }, (_, i) => {
            const prog = ((stageT / 6 + i / 3) % 1) * 0.999;
            return {
              x: 2.7 - prog * 2.55,
              y: 2.7 - prog * 1.05,
              op: 0.95 * (1 - prog * 0.5),
            };
          })
        : [],
    [si, stageT],
  );

  // ATP + NADPH flying in from the light reactions (stage 1).
  const energyIn = useMemo(() => {
    const [nx, ny] = ringXY(210);
    return si === 1
      ? Array.from({ length: 3 }, (_, i) => {
          const prog = ((stageT / 6 + i / 3) % 1) * 0.999;
          return {
            x: 0.6 + (nx - 0.6) * prog,
            y: 3.1 + (ny - 3.1) * prog,
            color: i === 2 ? '#a3e635' : '#fde047',
            op: 0.95,
          };
        })
      : [];
  }, [si, stageT]);

  // One G3P leaves the ring toward sugar synthesis (stage 1).
  const g3pOut = useMemo(
    () =>
      si === 1
        ? Array.from({ length: 2 }, (_, i) => {
            const prog = ((stageT / 6 + i / 2) % 1) * 0.999;
            const [nx, ny] = ringXY(210);
            return { x: nx, y: ny + prog * 2.6, op: 1 - prog * 0.7 };
          })
        : [],
    [si, stageT],
  );

  const nodePulse = (k: number) => (si === k ? 0.95 : 0.18);

  return (
    <group>
      {/* ---- stage banner ---- */}
      {showLabels && (
        <Html position={[0, 3.35, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>
            {STAGES[si].name} · {STAGES[si].range}
          </span>
        </Html>
      )}
      {showLabels && (
        <Html position={[0, 2.92, 0]} center zIndexRange={[40, 0]} className="bv-label bv-label-sm">
          <span>{STAGES[si].desc}</span>
        </Html>
      )}

      {/* ---- ring conduit ---- */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[R, 0.05, 10, 96]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.42} roughness={0.5} metalness={0.1} />
      </mesh>

      {/* ---- circulating molecule packets ---- */}
      {packets.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color={SEG_COLOR[p.seg]} emissive={SEG_COLOR[p.seg]} emissiveIntensity={0.55} roughness={0.35} metalness={0.08} />
        </mesh>
      ))}

      {/* ---- stage nodes ---- */}
      {NODES.map((n, k) => {
        const [nx, ny] = ringXY(n.deg);
        return (
          <PartGroup key={n.id} id={n.id} position={explodeOffset([nx * 0.7, ny * 0.7, 0], explode)} onSelect={onSelect}>
            <group position={[nx, ny, 0]}>
              {k === 0 ? (
                <mesh>
                  <icosahedronGeometry args={[0.42, 1]} />
                  <meshStandardMaterial
                    color={n.color}
                    emissive={sel(n.id) ? '#38bdf8' : '#22c55e'}
                    emissiveIntensity={sel(n.id) ? 0.4 : nodePulse(k)}
                    roughness={0.4}
                    metalness={0.12}
                  />
                </mesh>
              ) : (
                <mesh>
                  <boxGeometry args={[0.56, 0.56, 0.56]} />
                  <meshStandardMaterial
                    color={n.color}
                    emissive={sel(n.id) ? '#38bdf8' : n.color}
                    emissiveIntensity={sel(n.id) ? 0.4 : nodePulse(k)}
                    roughness={0.4}
                    metalness={0.12}
                  />
                </mesh>
              )}
              {showLabels && <PartLabel position={[0, 0.72, 0]} name={STAGES[k].name} />}
            </group>
          </PartGroup>
        );
      })}

      {/* ---- molecule legend labels on segments ---- */}
      {showLabels && (
        <>
          <SmallLabel position={[ringXY(150)[0] * 1.28, ringXY(150)[1] * 1.28, 0]} name="3-PGA" />
          <SmallLabel position={[ringXY(270)[0] * 1.28, ringXY(270)[1] * 1.28, 0]} name="G3P" />
          <SmallLabel position={[ringXY(30)[0] * 1.28, ringXY(30)[1] * 1.28, 0]} name="RuBP" />
          <SmallLabel position={[0, 2.35, 0]} name="RuBisCO" />
        </>
      )}

      {/* ---- CO2 inflow ---- */}
      {co2.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color="#93c5fd" transparent opacity={c.op} emissive="#60a5fa" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {showLabels && si === 0 && <SmallLabel position={[2.75, 2.35, 0]} name="CO₂ in" />}

      {/* ---- ATP + NADPH inflow ---- */}
      {energyIn.map((e, i) => (
        <mesh key={i} position={[e.x, e.y, 0]}>
          <sphereGeometry args={[0.08, 10, 10]} />
          <meshStandardMaterial color={e.color} transparent opacity={e.op} emissive={e.color} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {showLabels && si === 1 && <SmallLabel position={[0.75, 2.85, 0]} name="ATP + NADPH" />}

      {/* ---- G3P leaving to build sugar ---- */}
      {g3pOut.map((g, i) => (
        <mesh key={i} position={[g.x, g.y, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#4ade80" transparent opacity={g.op} emissive="#22c55e" emissiveIntensity={0.7} />
        </mesh>
      ))}
      {showLabels && si === 1 && <SmallLabel position={[ringXY(210)[0] - 0.55, ringXY(210)[1] + 1.4, 0]} name="G3P → sugar" />}
    </group>
  );
}
