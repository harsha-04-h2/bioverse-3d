'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import type { BioModelProps } from './types';

/* Action-potential timeline (seconds, total 12, loops):
   0–1.5  resting potential (all channels closed, −70 mV)
   1.5–4.5 depolarization: wavefront sweeps along the axon, voltage-gated Na⁺ channels open
   4.5–7.5 repolarization: K⁺ channels open behind the front, membrane potential falls
   7.5–12 refractory period: Na⁺ channels inactivated, axon temporarily unexcitable
   Waves sweep deterministically from animTime; the voltage trace is computed, not pre-baked. */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const X0 = -4;
const X1 = 4;
const R = 0.5; // axon radius
const SLICES = 44;

type Zone = 'rest' | 'depol' | 'repol' | 'refrac';

function wavefront(t: number): number {
  return lerp(X0 - 0.2, X1 + 0.2, clamp01((t - 1.5) / 6));
}
function recoveryFront(t: number): number {
  return lerp(X0 - 0.2, X1 + 0.2, clamp01((t - 7.5) / 4.5));
}

function zone(x: number, t: number): Zone {
  if (t < 1.5) return 'rest';
  if (t < 7.5) {
    const d = x - wavefront(t);
    if (d > 0.55) return 'rest';
    if (d >= -0.55) return 'depol';
    if (d >= -1.7) return 'repol';
    return 'refrac';
  }
  return x < recoveryFront(t) ? 'rest' : 'refrac';
}

function stageId(t: number): string {
  if (t < 1.5) return 'resting';
  if (t < 4.5) return 'depolarization';
  if (t < 7.5) return 'repolarization';
  return 'refractory';
}
function stageName(t: number): string {
  switch (stageId(t)) {
    case 'resting':
      return 'Resting potential (−70 mV)';
    case 'depolarization':
      return 'Depolarization — Na⁺ influx';
    case 'repolarization':
      return 'Repolarization — K⁺ efflux';
    default:
      return 'Refractory period';
  }
}

/** Voltage trace y (relative; 0 = resting, 2.2 = spike peak, negative = undershoot). */
function voltY(x: number, t: number): number {
  if (t < 1.5 || t >= 7.5) return 0;
  const d = x - wavefront(t);
  if (d > 0.55) return 0;
  if (d >= -0.55) {
    const u = 1 - Math.abs(d) / 0.55;
    return 2.2 * Math.pow(u, 1.5);
  }
  if (d >= -1.7) {
    const u = (d + 1.7) / 1.15;
    return -0.5 * Math.sin(Math.PI * u); // after-hyperpolarization dip
  }
  return 0;
}

const ZONE_STYLE: Record<Zone, { color: string; emissive: string; intensity: number }> = {
  rest: { color: '#475569', emissive: '#000000', intensity: 0 },
  depol: { color: '#ef4444', emissive: '#ef4444', intensity: 0.9 },
  repol: { color: '#22d3ee', emissive: '#22d3ee', intensity: 0.9 },
  refrac: { color: '#1e293b', emissive: '#000000', intensity: 0 },
};

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

export default function ActionPotential(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const t = animTime % 12;
  const sel = (id: string) => selectedId === id;

  const slices = useMemo(() => {
    const len = (X1 - X0 + 0.4) / SLICES;
    return Array.from({ length: SLICES }, (_, i) => {
      const x = X0 - 0.2 + len * (i + 0.5);
      return { x, len };
    });
  }, []);

  const channels = useMemo(() => {
    const out: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < 9; i++) {
      const x = -3.55 + i * 0.89;
      out.push({ x, y: R + 0.06, z: 0 });
      out.push({ x, y: -(R + 0.06), z: 0 });
    }
    return out;
  }, []);

  const naDots = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: -3.9 + i * 0.5,
        th: rand(i * 7 + 1) * Math.PI * 2,
        seed: i * 0.37,
      })),
    [],
  );
  const kDots = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: -3.65 + i * 0.5,
        th: rand(i * 13 + 2) * Math.PI * 2,
        seed: i * 0.53,
      })),
    [],
  );

  const tracePoints = useMemo(
    () =>
      Array.from({ length: 41 }, (_, i) => {
        const x = X0 + ((X1 - X0) * i) / 40;
        return [x, voltY(x, t) - 2.1, 0] as [number, number, number];
      }),
    [t],
  );

  const radiusScale = 1 + explode * 0.45;
  const ionRadiusScale = 1 + explode * 0.8;
  const stage = stageId(t);
  const stageColor = stage === 'depolarization' ? '#f87171' : stage === 'repolarization' ? '#67e8f9' : stage === 'refractory' ? '#94a3b8' : '#a8b3c7';

  return (
    <group>
      {/* ---- stage banner ---- */}
      {showLabels && (
        <Html position={[0, 2.35, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span style={{ color: stageColor }}>{stageName(t)}</span>
        </Html>
      )}

      {/* ---- extracellular hint shell ---- */}
      <mesh>
        <cylinderGeometry args={[1.05, 1.05, X1 - X0 + 0.6, 24, 1, true]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* ---- axoplasm core ---- */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[R - 0.06, R - 0.06, X1 - X0 + 0.4, 20]} />
        <meshStandardMaterial color="#fcd34d" transparent opacity={0.35} roughness={0.4} depthWrite={false} />
      </mesh>

      {/* ---- membrane: per-slice zone colouring ---- */}
      <PartGroup id="axon-membrane" position={[0, explode * 0.9, 0]} onSelect={onSelect}>
        {slices.map((s, i) => {
          const z = zone(s.x, t);
          const st = ZONE_STYLE[z];
          const selected = sel('axon-membrane');
          return (
            <mesh key={i} position={[s.x, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[radiusScale, 1, radiusScale]}>
              <cylinderGeometry args={[R, R, s.len * 1.02, 16]} />
              <meshStandardMaterial
                color={selected ? '#38bdf8' : st.color}
                emissive={selected ? '#38bdf8' : st.emissive}
                emissiveIntensity={selected ? 0.4 : st.intensity}
                roughness={0.45}
                metalness={0.05}
              />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[2.9, 1.05, 0]} name="Axon membrane" />}
      </PartGroup>

      {/* ---- voltage-gated channel markers ---- */}
      <PartGroup id="ion-channels" position={[0, explode * 1.7, 0]} onSelect={onSelect}>
        {channels.map((c, i) => {
          const z = zone(c.x, t);
          const st = ZONE_STYLE[z];
          const selected = sel('ion-channels');
          return (
            <mesh key={i} position={[c.x, c.y * radiusScale, c.z]} scale={[1, 1, 1]}>
              <boxGeometry args={[0.3, 0.14, 0.14]} />
              <meshStandardMaterial
                color={selected ? '#38bdf8' : st.color}
                emissive={selected ? '#38bdf8' : st.emissive}
                emissiveIntensity={selected ? 0.4 : st.intensity * 0.9}
                roughness={0.35}
              />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[-2.2, 1.15, 0]} name="Voltage-gated Na⁺ / K⁺ channels" />}
      </PartGroup>

      {/* ---- Na⁺ ions rushing inward at the depolarization zone ---- */}
      {naDots.map((d, i) => {
        const active = zone(d.x, t) === 'depol';
        if (!active) return null;
        const p = (t * 1.6 + d.seed) % 1;
        const r = (0.95 - 0.62 * p) * ionRadiusScale;
        const op = Math.sin(Math.PI * p);
        return (
          <mesh key={i} position={[d.x, Math.cos(d.th) * r, Math.sin(d.th) * r]}>
            <sphereGeometry args={[0.085, 10, 10]} />
            <meshBasicMaterial color="#f87171" transparent opacity={op * 0.95} />
          </mesh>
        );
      })}

      {/* ---- K⁺ ions leaving during repolarization ---- */}
      {kDots.map((d, i) => {
        const active = zone(d.x, t) === 'repol';
        if (!active) return null;
        const p = (t * 1.6 + d.seed) % 1;
        const r = (0.3 + 0.65 * p) * ionRadiusScale;
        const op = Math.sin(Math.PI * p);
        return (
          <mesh key={i} position={[d.x, Math.cos(d.th) * r, Math.sin(d.th) * r]}>
            <sphereGeometry args={[0.085, 10, 10]} />
            <meshBasicMaterial color="#67e8f9" transparent opacity={op * 0.95} />
          </mesh>
        );
      })}

      {showLabels && t >= 1.5 && t < 7.5 && (
        <PartLabel position={[wavefront(t), -1.15, 0]} name={stage === 'depolarization' ? 'Na⁺ influx' : 'K⁺ efflux'} />
      )}

      {/* ---- voltage trace (NCERT-style curve drawn along the axon) ---- */}
      <PartGroup id="voltage-trace" position={[0, -explode * 1.1, 0]} onSelect={onSelect}>
        <Line points={tracePoints} color={stageColor} lineWidth={2} transparent opacity={0.95} />
        {showLabels && <PartLabel position={[-4.6, -2.1, 0]} name="Membrane potential (mV)" />}
      </PartGroup>
    </group>
  );
}
