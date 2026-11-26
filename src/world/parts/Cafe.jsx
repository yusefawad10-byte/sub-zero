import { useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { C } from '../canvasTextures';
import { CAFE, CAFE_STEPS } from '../layout';
import { useSet } from '../textures';

// The café platform slides out from beneath the back of the truck on steel rails,
// stands on screw jacks, and has its own back wall and canopy.
export default function Cafe() {
  const wood = useSet('dark_wooden_planks', 2.4, 2.2);
  const W = CAFE.x1 - CAFE.x0;
  const D = CAFE.z1 - CAFE.z0;
  const cx = (CAFE.x0 + CAFE.x1) / 2;
  const cz = (CAFE.z0 + CAFE.z1) / 2;
  const sw = CAFE_STEPS.x1 - CAFE_STEPS.x0;
  const sx = (CAFE_STEPS.x0 + CAFE_STEPS.x1) / 2;

  const m = useMemo(
    () => ({
      steel: new THREE.MeshStandardMaterial({ color: '#3a3d40', metalness: 0.85, roughness: 0.35 }),
      black: new THREE.MeshStandardMaterial({ color: '#0e0f10', roughness: 0.55, metalness: 0.2 }),
      led: new THREE.MeshStandardMaterial({ color: '#ffb45c', emissive: '#ffb45c', emissiveIntensity: 0.9, toneMapped: false }),
      edge: new THREE.MeshStandardMaterial({ color: '#121315', metalness: 0.85, roughness: 0.3 }),
      warm: new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffb45c', emissiveIntensity: 9, toneMapped: false }),
    }),
    []
  );

  return (
    <group>
      {/* steel slide-out rails running back under the truck floor */}
      {[-0.95, 0.15, 1.25, 2.3].map((z) => (
        <mesh key={z} material={m.steel} position={[(1.2 + CAFE.x1) / 2, 0.38, z]}>
          <boxGeometry args={[CAFE.x1 - 1.2, 0.12, 0.1]} />
        </mesh>
      ))}
      {/* screw-jack legs */}
      {[CAFE.x0 + 1.5, CAFE.x1 - 0.15].map((x) =>
        [CAFE.z0 + 0.15, CAFE.z1 - 0.15].map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <mesh material={m.steel} position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.4, 10]} />
            </mesh>
            <mesh material={m.steel} position={[0, 0.015, 0]}>
              <boxGeometry args={[0.2, 0.03, 0.2]} />
            </mesh>
          </group>
        ))
      )}

      {/* platform */}
      <mesh material={m.black} position={[cx, 0.525, cz]}>
        <boxGeometry args={[W, 0.15, D]} />
      </mesh>
      <mesh position={[cx, 0.602, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial {...wood} color="#3a302a" roughness={0.5} envMapIntensity={0.8} />
      </mesh>
      {/* blue LED along the outside edges */}
      <mesh material={m.edge} position={[cx, 0.56, CAFE.z1 + 0.015]}>
        <boxGeometry args={[W, 0.1, 0.03]} />
      </mesh>
      <mesh material={m.edge} position={[CAFE.x1 + 0.015, 0.56, cz]}>
        <boxGeometry args={[0.03, 0.1, D + 0.03]} />
      </mesh>

      {/* steps down to the car park */}
      {CAFE_STEPS.rows.map(([z0, z1, y]) => (
        <group key={y}>
          <mesh material={m.black} position={[sx, y / 2, (z0 + z1) / 2]}>
            <boxGeometry args={[sw, y, z1 - z0]} />
          </mesh>
          <mesh position={[sx, y + 0.002, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[sw, z1 - z0]} />
            <meshStandardMaterial {...wood} color="#3a302a" roughness={0.5} />
          </mesh>
          <mesh material={m.led} position={[sx, y - 0.015, z1 + 0.004]}>
            <boxGeometry args={[sw, 0.022, 0.01]} />
          </mesh>
        </group>
      ))}

      {/* back wall behind the bar */}
      <mesh material={m.black} position={[(3.7 + CAFE.x1) / 2, (CAFE.y + CAFE.roof) / 2, -1.35]}>
        <boxGeometry args={[CAFE.x1 - 3.7, CAFE.roof - CAFE.y, 0.1]} />
      </mesh>

      {/* canopy: black top, glossy dark metal underside, metal frame, recessed warm spots */}
      <group position={[(3.7 + CAFE.x1 + 0.1) / 2, CAFE.roof, cz + 0.05]}>
        <mesh material={m.black} position={[0, 0.06, 0]}>
          <boxGeometry args={[CAFE.x1 + 0.1 - 3.7, 0.12, D + 0.3]} />
        </mesh>
        <mesh position={[0, -0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CAFE.x1 + 0.02 - 3.7, D + 0.22]} />
          <meshPhysicalMaterial color="#191b1e" roughness={0.22} metalness={0.75} clearcoat={0.6} clearcoatRoughness={0.1} />
        </mesh>
        <mesh material={m.edge} position={[0, 0.02, (D + 0.3) / 2 - 0.03]}>
          <boxGeometry args={[CAFE.x1 + 0.1 - 3.7, 0.16, 0.06]} />
        </mesh>
        {[-1.2, 0, 1.2].map((x) =>
          [-0.9, 0.5, 1.6].map((z) => (
            <mesh key={`${x}${z}`} material={m.warm} position={[x, -0.006, z]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.04, 18]} />
            </mesh>
          ))
        )}
      </group>
      {/* one slim post at the outer corner; the canopy hangs off the truck and the back wall */}
      <mesh material={m.black} position={[CAFE.x1 - 0.08, (CAFE.y + CAFE.roof) / 2, CAFE.z1 - 0.08]}>
        <boxGeometry args={[0.08, CAFE.roof - CAFE.y, 0.08]} />
      </mesh>

      {/* light for the café */}
      <pointLight position={[cx, CAFE.roof - 0.3, 0.9]} color="#ffcf9a" intensity={Q.fullLights ? 5 : 7} distance={6} decay={1.5} />
    </group>
  );
}
