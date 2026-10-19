'use client';

import { useMemo } from 'react';
import { Line, Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Meiosis timeline (seconds, total 64):
   prophase I 0–10, metaphase I 10–18, anaphase I 18–26, telophase I 26–34,
   meiosis II (metaphase II → anaphase II → telophase II) 34–64.
   n = 2 homologous pairs: one long, one short. One homologue of each pair is
   red (maternal), the other blue (paternal) — visually distinct from mitosis. */

const rand = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const smooth = (t: number): number => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const lerp3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected
    ? { emissive: '#38bdf8', emissiveIntensity: 0.4 }
    : { emissive: '#000000', emissiveIntensity: 0 };
}

const RED = '#f87171'; // maternal homologue
const BLUE = '#60a5fa'; // paternal homologue
const LONG = 0.72;
const SHORT = 0.44;

const STAGE_NAMES = ['Prophase I', 'Metaphase I', 'Anaphase I', 'Telophase I', 'Meiosis II'];
const STAGE_IDS = ['prophase-1', 'metaphase-1', 'anaphase-1', 'telophase-1', 'meiosis-2'];

function stageIndex(t: number): number {
  if (t < 10) return 0;
  if (t < 18) return 1;
  if (t < 26) return 2;
  if (t < 34) return 3;
  return 4;
}

interface ChromosomeDef {
  key: string;
  color: string;
  tipColor: string;
  length: number;
  seed: number;
  /** synapsis position (prophase I end) */
  syn: [number, number, number];
  /** metaphase I plate position */
  meta1: [number, number, number];
  /** anaphase I pole position */
  ana1: [number, number, number];
  /** telophase I: daughter side (+1 top / -1 bottom), local y offset, z */
  tel1: { s: number; off: number; z: number };
  /** metaphase II: local y offset and z within its daughter cell */
  meta2: { off: number; z: number };
  /** granddaughter side along x (+1 / -1) in telophase II */
  gx: number;
}

/* Segregation plan: top pole (meiosis I) receives A1 (red, long) + B2 (blue, short);
   bottom pole receives A2 (blue, long) + B1 (red, short). */
const CHROMOSOMES: ChromosomeDef[] = [
  {
    key: 'A1', color: RED, tipColor: BLUE, length: LONG, seed: 11,
    syn: [0, 0.26, 0.48], meta1: [0, 0.2, 0.48], ana1: [0, 1.55, 0.48],
    tel1: { s: 1, off: 0.22, z: 0.48 }, meta2: { off: 0.28, z: 0.25 }, gx: 1,
  },
  {
    key: 'A2', color: BLUE, tipColor: RED, length: LONG, seed: 22,
    syn: [0, -0.26, 0.48], meta1: [0, -0.2, 0.48], ana1: [0, -1.55, 0.48],
    tel1: { s: -1, off: 0.22, z: 0.48 }, meta2: { off: 0.28, z: 0.25 }, gx: -1,
  },
  {
    key: 'B1', color: RED, tipColor: BLUE, length: SHORT, seed: 33,
    syn: [0, 0.26, -0.48], meta1: [0, 0.2, -0.48], ana1: [0, -1.55, -0.48],
    tel1: { s: -1, off: -0.22, z: -0.48 }, meta2: { off: -0.28, z: -0.25 }, gx: 1,
  },
  {
    key: 'B2', color: BLUE, tipColor: RED, length: SHORT, seed: 44,
    syn: [0, -0.26, -0.48], meta1: [0, -0.2, -0.48], ana1: [0, 1.55, -0.48],
    tel1: { s: 1, off: -0.22, z: -0.48 }, meta2: { off: -0.28, z: -0.25 }, gx: -1,
  },
];

interface ChrState {
  pos: [number, number, number];
  rot: [number, number, number];
  vis: number;
  tipOp: number;
  sisterSep: number;
  sisterTilt: number;
}

function startPos(seed: number): [number, number, number] {
  const r = 0.5 + rand(seed) * 0.9;
  const th = rand(seed + 100) * Math.PI * 2;
  const ph = Math.acos(2 * rand(seed + 200) - 1);
  return [r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.8, r * Math.sin(ph) * Math.sin(th)];
}

const daughterY = (t: number): number => lerp(0.9, 1.6, smooth((t - 26) / 8));

function chrState(t: number, d: ChromosomeDef): ChrState {
  const st = startPos(d.seed);
  // defaults: prophase-I condensation pose
  let pos: [number, number, number] = st;
  let rot: [number, number, number] = [0, 0, Math.PI / 2];
  let vis = 0;
  let tipOp = 0;
  let sisterSep = 0;
  let sisterTilt = 0;

  if (t < 10) {
    // prophase I: condense, homologues synapse, crossing over hint appears
    const k = smooth(t / 10);
    pos = lerp3(st, d.syn, k);
    vis = clamp01(t / 2.5);
    tipOp = clamp01((t - 4) / 3);
  } else if (t < 18) {
    // metaphase I: bivalents tighten onto the plate
    const k = smooth((t - 10) / 3);
    pos = lerp3(d.syn, d.meta1, k);
    pos = [pos[0], pos[1] + Math.sin(t * 2.2 + d.seed) * 0.02, pos[2]];
    vis = 1;
    tipOp = 1;
  } else if (t < 26) {
    // anaphase I: homologues part toward opposite poles, sisters stay together
    const k = smooth((t - 18) / 8);
    pos = lerp3(d.meta1, d.ana1, k);
    vis = 1;
    tipOp = 1;
  } else if (t < 34) {
    // telophase I: chromosomes ride into the two daughter cells, decondense
    const dy = daughterY(t);
    const k = smooth((t - 26) / 6);
    const tel: [number, number, number] = [0, d.tel1.s * (dy + d.tel1.off), d.tel1.z];
    pos = lerp3(d.ana1, tel, k);
    vis = 1 - 0.7 * smooth((t - 28) / 6);
    tipOp = 1 - smooth((t - 28) / 6);
  } else if (t < 42) {
    // metaphase II: chromosomes re-condense on each daughter's own plate
    const k = smooth((t - 34) / 6);
    const tel: [number, number, number] = [0, d.tel1.s * (1.6 + d.tel1.off), d.tel1.z];
    const m2: [number, number, number] = [0, d.tel1.s * 1.6 + d.meta2.off, d.meta2.z];
    pos = lerp3(tel, m2, k);
    rot = [lerp(0, Math.PI / 2, k), 0, lerp(Math.PI / 2, 0, k)];
    vis = 0.3 + 0.7 * smooth((t - 34) / 5);
  } else if (t < 50) {
    // anaphase II: sister chromatids split toward the daughter's poles
    const k = smooth((t - 42) / 8);
    pos = [0, d.tel1.s * 1.6 + d.meta2.off, d.meta2.z];
    rot = [Math.PI / 2, 0, 0];
    sisterSep = 0.85 * k;
    sisterTilt = k;
    vis = 1;
  } else {
    // telophase II: chromatids settle into four haploid cells, nuclei reform
    const k = smooth((t - 50) / 8);
    const m2: [number, number, number] = [0, d.tel1.s * 1.6 + d.meta2.off, d.meta2.z];
    const fin: [number, number, number] = [d.gx * 0.85, d.tel1.s * 1.6, 0];
    pos = lerp3(m2, fin, k);
    rot = [Math.PI / 2, 0, 0];
    sisterSep = 0.85;
    sisterTilt = 1;
    vis = 1 - 0.75 * smooth((t - 52) / 5);
  }
  return { pos, rot, vis, tipOp, sisterSep, sisterTilt };
}

function Chromosome({
  spec,
  selected,
}: {
  spec: ChrState & { color: string; tipColor: string; length: number };
  selected: boolean;
}): JSX.Element {
  const em = emissiveProps(selected);
  return (
    <group position={spec.pos} rotation={spec.rot} visible={spec.vis > 0.01}>
      {[1, -1].map((s) => (
        <group
          key={s}
          position={[s * (0.08 + spec.sisterSep), 0, 0]}
          rotation={[0, 0, (-s * spec.sisterTilt * Math.PI) / 2]}
        >
          <mesh>
            <capsuleGeometry args={[0.075, spec.length, 6, 12]} />
            <meshStandardMaterial
              color={spec.color}
              transparent
              opacity={spec.vis}
              roughness={0.4}
              metalness={0.05}
              {...em}
            />
          </mesh>
          {spec.tipOp > 0.01 && (
            <mesh position={[0, spec.length / 2 - 0.06, 0]}>
              <capsuleGeometry args={[0.078, 0.18, 6, 12]} />
              <meshStandardMaterial
                color={spec.tipColor}
                transparent
                opacity={spec.tipOp * spec.vis}
                roughness={0.4}
                metalness={0.05}
                {...em}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function CellMembrane({
  position,
  radius,
  opacity,
}: {
  position: [number, number, number];
  radius: number;
  opacity: number;
}): JSX.Element | null {
  if (opacity < 0.01) return null;
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[radius, 32, 24]} />
        <meshPhysicalMaterial color="#7dd3fc" transparent opacity={opacity} roughness={0.2} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 0.94, 32, 24]} />
        <meshStandardMaterial
          color="#1c3a5e"
          transparent
          opacity={opacity * 2.6 > 1 ? 1 : opacity * 2.6}
          roughness={0.7}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function Meiosis(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stageIndex(t);
  const selStage = selectedId === STAGE_IDS[si];

  const states = useMemo(() => CHROMOSOMES.map((d) => chrState(t, d)), [t]);
  const chromatinDots = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const th = rand(i * 7 + 1) * Math.PI * 2;
        const ph = rand(i * 7 + 2) * Math.PI;
        const r = 0.3 + rand(i * 7 + 3) * 0.8;
        return {
          x: r * Math.sin(ph) * Math.cos(th),
          y: r * Math.cos(ph),
          z: r * Math.sin(ph) * Math.sin(th),
        };
      }),
    [],
  );

  const chromatinOp = 1 - clamp01((t - 1) / 3);
  const parentOp = 0.14 * (1 - smooth((t - 26) / 6));
  const dy = daughterY(t);
  const dauRadius = lerp(0.55, 1.15, smooth((t - 26) / 8));
  const dauOp = 0.14 * smooth((t - 26) / 4) * (1 - smooth((t - 50) / 6));
  const gdRadius = lerp(0.4, 0.72, smooth((t - 50) / 8));
  const gdOp = 0.14 * smooth((t - 50) / 5);

  const dauNucOp = clamp01((t - 28) / 3) * (1 - clamp01((t - 36) / 4));
  const gdNucOp = clamp01((t - 52) / 4);

  const spindle1Op = clamp01((t - 10) / 3) * (1 - clamp01((t - 24) / 3));
  const centro1Op = clamp01((t - 8) / 2) * (1 - clamp01((t - 26) / 3));
  const plate1Op = t >= 10 && t < 18 ? clamp01((t - 10) / 2) * (1 - clamp01((t - 17) / 1.5)) : 0;
  const spindle2Op = clamp01((t - 34) / 3) * (1 - clamp01((t - 48) / 3));
  const plate2Op = t >= 34 && t < 42 ? clamp01((t - 34) / 2) * (1 - clamp01((t - 41) / 1.5)) : 0;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(STAGE_IDS[si]);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {showLabels && (
        <Html position={[0, 3.1, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{STAGE_NAMES[si]}</span>
        </Html>
      )}

      {/* parent cell */}
      <CellMembrane position={[0, 0, 0]} radius={2} opacity={parentOp} />

      {/* decondensed chromatin at the very start */}
      {chromatinOp > 0.01 &&
        chromatinDots.map((p, i) => (
          <mesh key={i} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color="#a78bfa" transparent opacity={chromatinOp} roughness={0.5} />
          </mesh>
        ))}

      {/* chromosomes */}
      {CHROMOSOMES.map((d, i) => (
        <Chromosome
          key={d.key}
          spec={{
            ...states[i],
            color: d.color,
            tipColor: d.tipColor,
            length: d.length,
          }}
          selected={selStage}
        />
      ))}

      {/* spindle I */}
      {spindle1Op > 0.01 &&
        states.map((s, i) => (
          <group key={i}>
            <Line
              points={[
                [0, 1.75, 0],
                s.pos,
              ]}
              color="#7dd3fc"
              transparent
              opacity={spindle1Op * 0.7}
              lineWidth={1}
            />
            <Line
              points={[
                [0, -1.75, 0],
                s.pos,
              ]}
              color="#7dd3fc"
              transparent
              opacity={spindle1Op * 0.7}
              lineWidth={1}
            />
          </group>
        ))}
      {centro1Op > 0.01 &&
        [1, -1].map((s) => (
          <mesh key={s} position={[0, s * 1.75, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#22d3ee" transparent opacity={centro1Op} roughness={0.3} />
          </mesh>
        ))}
      {plate1Op > 0.01 && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.0, 0.015, 8, 64]} />
          <meshBasicMaterial color="#475569" transparent opacity={plate1Op * 0.8} />
        </mesh>
      )}

      {/* daughter cells after meiosis I */}
      {[1, -1].map((s) => (
        <group key={s}>
          <CellMembrane position={[0, s * dy, 0]} radius={dauRadius} opacity={dauOp} />
          {dauNucOp > 0.01 && (
            <mesh position={[0, s * dy, 0]}>
              <sphereGeometry args={[0.42, 24, 18]} />
              <meshStandardMaterial
                color="#8b5cf6"
                transparent
                opacity={dauNucOp * 0.95}
                roughness={0.45}
                {...emissiveProps(selectedId === 'telophase-1')}
              />
            </mesh>
          )}
          {/* spindle II poles + fibres inside each daughter */}
          {spindle2Op > 0.01 &&
            [1, -1].map((px) => (
              <mesh key={px} position={[px * 1.45, s * 1.6, 0]}>
                <sphereGeometry args={[0.1, 14, 14]} />
                <meshStandardMaterial color="#22d3ee" transparent opacity={spindle2Op} roughness={0.3} />
              </mesh>
            ))}
          {plate2Op > 0.01 && (
            <mesh position={[0, s * 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.62, 0.012, 8, 48]} />
              <meshBasicMaterial color="#475569" transparent opacity={plate2Op * 0.8} />
            </mesh>
          )}
        </group>
      ))}
      {spindle2Op > 0.01 &&
        CHROMOSOMES.map((d, i) => {
          const s = d.tel1.s;
          return [1, -1].map((px) => (
            <Line
              key={`${i}-${px}`}
              points={[[px * 1.45, s * 1.6, 0], states[i].pos]}
              color="#7dd3fc"
              transparent
              opacity={spindle2Op * 0.6}
              lineWidth={1}
            />
          ));
        })}

      {/* four haploid cells after meiosis II */}
      {[1, -1].map(
        (sx) =>
          gdOp > 0.01 &&
          [1, -1].map((sy) => (
            <group key={`${sx}-${sy}`}>
              <CellMembrane position={[sx * 0.85, sy * 1.6, 0]} radius={gdRadius} opacity={gdOp} />
              {gdNucOp > 0.01 && (
                <mesh position={[sx * 0.85, sy * 1.6, 0]}>
                  <sphereGeometry args={[0.32, 24, 18]} />
                  <meshStandardMaterial
                    color="#8b5cf6"
                    transparent
                    opacity={gdNucOp * 0.95}
                    roughness={0.45}
                    {...emissiveProps(selectedId === 'meiosis-2')}
                  />
                </mesh>
              )}
            </group>
          )),
      )}

      {/* stage annotations */}
      {showLabels && si === 0 && (
        <>
          <Html position={[1.5, 0.45, 0.48]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Bivalent (homologous pair)</span>
          </Html>
          <Html position={[-0.85, 1.0, 0.48]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Crossing over</span>
          </Html>
        </>
      )}
      {showLabels && si === 1 && (
        <Html position={[1.45, 0, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>Metaphase I plate</span>
        </Html>
      )}
      {showLabels && si === 2 && (
        <Html position={[1.75, 0, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>Homologues separate — sisters stay together</span>
        </Html>
      )}
      {showLabels && si === 3 && (
        <Html position={[2.0, 1.6, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>Two haploid cells</span>
        </Html>
      )}
      {showLabels && si === 4 && t >= 42 && t < 50 && (
        <Html position={[1.9, 1.6, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>Sister chromatids separate</span>
        </Html>
      )}
      {showLabels && si === 4 && t >= 50 && (
        <Html position={[0, 3.0, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>Four haploid cells</span>
        </Html>
      )}
    </group>
  );
}
