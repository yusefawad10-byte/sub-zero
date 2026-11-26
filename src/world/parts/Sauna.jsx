import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { SAUNA } from '../layout';
import { useSet } from '../textures';
import { logoTexture, rng } from '../canvasTextures';

const F = 0.6; // truck floor
const FRONT = SAUNA.z1; // glass front line

function Bench({ z0, z1, y }) {
  const n = 4;
  const d = (z1 - z0) / n;
  const w = SAUNA.x1 - SAUNA.x0 - 0.12;
  const cx = (SAUNA.x0 + SAUNA.x1 - 0.12) / 2;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[cx, F + y, z0 + d * (i + 0.5)]}>
          <boxGeometry args={[w, 0.045, d - 0.018]} />
          <meshStandardMaterial color="#e0a874" roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[cx, F + y / 2, z1 - 0.02]}>
        <boxGeometry args={[w, y - 0.02, 0.03]} />
        <meshStandardMaterial color="#c48a52" roughness={0.8} />
      </mesh>
      {/* warm LED under the bench lip */}
      <mesh position={[cx, F + y - 0.04, z1 + 0.002]}>
        <boxGeometry args={[w, 0.012, 0.01]} />
        <meshStandardMaterial color="#fff" emissive="#ffab5c" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Sauna() {
  const cedar = useSet('wood_planks', 1, 1.6);
  const logo = useMemo(() => logoTexture({ ring: '#3a2414', text: '#3a2414' }), []);
  const light = useRef();
  const ember = useRef();
  const stones = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 16 }, () => [(r() - 0.5) * 0.28, 0.62 + r() * 0.1, (r() - 0.5) * 0.28, 0.04 + r() * 0.03]);
  }, []);
  const glass = useMemo(
    () =>
      Q.transmission
        ? new THREE.MeshPhysicalMaterial({ color: '#f6e4cc', roughness: 0.04, transmission: 0.92, thickness: 0.01, ior: 1.5 })
        : new THREE.MeshStandardMaterial({ color: '#d9b388', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.22, depthWrite: false }),
    []
  );
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: '#111', metalness: 0.7, roughness: 0.35 }), []);
  const led = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffa24d', emissiveIntensity: 4, toneMapped: false }),
    []
  );

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const f = 0.88 + 0.08 * Math.sin(t * 7.3) + 0.05 * Math.sin(t * 13.1 + 1) + 0.03 * Math.sin(t * 23.7);
    if (light.current) light.current.intensity = 5 * f;
    if (ember.current) ember.current.emissiveIntensity = 2.4 * f;
  });

  const H = SAUNA.top - F;
  const wall = <meshStandardMaterial {...cedar} color="#e6a86c" roughness={0.85} />;
  const leftW = SAUNA.door[0] - SAUNA.x0;
  const rightW = SAUNA.x1 - SAUNA.door[1];
  const doorW = SAUNA.door[1] - SAUNA.door[0];
  const cx = (SAUNA.x0 + SAUNA.x1) / 2;

  return (
    <group>
      {/* cedar lining: back, left, right walls and ceiling */}
      <mesh position={[cx, F + H / 2, SAUNA.z0 + 0.01]}>
        <planeGeometry args={[SAUNA.x1 - SAUNA.x0, H]} />
        {wall}
      </mesh>
      <mesh position={[SAUNA.x0 + 0.01, F + H / 2, (SAUNA.z0 + FRONT) / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[FRONT - SAUNA.z0, H]} />
        {wall}
      </mesh>
      <mesh position={[SAUNA.x1, F + H / 2, (SAUNA.z0 + FRONT) / 2]}>
        <boxGeometry args={[0.1, H, FRONT - SAUNA.z0]} />
        {wall}
      </mesh>
      <mesh position={[cx, SAUNA.top + 0.03, (SAUNA.z0 + FRONT) / 2]}>
        <boxGeometry args={[SAUNA.x1 - SAUNA.x0 + 0.1, 0.06, FRONT - SAUNA.z0]} />
        {wall}
      </mesh>
      {/* SZ logo burnt into the back wall */}
      <mesh position={[cx - 0.35, F + 1.95, SAUNA.z0 + 0.02]}>
        <planeGeometry args={[0.42, 0.42]} />
        <meshStandardMaterial map={logo} transparent roughness={0.8} />
      </mesh>

      {/* glass front: fixed panes either side of the door, black frame */}
      <mesh material={glass} position={[SAUNA.x0 + leftW / 2, F + H / 2, FRONT + 0.03]}>
        <boxGeometry args={[leftW, H, 0.02]} />
      </mesh>
      <mesh material={glass} position={[SAUNA.door[1] + rightW / 2, F + H / 2, FRONT + 0.03]}>
        <boxGeometry args={[rightW, H, 0.02]} />
      </mesh>
      <mesh material={glass} position={[cx, SAUNA.top - 0.18, FRONT + 0.03]}>
        <boxGeometry args={[doorW, 0.36, 0.02]} />
      </mesh>
      {[SAUNA.x0, SAUNA.door[0], SAUNA.door[1], SAUNA.x1].map((x) => (
        <mesh key={x} material={frame} position={[x, F + H / 2, FRONT + 0.03]}>
          <boxGeometry args={[0.05, H, 0.06]} />
        </mesh>
      ))}
      <mesh material={frame} position={[cx, SAUNA.top, FRONT + 0.03]}>
        <boxGeometry args={[SAUNA.x1 - SAUNA.x0 + 0.05, 0.06, 0.06]} />
      </mesh>
      <mesh material={frame} position={[(SAUNA.door[0] + SAUNA.door[1]) / 2, SAUNA.top - 0.36, FRONT + 0.03]}>
        <boxGeometry args={[doorW, 0.04, 0.06]} />
      </mesh>
      {/* warm LED strips framing the doorway */}
      {[SAUNA.door[0] + 0.03, SAUNA.door[1] - 0.03].map((x) => (
        <mesh key={x} material={led} position={[x, F + (H - 0.36) / 2, FRONT - 0.01]}>
          <boxGeometry args={[0.015, H - 0.4, 0.015]} />
        </mesh>
      ))}
      <mesh material={led} position={[(SAUNA.door[0] + SAUNA.door[1]) / 2, SAUNA.top - 0.39, FRONT - 0.01]}>
        <boxGeometry args={[doorW - 0.05, 0.015, 0.015]} />
      </mesh>

      {/* two-tier benches along the back wall */}
      <Bench z0={-0.9} z1={-0.5} y={0.45} />
      <Bench z0={-1.28} z1={-0.9} y={0.9} />

      {/* stone heater, front right */}
      <group position={[0.12, F, 0.75]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.36, 0.6, 0.36]} />
          <meshStandardMaterial color="#232526" metalness={0.7} roughness={0.45} />
        </mesh>
        <mesh ref={ember} position={[-0.182, 0.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.22, 0.12]} />
          <meshStandardMaterial color="#300" emissive="#ff5a1f" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        {stones.map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <dodecahedronGeometry args={[r, 0]} />
            <meshStandardMaterial color={i % 3 ? '#5b5d5f' : '#3d3f41'} roughness={0.95} />
          </mesh>
        ))}
      </group>

      {/* bucket and ladle on the lower bench */}
      <group position={[0.0, F + 0.47, -0.7]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.11, 0.09, 0.2, 18]} />
          <meshStandardMaterial color="#b9773f" roughness={0.7} />
        </mesh>
        {[0.04, 0.16].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <torusGeometry args={[0.104, 0.008, 6, 20]} />
            <meshStandardMaterial color="#555" metalness={0.8} roughness={0.4} />
          </mesh>
        ))}
        <group position={[0.02, 0.2, 0]} rotation={[0, 0, -0.5]}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.42, 6]} />
            <meshStandardMaterial color="#c88a52" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.045, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color="#c88a52" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* towels folded on the top bench */}
      {[-1.25, -0.75].map((x) => (
        <group key={x}>
          <mesh position={[x, F + 0.93, -1.08]}>
            <boxGeometry args={[0.45, 0.03, 0.34]} />
            <meshStandardMaterial color="#efe8dc" roughness={1} />
          </mesh>
          <mesh position={[x, F + 0.76, -0.89]}>
            <boxGeometry args={[0.45, 0.32, 0.03]} />
            <meshStandardMaterial color="#efe8dc" roughness={1} />
          </mesh>
        </group>
      ))}

      {/* glass door swung open onto the deck */}
      <group position={[SAUNA.door[1], F, FRONT + 0.05]} rotation={[0, 1.72, 0]}>
        <mesh material={glass} position={[-doorW / 2, (H - 0.4) / 2, 0]}>
          <boxGeometry args={[doorW - 0.02, H - 0.42, 0.02]} />
        </mesh>
        <mesh material={frame} position={[-doorW + 0.08, (H - 0.4) / 2, 0.03]}>
          <boxGeometry args={[0.025, 0.55, 0.025]} />
        </mesh>
      </group>

      {/* warm light inside */}
      <pointLight ref={light} position={[cx, F + 2.0, -0.1]} color="#ff9a4a" intensity={5} distance={4} decay={1.5} />
    </group>
  );
}
