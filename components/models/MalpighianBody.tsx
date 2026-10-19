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

function tubeFromPoints(points: Pt[], radius: number): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.TubeGeometry(curve, 40, radius, 10, false);
}

const CAP_R = 0.85;

export default function MalpighianBody(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  // Glomerular capillary loops: seeded tori packed into a ball.
  const tuftLoops = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        r: 0.2 + rand(i * 17 + 1) * 0.1,
        pos: [
          (rand(i * 17 + 2) - 0.5) * 0.44,
          (rand(i * 17 + 3) - 0.5) * 0.44,
          (rand(i * 17 + 4) - 0.5) * 0.44,
        ] as [number, number, number],
        rot: [rand(i * 17 + 5) * Math.PI, rand(i * 17 + 6) * Math.PI, rand(i * 17 + 7) * Math.PI] as [
          number,
          number,
          number,
        ],
      })),
    [],
  );

  // Podocytes: small cell bodies dotted over the capillary tuft surface.
  const podocytes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const theta = rand(i * 23 + 1) * Math.PI * 2;
        const phi = Math.acos(2 * rand(i * 23 + 2) - 1);
        const r = 0.42 + rand(i * 23 + 3) * 0.08;
        return [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ] as [number, number, number];
      }),
    [],
  );

  const afferentGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [-2.0, 1.0, 0.25],
          [-1.3, 0.72, 0.16],
          [-0.7, 0.48, 0.08],
          [-0.3, 0.32, 0.02],
        ],
        0.14,
      ),
    [],
  );
  const efferentGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [0.3, 0.34, -0.02],
          [0.75, 0.55, -0.08],
          [1.35, 0.82, -0.16],
          [2.0, 1.1, -0.25],
        ],
        0.09,
      ),
    [],
  );
  const outletGeo = useMemo(() => tubeFromPoints([[0, -0.8, 0], [0.05, -1.25, 0], [0.12, -1.7, 0]], 0.12), []);

  // Cutaway-style capsule: parietal shell with a front wedge removed so the
  // tuft and capsular space stay visible.
  const capsuleShell = (radius: number, color: string, opacity: number, id: string) => (
    <mesh>
      <sphereGeometry args={[radius, 40, 28, 0.7, Math.PI * 2 - 1.4, 0, Math.PI * 0.85]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={0.45}
        metalness={0.04}
        side={THREE.DoubleSide}
        depthWrite={false}
        {...emissiveProps(sel(id))}
      />
    </mesh>
  );

  return (
    <group>
      {/* ---- Glomerulus: capillary tuft ---- */}
      <PartGroup id="glomerulus" position={explodeOffset([0, 0, 0.2], explode)} onSelect={onSelect}>
        {tuftLoops.map((l, i) => (
          <mesh key={i} position={l.pos} rotation={l.rot}>
            <torusGeometry args={[l.r, 0.07, 10, 28]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.08} {...emissiveProps(sel('glomerulus'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0, -0.85, 0.3]} name="Glomerulus" />}
      </PartGroup>

      {/* ---- Podocytes wrapping the capillaries ---- */}
      <PartGroup id="podocyte" position={explodeOffset([0, 0.6, 0.6], explode)} onSelect={onSelect}>
        {podocytes.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color="#f472b6" roughness={0.5} metalness={0.02} {...emissiveProps(sel('podocyte'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.75, 0.75, 0.35]} name="Podocyte" />}
      </PartGroup>

      {/* ---- Bowman's capsule: parietal layer (cut open at the front) ---- */}
      <PartGroup id="bowmans-capsule" position={explodeOffset([0, 0, 1.0], explode)} onSelect={onSelect}>
        {capsuleShell(CAP_R, '#fde68a', 0.6, 'bowmans-capsule')}
        {showLabels && <PartLabel position={[-1.25, 0.75, 0.3]} name="Bowman's capsule" />}
      </PartGroup>

      {/* ---- Capsular space: the filtrate-collecting gap inside ---- */}
      <PartGroup id="capsular-space" position={explodeOffset([0, 0, 0.55], explode)} onSelect={onSelect}>
        {capsuleShell(CAP_R - 0.09, '#ffffff', 0.16, 'capsular-space')}
        {showLabels && <PartLabel position={[1.3, -0.5, 0.3]} name="Capsular space" />}
      </PartGroup>

      {/* ---- Afferent (wider, in) / efferent (narrower, out) arterioles ---- */}
      <PartGroup id="afferent-arteriole" position={explodeOffset([-1, 0.5, 0], explode)} onSelect={onSelect}>
        <mesh geometry={afferentGeo}>
          <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.08} {...emissiveProps(sel('afferent-arteriole'))} />
        </mesh>
        {showLabels && <PartLabel position={[-2.0, 1.45, 0.25]} name="Afferent arteriole" />}
      </PartGroup>
      <PartGroup id="efferent-arteriole" position={explodeOffset([1, 0.55, 0], explode)} onSelect={onSelect}>
        <mesh geometry={efferentGeo}>
          <meshStandardMaterial color="#991b1b" roughness={0.4} metalness={0.08} {...emissiveProps(sel('efferent-arteriole'))} />
        </mesh>
        {showLabels && <PartLabel position={[2.05, 1.5, -0.25]} name="Efferent arteriole" />}
      </PartGroup>

      {/* ---- Capsule outlet toward the PCT ---- */}
      <mesh geometry={outletGeo}>
        <meshStandardMaterial color="#f5d78e" roughness={0.5} metalness={0.04} />
      </mesh>
    </group>
  );
}
