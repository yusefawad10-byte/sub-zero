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
  // service cards
  hover: null, // service under the cursor / crosshair
  pinned: null, // card the visitor clicked to keep open
  cardHover: false, // pointer is over the card itself
  // guided tour
  explore: 'free', // 'free' | 'tour'
  tourStop: 0,
  tourPhase: 'idle', // 'walking' | 'stop' | 'paused' | 'idle'
  tourCmd: null, // { type, n } commands for the 3D tour driver
  booking: false, // in-world booking panel open
  help: false,
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

// Book from inside the 3D world: open the booking panel without leaving the walk.
export function openBooking(plan) {
  setState({ plan, booking: true, tourPhase: state.explore === 'tour' ? 'paused' : state.tourPhase });
  if (document.pointerLockElement) document.exitPointerLock?.();
}

export function bookPlan(plan) {
  setState({ plan });
  if (document.pointerLockElement) document.exitPointerLock?.();
  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
