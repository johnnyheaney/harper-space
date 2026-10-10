/* Harper's Space Adventure: Planet Maker.
   Design your very own planet (the reward for watching the whole Story of the Solar System).
   Exposes window.PlanetMaker. Needs global THREE (r128) for build() and open();
   defaultDesign / normalize / paint / facts / land work without it. */
(function () {
  'use strict';
  var T = window.THREE;

  /* ======================================================================
     LINES. Every fixed spoken line lives here as a literal ['who', 'text'] pair.
     "Harper" always means the player (the game swaps names when Oda is captain).
     ====================================================================== */
  var OPEN_LINES = [
    ['leo', 'Well done, Harper! You watched the whole story of the Solar System, so now you can make your very own planet!'],
    ['leo', 'Welcome back to the Planet Maker, Harper!']
  ];
  var CHEER_LINES = [
    ['leo', 'Ooh, great choice!'],
    ['leo', 'That looks amazing!'],
    ['leo', 'What a cool planet!'],
    ['leo', 'Real planets come in lots of colours too!']
  ];
  // Same order as TYPES below.
  var TYPE_LINES = [
    ['harper', 'A rocky planet, like Mars!'],
    ['mum', 'So much water! Perfect for swimming.'],
    ['dad', 'Brrr! Better pack a woolly hat.'],
    ['dad', 'Ooh, hot hot hot!'],
    ['harper', 'A gas giant, just like Jupiter!'],
    ['oda', 'A candy planet! Yum yum!'],
    ['oda', 'I hope there are monkeys!']
  ];
  // Same order as FEATURE_KEYS below.
  var FEATURE_LINES = [
    ['oda', 'I love the face!'],
    ['harper', 'Rings, just like Saturn!'],
    ['oda', 'A rainbow! My favourite!'],
    ['oda', 'Moons! I want to visit them all!'],
    ['harper', 'A heart, just like Pluto!'],
    ['mum', 'Ooh, fluffy clouds!'],
    ['harper', 'It glows like a night light!']
  ];
  var FEATURE_KEYS = ['face', 'rings', 'rainbow', 'moons', 'heart', 'clouds', 'glow'];
  var SURPRISE_LINES = [
    ['oda', 'Again! Again!'],
    ['harper', 'Whoa, what a surprise!'],
    ['dad', 'Ha! I did not see that coming!']
  ];
  var NAME_LINES = [
    ['oda', 'That is a silly name!'],
    ['harper', 'Ha ha, I love that name!']
  ];
  var SAVE_LINES = [
    ['dad', 'Best planet in the universe!'],
    ['mum', 'What a beautiful planet. Well done, Harper!'],
    ['leo', 'Brilliant work, Harper! Your planet is now part of our Solar System.']
  ];
  // Landing notes (land().note). Same order as TYPES.
  var LAND_NOTES = [
    ['leo', 'Rocky ground under your boots! Look out for craters as you explore.'],
    ['leo', 'You landed on a little island! Splash in the shallow water, but do not swim too far.'],
    ['leo', 'Everything is frozen! Walk carefully, it is super slippery here.'],
    ['leo', 'Hot lava everywhere! Your magic spacesuit keeps you cool, but stay on the dark rock.'],
    ['leo', 'This is a gas giant, so there is no ground to stand on! Your rocket floats above the colourful clouds.'],
    ['leo', 'The ground is made of candy! Please do not lick the planet.'],
    ['leo', 'Tall trees and twisty rivers everywhere! Listen out for jungle animals.']
  ];

  /* ------------------------------------------------------------------ data */
  var TAU = Math.PI * 2;
  var MAX_NAME = 18, MAX_MOON_NAME = 14, MAX_MAKER = 16;

  var PALETTE = ['#ff4d6d', '#ff7a45', '#ffd166', '#7ed957', '#2fa36b', '#5fe0c8',
    '#3fc1ff', '#2f6bff', '#2b2f9a', '#8f5bff', '#d38cff', '#ff6fa8',
    '#ffb3d1', '#e8c9a8', '#a0643c', '#9aa0b5', '#fdf8ff', '#2a2440'];
  var PALETTE_NAMES = ['Red', 'Orange', 'Yellow', 'Green', 'Leafy green', 'Teal',
    'Sky blue', 'Blue', 'Deep blue', 'Purple', 'Lilac', 'Pink',
    'Candy pink', 'Pluto beige', 'Brown', 'Grey', 'White', 'Midnight'];
  var COLOUR_WORDS = ['red', 'orange', 'yellow', 'green', 'leafy green', 'teal',
    'sky blue', 'blue', 'deep blue', 'purple', 'lilac', 'pink',
    'candy pink', 'creamy Pluto', 'brown', 'silvery grey', 'snowy white', 'midnight'];

  var TYPES = ['rocky', 'ocean', 'ice', 'lava', 'gas', 'candy', 'jungle'];
  var TYPE_INFO = {
    rocky: { label: 'Rocky', color: '#a0643c', color2: '#e8c9a8', pattern: 'craters', atmo: '#f0b48a', word: 'rocky', rings: 'dusty rock',
      temp: 'about 20 °C', fun: 'Its rocky ground is covered in craters and pebbles.' },
    ocean: { label: 'Ocean', color: '#2f6bff', color2: '#7ed957', pattern: 'continents', atmo: '#7fc8ff', word: 'ocean', rings: 'sparkly ice',
      temp: 'about 18 °C', fun: 'Its oceans are so deep, a whale could dive all day.' },
    ice: { label: 'Ice', color: '#fdf8ff', color2: '#3fc1ff', pattern: 'plain', atmo: '#cfe8ff', word: 'icy', rings: 'glittery ice',
      temp: 'about -80 °C', fun: 'It is so cold that even the snowflakes shiver.' },
    lava: { label: 'Lava', color: '#ff7a45', color2: '#2a2440', pattern: 'plain', atmo: '#ff9a5a', word: 'fiery lava', rings: 'glowing rock dust',
      temp: 'about 450 °C', fun: 'Its lava rivers glow orange in the dark.' },
    gas: { label: 'Gas giant', color: '#ffd166', color2: '#ff7a45', pattern: 'plain', atmo: '#ffe2a8', word: 'giant gas', rings: 'ice and dust',
      temp: 'about -140 °C', fun: 'It has no ground at all, just swirly clouds all the way down.' },
    candy: { label: 'Candy', color: '#ffb3d1', color2: '#5fe0c8', pattern: 'swirls', atmo: '#ffc6e0', word: 'sweet candy', rings: 'sugar crystals',
      temp: 'about 22 °C, perfect for not melting', fun: 'Its mountains are made of sugar and its rivers are fizzy pop.' },
    jungle: { label: 'Jungle', color: '#2fa36b', color2: '#3fc1ff', pattern: 'plain', atmo: '#9fe0b0', word: 'leafy jungle', rings: 'seeds and leaves',
      temp: 'about 30 °C', fun: 'Its jungles are full of giant leafy trees.' }
  };
  var PATTERNS = ['plain', 'craters', 'swirls', 'stripes', 'spots', 'continents', 'sparkles', 'heart'];
  var PATTERN_LABELS = { plain: 'Plain', craters: 'Craters', swirls: 'Swirls', stripes: 'Stripes', spots: 'Spots', continents: 'Lands', sparkles: 'Sparkles', heart: 'Heart' };
  var SIZES = ['small', 'medium', 'big'];
  var SIZE_LABELS = { small: 'Small', medium: 'Medium', big: 'Big' };
  var SIZE_SCALE = { small: 0.72, medium: 1, big: 1.32 };
  var SIZE_G = { small: 0.4, medium: 0.9, big: 1.6 };
  var RINGS = ['none', 'thin', 'wide', 'rainbow'];
  var RING_LABELS = { none: 'None', thin: 'Thin', wide: 'Wide', rainbow: 'Rainbow' };
  var RING_RADII = { thin: [1.42, 1.62], wide: [1.28, 2.15], rainbow: [1.3, 2.0] };
  var RAINBOW = ['#ff4d6d', '#ff7a45', '#ffd166', '#7ed957', '#3fc1ff', '#2f6bff', '#8f5bff'];

  var MOON_NAMES = ['Biscuit', 'Sprinkle', 'Pebble', 'Bubbles', 'Noodle', 'Muffin', 'Pip', 'Button', 'Twinkle',
    'Jellybean', 'Waffle', 'Pickle', 'Pudding', 'Nugget', 'Snowball', 'Doughnut', 'Cupcake', 'Pancake', 'Squish',
    'Zoomer', 'Peanut', 'Fizz', 'Gizmo', 'Dot', 'Wiggles', 'Cosmo', 'Teacup', 'Jelly Bean', 'Mini Pluto', 'Little Charon',
    'Marshmallow', 'Sparky', 'Nibbles', 'Pom Pom', 'Toffee', 'Bloop', 'Custard', 'Sock', 'Bonbon', 'Moonpie'];
  var SILLY_A = ['Wobble', 'Giggle', 'Sparkle', 'Bubble', 'Noodle', 'Zoom', 'Fizzy', 'Snuggle', 'Jelly', 'Twinkle',
    'Wiggle', 'Bouncy', 'Cosmic', 'Fluffy', 'Sprinkle', 'Doodle', 'Squishy', 'Zippy', 'Biscuit', 'Rainbow',
    'Marble', 'Puddle', 'Pickle', 'Glitter', 'Snoozy', 'Custard', 'Bonkers', 'Mega', 'Tickle', 'Pudding'];
  var SILLY_B = ['World', 'Land', 'Ball', 'Star', 'Planet', 'Puff', 'Island', 'Town', 'Prime', 'Blob', 'Swirl', 'Zone', 'Bean', 'Bubble', 'Dome', 'Rock'];

  /* --------------------------------------------------------------- helpers */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function hexOk(c) { return typeof c === 'string' && /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(c); }
  function normHex(c) {
    var h = c.replace('#', '').toLowerCase();
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return '#' + h;
  }
  function rgb(hex) { var n = parseInt(normHex(hex).slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function hex(c) { return '#' + c.map(function (v) { v = Math.round(clamp(v, 0, 255)); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function sh(a, k) { return k <= 1 ? [a[0] * k, a[1] * k, a[2] * k] : mix3(a, [255, 255, 255], Math.min(1, k - 1)); }
  function shHex(h, k) { return hex(sh(rgb(h), k)); }
  function mixHex(a, b, t) { return hex(mix3(rgb(a), rgb(b), t)); }
  function lum(h) { var c = rgb(h); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function cdist(a, b) { var x = rgb(a), y = rgb(b); return Math.sqrt(Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2)); }
  function rgba(h, a) { var c = rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function hook(fn, a, b) { try { var H = window.GameHooks; if (H && typeof H[fn] === 'function') return H[fn](a, b); } catch (e) { /* ignore */ } return undefined; }
  function fillName(t) { var r = hook('fill', t); return typeof r === 'string' ? r : t; }
  function mulberry32(a) {
    a = a >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pickR(rnd, arr) { return arr[Math.floor(rnd() * arr.length) % arr.length]; }
  function chars(s) { return Array.from ? Array.from(s) : String(s).split(''); }
  // Light cleaning used while typing (keeps a trailing space so words can be typed).
  function cleanInput(s, max) {
    s = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>{}\\]/g, '').replace(/\s+/g, ' ').replace(/^\s+/, '');
    return chars(s).slice(0, max).join('');
  }
  function cleanText(s, max) { return cleanInput(s, max).trim(); }
  function colourIndex(h) {
    var best = 0, bd = 1e9;
    for (var i = 0; i < PALETTE.length; i++) { var dd = cdist(h, PALETTE[i]); if (dd < bd) { bd = dd; best = i; } }
    return best;
  }
  function colourWord(h) { return COLOUR_WORDS[colourIndex(h)]; }
  function mkCanvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function newSeed() { return 1 + Math.floor(Math.random() * 2147483000); }
  function toSeed(v) { v = Math.floor(+v); return isFinite(v) && v >= 1 && v < 2147483647 ? v : 0; }

  function sillyName(rnd) {
    rnd = rnd || Math.random;
    for (var tries = 0; tries < 30; tries++) {
      var a = pickR(rnd, SILLY_A), b = pickR(rnd, SILLY_B), f = Math.floor(rnd() * 6), s;
      if (f === 0) s = 'Planet ' + a;
      else if (f === 1) s = a + ' ' + b;
      else if (f === 2) s = (/e$/.test(a) ? a.slice(0, -1) : a) + 'topia';
      else if (f === 3) s = a + '-' + (2 + Math.floor(rnd() * 98));
      else if (f === 4) s = pickR(rnd, ['Super ', 'Little ', 'Big ', 'Mega ', 'Teeny ']) + a;
      else s = (/e$/.test(a) ? a.slice(0, -1) : a) + pickR(rnd, ['saurus', 'ville', 'tron', 'ington']);
      if (s.length <= MAX_NAME) return s;
    }
    return 'Planet Wobble';
  }
  function rollMoonNames(rnd, keep) {
    rnd = rnd || Math.random;
    var out = [], used = {};
    (keep || []).forEach(function (n) { if (n) used[n.toLowerCase()] = 1; });
    for (var i = 0; i < 4; i++) {
      var n = keep && keep[i];
      if (!n) {
        for (var t = 0; t < 40; t++) { n = pickR(rnd, MOON_NAMES); if (!used[n.toLowerCase()]) break; }
        used[n.toLowerCase()] = 1;
      }
      out.push(n);
    }
    return out;
  }

  /* ---------------------------------------------------- design + normalize */
  var BASE = {
    type: 'rocky', color: '#e8c9a8', color2: '#fdf8ff', pattern: 'heart', clouds: false, glow: true, face: false,
    size: 'medium', rings: 'thin', ringColor: '#ffb3d1', moons: 1, moonColor: '#9aa0b5', seed: 271828
  };

  function normalize(src) {
    var d = src && typeof src === 'object' ? src : {};
    var type = TYPES.indexOf(d.type) >= 0 ? d.type : BASE.type;
    var P = TYPE_INFO[type], fromType = d.type === type && TYPES.indexOf(d.type) >= 0 && type !== BASE.type;
    var maker = cleanText(d.maker, MAX_MAKER);
    var seed = toSeed(d.seed) || BASE.seed;
    var name = cleanText(d.name, MAX_NAME) || (maker ? cleanText('Planet ' + maker, MAX_NAME) : 'My Planet');
    var col = function (v, fb) { return hexOk(v) ? normHex(v) : fb; };
    var bool = function (v, fb) { return typeof v === 'boolean' ? v : v == null ? fb : !!v; };
    var moons = Math.round(+d.moons);
    if (!isFinite(moons)) moons = d.moons == null ? BASE.moons : 0;
    var names = Array.isArray(d.moonNames) ? d.moonNames.slice(0, 4).map(function (n) { return cleanText(n, MAX_MOON_NAME); }) : [];
    return {
      v: 1,
      name: name,
      maker: maker,
      type: type,
      color: col(d.color, fromType ? P.color : BASE.color),
      color2: col(d.color2, fromType ? P.color2 : BASE.color2),
      pattern: PATTERNS.indexOf(d.pattern) >= 0 ? d.pattern : (fromType ? P.pattern : BASE.pattern),
      clouds: bool(d.clouds, BASE.clouds),
      glow: bool(d.glow, BASE.glow),
      face: bool(d.face, BASE.face),
      size: SIZES.indexOf(d.size) >= 0 ? d.size : BASE.size,
      rings: RINGS.indexOf(d.rings) >= 0 ? d.rings : BASE.rings,
      ringColor: col(d.ringColor, BASE.ringColor),
      moons: clamp(moons, 0, 4),
      moonColor: col(d.moonColor, BASE.moonColor),
      moonNames: rollMoonNames(mulberry32(seed * 7 + 3), names),
      seed: seed
    };
  }

  function defaultDesign(captainName) {
    var cap = cleanText(captainName, MAX_MAKER) || 'Harper';
    var d = {};
    for (var k in BASE) d[k] = BASE[k];
    d.name = 'Planet ' + cap;
    d.maker = cap;
    d.moonNames = ['Mini Pluto', 'Biscuit', 'Sprinkle', 'Pebble'];
    return normalize(d);
  }

  function dayHours(d) { return 5 + (d.seed % 31); }

  /* ----------------------------------------------------------------- noise */
  function hash3(x, y, z, s) {
    var h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440662683) ^ Math.imul(s, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vnoise(x, y, z, s) {
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = x - xi, yf = y - yi, zf = z - zi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    var a = hash3(xi, yi, zi, s), b = hash3(xi + 1, yi, zi, s), c = hash3(xi, yi + 1, zi, s), dd = hash3(xi + 1, yi + 1, zi, s);
    var e = hash3(xi, yi, zi + 1, s), f = hash3(xi + 1, yi, zi + 1, s), g = hash3(xi, yi + 1, zi + 1, s), h = hash3(xi + 1, yi + 1, zi + 1, s);
    var x1 = a + (b - a) * u, x2 = c + (dd - c) * u, x3 = e + (f - e) * u, x4 = g + (h - g) * u;
    var y1 = x1 + (x2 - x1) * v, y2 = x3 + (x4 - x3) * v;
    return y1 + (y2 - y1) * w;
  }
  function fbm(x, y, z, s, oct) {
    var sum = 0, amp = 1, f = 1, norm = 0;
    for (var i = 0; i < oct; i++) { sum += amp * vnoise(x * f, y * f, z * f, s + i * 31); norm += amp; amp *= 0.5; f *= 2.03; }
    return sum / norm;
  }
  // Two noise fields sampled on the sphere (no seam, no pole pinching), cached per seed.
  var FW = 512, FH = 256, fieldCache = [];
  function field(seed) {
    for (var q = 0; q < fieldCache.length; q++) if (fieldCache[q].seed === seed) return fieldCache[q];
    var n = new Float32Array(FW * FH), m = new Float32Array(FW * FH);
    var s1 = seed % 100003, s2 = (seed * 7 + 11) % 100019;
    var rnd = mulberry32(seed), ox = rnd() * 50, oy = rnd() * 50, oz = rnd() * 50;
    var nmin = 9, nmax = -9, mmin = 9, mmax = -9, i, j;
    for (j = 0; j < FH; j++) {
      var lat = (0.5 - (j + 0.5) / FH) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
      for (i = 0; i < FW; i++) {
        var lon = (i + 0.5) / FW * TAU, x = cl * Math.cos(lon), z = cl * Math.sin(lon), k = j * FW + i;
        var a = fbm(x * 2.1 + ox, sl * 2.1 + oy, z * 2.1 + oz, s1, 5);
        var b = fbm(x * 1.7 - oz, sl * 1.7 + ox, z * 1.7 - oy, s2, 4);
        n[k] = a; m[k] = b;
        if (a < nmin) nmin = a; if (a > nmax) nmax = a; if (b < mmin) mmin = b; if (b > mmax) mmax = b;
      }
    }
    var dn = 1 / Math.max(1e-6, nmax - nmin), dm = 1 / Math.max(1e-6, mmax - mmin);
    for (i = 0; i < n.length; i++) { n[i] = (n[i] - nmin) * dn; m[i] = (m[i] - mmin) * dm; }
    var F = { seed: seed, w: FW, h: FH, n: n, m: m };
    fieldCache.unshift(F); if (fieldCache.length > 4) fieldCache.pop();
    return F;
  }
  function grain(i, j) { var h = Math.imul(i, 73856093) ^ Math.imul(j, 19349663); h = Math.imul(h ^ (h >>> 15), 2246822519); return ((h >>> 0) / 4294967296) - 0.5; }

  /* ------------------------------------------------------ surface painting */
  function patternHex(d) {
    if (cdist(d.color, d.color2) > 60) return d.color2;
    return lum(d.color) > 0.55 ? shHex(d.color, 0.55) : shHex(d.color, 1.5);
  }

  // Raster pass: the base look of each planet type (+ continents). Returns {cv, glow}.
  function rasterBase(d, rw, rh, wantGlow) {
    var F = field(d.seed);
    var cv = mkCanvas(rw, rh), cx = cv.getContext('2d'), img = cx.createImageData(rw, rh), px = img.data;
    var gcv = null, gimg = null, gpx = null;
    if (wantGlow) { gcv = mkCanvas(rw, rh); gimg = gcv.getContext('2d').createImageData(rw, rh); gpx = gimg.data; }
    var A = rgb(d.color), B = rgb(d.color2), C = rgb(patternHex(d)), W = [255, 255, 255];
    var type = d.type, cont = d.pattern === 'continents', face = d.face;
    var deep = sh(A, 0.6), shallow = sh(A, 1.18), aLo = sh(A, 0.7), aHi = sh(A, 1.16);
    var hot = mix3(A, [255, 244, 180], 0.65), pastel = sh(A, 1.22), Bl = sh(B, 1.12), iceLo = sh(A, 0.96), iceHi = sh(A, 1.3);
    for (var j = 0; j < rh; j++) {
      var fj = Math.min(FH - 1, Math.floor((j + 0.5) * FH / rh));
      var lat = (0.5 - (j + 0.5) / rh) * Math.PI, alat = Math.abs(lat);
      for (var i = 0; i < rw; i++) {
        var fi = Math.min(FW - 1, Math.floor((i + 0.5) * FW / rw)), k = fj * FW + fi;
        var n = F.n[k], m = F.m[k], lon = (i + 0.5) / rw * TAU, c, glow = 0, gr = grain(i, j), t, r;
        if (type === 'rocky') {
          c = mix3(aLo, aHi, smooth(0.2, 0.8, n));
          c = mix3(c, sh(B, 0.85 + 0.3 * n), smooth(0.6, 0.68, m) * 0.7);
          c = sh(c, 1 + gr * 0.12);
        } else if (type === 'ocean') {
          c = mix3(deep, shallow, smooth(0.25, 0.68, n));
          c = mix3(c, sh(B, 1.4), smooth(0.69, 0.71, n));
          c = mix3(c, sh(B, 0.85 + 0.35 * m), smooth(0.715, 0.735, n));
        } else if (type === 'ice') {
          c = mix3(iceLo, iceHi, smooth(0.3, 0.75, n));
          c = mix3(c, Bl, smooth(0.58, 0.8, m) * 0.5);
          r = 1 - Math.abs(2 * m - 1);
          c = mix3(c, sh(B, 0.75), smooth(0.955, 0.99, r) * 0.75);
          c = mix3(c, W, smooth(0.95, 1.15, alat) * 0.85);
          c = sh(c, 1 + gr * 0.05);
        } else if (type === 'lava') {
          r = 1 - Math.abs(2 * n - 1);
          var L = Math.max(smooth(0.74, 0.86, r), smooth(0.6, 0.66, m));
          var crust = sh(B, 0.75 + 0.55 * smooth(0.2, 0.9, m) + gr * 0.15);
          crust = mix3(crust, sh(A, 0.55), smooth(0.55, 0.74, r) * 0.45);
          var lav = mix3(A, hot, smooth(0.9, 1, r) * 0.8 + smooth(0.66, 0.75, m) * 0.4);
          c = mix3(crust, lav, L);
          glow = L;
        } else if (type === 'gas') {
          var y = lat / (Math.PI / 2), wp = (n - 0.5) * 0.3 + (m - 0.5) * 0.12;
          var bnd = y * 7.5 + wp * 3.2;
          var s1 = 0.5 + 0.5 * Math.sin(bnd * Math.PI), s2 = 0.5 + 0.5 * Math.sin(bnd * 2.3 * Math.PI + 1.7);
          c = mix3(A, B, smooth(0.3, 0.7, s1));
          c = sh(c, 0.86 + 0.3 * s2);
          c = sh(c, 1 - 0.28 * smooth(0.65, 1, Math.abs(y)));
        } else if (type === 'candy') {
          c = mix3(pastel, sh(A, 1.05), smooth(0.3, 0.7, n));
          var sv = Math.sin(lon * 4 + lat * 6 + (n - 0.5) * 5);
          c = mix3(c, Bl, smooth(0.72, 0.8, sv) * 0.85);
          c = mix3(c, W, (smooth(0.8, 0.84, sv) - smooth(0.9, 0.95, sv)) * 0.6);
        } else { // jungle
          c = mix3(sh(A, 0.6), sh(A, 1.12), smooth(0.25, 0.75, n));
          c = mix3(c, sh(A, 0.48), smooth(0.55, 0.72, m) * 0.55);
          c = sh(c, 1 + gr * 0.18);
          r = 1 - Math.abs(2 * n - 1);
          var water = Math.max(smooth(0.965, 0.988, r) * smooth(1.25, 1.0, alat), smooth(0.2, 0.15, n));
          c = mix3(c, sh(B, 0.85 + 0.3 * m), water);
        }
        if (cont) {
          var land = smooth(0.56, 0.585, m);
          var coast = (smooth(0.52, 0.56, m) - land) * 0.4;
          c = mix3(c, sh(c, 1.5), Math.max(0, coast));
          c = mix3(c, sh(C, 0.8 + 0.35 * n + gr * 0.1), land);
          if (type === 'lava') glow *= 1 - land;
        }
        var o = (j * rw + i) * 4;
        px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; px[o + 3] = 255;
        if (gpx) {
          var gl = glow * glow;
          if (face) { // keep the sticker face from glowing through
            var dl = Math.abs(lon - TAU * 0.25);
            gl *= 1 - smooth(0.8, 0.55, dl) * smooth(0.55, 0.38, alat + (lat < 0 ? 0.05 : 0));
          }
          gpx[o] = c[0] * (0.2 + 0.5 * gl); gpx[o + 1] = c[1] * (0.2 + 0.45 * gl); gpx[o + 2] = c[2] * (0.2 + 0.3 * gl); gpx[o + 3] = 255;
        }
      }
    }
    cx.putImageData(img, 0, 0);
    if (gcv) gcv.getContext('2d').putImageData(gimg, 0, 0);
    return { cv: cv, glow: gcv };
  }

  // Draw something "round on the sphere" at pixel (x, y): stretch horizontally by 1/cos(lat) and wrap at the seam.
  function onSphere(ctx, w, h, x, y, rpx, fn) {
    var lat = (0.5 - y / h) * Math.PI, sx = 1 / Math.max(0.22, Math.cos(lat)), half = rpx * sx * 1.3;
    [-w, 0, w].forEach(function (off) {
      var X = x + off;
      if (X + half < 0 || X - half > w) return;
      ctx.save(); ctx.translate(X, y); ctx.scale(sx, 1); fn(ctx); ctx.restore();
    });
  }
  function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); }
  function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); }
  function heartPath(c, x, y, s) {
    y -= s * 0.05;
    c.beginPath();
    c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.35, y + s * 0.1, x - s * 0.95, y - s * 1.05, x, y - s * 0.45);
    c.bezierCurveTo(x + s * 0.95, y - s * 1.05, x + s * 1.35, y + s * 0.1, x, y + s * 0.9);
    c.closePath();
  }
  function star4(c, x, y, r) {
    c.beginPath();
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath();
  }
  function rrect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  // random point away from the poles: returns [x, y] in pixels
  function spot(rnd, w, h, maxLat) { var lat = (rnd() * 2 - 1) * (maxLat || 1.1); return [rnd() * w, (0.5 - lat / Math.PI) * h]; }

  function typeExtras(d, ctx, w, h, rnd) {
    var i, p;
    if (d.type === 'gas') {
      // the big storm
      var sx = (0.25 + 0.35 + rnd() * 0.3) % 1 * w, sy = h * (0.5 + 0.12 + rnd() * 0.06), sr = h * 0.075, B = d.color2;
      onSphere(ctx, w, h, sx, sy, sr * 1.7, function (c) {
        ell(c, 0, 0, sr * 1.7, sr, 0); c.fillStyle = rgba(shHex(B, 0.7), 0.9); c.fill();
        ell(c, 0, 0, sr * 1.3, sr * 0.72, 0); c.fillStyle = rgba(B, 0.95); c.fill();
        ell(c, -sr * 0.15, -sr * 0.1, sr * 0.75, sr * 0.38, 0); c.fillStyle = rgba(shHex(B, 1.35), 0.9); c.fill();
      });
      for (i = 0; i < 6; i++) {
        p = spot(rnd, w, h, 1.0); var r0 = h * (0.012 + rnd() * 0.012);
        onSphere(ctx, w, h, p[0], p[1], r0 * 2, function (c) { ell(c, 0, 0, r0 * 2, r0, 0); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); });
      }
    } else if (d.type === 'candy') {
      var cols = ['#ff4d6d', '#ffd166', '#5fe0c8', '#3fc1ff', '#8f5bff', '#fdf8ff', '#7ed957', '#ff7a45'];
      for (i = 0; i < 170; i++) {
        p = spot(rnd, w, h, 1.25);
        var L = h * 0.022, Wd = h * 0.0075, rot = rnd() * Math.PI, col = pickR(rnd, cols);
        onSphere(ctx, w, h, p[0], p[1], L, function (c) {
          c.rotate(rot); rrect(c, -L / 2, -Wd / 2, L, Wd, Wd / 2); c.fillStyle = col; c.fill();
          c.fillStyle = 'rgba(255,255,255,.45)'; rrect(c, -L / 2 + Wd * 0.4, -Wd / 2 + Wd * 0.15, L - Wd * 0.8, Wd * 0.3, Wd * 0.15); c.fill();
        });
      }
    } else if (d.type === 'ice') {
      for (i = 0; i < 50; i++) {
        p = spot(rnd, w, h, 1.3); var rs = h * (0.006 + rnd() * 0.01);
        onSphere(ctx, w, h, p[0], p[1], rs, function (c) { star4(c, 0, 0, rs); c.fillStyle = 'rgba(255,255,255,.9)'; c.fill(); });
      }
    } else if (d.type === 'jungle') {
      var dark = shHex(d.color, 0.45), mid = shHex(d.color, 0.75);
      for (i = 0; i < 130; i++) {
        p = spot(rnd, w, h, 1.15); var rt = h * (0.006 + rnd() * 0.008);
        onSphere(ctx, w, h, p[0], p[1], rt * 3, function (c) {
          c.fillStyle = rgba(dark, 0.55); circ(c, 0, rt * 0.3, rt * 1.1); c.fill(); circ(c, rt * 1.4, rt * 0.6, rt * 0.9); c.fill();
          c.fillStyle = rgba(mid, 0.7); circ(c, -rt * 0.2, -rt * 0.2, rt * 0.75); c.fill();
        });
      }
    } else if (d.type === 'lava') {
      for (i = 0; i < 40; i++) {
        p = spot(rnd, w, h, 1.2); var re = h * (0.003 + rnd() * 0.004);
        onSphere(ctx, w, h, p[0], p[1], re, function (c) { circ(c, 0, 0, re); c.fillStyle = 'rgba(255,236,160,.8)'; c.fill(); });
      }
    }
  }

  function patternOverlay(d, ctx, w, h, rnd) {
    var C = patternHex(d), Cl = shHex(C, 1.35), Cd = shHex(C, 0.7), i, p, pat = d.pattern;
    // keep the face clear: nudge things that would land on it round the planet
    var fx = 0.25 * w, fy = h / 2, fr = h * 0.2;
    function clear(q, r) {
      if (!d.face) return q;
      var dx = Math.abs(q[0] - fx); dx = Math.min(dx, w - dx);
      if (dx < fr * 1.3 + r && Math.abs(q[1] - fy) < fr * 0.75 + r) q[0] = (q[0] + w * 0.5) % w;
      return q;
    }
    if (pat === 'craters') {
      for (i = 0; i < 38; i++) {
        p = spot(rnd, w, h, 1.15);
        var r = h * (0.012 + Math.pow(rnd(), 2.2) * 0.06);
        clear(p, r);
        onSphere(ctx, w, h, p[0], p[1], r, function (c) {
          circ(c, 0, 0, r * 1.18); c.fillStyle = 'rgba(255,255,255,.14)'; c.fill();
          circ(c, 0, 0, r); c.fillStyle = 'rgba(20,10,40,.22)'; c.fill();
          circ(c, r * 0.12, r * 0.14, r * 0.82); c.fillStyle = 'rgba(20,10,40,.12)'; c.fill();
          c.beginPath(); c.arc(0, 0, r * 0.92, 0.1 * Math.PI, 0.9 * Math.PI); c.lineWidth = r * 0.16; c.strokeStyle = 'rgba(255,255,255,.28)'; c.stroke();
        });
      }
    } else if (pat === 'spots') {
      for (i = 0; i < 24; i++) {
        p = spot(rnd, w, h, 1.15);
        var rs = h * (0.03 + rnd() * 0.045);
        clear(p, rs);
        onSphere(ctx, w, h, p[0], p[1], rs, function (c) {
          var g = c.createRadialGradient(-rs * 0.3, -rs * 0.3, rs * 0.1, 0, 0, rs);
          g.addColorStop(0, Cl); g.addColorStop(1, C);
          circ(c, 0, 0, rs); c.fillStyle = g; c.fill();
          circ(c, 0, 0, rs); c.lineWidth = rs * 0.1; c.strokeStyle = rgba(Cd, 0.6); c.stroke();
        });
      }
    } else if (pat === 'stripes') {
      var nb = 7;
      for (i = 0; i < nb; i++) {
        var yc = h * (0.16 + 0.68 * i / (nb - 1)) + (rnd() - 0.5) * h * 0.03;
        var th = h * (0.022 + rnd() * 0.028), amp = h * (0.008 + rnd() * 0.02), fq = 2 + Math.floor(rnd() * 4), ph = rnd() * TAU;
        ctx.beginPath();
        var x, steps = 128;
        for (x = 0; x <= steps; x++) { var X = x / steps * w; ctx.lineTo(X, yc - th + amp * Math.sin(fq * TAU * x / steps + ph)); }
        for (x = steps; x >= 0; x--) { var X2 = x / steps * w; ctx.lineTo(X2, yc + th + amp * Math.sin(fq * TAU * x / steps + ph + 0.6)); }
        ctx.closePath(); ctx.fillStyle = rgba(i % 2 ? Cl : C, 0.88); ctx.fill();
      }
    } else if (pat === 'swirls') {
      for (i = 0; i < 13; i++) {
        p = spot(rnd, w, h, 1.0);
        var R = h * (0.04 + rnd() * 0.05), dir = rnd() < 0.5 ? 1 : -1, a0 = rnd() * TAU;
        clear(p, R);
        onSphere(ctx, w, h, p[0], p[1], R, function (c) {
          c.beginPath();
          for (var t = 0; t <= 60; t++) { var a = a0 + dir * t / 60 * 3.4 * Math.PI, rr = R * (1 - t / 72); c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
          c.lineCap = 'round'; c.lineJoin = 'round';
          c.lineWidth = R * 0.26; c.strokeStyle = rgba(C, 0.92); c.stroke();
          c.lineWidth = R * 0.08; c.strokeStyle = 'rgba(255,255,255,.45)'; c.stroke();
        });
      }
    } else if (pat === 'sparkles') {
      var cols = ['#ffffff', '#fff3a8', C, Cl];
      for (i = 0; i < 260; i++) {
        p = spot(rnd, w, h, 1.35); var rd = h * (0.0015 + rnd() * 0.003);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.4 + rnd() * 0.5).toFixed(2) + ')'; circ(ctx, p[0], p[1], rd); ctx.fill();
      }
      for (i = 0; i < 70; i++) {
        p = spot(rnd, w, h, 1.25); var rr2 = h * (0.01 + Math.pow(rnd(), 2) * 0.03), col = pickR(rnd, cols);
        clear(p, rr2);
        onSphere(ctx, w, h, p[0], p[1], rr2 * 1.6, function (c) {
          var g = c.createRadialGradient(0, 0, 0, 0, 0, rr2 * 1.6);
          g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          circ(c, 0, 0, rr2 * 1.6); c.fillStyle = g; c.fill();
          star4(c, 0, 0, rr2); c.fillStyle = col; c.fill();
        });
      }
    } else if (pat === 'heart') {
      var hx = (d.face ? 0.75 : 0.25) * w, hy = h * 0.52, hs = h * 0.2;
      var hc = C, hEdge = lum(C) > 0.6 ? shHex(d.color, 0.62) : shHex(C, 1.45);
      onSphere(ctx, w, h, hx, hy, hs * 1.4, function (c) {
        heartPath(c, 0, 0, hs); c.fillStyle = rgba(hc, 0.95); c.fill();
        c.lineWidth = hs * 0.06; c.strokeStyle = rgba(hEdge, 0.75); c.stroke();
        c.globalAlpha = 0.25; heartPath(c, -hs * 0.1, -hs * 0.06, hs * 0.72); c.fillStyle = '#ffffff'; c.fill(); c.globalAlpha = 1;
      });
      for (i = 0; i < 9; i++) {
        p = spot(rnd, w, h, 1.0);
        if (Math.abs(p[0] - hx) < hs * 1.8 || Math.abs(p[0] - hx) > w - hs * 1.8) p[0] = (p[0] + w / 2) % w;
        if (d.face && Math.abs(p[0] - w * 0.25) < h * 0.25) continue;
        var s = h * (0.02 + rnd() * 0.025), rot = (rnd() - 0.5) * 0.8;
        onSphere(ctx, w, h, p[0], p[1], s * 1.4, function (c) { c.rotate(rot); heartPath(c, 0, 0, s); c.fillStyle = rgba(hc, 0.85); c.fill(); });
      }
    }
  }

  // A cute sticker face centred at longitude u (0.25 faces the camera at rotation 0).
  function drawFace(ctx, w, h, u) {
    var k = h / Math.PI, cx = u * w, cy = h / 2, ink = '#2a1f4a';
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // cheeks
    ctx.fillStyle = 'rgba(255,111,168,.55)';
    ell(ctx, cx - 0.47 * k, cy + 0.1 * k, 0.11 * k, 0.065 * k); ctx.fill();
    ell(ctx, cx + 0.47 * k, cy + 0.1 * k, 0.11 * k, 0.065 * k); ctx.fill();
    [-1, 1].forEach(function (s) {
      var ex = cx + s * 0.26 * k, ey = cy - 0.14 * k;
      ell(ctx, ex, ey, 0.135 * k, 0.175 * k); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.lineWidth = 0.028 * k; ctx.strokeStyle = ink; ctx.stroke();
      ell(ctx, ex + s * 0.012 * k, ey + 0.03 * k, 0.085 * k, 0.115 * k); ctx.fillStyle = ink; ctx.fill();
      circ(ctx, ex - 0.03 * k, ey - 0.02 * k, 0.035 * k); ctx.fillStyle = '#ffffff'; ctx.fill();
      circ(ctx, ex + 0.03 * k, ey + 0.07 * k, 0.016 * k); ctx.fill();
    });
    // open smile with a tongue
    var mx = cx, my = cy + 0.1 * k, mr = 0.2 * k;
    ctx.beginPath(); ctx.moveTo(mx - mr, my); ctx.quadraticCurveTo(mx, my + mr * 1.55, mx + mr, my); ctx.quadraticCurveTo(mx, my + mr * 0.25, mx - mr, my); ctx.closePath();
    ctx.fillStyle = '#4a1d3f'; ctx.fill();
    ctx.save(); ctx.clip();
    ell(ctx, mx, my + mr * 0.85, mr * 0.5, mr * 0.32); ctx.fillStyle = '#ff6f91'; ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(mx - mr, my); ctx.quadraticCurveTo(mx, my + mr * 1.55, mx + mr, my); ctx.quadraticCurveTo(mx, my + mr * 0.25, mx - mr, my); ctx.closePath();
    ctx.lineWidth = 0.03 * k; ctx.strokeStyle = ink; ctx.stroke();
    ctx.restore();
  }

  function paintAll(d, ctx, w, h, wantGlow) {
    var rw = Math.max(16, Math.min(FW, Math.round(w))), rh = Math.max(8, Math.min(FH, Math.round(h)));
    var base = rasterBase(d, rw, rh, wantGlow);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(base.cv, 0, 0, rw, rh, 0, 0, w, h);
    typeExtras(d, ctx, w, h, mulberry32(d.seed ^ 0x2545f491));
    patternOverlay(d, ctx, w, h, mulberry32(d.seed + 1013));
    if (d.face) drawFace(ctx, w, h, 0.25);
    ctx.restore();
    return base.glow;
  }

  /** Paint the planet's equirectangular (2:1) surface texture. Deterministic per design. */
  function paint(design, ctx, w, h) {
    var d = normalize(design);
    w = w || ctx.canvas.width; h = h || ctx.canvas.height;
    paintAll(d, ctx, w, h, false);
  }

  function paintClouds(d, ctx, w, h) {
    var F = field(d.seed), rw = Math.min(FW, w), rh = Math.min(FH, h);
    var cv = mkCanvas(rw, rh), cx = cv.getContext('2d'), img = cx.createImageData(rw, rh), px = img.data;
    var tint = d.type === 'candy' ? sh(rgb(d.color), 1.75) : d.type === 'lava' ? [120, 100, 110] : d.type === 'gas' ? sh(rgb(d.color), 1.6) : [255, 255, 255];
    var off = Math.floor(FW / 3);
    for (var j = 0; j < rh; j++) {
      var fj = Math.min(FH - 1, Math.floor((j + 0.5) * FH / rh)), lat = (0.5 - (j + 0.5) / rh) * Math.PI;
      for (var i = 0; i < rw; i++) {
        var fi = Math.min(FW - 1, Math.floor((i + 0.5) * FW / rw));
        var a = F.n[fj * FW + (fi + off) % FW] * 0.55 + F.m[(FH - 1 - fj) * FW + fi] * 0.45, al;
        if (d.type === 'gas') al = smooth(0.62, 0.9, 0.5 + 0.5 * Math.sin(lat * 18 + (a - 0.5) * 6)) * smooth(0.45, 0.6, a) * 0.8;
        else al = smooth(0.57, 0.74, a) * 0.85 * (1 - 0.5 * smooth(1.1, 1.5, Math.abs(lat)));
        if (d.type === 'lava') al *= 0.6;
        var o = (j * rw + i) * 4;
        px[o] = tint[0]; px[o + 1] = tint[1]; px[o + 2] = tint[2]; px[o + 3] = al * 255;
      }
    }
    cx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(cv, 0, 0, rw, rh, 0, 0, w, h);
  }

  function ringStops(d) {
    // returns function t(0..1) -> [r,g,b,a]
    var base = rgb(d.ringColor), rnd = mulberry32(d.seed + 77), k1 = 20 + rnd() * 20, k2 = 7 + rnd() * 9, p1 = rnd() * 6, p2 = rnd() * 6;
    if (d.rings === 'rainbow') {
      return function (t) {
        var x = t * RAINBOW.length, i = Math.min(RAINBOW.length - 1, Math.floor(x)), f = x - i;
        var c = rgb(RAINBOW[i]), edge = smooth(0, 0.12, f) * smooth(1, 0.88, f);
        return [c[0], c[1], c[2], (0.5 + 0.45 * edge) * smooth(0, 0.03, t) * smooth(1, 0.97, t)];
      };
    }
    if (d.rings === 'thin') {
      return function (t) {
        var c = mix3(base, sh(base, 1.45), smooth(0.3, 0.5, t) * smooth(0.7, 0.5, t));
        return [c[0], c[1], c[2], 0.95 * smooth(0, 0.18, t) * smooth(1, 0.82, t)];
      };
    }
    return function (t) {
      var v = 0.5 + 0.5 * Math.sin(t * k1 + p1) * Math.sin(t * k2 + p2);
      var c = sh(base, 0.75 + 0.6 * v), a = 0.55 + 0.4 * v;
      if (t > 0.6 && t < 0.66) a *= 0.12;
      return [c[0], c[1], c[2], a * smooth(0, 0.06, t) * smooth(1, 0.92, t)];
    };
  }
  function ringCanvas(d) {
    var W = 512, cv = mkCanvas(W, 4), cx = cv.getContext('2d'), img = cx.createImageData(W, 4), f = ringStops(d);
    for (var i = 0; i < W; i++) {
      var c = f(i / (W - 1));
      for (var j = 0; j < 4; j++) { var o = (j * W + i) * 4; img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = c[3] * 255; }
    }
    cx.putImageData(img, 0, 0);
    return cv;
  }

  function moonCanvas(d, idx) {
    var w = 256, h = 128, cv = mkCanvas(w, h), c = cv.getContext('2d'), rnd = mulberry32(d.seed * 13 + idx * 101 + 5);
    var base = [1, 0.85, 1.2, 0.92][idx] || 1, col = shHex(d.moonColor, base);
    c.fillStyle = col; c.fillRect(0, 0, w, h);
    var i, p;
    for (i = 0; i < 9; i++) {
      p = spot(rnd, w, h, 1.2); var rb = h * (0.08 + rnd() * 0.12), tone = rnd() < 0.5 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.14)';
      onSphere(c, w, h, p[0], p[1], rb, function (cc) { circ(cc, 0, 0, rb); cc.fillStyle = tone; cc.fill(); });
    }
    for (i = 0; i < 16; i++) {
      p = spot(rnd, w, h, 1.2); var r = h * (0.02 + rnd() * 0.05);
      onSphere(c, w, h, p[0], p[1], r, function (cc) {
        circ(cc, 0, 0, r); cc.fillStyle = 'rgba(20,10,40,.22)'; cc.fill();
        cc.beginPath(); cc.arc(0, 0, r * 0.9, 0.1 * Math.PI, 0.9 * Math.PI); cc.lineWidth = r * 0.2; cc.strokeStyle = 'rgba(255,255,255,.3)'; cc.stroke();
      });
    }
    if (d.face) drawFace(c, w, h, 0.25);
    return cv;
  }

  function glowCanvas() {
    var s = 128, cv = mkCanvas(s, s), c = cv.getContext('2d'), g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    // planet edge sits at radius 1/1.45 of the sprite half-size
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.6)');
    g.addColorStop(0.69, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.78, 'rgba(255,255,255,0.22)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, s, s);
    return cv;
  }
  function atmoColour(d) {
    var P = TYPE_INFO[d.type];
    return mixHex(P.atmo, shHex(d.color, 1.4), d.type === 'gas' ? 0.6 : 0.35);
  }

  /* ----------------------------------------------------------------- build */
  function ringOuter(d) { return d.rings === 'none' ? 1 : RING_RADII[d.rings][1]; }
  function moonOrbit(d, i) { return Math.max(1.6, ringOuter(d) + 0.38) + i * 0.42; }

  /** Build the planet as a THREE.Group (planet radius 1). opts: { texSize: 1024, time: 0 } */
  function build(design, opts) {
    if (!T) throw new Error('PlanetMaker.build needs THREE');
    opts = opts || {};
    var d = normalize(design);
    var texW = clamp(Math.round(opts.texSize || 1024), 64, 2048), texH = texW / 2;
    var group = new T.Group();
    group.name = 'PlanetMaker';
    var geos = [], mats = [], texs = [];
    function own(list, x) { list.push(x); return x; }

    // surface
    var scv = mkCanvas(texW, texH);
    var gcv = paintAll(d, scv.getContext('2d'), texW, texH, d.type === 'lava');
    var map = own(texs, new T.CanvasTexture(scv));
    map.anisotropy = 4;
    var emap = map, eInt = 0.2;
    if (gcv) {
      var gfull = mkCanvas(texW / 2, texH / 2), gctx = gfull.getContext('2d');
      gctx.imageSmoothingEnabled = true; gctx.drawImage(gcv, 0, 0, gfull.width, gfull.height);
      emap = own(texs, new T.CanvasTexture(gfull)); eInt = 1;
    }
    var surfMat = own(mats, new T.MeshLambertMaterial({ map: map, emissive: 0xffffff, emissiveMap: emap, emissiveIntensity: eInt }));
    var surface = new T.Mesh(own(geos, new T.SphereGeometry(1, 72, 48)), surfMat);
    surface.name = 'surface';
    group.add(surface);

    // clouds
    var clouds = null;
    if (d.clouds) {
      var ccv = mkCanvas(1024, 512);
      paintClouds(d, ccv.getContext('2d'), 1024, 512);
      var ctex = own(texs, new T.CanvasTexture(ccv));
      var cmat = own(mats, new T.MeshLambertMaterial({ map: ctex, transparent: true, depthWrite: false, emissive: 0xffffff, emissiveMap: ctex, emissiveIntensity: 0.25 }));
      clouds = new T.Mesh(own(geos, new T.SphereGeometry(1.03, 64, 40)), cmat);
      clouds.name = 'clouds'; clouds.renderOrder = 1;
      group.add(clouds);
    }

    // atmosphere glow
    var glow = null;
    if (d.glow) {
      var gtex = own(texs, new T.CanvasTexture(glowCanvas()));
      var gmat = own(mats, new T.SpriteMaterial({ map: gtex, color: new T.Color(atmoColour(d)), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.85 }));
      glow = new T.Sprite(gmat);
      glow.scale.set(2.9, 2.9, 1);
      glow.name = 'glow'; glow.renderOrder = 3;
      group.add(glow);
    }

    // rings
    var rings = null;
    if (d.rings !== 'none') {
      var rr = RING_RADII[d.rings], rgeo = own(geos, new T.RingGeometry(rr[0], rr[1], 128, 1));
      var pos = rgeo.attributes.position, uv = rgeo.attributes.uv;
      for (var i = 0; i < pos.count; i++) {
        var rad = Math.sqrt(pos.getX(i) * pos.getX(i) + pos.getY(i) * pos.getY(i));
        uv.setXY(i, (rad - rr[0]) / (rr[1] - rr[0]), 0.5);
      }
      uv.needsUpdate = true;
      var rtex = own(texs, new T.CanvasTexture(ringCanvas(d)));
      var rmat = own(mats, new T.MeshLambertMaterial({ map: rtex, transparent: true, side: T.DoubleSide, depthWrite: false, emissive: 0xffffff, emissiveMap: rtex, emissiveIntensity: d.rings === 'rainbow' ? 0.55 : 0.4 }));
      var ringMesh = new T.Mesh(rgeo, rmat);
      ringMesh.rotation.x = -Math.PI / 2; ringMesh.renderOrder = 2;
      rings = new T.Group(); rings.name = 'rings';
      rings.rotation.x = 0.38; rings.rotation.z = -0.22;
      rings.add(ringMesh);
      group.add(rings);
    }

    // moons
    var moons = [], rnd = mulberry32(d.seed + 999), mgeo = d.moons ? own(geos, new T.SphereGeometry(1, 32, 20)) : null;
    for (var mi = 0; mi < d.moons; mi++) {
      var pivot = new T.Group();
      pivot.rotation.x = (rnd() - 0.5) * 0.5; pivot.rotation.z = (rnd() - 0.5) * 0.4;
      var mtex = own(texs, new T.CanvasTexture(moonCanvas(d, mi)));
      var mmat = own(mats, new T.MeshLambertMaterial({ map: mtex, emissive: 0xffffff, emissiveMap: mtex, emissiveIntensity: 0.2 }));
      var moon = new T.Mesh(mgeo, mmat);
      var ms = [0.17, 0.13, 0.2, 0.11][mi];
      moon.scale.setScalar(ms);
      moon.position.x = moonOrbit(d, mi);
      moon.name = 'moon:' + d.moonNames[mi];
      pivot.add(moon); group.add(pivot);
      moons.push({ pivot: pivot, mesh: moon, speed: [0.55, 0.42, 0.32, 0.25][mi] * (rnd() < 0.15 ? -1 : 1), phase: rnd() * TAU, name: d.moonNames[mi] });
    }

    var time = +opts.time || 0, disposed = false;
    function update(dt) {
      if (disposed) return;
      dt = +dt || 0; time += dt;
      if (clouds) clouds.rotation.y += dt * 0.035;
      for (var q = 0; q < moons.length; q++) {
        moons[q].pivot.rotation.y = moons[q].phase + time * moons[q].speed;
        moons[q].mesh.rotation.y = time * 0.3;
      }
    }
    update(0);
    function dispose() {
      if (disposed) return;
      disposed = true;
      geos.forEach(function (g) { g.dispose(); });
      mats.forEach(function (m) { m.dispose(); });
      texs.forEach(function (t) { t.dispose(); });
      if (group.parent) group.parent.remove(group);
    }
    group.userData = {
      planetMaker: true,
      design: d,
      update: update,
      dispose: dispose,
      surface: surface,
      clouds: clouds,
      rings: rings,
      glow: glow,
      moons: moons,
      sizeScale: SIZE_SCALE[d.size],
      outerRadius: d.moons ? moonOrbit(d, d.moons - 1) + 0.2 : ringOuter(d),
      getTime: function () { return time; }
    };
    return group;
  }

  /* ----------------------------------------------------------- facts, land */
  function listAnd(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function facts(design) {
    var d = normalize(design), P = TYPE_INFO[d.type], n = d.name, out = [];
    var aWord = /^[aeiou]/i.test(P.word) ? 'an ' : 'a ';
    out.push(n + ' is ' + aWord + P.word + ' planet' + (d.maker ? ' designed by ' + d.maker + '.' : '.'));
    var mn = d.moonNames.slice(0, d.moons);
    if (d.moons === 0) out.push(n + ' has no moons, so its nights are extra starry.');
    else if (d.moons === 1) out.push(n + ' has 1 moon called ' + mn[0] + '.');
    else out.push(n + ' has ' + d.moons + ' moons: ' + listAnd(mn) + '.');
    if (d.rings === 'rainbow') out.push('Its rings shine in every colour of the rainbow.');
    else if (d.rings === 'thin') out.push('It has a thin ring made of ' + colourWord(d.ringColor) + ' ' + P.rings + '.');
    else if (d.rings === 'wide') out.push('Its wide rings are made of ' + colourWord(d.ringColor) + ' ' + P.rings + '.');
    if (d.face) out.push('It has a happy face that smiles at passing rockets.');
    else if (d.pattern === 'heart') out.push('It has a big heart on it, just like Pluto!');
    else out.push(P.fun);
    out.push('A day here lasts ' + dayHours(d) + ' hours.');
    if (out.length < 5) {
      if (d.type === 'gas') out.push('It is a giant, so lots of other planets could fit inside it.');
      else if (d.size === 'small') out.push('It is a small planet, so you could jump super high here!');
      else if (d.size === 'big') out.push('It is a big planet, so your boots would feel extra heavy!');
      else out.push('It is about the same size as Earth.');
    }
    return out.slice(0, 5);
  }

  function land(design) {
    var d = normalize(design), A = d.color, B = d.color2, ti = TYPES.indexOf(d.type), P = TYPE_INFO[d.type];
    var air = d.glow || d.clouds || ['ocean', 'jungle', 'candy', 'gas', 'lava'].indexOf(d.type) >= 0;
    var ground, ground2;
    switch (d.type) {
      case 'ocean': ground = mixHex(B, '#f2dfae', 0.25); ground2 = A; break;
      case 'ice': ground = shHex(A, 1.45); ground2 = shHex(B, 1.2); break;
      case 'lava': ground = shHex(B, 0.85); ground2 = A; break;
      case 'candy': ground = shHex(A, 1.15); ground2 = B; break;
      case 'rocky': ground = shHex(A, 0.92); ground2 = shHex(B, 0.85); break;
      default: ground = A; ground2 = B;
    }
    if (d.pattern === 'continents' && d.type !== 'ocean') ground2 = patternHex(d);
    return {
      g: SIZE_G[d.size],
      temp: P.temp,
      sky: air ? mixHex(P.atmo, shHex(A, 1.5), 0.3) : '#000000',
      ground: ground,
      ground2: ground2,
      note: LAND_NOTES[ti][1],
      inSky: null,
      gas: d.type === 'gas'
    };
  }

  /* ------------------------------------------------------------- 2D icons */
  // Render a design as a little lit ball into a square canvas.
  function ballIcon(cv, d, opt) {
    opt = opt || {};
    var S = cv.width, tw = 256, th = 128, src = mkCanvas(tw, th);
    paintAll(d, src.getContext('2d'), tw, th, false);
    var sd = src.getContext('2d').getImageData(0, 0, tw, th).data;
    var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, S, S);
    var R = S * (opt.r || 0.42), c0 = S / 2;
    if (d.glow) {
      var g = ctx.createRadialGradient(c0, c0, R * 0.9, c0, c0, R * 1.18);
      g.addColorStop(0, rgba(atmoColour(d), 0.75)); g.addColorStop(1, rgba(atmoColour(d), 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    }
    var out = mkCanvas(S, S), oc = out.getContext('2d'), img = oc.createImageData(S, S), px = img.data;
    var lx = -0.45, ly = 0.55, lz = 0.7, ll = Math.sqrt(lx * lx + ly * ly + lz * lz); lx /= ll; ly /= ll; lz /= ll;
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var dx = (x + 0.5 - c0) / R, dy = (y + 0.5 - c0) / R, r2 = dx * dx + dy * dy;
        if (r2 > 1.05) continue;
        var a = clamp((1 - Math.sqrt(r2)) * R + 0.5, 0, 1);
        var nz = Math.sqrt(Math.max(0, 1 - r2)), nx = dx, ny = -dy;
        var u = Math.atan2(nz, -nx) / TAU; u -= Math.floor(u);
        var v = Math.acos(clamp(ny, -1, 1)) / Math.PI;
        var si = (Math.min(th - 1, Math.floor(v * th)) * tw + Math.min(tw - 1, Math.floor(u * tw))) * 4;
        var lit = 0.42 + 0.72 * Math.max(0, nx * lx + ny * ly + nz * lz);
        var o = (y * S + x) * 4;
        px[o] = Math.min(255, sd[si] * lit); px[o + 1] = Math.min(255, sd[si + 1] * lit); px[o + 2] = Math.min(255, sd[si + 2] * lit); px[o + 3] = a * 255;
      }
    }
    oc.putImageData(img, 0, 0);
    ctx.drawImage(out, 0, 0);
  }

  function ringIcon(cv, d, style) {
    var S = cv.width, ctx = cv.getContext('2d'), c0 = S / 2, R = S * 0.24;
    ctx.clearRect(0, 0, S, S);
    var cols = style === 'rainbow' ? RAINBOW : [d.ringColor];
    function band(front) {
      if (style === 'none') return;
      var rx0 = style === 'thin' ? R * 1.55 : R * 1.45, rx1 = style === 'thin' ? R * 1.72 : R * 2.0, n = style === 'rainbow' ? RAINBOW.length : style === 'wide' ? 4 : 1;
      for (var i = 0; i < n; i++) {
        var rx = rx0 + (rx1 - rx0) * (i + 0.5) / n, lw = (rx1 - rx0) / n * (style === 'wide' ? 0.8 : 1.05) + (style === 'thin' ? 2 : 0);
        ctx.beginPath(); ctx.ellipse(c0, c0, rx, rx * 0.32, -0.25, front ? 0 : Math.PI, front ? Math.PI : TAU);
        ctx.lineWidth = lw; ctx.strokeStyle = style === 'rainbow' ? RAINBOW[i] : style === 'wide' ? shHex(cols[0], 0.8 + 0.15 * i) : cols[0];
        ctx.stroke();
      }
    }
    band(false);
    var g = ctx.createRadialGradient(c0 - R * 0.35, c0 - R * 0.35, R * 0.1, c0, c0, R);
    g.addColorStop(0, shHex(d.color, 1.35)); g.addColorStop(1, shHex(d.color, 0.8));
    circ(ctx, c0, c0, R); ctx.fillStyle = g; ctx.fill();
    band(true);
  }

  /* ------------------------------------------------------------ SVG icons */
  var ICONS = {
    type: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="8.5" fill="currentColor"/><ellipse cx="16" cy="16" rx="14.5" ry="5" fill="none" stroke="currentColor" stroke-width="2.6" transform="rotate(-20 16 16)"/></svg>',
    colours: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3C8.3 3 3 8.6 3 15.2 3 21.8 8.4 28 14.3 28c2.6 0 3-1.7 2.2-3.2-.9-1.7-.2-3.6 2-3.6h3.6C26.1 21.2 29 18.4 29 14.4 29 8 23.3 3 16 3z"/><circle cx="10" cy="14" r="2.4" fill="#ff6fa8"/><circle cx="14.5" cy="8.6" r="2.4" fill="#5fe0c8"/><circle cx="21" cy="9.6" r="2.4" fill="#ffd166"/></svg>',
    pattern: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="11" cy="12" r="3" fill="currentColor"/><circle cx="20" cy="10" r="2" fill="currentColor"/><circle cx="19" cy="20" r="3.6" fill="currentColor"/><circle cx="10.5" cy="21" r="1.8" fill="currentColor"/></svg>',
    extras: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 2l3.2 8.8L28 14l-8.8 3.2L16 26l-3.2-8.8L4 14l8.8-3.2z"/><circle cx="26" cy="26" r="2.6" fill="currentColor"/><circle cx="6" cy="26" r="1.8" fill="currentColor"/></svg>',
    rings: '<svg viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="16" rx="14" ry="6.5" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="16" cy="16" rx="9" ry="3.6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    moons: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M20.5 3.5A12.5 12.5 0 1 0 28.5 22 10 10 0 0 1 20.5 3.5z"/></svg>',
    name: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M22.6 3.6a3 3 0 0 1 4.2 0l1.6 1.6a3 3 0 0 1 0 4.2L12 25.8 5 27l1.2-7z"/><path d="M4 30h24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    dice: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="4" width="24" height="24" rx="6" fill="currentColor"/><g fill="var(--pm-dot,#2a1640)"><circle cx="11" cy="11" r="2.4"/><circle cx="21" cy="11" r="2.4"/><circle cx="16" cy="16" r="2.4"/><circle cx="11" cy="21" r="2.4"/><circle cx="21" cy="21" r="2.4"/></g></svg>',
    clouds: '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#fdf8ff" d="M14 36a8 8 0 0 1-1-15.9A11 11 0 0 1 34 17a8.5 8.5 0 0 1 1 17v2z"/><path fill="#c9d8ff" d="M14 36h21a8.5 8.5 0 0 0 7.8-5.2A8.5 8.5 0 0 1 35 34H14a8 8 0 0 1-7.7-5.9A8 8 0 0 0 14 36z"/></svg>',
    glow: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#ffd166" opacity=".22"/><circle cx="24" cy="24" r="17" fill="#ffd166" opacity=".35"/><circle cx="24" cy="24" r="12.5" fill="#ff9f5a"/><circle cx="20" cy="20" r="4" fill="#ffd9b0" opacity=".8"/></svg>',
    face: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19" fill="#ffd166"/><ellipse cx="17.5" cy="20" rx="3.6" ry="4.6" fill="#2a1f4a"/><ellipse cx="30.5" cy="20" rx="3.6" ry="4.6" fill="#2a1f4a"/><circle cx="16.4" cy="18.6" r="1.3" fill="#fff"/><circle cx="29.4" cy="18.6" r="1.3" fill="#fff"/><path d="M17 28q7 8 14 0" fill="none" stroke="#2a1f4a" stroke-width="2.8" stroke-linecap="round"/><ellipse cx="12" cy="27" rx="3" ry="2" fill="#ff6fa8" opacity=".6"/><ellipse cx="36" cy="27" rx="3" ry="2" fill="#ff6fa8" opacity=".6"/></svg>'
  };

  /* ------------------------------------------------------------- builder */
  var CSS = [
    '.pm-overlay{position:fixed;inset:0;z-index:3000;display:grid;grid-template-columns:100%;grid-template-rows:minmax(200px,40%) minmax(0,1fr);',
    'background:var(--space,#0d0b2e);color:var(--ink,#fdf8ff);font-family:var(--body,"Atkinson Hyperlegible",Verdana,sans-serif);font-size:18px;',
    'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) 0 env(safe-area-inset-left,0px);overflow:hidden;',
    '-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:contain;animation:pm-in .28s ease-out;}',
    '.pm-overlay *,.pm-overlay *::before,.pm-overlay *::after{box-sizing:border-box;}',
    '@keyframes pm-in{from{opacity:0;transform:scale(.98);}}',
    '@media (min-width:720px) and (min-aspect-ratio:1/1){.pm-overlay{grid-template-columns:minmax(0,1fr) min(480px,48%);grid-template-rows:100%;}',
    '.pm-panel{border-left:2px solid var(--line,rgba(255,255,255,.16));border-top:0!important;border-radius:0!important;}}',
    '.pm-overlay button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;touch-action:manipulation;margin:0;}',
    '.pm-overlay button:focus-visible,.pm-overlay input:focus-visible{outline:3px solid var(--gold,#ffd166);outline-offset:3px;}',
    '.pm-stage{position:relative;min-height:0;min-width:0;overflow:hidden;touch-action:none;',
    'background:radial-gradient(circle at 78% 18%,rgba(255,111,168,.22),transparent 38%),radial-gradient(circle at 15% 85%,rgba(95,224,200,.18),transparent 42%),linear-gradient(180deg,#191457,var(--space,#0d0b2e));}',
    '.pm-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;}',
    '.pm-canvas:active{cursor:grabbing;}',
    '.pm-title{position:absolute;top:14px;left:16px;pointer-events:none;}',
    '.pm-title b{display:block;font-family:var(--display,"Baloo 2",sans-serif);font-weight:800;font-size:24px;line-height:1;padding:10px 16px;border-radius:999px;background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));}',
    '.pm-hint{position:absolute;top:18px;right:16px;font-size:18px;color:var(--ink-soft,#c9c3f0);background:rgba(13,11,46,.55);padding:6px 14px;border-radius:999px;pointer-events:none;white-space:nowrap;transition:opacity .6s;}',
    '.pm-banner{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);max-width:calc(100% - 32px);pointer-events:none;font-family:var(--display,"Baloo 2",sans-serif);font-weight:800;font-size:24px;line-height:1.1;',
    'padding:8px 20px;border-radius:999px;background:rgba(13,11,46,.62);border:2px solid rgba(255,209,102,.45);color:var(--gold,#ffd166);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.pm-banner:empty{display:none;}',
    '.pm-toast{position:absolute;left:50%;bottom:64px;transform:translate(-50%,10px);max-width:calc(100% - 32px);width:max-content;text-align:center;background:#fff;color:#231a4f;font-weight:700;font-size:18px;padding:10px 16px;border-radius:16px;box-shadow:0 6px 18px rgba(0,0,0,.35);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;}',
    '.pm-toast.pm-show{opacity:1;transform:translate(-50%,0);}',
    '.pm-nogl{position:absolute;inset:0;display:grid;place-items:center;color:var(--ink-soft,#c9c3f0);font-size:18px;text-align:center;padding:20px;}',
    '.pm-nogl canvas{width:min(60vw,220px);height:auto;}',
    '.pm-panel{display:flex;flex-direction:column;min-height:0;min-width:0;background:var(--panel-solid,#1e1954);border-top:2px solid var(--line,rgba(255,255,255,.16));border-radius:22px 22px 0 0;}',
    '.pm-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:12px 14px 8px;flex:none;}',
    '.pm-tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:58px;min-width:0;border-radius:14px;background:rgba(255,255,255,.07)!important;border:2px solid var(--line,rgba(255,255,255,.16))!important;font-family:var(--display,"Baloo 2",sans-serif)!important;font-weight:800;font-size:18px!important;color:var(--ink-soft,#c9c3f0)!important;line-height:1.05;padding:4px 2px;}',
    '.pm-tab svg{width:24px;height:24px;flex:none;}',
    '.pm-tab span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.pm-tab[aria-selected="true"]{background:var(--gold,#ffd166)!important;color:#2a1a05!important;border-color:transparent!important;}',
    '.pm-surprise{background:linear-gradient(180deg,#ff8fc0,var(--pink,#ff6fa8))!important;color:#2a0a1c!important;border-color:transparent!important;box-shadow:0 4px 0 #c2407a;--pm-dot:#ff6fa8;}',
    '.pm-surprise svg{color:#fff;}',
    '.pm-surprise:active{transform:translateY(3px);box-shadow:0 1px 0 #c2407a;}',
    '.pm-body{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:6px 16px 16px;}',
    '.pm-sec[hidden]{display:none!important;}',
    '.pm-label{display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:var(--display,"Baloo 2",sans-serif);font-weight:800;font-size:20px;margin:10px 0 8px;color:var(--ink,#fdf8ff);}',
    '.pm-label small{font-family:var(--body,sans-serif);font-weight:700;font-size:18px;color:var(--ink-soft,#c9c3f0);}',
    '.pm-swatches{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;justify-items:center;}',
    '.pm-sw{width:100%;max-width:56px;aspect-ratio:1/1;min-height:48px;border-radius:50%!important;border:3px solid rgba(255,255,255,.3)!important;box-shadow:inset -5px -6px 10px rgba(0,0,0,.22),inset 4px 4px 8px rgba(255,255,255,.3);transition:transform .15s;}',
    '.pm-sw[aria-pressed="true"]{transform:scale(1.08);box-shadow:0 0 0 3px var(--panel-solid,#1e1954),0 0 0 7px var(--ink,#fdf8ff),inset -5px -6px 10px rgba(0,0,0,.22);}',
    '.pm-dim .pm-sw{opacity:.35;filter:grayscale(.5);}',
    '.pm-sw:active,.pm-opt:active,.pm-chip:active,.pm-small:active{transform:scale(.94);}',
    '.pm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px;}',
    '.pm-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;}',
    '.pm-grid4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}',
    '.pm-grid5{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;}',
    '.pm-opt{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:52px;min-width:0;padding:8px 4px;border-radius:18px!important;background:rgba(255,255,255,.07)!important;border:3px solid transparent!important;font-weight:700;font-size:18px!important;text-align:center;line-height:1.15;position:relative;}',
    '.pm-opt>span{max-width:100%;}',
    '.pm-opt[aria-pressed="true"]{border-color:var(--gold,#ffd166)!important;background:rgba(255,209,102,.14)!important;}',
    '.pm-ball{width:76px;height:76px;display:block;}',
    '.pm-ringcv{width:84px;height:62px;display:block;}',
    '.pm-ico{width:52px;height:52px;display:block;}',
    '.pm-pill{font-size:18px;font-weight:800;padding:0 12px;border-radius:999px;background:rgba(255,255,255,.12);color:var(--ink-soft,#c9c3f0);line-height:28px;}',
    '.pm-opt[aria-pressed="true"] .pm-pill{background:var(--teal,#5fe0c8);color:#06302a;}',
    '.pm-sizedot{display:block;border-radius:50%;box-shadow:inset -4px -5px 8px rgba(0,0,0,.25),inset 3px 3px 6px rgba(255,255,255,.35);}',
    '.pm-num{font-family:var(--display,"Baloo 2",sans-serif);font-weight:800;font-size:30px;line-height:1;}',
    '.pm-mdots{display:flex;gap:3px;height:14px;align-items:center;}',
    '.pm-mdots i{width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff,#9aa0b5 75%);}',
    '.pm-chips{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;}',
    '.pm-chip{display:flex;align-items:center;gap:10px;min-height:56px;min-width:0;padding:6px 12px 6px 8px;border-radius:999px!important;background:rgba(255,255,255,.08)!important;border:2px solid var(--line,rgba(255,255,255,.16))!important;font-weight:700;font-size:18px!important;text-align:left;}',
    '.pm-chip i{flex:none;width:36px;height:36px;border-radius:50%;box-shadow:inset -4px -5px 7px rgba(0,0,0,.28),inset 3px 3px 5px rgba(255,255,255,.35);}',
    '.pm-chip span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.pm-chip svg{flex:none;width:22px;height:22px;opacity:.75;--pm-dot:#1e1954;}',
    '.pm-namein{width:100%;min-height:64px;font-family:var(--display,"Baloo 2",sans-serif);font-weight:800;font-size:28px;padding:8px 16px;border-radius:16px;border:3px solid var(--line,rgba(255,255,255,.16));background:rgba(255,255,255,.08);color:var(--ink,#fdf8ff);-webkit-user-select:text;user-select:text;}',
    '.pm-namein:focus{border-color:var(--teal,#5fe0c8);outline:none;}',
    '.pm-namebar{display:flex;flex-wrap:wrap;align-items:center;margin-top:10px;gap:10px;}',
    '.pm-namebar .pm-count{margin-left:auto;font-size:18px;font-weight:700;color:var(--ink-soft,#c9c3f0);}',
    '.pm-small{display:inline-flex;align-items:center;gap:8px;min-height:52px;padding:8px 18px;border-radius:999px!important;background:rgba(255,255,255,.1)!important;border:2px solid var(--line,rgba(255,255,255,.16))!important;font-weight:700;font-size:18px!important;}',
    '.pm-small svg{width:24px;height:24px;--pm-dot:#1e1954;}',
    '.pm-small.pm-hot{background:rgba(255,111,168,.22)!important;border-color:rgba(255,111,168,.6)!important;}',
    '.pm-tipline{font-size:18px;color:var(--ink-soft,#c9c3f0);margin:12px 0 0;line-height:1.35;}',
    '.pm-facts{margin:4px 0 0;padding:0;list-style:none;display:grid;gap:8px;}',
    '.pm-facts li{background:rgba(255,255,255,.06);border-radius:14px;padding:10px 14px 10px 40px;position:relative;line-height:1.3;font-size:18px;}',
    '.pm-facts li::before{content:"\\2605";position:absolute;left:14px;top:9px;color:var(--gold,#ffd166);}',
    '.pm-actions{flex:none;display:grid;grid-template-columns:1fr 1.6fr;gap:12px;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));border-top:2px solid var(--line,rgba(255,255,255,.16));background:var(--panel,rgba(30,25,84,.88));}',
    '.pm-cancel{min-height:60px;border-radius:999px!important;background:rgba(255,255,255,.1)!important;border:2px solid var(--line,rgba(255,255,255,.16))!important;font-weight:700;font-size:20px!important;}',
    '.pm-save{min-height:60px;border-radius:999px!important;font-family:var(--display,"Baloo 2",sans-serif)!important;font-weight:800;font-size:24px!important;line-height:1.05;color:#2a0f05!important;background:linear-gradient(180deg,#ffb084,var(--rocket,#ff7a45))!important;box-shadow:0 5px 0 var(--rocket-deep,#d9532a),0 8px 20px rgba(0,0,0,.35);}',
    '.pm-save:active{transform:translateY(4px);box-shadow:0 1px 0 var(--rocket-deep,#d9532a);}',
    '@media (max-width:520px) and (min-aspect-ratio:0/1){.pm-overlay{grid-template-rows:minmax(190px,36%) minmax(0,1fr);}}',
    '@media (max-width:420px){.pm-title b{font-size:20px;padding:8px 14px;}.pm-hint{top:16px;}.pm-save{font-size:22px!important;}.pm-body{padding:4px 12px 14px;}.pm-tabs{padding:10px 12px 6px;gap:6px;}}',
    '@media (max-height:520px){.pm-tab{min-height:48px;}.pm-tab svg{display:none;}.pm-tabs{padding:8px 12px 6px;}.pm-actions{padding-top:8px;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px));}.pm-cancel,.pm-save{min-height:52px;}',
    '.pm-title b{font-size:20px;padding:8px 14px;}.pm-banner{font-size:20px;}.pm-ball{width:64px;height:64px;}}'
  ].join('\n');

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var active = null;
  var lastTab = 'type';
  var spokenOnce = {};

  /** Open the full-screen Planet Maker. opts: { design, captainName, onSave(design), onClose } */
  function open(opts) {
    opts = opts || {};
    if (active) active.close();
    var captain = cleanText(opts.captainName, MAX_MAKER) || 'Harper';
    var hadDesign = !!(opts.design && typeof opts.design === 'object');
    var d = hadDesign ? normalize(opts.design) : defaultDesign(captain);
    if (!d.maker) d.maker = captain;
    var closed = false, nameTyped = hadDesign && d.name !== 'Planet ' + captain;

    var style = document.createElement('style');
    style.setAttribute('data-planetmaker', '');
    style.textContent = CSS;
    document.head.appendChild(style);

    var TABS = [['type', 'Type'], ['colours', 'Colours'], ['pattern', 'Pattern'], ['extras', 'Extras'], ['rings', 'Rings'], ['moons', 'Moons'], ['name', 'Name']];
    function swatches(part, label) {
      var s = '<div class="pm-swatches" data-swset="' + part + '">';
      PALETTE.forEach(function (c, i) { s += '<button class="pm-sw" data-part="' + part + '" data-col="' + c + '" style="background:' + c + '" aria-label="' + label + ' ' + PALETTE_NAMES[i] + '"></button>'; });
      return s + '</div>';
    }

    var html = '';
    html += '<div class="pm-stage"><canvas class="pm-canvas" aria-label="Your planet. Drag to spin it."></canvas>';
    html += '<div class="pm-title"><b>Planet Maker</b></div><div class="pm-hint">Drag to spin</div>';
    html += '<div class="pm-toast" role="status" aria-live="polite"></div><div class="pm-banner"></div></div>';
    html += '<div class="pm-panel"><div class="pm-tabs" role="tablist">';
    TABS.forEach(function (t) { html += '<button class="pm-tab" role="tab" data-tab="' + t[0] + '">' + ICONS[t[0]] + '<span>' + t[1] + '</span></button>'; });
    html += '<button class="pm-tab pm-surprise" data-act="surprise" aria-label="Surprise me! Make a random planet">' + ICONS.dice + '<span>Surprise!</span></button>';
    html += '</div><div class="pm-body">';
    // type
    html += '<div class="pm-sec" data-sec="type"><div class="pm-label">What kind of planet?</div><div class="pm-grid">';
    TYPES.forEach(function (t) { html += '<button class="pm-opt" data-type="' + t + '"><canvas class="pm-ball" width="152" height="152"></canvas><span>' + TYPE_INFO[t].label + '</span></button>'; });
    html += '</div></div>';
    // colours
    html += '<div class="pm-sec" data-sec="colours"><div class="pm-label">Main colour</div>' + swatches('color', 'Main colour');
    html += '<div class="pm-label">Second colour</div>' + swatches('color2', 'Second colour');
    html += '<p class="pm-tipline">The second colour is used for patterns, lands and stripes.</p></div>';
    // pattern
    html += '<div class="pm-sec" data-sec="pattern"><div class="pm-label">Pick a pattern <button class="pm-small" data-act="reseed">' + ICONS.dice + 'Shuffle</button></div><div class="pm-grid">';
    PATTERNS.forEach(function (p) { html += '<button class="pm-opt" data-pattern="' + p + '"><canvas class="pm-ball" width="152" height="152"></canvas><span>' + PATTERN_LABELS[p] + '</span></button>'; });
    html += '</div></div>';
    // extras
    html += '<div class="pm-sec" data-sec="extras"><div class="pm-label">Add some extras</div><div class="pm-grid3">';
    [['clouds', 'Clouds'], ['glow', 'Glow'], ['face', 'Face']].forEach(function (x) {
      html += '<button class="pm-opt" data-toggle="' + x[0] + '"><span class="pm-ico">' + ICONS[x[0]] + '</span><span>' + x[1] + '</span><span class="pm-pill"></span></button>';
    });
    html += '</div><div class="pm-label">How big?</div><div class="pm-grid3">';
    SIZES.forEach(function (s, i) {
      var px = [26, 40, 54][i];
      html += '<button class="pm-opt" data-size="' + s + '"><span style="height:56px;display:flex;align-items:center"><i class="pm-sizedot" style="width:' + px + 'px;height:' + px + 'px"></i></span><span>' + SIZE_LABELS[s] + '</span></button>';
    });
    html += '</div></div>';
    // rings
    html += '<div class="pm-sec" data-sec="rings"><div class="pm-label">Rings</div><div class="pm-grid4">';
    RINGS.forEach(function (r) { html += '<button class="pm-opt" data-rings="' + r + '"><canvas class="pm-ringcv" width="168" height="124"></canvas><span>' + RING_LABELS[r] + '</span></button>'; });
    html += '</div><div class="pm-label">Ring colour <small class="pm-ringnote"></small></div>' + swatches('ringColor', 'Ring colour') + '</div>';
    // moons
    html += '<div class="pm-sec" data-sec="moons"><div class="pm-label">How many moons?</div><div class="pm-grid5">';
    [0, 1, 2, 3, 4].forEach(function (n) {
      html += '<button class="pm-opt" data-moons="' + n + '" aria-label="' + n + (n === 1 ? ' moon' : ' moons') + '"><span class="pm-num">' + n + '</span><span class="pm-mdots">' + new Array(n + 1).join('<i></i>') + '</span></button>';
    });
    html += '</div><div class="pm-label">Moon colour</div>' + swatches('moonColor', 'Moon colour');
    html += '<div class="pm-label">Moon names <button class="pm-small" data-act="moonnames">' + ICONS.dice + 'New names</button></div><div class="pm-chips"></div>';
    html += '<p class="pm-tipline pm-moontip">Tap a moon to give it a new name.</p></div>';
    // name
    html += '<div class="pm-sec" data-sec="name"><div class="pm-label">Planet name</div>';
    html += '<input class="pm-namein" type="text" maxlength="' + MAX_NAME + '" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Planet name">';
    html += '<div class="pm-namebar"><button class="pm-small pm-hot" data-act="sillyname">' + ICONS.dice + 'Silly name</button><button class="pm-small" data-act="myname">My name</button><button class="pm-small" data-act="clearname">Clear</button><span class="pm-count"></span></div>';
    html += '<div class="pm-label">Planet facts</div><ul class="pm-facts"></ul></div>';
    html += '</div><div class="pm-actions"><button class="pm-cancel">Cancel</button><button class="pm-save">Save my planet</button></div></div>';

    var root = document.createElement('div');
    root.className = 'pm-overlay';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Planet Maker');
    root.innerHTML = html;
    document.body.appendChild(root);

    var $ = function (s) { return root.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
    var stage = $('.pm-stage'), canvas = $('.pm-canvas'), toastEl = $('.pm-toast'), hintEl = $('.pm-hint'), bannerEl = $('.pm-banner');
    var nameIn = $('.pm-namein'), bodyEl = $('.pm-body');
    nameIn.value = d.name;

    var timers = [];
    function later(fn, ms) { var id = setTimeout(function () { timers.splice(timers.indexOf(id), 1); if (!closed) fn(); }, ms); timers.push(id); return id; }

    var toastTimer = 0;
    function toast(msg) {
      toastEl.textContent = fillName(msg); toastEl.classList.add('pm-show');
      clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('pm-show'); }, 2400);
    }

    // speech: short, throttled, and most reactions only once per session
    var lastSpeak = 0, changes = 0;
    function speak(line, opt) {
      opt = opt || {};
      var now = Date.now();
      if (!opt.force && now - lastSpeak < (opt.gap || 6000)) return false;
      if (opt.once) { if (spokenOnce[line[1]]) return false; spokenOnce[line[1]] = 1; }
      lastSpeak = now;
      hook('say', line[0], line[1]);
      return true;
    }
    function feature(key) { var i = FEATURE_KEYS.indexOf(key); if (i >= 0) speak(FEATURE_LINES[i], { once: true }); }
    function maybeCheer() {
      changes++;
      if (changes % 7 === 0) speak(CHEER_LINES[Math.floor(Math.random() * CHEER_LINES.length)], { gap: 20000 });
    }

    function setTab(t) {
      lastTab = t;
      $$('.pm-tab[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === t)); });
      $$('.pm-sec').forEach(function (s) { s.hidden = s.getAttribute('data-sec') !== t; });
      bodyEl.scrollTop = 0;
      refreshIcons();
    }

    // icons: type balls are static, pattern balls follow the design
    var typeIconsDone = false, patKey = '';
    function refreshIcons() {
      if (closed) return;
      if (lastTab === 'type' && !typeIconsDone) {
        typeIconsDone = true;
        $$('[data-type]').forEach(function (b) {
          var t = b.getAttribute('data-type'), P = TYPE_INFO[t];
          ballIcon(b.querySelector('canvas'), normalize({ type: t, color: P.color, color2: P.color2, pattern: P.pattern, seed: 4242, glow: false }));
        });
      }
      if (lastTab === 'pattern') {
        var key = [d.type, d.color, d.color2, d.seed].join('|');
        if (key !== patKey) {
          patKey = key;
          $$('[data-pattern]').forEach(function (b) {
            var dd = normalize(d); dd.pattern = b.getAttribute('data-pattern'); dd.face = false; dd.glow = false;
            ballIcon(b.querySelector('canvas'), dd);
          });
        }
      }
      if (lastTab === 'rings') $$('[data-rings]').forEach(function (b) { ringIcon(b.querySelector('canvas'), d, b.getAttribute('data-rings')); });
    }

    function refreshUI() {
      $$('.pm-sw').forEach(function (b) { b.setAttribute('aria-pressed', String(d[b.getAttribute('data-part')] === b.getAttribute('data-col'))); });
      $$('[data-type]').forEach(function (b) { b.setAttribute('aria-pressed', String(d.type === b.getAttribute('data-type'))); });
      $$('[data-pattern]').forEach(function (b) { b.setAttribute('aria-pressed', String(d.pattern === b.getAttribute('data-pattern'))); });
      $$('[data-toggle]').forEach(function (b) {
        var on = !!d[b.getAttribute('data-toggle')];
        b.setAttribute('aria-pressed', String(on)); b.querySelector('.pm-pill').textContent = on ? 'On' : 'Off';
      });
      $$('[data-size]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(d.size === b.getAttribute('data-size')));
        b.querySelector('.pm-sizedot').style.background = 'radial-gradient(circle at 35% 35%,' + shHex(d.color, 1.35) + ',' + d.color + ' 70%)';
      });
      $$('[data-rings]').forEach(function (b) { b.setAttribute('aria-pressed', String(d.rings === b.getAttribute('data-rings'))); });
      var rset = $('[data-swset="ringColor"]'), dimRings = d.rings === 'none' || d.rings === 'rainbow';
      rset.classList.toggle('pm-dim', dimRings);
      $('.pm-ringnote').textContent = d.rings === 'none' ? 'Add rings first' : d.rings === 'rainbow' ? 'Rainbow has every colour!' : '';
      $$('[data-moons]').forEach(function (b) { b.setAttribute('aria-pressed', String(d.moons === +b.getAttribute('data-moons'))); });
      $$('.pm-mdots i').forEach(function (i) { i.style.background = 'radial-gradient(circle at 35% 35%,' + shHex(d.moonColor, 1.5) + ',' + d.moonColor + ' 75%)'; });
      $('[data-swset="moonColor"]').classList.toggle('pm-dim', d.moons === 0);
      var chips = '';
      for (var i = 0; i < d.moons; i++) {
        chips += '<button class="pm-chip" data-moonname="' + i + '" aria-label="Moon ' + esc(d.moonNames[i]) + '. Tap for a new name."><i style="background:radial-gradient(circle at 35% 35%,' +
          shHex(d.moonColor, 1.5) + ',' + shHex(d.moonColor, [1, 0.85, 1.2, 0.92][i]) + ' 75%)"></i><span>' + esc(d.moonNames[i]) + '</span>' + ICONS.dice + '</button>';
      }
      $('.pm-chips').innerHTML = chips;
      $('.pm-moontip').textContent = d.moons ? 'Tap a moon to give it a new name.' : 'Pick a number above to add some moons!';
      $('[data-act="moonnames"]').style.visibility = d.moons ? 'visible' : 'hidden';
      $('.pm-count').textContent = chars(d.name).length + ' / ' + MAX_NAME;
      $('[data-act="myname"]').textContent = cleanText('Planet ' + captain, MAX_NAME);
      var shown = cleanText(d.name, MAX_NAME) || cleanText('Planet ' + captain, MAX_NAME);
      bannerEl.textContent = shown;
      var fd = normalize(d); fd.name = shown;
      $('.pm-facts').innerHTML = facts(fd).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('');
      refreshIcons();
    }

    /* --- 3D preview --- */
    var renderer = null, scene, camera, spin, planet = null, starsA, starsB, starTex, dirty = true, raf = 0;
    var angle = 0, vel = 0, dragging = false, lastX = 0, lastT = performance.now(), simT = 0;
    var curScale = SIZE_SCALE[d.size], bump = 0, turnTo = null;
    try {
      if (!T) throw new Error('no THREE');
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
    } catch (e) {
      renderer = null;
      var ng = document.createElement('div'); ng.className = 'pm-nogl';
      ng.innerHTML = '<div><canvas width="240" height="240"></canvas><p>The 3D preview could not start, but you can still design your planet!</p></div>';
      stage.appendChild(ng);
    }
    if (renderer) {
      scene = new T.Scene();
      camera = new T.PerspectiveCamera(35, 1, 0.1, 200);
      scene.add(new T.HemisphereLight(0xffffff, 0x4a3a7a, 0.42));
      var key = new T.DirectionalLight(0xffffff, 0.82); key.position.set(-3, 2.5, 4); scene.add(key);
      var rim = new T.DirectionalLight(0x9fc0ff, 0.45); rim.position.set(4, 1, -3); scene.add(rim);
      spin = new T.Group(); scene.add(spin);
      var sc = document.createElement('canvas'); sc.width = sc.height = 32;
      var sx = sc.getContext('2d'), sg = sx.createRadialGradient(16, 16, 0, 16, 16, 16);
      sg.addColorStop(0, 'rgba(255,255,255,1)'); sg.addColorStop(0.4, 'rgba(255,255,255,.6)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      sx.fillStyle = sg; sx.fillRect(0, 0, 32, 32);
      starTex = new T.CanvasTexture(sc);
      var mkStars = function (count, seed) {
        var pos = new Float32Array(count * 3), col = new Float32Array(count * 3), tints = [[1, 1, 1], [1, 0.9, 0.6], [0.7, 0.9, 1], [1, 0.75, 0.9]];
        var rnd = mulberry32(seed);
        for (var i = 0; i < count; i++) {
          pos[i * 3] = (rnd() - 0.5) * 40; pos[i * 3 + 1] = (rnd() - 0.5) * 28; pos[i * 3 + 2] = -8 - rnd() * 14;
          var tc = tints[Math.floor(rnd() * tints.length)]; col[i * 3] = tc[0]; col[i * 3 + 1] = tc[1]; col[i * 3 + 2] = tc[2];
        }
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3));
        var m = new T.PointsMaterial({ size: 0.22, map: starTex, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
        var p = new T.Points(g, m); scene.add(p); return p;
      };
      starsA = mkStars(180, 7); starsB = mkStars(140, 99);
    } else {
      later(function () { var c = stage.querySelector('.pm-nogl canvas'); if (c) ballIcon(c, d, { r: 0.4 }); }, 0);
    }

    var lastW = 0, lastH = 0;
    function fit() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w; lastH = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var tn = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
      var dist = Math.max(2.0 / tn, 3.0 / (tn * camera.aspect));
      var el = 0.24;
      camera.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist); camera.lookAt(0, -0.05, 0);
      camera.updateProjectionMatrix();
    }
    function rebuild() {
      if (!renderer) return;
      if (planet) { simT = planet.userData.getTime(); planet.userData.dispose(); }
      planet = build(d, { texSize: 1024, time: simT });
      spin.add(planet);
    }
    function loop() {
      if (closed) return;
      raf = requestAnimationFrame(loop);
      var now = performance.now(), dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      fit();
      if (dirty) { dirty = false; rebuild(); }
      if (dragging) turnTo = null;
      if (turnTo !== null) {
        angle += (turnTo - angle) * Math.min(1, dt * 4);
        if (Math.abs(turnTo - angle) < 0.01) turnTo = null;
      } else if (!dragging) { vel *= Math.pow(0.04, dt); angle += vel * dt + 0.3 * dt; }
      var target = SIZE_SCALE[d.size];
      curScale += (target - curScale) * Math.min(1, dt * 8);
      bump *= Math.pow(0.002, dt);
      spin.scale.setScalar(curScale * (1 + bump * Math.sin(now / 45) * 0.5 + bump * 0.5));
      if (planet) {
        planet.userData.update(dt);
        var ud = planet.userData;
        ud.surface.rotation.y = angle;
        if (ud.clouds) ud.clouds.rotation.y = angle + ud.getTime() * 0.035;
      }
      starsA.rotation.z += dt * 0.01; starsB.rotation.z -= dt * 0.007;
      starsA.material.opacity = 0.75 + 0.25 * Math.sin(now / 700);
      starsB.material.opacity = 0.75 + 0.25 * Math.sin(now / 900 + 2);
      renderer.render(scene, camera);
    }

    function changed(rebuild3d) {
      if (rebuild3d !== false) { dirty = true; bump = 0.08; }
      refreshUI();
      if (!renderer) { var c = stage.querySelector('.pm-nogl canvas'); if (c) ballIcon(c, d, { r: 0.4 }); }
    }

    /* --- events --- */
    var dragged = false, lastMoveT = 0;
    function onPointerDown(e) {
      dragging = true; dragged = false; lastX = e.clientX; vel = 0; lastMoveT = performance.now();
      try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    }
    function onPointerMove(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, now = performance.now(), mdt = Math.max(0.008, (now - lastMoveT) / 1000);
      lastX = e.clientX; lastMoveT = now;
      angle += dx * 0.012; vel = clamp(dx * 0.012 / mdt, -12, 12);
      if (!dragged && Math.abs(dx) > 2) { dragged = true; hintEl.style.opacity = '0'; }
    }
    function onPointerUp() { dragging = false; }
    if (renderer) {
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
    }

    function setName(n) { d.name = n; nameIn.value = n; changed(false); }
    function surprise() {
      var r = Math.random, t = TYPES[Math.floor(r() * TYPES.length)], P = TYPE_INFO[t];
      d.type = t;
      if (r() < 0.45) { d.color = P.color; d.color2 = P.color2; }
      else {
        d.color = PALETTE[Math.floor(r() * PALETTE.length)];
        for (var k = 0; k < 20; k++) { d.color2 = PALETTE[Math.floor(r() * PALETTE.length)]; if (cdist(d.color, d.color2) > 110) break; }
      }
      d.pattern = r() < 0.3 ? P.pattern : PATTERNS[Math.floor(r() * PATTERNS.length)];
      d.clouds = r() < 0.5; d.glow = r() < 0.65; d.face = r() < 0.45;
      d.size = SIZES[Math.floor(r() * 3)];
      d.rings = r() < 0.35 ? 'none' : RINGS[1 + Math.floor(r() * 3)];
      d.ringColor = PALETTE[Math.floor(r() * PALETTE.length)];
      d.moons = Math.floor(r() * 5);
      d.moonColor = PALETTE[Math.floor(r() * PALETTE.length)];
      d.moonNames = rollMoonNames();
      d.seed = newSeed();
      if (!nameTyped) { d.name = sillyName(); nameIn.value = d.name; }
    }

    var surpriseCount = 0;
    function onClick(e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b || !root.contains(b)) return;
      var act = b.getAttribute('data-act');
      if (b.hasAttribute('data-tab')) { setTab(b.getAttribute('data-tab')); hook('sfx', 'blip'); return; }
      if (b.hasAttribute('data-part')) {
        var part = b.getAttribute('data-part');
        if (part === 'ringColor' && d.rings === 'none') { toast('Pick some rings first!'); hook('sfx', 'oops'); return; }
        if (part === 'ringColor' && d.rings === 'rainbow') { toast('Rainbow rings have every colour! Pick Thin or Wide to choose one.'); hook('sfx', 'oops'); return; }
        if (part === 'moonColor' && d.moons === 0) { toast('Add a moon first!'); hook('sfx', 'oops'); return; }
        d[part] = b.getAttribute('data-col'); hook('sfx', 'chime'); changed(); maybeCheer(); return;
      }
      if (b.hasAttribute('data-type')) {
        var t = b.getAttribute('data-type'), P = TYPE_INFO[t];
        d.type = t; d.color = P.color; d.color2 = P.color2; d.pattern = P.pattern;
        hook('sfx', 'whoosh'); changed();
        toast(P.label === 'Gas giant' ? 'A gas giant!' : P.label + ' planet!');
        speak(TYPE_LINES[TYPES.indexOf(t)], { once: true });
        return;
      }
      if (b.hasAttribute('data-pattern')) {
        d.pattern = b.getAttribute('data-pattern'); hook('sfx', 'chime'); changed();
        if (d.pattern === 'heart') feature('heart'); else maybeCheer();
        return;
      }
      if (b.hasAttribute('data-toggle')) {
        var k = b.getAttribute('data-toggle'); d[k] = !d[k];
        hook('sfx', d[k] ? 'chime' : 'blip'); changed();
        if (d[k]) feature(k);
        if (k === 'face' && d.face) { vel = 0; turnTo = Math.ceil(angle / TAU) * TAU; }
        return;
      }
      if (b.hasAttribute('data-size')) {
        d.size = b.getAttribute('data-size'); hook('sfx', d.size === 'big' ? 'thud' : 'blip'); changed(false); maybeCheer();
        return;
      }
      if (b.hasAttribute('data-rings')) {
        d.rings = b.getAttribute('data-rings'); hook('sfx', d.rings === 'none' ? 'blip' : 'chime'); changed();
        if (d.rings === 'rainbow') feature('rainbow'); else if (d.rings !== 'none') feature('rings');
        return;
      }
      if (b.hasAttribute('data-moons')) {
        var n = +b.getAttribute('data-moons'), more = n > d.moons;
        d.moons = n; hook('sfx', more ? 'chime' : 'blip'); changed();
        if (n > 0) feature('moons');
        if (more) toast('Hello, ' + d.moonNames[n - 1] + '!');
        return;
      }
      if (b.hasAttribute('data-moonname')) {
        var mi = +b.getAttribute('data-moonname'), keep = d.moonNames.slice(); keep[mi] = '';
        var old = d.moonNames[mi];
        for (var tries = 0; tries < 5; tries++) { d.moonNames = rollMoonNames(Math.random, keep); if (d.moonNames[mi] !== old) break; }
        hook('sfx', 'blip'); changed();
        return;
      }
      if (act === 'moonnames') { d.moonNames = rollMoonNames(); hook('sfx', 'blip'); changed(); return; }
      if (act === 'reseed') { d.seed = newSeed(); hook('sfx', 'whoosh'); changed(); toast('All shuffled!'); return; }
      if (act === 'surprise') {
        surprise(); surpriseCount++; hook('sfx', 'happy'); changed(); toast('Surprise!');
        if (surpriseCount === 1 || surpriseCount % 4 === 0) speak(SURPRISE_LINES[Math.floor(Math.random() * SURPRISE_LINES.length)]);
        return;
      }
      if (act === 'sillyname') {
        var nn = d.name; for (var q = 0; q < 6 && nn === d.name; q++) nn = sillyName();
        nameTyped = false; setName(nn); hook('sfx', 'blip');
        speak(NAME_LINES[Math.floor(Math.random() * NAME_LINES.length)], { gap: 15000 });
        return;
      }
      if (act === 'myname') { nameTyped = false; setName(cleanText('Planet ' + captain, MAX_NAME)); hook('sfx', 'blip'); return; }
      if (act === 'clearname') { nameTyped = true; setName(''); try { nameIn.focus(); } catch (er) { /* ignore */ } return; }
      if (b.classList.contains('pm-cancel')) { hook('sfx', 'whoosh'); hook('stopSpeaking'); close(); return; }
      if (b.classList.contains('pm-save')) { save(); return; }
    }
    function onNameInput() {
      var v = cleanInput(nameIn.value, MAX_NAME);
      if (v !== nameIn.value) nameIn.value = v;
      nameTyped = true;
      if (v !== d.name) { d.name = v; changed(false); }
    }
    function onNameKey(e) { if (e.key === 'Enter') { e.preventDefault(); nameIn.blur(); } }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); hook('stopSpeaking'); close(); }
    }
    root.addEventListener('click', onClick);
    nameIn.addEventListener('input', onNameInput);
    nameIn.addEventListener('keydown', onNameKey);
    document.addEventListener('keydown', onKey);

    function save() {
      if (closed) return;
      var out = normalize(d);
      if (!cleanText(d.name, MAX_NAME)) out.name = cleanText('Planet ' + captain, MAX_NAME);
      out.maker = out.maker || captain;
      hook('sfx', 'happy');
      speak(SAVE_LINES[Math.floor(Math.random() * SAVE_LINES.length)], { force: true });
      try { if (typeof opts.onSave === 'function') opts.onSave(out); } catch (e) { console.error('PlanetMaker onSave failed', e); }
      close();
    }

    function close() {
      if (closed) return;
      closed = true;
      cancelAnimationFrame(raf);
      clearTimeout(toastTimer);
      timers.forEach(clearTimeout); timers = [];
      root.removeEventListener('click', onClick);
      nameIn.removeEventListener('input', onNameInput);
      nameIn.removeEventListener('keydown', onNameKey);
      document.removeEventListener('keydown', onKey);
      if (renderer) {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        if (planet) planet.userData.dispose();
        planet = null;
        [starsA, starsB].forEach(function (p) { if (p) { p.geometry.dispose(); p.material.dispose(); } });
        if (starTex) starTex.dispose();
        renderer.renderLists.dispose();
        renderer.dispose();
        try { renderer.forceContextLoss(); } catch (e) { /* ignore */ }
        renderer = null;
      }
      if (root.parentNode) root.parentNode.removeChild(root);
      if (style.parentNode) style.parentNode.removeChild(style);
      if (active === handle) active = null;
      try { if (typeof opts.onClose === 'function') opts.onClose(); } catch (e) { console.error('PlanetMaker onClose failed', e); }
    }

    var handle = { close: close, save: save };
    active = handle;

    setTab(TABS.some(function (t) { return t[0] === lastTab; }) ? lastTab : 'type');
    refreshUI();
    if (renderer) { lastT = performance.now(); loop(); }
    later(function () { hintEl.style.opacity = '0'; }, 6000);
    later(function () { speak(OPEN_LINES[hadDesign ? 1 : 0], { force: true }); }, 500);
    return { close: close };
  }

  window.PlanetMaker = {
    defaultDesign: defaultDesign,
    normalize: normalize,
    paint: paint,
    build: build,
    facts: facts,
    land: land,
    open: open,
    // extras
    sillyName: function () { return sillyName(); },
    sizeScale: function (design) { return SIZE_SCALE[normalize(design).size]; },
    dayHours: function (design) { return dayHours(normalize(design)); },
    TYPES: TYPES.slice(),
    PATTERNS: PATTERNS.slice(),
    SIZES: SIZES.slice(),
    RINGS: RINGS.slice(),
    PALETTE: PALETTE.slice()
  };
})();
