import { DECK, STEPS } from '../layout';
import { useSet } from '../textures';
import { C } from '../canvasTextures';

const LED = <meshStandardMaterial color="#ffb45c" emissive="#ffb45c" emissiveIntensity={0.9} toneMapped={false} />;
const EDGE = <meshStandardMaterial color="#121315" metalness={0.85} roughness={0.3} />;

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
        <meshStandardMaterial {...wood} color="#3a302a" roughness={0.5} envMapIntensity={0.8} />
      </mesh>
      {/* legs */}
      {[-3.4, -1.2, 1.2, 3.4].map((x) => (
        <mesh key={x} position={[x, 0.22, DECK.z1 - 0.2]}>
          <boxGeometry args={[0.1, 0.44, 0.1]} />
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      {/* dark metal edging around the platform */}
      <mesh position={[0, 0.56, DECK.z1 + 0.015]}>
        <boxGeometry args={[W + 0.04, 0.1, 0.03]} />
        {EDGE}
      </mesh>
      {[DECK.x0 - 0.015, DECK.x1 + 0.015].map((x) => (
        <mesh key={x} position={[x, 0.56, (DECK.z0 + DECK.z1) / 2]}>
          <boxGeometry args={[0.03, 0.1, D]} />
          {EDGE}
        </mesh>
      ))}

      {/* two steps */}
      {STEPS.rows.map(([z0, z1, y]) => (
        <group key={y}>
          <mesh position={[sx, y / 2, (z0 + z1) / 2]}>
            <boxGeometry args={[sw, y, z1 - z0]} />
            <meshStandardMaterial color="#17181a" roughness={0.85} />
          </mesh>
          <mesh position={[sx, y + 0.002, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[sw, z1 - z0]} />
            <meshStandardMaterial {...wood} color="#3a302a" roughness={0.5} />
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
