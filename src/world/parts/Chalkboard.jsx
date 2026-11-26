import { useMemo } from 'react';
import { chalkboardTexture } from '../canvasTextures';

export default function Chalkboard() {
  const tex = useMemo(() => chalkboardTexture(), []);
  const w = 1.5;
  const h = 1.0;
  return (
    <group position={[-0.55, 2.08, -1.27]}>
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[w + 0.1, h + 0.1, 0.03]} />
        <meshStandardMaterial color="#6b4529" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.95} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.22} />
      </mesh>
      {/* picture light */}
      <mesh position={[0, h / 2 + 0.1, 0.1]}>
        <boxGeometry args={[0.7, 0.03, 0.05]} />
        <meshStandardMaterial color="#222" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, h / 2 + 0.083, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.66, 0.03]} />
        <meshStandardMaterial color="#fff" emissive="#ffe2b8" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  );
}
