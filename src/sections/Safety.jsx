import { safety } from '../content';

export default function Safety() {
  return (
    <section id="safety" className="section">
      <div className="wrap">
        <p className="eyebrow">{safety.eyebrow}</p>
        <h2>{safety.title}</h2>
        <ol className="safety">
          {safety.items.map((s, i) => (
            <li key={s.title}>
              <span className="num">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
