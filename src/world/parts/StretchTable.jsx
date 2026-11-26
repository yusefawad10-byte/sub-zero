import { RoundedBox } from '@react-three/drei';
import { C } from '../canvasTextures';
import { STRETCH } from '../layout';

const F = 0.6;

export default function StretchTable() {
  const { x, z, w, l, h } = STRETCH;
  return (
    <group position={[x, F, z]}>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (w / 2 - 0.08), (h - 0.1) / 2, sz * (l / 2 - 0.12)]}>
            <cylinderGeometry args={[0.025, 0.025, h - 0.1, 10]} />
            <meshStandardMaterial color="#9aa0a5" metalness={0.85} roughness={0.3} />
          </mesh>
        ))
      )}
      <mesh position={[0, h - 0.12, 0]}>
        <boxGeometry args={[w - 0.08, 0.05, l - 0.1]} />
        <meshStandardMaterial color="#2b2c2d" roughness={0.6} />
      </mesh>
      <RoundedBox args={[w, 0.11, l]} radius={0.045} smoothness={4} position={[0, h - 0.04, 0]}>
        <meshStandardMaterial color={C.green} roughness={0.62} />
      </RoundedBox>
      {/* rolled towel as a head rest */}
      <mesh position={[0, h + 0.06, -l / 2 + 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, w - 0.15, 16]} />
        <meshStandardMaterial color="#f3ebdd" roughness={1} />
      </mesh>
      {/* folded towel */}
      <mesh position={[0, h + 0.03, l / 2 - 0.35]}>
        <boxGeometry args={[w - 0.25, 0.04, 0.3]} />
        <meshStandardMaterial color="#e9e1d1" roughness={1} />
      </mesh>
    </group>
  );
}
