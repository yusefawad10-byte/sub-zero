import { useMemo } from 'react';
import * as THREE from 'three';
import { C, rng } from '../canvasTextures';
import { BOX, PLANTS, TOWEL_BENCH } from '../layout';

const F = 0.6;

function Plant({ x, y, z, s }) {
  const leaves = useMemo(() => {
    const r = rng(Math.round(x * 100 + z * 10));
    return Array.from({ length: 14 }, () => ({
      ry: r() * Math.PI * 2,
      rx: 0.35 + r() * 0.7,
      len: 0.45 + r() * 0.35,
    }));
  }, [x, z]);
  const leafGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.12, 1, 1, 4);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  return (
    <group position={[x, y, z]} scale={s}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.44, 20]} />
        <meshStandardMaterial color="#e8e0d2" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.19, 20]} />
        <meshStandardMaterial color="#2a1d14" roughness={1} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[0, 0.42, 0]} rotation={[0, l.ry, 0]}>
          <mesh geometry={leafGeo} rotation={[l.rx, 0, 0]} scale={[1, l.len, 1]}>
            <meshStandardMaterial color={i % 2 ? '#2f6b3a' : '#3f7f45'} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function MidTruck() {
  const bx = (TOWEL_BENCH.x0 + TOWEL_BENCH.x1) / 2;
  const bz = (TOWEL_BENCH.z0 + TOWEL_BENCH.z1) / 2;
  const bw = TOWEL_BENCH.x1 - TOWEL_BENCH.x0;
  const bd = TOWEL_BENCH.z1 - TOWEL_BENCH.z0;
  const towelColors = ['#f3ebdd', C.green, '#f3ebdd', '#e9e2d4', C.green, '#f3ebdd'];
  return (
    <group>
      {/* towel bench */}
      <mesh position={[bx, F + 0.44, bz]}>
        <boxGeometry args={[bw, 0.05, bd]} />
        <meshStandardMaterial color="#c98b55" roughness={0.75} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[bx + s * (bw / 2 - 0.06), F + 0.21, bz]}>
          <boxGeometry args={[0.05, 0.42, bd - 0.04]} />
          <meshStandardMaterial color="#a86f40" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[bx, F + 0.12, bz]}>
        <boxGeometry args={[bw - 0.1, 0.03, bd - 0.06]} />
        <meshStandardMaterial color="#a86f40" roughness={0.8} />
      </mesh>
      {/* rolled towels: a pyramid on top, a row below */}
      {towelColors.map((c, i) => {
        const row = i < 3 ? 0 : 1;
        const x = bx - 0.45 + (row ? (i - 3) * 0.17 + 0.08 : i * 0.17);
        return (
          <mesh key={i} position={[x, F + 0.53 + row * 0.15, bz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.36, 16]} />
            <meshStandardMaterial color={c} roughness={1} />
          </mesh>
        );
      })}
      {[0.2, 0.36].map((dx) => (
        <mesh key={dx} position={[bx + dx, F + 0.21, bz]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.36, 16]} />
          <meshStandardMaterial color="#f3ebdd" roughness={1} />
        </mesh>
      ))}

      {PLANTS.map((p, i) => (
        <Plant key={i} {...p} />
      ))}

      {/* ceiling speakers */}
      {[-0.7, 1.0].map((x) => (
        <group key={x} position={[x, BOX.ceil - 0.02, 0.15]}>
          <mesh>
            <cylinderGeometry args={[0.13, 0.13, 0.03, 24]} />
            <meshStandardMaterial color="#efefef" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.017, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.11, 24]} />
            <meshStandardMaterial color="#cfcfcf" roughness={0.9} metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* air conditioner above the chalkboard */}
      <group position={[-0.55, 3.0, -1.18]}>
        <mesh>
          <boxGeometry args={[0.95, 0.28, 0.2]} />
          <meshStandardMaterial color="#f1f1ee" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.12, 0.08]} rotation={[-0.6, 0, 0]}>
          <boxGeometry args={[0.85, 0.05, 0.01]} />
          <meshStandardMaterial color="#d8d8d4" roughness={0.5} />
        </mesh>
        <mesh position={[0.38, 0.06, 0.101]}>
          <circleGeometry args={[0.012, 10]} />
          <meshStandardMaterial color="#fff" emissive={C.ice} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      </group>

      {/* soft fill inside the box */}
      <pointLight position={[-0.6, 3.0, 0.3]} color="#ffd2a0" intensity={3.2} distance={5} decay={1.5} />
    </group>
  );
}
