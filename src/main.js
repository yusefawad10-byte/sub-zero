import './style.css';

const fmt = (n) => 'AED ' + n.toLocaleString('en-US');

// Venue commission calculator
const sessions = document.getElementById('sessions');
const sessionsOut = document.getElementById('sessionsOut');
const earn = document.getElementById('earn');
function updateEarn() {
  const n = Number(sessions.value);
  sessionsOut.textContent = n;
  earn.textContent = fmt(Math.round(n * 60 * 0.05));
}
sessions.addEventListener('input', updateEarn);
updateEarn();

// Booking total
const form = document.getElementById('bookForm');
const people = document.getElementById('people');
const drinks = document.getElementById('drinks');
const totalEl = document.getElementById('total');
const msg = document.getElementById('bookMsg');

function total() {
  const plan = Number(form.plan.value);
  const p = Math.max(1, Number(people.value) || 1);
  const d = Math.max(0, Number(drinks.value) || 0);
  const base = plan === 2400 ? plan : plan * p; // club night is a flat price
  return base + d * 25;
}
function updateTotal() {
  totalEl.textContent = fmt(total());
  msg.textContent = '';
}
form.addEventListener('input', updateTotal);
updateTotal();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const venue = document.getElementById('venue').value.toLowerCase();
  msg.textContent = `Got it — ${fmt(total())} at your ${venue}. Online booking opens when our first truck launches.`;
});

// Frost particles in the hero
const canvas = document.getElementById('frost');
const ctx = canvas.getContext('2d');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let flakes = [];
let w = 0;
let h = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.clientWidth;
  h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.round((w * h) / 9000);
  flakes = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.8 + 0.4,
    s: Math.random() * 0.4 + 0.1,
    d: Math.random() * Math.PI * 2,
  }));
}

function draw() {
  ctx.clearRect(0, 0, w, h);
  for (const f of flakes) {
    f.y += f.s;
    f.d += 0.01;
    f.x += Math.sin(f.d) * 0.25;
    if (f.y > h + 4) {
      f.y = -4;
      f.x = Math.random() * w;
    }
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(190, 240, 255, ${0.25 + f.r / 4})`;
    ctx.fill();
  }
  if (!reduce) requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
resize();
draw();
