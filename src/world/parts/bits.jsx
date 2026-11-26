import { useMemo } from 'react';
import * as THREE from 'three';

// A cylinder running between two points.
export function Rod({ from, to, r = 0.02, color = '#888', metalness = 0.8, roughness = 0.3, material, segments = 8 }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { pos: a.add(b).multiplyScalar(0.5), quat, len };
  }, [from, to]);
  return (
    <mesh position={pos} quaternion={quat} material={material}>
      <cylinderGeometry args={[r, r, len, segments]} />
      {!material && <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />}
    </mesh>
  );
}

// A spotlight whose target is part of the scene, so it points where you say.
export function Spot({ position, target, lightRef, ...props }) {
  const t = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(...target);
    return o;
  }, [target]);
  return (
    <>
      <primitive object={t} />
      <spotLight ref={lightRef} position={position} target={t} {...props} />
    </>
  );
}
