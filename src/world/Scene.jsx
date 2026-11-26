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
function ShadowSetup() {
  const { scene } = useThree();
  useEffect(() => {
    if (!Q.shadows) return;
    scene.traverse((o) => {
      if (!o.isMesh || o.userData.noShadow) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || m.transparent || m.isShaderMaterial) return;
      const emissive = m.emissiveIntensity > 1;
      o.castShadow = !emissive;
      o.receiveShadow = true;
    });
  }, [scene]);
  return null;
}

export default function Scene() {
  return (
    <>
      <Environment />
      <hemisphereLight args={['#2b3a55', '#0d0b08', 0.35]} />
      <Moonlight />
      <Ground />
      <Truck />
      <Deck />
      <Awning />
      <IceTubs />
      <Sauna />
      <Cafe />
      <Bar />
      <Chalkboard />
      <MidTruck />
      <StretchTable />
      <DjBooth />
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
