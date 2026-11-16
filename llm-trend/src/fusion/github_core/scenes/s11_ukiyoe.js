// src/fusion/github_core/scenes/s11_ukiyoe.js
// 11 · 慢思考与深度推理 (2025 · Test-Time Compute & Chain-of-Thought)
// Visual Signature:
// - Crystalline slate-navy & radiant 24K gold reasoning sanctum (#0b1324, #f59e0b, #38bdf8, #fef08a).
// - Sky-spanning Fractal Monte-Carlo / Chain-of-Thought Reasoning Tree: exploratory cyan branches
//   grow outward (localT-driven), dead-end branches prune with soft coral/slate fade, and the
//   verified optimal reasoning path illuminates in blazing 24K Gold from root to solution crown.
// - Cyber-Rider Agent-01 rendered with golden CoT reasoning halo (`halo: true`) + orbiting 3D thought-crystals.

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

let _cachedTree = null;

/**
 * Deterministically builds the Fractal MCTS / Chain-of-Thought Reasoning Tree once.
 */
function getCoTTree() {
  if (_cachedTree) return _cachedTree;

  const rng = makePRNG(hashSeed('s11_cot_mcts_tree_2025_v1'));
  const nodes = [];
  const edges = [];

  // Optimal verified 6-hop reasoning spine from Sanctum Root (500, 556) to Solution Crown (658, 94)
  const optimalPts = [
    { x: 500, y: 556, label: 'PROMPT', val: 'V=0.50' },
    { x: 458, y: 472, label: 'DECOMPOSE', val: 'V=0.68' },
    { x: 516, y: 390, label: 'HYPOTHESIS', val: 'V=0.79' },
    { x: 476, y: 306, label: 'BACKTRACK✓', val: 'V=0.88' },
    { x: 548, y: 226, label: 'LEMMA', val: 'V=0.94' },
    { x: 608, y: 154, label: 'VERIFY', val: 'V=0.98' },
    { x: 658, y: 94, label: 'Q.E.D.', val: 'V=1.00' },
  ];

  for (let d = 0; d < optimalPts.length; d++) {
    const pt = optimalPts[d];
    nodes.push({
      id: d,
      x: pt.x,
      y: pt.y,
      depth: d,
      kind: 'optimal',
      label: pt.label,
      val: pt.val,
      optIdx: d,
    });
    if (d > 0) {
      const prev = optimalPts[d - 1];
      const mx = (prev.x + pt.x) * 0.5 + (d % 2 === 0 ? -24 : 24);
      const my = lerp(prev.y, pt.y, 0.48);
      edges.push({
        from: d - 1,
        to: d,
        p0: { x: prev.x, y: prev.y },
        c1: { x: lerp(prev.x, mx, 0.75), y: lerp(prev.y, my, 0.65) },
        c2: { x: lerp(pt.x, mx, 0.65), y: lerp(pt.y, my, 0.35) },
        p1: { x: pt.x, y: pt.y },
        depth: d,
        kind: 'optimal',
        optSegment: d - 1,
        t0: 0.08 + (d - 1) * 0.34,
        t1: 0.48 + (d - 1) * 0.34,
        tPrune: 99,
      });
    }
  }

  // Recursive exploratory & dead-end MCTS subtree generator
  function spawnBranch(parentNode, angle, length, depth, maxDepth, branchBias) {
    if (depth > maxDepth) return;
    const nx = clamp(parentNode.x + Math.cos(angle) * length, 64, PANEL_SIZE - 64);
    const ny = clamp(parentNode.y + Math.sin(angle) * length, 68, 545);
    const isDeadEnd = depth >= maxDepth || (depth >= 3 && rng() < 0.48);
    const kind = isDeadEnd ? 'pruned' : 'explore';

    const nodeId = nodes.length;
    const t0 = 0.12 + (depth - 1) * 0.33 + rng() * 0.14;
    const t1 = t0 + 0.36 + rng() * 0.12;
    const tPrune = kind === 'pruned' ? t1 + 0.24 + rng() * 0.32 : 99;

    nodes.push({
      id: nodeId,
      x: nx,
      y: ny,
      depth,
      kind,
      tAppear: t1,
      tPrune,
      score: (0.18 + rng() * 0.56).toFixed(2),
    });

    const bend = (rng() - 0.5) * 28 + branchBias * 12;
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    edges.push({
      from: parentNode.id,
      to: nodeId,
      p0: { x: parentNode.x, y: parentNode.y },
      c1: {
        x: lerp(parentNode.x, nx, 0.36) + perpX * bend,
        y: lerp(parentNode.y, ny, 0.36) + perpY * bend,
      },
      c2: {
        x: lerp(parentNode.x, nx, 0.72) + perpX * bend * 0.5,
        y: lerp(parentNode.y, ny, 0.72) + perpY * bend * 0.5,
      },
      p1: { x: nx, y: ny },
      depth,
      kind,
      t0,
      t1,
      tPrune,
    });

    if (!isDeadEnd && depth < maxDepth) {
      const childCount = depth <= 2 ? 2 + (rng() < 0.45 ? 1 : 0) : rng() < 0.65 ? 2 : 1;
      const spread = lerp(0.56, 0.34, depth / maxDepth);
      for (let c = 0; c < childCount; c++) {
        const frac = childCount === 1 ? (rng() - 0.5) * 0.5 : (c / (childCount - 1)) * 2 - 1;
        const nextAngle = angle + frac * spread + (rng() - 0.5) * 0.14;
        const clampedAngle = clamp(nextAngle, -Math.PI + 0.28, -0.28);
        spawnBranch(
          nodes[nodeId],
          clampedAngle,
          length * (0.76 + rng() * 0.12),
          depth + 1,
          maxDepth,
          frac
        );
      }
    }
  }

  // Fan rich MCTS search subtrees left & right off the optimal spine nodes
  const fanConfigs = [
    { optIdx: 0, angles: [-2.42, -2.02, -1.08, -0.68], len: 108, maxD: 5 },
    { optIdx: 1, angles: [-2.36, -1.86, -0.84], len: 94, maxD: 5 },
    { optIdx: 2, angles: [-2.25, -1.02, -0.62], len: 86, maxD: 6 },
    { optIdx: 3, angles: [-2.32, -1.78, -0.78], len: 78, maxD: 6 },
    { optIdx: 4, angles: [-2.12, -0.72], len: 68, maxD: 6 },
    { optIdx: 5, angles: [-2.05, -0.66], len: 56, maxD: 6 },
  ];

  for (const cfg of fanConfigs) {
    const rootNode = nodes[cfg.optIdx];
    for (let i = 0; i < cfg.angles.length; i++) {
      const a = cfg.angles[i];
      spawnBranch(
        rootNode,
        a,
        cfg.len * (0.9 + rng() * 0.18),
        cfg.optIdx + 1,
        cfg.maxD,
        a < -1.57 ? -1 : 1
      );
    }
  }

  _cachedTree = { nodes, edges, optimalPts };
  return _cachedTree;
}

function evalCubicPt(e, u) {
  const iu = 1 - u;
  const b0 = iu * iu * iu;
  const b1 = 3 * iu * iu * u;
  const b2 = 3 * iu * u * u;
  const b3 = u * u * u;
  return {
    x: b0 * e.p0.x + b1 * e.c1.x + b2 * e.c2.x + b3 * e.p1.x,
    y: b0 * e.p0.y + b1 * e.c1.y + b2 * e.c2.y + b3 * e.p1.y,
  };
}

function strokePartialCubic(ctx, e, uEnd, segs = 14) {
  if (uEnd <= 0.005) return;
  ctx.beginPath();
  ctx.moveTo(e.p0.x, e.p0.y);
  const steps = Math.max(2, Math.ceil(segs * uEnd));
  for (let i = 1; i <= steps; i++) {
    const pt = evalCubicPt(e, (i / steps) * uEnd);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();
}

function drawDiamond(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - ry);
  ctx.lineTo(cx + rx, cy);
  ctx.lineTo(cx, cy + ry);
  ctx.lineTo(cx - rx, cy);
  ctx.closePath();
}

/**
 * Bakes the static 1000x1000 Crystalline Slate-Navy & Radiant Gold Reasoning Sanctum.
 */
function getSanctumBackdrop(kit) {
  return kit.bake2D('s11_cot_sanctum_bg_v1', (_g, bctx, rng, w, h) => {
    // 1. Deep Crystalline Slate-Navy Sanctum Sky
    const skyG = bctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    skyG.addColorStop(0.0, '#060b16');
    skyG.addColorStop(0.42, '#0b1324');
    skyG.addColorStop(0.82, '#111e38');
    skyG.addColorStop(1.0, '#182848');
    bctx.fillStyle = skyG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // Subtle radial golden-cyan sanctum dome glow around the reasoning tree heart
    const domeG = bctx.createRadialGradient(540, 290, 20, 520, 320, 480);
    domeG.addColorStop(0.0, 'rgba(245, 158, 11, 0.11)');
    domeG.addColorStop(0.42, 'rgba(56, 189, 248, 0.08)');
    domeG.addColorStop(1.0, 'rgba(11, 19, 36, 0)');
    bctx.fillStyle = domeG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // 2. Sacred Neural Astrolabe Rings & Crystalline Facet Lattice
    bctx.save();
    bctx.strokeStyle = 'rgba(56, 189, 248, 0.075)';
    bctx.lineWidth = 1.0;
    for (const r of [160, 265, 375, 485]) {
      bctx.beginPath();
      bctx.arc(500, 556, r, Math.PI, Math.PI * 2);
      bctx.stroke();
    }

    // Radial reasoning sector rays from Root (500, 556)
    bctx.strokeStyle = 'rgba(148, 163, 184, 0.055)';
    for (let i = 1; i < 12; i++) {
      const a = Math.PI + (i / 12) * Math.PI;
      bctx.beginPath();
      bctx.moveTo(500 + Math.cos(a) * 70, 556 + Math.sin(a) * 70);
      bctx.lineTo(500 + Math.cos(a) * 520, 556 + Math.sin(a) * 520);
      bctx.stroke();
    }

    // Fine crystalline background dust stars
    for (let i = 0; i < 150; i++) {
      const sx = rng() * w;
      const sy = rng() * (ROAD_EDGE_Y - 60);
      const sr = 0.6 + rng() * 1.4;
      bctx.fillStyle =
        i % 5 === 0
          ? `rgba(254, 240, 138, ${(0.18 + rng() * 0.35).toFixed(2)})`
          : `rgba(56, 189, 248, ${(0.12 + rng() * 0.28).toFixed(2)})`;
      bctx.fillRect(sx, sy, sr, sr);
    }
    bctx.restore();

    // 3. Distant Crystalline Compute Monoliths along Horizon (y = 480..680)
    for (let i = 0; i < 22; i++) {
      const mx = i * 48 - 10 + (rng() - 0.5) * 14;
      const mw = 26 + rng() * 24;
      const distCenter = Math.abs(mx + mw * 0.5 - 500);
      const mh = 52 + (distCenter / 500) * 115 + rng() * 34;
      const my = ROAD_EDGE_Y - mh;

      const pilG = bctx.createLinearGradient(mx, my, mx, ROAD_EDGE_Y);
      pilG.addColorStop(0, 'rgba(30, 41, 59, 0.68)');
      pilG.addColorStop(1, 'rgba(11, 19, 36, 0.94)');
      bctx.fillStyle = pilG;
      bctx.beginPath();
      bctx.moveTo(mx, ROAD_EDGE_Y);
      bctx.lineTo(mx, my + 12);
      bctx.lineTo(mx + mw * 0.5, my);
      bctx.lineTo(mx + mw, my + 12);
      bctx.lineTo(mx + mw, ROAD_EDGE_Y);
      bctx.closePath();
      bctx.fill();

      bctx.strokeStyle = i % 3 === 0 ? 'rgba(245, 158, 11, 0.22)' : 'rgba(56, 189, 248, 0.18)';
      bctx.lineWidth = 1;
      bctx.stroke();
    }

    // Central Reasoning Root Sanctum Pedestal at (500, 556..680)
    const pedG = bctx.createLinearGradient(465, 556, 535, ROAD_EDGE_Y);
    pedG.addColorStop(0, '#1e293b');
    pedG.addColorStop(1, '#09101f');
    bctx.fillStyle = pedG;
    bctx.beginPath();
    bctx.moveTo(456, ROAD_EDGE_Y);
    bctx.lineTo(482, 566);
    bctx.lineTo(500, 554);
    bctx.lineTo(518, 566);
    bctx.lineTo(544, ROAD_EDGE_Y);
    bctx.closePath();
    bctx.fill();
    bctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
    bctx.lineWidth = 1.6;
    bctx.stroke();

    // 4. Sanctum Telemetry Header (subtle architectural engraving)
    bctx.save();
    bctx.fillStyle = 'rgba(56, 189, 248, 0.52)';
    bctx.font = '600 12px "SF Mono", "Menlo", monospace';
    bctx.fillText('ACT XI // TEST-TIME COMPUTE & CHAIN-OF-THOUGHT', 34, 38);
    bctx.fillStyle = 'rgba(245, 158, 11, 0.65)';
    bctx.fillText('MCTS ROLLOUTS -> PRUNE -> OPTIMAL GOLD VERIFICATION', 34, 56);
    bctx.restore();

    // 5. Polished Slate-Obsidian Reflective Causeway (y = 680..1000)
    const floorG = bctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
    floorG.addColorStop(0.0, '#0d182e');
    floorG.addColorStop(0.16, '#081020');
    floorG.addColorStop(1.0, '#040811');
    bctx.fillStyle = floorG;
    bctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

    // Perspective sanctum floor grid converging toward (500, 556)
    bctx.save();
    bctx.beginPath();
    bctx.rect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);
    bctx.clip();

    bctx.strokeStyle = 'rgba(56, 189, 248, 0.11)';
    bctx.lineWidth = 1;
    for (let k = -10; k <= 10; k++) {
      bctx.beginPath();
      bctx.moveTo(500 + k * 42, ROAD_EDGE_Y);
      bctx.lineTo(500 + k * 145, h);
      bctx.stroke();
    }
    for (let r = 1; r <= 7; r++) {
      const ry = ROAD_EDGE_Y + Math.pow(r / 7, 1.65) * (h - ROAD_EDGE_Y - 12);
      bctx.strokeStyle = r % 2 === 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(56, 189, 248, 0.10)';
      bctx.beginPath();
      bctx.moveTo(0, ry);
      bctx.lineTo(w, ry);
      bctx.stroke();
    }
    bctx.restore();

    // Radiant 24K Gold + Cyan Horizon Road Seam at y = 680 (100% C1 continuous across x = 0..1000)
    const roadGlow = bctx.createLinearGradient(0, ROAD_EDGE_Y - 10, 0, ROAD_EDGE_Y + 14);
    roadGlow.addColorStop(0, 'rgba(245, 158, 11, 0)');
    roadGlow.addColorStop(0.45, 'rgba(245, 158, 11, 0.34)');
    roadGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    bctx.fillStyle = roadGlow;
    bctx.fillRect(0, ROAD_EDGE_Y - 10, w, 24);

    bctx.strokeStyle = '#f59e0b';
    bctx.lineWidth = 3.0;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y);
    bctx.lineTo(w, ROAD_EDGE_Y);
    bctx.stroke();

    bctx.strokeStyle = '#fef08a';
    bctx.lineWidth = 1.1;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y - 0.8);
    bctx.lineTo(w, ROAD_EDGE_Y - 0.8);
    bctx.stroke();
  }, PANEL_SIZE, PANEL_SIZE);
}

/**
 * Renders the dynamic Fractal MCTS / CoT Tree in the sanctum sky + floor reflection.
 */
function drawReasoningTree(ctx, tree, localT, t, isOutroThumbnail) {
  const simT = isOutroThumbnail ? 4.8 : localT;
  const goldProgress = isOutroThumbnail ? 1.0 : smootherstep(2.45, 3.55, localT);
  const numOptSegs = tree.optimalPts.length - 1; // 6 segments
  const goldScaled = goldProgress * numOptSegs;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Exploratory & Pruned MCTS Branches
  for (let i = 0; i < tree.edges.length; i++) {
    const e = tree.edges[i];
    if (e.kind === 'optimal') continue;

    const growU = clamp((simT - e.t0) / (e.t1 - e.t0), 0, 1);
    if (growU <= 0.01) continue;

    if (e.kind === 'pruned' && simT > e.tPrune) {
      const pruneAge = clamp((simT - e.tPrune) / 0.55, 0, 1);
      // Soft coral-red prune flash settling into dim slate-navy
      const r = Math.round(lerp(248, 71, pruneAge));
      const g = Math.round(lerp(113, 85, pruneAge));
      const b = Math.round(lerp(113, 105, pruneAge));
      const a = lerp(0.68, 0.22, pruneAge);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
      ctx.lineWidth = lerp(2.0, 1.15, pruneAge);
      strokePartialCubic(ctx, e, growU, 10);

      // Tiny × pruned marker at dead-end tip
      if (growU >= 0.99) {
        const sz = 3.2;
        ctx.strokeStyle = `rgba(248, 113, 113, ${lerp(0.85, 0.32, pruneAge).toFixed(3)})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(e.p1.x - sz, e.p1.y - sz);
        ctx.lineTo(e.p1.x + sz, e.p1.y + sz);
        ctx.moveTo(e.p1.x + sz, e.p1.y - sz);
        ctx.lineTo(e.p1.x - sz, e.p1.y + sz);
        ctx.stroke();
      }
    } else {
      // Active exploratory cyan rollout branch
      const dimFactor = lerp(1.0, 0.42, goldProgress);
      const alpha = (0.34 + (1 - e.depth / 7) * 0.36) * dimFactor;
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha.toFixed(3)})`;
      ctx.lineWidth = Math.max(1.1, (3.1 - e.depth * 0.32));
      strokePartialCubic(ctx, e, growU, 12);

      // Traveling Monte-Carlo rollout evaluation spark
      if (growU < 1.0) {
        const tip = evalCubicPt(e, growU);
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (i % 3 === 0 && goldProgress < 0.95) {
        const pulseU = ((t * 1.35 + i * 0.21) % 1 + 1) % 1;
        const pt = evalCubicPt(e, pulseU);
        ctx.fillStyle = `rgba(125, 211, 252, ${(0.65 * dimFactor).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Exploratory cyan nodes
  for (let i = 0; i < tree.nodes.length; i++) {
    const nd = tree.nodes[i];
    if (nd.kind !== 'explore' || simT < nd.tAppear) continue;
    const dimFactor = lerp(1.0, 0.45, goldProgress);
    ctx.fillStyle = `rgba(56, 189, 248, ${(0.72 * dimFactor).toFixed(3)})`;
    drawDiamond(ctx, nd.x, nd.y, 3.4, 3.4);
    ctx.fill();
  }

  // 2. Optimal Spine: First grows in bright electric cyan, then blazes in 24K Gold!
  for (const e of tree.edges) {
    if (e.kind !== 'optimal') continue;
    const growU = clamp((simT - e.t0) / (e.t1 - e.t0), 0, 1);
    if (growU <= 0.01) continue;

    // Base cyan exploratory trace of optimal path
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.72)';
    ctx.lineWidth = 3.2;
    strokePartialCubic(ctx, e, growU, 16);

    // 24K Gold illumination wave surging from root -> solution crown
    const segGoldU = clamp(goldScaled - e.optSegment, 0, 1);
    if (segGoldU > 0.005) {
      // Wide 24K golden aura
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.26)';
      ctx.lineWidth = 15.0;
      strokePartialCubic(ctx, e, segGoldU, 18);

      // Mid radiant gold body
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6.2;
      strokePartialCubic(ctx, e, segGoldU, 18);

      // Brilliant 24K specular core
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.4;
      strokePartialCubic(ctx, e, segGoldU, 18);

      // Streaming golden verification token along locked spine
      const flowU = ((t * 1.8 - e.optSegment * 0.22) % 1 + 1) % 1;
      if (flowU <= segGoldU) {
        const fp = evalCubicPt(e, flowU);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fp.x, fp.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Optimal Spine Crystalline Nodes & Solution Crown Starburst
  for (let d = 0; d < tree.optimalPts.length; d++) {
    const pt = tree.optimalPts[d];
    const appearT = d === 0 ? 0 : 0.35 + (d - 1) * 0.34;
    if (simT < appearT) continue;

    const nodeGold = d === 0 ? clamp(goldProgress * 3, 0, 1) : clamp(goldScaled - (d - 1), 0, 1);
    const isCrown = d === tree.optimalPts.length - 1;
    const pulse = 1 + 0.1 * Math.sin(t * 5.2 + d);

    if (nodeGold > 0.02) {
      const glowR = (isCrown ? 54 : 24) * nodeGold * pulse;
      const ng = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, glowR);
      ng.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
      ng.addColorStop(0.45, 'rgba(245, 158, 11, 0.36)');
      ng.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Crown rotating astrolabe halo & starburst
    if (isCrown && nodeGold > 0.15) {
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(t * 0.65);
      ctx.strokeStyle = `rgba(254, 240, 138, ${(0.82 * nodeGold).toFixed(3)})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 26 * nodeGold, 0, Math.PI * 2);
      ctx.stroke();
      for (let r = 0; r < 8; r++) {
        const a = (r * Math.PI) / 4;
        const rIn = 12 * nodeGold;
        const rOut = (r % 2 === 0 ? 36 : 22) * nodeGold * pulse;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
        ctx.lineTo(Math.cos(a) * rOut, Math.sin(a) * rOut);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Faceted crystal diamond
    const rx = (isCrown ? 11.5 : 7.5) * lerp(0.8, 1.12, nodeGold);
    const ry = (isCrown ? 14.5 : 9.5) * lerp(0.8, 1.12, nodeGold);
    ctx.fillStyle = nodeGold > 0.5 ? '#f59e0b' : '#0ea5e9';
    ctx.strokeStyle = nodeGold > 0.5 ? '#fef08a' : '#bae6fd';
    ctx.lineWidth = 1.8;
    drawDiamond(ctx, pt.x, pt.y, rx, ry);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    drawDiamond(ctx, pt.x, pt.y, rx * 0.42, ry * 0.42);
    ctx.fill();

    // Crisp reasoning step badge next to optimal crystal
    if (nodeGold > 0.35 && !isOutroThumbnail) {
      const side = d % 2 === 0 ? 1 : -1;
      const lx = pt.x + side * (isCrown ? 42 : 16);
      ctx.font = '700 10.5px "SF Mono", "Menlo", monospace';
      ctx.textAlign = side > 0 ? 'left' : 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(254, 240, 138, ${(0.9 * nodeGold).toFixed(3)})`;
      ctx.fillText(`${pt.label} · ${pt.val}`, lx, pt.y);
    }
  }

  // 4. Subtle Golden Reflection on Polished Sanctum Floor (y > 680)
  if (goldProgress > 0.05) {
    const reflG = ctx.createRadialGradient(
      540,
      ROAD_EDGE_Y + 6,
      8,
      560,
      ROAD_EDGE_Y + 80,
      260
    );
    reflG.addColorStop(0, `rgba(245, 158, 11, ${(0.28 * goldProgress).toFixed(3)})`);
    reflG.addColorStop(0.5, `rgba(56, 189, 248, ${(0.10 * goldProgress).toFixed(3)})`);
    reflG.addColorStop(1, 'rgba(11, 19, 36, 0)');
    ctx.fillStyle = reflG;
    ctx.fillRect(180, ROAD_EDGE_Y, 680, 180);
  }

  ctx.restore();
}

/**
 * Draws orbiting thought-crystal nodes & neural uplink around the Cyber-Rider's golden CoT halo.
 */
function drawOrbitingThoughtCrystals(ctx, rig, tree, t, localT, isFrontPass) {
  const s = rig.root.scale;
  const cx = rig.head.x;
  const cy = rig.head.y - 26 * s;
  const rx = 36 * s;
  const ry = 10.5 * s;
  const tilt = -0.12;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  ctx.save();

  // Back pass also renders the golden/cyan CoT neural uplink beam from rider halo to tree root/frontier
  if (!isFrontPass) {
    const rootPt = tree.optimalPts[0];
    const beamG = ctx.createLinearGradient(cx, cy, rootPt.x, rootPt.y);
    beamG.addColorStop(0, 'rgba(254, 240, 138, 0.62)');
    beamG.addColorStop(0.5, 'rgba(56, 189, 248, 0.28)');
    beamG.addColorStop(1, 'rgba(245, 158, 11, 0.45)');
    ctx.strokeStyle = beamG;
    ctx.lineWidth = 2.0 * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(
      lerp(cx, rootPt.x, 0.5),
      Math.min(cy, rootPt.y) - 48,
      rootPt.x,
      rootPt.y
    );
    ctx.stroke();

    // Outer radiant CoT orbit track
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.36)';
    ctx.lineWidth = 1.4 * s;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, tilt, 0, Math.PI * 2);
    ctx.stroke();
  }

  const count = 5;
  for (let i = 0; i < count; i++) {
    const a = t * 3.1 + (i * Math.PI * 2) / count;
    const sinA = Math.sin(a);
    const inFront = sinA >= 0;
    if (inFront !== isFrontPass) continue;

    const lx = Math.cos(a) * rx;
    const ly = sinA * ry;
    const px = cx + lx * cosT - ly * sinT;
    const py = cy + lx * sinT + ly * cosT + Math.sin(t * 6 + i) * 1.8 * s;
    const depthScale = (0.78 + 0.28 * ((sinA + 1) * 0.5)) * s;
    const isGold = i % 2 === 0 || localT > 2.6;

    // Soft crystal glow
    ctx.fillStyle = isGold ? 'rgba(254, 240, 138, 0.32)' : 'rgba(56, 189, 248, 0.30)';
    ctx.beginPath();
    ctx.arc(px, py, 8.5 * depthScale, 0, Math.PI * 2);
    ctx.fill();

    // Faceted polyhedral thought crystal
    ctx.fillStyle = isGold ? '#f59e0b' : '#38bdf8';
    ctx.strokeStyle = isGold ? '#fef08a' : '#e0f2fe';
    ctx.lineWidth = 1.3 * depthScale;
    drawDiamond(ctx, px, py, 4.6 * depthScale, 6.6 * depthScale);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

export function render(kit, slot, scene, params) {
  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;

  const t = params?.t ?? 0;
  const localT = params?.localT ?? 0;
  const pelicanLocalX = params?.pelicanLocalX ?? 500;
  const pedalAngle = params?.pedalAngle ?? 0;
  const speedScale = params?.speedScale ?? 1.0;
  const hidePelican = Boolean(params?.hidePelican);
  const isOutroThumbnail = Boolean(params?.isOutroThumbnail);

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Static Baked Crystalline Slate-Navy & Gold Sanctum
  const bg = getSanctumBackdrop(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Dynamic Sky-Spanning Fractal MCTS / Chain-of-Thought Reasoning Tree
  const tree = getCoTTree();
  drawReasoningTree(ctx, tree, localT, t, isOutroThumbnail);

  // 3. Cyber-Rider Agent-01 with Golden CoT Halo & Orbiting Thought-Crystals
  if (!hidePelican && pelicanLocalX >= -260 && pelicanLocalX <= 1260) {
    const rig = computePelicanRig({
      x: pelicanLocalX,
      y: ROAD_EDGE_Y,
      pedalAngle,
      scale: 1.0,
      slope: 0,
      speedScale,
      time: t,
    });

    drawOrbitingThoughtCrystals(ctx, rig, tree, t, localT, false);

    drawRig2D(ctx, rig, {
      featherFill: '#f1f5f9',
      featherShade: '#94a3b8',
      wingTipDark: '#0f172a',
      beakFill: '#38bdf8',
      pouchFill: '#f59e0b',
      legFill: '#cbd5e1',
      frameStroke: '#fbbf24',
      metalStroke: '#64748b',
      tireStroke: '#0b1324',
      inkOutline: '#060b16',
      glowColor: '#fef08a',
      halo: true,
    });

    drawOrbitingThoughtCrystals(ctx, rig, tree, t, localT, true);
  }

  // 4. Outro Gallery Thumbnail Label
  if (isOutroThumbnail && scene) {
    ctx.fillStyle = 'rgba(11, 19, 36, 0.84)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 96);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 96);
    ctx.stroke();
    ctx.fillStyle = '#fef08a';
    ctx.font = '700 46px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
