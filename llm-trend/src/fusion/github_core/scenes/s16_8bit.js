// src/fusion/github_core/scenes/s16_8bit.js
// Scene 16 · 端侧智能与随身算力 (2026 · On-Device NPU & Pocket Silicon City)
// Crisp pixel-art / isometric silicon wafer micro-city with gold wire-bond bridges,
// NPU tensor-core pixel skyscrapers, offline smart-glasses & pocket NPU icons,
// and a playful parabolic hop over a silicon bus gap collecting an INT4/0ms core (+40 TOPS)!

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

const PX = 4; // Crisp 4px pixel-art snap unit on 1000x1000 canvas
const GAP_X0 = 468;
const GAP_X1 = 572;
const CORE_X = 520;
const CORE_Y = 556;

const PAL = {
  bgDeep: '#111633',
  bgMid: '#18204a',
  substrate: '#1e2559',
  dieBody: '#151b3d',
  dieTop: '#273169',
  dieSide: '#0d1129',
  gold: '#facc15',
  goldBright: '#fef08a',
  goldShadow: '#ca8a04',
  cyan: '#38bdf8',
  cyanDeep: '#0284c7',
  pink: '#f472b6',
  pinkDeep: '#be185d',
  green: '#4ade80',
  greenDeep: '#15803d',
  white: '#f8fafc',
  dark: '#080b1a',
};

const SKYLINE_TOWERS = [
  { x: 28, w: 108, topY: 312, isoD: 24, label: 'DSP-LP', accent: PAL.cyan, rows: 9, cols: 4 },
  { x: 152, w: 132, topY: 248, isoD: 28, label: 'NPU-01', accent: PAL.gold, rows: 11, cols: 5 },
  { x: 304, w: 124, topY: 284, isoD: 24, label: 'SRAM-8M', accent: PAL.pink, rows: 10, cols: 4 },
  { x: 596, w: 136, topY: 236, isoD: 28, label: 'INT4-CORE', accent: PAL.green, rows: 11, cols: 5 },
  { x: 752, w: 116, topY: 292, isoD: 24, label: 'LPDDR6', accent: PAL.cyan, rows: 9, cols: 4 },
  { x: 884, w: 96, topY: 332, isoD: 20, label: 'PMIC', accent: PAL.gold, rows: 8, cols: 3 },
];

function snap(v) {
  return Math.round(v / PX) * PX;
}

function pRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(snap(x), snap(y), Math.max(PX, snap(w)), Math.max(PX, snap(h)));
}

function drawPixelArcWireBond(ctx, x0, y0, x1, y1, apexLift) {
  const steps = Math.max(16, Math.round(Math.abs(x1 - x0) / PX));
  // Bond pads at both ends
  pRect(ctx, x0 - 6, y0 - 4, 12, 8, PAL.goldShadow);
  pRect(ctx, x0 - 4, y0 - 4, 8, 4, PAL.goldBright);
  pRect(ctx, x1 - 6, y1 - 4, 12, 8, PAL.goldShadow);
  pRect(ctx, x1 - 4, y1 - 4, 8, 4, PAL.goldBright);

  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const px = lerp(x0, x1, u);
    const py = lerp(y0, y1, u) - Math.sin(Math.PI * u) * apexLift;
    pRect(ctx, px, py + PX, PX, PX, PAL.goldShadow);
    pRect(ctx, px, py, PX, PX, u > 0.32 && u < 0.68 ? PAL.goldBright : PAL.gold);
  }
}

function drawIsometricPixelTower(ctx, t, rng) {
  const { x, w, topY, isoD, accent } = t;
  const h = ROAD_EDGE_Y - topY;

  // Isometric right 3D extrusion face
  for (let step = 0; step < isoD; step += PX) {
    const sy = topY - step * 0.5;
    pRect(ctx, x + w + step, sy, PX, ROAD_EDGE_Y - sy, PAL.dieSide);
  }

  // Isometric top silicon die roof bevel
  for (let step = 0; step <= isoD; step += PX) {
    const sy = topY - step * 0.5;
    pRect(ctx, x + step, sy, w, PX, step === isoD ? accent : PAL.dieTop);
  }

  // Rooftop micro-fin heatsink + pin beacon
  for (let fx = x + 16; fx < x + w - 16; fx += 16) {
    pRect(ctx, fx + isoD * 0.5, topY - isoD * 0.5 - 12, 8, 12, '#312e81');
    pRect(ctx, fx + isoD * 0.5, topY - isoD * 0.5 - 16, 8, 4, accent);
  }

  // Main front IC package body
  pRect(ctx, x, topY, w, h, PAL.dieBody);
  // Crisp pixel bevel outline
  pRect(ctx, x, topY, w, PX, accent);
  pRect(ctx, x, topY, PX, h, '#312e81');
  pRect(ctx, x + w - PX, topY, PX, h, PAL.dark);

  // Gull-wing silver/gold IC pins along ground socket
  for (let px = x + 8; px < x + w - 8; px += 12) {
    pRect(ctx, px, ROAD_EDGE_Y - 16, 6, 16, '#94a3b8');
    pRect(ctx, px, ROAD_EDGE_Y - 4, 8, 4, PAL.gold);
  }

  // Decorative etched PCB vertical bus lines inside package
  for (let k = 0; k < 4; k++) {
    const tx = snap(x + 12 + rng() * (w - 24));
    const ty0 = snap(topY + 36 + rng() * 80);
    pRect(ctx, tx, ty0, PX, ROAD_EDGE_Y - 24 - ty0, '#1e293b');
  }
}

function getWaferCityBackdrop(kit) {
  return kit.bake2D(
    's16_npu_wafer_city_v1',
    (_g, ctx, rng, w, h) => {
      ctx.imageSmoothingEnabled = false;

      // 1. Deep Silicon Wafer Night Sky (#111633 -> #1a2254 pixel-stepped bands)
      ctx.fillStyle = PAL.bgDeep;
      ctx.fillRect(0, 0, w, h);

      const bayer2 = [
        [0, 2],
        [3, 1],
      ];
      for (let py = 360; py < ROAD_EDGE_Y; py += PX) {
        const u = (py - 360) / (ROAD_EDGE_Y - 360);
        for (let px = 0; px < w; px += PX) {
          const th = (bayer2[(py >> 2) & 1][(px >> 2) & 1] + 0.5) / 4;
          if (u * 0.9 > th) {
            ctx.fillStyle = u > 0.68 && th < 0.4 ? '#232d6b' : PAL.bgMid;
            ctx.fillRect(px, py, PX, PX);
          }
        }
      }

      // 2. Giant 300mm Silicon Wafer Lithography Reticle Rings & Die-Stepper Grid
      const wcx = 500;
      const wcy = 340;
      for (const rad of [180, 284, 388]) {
        const segs = Math.round(rad * 1.4);
        for (let i = 0; i < segs; i++) {
          if (i % 3 === 0) continue;
          const a = (i / segs) * Math.PI * 2;
          const rx = snap(wcx + Math.cos(a) * rad);
          const ry = snap(wcy + Math.sin(a) * rad);
          if (ry > 56 && ry < ROAD_EDGE_Y - 8) {
            ctx.fillStyle = rad === 284 ? 'rgba(250, 204, 21, 0.22)' : 'rgba(56, 189, 248, 0.16)';
            ctx.fillRect(rx, ry, PX, PX);
          }
        }
      }

      // Lithography alignment '+' crosshairs & pixel star nodes
      for (let gx = 100; gx <= 900; gx += 160) {
        for (let gy = 96; gy <= 416; gy += 120) {
          pRect(ctx, gx - 4, gy, 12, PX, 'rgba(56, 189, 248, 0.24)');
          pRect(ctx, gx, gy - 4, PX, 12, 'rgba(56, 189, 248, 0.24)');
        }
      }
      for (let i = 0; i < 42; i++) {
        const sx = snap(rng() * w);
        const sy = snap(64 + rng() * 260);
        const col = i % 5 === 0 ? PAL.gold : i % 3 === 0 ? PAL.cyan : '#64748b';
        pRect(ctx, sx, sy, PX, PX, col);
      }

      // 3. Distant Wafer Die Silhouette Skyline
      const bgBlocks = [
        [0, 420, 92],
        [96, 384, 88],
        [268, 396, 96],
        [376, 356, 92],
        [472, 412, 116],
        [712, 372, 92],
        [828, 396, 92],
        [924, 428, 80],
      ];
      for (const [bx, by, bw] of bgBlocks) {
        pRect(ctx, bx, by, bw, ROAD_EDGE_Y - by, '#141a3f');
        pRect(ctx, bx, by, bw, PX, '#2a3575');
        for (let wy = by + 16; wy < ROAD_EDGE_Y - 24; wy += 20) {
          for (let wx = bx + 12; wx < bx + bw - 16; wx += 16) {
            if (rng() > 0.55) {
              pRect(ctx, wx, wy, 6, 6, rng() > 0.5 ? 'rgba(56, 189, 248, 0.28)' : 'rgba(244, 114, 182, 0.25)');
            }
          }
        }
      }

      // 4. Midground Isometric NPU Tensor-Core Skyscrapers
      for (const tower of SKYLINE_TOWERS) {
        drawIsometricPixelTower(ctx, tower, rng);

        // Package laser-etched header band
        ctx.fillStyle = tower.accent;
        ctx.font = '700 11px "PelicanMono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(tower.label, tower.x + tower.w * 0.5, tower.topY + 10);
      }

      // 5. 24K Gold Wire-Bond Bridges arching across IC packages & central bus trench
      drawPixelArcWireBond(ctx, 96, 312, 196, 248, 48);
      drawPixelArcWireBond(ctx, 248, 248, 356, 284, 52);
      drawPixelArcWireBond(ctx, 396, 284, 636, 236, 96); // Grand gold wire-bond spanning bus gap!
      drawPixelArcWireBond(ctx, 416, 308, 616, 268, 76);
      drawPixelArcWireBond(ctx, 704, 236, 796, 292, 48);
      drawPixelArcWireBond(ctx, 840, 292, 924, 332, 40);

      // 6. Ground Silicon Interposer Highway (`y = ROAD_EDGE_Y = 680` .. `1000`)
      const buildInterposerDeck = (x0, x1) => {
        const dw = x1 - x0;
        // Sub-surface multi-layer PCB & silicon substrate
        pRect(ctx, x0, ROAD_EDGE_Y, dw, h - ROAD_EDGE_Y, '#0d132b');
        pRect(ctx, x0, ROAD_EDGE_Y + 12, dw, 28, '#152246');
        pRect(ctx, x0, ROAD_EDGE_Y + 40, dw, 4, PAL.cyanDeep);

        // Exact y = 680 crisp gold/emerald top bus trace!
        pRect(ctx, x0, ROAD_EDGE_Y, dw, PX, PAL.gold);
        pRect(ctx, x0, ROAD_EDGE_Y + PX, dw, PX, PAL.green);
        pRect(ctx, x0, ROAD_EDGE_Y + PX * 2, dw, PX, '#134e4a');

        // Gold contact fingers every 24px right below road edge
        for (let fx = x0 + 8; fx < x1 - 12; fx += 24) {
          pRect(ctx, fx, ROAD_EDGE_Y + 16, 10, 18, PAL.gold);
          pRect(ctx, fx, ROAD_EDGE_Y + 16, 10, 4, PAL.goldBright);
        }

        // Copper & optical PCB routing traces + plated through-hole vias (`y = 736..980`)
        const traceColors = [PAL.cyan, PAL.pink, PAL.green, PAL.gold];
        for (let row = 0; row < 6; row++) {
          const ry = ROAD_EDGE_Y + 64 + row * 40;
          const col = traceColors[row % traceColors.length];
          pRect(ctx, x0, ry, dw, PX, 'rgba(30, 41, 82, 0.95)');
          for (let segX = x0 + 16; segX < x1 - 48; segX += 84) {
            const len = 36 + ((segX * 7 + row * 19) % 32);
            pRect(ctx, segX, ry, len, PX, col);
            // Plated via pad
            pRect(ctx, segX - 4, ry - 4, 12, 12, PAL.gold);
            pRect(ctx, segX, ry, PX, PX, PAL.dark);
          }
        }

        // Cliff walls bordering the central Silicon Bus Gap
        if (x1 === GAP_X0) {
          pRect(ctx, GAP_X0 - 8, ROAD_EDGE_Y, 8, h - ROAD_EDGE_Y, PAL.goldShadow);
          pRect(ctx, GAP_X0 - 4, ROAD_EDGE_Y, 4, h - ROAD_EDGE_Y, PAL.gold);
        }
        if (x0 === GAP_X1) {
          pRect(ctx, GAP_X1, ROAD_EDGE_Y, 8, h - ROAD_EDGE_Y, PAL.goldShadow);
          pRect(ctx, GAP_X1, ROAD_EDGE_Y, 4, h - ROAD_EDGE_Y, PAL.gold);
        }
      };

      buildInterposerDeck(0, GAP_X0);
      buildInterposerDeck(GAP_X1, w);

      // Central UCIe Die-to-Die Optical Bus Trench (`GAP_X0..GAP_X1`, `y = 680..1000`)
      pRect(ctx, GAP_X0, ROAD_EDGE_Y, GAP_X1 - GAP_X0, h - ROAD_EDGE_Y, '#070a18');
      for (let ty = ROAD_EDGE_Y + 16; ty < h; ty += 24) {
        pRect(ctx, GAP_X0 + 8, ty, GAP_X1 - GAP_X0 - 16, PX, '#161f42');
      }

      // Subtle CRT / LCD pixel-grid scanlines across top & bottom for crisp 8-bit micro-city texture
      ctx.fillStyle = 'rgba(5, 8, 20, 0.16)';
      for (let sy = 0; sy < h; sy += PX) {
        ctx.fillRect(0, sy + PX - 1, w, 1);
      }
    },
    PANEL_SIZE,
    PANEL_SIZE
  );
}

function drawSystolicWindowsAndBus(ctx, localT, riderX) {
  const beatStep = Math.floor(localT / (BEAT_SEC * 0.5));

  // 1. Animated Systolic Tensor-Core Windows on NPU Skyscrapers
  for (let ti = 0; ti < SKYLINE_TOWERS.length; ti++) {
    const t = SKYLINE_TOWERS[ti];
    const padX = 14;
    const padY = 34;
    const cellW = Math.floor((t.w - padX * 2) / t.cols);
    const cellH = Math.floor((ROAD_EDGE_Y - 28 - (t.topY + padY)) / t.rows);
    const proximity = Math.exp(-Math.pow((riderX - (t.x + t.w * 0.5)) / 210, 2));

    for (let r = 0; r < t.rows; r++) {
      for (let c = 0; c < t.cols; c++) {
        const wx = snap(t.x + padX + c * cellW + 2);
        const wy = snap(t.topY + padY + r * cellH + 2);
        const wave = (r + c + beatStep + ti * 2) % 6;
        const lit = wave === 0 || (proximity > 0.35 && wave <= 2);
        ctx.fillStyle = lit
          ? wave === 0
            ? PAL.goldBright
            : t.accent
          : 'rgba(30, 41, 89, 0.68)';
        ctx.fillRect(wx, wy, Math.max(PX * 2, cellW - 8), Math.max(PX * 2, cellH - 8));
      }
    }
  }

  // 2. High-Speed Vertical Optical Data Lanes inside Silicon Bus Gap (`x = 468..572`)
  const lanes = [
    { x: GAP_X0 + 16, col: PAL.cyan, spd: 260 },
    { x: GAP_X0 + 36, col: PAL.gold, spd: -310 },
    { x: GAP_X0 + 56, col: PAL.pink, spd: 290 },
    { x: GAP_X0 + 76, col: PAL.green, spd: -250 },
    { x: GAP_X0 + 92, col: PAL.cyan, spd: 320 },
  ];
  for (const ln of lanes) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.fillRect(ln.x, ROAD_EDGE_Y + 4, PX, PANEL_SIZE - ROAD_EDGE_Y - 4);
    for (let p = 0; p < 5; p++) {
      const span = PANEL_SIZE - ROAD_EDGE_Y;
      const rawY = (((localT * ln.spd + p * 64) % span) + span) % span;
      pRect(ctx, ln.x, ROAD_EDGE_Y + rawY, PX, 16, ln.col);
      pRect(ctx, ln.x, ROAD_EDGE_Y + rawY, PX, PX, PAL.white);
    }
  }

  // Laser-carrier bridge pulses right at y = ROAD_EDGE_Y (`680`) so road plane stays visually continuous
  const pulseShift = Math.floor(localT * 24) * PX;
  for (let bx = GAP_X0; bx < GAP_X1; bx += 12) {
    const active = ((bx + pulseShift) % 24 + 24) % 24 < 12;
    pRect(ctx, bx, ROAD_EDGE_Y, 8, PX, active ? PAL.cyan : 'rgba(56, 189, 248, 0.32)');
  }
}

function drawOfflinePocketDevices(ctx, localT, riderX, isOutroThumbnail) {
  // Left Hologram: AI Smart-Glasses (`x = 188, y = 148`)
  const gLit = isOutroThumbnail ? 1 : smoothstep(60, 220, riderX);
  const gx = 72;
  const gy = 104;
  const bob1 = snap(Math.sin(localT * 3.2) * 4);

  // Pixel Card Frame
  pRect(ctx, gx, gy + bob1, 228, 92, 'rgba(13, 18, 44, 0.88)');
  pRect(ctx, gx, gy + bob1, 228, PX, gLit > 0.5 ? PAL.green : PAL.cyan);
  pRect(ctx, gx, gy + bob1 + 88, 228, PX, PAL.cyanDeep);
  pRect(ctx, gx, gy + bob1, PX, 92, PAL.cyan);
  pRect(ctx, gx + 224, gy + bob1, PX, 92, PAL.cyan);

  // Pixel Smart-Glasses Icon
  const ix = gx + 16;
  const iy = gy + bob1 + 22;
  const lensCol = gLit > 0.3 ? PAL.cyan : '#334155';
  pRect(ctx, ix, iy, 68, PX, PAL.gold); // top frame bar
  pRect(ctx, ix - 4, iy + 4, PX, 16, PAL.gold); // left temple
  pRect(ctx, ix + 68, iy + 4, PX, 16, PAL.gold); // right temple
  pRect(ctx, ix + 4, iy + 4, 24, 20, lensCol); // left AR lens
  pRect(ctx, ix + 40, iy + 4, 24, 20, lensCol); // right AR lens
  pRect(ctx, ix + 28, iy + 8, 12, PX, PAL.gold); // nose bridge
  if (gLit > 0.4) {
    pRect(ctx, ix + 8, iy + 8, 8, PX, PAL.white);
    pRect(ctx, ix + 44, iy + 8, 8, PX, PAL.white);
    pRect(ctx, ix + 48, iy + 16, 12, PX, PAL.green);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '700 13px "PelicanMono", monospace';
  ctx.fillStyle = PAL.white;
  ctx.fillText('AI GLASSES · NPU', gx + 98, gy + bob1 + 16);
  ctx.font = '700 11px "PelicanMono", monospace';
  ctx.fillStyle = gLit > 0.4 ? PAL.green : '#94a3b8';
  ctx.fillText(gLit > 0.4 ? '● OFFLINE 0ms' : '○ WAITING...', gx + 98, gy + bob1 + 38);
  ctx.fillStyle = PAL.gold;
  ctx.fillText('3B VLM · 1.8W', gx + 98, gy + bob1 + 58);

  // Right Hologram: Pocket Handheld NPU Smartphone (`x = 696, y = 104`)
  const pLit = isOutroThumbnail ? 1 : smoothstep(500, 680, riderX);
  const px = 696;
  const py = 104;
  const bob2 = snap(Math.cos(localT * 3.2 + 1.0) * 4);

  pRect(ctx, px, py + bob2, 232, 92, 'rgba(13, 18, 44, 0.88)');
  pRect(ctx, px, py + bob2, 232, PX, pLit > 0.5 ? PAL.green : PAL.pink);
  pRect(ctx, px, py + bob2 + 88, 232, PX, PAL.pinkDeep);
  pRect(ctx, px, py + bob2, PX, 92, PAL.pink);
  pRect(ctx, px + 228, py + bob2, PX, 92, PAL.pink);

  // Pixel Pocket Device Icon
  const dx = px + 20;
  const dy = py + bob2 + 14;
  pRect(ctx, dx, dy, 40, 64, PAL.gold);
  pRect(ctx, dx + 4, dy + 6, 32, 48, pLit > 0.3 ? '#0f172a' : '#1e293b');
  if (pLit > 0.3) {
    pRect(ctx, dx + 8, dy + 12, 24, 16, PAL.pink);
    pRect(ctx, dx + 12, dy + 16, 16, 8, PAL.goldBright);
    pRect(ctx, dx + 8, dy + 34, 20, PX, PAL.green);
    pRect(ctx, dx + 8, dy + 42, 16, PX, PAL.cyan);
  }

  ctx.fillStyle = PAL.white;
  ctx.font = '700 13px "PelicanMono", monospace';
  ctx.fillText('POCKET NPU · SoC', px + 74, py + bob2 + 16);
  ctx.font = '700 11px "PelicanMono", monospace';
  ctx.fillStyle = pLit > 0.4 ? PAL.green : '#94a3b8';
  ctx.fillText(pLit > 0.4 ? '● LOCAL 75 tok/s' : '○ IDLE STATE', px + 74, py + bob2 + 38);
  ctx.fillStyle = PAL.cyan;
  ctx.fillText('AIRPLANE MODE OK', px + 74, py + bob2 + 58);
}

function drawCoreAndFloatingBadge(ctx, localT, riderX, isOutroThumbnail) {
  const collected = !isOutroThumbnail && riderX >= CORE_X;

  if (!collected) {
    // Spinning Golden Pixel `INT4 / 0ms` Power-Core hovering over Silicon Bus Gap!
    const pulse = Math.sin(localT * 8) * 4;
    const cy = snap(CORE_Y + pulse);
    const spin = Math.abs(Math.cos(localT * 5.5));
    const halfW = Math.max(8, snap(24 * (0.45 + 0.55 * spin)));

    // Outer pixel aura diamond
    pRect(ctx, CORE_X - halfW - 4, cy - 20, (halfW + 4) * 2, 40, 'rgba(250, 204, 21, 0.20)');
    pRect(ctx, CORE_X - halfW, cy - 24, halfW * 2, 48, PAL.dark);
    pRect(ctx, CORE_X - halfW + PX, cy - 20, (halfW - PX) * 2, 40, PAL.gold);
    pRect(ctx, CORE_X - Math.max(4, halfW - 8), cy - 12, Math.max(8, (halfW - 8) * 2), 24, PAL.goldBright);

    // Chip pins on top & bottom of power-core
    for (let k = -12; k <= 12; k += 8) {
      if (Math.abs(k) < halfW) {
        pRect(ctx, CORE_X + k - 2, cy - 28, PX, PX, PAL.cyan);
        pRect(ctx, CORE_X + k - 2, cy + 24, PX, PX, PAL.cyan);
      }
    }

    if (halfW >= 16) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 11px "PelicanMono", monospace';
      ctx.fillStyle = PAL.dark;
      ctx.fillText('INT4', CORE_X, cy - 5);
      ctx.font = '700 10px "PelicanMono", monospace';
      ctx.fillText('0ms', CORE_X, cy + 8);
      ctx.restore();
    }
  } else {
    // Collected! 8-way Pixel Starburst + Crisp Rising `+40 TOPS` & `INT4 · 0ms` Floating Badge!
    const progress = clamp((riderX - CORE_X) / 260, 0, 1);
    const burstEnv = 1 - smoothstep(0, 0.45, progress);

    if (burstEnv > 0.02) {
      const r = 14 + progress * 92;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const sx = CORE_X + Math.cos(a) * r;
        const sy = CORE_Y + Math.sin(a) * r;
        pRect(ctx, sx - 4, sy - 4, 8, 8, i % 2 === 0 ? PAL.goldBright : PAL.green);
      }
    }

    const badgeAlpha = 1 - smoothstep(0.68, 1.0, progress);
    if (badgeAlpha > 0.02) {
      const floatY = snap(CORE_Y - 24 - smootherstep(0, 0.85, progress) * 76);
      const bx = CORE_X - 72;
      ctx.save();
      ctx.globalAlpha = badgeAlpha;
      pRect(ctx, bx - PX, floatY - PX, 144 + PX * 2, 52 + PX * 2, PAL.dark);
      pRect(ctx, bx, floatY, 144, 52, '#0f291e');
      pRect(ctx, bx, floatY, 144, PX, PAL.green);
      pRect(ctx, bx, floatY + 48, 144, PX, PAL.gold);
      pRect(ctx, bx, floatY, PX, 52, PAL.green);
      pRect(ctx, bx + 140, floatY, PX, 52, PAL.green);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 18px "PelicanMono", monospace';
      ctx.fillStyle = PAL.green;
      ctx.fillText('+40 TOPS', CORE_X, floatY + 18);
      ctx.font = '700 11px "PelicanMono", monospace';
      ctx.fillStyle = PAL.goldBright;
      ctx.fillText('INT4 · 0ms CORE', CORE_X, floatY + 37);
      ctx.restore();
    }
  }

  // In Outro thumbnail, show a celebratory `+40 TOPS` badge above right deck too
  if (isOutroThumbnail) {
    const bx = 566;
    const fy = 456;
    pRect(ctx, bx - PX, fy - PX, 136 + PX * 2, 44 + PX * 2, PAL.dark);
    pRect(ctx, bx, fy, 136, 44, '#0f291e');
    pRect(ctx, bx, fy, 136, PX, PAL.green);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 16px "PelicanMono", monospace';
    ctx.fillStyle = PAL.green;
    ctx.fillText('+40 TOPS', bx + 68, fy + 22);
  }
}

function drawTopChipHUD(ctx, scene, riderX, isOutroThumbnail) {
  pRect(ctx, 0, 0, PANEL_SIZE, 48, 'rgba(8, 11, 26, 0.92)');
  pRect(ctx, 0, 48, PANEL_SIZE, PX, PAL.gold);

  const boosted = isOutroThumbnail || riderX >= CORE_X;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = '700 15px "PelicanMono", monospace';
  ctx.fillStyle = PAL.gold;
  ctx.fillText(`16 · ${scene?.zh || '端侧智能与随身算力'}`, 24, 25);

  ctx.font = '600 12.5px "PelicanMono", monospace';
  ctx.fillStyle = PAL.cyan;
  ctx.fillText('2026 · ON-DEVICE NPU WAFER CITY', 308, 25);

  ctx.textAlign = 'right';
  ctx.fillStyle = boosted ? PAL.green : PAL.goldBright;
  ctx.font = '700 13px "PelicanMono", monospace';
  ctx.fillText(
    boosted ? 'NPU: 85 TOPS [BOOST!] · LATENCY: 0.0ms' : 'NPU: 45 TOPS · LATENCY: 0.4ms',
    PANEL_SIZE - 24,
    25
  );
}

export function render(kit, slot, scene, params) {
  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;

  const localT = params?.localT ?? 0;
  const time = params?.t ?? localT;
  const pelicanLocalX = params?.pelicanLocalX ?? 500;
  const pedalAngle = params?.pedalAngle ?? 0;
  const speedScale = params?.speedScale ?? 1;
  const hidePelican = Boolean(params?.hidePelican);
  const isOutroThumbnail = Boolean(params?.isOutroThumbnail);

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Pixel-Art / Isometric Silicon Wafer Micro-City
  const bg = getWaferCityBackdrop(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Live Systolic Array Windows & Bus Gap Optical Streams
  drawSystolicWindowsAndBus(ctx, localT, pelicanLocalX);

  // 3. Offline Smart-Glasses & Pocket NPU Hologram Cards
  drawOfflinePocketDevices(ctx, localT, pelicanLocalX, isOutroThumbnail);

  // 4. Playful Parabolic Hop Gag over Silicon Bus Gap (`x = 460..580`)
  let hopLift = 0;
  let hopSlope = 0;
  if (!isOutroThumbnail && pelicanLocalX > 452 && pelicanLocalX < 588) {
    const u = clamp((pelicanLocalX - 452) / (588 - 452), 0, 1);
    const arc = Math.sin(Math.PI * u);
    hopLift = arc * 88;
    hopSlope = -0.24 * Math.cos(Math.PI * u) * arc;
  }

  // 5. Cyber-Rider + Pixel Exhaust Trail
  const showRider = !hidePelican && pelicanLocalX >= -260 && pelicanLocalX <= 1260;
  if (showRider) {
    const riderY = ROAD_EDGE_Y - hopLift;
    const boosted = isOutroThumbnail || pelicanLocalX >= CORE_X;

    // Pixel low-power spark trail behind rear wheel
    const rng = makePRNG(hashSeed(`s16_sparks_${Math.floor(localT * 15)}`));
    for (let i = 0; i < 9; i++) {
      const sx = pelicanLocalX - 96 - i * 16 - rng() * 8;
      const sy = riderY - 12 - rng() * 28 + Math.sin(i + localT * 10) * 6;
      const col = i % 3 === 0 ? PAL.gold : i % 2 === 0 ? PAL.green : PAL.cyan;
      pRect(ctx, sx, sy, i < 4 ? 8 : PX, i < 4 ? 8 : PX, col);
    }

    // Thruster pixel jet under wheels while airborne over the silicon bus trench!
    if (hopLift > 4) {
      for (const wxOff of [-84, 84]) {
        pRect(ctx, pelicanLocalX + wxOff - 4, riderY + 4, 8, 16, PAL.goldBright);
        pRect(ctx, pelicanLocalX + wxOff - 2, riderY + 20, PX, 16, PAL.cyan);
      }
    }

    const rig = computePelicanRig({
      x: pelicanLocalX,
      y: riderY,
      pedalAngle,
      scale: 1.0,
      slope: hopSlope,
      speedScale,
      time,
    });

    drawRig2D(ctx, rig, {
      featherFill: PAL.white,
      featherShade: '#cbd5e1',
      wingTipDark: '#1e1b4b',
      beakFill: PAL.cyan,
      pouchFill: PAL.gold,
      legFill: '#e2e8f0',
      frameStroke: boosted ? PAL.green : PAL.pink,
      metalStroke: '#94a3b8',
      tireStroke: '#090d1f',
      inkOutline: PAL.dark,
      glowColor: boosted ? PAL.green : PAL.cyan,
      halo: boosted,
      scanBeam: true,
    });
  }

  // 6. INT4 / 0ms Golden Power-Core & `+40 TOPS` Floating Pixel Badge
  drawCoreAndFloatingBadge(ctx, localT, pelicanLocalX, isOutroThumbnail);

  // 7. Native Top Wafer Telemetry Bar
  drawTopChipHUD(ctx, scene, pelicanLocalX, isOutroThumbnail);

  // 8. Outro Museum Gallery Tile Strip
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(11, 15, 36, 0.88)';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 92);
    ctx.fillStyle = PAL.gold;
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 4);
    ctx.fillStyle = PAL.white;
    ctx.font = '700 46px "PelicanSans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene?.num ?? 16).padStart(2, '0')} ${scene?.zh ?? '端侧智能与随身算力'}`, 36, PANEL_SIZE - 44);
  }

  ctx.restore();
}
