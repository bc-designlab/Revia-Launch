/* Review hero v4: a physical glass flower is being scanned and different kinds of memories appear around it.
   Three independent timelines run inside one update(): a continuous top→bottom scan, three persistent
   decorations with their own slow drift, and a calm content cycle (text → images → video → audio, one at a
   time). Everything is a pure function of time, so seek, pause, reduced motion and loop resets need no timers
   and nothing accumulates. The source model and the original site are unchanged. */

import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { gsap } from './vendor/gsap/gsap-core.js';
import { FontLoader } from './vendor/loaders/FontLoader.js';
import { TextGeometry } from './vendor/geometries/TextGeometry.js';

// Re-initialisation guard: a previous instance (hot reload, re-import) must release its loop, timeline and listeners.
if (window.__reviaHero && typeof window.__reviaHero.dispose === 'function') window.__reviaHero.dispose();

/* ---------- timelines (seconds) ---------- */
const CYCLE = 24.0;                       // content cycle
const ENTER_DUR = 0.9, EXIT_DUR = 0.8;
const STAGES = {                          // images first on load, text last
  images: { enter: 0.6,  exit: 6.0  },
  video:  { enter: 6.9,  exit: 11.7 },
  audio:  { enter: 12.6, exit: 17.4 },
  text:   { enter: 18.3, exit: 23.1 },
};
const STAGE_ORDER = ['images', 'video', 'audio', 'text'];
const SCAN = { period: 4.6, travel: 3.4 }; // independent of the content cycle, keyed to absolute time
const STILL_TIME = 3.2;                   // drift pose used by the static composition

const $ = (s) => document.querySelector(s);
const stage = $('#stage');
stage.dataset.moduleStartedMs = performance.now().toFixed(1);
const canvas = $('#scene');
const pauseBtn = $('#pauseBtn');
const replayBtn = $('#replayBtn');
const fallbackEl = $('#fallback');
const params = new URLSearchParams(location.search);
const motionMQ = matchMedia('(prefers-reduced-motion: reduce)');
let needsRender = true, inView = true, firstFrame = true, rafId = 0, disposed = false;
let items = []; // filled once the content meshes exist; callbacks that fire earlier see an empty list

/* ---------- math helpers ---------- */
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const deg = (d) => (d * Math.PI) / 180;

/* ---------- renderer ---------- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (err) {
  console.warn('[revia-hero] WebGL unavailable, showing static fallback', err);
  fallbackEl.hidden = false; canvas.hidden = true; pauseBtn.disabled = true; replayBtn.disabled = true;
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.94;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xeef0ff, 9, 16);

const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
camera.position.set(0.15, 0.6, 7.7);
const LOOK_AT = new THREE.Vector3(0, -0.25, 0);
camera.lookAt(LOOK_AT);

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0xfaf7ff, 0xe3d9ef, .66));
const key = new THREE.DirectionalLight(0xfff8ef, 1.45);
key.position.set(-3.8, 6.5, 4.5);
scene.add(key);
const fill = new THREE.DirectionalLight(0xe2efff, .40);
fill.position.set(4, 2.8, 5);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xf0dcff, 0.85);
rim.position.set(-2.5, 3.5, -5);
scene.add(rim);

/* Procedural studio for lightly tinted glass: bright soft boxes above/left, lavender floor, pink bounce in front.
   Faces: +x, -x, +y, -y, +z (behind camera), -z. A tiny 128px cube, prefiltered once. */
const studioFaces = Array.from({ length: 6 }, (_, i) => {
  const S = 128, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, S);
  if (i === 2) { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#f5effd'); }
  else if (i === 3) { g.addColorStop(0, '#e6d8f1'); g.addColorStop(1, '#c9b6de'); }
  else { g.addColorStop(0, '#fdfbff'); g.addColorStop(.46, '#e2d8f4'); g.addColorStop(1, '#c6b3dd'); }
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  const soft = (cx, cy, r, col, a) => { const q = x.createRadialGradient(cx, cy, 0, cx, cy, r); q.addColorStop(0, `rgba(${col},${a})`); q.addColorStop(.5, `rgba(${col},${a * .5})`); q.addColorStop(1, `rgba(${col},0)`); x.fillStyle = q; x.fillRect(0, 0, S, S); };
  if (i === 1) soft(S * .40, S * .28, S * .42, '255,255,255', 1);
  if (i === 0) soft(S * .62, S * .34, S * .34, '255,255,255', .78);
  if (i === 5) soft(S * .50, S * .26, S * .36, '255,250,255', .70);
  if (i === 4) { soft(S * .36, S * .22, S * .40, '255,255,255', .85); soft(S * .56, S * .84, S * .55, '246,206,236', .62); }
  return c;
});
const studioCube = new THREE.CubeTexture(studioFaces); studioCube.needsUpdate = true; studioCube.colorSpace = THREE.SRGBColorSpace;
const pmrem = new THREE.PMREMGenerator(renderer); const studio = pmrem.fromCubemap(studioCube); scene.environment = studio.texture; studioCube.dispose(); pmrem.dispose();

/* ---------- scan highlight + glass edge injected into the flower material ---------- */
const scanU = {
  uScanY: { value: 10 },
  uScanStrength: { value: 0 },
  uScanWidth: { value: 0.30 },
  uScanColor: { value: new THREE.Color('#7fe4ff') },
  uEdgeColor: { value: new THREE.Color('#9479c4') },
  uEdgeAlpha: { value: 1.0 },
};
function applyScan(mat) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, scanU);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vScanY;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvScanY = (modelMatrix * vec4(transformed, 1.0)).y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vScanY;\nuniform float uScanY;\nuniform float uScanStrength;\nuniform float uScanWidth;\nuniform vec3 uScanColor;\nuniform vec3 uEdgeColor;\nuniform float uEdgeAlpha;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        // Glass edge: deeper lavender and higher alpha at grazing angles define petal rims and overlaps.
        float glassFresnel = pow(1.0 - saturate(dot(normalize(vViewPosition), normal)), 2.2);
        diffuseColor.rgb = mix(diffuseColor.rgb, uEdgeColor, glassFresnel * 0.90);
        diffuseColor.a = mix(diffuseColor.a, uEdgeAlpha, glassFresnel);
        // Localized petal highlight under the passing scan bar (surface only).
        float scanBand = 1.0 - smoothstep(0.0, uScanWidth, abs(vScanY - uScanY));
        float scanned = smoothstep(0.0, 0.45, vScanY - uScanY);
        diffuseColor.a = max(diffuseColor.a, scanBand * uScanStrength * 0.95);
        totalEmissiveRadiance += uScanColor * (scanBand * 2.2 + scanned * 0.05) * uScanStrength;`);
  };
  mat.customProgramCacheKey = () => 'revia-scan';
  return mat;
}

/* ---------- the supplied flower ---------- */
const flower = new THREE.Group(); scene.add(flower);
const FLOWER_CENTER = new THREE.Vector3(0, 0.05, 0);
let gltf; try { gltf = await new GLTFLoader().loadAsync('assets/flower-smooth-satin.glb'); } catch (error) { fallbackEl.hidden = false; canvas.hidden = true; console.error('[revia-hero] GLB load failed', error); throw error; }
stage.dataset.modelDecodedMs = performance.now().toFixed(1);
const FLOWER_HEIGHT = 3.72; // world units; fit4 used 3.29
const imported = gltf.scene, box = new THREE.Box3().setFromObject(imported), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3()), scale = FLOWER_HEIGHT / size.y;
imported.scale.setScalar(scale); imported.position.set(-center.x * scale, -2.25 - box.min.y * scale, -center.z * scale); imported.rotation.y = .62 + Math.PI;
/* Pale pink/lavender glass without a physical transmission pass (it sampled black behind the transparent
   canvas and is the costliest path on mobile). Translucency comes from alpha with a fresnel edge, and a depth
   prepass makes the layered petals read as one smooth solid volume instead of self-sorting seams. */
const glassMeshes = [];
imported.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; o.material = applyScan(new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0xc7a1da), roughness: .34, metalness: 0, transparent: true, opacity: .85, depthWrite: false, ior: 1.45, specularIntensity: .9, specularColor: new THREE.Color(0xfff3fb), clearcoat: 1, clearcoatRoughness: .16, iridescence: .5, iridescenceIOR: 1.28, iridescenceThicknessRange: [120, 460], envMapIntensity: .95, side: THREE.FrontSide })); glassMeshes.push(o); } });
flower.add(imported);
// Pin the actual foot of the sculpt to the stage anchor, not its bounding-box center.
flower.updateMatrixWorld(true); const sculptBounds = new THREE.Box3().setFromObject(imported); const rootLocal = new THREE.Vector3(); let rootSamples = 0; const point = new THREE.Vector3();
imported.traverse(o => { if (!o.isMesh) return; const pos = o.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { point.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); if (point.y <= sculptBounds.min.y + .012) { rootLocal.x += point.x; rootLocal.z += point.z; rootSamples++; } } });
rootLocal.x /= Math.max(rootSamples, 1); rootLocal.z /= Math.max(rootSamples, 1); rootLocal.y = sculptBounds.min.y;
const prepassMat = new THREE.MeshBasicMaterial({ colorWrite: false });
glassMeshes.forEach(o => { const pre = new THREE.Mesh(o.geometry, prepassMat); pre.name = 'glass-depth-prepass'; o.add(pre); });
const flowerWidth = sculptBounds.max.x - sculptBounds.min.x;
stage.dataset.rooted = 'true'; stage.dataset.flowerAngle = String(.62 + Math.PI); stage.dataset.model = 'flower-smooth-satin.glb'; stage.dataset.flowerHeight = String(FLOWER_HEIGHT); stage.dataset.material = 'tinted-glass-prepass'; stage.dataset.choreography = 'continuous-scan · persistent-decor · text-images-video-audio';

/* ---------- ground shadows (offline textures, no shadow maps) ---------- */
function radialTexture(size, stops) {
  const c = document.createElement('canvas'); c.width = c.height = size; const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col)); ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const SHADOW_K = FLOWER_HEIGHT / 3.29;
const contact = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: radialTexture(256, [[0, 'rgba(70,58,150,0.34)'], [0.45, 'rgba(70,58,150,0.13)'], [1, 'rgba(70,58,150,0)']]), transparent: true, depthWrite: false }));
contact.rotation.x = -Math.PI / 2; contact.scale.set(.50 * SHADOW_K, .40 * SHADOW_K, .50 * SHADOW_K); scene.add(contact);
const castMap = new THREE.TextureLoader().load('assets/flower-cast-shadow.png?v=opposite3', () => { needsRender = true; });
const castShadow = new THREE.Mesh(new THREE.PlaneGeometry(9.87, 9.87), new THREE.MeshBasicMaterial({ map: castMap, transparent: true, opacity: .24, depthWrite: false, toneMapped: false }));
castShadow.material.onBeforeCompile = shader => { shader.fragmentShader = shader.fragmentShader.replace('#include <alphamap_fragment>', '#include <alphamap_fragment>\n diffuseColor.a *= smoothstep(0.0,0.12,min(min(vMapUv.x,1.0-vMapUv.x),min(vMapUv.y,1.0-vMapUv.y)));'); };
castShadow.rotation.x = -Math.PI / 2; castShadow.scale.setScalar(SHADOW_K); scene.add(castShadow);

/* ---------- continuous scan bar: slim lavender→cyan light, flower-wide, in front of the flower ---------- */
const scanGroup = new THREE.Group(); scene.add(scanGroup);
const barTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
  const h = x.createLinearGradient(0, 0, 256, 0); h.addColorStop(0, 'rgba(200,168,255,0)'); h.addColorStop(.14, 'rgba(200,168,255,1)'); h.addColorStop(.55, 'rgba(140,220,255,1)'); h.addColorStop(.86, 'rgba(95,216,232,1)'); h.addColorStop(1, 'rgba(95,216,232,0)'); x.fillStyle = h; x.fillRect(0, 0, 256, 64);
  x.globalCompositeOperation = 'destination-in'; const v = x.createLinearGradient(0, 0, 0, 64); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(.5, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = v; x.fillRect(0, 0, 256, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const BAR_W = flowerWidth * .86;
const scanGlow = new THREE.Mesh(new THREE.PlaneGeometry(BAR_W, .26), new THREE.MeshBasicMaterial({ map: barTex, transparent: true, opacity: 0, depthWrite: false, depthTest: false, toneMapped: false }));
const scanCore = new THREE.Mesh(new THREE.PlaneGeometry(BAR_W * .9, .04), new THREE.MeshBasicMaterial({ map: barTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, depthTest: false, toneMapped: false }));
scanGlow.renderOrder = 20; scanCore.renderOrder = 21; scanGroup.add(scanGlow, scanCore);

/* ---------- 2D drawing helpers for canvas textures ---------- */
const photo = new Image(); let photoReady = false;
photo.onload = () => { photoReady = true; items.forEach(i => i.dirty = true); needsRender = true; };
photo.onerror = () => console.warn('[revia-hero] placeholder photo failed to load');
photo.src = 'assets/placeholder-photo-small.jpg';
const SERIF = '"Instrument Serif", Georgia, serif';
const SANS = '"Inter", system-ui, -apple-system, sans-serif';
const PX_PER_UNIT = 600;
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); }
function chip(ctx, x, y, text, bg, fg) { ctx.font = `700 30px ${SANS}`; const w = ctx.measureText(text).width + 44; rr(ctx, x, y, w, 50, 25); ctx.fillStyle = bg; ctx.fill(); ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.letterSpacing = '4px'; ctx.fillText(text, x + 22, y + 26); ctx.letterSpacing = '0px'; return w; }
function drawFrost(ctx, W, H) {
  ctx.save(); rr(ctx, 0, 0, W, H, 28); ctx.clip();
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, 'rgba(255,255,255,.60)'); g.addColorStop(.5, 'rgba(249,246,255,.44)'); g.addColorStop(1, 'rgba(230,243,252,.52)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const [x, y, r, col] of [[W * .12, H * .82, W * .65, 'rgba(194,236,246,.20)'], [W * .85, H * .15, W * .6, 'rgba(244,207,232,.18)']]) { const a = ctx.createRadialGradient(x, y, 0, x, y, r); a.addColorStop(0, col); a.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = a; ctx.fillRect(0, 0, W, H); }
  rr(ctx, 1, 1, W - 2, H - 2, 28); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
}
function drawCoverPhoto(ctx, x, y, w, h, dim = 0) {
  if (photoReady) { const ir = photo.width / photo.height, r = w / h; let sw, sh; if (ir > r) { sh = photo.height; sw = sh * r; } else { sw = photo.width; sh = sw / r; } ctx.drawImage(photo, (photo.width - sw) / 2, (photo.height - sh) / 2, sw, sh, x, y, w, h); }
  else { const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#cdb8ff'); g.addColorStop(.5, '#ffd6e3'); g.addColorStop(1, '#bfe8ff'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
  if (dim > 0) { ctx.fillStyle = `rgba(30,20,70,${dim})`; ctx.fillRect(x, y, w, h); }
}
/* Two illustrative placeholder scenes so three different pictures can fan out. Only one photo asset is supplied. */
function drawDuskScene(ctx, x, y, w, h) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#c8a8ff'); sky.addColorStop(.45, '#ffb7c5'); sky.addColorStop(.72, '#ffd6a5'); sky.addColorStop(1, '#8f7bd6'); ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  const sun = ctx.createRadialGradient(x + w * .62, y + h * .58, 0, x + w * .62, y + h * .58, w * .18); sun.addColorStop(0, 'rgba(255,245,225,.95)'); sun.addColorStop(.5, 'rgba(255,226,184,.55)'); sun.addColorStop(1, 'rgba(255,226,184,0)'); ctx.fillStyle = sun; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#9d86d9'; ctx.beginPath(); ctx.moveTo(x, y + h * .78); for (let i = 0; i <= 10; i++) { const px = x + (w * i) / 10; ctx.lineTo(px, y + h * (.70 + .06 * Math.sin(i * 1.7) + .03 * Math.cos(i * 2.9))); } ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6f5bb8'; ctx.beginPath(); ctx.moveTo(x, y + h * .9); for (let i = 0; i <= 10; i++) { const px = x + (w * i) / 10; ctx.lineTo(px, y + h * (.84 + .05 * Math.sin(i * 2.3 + 1))); } ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
}
function drawFieldScene(ctx, x, y, w, h) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#a7c7ff'); sky.addColorStop(.5, '#dff1ff'); sky.addColorStop(.52, '#d6c6f2'); sky.addColorStop(1, '#8e7ad1'); ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  for (let r = 0; r < 9; r++) { const ry = y + h * (.54 + r * .055), rh = h * .035 + r * 2; ctx.fillStyle = r % 2 ? 'rgba(200,168,255,.7)' : 'rgba(167,140,235,.75)'; for (let k = 0; k < 14; k++) { const kx = x + (w * (k + (r % 2) * .5)) / 14; ctx.beginPath(); ctx.ellipse(kx, ry, w * .028 + r, rh, 0, 0, Math.PI * 2); ctx.fill(); } }
  const haze = ctx.createLinearGradient(0, y + h * .5, 0, y + h * .62); haze.addColorStop(0, 'rgba(255,255,255,.6)'); haze.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = haze; ctx.fillRect(x, y + h * .5, w, h * .12);
}
const PHOTOS = [
  { caption: 'Amalfi, that afternoon.', draw: drawCoverPhoto },
  { caption: 'The last evening there.', draw: drawDuskScene },   // illustrative art: a real photo is still needed
  { caption: 'July, before the rain.', draw: drawFieldScene },    // illustrative art: a real photo is still needed
];

/* ---------- optional real media (none is bundled; see report) ---------- */
const media = { video: null, videoReady: false, audioFile: null, audioFileReady: false };
stage.dataset.videoSource = 'none'; stage.dataset.audioSource = 'none';
// assets/hero-media.json names optional real clips; a missing entry keeps the honest placeholder (no 404 probes).
fetch('assets/hero-media.json').then(r => r.ok ? r.json() : null).then(cfg => {
  if (!cfg) return;
  if (cfg.video) { const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.src = 'assets/' + cfg.video; v.addEventListener('canplay', () => { media.videoReady = true; stage.dataset.videoSource = cfg.video; items.forEach(i => i.dirty = true); }, { once: true }); media.video = v; }
  if (cfg.audio) { const a = new Audio('assets/' + cfg.audio); a.preload = 'auto'; a.addEventListener('canplaythrough', () => { media.audioFileReady = true; stage.dataset.audioSource = cfg.audio; items.forEach(i => i.dirty = true); }, { once: true }); media.audioFile = a; }
}).catch(() => { });

/* ---------- extruded memory text: real TextGeometry from the page's own Inter outlines ---------- */
const fontLoader = new FontLoader();
const [FONT_SEMI, FONT_MED] = await Promise.all([fontLoader.loadAsync('assets/fonts/inter-semibold-typeface.json'), fontLoader.loadAsync('assets/fonts/inter-medium-typeface.json')]);
const TEXT_LINES = [
  { text: 'From the garden, June.', font: FONT_SEMI, size: .24, depth: .040, bevel: .007, front: 0x8f76c9, side: 0x66519c },
  { text: 'Picked the morning you moved in.', font: FONT_MED, size: .115, depth: .024, bevel: .004, front: 0xac9bd6, side: 0x8572b4 },
];
stage.dataset.textGeometry = 'extruded-inter';

/* ---------- content items (one stage at a time) ---------- */
const ITEM_DEFS = [
  { key: 'text', stage: 'text', kind: 'text3d', delay: 0, w: 2.9, h: .5, screen: [.10, .58], width: .52, mobile: { screen: [.02, .70], width: .90 }, z: .10, yaw: -.16, roll: -.01, phase: 0, still: true },
  { key: 'photo-a', stage: 'images', kind: 'photo', photo: 0, delay: 0, w: 1.36, h: 1.06, screen: [.40, .40], width: .30, mobile: { screen: [.26, .46], width: .46 }, z: .20, yaw: -.10, roll: -.03, phase: .9, still: true, stillScreen: [.46, .20], stillMobileScreen: [.24, .24] },
  { key: 'photo-b', stage: 'images', kind: 'photo', photo: 1, delay: .3, w: 1.36, h: 1.06, screen: [-.30, .70], width: .23, mobile: { screen: [-.36, .86], width: .34 }, z: .34, yaw: .12, roll: .04, phase: 2.1, still: true, stillScreen: [.76, -.14], stillMobileScreen: [.66, -.20] },
  { key: 'photo-c', stage: 'images', kind: 'photo', photo: 2, delay: .6, w: 1.36, h: 1.06, screen: [.72, -.28], width: .22, mobile: { screen: [.66, -.02], width: .34 }, z: .46, yaw: -.08, roll: -.04, phase: 3.3, still: true, stillScreen: [.34, -.50], stillMobileScreen: [.30, -.46] },
  { key: 'video', stage: 'video', kind: 'video', delay: 0, w: 1.64, h: 1.01, screen: [.44, .10], width: .46, mobile: { screen: [.30, .42], width: .80 }, z: .22, yaw: -.10, roll: -.03, phase: 1.5, still: false },
  { key: 'audio', stage: 'audio', kind: 'audio', delay: 0, w: 1.45, h: .69, screen: [.42, -.04], width: .42, mobile: { screen: [.30, .40], width: .82 }, z: .30, yaw: .08, roll: -.04, phase: 2.7, still: false },
];
/* Persistent decorations: visible through the whole loop, slow independent drift, never faded or repositioned. */
const DECOR_DEFS = [
  { key: 'chat', shape: 'chat', size: .56, screen: [-.76, -.52], mobile: { screen: [.70, -.64], k: .72 }, z: .02, phase: .6, yaw: -.22 },
  { key: 'sparkle', shape: 'sparkle', color: '#f3c9dc', size: .27, screen: [.90, .72], mobile: { screen: [.30, -.86], k: .8 }, z: .16, phase: 2.1, yaw: .3 },
  { key: 'sphere', shape: 'sphere', color: '#bfe9e1', size: .19, screen: [.84, -.80], mobile: { screen: [.86, -.86], k: .9 }, z: -.12, phase: 3.4, yaw: 0 },
];

/* ---------- drawing each format ---------- */
const DRAW = {
  photo(item, ctx, W, H) {
    ctx.clearRect(0, 0, W, H); const p = PHOTOS[item.photo];
    ctx.save(); rr(ctx, 0, 0, W, H, 26); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save(); rr(ctx, 26, 26, W - 52, H - 150, 18); ctx.clip(); p.draw(ctx, 26, 26, W - 52, H - 150); ctx.restore();
    ctx.fillStyle = '#2a2358'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = `italic 400 50px ${SERIF}`; ctx.fillText(p.caption, 34, H - 54);
    if (item.photo === 0) chip(ctx, 44, 44, 'IMAGE', 'rgba(255,255,255,0.92)', '#c4467a');
  },
  video(item, ctx, W, H) {
    ctx.clearRect(0, 0, W, H); const live = media.videoReady && media.video;
    ctx.save(); rr(ctx, 0, 0, W, H, 26); ctx.clip();
    if (live) { try { ctx.drawImage(media.video, 0, 0, W, H); } catch { drawCoverPhoto(ctx, 0, 0, W, H, .25); } } else drawCoverPhoto(ctx, 0, 0, W, H, .30);
    const g = ctx.createLinearGradient(0, H * .55, 0, H); g.addColorStop(0, 'rgba(20,14,60,0)'); g.addColorStop(1, 'rgba(20,14,60,0.6)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    chip(ctx, 34, 34, 'VIDEO', 'rgba(255,255,255,0.92)', '#3f4fc9');
    const cx = W / 2, cy = H / 2 - 10; ctx.beginPath(); ctx.arc(cx, cy, 64, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.86)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 18, cy - 28); ctx.lineTo(cx + 30, cy); ctx.lineTo(cx - 18, cy + 28); ctx.closePath(); ctx.fillStyle = '#4e3fc9'; ctx.fill();
    const prog = live ? (media.video.duration ? media.video.currentTime / media.video.duration : 0) : 0;
    rr(ctx, 34, H - 54, W - 68, 6, 3); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill(); if (prog > 0) { rr(ctx, 34, H - 54, (W - 68) * prog, 6, 3); ctx.fillStyle = '#fff'; ctx.fill(); }
    ctx.font = `600 28px ${SANS}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('First bloom', 34, H - 72); // no footage is bundled: this stays a still frame until a clip is named in hero-media.json
  },
  audio(item, ctx, W, H, _layer, prog, playing) {
    ctx.clearRect(0, 0, W, H); drawFrost(ctx, W, H);
    chip(ctx, 36, 34, 'AUDIO', '#dcf7ef', '#1f8f72');
    ctx.fillStyle = '#2a2358'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = `600 38px ${SANS}`;
    ctx.fillText('Voice note', 36, 146);
    ctx.font = `500 28px ${SANS}`; ctx.fillStyle = '#8b86ad'; const total = media.audioFileReady && media.audioFile.duration ? media.audioFile.duration : 4; const mm = (s) => `0:${String(Math.max(0, Math.round(s))).padStart(2, '0')}`;
    ctx.fillText(`${mm(prog * total)} / ${mm(total)}`, 246, 146);
    const n = 44, x0 = 36, x1 = W - 36, mid = H - 118, gap = (x1 - x0) / n;
    const base = [8, 14, 26, 20, 34, 44, 30, 40, 24, 16, 10, 7, 14, 22, 36, 42, 30, 22, 14, 8, 6, 10, 16, 24, 14, 8, 5, 12, 20, 30, 38, 26, 18, 12, 9, 15, 24, 18, 11, 7, 5, 9, 13, 7];
    const grad = ctx.createLinearGradient(x0, 0, x1, 0); grad.addColorStop(0, '#1f8f72'); grad.addColorStop(.6, '#2fb9d6'); grad.addColorStop(1, '#6c5ce7'); ctx.fillStyle = grad;
    for (let i = 0; i < n; i++) { const amp = base[i] * (playing ? 0.7 + 0.3 * Math.sin(prog * 40 + i * 0.6) : 1) * 2.1; const x = x0 + i * gap + gap * .2; ctx.globalAlpha = i / n < prog ? 1 : 0.38; rr(ctx, x, mid - amp, gap * .55, amp * 2, 4); ctx.fill(); }
    ctx.globalAlpha = 1; const px = x0 + (x1 - x0) * prog; ctx.fillStyle = '#2a2358'; rr(ctx, px - 2, mid - 100, 4, 200, 2); ctx.fill();
  },
};

/* ---------- build content meshes ---------- */
items = ITEM_DEFS.map((def, i) => {
  const group = new THREE.Group(); group.visible = false; scene.add(group);
  const item = { ...def, i, group, hover: new THREE.Vector3(), hoverTarget: new THREE.Vector3(), dirty: true, lastDraw: -1, mats: [], faces: [], anim: { enter: 0, exit: 0 } };
  const cv = document.createElement('canvas'); cv.width = def.kind === 'text3d' ? 2 : Math.round(def.w * PX_PER_UNIT); cv.height = def.kind === 'text3d' ? 2 : Math.round(def.h * PX_PER_UNIT);
  const ctx = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  item.cv = cv; item.ctx = ctx; item.tex = tex;
  if (def.kind === 'text3d') {
    // Real extruded type, built once and cached: shallow depth, soft bevel, satin lavender front, darker sides.
    let y = 0, maxW = 0; const meshes = [];
    TEXT_LINES.forEach((ln, idx) => {
      const geo = new TextGeometry(ln.text, { font: ln.font, size: ln.size, height: ln.depth, curveSegments: 6, bevelEnabled: true, bevelThickness: ln.bevel, bevelSize: ln.bevel * .8, bevelOffset: 0, bevelSegments: 3 });
      geo.computeBoundingBox(); const bb = geo.boundingBox; const w = bb.max.x - bb.min.x, h = bb.max.y - bb.min.y;
      geo.translate(-bb.min.x - w / 2, -bb.max.y, -(bb.max.z + bb.min.z) / 2); // top-left baseline block, centred in x and z
      const front = new THREE.MeshPhysicalMaterial({ color: ln.front, roughness: .48, metalness: 0, clearcoat: .35, clearcoatRoughness: .45, sheen: .25, sheenColor: new THREE.Color(0xffffff), envMapIntensity: .55, transparent: true });
      const side = new THREE.MeshPhysicalMaterial({ color: ln.side, roughness: .6, metalness: 0, envMapIntensity: .4, transparent: true });
      const mesh = new THREE.Mesh(geo, [front, side]); mesh.position.y = y; group.add(mesh); meshes.push(mesh); item.mats.push(front, side);
      y -= h + (idx === 0 ? ln.size * .62 : 0); maxW = Math.max(maxW, w);
    });
    const totalH = -y; group.children.forEach(m => { m.position.y += totalH / 2; }); // centre the block vertically
    item.w = maxW; item.h = totalH; item.textMeshes = meshes;
    item.box = { x: maxW / 2 + .03, y: totalH / 2 + .03, z0: -.05, z1: .05 };
    item.draw = null; item.dirty = false;
  } else {
    const bodyGeo = new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); const w = def.w, h = def.h, r = .08, x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; })(), { depth: .035, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 3, curveSegments: 14 });
    const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .72, metalness: 0, transparent: true, opacity: .42, depthWrite: false, toneMapped: false, envMapIntensity: .55 });
    group.add(new THREE.Mesh(bodyGeo, bodyMat));
    const faceMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(def.w, def.h), faceMat); face.position.z = .035 + .012 + .002; group.add(face);
    item.bodyMat = bodyMat; item.mats.push(faceMat); item.faces.push(face);
    item.box = { x: def.w / 2 + .014, y: def.h / 2 + .014, z0: -.014, z1: .052 };
    item.draw = (prog = 0, playing = false) => { DRAW[def.kind](item, ctx, cv.width, cv.height, 0, prog, playing); tex.needsUpdate = true; item.dirty = false; };
  }
  item.setOpacity = (o) => { item.mats.forEach(m => m.opacity = o); if (item.bodyMat) item.bodyMat.opacity = .42 * o; };
  return item;
});

/* ---------- persistent decorations ---------- */
const toyMat = (hex) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(hex), roughness: .52, metalness: 0, clearcoat: .32, clearcoatRoughness: .5, sheen: .35, sheenRoughness: .7, sheenColor: new THREE.Color(0xffffff), envMapIntensity: .6 });
function starShape(points, R, r) { const s = new THREE.Shape(); for (let i = 0; i < points * 2; i++) { const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2, rad = i % 2 ? r : R; const x = Math.cos(a) * rad, y = Math.sin(a) * rad; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); return s; }
/* Double speech bubble modelled from the reference: a larger rounded bubble behind (upper left), a smaller one in
   front (lower right), puffy convex faces from deep bevels, short rounded tails, raised ivory dots. */
function makeChat(S) {
  const g = new THREE.Group();
  const bubble = (rx, ry, depth, color, tailDir) => {
    const shape = new THREE.Shape(); shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
    const bevel = Math.min(rx, ry) * .30;
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * 1.7, bevelSize: bevel, bevelSegments: 14, curveSegments: 56 }); geo.center();
    const mat = toyMat(color); const body = new THREE.Mesh(geo, mat);
    // tail: short asymmetric rounded wedge drawn flat (no edge-on rotation), tucked under the rim, same material
    const tail = new THREE.Shape(); const tw = ry * .72, tl = ry * .70;
    tail.moveTo(-tw * .55, ry * .10); tail.quadraticCurveTo(-tw * .62, -tl * .55, -tw * .30, -tl); tail.quadraticCurveTo(-tw * .05, -tl * .55, tw * .40, ry * .02); tail.quadraticCurveTo(0, ry * .22, -tw * .55, ry * .10);
    const tgeo = new THREE.ExtrudeGeometry(tail, { depth: depth * .8, bevelEnabled: true, bevelThickness: depth * .9, bevelSize: tw * .14, bevelSegments: 8, curveSegments: 24 }); tgeo.center();
    const tailMesh = new THREE.Mesh(tgeo, mat); tailMesh.position.set(tailDir * rx * .52, -ry * .82, -depth * .1); tailMesh.scale.x = -tailDir;
    const grp = new THREE.Group(); grp.add(body, tailMesh); grp.userData.front = depth / 2 + depth * 1.7; return grp;
  };
  const back = bubble(S * .36, S * .32, S * .10, '#a9c8ee', -1); back.position.set(-S * .13, S * .13, 0);
  const front = bubble(S * .26, S * .23, S * .10, '#f1cd7f', 1); front.position.set(S * .19, -S * .14, S * .20);
  const dotMat = toyMat('#fff8ec'); dotMat.roughness = .45;
  const dot = (r, x, y, parent, z) => { const d = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), dotMat); d.scale.z = .55; d.position.set(x, y, z - r * .12); parent.add(d); };
  [-1, 1].forEach(k => dot(S * .052, k * S * .10, S * .0, back, back.userData.front));
  [-1, 0, 1].forEach(k => dot(S * .040, k * S * .085, -S * .005, front, front.userData.front));
  // subtle contact shadow behind the icon
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(S * 1.25, S * .9), new THREE.MeshBasicMaterial({ map: radialTexture(128, [[0, 'rgba(60,48,120,0.28)'], [.5, 'rgba(60,48,120,0.09)'], [1, 'rgba(60,48,120,0)']]), transparent: true, depthWrite: false, toneMapped: false }));
  shadow.position.set(S * .06, -S * .16, -S * .30); g.add(shadow, back, front);
  return { group: g, box: { x: S * .60, y: S * .56, z0: -S * .32, z1: S * .34 } };
}
const decor = DECOR_DEFS.map((def) => {
  const S = def.size; let built;
  if (def.shape === 'chat') built = makeChat(S);
  else if (def.shape === 'sparkle') { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape(4, S * .5, S * .15), { depth: S * .10, bevelEnabled: true, bevelThickness: S * .06, bevelSize: S * .05, bevelSegments: 6 }), toyMat(def.color)); m.geometry.center(); const g = new THREE.Group(); g.add(m); built = { group: g, box: { x: S * .55, y: S * .55, z0: -S * .15, z1: S * .15 } }; }
  else { const m = new THREE.Mesh(new THREE.SphereGeometry(S * .5, 40, 28), toyMat(def.color)); const g = new THREE.Group(); g.add(m); built = { group: g, box: { x: S * .52, y: S * .52, z0: -S * .52, z1: S * .52 } }; }
  built.group.visible = true; scene.add(built.group);
  return { ...def, group: built.group, box: built.box, persistent: true };
});
const allBodies = [...items, ...decor];

/* ---------- content timeline (GSAP) ----------
   One paused master timeline owns every content entrance, hold and exit. It tweens plain state objects
   (item.anim.enter / item.anim.exit), never Three.js objects directly, and it is advanced from the single
   render loop with master.time(t) — GSAP's own ticker never runs it, so there is exactly one clock, seeking
   is deterministic, and pausing (hidden tab, off-screen) resumes without a jump. The scan bar, the decorations'
   drift and the hover response stay on the frame loop because they are continuous functions of absolute time
   and must not reset at content transitions. See GSAP-ANIMATION-GUIDE.md. */
const master = gsap.timeline({ paused: true });
items.forEach((item) => {
  const s = STAGES[item.stage], d = item.delay || 0;
  master.set(item.anim, { enter: 0, exit: 0 }, 0)
    .to(item.anim, { enter: 1, duration: ENTER_DUR, ease: 'power2.out' }, s.enter + d)
    .to(item.anim, { exit: 1, duration: EXIT_DUR, ease: 'power1.inOut' }, s.exit + d * .5);
});
master.addLabel('cycle-end', CYCLE).set({}, {}, CYCLE); // pads the timeline to the full cycle length
stage.dataset.animationDriver = 'gsap-timeline';

/* ---------- hover: optional, bounded, disabled for touch / reduced motion ---------- */
const hoverRay = new THREE.Raycaster(), hoverPointer = new THREE.Vector2();
function clearHover() { items.forEach(c => { c.hoverTarget.set(0, 0, 0); if (motionMQ.matches || innerWidth <= 640) c.hover.set(0, 0, 0); }); stage.dataset.hoveredFormat = ''; canvas.style.cursor = 'default'; }
function onPointerMove(event) {
  if (innerWidth <= 640 || motionMQ.matches || params.has('still') || event.pointerType === 'touch') { clearHover(); return; }
  const r = canvas.getBoundingClientRect(); hoverPointer.set((event.clientX - r.left) / r.width * 2 - 1, -(event.clientY - r.top) / r.height * 2 + 1); hoverRay.setFromCamera(hoverPointer, camera);
  const faces = []; items.forEach(c => { if (c.group.visible) faces.push(...c.faces); });
  const hit = hoverRay.intersectObjects(faces)[0]; clearHover(); if (!hit) return;
  const card = items.find(c => c.faces.includes(hit.object)); card.hoverTarget.set((hit.uv.x - .5) * 12 * card.unitsPerPixel, (hit.uv.y - .5) * 10 * card.unitsPerPixel, 4 * card.unitsPerPixel); stage.dataset.hoveredFormat = card.key; canvas.style.cursor = 'pointer';
}
stage.addEventListener('pointermove', onPointerMove); stage.addEventListener('pointerleave', clearHover);

/* ---------- sound: no control in the hero; all media stays muted and the waveform is visual-only ---------- */
let soundOn = false, activeSound = null;
function stopSound() { if (activeSound) { activeSound.stop(); activeSound = null; } stage.dataset.soundState = 'muted'; }
function onVisibility() { if (document.hidden) stopSound(); }
document.addEventListener('visibilitychange', onVisibility);
stage.dataset.soundState = 'muted';

/* ---------- timeline state ---------- */
function itemState(def, t, still) {
  if (def.persistent) return { visible: true, enter: 1, raw: 1, exit: 0 };
  if (still) { const show = def.still !== false && !(def.stillMobile === false && isMobile); return { visible: show, enter: 1, exit: 0, raw: 1 }; }
  const e = def.anim.enter, x = def.anim.exit;
  if (e <= 0 || x >= 1) return { visible: false };
  return { visible: true, enter: e, raw: e, exit: x };
}
function currentStage(t) { for (const k of STAGE_ORDER) { const s = STAGES[k]; if (t >= s.enter && t < s.exit + EXIT_DUR) return k; } return 'rest'; }

const tmpV = new THREE.Vector3(), driftV = new THREE.Vector3(), start = new THREE.Vector3(), revealRay = new THREE.Vector3();
let isMobile = false;
function slotPosition(body, t, out, still) {
  const target = still && body.stillTarget ? body.stillTarget : body.target;
  const tt = still ? STILL_TIME : t, ph = body.phase || 0, k = body.persistent ? .55 : 1;
  return out.copy(target).add(driftV.set(4 * k * body.unitsPerPixel * Math.sin(tt * .42 * k + ph), 5 * k * body.unitsPerPixel * Math.sin(tt * .56 * k + ph), .03 * Math.sin(tt * .37 + ph)));
}

function update(t, ts, still) {
  flower.rotation.set(0, 0, 0);
  // continuous scan on its own clock (absolute seconds): travel top → bottom, soft fade, short rest, repeat
  const top = flower.position.y + sculptBounds.max.y + .12, bottom = flower.position.y + sculptBounds.min.y - .04;
  let sp, sOp;
  if (still) { sp = .42; sOp = .45; } else { const u = ts % SCAN.period; sp = clamp01(u / SCAN.travel); sOp = u <= SCAN.travel ? smoothstep(0, .07, sp) * (1 - smoothstep(.86, 1, sp)) : 0; }
  const sy = lerp(top, bottom, still ? sp : easeInOut(sp));
  const spE = still ? sp : easeInOut(sp); const widthK = (.45 + .41 * Math.sin(Math.PI * spE)) / .86; // 45% of flower width at both ends, 86% mid-travel, symmetric
  scanGlow.scale.x = scanCore.scale.x = widthK;
  scanGroup.visible = sOp > 0; scanGlow.material.opacity = .55 * sOp; scanCore.material.opacity = .75 * sOp;
  scanGlow.position.y = scanCore.position.y = sy;
  scanU.uScanY.value = sOp > 0 ? sy : -10; scanU.uScanStrength.value = sOp;

  const stageKey = still ? 'still' : currentStage(t);
  const audioS = STAGES.audio; const audioPlayWindow = !still && !paused && t >= audioS.enter + ENTER_DUR * .5 && t < audioS.exit;
  const audioTotal = (media.audioFileReady && media.audioFile.duration) || 4;
  const audioProg = clamp01((t - (audioS.enter + ENTER_DUR * .5)) / audioTotal);
  if (activeSound) stopSound(); // no sound path in the hero
  if (media.video) { const inVideo = !still && !paused && stageKey === 'video'; if (inVideo && media.video.paused && media.videoReady) media.video.play().catch(() => { }); if (!inVideo && !media.video.paused) { media.video.pause(); media.video.currentTime = 0; } }

  const visibleKeys = [];
  allBodies.forEach((body) => {
    const st = itemState(body, t, still);
    if (!st.visible) { body.group.visible = false; if (body.hover) { body.hover.set(0, 0, 0); body.hoverTarget.set(0, 0, 0); if (stage.dataset.hoveredFormat === body.key) { stage.dataset.hoveredFormat = ''; canvas.style.cursor = 'default'; } } return; }
    body.group.visible = true; visibleKeys.push(body.key);
    slotPosition(body, body.persistent ? ts : t, tmpV, still);
    if (body.persistent) {
      body.group.position.copy(tmpV);
      body.group.scale.setScalar(body.baseScale);
      body.group.lookAt(camera.position);
      const tt = still ? STILL_TIME : ts, ph = body.phase || 0;
      body.group.rotateY(body.yaw + .10 * Math.sin(tt * .26 + ph)); body.group.rotateZ(.06 * Math.sin(tt * .21 + ph)); body.group.rotateX(.05 * Math.sin(tt * .19 + ph));
    } else {
      // content emerges just in front of the bloom, already on the separated foreground plane
      start.copy(tmpV).sub(FLOWER_CENTER).normalize().multiplyScalar(.45).add(FLOWER_CENTER);
      start.y = flower.position.y + rootLocal.y + FLOWER_HEIGHT * .78;
      start.project(camera); revealRay.set(start.x, start.y, .5).unproject(camera).sub(camera.position).normalize();
      start.copy(camera.position).addScaledVector(revealRay, (body.z - camera.position.z) / revealRay.z);
      body.group.position.lerpVectors(start, tmpV, st.enter);
      body.hover.lerp(body.hoverTarget, .085); body.group.position.add(body.hover);
      const sc = (.9 + .1 * st.enter) * (1 - .06 * st.exit); // restrained: no overshoot, no zoom
      body.group.scale.setScalar(Math.max(.001, sc) * body.baseScale);
      body.setOpacity(st.enter * (1 - st.exit));
      body.group.position.y += st.exit * body.unitsPerPixel * 10;
      body.group.lookAt(camera.position);
      const tt = still ? STILL_TIME : t, ph = body.phase || 0;
      body.group.rotateY(body.yaw + .02 * Math.sin(tt * .5 + ph) + body.hover.x / body.unitsPerPixel * .004); body.group.rotateX(.02 * Math.sin(tt * .45 + ph) - body.hover.y / body.unitsPerPixel * .004); body.group.rotateZ(body.roll + .012 * Math.sin(tt * .35 + ph));
    }
    containBody(body);
    if (body.kind === 'audio') { const playing = !!activeSound; if (body.dirty || (!still && (t < body.lastDraw || t - body.lastDraw >= 1 / 24))) { body.draw(still ? .42 : audioProg, playing); body.lastDraw = t; } }
    else if (body.kind === 'video') { if (body.dirty || (media.videoReady && !still && t - body.lastDraw >= 1 / 24)) { body.draw(); body.lastDraw = t; } }
    else if (body.dirty && body.draw) body.draw();
    if (body.kind === 'text3d') body.group.rotateX(-.06); // slight downward tilt reveals the extrusion
  });

  const phase = still ? 'hold' : stageKey === 'rest' ? 'object' : stageKey;
  stage.dataset.phase = phase; stage.dataset.stage = stageKey; stage.dataset.time = t.toFixed(3); stage.dataset.scanProgress = sp.toFixed(3); stage.dataset.scanOpacity = sOp.toFixed(3); stage.dataset.paused = String(paused);
  stage.dataset.visibleFormats = visibleKeys.join(','); stage.dataset.cycle = String(Math.floor(elapsed / 1000 / CYCLE)); stage.dataset.loopDuration = String(CYCLE);
  stage.dataset.hoverAmount = Math.max(...items.map(c => c.hover.length())).toFixed(3);
  if (params.has('qa')) {
    stage.dataset.cardBounds = JSON.stringify(allBodies.filter(c => c.group.visible).map(c => ({ key: c.key, ...c.screenBounds })));
    stage.dataset.flowerFront = flowerFront.toFixed(3);
    const vis = allBodies.filter(c => c.group.visible); stage.dataset.minDepthGap = vis.length ? Math.min(...vis.map(c => c.screenBounds.minZ - flowerFront)).toFixed(3) : '';
  }
}

/* Project each body's transformed box, then keep it inside the canvas with padding. Covers bevel, reveal
   overshoot, yaw/roll, hover and continuous drift, for cards, typography and decorations alike. */
let flowerFront = 0;
const fitPoint = new THREE.Vector3(), fitCameraPoint = new THREE.Vector3(), viewRight = new THREE.Vector3(), viewUp = new THREE.Vector3();
function projectedBounds(body) {
  body.group.updateMatrixWorld(true); const b = body.box;
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity, minZ = Infinity;
  for (const x of [-b.x, b.x]) for (const y of [-b.y, b.y]) for (const z of [b.z0, b.z1]) {
    fitPoint.set(x, y, z).applyMatrix4(body.group.matrixWorld); minZ = Math.min(minZ, fitPoint.z); fitPoint.project(camera);
    const px = (fitPoint.x + 1) * stage.clientWidth / 2, py = (1 - fitPoint.y) * stage.clientHeight / 2;
    left = Math.min(left, px); right = Math.max(right, px); top = Math.min(top, py); bottom = Math.max(bottom, py);
  }
  return { left, top, right, bottom, minZ };
}
function containBody(body) {
  const w = stage.clientWidth, h = stage.clientHeight, pad = Math.min(22, w * .045);
  for (let pass = 0; pass < 3; pass++) {
    const b = projectedBounds(body);
    const scale = Math.min(1, (w - 2 * pad) / (b.right - b.left), (h - 2 * pad) / (b.bottom - b.top));
    if (scale < 1) { body.group.scale.multiplyScalar(scale); continue; }
    const dx = b.left < pad ? pad - b.left : b.right > w - pad ? w - pad - b.right : 0;
    const dy = b.top < pad ? pad - b.top : b.bottom > h - pad ? h - pad - b.bottom : 0;
    if (!dx && !dy) break;
    const depth = -fitCameraPoint.copy(body.group.position).applyMatrix4(camera.matrixWorldInverse).z;
    const unit = 2 * depth * Math.tan(deg(camera.fov / 2)) / h;
    body.group.position.addScaledVector(viewRight, dx * unit).addScaledVector(viewUp, -dy * unit);
  }
  body.screenBounds = projectedBounds(body);
}

/* ---------- sizing ---------- */
function resize() {
  if (innerWidth <= 640) clearHover();
  const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false);
  const aspect = w / h; camera.aspect = aspect; isMobile = aspect < .85;
  const dist = camera.position.distanceTo(LOOK_AT);
  const fromWidth = (2 * Math.atan(3.45 / (aspect * dist)) * 180) / Math.PI;
  camera.fov = Math.max(44, Math.min(isMobile ? 62 : 74, fromWidth)); camera.updateProjectionMatrix();
  camera.lookAt(LOOK_AT); camera.updateMatrixWorld(true);
  viewRight.set(1, 0, 0).applyQuaternion(camera.quaternion); viewUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
  // Root anchor: 36% / 27% across, 87% down the stage. Bloom raised into the annotated oval, foot grounded.
  const ray = new THREE.Vector3(isMobile ? -.46 : -.28, -.74, .5).unproject(camera).sub(camera.position).normalize(); const anchor = camera.position.clone().addScaledVector(ray, -camera.position.z / ray.z);
  flower.position.copy(anchor).sub(rootLocal);
  contact.position.set(anchor.x, anchor.y + .004, anchor.z); castShadow.position.set(anchor.x, anchor.y + .003, anchor.z);
  FLOWER_CENTER.set(anchor.x, anchor.y + FLOWER_HEIGHT, anchor.z);
  flowerFront = flower.position.z + sculptBounds.max.z;
  scanGroup.position.set(flower.position.x + (sculptBounds.min.x + sculptBounds.max.x) / 2, 0, flowerFront + .30);
  stage.dataset.rootAnchor = isMobile ? '27%,87%' : '36%,87%';
  const layoutWidth = Math.min(w, h * 1.08); stage.dataset.layoutWidth = layoutWidth.toFixed(1);
  const place = (screen, z) => { const r = new THREE.Vector3(screen[0], screen[1], .5).unproject(camera).sub(camera.position).normalize(); return camera.position.clone().addScaledVector(r, (z - camera.position.z) / r.z); };
  allBodies.forEach(body => {
    const m = isMobile && body.mobile && typeof body.mobile === 'object' ? body.mobile : null;
    // Everything sits beyond the sculpt's frontmost surface: no physical intersection with the flower.
    body.z = flowerFront + 1.05 + (body.z0 ?? (body.z0 = body.z));
    const screen = m ? m.screen : body.screen;
    body.target = place(screen, body.z);
    const ss = isMobile ? (body.stillMobileScreen || null) : (body.stillScreen || null); body.stillTarget = ss ? place(ss, body.z) : null;
    const depth = body.target.clone().applyMatrix4(camera.matrixWorldInverse).z * -1;
    body.unitsPerPixel = 2 * depth * Math.tan(deg(camera.fov / 2)) / h;
    if (body.kind) { const width = m ? m.width : body.width; body.baseScale = body.unitsPerPixel * layoutWidth * width / body.w; }
    else { const k = m ? m.k : 1; body.baseScale = k * body.unitsPerPixel * layoutWidth * (body.size * .30) / body.size; }
  });
  needsRender = true;
}

/* ---------- loop + controls ---------- */
const staticPreview = params.has('still');
let still = motionMQ.matches || staticPreview;
let paused = params.has('hold');
let elapsed = Math.max(0, parseFloat(params.get('t')) || 0) * 1000;
let last = performance.now();
const viewObserver = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; last = performance.now(); needsRender = true; if (!inView) stopSound(); }); viewObserver.observe(stage);

function setControls() {
  pauseBtn.setAttribute('aria-pressed', String(paused));
  pauseBtn.querySelector('span').textContent = still ? 'Static view' : paused ? 'Resume' : 'Pause';
  pauseBtn.disabled = still;
}
function tick(now) {
  if (disposed) return;
  if (document.hidden || !inView) { last = now; rafId = requestAnimationFrame(tick); return; }
  if (!paused && !still) elapsed += Math.max(0, Math.min(1000, now - last));
  last = now;
  const ts = elapsed / 1000, t = still ? STILL_TIME : ts % CYCLE;
  if (!still || needsRender || items.some(c => c.dirty)) {
    if (!still) master.time(t, true); // GSAP renders the content state for this exact loop time (no ticker involved)
    update(t, ts, still);
    const renderStart = performance.now(); renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; stage.dataset.firstRenderCostMs = (performance.now() - renderStart).toFixed(1); stage.dataset.firstCanvasMs = performance.now().toFixed(1); stage.dataset.ready = 'true'; fallbackEl.hidden = true; fallbackEl.setAttribute('aria-hidden', 'true'); stage.dataset.posterRetired = 'true'; stage.dataset.loadState = 'ready'; }
    needsRender = false;
  }
  rafId = requestAnimationFrame(tick);
}
pauseBtn.addEventListener('click', () => { paused = !paused; last = performance.now(); if (paused) stopSound(); setControls(); needsRender = true; });
replayBtn.addEventListener('click', () => { elapsed = 0; last = performance.now(); paused = false; still = motionMQ.matches || staticPreview; stopSound(); needsRender = true; setControls(); });
function onMotionChange() { still = motionMQ.matches || staticPreview; elapsed = 0; stopSound(); clearHover(); needsRender = true; setControls(); }
motionMQ.addEventListener('change', onMotionChange);

document.fonts.ready.then(() => { items.forEach(c => c.dirty = true); needsRender = true; });
await (async () => {
  items.forEach((c) => (c.dirty = true));
  resize(); setControls();
  stage.dataset.setupDoneMs = performance.now().toFixed(1);
  await renderer.compileAsync(scene, camera);
  stage.dataset.shaderReadyMs = performance.now().toFixed(1);
  last = performance.now();
  rafId = requestAnimationFrame(tick);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
  function dispose() {
    if (disposed) return; disposed = true; cancelAnimationFrame(rafId); master.kill(); stopSound();
    if (media.video) { media.video.pause(); media.video.removeAttribute('src'); media.video.load(); }
    viewObserver.disconnect(); resizeObserver.disconnect(); motionMQ.removeEventListener('change', onMotionChange);
    stage.removeEventListener('pointermove', onPointerMove); stage.removeEventListener('pointerleave', clearHover); document.removeEventListener('visibilitychange', onVisibility);
    allBodies.forEach(b => { b.group.traverse(o => { if (o.isMesh) { o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); } }); });
    renderer.dispose(); stage.dataset.loadState = 'disposed'; delete window.__reviaHero;
  }
  window.__reviaHero = { seek(sec, hold = true) { elapsed = sec * 1000; paused = hold; if (hold) stopSound(); needsRender = true; setControls(); }, dispose, master, scene, camera, renderer, items, decor, timeline: { CYCLE, SCAN, STAGES, ENTER_DUR, EXIT_DUR }, get soundOn() { return soundOn; } };
  console.info('[revia-hero] three r' + THREE.REVISION + ' scene ready');
})();
