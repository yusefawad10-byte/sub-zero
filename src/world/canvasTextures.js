import * as THREE from 'three';
import { plans, truckText } from '../content';

export const C = {
  green: '#1F3A34',
  cream: '#F3EBDD',
  rust: '#C4472D',
  yellow: '#E8B84A',
  ice: '#6FD3FF',
};

const HEAD = '"Archivo Black", "Arial Black", sans-serif';
const BODY = 'Inter, system-ui, sans-serif';

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function make(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function toTex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function fit(ctx, text, font, size, maxW) {
  let s = size;
  ctx.font = font(s);
  while (ctx.measureText(text).width > maxW && s > 8) {
    s -= 2;
    ctx.font = font(s);
  }
  return s;
}

function spaced(ctx, text, x, y, spacing) {
  // draw centred text with letter spacing
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = x - total / 2;
  const align = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((ch, i) => {
    ctx.fillText(ch, cx, y);
    cx += widths[i] + spacing;
  });
  ctx.textAlign = align;
}

export function logoTexture({ ring = C.cream, text = C.cream, fill = null } = {}) {
  const [c, x] = make(512, 512);
  if (fill) {
    x.fillStyle = fill;
    x.beginPath();
    x.arc(256, 256, 236, 0, Math.PI * 2);
    x.fill();
  }
  x.strokeStyle = ring;
  x.lineWidth = 22;
  x.beginPath();
  x.arc(256, 256, 220, 0, Math.PI * 2);
  x.stroke();
  x.fillStyle = text;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = `200px ${HEAD}`;
  x.fillText('SZ', 256, 270);
  return toTex(c);
}

export function backLetteringTexture() {
  const [c, x] = make(1024, 512);
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = C.cream;
  fit(x, truckText.back, (s) => `${s}px ${HEAD}`, 200, 960);
  x.fillText(truckText.back, 512, 220);
  x.fillStyle = C.yellow;
  x.font = `600 44px ${BODY}`;
  spaced(x, truckText.backSub, 512, 372, 10);
  return toTex(c);
}

// Big side lettering from the renders: "SUB" in cream over "ZERO" in blue, with a small wave mark.
export function sideLetteringTexture() {
  const [c, x] = make(1024, 900);
  x.textAlign = 'left';
  x.textBaseline = 'alphabetic';
  x.strokeStyle = '#7fc6ee';
  x.lineWidth = 9;
  x.lineJoin = 'round';
  x.beginPath();
  for (let i = 0; i <= 8; i++) x.lineTo(70 + i * 26, 150 + (i % 2 ? -14 : 14));
  x.stroke();
  x.fillStyle = '#ece7e0';
  x.font = `330px ${HEAD}`;
  x.fillText('SUB', 50, 470);
  x.fillStyle = '#5bb2e6';
  fit(x, 'ZERO', (s) => `${s}px ${HEAD}`, 330, 940);
  x.fillText('ZERO', 50, 800);
  return toTex(c);
}

export function signTexture() {
  const [c, x] = make(1024, 360);
  x.fillStyle = C.green;
  x.fillRect(0, 0, 1024, 360);
  x.strokeStyle = 'rgba(243,235,221,0.35)';
  x.lineWidth = 6;
  x.strokeRect(18, 18, 988, 324);
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = C.cream;
  x.font = `150px ${HEAD}`;
  x.fillText(truckText.sign, 512, 150);
  x.fillStyle = C.yellow;
  x.font = `500 58px ${BODY}`;
  x.fillText(truckText.signSub, 512, 268);
  return toTex(c);
}

export function chalkboardTexture() {
  const W = 1200;
  const H = 800;
  const [c, x] = make(W, H);
  const r = rng(7);
  const g = x.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.7);
  g.addColorStop(0, '#26302c');
  g.addColorStop(1, '#161d1a');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  // smudges
  for (let i = 0; i < 40; i++) {
    x.fillStyle = `rgba(255,255,255,${0.015 + r() * 0.02})`;
    x.beginPath();
    x.ellipse(r() * W, r() * H, 40 + r() * 160, 10 + r() * 40, r() * 3, 0, Math.PI * 2);
    x.fill();
  }
  const chalk = 'rgba(243,235,221,0.93)';
  x.textBaseline = 'alphabetic';
  x.fillStyle = C.yellow;
  x.textAlign = 'center';
  x.font = `68px ${HEAD}`;
  x.fillText(truckText.chalkTitle.toUpperCase(), W / 2, 110);
  x.strokeStyle = 'rgba(232,184,74,0.7)';
  x.lineWidth = 4;
  x.beginPath();
  x.moveTo(W / 2 - 330, 140);
  x.quadraticCurveTo(W / 2, 128, W / 2 + 330, 142);
  x.stroke();

  let y = 238;
  for (const p of plans) {
    x.textAlign = 'left';
    x.fillStyle = chalk;
    x.font = `52px ${HEAD}`;
    x.fillText(p.name, 80, y);
    x.textAlign = 'right';
    x.fillStyle = p.best ? C.yellow : chalk;
    x.fillText(p.price, W - 80, y);
    x.textAlign = 'left';
    x.fillStyle = 'rgba(243,235,221,0.7)';
    x.font = `500 32px ${BODY}`;
    x.fillText(p.note ? `${p.detail} ${p.note}` : p.detail, 82, y + 46);
    // dotted leader
    x.fillStyle = 'rgba(243,235,221,0.35)';
    const nameW = (() => {
      x.font = `52px ${HEAD}`;
      return x.measureText(p.name).width;
    })();
    for (let dx = 100 + nameW; dx < W - 300; dx += 18) x.fillRect(dx, y - 12, 6, 6);
    y += 140;
  }
  // chalk dust
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = `rgba(255,255,255,${r() * 0.06})`;
    x.fillRect(r() * W, r() * H, 2, 2);
  }
  return toTex(c);
}

export function aframeTexture() {
  const [c, x] = make(512, 800);
  x.fillStyle = C.green;
  x.fillRect(0, 0, 512, 800);
  x.strokeStyle = C.cream;
  x.lineWidth = 10;
  x.strokeRect(22, 22, 468, 756);
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  const lines = truckText.aframe;
  lines.forEach((l, i) => {
    x.fillStyle = i === 1 ? C.yellow : C.cream;
    fit(x, l, (s) => `${s}px ${HEAD}`, 78, 420);
    x.fillText(l, 256, 220 + i * 140);
  });
  x.fillStyle = C.rust;
  x.fillRect(176, 640, 160, 8);
  x.fillStyle = C.cream;
  x.font = `600 34px ${BODY}`;
  spaced(x, 'SUB ZERO', 256, 700, 8);
  return toTex(c);
}

export function frondTexture() {
  const [c, x] = make(128, 512);
  const r = rng(3);
  x.clearRect(0, 0, 128, 512);
  // leaflets
  for (let i = 0; i < 46; i++) {
    const y = 20 + i * 10.5;
    const len = 58 * Math.sin(Math.PI * (0.08 + (0.92 * i) / 46));
    for (const side of [-1, 1]) {
      const shade = 70 + r() * 50;
      x.strokeStyle = `rgb(${30 + r() * 20},${shade + 30},${40 + r() * 15})`;
      x.lineWidth = 3.2;
      x.beginPath();
      x.moveTo(64, y);
      x.quadraticCurveTo(64 + side * len * 0.5, y + 6, 64 + side * len, y + 22 + r() * 8);
      x.stroke();
    }
  }
  x.strokeStyle = '#7d8a4a';
  x.lineWidth = 5;
  x.beginPath();
  x.moveTo(64, 0);
  x.lineTo(64, 512);
  x.stroke();
  return toTex(c);
}

// Tileable ripple normal map for the tub water.
export function rippleNormalTexture() {
  const N = 256;
  const [c, x] = make(N, N);
  const img = x.createImageData(N, N);
  const waves = [
    [3, 2, 0.6, 0.0],
    [-2, 5, 0.4, 1.3],
    [7, -3, 0.25, 2.1],
    [5, 6, 0.18, 0.7],
    [-9, 4, 0.12, 3.0],
  ];
  const h = (u, v) =>
    waves.reduce((s, [a, b, amp, ph]) => s + amp * Math.sin(2 * Math.PI * (a * u + b * v) + ph), 0);
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const u = i / N;
      const v = j / N;
      const e = 1 / N;
      const dx = (h(u + e, v) - h(u - e, v)) * 6;
      const dy = (h(u, v + e) - h(u, v - e)) * 6;
      const len = Math.hypot(dx, dy, 1);
      const k = (j * N + i) * 4;
      img.data[k] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[k + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      img.data[k + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[k + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  const t = toTex(c, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function windowsTexture(density = 1, seed = 11) {
  const N = 256;
  const cells = 16;
  const cs = N / cells;
  const [c, x] = make(N, N);
  const r = rng(seed);
  x.fillStyle = '#000';
  x.fillRect(0, 0, N, N);
  for (let j = 0; j < cells; j++) {
    for (let i = 0; i < cells; i++) {
      if (r() > 0.42 * density) continue;
      const warm = r() > 0.3;
      const b = 0.45 + r() * 0.55;
      x.fillStyle = warm
        ? `rgba(255,${190 + r() * 40},${120 + r() * 50},${b})`
        : `rgba(${170 + r() * 40},${210 + r() * 30},255,${b})`;
      x.fillRect(i * cs + 3, j * cs + 4, cs - 6, cs - 8);
    }
  }
  const t = toTex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function glowTexture(inner = 'rgba(255,255,255,1)') {
  const [c, x] = make(128, 128);
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return toTex(c);
}

// The DJ laptop screen: redrawn every few frames.
export function makeWaveform() {
  const [c, x] = make(256, 160);
  const tex = toTex(c);
  const hist = new Array(64).fill(0.2);
  return {
    tex,
    draw(t, pulse) {
      hist.shift();
      hist.push(0.25 + pulse * 0.6 + Math.random() * 0.15);
      x.fillStyle = '#071014';
      x.fillRect(0, 0, 256, 160);
      x.fillStyle = 'rgba(111,211,255,0.15)';
      x.fillRect(0, 0, 256, 18);
      x.fillStyle = '#6FD3FF';
      x.font = '600 11px Inter, sans-serif';
      x.fillText('DECK A · 122.0', 8, 13);
      x.fillStyle = '#E8B84A';
      x.fillText('DECK B · 122.0', 150, 13);
      for (let i = 0; i < hist.length; i++) {
        const a = hist[i];
        const hgt = a * 46;
        x.fillStyle = i > 48 ? '#E8B84A' : '#6FD3FF';
        x.fillRect(i * 4, 62 - hgt / 2, 3, hgt);
        const b = 0.3 + 0.5 * Math.abs(Math.sin(t * 2 + i * 0.4));
        x.fillStyle = 'rgba(196,71,45,0.85)';
        x.fillRect(i * 4, 128 - (b * 40) / 2, 3, b * 40);
      }
      x.fillStyle = '#fff';
      x.fillRect(194, 22, 2, 136);
      tex.needsUpdate = true;
    },
  };
}
