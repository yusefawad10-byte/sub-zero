import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { setSpatial } from '../audio/music';
import { isTouch } from '../quality';
import { bookPlan, getState, player, setState } from '../store';
import { hotspots as HOT } from '../content';
import { input } from './input';
import { BOUNDS, DJ, EYE, HOTSPOTS, JUMPS, SPAWN, collides, floorAt, insideTruck } from './layout';

const SENS = 0.0022;
const WALK = 1.9;
const JOG = 3.8;
const smooth = (t) => t * t * (3 - 2 * t);

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
    blend: null,
    walking: false,
    frame: 0,
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
        const h = getState().hotspot;
        if (h) bookPlan(HOT[h].plan);
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

  // mouse: click to lock pointer, drag-to-look fallback
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    const onDown = (e) => {
      if (getState().mode !== 'walk' || e.pointerType === 'touch') return;
      dragging = true;
      if (!document.pointerLockElement && el.requestPointerLock) {
        try {
          const p = el.requestPointerLock();
          if (p && p.catch) p.catch(() => {});
        } catch {
          /* drag to look still works */
        }
      }
    };
    const onMove = (e) => {
      if (getState().mode !== 'walk') return;
      if (document.pointerLockElement === el || (dragging && e.pointerType !== 'touch')) {
        input.lookDX += e.movementX || 0;
        input.lookDY += e.movementY || 0;
      }
    };
    const onUp = () => (dragging = false);
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

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = st.current;
    const g = getState();
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
      startBlend(SPAWN.x, SPAWN.z, SPAWN.look, 1.9);
    }
    if (g.jumpTo) {
      const j = JUMPS[g.jumpTo];
      setState({ jumpTo: null });
      if (j) startBlend(j.pos[0], j.pos[1], j.look, 1.4);
    }

    if (s.blend) {
      const b = s.blend;
      b.t += dt / b.dur;
      const k = smooth(Math.min(1, b.t));
      camera.position.lerpVectors(b.from, b.to, k);
      camera.quaternion.slerpQuaternions(b.fromQ, b.toQ, k);
      if (b.t >= 1) {
        Object.assign(s, b.end);
        s.blend = null;
      }
      input.lookDX = 0;
      input.lookDY = 0;
    } else {
      // look
      const touchK = isTouch ? 1.5 : 1;
      s.yaw -= input.lookDX * SENS * touchK;
      s.pitch -= input.lookDY * SENS * touchK;
      s.pitch = Math.max(-1.35, Math.min(1.35, s.pitch));
      input.lookDX = 0;
      input.lookDY = 0;

      // move
      const k = input.keys;
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
      const dx = (-sy * mz + cy * mx) * speed * dt;
      const dz = (-cy * mz - sy * mx) * speed * dt;
      let moved = false;
      if (Math.abs(dx) + Math.abs(dz) > 1e-5) {
        moved = tryMove(s, dx, 0) | tryMove(s, 0, dz);
      }

      // floor and head bob
      const target = floorAt(s.x, s.z);
      s.fy += (target - s.fy) * Math.min(1, dt * (target > s.fy ? 14 : 9));
      const moving = moved && Math.min(1, Math.hypot(mx, mz)) > 0.1;
      s.bobA += ((moving ? (jog ? 0.05 : 0.032) : 0) - s.bobA) * Math.min(1, dt * 6);
      if (moving) s.bobT += dt * speed * 3.1;
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
