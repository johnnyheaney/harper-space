/* Harper's Space Adventure - DeepSpace module
 * Beautiful objects beyond the solar system, all procedural.
 * window.DeepSpace = { make(id), update(obj, dt, camera), dispose(obj), ids }
 * Flat-ish objects (nebulae, galaxies) are built facing +Z and are yawed to face the camera
 * in update(); set obj.userData.faceCamera = false to disable.
 */
(function () {
  "use strict";
  var T = THREE;
  var TAU = Math.PI * 2;

  // ---------- small helpers ----------
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(R) { return Math.sqrt(-2 * Math.log(R() + 1e-9)) * Math.cos(TAU * R()); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function C(h) { return new T.Color(h); }
  function mixC(a, b, t) { return a.clone().lerp(b, clamp(t, 0, 1)); }
  function pick(R, arr) { return arr[Math.floor(R() * arr.length) % arr.length]; }

  // JS value noise (build time only)
  function hash3(i, j, k, s) { var h = Math.sin(i * 127.1 + j * 311.7 + k * 74.7 + s * 13.37) * 43758.5453; return h - Math.floor(h); }
  function vnoise(x, y, z, s) {
    var i = Math.floor(x), j = Math.floor(y), k = Math.floor(z);
    var fx = x - i, fy = y - j, fz = z - k;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
    function L(a, b, t) { return a + (b - a) * t; }
    return L(
      L(L(hash3(i, j, k, s), hash3(i + 1, j, k, s), fx), L(hash3(i, j + 1, k, s), hash3(i + 1, j + 1, k, s), fx), fy),
      L(L(hash3(i, j, k + 1, s), hash3(i + 1, j, k + 1, s), fx), L(hash3(i, j + 1, k + 1, s), hash3(i + 1, j + 1, k + 1, s), fx), fy), fz);
  }
  function fbm(x, y, z, s) {
    var a = 0, amp = 0.5, f = 1;
    for (var o = 0; o < 4; o++) { a += amp * vnoise(x * f, y * f, z * f, s + o); f *= 2.03; amp *= 0.5; }
    return a / 0.9375;
  }

  // ---------- shared textures (never disposed) ----------
  var shared = {};
  function imgTex(size, fn) {
    var c = document.createElement("canvas"); c.width = c.height = size;
    var g = c.getContext("2d"), im = g.createImageData(size, size), d = im.data;
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
      var u = (x + 0.5) / size * 2 - 1, v = (y + 0.5) / size * 2 - 1;
      var a = clamp(fn(u, v, Math.sqrt(u * u + v * v)), 0, 1), p = (y * size + x) * 4;
      d[p] = d[p + 1] = d[p + 2] = 255; d[p + 3] = Math.round(a * 255);
    }
    g.putImageData(im, 0, 0);
    var t = new T.CanvasTexture(c); t.deepShared = true; return t;
  }
  function tex(name) {
    if (shared[name]) return shared[name];
    var t;
    if (name === "soft") t = imgTex(128, function (u, v, d) { return d >= 1 ? 0 : (Math.exp(-d * d * 6) * 0.85 + 0.15 * Math.exp(-d * d * 2)) * (1 - d * d); });
    else if (name === "core") t = imgTex(128, function (u, v, d) { return d >= 1 ? 0 : (Math.exp(-d * d * 30) + 0.35 * Math.exp(-d * d * 7)) * (1 - d * d); });
    else if (name === "spikes") t = imgTex(256, function (u, v, d) {
      var au = Math.abs(u), av = Math.abs(v);
      var s = Math.exp(-av * 70) * Math.pow(Math.max(0, 1 - au), 2.2) + Math.exp(-au * 70) * Math.pow(Math.max(0, 1 - av), 2.2);
      var p = (u - v) * 0.7071, q = (u + v) * 0.7071, ap = Math.abs(p), aq = Math.abs(q);
      s += 0.25 * (Math.exp(-ap * 90) * Math.pow(Math.max(0, 1 - aq * 1.6), 3) + Math.exp(-aq * 90) * Math.pow(Math.max(0, 1 - ap * 1.6), 3));
      return s + Math.exp(-d * d * 60) * 0.8;
    });
    else if (name === "ring") t = imgTex(256, function (u, v, d) {
      var r = (d - 0.6);
      return (Math.exp(-r * r / (2 * 0.035 * 0.035)) + 0.3 * Math.exp(-r * r / (2 * 0.12 * 0.12))) * (d < 1 ? 1 - d * d * d : 0);
    });
    shared[name] = t; return t;
  }

  // ---------- shaders ----------
  var NOISE = [
    "float dsHash(vec3 p){ p = fract(p*0.3183099 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }",
    "float dsNoise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);",
    " return mix(mix(mix(dsHash(i), dsHash(i+vec3(1.0,0.0,0.0)), f.x), mix(dsHash(i+vec3(0.0,1.0,0.0)), dsHash(i+vec3(1.0,1.0,0.0)), f.x), f.y),",
    "            mix(mix(dsHash(i+vec3(0.0,0.0,1.0)), dsHash(i+vec3(1.0,0.0,1.0)), f.x), mix(dsHash(i+vec3(0.0,1.0,1.0)), dsHash(i+vec3(1.0,1.0,1.0)), f.x), f.y), f.z); }",
    "float dsFbm(vec3 p){ float a = 0.0; float w = 0.5; for (int k = 0; k < 4; k++){ a += w*dsNoise(p); p = p*2.02 + vec3(1.7,9.2,3.1); w *= 0.5; } return a/0.9375; }"
  ].join("\n");

  var STAR_VS = [
    "uniform float uTime; uniform float uBump; uniform float uBumpScale;",
    "varying vec3 vP; varying vec3 vN; varying vec3 vV;",
    "#include <common>", "#include <logdepthbuf_pars_vertex>", NOISE,
    "void main(){",
    " vec3 p = position;",
    " if (uBump > 0.0) { float n = dsFbm(normal*uBumpScale + vec3(uTime*0.12, -uTime*0.08, uTime*0.05)); p += normal * (n - 0.5) * 2.0 * uBump; }",
    " vP = normal;",
    " vec4 mv = modelViewMatrix * vec4(p, 1.0);",
    " vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);",
    " gl_Position = projectionMatrix * mv;",
    " #include <logdepthbuf_vertex>",
    "}"].join("\n");
  var STAR_FS = [
    "uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform float uTime; uniform float uScale; uniform float uSpeed;",
    "varying vec3 vP; varying vec3 vN; varying vec3 vV;",
    "#include <common>", "#include <logdepthbuf_pars_fragment>", NOISE,
    "void main(){",
    " vec3 p = vP * uScale; float t = uTime * uSpeed;",
    " float n1 = dsFbm(p + vec3(t, -t*0.6, t*0.3));",
    " float n2 = dsFbm(p*1.7 - vec3(t*0.7, t*0.4, -t));",
    " float g = dsNoise(p*7.0 + vec3(t*3.0));",
    " float v = n1*n2*2.0*0.8 + g*0.25;",
    " vec3 col = mix(uC1, uC2, smoothstep(0.18, 0.5, v));",
    " col = mix(col, uC3, smoothstep(0.5, 0.78, v));",
    " float mu = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);",
    " col *= 0.55 + 0.5*pow(mu, 0.45);",
    " col += uC2 * pow(1.0 - mu, 2.5) * 0.6;",
    " gl_FragColor = vec4(col, 1.0);",
    " #include <logdepthbuf_fragment>",
    "}"].join("\n");

  var PTS_VS = [
    "uniform float uTime; uniform float uScale; uniform float uSize; uniform float uTwinkle; uniform float uSpin; uniform float uR0; uniform float uBeam; uniform float uMinPx;",
    "attribute vec3 aColor; attribute float aSize; attribute float aPhase;",
    "varying vec3 vColor; varying float vAlpha;",
    "#include <common>", "#include <logdepthbuf_pars_vertex>",
    "void main(){",
    " vec3 p = position; float b = 1.0;",
    " if (uSpin != 0.0) {",
    "  float r = length(p.xz);",
    "  float a = uTime * uSpin * pow(max(r, uR0*0.5)/uR0, -1.5);",
    "  float c = cos(a); float s = sin(a);",
    "  p.xz = vec2(c*p.x - s*p.z, s*p.x + c*p.z);",
    "  b *= 1.0 + uBeam * p.x / max(r, 0.001);",
    " }",
    " b *= 1.0 - uTwinkle + uTwinkle * (0.5 + 0.5*sin(uTime*(1.2 + fract(aPhase*7.13)*3.5) + aPhase*6.2831));",
    " vec4 mv = modelViewMatrix * vec4(p, 1.0);",
    " gl_Position = projectionMatrix * mv;",
    " float dist = max(-mv.z, 0.001); float ws = aSize * uSize;",
    " float px = ws * uScale / dist; float al = 1.0;",
    " if (px < uMinPx) { al = px / uMinPx; al *= al; px = uMinPx; }",
    " al *= clamp((dist - ws*0.5) / (ws*2.0), 0.0, 1.0);",
    " gl_PointSize = min(px, 320.0);",
    " vColor = aColor * max(b, 0.0); vAlpha = al;",
    " #include <logdepthbuf_vertex>",
    "}"].join("\n");
  var PTS_FS = [
    "uniform float uOpacity; uniform float uFall; uniform float uCore;",
    "varying vec3 vColor; varying float vAlpha;",
    "#include <common>", "#include <logdepthbuf_pars_fragment>",
    "void main(){",
    " vec2 q = gl_PointCoord - 0.5; float d2 = dot(q, q) * 4.0;",
    " if (d2 > 1.0 || vAlpha < 0.002) discard;",
    " float m = (exp(-d2*uFall) + uCore*exp(-d2*40.0)) * (1.0 - d2);",
    " gl_FragColor = vec4(vColor, m * vAlpha * uOpacity);",
    " #include <logdepthbuf_fragment>",
    "}"].join("\n");

  var PLANET_VS = [
    "varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;",
    "#include <common>", "#include <logdepthbuf_pars_vertex>",
    "void main(){ vUv = uv; vWN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz;",
    " gl_Position = projectionMatrix * viewMatrix * wp;",
    " #include <logdepthbuf_vertex>",
    "}"].join("\n");
  var PLANET_FS = [
    "uniform sampler2D map; uniform vec3 uLight; uniform vec3 uLightCol;",
    "varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;",
    "#include <common>", "#include <logdepthbuf_pars_fragment>",
    "void main(){ float d = max(dot(normalize(vWN), normalize(uLight - vWP)), 0.0);",
    " vec3 c = texture2D(map, vUv).rgb; gl_FragColor = vec4(c * (vec3(0.13, 0.12, 0.16) + uLightCol * d * 1.15), 1.0);",
    " #include <logdepthbuf_fragment>",
    "}"].join("\n");

  // ---------- context / builders ----------
  var _v2 = new T.Vector2(), _v3 = new T.Vector3(), _q = new T.Quaternion();

  function newCtx(root) {
    return { root: root, time: { value: 0 }, scale: { value: 600 }, ticks: [], face: null, beacon: null, view: 100 };
  }
  function scaleHook(ctx) {
    return function (renderer, scene, camera) {
      renderer.getDrawingBufferSize(_v2);
      ctx.scale.value = _v2.y * 0.5 * camera.projectionMatrix.elements[5];
    };
  }

  function PB(R) { this.R = R; this.p = []; this.c = []; this.s = []; this.f = []; }
  PB.prototype.add = function (x, y, z, col, b, size) {
    this.p.push(x, y, z); this.c.push(col.r * b, col.g * b, col.b * b); this.s.push(size); this.f.push(this.R()); return this;
  };
  PB.prototype.count = function () { return this.s.length; };
  PB.prototype.build = function (ctx, o) {
    o = o || {};
    var g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(this.p, 3));
    g.setAttribute("aColor", new T.Float32BufferAttribute(this.c, 3));
    g.setAttribute("aSize", new T.Float32BufferAttribute(this.s, 1));
    g.setAttribute("aPhase", new T.Float32BufferAttribute(this.f, 1));
    g.computeBoundingSphere();
    var m = new T.ShaderMaterial({
      uniforms: {
        uTime: ctx.time, uScale: ctx.scale,
        uSize: { value: o.size || 1 }, uOpacity: { value: o.opacity == null ? 1 : o.opacity },
        uFall: { value: o.fall || 5 }, uCore: { value: o.core || 0 }, uTwinkle: { value: o.twinkle || 0 },
        uSpin: { value: o.spin || 0 }, uR0: { value: o.r0 || 10 }, uBeam: { value: o.beam || 0 }, uMinPx: { value: o.minPx || 1.5 }
      },
      vertexShader: PTS_VS, fragmentShader: PTS_FS,
      transparent: true, depthWrite: false,
      blending: o.normal ? T.NormalBlending : T.AdditiveBlending
    });
    var pts = new T.Points(g, m);
    pts.onBeforeRender = scaleHook(ctx);
    if (o.renderOrder) pts.renderOrder = o.renderOrder;
    return pts;
  };

  function sprite(texName, color, scale, opacity, normal) {
    var m = new T.SpriteMaterial({ map: tex(texName), color: color, transparent: true, depthWrite: false, opacity: opacity == null ? 1 : opacity,
      blending: normal ? T.NormalBlending : T.AdditiveBlending });
    var s = new T.Sprite(m);
    if (Array.isArray(scale)) s.scale.set(scale[0], scale[1], 1); else s.scale.set(scale, scale, 1);
    return s;
  }
  function glowPlane(color, size, opacity, sx, sy) {
    var m = new T.MeshBasicMaterial({ map: tex("soft"), color: color, transparent: true, depthWrite: false, opacity: opacity, blending: T.AdditiveBlending, side: T.DoubleSide });
    var p = new T.Mesh(new T.PlaneGeometry(size * (sx || 1), size * (sy || 1)), m);
    p.rotation.x = -Math.PI / 2;
    return p;
  }
  function addBeacon(ctx, color, op) {
    var b = sprite("soft", color, 160, op == null ? 0.9 : op);
    b.userData.baseOpacity = op == null ? 0.9 : op;
    b.renderOrder = -1;
    ctx.root.add(b); ctx.beacon = b; return b;
  }
  function orbitLine(r, color, opacity, ry) {
    var pts = [];
    for (var i = 0; i <= 128; i++) { var a = i / 128 * TAU; pts.push(new T.Vector3(Math.cos(a) * r, 0, Math.sin(a) * (ry || r))); }
    return new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, depthWrite: false }));
  }

  function starMesh(ctx, r, cols, o) {
    o = o || {};
    var m = new T.ShaderMaterial({
      uniforms: { uTime: ctx.time, uC1: { value: C(cols[0]) }, uC2: { value: C(cols[1]) }, uC3: { value: C(cols[2]) },
        uScale: { value: o.scale || 3 }, uSpeed: { value: o.speed || 0.15 }, uBump: { value: o.bump || 0 }, uBumpScale: { value: o.bumpScale || 1.6 } },
      vertexShader: STAR_VS, fragmentShader: STAR_FS
    });
    var seg = o.seg || (r > 20 ? 64 : r > 4 ? 40 : 20);
    return new T.Mesh(new T.SphereGeometry(r, seg, Math.round(seg * 0.7)), m);
  }
  // A complete star: shaded sphere + corona + halo
  function makeStar(ctx, r, cols, glowColor, o) {
    o = o || {};
    var g = new T.Group();
    var mesh = starMesh(ctx, r, cols, o);
    g.add(mesh);
    var halo = sprite("soft", glowColor, r * (o.halo || 7), o.haloOp == null ? 0.9 : o.haloOp);
    var core = sprite("core", o.coreColor || glowColor, r * (o.core || 3.2), 0.95);
    g.add(halo, core);
    var spin = o.spin == null ? 0.05 : o.spin;
    ctx.ticks.push(function (t, dt) { mesh.rotation.y += dt * spin; });
    g.userData.mesh = mesh; g.userData.halo = halo; g.userData.core = core;
    return g;
  }

  function canvasTex(w, h, paint) {
    var c = document.createElement("canvas"); c.width = w; c.height = h; paint(c.getContext("2d"), w, h);
    return new T.CanvasTexture(c);
  }

  // ---------- objects ----------
  var MAKERS = {};

  MAKERS.proxima = function (ctx) {
    var root = ctx.root, R = rng(101);
    var star = makeStar(ctx, 6, ["#6a0e02", "#d8400f", "#ffa050"], 0xff5522, { halo: 11, scale: 2.6, speed: 0.25 });
    root.add(star);
    // flares / prominences on the surface
    var arcs = [];
    for (var i = 0; i < 4; i++) {
      var holder = new T.Group();
      holder.rotation.set(R() * TAU, R() * TAU, R() * TAU);
      var arc = new T.Mesh(new T.TorusGeometry(1.6 + R() * 1.2, 0.28, 8, 28, Math.PI),
        new T.MeshBasicMaterial({ color: 0xff7a30, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false }));
      arc.position.y = 5.6;
      holder.add(arc);
      var fl = sprite("core", 0xffb070, 9, 0);
      fl.position.y = 6.6; holder.add(fl);
      star.userData.mesh.add(holder);
      arcs.push({ arc: arc, fl: fl, ph: R() * TAU, sp: 0.6 + R() * 0.8 });
    }
    ctx.ticks.push(function (t) {
      for (var k = 0; k < arcs.length; k++) {
        var a = arcs[k], s = Math.sin(t * a.sp + a.ph);
        a.arc.material.opacity = 0.35 + 0.45 * (0.5 + 0.5 * s);
        a.arc.scale.setScalar(0.85 + 0.25 * (0.5 + 0.5 * s));
        a.fl.material.opacity = Math.pow(Math.max(0, Math.sin(t * 0.45 * a.sp + a.ph * 3)), 30) * 1.0;
      }
      star.userData.halo.material.opacity = 0.85 + 0.1 * Math.sin(t * 1.7);
    });
    // Proxima b
    var tilt = new T.Group(); tilt.rotation.x = 0.18; tilt.rotation.z = 0.05; root.add(tilt);
    tilt.add(orbitLine(25, 0xffb090, 0.22));
    var piv = new T.Group(); tilt.add(piv);
    var pr = rng(77);
    var ptex = canvasTex(256, 128, function (c, w, h) {
      c.fillStyle = "#8a5a44"; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 70; i++) { c.globalAlpha = 0.3 + pr() * 0.3; c.fillStyle = pick(pr, ["#5e3a2c", "#b07a5a", "#9a6650", "#d0a080"]); c.beginPath(); c.arc(pr() * w, pr() * h, 3 + pr() * 14, 0, TAU); c.fill(); }
      for (i = 0; i < 40; i++) { var x = pr() * w, y = pr() * h, r = 1 + pr() * 4; c.globalAlpha = 0.6; c.fillStyle = "#4a2c20"; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = "#e0b090"; c.globalAlpha = 0.4; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.6, 0, TAU); c.fill(); }
      c.globalAlpha = 1;
    });
    var pmat = new T.ShaderMaterial({ uniforms: { map: { value: ptex }, uLight: { value: new T.Vector3() }, uLightCol: { value: C("#ffb48a") } }, vertexShader: PLANET_VS, fragmentShader: PLANET_FS });
    var planet = new T.Mesh(new T.SphereGeometry(1.7, 32, 20), pmat);
    planet.position.x = 25; piv.add(planet);
    var pglow = sprite("soft", 0xff9a70, 5, 0.25); planet.add(pglow);
    planet.onBeforeRender = function () { pmat.uniforms.uLight.value.setFromMatrixPosition(star.matrixWorld); };
    piv.rotation.y = 0.6;
    ctx.ticks.push(function (t, dt) { piv.rotation.y += dt * 0.12; planet.rotation.y += dt * 0.4; });
    // Alpha Centauri A & B far off
    var ac = new T.Group(); ac.position.set(-92, 38, -66); root.add(ac);
    var pair = new T.Group(); ac.add(pair);
    var A = makeStar(ctx, 4, ["#c08a20", "#ffe070", "#fff8d0"], 0xffe48a, { halo: 9, haloOp: 0.8 });
    var B = makeStar(ctx, 3.2, ["#b0601a", "#ffb050", "#ffe8b0"], 0xffb060, { halo: 9, haloOp: 0.75 });
    A.position.x = -6; B.position.x = 8; pair.add(A, B);
    pair.rotation.x = 0.4;
    ctx.ticks.push(function (t, dt) { pair.rotation.y += dt * 0.08; });
    addBeacon(ctx, 0xff5a2a, 0.95);
    return { view: 72, radius: 130 };
  };

  MAKERS.sirius = function (ctx) {
    var root = ctx.root;
    var star = makeStar(ctx, 14, ["#8ab4ff", "#e0ecff", "#ffffff"], 0xbcd6ff, { halo: 10, core: 3.4, scale: 2.4, speed: 0.2 });
    root.add(star);
    var sp = sprite("spikes", 0xd8e8ff, 300, 0.9); root.add(sp);
    var sp2 = sprite("spikes", 0x9fc4ff, 170, 0.5); sp2.material.rotation = 0.35; root.add(sp2);
    var tilt = new T.Group(); tilt.rotation.x = 0.35; tilt.rotation.z = -0.2; root.add(tilt);
    tilt.add(orbitLine(40, 0xbcd6ff, 0.18));
    var piv = new T.Group(); tilt.add(piv);
    var B = makeStar(ctx, 1.3, ["#c8d8ff", "#ffffff", "#ffffff"], 0xe8f0ff, { halo: 12, core: 4 });
    B.position.x = 40; piv.add(B);
    var bs = sprite("spikes", 0xffffff, 18, 0.6); B.add(bs);
    piv.rotation.y = 2.2;
    ctx.ticks.push(function (t, dt) {
      piv.rotation.y += dt * 0.15;
      sp.material.opacity = 0.8 + 0.1 * Math.sin(t * 2.3) + 0.05 * Math.sin(t * 5.1);
      sp2.material.rotation = 0.35 + 0.03 * Math.sin(t * 0.7);
    });
    addBeacon(ctx, 0xc8dcff, 1);
    return { view: 120, radius: 60 };
  };

  MAKERS.vega = function (ctx) {
    var root = ctx.root, R = rng(303);
    var tilt = new T.Group(); tilt.rotation.x = 0.32; tilt.rotation.z = 0.12; root.add(tilt);
    var star = makeStar(ctx, 16, ["#7ea8ff", "#dde8ff", "#ffffff"], 0xaecbff, { halo: 8, core: 3.1, spin: 0.3 });
    star.userData.mesh.scale.y = 0.82;
    tilt.add(star);
    var sp = sprite("spikes", 0xcfe0ff, 200, 0.45); root.add(sp);
    var disk = new PB(R), glow = new PB(R);
    var cols = [C("#c9a27a"), C("#e8c8a0"), C("#b08870"), C("#f0dcc0")];
    for (var i = 0; i < 7000; i++) {
      var r = 40 + 75 * Math.pow(R(), 0.8), a = R() * TAU;
      var b = (0.35 + R() * 0.5) * (1 - 0.6 * (r - 40) / 75);
      disk.add(Math.cos(a) * r, gauss(R) * 1.6 * (r / 60), Math.sin(a) * r, pick(R, cols), b, 1.4 + R() * 1.6);
    }
    for (i = 0; i < 900; i++) {
      r = 38 + 80 * R(); a = R() * TAU;
      glow.add(Math.cos(a) * r, gauss(R) * 2, Math.sin(a) * r, C("#d8b090"), 0.6 * (1 - (r - 38) / 80) + 0.15, 10 + R() * 10);
    }
    var dp = new T.Group(); tilt.add(dp);
    dp.add(disk.build(ctx, { opacity: 0.9, fall: 4, twinkle: 0.15 }), glow.build(ctx, { opacity: 0.16, fall: 3 }));
    ctx.ticks.push(function (t, dt) { dp.rotation.y += dt * 0.04; });
    addBeacon(ctx, 0xb8d0ff, 1);
    return { view: 270, radius: 120 };
  };

  MAKERS.polaris = function (ctx) {
    var root = ctx.root;
    var star = makeStar(ctx, 22, ["#e8b050", "#ffeaa8", "#fffbe8"], 0xfff0b0, { halo: 8, core: 3, scale: 2.8 });
    root.add(star);
    var sp = sprite("spikes", 0xfff4c8, 260, 0.45); root.add(sp);
    var tilt = new T.Group(); tilt.rotation.x = 0.3; root.add(tilt);
    tilt.add(orbitLine(48, 0xfff0b0, 0.15));
    var piv = new T.Group(); tilt.add(piv);
    var Ab = makeStar(ctx, 2.6, ["#d8c080", "#fff4d0", "#ffffff"], 0xfff6d8, { halo: 9 });
    Ab.position.x = 48; piv.add(Ab);
    var Bst = makeStar(ctx, 3.6, ["#b0c8ff", "#f0f4ff", "#ffffff"], 0xe6eeff, { halo: 9 });
    Bst.position.set(105, 26, -70); root.add(Bst);
    ctx.ticks.push(function (t, dt) {
      piv.rotation.y += dt * 0.1;
      var s = 1 + 0.02 * Math.sin(t * TAU / 4); // Cepheid pulse
      star.scale.setScalar(s);
    });
    addBeacon(ctx, 0xfff0b0, 1);
    return { view: 165, radius: 130 };
  };

  MAKERS.betelgeuse = function (ctx) {
    var root = ctx.root, R = rng(404);
    var body = new T.Group(); root.add(body);
    var star = makeStar(ctx, 60, ["#3c0500", "#c62c08", "#ff8a30"], 0xff5a20, { halo: 6.5, core: 2.6, scale: 1.8, speed: 0.1, bump: 3.2, bumpScale: 1.4, spin: 0.02, seg: 96 });
    body.add(star);
    var halo2 = sprite("soft", 0xff3010, 820, 0.4); root.add(halo2);
    // puffy dusty outer envelope (lopsided plume)
    var puff = new PB(R), cols = [C("#ff6a2a"), C("#e04818"), C("#b03010"), C("#ff9a50"), C("#a05030")];
    for (var i = 0; i < 1100; i++) {
      var d = new T.Vector3(gauss(R), gauss(R), gauss(R)).normalize();
      var plume = Math.max(0, d.dot(new T.Vector3(0.6, 0.7, 0.2).normalize()));
      var r = 64 + Math.pow(R(), 1.8) * (70 + 80 * plume * plume);
      var b = (0.35 + R() * 0.65) * (1 - (r - 64) / 170);
      puff.add(d.x * r, d.y * r, d.z * r, pick(R, cols), b, 18 + R() * 22);
    }
    var envelope = puff.build(ctx, { opacity: 0.11, fall: 3 });
    root.add(envelope);
    // dust sparkles
    var dust = new PB(R);
    for (i = 0; i < 1500; i++) {
      d = new T.Vector3(gauss(R), gauss(R), gauss(R)).normalize(); r = 70 + Math.pow(R(), 1.5) * 130;
      dust.add(d.x * r, d.y * r, d.z * r, pick(R, [C("#ffb070"), C("#ff8050"), C("#ffd0a0")]), 0.4 + R() * 0.6, 1.2 + R() * 1.6);
    }
    root.add(dust.build(ctx, { opacity: 0.8, twinkle: 0.5, fall: 5 }));
    ctx.ticks.push(function (t, dt) {
      var s = 1 + 0.04 * Math.sin(t * 0.55) + 0.01 * Math.sin(t * 1.9);
      body.scale.setScalar(s);
      envelope.rotation.y += dt * 0.015;
      halo2.material.opacity = 0.35 + 0.08 * Math.sin(t * 0.55);
    });
    addBeacon(ctx, 0xff5020, 1);
    return { view: 330, radius: 170 };
  };

  MAKERS.pleiades = function (ctx) {
    var face = ctx.face, R = rng(505);
    // RA/Dec offsets (deg) relative to Alcyone, east to the left
    var S = [["Alcyone", 0, 0, 1.25], ["Atlas", -0.383, -0.052, 1.05], ["Pleione", -0.389, 0.032, 0.7], ["Electra", 0.595, 0.008, 1.0],
      ["Maia", 0.378, 0.263, 0.95], ["Merope", 0.264, -0.157, 0.9], ["Taygeta", 0.519, 0.362, 0.85]];
    var sc = 125, cx = 0.07, cy = 0.11;
    var pos = S.map(function (s) { return new T.Vector3((s[1] - cx) * sc, (s[2] - cy) * sc, gauss(R) * 10); });
    // reflection nebula haze
    var haze = new PB(R), hc = [C("#3a6cff"), C("#5a8cff"), C("#7aa8ff"), C("#2f55d8"), C("#9fc0ff")];
    for (var i = 0; i < 2600; i++) {
      var p = pos[Math.floor(R() * pos.length)], sd = 16 + R() * 14;
      var x = p.x + gauss(R) * sd, y = p.y + gauss(R) * sd, z = p.z + gauss(R) * sd * 0.6;
      var n = fbm(x * 0.02 + 5, y * 0.02, z * 0.02, 3);
      if (R() > n * n * 2.2) continue;
      haze.add(x, y, z, pick(R, hc), 0.5 + R() * 0.5, 14 + R() * 20);
    }
    // striations (wispy streaks)
    for (i = 0; i < 1400; i++) {
      var p0 = pos[Math.floor(R() * pos.length)], t = gauss(R) * 45, off = (Math.floor(R() * 7) - 3) * 7 + gauss(R) * 1.5;
      x = p0.x + t * 0.8 - off * 0.6; y = p0.y - t * 0.6 - off * 0.8;
      haze.add(x, y, p0.z + gauss(R) * 4, pick(R, hc), (0.4 + R() * 0.5) * Math.exp(-t * t / 2000), 6 + R() * 6);
    }
    face.add(haze.build(ctx, { opacity: 0.09, fall: 3 }));
    // faint member stars
    var fs = new PB(R);
    for (i = 0; i < 46; i++) {
      var rr = 20 + Math.pow(R(), 0.8) * 100, a = R() * TAU;
      fs.add(Math.cos(a) * rr, Math.sin(a) * rr * 0.85, gauss(R) * 20, mixC(C("#cfe0ff"), C("#ffffff"), R()), 0.6 + R() * 0.4, 2.2 + R() * 2.5);
    }
    for (i = 0; i < 300; i++) {
      rr = Math.pow(R(), 0.5) * 140; a = R() * TAU;
      fs.add(Math.cos(a) * rr, Math.sin(a) * rr, gauss(R) * 30, mixC(C("#aac4ff"), C("#ffffff"), R()), 0.25 + R() * 0.3, 1.2 + R() * 1.2);
    }
    face.add(fs.build(ctx, { fall: 6, core: 0.8, twinkle: 0.35 }));
    // the seven sisters
    var sis = [];
    S.forEach(function (s, k) {
      var st = makeStar(ctx, 2.2 * s[3], ["#88aaff", "#e0eaff", "#ffffff"], 0x9ec5ff, { halo: 16, core: 4.5 });
      st.position.copy(pos[k]); face.add(st);
      var spk = sprite("spikes", 0xcfe0ff, 60 * s[3], 0.65); st.add(spk);
      sis.push({ s: spk, ph: R() * TAU });
    });
    var big = sprite("soft", 0x4f7fff, 330, 0.3); face.add(big);
    ctx.ticks.push(function (t) {
      for (var k = 0; k < sis.length; k++) sis[k].s.material.opacity = 0.55 + 0.15 * Math.sin(t * 2.1 + sis[k].ph);
    });
    addBeacon(ctx, 0x7fa8ff, 1);
    return { view: 265, radius: 125 };
  };

  MAKERS.orion = function (ctx) {
    var face = ctx.face, R = rng(606);
    var blobs = [[5, 0, 42, 1.7], [-45, 18, 30, 1.0], [-85, 42, 32, 0.8], [-122, 38, 30, 0.6], [-60, -22, 35, 0.6], [40, -35, 35, 0.9],
      [80, -70, 35, 0.8], [112, -102, 28, 0.6], [20, -92, 45, 0.6], [-25, -112, 40, 0.5], [60, 28, 30, 0.5], [92, 10, 35, 0.45],
      [-10, 92, 18, 0.8], [-140, -10, 30, 0.35], [130, -40, 30, 0.35]];
    function dens(x, y) {
      var d = 0;
      for (var i = 0; i < blobs.length; i++) { var b = blobs[i], dx = x - b[0], dy = y - b[1]; d += b[3] * Math.exp(-(dx * dx + dy * dy) / (2 * b[2] * b[2])); }
      return d;
    }
    var gas = new PB(R), fine = new PB(R);
    var teal = C("#7ff0e8"), cyan = C("#a8fff4"), lav = C("#c08cff"), pink = C("#ff5aa8"), mag = C("#ff3a8c"), red = C("#ff4a5a"), white = C("#fff4f8");
    var tries = 0;
    while (gas.count() < 3800 && tries++ < 200000) {
      var x = (R() * 2 - 1) * 170, y = (R() * 2 - 1) * 170;
      var d = dens(x, y), n = fbm(x * 0.018, y * 0.018, 1.3, 7);
      if (R() > Math.min(1, d) * (0.15 + 1.4 * n * n)) continue;
      var rc = Math.sqrt((x - 5) * (x - 5) + y * y);
      var c = mixC(teal, lav, sstep(32, 75, rc)); c = mixC(c, pink, sstep(60, 115, rc));
      if (n > 0.62) c = mixC(c, mag, 0.6); if (R() < 0.12) c = mixC(c, red, 0.7);
      if (rc < 30) c = mixC(c, white, 0.45);
      gas.add(x, y, gauss(R) * 18 * (0.6 + rc / 120), c, 0.55 + R() * 0.45, 16 + R() * 22);
    }
    tries = 0;
    while (fine.count() < 6000 && tries++ < 300000) {
      x = (R() * 2 - 1) * 170; y = (R() * 2 - 1) * 170;
      d = dens(x, y); n = fbm(x * 0.03, y * 0.03, 4.1, 9);
      var ridge = 1 - Math.abs(n - 0.5) * 2; ridge = Math.pow(ridge, 6);
      if (R() > Math.min(1, d) * ridge * 1.6) continue;
      rc = Math.sqrt((x - 5) * (x - 5) + y * y);
      c = mixC(cyan, lav, sstep(32, 75, rc)); c = mixC(c, pink, sstep(60, 115, rc));
      fine.add(x, y, gauss(R) * 14, c, 0.5 + R() * 0.5, 4 + R() * 5);
    }
    face.add(gas.build(ctx, { opacity: 0.085, fall: 3 }));
    face.add(fine.build(ctx, { opacity: 0.2, fall: 3 }));
    // dark dust lanes
    var dust = new PB(R), dc = [C("#120610"), C("#1a0a12"), C("#0e0508")];
    var paths = [[[-160, 75], [-110, 60], [-70, 52], [-38, 58], [-22, 76], [8, 70], [26, 84]], [[-165, -40], [-120, -55], [-85, -72], [-60, -95]], [[150, 20], [125, 45], [95, 60]]];
    paths.forEach(function (pth, pi) {
      for (var i = 0; i < (pi === 0 ? 900 : 350); i++) {
        var seg = Math.floor(R() * (pth.length - 1)), u = R();
        var px = lerp(pth[seg][0], pth[seg + 1][0], u), py = lerp(pth[seg][1], pth[seg + 1][1], u);
        dust.add(px + gauss(R) * 9, py + gauss(R) * 9, gauss(R) * 12 + 10, pick(R, dc), 1, 14 + R() * 16);
      }
    });
    face.add(dust.build(ctx, { normal: true, opacity: 0.5, fall: 2.5, renderOrder: 1 }));
    // young stars
    var ys = new PB(R);
    for (var i = 0; i < 650; i++) {
      var rr = Math.abs(gauss(R)) * 55, a = R() * TAU;
      ys.add(Math.cos(a) * rr + 5, Math.sin(a) * rr, gauss(R) * 20, mixC(C("#bcd4ff"), C("#ffffff"), R()), 0.5 + R() * 0.5, 1.4 + R() * 2.2);
    }
    face.add(ys.build(ctx, { fall: 6, core: 0.8, twinkle: 0.5, renderOrder: 2 }));
    // Trapezium
    var tz = [[-4, 3.5], [5, 6], [6.5, -2.5], [-2.5, -5]];
    tz.forEach(function (p, k) {
      var st = makeStar(ctx, 0.9, ["#a8c4ff", "#ffffff", "#ffffff"], 0xd0e4ff, { halo: 30, core: 9 });
      st.position.set(p[0] * 1.6 + 5, p[1] * 1.6, 2); st.renderOrder = 2; face.add(st);
      var spk = sprite("spikes", 0xe6f0ff, 26, 0.7); spk.renderOrder = 2; st.add(spk);
    });
    face.add(sprite("soft", 0xff4f9a, 460, 0.25));
    var cg = sprite("soft", 0x80ffe8, 170, 0.45); cg.position.x = 5; face.add(cg);
    addBeacon(ctx, 0xff6ab0, 1);
    return { view: 390, radius: 170 };
  };

  MAKERS.ring = function (ctx) {
    var face = ctx.face, R = rng(707);
    var spinG = new T.Group(); face.add(spinG);
    var gas = new PB(R), knots = new PB(R), fill = new PB(R);
    var cTeal = C("#3fd8ff"), cGreen = C("#5effc0"), cYel = C("#e0ff70"), cOr = C("#ff9a40"), cRed = C("#ff3a28");
    function colAt(r) {
      if (r < 38) return mixC(cTeal, cGreen, sstep(26, 38, r));
      if (r < 50) return mixC(cGreen, cYel, sstep(40, 52, r));
      if (r < 60) return mixC(cYel, cOr, sstep(50, 60, r));
      return mixC(cOr, cRed, sstep(58, 68, r));
    }
    for (var i = 0; i < 6500; i++) {
      var a = R() * TAU, r = 48 + gauss(R) * 9;
      r *= 1 + 0.12 * (fbm(Math.cos(a) * 2, Math.sin(a) * 2, 0, 11) - 0.5);
      var n = fbm(Math.cos(a) * 4, Math.sin(a) * 4, r * 0.05, 12);
      gas.add(Math.cos(a) * r, Math.sin(a) * r * 0.78, gauss(R) * 14 * (1 - Math.abs(r - 48) / 40), colAt(r), (0.45 + 0.55 * R()) * (0.6 + n * 0.8), 7 + R() * 10);
    }
    var kc = [];
    for (i = 0; i < 160; i++) kc.push([R() * TAU, 60 + R() * 10]);
    for (i = 0; i < 2200; i++) {
      var k = kc[Math.floor(R() * kc.length)], aa = k[0] + gauss(R) * 0.03, rr = k[1] + gauss(R) * 2;
      knots.add(Math.cos(aa) * rr, Math.sin(aa) * rr * 0.78, gauss(R) * 6, mixC(cOr, cRed, R()), 0.6 + R() * 0.4, 2 + R() * 2.5);
    }
    for (i = 0; i < 1800; i++) {
      a = R() * TAU; r = Math.sqrt(R()) * 40;
      fill.add(Math.cos(a) * r, Math.sin(a) * r * 0.78, gauss(R) * 10, mixC(C("#2f7cff"), cTeal, R()), 0.5 + R() * 0.5, 12 + R() * 14);
    }
    for (i = 0; i < 900; i++) {
      a = R() * TAU; r = 70 + Math.pow(R(), 1.3) * 32 * (1 + 0.5 * Math.cos(a * 2 + 1));
      fill.add(Math.cos(a) * r, Math.sin(a) * r * 0.82, gauss(R) * 12, mixC(cRed, C("#ff6050"), R()), 0.3 + R() * 0.4, 12 + R() * 14);
    }
    spinG.add(fill.build(ctx, { opacity: 0.05, fall: 3 }));
    spinG.add(gas.build(ctx, { opacity: 0.075, fall: 3 }));
    spinG.add(knots.build(ctx, { opacity: 0.45, fall: 4, twinkle: 0.15 }));
    var wd = makeStar(ctx, 0.9, ["#c8d8ff", "#ffffff", "#ffffff"], 0xdfe8ff, { halo: 22, core: 8 });
    face.add(wd);
    var spk = sprite("spikes", 0xffffff, 20, 0.6); wd.add(spk);
    face.add(sprite("soft", 0x50e0c0, 200, 0.12));
    ctx.ticks.push(function (t, dt) { spinG.rotation.z += dt * 0.02; wd.userData.halo.material.opacity = 0.75 + 0.15 * Math.sin(t * 1.3); });
    addBeacon(ctx, 0x60e8c8, 1);
    return { view: 230, radius: 90 };
  };

  MAKERS.crab = function (ctx) {
    var face = ctx.face, R = rng(808);
    var ax = 110, ay = 76, az = 70;
    var core = new PB(R), fil = new PB(R);
    var bc = [C("#7fa8ff"), C("#a8c8ff"), C("#d0e2ff"), C("#6f8fff")];
    for (var i = 0; i < 3200; i++) {
      var x = gauss(R) * 36, y = gauss(R) * 26, z = gauss(R) * 26;
      var d = Math.sqrt(x * x / (ax * ax) + y * y / (ay * ay) + z * z / (az * az));
      if (d > 0.95) continue;
      core.add(x, y, z, pick(R, bc), (0.5 + R() * 0.5) * (1 - d), 12 + R() * 18);
    }
    var fc = [C("#ff5a2a"), C("#ff7038"), C("#ff9a50"), C("#ff4630"), C("#ffc070"), C("#ff8a40")];
    var v = new T.Vector3(), dir = new T.Vector3();
    for (var f = 0; f < 150; f++) {
      var col = R() < 0.04 ? C("#c8e080") : pick(R, fc);
      var bri = 0.6 + R() * 0.4;
      dir.set(gauss(R), gauss(R), gauss(R)).normalize();
      var s0 = 0.45 + R() * 0.5;
      v.set(dir.x * ax * s0, dir.y * ay * s0, dir.z * az * s0);
      var heading = new T.Vector3(gauss(R), gauss(R), gauss(R)).normalize();
      var steps = 45 + Math.floor(R() * 45);
      for (var k = 0; k < steps; k++) {
        heading.x += gauss(R) * 0.25; heading.y += gauss(R) * 0.25; heading.z += gauss(R) * 0.25; heading.normalize();
        v.addScaledVector(heading, 1.7);
        var e = Math.sqrt(v.x * v.x / (ax * ax) + v.y * v.y / (ay * ay) + v.z * v.z / (az * az));
        if (e > 1.0) { heading.set(-v.x / ax, -v.y / ay, -v.z / az).normalize(); }
        if (e < 0.35) { heading.set(v.x / ax, v.y / ay, v.z / az).normalize(); }
        fil.add(v.x + gauss(R) * 0.5, v.y + gauss(R) * 0.5, v.z + gauss(R) * 0.5, col, bri * (0.6 + 0.4 * R()) * (0.5 + e * 0.6), 2.4 + R() * 2.2);
      }
    }
    face.add(core.build(ctx, { opacity: 0.032, fall: 3 }));
    face.add(fil.build(ctx, { opacity: 0.6, fall: 4 }));
    // inner ring/wisps around the pulsar
    var wisp = new PB(R);
    for (i = 0; i < 500; i++) { var a = R() * TAU, r = 14 + gauss(R) * 1.2; wisp.add(Math.cos(a) * r, Math.sin(a) * r * 0.45, gauss(R), C("#cfe0ff"), 0.6 + R() * 0.4, 1.8 + R() * 1.5); }
    var wp = wisp.build(ctx, { opacity: 0.6, fall: 4 }); wp.rotation.z = 0.5; face.add(wp);
    face.add(sprite("soft", 0x7f9fff, 200, 0.3));
    face.add(sprite("soft", 0xff6030, 320, 0.2));
    // pulsar
    var pul = new T.Mesh(new T.SphereGeometry(1.2, 16, 12), new T.MeshBasicMaterial({ color: 0xffffff }));
    face.add(pul);
    var flash = sprite("core", 0xe0ecff, 34, 1), fspk = sprite("spikes", 0xe8f0ff, 70, 1);
    flash.renderOrder = 3; fspk.renderOrder = 3;
    face.add(flash, fspk);
    ctx.ticks.push(function (t) {
      var ph = 0.5 + 0.5 * Math.cos(t * TAU * 3);
      var f1 = Math.pow(ph, 14);
      flash.material.opacity = 0.25 + 0.75 * f1;
      fspk.material.opacity = 0.1 + 0.9 * f1;
      var s = 26 + 20 * f1; flash.scale.set(s, s, 1);
    });
    addBeacon(ctx, 0xffa070, 1);
    return { view: 300, radius: 115 };
  };

  MAKERS.eagle = function (ctx) {
    var face = ctx.face, R = rng(909);
    var bg = new PB(R);
    var cTop = [C("#3f8cff"), C("#4fc0e0"), C("#5ad0c8")], cMid = [C("#a8d060"), C("#d8c050"), C("#80c070")], cLow = [C("#d8a040"), C("#c09040"), C("#90b050")];
    var tries = 0;
    while (bg.count() < 4200 && tries++ < 100000) {
      var x = (R() * 2 - 1) * 185, y = (R() * 2 - 1) * 170;
      var el = 1 - (x * x / (185 * 185) + y * y / (170 * 170));
      if (el <= 0) continue;
      var n = fbm(x * 0.015, y * 0.015, 2.2, 21);
      if (R() > (0.2 + 0.9 * n * n) * Math.pow(el, 0.6)) continue;
      var ty = (y + 160) / 320;
      var c = ty > 0.62 ? mixC(pick(R, cMid), pick(R, cTop), sstep(0.62, 0.85, ty)) : ty > 0.3 ? pick(R, cMid) : mixC(pick(R, cLow), pick(R, cMid), sstep(0.1, 0.3, ty));
      var edge = Math.min(1, el * 2.5);
      bg.add(x, y, -45 + gauss(R) * 18, c, (0.4 + R() * 0.6) * (0.5 + 0.6 * ty) * edge, 16 + R() * 22);
    }
    face.add(bg.build(ctx, { opacity: 0.11, fall: 3 }));
    // pillars
    var dust = new PB(R), glow = new PB(R);
    var dcols = [C("#3a2216"), C("#4a2a18"), C("#2a180e"), C("#55301c")];
    var gcols = [C("#ffb050"), C("#ff8a40"), C("#ffc870"), C("#ff9a60"), C("#e8d070")];
    var P = [
      { x0: -78, y0: -165, x1: -52, y1: 72, rb: 32, rt: 17, head: 3.2, n: 2600, ng: 1500 },
      { x0: 12, y0: -165, x1: 24, y1: -8, rb: 24, rt: 13, head: 3.0, n: 1700, ng: 900 },
      { x0: 92, y0: -165, x1: 98, y1: -62, rb: 17, rt: 10, head: 2.6, n: 1000, ng: 550 }];
    P.forEach(function (p, pi) {
      function radAt(t) { var r = lerp(p.rb, p.rt, t) * (0.8 + 0.45 * vnoise(t * 7, pi * 3.1, 0, 30)); if (t > 0.82) r *= 1 + (t - 0.82) * p.head; return r; }
      function cxAt(t) { return lerp(p.x0, p.x1, t) + Math.sin(t * 5 + pi * 2) * 4; }
      for (var i = 0; i < p.n; i++) {
        var t = Math.pow(R(), 0.85), y = lerp(p.y0, p.y1, t), a = R() * TAU, r = radAt(t) * (0.75 + 0.5 * vnoise(Math.cos(a) * 1.5 + 5, t * 14, Math.sin(a) * 1.5 + pi * 7, 31)), rad = r * Math.sqrt(R());
        var fade = sstep(0, 0.12, t);
        var lit = clamp((rad / r) * (0.55 - 0.45 * Math.cos(a)) * (0.3 + 0.7 * t), 0, 1);
        dust.add(cxAt(t) + Math.cos(a) * rad, y, Math.sin(a) * rad * 0.8, mixC(pick(R, dcols), C("#8a5430"), lit * 0.7), 1, (7 + R() * 9) * (0.6 + 0.4 * fade));
      }
      // rounded cap
      var rtop = radAt(1);
      for (i = 0; i < p.n * 0.12; i++) {
        var u = R() * TAU, w = Math.acos(R()), rr = rtop * Math.cbrt(R());
        dust.add(cxAt(1) + Math.cos(u) * Math.sin(w) * rr, p.y1 + Math.cos(w) * rr * 0.8, Math.sin(u) * Math.sin(w) * rr * 0.8, pick(R, dcols), 1, 7 + R() * 8);
      }
      for (i = 0; i < p.ng; i++) {
        t = Math.pow(R(), 0.55); y = lerp(p.y0, p.y1, t); r = radAt(t);
        a = (R() < 0.5 ? 0 : Math.PI) + gauss(R) * 0.35;
        var bright = (0.25 + 0.75 * t * t) * (0.6 + 0.4 * R());
        glow.add(cxAt(t) + Math.cos(a) * r * (0.95 + Math.abs(gauss(R)) * 0.12), y, Math.abs(Math.sin(a)) * r * 0.8 + 2, pick(R, gcols), bright, 3.5 + R() * 5);
      }
      for (i = 0; i < p.ng * 0.3; i++) {
        u = (R() * 0.9 + 0.05) * Math.PI; rr = rtop * (0.95 + R() * 0.12);
        glow.add(cxAt(1) + Math.cos(u) * rr, p.y1 + Math.sin(u) * rr * 0.8, rtop * 0.4 + R() * 3, pick(R, gcols), 0.35 + R() * 0.35, 4 + R() * 5);
      }
    });
    face.add(dust.build(ctx, { normal: true, opacity: 0.55, fall: 2.2, renderOrder: 1 }));
    face.add(glow.build(ctx, { opacity: 0.32, fall: 3, renderOrder: 2, twinkle: 0.1 }));
    var st = new PB(R);
    for (var i = 0; i < 420; i++) st.add((R() * 2 - 1) * 175, (R() * 2 - 1) * 160, gauss(R) * 30, mixC(C("#cfe0ff"), C("#fff0d0"), R()), 0.3 + R() * 0.6, 1.2 + R() * 2);
    for (i = 0; i < 14; i++) st.add((R() * 2 - 1) * 150, 40 + R() * 110, 20 + R() * 20, C("#e8f0ff"), 1, 4 + R() * 3);
    face.add(st.build(ctx, { fall: 6, core: 0.8, twinkle: 0.45, renderOrder: 3 }));
    var g1 = sprite("soft", 0x6fc0b0, 440, 0.25); face.add(g1);
    var g2 = sprite("soft", 0xffc860, 260, 0.18); g2.position.y = -20; face.add(g2);
    addBeacon(ctx, 0x9fd890, 1);
    return { view: 440, radius: 170 };
  };

  MAKERS.galcenter = function (ctx) {
    var face = ctx.face, R = rng(1001);
    var roll = new T.Group(); roll.rotation.z = 0.18; face.add(roll);
    var tilt = new T.Group(); tilt.rotation.x = 0.1; roll.add(tilt);
    var hole = new T.Mesh(new T.SphereGeometry(8, 40, 28), new T.MeshBasicMaterial({ color: 0x000000 }));
    face.add(hole);
    // accretion disk (differential rotation + Doppler-bright side in shader)
    var disk = new PB(R);
    var c1 = C("#fff6d8"), c2 = C("#ffb040"), c3 = C("#e04a10"), c4 = C("#a02808");
    for (var i = 0; i < 9000; i++) {
      var r = 10.5 + 30 * Math.pow(R(), 1.5), a = R() * TAU;
      var f = (r - 10.5) / 30;
      var c = f < 0.25 ? mixC(c1, c2, f / 0.25) : f < 0.6 ? mixC(c2, c3, (f - 0.25) / 0.35) : mixC(c3, c4, (f - 0.6) / 0.4);
      var clump = 0.6 + 0.8 * vnoise(a * 4, r * 0.25, 0, 40);
      disk.add(Math.cos(a) * r, gauss(R) * 0.35 * (0.5 + f), Math.sin(a) * r, c, (0.6 + R() * 0.4) * clump * (1.3 - f), 1.4 + R() * 1.8);
    }
    tilt.add(disk.build(ctx, { opacity: 0.75, fall: 4, spin: 1.0, r0: 12, beam: 0.7 }));
    var dg = glowPlane(0xff8a30, 75, 0.35); tilt.add(dg);
    // lensed far side of the disk (bent over the hole)
    var lens = new PB(R);
    for (i = 0; i < 2200; i++) {
      r = 9.6 + Math.pow(R(), 2) * 5; a = R() * TAU; f = (r - 9.6) / 5;
      lens.add(Math.cos(a) * r, gauss(R) * 0.2, Math.sin(a) * r, mixC(c1, c2, f), (0.7 + 0.3 * R()) * (1 - f * 0.6), 1.2 + R() * 1.2);
    }
    var lensPts = lens.build(ctx, { opacity: 0.6, fall: 4, spin: 1.6, r0: 10, beam: 0.6 });
    lensPts.rotation.x = Math.PI / 2; roll.add(lensPts);
    var pr = sprite("ring", 0xffc070, 34, 0.9); face.add(pr);
    var halo = sprite("soft", 0x9fb8ff, 110, 0.18); face.add(halo);
    var og = sprite("soft", 0xff9040, 170, 0.45); face.add(og);
    // S-stars on Kepler orbits
    var sstars = [];
    var orbG = new T.Group(); face.add(orbG);
    for (i = 0; i < 14; i++) {
      var A = 18 + R() * 42, e = 0.3 + R() * 0.55, B = A * Math.sqrt(1 - e * e);
      var g = new T.Group(); g.rotation.set(R() * TAU, R() * TAU, R() * TAU); orbG.add(g);
      var ln = orbitLine(B, 0x9fc0ff, 0.12, A); ln.position.z = -A * e; ln.rotation.y = 0; // ellipse centred, focus at origin
      // orbitLine draws x = B cos, z = A sin -> align so major axis along z
      g.add(ln);
      var col = pick(R, [0xcfe0ff, 0xffffff, 0xaecbff, 0xfff0d0]);
      var sp = sprite("core", col, 5 + R() * 5, 1); g.add(sp);
      sstars.push({ sp: sp, a: A, b: B, e: e, P: 14 * Math.pow(A / 25, 1.5), M0: R() * TAU });
    }
    var swarm = new PB(R);
    for (i = 0; i < 3200; i++) {
      var v = new T.Vector3(gauss(R), gauss(R), gauss(R)).multiplyScalar(30 + R() * 25);
      if (v.length() < 12) continue;
      swarm.add(v.x, v.y, v.z, mixC(C("#ffe0b0"), C("#ffffff"), R()), 0.3 + R() * 0.6, 0.8 + R() * 1.4);
    }
    var sw = swarm.build(ctx, { fall: 6, core: 0.8, twinkle: 0.4 }); face.add(sw);
    ctx.ticks.push(function (t, dt) {
      for (var k = 0; k < sstars.length; k++) {
        var s = sstars[k], M = s.M0 + TAU * t / s.P, E = M;
        for (var it = 0; it < 4; it++) E = E - (E - s.e * Math.sin(E) - M) / (1 - s.e * Math.cos(E));
        s.sp.position.set(s.b * Math.sin(E), 0, s.a * (Math.cos(E) - s.e));
      }
      sw.rotation.y += dt * 0.02;
      pr.material.opacity = 0.8 + 0.1 * Math.sin(t * 2.0);
    });
    addBeacon(ctx, 0xffa040, 1);
    return { view: 150, radius: 75 };
  };

  // ---------- galaxy builder ----------
  function galaxy(ctx, o) {
    var R = rng(o.seed), Rr = o.R, disk = new T.Group();
    var stars = new PB(R), haze = new PB(R), dust = new PB(R);
    var wsum = 0; o.arms.forEach(function (a) { wsum += a.n; });
    function pickArm() { var x = R() * wsum; for (var i = 0; i < o.arms.length; i++) { x -= o.arms[i].n; if (x <= 0) return o.arms[i]; } return o.arms[0]; }
    function armPoint(arm, off, wmul) {
      var r;
      for (var g = 0; g < 50; g++) { r = arm.r0 + (arm.r1 - arm.r0) * R(); if (R() < Math.exp(-(r - arm.r0) / (Rr * o.fall))) break; }
      var th = arm.ph + Math.log(r / arm.r0) / o.k + (off || 0);
      var w = arm.w * (0.5 + r / Rr) * (wmul || 1);
      var rr = r + gauss(R) * w; th += gauss(R) * o.thJit;
      return [rr * Math.cos(th), gauss(R) * o.h * (1 - 0.6 * r / Rr), rr * Math.sin(th), r];
    }
    var armC = o.armCols.map(C), bulC = o.bulgeCols.map(C), hazeC = C(o.hazeCol), pinkC = [C("#ff5fa8"), C("#ff80c0"), C("#ff4f8f")], dustC = C(o.dustCol || "#1a100a");
    var i, p;
    for (i = 0; i < o.nArm; i++) {
      p = armPoint(pickArm());
      var big = R() < 0.03;
      stars.add(p[0], p[1], p[2], pick(R, armC), (0.5 + R() * 0.5) * (big ? 1.4 : 1), o.starSize * (0.6 + R() * 0.8) * (big ? 2.2 : 1));
    }
    for (i = 0; i < o.nBulge; i++) {
      var x, z, y;
      if (o.barLen > 0 && R() < 0.65) {
        var bx = gauss(R) * o.barLen * 0.42, bz = gauss(R) * o.barLen * 0.13;
        x = bx * Math.cos(o.barAng) - bz * Math.sin(o.barAng); z = bx * Math.sin(o.barAng) + bz * Math.cos(o.barAng); y = gauss(R) * o.bulgeR * 0.35;
      } else { x = gauss(R) * o.bulgeR; z = gauss(R) * o.bulgeR; y = gauss(R) * o.bulgeR * 0.6; }
      var rb = Math.sqrt(x * x + z * z);
      stars.add(x, y, z, pick(R, bulC), (0.55 + R() * 0.45) * (1.1 - Math.min(0.6, rb / (o.bulgeR * 4))), o.starSize * (0.7 + R() * 0.8));
    }
    for (i = 0; i < o.nDisk; i++) {
      var r = Math.min(Rr * 1.05, -Math.log(R() + 1e-6) * Rr * 0.32), a = R() * TAU;
      stars.add(Math.cos(a) * r, gauss(R) * o.h, Math.sin(a) * r, mixC(C("#fff0d8"), C("#d8e4ff"), R()), 0.25 + R() * 0.35, o.starSize * (0.6 + R() * 0.6));
    }
    for (i = 0; i < o.nHaze; i++) {
      p = armPoint(pickArm(), 0, 1.3);
      haze.add(p[0], p[1], p[2], hazeC, 0.5 + R() * 0.5, o.hazeSize * (0.7 + R() * 0.6));
    }
    for (i = 0; i < o.nPink; i++) {
      p = armPoint(pickArm(), o.pinkOff || 0.05, 0.7);
      for (var k = 0; k < 7; k++) stars.add(p[0] + gauss(R) * 3, p[1] + gauss(R) * 1.5, p[2] + gauss(R) * 3, pick(R, pinkC), 0.6 + R() * 0.4, o.starSize * (1 + R() * 1.2));
      haze.add(p[0], p[1], p[2], pinkC[0], 0.9, o.hazeSize * 0.6);
    }
    for (i = 0; i < o.nDust; i++) {
      p = armPoint(pickArm(), o.dustOff, 0.6);
      if (p[3] < (o.dustMinR || 0)) continue;
      dust.add(p[0], p[1] + 1, p[2], dustC, 1, o.dustSize * (0.7 + R() * 0.6));
    }
    disk.add(stars.build(ctx, { fall: 6, core: 0.5, twinkle: 0.12, size: 1 }));
    disk.add(haze.build(ctx, { opacity: o.hazeOp, fall: 3 }));
    if (o.nDust) disk.add(dust.build(ctx, { normal: true, opacity: o.dustOp, fall: 2.5, renderOrder: 1 }));
    disk.add(glowPlane(o.diskGlow, Rr * 2.3, o.diskGlowOp || 0.35));
    disk.add(glowPlane(o.bulgeGlow, o.bulgeR * 7, 0.7, o.barLen > 0 ? 1.5 : 1, 1));
    if (o.barLen > 0) disk.children[disk.children.length - 1].rotation.z = -o.barAng;
    disk.userData.armPoint = armPoint;
    return disk;
  }

  MAKERS.milkyway = function (ctx) {
    var face = ctx.face;
    var tilt = new T.Group(); tilt.rotation.x = 1.12; face.add(tilt);
    var ba = 0.45, k = Math.tan(13 * Math.PI / 180);
    var arms = [
      { ph: ba, r0: 110, r1: 430, w: 20, n: 1 },
      { ph: ba + Math.PI, r0: 110, r1: 430, w: 20, n: 1 },
      { ph: ba + Math.PI / 2, r0: 140, r1: 400, w: 15, n: 0.55 },
      { ph: ba + Math.PI * 1.5, r0: 140, r1: 400, w: 15, n: 0.55 }];
    var disk = galaxy(ctx, {
      seed: 1111, R: 420, k: k, barLen: 110, barAng: ba, bulgeR: 34, fall: 0.55, thJit: 0.05, h: 4,
      arms: arms, nArm: 11500, nBulge: 4000, nDisk: 3400, nHaze: 2200, nPink: 75, nDust: 2300,
      armCols: ["#a8c8ff", "#d8e6ff", "#ffffff", "#bcd0ff", "#fff4e0"], bulgeCols: ["#ffd890", "#ffe8b0", "#ffc070", "#fff0d0"],
      hazeCol: "#5f80ff", hazeSize: 30, hazeOp: 0.11, starSize: 2.8, pinkOff: 0.06, dustOff: -0.13, dustSize: 13, dustOp: 0.3, dustMinR: 70,
      diskGlow: 0x7f9cff, bulgeGlow: 0xffd080
    });
    tilt.add(disk);
    tilt.add(sprite("core", 0xfff0c0, 150, 0.85));
    // "You are here" on the minor (Orion) arm about 60% out
    var arm = arms[2], rs = 252, th = arm.ph + Math.log(rs / arm.r0) / k + 0.08;
    var here = new T.Vector3(Math.cos(th) * rs, 0, Math.sin(th) * rs);
    var dot = sprite("core", 0xffd040, 30, 1); dot.position.copy(here); dot.renderOrder = 10; dot.material.depthTest = false; disk.add(dot);
    var ltex = canvasTex(512, 320, function (c, w, h) {
      c.lineJoin = "round"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = "bold 76px 'Trebuchet MS', 'Arial Rounded MT Bold', 'Helvetica Neue', sans-serif";
      c.lineWidth = 14; c.strokeStyle = "rgba(40,20,0,0.9)"; c.strokeText("You are here", w / 2, 70);
      c.fillStyle = "#ffd23a"; c.fillText("You are here", w / 2, 70);
      c.beginPath(); c.moveTo(w / 2 - 50, 140); c.lineTo(w / 2 + 50, 140); c.lineTo(w / 2 + 50, 200); c.lineTo(w / 2 + 85, 200); c.lineTo(w / 2, h - 6); c.lineTo(w / 2 - 85, 200); c.lineTo(w / 2 - 50, 200); c.closePath();
      c.lineWidth = 10; c.strokeStyle = "rgba(40,20,0,0.9)"; c.stroke(); c.fillStyle = "#ffc21a"; c.fill();
      c.lineWidth = 4; c.strokeStyle = "#fff6c0"; c.stroke();
    });
    var label = new T.Sprite(new T.SpriteMaterial({ map: ltex, transparent: true, depthTest: false, depthWrite: false }));
    label.center.set(0.5, 0); label.scale.set(190, 119, 1); label.position.copy(here); label.renderOrder = 11;
    disk.add(label);
    ctx.ticks.push(function (t, dt) {
      disk.rotation.y += dt * 0.006;
      var b = 0.5 + 0.5 * Math.sin(t * 3);
      dot.scale.setScalar(22 + 14 * b); dot.material.opacity = 0.7 + 0.3 * b;
      label.center.y = -0.04 * (0.5 + 0.5 * Math.sin(t * 3.2));
    });
    addBeacon(ctx, 0xffe8b0, 0.9);
    return { view: 800, radius: 430 };
  };

  MAKERS.andromeda = function (ctx) {
    var face = ctx.face, R = rng(1212);
    var roll = new T.Group(); roll.rotation.z = 0.55; face.add(roll);
    var tilt = new T.Group(); tilt.rotation.x = 0.06; roll.add(tilt);
    var k = 0.13;
    var disk = galaxy(ctx, {
      seed: 1313, R: 450, k: k, barLen: 0, barAng: 0, bulgeR: 48, fall: 0.6, thJit: 0.06, h: 5,
      arms: [{ ph: 0, r0: 70, r1: 470, w: 16, n: 1 }, { ph: Math.PI, r0: 70, r1: 470, w: 16, n: 1 }],
      nArm: 10000, nBulge: 5200, nDisk: 3000, nHaze: 1400, nPink: 50, nDust: 3000,
      armCols: ["#b8ccff", "#dce6ff", "#ffffff", "#c8d8ff", "#fff0dc"], bulgeCols: ["#ffe2a8", "#fff0d0", "#ffd090", "#fff8e8"],
      hazeCol: "#7090e0", hazeSize: 26, hazeOp: 0.12, starSize: 2.8, pinkOff: 0.05, dustOff: -0.16, dustSize: 15, dustOp: 0.4, dustMinR: 60,
      diskGlow: 0x9fb0e8, bulgeGlow: 0xffe0a0, diskGlowOp: 0.45
    });
    tilt.add(disk);
    face.add(sprite("core", 0xfff0d0, 200, 0.95));
    // M32 (small round) and M110 (elliptical)
    function dwarf(n, sx, sy, sz, cols, glowS) {
      var pb = new PB(R), g = new T.Group();
      for (var i = 0; i < n; i++) pb.add(gauss(R) * sx, gauss(R) * sy, gauss(R) * sz, C(pick(R, cols)), 0.5 + R() * 0.5, 2.2 + R() * 1.6);
      g.add(pb.build(ctx, { fall: 6, core: 0.4 }));
      var s = sprite("core", 0xffecc8, [glowS * sx / Math.max(sx, sy), glowS * sy / Math.max(sx, sy)], 0.8); g.add(s);
      return g;
    }
    var m32 = dwarf(600, 8, 8, 8, ["#ffe8c0", "#fff4e0", "#ffd8a0"], 55); m32.position.set(70, -55, 70); face.add(m32);
    var m110 = dwarf(1300, 30, 17, 17, ["#ffe8c0", "#fff0d8", "#f0d8b8"], 110); m110.position.set(-190, 170, -40); m110.rotation.z = -0.5; face.add(m110);
    ctx.ticks.push(function (t, dt) { disk.rotation.y += dt * 0.005; });
    addBeacon(ctx, 0xdfe2ff, 0.9);
    return { view: 980, radius: 470 };
  };

  MAKERS.whirlpool = function (ctx) {
    var face = ctx.face, R = rng(1414);
    var tilt = new T.Group(); tilt.rotation.x = 1.2; face.add(tilt);
    var k = Math.tan(19 * Math.PI / 180);
    var arms = [{ ph: 0, r0: 28, r1: 340, w: 14, n: 1 }, { ph: Math.PI, r0: 28, r1: 330, w: 14, n: 1 }];
    var disk = galaxy(ctx, {
      seed: 1515, R: 350, k: k, barLen: 0, barAng: 0, bulgeR: 22, fall: 0.7, thJit: 0.035, h: 4,
      arms: arms, nArm: 11500, nBulge: 2800, nDisk: 2300, nHaze: 2000, nPink: 110, nDust: 2300,
      armCols: ["#a8c4ff", "#d0e0ff", "#ffffff", "#9cb8ff", "#fff2e0"], bulgeCols: ["#ffe0a0", "#fff0d0", "#ffd090"],
      hazeCol: "#5878ff", hazeSize: 28, hazeOp: 0.12, starSize: 2.4, pinkOff: 0.05, dustOff: -0.12, dustSize: 10, dustOp: 0.38, dustMinR: 35,
      diskGlow: 0x7090ff, bulgeGlow: 0xffd890
    });
    tilt.add(disk);
    tilt.add(sprite("core", 0xfff0c8, 110, 0.9));
    // NGC 5195 at the tip of arm 0
    var re = 340, th = arms[0].ph + Math.log(re / arms[0].r0) / k;
    var cp = new T.Group(); cp.position.set(Math.cos(th) * (re + 22), 6, Math.sin(th) * (re + 22)); disk.add(cp);
    var pb = new PB(R), dd = new PB(R);
    for (var i = 0; i < 2300; i++) { var r = Math.abs(gauss(R)) * 22; var a = R() * TAU; pb.add(Math.cos(a) * r, gauss(R) * 10, Math.sin(a) * r * 0.8, C(pick(R, ["#ffd8a0", "#ffe8c0", "#ffc890", "#fff0d8"])), (0.5 + R() * 0.5) * (1 - Math.min(0.7, r / 60)), 2.2 + R() * 1.8); }
    for (i = 0; i < 300; i++) { var u = gauss(R) * 26; dd.add(u, 4 + gauss(R) * 2, u * 0.35 + gauss(R) * 4, C("#1a0e08"), 1, 9 + R() * 6); }
    cp.add(pb.build(ctx, { fall: 6, core: 0.4 }));
    cp.add(dd.build(ctx, { normal: true, opacity: 0.35, fall: 2.5, renderOrder: 1 }));
    cp.add(sprite("core", 0xffdca0, 80, 0.8));
    cp.add(glowPlane(0xffb070, 140, 0.4));
    ctx.ticks.push(function (t, dt) { disk.rotation.y += dt * 0.008; });
    addBeacon(ctx, 0xc8d4ff, 0.9);
    return { view: 800, radius: 380 };
  };

  MAKERS.lmc = function (ctx) {
    var face = ctx.face, R = rng(1616);
    var tilt = new T.Group(); tilt.rotation.x = 0.95; tilt.rotation.z = 0.25; face.add(tilt);
    var spin = new T.Group(); tilt.add(spin);
    var st = new PB(R), hz = new PB(R), pk = new PB(R);
    var cBar = [C("#fff0d0"), C("#ffe4b0"), C("#ffffff"), C("#e8eeff")], cDisk = [C("#c8d8ff"), C("#e0e8ff"), C("#ffffff"), C("#fff0e0")];
    var ba = 0.3;
    var clumps = []; for (var i = 0; i < 40; i++) clumps.push([gauss(R) * 60, gauss(R) * 14]);
    for (i = 0; i < 7000; i++) {
      var bx, bz;
      if (R() < 0.45) { var c = clumps[Math.floor(R() * clumps.length)]; bx = c[0] + gauss(R) * 9; bz = c[1] + gauss(R) * 6; }
      else { bx = gauss(R) * 62; bz = gauss(R) * 18; }
      var x = bx * Math.cos(ba) - bz * Math.sin(ba), z = bx * Math.sin(ba) + bz * Math.cos(ba);
      st.add(x, gauss(R) * 8, z, pick(R, cBar), 0.5 + R() * 0.5, 2 + R() * 2);
    }
    var tries = 0, n0 = st.count();
    while (st.count() < n0 + 8000 && tries++ < 60000) {
      var r = Math.pow(R(), 0.7) * 195, a = R() * TAU;
      x = Math.cos(a) * r * 1.1; z = Math.sin(a) * r * 0.9;
      var n = fbm(x * 0.012 + 3, z * 0.012, 0.5, 51);
      var armB = Math.exp(-Math.pow((a - 1.9 - r * 0.006 + TAU) % TAU - Math.PI, 2) * 2) * sstep(60, 140, r);
      if (R() > (n * n * 2.0 + armB * 0.7) * (1 - r / 210)) continue;
      st.add(x, gauss(R) * 6, z, pick(R, cDisk), 0.35 + R() * 0.5, 1.8 + R() * 1.8);
      if (R() < 0.12) hz.add(x, gauss(R) * 6, z, C("#6d8cff"), 0.5 + R() * 0.5, 20 + R() * 16);
    }
    // Tarantula nebula (30 Doradus) and other pink star-forming spots
    var tar = new T.Vector3(-72, 4, -38);
    for (i = 0; i < 1100; i++) {
      var d = new T.Vector3(gauss(R), gauss(R) * 0.6, gauss(R)).multiplyScalar(10 + R() * 8);
      var loop = R() < 0.5 ? 1.0 + 0.6 * Math.sin(Math.atan2(d.z, d.x) * 5) : 1;
      pk.add(tar.x + d.x * loop, tar.y + d.y, tar.z + d.z * loop, pick(R, [C("#ff4f9a"), C("#ff7ab8"), C("#ff3a7a"), C("#ffa0d0")]), 0.6 + R() * 0.4, 2.2 + R() * 3);
    }
    for (i = 0; i < 260; i++) hz.add(tar.x + gauss(R) * 14, tar.y + gauss(R) * 6, tar.z + gauss(R) * 14, C("#ff3f8f"), 0.8, 16 + R() * 18);
    for (i = 0; i < 16; i++) {
      var sx = gauss(R) * 90, sz = gauss(R) * 60;
      for (var k = 0; k < 30; k++) pk.add(sx + gauss(R) * 4, gauss(R) * 2, sz + gauss(R) * 4, pick(R, [C("#ff5fa8"), C("#ff80c0")]), 0.6 + R() * 0.4, 2 + R() * 2);
      hz.add(sx, 0, sz, C("#ff4f9a"), 0.8, 14);
    }
    spin.add(st.build(ctx, { fall: 6, core: 0.5, twinkle: 0.15 }));
    spin.add(hz.build(ctx, { opacity: 0.12, fall: 3 }));
    spin.add(pk.build(ctx, { opacity: 0.85, fall: 4, twinkle: 0.2 }));
    var bg = glowPlane(0xfff0d0, 170, 0.6, 1.0, 0.35); bg.rotation.z = -ba; spin.add(bg);
    spin.add(glowPlane(0x8fa8ff, 420, 0.3, 1.1, 0.9));
    var ts = sprite("core", 0xff60a8, 75, 0.9); ts.position.copy(tar); spin.add(ts);
    var tc = sprite("core", 0xffffff, 16, 1); tc.position.copy(tar); spin.add(tc);
    ctx.ticks.push(function (t, dt) { spin.rotation.y += dt * 0.008; ts.material.opacity = 0.8 + 0.12 * Math.sin(t * 1.4); });
    addBeacon(ctx, 0xe0e4ff, 0.9);
    return { view: 470, radius: 210 };
  };

  // ---------- more neighbours ----------
  function planetTex(seed, base, spots, o) {
    o = o || {}; var pr = rng(seed);
    var t = canvasTex(256, 128, function (c, w, h) {
      c.fillStyle = base; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 90; i++) {
        c.globalAlpha = 0.25 + pr() * 0.35; c.fillStyle = pick(pr, spots);
        var x = pr() * w, y = h * (0.15 + pr() * 0.7), r = 3 + pr() * (o.big || 16);
        c.beginPath(); c.ellipse(x, y, r * 1.6, r, 0, 0, TAU); c.fill();
        if (x < r * 1.6) { c.beginPath(); c.ellipse(x + w, y, r * 1.6, r, 0, 0, TAU); c.fill(); }
      }
      if (o.craters) for (i = 0; i < 30; i++) { var cx = pr() * w, cy = pr() * h, cr = 1 + pr() * 3.5; c.globalAlpha = 0.5; c.fillStyle = "rgba(0,0,0,0.6)"; c.beginPath(); c.arc(cx, cy, cr, 0, TAU); c.fill(); c.globalAlpha = 0.35; c.fillStyle = "#ffffff"; c.beginPath(); c.arc(cx - cr * 0.3, cy - cr * 0.3, cr * 0.6, 0, TAU); c.fill(); }
      if (o.clouds) for (i = 0; i < 26; i++) { c.globalAlpha = 0.35 + pr() * 0.35; c.fillStyle = "#ffffff"; c.beginPath(); c.ellipse(pr() * w, h * (0.1 + pr() * 0.8), 8 + pr() * 22, 2 + pr() * 4, 0, 0, TAU); c.fill(); }
      if (o.caps) { c.globalAlpha = 0.9; c.fillStyle = o.caps; c.fillRect(0, 0, w, h * 0.1); c.fillRect(0, h * 0.9, w, h * 0.1); }
      c.globalAlpha = 1;
    });
    t.dsBase = base; return t;
  }

  MAKERS.alphacen = function (ctx) {
    var root = ctx.root;
    var tilt = new T.Group(); tilt.rotation.x = 0.32; tilt.rotation.z = -0.08; root.add(tilt);
    var piv = new T.Group(); tilt.add(piv);
    var dA = 23, dB = 29;
    piv.add(orbitLine(dA, 0xffe48a, 0.2), orbitLine(dB, 0xffb060, 0.2));
    var A = makeStar(ctx, 10, ["#c08a20", "#ffe070", "#fff8d0"], 0xffe48a, { halo: 8, core: 3.2, scale: 2.6 });
    var B = makeStar(ctx, 8, ["#a8501a", "#ffa848", "#ffe0a8"], 0xffa850, { halo: 8, core: 3.2, scale: 2.6 });
    A.position.x = -dA; B.position.x = dB; piv.add(A, B);
    var sA = sprite("spikes", 0xfff0b0, 190, 0.55), sB = sprite("spikes", 0xffc880, 150, 0.5);
    A.add(sA); B.add(sB);
    // little red Proxima far away
    var P = makeStar(ctx, 1.4, ["#6a0e02", "#d8400f", "#ffa050"], 0xff4a20, { halo: 16, core: 6 });
    P.position.set(-120, 46, -95); root.add(P);
    var pg = sprite("spikes", 0xff7050, 26, 0.6); P.add(pg);
    piv.rotation.y = 0.5;
    ctx.ticks.push(function (t, dt) {
      piv.rotation.y += dt * 0.07;
      sA.material.opacity = 0.5 + 0.08 * Math.sin(t * 1.9);
      sB.material.opacity = 0.45 + 0.08 * Math.sin(t * 2.3 + 1);
      P.userData.halo.material.opacity = 0.7 + 0.25 * Math.sin(t * 1.1);
    });
    addBeacon(ctx, 0xffe0a0, 1);
    return { view: 150, radius: 140 };
  };

  MAKERS.trappist1 = function (ctx) {
    var root = ctx.root;
    var star = makeStar(ctx, 3.6, ["#4a0a02", "#b8320c", "#ff7a3a"], 0xff4818, { halo: 9, haloOp: 0.7, core: 3, scale: 2.4, speed: 0.22 });
    root.add(star);
    root.add(sprite("soft", 0xff3010, 70, 0.22));
    var tilt = new T.Group(); tilt.rotation.x = 0.22; tilt.rotation.z = 0.06; root.add(tilt);
    // b..h : orbit radius, planet radius, period (days), look
    var PL = [
      [9, 1.75, 1.51, planetTex(11, "#a65a34", ["#7a3a20", "#c87a4a", "#5a2a18", "#d89060"], { craters: true })],
      [13, 1.7, 2.42, planetTex(12, "#b09068", ["#8a6a48", "#d0b088", "#6a5038", "#e8c8a0"], { craters: true })],
      [17.5, 1.3, 4.05, planetTex(13, "#3a8ad8", ["#2a6ab8", "#5aa8f0", "#c8a060", "#4a9a60"], { clouds: true })],
      [22.5, 1.5, 6.1, planetTex(14, "#2a6ad0", ["#2f9a58", "#5ab868", "#1a50a8", "#3a80e0"], { clouds: true, caps: "#f0f8ff" })],
      [28, 1.65, 9.2, planetTex(15, "#58c0dc", ["#a8e8f8", "#3a98c0", "#e8f8ff", "#2a80b0"], { caps: "#ffffff" })],
      [34, 1.75, 12.35, planetTex(16, "#d0e4f0", ["#ffffff", "#a8c8e0", "#b8d8f0", "#88b0d0"], { big: 22 })],
      [41, 1.35, 18.77, planetTex(17, "#8a78b8", ["#a898d0", "#6a5898", "#c0b0e0", "#5a4880"], { craters: true, caps: "#e8e0ff" })]];
    var light = C("#ffc8a0").multiplyScalar(1.5), planets = [];
    PL.forEach(function (d, i) {
      tilt.add(orbitLine(d[0], 0xff9a70, 0.16));
      var piv = new T.Group(); piv.rotation.y = i * 2.1 + 0.4; tilt.add(piv);
      var mat = new T.ShaderMaterial({ uniforms: { map: { value: d[3] }, uLight: { value: new T.Vector3() }, uLightCol: { value: light } }, vertexShader: PLANET_VS, fragmentShader: PLANET_FS });
      var pl = new T.Mesh(new T.SphereGeometry(d[1] * 1.3, 28, 18), mat);
      pl.position.x = d[0]; piv.add(pl);
      pl.onBeforeRender = function () { mat.uniforms.uLight.value.setFromMatrixPosition(star.matrixWorld); };
      var gl = sprite("soft", C(d[3].dsBase), d[1] * 5, 0.45); pl.add(gl);
      planets.push({ piv: piv, pl: pl, w: 0.55 * 1.51 / d[2] });
    });
    ctx.ticks.push(function (t, dt) {
      for (var k = 0; k < planets.length; k++) { planets[k].piv.rotation.y += dt * planets[k].w; planets[k].pl.rotation.y += dt * 0.3; }
      star.userData.halo.material.opacity = 0.62 + 0.08 * Math.sin(t * 0.9);
    });
    addBeacon(ctx, 0xff6030, 0.9);
    return { view: 85, radius: 48 };
  };

  MAKERS.rigel = function (ctx) {
    var root = ctx.root, R = rng(1717);
    var star = makeStar(ctx, 20, ["#5a8cff", "#d4e4ff", "#ffffff"], 0xa8c8ff, { halo: 11, core: 3.6, scale: 2.2, speed: 0.25, bump: 0.5 });
    root.add(star);
    var big = sprite("soft", 0x5f8fff, 640, 0.32); root.add(big);
    var sp = sprite("spikes", 0xdce8ff, 520, 0.95); root.add(sp);
    var sp2 = sprite("spikes", 0x8fb4ff, 300, 0.55); sp2.material.rotation = 0.38; root.add(sp2);
    // shimmering blue wind / reflection haze
    var hz = new PB(R), hc = [C("#3f6cff"), C("#6f9cff"), C("#9fc0ff"), C("#5a7fe8")];
    for (var i = 0; i < 700; i++) {
      var d = new T.Vector3(gauss(R), gauss(R), gauss(R)).normalize(), r = 30 + Math.pow(R(), 1.3) * 120;
      var n = fbm(d.x * 2 + 3, d.y * 2, d.z * 2, 61);
      hz.add(d.x * r, d.y * r, d.z * r, pick(R, hc), (0.3 + 0.7 * n * n) * (1 - r / 160), 18 + R() * 20);
    }
    var hzp = hz.build(ctx, { opacity: 0.08, fall: 3 }); root.add(hzp);
    // Rigel B (a little pair of blue-white stars)
    var bp = new T.Group(); bp.position.set(78, -24, -40); root.add(bp);
    var b1 = makeStar(ctx, 1.6, ["#b0c8ff", "#f0f4ff", "#ffffff"], 0xd8e4ff, { halo: 12, core: 5 });
    var b2 = makeStar(ctx, 1.3, ["#b0c8ff", "#f0f4ff", "#ffffff"], 0xd8e4ff, { halo: 12, core: 5 });
    b1.position.x = -3.2; b2.position.x = 3.2; bp.add(b1, b2);
    ctx.ticks.push(function (t, dt) {
      sp.material.opacity = 0.85 + 0.1 * Math.sin(t * 2.1) + 0.05 * Math.sin(t * 4.7);
      sp2.material.rotation = 0.38 + 0.04 * Math.sin(t * 0.6);
      big.material.opacity = 0.3 + 0.04 * Math.sin(t * 1.3);
      hzp.rotation.y += dt * 0.02;
      bp.rotation.y += dt * 0.5;
    });
    addBeacon(ctx, 0xb0ccff, 1);
    return { view: 165, radius: 95 };
  };

  MAKERS.horsehead = function (ctx) {
    var face = ctx.face, R = rng(1818);
    // glowing red/pink emission cloud (IC 434) behind
    var gas = new PB(R), fine = new PB(R);
    var gc = [C("#ff3a5a"), C("#ff5a7a"), C("#e8284a"), C("#ff7aa0"), C("#ff4a90"), C("#ff6a60")];
    var tries = 0;
    while (gas.count() < 3200 && tries++ < 100000) {
      var x = (R() * 2 - 1) * 220, y = (R() * 2 - 1) * 200;
      var e = (x * x) / (215 * 215) + ((y + 5) * (y + 5)) / (190 * 190);
      if (e >= 1) continue;
      var n = fbm(x * 0.016 + 2, y * 0.016, 0.7, 71);
      if (R() > (0.2 + 1.3 * n * n) * Math.pow(1 - e, 0.7)) continue;
      var c = pick(R, gc); if (y > 120) c = mixC(c, C("#c050ff"), (y - 120) / 140);
      gas.add(x, y, -30 + gauss(R) * 12, c, 0.5 + R() * 0.5, 18 + R() * 22);
    }
    tries = 0;
    while (fine.count() < 3000 && tries++ < 150000) {
      x = (R() * 2 - 1) * 210; y = (R() * 2 - 1) * 190;
      e = (x * x) / (210 * 210) + ((y + 5) * (y + 5)) / (185 * 185);
      if (e >= 1) continue;
      n = fbm(x * 0.03, y * 0.03, 3.3, 72);
      var ridge = Math.pow(1 - Math.abs(n - 0.5) * 2, 6);
      if (R() > ridge * 1.5 * (1 - e)) continue;
      fine.add(x, y, -25 + gauss(R) * 8, mixC(C("#ff6a8a"), C("#ffb0c0"), R() * 0.5), 0.5 + R() * 0.5, 4 + R() * 5);
    }
    var bgl = sprite("soft", 0xff2848, [560, 500], 0.45); bgl.position.y = 0; face.add(bgl);
    var bgl2 = sprite("soft", 0xff6a80, 260, 0.3); bgl2.position.set(-20, 40, 0); face.add(bgl2);
    face.add(gas.build(ctx, { opacity: 0.1, fall: 3 }));
    face.add(fine.build(ctx, { opacity: 0.22, fall: 3 }));
    // the dark horse head + dark cloud below, painted on a canvas
    var pr = rng(1819);
    var htex = canvasTex(512, 512, function (c, w, h) {
      function horse() {
        c.beginPath();
        c.moveTo(214, 470);
        c.bezierCurveTo(222, 410, 236, 360, 240, 318);   // throat
        c.bezierCurveTo(244, 296, 262, 286, 254, 268);   // round cheek
        c.bezierCurveTo(236, 258, 206, 270, 176, 276);   // under the jaw
        c.bezierCurveTo(156, 280, 138, 278, 130, 266);   // chin / lips
        c.bezierCurveTo(122, 254, 120, 238, 128, 228);   // nose front
        c.bezierCurveTo(148, 206, 190, 180, 226, 156);   // long nose bridge
        c.bezierCurveTo(244, 144, 258, 136, 266, 130);   // forehead
        c.bezierCurveTo(264, 112, 268, 96, 276, 86);     // ear 1 front
        c.bezierCurveTo(282, 98, 286, 112, 288, 122);    // ear 1 back
        c.bezierCurveTo(292, 108, 298, 96, 306, 90);     // ear 2 front
        c.bezierCurveTo(310, 104, 310, 118, 306, 132);   // ear 2 back
        c.bezierCurveTo(326, 146, 340, 168, 344, 196);   // poll / mane
        c.bezierCurveTo(350, 240, 348, 290, 356, 340);
        c.bezierCurveTo(364, 390, 384, 430, 404, 470);   // back of neck
        c.closePath();
      }
      // pink rim glow where the light catches the edges
      c.save(); c.shadowColor = "rgba(255,160,180,0.95)"; c.shadowBlur = 16;
      c.strokeStyle = "rgba(255,150,170,0.6)"; c.lineWidth = 6; horse(); c.stroke(); c.restore();
      // billowy dark cloud along the bottom
      for (var i = 0; i < 140; i++) {
        var px = pr() * 512, py = 430 + pr() * 90 - (px > 150 && px < 450 ? 15 : 0), r2 = 22 + pr() * 40;
        var g = c.createRadialGradient(px, py, 0, px, py, r2);
        g.addColorStop(0, "rgba(14,4,8,0.95)"); g.addColorStop(0.6, "rgba(14,4,8,0.7)"); g.addColorStop(1, "rgba(14,4,8,0)");
        c.fillStyle = g; c.beginPath(); c.arc(px, py, r2, 0, TAU); c.fill();
      }
      c.fillStyle = "rgba(14,4,8,0.95)"; c.fillRect(0, 470, 512, 42);
      c.save(); c.shadowColor = "rgba(14,4,8,1)"; c.shadowBlur = 8; c.fillStyle = "#12060a"; horse(); c.fill(); c.restore();
      // a little shading so the head isn't flat, plus a glint of an eye
      c.save(); horse(); c.clip();
      var sh = c.createLinearGradient(120, 200, 300, 220); sh.addColorStop(0, "rgba(110,36,50,0.4)"); sh.addColorStop(0.45, "rgba(40,12,18,0)"); sh.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = sh; c.fillRect(0, 0, 512, 512);
      c.restore();
      c.beginPath(); c.ellipse(262, 160, 6, 4, -0.5, 0, TAU); c.fillStyle = "rgba(255,170,190,0.35)"; c.fill();
      // soft fade at the edges of the canvas
      c.globalCompositeOperation = "destination-in";
      var fade = c.createRadialGradient(256, 300, 140, 256, 300, 250);
      fade.addColorStop(0, "rgba(0,0,0,1)"); fade.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = fade; c.fillRect(0, 0, 512, 512);
      c.globalCompositeOperation = "source-over";
    });
    var hp = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshBasicMaterial({ map: htex, transparent: true, depthWrite: false, side: T.DoubleSide }));
    hp.position.set(10, -10, 0); hp.renderOrder = 1; face.add(hp);
    // stars, including bright Sigma Orionis lighting the cloud
    var st = new PB(R);
    for (var i = 0; i < 380; i++) st.add((R() * 2 - 1) * 200, (R() * 2 - 1) * 190, 10 + gauss(R) * 10, mixC(C("#cfe0ff"), C("#fff0e0"), R()), 0.3 + R() * 0.6, 1.2 + R() * 2);
    face.add(st.build(ctx, { fall: 6, core: 0.8, twinkle: 0.45, renderOrder: 2 }));
    var sig = makeStar(ctx, 2.2, ["#a8c4ff", "#ffffff", "#ffffff"], 0xc8dcff, { halo: 18, core: 6 });
    sig.position.set(-125, 150, 20); sig.renderOrder = 2; face.add(sig);
    var sgs = sprite("spikes", 0xdce8ff, 90, 0.75); sgs.renderOrder = 2; sig.add(sgs);
    ctx.ticks.push(function (t) { sgs.material.opacity = 0.65 + 0.12 * Math.sin(t * 2.2); bgl2.material.opacity = 0.27 + 0.05 * Math.sin(t * 0.9); });
    addBeacon(ctx, 0xff5070, 1);
    return { view: 400, radius: 190 };
  };

  MAKERS.helix = function (ctx) {
    var face = ctx.face, R = rng(1919);
    var spinG = new T.Group(); face.add(spinG);
    var disc = new PB(R), ring = new PB(R), knots = new PB(R), outer = new PB(R);
    var dc = [C("#2fd8c8"), C("#40f0a8"), C("#4fb8ff"), C("#7affd8"), C("#3a9cff")];
    for (var i = 0; i < 3200; i++) {
      var a = R() * TAU, r = Math.sqrt(R()) * 52;
      disc.add(Math.cos(a) * r, Math.sin(a) * r, gauss(R) * 8, pick(R, dc), (0.35 + 0.5 * R()) * (0.5 + 0.7 * Math.pow(r / 52, 2)), 12 + R() * 16);
    }
    var cOr = C("#ffa040"), cRed = C("#ff3a2a"), cCrim = C("#e01840"), cYel = C("#ffd060");
    for (i = 0; i < 6000; i++) {
      a = R() * TAU; r = 72 + gauss(R) * 10;
      r *= 1 + 0.08 * (fbm(Math.cos(a) * 2, Math.sin(a) * 2, 0, 81) - 0.5);
      var n = fbm(Math.cos(a) * 5, Math.sin(a) * 5, r * 0.06, 82);
      var c = r < 66 ? mixC(cYel, cOr, sstep(56, 66, r)) : r < 78 ? mixC(cOr, cRed, sstep(66, 78, r)) : mixC(cRed, cCrim, sstep(78, 92, r));
      ring.add(Math.cos(a) * r, Math.sin(a) * r, gauss(R) * 10, c, (0.4 + 0.6 * R()) * (0.5 + n), 7 + R() * 9);
    }
    // cometary knots: little radial streaks, the "eyelashes"
    for (i = 0; i < 260; i++) {
      a = R() * TAU; var r0 = 50 + R() * 14, len = 6 + R() * 10;
      for (var k = 0; k < 9; k++) {
        var f = k / 8, rr = r0 + f * len, aa = a + gauss(R) * 0.006;
        knots.add(Math.cos(aa) * rr, Math.sin(aa) * rr, gauss(R), mixC(C("#fff0b0"), cRed, f), (1 - f * 0.7) * (0.6 + R() * 0.4), (1 - f * 0.5) * (2 + R() * 1.4));
      }
    }
    // faint outer loop (the second ring, a bit offset)
    for (i = 0; i < 1600; i++) {
      a = R() * TAU; r = 98 + gauss(R) * 6;
      var gap = 0.5 + 0.5 * Math.sin(a * 2 + 0.6);
      outer.add(Math.cos(a) * r * 1.05 + 6, Math.sin(a) * r - 4, gauss(R) * 8, mixC(cRed, C("#ff6a50"), R()), (0.2 + 0.4 * R()) * (0.3 + gap), 10 + R() * 10);
    }
    spinG.add(disc.build(ctx, { opacity: 0.055, fall: 3 }));
    spinG.add(outer.build(ctx, { opacity: 0.06, fall: 3 }));
    spinG.add(ring.build(ctx, { opacity: 0.085, fall: 3 }));
    spinG.add(knots.build(ctx, { opacity: 0.55, fall: 4, twinkle: 0.15 }));
    face.add(sprite("ring", 0xff4028, 245, 0.45));
    face.add(sprite("soft", 0x30e0b0, 150, 0.22));
    var wd = makeStar(ctx, 1.1, ["#c8d8ff", "#ffffff", "#ffffff"], 0xcfe4ff, { halo: 22, core: 9 });
    face.add(wd);
    var spk = sprite("spikes", 0xffffff, 34, 0.75); wd.add(spk);
    ctx.ticks.push(function (t, dt) {
      spinG.rotation.z -= dt * 0.015;
      var b = 0.5 + 0.5 * Math.sin(t * 1.1);
      wd.userData.halo.material.opacity = 0.75 + 0.2 * b; spk.material.opacity = 0.6 + 0.2 * b;
    });
    addBeacon(ctx, 0x60e8b0, 1);
    return { view: 270, radius: 110 };
  };

  MAKERS.omegacen = function (ctx) {
    var root = ctx.root, R = rng(2020);
    var ball = new T.Group(); root.add(ball);
    var st = new PB(R), giants = new PB(R);
    var cols = [C("#ffd27a"), C("#ffe4a8"), C("#fff6e0"), C("#ffffff"), C("#ffc860"), C("#ffeccc")];
    var v = new T.Vector3();
    while (st.count() < 11000) {
      var u = R(), r = 21 / Math.sqrt(Math.pow(u, -2 / 3) - 1); // Plummer sphere
      if (r > 120) continue;
      v.set(gauss(R), gauss(R), gauss(R)).normalize().multiplyScalar(r);
      st.add(v.x, v.y, v.z, pick(R, cols), (0.35 + R() * 0.55) * (0.3 + 0.7 * sstep(4, 30, r)), 1.4 + R() * 1.6);
    }
    for (var i = 0; i < 260; i++) {
      u = R(); r = 22 / Math.sqrt(Math.pow(u, -2 / 3) - 1); if (r > 110) r = 110 * R();
      v.set(gauss(R), gauss(R), gauss(R)).normalize().multiplyScalar(r);
      var blue = R() < 0.25;
      giants.add(v.x, v.y, v.z, blue ? C("#a8c8ff") : pick(R, [C("#ff9a50"), C("#ffb060"), C("#ffd080")]), 0.9 + R() * 0.3, blue ? 3 + R() * 2 : 3.5 + R() * 3);
    }
    ball.add(st.build(ctx, { fall: 6, core: 0.6, twinkle: 0.3, minPx: 1.2 }));
    ball.add(giants.build(ctx, { fall: 5, core: 1, twinkle: 0.4 }));
    var cg = sprite("core", 0xffe0a0, 170, 0.55); root.add(cg);
    root.add(sprite("soft", 0xffc870, 330, 0.35));
    root.add(sprite("soft", 0xfff0d0, 80, 0.35));
    ctx.ticks.push(function (t, dt) { ball.rotation.y += dt * 0.012; ball.rotation.x = 0.15 * Math.sin(t * 0.05); cg.material.opacity = 0.7 + 0.06 * Math.sin(t * 0.8); });
    addBeacon(ctx, 0xffe0a0, 1);
    return { view: 300, radius: 120 };
  };

  MAKERS.cygnusx1 = function (ctx) {
    var root = ctx.root, R = rng(2121);
    var sys = new T.Group(); root.add(sys);
    var starPos = new T.Vector3(-52, 0, 0), sR = 21;
    var star = makeStar(ctx, sR, ["#2f5cff", "#9cc0ff", "#f0f6ff"], 0x7aa8ff, { halo: 6, core: 3, scale: 2.2, speed: 0.25 });
    star.userData.mesh.scale.x = 1.13; // pulled into a teardrop shape by gravity
    star.position.copy(starPos); sys.add(star);
    var ssp = sprite("spikes", 0xb8d0ff, 260, 0.45); ssp.position.copy(starPos); sys.add(ssp);
    // black hole + accretion disc
    var bh = new T.Group(); bh.position.set(40, 0, 0); sys.add(bh);
    var dg = new T.Group(); dg.rotation.set(0.42, 0, 0.18); bh.add(dg);
    bh.add(new T.Mesh(new T.SphereGeometry(3.2, 32, 20), new T.MeshBasicMaterial({ color: 0x000000 })));
    var disk = new PB(R);
    var c1 = C("#ffffff"), c2 = C("#8ae8ff"), c3 = C("#9a70ff"), c4 = C("#ff4fc0");
    for (var i = 0; i < 5000; i++) {
      var r = 4.4 + 28 * Math.pow(R(), 1.4), a = R() * TAU, f = (r - 4.4) / 28;
      var c = f < 0.2 ? mixC(c1, c2, f / 0.2) : f < 0.55 ? mixC(c2, c3, (f - 0.2) / 0.35) : mixC(c3, c4, (f - 0.55) / 0.45);
      var clump = 0.6 + 0.8 * vnoise(a * 4, r * 0.4, 0, 91);
      disk.add(Math.cos(a) * r, gauss(R) * 0.25 * (0.5 + f), Math.sin(a) * r, c, (0.6 + R() * 0.4) * clump * (1.3 - f), 1.1 + R() * 1.4);
    }
    dg.add(disk.build(ctx, { opacity: 0.8, fall: 4, spin: 1.3, r0: 6, beam: 0.5 }));
    dg.add(glowPlane(0x9a70ff, 76, 0.5)); dg.add(glowPlane(0xd0f0ff, 22, 0.6));
    var pr = sprite("ring", 0xd8e8ff, 14, 0.9); bh.add(pr);
    bh.add(sprite("soft", 0xb080ff, 110, 0.45));
    // stream of gas from the star spiralling in, plus twin jets (animated on the CPU)
    dg.updateMatrix(); bh.updateMatrix();
    var sl = starPos.clone().sub(bh.position).applyMatrix4(new T.Matrix4().copy(dg.matrix).invert());
    sl.multiplyScalar(1 - sR * 1.08 / sl.length());
    var th0 = Math.atan2(sl.z, sl.x), rs0 = Math.sqrt(sl.x * sl.x + sl.z * sl.z), y0 = sl.y;
    var NS = 900, NJ = 360, dyn = new PB(R), meta = [];
    for (i = 0; i < NS + NJ; i++) { dyn.add(0, 0, 0, c1, 1, i < NS ? 2.4 + R() * 2.6 : 1.6 + R() * 1.8); meta.push([R(), gauss(R), gauss(R), gauss(R)]); }
    var dynP = dyn.build(ctx, { opacity: 0.7, fall: 3.2 }); dynP.frustumCulled = false; dg.add(dynP);
    var pos = dynP.geometry.attributes.position, col = dynP.geometry.attributes.aColor;
    var sc1 = C("#7aa8ff"), sc2 = C("#c08cff"), sc3 = C("#fff4ff"), jc = C("#9fd0ff");
    function flow(t) {
      for (var k = 0; k < NS + NJ; k++) {
        var m = meta[k], s, x, y, z, cc, b;
        if (k < NS) {
          s = (m[0] + t * 0.06) % 1;
          var rr = 4.6 + (rs0 - 4.6) * Math.pow(1 - s, 1.7), th = th0 + 2.6 * Math.PI * Math.pow(s, 1.3), w = 0.4 + 3.2 * (1 - s) * (1 - s);
          x = Math.cos(th) * rr + m[1] * w; z = Math.sin(th) * rr + m[2] * w; y = y0 * Math.pow(1 - s, 3) + m[3] * w * 0.4;
          cc = s < 0.5 ? mixC(sc1, sc2, s / 0.5) : mixC(sc2, sc3, (s - 0.5) / 0.5); b = 0.5 + 0.6 * s;
          if (s < 0.025) b *= s / 0.025;
        } else {
          s = (m[0] + t * 0.22) % 1;
          var sg = (k - NS) % 2 ? 1 : -1, jw = 0.3 + s * 2.2;
          x = m[1] * jw; z = m[2] * jw; y = sg * (3.5 + s * 75); cc = jc; b = (1 - s) * 0.9;
        }
        pos.setXYZ(k, x, y, z); col.setXYZ(k, cc.r * b, cc.g * b, cc.b * b);
      }
      pos.needsUpdate = true; col.needsUpdate = true;
    }
    flow(0);
    ctx.ticks.push(function (t, dt) {
      flow(t);
      pr.material.opacity = 0.8 + 0.15 * Math.sin(t * 3.1);
      sys.rotation.y += dt * 0.025;
    });
    sys.position.x = 6;
    addBeacon(ctx, 0x9a8cff, 1);
    return { view: 200, radius: 100 };
  };

  MAKERS.triangulum = function (ctx) {
    var face = ctx.face, R = rng(2222);
    var tilt = new T.Group(); tilt.rotation.x = 1.3; tilt.rotation.z = 0.3; face.add(tilt);
    var k = Math.tan(28 * Math.PI / 180);
    var arms = [{ ph: 0, r0: 22, r1: 260, w: 15, n: 1 }, { ph: Math.PI, r0: 22, r1: 250, w: 15, n: 1 },
      { ph: 1.3, r0: 70, r1: 230, w: 13, n: 0.45 }, { ph: 4.2, r0: 80, r1: 240, w: 13, n: 0.4 },
      { ph: 2.5, r0: 110, r1: 250, w: 12, n: 0.3 }, { ph: 5.6, r0: 100, r1: 230, w: 12, n: 0.3 }];
    var disk = galaxy(ctx, {
      seed: 2323, R: 260, k: k, barLen: 0, barAng: 0, bulgeR: 13, fall: 0.8, thJit: 0.11, h: 4,
      arms: arms, nArm: 10000, nBulge: 1300, nDisk: 2200, nHaze: 1700, nPink: 170, nDust: 900,
      armCols: ["#8fb4ff", "#b0ccff", "#ffffff", "#9cc0ff", "#d8e4ff"], bulgeCols: ["#fff0c8", "#ffe4b0", "#fff8e8"],
      hazeCol: "#4f78ff", hazeSize: 26, hazeOp: 0.14, starSize: 2.7, pinkOff: 0.03, dustOff: -0.12, dustSize: 9, dustOp: 0.22, dustMinR: 40,
      diskGlow: 0x6f8cff, bulgeGlow: 0xfff0c0, diskGlowOp: 0.3
    });
    tilt.add(disk);
    tilt.add(sprite("core", 0xfff0d0, 60, 0.85));
    // NGC 604: a giant pink star-forming cloud
    var ng = arms[0], rN = 170, thN = ng.ph + Math.log(rN / ng.r0) / k;
    var np = new T.Group(); np.position.set(Math.cos(thN) * rN, 2, Math.sin(thN) * rN); disk.add(np);
    var pb = new PB(R);
    for (var i = 0; i < 500; i++) { var d = new T.Vector3(gauss(R), gauss(R) * 0.5, gauss(R)).multiplyScalar(6 + R() * 6); pb.add(d.x, d.y, d.z, pick(R, [C("#ff4f9a"), C("#ff7ab8"), C("#ffa0d0")]), 0.6 + R() * 0.4, 2.4 + R() * 3); }
    np.add(pb.build(ctx, { opacity: 0.9, fall: 4, twinkle: 0.2 }));
    var ns = sprite("core", 0xff5aa8, 60, 0.9); np.add(ns);
    ctx.ticks.push(function (t, dt) { disk.rotation.y += dt * 0.01; ns.material.opacity = 0.8 + 0.15 * Math.sin(t * 1.5); });
    addBeacon(ctx, 0xa8c0ff, 0.9);
    return { view: 560, radius: 280 };
  };

  MAKERS.sombrero = function (ctx) {
    var face = ctx.face, R = rng(2424);
    var tilt = new T.Group(); tilt.rotation.x = 0.17; face.add(tilt);
    var spin = new T.Group(); tilt.add(spin);
    var bul = new PB(R), glow = new PB(R), dsk = new PB(R), dust = new PB(R);
    var bc = [C("#ffe0a0"), C("#fff0d0"), C("#ffd080"), C("#fff8e8"), C("#ffe8b8")];
    for (var i = 0; i < 5000; i++) {
      var x = gauss(R) * 50, y = gauss(R) * 36, z = gauss(R) * 50, rr = Math.sqrt(x * x + y * y * 1.8 + z * z);
      bul.add(x, y, z, pick(R, bc), (0.4 + R() * 0.5) * (rr < 30 ? 0.6 : 1), 2.2 + R() * 2);
    }
    for (i = 0; i < 1800; i++) bul.add(gauss(R) * 105, gauss(R) * 75, gauss(R) * 105, pick(R, bc), 0.25 + R() * 0.35, 1.8 + R() * 1.6);
    // smooth glowing bulge haze
    for (i = 0; i < 1500; i++) {
      x = gauss(R) * 60; y = gauss(R) * 44; z = gauss(R) * 60;
      glow.add(x, y, z, pick(R, [C("#ffd890"), C("#ffe8b0"), C("#ffc870")]), 0.5 + R() * 0.5, 30 + R() * 30);
    }
    var dc = [C("#fff0d8"), C("#ffe0b0"), C("#d8e4ff"), C("#ffffff")];
    for (i = 0; i < 4200; i++) {
      var a = R() * TAU, r = 60 + Math.pow(R(), 0.9) * 150;
      dsk.add(Math.cos(a) * r, gauss(R) * 2.2, Math.sin(a) * r, pick(R, dc), (0.45 + R() * 0.5) * (1 - 0.3 * (r - 60) / 150), 2.2 + R() * 1.8);
    }
    // bright outer rim just outside the dust lane
    for (i = 0; i < 3000; i++) {
      a = R() * TAU; r = 200 + gauss(R) * 7;
      dsk.add(Math.cos(a) * r, gauss(R) * 1.6, Math.sin(a) * r, pick(R, [C("#fff4e0"), C("#ffe4c0"), C("#e8eeff")]), 0.5 + R() * 0.3, 2.4 + R() * 2);
    }
    for (i = 0; i < 500; i++) {
      a = R() * TAU; r = 200 + gauss(R) * 10;
      glow.add(Math.cos(a) * r, gauss(R) * 2, Math.sin(a) * r, C("#ffe0b8"), 0.6, 16 + R() * 10);
    }
    // dark dust lane: only on the near half, so it crosses in front of the glowing bulge
    var dcol = [C("#060201"), C("#0a0402"), C("#040100")];
    for (i = 0; i < 3000; i++) {
      a = (R() * 1.1 - 0.05) * Math.PI; r = 180 + gauss(R) * 6;
      dust.add(Math.cos(a) * r, gauss(R) * 1.2, Math.sin(a) * r, pick(R, dcol), 1, 8 + R() * 7);
    }
    face.add(sprite("soft", 0xffd890, [600, 380], 0.38));
    face.add(sprite("core", 0xfff0c8, [280, 200], 0.9));
    tilt.add(glow.build(ctx, { opacity: 0.05, fall: 3 }));
    tilt.add(bul.build(ctx, { fall: 6, core: 0.5, twinkle: 0.12 }));
    spin.add(dsk.build(ctx, { fall: 6, core: 0.4, twinkle: 0.15 }));
    spin.add(glowPlane(0xffe0b0, 450, 0.3, 1, 1));
    tilt.add(dust.build(ctx, { normal: true, opacity: 0.75, fall: 2.2, renderOrder: 1 }));
    ctx.ticks.push(function (t, dt) { spin.rotation.y += dt * 0.01; });
    addBeacon(ctx, 0xffe0a8, 0.9);
    return { view: 540, radius: 260 };
  };

  MAKERS.generic = function (ctx) {
    var star = makeStar(ctx, 10, ["#f0c060", "#fff2c0", "#ffffff"], 0xfff0c0, { halo: 9 });
    ctx.root.add(star);
    ctx.root.add(sprite("spikes", 0xfff4d0, 150, 0.5));
    addBeacon(ctx, 0xfff0c0, 1);
    return { view: 70, radius: 15 };
  };

  // 2 = full billboard (yaw + pitch), 1 = yaw only
  var FACING = { pleiades: 2, orion: 2, ring: 2, crab: 2, eagle: 2, galcenter: 1, milkyway: 1, lmc: 1, andromeda: 1, whirlpool: 1,
    horsehead: 2, helix: 2, triangulum: 1, sombrero: 2 };

  function make(id) {
    var key = MAKERS[id] ? id : "generic";
    var root = new T.Group(); root.name = "deepspace-" + id;
    var ctx = newCtx(root);
    if (FACING[key]) { ctx.face = new T.Group(); ctx.face.rotation.order = "YXZ"; ctx.fullFace = FACING[key] === 2; root.add(ctx.face); }
    var info = MAKERS[key](ctx);
    ctx.view = info.view;
    root.userData.view = info.view;
    root.userData.radius = info.radius;
    root.userData.deepId = id;
    root.userData.faceCamera = !!ctx.face;
    root.userData.deep = ctx;
    return root;
  }

  function update(obj, dt, camera) {
    var ctx = obj && obj.userData && obj.userData.deep;
    if (!ctx) return;
    dt = Math.min(Math.max(dt || 0, 0), 0.1);
    ctx.time.value += dt;
    var t = ctx.time.value;
    for (var i = 0; i < ctx.ticks.length; i++) ctx.ticks[i](t, dt);
    if (camera) {
      obj.updateMatrixWorld();
      _v3.copy(camera.position);
      if (camera.parent) camera.getWorldPosition(_v3);
      obj.worldToLocal(_v3);
      var dist = _v3.length();
      if (ctx.face && obj.userData.faceCamera !== false) {
        ctx.face.rotation.y = Math.atan2(_v3.x, _v3.z);
        if (ctx.fullFace) ctx.face.rotation.x = -Math.atan2(_v3.y, Math.sqrt(_v3.x * _v3.x + _v3.z * _v3.z));
      }
      if (ctx.beacon) {
        var b = ctx.beacon;
        var s = Math.max(ctx.view * 0.4, dist * 0.09);
        b.scale.set(s, s, 1);
        b.material.opacity = b.userData.baseOpacity * clamp((dist - ctx.view * 1.8) / (ctx.view * 3), 0, 1);
        b.visible = b.material.opacity > 0.003;
      }
    }
  }

  function dispose(obj) {
    if (!obj) return;
    obj.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
      var mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      mats.forEach(function (m) {
        if (m.map && !m.map.deepShared) m.map.dispose();
        if (m.uniforms) for (var k in m.uniforms) { var v = m.uniforms[k].value; if (v && v.isTexture && !v.deepShared) v.dispose(); }
        m.dispose();
      });
    });
    if (obj.parent) obj.parent.remove(obj);
    if (obj.userData) obj.userData.deep = null;
  }

  window.DeepSpace = {
    make: make, update: update, dispose: dispose,
    ids: ["proxima", "sirius", "vega", "polaris", "betelgeuse", "pleiades", "orion", "ring", "crab", "eagle", "galcenter", "milkyway", "lmc", "andromeda", "whirlpool",
      "alphacen", "trappist1", "rigel", "horsehead", "helix", "omegacen", "cygnusx1", "triangulum", "sombrero"]
  };
})();
