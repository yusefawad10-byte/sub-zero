import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { SAUNA } from '../layout';
import { useSet } from '../textures';
import { rng } from '../canvasTextures';

const F = 0.6; // truck floor

function Bench({ z0, z1, y }) {
  const n = 4;
  const d = (z1 - z0) / n;
  const w = SAUNA.x1 - 0.1 - SAUNA.x0;
  const cx = (SAUNA.x0 + SAUNA.x1 - 0.1) / 2;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[cx, F + y, z0 + d * (i + 0.5)]}>
          <boxGeometry args={[w, 0.04, d - 0.018]} />
          <meshStandardMaterial color="#d79b63" roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[cx, F + y / 2, z1 - 0.02]}>
        <boxGeometry args={[w, y - 0.02, 0.03]} />
        <meshStandardMaterial color="#b67a45" roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function Sauna() {
  const cedar = useSet('wood_planks', 1, 1.6);
  const light = useRef();
  const ember = useRef();
  const stones = useMemo(() => {
    const r = rng(9);
    return Array.from({ length: 16 }, () => [
      (r() - 0.5) * 0.28,
      0.62 + r() * 0.1,
      (r() - 0.5) * 0.28,
      0.04 + r() * 0.03,
    ]);
  }, []);
  const glass = useMemo(
    () =>
      Q.transmission
        ? new THREE.MeshPhysicalMaterial({ color: '#f1d9b8', roughness: 0.05, transmission: 0.9, thickness: 0.01, ior: 1.5 })
        : new THREE.MeshStandardMaterial({ color: '#cfa77a', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.25, depthWrite: false }),
    []
  );

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const f = 0.85 + 0.1 * Math.sin(t * 7.3) + 0.06 * Math.sin(t * 13.1 + 1) + 0.04 * Math.sin(t * 23.7);
    if (light.current) light.current.intensity = 4.2 * f;
    if (ember.current) ember.current.emissiveIntensity = 2.4 * f;
  });

  const H = SAUNA.top - F;
  const wall = <meshStandardMaterial {...cedar} color="#d8995f" roughness={0.85} />;
  const leftW = SAUNA.door[0] - SAUNA.x0;
  const rightW = SAUNA.x1 - SAUNA.door[1];

  return (
    <group>
      {/* front wall with the door gap */}
      <mesh position={[SAUNA.x0 + leftW / 2, F + H / 2, SAUNA.z1]}>
        <boxGeometry args={[leftW, H, 0.1]} />
        {wall}
      </mesh>
      <mesh position={[SAUNA.door[1] + rightW / 2, F + H / 2, SAUNA.z1]}>
        <boxGeometry args={[rightW, H, 0.1]} />
        {wall}
      </mesh>
      <mesh position={[(SAUNA.door[0] + SAUNA.door[1]) / 2, SAUNA.top - 0.16, SAUNA.z1]}>
        <boxGeometry args={[SAUNA.door[1] - SAUNA.door[0], 0.32, 0.1]} />
        {wall}
      </mesh>
      {/* side wall */}
      <mesh position={[SAUNA.x1 - 0.05, F + H / 2, (SAUNA.z0 + SAUNA.z1) / 2]}>
        <boxGeometry args={[0.1, H, SAUNA.z1 - SAUNA.z0 + 0.1]} />
        {wall}
      </mesh>
      {/* roof */}
      <mesh position={[(SAUNA.x0 + SAUNA.x1) / 2, SAUNA.top + 0.03, (SAUNA.z0 + SAUNA.z1) / 2]}>
        <boxGeometry args={[SAUNA.x1 - SAUNA.x0, 0.06, SAUNA.z1 - SAUNA.z0 + 0.1]} />
        {wall}
      </mesh>
      {/* sign over door */}
      <mesh position={[(SAUNA.door[0] + SAUNA.door[1]) / 2, SAUNA.top - 0.16, SAUNA.z1 + 0.052]}>
        <planeGeometry args={[0.5, 0.12]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.6} />
      </mesh>

      {/* two-tier benches */}
      <Bench z0={-0.9} z1={-0.5} y={0.45} />
      <Bench z0={-1.28} z1={-0.9} y={0.9} />

      {/* stone heater */}
      <group position={[-1.84, F, -0.29]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.36, 0.6, 0.36]} />
          <meshStandardMaterial color="#232526" metalness={0.7} roughness={0.45} />
        </mesh>
        <mesh ref={ember} position={[0, 0.2, 0.182]}>
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

      {/* bucket and ladle */}
      <group position={[-2.05, F + 0.47, -0.68]}>
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

      {/* towel on the top bench */}
      <mesh position={[-3.05, F + 0.93, -1.08]}>
        <boxGeometry args={[0.55, 0.03, 0.36]} />
        <meshStandardMaterial color="#efe8dc" roughness={1} />
      </mesh>
      <mesh position={[-3.05, F + 0.75, -0.89]}>
        <boxGeometry args={[0.55, 0.34, 0.03]} />
        <meshStandardMaterial color="#efe8dc" roughness={1} />
      </mesh>

      {/* glass door swung open */}
      <group position={[SAUNA.door[1], F, SAUNA.z1 + 0.05]} rotation={[0, 1.75, 0]}>
        <mesh material={glass} position={[-0.37, 0.99, 0]}>
          <boxGeometry args={[0.72, 1.94, 0.02]} />
        </mesh>
        <mesh position={[-0.66, 1.0, 0.03]}>
          <cylinderGeometry args={[0.014, 0.014, 0.4, 8]} />
          <meshStandardMaterial color="#b68650" roughness={0.5} />
        </mesh>
        {[0.25, 1.75].map((y) => (
          <mesh key={y} position={[-0.02, y, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.04]} />
            <meshStandardMaterial color="#999" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* warm light inside */}
      <mesh position={[-3.55, F + 1.95, -0.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.5, 0.1]} />
        <meshStandardMaterial color="#fff" emissive="#ffae5c" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[-2.6, F + 1.9, -0.35]} color="#ff9348" intensity={4} distance={3.6} decay={1.5} />
    </group>
  );
}
