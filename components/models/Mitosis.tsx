"use client";

import { useMemo } from "react";
import { Line, Html } from "@react-three/drei";
import type { BioModelProps } from "./types";

/* Mitosis timeline (seconds, total 40):
   interphase 0–8, prophase 8–16, metaphase 16–23, anaphase 23–31, telophase 31–40 */

const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

const STAGE_NAMES = ["Interphase", "Prophase", "Metaphase", "Anaphase", "Telophase & cytokinesis"];
const STAGE_IDS = ["interphase", "prophase", "metaphase", "anaphase", "telophase"];

function stageIndex(t: number): number {
  if (t < 8) return 0;
  if (t < 16) return 1;
  if (t < 23) return 2;
  if (t < 31) return 3;
  return 4;
}

interface Chromo {
  x: number;
  y: number;
  z: number;
  sep: number; // sister-chromatid separation along y
  vis: number; // visibility 0..1
}

function chromoStates(t: number): Chromo[] {
  const out: Chromo[] = [];
  for (let i = 0; i < 4; i++) {
    const sx = (rand(i * 3 + 1) - 0.5) * 2.4;
    const sy = (rand(i * 3 + 2) - 0.5) * 2.4;
    const sz = (rand(i * 3 + 3) - 0.5) * 2.4;
    const a = (i / 4) * Math.PI * 2 + 0.5;
    const px = Math.cos(a) * 0.62;
    const pz = Math.sin(a) * 0.62;
    let x = sx;
    let y = sy;
    let z = sz;
    let sep = 0;
    let vis = 0;
    if (t >= 8 && t < 16) {
      vis = clamp01((t - 8) / 2);
    } else if (t >= 16 && t < 23) {
      const k = smooth((t - 16) / 7);
      vis = 1;
      x = lerp(sx, px, k);
      y = lerp(sy, 0, k);
      z = lerp(sz, pz, k);
    } else if (t >= 23 && t < 31) {
      const k = (t - 23) / 8;
      vis = 1;
      x = px * (1 - 0.25 * k);
      z = pz * (1 - 0.25 * k);
      y = 0;
      sep = k * 1.15;
    } else if (t >= 31) {
      vis = 1 - clamp01((t - 31) / 4);
      x = px * 0.75;
      z = pz * 0.75;
      sep = 1.15;
    }
    out.push({ x, y, z, sep, vis });
  }
  return out;
}

export default function Mitosis(props: BioModelProps) {
  const { showLabels, selectedId, onSelect, animTime: t } = props;
  const si = stageIndex(t);
  const chromos = useMemo(() => chromoStates(t), [t]);

  const singleCellOp = 1 - smooth((t - 31) / 5); // crossfade to daughters
  const nucleusOp = t < 8 ? 0.95 : 1 - clamp01((t - 8) / 4);
  const centroOp = t >= 8 && t < 31 ? clamp01((t - 8) / 2) * (1 - clamp01((t - 29) / 2)) : 0;
  const spindleOp = t >= 16 && t < 31 ? clamp01((t - 16) / 3) * (1 - clamp01((t - 29.5) / 1.5)) : 0;
  const plateOp = t >= 16 && t < 23 ? clamp01((t - 16) / 2) * (1 - clamp01((t - 21) / 2)) : 0;
  const dk = smooth((t - 31) / 9); // daughter-cell growth
  const dx = 0.35 + 0.85 * dk;

  const chromatinDots = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const th = rand(i * 7 + 1) * Math.PI * 2;
        const ph = rand(i * 7 + 2) * Math.PI;
        const r = 0.25 + rand(i * 7 + 3) * 0.4;
        return {
          x: r * Math.sin(ph) * Math.cos(th),
          y: r * Math.cos(ph),
          z: r * Math.sin(ph) * Math.sin(th),
        };
      }),
    []
  );

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(STAGE_IDS[si]);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {showLabels && (
        <Html position={[0, 2.75, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{STAGE_NAMES[si]}</span>
        </Html>
      )}

      {/* ---- single parent cell (fades during telophase) ---- */}
      <group visible={singleCellOp > 0.01}>
        <mesh>
          <sphereGeometry args={[2, 48, 32]} />
          <meshPhysicalMaterial
            color="#7dd3fc"
            transparent
            opacity={0.14 * singleCellOp}
            roughness={0.2}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.9, 32, 24]} />
          <meshStandardMaterial
            color="#1c3a5e"
            transparent
            opacity={0.4 * singleCellOp}
            roughness={0.7}
          />
        </mesh>

        {/* nucleus during interphase */}
        {nucleusOp > 0.01 && (
          <group>
            <mesh>
              <sphereGeometry args={[0.85, 32, 24]} />
              <meshStandardMaterial
                color="#8b5cf6"
                transparent
                opacity={nucleusOp}
                roughness={0.45}
                emissive={selectedId === "interphase" ? "#38bdf8" : "#000000"}
                emissiveIntensity={selectedId === "interphase" ? 0.4 : 0}
              />
            </mesh>
            {chromatinDots.map((p, i) => (
              <mesh key={i} position={[p.x, p.y, p.z]}>
                <sphereGeometry args={[0.07, 10, 10]} />
                <meshStandardMaterial
                  color="#a78bfa"
                  transparent
                  opacity={nucleusOp}
                />
              </mesh>
            ))}
          </group>
        )}

        {/* chromosomes */}
        {chromos.map(
          (c, i) =>
            c.vis > 0.01 && (
              <group key={i} position={[c.x, c.y, c.z]} rotation={[0, i * 0.7, 0]}>
                {[1, -1].map((s) => (
                  <mesh
                    key={s}
                    position={[0, s * c.sep, 0]}
                    rotation={[0, 0, s * 0.42]}
                  >
                    <capsuleGeometry args={[0.09, 0.42, 6, 12]} />
                    <meshStandardMaterial
                      color="#a78bfa"
                      transparent
                      opacity={c.vis * singleCellOp}
                      roughness={0.4}
                      emissive={
                        selectedId === STAGE_IDS[si] ? "#38bdf8" : "#000000"
                      }
                      emissiveIntensity={selectedId === STAGE_IDS[si] ? 0.35 : 0}
                    />
                  </mesh>
                ))}
              </group>
            )
        )}

        {/* centrosomes */}
        {centroOp > 0.01 &&
          [1, -1].map((s) => (
            <mesh key={s} position={[0, s * 1.75, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial
                color="#22d3ee"
                transparent
                opacity={centroOp}
                roughness={0.3}
              />
            </mesh>
          ))}

        {/* spindle fibres */}
        {spindleOp > 0.01 &&
          chromos.map((c, i) => (
            <group key={i}>
              <Line
                points={[
                  [0, 1.75, 0],
                  [c.x, c.sep, c.z],
                ]}
                color="#7dd3fc"
                transparent
                opacity={spindleOp * 0.7}
                lineWidth={1}
              />
              <Line
                points={[
                  [0, -1.75, 0],
                  [c.x, -c.sep, c.z],
                ]}
                color="#7dd3fc"
                transparent
                opacity={spindleOp * 0.7}
                lineWidth={1}
              />
            </group>
          ))}

        {/* metaphase plate hint */}
        {plateOp > 0.01 && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.95, 0.015, 8, 64]} />
            <meshBasicMaterial
              color="#475569"
              transparent
              opacity={plateOp * 0.8}
            />
          </mesh>
        )}
      </group>

      {/* ---- two daughter cells (telophase) ---- */}
      {dk > 0.01 &&
        [1, -1].map((s) => (
          <group key={s} position={[s * dx, 0, 0]}>
            <mesh>
              <sphereGeometry args={[1.02, 32, 24]} />
              <meshPhysicalMaterial
                color="#7dd3fc"
                transparent
                opacity={0.16 * dk}
                roughness={0.2}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.5, 24, 18]} />
              <meshStandardMaterial
                color="#8b5cf6"
                transparent
                opacity={0.95 * dk}
                roughness={0.45}
                emissive={selectedId === "telophase" ? "#38bdf8" : "#000000"}
                emissiveIntensity={selectedId === "telophase" ? 0.4 : 0}
              />
            </mesh>
          </group>
        ))}
    </group>
  );
}
