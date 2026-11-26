import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { rng } from '../canvasTextures';

// ---------------------------------------------------------------------------
// Small, realistic props shared across the bar, fridge, shelving and deck:
// lathe-turned bottles with caps, labels and liquid, terry-cloth towels,
// and surface textures (terry cloth, leather) made once on a canvas.
// ---------------------------------------------------------------------------

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// noise height -> normal map
function noiseNormal(size, scale, seed, strength) {
  return canvasTex(
    size,
    size,
    (x, w, h) => {
      const r = rng(seed);
      const hgt = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) hgt[i] = r();
      // blur a little so it reads as fabric / leather grain
      for (let pass = 0; pass < scale; pass++) {
        const n = new Float32Array(w * h);
        for (let y = 0; y < h; y++)
          for (let xx = 0; xx < w; xx++) {
            let s = 0;
            for (let dy = -1; dy <= 1; dy++)
              for (let dx = -1; dx <= 1; dx++) s += hgt[((y + dy + h) % h) * w + ((xx + dx + w) % w)];
            n[y * w + xx] = s / 9;
          }
        hgt.set(n);
      }
      const img = x.createImageData(w, h);
      for (let y = 0; y < h; y++)
        for (let xx = 0; xx < w; xx++) {
          const dx = (hgt[y * w + ((xx + 1) % w)] - hgt[y * w + ((xx - 1 + w) % w)]) * strength;
          const dy = (hgt[((y + 1) % h) * w + xx] - hgt[((y - 1 + h) % h) * w + xx]) * strength;
          const l = Math.hypot(dx, dy, 1);
          const k = (y * w + xx) * 4;
          img.data[k] = (-dx / l) * 127 + 128;
          img.data[k + 1] = (-dy / l) * 127 + 128;
          img.data[k + 2] = (1 / l) * 127 + 128;
          img.data[k + 3] = 255;
        }
      x.putImageData(img, 0, 0);
    },
    false
  );
}

let TEX = null;
export function propTextures() {
  if (TEX) return TEX;
  TEX = {
    terry: noiseNormal(128, 1, 5, 9),
    leather: noiseNormal(128, 2, 9, 14),
  };
  TEX.terry.repeat.set(3, 3);
  TEX.leather.repeat.set(10, 10);
  return TEX;
}

// ---------------- bottles ----------------
const PROFILES = {
  // sports / electrolyte bottle: rounded base, waist, shoulder, short neck
  sport: [
    [0, 0], [0.028, 0], [0.031, 0.006], [0.031, 0.06], [0.027, 0.075], [0.031, 0.09], [0.031, 0.15],
    [0.026, 0.175], [0.014, 0.19], [0.012, 0.2],
  ],
  // juice bottle: straight body, round shoulder
  juice: [
    [0, 0], [0.03, 0], [0.032, 0.005], [0.032, 0.14], [0.028, 0.165], [0.016, 0.178], [0.015, 0.19],
  ],
  // small amber apothecary bottle for wellness products
  amber: [
    [0, 0], [0.026, 0], [0.028, 0.005], [0.028, 0.095], [0.022, 0.11], [0.01, 0.115], [0.01, 0.13],
  ],
};
const GEO = {};
function bottleGeo(kind, inset = 0, top = 1) {
  const key = `${kind}${inset}${top}`;
  if (GEO[key]) return GEO[key];
  const prof = PROFILES[kind];
  const maxY = prof[prof.length - 1][1] * top;
  const pts = prof
    .filter(([, y]) => y <= maxY + 1e-6)
    .map(([x, y]) => new THREE.Vector2(Math.max(0, x - inset), y + (y === 0 ? inset : 0)));
  const g = new THREE.LatheGeometry(pts, 24);
  g.computeVertexNormals();
  GEO[key] = g;
  return g;
}

const LABELS = {};
function labelTex(text, color) {
  const key = text + color;
  if (LABELS[key]) return LABELS[key];
  LABELS[key] = canvasTex(256, 96, (x, w, h) => {
    x.fillStyle = color;
    x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,0.9)';
    x.font = '700 30px "Archivo Black", Arial Black, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(text, w / 2, h / 2 - 8);
    x.font = '500 14px Inter, sans-serif';
    x.fillText('SUB ZERO · 500 ml', w / 2, h / 2 + 22);
  });
  return LABELS[key];
}

const SHARED = {};
function shared() {
  if (SHARED.ok) return SHARED;
  SHARED.ok = true;
  SHARED.plastic = new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  SHARED.amberGlass = new THREE.MeshPhysicalMaterial({
    color: '#6b3608',
    roughness: 0.08,
    clearcoat: 1,
    transparent: true,
    opacity: 0.82,
  });
  SHARED.cap = new THREE.MeshStandardMaterial({ color: '#f2f2f0', roughness: 0.35 });
  SHARED.capBlack = new THREE.MeshStandardMaterial({ color: '#16171a', roughness: 0.4, metalness: 0.2 });
  SHARED.capGeo = new THREE.CylinderGeometry(0.0145, 0.0145, 0.022, 20);
  return SHARED;
}

const LIQUIDS = {};
function liquidMat(color) {
  if (!LIQUIDS[color])
    LIQUIDS[color] = new THREE.MeshStandardMaterial({ color, roughness: 0.2, transparent: true, opacity: 0.85, emissive: color, emissiveIntensity: 0.08 });
  return LIQUIDS[color];
}

const DRINKS = [
  ['#5ec8f2', 'ELECTRO', '#1f5f86'],
  ['#f2a14b', 'CITRUS', '#8a4a14'],
  ['#e46a8f', 'BERRY', '#7a1f3a'],
  ['#9be26a', 'LIME', '#2f6b23'],
];

// A drink bottle: clear body, liquid inside, printed label and a screw cap.
export function Bottle({ p, i = 0, kind = 'sport', s = 1, ry = 0 }) {
  const m = shared();
  const [liquid, name, labelColor] = DRINKS[i % DRINKS.length];
  const prof = PROFILES[kind];
  const h = prof[prof.length - 1][1];
  const label = useMemo(() => labelTex(name, labelColor), [name, labelColor]);
  return (
    <group position={p} scale={s} rotation={[0, ry, 0]}>
      <mesh geometry={bottleGeo(kind, 0.002, 0.78)} material={liquidMat(liquid)} />
      <mesh geometry={bottleGeo(kind)} material={m.plastic} renderOrder={2} />
      <mesh position={[0, h * 0.5, 0]}>
        <cylinderGeometry args={[0.0322, 0.0322, h * 0.32, 24, 1, true]} />
        <meshStandardMaterial map={label} roughness={0.5} />
      </mesh>
      <mesh geometry={m.capGeo} material={i % 3 ? m.cap : m.capBlack} position={[0, h + 0.008, 0]} />
    </group>
  );
}

// Small amber wellness bottle with a black dropper cap.
export function AmberBottle({ p, s = 1 }) {
  const m = shared();
  return (
    <group position={p} scale={s}>
      <mesh geometry={bottleGeo('amber')} material={m.amberGlass} />
      <mesh position={[0, 0.14, 0]} material={m.capBlack}>
        <cylinderGeometry args={[0.011, 0.012, 0.025, 16]} />
      </mesh>
      <mesh position={[0, 0.162, 0]} material={m.capBlack}>
        <sphereGeometry args={[0.012, 12, 8]} />
      </mesh>
    </group>
  );
}

// ---------------- towels ----------------
const TOWEL = {};
function towelMat(color) {
  if (!TOWEL[color]) {
    const t = propTextures();
    TOWEL[color] = new THREE.MeshStandardMaterial({ color, roughness: 1, normalMap: t.terry, normalScale: new THREE.Vector2(0.9, 0.9) });
  }
  return TOWEL[color];
}

// A neatly folded towel: soft rounded layers with a visible fold.
export function FoldedTowel({ p, w = 0.28, d = 0.22, layers = 3, color = '#efeae0', ry = 0 }) {
  const mat = towelMat(color);
  return (
    <group position={p} rotation={[0, ry, 0]}>
      {Array.from({ length: layers }, (_, k) => (
        <RoundedBox
          key={k}
          args={[w - (k % 2) * 0.004, 0.034, d]}
          radius={0.016}
          smoothness={3}
          position={[(k % 2) * 0.003, 0.018 + k * 0.032, 0]}
          material={mat}
        />
      ))}
    </group>
  );
}

// A rolled towel: a soft cylinder with a spiral visible on both ends.
let SPIRAL = null;
function spiralTex() {
  if (!SPIRAL)
    SPIRAL = canvasTex(128, 128, (x, w) => {
      x.fillStyle = '#e8e2d6';
      x.fillRect(0, 0, w, w);
      x.strokeStyle = 'rgba(120,110,95,0.55)';
      x.lineWidth = 3;
      x.beginPath();
      for (let a = 0; a < Math.PI * 9; a += 0.1) {
        const r = 4 + a * 2;
        x.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r);
      }
      x.stroke();
    });
  return SPIRAL;
}
export function RolledTowel({ p, len = 0.34, r = 0.06, color = '#efeae0', rot = [0, 0, Math.PI / 2] }) {
  const mat = towelMat(color);
  const end = useMemo(() => new THREE.MeshStandardMaterial({ map: spiralTex(), roughness: 1 }), []);
  return (
    <group position={p} rotation={rot}>
      <mesh material={mat}>
        <cylinderGeometry args={[r, r, len, 28, 1, true]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, (s * len) / 2, 0]} rotation={[s * -Math.PI / 2, 0, 0]} material={end}>
          <circleGeometry args={[r, 28]} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------- irregular ice ----------------
// A few jittered chunk shapes; instancing picks between them.
export function iceGeometries(seed = 3, count = 3) {
  const out = [];
  const r = rng(seed);
  for (let k = 0; k < count; k++) {
    const g = new THREE.IcosahedronGeometry(1, 1);
    const pos = g.attributes.position;
    const seen = new Map();
    for (let i = 0; i < pos.count; i++) {
      const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
      if (!seen.has(key)) seen.set(key, 0.72 + r() * 0.42);
      const f = seen.get(key);
      pos.setXYZ(i, pos.getX(i) * f * (1 + k * 0.15), pos.getY(i) * f * 0.8, pos.getZ(i) * f);
    }
    g.computeVertexNormals();
    out.push(g);
  }
  return out;
}
