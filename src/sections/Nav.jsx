import { brand, nav } from '../content';
import { getState, setState } from '../store';
import Logo from './Logo';

export function startWalk() {
  document.getElementById('walk')?.scrollIntoView({ behavior: 'smooth' });
  if (getState().loaded) setState({ mode: 'walk' });
}

export default function Nav() {
  return (
    <header className="nav">
      <a className="nav-logo" href="#walk" aria-label={brand.name}>
        <Logo />
        <span>{brand.name}</span>
      </a>
      <nav className="nav-links" aria-label="Main">
        {nav.links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            onClick={(e) => {
              if (l.action === 'walk') {
                e.preventDefault();
                startWalk();
              }
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>
      <a className="btn btn-small" href="#book">
        {nav.cta}
      </a>
    </header>
  );
}
