import { useMemo } from 'react';
import * as THREE from 'three';
import { C, rng } from '../canvasTextures';
import { BOX, PLANTS } from '../layout';

function Plant({ x, y, z, s }) {
  const leaves = useMemo(() => {
    const r = rng(Math.round(x * 100 + z * 10));
    return Array.from({ length: 18 }, () => ({ ry: r() * Math.PI * 2, rx: 0.3 + r() * 0.8, len: 0.5 + r() * 0.45 }));
  }, [x, z]);
  const leafGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.16, 1, 1, 4);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  return (
    <group position={[x, y, z]} scale={s}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.44, 20]} />
        <meshStandardMaterial color="#151515" roughness={0.6} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.42, 0]} rotation={[0, l.ry, 0]}>
          <mesh geometry={leafGeo} rotation={[l.rx, 0, 0]} scale={[1, l.len, 1]}>
            <meshStandardMaterial color={i % 2 ? '#2f6b3a' : '#4b8f45'} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function MidTruck() {
  return (
    <group>
      {PLANTS.map((p, i) => (
        <Plant key={i} {...p} />
      ))}

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
      <group position={[3.0, 3.15, -1.18]}>
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
