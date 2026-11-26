import { useRef, useState } from 'react';
import { start, stop } from '../audio/music';
import { hotspots, hud, planById } from '../content';
import { isTouch } from '../quality';
import { bookPlan, setState, useStore } from '../store';
import { input } from '../world/input';

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

function LookZone() {
  const last = useRef(null);
  return (
    <div
      className="lookzone"
      onPointerDown={(e) => {
        last.current = [e.clientX, e.clientY, e.pointerId];
        capture(e);
      }}
      onPointerMove={(e) => {
        if (!last.current || last.current[2] !== e.pointerId) return;
        input.lookDX += e.clientX - last.current[0];
        input.lookDY += e.clientY - last.current[1];
        last.current = [e.clientX, e.clientY, e.pointerId];
      }}
      onPointerUp={() => (last.current = null)}
      onPointerCancel={() => (last.current = null)}
    />
  );
}

export default function Hud() {
  const hot = useStore((s) => s.hotspot);
  const music = useStore((s) => s.music);
  const locked = useStore((s) => s.locked);
  const h = hot ? hotspots[hot] : null;
  const plan = h ? planById[h.plan] : null;

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
    <div className="hud">
      {isTouch && (
        <>
          <LookZone />
          <Joystick />
        </>
      )}
      <div className="chips" role="toolbar" aria-label="Jump to">
        {hud.chips.map((c) => (
          <button key={c.id} className="chip" onClick={() => setState({ jumpTo: c.id })}>
            {c.label}
          </button>
        ))}
      </div>
      <button className={`music ${music ? 'on' : ''}`} onClick={toggleMusic} aria-pressed={music}>
        <span className="eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {music ? hud.musicOff : hud.musicOn}
      </button>
      {!locked && !(isTouch && h) && <p className="hint">{isTouch ? hud.hintTouch : hud.hintDesktop}</p>}
      {!isTouch && <span className="crosshair" aria-hidden="true" />}
      {h && (
        <div className="hotspot" role="status">
          <p className="hs-title">{h.title}</p>
          <p className="hs-line">{h.line}</p>
          <div className="hs-row">
            <span className="hs-price">
              {plan.name} · <strong>{plan.price}</strong>
            </span>
            <button className="btn btn-small" onClick={() => bookPlan(h.plan)}>
              {hud.bookThis}
            </button>
          </div>
          {!isTouch && <p className="hs-key">{hud.pressE}</p>}
        </div>
      )}
    </div>
  );
}
