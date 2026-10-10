/* Harper's Space Adventure: planet surface module.
   Public API: window.Surface = { open(opts) }
   opts = { place:{id,name,land:{g,temp,sky,ground,ground2,note,inSky,gas}}, character:HTMLCanvasElement, sunScale:number, onClose:function } */
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return;

  var CSS = [
    '.sf-root{position:fixed;inset:0;z-index:2000;background:#0d0b2e;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;font-family:var(--body,system-ui,sans-serif);color:var(--ink,#fdf8ff);font-size:18px;animation:sf-fade .4s ease-out}',
    '@keyframes sf-fade{from{opacity:0}to{opacity:1}}',
    '.sf-root button{font:inherit;color:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
    '.sf-root button:focus-visible{outline:3px solid var(--gold,#ffd166);outline-offset:3px}',
    '.sf-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}',
    '.sf-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);left:calc(env(safe-area-inset-left,0px) + 12px);right:calc(env(safe-area-inset-right,0px) + 12px);display:flex;gap:12px;align-items:flex-start;justify-content:space-between;pointer-events:none}',
    '.sf-top>*{pointer-events:auto}',
    '.sf-info{background:var(--panel,rgba(30,25,84,.88));border:2px solid var(--line,rgba(255,255,255,.16));border-radius:22px;padding:8px 16px 12px;flex:0 1 430px;max-width:430px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}',
    '.sf-root .sf-info-head{display:flex;align-items:center;gap:10px;width:100%;background:none;border:0;padding:0;min-height:48px;font-family:var(--display,system-ui);font-weight:800;font-size:26px;line-height:1.1;text-align:left}',
    '.sf-chev{margin-left:auto;font-size:18px;opacity:.8;transition:transform .2s}',
    '.sf-info.sf-min .sf-chev{transform:rotate(-90deg)}',
    '.sf-info.sf-min .sf-lines{display:none}',
    '.sf-lines{display:flex;flex-direction:column;gap:4px;font-size:18px;line-height:1.3}',
    '.sf-lines b{color:var(--gold,#ffd166)}',
    '.sf-jl{color:var(--teal,#5fe0c8);font-weight:700}',
    '.sf-root .sf-back{flex:none;min-height:58px;padding:10px 22px;border-radius:999px;border:0;background:linear-gradient(180deg,var(--rocket,#ff7a45),var(--rocket-deep,#d9532a));color:#2a0f05;font-family:var(--display,system-ui);font-weight:800;font-size:21px;box-shadow:0 6px 0 #8f3214,0 10px 24px rgba(0,0,0,.35);white-space:nowrap}',
    '.sf-back:active{transform:translateY(3px);box-shadow:0 3px 0 #8f3214}',
    '.sf-joy{position:absolute;left:calc(env(safe-area-inset-left,0px) + 18px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px);width:150px;height:150px;border-radius:50%;background:rgba(30,25,84,.55);border:3px solid rgba(255,255,255,.3);touch-action:none;box-shadow:inset 0 0 24px rgba(0,0,0,.35)}',
    '.sf-joy::after{content:"";position:absolute;inset:26px;border-radius:50%;border:2px dashed rgba(255,255,255,.18)}',
    '.sf-knob{position:absolute;left:50%;top:50%;width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#c9c3f0 70%);box-shadow:0 4px 10px rgba(0,0,0,.45);pointer-events:none;z-index:1}',
    '.sf-right{position:absolute;right:calc(env(safe-area-inset-right,0px) + 18px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px);display:flex;flex-direction:column;align-items:center;gap:12px}',
    '.sf-root .sf-jump{width:122px;height:122px;border-radius:50%;border:0;background:radial-gradient(circle at 35% 30%,#a6fbe9,var(--teal,#5fe0c8) 58%,#2fae97);color:#06352d;font-family:var(--display,system-ui);font-weight:800;font-size:30px;box-shadow:0 7px 0 #1f7f6d,0 12px 24px rgba(0,0,0,.35);touch-action:none}',
    '.sf-jump.sf-down{transform:translateY(4px);box-shadow:0 3px 0 #1f7f6d}',
    '.sf-root .sf-flag{min-height:54px;padding:8px 18px;border-radius:999px;border:2px solid var(--line,rgba(255,255,255,.16));background:var(--panel,rgba(30,25,84,.88));font-weight:700;font-size:18px;white-space:nowrap}',
    '.sf-flag:active{transform:scale(.96)}',
    '.sf-root .sf-act{min-height:64px;padding:10px 24px;border-radius:999px;border:0;background:linear-gradient(180deg,#ffe08a,var(--gold,#ffd166));color:#3a2600;font-family:var(--display,system-ui);font-weight:800;font-size:22px;white-space:nowrap;box-shadow:0 5px 0 #b8892a,0 0 24px rgba(255,209,102,.55);animation:sf-pulse 1.4s ease-in-out infinite}',
    '.sf-root .sf-act[hidden]{display:none}',
    '.sf-act:active{transform:translateY(3px);box-shadow:0 2px 0 #b8892a}',
    '@keyframes sf-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}',
    '.sf-root.sf-boarding .sf-joy,.sf-root.sf-boarding .sf-right,.sf-root.sf-boarding .sf-back{visibility:hidden}',
    '.sf-toast{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 200px);transform:translateX(-50%);width:max-content;max-width:min(600px,calc(100% - 32px));box-sizing:border-box;background:#fff;color:#231a4f;font-weight:800;font-size:20px;line-height:1.3;padding:12px 22px;border-radius:24px;box-shadow:0 8px 24px rgba(0,0,0,.4);text-align:center;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}',
    '.sf-toast.sf-show{opacity:1;transform:translateX(-50%) translateY(-8px)}',
    '@media (max-width:640px){.sf-top{flex-direction:column-reverse;align-items:stretch}.sf-back{align-self:flex-end}.sf-info{flex:none;max-width:none}.sf-root .sf-info-head{font-size:23px;min-height:44px}.sf-joy{width:136px;height:136px}.sf-root .sf-jump{width:108px;height:108px;font-size:26px}}',
    '@media (max-height:500px){.sf-toast{bottom:calc(env(safe-area-inset-bottom,0px) + 150px)}}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('sf-style')) return;
    var s = document.createElement('style');
    s.id = 'sf-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ---------- helpers ----------
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function strHash(s) { var h = 2166136261; s = String(s || 'x'); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function makeNoise(seed) {
    function hash(i, j) { var h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(seed, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967295; }
    function noise(x, y) {
      var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
      var u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
      var a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function fbm(x, y, oct) { var s = 0, amp = 0.5, f = 1, n = 0; for (var o = 0; o < (oct || 4); o++) { s += amp * noise(x * f, y * f); n += amp; amp *= 0.5; f *= 2.03; } return s / n; }
    return { noise: noise, fbm: fbm, hash: hash };
  }
  function col(h, fb) {
    var c = new THREE.Color(fb);
    if (typeof h === 'string' && /^#?[0-9a-f]{3,8}$/i.test(h)) { try { c.set(h.charAt(0) === '#' ? h : '#' + h); } catch (e) {} }
    else if (typeof h === 'number') c.setHex(h);
    return c;
  }
  function lum(c) { return c.r * 0.3 + c.g * 0.59 + c.b * 0.11; }
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function cssCol(c) { return '#' + c.getHexString(); }
  function fmtNum(n) {
    if (n < 10) return (Math.round(n * 10) / 10).toFixed(1);
    if (n < 1000) return String(Math.round(n));
    return Math.round(n).toLocaleString('en-GB');
  }
  function fmtPct(g) {
    var v = g * 100;
    if (v >= 10) return Math.round(v) + '%';
    if (v >= 0.1) return (Math.round(v * 10) / 10) + '%';
    return 'less than 0.1%';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- procedural canvases ----------
  function softDot(size, inner, color) {
    var c = canvas(size, size), x = c.getContext('2d');
    var gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, color || '#fff'); gr.addColorStop(inner, color || '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, size, size);
    return c;
  }
  function sunGlowCanvas() {
    var s = 128, c = canvas(s, s), x = c.getContext('2d');
    var gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.18, 'rgba(255,230,150,.75)');
    gr.addColorStop(0.45, 'rgba(255,190,90,.22)'); gr.addColorStop(1, 'rgba(255,160,60,0)');
    x.fillStyle = gr; x.fillRect(0, 0, s, s);
    return c;
  }
  function sunDiscCanvas() {
    var s = 128, c = canvas(s, s), x = c.getContext('2d');
    var gr = x.createRadialGradient(64, 64, 0, 64, 64, 60);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.75, '#fff6d0'); gr.addColorStop(0.92, '#ffe08a'); gr.addColorStop(1, 'rgba(255,220,120,0)');
    x.fillStyle = gr; x.fillRect(0, 0, s, s);
    return c;
  }
  function bootCanvas() {
    var c = canvas(64, 128), x = c.getContext('2d');
    x.fillStyle = '#fff';
    function rr(px, py, w, h, r) { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); x.fill(); }
    rr(10, 6, 44, 62, 20); rr(14, 76, 36, 46, 16);
    x.globalCompositeOperation = 'destination-out';
    x.fillStyle = 'rgba(0,0,0,.55)';
    for (var i = 0; i < 5; i++) x.fillRect(14, 14 + i * 11, 36, 4);
    for (var k = 0; k < 3; k++) x.fillRect(18, 84 + k * 12, 28, 4);
    return c;
  }
  function flagCanvas() {
    var c = canvas(128, 64), x = c.getContext('2d');
    x.fillStyle = '#ff6fa8'; x.fillRect(0, 0, 128, 64);
    x.fillStyle = '#ffd166'; x.fillRect(0, 54, 128, 10);
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, 128, 5);
    star(x, 64, 29, 21, 9, '#ffd166', '#fff3c9');
    return c;
  }
  function star(x, cx, cy, R, r, fill, stroke) {
    x.beginPath();
    for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r : R; x.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); }
    x.closePath(); x.fillStyle = fill; x.fill(); if (stroke) { x.lineWidth = 3; x.strokeStyle = stroke; x.stroke(); }
  }
  function cloudCanvas(seed) {
    var s = 256, c = canvas(s, s), x = c.getContext('2d'), rnd = mulberry(seed);
    for (var i = 0; i < 46; i++) {
      var px = rnd() * s, py = rnd() * s, r = 14 + rnd() * 40, a = 0.12 + rnd() * 0.25;
      for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
        var gx = px + ox * s, gy = py + oy * s;
        if (gx + r < 0 || gx - r > s || gy + r < 0 || gy - r > s) continue;
        var gr = x.createRadialGradient(gx, gy, 0, gx, gy, r);
        gr.addColorStop(0, 'rgba(255,255,255,' + a + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = gr; x.fillRect(gx - r, gy - r, r * 2, r * 2);
      }
    }
    return c;
  }
  function plasmaCanvas(seed) {
    var s = 256, c = canvas(s, s), x = c.getContext('2d'), N = makeNoise(seed);
    var img = x.createImageData(s, s), d = img.data;
    for (var j = 0; j < s; j++) for (var i = 0; i < s; i++) {
      // tileable cells: sample periodic noise via wrapping coordinates
      var u = i / s, v = j / s;
      var n = N.fbm(Math.cos(u * 6.283) * 2 + 9, Math.sin(u * 6.283) * 2 + Math.cos(v * 6.283) * 2 + Math.sin(v * 6.283) * 2, 4);
      var cell = Math.abs(Math.sin(u * 6.283 * 8 + n * 6) * Math.sin(v * 6.283 * 8 + n * 5));
      var t = clamp(n * 1.1 + cell * 0.35, 0, 1);
      var k = (j * s + i) * 4;
      d[k] = 255; d[k + 1] = Math.round(120 + 120 * t); d[k + 2] = Math.round(30 + 120 * t * t); d[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return c;
  }
  function ringCanvas(base) {
    var c = canvas(256, 8), x = c.getContext('2d'), N = makeNoise(77);
    var img = x.createImageData(256, 8), d = img.data;
    for (var i = 0; i < 256; i++) {
      var t = i / 255, a = 0.55 + 0.4 * N.noise(t * 40, 0.5);
      if (t < 0.08) a *= t / 0.08;
      if (t > 0.6 && t < 0.66) a = 0.06; // Cassini division
      if (t > 0.94) a *= (1 - t) / 0.06;
      var sh = 0.8 + 0.3 * N.noise(t * 25, 3.3);
      for (var j = 0; j < 8; j++) { var k = (j * 256 + i) * 4; d[k] = Math.min(255, base[0] * sh); d[k + 1] = Math.min(255, base[1] * sh); d[k + 2] = Math.min(255, base[2] * sh); d[k + 3] = Math.round(a * 255); }
    }
    x.putImageData(img, 0, 0);
    return c;
  }
  function bandCanvas(stops, wob, seed, extra) {
    var w = 512, h = 256, c = canvas(w, h), x = c.getContext('2d'), N = makeNoise(seed);
    var img = x.createImageData(w, h), d = img.data, cs = stops.map(function (s) { return new THREE.Color(s); });
    var tmp = new THREE.Color();
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
      var v = j / h + (N.fbm(i / 60, j / 18, 3) - 0.5) * wob;
      var t = (Math.sin(v * Math.PI * 14) * 0.5 + 0.5) * (cs.length - 1);
      var t2 = N.noise(v * 30, 1.7) * (cs.length - 1);
      var tt = clamp((t * 0.7 + t2 * 0.3), 0, cs.length - 1.001), k0 = Math.floor(tt);
      tmp.copy(cs[k0]).lerp(cs[k0 + 1], tt - k0);
      var k = (j * w + i) * 4;
      d[k] = tmp.r * 255; d[k + 1] = tmp.g * 255; d[k + 2] = tmp.b * 255; d[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    if (extra) extra(x, w, h);
    return c;
  }
  function blobs(x, rnd, n, w, h, color, rmin, rmax, yMin, yMax, alpha) {
    x.fillStyle = color;
    for (var i = 0; i < n; i++) {
      var cx = rnd() * w, cy = (yMin + rnd() * (yMax - yMin)) * h, k = 3 + Math.floor(rnd() * 5);
      x.globalAlpha = alpha == null ? 1 : alpha;
      for (var m = 0; m < k; m++) {
        x.beginPath();
        x.ellipse(cx + (rnd() - 0.5) * rmax * 1.6, cy + (rnd() - 0.5) * rmax, rmin + rnd() * (rmax - rmin), (rmin + rnd() * (rmax - rmin)) * 0.7, 0, 0, Math.PI * 2);
        x.fill();
      }
    }
    x.globalAlpha = 1;
  }
  function bodyCanvas(id) {
    var rnd = mulberry(strHash(id) + 3);
    if (id === 'jupiter') return bandCanvas(['#fff3dc', '#e8c9a0', '#c98b5a', '#f6e1c0', '#a8653f'], 0.05, 11, function (x) {
      x.fillStyle = '#c8553d'; x.beginPath(); x.ellipse(330, 170, 30, 15, 0, 0, 7); x.fill();
      x.strokeStyle = '#f1b38a'; x.lineWidth = 4; x.stroke();
    });
    if (id === 'saturn') return bandCanvas(['#fbefc8', '#ecd49a', '#d9b876', '#f6e3ad'], 0.02, 21);
    if (id === 'neptune') return bandCanvas(['#3f6fe8', '#2f58cf', '#5b8cff', '#3a63dc'], 0.03, 31, function (x) {
      x.fillStyle = '#1d2f8f'; x.beginPath(); x.ellipse(200, 160, 26, 13, 0, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,255,255,.8)';
      for (var i = 0; i < 6; i++) { x.beginPath(); x.ellipse(rnd() * 512, 60 + rnd() * 140, 18 + rnd() * 20, 3, 0, 0, 7); x.fill(); }
    });
    var w = 512, h = 256, c = canvas(w, h), x = c.getContext('2d');
    if (id === 'earth') {
      var g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2b6fd8'); g.addColorStop(0.5, '#1f5fc8'); g.addColorStop(1, '#2b6fd8');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      blobs(x, rnd, 9, w, h, '#4bb05a', 12, 34, 0.2, 0.8);
      blobs(x, rnd, 5, w, h, '#b99a5c', 8, 18, 0.3, 0.7);
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, 18); x.fillRect(0, h - 22, w, 22);
      x.fillStyle = 'rgba(255,255,255,.75)';
      for (var i = 0; i < 26; i++) { x.beginPath(); x.ellipse(rnd() * w, 30 + rnd() * (h - 60), 20 + rnd() * 40, 4 + rnd() * 6, (rnd() - 0.5) * 0.4, 0, 7); x.fill(); }
    } else if (id === 'pluto') {
      x.fillStyle = '#d9b98c'; x.fillRect(0, 0, w, h);
      blobs(x, rnd, 10, w, h, '#8a5a3a', 10, 26, 0.45, 0.75, 0.85);
      blobs(x, rnd, 8, w, h, '#efd9b4', 8, 20, 0.1, 0.4, 0.8);
      // the heart (Tombaugh Regio)
      x.fillStyle = '#fbf3e4';
      x.beginPath(); var cx = 260, cy = 108, s = 2.2;
      x.moveTo(cx, cy + 20 * s);
      x.bezierCurveTo(cx - 34 * s, cy - 2 * s, cx - 22 * s, cy - 26 * s, cx, cy - 12 * s);
      x.bezierCurveTo(cx + 22 * s, cy - 26 * s, cx + 34 * s, cy - 2 * s, cx, cy + 20 * s);
      x.fill();
    } else if (id === 'charon') {
      x.fillStyle = '#a3a1a0'; x.fillRect(0, 0, w, h);
      blobs(x, rnd, 18, w, h, '#86837f', 8, 22, 0.15, 0.9, 0.6);
      var g2 = x.createLinearGradient(0, 0, 0, 60); g2.addColorStop(0, '#7a4636'); g2.addColorStop(1, 'rgba(122,70,54,0)');
      x.fillStyle = g2; x.fillRect(0, 0, w, 60);
    } else { // moon (and fallback)
      x.fillStyle = '#c4c2bd'; x.fillRect(0, 0, w, h);
      blobs(x, rnd, 10, w, h, '#86868c', 12, 30, 0.25, 0.65, 0.8);
      for (var k = 0; k < 60; k++) {
        var px = rnd() * w, py = 20 + rnd() * (h - 40), r = 2 + rnd() * 7;
        x.fillStyle = 'rgba(80,80,85,.45)'; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
        x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 1; x.beginPath(); x.arc(px - 0.6, py - 0.6, r, 3.6, 5.6); x.stroke();
      }
    }
    return c;
  }
  function fallbackHarper() {
    var c = canvas(256, 384), x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.strokeStyle = '#231a4f'; x.lineWidth = 6;
    x.beginPath(); x.arc(128, 90, 70, 0, 7); x.fill(); x.stroke();
    x.fillStyle = '#5fe0c8'; x.beginPath(); x.ellipse(128, 92, 48, 38, 0, 0, 7); x.fill();
    x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect ? x.roundRect(70, 150, 116, 150, 40) : x.rect(70, 150, 116, 150); x.fill(); x.stroke();
    x.fillRect(82, 290, 36, 88); x.fillRect(138, 290, 36, 88);
    x.fillStyle = '#ff7a45'; x.fillRect(100, 190, 56, 30);
    return c;
  }

  // ---------- shaders ----------
  var SKY_VS = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  var SKY_FS = 'uniform vec3 top; uniform vec3 hor; uniform vec3 bot; varying vec3 vDir; void main(){ float h=normalize(vDir).y; vec3 c = h>0.0 ? mix(hor, top, pow(clamp(h,0.0,1.0),0.55)) : mix(hor, bot, clamp(-h*5.0,0.0,1.0)); gl_FragColor=vec4(c,1.0); }';
  var BODY_VS = 'varying vec3 vN; varying vec2 vUv; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  var BODY_FS = 'uniform sampler2D map; uniform vec3 L; varying vec3 vN; varying vec2 vUv; void main(){ float d=max(dot(normalize(vN),L),0.0); vec3 c=texture2D(map,vUv).rgb*(0.1+1.0*d); gl_FragColor=vec4(c,1.0); }';
  var PTS_VS = 'attribute float aSize; attribute float aAlpha; attribute vec3 aColor; uniform float uScale; uniform float uNear; varying float vA; varying vec3 vC; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); float z=max(0.1,-mv.z); vA=aAlpha*smoothstep(uNear*0.4,uNear,z); vC=aColor; gl_PointSize=min(aSize*uScale/z, 400.0); gl_Position=projectionMatrix*mv; }';
  var PTS_FS = 'uniform float uSoft; varying float vA; varying vec3 vC; void main(){ float d=length(gl_PointCoord-0.5)*2.0; float a=(1.0-smoothstep(uSoft,1.0,d))*vA; if(a<0.01) discard; gl_FragColor=vec4(vC,a); }';
  var BUB_VS = 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }';
  var BUB_FS = 'uniform vec3 color; uniform float t; varying vec3 vN; varying vec3 vV; void main(){ float f=1.0-abs(dot(normalize(vN),normalize(vV))); float a=0.07+pow(f,2.2)*0.85+0.05*sin(t*3.0); gl_FragColor=vec4(color,clamp(a,0.0,1.0)); }';

  var GAS_PAL = {
    jupiter: ['#fff3dc', '#e9c497', '#c98b5a', '#a8653f'],
    saturn: ['#fffbe8', '#f6e3ad', '#e3c27a', '#c9a35a'],
    uranus: ['#effffe', '#c8f4f4', '#8fdfe6', '#5fc3d1'],
    neptune: ['#dfe9ff', '#8fb8ff', '#5b8cff', '#3256d6'],
    sun: ['#fff3b0', '#ffd166', '#ff9a3c', '#ff5a1a']
  };
  var BODY_DEG = { earth: 11, jupiter: 26, saturn: 13, neptune: 12, pluto: 13, charon: 13, moon: 9, uranus: 12 };

  var current = null;

  function open(opts) {
    if (current) { try { current.close(true); } catch (e) {} current = null; }
    injectCSS();
    current = createSession(opts || {});
  }

  function createSession(opts) {
    var place = opts.place || {}, land = place.land || {};
    var id = String(place.id || 'planet').toLowerCase();
    var name = place.name || 'This world';
    var gas = !!land.gas;
    var g = (typeof land.g === 'number' && land.g > 0) ? land.g : 1;
    var sunScale = (typeof opts.sunScale === 'number' && opts.sunScale > 0) ? opts.sunScale : 1;
    var seed = strHash(id);
    var rnd = mulberry(seed);
    var N = makeNoise(seed % 100000);
    var closed = false;
    var timers = [];
    var textures = [];
    var listeners = [];
    var raf = 0;

    function later(fn, ms) { var t = setTimeout(function () { if (!closed) fn(); }, ms); timers.push(t); return t; }
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); listeners.push([el, ev, fn, o]); }
    function tex(c, repeat) {
      var t = new THREE.CanvasTexture(c);
      if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
      textures.push(t);
      return t;
    }
    var hooks = function () { return window.GameHooks || null; };
    function sfx(n) { try { var h = hooks(); h && h.sfx && h.sfx(n); } catch (e) {} }
    function say(who, t) { try { var h = hooks(); h && h.say && h.say(who, t); } catch (e) {} }

    // ---------- DOM ----------
    var root = document.createElement('div');
    root.className = 'sf-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Standing on ' + name);
    var cv = document.createElement('canvas'); cv.className = 'sf-canvas';
    root.appendChild(cv);
    var gravLine = 'Gravity: <b>' + fmtPct(g) + '</b> of Earth\'s';
    var weighLine = 'You\'d weigh <b>' + fmtPct(g) + '</b> of your Earth weight';
    var hud = document.createElement('div');
    hud.innerHTML =
      '<div class="sf-top">' +
        '<div class="sf-info"><button class="sf-info-head" type="button" aria-expanded="true"><span class="sf-name"></span><span class="sf-chev" aria-hidden="true">&#9660;</span></button>' +
          '<div class="sf-lines"><div>' + gravLine + (gas ? ' (if you could stand!)' : '') + '</div><div>' + weighLine + '</div>' +
          '<div>Temperature: <b>' + esc(land.temp || 'unknown') + '</b></div><div class="sf-jl"></div></div></div>' +
        '<button class="sf-back" type="button">&#128640; Back to the rocket</button>' +
      '</div>' +
      '<div class="sf-toast" role="status" aria-live="polite"></div>' +
      '<div class="sf-joy" aria-label="Walk joystick"><div class="sf-knob"></div></div>' +
      '<div class="sf-right"><button class="sf-act" type="button" hidden></button>' + (gas ? '' : '<button class="sf-flag" type="button">&#9733; Plant a flag</button>') +
        '<button class="sf-jump" type="button">' + (gas ? 'UP!' : 'JUMP') + '</button></div>';
    while (hud.firstChild) root.appendChild(hud.firstChild);
    root.querySelector('.sf-name').textContent = name;
    var info = root.querySelector('.sf-info');
    var jumpLine = root.querySelector('.sf-jl');
    var toastEl = root.querySelector('.sf-toast');
    var joy = root.querySelector('.sf-joy'), knob = root.querySelector('.sf-knob');
    var actBtn = root.querySelector('.sf-act'), actSpot = null, paused = false, boarding = false;
    var jumpBtn = root.querySelector('.sf-jump'), flagBtn = root.querySelector('.sf-flag'), backBtn = root.querySelector('.sf-back');
    jumpLine.textContent = gas ? 'No ground here: you float in the clouds!' : 'Your last jump: tap JUMP! (on Earth: 0.5 m)';
    document.body.appendChild(root);

    // ---------- toast ----------
    var tq = [], tBusy = false;
    function toast(msg, ms) {
      if (!msg) return;
      if (tq.length > 2) tq.shift();
      tq.push([msg, ms || Math.min(8000, 2200 + msg.length * 55)]);
      if (!tBusy) nextToast();
    }
    function nextToast() {
      var it = tq.shift();
      if (!it) { tBusy = false; toastEl.classList.remove('sf-show'); return; }
      tBusy = true;
      toastEl.textContent = it[0];
      toastEl.classList.add('sf-show');
      later(function () { toastEl.classList.remove('sf-show'); later(nextToast, 280); }, it[1]);
    }

    // ---------- three setup ----------
    var renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2500);
    var skyGroup = new THREE.Group();
    scene.add(skyGroup);
    var ptsMats = [];

    function softPoints(n, opts2) {
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(n), 1));
      geo.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(n), 1));
      geo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      var mat = new THREE.ShaderMaterial({
        uniforms: { uScale: { value: 800 }, uSoft: { value: opts2.soft == null ? 0.2 : opts2.soft }, uNear: { value: opts2.near || 0.5 } },
        vertexShader: PTS_VS, fragmentShader: PTS_FS, transparent: true, depthWrite: false,
        blending: opts2.additive ? THREE.AdditiveBlending : THREE.NormalBlending
      });
      ptsMats.push(mat);
      var p = new THREE.Points(geo, mat);
      p.frustumCulled = false;
      return p;
    }

    // character
    var charCanvas = (opts.character && opts.character.width && opts.character.height) ? opts.character : fallbackHarper();
    var charTex = tex(charCanvas);
    charTex.generateMipmaps = false; charTex.minFilter = THREE.LinearFilter;
    var HH = 1.55, HW = HH * charCanvas.width / charCanvas.height;
    var harperGeo = new THREE.PlaneGeometry(HW, HH); harperGeo.translate(0, HH / 2, 0);
    var harper = new THREE.Mesh(harperGeo, new THREE.MeshBasicMaterial({ map: charTex, transparent: true, alphaTest: 0.08, side: THREE.DoubleSide }));
    var harperPivot = new THREE.Group(); harperPivot.add(harper); scene.add(harperPivot);
    // the rest of the crew follow along behind
    var trail = [], followers = (opts.followers || []).map(function (f, i) {
      var t = tex(f.canvas); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter;
      var h = HH * (f.scale || 1), w = h * f.canvas.width / f.canvas.height;
      var g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2, 0);
      var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.08, side: THREE.DoubleSide }));
      var pv = new THREE.Group(); pv.add(m); scene.add(pv);
      var side = i % 2 ? 1 : -1, row = Math.floor(i / 2); pv.position.set(side * (1.0 + row * 0.9), 0, -0.7 - row * 0.8);
      return { pv: pv, mesh: m, h: h, hop: Math.random() * 6, dog: !!f.dog };
    });
    function updateFollowers(dt, t, moving) {
      var hp = harperPivot.position;
      if (!trail.length || hp.distanceTo(trail[0]) > 0.25) { trail.unshift(hp.clone()); if (trail.length > 80) trail.pop(); }
      followers.forEach(function (f, i) {
        var tgt = trail[Math.min(trail.length - 1, (i + 1) * 5)] || hp, p = f.pv.position;
        var dx = tgt.x - p.x, dz = tgt.z - p.z, d = Math.hypot(dx, dz), gap = 0.9;
        if (d > gap) { var k = Math.min(1, dt * 3.2) * (d - gap) / d; p.x += dx * k; p.z += dz * k; }
        var walking = d > gap + 0.05;
        if (walking) f.mesh.scale.x = (dx * Math.cos(yaw) - dz * Math.sin(yaw)) < 0 ? -1 : 1;
        var gy = world.hAt ? world.hAt(p.x, p.z) : hp.y + Math.sin(t * 1.3 + i) * 0.3;
        var bounce = walking ? Math.abs(Math.sin(t * (f.dog ? 11 : 7) + f.hop)) * (f.dog ? 0.18 : 0.1) * (gas ? 0 : 1) : 0;
        p.y += (gy + bounce - p.y) * Math.min(1, dt * 10);
        f.pv.rotation.y = yaw;
      });
    }

    // camera orbit state
    var yaw = 0, pitch = gas ? 0.12 : 0.17, dist = gas ? 7 : 6.2, targetDist = dist;
    var camTarget = new THREE.Vector3();
    var pos = new THREE.Vector3();
    var facing = 1, facingTarget = 1, walkPhase = 0;
    var keys = {}, joyVec = { x: 0, y: 0 }, joyId = null, orbitId = null, orbitLast = null;
    var jumpQueued = false;

    var tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpM = new THREE.Matrix4();
    var UP = new THREE.Vector3(0, 1, 0);

    function dirFromAzEl(azDeg, elDeg) {
      var a = azDeg * Math.PI / 180, e = elDeg * Math.PI / 180;
      return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e));
    }

    var world = gas ? buildGas() : buildSolid();

    // ---------- SOLID WORLD ----------
    function buildSolid() {
      var skyC = col(land.sky, '#000010'), gr1 = col(land.ground, '#a9a39a'), gr2 = col(land.ground2, '#7d776f');
      var L = lum(skyC), airless = L < 0.12;
      var top = skyC.clone().multiplyScalar(airless ? 0.4 : 0.55);
      var hor = airless ? skyC.clone().lerp(new THREE.Color('#1a1838'), 0.35) : skyC.clone().lerp(new THREE.Color('#ffffff'), 0.22);
      var bot = gr2.clone().multiplyScalar(0.6);
      var sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({
        uniforms: { top: { value: top }, hor: { value: hor }, bot: { value: bot } }, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false
      }));
      sky.renderOrder = -10; skyGroup.add(sky);
      if (!airless) scene.fog = new THREE.Fog(hor, 110, 260);

      // stars
      var starOp = clamp(1 - L * 4, 0, 1);
      if (starOp > 0.05) {
        var sp = new Float32Array(900 * 3);
        for (var i = 0; i < 900; i++) {
          var u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, y = Math.abs(u) * 0.98 + 0.02, r = Math.sqrt(1 - y * y);
          sp[i * 3] = Math.cos(th) * r * 850; sp[i * 3 + 1] = y * 850; sp[i * 3 + 2] = Math.sin(th) * r * 850;
        }
        var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
        var stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: starOp, fog: false, depthWrite: false }));
        stars.renderOrder = -9; skyGroup.add(stars);
      }

      // sun
      var sunDir = dirFromAzEl(-6, 6);
      var discDeg = Math.max(0.45, 2.3 * sunScale), glowDeg = discDeg * 4 + 3;
      function degSize(deg, d) { return 2 * d * Math.tan(deg * Math.PI / 360); }
      var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(sunGlowCanvas()), color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: airless ? 0.85 : 1 }));
      glow.position.copy(sunDir).multiplyScalar(810); glow.scale.setScalar(degSize(glowDeg, 810));
      var disc = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(sunDiscCanvas()), transparent: true, depthWrite: false, fog: false }));
      disc.position.copy(sunDir).multiplyScalar(800); disc.scale.setScalar(degSize(discDeg, 800));
      skyGroup.add(glow); skyGroup.add(disc);

      // body in the sky
      var inSky = land.inSky ? String(land.inSky).toLowerCase() : null;
      if (inSky) {
        var bdir = dirFromAzEl(16, 11), bd = 700;
        var rad = bd * Math.tan((BODY_DEG[inSky] || 10) * Math.PI / 360);
        var Ld = new THREE.Vector3(-0.75, 0.45, 0.1).normalize().addScaledVector(bdir, -0.75).normalize();
        var body = new THREE.Mesh(new THREE.SphereGeometry(rad, 48, 24), new THREE.ShaderMaterial({
          uniforms: { map: { value: tex(bodyCanvas(inSky)) }, L: { value: Ld } }, vertexShader: BODY_VS, fragmentShader: BODY_FS
        }));
        body.position.copy(bdir).multiplyScalar(bd);
        body.rotation.set(0.15, -Math.PI / 2 + 0.25, 0.08);
        skyGroup.add(body);
        if (inSky === 'saturn') {
          var ring = new THREE.Mesh(ringGeo(rad * 1.25, rad * 2.3), new THREE.MeshBasicMaterial({ map: tex(ringCanvas([238, 214, 160])), transparent: true, side: THREE.DoubleSide, fog: false, depthWrite: false }));
          ring.position.copy(body.position); ring.rotation.set(-Math.PI / 2 + 0.42, 0.25, 0);
          skyGroup.add(ring);
        }
        if (inSky === 'earth') {
          var atm = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(softDot(64, 0.62, 'rgba(120,180,255,0.5)')), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
          atm.position.copy(body.position).multiplyScalar(1.01); atm.scale.setScalar(rad * 2.5); skyGroup.add(atm);
        }
      }

      // lights
      scene.add(new THREE.HemisphereLight(airless ? 0xd8d8f0 : hor.getHex(), gr2.getHex(), airless ? 0.6 : 0.65));
      var sunL = new THREE.DirectionalLight(0xffffff, 0.75 + 0.15 * Math.min(1, sunScale));
      sunL.position.copy(sunDir).multiplyScalar(100); scene.add(sunL);

      // terrain
      var W = 500, NS = 160, cell = W / NS, V = NS + 1;
      var hts = new Float32Array(V * V);
      var craters = [];
      var nCr = id === 'mars' ? 12 : id === 'earth' ? 2 : 34;
      for (var c = 0; c < nCr; c++) {
        var cx, cz, tries = 0;
        do { cx = (rnd() - 0.5) * W * 0.9; cz = (rnd() - 0.5) * W * 0.9; tries++; var cr = 5 + Math.pow(rnd(), 2.2) * 34; } while (Math.hypot(cx, cz) < cr * 1.9 + 12 && tries < 30);
        craters.push([cx, cz, cr, cr * 0.22]);
      }
      // a couple of close, friendly craters to explore
      craters.push([16, -20, 7, 1.5], [-22, -34, 11, 2.4]);
      function rawH(x, z) {
        var d = Math.hypot(x, z), flat = clamp((d - 6) / 30, 0, 1); flat = flat * flat * (3 - 2 * flat);
        var h = (N.fbm(x / 70 + 10, z / 70 - 4, 4) - 0.5) * 16 * flat + (N.noise(x / 14, z / 14) - 0.5) * 1.2 * (0.3 + 0.7 * flat);
        if (id === 'mars') h += Math.sin(x * 0.08 + N.noise(x / 30, z / 30) * 4) * 0.6 * flat;
        var cf = clamp((d - 3) / 10, 0, 1);
        for (var k = 0; k < craters.length; k++) {
          var q = craters[k], dx = x - q[0], dz = z - q[1];
          var dd = dx * dx + dz * dz, lim = q[2] * 1.8; if (dd > lim * lim) continue;
          var t = Math.sqrt(dd) / q[2];
          if (t < 1) h += cf * q[3] * (t * t - 1);
          h += cf * q[3] * 0.45 * Math.exp(-((t - 1) * (t - 1)) / 0.05);
        }
        return h;
      }
      for (var j = 0; j < V; j++) for (var ii = 0; ii < V; ii++) hts[j * V + ii] = rawH(-W / 2 + ii * cell, -W / 2 + j * cell);
      var posA = new Float32Array(V * V * 3), colA = new Float32Array(V * V * 3), cc = new THREE.Color();
      for (j = 0; j < V; j++) for (ii = 0; ii < V; ii++) {
        var vi = j * V + ii, x = -W / 2 + ii * cell, z = -W / 2 + j * cell, h0 = hts[vi];
        posA[vi * 3] = x; posA[vi * 3 + 1] = h0; posA[vi * 3 + 2] = z;
        var tcol = clamp(0.5 + (N.fbm(x / 40, z / 40, 3) - 0.5) * 2.2 - h0 * 0.04, 0, 1);
        cc.copy(gr1).lerp(gr2, tcol).multiplyScalar(0.92 + 0.16 * N.hash(ii, j + 999));
        colA[vi * 3] = cc.r; colA[vi * 3 + 1] = cc.g; colA[vi * 3 + 2] = cc.b;
      }
      var idx = new Uint32Array(NS * NS * 6), p = 0;
      for (j = 0; j < NS; j++) for (ii = 0; ii < NS; ii++) {
        var a0 = j * V + ii, b0 = a0 + 1, c0 = a0 + V, d0 = c0 + 1;
        idx[p++] = a0; idx[p++] = c0; idx[p++] = b0; idx[p++] = b0; idx[p++] = c0; idx[p++] = d0;
      }
      var tg = new THREE.BufferGeometry();
      tg.setAttribute('position', new THREE.BufferAttribute(posA, 3));
      tg.setAttribute('color', new THREE.BufferAttribute(colA, 3));
      tg.setIndex(new THREE.BufferAttribute(idx, 1));
      tg.computeVertexNormals();
      var terrain = new THREE.Mesh(tg, new THREE.MeshLambertMaterial({ vertexColors: true }));
      scene.add(terrain);

      function hAt(x, z) {
        var fx = clamp((x + W / 2) / cell, 0, NS - 0.0001), fz = clamp((z + W / 2) / cell, 0, NS - 0.0001);
        var i0 = Math.floor(fx), j0 = Math.floor(fz), u = fx - i0, v = fz - j0;
        var ha = hts[j0 * V + i0], hb = hts[j0 * V + i0 + 1], hc = hts[(j0 + 1) * V + i0], hd = hts[(j0 + 1) * V + i0 + 1];
        if (u + v <= 1) return ha + u * (hb - ha) + v * (hc - ha);
        return hd + (1 - u) * (hc - hd) + (1 - v) * (hb - hd);
      }
      function nAt(x, z, out) {
        var e = 0.4;
        out.set(hAt(x - e, z) - hAt(x + e, z), 2 * e, hAt(x, z - e) - hAt(x, z + e)).normalize();
        return out;
      }

      // rocket parked nearby
      var rocket = new THREE.Group();
      var white = new THREE.MeshLambertMaterial({ color: 0xf4f1ff, emissive: 0x55536a }), orange = new THREE.MeshLambertMaterial({ color: 0xff7a45, emissive: 0x5a2010 }), teal = new THREE.MeshLambertMaterial({ color: 0x5fe0c8, emissive: 0x1a5a50 });
      var bodyM = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.15, 4.2, 20), white); bodyM.position.y = 2.6; rocket.add(bodyM);
      var nose = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 20), orange); nose.position.y = 5.6; rocket.add(nose);
      var win = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.2, 20), teal); win.rotation.x = Math.PI / 2; win.position.set(0, 3.4, 1.02); rocket.add(win);
      var finG = new THREE.BoxGeometry(0.16, 1.5, 1.1);
      for (var f = 0; f < 3; f++) { var fin = new THREE.Mesh(finG, orange); var a = f * Math.PI * 2 / 3; fin.position.set(Math.sin(a) * 1.2, 1.0, Math.cos(a) * 1.2); fin.rotation.y = a; rocket.add(fin); }
      var rx = -7, rz = -9;
      rocket.position.set(rx, hAt(rx, rz) - 0.15, rz); rocket.rotation.y = 0.5;
      scene.add(rocket);
      var flame = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.6, 16), new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.9 }));
      flame.rotation.x = Math.PI; flame.position.y = -0.9; flame.visible = false; rocket.add(flame);
      var flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.6, 12), new THREE.MeshBasicMaterial({ color: 0xfff3b0 }));
      flameCore.rotation.x = Math.PI; flameCore.position.y = -0.5; flameCore.visible = false; rocket.add(flameCore);
      var spots = [{ kind: 'rocket', x: rx + Math.sin(0.5) * 1.7, z: rz + Math.cos(0.5) * 1.7, r: 2.6, label: '\uD83D\uDE80 Climb aboard' }];

      // rocks
      var rockGeo = new THREE.IcosahedronGeometry(1, 0);
      var NR = 150, rocks = new THREE.InstancedMesh(rockGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), NR);
      var rcol = new THREE.Color();
      for (var r = 0; r < NR; r++) {
        var px, pz;
        do { px = (rnd() - 0.5) * 360; pz = (rnd() - 0.5) * 360; } while (Math.hypot(px, pz) < 4 || Math.hypot(px - rx, pz - rz) < 3.5);
        var s = 0.15 + Math.pow(rnd(), 3) * 1.6;
        tmpQ.setFromEuler(new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6));
        tmpM.compose(tmpV.set(px, hAt(px, pz) - s * 0.25, pz), tmpQ, tmpV2.set(s * (0.8 + rnd() * 0.6), s * (0.5 + rnd() * 0.4), s * (0.8 + rnd() * 0.6)));
        rocks.setMatrixAt(r, tmpM);
        rcol.copy(gr2).lerp(gr1, rnd() * 0.5).multiplyScalar(0.75 + rnd() * 0.25);
        rocks.setColorAt(r, rcol);
      }
      scene.add(rocks);

      // Earth: a little village with houses, gardens and trees
      var homes = [];
      if (id === 'earth') {
        var WALLS = ['#f6e7c8', '#f3c6c6', '#c9e4f6', '#fdf0a6', '#d8f0c8', '#ffffff', '#e9d3f5', '#f7d3a8'], ROOFS = ['#b4473a', '#8a4b2f', '#5b6a8c', '#3f6e4a', '#a63d5a'];
        var lam = function (c, em) { return new THREE.MeshLambertMaterial({ color: c, emissive: em || new THREE.Color(c).multiplyScalar(0.32) }); };
        var winMat = lam('#9fd3ff', 0x1d3557), doorMats = ['#3f8fe0', '#e63946', '#2a9d8f', '#ffb703', '#6d4c41'].map(function (c) { return lam(c); });
        var fenceMat = lam('#ffffff'), trunkMat = lam('#6d4c2f'), leafMats = ['#3f8f3a', '#4fa64a', '#2f7a3a', '#6abf4b'].map(function (c) { return lam(c); });
        var pathMat = new THREE.MeshLambertMaterial({ color: 0xd9cdb0 });
        function sign(text) {
          var c = canvas(512, 160), x = c.getContext('2d');
          x.fillStyle = '#fffaf0'; x.fillRect(0, 0, 512, 160); x.strokeStyle = '#8a5a2f'; x.lineWidth = 14; x.strokeRect(7, 7, 498, 146);
          x.fillStyle = '#3a2614'; x.font = 'bold 58px "Baloo 2", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 84);
          return c;
        }
        function house(hx, hz, rot, k, isHome) {
          var g = new THREE.Group(), w = 4.2 + rnd() * 1.6, d = 3.6 + rnd() * 1.2, h = 2.6 + rnd() * 0.6, two = !isHome && rnd() < 0.35;
          if (isHome) { w = 5.4; d = 4.4; h = 3.0; }
          var hh = two ? h * 1.7 : h, wall = lam(isHome ? '#ffe3ef' : WALLS[k % WALLS.length]);
          var body = new THREE.Mesh(new THREE.BoxGeometry(w, hh + 2, d), wall); body.position.y = hh / 2 - 1; g.add(body);
          var roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 1, 1, 4, 1), lam(ROOFS[k % ROOFS.length]));
          roof.rotation.y = Math.PI / 4; roof.scale.set((w + 0.8) * 0.72, 2.1, (d + 0.8) * 0.72); roof.position.y = hh + 1.05; g.add(roof);
          var chim = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.5), lam('#9c5a3c')); chim.position.set(w * 0.25, hh + 1.5, -d * 0.15); g.add(chim);
          var door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.1), doorMats[k % doorMats.length]); door.position.set(0, 0.85, d / 2 + 0.03); g.add(door);
          var knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), lam('#ffd166')); knob.position.set(0.28, 0.85, d / 2 + 0.1); g.add(knob);
          var floors = two ? [1.3, 1.3 + h * 0.75] : [1.3];
          floors.forEach(function (fy, fi) { [-1, 1].forEach(function (sx) {
            var wn = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.08), winMat); wn.position.set(sx * w * 0.3, fy + (fi ? 0.2 : 0.3), d / 2 + 0.03); g.add(wn);
            var fr = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.12, 0.12), fenceMat); fr.position.set(sx * w * 0.3, fy + (fi ? 0.2 : 0.3) - 0.45, d / 2 + 0.06); g.add(fr);
          }); });
          if (two) { var up = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.08), winMat); up.position.set(0, 1.3 + h * 0.75 + 0.2, d / 2 + 0.03); g.add(up); }
          // garden path and picket fence
          var path = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 3.2), pathMat); path.position.set(0, 0.02, d / 2 + 1.6); g.add(path);
          for (var pf = -5; pf <= 5; pf++) { if (Math.abs(pf) <= 1) continue; var post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.08), fenceMat); post.position.set(pf * (w / 10), 0.35, d / 2 + 3.1); g.add(post); }
          var rail = new THREE.Mesh(new THREE.BoxGeometry(w * 0.4, 0.08, 0.06), fenceMat); rail.position.set(-w * 0.35, 0.5, d / 2 + 3.1); g.add(rail);
          var rail2 = rail.clone(); rail2.position.x = w * 0.35; g.add(rail2);
          if (isHome) {
            var sg = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.75), new THREE.MeshBasicMaterial({ map: tex(sign(opts.homeName ? opts.homeName + "'s House" : 'Home')), side: THREE.DoubleSide }));
            sg.position.set(-1.9, 1.35, d / 2 + 3.2); g.add(sg);
            var sp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), trunkMat); sp.position.set(-1.9, 0.55, d / 2 + 3.15); g.add(sp);
            var kennel = new THREE.Group(), kb = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 1.0), lam('#c98a3d')); kb.position.y = 0.4; kennel.add(kb);
            var kr = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.95, 0.6, 4, 1), lam('#b4473a')); kr.rotation.y = Math.PI / 4; kr.position.y = 1.1; kennel.add(kr);
            var kd = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), lam('#2b1a10')); kd.position.set(0, 0.35, 0.51); kennel.add(kd);
            kennel.position.set(w / 2 + 1.4, 0, d / 2 + 0.8); g.add(kennel);
            spots.push({ kind: 'house', x: hx, z: hz + d / 2 + 0.9, r: 2.2, label: '\uD83C\uDFE0 Go inside' });
            spots.push({ kind: 'kennel', x: hx + w / 2 + 1.4, z: hz + d / 2 + 1.5, r: 1.7, label: '\uD83D\uDC36 Peek in the kennel' });
          }
          g.position.set(hx, hAt(hx, hz) - 0.05, hz); g.rotation.y = rot; scene.add(g);
          homes.push({ x: hx, z: hz, r: Math.max(w, d) * 0.62 });
        }
        // a curved street of houses all facing the middle, with your home nearest
        house(0, -15, 0, 0, true);
        for (var hi = 0; hi < 13; hi++) {
          var ang = (hi + 1) * (Math.PI * 2 / 14) + (rnd() - 0.5) * 0.12, rad = 17 + rnd() * 5;
          var hx = Math.sin(ang) * rad, hz = -Math.cos(ang) * rad;
          if (Math.hypot(hx - rx, hz - rz) < 7) continue;
          house(hx, hz, -ang + Math.PI, hi + 1, false);
        }
        // trees
        for (var ti = 0; ti < 70; ti++) {
          var tx, tz, ok, tries2 = 0;
          do { tx = (rnd() - 0.5) * 140; tz = (rnd() - 0.5) * 140; ok = Math.hypot(tx, tz) > 8 && Math.hypot(tx - rx, tz - rz) > 4; for (var hk = 0; hk < homes.length && ok; hk++) if (Math.hypot(tx - homes[hk].x, tz - homes[hk].z) < homes[hk].r + 2.5) ok = false; tries2++; } while (!ok && tries2 < 20);
          if (!ok) continue;
          var tr = new THREE.Group(), ts = 0.8 + rnd() * 0.8;
          var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.6, 8), trunkMat); trunk.position.y = 0.8; tr.add(trunk);
          var lm = leafMats[ti % leafMats.length];
          if (ti % 3 === 0) { var cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.6, 9), lm); cone.position.y = 2.6; tr.add(cone); }
          else { var blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), lm); blob.position.y = 2.4; tr.add(blob); var b2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), lm); b2.position.set(0.6, 2.0, 0.3); tr.add(b2); }
          tr.scale.setScalar(ts); tr.position.set(tx, hAt(tx, tz) - 0.1, tz); scene.add(tr);
          homes.push({ x: tx, z: tz, r: 0.45 * ts });
        }
        // flowers
        var NF = 400, flowers = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.12, 0), new THREE.MeshLambertMaterial({ color: 0xffffff }), NF), fc = new THREE.Color();
        var FC = ['#ff6fa8', '#ffd166', '#ffffff', '#b26bff', '#ff7a45'];
        for (var fi2 = 0; fi2 < NF; fi2++) { var fx2 = (rnd() - 0.5) * 90, fz2 = (rnd() - 0.5) * 90; tmpM.compose(tmpV.set(fx2, hAt(fx2, fz2) + 0.08, fz2), tmpQ.set(0, 0, 0, 1), tmpV2.set(1, 1, 1)); flowers.setMatrixAt(fi2, tmpM); flowers.setColorAt(fi2, fc.set(FC[fi2 % FC.length])); }
        scene.add(flowers);
      }

      // footprints
      var MAXP = 160;
      var printGeo = new THREE.PlaneGeometry(0.24, 0.42); printGeo.rotateX(-Math.PI / 2);
      var prints = new THREE.InstancedMesh(printGeo, new THREE.MeshBasicMaterial({ map: tex(bootCanvas()), color: gr2.clone().lerp(new THREE.Color(0), 0.55), transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), MAXP);
      prints.count = 0; prints.frustumCulled = false; prints.renderOrder = 1;
      scene.add(prints);
      var printN = 0, printNext = 0, printSide = 1, printDist = 0;
      function addPrint(x, z, dx, dz) {
        var side = printSide; printSide = -printSide;
        var px = x + dz * 0.13 * side, pz = z - dx * 0.13 * side;
        nAt(px, pz, tmpV2);
        tmpQ.setFromUnitVectors(UP, tmpV2);
        tmpQ2.setFromAxisAngle(UP, Math.atan2(dx, dz));
        tmpQ.multiply(tmpQ2);
        tmpM.compose(tmpV.set(px, hAt(px, pz) + 0.03, pz), tmpQ, tmpV2.set(1, 1, 1));
        prints.setMatrixAt(printNext, tmpM);
        printNext = (printNext + 1) % MAXP; printN = Math.min(MAXP, printN + 1);
        prints.count = printN; prints.instanceMatrix.needsUpdate = true;
      }

      // blob shadow
      var shadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex(softDot(64, 0.3, '#000')), color: 0x000000, transparent: true, opacity: 0.4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
      shadow.renderOrder = 2; scene.add(shadow);

      // flags
      var flagTex = tex(flagCanvas());
      var poleG = new THREE.CylinderGeometry(0.03, 0.03, 1.7, 8); poleG.translate(0, 0.85, 0);
      var clothG = new THREE.PlaneGeometry(0.8, 0.45, 6, 1); clothG.translate(0.4, 1.42, 0);
      var cpos = clothG.attributes.position; for (var q = 0; q < cpos.count; q++) cpos.setZ(q, Math.sin(cpos.getX(q) * 7) * 0.04);
      clothG.computeVertexNormals();
      var tipG = new THREE.SphereGeometry(0.07, 10, 6); tipG.translate(0, 1.72, 0);
      var poleM = new THREE.MeshLambertMaterial({ color: 0xe9e6f5 }), clothM = new THREE.MeshLambertMaterial({ map: flagTex, side: THREE.DoubleSide, emissive: 0x401020 }), tipM = new THREE.MeshLambertMaterial({ color: 0xffd166, emissive: 0x6a4a00 });
      var flags = [];
      function plantFlag() {
        var rx2 = Math.cos(yaw), rz2 = -Math.sin(yaw);
        var fx = pos.x + rx2 * 0.75, fz = pos.z + rz2 * 0.75;
        var fl = new THREE.Group();
        fl.add(new THREE.Mesh(poleG, poleM)); fl.add(new THREE.Mesh(clothG, clothM)); fl.add(new THREE.Mesh(tipG, tipM));
        fl.position.set(fx, hAt(fx, fz) - 0.05, fz); fl.rotation.y = yaw + 0.5; fl.scale.set(1, 0.01, 1);
        fl.userData.t = 0;
        scene.add(fl); flags.push(fl);
        if (flags.length > 12) scene.remove(flags.shift());
        puff(fx, hAt(fx, fz), fz, 8, 0.8);
        sfx('chime');
        var n = flags.length;
        toast(n === 1 ? 'Flag planted on ' + name + '!' : 'Flag number ' + n + ' planted!', 2200);
      }

      // dust
      var dustN = 90, dust = softPoints(dustN, { soft: 0.15, near: 0.3 });
      var dustC = gr1.clone().lerp(new THREE.Color('#ffffff'), 0.25);
      var dVel = new Float32Array(dustN * 3), dLife = new Float32Array(dustN), dMax = new Float32Array(dustN), dHead = 0;
      scene.add(dust);
      function puff(x, y, z, n, power) {
        var P = dust.geometry.attributes.position.array, C = dust.geometry.attributes.aColor.array, S = dust.geometry.attributes.aSize.array;
        for (var k = 0; k < n; k++) {
          var i2 = dHead; dHead = (dHead + 1) % dustN;
          var a2 = rnd() * Math.PI * 2, sp2 = (0.6 + rnd() * 1.4) * power;
          P[i2 * 3] = x + Math.cos(a2) * 0.2; P[i2 * 3 + 1] = y + 0.05; P[i2 * 3 + 2] = z + Math.sin(a2) * 0.2;
          dVel[i2 * 3] = Math.cos(a2) * sp2; dVel[i2 * 3 + 1] = (0.4 + rnd() * 1.1) * power; dVel[i2 * 3 + 2] = Math.sin(a2) * sp2;
          dMax[i2] = dLife[i2] = 0.9 + rnd() * 0.8 + Math.min(2.5, 0.25 / Math.max(g, 0.05));
          S[i2] = 0.25 + rnd() * 0.3;
          C[i2 * 3] = dustC.r; C[i2 * 3 + 1] = dustC.g; C[i2 * 3 + 2] = dustC.b;
        }
        dust.geometry.attributes.aColor.needsUpdate = true; dust.geometry.attributes.aSize.needsUpdate = true;
      }
      function updateDust(dt) {
        var P = dust.geometry.attributes.position.array, A = dust.geometry.attributes.aAlpha.array, S = dust.geometry.attributes.aSize.array;
        var drag = airless ? 0 : 2.2, gg = 9.81 * g * (airless ? 1 : 0.25);
        for (var k = 0; k < dustN; k++) {
          if (dLife[k] <= 0) { A[k] = 0; continue; }
          dLife[k] -= dt;
          dVel[k * 3 + 1] -= gg * dt;
          var dmp = Math.exp(-drag * dt); dVel[k * 3] *= dmp; dVel[k * 3 + 2] *= dmp; dVel[k * 3 + 1] *= dmp;
          P[k * 3] += dVel[k * 3] * dt; P[k * 3 + 1] += dVel[k * 3 + 1] * dt; P[k * 3 + 2] += dVel[k * 3 + 2] * dt;
          var gy = hAt(P[k * 3], P[k * 3 + 2]) + 0.03; if (P[k * 3 + 1] < gy) { P[k * 3 + 1] = gy; dVel[k * 3] *= 0.5; dVel[k * 3 + 2] *= 0.5; dVel[k * 3 + 1] = 0; }
          A[k] = clamp(dLife[k] / dMax[k], 0, 1) * 0.8;
          S[k] += dt * 0.25;
        }
        dust.geometry.attributes.position.needsUpdate = true; dust.geometry.attributes.aAlpha.needsUpdate = true; dust.geometry.attributes.aSize.needsUpdate = true;
      }

      // physics
      var G = 9.81 * g, V0 = Math.sqrt(2 * 9.81 * 0.5), predicted = 0.5 / g;
      var floatAway = predicted > 60;
      var onGround = true, vy = 0, jumpBase = 0, jumpMax = 0, ft = 0, airT = 0;
      pos.set(0, hAt(0, 0), 0);
      camTarget.set(0, pos.y + 1.1, 0);

      function startJump() {
        if (!onGround) return;
        onGround = false; vy = V0; jumpBase = pos.y; jumpMax = 0; ft = 0; airT = 0;
        sfx('jump'); puff(pos.x, pos.y, pos.z, 6, 0.5);
        if (floatAway) {
          toast('Whoa! On ' + name + ' one jump would send you floating off into space!', 4200);
          later(function () { toast('Good thing your safety tether pulls you gently back down...', 4200); }, 4600);
        } else if (predicted > 8) {
          toast('Wheee! Up, up, up... ' + name + ' hardly pulls you back!', 3500);
        }
      }
      function landed() {
        onGround = true; vy = 0;
        sfx('thud');
        puff(pos.x, pos.y, pos.z, floatAway ? 24 : 14, floatAway ? 1.2 : 0.9);
        var hgt = floatAway ? predicted : Math.max(jumpMax, 0.01);
        if (floatAway) {
          jumpLine.textContent = 'Your last jump: about ' + fmtNum(predicted) + ' m high: you\'d float away! (on Earth: 0.5 m)';
          toast('Phew, back on the ground! That jump could have gone about ' + fmtNum(predicted) + ' metres up!', 4500);
        } else {
          jumpLine.textContent = 'Your last jump: ' + fmtNum(hgt) + ' metres high (on Earth: 0.5 m)';
          var k = Math.round(hgt / 0.5);
          if (k >= 2) toast('That\'s about ' + k + ' times higher than on Earth!', 2800);
          else if (hgt < 0.4) toast('Heavy! Your jump is lower than on Earth here.', 2800);
          else toast('Just like jumping on Earth!', 2400);
        }
      }

      var boardT = -1, boardFrom = new THREE.Vector3(), rocketY0 = rocket.position.y;
      function board() {
        if (boardT >= 0) return;
        boardT = 0; boardFrom.copy(pos); boarding = true; root.classList.add('sf-boarding');
        followers.forEach(function (f) { f.from = f.pv.position.clone(); });
        say('dad', 'Everyone aboard? Buckle up!');
      }
      function updateBoard(dt, t) {
        boardT += dt;
        var dX = spots[0].x, dZ = spots[0].z;
        if (boardT < 1.6) {
          var k = boardT / 1.6; k = k * k * (3 - 2 * k);
          pos.x = boardFrom.x + (dX - boardFrom.x) * k; pos.z = boardFrom.z + (dZ - boardFrom.z) * k; pos.y = hAt(pos.x, pos.z);
          harperPivot.position.set(pos.x, pos.y + Math.abs(Math.sin(t * 9)) * 0.08, pos.z);
          shadow.position.set(pos.x, pos.y + 0.03, pos.z);
        } else if (harperPivot.visible) { harperPivot.visible = false; shadow.visible = false; sfx('blip'); }
        followers.forEach(function (f, i) {
          var st = 0.5 + i * 0.35, k2 = clamp((boardT - st) / 1.5, 0, 1), p = f.pv.position;
          if (k2 >= 1) { if (f.pv.visible) { f.pv.visible = false; } return; }
          k2 = k2 * k2 * (3 - 2 * k2);
          p.x = f.from.x + (dX - f.from.x) * k2; p.z = f.from.z + (dZ - f.from.z) * k2;
          p.y = hAt(p.x, p.z) + (k2 > 0 && k2 < 1 ? Math.abs(Math.sin(t * (f.dog ? 11 : 7) + f.hop)) * 0.12 : 0);
          f.pv.rotation.y = yaw;
        });
        var lt = boardT - (2.4 + followers.length * 0.35);
        if (lt > 0) {
          if (!flame.visible) { flame.visible = flameCore.visible = true; sfx('whoosh'); targetDist = 13; pitch = Math.min(pitch, 0.1); }
          var fl = 0.85 + Math.random() * 0.3; flame.scale.set(fl, 0.9 + Math.random() * 0.4 + Math.min(1, lt), fl); flameCore.scale.y = 0.8 + Math.random() * 0.4;
          var shake = lt < 0.8 ? (Math.random() - 0.5) * 0.08 : 0;
          rocket.position.set(rx + shake, rocketY0 + (lt < 0.6 ? 0 : 3 * (lt - 0.6) * (lt - 0.6)), rz);
          pos.set(rx, rocket.position.y + 2.2, rz);
          if (lt > 3.4) close();
        } else pos.y = Math.max(pos.y, hAt(rx, rz));
        return 0;
      }
      function update(dt, mx, mz, moving, t) {
        if (boardT >= 0) return updateBoard(dt, t);
        if (jumpQueued) { jumpQueued = false; startJump(); }
        var spd = 3.3;
        if (moving) {
          pos.x = clamp(pos.x + mx * spd * dt, -195, 195); pos.z = clamp(pos.z + mz * spd * dt, -195, 195);
          var ddx = pos.x - rx, ddz = pos.z - rz, dd = Math.hypot(ddx, ddz);
          if (dd < 1.6 && dd > 0.001) { pos.x = rx + ddx / dd * 1.6; pos.z = rz + ddz / dd * 1.6; }
          for (var hq = 0; hq < homes.length; hq++) { var H = homes[hq], hdx = pos.x - H.x, hdz = pos.z - H.z, hd = Math.hypot(hdx, hdz), hr = H.r + 0.35; if (hd < hr && hd > 0.001) { pos.x = H.x + hdx / hd * hr; pos.z = H.z + hdz / hd * hr; } }
        }
        var gh = hAt(pos.x, pos.z), bob = 0;
        if (onGround) {
          pos.y = gh;
          if (moving) {
            var mag = Math.hypot(mx, mz);
            walkPhase += dt * mag * (5 + 4 * Math.min(1, g));
            bob = Math.abs(Math.sin(walkPhase)) * (0.05 + 0.18 * (1 - Math.min(1, g))) * mag;
            printDist += spd * mag * dt;
            if (printDist > 0.55) { printDist = 0; addPrint(pos.x, pos.z, mx / mag, mz / mag); }
          }
        } else if (floatAway) {
          ft += dt;
          var top = 28, y;
          if (ft < 5) { var e = ft / 5; y = top * (1 - Math.pow(1 - e, 3)); }
          else if (ft < 7.5) y = top + Math.sin((ft - 5) * 2.5) * 0.6;
          else { var e2 = Math.min(1, (ft - 7.5) / 8); y = top * (1 - (e2 * e2 * (3 - 2 * e2))); }
          pos.y = Math.max(gh, jumpBase + y);
          if (ft >= 15.5) { pos.y = gh; landed(); }
        } else {
          var tA = V0 / G;
          if (airT < tA && airT + dt >= tA) jumpMax = Math.max(jumpMax, V0 * V0 / (2 * G)); // exact apex
          airT += dt; vy = V0 - G * airT;
          pos.y = jumpBase + V0 * airT - 0.5 * G * airT * airT;
          jumpMax = Math.max(jumpMax, pos.y - jumpBase);
          if (pos.y <= gh && vy < 0) { pos.y = gh; landed(); }
        }
        harperPivot.position.set(pos.x, pos.y + bob, pos.z);
        harper.rotation.z = onGround && moving ? Math.sin(walkPhase * 2) * 0.05 : (onGround ? 0 : Math.sin(t * 1.5) * 0.08);
        // shadow
        var hab = pos.y - gh;
        nAt(pos.x, pos.z, tmpV2); shadow.quaternion.setFromUnitVectors(UP, tmpV2);
        shadow.position.set(pos.x, gh + 0.03, pos.z);
        var ss = 1 / (1 + hab * 0.25); shadow.scale.setScalar(ss); shadow.material.opacity = 0.4 * ss;
        // flags grow
        for (var fI = 0; fI < flags.length; fI++) { var fl = flags[fI]; if (fl.userData.t < 1) { fl.userData.t = Math.min(1, fl.userData.t + dt * 3); var e3 = fl.userData.t; fl.scale.y = 1 - Math.pow(1 - e3, 3) + Math.sin(e3 * Math.PI) * 0.15; } }
        updateDust(dt);
        return hab;
      }
      return { update: update, hAt: hAt, plantFlag: plantFlag, isGround: function () { return onGround && boardT < 0; }, spots: spots, board: board };
    }

    function ringGeo(inner, outer) {
      var gg = new THREE.RingGeometry(inner, outer, 96, 1);
      var pa = gg.attributes.position, uv = gg.attributes.uv;
      for (var i = 0; i < pa.count; i++) { var rr = Math.hypot(pa.getX(i), pa.getY(i)); uv.setXY(i, (rr - inner) / (outer - inner), 0.5); }
      return gg;
    }

    // ---------- GAS WORLD / SUN ----------
    function buildGas() {
      var isSun = id === 'sun';
      var pal = (GAS_PAL[id] || [land.ground2 || '#ffffff', land.sky || '#88aaff', land.ground || '#5577cc', '#334488']).map(function (h, i) { return col(h, ['#ffffff', '#88aaff', '#5577cc', '#334488'][i]); });
      var top = isSun ? new THREE.Color('#e8400f') : pal[3].clone().multiplyScalar(0.7);
      var hor = isSun ? new THREE.Color('#ffb347') : pal[0].clone().lerp(pal[1], 0.5);
      var bot = isSun ? new THREE.Color('#ff9a3c') : pal[2].clone().multiplyScalar(0.8);
      var sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({ uniforms: { top: { value: top }, hor: { value: hor }, bot: { value: bot } }, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false }));
      sky.renderOrder = -10; skyGroup.add(sky);
      scene.fog = new THREE.Fog(hor, 40, 230);

      var layers = [];
      if (isSun) {
        var pt = tex(plasmaCanvas(5), true); pt.repeat.set(6, 6);
        var surf = new THREE.Mesh(new THREE.PlaneGeometry(700, 700).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: pt, color: 0xffd0a0 }));
        surf.position.y = -38; scene.add(surf);
        layers.push({ m: surf, tex: pt, tile: 700 / 6, wind: 0.6, y: -38 });
        // prominence arcs
        var arcM = new THREE.MeshBasicMaterial({ color: 0xff4d1a, transparent: true, opacity: 0.85, depthWrite: false });
        var arcs = [];
        [[-60, -120, 34, 0.3], [70, -150, 46, -0.4], [-10, -210, 60, 0.1]].forEach(function (a) {
          var m = new THREE.Mesh(new THREE.TorusGeometry(a[2], a[2] * 0.06, 8, 40, Math.PI), arcM);
          m.position.set(a[0], -38, a[1]); m.rotation.y = a[3]; scene.add(m); arcs.push(m);
        });
        var ct = tex(cloudCanvas(9), true); ct.repeat.set(3, 3);
        var haze = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: ct, color: 0xff9a3c, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }));
        haze.position.y = -16; scene.add(haze);
        layers.push({ m: haze, tex: ct, tile: 200, wind: 2.5, y: -16 });
      } else {
        var specs = [[-34, 2, 0.95, 1], [-15, 1, 0.75, 1.6], [12, 0, 0.55, 2.4], [32, 3, 0.7, 1.2]];
        specs.forEach(function (s, i) {
          var ct2 = tex(cloudCanvas(seed + i * 17), true); ct2.repeat.set(3, 3);
          var m = new THREE.Mesh(new THREE.PlaneGeometry(600, 600).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: ct2, color: pal[s[1]], transparent: true, opacity: s[2], depthWrite: false, side: THREE.DoubleSide }));
          m.position.y = s[0]; m.renderOrder = i; scene.add(m);
          layers.push({ m: m, tex: ct2, tile: 200, wind: s[3], y: s[0] });
        });
        // solid-ish deep cloud deck below
        var deck = new THREE.Mesh(new THREE.PlaneGeometry(700, 700).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: pal[2].clone().multiplyScalar(0.85) }));
        deck.position.y = -60; scene.add(deck);
        layers.push({ m: deck, tex: null, tile: 1, wind: 0, y: -60 });
        if (id === 'saturn') {
          var ring = new THREE.Mesh(ringGeo(520, 820), new THREE.MeshBasicMaterial({ map: tex(ringCanvas([250, 236, 200])), transparent: true, side: THREE.DoubleSide, fog: false, depthWrite: false }));
          ring.rotation.x = -Math.PI / 2 + 1.0; ring.position.set(0, -420, 0);
          skyGroup.add(ring);
        }
      }

      // cloud puffs / plasma sparks
      var NP = isSun ? 160 : 240, BOX = 90;
      var puffs = softPoints(NP, { soft: isSun ? 0.0 : 0.25, near: isSun ? 1 : 5, additive: isSun });
      var P = puffs.geometry.attributes.position.array, S = puffs.geometry.attributes.aSize.array, A = puffs.geometry.attributes.aAlpha.array, C = puffs.geometry.attributes.aColor.array;
      var pv = new Float32Array(NP);
      for (var i = 0; i < NP; i++) {
        P[i * 3] = (rnd() - 0.5) * BOX * 2; P[i * 3 + 2] = (rnd() - 0.5) * BOX * 2;
        if (isSun) { P[i * 3 + 1] = -38 + rnd() * 60; S[i] = 0.6 + rnd() * 1.6; A[i] = 0.9; pv[i] = 2 + rnd() * 6; }
        else { var yy; do { yy = -30 + rnd() * 60; } while (Math.abs(yy) < 3); P[i * 3 + 1] = yy; S[i] = 6 + rnd() * 14; A[i] = 0.35 + rnd() * 0.4; pv[i] = 0.5 + rnd(); }
        var cpk = isSun ? new THREE.Color(rnd() < 0.5 ? '#fff1a8' : '#ff9a3c') : pal[Math.floor(rnd() * 3)].clone().lerp(new THREE.Color('#ffffff'), 0.3);
        C[i * 3] = cpk.r; C[i * 3 + 1] = cpk.g; C[i * 3 + 2] = cpk.b;
      }
      scene.add(puffs);

      // bubble around Harper
      var bubble = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 16), new THREE.ShaderMaterial({ uniforms: { color: { value: new THREE.Color(isSun ? '#ffe9a0' : '#bff6ff') }, t: { value: 0 } }, vertexShader: BUB_VS, fragmentShader: BUB_FS, transparent: true, depthWrite: false }));
      bubble.position.y = HH / 2; bubble.renderOrder = 5;
      harperPivot.add(bubble);
      if (isSun) {
        var shine = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(softDot(64, 0.55, 'rgba(255,240,180,0.6)')), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
        shine.position.set(0, HH / 2, -0.6); shine.scale.setScalar(3.0); shine.material.opacity = 0.45; harperPivot.add(shine);
      }
      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      var dl = new THREE.DirectionalLight(0xffffff, 0.4); dl.position.set(-1, 2, 1); scene.add(dl);

      pos.set(0, 0, 0); camTarget.set(0, HH / 2, 0);
      var vel = new THREE.Vector3();
      function update(dt, mx, mz, moving, t) {
        if (jumpQueued) { jumpQueued = false; vel.y += 5; sfx('whoosh'); }
        var spd = 4;
        vel.x += ((moving ? mx * spd : 0) - vel.x) * Math.min(1, dt * 2.5);
        vel.z += ((moving ? mz * spd : 0) - vel.z) * Math.min(1, dt * 2.5);
        vel.y += (-pos.y * 0.9 - vel.y * 1.1) * dt;
        pos.addScaledVector(vel, dt);
        pos.y = clamp(pos.y, -20, 22);
        harperPivot.position.set(pos.x, pos.y + Math.sin(t * 1.3) * 0.25, pos.z);
        harper.rotation.z = Math.sin(t * 0.9) * 0.1 - vel.x * 0.02;
        bubble.material.uniforms.t.value = t;
        for (var k = 0; k < layers.length; k++) {
          var Ly = layers[k];
          Ly.m.position.x = pos.x; Ly.m.position.z = pos.z;
          if (Ly.tex) { Ly.tex.offset.x = (pos.x + t * Ly.wind) / Ly.tile; Ly.tex.offset.y = -pos.z / Ly.tile; }
        }
        if (isSun) {
          layers[0].m.material.color.setRGB(1, 0.78 + 0.06 * Math.sin(t * 2), 0.6);
        }
        for (var q = 0; q < NP; q++) {
          var o = q * 3;
          if (isSun) { P[o + 1] += pv[q] * dt; if (P[o + 1] > 25) P[o + 1] = -38; A[q] = clamp((25 - P[o + 1]) / 20, 0, 1) * 0.95; }
          else P[o] += pv[q] * dt * 1.5;
          var dx = P[o] - pos.x, dz = P[o + 2] - pos.z;
          if (dx > BOX) P[o] -= BOX * 2; else if (dx < -BOX) P[o] += BOX * 2;
          if (dz > BOX) P[o + 2] -= BOX * 2; else if (dz < -BOX) P[o + 2] += BOX * 2;
        }
        puffs.geometry.attributes.position.needsUpdate = true;
        if (isSun) puffs.geometry.attributes.aAlpha.needsUpdate = true;
        return 0;
      }
      return { update: update, hAt: null, plantFlag: function () {}, isGround: function () { return false; } };
    }

    // ---------- input ----------
    function setJoy(e) {
      var r = joy.getBoundingClientRect(), R = r.width * 0.36;
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var m = Math.hypot(dx, dy); if (m > R) { dx *= R / m; dy *= R / m; }
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      joyVec.x = dx / R; joyVec.y = -dy / R;
    }
    on(joy, 'pointerdown', function (e) { e.preventDefault(); joyId = e.pointerId; try { joy.setPointerCapture(e.pointerId); } catch (er) {} setJoy(e); });
    on(joy, 'pointermove', function (e) { if (e.pointerId === joyId) setJoy(e); });
    function joyEnd(e) { if (e.pointerId !== joyId) return; joyId = null; joyVec.x = joyVec.y = 0; knob.style.transform = ''; }
    on(joy, 'pointerup', joyEnd); on(joy, 'pointercancel', joyEnd); on(joy, 'lostpointercapture', joyEnd);

    on(cv, 'pointerdown', function (e) { e.preventDefault(); if (orbitId !== null) return; orbitId = e.pointerId; orbitLast = [e.clientX, e.clientY]; try { cv.setPointerCapture(e.pointerId); } catch (er) {} });
    on(cv, 'pointermove', function (e) {
      if (e.pointerId !== orbitId) return;
      var dx = e.clientX - orbitLast[0], dy = e.clientY - orbitLast[1]; orbitLast = [e.clientX, e.clientY];
      yaw -= dx * 0.0065; pitch = clamp(pitch + dy * 0.0045, -0.25, 1.3);
    });
    function orbitEnd(e) { if (e.pointerId === orbitId) orbitId = null; }
    on(cv, 'pointerup', orbitEnd); on(cv, 'pointercancel', orbitEnd);
    on(cv, 'wheel', function (e) { e.preventDefault(); targetDist = clamp(targetDist * (e.deltaY > 0 ? 1.1 : 0.9), 3.5, 16); }, { passive: false });
    on(root, 'contextmenu', function (e) { e.preventDefault(); });
    on(root, 'gesturestart', function (e) { e.preventDefault(); });

    on(jumpBtn, 'pointerdown', function (e) { e.preventDefault(); jumpQueued = true; jumpBtn.classList.add('sf-down'); });
    function jUp() { jumpBtn.classList.remove('sf-down'); }
    on(jumpBtn, 'pointerup', jUp); on(jumpBtn, 'pointercancel', jUp); on(jumpBtn, 'pointerleave', jUp);
    on(jumpBtn, 'keydown', function (e) { if (e.key === 'Enter') jumpQueued = true; });
    if (flagBtn) on(flagBtn, 'click', function () { if (world.isGround()) world.plantFlag(); else toast('Land first, then plant your flag!', 2000); });
    on(backBtn, 'click', function () { close(); });
    on(actBtn, 'click', function () {
      var sp = actSpot; if (!sp || paused || boarding) return;
      if (sp.kind === 'rocket') { actBtn.hidden = true; actSpot = null; world.board(); return; }
      if (typeof opts.enterHome !== 'function') { toast('The door is locked!', 2000); return; }
      paused = true; keys = {}; joyVec.x = joyVec.y = 0; knob.style.transform = '';
      actBtn.hidden = true; actSpot = null;
      sfx('blip');
      try { opts.enterHome(sp.kind, function () { paused = false; last = performance.now(); }); } catch (e) { paused = false; }
    });
    var infoTouched = false;
    later(function () { if (!infoTouched && (root.clientWidth < 640 || root.clientHeight < 520)) { info.classList.add('sf-min'); root.querySelector('.sf-info-head').setAttribute('aria-expanded', 'false'); } }, 8000);
    on(root.querySelector('.sf-info-head'), 'click', function () {
      infoTouched = true;
      var min = info.classList.toggle('sf-min');
      this.setAttribute('aria-expanded', String(!min));
    });

    var KEYMAP = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
    on(window, 'keydown', function (e) {
      if (paused) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
      var k = KEYMAP[e.code];
      if (k) { keys[k] = true; e.preventDefault(); e.stopPropagation(); }
      else if (e.code === 'Space') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) jumpQueued = true; }
      else if (e.code === 'KeyF' && !gas) { e.stopPropagation(); if (!e.repeat && world.isGround()) world.plantFlag(); }
    }, true);
    on(window, 'keyup', function (e) { var k = KEYMAP[e.code]; if (k) { keys[k] = false; e.stopPropagation(); } }, true);
    on(window, 'blur', function () { keys = {}; });

    function resize() {
      var w = root.clientWidth || window.innerWidth, h = root.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = camera.aspect < 1 ? 66 : 55;
      camera.updateProjectionMatrix();
      var sc = h * renderer.getPixelRatio() / (2 * Math.tan(camera.fov * Math.PI / 360));
      for (var i = 0; i < ptsMats.length; i++) ptsMats[i].uniforms.uScale.value = sc;
    }
    on(window, 'resize', resize);
    on(window, 'orientationchange', function () { later(resize, 250); });
    resize();

    // ---------- loop ----------
    var last = performance.now(), t0 = last;
    function frame(now) {
      if (closed) return;
      raf = requestAnimationFrame(frame);
      if (paused) { last = now; return; }
      var dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
      var t = (now - t0) / 1000;
      var ix = joyVec.x + (keys.r ? 1 : 0) - (keys.l ? 1 : 0), iy = joyVec.y + (keys.u ? 1 : 0) - (keys.d ? 1 : 0);
      var im = Math.hypot(ix, iy); if (im > 1) { ix /= im; iy /= im; im = 1; }
      var moving = im > 0.08;
      var fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      var mx = rx * ix + fx * iy, mz = rz * ix + fz * iy;
      if (ix > 0.15) facingTarget = 1; else if (ix < -0.15) facingTarget = -1;
      facing += (facingTarget - facing) * Math.min(1, dt * 12);
      var hab = world.update(dt, mx, mz, moving, t);
      if (closed) return;

      // billboard (faces camera around Y), flip for direction
      harperPivot.rotation.y = yaw;
      if (followers.length && !boarding) updateFollowers(dt, t, moving);
      if (world.spots && !boarding) {
        var best = null, bd = 1e9;
        if (world.isGround()) for (var q = 0; q < world.spots.length; q++) { var S = world.spots[q], sd = Math.hypot(pos.x - S.x, pos.z - S.z); if (sd < S.r && sd < bd) { bd = sd; best = S; } }
        if (best !== actSpot) { actSpot = best; actBtn.hidden = !best; if (best) actBtn.textContent = best.label; }
      }
      harper.scale.x = Math.abs(facing) < 0.12 ? 0.12 * Math.sign(facing || 1) : facing;

      // camera
      dist += (targetDist + Math.min(18, hab * 0.45) - dist) * Math.min(1, dt * 3);
      var tx = pos.x, ty = pos.y + (gas ? HH / 2 : 1.15), tz = pos.z;
      var kh = Math.min(1, dt * 9), kv = Math.min(1, dt * 4);
      camTarget.x += (tx - camTarget.x) * kh; camTarget.z += (tz - camTarget.z) * kh; camTarget.y += (ty - camTarget.y) * kv;
      var cp = Math.cos(pitch);
      camera.position.set(camTarget.x + Math.sin(yaw) * cp * dist, camTarget.y + Math.sin(pitch) * dist, camTarget.z + Math.cos(yaw) * cp * dist);
      if (world.hAt) { var minY = world.hAt(camera.position.x, camera.position.z) + 0.45; if (camera.position.y < minY) camera.position.y = minY;
        // keep hills between the camera and Harper from hiding her
        for (var si = 1; si <= 3; si++) {
          var s4 = si / 4, sx = camTarget.x + (camera.position.x - camTarget.x) * s4, sz = camTarget.z + (camera.position.z - camTarget.z) * s4;
          var need = world.hAt(sx, sz) + 0.35 - camTarget.y;
          var have = (camera.position.y - camTarget.y) * s4;
          if (need > have) camera.position.y = camTarget.y + need / s4;
        }
      }
      camera.lookAt(camTarget.x, camTarget.y + 0.35, camTarget.z);
      skyGroup.position.copy(camera.position);
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);

    // ---------- intro ----------
    sfx('whoosh');
    toast(land.note || (gas ? 'There is no ground to stand on here!' : 'You made it to ' + name + '!'));
    if (gas) {
      toast(id === 'sun' ? 'Way too hot! Your heat shield bubble keeps you safe.' : 'Use the joystick to drift through the clouds!', 3500);
    } else {
      toast('Walk with the joystick, tap JUMP, and drag the sky to look around!', 3800);
    }
    later(function () {
      var line;
      if (id === 'sun') line = ['dad', 'Good thing we packed the heat shield!'];
      else if (gas) line = ['oda', 'Where did the ground go? We\'re floating!'];
      else if (g < 0.05) line = ['oda', 'Can I jump too? I bet I\'d float to the stars!'];
      else if (g < 0.5) line = ['oda', 'Can I jump too?'];
      else if (g > 1.2) line = ['mum', 'Oof, I feel so heavy here!'];
      else line = ['dad', 'Feels a bit like home!'];
      say(line[0], line[1]);
    }, 900);

    // ---------- close ----------
    function close(silent) {
      if (closed) return;
      closed = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
      listeners.length = 0;
      var geos = new Set(), mats = new Set();
      scene.traverse(function (o) {
        if (o.geometry) geos.add(o.geometry);
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { mats.add(m); });
        if (o.isInstancedMesh && o.dispose) o.dispose();
      });
      // flags removed from scene still share geometry/materials that are already in the set via live flags; dispose leftovers too
      geos.forEach(function (gm) { gm.dispose(); });
      mats.forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); });
      textures.forEach(function (tx) { tx.dispose(); });
      if (scene.fog) scene.fog = null;
      try { renderer.renderLists && renderer.renderLists.dispose(); } catch (e) {}
      renderer.dispose();
      try { renderer.forceContextLoss(); } catch (e) {}
      if (root.parentNode) root.parentNode.removeChild(root);
      if (current && current.close === close) current = null;
      if (!silent) sfx('whoosh');
      if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (e) { setTimeout(function () { throw e; }); } }
    }
    return { close: close };
  }

  window.Surface = { open: open };
})();
