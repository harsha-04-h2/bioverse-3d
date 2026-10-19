'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { BioModelProps } from './types';

/** Explode offset for a part: base + normalize(base) * explode * 1.4. */
function explodeOffset(base: [number, number, number], explode: number): [number, number, number] {
  const v = new THREE.Vector3(base[0], base[1], base[2]);
  if (explode === 0 || v.lengthSq() < 1e-8) return [0, 0, 0];
  v.normalize().multiplyScalar(explode * 1.4);
  return [v.x, v.y, v.z];
}

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
function tubeFromPoints(points: Pt[], radius: number, segs = 60): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
  return new THREE.TubeGeometry(curve, segs, radius, 10, false);
}

const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const STACKS = [-0.78, 0.78];
const DISCS = 6;
const DY = 0.24;
const Y0 = -0.6;
const R = 0.55;
/** Disc index that is the nested clickable "thylakoid" on stack 0. */
const CLICK_DISC = 2;

function discY(d: number): number {
  return Y0 + d * DY;
}

export default function ThylakoidMembrane(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime: t } = props;
  const sel = (id: string) => selectedId === id;

  // Photosynthetic shimmer wave sweeping across every disc (4 s cycle).
  const shimmer = useMemo(
    () =>
      STACKS.map((_, si) =>
        Array.from({ length: DISCS }, (_, d) => 0.14 + 0.12 * Math.sin((t * 2 * Math.PI) / 4 + si * 1.3 + d * 0.55)),
      ),
    [t],
  );

  // Protons pooling in the lumen of each stack.
  const protons = useMemo(
    () =>
      STACKS.flatMap((sx, si) =>
        Array.from({ length: 5 }, (_, i) => {
          const s = si * 31 + i * 7 + 3;
          return {
            x: sx + (rand(s) - 0.5) * 0.72,
            y: Y0 + 0.1 + rand(s + 1) * (DISCS * DY - 0.25),
            z: (rand(s + 2) - 0.5) * 0.3,
            bob: 0.035 * Math.sin(t * 3 + rand(s + 3) * 6.28),
          };
        }),
      ),
    [t],
  );

  const lamellaGeo = useMemo(
    () =>
      tubeFromPoints(
        [
          [STACKS[0] + 0.34, 0.52, 0],
          [-0.1, 0.62, 0.05],
          [STACKS[1] - 0.34, 0.52, 0],
        ],
        0.035,
      ),
    [],
  );

  const membrane = (key: number, y: number, shim: number, glowId: string, glowBoost = 0) => (
    <group key={key} position={[0, y, 0]}>
      {/* top + bottom membrane leaflets */}
      {[0.062, -0.062].map((dy, k) => (
        <mesh key={k} position={[0, dy, 0]}>
          <cylinderGeometry args={[R, R, 0.034, 40]} />
          <meshStandardMaterial
            color="#15803d"
            emissive={sel(glowId) ? '#38bdf8' : '#22c55e'}
            emissiveIntensity={sel(glowId) ? 0.4 : shim + glowBoost}
            roughness={0.42}
            metalness={0.08}
          />
        </mesh>
      ))}
      {/* curved rim closing the sac */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R, 0.036, 12, 40]} />
        <meshStandardMaterial
          color="#15803d"
          emissive={sel(glowId) ? '#38bdf8' : '#22c55e'}
          emissiveIntensity={sel(glowId) ? 0.4 : shim + glowBoost}
          roughness={0.42}
          metalness={0.08}
        />
      </mesh>
      {/* lumen interior */}
      <mesh>
        <cylinderGeometry args={[R - 0.05, R - 0.05, 0.088, 40]} />
        <meshStandardMaterial
          color="#fbbf24"
          transparent
          opacity={0.55}
          emissive={sel('lumen') ? '#38bdf8' : '#f59e0b'}
          emissiveIntensity={sel('lumen') ? 0.4 : 0.25}
          roughness={0.35}
          metalness={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* ---- Stroma background slab ---- */}
      <PartGroup id="stroma" position={explodeOffset([0, 0, -1], explode)} onSelect={onSelect}>
        <mesh position={[0, 0.1, -1.05]}>
          <boxGeometry args={[4.6, 3.1, 0.55]} />
          <meshStandardMaterial
            color="#5eead2"
            transparent
            opacity={0.13}
            roughness={0.6}
            metalness={0}
            depthWrite={false}
            {...emissiveProps(sel('stroma'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-2.0, 1.35, -1.05]} name="Stroma" />}
      </PartGroup>

      {/* ---- Grana stacks ---- */}
      {STACKS.map((sx, si) => (
        <PartGroup key={si} id="granum" position={explodeOffset([si === 0 ? -1.5 : 1.5, 0.25, 0], explode)} onSelect={onSelect}>
          <group position={[sx, 0, 0]}>
            {Array.from({ length: DISCS }, (_, d) =>
              si === 0 && d === CLICK_DISC ? (
                /* nested clickable single thylakoid */
                <PartGroup key={d} id="thylakoid" position={[0, 0, 0]} onSelect={onSelect}>
                  {membrane(d, discY(d), shimmer[si][d], 'thylakoid')}
                </PartGroup>
              ) : (
                <group key={d}>
                  {/* membrane + rim for this disc */}
                  <group position={[0, discY(d), 0]}>
                    {[0.062, -0.062].map((dy, k) => (
                      <mesh key={k} position={[0, dy, 0]}>
                        <cylinderGeometry args={[R, R, 0.034, 40]} />
                        <meshStandardMaterial
                          color="#15803d"
                          emissive={sel('granum') ? '#38bdf8' : '#22c55e'}
                          emissiveIntensity={sel('granum') ? 0.4 : shimmer[si][d]}
                          roughness={0.42}
                          metalness={0.08}
                        />
                      </mesh>
                    ))}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                      <torusGeometry args={[R, 0.036, 12, 40]} />
                      <meshStandardMaterial
                        color="#15803d"
                        emissive={sel('granum') ? '#38bdf8' : '#22c55e'}
                        emissiveIntensity={sel('granum') ? 0.4 : shimmer[si][d]}
                        roughness={0.42}
                        metalness={0.08}
                      />
                    </mesh>
                  </group>
                  {/* lumen of this disc lives in the lumen group */}
                  <PartGroup id="lumen" position={explodeOffset([si === 0 ? -0.7 : 0.7, 0, 1.4], explode)} onSelect={onSelect}>
                    <mesh position={[sx, discY(d), 0]}>
                      <cylinderGeometry args={[R - 0.05, R - 0.05, 0.088, 40]} />
                      <meshStandardMaterial
                        color="#fbbf24"
                        transparent
                        opacity={0.55}
                        emissive={sel('lumen') ? '#38bdf8' : '#f59e0b'}
                        emissiveIntensity={sel('lumen') ? 0.4 : 0.25}
                        roughness={0.35}
                        metalness={0}
                        depthWrite={false}
                      />
                    </mesh>
                  </PartGroup>
                </group>
              ),
            )}

            {/* lumen protons */}
            {si === 0 && (
              <PartGroup id="lumen" position={explodeOffset([-0.7, 0, 1.4], explode)} onSelect={onSelect}>
                {protons
                  .filter((_, i) => i < 5)
                  .map((p, i) => (
                    <mesh key={i} position={[p.x, p.y + p.bob, p.z]}>
                      <sphereGeometry args={[0.045, 10, 10]} />
                      <meshStandardMaterial
                        color="#fef9c3"
                        emissive={sel('lumen') ? '#38bdf8' : '#facc15'}
                        emissiveIntensity={sel('lumen') ? 0.4 : 0.5}
                        roughness={0.3}
                        metalness={0.1}
                      />
                    </mesh>
                  ))}
              </PartGroup>
            )}
            {si === 1 && (
              <PartGroup id="lumen" position={explodeOffset([0.7, 0, 1.4], explode)} onSelect={onSelect}>
                {protons
                  .filter((_, i) => i >= 5)
                  .map((p, i) => (
                    <mesh key={i} position={[p.x, p.y + p.bob, p.z]}>
                      <sphereGeometry args={[0.045, 10, 10]} />
                      <meshStandardMaterial
                        color="#fef9c3"
                        emissive={sel('lumen') ? '#38bdf8' : '#facc15'}
                        emissiveIntensity={sel('lumen') ? 0.4 : 0.5}
                        roughness={0.3}
                        metalness={0.1}
                      />
                    </mesh>
                  ))}
              </PartGroup>
            )}

            {/* ---- embedded complexes on stack 0 ---- */}
            {si === 0 && (
              <>
                <PartGroup id="psii" position={[0.28, discY(4), 0.12]} onSelect={onSelect}>
                  <mesh>
                    <cylinderGeometry args={[0.055, 0.055, 0.22, 14]} />
                    <meshStandardMaterial color="#0d9488" roughness={0.35} metalness={0.15} {...emissiveProps(sel('psii'))} />
                  </mesh>
                  {showLabels && <SmallLabel position={[0.28, 0.42, 0.12]} name="PSII" />}
                </PartGroup>
                <PartGroup id="psi" position={[-0.27, discY(3), -0.1]} onSelect={onSelect}>
                  <mesh>
                    <cylinderGeometry args={[0.055, 0.055, 0.22, 14]} />
                    <meshStandardMaterial color="#0284c7" roughness={0.35} metalness={0.15} {...emissiveProps(sel('psi'))} />
                  </mesh>
                  {showLabels && <SmallLabel position={[-0.27, 0.32, -0.1]} name="PSI" />}
                </PartGroup>
              </>
            )}

            {/* ---- ATP synthase lollipop on stack 1's top disc ---- */}
            {si === 1 && (
              <PartGroup id="atp-synthase" position={[0.18, 0, 0.1]} onSelect={onSelect}>
                <mesh position={[0, discY(5) + 0.14, 0]}>
                  <cylinderGeometry args={[0.035, 0.035, 0.16, 10]} />
                  <meshStandardMaterial color="#a16207" roughness={0.4} metalness={0.1} {...emissiveProps(sel('atp-synthase'))} />
                </mesh>
                <group position={[0, discY(5) + 0.3, 0]} rotation={[0, t * 2, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.1, 18, 14]} />
                    <meshStandardMaterial color="#eab308" roughness={0.35} metalness={0.1} {...emissiveProps(sel('atp-synthase'))} />
                  </mesh>
                  <mesh position={[0.07, 0, 0]}>
                    <boxGeometry args={[0.07, 0.05, 0.05]} />
                    <meshStandardMaterial color="#a16207" roughness={0.4} metalness={0.1} {...emissiveProps(sel('atp-synthase'))} />
                  </mesh>
                </group>
                {showLabels && <SmallLabel position={[0.18, discY(5) + 0.55, 0.1]} name="ATP synthase" />}
              </PartGroup>
            )}

            {showLabels && si === 0 && <PartLabel position={[-0.35, discY(5) + 0.35, 0]} name="Granum" />}
            {showLabels && si === 0 && <PartLabel position={[0.85, discY(CLICK_DISC), 0]} name="Thylakoid" />}
            {showLabels && si === 0 && <SmallLabel position={[0, discY(1) - 0.28, 0.35]} name="Lumen" />}
          </group>
        </PartGroup>
      ))}

      {/* ---- Stroma lamella bridging the two grana ---- */}
      <PartGroup id="stroma-lamella" position={explodeOffset([0, 1.3, 0], explode)} onSelect={onSelect}>
        <mesh geometry={lamellaGeo}>
          <meshStandardMaterial color="#4ade80" roughness={0.42} metalness={0.08} {...emissiveProps(sel('stroma-lamella'))} />
        </mesh>
        {showLabels && <PartLabel position={[0, 0.95, 0]} name="Stroma lamella" />}
      </PartGroup>
    </group>
  );
}
