'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
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

function HintLabel({ position, text }: { position: [number, number, number]; text: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span style={{ fontSize: '0.72em', opacity: 0.85 }}>{text}</span>
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

function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

interface Particle {
  from: [number, number, number];
  to: [number, number, number];
  offset: number;
}

function smooth(u: number): number {
  return u * u * (3 - 2 * u);
}

/** Diffusing gas dots, each travelling from->to on a looping schedule. */
function GasParticles({
  particles,
  color,
  speed,
  selected,
  t,
}: {
  particles: Particle[];
  color: string;
  speed: number;
  selected: boolean;
  t: number;
}): JSX.Element {
  const em = emissiveProps(selected);
  return (
    <group>
      {particles.map((p, i) => {
        const u = (((t * speed + p.offset) % 1) + 1) % 1;
        const k = smooth(u);
        return (
          <mesh
            key={i}
            position={[
              p.from[0] + (p.to[0] - p.from[0]) * k,
              p.from[1] + (p.to[1] - p.from[1]) * k,
              p.from[2] + (p.to[2] - p.from[2]) * k,
            ]}
          >
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} {...em} />
          </mesh>
        );
      })}
    </group>
  );
}

const LUNG_X = -3.1;
const TISSUE_X = 3.1;

export default function GasExchange(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime: t } = props;
  const sel = (id: string) => selectedId === id;

  const lungEx = explodeOffset([LUNG_X, 0, 0], explode);
  const tissueEx = explodeOffset([TISSUE_X, 0, 0], explode);

  const lungO2 = useMemo<Particle[]>(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        from: [
          (rand(i * 3 + 1) - 0.5) * 0.9,
          0.55 + rand(i * 3 + 2) * 0.55,
          (rand(i * 3 + 3) - 0.5) * 0.9,
        ],
        to: [
          Math.cos(rand(i * 5 + 9) * Math.PI * 2) * 1.08,
          -0.15 + rand(i * 5 + 10) * 0.25,
          Math.sin(rand(i * 5 + 9) * Math.PI * 2) * 1.08,
        ],
        offset: rand(i * 7 + 21),
      })),
    [],
  );
  const lungCO2 = useMemo<Particle[]>(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        from: [
          Math.cos(rand(i * 11 + 31) * Math.PI * 2) * 1.08,
          -0.2 + rand(i * 11 + 32) * 0.3,
          Math.sin(rand(i * 11 + 31) * Math.PI * 2) * 1.08,
        ],
        to: [
          (rand(i * 13 + 41) - 0.5) * 0.9,
          0.55 + rand(i * 13 + 42) * 0.55,
          (rand(i * 13 + 43) - 0.5) * 0.9,
        ],
        offset: rand(i * 17 + 51),
      })),
    [],
  );
  const tissueO2 = useMemo<Particle[]>(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        from: [(rand(i * 19 + 61) - 0.5) * 2.4, 0.6, (rand(i * 19 + 62) - 0.5) * 0.4],
        to: [(rand(i * 23 + 71) - 0.5) * 2.2, -0.55, (rand(i * 23 + 72) - 0.5) * 0.6],
        offset: rand(i * 29 + 81),
      })),
    [],
  );
  const tissueCO2 = useMemo<Particle[]>(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        from: [(rand(i * 31 + 91) - 0.5) * 2.2, -0.55, (rand(i * 31 + 92) - 0.5) * 0.6],
        to: [(rand(i * 37 + 101) - 0.5) * 2.4, 0.6, (rand(i * 37 + 102) - 0.5) * 0.4],
        offset: rand(i * 41 + 111),
      })),
    [],
  );

  return (
    <group>
      {/* ================= LUNGS: alveolus + capillary ================= */}
      <group position={[LUNG_X + lungEx[0], 0, 0]}>
        {/* alveolus: open bowl */}
        <PartGroup id="alveolus" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[0, 0.32, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.95, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#f9a8d4"
              transparent
              opacity={0.75}
              roughness={0.45}
              metalness={0.02}
              side={THREE.DoubleSide}
              {...emissiveProps(sel('alveolus'))}
            />
          </mesh>
          {showLabels && <PartLabel position={[0, 1.75, 0]} name="Alveolus" />}
        </PartGroup>

        {/* capillary network hugging the sac */}
        <PartGroup id="capillary" position={[0, 0, 0]} onSelect={onSelect}>
          {[0.02, -0.34].map((y, i) => (
            <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0.35 * i]}>
              <torusGeometry args={[1.08, 0.15, 12, 48]} />
              <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.1} {...emissiveProps(sel('capillary'))} />
            </mesh>
          ))}
          {showLabels && <PartLabel position={[1.55, -0.75, 0]} name="Capillary" />}
        </PartGroup>

        {/* O2 alveolus -> blood; CO2 blood -> alveolus */}
        <PartGroup id="o2" position={[0, 0, 0]} onSelect={onSelect}>
          <GasParticles particles={lungO2} color="#ef4444" speed={0.2} selected={sel('o2')} t={t} />
          {showLabels && <PartLabel position={[-1.15, 1.15, 0]} name="O₂" />}
        </PartGroup>
        <PartGroup id="co2" position={[0, 0, 0]} onSelect={onSelect}>
          <GasParticles particles={lungCO2} color="#60a5fa" speed={0.2} selected={sel('co2')} t={t} />
          {showLabels && <PartLabel position={[1.3, 1.1, 0]} name="CO₂" />}
        </PartGroup>

        {showLabels && (
          <>
            <HintLabel position={[0, -1.55, 0]} text="Alveolar air: pO₂ 104 · pCO₂ 40 mm Hg" />
            <PartLabel position={[0, 2.55, 0]} name="In the lungs" />
          </>
        )}
      </group>

      {/* ================= TISSUES: capillary + body cells ================= */}
      <group position={[TISSUE_X + tissueEx[0], 0, 0]}>
        <PartGroup id="capillary" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 3.0, 20]} />
            <meshStandardMaterial
              color="#dc2626"
              transparent
              opacity={0.85}
              roughness={0.4}
              metalness={0.1}
              {...emissiveProps(sel('capillary'))}
            />
          </mesh>
          {showLabels && <PartLabel position={[1.85, 0.85, 0]} name="Capillary" />}
        </PartGroup>

        <PartGroup id="body-cells" position={[0, 0, 0]} onSelect={onSelect}>
          {[-1.05, 0, 1.05].map((x, i) => (
            <mesh key={i} position={[x, -0.95, (i % 2 === 0 ? 0.25 : -0.25)]}>
              <sphereGeometry args={[0.52, 28, 28]} />
              <meshStandardMaterial color="#c4b5fd" roughness={0.5} metalness={0.03} {...emissiveProps(sel('body-cells'))} />
            </mesh>
          ))}
          {showLabels && <PartLabel position={[0, -1.9, 0]} name="Body cells" />}
        </PartGroup>

        {/* O2 blood -> cells; CO2 cells -> blood */}
        <PartGroup id="o2" position={[0, 0, 0]} onSelect={onSelect}>
          <GasParticles particles={tissueO2} color="#ef4444" speed={0.2} selected={sel('o2')} t={t} />
          {showLabels && <PartLabel position={[-1.9, -0.1, 0]} name="O₂" />}
        </PartGroup>
        <PartGroup id="co2" position={[0, 0, 0]} onSelect={onSelect}>
          <GasParticles particles={tissueCO2} color="#60a5fa" speed={0.2} selected={sel('co2')} t={t} />
          {showLabels && <PartLabel position={[1.95, -0.15, 0]} name="CO₂" />}
        </PartGroup>

        {showLabels && (
          <>
            <HintLabel position={[0, -2.6, 0]} text="Tissue fluid: pO₂ 40 · pCO₂ 45 mm Hg" />
            <PartLabel position={[0, 2.55, 0]} name="In the tissues" />
          </>
        )}
      </group>
    </group>
  );
}
