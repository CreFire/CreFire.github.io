// src/openings/left_title_wall.js
// Obsidian-Titanium Lithography Title Stele (`x = 0..344`, `y = 0..720`) for Act I (`0.00s .. 4.30s`)
// of 《硅基涌现·大模型二十幕》:
// - Double cyan-gold precision frame + 4 pure-vector Tensor Node corner crests
// - Carved cinnabar-amber seal stamp 「硅基纪」 at upper-right shoulder
// - Chiseled 3D relief typography: `SILICON EMERGENCE` / `大模型` / `演进二十幕` + milestone roadmap

import { lerp, smootherstep } from '../fusion/github_core/beat/timeline.js';

let sealStampCanvas = null;
let tensorCrestCanvas = null;

function createTensorSealCanvas(size = 256) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const pad = size * 0.08;
  const w = size - pad * 2;

  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.roundRect(pad, pad, w, w, size * 0.08);
  ctx.fill();

  ctx.strokeStyle = '#fef2f2';
  ctx.lineWidth = size * 0.035;
  ctx.strokeRect(pad + size * 0.055, pad + size * 0.055, w - size * 0.11, w - size * 0.11);

  ctx.fillStyle = '#fffbeb';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(size * 0.27)}px "PelicanSerif", "CarbonSerif", serif`;
  ctx.fillText('硅基', size * 0.5, size * 0.36);
  ctx.fillText('纪元', size * 0.5, size * 0.68);
  return c;
}

function createTensorCrestCanvas(size = 128) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;
  const r = size * 0.4;

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = size * 0.055;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = size * 0.045;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.85);
  ctx.lineTo(cx + r * 0.85, cy);
  ctx.lineTo(cx, cy + r * 0.85);
  ctx.lineTo(cx - r * 0.85, cy);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.11, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

export async function preloadLeftTitleWallAssets() {
  if (!sealStampCanvas) sealStampCanvas = createTensorSealCanvas(256);
  if (!tensorCrestCanvas) tensorCrestCanvas = createTensorCrestCanvas(128);
}

function drawDiamondNode(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();
}

function getBakedLeftObsidianStele(kit, panelW, panelH) {
  return kit.bake2D(
    `llm_intro_left_stele_v1_${panelW}x${panelH}`,
    (_g, ctx, rng, w, h) => {
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, w, h);

      const g = ctx.createRadialGradient(w * 0.55, h * 0.42, 16, w * 0.5, h * 0.5, h * 0.75);
      g.addColorStop(0, 'rgba(18, 34, 64, 0.72)');
      g.addColorStop(0.58, 'rgba(10, 18, 34, 0.38)');
      g.addColorStop(1, 'rgba(7, 11, 20, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Subtle silicon wafer circuit traces
      ctx.lineWidth = 0.75;
      for (let i = 0; i < 48; i += 1) {
        const y = 38 + i * 13.5;
        ctx.strokeStyle =
          i % 4 === 0 ? 'rgba(56, 189, 248, 0.055)' : 'rgba(148, 163, 184, 0.022)';
        ctx.beginPath();
        ctx.moveTo(28, y);
        const turnX = 80 + rng() * 210;
        ctx.lineTo(turnX, y);
        ctx.lineTo(turnX + 10, y + (rng() > 0.5 ? 6 : -6));
        ctx.stroke();
      }

      // Double precision frame (clipped at x = 344, continued in `gold_svg/scene.js`)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.62)';
      ctx.lineWidth = 0.95;
      ctx.strokeRect(28.08, 28.08, 903.84, 663.84);

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.46)';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(36.72, 36.72, 886.56, 646.56);
    },
    panelW,
    panelH
  );
}

export function drawLeftEditorialPanel(ctx, kit, panelX, panelW, panelH, doc, realT, anvilShock) {
  if (panelX + panelW <= 0) return;
  const wallBg = getBakedLeftObsidianStele(kit, panelW, panelH);

  ctx.save();
  ctx.translate(panelX, 0);
  ctx.drawImage(wallBg.canvas || wallBg, 0, 0, panelW, panelH);

  // 1. Cyan-gold tensor forge rim-glow & rising data sparks along right seam
  const rimAlpha = 0.08 + anvilShock * 0.22;
  const rimG = ctx.createLinearGradient(panelW - 120, 0, panelW, 0);
  rimG.addColorStop(0, 'rgba(34, 211, 238, 0)');
  rimG.addColorStop(1, `rgba(56, 189, 248, ${rimAlpha.toFixed(3)})`);
  ctx.fillStyle = rimG;
  ctx.fillRect(panelW - 120, 0, 120, panelH);

  if (anvilShock > 0.03) {
    ctx.save();
    ctx.fillStyle = `rgba(251, 191, 36, ${(anvilShock * 0.6).toFixed(3)})`;
    for (let i = 0; i < 8; i += 1) {
      const ey = (((130 + i * 73 - realT * (36 + i * 6)) % 560) + 560) % 560 + 80;
      const ex = panelW - 12 - ((i * 17) % 36) - Math.sin(realT * 6 + i) * 5;
      ctx.beginPath();
      ctx.arc(ex, ey, 1.3 + (i % 2) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Corner Tensor Crests
  if (tensorCrestCanvas) {
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(tensorCrestCanvas, 43.92, 43.92, 28.8, 28.8);
    ctx.drawImage(tensorCrestCanvas, 43.92, 647.28, 28.8, 28.8);
    ctx.restore();
  }

  // 3. Seal Stamp 「硅基纪元」
  const sealCx = 296;
  const sealCy = 132;
  const sealSize = 54 * (1 + anvilShock * 0.04);
  const stampEnter = smootherstep(0.02, 0.34, realT);
  if (sealStampCanvas) {
    ctx.save();
    ctx.translate(sealCx, sealCy);
    ctx.rotate(-0.02);
    const sScale = lerp(1.15, 1.0, stampEnter);
    ctx.scale(sScale, sScale);
    ctx.globalAlpha = lerp(0.88, 0.96, stampEnter);
    ctx.drawImage(sealStampCanvas, -sealSize * 0.5, -sealSize * 0.5, sealSize, sealSize);
    ctx.restore();
  }

  // 4. Relief Display Typography
  const kicker = 'SILICON EMERGENCE';
  const line1 = doc?.title?.line1 || '大模型';
  const line2 = doc?.title?.line2 || '演进二十幕';

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Kicker
  ctx.font = '800 16px "CarbonMono", "PelicanMono", ui-monospace, monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(kicker, 60, 148);

  // Main Title Line 1 (`大模型`)
  ctx.font = '900 84px "PelicanSerif", "CarbonSerif", serif';
  ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
  ctx.fillText(line1, 61.8, 258.5);
  const tGrad = ctx.createLinearGradient(60, 185, 310, 265);
  tGrad.addColorStop(0, '#ffffff');
  tGrad.addColorStop(0.55, '#f8fafc');
  tGrad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = tGrad;
  ctx.fillText(line1, 60, 256);

  // Main Title Line 2 (`演进二十幕`)
  ctx.font = '900 44px "PelicanSerif", "CarbonSerif", serif';
  ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
  ctx.fillText(line2, 61.5, 326.5);
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(line2, 60, 325);

  // 5. Horizontal Cyan-Gold Finial Rule
  const ruleY = 360;
  const midX = 192;
  ctx.save();
  const ruleGrad = ctx.createLinearGradient(60, ruleY, 324, ruleY);
  ruleGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
  ruleGrad.addColorStop(0.5, `rgba(251, 191, 36, ${(0.68 + anvilShock * 0.28).toFixed(2)})`);
  ruleGrad.addColorStop(1, 'rgba(56, 189, 248, 0.08)');
  ctx.strokeStyle = ruleGrad;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(60, ruleY);
  ctx.lineTo(midX - 9, ruleY);
  ctx.moveTo(midX + 9, ruleY);
  ctx.lineTo(324, ruleY);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  drawDiamondNode(ctx, midX, ruleY, 3.6);
  ctx.restore();

  // 6. Crisp Era Roadmap Matrix below rule
  const milestones = [
    ['1958', '感知机 · 神经元启蒙'],
    ['2017', 'Transformer · 注意力革命'],
    ['2022', 'RLHF · 对话智能觉醒'],
    ['2025', '慢思考推理 · 智能体蜂群'],
    ['2026+', '世界模型 · 具身物理智能'],
    ['AGI', '自我演进 · 通用智能黎明'],
  ];

  for (let i = 0; i < milestones.length; i += 1) {
    const my = 402 + i * 34;
    const isHighlight = i === Math.floor((realT * 2) % milestones.length);
    ctx.font = '700 13px "CarbonMono", monospace';
    ctx.fillStyle = isHighlight ? '#fbbf24' : '#38bdf8';
    ctx.fillText(milestones[i][0], 60, my);

    ctx.font = '600 14.5px "CarbonSans", sans-serif';
    ctx.fillStyle = isHighlight ? '#ffffff' : 'rgba(226, 232, 240, 0.82)';
    ctx.fillText(milestones[i][1], 116, my);
  }

  // Footer badge
  ctx.font = '700 11.5px "CarbonMono", monospace';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.72)';
  ctx.fillText('100% PURE CODE · WEBAUDIO SYNTH · 20 ACTS', 60, 632);

  ctx.restore();
}
