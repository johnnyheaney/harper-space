/* Harper's Space Adventure: Inside the rocket.
   Public API: window.Cabin = { open({ onClose, captain, travelling, place, rocketName, crew }) } -> { close() }
   A cosy 2D cutaway of the family rocket: the crew float in zero gravity, with bunks, a space-food galley,
   an exercise bike, a little greenhouse and a bathroom. All art is procedural canvas drawing. */
(function () {
'use strict';

const TAU = Math.PI * 2;
const FD = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif';
const FB = '"Atkinson Hyperlegible", Verdana, system-ui, sans-serif';
const INK = '#2a1f5c';
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wrapA = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };

/* ======================================================================
   LINES. Every fixed spoken line lives here as a literal ['who', 'text'] pair.
   'who' is the crew member who says it. "Harper" always means the player.
   ====================================================================== */
const WELCOME_LINES = [
  ['dad', 'Welcome inside the rocket, Captain Harper!'],
  ['mum', 'Float about and have fun, everyone!'],
  ['oda', 'We can fly inside the rocket!'],
];
const TAP_LINES = [
  ['harper', 'Look at me, I’m flying!'],
  ['harper', 'Watch me do a space somersault!'],
  ['harper', 'My hair is floating everywhere!'],
  ['harper', 'Zero gravity is the best thing ever!'],
  ['harper', 'I can float upside down!'],
  ['dad', 'Careful, Captain Harper, gently does it!'],
  ['dad', 'This is better than a bouncy castle!'],
  ['dad', 'Who wants to race to the window?'],
  ['dad', 'Floating is great for my back!'],
  ['mum', 'Who wants a space cuddle?'],
  ['mum', 'Everything floats up here, even my hair!'],
  ['mum', 'Harper, you’re a brilliant floater!'],
  ['mum', 'Don’t forget to hold on to the handrails!'],
  ['oda', 'I can do a somersault!'],
  ['oda', 'Again! Again!'],
  ['oda', 'I’m a floaty fairy!'],
  ['oda', 'Look, I’m upside down!'],
  ['oda', 'Weee! I’m a star!'],
  ['joules', 'Woof!'],
  ['joules', 'Woof woof!'],
  ['joules', 'Arf! Arf!'],
  ['maggie', 'Woof!'],
  ['maggie', 'Wuff wuff!'],
  ['maggie', 'Yip yip!'],
];
const FLING_LINES = [
  ['harper', 'Whoooosh!'],
  ['harper', 'Wheee! Spin me again!'],
  ['dad', 'Woah, here I go!'],
  ['mum', 'Wheeeee!'],
  ['oda', 'Faster! Faster!'],
  ['oda', 'Again! Throw me again!'],
  ['joules', 'Woof woof woof!'],
  ['maggie', 'Arf! Wuff!'],
];
const NIGHT_LINES = [
  ['dad', 'Sleep tight, space crew!'],
  ['dad', 'Night night. Don’t let the space bugs bite!'],
  ['mum', 'Sweet dreams, my little astronauts.'],
  ['mum', 'Snuggle into your sleeping bags!'],
  ['harper', 'Night night, everyone!'],
  ['harper', 'My sleeping bag is so cosy!'],
  ['oda', 'Goodnight, moon! Goodnight, stars!'],
  ['oda', 'Night night! Can I have a story?'],
];
const LEO_NIGHT = [
  ['leo', 'Goodnight, crew! Astronauts zip into sleeping bags tied to the wall, so they don’t float away in their sleep.'],
  ['leo', 'Sleep well! The space station goes round the Earth about sixteen times a day, so astronauts wear eye masks to block out all those sunrises.'],
  ['leo', 'Night night! In space there’s no up or down, so astronauts can sleep any way up they like.'],
  ['leo', 'Goodnight! Astronauts sleep near a fan, so the air they breathe out doesn’t gather round their heads.'],
];
const SLEEPY_LINES = [
  ['harper', 'Zzz... five more minutes...'],
  ['dad', 'Mmm... is it morning yet?'],
  ['mum', 'Shh... go back to sleep, love.'],
  ['oda', 'Zzz... I’m dreaming about planets...'],
  ['joules', 'Zzz...'],
  ['maggie', 'Zzz...'],
];
const MORNING_LINES = [
  ['dad', 'Good morning, space crew!'],
  ['mum', 'Rise and shine! Who wants breakfast?'],
  ['harper', 'Good morning! I slept floating!'],
  ['oda', 'Is it breakfast time?'],
];
const LEO_MORNING = [
  ['leo', 'Good morning, crew! Time for breakfast, then exercise.'],
  ['leo', 'Rise and shine! Astronauts wake up to music from Mission Control.'],
];
const EAT_LINES = [
  ['harper', 'Yum! Space food is amazing!'],
  ['harper', 'Mmm, that was delicious!'],
  ['harper', 'Thank you! My tummy is happy.'],
  ['dad', 'Delicious! Compliments to the chef!'],
  ['dad', 'Mmm, just like home cooking!'],
  ['mum', 'Yummy! Thank you, sweetheart.'],
  ['mum', 'Lovely! That really hit the spot.'],
  ['oda', 'Yummy yummy in my tummy!'],
  ['oda', 'More please!'],
  ['oda', 'Nom nom nom!'],
  ['joules', 'Woof! Yum!'],
  ['maggie', 'Woof woof! More!'],
];
const REFUSE_LINES = [
  ['harper', 'Eww, that’s dog food! Here, doggies!'],
  ['dad', 'Ha! That’s dog food, silly. Let’s give it to the dogs!'],
  ['mum', 'That’s doggy dinner. Let’s give it to the dogs!'],
  ['oda', 'That’s doggy dinner!'],
];
const DOG_SNIFF = [
  ['joules', 'Sniff sniff... woof?'],
  ['maggie', 'Sniff sniff... wuff?'],
];
const GALLEY_LINES = [
  ['mum', 'Snack time! Pick some space food.'],
  ['dad', 'Who’s hungry? The galley is open!'],
];
const BIKE_LINES = [
  ['harper', 'Pedal power! Look how fast I’m going!'],
  ['dad', 'Phew! Space exercise is hard work!'],
  ['mum', 'The strap keeps me on the seat. Clever!'],
  ['oda', 'I’m riding a space bike!'],
];
const LEO_BIKE = [
  ['leo', 'Great pedalling! Astronauts exercise for about two hours every day to keep their muscles and bones strong.'],
  ['leo', 'In space, muscles don’t have to hold you up, so astronauts exercise every day to stay strong for coming home.'],
];
const PLANT_LINES = [
  ['oda', 'Look, it’s growing!'],
  ['harper', 'Our space garden is getting bigger!'],
  ['mum', 'I love our little greenhouse.'],
  ['dad', 'Fresh salad, coming soon!'],
];
const LEO_PLANT = [
  ['leo', 'Astronauts have grown lettuce, chilli peppers and even flowers on the space station!'],
  ['leo', 'In space, plants can’t feel which way is down, so they grow towards the light instead.'],
];
const WINDOW_TRAVEL_LINES = [
  ['harper', 'The stars are whizzing past!'],
  ['dad', 'Next stop, adventure!'],
  ['oda', 'Are we nearly there yet?'],
  ['mum', 'What a view!'],
];
const WINDOW_STAY_LINES = [
  ['harper', 'I can see the planet out of the window!'],
  ['oda', 'Hello, planet! I’m waving!'],
  ['dad', 'Look out of the window, everyone!'],
  ['mum', 'What a beautiful view!'],
];
const PANEL_LINES = [
  ['dad', 'Autopilot is on. Everything is looking good, Captain Harper!'],
  ['mum', 'All the lights are green. The rocket is happy!'],
  ['leo', 'Mission Control here. Your rocket is working perfectly!'],
];
/* Bathroom */
const SINK_LINES = [
  ['oda', 'Look, the water is making balls!'],
  ['harper', 'The water floats like wobbly jelly!'],
  ['dad', 'Catch the water blobs before they float away!'],
  ['mum', 'Tap a water blob to pop it!'],
];
const BATH_LINES = [
  ['oda', 'Splish splash! The water is flying!'],
  ['harper', 'The bath water is floating away!'],
  ['dad', 'Ha ha! The water is escaping!'],
  ['mum', 'Oh no, the bath is floating off!'],
];
const LAUGH_LINES = [
  ['harper', 'Ha ha ha! A giant water bubble!'],
  ['oda', 'Hee hee hee! Catch it, doggies!'],
  ['mum', 'Ha ha, look at the dogs!'],
  ['dad', 'Ha ha! Water everywhere!'],
];
const DOG_CHASE = [
  ['joules', 'Woof! Woof!'],
  ['maggie', 'Wuff! Gotcha!'],
  ['joules', 'Slurp!'],
  ['maggie', 'Slurp slurp!'],
];
const SHOWER_LINES = [
  ['harper', 'Zip me up! It’s a shower in a bag!'],
  ['oda', 'It tickles! The hose is slurping!'],
  ['dad', 'Best shower in the solar system!'],
  ['mum', 'Ooh, the hose sucks all the water away!'],
];
const LEO_WATER = [
  ['leo', 'In space, water doesn’t fall down. It sticks together and floats about in wobbly blobs.'],
  ['leo', 'Astronauts brush their teeth with a little water, then swallow the toothpaste or spit it into a cloth.'],
  ['leo', 'Astronauts on the space station wash with wet cloths and special shampoo that doesn’t need rinsing.'],
];
const LEO_BATH = [
  ['leo', 'There’s no bath or shower on the International Space Station. The water would float out of the tub in giant wobbly blobs!'],
  ['leo', 'Astronauts on the space station wash with wet cloths and special shampoo that doesn’t need rinsing.'],
];
const LEO_SHOWER = [
  ['leo', 'In the 1970s, the Skylab space station had a fold-up shower. A vacuum hose sucked the water away so it couldn’t float off.'],
  ['leo', 'There’s no shower on the International Space Station, so astronauts wash with wet cloths and no-rinse shampoo.'],
];

/* Space food. Each fact is a literal ['leo', 'fact'] pair, read aloud with speak(). */
const FOODS = [
  { id: 'wrap', name: 'Tortilla wrap', mess: 'crumb', few: true, col: ['#e9c77f', '#c8963f'], fact: ['leo', 'Astronauts eat tortilla wraps instead of bread, because bread makes crumbs, and floating crumbs can get into eyes and machines.'] },
  { id: 'tube', name: 'Food tube', mess: 'blob', few: true, col: ['#9fe08a', '#5fae4c'], fact: ['leo', 'The very first astronauts squeezed their food out of tubes, like toothpaste! Today most space food comes in pouches and tins instead.'] },
  { id: 'icecream', name: 'Astronaut ice cream', mess: 'crumb', col: ['#ff9ec4', '#fff0d6', '#8a5a3c'], fact: ['leo', 'Crunchy freeze-dried astronaut ice cream was made for space, but real astronauts hardly ever eat it up there. Most of it is eaten by visitors to museums!'] },
  { id: 'drink', name: 'Drink pouch', mess: 'blob', col: ['#ffb347', '#ff8a1f'], fact: ['leo', 'Drinks can’t be poured in space! Astronauts sip from a pouch through a straw, and any spilled drops float about as wobbly balls.'] },
  { id: 'mac', name: 'Macaroni cheese', mess: 'blob', few: true, col: ['#ffd166', '#f0a93a'], fact: ['leo', 'Lots of space meals are dried to make them light. Astronauts add hot water to bring them back to life, like this macaroni cheese!'] },
  { id: 'prawn', name: 'Prawn cocktail', mess: 'blob', few: true, col: ['#ff8a7a', '#e2463a'], fact: ['leo', 'Prawn cocktail, called shrimp cocktail in America, is a favourite space food. Its spicy sauce helps, because food can taste a bit dull in space.'] },
  { id: 'fruit', name: 'Fresh fruit', mess: 'blob', few: true, col: ['#ff6b6b', '#ffa94d'], fact: ['leo', 'Fresh fruit is a special treat in space. It only arrives when a cargo ship visits, so astronauts eat it quickly before it goes off.'] },
  { id: 'kibble', name: 'Space kibble', mess: 'crumb', dog: true, col: ['#a0663a', '#6b3f1f'], fact: ['leo', 'No dogs live on the space station, but in 1960 two dogs called Belka and Strelka flew round the Earth and came home safely!'] },
];
const FOOD = Object.fromEntries(FOODS.map((f) => [f.id, f]));

/* ---------------- hooks (all wrapped, everything works without them) ---------------- */
function hooks() { return window.GameHooks || null; }
function fillName(t) { try { const h = hooks(); return h && h.fill ? h.fill(t) : t; } catch (e) { return t; } }
function hookSay(who, text) { try { hooks()?.say?.(who, text); } catch (e) { /* ignore */ } }
function hookSpeak(text, who) { try { const h = hooks(); if (h && h.speak) return Promise.resolve(h.speak(text, who)).catch(() => {}); } catch (e) { /* ignore */ } return Promise.resolve(); }
function hookStop() { try { hooks()?.stopSpeaking?.(); } catch (e) { /* ignore */ } }
const sfxLast = {};
function sfx(name, gap) {
  const now = performance.now();
  if (sfxLast[name] && now - sfxLast[name] < (gap || 90)) return;
  sfxLast[name] = now;
  try { hooks()?.sfx?.(name); } catch (e) { /* ignore */ }
}
function isMuted() { try { const s = JSON.parse(localStorage.getItem('harper-space-v2') || 'null'); return !!(s && s.muted); } catch (e) { return false; } }

/* ---------------- drawing helpers ---------------- */
function rr(g, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
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
  g.beginPath(); g.moveTo(x, y + s * 0.62);
  g.bezierCurveTo(x - s * 1.15, y - s * 0.05, x - s * 0.62, y - s * 0.95, x, y - s * 0.38);
  g.bezierCurveTo(x + s * 0.62, y - s * 0.95, x + s * 1.15, y - s * 0.05, x, y + s * 0.62);
  g.closePath();
}
function text(g, s, x, y, size, color, align, opts) {
  opts = opts || {};
  g.font = `${opts.weight || 800} ${size}px ${opts.font || FD}`;
  g.textAlign = align || 'center'; g.textBaseline = opts.base || 'middle';
  if (opts.outline) { g.lineJoin = 'round'; g.lineWidth = Math.max(3, size * 0.2); g.strokeStyle = opts.stroke || 'rgba(16,10,52,.9)'; g.strokeText(s, x, y); }
  g.fillStyle = color; g.fillText(s, x, y);
}
function wrapLines(g, txt, maxW) {
  const words = String(txt).split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (cur && g.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
function hexRgb(h) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(h || '').trim());
  if (!m) return [143, 123, 255];
  let s = m[1]; if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function shade(h, k) {
  const c = hexRgb(h), t = k < 0 ? 0 : 255, a = Math.abs(k);
  return `rgb(${c.map((v) => Math.round(v + (t - v) * a)).join(',')})`;
}
function capsule(g, x1, y1, x2, y2, w, fill, outline) {
  g.lineCap = 'round';
  if (outline) { g.strokeStyle = outline; g.lineWidth = w + Math.max(2, w * 0.28); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  g.strokeStyle = fill; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
}
function rivet(g, x, y, r) {
  circle(g, x, y, r); g.fillStyle = '#d9d4f2'; g.fill();
  g.lineWidth = Math.max(1, r * 0.4); g.strokeStyle = 'rgba(42,31,92,.45)'; g.stroke();
  circle(g, x - r * 0.3, y - r * 0.3, r * 0.35); g.fillStyle = '#fff'; g.fill();
}
function legIK(hx, hy, fx, fy, L1, L2, bend) {
  let dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy) || 0.001; const maxd = (L1 + L2) * 0.999;
  if (d > maxd) { fx = hx + (dx / d) * maxd; fy = hy + (dy / d) * maxd; dx = fx - hx; dy = fy - hy; d = maxd; }
  const a = Math.atan2(dy, dx), A = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const ka = a - bend * A;
  return [hx + Math.cos(ka) * L1, hy + Math.sin(ka) * L1, fx, fy];
}

/* ---------------- food art: drawn in a 100-unit box centred on (0,0) ---------------- */
function pouch(g, body, top, label) {
  rr(g, -30, -38, 60, 78, 14); g.fillStyle = body; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
  g.fillStyle = top; rr(g, -30, -38, 60, 16, 10); g.fill();
  g.strokeStyle = 'rgba(42,31,92,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-30, -22); g.lineTo(30, -22); g.stroke();
  if (label) { rr(g, -20, 6, 40, 22, 6); g.fillStyle = 'rgba(255,255,255,.85)'; g.fill(); }
}
function drawFood(g, id, x, y, s, rot) {
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(s / 100, s / 100);
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (id === 'wrap') {
    g.rotate(-0.5);
    rr(g, -42, -20, 84, 40, 20); g.fillStyle = '#f2d391'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.fillStyle = 'rgba(176,112,40,.55)'; [[-20, -6], [4, 8], [-6, -10], [18, -4], [-28, 8]].forEach(([a, b]) => { ell(g, a, b, 4, 3); g.fill(); });
    ell(g, 40, 0, 12, 20); g.fillStyle = '#fbe7b6'; g.fill(); g.stroke();
    ell(g, 40, -4, 6, 8); g.fillStyle = '#5fbf4c'; g.fill(); ell(g, 42, 6, 5, 6); g.fillStyle = '#ff6b6b'; g.fill();
  } else if (id === 'tube') {
    g.rotate(0.35);
    g.beginPath(); g.moveTo(-20, -30); g.lineTo(20, -30); g.lineTo(26, 34); g.lineTo(-26, 34); g.closePath();
    const gr = g.createLinearGradient(-26, 0, 26, 0); gr.addColorStop(0, '#b9b6cc'); gr.addColorStop(0.45, '#f4f2ff'); gr.addColorStop(1, '#a9a6c0');
    g.fillStyle = gr; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    rr(g, -28, 32, 56, 10, 3); g.fillStyle = '#d6d3e8'; g.fill(); g.stroke();
    rr(g, -10, -46, 20, 16, 4); g.fillStyle = '#ff6b6b'; g.fill(); g.stroke();
    rr(g, -18, -10, 36, 26, 5); g.fillStyle = '#5fae4c'; g.fill();
    g.fillStyle = '#fff'; g.font = `800 13px ${FD}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FOOD', 0, 3);
  } else if (id === 'icecream') {
    g.rotate(-0.15);
    rr(g, -36, -40, 72, 80, 10); const gr = g.createLinearGradient(-36, 0, 36, 0); gr.addColorStop(0, '#c9c6dc'); gr.addColorStop(0.5, '#fbfaff'); gr.addColorStop(1, '#b8b4cf');
    g.fillStyle = gr; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.save(); rr(g, -24, -24, 48, 52, 6); g.clip();
    g.fillStyle = '#ff9ec4'; g.fillRect(-24, -24, 48, 18); g.fillStyle = '#fff3dc'; g.fillRect(-24, -6, 48, 17); g.fillStyle = '#8a5a3c'; g.fillRect(-24, 11, 48, 17);
    g.fillStyle = 'rgba(255,255,255,.5)'; [[-14, -16], [8, 0], [-4, 18], [14, -14]].forEach(([a, b]) => { circle(g, a, b, 2.5); g.fill(); });
    g.restore(); rr(g, -24, -24, 48, 52, 6); g.lineWidth = 3; g.stroke();
    starPath(g, 0, -33, 6, 3, 5, 0); g.fillStyle = '#ffd166'; g.fill();
  } else if (id === 'drink') {
    g.rotate(0.12);
    pouch(g, '#ffb347', '#ffe0b0', true);
    g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(10, -38); g.lineTo(18, -58); g.stroke();
    g.strokeStyle = '#5fe0c8'; g.lineWidth = 5; g.beginPath(); g.moveTo(10, -38); g.lineTo(18, -58); g.stroke();
    rr(g, 4, -46, 16, 7, 3); g.fillStyle = '#ff6fa8'; g.fill();
    circle(g, 0, 17, 8); g.fillStyle = '#ffd166'; g.fill(); g.strokeStyle = '#f0a93a'; g.lineWidth = 2; g.stroke();
  } else if (id === 'mac') {
    pouch(g, '#7cc6ff', '#d8efff', false);
    g.save(); rr(g, -22, -16, 44, 48, 10); g.fillStyle = '#fff6d8'; g.fill(); g.clip();
    g.strokeStyle = '#f0a93a'; g.lineWidth = 6;
    [[-12, -6], [6, -8], [-4, 8], [12, 10], [-14, 20], [4, 24]].forEach(([a, b], i) => { g.beginPath(); g.arc(a, b, 6, i * 0.7, i * 0.7 + 3.4); g.stroke(); });
    g.restore(); rr(g, -22, -16, 44, 48, 10); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  } else if (id === 'prawn') {
    pouch(g, '#c3f0e6', '#ffffff', false);
    g.save(); rr(g, -22, -16, 44, 48, 10); g.fillStyle = '#ffe9e4'; g.fill(); g.clip();
    ell(g, 0, 26, 24, 12); g.fillStyle = '#e2463a'; g.fill();
    [[-8, 0, 0.3], [8, 6, -0.4], [-2, 16, 0.1]].forEach(([a, b, r]) => {
      g.save(); g.translate(a, b); g.rotate(r); g.strokeStyle = '#ff8a7a'; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 8, 0.4, 3.6); g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 8, 1.2, 1.3); g.arc(0, 0, 8, 2.2, 2.3); g.stroke(); g.restore();
    });
    g.restore(); rr(g, -22, -16, 44, 48, 10); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  } else if (id === 'fruit') {
    circle(g, 18, 10, 22); g.fillStyle = '#ffa94d'; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.35)'; circle(g, 12, 2, 6); g.fill();
    g.beginPath(); g.moveTo(-14, -18); g.bezierCurveTo(-46, -24, -46, 30, -12, 34); g.bezierCurveTo(8, 34, 18, 6, 4, -14); g.bezierCurveTo(-2, -22, -8, -18, -14, -18); g.closePath();
    g.fillStyle = '#ff5a5f'; g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.45)'; ell(g, -24, -4, 5, 9, 0.3); g.fill();
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-8, -17); g.lineTo(-4, -32); g.stroke();
    ell(g, 6, -30, 10, 5, -0.4); g.fillStyle = '#5fbf4c'; g.fill(); g.lineWidth = 3; g.stroke();
  } else if (id === 'kibble') {
    pouch(g, '#ffd3a8', '#fff2e3', false);
    g.save(); g.translate(0, 8);
    g.fillStyle = '#a0663a'; g.strokeStyle = INK; g.lineWidth = 3;
    g.beginPath(); g.arc(-12, -6, 6, 0, TAU); g.arc(-12, 6, 6, 0, TAU); g.fill();
    g.beginPath(); g.arc(12, -6, 6, 0, TAU); g.arc(12, 6, 6, 0, TAU); g.fill(); g.fillRect(-12, -4, 24, 8);
    g.restore();
    g.fillStyle = '#8a5530'; [[-30, 36], [26, 40], [36, 26]].forEach(([a, b]) => { ell(g, a, b, 6, 5); g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); });
  }
  g.restore();
}

/* ---------------- planets out of the window ---------------- */
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function planetLook(name) {
  const n = String(name || '').toLowerCase();
  const T = [
    ['earth', ['#2f7de1', '#4fc36a', '#ffffff'], 'earth'], ['mars', ['#d9643a', '#a8402a', '#f3a477'], 'rock'],
    ['moon', ['#c9c6d6', '#8f8ca6', '#eceaf5'], 'rock'], ['sun', ['#ffd166', '#ff9a3c', '#fff3b0'], 'sun'],
    ['jupiter', ['#e3b98a', '#b8784a', '#f6e4c8'], 'bands'], ['saturn', ['#f0d79a', '#cfa762', '#fff2cc'], 'ring'],
    ['venus', ['#f1d08a', '#d9a352', '#fff0c0'], 'bands'], ['mercury', ['#aaa4a0', '#77716e', '#d6d0cc'], 'rock'],
    ['uranus', ['#9be6ea', '#6fcfd6', '#d4fbfc'], 'ring'], ['neptune', ['#4f7cff', '#2f4fc4', '#a8c0ff'], 'bands'],
    ['pluto', ['#e6cfb0', '#a68866', '#fff2df'], 'rock'],
  ];
  for (const [k, c, st] of T) if (n.includes(k)) return { c, st };
  const h = hashStr(n), hue = h % 360;
  return { c: [`hsl(${hue},70%,60%)`, `hsl(${(hue + 25) % 360},60%,42%)`, `hsl(${hue},85%,82%)`], st: ['bands', 'rock', 'ring'][h % 3] };
}
function paintPlanet(g, x, y, R, look) {
  const [c0, c1, c2] = look.c;
  if (look.st === 'sun') {
    const gl = g.createRadialGradient(x, y, R * 0.5, x, y, R * 1.6); gl.addColorStop(0, 'rgba(255,209,102,.6)'); gl.addColorStop(1, 'rgba(255,209,102,0)');
    g.fillStyle = gl; circle(g, x, y, R * 1.6); g.fill();
  }
  if (look.st === 'ring') { g.save(); g.translate(x, y); g.rotate(-0.35); ell(g, 0, 0, R * 1.75, R * 0.42); g.lineWidth = R * 0.16; g.strokeStyle = c2; g.globalAlpha = 0.85; g.stroke(); g.restore(); }
  g.save(); circle(g, x, y, R); g.clip();
  const gr = g.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.1, x, y, R * 1.05); gr.addColorStop(0, c2); gr.addColorStop(0.45, c0); gr.addColorStop(1, c1);
  g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2);
  const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  if (look.st === 'bands' || look.st === 'ring') {
    for (let i = 0; i < 9; i++) { g.globalAlpha = 0.28; g.fillStyle = i % 2 ? c1 : c2; const yy = y - R + (i + rnd() * 0.5) * (R * 2 / 9); ell(g, x, yy, R * 1.2, R * (0.04 + rnd() * 0.05)); g.fill(); }
  } else if (look.st === 'earth') {
    g.globalAlpha = 1; g.fillStyle = c1;
    for (let i = 0; i < 6; i++) { ell(g, x + (rnd() - 0.5) * R * 1.5, y + (rnd() - 0.5) * R * 1.5, R * (0.18 + rnd() * 0.25), R * (0.12 + rnd() * 0.2), rnd() * 3); g.fill(); }
    g.globalAlpha = 0.7; g.fillStyle = c2;
    for (let i = 0; i < 7; i++) { ell(g, x + (rnd() - 0.5) * R * 1.8, y + (rnd() - 0.5) * R * 1.8, R * (0.15 + rnd() * 0.2), R * 0.05, rnd() * 0.6 - 0.3); g.fill(); }
  } else if (look.st === 'rock') {
    for (let i = 0; i < 10; i++) { const cx = x + (rnd() - 0.5) * R * 1.6, cy = y + (rnd() - 0.5) * R * 1.6, cr = R * (0.05 + rnd() * 0.12); g.globalAlpha = 0.35; g.fillStyle = c1; circle(g, cx, cy, cr); g.fill(); g.globalAlpha = 0.3; g.fillStyle = c2; circle(g, cx - cr * 0.25, cy - cr * 0.25, cr * 0.55); g.fill(); }
  }
  g.globalAlpha = 1;
  if (look.st !== 'sun') { const sh = g.createLinearGradient(x - R, y - R, x + R, y + R); sh.addColorStop(0.55, 'rgba(10,6,40,0)'); sh.addColorStop(1, 'rgba(10,6,40,.6)'); g.fillStyle = sh; g.fillRect(x - R, y - R, R * 2, R * 2); }
  g.restore();
  if (look.st === 'ring') { g.save(); g.translate(x, y); g.rotate(-0.35); g.beginPath(); g.ellipse(0, 0, R * 1.75, R * 0.42, 0, 0, Math.PI); g.lineWidth = R * 0.16; g.strokeStyle = c2; g.globalAlpha = 0.85; g.stroke(); g.restore(); }
  g.globalAlpha = 1;
}

/* ======================================================================
   CSS
   ====================================================================== */
const CSS = `
.cb-root{position:fixed;inset:0;z-index:9000;background:var(--space,#0d0b2e);color:var(--ink,#fdf8ff);font-family:var(--body,${FB});font-size:18px;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}
.cb-root *{box-sizing:border-box}
.cb-root:focus{outline:none}
.cb-root [hidden]{display:none!important}
.cb-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.cb-top{position:absolute;left:0;right:0;top:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) calc(env(safe-area-inset-right,0px) + 12px) 0 calc(env(safe-area-inset-left,0px) + 12px);pointer-events:none}
.cb-top>*{pointer-events:auto}
:where(.cb-root) button{font-family:inherit;font-size:inherit;line-height:inherit;color:inherit;cursor:pointer;border:0;background:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.cb-root button:focus-visible{outline:3px solid var(--gold,#ffd166);outline-offset:3px}
.cb-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:10px 18px;border-radius:999px;font-weight:700;font-size:18px;background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16))!important;color:var(--ink,#fdf8ff);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 4px 14px rgba(0,0,0,.3)}
.cb-btn:active{transform:translateY(2px)}
.cb-btn svg{width:26px;height:26px;flex:none}
.cb-close{padding:8px 18px 8px 12px;background:var(--panel-solid,#1e1954)!important}
.cb-acts{display:flex;gap:8px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}
.cb-act{font-family:var(--display,${FD});font-weight:800;font-size:19px;padding:8px 18px}
.cb-act b{font-size:24px;line-height:1}
.cb-act.food{background:linear-gradient(180deg,#8ff0dc,var(--teal,#5fe0c8))!important;color:#0b3a33!important;border-color:rgba(255,255,255,.5)!important}
.cb-act.bed{background:linear-gradient(180deg,#ffe39a,var(--gold,#ffd166))!important;color:#3a2600!important;border-color:rgba(255,255,255,.5)!important}
.cb-act.bed.night{background:linear-gradient(180deg,#ffb084,var(--rocket,#ff7a45))!important;color:#2a0f05!important}
.cb-tray{position:absolute;z-index:6;left:calc(env(safe-area-inset-left,0px) + 10px);right:calc(env(safe-area-inset-right,0px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 10px);margin:0 auto;max-width:1040px;background:var(--panel,rgba(30,25,84,.92));border:2px solid var(--line,rgba(255,255,255,.16));border-radius:26px;padding:10px 12px 12px;box-shadow:0 14px 40px rgba(0,0,0,.45);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:cb-up .25s ease-out}
.cb-tray-head{display:flex;align-items:center;gap:10px;margin:0 4px 8px}
.cb-tray-head h2{font-family:var(--display,${FD});font-weight:800;font-size:24px;margin:0;line-height:1;white-space:nowrap}
.cb-tray-head p{margin:0;font-size:16px;color:var(--ink-soft,#c9c3f0);line-height:1.25;flex:1}
.cb-x{width:48px;height:48px;border-radius:999px;background:rgba(255,255,255,.1)!important;font-size:22px;font-weight:800;flex:none;display:inline-flex;align-items:center;justify-content:center}
.cb-foods{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px}
.cb-food{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;min-height:96px;padding:6px 4px;border-radius:18px;background:rgba(255,255,255,.08)!important;border:3px solid transparent!important;touch-action:none;font-size:14px;font-weight:700;line-height:1.1;text-align:center}
.cb-food canvas{width:58px;height:58px;display:block;pointer-events:none}
.cb-food span{pointer-events:none}
.cb-food.sel{border-color:var(--gold,#ffd166)!important;background:rgba(255,209,102,.18)!important}
.cb-card{position:absolute;z-index:7;right:calc(env(safe-area-inset-right,0px) + 16px);width:min(440px,calc(100vw - 32px));background:#fff;color:#231a4f;border-radius:22px;padding:12px 14px 12px 16px;box-shadow:0 10px 30px rgba(0,0,0,.45);animation:cb-pop .22s ease-out}
.cb-card h3{font-family:var(--display,${FD});font-weight:800;font-size:22px;margin:0 0 4px;line-height:1.1}
.cb-card p{margin:0 0 8px;font-size:17px;line-height:1.35}
.cb-card .cb-row{display:flex;gap:8px;justify-content:flex-end}
.cb-card button{min-height:48px;padding:6px 16px;border-radius:999px;font-weight:800;font-size:17px;background:#efeaff!important;color:#231a4f!important}
.cb-card button.cb-read{background:linear-gradient(180deg,#8ff0dc,#5fe0c8)!important;color:#0b3a33!important}
.cb-toast{position:absolute;z-index:8;left:50%;top:calc(env(safe-area-inset-top,0px) + 84px);transform:translateX(-50%);background:#fff;color:#231a4f;font-weight:800;font-size:19px;padding:12px 22px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.4);max-width:calc(100vw - 40px);text-align:center;animation:cb-pop .25s ease-out;pointer-events:none}
.cb-hint{position:absolute;z-index:4;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);transform:translateX(-50%);background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));padding:8px 18px;border-radius:999px;font-weight:700;font-size:17px;max-width:calc(100vw - 40px);text-align:center;pointer-events:none;transition:opacity .8s}
.cb-hint.gone{opacity:0}
.cb-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.cb-probe{position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}
@keyframes cb-pop{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
.cb-toast{animation:none}
@keyframes cb-up{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
@media (max-width:760px){.cb-foods{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.cb-food{min-height:74px;font-size:12px;padding:4px 2px}.cb-food canvas{width:40px;height:40px}.cb-card{padding:10px 12px}.cb-card h3{font-size:19px}.cb-card p{font-size:15px;margin-bottom:6px}.cb-tray{padding:8px 8px 10px}.cb-tray-head h2{font-size:21px}.cb-tray-head p{font-size:14px}}
@media (max-width:520px){.cb-close span{font-size:16px}.cb-act{font-size:16px;padding:6px 12px}.cb-act b{font-size:20px}.cb-btn{min-height:48px}.cb-hint{font-size:15px}.cb-card p{font-size:16px}}
@media (prefers-reduced-motion:reduce){.cb-root *{animation-duration:.01s!important;animation-iteration-count:1!important;transition:none!important}}
`;
const ICON_ROCKET = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ff7a45" d="M12 2c3 2 4.5 5.5 4.3 10.5L18.5 15l-.4 4-2.8-1.6H8.7L5.9 19l-.4-4 2.2-2.5C7.5 7.5 9 4 12 2z"/><circle cx="12" cy="9.5" r="2.2" fill="#5fe0c8"/><path fill="#ffd166" d="M10 18.5h4l-2 3.5z"/></svg>';

/* ======================================================================
   CABIN CONTROLLER
   ====================================================================== */
let active = null;
function createCabin(opts) {
  const style = document.createElement('style'); style.setAttribute('data-cb', ''); style.textContent = CSS; document.head.appendChild(style);
  const prevFocus = document.activeElement;
  const root = document.createElement('div');
  root.className = 'cb-root'; root.tabIndex = -1; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Inside the rocket');
  root.innerHTML = `<canvas class="cb-canvas" aria-hidden="true"></canvas>
    <div class="cb-top"><button class="cb-btn cb-close" type="button">${ICON_ROCKET}<span>Back to the rocket</span></button>
      <div class="cb-acts"><button class="cb-btn cb-act food" type="button" data-act="food"><b>🍽️</b><span>Space food</span></button><button class="cb-btn cb-act bed" type="button" data-act="bed"><b>🌙</b><span>Bedtime</span></button></div></div>
    <div class="cb-hint">Drag the crew to float them about! Tap the beds, food, bike, plant or bathroom.</div>
    <div class="cb-tray" hidden><div class="cb-tray-head"><h2>Space food</h2><p class="cb-tray-tip">Drag a food to someone, or tap a food and then tap who gets it.</p><button type="button" class="cb-x" aria-label="Close the food tray">✕</button></div><div class="cb-foods"></div></div>
    <div class="cb-card" hidden><h3></h3><p></p><div class="cb-row"><button type="button" class="cb-read">🔊 Read it to me</button><button type="button" class="cb-cardx" aria-label="Close the fact">✕</button></div></div>
    <div class="cb-toast" hidden></div><div class="cb-probe"></div><div class="cb-sr" aria-live="polite"></div>`;
  document.body.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const canvas = $('.cb-canvas'), g = canvas.getContext('2d'), topBar = $('.cb-top'), probe = $('.cb-probe'), live = $('.cb-sr');
  const trayEl = $('.cb-tray'), foodsEl = $('.cb-foods'), tipEl = $('.cb-tray-tip'), cardEl = $('.cb-card'), toastEl = $('.cb-toast'), hintEl = $('.cb-hint');
  const bedBtn = root.querySelector('[data-act="bed"]'), foodBtn = root.querySelector('[data-act="food"]');

  const captain = opts.captain === 'oda' ? 'oda' : 'harper';
  const travelling = !!opts.travelling;
  const placeName = String(opts.place || 'Space');
  const rocketName = String(opts.rocketName || 'HARPER').toUpperCase().slice(0, 14);
  let reduced = false; try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }

  let W = 1, H = 1, dpr = 1, raf = 0, last = 0, T = 0, closed = false, u = 50;
  const safe = { l: 0, r: 0, t: 0, b: 0 };
  let L = null; let staticCv = null; let planetCv = null;
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!closed) { try { fn(); } catch (e) { console.error(e); } } }, ms); timers.add(id); return id; };

  /* ---------- crew ---------- */
  const bubbles = new Map(); // who -> {text, t, dur}
  const crew = (Array.isArray(opts.crew) ? opts.crew : []).filter((c) => c && c.id).map((c, i) => ({
    id: String(c.id), name: String(c.name || c.id), dog: !!c.dog, small: !!c.small, adult: !!c.adult,
    shirt: /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(c.shirt || '').trim()) ? '#' + String(c.shirt).trim().replace('#', '') : ['#ff6fa8', '#3f8fe0', '#5fe0c8', '#ffd166'][i % 4],
    head: c.head && c.head.width ? c.head : null,
    scale: c.dog ? 0.82 : c.small ? 0.8 : c.adult ? 1.12 : 0.96,
    x: 0, y: 0, vx: rand(-30, 30), vy: rand(-30, 30), rot: rand(-0.3, 0.3), vr: rand(-0.3, 0.3), dir: Math.random() < 0.5 ? -1 : 1,
    f1: rand(0.25, 0.5), f2: rand(0.2, 0.45), p1: rand(0, TAU), p2: rand(0, TAU),
    mode: 'float', held: false, eating: null, modeT: 0, slot: -1, zT: rand(0, 1), placed: false, chaseUntil: 0, lastBump: 0, k: 40, R: 30,
  }));
  const byId = (id) => crew.find((c) => c.id === id);
  const humans = () => crew.filter((c) => !c.dog);
  const dogs = () => crew.filter((c) => c.dog);
  const roleFor = (id) => (captain === 'oda' ? (id === 'harper' ? 'oda' : id === 'oda' ? 'harper' : id) : id);
  // bed order: parents on the top bunks, girls below, dogs in their baskets
  (function assignSlots() {
    const order = ['dad', 'mum', 'harper', 'oda'];
    const hs = humans().sort((a, b) => (order.indexOf(a.id) + 1 || 9) - (order.indexOf(b.id) + 1 || 9));
    hs.forEach((c, i) => { c.slot = i < 4 ? i : -1; });
    dogs().forEach((c, i) => { c.slot = i < 2 ? 4 + i : -1; });
  })();

  /* ---------- world state ---------- */
  let night = false, nightK = 0, selectedFood = null, trayOpen = false, cardFood = null;
  const flying = []; // foods in flight
  const parts = [];
  let bikeAng = 0, plantLevel = 1, plantPop = 0, panelBlip = 0;
  let sinkFlow = 0, sinkEmit = 0, leoLast = -99, waterFact = 0;
  let bath = { water: 1, big: null }, showerZip = 0;
  let toastTimer = 0;
  const glowStars = []; for (let i = 0; i < 22; i++) glowStars.push({ x: Math.random(), y: Math.random(), s: rand(0.6, 1.2), p: rand(0, TAU) });
  const winStars = []; for (let i = 0; i < 90; i++) winStars.push({ a: rand(0, TAU), d: Math.random(), s: rand(0.4, 1), x: rand(-1, 1), y: rand(-1, 1) });

  /* ---------- talking ---------- */
  function bubble(who, txt, dur) { bubbles.set(who, { text: fillName(txt), t: 0, dur: dur || (2.6 + String(txt).length * 0.05) }); }
  function talk(id, txt, opts2) {
    if (!txt) return;
    const c = byId(id);
    bubble(id, txt);
    if (c && c.dog && night) return; // sleepy dogs stay quiet
    if (opts2 && opts2.cut) hookStop();
    hookSay(c && c.dog ? id : roleFor(id), txt);
  }
  function talkLine(line, cut) { if (line) talk(line[0], line[1], { cut }); }
  function linesFor(arr, id) { return arr.filter((l) => l[0] === id); }
  function pickLine(arr, id) { const p = linesFor(arr, id); return p.length ? pick(p) : null; }
  function leo(arr, cut) { const l = pick(arr); leoLast = T; bubble('leo', l[1], 3 + l[1].length * 0.055); if (cut) hookStop(); hookSay('leo', l[1]); }
  function leoMaybe(arr, after) { if (T - leoLast < 9) return; leoLast = T; later(() => leo(arr), after || 1800); }
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false; live.textContent = msg;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { if (!closed) toastEl.hidden = true; }, 3000);
  }
  const awakeFree = (c) => c.mode === 'float' && !c.held && !c.eating;

  /* ---------- sizing ---------- */
  function measure() {
    const r = root.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    const ps = getComputedStyle(probe);
    safe.l = parseFloat(ps.paddingLeft) || 0; safe.r = parseFloat(ps.paddingRight) || 0; safe.t = parseFloat(ps.paddingTop) || 0; safe.b = parseFloat(ps.paddingBottom) || 0;
    layout(); buildStatic();
    for (const c of crew) {
      c.k = u * c.scale; c.R = (c.dog ? 0.78 : 0.82) * c.k;
      if (!c.placed) { const b = L.c; c.x = b.x + b.w * rand(0.3, 0.7); c.y = b.y + b.h * rand(0.3, 0.7); c.placed = true; }
      const bd = bounds(c); c.x = clamp(c.x, bd.l, bd.r); c.y = clamp(c.y, bd.t, bd.b);
    }
    placeCard();
  }
  function layout() {
    const hx = safe.l + 6, hy = safe.t + 6, hw = W - safe.l - safe.r - 12, hh = H - safe.t - safe.b - 12;
    const wall = clamp(Math.min(W, H) * 0.022, 9, 18);
    const hull = { x: hx, y: hy, w: hw, h: hh, rad: Math.min(hw, hh) * 0.14, wall };
    const ix = hx + wall, iy = hy + wall, iw = hw - wall * 2, ih = hh - wall * 2;
    const barB = topBar.getBoundingClientRect().bottom;
    const pad = clamp(Math.min(iw, ih) * 0.02, 6, 16);
    const y0 = Math.max(iy + pad, barB + 6);
    const c = { x: ix + pad, y: y0, w: iw - pad * 2, h: iy + ih - pad - y0 };
    const land = W >= H * 1.05;
    const Lx = { hull, inner: { x: ix, y: iy, w: iw, h: ih }, c, land };
    if (land) {
      u = clamp(Math.min(c.w * 0.55, c.h) * 0.105, 30, 74);
      Lx.bunks = { x: c.x, y: c.y, w: c.w * 0.245, h: c.h };
      const r = Math.min(c.w * 0.13, c.h * 0.22);
      Lx.win = { x: c.x + c.w * 0.5, y: c.y + r + c.h * 0.025, r };
      Lx.plant = { x: c.x + c.w * 0.265, y: c.y + c.h * 0.03, w: Math.min(c.w * 0.085, Lx.win.x - r - c.x - c.w * 0.275), h: c.h * 0.3 };
      const pw = Math.max(r * 2.5, c.w * 0.3);
      Lx.panel = { x: Lx.win.x - pw / 2, y: Lx.win.y + r + c.h * 0.035, w: pw, h: c.h * 0.12 };
      const by = Lx.panel.y + Lx.panel.h + c.h * 0.04;
      Lx.bath = { x: c.x + c.w * 0.275, y: by, w: c.w * 0.45, h: c.y + c.h - by };
      Lx.galley = { x: c.x + c.w * 0.755, y: c.y, w: c.w * 0.245, h: c.h * 0.52 };
      Lx.bike = { x: c.x + c.w * 0.755, y: c.y + c.h * 0.58, w: c.w * 0.245, h: c.h * 0.42 };
    } else {
      u = clamp(Math.min(c.w, c.h) * 0.105, 28, 70);
      const r = Math.min(c.w * 0.24, c.h * 0.12);
      Lx.win = { x: c.x + c.w * 0.5, y: c.y + r + 4, r };
      Lx.plant = { x: c.x, y: c.y + 2, w: Math.min(c.w * 0.2, Lx.win.x - r - c.x - 8), h: r * 1.7 };
      Lx.panel = { x: c.x + c.w * 0.19, y: Lx.win.y + r + 8, w: c.w * 0.62, h: Math.max(44, c.h * 0.07) };
      const y1 = Lx.panel.y + Lx.panel.h + c.h * 0.02, rem = c.y + c.h - y1;
      Lx.bunks = { x: c.x, y: y1, w: c.w * 0.48, h: rem * 0.5 };
      Lx.galley = { x: c.x + c.w * 0.52, y: y1, w: c.w * 0.48, h: rem * 0.24 };
      Lx.bike = { x: c.x + c.w * 0.52, y: y1 + rem * 0.26, w: c.w * 0.48, h: rem * 0.24 };
      Lx.bath = { x: c.x, y: y1 + rem * 0.53, w: c.w, h: rem * 0.47 };
    }
    // bunk slots
    const bu = Lx.bunks, head = Math.min(30, bu.h * 0.08), th = bu.h * 0.7;
    Lx.bunkHead = head;
    Lx.slots = [];
    for (let rI = 0; rI < 2; rI++) for (let cI = 0; cI < 2; cI++) {
      const cell = { x: bu.x + (cI * bu.w) / 2, y: bu.y + head + (rI * (th - head)) / 2, w: bu.w / 2, h: (th - head) / 2 };
      const bw = Math.min(cell.w * 0.66, cell.h * 0.55);
      Lx.slots.push({ x: cell.x + (cell.w - bw) / 2, y: cell.y + cell.h * 0.34, w: bw, h: cell.h * 0.6, cell });
    }
    for (let i = 0; i < 2; i++) {
      const cw = bu.w / 2, cy = bu.y + th + (bu.h - th) * 0.5;
      const rr0 = Math.min(cw * 0.38, (bu.h - th) * 0.4);
      Lx.slots.push({ dog: true, cx: bu.x + cw * (i + 0.5), cy, r: rr0 });
    }
    // bathroom sub areas
    const ba = Lx.bath, bh = Math.min(28, ba.h * 0.13);
    Lx.bathHead = bh;
    const iy2 = ba.y + bh + 4, ih2 = ba.h - bh - 8;
    Lx.sink = { x: ba.x + ba.w * 0.03, y: iy2, w: ba.w * 0.23, h: ih2 };
    Lx.tub = { x: ba.x + ba.w * 0.285, y: iy2, w: ba.w * 0.42, h: ih2 };
    Lx.shower = { x: ba.x + ba.w * 0.74, y: iy2, w: ba.w * 0.23, h: ih2 };
    L = Lx;
  }
  function bounds(c) {
    const ci = L.inner, m = c ? c.R * 0.7 : 0;
    let bot = ci.y + ci.h - m;
    if (trayOpen) { const tr = trayEl.getBoundingClientRect(); if (tr.height) bot = Math.min(bot, tr.top - m - 4); }
    return { l: ci.x + m, r: ci.x + ci.w - m, t: L.c.y + m * 0.8, b: Math.max(L.c.y + m * 0.8 + 10, bot) };
  }

  /* ---------- static layer: hull, walls, rails, bunk wall, galley cupboard ---------- */
  function buildStatic() {
    staticCv = staticCv || document.createElement('canvas');
    staticCv.width = Math.round(W * dpr); staticCv.height = Math.round(H * dpr);
    const s = staticCv.getContext('2d'); s.setTransform(dpr, 0, 0, dpr, 0, 0);
    s.clearRect(0, 0, W, H);
    // outside space
    s.fillStyle = '#0d0b2e'; s.fillRect(0, 0, W, H);
    const rnd = (() => { let q = 11; return () => ((q = (q * 16807) % 2147483647) / 2147483647); })();
    for (let i = 0; i < 120; i++) { s.globalAlpha = 0.3 + rnd() * 0.7; s.fillStyle = '#fff'; circle(s, rnd() * W, rnd() * H, 0.5 + rnd() * 1.4); s.fill(); }
    s.globalAlpha = 1;
    const { hull, inner } = L;
    // outer hull skin
    rr(s, hull.x, hull.y, hull.w, hull.h, hull.rad);
    const hg = s.createLinearGradient(0, hull.y, 0, hull.y + hull.h); hg.addColorStop(0, '#f2efff'); hg.addColorStop(1, '#c9c2ee');
    s.fillStyle = hg; s.fill(); s.lineWidth = 4; s.strokeStyle = INK; s.stroke();
    // orange insulation stripe
    rr(s, hull.x + hull.wall * 0.45, hull.y + hull.wall * 0.45, hull.w - hull.wall * 0.9, hull.h - hull.wall * 0.9, hull.rad - hull.wall * 0.45);
    s.lineWidth = hull.wall * 0.28; s.strokeStyle = '#ff7a45'; s.stroke();
    // rivets around the hull
    const per = 2 * (hull.w + hull.h), n = Math.floor(per / 46);
    for (let i = 0; i < n; i++) {
      let d = (i / n) * per, x, y; const m = hull.wall * 0.22;
      if (d < hull.w) { x = hull.x + d; y = hull.y + m; } else if ((d -= hull.w) < hull.h) { x = hull.x + hull.w - m; y = hull.y + d; } else if ((d -= hull.h) < hull.w) { x = hull.x + hull.w - d; y = hull.y + hull.h - m; } else { d -= hull.w; x = hull.x + m; y = hull.y + hull.h - d; }
      if ((x - hull.x < hull.rad && (y - hull.y < hull.rad || hull.y + hull.h - y < hull.rad)) || (hull.x + hull.w - x < hull.rad && (y - hull.y < hull.rad || hull.y + hull.h - y < hull.rad))) continue;
      rivet(s, x, y, Math.max(2, hull.wall * 0.16));
    }
    // inner cabin wall
    const irad = Math.max(10, hull.rad - hull.wall);
    rr(s, inner.x, inner.y, inner.w, inner.h, irad);
    const wg = s.createLinearGradient(0, inner.y, 0, inner.y + inner.h); wg.addColorStop(0, '#fbf7ff'); wg.addColorStop(1, '#e4dcfb');
    s.fillStyle = wg; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
    s.save(); rr(s, inner.x, inner.y, inner.w, inner.h, irad); s.clip();
    // soft ceiling light pools
    const lamps = L.land ? 4 : 2;
    for (let i = 0; i < lamps; i++) {
      const lx = inner.x + inner.w * ((i + 0.5) / lamps), ly = inner.y + 4;
      const lg = s.createRadialGradient(lx, ly, 4, lx, ly, inner.h * 0.55); lg.addColorStop(0, 'rgba(255,240,200,.55)'); lg.addColorStop(1, 'rgba(255,240,200,0)');
      s.fillStyle = lg; s.fillRect(inner.x, inner.y, inner.w, inner.h);
    }
    // wall panel seams with tiny rivets
    s.strokeStyle = 'rgba(120,100,190,.16)'; s.lineWidth = 2;
    const pw = Math.max(90, inner.w / Math.round(inner.w / 140));
    for (let x = inner.x + pw; x < inner.x + inner.w - 10; x += pw) { s.beginPath(); s.moveTo(x, inner.y); s.lineTo(x, inner.y + inner.h); s.stroke(); }
    for (let y = inner.y + inner.h / 3; y < inner.y + inner.h - 10; y += inner.h / 3) { s.beginPath(); s.moveTo(inner.x, y); s.lineTo(inner.x + inner.w, y); s.stroke(); }
    for (let x = inner.x + pw; x < inner.x + inner.w - 10; x += pw) for (let y = inner.y + inner.h / 3; y < inner.y + inner.h - 10; y += inner.h / 3) { circle(s, x, y, 2.4); s.fillStyle = 'rgba(120,100,190,.3)'; s.fill(); }
    s.restore();
    // ceiling lamps
    for (let i = 0; i < lamps; i++) {
      const lx = inner.x + inner.w * ((i + 0.5) / lamps), lw = Math.min(70, inner.w * 0.08);
      rr(s, lx - lw / 2, inner.y + 2, lw, 9, 4.5); s.fillStyle = '#fff6d8'; s.fill(); s.lineWidth = 2; s.strokeStyle = 'rgba(42,31,92,.35)'; s.stroke();
    }
    // handrails (yellow bars on posts)
    const rail = (x1, y1, x2, y2) => {
      const t = Math.max(5, u * 0.11);
      s.lineCap = 'round';
      [[x1 + (x2 - x1) * 0.12, y1 + (y2 - y1) * 0.12], [x1 + (x2 - x1) * 0.88, y1 + (y2 - y1) * 0.88]].forEach(([px, py]) => { const dx = y2 - y1, dy = x1 - x2, dl = Math.hypot(dx, dy) || 1; capsule(s, px, py, px + (dx / dl) * t * 1.5, py + (dy / dl) * t * 1.5, t * 0.6, '#b7b0d8', INK); });
      capsule(s, x1, y1, x2, y2, t, '#ffd166', INK);
      s.strokeStyle = 'rgba(255,255,255,.6)'; s.lineWidth = t * 0.3; s.beginPath(); s.moveTo(x1 + 2, y1 - t * 0.15); s.lineTo(x2 - 2, y2 - t * 0.15); s.stroke();
    };
    const W0 = L.win;
    rail(W0.x - W0.r * 0.9, W0.y - W0.r - u * 0.32, W0.x + W0.r * 0.9, W0.y - W0.r - u * 0.32);
    if (L.land) { rail(L.bunks.x + L.bunks.w + u * 0.12, L.c.y + L.c.h * 0.45, L.bunks.x + L.bunks.w + u * 0.12, L.c.y + L.c.h * 0.75); rail(L.galley.x - u * 0.14, L.c.y + L.c.h * 0.15, L.galley.x - u * 0.14, L.c.y + L.c.h * 0.42); }
    else { rail(L.c.x + L.c.w * 0.3, L.bath.y - u * 0.18, L.c.x + L.c.w * 0.7, L.bath.y - u * 0.18); }
    drawBunkWall(s); drawGalley(s); drawBathRoom(s);
    // planet art in the window
    planetCv = null;
    if (!travelling) {
      const r = W0.r; planetCv = document.createElement('canvas'); planetCv.width = Math.round(r * 2 * dpr); planetCv.height = Math.round(r * 2 * dpr);
      const p = planetCv.getContext('2d'); p.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintPlanet(p, r * 1.18, r * 1.25, r * 0.78, planetLook(placeName));
    }
  }
  function sign(s, x, y, w, h, label, bg, fg) {
    rr(s, x, y, w, h, h / 2); s.fillStyle = bg; s.fill(); s.lineWidth = 2.5; s.strokeStyle = INK; s.stroke();
    let fs = Math.min(h * 0.62, 20); s.font = `800 ${fs}px ${FD}`;
    while (fs > 9 && s.measureText(label).width > w - 12) { fs -= 1; s.font = `800 ${fs}px ${FD}`; }
    text(s, label, x + w / 2, y + h / 2 + 1, fs, fg);
  }
  function drawBunkWall(s) {
    const b = L.bunks;
    rr(s, b.x, b.y, b.w, b.h, 22); s.fillStyle = '#d9d1fb'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
    s.save(); rr(s, b.x, b.y, b.w, b.h, 22); s.clip();
    s.strokeStyle = 'rgba(255,255,255,.5)'; s.lineWidth = 2;
    for (let x = b.x + 14; x < b.x + b.w; x += 18) { s.beginPath(); s.moveTo(x, b.y); s.lineTo(x - 30, b.y + b.h); s.stroke(); }
    s.restore();
    sign(s, b.x + b.w * 0.15, b.y + 4, b.w * 0.7, Math.max(20, L.bunkHead - 6), 'BUNKS', '#2a1f5c', '#ffd166');
  }
  function drawGalley(s) {
    const a = L.galley;
    rr(s, a.x, a.y, a.w, a.h, 20);
    const gg = s.createLinearGradient(a.x, 0, a.x + a.w, 0); gg.addColorStop(0, '#e9e6f7'); gg.addColorStop(0.5, '#ffffff'); gg.addColorStop(1, '#d6d1ec');
    s.fillStyle = gg; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
    const hh = Math.max(22, Math.min(30, a.h * 0.12));
    sign(s, a.x + a.w * 0.12, a.y + 5, a.w * 0.76, hh, 'GALLEY', '#5fe0c8', '#0b3a33');
    const top = a.y + hh + 12, rows = 2, cols = 4, gh = a.h - hh - 18 - Math.min(26, a.h * 0.12);
    const cw = (a.w - 16) / cols, ch = gh / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = a.x + 8 + c * cw, y = top + r * ch, f = FOODS[r * cols + c];
      rr(s, x + 2, y + 2, cw - 4, ch - 4, 10); s.fillStyle = '#f3f0ff'; s.fill(); s.lineWidth = 2; s.strokeStyle = 'rgba(42,31,92,.4)'; s.stroke();
      drawFood(s, f.id, x + cw / 2, y + ch / 2, Math.min(cw, ch) * 0.78, 0);
      // stretchy net
      s.save(); rr(s, x + 2, y + 2, cw - 4, ch - 4, 10); s.clip(); s.strokeStyle = 'rgba(95,224,200,.55)'; s.lineWidth = 1.5;
      for (let k = -ch; k < cw + ch; k += 9) { s.beginPath(); s.moveTo(x + k, y); s.lineTo(x + k + ch, y + ch); s.stroke(); s.beginPath(); s.moveTo(x + k + ch, y); s.lineTo(x + k, y + ch); s.stroke(); }
      s.restore();
    }
    // hot water dispenser
    const dy = a.y + a.h - Math.min(26, a.h * 0.12) - 2;
    rr(s, a.x + a.w * 0.1, dy, a.w * 0.8, Math.min(22, a.h * 0.1), 8); s.fillStyle = '#ff7a45'; s.fill(); s.lineWidth = 2; s.strokeStyle = INK; s.stroke();
    text(s, 'Tap for snacks!', a.x + a.w / 2, dy + Math.min(22, a.h * 0.1) / 2 + 1, Math.min(14, a.w * 0.07), '#fff');
  }
  function drawBathRoom(s) {
    const b = L.bath;
    rr(s, b.x, b.y, b.w, b.h, 22); s.fillStyle = '#d4f4ff'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
    s.save(); rr(s, b.x, b.y, b.w, b.h, 22); s.clip();
    const t = Math.max(16, u * 0.36); s.strokeStyle = 'rgba(255,255,255,.85)'; s.lineWidth = 2;
    for (let x = b.x; x < b.x + b.w; x += t) { s.beginPath(); s.moveTo(x, b.y); s.lineTo(x, b.y + b.h); s.stroke(); }
    for (let y = b.y; y < b.y + b.h; y += t) { s.beginPath(); s.moveTo(b.x, y); s.lineTo(b.x + b.w, y); s.stroke(); }
    s.restore();
    sign(s, b.x + b.w * 0.3, b.y + 4, b.w * 0.4, Math.max(18, L.bathHead - 6), 'BATHROOM', '#3f8fe0', '#fff');
    // sink: mirror, basin, tap, toothbrush cup
    const k = L.sink;
    rr(s, k.x + k.w * 0.15, k.y + 2, k.w * 0.7, k.h * 0.34, 12); s.fillStyle = '#e8fbff'; s.fill(); s.lineWidth = 2.5; s.strokeStyle = INK; s.stroke();
    s.strokeStyle = 'rgba(255,255,255,.95)'; s.lineWidth = 3; s.beginPath(); s.moveTo(k.x + k.w * 0.3, k.y + k.h * 0.08); s.lineTo(k.x + k.w * 0.42, k.y + k.h * 0.04); s.stroke();
    const by = k.y + k.h * 0.62;
    s.beginPath(); s.moveTo(k.x + k.w * 0.05, by); s.quadraticCurveTo(k.x + k.w * 0.5, by + k.h * 0.42, k.x + k.w * 0.95, by); s.closePath(); s.fillStyle = '#fff'; s.fill(); s.stroke();
    s.lineWidth = 2.5; s.strokeStyle = INK; s.beginPath(); s.moveTo(k.x + k.w * 0.05, by); s.quadraticCurveTo(k.x + k.w * 0.5, by + k.h * 0.42, k.x + k.w * 0.95, by); s.closePath(); s.stroke();
    capsule(s, k.x + k.w * 0.5, by - k.h * 0.06, k.x + k.w * 0.5, by - k.h * 0.18, Math.max(5, k.w * 0.07), '#c9c6dc', INK);
    capsule(s, k.x + k.w * 0.5, by - k.h * 0.18, k.x + k.w * 0.36, by - k.h * 0.18, Math.max(5, k.w * 0.07), '#c9c6dc', INK);
    rr(s, k.x + k.w * 0.72, by - k.h * 0.2, k.w * 0.14, k.h * 0.17, 4); s.fillStyle = '#ff6fa8'; s.fill(); s.lineWidth = 2; s.stroke();
    capsule(s, k.x + k.w * 0.76, by - k.h * 0.2, k.x + k.w * 0.74, by - k.h * 0.3, 3, '#5fe0c8', null);
    // shower: ceiling ring and the vacuum unit
    const sh = L.shower;
    rr(s, sh.x + sh.w * 0.08, sh.y, sh.w * 0.84, Math.max(8, sh.h * 0.06), 4); s.fillStyle = '#c9c6dc'; s.fill(); s.lineWidth = 2.5; s.strokeStyle = INK; s.stroke();
    rr(s, sh.x + sh.w * 0.66, sh.y + sh.h * 0.78, sh.w * 0.32, sh.h * 0.2, 6); s.fillStyle = '#9fb2ff'; s.fill(); s.stroke();
    circle(s, sh.x + sh.w * 0.82, sh.y + sh.h * 0.88, Math.min(sh.w, sh.h) * 0.06); s.fillStyle = '#fff'; s.fill(); s.stroke();
  }

  /* ---------- drawing: dynamic bits ---------- */
  function drawWindow() {
    const { x, y, r } = L.win;
    g.save(); circle(g, x, y, r); g.clip();
    const sg = g.createRadialGradient(x, y, r * 0.1, x, y, r); sg.addColorStop(0, '#1b1650'); sg.addColorStop(1, '#07051c');
    g.fillStyle = sg; g.fillRect(x - r, y - r, r * 2, r * 2);
    if (travelling) {
      g.lineCap = 'round';
      for (const s of winStars) {
        const d0 = s.d, d1 = Math.max(0, s.d - 0.05 - s.d * 0.18);
        const ca = Math.cos(s.a), sa = Math.sin(s.a);
        g.strokeStyle = `rgba(255,255,255,${0.3 + s.d * 0.7})`; g.lineWidth = 0.8 + s.d * 2.2 * s.s;
        g.beginPath(); g.moveTo(x + ca * d1 * r * 1.1, y + sa * d1 * r * 1.1); g.lineTo(x + ca * d0 * r * 1.1, y + sa * d0 * r * 1.1); g.stroke();
      }
    } else {
      for (const s of winStars) { g.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(T * 0.8 * s.s + s.a)); g.fillStyle = '#fff'; circle(g, x + s.x * r, y + s.y * r, 0.6 + s.s * 1.1); g.fill(); }
      g.globalAlpha = 1;
      if (planetCv) g.drawImage(planetCv, x - r, y - r + Math.sin(T * 0.3) * r * 0.02, r * 2, r * 2);
    }
    // glass glare
    g.fillStyle = 'rgba(255,255,255,.08)'; ell(g, x - r * 0.35, y - r * 0.4, r * 0.5, r * 0.25, -0.6); g.fill();
    g.restore();
    // frame
    circle(g, x, y, r); g.lineWidth = Math.max(10, r * 0.13); g.strokeStyle = '#cfc8f0'; g.stroke();
    circle(g, x, y, r + Math.max(10, r * 0.13) / 2); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    circle(g, x, y, r - Math.max(10, r * 0.13) / 2); g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; rivet(g, x + Math.cos(a) * r, y + Math.sin(a) * r, Math.max(2.5, r * 0.025)); }
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = Math.max(3, r * 0.03); g.beginPath(); g.arc(x, y, r * 0.82, Math.PI * 1.08, Math.PI * 1.38); g.stroke();
    // place label
    const label = travelling ? 'Flying to ' + placeName : 'Outside: ' + placeName;
    const fs = clamp(r * 0.13, 13, 20); g.font = `800 ${fs}px ${FD}`;
    const tw = g.measureText(label).width + fs * 1.4, ly = y + r - fs * 0.3;
    rr(g, x - tw / 2, ly - fs * 0.8, tw, fs * 1.6, fs * 0.8); g.fillStyle = '#ffd166'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    text(g, label, x, ly + 1, fs, '#3a2600');
  }
  function drawPanel() {
    const p = L.panel;
    rr(g, p.x, p.y, p.w, p.h, 16); const pg = g.createLinearGradient(0, p.y, 0, p.y + p.h); pg.addColorStop(0, '#3b3380'); pg.addColorStop(1, '#241d5c');
    g.fillStyle = pg; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    const pad = p.h * 0.14, sw = p.w * 0.36, sh = p.h - pad * 2;
    // screen
    rr(g, p.x + pad, p.y + pad, sw, sh, 8); g.fillStyle = '#0c2f3a'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#5fe0c8'; g.stroke();
    const fs = clamp(sh * 0.26, 9, 15);
    text(g, travelling ? 'ON OUR WAY TO' : 'PARKED AT', p.x + pad + sw / 2, p.y + pad + sh * 0.3, fs * 0.85, '#5fe0c8', 'center', { weight: 700 });
    g.font = `800 ${fs * 1.2}px ${FD}`; let nm = placeName.toUpperCase(); while (nm.length > 3 && g.measureText(nm).width > sw - 8) nm = nm.slice(0, -2) + '…';
    text(g, nm, p.x + pad + sw / 2, p.y + pad + sh * 0.68, fs * 1.2, '#b8fff1');
    // blinking lights
    const lx0 = p.x + pad * 2 + sw, lw = p.w - sw - pad * 3 - p.w * 0.14, rows = 2, cols = 4;
    const lr = Math.min(lw / cols, sh / rows) * 0.3;
    const cols0 = ['#ff6fa8', '#ffd166', '#5fe0c8', '#9fb2ff', '#ff7a45'];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c, on = Math.sin(T * (1.3 + i * 0.37) + i * 1.7) > -0.2 || panelBlip > 0;
      const cx = lx0 + (c + 0.5) * (lw / cols), cy = p.y + pad + (r + 0.5) * (sh / rows);
      circle(g, cx, cy, lr); g.fillStyle = on ? cols0[i % cols0.length] : 'rgba(255,255,255,.15)'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
      if (on) { g.fillStyle = 'rgba(255,255,255,.6)'; circle(g, cx - lr * 0.3, cy - lr * 0.3, lr * 0.3); g.fill(); }
    }
    // radio speaker (Leo)
    const rx = p.x + p.w - p.w * 0.08 - pad * 0.5, ry = p.y + p.h * 0.45, rrad = Math.min(p.w * 0.06, p.h * 0.3);
    circle(g, rx, ry, rrad); g.fillStyle = '#1a1446'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#9fb2ff'; g.stroke();
    const talking = bubbles.has('leo');
    for (let i = 1; i <= 3; i++) { g.strokeStyle = talking && Math.sin(T * 10 - i) > 0 ? '#5fe0c8' : 'rgba(159,178,255,.45)'; g.lineWidth = 1.5; circle(g, rx, ry, (rrad * i) / 3.6); g.stroke(); }
    text(g, 'LEO', rx, ry + rrad + Math.min(9, p.h * 0.12), Math.min(11, p.h * 0.16), '#9fb2ff');
    // S.S. plaque
    const plaque = 'S.S. ' + rocketName; const pfs = clamp(p.h * 0.2, 11, 17); g.font = `800 ${pfs}px ${FD}`;
    const pw = g.measureText(plaque).width + pfs * 1.6, py = p.y + p.h - pfs * 0.2;
    rr(g, p.x + p.w / 2 - pw / 2, py - pfs * 0.75, pw, pfs * 1.5, 6);
    const gold = g.createLinearGradient(0, py - pfs, 0, py + pfs); gold.addColorStop(0, '#ffe7a3'); gold.addColorStop(1, '#e0a93a');
    g.fillStyle = gold; g.fill(); g.lineWidth = 2; g.strokeStyle = '#8a5a10'; g.stroke();
    circle(g, p.x + p.w / 2 - pw / 2 + pfs * 0.4, py, 2); g.fillStyle = '#8a5a10'; g.fill(); circle(g, p.x + p.w / 2 + pw / 2 - pfs * 0.4, py, 2); g.fill();
    text(g, plaque, p.x + p.w / 2, py + 1, pfs, '#5a3a05');
  }
  function maskOn(g2, x, y, hs, dog) {
    const my = y + hs * (dog ? 0.42 : 0.49), mw = hs * (dog ? 0.42 : 0.5), mh = hs * 0.12;
    g2.strokeStyle = '#2a1f5c'; g2.lineWidth = Math.max(1.5, hs * 0.025); g2.beginPath(); g2.moveTo(x + hs * 0.2, my); g2.lineTo(x + hs * 0.8, my); g2.stroke();
    rr(g2, x + hs / 2 - mw / 2, my - mh / 2, mw, mh, mh / 2); g2.fillStyle = '#7b5cff'; g2.fill(); g2.lineWidth = Math.max(1.2, hs * 0.02); g2.stroke();
    g2.strokeStyle = '#fff'; g2.lineWidth = Math.max(1.2, hs * 0.02);
    [-1, 1].forEach((sd) => { g2.beginPath(); g2.arc(x + hs / 2 + sd * mw * 0.24, my - mh * 0.1, mw * 0.1, 0.2, Math.PI - 0.2); g2.stroke(); });
  }
  function drawBags() {
    for (let i = 0; i < L.slots.length; i++) {
      const sl = L.slots[i], who = crew.find((c) => c.slot === i);
      const asleep = who && who.mode === 'sleep';
      if (sl.dog) {
        // dog basket strapped to the wall
        circle(g, sl.cx, sl.cy, sl.r); g.fillStyle = '#ffb084'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
        circle(g, sl.cx, sl.cy, sl.r * 0.72); g.fillStyle = '#ffe3c2'; g.fill(); g.lineWidth = 2; g.stroke();
        capsule(g, sl.cx - sl.r * 1.15, sl.cy, sl.cx + sl.r * 1.15, sl.cy, Math.max(4, sl.r * 0.14), '#6b5fb8', INK);
        if (asleep) drawSleepingDog(who, sl);
        else if (who) text(g, who.name, sl.cx, sl.cy + sl.r * 0.42, clamp(sl.r * 0.3, 9, 14), '#a05a2a');
        continue;
      }
      const col = who ? who.shirt : '#9fb2ff';
      const breathe = asleep ? 1 + Math.sin(T * 1.6 + i) * 0.02 : 1;
      const x = sl.x, y = sl.y, w = sl.w * (asleep ? 1.06 : 1) * breathe, h = sl.h, cx = sl.x + sl.w / 2;
      if (asleep) {
        const hs = Math.min(sl.w * 1.25, sl.cell.h * 0.6);
        // pillow
        rr(g, cx - sl.w * 0.42, y - hs * 0.22, sl.w * 0.84, hs * 0.38, 10); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
        if (who.head) g.drawImage(who.head, cx - hs / 2, y - hs * 0.62, hs, hs);
        maskOn(g, cx - hs / 2, y - hs * 0.62, hs, false);
      }
      rr(g, cx - w / 2, y, w, h, Math.min(w, h) * 0.45);
      const bg = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); bg.addColorStop(0, shade(col, 0.15)); bg.addColorStop(0.5, shade(col, 0.45)); bg.addColorStop(1, shade(col, 0.05));
      g.fillStyle = bg; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
      // quilting
      g.strokeStyle = 'rgba(42,31,92,.22)'; g.lineWidth = 2;
      for (let q = 1; q < 4; q++) { g.beginPath(); g.moveTo(cx - w * 0.4, y + (h * q) / 4); g.lineTo(cx + w * 0.4, y + (h * q) / 4); g.stroke(); }
      if (!asleep) { ell(g, cx, y + h * 0.08, w * 0.32, h * 0.05); g.fillStyle = 'rgba(42,31,92,.35)'; g.fill(); }
      // straps to the wall
      [0.3, 0.72].forEach((f) => { capsule(g, cx - w * 0.62, y + h * f, cx + w * 0.62, y + h * f, Math.max(4, w * 0.09), '#6b5fb8', INK); rr(g, cx - w * 0.1, y + h * f - w * 0.08, w * 0.2, w * 0.16, 3); g.fillStyle = '#ffd166'; g.fill(); g.lineWidth = 1.5; g.stroke(); });
      // name tag
      if (who) { const fs = clamp(w * 0.2, 9, 14); g.font = `800 ${fs}px ${FD}`; const tw = Math.min(w * 0.95, g.measureText(who.name).width + 8);
        rr(g, cx - tw / 2, y + h * 0.42, tw, fs * 1.3, 4); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = INK; g.stroke(); text(g, who.name, cx, y + h * 0.42 + fs * 0.68, fs, INK); }
    }
  }
  function drawSleepingDog(c, sl) {
    const k = sl.r * 1.05, b = 1 + Math.sin(T * 1.8 + c.p1) * 0.03;
    g.save(); g.translate(sl.cx, sl.cy + k * 0.08); g.scale(b, b);
    ell(g, 0, k * 0.1, k * 0.62, k * 0.42); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    g.save(); ell(g, 0, k * 0.1, k * 0.62, k * 0.42); g.clip(); g.fillStyle = '#8a4a22'; circle(g, -k * 0.35, 0, k * 0.3); g.fill(); circle(g, k * 0.3, k * 0.35, k * 0.22); g.fill(); g.restore();
    g.strokeStyle = '#8a4a22'; g.lineWidth = k * 0.12; g.lineCap = 'round'; g.beginPath(); g.arc(-k * 0.2, k * 0.2, k * 0.5, 1.5, 2.9); g.stroke();
    const hs = k * 1.05;
    if (c.head) { g.save(); g.rotate(-0.25); g.drawImage(c.head, -hs * 0.2 - hs / 2 + k * 0.25, -hs * 0.68, hs, hs); maskOn(g, -hs * 0.2 - hs / 2 + k * 0.25, -hs * 0.68, hs, true); g.restore(); }
    g.restore();
  }
  function drawPlant() {
    const p = L.plant; if (p.w < 24) return;
    rr(g, p.x, p.y, p.w, p.h, 12); g.fillStyle = 'rgba(214,244,255,.65)'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    // pink-purple grow light
    rr(g, p.x + 4, p.y + 4, p.w - 8, Math.max(6, p.h * 0.05), 4); g.fillStyle = '#ff6fa8'; g.fill();
    const lg = g.createLinearGradient(0, p.y, 0, p.y + p.h); lg.addColorStop(0, 'rgba(255,111,168,.35)'); lg.addColorStop(1, 'rgba(255,111,168,0)');
    g.fillStyle = lg; g.fillRect(p.x + 4, p.y + 8, p.w - 8, p.h - 12);
    const base = p.y + p.h - p.h * 0.12, cx = p.x + p.w / 2;
    rr(g, p.x + p.w * 0.15, base, p.w * 0.7, p.h * 0.09, 6); g.fillStyle = '#e9d3a8'; g.fill(); g.lineWidth = 2; g.stroke();
    const grow = 1 + plantPop * 0.15, lv = plantLevel, n = 2 + lv * 2, hmax = p.h * (0.2 + lv * 0.11) * grow;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 1.6 + Math.sin(T * 1.2 + i) * 0.05 * (reduced ? 0.3 : 1);
      const len = hmax * (0.55 + 0.45 * Math.sin((i / (n - 1)) * Math.PI));
      const ex = cx + Math.cos(a) * len * 0.5, ey = base + Math.sin(a) * len;
      g.save(); g.translate((cx + ex) / 2, (base + ey) / 2); g.rotate(a + Math.PI / 2);
      ell(g, 0, 0, Math.max(3, p.w * 0.1), len * 0.5); g.fillStyle = lv >= 3 && i % 2 ? '#c2456a' : '#5fbf4c'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -len * 0.4); g.lineTo(0, len * 0.4); g.stroke();
      g.restore();
    }
    if (lv >= 4) { [[-0.22, 0.55], [0.2, 0.68]].forEach(([dx, dh], j) => { const fx = cx + dx * p.w, fy = base - hmax * dh; for (let q = 0; q < 6; q++) { const qa = (q / 6) * TAU + T * 0.2; ell(g, fx + Math.cos(qa) * p.w * 0.06, fy + Math.sin(qa) * p.w * 0.06, p.w * 0.06, p.w * 0.035, qa); g.fillStyle = j ? '#ff7a45' : '#ffd166'; g.fill(); } circle(g, fx, fy, p.w * 0.04); g.fillStyle = '#8a4a22'; g.fill(); }); }
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(p.x + p.w * 0.18, p.y + p.h * 0.2); g.lineTo(p.x + p.w * 0.18, p.y + p.h * 0.5); g.stroke();
    text(g, 'Space garden', cx, p.y + p.h + clamp(p.w * 0.1, 9, 13) * 0.9, clamp(p.w * 0.12, 9, 13), INK, 'center', { weight: 800 });
  }
  function bikeGeo() {
    const b = L.bike, fs = clamp(Math.min(b.w, b.h) * 0.08, 10, 15), s = Math.min(b.w * 0.9, (b.h - fs * 2) * 1.05, u * 2.5);
    const cx = b.x + b.w * 0.5, base = b.y + b.h - fs * 1.8;
    return { s, fs, base, seat: [cx - s * 0.14, base - s * 0.56], crank: [cx + s * 0.04, base - s * 0.27], fly: [cx + s * 0.16, base - s * 0.24], bar: [cx + s * 0.3, base - s * 0.66] };
  }
  function drawBike() {
    const q = bikeGeo(), s = q.s, lw = Math.max(5, s * 0.05);
    rr(g, q.seat[0] - s * 0.25, q.base - s * 0.05, s * 0.75, s * 0.06, 6); g.fillStyle = '#6b5fb8'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    // flywheel
    circle(g, q.fly[0], q.fly[1], s * 0.17); g.fillStyle = '#9fb2ff'; g.fill(); g.lineWidth = 3; g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = bikeAng * 0.6 + (i * Math.PI) / 2; g.beginPath(); g.moveTo(q.fly[0], q.fly[1]); g.lineTo(q.fly[0] + Math.cos(a) * s * 0.15, q.fly[1] + Math.sin(a) * s * 0.15); g.stroke(); }
    capsule(g, q.seat[0], q.seat[1] + s * 0.04, q.crank[0], q.crank[1], lw, '#ff7a45', INK);
    capsule(g, q.seat[0], q.seat[1] + s * 0.04, q.seat[0] + s * 0.02, q.base - s * 0.03, lw, '#ff7a45', INK);
    capsule(g, q.crank[0], q.crank[1], q.bar[0], q.bar[1], lw, '#ff7a45', INK);
    capsule(g, q.bar[0] - s * 0.04, q.bar[1], q.bar[0] + s * 0.12, q.bar[1] - s * 0.04, lw * 0.9, '#5fe0c8', INK);
    rr(g, q.seat[0] - s * 0.12, q.seat[1] - s * 0.02, s * 0.24, s * 0.07, s * 0.035); g.fillStyle = '#2a1f5c'; g.fill();
    // crank and pedals
    const pr = s * 0.09;
    for (const sd of [0, Math.PI]) { const a = bikeAng + sd; capsule(g, q.crank[0], q.crank[1], q.crank[0] + Math.cos(a) * pr, q.crank[1] + Math.sin(a) * pr, lw * 0.6, '#c9c6dc', INK); }
    circle(g, q.crank[0], q.crank[1], lw * 0.7); g.fillStyle = '#ffd166'; g.fill(); g.lineWidth = 2; g.stroke();
    text(g, 'EXERCISE BIKE', L.bike.x + L.bike.w / 2, q.base + q.fs * 1.1, q.fs, INK);
  }
  function drawTubBack() {
    const t = L.tub, top = t.y + t.h * 0.45, cx = t.x + t.w / 2, rx = t.w * 0.47, ry = Math.max(6, t.h * 0.08);
    ell(g, cx, top, rx, ry); g.fillStyle = '#b9b2dc'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
    const lvl = bath.water;
    if (lvl > 0.05) {
      const wob = Math.sin(T * 3) * 0.04;
      ell(g, cx, top + ry * (1 - lvl) * 0.4, rx * (0.6 + 0.36 * lvl) * (1 + wob), ry * (0.5 + 0.4 * lvl)); g.fillStyle = 'rgba(127,211,255,.95)'; g.fill();
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (let i = 0; i < 6; i++) { const fx = cx + (i - 2.5) * rx * 0.28 * lvl, fy = top - ry * 0.1 + Math.sin(T * 2 + i) * 1.5; circle(g, fx, fy, ry * (0.35 + (i % 3) * 0.12) * lvl); g.fill(); }
    }
  }
  function drawTubFront() {
    const t = L.tub, top = t.y + t.h * 0.45, cx = t.x + t.w / 2;
    g.beginPath(); g.moveTo(t.x + t.w * 0.02, top);
    g.lineTo(t.x + t.w * 0.98, top); g.quadraticCurveTo(t.x + t.w, t.y + t.h - 4, cx + t.w * 0.3, t.y + t.h - 4);
    g.lineTo(cx - t.w * 0.3, t.y + t.h - 4); g.quadraticCurveTo(t.x, t.y + t.h - 4, t.x + t.w * 0.02, top); g.closePath();
    const tg = g.createLinearGradient(0, top, 0, t.y + t.h); tg.addColorStop(0, '#ffffff'); tg.addColorStop(1, '#dcd6f5');
    g.fillStyle = tg; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    capsule(g, t.x - 2, top + t.h * 0.22, t.x + t.w + 2, top + t.h * 0.22, Math.max(4, t.h * 0.05), '#6b5fb8', INK);
    // rubber duck strapped on (it floats when the bath is busy)
    const busy = bath.big || crew.some((c) => c.mode === 'bath');
    const dx = t.x + t.w * 0.82, dy = top - t.h * 0.06 - (busy ? 14 + Math.sin(T * 2) * 8 : 0), ds = Math.max(8, t.w * 0.06);
    ell(g, dx, dy, ds, ds * 0.7); g.fillStyle = '#ffd166'; g.fill(); g.lineWidth = 2; g.stroke();
    circle(g, dx + ds * 0.5, dy - ds * 0.6, ds * 0.5); g.fill(); g.stroke();
    g.fillStyle = '#ff7a45'; ell(g, dx + ds * 1.05, dy - ds * 0.55, ds * 0.3, ds * 0.15); g.fill();
    g.fillStyle = INK; circle(g, dx + ds * 0.62, dy - ds * 0.72, ds * 0.08); g.fill();
    text(g, 'BATH', cx, top + t.h * 0.36, clamp(t.w * 0.07, 10, 15), '#6b5fb8');
  }
  function showerGeo() { const s = L.shower; return { cx: s.x + s.w * 0.4, top: s.y + Math.max(8, s.h * 0.06), bot: s.y + s.h - 4, w: Math.min(s.w * 0.7, s.h * 0.6) }; }
  function drawShowerIdle() {
    const q = showerGeo(), s = L.shower;
    if (showerZip > 0.01) return;
    // folded bag hanging from the ring
    for (let i = 0; i < 4; i++) { rr(g, q.cx - q.w / 2, q.top + i * 6, q.w, 8, 4); g.fillStyle = i % 2 ? '#bfe9ff' : '#9fd8ff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); }
    text(g, 'SHOWER', s.x + s.w / 2, s.y + s.h * 0.5, clamp(s.w * 0.12, 9, 14), '#3f8fe0');
    hose(q, 0);
  }
  function hose(q, flow) {
    const s = L.shower, ux = s.x + s.w * 0.72, uy = s.y + s.h * 0.85;
    g.strokeStyle = INK; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.moveTo(q.cx, q.bot - 4); g.quadraticCurveTo(q.cx + q.w * 0.3, q.bot + 2, ux, uy); g.stroke();
    g.strokeStyle = '#9fb2ff'; g.lineWidth = 4; g.stroke();
    if (flow) { for (let i = 0; i < 4; i++) { const t = ((T * 1.4 + i / 4) % 1); const x = (1 - t) * (1 - t) * q.cx + 2 * (1 - t) * t * (q.cx + q.w * 0.3) + t * t * ux, y = (1 - t) * (1 - t) * (q.bot - 4) + 2 * (1 - t) * t * (q.bot + 2) + t * t * uy; circle(g, x, y, 2.5); g.fillStyle = '#e8fbff'; g.fill(); } }
  }
  function drawShowerBag(c) {
    const q = showerGeo(), z = showerZip;
    const neck = c ? c.y + 0.06 * c.k : q.top + (q.bot - q.top) * 0.3;
    const topY = lerp(q.bot, neck, z);
    // shower head spray around the head
    if (c && c.mode === 'shower' && z > 0.9) {
      for (let i = 0; i < 6; i++) { const a = T * 3 + i; circle(g, c.x + Math.cos(a) * c.k * 0.5, c.y - c.k * 0.4 + Math.sin(a * 1.3) * c.k * 0.4, 2 + (i % 3)); g.fillStyle = 'rgba(127,211,255,.8)'; g.fill(); }
    }
    capsule(g, q.cx, q.top, q.cx, Math.min(topY, q.top + 10), 5, '#c9c6dc', INK);
    rr(g, q.cx - q.w / 2, topY, q.w, q.bot - topY, Math.min(q.w * 0.3, 16));
    g.fillStyle = 'rgba(159,216,255,.92)'; g.fill(); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
    // zip
    g.strokeStyle = '#2a1f5c'; g.lineWidth = 2; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(q.cx + q.w * 0.18, topY + 6); g.lineTo(q.cx + q.w * 0.18, q.bot - 6); g.stroke(); g.setLineDash([]);
    rr(g, q.cx + q.w * 0.18 - 4, topY + 2, 8, 10, 2); g.fillStyle = '#ffd166'; g.fill(); g.stroke();
    // bubbles inside
    for (let i = 0; i < 5; i++) { const by = topY + ((T * 0.4 + i / 5) % 1) * (q.bot - topY); circle(g, q.cx - q.w * 0.25 + (i % 3) * q.w * 0.2, by, 2 + (i % 2) * 2); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill(); }
    hose(q, c ? 1 : 0);
  }

  /* ---------- crew drawing ---------- */
  function mouthOf(c) {
    const lx = c.dog ? 0.42 * c.k * c.dir : 0, ly = c.dog ? -0.18 * c.k : -0.3 * c.k;
    const cs = Math.cos(c.rot), sn = Math.sin(c.rot);
    return [c.x + lx * cs - ly * sn, c.y + lx * sn + ly * cs];
  }
  function drawPerson(c) {
    const k = c.k, sh = c.shirt, dark = shade(sh, -0.28), ph = c.p1;
    g.save(); g.translate(c.x, c.y); g.rotate(c.rot);
    const ty = 0.1 * k, hipY = ty + 0.26 * k, lw = 0.24 * k, aw = 0.2 * k;
    g.lineJoin = 'round';
    const calm = reduced ? 0.4 : 1;
    // legs
    if (c.mode === 'bike') {
      const q = bikeGeo(), pr = q.s * 0.09;
      [0, Math.PI].forEach((sd, j) => {
        const a = bikeAng + sd, fx = q.crank[0] + Math.cos(a) * pr - c.x, fy = q.crank[1] + Math.sin(a) * pr - c.y;
        const hx = (j ? 0.1 : -0.1) * k, [kx, ky, ex, ey] = legIK(hx, hipY, fx, fy, 0.3 * k, 0.32 * k, 1);
        capsule(g, hx, hipY, kx, ky, lw, j ? sh : dark, INK); capsule(g, kx, ky, ex, ey, lw * 0.9, j ? sh : dark, INK);
        ell(g, ex, ey, lw * 0.6, lw * 0.4); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
      });
    } else {
      [-1, 1].forEach((sd) => {
        const a = sd * (0.22 + 0.16 * Math.sin(T * 1.3 * calm + ph + sd)) + (c.mode === 'bath' ? sd * 0.5 : 0);
        const ex = sd * 0.15 * k + Math.sin(a) * 0.48 * k, ey = hipY + Math.cos(a) * 0.48 * k;
        capsule(g, sd * 0.15 * k, hipY, ex, ey, lw, sh, INK);
        ell(g, ex, ey + lw * 0.1, lw * 0.62, lw * 0.5, a); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
        g.strokeStyle = dark; g.lineWidth = lw * 0.22; g.beginPath(); g.ellipse(ex, ey - lw * 0.15, lw * 0.5, lw * 0.15, a, 0, Math.PI); g.stroke();
      });
    }
    // arms
    [-1, 1].forEach((sd) => {
      let a = sd * (1.9 + 0.35 * Math.sin(T * 1.5 * calm + ph + sd * 1.3));
      if (c.eating && sd === 1) a = 2.75 + Math.sin(T * 9) * 0.12;
      if (c.mode === 'bike') a = sd * 1.25;
      if (c.held) a = sd * 2.6;
      const sx = sd * 0.27 * k, sy = ty - 0.18 * k, ex = sx + Math.sin(a) * 0.44 * k, ey = sy + Math.cos(a) * 0.44 * k;
      capsule(g, sx, sy, ex, ey, aw, sh, INK);
      circle(g, ex, ey, aw * 0.62); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke();
    });
    // torso (comfy onesie)
    rr(g, -0.31 * k, ty - 0.33 * k, 0.62 * k, 0.66 * k, 0.26 * k);
    const tg = g.createLinearGradient(-0.31 * k, 0, 0.31 * k, 0); tg.addColorStop(0, shade(sh, 0.18)); tg.addColorStop(1, dark);
    g.fillStyle = tg; g.fill(); g.lineWidth = Math.max(2, k * 0.045); g.strokeStyle = INK; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = Math.max(1.5, k * 0.03); g.beginPath(); g.moveTo(0, ty - 0.28 * k); g.lineTo(0, ty + 0.22 * k); g.stroke();
    starPath(g, -0.15 * k, ty - 0.1 * k, 0.08 * k, 0.04 * k, 5, 0); g.fillStyle = '#ffd166'; g.fill();
    rr(g, -0.31 * k, ty + 0.2 * k, 0.62 * k, 0.08 * k, 0.04 * k); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill();
    if (c.mode === 'bike') { capsule(g, -0.36 * k, ty + 0.24 * k, 0.36 * k, ty + 0.24 * k, 0.09 * k, '#2a1f5c', null); rr(g, -0.07 * k, ty + 0.19 * k, 0.14 * k, 0.1 * k, 3); g.fillStyle = '#ffd166'; g.fill(); }
    // head
    const hs = 1.45 * k, chew = c.eating ? 1 + Math.sin(T * 14) * 0.03 : 1;
    if (c.head) g.drawImage(c.head, -hs / 2, ty - 0.33 * k - 0.64 * hs, hs, hs * chew);
    else { circle(g, 0, ty - 0.33 * k - 0.14 * hs, hs * 0.3); g.fillStyle = '#f6c9a0'; g.fill(); g.lineWidth = 2; g.strokeStyle = INK; g.stroke(); }
    g.restore();
  }
  function drawDog(c) {
    const k = c.k, calm = reduced ? 0.4 : 1, by = 0.08 * k;
    g.save(); g.translate(c.x, c.y); g.rotate(c.rot); g.scale(c.dir, 1);
    // legs paddling
    [-0.36, -0.18, 0.16, 0.34].forEach((lx, i) => {
      const a = Math.sin(T * (c.chaseUntil > T ? 9 : 4) * calm + i * 1.7) * 0.5;
      capsule(g, lx * k, by + 0.15 * k, lx * k + Math.sin(a) * 0.28 * k, by + 0.15 * k + Math.cos(a) * 0.28 * k, 0.15 * k, i % 2 ? '#fff' : '#8a4a22', INK);
    });
    // tail
    const wag = Math.sin(T * 8 * calm) * 0.5;
    g.save(); g.translate(-0.55 * k, by - 0.05 * k); g.rotate(-0.9 + wag);
    capsule(g, 0, 0, 0, -0.3 * k, 0.11 * k, '#8a4a22', INK); g.restore();
    // body
    ell(g, -0.04 * k, by, 0.58 * k, 0.32 * k); g.fillStyle = '#fff'; g.fill(); g.lineWidth = Math.max(2, k * 0.045); g.strokeStyle = INK; g.stroke();
    g.save(); ell(g, -0.04 * k, by, 0.58 * k, 0.32 * k); g.clip(); g.fillStyle = '#8a4a22';
    circle(g, -0.3 * k, by - 0.15 * k, 0.24 * k); g.fill(); circle(g, 0.12 * k, by + 0.22 * k, 0.14 * k); g.fill(); circle(g, -0.05 * k, by - 0.28 * k, 0.1 * k); g.fill();
    g.restore();
    ell(g, -0.04 * k, by, 0.58 * k, 0.32 * k); g.lineWidth = Math.max(2, k * 0.045); g.strokeStyle = INK; g.stroke();
    // head
    const hs = 1.2 * k, chew = c.eating ? 1 + Math.sin(T * 14) * 0.04 : 1;
    if (c.head) g.drawImage(c.head, 0.38 * k - hs / 2, by - 0.88 * hs, hs, hs * chew);
    else { circle(g, 0.38 * k, by - 0.4 * k, 0.3 * k); g.fillStyle = '#fff'; g.fill(); g.stroke(); }
    g.restore();
  }

  /* ---------- particles ---------- */
  function addP(o) { if (parts.length > 240) parts.shift(); parts.push(Object.assign({ t: 0, life: 3, vx: 0, vy: 0, r: 3, rot: 0, vr: 0 }, o)); }
  function crumbs(x, y, n, colors, kind) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), sp = rand(15, 55);
      if (kind === 'blob') addP({ type: 'blob', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rand(3, 7) * (u / 60 + 0.4), life: rand(7, 11), color: pick(colors), ph: rand(0, TAU) });
      else addP({ type: 'crumb', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rand(1.6, 3.4) * (u / 60 + 0.4), life: rand(3, 5), color: pick(colors), rot: rand(0, TAU), vr: rand(-3, 3) });
    }
  }
  function hearts(x, y, n) { for (let i = 0; i < n; i++) addP({ type: 'heart', x: x + rand(-10, 10), y, vx: rand(-20, 20), vy: rand(-50, -30), r: rand(6, 10), life: 1.6 }); }
  function sparkle(x, y, n, col) { for (let i = 0; i < n; i++) { const a = rand(0, TAU); addP({ type: 'spark', x, y, vx: Math.cos(a) * rand(30, 80), vy: Math.sin(a) * rand(30, 80), r: rand(4, 8), life: 0.9, color: col || '#ffd166' }); } }
  function popBlob(p) {
    p.t = p.life; sfx('blip', 60);
    for (let i = 0; i < 5; i++) { const a = rand(0, TAU); addP({ type: 'blob', x: p.x, y: p.y, vx: Math.cos(a) * 40, vy: Math.sin(a) * 40, r: Math.max(1.5, p.r * 0.3), life: 0.8, color: p.color, ph: rand(0, TAU) }); }
  }
  function drawParts() {
    for (const p of parts) {
      const a = clamp(Math.min(1, (p.life - p.t) / 0.6), 0, 1);
      g.globalAlpha = a;
      if (p.type === 'crumb') { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.color; rr(g, -p.r, -p.r * 0.7, p.r * 2, p.r * 1.4, p.r * 0.4); g.fill(); g.restore(); }
      else if (p.type === 'blob') {
        const w = 1 + Math.sin(T * 5 + p.ph) * 0.14, h = 1 - Math.sin(T * 5 + p.ph) * 0.14;
        ell(g, p.x, p.y, p.r * w, p.r * h, Math.sin(T + p.ph) * 0.5); g.fillStyle = p.color; g.fill();
        g.lineWidth = Math.max(1, p.r * 0.12); g.strokeStyle = 'rgba(42,31,92,.35)'; g.stroke();
        g.fillStyle = 'rgba(255,255,255,.75)'; circle(g, p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.28); g.fill();
      } else if (p.type === 'heart') { heartPath(g, p.x, p.y, p.r); g.fillStyle = '#ff6fa8'; g.fill(); }
      else if (p.type === 'spark') { starPath(g, p.x, p.y, p.r, p.r * 0.45, 4, T * 3); g.fillStyle = p.color; g.fill(); }
      else if (p.type === 'z') { text(g, 'z', p.x, p.y, p.r, '#d8d0ff', 'center', { outline: true, stroke: 'rgba(42,31,92,.8)' }); }
      else if (p.type === 'word') { text(g, p.text, p.x, p.y, p.r, p.color || '#fff', 'center', { outline: true }); }
    }
    g.globalAlpha = 1;
  }
  function drawBigBubble() {
    const b = bath.big; if (!b) return;
    const w = 1 + Math.sin(T * 3.2) * 0.1, h = 1 - Math.sin(T * 3.2) * 0.1;
    g.save(); g.translate(b.x, b.y); g.rotate(Math.sin(T * 0.8) * 0.3);
    ell(g, 0, 0, b.r * w, b.r * h); const bg = g.createRadialGradient(-b.r * 0.3, -b.r * 0.3, b.r * 0.1, 0, 0, b.r); bg.addColorStop(0, 'rgba(232,251,255,.95)'); bg.addColorStop(1, 'rgba(127,211,255,.85)');
    g.fillStyle = bg; g.fill(); g.lineWidth = 3; g.strokeStyle = 'rgba(42,31,92,.45)'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.85)'; ell(g, -b.r * 0.38, -b.r * 0.4, b.r * 0.22, b.r * 0.12, -0.6); g.fill();
    g.restore();
  }

  /* ---------- speech bubbles ---------- */
  function drawBubbles() {
    const fs = W < 520 ? 15 : 17, maxW = Math.min(300, W * 0.55), placed = [];
    const hits = (x, y, w, h) => placed.some((r) => x < r[0] + r[2] + 4 && x + w + 4 > r[0] && y < r[1] + r[3] + 4 && y + h + 4 > r[1]);
    for (const [who, b] of bubbles) {
      let ax, ay, below = false;
      if (who === 'leo') { const p = L.panel; ax = p.x + p.w * 0.9; ay = p.y; }
      else {
        const c = byId(who); if (!c) continue;
        if (c.mode === 'sleep' && c.slot >= 0) { const sl = L.slots[c.slot]; ax = sl.dog ? sl.cx : sl.x + sl.w / 2; ay = sl.dog ? sl.cy - sl.r : sl.y - sl.w * 0.6; }
        else { ax = c.x; ay = c.y - c.R * 1.05; }
      }
      g.font = `700 ${fs}px ${FB}`;
      const label = who === 'leo' ? '📻 Leo on the radio' : '';
      const lines = wrapLines(g, b.text, maxW - 24);
      let tw = 0; lines.forEach((l) => (tw = Math.max(tw, g.measureText(l).width)));
      if (label) { g.font = `800 ${fs - 3}px ${FD}`; tw = Math.max(tw, g.measureText(label).width); }
      const lh = fs * 1.25, bw = tw + 24, bh = lines.length * lh + 16 + (label ? lh * 0.9 : 0);
      if (ay - bh - 14 < 6) below = true;
      let bx = clamp(ax - bw * 0.35, 8, W - bw - 8), by = below ? ay + 18 + (who === 'leo' ? L.panel.h : 0) : ay - bh - 14;
      by = clamp(by, 6, H - bh - 6);
      for (let n = 0; n < 6 && hits(bx, by, bw, bh); n++) { const r = placed.find((q) => bx < q[0] + q[2] + 4 && bx + bw + 4 > q[0] && by < q[1] + q[3] + 4 && by + bh + 4 > q[1]); by = below ? r[1] + r[3] + 8 : r[1] - bh - 8; if (by < 6) { by = r[1] + r[3] + 8; below = true; } by = clamp(by, 6, H - bh - 6); }
      placed.push([bx, by, bw, bh]);
      const k = Math.min(1, b.t / 0.18, (b.dur - b.t) / 0.4);
      g.globalAlpha = clamp(k, 0, 1);
      rr(g, bx, by, bw, bh, 16); g.fillStyle = who === 'leo' ? '#e8fbff' : '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = INK; g.stroke();
      const tx = clamp(ax, bx + 14, bx + bw - 14);
      g.beginPath(); if (below) { g.moveTo(tx - 8, by + 1); g.lineTo(tx, by - 10); g.lineTo(tx + 8, by + 1); } else { g.moveTo(tx - 8, by + bh - 1); g.lineTo(tx, by + bh + 10); g.lineTo(tx + 8, by + bh - 1); }
      g.fillStyle = who === 'leo' ? '#e8fbff' : '#fff'; g.fill(); g.stroke();
      g.fillStyle = who === 'leo' ? '#e8fbff' : '#fff'; g.fillRect(tx - 6.5, below ? by + 1 : by + bh - 3, 13, 3);
      let yy = by + 8 + lh / 2;
      if (label) { text(g, label, bx + 12, yy, fs - 3, '#3f8fe0', 'left'); yy += lh * 0.9; }
      g.font = `700 ${fs}px ${FB}`; g.fillStyle = '#231a4f'; g.textAlign = 'left'; g.textBaseline = 'middle';
      lines.forEach((l) => { g.fillText(l, bx + 12, yy); yy += lh; });
      g.globalAlpha = 1;
    }
  }

  /* ---------- night ---------- */
  function drawNight() {
    if (nightK < 0.01) return;
    const { x, y, r } = L.win;
    g.save();
    g.beginPath(); g.rect(0, 0, W, H); g.arc(x, y, r * 1.08, 0, TAU, true);
    g.fillStyle = `rgba(14,10,52,${0.6 * nightK})`; g.fill('evenodd');
    // window moonlight
    const mg = g.createRadialGradient(x, y, r, x, y, r * 2.4); mg.addColorStop(0, `rgba(159,178,255,${0.22 * nightK})`); mg.addColorStop(1, 'rgba(159,178,255,0)');
    g.fillStyle = mg; g.fillRect(x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
    // glow-in-the-dark star stickers
    const ci = L.inner;
    for (const s of glowStars) {
      const sx = ci.x + 20 + s.x * (ci.w - 40), sy = ci.y + 20 + s.y * (ci.h - 40);
      if (Math.hypot(sx - x, sy - y) < r * 1.2) continue;
      const tw = 0.55 + 0.45 * Math.sin(T * 1.4 + s.p);
      g.globalAlpha = nightK * tw;
      const R = 5 + s.s * 5;
      const gl = g.createRadialGradient(sx, sy, 0, sx, sy, R * 2.4); gl.addColorStop(0, 'rgba(200,255,170,.5)'); gl.addColorStop(1, 'rgba(200,255,170,0)');
      g.fillStyle = gl; circle(g, sx, sy, R * 2.4); g.fill();
      starPath(g, sx, sy, R, R * 0.45, 5, s.p); g.fillStyle = '#e4ffc8'; g.fill();
    }
    g.restore(); g.globalAlpha = 1;
  }

  /* ---------- simulation ---------- */
  function stepCrew(dt) {
    const drift = reduced ? 5 : 16, spin = reduced ? 0.06 : 0.3;
    for (const c of crew) {
      c.modeT += dt;
      if (c.held) { c.rot += wrapA(0 - c.rot) * Math.min(1, dt * 3); continue; }
      if (c.mode === 'toBed') {
        const tp = slotPos(c);
        if (!tp) { c.mode = 'sleep'; continue; }
        const k = Math.min(1, dt * 2.2);
        c.x += (tp[0] - c.x) * k; c.y += (tp[1] - c.y) * k + Math.sin(c.modeT * 3) * 0.3; c.rot += wrapA(0 - c.rot) * k;
        if (Math.hypot(tp[0] - c.x, tp[1] - c.y) < 5 || c.modeT > 4) { c.mode = 'sleep'; c.modeT = 0; c.vx = c.vy = 0; }
        continue;
      }
      if (c.mode === 'sleep') {
        const tp = slotPos(c); if (tp) { c.x = tp[0]; c.y = tp[1]; } c.rot = 0;
        c.zT -= dt; if (c.zT <= 0) { c.zT = rand(1.1, 1.8); const zx = tp ? tp[0] : c.x, zy = tp ? tp[1] - c.R : c.y - c.R; addP({ type: 'z', x: zx + 8, y: zy, vx: rand(6, 16), vy: rand(-26, -16), r: rand(14, 22), life: 2.6 }); }
        continue;
      }
      if (c.mode === 'goto') {
        const tp = spotPos(c.goto, c); const k = Math.min(1, dt * 2.4);
        c.x += (tp[0] - c.x) * k; c.y += (tp[1] - c.y) * k; c.rot += wrapA(0 - c.rot) * k;
        if (Math.hypot(tp[0] - c.x, tp[1] - c.y) < 4 || c.modeT > 3) arrive(c);
        continue;
      }
      if (c.mode === 'bike' || c.mode === 'bath' || c.mode === 'shower') {
        const tp = spotPos(c.mode, c); c.x = tp[0]; c.y = tp[1]; c.rot = c.mode === 'bath' ? Math.sin(T * 2) * 0.06 : 0;
        if (c.modeT > c.dur) leaveSpot(c);
        continue;
      }
      // floating
      c.vx += Math.sin(T * c.f1 + c.p1) * drift * dt;
      c.vy += Math.cos(T * c.f2 + c.p2) * drift * dt;
      if (c.dog && c.chaseUntil > T) {
        const tg = chaseTarget(c);
        if (tg) { const [mx, my] = mouthOf(c); const dx = tg.x - mx, dy = tg.y - my, d = Math.hypot(dx, dy) || 1; c.vx += (dx / d) * 260 * dt; c.vy += (dy / d) * 260 * dt; if (Math.abs(dx) > 8) c.dir = dx > 0 ? 1 : -1;
          if (d < tg.r + c.k * 0.3) { if (tg.big) splitBig(); else popBlob(tg); if (T - (c.lastWoof || -9) > 3) { c.lastWoof = T; const l = pick(linesFor(DOG_CHASE, c.id)); if (l) talk(c.id, l[1]); } } }
      }
      const damp = Math.exp(-(c.eating ? 2 : c.dog && c.chaseUntil > T ? 1.2 : 0.35) * dt); c.vx *= damp; c.vy *= damp;
      const sp = Math.hypot(c.vx, c.vy), maxS = 900; if (sp > maxS) { c.vx *= maxS / sp; c.vy *= maxS / sp; }
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.dog && Math.abs(c.vx) > 25 && !(c.chaseUntil > T)) c.dir = c.vx > 0 ? 1 : -1;
      const b = bounds(c);
      if (c.x < b.l) { c.x = b.l; if (c.vx < 0) { bump(c, -c.vx); c.vx = -c.vx * 0.55; c.vr += c.vy * 0.003; } }
      if (c.x > b.r) { c.x = b.r; if (c.vx > 0) { bump(c, c.vx); c.vx = -c.vx * 0.55; c.vr -= c.vy * 0.003; } }
      if (c.y < b.t) { c.y = b.t; if (c.vy < 0) { bump(c, -c.vy); c.vy = -c.vy * 0.55; c.vr -= c.vx * 0.003; } }
      if (c.y > b.b) { c.y = b.b; if (c.vy > 0) { bump(c, c.vy); c.vy = -c.vy * 0.55; c.vr += c.vx * 0.003; } }
      const target = Math.sin(T * 0.37 + c.p1) * spin;
      c.vr += wrapA(target - c.rot) * 0.6 * dt; c.vr *= Math.exp(-0.6 * dt); c.vr = clamp(c.vr, -7, 7);
      c.rot = wrapA(c.rot + c.vr * dt);
    }
    // soft nudges apart
    for (let i = 0; i < crew.length; i++) for (let j = i + 1; j < crew.length; j++) {
      const a = crew[i], b = crew[j];
      if (a.mode !== 'float' || b.mode !== 'float') continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, m = (a.R + b.R) * 0.8;
      if (d < m) { const f = ((m - d) / m) * 120 * dt, nx = dx / d, ny = dy / d; if (!a.held) { a.vx -= nx * f * 6; a.vy -= ny * f * 6; } if (!b.held) { b.vx += nx * f * 6; b.vy += ny * f * 6; } }
    }
    // eating
    for (const c of crew) if (c.eating) {
      const e = c.eating; e.t += dt; e.emit -= dt;
      const f = FOOD[e.food];
      if (e.emit <= 0) { e.emit = f.few ? 0.45 : 0.18; const [mx, my] = mouthOf(c); crumbs(mx, my, f.few ? 1 : 2, f.col, f.mess); }
      if (e.t > 2.4) finishEating(c);
    }
  }
  function bump(c, speed) {
    if (speed > 160 && T - c.lastBump > 0.4) { c.lastBump = T; sfx('thud', 300); sparkle(c.x, c.y, 3, '#fff6c8'); }
  }
  function slotPos(c) {
    if (c.slot < 0) return null; const sl = L.slots[c.slot];
    return sl.dog ? [sl.cx, sl.cy] : [sl.x + sl.w / 2, sl.y + sl.h * 0.3];
  }
  function spotPos(kind, c) {
    if (kind === 'bike') { const q = bikeGeo(); return [q.seat[0], q.seat[1] - 0.36 * c.k]; }
    if (kind === 'bath') { const t = L.tub; return [t.x + t.w * 0.45, t.y + t.h * 0.45 + t.h * 0.1 - 0.36 * c.k]; }
    const q = showerGeo(); return [q.cx, Math.min(q.bot - 0.9 * c.k, q.top + 0.75 * c.k)];
  }
  function arrive(c) {
    c.mode = c.goto; c.modeT = 0; c.vx = c.vy = 0;
    c.dur = c.mode === 'bike' ? 7 : c.mode === 'bath' ? 8 : 7;
    if (c.mode === 'bike') { talkLine(pickLine(BIKE_LINES, c.id)); leoMaybe(LEO_BIKE, 3200); }
    if (c.mode === 'bath') startBathBubble(c);
    if (c.mode === 'shower') { talkLine(pickLine(SHOWER_LINES, c.id)); sfx('whoosh', 2000); leoMaybe(LEO_SHOWER, 3000); }
  }
  function leaveSpot(c) {
    c.mode = 'float'; c.modeT = 0; c.vx = rand(-60, 60); c.vy = rand(-90, -50); c.vr = rand(-1, 1);
  }
  function chaseTarget(c) {
    if (bath.big) return { x: bath.big.x, y: bath.big.y, r: bath.big.r, big: true };
    let best = null, bd = 1e9; const [mx, my] = mouthOf(c);
    for (const p of parts) if (p.type === 'blob' && p.t < p.life - 1 && p.r > 3) { const d = Math.hypot(p.x - mx, p.y - my); if (d < bd) { bd = d; best = p; } }
    return best;
  }
  function stepWorld(dt) {
    nightK = clamp(nightK + (night ? 1 : -1) * dt * 0.7, 0, 1);
    for (const s of winStars) { s.d += dt * (reduced ? 0.12 : 0.35) * (0.15 + s.d) * s.s; if (s.d > 1.05) { s.d = rand(0.02, 0.15); s.a = rand(0, TAU); } }
    const biker = crew.find((c) => c.mode === 'bike'); bikeAng += dt * (biker ? 7 : 0);
    panelBlip = Math.max(0, panelBlip - dt);
    plantPop = Math.max(0, plantPop - dt);
    // sink tap
    if (sinkFlow > 0) {
      sinkFlow -= dt; sinkEmit -= dt;
      if (sinkEmit <= 0) { sinkEmit = 0.16; const k = L.sink, by = k.y + k.h * 0.62; addP({ type: 'blob', x: k.x + k.w * 0.36, y: by - k.h * 0.14, vx: rand(-18, 30), vy: rand(-45, -15), r: rand(4, 9) * (u / 60 + 0.4), life: rand(10, 14), color: 'rgba(127,211,255,.9)', ph: rand(0, TAU) }); }
    }
    // shower bag zip
    const showerer = crew.find((c) => c.mode === 'shower' || (c.mode === 'goto' && c.goto === 'shower'));
    showerZip = clamp(showerZip + (showerer && showerer.mode === 'shower' ? dt * 1.4 : -dt * 1.6), 0, 1);
    // bath bubble
    if (bath.big) {
      const b = bath.big; b.t += dt;
      if (b.t < 1.6) { b.r = lerp(b.r, b.R, Math.min(1, dt * 3)); bath.water = Math.max(0.15, bath.water - dt * 0.5); b.y -= dt * 20; }
      else { b.x += Math.sin(b.t * 0.9) * 22 * dt + b.vx * dt; b.y += b.vy * dt; b.vy = Math.max(-28, b.vy - dt * 6); }
      const bd = bounds(); if (b.y < bd.t + b.r * 0.4) { b.y = bd.t + b.r * 0.4; b.vy = Math.abs(b.vy) * 0.5; }
      b.x = clamp(b.x, bd.l + b.r, bd.r - b.r);
      if (b.t > 8) splitBig();
    } else if (!crew.some((c) => c.mode === 'bath')) bath.water = Math.min(1, bath.water + dt * 0.12);
    // particles
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.t += dt;
      if (p.t >= p.life) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.type === 'crumb' || p.type === 'blob') { p.vx *= Math.exp(-0.3 * dt); p.vy *= Math.exp(-0.3 * dt); p.vx += Math.sin(T + p.x * 0.01) * 4 * dt; }
      if (p.type === 'blob') { const b = bounds(); if (p.x < b.l - 30 || p.x > b.r + 30) p.vx = -p.vx; if (p.y < L.c.y || p.y > L.inner.y + L.inner.h) p.vy = -p.vy; }
      if (p.type === 'heart' || p.type === 'word') p.vy *= Math.exp(-1.2 * dt);
      if (p.type === 'spark') { p.vx *= Math.exp(-3 * dt); p.vy *= Math.exp(-3 * dt); }
    }
    // flying food
    for (let i = flying.length - 1; i >= 0; i--) {
      const f = flying[i]; f.rot += dt * 1.5;
      if (f.held) continue;
      const c = byId(f.to);
      if (!c || c.mode === 'sleep' || c.mode === 'toBed') { flying.splice(i, 1); continue; }
      const [mx, my] = mouthOf(c), dx = mx - f.x, dy = my - f.y, d = Math.hypot(dx, dy);
      if (d < Math.max(12, c.k * 0.3) && !c.eating) { flying.splice(i, 1); startEating(c, f.id); continue; }
      const k = Math.min(1, dt * (c.eating ? 1.5 : 3.2));
      f.x += dx * k + Math.sin(T * 4 + i) * 0.6; f.y += dy * k;
      if (c.eating && d < c.k * 0.9) { f.x = mx + Math.cos(T * 2 + i) * c.k * 0.9; f.y = my + Math.sin(T * 2 + i) * c.k * 0.9; }
    }
  }
  function startBathBubble(c) {
    talkLine(pickLine(BATH_LINES, c.id)); sfx('whoosh', 2000);
    later(() => {
      const t = L.tub; bath.big = { x: t.x + t.w * 0.5, y: t.y + t.h * 0.42, r: 4, R: Math.max(26, Math.min(u * 0.95, t.w * 0.35)), vx: rand(-8, 8), vy: -14, t: 0 };
      for (const d of dogs()) if (d.mode === 'float') d.chaseUntil = T + 11;
      sfx('jump');
    }, 900);
    later(() => { const others = humans().filter((h) => h !== c && h.mode === 'float'); const l1 = others.length ? pickLine(LAUGH_LINES, pick(others).id) : null; if (l1) talkLine(l1); const d = dogs().find((x) => x.mode === 'float'); if (d) { const l = pickLine(DOG_CHASE, d.id); if (l) talk(d.id, l[1]); } }, 2400);
    later(() => { const l = pickLine(LAUGH_LINES, c.id); if (l) talkLine(l); }, 4600);
    leoMaybe(LEO_BATH, 6200);
  }
  function splitBig() {
    const b = bath.big; if (!b) return; bath.big = null; sfx('blip'); sfx('happy', 800);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + rand(-0.2, 0.2); addP({ type: 'blob', x: b.x + Math.cos(a) * b.r * 0.4, y: b.y + Math.sin(a) * b.r * 0.4, vx: Math.cos(a) * rand(30, 70), vy: Math.sin(a) * rand(30, 70), r: rand(0.18, 0.32) * b.r, life: rand(9, 13), color: 'rgba(127,211,255,.9)', ph: rand(0, TAU) }); }
    for (const d of dogs()) if (d.mode === 'float') d.chaseUntil = Math.max(d.chaseUntil, T + 6);
  }

  /* ---------- food ---------- */
  const suits = (c, fid) => (FOOD[fid].dog ? c.dog : !c.dog);
  function nearestFor(fid, x, y) {
    let best = null, bd = 1e9;
    for (const c of crew) if (c.mode !== 'sleep' && c.mode !== 'toBed' && suits(c, fid)) { const d = Math.hypot(c.x - x, c.y - y); if (d < bd) { bd = d; best = c; } }
    return best;
  }
  function sendFood(fid, x, y, c) {
    if (!c || c.mode === 'sleep' || c.mode === 'toBed') return;
    if (!suits(c, fid)) {
      if (c.dog) { const l = pickLine(DOG_SNIFF, c.id); if (l) talk(c.id, l[1], { cut: true }); }
      else talkLine(pickLine(REFUSE_LINES, c.id), true);
      sfx('oops');
      const alt = nearestFor(fid, c.x, c.y); if (!alt) return;
      c = alt;
    }
    flying.push({ id: fid, x, y, to: c.id, rot: rand(-0.4, 0.4), held: false });
    sfx('whoosh', 1500);
  }
  function startEating(c, fid) {
    c.eating = { food: fid, t: 0, emit: 0 };
    addP({ type: 'word', text: c.dog ? 'chomp!' : 'nom nom', x: c.x + c.R * 0.6, y: c.y - c.R * 0.9, vy: -30, r: 16, life: 1.4, color: '#ffd166' });
  }
  function finishEating(c) {
    c.eating = null; sfx('happy', 400); hearts(c.x, c.y - c.R * 0.6, 4);
    const l = pickLine(EAT_LINES, c.id); if (l) talk(c.id, l[1], { cut: true });
  }
  function drawFlying() {
    for (const f of flying) { const s = Math.max(34, u * 0.75); drawFood(g, f.id, f.x, f.y, s, Math.sin(f.rot) * 0.3); }
    for (const c of crew) if (c.eating) {
      const e = c.eating, [mx, my] = mouthOf(c), k = 1 - clamp(e.t / 2.4, 0, 1);
      drawFood(g, e.food, mx + (c.dog ? 0 : c.k * 0.32), my + c.k * 0.08, Math.max(26, u * 0.62) * (0.35 + 0.65 * k), -0.3);
    }
  }

  /* ---------- tray, card ---------- */
  foodsEl.innerHTML = FOODS.map((f) => `<button type="button" class="cb-food" data-food="${f.id}" aria-label="${esc(f.name)}"><canvas aria-hidden="true"></canvas><span>${esc(f.name)}</span></button>`).join('');
  function paintIcons() {
    foodsEl.querySelectorAll('.cb-food').forEach((b) => {
      const cv = b.querySelector('canvas'), r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(20, r.width || 58), h = Math.max(20, r.height || 58);
      cv.width = Math.round(w * d); cv.height = Math.round(h * d);
      const c2 = cv.getContext('2d'); c2.setTransform(d, 0, 0, d, 0, 0); c2.clearRect(0, 0, w, h);
      drawFood(c2, b.dataset.food, w / 2, h / 2, Math.min(w, h) * 0.86, 0);
    });
  }
  function openTray() {
    if (night) { toast('Shh! Everyone is asleep. Wake them up for breakfast!'); sfx('oops'); return; }
    if (trayOpen) return;
    trayOpen = true; trayEl.hidden = false; paintIcons(); hintEl.classList.add('gone'); placeCard();
    foodBtn.setAttribute('aria-pressed', 'true');
    const l = pick(GALLEY_LINES); talkLine(l, true); sfx('chime', 500);
    live.textContent = 'Space food tray is open.';
  }
  function closeTray() {
    if (!trayOpen) return; trayOpen = false; trayEl.hidden = true; select(null); hideCard(); foodBtn.setAttribute('aria-pressed', 'false');
  }
  function select(fid) {
    selectedFood = fid;
    foodsEl.querySelectorAll('.cb-food').forEach((b) => b.classList.toggle('sel', b.dataset.food === fid));
    tipEl.textContent = fid ? `Now tap who gets the ${FOOD[fid].name.toLowerCase()}!` : 'Drag a food to someone, or tap a food and then tap who gets it.';
    if (fid) showCard(fid);
  }
  function placeCard() {
    if (!trayOpen) { cardEl.style.bottom = ''; cardEl.style.top = ''; return; }
    const tr = trayEl.getBoundingClientRect();
    if (L && !L.land) { cardEl.style.bottom = ''; cardEl.style.top = Math.round(topBar.getBoundingClientRect().bottom + 8) + 'px'; return; }
    cardEl.style.top = ''; cardEl.style.bottom = Math.max(10, H - tr.top + 10) + 'px';
  }
  function showCard(fid) {
    const f = FOOD[fid]; if (!f) return; cardFood = fid;
    cardEl.querySelector('h3').textContent = f.name;
    cardEl.querySelector('p').textContent = f.fact[1];
    cardEl.hidden = false; placeCard();
    live.textContent = f.name + '. ' + f.fact[1];
  }
  function hideCard() { cardEl.hidden = true; cardFood = null; hookStop(); }
  const readBtn = cardEl.querySelector('.cb-read');
  readBtn.addEventListener('click', () => {
    if (!cardFood) return; const f = FOOD[cardFood];
    readBtn.textContent = '🔊 Reading...';
    hookStop(); bubble('leo', f.fact[1], 3 + f.fact[1].length * 0.055);
    hookSpeak(f.fact[1], 'leo').then(() => { if (!closed) readBtn.textContent = '🔊 Read it to me'; });
  });
  cardEl.querySelector('.cb-cardx').addEventListener('click', hideCard);
  $('.cb-x').addEventListener('click', () => closeTray());
  let suppressClick = false;
  foodsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.cb-food'); if (!b) return;
    if (suppressClick) { suppressClick = false; return; }
    const fid = b.dataset.food; sfx('blip');
    select(selectedFood === fid ? null : fid);
  });
  foodsEl.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.cb-food'); if (!b) return;
    const [x, y] = local(e);
    ptr.set(e.pointerId, { kind: 'tray', fid: b.dataset.food, x0: x, y0: y, t: performance.now(), food: null, btn: b });
  });

  /* ---------- actions ---------- */
  function bedtime() {
    if (night) { wake(); return; }
    night = true; closeTray(); releaseAll(); hookStop();
    bedBtn.classList.add('night'); bedBtn.innerHTML = '<b>☀️</b><span>Wake up</span>';
    live.textContent = 'Bedtime. Everyone floats into their sleeping bags.';
    lullaby();
    for (const c of crew) { if (c.mode !== 'sleep' && c.mode !== 'toBed') c.mode = 'float'; c.eating = null; c.chaseUntil = 0; }
    bath.big = null; flying.length = 0;
    const order = crew.slice().sort((a, b) => (a.slot < 0 ? 9 : a.slot) - (b.slot < 0 ? 9 : b.slot)).reverse();
    let spoke = 0;
    order.forEach((c, i) => later(() => {
      if (!night) return;
      c.mode = 'toBed'; c.modeT = 0;
      if (!c.dog && (spoke < 3)) { const l = pickLine(NIGHT_LINES, c.id); if (l) { spoke++; talkLine(l); } }
      else if (c.dog) bubble(c.id, 'Yawn... zzz');
    }, 400 + i * 850));
    later(() => { if (night) leo(LEO_NIGHT); }, 600 + order.length * 850 + 1200);
  }
  function wake() {
    night = false; hookStop(); stopLullaby();
    bedBtn.classList.remove('night'); bedBtn.innerHTML = '<b>🌙</b><span>Bedtime</span>';
    live.textContent = 'Good morning!';
    sfx('chime');
    crew.forEach((c, i) => later(() => {
      if (night) return;
      if (c.mode === 'sleep' || c.mode === 'toBed') { c.mode = 'float'; c.modeT = 0; c.vx = rand(40, 110) * (Math.random() < 0.5 ? -1 : 1); c.vy = rand(-40, 40); c.vr = rand(-1.2, 1.2); sparkle(c.x, c.y, 4, '#ffd166'); }
    }, 200 + i * 300));
    const hs = humans(); const parent = hs.find((h) => h.adult) || hs[0];
    if (parent) later(() => { const l = pickLine(MORNING_LINES, parent.id); if (l) talkLine(l); }, 700);
    const kid = hs.find((h) => h.id === captain) || hs.find((h) => !h.adult);
    if (kid) later(() => { const l = pickLine(MORNING_LINES, kid.id); if (l) talkLine(l); }, 2600);
    later(() => { if (!night) sfx('happy'); }, 900);
    later(() => { if (!night) leo(LEO_MORNING); }, 5200);
  }
  function releaseAll() { for (const [id, p] of ptr) { if (p.kind === 'crew') { p.c.held = false; } } ptr.clear(); }
  function useSpot(kind) {
    if (night) { toast('Shh! Everyone is asleep.'); return; }
    const busy = crew.find((c) => (c.mode === kind) || (c.mode === 'goto' && c.goto === kind));
    if (busy) { if (kind === 'bike') { talkLine(pickLine(BIKE_LINES, busy.id), true); busy.dur = Math.max(busy.dur, busy.modeT + 4); } else if (kind === 'bath' && !bath.big) startBathBubble(busy); else sfx('blip'); return; }
    const free = humans().filter(awakeFree);
    if (!free.length) { sfx('oops'); return; }
    // let the player choose: the captain goes first sometimes, otherwise a random crew member
    const c = Math.random() < 0.35 && free.find((h) => h.id === captain) ? free.find((h) => h.id === captain) : pick(free);
    c.mode = 'goto'; c.goto = kind; c.modeT = 0; c.held = false; sfx('jump');
  }
  function tapPlant() {
    plantLevel = plantLevel >= 4 ? 1 : plantLevel + 1; plantPop = 0.6;
    const p = L.plant; sparkle(p.x + p.w / 2, p.y + p.h * 0.6, 7, '#a8ff8f'); sfx(plantLevel >= 4 ? 'happy' : 'chime', 300);
    const awake = humans().filter((c) => c.mode === 'float');
    if (awake.length && !night) { const l = pickLine(PLANT_LINES, pick(awake).id); if (l) talkLine(l, true); }
    if (!night) leoMaybe(LEO_PLANT, 2400);
  }
  function tapSink() {
    if (night) { toast('Shh! Everyone is asleep.'); return; }
    sinkFlow = 2.4; sinkEmit = 0; sfx('blip');
    const awake = humans().filter((c) => c.mode === 'float');
    if (awake.length) { const l = pickLine(SINK_LINES, pick(awake).id); if (l) talkLine(l, true); }
    if (T - leoLast > 9) { leoLast = T; const fact = LEO_WATER[waterFact++ % LEO_WATER.length]; later(() => { bubble('leo', fact[1], 3 + fact[1].length * 0.055); hookSay('leo', fact[1]); }, 2200); }
    for (const d of dogs()) if (d.mode === 'float') d.chaseUntil = T + 7;
  }
  function tapWindow() {
    const awake = humans().filter((c) => c.mode === 'float');
    if (!awake.length) return; const c = pick(awake);
    const l = pickLine(travelling ? WINDOW_TRAVEL_LINES : WINDOW_STAY_LINES, c.id); if (l) talkLine(l, true);
    sparkle(L.win.x, L.win.y, 6, '#fff6c8'); sfx('chime', 400);
  }
  function tapPanel() {
    panelBlip = 1.2; sfx('blip');
    if (night) return;
    const l = pick(PANEL_LINES);
    if (l[0] === 'leo') { hookStop(); leoLast = T; bubble('leo', l[1]); hookSay('leo', l[1]); }
    else if (byId(l[0]) && byId(l[0]).mode === 'float') talkLine(l, true);
  }
  function tapCrew(c) {
    sfx(c.dog ? 'jump' : 'blip', 200);
    const l = pickLine(TAP_LINES, c.id); if (l) talk(c.id, l[1], { cut: true });
    c.vy -= 60; c.vr += rand(-1.5, 1.5); hearts(c.x, c.y - c.R * 0.7, 2);
  }
  function sleepyTap(c) {
    const l = pickLine(SLEEPY_LINES, c.id);
    if (l) { if (c.dog) bubble(c.id, l[1]); else talk(c.id, l[1], { cut: true }); }
    const tp = slotPos(c) || [c.x, c.y]; addP({ type: 'z', x: tp[0] + 8, y: tp[1] - c.R, vx: 12, vy: -24, r: 22, life: 2.4 });
  }

  /* ---------- lullaby (soft music box, respects the game's mute) ---------- */
  let ac = null, lullGain = null;
  function lullaby() {
    if (isMuted()) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) { sfx('chime'); return; }
      if (!ac) ac = new AC(); if (ac.resume) ac.resume();
      if (lullGain) { try { lullGain.disconnect(); } catch (e) { /* ignore */ } }
      lullGain = ac.createGain(); lullGain.gain.value = 0.16; lullGain.connect(ac.destination);
      // Brahms' Lullaby, first two phrases, as a music box
      const N = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5 };
      const tune = [['E5', 0.5], ['E5', 0.5], ['G5', 1.5], ['E5', 0.5], ['E5', 0.5], ['G5', 1.5], ['E5', 0.5], ['G5', 0.5], ['C6', 1], ['B5', 1], ['A5', 1], ['A5', 1], ['G5', 1.5],
        ['D5', 0.5], ['E5', 0.5], ['F5', 1], ['D5', 1], ['D5', 0.5], ['E5', 0.5], ['F5', 1.5], ['D5', 0.5], ['F5', 0.5], ['B5', 0.5], ['A5', 0.5], ['G5', 1], ['B5', 1], ['C6', 2]];
      let t = ac.currentTime + 0.15; const beat = 0.42;
      for (const [n, d] of tune) {
        const f = N[n];
        [[f, 0.5, 'sine'], [f * 2, 0.12, 'sine']].forEach(([fr, vol, type]) => {
          const o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = fr;
          gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + 0.015); gn.gain.exponentialRampToValueAtTime(0.0008, t + Math.max(0.9, d * beat * 2.2));
          o.connect(gn); gn.connect(lullGain); o.start(t); o.stop(t + Math.max(1, d * beat * 2.2) + 0.05);
        });
        t += d * beat;
      }
      if (ac.state && ac.state !== 'running') sfx('chime');
    } catch (e) { sfx('chime'); }
  }
  function stopLullaby() {
    if (lullGain && ac) { try { lullGain.gain.setTargetAtTime(0, ac.currentTime, 0.15); } catch (e) { /* ignore */ } }
  }

  /* ---------- input ---------- */
  const ptr = new Map();
  function local(e) { const r = root.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function crewAt(x, y) {
    const order = drawOrder();
    for (let i = order.length - 1; i >= 0; i--) {
      const c = order[i];
      if (c.mode === 'sleep' && c.slot >= 0) {
        const sl = L.slots[c.slot];
        if (sl.dog ? Math.hypot(x - sl.cx, y - sl.cy) < sl.r * 1.1 : (x > sl.x - 6 && x < sl.x + sl.w + 6 && y > sl.y - sl.w * 0.7 && y < sl.y + sl.h)) return c;
        continue;
      }
      if (Math.hypot(x - c.x, y - c.y) < c.R * 1.08) return c;
    }
    return null;
  }
  const inR = (r, x, y, m) => r && x >= r.x - (m || 0) && x <= r.x + r.w + (m || 0) && y >= r.y - (m || 0) && y <= r.y + r.h + (m || 0);
  function zoneAt(x, y) {
    if (bath.big && Math.hypot(x - bath.big.x, y - bath.big.y) < bath.big.r * 1.2) return 'bigbubble';
    if (Math.hypot(x - L.win.x, y - L.win.y) < L.win.r) return 'window';
    if (inR(L.panel, x, y)) return 'panel';
    if (inR(L.bunks, x, y)) return 'bunks';
    if (inR(L.galley, x, y)) return 'galley';
    if (inR(L.bike, x, y)) return 'bike';
    if (inR(L.plant, x, y, 6)) return 'plant';
    if (inR(L.sink, x, y)) return 'sink';
    if (inR(L.tub, x, y)) return 'bath';
    if (inR(L.shower, x, y)) return 'shower';
    return null;
  }
  function blobAt(x, y) {
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; if (p.type === 'blob' && p.r > 3 && p.t < p.life - 0.3 && Math.hypot(p.x - x, p.y - y) < p.r + 16) return p; }
    return null;
  }
  function onDown(e) {
    if (closed) return;
    e.preventDefault();
    const [x, y] = local(e);
    try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    const c = crewAt(x, y);
    if (c && !(c.mode === 'sleep' || c.mode === 'toBed') && !selectedFood) {
      if (c.mode !== 'float') { c.mode = 'float'; c.modeT = 0; }
      c.held = true; c.vx = c.vy = 0;
      ptr.set(e.pointerId, { kind: 'crew', c, x0: x, y0: y, t: performance.now(), ox: c.x - x, oy: c.y - y, hist: [[x, y, performance.now()]] });
      sfx('jump', 250);
      return;
    }
    if (c) { ptr.set(e.pointerId, { kind: 'tapcrew', c, x0: x, y0: y, t: performance.now() }); return; }
    const bl = blobAt(x, y);
    if (bl) { popBlob(bl); return; }
    ptr.set(e.pointerId, { kind: 'zone', zone: zoneAt(x, y), x0: x, y0: y, t: performance.now() });
  }
  function onMove(e) {
    const p = ptr.get(e.pointerId); if (!p) return;
    const [x, y] = local(e);
    if (p.kind === 'crew') {
      const c = p.c, b = bounds(c);
      c.x = clamp(x + p.ox, b.l, b.r); c.y = clamp(y + p.oy, b.t, b.b);
      p.hist.push([x, y, performance.now()]); if (p.hist.length > 8) p.hist.shift();
      if (c.dog && Math.abs(x - p.hist[0][0]) > 6) c.dir = x > p.hist[0][0] ? 1 : -1;
    } else if (p.kind === 'tray') {
      if (!p.food && Math.hypot(x - p.x0, y - p.y0) > 12) {
        p.food = { id: p.fid, x, y, to: null, rot: 0, held: true }; flying.push(p.food);
        select(p.fid); suppressClick = true; sfx('blip');
      }
      if (p.food) { p.food.x = x; p.food.y = y - 10; }
    }
  }
  function onUp(e, cancel) {
    const p = ptr.get(e.pointerId); if (!p) return;
    ptr.delete(e.pointerId);
    const [x, y] = local(e);
    const moved = Math.hypot(x - p.x0, y - p.y0) > 14, dt = performance.now() - p.t;
    if (p.kind === 'crew') {
      const c = p.c; c.held = false;
      if (cancel) return;
      if (!moved && dt < 450) { tapCrew(c); return; }
      const h = p.hist, now = performance.now(); let i0 = 0; while (i0 < h.length - 1 && now - h[i0][2] > 120) i0++;
      const a = h[i0], b2 = h[h.length - 1], dtt = Math.max(16, b2[2] - a[2]) / 1000;
      c.vx = clamp(((b2[0] - a[0]) / dtt) * 0.8, -900, 900); c.vy = clamp(((b2[1] - a[1]) / dtt) * 0.8, -900, 900);
      c.vr = clamp(c.vx * 0.006, -6, 6);
      if (Math.hypot(c.vx, c.vy) > 520) { const l = pickLine(FLING_LINES, c.id); if (l && Math.random() < 0.6) talk(c.id, l[1], { cut: true }); sfx('whoosh', 2500); }
    } else if (p.kind === 'tapcrew') {
      if (cancel || moved) return;
      const c = p.c;
      if (c.mode === 'sleep' || c.mode === 'toBed') { sleepyTap(c); return; }
      if (selectedFood) {
        const b = foodsEl.querySelector(`[data-food="${selectedFood}"]`), br = b ? b.getBoundingClientRect() : null, rr0 = root.getBoundingClientRect();
        sendFood(selectedFood, br ? br.left + br.width / 2 - rr0.left : W / 2, br ? br.top + br.height / 2 - rr0.top : H, c);
      }
    } else if (p.kind === 'tray') {
      if (!p.food) return;
      const f = p.food, i = flying.indexOf(f); if (i >= 0) flying.splice(i, 1);
      if (cancel) return;
      const under = crewAt(x, y);
      const target = under && under.mode !== 'sleep' ? under : nearestFor(f.id, x, y);
      sendFood(f.id, f.x, f.y, target);
    } else if (p.kind === 'zone') {
      if (cancel || moved || dt > 900) return;
      doZone(p.zone);
    }
  }
  function doZone(z) {
    if (!z) return;
    hintEl.classList.add('gone');
    if (z === 'bunks') bedtime();
    else if (z === 'galley') { if (trayOpen) closeTray(); else openTray(); }
    else if (z === 'bike') useSpot('bike');
    else if (z === 'bath') useSpot('bath');
    else if (z === 'shower') useSpot('shower');
    else if (z === 'sink') tapSink();
    else if (z === 'plant') tapPlant();
    else if (z === 'window') tapWindow();
    else if (z === 'panel') tapPanel();
    else if (z === 'bigbubble') { splitBig(); const awake = humans().filter((c) => c.mode === 'float'); if (awake.length) { const l = pickLine(LAUGH_LINES, pick(awake).id); if (l) talkLine(l, true); } }
  }
  const onUpEv = (e) => onUp(e, false), onCancel = (e) => onUp(e, true);
  function onKey(e) {
    if (closed) return;
    if (e.key === 'Escape') { e.preventDefault(); if (!cardEl.hidden) hideCard(); else if (trayOpen) closeTray(); else close(); }
  }
  function onResize() { measure(); if (trayOpen) paintIcons(); }
  function onVis() { if (document.hidden) { releaseAll(); last = 0; } }
  const ctxMenu = (e) => e.preventDefault();

  /* ---------- frame ---------- */
  function drawOrder() {
    const a = crew.filter((c) => c.mode !== 'sleep');
    a.sort((p, q) => (p.held ? 1 : 0) - (q.held ? 1 : 0));
    return a;
  }
  function frame(ts) {
    if (closed) return;
    raf = requestAnimationFrame(frame);
    const realDt = last ? Math.min(0.5, (ts - last) / 1000) : 0.016;
    const dt = Math.min(0.05, realDt); last = ts; T += dt;
    for (const [who, b] of bubbles) { b.t += realDt; if (b.t > b.dur) bubbles.delete(who); }
    try {
      stepCrew(dt); stepWorld(dt);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (staticCv) g.drawImage(staticCv, 0, 0, W, H);
      drawWindow(); drawPanel(); drawPlant(); drawBags(); drawBike(); drawTubBack(); drawShowerIdle();
      const showerer = crew.find((c) => c.mode === 'shower');
      if (!showerer && showerZip > 0.01) drawShowerBag(null);
      let tubDrawn = false;
      for (const c of drawOrder()) {
        if (c.dog) drawDog(c); else drawPerson(c);
        if (c.mode === 'bath') { drawTubFront(); tubDrawn = true; }
        if (c.mode === 'shower') drawShowerBag(c);
      }
      if (!tubDrawn) drawTubFront();
      drawBigBubble(); drawFlying(); drawParts(); drawNight();
      for (const p of parts) if (p.type === 'z') { g.globalAlpha = clamp((p.life - p.t) / 0.6, 0, 1); text(g, 'z', p.x, p.y, p.r, '#e4ddff', 'center', { outline: true, stroke: 'rgba(42,31,92,.8)' }); }
      g.globalAlpha = 1;
      drawBubbles();
    } catch (e) { console.error(e); }
  }

  /* ---------- wiring ---------- */
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUpEv);
  window.addEventListener('pointercancel', onCancel);
  root.addEventListener('contextmenu', ctxMenu);
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  document.addEventListener('visibilitychange', onVis);
  let ro = null;
  try { ro = new ResizeObserver(() => onResize()); ro.observe(root); } catch (e) { /* ignore */ }
  $('.cb-close').addEventListener('click', () => close());
  bedBtn.addEventListener('click', () => { hintEl.classList.add('gone'); bedtime(); });
  foodBtn.addEventListener('click', () => { hintEl.classList.add('gone'); if (trayOpen) closeTray(); else openTray(); });

  function close() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    for (const id of timers) clearTimeout(id); timers.clear();
    clearTimeout(toastTimer);
    canvas.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUpEv);
    window.removeEventListener('pointercancel', onCancel);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
    document.removeEventListener('visibilitychange', onVis);
    try { ro?.disconnect(); } catch (e) { /* ignore */ }
    stopLullaby(); if (ac) { try { ac.close(); } catch (e) { /* ignore */ } ac = null; }
    hookStop();
    root.remove(); style.remove();
    if (active === handle) active = null;
    try { prevFocus?.focus?.({ preventScroll: true }); } catch (e) { /* ignore */ }
    try { opts.onClose?.(); } catch (e) { console.error(e); }
  }
  // read-only snapshot used by automated tests
  function peek() {
    return { W, H, u, night, nightK, trayOpen, selectedFood, layout: JSON.parse(JSON.stringify(L)), bigBubble: !!bath.big, blobs: parts.filter((p) => p.type === 'blob').length,
      crew: crew.map((c) => ({ id: c.id, x: Math.round(c.x), y: Math.round(c.y), R: Math.round(c.R), mode: c.mode, held: c.held, eating: c.eating && c.eating.food })), flying: flying.length, bubbles: [...bubbles].map(([w, b]) => [w, b.text]) };
  }
  const handle = { close, peek };
  measure();
  try { root.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  raf = requestAnimationFrame(frame);
  later(() => measure(), 300);
  later(() => { const l = pick(WELCOME_LINES); if (byId(l[0])) talkLine(l); }, 700);
  later(() => hintEl.classList.add('gone'), 12000);
  return handle;
}

function open(opts) {
  if (active) active.close();
  active = createCabin(opts || {});
  return active;
}
window.Cabin = { open, peek: () => (active ? active.peek() : null) };
})();
