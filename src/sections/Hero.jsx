import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { brand, intro } from '../content';
import { use3D } from '../quality';
import { setState, useStore } from '../store';
import { input } from '../world/input';
import Hud from './Hud';
import Logo from './Logo';
import StaticHero from './StaticHero';

const World = lazy(() => import('../world/World.jsx'));

function IntroPanel() {
  const loaded = useStore((s) => s.loaded);
  const progress = useStore((s) => s.progress);
  return (
    <div className="intro">
      <div className="intro-card">
        <p className="eyebrow">{brand.eyebrow}</p>
        <h1>{brand.name}</h1>
        <p className="intro-line">{brand.line}</p>
        <div className="intro-actions">
          <button
            className="btn"
            disabled={!loaded}
            onClick={() => setState({ mode: 'walk' })}
            aria-live="polite"
          >
            {loaded ? intro.walk : intro.loading(progress)}
          </button>
          <a className="btn btn-ghost" href="#book">
            {intro.book}
          </a>
        </div>
        <p className="intro-tag">{brand.taglines[0]}</p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  const loaded = useStore((s) => s.loaded);
  const progress = useStore((s) => s.progress);
  return (
    <div className={`loading ${loaded ? 'done' : ''}`} aria-hidden={loaded}>
      <div className="loading-inner">
        <Logo size={46} />
        <div className="bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>
          {intro.loadingScreen} · {progress}%
        </p>
      </div>
    </div>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const [active, setActive] = useState(true);
  const mode = useStore((s) => s.mode);

  useEffect(() => {
    if (!use3D) return;
    // the bundle for three.js is on its way: nudge the bar so it never sits at zero
    const id = setInterval(() => setState((s) => (s.progress < 12 ? { progress: s.progress + 2 } : null)), 120);
    const io = new IntersectionObserver(([e]) => {
      setActive(e.isIntersecting);
      input.active = e.isIntersecting;
      if (!e.isIntersecting) {
        input.keys = {};
        if (document.pointerLockElement) document.exitPointerLock?.();
      }
    });
    if (ref.current) io.observe(ref.current);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, []);

  if (!use3D) return <StaticHero />;

  return (
    <section id="walk" ref={ref} className={`hero3d mode-${mode}`}>
      <Suspense fallback={null}>
        <World active={active} />
      </Suspense>
      <LoadingScreen />
      {mode === 'intro' ? <IntroPanel /> : <Hud />}
    </section>
  );
}
