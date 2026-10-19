'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

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

function SmallLabel({ position, name }: { position: [number, number, number]; name: string }): JSX.Element {
  return (
    <Html position={position} center zIndexRange={[40, 0]} className="bv-label bv-label-sm">
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
  children: React.ReactNode;
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

type Pt = [number, number, number];

function helixPoints(cx: number, r: number, turns: number, y0: number, y1: number, startAngle: number, n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const a = startAngle + t * turns * Math.PI * 2;
    pts.push([cx + r * Math.cos(a), y0 + (y1 - y0) * t, r * 0.8 * Math.sin(a)]);
  }
  return pts;
}

function tubeFromPoints(points: Pt[], radius: number, segs = 120): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.TubeGeometry(curve, segs, radius, 10, false);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Animation loop length in seconds — everything is driven from animTime. */
const LOOP = 12;

// Tubule segment point lists (continuous end to end).
const PCT_PTS: Pt[] = [[0.5, 2.05, 0], [0.78, 2.08, 0.06], ...helixPoints(1.1, 0.3, 3, 2.0, 1.5, 0.6, 44)];
const LOOP_PTS: Pt[] = [
  [1.08, 1.5, 0.02],
  [1.05, 0.7, 0],
  [1.02, -0.2, 0],
  [1.04, -1.0, 0],
  [1.0, -1.6, 0],
  [0.82, -1.92, 0],
  [0.56, -1.95, 0],
  [0.55, -1.5, 0],
  [0.55, -0.7, 0],
  [0.56, 0.1, 0],
  [0.55, 0.8, 0],
  [0.55, 1.2, 0],
];
const DCT_PTS: Pt[] = [[0.55, 1.2, 0], [0.2, 1.3, 0.05], ...helixPoints(-0.25, 0.26, 2.5, 1.5, 1.05, 2.2, 40)];
const DUCT_PTS: Pt[] = [
  [-0.25, 1.05, 0],
  [-0.25, 0.4, 0],
  [-0.25, -0.4, 0],
  [-0.25, -1.2, 0],
  [-0.25, -1.9, 0],
];

const REABS_COLORS = ['#fde047', '#4ade80', '#fb923c', '#60a5fa']; // glucose, amino acids, Na+, water
const REABS_NAMES = ['Glucose', 'Amino acids', 'Na⁺', 'H₂O'];

export default function NephronTransport(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const cycle = (animTime % LOOP) / LOOP;

  const pctGeo = useMemo(() => tubeFromPoints(PCT_PTS, 0.11), []);
  const loopGeo = useMemo(() => tubeFromPoints(LOOP_PTS, 0.09, 140), []);
  const dctGeo = useMemo(() => tubeFromPoints(DCT_PTS, 0.11), []);
  const ductGeo = useMemo(() => tubeFromPoints(DUCT_PTS, 0.14, 70), []);
  const capGeo = useMemo(() => tubeFromPoints([[2.05, 2.35, 0], [2.05, 1.75, 0], [2.05, 1.15, 0]], 0.09, 30), []);
  const secCapGeo = useMemo(() => tubeFromPoints([[0.62, 1.85, 0], [0.62, 1.35, 0], [0.62, 0.9, 0]], 0.08, 30), []);

  // One continuous curve through the whole tubule — the filtrate highway.
  const fullCurve = useMemo(() => {
    const all = [...PCT_PTS, ...LOOP_PTS, ...DCT_PTS, ...DUCT_PTS];
    return new THREE.CatmullRomCurve3(all.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  }, []);

  // Filtrate particles streaming along the tubule.
  const filtrate = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (let i = 0; i < 16; i += 1) {
      const t = (cycle + i / 16) % 1;
      const v = fullCurve.getPointAt(t);
      out.push({ pos: [v.x, v.y, v.z] });
    }
    return out;
  }, [fullCurve, cycle]);

  // Reabsorption: particles leaving the PCT wall for the peritubular capillary.
  const reabs = useMemo(() => {
    const out: { pos: [number, number, number]; color: string; s: number }[] = [];
    for (let j = 0; j < 12; j += 1) {
      const prog = (cycle + j / 12) % 1;
      const start = fullCurve.getPointAt(0.03 + (j % 6) * 0.022);
      const k = smooth(prog);
      out.push({
        pos: [lerp(start.x, start.x + 0.9, k), lerp(start.y, start.y + 0.08, k), lerp(start.z, start.z, k)],
        color: REABS_COLORS[j % 4],
        s: 1 - prog * 0.55,
      });
    }
    return out;
  }, [fullCurve, cycle]);

  // Secretion: particles entering the tubule wall at the DCT from the capillary.
  const secret = useMemo(() => {
    const out: { pos: [number, number, number]; s: number }[] = [];
    for (let j = 0; j < 8; j += 1) {
      const prog = (cycle + j / 8) % 1;
      const tub = fullCurve.getPointAt(0.6 + (j % 4) * 0.018);
      const k = smooth(prog);
      const capX = tub.x + 0.85;
      out.push({
        pos: [lerp(capX, tub.x, k), lerp(tub.y + 0.05, tub.y, k), lerp(0, tub.z, k)],
        s: 0.45 + 0.55 * k,
      });
    }
    return out;
  }, [fullCurve, cycle]);

  const segMat = (color: string, id: string) => (
    <meshStandardMaterial color={color} roughness={0.45} metalness={0.06} {...emissiveProps(sel(id))} />
  );

  // Arrow pulse helper — deterministic from animTime.
  const pulse = (i: number) => 1 + 0.22 * Math.sin(animTime * 2.6 + i * 1.7);

  return (
    <group scale={1 + explode * 0.08}>
      {/* ---- Glomerular filtrate source: tiny tuft + capsule stub ---- */}
      <PartGroup id="glomerular-filtrate" position={[0, 0, 0]} onSelect={onSelect}>
        <group position={[0.18, 2.5, 0]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} rotation={[i * 0.9, i * 1.3, 0]}>
              <torusGeometry args={[0.14, 0.045, 8, 22]} />
              <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.08} {...emissiveProps(sel('glomerular-filtrate'))} />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.3, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
            <meshStandardMaterial
              color="#fde68a"
              transparent
              opacity={0.5}
              roughness={0.45}
              side={THREE.DoubleSide}
              depthWrite={false}
              {...emissiveProps(sel('glomerular-filtrate'))}
            />
          </mesh>
        </group>
        {/* flowing filtrate particles */}
        {filtrate.map((f, i) => (
          <mesh key={i} position={f.pos}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.4} metalness={0.1} {...emissiveProps(sel('glomerular-filtrate'))} />
          </mesh>
        ))}
        {showLabels && <PartLabel position={[0.18, 3.1, 0]} name="Glomerular filtrate" />}
      </PartGroup>

      {/* ---- Tubule segments (clickable) ---- */}
      <PartGroup id="pct" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh geometry={pctGeo}>{segMat('#fb923c', 'pct')}</mesh>
        {showLabels && <PartLabel position={[1.85, 1.8, 0]} name="PCT" />}
      </PartGroup>
      <PartGroup id="loop-of-henle" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh geometry={loopGeo}>{segMat('#14b8a6', 'loop-of-henle')}</mesh>
        {showLabels && <PartLabel position={[1.6, -1.1, 0]} name="Loop of Henle" />}
      </PartGroup>
      <PartGroup id="dct" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh geometry={dctGeo}>{segMat('#a855f7', 'dct')}</mesh>
        {showLabels && <PartLabel position={[-1.05, 1.35, 0]} name="DCT" />}
      </PartGroup>
      <PartGroup id="collecting-duct" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh geometry={ductGeo}>{segMat('#3b82f6', 'collecting-duct')}</mesh>
        {showLabels && <PartLabel position={[-0.25, -2.4, 0]} name="Collecting duct" />}
      </PartGroup>

      {/* ---- Reabsorption: PCT → peritubular capillary ---- */}
      <PartGroup id="reabsorption" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh geometry={capGeo}>
          <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.08} {...emissiveProps(sel('reabsorption'))} />
        </mesh>
        {reabs.map((r, i) => (
          <mesh key={i} position={r.pos} scale={r.s}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color={r.color} roughness={0.4} metalness={0.1} {...emissiveProps(sel('reabsorption'))} />
          </mesh>
        ))}
        {/* pulsing direction arrows */}
        {[0.05, 0.1, 0.15].map((t, i) => {
          const v = fullCurve.getPointAt(t);
          const s = pulse(i);
          return (
            <mesh key={`a${i}`} position={[v.x + 0.42, v.y + 0.04, v.z]} rotation={[0, 0, -Math.PI / 2]} scale={s}>
              <coneGeometry args={[0.07, 0.22, 12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} {...emissiveProps(sel('reabsorption'))} />
            </mesh>
          );
        })}
        {showLabels && (
          <>
            <PartLabel position={[2.55, 2.5, 0]} name="Reabsorption" />
            {REABS_NAMES.map((n, i) => (
              <SmallLabel key={n} position={[2.5, 2.05 - i * 0.3, 0]} name={n} />
            ))}
          </>
        )}
      </PartGroup>

      {/* ---- Secretion: capillary → DCT ---- */}
      <PartGroup id="secretion" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh geometry={secCapGeo}>
          <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.08} {...emissiveProps(sel('secretion'))} />
        </mesh>
        {secret.map((r, i) => (
          <mesh key={i} position={r.pos} scale={r.s}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#c084fc" roughness={0.4} metalness={0.1} {...emissiveProps(sel('secretion'))} />
          </mesh>
        ))}
        {[0.62, 0.66].map((t, i) => {
          const v = fullCurve.getPointAt(t);
          const s = pulse(i + 3);
          return (
            <mesh key={`s${i}`} position={[v.x + 0.42, v.y + 0.02, v.z]} rotation={[0, 0, Math.PI / 2]} scale={s}>
              <coneGeometry args={[0.07, 0.22, 12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} {...emissiveProps(sel('secretion'))} />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[1.35, 0.75, 0]} name="Secretion" />}
      </PartGroup>
    </group>
  );
}
