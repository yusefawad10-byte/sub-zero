import { useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { BAR, FRIDGE, SHELVES } from '../layout';
import { useSet } from '../textures';
import { C } from '../canvasTextures';

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

function Bottle({ p, m, i, h = 0.18 }) {
  return (
    <group position={p}>
      <mesh material={m.drinks[i % m.drinks.length]} position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, h, 14]} />
      </mesh>
      <mesh material={m.cap} position={[0, h + 0.015, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.03, 10]} />
      </mesh>
    </group>
  );
}

function Leafy({ p, s = 1, hang = false }) {
  // a small bushy plant (or a trailing one when hung)
  const leaves = useMemo(() => {
    const out = [];
    for (let i = 0; i < (hang ? 14 : 9); i++) {
      const a = i * 2.39;
      const r = hang ? 0.08 + (i % 3) * 0.05 : 0.05 + (i % 3) * 0.035;
      out.push([Math.cos(a) * r, hang ? -i * 0.045 : 0.05 + (i % 4) * 0.035, Math.sin(a) * r, 0.05 + (i % 2) * 0.02]);
    }
    return out;
  }, [hang]);
  return (
    <group position={p} scale={s}>
      {!hang && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.06, 0.05, 0.1, 12]} />
          <meshStandardMaterial color="#1b1b1b" roughness={0.6} />
        </mesh>
      )}
      {leaves.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y + 0.08, z]} scale={[1, 0.7, 1]}>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={i % 2 ? '#3f8a3a' : '#5aa548'} roughness={0.7} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Towels({ p, n = 3 }) {
  return (
    <group position={p}>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[(i % 2) * 0.13 - 0.065, 0.04 + Math.floor(i / 2) * 0.075, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.2, 12]} />
          <meshStandardMaterial color="#f1ece2" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export default function Bar() {
  const slats = useSet('dark_wooden_planks', 0.15, 1);
  const marble = useSet('marble_01', 1.5, 0.6);
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
        <meshStandardMaterial {...marble} color="#f4f1ec" roughness={0.25} envMapIntensity={1.1} />
      </mesh>
      <mesh position={[cx, top - 0.01, BAR.z1 + 0.05]}>
        <boxGeometry args={[W, 0.015, 0.015]} />
        <meshStandardMaterial color="#fff" emissive="#ffc27a" emissiveIntensity={3.2} toneMapped={false} />
      </mesh>

      {/* drinks on the counter */}
      {[0, 1, 2].map((i) => (
        <Shake key={i} i={i} m={m} p={[1.0 + i * 0.17, top + 0.06, 0.15]} />
      ))}
      <Coconut m={m} p={[1.7, top + 0.06, 0.12]} />
      <Coconut m={m} p={[1.92, top + 0.06, 0.18]} />
      {[0, 1, 2].map((i) => (
        <Bottle key={i} i={i} m={m} p={[2.25 + i * 0.1, top + 0.06, 0.15]} />
      ))}
      <group position={[3.15, top + 0.06, -0.05]}>
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
            <meshStandardMaterial color="#c98f5a" roughness={0.75} />
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
      {/* plants on top of the fridge and trailing from the ceiling */}
      {[2.7, 3.0, 3.3].map((x) => (
        <Leafy key={x} p={[x, 2.42, -0.97]} s={1.2} />
      ))}
      {[[2.9, 3.35, 1.15], [0.75, 3.35, 1.1], [1.6, 3.35, -0.9]].map((p, i) => (
        <Leafy key={i} p={p} s={1.4} hang />
      ))}

      {/* double glass drinks fridge */}
      <group position={[(FRIDGE.x0 + FRIDGE.x1) / 2, F, (FRIDGE.z0 + FRIDGE.z1) / 2]}>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[fw, 1.8, FRIDGE.z1 - FRIDGE.z0]} />
          <meshStandardMaterial color="#141517" metalness={0.6} roughness={0.4} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[(s * fw) / 4, 0, 0]}>
            <mesh position={[0, 0.95, 0.296]}>
              <planeGeometry args={[fw / 2 - 0.07, 1.55]} />
              <meshStandardMaterial color="#cfefff" emissive="#d8f3ff" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
            {[0.35, 0.7, 1.05, 1.4].map((y, r) =>
              [-0.13, -0.04, 0.05, 0.14].map((x, i) => (
                <Bottle key={`${r}${i}`} m={m} i={r + i + (s > 0 ? 1 : 0)} p={[x * 0.95, y - 0.05, 0.25]} h={0.16} />
              ))
            )}
            <mesh position={[0, 0.95, 0.305]}>
              <planeGeometry args={[fw / 2 - 0.05, 1.58]} />
              <meshStandardMaterial color="#e8f6ff" transparent opacity={0.12} roughness={0.02} metalness={0.5} depthWrite={false} />
            </mesh>
            <mesh position={[s * -0.18, 0.95, 0.33]}>
              <boxGeometry args={[0.02, 0.4, 0.02]} />
              <meshStandardMaterial color="#9aa0a6" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.95, 0.31]}>
          <boxGeometry args={[0.03, 1.6, 0.03]} />
          <meshStandardMaterial color="#141517" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.79, 0.305]}>
          <planeGeometry args={[fw - 0.05, 0.05]} />
          <meshStandardMaterial color="#fff" emissive={C.ice} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </group>

      <pointLight position={[1.9, 3.05, 0.4]} color="#ffcf9a" intensity={4.5} distance={4.5} decay={1.5} />
      {Q.fullLights && <pointLight position={[3.0, 1.5, 0.1]} color="#cfefff" intensity={1.6} distance={2.4} decay={1.5} />}
    </group>
  );
}
