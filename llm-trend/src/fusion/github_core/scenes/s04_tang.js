// src/fusion/github_core/scenes/s04_tang.js
// 04 · 注意力机制诞生 (2017 · Transformer Multi-Head Attention · Cathedral of Light)
// - Grand obsidian & radiant gold-cyan cathedral of light (#100d1c, #fbbf24, #38bdf8, #a855f7)
// - Soaring Gothic-cybernetic residual-stream pillars framing a 16x16 `Q · Kᵀ / √dₖ` glowing attention-heatmap
//   stained-glass matrix that pulses rhythmically on beat and tracks the query cursor
// - Upper 12-token sequence gallery emitting sweeping Bezier Multi-Head Attention arcs (8 color-coded heads
//   in gold, cyan, violet, amber) that dynamically re-weight via Softmax and focus radiant golden spotlight
//   arcs directly onto the Cyber-Rider's `pelicanLocalX`

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';
import { makePRNG, hashSeed } from '../kit/kit.js';

const TAU = Math.PI * 2;

const HEAD_COLORS = [
  '#fbbf24', // Head 1: Imperial Gold
  '#38bdf8', // Head 2: Electric Cyan
  '#a855f7', // Head 3: Royal Violet
  '#f59e0b', // Head 4: Warm Amber
  '#fde68a', // Head 5: Champagne Gold
  '#22d3ee', // Head 6: Laser Aqua
  '#c084fc', // Head 7: Lavender Plasma
  '#fb923c', // Head 8: Copper Gold
];

// 12 Upper Token Sequence Pedestals spanning the Cathedral Clerestory (x = 76..924, y = 104)
const NUM_TOKENS = 12;
const TOKEN_NODES = Array.from({ length: NUM_TOKENS }, (_, i) => ({
  index: i,
  x: 76 + (i / (NUM_TOKENS - 1)) * 848,
  y: 104,
  code: `T${String(i + 1).padStart(2, '0')}`,
}));

// Precomputed 16x16 Self-Attention Base Affinity Matrix A[r][c] (strong diagonal + syntactic long-range heads)
const HEATMAP_N = 16;
const BASE_ATTN_MATRIX = (() => {
  const rng = makePRNG(hashSeed('vaswani_2017_attention_matrix'));
  const mat = [];
  for (let r = 0; r < HEATMAP_N; r++) {
    const row = [];
    for (let c = 0; c < HEATMAP_N; c++) {
      const diag = Math.exp(-Math.pow((r - c) / 1.65, 2)) * 0.78;
      const bos = c === 0 ? 0.34 : 0;
      const harmonic = (r + c) % 5 === 0 ? 0.42 : 0;
      const causalBoost = c <= r ? 0.16 : 0.04;
      row.push(clamp(diag + bos + harmonic * rng() + causalBoost + rng() * 0.22, 0.05, 1.0));
    }
    mat.push(row);
  }
  return mat;
})();

function evalCubicBezier(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, u) {
  const m = 1 - u;
  const m2 = m * m;
  const u2 = u * u;
  return {
    x: m2 * m * p0x + 3 * m2 * u * p1x + 3 * m * u2 * p2x + u2 * u * p3x,
    y: m2 * m * p0y + 3 * m2 * u * p1y + 3 * m * u2 * p2y + u2 * u * p3y,
  };
}

function getBakedTransformerCathedral(kit) {
  return kit.bake2D('s04_transformer_cathedral_v1', (_g, ctx, rng, w, h) => {
    // 1. Deep Obsidian-Violet Cathedral Vault Backdrop
    const bgG = ctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    bgG.addColorStop(0, '#0a0713');
    bgG.addColorStop(0.38, '#120d22');
    bgG.addColorStop(0.78, '#1b1233');
    bgG.addColorStop(1, '#120c21');
    ctx.fillStyle = bgG;
    ctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // Radiant central golden-violet sanctuary halo behind heatmap rose-matrix
    const sanctG = ctx.createRadialGradient(500, 355, 24, 500, 355, 420);
    sanctG.addColorStop(0, 'rgba(251, 191, 36, 0.16)');
    sanctG.addColorStop(0.45, 'rgba(168, 85, 247, 0.11)');
    sanctG.addColorStop(0.8, 'rgba(56, 189, 248, 0.05)');
    sanctG.addColorStop(1, 'rgba(16, 13, 28, 0)');
    ctx.fillStyle = sanctG;
    ctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // 2. Soaring Fluted Obsidian & Gold Residual-Stream Cathedral Pillars + Pointed Vault Arches
    const pillarXs = [36, 186, 814, 964];
    for (const px of pillarXs) {
      const pg = ctx.createLinearGradient(px - 18, 0, px + 18, 0);
      pg.addColorStop(0, '#090612');
      pg.addColorStop(0.35, '#261942');
      pg.addColorStop(0.5, '#fbbf24');
      pg.addColorStop(0.65, '#261942');
      pg.addColorStop(1, '#090612');
      ctx.fillStyle = pg;
      ctx.fillRect(px - 16, 48, 32, ROAD_EDGE_Y - 48);

      // Vertical cyan/gold optical fiber inlays (`x + MultiHead(LN(x))`)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(px - 7, 54);
      ctx.lineTo(px - 7, ROAD_EDGE_Y - 4);
      ctx.moveTo(px + 7, 54);
      ctx.lineTo(px + 7, ROAD_EDGE_Y - 4);
      ctx.stroke();

      // LayerNorm golden capital rings on pillars
      for (const ry of [142, 320, 510]) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px - 20, ry - 3, 40, 6);
      }
    }

    // Soaring Cathedral Vault Ribs overhead
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.24)';
    ctx.lineWidth = 1.8;
    for (let k = 0; k < 4; k++) {
      const spanX = 36 + k * 60;
      ctx.beginPath();
      ctx.moveTo(spanX, 240);
      ctx.quadraticCurveTo(500, -45 + k * 22, w - spanX, 240);
      ctx.stroke();
    }

    // 3. Sinusoidal Positional Encoding Ribbon (`PE(pos, 2i) = sin(pos / 10000^{2i/d})`) at y = 52..78
    ctx.fillStyle = 'rgba(13, 10, 24, 0.78)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.36)';
    ctx.lineWidth = 1.2;
    ctx.fillRect(54, 42, w - 108, 34);
    ctx.strokeRect(54, 42, w - 108, 34);

    for (let freqIdx = 0; freqIdx < 3; freqIdx++) {
      ctx.strokeStyle = freqIdx === 0 ? 'rgba(251, 191, 36, 0.55)' : freqIdx === 1 ? 'rgba(56, 189, 248, 0.48)' : 'rgba(168, 85, 247, 0.48)';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      for (let x = 60; x <= w - 60; x += 6) {
        const u = (x - 60) / (w - 120);
        const py = 59 + Math.sin(u * TAU * (2 + freqIdx * 2.5) + freqIdx) * 9.5;
        if (x === 60) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }

    // 4. Monumental Recessed `Q · Kᵀ / √dₖ` Attention-Heatmap Stained-Glass Matrix (x = 296..704, y = 186..594)
    const matX = 296;
    const matY = 186;
    const matSize = 408;
    const cell = matSize / HEATMAP_N;

    // Ornate obsidian-gold bezel
    ctx.fillStyle = '#090612';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.4;
    ctx.fillRect(matX - 10, matY - 10, matSize + 20, matSize + 20);
    ctx.strokeRect(matX - 10, matY - 10, matSize + 20, matSize + 20);

    for (let r = 0; r < HEATMAP_N; r++) {
      for (let c = 0; c < HEATMAP_N; c++) {
        const val = BASE_ATTN_MATRIX[r][c];
        const cx = matX + c * cell;
        const cy = matY + r * cell;

        let tileCol;
        if (val > 0.72) {
          tileCol = `rgba(251, 191, 36, ${(0.34 + val * 0.42).toFixed(2)})`;
        } else if (val > 0.44) {
          tileCol = `rgba(168, 85, 247, ${(0.22 + val * 0.40).toFixed(2)})`;
        } else {
          tileCol = `rgba(56, 189, 248, ${(0.08 + val * 0.30).toFixed(2)})`;
        }
        ctx.fillStyle = tileCol;
        ctx.fillRect(cx + 1.5, cy + 1.5, cell - 3, cell - 3);

        ctx.strokeStyle = 'rgba(251, 191, 36, 0.14)';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(cx + 1.5, cy + 1.5, cell - 3, cell - 3);
      }
    }

    ctx.font = '600 11.5px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = 'rgba(253, 230, 138, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('Attention(Q, K, V) = softmax(Q · Kᵀ / √dₖ) V', 500, matY - 18);

    // 5. Canonical y = 680 Road: Golden-Obsidian Self-Attention Optical Causeway [0..1000]
    const roadG = ctx.createLinearGradient(0, ROAD_EDGE_Y - 2, 0, ROAD_EDGE_Y + 24);
    roadG.addColorStop(0, '#fef3c7');
    roadG.addColorStop(0.18, '#fbbf24');
    roadG.addColorStop(0.52, '#78350f');
    roadG.addColorStop(1, '#120c20');
    ctx.fillStyle = roadG;
    ctx.fillRect(0, ROAD_EDGE_Y, w, 24);

    // Crisp luminous gold & cyan top rail at y = 680
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, ROAD_EDGE_Y);
    ctx.lineTo(w, ROAD_EDGE_Y);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, ROAD_EDGE_Y + 6);
    ctx.lineTo(w, ROAD_EDGE_Y + 6);
    ctx.stroke();

    // 6. Sub-Floor (y = 704..1000): Polished Obsidian Mirror Nave & 8-Head Optical Bus Lanes (H₁..H₈)
    const navG = ctx.createLinearGradient(0, ROAD_EDGE_Y + 24, 0, h);
    navG.addColorStop(0, '#140e26');
    navG.addColorStop(0.5, '#0c0818');
    navG.addColorStop(1, '#06040d');
    ctx.fillStyle = navG;
    ctx.fillRect(0, ROAD_EDGE_Y + 24, w, h - (ROAD_EDGE_Y + 24));

    // Faint golden pillar reflections in polished obsidian floor
    for (const px of pillarXs) {
      const rg = ctx.createLinearGradient(0, ROAD_EDGE_Y + 24, 0, 960);
      rg.addColorStop(0, 'rgba(251, 191, 36, 0.16)');
      rg.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = rg;
      ctx.fillRect(px - 14, ROAD_EDGE_Y + 24, 28, 240);
    }

    // 8 Parallel Color-Coded Multi-Head Optical Waveguide Buses (`Concat(head₁, ..., head₈)Wᴼ`)
    for (let hIdx = 0; hIdx < 8; hIdx++) {
      const by = 736 + hIdx * 28;
      ctx.strokeStyle = HEAD_COLORS[hIdx];
      ctx.globalAlpha = 0.34;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, by);
      ctx.lineTo(w, by);
      ctx.stroke();

      // Micro optical repeater nodes along bus
      for (let nx = 40 + (hIdx % 2) * 30; nx < w; nx += 80) {
        if (rng() < 0.65) {
          ctx.fillStyle = HEAD_COLORS[hIdx];
          ctx.fillRect(nx - 2.5, by - 2.5, 5, 5);
        }
      }
    }
    ctx.globalAlpha = 1.0;

    ctx.font = '600 11px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = 'rgba(251, 191, 36, 0.78)';
    ctx.textAlign = 'left';
    ctx.fillText('MULTI-HEAD CONCAT(H₁..H₈) · Wᴼ RESIDUAL BUS', 38, 722);
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

  const focusX = clamp(hidePelican ? 500 : rx, 60, 940);
  const focusY = ROAD_EDGE_Y - 165; // Rider's neural crown / chest receptor zone

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Obsidian-Gold Cathedral & Static `Q·Kᵀ/√dₖ` Attention Matrix
  const bg = getBakedTransformerCathedral(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Live Rhythmic Pulsing on `Q · Kᵀ / √dₖ` Heatmap Tiles + Active Query Column Highlight
  const matX = 296;
  const matY = 186;
  const matSize = 408;
  const cell = matSize / HEATMAP_N;
  const activeCol = clamp(Math.floor(((focusX - 60) / 880) * HEATMAP_N), 0, HEATMAP_N - 1);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  // Active Query Column & Key Row cross-highlight pulsing on beat
  ctx.fillStyle = `rgba(251, 191, 36, ${(0.12 + beatPulse * 0.16).toFixed(3)})`;
  ctx.fillRect(matX + activeCol * cell, matY, cell, matSize);
  ctx.fillStyle = `rgba(56, 189, 248, ${(0.09 + beatPulse * 0.12).toFixed(3)})`;
  ctx.fillRect(matX, matY + activeCol * cell, matSize, cell);

  // Shimmering high-attention diagonal & cross-attention tiles
  for (let r = 0; r < HEATMAP_N; r++) {
    for (let c = 0; c < HEATMAP_N; c++) {
      const base = BASE_ATTN_MATRIX[r][c];
      if (base < 0.62 && c !== activeCol) continue;
      const wave = 0.5 + 0.5 * Math.sin(t * 4.5 + r * 0.7 - c * 0.5);
      const boost = (c === activeCol ? 0.35 : 0.14) * wave + beatPulse * 0.22;
      ctx.fillStyle = c === activeCol
        ? `rgba(254, 240, 138, ${(boost * 0.85).toFixed(3)})`
        : `rgba(251, 191, 36, ${(boost * 0.55).toFixed(3)})`;
      ctx.fillRect(matX + c * cell + 2, matY + r * cell + 2, cell - 4, cell - 4);
    }
  }
  ctx.restore();

  // 3. Compute Live Softmax Attention Weights αᵢ from all 12 Upper Tokens toward `focusX`!
  const rawLogits = TOKEN_NODES.map((tk, i) => {
    const dist = Math.abs(tk.x - focusX);
    // Gaussian locality + long-range syntactic harmonic head peaks
    const localScore = -dist / 155;
    const longRange = 0.55 * Math.cos(i * 1.9 + localT * 1.4);
    return localScore + longRange;
  });
  const maxLogit = Math.max(...rawLogits);
  const exps = rawLogits.map((z) => Math.exp(z - maxLogit));
  const sumExp = exps.reduce((a, b) => a + b, 0) || 1;
  const attnWeights = exps.map((e) => e / sumExp);

  // 4. Layer A: Upper Clerestory Token-to-Token Multi-Head Vaulted Bezier Arcs (8 Heads)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let hIdx = 0; hIdx < 8; hIdx++) {
    const srcIdx = (hIdx * 2 + Math.floor(localT * 0.5)) % NUM_TOKENS;
    const dstIdx = (srcIdx + 3 + (hIdx % 5)) % NUM_TOKENS;
    if (srcIdx === dstIdx) continue;
    const t0 = TOKEN_NODES[srcIdx];
    const t1 = TOKEN_NODES[dstIdx];
    const midX = (t0.x + t1.x) * 0.5;
    const sagY = 148 + Math.abs(dstIdx - srcIdx) * 18 + (hIdx % 3) * 14;

    ctx.strokeStyle = HEAD_COLORS[hIdx];
    ctx.globalAlpha = 0.26 + beatPulse * 0.18;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(t0.x, t0.y + 10);
    ctx.quadraticCurveTo(midX, sagY, t1.x, t1.y + 10);
    ctx.stroke();
  }

  // 5. Layer B: Dynamic Multi-Head Attention Spotlight Arcs Focusing onto the Cyber-Rider (`pelicanLocalX`)!
  for (let i = 0; i < NUM_TOKENS; i++) {
    const tk = TOKEN_NODES[i];
    const weight = attnWeights[i]; // Softmax weight in (0..1)
    const headIdx = i % 8;
    const headCol = HEAD_COLORS[headIdx];
    const normW = clamp(weight * 4.2, 0.08, 1.0);

    // Sweeping cathedral S-curve Bezier from upper token pedestal down to Rider receptor (focusX, focusY)
    const c1x = lerp(tk.x, focusX, 0.18) + (headIdx - 3.5) * 12;
    const c1y = tk.y + 135 + (headIdx % 3) * 26;
    const c2x = lerp(tk.x, focusX, 0.82) + (headIdx - 3.5) * 8;
    const c2y = focusY - 135;

    // Outer luminous halo stroke on dominant attention heads
    if (normW > 0.35) {
      ctx.strokeStyle = normW > 0.68 ? '#fbbf24' : headCol;
      ctx.globalAlpha = normW * (0.34 + beatPulse * 0.22);
      ctx.lineWidth = 3.5 + normW * 5.5;
      ctx.beginPath();
      ctx.moveTo(tk.x, tk.y + 10);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, focusX, focusY);
      ctx.stroke();
    }

    // Crisp Multi-Head core filament
    ctx.strokeStyle = headCol;
    ctx.globalAlpha = 0.22 + normW * 0.72;
    ctx.lineWidth = 1.1 + normW * 2.4;
    ctx.beginPath();
    ctx.moveTo(tk.x, tk.y + 10);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, focusX, focusY);
    ctx.stroke();

    // Travelling Query-Key-Value photon packet descending along active attention arcs!
    if (normW > 0.22) {
      const uPkt = (t * (1.15 + (headIdx % 3) * 0.25) + i * 0.17) % 1;
      const pt = evalCubicBezier(tk.x, tk.y + 10, c1x, c1y, c2x, c2y, focusX, focusY, uPkt);
      ctx.globalAlpha = 0.65 + normW * 0.35;
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.2 + normW * 2.4, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  // 6. Upper 12 Token Sequence Pedestals & Live Softmax Weight Bars (αᵢ)
  for (let i = 0; i < NUM_TOKENS; i++) {
    const tk = TOKEN_NODES[i];
    const normW = clamp(attnWeights[i] * 4.2, 0.08, 1.0);
    const col = HEAD_COLORS[i % 8];

    // Live Softmax bar rising above token node
    const barH = 4 + normW * 20;
    ctx.fillStyle = col;
    ctx.fillRect(tk.x - 10, tk.y - 14 - barH, 20, barH);

    // Token socket gem
    ctx.fillStyle = '#120c22';
    ctx.strokeStyle = normW > 0.45 ? '#fef3c7' : col;
    ctx.lineWidth = normW > 0.45 ? 2.4 : 1.5;
    ctx.fillRect(tk.x - 22, tk.y - 11, 44, 22);
    ctx.strokeRect(tk.x - 22, tk.y - 11, 44, 22);

    ctx.font = '700 10.5px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = normW > 0.45 ? '#fef3c7' : '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tk.code, tk.x, tk.y);
  }

  // 7. Sub-Floor Multi-Head Optical Waveguide Pulses Racing Parallel to the Rider
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let hIdx = 0; hIdx < 8; hIdx++) {
    const by = 736 + hIdx * 28;
    const pulseX = ((t * (240 + hIdx * 32) + hIdx * 130) % (PANEL_SIZE + 160)) - 80;
    const pg = ctx.createLinearGradient(pulseX - 70, by, pulseX + 70, by);
    pg.addColorStop(0, 'rgba(0, 0, 0, 0)');
    pg.addColorStop(0.5, HEAD_COLORS[hIdx]);
    pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.strokeStyle = pg;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(pulseX - 70, by);
    ctx.lineTo(pulseX + 70, by);
    ctx.stroke();
  }
  ctx.restore();

  // 8. Radiant Gold-Cyan `gold_tech` Cyber-Rider Illuminated by Converging Attention Beams at y = 680
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

    // Golden Softmax Spotlight Pool on the Cathedral Causeway beneath the Rider
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const spotG = ctx.createRadialGradient(rx, ROAD_EDGE_Y, 8, rx, ROAD_EDGE_Y, 145);
    spotG.addColorStop(0, `rgba(254, 240, 138, ${(0.45 + beatPulse * 0.22).toFixed(3)})`);
    spotG.addColorStop(0.45, 'rgba(251, 191, 36, 0.20)');
    spotG.addColorStop(0.8, 'rgba(56, 189, 248, 0.08)');
    spotG.addColorStop(1, 'rgba(16, 13, 28, 0)');
    ctx.fillStyle = spotG;
    ctx.beginPath();
    ctx.ellipse(rx, ROAD_EDGE_Y + 2, 145, 22, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    drawRig2D(ctx, rig, {
      featherFill: '#fef3c7',
      featherShade: '#fbbf24',
      wingTipDark: '#1e1035',
      beakFill: '#38bdf8',
      pouchFill: '#fbbf24',
      legFill: '#fde68a',
      frameStroke: '#fbbf24',
      metalStroke: '#a855f7',
      tireStroke: '#120d20',
      inkOutline: '#090612',
      glowColor: '#fbbf24',
      halo: true,
      scanBeam: true,
    });
  }

  // 9. Outro 7x3 Exhibition Wall Thumbnail Caption
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(16, 13, 28, 0.84)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 4);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene?.num ?? 4).padStart(2, '0')} ${scene?.zh ?? '注意力机制诞生'}`, 36, PANEL_SIZE - 46);
  }

  ctx.restore();
}
