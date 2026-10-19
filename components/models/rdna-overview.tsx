'use client';

import { type ReactNode } from 'react';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Fig 9.2 — recombinant-DNA workflow, 7 steps × 4 s (total 28 s):
   1 isolate DNA (0–4) · 2 cut with restriction enzyme (4–8) ·
   3 amplify via PCR hint (8–12) · 4 ligate into vector (12–16) ·
   5 transfer into host (16–20) · 6 select transformants (20–24) ·
   7 culture (24–28) */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

const STEPS = [
  { id: 'isolate-dna', name: '1 · Isolate DNA', start: 0, end: 4, desc: 'A cell is broken open and its DNA is pulled out and purified.' },
  { id: 'cut-dna', name: '2 · Cut with restriction enzyme', start: 4, end: 8, desc: 'The enzyme snips both strands at its recognition sites, leaving matching sticky ends.' },
  { id: 'pcr', name: '3 · Amplify by PCR', start: 8, end: 12, desc: 'Repeated heating–cooling cycles copy the gene of interest into millions of copies.' },
  { id: 'ligation', name: '4 · Ligate into vector', start: 12, end: 16, desc: 'The gene slots into the opened plasmid and ligase glues the backbones shut.' },
  { id: 'transfer', name: '5 · Transfer into host', start: 16, end: 20, desc: 'The recombinant plasmid slips into a bacterial host cell, which now carries the new gene.' },
  { id: 'selection', name: '6 · Select transformants', start: 20, end: 24, desc: 'Only cells that took up the plasmid survive the antibiotic plate — the rest die off.' },
  { id: 'culture', name: '7 · Culture', start: 24, end: 28, desc: 'Survivors multiply in a fermenter and each cell churns out the desired protein.' },
];
function stepIndex(t: number): number {
  return Math.min(6, Math.floor(t / 4));
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

function Mat({ color, opacity, selected, rough = 0.45 }: { color: string; opacity: number; selected?: boolean; rough?: number }): JSX.Element {
  return (
    <meshStandardMaterial
      color={color} transparent opacity={opacity} roughness={rough} metalness={0.08}
      {...emissiveProps(!!selected)}
    />
  );
}

/** Short horizontal DNA ladder (n rungs), width 1 unit per rung-step. */
function MiniLadder({ n, spacing = 0.5, rung = 0.5, color = '#22d3ee', opacity, selected, selId, onSelect }: {
  n: number; spacing?: number; rung?: number; color?: string; opacity: number;
  selected: boolean; selId: string; onSelect: (id: string | null) => void;
}): JSX.Element {
  const w = (n - 1) * spacing;
  return (
    <Clickable id={selId} onSelect={onSelect}>
      <group>
        {[rung / 2, -rung / 2].map((y, k) => (
          <mesh key={k} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, w + 0.2, 8]} />
            <Mat color={color} opacity={opacity} selected={selected} />
          </mesh>
        ))}
        {Array.from({ length: n }, (_, i) => (
          <mesh key={i} position={[-w / 2 + i * spacing, 0, 0]}>
            <boxGeometry args={[0.14, rung, 0.14]} />
            <Mat color={i % 2 ? '#f87171' : '#34d399'} opacity={opacity} selected={selected} />
          </mesh>
        ))}
      </group>
    </Clickable>
  );
}

export default function RdnaOverview(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stepIndex(t);
  const sel = (id: string) => selectedId === id;

  /** Per-step visibility: fade in 0.6 s, out 0.6 s. */
  const op = (i: number) => {
    const s = STEPS[i].start;
    return smooth((t - s) / 0.6) * (1 - smooth((t - (s + 4) + 0.6) / 0.6));
  };

  const crackK = smooth((t - 1) / 2);            // step 1: cell splits
  const dnaIn = smooth((t - 1.5) / 1.5);        // step 1: DNA emerges
  const cutSep = smooth((t - 5.2) / 2.4);       // step 2: fragments part
  const enzPulse = 1 + 0.12 * Math.sin(t * 7);  // step 2: enzyme pulse
  const pcr2 = smooth((t - 9) / 1);             // step 3: 2 copies
  const pcr4 = smooth((t - 10.4) / 1);          // step 3: 4 copies
  const fragIn = smooth((t - 12.6) / 1.6);      // step 4: fragment enters plasmid
  const ringClose = smooth((t - 14.2) / 1.2);   // step 4: plasmid seals
  const plasIn = smooth((t - 17) / 2.2);        // step 5: plasmid enters host
  const cultureGrow = smooth((t - 24.6) / 2.6); // step 7: cells multiply
  const ex = explode * 0.8;

  return (
    <group
      onClick={(e) => { e.stopPropagation(); onSelect(STEPS[si].id); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {showLabels && (
        <Html position={[0, 3.1, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{STEPS[si].name}</span>
        </Html>
      )}

      {/* ---- 1 · isolate DNA ---- */}
      <group visible={op(0) > 0.01}>
        {[1, -1].map((s) => (
          <mesh key={s} position={[s * crackK * 1.1, 0, 0]} rotation={[0, s * crackK * 0.5, 0]}>
            <sphereGeometry args={[1.6, 32, 24, s > 0 ? 0 : Math.PI, Math.PI]} />
            <Mat color="#7dd3fc" opacity={0.22 * op(0)} selected={sel('isolate-dna')} />
          </mesh>
        ))}
        <group scale={0.4 + 0.6 * dnaIn} position={[0, -0.2 + ex, 0]}>
          <MiniLadder n={7} opacity={dnaIn * op(0)} selected={sel('isolate-dna')} selId="isolate-dna" onSelect={onSelect} />
        </group>
        {showLabels && <PartLabel position={[0, -1.9, 0]} name="DNA isolated from cell" />}
      </group>

      {/* ---- 2 · cut with restriction enzyme ---- */}
      <group visible={op(1) > 0.01}>
        <group position={[-1.05 * cutSep, 0, 0]}>
          <MiniLadder n={4} opacity={op(1)} selected={sel('cut-dna')} selId="cut-dna" onSelect={onSelect} />
        </group>
        <group position={[1.05 * cutSep, 0, 0]}>
          <MiniLadder n={4} opacity={op(1)} selected={sel('cut-dna')} selId="cut-dna" onSelect={onSelect} />
        </group>
        <Clickable id="cut-dna" onSelect={onSelect}>
          {[0.55, -0.55].map((y, k) => (
            <mesh key={k} position={[0, y, 0.35]} scale={enzPulse * (1 - cutSep * 0.4)}>
              <sphereGeometry args={[0.42, 20, 14]} />
              <Mat color="#f97316" opacity={(1 - cutSep * 0.55) * op(1)} selected={sel('cut-dna')} />
            </mesh>
          ))}
        </Clickable>
        {showLabels && <PartLabel position={[0, 1.5, 0]} name="Restriction enzyme cuts DNA" />}
      </group>

      {/* ---- 3 · PCR amplification hint ---- */}
      <group visible={op(2) > 0.01}>
        <group position={[-1.4, 0.9, 0]} scale={0.75}>
          <MiniLadder n={4} opacity={op(2)} selected={sel('pcr')} selId="pcr" onSelect={onSelect} />
        </group>
        {pcr2 > 0.01 && (
          <group position={[1.4, 0.9, 0]} scale={0.75 * pcr2}>
            <MiniLadder n={4} opacity={pcr2 * op(2)} selected={sel('pcr')} selId="pcr" onSelect={onSelect} />
          </group>
        )}
        {pcr4 > 0.01 && (
          <group>
            {[[-1.4, -1.1], [1.4, -1.1]].map(([px, py], k) => (
              <group key={k} position={[px, py, 0]} scale={0.75 * pcr4}>
                <MiniLadder n={4} opacity={pcr4 * op(2)} selected={sel('pcr')} selId="pcr" onSelect={onSelect} />
              </group>
            ))}
          </group>
        )}
        {showLabels && <PartLabel position={[0, 2.2, 0]} name="PCR: 1 → 2 → 4 copies" />}
      </group>

      {/* ---- 4 · ligate into vector ---- */}
      <group visible={op(3) > 0.01}>
        <Clickable id="ligation" onSelect={onSelect}>
          <mesh rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[1.35, 0.1, 14, 72, Math.PI * 2 - 0.55 * (1 - ringClose)]} />
            <Mat color="#38bdf8" opacity={op(3)} selected={sel('ligation')} />
          </mesh>
        </Clickable>
        <group position={[-3.4 * (1 - fragIn), 0.35, 0.3]} rotation={[0, 0, 0.35]}>
          <MiniLadder n={4} spacing={0.42} opacity={fragIn * op(3)} selected={sel('ligation')} selId="ligation" onSelect={onSelect} />
        </group>
        {showLabels && <PartLabel position={[0, -1.9, 0]} name="Gene ligated into plasmid vector" />}
      </group>

      {/* ---- 5 · transfer into host ---- */}
      <group visible={op(4) > 0.01}>
        <Clickable id="transfer" onSelect={onSelect}>
          <mesh>
            <sphereGeometry args={[1.8, 40, 28]} />
            <Mat color="#86efac" opacity={0.16 * op(4)} selected={sel('transfer')} />
          </mesh>
          <mesh position={[-3.2 * (1 - plasIn), 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.55, 0.09, 12, 48]} />
            <Mat color="#38bdf8" opacity={plasIn * op(4)} selected={sel('transfer')} />
          </mesh>
        </Clickable>
        {showLabels && <PartLabel position={[0, -2.4, 0]} name="Recombinant plasmid enters host cell" />}
      </group>

      {/* ---- 6 · select transformants ---- */}
      <group visible={op(5) > 0.01}>
        <mesh rotation={[0, 0, 0]} position={[0, -0.35, 0]}>
          <cylinderGeometry args={[2.3, 2.3, 0.22, 48]} />
          <Mat color="#e2e8f0" opacity={op(5)} selected={sel('selection')} rough={0.7} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => {
          const cx = (i % 4 - 1.5) * 1.0;
          const cz = (Math.floor(i / 4) - 1) * 1.05;
          const alive = i % 3 === 0;
          const glow = alive ? 0.55 + 0.3 * Math.sin(t * 4 + i) : 0;
          return (
            <Clickable key={i} id="selection" onSelect={onSelect}>
              <mesh position={[cx, 0.05, cz]}>
                <sphereGeometry args={[0.22, 14, 10]} />
                <meshStandardMaterial
                  color={alive ? '#22c55e' : '#94a3b8'} transparent opacity={(alive ? 0.95 : 0.3) * op(5)}
                  roughness={0.5} emissive={alive ? '#22c55e' : '#000000'} emissiveIntensity={glow * (sel('selection') ? 1.4 : 1)}
                />
              </mesh>
            </Clickable>
          );
        })}
        {showLabels && <PartLabel position={[0, 1.6, 0]} name="Only transformants survive the antibiotic" />}
      </group>

      {/* ---- 7 · culture ---- */}
      <group visible={op(6) > 0.01}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          const r = 1.1 + ex;
          const s = 0.45 + 0.55 * cultureGrow;
          return (
            <Clickable key={i} id="culture" onSelect={onSelect}>
              <mesh position={[Math.cos(a) * r, Math.sin(a * 2) * 0.35, Math.sin(a) * r]} scale={s}>
                <sphereGeometry args={[0.55, 24, 18]} />
                <Mat color="#86efac" opacity={0.5 * op(6)} selected={sel('culture')} />
              </mesh>
            </Clickable>
          );
        })}
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 + 0.3;
          const rise = ((t * 0.7 + i * 0.37) % 1.4);
          return (
            <mesh key={i} position={[Math.cos(a) * 1.6, -0.6 + rise, Math.sin(a) * 1.6]}>
              <sphereGeometry args={[0.09, 10, 8]} />
              <Mat color="#facc15" opacity={cultureGrow * op(6) * (1 - rise / 1.6)} selected={sel('culture')} />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[0, -2.2, 0]} name="Culture multiplies — protein expressed" />}
      </group>
    </group>
  );
}
