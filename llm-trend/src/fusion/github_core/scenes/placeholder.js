// src/fusion/github_core/scenes/placeholder.js
// Clean cybernetic fallback panel for 《硅基涌现·大模型二十幕》.

import { PANEL_SIZE, ROAD_EDGE_Y } from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';

export function renderPlaceholderPanel(kit, slot, scene, params) {
  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;
  const pal = scene?.palette || ['#0b1120', '#38bdf8', '#fbbf24', '#e2e8f0'];

  ctx.fillStyle = pal[0];
  ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 1000; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, ROAD_EDGE_Y);
    ctx.stroke();
  }

  ctx.strokeStyle = pal[1] || '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, ROAD_EDGE_Y);
  ctx.lineTo(PANEL_SIZE, ROAD_EDGE_Y);
  ctx.stroke();

  const rx = params?.pelicanLocalX ?? 500;
  if (!params?.hidePelican && rx > -260 && rx < 1260) {
    const rig = computePelicanRig({
      x: rx,
      y: ROAD_EDGE_Y,
      pedalAngle: params?.pedalAngle ?? 0,
      scale: scene?.id === 's05_song' ? 0.24 : 1.0,
      speedScale: params?.speedScale ?? 1.0,
      time: params?.t ?? 0,
    });
    drawRig2D(ctx, rig, {
      beakFill: pal[1] || '#38bdf8',
      pouchFill: pal[2] || '#fbbf24',
      frameStroke: pal[1] || '#38bdf8',
    });
  }
}
