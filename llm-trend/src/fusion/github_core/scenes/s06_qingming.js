// src/fusion/github_core/scenes/s06_qingming.js
// 06 · 对话觉醒与人类对齐 (2022 · ChatGPT & RLHF Alignment Bridge)
// Visual Direction:
// - Emerald-jade & warm gold night cityscape across a digital river (#071714, #10b981, #34d399, #fbbf24).
// - Luminous Arched Data Rainbow Bridge spanning the center (`kit.sampleRoad(x, 56)`: y=680 -> 624 -> 680),
//   shimmering in the dark digital river below (y = 680..1000).
// - Floating translucent glass chat cards in the sky streaming token bars + blinking emerald cursor `▋`,
//   while golden RLHF human-feedback reward stars rise like warm lanterns along the bridge arch as Agent-01 crosses.

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
  smootherstep,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';
import { makePRNG, hashSeed } from '../kit/kit.js';

const ARCH_H = 56;

const PAL = {
  nightDeep: '#040e0c',
  nightMid: '#071714',
  nightJade: '#0b2620',
  emeraldDeep: '#064e3b',
  emerald: '#10b981',
  emeraldBright: '#34d399',
  mintIce: '#ecfdf5',
  gold: '#fbbf24',
  goldSoft: '#fde68a',
  goldWarm: '#f59e0b',
};

const CHAT_CARDS = [
  {
    x: 84,
    y: 108,
    w: 228,
    h: 106,
    startT: 0.15,
    role: 'RLHF · DIALOGUE',
    reward: '+0.98',
    promptW: [0.68, 0.42],
    replyRows: [
      [0.28, 0.36, 0.22],
      [0.44, 0.32],
      [0.25, 0.34, 0.18],
    ],
  },
  {
    x: 368,
    y: 74,
    w: 264,
    h: 118,
    startT: 0.9,
    role: 'CHAT · ALIGNMENT',
    reward: '+0.99',
    promptW: [0.76, 0.50],
    replyRows: [
      [0.34, 0.28, 0.24],
      [0.22, 0.46, 0.18],
      [0.38, 0.30],
    ],
  },
  {
    x: 686,
    y: 104,
    w: 234,
    h: 108,
    startT: 1.85,
    role: 'PPO · REWARD MODEL',
    reward: '+0.97',
    promptW: [0.62, 0.38],
    replyRows: [
      [0.32, 0.38, 0.16],
      [0.48, 0.26],
      [0.29, 0.33],
    ],
  },
  {
    x: 204,
    y: 248,
    w: 214,
    h: 94,
    startT: 0.55,
    role: 'HELPFUL · HARMLESS',
    reward: '+0.96',
    promptW: [0.58],
    replyRows: [
      [0.36, 0.38],
      [0.26, 0.42, 0.16],
    ],
  },
  {
    x: 576,
    y: 242,
    w: 222,
    h: 96,
    startT: 1.45,
    role: 'HUMAN FEEDBACK',
    reward: '+0.99',
    promptW: [0.64],
    replyRows: [
      [0.40, 0.34],
      [0.28, 0.32, 0.22],
    ],
  },
];

// Precompute deterministic city window clusters that brighten dynamically as the rider crosses
const DYNAMIC_CITY_WINDOWS = (() => {
  const rng = makePRNG(hashSeed('s06_city_windows_dyn_v1'));
  const list = [];
  const zones = [
    { x0: 14, x1: 235, y0: 410, y1: 662, count: 42 },
    { x0: 250, x1: 750, y0: 465, y1: 635, count: 38 },
    { x0: 765, x1: 986, y0: 395, y1: 662, count: 44 },
  ];
  for (const z of zones) {
    for (let i = 0; i < z.count; i++) {
      list.push({
        x: lerp(z.x0, z.x1, rng()),
        y: lerp(z.y0, z.y1, rng()),
        w: 4 + Math.floor(rng() * 5),
        h: 3 + Math.floor(rng() * 3),
        isGold: rng() > 0.32,
        phase: rng() * Math.PI * 2,
      });
    }
  }
  return list;
})();

// Precompute RLHF Golden Reward Stars rising like warm lanterns along the bridge arch
const REWARD_STARS = (() => {
  const rng = makePRNG(hashSeed('s06_rlhf_stars_v1'));
  const stars = [];
  for (let i = 0; i < 22; i++) {
    const u = (i + 0.35 + (rng() - 0.5) * 0.4) / 22;
    const baseX = lerp(70, 930, clamp(u, 0.04, 0.96));
    stars.push({
      baseX,
      riseSpan: 155 + rng() * 165,
      size: 4.8 + rng() * 5.2,
      speed: 0.22 + rng() * 0.16,
      phase: rng(),
      swayAmp: 8 + rng() * 14,
      swayFreq: 1.4 + rng() * 1.6,
      hasBadge: i % 4 === 1,
    });
  }
  return stars;
})();

function drawRoundedRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function drawFourPointStar(ctx, cx, cy, outerR, innerR, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = rot + (i * Math.PI) / 4;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function getBakedAlignmentCity(kit) {
  return kit.bake2D('s06_rlhf_alignment_city_v1', (_g, bctx, rng, w, h) => {
    // 1. Deep Emerald-Jade Night Sky
    const skyG = bctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    skyG.addColorStop(0.0, '#030b09');
    skyG.addColorStop(0.38, PAL.nightMid);
    skyG.addColorStop(0.76, '#0a231d');
    skyG.addColorStop(1.0, '#0d332a');
    bctx.fillStyle = skyG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y + 4);

    // Volumetric emerald-gold central alignment aura behind the bridge crest
    const auraG = bctx.createRadialGradient(500, 560, 30, 500, 520, 520);
    auraG.addColorStop(0.0, 'rgba(16, 185, 129, 0.24)');
    auraG.addColorStop(0.45, 'rgba(52, 211, 153, 0.09)');
    auraG.addColorStop(0.75, 'rgba(251, 191, 36, 0.04)');
    auraG.addColorStop(1.0, 'rgba(7, 23, 20, 0)');
    bctx.fillStyle = auraG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // Subtle atmospheric coordinate grid & distant stars
    bctx.strokeStyle = 'rgba(52, 211, 153, 0.045)';
    bctx.lineWidth = 1;
    for (let gx = 50; gx < w; gx += 50) {
      bctx.beginPath();
      bctx.moveTo(gx, 0);
      bctx.lineTo(gx, ROAD_EDGE_Y);
      bctx.stroke();
    }
    for (let gy = 50; gy < ROAD_EDGE_Y; gy += 50) {
      bctx.beginPath();
      bctx.moveTo(0, gy);
      bctx.lineTo(w, gy);
      bctx.stroke();
    }

    for (let i = 0; i < 120; i++) {
      const sx = rng() * w;
      const sy = rng() * 430;
      const sr = 0.6 + rng() * 1.4;
      bctx.fillStyle =
        rng() > 0.35
          ? `rgba(167, 243, 208, ${(0.18 + rng() * 0.42).toFixed(2)})`
          : `rgba(251, 191, 36, ${(0.22 + rng() * 0.45).toFixed(2)})`;
      bctx.beginPath();
      bctx.arc(sx, sy, sr, 0, Math.PI * 2);
      bctx.fill();
    }

    // 2. Distant & Midground Emerald-Gold Night Cityscape across the Digital River
    const drawTowerBlock = (bx, topY, bw, baseBotY, bodyCol, trimCol, winDensity = 0.55) => {
      bctx.fillStyle = bodyCol;
      bctx.fillRect(bx, topY, bw, baseBotY - topY);
      bctx.strokeStyle = trimCol;
      bctx.lineWidth = 1.1;
      bctx.strokeRect(bx + 0.5, topY + 0.5, bw - 1, baseBotY - topY - 1);

      // Rooftop spire / beacon
      if (bw > 24 && rng() > 0.35) {
        const spX = bx + bw * (0.35 + rng() * 0.3);
        const spH = 12 + rng() * 26;
        bctx.strokeStyle = trimCol;
        bctx.lineWidth = 1.4;
        bctx.beginPath();
        bctx.moveTo(spX, topY);
        bctx.lineTo(spX, topY - spH);
        bctx.stroke();
        bctx.fillStyle = rng() > 0.4 ? PAL.emeraldBright : PAL.gold;
        bctx.beginPath();
        bctx.arc(spX, topY - spH, 1.8, 0, Math.PI * 2);
        bctx.fill();
      }

      // Crisp architectural window matrix
      const cols = Math.max(2, Math.floor((bw - 8) / 8));
      const rows = Math.max(3, Math.floor((baseBotY - topY - 14) / 9));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (rng() > winDensity) continue;
          const wx = bx + 5 + c * ((bw - 10) / cols);
          const wy = topY + 7 + r * 8.5;
          const warm = rng() > 0.48;
          bctx.fillStyle = warm
            ? `rgba(251, 191, 36, ${(0.22 + rng() * 0.52).toFixed(2)})`
            : `rgba(52, 211, 153, ${(0.18 + rng() * 0.44).toFixed(2)})`;
          bctx.fillRect(wx, wy, 3.8, 2.6);
        }
      }
    };

    // Far misty skyline across river center (x = 180..820)
    for (let x = 170; x < 825; x += 26 + Math.floor(rng() * 18)) {
      const bw = 24 + Math.floor(rng() * 26);
      const distCenter = Math.abs(x + bw * 0.5 - 500) / 360;
      const bh = 75 + distCenter * 95 + rng() * 65;
      drawTowerBlock(
        x,
        ROAD_EDGE_Y - 26 - bh,
        bw,
        ROAD_EDGE_Y - 18,
        'rgba(6, 28, 23, 0.86)',
        'rgba(16, 185, 129, 0.22)',
        0.38
      );
    }

    // Left-bank & Right-bank prominent riverside cyber-pavilions & high-rises
    const nearTowers = [
      [6, 368, 56],
      [54, 336, 66],
      [112, 392, 58],
      [164, 428, 54],
      [212, 468, 48],
      [740, 462, 50],
      [784, 418, 58],
      [836, 354, 68],
      [898, 326, 62],
      [952, 376, 52],
    ];
    for (const [bx, topY, bw] of nearTowers) {
      drawTowerBlock(
        bx,
        topY,
        bw,
        ROAD_EDGE_Y,
        '#061c17',
        'rgba(52, 211, 153, 0.42)',
        0.52
      );
      // Warm stepped eave accent line echoing riverside pavilions in modern glass-tech form
      bctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
      bctx.lineWidth = 1.8;
      bctx.beginPath();
      bctx.moveTo(bx - 3, topY + 2);
      bctx.lineTo(bx + bw + 3, topY + 2);
      bctx.stroke();
    }

    // 3. Dark Digital Data River Basin (y = 680..1000)
    const riverG = bctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
    riverG.addColorStop(0.0, '#041411');
    riverG.addColorStop(0.28, '#061f1a');
    riverG.addColorStop(0.72, '#04120f');
    riverG.addColorStop(1.0, '#020807');
    bctx.fillStyle = riverG;
    bctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

    // Inverted soft architectural & bridge arch reflections in the river
    for (const [bx, topY, bw] of nearTowers) {
      const reflH = Math.min(240, (ROAD_EDGE_Y - topY) * 0.65);
      const rg = bctx.createLinearGradient(0, ROAD_EDGE_Y, 0, ROAD_EDGE_Y + reflH);
      rg.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
      rg.addColorStop(0.5, 'rgba(251, 191, 36, 0.08)');
      rg.addColorStop(1, 'rgba(4, 18, 15, 0)');
      bctx.fillStyle = rg;
      bctx.fillRect(bx, ROAD_EDGE_Y + 2, bw, reflH);
    }

    // Inverted Rainbow Bridge reflection arc in water (crests downward to 680 + 56 = 736)
    bctx.save();
    bctx.strokeStyle = 'rgba(16, 185, 129, 0.24)';
    bctx.lineWidth = 12;
    bctx.beginPath();
    for (let x = 0; x <= w; x += 12) {
      const rd = kit.sampleRoad(x, ARCH_H);
      const ry = ROAD_EDGE_Y + (ROAD_EDGE_Y - rd.y) * 1.15 + 14;
      if (x === 0) bctx.moveTo(x, ry);
      else bctx.lineTo(x, ry);
    }
    bctx.stroke();

    bctx.strokeStyle = 'rgba(251, 191, 36, 0.18)';
    bctx.lineWidth = 4;
    bctx.beginPath();
    for (let x = 40; x <= w - 40; x += 12) {
      const rd = kit.sampleRoad(x, ARCH_H);
      const ry = ROAD_EDGE_Y + (ROAD_EDGE_Y - rd.y) * 1.35 + 26;
      if (x === 40) bctx.moveTo(x, ry);
      else bctx.lineTo(x, ry);
    }
    bctx.stroke();
    bctx.restore();

    // Subtle horizontal river data scanlines
    for (let y = ROAD_EDGE_Y + 6; y < h; y += 6) {
      const alpha = 0.04 + 0.05 * Math.sin(y * 0.15);
      bctx.strokeStyle = `rgba(52, 211, 153, ${alpha.toFixed(3)})`;
      bctx.lineWidth = 1;
      bctx.beginPath();
      bctx.moveTo(0, y);
      bctx.lineTo(w, y);
      bctx.stroke();
    }

    // 4. Luminous Arched Alignment Data Rainbow Bridge (`kit.sampleRoad(x, 56)`)
    // Left & right bank abutment quays anchored cleanly at y = 680
    bctx.fillStyle = '#07241d';
    bctx.fillRect(0, ROAD_EDGE_Y - 2, 118, 34);
    bctx.fillRect(w - 118, ROAD_EDGE_Y - 2, 118, 34);
    bctx.strokeStyle = PAL.emerald;
    bctx.lineWidth = 2;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y);
    bctx.lineTo(118, ROAD_EDGE_Y);
    bctx.moveTo(w - 118, ROAD_EDGE_Y);
    bctx.lineTo(w, ROAD_EDGE_Y);
    bctx.stroke();

    // Woven photonic truss ribs under the bridge deck (modern tribute to pierless woven-arch rainbow bridge)
    const lowerY = (x) => {
      const u = clamp((x - 85) / (w - 170), 0, 1);
      return ROAD_EDGE_Y + 18 - 68 * Math.sin(Math.PI * u);
    };

    // Translucent emerald energy web between upper road curve and lower vault arch
    const bridgeGrad = bctx.createLinearGradient(80, 620, w - 80, 620);
    bridgeGrad.addColorStop(0.0, 'rgba(6, 78, 59, 0.55)');
    bridgeGrad.addColorStop(0.3, 'rgba(16, 185, 129, 0.35)');
    bridgeGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.28)');
    bridgeGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.35)');
    bridgeGrad.addColorStop(1.0, 'rgba(6, 78, 59, 0.55)');

    bctx.fillStyle = bridgeGrad;
    bctx.beginPath();
    for (let x = 65; x <= w - 65; x += 10) {
      const rd = kit.sampleRoad(x, ARCH_H);
      if (x === 65) bctx.moveTo(x, rd.y);
      else bctx.lineTo(x, rd.y);
    }
    for (let x = w - 65; x >= 65; x -= 10) {
      bctx.lineTo(x, lowerY(x));
    }
    bctx.closePath();
    bctx.fill();

    // Crisscrossing woven alignment trajectory ribs
    const numSegs = 22;
    for (let i = 0; i < numSegs; i++) {
      const x0 = lerp(80, w - 80, i / numSegs);
      const x1 = lerp(80, w - 80, (i + 1) / numSegs);
      const yTop0 = kit.sampleRoad(x0, ARCH_H).y;
      const yTop1 = kit.sampleRoad(x1, ARCH_H).y;
      const yBot0 = lowerY(x0);
      const yBot1 = lowerY(x1);

      bctx.strokeStyle = i % 2 === 0 ? 'rgba(52, 211, 153, 0.62)' : 'rgba(251, 191, 36, 0.48)';
      bctx.lineWidth = 1.6;
      bctx.beginPath();
      bctx.moveTo(x0, yTop0);
      bctx.lineTo(x1, yBot1);
      bctx.moveTo(x0, yBot0);
      bctx.lineTo(x1, yTop1);
      bctx.stroke();

      // Vertical node strut
      bctx.strokeStyle = 'rgba(236, 253, 245, 0.35)';
      bctx.lineWidth = 1.1;
      bctx.beginPath();
      bctx.moveTo(x0, yTop0);
      bctx.lineTo(x0, yBot0);
      bctx.stroke();
    }

    // Lower structural vault chord
    bctx.strokeStyle = PAL.emeraldBright;
    bctx.lineWidth = 2.6;
    bctx.beginPath();
    for (let x = 75; x <= w - 75; x += 8) {
      const ly = lowerY(x);
      if (x === 75) bctx.moveTo(x, ly);
      else bctx.lineTo(x, ly);
    }
    bctx.stroke();

    // Multi-band Rainbow Alignment Deck (`sampleRoad(x, 56)`)
    const bands = [
      { dy: 8, w: 4.5, col: 'rgba(16, 185, 129, 0.40)' },
      { dy: 4, w: 2.5, col: 'rgba(251, 191, 36, 0.72)' },
      { dy: 0, w: 3.6, col: PAL.emeraldBright },
      { dy: -1.5, w: 1.4, col: PAL.mintIce },
    ];
    for (const b of bands) {
      bctx.strokeStyle = b.col;
      bctx.lineWidth = b.w;
      bctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const rd = kit.sampleRoad(x, ARCH_H);
        if (x === 0) bctx.moveTo(x, rd.y + b.dy);
        else bctx.lineTo(x, rd.y + b.dy);
      }
      bctx.stroke();
    }
  }, PANEL_SIZE, PANEL_SIZE);
}

function drawRiverShimmer(ctx, kit, t, rx) {
  ctx.save();
  // Animated emerald & warm gold token ripples across the digital river (y = 688..985)
  for (let row = 0; row < 18; row++) {
    const v = row / 17;
    const y = lerp(ROAD_EDGE_Y + 10, PANEL_SIZE - 16, v * v * 0.65 + v * 0.35);
    const archSpan = lerp(410, 260, v);
    const numRipples = 5;
    for (let k = 0; k < numRipples; k++) {
      const phase = t * (0.9 + (row % 3) * 0.25) + row * 1.37 + k * 1.25;
      const cx = 500 + Math.sin(phase) * archSpan;
      const rw = (22 + 18 * Math.cos(phase * 1.3)) * (1 + v * 0.7);
      const nearRider = Math.exp(-Math.pow((cx - rx) / 150, 2));
      const isGold = (row + k) % 3 === 0 || nearRider > 0.45;
      ctx.strokeStyle = isGold
        ? `rgba(251, 191, 36, ${(0.16 + nearRider * 0.38).toFixed(2)})`
        : `rgba(52, 211, 153, ${(0.14 + nearRider * 0.28).toFixed(2)})`;
      ctx.lineWidth = 1.4 + v * 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - rw, y);
      ctx.lineTo(cx + rw, y);
      ctx.stroke();
    }
  }

  // Shimmering reflection pillar directly beneath Agent-01 on the water
  if (rx > -80 && rx < PANEL_SIZE + 80) {
    const rd = kit.sampleRoad(clamp(rx, 0, PANEL_SIZE), ARCH_H);
    const archLift = ROAD_EDGE_Y - rd.y;
    const refY = ROAD_EDGE_Y + 12 + archLift * 1.15;
    const rg = ctx.createRadialGradient(rx, refY, 4, rx, refY, 96);
    rg.addColorStop(0.0, 'rgba(251, 191, 36, 0.34)');
    rg.addColorStop(0.45, 'rgba(52, 211, 153, 0.18)');
    rg.addColorStop(1.0, 'rgba(7, 23, 20, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(rx - 100, ROAD_EDGE_Y + 2, 200, 175);
  }
  ctx.restore();
}

function drawAwakenedCityWindows(ctx, rx, t) {
  ctx.save();
  // Windows brighten progressively from left to right as the rider crosses the bridge ("一路点亮万家灯火")
  for (let i = 0; i < DYNAMIC_CITY_WINDOWS.length; i++) {
    const win = DYNAMIC_CITY_WINDOWS[i];
    const lit = smoothstep(win.x - 160, win.x + 40, rx);
    if (lit < 0.04) continue;
    const twinkle = 0.78 + 0.22 * Math.sin(t * 4.2 + win.phase);
    const alpha = lit * twinkle * 0.88;
    ctx.fillStyle = win.isGold
      ? `rgba(251, 191, 36, ${alpha.toFixed(2)})`
      : `rgba(52, 211, 153, ${alpha.toFixed(2)})`;
    ctx.fillRect(win.x, win.y, win.w, win.h);
  }
  ctx.restore();
}

function drawFloatingChatCards(ctx, localT, t, rx) {
  const cursorVisible = Math.sin(t * Math.PI * 4.0) > -0.15;

  ctx.save();
  for (let idx = 0; idx < CHAT_CARDS.length; idx++) {
    const card = CHAT_CARDS[idx];
    const bob = Math.sin(t * 1.7 + idx * 1.3) * 4.5;
    const cx = card.x;
    const cy = card.y + bob;

    // Stream progress driven by both localT and rider proximity
    const timeProg = clamp((localT - card.startT) / 1.9, 0.12, 1.0);
    const riderBoost = smoothstep(cx - 120, cx + card.w, rx) * 0.35;
    const streamProg = clamp(timeProg + riderBoost, 0.15, 1.0);
    const alignedGlow = smoothstep(0.75, 1.0, streamProg);

    // Translucent frosted emerald glass body
    drawRoundedRectPath(ctx, cx, cy, card.w, card.h, 11);
    ctx.fillStyle = 'rgba(7, 26, 22, 0.74)';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle =
      alignedGlow > 0.5
        ? `rgba(251, 191, 36, ${(0.45 + alignedGlow * 0.35).toFixed(2)})`
        : 'rgba(52, 211, 153, 0.48)';
    ctx.stroke();

    // Header strip: Emerald AI avatar dot + Role tag + Golden RLHF reward badge
    ctx.fillStyle = PAL.emerald;
    ctx.beginPath();
    ctx.arc(cx + 15, cy + 16, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(167, 243, 208, 0.85)';
    ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(card.role, cx + 26, cy + 16);

    if (alignedGlow > 0.05) {
      const badgeW = 46;
      const bx = cx + card.w - badgeW - 9;
      const by = cy + 8;
      drawRoundedRectPath(ctx, bx, by, badgeW, 16, 8);
      ctx.fillStyle = `rgba(251, 191, 36, ${(0.18 * alignedGlow).toFixed(2)})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(251, 191, 36, ${(0.75 * alignedGlow).toFixed(2)})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.fillStyle = `rgba(253, 230, 138, ${alignedGlow.toFixed(2)})`;
      ctx.font = '700 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★${card.reward}`, bx + badgeW * 0.5, by + 8.5);
    }

    // User prompt bars (warm gold-tinted human query)
    let py = cy + 31;
    const innerW = card.w - 26;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.34)';
    let px = cx + 13;
    for (const pw of card.promptW) {
      const bw = pw * innerW * 0.62;
      drawRoundedRectPath(ctx, px, py, bw, 5.5, 2.5);
      ctx.fill();
      px += bw + 6;
    }

    // Divider line
    py += 12;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + 12, py);
    ctx.lineTo(cx + card.w - 12, py);
    ctx.stroke();

    // Streaming AI Assistant token bars + blinking emerald cursor `▋`
    const totalSegs = card.replyRows.reduce((acc, r) => acc + r.length, 0);
    const activeTokens = streamProg * totalSegs;
    let segIndex = 0;
    let cursorX = cx + 13;
    let cursorY = py + 8;

    for (let r = 0; r < card.replyRows.length; r++) {
      const row = card.replyRows[r];
      const ry = py + 8 + r * 14;
      let tx = cx + 13;
      for (let s = 0; s < row.length; s++) {
        const fillFrac = clamp(activeTokens - segIndex, 0, 1);
        segIndex++;
        if (fillFrac <= 0.01) break;
        const fullSegW = row[s] * innerW;
        const curW = fullSegW * fillFrac;
        ctx.fillStyle =
          s % 2 === 0 ? 'rgba(52, 211, 153, 0.86)' : 'rgba(16, 185, 129, 0.68)';
        drawRoundedRectPath(ctx, tx, ry, Math.max(3, curW), 6.5, 3);
        ctx.fill();
        tx += curW + 6;
        cursorX = tx;
        cursorY = ry;
      }
    }

    // Blinking Emerald Block Cursor `▋`
    if (cursorVisible) {
      ctx.fillStyle = PAL.emeraldBright;
      ctx.fillRect(Math.min(cx + card.w - 18, cursorX), cursorY - 1.5, 6.5, 9.5);
      ctx.fillStyle = 'rgba(236, 253, 245, 0.75)';
      ctx.fillRect(Math.min(cx + card.w - 18, cursorX) + 1, cursorY - 0.5, 2.2, 7.5);
    }
  }
  ctx.restore();
}

function drawRisingRewardStars(ctx, kit, t, rx) {
  ctx.save();
  for (let i = 0; i < REWARD_STARS.length; i++) {
    const st = REWARD_STARS[i];
    // Stars awaken powerfully once the rider approaches or passes their X coordinate, with ambient baseline shimmer
    const wake = Math.max(0.28, smoothstep(st.baseX - 180, st.baseX + 30, rx));
    const u = (t * st.speed + st.phase) % 1.0;
    const fade = Math.sin(Math.PI * u);
    const alpha = wake * fade;
    if (alpha < 0.05) continue;

    const rd = kit.sampleRoad(st.baseX, ARCH_H);
    const sx = st.baseX + Math.sin(t * st.swayFreq + i) * st.swayAmp * u;
    const sy = rd.y - 16 - u * st.riseSpan;
    const r = st.size * (0.72 + 0.45 * wake);

    // Soft lantern halo
    const hg = ctx.createRadialGradient(sx, sy, 1, sx, sy, r * 3.1);
    hg.addColorStop(0.0, `rgba(251, 191, 36, ${(alpha * 0.55).toFixed(2)})`);
    hg.addColorStop(0.5, `rgba(16, 185, 129, ${(alpha * 0.18).toFixed(2)})`);
    hg.addColorStop(1.0, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(sx, sy, r * 3.1, 0, Math.PI * 2);
    ctx.fill();

    // Crisp 4-point RLHF golden reward star
    drawFourPointStar(ctx, sx, sy, r * 1.25, r * 0.42, t * 0.6 + i * 0.5);
    ctx.fillStyle = `rgba(251, 191, 36, ${(alpha * 0.95).toFixed(2)})`;
    ctx.fill();

    drawFourPointStar(ctx, sx, sy, r * 0.65, r * 0.24, t * 0.6 + i * 0.5);
    ctx.fillStyle = `rgba(254, 249, 195, ${alpha.toFixed(2)})`;
    ctx.fill();

    // Subtle rising alignment filament beneath lantern star
    ctx.strokeStyle = `rgba(251, 191, 36, ${(alpha * 0.35).toFixed(2)})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(sx, sy + r * 1.1);
    ctx.lineTo(sx - Math.sin(t * st.swayFreq + i) * 3, sy + r * 1.1 + 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBridgeParapetPosts(ctx, kit, rx, isFront) {
  ctx.save();
  const yOffset = isFront ? 5 : -7;
  const postH = isFront ? 19 : 16;
  const startX = isFront ? 86 : 72;
  const stepX = 56;

  // Continuous luminous parapet rail
  ctx.strokeStyle = isFront ? 'rgba(52, 211, 153, 0.62)' : 'rgba(16, 185, 129, 0.38)';
  ctx.lineWidth = isFront ? 1.8 : 1.3;
  ctx.beginPath();
  for (let x = startX; x <= PANEL_SIZE - startX; x += 14) {
    const rd = kit.sampleRoad(x, ARCH_H);
    const py = rd.y + yOffset - postH + 4;
    if (x === startX) ctx.moveTo(x, py);
    else ctx.lineTo(x, py);
  }
  ctx.stroke();

  for (let x = startX; x <= PANEL_SIZE - startX; x += stepX) {
    const rd = kit.sampleRoad(x, ARCH_H);
    const baseY = rd.y + yOffset;
    const topY = baseY - postH;
    const lit = smoothstep(x - 95, x + 15, rx);

    ctx.strokeStyle = isFront ? '#065f46' : 'rgba(6, 95, 70, 0.75)';
    ctx.lineWidth = isFront ? 3.8 : 2.8;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, topY);
    ctx.stroke();

    ctx.fillStyle = lit > 0.35 ? PAL.gold : PAL.emeraldBright;
    ctx.beginPath();
    ctx.arc(x, topY - 1.5, isFront ? 3.1 : 2.4, 0, Math.PI * 2);
    ctx.fill();

    if (lit > 0.35) {
      ctx.fillStyle = `rgba(251, 191, 36, ${(lit * 0.28).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(x, topY - 1.5, isFront ? 8.5 : 6.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawRiderBridgeWake(ctx, kit, rx, t) {
  if (rx < -40 || rx > PANEL_SIZE + 160) return;
  ctx.save();
  const trailStart = clamp(rx - 220, 0, PANEL_SIZE);
  const trailEnd = clamp(rx + 24, 0, PANEL_SIZE);
  if (trailEnd > trailStart + 4) {
    const tg = ctx.createLinearGradient(trailStart, 0, trailEnd, 0);
    tg.addColorStop(0.0, 'rgba(16, 185, 129, 0)');
    tg.addColorStop(0.65, 'rgba(52, 211, 153, 0.65)');
    tg.addColorStop(1.0, 'rgba(251, 191, 36, 0.95)');
    ctx.strokeStyle = tg;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    for (let x = trailStart; x <= trailEnd; x += 6) {
      const rd = kit.sampleRoad(x, ARCH_H);
      if (x === trailStart) ctx.moveTo(x, rd.y - 1);
      else ctx.lineTo(x, rd.y - 1);
    }
    ctx.stroke();

    // Streaming emerald token cursor blocks trailing behind rear wheel
    for (let k = 1; k <= 7; k++) {
      const tx = rx - 88 - k * 22 - ((t * 90) % 22);
      if (tx < 0 || tx > PANEL_SIZE) continue;
      const rd = kit.sampleRoad(tx, ARCH_H);
      const a = clamp(1 - k / 7.5, 0, 1) * 0.82;
      ctx.save();
      ctx.translate(tx, rd.y - 10 - (k % 2) * 5);
      ctx.rotate(rd.slope);
      ctx.fillStyle = k % 2 === 0 ? `rgba(52, 211, 153, ${a})` : `rgba(251, 191, 36, ${a})`;
      ctx.fillRect(-4, -5, 7, 9);
      ctx.restore();
    }
  }
  ctx.restore();
}

export function render(kit, slot, scene, params) {
  const {
    localT = 0,
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

  // 1. Static Baked Emerald-Jade Cityscape, Digital River & Luminous Arched Data Rainbow Bridge
  const bg = getBakedAlignmentCity(kit);
  if (bg && bg.canvas) {
    ctx.drawImage(bg.canvas, 0, 0);
  }

  const rx = pelicanLocalX;
  const beatPulse = clamp(sync?.pulse ?? (1 - ((t * 2) % 1)), 0, 1);

  // 2. Dynamic Awakened City Windows & Shimmering River Reflections
  drawAwakenedCityWindows(ctx, isOutroThumbnail ? 720 : rx, t);
  drawRiverShimmer(ctx, kit, t, rx);

  // 3. Floating Translucent Glass Chat Cards with Streaming Tokens & Blinking Emerald Cursor `▋`
  drawFloatingChatCards(ctx, isOutroThumbnail ? 3.2 : localT, t, isOutroThumbnail ? 650 : rx);

  // 4. Rising Golden RLHF Human-Feedback Reward Stars & Back Bridge Parapet
  drawRisingRewardStars(ctx, kit, t, isOutroThumbnail ? 680 : rx);
  drawBridgeParapetPosts(ctx, kit, isOutroThumbnail ? 680 : rx, false);

  // 5. Cyber-Rider (`硅基领航员 Agent-01`) crossing the Arched Alignment Data Bridge (`archH = 56`)
  if (!hidePelican && rx >= -260 && rx <= 1260) {
    drawRiderBridgeWake(ctx, kit, rx, t);
    const road = kit.sampleRoad(rx, ARCH_H);
    const rig = computePelicanRig({
      x: rx,
      y: road.y,
      slope: road.slope,
      pedalAngle,
      speedScale: speedScale + beatPulse * 0.04,
      time: t,
    });
    drawRig2D(ctx, rig, {
      featherFill: '#ecfdf5',
      featherShade: '#a7f3d0',
      wingTipDark: '#064e3b',
      beakFill: '#34d399',
      pouchFill: '#fbbf24',
      legFill: '#d1fae5',
      frameStroke: '#10b981',
      metalStroke: '#6ee7b7',
      tireStroke: '#042f2e',
      inkOutline: '#03120e',
      glowColor: '#34d399',
      halo: true,
      scanBeam: true,
    });
  }

  // 6. Foreground Bridge Parapet Posts for 3D Depth
  drawBridgeParapetPosts(ctx, kit, isOutroThumbnail ? 680 : rx, true);

  // 7. Optional Outro Thumbnail Title Bar
  if (isOutroThumbnail && scene) {
    ctx.fillStyle = 'rgba(4, 14, 12, 0.82)';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 92);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 92);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 92);
    ctx.stroke();
    ctx.fillStyle = '#ecfdf5';
    ctx.font = '700 42px system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} · ${scene.zh}`, 34, PANEL_SIZE - 46);
  }

  ctx.restore();
}
