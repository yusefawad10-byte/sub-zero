import { useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { AWNING, AWNING_EDGE, DECK } from '../layout';
import { Rod } from './bits';

// Wide flat black canopy lifted out from the roof: glossy dark metal underside with
// panel seams, recessed warm spotlights, a slim metal perimeter frame, hinge brackets
// on the roof edge and gas struts underneath.
export default function Awning() {
  const { width: W, depth: D } = AWNING;
  const m = useMemo(
    () => ({
      top: new THREE.MeshPhysicalMaterial({ color: '#090a0c', roughness: 0.3, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.08 }),
      under: new THREE.MeshPhysicalMaterial({ color: '#191b1e', roughness: 0.22, metalness: 0.75, clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 1.2 }),
      frame: new THREE.MeshStandardMaterial({ color: '#121315', roughness: 0.35, metalness: 0.85 }),
      seam: new THREE.MeshStandardMaterial({ color: '#050506', roughness: 0.7 }),
      can: new THREE.MeshStandardMaterial({ color: '#0d0e10', roughness: 0.4, metalness: 0.8 }),
      spot: new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffb45c', emissiveIntensity: 9, toneMapped: false }),
    }),
    []
  );

  // recessed spotlights in a regular grid
  const spots = [];
  for (const x of [-3.0, -2.0, -1.0, 0, 1.0, 2.0, 3.0]) for (const z of [0.55, 1.4, 2.25]) spots.push([x, z]);

  const lightY = AWNING.hingeY + 0.05;
  const lights = Q.fullLights ? [-2.4, 0, 2.4] : [-1.4, 1.6];

  return (
    <group>
      <group position={[0, AWNING.hingeY, AWNING.hingeZ]} rotation={[-AWNING.tilt, 0, 0]}>
        {/* roof skin */}
        <mesh material={m.top} position={[0, 0.06, D / 2]}>
          <boxGeometry args={[W, 0.1, D]} />
        </mesh>
        {/* glossy dark metal underside */}
        <mesh material={m.under} position={[0, 0.0, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W - 0.12, D - 0.1]} />
        </mesh>
        {/* panel seams across the underside */}
        {[-2.45, -1.22, 0, 1.22, 2.45].map((x) => (
          <mesh key={x} material={m.seam} position={[x, -0.003, D / 2]}>
            <boxGeometry args={[0.012, 0.004, D - 0.12]} />
          </mesh>
        ))}
        {/* slim perimeter frame */}
        <mesh material={m.frame} position={[0, 0.02, D - 0.03]}>
          <boxGeometry args={[W + 0.04, 0.16, 0.06]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={m.frame} position={[s * (W / 2 - 0.01), 0.02, D / 2]}>
            <boxGeometry args={[0.06, 0.16, D]} />
          </mesh>
        ))}
        {/* recessed amber spotlights: dark can with a glowing lens */}
        {spots.map(([x, z]) => (
          <group key={`${x}${z}`} position={[x, -0.004, z]}>
            <mesh material={m.can} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.04, 0.07, 20]} />
            </mesh>
            <mesh material={m.spot} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
              <circleGeometry args={[0.04, 18]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* hinge brackets on the roof edge */}
      {[-3.2, -1.6, 0, 1.6, 3.2].map((x) => (
        <mesh key={x} material={m.frame} position={[x, AWNING.hingeY + 0.02, AWNING.hingeZ - 0.02]}>
          <boxGeometry args={[0.16, 0.14, 0.1]} />
        </mesh>
      ))}
      {/* gas struts from the box to the canopy */}
      {[-1, 1].map((s) => (
        <Rod
          key={s}
          from={[s * (W / 2 - 0.14), 1.7, 1.33]}
          to={[s * (W / 2 - 0.14), AWNING.hingeY - 0.02 + 1.6 * Math.sin(AWNING.tilt), AWNING.hingeZ + 1.6]}
          r={0.024}
          color="#2b2e31"
          metalness={0.9}
          roughness={0.25}
        />
      ))}
      {/* the warm light those spots throw onto the deck */}
      {lights.map((x) => (
        <pointLight
          key={x}
          position={[x, lightY, (DECK.z0 + AWNING_EDGE.z) / 2 + 0.2]}
          color="#ffb45c"
          intensity={Q.fullLights ? 6.5 : 9}
          distance={7}
          decay={1.6}
        />
      ))}
    </group>
  );
}
