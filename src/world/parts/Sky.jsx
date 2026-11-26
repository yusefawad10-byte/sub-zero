import { useMemo } from 'react';
import * as THREE from 'three';
import { glowTexture, rng } from '../canvasTextures';

export const MOON_DIR = new THREE.Vector3(-0.45, 0.62, -0.64).normalize();

const vert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const frag = /* glsl */ `
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, -0.2, 1.0);
    vec3 horizon = vec3(0.13, 0.15, 0.2);
    vec3 glow = vec3(0.42, 0.24, 0.12);
    vec3 zenith = vec3(0.004, 0.008, 0.02);
    vec3 c = mix(horizon, zenith, pow(smoothstep(0.0, 0.6, h), 0.7));
    c += glow * exp(-max(h, 0.0) * 18.0) * 0.55;
    if (h < 0.0) c = horizon * 0.6;
    gl_FragColor = vec4(c, 1.0);
  }
`;

export default function Sky() {
  const stars = useMemo(() => {
    const r = rng(42);
    const n = 1600;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = r() * Math.PI * 2;
      const v = 0.08 + r() * 0.9;
      const y = Math.sin(v * Math.PI * 0.5);
      const rr = Math.sqrt(1 - y * y);
      p[i * 3] = Math.cos(u) * rr * 280;
      p[i * 3 + 1] = y * 280;
      p[i * 3 + 2] = Math.sin(u) * rr * 280;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  const glow = useMemo(() => glowTexture(), []);
  const moonPos = MOON_DIR.clone().multiplyScalar(250);

  return (
    <group>
      <mesh renderOrder={-10}>
        <sphereGeometry args={[380, 32, 16]} />
        <shaderMaterial vertexShader={vert} fragmentShader={frag} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>
      <points geometry={stars} renderOrder={-9}>
        <pointsMaterial color="#dfe9ff" size={1.3} sizeAttenuation={false} transparent opacity={0.85} fog={false} depthWrite={false} />
      </points>
      <mesh position={moonPos} renderOrder={-8}>
        <sphereGeometry args={[6, 24, 16]} />
        <meshBasicMaterial color={[2.2, 2.1, 1.9]} fog={false} toneMapped={false} />
      </mesh>
      <sprite position={moonPos} scale={[60, 60, 1]} renderOrder={-8}>
        <spriteMaterial map={glow} color="#bcd0ff" transparent opacity={0.4} fog={false} depthWrite={false} />
      </sprite>
    </group>
  );
}
