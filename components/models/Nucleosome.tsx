'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Explode offset for a part: normalize(base) * explode * 1.4. */
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

function PartGroup({
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

const WRAP_TURNS = 1.65;
const WRAP_RADIUS = 0.78;
const OCT_R = 0.55;
const OCT_H = 0.8;
const CENTERS = [-2.5, 0, 2.5];

/** DNA tube geometry wrapping 1.65 turns around the histone core. */
function useWrapGeometry(): THREE.TubeGeometry {
  return useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const total = WRAP_TURNS * Math.PI * 2;
    for (let k = 0; k <= 120; k++) {
      const t = k / 120;
      const a = t * total;
      pts.push(
        new THREE.Vector3(
          WRAP_RADIUS * Math.cos(a),
          -OCT_H / 2 + 0.12 + t * (OCT_H - 0.24),
          WRAP_RADIUS * Math.sin(a),
        ),
      );
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.055, 10, false);
  }, []);
}

/** A straight linker DNA tube of unit length along +X, radius r. */
function useLinkerGeometry(): THREE.TubeGeometry {
  return useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)),
        8,
        0.055,
        10,
        false,
      ),
    [],
  );
}

export default function Nucleosome(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const wrapGeo = useWrapGeometry();
  const linkerGeo = useLinkerGeometry();

  // slight deterministic jitter so the three wraps don't look machine-identical
  const jitter = (i: number) => (rand(i * 17 + 3) - 0.5) * 0.12;

  return (
    <group rotation={[0, animTime * 0.15, 0]}>
      {/* ---- linker DNA: entry tail, inter-nucleosome links, exit tail ---- */}
      <PartGroup id="linker-dna" onSelect={onSelect}>
        {/* entry tail (left of first nucleosome) */}
        <mesh geometry={linkerGeo} position={[-4.6 + explode * -0.8, 0.28, 0]} scale={[CENTERS[0] - WRAP_RADIUS + 4.6, 1, 1]}>
          <meshStandardMaterial
            color="#0e7490"
            roughness={0.45}
            metalness={0.08}
            {...emissiveProps(sel('linker-dna'))}
          />
        </mesh>
        {/* links between nucleosomes */}
        {[0, 1].map((i) => {
          const x1 = CENTERS[i] + WRAP_RADIUS + explode * 0.9 * Math.sign(CENTERS[i]);
          const x2 = CENTERS[i + 1] - WRAP_RADIUS + explode * 0.9 * Math.sign(CENTERS[i + 1]);
          const len = Math.max(0.05, x2 - x1);
          return (
            <mesh key={i} geometry={linkerGeo} position={[x1, 0.28 + jitter(i), 0]} scale={[len, 1, 1]}>
              <meshStandardMaterial
                color="#0e7490"
                roughness={0.45}
                metalness={0.08}
                {...emissiveProps(sel('linker-dna'))}
              />
            </mesh>
          );
        })}
        {/* exit tail (right of last nucleosome) */}
        <mesh geometry={linkerGeo} position={[CENTERS[2] + WRAP_RADIUS + explode * 0.9, 0.28, 0]} scale={[4.6 - CENTERS[2] - WRAP_RADIUS, 1, 1]}>
          <meshStandardMaterial
            color="#0e7490"
            roughness={0.45}
            metalness={0.08}
            {...emissiveProps(sel('linker-dna'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0, 1.15, 0]} name="Linker DNA" />}
      </PartGroup>

      {/* ---- histone octamers + wrapped DNA, one group per nucleosome ---- */}
      {CENTERS.map((cx, i) => (
        <group key={i} position={explodeOffset([cx, 0, 0], explode)}>
          <PartGroup id="histone-octamer" onSelect={onSelect}>
            <group position={[cx, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[OCT_R, OCT_R, OCT_H, 32]} />
                <meshStandardMaterial
                  color="#8b5cf6"
                  roughness={0.5}
                  metalness={0.05}
                  {...emissiveProps(sel('histone-octamer'))}
                />
              </mesh>
              {Array.from({ length: 8 }).map((_, k) => {
                const inner = k < 4;
                const a = (k / 4) * Math.PI * 2 + (inner ? Math.PI / 4 : 0);
                const r = inner ? 0.3 : 0.42;
                return (
                  <mesh key={k} position={[Math.cos(a) * r, inner ? 0.22 : -0.22, Math.sin(a) * r]}>
                    <sphereGeometry args={[0.19, 18, 18]} />
                    <meshStandardMaterial
                      color={inner ? '#6d28d9' : '#a78bfa'}
                      roughness={0.45}
                      metalness={0.05}
                      {...emissiveProps(sel('histone-octamer'))}
                    />
                  </mesh>
                );
              })}
            </group>
            {showLabels && i === 0 && (
              <PartLabel position={[cx, -1.15, 0]} name="Histone octamer" />
            )}
          </PartGroup>
          <PartGroup id="nucleosome-dna" onSelect={onSelect}>
            <mesh geometry={wrapGeo} position={[cx, 0, 0]}>
              <meshStandardMaterial
                color="#22d3ee"
                roughness={0.4}
                metalness={0.1}
                {...emissiveProps(sel('nucleosome-dna'))}
              />
            </mesh>
            {showLabels && i === 2 && (
              <PartLabel position={[cx + 0.9, 0.75, 0]} name="DNA — 1.65 turns" />
            )}
          </PartGroup>
        </group>
      ))}
    </group>
  );
}
