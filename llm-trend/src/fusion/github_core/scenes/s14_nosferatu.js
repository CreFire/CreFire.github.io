// src/fusion/github_core/scenes/s14_nosferatu.js
// 14 · 多智能体蜂群协作 (2025–2026 · Multi-Agent Swarm Orchestration)
// Visual Signature:
// - Deep teal-indigo sky-citadel (#070d16, #2dd4bf, #818cf8, #f0fdfa, #fbbf24).
// - Accompanying the main Cyber-Rider (`Agent-01 Coordinator`) are 4 sleek autonomous companion
//   mini-drones / subagent winged light-glyphs flying in dynamic diamond/echelon formation above
//   the road (`Planner`, `Researcher`, `Coder`, `Verifier`), exchanging glowing message-board
//   light pulses along live dynamic mesh lines!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  BEAT_SEC,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';

const SUBAGENTS = [
  {
    id: 'planner',
    label: 'PLANNER',
    dx: 88,
    dy: -318,
    color: '#fbbf24',
    accent: '#fef08a',
    phase: 0.0,
  },
  {
    id: 'researcher',
    label: 'RESEARCHER',
    dx: -116,
    dy: -296,
    color: '#2dd4bf',
    accent: '#f0fdfa',
    phase: 1.57,
  },
  {
    id: 'coder',
    label: 'CODER',
    dx: 164,
    dy: -186,
    color: '#818cf8',
    accent: '#e0e7ff',
    phase: 3.14,
  },
  {
    id: 'verifier',
    label: 'VERIFIER',
    dx: -152,
    dy: -182,
    color: '#2dd4bf',
    accent: '#fbbf24',
    phase: 4.71,
  },
];

// Mesh topology among subagents (indices 0..3) + Coordinator (index 4)
const MESH_LINKS = [
  [0, 1, '#2dd4bf'], // Planner <-> Researcher
  [0, 2, '#fbbf24'], // Planner <-> Coder
  [1, 3, '#2dd4bf'], // Researcher <-> Verifier
  [2, 3, '#818cf8'], // Coder <-> Verifier
  [0, 3, '#f0fdfa'], // Cross-diagonal: Planner <-> Verifier
  [1, 2, '#818cf8'], // Cross-diagonal: Researcher <-> Coder
  [4, 0, '#fbbf24'], // Coordinator <-> Planner
  [4, 1, '#2dd4bf'], // Coordinator <-> Researcher
  [4, 2, '#818cf8'], // Coordinator <-> Coder
  [4, 3, '#2dd4bf'], // Coordinator <-> Verifier
];

/**
 * Bakes the static 1000x1000 Deep Teal-Indigo Sky-Citadel & Shared Message Board Canopy.
 */
function getSwarmCitadelBackdrop(kit) {
  return kit.bake2D('s14_swarm_citadel_bg_v1', (_g, bctx, rng, w, h) => {
    // 1. Deep Teal-Indigo Sky-Citadel Gradient
    const skyG = bctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    skyG.addColorStop(0.0, '#040810');
    skyG.addColorStop(0.45, '#070d16');
    skyG.addColorStop(0.82, '#0b1928');
    skyG.addColorStop(1.0, '#102638');
    bctx.fillStyle = skyG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // Subtle hexagonal swarm coordination lattice in upper sky
    bctx.save();
    bctx.strokeStyle = 'rgba(45, 212, 191, 0.055)';
    bctx.lineWidth = 1;
    const hexR = 36;
    const hexH = hexR * Math.sqrt(3);
    for (let row = 0; row < 11; row++) {
      for (let col = -1; col < 16; col++) {
        const cx = col * hexR * 1.5;
        const cy = row * hexH + (col % 2 === 0 ? 0 : hexH * 0.5);
        if (cy > 460) continue;
        bctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3;
          const px = cx + Math.cos(a) * hexR;
          const py = cy + Math.sin(a) * hexR;
          if (k === 0) bctx.moveTo(px, py);
          else bctx.lineTo(px, py);
        }
        bctx.closePath();
        bctx.stroke();
      }
    }
    bctx.restore();

    // Ambient volumetric glow in sky-citadel heart
    const radG = bctx.createRadialGradient(500, 340, 20, 500, 360, 440);
    radG.addColorStop(0.0, 'rgba(45, 212, 191, 0.12)');
    radG.addColorStop(0.5, 'rgba(129, 140, 248, 0.08)');
    radG.addColorStop(1.0, 'rgba(7, 13, 22, 0)');
    bctx.fillStyle = radG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // 2. Futuristic Sky-Citadel Spires & Towers along Horizon
    const spires = [
      { x: 35, w: 68, h: 310 },
      { x: 118, w: 52, h: 220 },
      { x: 195, w: 76, h: 365 },
      { x: 292, w: 58, h: 195 },
      { x: 375, w: 64, h: 255 },
      { x: 565, w: 62, h: 245 },
      { x: 650, w: 56, h: 190 },
      { x: 728, w: 80, h: 380 },
      { x: 828, w: 56, h: 235 },
      { x: 902, w: 72, h: 325 },
    ];

    for (let i = 0; i < spires.length; i++) {
      const sp = spires[i];
      const topY = ROAD_EDGE_Y - sp.h;
      const towG = bctx.createLinearGradient(sp.x, topY, sp.x, ROAD_EDGE_Y);
      towG.addColorStop(0, 'rgba(15, 31, 48, 0.85)');
      towG.addColorStop(1, 'rgba(7, 13, 22, 0.96)');
      bctx.fillStyle = towG;

      bctx.beginPath();
      bctx.moveTo(sp.x, ROAD_EDGE_Y);
      bctx.lineTo(sp.x, topY + 26);
      bctx.lineTo(sp.x + sp.w * 0.5, topY);
      bctx.lineTo(sp.x + sp.w, topY + 26);
      bctx.lineTo(sp.x + sp.w, ROAD_EDGE_Y);
      bctx.closePath();
      bctx.fill();

      bctx.strokeStyle = i % 2 === 0 ? 'rgba(45, 212, 191, 0.22)' : 'rgba(129, 140, 248, 0.22)';
      bctx.lineWidth = 1.2;
      bctx.stroke();

      // Spire antenna & vertical light conduit
      bctx.strokeStyle = i % 2 === 0 ? 'rgba(45, 212, 191, 0.35)' : 'rgba(251, 191, 36, 0.28)';
      bctx.beginPath();
      bctx.moveTo(sp.x + sp.w * 0.5, topY - 22);
      bctx.lineTo(sp.x + sp.w * 0.5, ROAD_EDGE_Y - 20);
      bctx.stroke();

      // Micro citadel window lights
      for (let wy = topY + 42; wy < ROAD_EDGE_Y - 24; wy += 16) {
        if (rng() < 0.38) continue;
        bctx.fillStyle =
          rng() < 0.65 ? 'rgba(45, 212, 191, 0.28)' : 'rgba(129, 140, 248, 0.28)';
        bctx.fillRect(sp.x + 10, wy, sp.w - 20, 2.2);
      }
    }

    // 3. Upper-Sky Holographic Shared Message Board (`SWARM MESSAGE BOARD`)
    const bx = 230;
    const by = 38;
    const bw = 540;
    const bh = 96;
    bctx.save();
    bctx.fillStyle = 'rgba(8, 18, 30, 0.82)';
    bctx.strokeStyle = 'rgba(45, 212, 191, 0.52)';
    bctx.lineWidth = 1.5;
    bctx.beginPath();
    bctx.roundRect(bx, by, bw, bh, 10);
    bctx.fill();
    bctx.stroke();

    bctx.fillStyle = '#f0fdfa';
    bctx.font = '700 12px "SF Mono", "Menlo", monospace';
    bctx.textAlign = 'left';
    bctx.fillText('SWARM SHARED MESSAGE BOARD // ORCHESTRATION MESH', bx + 18, by + 24);

    const tags = [
      { txt: '@planner: decompose', col: '#fbbf24', x: bx + 18, y: by + 54 },
      { txt: '@researcher: context✓', col: '#2dd4bf', x: bx + 190, y: by + 54 },
      { txt: '@coder: patch_v2', col: '#818cf8', x: bx + 378, y: by + 54 },
      { txt: '@verifier: consensus 4/4 -> @coordinator MERGE READY', col: '#f0fdfa', x: bx + 18, y: by + 78 },
    ];
    bctx.font = '600 10.5px "SF Mono", "Menlo", monospace';
    for (const tg of tags) {
      bctx.fillStyle = tg.col;
      bctx.fillText(tg.txt, tg.x, tg.y);
    }
    bctx.restore();

    // 4. Sleek Citadel Skyway Floor (y = 680..1000)
    const floorG = bctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
    floorG.addColorStop(0.0, '#0d2231');
    floorG.addColorStop(0.18, '#081320');
    floorG.addColorStop(1.0, '#040810');
    bctx.fillStyle = floorG;
    bctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

    // Formation lane markers & perspective struts on skyway deck
    const laneCols = ['rgba(45, 212, 191, 0.22)', 'rgba(129, 140, 248, 0.20)', 'rgba(251, 191, 36, 0.16)'];
    for (let i = 0; i < 3; i++) {
      const ly = ROAD_EDGE_Y + 28 + i * 28;
      bctx.strokeStyle = laneCols[i];
      bctx.lineWidth = 1.4;
      bctx.beginPath();
      bctx.moveTo(0, ly);
      bctx.lineTo(w, ly);
      bctx.stroke();
    }

    // Continuous teal-mint & indigo road horizon at y = 680
    bctx.strokeStyle = '#2dd4bf';
    bctx.lineWidth = 3.2;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y);
    bctx.lineTo(w, ROAD_EDGE_Y);
    bctx.stroke();

    bctx.strokeStyle = '#f0fdfa';
    bctx.lineWidth = 1.0;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y - 1);
    bctx.lineTo(w, ROAD_EDGE_Y - 1);
    bctx.stroke();
  }, PANEL_SIZE, PANEL_SIZE);
}

/**
 * Draws an individual sleek winged geometric subagent light-cycle / mini-drone!
 */
function drawWingedSubagentDrone(ctx, sa, pos, t, beatPulse) {
  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(pos.bank);

  // Luminous jet slipstream trail behind drone (-X)
  const trailG = ctx.createLinearGradient(-64, 0, -8, 0);
  trailG.addColorStop(0, 'rgba(45, 212, 191, 0)');
  trailG.addColorStop(1, sa.color);
  ctx.strokeStyle = trailG;
  ctx.globalAlpha = 0.68;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(-62, Math.sin(t * 14 + sa.phase) * 3);
  ctx.lineTo(-10, 0);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Soft harmonic aura around drone
  const auraR = 26 + 5 * beatPulse;
  const rg = ctx.createRadialGradient(0, 0, 2, 0, 0, auraR);
  rg.addColorStop(0, sa.accent);
  rg.addColorStop(0.38, sa.color);
  rg.addColorStop(1, 'rgba(7, 13, 22, 0)');
  ctx.globalAlpha = 0.36;
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(0, 0, auraR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = sa.accent;
  ctx.fillStyle = '#0b1727';
  ctx.lineWidth = 2.0;
  ctx.lineJoin = 'round';

  // Role-distinct geometric winged light-glyph chassis (facing +X)
  if (sa.id === 'planner') {
    // Swept forward golden command delta-wing + compass spearhead
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(-10, -16);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-16, 0);
    ctx.lineTo(-4, 4);
    ctx.lineTo(-10, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (sa.id === 'researcher') {
    // Dual-wing reconnaissance glyph + orbital scanner ring
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-14, -18);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-14, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = sa.color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(2, 0, 11, -0.9, 0.9);
    ctx.stroke();
  } else if (sa.id === 'coder') {
    // Twin-blade mini light-cycle / syntax lance
    ctx.beginPath();
    ctx.moveTo(24, -3);
    ctx.lineTo(4, -13);
    ctx.lineTo(-16, -9);
    ctx.lineTo(-9, 0);
    ctx.lineTo(-16, 9);
    ctx.lineTo(4, 13);
    ctx.lineTo(24, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Verifier crystalline hex-shield + swept winglets
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(6, -13);
    ctx.lineTo(-12, -13);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-12, 13);
    ctx.lineTo(6, 13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Incandescent core node
  ctx.fillStyle = sa.color;
  ctx.beginPath();
  ctx.arc(2, 0, 4.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(2, 0, 2.0, 0, Math.PI * 2);
  ctx.fill();

  // Crisp subagent callsign tag
  ctx.rotate(-pos.bank);
  ctx.font = '700 9.5px "SF Mono", "Menlo", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = sa.accent;
  ctx.fillText(sa.label, 0, -22);

  ctx.restore();
}

/**
 * Draws the 4 companion subagents in dynamic diamond/echelon formation + live message-board mesh pulses.
 */
function drawSwarmMeshAndDrones(ctx, rig, pelicanLocalX, localT, t, isOutroThumbnail) {
  const anchorX = clamp(rig ? pelicanLocalX : 500, 140, PANEL_SIZE - 140);
  const coordNode = rig
    ? { x: rig.head.x, y: rig.head.y - 16 }
    : { x: anchorX, y: ROAD_EDGE_Y - 210 };

  const beatFrac = (localT / BEAT_SEC) - Math.floor(localT / BEAT_SEC);
  const beatPulse = isOutroThumbnail ? 0.5 : Math.exp(-beatFrac * 4.5);

  // Bar 2 dynamic formation breath: smoothly tightens into precision diamond sync in [1.8..4.2s]
  const syncTighten = isOutroThumbnail
    ? 0.25
    : smoothstep(1.6, 2.4, localT) * (1 - smoothstep(3.8, 4.6, localT)) * 0.24;

  const positions = SUBAGENTS.map((sa, idx) => {
    const scaleSpread = 1 - syncTighten;
    const weaveX = Math.cos(t * 2.4 + sa.phase) * 14;
    const weaveY = Math.sin(t * 3.2 + sa.phase) * 11;
    const px = anchorX + sa.dx * scaleSpread + weaveX;
    const py = ROAD_EDGE_Y + sa.dy + weaveY;
    const bank = Math.cos(t * 3.2 + sa.phase) * 0.08 - syncTighten * 0.06 * (idx % 2 === 0 ? 1 : -1);
    return { x: px, y: py, bank };
  });

  const allNodes = [...positions, coordNode];
  const boardHub = { x: 500, y: 134 };

  ctx.save();

  // 1. Uplink beams from top Subagents (`Planner`, `Researcher`) to the Sky Shared Message Board
  for (const topIdx of [0, 1]) {
    const p = positions[topIdx];
    ctx.strokeStyle = topIdx === 0 ? 'rgba(251, 191, 36, 0.26)' : 'rgba(45, 212, 191, 0.26)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(boardHub.x + (topIdx === 0 ? 55 : -55), boardHub.y);
    ctx.stroke();

    const upU = ((t * 1.9 + topIdx * 0.5) % 1 + 1) % 1;
    const ux = lerp(p.x, boardHub.x + (topIdx === 0 ? 55 : -55), upU);
    const uy = lerp(p.y, boardHub.y, upU);
    ctx.fillStyle = topIdx === 0 ? '#fbbf24' : '#2dd4bf';
    ctx.beginPath();
    ctx.arc(ux, uy, 3.0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Live Dynamic Swarm Mesh Lines & Bidirectional Message-Board Light Pulses!
  for (let m = 0; m < MESH_LINKS.length; m++) {
    const [iA, iB, col] = MESH_LINKS[m];
    if ((iA === 4 || iB === 4) && !rig && !isOutroThumbnail) continue;

    const pA = allNodes[iA];
    const pB = allNodes[iB];

    // Base glowing mesh filament
    ctx.strokeStyle = col;
    ctx.globalAlpha = iA === 4 || iB === 4 ? 0.38 : 0.30 + 0.16 * beatPulse;
    ctx.lineWidth = iA === 4 || iB === 4 ? 2.1 : 1.6;
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Traveling light-pulse packet along mesh link (alternating directions for rich full-mesh traffic)
    const speed = 1.65 + (m % 3) * 0.45;
    const rawU = ((t * speed + m * 0.23) % 1 + 1) % 1;
    const u = m % 2 === 0 ? rawU : 1 - rawU;
    const tailU = clamp(u - (m % 2 === 0 ? 0.14 : -0.14), 0, 1);

    const hx = lerp(pA.x, pB.x, u);
    const hy = lerp(pA.y, pB.y, u);
    const tx = lerp(pA.x, pB.x, tailU);
    const ty = lerp(pA.y, pB.y, tailU);

    // Comet wake on mesh wire
    ctx.strokeStyle = col;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    // Crisp white-hot message orb
    ctx.fillStyle = '#f0fdfa';
    ctx.beginPath();
    ctx.arc(hx, hy, 3.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Shared Consensus Harmonic Ring at Diamond Centroid on Strong Beats
  const centX = (positions[0].x + positions[1].x + positions[2].x + positions[3].x) * 0.25;
  const centY = (positions[0].y + positions[1].y + positions[2].y + positions[3].y) * 0.25;
  ctx.strokeStyle = `rgba(45, 212, 191, ${(0.18 + 0.28 * beatPulse).toFixed(3)})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(centX, centY, 18 + (1 - beatPulse) * 26, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Render all 4 Winged Subagent Companion Drones
  for (let i = 0; i < SUBAGENTS.length; i++) {
    drawWingedSubagentDrone(ctx, SUBAGENTS[i], positions[i], t, beatPulse);
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

  // 1. Static Baked Deep Teal-Indigo Sky-Citadel & Shared Message Board
  const bg = getSwarmCitadelBackdrop(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Compute Coordinator Cyber-Rider (`Agent-01`)
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

  // 3. Dynamic 4-Subagent Swarm Formation & Live Message-Board Mesh Pulses
  drawSwarmMeshAndDrones(ctx, rig, pelicanLocalX, localT, t, isOutroThumbnail);

  // 4. Render Main Cyber-Rider (`Agent-01 Coordinator`)
  if (rig) {
    drawRig2D(ctx, rig, {
      featherFill: '#f0fdfa',
      featherShade: '#94a3b8',
      wingTipDark: '#0f172a',
      beakFill: '#2dd4bf',
      pouchFill: '#fbbf24',
      legFill: '#ccfbf1',
      frameStroke: '#2dd4bf',
      metalStroke: '#64748b',
      tireStroke: '#070d16',
      inkOutline: '#040810',
      glowColor: '#818cf8',
      halo: true,
    });
  }

  // 5. Outro Gallery Thumbnail Label
  if (isOutroThumbnail && scene) {
    ctx.fillStyle = 'rgba(7, 13, 22, 0.86)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 96);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 96);
    ctx.stroke();
    ctx.fillStyle = '#f0fdfa';
    ctx.font = '700 46px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
