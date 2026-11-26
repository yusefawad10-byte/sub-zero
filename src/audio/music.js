// A deep-house loop made live with the Web Audio API. No audio files.
// 122 bpm, four bars: Am9 · Dm9 · Fmaj7 · Em7.

export const BPM = 122;
const S16 = 60 / BPM / 4;
const m2f = (m) => 440 * Math.pow(2, (m - 69) / 12);

const CHORDS = [
  { root: 33, notes: [57, 60, 64, 67, 71] }, // Am9
  { root: 38, notes: [50, 53, 57, 60, 64] }, // Dm9
  { root: 29, notes: [53, 57, 60, 64] }, // Fmaj7
  { root: 28, notes: [52, 55, 59, 62] }, // Em7
];

let ctx = null;
let master, muffle, bus, delayIn, noise;
let startAt = 0;
let nextT = 0;
let step = 0;
let timer = null;
let playing = false;
let level = 0.8;

export function clock() {
  return playing && ctx ? ctx.currentTime - startAt : performance.now() / 1000;
}

export function beat() {
  const b = clock() * (BPM / 60);
  const phase = b - Math.floor(b);
  return { b, phase, pulse: Math.exp(-phase * 5) };
}

export function isPlaying() {
  return playing;
}

function init() {
  const AC = window.AudioContext || window.webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  muffle = ctx.createBiquadFilter();
  muffle.type = 'lowpass';
  muffle.frequency.value = 16000;
  muffle.Q.value = 0.7;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 3;
  comp.attack.value = 0.005;
  comp.release.value = 0.2;
  bus = ctx.createGain();
  bus.gain.value = 0.8;
  bus.connect(comp);
  comp.connect(muffle);
  muffle.connect(master);
  master.connect(ctx.destination);

  // dotted-eighth echo for the chord stabs
  const delay = ctx.createDelay(1.5);
  delay.delayTime.value = S16 * 3;
  const fb = ctx.createGain();
  fb.gain.value = 0.34;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 2200;
  delay.connect(tone);
  tone.connect(fb);
  fb.connect(delay);
  const wet = ctx.createGain();
  wet.gain.value = 0.5;
  tone.connect(wet);
  wet.connect(bus);
  delayIn = delay;

  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

export async function start() {
  if (!ctx) init();
  if (ctx.state !== 'running') await ctx.resume();
  if (playing) return;
  startAt = ctx.currentTime + 0.08;
  nextT = startAt;
  step = 0;
  playing = true;
  timer = setInterval(schedule, 25);
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(level, ctx.currentTime, 0.2);
}

export function stop() {
  if (!playing) return;
  playing = false;
  clearInterval(timer);
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
}

// Louder near the DJ, quieter far away, muffled inside the truck.
export function setSpatial(dist, inside) {
  if (!ctx) return;
  const g = Math.min(1, Math.max(0.05, 1.12 - dist / 24));
  level = 0.85 * g * g * (inside ? 0.7 : 1);
  if (playing) master.gain.setTargetAtTime(level, ctx.currentTime, 0.25);
  muffle.frequency.setTargetAtTime(inside ? 620 : 16000, ctx.currentTime, 0.25);
}

function schedule() {
  while (nextT < ctx.currentTime + 0.12) {
    play(step, nextT);
    nextT += S16;
    step = (step + 1) % 64;
  }
}

function play(s, t) {
  const bar = Math.floor(s / 16);
  const i = s % 16;
  const ch = CHORDS[bar];
  if (i % 4 === 0) kick(t);
  if (i % 4 === 2) hat(t, 0.2, 0.09, 6500);
  else hat(t, 0.045, i % 2 ? 0.035 : 0.022, 8500);
  if (i === 4 || i === 12) clap(t);
  if (i % 4 === 2) bass(t, m2f(ch.root + 12), 0.16, 0.34);
  if (i === 7 || i === 15) bass(t, m2f(ch.root + (i === 15 ? 24 : 12)), 0.09, 0.22);
  if (i === 3 || i === 6 || i === 11) stab(t, ch.notes, i === 11 ? 0.32 : 0.18);
}

function env(g, t, peak, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

function kick(t) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(44, t + 0.11);
  env(g, t, 1.0, 0.45);
  o.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + 0.5);
}

function noiseHit(t, dur, vol, type, freq, q = 0.8) {
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  env(g, t, vol, dur);
  src.connect(f);
  f.connect(g);
  g.connect(bus);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

function hat(t, dur, vol, freq) {
  noiseHit(t, dur, vol, 'highpass', freq);
}

function clap(t) {
  noiseHit(t, 0.03, 0.22, 'bandpass', 1400, 1.2);
  noiseHit(t + 0.012, 0.03, 0.2, 'bandpass', 1400, 1.2);
  noiseHit(t + 0.024, 0.2, 0.26, 'bandpass', 1300, 1.0);
}

function bass(t, f, dur, vol) {
  const o = ctx.createOscillator();
  const sub = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o.type = 'sawtooth';
  sub.type = 'sine';
  o.frequency.value = f;
  sub.frequency.value = f;
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(520, t);
  lp.frequency.exponentialRampToValueAtTime(180, t + dur);
  env(g, t, vol, dur + 0.05);
  o.connect(lp);
  sub.connect(lp);
  lp.connect(g);
  g.connect(bus);
  o.start(t);
  sub.start(t);
  o.stop(t + dur + 0.1);
  sub.stop(t + dur + 0.1);
}

function stab(t, notes, dur) {
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 3;
  lp.frequency.setValueAtTime(2600, t);
  lp.frequency.exponentialRampToValueAtTime(500, t + dur);
  const g = ctx.createGain();
  env(g, t, 0.16, dur + 0.04);
  lp.connect(g);
  g.connect(bus);
  g.connect(delayIn);
  for (const n of notes) {
    for (const det of [-7, 7]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = m2f(n);
      o.detune.value = det;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.08);
    }
  }
}
