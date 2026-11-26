import { useEffect, useRef, useState } from 'react';
import { start, stop } from '../audio/music';
import { hud, packages, services, tour, ui as T } from '../content';
import { isTouch } from '../quality';
import { getState, openBooking, setState, useStore } from '../store';
import { input } from '../world/input';
import { activeService, ui } from '../world/registry';
import { BookingForm } from './Booking';

let cmdN = 0;
export const tourCmd = (type) => setState({ tourCmd: { type, n: ++cmdN } });

function capture(e) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    /* some browsers refuse capture; tracking still works */
  }
}

function Joystick() {
  const base = useRef(null);
  const [knob, setKnob] = useState([0, 0]);
  const id = useRef(null);
  const R = 46;
  const update = (e) => {
    const r = base.current.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > R) {
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    input.move.x = dx / R;
    input.move.y = -dy / R;
    setKnob([dx, dy]);
  };
  const end = () => {
    id.current = null;
    input.move.x = 0;
    input.move.y = 0;
    setKnob([0, 0]);
  };
  return (
    <div
      className="joystick"
      ref={base}
      onPointerDown={(e) => {
        id.current = e.pointerId;
        update(e);
        capture(e);
      }}
      onPointerMove={(e) => e.pointerId === id.current && update(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <span className="knob" style={{ transform: `translate(${knob[0]}px, ${knob[1]}px)` }} />
    </div>
  );
}

// Right side of the screen on touch devices: drag to look, tap a service to open its card.
function LookZone() {
  const last = useRef(null);
  const startP = useRef(null);
  return (
    <div
      className="lookzone"
      onPointerDown={(e) => {
        last.current = [e.clientX, e.clientY, e.pointerId];
        startP.current = [e.clientX, e.clientY, performance.now()];
        capture(e);
      }}
      onPointerMove={(e) => {
        if (!last.current || last.current[2] !== e.pointerId) return;
        input.lookDX += e.clientX - last.current[0];
        input.lookDY += e.clientY - last.current[1];
        last.current = [e.clientX, e.clientY, e.pointerId];
      }}
      onPointerUp={(e) => {
        const s0 = startP.current;
        last.current = null;
        if (!s0) return;
        const still = Math.hypot(e.clientX - s0[0], e.clientY - s0[1]) < 10 && performance.now() - s0[2] < 400;
        if (!still || !ui.pickAt) return;
        const id = ui.pickAt(e.clientX, e.clientY);
        const s = getState();
        if (id) {
          setState({ pinned: s.pinned === id ? null : id });
          if (s.explore === 'tour' && s.tourPhase === 'walking') setState({ tourPhase: 'paused' });
        } else if (s.pinned) setState({ pinned: null });
      }}
      onPointerCancel={() => (last.current = null)}
    />
  );
}

function ModeSwitch() {
  const explore = useStore((s) => s.explore);
  const help = useStore((s) => s.help);
  return (
    <div className="modes">
      <div className="seg" role="tablist" aria-label="How to explore">
        <button role="tab" aria-selected={explore === 'free'} className={explore === 'free' ? 'on' : ''} onClick={() => tourCmd('exit')}>
          {T.modeFree}
        </button>
        <button
          role="tab"
          aria-selected={explore === 'tour'}
          className={explore === 'tour' ? 'on' : ''}
          onClick={() => explore !== 'tour' && tourCmd('start')}
        >
          {T.modeTour}
        </button>
      </div>
      <button className="help-btn" aria-expanded={help} onClick={() => setState({ help: !help })} aria-label={T.controls}>
        ?
      </button>
      {help && (
        <div className="help">
          <p className="help-title">{T.controls}</p>
          <dl>
            {(isTouch ? T.controlsTouch : T.controlsList).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <button className="link" onClick={() => setState({ help: false })}>
            {T.close}
          </button>
        </div>
      )}
    </div>
  );
}

function TourBar() {
  const stopN = useStore((s) => s.tourStop);
  const phase = useStore((s) => s.tourPhase);
  const stops = tour.stops;
  const st = stops[stopN];
  const paused = phase === 'paused';
  const last = stopN >= stops.length - 1;
  return (
    <div className="tourbar" role="region" aria-label="Guided tour">
      <p className="tour-progress">
        <span className={`dot ${phase === 'walking' ? 'walking' : ''}`} />
        {T.stop(stopN + 1, stops.length, st.title)}
      </p>
      <div className="tour-track" aria-hidden="true">
        {stops.map((s, i) => (
          <i key={s.id} className={i < stopN ? 'done' : i === stopN ? 'now' : ''} />
        ))}
      </div>
      {st.line && phase === 'stop' && <p className="tour-line">{st.line}</p>}
      <div className="tour-ctrl">
        <button onClick={() => tourCmd('prev')} disabled={stopN === 0} aria-label={T.prev}>
          ‹ {T.prev}
        </button>
        {paused || phase === 'stop' ? (
          <button className="primary" onClick={() => (last ? tourCmd('restart') : tourCmd('resume'))}>
            {last ? T.restart : phase === 'stop' ? `${T.next} ›` : T.resume}
          </button>
        ) : (
          <button className="primary" onClick={() => tourCmd('pause')}>
            {T.pause}
          </button>
        )}
        {!last && phase !== 'stop' && (
          <button onClick={() => tourCmd('next')} aria-label={T.next}>
            {T.next} ›
          </button>
        )}
        <button onClick={() => tourCmd('restart')}>{T.restart}</button>
        <button onClick={() => tourCmd('exit')}>{T.exitTour}</button>
      </div>
    </div>
  );
}

function ServiceCard() {
  const s = useStore((st) => st);
  const live = activeService(s);
  const [shown, setShown] = useState(null);
  const [tab, setTab] = useState(0);
  const ref = useRef(null);
  const hideTimer = useRef(null);
  const docked = isTouch || (typeof window !== 'undefined' && window.innerWidth < 720);
  ui.docked = docked;

  // keep the card a moment after the cursor leaves, so it can be reached
  useEffect(() => {
    clearTimeout(hideTimer.current);
    if (live) setShown(live);
    else if (!s.cardHover) hideTimer.current = setTimeout(() => setShown(null), 280);
    return () => clearTimeout(hideTimer.current);
  }, [live, s.cardHover]);
  useEffect(() => setTab(0), [shown]);
  useEffect(() => {
    ui.cardEl = ref.current;
    return () => (ui.cardEl = null);
  });

  if (!shown || !services[shown]) return null;
  const sv = services[shown];
  const pinned = s.pinned === shown;
  const accent = sv.accent === 'ice' ? 'ice' : 'amber';

  return (
    <div
      ref={ref}
      data-service={shown}
      className={`svc-card ${accent} ${docked ? 'docked' : 'floating'} ${live ? 'in' : 'out'}`}
      onPointerEnter={() => setState({ cardHover: true })}
      onPointerLeave={() => setState({ cardHover: false })}
      role="dialog"
      aria-label={sv.name}
    >
      {!docked && <span className="svc-dot" aria-hidden="true" />}
      <div className="svc-head">
        <div>
          <p className="svc-name">{sv.name}</p>
          <p className="svc-price">{sv.price || T.tbc}</p>
          {sv.priceNote && <p className="svc-note">{sv.priceNote}</p>}
        </div>
        {(pinned || docked) && (
          <button className="svc-close" onClick={() => setState({ pinned: null, cardHover: false, hover: null })} aria-label={T.close}>
            ×
          </button>
        )}
      </div>
      {sv.menu ? (
        <div className="svc-menu">
          <div className="svc-tabs" role="tablist">
            {sv.menu.map((m, i) => (
              <button key={m.name} role="tab" aria-selected={tab === i} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>
                {m.name}
              </button>
            ))}
          </div>
          <p className="svc-item">
            <strong>{sv.menu[tab].name}</strong> <span>{sv.menu[tab].price}</span>
          </p>
          <p className="svc-desc">{sv.menu[tab].note}</p>
        </div>
      ) : (
        <p className="svc-desc">{sv.description}</p>
      )}
      <dl className="svc-facts">
        {sv.duration !== null && (
          <div>
            <dt>Duration</dt>
            <dd>{sv.duration || T.tbc}</dd>
          </div>
        )}
        <div>
          <dt>Availability</dt>
          <dd>{sv.availability || T.availabilityTbc}</dd>
        </div>
      </dl>
      {sv.benefits && (
        <ul className="svc-benefits">
          {sv.benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      {(shown === 'tubs' || shown === 'sauna') && (
        <p className="svc-packages">
          {T.packages}:{' '}
          {packages.map((p, i) => (
            <span key={p.name}>
              {i > 0 && ' · '}
              {p.name} {p.price}
            </span>
          ))}
        </p>
      )}
      <div className="svc-actions">
        <button className="btn btn-small" onClick={() => openBooking(sv.plan)}>
          {T.bookNow}
        </button>
        <a
          className="btn btn-small btn-ghost"
          href={sv.more}
          onClick={() => {
            if (document.pointerLockElement) document.exitPointerLock?.();
          }}
        >
          {T.learnMore}
        </a>
      </div>
    </div>
  );
}

function BookingPanel() {
  const open = useStore((s) => s.booking);
  if (!open) return null;
  const close = () => setState({ booking: false });
  return (
    <div className="book-panel" role="dialog" aria-modal="true" aria-label={T.bookingTitle} onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="book-sheet">
        <div className="book-sheet-head">
          <p>{T.bookingTitle}</p>
          <button className="svc-close" onClick={close} aria-label={T.close}>
            ×
          </button>
        </div>
        <BookingForm compact />
      </div>
    </div>
  );
}

export default function Hud() {
  const music = useStore((s) => s.music);
  const locked = useStore((s) => s.locked);
  const explore = useStore((s) => s.explore);
  const booking = useStore((s) => s.booking);
  const showCard = useStore((s) => !!activeService(s));

  // Esc closes the booking panel / pinned card
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const s = getState();
      if (s.booking) setState({ booking: false });
      else if (s.pinned) setState({ pinned: null });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleMusic = async () => {
    if (music) {
      stop();
      setState({ music: false });
    } else {
      try {
        await start();
        setState({ music: true });
      } catch {
        setState({ music: false });
      }
    }
  };

  return (
    <div className={`hud explore-${explore}`}>
      {isTouch && !booking && (
        <>
          <LookZone />
          <Joystick />
        </>
      )}
      <ModeSwitch />
      {explore === 'tour' ? (
        <TourBar />
      ) : (
        <div className="chips" role="toolbar" aria-label="Jump to">
          {hud.chips.map((c) => (
            <button key={c.id} className="chip" onClick={() => setState({ jumpTo: c.id })}>
              {c.label}
            </button>
          ))}
        </div>
      )}
      <button className={`music ${music ? 'on' : ''}`} onClick={toggleMusic} aria-pressed={music}>
        <span className="eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {music ? hud.musicOff : hud.musicOn}
      </button>
      {!locked && !(isTouch && showCard) && explore === 'free' && (
        <p className="hint">{isTouch ? hud.hintTouch : hud.hintDesktop}</p>
      )}
      {!isTouch && <span className="crosshair" aria-hidden="true" />}
      <ServiceCard />
      <BookingPanel />
    </div>
  );
}
