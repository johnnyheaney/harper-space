/* Harper's Space Adventure: core game (scene, travel, crew, UI). Content comes from data.js (window.GAME_DATA). */
(function () {
"use strict";
const $ = (s) => document.querySelector(s);
const C_KMS = 299792.458;
const AU_LIGHT_S = 499.005;
const AU_KM = 149597870.7;
const YEAR_S = 31557600;
const GD = window.GAME_DATA || { places: {} };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const num = (n) => Math.round(n).toLocaleString("en-GB");

/* =============== places: engine layout merged with content =============== */
const ENGINE = {
  sun: { grp: "solar", au: 0, r: 12, dist: 0, ang: 0, view: 48, color: "#ffc83d", tex: "sun" },
  mercury: { grp: "solar", au: 0.387, r: 1.0, dist: 30, ang: 10, view: 5, color: "#a8a29a", tex: "mercury", period: 0.241 },
  venus: { grp: "solar", au: 0.723, r: 1.8, dist: 42, ang: 62, view: 8, color: "#f0cf8a", tex: "venus", period: 0.615 },
  earth: { grp: "solar", au: 1, r: 2.0, dist: 56, ang: 112, view: 10, color: "#3d8ee0", tex: "earth", period: 1 },
  moon: { grp: "moon", parent: "earth", km: 384400, r: 0.55, md: 4.6, spd: 0.12, view: 3, color: "#c9c9c9", tex: "moon" },
  mars: { grp: "solar", au: 1.524, r: 1.4, dist: 70, ang: 165, view: 7, color: "#e0662d", tex: "mars", period: 1.881 },
  phobos: { grp: "moon", parent: "mars", km: 9376, r: 0.24, md: 2.4, spd: 0.55, view: 1.4, color: "#8a7a6a", tex: "phobos", lumpy: 1.35 },
  deimos: { grp: "moon", parent: "mars", km: 23460, r: 0.17, md: 3.4, spd: 0.3, view: 1.2, color: "#a39484", tex: "deimos", lumpy: 1.25 },
  belt: { grp: "solar", au: 2.77, r: 0.8, dist: 88, ang: 212, view: 7, color: "#8d8a86", tex: "ceres", period: 4.6 },
  ceres: { grp: "solar", au: 2.77, r: 0.6, dist: 91, ang: 186, view: 4, color: "#9a958e", tex: "ceres", period: 4.6 },
  myplanet: { grp: "solar", au: 3.6, r: 1.6, dist: 104, ang: 300, view: 8, color: "#ff8ad8", tex: "moon", period: 6.8, custom: true },
  jupiter: { grp: "solar", au: 5.203, r: 6.5, dist: 122, ang: 258, view: 30, color: "#d9a066", tex: "jupiter", period: 11.86 },
  io: { grp: "moon", parent: "jupiter", km: 421700, r: 0.45, md: 9.5, spd: 0.3, view: 2.6, color: "#f0d860", tex: "io" },
  europa: { grp: "moon", parent: "jupiter", km: 671100, r: 0.4, md: 11.8, spd: 0.22, view: 2.4, color: "#efe6d6", tex: "europa" },
  ganymede: { grp: "moon", parent: "jupiter", km: 1070400, r: 0.65, md: 14.6, spd: 0.15, view: 3.4, color: "#9b9083", tex: "ganymede" },
  callisto: { grp: "moon", parent: "jupiter", km: 1882700, r: 0.6, md: 18, spd: 0.1, view: 3.2, color: "#6e655b", tex: "callisto" },
  saturn: { grp: "solar", au: 9.537, r: 5.5, dist: 165, ang: 305, view: 34, color: "#ecd28f", tex: "saturn", period: 29.46 },
  mimas: { grp: "moon", parent: "saturn", km: 185540, r: 0.3, md: 14.2, spd: 0.26, view: 1.8, color: "#d8d8d8", tex: "mimas" },
  enceladus: { grp: "moon", parent: "saturn", km: 238000, r: 0.35, md: 14.8, spd: 0.2, view: 2, color: "#f4f8ff", tex: "enceladus" },
  titan: { grp: "moon", parent: "saturn", km: 1221870, r: 0.65, md: 17.5, spd: 0.1, view: 3.4, color: "#e2a54a", tex: "titan" },
  uranus: { grp: "solar", au: 19.19, r: 3.4, dist: 205, ang: 350, view: 15, color: "#9fe3e8", tex: "uranus", tilt: 1.71, period: 84.0 },
  miranda: { grp: "moon", parent: "uranus", km: 129390, r: 0.32, md: 5.6, spd: 0.3, view: 1.8, color: "#b9b4ad", tex: "miranda" },
  neptune: { grp: "solar", au: 30.07, r: 3.3, dist: 238, ang: 35, view: 15, color: "#3f6fe0", tex: "neptune", period: 164.8 },
  triton: { grp: "moon", parent: "neptune", km: 354800, r: 0.55, md: 7, spd: -0.12, view: 2.8, color: "#e6d6d0", tex: "triton" },
  pluto: { grp: "solar", au: 39.48, r: 1.0, dist: 270, ang: 88, view: 6.5, color: "#c99e78", tex: "pluto", period: 248 },
  charon: { grp: "moon", parent: "pluto", km: 19591, r: 0.5, md: 3.0, spd: 0.25, view: 2.6, color: "#a9a39c", tex: "charon" },
  kuiper: { grp: "solar", au: 44.6, r: 0.5, dist: 292, ang: 132, view: 4, color: "#b06a4a", tex: "arrokoth", period: 298 },
  halley: { grp: "solar", au: 35, r: 0.35, dist: 252, ang: 160, view: 4, color: "#bfe3ff", tex: "comet", period: 76, comet: true, lumpy: 1.6 },
  haumea: { grp: "solar", au: 43.1, r: 0.75, dist: 282, ang: 205, view: 4.5, color: "#e9ecf2", tex: "haumea", period: 284, egg: true },
  makemake: { grp: "solar", au: 45.4, r: 0.8, dist: 300, ang: 18, view: 4.5, color: "#c98a5a", tex: "makemake", period: 306 },
  eris: { grp: "solar", au: 67.7, r: 0.95, dist: 320, ang: 292, view: 5.5, color: "#e6e6ea", tex: "eris", period: 559 },
  iss: { grp: "craft", parent: "earth", km: 410, md: 2.6, spd: 0.9, view: 1.2, color: "#dfe6f0", model: "iss" },
  hubble: { grp: "craft", parent: "earth", km: 530, md: 2.9, spd: -0.7, view: 1.0, color: "#c9ced8", model: "hubble" },
  jwst: { grp: "craft", parent: "earth", km: 1500000, md: 9, l2: true, view: 2.2, color: "#f3c24a", model: "jwst" },
  voyager1: { grp: "craft", dist: 335, ang: 250, y: 70, view: 2, color: "#e8e8e8", model: "voyager", km: 25.4e9 },
  voyager2: { grp: "craft", dist: 328, ang: 205, y: -62, view: 2, color: "#e8e8e8", model: "voyager", km: 21.2e9 },
  newhorizons: { grp: "craft", dist: 308, ang: 96, y: 22, view: 2, color: "#f3c24a", model: "newhorizons", km: 9.2e9 },
  parker: { grp: "craft", parent: "sun", km: 6.2e6, md: 17, spd: 0.6, view: 1.6, color: "#f4f1e8", model: "parker" }
};
const isFar = (id) => P[id] && P[id].grp === "craft" && !P[id].parent; // spacecraft far out in deep space, like the Voyagers
const DEEP_IDS = ["proxima", "alphacen", "sirius", "vega", "trappist1", "polaris", "betelgeuse", "rigel", "pleiades", "helix", "orion", "horsehead", "ring", "crab", "eagle", "cygnusx1", "omegacen", "galcenter", "lmc", "milkyway", "andromeda", "triangulum", "whirlpool", "sombrero"];
const DEEP_COLORS = { proxima: "#ff7a4a", sirius: "#cfe6ff", vega: "#d7ecff", polaris: "#fff1c4", betelgeuse: "#ff5a2a", pleiades: "#9fd0ff", orion: "#ff7fbf", ring: "#5fe0c8", crab: "#ff9a5a", eagle: "#c7d77a", galcenter: "#ff9a3d", lmc: "#d6c7ff", milkyway: "#ffe7a8", andromeda: "#cdb8ff", whirlpool: "#a8c8ff" };
Object.assign(DEEP_COLORS, { alphacen: "#ffe9a8", trappist1: "#ff6a4a", rigel: "#bcd8ff", horsehead: "#ff7fa0", helix: "#6fe0d0", omegacen: "#ffe2a0", cygnusx1: "#9fc0ff", triangulum: "#b8d0ff", sombrero: "#ffe7b8" });
const DEEP_FALLBACK = { // used only if data.js is missing a value
  alphacen: [4.37, 219.9, -60.8, "star"], trappist1: [40.7, 346.6, -5.04, "star"], rigel: [860, 78.6, -8.2, "star"], horsehead: [1375, 85.25, -2.46, "nebula"], helix: [655, 337.4, -20.8, "nebula"],
  omegacen: [17000, 201.7, -47.5, "cluster"], cygnusx1: [7200, 299.6, 35.2, "blackhole"], triangulum: [2730000, 23.46, 30.66, "galaxy"], sombrero: [31100000, 190.0, -11.6, "galaxy"],
  proxima: [4.24, 217.4, -62.7, "star"], sirius: [8.6, 101.3, -16.7, "star"], vega: [25, 279.2, 38.8, "star"], polaris: [433, 37.95, 89.26, "star"],
  betelgeuse: [550, 88.8, 7.4, "star"], pleiades: [444, 56.75, 24.1, "cluster"], orion: [1344, 83.8, -5.4, "nebula"], ring: [2600, 283.4, 33.0, "nebula"],
  crab: [6500, 83.6, 22.0, "nebula"], eagle: [7000, 274.7, -13.8, "nebula"], galcenter: [26700, 266.4, -29.0, "blackhole"], lmc: [160000, 80.9, -69.8, "galaxy"],
  milkyway: [100000, 192.9, 27.1, "galaxy"], andromeda: [2500000, 10.7, 41.3, "galaxy"], whirlpool: [31000000, 202.5, 47.2, "galaxy"]
};
// Star prices: the further and more spectacular, the more it costs. ULTIMATE opens the whole game.
const UNLOCK = { proxima: 2, alphacen: 3, sirius: 4, vega: 6, polaris: 8, trappist1: 9, pleiades: 11, betelgeuse: 14, rigel: 15, orion: 18, helix: 20, ring: 23, horsehead: 26, crab: 29, eagle: 36, cygnusx1: 40, galcenter: 44, omegacen: 48, lmc: 54, milkyway: 66, andromeda: 80, triangulum: 88, sombrero: 95, whirlpool: 100 };
const ULTIMATE = 120;
const VIEW_ELEV = { milkyway: 1.2, whirlpool: 1.15, ring: 1.1 };

const P = {}; const ORDER = [];
Object.keys(ENGINE).concat(DEEP_IDS).forEach((id) => {
  const e = ENGINE[id] || { grp: "deep" }, c = GD.places[id] || {};
  const p = Object.assign({ id, name: id, kind: "", facts: [], more: [], quiz: [], react: [], photo: "", land: null }, e, c);
  p.grp = e.grp || "deep";
  if (p.grp === "deep") {
    const fb = DEEP_FALLBACK[id];
    p.ly = c.ly || fb[0]; p.ra = c.ra != null ? c.ra : fb[1]; p.dec = c.dec != null ? c.dec : fb[2]; p.type = c.type || fb[3];
    p.color = DEEP_COLORS[id] || "#fff";
  }
  if (p.grp === "craft" && !p.parent) { p.km = c.km || e.km; p.au = p.km / AU_KM; }
  if (!p.facts.length) p.facts = ["(Facts are on their way!)"];
  P[id] = p; ORDER.push(id);
});
const sysOf = (p) => (p.parent ? P[p.parent] : p);
const moonsOf = (id) => ORDER.filter((k) => P[k].parent === id && P[k].grp === "moon");
const craftOf = (id) => ORDER.filter((k) => P[k].parent === id && P[k].grp === "craft");
function deepVec(p) { const ra = p.ra * Math.PI / 180, dec = p.dec * Math.PI / 180; return new THREE.Vector3(Math.cos(dec) * Math.cos(ra), Math.sin(dec), Math.cos(dec) * Math.sin(ra)); }
function lightSeconds(a, b) {
  if (a === b) return 0;
  if (a.grp === "deep" || b.grp === "deep") {
    const va = a.grp === "deep" ? deepVec(a).multiplyScalar(a.ly) : new THREE.Vector3();
    const vb = b.grp === "deep" ? deepVec(b).multiplyScalar(b.ly) : new THREE.Vector3();
    return va.distanceTo(vb) * YEAR_S;
  }
  const A = sysOf(a), B = sysOf(b);
  if (A === B) { const ka = a.parent ? a.km : 0, kb = b.parent ? b.km : 0; return Math.abs(ka - kb) / C_KMS; }
  return Math.abs(A.au - B.au) * AU_LIGHT_S;
}
function fmtDur(s) {
  if (s < 1) return s.toFixed(3).replace(/0+$/, "") + " seconds";
  if (s < 10) return s.toFixed(1) + " seconds";
  if (s < 60) return Math.round(s) + " seconds";
  if (s < 3600) { const m = Math.floor(s / 60), r = Math.round(s % 60); return m + " min" + (r ? " " + r + " s" : ""); }
  if (s < 172800) { const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return h + " h" + (m ? " " + m + " min" : ""); }
  if (s < 2 * YEAR_S) return num(s / 86400) + " days";
  const y = s / YEAR_S;
  if (y < 1e6) return num(y < 20 ? Math.round(y * 10) / 10 : y) + " years";
  return (Math.round(y / 1e5) / 10).toLocaleString("en-GB") + " million years";
}
function fmtClock(s) {
  s = Math.max(0, s);
  if (s < 172800) { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(x).padStart(2, "0"); }
  const y = s / YEAR_S;
  if (y < 2) return num(s / 86400) + " days";
  if (y < 1000) { const yy = Math.floor(y), d = Math.floor((y - yy) * 365.25); return yy + " years " + d + " days"; }
  if (y < 1e6) return num(y) + " years";
  return (y / 1e6).toFixed(2) + " million years";
}
function dotStyle(p) { return "background: radial-gradient(circle at 35% 30%, #fff8, " + p.color + " 45%, " + p.color + ")"; }

/* =============== saved progress =============== */
const KEY = "harper-space-v2";
let save = { visited: {}, stars: {}, gameStars: {}, muted: false, view: "pov", crew: null, rocket: null, voice: "", crewVoices: true, unlockAll: false, player: "harper", profiles: {} };
try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s) save = Object.assign(save, s); } catch (e) {}
if (!save.voiceV3) { save.voice = ""; save.voiceV3 = true; } // move everyone onto the recorded natural voices once
// Each player (Harper, Oda) has her own stamps, stars and rocket; the crew looks and settings are shared.
const PROFILE_FIELDS = ["visited", "stars", "gameStars", "rocket", "view", "myPlanet"];
const profileOf = () => ({ visited: save.visited, stars: save.stars, gameStars: save.gameStars || {}, rocket: save.rocket, view: save.view, myPlanet: save.myPlanet || null });
if (!save.economyV4) { save.bonus = 0; save.gameStars = {}; save.economyV4 = true; } // arcade stars are now earned once per star level
if (!save.profiles) save.profiles = {};
if (!save.profiles.harper) save.profiles.harper = profileOf();
var cloud = null, cloudTimer = 0, cloudPhotos = "";
function persist() { save.profiles[save.player || "harper"] = profileOf(); save.savedAt = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} scheduleCloud(); }
function loadProfile(id) {
  save.player = id; const pr = save.profiles[id] || {};
  save.visited = pr.visited || {}; save.stars = pr.stars || {}; save.gameStars = pr.gameStars || {}; save.rocket = pr.rocket || null; save.view = pr.view || "pov"; save.myPlanet = pr.myPlanet || null;
}
loadProfile(save.player || "harper");
const captainId = () => (save.player === "oda" ? "oda" : "harper");
const starCount = () => Object.keys(save.stars).length + Object.values(save.gameStars || {}).reduce((a, b) => a + b, 0);
const isMaster = () => starCount() >= ULTIMATE;
const isOpen = (need) => !need || save.unlockAll || isMaster() || starCount() >= need;
const isLocked = (id) => (id === "myplanet" ? !(storyDone() || save.unlockAll || isMaster()) : !isOpen(UNLOCK[id]));

/* =============== crew looks and drawing =============== */
const SKINS = ["#fde4cf", "#f6d2b3", "#e8b894", "#c98e66", "#9c6644", "#6b4429"];
const HAIRS = ["#2b1a10", "#4a2c1d", "#7b4a2a", "#a0522d", "#d9a05b", "#f2d98d", "#c0392b", "#9aa3ad", "#ff6fa8", "#5fe0c8"];
const SHIRTS = ["#ff6fa8", "#3f8fe0", "#5fe0c8", "#ffd166", "#ff7a45", "#9b5de5", "#2ecc71", "#ffffff", "#e63946", "#1d3557"];
const STYLES = [["short", "Short"], ["long", "Long"], ["pigtails", "Pigtails"], ["bun", "Bun"], ["curly", "Curly"], ["spiky", "Spiky"], ["bald", "Bald"]];
const HATS = [["none", "None", 0], ["cap", "Cap", 0], ["bow", "Bow", 4], ["party", "Party hat", 13], ["helmet", "Space helmet", 21], ["wizard", "Wizard hat", 38], ["crown", "Crown", 55], ["universe", "Universe crown", ULTIMATE]];
const GLASSES = [["none", "None", 0], ["round", "Round", 0], ["star", "Star", 8]];
const SUITS = ["#eef2f8", "#ff7a45", "#3f8fe0", "#ff6fa8", "#5fe0c8", "#ffd166", "#9b5de5", "#2b2f3a"];
const VISORS = ["#23306e", "#0f4c5c", "#5a189a", "#c9962a", "#1d3557"];
const COATS = [["#7a3e1d", "Brown"], ["#222222", "Black"], ["#5a2a1a", "Liver"], ["#c98a3d", "Golden"]];
const PATCHES = [["left", "Left eye"], ["right", "Right eye"], ["both", "Both"], ["none", "None"]];
const DEFAULT_CREW = {
  harper: { name: "Harper", type: "kid", skin: "#f6d2b3", hair: "#7b4a2a", style: "long", shirt: "#ff6fa8", glasses: "none", hat: "none", beard: false, clip: true },
  dad: { name: "Dad", type: "adult", skin: "#f6d2b3", hair: "#5a3a22", style: "short", shirt: "#3f8fe0", glasses: "none", hat: "none", beard: true },
  mum: { name: "Mum", type: "adult", skin: "#f6d2b3", hair: "#4a2c1d", style: "long", shirt: "#5fe0c8", glasses: "none", hat: "none", beard: false },
  oda: { name: "Oda", type: "kid", small: true, skin: "#f6d2b3", hair: "#e9c46a", style: "pigtails", shirt: "#ffd166", glasses: "none", hat: "none", beard: false },
  joules: { name: "Joules", type: "dog", coat: "#7a3e1d", patch: "left", collar: "#3f8fe0", tongue: false, hat: "none" },
  maggie: { name: "Maggie", type: "dog", coat: "#7a3e1d", patch: "right", collar: "#ff6fa8", tongue: true, hat: "none" },
  leo: { name: "Leo", type: "astronaut", skin: "#e3b08a", hair: "#3b2414", suit: "#eef2f8", visor: "#23306e", badge: "#3f8fe0", glasses: "none", hat: "none", beard: false }
};
const CREW_IDS = ["harper", "dad", "mum", "oda", "joules", "maggie"];
const crew = {};
CREW_IDS.concat(["leo"]).forEach((id) => (crew[id] = Object.assign({}, DEFAULT_CREW[id], (save.crew || {})[id] || {})));
const nameOf = (who) => (crew[who] ? crew[who].name : who);

// Shapes are drawn both as SVG (portholes) and onto canvas (the spacesuit sprite for landing)
function S(k, o) { return Object.assign({ k }, o); }
function hatShapes(hat, cx, top, r) {
  const sh = [];
  if (hat === "cap") { sh.push(S("p", { d: `M${cx - r - 1} ${top + 7} Q${cx} ${top - 9} ${cx + r + 1} ${top + 7}Z`, f: "#e63946" }), S("p", { d: `M${cx + r - 6} ${top + 6} Q${cx + r + 9} ${top + 4} ${cx + r + 11} ${top + 9} L${cx + r - 6} ${top + 9}Z`, f: "#b02a35" }), S("c", { cx, cy: top - 1, r: 2, f: "#ffd166" })); }
  if (hat === "bow") { const x = cx + r * 0.65, y = top + 4; sh.push(S("p", { d: `M${x} ${y} l-8 -6 v12z`, f: "#ff6fa8" }), S("p", { d: `M${x} ${y} l8 -6 v12z`, f: "#ff6fa8" }), S("c", { cx: x, cy: y, r: 2.6, f: "#d6457f" })); }
  if (hat === "crown") sh.push(S("p", { d: `M${cx - 11} ${top + 5} L${cx - 13} ${top - 9} L${cx - 6} ${top - 2} L${cx} ${top - 12} L${cx + 6} ${top - 2} L${cx + 13} ${top - 9} L${cx + 11} ${top + 5}Z`, f: "#ffd166", s: "#c9962a", sw: 1.2 }), S("c", { cx, cy: top - 1, r: 1.8, f: "#e63946" }));
  if (hat === "wizard") sh.push(S("p", { d: `M${cx - 15} ${top + 6} Q${cx} ${top + 1} ${cx + 15} ${top + 6} L${cx + 3} ${top - 22} Z`, f: "#6a4cc9" }), S("p", { d: `M${cx - 2} ${top - 6} l1.5 3 3 .4 -2.2 2 .6 3 -2.9 -1.5 -2.9 1.5 .6 -3 -2.2 -2 3 -.4z`, f: "#ffd166" }));
  if (hat === "universe") { sh.push(S("p", { d: `M${cx - 12} ${top + 5} L${cx - 14} ${top - 10} L${cx - 7} ${top - 3} L${cx} ${top - 14} L${cx + 7} ${top - 3} L${cx + 14} ${top - 10} L${cx + 12} ${top + 5}Z`, f: "#b26bff", s: "#ffd166", sw: 1.4 })); [[-14, -10], [0, -14], [14, -10]].forEach(([dx, dy]) => sh.push(S("c", { cx: cx + dx, cy: top + dy, r: 2.6, f: "#ffd166" }))); sh.push(S("c", { cx, cy: top - 1, r: 2.2, f: "#5fe0c8" })); }
  if (hat === "party") sh.push(S("p", { d: `M${cx - 10} ${top + 5} L${cx + 10} ${top + 5} L${cx} ${top - 20}Z`, f: "#5fe0c8" }), S("p", { d: `M${cx - 6} ${top - 3} L${cx + 6} ${top - 3} L${cx + 4} ${top - 8} L${cx - 4} ${top - 8}Z`, f: "#ff6fa8" }), S("c", { cx, cy: top - 21, r: 3, f: "#ffd166" }));
  return sh;
}
function personShapes(c, opt) {
  const cx = 32, cy = c.small ? 34 : 31, r = c.small ? 13 : 15, sh = [];
  const H = c.hair;
  if (c.style === "long") sh.push(S("p", { d: `M${cx - r - 3} ${cy} Q${cx} ${cy - r - 12} ${cx + r + 3} ${cy} L${cx + r + 4} ${cy + 22} L${cx - r - 4} ${cy + 22}Z`, f: H }));
  if (c.style === "pigtails") sh.push(S("c", { cx: cx - r - 3, cy: cy + 2, r: 6, f: H }), S("c", { cx: cx + r + 3, cy: cy + 2, r: 6, f: H }));
  if (c.style === "curly") for (let i = 0; i < 11; i++) { const a = Math.PI * (0.95 + i * 0.11); sh.push(S("c", { cx: cx + Math.cos(a) * (r + 1), cy: cy + Math.sin(a) * (r + 1) + 2, r: 5.2, f: H })); }
  if (c.style === "bun") sh.push(S("c", { cx, cy: cy - r - 3, r: 6.5, f: H }));
  if (!opt || !opt.noBody) sh.push(S("p", { d: `M12 64 Q${cx} ${cy + r - 2} 52 64Z`, f: c.shirt }));
  sh.push(S("c", { cx, cy, r, f: c.skin }));
  const ex = r * 0.38;
  sh.push(S("c", { cx: cx - ex, cy: cy + 1, r: 2.2, f: "#2a1a3a" }), S("c", { cx: cx + ex, cy: cy + 1, r: 2.2, f: "#2a1a3a" }), S("c", { cx: cx - ex + 0.7, cy, r: 0.7, f: "#fff" }), S("c", { cx: cx + ex + 0.7, cy, r: 0.7, f: "#fff" }));
  sh.push(S("c", { cx: cx - r * 0.6, cy: cy + 5, r: 2.6, f: "#ff8fa3", o: 0.55 }), S("c", { cx: cx + r * 0.6, cy: cy + 5, r: 2.6, f: "#ff8fa3", o: 0.55 }));
  if (c.beard) sh.push(S("p", { d: `M${cx - r + 3} ${cy + 4} Q${cx} ${cy + r + 6} ${cx + r - 3} ${cy + 4} Q${cx} ${cy + r - 2} ${cx - r + 3} ${cy + 4}Z`, f: H, o: 0.9 }));
  sh.push(S("p", { d: `M${cx - 4} ${cy + 6} Q${cx} ${cy + 10} ${cx + 4} ${cy + 6}`, s: "#7a2a3a", sw: 1.6, f: "none" }));
  if (c.style === "long" || c.style === "bun" || c.style === "curly") sh.push(S("p", { d: `M${cx - r} ${cy - 2} Q${cx} ${cy - r - 9} ${cx + r} ${cy - 2} Q${cx + 4} ${cy - r + 2} ${cx - r} ${cy - 2}Z`, f: H }));
  if (c.style === "short") sh.push(S("p", { d: `M${cx - r} ${cy - 1} Q${cx - r} ${cy - r - 6} ${cx} ${cy - r - 3} Q${cx + r} ${cy - r - 6} ${cx + r} ${cy - 1} Q${cx} ${cy - r + 4} ${cx - r} ${cy - 1}Z`, f: H }));
  if (c.style === "pigtails") sh.push(S("p", { d: `M${cx - r} ${cy - 1} Q${cx} ${cy - r - 8} ${cx + r} ${cy - 1} Q${cx} ${cy - r + 3} ${cx - r} ${cy - 1}Z`, f: H }));
  if (c.style === "spiky") sh.push(S("p", { d: `M${cx - r} ${cy - 1} L${cx - r + 1} ${cy - r - 4} L${cx - 6} ${cy - r + 1} L${cx - 3} ${cy - r - 7} L${cx + 1} ${cy - r} L${cx + 5} ${cy - r - 7} L${cx + 7} ${cy - r + 1} L${cx + r - 1} ${cy - r - 4} L${cx + r} ${cy - 1} Q${cx} ${cy - r + 4} ${cx - r} ${cy - 1}Z`, f: H }));
  if (c.glasses === "round") sh.push(S("c", { cx: cx - ex, cy: cy + 1, r: 4.4, f: "none", s: "#231a4f", sw: 1.5 }), S("c", { cx: cx + ex, cy: cy + 1, r: 4.4, f: "none", s: "#231a4f", sw: 1.5 }), S("p", { d: `M${cx - ex + 4.4} ${cy + 1} L${cx + ex - 4.4} ${cy + 1}`, s: "#231a4f", sw: 1.5, f: "none" }));
  if (c.glasses === "star") [-1, 1].forEach((sgn) => { const x = cx + sgn * ex, y = cy + 1; sh.push(S("p", { d: `M${x} ${y - 6} l1.8 3.8 4.2 .5 -3.1 2.9 .8 4.1 -3.7 -2 -3.7 2 .8 -4.1 -3.1 -2.9 4.2 -.5z`, f: "rgba(255,111,168,.55)", s: "#ff6fa8", sw: 1.2 })); });
  if (c.clip && c.hat === "none") sh.push(S("p", { d: `M${cx + r - 2} ${cy - r + 1} l2 4 4 .5 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -.5z`, f: "#ffd166" }));
  if (c.hat === "helmet") sh.push(S("c", { cx, cy: cy + 1, r: r + 7, f: "rgba(180,220,255,.18)", s: "#dfe6f0", sw: 2.4 }), S("p", { d: `M${cx - r} ${cy - 8} Q${cx - r + 4} ${cy - r - 2} ${cx - 3} ${cy - r - 4}`, s: "rgba(255,255,255,.75)", sw: 2.2, f: "none" }));
  else sh.push(...hatShapes(c.hat, cx, cy - r + (c.style === "spiky" ? -3 : 0), r));
  return sh;
}
function dogShapes(c) {
  const brown = c.coat, sh = [];
  sh.push(S("p", { d: "M14 64 Q32 44 50 64Z", f: "#f4efe8" }));
  sh.push(S("p", { d: "M19 56 Q32 62 45 56 L45 60 Q32 66 19 60Z", f: c.collar }), S("c", { cx: 32, cy: 62, r: 2.6, f: "#ffd166" }));
  sh.push(S("e", { cx: 17, cy: 38, rx: 7, ry: 14, rot: 12, f: brown }), S("e", { cx: 47, cy: 38, rx: 7, ry: 14, rot: -12, f: brown }));
  sh.push(S("e", { cx: 32, cy: 33, rx: 14, ry: 16, f: "#fbf7f2" }), S("p", { d: "M20 24 Q32 12 44 24 Q38 20 32 22 Q26 20 20 24Z", f: brown }));
  if (c.patch === "left" || c.patch === "both") sh.push(S("e", { cx: 25, cy: 29, rx: 7, ry: 6, f: brown }));
  if (c.patch === "right" || c.patch === "both") sh.push(S("e", { cx: 39, cy: 29, rx: 7, ry: 6, f: brown }));
  sh.push(S("e", { cx: 32, cy: 42, rx: 8, ry: 6, f: "#fff" }), S("c", { cx: 27, cy: 44, r: 0.9, f: brown }), S("c", { cx: 37, cy: 44, r: 0.9, f: brown }), S("c", { cx: 29, cy: 46, r: 0.9, f: brown }));
  sh.push(S("c", { cx: 25.5, cy: 30, r: 2.6, f: "#2a1a10" }), S("c", { cx: 38.5, cy: 30, r: 2.6, f: "#2a1a10" }), S("c", { cx: 26.3, cy: 29.2, r: 0.8, f: "#fff" }), S("c", { cx: 39.3, cy: 29.2, r: 0.8, f: "#fff" }));
  sh.push(S("e", { cx: 32, cy: 39, rx: 3.4, ry: 2.4, f: "#231512" }));
  sh.push(c.tongue ? S("p", { d: "M30 46 Q32 52 34 46Z", f: "#ff7c9a" }) : S("p", { d: "M28.5 44.5 Q32 47 35.5 44.5", s: "#231512", sw: 1.3, f: "none" }));
  if (c.hat === "helmet") sh.push(S("c", { cx: 32, cy: 34, r: 24, f: "rgba(180,220,255,.16)", s: "#dfe6f0", sw: 2.4 }));
  else sh.push(...hatShapes(c.hat, 32, 19, 13));
  return sh;
}
function leoShapes() {
  const c = (typeof crew !== "undefined" && crew.leo) || {}, suit = c.suit || "#eef2f8", skin = c.skin || "#e3b08a", hair = c.hair || "#3b2414";
  const sh = [
    S("p", { d: "M8 64 Q32 40 56 64Z", f: suit }), S("c", { cx: 21, cy: 58, r: 4, f: c.badge || "#3f8fe0" }), S("c", { cx: 21, cy: 58, r: 1.8, f: "#ffd166" }),
    S("c", { cx: 32, cy: 30, r: 22, f: suit }), S("c", { cx: 32, cy: 31, r: 17, f: c.visor || "#23306e" }),
    S("c", { cx: 32, cy: 32, r: 12, f: skin }), S("p", { d: "M20 28 Q32 14 44 28 Q38 23 32 24 Q26 23 20 28Z", f: hair }),
    S("c", { cx: 27.5, cy: 32, r: 1.9, f: "#2a1a3a" }), S("c", { cx: 36.5, cy: 32, r: 1.9, f: "#2a1a3a" })];
  if (c.beard) sh.push(S("p", { d: "M22 33 Q23 45 32 45 Q41 45 42 33 Q38 40 32 40 Q26 40 22 33Z", f: hair }));
  sh.push(S("p", { d: "M28 37 Q32 41 36 37", s: "#7a2a3a", sw: 1.6, f: "none" }));
  if (c.glasses === "round") sh.push(S("c", { cx: 27.5, cy: 32, r: 3.6, s: "#2a1a3a", sw: 1.2 }), S("c", { cx: 36.5, cy: 32, r: 3.6, s: "#2a1a3a", sw: 1.2 }), S("p", { d: "M31 32 L33 32", s: "#2a1a3a", sw: 1.2 }));
  if (c.glasses === "star") [27.5, 36.5].forEach((x) => sh.push(S("p", { d: `M${x} 27.5 l1.3 2.8 3 .3 -2.3 2 .7 3 -2.7 -1.6 -2.7 1.6 .7 -3 -2.3 -2 3 -.3z`, f: "#ffd166", o: 0.85 })));
  sh.push(S("p", { d: "M19 22 Q24 15 32 14", s: "rgba(255,255,255,.7)", sw: 2.4, f: "none" }), S("c", { cx: 52, cy: 22, r: 3, f: c.badge === "#ff7a45" ? "#3f8fe0" : "#ff7a45" }));
  if (c.hat && c.hat !== "none") sh.push(...hatShapes(c.hat, 32, 8, 18));
  return sh;
}
function shapesFor(who, opt) { const c = crew[who]; if (c && c.photo) return photoShapes(who, c, opt); if (who === "leo") return leoShapes(); return c.type === "dog" ? dogShapes(c) : personShapes(c, opt); }
// A real photo face: kept only in this iPad's storage, never uploaded
function photoShapes(who, c, opt) {
  const sh = [], body = who === "leo" ? c.suit : c.type === "dog" ? c.collar : c.shirt;
  if (!opt || !opt.noBody) sh.push(S("p", { d: "M10 64 Q32 42 54 64Z", f: body || "#3f8fe0" }));
  sh.push(S("c", { cx: 32, cy: 29, r: 20, f: "#ffffff" }), S("img", { href: c.photo, who, cx: 32, cy: 29, r: 18.6 }));
  if (c.hat && c.hat !== "none") sh.push(...hatShapes(c.hat, 32, 11, 18));
  return sh;
}
const faceImgs = {};
function faceImg(who) {
  const c = crew[who]; if (!c || !c.photo) return null;
  let im = faceImgs[who];
  if (!im || im.src !== c.photo) { im = new Image(); im.onload = () => { try { buildRocket(); } catch (e) {} }; im.src = c.photo; faceImgs[who] = im; }
  return im.complete && im.naturalWidth ? im : null;
}
function portraitCanvas(who) {
  const cv = document.createElement("canvas"); cv.width = cv.height = 128; const g = cv.getContext("2d");
  g.fillStyle = "#cfefff"; g.fillRect(0, 0, 128, 128); g.scale(2, 2); drawShapes(g, shapesFor(who)); return cv;
}
// who sits in the rocket windows: the captain first, then her sister, then a dog
const windowCrew = () => [captainId(), captainId() === "oda" ? "harper" : "oda", "joules"];
function toSVG(sh) {
  return '<svg viewBox="0 0 64 64" aria-hidden="true">' + sh.map((s) => {
    const st = 'fill="' + (s.f || "none") + '"' + (s.s ? ' stroke="' + s.s + '" stroke-width="' + (s.sw || 1) + '" stroke-linecap="round"' : "") + (s.o != null ? ' opacity="' + s.o + '"' : "");
    if (s.k === "c") return '<circle cx="' + s.cx + '" cy="' + s.cy + '" r="' + s.r + '" ' + st + "/>";
    if (s.k === "img") { const id = "cp" + Math.random().toString(36).slice(2, 9); return '<clipPath id="' + id + '"><circle cx="' + s.cx + '" cy="' + s.cy + '" r="' + s.r + '"/></clipPath><image href="' + s.href + '" x="' + (s.cx - s.r) + '" y="' + (s.cy - s.r) + '" width="' + 2 * s.r + '" height="' + 2 * s.r + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + id + ')"/>'; }
    if (s.k === "e") return '<ellipse cx="' + s.cx + '" cy="' + s.cy + '" rx="' + s.rx + '" ry="' + s.ry + '"' + (s.rot ? ' transform="rotate(' + s.rot + " " + s.cx + " " + s.cy + ')"' : "") + " " + st + "/>";
    return '<path d="' + s.d + '" ' + st + "/>";
  }).join("") + "</svg>";
}
function drawShapes(ctx, sh) {
  sh.forEach((s) => {
    if (s.k === "img") { const im = faceImg(s.who); if (im) { ctx.save(); ctx.beginPath(); ctx.arc(s.cx, s.cy, s.r, 0, Math.PI * 2); ctx.clip(); const k = Math.max(2 * s.r / im.naturalWidth, 2 * s.r / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k; ctx.drawImage(im, s.cx - w / 2, s.cy - h / 2, w, h); ctx.restore(); } return; }
    ctx.save(); ctx.globalAlpha = s.o != null ? s.o : 1; ctx.lineCap = "round";
    let path;
    if (s.k === "c") { path = new Path2D(); path.arc(s.cx, s.cy, s.r, 0, Math.PI * 2); }
    else if (s.k === "e") { path = new Path2D(); path.ellipse(s.cx, s.cy, s.rx, s.ry, (s.rot || 0) * Math.PI / 180, 0, Math.PI * 2); }
    else path = new Path2D(s.d);
    if (s.f && s.f !== "none") { ctx.fillStyle = s.f; ctx.fill(path); }
    if (s.s) { ctx.strokeStyle = s.s; ctx.lineWidth = s.sw || 1; ctx.stroke(path); }
    ctx.restore();
  });
}
function astronautCanvas(who) {
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 384; const g = cv.getContext("2d");
  const suit = "#f2f5fa", shade = "#cfd6e2", accent = crew[who] && crew[who].shirt ? crew[who].shirt : "#ff6fa8";
  const rr = (x, y, w, h, r, f) => { g.fillStyle = f; g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.fill(); };
  rr(70, 150, 116, 110, 40, shade); // backpack shadow
  rr(84, 150, 88, 120, 34, suit); // torso
  rr(92, 196, 72, 10, 5, accent); // belt stripe
  rr(54, 160, 36, 92, 18, suit); rr(166, 160, 36, 92, 18, suit); // arms
  g.fillStyle = accent; g.beginPath(); g.arc(72, 254, 16, 0, 7); g.arc(184, 254, 16, 0, 7); g.fill(); // gloves
  rr(92, 262, 32, 86, 14, suit); rr(132, 262, 32, 86, 14, suit); // legs
  rr(84, 336, 44, 30, 12, "#596080"); rr(128, 336, 44, 30, 12, "#596080"); // boots
  rr(112, 214, 32, 22, 6, "#3f8fe0"); g.fillStyle = "#ffd166"; g.beginPath(); g.arc(128, 225, 5, 0, 7); g.fill(); // chest box
  // helmet with the face inside
  g.fillStyle = suit; g.beginPath(); g.arc(128, 92, 74, 0, 7); g.fill();
  g.fillStyle = "#24306e"; g.beginPath(); g.arc(128, 94, 62, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(128, 94, 60, 0, 7); g.clip(); g.translate(128 - 32 * 1.9, 94 - 33 * 1.9); g.scale(1.9, 1.9);
  if (crew[who]) { const c = Object.assign({}, crew[who], { hat: "none", clip: crew[who].clip }); drawShapes(g, c.photo ? photoShapes(who, c, { noBody: true }) : c.type === "dog" ? dogShapes(c) : personShapes(c, { noBody: true })); }
  g.restore();
  g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.arc(128, 94, 50, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  return cv;
}

/* =============== sound =============== */
const Sound = (function () {
  let ac = null, master, sfxBus, delay;
  const chords = [[110, 164.81, 220, 277.18, 329.63], [98, 146.83, 196, 246.94, 293.66], [87.31, 130.81, 174.61, 220, 261.63], [98, 146.83, 196, 246.94, 329.63]];
  // iPads mute Web Audio when silent mode is on; ask for "playback" audio (iOS 17+), and on older iPads play a
  // silent looping <audio> clip, which switches the page to playback audio too.
  let keepAlive = null;
  function unmuteIOS() {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    try {
      if (!keepAlive) { keepAlive = document.createElement("audio"); keepAlive.setAttribute("playsinline", ""); keepAlive.setAttribute("x-webkit-airplay", "deny"); keepAlive.loop = true; keepAlive.preload = "auto"; keepAlive.src = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//NwwAAAAAAAAAAAAEluZm8AAAAPAAAAFgAACbEAHR0dHSgoKCgoMzMzMz09PT09SEhISFNTU1NTXl5eXmlpaWlpc3Nzc35+fn5+iYmJiZSUlJSUnp6enp6pqamptLS0tLS/v7+/ysrKysrU1NTU39/f39/q6urq9fX19fX/////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQELwAAAAAAAAmxyOFTSgAAAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NAxKQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80LEowAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/80DEpAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsSjAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxKMAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"; }
      const pr = keepAlive.play(); if (pr && pr.catch) pr.catch(() => {});
    } catch (e) {}
  }
  function wake() { unmuteIOS(); if (ac && ac.state !== "running" && ac.resume) { try { ac.resume(); } catch (e) {} } }
  ["pointerdown", "touchend", "keydown"].forEach((ev) => document.addEventListener(ev, () => { if (ac) wake(); }, { capture: true, passive: true }));
  document.addEventListener("visibilitychange", () => { if (!document.hidden && ac) wake(); });
  function start() {
    unmuteIOS();
    if (ac) { if (ac.resume) ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = save.muted ? 0 : 0.7; master.connect(ac.destination);
    delay = ac.createDelay(); delay.delayTime.value = 0.42; const fb = ac.createGain(); fb.gain.value = 0.38; delay.connect(fb); fb.connect(delay);
    const wet = ac.createGain(); wet.gain.value = 0.5; delay.connect(wet); wet.connect(master);
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; lp.connect(master); lp.connect(delay);
    const pad = ac.createGain(); pad.gain.value = 0; pad.connect(lp); pad.gain.linearRampToValueAtTime(1, ac.currentTime + 5);
    const oscs = chords[0].map((f, i) => {
      const o = ac.createOscillator(); o.type = i < 2 ? "sine" : "triangle"; o.frequency.value = f; o.detune.value = (i - 2) * 4;
      const g = ac.createGain(); g.gain.value = i < 2 ? 0.05 : 0.018;
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.07 + i * 0.03; const lg = ac.createGain(); lg.gain.value = g.gain.value * 0.6; lfo.connect(lg); lg.connect(g.gain); lfo.start();
      o.connect(g); g.connect(pad); o.start(); return o;
    });
    let ci = 0;
    setInterval(() => { ci = (ci + 1) % chords.length; oscs.forEach((o, i) => o.frequency.setTargetAtTime(chords[ci][i], ac.currentTime, 0.8)); }, 10000);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.5; sfxBus.connect(master); sfxBus.connect(delay);
    const tw = [880, 987.77, 1108.73, 1318.51, 1479.98, 1760];
    setInterval(() => { if (Math.random() < 0.6) tone(pick(tw), 0.025, 2.4, "sine"); }, 3200);
  }
  function tone(f, vol, dur, type, when) {
    if (!ac) return; const t = ac.currentTime + (when || 0);
    const o = ac.createOscillator(); o.type = type || "triangle"; o.frequency.value = f;
    const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, f0, f1, vol) {
    if (!ac) return; const len = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const n = ac.createBufferSource(); n.buffer = buf; const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.2;
    const t = ac.currentTime; bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.5); bp.frequency.exponentialRampToValueAtTime(f0, t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.45); g.gain.linearRampToValueAtTime(0, t + dur);
    n.connect(bp); bp.connect(g); g.connect(sfxBus); n.start(t);
  }
  function bark(when) {
    if (!ac) return; const t = ac.currentTime + when;
    const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(190, t + 0.14);
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(lp); lp.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.2);
  }
  const fx = {
    chime: () => [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => tone(f, 0.12, 1.6, "triangle", i * 0.12)),
    happy: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.14, 0.9, "triangle", i * 0.09)),
    oops: () => { tone(330, 0.08, 0.35, "sine"); tone(262, 0.08, 0.45, "sine", 0.15); },
    whoosh: (d) => noise(d || 1.8, 250, 2200, 0.35),
    bark: () => { bark(0); bark(0.22); },
    thud: () => { tone(90, 0.2, 0.3, "sine"); noise(0.25, 120, 300, 0.2); },
    jump: () => { if (!ac) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(700, t + 0.2); g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.35); },
    blip: () => tone(1046.5, 0.06, 0.25, "sine")
  };
  return { start, fx, ctx: () => ac, setMuted: (m) => { if (master) master.gain.setTargetAtTime(m ? 0 : 0.7, ac.currentTime, 0.2); } };
})();
const sfx = (n, a) => { try { Sound.fx[n] && Sound.fx[n](a); } catch (e) {} };

/* =============== voices =============== */
const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|kathy|fred|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/i;
let voices = [];
function voiceScore(v) {
  let s = 0;
  if (/en-GB/i.test(v.lang)) s += 12; else if (/^en/i.test(v.lang)) s += 6; else return -999;
  if (/premium/i.test(v.name)) s += 60; if (/enhanced/i.test(v.name)) s += 45; if (/neural|natural|online/i.test(v.name)) s += 40;
  if (/google uk english|google us english/i.test(v.name)) s += 20;
  if (/daniel|serena|kate|arthur|martha|stephanie|jamie|oliver|samantha|ava|evan|zoe|libby|sonia|ryan/i.test(v.name)) s += 8;
  if (NOVELTY.test(v.name)) s -= 200;
  if (v.localService === false) s += 2;
  return s;
}
function loadVoices() { try { voices = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a)); } catch (e) { voices = []; } }
if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
const mainVoice = () => voices.find((v) => v.name === save.voice) || voices[0] || null;
function leoVoice() {
  const male = voices.find((v) => voiceScore(v) > 0 && /daniel|arthur|oliver|ryan|evan|jamie|google uk english male|male/i.test(v.name) && v !== mainVoice());
  return male || mainVoice();
}
const VOICE_STYLE = { harper: [1.2, 1.0], dad: [0.85, 0.95], mum: [1.08, 0.97], oda: [1.55, 1.08], leo: [0.95, 0.94], narrator: [1.0, 0.92] };
let speakToken = 0;
/* Recorded natural voices: voice/index.js maps "who|text" to a slice of a voice pack (voice/<pack>.js, base64 mp3). */
const VI = window.VOICE_INDEX || { lines: {} };
const useNatural = () => !save.voice && !!Sound.ctx();
const vnorm = (s) => String(s).replace(/[*_#]/g, "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();
const packs = {}, packWait = {};
window.__vp = (name, b64) => { const w = packWait[name]; if (w) w(b64); };
function loadPack(name) {
  if (packs[name]) return packs[name];
  packs[name] = new Promise((res, rej) => {
    packWait[name] = res;
    const sc = document.createElement("script"); sc.src = "voice/" + name + ".js"; sc.onerror = () => rej(new Error("pack " + name)); document.head.appendChild(sc);
  }).then((b64) => {
    delete packWait[name];
    const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new Promise((res, rej) => Sound.ctx().decodeAudioData(u.buffer, res, rej));
  });
  packs[name].catch(() => delete packs[name]);
  return packs[name];
}
const preloadVoice = (name) => { if (useNatural() && VI.packs && VI.packs[name]) loadPack(name).catch(() => {}); };
let curSrc = null;
function playClip(hit, my) {
  const timeout = new Promise((r) => setTimeout(() => r(null), 6000));
  return Promise.race([loadPack(hit[0]), timeout]).then((buf) => new Promise((res) => {
    if (!buf) return res(false); if (my !== speakToken) return res(true);
    const ac = Sound.ctx(), src = ac.createBufferSource(), g = ac.createGain(); g.gain.value = 1.15;
    src.buffer = buf; src.connect(g); g.connect(ac.destination); curSrc = src;
    let done = false; const fin = () => { if (!done) { done = true; if (curSrc === src) curSrc = null; res(true); } };
    src.onended = fin; setTimeout(fin, (hit[2] + 1) * 1000);
    src.start(0, Math.max(0, hit[1] - 0.06), hit[2] + 0.16);
  })).catch(() => false);
}
function ttsOne(text, who, my) {
  if (!("speechSynthesis" in window) || my !== speakToken) return Promise.resolve();
  return new Promise((res) => {
    const u = new SpeechSynthesisUtterance(String(text).replace(/[*_#]/g, ""));
    const v = who === "leo" || who === "narrator" ? leoVoice() : mainVoice(); if (v) u.voice = v;
    const st = VOICE_STYLE[who] || VOICE_STYLE.narrator; u.pitch = st[0]; u.rate = st[1];
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    u.onend = fin; u.onerror = fin; setTimeout(fin, 2000 + String(text).length * 120);
    speechSynthesis.speak(u);
  });
}
async function speakOne(text, who, my) {
  if (my !== speakToken) return;
  const hit = useNatural() && VI.lines[who + "|" + vnorm(text)];
  if (hit && (await playClip(hit, my))) return;
  await ttsOne(text, who, my);
}
let speechChain = Promise.resolve();
// text may be a string or an array of segments spoken one after another
function speak(text, who, opts) {
  if (!opts || !opts.queue) stopSpeaking();
  const my = speakToken, segs = Array.isArray(text) ? text : [text];
  const run = async () => { for (const t of segs) { if (my !== speakToken) break; await speakOne(t, who, my); } return my === speakToken; };
  speechChain = opts && opts.queue ? speechChain.then(run) : run();
  return speechChain;
}
function stopSpeaking() {
  try { speechSynthesis.cancel(); } catch (e) {}
  if (curSrc) { try { curSrc.stop(); } catch (e) {} curSrc = null; }
  speakToken++;
}

/* =============== 3D scene =============== */
const canvas = $("#scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 200000);
const UP = new THREE.Vector3(0, 1, 0);
scene.add(new THREE.AmbientLight(0x6a74b0, 0.6));
scene.add(new THREE.PointLight(0xfff2dd, 1.35, 0));
const camLight = new THREE.DirectionalLight(0xffffff, 0.25); scene.add(camLight);

function canvasTex(w, h, paint) { const c = document.createElement("canvas"); c.width = w; c.height = h; paint(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; }
function blobs(ctx, w, h, R, color, n, rmin, rmax, alpha, ymin, ymax) {
  ctx.fillStyle = color; ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) { const x = R() * w, y = (ymin || 0) * h + R() * ((ymax || 1) - (ymin || 0)) * h, r = rmin + R() * (rmax - rmin);
    for (const dx of [-w, 0, w]) { ctx.beginPath(); ctx.ellipse(x + dx, y, r * 1.4, r, 0, 0, Math.PI * 2); ctx.fill(); } }
  ctx.globalAlpha = 1;
}
function craters(ctx, w, h, R, n, rmin, rmax, dark, light) {
  for (let i = 0; i < n; i++) { const x = R() * w, y = h * 0.1 + R() * h * 0.8, r = rmin + R() * (rmax - rmin);
    ctx.globalAlpha = 0.5; ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(x, y, r * 1.3, r, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.45; ctx.strokeStyle = light; ctx.lineWidth = Math.max(1, r * 0.25); ctx.beginPath(); ctx.ellipse(x + r * 0.15, y + r * 0.1, r * 1.3, r, 0, Math.PI * 0.9, Math.PI * 1.9); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function bands(ctx, w, h, R, cols, turb) {
  let y = 0; while (y < h) { const bh = 3 + R() * h / 9; ctx.fillStyle = cols[Math.floor(R() * cols.length)]; ctx.fillRect(0, y, w, bh + 1); y += bh; }
  ctx.lineCap = "round";
  for (let i = 0; i < 260; i++) { const yy = R() * h, ph = R() * 6, amp = turb * R(); ctx.strokeStyle = cols[Math.floor(R() * cols.length)]; ctx.globalAlpha = 0.35; ctx.lineWidth = 1 + R() * 4;
    ctx.beginPath(); ctx.moveTo(0, yy); for (let x = 0; x <= w; x += 12) ctx.lineTo(x, yy + Math.sin(x * 0.03 + ph) * amp); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function heart(ctx, cx, cy, s) {
  ctx.beginPath(); ctx.moveTo(cx, cy + s * 0.9);
  ctx.bezierCurveTo(cx - s * 1.3, cy + s * 0.1, cx - s * 0.9, cy - s * 0.9, cx - s * 0.05, cy - s * 0.35);
  ctx.bezierCurveTo(cx + s * 0.9, cy - s * 0.95, cx + s * 1.25, cy + s * 0.05, cx, cy + s * 0.9); ctx.fill();
}
const PAINT = {
  sun: (c, w, h, R) => { c.fillStyle = "#ffc23a"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#ffe680", 260, 3, 10, 0.45); blobs(c, w, h, R, "#ff9a1f", 200, 3, 9, 0.35); },
  mercury: (c, w, h, R) => { c.fillStyle = "#a8a29a"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#8a847c", 40, 10, 30, 0.4); craters(c, w, h, R, 120, 2, 9, "#6f6a63", "#d6d0c8"); },
  venus: (c, w, h, R) => bands(c, w, h, R, ["#f3d9a4", "#e8c27a", "#f7e7c0", "#ddb46a"], 18),
  earth: (c, w, h, R) => { c.fillStyle = "#2f7fd8"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#2569c0", 80, 10, 30, 0.4);
    for (let k = 0; k < 9; k++) { const cx = R() * w, cy = h * 0.2 + R() * h * 0.6; c.fillStyle = R() < 0.12 ? "#d9c27a" : "#4caf50";
      for (let j = 0; j < 14; j++) { c.beginPath(); c.ellipse(cx + (R() - 0.5) * 70, cy + (R() - 0.5) * 50, 8 + R() * 18, 6 + R() * 12, 0, 0, 7); c.fill(); } }
    c.fillStyle = "#f4fbff"; c.fillRect(0, 0, w, h * 0.06); c.fillRect(0, h * 0.94, w, h * 0.06); blobs(c, w, h, R, "#ffffff", 120, 4, 14, 0.35); },
  moon: (c, w, h, R) => { c.fillStyle = "#cfcfcf"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#8e8e96", 26, 12, 34, 0.55, 0.25, 0.75); craters(c, w, h, R, 140, 2, 8, "#8a8a8a", "#efefef"); },
  mars: (c, w, h, R) => { c.fillStyle = "#d9622b"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#8f3a1a", 60, 8, 30, 0.45, 0.2, 0.8); blobs(c, w, h, R, "#f08a4b", 70, 6, 20, 0.35);
    c.fillStyle = "#fff"; c.globalAlpha = 0.9; c.fillRect(0, 0, w, h * 0.05); c.fillRect(0, h * 0.95, w, h * 0.05); c.globalAlpha = 1; },
  ceres: (c, w, h, R) => { c.fillStyle = "#8d8a86"; c.fillRect(0, 0, w, h); craters(c, w, h, R, 90, 3, 10, "#5f5c58", "#c9c5bf"); blobs(c, w, h, R, "#ffffff", 3, 3, 5, 0.9, 0.4, 0.6); },
  jupiter: (c, w, h, R) => { bands(c, w, h, R, ["#f1e0c5", "#d9a066", "#b5723f", "#f6efe2", "#c98b52"], 8);
    c.fillStyle = "#f3e6d4"; c.beginPath(); c.ellipse(w * 0.62, h * 0.64, 34, 17, 0, 0, 7); c.fill(); c.fillStyle = "#c0442e"; c.beginPath(); c.ellipse(w * 0.62, h * 0.64, 28, 13, 0, 0, 7); c.fill(); },
  io: (c, w, h, R) => { c.fillStyle = "#f3e07a"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#e0902f", 50, 4, 14, 0.6); blobs(c, w, h, R, "#ffffff", 30, 3, 10, 0.5); blobs(c, w, h, R, "#3a2a1a", 30, 2, 5, 0.8); },
  europa: (c, w, h, R) => { c.fillStyle = "#efe6d6"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#c9a985", 30, 10, 30, 0.35);
    c.strokeStyle = "#a0663a"; c.globalAlpha = 0.7; for (let i = 0; i < 40; i++) { c.lineWidth = 1 + R() * 2; c.beginPath(); let x = R() * w, y = R() * h; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (R() - 0.3) * 60; y += (R() - 0.5) * 30; c.lineTo(x, y); } c.stroke(); } c.globalAlpha = 1; },
  ganymede: (c, w, h, R) => { c.fillStyle = "#8f8478"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#c9c0b0", 50, 8, 26, 0.5); craters(c, w, h, R, 60, 2, 6, "#5f564c", "#e6dfd2"); },
  callisto: (c, w, h, R) => { c.fillStyle = "#5e554c"; c.fillRect(0, 0, w, h); craters(c, w, h, R, 260, 1, 5, "#3e372f", "#d8cfc2"); },
  saturn: (c, w, h, R) => bands(c, w, h, R, ["#f3e1b0", "#e6c983", "#d9b46a", "#f8ecc9"], 4),
  titan: (c, w, h, R) => bands(c, w, h, R, ["#e2a54a", "#d89838", "#e8b25c", "#cf8d33"], 3),
  enceladus: (c, w, h, R) => { c.fillStyle = "#f4f8ff"; c.fillRect(0, 0, w, h); craters(c, w, h, R, 50, 2, 6, "#c9d3e6", "#ffffff"); c.strokeStyle = "#7fb6e6"; c.lineWidth = 3; c.globalAlpha = 0.8; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(w * (0.3 + i * 0.1), h * 0.86); c.lineTo(w * (0.36 + i * 0.1), h * 0.97); c.stroke(); } c.globalAlpha = 1; },
  uranus: (c, w, h, R) => bands(c, w, h, R, ["#a7e8ec", "#98dde3", "#b3eef0"], 2),
  neptune: (c, w, h, R) => { bands(c, w, h, R, ["#3f6fe0", "#3563d0", "#4a7cf0", "#2f58c0"], 6); c.fillStyle = "#1d3384"; c.beginPath(); c.ellipse(w * 0.4, h * 0.62, 22, 12, 0, 0, 7); c.fill(); blobs(c, w, h, R, "#ffffff", 14, 3, 8, 0.6, 0.3, 0.7); },
  triton: (c, w, h, R) => { c.fillStyle = "#e6d6d0"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#f6b9b0", 40, 6, 20, 0.45, 0.55, 1); blobs(c, w, h, R, "#a9958c", 50, 3, 8, 0.4, 0.2, 0.6); },
  pluto: (c, w, h, R) => { c.fillStyle = "#c99e78"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#7a4a32", 40, 10, 26, 0.6, 0.45, 0.75); blobs(c, w, h, R, "#e8c9a6", 50, 6, 18, 0.4);
    c.fillStyle = "#fff3e2"; heart(c, w * 0.5, h * 0.47, h * 0.24); c.globalAlpha = 0.6; heart(c, w * 0.5, h * 0.47, h * 0.28); c.globalAlpha = 1; },
  charon: (c, w, h, R) => { c.fillStyle = "#a9a39c"; c.fillRect(0, 0, w, h); craters(c, w, h, R, 70, 2, 7, "#7d776f", "#d6d0c8"); c.fillStyle = "#7a4b3a"; c.globalAlpha = 0.85; c.fillRect(0, 0, w, h * 0.14); c.globalAlpha = 1; },
  arrokoth: (c, w, h, R) => { c.fillStyle = "#b0603d"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#d48a62", 40, 6, 18, 0.45); },
  phobos: (c, w, h, R) => { c.fillStyle = "#7d6f62"; c.fillRect(0, 0, w, h); craters(c, w, h, R, 70, 2, 8, "#5a4e44", "#a8998a"); c.fillStyle = "#4c4139"; c.globalAlpha = 0.6; c.beginPath(); c.ellipse(w * 0.3, h * 0.5, 34, 26, 0, 0, 7); c.fill(); c.globalAlpha = 1;
    c.strokeStyle = "#5a4e44"; c.globalAlpha = 0.5; for (let i = 0; i < 14; i++) { c.lineWidth = 1 + R() * 2; c.beginPath(); c.moveTo(w * 0.3, h * (0.25 + i * 0.035)); c.lineTo(w, h * (0.2 + i * 0.04)); c.stroke(); } c.globalAlpha = 1; },
  deimos: (c, w, h, R) => { c.fillStyle = "#a39484"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#b8aa9a", 30, 8, 24, 0.5); craters(c, w, h, R, 25, 2, 5, "#85776a", "#c2b4a4"); },
  mimas: (c, w, h, R) => { c.fillStyle = "#d4d4d6"; c.fillRect(0, 0, w, h); craters(c, w, h, R, 160, 2, 8, "#a9a9ad", "#efefef");
    c.fillStyle = "#9c9ca2"; c.beginPath(); c.ellipse(w * 0.55, h * 0.5, 48, 46, 0, 0, 7); c.fill(); c.strokeStyle = "#f2f2f4"; c.lineWidth = 6; c.beginPath(); c.ellipse(w * 0.55, h * 0.5, 48, 46, 0, 0, 7); c.stroke(); c.fillStyle = "#d8d8dc"; c.beginPath(); c.arc(w * 0.55, h * 0.5, 8, 0, 7); c.fill(); },
  miranda: (c, w, h, R) => { c.fillStyle = "#b9b4ad"; c.fillRect(0, 0, w, h); craters(c, w, h, R, 60, 2, 6, "#8f8a83", "#dcd8d2");
    c.strokeStyle = "#7f7a73"; for (let k = 0; k < 3; k++) { const cx = R() * w, cy = h * 0.3 + R() * h * 0.4; for (let j = 0; j < 7; j++) { c.lineWidth = 3; c.globalAlpha = 0.6; c.beginPath(); c.ellipse(cx, cy, 20 + j * 6, 14 + j * 4, R(), 0, 7); c.stroke(); } } c.globalAlpha = 1; },
  comet: (c, w, h, R) => { c.fillStyle = "#4a4440"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#6b625b", 40, 6, 20, 0.6); blobs(c, w, h, R, "#e6f2ff", 12, 3, 8, 0.7); },
  haumea: (c, w, h, R) => { c.fillStyle = "#e9ecf2"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#cfd6e2", 40, 8, 24, 0.5); c.fillStyle = "#b3425a"; c.globalAlpha = 0.7; c.beginPath(); c.ellipse(w * 0.7, h * 0.55, 30, 20, 0, 0, 7); c.fill(); c.globalAlpha = 1; },
  makemake: (c, w, h, R) => { c.fillStyle = "#c98a5a"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#e0a878", 50, 8, 26, 0.5); blobs(c, w, h, R, "#8f5634", 30, 6, 18, 0.45); },
  eris: (c, w, h, R) => { c.fillStyle = "#e6e6ea"; c.fillRect(0, 0, w, h); blobs(c, w, h, R, "#ffffff", 50, 8, 26, 0.6); blobs(c, w, h, R, "#c9c6cf", 30, 6, 18, 0.4); }
};
function glowTex(inner, outer) {
  return canvasTex(128, 128, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, inner); g.addColorStop(0.3, outer); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w); });
}

const bodies = {}; const pickables = [];
function addPick(obj, id, radius) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
  m.userData.id = id; obj.add(m); pickables.push(m);
}
function makeCraft(kind) {
  const g = new THREE.Group();
  const white = new THREE.MeshLambertMaterial({ color: 0xeef2f8, emissive: 0x222833 }), panel = new THREE.MeshLambertMaterial({ color: 0x2b4fa8, emissive: 0x0b1840 }), gold = new THREE.MeshLambertMaterial({ color: 0xf3c24a, emissive: 0x4a3200 }), dark = new THREE.MeshLambertMaterial({ color: 0x555b66 });
  const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x || 0, y || 0, z || 0); g.add(b); return b; };
  const cyl = (r, l, m, x, y, z, rx, rz) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 16), m); c.position.set(x || 0, y || 0, z || 0); c.rotation.set(rx || 0, 0, rz || 0); g.add(c); return c; };
  if (kind === "iss") {
    box(0.9, 0.025, 0.025, dark);
    [-0.4, -0.28, 0.28, 0.4].forEach((x) => { box(0.09, 0.004, 0.32, panel, x, 0, 0.19); box(0.09, 0.004, 0.32, panel, x, 0, -0.19); });
    cyl(0.03, 0.34, white, 0, -0.04, 0, Math.PI / 2); cyl(0.028, 0.18, white, 0.05, -0.04, 0.12, 0, Math.PI / 2); cyl(0.026, 0.16, white, -0.05, -0.04, -0.12, 0, Math.PI / 2);
    box(0.12, 0.004, 0.08, white, 0.12, 0.03, 0); box(0.12, 0.004, 0.08, white, -0.12, 0.03, 0);
    g.scale.setScalar(0.5);
  } else if (kind === "hubble") {
    cyl(0.06, 0.26, new THREE.MeshLambertMaterial({ color: 0xc9ced8, emissive: 0x20242b }), 0, 0, 0, 0, Math.PI / 2);
    cyl(0.062, 0.04, dark, -0.15, 0, 0, 0, Math.PI / 2);
    box(0.2, 0.003, 0.09, panel, 0, 0, 0.12); box(0.2, 0.003, 0.09, panel, 0, 0, -0.12);
    g.scale.setScalar(0.8);
  } else if (kind === "jwst") {
    const shield = new THREE.MeshLambertMaterial({ color: 0xd7c8e6, emissive: 0x3a2a48, side: THREE.DoubleSide });
    for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.CircleGeometry(0.55 - i * 0.02, 4), shield); s.rotation.x = -Math.PI / 2; s.scale.set(1.6, 1, 1); s.position.y = -0.18 + i * 0.025; g.add(s); }
    const hex = new THREE.CylinderGeometry(0.06, 0.06, 0.012, 6);
    const centres = [[0, 0]]; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; centres.push([Math.cos(a) * 0.104, Math.sin(a) * 0.104]); }
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, r = k % 2 ? 0.18 : 0.208; centres.push([Math.cos(a) * r, Math.sin(a) * r]); }
    const mirror = new THREE.Group(); centres.forEach(([x, y]) => { const m = new THREE.Mesh(hex, gold); m.rotation.x = Math.PI / 2; m.rotation.y = Math.PI / 6; m.position.set(x, y, 0); mirror.add(m); });
    mirror.position.set(0, 0.12, 0); mirror.rotation.x = -0.35; g.add(mirror);
    cyl(0.008, 0.25, dark, 0, 0.14, 0.15, 0.9);
  } else if (kind === "parker") {
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 6), new THREE.MeshLambertMaterial({ color: 0xfaf8f0, emissive: 0x555048 })); shield.position.y = 0.16; g.add(shield);
    box(0.12, 0.2, 0.12, dark, 0, 0, 0); box(0.36, 0.01, 0.08, panel, 0, -0.02, 0); cyl(0.01, 0.12, white, 0, 0.09, 0);
  } else if (kind === "newhorizons") {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 3), gold); body.rotation.x = Math.PI / 2; g.add(body);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 10, 0, Math.PI * 2, 0, 0.9), new THREE.MeshLambertMaterial({ color: 0xf2f2f2, emissive: 0x2a2a2a, side: THREE.DoubleSide })); dish.rotation.x = Math.PI; dish.position.y = 0.1; g.add(dish);
    cyl(0.025, 0.16, dark, 0.12, -0.02, 0, 0, Math.PI / 2);
  } else {
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 10, 0, Math.PI * 2, 0, 0.9), new THREE.MeshLambertMaterial({ color: 0xf2f2f2, emissive: 0x2a2a2a, side: THREE.DoubleSide }));
    dish.rotation.x = Math.PI; dish.position.y = 0.1; g.add(dish);
    box(0.12, 0.06, 0.12, dark, 0, -0.02, 0);
    cyl(0.004, 0.55, white, 0.3, -0.02, 0, 0, Math.PI / 2); cyl(0.004, 0.3, white, -0.18, -0.02, 0.05, 0, Math.PI / 2.4);
    const rec = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), gold); rec.position.set(0.061, -0.02, 0); rec.rotation.y = Math.PI / 2; g.add(rec);
  }
  return g;
}

ORDER.forEach((id, i) => {
  const p = P[id], pivot = new THREE.Group(); let mesh;
  if (p.grp === "deep") {
    if (window.DeepSpace) { try { mesh = window.DeepSpace.make(id); } catch (e) { console.error(e); } }
    if (!mesh) { mesh = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex("rgba(255,255,255,1)", p.color), blending: THREE.AdditiveBlending, depthWrite: false })); mesh.scale.setScalar(80); mesh.userData.view = 120; mesh.userData.radius = 40; }
    p.view = mesh.userData.view || 150; p.radius = mesh.userData.radius || 60;
    const d = 2400 + 900 * Math.log10(1 + p.ly);
    pivot.position.copy(deepVec(p).multiplyScalar(d));
    addPick(pivot, id, Math.max(10, p.radius * 0.6));
  } else if (p.model) {
    mesh = makeCraft(p.model); addPick(pivot, id, 0.3);
    if (isFar(id)) { pivot.position.set(p.dist * Math.cos(p.ang * Math.PI / 180), p.y, p.dist * Math.sin(p.ang * Math.PI / 180)); addPick(pivot, id, 3); }
  } else if (id === "kuiper") {
    const tex = canvasTex(256, 128, (c, w, h) => PAINT.arrokoth(c, w, h, rng(1000 + i * 77)));
    mesh = new THREE.Group(); const mat = new THREE.MeshLambertMaterial({ map: tex });
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), mat); a.scale.set(1, 0.85, 0.9); a.position.x = -0.42;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 24), mat); b.scale.set(1, 0.8, 0.85); b.position.x = 0.4;
    mesh.add(a, b); addPick(pivot, id, 1);
  } else {
    const tex = canvasTex(512, 256, (c, w, h) => (PAINT[p.tex] || PAINT.moon)(c, w, h, rng(1000 + i * 77)));
    const mat = id === "sun" ? new THREE.MeshBasicMaterial({ map: tex }) : new THREE.MeshLambertMaterial({ map: tex });
    mesh = new THREE.Mesh(new THREE.SphereGeometry(p.r, 48, 32), mat); mesh.userData.id = id; pickables.push(mesh);
    if (p.lumpy) { const pa = mesh.geometry.attributes.position, v = new THREE.Vector3(), Rr = rng(500 + i); for (let k = 0; k < pa.count; k++) { v.fromBufferAttribute(pa, k); const n = 1 + (Math.sin(v.x * 9 + Rr() * 0.2) * Math.cos(v.y * 7) * Math.sin(v.z * 8)) * 0.12; v.multiplyScalar(n); pa.setXYZ(k, v.x, v.y, v.z); } mesh.geometry.computeVertexNormals(); mesh.scale.set(p.lumpy, 1, 0.9); }
    if (p.egg) mesh.scale.set(1.9, 0.95, 1.2);
    if (p.comet) {
      const coma = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex("rgba(220,240,255,0.9)", "rgba(140,200,255,0.35)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); coma.scale.setScalar(p.r * 7); pivot.add(coma);
      const tailTex = canvasTex(64, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(200,235,255,0.85)"); g.addColorStop(1, "rgba(120,180,255,0)"); c.fillStyle = g; c.beginPath(); c.moveTo(w * 0.35, 0); c.lineTo(w * 0.65, 0); c.lineTo(w, h); c.lineTo(0, h); c.fill(); });
      const tail = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 9), new THREE.MeshBasicMaterial({ map: tailTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      tail.geometry.translate(0, -4.5, 0); const tailHolder = new THREE.Group(); tailHolder.add(tail); tailHolder.userData.cometTail = true; pivot.add(tailHolder);
      const tail2 = tail.clone(); tail2.rotation.y = Math.PI / 2; tailHolder.add(tail2);
    }
  }
  pivot.add(mesh);
  if (p.tilt) mesh.rotation.z = p.tilt;
  if (p.grp === "solar") { p.angNow = p.ang; pivot.position.set(p.dist * Math.cos(p.ang * Math.PI / 180), 0, p.dist * Math.sin(p.ang * Math.PI / 180)); }
  scene.add(pivot);
  bodies[id] = { pivot, mesh, phase: i * 1.7 };
});
// Sun glow
(function () { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex("rgba(255,230,150,1)", "rgba(255,190,80,.6)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); s.scale.set(72, 72, 1); bodies.sun.pivot.add(s); })();
// Saturn's rings
let ringHolder = null;
(function () {
  const ri = 7.2, ro = 13.5, g = new THREE.RingGeometry(ri, ro, 180, 1), pos = g.attributes.position, uv = g.attributes.uv, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); uv.setXY(i, (v.length() - ri) / (ro - ri), 0.5); }
  const R = rng(42);
  const t = canvasTex(512, 4, (c, w, h) => { for (let x = 0; x < w; x++) { const f = x / w; let a = 0.35 + R() * 0.5; if (f < 0.12) a *= f / 0.12 * 0.6; if (f > 0.6 && f < 0.66) a = 0.06; if (f > 0.97) a *= 0.3;
    c.fillStyle = "hsla(" + (38 + R() * 8) + ",55%," + (70 + R() * 20) + "%," + a + ")"; c.fillRect(x, 0, 1, h); } });
  const ring = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; const holder = new THREE.Group(); holder.add(ring); holder.rotation.z = 0.47; holder.rotation.x = 0.15;
  bodies.saturn.pivot.add(holder); bodies.saturn.mesh.rotation.z = 0.47; ringHolder = holder;
})();
// orbit lines
const orbitLines = new THREE.Group(); scene.add(orbitLines);
ORDER.filter((id) => P[id].grp === "solar" && P[id].dist > 0 && id !== "belt" && id !== "kuiper" && id !== "halley" && id !== "ceres").forEach((id) => {
  const d = P[id].dist, pts = []; for (let i = 0; i <= 180; i++) { const a = i / 180 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * d, 0, Math.sin(a) * d)); }
  orbitLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x9fb2ff, transparent: true, opacity: 0.16 })));
});
// belts
const dotTex = glowTex("rgba(255,255,255,1)", "rgba(255,255,255,.6)");
let beltMesh, kuiperPts;
(function () {
  const R = rng(7), n = 1400, geo = new THREE.IcosahedronGeometry(0.3, 0), mat = new THREE.MeshLambertMaterial({ color: 0x9a948c, flatShading: true });
  beltMesh = new THREE.InstancedMesh(geo, mat, n); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
  for (let i = 0; i < n; i++) { const a = R() * Math.PI * 2, r = 80 + R() * 16; p.set(Math.cos(a) * r, (R() - 0.5) * 3, Math.sin(a) * r);
    const k = 0.3 + R() * R() * 2.2; s.set(k, k * (0.6 + R() * 0.5), k); e.set(R() * 6, R() * 6, R() * 6); q.setFromEuler(e); m.compose(p, q, s); beltMesh.setMatrixAt(i, m); }
  scene.add(beltMesh);
  const kn = 3000, kp = new Float32Array(kn * 3);
  for (let i = 0; i < kn; i++) { const a = R() * Math.PI * 2, r = 255 + R() * 65; kp[i * 3] = Math.cos(a) * r; kp[i * 3 + 1] = (R() - 0.5) * 14; kp[i * 3 + 2] = Math.sin(a) * r; }
  const kg = new THREE.BufferGeometry(); kg.setAttribute("position", new THREE.BufferAttribute(kp, 3));
  kuiperPts = new THREE.Points(kg, new THREE.PointsMaterial({ color: 0xcfe3ff, size: 0.22, map: dotTex, transparent: true, opacity: 0.85, depthWrite: false })); scene.add(kuiperPts);
})();
// sky
const sky = new THREE.Group(); scene.add(sky);
(function () {
  const R = rng(99), n = 6000, p = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const tints = [[1, 1, 1], [0.8, 0.88, 1], [1, 0.93, 0.78], [1, 0.82, 0.75], [0.85, 0.95, 1]];
  for (let i = 0; i < n; i++) {
    let v;
    if (i < 2800) { const u = R() * 2 - 1, a = R() * Math.PI * 2, rr = Math.sqrt(1 - u * u); v = new THREE.Vector3(rr * Math.cos(a), u, rr * Math.sin(a)); }
    else { const a = R() * Math.PI * 2, off = (R() + R() + R() - 1.5) * 0.22; v = new THREE.Vector3(Math.cos(a), off, Math.sin(a)).normalize(); v.applyAxisAngle(new THREE.Vector3(1, 0, 0), 1.05); }
    v.multiplyScalar(90000); p.set([v.x, v.y, v.z], i * 3);
    const t = tints[Math.floor(R() * tints.length)], b = i < 2800 ? 0.55 + R() * 0.45 : 0.25 + R() * 0.35; col.set([t[0] * b, t[1] * b, t[2] * b], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  sky.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, vertexColors: true, depthWrite: false })));
})();

// Harper's rocket (visible in chase view)
let rocket = null;
const DEFAULT_ROCKET = (window.RocketKit && window.RocketKit.DEFAULT_DESIGN) || { body: "#ff7a45", nose: "#ffd166", fins: "#ff6fa8", trim: "#ffffff", pattern: "stars", shape: "classic", windows: 2, name: "HARPER", stickers: ["star", "pluto"] };
const ODA_ROCKET = { body: "#ff6fa8", nose: "#ffd166", fins: "#b26bff", trim: "#ffffff", pattern: "spots", shape: "classic", windows: 2, name: "ODA", stickers: ["heart", "paw", "star"] };
const defaultRocket = () => Object.assign({}, DEFAULT_ROCKET, captainId() === "oda" ? ODA_ROCKET : {});
let rocketDesign = Object.assign(defaultRocket(), save.rocket || {});
function buildRocket() {
  if (rocket) { scene.remove(rocket); try { window.RocketKit && window.RocketKit.dispose(rocket); } catch (e) {} }
  try { rocket = window.RocketKit ? window.RocketKit.build(rocketDesign, { faces: windowCrew().map(portraitCanvas) }) : null; } catch (e) { console.error(e); rocket = null; }
  if (!rocket) { rocket = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.4, 20), new THREE.MeshLambertMaterial({ color: rocketDesign.body })); b.rotation.x = Math.PI / 2; const n = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 20), new THREE.MeshLambertMaterial({ color: rocketDesign.nose })); n.rotation.x = Math.PI / 2; n.position.z = 1; rocket.add(b, n); }
  rocket.visible = false; scene.add(rocket);
  $("#plate").textContent = "S.S. " + (rocketDesign.name || crew[captainId()].name.toUpperCase());
}
buildRocket();
function worldPos(id, out) { return bodies[id].pivot.getWorldPosition(out || new THREE.Vector3()); }

/* =============== labels =============== */
const labelEls = {};
ORDER.forEach((id) => {
  const el = document.createElement("button"); el.className = "label" + (P[id].grp === "deep" ? " far" : ""); el.textContent = P[id].name; el.hidden = true;
  el.addEventListener("click", (ev) => { ev.stopPropagation(); if (!trip) openSheet(id); });
  $("#labels").appendChild(el); labelEls[id] = el;
});
const tmpV = new THREE.Vector3();
function updateLabels() {
  const w = window.innerWidth, h = window.innerHeight, cur = P[state.cur], curSys = sysOf(cur).id, map = state.mode === "map";
  ORDER.forEach((id) => {
    const el = labelEls[id], p = P[id];
    let ok = id !== state.cur && !trip && !tween;
    if (ok) {
      if (map) ok = p.grp === "solar" || isFar(id);
      else if (p.grp === "deep") ok = cur.grp === "deep";
      else if (p.grp === "moon" || p.grp === "craft") ok = isFar(id) ? cur.grp !== "deep" : p.parent === curSys;
    }
    if (!ok) { el.hidden = true; return; }
    worldPos(id, tmpV); const dist = tmpV.distanceTo(camera.position); tmpV.project(camera);
    if (tmpV.z > 1 || Math.abs(tmpV.x) > 0.96 || Math.abs(tmpV.y) > 0.92 || ((p.grp === "moon" || p.grp === "craft") && !isFar(id) && dist > 60)) { el.hidden = true; return; }
    el.hidden = false; el.classList.toggle("big", map);
    el.style.transform = "translate(" + Math.round((tmpV.x * 0.5 + 0.5) * w) + "px," + Math.round((-tmpV.y * 0.5 + 0.5) * h + 10) + "px) translateX(-50%)";
  });
}

/* =============== camera, travel, map =============== */
const state = { cur: "earth", theta: 0, phi: 1.2, dist: 10, mode: "orbit", cardFact: 0, factSet: "facts", lastDrag: 0, mapTheta: 0.6, mapPhi: 0.35, mapDist: 820, mapPlay: false, mapSpeed: 1, mapYears: 0, mapK: 0 };
let trip = null, tween = null, paused = false;
function viewOf(id) { return P[id].view; }
function rocketScale(id) { return Math.max(0.035, viewOf(id) * 0.035); }
function arrivalOffset(to, fromPos) {
  const T = worldPos(to); let dir;
  if (to === "sun" || P[to].grp === "deep") { dir = (P[to].grp === "deep" ? T.clone().multiplyScalar(-1) : fromPos.clone().sub(T)).setY(0); if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0); dir.normalize(); if (P[to].grp === "deep") dir.applyAxisAngle(UP, 0.4); }
  else { dir = T.clone().multiplyScalar(-1).setY(0); if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0); dir.normalize().applyAxisAngle(UP, 0.6); }
  const elev = VIEW_ELEV[to] || 0.28, v = viewOf(to);
  return dir.multiplyScalar(v * Math.cos(elev)).add(new THREE.Vector3(0, v * Math.sin(elev), 0));
}
function setOrbitFromOffset(off) { state.dist = off.length(); state.phi = Math.acos(THREE.MathUtils.clamp(off.y / state.dist, -1, 1)); state.theta = Math.atan2(off.x, off.z); }
function orbitOffset() { const s = Math.sin(state.phi); return new THREE.Vector3(state.dist * s * Math.sin(state.theta), state.dist * Math.cos(state.phi), state.dist * s * Math.cos(state.theta)); }
function orbitTangent() { return new THREE.Vector3(Math.cos(state.theta), 0, -Math.sin(state.theta)); }
function mapCamPos() { const s = Math.sin(state.mapPhi); return new THREE.Vector3(state.mapDist * s * Math.sin(state.mapTheta), state.mapDist * Math.cos(state.mapPhi), state.mapDist * s * Math.cos(state.mapTheta)); }

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const SPEEDS = [1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e7, YEAR_S, 10 * YEAR_S, 100 * YEAR_S, 1000 * YEAR_S, 1e4 * YEAR_S, 1e5 * YEAR_S, 1e6 * YEAR_S];
function speedLabel(s) { if (s < YEAR_S) return "×" + num(s); const y = s / YEAR_S; return num(y) + (y === 1 ? " year" : " years") + "/sec"; }
function pickSpeed(ls) { if (ls < 2) return Math.max(ls / 2.5, 0.0005); for (const s of SPEEDS) if (ls / s <= 40) return s; return SPEEDS[SPEEDS.length - 1]; }
const MILESTONES = [
  [50 * AU_LIGHT_S, "We've passed all the planets!"], [125 * AU_LIGHT_S, "We just crossed the heliopause, where the Sun's wind stops. Voyager 1 got here in 2012!"],
  [2000 * AU_LIGHT_S, "Entering the Oort Cloud, a giant faraway cloud of icy comets."], [4.24 * YEAR_S, "We're now further away than the nearest star!"],
  [1000 * YEAR_S, "1,000 light-years from home!"], [26000 * YEAR_S, "As far as the centre of our galaxy!"], [100000 * YEAR_S, "We're outside the Milky Way now!"], [1e6 * YEAR_S, "A million light-years from home!"]
];

function bezier(s, m, e, t, out) { const u = 1 - t; return out.copy(s).multiplyScalar(u * u).addScaledVector(m, 2 * u * t).addScaledVector(e, t * t); }
function bezierTan(s, m, e, t, out) { return out.copy(m).sub(s).multiplyScalar(2 * (1 - t)).addScaledVector(e.clone().sub(m), 2 * t).normalize(); }

function startTrip(toId, instant) {
  ["#sheet"].forEach(closeOverlay); hideCard(); stopSpeaking();
  if (state.mode === "map") leaveMap(true);
  if (state.mode === "rings") endRide(true);
  const from = state.cur, startPos = (rocket.visible ? rocket.position : camera.position).clone(), startLook = worldPos(from);
  const ls = lightSeconds(P[from], P[toId]);
  const deep = P[toId].grp === "deep" || P[from].grp === "deep";
  preloadVoice("p-" + toId);
  trip = { from, to: toId, instant, startPos, startLook, offset: arrivalOffset(toId, startPos), t: 0, light: 0, ls, speed: instant ? 0 : pickSpeed(ls),
    dur: instant ? (deep ? 2.6 : 1.8) : 0, chatTimer: 4, factTimer: 0, factIdx: 0, ms: 0, deep, fromSolar: P[from].grp !== "deep",
    facts: buildTripFacts(toId, deep), auPrev: P[from].grp === "deep" ? 0 : sysOf(P[from]).au, sFrom: rocketScale(from), sTo: rocketScale(toId) };
  if (instant) { const w = $("#warpfx"); w.classList.remove("on", "long"); void w.offsetWidth; w.classList.add("on"); if (deep) w.classList.add("long"); sfx("whoosh", trip.dur); }
  else renderTripHud();
  $("#go").hidden = true; document.body.classList.add("tripping");
}
function buildTripFacts(toId, deep) {
  const pool = (GD.tripFacts || []).concat([
    "Light travels about 300,000 km every second. Nothing is faster!", "At light speed you could zoom around Earth about 7 times in one second.",
    "Space is silent. There is no air to carry sound.", "Real rockets are much slower than light. New Horizons took more than 9 years to reach Pluto!"]);
  if (deep) pool.push("A light-year is how far light travels in a year: about 9.5 million million km!", "Even at light speed, crossing our galaxy would take about 100,000 years.");
  const f = shuffle(pool).slice(0, 5); f.splice(1, 0, P[toId].facts[0]); return f;
}
function renderTripHud() {
  const f = P[trip.from], t = P[trip.to], el = $("#trip"); el.hidden = false;
  el.innerHTML = '<h3>Travelling at the speed of light <small>' + esc(f.name) + " → " + esc(t.name) + "</small></h3>" +
    '<div class="track"><div class="fill" id="tfill"></div><div class="ship" id="tship">🚀</div></div>' +
    '<div class="ends"><span>' + esc(f.name) + "</span><span>" + esc(t.name) + "</span></div>" +
    '<div class="clock"><span>Light needs <b>' + fmtDur(trip.ls) + '</b> for this trip</span><span>Light-time so far: <b id="tclock">0:00</b></span></div>' +
    '<div class="warp" id="twarp"></div><div class="tripfact" id="tfact">' + esc(trip.facts[0]) + "</div>" +
    (window.Cabin ? '<button class="pill" id="tcabin">🛏️ Go inside the rocket</button>' : "");
  if ($("#tcabin")) $("#tcabin").onclick = openCabin;
  renderWarp();
}
function renderWarp() {
  const w = $("#twarp"); if (!w) return; let h = "<span>Time warp</span>";
  if (trip.ls < 2) h += '<button class="on" disabled>Slow-mo</button>';
  else {
    const base = pickSpeed(trip.ls), bi = SPEEDS.indexOf(base), list = SPEEDS.slice(Math.max(0, bi - 2), Math.min(SPEEDS.length, bi + 2));
    list.forEach((s) => (h += '<button data-s="' + s + '"' + (trip.speed === s ? ' class="on"' : "") + ">" + speedLabel(s) + "</button>"));
  }
  h += '<button class="skip" id="tskip">Arrive now ⏭</button>'; w.innerHTML = h;
  w.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { trip.speed = +b.dataset.s; renderWarp(); sfx("blip"); }));
  $("#tskip").addEventListener("click", () => { trip.speed = Math.max(trip.speed, (trip.ls - trip.light) / 1.2); renderWarp(); });
}
const PASS_ORBITS = ORDER.filter((id) => P[id].grp === "solar" && id !== "sun");
const _p = new THREE.Vector3(), _tan = new THREE.Vector3(), _mid = new THREE.Vector3();
function updateTrip(dt) {
  let t;
  if (trip.instant) { trip.t = Math.min(1, trip.t + dt / trip.dur); t = trip.t; camera.fov = 60 + 38 * Math.sin(Math.PI * t); camera.updateProjectionMatrix(); }
  else {
    trip.light = Math.min(trip.ls, trip.light + dt * trip.speed); trip.t = trip.ls > 0 ? trip.light / trip.ls : 1; t = trip.t;
    $("#tfill").style.width = t * 100 + "%"; $("#tship").style.left = t * 100 + "%"; $("#tclock").textContent = fmtClock(trip.light);
    trip.factTimer += dt; trip.chatTimer -= dt;
    if (trip.factTimer > 9 && trip.factIdx < trip.facts.length - 1) { trip.factTimer = 0; trip.factIdx++; const f = $("#tfact"); f.textContent = trip.facts[trip.factIdx]; f.style.animation = "none"; void f.offsetWidth; f.style.animation = ""; }
    if (trip.chatTimer <= 0) { trip.chatTimer = 11 + Math.random() * 6; tripChatter(trip.deep ? "deep" : trip.ls > 3600 ? "long" : "any"); }
    if (!trip.deep) {
      const a = sysOf(P[trip.from]).au, b = sysOf(P[trip.to]).au, au = a + (b - a) * t;
      PASS_ORBITS.forEach((pid) => { if ([trip.from, trip.to, sysOf(P[trip.to]).id, sysOf(P[trip.from]).id].includes(pid)) return;
        const pa = P[pid].au; if ((trip.auPrev < pa && au >= pa) || (trip.auPrev > pa && au <= pa)) toast("Passing " + (pid === "belt" || pid === "kuiper" ? "the " + P[pid].name : P[pid].name + "'s orbit") + "!"); });
      trip.auPrev = au;
    } else if (trip.fromSolar) {
      while (trip.ms < MILESTONES.length && trip.light >= MILESTONES[trip.ms][0] && MILESTONES[trip.ms][0] < trip.ls) { toast(MILESTONES[trip.ms][1]); trip.ms++; }
    }
  }
  const e = trip.instant ? ease(t) : easeSine(t);
  const T = worldPos(trip.to), end = T.clone().add(trip.offset), s = trip.startPos;
  _mid.copy(s).add(end).multiplyScalar(0.5); const len = s.distanceTo(end);
  const flat = _mid.clone().setY(0); if (flat.length() < 30) { if (flat.lengthSq() < 1e-6) flat.set(1, 0, 0); flat.setLength(30); _mid.x = flat.x; _mid.z = flat.z; }
  _mid.y += len * 0.22;
  bezier(s, _mid, end, e, _p); bezierTan(s, _mid, end, Math.min(0.999, Math.max(0.001, e)), _tan);
  const lookT = THREE.MathUtils.smoothstep(t, 0, trip.instant ? 0.35 : 0.08);
  const look = trip.startLook.clone().lerp(T, lookT);
  const sc = trip.sFrom + (trip.sTo - trip.sFrom) * e;
  if (save.view === "chase") {
    rocket.visible = true; rocket.position.copy(_p); rocket.scale.setScalar(sc); rocket.lookAt(_p.clone().add(_tan));
    const lookAhead = _p.clone().addScaledVector(_tan, 3 * sc).lerp(T, THREE.MathUtils.smoothstep(t, 0.75, 1));
    const desired = _p.clone().addScaledVector(_tan, -6 * sc).addScaledVector(UP, 2 * sc);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 6)); camera.lookAt(lookAhead);
  } else { rocket.visible = false; camera.position.copy(_p); camera.lookAt(look); }
  if (t >= 1) arrive();
}
function arrive() {
  const to = trip.to; trip = null; state.cur = to;
  camera.fov = 60; camera.updateProjectionMatrix();
  const rp = save.view === "chase" ? rocket.position.clone() : camera.position.clone();
  setOrbitFromOffset(rp.sub(worldPos(to)));
  $("#trip").hidden = true; $("#go").hidden = false; document.body.classList.remove("tripping");
  const p = P[to], isNew = !save.visited[to]; save.visited[to] = true; persist(); updatePassCount();
  sfx("chime");
  if (isNew) setTimeout(() => toast("New passport stamp: " + p.name + "!"), 400);
  state.cardFact = 0; state.factSet = "facts"; showCard();
  if (captainId() === "oda") setTimeout(() => { if (state.cur === to && !$("#card").hidden) $("#cread").click(); }, 4500);
  crewReact(p);
}
function goToMap() {
  if (state.mode === "rings") endRide(true);
  if (trip || state.mode === "map") return;
  hideCard(); stopSpeaking(); state.mode = "map"; document.body.classList.add("mapping"); $("#tMap").classList.add("on");
  tween = { t: 0, dur: 1.6, fromPos: camera.position.clone(), fromLook: worldPos(state.cur), toPos: () => mapCamPos(), toLook: () => new THREE.Vector3(0, 0, 0), done: () => {} };
  renderMapBar(); say("leo", "Here's the whole solar system from above. Press play to watch the planets go round!");
}
function leaveMap(silent) {
  state.mode = "orbit"; state.mapPlay = false; document.body.classList.remove("mapping"); $("#tMap").classList.remove("on"); $("#mapbar").hidden = true;
  if (silent) return;
  setOrbitFromOffset(arrivalOffset(state.cur, camera.position));
  tween = { t: 0, dur: 1.6, fromPos: camera.position.clone(), fromLook: new THREE.Vector3(), toPos: () => worldPos(state.cur).add(orbitOffset()), toLook: () => worldPos(state.cur), done: () => showCard() };
}
function renderMapBar() {
  const el = $("#mapbar"); el.hidden = false;
  const sp = [[0.2, "Slow"], [1, "Fast"], [5, "Super fast"]];
  el.innerHTML = "<h3>Our solar system from above</h3>" +
    '<div class="maprow"><button class="pill" id="mplay">' + (state.mapPlay ? "⏸ Pause" : "▶ Watch the planets orbit") + "</button>" +
    sp.map(([v, l]) => '<button class="tab' + (state.mapSpeed === v ? " on" : "") + '" data-ms="' + v + '">' + l + "</button>").join("") +
    '<span class="years" id="myears"></span></div>' +
    '<div class="maprow"><p class="hint" style="flex:1">Drag to tilt and spin, pinch to zoom, tap a planet to fly there. Watch Mercury race and Pluto crawl!</p><button class="pill" id="mback">Back to ' + esc(P[state.cur].name) + "</button></div>";
  $("#mplay").onclick = () => { state.mapPlay = !state.mapPlay; renderMapBar(); };
  el.querySelectorAll("[data-ms]").forEach((b) => (b.onclick = () => { state.mapSpeed = +b.dataset.ms; state.mapPlay = true; renderMapBar(); }));
  $("#mback").onclick = () => leaveMap(false);
  updateYears();
}
function updateYears() { const y = $("#myears"); if (y) y.textContent = "Earth years passed: " + state.mapYears.toFixed(1); }
function updateTween(dt) {
  tween.t = Math.min(1, tween.t + dt / tween.dur); const e = ease(tween.t);
  camera.position.copy(tween.fromPos).lerp(tween.toPos(), e);
  camera.lookAt(tween.fromLook.clone().lerp(tween.toLook(), e));
  if (tween.t >= 1) { const d = tween.done; tween = null; d && d(); }
}

/* =============== input =============== */
const pointers = new Map(); let downAt = null, pinchStart = null;
canvas.addEventListener("pointerdown", (e) => { canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 1) downAt = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
  if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchStart = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: state.mode === "map" ? state.mapDist : state.dist }; } });
canvas.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return; const prev = pointers.get(e.pointerId), dx = e.clientX - prev.x, dy = e.clientY - prev.y;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (trip || tween) return;
  if (pointers.size === 2 && pinchStart) { const [a, b] = [...pointers.values()]; zoomTo(pinchStart.dist * pinchStart.d / Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1)); return; }
  if (downAt) downAt.moved += Math.abs(dx) + Math.abs(dy);
  if (state.mode === "rings") { ride.look -= dx * 0.006; ride.tilt = THREE.MathUtils.clamp(ride.tilt + dy * 0.004, -0.5, 0.8); return; }
  if (state.mode === "map") { state.mapTheta -= dx * 0.006; state.mapPhi = THREE.MathUtils.clamp(state.mapPhi - dy * 0.005, 0.05, 1.45); return; }
  state.theta -= dx * 0.008; state.phi = THREE.MathUtils.clamp(state.phi - dy * 0.006, 0.25, Math.PI - 0.25); state.lastDrag = performance.now();
});
function endPointer(e) {
  if (!pointers.has(e.pointerId)) return; pointers.delete(e.pointerId); if (pointers.size < 2) pinchStart = null;
  if (downAt && pointers.size === 0) { if (downAt.moved < 10 && performance.now() - downAt.t < 450 && !trip && state.mode !== "rings") tapAt(e.clientX, e.clientY); downAt = null; }
}
canvas.addEventListener("pointerup", endPointer); canvas.addEventListener("pointercancel", endPointer);
canvas.addEventListener("wheel", (e) => { e.preventDefault(); if (!trip) zoomTo((state.mode === "map" ? state.mapDist : state.dist) * (1 + Math.sign(e.deltaY) * 0.1)); }, { passive: false });
function zoomTo(d) {
  if (state.mode === "map") { state.mapDist = THREE.MathUtils.clamp(d, 120, 1600); return; }
  const v = viewOf(state.cur); state.dist = THREE.MathUtils.clamp(d, v * 0.45, v * 3.5);
}
const ray = new THREE.Raycaster();
function tapAt(x, y) {
  ray.setFromCamera({ x: (x / window.innerWidth) * 2 - 1, y: -(y / window.innerHeight) * 2 + 1 }, camera);
  const hits = ray.intersectObjects(pickables, false).filter((h) => h.object.visible !== false || h.object.material.visible === false);
  const hit = hits.find((h) => { const id = h.object.userData.id; return id && id !== state.cur && (state.mode !== "map" || P[id].grp === "solar"); });
  if (hit) openSheet(hit.object.userData.id);
}
window.addEventListener("keydown", (e) => {
  if (!$("#start").hidden || paused) return;
  if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
  if (e.key === "Escape") { ["#sheet", "#quiz", "#passport", "#ask", "#editor", "#settings"].forEach(closeOverlay); if (state.mode === "map") leaveMap(false); return; }
  if (state.mode === "map") { if (e.key === "ArrowLeft") state.mapTheta -= 0.1; if (e.key === "ArrowRight") state.mapTheta += 0.1; return; }
  if (e.key === "ArrowLeft") state.theta -= 0.12; if (e.key === "ArrowRight") state.theta += 0.12;
  if (e.key === "ArrowUp") state.phi = Math.max(0.25, state.phi - 0.1); if (e.key === "ArrowDown") state.phi = Math.min(Math.PI - 0.25, state.phi + 0.1);
  if (/^Arrow/.test(e.key)) state.lastDrag = performance.now();
});

/* =============== crew chatter =============== */
const crewEl = $("#crew");
function renderCrew() {
  crewEl.querySelectorAll(".member").forEach((m) => m.remove());
  CREW_IDS.concat(["leo"]).forEach((id) => {
    const m = document.createElement("button"); m.className = "member" + (id === "leo" ? " leo" : ""); m.id = "crew-" + id;
    m.setAttribute("aria-label", id === "leo" ? "Ask Leo a question" : nameOf(id));
    m.innerHTML = '<div class="port">' + toSVG(shapesFor(id)) + "</div><span>" + esc(nameOf(id)) + "</span>";
    m.onclick = () => { if (id === "leo") openAsk(); else idleLine(id); };
    crewEl.appendChild(m);
  });
  $("#lineup").innerHTML = CREW_IDS.concat(["leo"]).map((id) => '<div class="member' + (id === "leo" ? " leo" : "") + '"><div class="port">' + toSVG(shapesFor(id)) + "</div><span>" + esc(nameOf(id)) + "</span></div>").join("");
}
const swapRole = (who) => (captainId() === "oda" ? (who === "harper" ? "oda" : who === "oda" ? "harper" : who) : who);
const fill = (text) => String(text).replace(/\b(Harper|Oda|Leo)\b/g, (m) => (m === "Leo" ? crew.leo.name : crew[swapRole(m.toLowerCase())].name));
let lastSay = 0;
function say(who, text, opts) {
  text = fill(text); lastSay = performance.now(); who = swapRole(who);
  const ids = who === "all" ? CREW_IDS : [who];
  ids.forEach((id, j) => {
    const m = $("#crew-" + id); if (!m) return;
    m.classList.remove("bounce"); void m.offsetWidth; m.classList.add("bounce");
    if (j === 0) { m.querySelectorAll(".bubble").forEach((b) => b.remove()); const b = document.createElement("div"); b.className = "bubble"; b.textContent = text; m.appendChild(b); setTimeout(() => b.remove(), 2400 + text.length * 45); }
  });
  const dog = who === "joules" || who === "maggie";
  if (dog || (who === "all" && /woof/i.test(text))) sfx("bark");
  if (who === "all") { confetti(50); sfx("happy"); }
  if (save.crewVoices && !dog && !(opts && opts.silent)) speak(text.replace(/\*[^*]+\*/g, ""), who === "all" ? "harper" : who, { queue: true });
}
function sayLines(lines, gap) {
  let tmo = 600;
  (lines || []).forEach(([who, text]) => { setTimeout(() => say(who, text), tmo); tmo += (gap || 1600) + String(text).length * 40; });
  return tmo;
}
function crewReact(p) {
  const lines = (p.react && p.react.length ? p.react : [["harper", "Wow!"]]).slice(0, 4);
  sayLines(lines);
}
function tripChatter(when) {
  const all = GD.tripChatter || [];
  const pool = all.map((x) => (Array.isArray(x) ? { when: "any", lines: x } : x)).filter((x) => x.when === "any" || x.when === when);
  if (pool.length) sayLines(pick(pool).lines, 1800);
}
function idleLine(who) {
  const lines = (GD.idleChatter || []).filter((l) => !who || l[0] === who);
  const l = lines.length ? pick(lines) : [who || "oda", who === "joules" || who === "maggie" ? "Woof!" : "Space is so big!"];
  say(l[0], l[1]);
}

/* =============== UI: card =============== */
function lightLine(p) {
  if (p.id === "earth") return "Home sweet home. Everyone you know lives here!";
  if (p.id === "sun") return "Sunlight takes about " + fmtDur(lightSeconds(p, P.earth)) + " to reach Earth.";
  const ls = lightSeconds(p, P.earth);
  if (p.grp === "deep") return "Light from here takes about " + fmtDur(ls) + " to reach Earth. So when we look at it from home, we see it as it was " + fmtDur(ls).replace(" years", " years ago").replace(" days", " days ago") + "!";
  if (p.grp === "craft" && p.parent === "earth") return "It's about " + num(p.km) + " km from Earth. Light gets there in " + fmtDur(ls) + ".";
  return "Light from here takes about " + fmtDur(ls) + " to reach Earth" + (sysOf(p).id === "earth" ? "." : " (when lined up).");
}
function quizStarsFor(id) { return (P[id].quiz || []).filter((_, i) => save.stars[id + ":" + i]).length; }
function showCard() {
  if (state.mode === "map" || state.mode === "rings") return;
  const p = P[state.cur], card = $("#card"), moons = moonsOf(p.id), craft = craftOf(p.id);
  const back = p.parent ? P[p.parent] : isFar(p.id) ? P.kuiper : null;
  const set = state.factSet === "more" && p.more && p.more.length ? p.more : p.facts, i = Math.min(state.cardFact, set.length - 1);
  const qn = (p.quiz || []).length, qs = quizStarsFor(p.id);
  let landBtn = "";
  if (p.land && window.Surface) landBtn = p.land.gas ? '<button class="btn land" id="cland">☁️ Try to land</button>' : '<button class="btn land" id="cland">👣 Step on it</button>';
  card.innerHTML = '<div class="card-head"><div class="dot" style="' + dotStyle(p) + '"></div><div><h2>' + esc(p.name) + '</h2><div class="kind">' + esc(p.kind) + '</div></div><button class="x" id="cx" aria-label="Hide facts">–</button></div>' +
    '<div class="lightline">' + esc(lightLine(p)) + "</div>" +
    (state.factSet === "more" ? '<div class="factmode">Tell me more</div>' : "") +
    '<p class="fact">' + esc(fill(set[i])) + "</p>" +
    '<div class="fact-nav"><button class="round" id="cprev" aria-label="Previous fact">‹</button><div class="dots">' + set.map((_, k) => "<i" + (k === i ? ' class="on"' : "") + "></i>").join("") + '</div><button class="round" id="cnext" aria-label="Next fact">›</button></div>' +
    '<div class="card-actions"><button class="btn" id="cread">🔊 Read to me</button>' +
    (p.more && p.more.length ? '<button class="btn" id="cmore">' + (state.factSet === "more" ? "⭐ Quick facts" : "🔭 Tell me more") + "</button>" : "") +
    (qn ? '<button class="btn quiz" id="cquiz">⭐ Quiz ' + qs + "/" + qn + "</button>" : "") +
    (p.id === "myplanet" ? '<button class="btn quiz" id="cdesign">🎨 ' + (save.myPlanet ? "Change my planet" : "Design my planet") + "</button>" : "") +
    landBtn + (p.id === "saturn" ? '<button class="btn land" id="cride">🪐 Ride the rings</button>' : "") +
    (p.photo ? '<a class="btn" href="' + esc(p.photo) + '" target="_blank" rel="noopener">📷 Real photo</a>' : "") +
    '<button class="btn" id="cask">🧑‍🚀 Ask Leo</button></div>' +
    (moons.length ? '<div class="moons"><h3>Fly to a moon</h3><div class="chips">' + moons.map((m) => chip(P[m])).join("") + "</div></div>" : "") +
    (craft.length ? '<div class="moons"><h3>Spacecraft nearby</h3><div class="chips">' + craft.map((m) => chip(P[m])).join("") + "</div></div>" : "") +
    (back ? '<div class="moons"><h3>Head back</h3><div class="chips">' + chip(back) + "</div></div>" : "");
  card.hidden = false; $("#cardmin").hidden = true;
  $("#cx").onclick = () => { card.hidden = true; $("#cardmin").hidden = false; };
  $("#cprev").onclick = () => { state.cardFact = (i + set.length - 1) % set.length; showCard(); };
  $("#cnext").onclick = () => { state.cardFact = (i + 1) % set.length; showCard(); };
  $("#cread").onclick = () => speak(p.name + ". " + fill(set[i]), "narrator");
  if ($("#cmore")) $("#cmore").onclick = () => { state.factSet = state.factSet === "more" ? "facts" : "more"; state.cardFact = 0; showCard(); };
  if ($("#cquiz")) $("#cquiz").onclick = () => openQuiz(p.quiz.map((_, k) => [p.id, k]), p.name + " quiz");
  if ($("#cland")) $("#cland").onclick = () => land(p);
  if ($("#cride")) $("#cride").onclick = startRide;
  if ($("#cdesign")) $("#cdesign").onclick = openPlanetMaker;
  $("#cask").onclick = () => openAsk("Tell me something amazing about " + p.name + "!");
  card.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => openSheet(b.dataset.go)));
}
function chip(m) { return '<button class="chip" data-go="' + m.id + '"><span class="dot" style="' + dotStyle(m) + '"></span>' + esc(m.name) + "</button>"; }
function hideCard() { $("#card").hidden = true; $("#cardmin").hidden = true; }
$("#cardmin").onclick = showCard;

/* =============== UI: fly sheet =============== */
const TABS = [["planets", "Planets"], ["moons", "Moons"], ["craft", "Spacecraft"], ["deep", "Deep space"]];
let sheetTab = "planets";
function tabOf(id) { const g = P[id].grp; return g === "solar" ? "planets" : g === "moon" ? "moons" : g === "craft" ? "craft" : "deep"; }
function openSheet(sel) { $("#sheet").hidden = false; if (sel) sheetTab = tabOf(sel); renderSheet(sel || null); }
function renderSheet(sel) {
  const el = $("#sheet"), here = P[state.cur];
  let h = '<div class="sheet" role="dialog" aria-label="Choose where to fly"><div class="sheet-head"><h2>' + (sel ? "Fly to " + esc(P[sel].name) + "?" : "Where shall we go?") + '</h2><button class="round" id="sclose" aria-label="Close">✕</button></div>';
  if (sel && sel === "myplanet" && isLocked(sel)) {
    h += '<p class="quiz-msg">🔒 Watch the whole Story of the Solar System (📖 Story button) to unlock Planet Maker and design your very own planet!</p><div><button class="chip plain" id="sback">Pick somewhere else</button></div>';
  } else if (sel && isLocked(sel)) {
    h += '<p class="quiz-msg">🔒 ' + esc(P[sel].name) + " is very far away! Earn " + (UNLOCK[sel] - starCount()) + " more ⭐ by answering quiz questions to unlock it.</p>" +
      '<p class="hint">You have ' + starCount() + ' stars. Try a quiz on any planet you\'ve visited, or play a game in the Arcade.</p><div><button class="chip plain" id="sback">Pick somewhere else</button></div>';
  } else if (sel) {
    const ls = lightSeconds(here, P[sel]);
    h += '<div class="modes"><button class="mode instant" id="minstant"><b>⚡ Instant</b><span>Whoosh! There in 2 seconds.</span></button>' +
      '<button class="mode light" id="mlight"><b>💡 Light speed</b><span>Real light needs ' + fmtDur(ls) + ". Watch the meter and use time warp to speed up.</span></button></div>" +
      '<p class="hint">From ' + esc(here.name) + " to " + esc(P[sel].name) + '.</p><div><button class="chip plain" id="sback">Pick somewhere else</button></div>';
  } else {
    h += '<div class="tabs">' + TABS.map(([k, l]) => '<button class="tab' + (sheetTab === k ? " on" : "") + '" data-tab="' + k + '">' + l + "</button>").join("") + "</div>";
    const ids = ORDER.filter((id) => tabOf(id) === sheetTab || (sheetTab === "planets" && id === "moon"));
    h += '<div class="grid">' + ids.map((id) => { const p = P[id], lock = isLocked(id), here2 = id === state.cur;
      return '<button class="dest' + (here2 ? " here" : "") + (lock ? " locked" : "") + '" data-id="' + id + '"' + (here2 ? " disabled" : "") + '><span class="dot" style="' + dotStyle(p) + '"></span>' + esc(p.name) +
        '<span class="stamp-mini">' + (here2 ? "You are here" : lock ? (id === "myplanet" ? "🔒 📖 Story" : "🔒 " + UNLOCK[id] + " ⭐") : save.visited[id] ? "✓ visited" : "") + "</span></button>"; }).join("") + "</div>" +
      '<p class="hint">' + (sheetTab === "deep" ? "These are far beyond our solar system. Light takes years, even millions of years, to get there!" : "Tip: you can also tap a planet or its name in the window.") + "</p>";
  }
  el.innerHTML = h + "</div>";
  $("#sclose").onclick = () => closeOverlay("#sheet");
  el.onclick = (e) => { if (e.target === el) closeOverlay("#sheet"); };
  el.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { sheetTab = b.dataset.tab; renderSheet(null); }));
  el.querySelectorAll("[data-id]").forEach((b) => (b.onclick = () => renderSheet(b.dataset.id)));
  if ($("#sback")) $("#sback").onclick = () => renderSheet(null);
  if ($("#minstant")) { $("#minstant").onclick = () => startTrip(sel, true); $("#mlight").onclick = () => startTrip(sel, false); }
}
function closeOverlay(s) { const el = $(s); if (!el || el.hidden) return; el.hidden = true; if (s === "#quiz" || s === "#ask") stopSpeaking(); if (s === "#ask" && askCtl) askCtl.abort(); }

/* =============== UI: big quiz =============== */
let quiz = null;
function openQuiz(items, title) {
  items = items.filter(([pid, k]) => P[pid] && P[pid].quiz && P[pid].quiz[k]);
  if (!items.length) { toast("No quiz questions here yet!"); return; }
  quiz = { items, title, i: 0, right: 0, tries: 0, done: false, gained: 0 };
  $("#quiz").hidden = false; renderQuiz();
}
function renderQuiz() {
  const el = $("#quiz"), q = quiz;
  if (q.i >= q.items.length) {
    el.innerHTML = '<div class="sheet" role="dialog" aria-label="Quiz results"><div class="sheet-head"><h2>' + esc(q.title) + '</h2><button class="round" id="qclose" aria-label="Close">✕</button></div>' +
      '<div class="quiz-end"><div class="big">' + q.right + " / " + q.items.length + '</div><p class="quiz-msg">' + (q.right === q.items.length ? "Perfect score, Captain!" : q.right > 0 ? "Brilliant work!" : "Good try! Every astronaut keeps learning.") + "</p>" +
      '<p class="quiz-msg">' + (q.gained ? "You earned " + q.gained + " new ⭐! " : "") + "You have " + starCount() + " stars.</p>" +
      '<div class="quiz-foot" style="justify-content:center"><button class="bigbtn" id="qdone">Done</button></div></div></div>';
    $("#qclose").onclick = $("#qdone").onclick = () => { closeOverlay("#quiz"); if (!$("#card").hidden) showCard(); };
    if (q.right === q.items.length) confetti(90);
    return;
  }
  const [pid, k] = q.items[q.i], item = P[pid].quiz[k], opts = shuffle(item.a), letters = "ABCD";
  el.innerHTML = '<div class="sheet" role="dialog" aria-label="Quiz"><div class="sheet-head"><span class="dot" style="' + dotStyle(P[pid]) + '"></span><h2>' + esc(q.title) + '</h2><button class="round" id="qread" aria-label="Read the question">🔊</button><button class="round" id="qclose" aria-label="Close">✕</button></div>' +
    '<div class="qprog">' + q.items.map((_, n) => "<i" + (n < q.i ? ' class="done"' : n === q.i ? ' class="now"' : "") + "></i>").join("") + "</div>" +
    '<p class="quiz-q">' + esc(fill(item.q)) + '</p><div class="answers">' + opts.map((o, n) => '<button class="answer" data-a="' + esc(o) + '"><i>' + letters[n] + "</i>" + esc(o) + "</button>").join("") + "</div>" +
    '<p class="quiz-msg" id="qmsg"></p><div class="quiz-foot"><button class="bigbtn" id="qnext" hidden>Next ›</button></div></div>';
  q.tries = 0;
  $("#qclose").onclick = () => closeOverlay("#quiz");
  $("#qread").onclick = () => speak([fill(item.q)].concat(opts.flatMap((o, n) => (n === opts.length - 1 ? ["or", o] : [o]))), "narrator");
  $("#qnext").onclick = () => { q.i++; renderQuiz(); };
  el.querySelectorAll(".answer").forEach((b) => (b.onclick = () => {
    if (b.disabled || $("#qnext").hidden === false) return;
    if (b.dataset.a === item.a[0]) {
      b.classList.add("right"); sfx("happy");
      const key = pid + ":" + k; let msg = "Correct!";
      if (q.tries === 0) q.right++;
      if (!save.stars[key] && q.tries === 0) { save.stars[key] = true; q.gained++; persist(); updatePassCount(); msg = "Correct! +1 ⭐"; confetti(30); checkMaster(); }
      else if (!save.stars[key]) msg = "Correct! Get it right first time to win its ⭐.";
      $("#qmsg").innerHTML = esc(msg) + (item.why ? "<small>" + esc(fill(item.why)) + "</small>" : "");
      if (item.why && save.crewVoices) speak(fill(item.why), "narrator");
      $("#qnext").hidden = false; $("#qnext").textContent = q.i === q.items.length - 1 ? "See my score ›" : "Next ›";
      const c = (GD.quizCheers && GD.quizCheers.right) || [["harper", "Yes!"]]; const l = pick(c); say(l[0], l[1], { silent: true });
      el.querySelectorAll(".answer").forEach((x) => (x.disabled = true));
    } else {
      q.tries++; b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong"); b.disabled = true; sfx("oops");
      $("#qmsg").textContent = "Not quite. Have another go!";
      const c = (GD.quizCheers && GD.quizCheers.wrong) || [["mum", "You can do it!"]]; const l = pick(c); say(l[0], l[1], { silent: true });
    }
  }));
}
function bigQuiz() {
  const visited = Object.keys(save.visited).filter((id) => P[id] && P[id].quiz && P[id].quiz.length);
  const all = []; visited.forEach((id) => P[id].quiz.forEach((_, k) => all.push([id, k])));
  if (all.length < 3) { toast("Visit a few more places first!"); return; }
  closeOverlay("#passport"); openQuiz(shuffle(all).slice(0, 10), "Big Space Quiz");
}

/* =============== UI: passport =============== */
function updatePassCount() { $("#passCount").textContent = (isMaster() ? "👑" : "⭐") + starCount(); }
function storyDone() { return !!(save.gameStars && save.gameStars.story); }
function checkMaster() {
  if (!isMaster() || save.profiles[captainId()].master) return;
  save.profiles[captainId()].master = true; save["master_" + captainId()] = true; persist();
  confetti(160); sfx("happy"); toast("👑 " + ULTIMATE + " stars! You are Master of the Universe! Everything is unlocked!", 6000);
  setTimeout(() => say("all", "Master of the Universe!"), 800);
}
// Everything you can unlock, cheapest first (shown in the passport)
const GAME_STARS = { catch: 0, aliens: 0, dodge: 6, jetpack: 9, jetmaggie: 11, planets: 12, lander: 16, memory: 20, meteors: 25, stars: 30 };
function unlockList() {
  const L = [];
  Object.entries(UNLOCK).forEach(([id, n]) => L.push([n, "🔭", P[id].name]));
  Object.entries(STICKER_STARS).forEach(([id, n]) => L.push([n, "🏷️", id[0].toUpperCase() + id.slice(1) + " sticker"]));
  Object.entries(ROCKET_LOCKS.pattern).forEach(([id, n]) => L.push([n, "🎨", id[0].toUpperCase() + id.slice(1) + " rocket pattern"]));
  Object.entries(ROCKET_LOCKS.shape).forEach(([id, n]) => L.push([n, "🚀", id[0].toUpperCase() + id.slice(1) + " rocket shape"]));
  L.push([ROCKET_LOCKS.windows[3], "🪟", "Three rocket windows"]);
  HATS.filter((h) => h[2] && h[2] < ULTIMATE).forEach((h) => L.push([h[2], "🎩", h[1]]));
  L.push([8, "🕶️", "Star glasses"]);
  Object.entries(GAME_STARS).filter(([, n]) => n).forEach(([id, n]) => L.push([n, "🕹️", { dodge: "Asteroid Dodge", planets: "Planet Line-up", memory: "Space Memory", stars: "Connect the Stars", jetpack: "Jetpack Joules", jetmaggie: "Jetpack Maggie", lander: "Moon Lander", meteors: "Meteor Shower" }[id] + " game"]));
  L.push([ULTIMATE, "👑", "Master of the Universe: the Universe crown and the whole game"]);
  return L.sort((a, b) => a[0] - b[0]);
}
function openPassport() {
  const el = $("#passport"), n = Object.keys(save.visited).filter((k) => P[k]).length; el.hidden = false;
  const groups = [["Planets and more", "planets"], ["Moons", "moons"], ["Spacecraft", "craft"], ["Deep space", "deep"]];
  el.innerHTML = '<div class="sheet" role="dialog" aria-label="Space passport"><div class="sheet-head"><h2>' + esc(crew[captainId()].name) + '\'s Space Passport</h2><button class="round" id="pclose" aria-label="Close">✕</button></div>' +
    '<div class="score"><span>' + n + " of " + ORDER.length + ' stamps</span><span class="s">⭐ ' + starCount() + ' stars</span><button class="bigbtn" id="pquiz">Big Space Quiz</button></div>' +
    '<div class="ultimate"><div class="ubar"><i style="width:' + Math.min(100, (starCount() / ULTIMATE) * 100).toFixed(1) + '%"></i></div><span>' + (isMaster() ? "👑 Master of the Universe! Everything is open." : "⭐ " + starCount() + " of " + ULTIMATE + " to become Master of the Universe and unlock the whole game") + "</span></div>" +
    '<p class="hint">Win a star by getting a quiz question right first time, and up to 3 stars in each Arcade game. The better the prize, the more stars it costs.</p>' +
    '<div class="pass-group"><h3>Unlocks</h3><div class="unlocks">' + '<div class="unl' + (storyDone() ? " got" : "") + '"><span>🪐</span><b>Planet Maker, Galaxy rocket paint + 15 ⭐</b><em>' + (storyDone() ? "✓" : "📖 Watch the whole Story") + "</em></div>" + unlockList().map(([n, ic, label]) => '<div class="unl' + (isOpen(n) ? " got" : "") + '"><span>' + ic + "</span><b>" + esc(label) + "</b><em>" + (isOpen(n) ? "✓" : "🔒 " + n + " ⭐") + "</em></div>").join("") + "</div></div>" +
    groups.map(([t, g]) => '<div class="pass-group"><h3>' + t + '</h3><div class="pass-grid">' + ORDER.filter((id) => tabOf(id) === g).map((id) => { const p = P[id], qs = quizStarsFor(id), qn = (p.quiz || []).length;
      return '<div class="pass' + (save.visited[id] ? " got" : "") + '">' + (save.visited[id] ? '<span class="stamp">VISITED</span>' : "") + '<span class="dot" style="' + dotStyle(p) + '"></span>' + esc(p.name) + '<span class="star">' + (qs ? "⭐".repeat(qs) : "") + (qn && qs < qn ? '<span style="opacity:.35">' + "☆".repeat(qn - qs) + "</span>" : "") + "</span></div>"; }).join("") + "</div></div>").join("") + "</div>";
  $("#pclose").onclick = () => closeOverlay("#passport"); el.onclick = (e) => { if (e.target === el) closeOverlay("#passport"); };
  $("#pquiz").onclick = bigQuiz;
}

/* =============== Ask Leo =============== */
let sampleFn = null, sampleState = "loading", askCtl = null; const askTurns = [];
(async () => { try { if (window.claude && window.claude.use) sampleFn = await window.claude.use("sample"); } catch (e) { sampleFn = null; } sampleState = sampleFn ? "ok" : "none"; if (!$("#ask").hidden) renderAsk(); })();
const ASK_RULES = () => "You are " + crew.leo.name + ", a friendly astronaut who is the space teacher inside a space-exploration game. " + (captainId() === "oda" ? "Today the player is " + crew.oda.name + ", a 5-year-old girl (Captain " + crew.oda.name + "). Use very short, very simple sentences for her. Her crew: her dad, her mum, her big sister " + crew.harper.name + " (10)" : "The player is " + crew.harper.name + ", a 10-year-old girl (Captain " + crew.harper.name + "). Her crew: her dad, her mum, her little sister " + crew.oda.name + " (5)") + " and two springer spaniels, Joules and Maggie. " +
  "Answer her questions about space, astronomy, planets, stars, rockets and science. Be accurate (current science; say 'scientists think' when something isn't certain). Use 2 to 5 short sentences, simple words, British spelling, warm and encouraging, and one fun comparison when it helps. " +
  "Plain text only: no markdown, no headings, no lists; at most one emoji. If a question is not about space or science, kindly say you're a space teacher and steer back to space. Never ask for personal details. Keep everything suitable for a young child. " +
  "Right now the rocket is at: " + P[state.cur].name + ".";
function leoFace() { return '<div class="face">' + toSVG(leoShapes()) + "</div>"; }
function openAsk(prefill) { $("#ask").hidden = false; renderAsk(); if (prefill && sampleState === "ok") sendAsk(prefill); }
function renderAsk() {
  const el = $("#ask"), sugg = shuffle(GD.askSuggestions || ["How did the Sun start?", "What is a black hole?", "Why is Pluto not a planet any more?", "How do rockets work?"]).slice(0, 4);
  el.innerHTML = '<div class="sheet" role="dialog" aria-label="Ask Leo"><div class="sheet-head">' + leoFace() + '<h2>Ask ' + esc(crew.leo.name) + '</h2><button class="round" id="aclose" aria-label="Close">✕</button></div>' +
    '<div class="chat" id="chat"></div>' +
    (sampleState === "ok" ? '<div class="asktools">' + sugg.map((s) => '<button class="chip plain" data-q="' + esc(s) + '">' + esc(s) + "</button>").join("") + "</div>" +
      '<form class="askrow" id="aform"><input id="ainput" maxlength="300" placeholder="Ask a space question…" autocomplete="off" enterkeyhint="send"><button class="bigbtn" id="asend">Ask</button></form>'
      : '<p class="hint">' + (sampleState === "loading" ? "Leo is getting on the radio…" : "Leo can only answer questions when the game is opened inside Claude, and someone allows it to ask Claude.") + "</p>") + "</div>";
  const chat = $("#chat");
  if (!askTurns.length) addMsg("leo", "Hello Captain " + crew[captainId()].name + "! I'm " + crew.leo.name + ". Ask me anything about space and I'll do my best to explain.");
  else askTurns.forEach((t) => addMsg(t.role === "user" ? "me" : "leo", t.content));
  $("#aclose").onclick = () => closeOverlay("#ask"); el.onclick = (e) => { if (e.target === el) closeOverlay("#ask"); };
  if ($("#aform")) {
    $("#aform").onsubmit = (e) => { e.preventDefault(); const v = $("#ainput").value.trim(); if (v) { $("#ainput").value = ""; sendAsk(v); } };
    el.querySelectorAll("[data-q]").forEach((b) => (b.onclick = () => sendAsk(b.dataset.q)));
  }
  chat.scrollTop = chat.scrollHeight;
}
function addMsg(kind, text) {
  const chat = $("#chat"); if (!chat) return null; const d = document.createElement("div"); d.className = "msg " + kind;
  if (kind === "leo") { d.innerHTML = leoFace() + '<div class="say"><div class="txt"></div><div class="tools-row"><button>🔊 Read</button></div></div>'; d.querySelector(".txt").textContent = text; d.querySelector("button").onclick = () => speak(d.querySelector(".txt").textContent, "leo"); }
  else d.textContent = text;
  chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d;
}
async function sendAsk(q) {
  if (!sampleFn || askCtl) return;
  addMsg("me", q); askTurns.push({ role: "user", content: q });
  const bubble = addMsg("leo", "Leo is thinking…"), txt = bubble.querySelector(".txt");
  const btn = $("#asend"); if (btn) btn.disabled = true;
  askCtl = new AbortController();
  try {
    const turns = askTurns.slice(-10);
    const { text } = await sampleFn([{ role: "user", content: ASK_RULES() }].concat(turns[0].role === "user" ? turns : turns.slice(1)), { cache: false, signal: askCtl.signal, modelTier: "quick", onText: ({ text }) => { txt.textContent = text; $("#chat").scrollTop = 1e6; } });
    txt.textContent = text; askTurns.push({ role: "assistant", content: text });
    if (save.crewVoices) speak(text, "leo");
  } catch (e) {
    askTurns.pop();
    const code = e && e.code;
    if (code === "cancelled") txt.textContent = e.text || "(stopped)";
    else if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(code)) { sampleState = "none"; txt.textContent = "My radio isn't allowed to connect right now, so I can't answer questions here."; }
    else if (code === "rate_limited") txt.textContent = "Phew, lots of questions! Give me a little rest and try again soon.";
    else if (code === "refused") txt.textContent = "Let's ask a different space question!";
    else txt.textContent = (e && e.text ? e.text + "\n\n" : "") + "Oops, my radio crackled. Try asking again.";
  } finally { askCtl = null; if (btn) btn.disabled = false; }
}

/* =============== crew editor =============== */
let editWho = "harper";
function openEditor() { $("#editor").hidden = false; renderEditor(); }
function swatches(key, list, cur, lockFn) {
  return '<div class="sw">' + list.map((v) => { const val = Array.isArray(v) ? v[0] : v, label = Array.isArray(v) ? v[1] : "", need = lockFn ? lockFn(v) : 0, locked = !isOpen(need);
    return label ? '<button class="txt' + (cur === val ? " on" : "") + (locked ? " lock" : "") + '" data-k="' + key + '" data-v="' + esc(val) + '"' + (locked ? ' data-need="' + need + '"' : "") + ">" + (locked ? "🔒 " : "") + esc(label) + "</button>"
      : '<button style="background:' + val + '" class="' + (cur === val ? "on" : "") + '" data-k="' + key + '" data-v="' + val + '" aria-label="' + val + '"></button>'; }).join("") + "</div>";
}
function renderEditor() {
  const el = $("#editor"), c = crew[editWho], dog = c.type === "dog";
  const opt = (t, html) => '<div class="opt"><h4>' + t + "</h4>" + html + "</div>";
  let body;
  if (dog) body = opt("Coat", swatches("coat", COATS, c.coat)) + opt("Patch", swatches("patch", PATCHES, c.patch)) + opt("Collar", swatches("collar", SHIRTS, c.collar)) +
    opt("Tongue", swatches("tongue", [["yes", "Out"], ["no", "In"]], c.tongue ? "yes" : "no")) + opt("Hat", swatches("hat", HATS, c.hat, (h) => h[2]));
  else if (c.type === "astronaut") body = opt("Skin", swatches("skin", SKINS, c.skin)) + opt("Hair colour", swatches("hair", HAIRS, c.hair)) + opt("Spacesuit", swatches("suit", SUITS, c.suit)) +
    opt("Visor", swatches("visor", VISORS, c.visor)) + opt("Badge", swatches("badge", SHIRTS, c.badge)) + opt("Glasses", swatches("glasses", GLASSES, c.glasses, (g) => g[2])) +
    opt("Hat", swatches("hat", HATS, c.hat, (h) => h[2])) + opt("Beard", swatches("beard", [["yes", "Beard"], ["no", "No beard"]], c.beard ? "yes" : "no"));
  else body = opt("Skin", swatches("skin", SKINS, c.skin)) + opt("Hair colour", swatches("hair", HAIRS, c.hair)) + opt("Hair style", swatches("style", STYLES, c.style)) +
    opt("Top", swatches("shirt", SHIRTS, c.shirt)) + opt("Glasses", swatches("glasses", GLASSES, c.glasses, (g) => g[2])) + opt("Hat", swatches("hat", HATS, c.hat, (h) => h[2])) +
    (c.type === "adult" ? opt("Beard", swatches("beard", [["yes", "Beard"], ["no", "No beard"]], c.beard ? "yes" : "no")) : "");
  el.innerHTML = '<div class="sheet" role="dialog" aria-label="Design the crew"><div class="sheet-head"><h2>Design your crew</h2><button class="round" id="eclose" aria-label="Done">✓</button></div>' +
    '<div class="who">' + CREW_IDS.concat(["leo"]).map((id) => '<button class="' + (id === editWho ? "on" : "") + '" data-who="' + id + '" aria-label="' + esc(nameOf(id)) + '"><div class="port">' + toSVG(shapesFor(id)) + "</div></button>").join("") + "</div>" +
    '<div class="edit-wrap"><div class="edit-preview"><div class="port">' + toSVG(shapesFor(editWho)) + '</div><input id="ename" maxlength="12" value="' + esc(c.name) + '" aria-label="Name"><label class="chip plain photo-btn">📷 ' + (c.photo ? "New photo" : "Use a photo") + '<input type="file" accept="image/*" id="ephoto" hidden></label>' + (c.photo ? '<button class="chip plain" id="enophoto">Cartoon face</button>' : "") + '<small class="photo-note">Photos stay on this iPad.</small><button class="chip plain" id="ereset">Reset ' + esc(c.name) + "</button></div><div>" + body + "</div></div></div>";
  $("#eclose").onclick = () => { closeOverlay("#editor"); say(editWho, editWho === "joules" || editWho === "maggie" ? "Woof woof!" : "I love my new look!"); };
  el.querySelectorAll("[data-who]").forEach((b) => (b.onclick = () => { editWho = b.dataset.who; renderEditor(); }));
  $("#ename").oninput = (e) => { c.name = e.target.value.trim() || DEFAULT_CREW[editWho].name; saveCrew(false); };
  $("#ename").onchange = () => renderEditor();
  $("#ephoto").onchange = (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; makeFacePhoto(file).then((url) => { c.photo = url; saveCrew(true); buildRocket(); sfx("happy"); }).catch(() => toast("Sorry, that photo didn't work. Try another one.")); };
  if ($("#enophoto")) $("#enophoto").onclick = () => { c.photo = ""; saveCrew(true); buildRocket(); };
  $("#ereset").onclick = () => { crew[editWho] = Object.assign({}, DEFAULT_CREW[editWho]); saveCrew(true); };
  el.querySelectorAll("[data-k]").forEach((b) => (b.onclick = () => {
    if (b.dataset.need) { toast("Earn " + (b.dataset.need - starCount()) + " more ⭐ to unlock this!"); return; }
    const k = b.dataset.k, v = b.dataset.v;
    c[k] = k === "tongue" || k === "beard" ? v === "yes" : v; saveCrew(true); sfx("blip");
  }));
}
// shrink a photo to a small square face (centre, a little above middle) so it fits in storage
function makeFacePhoto(file) {
  return new Promise((res, rej) => {
    const rd = new FileReader(), im = new Image();
    im.onload = () => {
      const n = Math.min(im.naturalWidth, im.naturalHeight), sx = (im.naturalWidth - n) / 2, sy = (im.naturalHeight - n) * 0.3;
      const cv = document.createElement("canvas"); cv.width = cv.height = 160; cv.getContext("2d").drawImage(im, sx, sy, n, n, 0, 0, 160, 160);
      res(cv.toDataURL("image/jpeg", 0.82));
    };
    im.onerror = rej; rd.onload = () => (im.src = rd.result); rd.onerror = rej; rd.readAsDataURL(file);
  });
}
function saveCrew(rerender) { save.crew = crew; persist(); renderCrew(); if (rerender) renderEditor(); if (!$("#ask").hidden) renderAsk(); }

/* =============== settings =============== */
function openSettings() {
  loadVoices(); const el = $("#settings"); el.hidden = false;
  const cur = mainVoice();
  el.innerHTML = '<div class="sheet" role="dialog" aria-label="Settings"><div class="sheet-head"><h2>Settings</h2><button class="round" id="xclose" aria-label="Close">✕</button></div>' +
    '<div class="set-row"><label for="vsel">Reading voice<small>Natural voices are recorded for every fact, quiz, the story and the crew. Anything new, like Leo\'s answers, uses the iPad\'s own voice.</small></label>' +
    '<select id="vsel"><option value=""' + (!save.voice ? " selected" : "") + '>✨ Natural voices (best)</option>' + voices.map((v) => '<option value="' + esc(v.name) + '"' + (save.voice && cur && v.name === cur.name ? " selected" : "") + ">iPad: " + esc(v.name) + " (" + esc(v.lang) + ")</option>").join("") + '</select><button class="pill" id="vtry">▶ Try it</button></div>' +
    '<div class="set-row"><label>Crew talk out loud<small>The family and Leo read their speech bubbles aloud.</small></label><button class="switch' + (save.crewVoices ? " on" : "") + '" id="scv" aria-label="Crew talk out loud"></button></div>' +
    '<div class="set-row"><label>Grown-up: unlock everything<small>Opens every galaxy, sticker and hat without stars.</small></label><button class="switch' + (save.unlockAll ? " on" : "") + '" id="sul" aria-label="Unlock everything"></button></div>' +
    '<div class="set-row"><label>Change player<small>Switch between ' + esc(crew.harper.name) + "\'s and " + esc(crew.oda.name) + '\'s games. Each has her own rocket, stamps and stars.</small></label><button class="pill" id="splayer">Switch to ' + esc(crew[captainId() === "oda" ? "harper" : "oda"].name) + '</button></div>' +
    '<div class="set-row"><label>Start again<small>Clears ' + esc(crew[captainId()].name) + '\'s passport stamps and stars on this iPad. The crew and rocket designs stay.</small></label><button class="pill" id="sreset">Clear progress</button></div></div>';
  $("#xclose").onclick = () => closeOverlay("#settings"); el.onclick = (e) => { if (e.target === el) closeOverlay("#settings"); };
  $("#vsel").onchange = (e) => { save.voice = e.target.value; persist(); };
  $("#vtry").onclick = () => speak(fill("Hello Captain Harper! This is how I sound."), "narrator");
  $("#splayer").onclick = () => { closeOverlay("#settings"); switchPlayer(captainId() === "oda" ? "harper" : "oda"); stopSpeaking(); $("#start").hidden = false; };
  $("#scv").onclick = () => { save.crewVoices = !save.crewVoices; persist(); openSettings(); };
  $("#sul").onclick = () => { save.unlockAll = !save.unlockAll; persist(); openSettings(); };
  $("#sreset").onclick = (e) => {
    const b = e.currentTarget; if (b.dataset.sure) { save.visited = {}; save.stars = {}; save.gameStars = {}; persist(); updatePassCount(); toast("Progress cleared"); openSettings(); return; }
    b.dataset.sure = "1"; b.textContent = "Tap again to clear"; b.style.background = "var(--rocket-deep)";
  };
}

/* =============== landing, story, rocket, games hooks =============== */
function pauseFor(fn) { paused = true; stopSpeaking(); return () => { paused = false; last = performance.now(); fn && fn(); }; }
function land(p) {
  if (!window.Surface) return;
  const resume = pauseFor(() => { showCard(); say("dad", "Welcome back aboard, Captain!", { silent: false }); });
  const au = p.id === "sun" ? 0 : sysOf(p).au;
  try { window.Surface.open({ place: { id: p.id, name: p.name, land: p.land }, character: astronautCanvas(captainId()), homeName: crew[captainId()].name, followers: CREW_IDS.filter((id) => id !== captainId()).map((id) => ({ canvas: astronautCanvas(id), dog: crew[id].type === "dog", scale: crew[id].type === "dog" ? 0.62 : crew[id].small ? 0.78 : crew[id].type === "adult" ? 1.15 : 1 })), sunScale: au ? 1 / au : 1, enterHome: openHome, onClose: resume }); }
  catch (e) { console.error(e); resume(); }
  const ll = GD.landLines; if (ll) { const pool = p.land.gas ? ll.gas : p.land.g < 0.2 ? ll.lowGravity : ll.rocky; if (pool && pool.length) { const l = pick(pool); setTimeout(() => say(l[0], l[1]), 1200); } }
}
let planetUnlockedNow = false;
function openStory() { if (!window.Story) return; preloadVoice("story"); const resume = pauseFor(() => { if (planetUnlockedNow) { planetUnlockedNow = false; setTimeout(openPlanetMaker, 400); } }); try { window.Story.open({ onClose: resume }); } catch (e) { console.error(e); resume(); } }
/* =============== your own planet =============== */
function refreshMyPlanet() {
  const p = P.myplanet, b = bodies.myplanet, PM = window.PlanetMaker; if (!p || !b) return;
  let d = save.myPlanet && PM ? PM.normalize(Object.assign({}, save.myPlanet, { maker: crew[captainId()].name })) : null;
  if (d) {
    p.name = d.name || "My Planet"; p.kind = "Your own planet · made by " + crew[captainId()].name;
    try { p.facts = PM.facts(d); } catch (e) { p.facts = [p.name + " was designed by " + crew[captainId()].name + "!"]; }
    try { p.land = PM.land(d); } catch (e) { p.land = null; }
    p.color = d.color || p.color;
  } else {
    p.name = "Your Planet"; p.kind = "Waiting for you to design it"; p.land = null;
    p.facts = [storyDone() || save.unlockAll || isMaster() ? "This space is saved for a brand new planet. Tap Design my planet to make it!" : "Watch the whole Story of the Solar System to unlock Planet Maker, then design your very own planet to live here!"];
  }
  p.more = []; p.quiz = [];
  if (labelEls.myplanet) labelEls.myplanet.textContent = p.name;
  if (b.custom) { b.pivot.remove(b.custom); try { b.custom.userData.dispose && b.custom.userData.dispose(); } catch (e) {} b.custom = null; }
  if (d && PM) {
    try { const g = PM.build(d); g.scale.multiplyScalar(p.r * (g.userData.sizeScale || 1)); b.pivot.add(g); b.custom = g; b.mesh.material.visible = false; }
    catch (e) { console.error(e); b.mesh.material.visible = true; }
  } else b.mesh.material.visible = true;
}
function openPlanetMaker() {
  if (!window.PlanetMaker) return;
  if (isLocked("myplanet")) { toast("Watch the whole Story to unlock Planet Maker!"); return; }
  const resume = pauseFor();
  try {
    window.PlanetMaker.open({ design: save.myPlanet || window.PlanetMaker.defaultDesign(crew[captainId()].name), captainName: crew[captainId()].name,
      onSave: (d) => { save.myPlanet = d; persist(); refreshMyPlanet(); if (state.cur === "myplanet") showCard(); toast("🪐 " + d.name + " is in the solar system! Find it in Fly somewhere."); },
      onClose: resume });
  } catch (e) { console.error(e); resume(); }
}
// Inside the rocket: beds, space food and the crew floating about
function headCanvas(who) { const cv = document.createElement("canvas"); cv.width = cv.height = 128; const g = cv.getContext("2d"); g.scale(2, 2); drawShapes(g, shapesFor(who, { noBody: true })); return cv; }
function crewCards() { return CREW_IDS.map((id) => ({ id, name: crew[id].name, dog: crew[id].type === "dog", small: !!crew[id].small, adult: crew[id].type === "adult", shirt: crew[id].shirt || crew[id].collar, head: headCanvas(id) })); }
function openHome(room, done) {
  if (!window.Home) { done && done(); return; }
  try { window.Home.open({ room, captain: captainId(), captainName: crew[captainId()].name, crew: crewCards(), onClose: () => { done && done(); } }); }
  catch (e) { console.error(e); done && done(); }
}
function openCabin() {
  if (!window.Cabin) return;
  const resume = pauseFor();
  try {
    window.Cabin.open({
      onClose: resume, captain: captainId(), travelling: !!trip, place: P[trip ? trip.to : state.cur].name, rocketName: rocketDesign.name || crew[captainId()].name.toUpperCase(),
      crew: CREW_IDS.map((id) => ({ id, name: crew[id].name, dog: crew[id].type === "dog", small: !!crew[id].small, adult: crew[id].type === "adult", shirt: crew[id].shirt || crew[id].collar, head: headCanvas(id) }))
    });
  } catch (e) { console.error(e); resume(); }
}
function openGames() { if (!window.Games) return; const resume = pauseFor(() => updatePassCount()); try { window.Games.open({ onClose: resume }); } catch (e) { console.error(e); resume(); } }
const STICKER_STARS = { rainbow: 3, moon: 7, comet: 12, saturn: 18, dog: 25, alien: 34, flower: 45, lightning: 60 };
const ROCKET_LOCKS = { pattern: { checks: 9, zigzag: 22 }, shape: { chunky: 10, sleek: 26 }, windows: { 3: 16 } };
function openRocket() {
  if (!window.RocketKit) return;
  const resume = pauseFor();
  const locked = Object.keys(STICKER_STARS).filter((k) => !isOpen(STICKER_STARS[k]));
  const lockedOptions = {}; Object.entries(ROCKET_LOCKS).forEach(([kind, m]) => { lockedOptions[kind] = {}; Object.entries(m).forEach(([v, n]) => { if (!isOpen(n)) lockedOptions[kind][v] = n - starCount(); }); });
  if (!storyDone() && !save.unlockAll && !isMaster()) lockedOptions.pattern.galaxy = "Watch the whole Story";
  try { window.RocketKit.openBuilder(Object.assign({}, rocketDesign), (d) => { rocketDesign = d; save.rocket = d; persist(); buildRocket(); resume(); }, { lockedStickers: locked, lockedOptions, starsNeeded: Object.fromEntries(Object.keys(STICKER_STARS).map((k) => [k, Math.max(0, STICKER_STARS[k] - starCount())])), stars: starCount(), onClose: resume }); }
  catch (e) { console.error(e); resume(); }
}
// RocketKit may close without saving; make sure the game always resumes when no overlay of its own remains
setInterval(() => { if (paused && !document.querySelector(".rk-overlay, .sf-overlay, .st-overlay, .gm-overlay, [class^='rk-root'], [class^='sf-root'], [class^='st-root'], [class^='gm-root']")) { /* modules report via onClose; nothing to do */ } }, 2000);
function rocketImage() {
  try {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setSize(160, 320, false);
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 0.5, 0.1, 100); cam.position.set(4.6, 0, 0); cam.lookAt(0, 0, 0);
    sc.add(new THREE.AmbientLight(0xffffff, 0.7)); const dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(3, 2, 2); sc.add(dl);
    const g = window.RocketKit ? window.RocketKit.build(rocketDesign) : null; if (!g) { r.dispose(); return null; }
    g.rotation.x = -Math.PI / 2; sc.add(g); r.render(sc, cam);
    const out = document.createElement("canvas"); out.width = 160; out.height = 320; out.getContext("2d").drawImage(r.domElement, 0, 0);
    window.RocketKit.dispose(g); r.dispose(); r.forceContextLoss(); return out;
  } catch (e) { return null; }
}
window.GameHooks = {
  say: (who, text) => say(who, text),
  speak: (text, who) => speak(text, who || "narrator"),
  stopSpeaking,
  sfx: (n) => sfx(n),
  toast: (m) => toast(m),
  rocketImage,
  addStars: (n, reason, gameId) => {
    n = Math.max(0, Math.min(3, Math.round(n || 0))); const id = gameId || reason || "arcade", prev = (save.gameStars || {})[id] || 0;
    if (n <= prev) { if (n) toast(prev >= 3 ? "You've won all 3 ⭐ in this game!" : "Beat " + prev + " ⭐ to win another star"); return; }
    save.gameStars[id] = n; persist(); updatePassCount(); toast("+" + (n - prev) + " ⭐" + (reason ? " for " + reason : "")); checkMaster();
  },
  storyComplete: () => {
    if (storyDone()) return false;
    save.gameStars.story = 15; persist(); updatePassCount(); confetti(160); checkMaster(); planetUnlockedNow = true; refreshMyPlanet();
    return true;
  },
  fill: (t) => fill(t),
  captainName: () => crew[captainId()].name,
  starCount: () => starCount(),
  gameNeed: (id) => { const need = GAME_STARS[id] || 0; return isOpen(need) ? 0 : need - starCount(); },
  isPaused: false
};

/* =============== little helpers =============== */
function confetti(n) {
  const box = $("#confetti"), cols = ["#ff7a45", "#ffd166", "#5fe0c8", "#ff6fa8", "#9fb2ff", "#ffe3c2"];
  for (let i = 0; i < n; i++) { const c = document.createElement("i"); c.style.left = Math.random() * 100 + "%"; c.style.background = cols[i % cols.length];
    c.style.animationDuration = 1.8 + Math.random() * 1.6 + "s"; c.style.animationDelay = Math.random() * 0.4 + "s"; box.appendChild(c); setTimeout(() => c.remove(), 4000); }
}
let toastTimer = null;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; t.style.animation = "none"; void t.offsetWidth; t.style.animation = ""; clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 3200); }
function setView(v) {
  save.view = v; persist(); document.body.classList.toggle("chase", v === "chase");
  $("#tViewLbl").textContent = v === "chase" ? "Outside" : "Window";
}

/* =============== tool bar =============== */
$("#tPass").onclick = openPassport;
$("#tMap").onclick = () => (state.mode === "map" ? leaveMap(false) : goToMap());
$("#tView").onclick = () => { setView(save.view === "chase" ? "pov" : "chase"); toast(save.view === "chase" ? "Outside view: you can see your rocket!" : "Window view: looking out of the rocket"); };
$("#tStory").onclick = openStory;
$("#tGames").onclick = openGames;
$("#tCabin").onclick = openCabin;
$("#tAsk").onclick = () => openAsk();
$("#tRocket").onclick = openRocket;
$("#tCrew").onclick = openEditor;
$("#tSet").onclick = openSettings;
function renderSoundBtn() { $("#soundIco").textContent = save.muted ? "🔈" : "🔊"; }
$("#tSound").onclick = () => { save.muted = !save.muted; persist(); Sound.setMuted(save.muted); renderSoundBtn(); };
$("#go").onclick = () => (state.mode === "map" ? leaveMap(false) : openSheet(null));
if (!window.Story) $("#tStory").hidden = true;
if (!window.Games) $("#tGames").hidden = true;
if (!window.Cabin) $("#tCabin").hidden = true;
if (!window.RocketKit) $("#tRocket").hidden = true;

/* =============== main loop =============== */
function resize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener("resize", resize); resize();
let last = performance.now(), clock = 0, idleTimer = 30;
const _T = new THREE.Vector3();
// keep the planet in the clear part of the screen when the facts card is open
const frameOff = { x: 0, y: 0, z: 1, tx: 0, ty: 0, tz: 1, n: 0 };
function framingTarget() {
  const c = $("#card"), W = window.innerWidth, H = window.innerHeight;
  if (!c || c.hidden || trip || state.mode !== "orbit" || getComputedStyle(c).display === "none") return [0, 0, 1];
  const r = c.getBoundingClientRect(), top = ($("#top") ? $("#top").getBoundingClientRect().bottom : 0);
  if (r.width > W * 0.6) { const ty = (top + r.top) / 2; return [0, H / 2 - ty, Math.max(0.35, Math.min(1, (r.top - top) / (H * 0.6)))]; } // card along the bottom (phone): shrink the planet into the gap
  if (r.left > W * 0.4) return [W / 2 - r.left / 2, 0, Math.max(0.5, Math.min(1, r.left / (W * 0.8)))]; // card on the right
  return [0, 0, 1];
}
function updateFraming(dt) {
  if (frameOff.n-- <= 0) { frameOff.n = 8; const t = framingTarget(); frameOff.tx = t[0]; frameOff.ty = t[1]; frameOff.tz = t[2]; }
  const k = 1 - Math.exp(-dt * 4);
  frameOff.x += (frameOff.tx - frameOff.x) * k; frameOff.y += (frameOff.ty - frameOff.y) * k;
  const nz = frameOff.z + (frameOff.tz - frameOff.z) * k; if (Math.abs(nz - camera.zoom) > 0.001 || Math.abs(nz - 1) > 0.001) { frameOff.z = nz; camera.zoom = Math.abs(nz - 1) < 0.002 ? 1 : nz; camera.updateProjectionMatrix(); }
  const W = window.innerWidth, H = window.innerHeight;
  if (Math.abs(frameOff.x) < 0.5 && Math.abs(frameOff.y) < 0.5) { if (camera.view && camera.view.enabled) camera.clearViewOffset(); }
  else camera.setViewOffset(W, H, frameOff.x, frameOff.y, W, H);
}
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (paused || document.hidden) return;
  clock += dt;
  // map orbits
  const mapTarget = state.mode === "map" ? 1 : 0; state.mapK += (mapTarget - state.mapK) * Math.min(1, dt * 3);
  if (state.mode === "map" && state.mapPlay) {
    const yrs = dt * state.mapSpeed; state.mapYears += yrs; updateYears();
    ORDER.forEach((id) => { const p = P[id]; if (p.grp !== "solar" || !p.period) return; p.angNow -= 360 / p.period * yrs; bodies[id].pivot.position.set(p.dist * Math.cos(p.angNow * Math.PI / 180), 0, p.dist * Math.sin(p.angNow * Math.PI / 180)); });
    beltMesh.rotation.y += 2 * Math.PI / 4.6 * yrs; kuiperPts.rotation.y += 2 * Math.PI / 298 * yrs;
  }
  ORDER.forEach((id) => {
    const p = P[id], b = bodies[id];
    if (p.grp === "deep") { if (window.DeepSpace && window.DeepSpace.update) { try { window.DeepSpace.update(b.mesh, dt, camera); } catch (e) {} } return; }
    if (!p.model) b.mesh.rotation.y += dt * (id === "sun" ? 0.03 : id === "pluto" ? 0.12 : 0.08); else b.mesh.rotation.y += dt * 0.2;
    if (p.grp === "solar") { const s = 1 + state.mapK * (id === "sun" ? 0.6 : 2); b.pivot.scale.setScalar(s); }
    if (p.parent) {
      b.pivot.visible = state.mapK < 0.5;
      const PP = bodies[p.parent].pivot.position;
      if (p.l2) { _T.copy(PP).setY(0).normalize().multiplyScalar(p.md); b.pivot.position.copy(PP).add(_T); }
      else { const a = b.phase + clock * p.spd; b.pivot.position.set(PP.x + Math.cos(a) * p.md, PP.y + Math.sin(a * 0.7) * p.md * (p.grp === "craft" ? 0.25 : 0.05), PP.z + Math.sin(a) * p.md); }
    }
  });
  if (bodies.myplanet && bodies.myplanet.custom && bodies.myplanet.custom.userData.update) { try { bodies.myplanet.custom.userData.update(dt); } catch (e) {} }
  if (bodies.halley) { const hp = bodies.halley.pivot, th = hp.children.find((o) => o.userData.cometTail); if (th) { _T.copy(hp.position).normalize(); th.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), _T); } }
  if (trip) updateTrip(dt);
  else if (tween) { rocket.visible = false; updateTween(dt); }
  else if (state.mode === "map") { rocket.visible = false; camera.position.copy(mapCamPos()); camera.lookAt(0, 0, 0); }
  else if (state.mode === "rings") { rocket.visible = false; updateRide(dt); }
  else {
    if (!state.lastDrag || now - state.lastDrag > 2500) state.theta += dt * 0.06;
    const T = worldPos(state.cur, _T), rp = T.clone().add(orbitOffset());
    if (save.view === "chase") {
      const sc = rocketScale(state.cur), tan = orbitTangent(), out = rp.clone().sub(T).normalize();
      rocket.visible = true; rocket.scale.setScalar(sc); rocket.position.copy(rp); rocket.lookAt(rp.clone().add(tan));
      const desired = rp.clone().addScaledVector(out, 7 * sc).addScaledVector(UP, 2.6 * sc).addScaledVector(tan, -5 * sc);
      camera.position.lerp(desired, 1 - Math.exp(-dt * 5)); camera.lookAt(T.clone().lerp(rp, 0.25));
    } else { rocket.visible = false; camera.position.copy(rp); camera.lookAt(T); }
    idleTimer -= dt;
    if (idleTimer <= 0) { idleTimer = 28 + Math.random() * 20; if (performance.now() - lastSay > 15000 && document.querySelectorAll(".overlay:not([hidden])").length === 0) idleLine(); }
  }
  if (rocket.visible && window.RocketKit && window.RocketKit.setFlame) { try { window.RocketKit.setFlame(rocket, trip ? 1 : 0.2); } catch (e) {} }
  camLight.position.copy(camera.position);
  sky.position.copy(camera.position);
  orbitLines.visible = !(P[state.cur].grp === "deep" && !trip);
  updateFraming(dt);
  updateLabels();
  renderer.render(scene, camera);
}

/* =============== ride Saturn's rings =============== */
const RING_LINES = [
  ["leo", "Hold on tight, everyone! We're riding Saturn's rings."],
  ["harper", "This is the best ride ever!"],
  ["leo", "The rings are made of billions of chunks of ice and rock. Some are as small as grains of sand, and some are as big as a house."],
  ["oda", "Wheee! Can we go round again?"],
  ["leo", "Every piece of ice is going round Saturn, like a tiny moon. That's what we're doing too!"],
  ["dad", "Mind your heads, ice coming through!"],
  ["leo", "The rings are enormous, but very thin. In most places they're only about ten metres thick!"],
  ["mum", "It's like sledging in space!"],
  ["leo", "Scientists think the rings might be quite young, maybe only a few hundred million years old."],
  ["leo", "Bits of the rings are slowly raining down onto Saturn. In a few hundred million years they could be gone!"]
];
const RIDE_R = 10.3;
let ride = null, rideStuff = null;
function buildRideStuff() {
  const R = rng(7), N = 2600, geo = new THREE.IcosahedronGeometry(1, 0);
  const ice = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }), N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const a = R() * Math.PI * 2, r = RIDE_R - 1.3 + R() * 2.6, size = 0.006 + Math.pow(R(), 4) * 0.12;
    p.set(Math.cos(a) * r, (R() - 0.5) * 0.14, Math.sin(a) * r); q.setFromEuler(e.set(R() * 6, R() * 6, R() * 6)); sc.set(size, size * (0.6 + R() * 0.6), size);
    m.compose(p, q, sc); ice.setMatrixAt(i, m); ice.setColorAt(i, c.setHSL(0.1 + R() * 0.04, 0.25, 0.72 + R() * 0.22));
  }
  ringHolder.add(ice);
  const rockGeo = new THREE.IcosahedronGeometry(0.15, 1), pa = rockGeo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); v.multiplyScalar(0.85 + R() * 0.3); v.y *= 0.65; pa.setXYZ(i, v.x, v.y, v.z); }
  rockGeo.computeVertexNormals();
  const seat = new THREE.Mesh(rockGeo, new THREE.MeshLambertMaterial({ color: 0xe8e3d8, flatShading: true })); ringHolder.add(seat);
  rideStuff = { ice, seat, riders: [] };
}
function buildRiders() {
  rideStuff.riders.forEach((r) => { ringHolder.remove(r.sp); r.sp.material.map.dispose(); r.sp.material.dispose(); });
  const ids = [captainId()].concat(CREW_IDS.filter((id) => id !== captainId()));
  rideStuff.riders = ids.map((id, i) => {
    const cv = astronautCanvas(id), t = new THREE.CanvasTexture(cv), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: 0.08 }));
    const k = crew[id].type === "dog" ? 0.6 : crew[id].small ? 0.78 : crew[id].type === "adult" ? 1.1 : 0.92, h = 0.085 * k;
    sp.scale.set(h * cv.width / cv.height, h, 1); ringHolder.add(sp);
    return { sp, h, off: (i - (ids.length - 1) / 2) * 0.045, hop: i * 1.3 };
  });
}
function startRide() {
  if (!ringHolder) return;
  if (!rideStuff) buildRideStuff();
  buildRiders();
  hideCard(); stopSpeaking();
  const T = worldPos("saturn"), off = camera.position.clone().sub(T); ringHolder.updateMatrixWorld();
  const local = ringHolder.worldToLocal(camera.position.clone()); // start on the side we were looking from
  ride = { a: Math.atan2(local.z, local.x), speed: 1, look: 0, tilt: 0.12, t: 0, timers: [] };
  state.mode = "rings"; rideStuff.ice.visible = rideStuff.seat.visible = true;
  let bar = $("#ridebar");
  if (!bar) { bar = document.createElement("div"); bar.id = "ridebar"; document.body.appendChild(bar); }
  bar.innerHTML = '<span>🪐 Riding Saturn\'s rings<small style="display:block;font-weight:400;opacity:.75">Drag to look around</small></span><button class="btn" id="rslow">🐢 Slower</button><button class="btn" id="rfast">🐇 Faster</button><button class="btn quiz" id="rstop">Get off</button>';
  bar.hidden = false;
  $("#rslow").onclick = () => { ride.speed = Math.max(0.25, ride.speed / 1.6); sfx("blip"); };
  $("#rfast").onclick = () => { ride.speed = Math.min(6, ride.speed * 1.6); sfx("whoosh", 0.8); };
  $("#rstop").onclick = () => endRide();
  sfx("whoosh");
  let tmo = 1200; RING_LINES.forEach(([who, text]) => { ride.timers.push(setTimeout(() => { if (state.mode === "rings") say(who, text); }, tmo)); tmo += 4200 + text.length * 70; });
}
function endRide(silent) {
  if (!ride) return;
  ride.timers.forEach(clearTimeout); ride = null; stopSpeaking();
  if (rideStuff) { rideStuff.ice.visible = rideStuff.seat.visible = false; rideStuff.riders.forEach((r) => (r.sp.visible = false)); }
  const bar = $("#ridebar"); if (bar) bar.hidden = true;
  camera.up.set(0, 1, 0); state.mode = "orbit";
  if (!silent) { setOrbitFromOffset(arrivalOffset("saturn", camera.position.clone())); showCard(); say("oda", "Again! Again!"); }
}
function updateRide(dt) {
  ride.t += dt; ride.a += dt * 0.07 * ride.speed;
  const a = ride.a, up = new THREE.Vector3(0, 1, 0);
  const pos = new THREE.Vector3(Math.cos(a) * RIDE_R, 0, Math.sin(a) * RIDE_R), tan = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)), out = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
  rideStuff.seat.position.copy(pos); rideStuff.seat.rotation.y = -a; rideStuff.seat.rotation.x += dt * 0.15;
  rideStuff.riders.forEach((r) => { r.sp.visible = true; r.sp.position.copy(pos).addScaledVector(out, r.off).addScaledVector(up, 0.09 + r.h / 2 + Math.abs(Math.sin(ride.t * 2.2 + r.hop)) * 0.006); });
  rideStuff.ice.rotation.y = -ride.t * 0.004; // the ice drifts a little against us
  const dir = tan.clone().applyAxisAngle(up, ride.look);
  const camLocal = pos.clone().addScaledVector(dir, -0.42).addScaledVector(up, 0.16 + ride.tilt * 0.3).addScaledVector(out, 0.03);
  const target = pos.clone().addScaledVector(dir, 0.5).addScaledVector(up, 0.06 - ride.tilt * 0.1);
  ringHolder.updateMatrixWorld();
  camera.position.lerp(ringHolder.localToWorld(camLocal), 1 - Math.exp(-dt * 6));
  camera.up.copy(up).transformDirection(ringHolder.matrixWorld);
  camera.lookAt(ringHolder.localToWorld(target));
}

function boot() {
  renderCrew(); setView(save.view || "pov"); updatePassCount(); renderSoundBtn();
  setOrbitFromOffset(arrivalOffset(state.cur, new THREE.Vector3()));
  requestAnimationFrame(frame);
}
function renderPlayers() {
  const cap = captainId();
  $("#players").innerHTML = ["harper", "oda"].map((id) => { const pr = id === cap ? profileOf() : save.profiles[id] || {}, n = Object.keys(pr.stars || {}).length + Object.values(pr.gameStars || {}).reduce((a, b) => a + b, 0);
    return '<button data-player="' + id + '" class="' + (id === cap ? "on" : "") + '"><div class="port">' + toSVG(shapesFor(id)) + "</div>" + esc(crew[id].name) + "<small>⭐ " + n + "</small></button>"; }).join("");
  $("#startName").textContent = crew[cap].name;
  const br = document.querySelector(".brand"); if (br && br.firstChild) br.firstChild.textContent = crew[cap].name + "'s Space Adventure"; document.title = crew[cap].name + "'s Space Adventure";
  $("#startLine").textContent = "Captain " + crew[cap].name + ", your crew is aboard and " + crew.leo.name + " the astronaut is on the radio. Where will you fly first?";
  $("#players").querySelectorAll("[data-player]").forEach((b) => (b.onclick = () => { switchPlayer(b.dataset.player); sfx("blip"); }));
}
function switchPlayer(id) {
  if (id === captainId()) return;
  persist(); loadProfile(id); persist();
  rocketDesign = Object.assign(defaultRocket(), save.rocket || {}); buildRocket();
  setView(save.view || "pov"); updatePassCount(); renderCrew(); renderPlayers(); refreshMyPlanet();
}
renderPlayers();
$("#go-start").onclick = () => {
  Sound.start(); $("#start").hidden = true; loadVoices(); preloadVoice("crew"); preloadVoice("p-" + state.cur);
  const isNew = !save.visited.earth; save.visited.earth = true; persist(); updatePassCount();
  showCard();
  const g = GD.leoGreetings && GD.leoGreetings.length ? pick(GD.leoGreetings) : "Leo here, Captain Harper! Ready when you are. Tap Fly somewhere to start exploring.";
  setTimeout(() => say("leo", g), 500);
  setTimeout(() => say("joules", "Woof!"), 3500);
  if (isNew) toast("First stamp: Earth!");
};
/* =============== cloud save =============== */
// The iPad can lose browser storage (closing the tab, private mode, storage clean-ups), so when the page is opened
// signed in to Claude the progress is also kept in this game's own private store and merged back in on the next visit.
function mergeProfile(a, b) {
  a = a || {}; b = b || {};
  const gs = Object.assign({}, a.gameStars || {});
  Object.entries(b.gameStars || {}).forEach(([k, v]) => { gs[k] = Math.max(gs[k] || 0, v || 0); });
  return { visited: Object.assign({}, a.visited, b.visited), stars: Object.assign({}, a.stars, b.stars), gameStars: gs, rocket: (b.rocket || a.rocket) || null, view: b.view || a.view || "pov", master: !!(a.master || b.master), myPlanet: b.myPlanet || a.myPlanet || null };
}
function mergeSaves(local, remote) {
  // stars and stamps are never lost; looks and settings come from whichever was saved last
  const newer = (remote.savedAt || 0) > (local.savedAt || 0) ? remote : local, older = newer === remote ? local : remote;
  const out = Object.assign({}, older, newer);
  out.profiles = {};
  new Set(Object.keys(local.profiles || {}).concat(Object.keys(remote.profiles || {}))).forEach((id) => { out.profiles[id] = mergeProfile((older.profiles || {})[id], (newer.profiles || {})[id]); });
  const crewOut = {};
  CREW_IDS.concat(["leo"]).forEach((id) => { const o = (older.crew || {})[id], n = (newer.crew || {})[id]; if (o || n) crewOut[id] = Object.assign({}, o || {}, n || {}); });
  out.crew = crewOut;
  out.savedAt = Math.max(local.savedAt || 0, remote.savedAt || 0);
  return out;
}
function splitPhotos(sv) {
  const body = JSON.parse(JSON.stringify(sv)), photos = {};
  Object.entries(body.crew || {}).forEach(([id, c]) => { if (c && c.photo) { photos[id] = c.photo; delete c.photo; } });
  return [body, photos];
}
function scheduleCloud() { if (!cloud) return; clearTimeout(cloudTimer); cloudTimer = setTimeout(pushCloud, 1500); }
async function pushCloud() {
  if (!cloud) return;
  try {
    save.profiles[save.player || "harper"] = profileOf();
    const [body, photos] = splitPhotos(save), ps = JSON.stringify(photos);
    await cloud.save.set(body);
    if (ps !== cloudPhotos && ps.length < 240000) { await cloud.photos.set(photos); cloudPhotos = ps; }
  } catch (e) { console.warn("cloud save", e && e.code); }
}
function applySave(merged) {
  const player = save.player || "harper";
  Object.keys(save).forEach((k) => { if (!(k in merged)) delete save[k]; });
  Object.assign(save, merged); save.player = merged.player || player;
  loadProfile(save.player);
  CREW_IDS.concat(["leo"]).forEach((id) => { crew[id] = Object.assign({}, DEFAULT_CREW[id], (save.crew || {})[id] || {}); });
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {}
  rocketDesign = Object.assign(defaultRocket(), save.rocket || {});
  try { buildRocket(); setView(save.view || "pov"); updatePassCount(); renderCrew(); renderPlayers(); refreshMyPlanet(); } catch (e) { console.error(e); }
}
async function startCloud() {
  try {
    if (!window.claude || !window.claude.use) return;
    const db = await window.claude.use("db"); if (!db) return;
    const user = await window.claude.use("user"); if (!user) return;
    const uid = await user.id(); if (!uid) return;
    const col = db.collection("data/users/" + uid);
    const ref = { save: col.doc("save"), photos: col.doc("photos") };
    const [sv, ph] = await Promise.all([ref.save.get(), ref.photos.get()]);
    save.profiles[save.player || "harper"] = profileOf();
    if (sv.exists) {
      const remote = JSON.parse(JSON.stringify(sv.data()));
      const photos = ph.exists ? ph.data() : {};
      cloudPhotos = JSON.stringify(photos);
      Object.entries(photos || {}).forEach(([id, url]) => { remote.crew = remote.crew || {}; remote.crew[id] = Object.assign({}, remote.crew[id], { photo: url }); });
      // a photo saved on this device but newer than the cloud copy wins, via mergeSaves' crew rules
      const merged = mergeSaves(JSON.parse(JSON.stringify(save)), remote);
      if (JSON.stringify(merged) !== JSON.stringify(save)) { applySave(merged); toast("☁️ Your saved game is back!"); }
    }
    cloud = ref;
    pushCloud();
  } catch (e) { console.warn("cloud load", e && e.code); }
}
refreshMyPlanet();
startCloud();
boot();
})();
