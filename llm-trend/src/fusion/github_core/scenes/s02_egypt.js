// src/fusion/github_core/scenes/s02_egypt.js
// 02 · 反向传播与梯度谷 (1986 · Backpropagation & Loss Landscape)
// - Crisp Prussian-blue engineering cyanotype / CAD blueprint aesthetic (#0a1e38, #38bdf8, #e0f2fe, #facc15)
// - Topographic 3D wireframe + elevation contour Loss Landscape L(w₁, w₂) plunging to Global Minimum at x = 500
// - Sky Multi-Layer Perceptron (MLP) hidden-unit network pulsing forward activations (cyan) & backward error
//   gradients (∂L/∂w golden backprop pulses)
// - Synchronized with `freeze_bar2` plateau around localT ≈ 3.0s (x ≈ 500): locks a glowing golden CAD target
//   reticle (`GLOBAL MINIMUM · ∇L → 0`) onto the Cyber-Rider at the basin center

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

const TAU = Math.PI * 2;

const CAD = {
  prussianDeep: '#061326',
  prussianBase: '#0a1e38',
  prussianMid: '#0f2d52',
  cyanLine: '#38bdf8',
  cyanBright: '#7dd3fc',
  cyanWhite: '#e0f2fe',
  goldGrad: '#facc15',
  goldHot: '#fef08a',
  goldAmber: '#eab308',
};

// Multi-layer MLP architecture in upper blueprint sky (x in [130..870], y in [74..252])
const MLP_LAYERS = [
  { x: 156, label: 'x', ys: [96, 138, 180, 222] },
  { x: 348, label: 'h₁', ys: [78, 112, 146, 180, 214, 248] },
  { x: 552, label: 'h₂', ys: [86, 124, 162, 200, 238] },
  { x: 744, label: 'ŷ', ys: [112, 162, 212] },
  { x: 868, label: 'L', ys: [162] },
];

// Analytic 2D Non-Convex Loss Surface L(u, v) where u in [-1, 1] (x=0..1000), v in [-1, 1] (depth)
// Features high flanking saddle ridges and a deep central Global Minimum bowl at u = 0 (x = 500)
function evalLossHeight(u, v) {
  const globalBowl = 1.0 - 0.88 * Math.exp(-(u * u * 3.8 + v * v * 2.6));
  const leftSaddle = 0.34 * Math.exp(-Math.pow((u + 0.62) / 0.24, 2) - v * v * 2.2);
  const rightSaddle = 0.36 * Math.exp(-Math.pow((u - 0.64) / 0.25, 2) - v * v * 2.0);
  const ripples = 0.045 * Math.cos(u * 9.5) * Math.cos(v * 6.0);
  return clamp(globalBowl + leftSaddle + rightSaddle + ripples, 0.04, 1.38);
}

// Projects (u, v, L) onto the 1000x1000 blueprint elevation view above y = 680
function projectLossPoint(u, v) {
  const loss = evalLossHeight(u, v);
  const px = 500 + u * 485 + v * 46;
  const py = ROAD_EDGE_Y - 22 - (v + 1) * 44 - loss * 245;
  return { x: px, y: py, loss };
}

// 1D valley-floor cross-section curve descending toward (500, 628)
function evalValleyCurveY(px) {
  const u = (px - 500) / 485;
  const p = projectLossPoint(u, -0.22 * Math.exp(-u * u * 3.0));
  return p.y;
}

function drawBlueprintCrosshair(ctx, x, y, size = 6) {
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
}

function getBakedBlueprint(kit) {
  return kit.bake2D('s02_backprop_blueprint_v1', (_g, ctx, rng, w, h) => {
    // 1. Prussian-Blue Cyanotype Paper Substrate
    const bgGrad = ctx.createRadialGradient(500, 440, 80, 500, 500, 720);
    bgGrad.addColorStop(0, '#0e294b');
    bgGrad.addColorStop(0.58, '#0a1e38');
    bgGrad.addColorStop(1, '#061224');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle cyanotype paper fiber mottling
    for (let i = 0; i < 1400; i++) {
      const fx = rng() * w;
      const fy = rng() * h;
      const a = 0.015 + rng() * 0.025;
      ctx.fillStyle = rng() > 0.5 ? `rgba(224, 242, 254, ${a.toFixed(3)})` : `rgba(3, 9, 20, ${(a * 1.6).toFixed(3)})`;
      ctx.fillRect(fx, fy, 1.5 + rng() * 3, 1.2);
    }

    // 2. Engineering CAD Millimeter & Centimeter Grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.075)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 20) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(125, 211, 252, 0.17)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 100) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 100) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Registration fiducial crosshairs at 200px intersections
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.36)';
    ctx.lineWidth = 1.1;
    for (let x = 100; x <= 900; x += 200) {
      for (let y = 100; y <= 900; y += 200) {
        drawBlueprintCrosshair(ctx, x, y, 5.5);
      }
    }

    // 3. Upper Sky Multi-Layer Perceptron (MLP) Static Schematic Frame & Synaptic Edges
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.34)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(72, 46, 856, 224);

    // Corner CAD brackets on MLP block
    ctx.strokeStyle = CAD.cyanWhite;
    ctx.lineWidth = 2.0;
    for (const [bx, by, sx, sy] of [
      [72, 46, 1, 1],
      [928, 46, -1, 1],
      [72, 270, 1, -1],
      [928, 270, -1, -1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(bx, by + sy * 16);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + sx * 16, by);
      ctx.stroke();
    }

    // Synaptic weight matrix connections between adjacent MLP layers
    for (let l = 0; l < MLP_LAYERS.length - 1; l++) {
      const L0 = MLP_LAYERS[l];
      const L1 = MLP_LAYERS[l + 1];
      for (let i = 0; i < L0.ys.length; i++) {
        for (let j = 0; j < L1.ys.length; j++) {
          const wStrength = 0.14 + 0.22 * ((i * 7 + j * 13 + l * 5) % 5) * 0.25;
          ctx.strokeStyle = `rgba(125, 211, 252, ${wStrength.toFixed(2)})`;
          ctx.lineWidth = 0.85 + ((i + j) % 3) * 0.35;
          ctx.beginPath();
          ctx.moveTo(L0.x, L0.ys[i]);
          ctx.lineTo(L1.x, L1.ys[j]);
          ctx.stroke();
        }
      }
    }

    // Double-ring blueprint neuron nodes + miniature sigmoid σ(z) curves inside hidden units
    for (let l = 0; l < MLP_LAYERS.length; l++) {
      const layer = MLP_LAYERS[l];
      const isLoss = l === MLP_LAYERS.length - 1;
      for (const ny of layer.ys) {
        const r = isLoss ? 15 : 11.5;
        ctx.fillStyle = '#081b33';
        ctx.strokeStyle = isLoss ? CAD.goldGrad : CAD.cyanWhite;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(layer.x, ny, r, 0, TAU);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = isLoss ? 'rgba(250, 204, 21, 0.5)' : 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.arc(layer.x, ny, r - 3.2, 0, TAU);
        ctx.stroke();

        if (!isLoss && l > 0) {
          // Crisp sigmoid curve inside hidden/output neurons
          ctx.strokeStyle = CAD.cyanBright;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          for (let k = -5; k <= 5; k++) {
            const sx = layer.x + k * 1.1;
            const sig = 1 / (1 + Math.exp(-k * 0.75));
            const sy = ny + 4.2 - sig * 8.4;
            if (k === -5) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }
      }

      // Crisp CAD blueprint labels
      ctx.font = '600 11px "JetBrains Mono", "SF Mono", monospace';
      ctx.fillStyle = isLoss ? CAD.goldHot : 'rgba(224, 242, 254, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(layer.label, layer.x, 63);
    }

    ctx.font = '600 11px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = 'rgba(125, 211, 252, 0.78)';
    ctx.textAlign = 'left';
    ctx.fillText('FWD: a⁽ˡ⁾ = σ(W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)', 88, 261);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.88)';
    ctx.textAlign = 'right';
    ctx.fillText('BWD: ∂L/∂W⁽ˡ⁾ = δ⁽ˡ⁾(a⁽ˡ⁻¹⁾)ᵀ', 912, 261);

    // 4. Monumental 3D Wireframe + Topographic Contour Loss Landscape (y = 290..680)
    // Back-to-front constant-v wireframe slices (u in [-1.02..1.02])
    const vSlices = 19;
    const uSteps = 72;
    for (let iv = vSlices; iv >= 0; iv--) {
      const v = -1.0 + (iv / vSlices) * 2.0;
      const isMajor = iv % 3 === 0;
      ctx.strokeStyle = isMajor
        ? 'rgba(125, 211, 252, 0.44)'
        : 'rgba(56, 189, 248, 0.20)';
      ctx.lineWidth = isMajor ? 1.35 : 0.8;
      ctx.beginPath();
      for (let iu = 0; iu <= uSteps; iu++) {
        const u = -1.04 + (iu / uSteps) * 2.08;
        const p = projectLossPoint(u, v);
        if (iu === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Transverse constant-u gradient ribs plunging down into the central valley
    const uSlices = 28;
    for (let iu = 0; iu <= uSlices; iu++) {
      const u = -1.02 + (iu / uSlices) * 2.04;
      const isCenter = Math.abs(u) < 0.04;
      const isMajor = iu % 4 === 0 || isCenter;
      ctx.strokeStyle = isCenter
        ? 'rgba(250, 204, 21, 0.50)'
        : isMajor
          ? 'rgba(224, 242, 254, 0.34)'
          : 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = isCenter ? 1.6 : isMajor ? 1.15 : 0.75;
      ctx.beginPath();
      for (let iv = 0; iv <= 20; iv++) {
        const v = -1.0 + (iv / 20) * 2.0;
        const p = projectLossPoint(u, v);
        if (iv === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Concentric Topographic Iso-Loss Contour Rings around Global Minimum (500, 625)
    for (let ring = 1; ring <= 7; ring++) {
      const radU = ring * 0.115;
      const radV = ring * 0.135;
      ctx.strokeStyle = ring <= 2
        ? 'rgba(250, 204, 21, 0.58)'
        : `rgba(224, 242, 254, ${(0.48 - ring * 0.05).toFixed(2)})`;
      ctx.lineWidth = ring === 1 ? 1.8 : 1.1;
      ctx.beginPath();
      for (let a = 0; a <= 64; a++) {
        const th = (a / 64) * TAU;
        const u = Math.cos(th) * radU;
        const v = Math.sin(th) * radV;
        const p = projectLossPoint(u, v);
        if (a === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Negative Gradient Field Arrows (-∇L) pointing down both valley walls toward x = 500
    for (const uPos of [-0.78, -0.56, -0.34, -0.18, 0.18, 0.34, 0.56, 0.78]) {
      const p0 = projectLossPoint(uPos, -0.1);
      const step = uPos < 0 ? 0.09 : -0.09;
      const p1 = projectLossPoint(uPos + step, -0.1);
      const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
      ctx.fillStyle = 'rgba(250, 204, 21, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p1.x - Math.cos(ang - 0.45) * 7, p1.y - Math.sin(ang - 0.45) * 7);
      ctx.lineTo(p1.x - Math.cos(ang + 0.45) * 7, p1.y - Math.sin(ang + 0.45) * 7);
      ctx.closePath();
      ctx.fill();
    }

    // 5. Canonical y = 680 Road: Precision CAD Datum & Vernier Parameter Axis [0..1000]
    const roadGrad = ctx.createLinearGradient(0, ROAD_EDGE_Y - 2, 0, ROAD_EDGE_Y + 22);
    roadGrad.addColorStop(0, '#e0f2fe');
    roadGrad.addColorStop(0.18, '#38bdf8');
    roadGrad.addColorStop(0.55, '#0c4a6e');
    roadGrad.addColorStop(1, '#07192e');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, ROAD_EDGE_Y, w, 22);

    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, ROAD_EDGE_Y);
    ctx.lineTo(w, ROAD_EDGE_Y);
    ctx.stroke();

    // Vernier scale ticks along y = 680..698
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.72)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 10) {
      const tickH = x % 100 === 0 ? 15 : x % 50 === 0 ? 10 : 5;
      ctx.moveTo(x, ROAD_EDGE_Y + 1);
      ctx.lineTo(x, ROAD_EDGE_Y + 1 + tickH);
    }
    ctx.stroke();

    // 6. Sub-Floor (y = 702..1000): CAD Loss-Convergence Plot, Learning-Rate Schedule & Chain-Rule Bus
    ctx.fillStyle = 'rgba(6, 18, 36, 0.72)';
    ctx.fillRect(0, ROAD_EDGE_Y + 22, w, h - (ROAD_EDGE_Y + 22));

    // Left Sub-Panel: Training Epoch Loss Curve L(t) (x = 56..464, y = 728..960)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(56, 728, 408, 228);
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      const cx = 74 + u * 372;
      const cy = 934 - (Math.exp(-u * 4.2) * 168 + Math.sin(u * 26) * Math.exp(-u * 3) * 14);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = CAD.goldGrad;
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Right Sub-Panel: Backprop Jacobian Chain-Rule Circuit Matrix (x = 536..944, y = 728..960)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(536, 728, 408, 228);

    for (let row = 0; row < 6; row++) {
      const ry = 754 + row * 34;
      ctx.strokeStyle = row % 2 === 0 ? 'rgba(56, 189, 248, 0.36)' : 'rgba(250, 204, 21, 0.34)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(554, ry);
      ctx.lineTo(926, ry);
      ctx.stroke();
      for (let col = 0; col < 8; col++) {
        const cx = 576 + col * 46;
        ctx.fillStyle = (row + col) % 3 === 0 ? CAD.goldGrad : CAD.cyanLine;
        ctx.fillRect(cx - 3, ry - 3, 6, 6);
      }
    }

    // Center Axis Monument Column below Global Minimum x = 500
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(500, ROAD_EDGE_Y + 22);
    ctx.lineTo(500, 976);
    ctx.stroke();

    ctx.font = '600 11px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = 'rgba(224, 242, 254, 0.72)';
    ctx.textAlign = 'left';
    ctx.fillText('LOSS CONVERGENCE L(t)', 70, 746);
    ctx.fillText('w ← w − η · ∂L/∂w', 552, 746);
  });
}

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

  // `freeze_bar2` slows the rider right around localT = 3.0s near valley center x ≈ 500!
  const freezeEnv = isOutroThumbnail
    ? 1.0
    : smootherstep(1.55, 2.35, localT) * (1 - smootherstep(3.65, 4.45, localT));

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Static Prussian-Blue CAD Blueprint & 3D Loss Landscape
  const bg = getBakedBlueprint(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Live MLP Forward (Cyan) & Backward Error (∂L/∂w Golden) Signal Pulses in Sky
  const cyclePhase = (localT * 0.85) % 1.0; // Alternates crisp forward wave & golden backprop wave
  const isBackpropDom = cyclePhase > 0.42 || freezeEnv > 0.35;

  ctx.save();
  for (let l = 0; l < MLP_LAYERS.length - 1; l++) {
    const L0 = MLP_LAYERS[l];
    const L1 = MLP_LAYERS[l + 1];

    // Forward cyan pulses (left -> right)
    const fwdProg = ((t * 1.6 - l * 0.24) % 1 + 1) % 1;
    // Backward golden gradient pulses (right -> left: ∂L/∂w!)
    const bwdProg = ((t * 1.9 - (MLP_LAYERS.length - 2 - l) * 0.22) % 1 + 1) % 1;

    for (let i = 0; i < L0.ys.length; i++) {
      for (let j = 0; j < L1.ys.length; j++) {
        if ((i + j + l) % 2 !== 0) continue;
        const x0 = L0.x;
        const y0 = L0.ys[i];
        const x1 = L1.x;
        const y1 = L1.ys[j];

        // Forward activation packet
        const fx = lerp(x0, x1, fwdProg);
        const fy = lerp(y0, y1, fwdProg);
        ctx.fillStyle = 'rgba(125, 211, 252, 0.72)';
        ctx.beginPath();
        ctx.arc(fx, fy, 2.1, 0, TAU);
        ctx.fill();

        // Golden Backpropagation gradient pulse (∂L/∂w)
        const bx = lerp(x1, x0, bwdProg);
        const by = lerp(y1, y0, bwdProg);
        const goldAlpha = isBackpropDom ? 0.95 : 0.65;
        ctx.fillStyle = `rgba(250, 204, 21, ${goldAlpha})`;
        ctx.beginPath();
        ctx.arc(bx, by, 2.8 + beatPulse * 1.2, 0, TAU);
        ctx.fill();
      }
    }
  }
  ctx.restore();

  // 3. Live SGD / Backprop Descent Trajectory Ribbon along the 3D Valley Floor
  const clampedRx = clamp(hidePelican ? 500 : rx, 30, 970);
  const valleyRiderY = evalValleyCurveY(clampedRx);

  ctx.save();
  // Illuminated golden SGD descent curve from x = 30 to current rider position
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.28)';
  ctx.lineWidth = 7.0;
  ctx.beginPath();
  for (let px = 30; px <= clampedRx; px += 10) {
    const py = evalValleyCurveY(px);
    if (px === 30) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.strokeStyle = CAD.goldHot;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let px = 30; px <= clampedRx; px += 10) {
    const py = evalValleyCurveY(px);
    if (px === 30) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Vertical CAD laser plumb-line connecting 3D Loss Surface point (clampedRx, valleyRiderY) to Rider at y=680
  if (!hidePelican && rx > -80 && rx < PANEL_SIZE + 80) {
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.62)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(clampedRx, valleyRiderY);
    ctx.lineTo(clampedRx, ROAD_EDGE_Y);
    ctx.stroke();

    // Glowing Loss Ball rolling on the 3D landscape directly above the rider
    ctx.fillStyle = CAD.goldHot;
    ctx.strokeStyle = '#061326';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(clampedRx, valleyRiderY, 5.8 + beatPulse * 2.0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 4. `GLOBAL MINIMUM · ∇L → 0` Golden CAD Target Lock-On Ring (peaks during `freeze_bar2` at localT ≈ 3.0s!)
  const minCenterX = 500;
  const minCenterY = evalValleyCurveY(500);
  const lockX = lerp(minCenterX, clamp(rx, 420, 580), freezeEnv * 0.65);
  const baseRingAlpha = 0.28 + freezeEnv * 0.72;

  ctx.save();
  // Vertical golden convergence pillar at Global Minimum basin
  if (freezeEnv > 0.05) {
    const beamG = ctx.createLinearGradient(lockX - 48, 0, lockX + 48, 0);
    beamG.addColorStop(0, 'rgba(250, 204, 21, 0)');
    beamG.addColorStop(0.5, `rgba(250, 204, 21, ${(freezeEnv * 0.20).toFixed(3)})`);
    beamG.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = beamG;
    ctx.fillRect(lockX - 48, 280, 96, ROAD_EDGE_Y - 280);
  }

  // Target Ring 1: Loss Basin Center Ring at (500, minCenterY)
  ctx.strokeStyle = `rgba(250, 204, 21, ${baseRingAlpha.toFixed(2)})`;
  ctx.lineWidth = 2.0;
  const rValley = 24 + (1 - freezeEnv) * 16 + beatPulse * 3;
  ctx.beginPath();
  ctx.arc(minCenterX, minCenterY, rValley, 0, TAU);
  ctx.stroke();

  // Target Ring 2: Rotating Precision Vernier Reticle locking onto the Cyber-Rider during `freeze_bar2`!
  if (freezeEnv > 0.08 && !hidePelican) {
    const riderCenterY = ROAD_EDGE_Y - 108;
    const reticleR = lerp(128, 78, freezeEnv) + beatPulse * 4;

    ctx.translate(lockX, riderCenterY);
    ctx.save();
    ctx.rotate(t * 0.85);
    ctx.strokeStyle = `rgba(250, 204, 21, ${(freezeEnv * 0.92).toFixed(2)})`;
    ctx.lineWidth = 2.2;
    for (let q = 0; q < 4; q++) {
      const a0 = q * (Math.PI * 0.5) + 0.18;
      const a1 = (q + 1) * (Math.PI * 0.5) - 0.18;
      ctx.beginPath();
      ctx.arc(0, 0, reticleR, a0, a1);
      ctx.stroke();
    }

    // Inner counter-rotating cyan blueprint ring
    ctx.rotate(-t * 1.9);
    ctx.strokeStyle = `rgba(224, 242, 254, ${(freezeEnv * 0.72).toFixed(2)})`;
    ctx.lineWidth = 1.3;
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (reticleR - 12), Math.sin(a) * (reticleR - 12));
      ctx.lineTo(Math.cos(a) * (reticleR - 5), Math.sin(a) * (reticleR - 5));
      ctx.stroke();
    }
    ctx.restore();

    // Crisp CAD Callout Badge above target ring
    const gradNorm = ((1 - freezeEnv) * 0.84 + 0.0004).toFixed(4);
    ctx.fillStyle = `rgba(6, 19, 38, ${(freezeEnv * 0.88).toFixed(2)})`;
    ctx.strokeStyle = `rgba(250, 204, 21, ${(freezeEnv * 0.95).toFixed(2)})`;
    ctx.lineWidth = 1.5;
    ctx.fillRect(-108, -reticleR - 34, 216, 24);
    ctx.strokeRect(-108, -reticleR - 34, 216, 24);

    ctx.font = '700 11.5px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = CAD.goldHot;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`GLOBAL MINIMUM · ‖∇L‖=${gradNorm}`, 0, -reticleR - 22);
  }
  ctx.restore();

  // 5. Sub-Floor Live Epoch Cursor on Loss Convergence Plot
  const uProg = clamp(localT / 6.0, 0, 1);
  const plotX = 74 + uProg * 372;
  const plotY = 934 - (Math.exp(-uProg * 4.2) * 168 + Math.sin(uProg * 26) * Math.exp(-uProg * 3) * 14);
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(plotX, 732);
  ctx.lineTo(plotX, 952);
  ctx.stroke();
  ctx.fillStyle = CAD.goldHot;
  ctx.beginPath();
  ctx.arc(plotX, plotY, 4.2, 0, TAU);
  ctx.fill();

  // 6. Cyanotype Blueprint & Golden-Gradient Cyber-Rider at y = 680
  if (!hidePelican && rx > -260 && rx < PANEL_SIZE + 260) {
    const road = kit.sampleRoad(clamp(rx, 0, PANEL_SIZE), 0);
    const rig = computePelicanRig({
      x: rx,
      y: road.y,
      pedalAngle,
      scale: 1.0,
      slope: road.slope,
      speedScale,
      poseMode: freezeEnv > 0.45 ? 'egypt_freeze' : 'normal',
      time: localT,
    });

    drawRig2D(ctx, rig, {
      featherFill: '#e0f2fe',
      featherShade: '#7dd3fc',
      wingTipDark: '#0c2340',
      beakFill: '#facc15',
      pouchFill: '#facc15',
      legFill: '#bae6fd',
      frameStroke: '#38bdf8',
      metalStroke: '#0284c7',
      tireStroke: '#061529',
      inkOutline: '#040d1a',
      glowColor: '#38bdf8',
      halo: freezeEnv > 0.3,
      scanBeam: true,
    });

    // Live Negative-Gradient Vector Arrow (-η∇L) projected ahead of front wheel
    const vecLen = lerp(64, 18, freezeEnv);
    const vx0 = rig.frontWheel.x + 16;
    const vy0 = ROAD_EDGE_Y - 14;
    ctx.strokeStyle = CAD.goldGrad;
    ctx.fillStyle = CAD.goldGrad;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(vx0, vy0);
    ctx.lineTo(vx0 + vecLen, vy0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vx0 + vecLen + 7, vy0);
    ctx.lineTo(vx0 + vecLen - 2, vy0 - 4.5);
    ctx.lineTo(vx0 + vecLen - 2, vy0 + 4.5);
    ctx.closePath();
    ctx.fill();
  }

  // 7. Outro 7x3 Exhibition Wall Thumbnail Caption
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(6, 18, 36, 0.84)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 4);
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene?.num ?? 2).padStart(2, '0')} ${scene?.zh ?? '反向传播与梯度谷'}`, 36, PANEL_SIZE - 46);
  }

  ctx.restore();
}
