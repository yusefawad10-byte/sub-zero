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
        emissive: '#ffb45e',
        emissiveIntensity: 3,
        toneMapped: false,
      }),
    []
  );

  const bulb = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffc070', emissiveIntensity: 7, toneMapped: false }),
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
          <meshStandardMaterial {...cedar} color="#5a3d29" roughness={0.7} />
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
        {[-3.0, -2.0, -1.0, 0, 1.0, 2.0, 3.0].map((x) =>
          [0.55, 1.35, 2.15].map((z) => (
            <mesh key={`${x}${z}`} material={bulb} position={[x, -0.04, z]}>
              <sphereGeometry args={[0.045, 12, 8]} />
            </mesh>
          ))
        )}
        {/* warm bulbs strung along the front edge */}
        {Array.from({ length: 17 }, (_, i) => (
          <mesh key={`e${i}`} material={bulb} position={[-W / 2 + 0.2 + i * ((W - 0.4) / 16), -0.09 - 0.05 * Math.sin((i / 16) * Math.PI * 4) ** 2, D - 0.02]}>
            <sphereGeometry args={[0.04, 10, 8]} />
          </mesh>
        ))}
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
          color="#ffb468"
          intensity={Q.fullLights ? 6.5 : 9}
          distance={7}
          decay={1.6}
        />
      ))}
    </group>
  );
}
