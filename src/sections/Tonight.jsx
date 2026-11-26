import { brand, tonight } from '../content';

export default function Tonight() {
  return (
    <section id="tonight" className="section section-alt">
      <div className="wrap tonight">
        <div>
          <p className="eyebrow">{tonight.eyebrow}</p>
          <h2>{tonight.title}</h2>
          <p className="lead">{brand.where}</p>
        </div>
        <article className="tonight-card">
          <span className="live" aria-hidden="true" />
          <h3>{tonight.place}</h3>
          <p className="area">{tonight.area}</p>
          <p className="hours">{tonight.hours}</p>
          <a className="btn" href={tonight.mapsUrl} target="_blank" rel="noopener noreferrer">
            {tonight.mapsLabel}
          </a>
          <p className="note">{tonight.note}</p>
        </article>
      </div>
    </section>
  );
}
