/* Harper's Space Adventure: rocket model + Rocket builder.
   Exposes window.RocketKit. Needs global THREE (r128). */
(function () {
  'use strict';
  var T = window.THREE;
  if (!T) { console.warn('RocketKit: THREE is not loaded'); return; }

  /* ------------------------------------------------------------------ data */
  var PALETTE = ['#ff7a45', '#ff4d6d', '#ff6fa8', '#b26bff', '#4d7cff', '#3fc1ff', '#5fe0c8', '#7ed957', '#ffd166', '#fdf8ff'];
  var PALETTE_NAMES = ['Orange', 'Red', 'Pink', 'Purple', 'Blue', 'Sky blue', 'Teal', 'Green', 'Gold', 'White'];
  var PATTERNS = ['plain', 'stripes', 'spots', 'stars', 'checks', 'zigzag', 'galaxy'];
  var PATTERN_NAMES = { plain: 'Plain', stripes: 'Stripes', spots: 'Spots', stars: 'Stars', checks: 'Checks', zigzag: 'Zigzag', galaxy: 'Galaxy ✨' };
  var SHAPES = ['classic', 'chunky', 'sleek'];
  var SHAPE_NAMES = { classic: 'Classic', chunky: 'Chunky', sleek: 'Sleek' };
  var STICKER_IDS = ['star', 'heart', 'pluto', 'paw', 'rainbow', 'moon', 'comet', 'alien', 'dog', 'saturn', 'flower', 'lightning'];
  var STICKER_NAMES = { star: 'Star', heart: 'Heart', pluto: 'Pluto', paw: 'Paw print', rainbow: 'Rainbow', moon: 'Moon', comet: 'Comet', alien: 'Alien', dog: 'Spaniel', saturn: 'Saturn', flower: 'Flower', lightning: 'Lightning' };
  var MAX_STICKERS = 6;
  var MAX_NAME = 12;

  var DEFAULT_DESIGN = {
    body: '#ff7a45', nose: '#fdf8ff', fins: '#5fe0c8', trim: '#ffd166',
    pattern: 'stripes', shape: 'classic', windows: 2, name: 'HARPER',
    stickers: ['pluto', 'star']
  };

  /* Shape parameters, in "lathe space": rocket axis is +Y, nose up. */
  var SHAPE = {
    classic: { R: 0.30, y0: -0.62, y1: 0.30, nose: 0.68, noseP: 2.0, noseQ: 0.62, taper: 0.86, topTaper: 0.90, bulge: 0.12,
      fins: 3, finW: 0.30, finRoot: 0.40, finDrop: 0.24, nzTop: 0.46, nzBot: 0.68, nzLen: 0.22, wr: 0.075 },
    chunky: { R: 0.40, y0: -0.58, y1: 0.28, nose: 0.56, noseP: 2.0, noseQ: 0.52, taper: 0.88, topTaper: 0.93, bulge: 0.09,
      fins: 4, finW: 0.25, finRoot: 0.34, finDrop: 0.20, nzTop: 0.42, nzBot: 0.62, nzLen: 0.20, wr: 0.085 },
    sleek: { R: 0.22, y0: -0.66, y1: 0.34, nose: 0.70, noseP: 1.5, noseQ: 0.95, taper: 0.90, topTaper: 0.86, bulge: 0.11,
      fins: 3, finW: 0.32, finRoot: 0.50, finDrop: 0.30, nzTop: 0.50, nzBot: 0.74, nzLen: 0.22, wr: 0.058 }
  };

  var FONT = '"Baloo 2", "Trebuchet MS", system-ui, sans-serif';

  /* --------------------------------------------------------------- helpers */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hexOk(c) { return typeof c === 'string' && /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(c); }
  function cleanName(s) { return String(s == null ? '' : s).toUpperCase().replace(/[^A-Z0-9 !?.'&-]/g, '').slice(0, MAX_NAME); }
  function normalize(d) {
    d = d && typeof d === 'object' ? d : {};
    var D = DEFAULT_DESIGN;
    return {
      body: hexOk(d.body) ? d.body : D.body,
      nose: hexOk(d.nose) ? d.nose : D.nose,
      fins: hexOk(d.fins) ? d.fins : D.fins,
      trim: hexOk(d.trim) ? d.trim : D.trim,
      pattern: PATTERNS.indexOf(d.pattern) >= 0 ? d.pattern : D.pattern,
      shape: SHAPES.indexOf(d.shape) >= 0 ? d.shape : D.shape,
      windows: [1, 2, 3].indexOf(+d.windows) >= 0 ? +d.windows : D.windows,
      name: cleanName(d.name == null ? D.name : d.name),
      stickers: (Array.isArray(d.stickers) ? d.stickers : D.stickers)
        .filter(function (s) { return STICKER_IDS.indexOf(s) >= 0; }).slice(0, MAX_STICKERS)
    };
  }
  function rgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lum(hex) { var c = rgb(hex); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function cdist(a, b) { var x = rgb(a), y = rgb(b); return Math.sqrt(Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2)); }
  function hook(fn, a, b) { try { var H = window.GameHooks; if (H && typeof H[fn] === 'function') H[fn](a, b); } catch (e) { /* ignore */ } }

  function bodyR(P, t) { return P.R * (P.taper + (P.topTaper - P.taper) * t + P.bulge * Math.sin(Math.PI * t)); }
  function bodyDrDy(P, t) { return P.R * ((P.topTaper - P.taper) + P.bulge * Math.PI * Math.cos(Math.PI * t)) / (P.y1 - P.y0); }
  function extents(P) {
    var top = P.y1 + P.nose + P.R * 0.05;
    var nozzleBot = P.y0 - 0.04 - P.nzLen;
    var finBot = P.y0 - P.finDrop - 0.04;
    return { top: top, bot: Math.min(nozzleBot, finBot) };
  }

  /* ---------------------------------------------------- 2D drawing helpers */
  function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
  function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); }
  function starPath(c, x, y, ro, ri, n, rot) {
    c.beginPath();
    for (var i = 0; i < n * 2; i++) {
      var r = i % 2 ? ri : ro, a = (rot || 0) - Math.PI / 2 + i * Math.PI / n;
      c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    c.closePath();
  }
  function heartPath(c, x, y, s) {
    y -= s * 0.05;
    c.beginPath();
    c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.35, y + s * 0.1, x - s * 0.95, y - s * 1.05, x, y - s * 0.45);
    c.bezierCurveTo(x + s * 0.95, y - s * 1.05, x + s * 1.35, y + s * 0.1, x, y + s * 0.9);
    c.closePath();
  }
  function rrect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  function fillStroke(c, fill, stroke, lw) {
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.lineWidth = lw || 3; c.strokeStyle = stroke; c.stroke(); }
  }

  /* -------------------------------------------------------------- stickers
     Each drawer works in a -50..50 box; backing circle has radius 48. */
  var NAVY = '#2b2f7a';
  var STICKER_BACK = { moon: NAVY, comet: NAVY, saturn: NAVY, lightning: NAVY, rainbow: '#dff3ff', dog: '#ffe3c2' };
  var DRAW = {
    star: function (c) {
      starPath(c, 0, 3, 38, 17, 5); fillStroke(c, '#ffd166', '#f08a24', 5);
      c.fillStyle = '#5a3410'; circ(c, -7, 2, 3.6); c.fill(); circ(c, 7, 2, 3.6); c.fill();
      c.beginPath(); c.arc(0, 7, 5.5, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 2.6; c.strokeStyle = '#5a3410'; c.stroke();
      c.fillStyle = 'rgba(255,111,168,.6)'; circ(c, -13, 9, 3.5); c.fill(); circ(c, 13, 9, 3.5); c.fill();
    },
    heart: function (c) {
      heartPath(c, 0, 4, 36); fillStroke(c, '#ff4d7e', '#c92a5c', 5);
      ell(c, -15, -10, 7, 4.5, -0.6); c.fillStyle = 'rgba(255,255,255,.75)'; c.fill();
    },
    pluto: function (c) {
      var g = c.createRadialGradient(-12, -14, 4, 0, 0, 38);
      g.addColorStop(0, '#f8ead6'); g.addColorStop(1, '#c79f7a');
      circ(c, 0, 0, 36); c.fillStyle = g; c.fill();
      c.save(); circ(c, 0, 0, 36); c.clip();
      c.fillStyle = 'rgba(122,80,52,.45)';
      ell(c, 22, -16, 15, 9, 0.4); c.fill(); ell(c, -24, -22, 10, 6, -0.3); c.fill(); ell(c, 14, 28, 18, 7, 0); c.fill();
      c.restore();
      heartPath(c, -4, 9, 16); fillStroke(c, '#fffaf2', null);
      circ(c, 0, 0, 36); fillStroke(c, null, '#8a6446', 3);
    },
    paw: function (c) {
      c.fillStyle = '#6b4a3a';
      ell(c, 0, 15, 19, 15.5); c.fill();
      ell(c, -25, -4, 8, 10.5, -0.5); c.fill(); ell(c, -9, -21, 8.5, 11, -0.15); c.fill();
      ell(c, 9, -21, 8.5, 11, 0.15); c.fill(); ell(c, 25, -4, 8, 10.5, 0.5); c.fill();
      c.fillStyle = 'rgba(255,255,255,.28)';
      ell(c, -6, 10, 6, 3.5, -0.3); c.fill(); ell(c, -11, -25, 3, 2.2, -0.3); c.fill(); ell(c, 7, -25, 3, 2.2, -0.3); c.fill();
    },
    rainbow: function (c) {
      var cols = ['#ff4d6d', '#ff9f43', '#ffd166', '#7ed957', '#3fc1ff', '#b26bff'];
      c.lineCap = 'butt'; c.lineWidth = 6.4;
      for (var i = 0; i < cols.length; i++) { c.beginPath(); c.arc(0, 16, 37 - i * 6, Math.PI, 2 * Math.PI); c.strokeStyle = cols[i]; c.stroke(); }
      c.lineCap = 'round';
      [[-30, 18], [30, 18]].forEach(function (p) {
        var x = p[0], y = p[1], pts = [[x - 9, y + 2, 8], [x, y - 3, 10], [x + 9, y + 2, 8], [x, y + 4, 8]];
        c.fillStyle = '#b8c8e0'; pts.forEach(function (q) { circ(c, q[0], q[1], q[2] + 2); c.fill(); });
        c.fillStyle = '#ffffff'; pts.forEach(function (q) { circ(c, q[0], q[1], q[2]); c.fill(); });
      });
    },
    moon: function (c, back) {
      circ(c, -2, 2, 32); c.fillStyle = '#ffe08a'; c.fill();
      circ(c, 14, -10, 27); c.fillStyle = back; c.fill();
      c.beginPath(); c.arc(-17, 8, 4.5, 0.1 * Math.PI, 0.9 * Math.PI); c.lineWidth = 3; c.strokeStyle = '#b8862a'; c.stroke();
      circ(c, -23, 17, 3.2); c.fillStyle = 'rgba(255,111,168,.7)'; c.fill();
      starPath(c, 24, 22, 7, 3, 5); c.fillStyle = '#ffffff'; c.fill();
      starPath(c, 28, -27, 5, 2.2, 5); c.fill();
      circ(c, 6, 32, 2.2); c.fill();
    },
    comet: function (c) {
      var g = c.createLinearGradient(12, -12, -36, 36);
      g.addColorStop(0, 'rgba(127,231,255,.95)'); g.addColorStop(1, 'rgba(127,231,255,0)');
      c.beginPath(); c.moveTo(21, -3); c.lineTo(-38, 36); c.lineTo(3, -21); c.closePath(); c.fillStyle = g; c.fill();
      var g2 = c.createLinearGradient(12, -12, -30, 20);
      g2.addColorStop(0, 'rgba(255,111,168,.9)'); g2.addColorStop(1, 'rgba(255,111,168,0)');
      c.beginPath(); c.moveTo(14, -6); c.lineTo(-40, 14); c.lineTo(6, -16); c.closePath(); c.fillStyle = g2; c.fill();
      var g3 = c.createLinearGradient(12, -12, -14, 40);
      g3.addColorStop(0, 'rgba(255,209,102,.9)'); g3.addColorStop(1, 'rgba(255,209,102,0)');
      c.beginPath(); c.moveTo(18, -8); c.lineTo(-14, 42); c.lineTo(8, -14); c.closePath(); c.fillStyle = g3; c.fill();
      var gl = c.createRadialGradient(12, -12, 4, 12, -12, 24);
      gl.addColorStop(0, 'rgba(255,255,255,.9)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
      circ(c, 12, -12, 24); c.fillStyle = gl; c.fill();
      circ(c, 12, -12, 11); fillStroke(c, '#fff7c2', '#ffd166', 3);
    },
    alien: function (c) {
      c.lineWidth = 3; c.strokeStyle = '#3f9c3a';
      c.beginPath(); c.moveTo(-10, -26); c.lineTo(-19, -40); c.moveTo(10, -26); c.lineTo(19, -40); c.stroke();
      circ(c, -19, -41, 4.5); fillStroke(c, '#ffd166', '#e89a1a', 2); circ(c, 19, -41, 4.5); fillStroke(c, '#ffd166', '#e89a1a', 2);
      c.beginPath();
      c.moveTo(0, -30);
      c.bezierCurveTo(26, -30, 35, -10, 29, 6);
      c.bezierCurveTo(23, 22, 10, 33, 0, 33);
      c.bezierCurveTo(-10, 33, -23, 22, -29, 6);
      c.bezierCurveTo(-35, -10, -26, -30, 0, -30);
      c.closePath(); fillStroke(c, '#7ed957', '#3f9c3a', 3.5);
      c.fillStyle = '#1d1640'; ell(c, -12, 0, 8.5, 12, 0.5); c.fill(); ell(c, 12, 0, 8.5, 12, -0.5); c.fill();
      c.fillStyle = '#ffffff'; circ(c, -14, -5, 3); c.fill(); circ(c, 10, -5, 3); c.fill();
      c.beginPath(); c.arc(0, 17, 6, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 3; c.strokeStyle = '#1d1640'; c.stroke();
      c.fillStyle = 'rgba(255,111,168,.55)'; circ(c, -20, 13, 3.5); c.fill(); circ(c, 20, 13, 3.5); c.fill();
    },
    dog: function (c) {
      var brown = '#7a4a2a';
      ell(c, 0, 2, 23, 27); fillStroke(c, '#ffffff', '#c9b39a', 2.5);
      c.save(); ell(c, 0, 2, 23, 27); c.clip();
      c.fillStyle = brown; ell(c, 0, -21, 27, 16); c.fill();
      ell(c, -11, -4, 9.5, 8.5, 0.25); c.fill(); ell(c, 11, -4, 9.5, 8.5, -0.25); c.fill();
      c.fillStyle = '#ffffff'; ell(c, 0, -12, 4.5, 15); c.fill();
      c.restore();
      c.fillStyle = brown; ell(c, -26, 10, 10, 22, 0.22); c.fill(); ell(c, 26, 10, 10, 22, -0.22); c.fill();
      c.strokeStyle = '#55301a'; c.lineWidth = 2;
      c.beginPath(); c.arc(-27, 14, 5, 0.3, 2.2); c.stroke(); c.beginPath(); c.arc(27, 14, 5, 0.9, 2.8); c.stroke();
      c.fillStyle = '#2b1a10'; circ(c, -10, -3, 4.2); c.fill(); circ(c, 10, -3, 4.2); c.fill();
      c.fillStyle = '#ffffff'; circ(c, -8.8, -4.4, 1.5); c.fill(); circ(c, 11.2, -4.4, 1.5); c.fill();
      c.fillStyle = 'rgba(122,74,42,.65)';
      [[-8, 15], [-11, 11], [-5, 18], [8, 15], [11, 11], [5, 18]].forEach(function (p) { circ(c, p[0], p[1], 1.3); c.fill(); });
      c.fillStyle = '#ff6f8f'; ell(c, 0, 23, 4.2, 5); c.fill();
      c.fillStyle = '#2b1a10'; ell(c, 0, 10, 6.5, 4.8); c.fill();
      c.strokeStyle = '#2b1a10'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, 14); c.lineTo(0, 17); c.moveTo(-6, 18); c.quadraticCurveTo(-3, 21, 0, 17); c.quadraticCurveTo(3, 21, 6, 18); c.stroke();
    },
    saturn: function (c) {
      var tilt = -0.38;
      c.save(); c.rotate(tilt);
      c.beginPath(); c.ellipse(0, 0, 40, 11, 0, Math.PI, 2 * Math.PI); c.lineWidth = 6; c.strokeStyle = '#ffe3a8'; c.stroke();
      c.restore();
      var g = c.createRadialGradient(-7, -8, 3, 0, 0, 22);
      g.addColorStop(0, '#ffe7a8'); g.addColorStop(1, '#e0a34f');
      circ(c, 0, 0, 20); c.fillStyle = g; c.fill();
      c.save(); circ(c, 0, 0, 20); c.clip(); c.rotate(tilt);
      c.fillStyle = 'rgba(190,120,55,.38)'; c.fillRect(-22, -9, 44, 4); c.fillRect(-22, 4, 44, 5);
      c.restore();
      c.save(); c.rotate(tilt);
      c.beginPath(); c.ellipse(0, 0, 40, 11, 0, 0, Math.PI); c.lineWidth = 6; c.strokeStyle = '#ffe3a8'; c.stroke();
      c.beginPath(); c.ellipse(0, 0, 40, 11, 0, 0, Math.PI); c.lineWidth = 1.8; c.strokeStyle = '#d9a24f'; c.stroke();
      c.restore();
    },
    flower: function (c) {
      for (var i = 0; i < 5; i++) {
        var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        ell(c, Math.cos(a) * 18, Math.sin(a) * 18, 12, 17, a + Math.PI / 2);
        fillStroke(c, '#ff6fa8', '#e0457f', 3);
      }
      circ(c, 0, 0, 13); fillStroke(c, '#ffd166', '#f08a24', 3);
      c.fillStyle = '#5a3410'; circ(c, -4.5, -2, 2); c.fill(); circ(c, 4.5, -2, 2); c.fill();
      c.beginPath(); c.arc(0, 2, 4.5, 0.15 * Math.PI, 0.85 * Math.PI); c.lineWidth = 2; c.strokeStyle = '#5a3410'; c.stroke();
    },
    lightning: function (c) {
      var pts = [[6, -40], [-20, 6], [-3, 6], [-12, 40], [22, -6], [4, -6], [16, -40]];
      c.beginPath(); pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.closePath();
      fillStroke(c, '#ffd166', '#ff9f1c', 4.5);
      c.beginPath(); c.moveTo(7, -34); c.lineTo(-12, 1); c.lineWidth = 2.5; c.strokeStyle = 'rgba(255,255,255,.75)'; c.stroke();
    }
  };

  function drawSticker(ctx, id, cx, cy, size, opt) {
    opt = opt || {};
    var back = STICKER_BACK[id] || '#ffffff';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(size / 100, size / 100);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (opt.backing !== false) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = size * 0.05; ctx.shadowOffsetY = size * 0.02;
      circ(ctx, 0, 0, 47); ctx.fillStyle = back; ctx.fill();
      ctx.restore();
      circ(ctx, 0, 0, 47); ctx.lineWidth = 3;
      ctx.strokeStyle = back === '#ffffff' ? 'rgba(40,30,90,.18)' : 'rgba(255,255,255,.95)'; ctx.stroke();
    }
    (DRAW[id] || DRAW.star)(ctx, back);
    ctx.restore();
  }
  function drawLock(ctx, cx, cy, size) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(size / 100, size / 100);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(-14, -12); ctx.arc(0, -12, 14, Math.PI, 2 * Math.PI); ctx.lineTo(14, 2);
    ctx.lineWidth = 8; ctx.strokeStyle = '#3a3470'; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = '#d9d4f5'; ctx.stroke();
    rrect(ctx, -22, -4, 44, 34, 8); fillStroke(ctx, '#ffd166', '#b07a14', 3.5);
    circ(ctx, 0, 9, 4.5); ctx.fillStyle = '#6b4a10'; ctx.fill(); ctx.fillRect(-2, 10, 4, 10);
    ctx.restore();
  }
  function stickerIcon(id, px) {
    px = px || 96;
    var cv = document.createElement('canvas'); cv.width = cv.height = px;
    drawSticker(cv.getContext('2d'), id, px / 2, px / 2, px * 0.96);
    return cv;
  }

  /* -------------------------------------------------- body texture painter */
  function patternColor(d) {
    if (cdist(d.trim, d.body) < 80) return lum(d.body) > 0.55 ? 'rgba(40,30,90,.22)' : 'rgba(255,255,255,.42)';
    return d.trim;
  }
  function paintPattern(ctx, W, H, d) {
    var p = d.pattern, pc = patternColor(d), i, j, x, y, step;
    ctx.save(); ctx.fillStyle = pc; ctx.strokeStyle = pc; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (p === 'galaxy') {
      var gg = ctx.createLinearGradient(0, 0, 0, H); gg.addColorStop(0, '#120a3a'); gg.addColorStop(0.5, '#2b1470'); gg.addColorStop(1, '#0b1a4a');
      ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H);
      var seed = 7; var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      [['#ff6fd8', 0.2, 0.3], ['#5fe0c8', 0.65, 0.55], [d.trim, 0.4, 0.8], ['#8f6bff', 0.88, 0.2]].forEach(function (b) {
        var r = W * 0.22, rg = ctx.createRadialGradient(W * b[1], H * b[2], 0, W * b[1], H * b[2], r);
        rg.addColorStop(0, b[0]); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = 0.55; ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
      });
      ctx.globalAlpha = 1;
      // a little spiral galaxy
      var gx = W * 0.62, gy = H * 0.42, gr = Math.min(W * 0.12, H * 0.3);
      for (i = 0; i < 260; i++) { var arm = i % 2, tt = (i / 260) * 3.2, ang = tt * 2.2 + arm * Math.PI, rr = tt / 3.2 * gr; ctx.globalAlpha = 0.9 - tt / 4; ctx.fillStyle = i % 3 ? '#ffe9a8' : '#ffffff'; circ(ctx, gx + Math.cos(ang) * rr + (rnd() - 0.5) * 6, gy + Math.sin(ang) * rr * 0.6 + (rnd() - 0.5) * 6, 1.6 + rnd() * 1.6); ctx.fill(); }
      var core = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr * 0.3); core.addColorStop(0, 'rgba(255,250,220,1)'); core.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = core; ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);
      for (i = 0; i < 420; i++) { ctx.globalAlpha = 0.4 + rnd() * 0.6; ctx.fillStyle = rnd() < 0.15 ? '#ffd166' : '#ffffff'; circ(ctx, rnd() * W, rnd() * H, rnd() < 0.08 ? 3 : 1 + rnd() * 1.2); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff';
      for (i = 0; i < 14; i++) { starPath(ctx, rnd() * W, rnd() * H, 9, 3.5, 4, 0); ctx.fill(); }
    } else if (p === 'stripes') {
      var n = Math.max(3, Math.round(H / 110)), bh = H / (n * 2.3);
      for (i = 0; i < n; i++) { y = H * (i + 0.5) / n; ctx.fillRect(0, y - bh / 2, W, bh); }
    } else if (p === 'spots') {
      step = W / 11;
      for (j = 0, y = step * 0.4; y < H + step; j++, y += step * 0.87) {
        for (i = -1; i <= 11; i++) { circ(ctx, i * step + (j % 2 ? step / 2 : 0), y, step * 0.26); ctx.fill(); }
      }
    } else if (p === 'stars') {
      step = W / 9;
      for (j = 0, y = step * 0.45; y < H + step; j++, y += step * 0.9) {
        for (i = -1; i <= 9; i++) {
          x = i * step + (j % 2 ? step / 2 : 0);
          starPath(ctx, x, y, step * 0.25, step * 0.11, 5, ((i * 7 + j * 3) % 5) * 0.22); ctx.fill();
        }
      }
    } else if (p === 'checks') {
      step = W / 16; ctx.globalAlpha = 0.8;
      for (j = 0; j * step < H; j++) for (i = 0; i < 16; i++) if ((i + j) % 2) ctx.fillRect(i * step, j * step, step, step);
    } else if (p === 'zigzag') {
      var per = W / 16, amp = per * 0.36, bands = Math.max(2, Math.round(H / 150));
      ctx.lineWidth = per * 0.3;
      for (j = 0; j < bands; j++) {
        y = H * (j + 0.5) / bands;
        ctx.beginPath();
        for (i = -1; i <= 33; i++) ctx.lineTo(i * per / 2, y + (i % 2 ? -amp : amp));
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  function stickerSlots(P) {
    var low = P.fins === 3 ? [[0.167, 0.17], [0.833, 0.17]] : [[0.25, 0.17], [0.75, 0.17]];
    return [[0.375, 0.66], [0.625, 0.66], [0.125, 0.66], [0.875, 0.66]].concat(low);
  }
  function paintBody(cv, d, P) {
    var ctx = cv.getContext('2d');
    var circum = 2 * Math.PI * P.R, len = P.y1 - P.y0;
    var W = 1024, H = W * len / circum, pxU = W / circum; // logical px per unit
    ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
    ctx.fillStyle = d.body; ctx.fillRect(0, 0, W, H);
    paintPattern(ctx, W, H, d);
    // decorative band just under the nose ring
    var pc = patternColor(d);
    ctx.fillStyle = pc; ctx.fillRect(0, H * 0.018, W, H * 0.045);
    ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.fillRect(0, H * 0.07, W, H * 0.008);
    // name (both sides, reading tail -> nose)
    if (d.name) {
      var light = lum(d.body) > 0.62;
      var fill = light ? '#2a1f66' : '#ffffff', stroke = light ? '#ffffff' : 'rgba(26,18,70,.9)';
      var maxLen = H * 0.56, size = 0.5 * P.R * pxU;
      ctx.font = '800 ' + size + 'px ' + FONT;
      var w = ctx.measureText(d.name).width;
      if (w > maxLen) size = size * maxLen / w;
      [0.25, 0.75].forEach(function (u) {
        ctx.save();
        ctx.translate(u * W, H * 0.38);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '800 ' + size + 'px ' + FONT;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.2; ctx.strokeStyle = stroke;
        ctx.strokeText(d.name, 0, size * 0.04);
        ctx.fillStyle = fill; ctx.fillText(d.name, 0, size * 0.04);
        ctx.restore();
      });
    }
    // stickers in fixed slots
    var slots = stickerSlots(P), sz = Math.max(0.15, P.R * 0.6) * pxU;
    d.stickers.forEach(function (id, k) {
      var s = slots[k]; if (!s) return;
      var x = s[0] * W, y = (1 - s[1]) * H;
      [-W, 0, W].forEach(function (off) {
        if (x + off > -sz && x + off < W + sz) drawSticker(ctx, id, x + off, y, sz);
      });
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /* --------------------------------------------------------- 3D building */
  function glowTexture() {
    var cv = document.createElement('canvas'); cv.width = cv.height = 64;
    var c = cv.getContext('2d'), g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(cv);
  }
  function std(color, o) {
    o = o || {};
    return new T.MeshStandardMaterial({
      color: new T.Color(color), roughness: o.roughness != null ? o.roughness : 0.48, metalness: o.metalness || 0.05,
      emissive: new T.Color(o.emissive || '#000000'), emissiveIntensity: o.ei != null ? o.ei : 1, map: o.map || null, side: o.side || T.FrontSide
    });
  }
  function finShape(P) {
    var rb = bodyR(P, 0.12) * 0.92, yB = P.y0, top = yB + P.finRoot, w = P.finW, drop = P.finDrop;
    var s = new T.Shape();
    s.moveTo(rb, top);
    s.quadraticCurveTo(rb + w * 0.32, top - P.finRoot * 0.22, rb + w, yB - drop + 0.07);
    s.quadraticCurveTo(rb + w + 0.012, yB - drop - 0.025, rb + w - 0.06, yB - drop - 0.012);
    s.quadraticCurveTo(rb + w * 0.42, yB - drop * 0.3, rb, yB + 0.02);
    s.lineTo(rb, top);
    s.userData = { tip: new T.Vector2(rb + w - 0.022, yB - drop - 0.005) };
    return s;
  }
  function coneFlame(radius, base, tip, segs) {
    var geo = new T.ConeGeometry(radius, 1, segs || 20, 8, true);
    geo.rotateX(Math.PI); geo.translate(0, -0.5, 0);
    var pos = geo.attributes.position, cols = new Float32Array(pos.count * 3), a = new T.Color(base), b = new T.Color(tip), c = new T.Color();
    for (var i = 0; i < pos.count; i++) {
      var t = clamp(-pos.getY(i), 0, 1), f = Math.pow(1 - t, 1.4);
      c.copy(a).lerp(b, t).multiplyScalar(f);
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new T.BufferAttribute(cols, 3));
    var mat = new T.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
    return new T.Mesh(geo, mat);
  }

  function build(design, bopts) {
    var faces = (bopts && bopts.faces) || [];
    var d = normalize(design), P = SHAPE[d.shape], L = P.y1 - P.y0;
    var group = new T.Group(); group.name = 'HarperRocket';
    var orient = new T.Group(); orient.rotation.x = Math.PI / 2; group.add(orient);
    var inner = new T.Group(); orient.add(inner);
    var ext = extents(P), k = 2 / (ext.top - ext.bot);
    orient.scale.setScalar(k);
    inner.position.y = -(ext.top + ext.bot) / 2;
    var glowTex = glowTexture();
    var rTop = bodyR(P, 1), rBot = bodyR(P, 0), u = P.R / 0.3;

    // body with painted canvas texture
    var pts = [], N = 40, i;
    for (i = 0; i <= N; i++) { var t = i / N; pts.push(new T.Vector2(bodyR(P, t), P.y0 + t * L)); }
    var bodyCanvas = document.createElement('canvas'); bodyCanvas.width = 1024; bodyCanvas.height = 512;
    paintBody(bodyCanvas, d, P);
    var bodyTex = new T.CanvasTexture(bodyCanvas);
    bodyTex.anisotropy = 4;
    var body = new T.Mesh(new T.LatheGeometry(pts, 64), std('#ffffff', { map: bodyTex, roughness: 0.42 }));
    body.name = 'body'; inner.add(body);

    // nose cone
    var np = [];
    for (i = 0; i <= 30; i++) {
      var s = i / 30, r = rTop * Math.pow(Math.max(0, 1 - Math.pow(s, P.noseP)), P.noseQ);
      np.push(new T.Vector2(i === 30 ? 0 : Math.max(r, 0.0005), P.y1 + s * P.nose));
    }
    var nose = new T.Mesh(new T.LatheGeometry(np, 48), std(d.nose, { roughness: 0.38 }));
    nose.name = 'nose'; inner.add(nose);
    var tipLight = new T.Mesh(new T.SphereGeometry(P.R * 0.07, 16, 12), std(d.trim, { emissive: d.trim, ei: 0.7 }));
    tipLight.position.y = P.y1 + P.nose - P.R * 0.02; inner.add(tipLight);

    // trim rings
    var trimMat = std(d.trim, { roughness: 0.32, metalness: 0.25 });
    var ringTop = new T.Mesh(new T.TorusGeometry(rTop + 0.004, 0.024 * u, 12, 56), trimMat);
    ringTop.geometry.rotateX(Math.PI / 2); ringTop.position.y = P.y1; inner.add(ringTop);
    var ringBot = new T.Mesh(new T.TorusGeometry(rBot + 0.004, 0.022 * u, 12, 56), trimMat);
    ringBot.geometry.rotateX(Math.PI / 2); ringBot.position.y = P.y0; inner.add(ringBot);

    // base cap
    var nzTop = P.R * P.nzTop, nzBot = P.R * P.nzBot, yTop = P.y0 - 0.04, yExit = yTop - P.nzLen;
    var cap = new T.Mesh(new T.LatheGeometry([
      new T.Vector2(0.0005, P.y0 - 0.065), new T.Vector2(nzTop * 1.15, P.y0 - 0.06), new T.Vector2(rBot * 0.8, P.y0 - 0.035), new T.Vector2(rBot, P.y0)
    ], 48), trimMat);
    inner.add(cap);

    // nozzle bell (inner surface down, lip, outer surface up)
    var th = 0.012 * u, bell = [];
    for (i = 0; i <= 12; i++) { var b = i / 12; bell.push(new T.Vector2(nzTop - th + (nzBot - nzTop) * Math.pow(b, 1.6), yTop - b * P.nzLen)); }
    bell.push(new T.Vector2(nzBot, yExit));
    for (i = 12; i >= 0; i--) { var b2 = i / 12; bell.push(new T.Vector2(nzTop + (nzBot - nzTop) * Math.pow(b2, 1.6) + th * 0.2, yTop - b2 * P.nzLen)); }
    var nozzle = new T.Mesh(new T.LatheGeometry(bell, 40), std('#b9bfd9', { roughness: 0.3, metalness: 0.45 }));
    nozzle.name = 'nozzle'; inner.add(nozzle);
    var nozRing = new T.Mesh(new T.TorusGeometry(nzBot + th * 0.3, 0.012 * u, 8, 40), trimMat);
    nozRing.geometry.rotateX(Math.PI / 2); nozRing.position.y = yExit; inner.add(nozRing);
    var glowMat = new T.MeshBasicMaterial({ color: new T.Color('#3a1a10'), side: T.DoubleSide });
    var glowDisk = new T.Mesh(new T.CircleGeometry(nzTop * 0.98, 28), glowMat);
    glowDisk.geometry.rotateX(Math.PI / 2); glowDisk.position.y = yTop - 0.004; inner.add(glowDisk);

    // fins
    var shape = finShape(P), fth = 0.034 * Math.sqrt(u);
    var finGeo = new T.ExtrudeGeometry(shape, { depth: fth, bevelEnabled: true, bevelThickness: fth * 0.45, bevelSize: fth * 0.45, bevelSegments: 3, curveSegments: 14 });
    finGeo.translate(0, 0, -fth / 2);
    var finMat = std(d.fins, { roughness: 0.4 });
    var tipGeo = new T.SphereGeometry(0.03 * u, 14, 10);
    var tipMat = std(d.trim, { emissive: d.trim, ei: 0.85, roughness: 0.3 });
    for (i = 0; i < P.fins; i++) {
      var phi = P.fins === 3 ? i * Math.PI * 2 / 3 : Math.PI / 4 + i * Math.PI / 2;
      var pivot = new T.Group(); pivot.rotation.y = phi - Math.PI / 2;
      var fin = new T.Mesh(finGeo, finMat); fin.name = 'fin'; pivot.add(fin);
      var tip = new T.Mesh(tipGeo, tipMat); tip.position.set(shape.userData.tip.x, shape.userData.tip.y, 0); pivot.add(tip);
      inner.add(pivot);
    }

    // portholes along the top (lathe -Z, which is world +Y)
    var wr = P.wr, ringGeo = new T.TorusGeometry(wr, wr * 0.24, 12, 32);
    var glassGeo = new T.SphereGeometry(wr * 0.96, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    glassGeo.rotateX(Math.PI / 2); glassGeo.scale(1, 1, 0.4);
    var glassMat = std('#2f6fd0', { emissive: '#6fd3ff', ei: 0.85, roughness: 0.12, metalness: 0.1 });
    var shineGeo = new T.CircleGeometry(wr * 0.22, 14);
    var shineMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    var portRingMat = std(d.trim, { roughness: 0.28, metalness: 0.35 });
    for (i = 0; i < d.windows; i++) {
      var wy = P.y1 - 0.1 - wr - i * wr * 2.6, wt = (wy - P.y0) / L, wrr = bodyR(P, wt);
      var n = new T.Vector3(0, -bodyDrDy(P, wt), -1).normalize();
      var win = new T.Group();
      win.position.set(0, wy, 0).addScaledVector(n, 0.004).add(new T.Vector3(0, 0, -wrr));
      win.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), n);
      win.add(new T.Mesh(ringGeo, portRingMat));
      if (faces[i]) {
        var ft = new T.CanvasTexture(faces[i]); if (T.sRGBEncoding) ft.encoding = T.sRGBEncoding;
        var face = new T.Mesh(new T.CircleGeometry(wr * 0.92, 28), new T.MeshBasicMaterial({ map: ft }));
        face.position.z = wr * 0.02; win.add(face);
        win.add(new T.Mesh(glassGeo, new T.MeshStandardMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.1, depthWrite: false })));
      } else win.add(new T.Mesh(glassGeo, glassMat));
      var shine = new T.Mesh(shineGeo, shineMat); shine.position.set(-wr * 0.36, wr * 0.36, wr * 0.36); win.add(shine);
      var glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0x8fe3ff, transparent: true, opacity: 0.4, blending: T.AdditiveBlending, depthWrite: false }));
      glow.scale.set(wr * 3.4, wr * 3.4, 1); glow.position.z = wr * 0.15; win.add(glow);
      inner.add(win);
    }

    // flame (hidden until setFlame)
    var flame = new T.Group(); flame.position.y = yExit + 0.03; flame.visible = false; inner.add(flame);
    var outer = coneFlame(nzBot * 0.92, '#ff8a2a', '#ff2a3a', 22);
    var core = coneFlame(nzBot * 0.55, '#fff6c8', '#ffb347', 16);
    flame.add(outer); flame.add(core);
    var puffs = [];
    for (i = 0; i < 7; i++) {
      var sp = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffa040, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
      flame.add(sp); puffs.push(sp);
    }
    var hot = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd27a, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
    flame.add(hot);

    var rk = {
      design: d, P: P, bodyCanvas: bodyCanvas, bodyTex: bodyTex, glowTex: glowTex, glowMat: glowMat, disposed: false,
      flame: { group: flame, outer: outer, core: core, puffs: puffs, hot: hot },
      repaint: function () { if (rk.disposed) return; paintBody(bodyCanvas, rk.design, P); bodyTex.needsUpdate = true; }
    };
    group.userData.rk = rk;

    // repaint the name once the display font arrives
    try {
      if (document.fonts && document.fonts.check && !document.fonts.check('800 40px "Baloo 2"')) {
        document.fonts.load('800 40px "Baloo 2"').then(function (f) { if (f && f.length) rk.repaint(); }).catch(function () {});
      }
    } catch (e) { /* ignore */ }
    return group;
  }

  var _c1 = new T.Color(), _c2 = new T.Color();
  function setFlame(group, power) {
    var rk = group && group.userData && group.userData.rk;
    if (!rk || rk.disposed) return;
    power = clamp(+power || 0, 0, 1);
    var F = rk.flame, P = rk.P, now = performance.now() / 1000;
    _c1.set('#3a1a10'); _c2.set('#ffb050');
    rk.glowMat.color.copy(_c1).lerp(_c2, Math.min(1, power * 1.6));
    F.group.visible = power > 0.01;
    if (!F.group.visible) return;
    var unit = P.R;
    var flick = 1 + 0.09 * Math.sin(now * 31) + 0.06 * Math.sin(now * 17.3 + 1.3) + 0.04 * Math.sin(now * 53.1);
    var len = unit * (1.0 + 4.4 * power) * flick;
    var w = (0.8 + 0.3 * power) * (1 + 0.05 * Math.sin(now * 23.7));
    F.outer.scale.set(w, len, w);
    F.outer.material.opacity = 0.5 + 0.45 * power;
    F.core.scale.set(w * 0.95, len * 0.58, w * 0.95);
    F.core.material.opacity = 0.7 + 0.3 * power;
    var n = F.puffs.length, rate = 1.5 + power * 1.8;
    for (var i = 0; i < n; i++) {
      var ph = (now * rate + i / n) % 1, sp = F.puffs[i];
      var jx = Math.sin(now * 13 + i * 2.1) * unit * 0.06, jz = Math.cos(now * 11 + i * 1.7) * unit * 0.06;
      sp.position.set(jx, -ph * len * 0.95, jz);
      var sz = unit * (0.75 + power * 1.1) * (1.05 - ph * 0.55);
      sp.scale.set(sz, sz, 1);
      sp.material.opacity = (1 - ph) * (0.25 + 0.5 * power);
      sp.material.color.setRGB(1, 0.75 - ph * 0.45, 0.35 - ph * 0.3);
    }
    var hs = unit * (1.3 + power * 1.2) * flick;
    F.hot.scale.set(hs, hs, 1); F.hot.position.y = -unit * 0.15;
    F.hot.material.opacity = 0.45 + 0.4 * power;
  }

  function disposeMaterial(m) {
    if (!m) return;
    ['map', 'emissiveMap', 'alphaMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'].forEach(function (k) { if (m[k]) m[k].dispose(); });
    m.dispose();
  }
  function dispose(group) {
    if (!group) return;
    var rk = group.userData && group.userData.rk;
    if (rk) { rk.disposed = true; }
    var geos = new Set(), mats = new Set();
    group.traverse(function (o) {
      if (o.geometry && !o.isSprite) geos.add(o.geometry);
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { mats.add(m); });
    });
    geos.forEach(function (g) { g.dispose(); });
    mats.forEach(disposeMaterial);
    if (rk) { if (rk.bodyTex) rk.bodyTex.dispose(); if (rk.glowTex) rk.glowTex.dispose(); }
    if (group.parent) group.parent.remove(group);
  }

  /* ------------------------------------------------------------- builder */
  var CSS = [
    '.rk-overlay{position:fixed;inset:0;z-index:9000;display:grid;grid-template-columns:100%;grid-template-rows:minmax(200px,38%) minmax(0,1fr);',
    'background:var(--space,#0d0b2e);color:var(--ink,#fdf8ff);font-family:var(--body,"Atkinson Hyperlegible",Verdana,sans-serif);font-size:18px;',
    'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) 0 env(safe-area-inset-left,0px);',
    '-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:contain;animation:rk-in .28s ease-out;}',
    '.rk-overlay *,.rk-overlay *::before,.rk-overlay *::after{box-sizing:border-box;}',
    '@keyframes rk-in{from{opacity:0;transform:scale(.98);}}',
    '@media (min-width:720px) and (min-aspect-ratio:1/1){.rk-overlay{grid-template-columns:minmax(0,1fr) min(480px,46%);grid-template-rows:100%;}',
    '.rk-panel{border-left:2px solid var(--line,rgba(255,255,255,.16));border-top:0!important;border-radius:0!important;}}',
    '.rk-overlay button{font:inherit;color:inherit;cursor:pointer;border:0;background:none;touch-action:manipulation;margin:0;}',
    '.rk-overlay button:focus-visible,.rk-overlay input:focus-visible{outline:3px solid var(--gold,#ffd166);outline-offset:3px;}',
    '.rk-stage{position:relative;min-height:0;overflow:hidden;touch-action:none;',
    'background:radial-gradient(circle at 78% 18%,rgba(255,111,168,.22),transparent 38%),radial-gradient(circle at 15% 85%,rgba(95,224,200,.18),transparent 42%),linear-gradient(180deg,#191457,var(--space,#0d0b2e));}',
    '.rk-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;}',
    '.rk-canvas:active{cursor:grabbing;}',
    '.rk-title{position:absolute;top:14px;left:16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;pointer-events:none;}',
    '.rk-title b{font-family:var(--display,"Baloo 2",sans-serif);font-weight:800;font-size:24px;line-height:1;padding:10px 16px;border-radius:999px;background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));}',
    '.rk-starcount{font-weight:700;font-size:18px;padding:8px 14px;border-radius:999px;background:rgba(255,209,102,.16);color:var(--gold,#ffd166);border:2px solid rgba(255,209,102,.35);}',
    '.rk-hint{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);font-size:18px;color:var(--ink-soft,#c9c3f0);background:rgba(13,11,46,.55);padding:6px 14px;border-radius:999px;pointer-events:none;white-space:nowrap;transition:opacity .6s;}',
    '.rk-toast{position:absolute;left:50%;bottom:56px;transform:translate(-50%,10px);max-width:calc(100% - 32px);width:max-content;text-align:center;background:#fff;color:#231a4f;font-weight:700;font-size:18px;padding:10px 16px;border-radius:16px;box-shadow:0 6px 18px rgba(0,0,0,.35);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;}',
    '.rk-toast.rk-show{opacity:1;transform:translate(-50%,0);}',
    '.rk-nogl{position:absolute;inset:0;display:grid;place-items:center;color:var(--ink-soft,#c9c3f0);font-size:18px;text-align:center;padding:20px;}',
    '.rk-panel{display:flex;flex-direction:column;min-height:0;background:var(--panel-solid,#1e1954);border-top:2px solid var(--line,rgba(255,255,255,.16));border-radius:22px 22px 0 0;}',
    '.rk-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px 14px 8px;flex:none;}',
    '.rk-tab{min-height:48px;border-radius:14px;background:rgba(255,255,255,.07)!important;border:2px solid var(--line,rgba(255,255,255,.16))!important;font-family:var(--display,"Baloo 2",sans-serif)!important;font-weight:800;font-size:19px!important;color:var(--ink-soft,#c9c3f0)!important;line-height:1.1;padding:4px 6px;}',
    '.rk-tab[aria-selected="true"]{background:var(--gold,#ffd166)!important;color:#2a1a05!important;border-color:transparent!important;}',
    '.rk-body{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:6px 16px 16px;}',
    '.rk-sec[hidden]{display:none!important;}',
    '.rk-label{display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:var(--display,"Baloo 2",sans-serif);font-weight:800;font-size:20px;margin:10px 0 8px;color:var(--ink,#fdf8ff);}',
    '.rk-label small{font-family:var(--body,sans-serif);font-weight:700;font-size:18px;color:var(--ink-soft,#c9c3f0);}',
    '.rk-swatches{display:grid;grid-template-columns:repeat(5,minmax(48px,1fr));gap:10px;justify-items:center;}',
    '.rk-sw{width:100%;max-width:58px;aspect-ratio:1/1;min-height:48px;border-radius:50%!important;border:3px solid rgba(255,255,255,.3)!important;box-shadow:inset -5px -6px 10px rgba(0,0,0,.22),inset 4px 4px 8px rgba(255,255,255,.3);transition:transform .15s;}',
    '.rk-sw[aria-pressed="true"]{transform:scale(1.08);box-shadow:0 0 0 3px var(--panel-solid,#1e1954),0 0 0 7px var(--ink,#fdf8ff),inset -5px -6px 10px rgba(0,0,0,.22);}',
    '.rk-sw:active,.rk-opt:active,.rk-stk:active,.rk-slot:active{transform:scale(.94);}',
    '.rk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}',
    '.rk-opt,.rk-stk{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:48px;padding:10px 6px;border-radius:18px!important;background:rgba(255,255,255,.07)!important;border:3px solid transparent!important;font-weight:700;font-size:18px!important;text-align:center;line-height:1.15;position:relative;}',
    '.rk-opt[aria-pressed="true"]{border-color:var(--gold,#ffd166)!important;background:rgba(255,209,102,.14)!important;}',
    '.rk-mini{width:100%;max-width:120px;height:auto;aspect-ratio:5/3;border-radius:12px;display:block;}',
    '.rk-shapecv{width:72px;height:90px;display:block;}',
    '.rk-dots{display:flex;gap:6px;height:44px;align-items:center;}',
    '.rk-dots i{width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#c9f3ff,#3fa6e8 70%);box-shadow:0 0 0 4px var(--gold,#ffd166),0 0 12px rgba(111,211,255,.8);}',
    '.rk-slots{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;}',
    '.rk-slot{aspect-ratio:1/1;min-height:48px;border-radius:50%!important;display:grid;place-items:center;position:relative;background:rgba(255,255,255,.06)!important;border:3px dashed rgba(255,255,255,.25)!important;color:var(--ink-soft,#c9c3f0);font-weight:700;font-size:18px!important;padding:0;}',
    '.rk-slot.rk-filled{border:3px solid rgba(255,255,255,.35)!important;background:rgba(255,255,255,.1)!important;}',
    '.rk-slot canvas{width:88%;height:88%;}',
    '.rk-slot .rk-x{position:absolute;top:-6px;right:-6px;width:24px;height:24px;border-radius:50%;background:var(--pink,#ff6fa8);color:#fff;font-size:18px;line-height:22px;font-weight:800;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.35);}',
    '.rk-stk canvas{width:64px;height:64px;}',
    '.rk-stk.rk-locked canvas:not(.rk-lock){opacity:.35;filter:grayscale(.6);}',
    '.rk-stk .rk-lock{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:52px;height:52px;pointer-events:none;}',
    '.rk-opt.rk-optlock canvas,.rk-opt.rk-optlock .rk-dots{opacity:.35;filter:grayscale(.7);}',
    '.rk-lockmsg{font-size:18px;font-weight:700;color:var(--gold,#ffd166);line-height:1.15;}',
    '.rk-stk.rk-locked .rk-stkname{display:none;}',
    '.rk-namein{width:100%;min-height:64px;font-family:var(--display,"Baloo 2",sans-serif);font-weight:800;font-size:30px;letter-spacing:.08em;text-transform:uppercase;padding:8px 16px;border-radius:16px;border:3px solid var(--line,rgba(255,255,255,.16));background:rgba(255,255,255,.08);color:var(--ink,#fdf8ff);-webkit-user-select:text;user-select:text;}',
    '.rk-namein:focus{border-color:var(--teal,#5fe0c8);outline:none;}',
    '.rk-namebar{display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:10px;}',
    '.rk-small{min-height:48px;padding:8px 18px;border-radius:999px!important;background:rgba(255,255,255,.1)!important;border:2px solid var(--line,rgba(255,255,255,.16))!important;font-weight:700;font-size:18px!important;}',
    '.rk-tipline{font-size:18px;color:var(--ink-soft,#c9c3f0);margin:12px 0 0;line-height:1.35;}',
    '.rk-actions{flex:none;display:grid;grid-template-columns:1fr 1.6fr;gap:12px;padding:12px 16px calc(12px + env(safe-area-inset-bottom,0px));border-top:2px solid var(--line,rgba(255,255,255,.16));background:var(--panel,rgba(30,25,84,.88));}',
    '.rk-cancel{min-height:60px;border-radius:999px!important;background:rgba(255,255,255,.1)!important;border:2px solid var(--line,rgba(255,255,255,.16))!important;font-weight:700;font-size:20px!important;}',
    '.rk-save{min-height:60px;border-radius:999px!important;font-family:var(--display,"Baloo 2",sans-serif)!important;font-weight:800;font-size:24px!important;color:#2a0f05!important;background:linear-gradient(180deg,#ffb084,var(--rocket,#ff7a45))!important;box-shadow:0 5px 0 var(--rocket-deep,#d9532a),0 8px 20px rgba(0,0,0,.35);}',
    '.rk-save:active{transform:translateY(4px);box-shadow:0 1px 0 var(--rocket-deep,#d9532a);}',
    '@media (max-width:420px){.rk-tab{font-size:18px!important;}.rk-title b{font-size:20px;}.rk-slots{gap:6px;}}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('rk-style')) return;
    var st = document.createElement('style'); st.id = 'rk-style'; st.textContent = CSS;
    document.head.appendChild(st);
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function drawPatternIcon(cv, d, pattern) {
    var ctx = cv.getContext('2d'), dd = { body: d.body, trim: d.trim, pattern: pattern };
    ctx.setTransform(cv.width / 400, 0, 0, cv.height / 240, 0, 0);
    ctx.fillStyle = d.body; ctx.fillRect(0, 0, 400, 240);
    paintPattern(ctx, 1024, 600, dd);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  function drawShapeIcon(cv, d, shape) {
    var P = SHAPE[shape], ctx = cv.getContext('2d'), w = cv.width, h = cv.height, ext = extents(P);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, w, h);
    var sc = Math.min(h * 0.92 / (ext.top - ext.bot), w * 0.9 / ((bodyR(P, 0.12) * 0.92 + P.finW + 0.03) * 2));
    ctx.setTransform(sc, 0, 0, -sc, w / 2, h * 0.04 + ext.top * sc);
    var i, pts = finShape(P).getPoints(10);
    ctx.fillStyle = d.fins;
    [1, -1].forEach(function (sd) { ctx.beginPath(); pts.forEach(function (p) { ctx.lineTo(p.x * sd, p.y); }); ctx.closePath(); ctx.fill(); });
    var nzT = P.R * P.nzTop, nzB = P.R * P.nzBot, yT = P.y0 - 0.04, yE = yT - P.nzLen;
    ctx.fillStyle = '#b9bfd9'; ctx.beginPath(); ctx.moveTo(-nzT, yT); ctx.lineTo(nzT, yT); ctx.lineTo(nzB, yE); ctx.lineTo(-nzB, yE); ctx.closePath(); ctx.fill();
    ctx.fillStyle = d.body; ctx.beginPath();
    for (i = 0; i <= 20; i++) ctx.lineTo(bodyR(P, i / 20), P.y0 + (P.y1 - P.y0) * i / 20);
    for (i = 20; i >= 0; i--) ctx.lineTo(-bodyR(P, i / 20), P.y0 + (P.y1 - P.y0) * i / 20);
    ctx.closePath(); ctx.fill();
    var rTop = bodyR(P, 1);
    ctx.fillStyle = d.nose; ctx.beginPath();
    for (i = 0; i <= 20; i++) { var s = i / 20; ctx.lineTo(rTop * Math.pow(Math.max(0, 1 - Math.pow(s, P.noseP)), P.noseQ), P.y1 + s * P.nose); }
    for (i = 20; i >= 0; i--) { var s2 = i / 20; ctx.lineTo(-rTop * Math.pow(Math.max(0, 1 - Math.pow(s2, P.noseP)), P.noseQ), P.y1 + s2 * P.nose); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = d.trim; ctx.fillRect(-rTop - 0.02, P.y1 - 0.025, rTop * 2 + 0.04, 0.05);
    ctx.fillStyle = '#6fd3ff'; ctx.strokeStyle = d.trim; ctx.lineWidth = P.wr * 0.45;
    circ(ctx, 0, P.y1 - 0.1 - P.wr, P.wr); ctx.fill(); ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  var active = null;
  var lastTab = 'colours';

  function openBuilder(design, onSave, opts) {
    if (active) active.close();
    opts = opts || {};
    injectCSS();
    var d = normalize(design);
    var locked = Array.isArray(opts.lockedStickers) ? opts.lockedStickers.slice() : [];
    var needMap = opts.starsNeeded || {};
    var lockOpt = opts.lockedOptions || {};
    function optNeed(kind, v) { var m = lockOpt[kind]; return m && m[v] ? m[v] : 0; }
    function lockTag(kind, v) { var n = optNeed(kind, v); return n ? '<span class="rk-lockmsg">🔒 ' + (typeof n === 'string' ? n : n + ' more ★') + '</span>' : ''; }
    var closed = false;

    var TABS = [['colours', 'Colours'], ['pattern', 'Pattern'], ['shape', 'Shape'], ['windows', 'Windows'], ['stickers', 'Stickers'], ['name', 'Name']];
    var PARTS = [['body', 'Body'], ['nose', 'Nose'], ['fins', 'Fins'], ['trim', 'Trim']];

    var html = '';
    html += '<div class="rk-stage"><canvas class="rk-canvas" aria-label="Your rocket. Drag to spin it."></canvas>';
    html += '<div class="rk-title"><b>Rocket builder</b>' + (typeof opts.stars === 'number' ? '<span class="rk-starcount">★ ' + opts.stars + '</span>' : '') + '</div>';
    html += '<div class="rk-hint">Drag to spin</div><div class="rk-toast" role="status" aria-live="polite"></div></div>';
    html += '<div class="rk-panel"><div class="rk-tabs" role="tablist">';
    TABS.forEach(function (t) { html += '<button class="rk-tab" role="tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; });
    html += '</div><div class="rk-body">';
    // colours
    html += '<div class="rk-sec" data-sec="colours">';
    PARTS.forEach(function (p) {
      html += '<div class="rk-label">' + p[1] + '</div><div class="rk-swatches">';
      PALETTE.forEach(function (c, i) {
        html += '<button class="rk-sw" data-part="' + p[0] + '" data-col="' + c + '" style="background:' + c + '" aria-label="' + p[1] + ' ' + PALETTE_NAMES[i] + '"></button>';
      });
      html += '</div>';
    });
    html += '</div>';
    // pattern
    html += '<div class="rk-sec" data-sec="pattern"><div class="rk-label">Pick a pattern</div><div class="rk-grid">';
    PATTERNS.forEach(function (p) { html += '<button class="rk-opt' + (optNeed('pattern', p) ? ' rk-optlock' : '') + '" data-pattern="' + p + '"><canvas class="rk-mini" width="200" height="120"></canvas><span>' + PATTERN_NAMES[p] + '</span>' + lockTag('pattern', p) + '</button>'; });
    html += '</div><p class="rk-tipline">Patterns use your Trim colour.</p></div>';
    // shape
    html += '<div class="rk-sec" data-sec="shape"><div class="rk-label">Pick a shape</div><div class="rk-grid">';
    SHAPES.forEach(function (s) { html += '<button class="rk-opt' + (optNeed('shape', s) ? ' rk-optlock' : '') + '" data-shape="' + s + '"><canvas class="rk-shapecv" width="144" height="180"></canvas><span>' + SHAPE_NAMES[s] + '</span>' + lockTag('shape', s) + '</button>'; });
    html += '</div></div>';
    // windows
    html += '<div class="rk-sec" data-sec="windows"><div class="rk-label">How many windows?</div><div class="rk-grid">';
    [1, 2, 3].forEach(function (n) {
      html += '<button class="rk-opt' + (optNeed('windows', n) ? ' rk-optlock' : '') + '" data-windows="' + n + '"><span class="rk-dots">' + new Array(n + 1).join('<i></i>') + '</span><span>' + n + (n === 1 ? ' window' : ' windows') + '</span>' + lockTag('windows', n) + '</button>';
    });
    html += '</div><p class="rk-tipline">The windows glow at night so the crew can see out.</p></div>';
    // stickers
    html += '<div class="rk-sec" data-sec="stickers"><div class="rk-label">Your stickers <small class="rk-count"></small></div><div class="rk-slots"></div>';
    html += '<div class="rk-label">Tap one to stick it on</div><div class="rk-grid rk-stkgrid">';
    STICKER_IDS.forEach(function (id) {
      var isL = locked.indexOf(id) >= 0, need = needMap[id];
      var msg = typeof need === 'number' ? 'Earn ' + need + ' more star' + (need === 1 ? '' : 's') : 'Earn more stars';
      html += '<button class="rk-stk' + (isL ? ' rk-locked' : '') + '" data-sticker="' + id + '" aria-label="' + STICKER_NAMES[id] + (isL ? ' sticker, locked. ' + msg : ' sticker') + '">' +
        '<canvas width="128" height="128"></canvas>' + (isL ? '<canvas class="rk-lock" width="104" height="104"></canvas>' : '') +
        '<span class="rk-stkname">' + STICKER_NAMES[id] + '</span>' + (isL ? '<span class="rk-lockmsg">' + esc(msg) + '</span>' : '') + '</button>';
    });
    html += '</div></div>';
    // name
    html += '<div class="rk-sec" data-sec="name"><div class="rk-label">Rocket name</div>';
    html += '<input class="rk-namein" type="text" maxlength="' + MAX_NAME + '" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Rocket name">';
    html += '<div class="rk-namebar"><small class="rk-label" style="margin:0"><small class="rk-namecount"></small></small><button class="rk-small rk-clear">Clear</button></div>';
    html += '<p class="rk-tipline">It gets painted down both sides of your rocket.</p></div>';
    html += '</div><div class="rk-actions"><button class="rk-cancel">Cancel</button><button class="rk-save">Save rocket</button></div></div>';

    var root = document.createElement('div');
    root.className = 'rk-overlay';
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Rocket builder');
    root.innerHTML = html;
    document.body.appendChild(root);

    var $ = function (s) { return root.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
    var stage = $('.rk-stage'), canvas = $('.rk-canvas'), toastEl = $('.rk-toast'), hintEl = $('.rk-hint');
    var nameIn = $('.rk-namein');
    nameIn.value = d.name;

    // sticker grid icons (static)
    $$('.rk-stk').forEach(function (b) {
      var id = b.getAttribute('data-sticker'), cvs = b.querySelectorAll('canvas');
      drawSticker(cvs[0].getContext('2d'), id, 64, 64, 122);
      if (cvs[1]) drawLock(cvs[1].getContext('2d'), 52, 52, 100);
    });

    var toastTimer = 0;
    function toast(msg) {
      toastEl.textContent = msg; toastEl.classList.add('rk-show');
      clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('rk-show'); }, 2400);
    }

    function setTab(t) {
      lastTab = t;
      $$('.rk-tab').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === t)); });
      $$('.rk-sec').forEach(function (s) { s.hidden = s.getAttribute('data-sec') !== t; });
      $('.rk-body').scrollTop = 0;
    }

    function refreshUI() {
      $$('.rk-sw').forEach(function (b) { b.setAttribute('aria-pressed', String(d[b.getAttribute('data-part')].toLowerCase() === b.getAttribute('data-col'))); });
      $$('[data-pattern]').forEach(function (b) {
        var p = b.getAttribute('data-pattern'); b.setAttribute('aria-pressed', String(d.pattern === p));
        drawPatternIcon(b.querySelector('canvas'), d, p);
      });
      $$('[data-shape]').forEach(function (b) {
        var s = b.getAttribute('data-shape'); b.setAttribute('aria-pressed', String(d.shape === s));
        drawShapeIcon(b.querySelector('canvas'), d, s);
      });
      $$('[data-windows]').forEach(function (b) { b.setAttribute('aria-pressed', String(d.windows === +b.getAttribute('data-windows'))); });
      var slots = $('.rk-slots'), sh = '';
      for (var i = 0; i < MAX_STICKERS; i++) {
        var id = d.stickers[i];
        sh += id ? '<button class="rk-slot rk-filled" data-slot="' + i + '" aria-label="Peel off ' + STICKER_NAMES[id] + ' sticker"><canvas width="96" height="96"></canvas><span class="rk-x" aria-hidden="true">×</span></button>'
          : '<button class="rk-slot" data-slot="' + i + '" aria-label="Empty sticker spot ' + (i + 1) + '">' + (i + 1) + '</button>';
      }
      slots.innerHTML = sh;
      $$('.rk-slot.rk-filled').forEach(function (b) { drawSticker(b.querySelector('canvas').getContext('2d'), d.stickers[+b.getAttribute('data-slot')], 48, 48, 92); });
      $('.rk-count').textContent = d.stickers.length + ' of ' + MAX_STICKERS;
      $('.rk-namecount').textContent = d.name.length + ' / ' + MAX_NAME + ' letters';
    }

    /* --- 3D preview --- */
    var renderer = null, scene, camera, spin, rocket = null, starsA, starsB, starTex, dirty = true, raf = 0;
    var angle = Math.PI, vel = 0, dragging = false, lastX = 0, lastT = performance.now(), dragged = false;
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
    } catch (e) {
      renderer = null;
      var ng = document.createElement('div'); ng.className = 'rk-nogl'; ng.textContent = 'The 3D preview could not start, but you can still design your rocket!';
      stage.appendChild(ng);
    }
    if (renderer) {
      scene = new T.Scene();
      camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
      scene.add(new T.HemisphereLight(0xffffff, 0x4a3a7a, 0.85));
      var key = new T.DirectionalLight(0xffffff, 0.95); key.position.set(3, 4, 5); scene.add(key);
      var rim = new T.DirectionalLight(0x9fc0ff, 0.6); rim.position.set(-4, 2, -3); scene.add(rim);
      var fill = new T.DirectionalLight(0xffc9a8, 0.3); fill.position.set(-2, -3, 4); scene.add(fill);
      var holder = new T.Group(); holder.rotation.z = -0.42; scene.add(holder);
      spin = new T.Group(); holder.add(spin);
      var upright = new T.Group(); upright.rotation.x = -Math.PI / 2; spin.add(upright);
      spin.userData.upright = upright; spin.userData.holder = holder;
      // stars
      var sc = document.createElement('canvas'); sc.width = sc.height = 32;
      var sx = sc.getContext('2d'), sg = sx.createRadialGradient(16, 16, 0, 16, 16, 16);
      sg.addColorStop(0, 'rgba(255,255,255,1)'); sg.addColorStop(0.4, 'rgba(255,255,255,.6)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      sx.fillStyle = sg; sx.fillRect(0, 0, 32, 32);
      starTex = new T.CanvasTexture(sc);
      var mkStars = function (count, seed) {
        var pos = new Float32Array(count * 3), col = new Float32Array(count * 3), tints = [[1, 1, 1], [1, 0.9, 0.6], [0.7, 0.9, 1], [1, 0.75, 0.9]];
        var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
        for (var i = 0; i < count; i++) {
          pos[i * 3] = (rnd() - 0.5) * 26; pos[i * 3 + 1] = (rnd() - 0.5) * 18; pos[i * 3 + 2] = -4 - rnd() * 10;
          var tc = tints[Math.floor(rnd() * tints.length)]; col[i * 3] = tc[0]; col[i * 3 + 1] = tc[1]; col[i * 3 + 2] = tc[2];
        }
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3));
        var m = new T.PointsMaterial({ size: 0.16, map: starTex, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending });
        var p = new T.Points(g, m); scene.add(p); return p;
      };
      starsA = mkStars(160, 7); starsB = mkStars(120, 99);
    }

    var lastW = 0, lastH = 0;
    function fit() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w; lastH = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var tn = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
      var dist = Math.max(1.5 / tn, 1.05 / (tn * camera.aspect)) * 1.06;
      camera.position.set(0, 0.1, dist); camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }
    function rebuild() {
      if (!renderer) return;
      if (rocket) dispose(rocket);
      rocket = build(d);
      spin.userData.upright.add(rocket);
    }
    function loop() {
      if (closed) return;
      raf = requestAnimationFrame(loop);
      var now = performance.now(), dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      fit();
      if (dirty) { dirty = false; rebuild(); }
      if (!dragging) { vel *= Math.pow(0.04, dt); angle += vel * dt + 0.45 * dt; }
      spin.rotation.y = angle;
      spin.userData.holder.position.y = 0.2 + Math.sin(now / 900) * 0.05;
      if (rocket) setFlame(rocket, 0.42 + 0.08 * Math.sin(now / 400));
      starsA.rotation.z += dt * 0.012; starsB.rotation.z -= dt * 0.008;
      starsA.material.opacity = 0.75 + 0.25 * Math.sin(now / 700);
      starsB.material.opacity = 0.75 + 0.25 * Math.sin(now / 900 + 2);
      renderer.render(scene, camera);
    }

    function changed() { dirty = true; refreshUI(); }

    /* --- events --- */
    function onPointerDown(e) {
      dragging = true; dragged = false; lastX = e.clientX; vel = 0;
      try { canvas.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
    }
    var lastMoveT = 0;
    function onPointerMove(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, now = performance.now(), mdt = Math.max(0.008, (now - lastMoveT) / 1000);
      lastX = e.clientX; lastMoveT = now;
      angle += dx * 0.012; vel = clamp(dx * 0.012 / mdt, -14, 14);
      if (!dragged && Math.abs(dx) > 2) { dragged = true; hintEl.style.opacity = '0'; }
    }
    function onPointerUp() { dragging = false; }
    if (renderer) {
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
    }

    function onClick(e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b || !root.contains(b)) return;
      if (b.hasAttribute('data-tab')) { setTab(b.getAttribute('data-tab')); return; }
      if (b.hasAttribute('data-part')) { d[b.getAttribute('data-part')] = b.getAttribute('data-col'); hook('sfx', 'chime'); changed(); return; }
      var lk = b.hasAttribute('data-pattern') ? optNeed('pattern', b.getAttribute('data-pattern')) : b.hasAttribute('data-shape') ? optNeed('shape', b.getAttribute('data-shape')) : b.hasAttribute('data-windows') ? optNeed('windows', b.getAttribute('data-windows')) : 0;
      if (lk) { toast(typeof lk === 'string' ? lk + ' to unlock this!' : 'Earn ' + lk + ' more star' + (lk === 1 ? '' : 's') + ' to unlock this!'); hook('sfx', 'oops'); return; }
      if (b.hasAttribute('data-pattern')) { d.pattern = b.getAttribute('data-pattern'); hook('sfx', 'chime'); changed(); return; }
      if (b.hasAttribute('data-shape')) { d.shape = b.getAttribute('data-shape'); hook('sfx', 'whoosh'); changed(); return; }
      if (b.hasAttribute('data-windows')) { d.windows = +b.getAttribute('data-windows'); hook('sfx', 'chime'); changed(); return; }
      if (b.hasAttribute('data-sticker')) {
        var id = b.getAttribute('data-sticker');
        if (locked.indexOf(id) >= 0) {
          var need = needMap[id];
          toast(typeof need === 'number' ? 'Earn ' + need + ' more star' + (need === 1 ? '' : 's') + ' to unlock the ' + STICKER_NAMES[id] + ' sticker!' : 'Earn more stars to unlock this sticker!');
          hook('sfx', 'oops'); return;
        }
        if (d.stickers.length >= MAX_STICKERS) { toast('All 6 spots are full! Tap one above to peel it off.'); hook('sfx', 'oops'); return; }
        d.stickers.push(id); hook('sfx', 'chime'); changed();
        toast(STICKER_NAMES[id] + ' sticker added!');
        return;
      }
      if (b.hasAttribute('data-slot')) {
        var k = +b.getAttribute('data-slot');
        if (d.stickers[k]) { d.stickers.splice(k, 1); hook('sfx', 'whoosh'); changed(); }
        else toast('Tap a sticker below to fill this spot.');
        return;
      }
      if (b.classList.contains('rk-clear')) { d.name = ''; nameIn.value = ''; changed(); nameIn.focus(); return; }
      if (b.classList.contains('rk-cancel')) { hook('sfx', 'whoosh'); close(); return; }
      if (b.classList.contains('rk-save')) { save(); return; }
    }
    function onNameInput() {
      var v = cleanName(nameIn.value);
      if (v !== nameIn.value) nameIn.value = v;
      if (v !== d.name) { d.name = v; changed(); }
    }
    function onNameKey(e) { if (e.key === 'Enter') { e.preventDefault(); nameIn.blur(); } }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    }
    root.addEventListener('click', onClick);
    nameIn.addEventListener('input', onNameInput);
    nameIn.addEventListener('keydown', onNameKey);
    document.addEventListener('keydown', onKey);

    try {
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!closed) dirty = true; });
    } catch (e) { /* ignore */ }

    function save() {
      var out = normalize(d);
      close();
      hook('sfx', 'happy');
      var lines = ['Looking good, Captain!', 'Now that is a rocket! Looking good, Captain!', 'Wow! Best rocket in the galaxy. Looking good, Captain!'];
      hook('say', 'dad', lines[Math.floor(Math.random() * lines.length)]);
      if (typeof onSave === 'function') onSave(out);
    }

    function close() {
      if (closed) return;
      closed = true;
      cancelAnimationFrame(raf);
      clearTimeout(toastTimer);
      root.removeEventListener('click', onClick);
      nameIn.removeEventListener('input', onNameInput);
      nameIn.removeEventListener('keydown', onNameKey);
      document.removeEventListener('keydown', onKey);
      if (renderer) {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        if (rocket) dispose(rocket);
        rocket = null;
        [starsA, starsB].forEach(function (p) { if (p) { p.geometry.dispose(); p.material.dispose(); } });
        if (starTex) starTex.dispose();
        renderer.renderLists.dispose();
        renderer.dispose();
        try { renderer.forceContextLoss(); } catch (e) { /* ignore */ }
        renderer = null;
      }
      if (root.parentNode) root.parentNode.removeChild(root);
      if (active === handle) active = null;
    }

    var handle = { close: close, save: save };
    active = handle;

    setTab(lastTab);
    refreshUI();
    if (renderer) { lastT = performance.now(); loop(); }
    setTimeout(function () { if (!closed) hintEl.style.opacity = '0'; }, 6000);
    return handle;
  }

  window.RocketKit = {
    DEFAULT_DESIGN: DEFAULT_DESIGN,
    build: build,
    setFlame: setFlame,
    dispose: dispose,
    openBuilder: openBuilder,
    // extras
    normalize: normalize,
    STICKERS: STICKER_IDS.slice(),
    STICKER_NAMES: STICKER_NAMES,
    stickerIcon: stickerIcon
  };
})();
