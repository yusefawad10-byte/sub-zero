import { useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { AWNING, AWNING_EDGE, PALMS, POLES, POLE_H } from '../layout';

const top = (p) => [p.x, POLE_H, p.z];
const palmTop = (p) => [p.x + p.lean[0] * 1.2, p.h - 0.9, p.z + p.lean[1] * 1.2];
const awningL = [-(AWNING.width / 2) + 0.1, AWNING_EDGE.y - 0.05, AWNING_EDGE.z - 0.05];
const awningR = [AWNING.width / 2 - 0.1, AWNING_EDGE.y - 0.05, AWNING_EDGE.z - 0.05];

const SPANS = [
  [top(POLES[0]), awningL, 0.5],
  [top(POLES[1]), awningR, 0.5],
  [top(POLES[0]), top(POLES[1]), 0.9],
  [top(POLES[2]), top(POLES[0]), 0.6],
  [top(POLES[3]), top(POLES[1]), 0.6],
  [top(POLES[2]), palmTop(PALMS[0]), 0.7],
  [top(POLES[3]), palmTop(PALMS[1]), 0.7],
  // strings from the palms right over the truck, as in the render
  [palmTop(PALMS[0]), palmTop(PALMS[1]), 1.6],
  [palmTop(PALMS[0]), awningL, 0.8],
  [palmTop(PALMS[1]), awningR, 0.8],
  [palmTop(PALMS[2]), top(POLES[2]), 0.7],
  [palmTop(PALMS[3]), top(POLES[3]), 0.7],
];

function sag(a, b, s, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push(
      new THREE.Vector3(
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t - s * 4 * t * (1 - t),
        a[2] + (b[2] - a[2]) * t
      )
    );
  }
  return pts;
}

export default function Festoons() {
  const { wires, bulbs, lightSpots } = useMemo(() => {
    const wireMat = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.7 });
    const wires = [];
    const bulbPts = [];
    const lightSpots = [];
    for (const [a, b, s] of SPANS) {
      const pts = sag(a, b, s, 24);
      const curve = new THREE.CatmullRomCurve3(pts);
      wires.push(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.007, 4, false), wireMat));
      const len = curve.getLength();
      const n = Math.max(3, Math.floor(len / 0.42));
      for (let i = 1; i < n; i++) {
        const p = curve.getPoint(i / n);
        bulbPts.push(p.x, p.y - 0.06, p.z);
      }
      lightSpots.push(curve.getPoint(0.5));
    }
    const count = bulbPts.length / 3;
    const bulbs = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.055, 10, 8),
      new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffbd6a', emissiveIntensity: 7, toneMapped: false }),
      count
    );
    const o = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      o.position.set(bulbPts[i * 3], bulbPts[i * 3 + 1], bulbPts[i * 3 + 2]);
      o.updateMatrix();
      bulbs.setMatrixAt(i, o.matrix);
    }
    bulbs.userData.noShadow = true;
    return { wires, bulbs, lightSpots };
  }, []);

  const lit = Q.fullLights ? [2, 7] : [2];

  return (
    <group>
      {POLES.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, POLE_H / 2, 0]}>
            <cylinderGeometry args={[0.05, 0.07, POLE_H, 10]} />
            <meshStandardMaterial color="#1c1d1f" metalness={0.6} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.22, 0.25, 0.12, 14]} />
            <meshStandardMaterial color="#2a2b2d" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {wires.map((w, i) => (
        <primitive key={i} object={w} />
      ))}
      <primitive object={bulbs} />
      {lit.map((i) => (
        <pointLight key={i} position={lightSpots[i]} color="#ffaa5c" intensity={4} distance={10} decay={1.5} />
      ))}
    </group>
  );
}
