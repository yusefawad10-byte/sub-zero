import { plans, pricing } from '../content';
import { bookPlan } from '../store';

export default function Pricing() {
  return (
    <section id="prices" className="section">
      <div className="wrap">
        <p className="eyebrow">{pricing.eyebrow}</p>
        <h2>{pricing.title}</h2>
        <div className="price-grid">
          {plans.map((p) => (
            <article key={p.id} className={`price-card ${p.best ? 'best' : ''}`}>
              {p.best && <span className="badge">{pricing.best}</span>}
              <h3>{p.name}</h3>
              <p className="price">{p.price}</p>
              <p>{p.detail}</p>
              {p.note && <p className="note">{p.note}</p>}
              <button className="btn btn-small btn-outline" onClick={() => bookPlan(p.id)}>
                {pricing.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
