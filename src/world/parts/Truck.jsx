import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { BOX, PANEL } from '../layout';
import { useSet } from '../textures';
import { backLetteringTexture, logoTexture, sideLetteringTexture, signTexture } from '../canvasTextures';
import { Spot } from './bits';

function Wheel({ position }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.34, 28]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.92} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, s * 0.172, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.02, 24]} />
            <meshStandardMaterial color="#8d9399" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, s * 0.012, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.03, 10]} />
            <meshStandardMaterial color="#4a4f54" metalness={0.8} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Speaker box mounted on the corner of the truck, as in the renders.
function WallSpeaker({ position, rot = 0 }) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh>
        <boxGeometry args={[0.4, 0.6, 0.34]} />
        <meshStandardMaterial color="#121314" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.08, 0.171]}>
        <circleGeometry args={[0.14, 24]} />
        <meshStandardMaterial color="#26282a" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.18, 0.171]}>
        <circleGeometry args={[0.05, 16]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.2, -0.3]}>
        <boxGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial color="#222" metalness={0.6} />
      </mesh>
    </group>
  );
}

export default function Truck() {
  const cedar = useSet('wood_planks', 2, 1.2);
  const floor = useSet('dark_wooden_planks', 3, 1);

  const m = useMemo(() => {
    const paint = new THREE.MeshPhysicalMaterial({
      color: '#0c0d0e',
      roughness: 0.42,
      metalness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.18,
    });
    const glass = Q.transmission
      ? new THREE.MeshPhysicalMaterial({
          color: '#9fb4c2',
          roughness: 0.04,
          transmission: 0.9,
          thickness: 0.02,
          ior: 1.5,
          envMapIntensity: 1.5,
        })
      : new THREE.MeshStandardMaterial({ color: '#0d1820', roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.6 });
    const trim = new THREE.MeshStandardMaterial({ color: '#2a2d30', metalness: 0.7, roughness: 0.35 });
    const chrome = new THREE.MeshStandardMaterial({ color: '#9aa0a6', metalness: 0.95, roughness: 0.2 });
    const dark = new THREE.MeshStandardMaterial({ color: '#070808', roughness: 0.9 });
    const lens = new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#fff3df', emissiveIntensity: 3.5, toneMapped: false });
    const amber = new THREE.MeshStandardMaterial({ color: '#fa0', emissive: '#ffae3a', emissiveIntensity: 2.5, toneMapped: false });
    const tail = new THREE.MeshStandardMaterial({ color: '#300', emissive: '#ff2a1a', emissiveIntensity: 2.2, toneMapped: false });
    return { paint, glass, trim, chrome, dark, lens, amber, tail };
  }, []);

  const tex = useMemo(
    () => ({
      back: backLetteringTexture(),
      side: sideLetteringTexture(),
      logo: logoTexture(),
      sign: signTexture(),
    }),
    []
  );

  const cedarMat = <meshStandardMaterial {...cedar} color="#e0a472" roughness={0.85} envMapIntensity={0.4} />;
  const W = BOX.x1 - BOX.x0;
  const H = BOX.ceil - 0.45;
  const PW = PANEL.x1 - PANEL.x0;
  const PX = (PANEL.x0 + PANEL.x1) / 2;

  return (
    <group>
      {/* ---------- cargo box shell ---------- */}
      <mesh material={m.paint} position={[0, 0.45 + H / 2 + 0.075, -1.35]}>
        <boxGeometry args={[W + 0.2, H + 0.15, 0.1]} />
      </mesh>
      {[BOX.x0 - 0.05, BOX.x1 + 0.05].map((x) => (
        <mesh key={x} material={m.paint} position={[x, 0.45 + H / 2 + 0.075, -0.05]}>
          <boxGeometry args={[0.1, H + 0.15, 2.7]} />
        </mesh>
      ))}
      <mesh material={m.paint} position={[0, BOX.ceil + 0.08, -0.05]}>
        <boxGeometry args={[W + 0.2, 0.16, 2.7]} />
      </mesh>
      {/* closed side panel with the big lettering */}
      <mesh material={m.paint} position={[PX - 0.05, 0.45 + H / 2 + 0.075, 1.3]}>
        <boxGeometry args={[PW + 0.1, H + 0.15, 0.1]} />
      </mesh>
      <mesh position={[PX + 0.02, 2.15, 1.356]}>
        <planeGeometry args={[1.75, 1.54]} />
        <meshStandardMaterial map={tex.side} transparent roughness={0.4} emissive="#ffffff" emissiveMap={tex.side} emissiveIntensity={0.1} />
      </mesh>
      <WallSpeaker position={[PANEL.x0 + 0.35, 3.0, 1.55]} />
      <WallSpeaker position={[BOX.x1 - 0.3, 2.85, 1.55]} />
      {/* header beam and corner posts of the opening */}
      <mesh material={m.trim} position={[0, BOX.ceil - 0.06, 1.28]}>
        <boxGeometry args={[W + 0.2, 0.14, 0.06]} />
      </mesh>
      <mesh material={m.paint} position={[BOX.x1 - 0.04, 2.0, 1.28]}>
        <boxGeometry args={[0.12, 2.9, 0.08]} />
      </mesh>
      {/* floor slab + chassis */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[W, 0.15, 2.6]} />
        <meshStandardMaterial color="#1a1b1c" roughness={0.8} />
      </mesh>
      <mesh material={m.dark} position={[-0.8, 0.3, 0]}>
        <boxGeometry args={[9.2, 0.25, 1.9]} />
      </mesh>

      {/* ---------- interior lining ---------- */}
      <mesh position={[0, 0.601, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, 2.6]} />
        <meshStandardMaterial {...floor} color="#6d5442" roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.0, -1.295]}>
        <planeGeometry args={[W, 2.8]} />
        <meshStandardMaterial color="#141516" roughness={0.6} />
      </mesh>
      <mesh position={[BOX.x1 - 0.005, 2.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 2.8]} />
        <meshStandardMaterial color="#141516" roughness={0.6} />
      </mesh>
      <mesh position={[0, BOX.ceil - 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, 2.6]} />
        {cedarMat}
      </mesh>
      {/* ceiling downlights */}
      {[0.9, 2.0, 3.1].map((x) =>
        [-0.4, 0.6].map((z) => (
          <mesh key={`${x}${z}`} position={[x, BOX.ceil - 0.012, z]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.05, 16]} />
            <meshStandardMaterial color="#fff" emissive="#ffd9a8" emissiveIntensity={4} toneMapped={false} />
          </mesh>
        ))
      )}
      {/* sign panel high on the end wall above the bar */}
      <mesh position={[BOX.x1 - 0.02, 3.0, 0.7]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.39]} />
        <meshStandardMaterial map={tex.sign} roughness={0.6} emissive="#ffffff" emissiveMap={tex.sign} emissiveIntensity={0.18} />
      </mesh>

      {/* ---------- lettering on the rear and the far side ---------- */}
      <mesh position={[BOX.x1 + 0.105, 2.15, -0.05]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.5, 1.25]} />
        <meshStandardMaterial map={tex.back} transparent roughness={0.5} emissive="#ffffff" emissiveMap={tex.back} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[BOX.x1 + 0.105, 1.15, -0.05]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial map={tex.logo} transparent roughness={0.5} />
      </mesh>
      <mesh position={[0.6, 2.15, -1.405]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.6, 2.3]} />
        <meshStandardMaterial map={tex.back} transparent roughness={0.5} emissive="#ffffff" emissiveMap={tex.back} emissiveIntensity={0.08} />
      </mesh>
      {[-1.05, 0.95].map((z) => (
        <mesh key={z} material={m.tail} position={[BOX.x1 + 0.11, 0.75, z]}>
          <boxGeometry args={[0.03, 0.14, 0.32]} />
        </mesh>
      ))}

      {/* ---------- cab on the left (mirrored so it faces -x) ---------- */}
      <group scale={[-1, 1, 1]}>
        <RoundedBox args={[2.35, 1.6, 2.72]} radius={0.22} smoothness={4} position={[4.85, 1.28, 0]} material={m.paint} />
        <RoundedBox args={[1.8, 1.25, 2.62]} radius={0.34} smoothness={4} position={[4.55, 2.5, 0]} material={m.paint} />
        {/* roof fairing up to the box */}
        <mesh material={m.paint} position={[3.95, 3.25, 0]} rotation={[0, 0, 0.45]}>
          <boxGeometry args={[0.9, 0.12, 2.5]} />
        </mesh>
        <group position={[5.7, 2.55, 0]} rotation={[0, 0, 0.42]}>
          <mesh material={m.glass} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[2.36, 1.2]} />
          </mesh>
        </group>
        <mesh material={m.dark} position={[5.55, 2.12, 0]}>
          <boxGeometry args={[0.5, 0.22, 2.4]} />
        </mesh>
        {[-0.6, 0.6].map((z) => (
          <mesh key={z} material={m.dark} position={[4.4, 2.4, z]}>
            <boxGeometry args={[0.35, 0.8, 0.55]} />
          </mesh>
        ))}
        {[-1, 1].map((s) => (
          <mesh key={s} material={m.glass} position={[4.85, 2.6, s * 1.316]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[1.05, 0.75]} />
          </mesh>
        ))}
        {/* grille, bumper, lights */}
        <mesh material={m.trim} position={[6.03, 1.3, 0]}>
          <boxGeometry args={[0.04, 0.5, 1.3]} />
        </mesh>
        {[-0.15, 0, 0.15].map((y) => (
          <mesh key={y} material={m.chrome} position={[6.055, 1.3 + y, 0]}>
            <boxGeometry args={[0.01, 0.025, 1.24]} />
          </mesh>
        ))}
        <mesh material={m.trim} position={[6.02, 0.62, 0]}>
          <boxGeometry args={[0.22, 0.28, 2.66]} />
        </mesh>
        {[-0.98, 0.98].map((z) => (
          <group key={z}>
            <mesh material={m.lens} position={[6.02, 1.08, z]}>
              <boxGeometry args={[0.04, 0.24, 0.44]} />
            </mesh>
            <mesh material={m.amber} position={[6.02, 0.82, z * 1.05]}>
              <boxGeometry args={[0.04, 0.07, 0.22]} />
            </mesh>
          </group>
        ))}
        {Q.fullLights &&
          [-0.98, 0.98].map((z) => (
            <Spot
              key={z}
              position={[6.1, 1.08, z]}
              target={[12, 0, z * 1.6]}
              color="#fff1dc"
              intensity={18}
              distance={18}
              angle={0.45}
              penumbra={0.6}
              decay={1.6}
            />
          ))}
        {[-1, 1].map((s) => (
          <group key={s} position={[5.35, 2.3, s * 1.37]}>
            <mesh material={m.trim} position={[0, 0, s * 0.12]}>
              <boxGeometry args={[0.04, 0.04, 0.26]} />
            </mesh>
            <mesh material={m.paint} position={[0, 0.02, s * 0.28]}>
              <boxGeometry args={[0.08, 0.4, 0.16]} />
            </mesh>
          </group>
        ))}
        {/* step under the door */}
        {[-1, 1].map((s) => (
          <mesh key={s} material={m.trim} position={[4.6, 0.55, s * 1.4]}>
            <boxGeometry args={[0.6, 0.05, 0.14]} />
          </mesh>
        ))}
        <Wheel position={[4.95, 0.5, 1.12]} />
        <Wheel position={[4.95, 0.5, -1.12]} />
      </group>
      {/* SZ circle on both cab doors (outside the mirror so the letters read right) */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-4.65, 1.45, s * 1.366]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[0.82, 0.82]} />
          <meshStandardMaterial map={tex.logo} transparent roughness={0.45} emissive="#ffffff" emissiveMap={tex.logo} emissiveIntensity={0.15} />
        </mesh>
      ))}

      {/* ---------- rear wheels ---------- */}
      {[1.5, 2.55].map((x) => [-1.12, 1.12].map((z) => <Wheel key={`${x}${z}`} position={[x, 0.5, z]} />))}
    </group>
  );
}
