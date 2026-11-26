import { DECK, STEPS } from '../layout';
import { useSet } from '../textures';
import { C } from '../canvasTextures';

const LED = <meshStandardMaterial color={C.ice} emissive={C.ice} emissiveIntensity={3.5} toneMapped={false} />;

export default function Deck() {
  const wood = useSet('dark_wooden_planks', 4, 1.6);
  const W = DECK.x1 - DECK.x0;
  const D = DECK.z1 - DECK.z0;
  const sw = STEPS.x1 - STEPS.x0;
  const sx = (STEPS.x0 + STEPS.x1) / 2;

  return (
    <group>
      {/* platform */}
      <mesh position={[0, 0.525, DECK.z0 + D / 2]}>
        <boxGeometry args={[W, 0.15, D]} />
        <meshStandardMaterial color="#141516" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.602, DECK.z0 + D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial {...wood} color="#9c7a5c" roughness={0.7} />
      </mesh>
      {/* legs */}
      {[-3.4, -1.2, 1.2, 3.4].map((x) => (
        <mesh key={x} position={[x, 0.22, DECK.z1 - 0.2]}>
          <boxGeometry args={[0.1, 0.44, 0.1]} />
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {/* blue LED along the deck edge */}
      <mesh position={[0, 0.585, DECK.z1 + 0.005]}>
        <boxGeometry args={[W, 0.025, 0.012]} />
        {LED}
      </mesh>

      {/* two steps */}
      {STEPS.rows.map(([z0, z1, y]) => (
        <group key={y}>
          <mesh position={[sx, y / 2, (z0 + z1) / 2]}>
            <boxGeometry args={[sw, y, z1 - z0]} />
            <meshStandardMaterial color="#17181a" roughness={0.85} />
          </mesh>
          <mesh position={[sx, y + 0.002, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[sw, z1 - z0]} />
            <meshStandardMaterial {...wood} color="#8d6d52" roughness={0.7} />
          </mesh>
          <mesh position={[sx, y - 0.015, z1 + 0.004]}>
            <boxGeometry args={[sw, 0.022, 0.01]} />
            {LED}
          </mesh>
        </group>
      ))}
    </group>
  );
}
