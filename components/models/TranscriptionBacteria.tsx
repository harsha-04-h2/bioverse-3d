'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import type { BioModelProps } from './types';

function emissiveProps(selected: boolean): { emissive: string; emissiveIntensity: number } {
  return selected
    ? { emissive: '#38bdf8', emissiveIntensity: 0.4 }
    : { emissive: '#000000', emissiveIntensity: 0 };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function PartLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label">
      <span>{name}</span>
    </Html>
  );
}

function ClickGroup({
  id,
  position,
  onSelect,
  children,
}: {
  id: string;
  position?: [number, number, number];
  onSelect: (id: string | null) => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <group
      position={position ?? [0, 0, 0]}
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

const DUR = 24;
const X_LEFT = -4.6;
const X_RIGHT = 4.6;
const Z_S = 0.24;
const PROM_X = -3.6;
const TERM_X = 3.6;

const COL_TEMPLATE = '#fb923c';
const COL_CODING = '#38bdf8';
const COL_MRNA = '#34d399';
const COL_POL = '#f43f5e';

function polXof(t: number): number {
  if (t < 5) return lerp(-5.4, PROM_X, smooth(t / 5));
  if (t < 7) return PROM_X;
  if (t < 18) return lerp(PROM_X, TERM_X, (t - 7) / 11);
  return TERM_X;
}

function strandPoints(polX: number, sign: 1 | -1): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 90; k++) {
    const x = X_LEFT + ((X_RIGHT - X_LEFT) * k) / 90;
    const sep = smooth(1 - Math.abs(x - polX) / 1.0);
    pts.push(new THREE.Vector3(x, 0, sign * (Z_S + 0.55 * sep)));
  }
  return pts;
}

export default function TranscriptionBacteria(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const t = animTime % DUR;
  const q = Math.floor(t * 10) / 10;
  const polX = polXof(q);
  const elongating = t >= 7 && t < 18;
  const releasing = t >= 18 && t < 21;

  const strandGeos = useMemo(() => {
    const mk = (sign: 1 | -1) =>
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandPoints(polX, sign)), 110, 0.06, 8, false);
    return { template: mk(1), coding: mk(-1) };
  }, [polX]);
  useEffect(
    () => () => {
      strandGeos.template.dispose();
      strandGeos.coding.dispose();
    },
    [strandGeos],
  );

  // duplex rungs away from the bubble
  const rungs: number[] = [];
  for (let xj = X_LEFT + 0.25; xj < X_RIGHT; xj += 0.4) {
    if (Math.abs(xj - polX) > 1.05) rungs.push(xj);
  }

  // mRNA nucleotides: 5' end anchored near promoter, 3' end trails the polymerase
  const mrnaPts: [number, number, number][] = [];
  const mrnaEnd = elongating || t >= 18 ? polX - 0.35 : PROM_X + 0.25;
  if (t >= 5.5) {
    for (let xm = PROM_X + 0.25; xm < mrnaEnd; xm += 0.32) {
      const k = (xm - PROM_X) / 7;
      mrnaPts.push([xm, 0.62 + 0.28 * Math.sin(k * Math.PI * 2), 0.62]);
    }
  }
  const releaseK = releasing ? smooth((t - 18) / 3) : 0;
  const mrnaOpacity = t >= 18 ? 1 - smooth((t - 20.5) / 3) : 1;

  const stageName =
    t < 5
      ? 'RNA polymerase binds the promoter'
      : t < 7
        ? 'Initiation — DNA unwinds into a bubble'
        : t < 18
          ? 'Elongation — mRNA grows 5′→3′ on the 3′→5′ template'
          : 'Termination — mRNA released, DNA re-zips';

  return (
    <group>
      {showLabels && (
        <Html position={[0, 2.3, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{stageName}</span>
        </Html>
      )}

      {/* ---- template strand (3'→5' left to right) ---- */}
      <ClickGroup id="template-strand" onSelect={onSelect}>
        <mesh geometry={strandGeos.template}>
          <meshStandardMaterial color={COL_TEMPLATE} roughness={0.4} metalness={0.1} {...emissiveProps(sel('template-strand'))} />
        </mesh>
        {rungs.map((xj, i) => (
          <mesh key={i} position={[xj, 0, 0]}>
            <boxGeometry args={[0.08, 0.08, Z_S * 2]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} {...emissiveProps(sel('template-strand'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[-1.2, -0.6, Z_S]} name="Template strand (3′→5′)" />}
      </ClickGroup>

      {/* ---- coding strand (5'→3' left to right) ---- */}
      <ClickGroup id="coding-strand" onSelect={onSelect}>
        <mesh geometry={strandGeos.coding}>
          <meshStandardMaterial color={COL_CODING} roughness={0.4} metalness={0.1} {...emissiveProps(sel('coding-strand'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.4, -0.6, -Z_S]} name="Coding strand (5′→3′)" />}
      </ClickGroup>

      {/* ---- promoter + terminator markers ---- */}
      <ClickGroup id="promoter" onSelect={onSelect}>
        <mesh position={[PROM_X, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.34, 0.34, 0.34]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} {...emissiveProps(sel('promoter'))} />
        </mesh>
        {showLabels && <PartLabel position={[PROM_X, 0.75, 0]} name="Promoter" />}
      </ClickGroup>
      <ClickGroup id="terminator" onSelect={onSelect}>
        <mesh position={[TERM_X, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.34, 0.34, 0.34]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} {...emissiveProps(sel('terminator'))} />
        </mesh>
        {showLabels && <PartLabel position={[TERM_X, 0.75, 0]} name="Terminator" />}
      </ClickGroup>

      {/* ---- RNA polymerase ---- */}
      <ClickGroup id="rna-polymerase" onSelect={onSelect}>
        <group position={[polX, 0.12 + Math.sin(animTime * 2.2) * 0.04, 0]}>
          <mesh>
            <sphereGeometry args={[0.42, 24, 24]} />
            <meshStandardMaterial color={COL_POL} roughness={0.35} metalness={0.15} {...emissiveProps(sel('rna-polymerase'))} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.42, 0.08, 10, 24]} />
            <meshStandardMaterial color="#fb7185" roughness={0.35} metalness={0.15} {...emissiveProps(sel('rna-polymerase'))} />
          </mesh>
        </group>
        {showLabels && <PartLabel position={[polX, 1.15, 0]} name="RNA polymerase" />}
      </ClickGroup>

      {/* ---- growing mRNA ---- */}
      {mrnaPts.length > 0 && mrnaOpacity > 0.01 && (
        <ClickGroup id="mrna" onSelect={onSelect}>
          <group position={[0, releaseK * 1.6, releaseK * 0.8]}>
            <Line
              points={mrnaPts}
              color={COL_MRNA}
              lineWidth={3}
              transparent
              opacity={mrnaOpacity}
            />
            {mrnaPts.map((p, i) => (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.11, 12, 12]} />
                <meshStandardMaterial
                  color={COL_MRNA}
                  roughness={0.4}
                  transparent
                  opacity={mrnaOpacity}
                  {...emissiveProps(sel('mrna'))}
                />
              </mesh>
            ))}
          </group>
          {showLabels && !releasing && (
            <PartLabel position={[mrnaPts[0][0] - 0.7, 1.25, 0.62]} name="mRNA (5′→3′)" />
          )}
        </ClickGroup>
      )}
    </group>
  );
}
