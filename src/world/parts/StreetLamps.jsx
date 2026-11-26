import { useMemo } from 'react';
import { Q } from '../../quality';
import { glowTexture } from '../canvasTextures';
import { LAMPS } from '../layout';
import { Spot } from './bits';

const H = 6.6;

export default function StreetLamps() {
  const glow = useMemo(() => glowTexture(), []);
  return (
    <group>
      {LAMPS.map((l, i) => (
        <group key={i}>
          <group position={[l.x, 0, l.z]} rotation={[0, l.rot, 0]}>
            <mesh position={[0, H / 2, 0]}>
              <cylinderGeometry args={[0.07, 0.11, H, 12]} />
              <meshStandardMaterial color="#2c2f33" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[0, H - 0.05, 0.6]}>
              <boxGeometry args={[0.08, 0.08, 1.2]} />
              <meshStandardMaterial color="#2c2f33" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[0, H - 0.1, 1.25]}>
              <boxGeometry args={[0.32, 0.1, 0.6]} />
              <meshStandardMaterial color="#2c2f33" metalness={0.7} roughness={0.4} />
            </mesh>
            <mesh position={[0, H - 0.156, 1.25]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.26, 0.52]} />
              <meshStandardMaterial color="#fff" emissive="#ffe3b5" emissiveIntensity={6} toneMapped={false} />
            </mesh>
            <sprite position={[0, H - 0.3, 1.25]} scale={[2.2, 2.2, 1]}>
              <spriteMaterial map={glow} color="#ffd39a" transparent opacity={0.35} depthWrite={false} />
            </sprite>
          </group>
          {Q.fullLights && (
            <Spot
              position={[l.x + Math.sin(l.rot) * 1.25, H - 0.2, l.z + Math.cos(l.rot) * 1.25]}
              target={[l.x + Math.sin(l.rot) * 2.5, 0, l.z + Math.cos(l.rot) * 2.5]}
              color="#ffd9a6"
              intensity={40}
              distance={16}
              angle={0.85}
              penumbra={0.8}
              decay={1.5}
            />
          )}
        </group>
      ))}
    </group>
  );
}
