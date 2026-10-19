'use client';

import { useMemo, type ReactNode } from 'react';
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

const STEEL = '#cbd5e1';
const STEEL_DARK = '#94a3b8';

function SteelMat({ color, selected, clip }: { color: string; selected: boolean; clip: THREE.Plane[] }): JSX.Element {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.32}
      metalness={0.75}
      side={THREE.DoubleSide}
      clippingPlanes={clip}
      {...emissiveProps(selected)}
    />
  );
}

export default function Fermenter(props: BioModelProps): JSX.Element {
  const { explode, showLabels, selectedId, onSelect, animTime, cutaway = false } = props;
  const sel = (id: string) => selectedId === id;

  // Cutaway: keep z <= 0.5, slicing the front of the vessel away.
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.5), []);
  const clipPlanes = useMemo(() => (cutaway ? [clipPlane] : []), [cutaway, clipPlane]);

  const impellerSpin = animTime * 1.6;
  const foamSpin = -animTime * 0.9;

  const bubbles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return { x: Math.cos(a) * 0.95, z: Math.sin(a) * 0.95, off: i * 0.55 };
      }),
    [],
  );

  return (
    <group>
      {/* ================= Vessel body + dished bottom ================= */}
      <PartGroup id="vessel" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 3.2, 48, 1, true]} />
          <SteelMat color={STEEL} selected={sel('vessel')} clip={clipPlanes} />
        </mesh>
        <mesh position={[0, -1.2, 0]} scale={[1, 0.55, 1]}>
          <sphereGeometry args={[1.6, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <SteelMat color={STEEL} selected={sel('vessel')} clip={clipPlanes} />
        </mesh>
        {showLabels && <PartLabel position={[-2.15, 0.6, 0]} name="Vessel" />}
      </PartGroup>

      {/* ================= Lid + motor ================= */}
      <PartGroup id="lid" position={explodeOffset([0, 2.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 2.09, 0]}>
          <cylinderGeometry args={[1.66, 1.66, 0.18, 48]} />
          <SteelMat color={STEEL_DARK} selected={sel('lid')} clip={clipPlanes} />
        </mesh>
        {showLabels && <PartLabel position={[2.0, 2.35, 0]} name="Lid" />}
      </PartGroup>

      <PartGroup id="motor" position={explodeOffset([0, 3.0, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[0.55, 0.5, 0.55]} />
          <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.4} {...emissiveProps(sel('motor'))} />
        </mesh>
        <mesh position={[0, 2.22, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.18, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.4} {...emissiveProps(sel('motor'))} />
        </mesh>
        {showLabels && <PartLabel position={[-0.85, 2.75, 0]} name="Drive motor" />}
      </PartGroup>

      {/* ================= Culture broth (liquid volume) ================= */}
      <PartGroup id="culture-broth" position={explodeOffset([0, 0, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[1.45, 1.42, 2.3, 40]} />
          <meshStandardMaterial
            color="#fbbf24"
            transparent
            opacity={0.42}
            roughness={0.35}
            depthWrite={false}
            side={THREE.DoubleSide}
            clippingPlanes={clipPlanes}
            {...emissiveProps(sel('culture-broth'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[0, 1.62, 0.6]} name="Culture broth" />}
      </PartGroup>

      {/* ================= Agitator: shaft + Rushton impeller ================= */}
      <PartGroup id="agitator" position={explodeOffset([0, -1.2, 0], explode)} onSelect={onSelect}>
        <group rotation={[0, impellerSpin, 0]}>
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 3.5, 16]} />
            <meshStandardMaterial color={STEEL_DARK} roughness={0.35} metalness={0.7} {...emissiveProps(sel('agitator'))} />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.07, 24]} />
            <meshStandardMaterial color={STEEL_DARK} roughness={0.35} metalness={0.7} {...emissiveProps(sel('agitator'))} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.52, -0.35, Math.sin(a) * 0.52]} rotation={[0, -a, 0]}>
                <boxGeometry args={[0.42, 0.26, 0.05]} />
                <meshStandardMaterial color={STEEL} roughness={0.35} metalness={0.7} {...emissiveProps(sel('agitator'))} />
              </mesh>
            );
          })}
        </group>
        {showLabels && <PartLabel position={[1.35, -0.75, 0]} name="Agitator (stirrer)" />}
      </PartGroup>

      {/* ================= Foam breaker ================= */}
      <PartGroup id="foam-breaker" position={explodeOffset([0, 1.6, 0], explode)} onSelect={onSelect}>
        <group rotation={[0, foamSpin, 0]}>
          <mesh position={[0, 1.52, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.06, 24]} />
            <meshStandardMaterial color={STEEL_DARK} roughness={0.4} metalness={0.6} {...emissiveProps(sel('foam-breaker'))} />
          </mesh>
          {Array.from({ length: 4 }, (_, i) => {
            const a = (i / 4) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.44, 1.62, Math.sin(a) * 0.44]} rotation={[0, -a, 0]}>
                <boxGeometry args={[0.3, 0.18, 0.04]} />
                <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.6} {...emissiveProps(sel('foam-breaker'))} />
              </mesh>
            );
          })}
        </group>
        {showLabels && <PartLabel position={[-1.35, 1.75, 0]} name="Foam breaker" />}
      </PartGroup>

      {/* ================= Sparger + rising air bubbles ================= */}
      <PartGroup id="sparger" position={explodeOffset([0, -1.9, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, -1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.07, 10, 40]} />
          <meshStandardMaterial color={STEEL_DARK} roughness={0.4} metalness={0.6} {...emissiveProps(sel('sparger'))} />
        </mesh>
        {bubbles.map((b, i) => {
          const y = -0.95 + ((animTime * 0.8 + b.off) % 2.0);
          return (
            <mesh key={i} position={[b.x, y, b.z]}>
              <sphereGeometry args={[0.05, 8, 6]} />
              <meshBasicMaterial color="#e0f2fe" transparent opacity={0.85} />
            </mesh>
          );
        })}
        {showLabels && <PartLabel position={[-1.6, -1.25, 0]} name="Sparger (sterile air in)" />}
      </PartGroup>

      {/* ================= Baffles ================= */}
      <PartGroup id="baffles" position={[0, 0, 0]} onSelect={onSelect}>
        {Array.from({ length: 4 }, (_, i) => {
          const a = Math.PI / 4 + (i * Math.PI) / 2;
          const ex = explodeOffset([Math.cos(a), 0.4, Math.sin(a)], explode);
          return (
            <group key={i} position={ex}>
              <mesh position={[Math.cos(a) * 1.34, 0.25, Math.sin(a) * 1.34]} rotation={[0, -a + Math.PI / 2, 0]}>
                <boxGeometry args={[0.42, 2.5, 0.08]} />
                <meshStandardMaterial color={STEEL_DARK} roughness={0.4} metalness={0.65} {...emissiveProps(sel('baffles'))} />
              </mesh>
            </group>
          );
        })}
        {showLabels && <PartLabel position={[1.85, 1.0, 0]} name="Baffles" />}
      </PartGroup>

      {/* ================= Cooling jacket ================= */}
      <PartGroup id="cooling-jacket" position={explodeOffset([1.6, 0.2, 0], explode)} onSelect={onSelect}>
        <mesh position={[0, 0.15, 0]} scale={1 + explode * 0.12}>
          <cylinderGeometry args={[1.88, 1.88, 2.0, 48, 1, true]} />
          <meshStandardMaterial
            color="#7dd3fc"
            transparent
            opacity={0.22}
            roughness={0.3}
            metalness={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
            clippingPlanes={clipPlanes}
            {...emissiveProps(sel('cooling-jacket'))}
          />
        </mesh>
        {showLabels && <PartLabel position={[-2.35, -0.5, 0]} name="Cooling jacket" />}
      </PartGroup>

      {/* ================= Ports: medium inlet, air inlet, harvest outlet ================= */}
      <PartGroup id="inlet-port" position={explodeOffset([1.2, 2.4, 0], explode)} onSelect={onSelect}>
        <mesh position={[0.75, 2.35, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.55, 16]} />
          <meshStandardMaterial color={STEEL_DARK} roughness={0.4} metalness={0.6} {...emissiveProps(sel('inlet-port'))} />
        </mesh>
        <mesh position={[0.75, 2.62, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 16]} />
          <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.6} {...emissiveProps(sel('inlet-port'))} />
        </mesh>
        {showLabels && <PartLabel position={[1.35, 2.85, 0]} name="Medium inlet" />}
      </PartGroup>

      <PartGroup id="air-inlet" position={explodeOffset([-1.4, 1.8, 0], explode)} onSelect={onSelect}>
        <mesh position={[-0.95, 0.55, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 3.1, 12]} />
          <meshStandardMaterial color={STEEL_DARK} roughness={0.4} metalness={0.6} {...emissiveProps(sel('air-inlet'))} />
        </mesh>
        <mesh position={[-0.95, 2.3, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.4, 12]} />
          <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.6} {...emissiveProps(sel('air-inlet'))} />
        </mesh>
        {showLabels && <PartLabel position={[-1.7, 2.5, 0]} name="Air inlet" />}
      </PartGroup>

      <PartGroup id="outlet-port" position={explodeOffset([2.0, -0.9, 0], explode)} onSelect={onSelect}>
        <mesh position={[1.75, -0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
          <meshStandardMaterial color={STEEL_DARK} roughness={0.4} metalness={0.6} {...emissiveProps(sel('outlet-port'))} />
        </mesh>
        <mesh position={[2.14, -0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
          <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.6} {...emissiveProps(sel('outlet-port'))} />
        </mesh>
        {showLabels && <PartLabel position={[2.0, -1.35, 0]} name="Harvest outlet" />}
      </PartGroup>

      {/* ================= Sensor probe ================= */}
      <PartGroup id="sensor-probe" position={explodeOffset([0.5, 2.2, 0.5], explode)} onSelect={onSelect}>
        <mesh position={[0.3, 1.15, 0.35]}>
          <cylinderGeometry args={[0.04, 0.04, 2.0, 10]} />
          <meshStandardMaterial color="#f472b6" roughness={0.4} metalness={0.3} {...emissiveProps(sel('sensor-probe'))} />
        </mesh>
        <mesh position={[0.3, 0.18, 0.35]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color="#f472b6" roughness={0.4} {...emissiveProps(sel('sensor-probe'))} />
        </mesh>
        {showLabels && <PartLabel position={[0.95, 0.35, 0.6]} name="pH / temp probe" />}
      </PartGroup>
    </group>
  );
}
