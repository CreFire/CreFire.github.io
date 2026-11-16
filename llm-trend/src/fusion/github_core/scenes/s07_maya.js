// src/fusion/github_core/scenes/s07_maya.js
// 07 · 开源生态百模星火 (2023 · Open-Weight Renaissance & LoRA)
// Visual Direction:
// - Deep twilight plum-obsidian sky (#140c1c, #f97316, #fb923c, #fde047, #38bdf8) illuminated by a
//   colossal branching Open-Source Git/Model Tree whose branches blossom into hundreds of floating
//   warm amber sky-lantern nodes (`7B`, `13B`, `70B`, `LoRA`, `GGUF` geometric badges).
// - Snap-in modular LoRA adapter hexagons orbiting and docking onto the Tensor-Cycle with luminous
//   pulse rings as Agent-01 speeds past along y = 680.

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

const PAL = {
  plumVoid: '#0d0713',
  plumSky: '#140c1c',
  plumMid: '#261136',
  plumHorizon: '#3b0764',
  emberDeep: '#9a3412',
  ember: '#f97316',
  amber: '#fb923c',
  gold: '#fde047',
  cyan: '#38bdf8',
  cream: '#fffbeb',
};

// Precompute deterministic Git/Model Tree branches so both baked canopy & live pulses share exact splines
const GIT_TREE_DATA = (() => {
  const rng = makePRNG(hashSeed('s07_git_model_tree_v1'));
  const branches = [];
  const terminals = [];

  function grow(x0, y0, angle, length, depth, maxDepth) {
    const spread = depth === 0 ? 0 : (rng() - 0.5) * 0.14;
    const a = angle + spread;
    const x1 = x0 + Math.cos(a) * length;
    const y1 = y0 + Math.sin(a) * length;
    // S-curve Git-DAG branch control points
    const cx1 = lerp(x0, x1, 0.35) + (rng() - 0.5) * length * 0.18;
    const cy1 = lerp(y0, y1, 0.22);
    const cx2 = lerp(x0, x1, 0.72) + (rng() - 0.5) * length * 0.18;
    const cy2 = lerp(y0, y1, 0.80);

    branches.push({
      x0,
      y0,
      cx1,
      cy1,
      cx2,
      cy2,
      x1,
      y1,
      depth,
      isCyanFork: depth >= 2 && rng() < 0.26,
    });

    if (depth >= maxDepth) {
      terminals.push({ x: x1, y: y1, depth });
      return;
    }

    const fanCount = depth === 0 ? 3 : depth === 1 ? 3 : 2;
    const span = depth === 0 ? 1.38 : depth === 1 ? 0.96 : 0.68;
    for (let i = 0; i < fanCount; i++) {
      const u = fanCount === 1 ? 0 : i / (fanCount - 1) - 0.5;
      const childAngle = a + u * span + (rng() - 0.5) * 0.12;
      const childLen = length * (0.68 + rng() * 0.14);
      grow(x1, y1, childAngle, childLen, depth + 1, maxDepth);
    }
  }

  // Colossal trunk rising from (495, 680) and fanning across the entire twilight sky
  grow(495, ROAD_EDGE_Y, -Math.PI * 0.5, 148, 0, 4);

  // Additional lower lateral open-source forks
  grow(495, ROAD_EDGE_Y - 68, -Math.PI * 0.80, 128, 1, 3);
  grow(495, ROAD_EDGE_Y - 68, -Math.PI * 0.20, 128, 1, 3);

  return { branches, terminals };
})();

const FLOATING_BADGE_LANTERNS = (() => {
  const rng = makePRNG(hashSeed('s07_floating_lanterns_v1'));
  const labels = [
    '7B', '13B', '70B', 'LoRA', 'GGUF',
    '7B', 'QLoRA', '13B', '70B', 'GGUF',
    'LoRA', '34B', '7B', 'GGUF', '13B',
    'LoRA', '70B', '8x7B',
  ];
  return labels.map((label, i) => {
    const u = (i + 0.45) / labels.length;
    return {
      label,
      baseX: lerp(64, 936, u) + (rng() - 0.5) * 26,
      baseY: 115 + ((i * 83) % 310) + (rng() - 0.5) * 28,
      driftRange: 54 + rng() * 44,
      speed: 0.16 + rng() * 0.12,
      phase: rng(),
      sway: 7 + rng() * 9,
      scale: label === '70B' || label === 'LoRA' || label === 'GGUF' ? 1.08 : 0.94,
      cyanAccent: label === 'LoRA' || label === 'QLoRA' || label === 'GGUF',
    };
  });
})();

const LORA_MODULES = [
  { x: 165, baseY: 506, rank: 'LoRA r=8', slot: 'seat', color: '#38bdf8' },
  { x: 305, baseY: 478, rank: 'GGUF Q4', slot: 'bb', color: '#fb923c' },
  { x: 445, baseY: 496, rank: 'LoRA r=16', slot: 'head', color: '#fde047' },
  { x: 585, baseY: 474, rank: 'ΔW = B·A', slot: 'bb', color: '#38bdf8' },
  { x: 725, baseY: 502, rank: 'QLoRA 4b', slot: 'seat', color: '#f97316' },
  { x: 865, baseY: 484, rank: 'LoRA r=32', slot: 'head', color: '#fde047' },
];

function drawHexagonPath(ctx, cx, cy, r, rot = Math.PI / 6) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = rot + (i * Math.PI) / 3;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawSkyLantern(ctx, cx, cy, s, isCyan = false, alpha = 1.0) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Warm ambient lantern aura
  const haloR = 26 * s;
  const hg = ctx.createRadialGradient(cx, cy, 2 * s, cx, cy, haloR);
  hg.addColorStop(0.0, isCyan ? 'rgba(56, 189, 248, 0.42)' : 'rgba(253, 224, 71, 0.48)');
  hg.addColorStop(0.48, 'rgba(249, 115, 22, 0.22)');
  hg.addColorStop(1.0, 'rgba(20, 12, 28, 0)');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
  ctx.fill();

  // Geometric Kongming / Sky-Lantern polyhedron silhouette
  const topW = 10.5 * s;
  const midW = 14.2 * s;
  const botW = 8.2 * s;
  const topY = cy - 13.5 * s;
  const midY = cy - 2.5 * s;
  const botY = cy + 12.5 * s;

  const lg = ctx.createLinearGradient(cx, topY, cx, botY);
  lg.addColorStop(0.0, '#ea580c');
  lg.addColorStop(0.48, '#fb923c');
  lg.addColorStop(0.88, '#fde047');
  lg.addColorStop(1.0, '#fef9c3');

  ctx.fillStyle = lg;
  ctx.strokeStyle = isCyan ? PAL.cyan : PAL.gold;
  ctx.lineWidth = Math.max(1.0, 1.35 * s);
  ctx.beginPath();
  ctx.moveTo(cx - topW, topY);
  ctx.lineTo(cx + topW, topY);
  ctx.lineTo(cx + midW, midY);
  ctx.lineTo(cx + botW, botY);
  ctx.lineTo(cx - botW, botY);
  ctx.lineTo(cx - midW, midY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner vertical lantern structural rib & bottom ember core
  ctx.strokeStyle = 'rgba(124, 45, 18, 0.45)';
  ctx.lineWidth = 0.9 * s;
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx, botY);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, botY - 1.5 * s, 2.4 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function evalCubic(p0, p1, p2, p3, u) {
  const iu = 1 - u;
  return (
    iu * iu * iu * p0 +
    3 * iu * iu * u * p1 +
    3 * iu * u * u * p2 +
    u * u * u * p3
  );
}

function getBakedOpenSourceCanopy(kit) {
  return kit.bake2D('s07_open_weight_tree_v1', (_g, bctx, rng, w, h) => {
    // 1. Deep Twilight Plum-Obsidian Sky Gradient
    const skyG = bctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    skyG.addColorStop(0.0, '#0a0510');
    skyG.addColorStop(0.35, PAL.plumSky);
    skyG.addColorStop(0.74, '#271136');
    skyG.addColorStop(1.0, '#44162c');
    bctx.fillStyle = skyG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y + 2);

    // Warm radiant canopy heart glow behind the Open-Source Tree
    const canopyGlow = bctx.createRadialGradient(495, 310, 24, 495, 320, 490);
    canopyGlow.addColorStop(0.0, 'rgba(249, 115, 22, 0.30)');
    canopyGlow.addColorStop(0.45, 'rgba(251, 146, 60, 0.14)');
    canopyGlow.addColorStop(0.75, 'rgba(56, 189, 248, 0.06)');
    canopyGlow.addColorStop(1.0, 'rgba(20, 12, 28, 0)');
    bctx.fillStyle = canopyGlow;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // Distant twilight stars & spark embers in upper sky
    for (let i = 0; i < 180; i++) {
      const sx = rng() * w;
      const sy = rng() * (ROAD_EDGE_Y - 40);
      const r = 0.6 + rng() * 1.6;
      const pick = rng();
      bctx.fillStyle =
        pick < 0.55
          ? `rgba(253, 224, 71, ${(0.22 + rng() * 0.52).toFixed(2)})`
          : pick < 0.82
          ? `rgba(251, 146, 60, ${(0.24 + rng() * 0.48).toFixed(2)})`
          : `rgba(56, 189, 248, ${(0.22 + rng() * 0.45).toFixed(2)})`;
      bctx.beginPath();
      bctx.arc(sx, sy, r, 0, Math.PI * 2);
      bctx.fill();
    }

    // Stepped geometric community compute nodes along the far twilight horizon (y = 610..680)
    bctx.fillStyle = '#180c24';
    for (let x = 0; x < w; x += 44) {
      const stepH = 14 + ((x * 19) % 38);
      bctx.fillRect(x, ROAD_EDGE_Y - stepH, 38, stepH);
      bctx.strokeStyle = 'rgba(251, 146, 60, 0.18)';
      bctx.lineWidth = 1;
      bctx.strokeRect(x + 0.5, ROAD_EDGE_Y - stepH + 0.5, 37, stepH);
    }

    // 2. Colossal Branching Open-Source Git/Model Tree
    // Multi-filament glowing trunk pedestal at (495, 680)
    const trunkGlow = bctx.createRadialGradient(495, ROAD_EDGE_Y - 40, 8, 495, ROAD_EDGE_Y - 40, 130);
    trunkGlow.addColorStop(0.0, 'rgba(253, 224, 71, 0.36)');
    trunkGlow.addColorStop(0.5, 'rgba(249, 115, 22, 0.16)');
    trunkGlow.addColorStop(1.0, 'rgba(20, 12, 28, 0)');
    bctx.fillStyle = trunkGlow;
    bctx.fillRect(350, ROAD_EDGE_Y - 180, 290, 185);

    // Draw all recursive Git-DAG branches (outer ember glow + crisp inner filament + commit junction rings)
    bctx.lineCap = 'round';
    for (const br of GIT_TREE_DATA.branches) {
      const wOuter = Math.max(2.2, (5.5 - br.depth) * 3.1);
      const wInner = Math.max(1.0, (5.2 - br.depth) * 1.15);

      bctx.strokeStyle = br.isCyanFork
        ? 'rgba(56, 189, 248, 0.28)'
        : 'rgba(249, 115, 22, 0.34)';
      bctx.lineWidth = wOuter;
      bctx.beginPath();
      bctx.moveTo(br.x0, br.y0);
      bctx.bezierCurveTo(br.cx1, br.cy1, br.cx2, br.cy2, br.x1, br.y1);
      bctx.stroke();

      bctx.strokeStyle = br.isCyanFork
        ? PAL.cyan
        : br.depth <= 1
        ? PAL.gold
        : PAL.amber;
      bctx.lineWidth = wInner;
      bctx.beginPath();
      bctx.moveTo(br.x0, br.y0);
      bctx.bezierCurveTo(br.cx1, br.cy1, br.cx2, br.cy2, br.x1, br.y1);
      bctx.stroke();

      // Git fork / commit node ring at branch endpoint
      if (br.depth <= 3) {
        const nr = Math.max(2.6, 6.2 - br.depth * 1.1);
        bctx.fillStyle = '#140c1c';
        bctx.strokeStyle = br.isCyanFork ? PAL.cyan : PAL.gold;
        bctx.lineWidth = 1.6;
        bctx.beginPath();
        bctx.arc(br.x1, br.y1, nr, 0, Math.PI * 2);
        bctx.fill();
        bctx.stroke();
      }
    }

    // 3. Hundreds of Blossoming Sky-Lantern Nodes across the Canopy (~195 warm amber lanterns)
    for (let i = 0; i < 165; i++) {
      const br = GIT_TREE_DATA.branches[(i * 7 + 3) % GIT_TREE_DATA.branches.length];
      const u = 0.25 + rng() * 0.75;
      const bx = evalCubic(br.x0, br.cx1, br.cx2, br.x1, u) + (rng() - 0.5) * 46;
      const by = evalCubic(br.y0, br.cy1, br.cy2, br.y1, u) - rng() * 34;
      if (by > ROAD_EDGE_Y - 36 || by < 24) continue;
      const sc = 0.28 + rng() * 0.42;
      drawSkyLantern(bctx, bx, by, sc, rng() < 0.16, 0.55 + rng() * 0.40);
    }

    // Heroic static canopy lantern nodes at terminal tips with crisp geometric badges
    const staticBadges = ['BASE', '7B', '13B', '70B', 'LoRA', 'GGUF', 'QLoRA', 'INT4', 'OPEN', 'MIT'];
    for (let i = 0; i < GIT_TREE_DATA.terminals.length; i++) {
      const term = GIT_TREE_DATA.terminals[i];
      if (term.x < 35 || term.x > w - 35 || term.y < 30 || term.y > ROAD_EDGE_Y - 50) continue;
      drawSkyLantern(bctx, term.x, term.y, 0.58, i % 5 === 0, 0.90);
      if (i % 6 === 0) {
        const tag = staticBadges[(i / 6) % staticBadges.length | 0];
        bctx.fillStyle = 'rgba(20, 12, 28, 0.78)';
        bctx.strokeStyle = i % 12 === 0 ? PAL.cyan : PAL.amber;
        bctx.lineWidth = 1.0;
        bctx.fillRect(term.x - 19, term.y - 6, 38, 13);
        bctx.strokeRect(term.x - 19, term.y - 6, 38, 13);
        bctx.fillStyle = PAL.cream;
        bctx.font = '700 8.5px ui-monospace, SFMono-Regular, Menlo, monospace';
        bctx.textAlign = 'center';
        bctx.textBaseline = 'middle';
        bctx.fillText(tag, term.x, term.y + 0.5);
      }
    }

    // 4. Open-Weight Git Highway Plane & Root Bus (y = 680..1000)
    const gndG = bctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
    gndG.addColorStop(0.0, '#1f0e29');
    gndG.addColorStop(0.18, '#160b20');
    gndG.addColorStop(1.0, '#09050e');
    bctx.fillStyle = gndG;
    bctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

    // Underground root circuits radiating from (495, 680) into the community substrate
    for (let r = 0; r < 14; r++) {
      const u = r / 13 - 0.5;
      const endX = 495 + u * 980;
      const endY = h - 10 - Math.abs(u) * 60;
      bctx.strokeStyle = r % 4 === 0 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(249, 115, 22, 0.22)';
      bctx.lineWidth = 1.8;
      bctx.beginPath();
      bctx.moveTo(495 + u * 40, ROAD_EDGE_Y + 2);
      bctx.bezierCurveTo(
        495 + u * 220,
        ROAD_EDGE_Y + 65,
        495 + u * 560,
        ROAD_EDGE_Y + 150,
        endX,
        endY
      );
      bctx.stroke();
    }

    // Parallel Git commit-graph tracks along the roadbed
    const trackYs = [ROAD_EDGE_Y + 24, ROAD_EDGE_Y + 52, ROAD_EDGE_Y + 92];
    for (let ti = 0; ti < trackYs.length; ti++) {
      const ty = trackYs[ti];
      bctx.strokeStyle = ti === 1 ? 'rgba(56, 189, 248, 0.30)' : 'rgba(251, 146, 60, 0.26)';
      bctx.lineWidth = 1.5;
      bctx.beginPath();
      bctx.moveTo(0, ty);
      bctx.lineTo(w, ty);
      bctx.stroke();

      for (let cx = 36 + ti * 22; cx < w; cx += 76) {
        bctx.fillStyle = '#140c1c';
        bctx.strokeStyle = ti === 1 ? PAL.cyan : PAL.amber;
        bctx.lineWidth = 1.4;
        bctx.beginPath();
        bctx.arc(cx, ty, 3.6, 0, Math.PI * 2);
        bctx.fill();
        bctx.stroke();
      }
    }

    // Crisp seamless road datum at y = 680 across [0..1000]
    bctx.strokeStyle = 'rgba(249, 115, 22, 0.45)';
    bctx.lineWidth = 6;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y + 1);
    bctx.lineTo(w, ROAD_EDGE_Y + 1);
    bctx.stroke();

    bctx.strokeStyle = PAL.gold;
    bctx.lineWidth = 2.4;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y);
    bctx.lineTo(w, ROAD_EDGE_Y);
    bctx.stroke();
  }, PANEL_SIZE, PANEL_SIZE);
}

function drawTreeCommitPulses(ctx, t) {
  ctx.save();
  // Fast ascending open-weight commit sparks racing up primary/secondary branches
  const totalBranches = GIT_TREE_DATA.branches.length;
  for (let i = 0; i < totalBranches; i += 3) {
    const br = GIT_TREE_DATA.branches[i];
    const u = (t * (0.85 + (i % 4) * 0.18) + i * 0.13) % 1.0;
    const px = evalCubic(br.x0, br.cx1, br.cx2, br.x1, u);
    const py = evalCubic(br.y0, br.cy1, br.cy2, br.y1, u);
    const col = br.isCyanFork ? PAL.cyan : PAL.gold;

    ctx.fillStyle = br.isCyanFork ? 'rgba(56, 189, 248, 0.28)' : 'rgba(253, 224, 71, 0.30)';
    ctx.beginPath();
    ctx.arc(px, py, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(px, py, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawAscendingBadgeLanterns(ctx, t) {
  ctx.save();
  for (let i = 0; i < FLOATING_BADGE_LANTERNS.length; i++) {
    const item = FLOATING_BADGE_LANTERNS[i];
    const u = (t * item.speed + item.phase) % 1.0;
    const fade = Math.sin(Math.PI * u);
    const lx = item.baseX + Math.sin(t * 1.4 + i * 1.1) * item.sway;
    const ly = item.baseY - u * item.driftRange;
    const alpha = 0.35 + 0.65 * fade;

    drawSkyLantern(ctx, lx, ly, item.scale * 0.92, item.cyanAccent, alpha);

    // Crisp geometric model badge suspended beneath or across the lantern
    const bw = item.label.length >= 4 ? 42 : 32;
    const bh = 14;
    const bx = lx - bw * 0.5;
    const by = ly - 5;

    ctx.globalAlpha = alpha * 0.95;
    ctx.fillStyle = 'rgba(16, 9, 24, 0.84)';
    ctx.strokeStyle = item.cyanAccent ? PAL.cyan : PAL.gold;
    ctx.lineWidth = 1.15;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = item.cyanAccent ? '#e0f2fe' : PAL.gold;
    ctx.font = '700 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.label, lx, by + bh * 0.5 + 0.5);
  }
  ctx.restore();
}

function drawLoRADockingModules(ctx, t, rx, rig, isBackPass) {
  ctx.save();
  for (let i = 0; i < LORA_MODULES.length; i++) {
    if ((i % 2 === 0) !== isBackPass) continue;
    const mod = LORA_MODULES[i];

    // Docking envelope: as rider approaches mod.x, hexagon swoops from orbit right onto the bike chassis!
    const dist = rx - mod.x;
    const dockProgress = rig
      ? smootherstep(-155, -10, dist) * (1 - smootherstep(95, 220, dist))
      : 0;

    const orbitAngle = t * 2.1 + i * 1.05;
    const orbitX = mod.x + Math.cos(orbitAngle) * 18;
    const orbitY = mod.baseY + Math.sin(orbitAngle * 1.3) * 11;

    let targetX = orbitX;
    let targetY = orbitY;
    if (rig && dockProgress > 0.001) {
      const anchor =
        mod.slot === 'bb'
          ? rig.bb
          : mod.slot === 'seat'
          ? rig.seatCluster
          : rig.headTop;
      targetX = lerp(orbitX, anchor.x, dockProgress);
      targetY = lerp(orbitY, anchor.y, dockProgress);
    }

    const hexR = lerp(18, 12.5, dockProgress);
    const hexRot = lerp(t * 0.9 + i, Math.PI / 6, dockProgress);

    // Subtle feeder tether from canopy to orbiting LoRA adapter before docking
    if (dockProgress < 0.85) {
      ctx.strokeStyle = `rgba(56, 189, 248, ${((1 - dockProgress) * 0.22).toFixed(2)})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(mod.x, mod.baseY - 75);
      ctx.lineTo(targetX, targetY - hexR);
      ctx.stroke();
    }

    // Expanding Luminous Docking Pulse Ring when module snaps onto frame!
    if (dist > -35 && dist < 135 && rig) {
      const ringU = clamp((dist + 35) / 170, 0, 1);
      const ringR = 14 + ringU * 68;
      const ringAlpha = (1 - ringU) * 0.85;

      ctx.strokeStyle =
        mod.color === '#38bdf8'
          ? `rgba(56, 189, 248, ${ringAlpha.toFixed(2)})`
          : `rgba(253, 224, 71, ${ringAlpha.toFixed(2)})`;
      ctx.lineWidth = 2.6 * (1 - ringU * 0.5);
      drawHexagonPath(ctx, targetX, targetY, ringR, Math.PI / 6);
      ctx.stroke();

      ctx.strokeStyle = `rgba(249, 115, 22, ${(ringAlpha * 0.6).toFixed(2)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(targetX, targetY, ringR * 0.78, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer snap-in LoRA Hexagon Module
    drawHexagonPath(ctx, targetX, targetY, hexR + 4, hexRot);
    ctx.fillStyle =
      mod.color === '#38bdf8'
        ? 'rgba(56, 189, 248, 0.18)'
        : 'rgba(249, 115, 22, 0.22)';
    ctx.fill();

    drawHexagonPath(ctx, targetX, targetY, hexR, hexRot);
    ctx.fillStyle = 'rgba(20, 12, 28, 0.88)';
    ctx.fill();
    ctx.strokeStyle = mod.color;
    ctx.lineWidth = 2.1;
    ctx.stroke();

    // Inner low-rank matrix decomposition bars (`B` vertical × `A` horizontal)
    ctx.fillStyle = PAL.cyan;
    ctx.fillRect(targetX - hexR * 0.42, targetY - hexR * 0.36, hexR * 0.24, hexR * 0.72);
    ctx.fillStyle = PAL.gold;
    ctx.fillRect(targetX - hexR * 0.08, targetY - hexR * 0.14, hexR * 0.54, hexR * 0.28);

    // Floating rank label pill above orbiting module
    if (dockProgress < 0.65) {
      const a = 1 - dockProgress * 1.4;
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.fillStyle = 'rgba(20, 12, 28, 0.82)';
      ctx.fillRect(targetX - 28, targetY - hexR - 18, 56, 13);
      ctx.strokeStyle = mod.color;
      ctx.lineWidth = 0.9;
      ctx.strokeRect(targetX - 28, targetY - hexR - 18, 56, 13);
      ctx.fillStyle = PAL.cream;
      ctx.font = '700 8.5px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mod.rank, targetX, targetY - hexR - 11.5);
      ctx.globalAlpha = 1.0;
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

  // 1. Static Baked Twilight Plum Sky, Colossal Git/Model Tree & Canopy Lantern Sea
  const bg = getBakedOpenSourceCanopy(kit);
  if (bg && bg.canvas) {
    ctx.drawImage(bg.canvas, 0, 0);
  }

  const rx = pelicanLocalX;
  const beatPulse = clamp(sync?.pulse ?? (1 - ((t * 2) % 1)), 0, 1);

  // 2. Live Git-Fork Commit Sparks & Ascending Open-Weight Badge Sky-Lanterns
  drawTreeCommitPulses(ctx, t);
  drawAscendingBadgeLanterns(ctx, t);

  // Compute Cyber-Rider rig if visible
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

  // 3. Back-layer Orbiting/Docking LoRA Hexagons
  drawLoRADockingModules(ctx, t, isOutroThumbnail ? 585 : rx, rig, true);

  // 4. Cyber-Rider (`硅基领航员 Agent-01`) with Open-Weight Ember & Sky-Cyan Accents
  if (showRider && rig) {
    // Warm ember speed-wake along y = 680
    const wakeX0 = clamp(rx - 200, 0, PANEL_SIZE);
    const wakeX1 = clamp(rx + 30, 0, PANEL_SIZE);
    if (wakeX1 > wakeX0) {
      const wg = ctx.createLinearGradient(wakeX0, 0, wakeX1, 0);
      wg.addColorStop(0.0, 'rgba(249, 115, 22, 0)');
      wg.addColorStop(0.6, 'rgba(251, 146, 60, 0.75)');
      wg.addColorStop(1.0, 'rgba(56, 189, 248, 0.95)');
      ctx.strokeStyle = wg;
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(wakeX0, ROAD_EDGE_Y);
      ctx.lineTo(wakeX1, ROAD_EDGE_Y);
      ctx.stroke();
    }

    drawRig2D(ctx, rig, {
      featherFill: '#fff7ed',
      featherShade: '#fed7aa',
      wingTipDark: '#431407',
      beakFill: '#38bdf8',
      pouchFill: '#f97316',
      legFill: '#ffedd5',
      frameStroke: '#fb923c',
      metalStroke: '#fdba74',
      tireStroke: '#1c0d26',
      inkOutline: '#0d0614',
      glowColor: '#fde047',
      halo: false,
      scanBeam: false,
    });
  }

  // 5. Front-layer Snap-In Modular LoRA Adapter Hexagons & Luminous Docking Pulse Rings
  drawLoRADockingModules(ctx, t, isOutroThumbnail ? 585 : rx, rig, false);

  // 6. Optional Outro Thumbnail Title Bar
  if (isOutroThumbnail && scene) {
    ctx.fillStyle = 'rgba(14, 7, 20, 0.84)';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 92);
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.60)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 92);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 92);
    ctx.stroke();
    ctx.fillStyle = '#fffbeb';
    ctx.font = '700 42px system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} · ${scene.zh}`, 34, PANEL_SIZE - 46);
  }

  ctx.restore();
}
