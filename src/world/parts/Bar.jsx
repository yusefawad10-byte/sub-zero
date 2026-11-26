import { useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { BAR, FRIDGE, SHELVES } from '../layout';
import { useSet } from '../textures';
import { C, leafTexture, rng } from '../canvasTextures';
import { Bottle as PropBottle, FoldedTowel } from './props';
import { RoundedBox } from '@react-three/drei';

const F = 0.6;
const SHAKE = ['#6b4430', '#e7a6b0', '#efe2c5'];
const ELECTRO = ['#5ec8f2', '#f2a14b', '#e46a8f', '#9be26a'];

function useMats() {
  return useMemo(() => {
    const clear = Q.transmission
      ? new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transmission: 0.95, thickness: 0.01, ior: 1.45 })
      : new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.05, transparent: true, opacity: 0.25, depthWrite: false });
    const coconut = new THREE.MeshStandardMaterial({ color: '#7fae4a', roughness: 0.55 });
    const husk = new THREE.MeshStandardMaterial({ color: '#f2ecd8', roughness: 0.8 });
    const straw = new THREE.MeshStandardMaterial({ color: C.yellow, roughness: 0.5 });
    const lid = new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.3, transparent: true, opacity: 0.7 });
    const cap = new THREE.MeshStandardMaterial({ color: '#f3f3f3', roughness: 0.4 });
    const liquids = SHAKE.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 }));
    const drinks = ELECTRO.map(
      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.1, transparent: true, opacity: 0.82, emissive: c, emissiveIntensity: 0.12 })
    );
    return { clear, coconut, husk, straw, lid, cap, liquids, drinks };
  }, []);
}

function Shake({ p, m, i }) {
  return (
    <group position={p}>
      <mesh material={m.liquids[i % 3]} position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.04, 0.032, 0.12, 16]} />
      </mesh>
      <mesh material={m.clear} position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.046, 0.036, 0.15, 16, 1, true]} />
      </mesh>
      <mesh material={m.lid} position={[0, 0.155, 0]}>
        <sphereGeometry args={[0.046, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={m.straw} position={[0.01, 0.22, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.005, 0.005, 0.18, 6]} />
      </mesh>
    </group>
  );
}

function Coconut({ p, m, straw = true }) {
  return (
    <group position={p}>
      <mesh material={m.coconut} position={[0, 0.085, 0]} scale={[1, 1.15, 1]}>
        <sphereGeometry args={[0.075, 20, 14]} />
      </mesh>
      <mesh material={m.husk} position={[0, 0.165, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.03, 14]} />
      </mesh>
      {straw && (
        <mesh material={m.straw} position={[0.01, 0.24, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.18, 6]} />
        </mesh>
      )}
    </group>
  );
}

function Bottle({ p, i, h = 0.18 }) {
  return <PropBottle p={p} i={i} kind={h >= 0.19 ? 'sport' : 'juice'} s={h / 0.19} ry={i * 0.7} />;
}

// Real-looking foliage: leaf-shaped cards (alpha-tested texture) in one instanced mesh per plant.
let LEAF_TEX = null;
function leafTex() {
  if (!LEAF_TEX) LEAF_TEX = leafTexture();
  return LEAF_TEX;
}
const LEAF_GEO = (() => {
  const g = new THREE.PlaneGeometry(1, 1);
  g.translate(0, 0.5, 0);
  return g;
})();

export function Leafy({ p, s = 1, hang = false, seed = 1 }) {
  const mesh = useMemo(() => {
    const r = rng(Math.round(seed * 97 + p[0] * 31 + p[2] * 17 + (hang ? 5 : 0)));
    const n = hang ? 46 : 30;
    const mat = new THREE.MeshStandardMaterial({
      map: leafTex(),
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      roughness: 0.6,
      color: '#ffffff',
    });
    const im = new THREE.InstancedMesh(LEAF_GEO, mat, n);
    const o = new THREE.Object3D();
    const col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      if (hang) {
        // trailing vines: leaves hang along a few strands
        const strand = i % 4;
        const a = strand * 1.6 + r() * 0.4;
        const t = Math.floor(i / 4) / (n / 4);
        o.position.set(Math.cos(a) * (0.08 + t * 0.06), -t * 0.75, Math.sin(a) * (0.08 + t * 0.06));
        o.rotation.set(Math.PI * (0.55 + r() * 0.3), r() * Math.PI * 2, (r() - 0.5) * 0.8);
      } else {
        const a = r() * Math.PI * 2;
        const rad = 0.02 + r() * 0.1;
        o.position.set(Math.cos(a) * rad, 0.1 + r() * 0.12, Math.sin(a) * rad);
        o.rotation.set((r() - 0.5) * 1.6, a, (r() - 0.5) * 1.2);
      }
      const sz = (hang ? 0.07 : 0.09) + r() * 0.05;
      o.scale.set(sz * 0.6, sz, sz);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
      col.setHSL(0.27 + r() * 0.06, 0.45 + r() * 0.2, 0.22 + r() * 0.12);
      im.setColorAt(i, col);
    }
    im.userData.noShadow = true;
    return im;
  }, [hang, seed, p]);
  return (
    <group position={p} scale={s}>
      {!hang && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.1, 16]} />
          <meshStandardMaterial color="#191b1e" roughness={0.5} metalness={0.2} />
        </mesh>
      )}
      <primitive object={mesh} />
    </group>
  );
}

function Towels({ p }) {
  return (
    <group position={p}>
      <FoldedTowel p={[0, 0, 0]} w={0.22} d={0.17} layers={3} />
    </group>
  );
}

// A real commercial fridge: rounded black cabinet, lit header sign, framed glass doors
// with gaskets and bar handles, wire shelves, LED strips down the sides, bottles, kick grille.
function CommercialFridge({ m }) {
  const fw = FRIDGE.x1 - FRIDGE.x0;
  const fd = FRIDGE.z1 - FRIDGE.z0;
  const H = 1.85;
  const mats = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({ color: '#0c0d0f', roughness: 0.35, metalness: 0.5, clearcoat: 0.6 }),
      inner: new THREE.MeshStandardMaterial({ color: '#dfe9ee', roughness: 0.5, emissive: '#cfe9ff', emissiveIntensity: 0.9 }),
      frame: new THREE.MeshStandardMaterial({ color: '#111214', roughness: 0.3, metalness: 0.7 }),
      gasket: new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.9 }),
      chrome: new THREE.MeshStandardMaterial({ color: '#c8ccd0', roughness: 0.15, metalness: 1 }),
      wire: new THREE.MeshStandardMaterial({ color: '#b9bec4', roughness: 0.3, metalness: 0.9 }),
      led: new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#d8f3ff', emissiveIntensity: 3, toneMapped: false }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#e8f6ff', roughness: 0.03, clearcoat: 1, transparent: true, opacity: 0.14, depthWrite: false }),
      sign: new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#65CFFF', emissiveIntensity: 1.6, toneMapped: false }),
    }),
    []
  );
  const doorW = fw / 2 - 0.03;
  const shelfYs = [0.32, 0.66, 1.0, 1.34];
  return (
    <group position={[(FRIDGE.x0 + FRIDGE.x1) / 2, F, (FRIDGE.z0 + FRIDGE.z1) / 2]}>
      {/* open-front cabinet: sides, top header, base plinth and back */}
      {[-1, 1].map((sx) => (
        <RoundedBox key={sx} args={[0.05, H, fd]} radius={0.018} smoothness={3} position={[sx * (fw / 2 - 0.025), H / 2 + 0.06, 0]} material={mats.body} />
      ))}
      <RoundedBox args={[fw, 0.16, fd]} radius={0.018} smoothness={3} position={[0, H - 0.02, 0]} material={mats.body} />
      <RoundedBox args={[fw, 0.2, fd]} radius={0.018} smoothness={3} position={[0, 0.16, 0]} material={mats.body} />
      <mesh position={[0, H / 2 + 0.06, -fd / 2 + 0.02]} material={mats.body}>
        <boxGeometry args={[fw, H, 0.04]} />
      </mesh>
      {/* lit interior back and sides */}
      <mesh position={[0, 0.95, -fd / 2 + 0.045]} material={mats.inner}>
        <planeGeometry args={[fw - 0.08, 1.5]} />
      </mesh>
      {/* header with the lit sign */}
      <mesh position={[0, H - 0.06, fd / 2 + 0.002]} material={mats.sign}>
        <planeGeometry args={[fw - 0.12, 0.07]} />
      </mesh>
      {/* kick plate grille */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[-fw / 2 + 0.1 + i * ((fw - 0.2) / 8), 0.12, fd / 2 + 0.003]} material={mats.gasket}>
          <boxGeometry args={[0.05, 0.06, 0.004]} />
        </mesh>
      ))}
      {/* feet */}
      {[-1, 1].map((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * (fw / 2 - 0.06), 0.03, sz * (fd / 2 - 0.06)]} material={mats.frame}>
          <cylinderGeometry args={[0.02, 0.025, 0.06, 10]} />
        </mesh>
      )))}
      {/* wire shelves and bottles */}
      {shelfYs.map((y, r) => (
        <group key={y}>
          {Array.from({ length: 7 }, (_, k) => (
            <mesh key={k} position={[0, y, -fd / 2 + 0.1 + k * 0.06]} rotation={[0, 0, Math.PI / 2]} material={mats.wire}>
              <cylinderGeometry args={[0.004, 0.004, fw - 0.1, 6]} />
            </mesh>
          ))}
          {Array.from({ length: 7 }, (_, k) => (
            <Bottle key={k} i={r + k} p={[-fw / 2 + 0.11 + k * ((fw - 0.22) / 6), y + 0.006, 0.02 - (k % 2) * 0.08]} h={r % 2 ? 0.17 : 0.19} />
          ))}
        </group>
      ))}
      {/* LED strips down the inside edges */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (fw / 2 - 0.05), 0.95, fd / 2 - 0.06]} material={mats.led}>
          <boxGeometry args={[0.012, 1.45, 0.012]} />
        </mesh>
      ))}
      {/* two framed glass doors with gaskets and bar handles */}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[(sx * fw) / 4, 0.95, fd / 2 + 0.02]}>
          <mesh material={mats.glass} renderOrder={3}>
            <planeGeometry args={[doorW - 0.06, 1.52]} />
          </mesh>
          {[[0, 0.79, doorW, 0.06], [0, -0.79, doorW, 0.06], [-doorW / 2 + 0.02, 0, 0.045, 1.64], [doorW / 2 - 0.02, 0, 0.045, 1.64]].map(([x, y, w, h], i) => (
            <mesh key={i} position={[x, y, 0]} material={mats.frame}>
              <boxGeometry args={[w, h, 0.035]} />
            </mesh>
          ))}
          <group position={[-sx * (doorW / 2 - 0.08), 0, 0.045]}>
            <mesh material={mats.chrome}>
              <cylinderGeometry args={[0.011, 0.011, 0.5, 14]} />
            </mesh>
            {[-0.22, 0.22].map((y) => (
              <mesh key={y} position={[0, y, -0.022]} rotation={[Math.PI / 2, 0, 0]} material={mats.chrome}>
                <cylinderGeometry args={[0.007, 0.007, 0.04, 10]} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
}

export default function Bar() {
  const slats = useSet('dark_wooden_planks', 0.15, 1);
  const walnut = useSet('dark_wooden_planks', 1.2, 0.2);
  const m = useMats();
  const W = BAR.x1 - BAR.x0;
  const cx = (BAR.x0 + BAR.x1) / 2;
  const top = BAR.top;
  const slatCount = 26;
  const shelves = [1.85, 2.3, 2.75];
  const sw = SHELVES.x1 - SHELVES.x0;
  const scx = (SHELVES.x0 + SHELVES.x1) / 2;
  const fw = FRIDGE.x1 - FRIDGE.x0;

  return (
    <group>
      {/* counter body + dark slat front, warm strip under the top */}
      <mesh position={[cx, (F + top) / 2, (BAR.z0 + BAR.z1) / 2 - 0.02]}>
        <boxGeometry args={[W, top - F, BAR.z1 - BAR.z0 - 0.04]} />
        <meshStandardMaterial color="#0e0b09" roughness={0.9} />
      </mesh>
      {Array.from({ length: slatCount }, (_, i) => (
        <mesh key={i} position={[BAR.x0 + (W / slatCount) * (i + 0.5), (F + top) / 2 - 0.02, BAR.z1 - 0.01]}>
          <boxGeometry args={[W / slatCount - 0.016, top - F - 0.06, 0.035]} />
          <meshStandardMaterial {...slats} color="#3a281c" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[cx, top + 0.03, (BAR.z0 + BAR.z1) / 2 + 0.02]}>
        <boxGeometry args={[W + 0.1, 0.06, BAR.z1 - BAR.z0 + 0.1]} />
        <meshPhysicalMaterial color="#191b1e" roughness={0.18} metalness={0.2} clearcoat={0.8} clearcoatRoughness={0.1} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[cx, top - 0.01, BAR.z1 + 0.05]}>
        <boxGeometry args={[W, 0.015, 0.015]} />
        <meshStandardMaterial color="#fff" emissive="#ffc27a" emissiveIntensity={3.2} toneMapped={false} />
      </mesh>

      {/* drinks on the counter */}
      {[0, 1, 2].map((i) => (
        <Shake key={i} i={i} m={m} p={[BAR.x0 + 0.3 + i * 0.17, top + 0.06, BAR.z0 + 0.35]} />
      ))}
      <Coconut m={m} p={[BAR.x0 + 1.0, top + 0.06, BAR.z0 + 0.32]} />
      <Coconut m={m} p={[BAR.x0 + 1.22, top + 0.06, BAR.z0 + 0.38]} />
      {[0, 1, 2].map((i) => (
        <Bottle key={i} i={i} m={m} p={[BAR.x0 + 1.55 + i * 0.1, top + 0.06, BAR.z0 + 0.35]} />
      ))}
      <group position={[BAR.x1 - 0.3, top + 0.06, BAR.z0 + 0.15]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.15, 0.12, 0.15]} />
          <meshStandardMaterial color="#111" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh material={m.clear} position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.075, 0.055, 0.26, 16, 1, true]} />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.06, 0.052, 0.09, 16]} />
          <meshStandardMaterial color="#9ccf6a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <cylinderGeometry args={[0.078, 0.078, 0.025, 16]} />
          <meshStandardMaterial color="#111" roughness={0.4} />
        </mesh>
      </group>

      {/* back shelves: plants on top, towels, bottles and coconuts below, warm LED under each */}
      {shelves.map((y, si) => (
        <group key={y}>
          <mesh position={[scx, y, -1.17]}>
            <boxGeometry args={[sw, 0.04, 0.22]} />
            <meshStandardMaterial {...walnut} color="#5a4030" roughness={0.55} />
          </mesh>
          <mesh position={[scx, y - 0.026, -1.075]}>
            <boxGeometry args={[sw - 0.04, 0.012, 0.012]} />
            <meshStandardMaterial color="#fff" emissive="#ffc98a" emissiveIntensity={3.4} toneMapped={false} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => {
            const x = SHELVES.x0 + 0.13 + i * ((sw - 0.26) / 7);
            const p = [x, y + 0.02, -1.17];
            if (si === 2) return <Leafy key={i} p={p} s={1.1} />;
            if (si === 1 && i % 3 === 1) return <Towels key={i} p={p} />;
            if ((i + si) % 4 === 0) return <Coconut key={i} m={m} p={p} straw={false} />;
            return <Bottle key={i} m={m} i={i + si} p={p} h={0.2} />;
          })}
        </group>
      ))}
      {/* black shelving frame */}
      {[SHELVES.x0, (SHELVES.x0 + SHELVES.x1) / 2, SHELVES.x1].map((x) => (
        <mesh key={x} position={[x, 2.3, -1.17]}>
          <boxGeometry args={[0.035, 1.4, 0.24]} />
          <meshStandardMaterial color="#090a0c" roughness={0.35} metalness={0.6} />
        </mesh>
      ))}
      {/* plants on top of the fridge and trailing from the ceiling */}
      {[FRIDGE.x0 + 0.18, FRIDGE.x0 + 0.5, FRIDGE.x0 + 0.82].map((x) => (
        <Leafy key={x} p={[x, 2.42, -0.97]} s={1.2} />
      ))}
      {[[4.1, 3.35, 1.95], [7.15, 3.35, 1.3], [5.1, 3.35, -0.95], [0.75, 3.35, 1.1], [2.9, 3.35, 1.0]].map((p, i) => (
        <Leafy key={i} p={p} s={1.4} hang />
      ))}

      {/* commercial double glass-door drinks fridge */}
      <CommercialFridge m={m} />

      {Q.fullLights && <pointLight position={[(FRIDGE.x0 + FRIDGE.x1) / 2, 1.5, 0.1]} color="#cfefff" intensity={1.6} distance={2.4} decay={1.5} />}
    </group>
  );
}
