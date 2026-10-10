/* Harper's Space Adventure: Home on Earth.
   Inside the family house (a dolls-house cutaway you pan through) and inside Joules and Maggie's kennel.
   Public API: window.Home.open({ room: 'house' | 'kennel', captain, captainName, crew, onClose }) -> { close() }
   crew: [{ id, name, dog, small, adult, shirt, head }] where head is a 128x128 transparent canvas.
   All art is procedural 2D canvas, no network. Spoken lines are ['who', 'text'] pairs with single-quoted literals. */
(function () {
'use strict';

const TAU = Math.PI * 2;
const FD = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif';
const FB = '"Atkinson Hyperlegible", Verdana, system-ui, sans-serif';
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const now = () => performance.now();

/* ======================================================================
   LINES  (who, text). "Harper" means the player; the game swaps names.
   ====================================================================== */
const GREET_HOUSE = [
  ['dad', 'Welcome home, Harper!'],
  ['oda', 'Our house! It did not float away!'],
  ['mum', 'Shoes off, space explorers!'],
];
const GREET_KENNEL = [
  ['harper', 'We shrank! The dogs look like giants!'],
  ['oda', 'Hello, doggies! Can we stay for tea?'],
];
const TAP_HOUSE = [
  ['harper', 'I love being home!'],
  ['harper', 'Can we go stargazing tonight?'],
  ['harper', 'Pluto is still my favourite.'],
  ['harper', 'Rockets are fun, but my bed is comfier!'],
  ['dad', 'Who wants a cup of tea?'],
  ['dad', 'Home sweet home!'],
  ['dad', 'I missed my comfy sofa.'],
  ['dad', 'Did somebody say biscuits?'],
  ['mum', 'It is lovely to be home.'],
  ['mum', 'Space was amazing, but home is the best.'],
  ['mum', 'I missed our garden.'],
  ['mum', 'Who wants to help me make tea?'],
  ['oda', 'Where is my teddy?'],
  ['oda', 'Can the doggies sleep in my room?'],
  ['oda', 'I am not tired. Not even a tiny bit.'],
  ['oda', 'Let us play hide and seek!'],
  ['joules', 'Woof!'],
  ['joules', 'Woof woof!'],
  ['maggie', 'Woof!'],
  ['maggie', 'Arf arf!'],
];
const TAP_KENNEL = [
  ['harper', 'It is so cosy in here!'],
  ['harper', 'Everything looks giant!'],
  ['harper', 'We are dog-sized now!'],
  ['oda', 'I want to live in the kennel!'],
  ['oda', 'The dog bed is so squishy!'],
  ['oda', 'Hello, giant doggies!'],
  ['joules', 'Woof!'],
  ['joules', 'Woof woof!'],
  ['maggie', 'Woof!'],
  ['maggie', 'Arf arf!'],
];
const PAT_LINES = [
  ['joules', 'Woof woof!'],
  ['maggie', 'Woof!'],
];
const PAT_REACT = [
  ['oda', 'Good doggy!'],
  ['harper', 'Who is a good dog? You are!'],
  ['oda', 'Look, a waggy tail!'],
  ['harper', 'Your ears are so soft!'],
];
const DRAG_LINES = [
  ['harper', 'Whoa! Put me down!'],
  ['harper', 'Wheee!'],
  ['dad', 'Look, I am flying!'],
  ['mum', 'Careful, careful!'],
  ['oda', 'Wheee! Again!'],
  ['oda', 'Up, up and away!'],
  ['joules', 'Woof!'],
  ['maggie', 'Woof!'],
];
const DROP_JOKE = [
  ['dad', 'On Earth, things fall down. No floating here!'],
  ['leo', 'That is gravity at work. On Earth it pulls everything down to the ground.'],
];
const FETCH_DONE = [
  ['harper', 'Good dog! Again?'],
  ['oda', 'They brought it back!'],
  ['harper', 'Clever dog!'],
];
const THROW_LINES = [
  ['harper', 'Fetch!'],
  ['oda', 'Go get it!'],
  ['harper', 'Ready, steady, fetch!'],
];
// Living room
const BOOK_FACTS = [
  ['leo', 'Earth is the only planet we know of with dogs. Lucky us!'],
  ['leo', 'Earth is the only planet we know of with liquid water on its surface.'],
  ['leo', 'Earth is the only planet in our solar system not named after a god.'],
  ['leo', 'A day on Pluto lasts about six Earth days!'],
  ['leo', 'Earth travels about 940 million kilometres round the Sun every year.'],
  ['leo', 'Astronauts say one of the things they miss most is home cooking.'],
];
const TV_LINES = [
  ['leo', 'Three, two, one, lift off!'],
  ['oda', 'That is just like our rocket!'],
];
const SOFA_LINES = [
  ['dad', 'Ahh, my comfy sofa. Bliss.'],
  ['oda', 'Bouncy, bouncy sofa!'],
  ['mum', 'Feet off the cushions, please!'],
];
const PHOTO_LINES = [
  ['mum', 'I love this photo wall of us all.'],
  ['dad', 'Look at those lovely faces!'],
  ['oda', 'That one is me! I am smiling!'],
  ['harper', 'Even the dogs have photos!'],
];
const PLANT_LINES = [
  ['mum', 'Hello, plant. Did you miss us?'],
];
const LIGHT_OFF_LINES = [
  ['oda', 'Lights off! Spooky!'],
  ['harper', 'Who turned the lights off?'],
];
const CURTAIN_LINES = [
  ['oda', 'Peekaboo, garden!'],
];
// Kitchen
const FRIDGE_OPEN = [
  ['mum', 'What would you like?'],
];
const SNACK_BISCUIT = [
  ['harper', 'Biscuits! Crunch, crunch!'],
  ['dad', 'Look, the crumbs fall down! In space they would float away.'],
  ['leo', 'Astronauts often eat tortillas instead of bread, because crumbs can float into the equipment.'],
];
const SNACK_APPLE = [
  ['harper', 'A crunchy apple, yum!'],
  ['mum', 'Good choice! An apple a day!'],
  ['leo', 'Fresh fruit is a real treat in space. It arrives on supply ships.'],
];
const SNACK_TOAST = [
  ['harper', 'Toast with lots of butter, please!'],
  ['oda', 'Your crumbs did not float away!'],
  ['leo', 'Astronauts say they miss home cooking. There is no toaster on the space station!'],
];
const OVEN_START = [
  ['mum', 'Fairy cakes are in the oven!'],
];
const OVEN_DONE = [
  ['mum', 'Ding! The fairy cakes are ready!'],
];
const CAKE_LINES = [
  ['oda', 'Yummy! Can I have another one?'],
  ['dad', 'Mmm, still warm!'],
  ['harper', 'Best fairy cakes in the solar system!'],
];
const FISH_LINES = [
  ['oda', 'Hello, Bubbles! Swim, swim!'],
  ['leo', 'Fish have been to space too, in special tanks on the space station.'],
];
const TOASTER_LINES = [
  ['dad', 'Pop! Toast is up!'],
];
const KETTLE_LINES = [
  ['dad', 'Time for a nice cup of tea!'],
];
const CLOCK_LINES = [
  ['mum', 'Look at the time! Nearly teatime.'],
];
const TABLE_LINES = [
  ['mum', 'Dinner will be on the table soon!'],
];
// Bedroom
const PLUTO_FACTS = [
  ['leo', 'Pluto has a giant heart shape on it. It is called Tombaugh Regio.'],
  ['leo', 'Pluto is smaller than our Moon!'],
  ['leo', 'Pluto takes 248 years to go once round the Sun.'],
  ['harper', 'Pluto is my favourite. Small but brave!'],
];
const SCOPE_OPEN = [
  ['harper', 'Let us look at the night sky!'],
  ['harper', 'I wish I could see Pluto from here.'],
  ['leo', 'Pluto is too faint for a small telescope. You would need a really big one!'],
];
const SCOPE_MOON = [
  ['leo', 'The Moon is about 384,000 kilometres away. That is nearly ten times round the Earth!'],
];
const SCOPE_SATURN = [
  ['leo', 'That is Saturn! Even a small telescope can show its rings.'],
];
const SCOPE_ORION = [
  ['harper', 'I can see Orion! Those three stars are his belt.'],
];
const SCOPE_SHOOT = [
  ['oda', 'A shooting star! Quick, make a wish!'],
  ['leo', 'Shooting stars are tiny bits of space dust burning up high in the sky.'],
];
const NIGHT_ON = [
  ['harper', 'Night mode! Look, the stars are glowing!'],
  ['leo', 'Glow-in-the-dark stars soak up light, then give it back slowly in the dark.'],
];
const NIGHT_OFF = [
  ['oda', 'Morning already?'],
];
const BED_LINES = [
  ['mum', 'No bouncing on the bed! Oh, go on then.'],
  ['harper', 'Boing! Boing! Boing!'],
];
const STAR_DAY = [
  ['harper', 'My stars glow in the dark. Try the lamp!'],
];
const STAR_NIGHT = [
  ['harper', 'My very own starry sky!'],
];
// Oda's room
const TEDDY_LINES = [
  ['oda', 'This is Teddy. He wants a big cuddle!'],
  ['oda', 'Teddy went to space too!'],
];
const BLOCK_FALL = [
  ['oda', 'Crash! Again, again!'],
];
const BLOCK_BUILD = [
  ['harper', 'Let us build it taller!'],
];
const MOBILE_LINES = [
  ['oda', 'My planets go round and round!'],
  ['leo', 'The real Earth takes a whole year to go round the Sun.'],
];
const DRAWING_LINES = [
  ['oda', 'I drew everyone! That one is Joules.'],
];
const TOYBOX_LINES = [
  ['oda', 'My toy rocket! Whoosh!'],
];
const ODABED_LINES = [
  ['oda', 'This is my bed. It is just my size!'],
];
const NIGHTLIGHT_LINES = [
  ['oda', 'My star night light keeps the dark away.'],
];
// Kennel
const FOOD_LINES = [
  ['harper', 'Dinner time, doggies!'],
  ['oda', 'They are so hungry!'],
];
const FOOD_DONE = [
  ['harper', 'All gone! Licked clean.'],
];
const WATER_LINES = [
  ['oda', 'They drink so messily!'],
];
const NAP_LINES = [
  ['oda', 'Shh! Nap time.'],
];
const WAKE_LINES = [
  ['harper', 'Wakey wakey, sleepy heads!'],
];
const STASH_LINES = [
  ['harper', 'Look at all these bones! They have been saving them.'],
];
const STASH_HIDE = [
  ['oda', 'They hid it back in the stash!'],
];
const LAIKA_FACTS = [
  ['leo', 'In 1957, a dog called Laika became the first animal to orbit the Earth.'],
];
const DOG_FACTS = [
  ['leo', 'Springer spaniels got their name from springing birds out of bushes.'],
  ['leo', 'Every dog has its own nose print, just like your fingerprints.'],
  ['leo', 'Dogs can hear high sounds that people cannot hear at all.'],
  ['leo', 'Earth is the only planet we know of with dogs. Lucky us!'],
];
const SIGN_LINES = [
  ['oda', 'Joules and Maggie! That is their names!'],
];
const PEEK_LINES = [
  ['dad', 'Knock knock! Room for a little one?'],
  ['mum', 'You all look so tiny in there!'],
  ['dad', 'Is this a dog house or a Harper house?'],
  ['mum', 'Do not forget to come in for tea!'],
];
const TOY_LINES = [
  ['oda', 'Squeak squeak!'],
];
const FAIRY_LIGHT_LINES = [
  ['harper', 'Twinkly lights! So cosy.'],
];

/* ---------------- hooks ---------------- */
function hooks() { return window.GameHooks || null; }
const sfxLast = {};
function sfx(name) {
  const t = now();
  if (sfxLast[name] && t - sfxLast[name] < 90) return;
  sfxLast[name] = t;
  try { const h = hooks(); if (h && typeof h.sfx === 'function') h.sfx(name); } catch (e) { /* ignore */ }
}
let lastVoice = 0;
function hookSay(who, text, interrupt) {
  try {
    const h = hooks(); if (!h || typeof h.say !== 'function') return;
    if (interrupt && now() - lastVoice < 6000 && typeof h.stopSpeaking === 'function') { try { h.stopSpeaking(); } catch (e) { /* ignore */ } }
    lastVoice = now();
    h.say(who, text);
  } catch (e) { /* ignore */ }
}
function hookStop() { try { const h = hooks(); if (h && typeof h.stopSpeaking === 'function') h.stopSpeaking(); } catch (e) { /* ignore */ } }

/* ---------------- drawing helpers ---------------- */
function rr(g, x, y, w, h, r) {
  if (w < 0) { x += w; w = -w; } if (h < 0) { y += h; h = -h; }
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
    const a = (rot || 0) - Math.PI / 2 + (i * Math.PI) / n, rad = i % 2 ? r : R;
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
function pawPath(g, x, y, s) {
  ell(g, x, y + s * 0.25, s * 0.42, s * 0.34); g.fill();
  circle(g, x - s * 0.42, y - s * 0.2, s * 0.17); g.fill();
  circle(g, x - s * 0.15, y - s * 0.45, s * 0.17); g.fill();
  circle(g, x + s * 0.15, y - s * 0.45, s * 0.17); g.fill();
  circle(g, x + s * 0.42, y - s * 0.2, s * 0.17); g.fill();
}
function txt(g, s, x, y, size, color, opts) {
  opts = opts || {};
  g.font = `${opts.weight || 800} ${size}px ${opts.font || FD}`;
  g.textAlign = opts.align || 'center'; g.textBaseline = opts.base || 'middle';
  if (opts.stroke) { g.lineJoin = 'round'; g.lineWidth = opts.lw || Math.max(3, size * 0.18); g.strokeStyle = opts.stroke; g.strokeText(s, x, y); }
  g.fillStyle = color; g.fillText(s, x, y);
}
function wrapLines(g, s, maxW) {
  const words = String(s).split(' '); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (cur && g.measureText(t).width > maxW) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
function hexRgb(h) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '').trim());
  if (m) { const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  const m3 = /^#?([0-9a-f]{3})$/i.exec(String(h || '').trim());
  if (m3) return m3[1].split('').map((c) => parseInt(c + c, 16));
  const mr = /rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(String(h || ''));
  if (mr) return [+mr[1], +mr[2], +mr[3]];
  return [255, 111, 168];
}
function shade(h, amt) {
  const c = hexRgb(h), t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  return `rgb(${Math.round(lerp(c[0], t, p))},${Math.round(lerp(c[1], t, p))},${Math.round(lerp(c[2], t, p))})`;
}
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let glowSprite = null;
function glow() {
  if (glowSprite) return glowSprite;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return (glowSprite = c);
}
const tinted = {};
function glowOf(col) {
  if (tinted[col]) return tinted[col];
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  g.drawImage(glow(), 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, 64, 64);
  return (tinted[col] = c);
}

/* ---------------- people and dogs ---------------- */
const SKIN = '#f3c9a6';
const PANTS = { harper: '#4e3fa8', dad: '#2f4f86', mum: '#5a3d7a', oda: '#ff7fae' };
const PD = {
  adult: { leg: 110, torso: 116, bw: 82, hs: 152, spd: 150 },
  kid: { leg: 78, torso: 88, bw: 68, hs: 142, spd: 175 },
  small: { leg: 54, torso: 68, bw: 58, hs: 128, spd: 150 },
};
const DOG = { bl: 150, bh: 62, lh: 40, hs: 124, spd: 230 };
const BROWN = '#7a3e1d', WHITE = '#fbf6ef';

function fallbackHead(c) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
  if (c.dog) {
    g.fillStyle = BROWN; ell(g, 30, 66, 20, 36, 0.2); g.fill(); ell(g, 98, 66, 20, 36, -0.2); g.fill();
    g.fillStyle = WHITE; circle(g, 64, 60, 36); g.fill(); g.fillStyle = BROWN; ell(g, 52, 46, 16, 14); g.fill();
    g.fillStyle = '#2b1a10'; circle(g, 52, 56, 5); g.fill(); circle(g, 76, 56, 5); g.fill(); ell(g, 64, 74, 8, 6); g.fill();
  } else {
    g.fillStyle = '#6b4226'; circle(g, 64, 56, 44); g.fill();
    g.fillStyle = SKIN; circle(g, 64, 64, 36); g.fill();
    g.fillStyle = '#2b1a3d'; circle(g, 52, 62, 4); g.fill(); circle(g, 76, 62, 4); g.fill();
    g.strokeStyle = '#2b1a3d'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.arc(64, 70, 10, 0.3, Math.PI - 0.3); g.stroke();
  }
  return cv;
}
function sampleSkin(cv) {
  try {
    const c = cv.getContext && cv.getContext('2d'); if (!c) return SKIN;
    const d = c.getImageData(Math.floor(cv.width * 0.5), Math.floor(cv.height * 0.53), 1, 1).data;
    if (d[3] < 200) return SKIN;
    const lum = (d[0] + d[1] + d[2]) / 3;
    if (lum < 70 || d[0] < d[2]) return SKIN;
    return `rgb(${d[0]},${d[1]},${d[2]})`;
  } catch (e) { return SKIN; }
}

/* ======================================================================
   CSS
   ====================================================================== */
const CSS = `
.hm-root{position:fixed;inset:0;z-index:3000;background:#9fdcff;color:var(--ink,#fdf8ff);font-family:var(--body,${FB});font-size:18px;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}
.hm-root *{box-sizing:border-box}
.hm-root [hidden]{display:none!important}
.hm-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
.hm-root button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.hm-root button:focus-visible{outline:3px solid var(--gold,#ffd166);outline-offset:3px}
.hm-top{position:absolute;left:0;right:0;top:0;z-index:5;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 10px) calc(env(safe-area-inset-right,0px) + 12px) 0 calc(env(safe-area-inset-left,0px) + 12px);pointer-events:none}
.hm-top>*{pointer-events:auto}
.hm-back{display:inline-flex;align-items:center;gap:10px;min-height:62px;padding:8px 24px 8px 14px;border-radius:999px;font-family:var(--display,${FD});font-weight:800;font-size:23px;color:#2a0f05!important;background:linear-gradient(180deg,#ffb084,var(--rocket,#ff7a45))!important;box-shadow:0 6px 0 var(--rocket-deep,#d9532a),0 10px 22px rgba(0,0,0,.28);white-space:nowrap}
.hm-back:active{transform:translateY(4px);box-shadow:0 2px 0 var(--rocket-deep,#d9532a)}
.hm-back svg{width:34px;height:34px;flex:none}
.hm-title{margin-left:auto;display:inline-flex;align-items:center;gap:8px;min-height:50px;padding:6px 18px;border-radius:999px;background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));font-family:var(--display,${FD});font-weight:800;font-size:22px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:46vw;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.hm-arrow{position:absolute;top:50%;z-index:4;width:70px;height:70px;margin-top:-35px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.92)!important;color:#3b2a8a!important;box-shadow:0 5px 0 rgba(59,42,138,.35),0 10px 20px rgba(0,0,0,.2);transition:opacity .2s}
.hm-arrow:active{transform:translateY(3px)}
.hm-arrow svg{width:40px;height:40px}
.hm-arrow[disabled]{opacity:0;pointer-events:none}
.hm-left{left:calc(env(safe-area-inset-left,0px) + 10px)}
.hm-right{right:calc(env(safe-area-inset-right,0px) + 10px)}
.hm-tabs{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);transform:translateX(-50%);z-index:4;display:flex;gap:6px;padding:6px;border-radius:999px;background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));max-width:calc(100vw - 16px);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.hm-tab{display:inline-flex;align-items:center;gap:6px;min-height:54px;min-width:54px;justify-content:center;padding:6px 16px;border-radius:999px;font-weight:700;font-size:18px;white-space:nowrap;color:var(--ink,#fdf8ff)}
.hm-tab i{font-style:normal;font-size:24px;line-height:1}
.hm-tab.on{background:var(--gold,#ffd166)!important;color:#3a1d00!important}
.hm-cap{position:absolute;left:50%;top:90px;transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:12px;width:max-content;max-width:min(680px,calc(100vw - 24px));padding:10px 18px 10px 10px;border-radius:22px;background:#fff;color:#231a4f;font-weight:700;font-size:19px;line-height:1.3;box-shadow:0 8px 24px rgba(0,0,0,.3);pointer-events:none;animation:hm-pop .25s ease-out}
.hm-cap b{font-family:var(--display,${FD});font-weight:800;color:#6b4bd8;margin-right:4px}
.hm-cap .hm-av{width:46px;height:46px;flex:none;border-radius:50%;background:#e9e4ff;display:flex;align-items:center;justify-content:center;overflow:hidden}
.hm-cap .hm-av svg,.hm-cap .hm-av canvas{width:46px;height:46px}
.hm-hint{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 96px);z-index:4;padding:10px 20px;border-radius:999px;background:rgba(255,255,255,.94);color:#3b2a8a;font-weight:700;font-size:18px;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,.2);pointer-events:none;animation:hm-hint 7s ease-in-out forwards;max-width:calc(100vw - 24px);overflow:hidden;text-overflow:ellipsis}
.hm-hint.hm-k{bottom:calc(env(safe-area-inset-bottom,0px) + 18px)}
.hm-modal{position:absolute;inset:0;z-index:7;display:flex;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top,0px) + 80px) calc(env(safe-area-inset-right,0px) + 16px) calc(env(safe-area-inset-bottom,0px) + 16px) calc(env(safe-area-inset-left,0px) + 16px);background:rgba(13,11,46,.35)}
.hm-modal.hm-clear{background:none;pointer-events:none;align-items:flex-end}
.hm-modal.hm-clear>*{pointer-events:auto}
.hm-panel{width:100%;max-width:560px;background:var(--panel,rgba(30,25,84,.92));border:2px solid var(--line,rgba(255,255,255,.16));border-radius:28px;padding:18px 20px 20px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.45);animation:hm-pop .25s ease-out;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.hm-panel h2{font-family:var(--display,${FD});font-weight:800;font-size:clamp(28px,6vw,36px);line-height:1.05;margin:2px 0 12px}
.hm-snacks{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.hm-snack{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:132px;padding:10px 6px;border-radius:22px;background:linear-gradient(180deg,#fff,#ffeede)!important;color:#3a1d00!important;font-family:var(--display,${FD});font-weight:800;font-size:22px;box-shadow:0 6px 0 rgba(217,83,42,.35)}
.hm-snack:active{transform:translateY(4px);box-shadow:0 2px 0 rgba(217,83,42,.35)}
.hm-snack span{font-size:58px;line-height:1}
.hm-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:56px;padding:10px 24px;margin-top:14px;border-radius:999px;font-weight:700;font-size:19px;background:rgba(255,255,255,.12)!important;border:2px solid var(--line,rgba(255,255,255,.2))!important;color:var(--ink,#fdf8ff)!important}
.hm-btn.hm-big{font-family:var(--display,${FD});font-weight:800;font-size:23px;min-height:64px;padding:12px 30px;margin:0 0 6px;color:#2a0f05!important;border:0!important;background:linear-gradient(180deg,#ffe7a0,var(--gold,#ffd166))!important;box-shadow:0 6px 0 #c99a2e,0 10px 24px rgba(0,0,0,.4)}
.hm-scoping .hm-arrow,.hm-scoping .hm-tabs,.hm-scoping .hm-hint,.hm-scoping .hm-title{visibility:hidden}
.hm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.hm-probe{position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}
@keyframes hm-pop{from{transform:translateX(-50%) scale(.9);opacity:0}to{transform:translateX(-50%);opacity:1}}
.hm-panel{animation-name:hm-pop2}
@keyframes hm-pop2{from{transform:scale(.92);opacity:0}to{transform:none;opacity:1}}
@keyframes hm-hint{0%{opacity:0}8%{opacity:1}85%{opacity:1}100%{opacity:0;visibility:hidden}}
@media (max-width:700px){.hm-tab span{display:none}.hm-tab.on span{display:inline}.hm-tab{padding:6px 12px;font-size:17px}.hm-hint{font-size:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 88px)}}
@media (max-width:520px){.hm-title{white-space:normal;text-align:center;line-height:1.05;max-width:44vw}.hm-back{font-size:20px;min-height:56px;padding:6px 18px 6px 10px}.hm-back svg{width:30px;height:30px}.hm-title{font-size:17px;padding:4px 12px;min-height:44px}.hm-arrow{width:58px;height:58px;margin-top:-29px}.hm-arrow svg{width:34px;height:34px}.hm-cap{font-size:17px}.hm-snack{min-height:112px;font-size:19px}.hm-snack span{font-size:48px}}
@media (prefers-reduced-motion:reduce){.hm-root *{animation-duration:.01s!important}}
`;
const ICON = {
  door: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 15L16 6l10 9" fill="none" stroke="#2a0f05" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 14v13h15V14" fill="#fff3e0" stroke="#2a0f05" stroke-width="2.6" stroke-linejoin="round"/><rect x="13" y="18" width="6" height="9" rx="1.5" fill="#5fe0c8" stroke="#2a0f05" stroke-width="2"/><circle cx="25" cy="7" r="2.6" fill="#ffd166"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  leo: '<svg viewBox="0 0 46 46" aria-hidden="true"><circle cx="23" cy="24" r="17" fill="#eef2f8" stroke="#9aa6c2" stroke-width="2"/><rect x="11" y="16" width="24" height="15" rx="7.5" fill="#23306e"/><path d="M15 20q4-3 9-1" stroke="#9fd8ff" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="23" cy="6" r="2.5" fill="#ff6fa8"/><path d="M23 8v3" stroke="#9aa6c2" stroke-width="2"/></svg>',
};

/* ======================================================================
   CONTROLLER
   ====================================================================== */
let active = null;
function createHome(opts) {
  const HOUSE = opts.room !== 'kennel';
  const captain = opts.captain === 'oda' ? 'oda' : 'harper';
  const roleId = (who) => (captain === 'oda' ? (who === 'harper' ? 'oda' : who === 'oda' ? 'harper' : who) : who);
  const crewIn = (Array.isArray(opts.crew) ? opts.crew : []).filter((c) => c && c.id);
  const names = {}; crewIn.forEach((c) => { if (c.name) names[c.id] = String(c.name); });
  const DEF_NAMES = { harper: 'Harper', dad: 'Dad', mum: 'Mum', oda: 'Oda', joules: 'Joules', maggie: 'Maggie', leo: 'Leo' };
  const nameOf = (id) => names[id] || DEF_NAMES[id] || id;
  const capName = String(opts.captainName || nameOf(captain));
  function fill(t) {
    try { const h = hooks(); if (h && typeof h.fill === 'function') { const r = h.fill(t); if (typeof r === 'string') return r; } } catch (e) { /* ignore */ }
    return String(t).replace(/\b(Harper|Oda)\b/g, (m) => nameOf(roleId(m.toLowerCase())));
  }

  /* ---------- DOM ---------- */
  const style = document.createElement('style'); style.setAttribute('data-hm', ''); style.textContent = CSS; document.head.appendChild(style);
  const prevFocus = document.activeElement;
  const root = document.createElement('div');
  root.className = 'hm-root'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
  const titleText = HOUSE ? `${capName}'s House` : `${nameOf('joules')} and ${nameOf('maggie')}'s Kennel`;
  root.setAttribute('aria-label', titleText);
  const ROOM_TABS = [['🛋️', 'Living room'], ['🍳', 'Kitchen'], ['🔭', fill('Harper\'s room')], ['🧸', fill('Oda\'s room')]];
  root.innerHTML = `<canvas class="hm-canvas" aria-hidden="true"></canvas>
    <div class="hm-top"><button class="hm-back" type="button">${ICON.door}<span>Back outside</span></button><div class="hm-title">${esc(titleText)}</div></div>
    ${HOUSE ? `<button class="hm-arrow hm-left" type="button" aria-label="Previous room">${ICON.left}</button><button class="hm-arrow hm-right" type="button" aria-label="Next room">${ICON.right}</button>
    <div class="hm-tabs" role="tablist">${ROOM_TABS.map(([ic, n], i) => `<button type="button" role="tab" class="hm-tab" data-room="${i}" aria-label="${esc(n)}"><i aria-hidden="true">${ic}</i><span>${esc(n)}</span></button>`).join('')}</div>` : ''}
    <div class="hm-cap" hidden></div>
    <div class="hm-hint${HOUSE ? '' : ' hm-k'}">${HOUSE ? 'Tap things · drag people · swipe to explore' : 'Tap the dogs, bowls, ball and bed!'}</div>
    <div class="hm-modal" hidden></div><div class="hm-probe"></div><div class="hm-sr" aria-live="polite"></div>`;
  document.body.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const canvas = $('.hm-canvas'), g = canvas.getContext('2d'), topEl = $('.hm-top'), capEl = $('.hm-cap'), modalEl = $('.hm-modal'), probe = $('.hm-probe'), live = $('.hm-sr');
  const tabsEl = $('.hm-tabs'), leftBtn = $('.hm-left'), rightBtn = $('.hm-right'), hintEl = $('.hm-hint');

  let W = 1, H = 1, dpr = 1, raf = 0, last = 0, T = 0, closed = false;
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!closed) { try { fn(); } catch (e) { console.error(e); } } }, ms); timers.add(id); return id; };
  const safe = { top: 0, bottom: 0, left: 0, right: 0 };

  /* ---------- world geometry ---------- */
  const NR = HOUSE ? 4 : 1, RWID = HOUSE ? 1000 : 1200, WORLD_W = NR * RWID;
  const VT = HOUSE ? -70 : -60, VB = HOUSE ? 756 : 748;
  const FY0 = HOUSE ? 634 : 640, FY1 = HOUSE ? 706 : 712;
  let sc = 1, oy = 0, vw = 1000, camX = RWID / 2, camTarget = camX;
  const sx = (wx) => W / 2 + (wx - camX) * sc;
  const sy = (wy) => oy + wy * sc;
  const wxOf = (px) => camX + (px - W / 2) / sc;
  const wyOf = (py) => (py - oy) / sc;
  function camBounds() {
    let lo = vw / 2 - 110, hi = WORLD_W - vw / 2 + 110;
    if (lo > hi) lo = hi = WORLD_W / 2;
    return [lo, hi];
  }
  const clampCam = (x) => { const [lo, hi] = camBounds(); return clamp(x, lo, hi); };
  const roomOfX = (x) => clamp(Math.floor(x / RWID), 0, NR - 1);
  const roomCam = (i) => clampCam(i * RWID + RWID / 2);

  /* ---------- state ---------- */
  const st = {
    dark: [false, false, false, false], curt: [1, 1, 1, 1], curtT: [1, 1, 1, 1],
    tv0: -2.4, fridge: 0, fridgeT: 0, oven: 0, cakes: 0, toast: 0, kettle: 0, fish: 0, bounce: 0, sofa: 0, book: 0,
    mobileA: 0, mobileV: 0, teddy: 0, blocksDown: false, blocksT: 1, nightLines: 0, darkLines: 0,
    food: 0, water: 1, ripple: 0, nap: 0, napK: 0, bedSquish: 0, lightsHue: 0, lightsT: 0,
    clockSpin: 0, peek: null, nextPeek: 14, firstDrop: true, roomSeen: 0, lastRoom: 0,
  };
  const particles = [];
  const items = [];
  let modal = null; // 'snack' | 'scope'
  let scope = null;

  /* ---------- entities ---------- */
  const ents = crewIn.map((c) => {
    const kind = c.dog ? 'dog' : c.adult ? 'adult' : c.small ? 'small' : 'kid';
    let head = c.head; if (!head || !(head.width > 0)) head = fallbackHead(c);
    return {
      id: c.id, kind, dog: !!c.dog, shirt: c.shirt || '#ff6fa8', head, skin: c.dog ? SKIN : sampleSkin(head), pants: PANTS[c.id] || '#4a4a8a',
      x: 0, y: 670, k: 1, face: 1, phase: 0, tx: null, ty: 0, spdMul: 1, cb: null, idle: rand(2, 5), task: null, it: null,
      air: false, vy: 0, ground: 670, drag: false, jumpT: 0, jumpDur: 0.4, jumpH: 0, hopY: 0, sq: 0, wagT: 0, lie: 0, lieT: 0, munch: 0, eat: null,
      bubble: null, mouth: [0, 0], hand: [0, 0], seed: Math.random() * 10, playT: 0, lastLine: '',
    };
  });
  const ent = (id) => ents.find((e) => e.id === id);
  const capEnt = () => ent(captain);
  const otherKid = roleId('oda');
  const dogs = () => ents.filter((e) => e.dog);
  function place(id, x, y, k) { const e = ent(id); if (!e) return; e.x = x; e.y = e.ground = y; e.k = k || 1; e.face = Math.random() < 0.5 ? -1 : 1; }
  if (HOUSE) {
    place(captain, 470, 668); place('dad', 300, 652); place('joules', 640, 690); place('maggie', 800, 676);
    place('mum', 1000 + 560, 660); place(otherKid, 3000 + 420, 668);
    items.push(mkItem('ball', 560, 700));
  } else {
    place('joules', 360, 690, 1.5); place('maggie', 830, 674, 1.5); place(captain, 600, 704, 0.5); place(otherKid, 520, 662, 0.5);
    ents.forEach((e) => { if (!['joules', 'maggie', captain, otherKid].includes(e.id)) e.out = true; });
    items.push(mkItem('ball', 560, 708), mkItem('rope', 1030, 700), mkItem('squeak', 150, 708), mkItem('ring', 900, 712));
  }
  const live_ents = () => ents.filter((e) => !e.out);

  function mkItem(kind, x, y) { return { kind, x, y, z: 0, vx: 0, vz: 0, state: 'rest', holder: null, gone: false, spin: 0, home: null }; }
  function itemR(it) { const s = HOUSE ? 1 : 1.5; return (it.kind === 'ball' ? 16 : it.kind === 'ring' ? 18 : 24) * s; }

  /* ---------- speech ---------- */
  let capTimer = 0, talkTimers = [];
  function entVisible(e) { if (!e || e.out || modal === 'scope') return false; const x = sx(e.x); return x > 30 && x < W - 30; }
  function showCap(id, text, dur) {
    const av = id === 'leo' ? ICON.leo : '';
    capEl.innerHTML = `<span class="hm-av">${av}</span><span><b>${esc(nameOf(id))}</b> ${esc(text)}</span>`;
    if (id !== 'leo') {
      const e = ent(id); const avEl = capEl.querySelector('.hm-av');
      if (e && avEl) { const c = document.createElement('canvas'); c.width = c.height = 92; try { c.getContext('2d').drawImage(e.head, 0, 0, 92, 92); } catch (er) { /* ignore */ } avEl.appendChild(c); }
      else if (avEl) avEl.remove();
    }
    capEl.hidden = false; capEl.style.animation = 'none'; void capEl.offsetWidth; capEl.style.animation = '';
    clearTimeout(capTimer); capTimer = setTimeout(() => { if (!closed) capEl.hidden = true; }, dur);
  }
  function line(who, text, interrupt) {
    const id = roleId(who), t = fill(text), dur = 2000 + t.length * 60;
    const e = ent(id);
    if (who !== 'leo' && e && entVisible(e)) { e.bubble = { text: t, t0: T, dur: dur / 1000 }; if (!e.drag && !e.air && e.lie < 0.5) jump(e, 0.3, 10); }
    else showCap(who === 'leo' ? 'leo' : id, t, dur);
    hookSay(who, text, interrupt);
    live.textContent = `${nameOf(who === 'leo' ? 'leo' : id)}: ${t}`;
  }
  function cancelTalk() { talkTimers.forEach((id) => { clearTimeout(id); timers.delete(id); }); talkTimers = []; }
  let stickyUntil = 0;
  function talk(lines, delay, sticky) {
    if (!sticky && now() < stickyUntil) return;
    cancelTalk();
    let t = delay || 0;
    lines.forEach((l, i) => {
      if (!l) return;
      if (t <= 0 && i === 0) { line(l[0], l[1], true); }
      else { const id = later(() => line(l[0], l[1], i === 0), t); talkTimers.push(id); }
      t += 1100 + fill(l[1]).length * 62;
    });
    stickyUntil = sticky ? now() + t - 600 : 0;
  }
  function talkSoon(lines) { const w = stickyUntil - now(); if (w > 0) later(() => talk(lines), w + 300); else talk(lines); }
  // one line said by a given entity (or role) picked from a list
  function linesFor(list, id) { return list.filter((l) => roleId(l[0]) === id); }
  function sayFrom(list, id) {
    let pool = id ? linesFor(list, id) : list;
    if (!pool.length) return false;
    const e = id ? ent(id) : null;
    if (e && pool.length > 1) pool = pool.filter((l) => l[1] !== e.lastLine);
    const l = pick(pool); if (e) e.lastLine = l[1];
    talk([l]); return true;
  }
  const once = {};
  function cycle(list, key) { const i = (once[key] = ((once[key] == null ? -1 : once[key]) + 1)) % list.length; return list[i]; }
  // a line from the list said by someone who is present (prefers people in view)
  function sayPresent(list, extra) {
    const pool = list.filter((l) => l[0] === 'leo' || (ent(roleId(l[0])) && !ent(roleId(l[0])).out));
    const vis = pool.filter((l) => l[0] !== 'leo' && entVisible(ent(roleId(l[0]))));
    const l = pick(vis.length ? vis : pool.length ? pool : list);
    talk(extra ? [l].concat(extra) : [l]);
  }

  /* ---------- movement ---------- */
  function jump(e, dur, h) { if (e.jumpT > 0) return; e.jumpDur = dur; e.jumpT = dur; e.jumpH = h * (e.dog ? e.k : e.k); }
  function goTo(e, x, y, spd, cb) { e.tx = x; e.ty = clamp(y, FY0, FY1); e.spdMul = spd || 1; e.cb = cb || null; }
  function speedOf(e) { return (e.dog ? DOG.spd : PD[e.kind].spd) * (0.55 + 0.45 * e.k); }
  function bounds(e) {
    if (!HOUSE) return [110, 900];
    const r = roomOfX(e.x); return [r * RWID + 110, r * RWID + 890];
  }
  function wander(e) {
    e.idle = e.dog ? rand(1.5, 4) : rand(3, 7);
    if (Math.random() < 0.3) return;
    const cap = capEnt();
    if (HOUSE && e.dog && cap && !cap.out && Math.abs(cap.x - e.x) > 380) { goTo(e, cap.x + rand(-180, 180), rand(FY0, FY1), 1.1); return; }
    const [a, b] = bounds(e);
    goTo(e, rand(a, b), rand(FY0, FY1), e.dog ? 0.8 : 0.6);
  }
  function freeEnt(e) { return e && !e.out && !e.drag && !e.air && !e.eat && e.lie < 0.05 && st.nap <= 0; }
  function stopTask(e) {
    if (e.it && e.it.holder === e) dropItem(e);
    e.task = null; e.it = null; e.munch = 0; e.tx = null; e.cb = null; e.playT = 0;
  }

  /* ---------- items (balls and toys) ---------- */
  const G = 1800;
  function itemBounds() { return HOUSE ? [40, WORLD_W - 40] : [70, 930]; }
  function throwItem(it, tx, flight) {
    flight = flight || 0.9;
    if (it.holder) { it.holder.it = null; it.holder.task = null; it.holder = null; }
    it.state = 'fly'; it.vz = G * flight / 2; it.vx = (tx - it.x) / flight; it.z = Math.max(it.z, 2); it.spin = rand(-12, 12);
  }
  function dropItem(e) {
    const it = e.it; if (!it) return;
    it.holder = null; it.state = 'fly'; it.x = e.mouth[0]; it.y = clamp(e.y + 4, FY0, FY1 + 6);
    it.z = Math.max(0, it.y - e.mouth[1]); it.vz = 0; it.vx = 0; e.it = null; e.task = null;
  }
  function chase(it, who) {
    const list = (who || dogs()).filter((d) => !d.out && !d.drag && !d.air && st.nap <= 0);
    list.forEach((d, i) => { stopTask(d); d.task = 'chase'; d.it = it; d.spdMul = 2 - i * 0.12; d.lie = 0; d.lieT = 0; d.idle = 3; });
  }
  function grab(e, it) {
    it.state = 'held'; it.holder = e; it.z = 0; e.it = it; e.task = 'carry'; e.wagT = 2;
    dogs().forEach((d) => { if (d !== e && d.task === 'chase' && d.it === it) { d.task = null; d.it = null; d.tx = null; d.wagT = 1.5; d.idle = rand(0.5, 2); } });
    const home = it.home;
    if (home === 'play') { e.playT = 2.6; e.tx = null; return; }
    if (home === 'stash') { goTo(e, 200, 650, 1.3, () => { it.gone = true; e.it = null; e.task = null; it.holder = null; e.wagT = 1.5; sayFrom(STASH_HIDE); }); return; }
    const cap = capEnt();
    let tx, ty;
    if (cap && !cap.out && !cap.drag) { const side = e.x < cap.x ? -1 : 1; tx = cap.x + side * (HOUSE ? 110 : 120); ty = cap.y + 4; }
    else { tx = e.x + rand(-150, 150); ty = rand(FY0, FY1); }
    const [a, b] = itemBounds(); tx = clamp(tx, a + 60, b - 60);
    goTo(e, tx, ty, 1.3, () => {
      e.face = cap ? (cap.x > e.x ? 1 : -1) : e.face; dropItem(e); e.wagT = 2.5; jump(e, 0.35, 14);
      later(() => { talkSoon([[e.id, 'Woof!'], pick(FETCH_DONE)]); }, 250);
    });
  }

  /* ---------- particles ---------- */
  function addP(p) { if (particles.length > 320) particles.shift(); particles.push(p); }
  function hearts(x, y, n) { for (let i = 0; i < (n || 5); i++) addP({ type: 'heart', x: x + rand(-30, 30), y: y + rand(-20, 10), vx: rand(-30, 30), vy: rand(-140, -80), life: rand(1, 1.6), t: 0, s: rand(10, 18) }); }
  function sparkle(x, y, n, col) { for (let i = 0; i < (n || 6); i++) { const a = rand(0, TAU), v = rand(60, 200); addP({ type: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.4, 0.8), t: 0, s: rand(5, 10), col: col || pick(['#ffd166', '#ff6fa8', '#5fe0c8', '#fff']) }); } }
  function crumbs(x, y, ground, n, col) { for (let i = 0; i < n; i++) addP({ type: 'crumb', x: x + rand(-8, 8), y, vx: rand(-60, 60), vy: rand(-80, 10), ground: ground + rand(-4, 6), life: 7, t: 0, s: rand(3, 6), col: col || '#c98a3d' }); }

  /* ---------- layout ---------- */
  const caches = {};
  let cacheKey = '';
  function measure() {
    const r = root.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    const ps = getComputedStyle(probe);
    safe.left = parseFloat(ps.paddingLeft) || 0; safe.right = parseFloat(ps.paddingRight) || 0; safe.bottom = parseFloat(ps.paddingBottom) || 0;
    const topB = topEl.getBoundingClientRect().bottom;
    const botT = tabsEl ? tabsEl.getBoundingClientRect().top : H - safe.bottom - 8;
    const aTop = topB + 6, aBot = botT - 6, aH = Math.max(120, aBot - aTop);
    sc = Math.min(aH / (VB - VT), W / (HOUSE ? 880 : 920));
    vw = W / sc;
    oy = aTop + (aH - (VB - VT) * sc) / 2 - VT * sc;
    capEl.style.top = Math.round(topB + 10) + 'px';
    const key = sc.toFixed(4) + '|' + dpr;
    if (key !== cacheKey) { cacheKey = key; for (const k in caches) delete caches[k]; }
    camX = clampCam(camX); camTarget = clampCam(camTarget);
    if (scope) scope.R = 0;
  }

  /* ======================================================================
     ART: shared pieces
     ====================================================================== */
  function wallAndFloor(g2, col1, col2, floor) {
    const gr = g2.createLinearGradient(0, 0, 0, 600); gr.addColorStop(0, col1); gr.addColorStop(1, col2);
    g2.fillStyle = gr; g2.fillRect(0, -10, 1000, 610);
    // ceiling strip
    g2.fillStyle = 'rgba(255,255,255,.55)'; g2.beginPath(); g2.moveTo(0, -10); g2.lineTo(1000, -10); g2.lineTo(980, 16); g2.lineTo(20, 16); g2.closePath(); g2.fill();
    g2.fillStyle = 'rgba(0,0,0,.06)'; g2.fillRect(0, 16, 1000, 4);
    // skirting
    g2.fillStyle = '#fffaf2'; g2.fillRect(0, 578, 1000, 24); g2.fillStyle = 'rgba(120,80,40,.18)'; g2.fillRect(0, 578, 1000, 3);
    floor(g2);
    // front edge + foundation
    g2.fillStyle = 'rgba(80,40,20,.25)'; g2.fillRect(0, 716, 1000, 5);
    g2.fillStyle = '#c96a4f'; g2.fillRect(0, 721, 1000, 30);
    g2.strokeStyle = 'rgba(110,40,30,.35)'; g2.lineWidth = 2;
    for (let row = 0; row < 2; row++) { const y = 721 + row * 15; g2.beginPath(); g2.moveTo(0, y + 15); g2.lineTo(1000, y + 15); g2.stroke(); for (let x = (row ? 20 : 0); x < 1000; x += 40) { g2.beginPath(); g2.moveTo(x, y); g2.lineTo(x, y + 15); g2.stroke(); } }
  }
  function woodFloor(col) {
    return (g2) => {
      const gr = g2.createLinearGradient(0, 600, 0, 720); gr.addColorStop(0, shade(col, -0.12)); gr.addColorStop(1, col);
      g2.fillStyle = gr; g2.fillRect(0, 600, 1000, 120);
      g2.strokeStyle = 'rgba(90,45,15,.22)'; g2.lineWidth = 2;
      const R = rng(7);
      for (let i = 0; i < 6; i++) {
        const y = 600 + i * 20; g2.beginPath(); g2.moveTo(0, y); g2.lineTo(1000, y); g2.stroke();
        for (let x = (i % 2) * 90 + R() * 60; x < 1000; x += 170 + R() * 40) { g2.beginPath(); g2.moveTo(x, y); g2.lineTo(x, y + 20); g2.stroke(); }
      }
    };
  }
  function tileFloor(a, b) {
    return (g2) => {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 21; c++) {
        g2.fillStyle = (r + c) % 2 ? a : b; g2.fillRect(c * 50 - (r % 2 ? 0 : 0), 600 + r * 30, 50, 30);
      }
      const gr = g2.createLinearGradient(0, 600, 0, 720); gr.addColorStop(0, 'rgba(60,30,60,.14)'); gr.addColorStop(1, 'rgba(60,30,60,0)');
      g2.fillStyle = gr; g2.fillRect(0, 600, 1000, 120);
    };
  }
  function carpetFloor(col) {
    return (g2) => {
      const gr = g2.createLinearGradient(0, 600, 0, 720); gr.addColorStop(0, shade(col, -0.1)); gr.addColorStop(1, col);
      g2.fillStyle = gr; g2.fillRect(0, 600, 1000, 120);
      const R = rng(11); g2.fillStyle = 'rgba(255,255,255,.18)';
      for (let i = 0; i < 160; i++) { circle(g2, R() * 1000, 604 + R() * 112, 1.6 + R() * 1.5); g2.fill(); }
    };
  }
  function lightSwitch(g2, x, y, on) {
    g2.fillStyle = '#fffdf8'; rr(g2, x - 17, y - 27, 34, 54, 7); g2.fill(); g2.strokeStyle = 'rgba(80,60,120,.35)'; g2.lineWidth = 2.5; g2.stroke();
    g2.fillStyle = on ? '#ffd166' : '#b8b2d6'; rr(g2, x - 8, on ? y - 18 : y - 2, 16, 20, 5); g2.fill();
    g2.strokeStyle = 'rgba(80,60,120,.4)'; g2.lineWidth = 2; g2.stroke();
  }
  function ceilingLamp(g2, x, on, col, yb) {
    yb = yb || 94;
    g2.strokeStyle = '#6b5a8a'; g2.lineWidth = 3; g2.beginPath(); g2.moveTo(x, 14); g2.lineTo(x, yb - 34); g2.stroke();
    if (on) { g2.save(); g2.globalAlpha = 0.5; g2.drawImage(glowOf('#fff2b0'), x - 60, yb - 54, 120, 120); g2.restore(); }
    g2.fillStyle = on ? '#fff6c8' : '#d8d2ee'; circle(g2, x, yb - 2, 11); g2.fill();
    g2.fillStyle = col; g2.beginPath(); g2.moveTo(x - 46, yb); g2.quadraticCurveTo(x - 40, yb - 36, x, yb - 36); g2.quadraticCurveTo(x + 40, yb - 36, x + 46, yb); g2.closePath(); g2.fill();
    g2.strokeStyle = shade(col, -0.25); g2.lineWidth = 3; g2.stroke();
  }
  function skyGlass(g2, x, y, w, h, night, T2, seed) {
    if (night) {
      const gr = g2.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#0b1240'); gr.addColorStop(1, '#2c3a8e');
      g2.fillStyle = gr; g2.fillRect(x, y, w, h);
      const R = rng(seed || 3);
      for (let i = 0; i < 18; i++) { const px = x + R() * w, py = y + R() * h * 0.8, tw = 0.5 + 0.5 * Math.sin(T2 * 3 + i); g2.fillStyle = `rgba(255,255,230,${0.5 + tw * 0.5})`; circle(g2, px, py, 1.6 + R() * 1.6); g2.fill(); }
      g2.fillStyle = '#fff6d0'; circle(g2, x + w * 0.72, y + h * 0.28, Math.min(w, h) * 0.12); g2.fill();
      g2.fillStyle = '#20307e'; circle(g2, x + w * 0.76, y + h * 0.25, Math.min(w, h) * 0.1); g2.fill();
      g2.fillStyle = '#132a3a'; for (let i = 0; i < 5; i++) { circle(g2, x + w * (i / 4), y + h + 6, h * 0.22); g2.fill(); }
    } else {
      const gr = g2.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#6cc8ff'); gr.addColorStop(1, '#d8f4ff');
      g2.fillStyle = gr; g2.fillRect(x, y, w, h);
      const cx = x + ((T2 * 8 + (seed || 0) * 70) % (w + 120)) - 60;
      g2.fillStyle = 'rgba(255,255,255,.95)'; circle(g2, cx, y + h * 0.3, 16); g2.fill(); circle(g2, cx + 18, y + h * 0.27, 20); g2.fill(); circle(g2, cx + 38, y + h * 0.31, 14); g2.fill();
      g2.fillStyle = '#5cc46a'; for (let i = 0; i < 5; i++) { circle(g2, x + w * (i / 4), y + h + 8, h * 0.24); g2.fill(); }
      g2.fillStyle = '#48a957'; circle(g2, x + w * 0.2, y + h - 2, h * 0.13); g2.fill(); circle(g2, x + w * 0.85, y + h, h * 0.16); g2.fill();
    }
  }
  function windowWith(g2, x, y, w, h, open, night, col, pat, T2, seed) {
    // frame + glass
    g2.fillStyle = '#ffffff'; rr(g2, x - 12, y - 12, w + 24, h + 24, 14); g2.fill();
    g2.save(); rr(g2, x, y, w, h, 6); g2.clip(); skyGlass(g2, x, y, w, h, night, T2, seed); g2.restore();
    g2.fillStyle = '#ffffff'; g2.fillRect(x + w / 2 - 5, y, 10, h); g2.fillRect(x, y + h * 0.45 - 5, w, 10);
    g2.fillStyle = 'rgba(255,255,255,.35)'; g2.beginPath(); g2.moveTo(x + 10, y + h * 0.4); g2.lineTo(x + w * 0.3, y + 6); g2.lineTo(x + w * 0.38, y + 6); g2.lineTo(x + 16, y + h * 0.4 + 10); g2.closePath(); g2.fill();
    g2.fillStyle = '#f4ece0'; rr(g2, x - 22, y + h + 6, w + 44, 16, 6); g2.fill(); g2.strokeStyle = 'rgba(120,80,40,.25)'; g2.lineWidth = 2; g2.stroke();
    // rod
    g2.fillStyle = '#b07a46'; rr(g2, x - 40, y - 34, w + 80, 9, 4); g2.fill(); circle(g2, x - 40, y - 30, 9); g2.fill(); circle(g2, x + w + 40, y - 30, 9); g2.fill();
    // curtains
    const full = w / 2 + 30, pw = lerp(full, 40, open), ch = h + 54;
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? x - 32 : x + w + 32 - pw;
      g2.save();
      g2.beginPath();
      const waves = Math.max(2, Math.round(pw / 24));
      g2.moveTo(x0, y - 30);
      g2.lineTo(x0 + pw, y - 30);
      if (s < 0) g2.quadraticCurveTo(x0 + pw + 6 * (1 - open), y + ch * 0.6, x0 + pw - 4 + (open * 10), y - 30 + ch);
      else g2.lineTo(x0 + pw, y - 30 + ch);
      for (let i = waves; i >= 0; i--) { const px = x0 + (pw * i) / waves; g2.lineTo(px, y - 30 + ch + (i % 2 ? 6 : 0)); }
      if (s > 0) g2.quadraticCurveTo(x0 - 6 * (1 - open), y + ch * 0.6, x0, y - 30);
      g2.closePath();
      g2.fillStyle = col; g2.fill();
      g2.clip();
      g2.fillStyle = 'rgba(0,0,0,.08)';
      for (let i = 0; i < waves; i++) { const px = x0 + (pw * (i + 0.5)) / waves; g2.fillRect(px - 3, y - 30, 6, ch + 8); }
      if (pat) pat(g2, x0, y - 30, pw, ch);
      g2.restore();
      g2.strokeStyle = shade(col, -0.25); g2.lineWidth = 2.5; g2.beginPath(); g2.moveTo(x0, y - 30); g2.lineTo(x0 + pw, y - 30); g2.stroke();
      // rings
      g2.fillStyle = '#d9a46a'; for (let i = 0; i <= 3; i++) { circle(g2, x0 + (pw * i) / 3, y - 30, 5); g2.fill(); }
      // tie back when open
      if (open > 0.6) { g2.fillStyle = '#ffd166'; rr(g2, x0 + (s < 0 ? -2 : -2), y + h * 0.55, pw + 4, 9, 4); g2.fill(); }
    }
  }
  const dotsPat = (dc) => (g2, x0, y0, w, h) => { g2.fillStyle = dc; const R = rng(5); for (let i = 0; i < (w * h) / 900; i++) { circle(g2, x0 + R() * w, y0 + R() * h, 3.5); g2.fill(); } };
  const starPat = (dc) => (g2, x0, y0, w, h) => { g2.fillStyle = dc; const R = rng(9); for (let i = 0; i < (w * h) / 1300; i++) { starPath(g2, x0 + R() * w, y0 + R() * h, 7, 3, 5, R()); g2.fill(); } };

  function frame3(g2, x, y, w, h, col) {
    g2.fillStyle = 'rgba(60,30,40,.18)'; rr(g2, x + 4, y + 6, w, h, 8); g2.fill();
    g2.fillStyle = col; rr(g2, x, y, w, h, 8); g2.fill(); g2.strokeStyle = shade(col, -0.3); g2.lineWidth = 3; g2.stroke();
    g2.fillStyle = '#fff8ec'; rr(g2, x + 9, y + 9, w - 18, h - 18, 4); g2.fill();
  }

  /* ======================================================================
     ROOMS (house) — local coordinates 0..1000 x, -10..750 y
     ====================================================================== */
  const ROOMS = HOUSE ? [
    { // LIVING ROOM
      bg(g2) {
        wallAndFloor(g2, '#fff0db', '#ffe1c2', woodFloor('#e0a46a'));
        g2.fillStyle = 'rgba(255,190,150,.22)'; for (let x = 20; x < 1000; x += 80) g2.fillRect(x, 20, 36, 558);
        // rug
        g2.fillStyle = '#ff9fb8'; ell(g2, 520, 666, 330, 44); g2.fill();
        g2.strokeStyle = '#ffd166'; g2.lineWidth = 8; ell(g2, 520, 666, 300, 34); g2.stroke();
        g2.strokeStyle = '#fff'; g2.lineWidth = 4; ell(g2, 520, 666, 250, 24); g2.stroke();
        g2.fillStyle = '#fff6c8'; for (let i = 0; i < 7; i++) { starPath(g2, 340 + i * 60, 666 + (i % 2 ? 6 : -6), 9, 4, 5, 0); g2.fill(); }
        // bookshelf
        const x = 40, y = 170, w = 165, h = 430;
        g2.fillStyle = '#b5713c'; rr(g2, x, y, w, h, 10); g2.fill(); g2.strokeStyle = '#8a5028'; g2.lineWidth = 4; g2.stroke();
        g2.fillStyle = '#8f5530'; rr(g2, x + 10, y + 10, w - 20, h - 20, 6); g2.fill();
        const R = rng(42), cols = ['#ff6fa8', '#5fe0c8', '#ffd166', '#7c6cf6', '#ff7a45', '#9fb2ff', '#4fd36a', '#2a2f6e'];
        for (let s = 0; s < 4; s++) {
          const by = y + 10 + ((h - 20) / 4) * (s + 1);
          let bx = x + 14;
          while (bx < x + w - 30) {
            const bw = 13 + R() * 10, bh = 58 + R() * 30, c = cols[Math.floor(R() * cols.length)];
            g2.fillStyle = c; rr(g2, bx, by - 8 - bh, bw - 2, bh, 3); g2.fill();
            g2.fillStyle = 'rgba(255,255,255,.55)'; g2.fillRect(bx + 1, by - 8 - bh + 8, bw - 4, 3); g2.fillRect(bx + 1, by - 22, bw - 4, 3);
            const mk = R();
            if (mk < 0.35) { g2.fillStyle = '#fff6c8'; starPath(g2, bx + bw / 2 - 1, by - 8 - bh / 2, 5, 2.2, 5, 0); g2.fill(); }
            else if (mk < 0.65) { g2.fillStyle = 'rgba(255,255,255,.8)'; circle(g2, bx + bw / 2 - 1, by - 8 - bh / 2, 3.5); g2.fill(); g2.strokeStyle = 'rgba(255,255,255,.8)'; g2.lineWidth = 1.5; g2.beginPath(); g2.ellipse(bx + bw / 2 - 1, by - 8 - bh / 2, 7, 2, -0.3, 0, TAU); g2.stroke(); }
            bx += bw;
          }
          if (s === 1) { g2.save(); g2.translate(x + w - 26, by - 8); g2.rotate(-0.28); g2.fillStyle = '#ff7a45'; rr(g2, 0, -70, 16, 70, 3); g2.fill(); g2.restore(); }
          g2.fillStyle = '#c98450'; g2.fillRect(x + 8, by - 8, w - 16, 10);
        }
        // globe and saturn on top
        g2.fillStyle = '#8a5028'; rr(g2, 66, 160, 30, 10, 3); g2.fill();
        g2.fillStyle = '#3f8fe0'; circle(g2, 81, 132, 26); g2.fill();
        g2.fillStyle = '#4fd36a'; ell(g2, 72, 124, 10, 8, 0.4); g2.fill(); ell(g2, 92, 142, 8, 6, -0.3); g2.fill();
        g2.strokeStyle = '#d9a46a'; g2.lineWidth = 3; g2.beginPath(); g2.arc(81, 132, 32, -2.4, 0.9); g2.stroke();
        g2.fillStyle = '#ffcf7a'; circle(g2, 160, 144, 18); g2.fill();
        g2.strokeStyle = '#e09a3a'; g2.lineWidth = 5; g2.beginPath(); g2.ellipse(160, 144, 32, 8, -0.3, 0, TAU); g2.stroke();
        g2.fillStyle = '#ffcf7a'; g2.beginPath(); g2.arc(160, 144, 18, Math.PI + 0.25, TAU - 0.35); g2.fill();
        // photo wall
        const FR = [[238, 70, 104, 116, '#ff6fa8'], [356, 56, 112, 130, '#ffd166'], [482, 70, 104, 116, '#5fe0c8'], [238, 200, 104, 108, '#9fb2ff'], [356, 200, 112, 108, '#ff9a5c'], [482, 200, 104, 108, '#b9e769']];
        const order = ['harper', 'dad', 'mum', 'oda', 'joules', 'maggie'].map((id) => ents.find((e) => e.id === id)).filter(Boolean);
        FR.forEach(([fx, fy, fw, fh, fc], i) => {
          frame3(g2, fx, fy, fw, fh, fc);
          const e = order[i];
          g2.save(); rr(g2, fx + 9, fy + 9, fw - 18, fh - 18, 4); g2.clip();
          const bgc = ['#d8f0ff', '#ffe9f2', '#e8ffe9', '#fff5d6', '#f0e8ff', '#ffefe0'][i];
          g2.fillStyle = bgc; g2.fillRect(fx, fy, fw, fh);
          if (e) { const s2 = Math.min(fw, fh) * 0.98; g2.drawImage(e.head, fx + fw / 2 - s2 / 2, fy + fh / 2 - s2 / 2 + 4, s2, s2); }
          g2.restore();
        });
        // sofa
        g2.fillStyle = '#5d4fd0'; rr(g2, 236, 580, 328, 16, 6); g2.fill();
        g2.fillStyle = '#6a5be6'; rr(g2, 238, 404, 324, 130, 42); g2.fill();
        g2.fillStyle = '#7c6cf6'; rr(g2, 252, 470, 150, 82, 24); g2.fill(); rr(g2, 398, 470, 150, 82, 24); g2.fill();
        g2.fillStyle = 'rgba(255,255,255,.18)'; rr(g2, 262, 476, 130, 14, 7); g2.fill(); rr(g2, 408, 476, 130, 14, 7); g2.fill();
        g2.fillStyle = '#5d4fd0'; rr(g2, 210, 448, 60, 140, 28); g2.fill(); rr(g2, 530, 448, 60, 140, 28); g2.fill();
        g2.fillStyle = '#7c6cf6'; rr(g2, 214, 446, 52, 40, 20); g2.fill(); rr(g2, 534, 446, 52, 40, 20); g2.fill();
        g2.fillStyle = '#ff6fa8'; g2.save(); g2.translate(296, 448); g2.rotate(-0.15); rr(g2, -36, -32, 72, 64, 22); g2.fill(); g2.fillStyle = 'rgba(255,255,255,.5)'; heartPath(g2, 0, 0, 16); g2.fill(); g2.restore();
        g2.fillStyle = '#ffd166'; starPath(g2, 500, 450, 40, 22, 5, 0.15); g2.fill(); g2.strokeStyle = '#e0a93a'; g2.lineWidth = 3; g2.stroke();
        g2.fillStyle = '#4a3db0'; rr(g2, 250, 588, 14, 14, 4); g2.fill(); rr(g2, 536, 588, 14, 14, 4); g2.fill();
        // blanket over arm
        g2.fillStyle = '#5fe0c8'; g2.beginPath(); g2.moveTo(530, 452); g2.lineTo(590, 452); g2.lineTo(594, 560); g2.lineTo(568, 552); g2.lineTo(548, 566); g2.lineTo(530, 548); g2.closePath(); g2.fill();
        g2.strokeStyle = '#fff'; g2.lineWidth = 3; for (let i = 0; i < 3; i++) { g2.beginPath(); g2.moveTo(532, 470 + i * 26); g2.lineTo(590, 470 + i * 26); g2.stroke(); }
        // TV cabinet
        g2.fillStyle = '#e8a35d'; rr(g2, 612, 486, 276, 112, 12); g2.fill(); g2.strokeStyle = '#b8743a'; g2.lineWidth = 3; g2.stroke();
        g2.strokeStyle = 'rgba(140,80,30,.45)'; g2.beginPath(); g2.moveTo(750, 494); g2.lineTo(750, 590); g2.stroke();
        g2.fillStyle = '#ffd166'; circle(g2, 736, 540, 6); g2.fill(); circle(g2, 764, 540, 6); g2.fill();
        g2.fillStyle = '#9a5a2c'; rr(g2, 624, 596, 18, 6, 2); g2.fill(); rr(g2, 858, 596, 18, 6, 2); g2.fill();
        g2.fillStyle = '#2d2a4a'; rr(g2, 735, 474, 30, 14, 3); g2.fill();
        g2.fillStyle = '#2d2a4a'; rr(g2, 620, 330, 260, 150, 14); g2.fill();
        g2.fillStyle = '#3d3962'; rr(g2, 624, 334, 252, 6, 3); g2.fill();
        // plant
        g2.fillStyle = '#3fae5a';
        const L = [[940, 520, 28, 70, -0.5], [950, 500, 26, 80, 0.2], [925, 490, 22, 75, -0.9], [968, 488, 22, 70, 0.7], [946, 452, 20, 64, -0.1]];
        L.forEach(([lx, ly, rx, ry, a], i) => { g2.fillStyle = i % 2 ? '#3fae5a' : '#58c86e'; ell(g2, lx, ly - ry * 0.6, rx, ry, a); g2.fill(); });
        g2.fillStyle = '#e07a4a'; g2.beginPath(); g2.moveTo(906, 520); g2.lineTo(984, 520); g2.lineTo(972, 600); g2.lineTo(918, 600); g2.closePath(); g2.fill();
        g2.fillStyle = '#c9603a'; rr(g2, 900, 512, 90, 16, 6); g2.fill();
      },
      fg(g2, T2) {
        const dark = st.dark[0];
        windowWith(g2, 650, 96, 190, 196, st.curt[0], dark, '#ff9fc4', dotsPat('rgba(255,255,255,.6)'), T2, 1);
        drawTV(g2, 632, 342, 236, 126, T2);
        lightSwitch(g2, 955, 300, !dark);
        ceilingLamp(g2, 412, !dark, '#ffd166', 50);
        // book that pops out
        if (st.book > 0) {
          const k = Math.sin(Math.min(1, st.book / 0.6) * Math.PI);
          g2.save(); g2.translate(120, 280 - k * 30); g2.rotate(-0.2 * k); g2.fillStyle = '#2a2f6e'; rr(g2, -34, -44, 68, 88, 6); g2.fill();
          g2.fillStyle = '#ffd166'; starPath(g2, 0, -8, 18, 8, 5, 0); g2.fill(); g2.fillStyle = '#5fe0c8'; circle(g2, 16, 22, 8); g2.fill(); g2.restore();
        }
        // sofa squish shine
        if (st.sofa > 0) { g2.fillStyle = `rgba(255,255,255,${st.sofa * 0.5})`; rr(g2, 252, 470, 296, 30, 15); g2.fill(); }
      },
      glow(g2, T2) {
        if (!st.dark[0]) return;
        const fl = 0.85 + 0.15 * Math.sin(T2 * 7);
        g2.globalAlpha = 0.55 * fl; g2.drawImage(glowOf('#9fd8ff'), 520, 250, 460, 380); g2.globalAlpha = 1;
      },
      hot: [
        [925, 262, 60, 80, () => toggleLight(0)],
        [360, 10, 120, 110, () => toggleLight(0)],
        [620, 326, 262, 160, tapTV],
        [600, 60, 290, 250, () => toggleCurtain(0)],
        [230, 50, 362, 270, () => sayPresent(PHOTO_LINES)],
        [36, 100, 175, 500, tapBooks],
        [205, 400, 390, 200, tapSofa],
        [890, 380, 100, 220, () => sayPresent(PLANT_LINES)],
      ],
    },
    { // KITCHEN
      bg(g2) {
        wallAndFloor(g2, '#dcf8ef', '#c3f0e2', tileFloor('#fff6f0', '#ffc9d6'));
        // splashback tiles
        g2.fillStyle = '#ffffff'; g2.fillRect(240, 330, 450, 140);
        g2.strokeStyle = '#bfe9dc'; g2.lineWidth = 2;
        for (let y = 330; y <= 470; y += 28) { g2.beginPath(); g2.moveTo(240, y); g2.lineTo(690, y); g2.stroke(); }
        for (let x = 240; x <= 690; x += 30) { g2.beginPath(); g2.moveTo(x, 330); g2.lineTo(x, 470); g2.stroke(); }
        // hood
        g2.fillStyle = '#c7d0e6'; g2.beginPath(); g2.moveTo(290, 150); g2.lineTo(410, 150); g2.lineTo(446, 236); g2.lineTo(254, 236); g2.closePath(); g2.fill();
        g2.fillStyle = '#aab4ce'; rr(g2, 250, 230, 200, 14, 5); g2.fill(); g2.fillRect(330, 16, 40, 136);
        // cooker body
        g2.fillStyle = '#f3f5fb'; rr(g2, 250, 404, 200, 196, 12); g2.fill(); g2.strokeStyle = '#b8c2dc'; g2.lineWidth = 3; g2.stroke();
        g2.fillStyle = '#3a3550'; rr(g2, 246, 396, 208, 14, 5); g2.fill();
        g2.fillStyle = '#2a2640'; ell(g2, 290, 398, 26, 5); g2.fill(); ell(g2, 360, 398, 30, 6); g2.fill(); ell(g2, 420, 398, 22, 5); g2.fill();
        g2.fillStyle = '#ff7a45'; for (let i = 0; i < 4; i++) { circle(g2, 280 + i * 46, 428, 8); g2.fill(); }
        g2.fillStyle = '#b8c2dc'; rr(g2, 280, 452, 140, 9, 4); g2.fill();
        // saucepan on hob
        g2.fillStyle = '#ff6fa8'; rr(g2, 330, 352, 64, 44, 8); g2.fill(); g2.fillStyle = '#d94f8a'; rr(g2, 322, 348, 80, 9, 4); g2.fill(); g2.fillStyle = '#2a2640'; rr(g2, 394, 360, 40, 7, 3); g2.fill();
        // counter
        g2.fillStyle = '#ff9eb5'; rr(g2, 452, 474, 236, 126, 8); g2.fill();
        g2.strokeStyle = 'rgba(160,50,90,.35)'; g2.lineWidth = 3; g2.beginPath(); g2.moveTo(570, 482); g2.lineTo(570, 592); g2.stroke();
        g2.fillStyle = '#fff'; rr(g2, 545, 520, 8, 30, 4); g2.fill(); rr(g2, 587, 520, 8, 30, 4); g2.fill();
        g2.fillStyle = '#e0b07a'; rr(g2, 444, 462, 252, 16, 5); g2.fill();
        // kettle
        g2.fillStyle = '#5fe0c8'; g2.beginPath(); g2.moveTo(612, 462); g2.lineTo(616, 418); g2.quadraticCurveTo(640, 404, 664, 418); g2.lineTo(668, 462); g2.closePath(); g2.fill();
        g2.strokeStyle = '#2fb8a3'; g2.lineWidth = 6; g2.beginPath(); g2.arc(640, 412, 18, Math.PI * 1.1, Math.PI * 1.9); g2.stroke();
        g2.fillStyle = '#5fe0c8'; g2.beginPath(); g2.moveTo(614, 432); g2.lineTo(594, 420); g2.lineTo(598, 414); g2.lineTo(618, 424); g2.closePath(); g2.fill();
        // table and chairs
        for (const cx of [762, 900]) { g2.fillStyle = '#ffd166'; rr(g2, cx - 26, 404, 52, 80, 12); g2.fill(); g2.fillStyle = '#e8b84a'; rr(g2, cx - 16, 418, 32, 50, 8); g2.fill(); }
        g2.fillStyle = '#d9935b'; rr(g2, 696, 476, 268, 18, 6); g2.fill(); g2.fillStyle = '#b8743a'; rr(g2, 712, 494, 16, 106, 4); g2.fill(); rr(g2, 932, 494, 16, 106, 4); g2.fill();
        g2.fillStyle = '#fff'; g2.beginPath(); g2.moveTo(696, 494); g2.lineTo(964, 494); g2.lineTo(950, 520); g2.lineTo(944, 504); g2.lineTo(930, 524); g2.lineTo(910, 504); g2.lineTo(890, 522); g2.lineTo(870, 504); g2.lineTo(850, 524); g2.lineTo(830, 504); g2.lineTo(810, 522); g2.lineTo(790, 504); g2.lineTo(770, 524); g2.lineTo(750, 504); g2.lineTo(730, 520); g2.lineTo(710, 504); g2.closePath(); g2.globalAlpha = 0.7; g2.fill(); g2.globalAlpha = 1;
        // fruit bowl
        g2.fillStyle = '#ff6b6b'; circle(g2, 900, 458, 12); g2.fill(); g2.fillStyle = '#4fd36a'; circle(g2, 920, 456, 11); g2.fill();
        g2.fillStyle = '#ffd84a'; ell(g2, 884, 452, 18, 7, -0.4); g2.fill(); g2.fillStyle = '#ff9a5c'; circle(g2, 910, 446, 11); g2.fill();
        g2.fillStyle = '#9fb2ff'; g2.beginPath(); g2.moveTo(870, 460); g2.lineTo(940, 460); g2.quadraticCurveTo(936, 478, 905, 478); g2.quadraticCurveTo(874, 478, 870, 460); g2.fill();
        // calendar
        g2.fillStyle = '#fff'; rr(g2, 712, 236, 76, 96, 6); g2.fill(); g2.fillStyle = '#ff6fa8'; rr(g2, 712, 236, 76, 22, 6); g2.fill();
        txt(g2, 'SPACE!', 750, 248, 14, '#fff');
        g2.strokeStyle = '#d0c8ee'; g2.lineWidth = 1.5; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { g2.strokeRect(718 + c * 16, 264 + r * 16, 14, 14); }
        g2.fillStyle = '#ff7a45'; g2.save(); g2.translate(758, 300); g2.rotate(0.5); rr(g2, -4, -10, 8, 20, 4); g2.fill(); g2.restore();
      },
      fg(g2, T2) {
        const dark = st.dark[1];
        windowWith(g2, 472, 112, 170, 168, st.curt[1], dark, '#ffd166', dotsPat('rgba(255,111,168,.55)'), T2, 2);
        drawFish(g2, 557, 262, T2);
        drawFridge(g2, T2);
        drawOvenWindow(g2, T2);
        drawToaster(g2, T2);
        drawClock(g2, 860, 196);
        if (st.kettle > 0) { for (let i = 0; i < 3; i++) { const t3 = (T2 * 0.8 + i / 3) % 1; g2.fillStyle = `rgba(255,255,255,${(1 - t3) * 0.8 * Math.min(1, st.kettle)})`; circle(g2, 590 + Math.sin(t3 * 6 + i) * 8, 410 - t3 * 70, 8 + t3 * 10); g2.fill(); } }
        drawCakes(g2, 790, 476);
        lightSwitch(g2, 965, 300, !dark);
        ceilingLamp(g2, 790, !dark, '#5fe0c8');
      },
      glow(g2, T2) {
        if (!st.dark[1]) return;
        if (st.fridge > 0.2) { g2.globalAlpha = 0.7 * st.fridge; g2.drawImage(glowOf('#e6f7ff'), -60, 200, 360, 420); g2.globalAlpha = 1; }
        if (st.oven > 0) { g2.globalAlpha = 0.6; g2.drawImage(glowOf('#ffb347'), 240, 400, 220, 200); g2.globalAlpha = 1; }
      },
      hot: [
        [935, 262, 60, 80, () => toggleLight(1)],
        [730, 10, 120, 110, () => toggleLight(1)],
        [512, 220, 90, 100, tapFish],
        [40, 128, 190, 474, openFridge],
        [470, 410, 112, 60, tapToaster],
        [590, 396, 90, 72, () => { st.kettle = 3; sfx('blip'); sayPresent(KETTLE_LINES); }],
        [250, 300, 205, 300, tapOven],
        [810, 146, 100, 100, () => { st.clockSpin = 1; sfx('chime'); sayPresent(CLOCK_LINES); }],
        [740, 410, 110, 70, () => (st.cakes > 0 ? eatCake() : sayPresent(TABLE_LINES))],
        [460, 80, 200, 230, () => toggleCurtain(1)],
        [696, 404, 270, 196, () => sayPresent(TABLE_LINES)],
      ],
    },
    { // BEDROOM (captain)
      bg(g2) {
        wallAndFloor(g2, '#c9bbff', '#ab9cff', woodFloor('#d79a62'));
        const R = rng(77); g2.fillStyle = 'rgba(255,255,255,.35)';
        for (let i = 0; i < 70; i++) { starPath(g2, R() * 1000, 120 + R() * 450, 4 + R() * 3, 1.6, 4, 0); g2.fill(); }
        // planet rug
        g2.fillStyle = '#ffb36b'; ell(g2, 520, 664, 230, 40); g2.fill();
        g2.strokeStyle = '#ffe08a'; g2.lineWidth = 10; ell(g2, 520, 664, 200, 30); g2.stroke();
        g2.strokeStyle = '#ff8f5a'; g2.lineWidth = 6; ell(g2, 520, 664, 130, 18); g2.stroke();
        // Pluto poster
        g2.fillStyle = 'rgba(30,20,60,.25)'; rr(g2, 56, 118, 180, 240, 6); g2.fill();
        g2.fillStyle = '#1b1946'; rr(g2, 50, 110, 180, 240, 6); g2.fill();
        const R2 = rng(5); g2.fillStyle = '#fff';
        for (let i = 0; i < 40; i++) { circle(g2, 56 + R2() * 168, 116 + R2() * 228, 0.8 + R2() * 1.4); g2.fill(); }
        const pg = g2.createRadialGradient(118, 190, 8, 140, 210, 66); pg.addColorStop(0, '#f6e1c3'); pg.addColorStop(0.7, '#d8ac82'); pg.addColorStop(1, '#a67652');
        g2.fillStyle = pg; circle(g2, 140, 212, 64); g2.fill();
        g2.save(); circle(g2, 140, 212, 64); g2.clip();
        g2.fillStyle = '#7a4a32'; ell(g2, 96, 246, 40, 18, 0.3); g2.fill(); ell(g2, 120, 266, 30, 10, 0.2); g2.fill();
        g2.fillStyle = '#fff6e8'; heartPath(g2, 162, 226, 36); g2.fill();
        g2.restore();
        g2.strokeStyle = 'rgba(255,255,255,.4)'; g2.lineWidth = 3; g2.beginPath(); g2.arc(140, 212, 70, Math.PI * 1.1, Math.PI * 1.45); g2.stroke();
        txt(g2, 'PLUTO', 140, 314, 34, '#ffd166', { stroke: '#1b1946' });
        g2.fillStyle = 'rgba(255,111,168,.8)'; g2.save(); g2.translate(58, 112); g2.rotate(-0.6); g2.fillRect(-14, -6, 28, 12); g2.restore();
        g2.save(); g2.translate(222, 112); g2.rotate(0.6); g2.fillRect(-14, -6, 28, 12); g2.restore();
        // name bunting
        const nm = nameOf(roleId('harper')).toUpperCase().slice(0, 10);
        const n = Math.max(1, nm.length), bx0 = 540, bx1 = 900, span = bx1 - bx0;
        g2.strokeStyle = '#fff'; g2.lineWidth = 3; g2.beginPath(); g2.moveTo(bx0 - 20, 40); g2.quadraticCurveTo((bx0 + bx1) / 2, 80, bx1 + 20, 40); g2.stroke();
        const fc = ['#ff6fa8', '#ffd166', '#5fe0c8', '#ff9a5c', '#9fb2ff'];
        for (let i = 0; i < n; i++) {
          const t3 = (i + 0.5) / n, fx = bx0 + span * t3, fy = 40 + 4 * 40 * t3 * (1 - t3) * 0.5 + 10 * Math.sin(t3 * Math.PI) * 1.3;
          const fw = Math.min(46, span / n - 4);
          g2.fillStyle = fc[i % fc.length]; g2.beginPath(); g2.moveTo(fx - fw / 2, fy); g2.lineTo(fx + fw / 2, fy); g2.lineTo(fx, fy + fw * 1.15); g2.closePath(); g2.fill();
          txt(g2, nm[i], fx, fy + fw * 0.38, fw * 0.62, '#3a1d6e');
        }
        // telescope
        g2.strokeStyle = '#5b4bb7'; g2.lineWidth = 8; g2.lineCap = 'round';
        g2.beginPath(); g2.moveTo(430, 470); g2.lineTo(372, 598); g2.moveTo(430, 470); g2.lineTo(432, 600); g2.moveTo(430, 470); g2.lineTo(486, 596); g2.stroke();
        g2.save(); g2.translate(430, 452); g2.rotate(-0.62);
        g2.fillStyle = '#f3f0ff'; rr(g2, -96, -20, 170, 40, 14); g2.fill(); g2.strokeStyle = '#8f86e8'; g2.lineWidth = 3; g2.stroke();
        g2.fillStyle = '#5b6cf0'; g2.fillRect(-60, -20, 12, 40); g2.fillRect(20, -20, 12, 40);
        g2.fillStyle = '#ff6fa8'; rr(g2, 70, -26, 26, 52, 8); g2.fill();
        g2.fillStyle = '#2a2f6e'; rr(g2, -116, -9, 24, 18, 5); g2.fill();
        g2.restore();
        g2.fillStyle = '#5b4bb7'; circle(g2, 430, 468, 10); g2.fill();
      },
      fg(g2, T2) {
        const dark = st.dark[2];
        windowWith(g2, 280, 104, 170, 190, st.curt[2], dark, '#5b4bb7', starPat('#ffd166'), T2, 3);
        // telescope tube in front of the window (redrawn so it overlaps curtains nicely)
        g2.save(); g2.translate(430, 452); g2.rotate(-0.62);
        g2.fillStyle = '#f3f0ff'; rr(g2, -96, -20, 170, 40, 14); g2.fill(); g2.strokeStyle = '#8f86e8'; g2.lineWidth = 3; g2.stroke();
        g2.fillStyle = '#5b6cf0'; g2.fillRect(-60, -20, 12, 40); g2.fillRect(20, -20, 12, 40);
        g2.fillStyle = '#ff6fa8'; rr(g2, 70, -26, 26, 52, 8); g2.fill();
        g2.fillStyle = '#2a2f6e'; rr(g2, -116, -9, 24, 18, 5); g2.fill();
        g2.fillStyle = 'rgba(255,255,255,.7)'; rr(g2, -80, -14, 120, 6, 3); g2.fill();
        g2.restore();
        drawBed(g2, T2);
        drawLamp(g2, 942, !dark);
        drawCeilingStars(g2, T2, false);
      },
      glow(g2, T2) {
        if (!st.dark[2]) return;
        drawCeilingStars(g2, T2, true);
        g2.globalAlpha = 0.35; g2.drawImage(glowOf('#9fb8ff'), 230, 60, 280, 300); g2.globalAlpha = 1;
      },
      hot: [
        [890, 380, 105, 220, toggleNight],
        [330, 340, 180, 262, openScope],
        [440, 340, 70, 120, openScope],
        [44, 104, 192, 252, () => { sfx('chime'); talk([cycle(PLUTO_FACTS, 'pluto')]); }],
        [254, 70, 222, 250, () => toggleCurtain(2)],
        [524, 370, 370, 230, tapBed],
        [0, -10, 1000, 130, () => sayPresent(st.dark[2] ? STAR_NIGHT : STAR_DAY)],
      ],
    },
    { // ODA'S ROOM (other kid)
      bg(g2) {
        wallAndFloor(g2, '#fff4c2', '#ffe8a0', carpetFloor('#ffc2d6'));
        g2.fillStyle = 'rgba(255,190,90,.35)';
        for (let y = 50; y < 570; y += 56) for (let x = (y / 56) % 2 ? 30 : 58; x < 1000; x += 56) { circle(g2, x, y, 6); g2.fill(); }
        // rainbow
        const RC = ['#ff8a8a', '#ffb36b', '#ffe08a', '#9be38a', '#8ac8ff', '#c39bff'];
        RC.forEach((c, i) => { g2.strokeStyle = c; g2.lineWidth = 16; g2.beginPath(); g2.arc(790, 380, 170 - i * 16, Math.PI, TAU); g2.stroke(); });
        g2.fillStyle = '#fff'; for (const [cx, cy] of [[620, 384], [960, 384]]) { circle(g2, cx, cy, 24); g2.fill(); circle(g2, cx + 24, cy + 4, 20); g2.fill(); circle(g2, cx - 24, cy + 4, 20); g2.fill(); }
        // crayon drawing
        g2.fillStyle = '#fff'; g2.save(); g2.translate(372, 194); g2.rotate(-0.04); rr(g2, -74, -62, 148, 124, 4); g2.fill();
        g2.strokeStyle = '#ffd166'; g2.lineWidth = 3; circle(g2, 50, -40, 12); g2.stroke();
        const fig = (x, y, h, c) => { g2.strokeStyle = c; g2.lineWidth = 3; g2.lineCap = 'round'; circle(g2, x, y - h, h * 0.22); g2.stroke(); g2.beginPath(); g2.moveTo(x, y - h * 0.78); g2.lineTo(x, y - h * 0.3); g2.moveTo(x - h * 0.25, y - h * 0.6); g2.lineTo(x + h * 0.25, y - h * 0.6); g2.moveTo(x, y - h * 0.3); g2.lineTo(x - h * 0.18, y); g2.moveTo(x, y - h * 0.3); g2.lineTo(x + h * 0.18, y); g2.stroke(); };
        fig(-50, 40, 52, '#3f8fe0'); fig(-24, 40, 50, '#5fe0c8'); fig(2, 40, 38, '#ff6fa8'); fig(22, 40, 30, '#ffb36b');
        g2.strokeStyle = '#7a3e1d'; g2.lineWidth = 3; ell(g2, 48, 32, 12, 7); g2.stroke(); ell(g2, 56, 52, 10, 6); g2.stroke();
        txt(g2, 'MY FAMLY', -10, -44, 16, '#ff6fa8', { weight: 800 });
        g2.restore();
        g2.fillStyle = 'rgba(95,224,200,.8)'; g2.fillRect(352, 126, 40, 10);
        // toy box
        g2.fillStyle = '#ff6fa8'; g2.save(); g2.translate(318, 458); g2.rotate(-0.5); rr(g2, -10, -40, 20, 70, 8); g2.fill(); g2.fillStyle = '#5fe0c8'; circle(g2, 0, -14, 6); g2.fill(); g2.restore();
        g2.fillStyle = '#ffd166'; circle(g2, 420, 478, 22); g2.fill(); g2.fillStyle = '#ff7a45'; g2.fillRect(408, 470, 24, 6);
        g2.fillStyle = '#c98a3d'; circle(g2, 360, 470, 20); g2.fill(); circle(g2, 346, 454, 8); g2.fill(); circle(g2, 374, 454, 8); g2.fill(); g2.fillStyle = '#2b1a10'; circle(g2, 354, 468, 2.5); g2.fill(); circle(g2, 366, 468, 2.5); g2.fill();
        g2.fillStyle = '#5fbff9'; rr(g2, 296, 486, 160, 114, 14); g2.fill(); g2.strokeStyle = '#3a8fd0'; g2.lineWidth = 4; g2.stroke();
        g2.fillStyle = '#3a8fd0'; rr(g2, 290, 480, 172, 18, 8); g2.fill();
        txt(g2, 'TOYS', 376, 546, 30, '#fff', { stroke: '#3a8fd0' });
        // bed
        g2.fillStyle = '#ffffff'; rr(g2, 908, 400, 28, 200, 14); g2.fill(); g2.strokeStyle = '#ffb3cf'; g2.lineWidth = 3; g2.stroke();
        g2.fillStyle = '#ff6fa8'; heartPath(g2, 922, 440, 11); g2.fill();
        g2.fillStyle = '#ffffff'; rr(g2, 640, 470, 26, 130, 12); g2.fill(); g2.stroke();
        g2.fillStyle = '#ffe8f0'; rr(g2, 656, 522, 260, 50, 10); g2.fill();
        g2.fillStyle = '#fff'; rr(g2, 838, 462, 72, 40, 16); g2.fill(); g2.strokeStyle = '#ffd0e0'; g2.stroke();
        g2.fillStyle = '#ff9cc2'; rr(g2, 660, 480, 200, 72, 22); g2.fill();
        g2.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 6; i++) { heartPath(g2, 690 + i * 30, 505 + (i % 2) * 18, 8); g2.fill(); }
        g2.fillStyle = '#ffb3cf'; rr(g2, 660, 480, 200, 14, 7); g2.fill();
      },
      fg(g2, T2) {
        const dark = st.dark[3];
        windowWith(g2, 76, 116, 168, 182, st.curt[3], dark, '#5fe0c8', dotsPat('rgba(255,255,255,.7)'), T2, 4);
        drawMobile(g2, 600, T2);
        drawTeddy(g2, 872, 458, T2);
        drawNightlight(g2, 262, 530, dark);
        lightSwitch(g2, 965, 300, !dark);
      },
      glow(g2) {
        if (!st.dark[3]) return;
        g2.globalAlpha = 0.85; g2.drawImage(glowOf('#ffe28a'), 182, 450, 160, 160); g2.globalAlpha = 1;
      },
      hot: [
        [935, 262, 60, 80, () => toggleLight(3)],
        [836, 404, 76, 82, tapTeddy],
        [490, 0, 220, 200, tapMobile],
        [300, 126, 150, 140, () => sayPresent(DRAWING_LINES)],
        [292, 420, 170, 180, () => { sfx('whoosh'); sparkle(1000 * 3 + 318, 440, 8); sayPresent(TOYBOX_LINES); }],
        [234, 500, 56, 60, () => sayPresent(NIGHTLIGHT_LINES)],
        [52, 80, 216, 250, () => toggleCurtain(3)],
        [640, 400, 300, 200, () => sayPresent(ODABED_LINES)],
      ],
    },
  ] : [];

  /* ---------- room object drawings (dynamic) ---------- */
  function drawTV(g2, x, y, w, h, T2) {
    g2.save(); rr(g2, x, y, w, h, 8); g2.clip();
    const t = (T2 - st.tv0) % 10;
    const up = t < 3 ? 0 : Math.min(1, (t - 3) / 5.5), e2 = up * up;
    const top = `rgb(${Math.round(lerp(110, 10, e2))},${Math.round(lerp(195, 12, e2))},${Math.round(lerp(255, 55, e2))})`;
    const bot = `rgb(${Math.round(lerp(200, 40, e2))},${Math.round(lerp(236, 50, e2))},${Math.round(lerp(255, 130, e2))})`;
    const gr = g2.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, top); gr.addColorStop(1, bot);
    g2.fillStyle = gr; g2.fillRect(x, y, w, h);
    if (e2 > 0.3) { g2.fillStyle = `rgba(255,255,255,${(e2 - 0.3) * 1.2})`; const R = rng(8); for (let i = 0; i < 24; i++) { circle(g2, x + R() * w, y + R() * h, 1.2); g2.fill(); } }
    const gy = y + h - 16 + e2 * h * 1.4;
    const rx = x + w / 2, ry = y + h - 46 - up * 30;
    // smoke
    if (t > 2.6) { const sk = Math.min(1, (t - 2.6) / 1.5); g2.fillStyle = `rgba(255,255,255,${0.9 - up * 0.5})`; for (let i = -3; i <= 3; i++) { circle(g2, rx + i * 18 * sk, gy - 6 - Math.abs(i) * 2, 12 + sk * 8 - Math.abs(i) * 1.5); g2.fill(); } }
    g2.fillStyle = '#5fbf6a'; g2.fillRect(x, gy, w, 40);
    g2.fillStyle = '#7d7a99'; g2.fillRect(rx - 30, gy - 6, 60, 8);
    g2.fillStyle = '#c94a3d'; g2.fillRect(rx + 22, gy - 70, 8, 66); for (let i = 0; i < 5; i++) g2.fillRect(rx + 14, gy - 66 + i * 13, 16, 3);
    // rocket
    if (t > 2.6) {
      const f = 0.8 + 0.2 * Math.sin(T2 * 40);
      g2.fillStyle = '#ffb347'; g2.beginPath(); g2.moveTo(rx - 7, ry + 24); g2.quadraticCurveTo(rx, ry + 24 + 34 * f, rx + 7, ry + 24); g2.fill();
      g2.fillStyle = '#fff3b0'; g2.beginPath(); g2.moveTo(rx - 4, ry + 24); g2.quadraticCurveTo(rx, ry + 24 + 18 * f, rx + 4, ry + 24); g2.fill();
    }
    g2.fillStyle = '#ff7a45'; g2.beginPath(); g2.moveTo(rx - 10, ry + 18); g2.lineTo(rx - 18, ry + 28); g2.lineTo(rx - 9, ry + 26); g2.closePath(); g2.fill();
    g2.beginPath(); g2.moveTo(rx + 10, ry + 18); g2.lineTo(rx + 18, ry + 28); g2.lineTo(rx + 9, ry + 26); g2.closePath(); g2.fill();
    g2.fillStyle = '#fff'; g2.beginPath(); g2.moveTo(rx, ry - 26); g2.quadraticCurveTo(rx + 13, ry - 10, rx + 10, ry + 24); g2.lineTo(rx - 10, ry + 24); g2.quadraticCurveTo(rx - 13, ry - 10, rx, ry - 26); g2.fill();
    g2.fillStyle = '#ff7a45'; g2.beginPath(); g2.moveTo(rx, ry - 26); g2.quadraticCurveTo(rx + 8, ry - 18, rx + 10, ry - 12); g2.lineTo(rx - 10, ry - 12); g2.quadraticCurveTo(rx - 8, ry - 18, rx, ry - 26); g2.fill();
    g2.fillStyle = '#5fe0c8'; circle(g2, rx, ry, 5); g2.fill();
    if (t < 3) txt(g2, String(Math.max(1, Math.ceil(3 - t))), x + 30, y + 30, 34, '#ffd166', { stroke: '#2d2a4a', lw: 5 });
    else if (t < 4.6) txt(g2, 'LIFT OFF!', x + w / 2, y + 24, 26, '#ffd166', { stroke: '#2d2a4a', lw: 5 });
    g2.fillStyle = 'rgba(255,255,255,.08)'; g2.beginPath(); g2.moveTo(x, y); g2.lineTo(x + w * 0.4, y); g2.lineTo(x + w * 0.15, y + h); g2.lineTo(x, y + h); g2.closePath(); g2.fill();
    g2.restore();
  }
  function drawFish(g2, cx, cy, T2) {
    // bowl water
    g2.save();
    g2.beginPath(); g2.arc(cx, cy, 44, -0.2 * Math.PI - 0.6, Math.PI * 1.2 + 0.6, false); g2.closePath();
    g2.fillStyle = 'rgba(160,226,255,.75)'; g2.fill();
    g2.clip();
    g2.fillStyle = '#ffd8a8'; ell(g2, cx, cy + 40, 40, 12); g2.fill();
    g2.fillStyle = '#ff9a5c'; circle(g2, cx - 14, cy + 32, 4); g2.fill(); g2.fillStyle = '#9fb2ff'; circle(g2, cx + 10, cy + 34, 5); g2.fill();
    g2.strokeStyle = '#3fae5a'; g2.lineWidth = 4; g2.beginPath(); g2.moveTo(cx + 22, cy + 38); g2.quadraticCurveTo(cx + 30, cy + 10, cx + 20, cy - 4); g2.stroke();
    const ph = T2 * 0.9, fx = cx + Math.sin(ph) * 18, fy = cy + 6 + Math.sin(T2 * 1.7) * 5, dir = Math.cos(ph) >= 0 ? 1 : -1;
    g2.save(); g2.translate(fx, fy); g2.scale(dir, 1); if (st.fish > 0) g2.rotate((1 - st.fish) * TAU);
    const wag = Math.sin(T2 * 10) * 0.3;
    g2.fillStyle = '#ff8a2a'; g2.beginPath(); g2.moveTo(-12, 0); g2.lineTo(-24, -9 + wag * 8); g2.lineTo(-24, 9 + wag * 8); g2.closePath(); g2.fill();
    ell(g2, 0, 0, 15, 10); g2.fill();
    g2.fillStyle = '#ffb36b'; ell(g2, 2, 3, 8, 4); g2.fill();
    g2.fillStyle = '#fff'; circle(g2, 7, -3, 3.5); g2.fill(); g2.fillStyle = '#2b1a3d'; circle(g2, 8, -3, 2); g2.fill();
    g2.restore();
    for (let i = 0; i < 3; i++) { const t3 = (T2 * 0.5 + i / 3) % 1; g2.strokeStyle = 'rgba(255,255,255,.8)'; g2.lineWidth = 1.5; circle(g2, cx - 10 + i * 8, cy + 30 - t3 * 60, 2 + i); g2.stroke(); }
    g2.restore();
    g2.strokeStyle = 'rgba(255,255,255,.95)'; g2.lineWidth = 3; g2.beginPath(); g2.arc(cx, cy, 44, -0.2 * Math.PI - 0.6, Math.PI * 1.2 + 0.6, false); g2.stroke();
    g2.strokeStyle = 'rgba(255,255,255,.7)'; g2.lineWidth = 4; g2.beginPath(); g2.arc(cx, cy, 34, Math.PI * 1.05, Math.PI * 1.35); g2.stroke();
    g2.fillStyle = '#9fe3ff'; ell(g2, cx, cy - 30, 26, 5); g2.globalAlpha = 0.6; g2.fill(); g2.globalAlpha = 1;
  }
  function drawFridge(g2) {
    const x = 40, y = 128, w = 186, h = 472;
    g2.fillStyle = 'rgba(40,60,80,.12)'; rr(g2, x + 6, y + 8, w, h, 22); g2.fill();
    g2.fillStyle = '#eef3ff'; rr(g2, x, y, w, h, 22); g2.fill(); g2.strokeStyle = '#b8c2dc'; g2.lineWidth = 3; g2.stroke();
    // inside (lower compartment)
    const o = st.fridge;
    if (o > 0.02) {
      g2.fillStyle = '#d8f2ff'; rr(g2, x + 12, y + 160, w - 24, h - 176, 12); g2.fill();
      g2.fillStyle = 'rgba(255,255,255,.9)'; for (const sy2 of [270, 370, 460]) g2.fillRect(x + 14, sy2, w - 28, 6);
      g2.fillStyle = '#fff'; rr(g2, x + 26, 214, 30, 56, 6); g2.fill(); g2.fillStyle = '#5fbff9'; g2.fillRect(x + 26, 236, 30, 14);
      g2.fillStyle = '#ffd84a'; g2.beginPath(); g2.moveTo(x + 76, 270); g2.lineTo(x + 126, 270); g2.lineTo(x + 76, 238); g2.closePath(); g2.fill();
      g2.fillStyle = '#ff6b6b'; circle(g2, x + 46, 352, 14); g2.fill(); circle(g2, x + 76, 354, 13); g2.fill(); g2.fillStyle = '#4fd36a'; circle(g2, x + 104, 354, 13); g2.fill();
      g2.fillStyle = '#ff9fc4'; rr(g2, x + 120, 330, 34, 40, 8); g2.fill();
      g2.fillStyle = '#e9b46a'; rr(g2, x + 30, 420, 70, 40, 8); g2.fill(); g2.fillStyle = '#c98a3d'; for (let i = 0; i < 4; i++) { circle(g2, x + 44 + i * 14, 440, 4); g2.fill(); }
      g2.fillStyle = '#5fe0c8'; rr(g2, x + 112, 412, 44, 48, 10); g2.fill();
      g2.globalAlpha = 0.4 * o; g2.drawImage(glowOf('#ffffff'), x - 10, y + 150, w + 20, h - 150); g2.globalAlpha = 1;
    }
    // freezer door
    g2.fillStyle = '#f7f9ff'; rr(g2, x + 6, y + 6, w - 12, 146, 18); g2.fill();
    g2.fillStyle = '#c3cbe0'; rr(g2, x + w - 30, y + 40, 10, 70, 5); g2.fill();
    // main door (swings open towards the left)
    const ang = o * 1.75, cw = (w - 12) * Math.cos(ang), skew = Math.sin(ang) * 18;
    const hx = x + 6, dy0 = y + 158, dy1 = y + h - 6;
    g2.fillStyle = cw > 0 ? '#f7f9ff' : '#dfe6f6';
    g2.beginPath(); g2.moveTo(hx, dy0); g2.lineTo(hx + cw, dy0 - skew); g2.lineTo(hx + cw, dy1 + skew); g2.lineTo(hx, dy1); g2.closePath(); g2.fill();
    g2.strokeStyle = '#b8c2dc'; g2.lineWidth = 2.5; g2.stroke();
    if (cw > 60) {
      const k = cw / (w - 12);
      g2.fillStyle = '#c3cbe0'; rr(g2, hx + cw - 26 * k, dy0 + 30, 10 * k, 120, 5); g2.fill();
      // magnets
      g2.save(); g2.translate(hx, 0); g2.scale(k, 1);
      txt(g2, 'H', 40, dy0 + 60, 30, '#ff6fa8', { stroke: '#fff', lw: 4 });
      txt(g2, 'O', 70, dy0 + 74, 30, '#5fbff9', { stroke: '#fff', lw: 4 });
      txt(g2, 'M', 100, dy0 + 58, 30, '#4fd36a', { stroke: '#fff', lw: 4 });
      txt(g2, 'E', 128, dy0 + 76, 30, '#ffb347', { stroke: '#fff', lw: 4 });
      g2.fillStyle = '#fff'; rr(g2, 34, dy0 + 120, 80, 96, 4); g2.fill(); g2.strokeStyle = '#e8e0ff'; g2.lineWidth = 2; g2.stroke();
      g2.fillStyle = '#ff7a45'; g2.beginPath(); g2.moveTo(74, dy0 + 134); g2.quadraticCurveTo(88, dy0 + 160, 84, dy0 + 196); g2.lineTo(64, dy0 + 196); g2.quadraticCurveTo(60, dy0 + 160, 74, dy0 + 134); g2.fill();
      g2.fillStyle = '#ffd166'; g2.beginPath(); g2.moveTo(66, dy0 + 196); g2.lineTo(74, dy0 + 210); g2.lineTo(82, dy0 + 196); g2.fill();
      g2.fillStyle = '#ff6fa8'; circle(g2, 74, dy0 + 120, 7); g2.fill();
      g2.fillStyle = '#ffd166'; starPath(g2, 140, dy0 + 250, 16, 7, 5, 0.2); g2.fill();
      g2.restore();
    }
  }
  function drawOvenWindow(g2, T2) {
    const on = st.oven > 0;
    g2.fillStyle = on ? `rgb(255,${Math.round(150 + 30 * Math.sin(T2 * 6))},70)` : '#3a3550';
    rr(g2, 282, 476, 136, 96, 12); g2.fill();
    g2.strokeStyle = '#b8c2dc'; g2.lineWidth = 4; g2.stroke();
    if (on) {
      g2.fillStyle = '#c98a3d'; for (let i = 0; i < 4; i++) { ell(g2, 304 + i * 31, 548, 12, 8); g2.fill(); }
      const k = 1 - st.oven / 4; g2.fillStyle = '#e9b46a'; for (let i = 0; i < 4; i++) { ell(g2, 304 + i * 31, 542 - k * 6, 13, 6 + k * 6); g2.fill(); }
    } else { g2.fillStyle = 'rgba(255,255,255,.18)'; g2.beginPath(); g2.moveTo(290, 566); g2.lineTo(330, 482); g2.lineTo(350, 482); g2.lineTo(310, 566); g2.fill(); }
  }
  function drawToaster(g2) {
    const p = st.toast > 0 ? Math.sin(Math.min(1, (1.6 - st.toast) / 0.25) * Math.PI / 2) : 0;
    g2.fillStyle = '#e9b46a';
    for (const tx of [494, 528]) { rr(g2, tx, 430 - p * 40, 26, 34, 6); g2.fill(); g2.fillStyle = '#d99a4a'; rr(g2, tx, 430 - p * 40, 26, 6, 3); g2.fill(); g2.fillStyle = '#e9b46a'; }
    g2.fillStyle = '#c8d2e6'; rr(g2, 482, 424, 92, 40, 14); g2.fill(); g2.strokeStyle = '#9aa6c2'; g2.lineWidth = 2.5; g2.stroke();
    g2.fillStyle = '#6b7590'; rr(g2, 492, 424, 30, 6, 3); g2.fill(); rr(g2, 526, 424, 30, 6, 3); g2.fill();
    g2.fillStyle = '#ff6fa8'; rr(g2, 570, 436 + (p > 0 ? 0 : 14), 12, 8, 3); g2.fill();
    g2.fillStyle = 'rgba(255,255,255,.6)'; rr(g2, 488, 432, 50, 5, 2); g2.fill();
  }
  function drawClock(g2, cx, cy) {
    g2.fillStyle = '#ff6fa8'; circle(g2, cx, cy, 46); g2.fill(); g2.fillStyle = '#fff'; circle(g2, cx, cy, 38); g2.fill();
    g2.fillStyle = '#7c6cf6'; for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; circle(g2, cx + Math.sin(a) * 31, cy - Math.cos(a) * 31, i % 3 ? 2 : 3.5); g2.fill(); }
    const d = new Date(), m = d.getMinutes() + d.getSeconds() / 60 + st.clockSpin * 60 * 3, h = (d.getHours() % 12) + m / 60;
    g2.strokeStyle = '#2a2f6e'; g2.lineCap = 'round';
    g2.lineWidth = 5; g2.beginPath(); g2.moveTo(cx, cy); g2.lineTo(cx + Math.sin((h / 12) * TAU) * 18, cy - Math.cos((h / 12) * TAU) * 18); g2.stroke();
    g2.lineWidth = 3.5; g2.beginPath(); g2.moveTo(cx, cy); g2.lineTo(cx + Math.sin((m / 60) * TAU) * 28, cy - Math.cos((m / 60) * TAU) * 28); g2.stroke();
    g2.fillStyle = '#ff6fa8'; circle(g2, cx, cy, 4); g2.fill();
  }
  function drawCakes(g2, cx, y) {
    if (st.cakes <= 0) return;
    g2.fillStyle = '#fff'; ell(g2, cx, y - 2, 56, 9); g2.fill(); g2.strokeStyle = '#e0d8f0'; g2.lineWidth = 2; g2.stroke();
    for (let i = 0; i < st.cakes; i++) {
      const x = cx - 36 + i * 24;
      g2.fillStyle = '#ff9fc4'; g2.beginPath(); g2.moveTo(x - 10, y - 4); g2.lineTo(x + 10, y - 4); g2.lineTo(x + 12, y - 22); g2.lineTo(x - 12, y - 22); g2.closePath(); g2.fill();
      g2.fillStyle = '#fff3f8'; ell(g2, x, y - 26, 14, 9); g2.fill(); circle(g2, x, y - 32, 7); g2.fill();
      g2.fillStyle = '#ff3b5c'; circle(g2, x, y - 40, 4.5); g2.fill();
      g2.fillStyle = ['#5fe0c8', '#ffd166', '#7c6cf6'][i % 3]; for (let j = 0; j < 3; j++) { g2.fillRect(x - 8 + j * 6, y - 28 + (j % 2) * 3, 3, 2); }
    }
  }
  function drawBed(g2, T2) {
    const b = st.bounce > 0 ? Math.sin(st.bounce * 18) * st.bounce * 8 : 0;
    g2.fillStyle = '#f5b860'; rr(g2, 858, 372, 34, 228, 14); g2.fill(); g2.strokeStyle = '#d9913c'; g2.lineWidth = 3; g2.stroke();
    g2.fillStyle = '#ffd166'; starPath(g2, 875, 404, 13, 6, 5, 0); g2.fill();
    g2.fillStyle = '#f5b860'; rr(g2, 526, 452, 26, 148, 12); g2.fill(); g2.stroke();
    g2.fillStyle = '#e8a04a'; rr(g2, 540, 546 + b * 0.3, 324, 34, 8); g2.fill();
    g2.fillStyle = '#fff'; rr(g2, 548, 520 + b * 0.5, 312, 32, 10); g2.fill();
    // pillow
    g2.fillStyle = '#ffffff'; rr(g2, 778, 448 + b, 82, 44, 18); g2.fill(); g2.strokeStyle = '#d8d0f0'; g2.lineWidth = 2; g2.stroke();
    // rocket duvet
    g2.save(); rr(g2, 546, 476 + b, 260, 78, 22); g2.fillStyle = '#2f3c9e'; g2.fill(); g2.clip();
    const R = rng(21);
    for (let i = 0; i < 14; i++) { g2.fillStyle = 'rgba(255,240,180,.85)'; starPath(g2, 550 + R() * 256, 480 + b + R() * 74, 4, 1.8, 5, 0); g2.fill(); }
    for (let i = 0; i < 5; i++) {
      const rx = 576 + i * 50, ry = 506 + b + (i % 2) * 18;
      g2.save(); g2.translate(rx, ry); g2.rotate(0.6);
      g2.fillStyle = '#ff7a45'; g2.beginPath(); g2.moveTo(-8, 8); g2.lineTo(-13, 15); g2.lineTo(-5, 13); g2.fill(); g2.beginPath(); g2.moveTo(8, 8); g2.lineTo(13, 15); g2.lineTo(5, 13); g2.fill();
      g2.fillStyle = '#ffd166'; g2.beginPath(); g2.moveTo(-4, 13); g2.lineTo(0, 22); g2.lineTo(4, 13); g2.fill();
      g2.fillStyle = '#fff'; g2.beginPath(); g2.moveTo(0, -16); g2.quadraticCurveTo(10, -4, 7, 13); g2.lineTo(-7, 13); g2.quadraticCurveTo(-10, -4, 0, -16); g2.fill();
      g2.fillStyle = '#5fe0c8'; circle(g2, 0, -1, 3.5); g2.fill();
      g2.restore();
    }
    g2.fillStyle = '#4b5bd0'; rr(g2, 546, 476 + b, 260, 14, 7); g2.fill();
    g2.restore();
  }
  function drawLamp(g2, cx, on) {
    g2.fillStyle = '#f5b860'; rr(g2, 896, 500, 92, 100, 10); g2.fill(); g2.strokeStyle = '#d9913c'; g2.lineWidth = 3; g2.stroke();
    g2.fillStyle = '#ffd166'; circle(g2, 942, 548, 6); g2.fill();
    g2.strokeStyle = '#d9913c'; g2.beginPath(); g2.moveTo(902, 530); g2.lineTo(982, 530); g2.stroke();
    g2.fillStyle = '#7c6cf6'; ell(g2, cx, 496, 24, 7); g2.fill(); g2.fillRect(cx - 4, 440, 8, 56);
    if (on) { g2.globalAlpha = 0.55; g2.drawImage(glowOf('#fff2b0'), cx - 90, 340, 180, 180); g2.globalAlpha = 1; }
    g2.fillStyle = on ? '#fff6c8' : '#e2dcf6'; circle(g2, cx, 438, 10); g2.fill();
    g2.fillStyle = on ? '#ffb3d1' : '#ff9fc4'; g2.beginPath(); g2.moveTo(cx - 24, 398); g2.lineTo(cx + 24, 398); g2.lineTo(cx + 38, 440); g2.lineTo(cx - 38, 440); g2.closePath(); g2.fill();
    g2.strokeStyle = '#e07aa8'; g2.lineWidth = 3; g2.stroke();
  }
  const CSTARS = (() => { const R = rng(99), a = []; for (let i = 0; i < 30; i++) a.push(i < 18 ? [20 + R() * 960, -4 + R() * 18, 7 + R() * 7, R() * TAU] : [20 + R() * 480, 30 + R() * 70, 7 + R() * 7, R() * TAU]); return a; })();
  function drawCeilingStars(g2, T2, night) {
    for (const [x, y, r, ph] of CSTARS) {
      if (night) {
        const tw = 0.75 + 0.25 * Math.sin(T2 * 2 + ph);
        g2.globalAlpha = 0.9 * tw; g2.drawImage(glowOf('#c8ff8a'), x - r * 3, y - r * 3, r * 6, r * 6); g2.globalAlpha = 1;
        g2.fillStyle = '#e8ffb0'; starPath(g2, x, y, r, r * 0.45, 5, ph * 0.2); g2.fill();
      } else { g2.fillStyle = 'rgba(250,255,220,.85)'; starPath(g2, x, y, r, r * 0.45, 5, ph * 0.2); g2.fill(); g2.strokeStyle = 'rgba(200,210,150,.6)'; g2.lineWidth = 1; g2.stroke(); }
    }
  }
  function drawMobile(g2, cx, T2) {
    g2.strokeStyle = '#8a7aa8'; g2.lineWidth = 2; g2.beginPath(); g2.moveTo(cx, 14); g2.lineTo(cx, 70); g2.stroke();
    const a = st.mobileA;
    const P = [['#3f8fe0', 22, 60, 'earth'], ['#ffcf7a', 20, 92, 'saturn'], ['#ff7a5a', 15, 74, 'mars'], ['#ffd166', 16, 110, 'star']];
    const pts = P.map((p, i) => { const an = a + (i * TAU) / 4; return { p, x: cx + Math.cos(an) * 80, z: Math.sin(an), y: 70 + p[2] }; }).sort((m, n) => m.z - n.z);
    g2.strokeStyle = '#b07a46'; g2.lineWidth = 5; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(cx - Math.cos(a) * 80, 70 - Math.sin(a) * 6); g2.lineTo(cx + Math.cos(a) * 80, 70 + Math.sin(a) * 6); g2.stroke();
    g2.beginPath(); g2.moveTo(cx - Math.cos(a + Math.PI / 2) * 80, 70); g2.lineTo(cx + Math.cos(a + Math.PI / 2) * 80, 70); g2.stroke();
    for (const q of pts) {
      const s = 0.8 + q.z * 0.2, [col, r, , kind] = q.p;
      g2.strokeStyle = 'rgba(138,122,168,.8)'; g2.lineWidth = 1.5; g2.beginPath(); g2.moveTo(q.x, 70); g2.lineTo(q.x, q.y - r * s); g2.stroke();
      g2.fillStyle = col;
      if (kind === 'star') { starPath(g2, q.x, q.y, r * 1.3 * s, r * 0.6 * s, 5, 0); g2.fill(); continue; }
      circle(g2, q.x, q.y, r * s); g2.fill();
      if (kind === 'earth') { g2.fillStyle = '#4fd36a'; ell(g2, q.x - 5 * s, q.y - 4 * s, 8 * s, 6 * s, 0.4); g2.fill(); }
      if (kind === 'saturn') { g2.strokeStyle = '#e09a3a'; g2.lineWidth = 4; ell(g2, q.x, q.y, r * 1.8 * s, r * 0.45 * s, -0.3); g2.stroke(); }
      if (kind === 'mars') { g2.fillStyle = '#d9532a'; circle(g2, q.x + 4 * s, q.y + 3 * s, 4 * s); g2.fill(); }
    }
  }
  function drawTeddy(g2, x, y, T2) {
    const k = st.teddy > 0 ? 1 + Math.sin(st.teddy * 12) * 0.08 * st.teddy : 1;
    g2.save(); g2.translate(x, y); g2.scale(k, k);
    const c = '#c98a3d', d = '#a8692a';
    g2.fillStyle = c; ell(g2, 0, 22, 24, 26); g2.fill();
    g2.fillStyle = '#f2d2a8'; ell(g2, 0, 26, 13, 15); g2.fill();
    g2.fillStyle = c; ell(g2, -24, 18, 9, 14, 0.6); g2.fill(); ell(g2, 24, 18, 9, 14, -0.6); g2.fill();
    ell(g2, -14, 44, 11, 9); g2.fill(); ell(g2, 14, 44, 11, 9); g2.fill();
    circle(g2, 0, -12, 21); g2.fill(); circle(g2, -16, -28, 9); g2.fill(); circle(g2, 16, -28, 9); g2.fill();
    g2.fillStyle = d; circle(g2, -16, -28, 4.5); g2.fill(); circle(g2, 16, -28, 4.5); g2.fill();
    g2.fillStyle = '#f2d2a8'; ell(g2, 0, -5, 10, 8); g2.fill();
    g2.fillStyle = '#2b1a10'; circle(g2, -8, -16, 2.8); g2.fill(); circle(g2, 8, -16, 2.8); g2.fill(); ell(g2, 0, -8, 4, 3); g2.fill();
    g2.fillStyle = '#ff6fa8'; g2.beginPath(); g2.moveTo(0, 6); g2.lineTo(-12, 0); g2.lineTo(-12, 12); g2.closePath(); g2.fill(); g2.beginPath(); g2.moveTo(0, 6); g2.lineTo(12, 0); g2.lineTo(12, 12); g2.closePath(); g2.fill();
    g2.restore();
  }
  function drawNightlight(g2, x, y, dark) {
    g2.fillStyle = '#fffaf2'; rr(g2, x - 14, y - 18, 28, 36, 6); g2.fill(); g2.strokeStyle = 'rgba(120,80,40,.3)'; g2.lineWidth = 2; g2.stroke();
    g2.fillStyle = dark ? '#fff2a0' : '#ffe08a'; starPath(g2, x, y, 18, 8, 5, 0); g2.fill();
    g2.strokeStyle = '#e0b040'; g2.lineWidth = 2; g2.stroke();
  }
  // Oda's block tower: a floor prop
  const BLOCKS = [['A', '#ff6fa8'], ['B', '#5fbff9'], ['C', '#ffd166'], ['1', '#4fd36a'], ['2', '#ff9a5c'], ['3', '#c39bff']];
  const BLOCK_DOWN = [[-70, 0, -0.4], [-30, 6, 0.3], [20, 2, -0.2], [60, 8, 0.5], [100, 4, 0.1], [-110, 6, 0.7]];
  function drawBlocks(g2, T2) {
    const bx = 3000 + 520, by = 642, s = 40;
    const t = st.blocksT, down = st.blocksDown;
    BLOCKS.forEach(([ch, col], i) => {
      const up = [((i % 2) ? 3 : -3), -i * s];
      const dn = BLOCK_DOWN[i];
      const k = down ? t : 1 - t;
      const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const x = bx + lerp(up[0], dn[0], ease), y = by + lerp(up[1], dn[1], ease) - Math.sin(ease * Math.PI) * 40 * (i / 5);
      const rot = lerp(0, dn[2], ease);
      g2.save(); g2.translate(x, y - s / 2); g2.rotate(rot);
      g2.fillStyle = col; rr(g2, -s / 2, -s / 2, s, s, 7); g2.fill(); g2.strokeStyle = shade(col, -0.25); g2.lineWidth = 3; g2.stroke();
      txt(g2, ch, 0, 2, 26, '#fff', { stroke: shade(col, -0.35), lw: 4 });
      g2.restore();
    });
  }

  /* ---------- house actions ---------- */
  function toggleLight(i) {
    st.dark[i] = !st.dark[i]; sfx('blip');
    if (st.dark[i] && st.darkLines++ % 3 === 0) sayPresent(LIGHT_OFF_LINES);
  }
  function toggleCurtain(i) {
    st.curtT[i] = st.curtT[i] > 0.5 ? 0 : 1; sfx('whoosh');
    if (st.curtT[i] > 0.5 && Math.random() < 0.4) sayPresent(CURTAIN_LINES);
  }
  function tapTV() { st.tv0 = T; sfx('whoosh'); talk(TV_LINES.slice(0, 1).concat(Math.random() < 0.6 ? [TV_LINES[1]] : []), 0); }
  function tapBooks() { st.book = 1.2; sfx('blip'); talk([cycle(BOOK_FACTS, 'books')]); }
  function tapSofa() {
    st.sofa = 1; sfx('jump');
    const cap = capEnt();
    if (cap && freeEnt(cap) && roomOfX(cap.x) === 0) jump(cap, 0.5, 60);
    sayPresent(SOFA_LINES);
  }
  function openFridge() {
    if (modal) return;
    st.fridgeT = 1; sfx('blip');
    talk(FRIDGE_OPEN.filter((l) => ent(roleId(l[0]))));
    later(() => showSnacks(), 260);
  }
  function showSnacks() {
    if (closed || modal) return;
    modal = 'snack';
    modalEl.className = 'hm-modal'; modalEl.hidden = false;
    modalEl.innerHTML = `<div class="hm-panel" role="dialog" aria-label="Snack time"><h2>Snack time!</h2>
      <div class="hm-snacks"><button type="button" class="hm-snack" data-s="biscuit"><span aria-hidden="true">🍪</span>Biscuits</button>
      <button type="button" class="hm-snack" data-s="apple"><span aria-hidden="true">🍎</span>Apple</button>
      <button type="button" class="hm-snack" data-s="toast"><span aria-hidden="true">🍞</span>Toast</button></div>
      <button type="button" class="hm-btn" data-s="none">Close the fridge</button></div>`;
    modalEl.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => { const s = b.dataset.s; closeModal(); st.fridgeT = 0; if (s !== 'none') eatSnack(s); else sfx('blip'); }));
    try { modalEl.querySelector('.hm-snack').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }
  function closeModal() {
    modal = null; modalEl.hidden = true; modalEl.innerHTML = ''; root.classList.remove('hm-scoping');
    if (scope) { scope = null; }
  }
  function eatSnack(kind) {
    const e = capEnt(); if (!e) return;
    stopTask(e); e.tx = null;
    if (kind === 'toast') { st.toast = 1.6; sfx('blip'); }
    const go = () => { e.eat = { kind, t: 0, bites: 0 }; e.face = 1; };
    const rx = 1000 + 300;
    if (Math.abs(e.x - rx) > 200 || roomOfX(e.x) !== 1) goTo(e, rx + rand(-60, 60), 680, 1.6, go); else go();
    talk(kind === 'biscuit' ? SNACK_BISCUIT : kind === 'apple' ? SNACK_APPLE : SNACK_TOAST, 500, true);
  }
  function tapOven() {
    if (st.oven > 0) { sfx('blip'); return; }
    st.oven = 4; sfx('blip'); talk(OVEN_START);
  }
  function eatCake() {
    st.cakes = Math.max(0, st.cakes - 1); sfx('happy');
    hearts(1000 + 790, 430, 4); crumbs(1000 + 790, 470, 476, 6, '#ff9fc4');
    sayPresent(CAKE_LINES);
  }
  function tapToaster() { st.toast = 1.6; sfx('blip'); sayPresent(TOASTER_LINES); }
  function tapFish() {
    st.fish = 1; sfx('blip');
    for (let i = 0; i < 6; i++) addP({ type: 'bubble', x: 1000 + 557 + rand(-20, 20), y: 280 + rand(-10, 20), vx: rand(-8, 8), vy: rand(-60, -30), life: rand(0.8, 1.4), t: 0, s: rand(3, 6) });
    talk([FISH_LINES[0]].concat(Math.random() < 0.5 ? [FISH_LINES[1]] : []).filter((l) => l[0] === 'leo' || ent(roleId(l[0]))));
  }
  function toggleNight() {
    st.dark[2] = !st.dark[2]; sfx(st.dark[2] ? 'chime' : 'blip');
    if (st.dark[2]) { const L = st.nightLines++ === 0 ? NIGHT_ON : [NIGHT_ON[0]]; talk(L, 0, L.length > 1); for (let i = 0; i < 10; i++) sparkle(2000 + rand(50, 950), rand(0, 110), 1, '#d9ff8a'); }
    else sayPresent(NIGHT_OFF);
  }
  function tapBed() {
    st.bounce = 1; sfx('jump');
    const cap = capEnt();
    if (cap && freeEnt(cap)) {
      if (roomOfX(cap.x) === 2) { goTo(cap, clamp(cap.x, 2000 + 600, 2000 + 800), 640, 1.4, () => { jump(cap, 0.55, 120); later(() => jump(cap, 0.5, 100), 600); }); }
    }
    talk(cycle([[BED_LINES[1]], [BED_LINES[0]]], 'bed'));
  }
  function tapTeddy() { st.teddy = 1; sfx('happy'); hearts(3000 + 872, 420, 5); sayPresent(TEDDY_LINES); }
  function tapMobile() { st.mobileV += 5; sfx('chime'); sparkle(3000 + 600, 140, 8); talk([cycle(MOBILE_LINES, 'mobile')]); }
  function tapBlocks() {
    st.blocksDown = !st.blocksDown; st.blocksT = 0;
    if (st.blocksDown) { sfx('thud'); later(() => sfx('thud'), 180); sayPresent(BLOCK_FALL); }
    else { sfx('happy'); sparkle(3000 + 520, 560, 8); sayPresent(BLOCK_BUILD); }
  }

  /* ---------- telescope ---------- */
  const SKY_W = 2400;
  const SKY = (() => {
    const R = rng(1234), stars = [];
    for (let i = 0; i < 260; i++) stars.push([R() * SKY_W, -560 + R() * 1120, 0.6 + R() * 1.8, R() * TAU, R() < 0.12]);
    return {
      stars,
      moon: [380, -110, 120], saturn: [1080, 110, 30],
      orion: [[1700, -190, 7, '#ffb08a'], [1860, -170, 5], [1745, 10, 5], [1790, -5, 5], [1835, -20, 5], [1700, 200, 5], [1870, 190, 7, '#bcd8ff']],
    };
  })();
  function openScope() {
    if (modal) return;
    modal = 'scope';
    scope = { t: 0, ox: 700, R: 0, shoot: null, nextShoot: 2.5, labels: 0 };
    sfx('whoosh');
    modalEl.className = 'hm-modal hm-clear'; modalEl.hidden = false; root.classList.add('hm-scoping');
    modalEl.innerHTML = `<button type="button" class="hm-btn hm-big">Back to my room</button>`;
    modalEl.querySelector('button').addEventListener('click', () => { sfx('blip'); closeModal(); });
    try { modalEl.querySelector('button').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    talk(st.roomSeen++ % 2 === 0 ? SCOPE_OPEN : [SCOPE_OPEN[0]], 0, true);
  }
  function scopeGeom() {
    const topB = topEl.getBoundingClientRect().bottom;
    const btn = modalEl.querySelector('button'); const bt = btn ? btn.getBoundingClientRect().top : H - 90;
    const cy = (topB + bt) / 2, R = Math.max(80, Math.min(W * 0.46, (bt - topB) / 2 - 12));
    return { cx: W / 2, cy, R, u: R / 520 };
  }
  function skyToScreen(gm, x, y) {
    let dx = x - scope.ox; dx = ((dx % SKY_W) + SKY_W * 1.5) % SKY_W - SKY_W / 2;
    return [gm.cx + dx * gm.u, gm.cy + y * gm.u];
  }
  function drawScope(g2) {
    const gm = scopeGeom(), op = Math.min(1, scope.t / 0.35);
    g2.fillStyle = `rgba(6,6,24,${0.92 * op})`; g2.fillRect(0, 0, W, H);
    const R = gm.R * (0.3 + 0.7 * (1 - Math.pow(1 - op, 3)));
    g2.save(); circle(g2, gm.cx, gm.cy, R); g2.clip();
    const gr = g2.createRadialGradient(gm.cx, gm.cy, 0, gm.cx, gm.cy, R); gr.addColorStop(0, '#1d2a6e'); gr.addColorStop(1, '#070a26');
    g2.fillStyle = gr; g2.fillRect(gm.cx - R, gm.cy - R, R * 2, R * 2);
    // milky glow band
    g2.globalAlpha = 0.12; for (let i = -3; i <= 3; i++) { const [x, y] = skyToScreen(gm, 1300 + i * 140, i * 40); g2.drawImage(glowOf('#c8b8ff'), x - 160 * gm.u * 2, y - 120 * gm.u * 2, 320 * gm.u * 2, 240 * gm.u * 2); } g2.globalAlpha = 1;
    for (const [x, y, r, ph, big] of SKY.stars) {
      const [px, py] = skyToScreen(gm, x, y); if (Math.abs(px - gm.cx) > R + 10 || Math.abs(py - gm.cy) > R + 10) continue;
      const tw = 0.6 + 0.4 * Math.sin(T * 3 + ph);
      if (big) { g2.globalAlpha = 0.5 * tw; g2.drawImage(glowOf('#ffffff'), px - r * 8 * gm.u * 2, py - r * 8 * gm.u * 2, r * 16 * gm.u * 2, r * 16 * gm.u * 2); g2.globalAlpha = 1; }
      g2.fillStyle = `rgba(255,255,240,${0.55 + 0.45 * tw})`; circle(g2, px, py, r * gm.u * 2); g2.fill();
    }
    // Orion
    const op2 = SKY.orion.map(([x, y]) => skyToScreen(gm, x, y));
    g2.strokeStyle = 'rgba(160,190,255,.35)'; g2.lineWidth = 2; g2.setLineDash([6, 8]);
    g2.beginPath(); const L = [[0, 2], [1, 4], [2, 3], [3, 4], [2, 6], [4, 5]];
    for (const [a, b] of L) { g2.moveTo(op2[a][0], op2[a][1]); g2.lineTo(op2[b][0], op2[b][1]); }
    g2.stroke(); g2.setLineDash([]);
    SKY.orion.forEach(([, , r, col], i) => { const [px, py] = op2[i]; g2.globalAlpha = 0.8; g2.drawImage(glowOf(col || '#dfe8ff'), px - r * 6 * gm.u * 2, py - r * 6 * gm.u * 2, r * 12 * gm.u * 2, r * 12 * gm.u * 2); g2.globalAlpha = 1; g2.fillStyle = col || '#fff'; circle(g2, px, py, r * gm.u * 1.6); g2.fill(); });
    { const [px, py] = skyToScreen(gm, 1790, 250); txt(g2, 'Orion', px, py, Math.max(18, 30 * gm.u * 1.6), '#ffd166', { stroke: '#070a26' }); }
    // Moon
    { const [mx, my] = skyToScreen(gm, SKY.moon[0], SKY.moon[1]); const r = SKY.moon[2] * gm.u;
      g2.globalAlpha = 0.6; g2.drawImage(glowOf('#fff6d0'), mx - r * 2.2, my - r * 2.2, r * 4.4, r * 4.4); g2.globalAlpha = 1;
      const mg = g2.createRadialGradient(mx - r * 0.3, my - r * 0.3, r * 0.1, mx, my, r); mg.addColorStop(0, '#fffbe8'); mg.addColorStop(1, '#d8d2bc');
      g2.fillStyle = mg; circle(g2, mx, my, r); g2.fill();
      g2.fillStyle = 'rgba(160,150,130,.45)'; for (const [cx2, cy2, cr] of [[-0.3, -0.2, 0.2], [0.3, 0.1, 0.14], [0, 0.45, 0.12], [-0.45, 0.3, 0.09], [0.4, -0.4, 0.1], [0.05, -0.05, 0.08]]) { circle(g2, mx + cx2 * r, my + cy2 * r, cr * r); g2.fill(); }
      txt(g2, 'The Moon', mx, my + r + 26 * gm.u * 1.6, Math.max(18, 30 * gm.u * 1.6), '#ffd166', { stroke: '#070a26' }); }
    // Saturn
    { const [px, py] = skyToScreen(gm, SKY.saturn[0], SKY.saturn[1]); const r = SKY.saturn[2] * gm.u;
      g2.globalAlpha = 0.5; g2.drawImage(glowOf('#ffe0a0'), px - r * 4, py - r * 4, r * 8, r * 8); g2.globalAlpha = 1;
      g2.strokeStyle = '#e8c88a'; g2.lineWidth = r * 0.35; ell(g2, px, py, r * 2.1, r * 0.55, -0.35); g2.stroke();
      g2.fillStyle = '#f2d39a'; circle(g2, px, py, r); g2.fill();
      g2.fillStyle = 'rgba(200,150,80,.5)'; g2.fillRect(px - r, py - r * 0.15, r * 2, r * 0.22);
      g2.strokeStyle = '#e8c88a'; g2.beginPath(); g2.ellipse(px, py, r * 2.1, r * 0.55, -0.35, 0, Math.PI); g2.stroke();
      txt(g2, 'Saturn', px, py + r * 2 + 18, Math.max(18, 30 * gm.u * 1.6), '#ffd166', { stroke: '#070a26' }); }
    // shooting star
    if (scope.shoot) {
      const s = scope.shoot, k = s.t / s.life;
      const [px, py] = skyToScreen(gm, s.x + s.vx * s.t, s.y + s.vy * s.t);
      const len = 140 * gm.u * 2, ang = Math.atan2(s.vy, s.vx);
      const gr2 = g2.createLinearGradient(px, py, px - Math.cos(ang) * len, py - Math.sin(ang) * len);
      gr2.addColorStop(0, `rgba(255,255,255,${1 - k})`); gr2.addColorStop(1, 'rgba(255,255,255,0)');
      g2.strokeStyle = gr2; g2.lineWidth = 4; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(px, py); g2.lineTo(px - Math.cos(ang) * len, py - Math.sin(ang) * len); g2.stroke();
      g2.fillStyle = '#fff'; circle(g2, px, py, 4); g2.fill();
    }
    // vignette inside eyepiece
    const vg = g2.createRadialGradient(gm.cx, gm.cy, R * 0.75, gm.cx, gm.cy, R); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,10,.7)');
    g2.fillStyle = vg; g2.fillRect(gm.cx - R, gm.cy - R, R * 2, R * 2);
    g2.restore();
    g2.strokeStyle = '#2a2f6e'; g2.lineWidth = 18; circle(g2, gm.cx, gm.cy, R + 8); g2.stroke();
    g2.strokeStyle = '#5b6cf0'; g2.lineWidth = 6; circle(g2, gm.cx, gm.cy, R + 18); g2.stroke();
    if (scope.t < 6) txt(g2, 'Drag to look around · tap the Moon, Saturn or Orion', W / 2, gm.cy - R - 4 < topEl.getBoundingClientRect().bottom + 20 ? gm.cy + R - 30 : gm.cy - R - 30, Math.min(20, W / 26), '#fff', { stroke: '#070a26', weight: 700, font: FB });
  }
  function scopeTap(px, py) {
    const gm = scopeGeom();
    const hit = (x, y, r) => { const [a, b] = skyToScreen(gm, x, y); return Math.hypot(px - a, py - b) < r; };
    if (scope.shoot) { const s = scope.shoot; if (hit(s.x + s.vx * s.t, s.y + s.vy * s.t, 90)) { sfx('happy'); talk(SCOPE_SHOOT); scope.shoot = null; return; } }
    if (hit(SKY.moon[0], SKY.moon[1], SKY.moon[2] * gm.u * 1.2)) { sfx('chime'); talk(SCOPE_MOON); return; }
    if (hit(SKY.saturn[0], SKY.saturn[1], Math.max(50, SKY.saturn[2] * gm.u * 2.4))) { sfx('chime'); talk(SCOPE_SATURN); return; }
    if (hit(1785, 0, 260 * gm.u)) { sfx('chime'); talk(SCOPE_ORION); return; }
    sfx('blip');
  }

  /* ======================================================================
     KENNEL
     ====================================================================== */
  const BED = { x: 420, y: 606, rx: 222, ry: 80 };
  const BOWL_F = { x: 690, y: 660 }, BOWL_W = { x: 830, y: 664 };
  function kennelBg(g2) {
    // inner pentagon
    g2.save();
    g2.beginPath(); g2.moveTo(0, 120); g2.lineTo(600, -40); g2.lineTo(1200, 120); g2.lineTo(1200, 600); g2.lineTo(0, 600); g2.closePath(); g2.clip();
    for (let i = 0; i < 20; i++) { g2.fillStyle = i % 2 ? '#d99a5e' : '#cf8f52'; g2.fillRect(i * 60, -60, 60, 680); }
    g2.strokeStyle = 'rgba(120,60,20,.35)'; g2.lineWidth = 3; for (let i = 1; i < 20; i++) { g2.beginPath(); g2.moveTo(i * 60, -60); g2.lineTo(i * 60, 600); g2.stroke(); }
    const R = rng(3); g2.fillStyle = 'rgba(120,60,20,.25)';
    for (let i = 0; i < 60; i++) { ell(g2, R() * 1200, R() * 600, 6 + R() * 10, 2, 0); g2.fill(); }
    g2.fillStyle = '#8a4f24'; for (let i = 0; i < 20; i++) { circle(g2, i * 60 + 30, 140, 3); g2.fill(); circle(g2, i * 60 + 30, 520, 3); g2.fill(); }
    // soft warm glow
    const wg = g2.createRadialGradient(500, 320, 50, 500, 320, 700); wg.addColorStop(0, 'rgba(255,230,170,.35)'); wg.addColorStop(1, 'rgba(255,230,170,0)');
    g2.fillStyle = wg; g2.fillRect(0, -60, 1200, 660);
    g2.restore();
    // rafters
    g2.strokeStyle = '#9a5a2c'; g2.lineWidth = 26; g2.lineCap = 'round';
    g2.beginPath(); g2.moveTo(-10, 126); g2.lineTo(600, -36); g2.lineTo(1210, 126); g2.stroke();
    g2.fillStyle = '#9a5a2c'; rr(g2, 0, 108, 1200, 26, 8); g2.fill();
    g2.fillStyle = 'rgba(255,255,255,.12)'; rr(g2, 0, 110, 1200, 6, 3); g2.fill();
    // floor
    const fg = g2.createLinearGradient(0, 600, 0, 720); fg.addColorStop(0, '#a8682f'); fg.addColorStop(1, '#c48444');
    g2.fillStyle = fg; g2.fillRect(0, 600, 1200, 120);
    g2.strokeStyle = 'rgba(80,40,10,.25)'; g2.lineWidth = 2; for (let i = 0; i < 6; i++) { g2.beginPath(); g2.moveTo(0, 600 + i * 20); g2.lineTo(1200, 600 + i * 20); g2.stroke(); }
    g2.strokeStyle = '#f2d37a'; g2.lineWidth = 2.5; g2.lineCap = 'round';
    for (let i = 0; i < 90; i++) { const x = R() * 1200, y = 606 + R() * 110, a = R() * Math.PI, l = 10 + R() * 18; g2.beginPath(); g2.moveTo(x, y); g2.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * 0.3); g2.stroke(); }
    g2.fillStyle = '#7a4520'; g2.fillRect(0, 716, 1200, 34);
    // paw-print tapestry blanket
    g2.fillStyle = '#7a4520'; circle(g2, 70, 168, 6); g2.fill(); circle(g2, 250, 168, 6); g2.fill();
    g2.fillStyle = '#ff9cc2'; rr(g2, 60, 170, 200, 176, 12); g2.fill(); g2.strokeStyle = '#e07aa8'; g2.lineWidth = 4; g2.stroke();
    g2.strokeStyle = '#fff'; g2.lineWidth = 3; g2.setLineDash([8, 6]); rr(g2, 70, 180, 180, 156, 8); g2.stroke(); g2.setLineDash([]);
    g2.fillStyle = 'rgba(255,255,255,.9)'; for (const [px, py] of [[100, 216], [150, 252], [200, 214], [112, 300], [170, 306], [220, 280]]) pawPath(g2, px, py, 16);
    g2.fillStyle = '#ffd166'; for (let i = 0; i < 9; i++) { rr(g2, 66 + i * 22, 344, 8, 16, 3); g2.fill(); }
    // hanging sign
    g2.strokeStyle = '#6b3a18'; g2.lineWidth = 3; g2.beginPath(); g2.moveTo(380, 134); g2.lineTo(392, 160); g2.moveTo(580, 134); g2.lineTo(568, 160); g2.stroke();
    g2.fillStyle = '#ffe3c2'; rr(g2, 330, 158, 290, 58, 14); g2.fill(); g2.strokeStyle = '#b8743a'; g2.lineWidth = 4; g2.stroke();
    { const sign = `${nameOf('joules').toUpperCase()} & ${nameOf('maggie').toUpperCase()}`; g2.font = `800 30px ${FD}`; const fs = Math.min(30, 30 * 236 / Math.max(1, g2.measureText(sign).width)); txt(g2, sign, 475, 189, fs, '#7a3e1d', { weight: 800 }); }
    g2.fillStyle = '#ff6fa8'; heartPath(g2, 346, 186, 10); g2.fill(); heartPath(g2, 604, 186, 10); g2.fill();
    // Laika picture
    frame3(g2, 420, 240, 120, 120, '#ffd166');
    g2.save(); rr(g2, 429, 249, 102, 102, 4); g2.clip(); g2.fillStyle = '#1b1946'; g2.fillRect(429, 249, 102, 102);
    g2.fillStyle = '#fff'; const R3 = rng(8); for (let i = 0; i < 16; i++) { circle(g2, 430 + R3() * 100, 250 + R3() * 100, 1.2); g2.fill(); }
    g2.fillStyle = '#f6efe2'; circle(g2, 480, 300, 26); g2.fill(); g2.fillStyle = '#c98a3d'; ell(g2, 458, 294, 9, 18, 0.3); g2.fill(); ell(g2, 502, 294, 9, 18, -0.3); g2.fill();
    g2.fillStyle = '#c98a3d'; ell(g2, 486, 288, 9, 8); g2.fill();
    g2.fillStyle = '#2b1a10'; circle(g2, 472, 296, 3); g2.fill(); circle(g2, 490, 296, 3); g2.fill(); ell(g2, 481, 308, 5, 4); g2.fill();
    g2.strokeStyle = 'rgba(200,230,255,.9)'; g2.lineWidth = 4; circle(g2, 480, 300, 36); g2.stroke();
    g2.fillStyle = 'rgba(200,230,255,.25)'; circle(g2, 480, 300, 36); g2.fill();
    g2.restore();
    txt(g2, 'LAIKA 1957', 480, 374, 15, '#7a3e1d', { weight: 800 });
    // round window
    g2.fillStyle = '#8a4f24'; circle(g2, 760, 236, 68); g2.fill();
    g2.save(); circle(g2, 760, 236, 54); g2.clip(); skyGlass(g2, 706, 182, 108, 108, false, 0, 5); g2.restore();
    g2.strokeStyle = '#8a4f24'; g2.lineWidth = 8; g2.beginPath(); g2.moveTo(706, 236); g2.lineTo(814, 236); g2.moveTo(760, 182); g2.lineTo(760, 290); g2.stroke();
    // bone stash crate
    g2.fillStyle = '#b8743a'; rr(g2, 34, 486, 160, 116, 10); g2.fill(); g2.strokeStyle = '#7a4520'; g2.lineWidth = 4; g2.stroke();
    for (let i = 0; i < 6; i++) { const bx2 = 52 + i * 24, by2 = 478 - (i % 2) * 8; g2.save(); g2.translate(bx2, by2); g2.rotate(-0.6 + i * 0.25); boneShape(g2, 0, 0, 30); g2.restore(); }
    g2.strokeStyle = 'rgba(80,40,10,.4)'; g2.lineWidth = 3; for (let i = 0; i < 3; i++) { g2.beginPath(); g2.moveTo(34, 520 + i * 28); g2.lineTo(194, 520 + i * 28); g2.stroke(); }
    txt(g2, 'BONES', 114, 576, 24, '#ffe3c2', { stroke: '#7a4520' });
    // door arch frame
    g2.fillStyle = '#8a4f24'; g2.beginPath(); g2.moveTo(930, 600); g2.lineTo(930, 330); g2.arc(1050, 330, 120, Math.PI, TAU); g2.lineTo(1170, 600); g2.closePath(); g2.fill();
  }
  function boneShape(g2, x, y, l) {
    g2.fillStyle = '#fffaf0'; g2.strokeStyle = '#d8c9b6'; g2.lineWidth = 2;
    rr(g2, x - l / 2, y - l * 0.12, l, l * 0.24, l * 0.1); g2.fill(); g2.stroke();
    for (const s of [-1, 1]) { circle(g2, x + s * l / 2, y - l * 0.13, l * 0.15); g2.fill(); g2.stroke(); circle(g2, x + s * l / 2, y + l * 0.13, l * 0.15); g2.fill(); g2.stroke(); }
    rr(g2, x - l / 2, y - l * 0.12, l, l * 0.24, l * 0.1); g2.fill();
  }
  function kennelDoor(g2, T2) {
    g2.save(); g2.beginPath(); g2.moveTo(950, 600); g2.lineTo(950, 330); g2.arc(1050, 330, 100, Math.PI, TAU); g2.lineTo(1150, 600); g2.closePath(); g2.clip();
    const gr = g2.createLinearGradient(0, 220, 0, 600); gr.addColorStop(0, '#7fd0ff'); gr.addColorStop(1, '#dff6ff');
    g2.fillStyle = gr; g2.fillRect(940, 220, 220, 400);
    g2.fillStyle = '#fff'; const cx = 960 + ((T2 * 10) % 260) - 40; circle(g2, cx, 300, 18); g2.fill(); circle(g2, cx + 22, 294, 22); g2.fill();
    g2.fillStyle = '#fff3e0'; for (let i = 0; i < 6; i++) { rr(g2, 950 + i * 36, 470, 18, 80, 6); g2.fill(); } g2.fillRect(950, 490, 220, 10);
    g2.fillStyle = '#7cd27a'; g2.fillRect(940, 540, 220, 70);
    g2.fillStyle = '#ff6fa8'; for (let i = 0; i < 5; i++) { circle(g2, 966 + i * 42, 548 + (i % 2) * 8, 7); g2.fill(); }
    g2.fillStyle = '#ffd166'; for (let i = 0; i < 5; i++) { circle(g2, 966 + i * 42, 548 + (i % 2) * 8, 3); g2.fill(); }
    // peeking giant
    if (st.peek) {
      const p = st.peek, e = ent(p.who);
      if (e) { const k = p.t < 0.6 ? p.t / 0.6 : p.t > p.dur - 0.6 ? (p.dur - p.t) / 0.6 : 1; const ease = 1 - Math.pow(1 - clamp(k, 0, 1), 3);
        const s = 330, x = lerp(1240, 1060, ease), y = 400 + Math.sin(T2 * 2) * 6;
        g2.save(); g2.translate(x, y); g2.rotate(-0.12 * ease); g2.drawImage(e.head, -s / 2, -s / 2, s, s); g2.restore();
        p.hx = x; p.hy = y; }
    }
    g2.restore();
    g2.strokeStyle = '#6b3a18'; g2.lineWidth = 6; g2.beginPath(); g2.moveTo(950, 600); g2.lineTo(950, 330); g2.arc(1050, 330, 100, Math.PI, TAU); g2.lineTo(1150, 600); g2.stroke();
  }
  const FAIRY = (() => { const a = []; for (let i = 0; i <= 22; i++) { const t = i / 22, x = t * 1200, y = t < 0.5 ? lerp(150, -6, t * 2) : lerp(-6, 150, (t - 0.5) * 2); a.push([x, y + 22 + Math.sin(t * Math.PI * 11) * 8]); } return a; })();
  function fairyLights(g2, T2, napDim) {
    g2.strokeStyle = '#3a5a2a'; g2.lineWidth = 2; g2.beginPath(); FAIRY.forEach(([x, y], i) => (i ? g2.lineTo(x, y) : g2.moveTo(x, y))); g2.stroke();
    const cols = ['#ff6fa8', '#ffd166', '#5fe0c8', '#9fb2ff', '#ff9a5c'];
    FAIRY.forEach(([x, y], i) => {
      const c = cols[(i + st.lightsHue) % cols.length], tw = 0.65 + 0.35 * Math.sin(T2 * 3 + i * 1.7);
      g2.globalAlpha = (0.35 + napDim * 0.4) * tw; g2.drawImage(glowOf(c), x - 26, y - 20, 52, 52); g2.globalAlpha = 1;
      g2.fillStyle = c; ell(g2, x, y + 6, 6, 8); g2.fill();
    });
  }
  function drawDogBed(g2, T2) {
    const sq = st.bedSquish > 0 ? Math.sin(st.bedSquish * 14) * st.bedSquish * 0.06 : 0;
    const { x, y, rx, ry } = BED;
    g2.save(); g2.translate(x, y); g2.scale(1 + sq, 1 - sq);
    g2.fillStyle = 'rgba(60,30,10,.25)'; ell(g2, 0, 30, rx + 10, ry * 0.6); g2.fill();
    g2.fillStyle = '#d9473f'; ell(g2, 0, 0, rx, ry); g2.fill();
    g2.fillStyle = '#ff6b5c'; ell(g2, 0, -10, rx - 10, ry - 16); g2.fill();
    g2.fillStyle = '#ffe3c2'; ell(g2, 0, -4, rx - 46, ry - 34); g2.fill();
    // paw-print blanket
    g2.save(); ell(g2, 0, -4, rx - 46, ry - 34); g2.clip();
    g2.fillStyle = '#7fc8f8'; g2.beginPath(); g2.moveTo(-rx, -10); g2.quadraticCurveTo(-30, -60, 40, 6); g2.quadraticCurveTo(90, 50, 200, 20); g2.lineTo(200, 100); g2.lineTo(-rx, 100); g2.closePath(); g2.fill();
    g2.fillStyle = 'rgba(255,255,255,.9)'; for (const [px, py] of [[-120, 20], [-70, 10], [-20, 30], [40, 34], [100, 40], [-150, 40]]) pawPath(g2, px, py, 11);
    g2.restore();
    // front rim
    g2.fillStyle = '#e6574c'; g2.beginPath(); g2.ellipse(0, 0, rx, ry, 0, 0.15, Math.PI - 0.15); g2.ellipse(0, -6, rx - 30, ry - 40, 0, Math.PI - 0.2, 0.2, true); g2.closePath(); g2.fill();
    g2.fillStyle = 'rgba(255,255,255,.25)'; g2.beginPath(); g2.ellipse(0, -12, rx - 14, ry - 20, 0, Math.PI * 1.15, Math.PI * 1.85); g2.lineWidth = 8; g2.strokeStyle = 'rgba(255,255,255,.3)'; g2.stroke();
    g2.restore();
  }
  function drawBowl(g2, b, kind, T2) {
    const { x, y } = b;
    g2.fillStyle = 'rgba(60,30,10,.25)'; ell(g2, x, y + 14, 58, 10); g2.fill();
    g2.fillStyle = kind === 'food' ? '#ff6fa8' : '#5fbff9';
    g2.beginPath(); g2.moveTo(x - 56, y - 14); g2.lineTo(x + 56, y - 14); g2.lineTo(x + 44, y + 14); g2.lineTo(x - 44, y + 14); g2.closePath(); g2.fill();
    g2.fillStyle = kind === 'food' ? '#ff9fc4' : '#9fd8ff'; ell(g2, x, y - 14, 56, 12); g2.fill();
    if (kind === 'food') {
      g2.fillStyle = '#5a2e14'; ell(g2, x, y - 13, 46, 8); g2.fill();
      if (st.food > 0.02) { const h = st.food * 12; g2.fillStyle = '#b06a32'; for (let i = 0; i < 22; i++) { const a = (i / 22) * TAU * 3, rr2 = (i % 7) * 6; circle(g2, x + Math.cos(a) * rr2 * 1.1, y - 14 - h * 0.6 + Math.sin(a) * rr2 * 0.25, 5); g2.fill(); } g2.fillStyle = '#8a4f24'; for (let i = 0; i < 10; i++) { circle(g2, x - 30 + i * 6.5, y - 12 - h * (0.3 + 0.2 * Math.sin(i)), 4); g2.fill(); } }
      txt(g2, 'FOOD', x, y + 2, 15, '#fff', { weight: 800 });
    } else {
      const wl = st.water; g2.fillStyle = `rgba(80,180,255,${0.5 + wl * 0.4})`; ell(g2, x, y - 13, 46 * (0.6 + wl * 0.4), 8 * (0.6 + wl * 0.4)); g2.fill();
      if (st.ripple > 0) { g2.strokeStyle = `rgba(255,255,255,${st.ripple})`; g2.lineWidth = 2; ell(g2, x, y - 13, 46 * (1 - st.ripple) + 6, 8 * (1 - st.ripple) + 2); g2.stroke(); }
      g2.fillStyle = 'rgba(255,255,255,.6)'; ell(g2, x - 14, y - 15, 10, 2.5); g2.fill();
      txt(g2, 'WATER', x, y + 2, 14, '#fff', { weight: 800 });
    }
  }

  /* ---------- kennel actions ---------- */
  function patDog(e) {
    stopTask(e); e.wagT = 2.6; jump(e, 0.4, 22); sfx('happy');
    hearts(e.x + e.face * 40 * e.k, e.y - 160 * e.k, 6);
    const pat = PAT_LINES.filter((l) => l[0] === e.id);
    const rx = PAT_REACT.filter((l) => { const p = ent(roleId(l[0])); return p && !p.out; });
    talk([pick(pat.length ? pat : [[e.id, 'Woof!']])].concat(Math.random() < 0.55 && rx.length ? [pick(rx)] : []));
  }
  function fillFood() {
    st.food = 1; sfx('blip'); later(() => sfx('happy'), 300);
    for (let i = 0; i < 26; i++) addP({ type: 'kibble', x: BOWL_F.x + rand(-30, 30), y: BOWL_F.y - 160 - rand(0, 120), vx: rand(-20, 20), vy: rand(0, 60), ground: BOWL_F.y - 18, life: 2, t: 0, s: rand(4, 6) });
    talk([FOOD_LINES[0]].concat([FOOD_LINES[1]]).filter((l) => ent(roleId(l[0]))));
    dogs().forEach((d, i) => {
      if (d.out || d.drag) return; stopTask(d); d.lie = 0; d.lieT = 0;
      const side = i === 0 ? -1 : 1;
      d.task = 'eat';
      goTo(d, BOWL_F.x + side * (DOG.bl * d.k * 0.42 + 16), BOWL_F.y + 18 + i * 8, 1.6, () => { d.face = -side; d.munch = 1; });
    });
  }
  function tapWater() {
    st.ripple = 1; st.water = 1; sfx('blip');
    const d = dogs().filter((x) => !x.out && !x.drag && x.task !== 'eat').sort((a, b) => Math.abs(a.x - BOWL_W.x) - Math.abs(b.x - BOWL_W.x))[0];
    if (d) { stopTask(d); d.task = 'drink'; goTo(d, BOWL_W.x + DOG.bl * d.k * 0.42 + 16, BOWL_W.y + 20, 1.4, () => { d.face = -1; d.munch = 1; d.drinkT = 2.5; }); }
    sayPresent(WATER_LINES);
  }
  function startNap() {
    if (st.nap > 0) { wake(); return; }
    st.nap = 11; st.bedSquish = 1; sfx('chime');
    talk(NAP_LINES.filter((l) => ent(roleId(l[0]))));
    const spots = [[BED.x - 90, BED.y + 6, 1], [BED.x + 96, BED.y + 2, -1], [BED.x - 10, BED.y + 26, 1], [BED.x + 40, BED.y + 30, -1]];
    let i = 0;
    live_ents().forEach((e) => {
      if (e.drag) return; stopTask(e);
      const [x, y, f] = spots[i++ % spots.length];
      e.task = 'nap';
      e.tx = x; e.ty = y; e.spdMul = 1.3; e.cb = () => { e.face = f; e.lieT = 1; e.y = y; };
    });
    items.forEach((it) => { if (it.holder) dropItem(it.holder); });
  }
  function wake() {
    if (st.nap <= 0) return;
    st.nap = 0; sfx('happy');
    live_ents().forEach((e) => { if (e.task === 'nap') { e.task = null; e.lieT = 0; e.tx = null; e.cb = null; e.idle = rand(0.5, 2); if (e.y < FY0) goTo(e, e.x + rand(-40, 40), rand(FY0, FY1), 0.8); } });
    talk(WAKE_LINES.filter((l) => ent(roleId(l[0]))));
  }
  function stashBone() {
    sfx('jump');
    const it = mkItem('bone', 130, 660); it.home = 'stash'; it.z = 120; items.push(it);
    throwItem(it, rand(380, 760), 1);
    chase(it);
    talk(STASH_LINES.filter((l) => ent(roleId(l[0]))));
  }
  function startPeek(first) {
    const who = first ? 'dad' : pick(['dad', 'mum'].filter((id) => ent(id)));
    if (!who || !ent(who)) return;
    st.peek = { who, t: 0, dur: 5.5, said: false, first };
  }

  /* ======================================================================
     ENTITY DRAWING
     ====================================================================== */
  function drawPerson(g2, e, T2) {
    const P = PD[e.kind] || PD.kid, k = e.k;
    const leg = P.leg * k, tor = P.torso * k, bw = P.bw * k, hs = P.hs * k;
    const walking = e.tx != null && !e.drag && !e.air;
    const bob = walking ? Math.abs(Math.cos(e.phase)) * 5 * k : Math.sin(T2 * 2 + e.seed) * 1.2 * k;
    const gy = e.drag || e.air ? e.ground : e.y;
    const lift = Math.max(0, gy - e.y + e.hopY);
    const shs = clamp(1 - lift / 500, 0.3, 1);
    g2.fillStyle = 'rgba(40,20,60,.2)'; ell(g2, e.x, gy + 2, bw * 0.78 * shs, 9 * k * shs + 2); g2.fill();
    g2.save(); g2.translate(e.x, e.y - e.hopY);
    if (e.lie > 0.01) { g2.translate(0, e.lie * leg * 0.15); g2.rotate(-e.lie * Math.PI / 2 * e.face); }
    const sq = e.sq * 0.14; g2.scale(1 + sq, 1 - sq);
    // legs
    const legW = bw * 0.3;
    for (const s of [-1, 1]) {
      let lft = walking ? Math.max(0, Math.sin(e.phase + (s > 0 ? Math.PI : 0))) * 10 * k : 0;
      let kick = e.drag ? Math.sin(T2 * 13 + (s > 0 ? Math.PI : 0)) * 0.4 : e.air ? s * 0.25 : 0;
      g2.save(); g2.translate(s * bw * 0.21, -leg - bob * 0.3); g2.rotate(kick);
      const L = leg - lft;
      g2.fillStyle = e.pants; rr(g2, -legW / 2, -4 * k, legW, L + 2 * k, legW * 0.45); g2.fill();
      g2.fillStyle = '#2b2440'; ell(g2, s * 3 * k, L - 1 * k, legW * 0.66, legW * 0.38); g2.fill();
      g2.restore();
    }
    // torso
    const top = -leg - tor - bob;
    const shirtD = shade(e.shirt, -0.22);
    // arms (behind torso edges)
    const shY = top + 16 * k, armL = tor * 0.8, aw = bw * 0.24;
    const armEnd = (s) => {
      let a;
      if (e.drag) a = 2.5 + Math.sin(T2 * 10 + s) * 0.25;
      else if (e.air) a = 2.2;
      else if (walking) a = 0.16 + Math.sin(e.phase + (s > 0 ? 0 : Math.PI)) * 0.45;
      else if (e.bubble && T2 - e.bubble.t0 < 0.8 && s > 0) a = 2.3 + Math.sin(T2 * 14) * 0.25;
      else a = 0.14 + Math.sin(T2 * 1.6 + e.seed + s) * 0.03;
      return [s * bw * 0.44 + Math.sin(a) * s * armL * 0.9, shY + Math.cos(a) * armL];
    };
    const headCY = top - hs * 0.5 + hs * 0.22 + (e.bubble && T2 - e.bubble.t0 < e.bubble.dur ? Math.sin(T2 * 15) * 1.5 * k : 0);
    const eatingHand = e.eat ? [bw * 0.08, headCY + hs * 0.22] : null;
    g2.lineCap = 'round';
    for (const s of [-1, 1]) {
      const [hx, hy] = s > 0 && eatingHand ? eatingHand : armEnd(s);
      g2.strokeStyle = e.shirt; g2.lineWidth = aw; g2.beginPath(); g2.moveTo(s * bw * 0.4, shY); g2.lineTo(hx, hy); g2.stroke();
      g2.fillStyle = e.skin; circle(g2, hx, hy, aw * 0.62); g2.fill();
      if (s > 0) e.hand = [e.x + hx, e.y - e.hopY + hy];
    }
    g2.fillStyle = e.shirt; rr(g2, -bw / 2, top, bw, tor + 8 * k, bw * 0.38); g2.fill();
    g2.strokeStyle = shirtD; g2.lineWidth = 2.5 * k; g2.stroke();
    g2.fillStyle = 'rgba(255,255,255,.22)'; rr(g2, -bw * 0.36, top + 6 * k, bw * 0.2, tor * 0.5, bw * 0.1); g2.fill();
    if (e.id === captain) { g2.fillStyle = '#ffd166'; starPath(g2, bw * 0.18, top + tor * 0.4, 9 * k, 4 * k, 5, 0); g2.fill(); g2.strokeStyle = '#d98a10'; g2.lineWidth = 1.5 * k; g2.stroke(); }
    // head
    g2.drawImage(e.head, -hs / 2, headCY - hs / 2, hs, hs);
    // snack in hand
    if (e.eat) {
      const [hx, hy] = eatingHand; const left = 1 - e.eat.bites / 4;
      g2.save(); g2.translate(hx, hy - 4 * k); g2.scale(Math.max(0.15, left), Math.max(0.15, left));
      drawSnack(g2, e.eat.kind, 18 * k);
      g2.restore();
    }
    g2.restore();
  }
  function drawSnack(g2, kind, s) {
    if (kind === 'apple') { g2.fillStyle = '#ff3b4a'; circle(g2, 0, 0, s); g2.fill(); g2.fillStyle = '#4fd36a'; ell(g2, s * 0.35, -s * 1.05, s * 0.4, s * 0.2, -0.5); g2.fill(); g2.fillStyle = 'rgba(255,255,255,.5)'; circle(g2, -s * 0.35, -s * 0.3, s * 0.25); g2.fill(); }
    else if (kind === 'toast') { g2.fillStyle = '#c9803a'; rr(g2, -s, -s, s * 2, s * 2, s * 0.5); g2.fill(); g2.fillStyle = '#f2c47a'; rr(g2, -s * 0.78, -s * 0.72, s * 1.56, s * 1.56, s * 0.35); g2.fill(); g2.fillStyle = '#fff3a0'; rr(g2, -s * 0.4, -s * 0.3, s * 0.7, s * 0.5, s * 0.2); g2.fill(); }
    else { g2.fillStyle = '#d99a4a'; circle(g2, 0, 0, s); g2.fill(); g2.fillStyle = '#5a2e14'; for (const [a, b] of [[-0.4, -0.3], [0.35, -0.1], [-0.1, 0.4], [0.3, 0.45], [-0.5, 0.2]]) { circle(g2, a * s, b * s, s * 0.13); g2.fill(); } }
  }
  function drawDog(g2, e, T2) {
    const k = e.k, f = e.face, bl = DOG.bl * k, bh = DOG.bh * k, lieK = e.lie, lh = DOG.lh * k * (1 - lieK * 0.8), hs = DOG.hs * k;
    const walking = e.tx != null && !e.drag && !e.air;
    const gy = e.drag || e.air ? e.ground : e.y;
    const lift = Math.max(0, gy - e.y + e.hopY);
    const shs = clamp(1 - lift / 500, 0.3, 1);
    g2.fillStyle = 'rgba(40,20,60,.2)'; ell(g2, e.x, gy + 2, bl * 0.55 * shs, 10 * k * shs + 2); g2.fill();
    g2.save(); g2.translate(e.x, e.y - e.hopY);
    const sq = e.sq * 0.14; g2.scale(1 + sq, 1 - sq);
    const by = -lh - bh / 2;
    g2.save(); g2.scale(f, 1);
    // tail
    const wagging = e.wagT > 0, wsp = wagging ? 24 : 6, wa = wagging ? 0.55 : 0.18;
    g2.save(); g2.translate(-bl * 0.44, by - bh * 0.2); g2.rotate(-0.55 + Math.sin(T2 * wsp + e.seed) * wa - lieK * 0.4);
    g2.fillStyle = BROWN; ell(g2, -bl * 0.13, 0, bl * 0.17, bh * 0.17, 0); g2.fill();
    g2.fillStyle = WHITE; ell(g2, -bl * 0.27, 0, bl * 0.07, bh * 0.13); g2.fill();
    g2.restore();
    // legs
    const legs = [[-0.3, 1, 0], [0.22, 1, Math.PI], [-0.18, 0, Math.PI], [0.34, 0, 0]];
    const lw = 21 * k;
    if (lieK < 0.6) {
      for (const [px, far, ph] of legs) {
        let sw = walking ? Math.sin(e.phase * 1.3 + ph) * 0.45 : e.drag ? Math.sin(T2 * 14 + ph) * 0.5 : 0;
        g2.save(); g2.translate(px * bl, by + bh * 0.1); g2.rotate(sw);
        g2.fillStyle = far ? '#e8dccb' : WHITE; rr(g2, -lw / 2, 0, lw, lh + bh * 0.4, lw * 0.45); g2.fill();
        g2.fillStyle = far ? 'rgba(122,62,29,.35)' : 'rgba(122,62,29,.5)'; circle(g2, 0, lh * 0.6, lw * 0.18); g2.fill();
        g2.fillStyle = far ? '#e0d2bf' : '#f2ebe0'; ell(g2, lw * 0.15, lh + bh * 0.38, lw * 0.62, lw * 0.36); g2.fill();
        g2.restore();
      }
    } else {
      g2.fillStyle = WHITE; ell(g2, bl * 0.42, -lw * 0.4, lw * 1.2, lw * 0.45); g2.fill(); ell(g2, bl * 0.36, -lw * 0.2, lw * 1.2, lw * 0.45); g2.fill();
    }
    // body
    ell(g2, 0, by, bl / 2, bh / 2); g2.fillStyle = WHITE; g2.fill(); g2.strokeStyle = '#d8c9b6'; g2.lineWidth = 2.5 * k; g2.stroke();
    g2.save(); ell(g2, 0, by, bl / 2, bh / 2); g2.clip();
    g2.fillStyle = BROWN; ell(g2, -bl * 0.06, by - bh * 0.38, bl * 0.3, bh * 0.42); g2.fill();
    ell(g2, -bl * 0.42, by - bh * 0.05, bl * 0.16, bh * 0.42); g2.fill();
    g2.fillStyle = 'rgba(122,62,29,.55)';
    const R = rng(e.id === 'maggie' ? 5 : 9); for (let i = 0; i < 14; i++) { circle(g2, (R() - 0.5) * bl * 0.8, by + R() * bh * 0.45, (1.5 + R() * 2) * k); g2.fill(); }
    g2.restore();
    g2.restore();
    // head
    let hx = f * bl * 0.4, hy = by - bh * 0.12 - hs * 0.36;
    if (lieK > 0) { hx = f * bl * lerp(0.4, 0.46, lieK); hy += hs * 0.22 * lieK; }
    if (e.munch > 0) hy += hs * (0.16 + 0.06 * Math.sin(T2 * 14));
    const rot = (wagging ? Math.sin(T2 * 11) * 0.07 : 0) + lieK * 0.18 * f + (e.playT > 0 ? Math.sin(T2 * 22) * 0.25 : 0);
    g2.save(); g2.translate(hx, hy); g2.rotate(rot); g2.drawImage(e.head, -hs / 2, -hs / 2, hs, hs); g2.restore();
    e.mouth = [e.x + hx + f * hs * 0.04, e.y - e.hopY + hy + hs * 0.2];
    if (e.it && e.it.holder === e) { g2.save(); g2.translate(hx + f * hs * 0.04, hy + hs * 0.2); g2.rotate(rot); drawItemShape(g2, e.it, 0, 0); g2.restore(); }
    g2.restore();
  }
  function drawItemShape(g2, it, x, y) {
    const s = HOUSE ? 1 : 1.5;
    g2.save(); g2.translate(x, y); g2.rotate(it.spin * (it.state === 'fly' ? T : 0) * 0.3);
    if (it.kind === 'ball') {
      const r = 16 * s; g2.fillStyle = '#d8f04a'; circle(g2, 0, 0, r); g2.fill(); g2.strokeStyle = '#fff'; g2.lineWidth = 3 * s;
      g2.beginPath(); g2.arc(-r * 0.9, 0, r * 0.75, -1, 1); g2.stroke(); g2.beginPath(); g2.arc(r * 0.9, 0, r * 0.75, Math.PI - 1, Math.PI + 1); g2.stroke();
      g2.fillStyle = 'rgba(255,255,255,.35)'; circle(g2, -r * 0.35, -r * 0.4, r * 0.3); g2.fill();
    } else if (it.kind === 'rope') {
      g2.strokeStyle = '#5fbff9'; g2.lineWidth = 9 * s; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(-22 * s, 0); g2.quadraticCurveTo(0, -10 * s, 22 * s, 0); g2.stroke();
      g2.strokeStyle = '#fff'; g2.lineWidth = 3 * s; g2.setLineDash([5 * s, 6 * s]); g2.stroke(); g2.setLineDash([]);
      g2.fillStyle = '#ff6fa8'; circle(g2, -24 * s, 0, 9 * s); g2.fill(); circle(g2, 24 * s, 0, 9 * s); g2.fill();
    } else if (it.kind === 'squeak') {
      g2.save(); g2.scale(1, 1); g2.fillStyle = '#ffd166'; rr(g2, -20 * s, -6 * s, 40 * s, 12 * s, 6 * s); g2.fill();
      for (const sx2 of [-1, 1]) { circle(g2, sx2 * 20 * s, -7 * s, 8 * s); g2.fill(); circle(g2, sx2 * 20 * s, 7 * s, 8 * s); g2.fill(); }
      g2.restore();
    } else if (it.kind === 'ring') {
      g2.strokeStyle = '#ff7a45'; g2.lineWidth = 10 * s; circle(g2, 0, 0, 14 * s); g2.stroke();
      g2.strokeStyle = 'rgba(255,255,255,.5)'; g2.lineWidth = 3 * s; g2.beginPath(); g2.arc(0, 0, 14 * s, -2.4, -1.4); g2.stroke();
    } else if (it.kind === 'bone') { boneShape(g2, 0, 0, 44 * s); }
    g2.restore();
  }
  function drawItem(g2, it) {
    if (it.gone || it.state === 'held') return;
    const r = itemR(it);
    g2.fillStyle = `rgba(40,20,60,${0.22 * clamp(1 - it.z / 300, 0.3, 1)})`; ell(g2, it.x, it.y + 2, r * 1.1, r * 0.35); g2.fill();
    drawItemShape(g2, it, it.x, it.y - it.z - r * (it.kind === 'ball' ? 1 : 0.6));
  }
  function entHeight(e) {
    if (e.dog) return (DOG.lh + DOG.bh + DOG.hs * 0.75) * e.k;
    const P = PD[e.kind] || PD.kid; return (P.leg + P.torso + P.hs * 0.78) * e.k;
  }
  function entBox(e) {
    const h = entHeight(e), y = e.y - e.hopY;
    const w = e.dog ? DOG.bl * e.k * 1.15 : Math.max(PD[e.kind].bw, PD[e.kind].hs * 0.66) * e.k;
    if (e.lie > 0.5) return [e.x - h * 0.6, y - w * 0.8, e.x + h * 0.6, y + 10];
    return [e.x - w / 2, y - h, e.x + w / 2, y + 12];
  }

  /* ======================================================================
     UPDATE
     ====================================================================== */
  function updEnt(e, dt) {
    if (e.jumpT > 0) { e.jumpT = Math.max(0, e.jumpT - dt); e.hopY = Math.sin((1 - e.jumpT / e.jumpDur) * Math.PI) * e.jumpH; } else e.hopY = 0;
    e.sq = Math.max(0, e.sq - dt * 4); e.wagT = Math.max(0, e.wagT - dt);
    if (e.bubble && T - e.bubble.t0 > e.bubble.dur) e.bubble = null;
    e.lie += (e.lieT - e.lie) * Math.min(1, dt * 5);
    if (e.drag) return;
    if (e.air) {
      e.vy += 2600 * dt; e.y += e.vy * dt;
      if (e.y >= e.ground) {
        e.y = e.ground; e.air = false;
        if (e.vy > 520) { e.sq = 1; sfx('thud'); if (st.firstDrop) { st.firstDrop = false; later(() => talk(DROP_JOKE, 0, true), 350); } }
        e.vy = 0; e.idle = rand(1, 3);
      }
      return;
    }
    if (e.playT > 0) { e.playT -= dt; e.wagT = 0.5; if (e.playT <= 0) { dropItem(e); e.idle = rand(1, 3); } return; }
    if (e.eat) {
      e.eat.t += dt;
      const bites = Math.floor(e.eat.t / 0.75);
      if (bites > e.eat.bites && bites <= 4) { e.eat.bites = bites; sfx('blip'); crumbs(e.hand[0], e.hand[1], e.y, 6, e.eat.kind === 'apple' ? '#fff3c8' : '#c98a3d'); e.sq = 0.4; }
      if (e.eat.t > 3.4) { e.eat = null; hearts(e.x, e.y - entHeight(e), 3); e.idle = rand(2, 4); }
      return;
    }
    if (e.munch > 0) {
      e.wagT = 0.3;
      if (e.task === 'eat') { st.food = Math.max(0, st.food - dt * 0.09); if (Math.random() < dt * 2.5) { sfx('blip'); addP({ type: 'emote', x: e.mouth[0], y: e.mouth[1] - 20, vx: 0, vy: -40, life: 0.9, t: 0, s: 1, text: 'munch' }); } if (st.food <= 0) { e.munch = 0; e.task = null; e.wagT = 2; e.idle = rand(1, 2); if (!st.foodDone) { st.foodDone = true; later(() => { st.foodDone = false; talkSoon(FOOD_DONE); }, 400); } } }
      else if (e.task === 'drink') { e.drinkT = (e.drinkT || 0) - dt; st.ripple = Math.max(st.ripple, 0.5); if (Math.random() < dt * 3) addP({ type: 'emote', x: e.mouth[0], y: e.mouth[1] - 20, vx: 0, vy: -40, life: 0.9, t: 0, s: 1, text: 'slurp' }); if (e.drinkT <= 0) { e.munch = 0; e.task = null; e.idle = rand(1, 2); } }
      else e.munch = 0;
    }
    if (e.task === 'chase') {
      const it = e.it;
      if (!it || it.gone || it.state === 'held') { e.task = null; e.it = null; e.tx = null; e.idle = rand(0.5, 2); }
      else {
        const dir = Math.sign(it.x - e.x) || e.face;
        e.tx = it.x - dir * DOG.bl * e.k * 0.42; e.ty = clamp(it.y, FY0, FY1); e.cb = null;
        const mx = e.x + e.face * DOG.bl * e.k * 0.42;
        if (Math.abs(mx - it.x) < 34 * e.k && Math.abs(e.y - it.y) < 40 && it.z < 60 * e.k && Math.sign(it.x - e.x) === e.face) { grab(e, it); }
        else if (Math.abs(e.tx - e.x) < 6 && Math.abs(e.ty - e.y) < 6 && it.state === 'rest') { e.face = dir; grab(e, it); }
      }
    }
    if (e.tx != null) {
      const dx = e.tx - e.x, dy = e.ty - e.y, d = Math.hypot(dx, dy), v = speedOf(e) * e.spdMul;
      if (Math.abs(dx) > 3) e.face = dx > 0 ? 1 : -1;
      if (d <= v * dt + 0.5) {
        e.x = e.tx; e.y = e.ty; e.tx = null; const cb = e.cb; e.cb = null; e.idle = rand(2, 5);
        if (cb) cb();
      } else { e.x += (dx / d) * v * dt; e.y += (dy / d) * v * dt; e.phase += (v * dt) / (e.dog ? 16 * e.k : 20 * e.k); }
      return;
    }
    if (!e.task && st.nap <= 0) { e.idle -= dt; if (e.idle <= 0) wander(e); }
  }
  function updItem(it, dt) {
    if (it.gone || it.state !== 'fly') return;
    const [a, b] = itemBounds();
    it.x += it.vx * dt; it.vz -= G * dt; it.z += it.vz * dt;
    if (it.x < a) { it.x = a; it.vx = Math.abs(it.vx) * 0.5; } if (it.x > b) { it.x = b; it.vx = -Math.abs(it.vx) * 0.5; }
    if (it.z <= 0) {
      it.z = 0;
      if (it.vz < -260) { it.vz = -it.vz * 0.45; it.vx *= 0.6; sfx('blip'); }
      else { it.vz = 0; it.vx = 0; it.state = 'rest'; }
    }
  }
  function update(dt) {
    // camera
    if (!ptr || ptr.mode !== 'pan') camX += (camTarget - camX) * Math.min(1, dt * 7);
    if (HOUSE) {
      const r = roomOfX(camTarget);
      if (r !== st.lastRoom) { st.lastRoom = r; onRoomChange(r); }
      syncNav();
    }
    for (let i = 0; i < 4; i++) st.curt[i] += (st.curtT[i] - st.curt[i]) * Math.min(1, dt * 6);
    st.fridge += (st.fridgeT - st.fridge) * Math.min(1, dt * 7);
    if (st.oven > 0) { st.oven -= dt; if (st.oven <= 0) { st.oven = 0; st.cakes = 4; sfx('chime'); sparkle(1000 + 790, 430, 10); talkSoon(OVEN_DONE.filter((l) => ent(roleId(l[0])))); } }
    st.toast = Math.max(0, st.toast - dt); st.kettle = Math.max(0, st.kettle - dt); st.fish = Math.max(0, st.fish - dt * 1.4);
    st.bounce = Math.max(0, st.bounce - dt * 1.2); st.sofa = Math.max(0, st.sofa - dt * 2); st.book = Math.max(0, st.book - dt);
    st.mobileV *= Math.pow(0.4, dt); st.mobileA += (0.35 + st.mobileV) * dt;
    st.teddy = Math.max(0, st.teddy - dt * 0.9); st.blocksT = Math.min(1, st.blocksT + dt * 2.2);
    st.clockSpin = Math.max(0, st.clockSpin - dt * 0.6);
    st.ripple = Math.max(0, st.ripple - dt * 0.9); st.bedSquish = Math.max(0, st.bedSquish - dt * 1.2);
    if (!HOUSE) {
      if (st.nap > 0) {
        st.nap -= dt; st.napK = Math.min(1, st.napK + dt * 0.8);
        if (Math.random() < dt * 2.2) { const sl = live_ents().filter((e) => e.lie > 0.5); if (sl.length) { const e = pick(sl); addP({ type: 'zzz', x: e.x + e.face * 30 * e.k, y: e.y - 70 * e.k, vx: rand(10, 30), vy: -50, life: 2.2, t: 0, s: rand(22, 34) }); } }
        if (st.nap <= 0) { st.nap = 0.001; wake(); }
      } else st.napK = Math.max(0, st.napK - dt * 1.2);
      st.water = Math.max(0.4, st.water - dt * 0.01);
      st.nextPeek -= dt;
      if (!st.peek && st.nextPeek <= 0 && st.nap <= 0) { startPeek(false); st.nextPeek = rand(16, 26); }
      if (st.peek) { st.peek.t += dt; if (!st.peek.said && st.peek.t > 0.7) { st.peek.said = true; if (!st.peek.first) sayFrom(PEEK_LINES, st.peek.who); } if (st.peek.t > st.peek.dur) st.peek = null; }
    }
    if (scope) {
      scope.t += dt;
      if (scope.shoot) { scope.shoot.t += dt; if (scope.shoot.t > scope.shoot.life) scope.shoot = null; }
      else { scope.nextShoot -= dt; if (scope.nextShoot <= 0) { scope.nextShoot = rand(3, 6); const gm = scopeGeom(); scope.shoot = { x: scope.ox + rand(-300, 200), y: rand(-380, -100), vx: rand(380, 520), vy: rand(160, 260), t: 0, life: 1.4 }; void gm; } }
    }
    ents.forEach((e) => { if (!e.out) updEnt(e, dt); });
    items.forEach((it) => updItem(it, dt));
    for (let i = items.length - 1; i >= 0; i--) if (items[i].gone) items.splice(i, 1);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.t += dt;
      if (p.type === 'crumb' || p.type === 'kibble') {
        if (!p.rest) { p.vy += 1400 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y >= p.ground) { p.y = p.ground; if (p.vy > 200) { p.vy = -p.vy * 0.3; p.vx *= 0.5; } else { p.rest = true; } } }
      } else { p.x += p.vx * dt; p.y += p.vy * dt; if (p.type === 'spark') { p.vx *= 0.92; p.vy *= 0.92; } }
      if (p.t > p.life) particles.splice(i, 1);
    }
  }
  function onRoomChange(r) {
    const cap = capEnt();
    if (cap && freeEnt(cap) && !cap.task && roomOfX(cap.x) !== r) {
      goTo(cap, r * RWID + rand(340, 660), rand(FY0, FY1), 1.7);
      dogs().forEach((d, i) => { if (freeEnt(d) && !d.task && Math.random() < 0.85) later(() => { if (freeEnt(d) && !d.task) goTo(d, r * RWID + rand(220, 780), rand(FY0, FY1), 1.5); }, 300 + i * 350); });
    }
  }

  /* ======================================================================
     DRAW
     ====================================================================== */
  function getCache(i) {
    const key = i;
    if (caches[key]) return caches[key];
    const y0 = HOUSE ? -260 : -80, y1 = 752, x0 = 0, w = RWID, h = y1 - y0;
    const ps = sc * dpr;
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * ps)); c.height = Math.max(1, Math.ceil(h * ps));
    const g2 = c.getContext('2d');
    g2.setTransform(ps, 0, 0, ps, -x0 * ps, -y0 * ps);
    try {
      if (HOUSE) { drawRoofSlice(g2, i); ROOMS[i].bg(g2); }
      else kennelBg(g2);
    } catch (e) { console.error(e); }
    return (caches[key] = { c, y0, h });
  }
  function drawRoofSlice(g2, i) {
    // drawn in room-local coords: global x = i*1000 + local
    g2.save(); g2.translate(-i * RWID, 0);
    roofPath(g2); g2.save(); g2.clip();
    g2.fillStyle = '#e2574c'; g2.fillRect(i * RWID - 10, -270, RWID + 20, 280);
    g2.fillStyle = '#f06a5d';
    for (let r = 0; r < 10; r++) { const y = -10 - r * 26; for (let x = i * RWID - 40 + (r % 2) * 20; x < (i + 1) * RWID + 40; x += 40) { g2.beginPath(); g2.arc(x, y, 18, 0, Math.PI); g2.fill(); } }
    g2.strokeStyle = 'rgba(150,40,30,.35)'; g2.lineWidth = 2;
    for (let r = 0; r < 10; r++) { const y = -10 - r * 26; for (let x = i * RWID - 40 + (r % 2) * 20; x < (i + 1) * RWID + 40; x += 40) { g2.beginPath(); g2.arc(x, y, 18, 0, Math.PI); g2.stroke(); } }
    g2.restore();
    // round attic window
    const cx = i * RWID + RWID / 2;
    g2.fillStyle = '#fff'; circle(g2, cx, -130, 46); g2.fill();
    g2.fillStyle = ['#ffd166', '#5fe0c8', '#ff9fc4', '#9fb2ff'][i % 4]; circle(g2, cx, -130, 36); g2.fill();
    g2.strokeStyle = '#fff'; g2.lineWidth = 6; g2.beginPath(); g2.moveTo(cx - 36, -130); g2.lineTo(cx + 36, -130); g2.moveTo(cx, -166); g2.lineTo(cx, -94); g2.stroke();
    g2.fillStyle = '#fffaf0'; g2.fillRect(i * RWID, -14, RWID, 6);
    g2.restore();
  }
  function roofPath(g2) { g2.beginPath(); g2.moveTo(-90, -8); g2.lineTo(200, -262); g2.lineTo(WORLD_W - 200, -262); g2.lineTo(WORLD_W + 90, -8); g2.closePath(); }
  function drawSky(g2) {
    const gr = g2.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#6ec6ff'); gr.addColorStop(0.7, '#c8eeff'); gr.addColorStop(1, '#e8f8ff');
    g2.fillStyle = gr; g2.fillRect(0, 0, W, H);
    const sunX = W - 90 - ((camX * sc * 0.05) % 40), sunY = Math.max(70, sy(VT) - 10);
    g2.globalAlpha = 0.7; g2.drawImage(glowOf('#fff2a0'), sunX - 110, sunY - 110, 220, 220); g2.globalAlpha = 1;
    g2.fillStyle = '#ffe066'; circle(g2, sunX, sunY, 34); g2.fill();
    for (let i = 0; i < 5; i++) {
      const x = ((i * 380 + T * 12 - camX * sc * 0.2) % (W + 400) + W + 400) % (W + 400) - 200, y = 60 + (i % 3) * 70 + sy(VT) * 0.3;
      g2.fillStyle = 'rgba(255,255,255,.92)'; circle(g2, x, y, 26); g2.fill(); circle(g2, x + 30, y - 10, 32); g2.fill(); circle(g2, x + 62, y, 24); g2.fill(); g2.fillRect(x, y, 62, 24);
    }
    // hills + grass
    const gy = sy(HOUSE ? 748 : 744);
    g2.fillStyle = '#9be38a'; for (let i = -1; i < W / 260 + 2; i++) { const x = i * 260 - ((camX * sc * 0.3) % 260); circle(g2, x, gy + 20, 180); g2.fill(); }
    g2.fillStyle = '#7cd27a'; g2.fillRect(0, gy, W, H - gy);
    g2.fillStyle = '#6cc46a'; for (let x = -((camX * sc) % 60); x < W; x += 60) { g2.fillRect(x, gy, 30, H - gy); }
  }
  function drawWorld(g2) {
    const x0 = camX - vw / 2 - 60, x1 = camX + vw / 2 + 60;
    if (HOUSE) {
      // roof ends and chimney (live)
      g2.save(); roofPath(g2); g2.clip();
      g2.fillStyle = '#e2574c'; if (x0 < 0) g2.fillRect(-100, -270, 100, 270); if (x1 > WORLD_W) g2.fillRect(WORLD_W, -270, 100, 270);
      g2.restore();
      g2.strokeStyle = '#b8403a'; g2.lineWidth = 8; g2.lineJoin = 'round'; roofPath(g2); g2.stroke();
      if (x1 > 3100 && x0 < 3400) { g2.fillStyle = '#c96a4f'; g2.fillRect(3180, -330, 80, 110); g2.fillStyle = '#a8503a'; g2.fillRect(3170, -340, 100, 18);
        for (let i = 0; i < 3; i++) { const t3 = (T * 0.4 + i / 3) % 1; g2.fillStyle = `rgba(255,255,255,${0.6 * (1 - t3)})`; circle(g2, 3220 + t3 * 60, -350 - t3 * 120, 14 + t3 * 18); g2.fill(); } }
      for (let i = 0; i < NR; i++) {
        if ((i + 1) * RWID < x0 || i * RWID > x1) continue;
        const c = getCache(i);
        g2.drawImage(c.c, i * RWID, c.y0, RWID, c.h);
        g2.save(); g2.translate(i * RWID, 0); try { ROOMS[i].fg(g2, T); } catch (e) { console.error(e); } g2.restore();
      }
      // outer walls
      g2.fillStyle = '#fff3e0'; g2.fillRect(-34, -14, 34, 766); g2.fillRect(WORLD_W, -14, 34, 766);
      g2.fillStyle = 'rgba(160,100,60,.25)'; g2.fillRect(-6, -14, 6, 735); g2.fillRect(WORLD_W, -14, 6, 735);
      g2.fillStyle = '#c96a4f'; g2.fillRect(-34, 721, 34, 31); g2.fillRect(WORLD_W, 721, 34, 31);
      // partitions with doorways
      for (let i = 1; i < NR; i++) {
        const x = i * RWID; if (x < x0 || x > x1) continue;
        g2.fillStyle = '#fff3e0'; g2.fillRect(x - 14, -14, 28, 318); g2.fillStyle = 'rgba(160,100,60,.3)'; g2.fillRect(x - 14, 296, 28, 8);
        g2.fillStyle = '#d9a46a'; g2.fillRect(x - 16, 300, 6, 300); g2.fillRect(x + 10, 300, 6, 300);
        g2.fillStyle = 'rgba(0,0,0,.05)'; g2.fillRect(x - 10, 304, 20, 296);
        g2.fillStyle = '#fff3e0'; g2.fillRect(x - 14, 600, 28, 121);
        g2.fillStyle = 'rgba(160,100,60,.25)'; g2.fillRect(x - 14, 600, 28, 4);
      }
      // front garden strip flowers
      for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) { const c = ['#ff6fa8', '#ffd166', '#fff', '#9fb2ff'][Math.abs(Math.floor(x / 70)) % 4]; g2.fillStyle = '#4fae5a'; g2.fillRect(x + 33, 756, 4, 20); g2.fillStyle = c; for (let p = 0; p < 5; p++) { const a = (p / 5) * TAU; circle(g2, x + 35 + Math.cos(a) * 7, 756 + Math.sin(a) * 7, 5); g2.fill(); } g2.fillStyle = '#ffb347'; circle(g2, x + 35, 756, 4); g2.fill(); }
    } else {
      // kennel exterior shell
      g2.fillStyle = '#a8603a'; g2.beginPath(); g2.moveTo(-50, 110); g2.lineTo(600, -78); g2.lineTo(1250, 110); g2.lineTo(1250, 752); g2.lineTo(-50, 752); g2.closePath(); g2.fill();
      g2.fillStyle = '#c94a3d'; g2.beginPath(); g2.moveTo(-96, 100); g2.lineTo(600, -116); g2.lineTo(1296, 100); g2.lineTo(1296, 142); g2.lineTo(600, -70); g2.lineTo(-96, 142); g2.closePath(); g2.fill();
      g2.strokeStyle = '#a83a30'; g2.lineWidth = 5; g2.lineJoin = 'round'; g2.stroke();
      const c = getCache(0); g2.drawImage(c.c, 0, c.y0, RWID, c.h);
      kennelDoor(g2, T);
      fairyLights(g2, T, st.napK);
      drawDogBed(g2, T);
      g2.fillStyle = '#a8603a'; g2.fillRect(-50, 716, 1300, 36);
    }
    // depth-sorted things
    const list = [];
    for (const e of ents) if (!e.out && e.x > x0 - 300 && e.x < x1 + 300) list.push({ y: e.y + (e.lie > 0.5 ? -40 : 0), f: () => (e.dog ? drawDog(g2, e, T) : drawPerson(g2, e, T)), drag: e.drag || e.air });
    for (const it of items) if (!it.gone && it.state !== 'held') list.push({ y: it.y, f: () => drawItem(g2, it) });
    if (HOUSE && x1 > 3300 && x0 < 3800) list.push({ y: 642, f: () => drawBlocks(g2, T) });
    if (!HOUSE) { list.push({ y: BOWL_F.y, f: () => drawBowl(g2, BOWL_F, 'food', T) }); list.push({ y: BOWL_W.y, f: () => drawBowl(g2, BOWL_W, 'water', T) }); }
    list.sort((a, b) => (a.drag ? 1 : 0) - (b.drag ? 1 : 0) || a.y - b.y);
    for (const o of list) { try { o.f(); } catch (e) { console.error(e); } }
    // particles (world)
    for (const p of particles) drawParticle(g2, p);
    // lighting
    if (HOUSE) {
      for (let i = 0; i < NR; i++) {
        if ((i + 1) * RWID < x0 || i * RWID > x1) continue;
        if (st.dark[i]) { g2.fillStyle = 'rgba(14,12,58,.55)'; g2.fillRect(i * RWID, -14, RWID, 735); }
        g2.save(); g2.translate(i * RWID, 0); try { ROOMS[i].glow(g2, T); } catch (e) { console.error(e); } g2.restore();
      }
    } else if (st.napK > 0) {
      g2.fillStyle = `rgba(14,12,58,${0.42 * st.napK})`; g2.fillRect(-60, -120, 1320, 880);
      g2.save(); g2.globalAlpha = st.napK; fairyLights(g2, T, 1); g2.restore();
    }
  }
  function drawParticle(g2, p) {
    const k = 1 - p.t / p.life;
    if (p.type === 'heart') { g2.globalAlpha = Math.min(1, k * 2); g2.fillStyle = '#ff6fa8'; heartPath(g2, p.x, p.y, p.s); g2.fill(); g2.globalAlpha = 1; }
    else if (p.type === 'spark') { g2.globalAlpha = k; g2.fillStyle = p.col; starPath(g2, p.x, p.y, p.s, p.s * 0.45, 4, p.t * 4); g2.fill(); g2.globalAlpha = 1; }
    else if (p.type === 'crumb' || p.type === 'kibble') { g2.globalAlpha = Math.min(1, k * 4); g2.fillStyle = p.type === 'kibble' ? '#8a4f24' : p.col; circle(g2, p.x, p.y, p.s * (p.type === 'kibble' ? 1 : 0.7)); g2.fill(); g2.globalAlpha = 1; }
    else if (p.type === 'bubble') { g2.globalAlpha = k; g2.strokeStyle = '#fff'; g2.lineWidth = 1.5; circle(g2, p.x, p.y, p.s); g2.stroke(); g2.globalAlpha = 1; }
    else if (p.type === 'zzz') { g2.globalAlpha = Math.min(1, k * 2); txt(g2, 'Z', p.x, p.y, p.s * (1 + p.t * 0.3), '#fff', { stroke: '#5b4bb7', lw: 5 }); g2.globalAlpha = 1; }
    else if (p.type === 'emote') { g2.globalAlpha = Math.min(1, k * 2); txt(g2, p.text === 'munch' ? 'munch!' : 'slurp!', p.x, p.y, HOUSE ? 20 : 26, '#fff', { stroke: '#7a3e1d', lw: 5 }); g2.globalAlpha = 1; }
  }
  function drawBubbles(g2) {
    const fs = W < 600 ? 17 : 20;
    g2.font = `700 ${fs}px ${FB}`;
    const boxes = [];
    for (const e of ents) {
      if (!e.bubble || e.out) continue;
      const b = e.bubble, age = T - b.t0, a = Math.min(1, age * 6, (b.dur - age) * 3);
      if (a <= 0) continue;
      const maxW = Math.min(300, W * 0.6);
      const lines = wrapLines(g2, b.text, maxW - 28);
      const tw = Math.max(...lines.map((l) => g2.measureText(l).width)) + 28, th = lines.length * (fs * 1.25) + 18;
      const ax = sx(e.x), ay = sy(e.y - e.hopY - entHeight(e) * (e.lie > 0.5 ? 0.4 : 1)) - 12;
      let bx = clamp(ax - tw * 0.35, 8, W - tw - 8), by = ay - th - 14;
      const top = topEl.getBoundingClientRect().bottom + 4;
      for (const o of boxes) if (bx < o[0] + o[2] && bx + tw > o[0] && by < o[1] + o[3] + 6 && by + th > o[1]) by = o[1] - th - 8;
      if (by < top) by = top;
      boxes.push([bx, by, tw, th]);
      g2.globalAlpha = a;
      g2.fillStyle = 'rgba(30,20,80,.22)'; rr(g2, bx + 2, by + 5, tw, th, 18); g2.fill();
      g2.fillStyle = '#fff'; rr(g2, bx, by, tw, th, 18); g2.fill();
      g2.beginPath(); const tx = clamp(ax, bx + 20, bx + tw - 20); g2.moveTo(tx - 10, by + th - 1); g2.lineTo(tx + 10, by + th - 1); g2.lineTo(clamp(ax, tx - 6, tx + 6), Math.min(ay, by + th + 16)); g2.closePath(); g2.fill();
      g2.fillStyle = '#231a4f'; g2.textAlign = 'left'; g2.textBaseline = 'top';
      lines.forEach((l, i) => g2.fillText(l, bx + 14, by + 10 + i * fs * 1.25));
      g2.globalAlpha = 1;
    }
  }
  function draw() {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawSky(g);
    g.save(); g.translate(W / 2 - camX * sc, oy); g.scale(sc, sc);
    drawWorld(g);
    g.restore();
    if (!scope) drawBubbles(g);
    if (scope) drawScope(g);
  }

  /* ---------- nav ---------- */
  let navRoom = -1;
  function syncNav() {
    const r = roomOfX(camTarget);
    if (r === navRoom) return; navRoom = r;
    if (tabsEl) tabsEl.querySelectorAll('.hm-tab').forEach((b) => { const on = +b.dataset.room === r; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    if (leftBtn) leftBtn.disabled = r <= 0;
    if (rightBtn) rightBtn.disabled = r >= NR - 1;
  }
  function goRoom(r) { r = clamp(r, 0, NR - 1); camTarget = roomCam(r); sfx('whoosh'); live.textContent = ROOM_TABS[r][1]; }

  /* ======================================================================
     INPUT
     ====================================================================== */
  let ptr = null;
  function local(e) { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function hitEnt(wx, wy) {
    let best = null;
    for (const e of ents) {
      if (e.out) continue;
      const [a, b, c, d] = entBox(e);
      const pad = 14 / sc * 0.5;
      if (wx >= a - pad && wx <= c + pad && wy >= b - pad && wy <= d + pad) { if (!best || e.y > best.y) best = e; }
    }
    return best;
  }
  function hitItem(wx, wy) {
    for (const it of items) {
      if (it.gone || it.state === 'held') continue;
      const r = Math.max(itemR(it) * 1.8, 34 / sc);
      const cy = it.y - it.z - itemR(it);
      if (Math.hypot(wx - it.x, wy - cy) < r) return it;
    }
    return null;
  }
  function onDown(e) {
    if (closed || ptr) return;
    if (modal === 'snack') return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    const [x, y] = local(e);
    ptr = { id: e.pointerId, sx: x, sy: y, x, y, mode: 'tap', cam0: camX, lastX: x, lastT: now(), vx: 0, ent: null };
    if (scope) return;
    const wx = wxOf(x), wy = wyOf(y);
    if (hitItem(wx, wy)) return;
    const en = hitEnt(wx, wy);
    if (en && st.nap <= 0) { ptr.ent = en; ptr.gdx = wx - en.x; ptr.gdy = wy - (en.y - en.hopY); }
  }
  function onMove(e) {
    if (!ptr || e.pointerId !== ptr.id) return;
    const [x, y] = local(e);
    const t = now(), dtm = Math.max(1, t - ptr.lastT);
    ptr.vx = lerp(ptr.vx, ((x - ptr.lastX) / dtm) * 1000, 0.5); ptr.lastX = x; ptr.lastT = t;
    if (ptr.mode === 'tap' && Math.hypot(x - ptr.sx, y - ptr.sy) > 10) {
      if (scope) ptr.mode = 'scope';
      else if (ptr.ent) { ptr.mode = 'drag'; startDrag(ptr.ent); }
      else ptr.mode = 'pan';
    }
    if (ptr.mode === 'pan') {
      const [lo, hi] = camBounds();
      let c = ptr.cam0 - (x - ptr.sx) / sc;
      if (c < lo) c = lo - (lo - c) * 0.3; if (c > hi) c = hi + (c - hi) * 0.3;
      camX = c; camTarget = c;
    } else if (ptr.mode === 'drag') {
      const en = ptr.ent, wx = wxOf(x), wy = wyOf(y);
      const lim = HOUSE ? [40, WORLD_W - 40] : [60, 1140];
      en.x = clamp(wx - ptr.gdx, lim[0], lim[1]);
      en.y = clamp(wy - ptr.gdy, VT + entHeight(en) * 0.6, FY1);
      // drag to the screen edge pans the house
      if (HOUSE) { if (x < 50) camTarget = clampCam(camTarget - 10 / sc); else if (x > W - 50) camTarget = clampCam(camTarget + 10 / sc); }
    } else if (ptr.mode === 'scope') {
      const gm = scopeGeom(); scope.ox -= (x - ptr.x) / gm.u; scope.ox = ((scope.ox % SKY_W) + SKY_W) % SKY_W;
    }
    ptr.x = x; ptr.y = y;
  }
  function onUp(e) {
    if (!ptr || e.pointerId !== ptr.id) return;
    const p = ptr; ptr = null;
    if (e.type === 'pointercancel' && p.mode === 'tap') return;
    if (p.mode === 'tap') { try { handleTap(p.sx, p.sy); } catch (er) { console.error(er); } }
    else if (p.mode === 'drag') endDrag(p.ent);
    else if (p.mode === 'pan') {
      const flick = clamp(-p.vx / sc * 0.25, -900, 900);
      let tx = camX + flick;
      if (HOUSE) {
        const r0 = roomOfX(p.cam0); let r = roomOfX(tx);
        if (Math.abs(p.vx) > 400 && r === r0 && vw >= RWID * 0.95) r = clamp(r0 + (p.vx < 0 ? 1 : -1), 0, NR - 1);
        if (vw >= RWID * 0.95) camTarget = roomCam(r);
        else camTarget = clampCam(clamp(tx, r * RWID + vw / 2 - 60, (r + 1) * RWID - vw / 2 + 60));
      } else camTarget = clampCam(tx);
    }
  }
  function startDrag(en) {
    stopTask(en); en.drag = true; en.air = false; en.lieT = 0; en.lie = 0; en.eat = null; en.munch = 0;
    sfx('whoosh');
    const dl = DRAG_LINES.filter((l) => roleId(l[0]) === en.id);
    if (dl.length) talk([pick(dl)]);
  }
  function endDrag(en) {
    en.drag = false;
    const lim = HOUSE ? [60, WORLD_W - 60] : [90, 1100];
    en.x = clamp(en.x, lim[0], lim[1]);
    if (HOUSE) { const r = roomOfX(en.x), lx = en.x - r * RWID; if (lx < 40) en.x = r * RWID + 40; if (lx > RWID - 40) en.x = r * RWID + RWID - 40; }
    en.ground = en.y >= FY0 - 4 ? clamp(en.y, FY0, FY1) : rand(FY0, FY1);
    en.air = true; en.vy = 0; en.idle = rand(2, 4);
    if (en.ground - en.y < 30) { en.y = en.ground; en.air = false; en.sq = 0.4; sfx('jump'); }
  }
  function handleTap(px, py) {
    if (scope) { scopeTap(px, py); return; }
    const wx = wxOf(px), wy = wyOf(py);
    if (!HOUSE && st.nap > 0) {
      const inBed = Math.hypot((wx - BED.x) / BED.rx, (wy - BED.y) / BED.ry) < 1.2;
      if (inBed) { wake(); return; }
      const en0 = hitEnt(wx, wy); if (en0) { if (en0.dog) { en0.wagT = 1; hearts(en0.x, en0.y - 100 * en0.k, 3); sfx('happy'); } return; }
    }
    // items
    const it = hitItem(wx, wy);
    if (it) {
      if (it.kind === 'ball' || it.kind === 'bone') {
        let tx;
        if (HOUSE) { const r = roomOfX(camTarget); const lo = Math.max(r * RWID + 120, camX - vw / 2 + 80), hi = Math.min((r + 1) * RWID - 120, camX + vw / 2 - 80); tx = rand(lo, Math.max(lo + 1, hi)); if (Math.abs(tx - it.x) < 200) tx = clamp(it.x + (it.x < (lo + hi) / 2 ? 320 : -320), lo, hi); }
        else { tx = it.x < 500 ? rand(620, 900) : rand(120, 420); }
        it.home = null; it.y = clamp(rand(FY0 + 10, FY1), FY0, FY1);
        throwItem(it, tx, 0.95); sfx('whoosh'); chase(it);
        talk([pick(THROW_LINES.filter((l) => ent(roleId(l[0])) && !ent(roleId(l[0])).out))].filter(Boolean));
      } else {
        it.home = 'play'; it.vz = 520; it.state = 'fly'; it.z = Math.max(it.z, 1); it.vx = rand(-60, 60); sfx('blip');
        const d = dogs().filter((x) => freeEnt(x) && x.task !== 'eat').sort((a, b) => Math.abs(a.x - it.x) - Math.abs(b.x - it.x))[0];
        if (d) chase(it, [d]);
        if (it.kind === 'squeak') sayPresent(TOY_LINES);
      }
      return;
    }
    const en = hitEnt(wx, wy);
    if (en) {
      if (en.dog) { patDog(en); return; }
      jump(en, 0.35, 16); sfx('blip');
      const list = HOUSE ? TAP_HOUSE : TAP_KENNEL;
      sayFrom(list, en.id) || talk([[en.id, 'Hello!']]);
      return;
    }
    if (HOUSE) {
      if (wx > 3400 && wx < 3640 && wy > 380 && wy < 665) { tapBlocks(); return; }
      const r = Math.floor(wx / RWID); if (r < 0 || r >= NR) return;
      const lx = wx - r * RWID;
      for (const [x, y, w, h, fn] of ROOMS[r].hot) { if (lx >= x && lx <= x + w && wy >= y && wy <= y + h) { fn(); return; } }
    } else {
      // kennel props
      if (st.peek && st.peek.hx && Math.hypot(wx - st.peek.hx, wy - st.peek.hy) < 150 && wx > 950) { sfx('blip'); sayFrom(PEEK_LINES, st.peek.who); st.peek.t = Math.min(st.peek.t, 1); st.peek.dur = Math.max(st.peek.dur, st.peek.t + 3); return; }
      if (Math.abs(wx - BOWL_F.x) < 70 && Math.abs(wy - (BOWL_F.y - 6)) < 44) { fillFood(); return; }
      if (Math.abs(wx - BOWL_W.x) < 70 && Math.abs(wy - (BOWL_W.y - 6)) < 44) { tapWater(); return; }
      if (Math.hypot((wx - BED.x) / BED.rx, (wy - BED.y) / BED.ry) < 1.1) { startNap(); return; }
      if (wx > 30 && wx < 200 && wy > 430 && wy < 610) { stashBone(); return; }
      if (wx > 410 && wx < 550 && wy > 230 && wy < 385) { sfx('chime'); talk(LAIKA_FACTS); return; }
      if (wx > 55 && wx < 265 && wy > 160 && wy < 362) { sfx('chime'); talk([cycle(DOG_FACTS, 'dogfacts')]); return; }
      if (wx > 325 && wx < 625 && wy > 140 && wy < 220) { sfx('happy'); sayPresent(SIGN_LINES); return; }
      if (wx > 940 && wx < 1160 && wy > 220 && wy < 600) { if (!st.peek) startPeek(false); else sfx('blip'); return; }
      if (wy < 200) { st.lightsHue = (st.lightsHue + 1) % 5; sfx('chime'); for (let i = 0; i < 6; i++) sparkle(rand(100, 1100), rand(20, 150), 1); if (st.lightsT++ % 3 === 0) sayPresent(FAIRY_LIGHT_LINES); return; }
    }
    sparkle(wx, wy, 4);
  }
  function onKey(e) {
    if (closed) return;
    if (e.key === 'Escape') { e.preventDefault(); if (modal) { closeModal(); st.fridgeT = 0; } else close(); return; }
    if (modal) return;
    if (HOUSE && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); goRoom(roomOfX(camTarget) + (e.key === 'ArrowLeft' ? -1 : 1)); }
  }
  const ctxMenu = (e) => e.preventDefault();
  function onResize() { measure(); }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  root.addEventListener('contextmenu', ctxMenu);
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  let ro = null;
  try { ro = new ResizeObserver(() => measure()); ro.observe(root); } catch (e) { /* ignore */ }
  $('.hm-back').addEventListener('click', () => close());
  if (leftBtn) leftBtn.addEventListener('click', () => goRoom(roomOfX(camTarget) - 1));
  if (rightBtn) rightBtn.addEventListener('click', () => goRoom(roomOfX(camTarget) + 1));
  if (tabsEl) tabsEl.querySelectorAll('.hm-tab').forEach((b) => b.addEventListener('click', () => goRoom(+b.dataset.room)));

  function frame(ts) {
    if (closed) return;
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; T += dt;
    try { update(dt); draw(); } catch (e) { console.error(e); }
  }

  function close() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    for (const id of timers) clearTimeout(id); timers.clear(); talkTimers = [];
    clearTimeout(capTimer);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
    root.removeEventListener('contextmenu', ctxMenu);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
    try { ro && ro.disconnect(); } catch (e) { /* ignore */ }
    hookStop();
    for (const k in caches) delete caches[k];
    root.remove(); style.remove();
    if (active === handle) active = null;
    try { prevFocus && prevFocus.focus && prevFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    try { if (typeof opts.onClose === 'function') opts.onClose(); } catch (e) { console.error(e); }
  }
  const handle = { close };
  // test-only peek (non-enumerable): world to screen, state
  Object.defineProperty(handle, '__t', { value: { toScreen: (x, y) => [sx(x), sy(y)], st, ents, items, cam: () => [camX, sc, vw], particles } });

  measure();
  camX = camTarget = HOUSE ? roomCam(0) : clampCam(RWID / 2);
  syncNav();
  try { $('.hm-back').focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  raf = requestAnimationFrame(frame);
  later(() => measure(), 300);
  sfx('whoosh');
  if (HOUSE) later(() => talk(GREET_HOUSE.filter((l) => ent(roleId(l[0])))), 500);
  else { startPeek(true); later(() => talk(GREET_KENNEL.filter((l) => ent(roleId(l[0])))), 500); later(() => { dogs().forEach((d) => { d.wagT = 3; jump(d, 0.4, 20); }); sfx('bark'); }, 300); }
  later(() => { if (hintEl) hintEl.remove(); }, 7500);
  return handle;
}

function open(opts) {
  if (active) { try { active.close(); } catch (e) { /* ignore */ } }
  active = createHome(opts || {});
  return active;
}
window.Home = { open };
})();
