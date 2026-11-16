// src/fusion/github_core/scenes/s13_scream.js
// 13 · 万物互联工具协议 (2025 · Tool Use & MCP Universal Bus)
// Visual Signature:
// - Sleek midnight-cobalt orbital hub (#0d1424, #60a5fa, #f43f5e, #a78bfa, #fbbf24).
// - Giant concentric Universal Protocol Ring (`MCP BUS`) in the sky connecting 6 crisp geometric
//   tool docks: Search Lens, Vector DB Cylinder, Cloud API Cube, Code Sandbox Terminal,
//   Calendar Clock, and Robotic Gripper.
// - As Cyber-Rider Agent-01 cycles past, luminous fiber-optic arcs snap from the rider's chassis
//   to each tool dock in sequence, triggering glowing response packets returning to the bike!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';

const BUS_CX = 500;
const BUS_CY = 348;
const BUS_R = 248;

const TOOL_DOCKS = [
  {
    id: 'search',
    name: 'web.search',
    angle: -Math.PI * 0.96,
    triggerX: 155,
    color: '#60a5fa',
    packetCol: '#fbbf24',
  },
  {
    id: 'vectordb',
    name: 'vector.query',
    angle: -Math.PI * 0.78,
    triggerX: 292,
    color: '#a78bfa',
    packetCol: '#60a5fa',
  },
  {
    id: 'cloud',
    name: 'cloud.api',
    angle: -Math.PI * 0.59,
    triggerX: 430,
    color: '#38bdf8',
    packetCol: '#fbbf24',
  },
  {
    id: 'sandbox',
    name: 'code.exec',
    angle: -Math.PI * 0.41,
    triggerX: 568,
    color: '#fbbf24',
    packetCol: '#60a5fa',
  },
  {
    id: 'calendar',
    name: 'calendar.sync',
    angle: -Math.PI * 0.22,
    triggerX: 706,
    color: '#f43f5e',
    packetCol: '#fbbf24',
  },
  {
    id: 'gripper',
    name: 'robot.arm',
    angle: -Math.PI * 0.04,
    triggerX: 844,
    color: '#fbbf24',
    packetCol: '#f43f5e',
  },
].map((d) => ({
  ...d,
  x: BUS_CX + Math.cos(d.angle) * BUS_R,
  y: BUS_CY + Math.sin(d.angle) * BUS_R,
}));

function evalQuad(p0, c, p1, u) {
  const iu = 1 - u;
  return {
    x: iu * iu * p0.x + 2 * iu * u * c.x + u * u * p1.x,
    y: iu * iu * p0.y + 2 * iu * u * c.y + u * u * p1.y,
  };
}

/**
 * Bakes the static 1000x1000 Midnight-Cobalt Orbital Hub & Concentric MCP Universal Protocol Ring.
 */
function getMcpHubBackdrop(kit) {
  return kit.bake2D('s13_mcp_orbital_hub_bg_v1', (_g, bctx, rng, w, h) => {
    // 1. Midnight-Cobalt Orbital Space Gradient
    const skyG = bctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    skyG.addColorStop(0.0, '#060a14');
    skyG.addColorStop(0.48, '#0d1424');
    skyG.addColorStop(0.88, '#131f38');
    skyG.addColorStop(1.0, '#192848');
    bctx.fillStyle = skyG;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // Orbital core ambient bloom
    const coreGlow = bctx.createRadialGradient(BUS_CX, BUS_CY, 24, BUS_CX, BUS_CY, 360);
    coreGlow.addColorStop(0.0, 'rgba(96, 165, 250, 0.16)');
    coreGlow.addColorStop(0.48, 'rgba(167, 139, 250, 0.08)');
    coreGlow.addColorStop(1.0, 'rgba(13, 20, 36, 0)');
    bctx.fillStyle = coreGlow;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // Subtle deep-space starfield & telemetry nodes
    for (let i = 0; i < 140; i++) {
      const sx = rng() * w;
      const sy = rng() * (ROAD_EDGE_Y - 40);
      bctx.fillStyle =
        i % 6 === 0
          ? 'rgba(251, 191, 36, 0.35)'
          : i % 3 === 0
          ? 'rgba(167, 139, 250, 0.28)'
          : 'rgba(96, 165, 250, 0.24)';
      bctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // 2. Giant Concentric Universal Protocol Ring (`MCP BUS`)
    bctx.save();
    // Outer structural frame ring
    bctx.strokeStyle = 'rgba(96, 165, 250, 0.22)';
    bctx.lineWidth = 14;
    bctx.beginPath();
    bctx.arc(BUS_CX, BUS_CY, BUS_R, 0, Math.PI * 2);
    bctx.stroke();

    bctx.strokeStyle = 'rgba(148, 163, 184, 0.38)';
    bctx.lineWidth = 1.4;
    for (const r of [BUS_R + 14, BUS_R - 14, 192, 146, 92]) {
      bctx.beginPath();
      bctx.arc(BUS_CX, BUS_CY, r, 0, Math.PI * 2);
      bctx.stroke();
    }

    // Precision degree ticks around MCP Bus Ring
    bctx.strokeStyle = 'rgba(96, 165, 250, 0.32)';
    bctx.lineWidth = 1.1;
    bctx.beginPath();
    for (let deg = 0; deg < 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const r0 = BUS_R + 15;
      const r1 = deg % 30 === 0 ? BUS_R + 25 : BUS_R + 19;
      bctx.moveTo(BUS_CX + Math.cos(rad) * r0, BUS_CY + Math.sin(rad) * r0);
      bctx.lineTo(BUS_CX + Math.cos(rad) * r1, BUS_CY + Math.sin(rad) * r1);
    }
    bctx.stroke();

    // Radial bus spokes from central MCP Hub to each of the 6 Tool Docks
    for (const dock of TOOL_DOCKS) {
      bctx.strokeStyle = 'rgba(96, 165, 250, 0.20)';
      bctx.lineWidth = 1.5;
      bctx.beginPath();
      bctx.moveTo(
        BUS_CX + Math.cos(dock.angle) * 92,
        BUS_CY + Math.sin(dock.angle) * 92
      );
      bctx.lineTo(dock.x, dock.y);
      bctx.stroke();
    }

    // Central MCP Universal Router Core Emblem
    const hubG = bctx.createRadialGradient(BUS_CX, BUS_CY, 6, BUS_CX, BUS_CY, 88);
    hubG.addColorStop(0, '#1e3a8a');
    hubG.addColorStop(0.65, '#0f172a');
    hubG.addColorStop(1, '#090d18');
    bctx.fillStyle = hubG;
    bctx.beginPath();
    bctx.arc(BUS_CX, BUS_CY, 88, 0, Math.PI * 2);
    bctx.fill();

    bctx.strokeStyle = '#60a5fa';
    bctx.lineWidth = 2.2;
    bctx.beginPath();
    bctx.arc(BUS_CX, BUS_CY, 88, 0, Math.PI * 2);
    bctx.stroke();

    bctx.fillStyle = '#e0f2fe';
    bctx.font = '700 22px "SF Mono", "Menlo", monospace';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText('MCP BUS', BUS_CX, BUS_CY - 10);
    bctx.fillStyle = '#93c5fd';
    bctx.font = '600 10.5px "SF Mono", "Menlo", monospace';
    bctx.fillText('JSON-RPC · UNIVERSAL IO', BUS_CX, BUS_CY + 14);
    bctx.restore();

    // Distant orbital skyline pylons along y = 590..680
    for (let i = 0; i < 20; i++) {
      const px = i * 52 + 8;
      const ph = 26 + ((i * 19) % 48);
      bctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      bctx.fillRect(px, ROAD_EDGE_Y - ph, 32, ph);
      bctx.strokeStyle = 'rgba(96, 165, 250, 0.16)';
      bctx.strokeRect(px, ROAD_EDGE_Y - ph, 32, ph);
    }

    // 3. High-Speed MCP Bus Causeway Deck (y = 680..1000)
    const floorG = bctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
    floorG.addColorStop(0.0, '#111c35');
    floorG.addColorStop(0.18, '#0b1222');
    floorG.addColorStop(1.0, '#050811');
    bctx.fillStyle = floorG;
    bctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

    // Parallel fiber-optic bus traces along the causeway floor
    const busCols = ['#60a5fa', '#a78bfa', '#f43f5e', '#fbbf24'];
    for (let lane = 0; lane < 4; lane++) {
      const ly = ROAD_EDGE_Y + 26 + lane * 26;
      bctx.strokeStyle = busCols[lane];
      bctx.globalAlpha = 0.22;
      bctx.lineWidth = 1.6;
      bctx.beginPath();
      bctx.moveTo(0, ly);
      bctx.lineTo(w, ly);
      bctx.stroke();
    }
    bctx.globalAlpha = 1;

    // Ground port tap markers aligned vertically with the 6 Tool Docks' trigger X positions
    for (const dock of TOOL_DOCKS) {
      bctx.strokeStyle = 'rgba(96, 165, 250, 0.25)';
      bctx.lineWidth = 1.2;
      bctx.beginPath();
      bctx.moveTo(dock.triggerX, ROAD_EDGE_Y);
      bctx.lineTo(dock.triggerX, ROAD_EDGE_Y + 120);
      bctx.stroke();
    }

    // Crisp continuous cobalt-blue & gold road edge at y = 680
    bctx.strokeStyle = '#60a5fa';
    bctx.lineWidth = 3.2;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y);
    bctx.lineTo(w, ROAD_EDGE_Y);
    bctx.stroke();

    bctx.strokeStyle = '#e0f2fe';
    bctx.lineWidth = 1.0;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y - 1);
    bctx.lineTo(w, ROAD_EDGE_Y - 1);
    bctx.stroke();
  }, PANEL_SIZE, PANEL_SIZE);
}

/**
 * Draws each crisp geometric Tool Icon inside its orbital dock.
 */
function drawToolDockGlyph(ctx, dock, activeAmt, t) {
  const s = 1 + activeAmt * 0.14;
  ctx.save();
  ctx.translate(dock.x, dock.y);
  ctx.scale(s, s);
  ctx.strokeStyle = activeAmt > 0.25 ? '#ffffff' : dock.color;
  ctx.fillStyle = dock.color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (dock.id) {
    case 'search': {
      // Search Lens + scanning reticle
      ctx.beginPath();
      ctx.arc(-4, -4, 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.lineTo(16, 16);
      ctx.stroke();
      if (activeAmt > 0.1) {
        const scanY = Math.sin(t * 9) * 7;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-12, -4 + scanY);
        ctx.lineTo(4, -4 + scanY);
        ctx.stroke();
      }
      break;
    }
    case 'vectordb': {
      // Stacked 3D Vector DB Cylinder disks
      const sep = 8 + activeAmt * 2.5;
      for (const dy of [-sep, 0, sep]) {
        ctx.fillStyle = 'rgba(13, 20, 36, 0.9)';
        ctx.beginPath();
        ctx.ellipse(0, dy, 15, 5.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-15, -sep);
      ctx.lineTo(-15, sep);
      ctx.moveTo(15, -sep);
      ctx.lineTo(15, sep);
      ctx.stroke();
      break;
    }
    case 'cloud': {
      // Isometric API Cube + inner glowing core
      const rot = activeAmt * t * 2.4;
      const r = 16;
      const top = [];
      const bot = [];
      for (let k = 0; k < 4; k++) {
        const a = rot + (k * Math.PI) / 2 + Math.PI / 4;
        top.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.52 - 8 });
        bot.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.52 + 8 });
      }
      ctx.beginPath();
      for (let k = 0; k < 4; k++) {
        const n = (k + 1) % 4;
        ctx.moveTo(top[k].x, top[k].y);
        ctx.lineTo(top[n].x, top[n].y);
        ctx.moveTo(bot[k].x, bot[k].y);
        ctx.lineTo(bot[n].x, bot[n].y);
        ctx.moveTo(top[k].x, top[k].y);
        ctx.lineTo(bot[k].x, bot[k].y);
      }
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'sandbox': {
      // Code Sandbox Terminal Window (`>_`)
      ctx.beginPath();
      ctx.roundRect(-17, -13, 34, 26, 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, -3);
      ctx.lineTo(-3, 2);
      ctx.lineTo(-10, 7);
      ctx.moveTo(1, 7);
      ctx.lineTo(10, 7);
      ctx.stroke();
      break;
    }
    case 'calendar': {
      // Precision Calendar / Chronometer Clock
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      const fast = t * (2 + activeAmt * 8);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(fast) * 10, Math.sin(fast) * 10);
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(fast * 0.25 - 1.2) * 7, Math.sin(fast * 0.25 - 1.2) * 7);
      ctx.stroke();
      break;
    }
    case 'gripper': {
      // Articulated Robotic Gripper Claws
      const pinch = (0.5 + 0.5 * Math.sin(t * 9)) * activeAmt * 5;
      ctx.beginPath();
      ctx.moveTo(0, -17);
      ctx.lineTo(0, -7);
      ctx.moveTo(-8, -7);
      ctx.lineTo(8, -7);
      // Left jaw
      ctx.moveTo(-7, -7);
      ctx.lineTo(-14 + pinch, 3);
      ctx.lineTo(-7 + pinch, 14);
      // Right jaw
      ctx.moveTo(7, -7);
      ctx.lineTo(14 - pinch, 3);
      ctx.lineTo(7 - pinch, 14);
      ctx.stroke();
      if (activeAmt > 0.2) {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(0, 7, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }
  ctx.restore();
}

/**
 * Draws the 6 MCP Tool Docks, orbital bus carrier pulses, sequential fiber-optic arcs
 * snapping from the rider's chassis, and glowing response packets returning to the bike!
 */
function drawMcpBusAndFiberArcs(ctx, rig, pelicanLocalX, isOutroThumbnail, t) {
  ctx.save();

  // 1. Live Carrier Pulses orbiting the Concentric MCP Bus Ring
  for (let p = 0; p < 8; p++) {
    const a = t * 1.15 + (p * Math.PI) / 4;
    const px = BUS_CX + Math.cos(a) * BUS_R;
    const py = BUS_CY + Math.sin(a) * BUS_R;
    ctx.fillStyle = p % 2 === 0 ? '#60a5fa' : '#a78bfa';
    ctx.beginPath();
    ctx.arc(px, py, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Anchor points on the Cyber-Rider chassis (or fallback center when hidden)
  const originPt = rig
    ? { x: rig.headTop.x, y: rig.headTop.y - 6 }
    : { x: 500, y: ROAD_EDGE_Y - 114 };
  const returnPt = rig
    ? { x: rig.bb.x, y: rig.bb.y }
    : { x: 500, y: ROAD_EDGE_Y - 46 };

  // 2. Evaluate each Tool Dock's sequential connection & draw Fiber-Optic Arcs + Docks
  for (let i = 0; i < TOOL_DOCKS.length; i++) {
    const dock = TOOL_DOCKS[i];

    let activeAmt = 0;
    let progressU = 0;
    let isCompleted = false;

    if (isOutroThumbnail) {
      activeAmt = i >= 1 && i <= 4 ? 0.92 : 0.35;
      progressU = 0.68;
      isCompleted = i < 1;
    } else if (rig) {
      const dx = pelicanLocalX - dock.triggerX;
      // Active window: [-135 .. +175] around dock.triggerX
      activeAmt =
        smoothstep(-145, -55, dx) * (1 - smoothstep(115, 195, dx));
      progressU = clamp((dx + 135) / 310, 0, 1);
      isCompleted = dx > 175;
    }

    // Draw Luminous Fiber-Optic Arc between Cyber-Rider and Active Tool Dock!
    if (rig && activeAmt > 0.02) {
      const ctrl = {
        x: lerp(originPt.x, dock.x, 0.38) + (dock.x - BUS_CX) * 0.16,
        y: Math.min(originPt.y, dock.y) - 42,
      };

      // Outer fiber-optic glow sheath
      ctx.strokeStyle = dock.color;
      ctx.globalAlpha = 0.24 * activeAmt;
      ctx.lineWidth = 9.0;
      ctx.beginPath();
      ctx.moveTo(originPt.x, originPt.y);
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, dock.x, dock.y);
      ctx.stroke();

      // Crisp inner fiber-optic laser core
      ctx.strokeStyle = '#e0f2fe';
      ctx.globalAlpha = 0.88 * activeAmt;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(originPt.x, originPt.y);
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, dock.x, dock.y);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Outbound Request Pulse (`Agent -> Tool Dock`)
      const reqU = ((t * 2.8 + i * 0.3) % 1 + 1) % 1;
      if (progressU < 0.65) {
        const reqPt = evalQuad(originPt, ctrl, dock, reqU);
        ctx.fillStyle = dock.color;
        ctx.beginPath();
        ctx.arc(reqPt.x, reqPt.y, 4.5 * activeAmt, 0, Math.PI * 2);
        ctx.fill();
      }

      // Returning Glowing Response Packets (`Tool Dock -> Bike Tensor Core`)!
      const retCtrl = {
        x: lerp(dock.x, returnPt.x, 0.52) + 28,
        y: lerp(dock.y, returnPt.y, 0.42) - 24,
      };

      ctx.strokeStyle = dock.packetCol;
      ctx.globalAlpha = 0.42 * activeAmt;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(dock.x, dock.y);
      ctx.quadraticCurveTo(retCtrl.x, retCtrl.y, returnPt.x, returnPt.y);
      ctx.stroke();
      ctx.globalAlpha = 1;

      for (let pkt = 0; pkt < 2; pkt++) {
        const pu = ((t * 2.4 + pkt * 0.48 + i * 0.17) % 1 + 1) % 1;
        const pPos = evalQuad(dock, retCtrl, returnPt, pu);

        // Glowing response packet halo + bright core
        const rg = ctx.createRadialGradient(pPos.x, pPos.y, 1, pPos.x, pPos.y, 13);
        rg.addColorStop(0, '#ffffff');
        rg.addColorStop(0.35, dock.packetCol);
        rg.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(pPos.x, pPos.y, 13 * activeAmt, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pPos.x, pPos.y, 3.4 * activeAmt, 0, Math.PI * 2);
        ctx.fill();
      }

      // Absorption ring at bike's Tensor Core
      ctx.strokeStyle = dock.packetCol;
      ctx.globalAlpha = 0.55 * activeAmt;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(returnPt.x, returnPt.y, 16 + ((t * 28) % 14), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 3. Render Tool Dock Housing Pod on the MCP Ring
    const podR = 34 + activeAmt * 5;
    if (activeAmt > 0.05) {
      const dg = ctx.createRadialGradient(dock.x, dock.y, 8, dock.x, dock.y, podR + 24);
      dg.addColorStop(0, 'rgba(96, 165, 250, 0.42)');
      dg.addColorStop(1, 'rgba(13, 20, 36, 0)');
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.arc(dock.x, dock.y, podR + 24, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = activeAmt > 0.2 ? '#172554' : '#0b1324';
    ctx.strokeStyle = activeAmt > 0.2 ? '#fbbf24' : isCompleted ? '#4ade80' : dock.color;
    ctx.lineWidth = activeAmt > 0.2 ? 3.0 : 2.0;
    ctx.beginPath();
    ctx.arc(dock.x, dock.y, podR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Crisp geometric tool icon
    drawToolDockGlyph(ctx, dock, activeAmt, t);

    // Dock protocol badge label
    ctx.font = '700 10.5px "SF Mono", "Menlo", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelY = dock.y + podR + 15;
    ctx.fillStyle = activeAmt > 0.2 ? '#fef08a' : isCompleted ? '#86efac' : '#cbd5e1';
    ctx.fillText(isCompleted ? `✓ ${dock.name}` : dock.name, dock.x, labelY);
  }

  ctx.restore();
}

export function render(kit, slot, scene, params) {
  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;

  const t = params?.t ?? 0;
  const pelicanLocalX = params?.pelicanLocalX ?? 500;
  const pedalAngle = params?.pedalAngle ?? 0;
  const speedScale = params?.speedScale ?? 1.0;
  const hidePelican = Boolean(params?.hidePelican);
  const isOutroThumbnail = Boolean(params?.isOutroThumbnail);

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Static Baked Midnight-Cobalt Orbital Hub & Concentric MCP Bus Ring
  const bg = getMcpHubBackdrop(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Compute Cyber-Rider Rig
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

  // 3. Dynamic MCP Tool Docks, Sequential Fiber-Optic Arcs & Returning Response Packets
  drawMcpBusAndFiberArcs(ctx, rig, pelicanLocalX, isOutroThumbnail, t);

  // 4. Render Cyber-Rider Agent-01
  if (rig) {
    drawRig2D(ctx, rig, {
      featherFill: '#e2e8f0',
      featherShade: '#94a3b8',
      wingTipDark: '#0f172a',
      beakFill: '#60a5fa',
      pouchFill: '#fbbf24',
      legFill: '#cbd5e1',
      frameStroke: '#60a5fa',
      metalStroke: '#64748b',
      tireStroke: '#090d18',
      inkOutline: '#060a14',
      glowColor: '#f43f5e',
    });
  }

  // 5. Outro Gallery Thumbnail Label
  if (isOutroThumbnail && scene) {
    ctx.fillStyle = 'rgba(13, 20, 36, 0.86)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.strokeStyle = '#60a5fa';
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
