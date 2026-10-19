'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Synaptic transmission timeline (seconds, total 14, loops):
   0–2.5    action potential arrives down the axon into the presynaptic terminal
   2.5–5    voltage-gated Ca²⁺ channels open; Ca²⁺ floods the terminal
   5–8      synaptic vesicles dock and fuse with the presynaptic membrane (exocytosis)
   8–10.5   neurotransmitter molecules diffuse across the synaptic cleft
   10.5–12  transmitters bind postsynaptic receptors; the receptor lights up
   12–14    reset: vesicles replenish, ions clear */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

const STAGE_IDS = ['ap-arrival', 'calcium-influx', 'vesicle-fusion', 'transmitter-diffusion', 'receptor-binding', 'cleanup'];
const STAGE_NAMES = [
  'Action potential arrives',
  'Ca²⁺ influx into terminal',
  'Vesicle fusion (exocytosis)',
  'Neurotransmitter diffusion',
  'Receptor binding',
  'Cleanup & reset',
];

function stageIndex(t: number): number {
  if (t < 2.5) return 0;
  if (t < 5) return 1;
  if (t < 8) return 2;
  if (t < 10.5) return 3;
  if (t < 12) return 4;
  return 5;
}

const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

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

// Membrane of the terminal sits at y = 0.55; vesicles dock just above it.
const DOCK_Y = 0.72;

export default function Synapse(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const t = animTime % 14;
  const si = stageIndex(t);
  const sel = (id: string) => selectedId === id;

  const vesicles = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        home: [
          (rand(i * 3 + 1) - 0.5) * 1.7,
          1.1 + rand(i * 3 + 2) * 0.7,
          (rand(i * 3 + 3) - 0.5) * 1.1,
        ] as [number, number, number],
        dock: [(rand(i * 5 + 4) - 0.5) * 1.2, DOCK_Y, (rand(i * 5 + 5) - 0.5) * 0.5] as [number, number, number],
        fuser: i < 4, // first four vesicles fuse this cycle
        seed: rand(i * 7 + 6),
      })),
    [],
  );

  const caDots = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: (rand(i * 11 + 1) - 0.5) * 1.6,
        z: (rand(i * 11 + 2) - 0.5) * 1.0,
        seed: rand(i * 11 + 3),
      })),
    [],
  );

  const ntDots = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        x: (rand(i * 13 + 1) - 0.5) * 1.5,
        z: (rand(i * 13 + 2) - 0.5) * 0.7,
        seed: rand(i * 13 + 3),
      })),
    [],
  );

  const receptors = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        x: -1.25 + i * 0.5,
        z: (rand(i * 17 + 1) - 0.5) * 0.6,
      })),
    [],
  );

  // Presynaptic flash when the AP arrives (stage 0) and during Ca influx.
  const apFlash = t < 2.5 ? Math.sin((t / 2.5) * Math.PI) : 0;
  const caGlow = t >= 2.5 && t < 5 ? 0.35 + 0.35 * Math.sin(t * 10) : 0;
  const postGlow = t >= 10.5 && t < 12.5 ? smooth((t - 10.5) / 1) * (1 - smooth((t - 11.8) / 0.7)) : 0;

  const terminalLift = explode * 1.6;
  const cleftSpread = 1 + explode * 0.5;
  const postDrop = explode * 1.6;

  return (
    <group>
      {/* ---- stage banner ---- */}
      {showLabels && (
        <Html position={[0, 3.9, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{STAGE_NAMES[si]}</span>
        </Html>
      )}

      {/* ---- axon stub feeding the terminal ---- */}
      <PartGroup id="presynaptic-terminal" position={[0, terminalLift, 0]} onSelect={onSelect}>
        <mesh position={[0, 2.9, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 1.4, 18]} />
          <meshStandardMaterial color="#a855f7" roughness={0.4} {...emissiveProps(sel('presynaptic-terminal'))} />
        </mesh>
        {/* arriving action-potential pulse */}
        {t < 2.5 && (
          <mesh position={[0, 3.55 - (t / 2.5) * 1.6, 0]}>
            <sphereGeometry args={[0.36, 18, 14]} />
            <meshBasicMaterial color="#fde68a" transparent opacity={0.9} />
          </mesh>
        )}
        {/* terminal bulb: squashed translucent sphere */}
        <mesh position={[0, 1.55, 0]} scale={[1.25, 0.85, 0.85]}>
          <sphereGeometry args={[1, 36, 24]} />
          <meshStandardMaterial
            color="#c084fc"
            transparent
            opacity={0.55}
            roughness={0.35}
            emissive={sel('presynaptic-terminal') ? '#38bdf8' : apFlash > 0.01 || caGlow > 0.01 ? '#fbbf24' : '#000000'}
            emissiveIntensity={sel('presynaptic-terminal') ? 0.4 : Math.max(apFlash * 0.8, caGlow)}
          />
        </mesh>
        {/* presynaptic membrane (bottom rim of the bulb) */}
        <mesh position={[0, 0.55, 0]} scale={[1.18, 1, 0.78]}>
          <torusGeometry args={[0.95, 0.07, 10, 48]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive={caGlow > 0.01 ? '#fbbf24' : '#000000'}
            emissiveIntensity={caGlow}
            roughness={0.4}
          />
        </mesh>
        {showLabels && <PartLabel position={[-1.9, 1.7, 0]} name="Presynaptic terminal" />}
      </PartGroup>

      {/* ---- synaptic vesicles ---- */}
      <PartGroup id="synaptic-vesicles" position={[0, terminalLift, 0]} onSelect={onSelect}>
        {vesicles.map((v, i) => {
          const fuseK = v.fuser ? smooth((t - 5 - v.seed * 1.4) / 1.6) : 0;
          const releaseK = t >= 12 ? smooth((t - 12) / 1.2) : 0; // replenish during cleanup
          const gone = v.fuser && t >= 8 && t < 12;
          const op = gone ? 1 - smooth((t - 8) / 0.8) : releaseK > 0 ? releaseK : 1;
          if (op < 0.02) return null;
          const pos: [number, number, number] = [
            lerp(v.home[0], v.dock[0], fuseK),
            lerp(v.home[1], v.dock[1], fuseK),
            lerp(v.home[2], v.dock[2], fuseK),
          ];
          const r = 0.19 * (1 - fuseK * 0.55);
          return (
            <group key={i} position={pos}>
              <mesh>
                <sphereGeometry args={[r, 16, 12]} />
                <meshStandardMaterial
                  color="#e9d5ff"
                  transparent
                  opacity={op * 0.95}
                  roughness={0.3}
                  {...emissiveProps(sel('synaptic-vesicles'))}
                />
              </mesh>
              {/* vesicle contents hint */}
              <mesh>
                <sphereGeometry args={[r * 0.55, 10, 8]} />
                <meshBasicMaterial color="#f0abfc" transparent opacity={op * 0.9} />
              </mesh>
            </group>
          );
        })}
        {showLabels && <PartLabel position={[1.9, 1.5, 0]} name="Synaptic vesicles" />}
      </PartGroup>

      {/* ---- Ca²⁺ influx dots ---- */}
      {caDots.map((d, i) => {
        if (t < 2.5 || t >= 5.5) return null;
        const p = ((t - 2.5) * 1.7 + d.seed) % 1;
        const y = lerp(2.5, 1.05, p);
        const op = Math.sin(Math.PI * p);
        return (
          <mesh key={i} position={[d.x * cleftSpread, y + terminalLift * p, d.z]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={op} />
          </mesh>
        );
      })}
      {showLabels && t >= 2.5 && t < 5.5 && <PartLabel position={[2.2, 2.1 + terminalLift, 0]} name="Ca²⁺ influx" />}

      {/* ---- synaptic cleft + diffusing neurotransmitter ---- */}
      <PartGroup id="synaptic-cleft" position={[0, 0, 0]} onSelect={onSelect}>
        {/* cleft guide lines */}
        <Line points={[[-1.7, 0.45, 0], [1.7, 0.45, 0]]} color="#64748b" transparent opacity={0.4} lineWidth={1} />
        <Line points={[[-1.7, -0.35, 0], [1.7, -0.35, 0]]} color="#64748b" transparent opacity={0.4} lineWidth={1} />
        {ntDots.map((d, i) => {
          const p = smooth((t - 8 - d.seed * 1.1) / 1.6);
          if (p <= 0.01) return null;
          const fade = t >= 11.5 ? 1 - smooth((t - 11.5) / 1.2) : 1; // cleared during cleanup
          if (fade <= 0.01) return null;
          const y = lerp(0.5 + terminalLift * 0.4, -0.3 - postDrop * 0.4, p);
          const wob = Math.sin(p * 9 + i) * 0.08 * (1 - p);
          return (
            <mesh key={i} position={[d.x * cleftSpread + wob, y, d.z]}>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshBasicMaterial color="#4ade80" transparent opacity={fade * (0.35 + 0.65 * p)} />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[2.35, 0.05, 0]} name="Synaptic cleft" />}
      </PartGroup>

      {/* ---- postsynaptic membrane ---- */}
      <PartGroup id="postsynaptic-membrane" position={[0, -postDrop, 0]} onSelect={onSelect}>
        <mesh position={[0, -0.75, 0]}>
          <boxGeometry args={[3.9, 0.7, 1.5]} />
          <meshStandardMaterial
            color="#3b82f6"
            roughness={0.45}
            emissive={sel('postsynaptic-membrane') ? '#38bdf8' : '#22d3ee'}
            emissiveIntensity={sel('postsynaptic-membrane') ? 0.4 : postGlow * 0.55}
          />
        </mesh>
        {/* receptor Y-shapes */}
        <PartGroup id="receptors" position={[0, 0, 0]} onSelect={onSelect}>
          {receptors.map((r, i) => {
            const bound = t >= 10.5 && t < 12.5;
            const col = sel('receptors') ? '#38bdf8' : bound ? '#4ade80' : '#93c5fd';
            return (
              <group key={i} position={[r.x, -0.35, r.z]}>
                <mesh position={[-0.06, 0.12, 0]} rotation={[0, 0, 0.5]}>
                  <cylinderGeometry args={[0.045, 0.045, 0.34, 8]} />
                  <meshStandardMaterial color={col} emissive={col} emissiveIntensity={bound ? 0.9 : sel('receptors') ? 0.4 : 0.15} roughness={0.35} />
                </mesh>
                <mesh position={[0.06, 0.12, 0]} rotation={[0, 0, -0.5]}>
                  <cylinderGeometry args={[0.045, 0.045, 0.34, 8]} />
                  <meshStandardMaterial color={col} emissive={col} emissiveIntensity={bound ? 0.9 : sel('receptors') ? 0.4 : 0.15} roughness={0.35} />
                </mesh>
              </group>
            );
          })}
          {showLabels && <PartLabel position={[-2.2, -0.15, 0]} name="Receptors" />}
        </PartGroup>
        {showLabels && <PartLabel position={[2.2, -1.05, 0]} name="Postsynaptic membrane" />}
      </PartGroup>
    </group>
  );
}
