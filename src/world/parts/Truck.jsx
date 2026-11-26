import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { BOX } from '../layout';
import { useSet } from '../textures';
import { backLetteringTexture, logoTexture, signTexture } from '../canvasTextures';
import { Spot } from './bits';

function Wheel({ position }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.48, 0.48, 0.32, 28]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.92} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, s * 0.165, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.02, 20]} />
          <meshStandardMaterial color="#6d7378" metalness={0.85} roughness={0.32} />
        </mesh>
      ))}
    </group>
  );
}

export default function Truck() {
  const cedar = useSet('wood_planks', 2, 1.2);
  const floor = useSet('dark_wooden_planks', 3, 1);

  const m = useMemo(() => {
    const paint = new THREE.MeshPhysicalMaterial({
      color: '#0e1011',
      roughness: 0.62,
      metalness: 0.15,
      clearcoat: 0.55,
      clearcoatRoughness: 0.3,
    });
    const glass = Q.transmission
      ? new THREE.MeshPhysicalMaterial({
          color: '#9fb4c2',
          roughness: 0.04,
          metalness: 0,
          transmission: 0.92,
          thickness: 0.02,
          ior: 1.5,
          envMapIntensity: 1.5,
        })
      : new THREE.MeshStandardMaterial({
          color: '#0d1820',
          roughness: 0.05,
          metalness: 0.9,
          transparent: true,
          opacity: 0.55,
        });
    const trim = new THREE.MeshStandardMaterial({ color: '#2a2d30', metalness: 0.7, roughness: 0.35 });
    const dark = new THREE.MeshStandardMaterial({ color: '#070808', roughness: 0.9 });
    const lens = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#fff6e6',
      emissiveIntensity: 3.2,
      toneMapped: false,
    });
    const tail = new THREE.MeshStandardMaterial({
      color: '#300',
      emissive: '#ff2a1a',
      emissiveIntensity: 2.2,
      toneMapped: false,
    });
    return { paint, glass, trim, dark, lens, tail };
  }, []);

  const tex = useMemo(
    () => ({
      back: backLetteringTexture(),
      logo: logoTexture(),
      sign: signTexture(),
    }),
    []
  );

  const cedarMat = (
    <meshStandardMaterial {...cedar} color="#e0a472" roughness={0.85} envMapIntensity={0.4} />
  );
  const W = BOX.x1 - BOX.x0;
  const H = BOX.ceil - 0.45;

  return (
    <group>
      {/* ---------- cargo box shell ---------- */}
      <mesh material={m.paint} position={[0, 0.45 + H / 2 + 0.075, -1.35]}>
        <boxGeometry args={[W + 0.2, H + 0.15, 0.1]} />
      </mesh>
      <mesh material={m.paint} position={[BOX.x0 - 0.05, 0.45 + H / 2 + 0.075, -0.05]}>
        <boxGeometry args={[0.1, H + 0.15, 2.7]} />
      </mesh>
      <mesh material={m.paint} position={[BOX.x1 + 0.05, 0.45 + H / 2 + 0.075, -0.05]}>
        <boxGeometry args={[0.1, H + 0.15, 2.7]} />
      </mesh>
      <mesh material={m.paint} position={[0, BOX.ceil + 0.08, -0.05]}>
        <boxGeometry args={[W + 0.2, 0.16, 2.7]} />
      </mesh>
      {/* header beam over the opening */}
      <mesh material={m.trim} position={[0, BOX.ceil - 0.06, 1.28]}>
        <boxGeometry args={[W + 0.2, 0.14, 0.06]} />
      </mesh>
      {/* floor slab + chassis */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[W, 0.15, 2.6]} />
        <meshStandardMaterial color="#1a1b1c" roughness={0.8} />
      </mesh>
      <mesh material={m.dark} position={[0.8, 0.3, 0]}>
        <boxGeometry args={[9.2, 0.25, 1.9]} />
      </mesh>

      {/* ---------- interior lining ---------- */}
      <mesh position={[0, 0.601, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, 2.6]} />
        <meshStandardMaterial {...floor} color="#8a6a52" roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.0, -1.295]}>
        <planeGeometry args={[W, 2.8]} />
        {cedarMat}
      </mesh>
      <mesh position={[BOX.x0 + 0.005, 2.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 2.8]} />
        {cedarMat}
      </mesh>
      <mesh position={[BOX.x1 - 0.005, 2.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 2.8]} />
        {cedarMat}
      </mesh>
      <mesh position={[0, BOX.ceil - 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, 2.6]} />
        <meshStandardMaterial {...cedar} color="#c98d5e" roughness={0.9} />
      </mesh>
      {/* ceiling downlights */}
      {[-2.6, -0.9, 0.8, 2.5].map((x) =>
        [-0.5, 0.6].map((z) => (
          <mesh key={`${x}${z}`} position={[x, BOX.ceil - 0.012, z]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.05, 16]} />
            <meshStandardMaterial color="#fff" emissive="#ffd9a8" emissiveIntensity={4} toneMapped={false} />
          </mesh>
        ))
      )}
      {/* sign panel on the end wall above the bar */}
      <mesh position={[BOX.x1 - 0.02, 2.95, 0.45]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 0.49]} />
        <meshStandardMaterial map={tex.sign} roughness={0.6} emissive="#ffffff" emissiveMap={tex.sign} emissiveIntensity={0.18} />
      </mesh>

      {/* ---------- lettering outside ---------- */}
      <mesh position={[BOX.x0 - 0.105, 2.15, -0.05]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.5, 1.25]} />
        <meshStandardMaterial map={tex.back} transparent roughness={0.5} emissive="#ffffff" emissiveMap={tex.back} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[BOX.x0 - 0.105, 1.15, -0.05]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial map={tex.logo} transparent roughness={0.5} />
      </mesh>
      <mesh position={[-0.6, 2.15, -1.405]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.6, 2.3]} />
        <meshStandardMaterial map={tex.back} transparent roughness={0.5} emissive="#ffffff" emissiveMap={tex.back} emissiveIntensity={0.08} />
      </mesh>
      {/* tail lights */}
      {[-1.05, 0.95].map((z) => (
        <mesh key={z} material={m.tail} position={[BOX.x0 - 0.11, 0.75, z]}>
          <boxGeometry args={[0.03, 0.14, 0.32]} />
        </mesh>
      ))}

      {/* ---------- cab ---------- */}
      <RoundedBox args={[2.3, 1.55, 2.72]} radius={0.2} smoothness={4} position={[4.85, 1.25, 0]} material={m.paint} />
      <RoundedBox args={[1.75, 1.15, 2.62]} radius={0.28} smoothness={4} position={[4.55, 2.45, 0]} material={m.paint} />
      {/* windshield */}
      <group position={[5.66, 2.5, 0]} rotation={[0, 0, 0.5]}>
        <mesh material={m.glass} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.4, 1.16]} />
        </mesh>
      </group>
      {/* dashboard and seats seen through the glass */}
      <mesh material={m.dark} position={[5.55, 2.1, 0]}>
        <boxGeometry args={[0.5, 0.22, 2.4]} />
      </mesh>
      {[-0.6, 0.6].map((z) => (
        <mesh key={z} material={m.dark} position={[4.4, 2.35, z]}>
          <boxGeometry args={[0.35, 0.8, 0.55]} />
        </mesh>
      ))}
      {/* side windows */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.glass} position={[4.75, 2.55, s * 1.315]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[1.1, 0.72]} />
        </mesh>
      ))}
      {/* SZ logo on both doors */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[4.6, 1.35, s * 1.365]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[0.78, 0.78]} />
          <meshStandardMaterial map={tex.logo} transparent roughness={0.45} />
        </mesh>
      ))}
      {/* grille, bumper, headlights */}
      <mesh material={m.trim} position={[6.01, 1.25, 0]}>
        <boxGeometry args={[0.04, 0.42, 1.2]} />
      </mesh>
      <mesh material={m.trim} position={[6.0, 0.62, 0]}>
        <boxGeometry args={[0.2, 0.24, 2.6]} />
      </mesh>
      {[-0.95, 0.95].map((z) => (
        <mesh key={z} material={m.lens} position={[6.0, 1.05, z]}>
          <boxGeometry args={[0.04, 0.2, 0.42]} />
        </mesh>
      ))}
      {Q.fullLights &&
        [-0.95, 0.95].map((z) => (
          <Spot
            key={z}
            position={[6.1, 1.05, z]}
            target={[12, 0, z * 1.6]}
            color="#fff1dc"
            intensity={18}
            distance={18}
            angle={0.45}
            penumbra={0.6}
            decay={1.6}
          />
        ))}
      {/* mirrors */}
      {[-1, 1].map((s) => (
        <group key={s} position={[5.3, 2.25, s * 1.36]}>
          <mesh material={m.trim} position={[0, 0, s * 0.12]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.26]} />
          </mesh>
          <mesh material={m.paint} position={[0, 0.05, s * 0.28]}>
            <boxGeometry args={[0.08, 0.32, 0.16]} />
          </mesh>
        </group>
      ))}

      {/* ---------- wheels ---------- */}
      {[-2.55, -1.5, 4.9].map((x) =>
        [-1.12, 1.12].map((z) => <Wheel key={`${x}${z}`} position={[x, 0.48, z]} />)
      )}
    </group>
  );
}
