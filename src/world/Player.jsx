import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { setSpatial } from '../audio/music';
import { hotspots as HOT, services, tour } from '../content';
import { isTouch } from '../quality';
import { getState, openBooking, player, setState } from '../store';
import { input } from './input';
import { BOUNDS, DJ, EYE, HOTSPOTS, JUMPS, SPAWN, TOUR_STOPS, collides, floorAt, insideTruck } from './layout';
import { activeService } from './registry';

const SENS = 0.0022;
const WALK = 1.9;
const JOG = 3.8;
const TOUR_SPEED = 1.25; // an easy walking pace through the facility
const smooth = (t) => t * t * (3 - 2 * t);
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

function lookAngles(from, to) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  return [Math.atan2(-dx, -dz), Math.atan2(dy, Math.hypot(dx, dz))];
}

const KEYMAP = {
  KeyW: 'f',
  ArrowUp: 'f',
  KeyS: 'b',
  ArrowDown: 'b',
  KeyA: 'l',
  ArrowLeft: 'l',
  KeyD: 'r',
  ArrowRight: 'r',
  ShiftLeft: 'run',
  ShiftRight: 'run',
};

export default function Player() {
  const { camera, gl } = useThree();
  const st = useRef({
    x: SPAWN.x,
    z: SPAWN.z,
    fy: 0,
    yaw: 0,
    pitch: 0,
    bobT: 0,
    bobA: 0,
    vx: 0,
    vz: 0,
    blend: null,
    walking: false,
    frame: 0,
    route: null, // { pts, i, look, stop }
    lastCmd: 0,
  });

  // keyboard
  useEffect(() => {
    const down = (e) => {
      if (!input.active || getState().mode !== 'walk') return;
      if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      const k = KEYMAP[e.code];
      if (k) {
        input.keys[k] = true;
        if (e.code.startsWith('Arrow')) e.preventDefault();
      }
      if (e.code === 'KeyE') {
        const s = getState();
        const id = activeService(s);
        if (id && services[id]) openBooking(services[id].plan);
        else if (s.hotspot) openBooking(HOT[s.hotspot].plan);
      }
    };
    const up = (e) => {
      const k = KEYMAP[e.code];
      if (k) input.keys[k] = false;
    };
    const blur = () => (input.keys = {});
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  // mouse: drag to look; a click on empty space locks the pointer (a click on a service opens its card)
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let sx = 0;
    let sy = 0;
    const onDown = (e) => {
      if (getState().mode !== 'walk' || e.pointerType === 'touch') return;
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
    };
    const onMove = (e) => {
      if (getState().mode !== 'walk') return;
      if (document.pointerLockElement === el || (dragging && e.pointerType !== 'touch')) {
        input.lookDX += e.movementX || 0;
        input.lookDY += e.movementY || 0;
      }
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      const s = getState();
      const still = Math.hypot(e.clientX - sx, e.clientY - sy) < 6;
      if (still && !s.hover && !s.pinned && !document.pointerLockElement && el.requestPointerLock) {
        try {
          const p = el.requestPointerLock();
          if (p && p.catch) p.catch(() => {});
        } catch {
          /* drag to look still works */
        }
      }
    };
    const onLock = () => setState({ locked: document.pointerLockElement === el });
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerlockchange', onLock);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerlockchange', onLock);
    };
  }, [gl]);

  const startBlend = (x, z, look, dur = 1.8) => {
    const s = st.current;
    const fy = floorAt(x, z);
    const to = new THREE.Vector3(x, fy + EYE, z);
    const [yaw, pitch] = lookAngles([to.x, to.y, to.z], look);
    const toQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    s.route = null;
    s.vx = 0;
    s.vz = 0;
    s.blend = {
      t: 0,
      dur,
      from: camera.position.clone(),
      fromQ: camera.quaternion.clone(),
      to,
      toQ,
      end: { x, z, fy, yaw, pitch },
    };
  };

  // walk the tour leg that leads to stop n, starting from where we stand
  const walkTo = (n) => {
    const s = st.current;
    const stop = TOUR_STOPS[n];
    const pts = [[s.x, s.z], ...(stop.leg || []), stop.pos];
    s.blend = null;
    s.route = { pts, i: 1, stop: n };
    setState({ tourStop: n, tourPhase: 'walking', pinned: null });
  };

  const tryMove = (s, dx, dz) => {
    const nx = Math.max(BOUNDS.x0, Math.min(BOUNDS.x1, s.x + dx));
    const nz = Math.max(BOUNDS.z0, Math.min(BOUNDS.z1, s.z + dz));
    const here = floorAt(s.x, s.z);
    if (floorAt(nx, nz) - here > 0.28) return false;
    if (collides(nx, nz, Math.min(here, floorAt(nx, nz)))) return false;
    s.x = nx;
    s.z = nz;
    return true;
  };

  // tour commands from the overlay
  const runTourCmd = (cmd) => {
    const s = st.current;
    const g = getState();
    const last = tour.stops.length - 1;
    switch (cmd.type) {
      case 'start':
      case 'restart':
        startBlend(TOUR_STOPS[0].pos[0], TOUR_STOPS[0].pos[1], TOUR_STOPS[0].look, 1.6);
        setState({ explore: 'tour', tourStop: 0, tourPhase: 'arriving', pinned: null });
        break;
      case 'next':
        if (g.tourStop < last) walkTo(g.tourStop + 1);
        break;
      case 'prev': {
        const n = Math.max(0, g.tourStop - 1);
        startBlend(TOUR_STOPS[n].pos[0], TOUR_STOPS[n].pos[1], TOUR_STOPS[n].look, 1.4);
        setState({ tourStop: n, tourPhase: 'arriving', pinned: null });
        break;
      }
      case 'resume':
        if (s.route) setState({ tourPhase: 'walking' });
        else if (g.tourStop < last) walkTo(g.tourStop + 1);
        break;
      case 'pause':
        setState({ tourPhase: 'paused' });
        break;
      case 'exit':
        s.route = null;
        setState({ explore: 'free', tourPhase: 'idle' });
        break;
      default:
    }
  };

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = st.current;
    let g = getState();
    s.frame++;

    if (g.mode === 'intro') {
      s.walking = false;
      const t = state.clock.elapsedTime;
      const sx = Math.sin(t * 0.13);
      camera.position.set(sx * 6.5, 2.3 + Math.sin(t * 0.21) * 0.15, 11.8);
      camera.lookAt(sx * 2.2, 1.55, 0.6);
      if (g.music) setSpatial(camera.position.distanceTo(new THREE.Vector3(DJ.x, 1.5, DJ.z)), false);
      return;
    }

    if (!s.walking) {
      s.walking = true;
      if (!(g.tourCmd && g.tourCmd.type === 'start')) startBlend(SPAWN.x, SPAWN.z, SPAWN.look, 1.9);
    }
    if (g.jumpTo) {
      const j = JUMPS[g.jumpTo];
      setState({ jumpTo: null });
      if (j) startBlend(j.pos[0], j.pos[1], j.look, 1.4);
    }
    if (g.tourCmd && g.tourCmd.n !== s.lastCmd) {
      s.lastCmd = g.tourCmd.n;
      runTourCmd(g.tourCmd);
      g = getState();
    }

    // manual input takes over from the tour at any time
    const k = input.keys;
    const manualMove = k.f || k.b || k.l || k.r || Math.hypot(input.move.x, input.move.y) > 0.15;
    const manualLook = Math.abs(input.lookDX) + Math.abs(input.lookDY) > 0;
    if (g.explore === 'tour' && manualMove && (g.tourPhase === 'walking' || g.tourPhase === 'stop' || g.tourPhase === 'arriving')) {
      setState({ tourPhase: 'paused' });
      g = getState();
    }

    if (s.blend) {
      const b = s.blend;
      b.t += dt / b.dur;
      const kk = smooth(Math.min(1, b.t));
      camera.position.lerpVectors(b.from, b.to, kk);
      camera.quaternion.slerpQuaternions(b.fromQ, b.toQ, kk);
      if (b.t >= 1) {
        Object.assign(s, b.end);
        s.blend = null;
        if (g.explore === 'tour' && g.tourPhase === 'arriving') setState({ tourPhase: 'stop' });
      }
      input.lookDX = 0;
      input.lookDY = 0;
    } else {
      // look (always allowed, also during the tour)
      if (manualLook) {
        const touchK = isTouch ? 1.5 : 1;
        s.yaw -= input.lookDX * SENS * touchK;
        s.pitch -= input.lookDY * SENS * touchK;
        s.pitch = Math.max(-1.35, Math.min(1.35, s.pitch));
        if (g.tourPhase === 'walking' && g.explore === 'tour') {
          setState({ tourPhase: 'paused' });
          g = getState();
        }
      }
      input.lookDX = 0;
      input.lookDY = 0;

      let moved = false;
      let speedNow = 0;
      const touring = g.explore === 'tour' && g.tourPhase === 'walking' && s.route;
      if (touring) {
        // follow the route at a natural pace, slowing at the start and on arrival
        const r = s.route;
        const target = r.pts[r.i];
        const dx = target[0] - s.x;
        const dz = target[1] - s.z;
        const d = Math.hypot(dx, dz);
        let remaining = d;
        for (let i = r.i; i < r.pts.length - 1; i++) {
          remaining += Math.hypot(r.pts[i + 1][0] - r.pts[i][0], r.pts[i + 1][1] - r.pts[i][1]);
        }
        const want = TOUR_SPEED * Math.min(1, 0.25 + remaining / 1.6);
        const cur = Math.hypot(s.vx, s.vz);
        const spd = cur + (want - cur) * Math.min(1, dt * 2.2);
        const step = Math.min(d, spd * dt);
        if (d > 1e-4) {
          const nx = dx / d;
          const nz = dz / d;
          s.vx = nx * spd;
          s.vz = nz * spd;
          moved = tryMove(s, nx * step, 0) | tryMove(s, 0, nz * step);
          speedNow = spd;
          // face where we walk, turning towards the service over the last metres
          const stop = TOUR_STOPS[r.stop];
          const [ly, lp] = lookAngles([s.x, s.fy + EYE, s.z], stop.look);
          const walkYaw = Math.atan2(-nx, -nz);
          const w = smooth(Math.max(0, Math.min(1, 1 - (remaining - 0.4) / 2.2)));
          const yawT = walkYaw + wrap(ly - walkYaw) * w;
          const pitchT = -0.06 * (1 - w) + lp * w;
          s.yaw += wrap(yawT - s.yaw) * Math.min(1, dt * 2.4);
          s.pitch += (pitchT - s.pitch) * Math.min(1, dt * 2.4);
        }
        if (d < 0.03) {
          r.i++;
          if (r.i >= r.pts.length) {
            s.route = null;
            s.vx = 0;
            s.vz = 0;
            setState({ tourPhase: 'stop' });
          }
        }
      } else if (g.explore === 'tour' && g.tourPhase === 'stop' && !manualLook) {
        // at a stop: settle the view on the service
        const stop = TOUR_STOPS[g.tourStop];
        const [ly, lp] = lookAngles([s.x, s.fy + EYE, s.z], stop.look);
        s.yaw += wrap(ly - s.yaw) * Math.min(1, dt * 2);
        s.pitch += (lp - s.pitch) * Math.min(1, dt * 2);
      }

      if (!touring) {
        // free walking with smooth acceleration and deceleration
        let mx = (k.r ? 1 : 0) - (k.l ? 1 : 0) + input.move.x;
        let mz = (k.f ? 1 : 0) - (k.b ? 1 : 0) + input.move.y;
        const len = Math.hypot(mx, mz);
        if (len > 1) {
          mx /= len;
          mz /= len;
        }
        const jog = k.run || Math.hypot(input.move.x, input.move.y) > 0.95;
        const speed = jog ? JOG : WALK;
        const sy = Math.sin(s.yaw);
        const cy = Math.cos(s.yaw);
        const tvx = (-sy * mz + cy * mx) * speed;
        const tvz = (-cy * mz - sy * mx) * speed;
        const accel = len > 0.05 ? 7 : 9;
        s.vx += (tvx - s.vx) * Math.min(1, dt * accel);
        s.vz += (tvz - s.vz) * Math.min(1, dt * accel);
        const dx = s.vx * dt;
        const dz = s.vz * dt;
        if (Math.abs(dx) + Math.abs(dz) > 1e-5) {
          const mxOk = tryMove(s, dx, 0);
          const mzOk = tryMove(s, 0, dz);
          if (!mxOk) s.vx *= 0.3;
          if (!mzOk) s.vz *= 0.3;
          moved = mxOk || mzOk;
        }
        speedNow = Math.hypot(s.vx, s.vz);
      }

      // floor and a gentle head bob
      const target = floorAt(s.x, s.z);
      s.fy += (target - s.fy) * Math.min(1, dt * (target > s.fy ? 14 : 9));
      const moving = moved && speedNow > 0.25;
      s.bobA += ((moving ? Math.min(0.05, 0.012 + speedNow * 0.011) : 0) - s.bobA) * Math.min(1, dt * 6);
      if (moving) s.bobT += dt * speedNow * 3.1;
      camera.position.set(
        s.x + Math.cos(s.bobT) * s.bobA * 0.35,
        s.fy + EYE + Math.abs(Math.sin(s.bobT)) * s.bobA - s.bobA * 0.5,
        s.z
      );
      camera.quaternion.setFromEuler(new THREE.Euler(s.pitch, s.yaw, 0, 'YXZ'));
    }

    player.x = camera.position.x;
    player.z = camera.position.z;
    player.inTruck = insideTruck(player.x, player.z);

    if (s.frame % 6 === 0) {
      let best = null;
      let bestK = 1;
      for (const h of HOTSPOTS) {
        const d = Math.hypot(player.x - h.x, player.z - h.z) / h.r;
        if (d < bestK) {
          bestK = d;
          best = h.id;
        }
      }
      if (best !== g.hotspot) setState({ hotspot: best });
    }
    if (g.music) setSpatial(Math.hypot(player.x - DJ.x, player.z - DJ.z), player.inTruck);
  });

  return null;
}
