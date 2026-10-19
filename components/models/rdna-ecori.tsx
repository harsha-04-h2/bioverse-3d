'use client';

import { type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Fig 9.1 — EcoRI action (total 28 s):
   0–4   recognition site highlighted
   4–10  EcoRI dimer binds the site
   10–16 staggered cuts → sticky ends, fragments move apart
   16–21 foreign DNA fragment (complementary sticky ends) anneals
   21–28 DNA ligase seals the nicks → recombinant DNA */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

const BASE_COLORS: Record<string, string> = { A: '#34d399', T: '#f87171', G: '#60a5fa', C: '#fbbf24' };
const TOP = 'CATGGAATTCCGAT'.split(''); // 5'→3', GAATTC at index 4..9
const BOT = 'GTACCTTAAGGCTA'.split(''); // 3'→5', complementary CTTAAG at 4..9
const X = (i: number) => (i - 6.5) * 0.55;
const H = 0.45;
const SITE = [4, 5, 6, 7, 8, 9];

const STAGES = [
  { id: 'recognition', name: 'Recognition site', start: 0, end: 4 },
  { id: 'binding', name: 'EcoRI binds', start: 4, end: 10 },
  { id: 'cutting', name: 'Staggered cuts — sticky ends', start: 10, end: 16 },
  { id: 'annealing', name: 'Foreign DNA anneals', start: 16, end: 21 },
  { id: 'ligation', name: 'Ligation — recombinant DNA', start: 21, end: 28 },
];
function stageIndex(t: number): number {
  if (t < 4) return 0;
  if (t < 10) return 1;
  if (t < 16) return 2;
  if (t < 21) return 3;
  return 4;
}

// Foreign insert (local coords): top strand ss AATT (0..3) + ds TTGC (4..7),
// bottom strand ds AACG (4..7) + ss TTAA (8..11). Group sits at x = X(5).
const INS_TOP: { b: string; ss: boolean }[] = [
  { b: 'A', ss: true }, { b: 'A', ss: true }, { b: 'T', ss: true }, { b: 'T', ss: true },
  { b: 'T', ss: false }, { b: 'T', ss: false }, { b: 'G', ss: false }, { b: 'C', ss: false },
];
const INS_BOT: { b: string; ss: boolean }[] = [
  { b: 'A', ss: false }, { b: 'A', ss: false }, { b: 'C', ss: false }, { b: 'G', ss: false },
  { b: 'T', ss: true }, { b: 'T', ss: true }, { b: 'A', ss: true }, { b: 'A', ss: true },
];
const IL = (l: number) => l * 0.55;
const INSERT_X = X(5); // -0.825 — insert top ss overlaps vector-left bottom ss
const RIGHT_OFF = 4.4; // right fragment shift so its top ss overlaps insert bottom ss

const NICKS: [number, number][] = [
  [-1.1, H], [1.1, -H], [3.3, H], [5.5, -H],
];

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

/** Horizontal backbone rail between consecutive base x-positions. */
function Rail({ from, to, y, color, selected }: { from: number; to: number; y: number; color: string; selected: boolean }): JSX.Element {
  const len = to - from;
  return (
    <mesh position={[(from + to) / 2, y, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.07, 0.07, len, 10]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} {...emissiveProps(selected)} />
    </mesh>
  );
}

function BaseBox({ x, y, base, selected }: { x: number; y: number; base: string; selected: boolean }): JSX.Element {
  return (
    <mesh position={[x, y, 0]}>
      <boxGeometry args={[0.3, 0.16, 0.16]} />
      <meshStandardMaterial color={BASE_COLORS[base] ?? '#fff'} roughness={0.45} metalness={0.08} {...emissiveProps(selected)} />
    </mesh>
  );
}

export default function RdnaEcoRI(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stageIndex(t);
  const sel = (id: string) => selectedId === id;

  const cutK = smooth((t - 10) / 4);          // fragments move apart
  const bindK = smooth((t - 4) / 3);          // enzyme descends
  const enzOp = 1 - smooth((t - 10.5) / 1.5); // enzyme leaves after cutting
  const annK = smooth((t - 16) / 4);          // foreign fragment descends
  const ligK = smooth((t - 21) / 1.5) * (1 - smooth((t - 24.5) / 1.5)); // ligase flash
  const finK = smooth((t - 24) / 3);          // final recombinant glow

  const leftX = -1.1 * cutK;
  const rightX = 1.1 * cutK + (RIGHT_OFF - 1.1) * annK;
  const insertY = (1 - annK) * 3.4 + explode * 0.4;
  const enzZ = 2.4 - bindK * (2.4 - 0.62);
  const strandGap = explode * 0.7;

  // Vector rungs: left fragment keeps top 0..4 + bottom 0..8; right keeps top 5..13 + bottom 9..13.
  const leftRungs: { i: number; top: boolean; bot: boolean }[] = [];
  const rightRungs: { i: number; top: boolean; bot: boolean }[] = [];
  for (let i = 0; i < 14; i++) {
    leftRungs.push({ i, top: i <= 4, bot: i <= 8 });
    rightRungs.push({ i, top: i >= 5, bot: i >= 9 });
  }

  return (
    <group
      onClick={(e) => { e.stopPropagation(); onSelect(STAGES[si].id); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {showLabels && (
        <Html position={[2.1, 2.5, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{STAGES[si].name}</span>
        </Html>
      )}

      {/* ---- recognition-site highlight (stage 0–1) ---- */}
      {t < 10 &&
        SITE.map((i) => (
          <mesh key={i} position={[X(i), 0, 0]}>
            <boxGeometry args={[0.55, 1.5, 0.5]} />
            <meshStandardMaterial color="#f472b6" transparent opacity={0.22 * (1 - smooth((t - 8) / 2))} roughness={0.5} depthWrite={false} />
          </mesh>
        ))}

      {/* ---- left vector fragment ---- */}
      <group position={[leftX, 0, 0]}>
        <Clickable id="dna" onSelect={onSelect}>
          <Rail from={X(0)} to={X(4)} y={H + strandGap} color="#22d3ee" selected={sel('dna')} />
          <Rail from={X(0)} to={X(8)} y={-H - strandGap} color="#22d3ee" selected={sel('dna')} />
        </Clickable>
        <Clickable id="recognition-site" onSelect={onSelect}>
          {leftRungs.map(({ i, top, bot }) => (
            <group key={i}>
              {top && <BaseBox x={X(i)} y={H + strandGap} base={TOP[i]} selected={sel('recognition-site') && SITE.includes(i) || sel('dna')} />}
              {bot && <BaseBox x={X(i)} y={-H - strandGap} base={BOT[i]} selected={sel('recognition-site') && SITE.includes(i) || sel('dna')} />}
            </group>
          ))}
        </Clickable>
        {showLabels && t < 10 && <PartLabel position={[X(6.5), 1.35, 0]} name="GAATTC recognition site" />}
      </group>

      {/* ---- right vector fragment ---- */}
      <group position={[rightX, 0, 0]}>
        <Clickable id="dna" onSelect={onSelect}>
          <Rail from={X(5)} to={X(13)} y={H + strandGap} color="#22d3ee" selected={sel('dna')} />
          <Rail from={X(9)} to={X(13)} y={-H - strandGap} color="#22d3ee" selected={sel('dna')} />
        </Clickable>
        {rightRungs.map(({ i, top, bot }) => (
          <group key={i}>
            {top && <BaseBox x={X(i)} y={H + strandGap} base={TOP[i]} selected={sel('dna')} />}
            {bot && <BaseBox x={X(i)} y={-H - strandGap} base={BOT[i]} selected={sel('dna')} />}
          </group>
        ))}
        {showLabels && t >= 10 && t < 21 && <PartLabel position={[X(6.5), -1.35, 0]} name="Sticky ends (AATT overhangs)" />}
      </group>

      {/* ---- EcoRI dimer ---- */}
      {enzOp > 0.01 && (
        <Clickable id="ecori" onSelect={onSelect}>
          {[1, -1].map((s) => (
            <mesh key={s} position={[0, 0, s * enzZ]} scale={1 + 0.05 * Math.sin(t * 6)}>
              <sphereGeometry args={[0.52, 24, 18]} />
              <meshStandardMaterial color="#f97316" transparent opacity={enzOp} roughness={0.35} metalness={0.1} {...emissiveProps(sel('ecori'))} />
            </mesh>
          ))}
          {showLabels && t >= 4 && t < 10.5 && <PartLabel position={[0, 1.35, 0]} name="EcoRI" />}
        </Clickable>
      )}

      {/* ---- foreign DNA fragment ---- */}
      {annK > 0.005 && (
        <group position={[INSERT_X, insertY, 0]}>
          <Clickable id="foreign-dna" onSelect={onSelect}>
            <Rail from={IL(0)} to={IL(7)} y={H + strandGap} color="#a78bfa" selected={sel('foreign-dna')} />
            <Rail from={IL(4)} to={IL(11)} y={-H - strandGap} color="#a78bfa" selected={sel('foreign-dna')} />
            {INS_TOP.map((r, l) => (
              <BaseBox key={`t${l}`} x={IL(l)} y={H + strandGap} base={r.b} selected={sel('foreign-dna')} />
            ))}
            {INS_BOT.map((r, l) => (
              <BaseBox key={`b${l}`} x={IL(l + 4)} y={-H - strandGap} base={r.b} selected={sel('foreign-dna')} />
            ))}
          </Clickable>
          {showLabels && t >= 16 && <PartLabel position={[IL(5.5), 1.35, 0]} name="Foreign DNA" />}
        </group>
      )}

      {/* ---- DNA ligase sealing the four nicks ---- */}
      {ligK > 0.01 && (
        <Clickable id="ligase" onSelect={onSelect}>
          {NICKS.map(([nx, ny], k) => (
            <mesh key={k} position={[nx, ny, 0]} scale={1 + 0.35 * Math.sin(t * 10 + k)}>
              <sphereGeometry args={[0.15, 16, 12]} />
              <meshStandardMaterial
                color="#facc15" transparent opacity={ligK} roughness={0.3}
                emissive={sel('ligase') ? '#38bdf8' : '#facc15'} emissiveIntensity={sel('ligase') ? 0.5 : 0.9}
              />
            </mesh>
          ))}
          {showLabels && <PartLabel position={[2.2, 1.7, 0]} name="DNA ligase seals nicks" />}
        </Clickable>
      )}

      {/* ---- final recombinant glow + label ---- */}
      {finK > 0.01 && (
        <mesh position={[2.1, 0, 0]}>
          <boxGeometry args={[11.5, 2.2, 1.2]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.08 * finK} roughness={0.5} depthWrite={false} />
        </mesh>
      )}
      {showLabels && t >= 21 && <PartLabel position={[2.1, -1.7, 0]} name="Recombinant DNA" />}
    </group>
  );
}
