// src/fusion/github_core/scenes/s01_sahara.js
// 01 · 感知机与神经元 (1958 · Rosenblatt Mark I Perceptron · Hardware Relay Laboratory)
// - Warm dark bakelite, brushed brass & amber vacuum-tube laboratory wall (#18120c, #d97706, #fbbf24)
// - Horizontally mirror-safe across x = 0 so renderer.js's [-1000, 0] prologue bay forms a seamless twin-rack cabinet
// - 20x20 CdS photocell sensor grid, spinning IBM/Ampex magnetic tape reels, motorized rotary potentiometers,
//   cloth-braided patchbay plugboard cables, and oiled punched paper tape highway at y = 680
// - Live sweeping linear decision hyperplane (w·x + b = 0) separating '+' (gold) & '−' (cyan) sample point clouds,
//   beat-synced relay armatures & sparks, and copper/amber relay-styled Cyber-Rider (renderSaharaPelicanOnly + render)

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';
import { makePRNG, hashSeed } from '../kit/kit.js';

const TAU = Math.PI * 2;

const PALETTE = {
  bakeliteDeep: '#120d08',
  bakelitePanel: '#18120c',
  bakeliteWarm: '#231910',
  brassDark: '#78350f',
  brassMid: '#b45309',
  brassBright: '#d97706',
  amberGlow: '#f59e0b',
  amberHot: '#fbbf24',
  filamentCream: '#fef3c7',
  cyanNeg: '#38bdf8',
  cyanDeep: '#0284c7',
  copper: '#c2410c',
};

// Deterministic sample cloud in the classification scope (x in [110..890], y in [430..652])
const SAMPLE_POINTS = (() => {
  const rng = makePRNG(hashSeed('mark1_perceptron_samples_1958'));
  const pts = [];
  for (let i = 0; i < 40; i++) {
    const u = (i + 0.5) / 40;
    const px = 96 + u * 808 + (rng() - 0.5) * 22;
    const isPos = i % 2 === 0;
    // True separating boundary y_sep(x) slopes gently across the scope
    const sepY = 548 - (px - 500) * 0.14;
    const margin = 22 + rng() * 68;
    const py = clamp(sepY + (isPos ? -margin : margin), 434, 650);
    pts.push({
      x: px,
      y: py,
      cls: isPos ? 1 : -1,
      phase: rng() * TAU,
      weight: 0.65 + rng() * 0.55,
    });
  }
  return pts;
})();

function drawVacuumTube(ctx, cx, baseY, scale = 1.0, rng) {
  const w = 18 * scale;
  const h = 44 * scale;

  // Ceramic octal socket base
  ctx.fillStyle = '#291c12';
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1.2 * scale;
  ctx.beginPath();
  ctx.rect(cx - w * 0.62, baseY - 9 * scale, w * 1.24, 9 * scale);
  ctx.fill();
  ctx.stroke();

  // Brass collar ring
  ctx.fillStyle = '#b45309';
  ctx.fillRect(cx - w * 0.58, baseY - 12 * scale, w * 1.16, 3.5 * scale);

  // Warm ambient heater halo
  const halo = ctx.createRadialGradient(
    cx,
    baseY - h * 0.58,
    2 * scale,
    cx,
    baseY - h * 0.58,
    w * 1.7
  );
  halo.addColorStop(0, 'rgba(251, 191, 36, 0.36)');
  halo.addColorStop(0.55, 'rgba(217, 119, 6, 0.12)');
  halo.addColorStop(1, 'rgba(217, 119, 6, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, baseY - h * 0.58, w * 1.7, 0, TAU);
  ctx.fill();

  // Borosilicate glass envelope
  ctx.fillStyle = 'rgba(254, 243, 199, 0.08)';
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.42)';
  ctx.lineWidth = 1.15 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.5, baseY - 12 * scale);
  ctx.lineTo(cx - w * 0.5, baseY - h + w * 0.5);
  ctx.arc(cx, baseY - h + w * 0.5, w * 0.5, Math.PI, 0);
  ctx.lineTo(cx + w * 0.5, baseY - 12 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Silver getter flash at dome top
  ctx.fillStyle = 'rgba(120, 88, 62, 0.45)';
  ctx.beginPath();
  ctx.arc(cx, baseY - h + w * 0.48, w * 0.42, Math.PI * 1.1, Math.PI * 1.9);
  ctx.fill();

  // Internal anode plate & glowing tungsten filament
  ctx.fillStyle = '#3f2e21';
  ctx.fillRect(cx - w * 0.26, baseY - h * 0.78, w * 0.52, h * 0.44);

  const glow = 0.75 + (rng ? rng() * 0.25 : 0.15);
  ctx.fillStyle = `rgba(251, 191, 36, ${glow.toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(cx, baseY - h * 0.56, 2.4 * scale, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(cx, baseY - h * 0.56, 1.1 * scale, 0, TAU);
  ctx.fill();
}

function drawRotaryPotentiometer(ctx, cx, cy, r, angle) {
  // Recessed bakelite skirt
  ctx.fillStyle = '#120c07';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Radial calibration ticks (11 steps)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
  ctx.lineWidth = 1.0;
  for (let t = 0; t <= 10; t++) {
    const a = Math.PI * 0.75 + (t / 10) * Math.PI * 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r + 5.2), cy + Math.sin(a) * (r + 5.2));
    ctx.lineTo(cx + Math.cos(a) * (r + 8.2), cy + Math.sin(a) * (r + 8.2));
    ctx.stroke();
  }

  // Brushed brass knob cap
  const kg = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  kg.addColorStop(0, '#f59e0b');
  kg.addColorStop(0.5, '#b45309');
  kg.addColorStop(1, '#451a03');
  ctx.fillStyle = kg;
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Pointer needle
  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(angle) * (r - 1.5), cy + Math.sin(angle) * (r - 1.5));
  ctx.stroke();
}

function getBakedPerceptronLab(kit) {
  return kit.bake2D('s01_perceptron_lab_v1', (_g, ctx, rng, w, h) => {
    // 1. Warm Dark Bakelite & Brushed Brass Laboratory Cabinet Wall (Mirror-Seamless at x=0 & x=1000)
    const wallGrad = ctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
    wallGrad.addColorStop(0, '#120d08');
    wallGrad.addColorStop(0.35, '#1b130c');
    wallGrad.addColorStop(0.85, '#22170e');
    wallGrad.addColorStop(1, '#160f09');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // Fine horizontal brushed-chassis micro-grain (seamless across x=0 mirror boundary)
    for (let y = 4; y < ROAD_EDGE_Y; y += 3) {
      const alpha = 0.02 + rng() * 0.035;
      ctx.fillStyle = rng() > 0.45 ? `rgba(251, 191, 36, ${alpha.toFixed(3)})` : `rgba(0, 0, 0, ${(alpha * 2.2).toFixed(3)})`;
      ctx.fillRect(0, y, w, 1);
    }

    // Horizontal brass rack rails spanning full width [0..1000] so mirrored [-1000..0] connects continuously
    const railYs = [24, 328, 412, 656];
    for (const ry of railYs) {
      const rg = ctx.createLinearGradient(0, ry - 4, 0, ry + 5);
      rg.addColorStop(0, '#451a03');
      rg.addColorStop(0.45, '#d97706');
      rg.addColorStop(0.65, '#fbbf24');
      rg.addColorStop(1, '#291205');
      ctx.fillStyle = rg;
      ctx.fillRect(0, ry - 4, w, 9);

      // Brass hex rivets spaced symmetrically
      ctx.fillStyle = '#fef3c7';
      for (let rx = 25; rx < w; rx += 50) {
        ctx.beginPath();
        ctx.arc(rx, ry + 0.5, 1.5, 0, TAU);
        ctx.fill();
      }
    }

    // Vertical rack stiles placed symmetrically (x = 46, 316, 684, 954) so x=0 forms a clean recessed bay
    for (const sx of [46, 316, 684, 954]) {
      const sg = ctx.createLinearGradient(sx - 6, 0, sx + 6, 0);
      sg.addColorStop(0, '#271407');
      sg.addColorStop(0.5, '#92400e');
      sg.addColorStop(1, '#1c0e05');
      ctx.fillStyle = sg;
      ctx.fillRect(sx - 6, 28, 12, ROAD_EDGE_Y - 36);
    }

    // 2. Left & Right Symmetric Tape Transport & Vacuum-Tube Amplifier Bays
    for (const bayX of [58, 696]) {
      const bayW = 246;
      // Recessed dark steel bay housing
      ctx.fillStyle = '#130d08';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.6;
      ctx.fillRect(bayX, 40, bayW, 276);
      ctx.strokeRect(bayX, 40, bayW, 276);

      // Magnetic tape head transport bridge below reels (y = 205..245)
      ctx.fillStyle = '#1f160e';
      ctx.strokeStyle = '#b45309';
      ctx.fillRect(bayX + 18, 206, bayW - 36, 36);
      ctx.strokeRect(bayX + 18, 206, bayW - 36, 36);

      // Brass capstan & read/write flux head
      ctx.fillStyle = '#d97706';
      ctx.fillRect(bayX + bayW * 0.5 - 14, 211, 28, 24);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(bayX + 36, 224, 6, 0, TAU);
      ctx.arc(bayX + bayW - 36, 224, 6, 0, TAU);
      ctx.fill();

      // Row of 7 glowing glass vacuum tubes along bottom of bay (y = 308)
      for (let tIdx = 0; tIdx < 7; tIdx++) {
        const tx = bayX + 24 + tIdx * 33;
        drawVacuumTube(ctx, tx, 308, 0.88, rng);
      }
    }

    // 3. Central Iconic 20x20 CdS Photocell Sensor Retina Matrix (x = 334..666, y = 40..316)
    ctx.fillStyle = '#110b07';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.6;
    ctx.fillRect(334, 40, 332, 276);
    ctx.strokeRect(334, 40, 332, 276);

    // Inner brass retina bezel (244x244 centered at 500, 178)
    const gridX0 = 378;
    const gridY0 = 56;
    const cellStep = 12.2;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(gridX0 - 6, gridY0 - 6, 20 * cellStep + 12, 20 * cellStep + 12);

    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 20; c++) {
        const cx = gridX0 + c * cellStep + cellStep * 0.5;
        const cy = gridY0 + r * cellStep + cellStep * 0.5;
        ctx.fillStyle = '#1e140c';
        ctx.strokeStyle = 'rgba(217, 119, 6, 0.52)';
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.1, 0, TAU);
        ctx.fill();
        ctx.stroke();

        // Subtle CdS serpentine wafer trace
        ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
        ctx.fillRect(cx - 1.8, cy - 0.8, 3.6, 1.6);
      }
    }

    // Flanking columns of miniature bias trimmers inside central bay
    for (let k = 0; k < 6; k++) {
      const py = 68 + k * 42;
      drawRotaryPotentiometer(ctx, 354, py, 8.5, -1.8 + k * 0.65);
      drawRotaryPotentiometer(ctx, 646, py, 8.5, 1.8 - k * 0.65);
    }

    // 4. Mid-Rack Motorized Weight Potentiometer Bank & Patchbay Plugboard (y = 334..408)
    ctx.fillStyle = '#17100a';
    ctx.fillRect(0, 333, w, 75);

    // 14 Rotary Analog Weight Potentiometers across the rack
    for (let i = 0; i < 14; i++) {
      const kx = 66 + i * 66.8;
      const ky = 370;
      const ang = -Math.PI * 0.8 + rng() * Math.PI * 1.6;
      drawRotaryPotentiometer(ctx, kx, ky, 13.5, ang);
    }

    // 5. Lower Laboratory Scope & Patchbay Backdrop (y = 417..652)
    // Recessed warm phosphor-amber classification scope screen in center + flanking plugboards
    const leftPlugX = 56;
    const rightPlugX = 816;
    for (const px0 of [leftPlugX, rightPlugX]) {
      ctx.fillStyle = '#120c07';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1.5;
      ctx.fillRect(px0, 424, 128, 220);
      ctx.strokeRect(px0, 424, 128, 220);

      const sockets = [];
      for (let r = 0; r < 11; r++) {
        for (let c = 0; c < 6; c++) {
          const jx = px0 + 16 + c * 19.2;
          const jy = 440 + r * 18.8;
          sockets.push([jx, jy]);
          ctx.fillStyle = '#090604';
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.arc(jx, jy, 3.4, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Sweeping catenary cloth-braided patch cables
      const cableColors = ['#d97706', '#f59e0b', '#92400e', '#38bdf8', '#b45309', '#fbbf24'];
      for (let k = 0; k < 16; k++) {
        const a = sockets[Math.floor(rng() * sockets.length)];
        const b = sockets[Math.floor(rng() * sockets.length)];
        if (!a || !b || (a[0] === b[0] && a[1] === b[1])) continue;
        const sag = 18 + rng() * 34;
        const mx = (a[0] + b[0]) * 0.5 + (rng() - 0.5) * 14;
        const my = Math.max(a[1], b[1]) + sag;

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.lineWidth = 3.8;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1] + 2);
        ctx.quadraticCurveTo(mx, my + 3, b[0], b[1] + 2);
        ctx.stroke();

        ctx.strokeStyle = cableColors[k % cableColors.length];
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.quadraticCurveTo(mx, my, b[0], b[1]);
        ctx.stroke();

        // Brass banana plug tips
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(a[0], a[1], 2.4, 0, TAU);
        ctx.arc(b[0], b[1], 2.4, 0, TAU);
        ctx.fill();
      }
    }

    // Central Hyperplane Oscilloscope / Synaptic Projection Grid (x = 194..806, y = 424..652)
    const scopeGrad = ctx.createRadialGradient(500, 538, 24, 500, 538, 340);
    scopeGrad.addColorStop(0, '#271a0e');
    scopeGrad.addColorStop(0.7, '#171009');
    scopeGrad.addColorStop(1, '#0e0905');
    ctx.fillStyle = scopeGrad;
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.2;
    ctx.fillRect(194, 424, 612, 228);
    ctx.strokeRect(194, 424, 612, 228);

    // Warm amber graticule grid inside classification scope
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.14)';
    ctx.lineWidth = 0.9;
    for (let gx = 224; gx < 806; gx += 30) {
      ctx.beginPath();
      ctx.moveTo(gx, 424);
      ctx.lineTo(gx, 652);
      ctx.stroke();
    }
    for (let gy = 448; gy < 652; gy += 28) {
      ctx.beginPath();
      ctx.moveTo(194, gy);
      ctx.lineTo(806, gy);
      ctx.stroke();
    }
    // Center reticle axes
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.28)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(500, 424);
    ctx.lineTo(500, 652);
    ctx.moveTo(194, 538);
    ctx.lineTo(806, 538);
    ctx.stroke();

    // 6. Canonical y = 680 Road: Oiled Manila/Amber Punched Paper Tape Highway (Seamless [0..1000])
    const roadGrad = ctx.createLinearGradient(0, ROAD_EDGE_Y - 4, 0, ROAD_EDGE_Y + 26);
    roadGrad.addColorStop(0, '#fef08a');
    roadGrad.addColorStop(0.16, '#eab308');
    roadGrad.addColorStop(0.68, '#b45309');
    roadGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, ROAD_EDGE_Y - 2, w, 26);

    // Crisp top brass guide edge right at y = ROAD_EDGE_Y (680)
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, ROAD_EDGE_Y);
    ctx.lineTo(w, ROAD_EDGE_Y);
    ctx.stroke();

    // Continuous sprocket feed holes & 8-bit Baudot/ASCII punched tape code columns
    for (let tx = 6; tx < w; tx += 12.5) {
      // Center tractor-feed sprocket hole
      ctx.fillStyle = '#181009';
      ctx.beginPath();
      ctx.arc(tx, ROAD_EDGE_Y + 10.5, 1.7, 0, TAU);
      ctx.fill();

      // Binary data holes above & below sprocket track
      const code = Math.floor(rng() * 256);
      for (let bit = 0; bit < 5; bit++) {
        if ((code >> bit) & 1) {
          const hy = bit < 2 ? ROAD_EDGE_Y + 3.5 + bit * 3.1 : ROAD_EDGE_Y + 14.5 + (bit - 2) * 3.1;
          ctx.beginPath();
          ctx.arc(tx, hy, 1.45, 0, TAU);
          ctx.fill();
        }
      }
    }

    // 7. Sub-Floor (y = 704..1000): Electromechanical Stepping-Relay Vault & Copper Busbars
    const subGrad = ctx.createLinearGradient(0, ROAD_EDGE_Y + 24, 0, h);
    subGrad.addColorStop(0, '#140d08');
    subGrad.addColorStop(0.45, '#1b120b');
    subGrad.addColorStop(1, '#0b0704');
    ctx.fillStyle = subGrad;
    ctx.fillRect(0, ROAD_EDGE_Y + 24, w, h - (ROAD_EDGE_Y + 24));

    // Horizontal heavy copper power busbars (+28V DC, BIAS, GND) running full width [0..1000]
    for (const [by, col] of [
      [722, '#d97706'],
      [736, '#b45309'],
      [856, '#92400e'],
      [870, '#78350f'],
    ]) {
      ctx.fillStyle = col;
      ctx.fillRect(0, by, w, 5);
      ctx.fillStyle = 'rgba(254, 243, 199, 0.35)';
      ctx.fillRect(0, by, w, 1.2);
    }

    // Bank of 16 Copper-Wound Solenoid Stepping Relays (y = 752..844)
    for (let i = 0; i < 16; i++) {
      const rx = 31.25 + i * 62.5;
      // Steel U-frame bracket
      ctx.fillStyle = '#261a10';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.fillRect(rx - 20, 754, 40, 88);
      ctx.strokeRect(rx - 20, 754, 40, 88);

      // Wound enamel-copper electromagnet bobbin
      const cg = ctx.createLinearGradient(rx - 14, 766, rx + 14, 766);
      cg.addColorStop(0, '#7c2d12');
      cg.addColorStop(0.5, '#ea580c');
      cg.addColorStop(1, '#431407');
      ctx.fillStyle = cg;
      ctx.fillRect(rx - 14, 768, 28, 54);

      // Fine copper wire winding lines
      ctx.strokeStyle = 'rgba(253, 186, 116, 0.28)';
      ctx.lineWidth = 0.8;
      for (let wy = 771; wy < 820; wy += 3) {
        ctx.beginPath();
        ctx.moveTo(rx - 13, wy);
        ctx.lineTo(rx + 13, wy);
        ctx.stroke();
      }
    }

    // Lower Mercury-Arc / Filament Rectifier Core Chamber centered at x = 500, y = 932
    ctx.fillStyle = '#120b06';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.8;
    ctx.fillRect(360, 886, 280, 96);
    ctx.strokeRect(360, 886, 280, 96);

    // Flanking brass ventilation louvers (x = 40..330 and x = 670..960)
    for (const vx0 of [42, 672]) {
      ctx.fillStyle = '#0f0905';
      ctx.strokeStyle = '#78350f';
      ctx.fillRect(vx0, 888, 286, 92);
      ctx.strokeRect(vx0, 888, 286, 92);
      ctx.fillStyle = '#291a0e';
      for (let ly = 898; ly < 972; ly += 9) {
        ctx.fillRect(vx0 + 14, ly, 258, 4);
      }
    }
  });
}

function drawTapeReel(ctx, cx, cy, r, angle, tapeFillRatio = 0.65) {
  // Recessed tape well shadow
  ctx.fillStyle = '#090603';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, TAU);
  ctx.fill();

  // Dark oxide magnetic tape pack
  const packR = lerp(r * 0.34, r * 0.88, tapeFillRatio);
  ctx.fillStyle = '#2b190e';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(cx, cy, packR, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Spun aluminum / brushed brass 3-slot flange
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();

  for (let i = 0; i < 3; i++) {
    const a = (i * TAU) / 3;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = 'rgba(217, 119, 6, 0.34)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, 12);
    ctx.lineTo(6, 12);
    ctx.lineTo(13, r - 5);
    ctx.lineTo(-13, r - 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Precision NAB center hub
  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 10.5, 0, TAU);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#18120c';
  ctx.beginPath();
  ctx.arc(0, 0, 4.0, 0, TAU);
  ctx.fill();

  ctx.restore();
}

function drawPerceptronCyberRider(ctx, rig, localT, beatPulse = 0) {
  const s = rig.root.scale;

  // Warm vacuum-tube underglow on punched paper tape road
  const midX = (rig.rearWheel.x + rig.frontWheel.x) * 0.5;
  const gndY = rig.root.y;
  const rg = ctx.createRadialGradient(midX, gndY, 6 * s, midX, gndY, 130 * s);
  rg.addColorStop(0, `rgba(251, 191, 36, ${(0.34 + beatPulse * 0.18).toFixed(3)})`);
  rg.addColorStop(0.6, 'rgba(217, 119, 6, 0.12)');
  rg.addColorStop(1, 'rgba(217, 119, 6, 0)');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.ellipse(midX, gndY + 2 * s, 130 * s, 13 * s, 0, 0, TAU);
  ctx.fill();

  // Main Agent-01 + Cycle rendered in brushed copper, warm brass & glowing amber vacuum-tube visor
  drawRig2D(ctx, rig, {
    featherFill: '#e5a93c',
    featherShade: '#b45309',
    wingTipDark: '#291509',
    beakFill: '#fef08a',
    pouchFill: '#fbbf24',
    legFill: '#d97706',
    frameStroke: '#f59e0b',
    metalStroke: '#92400e',
    tireStroke: '#1c1209',
    inkOutline: '#120a04',
    glowColor: '#fbbf24',
    halo: false,
    scanBeam: true,
  });

  // Vintage Mark-I Glowing Vacuum Tube Cartridge mounted behind seat cluster
  ctx.save();
  const tx = rig.seatCluster.x - 14 * s;
  const ty = rig.seatCluster.y - 6 * s;
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  ctx.roundRect(tx - 6 * s, ty - 16 * s, 12 * s, 20 * s, 5 * s);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(tx, ty - 7 * s, (3.2 + beatPulse * 1.4) * s, 0, TAU);
  ctx.fill();

  // Electromechanical relay sparks flicking off rear wheel contact with punched tape
  const sparkCount = 4;
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.6 * s;
  for (let i = 0; i < sparkCount; i++) {
    const ph = (localT * 9.0 + i * 0.27) % 1;
    const sx0 = rig.rearWheel.x - 8 * s - ph * 28 * s;
    const sy0 = gndY - 2 * s - Math.sin(ph * Math.PI) * (6 + i * 3) * s;
    ctx.globalAlpha = (1 - ph) * (0.55 + beatPulse * 0.45);
    ctx.beginPath();
    ctx.moveTo(sx0, sy0);
    ctx.lineTo(sx0 - 6 * s, sy0 - 2 * s);
    ctx.stroke();
  }
  ctx.restore();
}

export function renderSaharaPelicanOnly(ctx, kit, x, pedalAngle = 0, speedScale = 1.0, localT = 0) {
  if (x <= -260 || x >= PANEL_SIZE + 260) return;
  const road = kit ? kit.sampleRoad(clamp(x, 0, PANEL_SIZE), 0) : { y: ROAD_EDGE_Y, slope: 0 };
  const rig = computePelicanRig({
    x,
    y: road.y,
    pedalAngle,
    scale: 1.0,
    slope: road.slope,
    speedScale,
    poseMode: 'normal',
    time: localT,
  });
  drawPerceptronCyberRider(ctx, rig, localT, 0.25);
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

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Static Baked Mark I Perceptron Laboratory Wall & Sub-Floor Relay Vault
  const bg = getBakedPerceptronLab(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Live Spinning IBM/Ampex Magnetic Tape Reels (Left & Right Rack Bays)
  const reelSpin = t * 2.8;
  const fillMod = 0.5 + 0.18 * Math.sin(localT * 0.9);
  for (const bayX of [58, 696]) {
    const lx = bayX + 66;
    const rxReel = bayX + 180;
    const ry = 122;

    // Live taut magnetic oxide tape path threading down to capstan bridge
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(lx - 26, ry + 18);
    ctx.lineTo(bayX + 36, 224);
    ctx.lineTo(bayX + 210, 224);
    ctx.lineTo(rxReel + 26, ry + 18);
    ctx.stroke();

    drawTapeReel(ctx, lx, ry, 46, reelSpin, fillMod);
    drawTapeReel(ctx, rxReel, ry, 46, -reelSpin * 1.12 + 0.7, 1.0 - fillMod * 0.55);
  }

  // 3. Live 20x20 CdS Photocell Sensor Excitation Pattern (sweeping Perceptron X/O stimulus)
  const gridX0 = 378;
  const gridY0 = 56;
  const cellStep = 12.2;
  const scanNorm = clamp(hidePelican ? 0.5 : rx / PANEL_SIZE, 0, 1);
  const stimAngle = -0.55 + scanNorm * 1.1 + Math.sin(t * 2.0) * 0.08;
  const nxS = Math.cos(stimAngle);
  const nyS = Math.sin(stimAngle);

  ctx.save();
  for (let r = 0; r < 20; r++) {
    const uY = (r - 9.5) / 9.5;
    for (let c = 0; c < 20; c++) {
      const uX = (c - 9.5) / 9.5;
      const ringDist = Math.abs(Math.hypot(uX, uY) - 0.66);
      const planeDist = Math.abs(uX * nxS + uY * nyS);
      const active = ringDist < 0.14 || planeDist < 0.09;
      if (!active) continue;

      const cx = gridX0 + c * cellStep + cellStep * 0.5;
      const cy = gridY0 + r * cellStep + cellStep * 0.5;
      const isPlane = planeDist < 0.09;
      ctx.fillStyle = isPlane
        ? `rgba(254, 240, 138, ${(0.72 + beatPulse * 0.26).toFixed(2)})`
        : `rgba(245, 158, 11, ${(0.52 + beatPulse * 0.25).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 3.3, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();

  // 4. Live Sweeping Linear Hyperplane (w·x + b = 0) & Sample Point Cloud (+ Gold / − Cyan)
  // As the rider progresses across x = 0..1000, the hyperplane converges from noisy initial tilt to exact separation!
  const converge = hidePelican ? 1.0 : smoothstep(40, 620, rx);
  const slopeTarget = -0.14;
  const slopeInit = 0.24 * Math.sin(localT * 1.7 + 0.6);
  const curSlope = lerp(slopeInit, slopeTarget, converge);
  const centerBiasY = lerp(562, 548, converge) + Math.sin(t * 3.0) * (1 - converge) * 10;

  const evalHyperplaneY = (px) => centerBiasY + (px - 500) * curSlope;

  ctx.save();
  ctx.beginPath();
  ctx.rect(196, 426, 608, 224);
  ctx.clip();

  // Half-space warm gold (+) vs cool cyan (−) subtle decision tint
  const xL = 196;
  const xR = 804;
  const yL = evalHyperplaneY(xL);
  const yR = evalHyperplaneY(xR);

  ctx.fillStyle = 'rgba(251, 191, 36, 0.06)';
  ctx.beginPath();
  ctx.moveTo(xL, 426);
  ctx.lineTo(xR, 426);
  ctx.lineTo(xR, yR);
  ctx.lineTo(xL, yL);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(56, 189, 248, 0.055)';
  ctx.beginPath();
  ctx.moveTo(xL, yL);
  ctx.lineTo(xR, yR);
  ctx.lineTo(xR, 650);
  ctx.lineTo(xL, 650);
  ctx.closePath();
  ctx.fill();

  // Margin support bands (w·x + b = ±1)
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.26)';
  ctx.lineWidth = 1.1;
  for (const off of [-26, 26]) {
    ctx.beginPath();
    ctx.moveTo(xL, yL + off);
    ctx.lineTo(xR, yR + off);
    ctx.stroke();
  }

  // Glowing Amber Linear Decision Hyperplane Beam: w·x + b = 0
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.28)';
  ctx.lineWidth = 9.0 + beatPulse * 4.0;
  ctx.beginPath();
  ctx.moveTo(xL, yL);
  ctx.lineTo(xR, yR);
  ctx.stroke();

  ctx.strokeStyle = PALETTE.filamentCream;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(xL, yL);
  ctx.lineTo(xR, yR);
  ctx.stroke();

  // Normal weight vector arrow `w` anchored near rider's X projection on the hyperplane
  const anchorX = clamp(hidePelican ? 500 : rx, 260, 740);
  const anchorY = evalHyperplaneY(anchorX);
  const normLen = Math.hypot(curSlope, -1);
  const wx = (curSlope / normLen) * 42;
  const wy = (-1 / normLen) * 42;
  ctx.strokeStyle = PALETTE.amberHot;
  ctx.fillStyle = PALETTE.amberHot;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(anchorX, anchorY);
  ctx.lineTo(anchorX + wx, anchorY + wy);
  ctx.stroke();
  const headAng = Math.atan2(wy, wx);
  ctx.beginPath();
  ctx.moveTo(anchorX + wx, anchorY + wy);
  ctx.lineTo(anchorX + wx - Math.cos(headAng - 0.45) * 9, anchorY + wy - Math.sin(headAng - 0.45) * 9);
  ctx.lineTo(anchorX + wx - Math.cos(headAng + 0.45) * 9, anchorY + wy - Math.sin(headAng + 0.45) * 9);
  ctx.closePath();
  ctx.fill();

  // Sample Point Cloud ('+' Gold vs '−' Vacuum Cyan)
  for (let i = 0; i < SAMPLE_POINTS.length; i++) {
    const pt = SAMPLE_POINTS[i];
    if (pt.x < 204 || pt.x > 796) continue;
    const predPos = pt.y < evalHyperplaneY(pt.x);
    const correct = (predPos && pt.cls > 0) || (!predPos && pt.cls < 0);
    const riderBoost = hidePelican ? 0.4 : Math.exp(-Math.pow((pt.x - rx) / 115, 2));
    const r = 4.5 + riderBoost * 2.6;

    // Synaptic activation trace when rider passes underneath
    if (riderBoost > 0.25) {
      ctx.strokeStyle = pt.cls > 0
        ? `rgba(251, 191, 36, ${(riderBoost * 0.36).toFixed(2)})`
        : `rgba(56, 189, 248, ${(riderBoost * 0.36).toFixed(2)})`;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(anchorX, anchorY);
      ctx.stroke();
    }

    if (pt.cls > 0) {
      ctx.strokeStyle = correct ? PALETTE.filamentCream : '#ef4444';
      ctx.fillStyle = `rgba(251, 191, 36, ${(0.22 + riderBoost * 0.35).toFixed(2)})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r + 2.5, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(pt.x - r, pt.y);
      ctx.lineTo(pt.x + r, pt.y);
      ctx.moveTo(pt.x, pt.y - r);
      ctx.lineTo(pt.x, pt.y + r);
      ctx.stroke();
    } else {
      ctx.strokeStyle = correct ? PALETTE.cyanNeg : '#ef4444';
      ctx.fillStyle = `rgba(56, 189, 248, ${(0.20 + riderBoost * 0.35).toFixed(2)})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r + 2.2, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pt.x - r * 0.85, pt.y);
      ctx.lineTo(pt.x + r * 0.85, pt.y);
      ctx.stroke();
    }
  }

  // Only render crisp formula text on primary non-mirrored cabinet (!hidePelican or Outro thumbnail)
  if (!hidePelican || isOutroThumbnail) {
    ctx.font = '600 13px "JetBrains Mono", "SF Mono", monospace';
    ctx.fillStyle = 'rgba(254, 243, 199, 0.86)';
    ctx.textAlign = 'left';
    ctx.fillText('w · x + b = 0', 210, 446);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.82)';
    ctx.textAlign = 'right';
    ctx.fillText('sgn(Σ wᵢxᵢ + b)', 790, 638);
  }
  ctx.restore();

  // 5. Sub-Floor Stepping-Relay Contact Sparks on Beat
  const activeRelay = Math.floor((t * 8) % 16);
  for (let i = 0; i < 16; i++) {
    const rcx = 31.25 + i * 62.5;
    const isFiring = i === activeRelay || (beatPulse > 0.35 && i % 4 === Math.floor(t * 2) % 4);
    const armY = isFiring ? 762 : 759;
    ctx.strokeStyle = isFiring ? PALETTE.filamentCream : '#d97706';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(rcx - 14, 759);
    ctx.lineTo(rcx + 14, armY);
    ctx.stroke();

    if (isFiring) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(rcx + 12, armY, 3.2 + beatPulse * 2.5, 0, TAU);
      ctx.fill();
    }
  }

  // 6. Copper/Brass Hardware-Relay Cyber-Rider on Punched Paper Tape Road (y = 680)
  if (!hidePelican && rx > -260 && rx < PANEL_SIZE + 260) {
    const road = kit.sampleRoad(clamp(rx, 0, PANEL_SIZE), 0);
    const rig = computePelicanRig({
      x: rx,
      y: road.y,
      pedalAngle,
      scale: 1.0,
      slope: road.slope,
      speedScale,
      poseMode: 'normal',
      time: localT,
    });
    drawPerceptronCyberRider(ctx, rig, localT, beatPulse);
  }

  // 7. Outro 7x3 Exhibition Wall Thumbnail Caption
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(18, 12, 8, 0.82)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 4);
    ctx.fillStyle = '#fef3c7';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene?.num ?? 1).padStart(2, '0')} ${scene?.zh ?? '感知机与神经元'}`, 36, PANEL_SIZE - 46);
  }

  ctx.restore();
}
