import { useProgress } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Q } from '../quality';
import { setState } from '../store';
import Effects from './Effects';
import Player from './Player';
import Interact from './Interact';
import Scene, { Backdrop } from './Scene';

function ProgressReporter() {
  const { progress } = useProgress();
  useEffect(() => {
    setState((s) => (s.loaded ? null : { progress: Math.max(s.progress, Math.round(14 + progress * 0.84)) }));
  }, [progress]);
  return null;
}

function Ready() {
  useEffect(() => {
    // give the GPU a moment to compile shaders before revealing
    const id = setTimeout(() => setState({ progress: 100, loaded: true }), 250);
    return () => clearTimeout(id);
  }, []);
  return null;
}

// Canvas text needs the web fonts in place before it is drawn.
function useFonts() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let done = false;
    const finish = () => !done && ((done = true), setOk(true));
    Promise.all([
      document.fonts.load('64px "Archivo Black"'),
      document.fonts.load('600 32px Inter'),
      document.fonts.load('500 32px Inter'),
    ])
      .then(finish)
      .catch(finish);
    const id = setTimeout(finish, 2500);
    return () => clearTimeout(id);
  }, []);
  return ok;
}

export default function World({ active }) {
  const fonts = useFonts();
  return (
    <>
      <ProgressReporter />
      <Canvas
        className="world-canvas"
        shadows={Q.shadows}
        dpr={[1, Q.dpr]}
        flat
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 62, near: 0.05, far: 500, position: [0, 2.3, 11.8] }}
        onCreated={(state) => {
          state.gl.toneMapping = THREE.NoToneMapping;
          if (import.meta.env.DEV && window.__sz) window.__sz.r3f = state;
        }}
      >
        <color attach="background" args={['#04070b']} />
        <fog attach="fog" args={['#0b1119', 16, 95]} />
        {fonts && <Backdrop />}
        <Suspense fallback={null}>
          {fonts && (
            <>
              <Scene />
              <Ready />
            </>
          )}
        </Suspense>
        <Player />
        <Interact />
        <Effects />
      </Canvas>
    </>
  );
}
