import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { TUB, TUBS } from '../layout';
import { C, rippleNormalTexture, rng } from '../canvasTextures';

const mistVert = /* glsl */ `
  uniform float uTime;
  uniform float uScale;
  attribute float aSeed;
  varying float vA;
  void main() {
    float life = fract(uTime * 0.11 + aSeed);
    vec3 p = position;
    p.y += life * 0.95;
    p.x += sin(uTime * 0.6 + aSeed * 20.0) * 0.09 * life;
    p.z += cos(uTime * 0.5 + aSeed * 13.0) * 0.09 * life;
    vA = smoothstep(0.0, 0.18, life) * (1.0 - life);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.14 + aSeed * 0.14) * (1.0 + life * 1.2) * uScale / -mv.z;
  }
`;
const mistFrag = /* glsl */ `
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d) * vA * 0.11;
    gl_FragColor = vec4(0.82, 0.94, 1.0, a);
  }
`;

function Mist({ count }) {
  const { size } = useThree();
  const mat = useRef();
  const geo = useMemo(() => {
    const r = rng(21);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * (TUB.w - 0.15);
      pos[i * 3 + 1] = TUB.h - 0.04;
      pos[i * 3 + 2] = (r() - 0.5) * (TUB.l - 0.2);
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: 400 } }), []);
  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uScale.value = size.height * s.gl.getPixelRatio() * 0.9;
  });
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={mistVert}
        fragmentShader={mistFrag}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

function Tub({ x, z, ripple, shell, cube, seed }) {
  const cubes = useRef([]);
  const data = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: Q.low ? 4 : 7 }, () => ({
      x: (r() - 0.5) * (TUB.w - 0.3),
      z: (r() - 0.5) * (TUB.l - 0.35),
      ry: r() * Math.PI,
      ph: r() * 6,
      s: 0.07 + r() * 0.04,
    }));
  }, [seed]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    cubes.current.forEach((m, i) => {
      if (!m) return;
      const d = data[i];
      m.position.y = TUB.h - 0.06 + Math.sin(t * 1.3 + d.ph) * 0.012;
      m.rotation.y = d.ry + Math.sin(t * 0.3 + d.ph) * 0.3;
      m.rotation.z = Math.sin(t * 0.9 + d.ph) * 0.08;
    });
  });

  const t = 0.035;
  const iw = TUB.w - 2 * t;
  const il = TUB.l - 2 * t;
  return (
    <group position={[x, 0.6, z]}>
      {/* base plinth + blue LED */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[TUB.w + 0.08, 0.08, TUB.l + 0.08]} />
        <meshStandardMaterial color="#0b0c0d" roughness={0.6} />
      </mesh>
      {[
        [0, TUB.l / 2 + 0.042, TUB.w + 0.08, 0.012],
        [0, -(TUB.l / 2 + 0.042), TUB.w + 0.08, 0.012],
      ].map(([px, pz, w, d], i) => (
        <mesh key={i} position={[px, 0.045, pz]}>
          <boxGeometry args={[w, 0.02, d]} />
          <meshStandardMaterial color={C.ice} emissive={C.ice} emissiveIntensity={4} toneMapped={false} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (TUB.w / 2 + 0.042), 0.045, 0]}>
          <boxGeometry args={[0.012, 0.02, TUB.l + 0.08]} />
          <meshStandardMaterial color={C.ice} emissive={C.ice} emissiveIntensity={4} toneMapped={false} />
        </mesh>
      ))}
      {/* glowing water */}
      <mesh position={[0, 0.08 + (TUB.h - 0.16) / 2, 0]}>
        <boxGeometry args={[iw, TUB.h - 0.16, il]} />
        <meshStandardMaterial
          color="#0b6f98"
          emissive="#1f9fd6"
          emissiveIntensity={0.6}
          roughness={0.15}
          transparent
          opacity={0.82}
        />
      </mesh>
      <mesh position={[0, TUB.h - 0.079, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[iw, il]} />
        <meshStandardMaterial
          color="#1f8fbf"
          emissive="#1aa6e0"
          emissiveIntensity={0.55}
          normalMap={ripple}
          normalScale={new THREE.Vector2(0.7, 0.7)}
          roughness={0.04}
          metalness={0.2}
          envMapIntensity={1.6}
        />
      </mesh>
      {/* acrylic shell: four walls + floor, open top */}
      <group>
        <mesh material={shell} position={[0, 0.08 + 0.02, 0]}>
          <boxGeometry args={[TUB.w, 0.04, TUB.l]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={`x${s}`} material={shell} position={[s * (TUB.w / 2 - t / 2), 0.08 + (TUB.h - 0.08) / 2, 0]}>
            <boxGeometry args={[t, TUB.h - 0.08, TUB.l]} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={`z${s}`} material={shell} position={[0, 0.08 + (TUB.h - 0.08) / 2, s * (TUB.l / 2 - t / 2)]}>
            <boxGeometry args={[TUB.w - 2 * t, TUB.h - 0.08, t]} />
          </mesh>
        ))}
      </group>
      {/* floating ice */}
      {data.map((d, i) => (
        <mesh key={i} ref={(m) => (cubes.current[i] = m)} material={cube} position={[d.x, TUB.h - 0.06, d.z]} scale={d.s}>
          <boxGeometry args={[1, 0.8, 1]} />
        </mesh>
      ))}
      <group position={[0, 0, 0]}>
        <Mist count={Math.round(Q.mist / 2)} />
      </group>
    </group>
  );
}

export default function IceTubs() {
  const ripple = useMemo(() => {
    const t = rippleNormalTexture();
    t.repeat.set(1.5, 2.6);
    return t;
  }, []);
  const ripple2 = useMemo(() => {
    const t = ripple.clone();
    t.needsUpdate = true;
    t.repeat.set(1.3, 2.3);
    return t;
  }, [ripple]);

  const shell = useMemo(
    () =>
      Q.transmission
        ? new THREE.MeshPhysicalMaterial({
            color: '#e9f8ff',
            roughness: 0.05,
            transmission: 1,
            thickness: 0.05,
            ior: 1.49,
            envMapIntensity: 1.2,
          })
        : new THREE.MeshStandardMaterial({
            color: '#d7f2ff',
            roughness: 0.08,
            metalness: 0.1,
            transparent: true,
            opacity: 0.2,
            depthWrite: false,
          }),
    []
  );
  const cube = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#eefaff',
        roughness: 0.12,
        transmission: Q.transmission ? 0.85 : 0,
        transparent: !Q.transmission,
        opacity: Q.transmission ? 1 : 0.85,
        thickness: 0.06,
        ior: 1.31,
        emissive: '#9fe4ff',
        emissiveIntensity: 0.15,
      }),
    []
  );

  useFrame((s, dt) => {
    ripple.offset.x += dt * 0.02;
    ripple.offset.y += dt * 0.035;
    ripple2.offset.x -= dt * 0.025;
    ripple2.offset.y += dt * 0.02;
  });

  return (
    <group>
      {TUBS.map((t, i) => (
        <Tub key={i} {...t} ripple={i ? ripple2 : ripple} shell={shell} cube={cube} seed={i * 17 + 3} />
      ))}
      <pointLight position={[-2.2, 1.7, 2.6]} color={C.ice} intensity={6} distance={5.5} decay={1.6} />
    </group>
  );
}
