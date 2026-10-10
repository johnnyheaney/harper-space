/* Harper's Space Adventure: Space Arcade (mini-games).
   Public API: window.Games = { open({ onClose, startWith }) } -> { close() }
   Games: catch, dodge, planets, stars, memory, lander, aliens, jetpack, jetmaggie, meteors. All art procedural, 2D canvas. */
(function () {
'use strict';

const KEY = 'harper-space-games-v1';
const TAU = Math.PI * 2;
const FD = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif';
const FB = '"Atkinson Hyperlegible", Verdana, system-ui, sans-serif';
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- hooks ---------------- */
function hooks() { return window.GameHooks || null; }
function fillName(t) { try { const h = hooks(); return h && h.fill ? h.fill(t) : t; } catch (e) { return t; } }
function say(who, text) { try { hooks()?.say?.(who, text); } catch (e) { /* ignore */ } }
const sfxLast = {};
function sfx(name) {
  const now = performance.now();
  if (sfxLast[name] && now - sfxLast[name] < 90) return;
  sfxLast[name] = now;
  try { hooks()?.sfx?.(name); } catch (e) { /* ignore */ }
}
function hooksPaused() {
  try { const p = hooks()?.isPaused; return typeof p === 'function' ? !!p() : !!p; } catch (e) { return false; }
}

/* ---------------- storage ---------------- */
function loadStore() {
  try { const s = localStorage.getItem(KEY); const o = s ? JSON.parse(s) : null; return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
}
function saveStore(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* ignore */ } }
function getBest(id) { const o = loadStore(); return (o.best && +o.best[id]) || 0; }
function recordScore(id, score) {
  const o = loadStore();
  o.best = o.best || {}; o.plays = o.plays || {};
  o.plays[id] = (o.plays[id] | 0) + 1;
  const prev = +o.best[id] || 0;
  if (score > prev) o.best[id] = score;
  saveStore(o);
  return prev;
}

/* ---------------- drawing helpers ---------------- */
function rr(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}
function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(0.1, r), 0, TAU); }
function ell(g, x, y, rx, ry, rot) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, TAU); }
function starPath(g, x, y, R, r, n, rot) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot - Math.PI / 2 + (i * Math.PI) / n, rad = i % 2 ? r : R;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
    if (i) g.lineTo(px, py); else g.moveTo(px, py);
  }
  g.closePath();
}
function heartPath(g, x, y, s) {
  g.beginPath();
  g.moveTo(x, y + s * 0.62);
  g.bezierCurveTo(x - s * 1.15, y - s * 0.05, x - s * 0.62, y - s * 0.95, x, y - s * 0.38);
  g.bezierCurveTo(x + s * 0.62, y - s * 0.95, x + s * 1.15, y - s * 0.05, x, y + s * 0.62);
  g.closePath();
}
function text(g, s, x, y, size, color, align, opts) {
  opts = opts || {};
  g.font = `${opts.weight || 800} ${size}px ${opts.font || FD}`;
  g.textAlign = align || 'center'; g.textBaseline = opts.base || 'middle';
  if (opts.outline !== false) {
    g.lineJoin = 'round'; g.lineWidth = Math.max(3, size * 0.2); g.strokeStyle = opts.stroke || 'rgba(16,10,52,.9)';
    g.strokeText(s, x, y);
  }
  g.fillStyle = color; g.fillText(s, x, y);
}
function wrapLines(g, txt, maxW) {
  const words = String(txt).split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (cur && g.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
function smoothPath(g, pts, closed) {
  const n = pts.length; if (n < 2) return;
  g.beginPath();
  if (!closed) {
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
    g.lineTo(pts[n - 1][0], pts[n - 1][1]);
  } else {
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const s = m(pts[n - 1], pts[0]); g.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) { const p = pts[i], q = m(p, pts[(i + 1) % n]); g.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
    g.closePath();
  }
}
function cuteFace(g, x, y, r, col) {
  if (r < 9) return;
  g.fillStyle = col || '#2b1a3d';
  circle(g, x - r * 0.3, y - r * 0.05, r * 0.11); g.fill();
  circle(g, x + r * 0.3, y - r * 0.05, r * 0.11); g.fill();
  g.fillStyle = 'rgba(255,255,255,.9)';
  circle(g, x - r * 0.27, y - r * 0.09, r * 0.04); g.fill();
  circle(g, x + r * 0.33, y - r * 0.09, r * 0.04); g.fill();
  g.strokeStyle = col || '#2b1a3d'; g.lineWidth = Math.max(1.2, r * 0.07); g.lineCap = 'round';
  g.beginPath(); g.arc(x, y + r * 0.12, r * 0.2, 0.2, Math.PI - 0.2); g.stroke();
  g.fillStyle = 'rgba(255,111,168,.35)';
  circle(g, x - r * 0.48, y + r * 0.14, r * 0.1); g.fill();
  circle(g, x + r * 0.48, y + r * 0.14, r * 0.1); g.fill();
}

function drawCuteStar(g, x, y, R, rot, face) {
  g.save();
  const gr = g.createRadialGradient(x - R * 0.2, y - R * 0.3, R * 0.1, x, y, R * 1.1);
  gr.addColorStop(0, '#fff6c8'); gr.addColorStop(0.55, '#ffd166'); gr.addColorStop(1, '#f6a623');
  g.shadowColor = 'rgba(255,209,102,.8)'; g.shadowBlur = R * 0.8;
  starPath(g, x, y, R, R * 0.52, 5, rot); g.fillStyle = gr; g.fill();
  g.shadowBlur = 0;
  g.lineJoin = 'round'; g.lineWidth = Math.max(1.5, R * 0.1); g.strokeStyle = '#d98a10'; g.stroke();
  if (face !== false) cuteFace(g, x, y + R * 0.08, R * 0.75, '#6b3a00');
  g.restore();
}
function drawFlame(g, x, y, w, len, T) {
  const f = 0.85 + 0.15 * Math.sin(T * 37) + 0.08 * Math.sin(T * 61);
  const layers = [['rgba(255,111,60,.75)', 1], ['#ffb347', 0.72], ['#fff3b0', 0.4]];
  for (const [c, k] of layers) {
    const ww = w * k, ll = len * k * f;
    g.beginPath(); g.moveTo(x - ww / 2, y);
    g.quadraticCurveTo(x - ww * 0.55, y + ll * 0.55, x, y + ll);
    g.quadraticCurveTo(x + ww * 0.55, y + ll * 0.55, x + ww / 2, y);
    g.closePath(); g.fillStyle = c; g.fill();
  }
}
let defaultRocketCanvas = null;
function defaultRocket() {
  if (defaultRocketCanvas) return defaultRocketCanvas;
  const c = document.createElement('canvas'); c.width = 200; c.height = 340;
  const g = c.getContext('2d'); g.scale(2, 2);
  g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = '#2a1f5c';
  g.fillStyle = '#ff7a45';
  g.beginPath(); g.moveTo(27, 98); g.quadraticCurveTo(5, 116, 6, 154); g.lineTo(29, 140); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(73, 98); g.quadraticCurveTo(95, 116, 94, 154); g.lineTo(71, 140); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#7d7a99'; rr(g, 37, 136, 26, 16, 4); g.fill(); g.stroke();
  const body = () => { g.beginPath(); g.moveTo(50, 5); g.bezierCurveTo(80, 26, 83, 72, 76, 142); g.lineTo(24, 142); g.bezierCurveTo(17, 72, 20, 26, 50, 5); g.closePath(); };
  const gr = g.createLinearGradient(20, 0, 80, 0);
  gr.addColorStop(0, '#d9d2ff'); gr.addColorStop(0.45, '#ffffff'); gr.addColorStop(1, '#cfc6ff');
  body(); g.fillStyle = gr; g.fill();
  g.save(); body(); g.clip();
  g.fillStyle = '#ff7a45'; g.fillRect(0, 0, 100, 36);
  g.fillStyle = '#d9532a'; g.fillRect(0, 33, 100, 4);
  g.fillStyle = '#ff6fa8'; g.fillRect(0, 112, 100, 10);
  g.restore();
  body(); g.stroke();
  const wg = g.createRadialGradient(45, 66, 2, 50, 72, 16); wg.addColorStop(0, '#d8fff7'); wg.addColorStop(1, '#2fb8a3');
  circle(g, 50, 72, 15); g.fillStyle = wg; g.fill(); g.lineWidth = 5; g.strokeStyle = '#2a1f5c'; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3; g.beginPath(); g.arc(50, 72, 9, Math.PI * 1.1, Math.PI * 1.5); g.stroke();
  starPath(g, 50, 97, 7, 3.4, 5, 0); g.fillStyle = '#ffd166'; g.fill();
  return (defaultRocketCanvas = c);
}
function getRocket() {
  try {
    const c = hooks()?.rocketImage?.();
    if (c && c.width > 4 && c.height > 4) return c;
  } catch (e) { /* ignore */ }
  return defaultRocket();
}
function rocketSize(spr, h) { let dh = h, dw = h * spr.width / spr.height; if (dw > h * 0.85) { dw = h * 0.85; dh = dw * spr.height / spr.width; } return [dw, dh]; }
function drawRocket(g, spr, x, y, h, tilt, T, flame, alpha) {
  const [dw, dh] = rocketSize(spr, h);
  g.save(); g.translate(x, y); g.rotate(tilt || 0);
  if (alpha != null) g.globalAlpha = alpha;
  if (flame !== false) drawFlame(g, 0, dh * 0.44, dw * 0.38, dh * 0.36, T);
  g.drawImage(spr, -dw / 2, -dh / 2, dw, dh);
  g.restore();
}

function makeRock(r) {
  const n = 10, pts = [], cr = [];
  for (let i = 0; i < n; i++) pts.push(rand(0.78, 1.06));
  for (let k = 0; k < 3; k++) cr.push({ a: rand(0, TAU), d: rand(0.1, 0.5), s: rand(0.13, 0.24) });
  return { r, pts, cr };
}
function drawRock(g, rock, x, y, rot, r) {
  r = r || rock.r;
  g.save(); g.translate(x, y); g.rotate(rot);
  const n = rock.pts.length, P = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; P.push([Math.cos(a) * rock.pts[i] * r, Math.sin(a) * rock.pts[i] * r]); }
  smoothPath(g, P, true);
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.1);
  gr.addColorStop(0, '#c4c1d6'); gr.addColorStop(1, '#6c6984');
  g.fillStyle = gr; g.fill();
  g.lineWidth = Math.max(2, r * 0.09); g.strokeStyle = '#3b3853'; g.lineJoin = 'round'; g.stroke();
  for (const c of rock.cr) {
    const cx = Math.cos(c.a) * c.d * r, cy = Math.sin(c.a) * c.d * r;
    circle(g, cx, cy, c.s * r); g.fillStyle = 'rgba(58,54,86,.45)'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = Math.max(1, r * 0.04);
    g.beginPath(); g.arc(cx, cy, c.s * r, Math.PI * 0.1, Math.PI * 0.9); g.stroke();
  }
  g.restore();
}

const PL = {
  mercury: { name: 'Mercury', km: 2440, c1: '#e6e0da', c2: '#8f8780' },
  venus: { name: 'Venus', km: 6052, c1: '#fff1c4', c2: '#e3a54f' },
  earth: { name: 'Earth', km: 6371, c1: '#8fd3ff', c2: '#2a6fd6' },
  mars: { name: 'Mars', km: 3390, c1: '#ffab7a', c2: '#c2412a' },
  jupiter: { name: 'Jupiter', km: 69911, c1: '#f8e2be', c2: '#c98a52' },
  saturn: { name: 'Saturn', km: 58232, c1: '#fff2c8', c2: '#d6a95b' },
  uranus: { name: 'Uranus', km: 25362, c1: '#d4fcff', c2: '#59c3d1' },
  neptune: { name: 'Neptune', km: 24622, c1: '#9fbcff', c2: '#3550d8' },
};
const PL_ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
function drawBall(g, x, y, r, c1, c2) {
  const gr = g.createRadialGradient(x - r * 0.38, y - r * 0.38, r * 0.08, x, y, r);
  gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  circle(g, x, y, r); g.fillStyle = gr; g.fill();
}
function shade(g, x, y, r) {
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.5, x, y, r * 1.05);
  gr.addColorStop(0, 'rgba(10,6,40,0)'); gr.addColorStop(1, 'rgba(10,6,40,.35)');
  circle(g, x, y, r); g.fillStyle = gr; g.fill();
}
function drawPlanet(g, id, x, y, r, face) {
  const p = PL[id];
  g.save();
  if (id === 'saturn') {
    g.lineWidth = r * 0.24; g.strokeStyle = 'rgba(236,205,140,.95)';
    g.beginPath(); g.ellipse(x, y, r * 1.85, r * 0.55, -0.3, Math.PI, TAU); g.stroke();
  }
  if (id === 'uranus') {
    g.lineWidth = r * 0.08; g.strokeStyle = 'rgba(210,250,255,.8)';
    g.beginPath(); g.ellipse(x, y, r * 0.4, r * 1.55, 0.25, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
  }
  drawBall(g, x, y, r, p.c1, p.c2);
  g.save(); circle(g, x, y, r); g.clip();
  if (id === 'mercury') { g.fillStyle = 'rgba(70,60,60,.2)'; [[-0.4, 0.3, 0.2], [0.35, -0.35, 0.16], [0.3, 0.45, 0.12], [-0.1, -0.55, 0.1]].forEach(([a, b, s]) => { circle(g, x + a * r, y + b * r, s * r); g.fill(); }); }
  if (id === 'venus') { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = r * 0.12; for (let i = -1; i <= 1; i++) { g.beginPath(); g.ellipse(x, y + i * r * 0.45, r * 1.1, r * 0.25, 0.15, 0, Math.PI); g.stroke(); } }
  if (id === 'earth') { g.fillStyle = '#5bd17a'; ell(g, x - r * 0.35, y - r * 0.15, r * 0.35, r * 0.5, 0.4); g.fill(); ell(g, x + r * 0.45, y + r * 0.3, r * 0.3, r * 0.22, -0.3); g.fill(); ell(g, x + r * 0.2, y - r * 0.6, r * 0.22, r * 0.12, 0); g.fill(); g.fillStyle = 'rgba(255,255,255,.75)'; ell(g, x, y + r * 0.85, r * 0.7, r * 0.2); g.fill(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = r * 0.08; g.beginPath(); g.ellipse(x + r * 0.1, y + r * 0.05, r * 0.6, r * 0.12, -0.2, 0.3, 2.2); g.stroke(); }
  if (id === 'mars') { g.fillStyle = 'rgba(120,30,20,.3)'; ell(g, x - r * 0.2, y + r * 0.2, r * 0.4, r * 0.2, 0.3); g.fill(); ell(g, x + r * 0.4, y - r * 0.2, r * 0.2, r * 0.15); g.fill(); g.fillStyle = '#fff'; ell(g, x, y - r * 0.95, r * 0.45, r * 0.18); g.fill(); }
  if (id === 'jupiter') { const cols = ['rgba(160,95,50,.45)', 'rgba(255,240,215,.35)']; for (let i = 0; i < 7; i++) { g.fillStyle = cols[i % 2]; g.fillRect(x - r, y - r + i * r * 0.3, r * 2, r * 0.17); } g.fillStyle = '#d9653b'; ell(g, x + r * 0.35, y + r * 0.35, r * 0.24, r * 0.14); g.fill(); }
  if (id === 'saturn') { g.fillStyle = 'rgba(190,140,70,.28)'; for (let i = 0; i < 4; i++) g.fillRect(x - r, y - r * 0.7 + i * r * 0.45, r * 2, r * 0.16); }
  if (id === 'uranus') { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - r, y - r * 0.1, r * 2, r * 0.2); }
  if (id === 'neptune') { g.fillStyle = 'rgba(20,30,110,.55)'; ell(g, x - r * 0.25, y + r * 0.25, r * 0.25, r * 0.14); g.fill(); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = r * 0.07; g.beginPath(); g.ellipse(x, y - r * 0.3, r * 0.5, r * 0.08, 0, 0, Math.PI); g.stroke(); }
  g.restore();
  shade(g, x, y, r);
  circle(g, x, y, r); g.lineWidth = Math.max(1.5, r * 0.06); g.strokeStyle = '#1a1446'; g.stroke();
  if (face) cuteFace(g, x, y + r * 0.1, r * 0.8);
  if (id === 'saturn') {
    g.lineWidth = r * 0.24; g.strokeStyle = 'rgba(244,215,150,1)';
    g.beginPath(); g.ellipse(x, y, r * 1.85, r * 0.55, -0.3, 0, Math.PI); g.stroke();
    g.lineWidth = r * 0.05; g.strokeStyle = 'rgba(160,120,60,.6)';
    g.beginPath(); g.ellipse(x, y, r * 1.85, r * 0.55, -0.3, 0, Math.PI); g.stroke();
  }
  if (id === 'uranus') {
    g.lineWidth = r * 0.08; g.strokeStyle = 'rgba(210,250,255,.9)';
    g.beginPath(); g.ellipse(x, y, r * 0.4, r * 1.55, 0.25, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
  }
  g.restore();
}
function drawSun(g, x, y, r, T, face) {
  g.save();
  const gl = g.createRadialGradient(x, y, r * 0.6, x, y, r * 1.7);
  gl.addColorStop(0, 'rgba(255,190,80,.5)'); gl.addColorStop(1, 'rgba(255,150,60,0)');
  circle(g, x, y, r * 1.7); g.fillStyle = gl; g.fill();
  g.strokeStyle = 'rgba(255,200,90,.8)'; g.lineWidth = Math.max(2, r * 0.07); g.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + (T || 0) * 0.15, k = 1.15 + 0.08 * Math.sin((T || 0) * 3 + i); g.beginPath(); g.moveTo(x + Math.cos(a) * r * 1.08, y + Math.sin(a) * r * 1.08); g.lineTo(x + Math.cos(a) * r * (k + 0.18), y + Math.sin(a) * r * (k + 0.18)); g.stroke(); }
  drawBall(g, x, y, r, '#fff6b0', '#ff9a3c');
  circle(g, x, y, r); g.lineWidth = Math.max(1.5, r * 0.04); g.strokeStyle = '#d9532a'; g.stroke();
  if (face) cuteFace(g, x, y + r * 0.1, r * 0.7, '#8a3a00');
  g.restore();
}
function drawPluto(g, x, y, r, T, glow) {
  g.save();
  if (glow) {
    const k = 1.45 + 0.15 * Math.sin((T || 0) * 6);
    const gl = g.createRadialGradient(x, y, r * 0.8, x, y, r * k * 1.1);
    gl.addColorStop(0, 'rgba(255,111,168,.55)'); gl.addColorStop(1, 'rgba(255,111,168,0)');
    circle(g, x, y, r * k * 1.1); g.fillStyle = gl; g.fill();
  }
  drawBall(g, x, y, r, '#f2d6b6', '#a3735a');
  g.save(); circle(g, x, y, r); g.clip();
  g.fillStyle = 'rgba(110,60,40,.35)'; ell(g, x + r * 0.55, y - r * 0.4, r * 0.35, r * 0.25, 0.4); g.fill();
  g.fillStyle = '#fff3e2'; heartPath(g, x - r * 0.1, y + r * 0.12, r * 0.55); g.fill();
  g.restore();
  shade(g, x, y, r);
  circle(g, x, y, r); g.lineWidth = Math.max(1.5, r * 0.07); g.strokeStyle = '#4a2a20'; g.stroke();
  g.restore();
}
function drawMoon(g, x, y, r, face) {
  g.save();
  drawBall(g, x, y, r, '#fbfaff', '#a9a6bf');
  g.fillStyle = 'rgba(110,105,140,.3)';
  [[-0.4, -0.35, 0.18], [0.4, 0.3, 0.22], [0.35, -0.45, 0.12], [-0.45, 0.45, 0.1]].forEach(([a, b, s]) => { circle(g, x + a * r, y + b * r, s * r); g.fill(); });
  circle(g, x, y, r); g.lineWidth = Math.max(1.5, r * 0.06); g.strokeStyle = '#3d3a5c'; g.stroke();
  if (face) cuteFace(g, x, y + r * 0.08, r * 0.7);
  g.restore();
}
function drawFuel(g, x, y, s, T) {
  g.save(); g.translate(x, y); g.rotate(Math.sin((T || 0) * 3) * 0.15);
  const gl = g.createRadialGradient(0, 0, s * 0.3, 0, 0, s * 1.3);
  gl.addColorStop(0, 'rgba(120,255,140,.5)'); gl.addColorStop(1, 'rgba(120,255,140,0)');
  circle(g, 0, 0, s * 1.3); g.fillStyle = gl; g.fill();
  g.fillStyle = '#2a1f5c'; rr(g, -s * 0.22, -s * 0.78, s * 0.44, s * 0.2, s * 0.06); g.fill();
  const gr = g.createLinearGradient(-s * 0.5, 0, s * 0.5, 0); gr.addColorStop(0, '#4fd36a'); gr.addColorStop(0.5, '#a8ff8f'); gr.addColorStop(1, '#3fb85a');
  rr(g, -s * 0.48, -s * 0.66, s * 0.96, s * 1.36, s * 0.2); g.fillStyle = gr; g.fill();
  g.lineWidth = Math.max(2, s * 0.09); g.strokeStyle = '#1d5c35'; g.stroke();
  g.fillStyle = '#fffbe0';
  g.beginPath(); g.moveTo(s * 0.08, -s * 0.48); g.lineTo(-s * 0.24, s * 0.06); g.lineTo(-s * 0.02, s * 0.06); g.lineTo(-s * 0.1, s * 0.5); g.lineTo(s * 0.24, -s * 0.08); g.lineTo(s * 0.02, -s * 0.08); g.closePath(); g.fill();
  g.restore();
}
function drawAstronaut(g, x, y, s) {
  const R = s * 0.27;
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = '#2a1f5c'; g.lineWidth = Math.max(2, s * 0.025);
  g.fillStyle = '#f4f1ff';
  g.save(); g.translate(x + R * 0.95, y + R * 0.9); g.rotate(-0.9); rr(g, -R * 0.2, -R * 0.9, R * 0.4, R * 0.95, R * 0.2); g.fill(); g.stroke(); g.restore();
  rr(g, x - R * 1.4, y + R * 0.7, R * 0.42, R * 0.9, R * 0.2); g.fill(); g.stroke();
  rr(g, x - R * 0.95, y + R * 0.55, R * 1.9, R * 1.35, R * 0.45); g.fill(); g.stroke();
  g.fillStyle = '#ff7a45'; rr(g, x - R * 0.3, y + R * 0.95, R * 0.6, R * 0.4, R * 0.1); g.fill();
  circle(g, x, y, R); g.fillStyle = '#ffffff'; g.fill(); g.stroke();
  const vg = g.createLinearGradient(x, y - R * 0.6, x, y + R * 0.6); vg.addColorStop(0, '#3a4aa8'); vg.addColorStop(1, '#151550');
  ell(g, x, y + R * 0.05, R * 0.72, R * 0.56); g.fillStyle = vg; g.fill(); g.stroke();
  g.fillStyle = 'rgba(95,224,200,.75)'; ell(g, x - R * 0.3, y - R * 0.15, R * 0.18, R * 0.1, -0.5); g.fill();
  g.fillStyle = 'rgba(255,255,255,.6)'; circle(g, x + R * 0.3, y + R * 0.25, R * 0.06); g.fill();
  g.restore();
}
function drawComet(g, x, y, s, T) {
  g.save();
  const hx = x + s * 0.2, hy = y - s * 0.2;
  const tg = g.createLinearGradient(hx, hy, x - s * 0.42, y + s * 0.42);
  tg.addColorStop(0, 'rgba(160,240,255,.9)'); tg.addColorStop(1, 'rgba(95,224,200,0)');
  g.fillStyle = tg; g.beginPath(); g.moveTo(hx - s * 0.1, hy - s * 0.1); g.lineTo(x - s * 0.45, y + s * 0.38); g.lineTo(hx + s * 0.1, hy + s * 0.12); g.closePath(); g.fill();
  const tg2 = g.createLinearGradient(hx, hy, x - s * 0.3, y + s * 0.48);
  tg2.addColorStop(0, 'rgba(255,111,168,.8)'); tg2.addColorStop(1, 'rgba(255,111,168,0)');
  g.fillStyle = tg2; g.beginPath(); g.moveTo(hx, hy); g.lineTo(x - s * 0.25, y + s * 0.5); g.lineTo(hx + s * 0.1, hy + s * 0.05); g.closePath(); g.fill();
  drawBall(g, hx, hy, s * 0.14, '#ffffff', '#8fe3ff');
  circle(g, hx, hy, s * 0.14); g.strokeStyle = '#2a5c8f'; g.lineWidth = Math.max(1.5, s * 0.02); g.stroke();
  cuteFace(g, hx, hy + s * 0.01, s * 0.12);
  g.restore();
}
function drawBlackHole(g, x, y, s, T) {
  g.save();
  const t = (T || 0);
  const glow = g.createRadialGradient(x, y, s * 0.1, x, y, s * 0.48);
  glow.addColorStop(0, 'rgba(255,170,70,.5)'); glow.addColorStop(1, 'rgba(255,111,168,0)');
  circle(g, x, y, s * 0.48); g.fillStyle = glow; g.fill();
  const dg = g.createLinearGradient(x - s * 0.45, y, x + s * 0.45, y);
  dg.addColorStop(0, '#ff6fa8'); dg.addColorStop(0.5, '#ffd166'); dg.addColorStop(1, '#ff7a45');
  g.strokeStyle = dg; g.lineWidth = s * 0.08;
  g.beginPath(); g.ellipse(x, y, s * 0.42, s * 0.13, -0.15, Math.PI, TAU); g.stroke();
  circle(g, x, y, s * 0.17); g.fillStyle = '#05030f'; g.fill();
  g.lineWidth = Math.max(2, s * 0.025); g.strokeStyle = '#ffe3a0'; g.stroke();
  g.strokeStyle = dg; g.lineWidth = s * 0.08;
  g.beginPath(); g.ellipse(x, y, s * 0.42, s * 0.13, -0.15, 0, Math.PI); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.9)';
  for (let i = 0; i < 3; i++) { const a = t * 1.5 + i * 2.1; circle(g, x + Math.cos(a) * s * 0.42, y + Math.sin(a) * s * 0.13 - Math.cos(a) * s * 0.06, s * 0.015); g.fill(); }
  g.restore();
}
function drawDog(g, x, y, s, who) {
  const R = s * 0.44;
  const brown = '#7b3f1f';
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  circle(g, x, y, R); g.fillStyle = 'rgba(150,210,255,.22)'; g.fill();
  g.fillStyle = brown; g.strokeStyle = '#3a1c0c'; g.lineWidth = Math.max(1.5, s * 0.018);
  ell(g, x - R * 0.5, y + R * 0.12, R * 0.19, R * 0.42, 0.28); g.fill(); g.stroke();
  ell(g, x + R * 0.5, y + R * 0.12, R * 0.19, R * 0.42, -0.28); g.fill(); g.stroke();
  // curly ear fur
  g.strokeStyle = 'rgba(255,220,190,.35)';
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x + sd * R * 0.5, y + R * (0.0 + i * 0.18), R * 0.06, 0, Math.PI); g.stroke(); }
  // head
  ell(g, x, y - R * 0.02, R * 0.4, R * 0.46); g.fillStyle = '#fffaf2'; g.fill();
  g.save(); ell(g, x, y - R * 0.02, R * 0.4, R * 0.46); g.clip();
  g.fillStyle = brown; ell(g, x, y - R * 0.46, R * 0.5, R * 0.28); g.fill();
  if (who === 'maggie') { ell(g, x - R * 0.17, y - R * 0.1, R * 0.15, R * 0.14); g.fill(); }
  else { ell(g, x + R * 0.2, y - R * 0.12, R * 0.13, R * 0.13); g.fill(); g.fillStyle = '#fffaf2'; rr(g, x - R * 0.05, y - R * 0.6, R * 0.1, R * 0.5, R * 0.05); g.fill(); }
  g.fillStyle = 'rgba(123,63,31,.55)';
  for (const [a, b] of [[-0.14, 0.24], [-0.2, 0.3], [0.14, 0.24], [0.2, 0.31], [-0.08, 0.32], [0.09, 0.33]]) { circle(g, x + a * R, y + b * R, R * 0.022); g.fill(); }
  g.restore();
  ell(g, x, y - R * 0.02, R * 0.4, R * 0.46); g.strokeStyle = '#3a1c0c'; g.lineWidth = Math.max(1.5, s * 0.018); g.stroke();
  // eyes
  for (const sd of [-1, 1]) { circle(g, x + sd * R * 0.17, y - R * 0.08, R * 0.065); g.fillStyle = '#20120a'; g.fill(); circle(g, x + sd * R * 0.17 + R * 0.02, y - R * 0.1, R * 0.022); g.fillStyle = '#fff'; g.fill(); }
  // nose + mouth
  ell(g, x, y + R * 0.12, R * 0.09, R * 0.065); g.fillStyle = '#20120a'; g.fill();
  g.strokeStyle = '#20120a'; g.lineWidth = Math.max(1.2, s * 0.014);
  g.beginPath(); g.moveTo(x, y + R * 0.18); g.quadraticCurveTo(x - R * 0.05, y + R * 0.26, x - R * 0.12, y + R * 0.22); g.moveTo(x, y + R * 0.18); g.quadraticCurveTo(x + R * 0.05, y + R * 0.26, x + R * 0.12, y + R * 0.22); g.stroke();
  if (who !== 'maggie') { ell(g, x + R * 0.02, y + R * 0.3, R * 0.06, R * 0.08); g.fillStyle = '#ff6fa8'; g.fill(); }
  // collar
  rr(g, x - R * 0.33, y + R * 0.42, R * 0.66, R * 0.12, R * 0.06); g.fillStyle = who === 'maggie' ? '#ff6fa8' : '#5fe0c8'; g.fill();
  circle(g, x, y + R * 0.58, R * 0.07); g.fillStyle = '#ffd166'; g.fill();
  // helmet
  circle(g, x, y, R); g.lineWidth = Math.max(2.5, s * 0.035); g.strokeStyle = '#eef0ff'; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = Math.max(2, s * 0.025);
  g.beginPath(); g.arc(x, y, R * 0.82, Math.PI * 1.1, Math.PI * 1.4); g.stroke();
  rr(g, x - R * 0.6, y + R * 0.82, R * 1.2, R * 0.22, R * 0.1); g.fillStyle = '#c9c3f0'; g.fill();
  g.restore();
}

/* ---------------- particles, floating text, sky ---------------- */
function makeParts() {
  const a = [];
  return {
    a,
    add(p) { if (a.length < 700) { p.max = p.life; a.push(p); } },
    burst(x, y, n, colors, o) {
      o = o || {};
      for (let i = 0; i < n; i++) {
        const ang = rand(0, TAU), sp = rand(o.min || 60, o.max || 260);
        this.add({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - (o.up || 0), life: rand(0.5, 1) * (o.life || 0.9), c: pick(colors), s: rand(2, 5) * (o.size || 1), g: o.g != null ? o.g : 200, star: Math.random() < (o.stars != null ? o.stars : 0.45), spin: rand(-6, 6) });
      }
    },
    update(dt) {
      for (let i = a.length - 1; i >= 0; i--) {
        const p = a[i]; p.life -= dt;
        if (p.life <= 0) { a.splice(i, 1); continue; }
        p.vy += p.g * dt; p.vx *= 1 - dt * 1.2; p.x += p.vx * dt; p.y += p.vy * dt;
      }
    },
    draw(g) {
      for (const p of a) {
        const al = Math.max(0, p.life / p.max);
        g.globalAlpha = al; g.fillStyle = p.c;
        if (p.star) { starPath(g, p.x, p.y, p.s * 1.7, p.s * 0.6, 4, p.life * p.spin); g.fill(); }
        else { circle(g, p.x, p.y, p.s * (0.4 + al * 0.6)); g.fill(); }
      }
      g.globalAlpha = 1;
    },
    clear() { a.length = 0; },
  };
}
function makeFloats() {
  const a = [];
  return {
    add(x, y, txt, col, size, life) { a.push({ x, y, txt, col: col || '#ffd166', size: size || 26, life: life || 1.1, max: life || 1.1 }); if (a.length > 30) a.shift(); },
    update(dt) { for (let i = a.length - 1; i >= 0; i--) { const p = a[i]; p.life -= dt; p.y -= 38 * dt; if (p.life <= 0) a.splice(i, 1); } },
    draw(g, w) {
      for (const p of a) {
        const age = p.max - p.life, pop = age < 0.15 ? 0.6 + (age / 0.15) * 0.5 : age < 0.3 ? 1.1 - (age - 0.15) / 0.15 * 0.1 : 1;
        g.globalAlpha = clamp(p.life / 0.35, 0, 1);
        g.font = `800 ${p.size}px ${FD}`;
        const hw = g.measureText(p.txt).width / 2 + 8;
        const x = w ? clamp(p.x, hw, w - hw) : p.x;
        g.save(); g.translate(x, p.y); g.scale(pop, pop); text(g, p.txt, 0, 0, p.size, p.col); g.restore();
      }
      g.globalAlpha = 1;
    },
    clear() { a.length = 0; },
  };
}
function makeSky() {
  const L = [{ sp: 0.12, n: 130, r: 0.8 }, { sp: 0.4, n: 60, r: 1.3 }, { sp: 1, n: 24, r: 2 }];
  const cols = ['#ffffff', '#ffffff', '#ffffff', '#ffe9c4', '#d6e4ff', '#ffd6ec'];
  for (const l of L) l.s = Array.from({ length: l.n }, () => ({ x: Math.random(), y: Math.random(), r: l.r * rand(0.6, 1.3), tw: rand(0, TAU), c: pick(cols) }));
  const deco = { x: 0.8, y: 0.25, kind: 0 };
  let v = 0;
  return {
    update(dt, speed, h) {
      v = speed; h = Math.max(200, h);
      for (const l of L) for (const s of l.s) { s.y += (speed * l.sp * dt) / h; if (s.y > 1.02) { s.y -= 1.04; s.x = Math.random(); } }
      deco.y += (speed * 0.05 * dt) / h;
      if (deco.y > 1.5) { deco.y = -0.5; deco.x = rand(0.12, 0.88); deco.kind = (deco.kind + 1) % 3; }
    },
    draw(g, w, h, T, opt) {
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1a1452'); bg.addColorStop(1, '#0d0b2e');
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      const m = Math.max(w, h);
      let n = g.createRadialGradient(w * 0.18, h * 0.3, 0, w * 0.18, h * 0.3, m * 0.5);
      n.addColorStop(0, 'rgba(255,111,168,.13)'); n.addColorStop(1, 'rgba(255,111,168,0)'); g.fillStyle = n; g.fillRect(0, 0, w, h);
      n = g.createRadialGradient(w * 0.85, h * 0.75, 0, w * 0.85, h * 0.75, m * 0.5);
      n.addColorStop(0, 'rgba(95,224,200,.10)'); n.addColorStop(1, 'rgba(95,224,200,0)'); g.fillStyle = n; g.fillRect(0, 0, w, h);
      if (!opt || opt.deco !== false) {
        const r = Math.min(w, h) * 0.09, dx = deco.x * w, dy = deco.y * h;
        g.globalAlpha = 0.45;
        if (deco.kind === 0) drawPlanet(g, 'saturn', dx, dy, r * 0.8);
        else if (deco.kind === 1) drawPlanet(g, 'neptune', dx, dy, r);
        else drawMoon(g, dx, dy, r * 0.7);
        g.globalAlpha = 1;
      }
      const streak = v > 240 ? (v - 240) * 0.07 : 0;
      for (let li = 0; li < L.length; li++) {
        for (const s of L[li].s) {
          const al = 0.55 + 0.45 * Math.sin(T * 2.2 + s.tw);
          g.globalAlpha = al; g.fillStyle = s.c;
          const x = s.x * w, y = s.y * h;
          if (li === 2 && streak > 1) { g.fillRect(x - s.r * 0.5, y - streak, s.r, streak + s.r); }
          else if (s.r < 1.1) g.fillRect(x - s.r / 2, y - s.r / 2, s.r * 1.2, s.r * 1.2);
          else { circle(g, x, y, s.r); g.fill(); }
        }
      }
      g.globalAlpha = 1;
    },
  };
}

/* ======================================================================
   GAME 1: CATCH THE STARS
   ====================================================================== */
function createCatch(api) {
  const P = api.parts, F = api.floats, spr = api.rocket;
  const ROUND = 75, MAXH = 5;
  let W = 0, H = 0, rh = 80, rw = 60, rx = 0, tx = 0, ry = 0, tilt = 0;
  let t = 0, score = 0, hearts = 3, combo = 0, bestCombo = 0, caught = 0, items = [], spawnT = 1.0;
  let shake = 0, inv = 0, keyL = false, keyR = false, done = false, doneT = 0, reason = '', warned = false, lastSay = -99, comboPop = 0, ended = false, lastHud = '';
  const CHEERS = [['oda', 'Catch that one!'], ['dad', 'Great catching, Harper!'], ['mum', 'Wow, you are a star catcher!'], ['leo', 'Textbook flying, Commander Harper!'], ['maggie', 'Woof woof!'], ['oda', 'So many stars! Can I have one?']];
  let cheerI = 0;
  function resize(w, h) {
    const first = !W; W = w; H = h;
    rh = clamp(Math.min(h * 0.14, w * 0.22), 64, 120);
    rw = rocketSize(spr, rh)[0];
    ry = h - api.safe.bottom - rh * 0.5 - Math.max(30, rh * 0.38);
    if (first) { rx = tx = w / 2; F.add(w / 2, h * 0.42, fillName('Go, Harper!'), '#ffd166', 44, 1.4); }
    rx = clamp(rx, rw / 2 + 6, w - rw / 2 - 6); tx = clamp(tx, rw / 2 + 6, w - rw / 2 - 6);
  }
  function hud() { const tl = Math.ceil(ROUND - t); const k = score + '|' + hearts + '|' + tl; if (k !== lastHud) { lastHud = k; api.hud({ score, hearts, maxHearts: MAXH, time: Math.max(0, tl) }); } }
  function spawn() {
    const d = Math.min(1, t / 70), sc = clamp(H / 800, 0.8, 1.3);
    const base = (125 + 120 * d) * sc;
    const pAst = t < 4 ? 0 : 0.13 + 0.13 * d;
    const roll = Math.random();
    let kind = 'star';
    if (roll < 0.035) kind = 'rainbow';
    else if (roll < 0.065 && hearts < MAXH && t > 8) kind = 'heart';
    else if (roll < 0.065 + pAst) kind = 'ast';
    const r = (kind === 'ast' ? rand(22, 34) : kind === 'star' ? rand(16, 20) : kind === 'rainbow' ? 17 : 19) * sc;
    const x = rand(r + 12, W - r - 12);
    const mk = (xx, yy) => ({ kind, x: xx, y: yy, r, vy: base * (kind === 'ast' ? rand(0.9, 1.2) : kind === 'rainbow' ? 1.3 : kind === 'heart' ? 0.75 : rand(0.92, 1.08)), vx: kind === 'rainbow' ? (xx < W / 2 ? 1 : -1) * rand(60, 120) * sc : kind === 'ast' ? rand(-25, 25) : 0, rot: rand(0, TAU), vr: kind === 'ast' ? rand(-2.2, 2.2) : 0, ph: rand(0, TAU), rock: kind === 'ast' ? makeRock(r) : null });
    if (kind === 'star' && Math.random() < 0.12) {
      const dir = x < W / 2 ? 1 : -1;
      for (let i = 0; i < 3; i++) items.push(mk(clamp(x + dir * i * r * 2.6, r + 10, W - r - 10), -r - 10 - i * r * 2.4));
    } else items.push(mk(x, -r - 10));
  }
  function cheer() {
    if (t - lastSay < 6) return false;
    lastSay = t; const c = CHEERS[cheerI++ % CHEERS.length]; say(c[0], c[1]); if (c[0] === 'maggie' || c[0] === 'joules') sfx('bark');
    return true;
  }
  function finish(why) {
    if (done) return; done = true; reason = why; doneT = 0; keyL = keyR = false;
    if (why === 'time') { F.add(W / 2, H * 0.4, "Time's up!", '#ffd166', 46, 1.6); sfx('whoosh'); }
    else { F.add(W / 2, H * 0.4, 'What a flight!', '#ffd166', 46, 1.6); sfx('whoosh'); }
  }
  function update(dt, T) {
    P.update(dt); F.update(dt); shake = Math.max(0, shake - dt); comboPop = Math.max(0, comboPop - dt);
    if (done) {
      doneT += dt; for (const it of items) { it.y += it.vy * dt * 0.3; it.rot += it.vr * dt; }
      if (doneT > 1.6 && !ended) {
        ended = true;
        const lines = [`You caught ${caught} star${caught === 1 ? '' : 's'}.`, bestCombo >= 3 ? `Best combo: ${bestCombo} in a row!` : ''];
        api.end(score, { lines, title: reason === 'time' ? "Time's up!" : 'Out of hearts, but what a flight!' });
      }
      return;
    }
    t += dt; inv = Math.max(0, inv - dt);
    const dir = (keyR ? 1 : 0) - (keyL ? 1 : 0);
    if (dir) tx = rx + dir * W * 0.5;
    tx = clamp(tx, rw / 2 + 6, W - rw / 2 - 6);
    const prev = rx; rx += (tx - rx) * Math.min(1, dt * (dir ? 6 : 13));
    tilt = lerp(tilt, clamp((rx - prev) / Math.max(dt, 0.001) / 1400, -0.35, 0.35), Math.min(1, dt * 10));
    api.sky.update(dt, 70 + 50 * Math.min(1, t / 70), H);
    spawnT -= dt;
    if (spawnT <= 0) { spawn(); const d = Math.min(1, t / 70); spawnT = lerp(0.85, 0.45, d) * rand(0.75, 1.25); }
    if (Math.random() < dt * 30) P.add({ x: rx + rand(-4, 4), y: ry + rh * 0.48, vx: rand(-20, 20), vy: rand(120, 220), life: rand(0.25, 0.45), c: pick(['#ffb347', '#ffd166', '#ff7a45']), s: rand(2, 4), g: 0, star: false });
    const bx0 = rx - rw * 0.42, bx1 = rx + rw * 0.42, by0 = ry - rh * 0.5, by1 = ry + rh * 0.38;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y += it.vy * dt; it.x += it.vx * dt; it.rot += it.vr * dt;
      if (it.kind === 'ast' && (it.x < it.r || it.x > W - it.r)) it.vx = -it.vx;
      if (it.kind === 'rainbow') {
        if (it.x < -40 || it.x > W + 40) { items.splice(i, 1); continue; }
        if (Math.random() < dt * 60) P.add({ x: it.x + rand(-4, 4), y: it.y + rand(-4, 4), vx: -it.vx * 0.2 + rand(-15, 15), vy: -it.vy * 0.15 + rand(-15, 15), life: rand(0.4, 0.8), c: `hsl(${(T * 400 + rand(0, 60)) % 360},95%,68%)`, s: rand(2, 4), g: 0, star: Math.random() < 0.5, spin: 4 });
      }
      const nx = clamp(it.x, bx0, bx1), ny = clamp(it.y, by0, by1);
      const dist = Math.hypot(it.x - nx, it.y - ny);
      const reach = it.kind === 'ast' ? it.r * 0.68 : it.r * 1.15;
      if (dist < reach) {
        if (it.kind === 'ast') {
          if (inv > 0) continue;
          items.splice(i, 1);
          hearts--; shake = 0.45; inv = 1.6; combo = 0; sfx('thud');
          P.burst(it.x, it.y, 18, ['#9d9ab4', '#6c6984', '#c4c1d6'], { stars: 0, g: 300 });
          F.add(rx, ry - rh * 0.8, pick(['Bonk! Keep going!', 'Oops! You\'ve got this!', 'Shake it off!']), '#ffe3c2', 24, 1.3);
          if (t - lastSay > 8 && hearts > 0) { lastSay = t; say(pick(['mum', 'dad']), pick(['Shake it off, Harper!', 'You\'ve got this!'])); }
          if (hearts <= 0) finish('hearts');
          continue;
        }
        items.splice(i, 1);
        if (it.kind === 'star') {
          score += 1; combo++; caught++; sfx('chime');
          P.burst(it.x, it.y, 12, ['#ffd166', '#fff3b0', '#ffb347'], { g: 120 });
          F.add(it.x, it.y - 10, '+1', '#ffd166', 24, 0.8);
        } else if (it.kind === 'rainbow') {
          score += 5; combo++; caught++; sfx('happy');
          P.burst(it.x, it.y, 34, ['#ff6fa8', '#ffd166', '#5fe0c8', '#8fb2ff', '#b48cff', '#ff7a45'], { max: 340, g: 120 });
          F.add(it.x, it.y - 14, '+5 Rainbow!', '#ff9fd0', 30, 1.2);
        } else if (it.kind === 'heart') {
          sfx('happy');
          P.burst(it.x, it.y, 18, ['#ff6fa8', '#ffe3c2', '#ffb3cf'], { g: 80 });
          if (hearts < MAXH) { hearts++; F.add(it.x, it.y - 12, '+1 heart', '#ff9fd0', 26, 1.1); }
          else { score += 2; F.add(it.x, it.y - 12, '+2', '#ff9fd0', 26, 1); }
        }
        if (combo > bestCombo) bestCombo = combo;
        if (combo >= 3) comboPop = 0.25;
        if (combo > 0 && combo % 10 === 0) {
          score += 5; F.add(W / 2, api.safe.top + 80, `Combo x${combo}! +5`, '#5fe0c8', 34, 1.4);
          if (t - lastSay > 3) { lastSay = t; say('joules', 'Woof!'); sfx('bark'); }
        } else if (caught > 0 && caught % 15 === 0) cheer();
        continue;
      }
      if (it.y - it.r > H + 10) {
        items.splice(i, 1);
        if (it.kind === 'star' && combo > 0) combo = 0;
      }
    }
    if (!warned && ROUND - t <= 10) { warned = true; F.add(W / 2, H * 0.35, '10 seconds left!', '#5fe0c8', 32, 1.6); }
    if (t >= ROUND) finish('time');
    hud();
  }
  function draw(g, w, h, T) {
    g.save();
    if (shake > 0) { const s = shake * 14; g.translate(Math.sin(T * 55) * s, Math.cos(T * 47) * s * 0.6); }
    api.sky.draw(g, w, h, T);
    for (const it of items) {
      if (it.kind === 'star') drawCuteStar(g, it.x, it.y, it.r, Math.sin(T * 3 + it.ph) * 0.25);
      else if (it.kind === 'ast') drawRock(g, it.rock, it.x, it.y, it.rot);
      else if (it.kind === 'heart') drawPluto(g, it.x, it.y, it.r, T, true);
      else if (it.kind === 'rainbow') {
        g.save();
        const hue = (T * 300) % 360;
        g.shadowColor = `hsl(${hue},100%,70%)`; g.shadowBlur = 18;
        starPath(g, it.x, it.y, it.r * 1.15, it.r * 0.5, 5, T * 5);
        const gr = g.createLinearGradient(it.x - it.r, it.y - it.r, it.x + it.r, it.y + it.r);
        for (let k = 0; k < 6; k++) gr.addColorStop(k / 5, `hsl(${(hue + k * 60) % 360},95%,66%)`);
        g.fillStyle = gr; g.fill(); g.shadowBlur = 0; g.lineWidth = 2; g.strokeStyle = '#fff'; g.stroke();
        g.restore();
      }
    }
    P.draw(g);
    const blink = inv > 0 && Math.floor(inv * 10) % 2 === 0;
    drawRocket(g, spr, rx, ry, rh, tilt, T, true, blink ? 0.35 : 1);
    if (inv > 0) { g.strokeStyle = `rgba(95,224,200,${0.5 * inv / 1.6})`; g.lineWidth = 3; circle(g, rx, ry, rh * 0.62); g.stroke(); }
    F.draw(g, w);
    g.restore();
    if (combo >= 3 && !done) {
      const s = 1 + comboPop * 1.2;
      g.save(); g.translate(w / 2, api.safe.top + 26); g.scale(s, s);
      text(g, `Combo x${combo}`, 0, 0, 28, combo >= 10 ? '#5fe0c8' : '#ffd166');
      g.restore();
    }
  }
  function key(k, down) {
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { keyL = down; return true; }
    if (k === 'ArrowRight' || k === 'd' || k === 'D') { keyR = down; return true; }
    return false;
  }
  hud();
  return {
    resize, update, draw, key,
    down(x) { if (!done) tx = x; },
    move(x, y, pressed) { if (pressed && !done) tx = x; },
    up() {},
  };
}

/* ======================================================================
   GAME 2: ASTEROID DODGE
   ====================================================================== */
function createDodge(api) {
  const P = api.parts, F = api.floats, spr = api.rocket;
  let W = 0, H = 0, rh = 80, rw = 60, rx = 0, tx = 0, ry = 0, tilt = 0;
  let t = 0, dist = 0, fuel = 100, hearts = 3, speed = 0, items = [], aT = 1.2, fT = 2.5, inv = 0, shake = 0;
  let keyL = false, keyR = false, done = false, doneT = 0, reason = '', ended = false, lowWarned = false, lastSay = -99, nextMile = 250, fuelCells = 0, lastHud = '';
  const MILES = [['dad', 'Look how far you have flown!'], ['leo', 'Excellent piloting, Commander!'], ['oda', 'Faster! Faster!'], ['mum', 'Amazing dodging, Harper!'], ['joules', 'Woof woof!']];
  let mileI = 0;
  function resize(w, h) {
    const first = !W; W = w; H = h;
    rh = clamp(Math.min(h * 0.13, w * 0.2), 60, 110);
    rw = rocketSize(spr, rh)[0];
    ry = h - api.safe.bottom - h * 0.2;
    if (first) { rx = tx = w / 2; F.add(w / 2, h * 0.42, 'Blast off!', '#ffd166', 44, 1.4); }
    rx = clamp(rx, rw / 2 + 6, w - rw / 2 - 6); tx = clamp(tx, rw / 2 + 6, w - rw / 2 - 6);
  }
  function hud() { const s = Math.floor(dist); const f = Math.round(fuel); const k = s + '|' + hearts + '|' + f; if (k !== lastHud) { lastHud = k; api.hud({ score: s, label: 'Miles', hearts, maxHearts: 3, meter: fuel / 100, meterLabel: 'Fuel' }); } }
  function finish(why) {
    if (done) return; done = true; reason = why; doneT = 0; keyL = keyR = false; sfx('whoosh');
    F.add(W / 2, H * 0.4, why === 'fuel' ? 'Out of fuel!' : 'What a trip!', '#ffd166', 44, 1.6);
  }
  function update(dt, T) {
    P.update(dt); F.update(dt); shake = Math.max(0, shake - dt);
    if (done) {
      doneT += dt; speed = Math.max(0, speed - dt * 300); api.sky.update(dt, speed * 0.6, H);
      for (const it of items) { it.y += speed * dt; it.rot += it.vr * dt; }
      if (doneT > 1.6 && !ended) { ended = true; api.end(Math.floor(dist), { lines: [`You flew ${Math.floor(dist)} space miles.`, fuelCells ? `You grabbed ${fuelCells} fuel cell${fuelCells === 1 ? '' : 's'}.` : ''], title: reason === 'fuel' ? 'Out of fuel, what a trip!' : 'Out of hearts, but what a trip!' }); }
      return;
    }
    t += dt; inv = Math.max(0, inv - dt);
    const d = Math.min(1, t / 100), sc = clamp(H / 800, 0.8, 1.3);
    speed = (170 + 210 * d) * sc;
    dist += (speed * dt) / 22 / sc;
    fuel -= dt * 3.6;
    const dir = (keyR ? 1 : 0) - (keyL ? 1 : 0);
    if (dir) tx = rx + dir * W * 0.5;
    tx = clamp(tx, rw / 2 + 6, W - rw / 2 - 6);
    const prev = rx; rx += (tx - rx) * Math.min(1, dt * (dir ? 6 : 12));
    tilt = lerp(tilt, clamp((rx - prev) / Math.max(dt, 0.001) / 1400, -0.4, 0.4), Math.min(1, dt * 10));
    api.sky.update(dt, speed * 0.9, H);
    aT -= dt;
    if (aT <= 0) {
      aT = lerp(1.05, 0.4, d) * rand(0.75, 1.3);
      const r = rand(18, 42) * sc * (W < 500 ? 0.85 : 1);
      items.push({ kind: 'ast', x: rand(r, W - r), y: -r - 10, r, vy: rand(0.85, 1.12), vx: rand(-30, 30), rot: rand(0, TAU), vr: rand(-2, 2), rock: makeRock(r) });
    }
    fT -= dt;
    if (fT <= 0) {
      fT = rand(2.6, 3.8) + (fuel > 80 ? 1.5 : 0);
      const s = 24 * sc;
      let x = rand(s + 10, W - s - 10);
      for (let k = 0; k < 6 && items.some((it) => it.y < 80 && Math.abs(it.x - x) < it.r + s * 1.5); k++) x = rand(s + 10, W - s - 10);
      items.push({ kind: 'fuel', x, y: -s - 10, r: s, vy: 1, vx: 0, rot: 0, vr: 0 });
    }
    if (Math.random() < dt * 35) P.add({ x: rx + rand(-4, 4), y: ry + rh * 0.48, vx: rand(-20, 20), vy: rand(150, 260), life: rand(0.25, 0.45), c: pick(['#ffb347', '#ffd166', '#ff7a45']), s: rand(2, 4), g: 0, star: false });
    const c1 = [rx, ry - rh * 0.18, rw * 0.36], c2 = [rx, ry + rh * 0.18, rw * 0.42];
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y += speed * it.vy * dt; it.x += it.vx * dt; it.rot += it.vr * dt;
      if (it.kind === 'ast' && (it.x < it.r * 0.5 || it.x > W - it.r * 0.5)) it.vx = -it.vx;
      const hit = (c) => Math.hypot(it.x - c[0], it.y - c[1]) < c[2] + it.r * (it.kind === 'ast' ? 0.72 : 1.1);
      if (hit(c1) || hit(c2)) {
        if (it.kind === 'fuel') {
          items.splice(i, 1); fuel = Math.min(100, fuel + 30); fuelCells++; sfx('chime');
          P.burst(it.x, it.y, 16, ['#7bea6a', '#c8ffb0', '#fffbe0'], { g: 80 });
          F.add(it.x, it.y - 10, '+Fuel', '#a8ff8f', 26, 0.9);
          if (fuel > 40) lowWarned = false;
          continue;
        }
        if (inv > 0) continue;
        items.splice(i, 1); hearts--; inv = 2; shake = 0.45; sfx('thud');
        P.burst(it.x, it.y, 18, ['#9d9ab4', '#6c6984', '#c4c1d6'], { stars: 0, g: 300 });
        F.add(rx, ry - rh * 0.8, pick(['Bonk! Keep going!', 'Phew, still flying!', 'Shake it off!']), '#ffe3c2', 24, 1.3);
        if (hearts <= 0) finish('hearts');
        continue;
      }
      if (it.y - it.r > H + 20) items.splice(i, 1);
    }
    if (fuel < 25 && !lowWarned) { lowWarned = true; F.add(W / 2, H * 0.32, 'Grab a fuel cell!', '#a8ff8f', 30, 1.6); if (t - lastSay > 10) { lastSay = t; say('leo', 'Fuel is getting low, Harper!'); } }
    if (dist >= nextMile) {
      F.add(W / 2, H * 0.3, `${nextMile} space miles!`, '#5fe0c8', 32, 1.5);
      if (t - lastSay > 6) { lastSay = t; const m = MILES[mileI++ % MILES.length]; say(m[0], m[1]); if (m[0] === 'joules') sfx('bark'); }
      nextMile += 250;
    }
    if (fuel <= 0) { fuel = 0; finish('fuel'); }
    hud();
  }
  function draw(g, w, h, T) {
    g.save();
    if (shake > 0) { const s = shake * 14; g.translate(Math.sin(T * 55) * s, Math.cos(T * 47) * s * 0.6); }
    api.sky.draw(g, w, h, T);
    for (const it of items) {
      if (it.kind === 'ast') drawRock(g, it.rock, it.x, it.y, it.rot);
      else drawFuel(g, it.x, it.y, it.r, T);
    }
    P.draw(g);
    const blink = inv > 0 && Math.floor(inv * 10) % 2 === 0;
    drawRocket(g, spr, rx, ry, rh, tilt, T, !done || speed > 20, blink ? 0.35 : 1);
    F.draw(g, w);
    g.restore();
  }
  function key(k, down) {
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { keyL = down; return true; }
    if (k === 'ArrowRight' || k === 'd' || k === 'D') { keyR = down; return true; }
    return false;
  }
  hud();
  return { resize, update, draw, key, down(x) { if (!done) tx = x; }, move(x, y, p) { if (p && !done) tx = x; }, up() {} };
}

/* ======================================================================
   GAME 3: PLANET LINE-UP
   ====================================================================== */
function createPlanets(api) {
  const P = api.parts, F = api.floats;
  const LEVELS = [
    { order: PL_ORDER, title: 'Drag the planets into order from the Sun', facts: ['Neptune is so far away that one year there lasts 165 Earth years!', 'Venus is the hottest planet, even though Mercury is closer to the Sun.', 'Sunlight takes about 8 minutes to reach Earth, and over 4 hours to reach Neptune!'] },
    { order: ['jupiter', 'saturn', 'uranus', 'neptune', 'earth', 'venus', 'mars', 'mercury'], title: 'Now line them up by size: biggest first!', facts: ['More than 1,300 Earths could fit inside Jupiter!', 'Saturn is so light for its size that it could float in a giant bathtub!', 'Mercury is only a little bit bigger than our Moon.'] },
  ];
  let W = 0, H = 0, lv = 0, bodies = [], t = 0, mistakes = 0, total = 0, phase = 'play', drag = null, sel = 0, glow = -1, glowT = 0, lay = null, ended = false, doneT = 0, factShown = false, lastHud = '';
  const lvScores = [];
  function setup() {
    const ids = shuffle(PL_ORDER);
    bodies = ids.map((id, i) => ({ id, home: i, slot: -1, x: 0, y: 0, wig: 0, miss: 0, sc: 1 }));
    t = 0; mistakes = 0; phase = 'play'; glow = -1; drag = null; sel = 0; doneT = 0; factShown = false;
    if (W) { layout(); for (const b of bodies) { const p = target(b); b.x = p.x; b.y = p.y - 200 - Math.random() * 200; } }
    hud(true);
  }
  function hud(force) { const s = Math.floor(t); const k = total + '|' + s + '|' + lv; if (force || k !== lastHud) { lastHud = k; api.hud({ score: total, time: s, extra: `Level ${lv + 1} of 2` }); } }
  function layout() {
    const s = api.safe, L = s.left + 14, R = W - s.right - 14, top = s.top + 6, bot = H - s.bottom - 10;
    const g = api.g; g.font = `800 24px ${FD}`;
    const titleLines = wrapLines(g, LEVELS[lv].title, R - L);
    const titleY = top + 16, tH = titleLines.length * 28 + 14;
    const portrait = W < H * 1.05;
    const o = { portrait, titleLines, titleY, slots: [], homes: [] };
    if (!portrait) {
      const aTop = top + tH, avail = bot - aTop;
      const sunR = clamp(avail * 0.2, 44, 110);
      o.sun = { x: L - sunR * 0.35, y: aTop + avail * 0.27, r: sunR };
      const rowY = o.sun.y, edge = o.sun.x + sunR * 1.2;
      let sr = 40; for (let k = 0; k < 3; k++) { const sp0 = (R - sr - 4 - (edge + sr + 12)) / 7; sr = clamp(Math.min(sp0 * 0.4, avail * 0.13), 18, 50); }
      o.sr = sr;
      const x0 = edge + sr + 12, x1 = R - sr - 4, sp = (x1 - x0) / 7;
      for (let i = 0; i < 8; i++) o.slots.push({ x: x0 + sp * i, y: rowY });
      const tTop = rowY + o.sr + 54, tBot = bot;
      const per = (R - L) / 8 >= Math.max(92, o.sr * 2.4) ? 8 : 4, rows = 8 / per;
      const cw = (R - L) / per, ch = (tBot - tTop) / rows;
      o.pr = clamp(Math.min(o.sr, cw * 0.34, (ch - 30) * 0.42), 16, 50);
      for (let i = 0; i < 8; i++) o.homes.push({ x: L + cw * (i % per + 0.5), y: tTop + ch * (Math.floor(i / per) + 0.5) - 12 });
      o.nameBelow = true;
    } else {
      const aTop = top + tH, avail = bot - aTop;
      const colX = L + clamp(W * 0.1, 36, 80);
      const sunR = clamp(Math.min(W * 0.1, avail * 0.06), 26, 60);
      o.sun = { x: colX, y: aTop + sunR + 4, r: sunR };
      const sY0 = o.sun.y + sunR + 16, sY1 = bot - 6;
      let sr = 30; for (let k = 0; k < 3; k++) { const sp = (sY1 - sY0 - 2 * sr) / 7; sr = clamp(Math.min(sp * 0.42, W * 0.085), 16, 44); }
      o.sr = sr;
      const sp = (sY1 - sY0 - 2 * sr) / 7;
      for (let i = 0; i < 8; i++) o.slots.push({ x: colX, y: sY0 + sr + sp * i });
      const tL = Math.max(colX + sr + 120, W * 0.5), cw = (R - tL) / 2, ch = (bot - aTop) / 4;
      o.pr = clamp(Math.min(sr, cw * 0.32, (ch - 32) * 0.42), 16, 46);
      for (let i = 0; i < 8; i++) o.homes.push({ x: tL + cw * (i % 2 + 0.5), y: aTop + ch * (Math.floor(i / 2) + 0.5) - 10 });
      o.nameBelow = false;
    }
    lay = o;
  }
  function target(b) { return b.slot >= 0 ? lay.slots[b.slot] : lay.homes[b.home]; }
  function radius(b) { return (b.slot >= 0 ? lay.sr * 0.92 : lay.pr) * b.sc; }
  function resize(w, h) { const first = !W; W = w; H = h; layout(); if (first) for (const b of bodies) { const p = target(b); b.x = p.x; b.y = p.y - 200 - Math.random() * 200; } }
  function tryPlace(b, k) {
    const want = LEVELS[lv].order[k];
    if (bodies.some((o) => o.slot === k)) return false;
    if (want === b.id) {
      b.slot = k; sfx('chime');
      const p = lay.slots[k]; P.burst(p.x, p.y, 16, ['#ffd166', '#5fe0c8', '#fff'], { g: 60 });
      F.add(p.x, p.y - lay.sr - 14, PL[b.id].name + '!', '#5fe0c8', 22, 0.9);
      if (glow === k) glow = -1;
      if (bodies.every((o) => o.slot >= 0)) levelDone();
      else { const nx = bodies.findIndex((o) => o.slot < 0); sel = nx; }
      return true;
    }
    b.wig = 0.6; b.miss++; mistakes++; sfx('oops');
    const h0 = lay.homes[b.home], p = { x: h0.x, y: h0.y - lay.pr - 4 };
    if (b.miss >= 2) {
      glow = LEVELS[lv].order.indexOf(b.id); glowT = 4;
      F.add(p.x, p.y, 'Try the glowing spot!', '#ffe3c2', 22, 1.8);
    } else F.add(p.x, p.y, pick(['Not quite, try another spot!', 'Close! Have another go.', 'Hmm, not there.']), '#ffe3c2', 22, 1.4);
    return false;
  }
  function levelDone() {
    phase = 'done'; doneT = 0;
    const sc = Math.max(20, 120 - Math.floor(t) - 4 * mistakes);
    lvScores.push({ sc, time: Math.floor(t), mistakes });
    total += sc; sfx('happy'); hud(true);
    for (const s of lay.slots) P.burst(s.x, s.y, 10, ['#ffd166', '#ff6fa8', '#5fe0c8', '#fff'], { g: 60 });
    say('leo', lv === 0 ? 'Perfect! That is the order from the Sun.' : 'Spot on! Jupiter is the giant of the solar system.');
    if (lv === 1) for (const b of bodies) b.sc = 1;
  }
  function update(dt, T) {
    P.update(dt); F.update(dt);
    if (glowT > 0) { glowT -= dt; if (glowT <= 0) glow = -1; }
    if (phase === 'play') { t += dt; hud(); }
    if (phase === 'done') {
      doneT += dt;
      if (doneT > 1.1 && !factShown) {
        factShown = true;
        const last = lv === 1;
        api.modal({
          title: last ? 'All lined up!' : 'Level 1 done!',
          text: 'Fun fact: ' + pick(LEVELS[lv].facts),
          button: last ? 'See my score' : 'Next: biggest to smallest',
          bottom: true,
          onGo: () => {
            if (last) { if (!ended) { ended = true; api.end(total, { lines: lvScores.map((s, i) => `Level ${i + 1}: ${s.time} seconds, ${s.mistakes} oops${s.mistakes === 1 ? '' : 'es'}`) }); } }
            else { lv = 1; setup(); layout(); for (const b of bodies) { const p = target(b); b.x = p.x; b.y = p.y + 300; } }
          },
        });
      }
    }
    for (const b of bodies) {
      b.wig = Math.max(0, b.wig - dt);
      const tsc = lv === 1 && b.slot >= 0 ? 0.5 + 0.62 * Math.sqrt(PL[b.id].km / 69911) : 1;
      b.sc += (tsc - b.sc) * Math.min(1, dt * 6);
      if (drag && drag.b === b) continue;
      const p = target(b); b.x += (p.x - b.x) * Math.min(1, dt * 10); b.y += (p.y - b.y) * Math.min(1, dt * 10);
    }
  }
  function draw(g, w, h, T) {
    api.sky.update(0.016, 8, h);
    api.sky.draw(g, w, h, T, { deco: false });
    const o = lay; if (!o) return;
    o.titleLines.forEach((l, i) => text(g, l, w / 2, o.titleY + i * 28, 24, '#fdf8ff'));
    if (lv === 0) { drawSun(g, o.sun.x, o.sun.y, o.sun.r, T, true); text(g, 'Sun', o.portrait ? o.sun.x + o.sun.r * 1.3 + 10 : Math.max(36, o.sun.x + o.sun.r * 0.35), o.portrait ? o.sun.y : o.sun.y + o.sun.r + 26, 20, '#ffd166', o.portrait ? 'left' : 'center'); }
    else {
      g.save(); g.translate(o.portrait ? o.sun.x - o.sr * 0.6 : Math.max(api.safe.left + 14, o.slots[0].x - o.sr - 16 - 50), o.sun.y);
      text(g, 'Biggest', 0, -4, 24, '#ffd166', 'left');
      text(g, 'first', 0, 22, 18, '#c9c3f0', 'left');
      g.restore();
    }
    // guide line
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 3; g.setLineDash([6, 10]);
    g.beginPath(); g.moveTo(o.slots[0].x, o.slots[0].y); g.lineTo(o.slots[7].x, o.slots[7].y); g.stroke(); g.setLineDash([]);
    o.slots.forEach((s, i) => {
      const filled = bodies.find((b) => b.slot === i);
      if (!filled) {
        circle(g, s.x, s.y, o.sr); g.fillStyle = 'rgba(30,25,84,.85)'; g.fill();
        const gl = glow === i ? 0.6 + 0.4 * Math.sin(T * 8) : 0;
        g.setLineDash([7, 6]); g.lineWidth = 3; g.strokeStyle = gl ? `rgba(255,209,102,${gl})` : 'rgba(255,255,255,.35)'; g.stroke(); g.setLineDash([]);
        if (gl) { g.lineWidth = 6; g.strokeStyle = `rgba(255,209,102,${gl * 0.4})`; circle(g, s.x, s.y, o.sr + 6); g.stroke(); }
        text(g, String(i + 1), s.x, s.y + 1, Math.max(18, o.sr * 0.7), 'rgba(201,195,240,.75)', 'center', { outline: false });
      }
    });
    if (lv === 1 && !bodies.some((b) => b.slot === 7)) {
      const sl = o.slots[7];
      if (o.portrait) text(g, 'smallest', sl.x + o.sr + 10, sl.y + o.sr * 0.2 + 2, 18, '#c9c3f0', 'left');
      else text(g, 'smallest', sl.x, sl.y + o.sr + 18, 18, '#c9c3f0');
    }
    // placed planets + names
    for (const b of bodies) if (b.slot >= 0 && !(drag && drag.b === b)) {
      const s = o.slots[b.slot], r = radius(b);
      drawPlanet(g, b.id, b.x, b.y, r, true);
      if (o.nameBelow) text(g, PL[b.id].name, s.x, s.y + o.sr + 18, 18, '#fdf8ff', 'center', { font: FB, weight: 700 });
      else text(g, PL[b.id].name, s.x + o.sr * 1.2 + 10, s.y, 18, '#fdf8ff', 'left', { font: FB, weight: 700 });
    }
    // tray
    for (const b of bodies) if (b.slot < 0 && !(drag && drag.b === b)) drawTray(g, b, T, o);
    if (drag) drawTray(g, drag.b, T, o, true);
    P.draw(g); F.draw(g, w);
  }
  function drawTray(g, b, T, o, dragging) {
    const r = radius(b) * (dragging ? 1.12 : 1), wx = Math.sin(b.wig * 40) * b.wig * 16;
    if (!dragging && b.slot < 0 && bodies.indexOf(b) === sel && api.keyboard) { g.strokeStyle = 'rgba(255,209,102,.9)'; g.lineWidth = 3; circle(g, b.x, b.y, r + 8); g.stroke(); }
    if (dragging) { g.fillStyle = 'rgba(0,0,0,.25)'; ell(g, b.x + 6, b.y + 10, r, r * 0.9); g.fill(); }
    drawPlanet(g, b.id, b.x + wx, b.y, r, true);
    text(g, PL[b.id].name, b.x + wx, b.y + r + (b.id === 'saturn' ? 22 : 16), 18, '#fdf8ff', 'center', { font: FB, weight: 700 });
  }
  function hitBody(x, y) {
    let best = null, bd = 1e9;
    for (const b of bodies) { if (b.slot >= 0) continue; const d = Math.hypot(b.x - x, b.y - y); if (d < radius(b) + 22 && d < bd) { bd = d; best = b; } }
    return best;
  }
  function nearestSlot(x, y) {
    let k = -1, bd = 1e9;
    lay.slots.forEach((s, i) => { const d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; k = i; } });
    return bd < lay.sr * 1.7 ? k : -1;
  }
  setup();
  return {
    resize, update, draw,
    down(x, y) { if (phase !== 'play') return; const b = hitBody(x, y); if (b) { drag = { b, dx: b.x - x, dy: b.y - y }; sel = bodies.indexOf(b); sfx('jump'); } },
    move(x, y) { if (drag) { drag.b.x = x + drag.dx; drag.b.y = y + drag.dy; } },
    up(x, y) {
      if (!drag) return; const b = drag.b; drag = null;
      const k = nearestSlot(b.x, b.y); if (k >= 0) tryPlace(b, k);
    },
    key(k, down) {
      if (!down || phase !== 'play') return false;
      const free = bodies.map((b, i) => (b.slot < 0 ? i : -1)).filter((i) => i >= 0);
      if (!free.length) return false;
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowUp') {
        const d = k === 'ArrowRight' || k === 'ArrowDown' ? 1 : -1; let j = free.indexOf(sel); j = (j + d + free.length) % free.length; if (j < 0) j = 0; sel = free[j]; return true;
      }
      if (!free.includes(sel)) sel = free[0];
      if (/^[1-8]$/.test(k)) { tryPlace(bodies[sel], +k - 1); return true; }
      if (k === 'Enter' || k === ' ') { const e = lay.slots.findIndex((s, i) => !bodies.some((b) => b.slot === i)); if (e >= 0) tryPlace(bodies[sel], e); return true; }
      return false;
    },
  };
}

/* ======================================================================
   GAME 4: CONNECT THE CONSTELLATION
   ====================================================================== */
// stars: [id, RA hours, Dec degrees, magnitude, colour?]; figure in projected degrees (x right, y up)
const CONST = [
  { id: 'orion', name: 'Orion the Hunter', fact: 'Betelgeuse, the red star on his shoulder, is a giant star hundreds of times wider than our Sun.',
    stars: [['bet', 5.919, 7.41, 0.5, '#ffb08a'], ['rig', 5.242, -8.2, 0.1, '#c8dcff'], ['bel', 5.419, 6.35, 1.6], ['mnt', 5.533, -0.3, 2.2], ['alm', 5.604, -1.2, 1.7], ['alk', 5.679, -1.94, 1.8], ['sai', 5.796, -9.67, 2.1], ['mei', 5.585, 9.93, 3.4]],
    paths: [['sai', 'alk', 'bet', 'mei', 'bel', 'mnt', 'rig'], ['alk', 'alm', 'mnt']],
    fig: [{ c: [0.2, 9.9], r: 1.6 }, { p: [[-1, 8.3], [-4.6, 7.9], [-5.4, 6.4], [-2.4, -1.6], [-4.1, -10.8], [-2.1, -11.2], [0.2, -4.8], [3.6, -9.8], [6.2, -9.3], [1.8, -1.2], [3.3, 5.4], [1.4, 8.3]], z: 1 }, { p: [[-5, 7.6], [-7.2, 10.2], [-6.6, 13.2]] }, { p: [[-7.4, 12.2], [-6, 15.8]], w: 3 }, { p: [[5.2, 9.6], [7.3, 6.6], [7.7, 2.6], [6.3, -0.9]] }, { p: [[2.9, 6], [5.6, 4.6]] }, { p: [[-0.1, -2], [0.3, -5.6]], w: 1.5 }] },
  { id: 'plough', name: 'The Plough (Big Dipper)', fact: 'Follow the two stars at the end of the bowl and they point to Polaris, the North Star.',
    stars: [['dub', 11.062, 61.75, 1.8], ['mer', 11.031, 56.38, 2.4], ['phe', 11.897, 53.69, 2.4], ['meg', 12.257, 57.03, 3.3], ['ali', 12.9, 55.96, 1.8], ['miz', 13.399, 54.93, 2.2], ['alk', 13.792, 49.31, 1.9]],
    paths: [['alk', 'miz', 'ali', 'meg', 'dub', 'mer', 'phe', 'meg']],
    fig: [{ p: [[-14.2, -5.0], [-8.6, 0.1], [-4, 0.8], [1, 1.8], [5, 6.6], [9, 8.4], [13, 8], [16.6, 5.6], [17.4, 3.4], [14.2, 3], [12.6, 0.8], [12.9, -7.2], [10.6, -7.4], [9.6, -3], [6, -3.8], [5.6, -8.8], [3.1, -8.8], [2.4, -3.4], [-0.6, -2], [-4.4, -1.8], [-8.6, -1.8], [-13.8, -6]], z: 1 }, { c: [14.6, 5.6], r: 0.4, fill: 1 }, { p: [[11.6, 8.2], [12.2, 9.8], [13.2, 8.1]] }] },
  { id: 'cas', name: 'Cassiopeia the Queen', fact: 'The Queen\'s five bright stars make a W shape that circles around the North Star.',
    stars: [['caph', 0.153, 59.15, 2.3], ['sch', 0.675, 56.54, 2.2], ['gam', 0.945, 60.72, 2.2], ['ruc', 1.43, 60.24, 2.7], ['seg', 1.907, 63.67, 3.4]],
    paths: [['caph', 'sch', 'gam', 'ruc', 'seg']],
    fig: [{ c: [0.3, 4.4], r: 1.6 }, { p: [[-1.4, 5.8], [-1.7, 8], [-0.7, 6.8], [0.3, 8.4], [1.3, 6.8], [2.3, 8], [2, 5.8]], s: 0 }, { p: [[-1, 2.7], [1.6, 2.7], [4.4, -2], [5.4, -6.2], [-4.6, -6.2], [-3.1, -2]], z: 1 }, { p: [[7, -6.8], [7.4, 2.2], [5.6, 4]] }, { p: [[-5.4, -6.8], [7.4, -6.8]], s: 0 }, { p: [[-0.6, 2], [-3.2, 1.6], [-6.2, 4.2]] }] },
  { id: 'cyg', name: 'Cygnus the Swan', fact: 'The Swan flies along the Milky Way. Its tail star, Deneb, shines far brighter than our Sun.',
    stars: [['den', 20.69, 45.28, 1.3], ['sad', 20.37, 40.26, 2.2], ['alb', 19.512, 27.96, 3.1, '#ffd9a0'], ['gie', 20.77, 33.97, 2.5], ['del', 19.75, 45.13, 2.9], ['zet', 21.216, 30.23, 3.2], ['iot', 19.495, 51.73, 3.8]],
    paths: [['den', 'sad', 'alb'], ['zet', 'gie', 'sad', 'del', 'iot']],
    fig: [{ p: [[-5.6, 7.8], [-2.2, 4.4], [1.9, -1.9], [0.3, -0.8], [-3.9, 2.6], [-6.6, 6.4]], z: 1 }, { p: [[-5.6, 7.8], [-6.8, 9.4], [-4.8, 8.8]] }, { p: [[1.4, -1.3], [5, -5], [9, -9.6], [10.6, -11.4], [12.6, -12.6]], w: 1.5 }, { p: [[-0.5, 1.5], [3, 4.6], [5.7, 6.7], [7.8, 10.2], [7.4, 13.4], [9.4, 11.2], [8.8, 7], [6.9, 3.6], [1.5, -0.1]], z: 1 }, { p: [[-1.5, -0.1], [-4.6, -3.6], [-6.6, -6], [-10, -7.8], [-12.8, -9.2], [-10.6, -6.2], [-7.6, -3.8], [-4.6, -1.2], [-2.1, 1.5]], z: 1 }] },
  { id: 'leo', name: 'Leo the Lion', fact: 'The backwards question mark of stars is the Lion\'s mane, and bright Regulus is his heart.',
    stars: [['reg', 10.14, 11.97, 1.4, '#cfe0ff'], ['eta', 10.122, 16.76, 3.5], ['alg', 10.333, 19.84, 2.0, '#ffd9a0'], ['zet', 10.278, 23.42, 3.4], ['mu', 9.879, 26.01, 3.9], ['eps', 9.764, 23.77, 3.0], ['den', 11.818, 14.57, 2.1], ['zos', 11.235, 20.52, 2.6], ['che', 11.237, 15.43, 3.3]],
    paths: [['eps', 'mu', 'zet', 'alg', 'eta', 'reg', 'che', 'den', 'zos', 'alg']],
    fig: [{ c: [7.6, 3.4], r: 5.6 }, { c: [9.2, 4.2], r: 2.6 }, { p: [[3, 7.4], [-3, 5], [-9.8, 3], [-16, 1.3], [-19.8, -1.8], [-19.4, -5], [-18.2, -11.2], [-16.2, -11.2], [-16.4, -6.2], [-11, -5.8], [-10.6, -11.2], [-8.6, -11.2], [-8, -6.8], [1, -7.2], [3.6, -11.6], [5.6, -11.6], [5.6, -8.6], [6.4, -11.6], [8.4, -11.6], [8.2, -5.2], [9.8, -1.8]] }, { p: [[-19.8, -1.6], [-22.6, 1.2], [-23, 4.6], [-21.6, 6]] }, { c: [-21.4, 6.4], r: 1, fill: 1 }] },
  { id: 'sco', name: 'Scorpius the Scorpion', fact: 'Red Antares is the Scorpion\'s heart. Its name means "rival of Mars" because it is so red.',
    stars: [['gra', 16.091, -19.81, 2.6], ['dsc', 16.006, -22.62, 2.3], ['pi', 15.981, -26.11, 2.9], ['sig', 16.353, -25.59, 2.9], ['ant', 16.49, -26.43, 1.0, '#ff8a6a'], ['tau', 16.598, -28.22, 2.8], ['eps', 16.836, -34.29, 2.3], ['mu', 16.864, -38.05, 3.0], ['zet', 16.91, -42.36, 3.6], ['eta', 17.203, -43.24, 3.3], ['the', 17.622, -43.0, 1.9], ['kap', 17.708, -39.03, 2.4], ['lam', 17.56, -37.1, 1.6]],
    paths: [['gra', 'dsc', 'pi'], ['dsc', 'sig', 'ant', 'tau', 'eps', 'mu', 'zet', 'eta', 'the', 'kap', 'lam']],
    fig: [{ p: [[9.4, 10], [6, 8.2], [3.4, 6.6], [1.9, 4.8], [-1.2, -1.2], [-1.5, -5], [-1.9, -9.4], [-5.1, -10.6], [-9.9, -10.9], [-11.7, -7.5], [-10.6, -5.3]], taper: [3.4, 1.2] }, { p: [[-10.6, -5.3], [-9, -4.4], [-8.2, -5.6]], w: 1.4 }, { p: [[8.2, 10.6], [9.5, 13.4], [12.6, 15.4], [13.7, 13], [11.7, 13.7]], w: 1.5 }, { p: [[8.2, 9], [10.5, 6.3], [13.7, 5], [14.3, 7.5], [12.3, 7]], w: 1.5 }, { p: [[4.4, 6.1], [5.6, 2.9], [7.6, 1.9]] }, { p: [[2.9, 4.8], [3.5, 1.4], [5, -0.6]] }, { p: [[5.1, 8.6], [3.6, 11], [1.5, 12]] }, { p: [[3.5, 7.7], [1.3, 9.6], [-0.6, 10]] }] },
  { id: 'crux', name: 'The Southern Cross', fact: 'It is the smallest constellation of all, and it is on the flags of Australia and New Zealand.',
    stars: [['acr', 12.443, -63.1, 0.8, '#cfe0ff'], ['mim', 12.795, -59.69, 1.3, '#cfe0ff'], ['gac', 12.519, -57.11, 1.6, '#ffb08a'], ['del', 12.252, -58.75, 2.8], ['eps', 12.356, -60.4, 3.6]],
    paths: [['gac', 'acr'], ['mim', 'del']],
    fig: [{ p: [[-0.4, 3.8], [2.8, 1.1], [0.2, -4.5], [-3.5, 0.1]], z: 1, s: 0 }, { c: [-0.2, -0.3], r: 5.4 }] },
  { id: 'umi', name: 'The Little Bear (Little Dipper)', fact: 'The Little Bear\'s tail ends at Polaris, the North Star, which hardly moves in the night sky.',
    stars: [['pol', 2.53, 89.26, 2.0, '#fff2c0'], ['yil', 17.537, 86.59, 4.4], ['eps', 16.766, 82.04, 4.2], ['zet', 15.734, 77.79, 4.3], ['koc', 14.845, 74.16, 2.1, '#ffc89a'], ['phe', 15.345, 71.83, 3.0], ['eta', 16.292, 75.76, 4.9]],
    paths: [['pol', 'yil', 'eps', 'zet', 'koc', 'phe', 'eta', 'zet']],
    fig: [{ p: [[-0.6, 10.8], [-1, 7.2], [-1.4, 2.4], [-0.6, -1], [2.5, -2.6], [5.2, -3.4], [7.6, -3.2], [9.4, -5], [8.6, -6.6], [6.4, -6.8], [5.2, -8.4], [4.6, -12.2], [3, -12.2], [2.8, -9.4], [-0.5, -8.8], [-1.6, -12.2], [-3.2, -12.2], [-3.3, -7.4], [-3.3, -3.2], [-2.3, 1.6], [-2.5, 7], [-0.6, 10.8]] }, { c: [7.6, -4.4], r: 0.35, fill: 1 }, { p: [[5.4, -3.3], [5.8, -2], [6.8, -3.1]] }] },
];
function projectConst(c) {
  const R = Math.PI / 180;
  const v = c.stars.map(([, ra, de]) => { const a = ra * 15 * R, d = de * R; return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)]; });
  let cc = [0, 0, 0]; v.forEach((p) => { cc[0] += p[0]; cc[1] += p[1]; cc[2] += p[2]; });
  const l = Math.hypot(cc[0], cc[1], cc[2]); cc = cc.map((x) => x / l);
  let e = [-cc[1], cc[0], 0]; const el = Math.hypot(e[0], e[1]); e = e.map((x) => x / el);
  const n = [cc[1] * e[2] - cc[2] * e[1], cc[2] * e[0] - cc[0] * e[2], cc[0] * e[1] - cc[1] * e[0]];
  return c.stars.map((s, i) => { const p = v[i], k = p[0] * cc[0] + p[1] * cc[1] + p[2] * cc[2]; return { id: s[0], x: -(p[0] * e[0] + p[1] * e[1] + p[2] * e[2]) / k / R, y: (p[0] * n[0] + p[1] * n[1] + p[2] * n[2]) / k / R, mag: s[3], col: s[4] || '#ffffff' }; });
}
function createStars(api) {
  const P = api.parts, F = api.floats;
  const ROUNDS = 3;
  const order = shuffle(CONST).slice(0, ROUNDS);
  let W = 0, H = 0, ci = -1, C = null, stars = [], steps = [], si = 0, lines = [], pen = -1, t = 0, mistakes = 0, phase = 'play', figA = 0, doneT = 0, total = 0, maxTotal = 0, ended = false, wob = {}, box = null, filler = [], idle = 0, lastHud = '';
  const results = [];
  for (const c of order) { const nLines = c.paths.reduce((a, p) => a + p.length - 1, 0); maxTotal += nLines * 10 + 60; }
  function next() {
    ci++; C = order[ci]; const pr = projectConst(C);
    stars = pr; steps = []; lines = []; si = 0; pen = -1; t = 0; mistakes = 0; phase = 'play'; figA = 0; doneT = 0; wob = {}; idle = 0;
    const idx = (id) => stars.findIndex((s) => s.id === id);
    for (const path of C.paths) path.forEach((id, i) => steps.push({ star: idx(id), draw: i > 0 }));
    filler = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), r: rand(0.6, 1.6), tw: rand(0, TAU) }));
    if (W) layout();
    hud(true);
  }
  function hud(force) { const k = total + '|' + Math.floor(t) + '|' + ci; if (force || k !== lastHud) { lastHud = k; api.hud({ score: total, time: Math.floor(t), extra: `Sky ${ci + 1} of ${ROUNDS}` }); } }
  function layout() {
    const s = api.safe, L = s.left + 24, R = W - s.right - 24, top = s.top + 50, bot = H - s.bottom - Math.min(230, H * 0.28);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    const addPt = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
    stars.forEach((p) => addPt(p.x, p.y));
    for (const f of C.fig) { if (f.c) { addPt(f.c[0] - f.r, f.c[1] - f.r); addPt(f.c[0] + f.r, f.c[1] + f.r); } else f.p.forEach((q) => addPt(q[0], q[1])); }
    const bw = Math.max(1, x1 - x0), bh = Math.max(1, y1 - y0);
    const sc = Math.min((R - L) / bw, (bot - top) / bh);
    const cx = (L + R) / 2, cy = (top + bot) / 2, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    box = { sc, map: (x, y) => [cx + (x - mx) * sc, cy - (y - my) * sc] };
    for (const p of stars) { const m = box.map(p.x, p.y); p.sx = m[0]; p.sy = m[1]; p.sr = clamp(10 - p.mag * 1.5, 4, 10) * clamp(Math.min(W, H) / 700, 0.85, 1.3); }
  }
  function resize(w, h) { W = w; H = h; layout(); }
  function tapStar(k) {
    const st = steps[si]; if (!st) return;
    idle = 0;
    if (k === st.star) {
      if (st.draw) { lines.push({ a: pen, b: k, p: 0 }); total += 10; sfx('chime'); P.burst(stars[k].sx, stars[k].sy, 10, ['#ffd166', '#fff', '#5fe0c8'], { g: 0, max: 160 }); }
      else { sfx('jump'); P.burst(stars[k].sx, stars[k].sy, 6, ['#fff', '#5fe0c8'], { g: 0, max: 100 }); }
      pen = k; si++;
      if (si >= steps.length) complete();
      hud(true);
    } else if (k !== pen) {
      mistakes++; wob[k] = 0.5; sfx('oops');
      F.add(stars[k].sx, stars[k].sy - 26, 'Try the glowing star!', '#ffe3c2', 22, 1.2);
    }
  }
  function complete() {
    phase = 'done'; doneT = 0;
    const bonus = 30 + Math.max(0, Math.round(30 - t)) - 3 * mistakes;
    const add = Math.max(20, bonus); total += add;
    results.push({ name: C.name, time: Math.floor(t), mistakes });
    sfx('happy');
    for (const s of stars) P.burst(s.sx, s.sy, 8, ['#ffd166', '#ff6fa8', '#5fe0c8', '#fff'], { g: 0, max: 200 });
    F.add(W / 2, box.map(0, 0)[1], `+${add}`, '#5fe0c8', 34, 1.2);
    say('leo', `That's ${C.name}! Well done, Harper.`);
    hud(true);
  }
  function update(dt) {
    P.update(dt); F.update(dt);
    for (const k in wob) { wob[k] -= dt; if (wob[k] <= 0) delete wob[k]; }
    for (const l of lines) l.p = Math.min(1, l.p + dt * 5);
    if (phase === 'play') { t += dt; idle += dt; hud(); }
    else {
      doneT += dt; figA = Math.min(1, figA + dt * 0.7);
      if (doneT > 1.2 && doneT - dt <= 1.2) {
        const last = ci >= ROUNDS - 1;
        api.modal({
          title: C.name, text: C.fact, button: last ? 'See my score' : 'Next constellation', bottom: true,
          onGo: () => { if (last) { if (!ended) { ended = true; api.end(total, { max: maxTotal, lines: results.map((r) => `${r.name}: ${r.time}s`) }); } } else next(); },
        });
      }
    }
  }
  function drawFigure(g, T) {
    if (figA <= 0) return;
    g.save(); g.globalAlpha = figA * 0.6; g.lineJoin = 'round'; g.lineCap = 'round';
    const sc = box.sc, lw = Math.max(2, sc * 0.18);
    g.strokeStyle = '#9fd8ff'; g.fillStyle = 'rgba(95,180,255,.08)';
    for (const f of C.fig) {
      if (f.c) { const m = box.map(f.c[0], f.c[1]); circle(g, m[0], m[1], f.r * sc); if (f.fill) { g.fillStyle = '#9fd8ff'; g.fill(); g.fillStyle = 'rgba(95,180,255,.08)'; } else { g.lineWidth = lw; g.stroke(); } continue; }
      const pts = f.p.map((q) => box.map(q[0], q[1]));
      if (f.taper) {
        for (let i = 0; i < pts.length - 1; i++) { g.lineWidth = lerp(f.taper[0], f.taper[1], i / (pts.length - 2)) * sc; g.globalAlpha = figA * 0.25; g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[i + 1][0], pts[i + 1][1]); g.stroke(); }
        g.globalAlpha = figA * 0.6; continue;
      }
      g.lineWidth = lw * (f.w || 1);
      if (f.s === 0) { g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); if (f.z) g.closePath(); }
      else smoothPath(g, pts, !!f.z);
      if (f.z) g.fill();
      g.stroke();
    }
    g.restore();
  }
  function draw(g, w, h, T) {
    api.sky.update(0.016, 4, h);
    api.sky.draw(g, w, h, T, { deco: false });
    if (!box) return;
    // milky haze + filler stars
    for (const f of filler) { g.globalAlpha = 0.35 + 0.3 * Math.sin(T * 2 + f.tw); g.fillStyle = '#fff'; circle(g, f.x * w, f.y * h, f.r); g.fill(); }
    g.globalAlpha = 1;
    drawFigure(g, T);
    // lines
    g.lineCap = 'round';
    for (const l of lines) {
      const a = stars[l.a], b = stars[l.b];
      const ex = lerp(a.sx, b.sx, l.p), ey = lerp(a.sy, b.sy, l.p);
      g.strokeStyle = 'rgba(95,224,200,.35)'; g.lineWidth = 10; g.beginPath(); g.moveTo(a.sx, a.sy); g.lineTo(ex, ey); g.stroke();
      g.strokeStyle = '#bff7ec'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(a.sx, a.sy); g.lineTo(ex, ey); g.stroke();
    }
    const st = phase === 'play' ? steps[si] : null;
    // guide from pen to target after a pause
    if (st && st.draw && pen >= 0 && idle > 4) {
      const a = stars[pen], b = stars[st.star];
      g.setLineDash([6, 10]); g.strokeStyle = 'rgba(255,209,102,.45)'; g.lineWidth = 3; g.beginPath(); g.moveTo(a.sx, a.sy); g.lineTo(b.sx, b.sy); g.stroke(); g.setLineDash([]);
    }
    stars.forEach((s, i) => {
      const wx = wob[i] ? Math.sin(wob[i] * 50) * wob[i] * 14 : 0;
      const x = s.sx + wx, y = s.sy;
      const gl = g.createRadialGradient(x, y, 0, x, y, s.sr * 3.2);
      gl.addColorStop(0, s.col); gl.addColorStop(0.3, 'rgba(255,255,255,.35)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
      circle(g, x, y, s.sr * 3.2); g.fillStyle = gl; g.fill();
      starPath(g, x, y, s.sr * 1.25, s.sr * 0.5, 4, 0); g.fillStyle = s.col; g.fill();
      circle(g, x, y, s.sr * 0.55); g.fillStyle = '#fff'; g.fill();
    });
    if (st) {
      const s = stars[st.star], k = 0.5 + 0.5 * Math.sin(T * 6);
      g.strokeStyle = `rgba(255,209,102,${0.55 + 0.45 * k})`; g.lineWidth = 4;
      circle(g, s.sx, s.sy, 20 + 6 * k); g.stroke();
      g.strokeStyle = `rgba(255,209,102,${0.25 * k})`; g.lineWidth = 10; circle(g, s.sx, s.sy, 28 + 8 * k); g.stroke();
      if (si === 0) text(g, 'Start here!', s.sx, s.sy - 46, 22, '#ffd166');
    }
    if (phase === 'play') text(g, si === 0 ? 'Tap the glowing star to start' : 'Tap the glowing star next', w / 2, api.safe.top + 22, 22, '#fdf8ff');
    else { let fs = 30; g.font = `800 ${fs}px ${FD}`; while (fs > 18 && g.measureText(C.name).width > w - 32) { fs--; g.font = `800 ${fs}px ${FD}`; } text(g, C.name, w / 2, api.safe.top + 22, fs, '#ffd166'); }
    P.draw(g); F.draw(g, w);
  }
  function nearestStar(x, y) {
    let k = -1, bd = 1e9;
    stars.forEach((s, i) => { const d = Math.hypot(s.sx - x, s.sy - y); if (d < bd) { bd = d; k = i; } });
    const st = steps[si];
    if (st) { const s = stars[st.star]; if (Math.hypot(s.sx - x, s.sy - y) < 44) return st.star; }
    return bd < 36 ? k : -1;
  }
  next();
  return {
    resize, update, draw,
    down(x, y) { if (phase !== 'play') return; const k = nearestStar(x, y); if (k >= 0) tapStar(k); },
    move() {}, up() {},
    key(k, down) { if (down && phase === 'play' && (k === ' ' || k === 'Enter')) { const st = steps[si]; if (st) tapStar(st.star); return true; } return false; },
  };
}

/* ======================================================================
   GAME 5: SPACE MEMORY
   ====================================================================== */
const FACES = [
  { id: 'joules', name: 'Joules' }, { id: 'maggie', name: 'Maggie' }, { id: 'earth', name: 'Earth' }, { id: 'saturn', name: 'Saturn' },
  { id: 'rocket', name: 'My rocket' }, { id: 'astro', name: 'Leo' }, { id: 'comet', name: 'Comet' }, { id: 'pluto', name: 'Pluto' },
  { id: 'moon', name: 'Moon' }, { id: 'hole', name: 'Black hole' },
];
function drawFace(g, id, x, y, s, T, spr) {
  if (id === 'joules' || id === 'maggie') drawDog(g, x, y, s, id);
  else if (id === 'earth') drawPlanet(g, 'earth', x, y, s * 0.36, true);
  else if (id === 'saturn') drawPlanet(g, 'saturn', x, y, s * 0.24, true);
  else if (id === 'rocket') drawRocket(g, spr, x, y, s * 0.82, 0.25, T, true);
  else if (id === 'astro') drawAstronaut(g, x, y - s * 0.08, s);
  else if (id === 'comet') drawComet(g, x, y, s, T);
  else if (id === 'pluto') drawPluto(g, x, y, s * 0.34, T, false);
  else if (id === 'moon') drawMoon(g, x, y, s * 0.34, true);
  else if (id === 'hole') drawBlackHole(g, x, y, s, T);
}
function createMemory(api, opt) {
  const P = api.parts, F = api.floats, spr = api.rocket;
  const n = (opt && opt.n) || 12, pairs = n / 2;
  const others = shuffle(FACES.slice(2)).slice(0, pairs - 2);
  const faces = [FACES[0], FACES[1]].concat(others);
  const deck = shuffle(faces.concat(faces)).map((f) => ({ f, up: false, matched: false, k: 0, x: 0, y: 0, glow: 0 }));
  let W = 0, H = 0, lay = null, open = [], wait = 0, moves = 0, found = 0, t = 0, done = false, doneT = 0, ended = false, cur = 0, lastHud = '', lastSay = -99;
  function hud(force) { const k = moves + '|' + found + '|' + Math.floor(t); if (force || k !== lastHud) { lastHud = k; api.hud({ score: moves, label: 'Moves', time: Math.floor(t), extra: `Pairs ${found}/${pairs}` }); } }
  function layout() {
    const s = api.safe, L = s.left + 12, R = W - s.right - 12, T0 = s.top + 6, B = H - s.bottom - 12;
    const aw = R - L, ah = B - T0; let best = null;
    for (const cols of [2, 3, 4, 5, 6, 8]) {
      if (n % cols) continue; const rows = n / cols, gap = clamp(Math.min(aw, ah) * 0.018, 6, 16);
      const cw = (aw - gap * (cols - 1)) / cols, ch = (ah - gap * (rows - 1)) / rows;
      const w = Math.min(cw, ch * 0.8), h = Math.min(ch, w / 0.8 * 1.0);
      if (!best || w * h > best.w * best.h) best = { cols, rows, w, h, gap };
    }
    const tw = best.cols * best.w + (best.cols - 1) * best.gap, th = best.rows * best.h + (best.rows - 1) * best.gap;
    const ox = L + (aw - tw) / 2, oy = T0 + (ah - th) / 2;
    deck.forEach((c, i) => { c.x = ox + (i % best.cols) * (best.w + best.gap) + best.w / 2; c.y = oy + Math.floor(i / best.cols) * (best.h + best.gap) + best.h / 2; });
    lay = best;
  }
  function resize(w, h) { W = w; H = h; layout(); }
  function flipBack() { for (const i of open) deck[i].up = false; open = []; wait = 0; }
  function tap(i) {
    const c = deck[i]; if (!c || c.up || c.matched || done) return;
    if (open.length === 2) { if (wait > 0) flipBack(); else return; }
    c.up = true; open.push(i); sfx('whoosh');
    if (open.length === 2) {
      moves++;
      const [a, b] = open.map((j) => deck[j]);
      if (a.f.id === b.f.id) {
        const pairOpen = open.slice(); open = [];
        setTimeoutish(0.35, () => {
          for (const j of pairOpen) { deck[j].matched = true; deck[j].glow = 1; P.burst(deck[j].x, deck[j].y, 14, ['#ffd166', '#5fe0c8', '#ff6fa8', '#fff'], { g: 60 }); }
          found++; sfx('chime');
          F.add(deck[pairOpen[0]].x, deck[pairOpen[0]].y - lay.h * 0.3, pick(['A match!', 'Yes!', 'Brilliant!', 'Found it!']), '#5fe0c8', 26, 1);
          if (a.f.id === 'joules' || a.f.id === 'maggie') { sfx('bark'); if (t - lastSay > 3) { lastSay = t; say(a.f.id, 'Woof woof!'); } }
          else if (found === Math.ceil(pairs / 2) && t - lastSay > 5) { lastSay = t; say('oda', 'You are so good at this, Harper!'); }
          if (found >= pairs) { done = true; doneT = 0; sfx('happy'); say('mum', 'You found them all! Brilliant memory!'); }
          hud(true);
        });
      } else wait = 1.0;
    }
    hud(true);
  }
  const timers = [];
  function setTimeoutish(d, fn) { timers.push({ d, fn }); }
  function update(dt, T) {
    P.update(dt); F.update(dt);
    for (let i = timers.length - 1; i >= 0; i--) { timers[i].d -= dt; if (timers[i].d <= 0) { const f = timers[i].fn; timers.splice(i, 1); f(); } }
    if (wait > 0) { wait -= dt; if (wait <= 0) flipBack(); }
    for (const c of deck) { const tg = c.up || c.matched ? 1 : 0; c.k += clamp(tg - c.k, -dt * 5, dt * 5); c.glow = Math.max(0, c.glow - dt * 0.8); }
    if (!done) { t += dt; hud(); }
    else {
      doneT += dt;
      if (doneT > 1.4 && !ended) {
        ended = true;
        const score = Math.max(pairs * 8, pairs * 25 - Math.max(0, moves - pairs) * 3);
        api.end(score, { max: pairs * 25, lines: [`${pairs} pairs in ${moves} moves`, `Time: ${Math.floor(t)} seconds`] });
      }
    }
  }
  function draw(g, w, h, T) {
    api.sky.update(0.016, 6, h);
    api.sky.draw(g, w, h, T, { deco: false });
    if (!lay) return;
    const cw = lay.w, ch = lay.h, rad = cw * 0.12;
    deck.forEach((c, i) => {
      const sx = Math.max(0.03, Math.abs(Math.cos(c.k * Math.PI)));
      const face = c.k > 0.5;
      const bob = c.matched ? Math.sin(T * 3 + i) * 2 : 0;
      g.save(); g.translate(c.x, c.y + bob); g.scale(sx, 1);
      if (c.glow > 0 || c.matched) { g.shadowColor = 'rgba(255,209,102,.8)'; g.shadowBlur = 8 + 18 * c.glow; }
      rr(g, -cw / 2, -ch / 2, cw, ch, rad);
      if (face) {
        const gr = g.createLinearGradient(0, -ch / 2, 0, ch / 2); gr.addColorStop(0, '#2e2780'); gr.addColorStop(1, '#1b1550');
        g.fillStyle = gr; g.fill(); g.shadowBlur = 0;
        g.lineWidth = 3; g.strokeStyle = c.matched ? '#ffd166' : 'rgba(255,255,255,.4)'; g.stroke();
        const ps = Math.min(cw, ch * 0.78);
        g.save(); rr(g, -cw / 2, -ch / 2, cw, ch, rad); g.clip();
        drawFace(g, c.f.id, 0, -ch * 0.09, ps * 0.92, T, spr);
        g.restore();
        let fs = 18; g.font = `700 ${fs}px ${FB}`;
        while (fs > 12 && g.measureText(c.f.name).width > cw - 10) { fs--; g.font = `700 ${fs}px ${FB}`; }
        text(g, c.f.name, 0, ch / 2 - fs * 0.85, fs, '#fdf8ff', 'center', { font: FB, weight: 700 });
      } else {
        const gr = g.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2); gr.addColorStop(0, '#ff7a45'); gr.addColorStop(1, '#ff6fa8');
        g.fillStyle = gr; g.fill(); g.shadowBlur = 0;
        g.lineWidth = 3; g.strokeStyle = '#fff3e8'; g.stroke();
        g.save(); rr(g, -cw / 2 + 7, -ch / 2 + 7, cw - 14, ch - 14, rad * 0.7); g.clip();
        g.fillStyle = 'rgba(255,255,255,.18)';
        for (let k = 0; k < 6; k++) { starPath(g, -cw / 2 + ((k * 37) % 100) / 100 * cw, -ch / 2 + ((k * 53 + 20) % 100) / 100 * ch, cw * 0.06, cw * 0.025, 4, 0); g.fill(); }
        g.restore();
        drawCuteStar(g, 0, 0, Math.min(cw, ch) * 0.2, 0, true);
      }
      if (api.keyboard && i === cur && !done) { g.lineWidth = 4; g.strokeStyle = '#5fe0c8'; rr(g, -cw / 2 - 5, -ch / 2 - 5, cw + 10, ch + 10, rad + 4); g.stroke(); }
      g.restore();
    });
    P.draw(g); F.draw(g, w);
  }
  hud(true);
  return {
    resize, update, draw,
    down(x, y) {
      if (!lay) return;
      const i = deck.findIndex((c) => Math.abs(x - c.x) < lay.w / 2 + lay.gap / 2 && Math.abs(y - c.y) < lay.h / 2 + lay.gap / 2);
      if (i >= 0) { cur = i; tap(i); }
    },
    move() {}, up() {},
    key(k, down) {
      if (!down || !lay) return false;
      const cols = lay.cols;
      if (k === 'ArrowRight') cur = (cur + 1) % n; else if (k === 'ArrowLeft') cur = (cur - 1 + n) % n;
      else if (k === 'ArrowDown') cur = (cur + cols) % n; else if (k === 'ArrowUp') cur = (cur - cols + n) % n;
      else if (k === 'Enter' || k === ' ') tap(cur);
      else return false;
      return true;
    },
  };
}

/* ---------------- extra art for the new games ---------------- */
function drawLander(g, x, y, s, T, flame, tilt, alpha) {
  g.save(); g.translate(x, y); g.rotate(tilt || 0);
  if (alpha != null) g.globalAlpha = alpha;
  g.lineJoin = 'round'; g.lineCap = 'round';
  const lw = Math.max(2, s * 0.045);
  if (flame) drawFlame(g, 0, s * 0.33, s * 0.24, s * 0.46 * flame, T);
  // legs
  g.strokeStyle = '#2a1f5c'; g.lineWidth = Math.max(3, s * 0.08);
  g.beginPath(); g.moveTo(-s * 0.2, s * 0.14); g.lineTo(-s * 0.42, s * 0.47); g.moveTo(s * 0.2, s * 0.14); g.lineTo(s * 0.42, s * 0.47); g.stroke();
  g.strokeStyle = '#c4c1d6'; g.lineWidth = Math.max(1.5, s * 0.035); g.stroke();
  g.fillStyle = '#ffd166'; g.strokeStyle = '#2a1f5c'; g.lineWidth = lw;
  for (const sd of [-1, 1]) { rr(g, sd * s * 0.42 - s * 0.11, s * 0.44, s * 0.22, s * 0.07, s * 0.035); g.fill(); g.stroke(); }
  // nozzle
  g.fillStyle = '#7d7a99';
  g.beginPath(); g.moveTo(-s * 0.09, s * 0.18); g.lineTo(s * 0.09, s * 0.18); g.lineTo(s * 0.13, s * 0.34); g.lineTo(-s * 0.13, s * 0.34); g.closePath(); g.fill(); g.stroke();
  // dome
  const dg = g.createLinearGradient(0, -s * 0.38, 0, -s * 0.1); dg.addColorStop(0, '#ffb084'); dg.addColorStop(1, '#ff7a45');
  g.beginPath(); g.arc(0, -s * 0.1, s * 0.27, Math.PI, TAU); g.closePath(); g.fillStyle = dg; g.fill(); g.stroke();
  const wg = g.createRadialGradient(-s * 0.03, -s * 0.24, 1, 0, -s * 0.21, s * 0.11); wg.addColorStop(0, '#d8fff7'); wg.addColorStop(1, '#2fb8a3');
  circle(g, 0, -s * 0.21, s * 0.1); g.fillStyle = wg; g.fill(); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = Math.max(1.2, s * 0.025); g.beginPath(); g.arc(0, -s * 0.21, s * 0.06, Math.PI * 1.1, Math.PI * 1.5); g.stroke();
  // antenna
  g.strokeStyle = '#2a1f5c'; g.lineWidth = Math.max(1.5, s * 0.03);
  g.beginPath(); g.moveTo(s * 0.16, -s * 0.31); g.lineTo(s * 0.24, -s * 0.46); g.stroke();
  circle(g, s * 0.24, -s * 0.48, s * 0.045); g.fillStyle = '#ff6fa8'; g.fill(); g.lineWidth = lw * 0.7; g.stroke();
  // body
  const gr = g.createLinearGradient(-s * 0.32, 0, s * 0.32, 0);
  gr.addColorStop(0, '#d9d2ff'); gr.addColorStop(0.45, '#ffffff'); gr.addColorStop(1, '#cfc6ff');
  rr(g, -s * 0.32, -s * 0.12, s * 0.64, s * 0.32, s * 0.1); g.fillStyle = gr; g.fill();
  g.save(); rr(g, -s * 0.32, -s * 0.12, s * 0.64, s * 0.32, s * 0.1); g.clip(); g.fillStyle = '#ff6fa8'; g.fillRect(-s * 0.4, s * 0.13, s * 0.8, s * 0.08); g.restore();
  rr(g, -s * 0.32, -s * 0.12, s * 0.64, s * 0.32, s * 0.1); g.strokeStyle = '#2a1f5c'; g.lineWidth = lw; g.stroke();
  cuteFace(g, 0, s * 0.02, s * 0.2);
  g.restore();
}
function drawPad(g, l, r, y, T) {
  const w = r - l, hh = clamp(w * 0.08, 6, 11), cx = (l + r) / 2;
  g.save();
  const gh = Math.min(46, w * 0.35);
  const gl = g.createLinearGradient(0, y - gh, 0, y);
  gl.addColorStop(0, 'rgba(95,224,200,0)'); gl.addColorStop(1, 'rgba(95,224,200,.35)');
  g.fillStyle = gl; g.fillRect(l, y - gh, w, gh);
  rr(g, l, y - hh * 0.3, w, hh, hh * 0.4); g.fillStyle = '#c9c3f0'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#2a1f5c'; g.stroke();
  rr(g, l + 3, y - hh * 0.3 + 2, w - 6, hh * 0.32, 2); g.fillStyle = '#5fe0c8'; g.fill();
  g.fillStyle = '#ffd166'; g.beginPath(); g.moveTo(cx - hh * 0.8, y + hh * 0.66); g.lineTo(cx, y + hh * 0.14); g.lineTo(cx + hh * 0.8, y + hh * 0.66); g.closePath(); g.fill();
  const on = Math.sin((T || 0) * 6) > 0;
  for (const [px, c] of [[l, '#ff6fa8'], [r, '#ffd166']]) {
    g.globalAlpha = on ? 1 : 0.45; circle(g, px, y - hh * 0.2, hh * 0.6); g.fillStyle = c; g.fill();
    g.globalAlpha = 1; g.lineWidth = 1.5; g.strokeStyle = '#2a1f5c'; g.stroke();
  }
  g.restore();
}
function moonGround(g, pts, w, h, top) {
  g.beginPath(); g.moveTo(0, h + 2);
  for (const p of pts) g.lineTo(p[0], p[1]);
  g.lineTo(w, h + 2); g.closePath();
  const gr = g.createLinearGradient(0, top, 0, h); gr.addColorStop(0, '#e4e1f2'); gr.addColorStop(1, '#8f8aab');
  g.fillStyle = gr; g.fill();
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
  g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = '#3d3a5c'; g.stroke();
}
const ALIEN_PALS = [['#c8ffb0', '#4fd36a', '#1d5c35'], ['#c8fff6', '#2fb8a3', '#14544a'], ['#e9dcff', '#8f6bff', '#3a2a8a'], ['#ffd6e6', '#ff6fa8', '#8a2050']];
const GOLD_PAL = ['#fff6c8', '#f6a623', '#8a5200'];
function drawAlien(g, x, y, s, pal, eyes, T, gold) {
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  const lw = Math.max(1.5, s * 0.035), tt = T || 0;
  const wob = Math.sin(tt * 5 + x * 0.05) * s * 0.04;
  g.strokeStyle = pal[2]; g.lineWidth = Math.max(1.5, s * 0.04);
  for (const sd of [-1, 1]) {
    g.beginPath(); g.moveTo(x + sd * s * 0.14, y - s * 0.38); g.quadraticCurveTo(x + sd * s * 0.2, y - s * 0.52, x + sd * s * 0.26 + wob, y - s * 0.6); g.stroke();
    circle(g, x + sd * s * 0.26 + wob, y - s * 0.62, s * 0.065); g.fillStyle = gold ? '#ff6fa8' : '#ffd166'; g.fill(); g.lineWidth = lw * 0.8; g.stroke(); g.lineWidth = Math.max(1.5, s * 0.04);
  }
  const wave = Math.sin(tt * 9 + y * 0.03) * 0.5;
  g.fillStyle = pal[1]; g.lineWidth = lw;
  for (const sd of [-1, 1]) { ell(g, x + sd * s * 0.4, y + s * 0.06, s * 0.08, s * 0.17, sd * 0.6 + (sd > 0 ? wave : 0)); g.fill(); g.stroke(); }
  if (gold) { g.shadowColor = 'rgba(255,209,102,.9)'; g.shadowBlur = s * 0.35; }
  const gr = g.createRadialGradient(x - s * 0.15, y - s * 0.2, s * 0.05, x, y, s * 0.55);
  gr.addColorStop(0, pal[0]); gr.addColorStop(1, pal[1]);
  g.beginPath(); g.moveTo(x - s * 0.38, y + s * 0.4);
  g.bezierCurveTo(x - s * 0.44, y - s * 0.1, x - s * 0.3, y - s * 0.46, x, y - s * 0.46);
  g.bezierCurveTo(x + s * 0.3, y - s * 0.46, x + s * 0.44, y - s * 0.1, x + s * 0.38, y + s * 0.4);
  g.quadraticCurveTo(x, y + s * 0.5, x - s * 0.38, y + s * 0.4); g.closePath();
  g.fillStyle = gr; g.fill(); g.shadowBlur = 0; g.strokeStyle = pal[2]; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; circle(g, x - s * 0.2, y + s * 0.24, s * 0.05); g.fill(); circle(g, x + s * 0.22, y + s * 0.3, s * 0.035); g.fill();
  const eye = (ex, ey, er) => {
    circle(g, ex, ey, er); g.fillStyle = '#fff'; g.fill(); g.lineWidth = Math.max(1, lw * 0.8); g.strokeStyle = pal[2]; g.stroke();
    circle(g, ex + er * 0.12, ey + er * 0.1, er * 0.52); g.fillStyle = '#2b1a3d'; g.fill();
    circle(g, ex + er * 0.3, ey - er * 0.18, er * 0.18); g.fillStyle = '#fff'; g.fill();
  };
  if (eyes === 1) eye(x, y - s * 0.13, s * 0.15);
  else if (eyes === 3) { eye(x - s * 0.16, y - s * 0.1, s * 0.075); eye(x, y - s * 0.2, s * 0.08); eye(x + s * 0.16, y - s * 0.1, s * 0.075); }
  else { eye(x - s * 0.13, y - s * 0.12, s * 0.095); eye(x + s * 0.13, y - s * 0.12, s * 0.095); }
  g.strokeStyle = '#2b1a3d'; g.lineWidth = Math.max(1.2, s * 0.03);
  g.beginPath(); g.arc(x, y + s * 0.07, s * 0.1, 0.25, Math.PI - 0.25); g.stroke();
  g.fillStyle = 'rgba(255,111,168,.4)'; circle(g, x - s * 0.25, y + s * 0.07, s * 0.05); g.fill(); circle(g, x + s * 0.25, y + s * 0.07, s * 0.05); g.fill();
  if (gold) {
    g.fillStyle = '#ffd166'; g.strokeStyle = '#8a5200'; g.lineWidth = lw;
    g.beginPath(); g.moveTo(x - s * 0.17, y - s * 0.42); g.lineTo(x - s * 0.18, y - s * 0.58); g.lineTo(x - s * 0.08, y - s * 0.5); g.lineTo(x, y - s * 0.63); g.lineTo(x + s * 0.08, y - s * 0.5); g.lineTo(x + s * 0.18, y - s * 0.58); g.lineTo(x + s * 0.17, y - s * 0.42); g.closePath(); g.fill(); g.stroke();
    circle(g, x, y - s * 0.48, s * 0.03); g.fillStyle = '#ff6fa8'; g.fill();
    g.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { const a = tt * 2 + i * 2.1; starPath(g, x + Math.cos(a) * s * 0.55, y + Math.sin(a) * s * 0.35 - s * 0.1, s * 0.07, s * 0.025, 4, 0); g.fill(); }
  }
  g.restore();
}
function drawBone(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  const shapes = () => {
    const out = [];
    out.push(() => rr(g, -s * 0.32, -s * 0.09, s * 0.64, s * 0.18, s * 0.06));
    for (const a of [-1, 1]) for (const b of [-1, 1]) out.push(() => circle(g, a * s * 0.34, b * s * 0.1, s * 0.12));
    return out;
  };
  const sh = shapes();
  g.strokeStyle = '#8a5a3a'; g.lineWidth = Math.max(3, s * 0.1); g.lineJoin = 'round';
  for (const f of sh) { f(); g.stroke(); }
  g.fillStyle = '#fff6e8';
  for (const f of sh) { f(); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.8)'; rr(g, -s * 0.24, -s * 0.06, s * 0.3, s * 0.04, s * 0.02); g.fill();
  g.restore();
}
function drawJetDog(g, x, y, s, T, flame, tilt, alpha, who) {
  const brown = '#7b3f1f', tt = T || 0;
  g.save(); g.translate(x, y); g.rotate(tilt || 0);
  if (alpha != null) g.globalAlpha = alpha;
  g.lineJoin = 'round'; g.lineCap = 'round';
  const lw = Math.max(1.5, s * 0.03);
  if (flame) drawFlame(g, -s * 0.43, s * 0.46, s * 0.17, s * 0.5 * flame, tt);
  // tail
  g.strokeStyle = brown; g.lineWidth = Math.max(3, s * 0.08);
  g.beginPath(); g.moveTo(-s * 0.36, s * 0.38); g.quadraticCurveTo(-s * 0.56, s * 0.36, -s * 0.66, s * 0.26 + Math.sin(tt * 16) * s * 0.07); g.stroke();
  // jetpack
  const jg = g.createLinearGradient(-s * 0.56, 0, -s * 0.3, 0); jg.addColorStop(0, '#ff9a6a'); jg.addColorStop(1, '#d9532a');
  rr(g, -s * 0.54, -s * 0.02, s * 0.22, s * 0.44, s * 0.08); g.fillStyle = jg; g.fill(); g.strokeStyle = '#2a1f5c'; g.lineWidth = lw; g.stroke();
  g.fillStyle = '#ffd166'; rr(g, -s * 0.54, s * 0.12, s * 0.22, s * 0.06, 2); g.fill();
  g.fillStyle = '#7d7a99'; rr(g, -s * 0.5, s * 0.4, s * 0.14, s * 0.07, 2); g.fill(); g.stroke();
  // back paws
  g.fillStyle = '#fffaf2'; g.strokeStyle = '#3a1c0c';
  ell(g, -s * 0.3, s * 0.58, s * 0.1, s * 0.06, 0.3); g.fill(); g.stroke();
  // body
  ell(g, -s * 0.1, s * 0.42, s * 0.34, s * 0.19); g.fill(); g.stroke();
  g.save(); ell(g, -s * 0.1, s * 0.42, s * 0.34, s * 0.19); g.clip();
  g.fillStyle = brown; ell(g, -s * 0.22, s * 0.32, s * 0.15, s * 0.1); g.fill(); ell(g, s * 0.06, s * 0.5, s * 0.08, s * 0.06); g.fill();
  g.restore();
  // harness strap
  g.strokeStyle = who === 'maggie' ? '#a66bff' : '#ff6fa8'; g.lineWidth = Math.max(2, s * 0.045);
  g.beginPath(); g.moveTo(-s * 0.34, s * 0.3); g.quadraticCurveTo(-s * 0.15, s * 0.4, -s * 0.04, s * 0.27); g.stroke();
  // front paws stretched forward
  g.fillStyle = '#fffaf2'; g.strokeStyle = '#3a1c0c'; g.lineWidth = lw;
  ell(g, s * 0.26, s * 0.52, s * 0.12, s * 0.06, -0.15); g.fill(); g.stroke();
  drawDog(g, s * 0.06, -s * 0.05, s * 0.82, who || 'joules');
  g.restore();
}
function drawMeteor(g, m, T) {
  const sp = Math.hypot(m.vx, m.vy) || 1, dx = m.vx / sp, dy = m.vy / sp;
  const big = m.kind === 'big', r = m.r, len = r * 3.4;
  g.save(); g.translate(m.x, m.y); g.rotate(Math.atan2(dy, dx));
  const tg = g.createLinearGradient(0, 0, -len, 0);
  tg.addColorStop(0, big ? 'rgba(255,111,168,.85)' : 'rgba(255,154,90,.85)'); tg.addColorStop(1, 'rgba(255,111,168,0)');
  g.fillStyle = tg; g.beginPath(); g.moveTo(r * 0.2, -r * 0.92); g.quadraticCurveTo(-len * 0.5, -r * 0.5, -len, 0); g.quadraticCurveTo(-len * 0.5, r * 0.5, r * 0.2, r * 0.92); g.closePath(); g.fill();
  const tg2 = g.createLinearGradient(0, 0, -len * 0.6, 0); tg2.addColorStop(0, 'rgba(255,243,176,.9)'); tg2.addColorStop(1, 'rgba(255,209,102,0)');
  g.fillStyle = tg2; g.beginPath(); g.moveTo(0, -r * 0.5); g.quadraticCurveTo(-len * 0.3, -r * 0.2, -len * 0.6, 0); g.quadraticCurveTo(-len * 0.3, r * 0.2, 0, r * 0.5); g.closePath(); g.fill();
  g.restore();
  const gl = g.createRadialGradient(m.x, m.y, r * 0.6, m.x, m.y, r * 1.6);
  gl.addColorStop(0, big ? 'rgba(255,111,168,.45)' : 'rgba(255,179,71,.4)'); gl.addColorStop(1, 'rgba(255,150,60,0)');
  circle(g, m.x, m.y, r * 1.6); g.fillStyle = gl; g.fill();
  drawRock(g, m.rock, m.x, m.y, m.rot, r);
  if (big) {
    g.save(); g.setLineDash([r * 0.35, r * 0.25]); g.lineDashOffset = -(T || 0) * 30;
    g.strokeStyle = '#ff6fa8'; g.lineWidth = Math.max(2.5, r * 0.1); circle(g, m.x, m.y, r * 1.18); g.stroke();
    g.restore();
    g.strokeStyle = '#ffd166'; g.lineWidth = Math.max(2, r * 0.08); g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(m.x - r * 0.1, m.y - r * 0.55); g.lineTo(m.x + r * 0.08, m.y - r * 0.15); g.lineTo(m.x - r * 0.1, m.y + r * 0.15); g.lineTo(m.x + r * 0.05, m.y + r * 0.5); g.stroke();
  }
}
function drawShieldOrb(g, x, y, s, T) {
  const tt = T || 0, r = s * 0.5;
  g.save();
  const gl = g.createRadialGradient(x, y, r * 0.6, x, y, r * 1.6);
  gl.addColorStop(0, 'rgba(95,224,200,.5)'); gl.addColorStop(1, 'rgba(95,224,200,0)');
  circle(g, x, y, r * 1.6); g.fillStyle = gl; g.fill();
  const bg = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  bg.addColorStop(0, '#e8fffb'); bg.addColorStop(0.6, 'rgba(143,240,224,.75)'); bg.addColorStop(1, 'rgba(47,184,163,.85)');
  circle(g, x, y, r); g.fillStyle = bg; g.fill(); g.lineWidth = Math.max(2, r * 0.08); g.strokeStyle = '#ffffff'; g.stroke();
  const k = r * 0.55;
  g.beginPath(); g.moveTo(x, y - k); g.quadraticCurveTo(x + k * 0.5, y - k * 0.75, x + k * 0.85, y - k * 0.8);
  g.quadraticCurveTo(x + k * 0.9, y + k * 0.45, x, y + k); g.quadraticCurveTo(x - k * 0.9, y + k * 0.45, x - k * 0.85, y - k * 0.8);
  g.quadraticCurveTo(x - k * 0.5, y - k * 0.75, x, y - k); g.closePath();
  g.fillStyle = '#ff6fa8'; g.fill(); g.lineWidth = Math.max(1.5, r * 0.06); g.strokeStyle = '#fff'; g.stroke();
  starPath(g, x, y - k * 0.05, k * 0.42, k * 0.17, 5, 0); g.fillStyle = '#ffd166'; g.fill();
  g.fillStyle = '#fff'; starPath(g, x + Math.cos(tt * 3) * r * 0.75, y + Math.sin(tt * 3) * r * 0.75, r * 0.16, r * 0.06, 4, 0); g.fill();
  g.restore();
}
function drawHouse(g, x, y, hs) {
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = '#2a1f5c'; g.lineWidth = Math.max(1.5, hs * 0.05);
  g.fillStyle = '#d9532a'; rr(g, x + hs * 0.18, y - hs * 0.98, hs * 0.14, hs * 0.3, hs * 0.03); g.fill(); g.stroke();
  g.fillStyle = '#fff3e2'; rr(g, x - hs * 0.42, y - hs * 0.6, hs * 0.84, hs * 0.62, hs * 0.06); g.fill(); g.stroke();
  g.fillStyle = '#ff6fa8'; g.beginPath(); g.moveTo(x - hs * 0.56, y - hs * 0.55); g.lineTo(x, y - hs * 1.06); g.lineTo(x + hs * 0.56, y - hs * 0.55); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#7b3f1f'; rr(g, x - hs * 0.09, y - hs * 0.32, hs * 0.18, hs * 0.34, hs * 0.08); g.fill(); g.stroke();
  for (const sd of [-1, 1]) { g.fillStyle = '#ffd166'; rr(g, x + sd * hs * 0.26 - hs * 0.09, y - hs * 0.48, hs * 0.18, hs * 0.16, hs * 0.03); g.fill(); g.stroke(); }
  circle(g, x, y - hs * 0.74, hs * 0.08); g.fillStyle = '#5fe0c8'; g.fill(); g.stroke();
  starPath(g, x, y - hs * 1.1, hs * 0.13, hs * 0.055, 5, 0); g.fillStyle = '#ffd166'; g.fill(); g.lineWidth = Math.max(1, hs * 0.03); g.stroke();
  g.restore();
}
function drawHomePlanet(g, cx, cy, R) {
  g.save();
  drawBall(g, cx, cy, R, '#c8ffd8', '#2f9e6a');
  g.save(); circle(g, cx, cy, R); g.clip();
  g.fillStyle = 'rgba(143,211,255,.9)';
  ell(g, cx - R * 0.48, cy + R * 0.42, R * 0.24, R * 0.12, 0.2); g.fill();
  ell(g, cx + R * 0.55, cy - R * 0.05, R * 0.16, R * 0.1, -0.3); g.fill();
  g.fillStyle = 'rgba(29,92,53,.25)'; ell(g, cx + R * 0.3, cy + R * 0.62, R * 0.3, R * 0.14); g.fill();
  g.restore();
  shade(g, cx, cy, R);
  circle(g, cx, cy, R); g.lineWidth = Math.max(2, R * 0.04); g.strokeStyle = '#1a1446'; g.stroke();
  cuteFace(g, cx, cy + R * 0.3, R * 0.5);
  const a = -Math.PI / 2 - 0.75, tx = cx + Math.cos(a) * R * 0.97, ty = cy + Math.sin(a) * R * 0.97, ts = R * 0.32;
  g.save(); g.translate(tx, ty); g.rotate(a + Math.PI / 2);
  g.strokeStyle = '#2a1f5c'; g.lineWidth = Math.max(1.5, ts * 0.08);
  g.fillStyle = '#7b3f1f'; rr(g, -ts * 0.09, -ts * 0.55, ts * 0.18, ts * 0.6, ts * 0.05); g.fill(); g.stroke();
  circle(g, 0, -ts * 0.75, ts * 0.36); g.fillStyle = '#4fd36a'; g.fill(); g.stroke();
  g.fillStyle = '#ff6fa8'; circle(g, -ts * 0.12, -ts * 0.82, ts * 0.06); g.fill(); circle(g, ts * 0.14, -ts * 0.66, ts * 0.06); g.fill();
  g.restore();
  drawHouse(g, cx, cy - R * 0.97, R * 0.5);
  g.restore();
}
function drawCraterHole(g, x, y, r) {
  const ry = r * 0.42;
  ell(g, x, y + ry * 0.12, r * 1.22, ry * 1.6); g.fillStyle = '#cdc8e3'; g.fill();
  g.lineWidth = 2; g.strokeStyle = 'rgba(61,58,92,.3)'; g.stroke();
  const hg = g.createLinearGradient(0, y - ry, 0, y + ry); hg.addColorStop(0, '#221d48'); hg.addColorStop(1, '#4a4575');
  ell(g, x, y, r, ry); g.fillStyle = hg; g.fill();
}
function drawCraterLip(g, x, y, r) {
  const ry = r * 0.42;
  g.beginPath(); g.ellipse(x, y, r, ry, 0, 0.08, Math.PI - 0.08);
  g.lineCap = 'round'; g.lineWidth = Math.max(3, r * 0.12); g.strokeStyle = '#e4e1f2'; g.stroke();
}

/* ======================================================================
   GAME 6: MOON LANDER
   ====================================================================== */
function createLander(api) {
  const P = api.parts, F = api.floats;
  const ROUNDS = 3, PADW = [0.24, 0.16, 0.11], BUMP = [0.07, 0.11, 0.16];
  const LAND = [['leo', 'The Eagle has landed! Well, the Harper has.'], ['mum', 'Gentle as a feather, Harper!'], ['oda', 'Can I walk on the Moon now?'], ['dad', 'Textbook landing!'], ['maggie', 'Woof!']];
  const CRASH = [['dad', 'Bumpy! Everyone is fine. Try a softer one!'], ['leo', 'Tip: hold the thruster early to slow right down.'], ['oda', 'Bonk! That was funny!']];
  let W = 0, H = 0, sc = 1, lh = 60, g0 = 50, thr = 130, sideA = 70, safeV = 72, safeH = 50;
  let round = -1, phase = 'ready', phT = 0, x = 0, y = 0, sy = 0, vx = 0, vy = 0, fuel = 100, tilt = 0, crashTilt = 0, side = 0, thrusting = false;
  let terrN = [], padN = null, gp = [], padPx = null, deco = [], total = 0, tx = null, keyL = false, keyR = false, keyUp = false;
  let done = false, doneT = 0, ended = false, lastHud = '', fuelWarned = false, landI = 0, crashI = 0, slowT = 0;
  const holds = new Set(), results = [];
  function newRound() {
    round++; phase = 'ready'; phT = 0; fuel = 100; fuelWarned = false; vx = 0; vy = 0; tilt = 0; side = 0; thrusting = false;
    const pw = PADW[round], A = BUMP[round];
    const pc = rand(0.16 + pw / 2, 0.84 - pw / 2);
    const ph1 = rand(0, TAU), ph2 = rand(0, TAU), ph3 = rand(0, TAU), hi = 0.12 + round * 0.1;
    terrN = [];
    const N = 28;
    for (let i = 0; i <= N; i++) {
      const fx = i / N;
      const n = 0.5 + 0.32 * Math.sin(fx * 7 + ph1) + hi * Math.sin(fx * 19 + ph2) + 0.06 * Math.sin(fx * 37 + ph3);
      terrN.push([fx, 0.86 - A * clamp(n, 0, 1.15) + rand(-0.006, 0.006)]);
    }
    padN = { l: pc - pw / 2, r: pc + pw / 2, y: 0.86 - A * (round === 2 ? rand(0.6, 0.95) : rand(0.25, 0.6)) };
    for (const p of terrN) { const dd = p[0] < padN.l ? padN.l - p[0] : p[0] - padN.r; if (dd < 0.09) p[1] = lerp(padN.y + 0.004, p[1], clamp(dd / 0.09, 0, 1)); }
    deco = Array.from({ length: 7 }, () => ({ x: Math.random(), d: rand(0.03, 0.1), s: rand(0.6, 1.3) }));
    const mb = meterBox(), xl = mb.px + mb.pw + lh * 0.6;
    x = pc > 0.5 ? Math.max(xl, rand(0.12, 0.25) * W) : Math.min(W - lh, rand(0.75, 0.88) * W); vx = (pc > 0.5 ? 1 : -1) * rand(8, 22) * sc;
    layout();
    sy = y = api.safe.top + lh * 0.9;
    hud(true);
  }
  function layout() {
    if (!padN) return;
    const minW = lh * 1.7;
    let pl = padN.l * W, pr = padN.r * W;
    if (pr - pl < minW) { const c = (pl + pr) / 2; pl = c - minW / 2; pr = c + minW / 2; }
    const py = padN.y * H;
    gp = terrN.filter((p) => p[0] * W < pl - 6 || p[0] * W > pr + 6).map((p) => [p[0] * W, p[1] * H]);
    gp.push([pl, py], [pr, py]); gp.sort((a, b) => a[0] - b[0]);
    padPx = { l: pl, r: pr, y: py, c: (pl + pr) / 2 };
  }
  function groundAt(px) {
    if (!gp.length) return H;
    if (px <= gp[0][0]) return gp[0][1];
    for (let i = 1; i < gp.length; i++) {
      const a = gp[i - 1], b = gp[i];
      if (px <= b[0]) return b[0] === a[0] ? Math.min(a[1], b[1]) : lerp(a[1], b[1], (px - a[0]) / (b[0] - a[0]));
    }
    return gp[gp.length - 1][1];
  }
  function resize(w, h) {
    if (W && (w !== W || h !== H)) { x *= w / W; y *= h / H; sy *= h / H; }
    W = w; H = h; sc = clamp(h / 800, 0.75, 1.3);
    lh = clamp(Math.min(h * 0.1, w * 0.14), 44, 84);
    g0 = 50 * sc; thr = 128 * sc; sideA = 72 * sc; safeV = 74 * sc; safeH = 52 * sc;
    if (round < 0) { newRound(); F.add(w / 2, h * 0.4, fillName('Land softly, Harper!'), '#ffd166', 40, 1.6); say('leo', 'Hold to fire the thruster. Land slowly on the glowing pad!'); }
    else layout();
    if (phase === 'landed' && padPx) y = padPx.y - lh * 0.5;
  }
  function hud(force) {
    const k = total + '|' + round + '|' + Math.round(fuel / 2);
    if (force || k !== lastHud) { lastHud = k; api.hud({ score: total, meter: fuel / 100, meterLabel: 'Fuel', extra: `Landing ${Math.min(ROUNDS, round + 1)} of ${ROUNDS}` }); }
  }
  function ratio() { return Math.max(Math.max(0, vy) / safeV, Math.abs(vx) / safeH); }
  function touchdown() {
    const lx = x - lh * 0.42, rx = x + lh * 0.42;
    const onPad = lx >= padPx.l - lh * 0.14 && rx <= padPx.r + lh * 0.14;
    const rt = ratio();
    if (onPad && rt <= 1) {
      const soft = clamp(1 - rt, 0, 1), acc = clamp(1 - Math.abs(x - padPx.c) / ((padPx.r - padPx.l) / 2), 0, 1);
      const pts = 20 + Math.round(soft * 30) + Math.round((fuel / 100) * 25) + Math.round(acc * 25);
      total += pts; results.push({ ok: true, pts });
      phase = 'landed'; phT = 0; vx = vy = 0; y = padPx.y - lh * 0.5; tilt = 0; thrusting = false;
      sfx('happy');
      P.burst(x, y, 30, ['#ffd166', '#5fe0c8', '#ff6fa8', '#fff', '#b48cff'], { up: 120, g: 160, max: 280 });
      F.add(x, y - lh * 1.2, pts >= 80 ? 'Perfect landing!' : pts >= 60 ? 'Great landing!' : 'Safe landing!', '#5fe0c8', 32, 1.9);
      F.add(x, y - lh * 0.55, `+${pts}`, '#ffd166', 30, 1.7);
      const c = LAND[landI++ % LAND.length]; say(c[0], c[1]); if (c[0] === 'maggie' || c[0] === 'joules') sfx('bark');
    } else {
      total += 5; results.push({ ok: false, pts: 5 });
      phase = 'crashed'; phT = 0; crashTilt = (vx >= 0 ? 1 : -1) * 1.25; thrusting = false;
      y = Math.min(groundAt(x), groundAt(lx), groundAt(rx)) - lh * 0.3;
      sfx('oops'); sfx('thud');
      P.burst(x, y + lh * 0.2, 28, ['#e4e1f2', '#c4c1d6', '#9d9ab4', '#fff'], { stars: 0.15, g: -30, max: 170, size: 1.8, life: 1.3 });
      P.burst(x, y, 10, ['#ffd166', '#fff3b0'], { stars: 1, g: 60, max: 140 });
      F.add(x, y - lh * 1.1, 'Oops!', '#ffe3c2', 38, 1.6);
      F.add(x, y - lh * 0.5, !onPad ? 'Aim for the glowing pad' : 'A bit too fast! +5', '#ffe3c2', 22, 1.9);
      if (crashI < CRASH.length) { const c = CRASH[crashI++]; say(c[0], c[1]); }
    }
    hud(true);
  }
  function update(dt, T) {
    P.update(dt); F.update(dt); phT += dt;
    api.sky.update(dt, 5, H);
    if (done) {
      doneT += dt;
      if (doneT > 1.4 && !ended) {
        ended = true;
        const good = results.filter((r) => r.ok).length;
        api.end(total, { lines: results.map((r, i) => `Landing ${i + 1}: ${r.ok ? r.pts + ' points' : 'a bumpy one!'}`), title: good === ROUNDS ? 'Moon mission complete!' : good ? 'Moon mission done!' : 'Bumpy, but you are all safe!' });
      }
      return;
    }
    if (phase === 'ready') {
      y = sy + Math.sin(phT * 4) * 3;
      if (phT > 1.3) { phase = 'fly'; phT = 0; y = sy; }
      return;
    }
    if (phase === 'landed' || phase === 'crashed') {
      if (phase === 'landed' && Math.random() < dt * 4) P.add({ x: x + rand(-lh, lh), y: y - rand(0, lh), vx: 0, vy: -30, life: 0.8, c: pick(['#ffd166', '#5fe0c8', '#fff']), s: rand(2, 3), g: 0, star: true, spin: 3 });
      if (phT > 2.5) {
        if (round >= ROUNDS - 1) { done = true; doneT = 0; sfx('whoosh'); F.add(W / 2, H * 0.36, 'Mission complete!', '#ffd166', 42, 1.6); }
        else { newRound(); if (round === ROUNDS - 1) F.add(W / 2, H * 0.36 + 46, 'Tiny pad! Go slowly.', '#5fe0c8', 26, 1.8); }
      }
      return;
    }
    // flying
    const dir = (keyR ? 1 : 0) - (keyL ? 1 : 0);
    thrusting = (holds.size > 0 || keyUp) && fuel > 0;
    let ax = 0;
    if (fuel > 0) {
      if (dir) ax = dir * sideA;
      else if (holds.size > 0 && tx != null) ax = clamp((tx - x) * 2.6 - vx * 2.2, -sideA, sideA);
    }
    side = ax / sideA;
    vy += (g0 - (thrusting ? thr : 0)) * dt; vx += ax * dt;
    vy = clamp(vy, -200 * sc, 420 * sc);
    x += vx * dt; y += vy * dt;
    if (thrusting) fuel -= 12 * dt;
    if (Math.abs(side) > 0.05) fuel -= 3 * Math.abs(side) * dt;
    if (fuel <= 0 && !fuelWarned) { fuel = 0; fuelWarned = true; F.add(x, y - lh, 'Out of fuel!', '#ffe3c2', 26, 1.4); sfx('oops'); }
    fuel = Math.max(0, fuel);
    if (x < lh * 0.5) { x = lh * 0.5; vx = Math.abs(vx) * 0.3; }
    if (x > W - lh * 0.5) { x = W - lh * 0.5; vx = -Math.abs(vx) * 0.3; }
    const ceil = api.safe.top + lh * 0.5;
    if (y < ceil) { y = ceil; if (vy < 0) vy = 0; }
    tilt = lerp(tilt, clamp(vx / (safeH * 3) + side * 0.12, -0.35, 0.35), Math.min(1, dt * 6));
    if (thrusting && Math.random() < dt * 40) P.add({ x: x + rand(-4, 4), y: y + lh * 0.4, vx: rand(-25, 25), vy: rand(120, 200), life: rand(0.2, 0.4), c: pick(['#ffb347', '#ffd166', '#ff7a45']), s: rand(2, 4), g: 0, star: false });
    if (Math.abs(side) > 0.2 && Math.random() < dt * 25) P.add({ x: x - Math.sign(side) * lh * 0.36, y: y, vx: -Math.sign(side) * rand(60, 110), vy: rand(-15, 15), life: rand(0.25, 0.45), c: 'rgba(230,228,255,.85)', s: rand(2, 4), g: 0, star: false });
    const lx = x - lh * 0.42, rx = x + lh * 0.42, fy = y + lh * 0.5;
    const near = Math.min(groundAt(lx), groundAt(rx), groundAt(x)) - fy;
    if (near < lh * 2.2 && ratio() > 1) slowT += dt; else slowT = 0;
    if (fy >= Math.min(groundAt(lx), groundAt(rx)) || y + lh * 0.36 >= groundAt(x)) touchdown();
    hud();
  }
  function meterBox() {
    const narrow = W < 600;
    return { narrow, mw: narrow ? 18 : 24, mh: narrow ? clamp(H * 0.16, 80, 130) : clamp(H * 0.28, 110, 220), pw: narrow ? 70 : 86, px: api.safe.left + (narrow ? 8 : 12), py: api.safe.top + (narrow ? 8 : 12) };
  }
  function drawMeter(g, w, h) {
    const rt = phase === 'fly' ? ratio() : 0;
    const ok = rt <= 1;
    const m = meterBox(), mw = m.mw, mh = m.mh, pw = m.pw, px = m.px, py = m.py, mx = px + (pw - mw) / 2, my = py + 30;
    rr(g, px, py, pw, mh + 64, 18); g.fillStyle = 'rgba(30,25,84,.82)'; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.16)'; g.stroke();
    const fs = m.narrow ? 15 : 17;
    text(g, 'Speed', px + pw / 2, py + 16, fs, '#fdf8ff', 'center', { font: FB, weight: 700, outline: false });
    rr(g, mx, my, mw, mh, mw / 2); g.fillStyle = 'rgba(255,255,255,.12)'; g.fill();
    g.save(); rr(g, mx, my, mw, mh, mw / 2); g.clip();
    g.fillStyle = 'rgba(79,211,106,.25)'; g.fillRect(mx, my + mh / 2, mw, mh / 2);
    const f = clamp(rt / 2, 0, 1) * mh;
    const gr = g.createLinearGradient(0, my + mh, 0, my);
    if (ok) { gr.addColorStop(0, '#4fd36a'); gr.addColorStop(1, '#a8ff8f'); } else { gr.addColorStop(0, '#ffd166'); gr.addColorStop(1, '#ff6fa8'); }
    g.fillStyle = gr; g.fillRect(mx, my + mh - f, mw, f);
    g.restore();
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(mx - 6, my + mh / 2); g.lineTo(mx + mw + 6, my + mh / 2); g.stroke();
    text(g, ok ? 'Safe' : 'Too fast', px + pw / 2, my + mh + 18, fs, ok ? '#a8ff8f' : '#ff9fd0', 'center', { font: FB, weight: 700, outline: false });
  }
  function draw(g, w, h, T) {
    api.sky.draw(g, w, h, T, { deco: false });
    const ms = Math.min(w, h);
    drawPlanet(g, 'earth', w - api.safe.right - ms * 0.12, api.safe.top + ms * 0.1, ms * 0.055, true);
    if (!padPx) return;
    const topY = Math.min(...gp.map((p) => p[1]));
    moonGround(g, gp, w, h, topY);
    for (const d of deco) {
      const cx = d.x * w, cy = groundAt(cx) + d.d * h, r = ms * 0.03 * d.s;
      if (cx > padPx.l - r * 2 && cx < padPx.r + r * 2) continue;
      ell(g, cx, cy, r * 1.4, r * 0.5); g.fillStyle = 'rgba(110,105,140,.35)'; g.fill();
      g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, r * 1.4, r * 0.5, 0, 0.1, Math.PI - 0.1); g.stroke();
    }
    drawPad(g, padPx.l, padPx.r, padPx.y, T);
    // flag
    const fx = padPx.r + 10, fg = groundAt(fx);
    g.strokeStyle = '#fdf8ff'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(fx, fg + 2); g.lineTo(fx, fg - 34); g.stroke();
    g.fillStyle = '#ff6fa8'; g.beginPath(); g.moveTo(fx, fg - 34); g.lineTo(fx + 20 + Math.sin(T * 5) * 2, fg - 28); g.lineTo(fx, fg - 21); g.closePath(); g.fill();
    if (phase === 'fly' || phase === 'ready') {
      g.setLineDash([5, 9]); g.strokeStyle = 'rgba(95,224,200,.3)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(padPx.c, padPx.y - 50); g.lineTo(padPx.c, Math.max(api.safe.top + 10, padPx.y - h * 0.35)); g.stroke(); g.setLineDash([]);
    }
    if (holds.size && tx != null && phase === 'fly') { g.strokeStyle = 'rgba(255,209,102,.4)'; g.lineWidth = 3; circle(g, tx, y, 16); g.stroke(); }
    P.draw(g);
    if (phase === 'crashed') {
      drawLander(g, x, y, lh, T, false, crashTilt);
      for (let i = 0; i < 3; i++) { const a = T * 4 + i * 2.1; starPath(g, x + Math.cos(a) * lh * 0.45, y - lh * 0.55 + Math.sin(a) * lh * 0.14, 7, 3, 5, 0); g.fillStyle = '#ffd166'; g.fill(); }
    } else drawLander(g, x, y, lh, T, phase === 'fly' && thrusting ? 1 : false, tilt);
    if (phase === 'fly' && slowT > 0.05 && Math.floor(T * 4) % 2 === 0) text(g, 'Slow down!', x, y - lh * 0.95, 24, '#ff9fd0');
    if (phase === 'ready') text(g, `Landing ${round + 1} of ${ROUNDS}`, w / 2, h * 0.36, 36, '#ffd166');
    drawMeter(g, w, h);
    F.draw(g, w);
  }
  function key(k, down) {
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { keyL = down; if (!down) { holds.clear(); tx = null; } return true; }
    if (k === 'ArrowRight' || k === 'd' || k === 'D') { keyR = down; return true; }
    if (k === 'ArrowUp' || k === ' ' || k === 'w' || k === 'W') { keyUp = down; return true; }
    return false;
  }
  hud(true);
  return {
    resize, update, draw, key,
    down(px, py, id) { if (done) return; holds.add(id == null ? 0 : id); tx = px; },
    move(px, py, pressed) { if (pressed && holds.size) tx = px; },
    up(px, py, id) { holds.delete(id == null ? 0 : id); if (!holds.size) tx = null; },
  };
}

/* ======================================================================
   GAME 7: ALIEN POP
   ====================================================================== */
function createAliens(api) {
  const P = api.parts, F = api.floats;
  const ROUND = 60;
  const CHEERS = [['oda', 'Boop! Boop! I love the aliens!'], ['dad', 'Super fast tapping, Harper!'], ['mum', 'They are all going home happy!'], ['leo', 'Excellent reflexes, Commander Harper!'], ['oda', 'That one waved at me!']];
  let W = 0, H = 0, holes = [], t = 0, score = 0, hearts = 3, spawnT = 0.9, done = false, doneT = 0, ended = false, reason = '';
  let lastHud = '', lastSay = -99, boops = 0, golds = 0, dogTaps = 0, shake = 0, cur = 0, warned = false, cheerI = 0, lastHole = -1, deco = [];
  function layout() {
    const s = api.safe, L = s.left + 10, R = W - s.right - 10, top = s.top + 4, bot = H - s.bottom - 4;
    const land = W > H;
    const cols = land ? 4 : 3, rows = land ? 3 : 4;
    const cw = (R - L) / cols, ch = (bot - top) / rows;
    const r = clamp(Math.min(cw * 0.36, ch * 0.3), 28, 100);
    const old = holes; holes = [];
    for (let i = 0; i < cols * rows; i++) {
      const c = i % cols, rw = Math.floor(i / cols), ox = (rw % 2 ? 1 : -1) * cw * 0.07;
      holes.push({ x: L + cw * (c + 0.5) + ox, y: top + ch * (rw + 0.5) + ch * 0.24, r, occ: old[i] ? old[i].occ : null });
    }
    if (cur >= holes.length) cur = 0;
  }
  function resize(w, h) {
    const first = !W; W = w; H = h; layout();
    if (first) {
      deco = Array.from({ length: 14 }, () => ({ x: Math.random(), y: Math.random(), s: rand(0.5, 1.2) }));
      F.add(w / 2, h * 0.42, 'Boop the aliens!', '#ffd166', 44, 1.5); say('oda', 'Aliens! They look so friendly!');
    }
  }
  function hud() { const tl = Math.max(0, Math.ceil(ROUND - t)); const k = score + '|' + hearts + '|' + tl; if (k !== lastHud) { lastHud = k; api.hud({ score, hearts, maxHearts: 3, time: tl }); } }
  function rise(o) {
    if (o.hit && o.kind === 'dog') return Math.max(0, 1 - o.hit / 0.3);
    if (o.hit) return 1;
    const a = o.age, k = a < 0.15 ? a / 0.15 : a > o.up - 0.18 ? Math.max(0, (o.up - a) / 0.18) : 1;
    return Math.sin(clamp(k, 0, 1) * Math.PI / 2);
  }
  function spawn(d) {
    const free = []; holes.forEach((h, i) => { if (!h.occ && i !== lastHole) free.push(i); });
    if (!free.length) return;
    const i = pick(free); lastHole = i;
    const pDog = t < 4 ? 0 : 0.13 + 0.09 * d, roll = Math.random();
    let kind = 'alien';
    if (roll < pDog) kind = 'dog'; else if (roll < pDog + 0.07) kind = 'gold';
    const base = lerp(1.5, 0.75, d) * rand(0.9, 1.15);
    holes[i].occ = { kind, who: Math.random() < 0.5 ? 'joules' : 'maggie', pal: pick(ALIEN_PALS), eyes: pick([1, 2, 2, 3]), age: 0, up: kind === 'dog' ? lerp(1.7, 1.2, d) : kind === 'gold' ? base * 0.8 : base, hit: 0 };
  }
  function finish(why) {
    if (done) return; done = true; reason = why; doneT = 0; sfx('whoosh');
    F.add(W / 2, H * 0.4, why === 'time' ? "Time's up!" : 'Woof! Doggy break!', '#ffd166', 46, 1.6);
  }
  function tapHole(i) {
    const h = holes[i], o = h && h.occ; if (!o || o.hit || done) return false;
    if (rise(o) < 0.25) return false;
    o.hit = 0.001;
    if (o.kind === 'dog') {
      hearts--; dogTaps++; shake = 0.35; sfx('bark'); say(o.who, 'Woof!');
      const nm = o.who === 'joules' ? 'Joules' : 'Maggie';
      F.add(h.x, h.y - h.r * 2, `That's ${nm}! No boops for dogs!`, '#ffe3c2', 22, 1.5);
      for (let k = 0; k < 4; k++) P.add({ x: h.x + rand(-h.r * 0.5, h.r * 0.5), y: h.y - h.r, vx: rand(-30, 30), vy: rand(-90, -50), life: 0.9, c: '#ff6fa8', s: 4, g: 0, star: false });
      if (hearts <= 0) finish('hearts');
    } else {
      const gold = o.kind === 'gold', pts = gold ? 5 : 1;
      score += pts; boops++; if (gold) golds++;
      sfx(gold ? 'happy' : 'blip');
      P.burst(h.x, h.y - h.r * 0.9, gold ? 26 : 12, gold ? ['#ffd166', '#fff3b0', '#ff6fa8', '#fff'] : [o.pal[0], o.pal[1], '#fff', '#ffd166'], { g: 60, max: gold ? 280 : 200 });
      F.add(h.x, h.y - h.r * 1.9, gold ? '+5 Golden!' : pick(['+1 Boop!', '+1', '+1 Bye bye!', '+1 Boop!']), gold ? '#ffd166' : '#5fe0c8', gold ? 30 : 24, 1);
      if (boops % 12 === 0 && t - lastSay > 6) { lastSay = t; const c = CHEERS[cheerI++ % CHEERS.length]; say(c[0], c[1]); }
      else if (gold && t - lastSay > 6) { lastSay = t; say('dad', 'A golden one! Brilliant, Harper!'); }
    }
    hud();
    return true;
  }
  function update(dt, T) {
    P.update(dt); F.update(dt); shake = Math.max(0, shake - dt);
    api.sky.update(dt, 5, H);
    for (const h of holes) {
      const o = h.occ; if (!o) continue;
      o.age += dt;
      if (o.hit) {
        o.hit += dt;
        if (o.kind !== 'dog' && Math.random() < dt * 40) P.add({ x: h.x + rand(-8, 8), y: h.y - h.r * 0.9 - o.hit * h.r * 5, vx: rand(-20, 20), vy: rand(20, 60), life: 0.5, c: pick(['#fff', '#ffd166', '#5fe0c8']), s: rand(2, 3), g: 0, star: true, spin: 4 });
        if (o.hit > 0.55) h.occ = null;
      } else if (o.age >= o.up) h.occ = null;
    }
    if (done) {
      doneT += dt;
      if (doneT > 1.6 && !ended) {
        ended = true;
        api.end(score, { lines: [`You booped ${boops} alien${boops === 1 ? '' : 's'} home.`, golds ? `${golds} golden alien${golds === 1 ? '' : 's'}!` : '', dogTaps ? `Dog boops: ${dogTaps}` : 'You never booped a dog. Good eyes!'], title: reason === 'time' ? "Time's up!" : 'Out of hearts, but great booping!' });
      }
      return;
    }
    t += dt;
    const d = Math.min(1, t / ROUND);
    spawnT -= dt;
    if (spawnT <= 0) {
      spawn(d); if (d > 0.4 && Math.random() < 0.35 * d) spawn(d);
      spawnT = lerp(0.9, 0.4, d) * rand(0.8, 1.2);
    }
    if (!warned && ROUND - t <= 10) { warned = true; F.add(W / 2, H * 0.3, '10 seconds left!', '#5fe0c8', 32, 1.6); }
    if (t >= ROUND) finish('time');
    hud();
  }
  function draw(g, w, h, T) {
    g.save();
    if (shake > 0) { const s = shake * 12; g.translate(Math.sin(T * 55) * s, Math.cos(T * 47) * s * 0.6); }
    api.sky.draw(g, w, h, T, { deco: false });
    if (!holes.length) { g.restore(); return; }
    const ms = Math.min(w, h), r0 = holes[0].r;
    const gy = holes[0].y - r0 * 1.15;
    drawPlanet(g, 'earth', w - api.safe.right - ms * 0.1, Math.max(api.safe.top + ms * 0.06, gy - ms * 0.12), ms * 0.05, true);
    g.beginPath(); g.moveTo(-10, gy + 30); g.quadraticCurveTo(w / 2, gy - 40, w + 10, gy + 30); g.lineTo(w + 10, h + 10); g.lineTo(-10, h + 10); g.closePath();
    const gr = g.createLinearGradient(0, gy - 30, 0, h); gr.addColorStop(0, '#e4e1f2'); gr.addColorStop(1, '#9a95b8');
    g.fillStyle = gr; g.fill(); g.lineWidth = 3; g.strokeStyle = '#3d3a5c'; g.stroke();
    for (const d of deco) { const dx = d.x * w, dy = gy + 30 + d.y * (h - gy - 30), rr0 = ms * 0.014 * d.s; ell(g, dx, dy, rr0 * 1.6, rr0 * 0.6); g.fillStyle = 'rgba(110,105,140,.28)'; g.fill(); }
    holes.forEach((ho, i) => {
      const { x, y, r } = ho, ry = r * 0.42, o = ho.occ, s = r * 1.35;
      drawCraterHole(g, x, y, r);
      let flying = null;
      if (o) {
        const e = rise(o);
        const cy = lerp(y + s * 0.62, y + ry * 0.2 - s * 0.42, e);
        if (o.hit && o.kind !== 'dog') flying = { cy };
        else if (e > 0) {
          g.save();
          g.beginPath(); g.moveTo(x - r, y); g.lineTo(x - r, y - s * 2); g.lineTo(x + r, y - s * 2); g.lineTo(x + r, y); g.ellipse(x, y, r, ry, 0, 0, Math.PI); g.closePath(); g.clip();
          if (o.kind === 'dog') drawDog(g, x, cy + s * 0.05, s * 1.05, o.who);
          else drawAlien(g, x, cy, s, o.kind === 'gold' ? GOLD_PAL : o.pal, o.eyes, T, o.kind === 'gold');
          g.restore();
        }
      }
      drawCraterLip(g, x, y, r);
      if (flying) {
        const k = o.hit, sc2 = Math.max(0.1, 1 - k * 1.3);
        g.save(); g.globalAlpha = clamp(1 - k / 0.55, 0, 1);
        g.translate(x, flying.cy - k * s * 3); g.rotate(k * 6); g.scale(sc2, sc2);
        drawAlien(g, 0, 0, s, o.kind === 'gold' ? GOLD_PAL : o.pal, o.eyes, T, o.kind === 'gold');
        g.restore();
      }
      if (api.keyboard && i === cur && !done) { g.strokeStyle = '#5fe0c8'; g.lineWidth = 4; ell(g, x, y + ry * 0.12, r * 1.35, ry * 1.9); g.stroke(); }
    });
    P.draw(g); F.draw(g, w);
    g.restore();
  }
  function hitAt(px, py) {
    let best = -1, bd = 1e9;
    holes.forEach((h, i) => {
      const o = h.occ; if (!o || o.hit || rise(o) < 0.25) return;
      const s = h.r * 1.35;
      if (Math.abs(px - h.x) < h.r * 1.25 && py > h.y - s * 1.35 && py < h.y + h.r * 0.75) {
        const dd = Math.hypot(px - h.x, py - (h.y - s * 0.45));
        if (dd < bd) { bd = dd; best = i; }
      }
    });
    return best;
  }
  hud();
  return {
    resize, update, draw,
    down(px, py) { if (done) return; const i = hitAt(px, py); if (i >= 0) { cur = i; tapHole(i); } },
    move() {}, up() {},
    key(k, down) {
      if (!down || !holes.length) return false;
      const cols = W > H ? 4 : 3, n = holes.length;
      if (k === 'ArrowRight') cur = (cur + 1) % n; else if (k === 'ArrowLeft') cur = (cur - 1 + n) % n;
      else if (k === 'ArrowDown') cur = (cur + cols) % n; else if (k === 'ArrowUp') cur = (cur - cols + n) % n;
      else if (k === ' ' || k === 'Enter') tapHole(cur);
      else return false;
      return true;
    },
  };
}

/* ======================================================================
   GAME 8: JETPACK JOULES
   ====================================================================== */
function createJetpack(api) {
  const P = api.parts, F = api.floats;
  const MILES = [['oda', 'Go Joules, go!'], ['harper', 'Good boy, Joules!'], ['maggie', 'Woof!'], ['dad', 'Look at that dog fly!'], ['leo', 'Superb flying. He is a natural, Commander Harper.'], ['mum', 'Careful, Joules! You are doing so well!']];
  let W = 0, H = 0, sc = 1, js = 70, jx = 0, jy = 0, vy = 0, tilt = 0, t = 0, readyT = 0, dist = 0, bonus = 0, hearts = 3, inv = 0, shake = 0, speed = 0;
  let phase = 'ready', done = false, doneT = 0, ended = false, lastHud = '', lastSay = -99, nextCol = 0, cols = [], items = [], bones = 0, starsGot = 0, wallOff = 0;
  let keyUp = false, lastGY = 0.5, nextMile = 100, mileI = 0, thrust = false;
  const holds = new Set();
  function bounds() { const top = api.safe.top + 2, bot = H - api.safe.bottom - 2, wall = clamp(H * 0.03, 14, 26); return { top, bot, wall, y0: top + wall, y1: bot - wall }; }
  function resize(w, h) {
    const first = !W;
    if (W && h !== H) jy *= h / H;
    W = w; H = h; sc = clamp(h / 800, 0.7, 1.3);
    js = clamp(Math.min(h * 0.13, w * 0.17), 56, 104);
    jx = w * (w > h ? 0.26 : 0.28);
    if (first) { const b = bounds(); jy = (b.y0 + b.y1) / 2; }
  }
  function hud() { const s = Math.floor(dist) + bonus; const k = s + '|' + hearts + '|' + Math.floor(dist); if (k !== lastHud) { lastHud = k; api.hud({ score: s, hearts, maxHearts: 3, extra: `${Math.floor(dist)} m` }); } }
  function makeRocks() { return Array.from({ length: 14 }, () => ({ rock: makeRock(1), rot: rand(0, TAU), vr: rand(-0.8, 0.8), dx: rand(-0.12, 0.12) })); }
  function spawnCol(d, b) {
    const ph = b.y1 - b.y0, w = clamp(js * 0.85, 46, 88);
    const gh = clamp(Math.max(js * 2.5, ph * lerp(0.5, 0.34, d)) / ph, 0.2, 0.75);
    const gy = clamp(lastGY + rand(-0.32, 0.32), gh / 2 + 0.03, 1 - gh / 2 - 0.03); lastGY = gy;
    const x = W + w;
    cols.push({ x, w, gy, gh, rT: makeRocks(), rB: makeRocks() });
    const ir = 20 * sc;
    if (Math.random() < 0.8) items.push({ kind: 'bone', x, fy: gy, r: ir, rot: rand(-0.4, 0.4) });
    const gap = speed * lerp(2.3, 1.5, d), mx = x + gap / 2, roll = Math.random();
    if (hearts < 3 && roll < 0.08) items.push({ kind: 'heart', x: mx, fy: rand(0.25, 0.75), r: ir });
    else if (roll < 0.4) items.push({ kind: 'star', x: mx, fy: rand(0.2, 0.8), r: ir * 1.05 });
    else if (roll < 0.75) { const fy = rand(0.25, 0.75); for (let k = -1; k <= 1; k++) items.push({ kind: 'bone', x: mx + k * ir * 3, fy: clamp(fy - Math.abs(k) * 0.06 + 0.03, 0.1, 0.9), r: ir, rot: k * 0.3 }); }
  }
  function start() { if (phase !== 'ready') return; phase = 'play'; sfx('whoosh'); sfx('bark'); say('joules', 'Woof!'); F.add(W / 2, H * 0.35, 'Go, Joules!', '#ffd166', 42, 1.2); nextCol = W * 0.35; }
  function finish() {
    if (done) return; done = true; doneT = 0; holds.clear(); keyUp = false; sfx('whoosh');
    F.add(W / 2, H * 0.4, 'What a flight, Joules!', '#ffd166', 42, 1.6);
  }
  function rectHit(cx, cy, r, x0, x1, y0, y1) { if (y1 <= y0) return false; const nx = clamp(cx, x0, x1), ny = clamp(cy, y0, y1); return Math.hypot(cx - nx, cy - ny) < r; }
  function update(dt, T) {
    P.update(dt); F.update(dt); shake = Math.max(0, shake - dt);
    const b = bounds(), ph = b.y1 - b.y0, yMin = b.y0 + js * 0.4, yMax = b.y1 - js * 0.62;
    if (phase === 'ready') {
      readyT += dt; jy = (b.y0 + b.y1) / 2 + Math.sin(readyT * 3) * 10; tilt = 0;
      wallOff += 60 * dt; api.sky.update(dt, 60, W);
      return;
    }
    if (done) {
      doneT += dt; speed = Math.max(0, speed - dt * 260); vy = Math.min(vy + 300 * sc * dt, 260 * sc); jy = Math.min(jy + vy * dt, yMax); tilt = lerp(tilt, 0.25, dt * 3);
      wallOff += speed * dt; api.sky.update(dt, speed * 0.6, W);
      for (const c of cols) c.x -= speed * dt; for (const it of items) it.x -= speed * dt;
      if (doneT > 1.6 && !ended) { ended = true; const m = Math.floor(dist); api.end(m + bonus, { lines: [`Joules flew ${m} metres!`, `Bones: ${bones}   Stars: ${starsGot}`], title: 'Joules needs a nap!' }); }
      return;
    }
    t += dt; inv = Math.max(0, inv - dt);
    const d = Math.min(1, t / 120);
    speed = (190 + 140 * d) * sc;
    dist += (speed * dt) / (32 * sc);
    wallOff += speed * dt;
    api.sky.update(dt, speed * 0.6, W);
    thrust = holds.size > 0 || keyUp;
    vy += (thrust ? -560 : 430) * sc * dt;
    vy = clamp(vy, -300 * sc, 320 * sc);
    jy += vy * dt;
    if (jy < yMin) { jy = yMin; if (vy < 0) vy = 0; }
    if (jy > yMax) { jy = yMax; if (vy > 0) vy = 0; }
    tilt = lerp(tilt, clamp(vy / (900 * sc), -0.3, 0.35), Math.min(1, dt * 8));
    if (thrust && Math.random() < dt * 45) {
      const c = Math.cos(tilt), s = Math.sin(tilt), ox = -js * 0.43, oy = js * 0.5;
      P.add({ x: jx + ox * c - oy * s, y: jy + ox * s + oy * c, vx: rand(-60, -20) - speed * 0.3, vy: rand(90, 160), life: rand(0.2, 0.4), c: pick(['#ffb347', '#ffd166', '#ff7a45']), s: rand(2, 4), g: 0, star: false });
    }
    nextCol -= speed * dt;
    if (nextCol <= 0) { spawnCol(d, b); nextCol = speed * lerp(2.3, 1.5, d); }
    const hx = jx - js * 0.04, hy = jy + js * 0.14, hr = js * 0.3;
    for (let i = cols.length - 1; i >= 0; i--) {
      const c = cols[i]; c.x -= speed * dt;
      for (const r of c.rT) r.rot += r.vr * dt; for (const r of c.rB) r.rot += r.vr * dt;
      if (c.x < -c.w * 1.5) { cols.splice(i, 1); continue; }
      if (inv > 0) continue;
      const gT = b.y0 + (c.gy - c.gh / 2) * ph, gB = b.y0 + (c.gy + c.gh / 2) * ph, x0 = c.x - c.w * 0.4, x1 = c.x + c.w * 0.4;
      if (rectHit(hx, hy, hr, x0, x1, b.top - 50, gT - 4) || rectHit(hx, hy, hr, x0, x1, gB + 4, b.bot + 50)) {
        hearts--; inv = 1.8; shake = 0.4; sfx('thud');
        vy = (hy < (gT + gB) / 2 ? 1 : -1) * 140 * sc;
        P.burst(hx + hr, hy, 16, ['#9d9ab4', '#6c6984', '#c4c1d6'], { stars: 0, g: 200 });
        F.add(jx, jy - js * 0.8, pick(['Bonk! Joules is OK!', 'Boing! Keep going!', 'Oops! Shake it off!']), '#ffe3c2', 24, 1.3);
        if (hearts > 0 && t - lastSay > 8) { lastSay = t; say(pick(['mum', 'dad']), pick(['You are OK, Joules!', 'Keep going, Harper!'])); }
        if (hearts <= 0) finish();
      }
    }
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]; it.x -= speed * dt;
      if (it.x < -60) { items.splice(i, 1); continue; }
      const iy = b.y0 + it.fy * ph;
      if (Math.hypot(it.x - hx, iy - hy) < hr * 1.25 + it.r) {
        items.splice(i, 1);
        if (it.kind === 'bone') { bonus += 5; bones++; sfx('chime'); P.burst(it.x, iy, 10, ['#fff6e8', '#ffd166', '#fff'], { g: 60 }); F.add(it.x, iy - 16, '+5', '#ffd166', 24, 0.8); }
        else if (it.kind === 'star') { bonus += 15; starsGot++; sfx('happy'); P.burst(it.x, iy, 18, ['#ffd166', '#fff3b0', '#ffb347'], { g: 60 }); F.add(it.x, iy - 18, '+15 Star!', '#ffd166', 26, 1); }
        else { sfx('happy'); P.burst(it.x, iy, 16, ['#ff6fa8', '#ffe3c2', '#ffb3cf'], { g: 60 }); if (hearts < 3) { hearts++; F.add(it.x, iy - 16, '+1 heart', '#ff9fd0', 24, 1); } else { bonus += 5; F.add(it.x, iy - 16, '+5', '#ff9fd0', 24, 1); } }
      }
    }
    if (dist >= nextMile) {
      F.add(W / 2, H * 0.3, `${nextMile} metres!`, '#5fe0c8', 30, 1.4);
      if (t - lastSay > 6) { lastSay = t; const m = MILES[mileI++ % MILES.length]; say(m[0], m[1]); if (m[0] === 'maggie' || m[0] === 'joules') sfx('bark'); }
      nextMile += 100;
    }
    hud();
  }
  function drawWall(g, w, b, topSide) {
    const pts = [];
    for (let x = -20; x <= w + 20; x += 16) {
      const k = (x + wallOff) * 0.028, k2 = (x + wallOff) * 0.067;
      const off = b.wall * (0.75 + 0.22 * Math.sin(k + (topSide ? 0 : 2)) + 0.18 * Math.sin(k2 + (topSide ? 1 : 4)));
      pts.push([x, topSide ? b.top + off : b.bot - off]);
    }
    g.beginPath(); g.moveTo(-20, topSide ? b.top - 200 : b.bot + 200);
    for (const p of pts) g.lineTo(p[0], p[1]);
    g.lineTo(w + 20, topSide ? b.top - 200 : b.bot + 200); g.closePath();
    const gr = g.createLinearGradient(0, topSide ? b.top : b.bot, 0, topSide ? b.top + b.wall * 1.3 : b.bot - b.wall * 1.3);
    gr.addColorStop(0, '#5a5680'); gr.addColorStop(1, '#a9a4c8');
    g.fillStyle = gr; g.fill();
    g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.lineWidth = 3; g.lineJoin = 'round'; g.strokeStyle = '#3d3a5c'; g.stroke();
  }
  function draw(g, w, h, T) {
    g.save();
    if (shake > 0) { const s = shake * 12; g.translate(Math.sin(T * 55) * s, Math.cos(T * 47) * s * 0.6); }
    g.save(); g.translate(w, 0); g.rotate(Math.PI / 2); api.sky.draw(g, h, w, T, { deco: false }); g.restore();
    const b = bounds(), ph = b.y1 - b.y0;
    for (const c of cols) {
      const gT = b.y0 + (c.gy - c.gh / 2) * ph, gB = b.y0 + (c.gy + c.gh / 2) * ph, r = c.w * 0.55, step = r * 1.45;
      let k = 0;
      for (let y = gT - r * 0.75; y > b.top - r && k < c.rT.length; y -= step, k++) { const q = c.rT[k]; drawRock(g, q.rock, c.x + q.dx * c.w, y, q.rot, r); }
      k = 0;
      for (let y = gB + r * 0.75; y < b.bot + r && k < c.rB.length; y += step, k++) { const q = c.rB[k]; drawRock(g, q.rock, c.x + q.dx * c.w, y, q.rot, r); }
    }
    drawWall(g, w, b, true); drawWall(g, w, b, false);
    for (const it of items) {
      const iy = b.y0 + it.fy * ph;
      if (it.kind === 'bone') drawBone(g, it.x, iy + Math.sin(T * 3 + it.x * 0.02) * 3, it.r * 2.1, it.rot + Math.sin(T * 2 + it.x) * 0.15);
      else if (it.kind === 'star') drawCuteStar(g, it.x, iy, it.r, Math.sin(T * 3 + it.x) * 0.25);
      else drawPluto(g, it.x, iy, it.r, T, true);
    }
    P.draw(g);
    const blink = inv > 0 && Math.floor(inv * 10) % 2 === 0;
    drawJetDog(g, jx, jy, js, T, done ? 0 : thrust ? 1 : 0.3, tilt, blink ? 0.35 : 1);
    if (phase === 'ready') {
      const pulse = 1 + 0.06 * Math.sin(T * 5);
      text(g, 'Hold to fly up!', w / 2, h * 0.3, 34, '#ffd166');
      text(g, 'Let go to sink down', w / 2, h * 0.3 + 42, 24, '#fdf8ff');
      g.save(); g.translate(w / 2, h * 0.72); g.scale(pulse, pulse); text(g, 'Tap and hold to start', 0, 0, 28, '#5fe0c8'); g.restore();
    }
    F.draw(g, w);
    g.restore();
  }
  function key(k, down) {
    if (k === 'ArrowLeft') { if (!down) holds.clear(); return false; }
    if (k === 'ArrowUp' || k === ' ' || k === 'w' || k === 'W' || k === 'Enter') { keyUp = down; if (down) start(); return true; }
    return false;
  }
  hud();
  return {
    resize, update, draw, key,
    down(px, py, id) { if (done) return; holds.add(id == null ? 0 : id); start(); },
    move() {},
    up(px, py, id) { holds.delete(id == null ? 0 : id); },
  };
}

/* GAME 8b: JETPACK MAGGIE (same tunnel, Maggie flying) */
function createJetpackMaggie(api) {
  const P = api.parts, F = api.floats;
  const MILES = [['oda', 'Go Maggie, go!'], ['harper', 'Good girl, Maggie!'], ['joules', 'Woof!'], ['dad', 'Look at that dog fly!'], ['leo', 'Superb flying. Maggie is a natural, Commander Harper.'], ['mum', 'Careful, Maggie! You are doing so well!']];
  let W = 0, H = 0, sc = 1, js = 70, jx = 0, jy = 0, vy = 0, tilt = 0, t = 0, readyT = 0, dist = 0, bonus = 0, hearts = 3, inv = 0, shake = 0, speed = 0;
  let phase = 'ready', done = false, doneT = 0, ended = false, lastHud = '', lastSay = -99, nextCol = 0, cols = [], items = [], bones = 0, starsGot = 0, wallOff = 0;
  let keyUp = false, lastGY = 0.5, nextMile = 100, mileI = 0, thrust = false;
  const holds = new Set();
  function bounds() { const top = api.safe.top + 2, bot = H - api.safe.bottom - 2, wall = clamp(H * 0.03, 14, 26); return { top, bot, wall, y0: top + wall, y1: bot - wall }; }
  function resize(w, h) {
    const first = !W;
    if (W && h !== H) jy *= h / H;
    W = w; H = h; sc = clamp(h / 800, 0.7, 1.3);
    js = clamp(Math.min(h * 0.13, w * 0.17), 56, 104);
    jx = w * (w > h ? 0.26 : 0.28);
    if (first) { const b = bounds(); jy = (b.y0 + b.y1) / 2; }
  }
  function hud() { const s = Math.floor(dist) + bonus; const k = s + '|' + hearts + '|' + Math.floor(dist); if (k !== lastHud) { lastHud = k; api.hud({ score: s, hearts, maxHearts: 3, extra: `${Math.floor(dist)} m` }); } }
  function makeRocks() { return Array.from({ length: 14 }, () => ({ rock: makeRock(1), rot: rand(0, TAU), vr: rand(-0.8, 0.8), dx: rand(-0.12, 0.12) })); }
  function spawnCol(d, b) {
    const ph = b.y1 - b.y0, w = clamp(js * 0.85, 46, 88);
    const gh = clamp(Math.max(js * 2.5, ph * lerp(0.5, 0.34, d)) / ph, 0.2, 0.75);
    const gy = clamp(lastGY + rand(-0.32, 0.32), gh / 2 + 0.03, 1 - gh / 2 - 0.03); lastGY = gy;
    const x = W + w;
    cols.push({ x, w, gy, gh, rT: makeRocks(), rB: makeRocks() });
    const ir = 20 * sc;
    if (Math.random() < 0.8) items.push({ kind: 'bone', x, fy: gy, r: ir, rot: rand(-0.4, 0.4) });
    const gap = speed * lerp(2.3, 1.5, d), mx = x + gap / 2, roll = Math.random();
    if (hearts < 3 && roll < 0.08) items.push({ kind: 'heart', x: mx, fy: rand(0.25, 0.75), r: ir });
    else if (roll < 0.4) items.push({ kind: 'star', x: mx, fy: rand(0.2, 0.8), r: ir * 1.05 });
    else if (roll < 0.75) { const fy = rand(0.25, 0.75); for (let k = -1; k <= 1; k++) items.push({ kind: 'bone', x: mx + k * ir * 3, fy: clamp(fy - Math.abs(k) * 0.06 + 0.03, 0.1, 0.9), r: ir, rot: k * 0.3 }); }
  }
  function start() { if (phase !== 'ready') return; phase = 'play'; sfx('whoosh'); sfx('bark'); say('maggie', 'Woof!'); F.add(W / 2, H * 0.35, 'Go, Maggie!', '#ffd166', 42, 1.2); nextCol = W * 0.35; }
  function finish() {
    if (done) return; done = true; doneT = 0; holds.clear(); keyUp = false; sfx('whoosh');
    F.add(W / 2, H * 0.4, 'What a flight, Maggie!', '#ffd166', 42, 1.6);
  }
  function rectHit(cx, cy, r, x0, x1, y0, y1) { if (y1 <= y0) return false; const nx = clamp(cx, x0, x1), ny = clamp(cy, y0, y1); return Math.hypot(cx - nx, cy - ny) < r; }
  function update(dt, T) {
    P.update(dt); F.update(dt); shake = Math.max(0, shake - dt);
    const b = bounds(), ph = b.y1 - b.y0, yMin = b.y0 + js * 0.4, yMax = b.y1 - js * 0.62;
    if (phase === 'ready') {
      readyT += dt; jy = (b.y0 + b.y1) / 2 + Math.sin(readyT * 3) * 10; tilt = 0;
      wallOff += 60 * dt; api.sky.update(dt, 60, W);
      return;
    }
    if (done) {
      doneT += dt; speed = Math.max(0, speed - dt * 260); vy = Math.min(vy + 300 * sc * dt, 260 * sc); jy = Math.min(jy + vy * dt, yMax); tilt = lerp(tilt, 0.25, dt * 3);
      wallOff += speed * dt; api.sky.update(dt, speed * 0.6, W);
      for (const c of cols) c.x -= speed * dt; for (const it of items) it.x -= speed * dt;
      if (doneT > 1.6 && !ended) { ended = true; const m = Math.floor(dist); api.end(m + bonus, { lines: [`Maggie flew ${m} metres!`, `Bones: ${bones}   Stars: ${starsGot}`], title: 'Maggie needs a nap!' }); }
      return;
    }
    t += dt; inv = Math.max(0, inv - dt);
    const d = Math.min(1, t / 120);
    speed = (190 + 140 * d) * sc;
    dist += (speed * dt) / (32 * sc);
    wallOff += speed * dt;
    api.sky.update(dt, speed * 0.6, W);
    thrust = holds.size > 0 || keyUp;
    vy += (thrust ? -560 : 430) * sc * dt;
    vy = clamp(vy, -300 * sc, 320 * sc);
    jy += vy * dt;
    if (jy < yMin) { jy = yMin; if (vy < 0) vy = 0; }
    if (jy > yMax) { jy = yMax; if (vy > 0) vy = 0; }
    tilt = lerp(tilt, clamp(vy / (900 * sc), -0.3, 0.35), Math.min(1, dt * 8));
    if (thrust && Math.random() < dt * 45) {
      const c = Math.cos(tilt), s = Math.sin(tilt), ox = -js * 0.43, oy = js * 0.5;
      P.add({ x: jx + ox * c - oy * s, y: jy + ox * s + oy * c, vx: rand(-60, -20) - speed * 0.3, vy: rand(90, 160), life: rand(0.2, 0.4), c: pick(['#ffb347', '#ffd166', '#ff7a45']), s: rand(2, 4), g: 0, star: false });
    }
    nextCol -= speed * dt;
    if (nextCol <= 0) { spawnCol(d, b); nextCol = speed * lerp(2.3, 1.5, d); }
    const hx = jx - js * 0.04, hy = jy + js * 0.14, hr = js * 0.3;
    for (let i = cols.length - 1; i >= 0; i--) {
      const c = cols[i]; c.x -= speed * dt;
      for (const r of c.rT) r.rot += r.vr * dt; for (const r of c.rB) r.rot += r.vr * dt;
      if (c.x < -c.w * 1.5) { cols.splice(i, 1); continue; }
      if (inv > 0) continue;
      const gT = b.y0 + (c.gy - c.gh / 2) * ph, gB = b.y0 + (c.gy + c.gh / 2) * ph, x0 = c.x - c.w * 0.4, x1 = c.x + c.w * 0.4;
      if (rectHit(hx, hy, hr, x0, x1, b.top - 50, gT - 4) || rectHit(hx, hy, hr, x0, x1, gB + 4, b.bot + 50)) {
        hearts--; inv = 1.8; shake = 0.4; sfx('thud');
        vy = (hy < (gT + gB) / 2 ? 1 : -1) * 140 * sc;
        P.burst(hx + hr, hy, 16, ['#9d9ab4', '#6c6984', '#c4c1d6'], { stars: 0, g: 200 });
        F.add(jx, jy - js * 0.8, pick(['Bonk! Maggie is OK!', 'Boing! Keep going!', 'Oops! Shake it off!']), '#ffe3c2', 24, 1.3);
        if (hearts > 0 && t - lastSay > 8) { lastSay = t; say(pick(['mum', 'dad']), pick(['You are OK, Maggie!', 'Keep going, Harper!'])); }
        if (hearts <= 0) finish();
      }
    }
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]; it.x -= speed * dt;
      if (it.x < -60) { items.splice(i, 1); continue; }
      const iy = b.y0 + it.fy * ph;
      if (Math.hypot(it.x - hx, iy - hy) < hr * 1.25 + it.r) {
        items.splice(i, 1);
        if (it.kind === 'bone') { bonus += 5; bones++; sfx('chime'); P.burst(it.x, iy, 10, ['#fff6e8', '#ffd166', '#fff'], { g: 60 }); F.add(it.x, iy - 16, '+5', '#ffd166', 24, 0.8); }
        else if (it.kind === 'star') { bonus += 15; starsGot++; sfx('happy'); P.burst(it.x, iy, 18, ['#ffd166', '#fff3b0', '#ffb347'], { g: 60 }); F.add(it.x, iy - 18, '+15 Star!', '#ffd166', 26, 1); }
        else { sfx('happy'); P.burst(it.x, iy, 16, ['#ff6fa8', '#ffe3c2', '#ffb3cf'], { g: 60 }); if (hearts < 3) { hearts++; F.add(it.x, iy - 16, '+1 heart', '#ff9fd0', 24, 1); } else { bonus += 5; F.add(it.x, iy - 16, '+5', '#ff9fd0', 24, 1); } }
      }
    }
    if (dist >= nextMile) {
      F.add(W / 2, H * 0.3, `${nextMile} metres!`, '#5fe0c8', 30, 1.4);
      if (t - lastSay > 6) { lastSay = t; const m = MILES[mileI++ % MILES.length]; say(m[0], m[1]); if (m[0] === 'maggie' || m[0] === 'joules') sfx('bark'); }
      nextMile += 100;
    }
    hud();
  }
  function drawWall(g, w, b, topSide) {
    const pts = [];
    for (let x = -20; x <= w + 20; x += 16) {
      const k = (x + wallOff) * 0.028, k2 = (x + wallOff) * 0.067;
      const off = b.wall * (0.75 + 0.22 * Math.sin(k + (topSide ? 0 : 2)) + 0.18 * Math.sin(k2 + (topSide ? 1 : 4)));
      pts.push([x, topSide ? b.top + off : b.bot - off]);
    }
    g.beginPath(); g.moveTo(-20, topSide ? b.top - 200 : b.bot + 200);
    for (const p of pts) g.lineTo(p[0], p[1]);
    g.lineTo(w + 20, topSide ? b.top - 200 : b.bot + 200); g.closePath();
    const gr = g.createLinearGradient(0, topSide ? b.top : b.bot, 0, topSide ? b.top + b.wall * 1.3 : b.bot - b.wall * 1.3);
    gr.addColorStop(0, '#5a5680'); gr.addColorStop(1, '#a9a4c8');
    g.fillStyle = gr; g.fill();
    g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.lineWidth = 3; g.lineJoin = 'round'; g.strokeStyle = '#3d3a5c'; g.stroke();
  }
  function draw(g, w, h, T) {
    g.save();
    if (shake > 0) { const s = shake * 12; g.translate(Math.sin(T * 55) * s, Math.cos(T * 47) * s * 0.6); }
    g.save(); g.translate(w, 0); g.rotate(Math.PI / 2); api.sky.draw(g, h, w, T, { deco: false }); g.restore();
    const b = bounds(), ph = b.y1 - b.y0;
    for (const c of cols) {
      const gT = b.y0 + (c.gy - c.gh / 2) * ph, gB = b.y0 + (c.gy + c.gh / 2) * ph, r = c.w * 0.55, step = r * 1.45;
      let k = 0;
      for (let y = gT - r * 0.75; y > b.top - r && k < c.rT.length; y -= step, k++) { const q = c.rT[k]; drawRock(g, q.rock, c.x + q.dx * c.w, y, q.rot, r); }
      k = 0;
      for (let y = gB + r * 0.75; y < b.bot + r && k < c.rB.length; y += step, k++) { const q = c.rB[k]; drawRock(g, q.rock, c.x + q.dx * c.w, y, q.rot, r); }
    }
    drawWall(g, w, b, true); drawWall(g, w, b, false);
    for (const it of items) {
      const iy = b.y0 + it.fy * ph;
      if (it.kind === 'bone') drawBone(g, it.x, iy + Math.sin(T * 3 + it.x * 0.02) * 3, it.r * 2.1, it.rot + Math.sin(T * 2 + it.x) * 0.15);
      else if (it.kind === 'star') drawCuteStar(g, it.x, iy, it.r, Math.sin(T * 3 + it.x) * 0.25);
      else drawPluto(g, it.x, iy, it.r, T, true);
    }
    P.draw(g);
    const blink = inv > 0 && Math.floor(inv * 10) % 2 === 0;
    drawJetDog(g, jx, jy, js, T, done ? 0 : thrust ? 1 : 0.3, tilt, blink ? 0.35 : 1, 'maggie');
    if (phase === 'ready') {
      const pulse = 1 + 0.06 * Math.sin(T * 5);
      text(g, 'Hold to fly up!', w / 2, h * 0.3, 34, '#ffd166');
      text(g, 'Let go to sink down', w / 2, h * 0.3 + 42, 24, '#fdf8ff');
      g.save(); g.translate(w / 2, h * 0.72); g.scale(pulse, pulse); text(g, 'Tap and hold to start', 0, 0, 28, '#5fe0c8'); g.restore();
    }
    F.draw(g, w);
    g.restore();
  }
  function key(k, down) {
    if (k === 'ArrowLeft') { if (!down) holds.clear(); return false; }
    if (k === 'ArrowUp' || k === ' ' || k === 'w' || k === 'W' || k === 'Enter') { keyUp = down; if (down) start(); return true; }
    return false;
  }
  hud();
  return {
    resize, update, draw, key,
    down(px, py, id) { if (done) return; holds.add(id == null ? 0 : id); start(); },
    move() {},
    up(px, py, id) { holds.delete(id == null ? 0 : id); },
  };
}

/* ======================================================================
   GAME 9: METEOR SHOWER
   ====================================================================== */
function createMeteors(api) {
  const P = api.parts, F = api.floats;
  const MAXS = 5;
  const WAVE = [['dad', 'The house is safe! Great zapping, Harper!'], ['mum', 'Thank you for keeping our home safe!'], ['oda', 'Zap zap zap! Sparkles!'], ['maggie', 'Woof!'], ['leo', 'Wave cleared. Excellent shooting, Commander.'], ['joules', 'Woof!']];
  let W = 0, H = 0, sc = 1, R = 80, pcx = 0, pcy = 0, SR = 0, shield = MAXS, score = 0, wave = 0, waveLeft = 0, waveHit = false, spawnT = 0, between = 1.4;
  let mets = [], beams = [], t = 0, done = false, doneT = 0, ended = false, lastHud = '', zaps = 0, flash = 0, shake = 0, kbCool = 0, waveI = 0, lowSaid = false;
  function layout() {
    R = clamp(Math.min(W * 0.2, H * 0.14), 46, 120);
    pcx = W / 2; pcy = H - api.safe.bottom - R - 4; SR = R * 1.72;
  }
  function resize(w, h) {
    const first = !W;
    if (W && (w !== W || h !== H)) for (const m of mets) { m.x *= w / W; m.y *= h / H; }
    W = w; H = h; sc = clamp(h / 800, 0.75, 1.3); layout();
    if (first) { F.add(w / 2, h * 0.38, fillName('Protect the house, Harper!'), '#ffd166', 38, 1.6); say('mum', 'Meteors are coming! Tap them to keep our house safe, Harper!'); }
  }
  function hud() { const k = score + '|' + shield + '|' + wave; if (k !== lastHud) { lastHud = k; api.hud({ score, meter: shield / MAXS, meterLabel: 'Shield', extra: `Wave ${Math.max(1, wave)}` }); } }
  function dish() { const hs = R * 0.5; return [pcx, pcy - R * 0.97 - hs * 1.1]; }
  function startWave() {
    wave++; waveLeft = 5 + 3 * wave; waveHit = false; spawnT = 0.6;
    F.add(W / 2, H * 0.34, `Wave ${wave}`, '#ffd166', 44, 1.5); sfx('whoosh');
    hud();
  }
  function spawn(kind) {
    const r = (kind === 'big' ? 36 : kind === 'small' ? 20 : kind === 'shield' ? 30 : 27) * sc;
    const x = rand(r + 10, W - r - 10), y = -r - 10;
    const txp = pcx + rand(-R * 0.9, R * 0.9), typ = pcy;
    const dx = txp - x, dy = typ - y, l = Math.hypot(dx, dy) || 1;
    const spd = (kind === 'shield' ? 45 : 52 + 13 * wave) * sc * rand(0.9, 1.1);
    mets.push({ kind, x, y, vx: dx / l * spd, vy: dy / l * spd, r, rot: rand(0, TAU), vr: rand(-2, 2), rock: kind === 'shield' ? null : makeRock(r), ph: rand(0, TAU) });
  }
  function finish() {
    if (done) return; done = true; doneT = 0; sfx('whoosh');
    F.add(W / 2, H * 0.36, 'Shield needs a recharge!', '#ffd166', 36, 1.8);
    say('dad', 'Everyone is safe inside. What a meteor shower!');
  }
  function zap(i) {
    const m = mets[i]; if (!m) return;
    mets.splice(i, 1);
    const [dx0, dy0] = dish();
    beams.push({ x0: dx0, y0: dy0, x1: m.x, y1: m.y, life: 0.18 });
    if (m.kind === 'shield') {
      sfx('happy');
      P.burst(m.x, m.y, 22, ['#5fe0c8', '#bff7ec', '#fff', '#ff6fa8'], { g: 40, max: 240 });
      if (shield < MAXS) { shield++; F.add(m.x, m.y - 24, '+1 Shield!', '#5fe0c8', 28, 1.2); } else { score += 3; F.add(m.x, m.y - 24, '+3', '#5fe0c8', 26, 1); }
      lowSaid = false; hud(); return;
    }
    zaps++; sfx('blip');
    const pts = m.kind === 'big' ? 2 : 1; score += pts;
    P.burst(m.x, m.y, m.kind === 'big' ? 22 : 14, ['#fff', '#ffd166', '#5fe0c8', '#ff9fd0', '#b48cff'], { g: 30, stars: 0.75, max: 240 });
    F.add(m.x, m.y - m.r - 6, `+${pts}`, '#ffd166', 24, 0.8);
    if (m.kind === 'big') {
      const sp = Math.hypot(m.vx, m.vy) * 0.95, a = Math.atan2(m.vy, m.vx);
      for (const sd of [-1, 1]) {
        const aa = a + sd * 0.55, r = 20 * sc;
        mets.push({ kind: 'small', x: m.x + sd * r * 0.6, y: m.y, vx: Math.cos(aa) * sp, vy: Math.max(20 * sc, Math.sin(aa) * sp), r, rot: rand(0, TAU), vr: rand(-3, 3), rock: makeRock(r), ph: 0 });
      }
      F.add(m.x, m.y + m.r + 10, 'Split!', '#ff9fd0', 22, 0.9);
    }
    hud();
  }
  function update(dt, T) {
    P.update(dt); F.update(dt); flash = Math.max(0, flash - dt); shake = Math.max(0, shake - dt); kbCool -= dt;
    api.sky.update(dt, 14, H);
    for (let i = beams.length - 1; i >= 0; i--) { beams[i].life -= dt; if (beams[i].life <= 0) beams.splice(i, 1); }
    if (done) {
      doneT += dt;
      for (const m of mets) { m.x += m.vx * dt * 0.2; m.y += m.vy * dt * 0.2; }
      if (doneT > 1.8 && !ended) { ended = true; api.end(score, { lines: [`You reached wave ${wave}.`, `Meteors zapped: ${zaps}`], title: 'The shield needs a recharge!' }); }
      return;
    }
    t += dt;
    if (between > 0) { between -= dt; if (between <= 0) startWave(); }
    else {
      spawnT -= dt;
      if (waveLeft > 0 && spawnT <= 0) {
        const hasOrb = mets.some((m) => m.kind === 'shield');
        if (!hasOrb && shield < MAXS && Math.random() < (shield <= 2 ? 0.16 : 0.07)) spawn('shield');
        else { spawn(wave >= 2 && Math.random() < Math.min(0.32, 0.1 + 0.04 * wave) ? 'big' : 'norm'); waveLeft--; }
        spawnT = Math.max(0.36, 1.35 * Math.pow(0.88, wave - 1)) * rand(0.75, 1.25);
      }
      if (waveLeft === 0 && !mets.some((m) => m.kind !== 'shield')) {
        if (!waveHit) { score += 5; F.add(W / 2, H * 0.34, 'Perfect wave! +5', '#5fe0c8', 34, 1.6); }
        else F.add(W / 2, H * 0.34, `Wave ${wave} done!`, '#5fe0c8', 34, 1.4);
        sfx('happy'); between = 2.2;
        const c = WAVE[waveI++ % WAVE.length]; say(c[0], c[1]); if (c[0] === 'maggie' || c[0] === 'joules') sfx('bark');
        hud();
      }
    }
    for (let i = mets.length - 1; i >= 0; i--) {
      const m = mets[i];
      m.x += m.vx * dt; m.y += m.vy * dt; m.rot += m.vr * dt;
      if (m.kind === 'shield') m.x += Math.sin(t * 2 + m.ph) * 30 * dt;
      else if (Math.random() < dt * 14) P.add({ x: m.x - m.vx * 0.08, y: m.y - m.vy * 0.08, vx: rand(-15, 15), vy: rand(-15, 15), life: rand(0.3, 0.5), c: pick(['#ffb347', '#ffd166', '#ff7a45']), s: rand(1.5, 3), g: 0, star: false });
      if (Math.hypot(m.x - pcx, m.y - pcy) < SR + m.r * 0.3) {
        mets.splice(i, 1);
        if (m.kind === 'shield') { P.burst(m.x, m.y, 10, ['#5fe0c8', '#fff'], { g: 0 }); continue; }
        shield--; waveHit = true; flash = 0.5; shake = 0.35; sfx('thud');
        P.burst(m.x, m.y, 18, ['#ffb347', '#ff7a45', '#ffd166', '#9d9ab4'], { g: 80 });
        F.add(m.x, m.y - 24, pick(['Bump! Shield held!', 'Boing!', 'Shield wobble!']), '#ffe3c2', 24, 1.2);
        if (shield <= 0) { shield = 0; finish(); hud(); return; }
        if (shield <= 2 && !lowSaid) { lowSaid = true; say('leo', 'Shield is getting low, Harper! Tap a shield bubble.'); }
        continue;
      }
      if (m.y > H + 80 || m.x < -100 || m.x > W + 100) mets.splice(i, 1);
    }
    hud();
  }
  function draw(g, w, h, T) {
    g.save();
    if (shake > 0) { const s = shake * 12; g.translate(Math.sin(T * 55) * s, Math.cos(T * 47) * s * 0.6); }
    api.sky.draw(g, w, h, T);
    // shield dome (back glow)
    const k = shield / MAXS;
    if (shield > 0 || done) {
      const dg = g.createRadialGradient(pcx, pcy, SR * 0.7, pcx, pcy, SR);
      dg.addColorStop(0, 'rgba(95,224,200,0)'); dg.addColorStop(1, `rgba(95,224,200,${0.1 + 0.25 * k})`);
      circle(g, pcx, pcy, SR); g.fillStyle = dg; g.fill();
    }
    drawHomePlanet(g, pcx, pcy, R);
    if (shield > 0) {
      g.lineWidth = 2 + 2 * k; g.strokeStyle = `rgba(191,247,236,${0.35 + 0.5 * k})`; circle(g, pcx, pcy, SR); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${0.3 + 0.4 * k})`; g.lineWidth = 3; g.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const a = T * 0.6 + i * 2.1; g.beginPath(); g.arc(pcx, pcy, SR - 6, a, a + 0.35); g.stroke(); }
    }
    if (flash > 0) { g.lineWidth = 8; g.strokeStyle = `rgba(255,111,168,${flash})`; circle(g, pcx, pcy, SR); g.stroke(); }
    for (const bm of beams) {
      const a = bm.life / 0.18;
      g.lineCap = 'round';
      g.strokeStyle = `rgba(95,224,200,${0.5 * a})`; g.lineWidth = 12; g.beginPath(); g.moveTo(bm.x0, bm.y0); g.lineTo(bm.x1, bm.y1); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 4; g.beginPath(); g.moveTo(bm.x0, bm.y0); g.lineTo(bm.x1, bm.y1); g.stroke();
    }
    for (const m of mets) {
      if (m.kind === 'shield') drawShieldOrb(g, m.x, m.y, m.r * 2, T);
      else drawMeteor(g, m, T);
    }
    P.draw(g); F.draw(g, w);
    g.restore();
  }
  function nearest(px, py) {
    let best = -1, bd = 1e9;
    mets.forEach((m, i) => { const d = Math.hypot(m.x - px, m.y - py); if (d < m.r + Math.max(28, m.r * 0.9) && d < bd) { bd = d; best = i; } });
    return best;
  }
  hud();
  return {
    resize, update, draw,
    down(px, py) {
      if (done) return;
      const i = nearest(px, py);
      if (i >= 0) zap(i); else P.burst(px, py, 4, ['#fff', '#5fe0c8'], { g: 0, max: 80, stars: 1, life: 0.4 });
    },
    move() {}, up() {},
    key(k, down) {
      if (!down || (k !== ' ' && k !== 'Enter')) return false;
      if (done || kbCool > 0) return true;
      let best = -1, bd = 1e9;
      mets.forEach((m, i) => { const d = Math.hypot(m.x - pcx, m.y - pcy) - (m.kind === 'shield' ? 200 : 0); if (m.y > 0 && d < bd) { bd = d; best = i; } });
      if (best >= 0) { zap(best); kbCool = 0.3; }
      return true;
    },
  };
}

/* ======================================================================
   GAME LIST + ICONS
   ====================================================================== */
function fracStars(score, meta, a, b, c) { const m = (meta && meta.max) || 1; const f = score / m; return f >= c ? 3 : f >= b ? 2 : f >= a ? 1 : 0; }
const GAMES = [
  { id: 'catch', name: 'Catch the Stars', tag: 'Slide your rocket and catch falling stars!', unit: 'points', c1: '#ff9a5a', c2: '#ff6fa8', create: createCatch,
    thresholds: [15, 35, 60],
    howTo: [['drag', 'Drag anywhere (or use the arrow keys) to slide your rocket left and right.'], ['star', 'Catch golden stars for 1 point.'], ['rainbow', 'Rainbow shooting stars are worth 5!'], ['pluto', 'Pluto hearts give you a heart back.'], ['rock', 'Dodge the grey asteroids.']] },
  { id: 'dodge', name: 'Asteroid Dodge', tag: 'Weave through the asteroid field.', unit: 'space miles', c1: '#5fe0c8', c2: '#3a7bd5', create: createDodge,
    thresholds: [250, 600, 1000],
    howTo: [['drag', 'Drag anywhere (or use the arrow keys) to steer left and right.'], ['rock', 'Dodge the asteroids.'], ['fuel', 'Grab green fuel cells to keep your engines going.'], ['rocket', 'Fly as far as you can!']] },
  { id: 'planets', name: 'Planet Line-up', tag: 'Put the planets in the right order.', unit: 'points', c1: '#ffd166', c2: '#ff7a45', create: createPlanets,
    thresholds: [40, 140, 180],
    howTo: [['sun', 'Level 1: drag the 8 planets into order, starting next to the Sun.'], ['saturn', 'Tip: My Very Excellent Mother Just Served Us Noodles!'], ['jupiter', 'Level 2: line them up by size, biggest first.'], ['clock', 'Be quick for a bigger score.']] },
  { id: 'stars', name: 'Connect the Stars', tag: 'Join the dots to find the constellations.', unit: 'points', c1: '#8f7bff', c2: '#3a2fa8', create: createStars,
    starsFor: (s, m) => fracStars(s, m, 0.45, 0.72, 0.86),
    howTo: [['glow', 'Tap the glowing star, then the next one, to draw the lines.'], ['stars', 'Finish the pattern to see the picture in the sky.'], ['clock', 'Three constellations to find. Quick taps score more!']] },
  { id: 'memory', name: 'Space Memory', tag: 'Flip the cards and find the pairs.', unit: 'points', c1: '#ff6fa8', c2: '#b04fd9', create: createMemory,
    starsFor: (s, m) => fracStars(s, m, 0.3, 0.6, 0.82),
    options: [{ label: 'Tap to start: 12 cards', value: { n: 12 } }, { label: 'Tricky: 16 cards', value: { n: 16 } }],
    howTo: [['cards', 'Tap two cards to flip them over.'], ['dog', 'Find all the matching pairs. Joules and Maggie are hiding in there!'], ['clock', 'Fewer moves means a bigger score.']] },
  { id: 'lander', name: 'Moon Lander', tag: 'Touch down gently on the Moon.', unit: 'points', c1: '#b9b4d6', c2: '#5a4fb0', create: createLander,
    thresholds: [90, 170, 235],
    howTo: [['hold', 'Hold anywhere (or press Space) to fire your thruster and slow down.'], ['lander', 'Your lander drifts towards your finger (or use the arrow keys).'], ['speed', 'Touch down while the speed meter is green.'], ['pad', 'Land on the glowing pad. Soft, central landings with fuel left score most!']] },
  { id: 'aliens', name: 'Alien Pop', tag: 'Boop the friendly aliens back home!', unit: 'points', c1: '#7bea6a', c2: '#2fb8a3', create: createAliens,
    thresholds: [25, 50, 75],
    howTo: [['alien', 'Tap the aliens when they pop up to boop them home.'], ['goldalien', 'Golden aliens are worth 5 points!'], ['dog', 'Joules and Maggie peek out too. Don\'t boop the dogs!'], ['clock', 'You have 60 seconds, and it gets faster!']] },
  { id: 'jetpack', name: 'Jetpack Joules', tag: 'Fly Joules through the space tunnel.', unit: 'points', c1: '#ffd166', c2: '#d9653b', create: createJetpack,
    thresholds: [200, 500, 1000],
    howTo: [['hold', 'Hold anywhere (or press Space) to fly up. Let go to sink.'], ['rock', 'Fly through the gaps between the asteroids.'], ['bone', 'Grab bones for 5 points and stars for 15.'], ['jetdog', 'Fly as far as you can. Joules has 3 hearts!']] },
  { id: 'jetmaggie', name: 'Jetpack Maggie', tag: 'Fly Maggie through the space tunnel.', unit: 'points', c1: '#ff9ad5', c2: '#8a4fd8', create: createJetpackMaggie,
    thresholds: [200, 500, 1000],
    howTo: [['hold', 'Hold anywhere (or press Space) to fly up. Let go to sink.'], ['rock', 'Fly through the gaps between the asteroids.'], ['bone', 'Grab bones for 5 points and stars for 15.'], ['jetmaggie', 'Fly as far as you can. Maggie has 3 hearts!']] },
  { id: 'meteors', name: 'Meteor Shower', tag: 'Zap the meteors to keep the house safe.', unit: 'points', c1: '#ff7a45', c2: '#6a3fc8', create: createMeteors,
    thresholds: [30, 80, 150],
    howTo: [['tap', 'Tap the meteors to zap them into sparkles.'], ['split', 'Pink-ringed meteors split in two. Zap both halves!'], ['shield', 'Tap a shield bubble to power up the shield.'], ['house', 'The game ends when the shield runs out.']] },
];
function drawIcon(g, kind, w, h, T) {
  const cx = w / 2, cy = h / 2, s = Math.min(w, h);
  const spr = getRocket();
  switch (kind) {
    case 'drag': {
      drawRocket(g, spr, cx, cy - s * 0.04, s * 0.66, 0, T, true);
      g.strokeStyle = '#ffd166'; g.lineWidth = s * 0.06; g.lineCap = 'round'; g.lineJoin = 'round';
      for (const d of [-1, 1]) { g.beginPath(); g.moveTo(cx + d * s * 0.3, cy); g.lineTo(cx + d * s * 0.44, cy); g.moveTo(cx + d * s * 0.37, cy - s * 0.07); g.lineTo(cx + d * s * 0.44, cy); g.lineTo(cx + d * s * 0.37, cy + s * 0.07); g.stroke(); }
      break;
    }
    case 'star': drawCuteStar(g, cx, cy, s * 0.38, 0); break;
    case 'rainbow': { starPath(g, cx, cy, s * 0.4, s * 0.18, 5, 0); const gr = g.createLinearGradient(0, 0, w, h); ['#ff6fa8', '#ffd166', '#5fe0c8', '#8fb2ff', '#b48cff'].forEach((c, i) => gr.addColorStop(i / 4, c)); g.fillStyle = gr; g.fill(); g.lineWidth = 2; g.strokeStyle = '#fff'; g.stroke(); break; }
    case 'pluto': drawPluto(g, cx, cy, s * 0.3, 0, true); break;
    case 'rock': drawRock(g, makeRockFixed(), cx, cy, 0.4, s * 0.36); break;
    case 'fuel': drawFuel(g, cx, cy, s * 0.36, 0); break;
    case 'rocket': drawRocket(g, spr, cx, cy - s * 0.06, s * 0.74, 0.2, T, true); break;
    case 'sun': drawSun(g, cx, cy, s * 0.3, 0, true); break;
    case 'saturn': drawPlanet(g, 'saturn', cx, cy, s * 0.2, true); break;
    case 'jupiter': drawPlanet(g, 'jupiter', cx, cy, s * 0.38, true); break;
    case 'clock': { circle(g, cx, cy, s * 0.36); g.fillStyle = '#fdf8ff'; g.fill(); g.lineWidth = s * 0.07; g.strokeStyle = '#5fe0c8'; g.stroke(); g.strokeStyle = '#1e1954'; g.lineWidth = s * 0.06; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy - s * 0.24); g.moveTo(cx, cy); g.lineTo(cx + s * 0.16, cy + s * 0.06); g.stroke(); break; }
    case 'glow': { g.strokeStyle = '#ffd166'; g.lineWidth = s * 0.06; circle(g, cx, cy, s * 0.3); g.stroke(); starPath(g, cx, cy, s * 0.16, s * 0.06, 4, 0); g.fillStyle = '#fff'; g.fill(); break; }
    case 'stars': { const pts = [[0.15, 0.7], [0.4, 0.45], [0.62, 0.55], [0.85, 0.25]]; g.strokeStyle = '#bff7ec'; g.lineWidth = s * 0.05; g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a * w, b * h) : g.moveTo(a * w, b * h))); g.stroke(); for (const [a, b] of pts) { starPath(g, a * w, b * h, s * 0.1, s * 0.04, 4, 0); g.fillStyle = '#fff'; g.fill(); } break; }
    case 'cards': {
      g.save(); g.translate(cx - s * 0.14, cy); g.rotate(-0.2); rr(g, -s * 0.2, -s * 0.28, s * 0.4, s * 0.56, s * 0.06); g.fillStyle = '#ff7a45'; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); g.restore();
      g.save(); g.translate(cx + s * 0.14, cy); g.rotate(0.2); rr(g, -s * 0.2, -s * 0.28, s * 0.4, s * 0.56, s * 0.06); g.fillStyle = '#2e2780'; g.fill(); g.strokeStyle = '#ffd166'; g.lineWidth = 2; g.stroke(); drawPlanet(g, 'earth', 0, 0, s * 0.12, false); g.restore();
      break;
    }
    case 'dog': drawDog(g, cx, cy, s * 0.95, 'joules'); break;
    case 'hold': {
      g.lineCap = 'round';
      for (let i = 0; i < 2; i++) { g.strokeStyle = i ? 'rgba(255,209,102,.5)' : '#ffd166'; g.lineWidth = s * 0.05; circle(g, cx, cy + s * 0.06, s * (0.2 + i * 0.13)); g.stroke(); }
      circle(g, cx, cy + s * 0.06, s * 0.11); g.fillStyle = '#fdf8ff'; g.fill();
      g.strokeStyle = '#5fe0c8'; g.lineWidth = s * 0.07; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(cx, cy - s * 0.12); g.lineTo(cx, cy - s * 0.42); g.moveTo(cx - s * 0.1, cy - s * 0.32); g.lineTo(cx, cy - s * 0.42); g.lineTo(cx + s * 0.1, cy - s * 0.32); g.stroke();
      break;
    }
    case 'lander': {
      drawLander(g, cx, cy - s * 0.02, s * 0.62, T, 0.6, 0);
      g.strokeStyle = '#ffd166'; g.lineWidth = s * 0.05; g.lineCap = 'round'; g.lineJoin = 'round';
      for (const d of [-1, 1]) { g.beginPath(); g.moveTo(cx + d * s * 0.34, cy); g.lineTo(cx + d * s * 0.46, cy); g.moveTo(cx + d * s * 0.4, cy - s * 0.06); g.lineTo(cx + d * s * 0.46, cy); g.lineTo(cx + d * s * 0.4, cy + s * 0.06); g.stroke(); }
      break;
    }
    case 'speed': {
      rr(g, cx - s * 0.12, cy - s * 0.4, s * 0.24, s * 0.8, s * 0.12); g.fillStyle = 'rgba(255,255,255,.15)'; g.fill();
      g.save(); rr(g, cx - s * 0.12, cy - s * 0.4, s * 0.24, s * 0.8, s * 0.12); g.clip();
      const gr = g.createLinearGradient(0, cy + s * 0.4, 0, cy); gr.addColorStop(0, '#4fd36a'); gr.addColorStop(1, '#a8ff8f');
      g.fillStyle = gr; g.fillRect(cx - s * 0.12, cy - s * 0.1, s * 0.24, s * 0.5); g.restore();
      g.strokeStyle = '#fff'; g.lineWidth = s * 0.05; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - s * 0.2, cy); g.lineTo(cx + s * 0.2, cy); g.stroke();
      break;
    }
    case 'pad': {
      g.beginPath(); g.moveTo(0, h); g.lineTo(0, cy + s * 0.2); g.lineTo(cx - s * 0.32, cy + s * 0.14); g.lineTo(cx + s * 0.32, cy + s * 0.14); g.lineTo(w, cy + s * 0.24); g.lineTo(w, h); g.closePath(); g.fillStyle = '#c4c1d6'; g.fill();
      drawPad(g, cx - s * 0.32, cx + s * 0.32, cy + s * 0.14, 0);
      drawLander(g, cx, cy - s * 0.16, s * 0.42, T, false, 0);
      break;
    }
    case 'alien': drawAlien(g, cx, cy + s * 0.08, s * 0.7, ALIEN_PALS[0], 2, 0, false); break;
    case 'goldalien': drawAlien(g, cx, cy + s * 0.1, s * 0.66, GOLD_PAL, 1, 0, true); break;
    case 'jetdog': drawJetDog(g, cx + s * 0.06, cy - s * 0.08, s * 0.72, T, 0.7, -0.1); break;
    case 'jetmaggie': drawJetDog(g, cx + s * 0.06, cy - s * 0.08, s * 0.72, T, 0.7, -0.1, null, 'maggie'); break;
    case 'bone': drawBone(g, cx, cy, s * 0.8, -0.4); break;
    case 'tap': {
      drawMeteor(g, { x: cx + s * 0.08, y: cy - s * 0.04, vx: 1, vy: 1.3, r: s * 0.2, rot: 0.4, kind: 'norm', rock: makeRockFixed() }, 0);
      g.fillStyle = '#fff'; for (const [a, b] of [[-0.32, 0.3], [0.32, -0.32], [-0.3, -0.26]]) { starPath(g, cx + a * s, cy + b * s, s * 0.09, s * 0.035, 4, 0); g.fill(); }
      break;
    }
    case 'split': {
      drawMeteor(g, { x: cx, y: cy - s * 0.1, vx: 0, vy: 1, r: s * 0.18, rot: 0.2, kind: 'big', rock: makeRockFixed() }, 0);
      g.strokeStyle = '#ff9fd0'; g.lineWidth = s * 0.05; g.lineCap = 'round'; g.lineJoin = 'round';
      for (const d of [-1, 1]) { g.beginPath(); g.moveTo(cx + d * s * 0.1, cy + s * 0.2); g.lineTo(cx + d * s * 0.32, cy + s * 0.4); g.moveTo(cx + d * s * 0.2, cy + s * 0.41); g.lineTo(cx + d * s * 0.32, cy + s * 0.4); g.lineTo(cx + d * s * 0.33, cy + s * 0.28); g.stroke(); }
      break;
    }
    case 'shield': drawShieldOrb(g, cx, cy, s * 0.62, 0); break;
    case 'house': {
      circle(g, cx, cy + s * 0.2, s * 0.46); g.fillStyle = 'rgba(95,224,200,.2)'; g.fill(); g.strokeStyle = '#bff7ec'; g.lineWidth = s * 0.04; g.stroke();
      drawHomePlanet(g, cx, cy + s * 0.32, s * 0.24);
      break;
    }
    default: break;
  }
}
let fixedRock = null;
function makeRockFixed() { return fixedRock || (fixedRock = { r: 1, pts: [1, 0.86, 1.02, 0.9, 0.98, 0.82, 1.04, 0.92, 0.96, 0.88], cr: [{ a: 0.5, d: 0.35, s: 0.2 }, { a: 2.6, d: 0.4, s: 0.15 }, { a: 4.2, d: 0.2, s: 0.18 }] }); }
function drawGameArt(g, id, w, h, T) {
  const s = Math.min(w, h);
  const spr = getRocket();
  if (id === 'catch') {
    drawCuteStar(g, w * 0.22, h * 0.3, s * 0.15, -0.2);
    drawCuteStar(g, w * 0.78, h * 0.22, s * 0.12, 0.2);
    drawCuteStar(g, w * 0.66, h * 0.52, s * 0.1, 0);
    drawPluto(g, w * 0.14, h * 0.7, s * 0.09, 0, true);
    drawRock(g, makeRockFixed(), w * 0.86, h * 0.68, 0.5, s * 0.12);
    drawRocket(g, spr, w * 0.45, h * 0.66, s * 0.56, 0.08, T, true);
  } else if (id === 'dodge') {
    drawRock(g, makeRockFixed(), w * 0.2, h * 0.3, 0.2, s * 0.17);
    drawRock(g, makeRockFixed(), w * 0.78, h * 0.42, 1.4, s * 0.2);
    drawRock(g, makeRockFixed(), w * 0.3, h * 0.82, 2.1, s * 0.1);
    drawFuel(g, w * 0.62, h * 0.18, s * 0.11, 0);
    drawRocket(g, spr, w * 0.5, h * 0.62, s * 0.56, -0.15, T, true);
  } else if (id === 'planets') {
    drawSun(g, -s * 0.05, h * 0.5, s * 0.36, 0, false);
    const ids = PL_ORDER, x0 = s * 0.42, sp = (w - x0 - s * 0.1) / 7;
    ids.forEach((p, i) => drawPlanet(g, p, x0 + sp * i, h * 0.5, s * (p === 'jupiter' ? 0.13 : p === 'saturn' ? 0.08 : p === 'uranus' || p === 'neptune' ? 0.08 : 0.055), false));
  } else if (id === 'stars') {
    const c = CONST[0], pr = projectConst(c);
    const xs = pr.map((p) => p.x), ys = pr.map((p) => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const sc = Math.min(w * 0.8 / (x1 - x0), h * 0.8 / (y1 - y0));
    const M = (p) => [w / 2 + (p.x - (x0 + x1) / 2) * sc, h / 2 - (p.y - (y0 + y1) / 2) * sc];
    const by = {}; pr.forEach((p) => (by[p.id] = M(p)));
    g.strokeStyle = 'rgba(191,247,236,.9)'; g.lineWidth = 2.5; g.lineCap = 'round';
    for (const path of c.paths) { g.beginPath(); path.forEach((id2, i) => (i ? g.lineTo(by[id2][0], by[id2][1]) : g.moveTo(by[id2][0], by[id2][1]))); g.stroke(); }
    pr.forEach((p) => { const m = by[p.id]; starPath(g, m[0], m[1], 6, 2.4, 4, 0); g.fillStyle = p.col; g.fill(); });
  } else if (id === 'memory') {
    const cw = s * 0.42, ch = s * 0.56;
    [['joules', -0.62, -0.12], ['back', 0, 0.06], ['saturn', 0.62, -0.08]].forEach(([f, dx, rot]) => {
      g.save(); g.translate(w / 2 + dx * cw * 1.3, h / 2); g.rotate(rot);
      rr(g, -cw / 2, -ch / 2, cw, ch, cw * 0.12);
      if (f === 'back') { const gr = g.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2); gr.addColorStop(0, '#ff7a45'); gr.addColorStop(1, '#ff6fa8'); g.fillStyle = gr; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); drawCuteStar(g, 0, 0, cw * 0.22, 0); }
      else { g.fillStyle = '#2e2780'; g.fill(); g.strokeStyle = '#ffd166'; g.lineWidth = 2; g.stroke(); drawFace(g, f, 0, 0, cw * 0.95, T, spr); }
      g.restore();
    });
  } else if (id === 'lander') {
    drawPlanet(g, 'earth', w * 0.84, h * 0.2, s * 0.09, true);
    const pts = [[0, 0.8], [0.1, 0.74], [0.2, 0.82], [0.28, 0.77], [0.36, 0.84], [0.62, 0.84], [0.7, 0.75], [0.8, 0.8], [0.9, 0.7], [1, 0.76]].map(([a, b]) => [a * w, b * h]);
    moonGround(g, pts, w, h, h * 0.7);
    drawPad(g, w * 0.36, w * 0.62, h * 0.84, 0);
    drawLander(g, w * 0.49, h * 0.47, s * 0.38, T, 0.8, 0.12);
  } else if (id === 'aliens') {
    g.beginPath(); g.moveTo(0, h * 0.42); g.quadraticCurveTo(w / 2, h * 0.3, w, h * 0.42); g.lineTo(w, h); g.lineTo(0, h); g.closePath();
    const gr = g.createLinearGradient(0, h * 0.3, 0, h); gr.addColorStop(0, '#e4e1f2'); gr.addColorStop(1, '#9a95b8'); g.fillStyle = gr; g.fill();
    const r = Math.min(w * 0.13, h * 0.2);
    [[0.2, 0.78, 'alien'], [0.5, 0.7, 'gold'], [0.8, 0.8, 'dog']].forEach(([fx, fy, k], i) => {
      const x = w * fx, y = h * fy, s2 = r * 1.35;
      drawCraterHole(g, x, y, r);
      g.save(); g.beginPath(); g.moveTo(x - r, y); g.lineTo(x - r, y - s2 * 2); g.lineTo(x + r, y - s2 * 2); g.lineTo(x + r, y); g.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI); g.closePath(); g.clip();
      const cy = y + r * 0.08 - s2 * 0.42;
      if (k === 'dog') drawDog(g, x, cy + s2 * 0.15, s2 * 1.05, 'maggie');
      else drawAlien(g, x, cy, s2, k === 'gold' ? GOLD_PAL : ALIEN_PALS[2], i ? 1 : 2, 0, k === 'gold');
      g.restore();
      drawCraterLip(g, x, y, r);
    });
  } else if (id === 'jetpack' || id === 'jetmaggie') {
    const r = s * 0.11;
    for (let i = 0; i < 3; i++) { drawRock(g, makeRockFixed(), w * 0.84, h * 0.08 + i * r * 1.5, i, r); drawRock(g, makeRockFixed(), w * 0.84, h * 0.94 - i * r * 1.5, i + 2, r); }
    drawBone(g, w * 0.84, h * 0.52, s * 0.18, 0.3);
    drawCuteStar(g, w * 0.14, h * 0.24, s * 0.08, 0);
    drawBone(g, w * 0.66, h * 0.3, s * 0.15, -0.3);
    drawJetDog(g, w * 0.44, h * 0.42, s * 0.5, T, 1, -0.15, null, id === 'jetmaggie' ? 'maggie' : 'joules');
  } else if (id === 'meteors') {
    const R = s * 0.2, cx = w / 2, cy = h - R * 0.6;
    const dg = g.createRadialGradient(cx, cy, R * 1.1, cx, cy, R * 1.62); dg.addColorStop(0, 'rgba(95,224,200,0)'); dg.addColorStop(1, 'rgba(95,224,200,.35)');
    circle(g, cx, cy, R * 1.62); g.fillStyle = dg; g.fill(); g.strokeStyle = 'rgba(191,247,236,.8)'; g.lineWidth = 3; g.stroke();
    drawHomePlanet(g, cx, cy, R);
    const rk = makeRockFixed();
    drawMeteor(g, { x: w * 0.18, y: h * 0.26, vx: 1, vy: 1.2, r: s * 0.08, rot: 0.3, kind: 'norm', rock: rk }, 0);
    drawMeteor(g, { x: w * 0.82, y: h * 0.22, vx: -0.8, vy: 1.2, r: s * 0.1, rot: 1.2, kind: 'big', rock: rk }, 0);
    drawMeteor(g, { x: w * 0.68, y: h * 0.52, vx: -0.5, vy: 1, r: s * 0.06, rot: 2, kind: 'norm', rock: rk }, 0);
    const [x0, y0] = [cx, cy - R * 0.97 - R * 0.55];
    g.lineCap = 'round'; g.strokeStyle = 'rgba(95,224,200,.5)'; g.lineWidth = 10; g.beginPath(); g.moveTo(x0, y0); g.lineTo(w * 0.18, h * 0.26); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#fff'; for (const [a, b] of [[0.13, 0.2], [0.24, 0.3], [0.17, 0.34]]) { starPath(g, w * a, h * b, 5, 2, 4, 0); g.fill(); }
  }
}

/* ======================================================================
   CSS
   ====================================================================== */
const CSS = `
.gm-root{position:fixed;inset:0;z-index:9000;background:var(--space,#0d0b2e);color:var(--ink,#fdf8ff);font-family:var(--body,${FB});font-size:18px;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}
.gm-root *{box-sizing:border-box}
.gm-root [hidden]{display:none!important}
.gm-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.gm-top{position:absolute;left:0;right:0;top:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) calc(env(safe-area-inset-right,0px) + 12px) 0 calc(env(safe-area-inset-left,0px) + 12px);pointer-events:none}
.gm-top>*{pointer-events:auto}
.gm-root button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.gm-root button:focus-visible{outline:3px solid var(--gold,#ffd166);outline-offset:3px}
.gm-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:10px 18px;border-radius:16px;font-weight:700;font-size:18px;background:rgba(255,255,255,.1);border:2px solid var(--line,rgba(255,255,255,.16))!important;color:var(--ink,#fdf8ff)}
.gm-btn:active{transform:translateY(2px)}
.gm-btn svg{width:24px;height:24px;flex:none}
.gm-close{background:var(--panel,rgba(30,25,84,.88));border-radius:999px;padding:8px 18px 8px 12px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.gm-pause{background:var(--panel,rgba(30,25,84,.88));border-radius:999px;width:52px;padding:0}
.gm-go{font-family:var(--display,${FD});font-weight:800;font-size:24px;min-height:64px;padding:12px 28px;border-radius:999px;color:#2a0f05!important;border:0!important;background:linear-gradient(180deg,#ffb084,var(--rocket,#ff7a45))!important;box-shadow:0 6px 0 var(--rocket-deep,#d9532a),0 10px 24px rgba(0,0,0,.4)}
.gm-go:active{transform:translateY(4px);box-shadow:0 2px 0 var(--rocket-deep,#d9532a)}
.gm-hud{display:flex;flex-wrap:wrap;gap:6px;margin-left:auto;align-items:center;justify-content:flex-end}
.gm-pill{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:6px 14px;border-radius:999px;background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));font-weight:700;font-size:18px;font-variant-numeric:tabular-nums;white-space:nowrap}
.gm-pill small{font-size:15px;color:var(--ink-soft,#c9c3f0);font-weight:700}
.gm-pill b{font-family:var(--display,${FD});font-size:24px;line-height:1;min-width:1.4em;text-align:right}
.gm-hearts{gap:2px;padding:6px 12px}
.gm-hearts svg{width:22px;height:22px}
.gm-meter{width:70px;height:14px;border-radius:999px;background:rgba(255,255,255,.15);overflow:hidden}
.gm-meter i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#4fd36a,#a8ff8f);transition:width .2s}
.gm-meter.low i{background:linear-gradient(90deg,#ff6fa8,#ffd166)}
.gm-layer{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 76px) calc(env(safe-area-inset-right,0px) + 16px) calc(env(safe-area-inset-bottom,0px) + 16px) calc(env(safe-area-inset-left,0px) + 16px);overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y}
.gm-layer.gm-dim{background:rgba(13,11,46,.6)}
.gm-layer.gm-top-align{align-items:flex-start}
.gm-menu{width:100%;max-width:1080px;margin:0 auto;padding-bottom:16px}
.gm-menu h1{font-family:var(--display,${FD});font-weight:800;font-size:clamp(36px,7vw,56px);line-height:1;margin:6px 0 4px;text-align:center;text-shadow:0 4px 0 rgba(0,0,0,.3)}
.gm-menu h1 em{font-style:normal;color:var(--gold,#ffd166)}
.gm-menu .gm-sub{text-align:center;color:var(--ink-soft,#c9c3f0);margin:0 0 18px;font-size:19px}
.gm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.gm-card{position:relative;display:flex;flex-direction:column;align-items:stretch;text-align:left;border-radius:26px;padding:12px 12px 16px;min-height:260px;color:var(--ink,#fdf8ff);border:3px solid rgba(255,255,255,.22)!important;box-shadow:0 8px 0 rgba(0,0,0,.25),0 14px 30px rgba(0,0,0,.35);overflow:hidden;transition:transform .15s}
.gm-card:active{transform:translateY(4px) scale(.99)}
.gm-card canvas{width:100%;height:150px;display:block;border-radius:18px;background:rgba(13,11,46,.55)}
.gm-card h2{font-family:var(--display,${FD});font-weight:800;font-size:28px;line-height:1.05;margin:12px 4px 4px}
.gm-card p{margin:0 4px;font-size:18px;line-height:1.3;color:#fff6fb}
.gm-best{display:inline-flex;align-items:center;gap:6px;margin:10px 4px 0;align-self:flex-start;padding:4px 12px;border-radius:999px;background:rgba(13,11,46,.45);font-weight:700;font-size:17px}
.gm-best svg{width:18px;height:18px}
.gm-feature{grid-column:1/-1}
.gm-feature canvas{height:190px}
.gm-feature .gm-tag{position:absolute;top:22px;left:22px;font-family:var(--display,${FD});font-weight:800;font-size:15px;letter-spacing:.1em;background:var(--gold,#ffd166);color:#3a1d00;padding:2px 12px;border-radius:999px}
@media (min-width:760px){.gm-feature{grid-column:span 2}.gm-feature canvas{height:150px}}
.gm-panel{width:100%;max-width:540px;margin:auto;background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));border-radius:28px;padding:22px 22px 24px;text-align:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 20px 50px rgba(0,0,0,.45);animation:gm-pop .25s ease-out}
.gm-panel h2{font-family:var(--display,${FD});font-weight:800;font-size:clamp(30px,6vw,40px);line-height:1.05;margin:4px 0 10px}
.gm-panel canvas.gm-art{width:100%;height:140px;display:block;border-radius:20px;background:rgba(13,11,46,.5);margin-bottom:6px}
.gm-how{list-style:none;margin:6px 0 18px;padding:0;text-align:left;display:flex;flex-direction:column;gap:8px}
.gm-how li{display:flex;align-items:center;gap:12px;font-size:19px;line-height:1.3;background:rgba(255,255,255,.05);border-radius:16px;padding:6px 12px 6px 6px}
.gm-how canvas{width:48px;height:48px;flex:none}
.gm-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:8px}
.gm-row .gm-btn{flex:1 1 200px}
.gm-hint{margin:12px 0 0;font-size:16px;color:var(--ink-soft,#c9c3f0)}
.gm-score{font-family:var(--display,${FD});font-weight:800;font-size:72px;line-height:1;color:var(--gold,#ffd166);margin:4px 0 0;text-shadow:0 4px 0 rgba(0,0,0,.3)}
.gm-unit{font-size:19px;color:var(--ink-soft,#c9c3f0);font-weight:700}
.gm-stars{display:flex;justify-content:center;gap:10px;margin:12px 0 6px}
.gm-stars svg{width:60px;height:60px;fill:rgba(255,255,255,.14);stroke:rgba(255,255,255,.25);stroke-width:1;animation:gm-starpop .5s both}
.gm-stars svg.on{fill:var(--gold,#ffd166);stroke:#d98a10;filter:drop-shadow(0 0 10px rgba(255,209,102,.7))}
.gm-stars svg:nth-child(2){animation-delay:.25s}.gm-stars svg:nth-child(3){animation-delay:.5s}
.gm-msg{font-size:21px;font-weight:700;margin:6px 0}
.gm-lines{margin:4px 0 6px;color:var(--ink-soft,#c9c3f0);font-size:18px;line-height:1.4}
.gm-bestline{display:inline-block;margin:6px 0 14px;padding:6px 16px;border-radius:999px;background:rgba(255,255,255,.08);font-weight:700}
.gm-bestline.new{background:var(--pink,#ff6fa8);color:#fff;animation:gm-wiggle 1s ease-in-out 2}
.gm-earned{font-size:18px;color:var(--heart,#ffe3c2);margin:0 0 6px}
.gm-modal{position:absolute;inset:0;z-index:6;display:flex;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 76px) calc(env(safe-area-inset-right,0px) + 16px) calc(env(safe-area-inset-bottom,0px) + 16px) calc(env(safe-area-inset-left,0px) + 16px);pointer-events:none}
.gm-modal>*{pointer-events:auto}
.gm-modal.gm-bottom{align-items:flex-end}
.gm-modal .gm-panel{max-width:620px;margin:0 auto;padding:16px 20px 18px}
.gm-modal .gm-panel h2{font-size:28px;margin:0 0 6px}
.gm-modal .gm-panel p{font-size:19px;line-height:1.4;margin:0 0 12px}
.gm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.gm-probe{position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}
@keyframes gm-pop{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
@keyframes gm-starpop{0%{transform:scale(0) rotate(-40deg)}70%{transform:scale(1.25) rotate(8deg)}100%{transform:none}}
@keyframes gm-wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-4deg)}75%{transform:rotate(4deg)}}
@media (max-width:640px){.gm-hud{order:3;flex-basis:100%;justify-content:center;margin-left:0}.gm-pause{margin-left:auto}}
@media (max-width:520px){.gm-close span{font-size:17px}.gm-pill{padding:4px 10px;min-height:48px}.gm-pill b{font-size:21px}.gm-hearts svg{width:19px;height:19px}.gm-meter{width:52px}.gm-score{font-size:60px}.gm-stars svg{width:52px;height:52px}}
@media (prefers-reduced-motion:reduce){.gm-root *{animation-duration:.01s!important;animation-iteration-count:1!important}}
`;
const ICON = {
  rocket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ff7a45" d="M12 2c3 2 4.5 5.5 4.3 10.5L18.5 15l-.4 4-2.8-1.6H8.7L5.9 19l-.4-4 2.2-2.5C7.5 7.5 9 4 12 2z"/><circle cx="12" cy="9.5" r="2.2" fill="#5fe0c8"/><path fill="#ffd166" d="M10 18.5h4l-2 3.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.9 6.4 7 .7-5.3 4.7 1.6 6.9L12 17.3l-6.2 3.6 1.6-6.9L2.1 9.3l7-.7z"/></svg>',
  heart: (on) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${on ? '#ff6fa8' : 'rgba(255,255,255,.14)'}" stroke="${on ? '#ffd0e2' : 'rgba(255,255,255,.3)'}" stroke-width="1.2" d="M12 21C5 15.5 2 12.2 2 8.6 2 5.6 4.4 3.3 7.3 3.3c1.9 0 3.6 1 4.7 2.6 1.1-1.6 2.8-2.6 4.7-2.6 2.9 0 5.3 2.3 5.3 5.3 0 3.6-3 6.9-10 12.4z"/></svg>`,
};
const BIGSTAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.9 6.4 7 .7-5.3 4.7 1.6 6.9L12 17.3l-6.2 3.6 1.6-6.9L2.1 9.3l7-.7z"/></svg>';

/* ======================================================================
   ARCADE CONTROLLER
   ====================================================================== */
let active = null;
function createArcade(opts) {
  const style = document.createElement('style'); style.setAttribute('data-gm', ''); style.textContent = CSS; document.head.appendChild(style);
  const prevFocus = document.activeElement;
  const root = document.createElement('div');
  root.className = 'gm-root'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Space Arcade');
  root.innerHTML = `<canvas class="gm-canvas" aria-hidden="true"></canvas>
    <div class="gm-top"><button class="gm-btn gm-close" type="button">${ICON.rocket}<span>Back to the rocket</span></button><div class="gm-hud" aria-live="off" hidden></div><button class="gm-btn gm-pause" type="button" aria-label="Pause" hidden>${ICON.pause}</button></div>
    <div class="gm-layer"></div><div class="gm-modal" hidden></div><div class="gm-probe"></div><div class="gm-sr" aria-live="polite"></div>`;
  document.body.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const canvas = $('.gm-canvas'), g = canvas.getContext('2d'), top = $('.gm-top'), hudEl = $('.gm-hud'), pauseBtn = $('.gm-pause'), layer = $('.gm-layer'), modalEl = $('.gm-modal'), probe = $('.gm-probe'), live = $('.gm-sr');
  let W = 0, H = 0, dpr = 1, raf = 0, last = 0, T = 0, closed = false;
  let screen = 'menu', game = null, inst = null, opt = null, paused = false, lastHud = '', ended = false;
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!closed) fn(); }, ms); timers.add(id); return id; };
  const sky = makeSky();
  const safe = { top: 80, bottom: 16, left: 0, right: 0 };
  const api = {
    sky, safe, g, keyboard: false, parts: null, floats: null, rocket: null,
    hud: renderHud,
    end: (score, meta) => endGame(score, meta),
    modal: showModal,
  };
  const pointers = new Map();

  function measure() {
    const r = root.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    const ps = getComputedStyle(probe);
    safe.left = parseFloat(ps.paddingLeft) || 0; safe.right = parseFloat(ps.paddingRight) || 0;
    safe.bottom = (parseFloat(ps.paddingBottom) || 0) + 10;
    safe.top = top.getBoundingClientRect().bottom + 8;
    if (inst) inst.resize(W, H);
  }
  function renderHud(o) {
    const parts = [];
    if (o.score != null) parts.push(`<div class="gm-pill"><small>${esc(o.label || 'Score')}</small><b>${o.score}</b></div>`);
    if (o.hearts != null) { let s = ''; for (let i = 0; i < (o.maxHearts || 3); i++) if (i < o.hearts || i < 3) s += ICON.heart(i < o.hearts); parts.push(`<div class="gm-pill gm-hearts" aria-label="${o.hearts} hearts">${s}</div>`); }
    if (o.meter != null) parts.push(`<div class="gm-pill"><small>${esc(o.meterLabel || '')}</small><span class="gm-meter${o.meter < 0.25 ? ' low' : ''}"><i style="width:${Math.round(clamp(o.meter, 0, 1) * 100)}%"></i></span></div>`);
    if (o.time != null) parts.push(`<div class="gm-pill"><small>Time</small><b>${o.time}</b></div>`);
    if (o.extra) parts.push(`<div class="gm-pill"><small>${esc(o.extra)}</small></div>`);
    const s = parts.join('');
    if (s !== lastHud) {
      const h0 = top.offsetHeight; lastHud = s; hudEl.innerHTML = s;
      if (top.offsetHeight !== h0) { safe.top = top.getBoundingClientRect().bottom + 8; if (inst) inst.resize(W, H); }
    }
  }
  function setHudVisible(v) { hudEl.hidden = !v; pauseBtn.hidden = !v; if (!v) { hudEl.innerHTML = ''; lastHud = ''; } }

  function destroyInst() { if (inst) { try { inst.destroy?.(); } catch (e) { /* ignore */ } } inst = null; hideModal(); pointers.clear(); }
  function hideModal() { modalEl.hidden = true; modalEl.innerHTML = ''; }
  function showModal(o) {
    modalEl.innerHTML = `<div class="gm-panel"><h2>${esc(o.title)}</h2><p>${esc(o.text)}</p><button type="button" class="gm-btn gm-go">${esc(o.button)}</button></div>`;
    modalEl.classList.toggle('gm-bottom', !!o.bottom);
    modalEl.hidden = false;
    live.textContent = `${o.title}. ${o.text}`;
    const b = modalEl.querySelector('button');
    b.addEventListener('click', () => { hideModal(); try { o.onGo?.(); } catch (e) { console.error(e); } });
    try { b.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  function setLayer(html, cls) {
    layer.className = 'gm-layer' + (cls ? ' ' + cls : '');
    layer.innerHTML = html; layer.hidden = !html; layer.scrollTop = 0;
  }
  function artCanvas(el, drawFn) {
    const r = el.getBoundingClientRect(); const d = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(10, r.width), h = Math.max(10, r.height);
    el.width = Math.round(w * d); el.height = Math.round(h * d);
    const c = el.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, w, h);
    try { drawFn(c, w, h); } catch (e) { console.error(e); }
  }

  function showMenu() {
    destroyInst(); screen = 'menu'; paused = false; setHudVisible(false);
    const cards = GAMES.map((gm, i) => {
      const best = getBest(gm.id), need = (() => { try { return hooks()?.gameNeed?.(gm.id) || 0; } catch (e) { return 0; } })();
      return `<button type="button" class="gm-card${i === 0 ? ' gm-feature' : ''}" data-id="${gm.id}" style="background:linear-gradient(150deg,${gm.c1},${gm.c2})">
        <canvas data-art="${gm.id}" aria-hidden="true"></canvas>${i === 0 ? '<span class="gm-tag">TOP GAME</span>' : ''}
        <h2>${need ? '🔒 ' : ''}${esc(gm.name)}</h2><p>${need ? `Earn ${need} more ⭐ to unlock this game!` : esc(gm.tag)}</p>
        <span class="gm-best">${BIGSTAR.replace('<svg', '<svg fill="#ffd166"')}${best ? `Best: ${best} ${esc(gm.unit)}` : 'Not played yet'}</span></button>`;
    }).join('');
    setLayer(`<div class="gm-menu"><h1>Space <em>Arcade</em></h1><p class="gm-sub">${esc(fillName('Pick a game, Captain Harper!'))}</p><div class="gm-grid">${cards}</div></div>`, 'gm-top-align');
    layer.querySelectorAll('[data-art]').forEach((c) => artCanvas(c, (cg, w, h) => drawGameArt(cg, c.dataset.art, w, h, 0)));
    layer.querySelectorAll('.gm-card').forEach((b) => b.addEventListener('click', () => { let need = 0; try { need = hooks()?.gameNeed?.(b.dataset.id) || 0; } catch (e) { /* ignore */ } if (need) { sfx('oops'); try { hooks()?.toast?.(`Earn ${need} more ⭐ to unlock this game!`); } catch (e) { /* ignore */ } return; } sfx('whoosh'); showIntro(b.dataset.id); }));
    const f = layer.querySelector('.gm-card'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  function showIntro(id) {
    const gm = GAMES.find((x) => x.id === id); if (!gm) return showMenu();
    destroyInst(); screen = 'intro'; game = gm; paused = false; setHudVisible(false);
    const opts2 = gm.options || [{ label: 'Tap to start', value: null }];
    const lis = gm.howTo.map(([ic, tx], i) => `<li><canvas data-ic="${ic}" aria-hidden="true"></canvas><span>${esc(tx)}</span></li>`).join('');
    const btns = opts2.map((o, i) => `<button type="button" class="gm-btn ${i === 0 ? 'gm-go' : ''}" data-opt="${i}">${esc(o.label)}</button>`).join('');
    setLayer(`<div class="gm-panel gm-intro"><canvas class="gm-art" aria-hidden="true"></canvas><h2>${esc(gm.name)}</h2><ul class="gm-how">${lis}</ul><div class="gm-row">${btns}</div>${opts2.length > 1 ? '' : '<p class="gm-hint">Tap anywhere on this card to start</p>'}</div>`, 'gm-dim');
    artCanvas(layer.querySelector('.gm-art'), (cg, w, h) => drawGameArt(cg, gm.id, w, h, 0));
    layer.querySelectorAll('[data-ic]').forEach((c) => artCanvas(c, (cg, w, h) => drawIcon(cg, c.dataset.ic, w, h, 0)));
    layer.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); start(gm.id, opts2[+b.dataset.opt].value); }));
    const panel = layer.querySelector('.gm-panel');
    panel.addEventListener('click', () => start(gm.id, opts2[0].value));
    const b0 = layer.querySelector('[data-opt="0"]'); if (b0) try { b0.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  function start(id, o) {
    const gm = GAMES.find((x) => x.id === id); if (!gm) return;
    destroyInst(); game = gm; opt = o; screen = 'play'; paused = false; ended = false;
    setLayer('', ''); setHudVisible(true);
    api.parts = makeParts(); api.floats = makeFloats(); api.rocket = getRocket(); api.keyboard = false;
    measure();
    inst = gm.create(api, o);
    measure();
    sfx('whoosh');
    try { canvas.focus?.(); } catch (e) { /* ignore */ }
  }
  function endGame(score, meta) {
    if (ended || screen !== 'play') return;
    ended = true; meta = meta || {};
    score = Math.max(0, Math.round(score));
    const prev = recordScore(game.id, score);
    const isNew = score > prev && score > 0;
    const stars = clamp(game.starsFor ? game.starsFor(score, meta) : (game.thresholds || [1, 2, 3]).filter((th) => score >= th).length, 0, 3);
    if (stars > 0) { try { hooks()?.addStars?.(stars, `${game.name}: ${score} ${game.unit}`, game.id); } catch (e) { /* ignore */ } }
    sfx(stars >= 2 || isNew ? 'happy' : 'chime');
    if (isNew && prev > 0) say('dad', `New best score, Harper! ${score}!`);
    else if (stars === 3) say('mum', 'Three stars! You are a space ace!');
    else if (stars === 0) say('leo', 'Good practice, Commander. Have another go!');
    showResults(score, prev, isNew, stars, meta);
  }
  function showResults(score, prev, isNew, stars, meta) {
    screen = 'results'; hideModal(); setHudVisible(false);
    const msgs = ['Good try! Every space explorer starts somewhere.', fillName('Nice flying, Harper!'), 'Brilliant! Super space skills!', 'WOW! A three-star space ace!'];
    let st = ''; for (let i = 0; i < 3; i++) st += BIGSTAR.replace('<svg', `<svg class="${i < stars ? 'on' : ''}"`);
    const lines = (meta.lines || []).filter(Boolean).map(esc).join('<br>');
    const best = Math.max(prev, score);
    setLayer(`<div class="gm-panel gm-results"><h2>${esc(meta.title || game.name)}</h2>
      <div class="gm-score">${score}</div><div class="gm-unit">${esc(game.unit)}</div>
      <div class="gm-stars" aria-label="${stars} of 3 stars">${st}</div>
      <p class="gm-msg">${msgs[stars]}</p>
      ${stars ? `<p class="gm-earned">You earned ${stars} reward star${stars === 1 ? '' : 's'}!</p>` : ''}
      ${lines ? `<p class="gm-lines">${lines}</p>` : ''}
      <div class="gm-bestline${isNew ? ' new' : ''}">${isNew ? (prev > 0 ? 'New best score!' : 'Your first score!') : `Best: ${best} ${esc(game.unit)}`}</div>
      <div class="gm-row"><button type="button" class="gm-btn gm-go" data-act="again">Play again</button><button type="button" class="gm-btn" data-act="arcade">Back to arcade</button></div></div>`, 'gm-dim');
    live.textContent = `${score} ${game.unit}. ${stars} stars.`;
    layer.querySelector('[data-act="again"]').addEventListener('click', () => start(game.id, opt));
    layer.querySelector('[data-act="arcade"]').addEventListener('click', showMenu);
    try { layer.querySelector('[data-act="again"]').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  function pause() {
    if (screen !== 'play' || paused || ended) return;
    paused = true; pointers.clear();
    try { inst?.key?.('ArrowLeft', false); inst?.key?.('ArrowRight', false); } catch (e) { /* ignore */ }
    setLayer(`<div class="gm-panel"><h2>Paused</h2><p class="gm-msg">Take a breather, Captain!</p><div class="gm-row"><button type="button" class="gm-btn gm-go" data-act="resume">Keep playing</button><button type="button" class="gm-btn" data-act="arcade">Back to arcade</button></div></div>`, 'gm-dim');
    layer.querySelector('[data-act="resume"]').addEventListener('click', resume);
    layer.querySelector('[data-act="arcade"]').addEventListener('click', showMenu);
    try { layer.querySelector('[data-act="resume"]').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  function resume() { if (!paused) return; paused = false; setLayer('', ''); last = 0; }

  function frame(ts) {
    if (closed) return;
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; T += dt;
    const frozen = paused || hooksPaused();
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    try {
      if (inst && (screen === 'play' || screen === 'results')) {
        if (screen === 'play' && !frozen) inst.update(dt, T);
        inst.draw(g, W, H, T);
      } else {
        if (!frozen) sky.update(dt, 30, H);
        sky.draw(g, W, H, T);
      }
    } catch (e) { console.error(e); }
  }

  function local(e) { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function onDown(e) {
    if (screen !== 'play' || paused || !inst) return;
    e.preventDefault(); api.keyboard = false;
    try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    pointers.set(e.pointerId, true);
    const [x, y] = local(e); inst.down?.(x, y, e.pointerId);
  }
  function onMove(e) {
    if (screen !== 'play' || paused || !inst) return;
    const [x, y] = local(e); inst.move?.(x, y, pointers.has(e.pointerId) || e.pointerType === 'mouse' && e.buttons > 0);
  }
  function onUp(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (screen !== 'play' || !inst) return;
    const [x, y] = local(e); inst.up?.(x, y, e.pointerId);
  }
  function onKey(e) {
    if (closed) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (screen === 'play' && !paused && inst && !(e.target && e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) && modalEl.hidden) {
      api.keyboard = true;
      if (inst.key?.(e.key, true)) e.preventDefault();
      return;
    }
    if (screen === 'intro' && (e.key === 'Enter' || e.key === ' ') && !(e.target && e.target.tagName === 'BUTTON')) { e.preventDefault(); start(game.id, (game.options && game.options[0].value) || null); }
  }
  function onKeyUp(e) { if (screen === 'play' && inst) inst.key?.(e.key, false); }
  function onVis() { if (document.hidden) pause(); }
  function onResize() { measure(); if (screen === 'menu' || screen === 'intro') layer.querySelectorAll('canvas[data-art], canvas.gm-art').forEach((c) => artCanvas(c, (cg, w, h) => drawGameArt(cg, c.dataset.art || game.id, w, h, 0))); }
  function onBlur() { if (inst) { try { inst.key?.('ArrowLeft', false); inst.key?.('ArrowRight', false); } catch (e) { /* ignore */ } } }
  const ctxMenu = (e) => e.preventDefault();

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('lostpointercapture', onUp);
  root.addEventListener('contextmenu', ctxMenu);
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  window.addEventListener('blur', onBlur);
  document.addEventListener('visibilitychange', onVis);
  let ro = null;
  try { ro = new ResizeObserver(() => measure()); ro.observe(root); } catch (e) { /* ignore */ }
  $('.gm-close').addEventListener('click', () => close());
  pauseBtn.addEventListener('click', pause);

  function close() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    destroyInst();
    for (const id of timers) clearTimeout(id); timers.clear();
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
    window.removeEventListener('blur', onBlur);
    document.removeEventListener('visibilitychange', onVis);
    try { ro?.disconnect(); } catch (e) { /* ignore */ }
    root.remove(); style.remove();
    if (active === handle) active = null;
    try { prevFocus?.focus?.({ preventScroll: true }); } catch (e) { /* ignore */ }
    try { opts.onClose?.(); } catch (e) { console.error(e); }
  }
  const handle = { close };
  measure();
  if (opts.startWith && GAMES.some((x) => x.id === opts.startWith)) showIntro(opts.startWith); else showMenu();
  raf = requestAnimationFrame(frame);
  later(() => { measure(); if (screen === 'menu') layer.querySelectorAll('[data-art]').forEach((c) => artCanvas(c, (cg, w, h) => drawGameArt(cg, c.dataset.art, w, h, 0))); }, 400);
  return handle;
}

function open(opts) {
  if (active) active.close();
  active = createArcade(opts || {});
  return active;
}
window.Games = { open };
})();
