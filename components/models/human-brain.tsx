'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Sagittal half-brain (Fig 18.4). The cut face lies in the z = 0 plane facing +z:
   x runs anterior (+) → posterior (−), y runs dorsal (+) → ventral (−).
   Inner structures (corpus callosum, thalamus, hypothalamus, ventricle, pineal)
   sit proud of the cut face, exactly where a real mid-sagittal section shows them. */

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

/** Half-sphere shell (z >= 0) with procedural gyri ripples displaced along normals. */
function useGyriShell(radius: number, amp: number, freq: number): THREE.BufferGeometry {
  return useMemo(() => {
    const g = new THREE.SphereGeometry(radius, 64, 40, 0, Math.PI); // z >= 0 half
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      const w = Math.sin(freq * n.x + 1.3) * Math.sin(freq * 0.9 * n.y + 0.4) * Math.sin(freq * 1.1 * n.z + 2.1);
      v.addScaledVector(n, amp * w);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, [radius, amp, freq]);
}

export default function HumanBrain(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect } = props;
  const sel = (id: string) => selectedId === id;

  const cerebrumGeo = useGyriShell(1, 0.045, 9);
  const cerebellumGeo = useGyriShell(1, 0.03, 11);

  // Cerebellar folia: stacked half-disc plates, rims protruding just past the
  // shell so they read as folds.
  const folia = useMemo(() => {
    const plates: { y: number; rx: number; rz: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const y = 0.18 + i * 0.19;
      const prof = Math.max(0.25, 1 - Math.abs(y - 0.78) * 0.95);
      plates.push({ y, rx: 0.94 * prof, rz: 0.77 * prof });
    }
    return plates;
  }, []);

  return (
    <group>
      {/* ================= CEREBRUM ================= */}
      <PartGroup id="cerebrum" position={explodeOffset([0, 1.0, 0], explode)} onSelect={onSelect}>
        <group position={[0.1, 1.7, 0]} scale={[2.3, 1.65, 1.15]}>
          <mesh geometry={cerebrumGeo}>
            <meshStandardMaterial color="#f0a8a8" roughness={0.55} metalness={0.02} side={THREE.DoubleSide} {...emissiveProps(sel('cerebrum'))} />
          </mesh>
        </group>
        {/* cut face of the cerebrum */}
        <mesh position={[0.1, 1.7, 0.012]} scale={[2.28, 1.63, 1]}>
          <circleGeometry args={[1, 64]} />
          <meshStandardMaterial color="#d98888" roughness={0.6} {...emissiveProps(sel('cerebrum'))} />
        </mesh>
        {/* longitudinal fissure hint on the crown */}
        <mesh position={[0.1, 3.34, 0.28]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1]}>
          <torusGeometry args={[0.5, 0.045, 8, 32, Math.PI * 0.5]} />
          <meshStandardMaterial color="#b96a6a" roughness={0.6} />
        </mesh>
        {showLabels && <PartLabel position={[1.7, 3.1, 0.4]} name="Cerebrum" />}
      </PartGroup>

      {/* ================= CUT-FACE INTERIOR ================= */}
      <PartGroup id="cut-face" position={explodeOffset([0, 0, 1.0], explode)} onSelect={onSelect}>
        {/* corpus callosum: arched white band */}
        <PartGroup id="corpus-callosum" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[-0.1, 1.62, 0.09]} rotation={[0, 0, 0.32]} scale={[1, 0.52, 0.55]}>
            <torusGeometry args={[0.92, 0.17, 12, 48, 2.5]} />
            <meshStandardMaterial color="#faf3e0" roughness={0.4} {...emissiveProps(sel('corpus-callosum'))} />
          </mesh>
          {showLabels && <PartLabel position={[-0.1, 2.35, 0.15]} name="Corpus callosum" />}
        </PartGroup>

        {/* lateral ventricle hint */}
        <mesh position={[-0.1, 1.32, 0.07]} rotation={[0, 0, 0.32]} scale={[1, 0.5, 0.4]}>
          <torusGeometry args={[0.72, 0.05, 8, 40, 2.2]} />
          <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
        </mesh>

        {/* thalamus */}
        <PartGroup id="thalamus" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[-0.15, 1.02, 0.14]} scale={[0.52, 0.38, 0.3]}>
            <sphereGeometry args={[1, 28, 20]} />
            <meshStandardMaterial color="#e07878" roughness={0.45} {...emissiveProps(sel('thalamus'))} />
          </mesh>
          {showLabels && <PartLabel position={[-1.15, 1.02, 0.15]} name="Thalamus" />}
        </PartGroup>

        {/* hypothalamus */}
        <PartGroup id="hypothalamus" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[0.02, 0.6, 0.14]} scale={[0.3, 0.22, 0.22]}>
            <sphereGeometry args={[1, 24, 18]} />
            <meshStandardMaterial color="#d16a6a" roughness={0.45} {...emissiveProps(sel('hypothalamus'))} />
          </mesh>
          {showLabels && <PartLabel position={[0.75, 0.55, 0.15]} name="Hypothalamus" />}
        </PartGroup>

        {/* pineal gland */}
        <PartGroup id="pineal" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[-0.82, 1.02, 0.14]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.35} {...emissiveProps(sel('pineal'))} />
          </mesh>
          {showLabels && <PartLabel position={[-1.35, 0.72, 0.15]} name="Pineal gland" />}
        </PartGroup>
      </PartGroup>

      {/* ================= CEREBELLUM ================= */}
      <PartGroup id="cerebellum" position={explodeOffset([-1.0, -0.5, 0], explode)} onSelect={onSelect}>
        <group position={[-1.85, 0.78, 0]}>
          <mesh geometry={cerebellumGeo} scale={[0.88, 0.82, 0.72]}>
            <meshStandardMaterial color="#e79b9b" roughness={0.55} side={THREE.DoubleSide} {...emissiveProps(sel('cerebellum'))} />
          </mesh>
          {/* folia plates */}
          {folia.map((f, i) => (
            <mesh key={i} position={[0, f.y - 0.78, 0.01]} scale={[f.rx, 1, f.rz]}>
              <cylinderGeometry args={[1, 1, 0.055, 28, 1, false, -Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color="#d98383" roughness={0.55} side={THREE.DoubleSide} {...emissiveProps(sel('cerebellum'))} />
            </mesh>
          ))}
          {/* cut face of cerebellum */}
          <mesh position={[0, 0, 0.012]} scale={[0.87, 0.81, 1]}>
            <circleGeometry args={[1, 48]} />
            <meshStandardMaterial color="#cf7c7c" roughness={0.6} {...emissiveProps(sel('cerebellum'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[-2.75, 0.1, 0.3]} name="Cerebellum" />}
      </PartGroup>

      {/* ================= BRAINSTEM ================= */}
      <PartGroup id="brainstem" position={explodeOffset([-0.25, -1.0, 0], explode)} onSelect={onSelect}>
        {/* midbrain */}
        <PartGroup id="midbrain" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[-0.28, 0.32, 0]}>
            <cylinderGeometry args={[0.24, 0.26, 0.5, 20, 1, false, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#eec0b0" roughness={0.5} side={THREE.DoubleSide} {...emissiveProps(sel('midbrain'))} />
          </mesh>
          {showLabels && <PartLabel position={[-0.95, 0.32, 0.2]} name="Midbrain" />}
        </PartGroup>
        {/* pons: anterior bulge */}
        <PartGroup id="pons" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[-0.08, -0.12, 0.05]} scale={[0.9, 0.85, 0.7]}>
            <sphereGeometry args={[0.32, 24, 18, 0, Math.PI]} />
            <meshStandardMaterial color="#f2c4b4" roughness={0.5} side={THREE.DoubleSide} {...emissiveProps(sel('pons'))} />
          </mesh>
          {showLabels && <PartLabel position={[0.62, -0.12, 0.2]} name="Pons" />}
        </PartGroup>
        {/* medulla oblongata: tapering continuation */}
        <PartGroup id="medulla" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[-0.3, -0.72, 0]}>
            <cylinderGeometry args={[0.26, 0.17, 0.75, 20, 1, false, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#e8b3a1" roughness={0.5} side={THREE.DoubleSide} {...emissiveProps(sel('medulla'))} />
          </mesh>
          {showLabels && <PartLabel position={[-1.0, -0.78, 0.2]} name="Medulla oblongata" />}
        </PartGroup>
        {/* spinal cord stub */}
        <PartGroup id="spinal-cord" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[-0.3, -1.45, 0]}>
            <cylinderGeometry args={[0.16, 0.15, 0.75, 18, 1, false, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color="#f5d7c9" roughness={0.5} side={THREE.DoubleSide} {...emissiveProps(sel('spinal-cord'))} />
          </mesh>
          {showLabels && <PartLabel position={[-0.3, -2.05, 0.2]} name="Spinal cord" />}
        </PartGroup>
      </PartGroup>
    </group>
  );
}
