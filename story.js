/* Harper's Space Adventure: "The Story of Our Solar System", told by Leo.
   Exposes window.Story = { open({ onClose, startAt }) }.
   Needs global THREE (r128). Everything is procedural; no network. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Chapters                                                            */
  /* ------------------------------------------------------------------ */
  var ERAS = ['Universe', 'Sun & planets', 'Earth & life', 'People'];
  var CHAPTERS = [
    { title: 'The Big Bang', when: '13.8 billion years ago', era: 0, scene: 'bigbang',
      text: 'Hi Captain Harper, I’m Leo! About 13.8 billion years ago, everything we can see today was packed into a tiny, super-hot space. Then space itself began to stretch and grow, and it is still growing today. Scientists call this beginning the Big Bang.',
      cam: [0, 0, 34], look: [0, 0, 0], bg: 0x06041a, stars: 0, sun: 0 },
    { title: 'The First Stars', when: 'About 13.6 billion years ago', era: 0, scene: 'firststars',
      text: 'At first the universe was dark and full of hydrogen and helium gas. Gravity pulled the gas into clumps, and within a few hundred million years the very first stars lit up. When the biggest ones exploded, they scattered new ingredients like carbon and oxygen into space.',
      cam: [0, 0, 30], look: [0, 0, 0], bg: 0x06041a, stars: 0.2, sun: 0 },
    { title: 'Our Milky Way', when: 'More than 13 billion years ago', era: 0, scene: 'galaxy',
      text: 'Stars gathered into giant star families called galaxies. Our galaxy, the Milky Way, began forming more than 13 billion years ago, and it grew by swallowing smaller galaxies. Today it has hundreds of billions of stars!',
      cam: [0, 17, 25], look: [0, 0, 0], bg: 0x0a0826, stars: 0.6, sun: 0 },
    { title: 'A Giant Cloud', when: 'Just over 4.6 billion years ago', era: 1, scene: 'nebula',
      text: 'Billions of years later, in a quiet corner of the Milky Way, floated a giant cloud of gas and dust called the solar nebula. Some scientists think a nearby exploding star may have given it a push that helped it start to collapse.',
      cam: [0, 0, 30], look: [0, 0, 0], bg: 0x0d0b2e, stars: 1, sun: 0 },
    { title: 'The Sun Switches On', when: 'About 4.6 billion years ago', era: 1, scene: 'sun',
      text: 'Gravity squeezed the cloud tighter and tighter, and its middle got hotter and hotter. When the center got hot enough, hydrogen began fusing into helium, and our Sun switched on! The Sun is a star, just like the ones you see at night.',
      cam: [0, 2, 26], look: [0, 0, 0], bg: 0x0d0b2e, stars: 1, sun: 0 },
    { title: 'A Spinning Disk', when: '4.6 billion years ago', era: 1, scene: 'disk',
      text: 'Leftover gas and dust flattened into a huge spinning disk around the baby Sun. Tiny grains of dust stuck together into pebbles, then boulders, then chunks as big as mountains or bigger, called planetesimals.',
      cam: [0, 14, 23], look: [0, 0, 0], bg: 0x0d0b2e, stars: 1, sun: 1.3 },
    { title: 'The Planets Form', when: '4.6 to 4.5 billion years ago', era: 1, scene: 'planets',
      text: 'The chunks crashed together and grew into planets. Near the hot Sun, small rocky planets formed, like Earth and Mars. Farther out, where it was cold enough for ice, giant planets grew, and scientists think Jupiter was probably the first planet to form.',
      cam: [0, 21, 29], look: [0, -1, 0], bg: 0x0d0b2e, stars: 1, sun: 1.4 },
    { title: 'The Moon Is Born', when: 'About 4.5 billion years ago', era: 1, scene: 'theia',
      text: 'Most scientists think a Mars-sized world, nicknamed Theia, crashed into the young, red-hot Earth. Melted rock splashed into a ring around Earth, and the ring clumped together to make our Moon!',
      cam: [0, 3.5, 17], look: [0, 0, 0], bg: 0x0d0b2e, stars: 1, sun: 0 },
    { title: 'Space Rocks and Rain', when: '4.5 to 4 billion years ago', era: 2, scene: 'rocks',
      text: 'For hundreds of millions of years, space rocks kept crashing into Earth, and comets and asteroids may have brought some of its water. Slowly Earth cooled, steam in the air turned to rain, and the rain filled the first oceans. Tiny crystals hint that there may have been water as early as 4.4 billion years ago.',
      cam: [0, 1, 13], look: [0, 0, 0], bg: 0x0d0b2e, stars: 1, sun: 0 },
    { title: 'Life Begins', when: 'At least 3.5 billion years ago', era: 2, scene: 'life',
      text: 'Then something amazing happened in the oceans: life began! The first living things were simple cells, far too tiny to see without a microscope. Scientists have found signs of life at least 3.5 billion years old, and it may have started even earlier.',
      cam: [0, -1, 16], look: [0, -1.5, 0], bg: 0x0a2a5e, stars: 0, sun: 0 },
    { title: 'Oxygen and Sea Creatures', when: '2.4 billion to 540 million years ago', era: 2, scene: 'oxygen',
      text: 'Tiny ocean microbes learned to use sunlight to make food, and they gave off oxygen. By about 2.4 billion years ago, oxygen was building up in the air. Much later, around 540 million years ago, sea creatures with shells, eyes and legs appeared in a burst of new life!',
      cam: [0, -2.5, 16], look: [0, -3, 0], bg: 0x145c8a, stars: 0, sun: 0 },
    { title: 'The Age of Dinosaurs', when: '230 to 66 million years ago', era: 2, scene: 'dinos',
      text: 'Dinosaurs first appeared about 230 million years ago and ruled the land for more than 160 million years. Then, 66 million years ago, a giant asteroid hit Earth and changed the climate, and most dinosaurs died out. But one group survived, and their descendants are today’s birds!',
      cam: [0, 1, 16], look: [0, 1, 0], bg: 0x7fd0ff, stars: 0, sun: 0 },
    { title: 'The First People', when: 'About 300,000 years ago', era: 3, scene: 'humans',
      text: 'About 300,000 years ago, people like us, called Homo sapiens, appeared in Africa. They sat around campfires, told stories and gazed up at the stars. Long ago, people used the Moon and stars as calendars and to find their way.',
      cam: [0, 1, 16], look: [0, 1, 0], bg: 0x0a0830, stars: 0, sun: 0 },
    { title: 'Footprints on the Moon', when: '1969', era: 3, scene: 'moon',
      text: 'On July 20, 1969, astronauts Neil Armstrong and Buzz Aldrin landed on the Moon in Apollo 11, while Michael Collins orbited above. Neil was the first person ever to walk on the Moon. So far, twelve astronauts have walked there!',
      cam: [0, 1.2, 12], look: [0, 1, 0], bg: 0x05041a, stars: 1, sun: 0 },
    { title: 'Today\u2019s Explorers', when: 'Today', era: 3, scene: 'today',
      text: 'Today, rovers explore Mars, the James Webb Space Telescope spots galaxies from long ago, and New Horizons flew past Pluto in 2015. And now Captain Harper is exploring too! Our Sun should keep shining for about another 5 billion years, so there is plenty of time for adventures.',
      cam: [0, 15, 30], look: [0, -1, 0], bg: 0x0d0b2e, stars: 1, sun: 1.4 }
  ];

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                       */
  /* ------------------------------------------------------------------ */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
  function easeOut(x) { x = clamp01(x); return 1 - Math.pow(1 - x, 3); }
  function backOut(x) { x = clamp01(x); var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function wrapPi(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  var TMPC = null;
  function setCol(arr, i, hex, mul) {
    TMPC.setHex(hex); var m = mul == null ? 1 : mul;
    arr[i * 3] = TMPC.r * m; arr[i * 3 + 1] = TMPC.g * m; arr[i * 3 + 2] = TMPC.b * m;
  }
  function canvasTex(w, h, paint) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'); paint(x, w, h);
    var t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
  }
  function circle(x, cx, cy, r) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); }
  function ell(x, cx, cy, rx, ry, rot) { x.beginPath(); x.ellipse(cx, cy, rx, ry, rot || 0, 0, Math.PI * 2); }
  function rrect(x, X, Y, w, h, r) {
    x.beginPath(); x.moveTo(X + r, Y); x.lineTo(X + w - r, Y); x.quadraticCurveTo(X + w, Y, X + w, Y + r);
    x.lineTo(X + w, Y + h - r); x.quadraticCurveTo(X + w, Y + h, X + w - r, Y + h); x.lineTo(X + r, Y + h);
    x.quadraticCurveTo(X, Y + h, X, Y + h - r); x.lineTo(X, Y + r); x.quadraticCurveTo(X, Y, X + r, Y); x.closePath();
  }

  /* ---------- planet textures ---------- */
  function blobs(x, w, h, color, n, rmin, rmax, alpha, squash) {
    x.fillStyle = color; x.globalAlpha = alpha == null ? 1 : alpha;
    for (var i = 0; i < n; i++) {
      var cx = Math.random() * w, cy = h * 0.12 + Math.random() * h * 0.76, r = rnd(rmin, rmax), ry = r * (squash || 0.7);
      for (var k = -1; k <= 1; k++) { ell(x, cx + k * w, cy, r, ry, rnd(-0.4, 0.4)); x.fill(); }
    }
    x.globalAlpha = 1;
  }
  function craters(x, w, h, n, dark, light, rmax) {
    for (var i = 0; i < n; i++) {
      var cx = Math.random() * w, cy = h * 0.1 + Math.random() * h * 0.8, r = rnd(2, rmax);
      x.fillStyle = dark; circle(x, cx, cy, r); x.fill();
      x.strokeStyle = light; x.lineWidth = Math.max(1, r * 0.25); circle(x, cx + r * 0.1, cy + r * 0.1, r); x.stroke();
    }
  }
  function bands(colors, spot) {
    return canvasTex(256, 128, function (x, w, h) {
      for (var y = 0; y < h; y++) {
        var f = y / h * colors.length + Math.sin(y * 0.35) * 0.35 + Math.sin(y * 0.09) * 0.5;
        x.fillStyle = colors[((Math.floor(f) % colors.length) + colors.length) % colors.length];
        x.fillRect(0, y, w, 1);
      }
      x.globalAlpha = 0.25; x.fillStyle = '#ffffff';
      for (var i = 0; i < 18; i++) { ell(x, Math.random() * w, Math.random() * h, rnd(6, 22), rnd(1.5, 3)); x.fill(); }
      x.globalAlpha = 1;
      if (spot) { x.fillStyle = spot; ell(x, w * 0.62, h * 0.66, 14, 8); x.fill(); x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 2; x.stroke(); }
    });
  }
  var PAINT = {
    earthToday: function () {
      return canvasTex(256, 128, function (x, w, h) {
        x.fillStyle = '#2f8fe0'; x.fillRect(0, 0, w, h);
        var centers = [[40, 50], [70, 80], [140, 45], [150, 85], [205, 60], [225, 95]];
        centers.forEach(function (c) {
          for (var i = 0; i < 9; i++) {
            x.fillStyle = Math.random() < 0.7 ? '#5cc46a' : '#c9a36a';
            ell(x, c[0] + gauss() * 10, c[1] + gauss() * 7, rnd(6, 13), rnd(4, 9)); x.fill();
          }
        });
        x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, 9); x.fillRect(0, h - 9, w, 9);
        for (var i = 0; i < 30; i++) { ell(x, Math.random() * w, 9, rnd(4, 9), rnd(2, 5)); x.fill(); ell(x, Math.random() * w, h - 9, rnd(4, 9), rnd(2, 5)); x.fill(); }
      });
    },
    earthLava: function () {
      return canvasTex(256, 128, function (x, w, h) {
        x.fillStyle = '#8a2414'; x.fillRect(0, 0, w, h);
        blobs(x, w, h, '#3d1610', 26, 6, 18, 0.9);
        blobs(x, w, h, '#ff7a2a', 40, 2, 7, 0.95);
        blobs(x, w, h, '#ffd166', 30, 1, 3, 1);
        x.strokeStyle = '#ff9a3a'; x.lineWidth = 1.5;
        for (var i = 0; i < 26; i++) {
          x.beginPath(); var px = Math.random() * w, py = Math.random() * h; x.moveTo(px, py);
          for (var k = 0; k < 4; k++) { px += rnd(-14, 14); py += rnd(-8, 8); x.lineTo(px, py); }
          x.stroke();
        }
      });
    },
    earthOcean: function () {
      return canvasTex(256, 128, function (x, w, h) {
        x.fillStyle = '#2a6fd0'; x.fillRect(0, 0, w, h);
        blobs(x, w, h, '#3b8ae6', 30, 8, 22, 0.5);
        blobs(x, w, h, '#8a6a4a', 9, 2, 5, 1);
        blobs(x, w, h, '#a8865c', 6, 1.5, 3, 1);
      });
    },
    clouds: function () {
      return canvasTex(256, 128, function (x, w, h) {
        x.clearRect(0, 0, w, h);
        blobs(x, w, h, '#ffffff', 60, 4, 14, 0.55, 0.35);
      });
    },
    moon: function () {
      return canvasTex(256, 128, function (x, w, h) {
        x.fillStyle = '#c4c1cf'; x.fillRect(0, 0, w, h);
        blobs(x, w, h, '#9a96aa', 10, 10, 24, 0.8);
        craters(x, w, h, 40, '#aaa6b8', '#dedbe8', 6);
      });
    },
    mercury: function () { return canvasTex(256, 128, function (x, w, h) { x.fillStyle = '#b3a9ad'; x.fillRect(0, 0, w, h); blobs(x, w, h, '#968c92', 12, 6, 16, 0.7); craters(x, w, h, 40, '#9a9096', '#d5cdd0', 6); }); },
    venus: function () { return canvasTex(256, 128, function (x, w, h) { x.fillStyle = '#f2d39a'; x.fillRect(0, 0, w, h); blobs(x, w, h, '#e6bd78', 30, 10, 30, 0.6, 0.25); blobs(x, w, h, '#fff0c8', 20, 8, 20, 0.5, 0.2); }); },
    mars: function () { return canvasTex(256, 128, function (x, w, h) { x.fillStyle = '#e0704a'; x.fillRect(0, 0, w, h); blobs(x, w, h, '#b44f2e', 16, 6, 18, 0.8); x.fillStyle = '#fff'; x.fillRect(0, 0, w, 7); x.fillRect(0, h - 6, w, 6); }); },
    jupiter: function () { return bands(['#f3d9b1', '#d9a46a', '#f7e7cf', '#c98a55', '#f0d2a6', '#e2b688'], '#d1603d'); },
    saturn: function () { return bands(['#f5e2b0', '#e8cd8e', '#f8ecc8', '#dcc07c']); },
    uranus: function () { return bands(['#a6eef0', '#97e2e8', '#b4f2f2']); },
    neptune: function () { return bands(['#4d7cf2', '#3d68dc', '#5a8af6'], '#26389a'); },
    pluto: function () { return canvasTex(128, 64, function (x, w, h) { x.fillStyle = '#d9b48f'; x.fillRect(0, 0, w, h); blobs(x, w, h, '#f3e3cf', 4, 6, 12, 1); blobs(x, w, h, '#9a6e4f', 6, 4, 10, 0.8); }); },
    theia: function () { return canvasTex(256, 128, function (x, w, h) { x.fillStyle = '#9b7f6a'; x.fillRect(0, 0, w, h); blobs(x, w, h, '#7a5f50', 18, 6, 18, 0.8); craters(x, w, h, 30, '#86705f', '#c2a993', 5); }); },
    sun: function () {
      return canvasTex(256, 128, function (x, w, h) {
        x.fillStyle = '#ffc93c'; x.fillRect(0, 0, w, h);
        blobs(x, w, h, '#ffe27a', 60, 3, 10, 0.8);
        blobs(x, w, h, '#ff9f2e', 50, 2, 8, 0.6);
      });
    }
  };

  /* ------------------------------------------------------------------ */
  /* Leo avatar (2D canvas)                                              */
  /* ------------------------------------------------------------------ */
  function drawLeo(c, open) {
    var x = c.getContext('2d'), s = c.width;
    x.clearRect(0, 0, s, s); x.save(); x.scale(s / 100, s / 100);
    x.fillStyle = '#ff7a45'; rrect(x, 2, 44, 10, 20, 4); x.fill(); rrect(x, 88, 44, 10, 20, 4); x.fill();
    x.strokeStyle = '#9d95d6'; x.lineWidth = 3; x.beginPath(); x.moveTo(70, 14); x.lineTo(79, 4); x.stroke();
    x.fillStyle = '#ffd166'; circle(x, 79, 5, 4.5); x.fill();
    x.fillStyle = '#f6f3ff'; circle(x, 50, 52, 43); x.fill(); x.strokeStyle = '#a49cdc'; x.lineWidth = 3; x.stroke();
    x.fillStyle = '#2b2470'; ell(x, 50, 56, 34, 30); x.fill();
    x.save(); ell(x, 50, 56, 34, 30); x.clip();
    x.fillStyle = '#e9a77c'; circle(x, 50, 62, 23); x.fill();
    x.fillStyle = '#5a3a22'; ell(x, 50, 43, 23, 11); x.fill(); ell(x, 38, 44, 9, 7, -0.5); x.fill();
    x.fillStyle = '#2a1a3a'; circle(x, 41, 59, 3.4); x.fill(); circle(x, 59, 59, 3.4); x.fill();
    x.fillStyle = '#fff'; circle(x, 42.2, 57.8, 1.2); x.fill(); circle(x, 60.2, 57.8, 1.2); x.fill();
    x.fillStyle = 'rgba(255,111,168,.55)'; circle(x, 35, 67, 4.2); x.fill(); circle(x, 65, 67, 4.2); x.fill();
    if (open) { x.fillStyle = '#8a2a3a'; ell(x, 50, 70, 6, 4.8); x.fill(); x.fillStyle = '#ff8fa8'; ell(x, 50, 72.5, 3.5, 1.8); x.fill(); }
    else { x.strokeStyle = '#5a2030'; x.lineWidth = 2.6; x.lineCap = 'round'; x.beginPath(); x.arc(50, 64, 8, 0.2 * Math.PI, 0.8 * Math.PI); x.stroke(); }
    x.restore();
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.arc(50, 56, 28, 1.15 * Math.PI, 1.42 * Math.PI); x.stroke();
    x.restore();
  }

  /* ------------------------------------------------------------------ */
  /* Speech                                                              */
  /* ------------------------------------------------------------------ */
  var cachedVoice = null;
  function leoVoice() {
    try {
      if (cachedVoice) return cachedVoice;
      var v = window.speechSynthesis.getVoices() || [];
      var en = v.filter(function (a) { return /^en/i.test(a.lang); });
      cachedVoice = en.find(function (a) { return /daniel|arthur|alex|aaron|fred|male|oliver|james|rishi|tom/i.test(a.name) && !/female/i.test(a.name); }) ||
        en.find(function (a) { return /en-GB/i.test(a.lang); }) || en[0] || null;
      return cachedVoice;
    } catch (e) { return null; }
  }
  function fillName(t) { try { var H = window.GameHooks; return H && H.fill ? H.fill(t) : t; } catch (e) { return t; } }
  function speakLeo(text) {
    var H = window.GameHooks;
    if (H && typeof H.speak === 'function') {
      try { return Promise.resolve(H.speak(text, 'leo')).catch(function () {}); } catch (e) { return Promise.resolve(); }
    }
    if (!('speechSynthesis' in window)) return Promise.resolve();
    return new Promise(function (res) {
      var done = false, to = null;
      function fin() { if (!done) { done = true; clearTimeout(to); res(); } }
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text); var vo = leoVoice(); if (vo) u.voice = vo;
        u.rate = 0.95; u.pitch = 1; u.onend = fin; u.onerror = fin;
        to = setTimeout(fin, 4000 + text.split(/\s+/).length * 600);
        window.speechSynthesis.speak(u);
      } catch (e) { fin(); }
    });
  }
  function stopSpeaking() {
    var H = window.GameHooks;
    if (H && typeof H.stopSpeaking === 'function') { try { H.stopSpeaking(); } catch (e) {} return; }
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) {}
  }
  function sfx(n) { try { var H = window.GameHooks; if (H && typeof H.sfx === 'function') H.sfx(n); } catch (e) {} }

  /* ------------------------------------------------------------------ */
  /* CSS                                                                 */
  /* ------------------------------------------------------------------ */
  var CSS = [
    '.st-root{position:fixed;inset:0;z-index:2000;background:var(--space,#0d0b2e);color:var(--ink,#fdf8ff);font-family:var(--body,"Atkinson Hyperlegible",Verdana,system-ui,sans-serif);overflow:hidden;touch-action:manipulation;overscroll-behavior:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;animation:st-in .35s ease-out}',
    '@keyframes st-in{from{opacity:0}}',
    '.st-root *{box-sizing:border-box}',
    ':where(.st-root) :where(button){font:inherit;color:inherit;cursor:pointer;border:0;background:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
    '.st-root button:focus-visible{outline:3px solid var(--gold,#ffd166);outline-offset:3px}',
    '.st-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}',
    '.st-ui{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none;padding:calc(env(safe-area-inset-top,0px) + 14px) calc(env(safe-area-inset-right,0px) + 16px) calc(env(safe-area-inset-bottom,0px) + 10px) calc(env(safe-area-inset-left,0px) + 16px)}',
    '.st-ui > *{pointer-events:none}',
    '.st-ui button{pointer-events:auto}',
    '.st-top{display:flex;justify-content:space-between;align-items:center;gap:8px}',
    '.st-pill{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:8px 16px;border-radius:999px;background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));font-weight:700;font-size:16px;white-space:nowrap}',
    '.st-pill:active{transform:scale(.96)}',
    '.st-pill svg{width:22px;height:22px;flex:none}',
    '.st-toggles{display:flex;gap:8px}',
    '.st-tog[aria-pressed="true"]{background:var(--teal,#5fe0c8);color:#0d2a26;border-color:transparent}',
    '.st-tog .st-off{display:none}.st-tog[aria-pressed="false"] .st-on{display:none}.st-tog[aria-pressed="false"] .st-off{display:inline}',
    '.st-head{margin-top:10px;max-width:min(560px,100%);text-shadow:0 2px 0 rgba(13,11,46,.55),0 0 16px rgba(13,11,46,.75)}',
    '.st-kicker{display:inline-block;padding:2px 10px;border-radius:999px;background:var(--panel,rgba(30,25,84,.88));text-shadow:none;font-size:15px;font-weight:700;color:var(--ink-soft,#c9c3f0);letter-spacing:.06em;text-transform:uppercase}',
    '.st-when{font-family:var(--display,"Baloo 2",system-ui,sans-serif);font-weight:800;color:var(--gold,#ffd166);font-size:clamp(30px,5.4vw,58px);line-height:1;margin-top:2px;text-wrap:balance}',
    '.st-title{font-family:var(--display,"Baloo 2",system-ui,sans-serif);font-weight:800;font-size:clamp(24px,3.4vw,36px);line-height:1.05;margin:4px 0 0;text-wrap:balance}',
    '.st-fade{animation:st-fade .5s ease-out}',
    '@keyframes st-fade{from{opacity:0;transform:translateY(8px)}}',
    '.st-bottom{width:min(880px,100%);margin:0 auto;display:flex;flex-direction:column;gap:8px}',
    '.st-panel{pointer-events:auto;display:flex;gap:14px;align-items:flex-start;background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));border-radius:24px;padding:14px 18px 14px 14px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);max-height:42vh;overflow-y:auto;-webkit-overflow-scrolling:touch;-webkit-user-select:text;user-select:text}',
    '.st-leo{flex:none;display:flex;flex-direction:column;align-items:center;gap:2px}',
    '.st-leo canvas{width:72px;height:72px;display:block;transform-origin:50% 80%}',
    '.st-leo span{font-family:var(--display,"Baloo 2",system-ui,sans-serif);font-weight:800;font-size:16px;color:var(--rocket,#ff7a45);line-height:1}',
    '.st-root.st-talking .st-leo canvas{animation:st-bob .5s ease-in-out infinite alternate}',
    '@keyframes st-bob{to{transform:translateY(-3px) rotate(-2deg)}}',
    '.st-textwrap{flex:1;min-width:0}',
    '.st-text{margin:0;font-size:21px;line-height:1.45}',
    '.st-end{pointer-events:none;text-align:center;text-shadow:0 2px 0 rgba(13,11,46,.6),0 0 14px rgba(13,11,46,.8);font-family:var(--display,"Baloo 2",system-ui,sans-serif);font-weight:800;font-size:30px;color:var(--pink,#ff6fa8);line-height:1}',
    '.st-end[hidden]{display:none}',
    '.st-nav{display:flex;gap:10px}',
    '.st-btn{flex:1 1 0;min-height:56px;border-radius:18px;font-family:var(--display,"Baloo 2",system-ui,sans-serif);font-weight:800;font-size:22px;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--panel-solid,#1e1954);border:2px solid var(--line,rgba(255,255,255,.16))}',
    '.st-btn svg{width:24px;height:24px}',
    '.st-btn:disabled{opacity:.4;cursor:default}',
    '.st-btn:not(:disabled):active{transform:translateY(3px)}',
    '.st-next{color:#2a0f05;border-color:transparent;background:linear-gradient(180deg,#ffb084,var(--rocket,#ff7a45));box-shadow:0 5px 0 var(--rocket-deep,#d9532a)}',
    '.st-next:not(:disabled):active{box-shadow:0 2px 0 var(--rocket-deep,#d9532a)}',
    '.st-next.st-finish{background:linear-gradient(180deg,#9ff3e3,var(--teal,#5fe0c8));box-shadow:0 5px 0 #2fae98;color:#0d2a26}',
    '.st-tl{pointer-events:auto;background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));border-radius:18px;padding:6px 10px 2px}',
    '.st-eras{display:flex;font-size:12px;font-weight:700;color:var(--ink-soft,#c9c3f0);letter-spacing:.04em;text-transform:uppercase}',
    '.st-eras span{text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-left:2px solid var(--line,rgba(255,255,255,.16));padding:0 2px}',
    '.st-eras span:first-child{border-left:0}',
    '.st-eras span.st-era-on{color:var(--gold,#ffd166)}',
    '.st-track{position:relative;display:flex;height:40px}',
    '.st-rail{position:absolute;left:0;right:0;top:50%;height:6px;margin-top:-3px;border-radius:3px;background:rgba(255,255,255,.12)}',
    '.st-fill{position:absolute;left:0;top:50%;height:6px;margin-top:-3px;border-radius:3px;background:linear-gradient(90deg,var(--pink,#ff6fa8),var(--gold,#ffd166));transition:width .5s ease}',
    '.st-dot{position:relative;flex:1 1 0;height:40px;min-width:0}',
    '.st-dot::before{content:"";position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#3a3480;border:2px solid rgba(255,255,255,.35);transition:transform .25s}',
    '.st-dot.st-past::before{background:var(--teal,#5fe0c8);border-color:transparent}',
    '.st-dot.st-cur::before{background:var(--gold,#ffd166);border-color:#fff;transform:scale(1.6);box-shadow:0 0 12px var(--gold,#ffd166)}',
    '.st-toast{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 74px);transform:translateX(-50%);background:#fff;color:#231a4f;font-weight:700;font-size:17px;padding:10px 16px;border-radius:16px;box-shadow:0 6px 18px rgba(0,0,0,.35);pointer-events:none;opacity:0;transition:opacity .25s;white-space:nowrap}',
    '.st-toast.st-show{opacity:1}',
    '.st-prize{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(10,6,40,.62);z-index:20;padding:16px;animation:st-pz-in .4s ease-out}',
    '.st-prize[hidden]{display:none}',
    '.st-prize-card{max-width:440px;width:100%;box-sizing:border-box;text-align:center;background:linear-gradient(160deg,#3a1f8a,#1c1250);border:3px solid var(--gold,#ffd166);border-radius:28px;padding:22px 20px 20px;color:#fff;box-shadow:0 0 60px rgba(255,209,102,.45)}',
    '.st-prize-big{font-size:64px;line-height:1;margin-bottom:6px;animation:st-pz-spin 3s ease-in-out infinite}',
    '.st-prize-card h3{margin:0 0 6px;font-family:var(--display,system-ui);font-size:28px;color:var(--gold,#ffd166)}',
    '.st-prize-card p{margin:6px 0;font-size:19px;line-height:1.35}',
    '.st-prize-stars{font-family:var(--display,system-ui);font-weight:800;font-size:40px;color:var(--gold,#ffd166)}',
    '.st-prize-card button{margin-top:12px;min-height:56px;padding:10px 30px;border:0;border-radius:999px;background:linear-gradient(180deg,#9ff3e3,var(--teal,#5fe0c8));color:#0d2a26;font-weight:800;font-size:20px;cursor:pointer}',
    '@keyframes st-pz-in{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}',
    '@keyframes st-pz-spin{0%,100%{transform:rotate(-8deg) scale(1)}50%{transform:rotate(8deg) scale(1.12)}}',
    '@media (max-width:620px){.st-tog .st-lbl{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.st-tog{width:52px;padding:0;justify-content:center}.st-text{font-size:20px;line-height:1.4}.st-leo canvas{width:56px;height:56px}.st-leo span{font-size:14px}.st-panel{padding:12px 14px 12px 10px;gap:10px}.st-kicker{font-size:13px}.st-eras{font-size:11px}}',
    '@media (max-height:560px){.st-panel{max-height:34vh}.st-when{font-size:30px}.st-title{font-size:22px}.st-text{font-size:20px}}'
  ].join('\n');

  var ICON = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c3 2.5 4.5 6 4.5 10l-1.5 5h-6L7.5 12C7.5 8 9 4.5 12 2z"/><circle cx="12" cy="9.5" r="1.8"/><path d="M7.8 13.5L5 17l3.5.5M16.2 13.5L19 17l-3.5.5M10.5 19.5l1.5 2.5 1.5-2.5"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path class="st-on" d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/><path class="st-off" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path class="st-off" d="M7 4.5v15l12.5-7.5z"/><g class="st-on"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></g></svg>'
  };

  /* ------------------------------------------------------------------ */
  /* Scene builders. Each returns { group, update(t, dt) }               */
  /* ------------------------------------------------------------------ */

  function mkPoints(S, N, size, additive, opacity) {
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var mat = new THREE.PointsMaterial({ size: size, map: S.dotTex, vertexColors: true, transparent: true,
      opacity: opacity == null ? 1 : opacity, depthWrite: false,
      blending: additive === false ? THREE.NormalBlending : THREE.AdditiveBlending });
    var obj = new THREE.Points(geo, mat); obj.frustumCulled = false;
    return { obj: obj, pos: pos, col: col, geo: geo, mat: mat,
      dirty: function (c) { geo.attributes.position.needsUpdate = true; if (c) geo.attributes.color.needsUpdate = true; } };
  }
  function glow(S, color, scale, opacity, normal) {
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: S.glowTex, color: color, transparent: true, opacity: opacity == null ? 1 : opacity,
      depthWrite: false, blending: normal ? THREE.NormalBlending : THREE.AdditiveBlending }));
    s.scale.set(scale, scale, 1); return s;
  }
  function texSprite(tex, w, h, opts) {
    opts = opts || {};
    var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: opts.depthWrite === true, opacity: opts.opacity == null ? 1 : opts.opacity,
      blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending, color: opts.color == null ? 0xffffff : opts.color }));
    s.scale.set(w, h, 1); return s;
  }
  function texPlane(tex, w, h, opts) {
    opts = opts || {};
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: opts.depthWrite !== false,
      blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending, opacity: opts.opacity == null ? 1 : opts.opacity, side: THREE.DoubleSide }));
    return m;
  }
  function gradientTex(stops) {
    return canvasTex(4, 256, function (x, w, h) {
      var g = x.createLinearGradient(0, 0, 0, h);
      stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    });
  }
  function backdrop(stops, z, w, h, y) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: gradientTex(stops), depthWrite: false }));
    m.position.set(0, y || 0, z); m.renderOrder = -10; return m;
  }
  function planet(radius, tex, opts) {
    opts = opts || {};
    var mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
    if (opts.emissive) { mat.emissive = new THREE.Color(0xffffff); mat.emissiveMap = tex; mat.emissiveIntensity = opts.emissive; }
    return new THREE.Mesh(new THREE.SphereGeometry(radius, 36, 24), mat);
  }
  function makeSun(S, r) {
    var g = new THREE.Group();
    var m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 24), new THREE.MeshBasicMaterial({ map: PAINT.sun() }));
    var corona = glow(S, 0xffb43a, r * 5.5, 0.9);
    var rays = new THREE.Sprite(new THREE.SpriteMaterial({ map: S.raysTex, color: 0xffd166, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    rays.scale.set(r * 8, r * 8, 1);
    g.add(corona, rays, m);
    g.userData.tick = function (t) {
      m.rotation.y = t * 0.12; rays.material.rotation = t * 0.07;
      var p = 1 + 0.05 * Math.sin(t * 2.2); corona.scale.set(r * 5.5 * p, r * 5.5 * p, 1);
    };
    return g;
  }
  function orbitLine(r, opacity, color, tiltX, squash) {
    var pts = [], n = 128;
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r * (squash || 1))); }
    var geo = new THREE.BufferGeometry().setFromPoints(pts);
    var l = new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: color || 0xffffff, transparent: true, opacity: opacity }));
    if (tiltX) l.rotation.x = tiltX;
    return l;
  }

  /* ---------- 0. Big Bang ---------- */
  function bBigBang(S) {
    var g = new THREE.Group(), N = 2800, P = mkPoints(S, N, 0.9);
    var dir = new Float32Array(N * 3), spd = new Float32Array(N), ph = new Float32Array(N);
    var pal = [0xffffff, 0xffd166, 0xff7a45, 0xff6fa8, 0x5fe0c8, 0xb9a6ff, 0xffe3c2];
    for (var i = 0; i < N; i++) {
      var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      dir[i * 3] = s * Math.cos(th); dir[i * 3 + 1] = u; dir[i * 3 + 2] = s * Math.sin(th);
      spd[i] = 0.25 + Math.pow(Math.random(), 0.6) * 0.9; ph[i] = Math.random() * 6.28;
      setCol(P.col, i, pick(pal), 0.75);
    }
    P.dirty(true); g.add(P.obj);
    var warm = glow(S, 0xffb070, 1, 0.6), flash = glow(S, 0xffffff, 0.1, 1), ring = glow(S, 0xff6fa8, 1, 0.3);
    g.add(ring, warm, flash);
    return { group: g, update: function (t) {
      var e = 24 * (1 - Math.exp(-t * 0.5)) + t * 0.2;
      for (var i = 0; i < N; i++) {
        var r = spd[i] * e + Math.sin(t * 0.8 + ph[i]) * 0.15;
        P.pos[i * 3] = dir[i * 3] * r; P.pos[i * 3 + 1] = dir[i * 3 + 1] * r; P.pos[i * 3 + 2] = dir[i * 3 + 2] * r;
      }
      P.dirty();
      P.mat.size = 0.3 + 0.9 * Math.exp(-t * 0.35);
      var fs = t < 0.3 ? 2 + t / 0.3 * 40 : 42 + (t - 0.3) * 10;
      flash.scale.set(fs, fs, 1); flash.material.userData.base = t < 0.3 ? 1 : Math.exp(-(t - 0.3) * 1.8);
      var ws = 6 + e * 0.9; warm.scale.set(ws, ws, 1); warm.material.userData.base = 0.15 + 0.6 * Math.exp(-t * 0.3);
      var rs = 10 + e * 1.6; ring.scale.set(rs, rs, 1); ring.material.userData.base = 0.12 + 0.25 * Math.exp(-t * 0.4);
      g.rotation.y = t * 0.05; g.rotation.x = Math.sin(t * 0.1) * 0.15;
    } };
  }

  /* ---------- 1. First stars ---------- */
  function bFirstStars(S) {
    var g = new THREE.Group(), centers = [];
    for (var c = 0; c < 6; c++) centers.push(new THREE.Vector3(rnd(-15, 15), rnd(-8, 8), rnd(-6, 4)));
    centers.forEach(function (c) { var gas = glow(S, pick([0x7a5cff, 0x5a4fd0, 0xb06fd8]), rnd(10, 16), 0.22); gas.position.copy(c); g.add(gas); });
    var dust = mkPoints(S, 900, 0.35, true, 0);
    for (var i = 0; i < 900; i++) {
      var cc = pick(centers);
      dust.pos[i * 3] = cc.x + gauss() * 4; dust.pos[i * 3 + 1] = cc.y + gauss() * 3; dust.pos[i * 3 + 2] = cc.z + gauss() * 3;
      setCol(dust.col, i, pick([0x8f86ff, 0xc9c3f0, 0xff9fd0]), 0.8);
    }
    dust.dirty(true); g.add(dust.obj);
    var stars = [], NS = 64;
    for (i = 0; i < NS; i++) {
      var c2 = centers[i % centers.length];
      var s = glow(S, pick([0xbfd8ff, 0xffffff, 0x9fc4ff, 0xd8e6ff]), 1, 1);
      s.position.set(c2.x + gauss() * 2.6, c2.y + gauss() * 2, c2.z + gauss() * 2);
      s.userData = { born: 0.4 + Math.random() * 7, size: rnd(1.2, 3.2), ph: Math.random() * 6.28 };
      stars.push(s); g.add(s);
    }
    var burst = glow(S, 0xff6fa8, 1, 0), burst2 = glow(S, 0x5fe0c8, 1, 0); g.add(burst, burst2);
    var lastB = -1, bStar = null;
    return { group: g, update: function (t) {
      dust.mat.userData.base = Math.min(1, t / 6) * 0.7;
      stars.forEach(function (s) {
        var d = s.userData, age = t - d.born;
        var k = age < 0 ? 0 : backOut(age / 0.7), tw = 1 + 0.18 * Math.sin(t * 3 + d.ph);
        if (s === bStar) k *= 0.35;
        var sc = Math.max(0.001, d.size * k * tw); s.scale.set(sc, sc, 1);
      });
      if (t > 8) {
        var cyc = Math.floor((t - 8) / 4.5), ct = (t - 8) - cyc * 4.5;
        if (cyc !== lastB) { lastB = cyc; bStar = pick(stars); burst.position.copy(bStar.position); burst2.position.copy(bStar.position); }
        var bs = 1 + ct * 5; burst.scale.set(bs, bs, 1); burst.material.userData.base = ct < 0.2 ? ct * 5 : Math.max(0, 1 - (ct - 0.2) / 3);
        var b2 = 0.5 + ct * 3.5; burst2.scale.set(b2, b2, 1); burst2.material.userData.base = burst.material.userData.base * 0.7;
      }
      g.rotation.y = Math.sin(t * 0.06) * 0.25;
    } };
  }

  /* ---------- 2. Galaxy ---------- */
  function bGalaxy(S) {
    var g = new THREE.Group(), N = 7000, P = mkPoints(S, N, 0.35);
    var start = new Float32Array(N * 3), target = new Float32Array(N * 3), delay = new Float32Array(N);
    var clumps = [];
    for (var c = 0; c < 10; c++) { var a = Math.random() * Math.PI * 2, r = rnd(14, 24); clumps.push([Math.cos(a) * r, rnd(-5, 5), Math.sin(a) * r, Math.random() * 2.5]); }
    for (var i = 0; i < N; i++) {
      var tx, ty, tz, col;
      if (i < N * 0.2) {
        tx = gauss() * 1.4; ty = gauss() * 0.8; tz = gauss() * 1.4; col = pick([0xffe3a0, 0xffd166, 0xfff2d0]);
      } else {
        var rr = 1.5 + Math.pow(Math.random(), 0.85) * 13, arm = i % 2;
        var ang = arm * Math.PI + rr * 0.5 + gauss() * 0.28;
        tx = Math.cos(ang) * rr + gauss() * 0.4; tz = Math.sin(ang) * rr + gauss() * 0.4; ty = gauss() * 0.22 * (1.2 - rr / 16);
        col = Math.random() < 0.12 ? pick([0xff8fc0, 0xff6fa8]) : pick([0xa8c8ff, 0xffffff, 0xc9d8ff, 0x5fe0c8]);
      }
      target[i * 3] = tx; target[i * 3 + 1] = ty; target[i * 3 + 2] = tz;
      var cl = clumps[i % clumps.length];
      start[i * 3] = cl[0] + gauss() * 1.6; start[i * 3 + 1] = cl[1] + gauss() * 1.2; start[i * 3 + 2] = cl[2] + gauss() * 1.6;
      delay[i] = cl[3];
      setCol(P.col, i, col);
    }
    P.dirty(true); g.add(P.obj);
    var core = glow(S, 0xffd166, 1, 0.8), halo = glow(S, 0x8f86ff, 1, 0.25); g.add(halo, core);
    return { group: g, update: function (t) {
      for (var i = 0; i < N; i++) {
        var k = ease((t - delay[i]) / 4.5), o = i * 3;
        P.pos[o] = start[o] + (target[o] - start[o]) * k;
        P.pos[o + 1] = start[o + 1] + (target[o + 1] - start[o + 1]) * k;
        P.pos[o + 2] = start[o + 2] + (target[o + 2] - start[o + 2]) * k;
      }
      P.dirty();
      var ck = ease(t / 6), cs = 3 + ck * 7; core.scale.set(cs, cs, 1); core.material.userData.base = 0.3 + 0.6 * ck;
      halo.scale.set(cs * 3.2, cs * 3.2, 1);
      g.rotation.y = -t * 0.12;
    } };
  }

  /* ---------- 3. Nebula with shockwave ---------- */
  function cloudInit(P, N) {
    var base = new Float32Array(N * 3), pal = [0x8a5a7a, 0xb07a5a, 0x7a5fa8, 0xd9a07a, 0xffb38a, 0xc98ab0];
    var subs = []; for (var s = 0; s < 7; s++) subs.push([gauss() * 4, gauss() * 2.5, gauss() * 2.5]);
    for (var i = 0; i < N; i++) {
      var sc = subs[i % subs.length];
      base[i * 3] = gauss() * 6 + sc[0] * 0.6; base[i * 3 + 1] = gauss() * 3.6 + sc[1] * 0.6; base[i * 3 + 2] = gauss() * 3.6 + sc[2] * 0.6;
      setCol(P.col, i, pick(pal), rnd(0.7, 1.1));
    }
    return base;
  }
  function bNebula(S) {
    var g = new THREE.Group(), N = 3200, P = mkPoints(S, N, 0.75, false, 0.85);
    var base = cloudInit(P, N); P.dirty(true);
    var cloud = new THREE.Group(); cloud.add(P.obj); g.add(cloud);
    for (var i = 0; i < 7; i++) { var d = glow(S, pick([0x3a2a4a, 0x2a2040, 0x4a3050]), rnd(6, 11), 0.55, true); d.position.set(gauss() * 4, gauss() * 2.5, rnd(1, 4)); cloud.add(d); }
    for (i = 0; i < 4; i++) { var pg = glow(S, pick([0xff6fa8, 0xff9a6a]), rnd(10, 16), 0.14); pg.position.set(gauss() * 3, gauss() * 2, -2); cloud.add(pg); }
    var snPos = new THREE.Vector3(-22, 7, -6);
    var sn = glow(S, 0xffffff, 1.6, 1), snFlash = glow(S, 0xffe3c2, 1, 0); sn.position.copy(snPos); snFlash.position.copy(snPos); g.add(sn, snFlash);
    var ringM = new THREE.MeshBasicMaterial({ color: 0x5fe0c8, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.975, 1, 128), ringM); ring.position.copy(snPos); g.add(ring);
    var ring2M = ringM.clone(); ring2M.color.setHex(0xff6fa8);
    var ring2 = new THREE.Mesh(new THREE.RingGeometry(0.93, 0.95, 128), ring2M); ring2.position.copy(snPos); g.add(ring2);
    var dist = new Float32Array(N), ndir = new Float32Array(N * 3);
    for (i = 0; i < N; i++) {
      var dx = base[i * 3] - snPos.x, dy = base[i * 3 + 1] - snPos.y, dz = base[i * 3 + 2] - snPos.z, L = Math.sqrt(dx * dx + dy * dy + dz * dz);
      dist[i] = L; ndir[i * 3] = dx / L; ndir[i * 3 + 1] = dy / L; ndir[i * 3 + 2] = dz / L;
    }
    var CY = 11;
    return { group: g, update: function (t) {
      var ct = t % CY;
      var fl = ct < 1 ? 0 : ct < 1.25 ? (ct - 1) * 4 : Math.max(0, 1 - (ct - 1.25) / 2.5);
      var fs = 2 + fl * 14; snFlash.scale.set(fs, fs, 1); snFlash.material.userData.base = fl;
      sn.material.userData.base = ct < 1 ? 1 : Math.max(0.15, 1 - (ct - 1));
      var R = ct < 1 ? 0 : (ct - 1) * 6.5;
      ring.scale.set(R + 0.01, R + 0.01, 1); ring2.scale.set(R * 0.97 + 0.01, R * 0.97 + 0.01, 1);
      var ro = ct < 1 ? 0 : Math.max(0, 0.6 - (ct - 1) / 12);
      ringM.userData.base = ro; ring2M.userData.base = ro * 0.8;
      var squeeze = 1 - 0.08 * ease((ct - 4.5) / 4);
      for (var i = 0; i < N; i++) {
        var bump = ct > 1 ? 0.9 * Math.exp(-Math.pow(dist[i] - R, 2) / 5) : 0;
        var o = i * 3;
        P.pos[o] = base[o] * squeeze + ndir[o] * bump;
        P.pos[o + 1] = base[o + 1] * squeeze + ndir[o + 1] * bump;
        P.pos[o + 2] = base[o + 2] * squeeze + ndir[o + 2] * bump;
      }
      P.dirty();
      cloud.rotation.y = t * 0.03; cloud.rotation.z = Math.sin(t * 0.1) * 0.05;
    } };
  }

  /* ---------- 4. Sun ignites ---------- */
  function bSun(S) {
    var g = new THREE.Group(), N = 3200, P = mkPoints(S, N, 0.75, true, 0.9);
    var base = cloudInit(P, N), c0 = P.col.slice(), hot = new THREE.Color(0xffb347);
    var spin = new Float32Array(N); for (var i = 0; i < N; i++) spin[i] = rnd(0.6, 1.4);
    g.add(P.obj);
    var core = glow(S, 0xff9a3a, 1, 0.3); g.add(core);
    var sun = makeSun(S, 2.6); sun.scale.setScalar(0.001); g.add(sun);
    var flash = glow(S, 0xffffff, 1, 0); g.add(flash);
    var IG = 5.2;
    return { group: g, update: function (t) {
      var k = ease(t / IG) * 0.93 + 0.07 * ease((t - IG) / 3);
      for (var i = 0; i < N; i++) {
        var o = i * 3, x = base[o], y = base[o + 1], z = base[o + 2];
        var r = Math.sqrt(x * x + z * z), a = Math.atan2(z, x) + k * k * spin[i] * 3.5 / (r * 0.25 + 1) + t * 0.05;
        var sr = r * (1 - k * 0.92), flat = 1 - k * 0.97;
        P.pos[o] = Math.cos(a) * sr; P.pos[o + 1] = y * (1 - k * 0.9) * flat + y * 0.02; P.pos[o + 2] = Math.sin(a) * sr;
        var h = k * k;
        P.col[o] = c0[o] + (hot.r - c0[o]) * h; P.col[o + 1] = c0[o + 1] + (hot.g - c0[o + 1]) * h; P.col[o + 2] = c0[o + 2] + (hot.b - c0[o + 2]) * h;
      }
      P.dirty(true);
      P.mat.userData.base = 0.9 - 0.55 * ease((t - IG) / 3);
      var cs = 1 + k * 9; core.scale.set(cs, cs, 1); core.material.userData.base = 0.2 + 0.7 * k;
      var it = t - IG;
      var fs = it < 0 ? 0.01 : it < 0.3 ? it / 0.3 * 34 : 34 + it * 6; flash.scale.set(fs, fs, 1);
      flash.material.userData.base = it < 0 ? 0 : it < 0.3 ? 1 : Math.exp(-(it - 0.3) * 1.5);
      sun.scale.setScalar(Math.max(0.001, backOut(it / 1.1)));
      sun.userData.tick(t);
      g.rotation.x = 0.25;
    } };
  }

  /* ---------- 5. Spinning disk ---------- */
  function bDisk(S) {
    var g = new THREE.Group(), N = 6500, P = mkPoints(S, N, 0.32, true, 0.85);
    var R = new Float32Array(N), A = new Float32Array(N), Y = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      var r = 2.2 + Math.pow(Math.random(), 1.3) * 11.5;
      R[i] = r; A[i] = Math.random() * Math.PI * 2; Y[i] = gauss() * 0.12 * (0.5 + r / 8);
      var col = r < 5 ? pick([0xffb070, 0xff8a50, 0xffd166]) : r < 9 ? pick([0xc08a5a, 0xa0704a, 0xd9a07a, 0xe8b07a]) : pick([0xbfd8ff, 0x9fb0d0, 0xc9c3f0, 0xd9a07a]);
      setCol(P.col, i, col, rnd(0.55, 1));
    }
    P.dirty(true); g.add(P.obj);
    var sun = makeSun(S, 1.3); g.add(sun);
    var clumps = [];
    for (i = 0; i < 40; i++) {
      var cr = rnd(3, 13.5), icy = cr > 8.5;
      var m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: icy ? pick([0xbcd2ee, 0xa9b8d8]) : pick([0xa9714a, 0x8f6a55, 0xc08a5a]), roughness: 1, flatShading: true }));
      m.userData = { r: cr, a: Math.random() * 6.28, d: Math.random() * 3, s: (icy ? 0.35 : 0.22) * rnd(0.7, 1.4), sp: rnd(0.5, 2) };
      clumps.push(m); g.add(m);
    }
    return { group: g, update: function (t, dt) {
      for (var i = 0; i < N; i++) {
        A[i] += dt * 1.5 * Math.pow(R[i] / 4, -1.5);
        var o = i * 3; P.pos[o] = Math.cos(A[i]) * R[i]; P.pos[o + 1] = Y[i]; P.pos[o + 2] = Math.sin(A[i]) * R[i];
      }
      P.dirty();
      clumps.forEach(function (m) {
        var u = m.userData; u.a += dt * 1.5 * Math.pow(u.r / 4, -1.5);
        m.position.set(Math.cos(u.a) * u.r, 0, Math.sin(u.a) * u.r);
        var s = u.s * (0.25 + 0.75 * easeOut((t - u.d) / 6)) * 1.0; m.scale.setScalar(Math.max(0.01, s));
        m.rotation.x += dt * u.sp; m.rotation.y += dt * u.sp * 0.7;
      });
      sun.userData.tick(t);
    } };
  }

  /* ---------- 6 & 14. Planets ---------- */
  var PL = [
    ['mercury', 3.2, 0.28, 6.2], ['venus', 4.4, 0.44, 5.6], ['earth', 5.8, 0.46, 5.0], ['mars', 7.2, 0.34, 4.3],
    ['jupiter', 10.5, 1.1, 0.6], ['saturn', 13.6, 0.92, 1.6], ['uranus', 16.2, 0.62, 2.6], ['neptune', 18.6, 0.6, 3.3]
  ];
  function rocketTex() {
    return canvasTex(128, 256, function (x) {
      var fg = x.createLinearGradient(0, 196, 0, 250); fg.addColorStop(0, '#fff3b0'); fg.addColorStop(0.4, '#ffd166'); fg.addColorStop(1, 'rgba(255,122,69,0)');
      x.fillStyle = fg; x.beginPath(); x.moveTo(44, 192); x.quadraticCurveTo(64, 270, 84, 192); x.fill();
      x.fillStyle = '#d9532a'; x.beginPath(); x.moveTo(40, 130); x.lineTo(14, 186); x.lineTo(44, 176); x.fill(); x.beginPath(); x.moveTo(88, 130); x.lineTo(114, 186); x.lineTo(84, 176); x.fill();
      x.fillStyle = '#fdf8ff'; x.beginPath(); x.moveTo(64, 14); x.bezierCurveTo(100, 50, 96, 140, 86, 192); x.lineTo(42, 192); x.bezierCurveTo(32, 140, 28, 50, 64, 14); x.fill();
      x.fillStyle = '#ff7a45'; x.beginPath(); x.moveTo(64, 14); x.bezierCurveTo(80, 28, 88, 44, 90, 58); x.lineTo(38, 58); x.bezierCurveTo(40, 44, 48, 28, 64, 14); x.fill();
      x.fillStyle = '#ff7a45'; x.fillRect(42, 176, 44, 16);
      x.fillStyle = '#d9532a'; circle(x, 64, 100, 20); x.fill(); x.fillStyle = '#5fe0c8'; circle(x, 64, 100, 14); x.fill();
      x.fillStyle = 'rgba(255,255,255,.7)'; circle(x, 59, 95, 5); x.fill();
    });
  }
  function jwstTex() {
    return canvasTex(64, 64, function (x) {
      x.fillStyle = '#b48cff'; x.beginPath(); x.moveTo(32, 36); x.lineTo(62, 50); x.lineTo(32, 62); x.lineTo(2, 50); x.closePath(); x.fill();
      function hex(cx, cy, r) { x.beginPath(); for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); }
      x.fillStyle = '#ffd166'; x.strokeStyle = '#b8862a'; x.lineWidth = 1.2;
      var r = 6, dx = r * Math.sqrt(3);
      [[0, 0], [dx, 0], [-dx, 0], [dx / 2, -r * 1.5], [-dx / 2, -r * 1.5], [dx / 2, r * 1.5], [-dx / 2, r * 1.5]].forEach(function (p) { hex(32 + p[0], 22 + p[1], r); });
    });
  }
  function bPlanets(S, today) {
    var g = new THREE.Group();
    var sun = makeSun(S, 1.8); g.add(sun);
    var items = [];
    PL.forEach(function (p) {
      var name = p[0], tex = name === 'earth' ? (today ? PAINT.earthToday() : PAINT.earthLava()) : PAINT[name]();
      var holder = new THREE.Group();
      var mesh = planet(p[2], tex, name === 'earth' && !today ? { emissive: 0.5 } : null);
      holder.add(mesh);
      if (name === 'saturn') {
        var rm = new THREE.MeshBasicMaterial({ color: 0xe8d5a0, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
        var r1 = new THREE.Mesh(new THREE.RingGeometry(p[2] * 1.35, p[2] * 1.8, 64), rm);
        var rm2 = rm.clone(); rm2.color.setHex(0xc9b27a); rm2.opacity = 0.7;
        var r2 = new THREE.Mesh(new THREE.RingGeometry(p[2] * 1.88, p[2] * 2.25, 64), rm2);
        r1.rotation.x = r2.rotation.x = -Math.PI / 2 + 0.45; holder.add(r1, r2);
      }
      if (name === 'uranus') mesh.rotation.z = 1.7;
      var moon = null;
      if (name === 'earth' && today) { moon = planet(0.14, PAINT.moon()); holder.add(moon); }
      var orbit = orbitLine(p[1], today ? 0.2 : 0.16);
      g.add(orbit, holder);
      var spawn = today ? null : glow(S, 0xffe3c2, 1, 0); if (spawn) holder.add(spawn);
      items.push({ p: p, holder: holder, mesh: mesh, orbit: orbit, moon: moon, spawn: spawn, a: Math.random() * Math.PI * 2 });
    });
    var dust = null;
    if (!today) {
      dust = mkPoints(S, 3500, 0.28, true, 0.7);
      for (var i = 0; i < 3500; i++) {
        var r = 2.5 + Math.random() * 18, a = Math.random() * 6.28;
        dust.pos[i * 3] = Math.cos(a) * r; dust.pos[i * 3 + 1] = gauss() * 0.15; dust.pos[i * 3 + 2] = Math.sin(a) * r;
        setCol(dust.col, i, r < 9 ? pick([0xc08a5a, 0xffb070]) : pick([0xbfd8ff, 0x9fb0d0]), rnd(0.4, 0.8));
      }
      dust.dirty(true); g.add(dust.obj);
    }
    var extra = {};
    if (today) {
      var pl = planet(0.18, PAINT.pluto()); var po = orbitLine(20.8, 0.14, 0xffb0c8, 0.2, 0.82); po.position.x = 2.5;
      var plH = new THREE.Group(); plH.rotation.x = 0.2; plH.position.x = 2.5; plH.add(pl); g.add(po, plH);
      extra.pluto = pl; extra.plA = 1.2;
      var jw = texSprite(jwstTex(), 0.9, 0.9); g.add(jw); extra.jw = jw;
      var rk = texSprite(rocketTex(), 1.5, 3); rk.renderOrder = 5; g.add(rk); extra.rk = rk;
      var trail = mkPoints(S, 40, 0.35, true, 1); g.add(trail.obj); extra.trail = trail; extra.hist = [];
      extra.rkGlow = glow(S, 0xffd166, 1.6, 0.6); g.add(extra.rkGlow);
    }
    var v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
    function rocketPos(u, out) {
      var a = u * 0.35; var r = 12 + 3 * Math.sin(a * 2);
      out.set(Math.cos(a) * r, 2.5 + Math.sin(a * 3) * 1.2, Math.sin(a) * r * 0.75 + 3);
      return out;
    }
    return { group: g, update: function (t, dt) {
      sun.userData.tick(t);
      var speed = today ? 0.45 : 0.8;
      items.forEach(function (it) {
        var p = it.p; it.a += dt * speed * Math.pow(5.8 / p[1], 1.5);
        it.holder.position.set(Math.cos(it.a) * p[1], 0, -Math.sin(it.a) * p[1]);
        it.mesh.rotation.y += dt * 0.6;
        var k = today ? 1 : backOut((t - p[3]) / 0.9);
        it.holder.scale.setScalar(Math.max(0.001, k));
        it.orbit.material.userData.base = (today ? 0.2 : 0.16) * clamp01((t - p[3] + 0.6) / 1.2);
        if (it.spawn) { var sk = t - p[3]; var ss = 1.5 + Math.max(0, sk) * 6; it.spawn.scale.set(ss, ss, 1); it.spawn.material.userData.base = sk < 0 ? 0 : Math.max(0, 1 - sk / 1.2); }
        if (it.moon) { var ma = t * 1.6; it.moon.position.set(Math.cos(ma) * 0.85, 0.1, Math.sin(ma) * 0.85); }
      });
      if (dust) { dust.mat.userData.base = 0.7 - 0.55 * ease(t / 8); dust.obj.rotation.y = t * 0.05; }
      if (today) {
        extra.plA += dt * 0.04; extra.pluto.position.set(Math.cos(extra.plA) * 20.8, 0, -Math.sin(extra.plA) * 20.8 * 0.82);
        var e = items[2]; var ex = e.holder.position;
        var L = ex.length() || 1; extra.jw.position.set(ex.x * (1 + 1.4 / L), 0.5, ex.z * (1 + 1.4 / L));
        extra.jw.material.rotation = Math.sin(t) * 0.1;
        rocketPos(t, v1); rocketPos(t + 0.08, v2);
        extra.rk.position.copy(v1); extra.rkGlow.position.copy(v1);
        var a1 = v1.clone().project(S.camera), a2 = v2.clone().project(S.camera);
        var ang = Math.atan2((a2.y - a1.y) * S.size.h, (a2.x - a1.x) * S.size.w);
        extra.rk.material.rotation = ang - Math.PI / 2;
        var hst = extra.hist; hst.unshift(v1.clone()); if (hst.length > 40) hst.pop();
        var tr = extra.trail;
        for (var i = 0; i < 40; i++) {
          var hp = hst[Math.min(i, hst.length - 1)];
          tr.pos[i * 3] = hp.x; tr.pos[i * 3 + 1] = hp.y; tr.pos[i * 3 + 2] = hp.z;
          setCol(tr.col, i, i % 2 ? 0xffd166 : 0xff7a45, Math.max(0, 1 - i / 40));
        }
        tr.dirty(true);
      }
    } };
  }

  /* ---------- 7. Theia & the Moon ---------- */
  function bTheia(S) {
    var g = new THREE.Group();
    var earth = planet(2.4, PAINT.earthLava(), { emissive: 0.55 }); g.add(earth);
    var eglow = glow(S, 0xff6a3a, 9, 0.45); g.add(eglow);
    var theia = planet(1.3, PAINT.theia()); g.add(theia);
    var tStart = new THREE.Vector3(-14, 6, -4), contact = new THREE.Vector3(-1, 0.3, 0.25).normalize();
    var cPos = contact.clone().multiplyScalar(3.2);
    var flash = glow(S, 0xffe3c2, 1, 0); flash.position.copy(contact).multiplyScalar(2.5); g.add(flash);
    var U = new THREE.Vector3(1, 0, 0), V = new THREE.Vector3(0, 0.28, 0.96).normalize(), Wn = new THREE.Vector3().crossVectors(U, V);
    var thC = Math.atan2(contact.dot(V), contact.dot(U)), offC = contact.dot(Wn) * 3.2;
    var N = 1600, P = mkPoints(S, N, 0.28, true, 0);
    var D = new Float32Array(N), RR = new Float32Array(N), SC = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      D[i] = rnd(-Math.PI, Math.PI) * 1.1; RR[i] = rnd(4.3, 7.2);
      SC[i * 3] = gauss() * 0.3; SC[i * 3 + 1] = gauss() * 0.25; SC[i * 3 + 2] = gauss() * 0.3;
      setCol(P.col, i, pick([0xffb347, 0xff7a45, 0xc9c3f0, 0xffffff, 0xd9a07a]));
    }
    P.dirty(true); g.add(P.obj);
    var moon = planet(0.62, PAINT.moon()); moon.scale.setScalar(0.001); g.add(moon);
    var IMP = 3.2, W = 0.5;
    var tmp = new THREE.Vector3();
    return { group: g, update: function (t) {
      earth.rotation.y = t * 0.25;
      var ap = clamp01(t / IMP);
      if (t < IMP) { theia.visible = true; theia.position.lerpVectors(tStart, cPos, ap * ap); theia.scale.setScalar(1); theia.rotation.y = t; }
      else { var sh = 1 - clamp01((t - IMP) / 0.35); theia.scale.setScalar(Math.max(0.001, sh)); theia.visible = sh > 0.01; }
      var u = t - IMP;
      var fs = u < 0 ? 0.01 : 2 + u * 14; flash.scale.set(fs, fs, 1);
      flash.material.userData.base = u < 0 ? 0 : u < 0.2 ? u * 5 : Math.max(0, 1 - (u - 0.2) / 1.8);
      var thM = thC + 2.2;
      if (u > 0) {
        var k = easeOut(u / 2.6), k2 = ease((u - 6) / 4.5);
        for (var i = 0; i < N; i++) {
          var ai = thC + D[i] * k + u * W;
          var dm = wrapPi(thM - thC - D[i]);
          var a = ai + dm * k2, r = 3.2 + (RR[i] - 3.2) * k; r = r + (6 - r) * k2;
          var off = offC * (1 - k), sc = 1 - k2;
          tmp.copy(U).multiplyScalar(Math.cos(a) * r).addScaledVector(V, Math.sin(a) * r).addScaledVector(Wn, off);
          var o = i * 3;
          P.pos[o] = tmp.x + SC[o] * sc; P.pos[o + 1] = tmp.y + SC[o + 1] * sc; P.pos[o + 2] = tmp.z + SC[o + 2] * sc;
        }
        P.dirty();
        P.mat.userData.base = Math.min(1, u * 3) * (1 - 0.85 * ease((u - 8) / 3));
        var ma = thM + u * W;
        moon.position.copy(U).multiplyScalar(Math.cos(ma) * 6).addScaledVector(V, Math.sin(ma) * 6);
        moon.scale.setScalar(Math.max(0.001, easeOut((u - 7) / 4)));
        moon.rotation.y = u * 0.3;
      } else { P.mat.userData.base = 0; }
      eglow.material.userData.base = 0.4 + 0.1 * Math.sin(t * 2);
    } };
  }

  /* ---------- 8. Space rocks, rain and oceans ---------- */
  function bRocks(S) {
    var g = new THREE.Group(), RAD = 2.6;
    var lava = planet(RAD, PAINT.earthLava(), { emissive: 0.5 }); g.add(lava);
    var oceanTex = PAINT.earthOcean();
    var ocean = new THREE.Mesh(new THREE.SphereGeometry(RAD + 0.01, 36, 24), new THREE.MeshStandardMaterial({ map: oceanTex, roughness: 0.6, transparent: true, opacity: 0 }));
    g.add(ocean);
    var clouds = new THREE.Mesh(new THREE.SphereGeometry(RAD + 0.12, 36, 24), new THREE.MeshStandardMaterial({ map: PAINT.clouds(), transparent: true, opacity: 0, depthWrite: false }));
    g.add(clouds);
    var atmo = glow(S, 0x8fd0ff, RAD * 3.4, 0); g.add(atmo);
    var hotGlow = glow(S, 0xff6a3a, RAD * 3.6, 0.4); g.add(hotGlow);
    var moon = planet(0.6, PAINT.moon()); moon.position.set(7, 3.5, -6); g.add(moon);
    var NM = 10, TR = 16, P = mkPoints(S, NM * TR, 0.5, true, 1);
    var mets = [];
    for (var i = 0; i < NM; i++) {
      var fl = glow(S, 0xffe3c2, 0.01, 0); g.add(fl);
      mets.push({ on: false, s: new THREE.Vector3(), e: new THREE.Vector3(), t0: 0, dur: 1, icy: false, flash: fl, ft: -9 });
    }
    g.add(P.obj);
    var next = 0.2, cur = new THREE.Vector3();
    return { group: g, update: function (t) {
      lava.rotation.y = ocean.rotation.y = t * 0.2; clouds.rotation.y = t * 0.27;
      var k = ease((t - 4.5) / 6);
      ocean.material.userData.base = k; clouds.material.userData.base = 0.85 * ease((t - 3) / 5);
      atmo.material.userData.base = 0.45 * k; hotGlow.material.userData.base = 0.4 * (1 - k);
      lava.material.emissiveIntensity = 0.5 * (1 - k);
      if (t > next) {
        var m = mets.find(function (q) { return !q.on; });
        if (m) {
          var d = new THREE.Vector3(rnd(-1, 1), rnd(-0.7, 1), rnd(0.25, 1)).normalize();
          m.e.copy(d).multiplyScalar(RAD * 0.98);
          var sa = Math.random() * Math.PI * 2;
          m.s.set(Math.cos(sa) * 11, Math.abs(Math.sin(sa)) * 7 + 1, rnd(-4, 3));
          m.t0 = t; m.dur = rnd(0.9, 1.4); m.on = true; m.icy = Math.random() < 0.35;
        }
        next = t + 0.3 + ease(t / 10) * 1.6;
      }
      mets.forEach(function (m, mi) {
        var u = m.on ? (t - m.t0) / m.dur : 0;
        if (m.on && u >= 1) { m.on = false; m.ft = t; m.flash.position.copy(m.e).multiplyScalar(1.03); m.flash.material.color.setHex(m.icy ? 0xbfe8ff : 0xffd166); }
        for (var j = 0; j < TR; j++) {
          var idx = mi * TR + j;
          if (m.on) {
            var uu = Math.max(0, u - j * 0.012); var ee = uu * uu;
            cur.lerpVectors(m.s, m.e, ee);
            P.pos[idx * 3] = cur.x; P.pos[idx * 3 + 1] = cur.y; P.pos[idx * 3 + 2] = cur.z;
            setCol(P.col, idx, m.icy ? 0x9fe0ff : 0xffc070, (1 - j / TR) * (uu > 0 ? 1 : 0));
          } else setCol(P.col, idx, 0, 0);
        }
        var fa = t - m.ft, fs = 0.4 + fa * 2.5;
        m.flash.scale.set(fs, fs, 1); m.flash.material.userData.base = fa < 0 ? 0 : Math.max(0, 1 - fa / 0.7);
      });
      P.dirty(true);
    } };
  }

  /* ---------- 9. Life begins (underwater) ---------- */
  function cellTex(kind, fill, edge) {
    return canvasTex(128, 128, function (x) {
      x.save(); x.translate(64, 64);
      if (kind === 1) { x.strokeStyle = edge; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(38, 0); x.bezierCurveTo(48, -12, 54, 12, 62, 0); x.stroke(); }
      x.fillStyle = fill; x.strokeStyle = edge; x.lineWidth = 5;
      if (kind === 0) ell(x, 0, 0, 40, 40); else if (kind === 1) ell(x, 0, 0, 38, 22); else ell(x, 0, 0, 44, 30, 0.2);
      x.fill(); x.stroke();
      x.fillStyle = 'rgba(255,255,255,.35)'; ell(x, -12, -10, 12, 7, -0.5); x.fill();
      x.fillStyle = edge; x.globalAlpha = 0.7;
      for (var i = 0; i < 9; i++) { circle(x, rnd(-20, 20), rnd(-12, 14), rnd(1.5, 3)); x.fill(); }
      x.globalAlpha = 1; x.strokeStyle = edge; x.lineWidth = 2; x.beginPath(); x.moveTo(-10, 8);
      x.bezierCurveTo(-4, -2, 4, 18, 12, 6); x.stroke();
      x.fillStyle = '#1e1954'; circle(x, -6, -2, 3.5); x.fill(); circle(x, 8, -2, 3.5); x.fill();
      x.fillStyle = '#fff'; circle(x, -5, -3.2, 1.2); x.fill(); circle(x, 9, -3.2, 1.2); x.fill();
      x.restore();
    });
  }
  function softStripTex() {
    return canvasTex(64, 4, function (x, w, h) {
      var gr = x.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
    });
  }
  function underwater(S, g, bright) {
    g.add(backdrop(bright ? [[0, '#9ff3e3'], [0.35, '#3fb3c9'], [1, '#145c8a']] : [[0, '#5fd0d8'], [0.3, '#2a8fb8'], [1, '#0a2a5e']], -30, 320, 200, 10));
    var strip = softStripTex(), rays = [];
    for (var i = 0; i < 5; i++) {
      var r = texPlane(strip, rnd(2, 4), 40, { additive: true, opacity: bright ? 0.16 : 0.11, depthWrite: false });
      r.position.set(-12 + i * 6 + rnd(-1, 1), 8, -14); r.rotation.z = 0.25; r.userData.ph = Math.random() * 6; rays.push(r); g.add(r);
    }
    var NB = 220, B = mkPoints(S, NB, 0.22, true, 0.8);
    var bs = new Float32Array(NB);
    for (i = 0; i < NB; i++) { B.pos[i * 3] = rnd(-18, 18); B.pos[i * 3 + 1] = rnd(-12, 14); B.pos[i * 3 + 2] = rnd(-10, 4); bs[i] = rnd(0.6, 2); setCol(B.col, i, 0xdffcff, rnd(0.4, 0.9)); }
    B.dirty(true); g.add(B.obj);
    return function (t, dt, boost) {
      rays.forEach(function (r) { r.material.userData.base = (bright ? 0.16 : 0.11) * (0.6 + 0.4 * Math.sin(t * 0.7 + r.userData.ph)); r.rotation.z = 0.25 + Math.sin(t * 0.3 + r.userData.ph) * 0.05; });
      for (var i = 0; i < NB; i++) {
        var y = B.pos[i * 3 + 1] + dt * bs[i] * (boost || 1);
        if (y > 14) y = -12;
        B.pos[i * 3 + 1] = y; B.pos[i * 3] += Math.sin(t * 2 + i) * dt * 0.2;
      }
      B.dirty();
    };
  }
  function bLife(S) {
    var g = new THREE.Group(), tick = underwater(S, g, false);
    var vent = new THREE.Group();
    var ventTex = canvasTex(256, 256, function (x) {
      x.fillStyle = '#1b2350'; x.beginPath(); x.moveTo(40, 256); x.lineTo(100, 70); x.lineTo(150, 70); x.lineTo(216, 256); x.fill();
      x.fillStyle = '#26306a'; ell(x, 125, 72, 28, 10); x.fill();
      x.fillStyle = '#2f3a7a'; x.beginPath(); x.moveTo(0, 256); x.quadraticCurveTo(128, 180, 256, 256); x.fill();
    });
    var vp = texPlane(ventTex, 5, 5); vp.position.set(-6.5, -7.6, -4); vent.add(vp);
    var vg = glow(S, 0xffb070, 4, 0.5); vg.position.set(-6.4, -5.4, -3.9); vent.add(vg);
    g.add(vent);
    var cells = [], kinds = [[0, 'rgba(95,224,200,.55)', '#5fe0c8'], [1, 'rgba(255,111,168,.5)', '#ff8fc0'], [2, 'rgba(255,209,102,.5)', '#ffd166'], [0, 'rgba(185,166,255,.5)', '#b9a6ff']];
    var texs = kinds.map(function (k) { return cellTex(k[0], k[1], k[2]); });
    for (var i = 0; i < 15; i++) {
      var ki = i % kinds.length, s = rnd(1.4, 2.6) * (kinds[ki][0] === 1 ? 1.1 : 1);
      var sp = texSprite(texs[ki], s, s); sp.position.set(rnd(-11, 11), rnd(-5, 6), rnd(-6, 3));
      sp.userData = { b: sp.position.clone(), s: s, ph: Math.random() * 6.28, f: rnd(0.5, 1.2) };
      var gl = glow(S, new THREE.Color(kinds[ki][2]).getHex(), s * 1.8, 0.25); sp.userData.gl = gl; g.add(gl);
      cells.push(sp); g.add(sp);
    }
    return { group: g, update: function (t, dt) {
      tick(t, dt);
      vg.material.userData.base = 0.4 + 0.15 * Math.sin(t * 3);
      cells.forEach(function (c) {
        var u = c.userData, f = u.f;
        c.position.set(u.b.x + Math.sin(t * 0.4 * f + u.ph) * 1.4, u.b.y + Math.cos(t * 0.5 * f + u.ph) * 0.8, u.b.z);
        var w = Math.sin(t * 4 * f + u.ph) * 0.08;
        c.scale.set(u.s * (1 + w), u.s * (1 - w), 1);
        c.material.rotation = Math.sin(t * 1.2 * f + u.ph) * 0.35;
        u.gl.position.copy(c.position); u.gl.position.z -= 0.05;
      });
    } };
  }

  /* ---------- 10. Oxygen & sea creatures ---------- */
  function trilobiteTex() {
    return canvasTex(256, 160, function (x) {
      x.strokeStyle = '#6b3f6f'; x.lineWidth = 6; x.lineCap = 'round';
      for (var i = 0; i < 6; i++) { var lx = 70 + i * 22; x.beginPath(); x.moveTo(lx, 100); x.lineTo(lx - 8, 140); x.stroke(); }
      x.fillStyle = '#c98ab0'; x.strokeStyle = '#6b3f6f'; x.lineWidth = 6;
      ell(x, 128, 86, 100, 46); x.fill(); x.stroke();
      x.fillStyle = '#e0a8c8'; ell(x, 52, 82, 34, 36); x.fill(); x.stroke();
      x.strokeStyle = 'rgba(107,63,111,.7)'; x.lineWidth = 4;
      for (i = 0; i < 7; i++) { var sx = 96 + i * 18; x.beginPath(); x.moveTo(sx, 46); x.quadraticCurveTo(sx + 6, 86, sx, 126); x.stroke(); }
      x.beginPath(); x.moveTo(90, 86); x.lineTo(224, 86); x.stroke();
      x.fillStyle = '#1e1954'; circle(x, 44, 70, 8); x.fill(); x.fillStyle = '#fff'; circle(x, 42, 67, 3); x.fill();
      x.strokeStyle = '#6b3f6f'; x.lineWidth = 4; x.beginPath(); x.moveTo(26, 60); x.quadraticCurveTo(4, 30, 14, 10); x.stroke();
    });
  }
  function jellyTex() {
    return canvasTex(128, 192, function (x) {
      x.strokeStyle = 'rgba(255,143,192,.8)'; x.lineWidth = 4; x.lineCap = 'round';
      for (var i = 0; i < 5; i++) { var sx = 34 + i * 15; x.beginPath(); x.moveTo(sx, 70); x.bezierCurveTo(sx - 10, 110, sx + 10, 140, sx - 4, 185); x.stroke(); }
      x.fillStyle = 'rgba(255,111,168,.6)'; x.strokeStyle = '#ff8fc0'; x.lineWidth = 4;
      x.beginPath(); x.moveTo(10, 72); x.bezierCurveTo(10, 0, 118, 0, 118, 72); x.quadraticCurveTo(64, 86, 10, 72); x.fill(); x.stroke();
      x.fillStyle = 'rgba(255,255,255,.45)'; ell(x, 44, 36, 16, 9, -0.5); x.fill();
      x.fillStyle = '#1e1954'; circle(x, 50, 54, 4); x.fill(); circle(x, 78, 54, 4); x.fill();
    });
  }
  function moundTex() {
    return canvasTex(256, 160, function (x) {
      var cols = ['#3f8a5a', '#5fb56a', '#4f9f63', '#7cc79a', '#3f8a5a'];
      for (var i = 0; i < cols.length; i++) { x.fillStyle = cols[i]; ell(x, 128, 160, 120 - i * 18, 140 - i * 26); x.fill(); }
      x.fillStyle = 'rgba(255,255,255,.18)'; ell(x, 100, 60, 30, 10, -0.3); x.fill();
    });
  }
  function bOxygen(S) {
    var g = new THREE.Group(), tick = underwater(S, g, true);
    var sandTex = canvasTex(512, 128, function (x, w, h) {
      x.fillStyle = '#e8c88f'; x.beginPath(); x.moveTo(0, 40); for (var i = 0; i <= 16; i++) x.lineTo(i * w / 16, 30 + Math.sin(i * 1.3) * 12); x.lineTo(w, h); x.lineTo(0, h); x.fill();
      blobs(x, w, h, '#d4b27a', 30, 3, 8, 0.6);
    });
    var sand = texPlane(sandTex, 60, 15); sand.position.set(0, -8.6, -2); g.add(sand);
    var mt = moundTex(), mounds = [];
    [[-9, -4, -3, 4], [-4.5, -4.5, -2.5, 3], [7.5, -4.2, -3, 4.2], [11, -4.6, -2.6, 2.6]].forEach(function (m) {
      var s = texSprite(mt, m[3], m[3] * 0.62, { depthWrite: false }); s.position.set(m[0], m[1], m[2]); g.add(s); mounds.push(s);
    });
    var NO = 160, O = mkPoints(S, NO, 0.3, true, 1), os = new Float32Array(NO);
    for (var i = 0; i < NO; i++) { var mm = mounds[i % mounds.length].position; O.pos[i * 3] = mm.x + gauss() * 0.8; O.pos[i * 3 + 1] = rnd(-4, 14); O.pos[i * 3 + 2] = mm.z + 0.5; os[i] = rnd(1.2, 3); setCol(O.col, i, 0xc8fff0, 0.9); }
    O.dirty(true); g.add(O.obj);
    var tri = trilobiteTex(), crits = [];
    for (i = 0; i < 3; i++) { var tr = texSprite(tri, 2.4, 1.5); tr.userData = { x0: rnd(-10, 10), y: -5.2 + i * 0.25, z: rnd(-1, 2), sp: rnd(0.5, 0.9) * (i % 2 ? 1 : -1), ph: Math.random() * 6 }; crits.push(tr); g.add(tr); }
    var jt = jellyTex(), jellies = [];
    for (i = 0; i < 3; i++) { var j = texSprite(jt, 1.8, 2.7); j.userData = { x: rnd(-2, 10), y: rnd(-1, 4), z: rnd(-4, 1), ph: Math.random() * 6 }; jellies.push(j); g.add(j); }
    return { group: g, update: function (t, dt) {
      tick(t, dt, 0.6);
      for (var i = 0; i < NO; i++) {
        var y = O.pos[i * 3 + 1] + dt * os[i];
        if (y > 14) { y = -4; var mm = mounds[i % mounds.length].position; O.pos[i * 3] = mm.x + gauss() * 0.8; }
        O.pos[i * 3 + 1] = y;
      }
      O.dirty();
      crits.forEach(function (c) {
        var u = c.userData, x = ((u.x0 + t * u.sp + 16) % 32 + 32) % 32 - 16;
        c.position.set(x, u.y + Math.abs(Math.sin(t * 6 + u.ph)) * 0.06, u.z);
        var w = Math.abs(c.scale.x); c.scale.x = u.sp > 0 ? -w : w;
      });
      jellies.forEach(function (j) {
        var u = j.userData, p = Math.sin(t * 1.5 + u.ph);
        j.position.set(u.x + Math.sin(t * 0.2 + u.ph) * 2, u.y + Math.sin(t * 0.5 + u.ph) * 1.5, u.z);
        j.scale.set(1.8 * (1 + p * 0.08), 2.7 * (1 - p * 0.06), 1);
      });
    } };
  }

  /* ---------- 11. Dinosaurs ---------- */
  function dinoTex() {
    return canvasTex(1024, 640, function (x) {
      function shapes(fn) {
        [function () { x.beginPath(); x.moveTo(380, 430); x.quadraticCurveTo(250, 330, 215, 150); x.lineTo(300, 140); x.quadraticCurveTo(330, 300, 470, 330); x.closePath(); },
          function () { ell(x, 220, 128, 78, 48, -0.12); },
          function () { x.beginPath(); x.moveTo(740, 340); x.quadraticCurveTo(900, 370, 1010, 500); x.quadraticCurveTo(880, 440, 740, 460); x.closePath(); },
          function () { rrect(x, 395, 420, 70, 175, 24); }, function () { rrect(x, 495, 430, 64, 165, 24); },
          function () { rrect(x, 640, 420, 70, 175, 24); }, function () { rrect(x, 730, 430, 64, 165, 24); },
          function () { ell(x, 590, 400, 240, 125); }].forEach(fn);
      }
      x.lineJoin = 'round'; x.strokeStyle = '#2f6b45'; x.lineWidth = 18;
      shapes(function (f) { f(); x.stroke(); });
      x.fillStyle = '#6fcf7f'; shapes(function (f) { f(); x.fill(); });
      x.save(); ell(x, 590, 400, 240, 125); x.clip(); x.fillStyle = '#b5ecb0'; ell(x, 580, 500, 210, 70); x.fill(); x.restore();
      x.fillStyle = '#4fae66'; [[560, 340, 34, 22], [650, 320, 26, 18], [720, 370, 22, 15], [500, 360, 20, 14], [620, 380, 16, 11]].forEach(function (s) { ell(x, s[0], s[1], s[2], s[3]); x.fill(); });
      x.fillStyle = '#3f8a5a'; [420, 520, 665, 755].forEach(function (lx, i) { rrect(x, lx - 5 + (i % 2 ? 0 : 5), 578, 60, 16, 8); x.fill(); });
      x.fillStyle = '#fff'; circle(x, 196, 112, 18); x.fill(); x.fillStyle = '#1e1954'; circle(x, 192, 114, 10); x.fill(); x.fillStyle = '#fff'; circle(x, 188, 109, 4); x.fill();
      x.fillStyle = 'rgba(255,111,168,.55)'; ell(x, 230, 148, 16, 10); x.fill();
      x.strokeStyle = '#2f6b45'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.arc(170, 132, 26, 0.25 * Math.PI, 0.75 * Math.PI); x.stroke();
      circle(x, 156, 116, 3); x.fillStyle = '#2f6b45'; x.fill();
    });
  }
  function hillTex(color, rim, kind) {
    return canvasTex(1024, 256, function (x, w, h) {
      x.scale(2, 2); w = 512; h = 128;
      x.fillStyle = color; x.beginPath(); x.moveTo(0, h);
      if (kind === 0) { for (var i = 0; i <= 32; i++) x.lineTo(i * w / 32, 40 + Math.sin(i * 0.7) * 16 + Math.sin(i * 1.9) * 8); }
      else { x.lineTo(0, 70); x.bezierCurveTo(w * 0.25, 10, w * 0.75, 10, w, 70); }
      x.lineTo(w, h); x.closePath(); x.fill();
      if (rim) { x.strokeStyle = rim; x.lineWidth = 4; x.stroke(); }
    });
  }
  function plantTex() {
    return canvasTex(128, 192, function (x) {
      x.fillStyle = '#8a5a3a'; rrect(x, 56, 90, 16, 102, 6); x.fill();
      x.strokeStyle = '#3f8a5a'; x.lineWidth = 9; x.lineCap = 'round';
      for (var i = 0; i < 7; i++) { var a = -Math.PI / 2 + (i - 3) * 0.42; x.beginPath(); x.moveTo(64, 92); x.quadraticCurveTo(64 + Math.cos(a) * 40, 92 + Math.sin(a) * 60, 64 + Math.cos(a) * 60, 92 + Math.sin(a) * 50 + 30); x.stroke(); }
    });
  }
  function cloudTex() { return canvasTex(256, 128, function (x) { x.fillStyle = '#fff'; [[70, 80, 40], [120, 60, 50], [175, 78, 38], [120, 90, 45]].forEach(function (c) { circle(x, c[0], c[1], c[2]); x.fill(); }); }); }
  function birdTex() { return canvasTex(128, 64, function (x) { x.strokeStyle = '#1e1954'; x.lineWidth = 7; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(10, 24); x.quadraticCurveTo(38, 8, 64, 36); x.quadraticCurveTo(90, 8, 118, 24); x.stroke(); }); }
  function bDinos(S) {
    var g = new THREE.Group();
    g.add(backdrop([[0, '#5fb8f0'], [0.45, '#9fdcff'], [0.62, '#ffe3c2'], [1, '#ffd0a0']], -40, 320, 200, 8));
    var sunS = glow(S, 0xfff2b0, 14, 0.9); sunS.position.set(-3, 13, -38); g.add(sunS);
    var sunD = new THREE.Mesh(new THREE.CircleGeometry(1.8, 40), new THREE.MeshBasicMaterial({ color: 0xfff6d0, transparent: true })); sunD.position.set(-3, 13, -37.9); g.add(sunD);
    var ct = cloudTex(), clouds = [];
    for (var i = 0; i < 5; i++) { var c = texSprite(ct, rnd(5, 8), 3, { opacity: 0.9 }); c.position.set(rnd(-30, 30), rnd(6, 13), -34); c.userData.sp = rnd(0.3, 0.7); clouds.push(c); g.add(c); }
    var mGlow = glow(S, 0xffa060, 1, 0); mGlow.position.set(9, -0.5, -36); g.add(mGlow);
    var far = texPlane(hillTex('#8fd3a6', null, 0), 200, 30); far.position.set(0, -12.5, -30); g.add(far);
    var mid = texPlane(hillTex('#6fc28a', null, 0), 120, 22); mid.position.set(10, -11, -18); g.add(mid);
    var hill = texPlane(hillTex('#5fb56a', '#7fd08a', 1), 40, 12); hill.position.set(0, -6.9, -1); g.add(hill);
    var front = texPlane(hillTex('#4fa35e', null, 0), 120, 20); front.position.set(0, -13.5, 2); g.add(front);
    var pt = plantTex();
    [[-8, -1.4, -1.2, 2.6], [8.5, -1.6, -1.1, 3], [-11, -2.4, -0.9, 2], [11.5, -2.6, -0.8, 2.2]].forEach(function (p) { var s = texSprite(pt, p[3] * 0.66, p[3], { depthWrite: true }); s.position.set(p[0], p[1], p[2]); s.material.alphaTest = 0.5; g.add(s); });
    var dino = texPlane(dinoTex(), 8, 5); dino.position.set(0.4, 0.9, 0); g.add(dino);
    var mHead = glow(S, 0xfff2d0, 1.2, 0), NT = 14, T = mkPoints(S, NT, 0.5, true, 1); g.add(mHead, T.obj);
    var bird = texSprite(birdTex(), 1.6, 0.8); bird.visible = false; g.add(bird);
    var a = new THREE.Vector3(24, 16, -36), b = new THREE.Vector3(9, -0.5, -36), cur = new THREE.Vector3();
    var CY = 16;
    return { group: g, update: function (t, dt) {
      clouds.forEach(function (c) { c.position.x += dt * c.userData.sp; if (c.position.x > 34) c.position.x = -34; });
      var bob = Math.sin(t * 1.4);
      dino.position.y = 0.9 + bob * 0.05; dino.scale.set(1 + bob * 0.01, 1 - bob * 0.012, 1);
      var ct2 = t % CY, u = (ct2 - 4) / 1.6;
      var on = u > 0 && u < 1;
      for (var i = 0; i < NT; i++) {
        var uu = clamp01(u - i * 0.02); cur.lerpVectors(a, b, uu);
        T.pos[i * 3] = cur.x; T.pos[i * 3 + 1] = cur.y; T.pos[i * 3 + 2] = cur.z;
        setCol(T.col, i, 0xffe3a0, on ? (1 - i / NT) : 0);
      }
      T.dirty(true);
      cur.lerpVectors(a, b, clamp01(u)); mHead.position.copy(cur); mHead.material.userData.base = on ? 1 : 0;
      var gu = ct2 - 5.6, gs = 2 + Math.max(0, gu) * 3;
      mGlow.scale.set(gs, gs * 0.6, 1); mGlow.material.userData.base = gu < 0 ? 0 : gu < 0.5 ? gu * 1.2 : Math.max(0, 0.6 - (gu - 0.5) / 5);
      var bu = (ct2 - 8.5) / 7;
      bird.visible = bu > 0 && bu < 1;
      if (bird.visible) { bird.position.set(14 - bu * 28, 5 + Math.sin(bu * 9) * 0.6, -6); bird.scale.set(1.6, 0.8 * (0.6 + 0.4 * Math.abs(Math.sin(t * 7))), 1); }
    } };
  }

  /* ---------- 12. First people ---------- */
  function peopleTex() {
    return canvasTex(1024, 384, function (x) {
      var body = '#2a1f55', rim = '#ff9a4a';
      function sitter(cx, cy, s, faceRight, child) {
        x.save(); x.translate(cx, cy); x.scale(faceRight ? s : -s, s);
        x.fillStyle = body;
        x.beginPath(); x.moveTo(-40, 0); x.quadraticCurveTo(-48, -90, -10, -110); x.quadraticCurveTo(30, -112, 34, -60); x.lineTo(80, -40); x.quadraticCurveTo(92, -30, 84, 0); x.closePath(); x.fill();
        circle(x, 6, -140, 30); x.fill();
        if (!child) { x.beginPath(); x.moveTo(-26, -150); x.quadraticCurveTo(-30, -100, -40, -90); x.lineTo(-20, -120); x.fill(); }
        x.strokeStyle = rim; x.lineWidth = 6; x.lineCap = 'round';
        x.beginPath(); x.arc(6, -140, 30, -0.6, 0.9); x.stroke();
        x.beginPath(); x.moveTo(30, -100); x.quadraticCurveTo(36, -70, 34, -60); x.lineTo(80, -40); x.stroke();
        x.restore();
      }
      function stander(cx, cy, s) {
        x.save(); x.translate(cx, cy); x.scale(s, s); x.fillStyle = body;
        rrect(x, -18, -110, 16, 110, 8); x.fill(); rrect(x, 4, -110, 16, 110, 8); x.fill();
        x.beginPath(); x.moveTo(-30, -100); x.quadraticCurveTo(-34, -200, 0, -210); x.quadraticCurveTo(34, -200, 30, -100); x.closePath(); x.fill();
        circle(x, 0, -240, 30); x.fill();
        x.strokeStyle = body; x.lineWidth = 16; x.lineCap = 'round'; x.beginPath(); x.moveTo(-18, -195); x.lineTo(-56, -260); x.lineTo(-66, -300); x.stroke();
        x.beginPath(); x.moveTo(20, -190); x.lineTo(36, -130); x.stroke();
        x.strokeStyle = rim; x.lineWidth = 6; x.beginPath(); x.arc(0, -240, 30, -0.3, 1.2); x.stroke();
        x.beginPath(); x.moveTo(30, -110); x.quadraticCurveTo(34, -190, 10, -206); x.stroke();
        x.restore();
      }
      sitter(250, 360, 1.15, true, false);
      sitter(370, 362, 0.75, true, true);
      sitter(770, 360, 1.1, false, false);
      stander(880, 380, 1.05);
    });
  }
  function flameTex() {
    return canvasTex(64, 128, function (x) {
      var gr = x.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, '#fff3b0'); gr.addColorStop(0.35, '#ffd166'); gr.addColorStop(0.7, '#ff7a45'); gr.addColorStop(1, 'rgba(255,111,69,0)');
      x.fillStyle = gr; x.beginPath(); x.moveTo(32, 0); x.bezierCurveTo(46, 40, 62, 70, 58, 96); x.quadraticCurveTo(52, 126, 32, 126); x.quadraticCurveTo(12, 126, 6, 96); x.bezierCurveTo(2, 70, 18, 40, 32, 0); x.fill();
    });
  }
  function crescentTex() {
    return canvasTex(128, 128, function (x) {
      x.fillStyle = '#fff6d8'; circle(x, 64, 64, 50); x.fill();
      x.globalCompositeOperation = 'destination-out'; circle(x, 86, 52, 46); x.fill();
    });
  }
  function bHumans(S) {
    var g = new THREE.Group();
    g.add(backdrop([[0, '#07061f'], [0.55, '#1a1450'], [1, '#3a2a7a']], -40, 320, 200, 8));
    var NS = 1100, St = mkPoints(S, NS, 0.32, true, 1), tw = new Float32Array(NS);
    for (var i = 0; i < NS; i++) {
      var band = i < 450, x, y;
      if (band) { var bt = rnd(-1, 1); x = bt * 50 + gauss() * 3; y = 10 + bt * 10 + gauss() * 3; } else { x = rnd(-70, 70); y = rnd(-4, 40); }
      St.pos[i * 3] = x; St.pos[i * 3 + 1] = y; St.pos[i * 3 + 2] = -38; tw[i] = Math.random() * 6.28;
      setCol(St.col, i, band ? pick([0xc9c3f0, 0xff9fd0, 0xbfd8ff]) : pick([0xffffff, 0xffe3c2, 0xbfd8ff]), band ? 0.5 : 1);
    }
    St.dirty(true); g.add(St.obj);
    var mn = texSprite(crescentTex(), 3.2, 3.2); mn.position.set(-13, 13, -37); g.add(mn);
    var mg = glow(S, 0xfff2c0, 8, 0.25); mg.position.copy(mn.position); g.add(mg);
    var ground = texPlane(hillTex('#1c1542', '#2e2470', 1), 60, 16); ground.position.set(0, -9.2, -1); g.add(ground);
    var groundF = texPlane(hillTex('#120e30', null, 0), 120, 20); groundF.position.set(0, -13, 2.5); g.add(groundF);
    var lightPool = glow(S, 0xff8a3a, 12, 0.35); lightPool.position.set(0, -1.6, 0); g.add(lightPool);
    var people = texPlane(peopleTex(), 10, 3.75); people.position.set(0, -0.4, 0.3); g.add(people);
    var logs = new THREE.Group();
    [0.5, -0.5].forEach(function (r) { var l = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8), new THREE.MeshBasicMaterial({ color: 0x6a3a22 })); l.rotation.z = Math.PI / 2 + r; logs.add(l); });
    logs.position.set(0, -2.05, 1); g.add(logs);
    var ft = flameTex(), flames = [];
    [[0, 1.6, 0.9], [-0.3, 1.1, 0.7], [0.32, 1.2, 0.75]].forEach(function (f, k) { var s = texSprite(ft, f[2], f[1], { additive: true }); s.position.set(f[0], -1.9 + f[1] / 2, 1.1 + k * 0.01); s.userData = { h: f[1], w: f[2], y0: -1.9, ph: k * 2 }; flames.push(s); g.add(s); });
    var fg = glow(S, 0xffb347, 4, 0.7); fg.position.set(0, -1.2, 1.05); g.add(fg);
    var NE = 40, E = mkPoints(S, NE, 0.14, true, 1), el = new Float32Array(NE);
    for (i = 0; i < NE; i++) { el[i] = Math.random() * 3; setCol(E.col, i, pick([0xffd166, 0xff7a45]), 1); }
    E.dirty(true); g.add(E.obj);
    var shoot = glow(S, 0xffffff, 0.8, 0); g.add(shoot);
    return { group: g, update: function (t, dt) {
      for (var i = 0; i < NS; i += 7) { var v = 0.6 + 0.4 * Math.sin(t * 2.5 + tw[i]); St.col[i * 3] = St.col[i * 3 + 1] = St.col[i * 3 + 2] = v; }
      St.geo.attributes.color.needsUpdate = true;
      flames.forEach(function (f) { var u = f.userData, k = 1 + 0.18 * Math.sin(t * 11 + u.ph) + 0.1 * Math.sin(t * 17 + u.ph * 2); f.scale.set(u.w * (1 + 0.08 * Math.sin(t * 9 + u.ph)), u.h * k, 1); f.position.y = u.y0 + u.h * k / 2; });
      fg.material.userData.base = 0.6 + 0.15 * Math.sin(t * 13);
      lightPool.material.userData.base = 0.3 + 0.06 * Math.sin(t * 11);
      for (i = 0; i < NE; i++) {
        el[i] += dt; if (el[i] > 3) el[i] = 0;
        var a = el[i];
        E.pos[i * 3] = Math.sin(i * 7.1 + a * 2) * 0.4 * a; E.pos[i * 3 + 1] = -1.6 + a * 1.4; E.pos[i * 3 + 2] = 1.1;
        setCol(E.col, i, i % 2 ? 0xffd166 : 0xff7a45, Math.max(0, 1 - a / 3));
      }
      E.dirty(true);
      var su = (t % 9) - 6;
      if (su > 0 && su < 1) { shoot.position.set(8 + su * -12, 16 - su * 5, -36); shoot.scale.set(1.2, 1.2, 1); shoot.material.userData.base = Math.sin(su * Math.PI); }
      else shoot.material.userData.base = 0;
    } };
  }

  /* ---------- 13. Apollo 11 ---------- */
  function landerTex() {
    return canvasTex(256, 256, function (x) {
      x.strokeStyle = '#b9b6c4'; x.lineWidth = 7; x.lineCap = 'round';
      [[60, 168, 22, 236], [196, 168, 234, 236], [96, 176, 84, 240], [160, 176, 172, 240]].forEach(function (l) { x.beginPath(); x.moveTo(l[0], l[1]); x.lineTo(l[2], l[3]); x.stroke(); });
      x.fillStyle = '#9a96aa'; [[22, 238], [234, 238], [84, 242], [172, 242]].forEach(function (p) { ell(x, p[0], p[1], 16, 5); x.fill(); });
      x.fillStyle = '#e8b84a'; x.beginPath(); x.moveTo(52, 120); x.lineTo(204, 120); x.lineTo(214, 180); x.lineTo(42, 180); x.closePath(); x.fill();
      x.strokeStyle = '#c9922a'; x.lineWidth = 3; for (var i = 0; i < 6; i++) { x.beginPath(); x.moveTo(60 + i * 28, 124); x.lineTo(54 + i * 30, 178); x.stroke(); }
      x.fillStyle = '#d9d7e4'; x.beginPath(); x.moveTo(78, 120); x.lineTo(84, 62); x.lineTo(118, 40); x.lineTo(170, 44); x.lineTo(184, 74); x.lineTo(180, 120); x.closePath(); x.fill();
      x.strokeStyle = '#8f8aa8'; x.lineWidth = 4; x.stroke();
      x.fillStyle = '#2b2470'; x.beginPath(); x.moveTo(100, 70); x.lineTo(122, 56); x.lineTo(122, 84); x.closePath(); x.fill();
      x.beginPath(); x.moveTo(158, 70); x.lineTo(136, 56); x.lineTo(136, 84); x.closePath(); x.fill();
      x.strokeStyle = '#d9d7e4'; x.lineWidth = 4; x.beginPath(); x.moveTo(160, 44); x.lineTo(176, 18); x.stroke();
      x.fillStyle = '#fff'; ell(x, 180, 16, 12, 6, -0.4); x.fill();
      x.fillStyle = '#1e1954'; rrect(x, 112, 100, 32, 20, 4); x.fill();
    });
  }
  function flagTex() {
    return canvasTex(128, 192, function (x) {
      x.fillStyle = '#d9d7e4'; x.fillRect(14, 10, 6, 182); x.fillRect(14, 10, 104, 5);
      for (var i = 0; i < 7; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#e8414a'; x.fillRect(20, 15 + i * 10, 98, 10); }
      x.fillStyle = '#2b3a9a'; x.fillRect(20, 15, 44, 40);
      x.fillStyle = '#fff'; for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) { circle(x, 25 + c * 8.5, 20 + r * 10, 1.8); x.fill(); }
    });
  }
  function astroTex() {
    return canvasTex(128, 160, function (x) {
      x.fillStyle = '#d9d7e4'; rrect(x, 30, 50, 22, 60, 8); x.fill();
      x.fillStyle = '#f6f3ff'; rrect(x, 40, 52, 50, 60, 18); x.fill();
      rrect(x, 42, 104, 18, 46, 8); x.fill(); rrect(x, 70, 104, 18, 46, 8); x.fill();
      x.strokeStyle = '#f6f3ff'; x.lineWidth = 14; x.lineCap = 'round'; x.beginPath(); x.moveTo(86, 64); x.lineTo(108, 32); x.stroke(); x.beginPath(); x.moveTo(44, 66); x.lineTo(34, 100); x.stroke();
      x.fillStyle = '#f6f3ff'; circle(x, 66, 34, 26); x.fill();
      x.fillStyle = '#ffc94a'; ell(x, 68, 36, 18, 15); x.fill();
      x.fillStyle = 'rgba(255,255,255,.7)'; ell(x, 62, 30, 6, 4, -0.5); x.fill();
      x.fillStyle = '#ff7a45'; x.fillRect(48, 70, 12, 5);
      x.fillStyle = '#9a96aa'; rrect(x, 40, 146, 22, 10, 4); x.fill(); rrect(x, 68, 146, 22, 10, 4); x.fill();
    });
  }
  function bMoon(S) {
    var g = new THREE.Group();
    var groundTex = canvasTex(1024, 512, function (x, w, h) {
      x.fillStyle = '#b8b5c4'; x.fillRect(0, 0, w, h);
      blobs(x, w, h, '#a5a1b3', 40, 20, 60, 0.6);
      craters(x, w, h, 160, '#a29eb2', '#d6d3e0', 16);
    });
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping; groundTex.repeat.set(3, 3);
    var ground = new THREE.Mesh(new THREE.SphereGeometry(60, 96, 48), new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 }));
    ground.position.set(0, -61, 0); ground.rotation.x = Math.PI / 2; g.add(ground);
    var earth = planet(2.2, PAINT.earthToday()); g.add(earth);
    var ec = new THREE.Mesh(new THREE.SphereGeometry(2.28, 32, 20), new THREE.MeshStandardMaterial({ map: PAINT.clouds(), transparent: true, opacity: 0.8, depthWrite: false })); earth.add(ec);
    var eg = glow(S, 0x8fd0ff, 7, 0.5); g.add(eg);
    var lm = texSprite(landerTex(), 3.6, 3.6, { depthWrite: true }); lm.material.alphaTest = 0.4; lm.position.set(-2.8, 0.75, 0.5); g.add(lm);
    var fl = texSprite(flagTex(), 1.3, 1.95, { depthWrite: true }); fl.material.alphaTest = 0.4; fl.position.set(0.9, -0.05, 1.5); g.add(fl);
    var as = texSprite(astroTex(), 1.1, 1.375, { depthWrite: true }); as.material.alphaTest = 0.4; g.add(as);
    var fpTex = canvasTex(256, 128, function (x) { x.fillStyle = 'rgba(80,76,100,.55)'; for (var i = 0; i < 9; i++) { ell(x, 20 + i * 26, 64 + (i % 2 ? 14 : -14) + Math.sin(i) * 8, 8, 5, 0.2); x.fill(); } });
    var fp = texPlane(fpTex, 3.5, 1.75, { depthWrite: false }); fp.rotation.x = -Math.PI / 2; fp.position.set(0.4, -0.97, 2.4); g.add(fp);
    return { group: g, update: function (t) {
      var k = easeOut(t / 12);
      earth.position.set(6.5, -3 + k * 9.5, -32); earth.rotation.y = t * 0.15; eg.position.copy(earth.position);
      var hop = Math.abs(Math.sin(t * 1.7));
      as.position.set(2.6 + Math.sin(t * 0.35) * 1.4, -0.31 + hop * 0.45, 2.2);
      as.material.rotation = Math.sin(t * 1.7) * 0.06;
    } };
  }

  var BUILD = {
    bigbang: bBigBang, firststars: bFirstStars, galaxy: bGalaxy, nebula: bNebula, sun: bSun, disk: bDisk,
    planets: function (S) { return bPlanets(S, false); }, theia: bTheia, rocks: bRocks, life: bLife, oxygen: bOxygen,
    dinos: bDinos, humans: bHumans, moon: bMoon, today: function (S) { return bPlanets(S, true); }
  };

  /* ------------------------------------------------------------------ */
  /* Fade / dispose helpers                                              */
  /* ------------------------------------------------------------------ */
  function forMats(root, fn) {
    root.traverse(function (o) { if (!o.material) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { fn(m, o); }); });
  }
  function applyFade(root, f) {
    forMats(root, function (m) {
      var u = m.userData;
      if (u.wasT === undefined) u.wasT = m.transparent;
      if (u.base === undefined) u.base = m.opacity;
      m.opacity = u.base * f;
      m.transparent = u.wasT || f < 0.999;
    });
    root.visible = f > 0.002;
  }
  function disposeTree(root, shared) {
    root.traverse(function (o) {
      if (o.geometry && !o.isSprite) o.geometry.dispose();
    });
    forMats(root, function (m) {
      ['map', 'alphaMap', 'emissiveMap'].forEach(function (k) { if (m[k] && !shared.has(m[k])) m[k].dispose(); });
      m.dispose();
    });
  }

  /* ------------------------------------------------------------------ */
  /* open()                                                              */
  /* ------------------------------------------------------------------ */
  var active = null;

  function open(opts) {
    opts = opts || {};
    if (active) active.close(true);
    if (!window.THREE) { if (typeof opts.onClose === 'function') setTimeout(opts.onClose, 0); return; }
    TMPC = new THREE.Color();

    var closed = false, raf = 0, timers = [];
    var idx = Math.max(0, Math.min(CHAPTERS.length - 1, (opts.startAt | 0) || 0));
    var readOn = true, playing = false;

    /* ---- DOM ---- */
    var style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    var root = document.createElement('div'); root.className = 'st-root'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'The Story of Our Solar System');
    var eraFlex = [0, 0, 0, 0]; CHAPTERS.forEach(function (c) { eraFlex[c.era]++; });
    root.innerHTML =
      '<canvas class="st-canvas" aria-hidden="true"></canvas>' +
      '<div class="st-ui">' +
        '<div class="st-upper">' +
          '<div class="st-top">' +
            '<button class="st-pill st-close" type="button">' + ICON.back + '<span>Back to the rocket</span></button>' +
            '<div class="st-toggles">' +
              '<button class="st-pill st-tog st-read" type="button" aria-pressed="true" aria-label="Read to me">' + ICON.speaker + '<span class="st-lbl">Read to me</span></button>' +
              '<button class="st-pill st-tog st-play" type="button" aria-pressed="false" aria-label="Play">' + ICON.play + '<span class="st-lbl">Play</span></button>' +
            '</div>' +
          '</div>' +
          '<div class="st-head" aria-live="polite"><div class="st-kicker"></div><div class="st-when"></div><h2 class="st-title"></h2></div>' +
        '</div>' +
        '<div class="st-bottom">' +
          '<div class="st-panel"><div class="st-leo"><canvas width="160" height="160" aria-hidden="true"></canvas><span>Leo</span></div>' +
            '<div class="st-textwrap"><p class="st-text"></p></div></div>' +
          '<div class="st-end" hidden>The End… for now!</div>' +
          '<div class="st-nav"><button class="st-btn st-back" type="button">' + ICON.back + 'Back</button><button class="st-btn st-next" type="button"><span class="st-next-l">Next</span>' + ICON.next + '</button></div>' +
          '<div class="st-tl"><div class="st-eras">' + ERAS.map(function (e, i) { return '<span style="flex:' + eraFlex[i] + ' 1 0">' + e + '</span>'; }).join('') + '</div>' +
            '<div class="st-track"><div class="st-rail"></div><div class="st-fill"></div>' +
            CHAPTERS.map(function (c, i) { return '<button class="st-dot" type="button" data-i="' + i + '" aria-label="' + (i + 1) + '. ' + c.title + ', ' + c.when + '"></button>'; }).join('') +
            '</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="st-toast" aria-live="polite"></div>';
    document.body.appendChild(root);
    var $ = function (s) { return root.querySelector(s); };
    var canvas = $('.st-canvas'), leoC = $('.st-leo canvas'), textEl = $('.st-text'), endEl = $('.st-end');
    var whenEl = $('.st-when'), titleEl = $('.st-title'), kickEl = $('.st-kicker'), headEl = $('.st-head');
    var backBtn = $('.st-back'), nextBtn = $('.st-next'), nextL = $('.st-next-l'), readBtn = $('.st-read'), playBtn = $('.st-play');
    var dots = Array.prototype.slice.call(root.querySelectorAll('.st-dot')), fillEl = $('.st-fill'), eraEls = root.querySelectorAll('.st-eras span');
    var bottomEl = $('.st-bottom'), topEl = $('.st-top'), toastEl = $('.st-toast');
    // watching the whole story wins a big prize (once per player)
    var PRIZE_LINE = ['leo', 'Well done, Commander! You watched the whole story of our Solar System. Here are fifteen stars, a Galaxy paint for your rocket, and best of all, you can now design your very own planet!'];
    var watched = {}, rewarded = false, nagged = false;
    var prizeEl = document.createElement('div'); prizeEl.className = 'st-prize'; prizeEl.hidden = true;
    prizeEl.innerHTML = '<div class="st-prize-card" role="dialog" aria-label="Prize"><div class="st-prize-big">🪐</div><h3>You watched the whole story!</h3><div class="st-prize-stars">+15 ⭐</div><p>You unlocked <b>Planet Maker</b>: design your very own planet and fly to it!</p><p>Plus a sparkly <b>Galaxy rocket paint</b>.</p><button type="button">Make my planet!</button></div>';
    root.appendChild(prizeEl);
    prizeEl.querySelector('button').addEventListener('click', function () { prizeEl.hidden = true; close(); });
    function maybeReward() {
      if (rewarded || closed || idx !== CHAPTERS.length - 1) return;
      watched[idx] = true;
      var seenN = 0; for (var wi = 0; wi < CHAPTERS.length; wi++) if (watched[wi]) seenN++;
      var all = seenN >= CHAPTERS.length - 2; // a couple of quick taps are fine
      if (!all) { if (!nagged) { nagged = true; toast('Watch every chapter to win the big prize!', 4000); } return; }
      rewarded = true;
      var H = window.GameHooks, ok = false;
      try { ok = !!(H && H.storyComplete && H.storyComplete()); } catch (e) {}
      if (!ok) return;
      sfx('happy'); prizeEl.hidden = false;
      later(function () { if (!closed) speakLeo(fillName(PRIZE_LINE[1])); }, 700);
    }
    drawLeo(leoC, false);

    /* ---- Three ---- */
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); }
    catch (e) { renderer = null; }
    var scene = new THREE.Scene(); scene.background = new THREE.Color(CHAPTERS[idx].bg);
    var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
    var amb = new THREE.AmbientLight(0x8a90c8, 0.62); scene.add(amb);
    var dirL = new THREE.DirectionalLight(0xfff2dd, 0.85); dirL.position.set(6, 6, 9); scene.add(dirL);
    var sunL = new THREE.PointLight(0xfff2dd, 0, 0); scene.add(sunL);
    var shared = new Set();
    var S = { camera: camera, size: { w: 1, h: 1 } };
    S.glowTex = canvasTex(128, 128, function (x, w) {
      var gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,.75)'); gr.addColorStop(0.5, 'rgba(255,255,255,.2)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = gr; x.fillRect(0, 0, w, w);
    });
    S.dotTex = canvasTex(64, 64, function (x, w) {
      var gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = gr; x.fillRect(0, 0, w, w);
    });
    S.raysTex = canvasTex(256, 256, function (x, w) {
      x.translate(w / 2, w / 2);
      for (var i = 0; i < 14; i++) {
        x.rotate(Math.PI * 2 / 14);
        var gr = x.createLinearGradient(0, 0, w / 2, 0); gr.addColorStop(0.15, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = gr; x.beginPath(); x.moveTo(0, -6); x.lineTo(w / 2, i % 2 ? -2 : -4); x.lineTo(w / 2, i % 2 ? 2 : 4); x.lineTo(0, 6); x.fill();
      }
    });
    shared.add(S.glowTex); shared.add(S.dotTex); shared.add(S.raysTex);

    // background stars
    var BG = mkPoints(S, 1600, 0.9, true, 0);
    for (var i = 0; i < 1600; i++) {
      var u = Math.random() * 2 - 1, th = Math.random() * 6.283, s = Math.sqrt(1 - u * u), r = rnd(120, 160);
      BG.pos[i * 3] = s * Math.cos(th) * r; BG.pos[i * 3 + 1] = u * r; BG.pos[i * 3 + 2] = s * Math.sin(th) * r;
      setCol(BG.col, i, pick([0xffffff, 0xffe3c2, 0xbfd8ff, 0xc9c3f0]), rnd(0.4, 1));
    }
    BG.dirty(true); BG.mat.sizeAttenuation = true; scene.add(BG.obj);

    var slides = [];  // { i, inst, fade, target, t }
    var camP = new THREE.Vector3().fromArray(CHAPTERS[idx].cam), camL = new THREE.Vector3().fromArray(CHAPTERS[idx].look);
    var tgtP = new THREE.Vector3(), tgtL = new THREE.Vector3(), bgCol = new THREE.Color(), tmpV = new THREE.Vector3();
    var W = 1, H = 1, viewOff = 0, viewOffTarget = 0, fitTarget = 1, fitCur = 1;

    function measure() {
      W = Math.max(1, root.clientWidth); H = Math.max(1, root.clientHeight);
      S.size.w = W; S.size.h = H;
      if (renderer) { renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(W, H, false); }
      camera.aspect = W / H;
      var topB = topEl.getBoundingClientRect().bottom, botT = bottomEl.getBoundingClientRect().top;
      var yc = (topB + botT) / 2;
      viewOffTarget = Math.max(0, Math.min(H * 0.32, H / 2 - yc));
      var free = Math.max(80, botT - topB);
      var aspectFit = camera.aspect >= 1.25 ? 1 : Math.min(2.4, Math.pow(1.25 / camera.aspect, 0.9));
      var heightFit = Math.max(1, Math.min(1.7, 0.62 / (free / H)));
      fitTarget = Math.max(aspectFit, heightFit);
      camera.setViewOffset(W, H, 0, viewOff, W, H);
    }

    function makeSlide(i) {
      var inst = BUILD[CHAPTERS[i].scene](S);
      var sl = { i: i, inst: inst, fade: 0, target: 1, t: 0 };
      applyFade(inst.group, 0); scene.add(inst.group);
      slides.push(sl); return sl;
    }
    function killSlide(sl) {
      scene.remove(sl.inst.group); disposeTree(sl.inst.group, shared);
      var k = slides.indexOf(sl); if (k >= 0) slides.splice(k, 1);
    }
    function setScene(i) {
      var revive = null;
      slides.forEach(function (sl) { if (sl.i === i && !revive) revive = sl; else sl.target = 0; });
      if (revive) revive.target = 1; else makeSlide(i);
      // keep at most 3 alive
      while (slides.length > 3) { var old = slides.find(function (s) { return s.target === 0; }); if (!old) break; killSlide(old); }
    }

    /* ---- narration ---- */
    var narrId = 0, chapterStart = 0, narrDone = true, advTimer = 0, mouthTimer = 0;
    function later(fn, ms) { var id = setTimeout(function () { var k = timers.indexOf(id); if (k >= 0) timers.splice(k, 1); if (!closed) fn(); }, ms); timers.push(id); return id; }
    function clearAdv() { if (advTimer) { clearTimeout(advTimer); advTimer = 0; } }
    function setTalking(on) {
      root.classList.toggle('st-talking', on);
      clearInterval(mouthTimer); mouthTimer = 0;
      if (on) { var o = false; mouthTimer = setInterval(function () { o = !o; drawLeo(leoC, o); }, 170); }
      else drawLeo(leoC, false);
    }
    function scheduleAdvance(fromNarrationEnd) {
      clearAdv();
      if (!playing || closed) return;
      if (idx >= CHAPTERS.length - 1) { setPlaying(false); return; }
      var elapsed = performance.now() - chapterStart, wait;
      if (readOn && fromNarrationEnd && elapsed > 1500) wait = 2000;
      else wait = Math.max(readOn && narrDone ? 2000 : 3000, 12000 - elapsed);
      advTimer = later(function () { advTimer = 0; if (playing) go(idx + 1); }, wait);
    }
    function narrate() {
      var id = ++narrId; narrDone = false;
      stopSpeaking(); setTalking(false); clearAdv();
      if (!readOn) { narrDone = true; scheduleAdvance(false); return; }
      later(function () {
        if (id !== narrId) return;
        var c = CHAPTERS[idx];
        var txt = fillName(c.text + (idx === CHAPTERS.length - 1 ? ' The End, for now!' : ''));
        setTalking(true);
        speakLeo(txt).then(function () {
          if (closed || id !== narrId) return;
          narrDone = true; setTalking(false); scheduleAdvance(true);
          if (idx === CHAPTERS.length - 1) maybeReward();
        });
      }, 450);
    }

    /* ---- UI state ---- */
    var toastT = 0;
    function toast(msg, ms) { toastEl.textContent = msg; toastEl.classList.add('st-show'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('st-show'); }, ms || 1600); }
    function setPlaying(on) {
      playing = on; playBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
      playBtn.querySelector('.st-lbl').textContent = on ? 'Pause' : 'Play';
      if (!on) clearAdv();
    }
    function render() {
      var c = CHAPTERS[idx], last = idx === CHAPTERS.length - 1;
      kickEl.textContent = 'Chapter ' + (idx + 1) + ' of ' + CHAPTERS.length;
      whenEl.textContent = c.when; titleEl.textContent = c.title; textEl.textContent = fillName(c.text);
      endEl.hidden = !last;
      [headEl, textEl.parentNode, endEl].forEach(function (el) { el.classList.remove('st-fade'); void el.offsetWidth; el.classList.add('st-fade'); });
      backBtn.disabled = idx === 0;
      nextL.textContent = last ? 'Back to the rocket' : 'Next';
      nextBtn.classList.toggle('st-finish', last);
      nextBtn.querySelector('svg').style.display = last ? 'none' : '';
      dots.forEach(function (d, i) { d.classList.toggle('st-cur', i === idx); d.classList.toggle('st-past', i < idx); if (i === idx) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
      fillEl.style.width = ((idx + 0.5) / CHAPTERS.length * 100) + '%';
      Array.prototype.forEach.call(eraEls, function (e, i) { e.classList.toggle('st-era-on', i === c.era); });
      $('.st-panel').scrollTop = 0;
      requestAnimationFrame(function () { if (!closed) measure(); });
    }
    function go(i, silent) {
      if (closed) return;
      i = Math.max(0, Math.min(CHAPTERS.length - 1, i));
      if (i === idx && !silent) return;
      if (performance.now() - chapterStart >= 3500) watched[idx] = true;
      idx = i; chapterStart = performance.now();
      if (i === CHAPTERS.length - 1) { var lastCheck = function (n) { if (closed || idx !== CHAPTERS.length - 1 || rewarded) return; if (!readOn || narrDone || n >= 15) maybeReward(); else later(function () { lastCheck(n + 1); }, 2000); }; later(function () { lastCheck(0); }, 6000); }
      setScene(i); render();
      if (!silent) sfx(i === CHAPTERS.length - 1 ? 'happy' : 'whoosh');
      narrate();
    }

    /* ---- events ---- */
    function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); go(idx + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); go(idx - 1); }
    }
    function onResize() { measure(); }
    function onCtxLost(e) { e.preventDefault(); }
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    canvas.addEventListener('webglcontextlost', onCtxLost);
    $('.st-close').addEventListener('click', function () { close(); });
    backBtn.addEventListener('click', function () { go(idx - 1); });
    nextBtn.addEventListener('click', function () { if (idx === CHAPTERS.length - 1) { if (!rewarded && !nagged) { maybeReward(); if (rewarded) return; } close(); } else go(idx + 1); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(+d.getAttribute('data-i')); }); });
    readBtn.addEventListener('click', function () {
      readOn = !readOn; readBtn.setAttribute('aria-pressed', readOn ? 'true' : 'false');
      toast(readOn ? 'Leo will read to you' : 'Reading aloud is off');
      if (readOn) narrate();
      else { narrId++; stopSpeaking(); setTalking(false); narrDone = true; scheduleAdvance(false); }
    });
    playBtn.addEventListener('click', function () {
      setPlaying(!playing);
      toast(playing ? 'Auto-play is on' : 'Auto-play is paused');
      if (playing) {
        if (idx >= CHAPTERS.length - 1) { setPlaying(false); return; }
        if (!readOn || narrDone) scheduleAdvance(readOn);
      }
    });

    /* ---- loop ---- */
    var lastT = performance.now(), T = 0;
    function frame(now) {
      if (closed) return;
      raf = requestAnimationFrame(frame);
      var dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now; T += dt;
      var c = CHAPTERS[idx];
      // slides
      for (var k = slides.length - 1; k >= 0; k--) {
        var sl = slides[k];
        sl.fade += (sl.target > sl.fade ? 1 : -1) * dt / 0.9; sl.fade = clamp01(sl.fade);
        if (sl.target === 0 && sl.fade <= 0) { killSlide(sl); continue; }
        sl.t += dt;
        try { sl.inst.update(sl.t, dt); } catch (err) { /* keep running */ }
        applyFade(sl.inst.group, ease(sl.fade));
      }
      // camera
      var ck = 1 - Math.exp(-dt * 2.2);
      tgtP.fromArray(c.cam); tgtL.fromArray(c.look);
      camP.lerp(tgtP, ck); camL.lerp(tgtL, ck);
      fitCur += (fitTarget - fitCur) * ck;
      tmpV.copy(camP).sub(camL).multiplyScalar(fitCur).add(camL);
      tmpV.x += Math.sin(T * 0.13) * 0.35; tmpV.y += Math.sin(T * 0.11) * 0.2;
      camera.position.copy(tmpV); camera.lookAt(camL);
      if (Math.abs(viewOffTarget - viewOff) > 0.5) { viewOff += (viewOffTarget - viewOff) * Math.min(1, ck * 2); camera.setViewOffset(W, H, 0, viewOff, W, H); }
      // environment
      bgCol.setHex(c.bg); scene.background.lerp(bgCol, ck);
      BG.mat.opacity += (c.stars * 0.9 - BG.mat.opacity) * ck;
      BG.obj.visible = BG.mat.opacity > 0.01; BG.obj.rotation.y = T * 0.004;
      sunL.intensity += (c.sun - sunL.intensity) * ck;
      dirL.intensity = 0.9 - 0.45 * Math.min(1, sunL.intensity);
      if (renderer) renderer.render(scene, camera);
    }

    function close(silent) {
      if (closed) return; closed = true;
      cancelAnimationFrame(raf);
      narrId++; stopSpeaking(); clearInterval(mouthTimer); clearTimeout(toastT);
      timers.forEach(clearTimeout); timers = []; clearAdv();
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      canvas.removeEventListener('webglcontextlost', onCtxLost);
      slides.slice().forEach(killSlide);
      scene.remove(BG.obj); disposeTree(BG.obj, shared);
      shared.forEach(function (t) { t.dispose(); }); shared.clear();
      if (renderer) { try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) {} }
      if (root.parentNode) root.parentNode.removeChild(root);
      if (style.parentNode) style.parentNode.removeChild(style);
      if (active && active.close === close) active = null;
      if (!silent && typeof opts.onClose === 'function') { try { opts.onClose(); } catch (e) {} }
    }

    active = { close: close };
    measure();
    chapterStart = performance.now();
    setScene(idx); render();
    if (opts._warp) slides.forEach(function (sl) { sl.t = +opts._warp || 0; sl.fade = 1; });
    sfx('chime');
    narrate();
    raf = requestAnimationFrame(frame);
    try { $('.st-next').focus({ preventScroll: true }); } catch (e) {}
    return { close: function () { close(); }, go: function (i) { go(i); } };
  }

  window.Story = { open: open };
})();
