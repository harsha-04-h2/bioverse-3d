'use client';

import type { ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Fig 19.4 — adrenal gland perched on the kidney's upper pole, sectioned.
   The front half of the gland is cut away (cut plane at z = 0) so the
   yellow cortex rind and the darker central medulla read clearly. */

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

// Back-half shell (z <= 0): the front half is the "cut away" part.
const BACK_HALF: [number, number, number, number] = [Math.PI, Math.PI, 0, 0];

export default function AdrenalGland(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;
  const AY = 0.95; // adrenal centre height on the kidney pole

  return (
    <group>
      {/* ================= kidney (context) ================= */}
      <PartGroup id="kidney" position={explodeOffset([0, -1, -0.2], explode)} onSelect={onSelect}>
        <mesh position={[0, -1.05, -0.15]} scale={[0.95, 1.35, 0.72]}>
          <sphereGeometry args={[1, 36, 26]} />
          <meshStandardMaterial color="#a13232" roughness={0.5} {...emissiveProps(sel('kidney'))} />
        </mesh>
        {/* hilum dimple */}
        <mesh position={[0.72, -1.05, -0.15]} scale={[0.5, 0.7, 0.5]}>
          <sphereGeometry args={[0.5, 18, 14]} />
          <meshStandardMaterial color="#7c2424" roughness={0.55} {...emissiveProps(sel('kidney'))} />
        </mesh>
        {showLabels && <PartLabel position={[-1.35, -1.5, 0]} name="Kidney" />}
      </PartGroup>

      {/* ureter draining downward */}
      <PartGroup id="ureter" position={explodeOffset([0.5, -1, 0], explode)} onSelect={onSelect}>
        <mesh position={[0.55, -2.6, -0.15]}>
          <cylinderGeometry args={[0.11, 0.13, 1.3, 14]} />
          <meshStandardMaterial color="#d98a8a" roughness={0.5} {...emissiveProps(sel('ureter'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.15, -2.6, 0]} name="Ureter" />}
      </PartGroup>

      {/* ================= adrenal: capsule ================= */}
      <PartGroup id="capsule" position={explodeOffset([0, 1, 0.3], explode)} onSelect={onSelect}>
        <mesh position={[0, AY, 0]} scale={[1.18, 0.62, 0.88]}>
          <sphereGeometry args={[1, 40, 28, BACK_HALF[0], BACK_HALF[1]]} />
          <meshStandardMaterial
            color="#fef3c7"
            transparent
            opacity={0.5}
            roughness={0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
            {...emissiveProps(sel('capsule'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-1.5, AY + 0.55, 0]} name="Capsule" />}
      </PartGroup>

      {/* ================= adrenal: cortex (outer zone) ================= */}
      <PartGroup id="cortex" position={explodeOffset([0, 0.4, 0.9], explode)} onSelect={onSelect}>
        <mesh position={[0, AY, 0]} scale={[1.1, 0.55, 0.8]}>
          <sphereGeometry args={[1, 40, 28, BACK_HALF[0], BACK_HALF[1]]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.45} side={THREE.DoubleSide} {...emissiveProps(sel('cortex'))} />
        </mesh>
        {/* cortex cut face */}
        <mesh position={[0, AY, 0.012]} scale={[1.08, 0.53, 1]}>
          <circleGeometry args={[1, 48]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} {...emissiveProps(sel('cortex'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.55, AY + 0.1, 0.2]} name="Cortex" />}
      </PartGroup>

      {/* ================= adrenal: medulla (inner zone) ================= */}
      <PartGroup id="medulla" position={explodeOffset([0, 0, 1.6], explode)} onSelect={onSelect}>
        <mesh position={[0, AY, -0.08]} scale={[0.58, 0.3, 0.45]}>
          <sphereGeometry args={[1, 32, 22, BACK_HALF[0], BACK_HALF[1]]} />
          <meshStandardMaterial color="#92400e" roughness={0.45} side={THREE.DoubleSide} {...emissiveProps(sel('medulla'))} />
        </mesh>
        {/* medulla cut face */}
        <mesh position={[0, AY, 0.024]} scale={[0.56, 0.28, 1]}>
          <circleGeometry args={[1, 40]} />
          <meshStandardMaterial color="#b45309" roughness={0.5} {...emissiveProps(sel('medulla'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.1, AY - 0.62, 0.25]} name="Medulla" />}
      </PartGroup>

      {showLabels && <PartLabel position={[0, AY + 1.05, 0]} name="Adrenal gland (sectioned)" />}
    </group>
  );
}
