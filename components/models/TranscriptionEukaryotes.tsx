'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
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

const DUR = 26;
const RNA_Y = 0.9;
const DNA_Y = -0.7;

interface Seg {
  kind: 'exon' | 'intron';
  l: number;
  r: number;
}
const SEGS: Seg[] = [
  { kind: 'exon', l: -3.6, r: -2.7 },
  { kind: 'intron', l: -2.7, r: -1.9 },
  { kind: 'exon', l: -1.9, r: -1.1 },
  { kind: 'intron', l: -1.1, r: -0.3 },
  { kind: 'exon', l: -0.3, r: 0.5 },
  { kind: 'intron', l: 0.5, r: 1.1 },
  { kind: 'exon', l: 1.1, r: 1.9 },
];
const EXON_COLORS = ['#34d399', '#2dd4bf', '#34d399', '#2dd4bf'];
const FINAL_X0 = -3.6; // compacted exon strip starts here after splicing

export default function TranscriptionEukaryotes(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime } = props;
  const sel = (id: string) => selectedId === id;

  const t = animTime % DUR;

  // ---- stage progress ----
  const txK = smooth(t / 6); // transcription reveal
  const capK = smooth((t - 6) / 1.2);
  const spliceK = smooth((t - 9) / 6);
  const spliceosomeK = smooth((t - 9) / 1.5);
  const exportK = smooth((t - 18) / 8);
  const exitFade = 1 - smooth((t - 24) / 2);

  const exons = SEGS.filter((s) => s.kind === 'exon');
  const introns = SEGS.filter((s) => s.kind === 'intron');

  // compacted exon centres after introns are removed
  const exonFinal = useMemo(() => {
    const centers: number[] = [];
    let cursor = FINAL_X0;
    exons.forEach((e) => {
      const w = e.r - e.l;
      centers.push(cursor + w / 2);
      cursor += w;
    });
    return centers;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const intronGeos = useMemo(
    () =>
      introns.map((s) => {
        const mid = (s.l + s.r) / 2;
        return new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(s.l, 0, 0),
            new THREE.Vector3(mid, -0.5, 0.18),
            new THREE.Vector3(s.r, 0, 0),
          ]),
          24,
          0.09,
          8,
          false,
        );
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );
  useEffect(() => () => intronGeos.forEach((g) => g.dispose()), [intronGeos]);

  const tailCount = t > 15 ? Math.min(8, Math.floor((t - 15) / 0.35)) : 0;
  const polX = lerp(-3.6, 1.9, txK);

  const stageName =
    t < 6
      ? 'Transcription — pre-mRNA copied from the gene'
      : t < 9
        ? '5′ capping — a modified guanine caps the 5′ end'
        : t < 15
          ? 'Splicing — spliceosomes cut out the introns'
          : t < 18
            ? 'Polyadenylation — a poly-A tail is added at the 3′ end'
            : 'Export — mature mRNA leaves through the nuclear pore';

  return (
    <group>
      {showLabels && (
        <Html position={[-0.5, 3.1, 0]} center zIndexRange={[40, 0]} className="bv-label">
          <span>{stageName}</span>
        </Html>
      )}

      {/* ---- nucleus shell ---- */}
      <mesh position={[-1.2, 0.1, 0]}>
        <sphereGeometry args={[3.1, 40, 28]} />
        <meshPhysicalMaterial color="#a78bfa" transparent opacity={0.08} roughness={0.2} depthWrite={false} />
      </mesh>
      {showLabels && <PartLabel position={[-3.9, 2.6, 0]} name="Nucleus" />}

      {/* ---- gene DNA ---- */}
      <ClickGroup id="gene-dna" onSelect={onSelect}>
        <mesh position={[-1.55, DNA_Y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.14, 6.4, 14]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.4} metalness={0.1} {...emissiveProps(sel('gene-dna'))} />
        </mesh>
        {showLabels && <PartLabel position={[-4.1, DNA_Y - 0.6, 0]} name="Gene (DNA)" />}
      </ClickGroup>

      {/* ---- RNA polymerase (transcription only) ---- */}
      {t < 6.5 && (
        <mesh position={[polX, DNA_Y + 0.32, 0]}>
          <sphereGeometry args={[0.26, 18, 18]} />
          <meshStandardMaterial color="#f43f5e" roughness={0.4} transparent opacity={1 - smooth((t - 6) / 0.5)} />
        </mesh>
      )}

      {/* ---- mature mRNA fallback group (clicking between parts after splicing) ---- */}
      <ClickGroup id="mature-mrna" onSelect={onSelect}>
        <group position={[exportK * 5.4, -0.55 * exportK, 0]} visible={exitFade > 0.01}>
          {/* exons */}
          <ClickGroup id="pre-mrna" onSelect={onSelect}>
            {exons.map((e, i) => {
              const w = e.r - e.l;
              const origC = (e.l + e.r) / 2;
              const x = lerp(origC, exonFinal[i], spliceK);
              const reveal = smooth((txK * SEGS.length - SEGS.indexOf(e)) / 1);
              return (
                <mesh
                  key={i}
                  position={[x, RNA_Y, 0]}
                  scale={[Math.max(0.001, reveal), 1, 1]}
                  visible={reveal > 0.01 && exitFade > 0.01}
                >
                  <boxGeometry args={[w, 0.34, 0.34]} />
                  <meshStandardMaterial
                    color={EXON_COLORS[i]}
                    roughness={0.4}
                    metalness={0.08}
                    transparent
                    opacity={exitFade}
                    {...emissiveProps(sel('pre-mrna') || sel('mature-mrna'))}
                  />
                </mesh>
              );
            })}
            {showLabels && t < 15 && <PartLabel position={[-3.4, RNA_Y + 0.75, 0]} name="Pre-mRNA" />}
            {showLabels && t >= 15 && <PartLabel position={[-2.2, RNA_Y + 0.75, 0]} name="Mature mRNA" />}
          </ClickGroup>

          {/* 5' cap */}
          {capK > 0.01 && (
            <ClickGroup id="cap" onSelect={onSelect}>
              <mesh position={[-3.85, RNA_Y, 0]} scale={Math.max(0.001, capK)} visible={exitFade > 0.01}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                  color="#ef4444"
                  roughness={0.35}
                  transparent
                  opacity={exitFade}
                  {...emissiveProps(sel('cap'))}
                />
              </mesh>
              {showLabels && capK > 0.6 && t < 18 && <PartLabel position={[-4.35, RNA_Y + 0.5, 0]} name="5′ cap" />}
            </ClickGroup>
          )}

          {/* poly-A tail */}
          <ClickGroup id="poly-a-tail" onSelect={onSelect}>
            {Array.from({ length: tailCount }).map((_, i) => {
              const tailX = 1.9 + 0.24 + i * 0.26 - spliceK * 1.4;
              return (
                <mesh key={i} position={[tailX, RNA_Y - 0.05 - i * 0.03, 0.1]} visible={exitFade > 0.01}>
                  <sphereGeometry args={[0.11, 12, 12]} />
                  <meshStandardMaterial
                    color="#fbbf24"
                    roughness={0.4}
                    transparent
                    opacity={exitFade}
                    {...emissiveProps(sel('poly-a-tail'))}
                  />
                </mesh>
              );
            })}
            {showLabels && tailCount >= 8 && t < 18 && (
              <PartLabel position={[2.9, RNA_Y + 0.6, 0]} name="Poly-A tail" />
            )}
          </ClickGroup>
        </group>
      </ClickGroup>

      {/* ---- introns: revealed, then excised ---- */}
      <ClickGroup id="intron" onSelect={onSelect}>
        {introns.map((s, i) => {
          const reveal = smooth((txK * SEGS.length - SEGS.indexOf(s)) / 1);
          const drop = spliceK;
          return (
            <mesh
              key={i}
              geometry={intronGeos[i]}
              position={[(s.l + s.r) / 2, RNA_Y - drop * 2.2, 0]}
              scale={[Math.max(0.001, reveal * (1 - drop * 0.4)), 1, 1]}
              visible={reveal > 0.01 && drop < 0.98}
            >
              <meshStandardMaterial
                color="#64748b"
                roughness={0.5}
                transparent
                opacity={1 - drop}
                {...emissiveProps(sel('intron'))}
              />
            </mesh>
          );
        })}
        {showLabels && t >= 6 && t < 12 && <PartLabel position={[-0.7, RNA_Y - 0.9, 0]} name="Introns" />}
      </ClickGroup>

      {/* ---- spliceosome hint: rings around introns ---- */}
      {spliceosomeK > 0.01 && spliceK < 0.9 && (
        <ClickGroup id="spliceosome" onSelect={onSelect}>
          {introns.map((s, i) => (
            <mesh
              key={i}
              position={[(s.l + s.r) / 2, RNA_Y - 0.15, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={Math.max(0.001, spliceosomeK)}
            >
              <torusGeometry args={[0.55, 0.07, 10, 28]} />
              <meshStandardMaterial
                color="#f472b6"
                roughness={0.4}
                transparent
                opacity={spliceosomeK * (1 - spliceK)}
                {...emissiveProps(sel('spliceosome'))}
              />
            </mesh>
          ))}
          {showLabels && <PartLabel position={[1.6, RNA_Y - 0.75, 0]} name="Spliceosome" />}
        </ClickGroup>
      )}

      {/* ---- nuclear pore ---- */}
      <ClickGroup id="nuclear-pore" onSelect={onSelect}>
        <mesh position={[3.3, 0.35, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.65, 0.16, 12, 32]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.15} {...emissiveProps(sel('nuclear-pore'))} />
        </mesh>
        {showLabels && <PartLabel position={[3.3, 1.45, 0]} name="Nuclear pore" />}
      </ClickGroup>
      {showLabels && <PartLabel position={[4.9, -1.3, 0]} name="Cytoplasm" />}
    </group>
  );
}
