// src/fusion/github_core/scenes/s20_code.js
// Scene 20 · 自我演进与通用智能黎明 (AGI Horizon · Fourier Epicycles + Live Code Studio)
// Grand Finale & Seamless Match-Cut into the 7x3 Outro Museum Exhibition Wall:
// - Deep Nano-OLED optical workbench (#050810 -> #12223a radial glow) matching `renderer.js`'s
//   `getPostCodeExtension` perspective floor below y = 680 with glowing #60a5fa horizon at y = 680
// - Frosted-glass Self-Evolving AGI Studio Window (`20 · 自我演进与通用智能 — AGI Horizon · Pure Code Synthesis`)
//   displaying live 16-bar harmonic spectrum `|c_k|` + streaming self-improving neural equations & WGSL/SVG code
// - 3-Act Climax on the Cyber-Rider:
//   * Act I (`localT < 2.1s`): Cached 32-harmonic Complex DFT (`Σ c_k e^{ikθ}`) Fourier Epicycle circles live-tracing the rider
//   * Act II (`2.1s..4.4s`): Crystallizes into a faceted holographic mesh + solid iridescent white-gold & cyan Cyber-Rider
//   * Act III (`4.4s..6.0s` & `isOutroThumbnail`): 100% solid radiant AGI Cyber-Rider (zero exit fade!)
//     surrounded by 3 delicate golden-cyan harmonic orbital rings & stargate light pillars!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  BEAT_SEC,
  clamp,
  lerp,
  smoothstep,
  smootherstep,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';
import { makePRNG, hashSeed } from '../kit/kit.js';

const FOURIER_HARMONICS = 32;
const RECON_SAMPLES = 288;
let _cyberFourierCache = null;

function ignNoise(x, y) {
  const v = 52.9829189 * ((0.06711056 * x + 0.00583715 * y) % 1);
  return v - Math.floor(v);
}

function sampleSeg(a, b, n, out) {
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    out.push({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
  }
}

function sampleQuad(p0, p1, p2, n, out) {
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    out.push({
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    });
  }
}

function sampleCubic(p0, p1, p2, p3, n, out) {
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    out.push({
      x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
      y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
    });
  }
}

/**
 * Computes and caches a 32-harmonic Complex DFT (`Σ c_k · e^{i k θ}`) around the closed
 * silhouette contour of the AI Cyber-Rider + Tensor Light-Cycle (`computePelicanRig` at `(0,0)`).
 */
function getCyberRiderFourierDFT() {
  if (_cyberFourierCache) return _cyberFourierCache;

  const ref = computePelicanRig({ x: 0, y: 0, pedalAngle: 0.75, speedScale: 0.25, time: 0 });
  const hx = ref.head.x;
  const hy = ref.head.y;
  const hr = ref.head.r;

  const raw = [];
  const pHelmetBack = { x: hx - hr * 0.85, y: hy - hr * 0.35 };
  const pAnt1 = { x: ref.crest1.x, y: ref.crest1.y };
  const pCrown = { x: hx + hr * 0.2, y: hy - hr };
  const pVisorTip = { x: ref.beakTip.x, y: ref.beakTip.y };
  const pChin = { x: hx + 4, y: hy + hr * 0.85 };
  const pChest = { x: ref.chest.x + 12, y: ref.chest.y };
  const pGrip = { x: ref.handleGrip.x + 4, y: ref.handleGrip.y };
  const pHeadTube = { x: ref.headTop.x + 4, y: ref.headTop.y };
  const pFrontHub = { x: ref.frontWheel.x + ref.frontWheel.r * 0.7, y: ref.frontWheel.y };
  const pFrontTireBot = { x: ref.frontWheel.x, y: ref.frontWheel.y + ref.frontWheel.r };
  const pBB = { x: ref.bb.x, y: ref.bb.y + 10 };
  const pRearTireBot = { x: ref.rearWheel.x, y: ref.rearWheel.y + ref.rearWheel.r };
  const pRearTireBack = { x: ref.rearWheel.x - ref.rearWheel.r * 0.85, y: ref.rearWheel.y };
  const pSeat = { x: ref.seatCluster.x - 6, y: ref.seatCluster.y };
  const pHip = { x: ref.hip.x - 10, y: ref.hip.y };
  const pScarfTip = { x: ref.tailTip.x, y: ref.tailTip.y };
  const pShoulderBack = { x: ref.scarfAnchor.x, y: ref.scarfAnchor.y - 4 };

  sampleSeg(pHelmetBack, pAnt1, 6, raw);
  sampleQuad(pAnt1, { x: hx - 4, y: hy - hr * 1.35 }, pCrown, 8, raw);
  sampleQuad(pCrown, { x: hx + hr * 1.15, y: hy - hr * 0.5 }, pVisorTip, 10, raw);
  sampleQuad(pVisorTip, { x: hx + hr * 0.9, y: hy + hr * 0.55 }, pChin, 8, raw);
  sampleSeg(pChin, pChest, 10, raw);
  sampleQuad(pChest, ref.wingElbow, pGrip, 12, raw);
  sampleSeg(pGrip, pHeadTube, 8, raw);
  sampleQuad(pHeadTube, { x: ref.frontWheel.x + 18, y: ref.frontWheel.y - 38 }, pFrontHub, 14, raw);
  sampleQuad(pFrontHub, { x: ref.frontWheel.x + ref.frontWheel.r, y: ref.frontWheel.y + 34 }, pFrontTireBot, 12, raw);
  sampleQuad(pFrontTireBot, { x: ref.frontWheel.x - 36, y: ref.frontWheel.y + 18 }, pBB, 14, raw);
  sampleQuad(pBB, { x: ref.rearWheel.x + 36, y: ref.rearWheel.y + 24 }, pRearTireBot, 14, raw);
  sampleQuad(pRearTireBot, { x: ref.rearWheel.x - ref.rearWheel.r, y: ref.rearWheel.y + 32 }, pRearTireBack, 12, raw);
  sampleQuad(pRearTireBack, { x: ref.rearWheel.x - 12, y: ref.rearWheel.y - 42 }, pSeat, 14, raw);
  sampleSeg(pSeat, pHip, 8, raw);
  sampleCubic(pHip, ref.scarfCtrl2, ref.scarfCtrl1, pScarfTip, 18, raw);
  sampleCubic(pScarfTip, ref.scarfCtrl2, ref.scarfCtrl1, pShoulderBack, 18, raw);
  sampleSeg(pShoulderBack, pHelmetBack, 10, raw);

  // Uniform arc-length resampling to M = 256 equidistant points
  const M = 256;
  const cum = [0];
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    const b = raw[(i + 1) % raw.length];
    cum.push(cum[i] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const totalLen = cum[cum.length - 1];
  const pts = [];
  let seg = 0;
  for (let m = 0; m < M; m++) {
    const target = (m / M) * totalLen;
    while (seg < raw.length - 1 && cum[seg + 1] < target) seg++;
    const a = raw[seg];
    const b = raw[(seg + 1) % raw.length];
    const u = (target - cum[seg]) / Math.max(1e-6, cum[seg + 1] - cum[seg]);
    pts.push({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
  }

  let c0x = 0;
  let c0y = 0;
  for (let m = 0; m < M; m++) {
    c0x += pts[m].x / M;
    c0y += pts[m].y / M;
  }

  const allTerms = [];
  const K_MAX = 48;
  for (let k = -K_MAX; k <= K_MAX; k++) {
    if (k === 0) continue;
    let re = 0;
    let im = 0;
    for (let m = 0; m < M; m++) {
      const ang = (-2 * Math.PI * k * m) / M;
      const dx = pts[m].x - c0x;
      const dy = pts[m].y - c0y;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      re += (dx * ca - dy * sa) / M;
      im += (dx * sa + dy * ca) / M;
    }
    const amp = Math.hypot(re, im);
    allTerms.push({ k, re, im, amp, phase: Math.atan2(im, re) });
  }

  allTerms.sort((a, b) => b.amp - a.amp);
  const terms = allTerms.slice(0, FOURIER_HARMONICS);

  const recon = new Array(RECON_SAMPLES);
  for (let j = 0; j < RECON_SAMPLES; j++) {
    const th = (j / RECON_SAMPLES) * Math.PI * 2;
    let rx = c0x;
    let ry = c0y;
    for (let ti = 0; ti < terms.length; ti++) {
      const t = terms[ti];
      const a = t.k * th + t.phase;
      rx += t.amp * Math.cos(a);
      ry += t.amp * Math.sin(a);
    }
    recon[j] = { x: rx, y: ry };
  }

  _cyberFourierCache = { c0x, c0y, terms, recon, maxAmp: terms[0].amp };
  return _cyberFourierCache;
}

/**
 * Bakes the Deep Nano-OLED Optical Workbench (`#050810` -> `#12223a` radial glow),
 * matching `renderer.js`'s `getPostCodeExtension` perspective floor & `#60a5fa` horizon at `y = 680`!
 */
function getAGIWorkbenchBackdrop(kit) {
  return kit.bake2D(
    's20_agi_oled_workbench_v1',
    (_g, ctx, _rng, w, h) => {
      // 1. Pixel-level anti-banding blue-noise dithered Nano-OLED radial glow (#050810 -> #12223a)
      const img = ctx.createImageData(w, h);
      const data = img.data;
      const fx = 660;
      const fy = 468;

      for (let y = 0; y < h; y++) {
        const isFloor = y >= ROAD_EDGE_Y;
        const floorV = isFloor ? (y - ROAD_EDGE_Y) / (h - ROAD_EDGE_Y) : 0;
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const distF = Math.hypot((x - fx) * 0.9, y - fy);
          const distC = Math.hypot(x - 500, y - 500);
          const glow = Math.exp(-(distF * distF) / (2 * 330 * 330));
          const vig = 1 - 0.28 * Math.pow(distC / 720, 2.0);
          const dither = (ignNoise(x, y) - 0.5) * 4.2;

          let r = (5 + glow * 13) * vig + dither;
          let g = (8 + glow * 26) * vig + dither;
          let b = (16 + glow * 42) * vig + dither * 1.1;

          if (isFloor) {
            const rim = Math.exp(-floorV * 12) * 16;
            r = r * lerp(0.9, 0.54, floorV) + rim * 0.35;
            g = g * lerp(0.94, 0.56, floorV) + rim * 0.82;
            b = b * lerp(1.0, 0.64, floorV) + rim * 1.32;
          }

          data[idx] = clamp(r, 0, 255) | 0;
          data[idx + 1] = clamp(g, 0, 255) | 0;
          data[idx + 2] = clamp(b, 0, 255) | 0;
          data[idx + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);

      // 2. Precision Optical Grid & Sacred Euler-Fibonacci Harmonic Astrolabe above y = 680
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, ROAD_EDGE_Y);
      ctx.clip();

      ctx.strokeStyle = 'rgba(88, 166, 255, 0.032)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let v = 20; v < w; v += 20) {
        if (v % 100 === 0) continue;
        ctx.moveTo(v, 0);
        ctx.lineTo(v, ROAD_EDGE_Y);
        if (v < ROAD_EDGE_Y) {
          ctx.moveTo(0, v);
          ctx.lineTo(w, v);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(125, 211, 252, 0.085)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let v = 100; v < w; v += 100) {
        ctx.moveTo(v, 0);
        ctx.lineTo(v, ROAD_EDGE_Y);
        if (v < ROAD_EDGE_Y) {
          ctx.moveTo(0, v);
          ctx.lineTo(w, v);
        }
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(126, 231, 135, 0.22)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let gx = 100; gx <= 900; gx += 100) {
        for (let gy = 100; gy <= 600; gy += 100) {
          ctx.moveTo(gx - 3, gy);
          ctx.lineTo(gx + 3, gy);
          ctx.moveTo(gx, gy - 3);
          ctx.lineTo(gx, gy + 3);
        }
      }
      ctx.stroke();

      // Harmonic Orbit Rings & Golden Spiral (`cx = 690, cy = 468`) matching `getPostCodeExtension`
      const cx = 690;
      const cy = 468;
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.14)';
      ctx.setLineDash([5, 6]);
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.arc(cx, cy, 256, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(192, 132, 252, 0.14)';
      ctx.beginPath();
      ctx.arc(cx, cy, 256 / 1.6180339, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fibonacci Golden Rectangle & Spiral (`x = 400..948, y = 228..567`)
      let rx = 400;
      let ry = 228;
      let rw = 548;
      let rh = 338.7;
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.13)';
      ctx.lineWidth = 0.85;
      ctx.strokeRect(rx, ry, rw, rh);

      const arcs = [];
      for (let s = 0; s < 7; s++) {
        const dir = s % 4;
        if (dir === 0) {
          ctx.strokeRect(rx, ry, rh, rh);
          arcs.push({ ax: rx + rh, ay: ry + rh, r: rh, a0: Math.PI, a1: Math.PI * 1.5 });
          rx += rh;
          rw -= rh;
        } else if (dir === 1) {
          ctx.strokeRect(rx, ry, rw, rw);
          arcs.push({ ax: rx, ay: ry + rw, r: rw, a0: Math.PI * 1.5, a1: Math.PI * 2 });
          ry += rw;
          rh -= rw;
        } else if (dir === 2) {
          ctx.strokeRect(rx + rw - rh, ry, rh, rh);
          arcs.push({ ax: rx + rw - rh, ay: ry, r: rh, a0: 0, a1: Math.PI * 0.5 });
          rw -= rh;
        } else {
          ctx.strokeRect(rx, ry + rh - rw, rw, rw);
          arcs.push({ ax: rx + rw, ay: ry + rh - rw, r: rw, a0: Math.PI * 0.5, a1: Math.PI });
          rh -= rw;
        }
      }

      const spG = ctx.createLinearGradient(400, 228, 948, 567);
      spG.addColorStop(0.0, 'rgba(96, 165, 250, 0.45)');
      spG.addColorStop(0.5, 'rgba(192, 132, 252, 0.52)');
      spG.addColorStop(1.0, 'rgba(251, 191, 36, 0.62)');
      ctx.strokeStyle = spG;
      ctx.lineWidth = 1.45;
      ctx.beginPath();
      for (const a of arcs) ctx.arc(a.ax, a.ay, Math.max(1, a.r), a.a0, a.a1);
      ctx.stroke();

      ctx.fillStyle = 'rgba(251, 191, 36, 0.72)';
      ctx.font = '500 10.5px "PelicanMono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('φ = 1.6180339887 · RECURSIVE AGI CONVERGENCE', 948, 212);
      ctx.restore();

      // 3. Perspective Obsidian Floor Grid below y = 680 (1:1 match with `getPostCodeExtension`!)
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.055)';
      ctx.lineWidth = 0.85;
      for (let i = -8; i <= 8; i += 1) {
        ctx.beginPath();
        ctx.moveTo(500 + i * 65, ROAD_EDGE_Y);
        ctx.lineTo(500 + i * 158, h);
        ctx.stroke();
      }
      for (const fyLine of [720, 772, 838, 916]) {
        ctx.beginPath();
        ctx.moveTo(0, fyLine);
        ctx.lineTo(w, fyLine);
        ctx.stroke();
      }

      // 20px Vernier Ticks along y = 680
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.36)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        ctx.moveTo(x, ROAD_EDGE_Y);
        ctx.lineTo(x, ROAD_EDGE_Y + (x % 100 === 0 ? 9 : 4.5));
      }
      ctx.stroke();

      // Exact Glowing `#60a5fa` Horizon Line at y = ROAD_EDGE_Y (`680`)!
      ctx.save();
      ctx.strokeStyle = '#60a5fa';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, ROAD_EDGE_Y);
      ctx.lineTo(w, ROAD_EDGE_Y);
      ctx.stroke();
      ctx.restore();
    },
    PANEL_SIZE,
    PANEL_SIZE
  );
}

/**
 * Draws the Frosted-Glass Self-Evolving AGI Studio Window at `(32, 32)`:
 * `20 · 自我演进与通用智能 — AGI Horizon · Pure Code Synthesis`
 * with live 16-bar `|c_k|` harmonic spectrum + streaming self-improving neural architecture equations & WGSL/SVG code!
 */
function drawSelfEvolvingAGIStudio(ctx, rig, localT, theta, isOutroThumbnail) {
  const ex = 32;
  const ey = 32;
  const ew = 532;
  const eh = 336;
  const dft = getCyberRiderFourierDFT();

  ctx.save();
  // Frosted dark OLED glass panel
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = 'rgba(9, 14, 26, 0.74)';
  ctx.beginPath();
  ctx.roundRect(ex, ey, ew, eh, 12);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = 'rgba(147, 197, 253, 0.24)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.roundRect(ex, ey, ew, eh, 12);
  ctx.stroke();

  // Top Iridescent Specular Hairline
  const topG = ctx.createLinearGradient(ex, ey, ex + ew, ey);
  topG.addColorStop(0.0, '#60a5fa');
  topG.addColorStop(0.5, '#c084fc');
  topG.addColorStop(1.0, '#fbbf24');
  ctx.strokeStyle = topG;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(ex + 12, ey + 1);
  ctx.lineTo(ex + ew - 12, ey + 1);
  ctx.stroke();

  // Window Chrome Title Bar (`20 · 自我演进与通用智能 — AGI Horizon · Pure Code Synthesis`)
  ctx.fillStyle = 'rgba(17, 25, 44, 0.76)';
  ctx.beginPath();
  ctx.roundRect(ex + 1, ey + 1, ew - 2, 36, [11, 11, 0, 0]);
  ctx.fill();

  const winDots = ['#f87171', '#fbbf24', '#4ade80'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = winDots[i];
    ctx.beginPath();
    ctx.arc(ex + 16 + i * 13, ey + 19, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = '700 13.5px "PelicanMono", monospace';
  ctx.fillStyle = '#60a5fa';
  ctx.fillText('20 ·', ex + 56, ey + 19.5);

  ctx.font = '700 15.5px "PelicanSans", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('自我演进与通用智能', ex + 90, ey + 19);

  ctx.font = '500 11px "PelicanMono", monospace';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('— AGI Horizon · Pure Code Synthesis', ex + 242, ey + 19.5);

  // Active Tab Bar
  ctx.fillStyle = 'rgba(7, 11, 20, 0.56)';
  ctx.fillRect(ex + 1, ey + 37, ew - 2, 24);
  ctx.fillStyle = 'rgba(30, 41, 69, 0.78)';
  ctx.beginPath();
  ctx.roundRect(ex + 10, ey + 39, 214, 22, [6, 6, 0, 0]);
  ctx.fill();

  ctx.font = '600 11px "PelicanMono", monospace';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('◇ agi_horizon_20.wgsl.svg  ×', ex + 20, ey + 50.5);

  const actLabel = isOutroThumbnail || localT >= 4.4
    ? 'ACT III · STARGATE AGI'
    : localT < 2.1
      ? 'ACT I · DFT EPICYCLES'
      : 'ACT II · HOLOGRAPHIC MESH';
  ctx.fillStyle = 'rgba(251, 191, 36, 0.18)';
  ctx.beginPath();
  ctx.roundRect(ex + ew - 166, ey + 40, 156, 18, 9);
  ctx.fill();
  ctx.fillStyle = '#fbbf24';
  ctx.font = '700 9.5px "PelicanMono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(actLabel, ex + ew - 88, ey + 49.5);

  // Live Mathematical & 16-Bar Harmonic Spectrum Panel (`ey + 67 .. ey + 129`)
  const bx = ex + 10;
  const by = ey + 67;
  const bw = ew - 20;
  const bh = 60;
  ctx.fillStyle = 'rgba(12, 20, 38, 0.82)';
  ctx.strokeStyle = 'rgba(96, 165, 250, 0.30)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 7);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '600 11px "PelicanMono", monospace';
  ctx.fillStyle = '#fde047';
  ctx.fillText('z(θ) = c₀ + Σ c_k · exp(i·k·θ)', bx + 12, by + 18);

  ctx.font = '500 10.2px "PelicanMono", monospace';
  ctx.fillStyle = '#c084fc';
  ctx.fillText('θ_{t+1} = θ_t + α · ∇_θ E[R_self(π_θ)]', bx + 12, by + 36);

  ctx.font = '400 9.5px "PelicanMono", monospace';
  ctx.fillStyle = '#60a5fa';
  const genIdx = isOutroThumbnail ? 2048 : 1024 + Math.floor(localT * 180);
  ctx.fillText(`N=32 DFT · GEN #${genIdx} · LOSS → 0.0001`, bx + 12, by + 51);

  // Right Column inside Banner: Live 16-Bar `|c_k|` Harmonic Spectrum!
  const sx0 = bx + 292;
  const sw = bw - 304;
  const axisY = by + 51;
  ctx.font = '600 8.5px "PelicanMono", monospace';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('|c_k| HARMONIC SPECTRUM', sx0, by + 12);

  const pitch = sw / 16;
  const barW = Math.max(4.5, pitch - 2.5);
  for (let b = 0; b < 16; b++) {
    const term = dft.terms[b];
    const normA = Math.pow(term.amp / dft.maxAmp, 0.45);
    const liveMod = 0.82 + 0.18 * Math.cos(term.k * theta + term.phase);
    const hBar = clamp(normA * 31 * liveMod, 3, 32);
    const xBar = sx0 + b * pitch;
    const yBar = axisY - hBar;
    const isPos = term.k > 0;

    ctx.fillStyle = isPos ? 'rgba(96, 165, 250, 0.85)' : 'rgba(251, 191, 36, 0.85)';
    ctx.fillRect(xBar, yBar, barW, hBar);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(xBar, yBar - 1.3, barW, 1.4);
  }

  // Streaming Self-Improving WGSL + SVG Synthesis Code (`ey + 138 .. ey + 326`)
  const rx = Math.round(rig ? rig.root.x : 640);
  const hx = Math.round(rig ? rig.head.x : 665);
  const hy = Math.round(rig ? rig.head.y : 474);
  const deg = rig ? Math.round(((rig.pedalAngle * 180) / Math.PI) % 360) : 45;

  const C_KW = '#ff7b72';
  const C_FN = '#d2a8ff';
  const C_TAG = '#7ee787';
  const C_ATTR = '#79c0ff';
  const C_NUM = '#ffa657';
  const C_CMT = '#8b949e';

  const lines = [
    [[`// Recursive Self-Improving Neural Architecture + Live Rig`, C_CMT]],
    [[`@compute @workgroup_size`, C_KW], [`(`, '#e2e8f0'], [`64`, C_NUM], [`) `, '#e2e8f0'], [`fn `, C_KW], [`evolve_agi_kernel`, C_FN], [`() {`, '#e2e8f0']],
    [[`  let `, C_KW], [`attention = softmax(Q * transpose(K) / sqrt(d_k));`, '#e2e8f0']],
    [[`  W_next = W + meta_grad(L_verify, H_fourier_32);`, '#c084fc']],
    [[`}`, '#e2e8f0']],
    [[`<svg `, C_TAG], [`id=`, C_ATTR], [`"agi-horizon-20" `, '#a5d6ff'], [`viewBox=`, C_ATTR], [`"0 0 1000 1000"`, C_NUM], [`>`, C_TAG]],
    [[`  <g `, C_TAG], [`id=`, C_ATTR], [`"agent-01" `, '#a5d6ff'], [`x=`, C_ATTR], [`"${rx}" `, C_NUM], [`y=`, C_ATTR], [`"680" `, C_NUM], [`crank=`, C_ATTR], [`"${deg}deg"`, C_NUM], [`>`, C_TAG]],
    [[`    <circle `, C_TAG], [`id=`, C_ATTR], [`"stargate-orbit" `, '#a5d6ff'], [`cx=`, C_ATTR], [`"${hx}" `, C_NUM], [`cy=`, C_ATTR], [`"${hy}" `, C_NUM], [`r=`, C_ATTR], [`"148"`, C_NUM], [`/>`, C_TAG]],
    [[`    <line `, C_TAG], [`id=`, C_ATTR], [`"horizon" `, '#a5d6ff'], [`x1=`, C_ATTR], [`"0" `, C_NUM], [`y1=`, C_ATTR], [`"680" `, C_NUM], [`x2=`, C_ATTR], [`"1000" `, C_NUM], [`stroke=`, C_ATTR], [`"#60a5fa"`, '#fde047'], [`/>`, C_TAG]],
    [[`  </g></svg>`, C_TAG]],
  ];

  const streamU = isOutroThumbnail ? 1.0 : clamp(0.32 + (localT / 2.2) * 0.68, 0, 1);
  const totalChars = lines.reduce((s, segs) => s + segs.reduce((a, [t]) => a + t.length, 0), 0);
  let budget = Math.floor(totalChars * streamU);

  ctx.font = '500 11px "PelicanMono", monospace';
  const rowH = 19.0;
  const startY = ey + 144;

  for (let r = 0; r < lines.length; r++) {
    const yRow = startY + r * rowH;
    ctx.fillStyle = 'rgba(148, 163, 184, 0.42)';
    ctx.textAlign = 'right';
    ctx.fillText(String(r + 1).padStart(2, '0'), ex + 26, yRow);

    ctx.textAlign = 'left';
    let curX = ex + 36;
    for (const [txt, col] of lines[r]) {
      if (budget <= 0) break;
      const slice = budget >= txt.length ? txt : txt.slice(0, budget);
      budget -= slice.length;
      ctx.fillStyle = col;
      ctx.fillText(slice, curX, yRow);
      curX += ctx.measureText(slice).width;
    }
  }

  ctx.restore();
}

/**
 * Act I (`localT < 2.1s`): Spinning 32-Harmonic Golden-Cyan Fourier Epicycle Circles (`Σ c_k e^{ikθ}`)
 * live-tracing the moving Cyber-Rider contour!
 */
function drawFourierEpicyclesAct1(ctx, rig, theta, alpha) {
  if (alpha <= 0.01) return;
  const dft = getCyberRiderFourierDFT();
  const ox = rig.root.x;
  const oy = rig.root.y;

  ctx.save();
  ctx.globalAlpha = alpha;

  let cx = ox + dft.c0x;
  let cy = oy + dft.c0y;

  // 1. Spinning 32-Harmonic Epicycle Rings & Phase Radius Vectors
  for (let i = 0; i < dft.terms.length; i++) {
    const t = dft.terms[i];
    const ang = t.k * theta + t.phase;
    const nx = cx + t.amp * Math.cos(ang);
    const ny = cy + t.amp * Math.sin(ang);

    if (t.amp > 1.2) {
      ctx.strokeStyle =
        i % 2 === 0
          ? 'rgba(251, 191, 36, 0.34)'
          : 'rgba(96, 165, 250, 0.34)';
      ctx.lineWidth = i < 5 ? 1.3 : 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, t.amp, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = i < 8 ? 'rgba(253, 224, 71, 0.78)' : 'rgba(125, 211, 252, 0.65)';
    ctx.lineWidth = i < 6 ? 1.5 : 0.95;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();

    cx = nx;
    cy = ny;
  }

  // 2. Live-Traced Luminous Closed Contour Trail (`z(θ)`)
  const maxSample = Math.min(RECON_SAMPLES, Math.max(18, Math.floor((theta / (Math.PI * 2)) * RECON_SAMPLES)));
  ctx.strokeStyle = '#fde047';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let j = 0; j <= maxSample; j++) {
    const pt = dft.recon[j % RECON_SAMPLES];
    if (j === 0) ctx.moveTo(ox + pt.x, oy + pt.y);
    else ctx.lineTo(ox + pt.x, oy + pt.y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 3. Blazing White-Gold Epicycle Pen Tip + Obsidian Floor Reflection
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.arc(cx, cy, 9.0, 0, Math.PI * 2);
  ctx.stroke();

  const reflY = ROAD_EDGE_Y + (ROAD_EDGE_Y - cy) * 0.22;
  if (reflY > ROAD_EDGE_Y && reflY < PANEL_SIZE) {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, reflY, 8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Act II (`2.1s .. 4.4s`): Faceted Holographic Barycentric Mesh Overlay on the Cyber-Rider!
 */
function drawHolographicMeshOverlay(ctx, rig, meshAlpha) {
  if (meshAlpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = meshAlpha;

  const facets = [
    [rig.head, rig.beakTip, rig.chest, 'rgba(96, 165, 250, 0.30)', '#7dd3fc'],
    [rig.head, rig.crest1, rig.scarfAnchor, 'rgba(192, 132, 252, 0.28)', '#d8b4fe'],
    [rig.scarfAnchor, rig.scarfCtrl1, rig.hip, 'rgba(251, 191, 36, 0.28)', '#fde047'],
    [rig.scarfCtrl1, rig.scarfCtrl2, rig.tailTip, 'rgba(251, 191, 36, 0.32)', '#fef08a'],
    [rig.chest, rig.bodyCenter, rig.hip, 'rgba(96, 165, 250, 0.26)', '#93c5fd'],
    [rig.chest, rig.wingElbow, rig.handleGrip, 'rgba(56, 189, 248, 0.28)', '#bae6fd'],
    [rig.seatCluster, rig.headTop, rig.bb, 'rgba(192, 132, 252, 0.22)', '#c084fc'],
    [rig.rearWheel, rig.seatCluster, rig.bb, 'rgba(96, 165, 250, 0.20)', '#60a5fa'],
    [rig.headTop, rig.frontWheel, rig.headBot, 'rgba(251, 191, 36, 0.20)', '#fbbf24'],
  ];

  ctx.lineWidth = 1.15;
  for (const [p0, p1, p2, fillCol, strokeCol] of facets) {
    ctx.fillStyle = fillCol;
    ctx.strokeStyle = strokeCol;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Glowing Delaunay vertex nodes
  ctx.fillStyle = '#ffffff';
  for (const v of [rig.head, rig.beakTip, rig.chest, rig.hip, rig.seatCluster, rig.headTop, rig.bb, rig.tailTip]) {
    ctx.beginPath();
    ctx.arc(v.x, v.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Act III (`4.4s .. 6.0s` & `isOutroThumbnail`):
 * Stargate Light Pillars + 3 Delicate Golden-Cyan Harmonic Orbital Rings surrounding the radiant AGI Cyber-Rider!
 */
function drawStargatePillarsAndOrbitalRings(ctx, rig, localT, orbitAlpha) {
  if (orbitAlpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = orbitAlpha;

  // 1. Vertical AGI Stargate Light Pillars rising from the y = 680 Horizon!
  const pillarSpecs = [
    { x: rig.root.x - 165, w: 34, col: 'rgba(96, 165, 250, 0.16)' },
    { x: rig.root.x + 155, w: 46, col: 'rgba(251, 191, 36, 0.20)' },
    { x: 895, w: 64, col: 'rgba(192, 132, 252, 0.18)' },
  ];
  for (const pl of pillarSpecs) {
    if (pl.x < -60 || pl.x > PANEL_SIZE + 60) continue;
    const pg = ctx.createLinearGradient(pl.x, ROAD_EDGE_Y, pl.x, 48);
    pg.addColorStop(0.0, pl.col);
    pg.addColorStop(0.65, 'rgba(96, 165, 250, 0.06)');
    pg.addColorStop(1.0, 'rgba(5, 8, 16, 0)');
    ctx.fillStyle = pg;
    ctx.fillRect(pl.x - pl.w * 0.5, 48, pl.w, ROAD_EDGE_Y - 48);

    // Razor core filament inside light pillar
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(pl.x, ROAD_EDGE_Y);
    ctx.lineTo(pl.x, 90);
    ctx.stroke();
  }

  // 2. Three Delicate Golden-Cyan Harmonic Orbital Rings around the Cyber-Rider!
  const cx = rig.root.x - 4;
  const cy = rig.root.y - 108;
  const rings = [
    { rx: 162, ry: 54, tilt: -0.24, col: '#fbbf24', spd: 1.5, phase: 0.2 },
    { rx: 148, ry: 46, tilt: 0.28, col: '#60a5fa', spd: -1.8, phase: 2.1 },
    { rx: 126, ry: 118, tilt: 0.05, col: '#c084fc', spd: 1.1, phase: 4.0 },
  ];

  for (const r of rings) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(r.tilt);

    ctx.strokeStyle = r.col;
    ctx.globalAlpha = orbitAlpha * 0.58;
    ctx.lineWidth = 1.45;
    ctx.beginPath();
    ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting Harmonic Phase Satellite Node + 4-Point Star Sparkle
    const a = localT * r.spd + r.phase;
    const sx = Math.cos(a) * r.rx;
    const sy = Math.sin(a) * r.ry;
    ctx.globalAlpha = orbitAlpha;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = r.col;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(sx, sy, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Delicate golden harmonic sub-orbits around both Tensor Light-Cycle wheels
  for (const w of [rig.rearWheel, rig.frontWheel]) {
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r + 9, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function render(kit, slot, scene, params) {
  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;

  const localT = params?.localT ?? 0;
  const time = params?.t ?? localT;
  const rawRiderX = params?.pelicanLocalX ?? 500;
  const pedalAngle = params?.pedalAngle ?? 0;
  const speedScale = params?.speedScale ?? 1;
  const hidePelican = Boolean(params?.hidePelican);
  const isOutroThumbnail = Boolean(params?.isOutroThumbnail);

  // In Outro thumbnail, position Cyber-Rider at x=665 right inside the Golden Spiral focal center!
  const effectiveRiderX = isOutroThumbnail ? 665 : rawRiderX;

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Deep Nano-OLED Optical Workbench + Perspective Floor + #60a5fa Horizon at y = 680
  const bg = getAGIWorkbenchBackdrop(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Compute Cyber-Rider IK Rig & 3-Act Finale Envelopes (100% solid at localT=6.0s & isOutroThumbnail!)
  const showRider = !hidePelican && (isOutroThumbnail || (rawRiderX >= -260 && rawRiderX <= 1260));
  const rig = showRider
    ? computePelicanRig({
        x: effectiveRiderX,
        y: ROAD_EDGE_Y,
        pedalAngle,
        scale: 1.0,
        slope: 0,
        speedScale,
        time,
      })
    : null;

  // Act I (`0..2.1s`): Fourier Epicycles; Act II (`2.1..4.4s`): Holographic Mesh + Solid Rider;
  // Act III (`4.4..6.0s` & `isOutroThumbnail`): 100% Solid Radiant Rider + 3 Harmonic Orbits & Stargate Pillars!
  const epicycleAlpha = isOutroThumbnail ? 0 : 1 - smoothstep(1.85, 2.25, localT);
  const theta = isOutroThumbnail ? Math.PI * 2 : ((localT / 2.05) * 1.55) * Math.PI * 2;
  const solidRiderAlpha = isOutroThumbnail ? 1.0 : smootherstep(1.35, 2.20, localT);
  const meshAlpha = isOutroThumbnail
    ? 0.28
    : smoothstep(1.90, 2.30, localT) * (1 - 0.65 * smoothstep(4.25, 4.75, localT));
  const orbitAlpha = isOutroThumbnail ? 1.0 : smootherstep(4.15, 4.65, localT);

  // 3. Frosted-Glass Self-Evolving AGI Studio Window (`20 · 自我演进与通用智能`)
  drawSelfEvolvingAGIStudio(ctx, rig, localT, theta, isOutroThumbnail);

  // 4. 3-Act Cyber-Rider Synthesis & Stargate Climax
  if (rig) {
    // Act III Stargate Light Pillars & Back Orbital Glow
    if (orbitAlpha > 0.01) {
      drawStargatePillarsAndOrbitalRings(ctx, rig, localT, orbitAlpha);
    }

    // Obsidian Floor Mirror Reflection of the Cyber-Rider (`y = 681..760`)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, ROAD_EDGE_Y + 1, PANEL_SIZE, 90);
    ctx.clip();
    ctx.translate(0, ROAD_EDGE_Y * 2);
    ctx.scale(1, -0.32);
    ctx.globalAlpha = 0.22 * Math.max(0.4, solidRiderAlpha);
    drawRig2D(ctx, rig, {
      wireframeColor: '#60a5fa',
      glow: '#38bdf8',
    });
    ctx.restore();

    // Act I Subtle Awakening Cyan Wireframe Core inside Fourier Epicycles
    if (epicycleAlpha > 0.02) {
      ctx.save();
      ctx.globalAlpha = epicycleAlpha * 0.55;
      drawRig2D(ctx, rig, {
        wireframeColor: '#38bdf8',
        glow: '#60a5fa',
      });
      ctx.restore();
    }

    // Act II & III Solid Iridescent White-Gold & Cyan AGI Cyber-Rider (100% solid at localT=6.0s & Outro!)
    if (solidRiderAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = solidRiderAlpha;
      drawRig2D(ctx, rig, {
        featherFill: '#f8fafc',
        featherShade: '#bae6fd',
        wingTipDark: '#0f172a',
        beakFill: '#38bdf8',
        pouchFill: '#fbbf24',
        legFill: '#e2e8f0',
        frameStroke: '#60a5fa',
        metalStroke: '#c084fc',
        tireStroke: '#090d16',
        inkOutline: '#050810',
        glowColor: '#fbbf24',
        halo: true,
        scanBeam: true,
      });
      ctx.restore();
    }

    // Act II Faceted Holographic Tensor Mesh Crystallization
    if (meshAlpha > 0.01) {
      drawHolographicMeshOverlay(ctx, rig, meshAlpha);
    }

    // Act I Spinning 32-Harmonic Complex DFT Fourier Epicycles (`Σ c_k e^{ikθ}`)
    if (epicycleAlpha > 0.01) {
      drawFourierEpicyclesAct1(ctx, rig, theta, epicycleAlpha);
    }
  }

  // 5. Outro Museum Gallery Tile Strip
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(7, 11, 20, 0.88)';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 92);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 4);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 46px "PelicanSans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene?.num ?? 20).padStart(2, '0')} ${scene?.zh ?? '自我演进与通用智能黎明'}`, 36, PANEL_SIZE - 44);
  }

  ctx.restore();
}
