// src/fusion/github_core/scenes/s15_oscilloscope.js
// 15 · 全双工实时情感交互 (2026 · Native Omni-Modal Realtime Voice)
// Visual Signature:
// - Deep phosphor-emerald & cyan acoustic resonance chamber (#04120d, #34d399, #22d3ee, #a7f3d0).
// - Precision CRT/OLED vector graticule grid + concentric full-duplex bidirectional voice-wave rings
//   (human warm-amber wave & AI emerald-cyan wave intertwining in zero-latency harmony).
// - Signature Lissajous Gag: Around `localT` in `[2.1, 3.5]` (when `!params?.isOutroThumbnail`),
//   smoothly ramps `lissajousMix` (`0 -> 0.85 -> 0`) in `computePelicanRig({ ..., lissajousMix, time: localT })`
//   and renders with glowing `wireframeColor: '#34d399', glow: '#22d3ee'` so the Cyber-Rider momentarily
//   morphs into a shimmering Lissajous harmonic voice-wave figure and snaps cleanly back on the beat!

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

const CHAMBER_CX = 500;
const CHAMBER_CY = 336;
const POLAR_R = 258;

/**
 * Computes the Lissajous morph envelope `0 -> 0.85 -> 0` across `localT` in `[2.1, 3.5]`.
 */
function computeLissajousMix(localT, isOutroThumbnail) {
  if (isOutroThumbnail) return 0;
  const rampIn = smootherstep(2.1, 2.48, localT);
  const rampOut = 1 - smootherstep(3.12, 3.5, localT);
  return 0.85 * clamp(rampIn * rampOut, 0, 1);
}

/**
 * Bakes the static 1000x1000 Deep Phosphor-Emerald & Cyan Acoustic Resonance Chamber + Vector Grid.
 */
function getChamberBackdrop(kit) {
  return kit.bake2D('s15_duplex_voice_chamber_bg_v1', (_g, bctx, rng, w, h) => {
    // 1. Deep Phosphor-Emerald & Obsidian-Cyan Chamber Base
    const bgG = bctx.createLinearGradient(0, 0, 0, h);
    bgG.addColorStop(0.0, '#020906');
    bgG.addColorStop(0.45, '#04120d');
    bgG.addColorStop(0.72, '#061c15');
    bgG.addColorStop(1.0, '#020806');
    bctx.fillStyle = bgG;
    bctx.fillRect(0, 0, w, h);

    // Radial phosphor resonance bloom around acoustic center
    const centerGlow = bctx.createRadialGradient(
      CHAMBER_CX,
      CHAMBER_CY,
      18,
      CHAMBER_CX,
      CHAMBER_CY,
      430
    );
    centerGlow.addColorStop(0.0, 'rgba(52, 211, 153, 0.14)');
    centerGlow.addColorStop(0.45, 'rgba(34, 211, 238, 0.08)');
    centerGlow.addColorStop(1.0, 'rgba(4, 18, 13, 0)');
    bctx.fillStyle = centerGlow;
    bctx.fillRect(0, 0, w, ROAD_EDGE_Y);

    // 2. Precision CRT / OLED Vector Graticule Grid
    const div = 75;
    const sub = div / 5;

    bctx.save();
    // Minor grid rulings
    bctx.strokeStyle = 'rgba(52, 211, 153, 0.045)';
    bctx.lineWidth = 1;
    bctx.beginPath();
    for (let x = 50; x < w; x += 25) {
      bctx.moveTo(x, 0);
      bctx.lineTo(x, ROAD_EDGE_Y);
    }
    for (let y = 36; y < ROAD_EDGE_Y; y += 25) {
      bctx.moveTo(0, y);
      bctx.lineTo(w, y);
    }
    bctx.stroke();

    // Major calibrated graticule divisions around (500, 336)
    bctx.strokeStyle = 'rgba(52, 211, 153, 0.11)';
    bctx.lineWidth = 1.1;
    bctx.beginPath();
    for (let k = -6; k <= 6; k++) {
      const gx = CHAMBER_CX + k * div;
      if (gx > 0 && gx < w) {
        bctx.moveTo(gx, 20);
        bctx.lineTo(gx, ROAD_EDGE_Y);
      }
    }
    for (let k = -4; k <= 4; k++) {
      const gy = CHAMBER_CY + k * div;
      if (gy > 20 && gy < ROAD_EDGE_Y) {
        bctx.moveTo(20, gy);
        bctx.lineTo(w - 20, gy);
      }
    }
    bctx.stroke();

    // Central calibrated crosshairs + vernier subdivisions
    bctx.strokeStyle = 'rgba(34, 211, 238, 0.24)';
    bctx.lineWidth = 1.4;
    bctx.beginPath();
    bctx.moveTo(24, CHAMBER_CY);
    bctx.lineTo(w - 24, CHAMBER_CY);
    bctx.moveTo(CHAMBER_CX, 24);
    bctx.lineTo(CHAMBER_CX, ROAD_EDGE_Y);
    for (let s = -30; s <= 30; s++) {
      const tick = s % 5 === 0 ? 7 : 3.5;
      const tx = CHAMBER_CX + s * sub;
      if (tx > 30 && tx < w - 30) {
        bctx.moveTo(tx, CHAMBER_CY - tick);
        bctx.lineTo(tx, CHAMBER_CY + tick);
      }
      const ty = CHAMBER_CY + s * sub;
      if (ty > 30 && ty < ROAD_EDGE_Y - 10) {
        bctx.moveTo(CHAMBER_CX - tick, ty);
        bctx.lineTo(CHAMBER_CX + tick, ty);
      }
    }
    bctx.stroke();

    // Outer polar degree calibration ring around acoustic chamber
    bctx.strokeStyle = 'rgba(52, 211, 153, 0.22)';
    bctx.lineWidth = 1.3;
    bctx.beginPath();
    bctx.arc(CHAMBER_CX, CHAMBER_CY, POLAR_R, 0, Math.PI * 2);
    bctx.stroke();

    bctx.beginPath();
    for (let deg = 0; deg < 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const r0 = POLAR_R + 2;
      const r1 = deg % 30 === 0 ? POLAR_R + 13 : deg % 10 === 0 ? POLAR_R + 8 : POLAR_R + 5;
      bctx.moveTo(CHAMBER_CX + Math.cos(rad) * r0, CHAMBER_CY + Math.sin(rad) * r0);
      bctx.lineTo(CHAMBER_CX + Math.cos(rad) * r1, CHAMBER_CY + Math.sin(rad) * r1);
    }
    bctx.stroke();
    bctx.restore();

    // Subtle OLED telemetry legend in top corners
    bctx.save();
    bctx.font = '600 11.5px "SF Mono", "Menlo", monospace';
    bctx.fillStyle = 'rgba(167, 243, 208, 0.72)';
    bctx.fillText('OMNI-MODAL REALTIME VOICE // FULL-DUPLEX 0-LATENCY', 34, 40);
    bctx.fillStyle = 'rgba(251, 191, 36, 0.80)';
    bctx.fillText('● HUMAN STREAM [WARM-AMBER]', 34, 60);
    bctx.fillStyle = 'rgba(34, 211, 238, 0.85)';
    bctx.fillText('● AI RESONANCE [EMERALD-CYAN]', 268, 60);
    bctx.restore();

    // 3. Precision Acoustic Waveguide Floor (y = 680..1000)
    const floorG = bctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
    floorG.addColorStop(0.0, '#072219');
    floorG.addColorStop(0.18, '#04130e');
    floorG.addColorStop(1.0, '#020806');
    bctx.fillStyle = floorG;
    bctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

    // Perspective OLED vector guide lines below y = 680
    bctx.save();
    bctx.beginPath();
    bctx.rect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);
    bctx.clip();
    bctx.strokeStyle = 'rgba(52, 211, 153, 0.12)';
    bctx.lineWidth = 1;
    for (let k = -10; k <= 10; k++) {
      bctx.beginPath();
      bctx.moveTo(CHAMBER_CX + k * 46, ROAD_EDGE_Y);
      bctx.lineTo(CHAMBER_CX + k * 140, h);
      bctx.stroke();
    }
    for (let r = 1; r <= 6; r++) {
      const ry = ROAD_EDGE_Y + Math.pow(r / 6, 1.55) * (h - ROAD_EDGE_Y - 14);
      bctx.beginPath();
      bctx.moveTo(0, ry);
      bctx.lineTo(w, ry);
      bctx.stroke();
    }
    bctx.restore();

    // Calibrated vernier ticks & luminous emerald-cyan carrier line at y = 680
    bctx.strokeStyle = 'rgba(167, 243, 208, 0.35)';
    bctx.lineWidth = 1.1;
    bctx.beginPath();
    for (let x = 10; x < w; x += 20) {
      bctx.moveTo(x, ROAD_EDGE_Y - 4);
      bctx.lineTo(x, ROAD_EDGE_Y + 4);
    }
    bctx.stroke();

    bctx.strokeStyle = '#34d399';
    bctx.lineWidth = 3.2;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y);
    bctx.lineTo(w, ROAD_EDGE_Y);
    bctx.stroke();

    bctx.strokeStyle = '#a7f3d0';
    bctx.lineWidth = 1.0;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y - 1);
    bctx.lineTo(w, ROAD_EDGE_Y - 1);
    bctx.stroke();
  }, PANEL_SIZE, PANEL_SIZE);
}

/**
 * Draws concentric full-duplex bidirectional voice-wave rings & intertwining waveforms
 * (Human warm-amber wave + AI emerald-cyan wave in zero-latency harmony).
 */
function drawFullDuplexVoiceWaves(ctx, localT, t, lissajousMix) {
  const beatFrac = (localT / BEAT_SEC) - Math.floor(localT / BEAT_SEC);
  const beatEnv = 1 + 0.25 * Math.exp(-beatFrac * 4.5);
  const ampBoost = (1 + lissajousMix * 0.55) * beatEnv;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Concentric Full-Duplex Polar Voice-Wave Rings around (500, 336)
  const rings = [
    { baseR: 102, freqA: 5, freqB: 8, amp: 12 },
    { baseR: 168, freqA: 7, freqB: 11, amp: 15 },
    { baseR: 230, freqA: 9, freqB: 14, amp: 11 },
  ];

  const steps = 128;
  for (let rIdx = 0; rIdx < rings.length; rIdx++) {
    const rg = rings[rIdx];

    // Channel A: Human Warm-Amber Voice Ring
    ctx.strokeStyle = rIdx === 1 ? 'rgba(251, 191, 36, 0.82)' : 'rgba(245, 158, 11, 0.52)';
    ctx.lineWidth = rIdx === 1 ? 2.4 : 1.6;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const mod =
        (Math.sin(a * rg.freqA + t * 5.2) * 0.65 +
          Math.cos(a * rg.freqB - t * 3.4) * 0.35) *
        rg.amp *
        ampBoost;
      const rad = rg.baseR + mod;
      const px = CHAMBER_CX + Math.cos(a) * rad;
      const py = CHAMBER_CY + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // Channel B: AI Emerald-Cyan Voice Ring (intertwining in zero-latency phase harmony!)
    ctx.strokeStyle = rIdx === 1 ? 'rgba(34, 211, 238, 0.88)' : 'rgba(52, 211, 153, 0.62)';
    ctx.lineWidth = rIdx === 1 ? 2.6 : 1.7;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const mod =
        (Math.sin(a * rg.freqA - t * 5.2 + Math.PI * 0.5) * 0.65 +
          Math.sin(a * rg.freqB + t * 3.8) * 0.35) *
        rg.amp *
        ampBoost;
      const rad = rg.baseR + mod;
      const px = CHAMBER_CX + Math.cos(a) * rad;
      const py = CHAMBER_CY + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // 2. Horizontal Full-Duplex Intertwining Acoustic Waveform across Chamber Midline
  const waveSteps = 120;
  // Human Warm-Amber speech formant wave
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.72)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i <= waveSteps; i++) {
    const u = i / waveSteps;
    const x = lerp(40, PANEL_SIZE - 40, u);
    const windowEnv = Math.sin(u * Math.PI);
    const y =
      CHAMBER_CY +
      (Math.sin(u * 22 - t * 8.5) * 26 + Math.sin(u * 43 + t * 5.2) * 12) *
        windowEnv *
        ampBoost;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // AI Emerald-Cyan realtime counter-harmonic wave
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  for (let i = 0; i <= waveSteps; i++) {
    const u = i / waveSteps;
    const x = lerp(40, PANEL_SIZE - 40, u);
    const windowEnv = Math.sin(u * Math.PI);
    const y =
      CHAMBER_CY +
      (Math.cos(u * 22 - t * 8.5 + 0.4) * 28 + Math.sin(u * 37 - t * 6.4) * 13) *
        windowEnv *
        ampBoost;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Central Resonance Core Orb at (500, 336)
  const coreR = 16 + 8 * lissajousMix + 4 * (beatEnv - 1);
  const cg = ctx.createRadialGradient(CHAMBER_CX, CHAMBER_CY, 2, CHAMBER_CX, CHAMBER_CY, coreR * 2.6);
  cg.addColorStop(0, '#ffffff');
  cg.addColorStop(0.35, 'rgba(52, 211, 153, 0.65)');
  cg.addColorStop(0.7, 'rgba(251, 191, 36, 0.25)');
  cg.addColorStop(1, 'rgba(4, 18, 13, 0)');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(CHAMBER_CX, CHAMBER_CY, coreR * 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws shimmering continuous 3:4 Lissajous harmonic voice-wave loops around the morphing Cyber-Rider
 * during `localT` in `[2.1, 3.5]`, plus the crisp beat snap-back flash at `localT = 3.5s`!
 */
function drawLissajousHarmonicAura(ctx, cx, cy, lissajousMix, localT) {
  if (lissajousMix > 0.01) {
    const norm = clamp(lissajousMix / 0.85, 0, 1);
    ctx.save();

    // Ambient phosphor halation cloud behind Lissajous rider
    const hg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 165);
    hg.addColorStop(0, `rgba(34, 211, 238, ${(0.26 * norm).toFixed(3)})`);
    hg.addColorStop(0.55, `rgba(52, 211, 153, ${(0.14 * norm).toFixed(3)})`);
    hg.addColorStop(1, 'rgba(4, 18, 13, 0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(cx, cy, 165, 0, Math.PI * 2);
    ctx.fill();

    // Continuous 3:4 Lissajous carrier figure (matching computePelicanRig's 3:4 harmonic frequencies!)
    const segs = 132;
    for (const pass of [
      { col: 'rgba(251, 191, 36, 0.45)', w: 2.0, phaseShift: 0.42, scale: 0.94 },
      { col: 'rgba(34, 211, 238, 0.42)', w: 5.2, phaseShift: 0.0, scale: 1.0 },
      { col: '#a7f3d0', w: 1.8, phaseShift: 0.0, scale: 1.0 },
    ]) {
      ctx.strokeStyle = pass.col;
      ctx.globalAlpha = norm;
      ctx.lineWidth = pass.w;
      ctx.beginPath();
      for (let i = 0; i <= segs; i++) {
        const s = (i / segs) * Math.PI * 2;
        const lx = cx + 114 * pass.scale * norm * Math.sin(3 * s + localT * 7.5 + pass.phaseShift);
        const ly = cy + 110 * pass.scale * norm * Math.sin(4 * s + localT * 5.0 + 0.9);
        if (i === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  // Crisp PLL Phase-Lock Ring when Cyber-Rider snaps cleanly back to solid form on Beat 7 (`localT = 3.5s`)
  if (localT >= 3.45 && localT <= 3.92) {
    const u = (localT - 3.45) / 0.47;
    const alpha = (1 - u) * 0.85;
    ctx.save();
    ctx.strokeStyle = `rgba(167, 243, 208, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 2.8 * (1 - u * 0.5);
    ctx.beginPath();
    ctx.arc(cx, cy, 36 + u * 145, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
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

  const lissajousMix = computeLissajousMix(localT, isOutroThumbnail);

  // 1. Static Baked Phosphor-Emerald & Cyan Acoustic Resonance Chamber + Vector Grid
  const bg = getChamberBackdrop(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Concentric Full-Duplex Bidirectional Voice-Wave Rings (Human Warm-Amber ⇄ AI Emerald-Cyan)
  drawFullDuplexVoiceWaves(ctx, localT, t, lissajousMix);

  // 3. Cyber-Rider Agent-01 + Signature Bar-2 Lissajous Voice-Wave Morph (`localT` in `[2.1, 3.5]`)
  if (!hidePelican && pelicanLocalX >= -260 && pelicanLocalX <= 1260) {
    const rig = computePelicanRig({
      x: pelicanLocalX,
      y: ROAD_EDGE_Y,
      pedalAngle,
      scale: 1.0,
      slope: 0,
      speedScale,
      lissajousMix,
      time: localT,
    });

    const wireWeight = smoothstep(0.02, 0.26, lissajousMix);
    const morphCenterY = ROAD_EDGE_Y - 115;

    // Continuous Lissajous harmonic voice-wave envelope + beat snap-back flare
    if (!isOutroThumbnail) {
      drawLissajousHarmonicAura(ctx, pelicanLocalX, morphCenterY, lissajousMix, localT);
    }

    // Phosphor P1/OLED persistence trail echoes during Lissajous harmonic morph
    if (wireWeight > 0.05) {
      for (const [dt, echoAlpha] of [
        [0.065, 0.18],
        [0.032, 0.32],
      ]) {
        const echoLocalT = Math.max(0, localT - dt);
        const echoRig = computePelicanRig({
          x: pelicanLocalX - dt * 155 * speedScale,
          y: ROAD_EDGE_Y,
          pedalAngle: pedalAngle - dt * Math.PI * 2,
          scale: 1.0,
          slope: 0,
          speedScale,
          lissajousMix: computeLissajousMix(echoLocalT, false),
          time: echoLocalT,
        });
        ctx.save();
        ctx.globalAlpha = echoAlpha * wireWeight;
        drawRig2D(ctx, echoRig, {
          wireframeColor: '#22d3ee',
          lineScale: 0.95,
        });
        ctx.restore();
      }
    }

    // Solid Cyber-Form Pass (100% opaque outside [2.1, 3.5], smoothly crossfading during morph)
    if (wireWeight < 0.99) {
      ctx.save();
      ctx.globalAlpha = 1 - wireWeight;
      drawRig2D(ctx, rig, {
        featherFill: '#ecfdf5',
        featherShade: '#6ee7b7',
        wingTipDark: '#064e3b',
        beakFill: '#22d3ee',
        pouchFill: '#34d399',
        legFill: '#a7f3d0',
        frameStroke: '#34d399',
        metalStroke: '#64748b',
        tireStroke: '#04120d',
        inkOutline: '#020906',
        glowColor: '#22d3ee',
      });
      ctx.restore();
    }

    // Glowing Lissajous Harmonic Vector-Wireframe Pass (`wireframeColor: '#34d399', glow: '#22d3ee'`)
    if (wireWeight > 0.01) {
      ctx.save();
      ctx.globalAlpha = wireWeight;
      drawRig2D(ctx, rig, {
        wireframeColor: '#34d399',
        glow: '#22d3ee',
        lineScale: 1.18,
      });
      ctx.restore();
    }
  }

  // 4. Outro Gallery Thumbnail Label
  if (isOutroThumbnail && scene) {
    ctx.fillStyle = 'rgba(4, 18, 13, 0.86)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 96);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 96);
    ctx.stroke();
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '700 46px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
