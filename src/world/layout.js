// Shared layout: sizes, positions, colliders, floor heights, hotspots and jump points.
// Truck runs along x, open side faces +z, cab at +x. Units are metres.

export const EYE = 1.62;
export const RADIUS = 0.26;
export const BODY = 1.7;

export const BOX = { x0: -3.6, x1: 3.6, z0: -1.3, z1: 1.3, floor: 0.6, ceil: 3.4 };
export const DECK = { x0: -3.6, x1: 3.6, z0: 1.3, z1: 3.9, y: 0.6 };
export const STEPS = { x0: -0.6, x1: 1.4, rows: [[3.9, 4.25, 0.4], [4.25, 4.6, 0.2]] };

// Awning hinge sits on the top of the open side; it lifts out over the deck.
export const AWNING = { hingeY: 3.45, hingeZ: 1.3, depth: 2.75, tilt: 0.14, width: 7.35 };
export const AWNING_EDGE = {
  y: AWNING.hingeY + AWNING.depth * Math.sin(AWNING.tilt),
  z: AWNING.hingeZ + AWNING.depth * Math.cos(AWNING.tilt),
};

export const SAUNA = { x0: -3.6, x1: -1.55, z0: -1.3, z1: 0.5, door: [-3.05, -2.3], top: 2.95 };
export const BAR = { x0: 1.5, x1: 3.45, z0: -0.15, z1: 0.45, top: 1.62 };
export const FRIDGE = { x0: 3.05, x1: 3.55, z0: -1.27, z1: -0.67 };
export const TUB = { w: 0.95, l: 1.7, h: 0.72 };
export const TUBS = [
  { x: -2.8, z: 2.55 },
  { x: -1.6, z: 2.55 },
];
export const STRETCH = { x: 2.65, z: 2.6, w: 0.75, l: 1.9, h: 0.72 };
export const TOWEL_BENCH = { x0: -1.3, x1: 0.2, z0: -1.3, z1: -0.85 };
export const PLANTS = [
  { x: 0.65, y: 0.6, z: -1.05, s: 1 },
  { x: 3.3, y: 0.6, z: 3.6, s: 0.85 },
];

export const DJ = { x: -6.2, z: 5.6 };
export const SPEAKERS = [
  { x: -8.1, z: 5.1, rot: 0.35 },
  { x: -4.3, z: 5.1, rot: -0.35 },
];
export const SUB = { x: -7.45, z: 6.4 };
export const UPLIGHTS = [
  { x: -4.1, z: 4.75, target: [-2.6, 3.6, 1.2] },
  { x: 4.3, z: 4.6, target: [3.0, 3.6, 1.2] },
];

export const PALMS = [
  { x: -10.5, z: 2.2, h: 7.2, lean: [0.5, 0.2] },
  { x: 9.8, z: 3.4, h: 6.6, lean: [-0.4, 0.3] },
  { x: -11.5, z: 11.5, h: 7.8, lean: [0.3, -0.4] },
  { x: 12.5, z: 12.2, h: 7.0, lean: [-0.5, -0.2] },
  { x: -15, z: -6, h: 8.4, lean: [0.4, 0.4] },
  { x: 15.5, z: -4.5, h: 7.6, lean: [-0.3, 0.4] },
];
export const POLES = [
  { x: -5.6, z: 8.6 },
  { x: 5.6, z: 8.6 },
  { x: -9.2, z: 6.2 },
  { x: 8.9, z: 7.2 },
];
export const POLE_H = 4.6;
export const LAMPS = [
  { x: -13, z: 7.5, rot: -Math.PI / 2 },
  { x: 13, z: -1.5, rot: Math.PI / 2 },
];
export const AFRAME = { x: 2.9, z: 6.2, rot: -0.35 };

export const SPAWN = { x: 0.4, z: 10, look: [0.2, 1.7, 0] };

export const JUMPS = {
  dj: { pos: [-6.2, 9.3], look: [-6.2, 1.2, 5.6] },
  tubs: { pos: [-0.5, 3.4], look: [-2.3, 0.9, 2.5] },
  sauna: { pos: [-2.68, 1.25], look: [-2.68, 1.4, -1.0] },
  bar: { pos: [1.1, 1.15], look: [2.6, 1.6, -0.6] },
  outside: { pos: [SPAWN.x, SPAWN.z], look: SPAWN.look },
};

export const HOTSPOTS = [
  { id: 'dj', x: DJ.x, z: DJ.z + 0.6, r: 4.0 },
  { id: 'tubs', x: -2.2, z: 2.6, r: 2.0 },
  { id: 'stretch', x: STRETCH.x, z: STRETCH.z, r: 1.3 },
  { id: 'sauna', x: -2.6, z: 0, r: 1.9 },
  { id: 'bar', x: 2.4, z: 0.95, r: 1.6 },
  { id: 'middle', x: 0, z: 0.2, r: 1.15 },
];

export const BOUNDS = { x0: -26, x1: 26, z0: -16, z1: 24 };

// ---------- colliders: boxes in x/z with a height range ----------
const c = (x0, x1, z0, z1, y0 = 0, y1 = 4) => ({ x0, x1, z0, z1, y0, y1 });
const around = (x, z, r, y0 = 0, y1 = 4) => c(x - r, x + r, z - r, z + r, y0, y1);

export const COLLIDERS = [
  // truck shell
  c(-3.75, 3.6, -1.45, -1.27), // back wall
  c(-3.75, -3.58, -1.45, 1.3), // rear end wall
  c(3.58, 6.1, -1.42, 1.42), // cab
  // sauna
  c(-3.6, SAUNA.door[0], 0.42, 0.56, 0.6, 3.4),
  c(SAUNA.door[1], -1.5, 0.42, 0.56, 0.6, 3.4),
  c(-1.63, -1.5, -1.3, 0.56, 0.6, 3.4),
  c(-3.6, -1.63, -1.3, -0.5, 0.6, 1.3), // benches
  c(-2.05, -1.63, -0.5, -0.08, 0.6, 1.5), // heater
  c(-2.36, -2.12, 0.56, 1.32, 0.6, 3), // open glass door
  // bar block (counter + staff area + fridge)
  c(1.45, 3.6, -1.3, 0.5, 0.6, 3),
  // middle
  c(TOWEL_BENCH.x0, TOWEL_BENCH.x1, TOWEL_BENCH.z0, TOWEL_BENCH.z1, 0.6, 1.3),
  ...PLANTS.map((p) => around(p.x, p.z, 0.22, 0.6, 2)),
  // deck furniture
  ...TUBS.map((t) => c(t.x - TUB.w / 2, t.x + TUB.w / 2, t.z - TUB.l / 2, t.z + TUB.l / 2, 0.6, 1.4)),
  c(STRETCH.x - STRETCH.w / 2, STRETCH.x + STRETCH.w / 2, STRETCH.z - STRETCH.l / 2, STRETCH.z + STRETCH.l / 2, 0.6, 1.4),
  // DJ area
  c(DJ.x - 0.95, DJ.x + 0.95, DJ.z - 0.4, DJ.z + 0.4, 0, 1.2),
  ...SPEAKERS.map((s) => around(s.x, s.z, 0.5)),
  around(SUB.x, SUB.z, 0.4, 0, 0.7),
  ...UPLIGHTS.map((u) => around(u.x, u.z, 0.15, 0, 0.4)),
  // outside
  ...POLES.map((p) => around(p.x, p.z, 0.1)),
  ...PALMS.map((p) => around(p.x, p.z, 0.32, 0, 9)),
  ...LAMPS.map((p) => around(p.x, p.z, 0.14, 0, 7)),
  around(AFRAME.x, AFRAME.z, 0.45, 0, 1.2),
];

// Height of whatever you are standing on at (x, z).
export function floorAt(x, z) {
  if (x >= DECK.x0 && x <= DECK.x1 && z >= BOX.z0 && z <= DECK.z1) return 0.6;
  if (x >= STEPS.x0 && x <= STEPS.x1) {
    for (const [z0, z1, y] of STEPS.rows) if (z > z0 && z <= z1) return y;
  }
  return 0;
}

export function collides(x, z, feet) {
  for (const b of COLLIDERS) {
    if (!(feet < b.y1 - 0.02 && feet + BODY > b.y0)) continue;
    const cx = Math.max(b.x0, Math.min(x, b.x1));
    const cz = Math.max(b.z0, Math.min(z, b.z1));
    const dx = x - cx;
    const dz = z - cz;
    if (dx * dx + dz * dz < RADIUS * RADIUS) return true;
  }
  return false;
}

export function insideTruck(x, z) {
  return x > BOX.x0 && x < BOX.x1 && z > BOX.z0 && z < BOX.z1;
}
