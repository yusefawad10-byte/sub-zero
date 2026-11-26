import { Bloom, EffectComposer, Noise, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { Q } from '../quality';

export default function Effects() {
  const common = [
    <Bloom key="bloom" mipmapBlur intensity={1.15} luminanceThreshold={0.85} luminanceSmoothing={0.25} radius={0.8} />,
    <ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />,
  ];
  const tail = [
    <Noise key="noise" premultiply blendFunction={BlendFunction.ADD} opacity={0.05} />,
    <Vignette key="vig" eskil={false} offset={0.28} darkness={0.62} />,
  ];
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {Q.smaa ? [...common, <SMAA key="smaa" />, ...tail] : [...common, ...tail]}
    </EffectComposer>
  );
}
