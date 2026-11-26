import { useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

const base = 'static/tex/';

// Poly Haven CC0 sets: diffuse + normal (GL) + roughness, 1k JPG.
export function useSet(name, rx = 1, ry = rx) {
  const t = useTexture({
    map: `${base}${name}_diff.jpg`,
    normalMap: `${base}${name}_nor.jpg`,
    roughnessMap: `${base}${name}_rough.jpg`,
  });
  return useMemo(() => {
    const out = {};
    for (const k of Object.keys(t)) {
      const c = t[k].clone();
      c.wrapS = c.wrapT = THREE.RepeatWrapping;
      c.repeat.set(rx, ry);
      c.colorSpace = k === 'map' ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      c.anisotropy = 8;
      c.needsUpdate = true;
      out[k] = c;
    }
    return out;
  }, [t, rx, ry]);
}
