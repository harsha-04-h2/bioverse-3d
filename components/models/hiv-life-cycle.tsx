'use client';

import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import type { BioModelProps } from './types';

/* HIV life-cycle timeline (seconds, total 48, loops via modulo):
   0–7   attachment (gp120 → CD4)
   7–14  entry & uncoating
   14–22 reverse transcription (RNA → DNA)
   22–29 integration (provirus)
   29–37 transcription & translation
   37–48 assembly & budding
   (explode is intentionally unused — like Mitosis, this is a process animation) */

const TOTAL = 48;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
const lerp3 = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

const STAGE_NAMES = [
  'Attachment — gp120 binds CD4',
  'Entry & uncoating',
  'Reverse transcription (RNA → DNA)',
  'Integration — provirus',
  'Transcription & translation',
  'Assembly & budding',
];
const STAGE_IDS = ['attachment', 'entry', 'reverse-transcription', 'integration', 'expression', 'budding'];

function stageIndex(t: number): number {
  if (t < 7) return 0;
  if (t < 14) return 1;
  if (t < 22) return 2;
  if (t < 29) return 3;
  if (t < 37) return 4;
  return 5;
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

const MEM_R = 2.6;
const NUC_R = 1.05;
const ATTACH: [number, number, number] = [0, 0.35, 2.576]; // CD4 site on the membrane
const VIRUS_FAR: [number, number, number] = [0, 2.9, 5.6];
const VIRUS_DOCK: [number, number, number] = [0, 0.35, 3.25];
const CYTO: [number, number, number] = [0, 0.3, 1.1]; // uncoating locus
const RT_LOCUS: [number, number, number] = [0, 0.3, 0.85];
const NUC: [number, number, number] = [0, 0, 0];
const ASSEMBLY: [number, number, number] = [0, 0.4, 2.25];

/** Small complete virion: envelope + gp120 spikes. */
function Virion({ selected, envelopeOpacity = 0.95 }: { selected: boolean; envelopeOpacity?: number }): JSX.Element {
  const spikes = useMemo(() => {
    const pts: { pos: [number, number, number]; quat: THREE.Quaternion }[] = [];
    const N = 12;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      const n = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
      pts.push({ pos: [n.x * 0.42, n.y * 0.42, n.z * 0.42], quat });
    }
    return pts;
  }, []);
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.42, 24, 18]} />
        <meshStandardMaterial
          color="#f472b6"
          transparent
          opacity={envelopeOpacity}
          roughness={0.35}
          {...emissiveProps(selected)}
        />
      </mesh>
      {spikes.map((s, i) => (
        <group key={i} position={s.pos} quaternion={s.quat}>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshStandardMaterial color="#be185d" roughness={0.45} {...emissiveProps(selected)} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Growing double helix for the viral DNA. */
function DnaHelix({ grow, opacity, selected }: { grow: number; opacity: number; selected: boolean }): JSX.Element {
  const strands = useMemo(() => {
    const mk = (phase: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 40; i++) {
        const tt = i / 40;
        const th = tt * Math.PI * 6 + phase;
        pts.push(new THREE.Vector3(Math.cos(th) * 0.09, -0.5 + tt, Math.sin(th) * 0.09));
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.02, 6, false);
    };
    return [mk(0), mk(Math.PI)];
  }, []);
  return (
    <group scale={[1, Math.max(0.001, grow), 1]} position={[0, -0.5 * grow, 0]}>
      {strands.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#fbbf24" transparent opacity={opacity} roughness={0.4} {...emissiveProps(selected)} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const y = -0.5 + ((i + 0.5) / 6);
        const th = (i / 6) * Math.PI * 6;
        return (
          <mesh key={`r-${i}`} position={[0, y, 0]} rotation={[0, -th, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.18, 6]} />
            <meshStandardMaterial color="#fde68a" transparent opacity={opacity} roughness={0.4} {...emissiveProps(selected)} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Wavy single-stranded RNA genome. */
function RnaStrands({ opacity, selected }: { opacity: number; selected: boolean }): JSX.Element {
  const geos = useMemo(
    () =>
      [0, 1].map((k) => {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 40; i++) {
          const t = i / 40;
          pts.push(new THREE.Vector3(-0.35 + t * 0.7, 0.1 * Math.sin(t * Math.PI * 7 + k * 2.4), 0.1 * Math.cos(t * Math.PI * 7 + k * 2.4)));
        }
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.025, 6, false);
      }),
    [],
  );
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#f43f5e" transparent opacity={opacity} roughness={0.45} {...emissiveProps(selected)} />
        </mesh>
      ))}
    </group>
  );
}

export default function HivLifeCycle(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;
  const t = animTime % TOTAL;
  const si = stageIndex(t);

  // ---- stage 0: attachment ----
  const k0 = smooth(t / 7);
  const vpos = lerp3(VIRUS_FAR, VIRUS_DOCK, k0);
  const docked = t >= 5 && t < 7.5;

  // ---- stage 1: entry & uncoating ----
  const k1 = smooth((t - 7) / 7);
  const envOp = t < 7 ? 1 : 1 - k1;
  const envFlat = 1 - 0.65 * k1;
  const capsidPos = lerp3(VIRUS_DOCK, CYTO, k1);
  const capsidOp = t < 7 ? 0 : t < 10.5 ? k1 : 1 - smooth((t - 10.5) / 3);
  const uncoatK = smooth((t - 10.5) / 2.5);
  const pieceOp = t < 10.5 || t >= 14 ? 0 : uncoatK * (1 - smooth((t - 13) / 1));

  // ---- stage 2: reverse transcription ----
  const rnaOp = t < 14 ? 0 : 1 - smooth((t - 20.5) / 1.5);
  const rtOp = rnaOp;
  const dnaGrow = smooth((t - 16) / 5);
  const dnaOp = t < 16 ? 0 : 1;
  const dnaPosStage2: [number, number, number] = [RT_LOCUS[0], RT_LOCUS[1] + 0.5, RT_LOCUS[2]];

  // ---- stage 3: integration ----
  const k3 = smooth((t - 22) / 4);
  const dnaPos = lerp3(dnaPosStage2, NUC, k3);
  const provirusGlow = t >= 24 && t < 29 ? 0.45 + 0.35 * Math.sin(t * 6) : 0;
  const provirusOp = t < 24 ? 0 : t < 29 ? 1 : 1 - smooth((t - 29) / 2);

  // ---- stage 4: transcription & translation ----
  const mrnaDots = Array.from({ length: 5 }, (_, i) => {
    const kk = smooth((t - 29 - i * 0.9) / 4);
    const off: [number, number, number] = [(i - 2) * 0.12, ((i * 37) % 3 - 1) * 0.12, 0];
    return {
      pos: lerp3([NUC[0] + off[0], NUC[1] + 0.6, NUC[2] + 0.5], [ASSEMBLY[0] + off[0], ASSEMBLY[1], ASSEMBLY[2]], kk),
      op: t < 29 + i * 0.9 ? 0 : kk * (1 - smooth((t - 35.5) / 1.5)),
    };
  });
  const gagK = smooth((t - 31) / 4);
  const gagOp = t < 31 ? 0 : gagK * (1 - smooth((t - 36.5) / 1.5));

  // ---- stage 5: budding ----
  const virions = [0, 1, 2].map((j) => {
    const bk = smooth((t - 37 - j * 1.1) / 3.2);
    const dk = smooth((t - 42 - j * 1.1) / 4.5);
    const bud: [number, number, number] = [(j - 1) * 0.75, 0.4, 2.5];
    const away: [number, number, number] = [(j - 1) * 1.4, 1.6 + j * 0.35, 5.0];
    return { scale: Math.max(0.001, bk), pos: lerp3(bud, away, dk), op: bk };
  });

  // ---- CD4 receptors on the membrane ----
  const cd4s = useMemo(() => {
    const pts: [number, number, number][] = [];
    const N = 10;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      pts.push([Math.cos(th) * r * MEM_R, y * MEM_R, Math.sin(th) * r * MEM_R]);
    }
    return pts;
  }, []);

  return (
    <group>
      {showLabels && (
        <Html position={[0, 3.7, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{STAGE_NAMES[si]}</span>
        </Html>
      )}

      {/* ================= Helper T cell ================= */}
      <PartGroup id="tcell" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[MEM_R, 48, 32]} />
          <meshPhysicalMaterial color="#7dd3fc" transparent opacity={0.13} roughness={0.25} depthWrite={false} {...emissiveProps(sel('tcell'))} />
        </mesh>
        {showLabels && <PartLabel position={[-2.35, -2.15, 0]} name="Helper T cell" />}
      </PartGroup>

      {/* ================= Nucleus ================= */}
      <PartGroup id="nucleus" position={[0, 0, 0]} onSelect={onSelect}>
        <mesh>
          <sphereGeometry args={[NUC_R, 32, 24]} />
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.8}
            roughness={0.45}
            emissive={sel('nucleus') ? '#38bdf8' : '#e879f9'}
            emissiveIntensity={sel('nucleus') ? 0.4 : provirusGlow}
          />
        </mesh>
        {showLabels && <PartLabel position={[1.5, -0.6, 0]} name="Nucleus" />}
      </PartGroup>

      {/* ================= CD4 receptors ================= */}
      <PartGroup id="cd4" position={[0, 0, 0]} onSelect={onSelect}>
        {cd4s.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial color="#d97706" roughness={0.5} {...emissiveProps(sel('cd4'))} />
          </mesh>
        ))}
        <mesh position={ATTACH}>
          <sphereGeometry args={[0.14, 12, 10]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} emissive={sel('cd4') ? '#38bdf8' : '#fbbf24'} emissiveIntensity={sel('cd4') ? 0.4 : docked ? 0.8 : 0.25} />
        </mesh>
        {showLabels && <PartLabel position={[0.6, 1.15, 2.45]} name="CD4 receptor" />}
      </PartGroup>

      {/* ================= Incoming virus: envelope (stages 0–1) ================= */}
      {envOp > 0.01 && (
        <PartGroup id="envelope" position={[0, 0, 0]} onSelect={onSelect}>
          <group position={t < 7 ? vpos : VIRUS_DOCK} scale={[1, 1, envFlat]}>
            <Virion selected={sel('envelope')} envelopeOpacity={envOp} />
          </group>
          {showLabels && t < 12 && <PartLabel position={[vpos[0] + 1.0, vpos[1] + 0.5, vpos[2]]} name="Viral envelope (gp120)" />}
        </PartGroup>
      )}
      {docked && <Line points={[[0, 0.35, 3.05], [0, 0.35, 2.66]]} color="#fbbf24" lineWidth={2} transparent opacity={0.9} />}

      {/* ================= Capsid (stage 1) ================= */}
      {capsidOp > 0.01 && (
        <PartGroup id="capsid" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={capsidPos}>
            <icosahedronGeometry args={[0.26, 1]} />
            <meshStandardMaterial color="#fb923c" transparent opacity={capsidOp} roughness={0.4} flatShading {...emissiveProps(sel('capsid'))} />
          </mesh>
          {showLabels && <PartLabel position={[capsidPos[0] + 0.9, capsidPos[1] + 0.3, capsidPos[2]]} name="Capsid (uncoating)" />}
        </PartGroup>
      )}
      {pieceOp > 0.01 &&
        Array.from({ length: 6 }, (_, i) => {
          const th = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[CYTO[0] + Math.cos(th) * uncoatK * 0.55, CYTO[1] + Math.sin(th * 1.3) * uncoatK * 0.4, CYTO[2] + Math.sin(th) * uncoatK * 0.55]}>
              <icosahedronGeometry args={[0.11, 0]} />
              <meshStandardMaterial color="#fb923c" transparent opacity={pieceOp} roughness={0.5} flatShading />
            </mesh>
          );
        })}

      {/* ================= RNA + reverse transcriptase (stage 2) ================= */}
      {(rnaOp > 0.01 || rtOp > 0.01) && (
        <PartGroup id="rt-rna" position={[0, 0, 0]} onSelect={onSelect}>
          <group position={RT_LOCUS}>
            {rnaOp > 0.01 && <RnaStrands opacity={rnaOp} selected={sel('rt-rna')} />}
            {rtOp > 0.01 && (
              <mesh position={[0.3, -0.28, 0.1]}>
                <sphereGeometry args={[0.14, 14, 12]} />
                <meshStandardMaterial color="#34d399" transparent opacity={rtOp} roughness={0.4} {...emissiveProps(sel('rt-rna'))} />
              </mesh>
            )}
          </group>
          {showLabels && rnaOp > 0.3 && <PartLabel position={[RT_LOCUS[0] - 1.1, RT_LOCUS[1] + 0.4, RT_LOCUS[2]]} name="RNA + reverse transcriptase" />}
        </PartGroup>
      )}

      {/* ================= Viral DNA (stages 2–3) ================= */}
      {dnaOp > 0.01 && t < 29.5 && (
        <PartGroup id="viral-dna" position={[0, 0, 0]} onSelect={onSelect}>
          <group position={t < 22 ? dnaPosStage2 : dnaPos}>
            <DnaHelix grow={t < 22 ? dnaGrow : 1} opacity={dnaOp} selected={sel('viral-dna')} />
          </group>
          {showLabels && dnaGrow > 0.4 && <PartLabel position={[dnaPos[0] + 0.9, dnaPos[1] + 0.8, dnaPos[2]]} name="Viral DNA" />}
        </PartGroup>
      )}

      {/* ================= Provirus marker (stage 3) ================= */}
      {provirusOp > 0.01 && (
        <PartGroup id="provirus" position={[0, 0, 0]} onSelect={onSelect}>
          <mesh position={[0.25, 0.15, 0.1]}>
            <sphereGeometry args={[0.16, 14, 12]} />
            <meshStandardMaterial
              color="#f0abfc"
              transparent
              opacity={provirusOp}
              roughness={0.3}
              emissive={sel('provirus') ? '#38bdf8' : '#e879f9'}
              emissiveIntensity={sel('provirus') ? 0.4 : 0.7}
            />
          </mesh>
          {showLabels && <PartLabel position={[-0.9, 0.9, 0]} name="Provirus (integrated DNA)" />}
        </PartGroup>
      )}

      {/* ================= mRNA + Gag proteins (stage 4) ================= */}
      <PartGroup id="expression" position={[0, 0, 0]} onSelect={onSelect}>
        {mrnaDots.map(
          (d, i) =>
            d.op > 0.01 && (
              <mesh key={i} position={d.pos}>
                <sphereGeometry args={[0.07, 10, 8]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={d.op} />
              </mesh>
            ),
        )}
        {gagOp > 0.01 &&
          Array.from({ length: 7 }, (_, i) => {
            const th = (i / 7) * Math.PI * 2;
            const jitter = 0.03 * Math.sin(t * 9 + i * 2.1);
            return (
              <mesh key={i} position={[ASSEMBLY[0] + Math.cos(th) * (0.35 + jitter), ASSEMBLY[1] + Math.sin(th) * 0.25, ASSEMBLY[2] - 0.15]}>
                <sphereGeometry args={[0.11, 12, 10]} />
                <meshStandardMaterial color="#f59e0b" transparent opacity={gagOp} roughness={0.45} {...emissiveProps(sel('expression'))} />
              </mesh>
            );
          })}
        {showLabels && t >= 29 && t < 37 && <PartLabel position={[-1.5, 1.5, 1.8]} name="mRNA → viral proteins (Gag)" />}
      </PartGroup>

      {/* ================= Budding virions (stage 5) ================= */}
      {t >= 37 && (
        <PartGroup id="new-virion" position={[0, 0, 0]} onSelect={onSelect}>
          {virions.map(
            (v, j) =>
              v.op > 0.01 && (
                <group key={j} position={v.pos} scale={[v.scale, v.scale, v.scale]}>
                  <Virion selected={sel('new-virion')} envelopeOpacity={v.op} />
                </group>
              ),
          )}
          {showLabels && <PartLabel position={[1.6, 2.6, 3.4]} name="New virions budding" />}
        </PartGroup>
      )}
    </group>
  );
}
