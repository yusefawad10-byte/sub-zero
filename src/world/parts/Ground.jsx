import { MeshReflectorMaterial } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../../quality';
import { useSet } from '../textures';

const SIZE = 140;

function Bays() {
  // painted parking bays: two rows of lines in front of and behind the truck
  const mesh = useMemo(() => {
    const lines = [];
    for (let x = -22; x <= 22; x += 2.7) {
      if (Math.abs(x) < 9) continue;
      lines.push([x, 15.5, 0.1, 5]);
    }
    for (let x = -21.6; x <= 21.6; x += 2.7) lines.push([x, -8.5, 0.1, 5]);
    lines.push([0, 13, 44, 0.1]);
    lines.push([0, -6, 44, 0.1]);
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: '#d9d3c4',
      roughness: 0.55,
      transparent: true,
      opacity: 0.72,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const im = new THREE.InstancedMesh(geo, mat, lines.length);
    const o = new THREE.Object3D();
    lines.forEach(([x, z, w, d], i) => {
      o.position.set(x, 0.006, z);
      o.rotation.set(-Math.PI / 2, 0, 0);
      o.scale.set(w, d, 1);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    });
    im.receiveShadow = true;
    return im;
  }, []);
  return <primitive object={mesh} />;
}

export default function Ground() {
  const asphalt = useSet('asphalt_02', 36);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        {Q.reflections ? (
          <MeshReflectorMaterial
            {...asphalt}
            color="#6c727a"
            roughness={1}
            metalness={0.35}
            normalScale={new THREE.Vector2(0.6, 0.6)}
            blur={[420, 140]}
            resolution={1024}
            mixBlur={1}
            mixStrength={2.4}
            mixContrast={1}
            depthScale={0.9}
            minDepthThreshold={0.35}
            maxDepthThreshold={1.3}
            mirror={0}
            envMapIntensity={0.6}
          />
        ) : (
          <meshStandardMaterial
            {...asphalt}
            color="#5b6068"
            roughness={0.7}
            metalness={0.3}
            envMapIntensity={0.9}
          />
        )}
      </mesh>
      <Bays />
    </group>
  );
}
