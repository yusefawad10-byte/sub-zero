import { useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { AWNING, AWNING_EDGE, DECK } from '../layout';
import { useSet } from '../textures';
import { Rod } from './bits';

export default function Awning() {
  const cedar = useSet('wood_planks', 3, 1.2);
  const { width: W, depth: D } = AWNING;
  const warm = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#fff',
        emissive: '#ffc98a',
        emissiveIntensity: 4,
        toneMapped: false,
      }),
    []
  );

  // where to put real lights under the awning (world space)
  const lightY = AWNING.hingeY - 0.15 + 0.25;
  const lights = Q.fullLights ? [-2.4, 0, 2.4] : [-1.4, 1.6];

  return (
    <group>
      <group position={[0, AWNING.hingeY, AWNING.hingeZ]} rotation={[-AWNING.tilt, 0, 0]}>
        {/* painted outer skin */}
        <mesh position={[0, 0.04, D / 2]}>
          <boxGeometry args={[W, 0.08, D]} />
          <meshPhysicalMaterial color="#0e1011" roughness={0.6} clearcoat={0.5} clearcoatRoughness={0.3} />
        </mesh>
        {/* cedar underside */}
        <mesh position={[0, -0.002, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.08, D - 0.06]} />
          <meshStandardMaterial {...cedar} color="#d49a68" roughness={0.85} />
        </mesh>
        {/* warm LED strip around the edge */}
        <mesh material={warm} position={[0, -0.02, D - 0.06]}>
          <boxGeometry args={[W - 0.2, 0.02, 0.03]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={warm} position={[s * (W / 2 - 0.08), -0.02, D / 2]}>
            <boxGeometry args={[0.03, 0.02, D - 0.2]} />
          </mesh>
        ))}
        {/* downlights */}
        {[-2.4, -0.8, 0.8, 2.4].map((x) =>
          [0.9, 1.9].map((z) => (
            <mesh key={`${x}${z}`} material={warm} position={[x, -0.006, z]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.055, 16]} />
            </mesh>
          ))
        )}
      </group>
      {/* gas struts */}
      {[-1, 1].map((s) => (
        <Rod
          key={s}
          from={[s * (W / 2 - 0.12), 1.7, 1.33]}
          to={[s * (W / 2 - 0.12), AWNING.hingeY + 1.5 * Math.sin(AWNING.tilt) - 0.05, AWNING.hingeZ + 1.5]}
          r={0.025}
          color="#8a9096"
        />
      ))}
      {/* warm light on the deck */}
      {lights.map((x) => (
        <pointLight
          key={x}
          position={[x, lightY, (DECK.z0 + AWNING_EDGE.z) / 2 + 0.2]}
          color="#ffbf80"
          intensity={Q.fullLights ? 5 : 7}
          distance={7}
          decay={1.6}
        />
      ))}
    </group>
  );
}
