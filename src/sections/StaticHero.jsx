import { brand, intro, staticHero } from '../content';

// Shown when there is no WebGL or the visitor prefers reduced motion: the real truck render.
export default function StaticHero() {
  return (
    <section id="walk" className="hero-static">
      <img className="hero-static-img" src="static/img/truck.jpg" alt={staticHero.alt} />
      <div className="intro-card static">
        <p className="eyebrow">{brand.eyebrow}</p>
        <h1>{brand.name}</h1>
        <p className="intro-line">{brand.line}</p>
        <div className="intro-actions">
          <a className="btn" href="#book">
            {intro.book}
          </a>
          <a className="btn btn-ghost" href="#prices">
            Prices
          </a>
        </div>
        <p className="intro-tag">{staticHero.note}</p>
      </div>
    </section>
  );
}
