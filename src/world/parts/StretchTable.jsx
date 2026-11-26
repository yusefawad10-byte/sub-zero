import { RoundedBox } from '@react-three/drei';
import { STRETCH } from '../layout';

const F = 0.6;

// Black padded treatment table on wooden legs, towels stacked underneath (as in the renders).
export default function StretchTable() {
  const { x, z, w, l, h } = STRETCH;
  const wood = <meshStandardMaterial color="#8a5a34" roughness={0.65} />;
  return (
    <group position={[x, F, z]}>
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * (w / 2 - 0.15), 0, 0]}>
          {[-1, 1].map((sz) => (
            <mesh key={sz} position={[0, (h - 0.1) / 2, (sz * (l / 2 - 0.08))]} rotation={[sz * 0.12, 0, 0]}>
              <boxGeometry args={[0.05, h - 0.1, 0.05]} />
              {wood}
            </mesh>
          ))}
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.04, 0.04, l - 0.1]} />
            {wood}
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[w - 0.3, 0.03, 0.04]} />
        {wood}
      </mesh>
      <mesh position={[0, h - 0.12, 0]}>
        <boxGeometry args={[w - 0.06, 0.05, l - 0.06]} />
        {wood}
      </mesh>
      <RoundedBox args={[w, 0.12, l]} radius={0.05} smoothness={4} position={[0, h - 0.04, 0]}>
        <meshStandardMaterial color="#141414" roughness={0.45} />
      </RoundedBox>
      {/* head pillow with the SZ stitch */}
      <RoundedBox args={[0.32, 0.08, l - 0.12]} radius={0.035} smoothness={3} position={[-w / 2 + 0.22, h + 0.05, 0]}>
        <meshStandardMaterial color="#1c1c1c" roughness={0.5} />
      </RoundedBox>
      {/* rolled towel on top, stack of towels underneath */}
      <mesh position={[0.25, h + 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, l - 0.2, 14]} />
        <meshStandardMaterial color="#f3ebdd" roughness={1} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.15 + (i % 2) * 0.17, 0.25 + Math.floor(i / 2) * 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.42, 14]} />
          <meshStandardMaterial color="#f3ebdd" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
