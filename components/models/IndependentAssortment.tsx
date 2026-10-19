'use client';

import { useMemo } from 'react';
import { Line, Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Independent assortment timeline (seconds, total 36 — loops):
   0–8    orientation 1 at metaphase I
   8–13   anaphase I (orientation 1)
   13–17  gametes of orientation 1
   17–19  reset fade
   19–24  orientation 2 at metaphase I (short pair flipped)
   24–29  anaphase I (orientation 2)
   29–33  gametes of orientation 2
   33–36  reset fade back to the loop start
   n = 2: one long pair (red/blue), one short pair (red/blue). */

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const smooth = (t: number): number => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
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

const RED = '#f87171';
const BLUE = '#60a5fa';
const LONG = 0.72;
const SHORT = 0.44;

const STAGE_NAMES = [
  'Orientation 1 — metaphase I',
  'Gametes — orientation 1',
  'Orientation 2 — metaphase I',
  'Gametes — orientation 2',
];
const STAGE_IDS = ['orientation-a', 'gametes-a', 'orientation-b', 'gametes-b'];

function stageIndex(t: number): number {
  if (t < 8) return 0;
  if (t < 17) return 1;
  if (t < 24) return 2;
  return 3;
}

interface ChromosomeDef {
  key: string;
  color: string;
  length: number;
  /** plate position in orientation 1 */
  p1: [number, number, number];
  /** plate position in orientation 2 (short pair flipped) */
  p2: [number, number, number];
  /** pole position after anaphase (orientation 1) */
  a1: [number, number, number];
  /** pole position after anaphase (orientation 2) */
  a2: [number, number, number];
  /** rest position inside the gamete cell: [side(+1/-1), yOff, z] */
  g: { s: number; off: number; z: number };
}

const CHROMOSOMES: ChromosomeDef[] = [
  {
    key: 'A1', color: RED, length: LONG,
    p1: [0, 0.22, 0.5], p2: [0, 0.22, 0.5],
    a1: [0, 1.5, 0.5], a2: [0, 1.5, 0.5],
    g: { s: 1, off: 0.2, z: 0.5 },
  },
  {
    key: 'A2', color: BLUE, length: LONG,
    p1: [0, -0.22, 0.5], p2: [0, -0.22, 0.5],
    a1: [0, -1.5, 0.5], a2: [0, -1.5, 0.5],
    g: { s: -1, off: 0.2, z: 0.5 },
  },
  {
    key: 'B1', color: RED, length: SHORT,
    p1: [0, 0.22, -0.5], p2: [0, -0.22, -0.5],
    a1: [0, 1.5, -0.5], a2: [0, -1.5, -0.5],
    g: { s: -1, off: -0.2, z: -0.5 },
  },
  {
    key: 'B2', color: BLUE, length: SHORT,
    p1: [0, -0.22, -0.5], p2: [0, 0.22, -0.5],
    a1: [0, -1.5, -0.5], a2: [0, 1.5, -0.5],
    g: { s: 1, off: -0.2, z: -0.5 },
  },
];

function chrState(t: number, d: ChromosomeDef): { pos: [number, number, number]; vis: number } {
  let pos: [number, number, number] = d.p1;
  let vis = 0;
  if (t < 8) {
    // orientation 1 on the plate
    pos = [d.p1[0], d.p1[1] + Math.sin(t * 2 + d.key.charCodeAt(0)) * 0.015, d.p1[2]];
    vis = clamp01(t / 1.5);
  } else if (t < 13) {
    // anaphase I: homologues separate
    const k = smooth((t - 8) / 5);
    pos = lerp3(d.p1, d.a1, k);
    vis = 1;
  } else if (t < 17) {
    // gametes of orientation 1
    const k = smooth((t - 13) / 3);
    const g: [number, number, number] = [0, d.g.s * 1.5 + d.g.off, d.g.z];
    pos = lerp3(d.a1, g, k);
    vis = 1 - clamp01((t - 15.5) / 1.5);
  } else if (t < 19) {
    vis = 0; // reset fade
  } else if (t < 24) {
    // orientation 2 on the plate — short pair flipped (invisible during the reset)
    const plate = d.p2;
    pos = [plate[0], plate[1] + Math.sin(t * 2 + d.key.charCodeAt(0)) * 0.015, plate[2]];
    vis = clamp01((t - 19) / 1.5);
  } else if (t < 29) {
    // anaphase I: homologues separate
    const k = smooth((t - 24) / 5);
    pos = lerp3(d.p2, d.a2, k);
    vis = 1;
  } else if (t < 33) {
    // gametes of orientation 2
    const k = smooth((t - 29) / 3);
    const g: [number, number, number] = [0, d.g.s * 1.5 + d.g.off, d.g.z];
    pos = lerp3(d.a2, g, k);
    vis = 1 - clamp01((t - 31.5) / 1.5);
  } else {
    vis = 0; // reset fade back to loop start
  }
  return { pos, vis };
}

function Chromosome({
  pos,
  vis,
  color,
  length,
  selected,
}: {
  pos: [number, number, number];
  vis: number;
  color: string;
  length: number;
  selected: boolean;
}): JSX.Element {
  const em = emissiveProps(selected);
  return (
    <group position={pos} rotation={[0, 0, Math.PI / 2]} visible={vis > 0.01}>
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 0.08, 0, 0]}>
          <capsuleGeometry args={[0.075, length, 6, 12]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={vis}
            roughness={0.4}
            metalness={0.05}
            {...em}
          />
        </mesh>
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

export default function IndependentAssortment(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stageIndex(t);
  const selStage = selectedId === STAGE_IDS[si];

  const states = useMemo(() => CHROMOSOMES.map((d) => chrState(t, d)), [t]);

  // parent cell visible during plate phases, fades as homologues separate
  let parentOp = 0;
  if (t < 8) parentOp = 0.14;
  else if (t < 12) parentOp = 0.14 * (1 - smooth((t - 8) / 4));
  else if (t < 17) parentOp = 0;
  else if (t < 19) parentOp = 0.14 * smooth((t - 17) / 2);
  else if (t < 24) parentOp = 0.14;
  else if (t < 28) parentOp = 0.14 * (1 - smooth((t - 24) / 4));
  else if (t < 33) parentOp = 0;
  else parentOp = 0.14 * smooth((t - 33) / 3);

  const gamA = 0.14 * clamp01((t - 10) / 3) * (1 - clamp01((t - 15.5) / 1.5));
  const gamB = 0.14 * clamp01((t - 26) / 3) * (1 - clamp01((t - 31.5) / 1.5));
  const gamRadiusA = lerp(0.6, 1.1, smooth((t - 10) / 4));
  const gamRadiusB = lerp(0.6, 1.1, smooth((t - 26) / 4));

  const plateOpA = clamp01(t / 1.5) * (1 - clamp01((t - 7) / 1.5));
  const plateOpB = clamp01((t - 19) / 1.5) * (1 - clamp01((t - 23) / 1.5));
  const spindleOp = Math.max(
    plateOpA,
    plateOpB,
    t >= 8 && t < 13 ? 1 - smooth((t - 11) / 2) : 0,
    t >= 24 && t < 29 ? 1 - smooth((t - 27) / 2) : 0,
  );

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
        <Html position={[0, 2.9, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{STAGE_NAMES[si]}</span>
        </Html>
      )}

      <CellMembrane position={[0, 0, 0]} radius={2} opacity={parentOp} />

      {CHROMOSOMES.map((d, i) => (
        <Chromosome
          key={d.key}
          pos={states[i].pos}
          vis={states[i].vis}
          color={d.color}
          length={d.length}
          selected={selStage}
        />
      ))}

      {/* metaphase plate + spindle hints */}
      {(plateOpA > 0.01 || plateOpB > 0.01) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.0, 0.015, 8, 64]} />
          <meshBasicMaterial color="#475569" transparent opacity={Math.max(plateOpA, plateOpB) * 0.8} />
        </mesh>
      )}
      {spindleOp > 0.01 &&
        states.map(
          (s, i) =>
            s.vis > 0.05 && (
              <group key={i}>
                <Line
                  points={[
                    [0, 1.75, 0],
                    s.pos,
                  ]}
                  color="#7dd3fc"
                  transparent
                  opacity={spindleOp * 0.6}
                  lineWidth={1}
                />
                <Line
                  points={[
                    [0, -1.75, 0],
                    s.pos,
                  ]}
                  color="#7dd3fc"
                  transparent
                  opacity={spindleOp * 0.6}
                  lineWidth={1}
                />
              </group>
            ),
        )}

      {/* gamete cells */}
      {[1, -1].map((s) => (
        <group key={s}>
          <CellMembrane position={[0, s * 1.5, 0]} radius={gamRadiusA} opacity={gamA} />
          <CellMembrane position={[0, s * 1.5, 0]} radius={gamRadiusB} opacity={gamB} />
        </group>
      ))}

      {/* annotations */}
      {showLabels && si === 0 && (
        <>
          <Html position={[-1.6, 0.75, 0.5]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Pair 1: red faces up</span>
          </Html>
          <Html position={[-1.6, -0.75, -0.5]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Pair 2: red faces up</span>
          </Html>
        </>
      )}
      {showLabels && si === 1 && t >= 13 && (
        <>
          <Html position={[1.75, 1.5, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Gamete: red-long + red-short</span>
          </Html>
          <Html position={[1.75, -1.5, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Gamete: blue-long + blue-short</span>
          </Html>
        </>
      )}
      {showLabels && si === 2 && (
        <>
          <Html position={[-1.6, 0.75, 0.5]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Pair 1: red faces up</span>
          </Html>
          <Html position={[-1.6, -0.75, -0.5]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Pair 2: blue faces up — flipped</span>
          </Html>
        </>
      )}
      {showLabels && si === 3 && t >= 29 && (
        <>
          <Html position={[1.75, 1.5, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Gamete: red-long + blue-short</span>
          </Html>
          <Html position={[1.75, -1.5, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Gamete: blue-long + red-short</span>
          </Html>
        </>
      )}
    </group>
  );
}
