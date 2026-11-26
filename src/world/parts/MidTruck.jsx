import { useMemo } from 'react';
import * as THREE from 'three';
import { C, rng } from '../canvasTextures';
import { BOX, PLANTS, WELLNESS } from '../layout';
import { useSet } from '../textures';
import { Leafy } from './Bar';

// Potted plant: dark pot with realistic leaf-card foliage.
function Plant({ x, y, z, s }) {
  return <Leafy p={[x, y, z]} s={3.6 * s} seed={Math.round(x * 10 + z * 7)} />;
}

export default function MidTruck() {
  return (
    <group>
      {PLANTS.map((p, i) => (
        <Plant key={i} {...p} />
      ))}
      <WellnessShelves />

      {/* ceiling speakers over the bar side */}
      {[1.2, 2.6].map((x) => (
        <group key={x} position={[x, BOX.ceil - 0.02, 0.9]}>
          <mesh>
            <cylinderGeometry args={[0.13, 0.13, 0.03, 24]} />
            <meshStandardMaterial color="#1b1b1b" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.017, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.11, 24]} />
            <meshStandardMaterial color="#2c2c2c" roughness={0.9} metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* air conditioner high on the back wall above the fridge */}
      <group position={[3.0, 3.18, -1.05]}>
        <mesh>
          <boxGeometry args={[0.8, 0.26, 0.2]} />
          <meshStandardMaterial color="#e9e9e5" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.11, 0.08]} rotation={[-0.6, 0, 0]}>
          <boxGeometry args={[0.72, 0.05, 0.01]} />
          <meshStandardMaterial color="#d0d0cc" roughness={0.5} />
        </mesh>
        <mesh position={[0.32, 0.06, 0.101]}>
          <circleGeometry args={[0.012, 10]} />
          <meshStandardMaterial color="#fff" emissive={C.ice} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// Illuminated wellness shelving on the back wall inside the truck: black frame, walnut
// boards, warm LED under each shelf, towels, wellness products, cups and greenery.
export function WellnessShelves() {
  const walnut = useSet('dark_wooden_planks', 1.4, 0.2);
  const { x0, x1, z0, z1 } = WELLNESS;
  const w = x1 - x0;
  const cx = (x0 + x1) / 2;
  const d = z1 - z0;
  const cz = (z0 + z1) / 2;
  const levels = [1.3, 1.75, 2.2, 2.65];
  const m = useMemo(
    () => ({
      frame: new THREE.MeshStandardMaterial({ color: '#090a0c', roughness: 0.35, metalness: 0.6 }),
      led: new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffb45c', emissiveIntensity: 3.5, toneMapped: false }),
      towel: new THREE.MeshStandardMaterial({ color: '#efeae0', roughness: 1 }),
      towelGrey: new THREE.MeshStandardMaterial({ color: '#cfcac0', roughness: 1 }),
      amber: new THREE.MeshPhysicalMaterial({ color: '#8a4a14', roughness: 0.15, transmission: 0.4, thickness: 0.02, transparent: true, opacity: 0.9 }),
      white: new THREE.MeshStandardMaterial({ color: '#f1f1ee', roughness: 0.35 }),
      black: new THREE.MeshStandardMaterial({ color: '#191b1e', roughness: 0.3, metalness: 0.3 }),
      cup: new THREE.MeshStandardMaterial({ color: '#e9e6df', roughness: 0.4 }),
    }),
    []
  );
  const items = useMemo(() => {
    const out = [];
    const r = rng(77);
    levels.slice(0, 3).forEach((y, li) => {
      let x = x0 + 0.12;
      while (x < x1 - 0.12) {
        const kind = Math.floor(r() * 4);
        out.push({ kind: li === 0 && kind === 3 ? 0 : kind, x, y: y + 0.02 });
        x += kind === 0 ? 0.32 : 0.16 + r() * 0.06;
      }
    });
    return out;
  }, []);

  return (
    <group>
      {/* black base cabinet */}
      <mesh material={m.frame} position={[cx, 0.6 + 0.24, cz]}>
        <boxGeometry args={[w, 0.48, d]} />
      </mesh>
      {/* uprights */}
      {[x0, x0 + w / 3, x0 + (2 * w) / 3, x1].map((x) => (
        <mesh key={x} material={m.frame} position={[x, 1.95, cz]}>
          <boxGeometry args={[0.035, 2.3, d]} />
        </mesh>
      ))}
      {levels.map((y) => (
        <group key={y}>
          <mesh position={[cx, y, cz]}>
            <boxGeometry args={[w, 0.04, d]} />
            <meshStandardMaterial {...walnut} color="#5a4030" roughness={0.55} />
          </mesh>
          <mesh material={m.led} position={[cx, y - 0.026, z1 - 0.02]}>
            <boxGeometry args={[w - 0.04, 0.01, 0.01]} />
          </mesh>
        </group>
      ))}
      {items.map((it, i) => {
        const z = cz;
        if (it.kind === 0)
          return (
            <group key={i} position={[it.x + 0.12, it.y, z]}>
              {[0, 1, 2, 3].map((k) => (
                <mesh key={k} material={k % 2 ? m.towelGrey : m.towel} position={[0, 0.03 + k * 0.055, 0]}>
                  <boxGeometry args={[0.26, 0.05, d - 0.06]} />
                </mesh>
              ))}
            </group>
          );
        if (it.kind === 1)
          return (
            <group key={i} position={[it.x, it.y, z]}>
              <mesh material={m.amber} position={[0, 0.08, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.16, 14]} />
              </mesh>
              <mesh material={m.black} position={[0, 0.175, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.03, 10]} />
              </mesh>
            </group>
          );
        if (it.kind === 2)
          return (
            <group key={i} position={[it.x, it.y, z]}>
              <mesh material={m.white} position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
              </mesh>
              <mesh material={m.black} position={[0, 0.105, 0]}>
                <cylinderGeometry args={[0.052, 0.052, 0.015, 16]} />
              </mesh>
            </group>
          );
        return (
          <group key={i} position={[it.x, it.y, z]}>
            {[0, 1, 2].map((k) => (
              <mesh key={k} material={m.cup} position={[0, 0.045 + k * 0.025, 0]}>
                <cylinderGeometry args={[0.04, 0.03, 0.09, 14, 1, true]} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* greenery across the top shelf and trailing down */}
      {[0.85, 1.4, 1.95, 2.5, 3.05].map((x, i) => (
        <Leafy key={x} p={[x, 2.67, cz]} s={1.25} seed={i + 3} />
      ))}
      {[0.75, 1.7, 2.6, 3.35].map((x, i) => (
        <Leafy key={`h${x}`} p={[x, 3.3, cz + 0.05]} s={1.3} hang seed={i + 11} />
      ))}
    </group>
  );
}
