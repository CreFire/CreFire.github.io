// src/fusion/github_core/kit/frame.js
// Museum-of-Intelligence 3D Architectural Beveled Frame Engine for 《硅基涌现·大模型二十幕》.
// Bakes crisp anodized-titanium / brushed-brass / holographic-bezel mountings per panel
// with seamless open-seam handling for `s01_sahara_pre` + `s01_sahara` and `s20_code` + post-extension.

import { PANEL_SIZE } from '../beat/timeline.js';

const OX = 24;
const OY = 24;
const BAKE_W = PANEL_SIZE + OX * 2;
const BAKE_H = PANEL_SIZE + OY * 2;

function getBakedPanelFrame(kit, scene) {
  const key = `llm_frame_v1_${scene.id}_${scene.index}`;
  return kit.bake2D(
    key,
    (_g, ctx) => {
      ctx.clearRect(0, 0, BAKE_W, BAKE_H);

      const openLeft = scene.id === 's01_sahara' || scene.index === -2;
      const openRight =
        scene.id === 's01_sahara_pre' || (scene.id === 's20_code' && scene.index === 19);

      const fw = 18; // Frame molding width inside/around panel edge
      const xL = openLeft ? 0 : OX - 6;
      const xR = openRight ? BAKE_W : OX + PANEL_SIZE + 6;
      const yT = OY - 6;
      const yB = OY + PANEL_SIZE + 6;

      const bodyColor = scene.frameColor || '#1e293b';
      const accentColor = scene.frameAccent || '#38bdf8';

      // Outer ambient drop shadow onto gallery wall
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.lineWidth = 10;
      ctx.strokeRect(xL + 2, yT + 4, xR - xL, yB - yT);
      ctx.restore();

      // Inner recessed shadow onto artwork canvas edges
      const shW = 18;
      if (!openLeft) {
        const gL = ctx.createLinearGradient(OX, 0, OX + shW, 0);
        gL.addColorStop(0, 'rgba(0,0,0,0.48)');
        gL.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gL;
        ctx.fillRect(OX, OY, shW, PANEL_SIZE);
      }
      if (!openRight) {
        const gR = ctx.createLinearGradient(OX + PANEL_SIZE - shW, 0, OX + PANEL_SIZE, 0);
        gR.addColorStop(0, 'rgba(0,0,0,0)');
        gR.addColorStop(1, 'rgba(0,0,0,0.48)');
        ctx.fillStyle = gR;
        ctx.fillRect(OX + PANEL_SIZE - shW, OY, shW, PANEL_SIZE);
      }
      const gT = ctx.createLinearGradient(0, OY, 0, OY + shW);
      gT.addColorStop(0, 'rgba(0,0,0,0.50)');
      gT.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gT;
      ctx.fillRect(openLeft ? 0 : OX, OY, openLeft || openRight ? BAKE_W : PANEL_SIZE, shW);

      const gB = ctx.createLinearGradient(0, OY + PANEL_SIZE - shW, 0, OY + PANEL_SIZE);
      gB.addColorStop(0, 'rgba(0,0,0,0)');
      gB.addColorStop(1, 'rgba(0,0,0,0.52)');
      ctx.fillStyle = gB;
      ctx.fillRect(openLeft ? 0 : OX, OY + PANEL_SIZE - shW, openLeft || openRight ? BAKE_W : PANEL_SIZE, shW);

      // Brushed metallic frame molding bars (Top, Bottom, and optional Left/Right)
      ctx.fillStyle = bodyColor;
      // Top bar
      ctx.fillRect(xL, yT, xR - xL, fw);
      // Bottom bar
      ctx.fillRect(xL, yB - fw, xR - xL, fw);
      if (!openLeft) {
        ctx.fillRect(xL, yT, fw, yB - yT);
      }
      if (!openRight) {
        ctx.fillRect(xR - fw, yT, fw, yB - yT);
      }

      // 3D mitered highlight & shadow lines + glowing era accent rule
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(xL, yT + 1);
      ctx.lineTo(xR, yT + 1);
      if (!openLeft) {
        ctx.moveTo(xL + 1, yT);
        ctx.lineTo(xL + 1, yB);
      }
      ctx.stroke();

      // Inner chamfered accent bezel
      const inX0 = openLeft ? 0 : xL + fw - 1.5;
      const inX1 = openRight ? BAKE_W : xR - fw + 1.5;
      const inY0 = yT + fw - 1.5;
      const inY1 = yB - fw + 1.5;

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.0;
      ctx.globalAlpha = 0.86;
      ctx.beginPath();
      ctx.moveTo(inX0, inY0);
      ctx.lineTo(inX1, inY0);
      ctx.moveTo(inX0, inY1);
      ctx.lineTo(inX1, inY1);
      if (!openLeft) {
        ctx.moveTo(inX0, inY0);
        ctx.lineTo(inX0, inY1);
      }
      if (!openRight) {
        ctx.moveTo(inX1, inY0);
        ctx.lineTo(inX1, inY1);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Precision corner rivets on closed corners
      const corners = [];
      if (!openLeft) {
        corners.push([xL + fw * 0.5, yT + fw * 0.5], [xL + fw * 0.5, yB - fw * 0.5]);
      }
      if (!openRight) {
        corners.push([xR - fw * 0.5, yT + fw * 0.5], [xR - fw * 0.5, yB - fw * 0.5]);
      }
      ctx.fillStyle = accentColor;
      for (const [cx, cy] of corners) {
        ctx.beginPath();
        ctx.arc(cx, cy, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    BAKE_W,
    BAKE_H
  );
}

export function drawPanelFrame(p, scene, isActive = false, pulse = 0, kit = null) {
  const x0 = scene.worldX0;
  const y0 = 0;
  const w = PANEL_SIZE;
  const h = PANEL_SIZE;

  p.push();
  if (kit) {
    const frameG = getBakedPanelFrame(kit, scene);
    p.imageMode(p.CORNER);
    p.image(frameG, x0 - OX, y0 - OY, BAKE_W, BAKE_H);

    if (isActive && pulse > 0.0003) {
      const uPulse = Math.min(1, pulse / 0.005);
      const alpha = Math.round(uPulse * 38);
      if (alpha >= 2) {
        const accentCol = p.color(scene.frameAccent || '#38bdf8');
        p.rectMode(p.CORNER);
        p.noFill();
        p.stroke(p.red(accentCol), p.green(accentCol), p.blue(accentCol), alpha);
        p.strokeWeight(1.5);
        p.rect(x0 + 12, y0 + 12, w - 24, h - 24);
      }
    }
  } else {
    p.rectMode(p.CORNER);
    p.noFill();
    p.stroke(scene.frameColor || '#1e293b');
    p.strokeWeight(8);
    p.rect(x0 + 4, y0 + 4, w - 8, h - 8);
  }
  p.pop();
}
