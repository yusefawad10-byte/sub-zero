import { useLoader, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Q } from '../quality';
import AFrame from './parts/AFrame';
import Awning from './parts/Awning';
import Bar from './parts/Bar';
import Cafe from './parts/Cafe';
import Chalkboard from './parts/Chalkboard';
import Deck from './parts/Deck';
import DjBooth from './parts/DjBooth';
import Festoons from './parts/Festoons';
import Ground from './parts/Ground';
import IceTubs from './parts/IceTubs';
import MidTruck from './parts/MidTruck';
import Palms from './parts/Palms';
import Sauna from './parts/Sauna';
import Sky, { MOON_DIR } from './parts/Sky';
import Skyline from './parts/Skyline';
import StreetLamps from './parts/StreetLamps';
import StretchTable from './parts/StretchTable';
import Truck from './parts/Truck';
import { Service } from './Interact';
import { ContactShadows } from '@react-three/drei';

// Poly Haven "modern_buildings_night", tonemapped JPG, as the environment map.
function Environment() {
  const tex = useLoader(THREE.TextureLoader, 'static/hdri/modern_buildings_night.jpg');
  const { scene } = useThree();
  useEffect(() => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    scene.environment = tex;
    scene.environmentIntensity = 0.45;
    return () => {
      scene.environment = null;
    };
  }, [tex, scene]);
  return null;
}

function Moonlight() {
  const { scene } = useThree();
  const { t, pos } = useMemo(() => {
    const t = new THREE.Object3D();
    t.position.set(0, 0, 1.5);
    return { t, pos: MOON_DIR.clone().multiplyScalar(40).add(t.position) };
  }, []);
  useEffect(() => {
    scene.add(t);
    return () => scene.remove(t);
  }, [scene, t]);
  return (
    <directionalLight
      position={pos}
      target={t}
      color="#9db4dc"
      intensity={0.55}
      castShadow={Q.shadows}
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-16}
      shadow-camera-right={16}
      shadow-camera-top={16}
      shadow-camera-bottom={-16}
      shadow-camera-near={5}
      shadow-camera-far={90}
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
      shadow-radius={4}
    />
  );
}

// Turn on shadows for solid meshes once everything is in.
// The scene is static, so shadows are drawn once (and redrawn a few times while things settle)
// instead of every frame, and only big objects cast them.
function ShadowSetup() {
  const { scene, gl } = useThree();
  useEffect(() => {
    if (!Q.shadows) return;
    const v = new THREE.Vector3();
    scene.traverse((o) => {
      if (!o.isMesh || o.userData.noShadow) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      o.receiveShadow = true;
      if (!m || m.transparent || m.isShaderMaterial || m.emissiveIntensity > 1) {
        o.castShadow = false;
        return;
      }
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      o.getWorldScale(v);
      o.castShadow = o.geometry.boundingSphere.radius * Math.max(v.x, v.y, v.z) > 0.45;
    });
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    const ids = [300, 1200, 3000].map((ms) => setTimeout(() => (gl.shadowMap.needsUpdate = true), ms));
    return () => {
      ids.forEach(clearTimeout);
      gl.shadowMap.autoUpdate = true;
    };
  }, [scene, gl]);
  return null;
}

export default function Scene() {
  return (
    <>
      <Environment />
      <hemisphereLight args={['#22304a', '#1a1008', 0.3]} />
      <Moonlight />
      <Ground />
      <Truck />
      <Deck />
      <Awning />
      <Service id="tubs">
        <IceTubs />
      </Service>
      <Service id="sauna">
        <Sauna />
      </Service>
      <Cafe />
      <Service id="bar">
        <Bar />
      </Service>
      <Chalkboard />
      <MidTruck />
      <Service id="stretch">
        <StretchTable />
      </Service>
      <Service id="dj">
        <DjBooth />
      </Service>
      {/* soft contact shadows under the deck furniture and the café */}
      <ContactShadows position={[0.8, 0.605, 1.2]} scale={[16, 8]} far={1.4} blur={2.2} opacity={0.55} resolution={512} frames={1} color="#000000" />
      <ContactShadows position={[0, 0.005, 3]} scale={[30, 20]} far={2.5} blur={2.6} opacity={0.6} resolution={512} frames={1} color="#000000" />
      <Palms />
      <Festoons />
      <StreetLamps />
      <AFrame />
      <ShadowSetup />
    </>
  );
}

// Parts that need no downloaded files: shown while the textures load.
export function Backdrop() {
  return (
    <>
      <Sky />
      <Skyline />
    </>
  );
}
