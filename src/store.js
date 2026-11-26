import { useSyncExternalStore } from 'react';

// Tiny shared store so the HTML page and the lazy 3D world can talk.
let state = {
  progress: 0,
  loaded: false,
  mode: 'intro', // 'intro' | 'walk'
  hotspot: null,
  plan: 'dropin',
  music: false,
  jumpTo: null,
  locked: false,
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch;
  if (!next) return;
  let changed = false;
  for (const k in next) if (state[k] !== next[k]) changed = true;
  if (!changed) return;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore(selector) {
  return useSyncExternalStore(subscribe, () => selector(state));
}

// Where the walker is, updated every frame (not React state).
export const player = { x: 0.4, z: 10, inTruck: false };

export function bookPlan(plan) {
  setState({ plan });
  if (document.pointerLockElement) document.exitPointerLock?.();
  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
