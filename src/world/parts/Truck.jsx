import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { BOX, PANEL } from '../layout';
import { useSet } from '../textures';
import { backLetteringTexture, logoTexture, sideLetteringTexture, signTexture } from '../canvasTextures';
import { Spot } from './bits';

// The shell, cab, chassis and wheels come from Blender (blender/build_truck.py -> truck.glb).
// Lettering, logos, the interior lining and lights are added here on top.
const MODEL = 'static/models/truck.glb';

function useTruckModel() {
  const { scene } = useGLTF(MODEL);
  return useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material;
      if (m.name === 'Glass' && !Q.transmission) {
        o.material = new THREE.MeshStandardMaterial({
          color: '#0d1820',
          roughness: 0.05,
          metalness: 0.9,
          transparent: true,
          opacity: 0.6,
        });
      } else if (m.name === 'Paint') {
        m.envMapIntensity = 1.3;
      } else if (m.name === 'Chrome' || m.name === 'Alu') {
        m.envMapIntensity = 1.6;
      }
      o.castShadow = !['Glass', 'Lens', 'Amber', 'Tail'].includes(m.name);
      o.receiveShadow = true;
    });
    return root;
  }, [scene]);
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
  const model = useTruckModel();
  const cedar = useSet('wood_planks', 2, 1.2);
  const floor = useSet('dark_wooden_planks', 3, 1);

  const tex = useMemo(
    () => ({
      back: backLetteringTexture(),
      side: sideLetteringTexture(),
      logo: logoTexture(),
      sign: signTexture(),
    }),
    []
  );

  const W = BOX.x1 - BOX.x0;
  const PX = (PANEL.x0 + PANEL.x1) / 2;

  return (
    <group>
      <primitive object={model} />

      {/* big SUB / ZERO lettering on the closed panel, speakers on the corners */}
      <mesh position={[PX + 0.02, 2.15, 1.356]}>
        <planeGeometry args={[1.75, 1.54]} />
        <meshStandardMaterial map={tex.side} transparent roughness={0.4} emissive="#ffffff" emissiveMap={tex.side} emissiveIntensity={0.1} />
      </mesh>
      <WallSpeaker position={[PANEL.x0 + 0.35, 3.0, 1.55]} />
      <WallSpeaker position={[BOX.x1 - 0.3, 2.85, 1.55]} />

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
        <meshStandardMaterial {...cedar} color="#5a3d29" roughness={0.7} envMapIntensity={0.4} />
      </mesh>
      {[0.9, 2.0, 3.1].map((x) =>
        [-0.4, 0.6].map((z) => (
          <mesh key={`${x}${z}`} position={[x, BOX.ceil - 0.012, z]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.05, 16]} />
            <meshStandardMaterial color="#fff" emissive="#ffd9a8" emissiveIntensity={4} toneMapped={false} />
          </mesh>
        ))
      )}
      <mesh position={[BOX.x1 - 0.02, 3.0, 0.7]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.39]} />
        <meshStandardMaterial map={tex.sign} roughness={0.6} emissive="#ffffff" emissiveMap={tex.sign} emissiveIntensity={0.18} />
      </mesh>

      {/* ---------- lettering on the rear and the far side ---------- */}
      <mesh position={[BOX.x1 + 0.135, 2.35, -0.05]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.3, 1.15]} />
        <meshStandardMaterial map={tex.back} transparent roughness={0.5} emissive="#ffffff" emissiveMap={tex.back} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0.6, 2.15, -1.405]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[4.6, 2.3]} />
        <meshStandardMaterial map={tex.back} transparent roughness={0.5} emissive="#ffffff" emissiveMap={tex.back} emissiveIntensity={0.08} />
      </mesh>

      {/* SZ circle on both cab doors */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-4.85, 1.6, s * 1.312]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[0.7, 0.7]} />
          <meshStandardMaterial map={tex.logo} transparent roughness={0.45} emissive="#ffffff" emissiveMap={tex.logo} emissiveIntensity={0.15} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}

      {/* headlight beams */}
      {Q.fullLights &&
        [-0.96, 0.96].map((z) => (
          <Spot
            key={z}
            position={[-6.3, 1.1, z]}
            target={[-14, 0, z * 1.6]}
            color="#fff1dc"
            intensity={18}
            distance={18}
            angle={0.45}
            penumbra={0.6}
            decay={1.6}
          />
        ))}
    </group>
  );
}

useGLTF.preload(MODEL);
