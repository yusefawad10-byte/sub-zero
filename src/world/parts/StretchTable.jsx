import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { STRETCH } from '../layout';
import { FoldedTowel, RolledTowel, propTextures } from './props';
import { Rod } from './bits';

const F = 0.6;

// Professional treatment table, as in the reference: black leather top in two padded sections
// with stitched welts, a face cradle on chrome rods, wooden legs with aluminium height
// adjusters and locking knobs, cross braces and support cables, towels on the shelf below.
export default function StretchTable() {
  const { x, z, w, l, h } = STRETCH;
  const m = useMemo(() => {
    const t = propTextures();
    return {
      leather: new THREE.MeshPhysicalMaterial({
        color: '#121214',
        roughness: 0.48,
        clearcoat: 0.35,
        clearcoatRoughness: 0.4,
        normalMap: t.leather,
        normalScale: new THREE.Vector2(0.12, 0.12),
      }),
      stitch: new THREE.MeshStandardMaterial({ color: '#3a3b3e', roughness: 0.8 }),
      wood: new THREE.MeshStandardMaterial({ color: '#7a4e2c', roughness: 0.55 }),
      alu: new THREE.MeshStandardMaterial({ color: '#b8bdc2', roughness: 0.25, metalness: 0.95 }),
      knob: new THREE.MeshStandardMaterial({ color: '#0c0c0d', roughness: 0.4 }),
      board: new THREE.MeshStandardMaterial({ color: '#2a1c12', roughness: 0.6 }),
    };
  }, []);

  const top = h - 0.04;
  const halfL = w / 2 - 0.006; // two sections along x
  const legs = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) legs.push([sx * (w / 2 - 0.14), sz * (l / 2 - 0.07)]);

  return (
    <group position={[x, F, z]}>
      {/* two padded leather sections with a stitched welt round each */}
      {[-1, 1].map((s) => (
        <group key={s} position={[(s * w) / 4, 0, 0]}>
          <mesh position={[0, top - 0.07, 0]} material={m.board}>
            <boxGeometry args={[halfL - 0.01, 0.02, l - 0.02]} />
          </mesh>
          <RoundedBox args={[halfL, 0.1, l]} radius={0.045} smoothness={5} position={[0, top, 0]} material={m.leather} />
          {[
            [0, top + 0.046, l / 2 - 0.035, halfL - 0.08, 0.004, 0.004],
            [0, top + 0.046, -(l / 2 - 0.035), halfL - 0.08, 0.004, 0.004],
            [halfL / 2 - 0.035, top + 0.046, 0, 0.004, 0.004, l - 0.08],
            [-(halfL / 2 - 0.035), top + 0.046, 0, 0.004, 0.004, l - 0.08],
          ].map(([px, py, pz, sx, sy, sz], i) => (
            <mesh key={i} position={[px, py, pz]} material={m.stitch}>
              <boxGeometry args={[sx, sy, sz]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* hinge between sections */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, top - 0.05, s * (l / 2 - 0.012)]} material={m.alu}>
          <boxGeometry args={[0.06, 0.03, 0.01]} />
        </mesh>
      ))}

      {/* face cradle: horseshoe cushion on two chrome rods at the head end */}
      <group position={[-w / 2 - 0.2, top + 0.02, 0]}>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} material={m.leather}>
          <torusGeometry args={[0.1, 0.035, 14, 28, Math.PI * 1.45]} />
        </mesh>
        {[-0.09, 0.09].map((zz) => (
          <Rod key={zz} from={[0.02, -0.05, zz]} to={[0.24, -0.07, zz]} r={0.008} material={m.alu} />
        ))}
      </group>

      {/* legs: wood upper, aluminium adjuster, knob, rubber foot */}
      {legs.map(([lx, lz], i) => (
        <group key={i} position={[lx, 0, lz]}>
          <mesh position={[0, (h - 0.14) / 2 + 0.2, 0]} material={m.wood}>
            <boxGeometry args={[0.045, h - 0.34, 0.045]} />
          </mesh>
          <mesh position={[0, 0.13, 0]} material={m.alu}>
            <cylinderGeometry args={[0.016, 0.016, 0.24, 12]} />
          </mesh>
          <mesh position={[0, 0.2, 0.03 * Math.sign(lz)]} rotation={[Math.PI / 2, 0, 0]} material={m.knob}>
            <cylinderGeometry args={[0.018, 0.018, 0.03, 12]} />
          </mesh>
          <mesh position={[0, 0.012, 0]} material={m.knob}>
            <cylinderGeometry args={[0.022, 0.026, 0.024, 12]} />
          </mesh>
        </group>
      ))}
      {/* cross braces and the towel shelf */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (w / 2 - 0.14), 0.3, 0]} material={m.wood}>
          <boxGeometry args={[0.03, 0.03, l - 0.14]} />
        </mesh>
      ))}
      <mesh position={[0, 0.3, 0]} material={m.board}>
        <boxGeometry args={[w - 0.34, 0.02, l - 0.2]} />
      </mesh>
      {/* support cables from the centre to each leg */}
      {legs.map(([lx, lz], i) => (
        <Rod key={i} from={[0, top - 0.08, lz * 0.9]} to={[lx, 0.36, lz]} r={0.0025} color="#9aa0a6" />
      ))}

      {/* towels: rolled one on the top, folded stack on the shelf */}
      <RolledTowel p={[0.4, top + 0.11, 0]} len={l - 0.16} r={0.055} rot={[Math.PI / 2, 0, 0]} />
      <FoldedTowel p={[-0.25, 0.31, 0]} w={0.36} d={0.28} layers={3} />
      <FoldedTowel p={[0.2, 0.31, 0.02]} w={0.34} d={0.26} layers={2} color="#dcd6ca" />
    </group>
  );
}
