'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

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

type Pt = [number, number, number];

function helixPoints(
  cx: number,
  r: number,
  turns: number,
  y0: number,
  y1: number,
  startAngle: number,
  n: number,
): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const a = startAngle + t * turns * Math.PI * 2;
    pts.push([cx + r * Math.cos(a), y0 + (y1 - y0) * t, r * 0.8 * Math.sin(a)]);
  }
  return pts;
}

function tubeFromPoints(points: Pt[], radius: number, segs = 120): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.TubeGeometry(curve, segs, radius, 10, false);
}

const GLOM = new THREE.Vector3(0, 2.3, 0);

export default function Nephron(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  // ---- tubule segment paths ----
  const pctGeo = useMemo(
    () =>
      tubeFromPoints(
        [[0.42, 2.02, 0], [0.72, 2.06, 0.06], ...helixPoints(1.05, 0.3, 3, 2.0, 1.45, 0.6, 60)],
        0.11,
      ),
    [],
  );
  const loopGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [1.02, 1.45, 0.02],
          [1.05, 0.8, 0],
          [1.0, 0.0, -0.02],
          [1.02, -0.8, 0],
          [1.0, -1.55, 0],
          [0.98, -1.95, 0],
          [0.8, -2.2, 0],
          [0.58, -2.22, 0],
          [0.47, -2.05, 0],
          [0.45, -1.8, 0],
          [0.44, -1.1, 0],
          [0.46, -0.4, 0.02],
          [0.45, 0.3, 0],
          [0.47, 0.9, 0],
          [0.45, 1.2, 0],
        ],
        0.09,
        160,
      ),
    [],
  );
  const dctGeo = useMemo(
    () =>
      tubeFromPoints(
        [[0.45, 1.2, 0], [0.1, 1.28, 0.05], ...helixPoints(-0.35, 0.26, 2.5, 1.5, 1.05, 2.2, 50)],
        0.11,
      ),
    [],
  );
  const ductGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-0.35, 1.05, 0],
          [-0.33, 0.5, 0],
          [-0.35, -0.3, 0],
          [-0.33, -1.1, 0],
          [-0.35, -1.9, 0],
        ],
        0.14,
        80,
      ),
    [],
  );
  const afferentGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-1.4, 3.15, 0],
          [-0.9, 2.9, 0],
          [-0.4, 2.62, 0],
          [-0.12, 2.45, 0],
        ],
        0.11,
        40,
      ),
    [],
  );
  const efferentGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [0.12, 2.42, 0],
          [0.5, 2.6, 0],
          [0.9, 2.85, 0],
          [1.25, 3.0, 0],
        ],
        0.07,
        40,
      ),
    [],
  );
  const periGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [1.38, 1.55, 0.12],
          [1.34, 0.7, 0.16],
          [1.38, -0.1, 0.12],
          [1.32, -0.9, 0.14],
          [1.36, -1.6, 0.12],
        ],
        0.04,
        60,
      ),
    [],
  );

  // ---- glomerular tuft: seeded capillary loops ----
  const tuftLoops = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        r: 0.15 + rand(i * 13 + 1) * 0.09,
        pos: [
          (rand(i * 13 + 2) - 0.5) * 0.34,
          (rand(i * 13 + 3) - 0.5) * 0.34,
          (rand(i * 13 + 4) - 0.5) * 0.34,
        ] as [number, number, number],
        rot: [rand(i * 13 + 5) * Math.PI, rand(i * 13 + 6) * Math.PI, rand(i * 13 + 7) * Math.PI] as [
          number,
          number,
          number,
        ],
      })),
    [],
  );

  const segMat = (color: string, id: string) => (
    <meshStandardMaterial color={color} roughness={0.45} metalness={0.06} {...emissiveProps(sel(id))} />
  );

  return (
    <group>
      {/* ---- Glomerulus + Bowman's capsule (renal corpuscle) ---- */}
      <PartGroup id="glomerulus" position={explodeOffset([0, 1, 0], explode)} onSelect={onSelect}>
        <group position={GLOM}>
          {tuftLoops.map((l, i) => (
            <mesh key={i} position={l.pos} rotation={l.rot}>
              <torusGeometry args={[l.r, 0.05, 10, 28]} />
              <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.08} {...emissiveProps(sel('glomerulus'))} />
            </mesh>
          ))}
        </group>
        {showLabels && <PartLabel position={[0, 3.05, 0]} name="Glomerulus" />}
      </PartGroup>
      <PartGroup id="bowmans-capsule" position={explodeOffset([-0.5, 0.9, 0], explode)} onSelect={onSelect}>
        <mesh position={GLOM}>
          <sphereGeometry args={[0.56, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.78]} />
          <meshStandardMaterial
            color="#fde68a"
            transparent
            opacity={0.55}
            roughness={0.45}
            metalness={0.04}
            side={THREE.DoubleSide}
            depthWrite={false}
            {...emissiveProps(sel('bowmans-capsule'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-1.0, 2.35, 0]} name="Bowman's capsule" />}
      </PartGroup>

      {/* ---- Afferent (in, wider) / efferent (out, narrower) arterioles ---- */}
      <PartGroup id="afferent-arteriole" position={explodeOffset([-0.6, 1, 0], explode)} onSelect={onSelect}>
        <mesh geometry={afferentGeo}>
          <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.08} {...emissiveProps(sel('afferent-arteriole'))} />
        </mesh>
        {showLabels && <PartLabel position={[-1.5, 3.35, 0]} name="Afferent arteriole" />}
      </PartGroup>
      <PartGroup id="efferent-arteriole" position={explodeOffset([0.7, 1, 0], explode)} onSelect={onSelect}>
        <mesh geometry={efferentGeo}>
          <meshStandardMaterial color="#991b1b" roughness={0.4} metalness={0.08} {...emissiveProps(sel('efferent-arteriole'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.55, 3.2, 0]} name="Efferent arteriole" />}
      </PartGroup>

      {/* ---- PCT: proximal convoluted tubule ---- */}
      <PartGroup id="pct" position={explodeOffset([1, 0.3, 0], explode)} onSelect={onSelect}>
        <mesh geometry={pctGeo}>{segMat('#f97316', 'pct')}</mesh>
        {showLabels && <PartLabel position={[1.85, 1.8, 0]} name="PCT" />}
      </PartGroup>

      {/* ---- Loop of Henle: descending limb, hairpin, ascending limb ---- */}
      <PartGroup id="loop-of-henle" position={explodeOffset([0.4, -0.8, 0], explode)} onSelect={onSelect}>
        <mesh geometry={loopGeo}>{segMat('#14b8a6', 'loop-of-henle')}</mesh>
        {showLabels && <PartLabel position={[1.55, -1.2, 0]} name="Loop of Henle" />}
      </PartGroup>

      {/* ---- DCT: distal convoluted tubule ---- */}
      <PartGroup id="dct" position={explodeOffset([-0.9, 0.4, 0], explode)} onSelect={onSelect}>
        <mesh geometry={dctGeo}>{segMat('#a855f7', 'dct')}</mesh>
        {showLabels && <PartLabel position={[-1.05, 1.35, 0]} name="DCT" />}
      </PartGroup>

      {/* ---- Collecting duct ---- */}
      <PartGroup id="collecting-duct" position={explodeOffset([-0.5, -0.7, 0], explode)} onSelect={onSelect}>
        <mesh geometry={ductGeo}>{segMat('#3b82f6', 'collecting-duct')}</mesh>
        {showLabels && <PartLabel position={[-0.35, -2.4, 0]} name="Collecting duct" />}
      </PartGroup>

      {/* ---- Peritubular capillary hint ---- */}
      <PartGroup id="peritubular-capillary" position={explodeOffset([1.1, -0.3, 0], explode)} onSelect={onSelect}>
        <mesh geometry={periGeo}>
          <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.08} {...emissiveProps(sel('peritubular-capillary'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.85, 0.1, 0.14]} name="Peritubular capillary" />}
      </PartGroup>
    </group>
  );
}
