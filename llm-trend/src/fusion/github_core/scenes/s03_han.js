// src/fusion/github_core/scenes/s03_han.js
// 03 · 词向量语义星图 (2013 · Word2Vec Embedding Manifold · Cosmic Semantic Observatory)
// - Deep indigo-violet cosmic observatory (#080c1a, #818cf8, #c084fc, #38bdf8)
// - 3D projected high-dimensional vector clusters, spherical R³ PCA projection rings & nebula dust
// - Iconic geometric vector-arithmetic parallelograms (`King → Queen` // `Man → Woman`, `Code → Logic` // `Spark → Thought`)
//   with minimal crisp monospace coordinates and parallel offset vectors Δv
// - Dynamic alignment: as the Cyber-Rider cycles along the luminous coordinate-axis highway at y = 680,
//   drifting semantic star clusters gravitate and snap into crystalline geometric constellations

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';
import { makePRNG, hashSeed } from '../kit/kit.js';

const TAU = Math.PI * 2;

const COSMOS = {
  voidDeep: '#050813',
  voidBase: '#080c1a',
  indigoNebula: '#1e1b4b',
  indigoBright: '#818cf8',
  violetGlow: '#c084fc',
  cyanStar: '#38bdf8',
  starWhite: '#f1f5f9',
  goldAccent: '#fbbf24',
};

// Two iconic Word2Vec analogy parallelograms in the upper cosmic manifold
const PARALLELOGRAMS = [
  {
    a: { x: 146, y: 242, tag: 'Man', coord: '[-0.41, 0.18]' },
    b: { x: 314, y: 196, tag: 'Woman', coord: '[+0.27, 0.54]' },
    c: { x: 204, y: 148, tag: 'King', coord: '[-0.19, 0.61]' },
    d: { x: 372, y: 102, tag: 'Queen', coord: '[+0.49, 0.97]' },
    primaryCol: '#c084fc',
    offsetCol: '#38bdf8',
  },
  {
    a: { x: 598, y: 248, tag: 'Spark', coord: '[+0.12, -0.35]' },
    b: { x: 766, y: 204, tag: 'Thought', coord: '[+0.78, +0.04]' },
    c: { x: 664, y: 152, tag: 'Code', coord: '[+0.36, +0.42]' },
    d: { x: 832, y: 108, tag: 'Logic', coord: '[+1.02, +0.81]' },
    primaryCol: '#818cf8',
    offsetCol: '#38bdf8',
  },
];

// 5 Interactive Semantic Clusters across x = 90..910, y = 310..595 that crystallize as the rider passes!
const SEMANTIC_CLUSTERS = (() => {
  const rng = makePRNG(hashSeed('word2vec_clusters_2013'));
  const centers = [
    { cx: 138, cy: 408, r: 58, color: '#38bdf8', sides: 5 },
    { cx: 318, cy: 356, r: 64, color: '#818cf8', sides: 6 },
    { cx: 500, cy: 416, r: 70, color: '#c084fc', sides: 6 },
    { cx: 686, cy: 360, r: 62, color: '#38bdf8', sides: 5 },
    { cx: 862, cy: 412, r: 58, color: '#818cf8', sides: 6 },
  ];

  return centers.map((c, idx) => {
    const nodes = [];
    // Central centroid node + crystalline ring vertices
    nodes.push({
      targetX: c.cx,
      targetY: c.cy,
      driftX: (rng() - 0.5) * 44,
      driftY: (rng() - 0.5) * 40,
      phase: rng() * TAU,
      isHub: true,
    });
    for (let k = 0; k < c.sides; k++) {
      const ang = (k / c.sides) * TAU - Math.PI * 0.5 + idx * 0.25;
      nodes.push({
        targetX: c.cx + Math.cos(ang) * c.r,
        targetY: c.cy + Math.sin(ang) * (c.r * 0.78),
        driftX: (rng() - 0.5) * 68,
        driftY: (rng() - 0.5) * 58,
        phase: rng() * TAU,
        isHub: false,
      });
    }
    return { ...c, nodes };
  });
})();

function drawVectorArrow(ctx, x0, y0, x1, y1, color, lineWidth = 1.8, padEnd = 8) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const sx = x0 + ux * 7;
  const sy = y0 + uy * 7;
  const ex = x1 - ux * padEnd;
  const ey = y1 - uy * padEnd;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  const ang = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(ex + ux * 3, ey + uy * 3);
  ctx.lineTo(ex - Math.cos(ang - 0.44) * 7.5, ey - Math.sin(ang - 0.44) * 7.5);
  ctx.lineTo(ex - Math.cos(ang + 0.44) * 7.5, ey - Math.sin(ang + 0.44) * 7.5);
  ctx.closePath();
  ctx.fill();
}

function getBakedEmbeddingCosmos(kit) {
  return kit.bake2D('s03_word2vec_cosmos_v1', (_g, ctx, rng, w, h) => {
    // 1. Deep Cosmic Indigo-Violet Observatory Sky
    const skyG = ctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    skyG.addColorStop(0, '#050711');
    skyG.addColorStop(0.42, '#090e22');
    skyG.addColorStop(0.82, '#131638');
    skyG.addColorStop(1, '#191947');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // High-dimensional latent manifold nebula clouds
    const nebulae = [
      { x: 260, y: 210, r: 290, col: 'rgba(129, 140, 248, 0.14)' },
      { x: 730, y: 195, r: 310, col: 'rgba(192, 132, 252, 0.13)' },
      { x: 500, y: 420, r: 360, col: 'rgba(56, 189, 248, 0.10)' },
    ];
    for (const nb of nebulae) {
      const ng = ctx.createRadialGradient(nb.x, nb.y, 18, nb.x, nb.y, nb.r);
      ng.addColorStop(0, nb.col);
      ng.addColorStop(0.55, 'rgba(30, 27, 75, 0.06)');
      ng.addColorStop(1, 'rgba(8, 12, 26, 0)');
      ctx.fillStyle = ng;
      ctx.fillRect(0, 0, w, ROAD_EDGE_Y);
    }

    // 2. Spherical Observatory Astrolabe & R^300 -> R^3 PCA Projection Rings
    ctx.save();
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.15)';
    ctx.lineWidth = 1.0;
    for (const [rx, ry, tilt] of [
      [430, 235, -0.18],
      [430, 235, 0.18],
      [310, 310, 0],
    ]) {
      ctx.beginPath();
      ctx.ellipse(500, 340, rx, ry, tilt, 0, TAU);
      ctx.stroke();
    }

    // Orthogonal 3D basis axes at observatory origin (500, 340)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.beginPath();
    ctx.moveTo(60, 340);
    ctx.lineTo(940, 340);
    ctx.moveTo(500, 38);
    ctx.lineTo(500, ROAD_EDGE_Y - 10);
    ctx.stroke();
    ctx.restore();

    // 3. Curved 3D Latent Manifold Surface Mesh in Mid-Space (y = 440..665)
    for (let row = 0; row <= 10; row++) {
      const v = row / 10;
      ctx.strokeStyle = `rgba(129, 140, 248, ${(0.07 + v * 0.14).toFixed(3)})`;
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        const u = x / w;
        const wave = Math.sin(u * Math.PI * 3 + v * 1.8) * 18 * (1 - v * 0.6);
        const py = lerp(468, ROAD_EDGE_Y - 6, v) + wave;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }

    // 4. 850+ Background Embedding Token Stars across the Deep Sky
    const starCols = ['#e2e8f0', '#818cf8', '#c084fc', '#38bdf8', '#fde68a'];
    for (let i = 0; i < 860; i++) {
      const sx = rng() * w;
      const sy = rng() * (ROAD_EDGE_Y - 12);
      const sz = rng() < 0.86 ? 0.8 + rng() * 1.1 : 1.8 + rng() * 1.4;
      const al = 0.22 + rng() * 0.68;
      ctx.fillStyle = starCols[i % starCols.length];
      ctx.globalAlpha = al;
      ctx.beginPath();
      ctx.arc(sx, sy, sz, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Observatory Dome Structural Arches framing top corners
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.28)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(500, 560, 595, Math.PI * 1.14, Math.PI * 1.86);
    ctx.stroke();

    // 5. Canonical y = 680 Road: Luminous Latent Coordinate-Axis Highway [0..1000]
    const roadG = ctx.createLinearGradient(0, ROAD_EDGE_Y - 2, 0, ROAD_EDGE_Y + 20);
    roadG.addColorStop(0, '#f8fafc');
    roadG.addColorStop(0.18, '#38bdf8');
    roadG.addColorStop(0.55, '#4f46e5');
    roadG.addColorStop(1, '#090d1e');
    ctx.fillStyle = roadG;
    ctx.fillRect(0, ROAD_EDGE_Y, w, 20);

    // Crisp luminous top coordinate rail at y = 680
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, ROAD_EDGE_Y);
    ctx.lineTo(w, ROAD_EDGE_Y);
    ctx.stroke();

    // Floating-point embedding coordinate ticks along y = 680
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.72)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 12.5) {
      const th = x % 100 === 0 ? 14 : x % 50 === 0 ? 9 : 4.5;
      ctx.moveTo(x, ROAD_EDGE_Y + 1);
      ctx.lineTo(x, ROAD_EDGE_Y + 1 + th);
    }
    ctx.stroke();

    // 6. Sub-Floor (y = 700..1000): Deep-Space Mirror Floor & 300-Dim Dense Embedding Matrix W_embed
    const floorG = ctx.createLinearGradient(0, ROAD_EDGE_Y + 20, 0, h);
    floorG.addColorStop(0, '#0d1229');
    floorG.addColorStop(0.48, '#080c1c');
    floorG.addColorStop(1, '#04060e');
    ctx.fillStyle = floorG;
    ctx.fillRect(0, ROAD_EDGE_Y + 20, w, h - (ROAD_EDGE_Y + 20));

    // Dense 300-Dimensional Continuous Vector Heatmap Strips (W_embed ∈ R^{V×300})
    const stripYs = [726, 762, 798, 834, 870, 906, 942];
    const heatPalette = ['#312e81', '#4f46e5', '#818cf8', '#c084fc', '#38bdf8', '#0ea5e9', '#1e1b4b'];
    for (let r = 0; r < stripYs.length; r++) {
      const sy = stripYs[r];
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(36, sy, w - 72, 20);

      // 92 dense vector float cells per row
      const cellW = (w - 72) / 92;
      for (let c = 0; c < 92; c++) {
        const val = rng();
        ctx.fillStyle = heatPalette[Math.floor(val * heatPalette.length)];
        ctx.globalAlpha = 0.25 + val * 0.62;
        ctx.fillRect(36 + c * cellW + 0.6, sy + 2, cellW - 1.2, 16);
      }
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = 'rgba(129, 140, 248, 0.24)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(36, sy, w - 72, 20);
    }

    ctx.font = '600 11px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = 'rgba(192, 132, 252, 0.78)';
    ctx.textAlign = 'left';
    ctx.fillText('EMBEDDING MATRIX W ∈ ℝ^{V×300} · cos(u, v) = u·v / (‖u‖‖v‖)', 38, 718);
  });
}

export function render(kit, slot, scene, params) {
  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;

  const localT = params?.localT ?? 0;
  const t = params?.t ?? localT;
  const rx = params?.pelicanLocalX ?? 500;
  const pedalAngle = params?.pedalAngle ?? 0;
  const speedScale = params?.speedScale ?? 1.0;
  const hidePelican = Boolean(params?.hidePelican);
  const isOutroThumbnail = Boolean(params?.isOutroThumbnail);
  const beatPulse = params?.sync?.beatPulse ?? Math.pow(Math.max(0, Math.cos((t * Math.PI) / 0.5)), 6) * 0.5;

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Cosmic Embedding Observatory & Dense Vector Sub-Floor
  const bg = getBakedEmbeddingCosmos(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Iconic Geometric Vector Parallelograms (`King - Man + Woman ≈ Queen`, `Code - Spark + Thought ≈ Logic`)
  ctx.save();
  for (let pIdx = 0; pIdx < PARALLELOGRAMS.length; pIdx++) {
    const pg = PARALLELOGRAMS[pIdx];
    const centerPgX = (pg.a.x + pg.d.x) * 0.5;
    const prox = hidePelican ? 0.65 : Math.exp(-Math.pow((rx - centerPgX) / 290, 2));
    const shimmer = 0.55 + 0.45 * Math.sin(t * 2.4 + pIdx * 1.5);

    // Translucent parallelogram plane showing linear subspace equivalence
    ctx.fillStyle = pIdx === 0
      ? `rgba(192, 132, 252, ${(0.07 + prox * 0.11).toFixed(3)})`
      : `rgba(129, 140, 248, ${(0.07 + prox * 0.11).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(pg.a.x, pg.a.y);
    ctx.lineTo(pg.b.x, pg.b.y);
    ctx.lineTo(pg.d.x, pg.d.y);
    ctx.lineTo(pg.c.x, pg.c.y);
    ctx.closePath();
    ctx.fill();

    // Parallel semantic offset arrows: a -> b and c -> d (identical Δv_gender / Δv_abstraction!)
    drawVectorArrow(ctx, pg.a.x, pg.a.y, pg.b.x, pg.b.y, pg.offsetCol, 2.1 + prox * 0.8);
    drawVectorArrow(ctx, pg.c.x, pg.c.y, pg.d.x, pg.d.y, pg.offsetCol, 2.4 + prox * 0.9);

    // Parallel vertical semantic relation arrows: a -> c and b -> d
    drawVectorArrow(ctx, pg.a.x, pg.a.y, pg.c.x, pg.c.y, pg.primaryCol, 1.7);
    drawVectorArrow(ctx, pg.b.x, pg.b.y, pg.d.x, pg.d.y, pg.primaryCol, 1.7);

    // Travelling vector-addition photon along c -> d
    const uFlow = (t * 0.95 + pIdx * 0.5) % 1;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lerp(pg.c.x, pg.d.x, uFlow), lerp(pg.c.y, pg.d.y, uFlow), 3.0 + beatPulse * 1.5, 0, TAU);
    ctx.fill();

    // Crisp vector nodes & minimal monospace labels
    for (const v of [pg.a, pg.b, pg.c, pg.d]) {
      ctx.fillStyle = COSMOS.voidBase;
      ctx.strokeStyle = COSMOS.starWhite;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(v.x, v.y, 5.2 + shimmer * 1.2, 0, TAU);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 11.5px "JetBrains Mono", "SF Mono", monospace';
      ctx.fillStyle = COSMOS.starWhite;
      ctx.textAlign = 'center';
      ctx.fillText(v.tag, v.x, v.y - 12);

      ctx.font = '500 9.5px "JetBrains Mono", "SF Mono", monospace';
      ctx.fillStyle = 'rgba(165, 180, 252, 0.78)';
      ctx.fillText(v.coord, v.x, v.y + 18);
    }
  }
  ctx.restore();

  // 3. Rider-Aligned Semantic Star Clusters (gravitate from drifting point clouds into crystalline constellations!)
  ctx.save();
  for (let cIdx = 0; cIdx < SEMANTIC_CLUSTERS.length; cIdx++) {
    const cl = SEMANTIC_CLUSTERS[cIdx];
    // Cluster crystallizes as rider approaches and stays aligned in rider's wake!
    const dist = Math.abs(rx - cl.cx);
    const wakeHold = !hidePelican && rx > cl.cx ? 0.78 : 0.0;
    const proximity = hidePelican
      ? 0.85
      : Math.max(wakeHold, smoothstep(265, 55, dist));

    const curPts = cl.nodes.map((nd) => {
      const wobbleX = Math.sin(t * 1.9 + nd.phase) * 14 * (1 - proximity);
      const wobbleY = Math.cos(t * 1.6 + nd.phase * 1.3) * 12 * (1 - proximity);
      const x = lerp(nd.targetX + nd.driftX, nd.targetX, proximity) + wobbleX;
      const y = lerp(nd.targetY + nd.driftY, nd.targetY, proximity) + wobbleY;
      return { x, y, isHub: nd.isHub };
    });

    // Luminous Crystalline Constellation Edges
    const hub = curPts[0];
    const rim = curPts.slice(1);
    ctx.strokeStyle = cl.color;
    ctx.globalAlpha = 0.20 + proximity * 0.65;
    ctx.lineWidth = 1.0 + proximity * 1.2;

    ctx.beginPath();
    for (let i = 0; i < rim.length; i++) {
      const p0 = rim[i];
      const p1 = rim[(i + 1) % rim.length];
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.moveTo(hub.x, hub.y);
      ctx.lineTo(p0.x, p0.y);
    }
    ctx.stroke();

    // Cosine-similarity tether beam down to the Cyber-Rider when directly aligned!
    const activeBeam = !hidePelican ? Math.exp(-Math.pow((rx - cl.cx) / 135, 2)) : 0;
    if (activeBeam > 0.12) {
      ctx.strokeStyle = '#38bdf8';
      ctx.globalAlpha = activeBeam * 0.55;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(hub.x, hub.y);
      ctx.lineTo(clamp(rx, 0, PANEL_SIZE), ROAD_EDGE_Y - 195);
      ctx.stroke();
    }

    // Star nodes + 4-point optical glints on crystallized vertices
    ctx.globalAlpha = 1.0;
    for (const pt of curPts) {
      const r = pt.isHub ? 5.2 + beatPulse * 1.6 : 3.4 + proximity * 1.2;
      ctx.fillStyle = pt.isHub ? '#fef08a' : COSMOS.starWhite;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, TAU);
      ctx.fill();

      if (proximity > 0.55) {
        ctx.strokeStyle = cl.color;
        ctx.lineWidth = 1.1;
        const arm = r * 2.3;
        ctx.beginPath();
        ctx.moveTo(pt.x - arm, pt.y);
        ctx.lineTo(pt.x + arm, pt.y);
        ctx.moveTo(pt.x, pt.y - arm);
        ctx.lineTo(pt.x, pt.y + arm);
        ctx.stroke();
      }
    }

    // Mirrored faint constellation reflection below y = 680!
    ctx.globalAlpha = 0.14 + proximity * 0.14;
    ctx.fillStyle = cl.color;
    for (const pt of curPts) {
      const mirY = ROAD_EDGE_Y + 26 + (ROAD_EDGE_Y - pt.y) * 0.42;
      if (mirY < PANEL_SIZE - 16) {
        ctx.beginPath();
        ctx.arc(pt.x, mirY, 2.2, 0, TAU);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;
  }
  ctx.restore();

  // 4. Sub-Floor Active Token Lookup Column Highlight tracking `pelicanLocalX`
  if (!hidePelican && rx >= 36 && rx <= PANEL_SIZE - 36) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.fillStyle = 'rgba(192, 132, 252, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(rx - 8, 724, 16, 240);
    ctx.strokeRect(rx - 8, 724, 16, 240);
    ctx.restore();
  }

  // 5. Cosmic Indigo-Violet & Starlight Cyber-Rider at y = 680
  if (!hidePelican && rx > -260 && rx < PANEL_SIZE + 260) {
    const road = kit.sampleRoad(clamp(rx, 0, PANEL_SIZE), 0);
    const rig = computePelicanRig({
      x: rx,
      y: road.y,
      pedalAngle,
      scale: 1.0,
      slope: road.slope,
      speedScale,
      poseMode: 'normal',
      time: localT,
    });

    // Trailing embedding vector dust particles in slipstream
    ctx.save();
    for (let k = 0; k < 8; k++) {
      const ph = (t * 2.2 + k * 0.125) % 1;
      const sx = rig.rearWheel.x - 12 - ph * 115;
      const sy = ROAD_EDGE_Y - 45 - k * 14 + Math.sin(ph * 8 + k) * 9;
      ctx.fillStyle = k % 2 === 0
        ? `rgba(192, 132, 252, ${((1 - ph) * 0.72).toFixed(2)})`
        : `rgba(56, 189, 248, ${((1 - ph) * 0.72).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 2.4 * (1 - ph * 0.5), 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    drawRig2D(ctx, rig, {
      featherFill: '#e2e8f0',
      featherShade: '#a5b4fc',
      wingTipDark: '#1e1b4b',
      beakFill: '#38bdf8',
      pouchFill: '#c084fc',
      legFill: '#c7d2fe',
      frameStroke: '#818cf8',
      metalStroke: '#6366f1',
      tireStroke: '#090d1a',
      inkOutline: '#050814',
      glowColor: '#c084fc',
      halo: true,
      scanBeam: true,
    });
  }

  // 6. Outro 7x3 Exhibition Wall Thumbnail Caption
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(8, 12, 26, 0.84)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#818cf8';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 4);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene?.num ?? 3).padStart(2, '0')} ${scene?.zh ?? '词向量语义星图'}`, 36, PANEL_SIZE - 46);
  }

  ctx.restore();
}
