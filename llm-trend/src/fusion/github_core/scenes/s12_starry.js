// src/fusion/github_core/scenes/s12_starry.js
// 12 · 自主编程智能体 (2025 · Autonomous Coding Agents & Self-Building Road)
// Visual Signature:
// - Deep emerald-obsidian software foundry (#081014, #4ade80, #38bdf8, #a78bfa).
// - Floating multi-pane holographic terminal windows, Git commit DAG graph, and glowing AST syntax
//   trees in the upper sky, with emerald `✓ PASS` verification badges lighting up on every beat.
// - Signature Gag on y = 680: Self-Assembling Code Bridge — ahead of `pelicanLocalX`
//   (`pelicanLocalX + 40 .. +220`), glowing wireframe segments materialize just in time and
//   solidify into neon-emerald glass road tiles right beneath the front wheel!

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

const TILE_W = 40;
const NUM_TILES = PANEL_SIZE / TILE_W; // 25 tiles across 0..1000

const CODE_TOKENS = [
  'fn build()', 'async =>', 'impl Road', 'Ok(tile)', 'assert!()',
  '#[verify]', 'let span', 'pub mod', 'await?', 'Tensor<4>',
];

const TEST_SPECS = [
  '01 parse_ast_ir',
  '02 typecheck_fn',
  '03 borrow_verify',
  '04 synth_mesh_x',
  '05 link_shaders',
  '06 align_edge_y',
  '07 zero_alloc',
  '08bounds_proof',
  '09 git_dag_merge',
  '10 sandbox_exec',
  '11 bench_60fps',
  '12 bridge_ready',
];

const AST_NODES = [
  { id: 0, x: 515, y: 118, label: 'Program', col: '#a78bfa' },
  { id: 1, x: 442, y: 176, label: 'AgentLoop', col: '#38bdf8' },
  { id: 2, x: 588, y: 176, label: 'SynthRoad', col: '#4ade80' },
  { id: 3, x: 406, y: 238, label: 'PlanDiff', col: '#38bdf8' },
  { id: 4, x: 482, y: 238, label: 'TestRun', col: '#a78bfa' },
  { id: 5, x: 554, y: 238, label: 'WireTile', col: '#38bdf8' },
  { id: 6, x: 626, y: 238, label: 'Solidify', col: '#4ade80' },
];

const AST_EDGES = [
  [0, 1], [0, 2],
  [1, 3], [1, 4],
  [2, 5], [2, 6],
];

const GIT_COMMITS = [
  { x: 408, y: 316, branch: 'main', col: '#4ade80' },
  { x: 454, y: 316, branch: 'main', col: '#4ade80' },
  { x: 496, y: 292, branch: 'feat', col: '#a78bfa' },
  { x: 542, y: 292, branch: 'feat', col: '#a78bfa' },
  { x: 520, y: 338, branch: 'fix', col: '#38bdf8' },
  { x: 588, y: 316, branch: 'merge', col: '#4ade80' },
  { x: 632, y: 316, branch: 'HEAD', col: '#4ade80' },
];

const GIT_LINKS = [
  [0, 1], [1, 2], [2, 3], [1, 4], [3, 5], [4, 5], [5, 6],
];

/**
 * Draws a crisp holographic terminal pane frame during background bake.
 */
function bakeHoloWindow(bctx, x, y, w, h, title, accent) {
  bctx.save();
  const bg = bctx.createLinearGradient(x, y, x, y + h);
  bg.addColorStop(0, 'rgba(12, 24, 30, 0.86)');
  bg.addColorStop(1, 'rgba(6, 13, 17, 0.90)');
  bctx.fillStyle = bg;
  bctx.strokeStyle = accent;
  bctx.lineWidth = 1.4;
  bctx.beginPath();
  bctx.roundRect(x, y, w, h, 8);
  bctx.fill();
  bctx.stroke();

  // Header bar
  bctx.fillStyle = 'rgba(20, 38, 46, 0.92)';
  bctx.beginPath();
  bctx.roundRect(x + 1, y + 1, w - 2, 26, [7, 7, 0, 0]);
  bctx.fill();

  // Window control dots
  const dots = ['#fb7185', '#fbbf24', '#4ade80'];
  for (let i = 0; i < 3; i++) {
    bctx.fillStyle = dots[i];
    bctx.beginPath();
    bctx.arc(x + 15 + i * 13, y + 14, 3.6, 0, Math.PI * 2);
    bctx.fill();
  }

  bctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
  bctx.font = '600 11px "SF Mono", "Menlo", monospace';
  bctx.fillText(title, x + 58, y + 18);
  bctx.restore();
}

/**
 * Bakes the static 1000x1000 Deep Emerald-Obsidian Software Foundry & Holographic IDE Frames.
 */
function getFoundryBackdrop(kit) {
  return kit.bake2D('s12_swe_foundry_bg_v1', (_g, bctx, rng, w, h) => {
    // 1. Deep Emerald-Obsidian Foundry Atmosphere
    const skyG = bctx.createLinearGradient(0, 0, 0, h);
    skyG.addColorStop(0.0, '#04090c');
    skyG.addColorStop(0.45, '#081014');
    skyG.addColorStop(0.72, '#0b191f');
    skyG.addColorStop(1.0, '#030709');
    bctx.fillStyle = skyG;
    bctx.fillRect(0, 0, w, h);

    // Subtle ambient volumetric glow behind holographic workspaces
    const ambG = bctx.createRadialGradient(500, 260, 30, 500, 310, 480);
    ambG.addColorStop(0.0, 'rgba(74, 222, 128, 0.09)');
    ambG.addColorStop(0.55, 'rgba(56, 189, 248, 0.06)');
    ambG.addColorStop(1.0, 'rgba(8, 16, 20, 0)');
    bctx.fillStyle = ambG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // 2. Vertical Circuit / Code Column Matrix in Deep Background
    bctx.strokeStyle = 'rgba(74, 222, 128, 0.045)';
    bctx.lineWidth = 1;
    for (let x = 20; x < w; x += 40) {
      bctx.beginPath();
      bctx.moveTo(x, 0);
      bctx.lineTo(x, h);
      bctx.stroke();
    }
    for (let y = 40; y < ROAD_EDGE_Y; y += 40) {
      bctx.strokeStyle = 'rgba(56, 189, 248, 0.035)';
      bctx.beginPath();
      bctx.moveTo(0, y);
      bctx.lineTo(w, y);
      bctx.stroke();
    }

    // Distant holographic server towers along y = 420..680
    for (let i = 0; i < 18; i++) {
      const sx = i * 58 + (rng() - 0.5) * 12;
      const sw = 34 + rng() * 18;
      const sh = 90 + rng() * 150;
      const sy = ROAD_EDGE_Y - sh;
      bctx.fillStyle = 'rgba(10, 22, 27, 0.72)';
      bctx.fillRect(sx, sy, sw, sh);
      bctx.strokeStyle = i % 2 === 0 ? 'rgba(74, 222, 128, 0.14)' : 'rgba(56, 189, 248, 0.12)';
      bctx.strokeRect(sx, sy, sw, sh);

      for (let ly = sy + 10; ly < ROAD_EDGE_Y - 12; ly += 14) {
        if (rng() < 0.45) continue;
        bctx.fillStyle =
          rng() < 0.65 ? 'rgba(74, 222, 128, 0.22)' : 'rgba(167, 139, 250, 0.22)';
        bctx.fillRect(sx + 6, ly, sw - 12, 2.2);
      }
    }

    // 3. Three Floating Multi-Pane Holographic Workspaces in Upper Sky
    // Left Pane: Autonomous SWE Diff & Shell Terminal
    bakeHoloWindow(bctx, 36, 52, 316, 316, 'swe-agent // road_synth.rs', 'rgba(56, 189, 248, 0.55)');

    // Center Pane: AST Syntax Tree + Git Commit DAG Graph
    bakeHoloWindow(bctx, 372, 52, 286, 316, 'ast-tree & git-dag // main', 'rgba(167, 139, 250, 0.58)');

    // Divider inside center pane between AST (top) and Git DAG (bottom)
    bctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    bctx.beginPath();
    bctx.moveTo(384, 272);
    bctx.lineTo(646, 272);
    bctx.stroke();
    bctx.fillStyle = 'rgba(167, 139, 250, 0.72)';
    bctx.font = '600 9.5px "SF Mono", "Menlo", monospace';
    bctx.fillText('AST :: AbstractSyntaxTree', 386, 96);
    bctx.fillStyle = 'rgba(56, 189, 248, 0.72)';
    bctx.fillText('GIT :: CommitGraph (DAG)', 386, 286);

    // Right Pane: Unit Test & Formal Verification Runner (12 beat slots)
    bakeHoloWindow(bctx, 678, 52, 286, 316, 'ci-runner // cargo test --all', 'rgba(74, 222, 128, 0.58)');

    // 4. Lower Compilation Chasm & Laser Support Pylons (y = 680..1000)
    const chasmG = bctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
    chasmG.addColorStop(0.0, '#071519');
    chasmG.addColorStop(0.25, '#050d10');
    chasmG.addColorStop(1.0, '#020507');
    bctx.fillStyle = chasmG;
    bctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

    // Vertical laser support stanchions under the bridge deck
    for (let px = 80; px < w; px += 140) {
      const pG = bctx.createLinearGradient(px, ROAD_EDGE_Y, px, h);
      pG.addColorStop(0, 'rgba(74, 222, 128, 0.28)');
      pG.addColorStop(1, 'rgba(56, 189, 248, 0.02)');
      bctx.strokeStyle = pG;
      bctx.lineWidth = 2;
      bctx.beginPath();
      bctx.moveTo(px, ROAD_EDGE_Y + 16);
      bctx.lineTo(px, h);
      bctx.stroke();

      bctx.strokeStyle = 'rgba(56, 189, 248, 0.09)';
      bctx.lineWidth = 1;
      bctx.beginPath();
      bctx.moveTo(px - 28, ROAD_EDGE_Y + 18);
      bctx.lineTo(px, ROAD_EDGE_Y + 56);
      bctx.lineTo(px + 28, ROAD_EDGE_Y + 18);
      bctx.stroke();
    }

    // Continuous blueprint guide baseline at y = 680 across x = 0..1000
    bctx.strokeStyle = 'rgba(56, 189, 248, 0.32)';
    bctx.lineWidth = 1.5;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y);
    bctx.lineTo(w, ROAD_EDGE_Y);
    bctx.stroke();
  }, PANEL_SIZE, PANEL_SIZE);
}

/**
 * Renders live streaming code diffs, glowing AST traversal, Git DAG pulses,
 * and beat-synced emerald `✓ PASS` verification badges!
 */
function drawSkyTerminalsAndBadges(ctx, localT, t, isOutroThumbnail) {
  const passedCount = isOutroThumbnail
    ? 10
    : clamp(Math.floor(localT / BEAT_SEC) + 1, 1, TEST_SPECS.length);
  const beatFrac = (localT / BEAT_SEC) - Math.floor(localT / BEAT_SEC);
  const beatFlash = isOutroThumbnail ? 0.4 : Math.exp(-beatFrac * 5.0);

  ctx.save();

  // --- PANE 1 (Left): Live Autonomous Code Patch Stream ---
  const codeLines = [
    { txt: '$ swe-agent --synthesize-bridge', col: '#94a3b8' },
    { txt: '@@ -42,6 +42,12 @@ impl Bridge {', col: '#a78bfa' },
    { txt: '-  road.wait_manual_layout();', col: '#fb7185' },
    { txt: '+  let ahead = agent.x + 140.0;', col: '#4ade80' },
    { txt: '+  let mesh = ast::compile(ahead);', col: '#4ade80' },
    { txt: '+  mesh.materialize_wireframe();', col: '#38bdf8' },
    { txt: '+  mesh.solidify_emerald_glass();', col: '#4ade80' },
    { txt: '+  assert!(mesh.y == 680.0);', col: '#4ade80' },
    { txt: '   Ok( RoadStatus::Verified )', col: '#e2e8f0' },
    { txt: '}', col: '#e2e8f0' },
    { txt: `> status: ${passedCount}/12 suites green`, col: '#4ade80' },
  ];

  const visibleLines = isOutroThumbnail
    ? codeLines.length
    : clamp(3 + Math.floor(localT * 2.2), 3, codeLines.length);

  ctx.font = '600 11.5px "SF Mono", "Menlo", monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  for (let i = 0; i < visibleLines; i++) {
    const ln = codeLines[i];
    const ly = 98 + i * 23;
    if (ln.txt.startsWith('+')) {
      ctx.fillStyle = 'rgba(74, 222, 128, 0.11)';
      ctx.fillRect(46, ly - 9, 294, 19);
    } else if (ln.txt.startsWith('-')) {
      ctx.fillStyle = 'rgba(251, 113, 133, 0.10)';
      ctx.fillRect(46, ly - 9, 294, 19);
    }
    ctx.fillStyle = ln.col;
    ctx.fillText(ln.txt, 52, ly);
  }

  // Blinking block cursor
  if (Math.sin(t * 9.0) > -0.2) {
    const curY = 98 + (visibleLines - 1) * 23;
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(298, curY - 7, 8, 14);
  }

  // --- PANE 2 (Center Top): Glowing AST Syntax Tree ---
  const activeAstIdx = Math.floor(t * 4.0) % AST_NODES.length;
  ctx.lineWidth = 1.8;
  for (let i = 0; i < AST_EDGES.length; i++) {
    const [aIdx, bIdx] = AST_EDGES[i];
    const na = AST_NODES[aIdx];
    const nb = AST_NODES[bIdx];
    const isLit = bIdx === activeAstIdx || aIdx === activeAstIdx;
    ctx.strokeStyle = isLit ? '#4ade80' : 'rgba(167, 139, 250, 0.48)';
    ctx.beginPath();
    ctx.moveTo(na.x, na.y + 10);
    ctx.bezierCurveTo(na.x, (na.y + nb.y) * 0.5, nb.x, (na.y + nb.y) * 0.5, nb.x, nb.y - 10);
    ctx.stroke();

    // Token pulse along AST edge
    const u = ((t * 1.9 + i * 0.27) % 1 + 1) % 1;
    const px = lerp(na.x, nb.x, u);
    const py = lerp(na.y + 10, nb.y - 10, u);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, py, 2.3, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < AST_NODES.length; i++) {
    const nd = AST_NODES[i];
    const isHot = i === activeAstIdx;
    ctx.fillStyle = isHot ? 'rgba(74, 222, 128, 0.25)' : 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = isHot ? '#4ade80' : nd.col;
    ctx.lineWidth = isHot ? 2.2 : 1.4;
    ctx.beginPath();
    ctx.roundRect(nd.x - 32, nd.y - 10, 64, 20, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isHot ? '#ffffff' : '#e2e8f0';
    ctx.font = '600 9.5px "SF Mono", "Menlo", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(nd.label, nd.x, nd.y + 0.5);
  }

  // --- PANE 2 (Center Bottom): Git Commit DAG Graph ---
  for (let i = 0; i < GIT_LINKS.length; i++) {
    const [c0, c1] = GIT_LINKS[i];
    const p0 = GIT_COMMITS[c0];
    const p1 = GIT_COMMITS[c1];
    ctx.strokeStyle = p1.col;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(lerp(p0.x, p1.x, 0.5), p0.y, lerp(p0.x, p1.x, 0.5), p1.y, p1.x, p1.y);
    ctx.stroke();
  }
  for (let i = 0; i < GIT_COMMITS.length; i++) {
    const c = GIT_COMMITS[i];
    const pulse = i === GIT_COMMITS.length - 1 ? 1 + 0.28 * beatFlash : 1;
    ctx.fillStyle = '#081014';
    ctx.strokeStyle = c.col;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5.5 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // --- PANE 3 (Right): Beat-Synced Emerald `✓ PASS` Verification Badges ---
  ctx.textAlign = 'left';
  for (let i = 0; i < TEST_SPECS.length; i++) {
    const col = i < 6 ? 0 : 1;
    const row = i % 6;
    const bx = 690 + col * 136;
    const by = 92 + row * 42;
    const isPassed = i < passedCount;
    const isJustLit = !isOutroThumbnail && i === passedCount - 1;

    ctx.fillStyle = isPassed
      ? isJustLit
        ? `rgba(74, 222, 128, ${(0.22 + 0.25 * beatFlash).toFixed(3)})`
        : 'rgba(20, 83, 45, 0.44)'
      : 'rgba(15, 23, 42, 0.55)';
    ctx.strokeStyle = isPassed ? '#4ade80' : 'rgba(100, 116, 139, 0.35)';
    ctx.lineWidth = isJustLit ? 2.0 : 1.2;
    ctx.beginPath();
    ctx.roundRect(bx, by, 128, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Expanding beat shockwave on newly verified badge
    if (isJustLit && beatFlash > 0.15) {
      ctx.strokeStyle = `rgba(74, 222, 128, ${(0.65 * beatFlash).toFixed(3)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(
        bx - 4 * (1 - beatFlash),
        by - 4 * (1 - beatFlash),
        128 + 8 * (1 - beatFlash),
        32 + 8 * (1 - beatFlash),
        8
      );
      ctx.stroke();
    }

    ctx.font = '700 10px "SF Mono", "Menlo", monospace';
    ctx.fillStyle = isPassed ? '#4ade80' : '#64748b';
    ctx.fillText(isPassed ? '✓ PASS' : '· WAIT', bx + 8, by + 11);

    ctx.font = '500 9px "SF Mono", "Menlo", monospace';
    ctx.fillStyle = isPassed ? '#dcfce7' : '#64748b';
    ctx.fillText(TEST_SPECS[i].slice(0, 13), bx + 8, by + 23);
  }

  // Floating Hero `✓ PASS` Holo-Banner flashing above the Self-Building Bridge ahead of the bike
  const bannerPulse = 0.78 + 0.22 * beatFlash;
  ctx.save();
  ctx.translate(515, 412);
  ctx.fillStyle = 'rgba(6, 28, 18, 0.85)';
  ctx.strokeStyle = `rgba(74, 222, 128, ${bannerPulse.toFixed(3)})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(-142, -17, 284, 34, 17);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#4ade80';
  ctx.font = '700 13px "SF Mono", "Menlo", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`✓ PASS · ${passedCount}/12 UNIT TESTS VERIFIED`, 0, 1);
  ctx.restore();

  ctx.restore();
}

/**
 * Signature Gag on y = 680: Self-Assembling Code Bridge!
 * - Behind & under front wheel (`<= pelicanLocalX + 68`): Solid Neon-Emerald Glass Road Tiles!
 * - Ahead (`pelicanLocalX + 40 .. +220`): Materializing Cyan/Violet Wireframe Segments snapping into y = 680!
 */
function drawSelfAssemblingCodeBridge(ctx, rig, pelicanLocalX, hidePelican, isOutroThumbnail, t) {
  const refX = hidePelican ? 520 : pelicanLocalX;

  ctx.save();

  for (let i = 0; i < NUM_TILES; i++) {
    const x0 = i * TILE_W;
    const xc = x0 + TILE_W * 0.5;
    const dx = xc - refX;

    // Ensure seamless solid boundary anchoring at x=0 and x=1000 when approached
    const isSolid = dx <= 72 || i === 0;
    const isWireframeZone = !isSolid && dx <= 236;

    if (isSolid) {
      // Newly solidified flash right beneath front wheel (frontWheel is around refX + 86)
      const lockFlash = clamp(1 - Math.abs(dx - 58) / 48, 0, 1);
      const wheelProx = clamp(1 - Math.abs(dx - 0) / 120, 0, 1);

      // Tempered neon-emerald glass slab (y = 680..700)
      const tileG = ctx.createLinearGradient(x0, ROAD_EDGE_Y, x0, ROAD_EDGE_Y + 20);
      tileG.addColorStop(
        0,
        lockFlash > 0.25 ? 'rgba(134, 239, 172, 0.85)' : 'rgba(16, 185, 129, 0.52)'
      );
      tileG.addColorStop(1, 'rgba(6, 78, 59, 0.22)');
      ctx.fillStyle = tileG;
      ctx.fillRect(x0 + 1, ROAD_EDGE_Y, TILE_W - 2, 20);

      // Glass cell border
      ctx.strokeStyle =
        lockFlash > 0.2
          ? '#bbf7d0'
          : `rgba(74, 222, 128, ${(0.55 + 0.35 * wheelProx).toFixed(3)})`;
      ctx.lineWidth = 1.3;
      ctx.strokeRect(x0 + 1, ROAD_EDGE_Y + 0.5, TILE_W - 2, 19);

      // Top neon-emerald riding surface at y = 680
      ctx.strokeStyle = lockFlash > 0.3 ? '#ffffff' : '#4ade80';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(x0, ROAD_EDGE_Y);
      ctx.lineTo(x0 + TILE_W, ROAD_EDGE_Y);
      ctx.stroke();

      // Tiny verified status LED inside solidified tile
      ctx.fillStyle = lockFlash > 0.3 ? '#ffffff' : '#4ade80';
      ctx.beginPath();
      ctx.arc(xc, ROAD_EDGE_Y + 10, 2.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (isWireframeZone) {
      // Materializing wireframe code block in [pelicanLocalX + 40 .. +220]!
      const u = clamp((236 - dx) / (236 - 72), 0, 1); // 0 at far +236 -> 1 right before front wheel +72
      const easeU = smootherstep(0, 1, u);
      const floatDir = i % 2 === 0 ? -1 : 1;
      const yOffset = (1 - easeU) * floatDir * 34 + Math.sin(t * 10 + i) * (1 - easeU) * 4;
      const scaleW = lerp(0.68, 0.96, easeU);
      const wSeg = TILE_W * scaleW;
      const sx = xc - wSeg * 0.5;
      const sy = ROAD_EDGE_Y + yOffset;
      const alpha = smoothstep(0.0, 0.22, u);

      ctx.save();
      ctx.globalAlpha = alpha;

      // Wireframe hologram box + X-truss
      const wireCol = u > 0.65 ? '#4ade80' : i % 2 === 0 ? '#38bdf8' : '#a78bfa';
      ctx.strokeStyle = wireCol;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(sx, sy, wSeg, 18);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + wSeg, sy + 18);
      ctx.moveTo(sx + wSeg, sy);
      ctx.lineTo(sx, sy + 18);
      ctx.stroke();

      // Corner vertex nodes
      ctx.fillStyle = '#f8fafc';
      for (const [vx, vy] of [
        [sx, sy],
        [sx + wSeg, sy],
        [sx, sy + 18],
        [sx + wSeg, sy + 18],
      ]) {
        ctx.fillRect(vx - 1.6, vy - 1.6, 3.2, 3.2);
      }

      // Floating syntax token tag above assembling tile
      ctx.fillStyle = wireCol;
      ctx.font = '600 9.5px "SF Mono", "Menlo", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(CODE_TOKENS[i % CODE_TOKENS.length], xc, sy - 9);

      // Laser synthesis beam from Cyber-Rider's front hub / visor onto materializing wireframe!
      if (rig && u > 0.22 && u < 0.92) {
        ctx.strokeStyle =
          u > 0.6 ? 'rgba(74, 222, 128, 0.42)' : 'rgba(56, 189, 248, 0.34)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(rig.frontWheel.x, rig.frontWheel.y);
        ctx.lineTo(xc, sy + 2);
        ctx.stroke();
      }

      ctx.restore();
    } else {
      // Uncompiled blueprint slot ahead (> +236): crisp alignment ticks at y = 680
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.26)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x0 + 4, ROAD_EDGE_Y);
      ctx.lineTo(x0 + 14, ROAD_EDGE_Y);
      ctx.moveTo(xc, ROAD_EDGE_Y - 3);
      ctx.lineTo(xc, ROAD_EDGE_Y + 3);
      ctx.stroke();
    }
  }

  // Ensure crisp edge anchor points at x=0..16 and x=984..1000 on y = 680
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(0, ROAD_EDGE_Y);
  ctx.lineTo(24, ROAD_EDGE_Y);
  ctx.moveTo(PANEL_SIZE - 18, ROAD_EDGE_Y);
  ctx.lineTo(PANEL_SIZE, ROAD_EDGE_Y);
  ctx.stroke();

  ctx.restore();
}

export function render(kit, slot, scene, params) {
  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;

  const t = params?.t ?? 0;
  const localT = params?.localT ?? 0;
  const pelicanLocalX = params?.pelicanLocalX ?? 460;
  const pedalAngle = params?.pedalAngle ?? 0;
  const speedScale = params?.speedScale ?? 1.0;
  const hidePelican = Boolean(params?.hidePelican);
  const isOutroThumbnail = Boolean(params?.isOutroThumbnail);

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Static Baked Emerald-Obsidian Software Foundry & Holographic Windows
  const bg = getFoundryBackdrop(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Dynamic Code Stream, AST Tree, Git DAG & Beat-Synced `✓ PASS` Badges
  drawSkyTerminalsAndBadges(ctx, localT, t, isOutroThumbnail);

  // 3. Precompute Cyber-Rider Rig (if visible) so Bridge Laser Synthesis locks cleanly onto front wheel
  const showRider = !hidePelican && pelicanLocalX >= -260 && pelicanLocalX <= 1260;
  const rig = showRider
    ? computePelicanRig({
        x: pelicanLocalX,
        y: ROAD_EDGE_Y,
        pedalAngle,
        scale: 1.0,
        slope: 0,
        speedScale,
        time: t,
      })
    : null;

  // 4. Signature Self-Assembling Code Bridge on y = 680
  drawSelfAssemblingCodeBridge(ctx, rig, pelicanLocalX, hidePelican, isOutroThumbnail, t);

  // 5. Render Autonomous SWE Cyber-Rider Agent-01
  if (rig) {
    drawRig2D(ctx, rig, {
      featherFill: '#e2e8f0',
      featherShade: '#94a3b8',
      wingTipDark: '#0f172a',
      beakFill: '#4ade80',
      pouchFill: '#38bdf8',
      legFill: '#cbd5e1',
      frameStroke: '#4ade80',
      metalStroke: '#64748b',
      tireStroke: '#052e16',
      inkOutline: '#04090c',
      glowColor: '#a78bfa',
      scanBeam: true,
    });
  }

  // 6. Outro Gallery Thumbnail Label
  if (isOutroThumbnail && scene) {
    ctx.fillStyle = 'rgba(8, 16, 20, 0.86)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 96);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 96);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 46px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
