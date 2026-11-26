const params = new URLSearchParams(window.location.search);
const forced = params.get('quality');

const coarse = window.matchMedia('(pointer: coarse)').matches;
const smallScreen = Math.min(window.screen.width, window.screen.height) < 820;
const phoneUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

export const isTouch = coarse || 'ontouchstart' in window;
export const isPhone = phoneUA || (coarse && smallScreen);

const low = forced === 'low' || (forced !== 'high' && isPhone);

export const Q = low
  ? {
      low: true,
      reflections: false,
      shadows: false,
      transmission: false,
      mist: 36,
      windows: 0.5,
      buildings: 34,
      dpr: 1.5,
      smaa: false,
      fullLights: false,
    }
  : {
      low: false,
      reflections: true,
      shadows: true,
      transmission: true,
      mist: 140,
      windows: 1,
      buildings: 64,
      dpr: 1.75,
      smaa: true,
      fullLights: true,
    };

export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export const use3D = webglOK() && !reducedMotion && forced !== 'static';
