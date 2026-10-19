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

/** Explode offset: base direction * explode * 1.4. */
function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

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
  children: ReactNode;
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

interface Tube {
  position: [number, number, number];
  quaternion: THREE.Quaternion;
  length: number;
  radius: number;
}

function tubeBetween(a: [number, number, number], b: [number, number, number], r: number): Tube {
  const va = new THREE.Vector3(a[0], a[1], a[2]);
  const vb = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = vb.clone().sub(va);
  const length = dir.length();
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.normalize(),
  );
  return { position: [mid.x, mid.y, mid.z], quaternion, length, radius: r };
}

interface Seg extends Tube {
  end: [number, number, number];
  level: number;
}

/** Deterministic binary branching airway tree. */
function buildTree(
  start: [number, number, number],
  dir: THREE.Vector3,
  len: number,
  level: number,
  seedBase: number,
): Seg[] {
  const segs: Seg[] = [];
  const s = new THREE.Vector3(start[0], start[1], start[2]);
  const e = s.clone().add(dir.clone().multiplyScalar(len));
  const t = tubeBetween([s.x, s.y, s.z], [e.x, e.y, e.z], 0.075 - level * 0.014);
  segs.push({ ...t, end: [e.x, e.y, e.z], level });
  if (level < 3) {
    for (const side of [-1, 1]) {
      const ax = new THREE.Vector3(
        rand(seedBase + side * 7 + level * 131) - 0.5,
        rand(seedBase + side * 13 + level * 257) - 0.5,
        rand(seedBase + side * 29 + level * 389) - 0.5,
      ).normalize();
      const nd = dir
        .clone()
        .applyAxisAngle(ax, (0.38 + rand(seedBase + side * 43 + level * 61) * 0.35) * side);
      nd.y -= 0.18; // bias downward into the lung
      nd.normalize();
      segs.push(...buildTree([e.x, e.y, e.z], nd, len * 0.68, level + 1, seedBase + 911));
    }
  }
  return segs;
}

function cRingGeometry(R: number, tubeR: number, gap: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const N = 48;
  for (let i = 0; i <= N; i += 1) {
    // uncovered arc centered at theta = -PI/2 (posterior, -z)
    const th = gap / 2 - Math.PI / 2 + (i / N) * (Math.PI * 2 - gap);
    pts.push(new THREE.Vector3(R * Math.cos(th), 0, R * Math.sin(th)));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, tubeR, 10, false);
}

const LUNG_R = { cx: -1.6, cy: -0.75 }; // subject's right lung (viewer left)
const LUNG_L = { cx: 1.6, cy: -0.75 }; // subject's left lung (viewer right)

export default function RespiratorySystem(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const ringGeo = useMemo(() => cRingGeometry(0.34, 0.052, 1.15), []);

  const rightTree = useMemo(
    () => buildTree([-1.05, -0.35, 0], new THREE.Vector3(-0.45, -0.85, 0.1).normalize(), 0.62, 0, 5),
    [],
  );
  const leftTree = useMemo(
    () => buildTree([1.05, -0.35, 0], new THREE.Vector3(0.45, -0.85, 0.1).normalize(), 0.62, 0, 5005),
    [],
  );

  const rings = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <group>
      {/* ---- nasal cavity hint ---- */}
      <PartGroup id="nasal-cavity" position={explodeOffset([0, 3.4, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 3.25, 0.12]} rotation={[0.5, 0, 0]}>
          <capsuleGeometry args={[0.17, 0.42, 8, 16]} />
          <meshStandardMaterial color="#f4a7b9" roughness={0.5} metalness={0.02} {...emissiveProps(sel('nasal-cavity'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.75, 3.45, 0.1]} name="Nasal cavity" />}
      </PartGroup>

      {/* ---- pharynx ---- */}
      <PartGroup id="pharynx" position={explodeOffset([0, 2.9, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 2.82, 0]}>
          <cylinderGeometry args={[0.21, 0.24, 0.42, 20]} />
          <meshStandardMaterial color="#f2a0a8" roughness={0.5} metalness={0.02} {...emissiveProps(sel('pharynx'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.8, 2.85, 0]} name="Pharynx" />}
      </PartGroup>

      {/* ---- larynx ---- */}
      <PartGroup id="larynx" position={explodeOffset([0, 2.45, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 2.42, 0]}>
          <cylinderGeometry args={[0.3, 0.27, 0.34, 20]} />
          <meshStandardMaterial color="#e8b4a0" roughness={0.45} metalness={0.05} {...emissiveProps(sel('larynx'))} />
        </mesh>
        <mesh position={[0, 2.52, 0]}>
          <torusGeometry args={[0.3, 0.05, 10, 28]} />
          <meshStandardMaterial color="#d99a86" roughness={0.45} metalness={0.05} {...emissiveProps(sel('larynx'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.9, 2.5, 0]} name="Larynx" />}
      </PartGroup>

      {/* ---- trachea with C-shaped cartilage rings ---- */}
      <PartGroup id="trachea" position={explodeOffset([0, 1.4, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 1.7, 20, 1, true]} />
          <meshStandardMaterial
            color="#f6d7c3"
            transparent
            opacity={0.55}
            roughness={0.4}
            metalness={0.02}
            side={THREE.DoubleSide}
            depthWrite={false}
            {...emissiveProps(sel('trachea'))}
          />
        </mesh>
        {rings.map((i) => (
          <mesh key={i} position={[0, 2.02 - i * 0.19, 0]} geometry={ringGeo}>
            <meshStandardMaterial color="#d9a08c" roughness={0.45} metalness={0.05} {...emissiveProps(sel('trachea'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.95, 1.35, 0]} name="Trachea" />}
      </PartGroup>

      {/* ---- primary bronchi ---- */}
      <PartGroup id="bronchus" position={explodeOffset([0, 0.15, 0], explode)} onSelect={onSelect}>
        {(
          [
            tubeBetween([0, 0.52, 0], [-1.05, -0.35, 0], 0.17),
            tubeBetween([0, 0.52, 0], [1.05, -0.35, 0], 0.17),
          ] as Tube[]
        ).map((t, i) => (
          <mesh key={i} position={t.position} quaternion={t.quaternion}>
            <cylinderGeometry args={[t.radius, t.radius * 0.9, t.length, 16]} />
            <meshStandardMaterial color="#eab49a" roughness={0.45} metalness={0.05} {...emissiveProps(sel('bronchus'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-0.85, -0.32, 0.55]} name="Bronchus" />}
      </PartGroup>

      {/* ---- bronchiole trees (right + left) ---- */}
      <PartGroup id="bronchiole" position={explodeOffset([-1.25, -0.9, 0], explode)} onSelect={onSelect}>
        {rightTree.map((s, i) => (
          <mesh key={i} position={s.position} quaternion={s.quaternion}>
            <cylinderGeometry args={[s.radius, s.radius * 0.85, s.length, 8]} />
            <meshStandardMaterial color="#e8b08e" roughness={0.5} metalness={0.03} {...emissiveProps(sel('bronchiole'))} />
          </mesh>
        ))}
        {rightTree
          .filter((s) => s.level === 3)
          .map((s, i) => (
            <mesh key={`t${i}`} position={s.end}>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshStandardMaterial color="#fda4af" roughness={0.5} metalness={0} {...emissiveProps(sel('bronchiole'))} />
            </mesh>
          ))}
        {showLabels && <PartLabel position={[-2.15, -1.35, 0.75]} name="Bronchiole" />}
      </PartGroup>
      <PartGroup id="bronchiole" position={explodeOffset([1.25, -0.9, 0], explode)} onSelect={onSelect}>
        {leftTree.map((s, i) => (
          <mesh key={i} position={s.position} quaternion={s.quaternion}>
            <cylinderGeometry args={[s.radius, s.radius * 0.85, s.length, 8]} />
            <meshStandardMaterial color="#e8b08e" roughness={0.5} metalness={0.03} {...emissiveProps(sel('bronchiole'))} />
          </mesh>
        ))}
        {leftTree
          .filter((s) => s.level === 3)
          .map((s, i) => (
            <mesh key={`t${i}`} position={s.end}>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshStandardMaterial color="#fda4af" roughness={0.5} metalness={0} {...emissiveProps(sel('bronchiole'))} />
            </mesh>
          ))}
      </PartGroup>

      {/* ---- lungs: right (3 lobes), left (2 lobes) ---- */}
      <PartGroup id="lung" position={explodeOffset([LUNG_R.cx, LUNG_R.cy, 0], explode)} onSelect={onSelect}>
        {[
          { y: 0.05, s: [0.82, 0.92, 0.62] },
          { y: -0.95, s: [1.0, 0.98, 0.68] },
          { y: -1.85, s: [0.88, 0.82, 0.6] },
        ].map((l, i) => (
          <mesh key={i} position={[LUNG_R.cx, LUNG_R.cy + l.y + 0.75, 0]} scale={l.s as [number, number, number]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color="#ef9a9a"
              transparent
              opacity={0.88}
              roughness={0.55}
              metalness={0.02}
              {...emissiveProps(sel('lung'))}
            />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-2.75, 0.75, 0.3]} name="Lung" />}
      </PartGroup>
      <PartGroup id="lung" position={explodeOffset([LUNG_L.cx, LUNG_L.cy, 0], explode)} onSelect={onSelect}>
        {[
          { y: -0.2, s: [0.72, 1.0, 0.58] },
          { y: -1.25, s: [0.8, 0.9, 0.6] },
        ].map((l, i) => (
          <mesh key={i} position={[LUNG_L.cx, LUNG_L.cy + l.y + 0.75, 0]} scale={l.s as [number, number, number]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color="#ef9a9a"
              transparent
              opacity={0.88}
              roughness={0.55}
              metalness={0.02}
              {...emissiveProps(sel('lung'))}
            />
          </mesh>
        ))}
      </PartGroup>

      {/* ---- diaphragm sheet ---- */}
      <PartGroup id="diaphragm" position={explodeOffset([0, -2.6, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, -2.55, 0]} scale={[1.25, 0.32, 0.95]}>
          <sphereGeometry args={[2.1, 40, 20, 0, Math.PI * 2, 0, 1.05]} />
          <meshStandardMaterial color="#d4596b" roughness={0.5} metalness={0.05} {...emissiveProps(sel('diaphragm'))} />
        </mesh>
        {showLabels && <PartLabel position={[2.35, -2.35, 0]} name="Diaphragm" />}
      </PartGroup>
    </group>
  );
}
