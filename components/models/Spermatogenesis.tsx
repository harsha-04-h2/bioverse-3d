'use client';

import { type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

function emissiveProps(selected: boolean) {
  return selected
    ? { emissive: '#38bdf8', emissiveIntensity: 0.4 }
    : { emissive: '#000000', emissiveIntensity: 0 };
}

function StageLabel({ name }: { name: string }): JSX.Element {
  return (
    <Html position={[0, 2.7, 0]} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

/* Timeline (seconds, total 40):
   spermatogonium 0–5, primary spermatocyte 5–11, meiosis I 11–15,
   secondary spermatocytes 15–20, meiosis II 20–24, spermatids 24–29,
   spermiogenesis 29–35, spermiation 35–40 */
const STAGES = [
  { id: 'spermatogonium', name: 'Spermatogonium (2n)', start: 0, end: 5 },
  { id: 'primary-spermatocyte', name: 'Primary spermatocyte (2n)', start: 5, end: 11 },
  { id: 'meiosis-i', name: 'Meiosis I', start: 11, end: 15 },
  { id: 'secondary-spermatocytes', name: 'Secondary spermatocytes (n)', start: 15, end: 20 },
  { id: 'meiosis-ii', name: 'Meiosis II', start: 20, end: 24 },
  { id: 'spermatids', name: 'Spermatids (n)', start: 24, end: 29 },
  { id: 'spermiogenesis', name: 'Spermiogenesis', start: 29, end: 35 },
  { id: 'spermiation', name: 'Spermiation', start: 35, end: 40 },
];

interface HeroCell {
  x: number;
  y: number;
  z: number;
  r: number;
  tail: number; // 0..1 tail growth
  op: number;
  head: boolean; // reshaped into sperm head
}

const mk = (x: number, y: number, z: number, r: number, tail = 0, op = 1, head = false): HeroCell => ({
  x, y, z, r, tail, op, head,
});

function heroCells(t: number): HeroCell[] {
  if (t < 5) {
    return [mk(0.3, -0.9, 0, 0.26)];
  }
  if (t < 11) {
    const k = smooth((t - 5) / 6);
    return [mk(0.3, lerp(-0.9, -0.5, k), 0, lerp(0.26, 0.42, k))];
  }
  if (t < 15) {
    const k = smooth((t - 11) / 4);
    const s = k * 0.4;
    return [mk(0.3 - s, -0.45, 0, 0.34), mk(0.3 + s, -0.45, 0, 0.34)];
  }
  if (t < 20) {
    const k = smooth((t - 15) / 5);
    return [mk(-0.1, lerp(-0.45, -0.05, k), 0, 0.28), mk(0.7, lerp(-0.45, -0.05, k), 0, 0.28)];
  }
  if (t < 24) {
    const k = smooth((t - 20) / 4);
    const zs = k * 0.32;
    return [
      mk(-0.1, -0.05, -zs, 0.24), mk(-0.1, -0.05, zs, 0.24),
      mk(0.7, -0.05, -zs, 0.24), mk(0.7, -0.05, zs, 0.24),
    ];
  }
  if (t < 29) {
    const k = smooth((t - 24) / 5);
    return [
      mk(-0.15, lerp(-0.05, 0.4, k), -0.3, 0.22), mk(-0.15, lerp(-0.05, 0.4, k), 0.3, 0.22),
      mk(0.75, lerp(-0.05, 0.4, k), -0.3, 0.22), mk(0.75, lerp(-0.05, 0.4, k), 0.3, 0.22),
    ];
  }
  if (t < 35) {
    const k = smooth((t - 29) / 6);
    return [
      mk(-0.15, lerp(0.4, 0.75, k), -0.3, 0.2, k, 1, true),
      mk(-0.15, lerp(0.4, 0.75, k), 0.3, 0.2, k, 1, true),
      mk(0.75, lerp(0.4, 0.75, k), -0.3, 0.2, k, 1, true),
      mk(0.75, lerp(0.4, 0.75, k), 0.3, 0.2, k, 1, true),
    ];
  }
  const k = smooth((t - 35) / 5);
  return [
    mk(-0.15, lerp(0.75, 1.9, k), -0.3, 0.2, 1, 1 - k * 0.85, true),
    mk(-0.15, lerp(0.75, 2.0, k), 0.3, 0.2, 1, 1 - k * 0.85, true),
    mk(0.75, lerp(0.75, 1.9, k), -0.3, 0.2, 1, 1 - k * 0.85, true),
    mk(0.75, lerp(0.75, 2.05, k), 0.3, 0.2, 1, 1 - k * 0.85, true),
  ];
}

/**
 * Spermatogenesis — animated stages in the tubule wall (NCERT Fig 2.5).
 * One germ cell matures from the basement membrane toward the lumen: growth,
 * meiosis I (2n → two n cells), meiosis II (→ four spermatids), spermiogenesis
 * (reshaping into sperm), and spermiation (release into the lumen). 40s loop.
 */
export default function Spermatogenesis(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime } = props;
  const t = ((animTime % 40) + 40) % 40;
  const stage = STAGES.find((s) => t >= s.start && t < s.end) ?? STAGES[0];
  const cells = heroCells(t);

  const wiggle = (i: number) => Math.sin(animTime * 4 + i * 1.7) * 0.08;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(stage.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {showLabels && <StageLabel name={stage.name} />}

      {/* basement membrane */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[3.6, 0.18, 0.9]} />
        <meshStandardMaterial color="#64748b" roughness={0.6} />
      </mesh>
      {/* interstitial tissue below */}
      <mesh position={[0, -2.0, 0]}>
        <boxGeometry args={[3.6, 0.7, 0.9]} />
        <meshStandardMaterial color="#475569" transparent opacity={0.55} roughness={0.7} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[-1.5 + i * 0.75, -2.0, (rand(i * 3 + 1) - 0.5) * 0.4]}>
          <sphereGeometry args={[0.11, 14, 10]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.6} />
        </mesh>
      ))}
      {/* lumen band */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[3.6, 0.6, 0.9]} />
        <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.18} roughness={0.2} depthWrite={false} />
      </mesh>
      {/* Sertoli cell (nurse cell) */}
      <mesh position={[-1.0, -0.25, 0]}>
        <capsuleGeometry args={[0.3, 1.5, 8, 16]} />
        <meshStandardMaterial
          color="#6ee7b7"
          transparent
          opacity={0.75}
          roughness={0.5}
          emissive={selectedId === 'sertoli' ? '#38bdf8' : '#000000'}
          emissiveIntensity={selectedId === 'sertoli' ? 0.35 : 0}
        />
      </mesh>

      {showLabels && (
        <>
          <PartLabel position={[-2.35, -1.5, 0]} name="Basement membrane" />
          <PartLabel position={[-1.0, 0.95, 0]} name="Sertoli cell" />
          <PartLabel position={[2.35, 2.2, 0]} name="Lumen" />
        </>
      )}

      {/* hero germ cells */}
      {cells.map((c, i) =>
        c.op > 0.01 ? (
          <group key={i} position={[c.x, c.y, c.z]}>
            {!c.head ? (
              <mesh>
                <sphereGeometry args={[c.r, 24, 18]} />
                <meshStandardMaterial
                  color={t < 11 ? '#38bdf8' : t < 20 ? '#818cf8' : '#c084fc'}
                  transparent
                  opacity={c.op}
                  roughness={0.45}
                  {...emissiveProps(selectedId === stage.id)}
                />
              </mesh>
            ) : (
              <group rotation={[0, 0, wiggle(i)]}>
                <mesh>
                  <coneGeometry args={[c.r * 0.75, c.r * 1.1, 14]} />
                  <meshStandardMaterial
                    color="#f0abfc"
                    transparent
                    opacity={c.op}
                    roughness={0.45}
                    {...emissiveProps(selectedId === stage.id)}
                  />
                </mesh>
                <mesh position={[0, -0.15 - c.tail * 0.45, 0]}>
                  <cylinderGeometry args={[0.028, 0.012, Math.max(0.01, c.tail * 0.9), 8]} />
                  <meshStandardMaterial
                    color="#e9d5ff"
                    transparent
                    opacity={c.op}
                    roughness={0.45}
                    {...emissiveProps(selectedId === stage.id)}
                  />
                </mesh>
              </group>
            )}
          </group>
        ) : null
      )}
    </group>
  );
}
