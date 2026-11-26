import { useMemo } from 'react';
import * as THREE from 'three';
import { frondTexture, rng } from '../canvasTextures';
import { Q } from '../../quality';
import { PALMS } from '../layout';
import { Spot } from './bits';

// A frond: a plane bent outward and drooping down.
function frondGeometry(len = 3, width = 0.9, droop = 1.5) {
  const segs = 12;
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const x = len * t;
    const y = 0.7 * t - droop * t * t;
    const w = width * 0.5 * Math.sin(Math.PI * (0.06 + 0.94 * t)) + 0.02;
    const fold = 0.12 * w; // slight V fold along the rib
    pos.push(x, y + fold, -w, x, y, 0, x, y + fold, w);
    uv.push(0, 1 - t, 0.5, 1 - t, 1, 1 - t);
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 3;
    const b = (i + 1) * 3;
    idx.push(a, b, a + 1, a + 1, b, b + 1, a + 1, b + 1, a + 2, a + 2, b + 1, b + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Palm({ x, z, h, lean, seed, frondMat, frondGeo, barkMat, dateMat }) {
  const { segs, top, fronds } = useMemo(() => {
    const r = rng(seed);
    const n = 9;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push(new THREE.Vector3(lean[0] * t * t * 1.4, h * t, lean[1] * t * t * 1.4));
    }
    const segs = [];
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dir = b.clone().sub(a);
      const len = dir.length();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      const rBot = 0.26 - (i / n) * 0.1;
      segs.push({ pos: a.clone().add(b).multiplyScalar(0.5), q, len, r0: rBot - 0.012, r1: rBot });
    }
    const fronds = Array.from({ length: 15 }, (_, i) => ({
      ry: (i / 15) * Math.PI * 2 + r() * 0.3,
      rz: -0.15 + r() * 0.5,
      s: 0.8 + r() * 0.35,
    }));
    return { segs, top: pts[n], fronds };
  }, [h, lean, seed]);

  return (
    <group position={[x, 0, z]}>
      {segs.map((s, i) => (
        <mesh key={i} material={barkMat} position={s.pos} quaternion={s.q}>
          <cylinderGeometry args={[s.r0, s.r1, s.len * 1.02, 12]} />
        </mesh>
      ))}
      <group position={top}>
        {fronds.map((f, i) => (
          <group key={i} rotation={[0, f.ry, 0]}>
            <mesh geometry={frondGeo} material={frondMat} rotation={[0, 0, f.rz]} scale={f.s} />
          </group>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} material={dateMat} position={[Math.cos(i * 1.6) * 0.22, -0.35, Math.sin(i * 1.6) * 0.22]}>
            <sphereGeometry args={[0.13, 10, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function Palms() {
  const mats = useMemo(() => {
    const tex = frondTexture();
    return {
      frondMat: new THREE.MeshStandardMaterial({
        map: tex,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.75,
        color: '#b9d49a',
      }),
      barkMat: new THREE.MeshStandardMaterial({ color: '#7a5b40', roughness: 0.9 }),
      dateMat: new THREE.MeshStandardMaterial({ color: '#b5651d', roughness: 0.6 }),
      frondGeo: frondGeometry(),
    };
  }, []);
  return (
    <group>
      {PALMS.map((p, i) => (
        <Palm key={i} {...p} seed={i * 13 + 5} {...mats} />
      ))}
      {/* warm uplight at the foot of each palm, like the render */}
      {PALMS.map((p, i) => (
        <group key={`u${i}`}>
          <mesh position={[p.x + 0.45, 0.06, p.z + 0.45]}>
            <cylinderGeometry args={[0.08, 0.1, 0.12, 12]} />
            <meshStandardMaterial color="#111" emissive="#ffb050" emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
          {i < 2 && (
            <Spot
              position={[p.x + 0.45, 0.15, p.z + 0.45]}
              target={[p.x + p.lean[0], p.h * 0.75, p.z + p.lean[1]]}
              color="#ffa94d"
              intensity={Q.fullLights ? 30 : 22}
              distance={p.h + 2}
              angle={0.32}
              penumbra={0.6}
              decay={1.3}
            />
          )}
        </group>
      ))}
    </group>
  );
}
