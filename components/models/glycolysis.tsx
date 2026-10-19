'use client';

import { useMemo, type ReactNode } from 'react';
import { Html, Line } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Loop length in seconds — everything is driven from animTime. */
const LOOP = 24;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

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

function PartGroup({
  id,
  onSelect,
  children,
}: {
  id: string;
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
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

// [enzyme name, one-line original description]
const STEP_INFO: [string, string][] = [
  ['Hexokinase', 'Step 1 · glucose → glucose-6-phosphate: spends 1 ATP to trap the sugar inside the cell.'],
  ['Phosphohexose isomerase', 'Step 2 · glucose-6-phosphate → fructose-6-phosphate: rearranges the ring into a new sugar.'],
  ['Phosphofructokinase', 'Step 3 · fructose-6-phosphate → fructose-1,6-bisphosphate: the committed step, spending a 2nd ATP.'],
  ['Aldolase', 'Step 4 · fructose-1,6-bisphosphate splits into two 3-carbon triose phosphates.'],
  ['Triose phosphate isomerase', 'Step 5 · DHAP is converted to GAP, so both halves continue down the pathway.'],
  ['GAP dehydrogenase', 'Step 6 · glyceraldehyde-3-phosphate is oxidised; NAD⁺ is reduced to NADH (runs ×2).'],
  ['Phosphoglycerate kinase', 'Step 7 · transfers a phosphate to ADP, minting the first ATP payout (runs ×2).'],
  ['Phosphoglycerate mutase', 'Step 8 · moves the phosphate to the middle carbon, readying the molecule.'],
  ['Enolase', 'Step 9 · strips out water to build PEP, a high-energy compound.'],
  ['Pyruvate kinase', 'Step 10 · PEP gives up its phosphate to make ATP (runs ×2), releasing pyruvate.'],
];

// Descending zig-zag cascade: steps 1–5 (amber) then steps 6–10 (teal).
const POS: [number, number, number][] = STEP_INFO.map((_, i) => [
  i % 2 === 0 ? -0.9 : 0.9,
  4.6 - i * 1.02,
  0.3 * Math.sin(i * 1.3),
]);

const GLUCOSE_POS: [number, number, number] = [-2.35, 4.78, 0.3];
const PYRUVATE_POS: [number, number, number][] = [
  [0.55, -5.62, -0.23],
  [1.25, -5.62, -0.23],
];

export default function Glycolysis(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  // 0..10 across the loop: step k is active while fp in [k, k+1).
  const fp = ((((animTime % LOOP) + LOOP) % LOOP) / LOOP) * 10;
  const activeIdx = Math.min(9, Math.floor(fp));

  // The travelling substrate: single before the split (step 5), doubled after.
  const k = Math.min(9, Math.floor(fp));
  const local = smooth(fp - k);
  const pA = POS[k];
  const pB = POS[Math.min(9, k + 1)];
  const subX = lerp(pA[0], pB[0], local);
  const subY = lerp(pA[1], pB[1], local);
  const subZ = lerp(pA[2], pB[2], local);
  const split = smooth((fp - 3.2) / 0.8);

  // ATP invested at steps 1 & 3: orange particles fly in from the side.
  const atpIn = useMemo(() => {
    const out: { pos: [number, number, number]; op: number }[] = [];
    [0, 2].forEach((idx) => {
      const w = fp - idx;
      if (w < 0 || w > 1) return;
      const p = POS[idx];
      out.push({
        pos: [lerp(-2.7, p[0], smooth(w)), lerp(p[1] + 0.5, p[1], smooth(w)), 0.55],
        op: 1 - w * 0.4,
      });
    });
    return out;
  }, [fp]);

  // ATP minted at steps 7 & 10 (×2 each): gold particles fly out.
  const atpOut = useMemo(() => {
    const out: { pos: [number, number, number]; op: number }[] = [];
    [6, 9].forEach((idx) => {
      const w = fp - idx;
      if (w < 0 || w > 1) return;
      const p = POS[idx];
      [-0.24, 0.24].forEach((dz) => {
        out.push({
          pos: [lerp(p[0], 2.75, smooth(w)), p[1], p[2] + dz],
          op: 1 - w * 0.3,
        });
      });
    });
    return out;
  }, [fp]);

  // NADH banked at step 6 (×2): lime particles fly out.
  const nadhOut = useMemo(() => {
    const out: { pos: [number, number, number]; op: number }[] = [];
    const w = fp - 5;
    if (w >= 0 && w <= 1) {
      const p = POS[5];
      [-0.32, 0.32].forEach((dy) => {
        out.push({
          pos: [lerp(p[0], -2.75, smooth(w)), p[1] + dy, p[2]],
          op: 1 - w * 0.3,
        });
      });
    }
    return out;
  }, [fp]);

  // Cascade connectors: amber for investment, teal for payoff, pale at the split.
  const segs = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        points: [POS[i], POS[i + 1]] as [number, number, number][],
        color: i < 4 ? '#f59e0b' : i === 4 ? '#e2e8f0' : '#2dd4bf',
      })),
    [],
  );

  return (
    <group scale={[1 + explode * 0.35, 1, 1]}>
      {/* ---- cascade connectors ---- */}
      {segs.map((s, i) => (
        <Line key={i} points={s.points} color={s.color} transparent opacity={0.55} lineWidth={1.5} />
      ))}

      {/* ---- phase divider + region tags ---- */}
      <Line points={[[-2.7, 0.0, 0], [2.7, 0.0, 0]] as [number, number, number][]} color="#94a3b8" transparent opacity={0.35} lineWidth={1} />
      {showLabels && (
        <>
          <PartLabel position={[-3.35, 2.9, 0]} name="Energy investment · 2 ATP in" />
          <PartLabel position={[3.35, -2.1, 0]} name="Energy payoff · 4 ATP + 2 NADH out" />
        </>
      )}

      {/* ---- glucose entry ---- */}
      <PartGroup id="glucose" onSelect={onSelect}>
        <Line points={[GLUCOSE_POS, POS[0]]} color="#22c55e" transparent opacity={0.7} lineWidth={1.5} />
        <mesh position={GLUCOSE_POS}>
          <sphereGeometry args={[0.34, 20, 16]} />
          <meshStandardMaterial color="#22c55e" roughness={0.35} metalness={0.1} {...emissiveProps(sel('glucose'))} />
        </mesh>
        {showLabels && <PartLabel position={[-2.35, 5.5, 0.3]} name="Glucose" />}
      </PartGroup>

      {/* ---- the ten enzymatic steps ---- */}
      {STEP_INFO.map(([enzyme], i) => {
        const p = POS[i];
        const active = i === activeIdx;
        const invest = i < 5;
        const lx: [number, number, number] = [p[0] + (p[0] > 0 ? 1.15 : -1.15), p[1] + 0.34, p[2]];
        return (
          <PartGroup key={i} id={`step-${i + 1}`} onSelect={onSelect}>
            <mesh position={p} scale={active ? 1.22 : 1}>
              <icosahedronGeometry args={[0.34, 1]} />
              <meshStandardMaterial
                color={invest ? '#f59e0b' : '#2dd4bf'}
                emissive={sel(`step-${i + 1}`) ? '#38bdf8' : '#fbbf24'}
                emissiveIntensity={sel(`step-${i + 1}`) ? 0.4 : active ? 0.85 : 0.12}
                roughness={0.35}
                metalness={0.15}
              />
            </mesh>
            {showLabels && <PartLabel position={lx} name={enzyme} />}
          </PartGroup>
        );
      })}

      {/* ---- travelling substrate (splits into two trioses after step 5) ---- */}
      <mesh position={[subX - split * 0.26, subY, subZ]}>
        <sphereGeometry args={[0.13, 14, 12]} />
        <meshBasicMaterial color="#fef3c7" />
      </mesh>
      {split > 0.01 && (
        <mesh position={[subX + split * 0.26, subY, subZ]}>
          <sphereGeometry args={[0.13, 14, 12]} />
          <meshBasicMaterial color="#fef3c7" transparent opacity={split} />
        </mesh>
      )}

      {/* ---- energy particles ---- */}
      {atpIn.map((p, i) => (
        <mesh key={`ai${i}`} position={p.pos}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={0.8} transparent opacity={p.op} />
        </mesh>
      ))}
      {atpOut.map((p, i) => (
        <mesh key={`ao${i}`} position={p.pos}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.9} transparent opacity={p.op} />
        </mesh>
      ))}
      {nadhOut.map((p, i) => (
        <mesh key={`no${i}`} position={p.pos}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={0.9} transparent opacity={p.op} />
        </mesh>
      ))}

      {/* ---- pyruvate exit ---- */}
      <PartGroup id="pyruvate" onSelect={onSelect}>
        {PYRUVATE_POS.map((p, i) => (
          <group key={i}>
            <Line points={[POS[9], p]} color="#a78bfa" transparent opacity={0.7} lineWidth={1.5} />
            <mesh position={p}>
              <sphereGeometry args={[0.3, 20, 16]} />
              <meshStandardMaterial color="#a78bfa" roughness={0.35} metalness={0.1} {...emissiveProps(sel('pyruvate'))} />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[1.9, -5.62, -0.23]} name="Pyruvate" />}
      </PartGroup>

      {/* ---- net-gain summary ---- */}
      <PartGroup id="net-gain" onSelect={onSelect}>
        <mesh position={[3.0, -4.75, 0]}>
          <boxGeometry args={[1.75, 0.95, 0.16]} />
          <meshStandardMaterial
            color="#fde047"
            emissive={sel('net-gain') ? '#38bdf8' : '#f59e0b'}
            emissiveIntensity={sel('net-gain') ? 0.4 : 0.35}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
        {showLabels && <PartLabel position={[3.0, -4.05, 0]} name="Net gain" />}
      </PartGroup>
    </group>
  );
}
