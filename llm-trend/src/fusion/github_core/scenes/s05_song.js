// src/fusion/github_core/scenes/s05_song.js
// 05 · Scaling Law 算力洪流 (2020 · GPT-3 & Power-Law Supercluster)
// - Monumental vertical canyon of towering liquid-cooled Exascale GPU Supercomputer Monoliths rising from
//   y = 680 all the way to y = 18 like colossal cybernetic Northern Song cliffs in cryogenic mist
// - Bisected by a blazing cyan-gold logarithmic Scaling Law diagonal beam (`L(N) ∝ N⁻ᵃ`, 175B compute frontier)
// - Thousands of micro-detailed server rack blades, NVLink fiber conduits, cryo-cooling manifolds & blinking LEDs
//   engineered for razor-sharp clarity when `camera.js` zooms 2.75x into `(pelicanLocalX, y ≈ 680)`
// - Renders the Cyber-Rider at `scale = 0.24` (`computePelicanRig({ x: rx, y: ROAD_EDGE_Y, scale: 0.24, ... })`)

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';
import { makePRNG, hashSeed } from '../kit/kit.js';

const TAU = Math.PI * 2;

// Logarithmic Scaling Law Diagonal Line: L(C) = (C₀ / C)^α on log-log canyon coordinates
const SCALE_P0 = { x: 46, y: 126 };
const SCALE_P1 = { x: 958, y: 618 };

const CHECKPOINTS = [
  { u: 0.14, label: '10¹⁹ FLOPs', param: '1.5B' },
  { u: 0.41, label: '10²¹ FLOPs', param: '13B' },
  { u: 0.69, label: '3.1×10²³', param: '175B · GPT-3' },
  { u: 0.91, label: '10²⁵ FLOPs', param: 'EXASCALE' },
];

function drawServerMonolith(ctx, rng, {
  x,
  topY,
  w,
  bottomY = ROAD_EDGE_Y,
  cols = 8,
  bayH = 18,
  baseDark = '#070e1b',
  rimCyan = 'rgba(34, 211, 238, 0.34)',
  ledDensity = 0.74,
}) {
  const h = bottomY - topY;

  // Monolith basalt-titanium chassis body
  const bodyG = ctx.createLinearGradient(x, topY, x + w, bottomY);
  bodyG.addColorStop(0, '#111d32');
  bodyG.addColorStop(0.32, baseDark);
  bodyG.addColorStop(1, '#040811');
  ctx.fillStyle = bodyG;
  ctx.fillRect(x, topY, w, h);

  // Crown stepped cooling散热 fins at summit
  ctx.fillStyle = '#0c1729';
  ctx.strokeStyle = rimCyan;
  ctx.lineWidth = 1.1;
  ctx.fillRect(x + 8, topY - 10, w - 16, 10);
  ctx.strokeRect(x + 8, topY - 10, w - 16, 10);
  for (let fx = x + 14; fx < x + w - 14; fx += 6) {
    ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
    ctx.fillRect(fx, topY - 9, 2, 8);
  }

  // Sunlit left bevel edge & shadowed right cliff edge
  ctx.strokeStyle = rimCyan;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, bottomY);
  ctx.lineTo(x, topY);
  ctx.lineTo(x + w, topY);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(2, 6, 14, 0.9)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(x + w, topY);
  ctx.lineTo(x + w, bottomY);
  ctx.stroke();

  // Dense GPU SuperPOD Server Rack Columns & Thousands of Micro-LEDs
  const padX = 8;
  const colW = (w - padX * 2) / cols;
  const ledPalette = ['#22d3ee', '#38bdf8', '#0ea5e9', '#fbbf24', '#34d399'];

  for (let c = 0; c < cols; c++) {
    const cx = x + padX + c * colW;
    // Vertical rack frame channel
    ctx.fillStyle = 'rgba(3, 7, 16, 0.72)';
    ctx.fillRect(cx + 1.2, topY + 6, colW - 2.4, h - 8);

    // Vertical copper/cyan InfiniBand / NVLink spine bus
    ctx.fillStyle = c % 3 === 0 ? 'rgba(251, 191, 36, 0.18)' : 'rgba(34, 211, 238, 0.16)';
    ctx.fillRect(cx + colW - 2.8, topY + 8, 1.0, h - 10);

    for (let ry = topY + 10; ry < bottomY - 4; ry += bayH) {
      // Horizontal 4U/8U DGX blade separator
      ctx.fillStyle = 'rgba(148, 163, 184, 0.16)';
      ctx.fillRect(cx + 1.8, ry, colW - 3.6, 0.9);

      // Fine blade micro-louvers (sharp under 2.75x zoom!)
      for (let b = 2.5; b < bayH - 1.5; b += 3.2) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(cx + 2.5, ry + b, colW - 5.0, 1.8);

        if (rng() < ledDensity) {
          const col = rng() < 0.11 ? '#fbbf24' : ledPalette[Math.floor(rng() * ledPalette.length)];
          const lx = cx + 3.2 + rng() * Math.max(2, colW - 9);
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.38 + rng() * 0.56;
          ctx.fillRect(lx, ry + b + 0.3, 1.5, 1.2);
        }
      }
    }
  }
  ctx.globalAlpha = 1.0;
}

function getBakedScalingCanyon(kit) {
  return kit.bake2D('s05_scaling_monolith_v1', (_g, ctx, rng, w, h) => {
    // 1. Deep Atmospheric Exascale Data-Canyon Sky
    const skyG = ctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    skyG.addColorStop(0, '#030710');
    skyG.addColorStop(0.45, '#071120');
    skyG.addColorStop(0.85, '#0c1c33');
    skyG.addColorStop(1, '#102642');
    ctx.fillStyle = skyG;
    ctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // Subtle logarithmic coordinate grid in deep canyon sky (`log₁₀(C)` vs `log₁₀(L)`)
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.065)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let dec = 0; dec < 8; dec++) {
      const xBase = dec * 135;
      for (let sub = 1; sub <= 9; sub++) {
        const lx = xBase + Math.log10(sub) * 135;
        if (lx > 0 && lx < w) {
          ctx.moveTo(lx, 0);
          ctx.lineTo(lx, ROAD_EDGE_Y);
        }
      }
    }
    for (let y = 40; y < ROAD_EDGE_Y; y += 64) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // 2. Distant Misty Megacluster Spires (Background Depth Layer)
    for (const [dx, dy, dw] of [
      [158, 128, 118],
      [734, 112, 126],
    ]) {
      ctx.save();
      ctx.globalAlpha = 0.46;
      drawServerMonolith(ctx, rng, {
        x: dx,
        topY: dy,
        w: dw,
        cols: 5,
        bayH: 16,
        baseDark: '#0b182c',
        rimCyan: 'rgba(56, 189, 248, 0.22)',
        ledDensity: 0.48,
      });
      ctx.restore();
    }

    // 3. Colossal Central Exascale Sovereign Monolith (x = 248..768, y = 20..680 — Homage to Fan Kuan's Central Peak!)
    drawServerMonolith(ctx, rng, {
      x: 248,
      topY: 20,
      w: 520,
      cols: 18,
      bayH: 15,
      baseDark: '#070f1d',
      rimCyan: 'rgba(34, 211, 238, 0.42)',
      ledDensity: 0.80,
    });

    // Stepped Mid-Level SuperPOD Shoulder Buttress on Central Peak (x = 296..486, y = 246..680)
    drawServerMonolith(ctx, rng, {
      x: 296,
      topY: 246,
      w: 190,
      cols: 7,
      bayH: 14,
      baseDark: '#091426',
      rimCyan: 'rgba(56, 189, 248, 0.38)',
      ledDensity: 0.84,
    });

    // Vertical Cryogenic Liquid-Cooling Cataract Chasm carved down the Central Monolith (x = 528..556, y = 46..680)!
    ctx.fillStyle = '#030812';
    ctx.fillRect(524, 44, 34, ROAD_EDGE_Y - 44);
    const pipeG = ctx.createLinearGradient(528, 0, 554, 0);
    pipeG.addColorStop(0, '#083344');
    pipeG.addColorStop(0.38, '#22d3ee');
    pipeG.addColorStop(0.52, '#e0f2fe');
    pipeG.addColorStop(0.68, '#0ea5e9');
    pipeG.addColorStop(1, '#082f49');
    ctx.fillStyle = pipeG;
    ctx.fillRect(531, 46, 20, ROAD_EDGE_Y - 46);

    // Horizontal cryo-manifold clamp rings down the cooling cataract
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.0;
    for (let cy = 78; cy < ROAD_EDGE_Y - 12; cy += 44) {
      ctx.fillRect(526, cy, 30, 5);
      ctx.strokeRect(526, cy, 30, 5);
    }

    // 4. Flanking Foreground Deep-Canyon Compute Cliffs (Left x = 14..228, Right x = 786..986)
    drawServerMonolith(ctx, rng, {
      x: 14,
      topY: 88,
      w: 214,
      cols: 8,
      bayH: 14,
      baseDark: '#060c18',
      rimCyan: 'rgba(34, 211, 238, 0.36)',
      ledDensity: 0.78,
    });
    drawServerMonolith(ctx, rng, {
      x: 786,
      topY: 72,
      w: 200,
      cols: 8,
      bayH: 14,
      baseDark: '#060c18',
      rimCyan: 'rgba(34, 211, 238, 0.36)',
      ledDensity: 0.78,
    });

    // Atmospheric Cryo-Vapor Mist Layer softening mid-canyon waist (y = 435..540)
    const mistG = ctx.createLinearGradient(0, 420, 0, 555);
    mistG.addColorStop(0, 'rgba(14, 165, 233, 0)');
    mistG.addColorStop(0.5, 'rgba(34, 211, 238, 0.13)');
    mistG.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = mistG;
    ctx.fillRect(0, 420, w, 135);

    // 5. ULTRA-SHARP CANYON-FLOOR MICRO-ARCHITECTURE (y = 575..680) FOR 2.75x CAMERA ZOOM!
    // Elevated micro-catwalk gallery & safety handrail at y = 626 (human/rider-scale reference!)
    ctx.fillStyle = '#0d1829';
    ctx.fillRect(0, 626, w, 5);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.42)';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(0, 619);
    ctx.lineTo(w, 619);
    ctx.moveTo(0, 622.5);
    ctx.lineTo(w, 622.5);
    for (let sx = 8; sx <= w; sx += 16) {
      ctx.moveTo(sx, 619);
      ctx.lineTo(sx, 626);
    }
    ctx.stroke();

    // Base Cryo-Chiller Substations, Overhead Cable Trays & Micro-Status Panels (y = 631..680)
    for (let bx = 22; bx < w; bx += 64) {
      // Substation transformer housing
      ctx.fillStyle = '#0a1322';
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.34)';
      ctx.lineWidth = 0.9;
      ctx.fillRect(bx, 642, 38, 38);
      ctx.strokeRect(bx, 642, 38, 38);

      // Micro-radiator fins & tiny 1px telemetry pixels
      ctx.fillStyle = '#1e293b';
      for (let fx = bx + 4; fx < bx + 24; fx += 3) {
        ctx.fillRect(fx, 647, 1.5, 28);
      }
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(bx + 28, 648, 6, 3);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(bx + 28, 654, 4, 2);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(bx + 28, 659, 6, 2);

      // Pressurized L-shaped cryo-coolant feed pipe into canyon floor
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(bx + 46, 626);
      ctx.lineTo(bx + 46, 672);
      ctx.lineTo(bx + 58, 672);
      ctx.stroke();
    }

    // 6. Canonical y = 680 Road: Precision Exascale Superconducting Busway Deck [0..1000]
    const deckG = ctx.createLinearGradient(0, ROAD_EDGE_Y - 1, 0, ROAD_EDGE_Y + 18);
    deckG.addColorStop(0, '#e0f2fe');
    deckG.addColorStop(0.16, '#22d3ee');
    deckG.addColorStop(0.48, '#0f2942');
    deckG.addColorStop(1, '#060d1a');
    ctx.fillStyle = deckG;
    ctx.fillRect(0, ROAD_EDGE_Y, w, 18);

    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, ROAD_EDGE_Y);
    ctx.lineTo(w, ROAD_EDGE_Y);
    ctx.stroke();

    // Micro-bolted expansion joints & optical fiber trench markers every 20px (razor-sharp at 2.75x zoom!)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.48)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let dx = 0; dx <= w; dx += 20) {
      ctx.moveTo(dx, ROAD_EDGE_Y + 1);
      ctx.lineTo(dx, ROAD_EDGE_Y + 17);
    }
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    for (let dx = 10; dx < w; dx += 40) {
      ctx.fillRect(dx - 2, ROAD_EDGE_Y + 5, 4, 1.6);
    }

    // 7. Sub-Floor (y = 698..1000): Subterranean Megawatt Power & Liquid-Immersion Trench
    const trenchG = ctx.createLinearGradient(0, ROAD_EDGE_Y + 18, 0, h);
    trenchG.addColorStop(0, '#071120');
    trenchG.addColorStop(0.45, '#050b16');
    trenchG.addColorStop(1, '#02050b');
    ctx.fillStyle = trenchG;
    ctx.fillRect(0, ROAD_EDGE_Y + 18, w, h - (ROAD_EDGE_Y + 18));

    // Heavy structural steel deck-support trusses (y = 698..748 — right inside the 2.75x zoom lower frame!)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let tx = 0; tx < w; tx += 40) {
      ctx.moveTo(tx, ROAD_EDGE_Y + 18);
      ctx.lineTo(tx, 748);
      ctx.moveTo(tx, ROAD_EDGE_Y + 18);
      ctx.lineTo(tx + 40, 748);
      ctx.moveTo(tx + 40, ROAD_EDGE_Y + 18);
      ctx.lineTo(tx, 748);
    }
    ctx.moveTo(0, 748);
    ctx.lineTo(w, 748);
    ctx.stroke();

    // Horizontal Megawatt Cryo-Coolant & HVDC Optical Conduits (y = 760..960)
    const pipeRows = [
      { y: 766, h: 10, col: '#0ea5e9', hi: '#7dd3fc' },
      { y: 788, h: 8, col: '#d97706', hi: '#fde68a' },
      { y: 822, h: 14, col: '#0284c7', hi: '#22d3ee' },
      { y: 862, h: 9, col: '#334155', hi: '#94a3b8' },
      { y: 904, h: 12, col: '#0ea5e9', hi: '#e0f2fe' },
    ];
    for (const pr of pipeRows) {
      ctx.fillStyle = pr.col;
      ctx.fillRect(0, pr.y, w, pr.h);
      ctx.fillStyle = pr.hi;
      ctx.globalAlpha = 0.48;
      ctx.fillRect(0, pr.y + 1.5, w, 2.0);
      ctx.globalAlpha = 1.0;

      // Bolted pipe flange collars every 80px
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = pr.hi;
      ctx.lineWidth = 0.8;
      for (let fx = 36; fx < w; fx += 80) {
        ctx.fillRect(fx - 3, pr.y - 2, 6, pr.h + 4);
        ctx.strokeRect(fx - 3, pr.y - 2, 6, pr.h + 4);
      }
    }

    // 8. Blazing Cyan-Gold Logarithmic Scaling Law Diagonal Wash (`L(N) = (N_c / N)^{α_N}`)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const beamAng = Math.atan2(SCALE_P1.y - SCALE_P0.y, SCALE_P1.x - SCALE_P0.x);
    const nx = -Math.sin(beamAng);
    const ny = Math.cos(beamAng);

    // Wide atmospheric volumetric corridor along the power-law slope
    const corridorG = ctx.createLinearGradient(
      500 - nx * 46,
      372 - ny * 46,
      500 + nx * 46,
      372 + ny * 46
    );
    corridorG.addColorStop(0, 'rgba(34, 211, 238, 0)');
    corridorG.addColorStop(0.5, 'rgba(34, 211, 238, 0.24)');
    corridorG.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = corridorG;
    ctx.beginPath();
    ctx.moveTo(SCALE_P0.x - nx * 46, SCALE_P0.y - ny * 46);
    ctx.lineTo(SCALE_P1.x - nx * 46, SCALE_P1.y - ny * 46);
    ctx.lineTo(SCALE_P1.x + nx * 46, SCALE_P1.y + ny * 46);
    ctx.lineTo(SCALE_P0.x + nx * 46, SCALE_P0.y + ny * 46);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

// Precomputed animated rack-activity LED coordinates so per-frame shimmer is < 0.2ms
const LIVE_SHIMMER_LEDS = (() => {
  const rng = makePRNG(hashSeed('s05_live_gpu_leds_2020'));
  const list = [];
  for (let i = 0; i < 140; i++) {
    const zone = i % 3;
    const x = zone === 0
      ? 24 + rng() * 192
      : zone === 1
        ? 262 + rng() * 492
        : 796 + rng() * 180;
    const y = (zone === 1 ? 34 : 96) + rng() * (ROAD_EDGE_Y - 110);
    list.push({
      x,
      y,
      phase: rng() * TAU,
      speed: 3.5 + rng() * 6.5,
      isGold: rng() < 0.22,
    });
  }
  return list;
})();

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

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Monumental Exascale GPU Canyon & Canyon-Floor Micro-Architecture
  const bg = getBakedScalingCanyon(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Live Shimmering GPU Compute Activity Waves across the Towering Monoliths
  ctx.save();
  for (let i = 0; i < LIVE_SHIMMER_LEDS.length; i++) {
    const led = LIVE_SHIMMER_LEDS[i];
    const s = Math.sin(t * led.speed + led.phase - led.y * 0.012);
    if (s < 0.25) continue;
    ctx.fillStyle = led.isGold ? '#fde047' : '#67e8f9';
    ctx.globalAlpha = (s - 0.25) * 1.15;
    ctx.fillRect(led.x, led.y, 2.0, 1.5);
  }
  ctx.restore();

  // 3. Live Plunging Cryogenic Coolant Cataract & Rising Canyon-Floor Mist Wisps
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let k = 0; k < 10; k++) {
    const u = (t * 0.85 + k * 0.1) % 1;
    const py = lerp(52, ROAD_EDGE_Y - 18, u);
    const px = 541 + Math.sin(u * 18 + k) * 4;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.68)';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py + 24);
    ctx.stroke();
  }

  // Plunge-pool cryo-vapor mist plume at the foot of the cooling cascade (541, 676)
  const mistPulse = 0.22 + 0.08 * Math.sin(t * 2.5);
  const plungeG = ctx.createRadialGradient(541, ROAD_EDGE_Y - 8, 6, 541, ROAD_EDGE_Y - 24, 118);
  plungeG.addColorStop(0, `rgba(186, 230, 253, ${mistPulse.toFixed(3)})`);
  plungeG.addColorStop(0.55, 'rgba(34, 211, 238, 0.08)');
  plungeG.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.fillStyle = plungeG;
  ctx.fillRect(410, 550, 262, 130);
  ctx.restore();

  // 4. Blazing Cyan-Gold Logarithmic Scaling Law Diagonal Beam (`L(N) ∝ N⁻⁰·⁰⁷⁶`)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const beamGrad = ctx.createLinearGradient(SCALE_P0.x, SCALE_P0.y, SCALE_P1.x, SCALE_P1.y);
  beamGrad.addColorStop(0, '#38bdf8');
  beamGrad.addColorStop(0.55, '#22d3ee');
  beamGrad.addColorStop(0.82, '#fbbf24');
  beamGrad.addColorStop(1, '#fef08a');

  // Outer glow & razor-sharp power-law core line
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.34)';
  ctx.lineWidth = 9.0 + beatPulse * 4.5;
  ctx.beginPath();
  ctx.moveTo(SCALE_P0.x, SCALE_P0.y);
  ctx.lineTo(SCALE_P1.x, SCALE_P1.y);
  ctx.stroke();

  ctx.strokeStyle = beamGrad;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(SCALE_P0.x, SCALE_P0.y);
  ctx.lineTo(SCALE_P1.x, SCALE_P1.y);
  ctx.stroke();

  // Racing Exascale FLOPs Energy Packets surging down the Power-Law Slope
  for (let p = 0; p < 5; p++) {
    const u = (t * 0.62 + p * 0.2) % 1;
    const px = lerp(SCALE_P0.x, SCALE_P1.x, u);
    const py = lerp(SCALE_P0.y, SCALE_P1.y, u);
    ctx.fillStyle = u > 0.65 ? '#fef08a' : '#e0f2fe';
    ctx.beginPath();
    ctx.arc(px, py, 3.6 + beatPulse * 1.8, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // Empirical Scaling-Law Compute Frontier Checkpoints & Formula Callout
  ctx.save();
  for (const cp of CHECKPOINTS) {
    const cx = lerp(SCALE_P0.x, SCALE_P1.x, cp.u);
    const cy = lerp(SCALE_P0.y, SCALE_P1.y, cp.u);
    const active = !hidePelican && Math.abs(rx - cx) < 130;

    ctx.fillStyle = '#060c18';
    ctx.strokeStyle = active ? '#fbbf24' : '#22d3ee';
    ctx.lineWidth = active ? 2.4 : 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, active ? 6.5 : 4.8, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 10.5px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = active ? '#fef08a' : '#e0f2fe';
    ctx.textAlign = 'left';
    ctx.fillText(cp.param, cx + 10, cy - 6);
    ctx.font = '500 9px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = 'rgba(125, 211, 252, 0.80)';
    ctx.fillText(cp.label, cx + 10, cy + 7);
  }

  ctx.font = '700 13px "JetBrains Mono", "SF Mono", monospace';
  ctx.fillStyle = 'rgba(254, 240, 138, 0.90)';
  ctx.textAlign = 'left';
  ctx.fillText('L(N, D, C) ∝ C⁻⁰·⁰⁵⁰ · POWER-LAW SCALING', 58, 108);
  ctx.restore();

  // 5. Sub-Floor Flowing Cryo-Coolant & HVDC Power Pulses (visible right beneath the zoomed rider!)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const [py, spd, col] of [
    [771, 210, 'rgba(125, 211, 252, 0.65)'],
    [792, -180, 'rgba(253, 224, 71, 0.62)'],
    [829, 260, 'rgba(34, 211, 238, 0.68)'],
  ]) {
    ctx.fillStyle = col;
    for (let k = 0; k < 8; k++) {
      const xPos = (((t * spd + k * 125) % PANEL_SIZE) + PANEL_SIZE) % PANEL_SIZE;
      ctx.fillRect(xPos, py - 1.5, 22, 3);
    }
  }
  ctx.restore();

  // 6. CRITICAL CAMERA HOOK: 0.24x Miniature Resolute Cyber-Rider on the Exascale Canyon Floor (y = 680)!
  if (!hidePelican && rx > -260 && rx < PANEL_SIZE + 260) {
    const riderScale = 0.24;
    const rig = computePelicanRig({
      x: rx,
      y: ROAD_EDGE_Y,
      pedalAngle,
      wheelAngle: rx / (46 * riderScale),
      scale: riderScale,
      slope: 0,
      speedScale,
      poseMode: 'normal',
      time: t,
    });

    // Vertical laser telemetry link from Power-Law slope down to the miniature 0.24x Cyber-Rider
    const uBeam = clamp((rx - SCALE_P0.x) / (SCALE_P1.x - SCALE_P0.x), 0, 1);
    const beamYAtRx = lerp(SCALE_P0.y, SCALE_P1.y, uBeam);
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.34)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(rx, beamYAtRx);
    ctx.lineTo(rx, ROAD_EDGE_Y - 56);
    ctx.stroke();

    // Crisp micro-wake & optical ground reflection around the 0.24x cycle (sharp at 2.75x zoom!)
    ctx.globalCompositeOperation = 'screen';
    const wakeG = ctx.createLinearGradient(rx - 68, ROAD_EDGE_Y, rx + 24, ROAD_EDGE_Y);
    wakeG.addColorStop(0, 'rgba(34, 211, 238, 0)');
    wakeG.addColorStop(0.65, 'rgba(34, 211, 238, 0.45)');
    wakeG.addColorStop(1, 'rgba(251, 191, 36, 0.65)');
    ctx.strokeStyle = wakeG;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(rx - 68, ROAD_EDGE_Y - 0.5);
    ctx.lineTo(rx + 22, ROAD_EDGE_Y - 0.5);
    ctx.stroke();

    // Micro telemetry tag hovering neatly beside the zoomed-in 0.24x rider
    ctx.font = '600 7.5px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('AGENT-01 · 175B PF-DAYS', rx, ROAD_EDGE_Y - 64);
    ctx.restore();

    drawRig2D(ctx, rig, {
      featherFill: '#f1f5f9',
      featherShade: '#94a3b8',
      wingTipDark: '#0f172a',
      beakFill: '#22d3ee',
      pouchFill: '#fbbf24',
      legFill: '#e2e8f0',
      frameStroke: '#22d3ee',
      metalStroke: '#38bdf8',
      tireStroke: '#040914',
      inkOutline: '#02060d',
      glowColor: '#22d3ee',
      halo: true,
      scanBeam: true,
      lineScale: 1.38,
    });
  }

  // 7. Outro 7x3 Exhibition Wall Thumbnail Caption
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(6, 11, 20, 0.86)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 4);
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene?.num ?? 5).padStart(2, '0')} ${scene?.zh ?? 'Scaling Law 算力洪流'}`, 36, PANEL_SIZE - 46);
  }

  ctx.restore();
}
