'use client';

import { useMemo, type ReactNode } from 'react';
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

/** A straight rod (capsule/cylinder) between two points. */
function Rod({
  from,
  to,
  radius,
  color,
  selected,
  segments = 10,
}: {
  from: [number, number, number];
  to: [number, number, number];
  radius: number;
  color: string;
  selected: boolean;
  segments?: number;
}): JSX.Element {
  const { position, quaternion, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { position: [mid.x, mid.y, mid.z] as [number, number, number], quaternion: q, len };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, len, segments]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} {...emissiveProps(selected)} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// TMV — helical rod (axis along local X)
// ---------------------------------------------------------------------------
const TMV_TURNS = 9;
const TMV_PER_TURN = 12;
const TMV_LEN = 2.6;
const TMV_R = 0.34;

function TmvCapsomeres({ selected }: { selected: boolean }): JSX.Element {
  const caps = useMemo(() => {
    const n = TMV_TURNS * TMV_PER_TURN;
    const out: [number, number, number][] = [];
    for (let i = 0; i < n; i++) {
      const x = -TMV_LEN / 2 + (i / (n - 1)) * TMV_LEN;
      const th = (i / TMV_PER_TURN) * Math.PI * 2;
      out.push([x, Math.cos(th) * TMV_R, Math.sin(th) * TMV_R]);
    }
    return out;
  }, []);
  return (
    <group>
      {caps.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.085, 8, 6]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.45} metalness={0.08} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

function TmvRna({ selected }: { selected: boolean }): JSX.Element {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const turns = TMV_TURNS;
    for (let i = 0; i <= 120; i++) {
      const x = -TMV_LEN / 2 + (i / 120) * TMV_LEN;
      const th = (i / 120) * turns * Math.PI * 2;
      pts.push(new THREE.Vector3(x, Math.cos(th) * 0.09, Math.sin(th) * 0.09));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.032, 6, false);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#ef4444" roughness={0.5} metalness={0} {...emissiveProps(selected)} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Bacteriophage — icosahedral head + contractile tail
// ---------------------------------------------------------------------------
function PhageFibres({ selected }: { selected: boolean }): JSX.Element {
  const fibres = useMemo(() => {
    const out: { from: [number, number, number]; knee: [number, number, number]; tip: [number, number, number] }[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.26;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const from: [number, number, number] = [ca * 0.34, -0.8, sa * 0.34];
      const knee: [number, number, number] = [ca * 0.8, -1.12, sa * 0.8];
      const tip: [number, number, number] = [ca * 1.02, -1.72, sa * 1.02];
      out.push({ from, knee, tip });
    }
    return out;
  }, []);
  return (
    <group>
      {fibres.map((f, i) => (
        <group key={i}>
          <Rod from={f.from} to={f.knee} radius={0.03} color="#e2e8f0" selected={selected} />
          <Rod from={f.knee} to={f.tip} radius={0.024} color="#e2e8f0" selected={selected} />
          <mesh position={f.tip}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} {...emissiveProps(selected)} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Enveloped icosahedral virus (HIV-style)
// ---------------------------------------------------------------------------
function EnvSpikes({ selected }: { selected: boolean }): JSX.Element {
  const spikes = useMemo(() => {
    const pts: { pos: [number, number, number]; quat: THREE.Quaternion }[] = [];
    const N = 18;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      const n = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
      pts.push({ pos: [n.x * 0.98, n.y * 0.98, n.z * 0.98], quat });
    }
    return pts;
  }, []);
  return (
    <group>
      {spikes.map((s, i) => (
        <group key={i} position={s.pos} quaternion={s.quat}>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.18, 8]} />
            <meshStandardMaterial color="#be185d" roughness={0.45} {...emissiveProps(selected)} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.075, 10, 8]} />
            <meshStandardMaterial color="#ec4899" roughness={0.45} {...emissiveProps(selected)} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function EnvGenome({ selected }: { selected: boolean }): JSX.Element {
  const geos = useMemo(() => {
    return [0, 1].map((k) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const x = -0.35 + t * 0.7;
        pts.push(new THREE.Vector3(x + (k - 0.5) * 0.2, 0.12 * Math.sin(t * Math.PI * 8 + k * 2), 0.12 * Math.cos(t * Math.PI * 8 + k * 2)));
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.028, 6, false);
    });
  }, []);
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#f43f5e" roughness={0.5} {...emissiveProps(selected)} />
        </mesh>
      ))}
      {[0, 1, 2].map((i) => (
        <mesh key={`rt-${i}`} position={[(i - 1) * 0.3, -0.22, 0.15]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.5} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main component — three viruses side by side
// ---------------------------------------------------------------------------
export default function VirusStructures(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const tmvSpin = animTime * 0.5;
  const hivSpin = animTime * 0.3;
  const phageBob = 0.06 * Math.sin(animTime * 1.6);

  return (
    <group>
      {/* ================= TMV — helical rod ================= */}
      <group position={[-3.6, 0, 0]}>
        <PartGroup id="tmv-capsomeres" position={explodeOffset([-0.6, 0, 0], explode)} onSelect={onSelect}>
          <group rotation={[tmvSpin, 0, 0]} scale={[1, 1 + explode * 0.5, 1 + explode * 0.5]}>
            <TmvCapsomeres selected={sel('tmv-capsomeres')} />
          </group>
          {showLabels && <PartLabel position={[0, 0.85, 0]} name="Capsomeres (helical array)" />}
        </PartGroup>
        <PartGroup id="tmv-rna" position={explodeOffset([0.9, 0, 0], explode)} onSelect={onSelect}>
          <group rotation={[tmvSpin, 0, 0]}>
            <TmvRna selected={sel('tmv-rna')} />
          </group>
          {showLabels && <PartLabel position={[0, -0.75, 0]} name="RNA genome" />}
        </PartGroup>
        {showLabels && <PartLabel position={[0, 1.45, 0]} name="TMV — helical virus" />}
      </group>

      {/* ================= Bacteriophage ================= */}
      <group position={[0, phageBob, 0]}>
        <PartGroup id="phage-head" position={explodeOffset([0, 1.6, 0], explode)} onSelect={onSelect}>
          <mesh position={[0, 1.3, 0]}>
            <icosahedronGeometry args={[0.72, 1]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.35} metalness={0.15} flatShading {...emissiveProps(sel('phage-head'))} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <icosahedronGeometry args={[0.45, 1]} />
            <meshStandardMaterial color="#0ea5e9" roughness={0.5} flatShading {...emissiveProps(sel('phage-head'))} />
          </mesh>
          {showLabels && <PartLabel position={[0, 2.35, 0]} name="Head (DNA inside)" />}
        </PartGroup>

        <PartGroup id="phage-tail-sheath" position={explodeOffset([0, -0.1, 0], explode)} onSelect={onSelect}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.25, 16]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} metalness={0.2} {...emissiveProps(sel('phage-tail-sheath'))} />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 1.05, 16]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.5} metalness={0.2} {...emissiveProps(sel('phage-tail-sheath'))} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[0, 0.2 - i * 0.17, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.25, 0.045, 8, 20]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.5} metalness={0.2} {...emissiveProps(sel('phage-tail-sheath'))} />
            </mesh>
          ))}
          {showLabels && <PartLabel position={[1.15, -0.2, 0]} name="Contractile tail sheath" />}
        </PartGroup>

        <PartGroup id="phage-base-plate" position={explodeOffset([0, -1.4, 0], explode)} onSelect={onSelect}>
          <mesh position={[0, -0.82, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.14, 6]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} metalness={0.15} {...emissiveProps(sel('phage-base-plate'))} />
          </mesh>
          {showLabels && <PartLabel position={[-1.15, -0.85, 0]} name="Base plate" />}
        </PartGroup>

        <PartGroup id="phage-tail-fibres" position={explodeOffset([0, -1.6, 0], explode)} onSelect={onSelect}>
          <PhageFibres selected={sel('phage-tail-fibres')} />
          {showLabels && <PartLabel position={[0, -2.35, 0]} name="Tail fibres" />}
        </PartGroup>

        {showLabels && <PartLabel position={[0, 2.95, 0]} name="Bacteriophage" />}
      </group>

      {/* ================= Enveloped icosahedral virus (HIV-style) ================= */}
      <group position={[3.6, 0, 0]} rotation={[0, hivSpin, 0]}>
        <PartGroup id="env-envelope" position={explodeOffset([0, 1.5, 0], explode)} onSelect={onSelect}>
          <mesh>
            <sphereGeometry args={[1.0, 32, 24]} />
            <meshStandardMaterial
              color="#f9a8d4"
              transparent
              opacity={0.32}
              roughness={0.3}
              metalness={0.05}
              depthWrite={false}
              side={THREE.DoubleSide}
              {...emissiveProps(sel('env-envelope'))}
            />
          </mesh>
          {showLabels && <PartLabel position={[0, 1.5, 0]} name="Lipid envelope" />}
        </PartGroup>

        <PartGroup id="env-spikes" position={[0, 0, 0]} onSelect={onSelect}>
          <group scale={1 + explode * 0.35}>
            <EnvSpikes selected={sel('env-spikes')} />
          </group>
          {showLabels && <PartLabel position={[1.55, 0.75, 0]} name="Spikes (gp120)" />}
        </PartGroup>

        <PartGroup id="env-capsid" position={explodeOffset([0, -1.4, 0], explode)} onSelect={onSelect}>
          <mesh>
            <icosahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial color="#fb923c" roughness={0.4} metalness={0.1} flatShading transparent opacity={0.92} {...emissiveProps(sel('env-capsid'))} />
          </mesh>
          {showLabels && <PartLabel position={[-1.45, -0.5, 0]} name="Capsid" />}
        </PartGroup>

        <PartGroup id="env-genome" position={explodeOffset([0, -0.6, 0], explode)} onSelect={onSelect}>
          <EnvGenome selected={sel('env-genome')} />
          {showLabels && <PartLabel position={[0, -1.55, 0]} name="RNA + reverse transcriptase" />}
        </PartGroup>

        {showLabels && <PartLabel position={[0, 2.1, 0]} name="HIV — enveloped virus" />}
      </group>
    </group>
  );
}
