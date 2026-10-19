'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected
    ? { emissive: '#38bdf8', emissiveIntensity: 0.4 }
    : { emissive: '#000000', emissiveIntensity: 0 };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

function ClickGroup({
  id,
  position,
  onSelect,
  children,
}: {
  id: string;
  position?: [number, number, number];
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      position={position ?? [0, 0, 0]}
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

const OLD = '#4f46e5'; // indigo — the original 15N parental strand
const NEW = '#22d3ee'; // cyan — newly synthesised 14N strand

const HELIX_R = 0.32;
const HELIX_H = 2.4;
const TURNS = 3;
const RUNGS = 10;

function strandGeometry(phase: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 100; k++) {
    const t = k / 100;
    const a = t * TURNS * Math.PI * 2 + phase;
    pts.push(
      new THREE.Vector3(HELIX_R * Math.cos(a), -HELIX_H / 2 + t * HELIX_H, HELIX_R * Math.sin(a)),
    );
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.075, 10, false);
}

/** One DNA molecule: two antiparallel strands, oldFlags = [strandA is old, strandB is old]. */
function DNAMolecule({
  oldFlags,
  opacity,
  rise,
  moleculeId,
  selectedId,
  onSelect,
}: {
  oldFlags: [boolean, boolean];
  opacity: number;
  rise: number;
  moleculeId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}): JSX.Element {
  const geos = useMemo(() => [strandGeometry(0), strandGeometry(Math.PI)], []);
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);

  const rungPts = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < RUNGS; i++) {
      const t = (i + 0.5) / RUNGS;
      const y = -HELIX_H / 2 + t * HELIX_H;
      const a = t * TURNS * Math.PI * 2;
      arr.push([HELIX_R * Math.cos(a) * 2 * 0.5, y, HELIX_R * Math.sin(a) * 2 * 0.5]);
    }
    return arr;
  }, []);

  if (opacity < 0.01) return <group />;

  return (
    <ClickGroup id={moleculeId} onSelect={onSelect}>
      <group position={[0, rise, 0]}>
        {[0, 1].map((s) => {
          const isOld = oldFlags[s];
          const strandId = isOld ? 'old-strand' : 'new-strand';
          const selected = selectedId === strandId || selectedId === moleculeId;
          return (
            <ClickGroup key={s} id={strandId} onSelect={onSelect}>
              <mesh geometry={geos[s]}>
                <meshStandardMaterial
                  color={isOld ? OLD : NEW}
                  roughness={0.4}
                  metalness={0.1}
                  transparent
                  opacity={opacity}
                  {...emissiveProps(selected)}
                />
              </mesh>
            </ClickGroup>
          );
        })}
        {/* rungs spanning the axis */}
        {rungPts.map((p, i) => {
          const a = ((i + 0.5) / RUNGS) * TURNS * Math.PI * 2;
          return (
            <mesh key={i} position={[0, p[1], 0]} rotation={[0, -a, 0]}>
              <boxGeometry args={[HELIX_R * 2, 0.09, 0.09]} />
              <meshStandardMaterial
                color="#cbd5e1"
                roughness={0.5}
                transparent
                opacity={opacity * 0.9}
                {...emissiveProps(selectedId === moleculeId)}
              />
            </mesh>
          );
        })}
      </group>
    </ClickGroup>
  );
}

export default function SemiconservativeReplication(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime } = props;
  const t = animTime % 24;

  // Stage windows: parental 0–7, gen-I hybrids 7–15, gen-II 15–24
  const parentalOp = 1 - smooth((t - 7) / 2);
  const gen1Op = smooth((t - 7) / 2) * (1 - smooth((t - 15) / 2));
  const gen2Op = smooth((t - 15) / 2);
  const gen1Rise = lerp(-1.4, 0, smooth((t - 7) / 2.5));
  const gen2Rise = lerp(-1.4, 0, smooth((t - 15) / 2.5));

  const stageName =
    t < 7
      ? 'Parental DNA — both strands 15N'
      : t < 15
        ? 'Generation I — two hybrid molecules (15N·14N)'
        : 'Generation II — two hybrid + two light molecules';

  return (
    <group>
      {showLabels && (
        <Html position={[0, 2.4, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{stageName}</span>
        </Html>
      )}

      {/* ---- parental molecule ---- */}
      <group position={[0, 0, 0]} visible={parentalOp > 0.01}>
        <DNAMolecule
          oldFlags={[true, true]}
          opacity={parentalOp}
          rise={0}
          moleculeId="parental-dna"
          selectedId={selectedId}
          onSelect={onSelect}
        />
        {showLabels && parentalOp > 0.5 && <PartLabel position={[0, -1.9, 0]} name="Parental (15N·15N)" />}
      </group>

      {/* ---- generation I: two hybrid molecules ---- */}
      <group visible={gen1Op > 0.01}>
        {[-1.7, 1.7].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <DNAMolecule
              oldFlags={[true, false]}
              opacity={gen1Op}
              rise={gen1Rise}
              moleculeId="hybrid-dna"
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </group>
        ))}
        {showLabels && gen1Op > 0.5 && <PartLabel position={[0, -2.05, 0]} name="Hybrids — one old + one new strand" />}
      </group>

      {/* ---- generation II: two hybrid + two light ---- */}
      <group visible={gen2Op > 0.01}>
        {[
          { x: -2.7, flags: [false, false] as [boolean, boolean] },
          { x: -0.9, flags: [true, false] as [boolean, boolean] },
          { x: 0.9, flags: [true, false] as [boolean, boolean] },
          { x: 2.7, flags: [false, false] as [boolean, boolean] },
        ].map((m, i) => (
          <group key={i} position={[m.x, 0, 0]}>
            <DNAMolecule
              oldFlags={m.flags}
              opacity={gen2Op}
              rise={gen2Rise}
              moleculeId="second-gen-dna"
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </group>
        ))}
        {showLabels && gen2Op > 0.5 && (
          <PartLabel position={[0, -2.05, 0]} name="Gen II — hybrid pair + light pair" />
        )}
      </group>

      {/* ---- legend: old vs new strand ---- */}
      <ClickGroup id="old-strand" onSelect={onSelect} position={[-3.6, -2.6, 0]}>
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color={OLD} roughness={0.4} {...emissiveProps(selectedId === 'old-strand')} />
        </mesh>
        {showLabels && <PartLabel position={[0.75, 0, 0]} name="Old strand (15N)" />}
      </ClickGroup>
      <ClickGroup id="new-strand" onSelect={onSelect} position={[-3.6, -3.15, 0]}>
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color={NEW} roughness={0.4} {...emissiveProps(selectedId === 'new-strand')} />
        </mesh>
        {showLabels && <PartLabel position={[0.75, 0, 0]} name="New strand (14N)" />}
      </ClickGroup>
    </group>
  );
}
