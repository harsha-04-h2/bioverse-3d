'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Explode offset: base + normalize(base) * explode * 1.4. */
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

const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* Axon runs along +x from the hillock (x=0.9) to terminals (x=6.2). */
const AXON_START = 0.9;
const AXON_END = 6.2;
const SEGMENTS = 6; // Schwann cells; gaps are nodes of Ranvier

export default function Neuron(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  // Dendrite branches: tapered tube segments radiating from the soma.
  const dendrites = useMemo(() => {
    const list: { pos: [number, number, number]; rot: [number, number, number]; len: number; rad: number }[] = [];
    const dirs: [number, number, number][] = [
      [-1, 0.55, 0.15], [-1, -0.6, -0.2], [-0.85, 0.05, 0.75], [-0.8, 0.3, -0.7],
      [-0.7, -0.25, 0.65], [-0.95, -0.05, -0.1], [-0.6, 0.85, -0.35], [-0.55, -0.9, 0.25],
      [-0.5, 0.15, 0.9], [-0.45, 0.5, -0.8],
    ];
    for (let i = 0; i < dirs.length; i++) {
      const d = dirs[i];
      const v = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      const len = 1.1 + rand(i * 3 + 1) * 0.9;
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
      const e = new THREE.Euler().setFromQuaternion(q);
      // Primary branch; a few get a short sub-branch.
      list.push({
        pos: [v.x * (len / 2 - 0.55), v.y * (len / 2 - 0.55), v.z * (len / 2 - 0.55)],
        rot: [e.x, e.y, e.z],
        len,
        rad: 0.085,
      });
      if (i % 3 === 0) {
        const tip = new THREE.Vector3(v.x * (len - 0.55), v.y * (len - 0.55), v.z * (len - 0.55));
        const v2 = v.clone().add(new THREE.Vector3(0, 0.55, rand(i * 5 + 2) - 0.5)).normalize();
        const len2 = 0.7;
        const q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v2);
        const e2 = new THREE.Euler().setFromQuaternion(q2);
        list.push({
          pos: [tip.x + v2.x * (len2 / 2 - 0.08), tip.y + v2.y * (len2 / 2 - 0.08), tip.z + v2.z * (len2 / 2 - 0.08)],
          rot: [e2.x, e2.y, e2.z],
          len: len2,
          rad: 0.06,
        });
      }
    }
    return list;
  }, []);

  // Axon terminals: fine collaterals fanning out at the far end.
  const terminals = useMemo(() => {
    const list: { pos: [number, number, number]; rot: [number, number, number]; len: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const v = new THREE.Vector3(0.55, Math.cos(a) * 0.75, Math.sin(a) * 0.75).normalize();
      const len = 0.85;
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
      const e = new THREE.Euler().setFromQuaternion(q);
      list.push({
        pos: [AXON_END + v.x * len * 0.5, v.y * len * 0.5, v.z * len * 0.5],
        rot: [e.x, e.y, e.z],
        len,
      });
    }
    return list;
  }, []);

  const nissl = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const th = rand(i * 11 + 1) * Math.PI * 2;
        const ph = rand(i * 11 + 2) * Math.PI * 0.9;
        const r = 0.73;
        return {
          x: r * Math.sin(ph) * Math.cos(th),
          y: r * Math.cos(ph),
          z: r * Math.sin(ph) * Math.sin(th),
        };
      }),
    [],
  );
  const nodeXs: number[] = [];
  const segs: { start: number; len: number }[] = [];
  // Schwann-cell segment length: axon span minus the node-of-Ranvier gaps.
  const segLen = (AXON_END - AXON_START - (SEGMENTS - 1) * 0.28) / SEGMENTS;
  {
    let x = AXON_START;
    for (let i = 0; i < SEGMENTS; i++) {
      segs.push({ start: x, len: segLen });
      x += segLen;
      if (i < SEGMENTS - 1) {
        nodeXs.push(x + 0.14);
        x += 0.28;
      }
    }
  }

  // Idle "signal shimmer" travelling along the axon for visual life.
  const pulse = animTime % 6;
  const pulseX = AXON_START + ((AXON_END - AXON_START) * pulse) / 6;

  return (
    <group>
      {/* ---- Dendrites ---- */}
      <PartGroup id="dendrites" position={explodeOffset([-1.4, 0.6, 0], explode)} onSelect={onSelect}>
        {dendrites.map((d, i) => (
          <mesh key={i} position={d.pos} rotation={d.rot}>
            <cylinderGeometry args={[d.rad, d.rad * 0.45, d.len, 10]} />
            <meshStandardMaterial color="#c084fc" roughness={0.45} metalness={0.05} {...emissiveProps(sel('dendrites'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-2.1, 1.35, 0]} name="Dendrites" />}
      </PartGroup>

      {/* ---- Soma (cell body) with nucleus ---- */}
      <PartGroup id="soma" position={explodeOffset([0, -0.9, 0], explode)} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[0.72, 32, 24]} />
          <meshStandardMaterial color="#a855f7" roughness={0.4} metalness={0.08} {...emissiveProps(sel('soma'))} />
        </mesh>
        {/* Nissl granules: small speckles on the soma surface */}
        {nissl.map((p, i) => (
          <mesh key={i} position={[p.x, p.y, p.z]}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshStandardMaterial color="#e9d5ff" roughness={0.5} />
          </mesh>
        ))}
        <PartGroup id="nucleus" position={explodeOffset([0, 0, 0.55], explode * 0.6)} onSelect={onSelect}>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.32, 24, 18]} />
            <meshStandardMaterial color="#7c3aed" roughness={0.35} {...emissiveProps(sel('nucleus'))} />
          </mesh>
          {showLabels && <PartLabel position={[0, -0.15, 0.62]} name="Nucleus" />}
        </PartGroup>
        {showLabels && <PartLabel position={[0.15, -0.85, 0]} name="Cell body (soma)" />}
      </PartGroup>

      {/* ---- Axon hillock: tapered funnel from soma to axon ---- */}
      <PartGroup id="axon-hillock" position={explodeOffset([0.9, -0.75, 0], explode)} onSelect={onSelect}>
        <mesh position={[0.75, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.5, 0.8, 20]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.4} {...emissiveProps(sel('axon-hillock'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.75, 0.62, 0]} name="Axon hillock" />}
      </PartGroup>

      {/* ---- Axon shaft (thin core inside the myelin) ---- */}
      <PartGroup id="axon" position={explodeOffset([3.4, 0.45, 0], explode)} onSelect={onSelect}>
        <mesh position={[(AXON_START + AXON_END) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, AXON_END - AXON_START, 16]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.05} {...emissiveProps(sel('axon'))} />
        </mesh>
        {/* travelling idle shimmer */}
        <mesh position={[pulseX, 0, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color="#fde68a" transparent opacity={0.85} />
        </mesh>
        {showLabels && <PartLabel position={[3.6, -0.5, 0]} name="Axon" />}
      </PartGroup>

      {/* ---- Myelin sheath: segmented Schwann cells ---- */}
      {segs.map((s, i) => (
        <PartGroup key={i} id="myelin-sheath" position={explodeOffset([s.start + s.len / 2, 1.0, 0], explode)} onSelect={onSelect}>
          <mesh position={[s.start + s.len / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, s.len, 24]} />
            <meshStandardMaterial color="#f0abfc" roughness={0.5} metalness={0.05} {...emissiveProps(sel('myelin-sheath'))} />
          </mesh>
          {/* Schwann cell nucleus bulge */}
          <mesh position={[s.start + s.len / 2, 0.32, 0]} scale={[0.8, 0.5, 0.5]}>
            <sphereGeometry args={[0.16, 14, 12]} />
            <meshStandardMaterial color="#d946ef" roughness={0.4} {...emissiveProps(sel('myelin-sheath'))} />
          </mesh>
          {showLabels && i === 2 && <PartLabel position={[s.start + s.len / 2, 0.78, 0]} name="Myelin sheath (Schwann cell)" />}
        </PartGroup>
      ))}

      {/* ---- Nodes of Ranvier: bare gaps ---- */}
      {nodeXs.map((nx, i) => (
        <PartGroup key={i} id="node-of-ranvier" position={explodeOffset([nx, -0.65, 0], explode)} onSelect={onSelect}>
          <mesh position={[nx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.115, 0.045, 10, 24]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive={sel('node-of-ranvier') ? '#38bdf8' : '#22d3ee'}
              emissiveIntensity={sel('node-of-ranvier') ? 0.4 : 0.35}
              roughness={0.35}
            />
          </mesh>
          {showLabels && i === 1 && <PartLabel position={[nx, -0.55, 0]} name="Node of Ranvier" />}
        </PartGroup>
      ))}

      {/* ---- Axon terminals ---- */}
      <PartGroup id="axon-terminals" position={explodeOffset([7.6, -0.6, 0], explode)} onSelect={onSelect}>
        {terminals.map((t, i) => (
          <group key={i}>
            <mesh position={t.pos} rotation={t.rot}>
              <cylinderGeometry args={[0.045, 0.09, t.len, 8]} />
              <meshStandardMaterial color="#c084fc" roughness={0.45} {...emissiveProps(sel('axon-terminals'))} />
            </mesh>
            {/* synaptic knob */}
            <mesh position={[t.pos[0] + (t.pos[0] - AXON_END) * 0.14, t.pos[1] * 1.14, t.pos[2] * 1.14]}>
              <sphereGeometry args={[0.12, 14, 12]} />
              <meshStandardMaterial color="#a855f7" roughness={0.4} {...emissiveProps(sel('axon-terminals'))} />
            </mesh>
          </group>
        ))}
        {showLabels && <PartLabel position={[AXON_END + 1.15, 1.1, 0]} name="Axon terminals" />}
      </PartGroup>

      {/* faint signal-flow hint along axon */}
      <Line
        points={[
          [AXON_START - 0.4, 0, 0],
          [AXON_END, 0, 0],
        ]}
        color="#fbbf24"
        transparent
        opacity={0.25}
        lineWidth={1}
      />
    </group>
  );
}
