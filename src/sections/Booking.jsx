import { useEffect, useState } from 'react';
import { booking, brand, planById, plans } from '../content';
import { setState, useStore } from '../store';

const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export default function Booking() {
  const plan = useStore((s) => s.plan);
  const [form, setForm] = useState({ name: '', phone: '', slot: plan, date: '' });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(null);

  useEffect(() => setForm((f) => ({ ...f, slot: plan })), [plan]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (k === 'slot') setState({ plan: e.target.value });
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (form.name.trim().length < 2) er.name = booking.errors.name;
    const digits = form.phone.replace(/\D/g, '');
    if (!/^[+\d][\d\s()-]*$/.test(form.phone.trim()) || digits.length < 7 || digits.length > 15)
      er.phone = booking.errors.phone;
    if (!form.date || form.date < today()) er.date = booking.errors.date;
    setErrors(er);
    if (Object.keys(er).length) {
      setDone(null);
      return;
    }
    const nice = new Date(`${form.date}T12:00:00`).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    setDone(booking.success(form.name.trim().split(' ')[0], planById[form.slot].name, nice));
  };

  return (
    <section id="book" className="section section-cream">
      <div className="wrap book">
        <div>
          <p className="eyebrow">{booking.eyebrow}</p>
          <h2>{booking.title}</h2>
          <p className="lead">{brand.taglines[1]}</p>
        </div>
        <form className="book-form" onSubmit={submit} noValidate>
          <label>
            {booking.name}
            <input value={form.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} />
            {errors.name && <span className="err">{errors.name}</span>}
          </label>
          <label>
            {booking.phone}
            <input
              value={form.phone}
              onChange={set('phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+971 50 123 4567"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <span className="err">{errors.phone}</span>}
          </label>
          <label>
            {booking.slot}
            <select value={form.slot} onChange={set('slot')}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.price}
                </option>
              ))}
            </select>
          </label>
          <label>
            {booking.date}
            <input type="date" min={today()} value={form.date} onChange={set('date')} aria-invalid={!!errors.date} />
            {errors.date && <span className="err">{errors.date}</span>}
          </label>
          <button className="btn" type="submit">
            {booking.submit}
          </button>
          {done && (
            <div className="success" role="status">
              <p>{done}</p>
              <p className="note">{booking.demoNote}</p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
