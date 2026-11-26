// Shared layout: sizes, positions, colliders, floor heights, hotspots and jump points.
// Matches the Sub Zero renders: truck along x, open side faces +z (towards you),
// cab on the LEFT (-x). Left to right along the open side: closed black panel with
// the SUB ZERO lettering and the ice tubs in front, the cedar sauna with a glass front,
// then the bar with shelves, a double drinks fridge and hanging plants. Units are metres.

export const EYE = 1.62;
export const RADIUS = 0.26;
export const BODY = 1.7;

export const BOX = { x0: -3.6, x1: 3.6, z0: -1.3, z1: 1.3, floor: 0.6, ceil: 3.4 };
export const DECK = { x0: -3.6, x1: 3.6, z0: 1.3, z1: 3.9, y: 0.6 };
export const STEPS = { x0: -1.4, x1: 0.4, rows: [[3.9, 4.25, 0.4], [4.25, 4.6, 0.2]] };

// Closed part of the side wall (behind the tubs) that carries the big lettering.
export const PANEL = { x0: -3.6, x1: -1.55 };

// Awning hinge sits on the top of the open side; it lifts out over the deck.
export const AWNING = { hingeY: 3.45, hingeZ: 1.3, depth: 2.75, tilt: 0.1, width: 7.35 };
export const AWNING_EDGE = {
  y: AWNING.hingeY + AWNING.depth * Math.sin(AWNING.tilt),
  z: AWNING.hingeZ + AWNING.depth * Math.cos(AWNING.tilt),
};

export const SAUNA = { x0: -1.55, x1: 0.35, z0: -1.3, z1: 1.15, door: [-0.95, -0.2], top: 3.0 };
// Café platform: slides out from beneath the back of the truck, at truck floor height.
export const CAFE = { x0: 3.6, x1: 7.4, z0: -1.3, z1: 2.6, y: 0.6, roof: 3.4 };
export const CAFE_STEPS = { x0: 4.9, x1: 6.5, rows: [[2.6, 2.95, 0.4], [2.95, 3.3, 0.2]] };
export const BAR = { x0: 4.0, x1: 7.0, z0: -0.05, z1: 0.5, top: 1.62 };
export const SHELVES = { x0: 3.95, x1: 5.9 };
export const FRIDGE = { x0: 6.0, x1: 7.0, z0: -1.27, z1: -0.67 };
export const TUB = { w: 1.0, l: 0.86, h: 0.86 };
export const TUBS = [
  { x: -3.0, z: 2.05 },
  { x: -1.97, z: 2.05 },
];
// black massage table on the deck, in front of the shelving (as in the reference)
export const STRETCH = { x: 1.85, z: 2.45, w: 1.9, l: 0.7, h: 0.7 };
// illuminated wellness shelving along the back wall inside the truck
export const WELLNESS = { x0: 0.6, x1: 3.5, z0: -1.27, z1: -0.95 };
export const PLANTS = [
  { x: -1.2, y: 0.6, z: 1.55, s: 1.25 },
  { x: 3.3, y: 0.6, z: 3.6, s: 0.85 },
  { x: 7.1, y: 0.6, z: 2.3, s: 0.8 },
];

export const DJ = { x: -5.4, z: 6.2 };
export const SPEAKERS = [
  { x: -7.2, z: 5.9, rot: 0.3 },
  { x: -3.55, z: 5.7, rot: -0.3 },
];
export const SUB = { x: -5.4, z: 6.95 };
export const UPLIGHTS = [
  { x: -6.3, z: 6.85, target: [-6.8, 5.5, 2.5] },
  { x: -4.5, z: 6.85, target: [-3.0, 4.2, 1.4] },
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
  { x: -5.9, z: 9.4 },
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

export const SPAWN = { x: -0.5, z: 10, look: [-0.5, 1.7, 0] };

export const JUMPS = {
  dj: { pos: [-5.0, 10.2], look: [-5.4, 1.2, 6.2] },
  tubs: { pos: [-1.0, 3.35], look: [-2.6, 1.0, 2.0] },
  sauna: { pos: [-0.57, 2.1], look: [-0.57, 1.5, -1.0] },
  bar: { pos: [5.0, 2.35], look: [5.5, 2.0, -1.2] },
  outside: { pos: [SPAWN.x, SPAWN.z], look: SPAWN.look },
  // roughly the camera angle of the reference render (used for visual checks)
  reference: { pos: [-0.9, 8.6], look: [-0.3, 1.55, 0.6] },
};

export const HOTSPOTS = [
  { id: 'dj', x: DJ.x, z: DJ.z + 0.8, r: 4.0 },
  { id: 'tubs', x: -2.45, z: 2.3, r: 2.0 },
  { id: 'stretch', x: STRETCH.x, z: STRETCH.z + 0.3, r: 1.3 },
  { id: 'sauna', x: -0.6, z: 0.5, r: 1.9 },
  { id: 'bar', x: 5.5, z: 1.2, r: 1.9 },
  { id: 'middle', x: 1.2, z: 0.75, r: 0.75 },
];

export const BOUNDS = { x0: -26, x1: 26, z0: -16, z1: 24 };

// ---------- colliders: boxes in x/z with a height range ----------
const c = (x0, x1, z0, z1, y0 = 0, y1 = 4) => ({ x0, x1, z0, z1, y0, y1 });
const around = (x, z, r, y0 = 0, y1 = 4) => c(x - r, x + r, z - r, z + r, y0, y1);

export const COLLIDERS = [
  // truck shell
  c(-3.6, 3.75, -1.45, -1.27), // back wall
  c(3.58, 3.75, -1.45, 1.3), // rear end wall
  c(-6.35, -3.58, -1.42, 1.42), // cab
  c(-5.7, -5.5, -1.75, 1.75, 1.8, 2.6), // mirrors
  c(PANEL.x0, PANEL.x1 + 0.05, -1.3, 1.36), // closed panel section (storage behind)
  // sauna
  c(SAUNA.x0 - 0.05, SAUNA.door[0], 1.08, 1.2, 0.6, 3.4), // glass left of door
  c(SAUNA.door[1], SAUNA.x1 + 0.07, 1.08, 1.2, 0.6, 3.4), // glass right of door
  c(SAUNA.x1 - 0.05, SAUNA.x1 + 0.07, -1.3, 1.2, 0.6, 3.4), // right wall
  c(SAUNA.x0, SAUNA.x1, -1.3, -0.5, 0.6, 1.3), // benches
  c(-0.06, 0.3, 0.55, 0.93, 0.6, 1.5), // heater
  c(-0.27, -0.02, 1.2, 1.98, 0.6, 3), // open glass door
  c(WELLNESS.x0 - 0.04, WELLNESS.x1 + 0.04, -1.3, WELLNESS.z1 + 0.05, 0.6, 3), // wellness shelving
  // café: back wall, bar block (counter + staff area + fridge), canopy posts
  c(3.7, CAFE.x1 + 0.05, -1.45, -1.28),
  c(BAR.x0 - 0.05, CAFE.x1 + 0.05, -1.3, BAR.z1 + 0.06, 0.6, 3),
  around(CAFE.x1 - 0.08, CAFE.z1 - 0.08, 0.09),
  ...PLANTS.map((p) => around(p.x, p.z, 0.22, 0.6, 2)),
  // deck furniture
  ...TUBS.map((t) => c(t.x - TUB.w / 2, t.x + TUB.w / 2, t.z - TUB.l / 2, t.z + TUB.l / 2, 0.6, 1.6)),
  c(STRETCH.x - STRETCH.w / 2, STRETCH.x + STRETCH.w / 2, STRETCH.z - STRETCH.l / 2, STRETCH.z + STRETCH.l / 2, 0.6, 1.4),
  // DJ area
  c(DJ.x - 0.95, DJ.x + 0.95, DJ.z - 0.4, DJ.z + 0.4, 0, 1.2),
  ...SPEAKERS.map((s) => around(s.x, s.z, 0.5)),
  around(SUB.x, SUB.z, 0.3, 0, 0.5),
  ...UPLIGHTS.map((u) => around(u.x, u.z, 0.12, 0, 0.3)),
  // outside
  ...POLES.map((p) => around(p.x, p.z, 0.1)),
  ...PALMS.map((p) => around(p.x, p.z, 0.32, 0, 9)),
  ...LAMPS.map((p) => around(p.x, p.z, 0.14, 0, 7)),
  around(AFRAME.x, AFRAME.z, 0.45, 0, 1.2),
];

// Height of whatever you are standing on at (x, z).
export function floorAt(x, z) {
  if (x >= DECK.x0 && x <= DECK.x1 && z >= BOX.z0 && z <= DECK.z1) return 0.6;
  if (x > CAFE.x0 && x <= CAFE.x1 && z >= CAFE.z0 && z <= CAFE.z1) return CAFE.y;
  if (x >= STEPS.x0 && x <= STEPS.x1) {
    for (const [z0, z1, y] of STEPS.rows) if (z > z0 && z <= z1) return y;
  }
  if (x >= CAFE_STEPS.x0 && x <= CAFE_STEPS.x1) {
    for (const [z0, z1, y] of CAFE_STEPS.rows) if (z > z0 && z <= z1) return y;
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
