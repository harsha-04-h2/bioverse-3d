'use client';

import { type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Fig 19.1 — endocrine glands in situ on a stylized translucent body silhouette.
   x: left/right, y: up, z: front (+). Glands sit at anatomically sensible depths
   inside the ghost body and glow with a gentle deterministic pulse. */

function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.6);
  return [v.x, v.y, v.z];
}

function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected
    ? { emissive: '#38bdf8', emissiveIntensity: 0.5 }
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

export default function EndocrineGlands(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const pulse = (i: number) => 0.5 + 0.5 * Math.sin(animTime * 2.2 + i * 1.15);

  const glandMat = (id: string, color: string, i: number) => (
    <meshStandardMaterial
      color={sel(id) ? '#38bdf8' : color}
      emissive={sel(id) ? '#38bdf8' : color}
      emissiveIntensity={sel(id) ? 0.5 : 0.3 + 0.22 * pulse(i)}
      roughness={0.35}
    />
  );

  return (
    <group>
      {/* ================= ghost body silhouette ================= */}
      <group>
        {/* torso */}
        <mesh position={[0, 1.7, 0]} scale={[1, 1, 0.55]}>
          <capsuleGeometry args={[1.0, 1.8, 8, 24]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.14} roughness={0.6} depthWrite={false} />
        </mesh>
        {/* head */}
        <mesh position={[0, 4.45, 0]}>
          <sphereGeometry args={[0.55, 28, 20]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.14} roughness={0.6} depthWrite={false} />
        </mesh>
        {/* neck */}
        <mesh position={[0, 3.82, 0]}>
          <cylinderGeometry args={[0.26, 0.3, 0.5, 18]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.14} roughness={0.6} depthWrite={false} />
        </mesh>
        {/* arms */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.22, 2.25, 0]} rotation={[0, 0, s * -0.1]} scale={[1, 1, 0.7]}>
            <capsuleGeometry args={[0.2, 1.7, 6, 14]} />
            <meshStandardMaterial color="#cbd5e1" transparent opacity={0.14} roughness={0.6} depthWrite={false} />
          </mesh>
        ))}
        {/* legs */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.38, -1.2, 0]} scale={[1, 1, 0.75]}>
            <capsuleGeometry args={[0.28, 1.6, 6, 14]} />
            <meshStandardMaterial color="#cbd5e1" transparent opacity={0.14} roughness={0.6} depthWrite={false} />
          </mesh>
        ))}
        {/* brain hint inside the head */}
        <mesh position={[0, 4.52, 0]} scale={[1, 0.85, 0.9]}>
          <sphereGeometry args={[0.38, 24, 18]} />
          <meshStandardMaterial color="#fda4af" transparent opacity={0.3} roughness={0.5} depthWrite={false} />
        </mesh>
      </group>

      {/* ================= glands ================= */}
      {/* pineal */}
      <PartGroup id="pineal" position={explodeOffset([0.1, 0, 0.1], explode)} onSelect={onSelect}>
        <mesh position={[0, 4.62, 0]}>
          <sphereGeometry args={[0.09, 14, 12]} />
          {glandMat('pineal', '#fbbf24', 0)}
        </mesh>
        {showLabels && <PartLabel position={[0.8, 4.66, 0]} name="Pineal gland" />}
      </PartGroup>

      {/* pituitary */}
      <PartGroup id="pituitary" position={explodeOffset([-0.12, 0, 0.08], explode)} onSelect={onSelect}>
        <mesh position={[0, 4.12, 0]}>
          <sphereGeometry args={[0.11, 14, 12]} />
          {glandMat('pituitary', '#f472b6', 1)}
        </mesh>
        {showLabels && <PartLabel position={[-0.9, 4.1, 0]} name="Pituitary gland" />}
      </PartGroup>

      {/* thyroid: butterfly on the front of the neck */}
      <PartGroup id="thyroid" position={explodeOffset([0, 0, 0.5], explode)} onSelect={onSelect}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.17, 3.52, 0.34]} scale={[1, 1.5, 0.75]}>
            <sphereGeometry args={[0.16, 16, 12]} />
            {glandMat('thyroid', '#fb7185', 2)}
          </mesh>
        ))}
        <mesh position={[0, 3.5, 0.36]}>
          <boxGeometry args={[0.3, 0.09, 0.12]} />
          {glandMat('thyroid', '#fb7185', 2)}
        </mesh>
        {showLabels && <PartLabel position={[0.95, 3.55, 0.2]} name="Thyroid gland" />}
      </PartGroup>

      {/* parathyroids: four dots on the thyroid's back */}
      <PartGroup id="parathyroid" position={explodeOffset([-0.2, 0, 0.2], explode)} onSelect={onSelect}>
        {[
          [-0.17, 3.62, 0.26],
          [0.17, 3.62, 0.26],
          [-0.17, 3.42, 0.26],
          [0.17, 3.42, 0.26],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            {glandMat('parathyroid', '#fda4af', 3)}
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.0, 3.68, 0.1]} name="Parathyroid glands" />}
      </PartGroup>

      {/* thymus: bilobed, behind the sternum */}
      <PartGroup id="thymus" position={explodeOffset([0.15, 0, 0.3], explode)} onSelect={onSelect}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.13, 2.72, 0.28]} scale={[1, 1.4, 0.8]}>
            <sphereGeometry args={[0.15, 16, 12]} />
            {glandMat('thymus', '#f9a8d4', 4)}
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.85, 2.72, 0.15]} name="Thymus" />}
      </PartGroup>

      {/* kidneys (context) + adrenals on their poles */}
      {[-1, 1].map((s) => (
        <PartGroup key={s} id="kidney" position={explodeOffset([s * 0.5, 0, -0.15], explode)} onSelect={onSelect}>
          <mesh position={[s * 0.5, 1.55, -0.18]} scale={[0.75, 1.1, 0.6]}>
            <sphereGeometry args={[0.28, 18, 14]} />
            <meshStandardMaterial color="#b91c1c" transparent opacity={0.85} roughness={0.5} {...emissiveProps(sel('kidney'))} />
          </mesh>
          {showLabels && s === 1 && <PartLabel position={[1.3, 1.4, -0.1]} name="Kidney" />}
        </PartGroup>
      ))}
      {[-1, 1].map((s) => (
        <PartGroup key={`ad-${s}`} id="adrenal" position={explodeOffset([s * 0.55, 0.25, 0.1], explode)} onSelect={onSelect}>
          <mesh position={[s * 0.5, 1.92, -0.05]} scale={[1.2, 0.6, 0.9]}>
            <sphereGeometry args={[0.16, 16, 12]} />
            {glandMat('adrenal', '#fb923c', 5)}
          </mesh>
          {showLabels && s === 1 && <PartLabel position={[1.25, 1.98, 0.1]} name="Adrenal gland" />}
        </PartGroup>
      ))}

      {/* pancreas: horizontal, islets of Langerhans dotted on it */}
      <PartGroup id="pancreas" position={explodeOffset([-0.2, 0, 0.3], explode)} onSelect={onSelect}>
        <mesh position={[-0.2, 1.3, 0.22]} rotation={[0, 0, Math.PI / 2 - 0.18]}>
          <capsuleGeometry args={[0.11, 0.65, 6, 12]} />
          {glandMat('pancreas', '#fde68a', 6)}
        </mesh>
        {[
          [-0.42, 1.36, 0.3],
          [-0.18, 1.3, 0.32],
          [0.02, 1.24, 0.3],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshBasicMaterial color={sel('pancreas') ? '#38bdf8' : '#facc15'} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.15, 1.28, 0.15]} name="Pancreas (islets)" />}
      </PartGroup>

      {/* testis (male gonad) */}
      <PartGroup id="testis" position={explodeOffset([0.2, 0, 0.4], explode)} onSelect={onSelect}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.2, -0.42, 0.3]} scale={[1, 1.3, 1]}>
            <sphereGeometry args={[0.13, 16, 12]} />
            {glandMat('testis', '#fda4af', 7)}
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.9, -0.42, 0.2]} name="Testis" />}
      </PartGroup>
    </group>
  );
}
