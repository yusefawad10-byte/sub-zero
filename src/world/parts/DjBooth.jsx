import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { beat } from '../../audio/music';
import { Q } from '../../quality';
import { C, logoTexture, makeWaveform } from '../canvasTextures';
import { DJ, SPEAKERS, SUB, UPLIGHTS } from '../layout';
import { Rod, Spot } from './bits';

const PAD_COLORS = ['#6FD3FF', '#E8B84A', '#C4472D', '#9b7bff'];

function Speaker({ x, z, rot, coneRef }) {
  const legs = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2;
    return [Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55];
  });
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {legs.map((p, i) => (
        <Rod key={i} from={p} to={[0, 0.85, 0]} r={0.015} color="#1a1a1a" />
      ))}
      <Rod from={[0, 0.8, 0]} to={[0, 1.6, 0]} r={0.022} color="#222" />
      <group position={[0, 1.95, 0]}>
        <mesh>
          <boxGeometry args={[0.46, 0.72, 0.4]} />
          <meshStandardMaterial color="#121314" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.2, 0.201]}>
          <boxGeometry args={[0.24, 0.1, 0.01]} />
          <meshStandardMaterial color="#050505" roughness={0.4} />
        </mesh>
        <group ref={coneRef} position={[0, -0.1, 0.2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.17, 0.08, 28, 1, true]} />
            <meshStandardMaterial color="#2a2b2d" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.045, 16]} />
            <meshStandardMaterial color="#444" roughness={0.4} metalness={0.4} />
          </mesh>
        </group>
        <mesh position={[0, -0.33, 0.202]}>
          <planeGeometry args={[0.05, 0.015]} />
          <meshStandardMaterial color="#fff" emissive="#7cff9a" emissiveIntensity={3} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

export default function DjBooth() {
  const logo = useMemo(() => logoTexture({ ring: C.ice, text: C.cream }), []);
  const wave = useMemo(() => makeWaveform(), []);
  const jogs = useRef([]);
  const pads = useRef([]);
  const cones = useRef([]);
  const subCone = useRef();
  const ups = useRef([]);
  const upLens = useRef([]);
  const logoMat = useRef();
  const frame = useRef(0);
  const tmp = useMemo(() => new THREE.Color(), []);

  const padMats = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const c = PAD_COLORS[i % 4];
        return new THREE.MeshStandardMaterial({ color: '#111', emissive: c, emissiveIntensity: 0.4, toneMapped: false });
      }),
    []
  );

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime;
    const { b, pulse } = beat();
    const step = Math.floor(b * 2);
    jogs.current.forEach((j, i) => j && (j.rotation.y += dt * (i ? -3.2 : 3.2)));
    padMats.forEach((m, i) => {
      const on = (i * 7 + step) % 5 === 0 || (i % 4 === step % 4 && pulse > 0.5);
      m.emissiveIntensity = on ? 2.5 + pulse * 2 : 0.25;
    });
    const pump = 1 + pulse * 0.35;
    cones.current.forEach((c) => c && c.scale.set(1, 1, pump));
    if (subCone.current) subCone.current.scale.set(1 + pulse * 0.05, 1 + pulse * 0.05, 1 + pulse * 0.6);
    UPLIGHTS.forEach((_, i) => {
      tmp.setHSL((t * 0.04 + i * 0.5) % 1, 0.85, 0.55);
      const L = ups.current[i];
      if (L) {
        L.color.copy(tmp);
        L.intensity = (Q.fullLights ? 26 : 20) * (0.45 + 0.55 * pulse);
      }
      const lens = upLens.current[i];
      if (lens) {
        lens.emissive.copy(tmp);
        lens.emissiveIntensity = 2 + pulse * 3;
      }
    });
    if (logoMat.current) logoMat.current.emissiveIntensity = 1.6 + pulse * 0.9;
    frame.current++;
    if (frame.current % 3 === 0) wave.draw(t, pulse);
  });

  return (
    <group>
      <group position={[DJ.x, 0, DJ.z]}>
        {/* black-clothed table */}
        <mesh position={[0, 0.47, 0]}>
          <boxGeometry args={[1.85, 0.94, 0.75]} />
          <meshStandardMaterial color="#09090a" roughness={1} />
        </mesh>
        <mesh position={[0, 0.955, 0]}>
          <boxGeometry args={[1.9, 0.03, 0.8]} />
          <meshStandardMaterial color="#0d0d0e" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.55, 0.381]}>
          <planeGeometry args={[0.62, 0.62]} />
          <meshStandardMaterial ref={logoMat} map={logo} transparent emissive="#ffffff" emissiveMap={logo} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>

        {/* controller */}
        <group position={[0, 0.97, 0.02]}>
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[0.76, 0.05, 0.42]} />
            <meshStandardMaterial color="#141516" roughness={0.5} metalness={0.3} />
          </mesh>
          {[-0.22, 0.22].map((x, i) => (
            <group key={x} position={[x, 0.065, -0.03]} ref={(g) => (jogs.current[i] = g)}>
              <mesh>
                <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
                <meshStandardMaterial color="#2b2d30" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0.06, 0.012, 0]}>
                <boxGeometry args={[0.06, 0.004, 0.008]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1.5} toneMapped={false} />
              </mesh>
            </group>
          ))}
          {padMats.map((m, i) => {
            const side = i < 8 ? -1 : 1;
            const k = i % 8;
            return (
              <mesh
                key={i}
                material={m}
                ref={(r) => (pads.current[i] = r)}
                position={[side * 0.22 + ((k % 4) - 1.5) * 0.045, 0.058, 0.13 + Math.floor(k / 4) * 0.045]}
              >
                <boxGeometry args={[0.036, 0.01, 0.036]} />
              </mesh>
            );
          })}
          {/* mixer faders */}
          {[-0.04, 0, 0.04].map((x) => (
            <mesh key={x} position={[x, 0.06, 0.05]}>
              <boxGeometry args={[0.012, 0.012, 0.12]} />
              <meshStandardMaterial color="#777" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* laptop on a stand, screen to the DJ */}
        <group position={[0.68, 0.97, -0.05]} rotation={[0, Math.PI + 0.35, 0]}>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.05, 0.16, 0.05]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, 0.17, 0]} rotation={[0.25, 0, 0]}>
            <boxGeometry args={[0.32, 0.012, 0.22]} />
            <meshStandardMaterial color="#9a9ea3" metalness={0.8} roughness={0.3} />
          </mesh>
          <group position={[0, 0.2, -0.12]} rotation={[-0.3, 0, 0]}>
            <mesh position={[0, 0.11, -0.004]}>
              <boxGeometry args={[0.32, 0.22, 0.008]} />
              <meshStandardMaterial color="#9a9ea3" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.11, 0.001]}>
              <planeGeometry args={[0.3, 0.19]} />
              <meshStandardMaterial map={wave.tex} emissive="#ffffff" emissiveMap={wave.tex} emissiveIntensity={1.3} toneMapped={false} />
            </mesh>
          </group>
        </group>

        {/* headphones */}
        <group position={[-0.68, 1.0, 0.05]} rotation={[Math.PI / 2, 0, 0.4]}>
          <mesh>
            <torusGeometry args={[0.09, 0.012, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.045, 0.045, 0.035, 16]} />
              <meshStandardMaterial color="#222" roughness={0.6} />
            </mesh>
          ))}
        </group>
      </group>

      {/* warm wash over the booth */}
      <pointLight position={[DJ.x, 2.8, DJ.z + 1.2]} color="#ffbf86" intensity={4} distance={7} decay={1.5} />

      {/* PA speakers on tripods */}
      {SPEAKERS.map((sp, i) => (
        <Speaker key={i} {...sp} coneRef={(r) => (cones.current[i] = r)} />
      ))}

      {/* subwoofer */}
      <group position={[SUB.x, 0, SUB.z]}>
        <mesh position={[0, 0.32, 0]}>
          <boxGeometry args={[0.72, 0.64, 0.66]} />
          <meshStandardMaterial color="#111213" roughness={0.65} />
        </mesh>
        <group ref={subCone} position={[0, 0.32, 0.331]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.25, 0.1, 32, 1, true]} />
            <meshStandardMaterial color="#26272a" roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* colour-changing uplights */}
      {UPLIGHTS.map((u, i) => (
        <group key={i}>
          <group position={[u.x, 0, u.z]}>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.24, 16]} />
              <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.085, 20]} />
              <meshStandardMaterial ref={(m) => (upLens.current[i] = m)} color="#000" emissive="#fff" emissiveIntensity={3} toneMapped={false} />
            </mesh>
          </group>
          <Spot
            position={[u.x, 0.3, u.z]}
            target={u.target}
            lightRef={(l) => (ups.current[i] = l)}
            intensity={20}
            distance={12}
            angle={0.55}
            penumbra={0.7}
            decay={1.4}
          />
        </group>
      ))}
    </group>
  );
}
