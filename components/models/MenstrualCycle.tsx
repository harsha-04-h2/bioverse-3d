'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import type { BioModelProps } from './types';

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/* 28-day cycle compressed into 40 s: day = (t/40)*28.
   menstrual 0–7.1s (days 0–5), proliferative 7.1–19.3s (days 5–13.5),
   ovulation 19.3–22.1s (days 13.5–15.5), secretory 22.1–40s (days 15.5–28). */
const DURATION = 40;
const dayOf = (t: number) => (((t % DURATION) + DURATION) % DURATION / DURATION) * 28;

function phaseOf(t: number) {
  const d = dayOf(t);
  if (d < 5) return { id: 'menstrual', name: 'Menstrual phase', desc: 'Days 1–5' };
  if (d < 13.5) return { id: 'follicular', name: 'Follicular / proliferative phase', desc: 'Days 6–13' };
  if (d < 15.5) return { id: 'ovulation', name: 'Ovulation', desc: 'Day 14' };
  return { id: 'luteal', name: 'Luteal / secretory phase', desc: 'Days 15–28' };
}

/* Hormone level curves over day 0–28 (relative units). */
const estrogen = (d: number) => {
  if (d <= 13) return 0.4 + 2.8 * smooth(d / 13);
  if (d <= 16) return 3.2 - 2.0 * smooth((d - 13) / 3);
  if (d <= 22) return 1.2 + 0.6 * smooth((d - 16) / 6);
  return 1.8 - 1.3 * smooth((d - 22) / 6);
};
const progesterone = (d: number) => {
  if (d <= 14) return 0.25;
  if (d <= 21) return 0.25 + 2.75 * smooth((d - 14) / 7);
  return 3.0 - 2.6 * smooth((d - 21) / 7);
};
const lh = (d: number) => 0.5 + 4.2 * Math.exp(-((d - 14) * (d - 14)) / (2 * 0.8 * 0.8));
const fsh = (d: number) => {
  if (d <= 5) return 1.6 - 0.9 * smooth(d / 5);
  if (d <= 13) return 0.7;
  const spike = 1.3 * Math.exp(-((d - 14) * (d - 14)) / (2 * 0.9 * 0.9));
  if (d <= 16) return 0.7 + spike;
  return 0.7 - 0.3 * smooth((d - 16) / 12);
};

/** Endometrium thickness over day 0–28. */
const endoThick = (d: number) => {
  if (d <= 5) return 0.1;
  if (d <= 14) return 0.1 + 0.3 * smooth((d - 5) / 9);
  if (d <= 25) return 0.4;
  return 0.4 - 0.3 * smooth((d - 25) / 3);
};

const CHART_X0 = 0.9;
const CHART_X1 = 3.9;
const CHART_Y0 = -1.6;
const YSCALE = 0.72;
const chartX = (d: number) => CHART_X0 + (d / 28) * (CHART_X1 - CHART_X0);
const chartY = (v: number) => CHART_Y0 + v * YSCALE;

/**
 * Menstrual cycle — animated 28-day cycle (NCERT Fig 2.9). Left: uterus section
 * whose endometrium builds up, is maintained, and sheds; an ovary grows a
 * follicle and releases the ovum at day 14. Right: FSH, LH, estrogen and
 * progesterone curves with a day marker. 40 s loop.
 */
export default function MenstrualCycle(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime } = props;
  const t = ((animTime % DURATION) + DURATION) % DURATION;
  const d = dayOf(t);
  const phase = phaseOf(t);
  const thick = endoThick(d);
  const shed = d < 5;

  const curves = useMemo(() => {
    const mk = (fn: (d: number) => number): [number, number, number][] => {
      const pts: [number, number, number][] = [];
      for (let i = 0; i <= 56; i++) {
        const dd = (i / 56) * 28;
        pts.push([chartX(dd), chartY(fn(dd)), 0]);
      }
      return pts;
    };
    return [
      { id: 'estrogen', name: 'Estrogen', color: '#f472b6', pts: mk(estrogen) },
      { id: 'progesterone', name: 'Progesterone', color: '#a78bfa', pts: mk(progesterone) },
      { id: 'lh', name: 'LH', color: '#facc15', pts: mk(lh) },
      { id: 'fsh', name: 'FSH', color: '#38bdf8', pts: mk(fsh) },
    ];
  }, []);

  const shedBits = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        x: -2.4 + rand(i * 7 + 1) * 1.6,
        y: -0.4 + rand(i * 7 + 2) * 0.5,
        r: 0.03 + rand(i * 7 + 3) * 0.04,
      })),
    []
  );

  const follicleR = d < 14 ? 0.12 + 0.22 * smooth(d / 14) : 0.12;
  const ovumK = smooth((d - 14) / 3);

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(phase.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {showLabels && (
        <Html position={[-0.6, 2.9, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>
            {phase.name} — day {Math.max(1, Math.round(d))}
          </span>
        </Html>
      )}

      {/* ---- uterus section (left) ---- */}
      <group position={[-1.6, 0, 0]}>
        {/* myometrium base */}
        <mesh position={[0, -1.15, 0]}>
          <boxGeometry args={[1.8, 0.5, 1.0]} />
          <meshStandardMaterial color="#b76e79" roughness={0.55} />
        </mesh>
        {/* endometrium — grows and sheds */}
        <mesh position={[0, -0.9 + thick / 2, 0]}>
          <boxGeometry args={[1.6, Math.max(0.05, thick), 0.85]} />
          <meshStandardMaterial
            color={shed ? '#a85868' : '#f2a7bb'}
            roughness={0.55}
            emissive={selectedId === phase.id ? '#38bdf8' : '#000000'}
            emissiveIntensity={selectedId === phase.id ? 0.3 : 0}
          />
        </mesh>
        {/* shed tissue particles during menstruation */}
        {shed &&
          shedBits.map((b, i) => (
            <mesh key={i} position={[b.x + 1.6, b.y - ((t * 0.6 + i * 0.37) % 0.9), 0.2]}>
              <sphereGeometry args={[b.r, 8, 6]} />
              <meshStandardMaterial color="#a85868" transparent opacity={0.8} roughness={0.6} />
            </mesh>
          ))}
        {showLabels && (
          <Html position={[0, -0.35 + thick, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Endometrium</span>
          </Html>
        )}
      </group>

      {/* ---- ovary with maturing follicle (top left) ---- */}
      <group position={[-2.9, 1.7, 0]}>
        <mesh scale={[0.42, 0.5, 0.38]}>
          <sphereGeometry args={[1, 28, 20]} />
          <meshStandardMaterial color="#e3a6a1" roughness={0.55} />
        </mesh>
        {d < 14 && (
          <mesh position={[0.1, 0.12, 0.3]}>
            <sphereGeometry args={[follicleR, 18, 14]} />
            <meshStandardMaterial color="#2563eb" roughness={0.45} />
          </mesh>
        )}
        {d >= 14 && d < 20 && (
          <mesh position={[0.55 + ovumK * 0.7, 0.35 + ovumK * 0.4, 0.3]}>
            <sphereGeometry args={[0.14, 16, 12]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.4} />
          </mesh>
        )}
        {showLabels && (
          <Html position={[0, 0.85, 0]} center zIndexRange={[40, 0]} className="bv-label">
            <span>Ovary</span>
          </Html>
        )}
      </group>

      {/* ---- hormone chart (right) ---- */}
      <group>
        {/* axes */}
        <Line points={[[CHART_X0, CHART_Y0, 0], [CHART_X1, CHART_Y0, 0]]} color="#64748b" lineWidth={1} />
        <Line points={[[CHART_X0, CHART_Y0, 0], [CHART_X0, CHART_Y0 + 4.6 * YSCALE, 0]]} color="#64748b" lineWidth={1} />
        {/* day 14 marker */}
        <Line
          points={[[chartX(14), CHART_Y0, 0], [chartX(14), CHART_Y0 + 4.6 * YSCALE, 0]]}
          color="#facc15"
          transparent
          opacity={0.35}
          lineWidth={1}
        />
        {curves.map((c) => (
          <group key={c.id}>
            <Line
              points={c.pts}
              color={c.color}
              lineWidth={selectedId === c.id ? 3 : 2}
              transparent
              opacity={selectedId === c.id || selectedId === null || selectedId === phase.id ? 0.95 : 0.35}
            />
            {showLabels && (
              <Html position={[CHART_X1 + 0.15, chartY(c.pts[56][1] / YSCALE), 0]} center zIndexRange={[40, 0]} className="bv-label">
                <span>{c.name}</span>
              </Html>
            )}
          </group>
        ))}
        {/* now-marker */}
        <mesh position={[chartX(d), CHART_Y0 + 2.3 * YSCALE, 0]}>
          <boxGeometry args={[0.03, 4.6 * YSCALE, 0.03]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}
