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

/** Straight pipe between two points. */
function Pipe({
  from,
  to,
  radius,
  color,
  selected,
}: {
  from: [number, number, number];
  to: [number, number, number];
  radius: number;
  color: string;
  selected: boolean;
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
      <cylinderGeometry args={[radius, radius, len, 14]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.35} {...emissiveProps(selected)} />
    </mesh>
  );
}

const CONCRETE = '#d6d3d1';
const STEEL = '#94a3b8';
const SLURRY = '#92400e';

export default function BiogasPlant(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  // Gas holder floats gently as gas collects / is drawn off.
  const holderBob = 0.12 * Math.sin(animTime * 0.8);
  const flameFlicker = 1 + 0.16 * Math.sin(animTime * 13) * Math.sin(animTime * 7.3);

  const gasHose = useMemo(() => {
    const pts = [
      new THREE.Vector3(0, 0.62, 0),
      new THREE.Vector3(0.45, 0.35, 0.1),
      new THREE.Vector3(0.9, -0.15, 0.35),
      new THREE.Vector3(1.35, -0.75, 0.7),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.06, 8, false);
  }, []);

  return (
    <group>
      {/* ================= Ground (digester sits buried in it) ================= */}
      <group>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[9.5, 0.4, 7]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.0, 0]}>
          <boxGeometry args={[9.5, 0.06, 7]} />
          <meshStandardMaterial color="#86efac" roughness={0.9} />
        </mesh>
      </group>

      {/* ================= Mixing tank (inlet) ================= */}
      <PartGroup id="mixing-tank" position={explodeOffset([-1.6, 1.1, 0], explode)} onSelect={onSelect}>
        <group position={[-3.1, 0, 0]}>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.95, 0.95, 1.1, 28]} />
            <meshStandardMaterial color={CONCRETE} roughness={0.7} {...emissiveProps(sel('mixing-tank'))} />
          </mesh>
          <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.95, 0.07, 10, 28]} />
            <meshStandardMaterial color="#a8a29e" roughness={0.7} {...emissiveProps(sel('mixing-tank'))} />
          </mesh>
          <mesh position={[0, 0.92, 0]}>
            <cylinderGeometry args={[0.88, 0.88, 0.12, 28]} />
            <meshStandardMaterial color={SLURRY} roughness={0.9} {...emissiveProps(sel('mixing-tank'))} />
          </mesh>
          {showLabels && <PartLabel position={[0, 1.55, 0]} name="Mixing tank (inlet)" />}
        </group>
      </PartGroup>

      {/* ================= Underground digester dome ================= */}
      <PartGroup id="digester" position={explodeOffset([0, 1.4, 0], explode)} onSelect={onSelect}>
        <group position={[0, 0, 0]}>
          <mesh position={[0, -0.85, 0]}>
            <cylinderGeometry args={[1.7, 1.7, 1.7, 36]} />
            <meshStandardMaterial color={CONCRETE} roughness={0.75} {...emissiveProps(sel('digester'))} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.7, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.7} side={THREE.DoubleSide} {...emissiveProps(sel('digester'))} />
          </mesh>
          {/* slurry level hint inside the dome rim */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[1.55, 1.55, 0.1, 32]} />
            <meshStandardMaterial color={SLURRY} roughness={0.95} {...emissiveProps(sel('digester'))} />
          </mesh>
          {showLabels && <PartLabel position={[-2.35, 0.9, 0]} name="Digester (underground)" />}
        </group>
      </PartGroup>

      {/* ================= Floating gas holder ================= */}
      <PartGroup id="gas-holder" position={explodeOffset([0, 2.4, 0], explode)} onSelect={onSelect}>
        <group position={[0, 1.7 + holderBob, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1.15, 1.15, 1.1, 32]} />
            <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.55} side={THREE.DoubleSide} {...emissiveProps(sel('gas-holder'))} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <sphereGeometry args={[1.15, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#a8b6c4" roughness={0.4} metalness={0.55} {...emissiveProps(sel('gas-holder'))} />
          </mesh>
          {/* guide frame */}
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 1.38, -0.9, Math.sin(a) * 1.38]}>
                <cylinderGeometry args={[0.05, 0.05, 2.9, 10]} />
                <meshStandardMaterial color="#64748b" roughness={0.5} metalness={0.5} {...emissiveProps(sel('gas-holder'))} />
              </mesh>
            );
          })}
          {/* flexible gas hose riding with the holder */}
          <mesh geometry={gasHose}>
            <meshStandardMaterial color="#475569" roughness={0.6} {...emissiveProps(sel('gas-holder'))} />
          </mesh>
          {showLabels && <PartLabel position={[0, 1.55, 0]} name="Floating gas holder" />}
        </group>
      </PartGroup>

      {/* ================= Outlet tank (spent slurry) ================= */}
      <PartGroup id="outlet-tank" position={explodeOffset([1.6, 1.1, 0], explode)} onSelect={onSelect}>
        <group position={[3.2, 0, 0]}>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.5, 0.9, 1.5]} />
            <meshStandardMaterial color={CONCRETE} roughness={0.7} {...emissiveProps(sel('outlet-tank'))} />
          </mesh>
          <mesh position={[0, 0.86, 0]}>
            <boxGeometry args={[1.36, 0.1, 1.36]} />
            <meshStandardMaterial color={SLURRY} roughness={0.95} {...emissiveProps(sel('outlet-tank'))} />
          </mesh>
          {showLabels && <PartLabel position={[0, 1.4, 0]} name="Outlet tank (spent slurry)" />}
        </group>
      </PartGroup>

      {/* ================= Slurry pipes ================= */}
      <PartGroup id="slurry-pipes" position={explodeOffset([0, 0.7, -1.2], explode)} onSelect={onSelect}>
        <Pipe from={[-2.25, 0.55, 0]} to={[-1.35, -0.05, 0]} radius={0.11} color={STEEL} selected={sel('slurry-pipes')} />
        <Pipe from={[1.5, 0.15, 0]} to={[2.5, 0.5, 0]} radius={0.11} color={STEEL} selected={sel('slurry-pipes')} />
        {showLabels && <PartLabel position={[-1.8, 1.15, 0]} name="Slurry inlet pipe" />}
      </PartGroup>

      {/* ================= Gas pipeline ================= */}
      <PartGroup id="gas-pipeline" position={explodeOffset([0.4, 0.9, 1.3], explode)} onSelect={onSelect}>
        <Pipe from={[1.35, 0.95, 0.7]} to={[1.35, 0.14, 0.7]} radius={0.06} color="#f59e0b" selected={sel('gas-pipeline')} />
        <Pipe from={[1.35, 0.14, 0.7]} to={[3.8, 0.14, 1.8]} radius={0.06} color="#f59e0b" selected={sel('gas-pipeline')} />
        <mesh position={[2.6, 0.3, 1.32]} rotation={[0, 0.5, 0]}>
          <torusGeometry args={[0.12, 0.035, 8, 18]} />
          <meshStandardMaterial color="#b45309" roughness={0.5} metalness={0.4} {...emissiveProps(sel('gas-pipeline'))} />
        </mesh>
        {showLabels && <PartLabel position={[2.6, 0.75, 1.3]} name="Gas pipeline + valve" />}
      </PartGroup>

      {/* ================= Gas burner ================= */}
      <PartGroup id="burner" position={explodeOffset([1.2, 0.7, 1.2], explode)} onSelect={onSelect}>
        <group position={[3.8, 0, 1.8]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.3, 0.36, 0.24, 20]} />
            <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.4} {...emissiveProps(sel('burner'))} />
          </mesh>
          <mesh position={[0, 0.32 + 0.14 * flameFlicker, 0]} scale={[1, flameFlicker, 1]}>
            <coneGeometry args={[0.13, 0.42, 14]} />
            <meshStandardMaterial color="#38bdf8" emissive={sel('burner') ? '#38bdf8' : '#0ea5e9'} emissiveIntensity={sel('burner') ? 2.0 : 1.6} roughness={0.3} />
          </mesh>
          {showLabels && <PartLabel position={[0, 1.0, 0]} name="Gas burner" />}
        </group>
      </PartGroup>
    </group>
  );
}
