import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { TUB, TUBS } from '../layout';
import { C, dropletNormalTexture, rippleNormalTexture, rng } from '../canvasTextures';
import { iceGeometries } from './props';

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
    float a = smoothstep(0.5, 0.0, d) * vA * 0.065;
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

const frameMat = new THREE.MeshStandardMaterial({ color: '#0d0e0f', metalness: 0.75, roughness: 0.35 });
const iceMat = new THREE.MeshPhysicalMaterial({
  color: '#e4f6ff',
  roughness: 0.1,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
  transparent: true,
  opacity: 0.88,
  emissive: '#65CFFF',
  emissiveIntensity: 0.35,
  flatShading: true,
});

// Water volume: bright icy blue at the bottom fading to darker clear blue at the top.
const waterVert = /* glsl */ `
  varying float vH;
  varying vec3 vN;
  varying vec3 vView;
  uniform float uH;
  void main() {
    vH = clamp((position.y + uH * 0.5) / uH, 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const waterFrag = /* glsl */ `
  varying float vH;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec3 bottom = vec3(0.22, 0.62, 1.0) * 1.7;
    vec3 top = vec3(0.02, 0.14, 0.32);
    vec3 c = mix(bottom, top, smoothstep(0.0, 0.85, vH));
    float fres = pow(1.0 - abs(dot(vN, vView)), 2.0);
    float a = mix(0.92, 0.62, vH) + fres * 0.15;
    gl_FragColor = vec4(c + fres * 0.08, a);
  }
`;
function waterMaterial(h) {
  return new THREE.ShaderMaterial({
    vertexShader: waterVert,
    fragmentShader: waterFrag,
    uniforms: { uH: { value: h } },
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
}

function TubFrame() {
  const e = 0.035;
  const { w, l, h } = TUB;
  const bars = [];
  for (const y of [0.08, h]) {
    for (const s of [-1, 1]) {
      bars.push([[0, y, (s * l) / 2], [w + e, e, e]]);
      bars.push([[(s * w) / 2, y, 0], [e, e, l + e]]);
    }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bars.push([[(sx * w) / 2, 0.08 + (h - 0.08) / 2, (sz * l) / 2], [e, h - 0.08, e]]);
  return bars.map(([p, s], i) => (
    <mesh key={i} material={frameMat} position={p}>
      <boxGeometry args={s} />
    </mesh>
  ));
}

// Irregular translucent ice chunks: three jittered shapes, varied sizes, mostly floating
// near the surface with some suspended lower in the water.
const ICE_GEOS = iceGeometries(7, 3);
function CrushedIce({ seed }) {
  const meshes = useMemo(() => {
    const r = rng(seed + 101);
    const n = Q.low ? 60 : 150;
    const per = Math.ceil(n / ICE_GEOS.length);
    const col = new THREE.Color();
    return ICE_GEOS.map((g, gi) => {
      const im = new THREE.InstancedMesh(g, iceMat, per);
      const o = new THREE.Object3D();
      for (let i = 0; i < per; i++) {
        const u = (r() - 0.5) * (TUB.w - 0.12);
        const v = (r() - 0.5) * (TUB.l - 0.12);
        const mound = 0.04 * (1 - Math.min(1, (u * u) / 0.2 + (v * v) / 0.15));
        const deep = (i + gi) % 5 === 0;
        o.position.set(u, deep ? 0.18 + r() * (TUB.h - 0.4) : TUB.h - 0.09 + mound + r() * 0.035, v);
        o.rotation.set(r() * 6, r() * 6, r() * 6);
        const s = 0.018 + Math.pow(r(), 1.6) * 0.05;
        o.scale.set(s * (0.8 + r() * 0.5), s * (0.6 + r() * 0.5), s * (0.8 + r() * 0.5));
        o.updateMatrix();
        im.setMatrixAt(i, o.matrix);
        col.setHSL(0.55, 0.35 + r() * 0.3, 0.85 + r() * 0.12);
        im.setColorAt(i, col);
      }
      im.userData.noShadow = true;
      return im;
    });
  }, [seed]);
  return meshes.map((m, i) => <primitive key={i} object={m} />);
}

function Tub({ x, z, ripple, shell, cube, seed }) {
  const cubes = useRef([]);
  const water = useMemo(() => waterMaterial(TUB.h - 0.2), []);
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
      {/* underwater light panel on the floor of the tank */}
      <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[iw - 0.04, il - 0.04]} />
        <meshStandardMaterial color="#65CFFF" emissive="#65CFFF" emissiveIntensity={3.2} toneMapped={false} />
      </mesh>
      {/* water volume with the bottom-to-top gradient */}
      <mesh position={[0, 0.12 + (TUB.h - 0.2) / 2, 0]} material={water} renderOrder={2}>
        <boxGeometry args={[iw, TUB.h - 0.2, il]} />
      </mesh>
      <mesh position={[0, TUB.h - 0.079, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[iw, il]} />
        <meshStandardMaterial
          color="#2b7fae"
          emissive="#378FC5"
          emissiveIntensity={0.35}
          transparent
          opacity={0.75}
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
      {/* black metal frame on every edge */}
      <TubFrame />
      {/* crushed ice heaped on top, a few bigger cubes bobbing */}
      <CrushedIce seed={seed} />
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
      new THREE.MeshPhysicalMaterial({
        color: '#dff4ff',
        roughness: 0.06,
        metalness: 0.0,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        envMapIntensity: 1.6,
        normalMap: dropletNormalTexture(),
        normalScale: new THREE.Vector2(0.4, 0.4),
      }),
    []
  );
  const cube = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#eefaff',
        roughness: 0.12,
        clearcoat: 1,
        transparent: true,
        opacity: 0.88,
        emissive: '#65CFFF',
        emissiveIntensity: 0.3,
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
      <pointLight position={[-2.45, 0.9, 2.95]} color="#378FC5" intensity={4} distance={4} decay={1.6} />
    </group>
  );
}
