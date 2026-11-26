import { useMemo } from 'react';
import { aframeTexture } from '../canvasTextures';
import { AFRAME } from '../layout';

const H = 1.05;
const W = 0.62;
const A = 0.24; // half-angle of the A

export default function AFrame() {
  const tex = useMemo(() => aframeTexture(), []);
  return (
    <group position={[AFRAME.x, 0, AFRAME.z]} rotation={[0, AFRAME.rot, 0]}>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, H, 0]} rotation={[-s * A, s > 0 ? 0 : Math.PI, 0]}>
          <mesh position={[0, -H / 2, 0.018]}>
            <boxGeometry args={[W + 0.06, H + 0.04, 0.03]} />
            <meshStandardMaterial color="#3a2618" roughness={0.8} />
          </mesh>
          <mesh position={[0, -H / 2, 0.035]}>
            <planeGeometry args={[W, H - 0.02]} />
            <meshStandardMaterial map={tex} roughness={0.85} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.12} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
