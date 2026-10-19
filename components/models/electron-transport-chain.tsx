'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Loop length in seconds - everything is driven from animTime. */
const LOOP = 20;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

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

const COMPLEX_X = [-3.6, -1.3, 0.9, 3.2];

export default function ElectronTransportChain(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const cycle = (animTime % LOOP + LOOP) % LOOP;

  // Electron routes: NADH -> I -> III -> IV, FADH2 -> II -> III -> IV.
  const eCurve1 = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          [-5.0, -1.7, 0],
          [-3.6, -1.0, 0],
          [-3.6, 1.0, 0],
          [-2.3, 1.05, 0],
          [0.9, 1.05, 0],
          [3.2, 0.8, 0],
          [3.2, -0.5, 0],
        ].map((p) => new THREE.Vector3(p[0], p[1], p[2])),
      ),
    [],
  );
  const eCurve2 = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          [-1.3, -1.7, 0],
          [-1.3, -0.6, 0],
          [-1.3, 0.9, 0],
          [0.9, 1.05, 0],
          [3.2, 0.8, 0],
          [3.2, -0.5, 0],
        ].map((p) => new THREE.Vector3(p[0], p[1], p[2])),
      ),
    [],
  );

  const electrons = useMemo(() => {
    const out: { pos: [number, number, number]; op: number }[] = [];
    for (let j = 0; j < 8; j += 1) {
      const pr = (cycle / LOOP + j / 8) % 1;
      const curve = j % 2 === 0 ? eCurve1 : eCurve2;
      const p = curve.getPoint(pr);
      out.push({ pos: [p.x, p.y, p.z], op: Math.sin(pr * Math.PI) * 0.7 + 0.3 });
    }
    return out;
  }, [animTime, eCurve1, eCurve2, cycle]);

  // Protons pumped from the matrix (below) into the intermembrane space (above).
  const protons = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (let kk = 0; kk < 12; kk += 1) {
      const pr = (cycle / LOOP + kk / 12) % 1;
      const bx = COMPLEX_X[kk % 4] + 0.28 * Math.sin(kk * 2.7 + pr * 5);
      out.push({ pos: [bx, lerp(-1.15, 1.85, pr), 0.32] });
    }
    return out;
  }, [animTime, cycle]);

  // Oxygen arrives at Complex IV during the terminal window (14-20s).
  const o2w = clamp01((cycle - 14) / 6);
  const o2 = o2w > 0 && o2w < 1
    ? [0, 1].map((j) => ({
        pos: [lerp(5.6, 3.55, smooth(o2w)), 1.1 + j * 0.25, (j === 0 ? 1 : -1) * 0.3] as [number, number, number],
      }))
    : [];

  // Water forms at Complex IV and drops into the matrix.
  const water = o2w > 0.15 && o2w < 1
    ? [0, 1, 2].map((j) => {
        const w = clamp01((o2w - 0.15 - j * 0.1) / 0.6);
        return {
          pos: [3.2 + (j - 1) * 0.22, lerp(0.1, -1.7, smooth(w)), 0.2] as [number, number, number],
          op: 1 - w * 0.4,
        };
      })
    : [];

  const pulse = (i: number) => 0.22 + 0.22 * Math.sin(animTime * 4 - i * 1.5);

  return (
    <group>
      {/* ---- inner membrane slab ---- */}
      <PartGroup id="inner-membrane" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10.5, 0.32, 3]} />
          <meshStandardMaterial color="#fb7185" roughness={0.5} metalness={0.05} {...emissiveProps(sel('inner-membrane'))} />
        </mesh>
        {showLabels && <PartLabel position={[4.85, 0.45, 0.9]} name="Inner mitochondrial membrane" />}
      </PartGroup>

      {/* ---- Complex I: NADH dehydrogenase ---- */}
      <PartGroup id="complex-i" position={explodeOffset([COMPLEX_X[0], 1.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[COMPLEX_X[0], 0.62, 0]}>
          <boxGeometry args={[1.7, 1.5, 1.4]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={pulse(0) + (sel('complex-i') ? 0.4 : 0)} roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[COMPLEX_X[0], -1.15, 0]}>
          <boxGeometry args={[0.7, 1.7, 0.9]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={pulse(0) * 0.7 + (sel('complex-i') ? 0.4 : 0)} roughness={0.4} metalness={0.1} />
        </mesh>
        {showLabels && <PartLabel position={[COMPLEX_X[0], 2.1, 0]} name="Complex I" />}
      </PartGroup>

      {/* ---- Complex II: succinate dehydrogenase ---- */}
      <PartGroup id="complex-ii" position={explodeOffset([COMPLEX_X[1], 1.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[COMPLEX_X[1], 0.28, 0]} scale={[1, 0.78, 1]}>
          <sphereGeometry args={[0.72, 24, 18]} />
          <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={pulse(1) + (sel('complex-ii') ? 0.4 : 0)} roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[COMPLEX_X[1], -0.72, 0]}>
          <cylinderGeometry args={[0.3, 0.36, 0.7, 16]} />
          <meshStandardMaterial color="#fb923c" roughness={0.4} metalness={0.1} {...emissiveProps(sel('complex-ii'))} />
        </mesh>
        {showLabels && <PartLabel position={[COMPLEX_X[1], 1.75, 0]} name="Complex II" />}
      </PartGroup>

      {/* ---- Complex III: cytochrome bc1 dimer ---- */}
      <PartGroup id="complex-iii" position={explodeOffset([COMPLEX_X[2], 1.2, 0], explode)} onSelect={onSelect}>
        {[0.52, 1.28].map((x, i) => (
          <mesh key={i} position={[x, 0.42, 0]}>
            <boxGeometry args={[0.72, 1.35, 1.2]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={pulse(2) + (sel('complex-iii') ? 0.4 : 0)} roughness={0.4} metalness={0.1} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[COMPLEX_X[2], 1.95, 0]} name="Complex III" />}
      </PartGroup>

      {/* ---- Complex IV: cytochrome c oxidase ---- */}
      <PartGroup id="complex-iv" position={explodeOffset([COMPLEX_X[3], 1.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[COMPLEX_X[3], 0.35, 0]}>
          <cylinderGeometry args={[0.62, 0.62, 1.9, 24]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={pulse(3) + (sel('complex-iv') ? 0.4 : 0)} roughness={0.4} metalness={0.1} />
        </mesh>
        {showLabels && <PartLabel position={[COMPLEX_X[3], 2.0, 0]} name="Complex IV" />}
      </PartGroup>

      {/* ---- electron donor pools ---- */}
      <PartGroup id="nadh-fadh2" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh position={[-5.2, -1.8, 0]} scale={1 + 0.12 * Math.sin(animTime * 3)}>
          <sphereGeometry args={[0.26, 18, 14]} />
          <meshStandardMaterial color="#a3e635" emissive={sel('nadh-fadh2') ? '#38bdf8' : '#a3e635'} emissiveIntensity={sel('nadh-fadh2') ? 0.9 : 0.5} roughness={0.35} />
        </mesh>
        <mesh position={[-1.3, -1.95, 0]} scale={1 + 0.12 * Math.sin(animTime * 3 + 2)}>
          <sphereGeometry args={[0.26, 18, 14]} />
          <meshStandardMaterial color="#4ade80" emissive={sel('nadh-fadh2') ? '#38bdf8' : '#4ade80'} emissiveIntensity={sel('nadh-fadh2') ? 0.9 : 0.5} roughness={0.35} />
        </mesh>
        {showLabels && <PartLabel position={[-3.4, -2.55, 0]} name="NADH / FADH2" />}
      </PartGroup>

      {/* ---- electrons hopping the chain ---- */}
      {electrons.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.11, 12, 10]} />
          <meshBasicMaterial color="#fde047" transparent opacity={p.op} />
        </mesh>
      ))}

      {/* ---- pumped protons ---- */}
      <PartGroup id="protons" position={[0, 0, 0]} onSelect={onSelect}>
        {protons.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshStandardMaterial color="#60a5fa" emissive={sel('protons') ? '#38bdf8' : '#60a5fa'} emissiveIntensity={sel('protons') ? 1.2 : 0.8} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-5.15, 2.1, 0]} name="H+ pumped up" />}
      </PartGroup>

      {/* ---- oxygen in ---- */}
      <PartGroup id="oxygen" position={[0, 0, 0]} onSelect={onSelect}>
        {o2.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.15, 14, 12]} />
            <meshStandardMaterial color="#f87171" roughness={0.35} {...emissiveProps(sel('oxygen'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[5.35, 1.8, 0]} name="Oxygen" />}
      </PartGroup>

      {/* ---- water formed ---- */}
      <PartGroup id="water" position={[0, 0, 0]} onSelect={onSelect}>
        {water.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshStandardMaterial color="#7dd3fc" transparent opacity={p.op} roughness={0.3} {...emissiveProps(sel('water'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[3.2, -2.3, 0]} name="Water" />}
      </PartGroup>
    </group>
  );
}
