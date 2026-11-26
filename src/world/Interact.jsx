import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { isTouch } from '../quality';
import { getState, setState } from '../store';
import { SERVICE_ANCHORS } from './layout';
import { activeService, serviceRoots, ui } from './registry';

// Wraps part of the scene so it can be hovered, clicked and outlined as one service.
export function Service({ id, children }) {
  const ref = useRef();
  useEffect(() => {
    const g = ref.current;
    g.userData.serviceRoot = id;
    serviceRoots[id] = g;
    return () => {
      if (serviceRoots[id] === g) delete serviceRoots[id];
    };
  }, [id]);
  return <group ref={ref}>{children}</group>;
}

function pauseTourIfWalking() {
  const s = getState();
  if (s.explore === 'tour' && s.tourPhase === 'walking') setState({ tourPhase: 'paused' });
}

// Raycasts the cursor (or the crosshair when the pointer is locked) against the services,
// handles clicks, and keeps the floating card next to its object.
export default function Interact() {
  const { camera, gl } = useThree();
  const ray = useMemo(() => {
    const r = new THREE.Raycaster();
    r.far = 16;
    return r;
  }, []);
  const mouse = useRef({ x: 0, y: 0, inside: false, dx: 0, dy: 0, t: 0 });
  const frame = useRef(0);
  const v = useMemo(() => new THREE.Vector3(), []);

  const pick = (nx, ny) => {
    const roots = Object.values(serviceRoots);
    if (!roots.length) return null;
    ray.setFromCamera({ x: nx, y: ny }, camera);
    const hits = ray.intersectObjects(roots, true);
    for (const h of hits) {
      let o = h.object;
      while (o && !o.userData.serviceRoot) o = o.parent;
      if (o) return o.userData.serviceRoot;
    }
    return null;
  };

  useEffect(() => {
    const el = gl.domElement;
    const ndc = (e) => {
      const r = el.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1];
    };
    ui.pickAt = (cx, cy) => {
      const [x, y] = ndc({ clientX: cx, clientY: cy });
      return pick(x, y);
    };
    const move = (e) => {
      if (e.pointerType === 'touch') return;
      const [x, y] = ndc(e);
      mouse.current.x = x;
      mouse.current.y = y;
      mouse.current.inside = true;
    };
    const leave = () => (mouse.current.inside = false);
    const down = (e) => {
      mouse.current.dx = e.clientX;
      mouse.current.dy = e.clientY;
      mouse.current.t = performance.now();
    };
    const up = (e) => {
      const s = getState();
      if (s.mode !== 'walk' || e.pointerType === 'touch') return;
      const moved = Math.hypot(e.clientX - mouse.current.dx, e.clientY - mouse.current.dy);
      if (moved > 6 || performance.now() - mouse.current.t > 450) return;
      const locked = document.pointerLockElement === el;
      const id = locked ? pick(0, 0) : pick(...ndc(e));
      if (id) {
        setState({ pinned: s.pinned === id ? null : id });
        pauseTourIfWalking();
        if (locked) document.exitPointerLock?.();
      } else if (s.pinned) {
        setState({ pinned: null });
      }
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
      ui.pickAt = null;
    };
  }, [gl, camera]);

  useFrame(() => {
    const s = getState();
    frame.current++;
    const el = gl.domElement;
    const locked = document.pointerLockElement === el;

    // hover, every third frame
    if (frame.current % 3 === 0) {
      let hover = null;
      if (s.mode === 'walk' && !s.booking) {
        if (locked) hover = pick(0, 0);
        else if (!isTouch && mouse.current.inside) hover = pick(mouse.current.x, mouse.current.y);
      }
      if (hover !== s.hover) setState({ hover });
      el.style.cursor = hover && !locked ? 'pointer' : '';
    }

    // keep the floating card beside its object
    const card = ui.cardEl;
    if (!card) return;
    const id = activeService(s) || card.dataset.service;
    const a = id && SERVICE_ANCHORS[id];
    if (!a || ui.docked) return;
    // projected half-width of the object, so the card clears it
    v.set(a[0], a[1], a[2]).applyMatrix4(camera.matrixWorldInverse);
    const dist = Math.max(0.5, -v.z);
    const r = el.getBoundingClientRect();
    const halfPx = ((a[3] || 0.8) / dist) * (r.height / (2 * Math.tan((camera.fov * Math.PI) / 360)));
    v.set(a[0], a[1], a[2]).project(camera);
    const behind = v.z > 1;
    const sx = (v.x * 0.5 + 0.5) * r.width;
    const sy = (-v.y * 0.5 + 0.5) * r.height;
    const w = card.offsetWidth || 340;
    const h = card.offsetHeight || 260;
    let x = sx + halfPx + 24;
    if (x + w > r.width - 16) x = sx - halfPx - w - 24;
    x = Math.max(16, Math.min(r.width - w - 16, x));
    const y = Math.max(124, Math.min(r.height - h - 16, sy - h / 2));
    card.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    card.style.setProperty('--dot-x', `${Math.round(sx - x)}px`);
    card.style.setProperty('--dot-y', `${Math.round(sy - y)}px`);
    card.classList.toggle('offscreen', behind);
  });

  return null;
}
