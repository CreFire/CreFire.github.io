// src/fusion/github_core/scenes/s08_mughal.js
// 08 · 原生多模态融合 (2024 · Native Multimodal Prism)
// Visual Direction:
// - Optical crystal observatory (#0c0d1e, #ec4899, #8b5cf6, #06b6d4, #fbbf24).
// - Left upper sky streams three distinct input beams — RGB Pixel Tiles, Audio Waveform Ribbons,
//   and Discrete Text Glyphs — converging into a giant rotating Faceted Diamond Tensor Prism at (500, 290),
//   which refracts a unified iridescent spectrum down onto the y = 680 highway.
// - Cyber-Rider gleams with prismatic highlights (`beakFill: '#22d3ee'`, `pouchFill: '#ec4899'`, `frameStroke: '#a855f7'`).

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';
import { makePRNG, hashSeed } from '../kit/kit.js';

const PRISM_X = 500;
const PRISM_Y = 290;

const PAL = {
  obsDeep: '#060712',
  obsSky: '#0c0d1e',
  obsIndigo: '#171538',
  magenta: '#ec4899',
  violet: '#8b5cf6',
  purple: '#a855f7',
  cyan: '#06b6d4',
  cyanBright: '#22d3ee',
  gold: '#fbbf24',
  crystalWhite: '#fdf4ff',
};

const SPECTRUM_BANDS = [
  { col: '#22d3ee', rgba: '34, 211, 238', landX0: 330, landX1: 425 },
  { col: '#06b6d4', rgba: '6, 182, 212', landX0: 415, landX1: 515 },
  { col: '#6366f1', rgba: '99, 102, 241', landX0: 505, landX1: 610 },
  { col: '#8b5cf6', rgba: '139, 92, 246', landX0: 600, landX1: 705 },
  { col: '#a855f7', rgba: '168, 85, 247', landX0: 695, landX1: 805 },
  { col: '#ec4899', rgba: '236, 72, 153', landX0: 795, landX1: 905 },
  { col: '#fbbf24', rgba: '251, 191, 36', landX0: 895, landX1: 995 },
];

const TEXT_GLYPHS = ['∑', '知', 'A', '<v>', '01', '言', 'λ', '{t}', 'Ω', 'π', '词', '∇'];

const RGB_PATCH_SEEDS = (() => {
  const rng = makePRNG(hashSeed('s08_rgb_patches_v1'));
  const arr = [];
  const colors = ['#06b6d4', '#ec4899', '#fbbf24', '#8b5cf6', '#22d3ee', '#34d399'];
  for (let i = 0; i < 20; i++) {
    arr.push({
      phase: i / 20,
      laneOffset: (rng() - 0.5) * 34,
      tilt: (rng() - 0.5) * 0.5,
      c0: colors[(i * 3) % colors.length],
      c1: colors[(i * 3 + 1) % colors.length],
      c2: colors[(i * 3 + 2) % colors.length],
      c3: '#fdf4ff',
    });
  }
  return arr;
})();

function getBakedCrystalObservatory(kit) {
  return kit.bake2D('s08_multimodal_observatory_v1', (_g, bctx, rng, w, h) => {
    // 1. Deep Midnight Optical Observatory Dome
    const skyG = bctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    skyG.addColorStop(0.0, PAL.obsDeep);
    skyG.addColorStop(0.45, PAL.obsSky);
    skyG.addColorStop(0.85, PAL.obsIndigo);
    skyG.addColorStop(1.0, '#1f1644');
    bctx.fillStyle = skyG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y + 2);

    // Central celestial prism core glow
    const coreGlow = bctx.createRadialGradient(PRISM_X, PRISM_Y, 16, PRISM_X, PRISM_Y, 420);
    coreGlow.addColorStop(0.0, 'rgba(253, 244, 255, 0.26)');
    coreGlow.addColorStop(0.28, 'rgba(139, 92, 246, 0.20)');
    coreGlow.addColorStop(0.58, 'rgba(6, 182, 212, 0.10)');
    coreGlow.addColorStop(1.0, 'rgba(12, 13, 30, 0)');
    bctx.fillStyle = coreGlow;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // Precision Observatory Astrolabe Calibration Circles & Degree Ticks around (500, 290)
    bctx.save();
    for (const [rad, alpha, col] of [
      [154, 0.22, PAL.cyan],
      [226, 0.15, PAL.violet],
      [318, 0.11, PAL.magenta],
      [420, 0.08, PAL.gold],
    ]) {
      bctx.strokeStyle = col;
      bctx.globalAlpha = alpha;
      bctx.lineWidth = 1.1;
      bctx.beginPath();
      bctx.arc(PRISM_X, PRISM_Y, rad, 0, Math.PI * 2);
      bctx.stroke();
    }
    bctx.globalAlpha = 0.18;
    bctx.strokeStyle = PAL.crystalWhite;
    bctx.lineWidth = 1;
    for (let deg = 0; deg < 360; deg += 15) {
      const a = (deg * Math.PI) / 180;
      const r0 = deg % 45 === 0 ? 144 : 150;
      const r1 = 158;
      bctx.beginPath();
      bctx.moveTo(PRISM_X + Math.cos(a) * r0, PRISM_Y + Math.sin(a) * r0);
      bctx.lineTo(PRISM_X + Math.cos(a) * r1, PRISM_Y + Math.sin(a) * r1);
      bctx.stroke();
    }
    bctx.restore();

    // Fine crystalline starfield
    for (let i = 0; i < 140; i++) {
      const sx = rng() * w;
      const sy = rng() * (ROAD_EDGE_Y - 30);
      const sr = 0.55 + rng() * 1.4;
      const cPick = i % 4;
      bctx.fillStyle =
        cPick === 0
          ? 'rgba(34, 211, 238, 0.48)'
          : cPick === 1
          ? 'rgba(236, 72, 153, 0.45)'
          : cPick === 2
          ? 'rgba(251, 191, 36, 0.48)'
          : 'rgba(253, 244, 255, 0.52)';
      bctx.beginPath();
      bctx.arc(sx, sy, sr, 0, Math.PI * 2);
      bctx.fill();
    }

    // Left & Right Observatory Crystalline Buttress Arches framing the optical chamber
    bctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
    bctx.fillStyle = 'rgba(10, 10, 26, 0.72)';
    bctx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
      const baseX = side < 0 ? 0 : w;
      bctx.beginPath();
      bctx.moveTo(baseX, 0);
      bctx.lineTo(baseX - side * 88, 0);
      bctx.quadraticCurveTo(baseX - side * 34, 210, baseX - side * 26, ROAD_EDGE_Y);
      bctx.lineTo(baseX, ROAD_EDGE_Y);
      bctx.closePath();
      bctx.fill();
      bctx.stroke();
    }

    // 2. Atmospheric Guide Corridors for the 3 Left-Sky Input Modalities
    const inputBeams = [
      { y0: 72, y1: 112, py0: PRISM_Y - 30, py1: PRISM_Y - 12, c0: 'rgba(6, 182, 212, 0.20)' },
      { y0: 228, y1: 268, py0: PRISM_Y - 10, py1: PRISM_Y + 10, c0: 'rgba(236, 72, 153, 0.20)' },
      { y0: 392, y1: 432, py0: PRISM_Y + 12, py1: PRISM_Y + 30, c0: 'rgba(251, 191, 36, 0.18)' },
    ];
    for (const bm of inputBeams) {
      const bg = bctx.createLinearGradient(0, (bm.y0 + bm.y1) * 0.5, PRISM_X - 48, PRISM_Y);
      bg.addColorStop(0.0, bm.c0);
      bg.addColorStop(1.0, 'rgba(253, 244, 255, 0.32)');
      bctx.fillStyle = bg;
      bctx.beginPath();
      bctx.moveTo(0, bm.y0);
      bctx.lineTo(PRISM_X - 52, bm.py0);
      bctx.lineTo(PRISM_X - 52, bm.py1);
      bctx.lineTo(0, bm.y1);
      bctx.closePath();
      bctx.fill();
    }

    // 3. Refracted Unified Iridescent Spectrum Fan from (500, 290) onto y = 680 Highway!
    for (let i = 0; i < SPECTRUM_BANDS.length; i++) {
      const sb = SPECTRUM_BANDS[i];
      const u = i / (SPECTRUM_BANDS.length - 1);
      const px0 = PRISM_X + 34 + u * 22;
      const py0 = PRISM_Y + 26 - u * 34;

      const rg = bctx.createLinearGradient(px0, py0, (sb.landX0 + sb.landX1) * 0.5, ROAD_EDGE_Y);
      rg.addColorStop(0.0, `rgba(${sb.rgba}, 0.50)`);
      rg.addColorStop(0.55, `rgba(${sb.rgba}, 0.24)`);
      rg.addColorStop(1.0, `rgba(${sb.rgba}, 0.42)`);

      bctx.fillStyle = rg;
      bctx.beginPath();
      bctx.moveTo(px0 - 5, py0 - 4);
      bctx.lineTo(px0 + 6, py0 + 4);
      bctx.lineTo(sb.landX1, ROAD_EDGE_Y);
      bctx.lineTo(sb.landX0, ROAD_EDGE_Y);
      bctx.closePath();
      bctx.fill();
    }

    // 4. Mirror-Polished Crystal Spectrum Highway (y = 680..1000)
    const floorG = bctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
    floorG.addColorStop(0.0, '#191339');
    floorG.addColorStop(0.24, '#110e28');
    floorG.addColorStop(1.0, '#060611');
    bctx.fillStyle = floorG;
    bctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

    // Continuous unified spectral lanes flowing across the ground plane
    for (let i = 0; i < SPECTRUM_BANDS.length; i++) {
      const sb = SPECTRUM_BANDS[i];
      const laneY = ROAD_EDGE_Y + 12 + i * 16;

      // Subtle pre-prism lead-in lane on left, vibrant unified post-prism lane on right
      const lg = bctx.createLinearGradient(0, laneY, w, laneY);
      lg.addColorStop(0.0, `rgba(${sb.rgba}, 0.14)`);
      lg.addColorStop(0.34, `rgba(${sb.rgba}, 0.22)`);
      lg.addColorStop(0.55, `rgba(${sb.rgba}, 0.68)`);
      lg.addColorStop(1.0, `rgba(${sb.rgba}, 0.58)`);

      bctx.strokeStyle = lg;
      bctx.lineWidth = 2.6;
      bctx.beginPath();
      bctx.moveTo(0, laneY);
      bctx.lineTo(w, laneY);
      bctx.stroke();
    }

    // Perspective crystal tile reflections across ground floor
    bctx.strokeStyle = 'rgba(253, 244, 255, 0.06)';
    bctx.lineWidth = 1;
    for (let k = -8; k <= 16; k++) {
      const topX = k * 75;
      const botX = PRISM_X + (topX - PRISM_X) * 2.1;
      bctx.beginPath();
      bctx.moveTo(topX, ROAD_EDGE_Y);
      bctx.lineTo(botX, h);
      bctx.stroke();
    }

    // Crisp iridescent road edge locked at y = 680 from x = 0 to x = 1000
    const edgeG = bctx.createLinearGradient(0, 0, w, 0);
    edgeG.addColorStop(0.0, PAL.cyan);
    edgeG.addColorStop(0.35, PAL.purple);
    edgeG.addColorStop(0.68, PAL.magenta);
    edgeG.addColorStop(1.0, PAL.gold);

    bctx.strokeStyle = 'rgba(168, 85, 247, 0.42)';
    bctx.lineWidth = 7;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y + 1);
    bctx.lineTo(w, ROAD_EDGE_Y + 1);
    bctx.stroke();

    bctx.strokeStyle = edgeG;
    bctx.lineWidth = 2.8;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y);
    bctx.lineTo(w, ROAD_EDGE_Y);
    bctx.stroke();
  }, PANEL_SIZE, PANEL_SIZE);
}

function drawStreamingModalities(ctx, t) {
  ctx.save();
  const targetX = PRISM_X - 46;

  // --- Stream 1: RGB Pixel Tiles (`VISION`, (0, 92) -> (targetX, PRISM_Y - 20)) ---
  for (let i = 0; i < RGB_PATCH_SEEDS.length; i++) {
    const p = RGB_PATCH_SEEDS[i];
    const u = (p.phase + t * 0.28) % 1.0;
    const envelope = Math.sin(Math.PI * Math.min(1, u * 1.08));
    const bx = lerp(-20, targetX, u);
    const by = lerp(92, PRISM_Y - 20, u) + p.laneOffset * (1 - u * 0.82);
    const sz = lerp(18, 7.5, u * u);

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(p.tilt + t * 0.8 * (i % 2 === 0 ? 1 : -1));
    ctx.transform(1, 0.18, -0.24, 0.88, 0, 0);
    ctx.globalAlpha = 0.35 + 0.62 * envelope;

    const hs = sz * 0.5;
    ctx.fillStyle = p.c0;
    ctx.fillRect(-hs, -hs, hs, hs);
    ctx.fillStyle = p.c1;
    ctx.fillRect(0, -hs, hs, hs);
    ctx.fillStyle = p.c2;
    ctx.fillRect(-hs, 0, hs, hs);
    ctx.fillStyle = p.c3;
    ctx.fillRect(0, 0, hs, hs);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(-hs, -hs, sz, sz);
    ctx.restore();
  }

  // --- Stream 2: Audio Waveform Ribbons (`AUDIO`, (0, 248) -> (targetX - 4, PRISM_Y)) ---
  const steps = 48;
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass === 0 ? PAL.magenta : PAL.purple;
    ctx.lineWidth = pass === 0 ? 2.6 : 1.8;
    ctx.beginPath();
    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      const wx = lerp(0, targetX - 4, u);
      const baseWy = lerp(248, PRISM_Y, u);
      const amp = (1 - u * 0.78) * (pass === 0 ? 18 : 12);
      const wave =
        Math.sin(u * 26 - t * 9.5 + pass * 1.6) * amp * (0.65 + 0.35 * Math.cos(u * 9 - t * 4));
      if (s === 0) ctx.moveTo(wx, baseWy + wave);
      else ctx.lineTo(wx, baseWy + wave);
    }
    ctx.stroke();
  }

  // Mel-spectrogram vertical harmonic bars along audio beam
  for (let b = 0; b < 18; b++) {
    const u = ((b + 0.5) / 18 + t * 0.24) % 1.0;
    const bx = lerp(8, targetX - 10, u);
    const by = lerp(248, PRISM_Y, u);
    const barH = (6 + 15 * Math.abs(Math.sin(t * 7 + b * 1.3))) * (1 - u * 0.72);
    ctx.strokeStyle = b % 2 === 0 ? 'rgba(236, 72, 153, 0.72)' : 'rgba(34, 211, 238, 0.65)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(bx, by - barH);
    ctx.lineTo(bx, by + barH);
    ctx.stroke();
  }

  // --- Stream 3: Discrete Text Glyphs (`TEXT`, (0, 412) -> (targetX, PRISM_Y + 20)) ---
  ctx.font = '700 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < TEXT_GLYPHS.length; i++) {
    const u = (i / TEXT_GLYPHS.length + t * 0.22) % 1.0;
    const bx = lerp(-15, targetX, u);
    const laneShift = ((i % 3) - 1) * 12 * (1 - u * 0.85);
    const by = lerp(412, PRISM_Y + 20, u) + laneShift;
    const sc = lerp(1.05, 0.58, u);
    const alpha = clamp(Math.sin(Math.PI * Math.min(1, u * 1.06)) * 1.15, 0.15, 0.95);

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(sc, sc);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(15, 16, 36, 0.86)';
    ctx.strokeStyle = i % 2 === 0 ? PAL.gold : PAL.cyanBright;
    ctx.lineWidth = 1.3;
    ctx.fillRect(-14, -9, 28, 18);
    ctx.strokeRect(-14, -9, 28, 18);
    ctx.fillStyle = i % 2 === 0 ? '#fef3c7' : '#cffafe';
    ctx.fillText(TEXT_GLYPHS[i], 0, 0.5);
    ctx.restore();
  }

  ctx.restore();
}

function drawRotatingDiamondPrism(ctx, t, beatPulse) {
  ctx.save();
  ctx.translate(PRISM_X, PRISM_Y);

  const rotY = t * 0.82;
  const pitch = 0.22 + Math.sin(t * 1.4) * 0.05;
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const pulseScale = 1.0 + beatPulse * 0.035;

  const project3D = (x, y, z) => {
    const xr = x * Math.cos(rotY) + z * Math.sin(rotY);
    const zr = -x * Math.sin(rotY) + z * Math.cos(rotY);
    const yp = y * cosP - zr * sinP;
    const zp = y * sinP + zr * cosP;
    const persp = 460 / (460 - zp);
    return {
      x: xr * persp * pulseScale,
      y: yp * persp * pulseScale,
      z: zp,
    };
  };

  // Outer rotating astrolabe gimbal ring around the prism
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.48)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 122, 34, Math.sin(t * 0.6) * 0.22 - 0.18, 0, Math.PI * 2);
  ctx.stroke();

  // Construct 3D Faceted Diamond Bipyramid vertices (N = 8 sides)
  const N = 8;
  const topApex = project3D(0, -108, 0);
  const botApex = project3D(0, 114, 0);
  const crown = [];
  const girdle = [];
  const pavilion = [];

  for (let i = 0; i < N; i++) {
    const a0 = (i * Math.PI * 2) / N;
    const aHalf = ((i + 0.5) * Math.PI * 2) / N;
    crown.push(project3D(Math.cos(a0) * 54, -58, Math.sin(a0) * 54));
    girdle.push(project3D(Math.cos(aHalf) * 96, -4, Math.sin(aHalf) * 96));
    pavilion.push(project3D(Math.cos(a0) * 52, 54, Math.sin(a0) * 52));
  }

  const faces = [];
  const addFace = (pts, tier) => {
    const zAvg = pts.reduce((s, p) => s + p.z, 0) / pts.length;
    // Screen-space cross product for front/back & normal tint
    const ux = pts[1].x - pts[0].x;
    const uy = pts[1].y - pts[0].y;
    const vx = pts[2].x - pts[0].x;
    const vy = pts[2].y - pts[0].y;
    const cross = ux * vy - uy * vx;
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    faces.push({ pts, zAvg, cross, cx, tier });
  };

  for (let i = 0; i < N; i++) {
    const ni = (i + 1) % N;
    addFace([topApex, crown[ni], crown[i]], 0);
    addFace([crown[i], crown[ni], girdle[i]], 1);
    addFace([girdle[i], crown[ni], girdle[ni]], 1);
    addFace([girdle[i], girdle[ni], pavilion[ni]], 2);
    addFace([girdle[i], pavilion[ni], pavilion[i]], 2);
    addFace([pavilion[i], pavilion[ni], botApex], 3);
  }

  // Sort back-to-front so internal crystal refraction shows cleanly through front facets
  faces.sort((a, b) => a.zAvg - b.zAvg);

  // Draw back facets -> glowing unified tensor core -> front facets
  const drawFacet = (f, isFront) => {
    const hueBias = clamp((f.cx + 85) / 170, 0, 1);
    let fillCol;
    if (hueBias < 0.33) {
      fillCol = isFront ? 'rgba(6, 182, 212, 0.26)' : 'rgba(6, 182, 212, 0.12)';
    } else if (hueBias < 0.66) {
      fillCol = isFront ? 'rgba(139, 92, 246, 0.28)' : 'rgba(139, 92, 246, 0.13)';
    } else {
      fillCol = isFront ? 'rgba(236, 72, 153, 0.26)' : 'rgba(251, 191, 36, 0.14)';
    }

    ctx.beginPath();
    ctx.moveTo(f.pts[0].x, f.pts[0].y);
    for (let k = 1; k < f.pts.length; k++) {
      ctx.lineTo(f.pts[k].x, f.pts[k].y);
    }
    ctx.closePath();
    ctx.fillStyle = fillCol;
    ctx.fill();

    // Specular flash on facets catching direct modality light
    if (isFront && f.cross > 650 && f.tier <= 2) {
      ctx.fillStyle = 'rgba(253, 244, 255, 0.22)';
      ctx.fill();
    }

    ctx.strokeStyle = isFront
      ? 'rgba(253, 244, 255, 0.78)'
      : 'rgba(168, 85, 247, 0.30)';
    ctx.lineWidth = isFront ? 1.35 : 0.8;
    ctx.stroke();
  };

  for (const f of faces) {
    if (f.zAvg < 0) drawFacet(f, false);
  }

  // Blazing Unified Multimodal Tensor Core inside the crystal heart
  const coreR = 38 + beatPulse * 8;
  const cg = ctx.createRadialGradient(0, 0, 2, 0, 0, coreR * 1.6);
  cg.addColorStop(0.0, '#ffffff');
  cg.addColorStop(0.28, 'rgba(34, 211, 238, 0.85)');
  cg.addColorStop(0.58, 'rgba(236, 72, 153, 0.52)');
  cg.addColorStop(1.0, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(0, 0, coreR * 1.6, 0, Math.PI * 2);
  ctx.fill();

  for (const f of faces) {
    if (f.zAvg >= 0) drawFacet(f, true);
  }

  // Incident fusion hotspot at (-46, 0) & exit dispersion hotspot at (+46, +12)
  for (const [hx, hy, col] of [
    [-48, 0, 'rgba(34, 211, 238, 0.85)'],
    [48, 10, 'rgba(251, 191, 36, 0.88)'],
  ]) {
    const hg = ctx.createRadialGradient(hx, hy, 1, hx, hy, 22);
    hg.addColorStop(0.0, '#ffffff');
    hg.addColorStop(0.4, col);
    hg.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(hx, hy, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawDynamicRefractedPulses(ctx, t, rx) {
  ctx.save();
  // Unified latent packets gliding down the 7 refracted rainbow beams onto y = 680 and racing forward!
  for (let i = 0; i < SPECTRUM_BANDS.length; i++) {
    const sb = SPECTRUM_BANDS[i];
    const uIdx = i / (SPECTRUM_BANDS.length - 1);
    const sx0 = PRISM_X + 34 + uIdx * 22;
    const sy0 = PRISM_Y + 26 - uIdx * 34;
    const landX = (sb.landX0 + sb.landX1) * 0.5;

    // Crisp shimmering laser edge along each dispersion ray
    const pulseA = 0.26 + 0.22 * Math.sin(t * 5.2 + i * 0.85);
    ctx.strokeStyle = `rgba(${sb.rgba}, ${pulseA.toFixed(2)})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(landX, ROAD_EDGE_Y);
    ctx.stroke();

    // Travelling unified embedding diamond packet along ray
    const pU = (t * 0.55 + i * 0.14) % 1.0;
    const px = lerp(sx0, landX, pU);
    const py = lerp(sy0, ROAD_EDGE_Y, pU);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = sb.col;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px, py - 4.5);
    ctx.lineTo(px + 4.5, py);
    ctx.lineTo(px, py + 4.5);
    ctx.lineTo(px - 4.5, py);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Prismatic floor caustic halo tracking Cyber-Rider along y = 680
  if (rx > -100 && rx < PANEL_SIZE + 100) {
    const cg = ctx.createRadialGradient(rx, ROAD_EDGE_Y + 4, 6, rx, ROAD_EDGE_Y + 4, 138);
    cg.addColorStop(0.0, 'rgba(34, 211, 238, 0.36)');
    cg.addColorStop(0.42, 'rgba(236, 72, 153, 0.24)');
    cg.addColorStop(0.75, 'rgba(168, 85, 247, 0.14)');
    cg.addColorStop(1.0, 'rgba(12, 13, 30, 0)');
    ctx.fillStyle = cg;
    ctx.fillRect(rx - 145, ROAD_EDGE_Y - 24, 290, 95);
  }
  ctx.restore();
}

export function render(kit, slot, scene, params) {
  const {
    t = 0,
    pelicanLocalX = 500,
    pedalAngle = 0,
    speedScale = 1.0,
    hidePelican = false,
    isOutroThumbnail = false,
    sync = null,
  } = params || {};

  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Static Baked Optical Crystal Observatory & Unified Spectrum Boulevard
  const bg = getBakedCrystalObservatory(kit);
  if (bg && bg.canvas) {
    ctx.drawImage(bg.canvas, 0, 0);
  }

  const rx = pelicanLocalX;
  const beatPulse = clamp(sync?.pulse ?? (1 - ((t * 2) % 1)), 0, 1);

  // 2. Three Streaming Input Modality Beams (RGB Patches, Audio Waveforms, Discrete Text Glyphs)
  drawStreamingModalities(ctx, t);

  // 3. Refracted Rainbow Caustics & Unified Token Packets
  drawDynamicRefractedPulses(ctx, t, isOutroThumbnail ? 640 : rx);

  // 4. Giant Rotating 3D Faceted Diamond Tensor Prism at (500, 290)
  drawRotatingDiamondPrism(ctx, t, beatPulse);

  // 5. Prismatic Cyber-Rider (`硅基领航员 Agent-01`)
  if (!hidePelican && rx >= -260 && rx <= 1260) {
    // Iridescent tri-band speed ribbon trailing rear wheel
    const trailColors = [PAL.cyanBright, PAL.purple, PAL.magenta];
    for (let k = 0; k < 3; k++) {
      const tx0 = clamp(rx - 210 + k * 14, 0, PANEL_SIZE);
      const tx1 = clamp(rx - 52, 0, PANEL_SIZE);
      if (tx1 > tx0) {
        const tg = ctx.createLinearGradient(tx0, 0, tx1, 0);
        tg.addColorStop(0.0, 'rgba(0,0,0,0)');
        tg.addColorStop(1.0, trailColors[k]);
        ctx.strokeStyle = tg;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(tx0, ROAD_EDGE_Y - 12 - k * 5);
        ctx.lineTo(tx1, ROAD_EDGE_Y - 12 - k * 5);
        ctx.stroke();
      }
    }

    const rig = computePelicanRig({
      x: rx,
      y: ROAD_EDGE_Y,
      slope: 0,
      pedalAngle,
      speedScale: speedScale + beatPulse * 0.04,
      time: t,
    });
    drawRig2D(ctx, rig, {
      featherFill: '#fdf4ff',
      featherShade: '#e9d5ff',
      wingTipDark: '#2e1065',
      beakFill: '#22d3ee',
      pouchFill: '#ec4899',
      legFill: '#f5d0fe',
      frameStroke: '#a855f7',
      metalStroke: '#67e8f9',
      tireStroke: '#170d2e',
      inkOutline: '#090617',
      glowColor: '#22d3ee',
      halo: true,
      scanBeam: false,
    });
  }

  // 6. Optional Outro Thumbnail Title Bar
  if (isOutroThumbnail && scene) {
    ctx.fillStyle = 'rgba(8, 9, 22, 0.84)';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 92);
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.60)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 92);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 92);
    ctx.stroke();
    ctx.fillStyle = '#fdf4ff';
    ctx.font = '700 42px system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} · ${scene.zh}`, 34, PANEL_SIZE - 46);
  }

  ctx.restore();
}
