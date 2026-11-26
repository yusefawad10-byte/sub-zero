import { Bloom, EffectComposer, N8AO, Noise, Outline, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing';
import { services } from '../content';
import { Q } from '../quality';
import { useStore } from '../store';
import { activeService, serviceRoots } from './registry';

const ACCENT = { ice: '#65CFFF', amber: '#FFB45C' };

export default function Effects() {
  // subtle outline round whichever service is hovered, pinned or shown by the tour
  const id = useStore((s) => activeService(s));
  const root = id ? serviceRoots[id] : null;
  const color = id && services[id] ? ACCENT[services[id].accent] : ACCENT.ice;

  const fx = [];
  if (!Q.low) {
    fx.push(<N8AO key="ao" aoRadius={0.6} distanceFalloff={0.6} intensity={2.2} quality="performance" halfRes color="#000000" />);
  }
  fx.push(
    <Outline
      key="outline"
      selection={root ? [root] : []}
      visibleEdgeColor={color}
      hiddenEdgeColor="#000000"
      edgeStrength={2.2}
      blur
      kernelSize={KernelSize.SMALL}
      xRay={false}
    />
  );
  fx.push(<Bloom key="bloom" mipmapBlur intensity={0.9} luminanceThreshold={0.9} luminanceSmoothing={0.25} radius={0.7} />);
  fx.push(<ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />);
  if (Q.smaa) fx.push(<SMAA key="smaa" />);
  fx.push(<Noise key="noise" premultiply blendFunction={BlendFunction.ADD} opacity={0.04} />);
  fx.push(<Vignette key="vig" eskil={false} offset={0.28} darkness={0.62} />);

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {fx}
    </EffectComposer>
  );
}
