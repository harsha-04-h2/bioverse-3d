'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

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

/**
 * Bean geometry: a sphere scaled to kidney proportions with a Gaussian dent
 * carved into the +x (medial) face — the hilum where vessels and the ureter
 * enter/exit.
 */
function useBeanGeometry(sx: number, sy: number, sz: number, dent: number): THREE.BufferGeometry {
  return useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 48, 32);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i) * sx;
      const y = pos.getY(i) * sy;
      const z = pos.getZ(i) * sz;
      let nx = x;
      if (x > 0) {
        const g = Math.exp(-((y / (sy * 0.38)) ** 2)) * Math.min(1, x / (sx * 0.5));
        nx -= dent * g;
      }
      pos.setXYZ(i, nx, y, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [sx, sy, sz, dent]);
}

function tubeGeometry(points: [number, number, number][], radius: number): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.TubeGeometry(curve, 48, radius, 12, false);
}

const KIDNEY_L: [number, number, number] = [-1.55, 1.15, 0];
const KIDNEY_R: [number, number, number] = [1.55, 1.15, 0];

export default function UrinarySystem(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;
  const beanGeo = useBeanGeometry(0.85, 1.3, 0.68, 0.34);

  const ureterL = useMemo(
    () =>
      tubeGeometry(
        [
          [-0.98, 0.95, 0],
          [-1.02, 0.2, 0],
          [-0.72, -0.6, 0],
          [-0.32, -1.28, 0],
        ],
        0.09,
      ),
    [],
  );
  const ureterR = useMemo(
    () =>
      tubeGeometry(
        [
          [0.98, 0.95, 0],
          [1.02, 0.2, 0],
          [0.72, -0.6, 0],
          [0.32, -1.28, 0],
        ],
        0.09,
      ),
    [],
  );
  const urethraGeo = useMemo(() => tubeGeometry([[0, -2.28, 0], [0, -2.95, 0]], 0.12), []);
  const aortaGeo = useMemo(() => tubeGeometry([[-0.4, 3.0, -0.18], [-0.4, -0.9, -0.18]], 0.15), []);
  const ivcGeo = useMemo(() => tubeGeometry([[0.4, 3.0, -0.18], [0.4, -0.9, -0.18]], 0.17), []);

  return (
    <group>
      {/* ---- Kidneys (paired, bean-shaped) ---- */}
      <PartGroup id="kidney" position={explodeOffset(KIDNEY_L, explode)} onSelect={onSelect}>
        <mesh geometry={beanGeo} position={KIDNEY_L}>
          <meshStandardMaterial color="#a83232" roughness={0.42} metalness={0.06} {...emissiveProps(sel('kidney'))} />
        </mesh>
        {showLabels && <PartLabel position={[-1.55, 2.8, 0]} name="Kidney" />}
      </PartGroup>
      <PartGroup id="kidney" position={explodeOffset(KIDNEY_R, explode)} onSelect={onSelect}>
        {/* mirrored: rotation-y π maps the +x hilum dent onto the medial (-x) side */}
        <mesh geometry={beanGeo} position={KIDNEY_R} rotation={[0, Math.PI, 0]}>
          <meshStandardMaterial color="#a83232" roughness={0.42} metalness={0.06} {...emissiveProps(sel('kidney'))} />
        </mesh>
      </PartGroup>

      {/* ---- Ureters: muscular tubes carrying urine kidney → bladder ---- */}
      <PartGroup id="ureter" position={explodeOffset([-1.1, -0.2, 0], explode)} onSelect={onSelect}>
        <mesh geometry={ureterL}>
          <meshStandardMaterial color="#e8a37c" roughness={0.5} metalness={0.04} {...emissiveProps(sel('ureter'))} />
        </mesh>
      </PartGroup>
      <PartGroup id="ureter" position={explodeOffset([1.1, -0.2, 0], explode)} onSelect={onSelect}>
        <mesh geometry={ureterR}>
          <meshStandardMaterial color="#e8a37c" roughness={0.5} metalness={0.04} {...emissiveProps(sel('ureter'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.5, -0.35, 0]} name="Ureter" />}
      </PartGroup>

      {/* ---- Urinary bladder: rounded muscular sac storing urine ---- */}
      <PartGroup id="urinary-bladder" position={explodeOffset([0, -1.6, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, -1.72, 0]} scale={[0.78, 0.66, 0.62]}>
          <sphereGeometry args={[1, 40, 28]} />
          <meshStandardMaterial color="#f0c987" roughness={0.45} metalness={0.05} {...emissiveProps(sel('urinary-bladder'))} />
        </mesh>
        {/* bladder neck tapering into the urethra */}
        <mesh position={[0, -2.28, 0]}>
          <cylinderGeometry args={[0.3, 0.14, 0.28, 20]} />
          <meshStandardMaterial color="#e0b26f" roughness={0.5} metalness={0.04} {...emissiveProps(sel('urinary-bladder'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.15, -1.75, 0]} name="Urinary bladder" />}
      </PartGroup>

      {/* ---- Urethra: tube draining the bladder ---- */}
      <PartGroup id="urethra" position={explodeOffset([0, -2.6, 0], explode)} onSelect={onSelect}>
        <mesh geometry={urethraGeo}>
          <meshStandardMaterial color="#d99a6c" roughness={0.5} metalness={0.04} {...emissiveProps(sel('urethra'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.62, -2.9, 0]} name="Urethra" />}
      </PartGroup>

      {/* ---- Aorta / inferior vena cava: great vessels between the kidneys ---- */}
      <PartGroup id="aorta" position={explodeOffset([-0.4, 1.0, -0.18], explode)} onSelect={onSelect}>
        <mesh geometry={aortaGeo}>
          <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.08} {...emissiveProps(sel('aorta'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.4, 3.28, -0.18]} name="Aorta" />}
      </PartGroup>
      <PartGroup id="ivc" position={explodeOffset([0.4, 1.0, -0.18], explode)} onSelect={onSelect}>
        <mesh geometry={ivcGeo}>
          <meshStandardMaterial color="#2563eb" roughness={0.4} metalness={0.08} {...emissiveProps(sel('ivc'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.4, 3.28, -0.18]} name="Inferior vena cava" />}
      </PartGroup>
    </group>
  );
}
