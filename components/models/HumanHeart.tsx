'use client';

import * as THREE from 'three';
import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Html } from '@react-three/drei';

export interface BioModelProps {
  explode: number;            // ignore for this model (cutaway is used instead)
  showLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  animTime: number;           // seconds; subtle heartbeat scale derived deterministically from this
  cutaway?: boolean;          // when true, clip the front of the heart to reveal interiors
}

// ---------------------------------------------------------------------------
// Internal plumbing: selection + clipping state shared by a part's materials.
// ---------------------------------------------------------------------------

interface PartContextValue {
  selected: boolean;
  clipPlanes: THREE.Plane[];
}

const PartContext = createContext<PartContextValue>({ selected: false, clipPlanes: [] });

function HeartMaterial({
  color,
  roughness = 0.45,
  metalness = 0.05,
}: {
  color: string;
  roughness?: number;
  metalness?: number;
}) {
  const { selected, clipPlanes } = useContext(PartContext);
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      clippingPlanes={clipPlanes}
      emissive={selected ? '#38bdf8' : '#000000'}
      emissiveIntensity={selected ? 0.4 : 0}
    />
  );
}

interface PartProps {
  id: string;
  name: string;
  labelPos: [number, number, number];
  showLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  clipPlanes: THREE.Plane[];
  children: ReactNode;
}

function Part({ id, name, labelPos, showLabels, selectedId, onSelect, clipPlanes, children }: PartProps) {
  const selected = selectedId === id;
  return (
    <PartContext.Provider value={{ selected, clipPlanes }}>
      <group
        onClick={(e) => { e.stopPropagation(); onSelect(id); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        {children}
        {showLabels && (
          <Html position={labelPos} center zIndexRange={[40, 0]} className="bv-label">
            <span>{name}</span>
          </Html>
        )}
      </group>
    </PartContext.Provider>
  );
}

// Non-clickable decoration mesh (septum, venae cavae) — still obeys cutaway.
function DecorMesh({
  color,
  clipPlanes,
  position,
  children,
}: {
  color: string;
  clipPlanes: THREE.Plane[];
  position: [number, number, number];
  children: ReactNode;
}) {
  return (
    <mesh position={position}>
      {children}
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} clippingPlanes={clipPlanes} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// HumanHeart
// ---------------------------------------------------------------------------

export default function HumanHeart(props: BioModelProps): JSX.Element {
  const { showLabels, selectedId, onSelect, animTime, cutaway = false } = props;

  // ONE clipping plane: keeps z <= 0.25, cutting the front of the heart away.
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.25), []);
  const clipPlanes = useMemo(() => (cutaway ? [clipPlane] : []), [cutaway, clipPlane]);

  // Subtle deterministic heartbeat.
  const beat = 1 + 0.025 * Math.pow(Math.max(0, Math.sin(animTime * 4.2)), 6);

  const shared = { showLabels, selectedId, onSelect, clipPlanes };

  return (
    <group scale={[beat, beat, beat]}>
      {/* Right atrium — deoxygenated (blue) */}
      <Part id="right-atrium" name="Right atrium" labelPos={[1.45, 1.15, 0.1]} {...shared}>
        <mesh position={[0.62, 0.75, 0.1]}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <HeartMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[0.62, 0.75, 0.1]}>
          <sphereGeometry args={[0.55 * 0.68, 24, 24]} />
          <HeartMaterial color="#60a5fa" roughness={0.55} />
        </mesh>
      </Part>

      {/* Right ventricle — deoxygenated (blue) */}
      <Part id="right-ventricle" name="Right ventricle" labelPos={[1.2, -0.75, 0.2]} {...shared}>
        <group position={[0.45, -0.45, 0.15]} scale={[0.75, 0.95, 0.7]}>
          <mesh>
            <sphereGeometry args={[0.55, 32, 32]} />
            <HeartMaterial color="#2563eb" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.55 * 0.68, 24, 24]} />
            <HeartMaterial color="#60a5fa" roughness={0.55} />
          </mesh>
        </group>
      </Part>

      {/* Left atrium — oxygenated (red) */}
      <Part id="left-atrium" name="Left atrium" labelPos={[-1.45, 1.15, -0.05]} {...shared}>
        <mesh position={[-0.62, 0.75, -0.05]}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <HeartMaterial color="#ef4444" />
        </mesh>
        <mesh position={[-0.62, 0.75, -0.05]}>
          <sphereGeometry args={[0.55 * 0.68, 24, 24]} />
          <HeartMaterial color="#f87171" roughness={0.55} />
        </mesh>
      </Part>

      {/* Left ventricle — oxygenated (red), thicker/larger than right */}
      <Part id="left-ventricle" name="Left ventricle" labelPos={[-1.3, -0.8, 0]} {...shared}>
        <group position={[-0.5, -0.5, 0]} scale={[0.8, 1.05, 0.75]}>
          <mesh>
            <sphereGeometry args={[0.55, 32, 32]} />
            <HeartMaterial color="#dc2626" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.55 * 0.68, 24, 24]} />
            <HeartMaterial color="#f87171" roughness={0.55} />
          </mesh>
        </group>
      </Part>

      {/* Aorta — arch over the top + descending segment */}
      <Part id="aorta" name="Aorta" labelPos={[-0.15, 2.25, -0.1]} {...shared}>
        <mesh position={[-0.15, 1.3, -0.1]}>
          <torusGeometry args={[0.55, 0.16, 12, 32, Math.PI]} />
          <HeartMaterial color="#f87171" />
        </mesh>
        <mesh position={[-0.68, 0.95, -0.1]}>
          <cylinderGeometry args={[0.16, 0.16, 0.7, 20]} />
          <HeartMaterial color="#f87171" />
        </mesh>
      </Part>

      {/* Pulmonary artery — up from the right ventricle, tilted */}
      <Part id="pulmonary-artery" name="Pulmonary artery" labelPos={[0.85, 1.85, 0.15]} {...shared}>
        <mesh position={[0.2, 1.2, 0.15]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.14, 0.14, 0.9, 20]} />
          <HeartMaterial color="#60a5fa" />
        </mesh>
      </Part>

      {/* Pulmonary veins — pair entering the left atrium from left/back */}
      <Part id="pulmonary-veins" name="Pulmonary veins" labelPos={[-1.6, 0.7, -0.3]} {...shared}>
        <mesh position={[-1.15, 0.85, -0.25]} rotation={[0, 0, 1.3]}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
          <HeartMaterial color="#fca5a5" />
        </mesh>
        <mesh position={[-1.1, 0.5, -0.35]} rotation={[0.15, 0, 1.15]}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
          <HeartMaterial color="#fca5a5" />
        </mesh>
      </Part>

      {/* Valves — rings at the atrioventricular junctions, facing forward */}
      <Part id="valves" name="Valves" labelPos={[0, 0.5, 0.55]} {...shared}>
        <mesh position={[0.58, 0.12, 0.28]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.17, 0.05, 10, 24]} />
          <HeartMaterial color="#fef3c7" roughness={0.4} />
        </mesh>
        <mesh position={[-0.58, 0.12, 0.22]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.17, 0.05, 10, 24]} />
          <HeartMaterial color="#fef3c7" roughness={0.4} />
        </mesh>
      </Part>

      {/* Septum — non-clickable decoration between the ventricles */}
      <DecorMesh color="#7f1d1d" clipPlanes={clipPlanes} position={[-0.02, -0.15, 0]}>
        <boxGeometry args={[0.14, 1.4, 0.9]} />
      </DecorMesh>

      {/* Venae cavae — non-clickable decoration into the right atrium top */}
      <mesh position={[0.75, 1.45, 0.05]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.13, 0.13, 0.5, 16]} />
        <meshStandardMaterial color="#93c5fd" roughness={0.5} metalness={0.05} clippingPlanes={clipPlanes} />
      </mesh>
      <mesh position={[0.45, 1.42, 0.2]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.45, 16]} />
        <meshStandardMaterial color="#93c5fd" roughness={0.5} metalness={0.05} clippingPlanes={clipPlanes} />
      </mesh>
    </group>
  );
}
