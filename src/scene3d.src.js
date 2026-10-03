/*
 * WhichAI - the model constellation (v0.33.0)
 *
 * Source for js/scene3d.js. Build with: node tools/bundle-3d.mjs
 *
 * This is not decoration. Every point is a real model from the catalog, and
 * where it sits in space is what the catalog says about it:
 *
 *   x  price per million output tokens, log scale (cheap left, dear right)
 *   y  Artificial Analysis index (weak low, strong high)
 *   z  how recently it shipped (older behind, newest in front)
 *
 * The scene morphs between four formations as you scroll, so the same 118
 * points read first as a cloud, then as the real price/performance plane,
 * then as a ranked ladder. Nothing is invented for the animation: the
 * positions ARE the dataset, which is why the shapes it forms mean something.
 *
 * Unmeasured models (rumoured, private) carry no index score and are drawn
 * dim, far back, and never in the ladder. The same rule the rest of the site
 * follows, expressed in geometry.
 *
 * Cost control: this file is loaded lazily and only when the device can
 * afford it (see js/stage.js). Everything degrades to a 2D canvas.
 */
import {
  Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, BufferAttribute,
  Points, ShaderMaterial, Color, Vector2, Vector3, AdditiveBlending,
  LineSegments, LineBasicMaterial, MathUtils
} from "three";

/* Vendor families get stable hues so the same lab is the same colour on every
   screen of the site, matching the brand accents used elsewhere. */
const FAMILY_COLOR = {
  claude: "#d97757", chatgpt: "#10a37f", gemini: "#4285f4", perplexity: "#20a5b8",
  grok: "#e8e8ea", copilot: "#4f8ef7", meta: "#0866ff", llama: "#0866ff",
  glm: "#c04af0", kimi: "#7c5cff", nemotron: "#76b900", deepseek: "#4d6bfe",
  qwen: "#ff6a3d"
};
const DEFAULT_COLOR = "#8b93a7";

const FORMATIONS = ["cloud", "scatter", "ladder", "focus"];

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function lerp(a, b, t) { return a + (b - a) * t; }

/* Deterministic pseudo-random from the model id: the cloud looks organic but
   is identical on every load and every device, so nothing jumps on reload. */
function hash01(str, salt) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}

function buildPoints(models) {
  /* Ranked = officially measured. A converted (~) or guessed value never
     takes a rung on the ladder: it floats with the unmeasured below it. */
  const measured = models.filter((m) => m.score && typeof m.score.aa === "number" && !m.score.est);
  const scores = measured.map((m) => m.score.aa);
  const minS = Math.min.apply(null, scores), maxS = Math.max.apply(null, scores);
  const prices = models
    .map((m) => (m.spec && typeof m.spec.priceOut === "number" ? m.spec.priceOut : null))
    .filter((v) => v != null && v > 0);
  const minP = Math.log10(Math.min.apply(null, prices) || 0.1);
  const maxP = Math.log10(Math.max.apply(null, prices) || 100);
  const dates = models
    .map((m) => (m.spec && m.spec.released ? Date.parse(m.spec.released) : null))
    .filter((v) => v && isFinite(v));
  const minD = Math.min.apply(null, dates), maxD = Math.max.apply(null, dates);

  const ranked = measured.slice().sort((a, b) => b.score.aa - a.score.aa);
  const rankOf = {};
  ranked.forEach((m, i) => { rankOf[m.id] = i; });

  return models.map((m, i) => {
    const aa = m.score && typeof m.score.aa === "number" && !m.score.est ? m.score.aa : null;
    const sNorm = aa == null ? 0 : (aa - minS) / Math.max(1e-6, maxS - minS);
    const priceOut = m.spec && typeof m.spec.priceOut === "number" ? m.spec.priceOut : null;
    const pNorm = priceOut == null || priceOut <= 0
      ? hash01(m.id, 7) * 0.6 + 0.2
      : (Math.log10(priceOut) - minP) / Math.max(1e-6, maxP - minP);
    const released = m.spec && m.spec.released ? Date.parse(m.spec.released) : null;
    const dNorm = released && isFinite(released) ? (released - minD) / Math.max(1, maxD - minD) : 0.15;

    const rx = hash01(m.id, 11), ry = hash01(m.id, 23), rz = hash01(m.id, 37);
    const rank = rankOf[m.id];

    /* Four target positions per point. The renderer lerps between them, so a
       scroll is a continuous reading of the same data from another angle. */
    const cloud = new Vector3(
      (rx - 0.5) * 38,
      (ry - 0.5) * 23 + sNorm * 5,
      (rz - 0.5) * 26
    );
    const scatter = new Vector3(
      (pNorm - 0.5) * 40,
      (sNorm - 0.45) * 27,
      (dNorm - 0.5) * 14
    );
    const ladder = aa == null
      ? new Vector3((rx - 0.5) * 26, -13 - rz * 5, -14 - rz * 6)
      : new Vector3(
          ((rank % 6) - 2.5) * 3.4 + (rx - 0.5) * 0.7,
          10.5 - Math.floor(rank / 6) * 1.28,
          (rz - 0.5) * 2.2
        );
    const focus = aa == null
      ? new Vector3((rx - 0.5) * 34, (ry - 0.5) * 20, -22 - rz * 8)
      : new Vector3(
          (rx - 0.5) * 26 * (1 - sNorm * 0.72),
          (ry - 0.5) * 15 * (1 - sNorm * 0.72),
          (rz - 0.5) * 16 * (1 - sNorm * 0.72) + sNorm * 5
        );

    const color = new Color(FAMILY_COLOR[m.family] || DEFAULT_COLOR);
    /* Unmeasured models are visibly faint: the geometry says "we do not know". */
    const alpha = aa == null ? 0.32 : 0.68 + sNorm * 0.32;
    const size = aa == null ? 6 : 9 + sNorm * 26;

    return { model: m, index: i, cloud, scatter, ladder, focus, color, alpha, size, rank, aa, sNorm };
  });
}

const VERT = `
  attribute vec3 aCloud, aScatter, aLadder, aFocus, aColor;
  attribute float aSize, aAlpha, aSeed;
  uniform float uMixA, uMixB, uMixC, uTime, uPixelRatio, uHover, uBreath;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = aCloud;
    p = mix(p, aScatter, uMixA);
    p = mix(p, aLadder, uMixB);
    p = mix(p, aFocus, uMixC);
    /* A slow, per-point drift so the cloud never looks frozen. */
    float t = uTime * 0.28 + aSeed * 6.2831;
    p += vec3(sin(t) , cos(t * 0.83), sin(t * 0.67)) * uBreath;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float pulse = 0.86 + 0.14 * sin(uTime * 1.5 + aSeed * 12.0);
    gl_PointSize = aSize * uPixelRatio * pulse * (34.0 / max(1.0, -mv.z));
    vColor = aColor;
    vAlpha = aAlpha;
  }
`;

const FRAG = `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    /* Soft core plus halo: reads as a light source, not a sprite. */
    float core = smoothstep(0.5, 0.06, d);
    float halo = smoothstep(0.5, 0.22, d) * 0.5;
    gl_FragColor = vec4(vColor, (core + halo) * vAlpha);
  }
`;

class Constellation {
  constructor(canvas, models, opts) {
    this.canvas = canvas;
    this.opts = opts || {};
    this.points = buildPoints(models);
    this.mix = { a: 0, b: 0, c: 0 };
    this.target = { a: 0, b: 0, c: 0 };
    this.pointer = new Vector2(0, 0);
    this.pointerTarget = new Vector2(0, 0);
    this.spin = 0;
    this.offsetX = 0;
    this.offsetTarget = 0;
    this.running = false;
    this.hovered = null;
    this._onHover = this.opts.onHover || function () {};
    this._build();
  }

  _build() {
    const n = this.points.length;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(52, 1, 0.1, 300);
    this.camera.position.set(0, 0, 42);

    this.renderer = new WebGLRenderer({
      canvas: this.canvas, antialias: false, alpha: true,
      powerPreference: "low-power", failIfMajorPerformanceCaveat: false
    });
    this.renderer.setClearColor(0x000000, 0);
    /* Capping the pixel ratio is the single biggest win on phones: a 3x
       retina buffer costs nine times the fragments for no visible gain here. */
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    this.renderer.setPixelRatio(this.dpr);

    const geo = new BufferGeometry();
    const pos = new Float32Array(n * 3);
    const cloud = new Float32Array(n * 3), scatter = new Float32Array(n * 3);
    const ladder = new Float32Array(n * 3), focus = new Float32Array(n * 3);
    const color = new Float32Array(n * 3);
    const size = new Float32Array(n), alpha = new Float32Array(n), seed = new Float32Array(n);

    this.points.forEach((p, i) => {
      const j = i * 3;
      pos[j] = p.cloud.x; pos[j + 1] = p.cloud.y; pos[j + 2] = p.cloud.z;
      cloud[j] = p.cloud.x; cloud[j + 1] = p.cloud.y; cloud[j + 2] = p.cloud.z;
      scatter[j] = p.scatter.x; scatter[j + 1] = p.scatter.y; scatter[j + 2] = p.scatter.z;
      ladder[j] = p.ladder.x; ladder[j + 1] = p.ladder.y; ladder[j + 2] = p.ladder.z;
      focus[j] = p.focus.x; focus[j + 1] = p.focus.y; focus[j + 2] = p.focus.z;
      color[j] = p.color.r; color[j + 1] = p.color.g; color[j + 2] = p.color.b;
      size[i] = p.size; alpha[i] = p.alpha; seed[i] = hash01(p.model.id, 91);
    });

    geo.setAttribute("position", new BufferAttribute(pos, 3));
    geo.setAttribute("aCloud", new BufferAttribute(cloud, 3));
    geo.setAttribute("aScatter", new BufferAttribute(scatter, 3));
    geo.setAttribute("aLadder", new BufferAttribute(ladder, 3));
    geo.setAttribute("aFocus", new BufferAttribute(focus, 3));
    geo.setAttribute("aColor", new BufferAttribute(color, 3));
    geo.setAttribute("aSize", new BufferAttribute(size, 1));
    geo.setAttribute("aAlpha", new BufferAttribute(alpha, 1));
    geo.setAttribute("aSeed", new BufferAttribute(seed, 1));

    this.uniforms = {
      uMixA: { value: 0 }, uMixB: { value: 0 }, uMixC: { value: 0 },
      uTime: { value: 0 }, uPixelRatio: { value: this.dpr },
      uHover: { value: -1 }, uBreath: { value: 0.35 }
    };

    this.material = new ShaderMaterial({
      uniforms: this.uniforms, vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthWrite: false, blending: AdditiveBlending
    });

    this.cloudMesh = new Points(geo, this.material);
    this.scene.add(this.cloudMesh);
    this.geo = geo;

    /* The path through the top twelve: the leaderboard drawn as a line the
       eye can follow, which is the same metaphor the page uses in 2D. */
    this._buildPath();
    this.resize();
  }

  _buildPath() {
    const top = this.points
      .filter((p) => p.aa != null)
      .sort((a, b) => b.aa - a.aa)
      .slice(0, 12);
    if (top.length < 2) return;
    const seg = new Float32Array((top.length - 1) * 6);
    this.pathPoints = top;
    for (let i = 0; i < top.length - 1; i++) {
      const a = top[i].cloud, b = top[i + 1].cloud;
      seg[i * 6] = a.x; seg[i * 6 + 1] = a.y; seg[i * 6 + 2] = a.z;
      seg[i * 6 + 3] = b.x; seg[i * 6 + 4] = b.y; seg[i * 6 + 5] = b.z;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(seg, 3));
    this.pathGeo = g;
    this.path = new LineSegments(g, new LineBasicMaterial({
      color: 0x6ea8ff, transparent: true, opacity: 0.0, blending: AdditiveBlending, depthWrite: false
    }));
    this.scene.add(this.path);
  }

  _updatePath() {
    if (!this.pathGeo || !this.pathPoints) return;
    const arr = this.pathGeo.attributes.position.array;
    const at = (p) => {
      const v = p.cloud.clone();
      v.lerp(p.scatter, this.mix.a);
      v.lerp(p.ladder, this.mix.b);
      v.lerp(p.focus, this.mix.c);
      return v;
    };
    for (let i = 0; i < this.pathPoints.length - 1; i++) {
      const a = at(this.pathPoints[i]), b = at(this.pathPoints[i + 1]);
      arr[i * 6] = a.x; arr[i * 6 + 1] = a.y; arr[i * 6 + 2] = a.z;
      arr[i * 6 + 3] = b.x; arr[i * 6 + 4] = b.y; arr[i * 6 + 5] = b.z;
    }
    this.pathGeo.attributes.position.needsUpdate = true;
    /* The path only appears once the ladder forms: it is the ranking, so it
       would be a lie in the cloud. */
    this.path.material.opacity = this.mix.b * 0.5;
  }

  /* progress 0..1 across the whole narrative; maps onto the four formations */
  setProgress(p) {
    const t = clamp01(p) * 3;
    this.target.a = clamp01(t);
    this.target.b = clamp01(t - 1);
    this.target.c = clamp01(t - 2);
  }

  setPointer(nx, ny) { this.pointerTarget.set(nx, ny); }

  /* World-space nudge so the formation centres in the space the layout leaves
     for it, instead of fighting the text column for the middle. */
  setOffset(x) { this.offsetTarget = x; }

  /* Screen-space pick: cheaper and steadier than a raycast against points,
     and it lets a fingertip hit a target it can actually see. */
  pick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const v = new Vector3();
    let best = null, bestD = 46 * 46;
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      if (p.aa == null) continue;
      v.copy(p.cloud).lerp(p.scatter, this.mix.a).lerp(p.ladder, this.mix.b).lerp(p.focus, this.mix.c);
      v.applyMatrix4(this.cloudMesh.matrixWorld).project(this.camera);
      if (v.z > 1) continue;
      const sx = rect.left + (v.x * 0.5 + 0.5) * rect.width;
      const sy = rect.top + (-v.y * 0.5 + 0.5) * rect.height;
      const d = (sx - clientX) * (sx - clientX) + (sy - clientY) * (sy - clientY);
      if (d < bestD) { bestD = d; best = { point: p, sx, sy }; }
    }
    return best;
  }

  resize() {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    /* Pull the camera back on narrow screens so the whole formation fits a
       phone without cropping the ladder. */
    this.camera.position.z = w < 640 ? 62 : w < 1024 ? 54 : 46;
    this.camera.updateProjectionMatrix();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.mix.a = lerp(this.mix.a, this.target.a, 1 - Math.pow(0.001, dt));
      this.mix.b = lerp(this.mix.b, this.target.b, 1 - Math.pow(0.001, dt));
      this.mix.c = lerp(this.mix.c, this.target.c, 1 - Math.pow(0.001, dt));
      this.pointer.lerp(this.pointerTarget, 1 - Math.pow(0.004, dt));
      this.uniforms.uMixA.value = this.mix.a;
      this.uniforms.uMixB.value = this.mix.b;
      this.uniforms.uMixC.value = this.mix.c;
      this.uniforms.uTime.value += dt;
      /* Breathing stops as the ladder forms: a ranking that wobbles is
         unreadable, a cloud that does not is dead. */
      this.uniforms.uBreath.value = lerp(0.42, 0.05, this.mix.b);
      this.spin += dt * 0.055 * (1 - this.mix.b * 0.85);
      this.offsetX = lerp(this.offsetX, this.offsetTarget, 1 - Math.pow(0.01, dt));
      this.cloudMesh.position.x = this.offsetX;
      this.cloudMesh.rotation.y = this.spin + this.pointer.x * 0.42;
      this.cloudMesh.rotation.x = this.pointer.y * -0.3;
      if (this.path) { this.path.rotation.copy(this.cloudMesh.rotation); this.path.position.x = this.offsetX; }
      this._updatePath();
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() { this.running = false; if (this.raf) cancelAnimationFrame(this.raf); }

  destroy() {
    this.stop();
    try {
      this.geo.dispose();
      this.material.dispose();
      if (this.pathGeo) this.pathGeo.dispose();
      this.renderer.dispose();
    } catch (e) { /* the page is going away anyway */ }
  }
}

function isSupported() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

const api = {
  supported: isSupported,
  create(canvas, models, opts) {
    if (!isSupported()) return null;
    try { return new Constellation(canvas, models, opts); }
    catch (e) { return null; }
  },
  FAMILY_COLOR,
  FORMATIONS,
  MathUtils
};

if (typeof window !== "undefined") window.WhichAIScene = api;
export default api;
