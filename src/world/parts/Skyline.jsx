import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { glowTexture, rng, windowsTexture } from '../canvasTextures';

// Tower silhouettes with lit windows, plus a Burj-style supertall with a red aviation light.
export default function Skyline() {
  const { towers, burj } = useMemo(() => {
    const r = rng(77);
    const winTex = windowsTexture(Q.windows, 5);
    const towers = [];
    for (let i = 0; i < Q.buildings; i++) {
      // most towers behind the truck, some off to the sides
      const a = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.5;
      const d = 210 + r() * 110;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      const w = 10 + r() * 16;
      const dpt = 10 + r() * 16;
      const h = 12 + Math.pow(r(), 2) * 55;
      const tex = winTex.clone();
      tex.needsUpdate = true;
      tex.repeat.set(Math.max(1, w / 18), Math.max(1, h / 18));
      tex.offset.set(r(), r());
      const mat = new THREE.MeshStandardMaterial({
        color: '#0b0f15',
        roughness: 0.8,
        metalness: 0.4,
        emissive: '#ffffff',
        emissiveMap: tex,
        emissiveIntensity: 1.35,
        fog: false,
      });
      towers.push({ x, z, w, d: dpt, h, mat, ry: r() * 0.6 });
    }
    // supertall: stepped tiers and a spire
    const tiers = [];
    let y = 0;
    const steps = [
      [8, 30],
      [6.8, 26],
      [5.6, 24],
      [4.5, 22],
      [3.5, 18],
      [2.6, 15],
      [1.8, 12],
      [1.1, 10],
    ];
    const bt = winTex.clone();
    bt.needsUpdate = true;
    bt.repeat.set(0.6, 6);
    const bMat = new THREE.MeshStandardMaterial({
      color: '#0d121a',
      metalness: 0.7,
      roughness: 0.3,
      emissive: '#e8f2ff',
      emissiveMap: bt,
      emissiveIntensity: 1.8,
      fog: false,
    });
    for (const [rad, h] of steps) {
      tiers.push({ y: y + h / 2, rad, h });
      y += h;
    }
    const burj = { x: 60, z: -250, tiers, spireY: y, mat: bMat };
    return { towers, burj };
  }, []);

  const red = useRef();
  const glow = useMemo(() => glowTexture('rgba(255,60,40,1)'), []);
  const halo = useRef();
  useFrame((s) => {
    const on = Math.sin(s.clock.elapsedTime * Math.PI * 0.9) > 0.2 ? 1 : 0.08;
    if (red.current) red.current.color.setRGB(4 * on, 0.3 * on, 0.2 * on);
    if (halo.current) halo.current.opacity = 0.6 * on;
  });

  return (
    <group>
      {towers.map((t, i) => (
        <mesh key={i} material={t.mat} position={[t.x, t.h / 2, t.z]} rotation={[0, t.ry, 0]}>
          <boxGeometry args={[t.w, t.h, t.d]} />
        </mesh>
      ))}
      <group position={[burj.x, 0, burj.z]}>
        {burj.tiers.map((t, i) => (
          <mesh key={i} material={burj.mat} position={[0, t.y, 0]}>
            <cylinderGeometry args={[t.rad * 0.92, t.rad, t.h, 6]} />
          </mesh>
        ))}
        <mesh material={burj.mat} position={[0, burj.spireY + 18, 0]}>
          <coneGeometry args={[0.8, 36, 6]} />
        </mesh>
        <mesh position={[0, burj.spireY + 36.5, 0]}>
          <sphereGeometry args={[0.9, 10, 8]} />
          <meshBasicMaterial ref={red} color={[4, 0.3, 0.2]} toneMapped={false} fog={false} />
        </mesh>
        <sprite position={[0, burj.spireY + 36.5, 0]} scale={[14, 14, 1]}>
          <spriteMaterial ref={halo} map={glow} transparent opacity={0.6} depthWrite={false} fog={false} />
        </sprite>
      </group>
    </group>
  );
}
