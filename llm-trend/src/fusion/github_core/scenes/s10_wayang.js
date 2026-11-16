// src/fusion/github_core/scenes/s10_wayang.js
// 10 · MoE 混合专家路由 (2024 · Sparse Mixture-of-Experts Router)
// Visual Direction:
// - High-contrast cybernetic switching nexus (#0a0816, #a855f7, #22d3ee, #f472b6, #fbbf24).
// - 16 tall geometric Expert Towers (`E01..E16`) arranged in perspective across x = 40..960.
// - Above center hangs a glowing Top-2 Gating Router Core firing curved neon laser routing arcs into
//   ONLY 2 active Expert Towers per beat (`Math.floor(localT * 2)`), while the other 14 stay cool
//   low-power dim — visually demonstrating sparse compute efficiency.

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';
import { makePRNG, hashSeed } from '../kit/kit.js';

const ROUTER_X = 500;
const ROUTER_Y = 144;

const PAL = {
  nexusVoid: '#06050e',
  nexusBg: '#0a0816',
  nexusFloor: '#110d24',
  dormantBody: '#0f0c20',
  dormantEdge: '#27204a',
  dormantText: '#5b5485',
  purple: '#a855f7',
  cyan: '#22d3ee',
  pink: '#f472b6',
  gold: '#fbbf24',
  white: '#f8fafc',
};

// 16 Geometric Expert Towers spanning x = 40..960 in symmetrical amphitheater perspective
const EXPERT_TOWERS = Array.from({ length: 16 }, (_, i) => {
  const u = i / 15; // 0..1
  const cx = lerp(63, 937, u); // tower width 44 -> outer edges at 41 and 959 (strictly inside 40..960)
  const distFromCenter = Math.abs(u - 0.5) * 2; // 0 at center, 1 at outer wings
  const topY = Math.round(lerp(348, 252, Math.pow(distFromCenter, 1.25)));
  const w = 44;
  return {
    index: i,
    code: `E${String(i + 1).padStart(2, '0')}`,
    cx,
    x: cx - w * 0.5,
    w,
    topY,
    h: ROAD_EDGE_Y - topY,
    receptorY: topY - 12,
  };
});

// Deterministic 12-beat Top-2 Gating Schedule (`Math.floor(localT * 2)` switches every 0.5s!)
const TOP2_SCHEDULE = [
  { e1: 2, e2: 11, w1: '0.62', w2: '0.38' },
  { e1: 5, e2: 14, w1: '0.57', w2: '0.43' },
  { e1: 0, e2: 9, w1: '0.64', w2: '0.36' },
  { e1: 6, e2: 15, w1: '0.55', w2: '0.45' },
  { e1: 1, e2: 12, w1: '0.61', w2: '0.39' },
  { e1: 4, e2: 13, w1: '0.58', w2: '0.42' },
  { e1: 3, e2: 10, w1: '0.63', w2: '0.37' },
  { e1: 7, e2: 14, w1: '0.54', w2: '0.46' },
  { e1: 1, e2: 10, w1: '0.60', w2: '0.40' },
  { e1: 5, e2: 12, w1: '0.59', w2: '0.41' },
  { e1: 2, e2: 15, w1: '0.65', w2: '0.35' },
  { e1: 4, e2: 11, w1: '0.56', w2: '0.44' },
];

function evalQuad(p0, p1, p2, u) {
  const iu = 1 - u;
  return iu * iu * p0 + 2 * iu * u * p1 + u * u * p2;
}

function drawChamferedTowerPath(ctx, x, topY, w, botY, chamfer = 7) {
  ctx.beginPath();
  ctx.moveTo(x + chamfer, topY);
  ctx.lineTo(x + w - chamfer, topY);
  ctx.lineTo(x + w, topY + chamfer);
  ctx.lineTo(x + w, botY);
  ctx.lineTo(x, botY);
  ctx.lineTo(x, topY + chamfer);
  ctx.closePath();
}

function getBakedMoENexus(kit) {
  return kit.bake2D('s10_moe_router_nexus_v1', (_g, bctx, rng, w, h) => {
    // 1. Deep Cybernetic Switching Nexus Chamber
    const skyG = bctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    skyG.addColorStop(0.0, PAL.nexusVoid);
    skyG.addColorStop(0.45, PAL.nexusBg);
    skyG.addColorStop(1.0, '#140f2d');
    bctx.fillStyle = skyG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y + 2);

    // Subtle upper nexus aura behind the suspended Top-2 Router Core
    const routerHalo = bctx.createRadialGradient(ROUTER_X, ROUTER_Y, 12, ROUTER_X, ROUTER_Y, 360);
    routerHalo.addColorStop(0.0, 'rgba(168, 85, 247, 0.24)');
    routerHalo.addColorStop(0.45, 'rgba(34, 211, 238, 0.09)');
    routerHalo.addColorStop(1.0, 'rgba(10, 8, 22, 0)');
    bctx.fillStyle = routerHalo;
    bctx.fillRect(0, 0, w, 520);

    // Architectural overhead gantry trusses suspending the Router Core at (500, 144)
    bctx.strokeStyle = 'rgba(168, 85, 247, 0.22)';
    bctx.lineWidth = 1.6;
    for (const sx of [-1, 1]) {
      bctx.beginPath();
      bctx.moveTo(ROUTER_X + sx * 160, 0);
      bctx.lineTo(ROUTER_X + sx * 56, ROUTER_Y - 28);
      bctx.moveTo(ROUTER_X + sx * 340, 0);
      bctx.lineTo(ROUTER_X + sx * 76, ROUTER_Y - 10);
      bctx.stroke();
    }

    // Subtle background hex/circuit lattice
    bctx.strokeStyle = 'rgba(168, 85, 247, 0.05)';
    bctx.lineWidth = 1;
    for (let y = 48; y < ROAD_EDGE_Y; y += 48) {
      bctx.beginPath();
      bctx.moveTo(0, y);
      bctx.lineTo(w, y);
      bctx.stroke();
    }
    for (let i = 0; i < 90; i++) {
      const sx = rng() * w;
      const sy = rng() * 260;
      bctx.fillStyle =
        i % 3 === 0 ? 'rgba(34, 211, 238, 0.25)' : 'rgba(168, 85, 247, 0.25)';
      bctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Faint dormant guide filaments from Router Core to all 16 Expert Towers (shows full connectivity)
    bctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
    bctx.lineWidth = 1.0;
    for (const tw of EXPERT_TOWERS) {
      const ctrlX = lerp(ROUTER_X, tw.cx, 0.58);
      const ctrlY = ROUTER_Y + 28;
      bctx.beginPath();
      bctx.moveTo(ROUTER_X, ROUTER_Y + 26);
      bctx.quadraticCurveTo(ctrlX, ctrlY, tw.cx, tw.receptorY);
      bctx.stroke();
    }

    // 2. Bake All 16 Geometric Expert Towers (`E01..E16`) in Cool Low-Power Dormant State!
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    for (const tw of EXPERT_TOWERS) {
      // Dormant monolith body
      drawChamferedTowerPath(bctx, tw.x, tw.topY, tw.w, ROAD_EDGE_Y, 7);
      const tg = bctx.createLinearGradient(tw.x, tw.topY, tw.x, ROAD_EDGE_Y);
      tg.addColorStop(0.0, '#14112b');
      tg.addColorStop(0.5, PAL.dormantBody);
      tg.addColorStop(1.0, '#090714');
      bctx.fillStyle = tg;
      bctx.fill();

      bctx.strokeStyle = PAL.dormantEdge;
      bctx.lineWidth = 1.3;
      bctx.stroke();

      // Crown receptor spire + dormant receptor node
      bctx.strokeStyle = '#31295c';
      bctx.lineWidth = 2.0;
      bctx.beginPath();
      bctx.moveTo(tw.cx, tw.topY);
      bctx.lineTo(tw.cx, tw.receptorY);
      bctx.stroke();

      bctx.fillStyle = '#181432';
      bctx.strokeStyle = '#3b316e';
      bctx.lineWidth = 1.3;
      bctx.beginPath();
      bctx.arc(tw.cx, tw.receptorY, 4.2, 0, Math.PI * 2);
      bctx.fill();
      bctx.stroke();

      // Tower ID code `E01..E16`
      bctx.fillStyle = PAL.dormantText;
      bctx.font = '700 10.5px ui-monospace, SFMono-Regular, Menlo, monospace';
      bctx.fillText(tw.code, tw.cx, tw.topY + 18);

      // Low-power standby FFN tensor slots (dim slate bars)
      const slotStart = tw.topY + 34;
      const slotEnd = ROAD_EDGE_Y - 18;
      const numSlots = Math.floor((slotEnd - slotStart) / 22);
      bctx.fillStyle = 'rgba(46, 38, 86, 0.42)';
      for (let s = 0; s < numSlots; s++) {
        const sy = slotStart + s * 22;
        bctx.fillRect(tw.x + 7, sy, tw.w - 14, 9);
      }

      // Tiny cool standby LED near pedestal
      bctx.fillStyle = 'rgba(56, 189, 248, 0.24)';
      bctx.fillRect(tw.cx - 5, ROAD_EDGE_Y - 10, 10, 2.5);
    }

    // 3. Perspective Cybernetic Switching Bus Floor (y = 680..1000)
    const floorG = bctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
    floorG.addColorStop(0.0, '#161130');
    floorG.addColorStop(0.25, '#0d0a1d');
    floorG.addColorStop(1.0, '#04030a');
    bctx.fillStyle = floorG;
    bctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

    // 16 perspective expert output bus traces fanning across the floor
    bctx.strokeStyle = 'rgba(168, 85, 247, 0.16)';
    bctx.lineWidth = 1.3;
    for (const tw of EXPERT_TOWERS) {
      const botX = ROUTER_X + (tw.cx - ROUTER_X) * 1.48;
      bctx.beginPath();
      bctx.moveTo(tw.cx, ROAD_EDGE_Y);
      bctx.lineTo(botX, h);
      bctx.stroke();
    }

    for (let r = 1; r <= 7; r++) {
      const u = r / 7;
      const gy = ROAD_EDGE_Y + u * u * (h - ROAD_EDGE_Y);
      bctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
      bctx.lineWidth = 1;
      bctx.beginPath();
      bctx.moveTo(0, gy);
      bctx.lineTo(w, gy);
      bctx.stroke();
    }

    // Seamless high-contrast neon highway datum at y = 680 across [0..1000]
    bctx.strokeStyle = 'rgba(168, 85, 247, 0.44)';
    bctx.lineWidth = 6;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y + 1);
    bctx.lineTo(w, ROAD_EDGE_Y + 1);
    bctx.stroke();

    bctx.strokeStyle = PAL.cyan;
    bctx.lineWidth = 2.4;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y);
    bctx.lineTo(w, ROAD_EDGE_Y);
    bctx.stroke();
  }, PANEL_SIZE, PANEL_SIZE);
}

function drawActiveExpertTower(ctx, tw, colorHex, rgbaStr, weightStr, rankLabel, intensity, t) {
  if (intensity <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = clamp(intensity, 0, 1);

  // 1. Ambient neon tower column halo
  const hg = ctx.createRadialGradient(
    tw.cx,
    (tw.topY + ROAD_EDGE_Y) * 0.5,
    8,
    tw.cx,
    (tw.topY + ROAD_EDGE_Y) * 0.5,
    92
  );
  hg.addColorStop(0.0, `rgba(${rgbaStr}, 0.34)`);
  hg.addColorStop(1.0, `rgba(${rgbaStr}, 0)`);
  ctx.fillStyle = hg;
  ctx.fillRect(tw.cx - 92, tw.topY - 35, 184, tw.h + 75);

  // 2. Energized Tower Chassis Fill & Crisp Neon Border
  drawChamferedTowerPath(ctx, tw.x, tw.topY, tw.w, ROAD_EDGE_Y, 7);
  const bodyG = ctx.createLinearGradient(tw.x, tw.topY, tw.x, ROAD_EDGE_Y);
  bodyG.addColorStop(0.0, `rgba(${rgbaStr}, 0.42)`);
  bodyG.addColorStop(0.5, `rgba(${rgbaStr}, 0.20)`);
  bodyG.addColorStop(1.0, `rgba(${rgbaStr}, 0.36)`);
  ctx.fillStyle = bodyG;
  ctx.fill();

  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // 3. Rippling Active FFN Tensor Matrix Slots inside ONLY this active Expert Tower
  const slotStart = tw.topY + 34;
  const slotEnd = ROAD_EDGE_Y - 18;
  const numSlots = Math.floor((slotEnd - slotStart) / 22);
  for (let s = 0; s < numSlots; s++) {
    const sy = slotStart + s * 22;
    const wave = 0.55 + 0.45 * Math.sin(t * 14 - s * 0.75);
    const barW = (tw.w - 14) * (0.52 + 0.48 * wave);
    ctx.fillStyle = s % 3 === 0 ? PAL.gold : colorHex;
    ctx.globalAlpha = clamp(intensity * (0.55 + 0.45 * wave), 0, 1);
    ctx.fillRect(tw.x + 7, sy, barW, 9);
  }
  ctx.globalAlpha = clamp(intensity, 0, 1);

  // 4. Illuminated Tower Code (`E0X`) + Floating Gating Weight Pill (`g₁ = 0.62`)
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 11px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tw.code, tw.cx, tw.topY + 18);

  // Blazing receptor crown node
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(tw.cx, tw.receptorY, 6.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gating weight pill above receptor (only on currently active pair, skip faint afterglow)
  if (weightStr) {
    const pw = 54;
    const ph = 16;
    const px = tw.cx - pw * 0.5;
    const py = tw.receptorY - 28;
    ctx.fillStyle = 'rgba(10, 8, 22, 0.90)';
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 1.3;
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = PAL.gold;
    ctx.font = '700 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(`${rankLabel}:${weightStr}`, tw.cx, py + ph * 0.5 + 0.5);
  }

  // 5. Energized Perspective Output Bus Trace along Ground Floor (y = 680..1000)
  const botX = ROUTER_X + (tw.cx - ROUTER_X) * 1.48;
  const fg = ctx.createLinearGradient(tw.cx, ROAD_EDGE_Y, botX, PANEL_SIZE);
  fg.addColorStop(0.0, colorHex);
  fg.addColorStop(0.5, `rgba(${rgbaStr}, 0.35)`);
  fg.addColorStop(1.0, `rgba(${rgbaStr}, 0)`);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(tw.cx, ROAD_EDGE_Y + 1);
  ctx.lineTo(botX, PANEL_SIZE);
  ctx.stroke();

  ctx.restore();
}

function drawCurvedLaserArc(ctx, tw, colorHex, rgbaStr, t, snapFlash) {
  const x0 = ROUTER_X;
  const y0 = ROUTER_Y + 30;
  const x2 = tw.cx;
  const y2 = tw.receptorY;
  // Sweeping S/arch Bezier control point giving dramatic cybernetic theatre arcs
  const cx = lerp(x0, x2, 0.62);
  const cy = ROUTER_Y + 18 - Math.abs(x2 - x0) * 0.06;

  ctx.save();
  ctx.lineCap = 'round';

  // Outer wide neon plasma sheath
  ctx.strokeStyle = `rgba(${rgbaStr}, ${(0.24 + snapFlash * 0.22).toFixed(2)})`;
  ctx.lineWidth = 11 + snapFlash * 5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();

  // Mid vivid neon laser body
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 3.8 + snapFlash * 1.6;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();

  // Crisp white-gold hot core filament
  ctx.strokeStyle = snapFlash > 0.45 ? PAL.gold : '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();

  // 4 high-speed routed token packets zipping along the laser arc into the Expert Tower!
  for (let p = 0; p < 4; p++) {
    const u = (t * 2.4 + p * 0.25) % 1.0;
    const px = evalQuad(x0, cx, x2, u);
    const py = evalQuad(y0, cy, y2, u);
    ctx.fillStyle = p % 2 === 0 ? PAL.gold : '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 3.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawTop2RouterCore(ctx, active1, active2, t, snapFlash, rig) {
  ctx.save();

  // Optional upward input query arc from Cyber-Rider to the Router Core!
  if (rig) {
    const rx0 = rig.head.x;
    const ry0 = rig.head.y - 22;
    const midX = lerp(rx0, ROUTER_X, 0.35);
    const midY = lerp(ry0, ROUTER_Y + 34, 0.55);

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.36)';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(rx0, ry0);
    ctx.quadraticCurveTo(midX, midY, ROUTER_X, ROUTER_Y + 34);
    ctx.stroke();

    ctx.strokeStyle = PAL.gold;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(rx0, ry0);
    ctx.quadraticCurveTo(midX, midY, ROUTER_X, ROUTER_Y + 34);
    ctx.stroke();

    // Ascending input token pulse
    const upU = (t * 2.2) % 1.0;
    const qx = evalQuad(rx0, midX, ROUTER_X, upU);
    const qy = evalQuad(ry0, midY, ROUTER_Y + 34, upU);
    ctx.fillStyle = PAL.gold;
    ctx.beginPath();
    ctx.arc(qx, qy, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.translate(ROUTER_X, ROUTER_Y);

  // Outer radial glow on beat switch
  const coreR = 54 + snapFlash * 8;
  const rg = ctx.createRadialGradient(0, 0, 6, 0, 0, coreR * 1.9);
  rg.addColorStop(0.0, 'rgba(251, 191, 36, 0.55)');
  rg.addColorStop(0.38, 'rgba(168, 85, 247, 0.42)');
  rg.addColorStop(0.72, 'rgba(34, 211, 238, 0.18)');
  rg.addColorStop(1.0, 'rgba(10, 8, 22, 0)');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(0, 0, coreR * 1.9, 0, Math.PI * 2);
  ctx.fill();

  // 16-Sector Radial Gating Ring (visually maps all 16 Experts; ONLY active1 & active2 blaze!)
  for (let i = 0; i < 16; i++) {
    const a0 = Math.PI * 0.06 + (i / 16) * Math.PI * 0.88; // Bottom semicircle facing the 16 towers
    const a1 = a0 + (Math.PI * 0.88) / 16 - 0.03;
    const isE1 = i === active1;
    const isE2 = i === active2;

    ctx.strokeStyle = isE1
      ? PAL.cyan
      : isE2
      ? PAL.pink
      : 'rgba(91, 84, 133, 0.35)';
    ctx.lineWidth = isE1 || isE2 ? 7.5 : 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, 48, a0, a1);
    ctx.stroke();
  }

  // Counter-rotating cybernetic octagonal router housing
  ctx.save();
  ctx.rotate(t * 0.65);
  ctx.strokeStyle = PAL.purple;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const px = Math.cos(a) * 37;
    const py = Math.sin(a) * 37;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(12, 10, 26, 0.92)';
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Inner golden-cyan Softmax Gating Eye
  ctx.fillStyle = PAL.purple;
  ctx.beginPath();
  ctx.arc(0, 0, 21 + snapFlash * 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PAL.cyan;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Clean Top-2 Sparse Router Telemetry Header above Core
  ctx.fillStyle = 'rgba(10, 8, 22, 0.88)';
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
  ctx.lineWidth = 1.3;
  ctx.fillRect(-118, -78, 236, 22);
  ctx.strokeRect(-118, -78, 236, 22);

  ctx.fillStyle = PAL.gold;
  ctx.font = '700 10.5px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    `TOP-2 GATE -> E${String(active1 + 1).padStart(2, '0')} + E${String(active2 + 1).padStart(2, '0')} (2/16 ACTIVE)`,
    0,
    -66.5
  );

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

  // 1. Static Baked Cybernetic Switching Nexus & 16 Low-Power Dormant Expert Towers (`E01..E16`)
  const bg = getBakedMoENexus(kit);
  if (bg && bg.canvas) {
    ctx.drawImage(bg.canvas, 0, 0);
  }

  const rx = pelicanLocalX;
  const effLocalT = isOutroThumbnail ? 2.15 : Math.max(0, localT);
  const beatStep = Math.floor(effLocalT * 2);
  const beatFrac = (effLocalT * 2) - beatStep;
  const snapFlash = Math.exp(-beatFrac * 5.2);
  const beatPulse = clamp(sync?.pulse ?? snapFlash, 0, 1);

  const curRoute = TOP2_SCHEDULE[beatStep % TOP2_SCHEDULE.length];
  const prevRoute =
    beatStep > 0 ? TOP2_SCHEDULE[(beatStep - 1) % TOP2_SCHEDULE.length] : null;

  // 2. Subtle Decaying Afterglow on Previous Beat's 2 Towers for Silky 60fps Persistence
  if (prevRoute && beatFrac < 0.45) {
    const fade = Math.exp(-beatFrac * 7.5) * 0.42;
    drawActiveExpertTower(
      ctx,
      EXPERT_TOWERS[prevRoute.e1],
      PAL.cyan,
      '34, 211, 238',
      null,
      '',
      fade,
      t
    );
    drawActiveExpertTower(
      ctx,
      EXPERT_TOWERS[prevRoute.e2],
      PAL.pink,
      '244, 114, 182',
      null,
      '',
      fade,
      t
    );
  }

  // 3. Light Up ONLY the 2 Active Expert Towers Selected for This Beat!
  const tower1 = EXPERT_TOWERS[curRoute.e1];
  const tower2 = EXPERT_TOWERS[curRoute.e2];
  drawActiveExpertTower(ctx, tower1, PAL.cyan, '34, 211, 238', curRoute.w1, 'k1', 1.0, t);
  drawActiveExpertTower(ctx, tower2, PAL.pink, '244, 114, 182', curRoute.w2, 'k2', 1.0, t);

  // Compute Cyber-Rider rig
  const showRider = !hidePelican && rx >= -260 && rx <= 1260;
  const rig = showRider
    ? computePelicanRig({
        x: rx,
        y: ROAD_EDGE_Y,
        slope: 0,
        pedalAngle,
        speedScale: speedScale + beatPulse * 0.04,
        time: t,
      })
    : null;

  // 4. Curved Neon Laser Routing Arcs from Top-2 Router Core into ONLY the 2 Active Expert Towers
  drawCurvedLaserArc(ctx, tower1, PAL.cyan, '34, 211, 238', t, snapFlash);
  drawCurvedLaserArc(ctx, tower2, PAL.pink, '244, 114, 182', t + 0.18, snapFlash);

  // 5. Suspended Top-2 Gating Router Core at (500, 144)
  drawTop2RouterCore(ctx, curRoute.e1, curRoute.e2, t, snapFlash, rig);

  // 6. Cyber-Rider (`硅基领航员 Agent-01`) Racing Across the MoE Switching Highway
  if (showRider && rig) {
    // Dual-channel Cyan + Hot-Pink Sparse Token Wake along y = 680
    const wx0 = clamp(rx - 210, 0, PANEL_SIZE);
    const wx1 = clamp(rx + 28, 0, PANEL_SIZE);
    if (wx1 > wx0) {
      const wg = ctx.createLinearGradient(wx0, 0, wx1, 0);
      wg.addColorStop(0.0, 'rgba(168, 85, 247, 0)');
      wg.addColorStop(0.55, 'rgba(244, 114, 182, 0.78)');
      wg.addColorStop(1.0, 'rgba(34, 211, 238, 0.98)');
      ctx.strokeStyle = wg;
      ctx.lineWidth = 4.4;
      ctx.beginPath();
      ctx.moveTo(wx0, ROAD_EDGE_Y);
      ctx.lineTo(wx1, ROAD_EDGE_Y);
      ctx.stroke();
    }

    drawRig2D(ctx, rig, {
      featherFill: '#f5f3ff',
      featherShade: '#c4b5fd',
      wingTipDark: '#1e1b4b',
      beakFill: '#22d3ee',
      pouchFill: '#f472b6',
      legFill: '#ddd6fe',
      frameStroke: '#a855f7',
      metalStroke: '#67e8f9',
      tireStroke: '#0f0a21',
      inkOutline: '#060410',
      glowColor: '#22d3ee',
      halo: false,
      scanBeam: false,
    });
  }

  // 7. Optional Outro Thumbnail Title Bar
  if (isOutroThumbnail && scene) {
    ctx.fillStyle = 'rgba(8, 6, 18, 0.86)';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 92);
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 92);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 92);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 42px system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} · ${scene.zh}`, 34, PANEL_SIZE - 46);
  }

  ctx.restore();
}
