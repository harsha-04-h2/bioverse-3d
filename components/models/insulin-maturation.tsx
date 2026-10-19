'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Fig 10.3 — proinsulin → mature insulin (total 24 s):
   0–8   proinsulin: B chain + C-peptide + A chain, disulfide bonds in place
   8–14  cleavage flashes at the two B–C and C–A junctions
   14–24 C-peptide drifts away and fades → mature insulin (A + B) remains */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

const STAGES = [
  { id: 'proinsulin', name: 'Proinsulin', start: 0, end: 8, desc: 'One long chain: B chain, then the C-peptide loop, then the A chain — already folded with its disulfide staples.' },
  { id: 'cleavage', name: 'C-peptide cut out', start: 8, end: 14, desc: 'Enzymes snip the chain at both ends of the C-peptide, freeing it from the A and B chains.' },
  { id: 'mature', name: 'Mature insulin', start: 14, end: 24, desc: 'The C-peptide drifts off; the A and B chains stay locked together as active insulin.' },
];
function stageIndex(t: number): number {
  if (t < 8) return 0;
  if (t < 14) return 1;
  return 2;
}

const B_PTS = [
  [-1.0, 1.15, 0], [-1.06, 0.55, 0.12], [-0.94, 0.0, -0.1], [-1.06, -0.55, 0.1], [-1.0, -1.1, 0],
];
const A_PTS = [
  [1.0, 1.15, 0], [1.06, 0.55, -0.12], [0.94, 0.0, 0.1], [1.06, -0.55, -0.1], [1.0, -1.1, 0],
];
const C_PTS = [
  [-1.0, -1.1, 0], [-0.75, -1.75, 0.15], [0.0, -2.05, -0.1], [0.8, -1.95, 0.12],
  [1.25, -1.45, -0.08], [1.15, -0.8, 0.08], [1.05, -0.1, -0.06], [1.0, 0.55, 0.05], [1.0, 1.15, 0],
];
const JUNCTION_B = new THREE.Vector3(-1.0, -1.1, 0); // B–C cut site
const JUNCTION_A = new THREE.Vector3(1.0, 1.15, 0);  // C–A cut site

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

interface RodT { mid: THREE.Vector3; quat: THREE.Quaternion; len: number }
function rodBetween(p1: THREE.Vector3, p2: THREE.Vector3): RodT {
  const dir = p2.clone().sub(p1);
  const len = dir.length();
  const mid = p1.clone().add(p2).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return { mid, quat, len };
}

export default function InsulinMaturation(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stageIndex(t);
  const sel = (id: string) => selectedId === id;

  const { curveA, curveB, curveC, rods, intraRod } = useMemo(() => {
    const v = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
    const curveA = new THREE.CatmullRomCurve3(A_PTS.map(v));
    const curveB = new THREE.CatmullRomCurve3(B_PTS.map(v));
    const curveC = new THREE.CatmullRomCurve3(C_PTS.map(v));
    // 2 inter-chain disulfides (near the N-termini and near the C-termini)
    const rods = [
      rodBetween(curveA.getPoint(0.12), curveB.getPoint(0.12)),
      rodBetween(curveA.getPoint(0.88), curveB.getPoint(0.88)),
    ];
    // 1 intra-chain disulfide looping back on the A chain
    const intraRod = rodBetween(curveA.getPoint(0.08), curveA.getPoint(0.3));
    return { curveA, curveB, curveC, rods, intraRod };
  }, []);

  const cleaveK = smooth((t - 8) / 2) * (1 - smooth((t - 13) / 1)); // flash 8–14
  const cK = smooth((t - 14) / 5);                                  // C-peptide leaves
  const cOp = 1 - cK;
  const e = explode;

  return (
    <group
      rotation={[0, t * 0.25, 0]}
      onClick={(e2) => { e2.stopPropagation(); onSelect(STAGES[si].id); }}
      onPointerOver={(e2) => { e2.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {showLabels && (
        <Html position={[0, 2.9, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{STAGES[si].name}</span>
        </Html>
      )}

      {/* ---- B chain (30 aa) ---- */}
      <group position={[-e * 0.9, 0, 0]}>
        <Clickable id="b-chain" onSelect={onSelect}>
          <mesh>
            <tubeGeometry args={[curveB, 64, 0.1, 12, false]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.1} {...emissiveProps(sel('b-chain'))} />
          </mesh>
        </Clickable>
        {showLabels && <PartLabel position={[-1.85, 0.7, 0]} name="B chain (30 aa)" />}
      </group>

      {/* ---- A chain (21 aa) ---- */}
      <group position={[e * 0.9, 0, 0]}>
        <Clickable id="a-chain" onSelect={onSelect}>
          <mesh>
            <tubeGeometry args={[curveA, 64, 0.1, 12, false]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.4} metalness={0.1} {...emissiveProps(sel('a-chain'))} />
          </mesh>
        </Clickable>
        {showLabels && <PartLabel position={[1.85, 0.7, 0]} name="A chain (21 aa)" />}
      </group>

      {/* ---- disulfide bonds: 2 inter-chain + 1 intra-chain ---- */}
      <Clickable id="disulfide" onSelect={onSelect}>
        {rods.map((r, k) => (
          <mesh key={k} position={r.mid} quaternion={r.quat}>
            <cylinderGeometry args={[0.05, 0.05, r.len, 10]} />
            <meshStandardMaterial color="#fde047" roughness={0.3} metalness={0.3} {...emissiveProps(sel('disulfide'))} />
          </mesh>
        ))}
      </Clickable>
      <Clickable id="disulfide-intra" onSelect={onSelect}>
        <mesh position={intraRod.mid} quaternion={intraRod.quat}>
          <cylinderGeometry args={[0.05, 0.05, intraRod.len, 10]} />
          <meshStandardMaterial color="#fde047" roughness={0.3} metalness={0.3} {...emissiveProps(sel('disulfide-intra'))} />
        </mesh>
      </Clickable>
      {showLabels && <PartLabel position={[0, 1.35, 0.5]} name="Disulfide bonds" />}

      {/* ---- C-peptide (33 aa): cleaved and discarded ---- */}
      {cOp > 0.01 && (
        <group position={[0, -cK * 0.6, cK * 2.4 + e * 1.2]}>
          <Clickable id="c-peptide" onSelect={onSelect}>
            <mesh>
              <tubeGeometry args={[curveC, 96, 0.09, 12, false]} />
              <meshStandardMaterial
                color="#a78bfa" transparent opacity={cOp} roughness={0.45} metalness={0.08}
                {...emissiveProps(sel('c-peptide'))}
              />
            </mesh>
          </Clickable>
          {showLabels && t < 14 && <PartLabel position={[0.1, -2.5, 0]} name="C-peptide (33 aa)" />}
        </group>
      )}

      {/* ---- cleavage flashes at the two junctions ---- */}
      {cleaveK > 0.01 &&
        [JUNCTION_B, JUNCTION_A].map((p, k) => (
          <mesh key={k} position={[p.x, p.y, p.z]} scale={cleaveK * (1 + 0.3 * Math.sin(t * 12 + k * 2))}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshStandardMaterial
              color="#fef08a" transparent opacity={cleaveK} roughness={0.2}
              emissive="#facc15" emissiveIntensity={1.6 * cleaveK}
            />
          </mesh>
        ))}
    </group>
  );
}
