// src/fusion/github_core/scenes/s09_bada.js
// 09 · 百万长上下文记忆海 (2024 · Million-Token Context · Needle in a Haystack)
// Visual Direction:
// - Minimalist high-contrast composition: vast serene midnight-cyan negative space above (#06111a),
//   and rolling translucent strata of 1,000,000-Token Context Waves near y = 540..980 (#0ea5e9, #38bdf8).
// - Hidden at (640, 610) amid thousands of cool blue token shards is a single blazing Golden Needle (#fbbf24).
// - As Agent-01 (`scanBeam: true`) approaches x = 450..680, its visor scan cone locks onto the Golden Needle
//   with a crisp `100% RECALL` concentric target ping.

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

const NEEDLE_X = 640;
const NEEDLE_Y = 610;

const PAL = {
  voidDeep: '#040c13',
  voidSky: '#06111a',
  voidHorizon: '#081b29',
  seaDeep: '#082f49',
  seaMid: '#0c4a6e',
  cyanCore: '#0ea5e9',
  cyanBright: '#38bdf8',
  cyanIce: '#e0f2fe',
  gold: '#fbbf24',
  goldBright: '#fef08a',
  goldDeep: '#d97706',
};

const DRIFTING_SHARDS = (() => {
  const rng = makePRNG(hashSeed('s09_drifting_shards_v1'));
  const list = [];
  for (let i = 0; i < 48; i++) {
    list.push({
      baseX: rng() * PANEL_SIZE,
      baseY: 554 + rng() * 380,
      len: 8 + rng() * 16,
      speed: 14 + rng() * 26,
      phase: rng() * Math.PI * 2,
      bright: rng() > 0.65,
    });
  }
  return list;
})();

function waveHeight(layerIdx, x, phaseShift = 0) {
  const u = x / PANEL_SIZE;
  const baseYs = [556, 582, 612, 646, 688, 748, 832];
  const amps = [16, 19, 17, 14, 15, 22, 26];
  const freqs = [2.0, 2.5, 3.0, 2.2, 2.8, 1.8, 1.5];
  const by = baseYs[layerIdx];
  const amp = amps[layerIdx];
  const f = freqs[layerIdx];
  return (
    by +
    Math.sin(u * Math.PI * 2 * f + layerIdx * 1.15 + phaseShift) * amp +
    Math.cos(u * Math.PI * 2 * (f * 1.7) - layerIdx * 0.8 + phaseShift * 0.7) * (amp * 0.38)
  );
}

function getBakedContextSea(kit) {
  return kit.bake2D('s09_million_context_sea_v1', (_g, bctx, rng, w, h) => {
    // 1. Vast Serene Midnight-Cyan Negative Space (y = 0..560)
    const skyG = bctx.createLinearGradient(0, 0, 0, 580);
    skyG.addColorStop(0.0, PAL.voidDeep);
    skyG.addColorStop(0.58, PAL.voidSky);
    skyG.addColorStop(1.0, PAL.voidHorizon);
    bctx.fillStyle = skyG;
    bctx.fillRect(0, 0, w, h);

    // Subtle deep-sea horizon glow rising gently from y = 580
    const horG = bctx.createLinearGradient(0, 420, 0, 680);
    horG.addColorStop(0.0, 'rgba(14, 165, 233, 0)');
    horG.addColorStop(0.75, 'rgba(14, 165, 233, 0.09)');
    horG.addColorStop(1.0, 'rgba(56, 189, 248, 0.18)');
    bctx.fillStyle = horG;
    bctx.fillRect(0, 420, w, 260);

    // Ultra-clean minimalist 1,000,000-Token Context Scale high in the serene upper space
    bctx.save();
    const rulerY = 62;
    bctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    bctx.lineWidth = 1;
    bctx.beginPath();
    bctx.moveTo(60, rulerY);
    bctx.lineTo(940, rulerY);
    bctx.stroke();

    bctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
    bctx.textBaseline = 'bottom';
    const marks = [
      [60, '0K'],
      [280, '250K'],
      [500, '500K'],
      [720, '750K'],
      [940, '1,000,000 TOKENS'],
    ];
    for (let m = 0; m <= 40; m++) {
      const mx = lerp(60, 940, m / 40);
      const major = m % 10 === 0;
      bctx.strokeStyle = major ? 'rgba(56, 189, 248, 0.36)' : 'rgba(56, 189, 248, 0.14)';
      bctx.beginPath();
      bctx.moveTo(mx, rulerY - (major ? 6 : 3));
      bctx.lineTo(mx, rulerY + (major ? 6 : 3));
      bctx.stroke();
    }
    bctx.fillStyle = 'rgba(125, 211, 252, 0.42)';
    for (const [mx, label] of marks) {
      bctx.textAlign = mx > 800 ? 'right' : mx < 100 ? 'left' : 'center';
      bctx.fillText(label, mx, rulerY - 10);
    }
    bctx.restore();

    // 2. Rolling Translucent Strata of 1,000,000-Token Context Waves (y = 540..1000)
    const layerSpecs = [
      { fill: 'rgba(12, 74, 110, 0.36)', stroke: 'rgba(14, 165, 233, 0.32)' },
      { fill: 'rgba(3, 105, 161, 0.30)', stroke: 'rgba(56, 189, 248, 0.36)' },
      { fill: 'rgba(2, 132, 199, 0.26)', stroke: 'rgba(56, 189, 248, 0.44)' },
      { fill: 'rgba(14, 165, 233, 0.22)', stroke: 'rgba(125, 211, 252, 0.48)' },
      { fill: 'rgba(8, 47, 73, 0.72)', stroke: 'rgba(56, 189, 248, 0.42)' },
      { fill: 'rgba(6, 28, 46, 0.82)', stroke: 'rgba(14, 165, 233, 0.35)' },
      { fill: 'rgba(4, 15, 26, 0.92)', stroke: 'rgba(14, 165, 233, 0.28)' },
    ];

    for (let li = 0; li < layerSpecs.length; li++) {
      const spec = layerSpecs[li];
      bctx.beginPath();
      for (let x = 0; x <= w; x += 10) {
        const wy = waveHeight(li, x, 0);
        if (x === 0) bctx.moveTo(x, wy);
        else bctx.lineTo(x, wy);
      }
      bctx.lineTo(w, h);
      bctx.lineTo(0, h);
      bctx.closePath();
      bctx.fillStyle = spec.fill;
      bctx.fill();

      bctx.beginPath();
      for (let x = 0; x <= w; x += 10) {
        const wy = waveHeight(li, x, 0);
        if (x === 0) bctx.moveTo(x, wy);
        else bctx.lineTo(x, wy);
      }
      bctx.strokeStyle = spec.stroke;
      bctx.lineWidth = 1.5;
      bctx.stroke();
    }

    // 3. Thousands of Cool Blue Token Shards (~2,100 haystack needles/tokens across y = 545..985)
    bctx.lineCap = 'round';
    for (let i = 0; i < 2100; i++) {
      const sx = rng() * w;
      const v = Math.pow(rng(), 0.88);
      const minWaveY = waveHeight(0, sx, 0) + 4;
      const sy = lerp(minWaveY, h - 12, v);

      // Leave a tiny 18px breathing pocket right around (640, 610) so the Golden Needle gleams crisply
      if (Math.hypot(sx - NEEDLE_X, sy - NEEDLE_Y) < 18) continue;

      // Align shard tangent with local wave slope
      const wyA = waveHeight(2, Math.max(0, sx - 8), 0);
      const wyB = waveHeight(2, Math.min(w, sx + 8), 0);
      const waveAngle = Math.atan2(wyB - wyA, 16) + (rng() - 0.5) * 0.28;
      const halfLen = 3.2 + rng() * 6.4;

      const dx = Math.cos(waveAngle) * halfLen;
      const dy = Math.sin(waveAngle) * halfLen;

      const cRoll = rng();
      const alpha = (0.18 + (1 - v) * 0.42) * (0.65 + rng() * 0.35);
      bctx.strokeStyle =
        cRoll < 0.55
          ? `rgba(14, 165, 233, ${alpha.toFixed(2)})`
          : cRoll < 0.88
          ? `rgba(56, 189, 248, ${alpha.toFixed(2)})`
          : `rgba(224, 242, 254, ${(alpha * 0.85).toFixed(2)})`;
      bctx.lineWidth = 1.0 + rng() * 1.1;
      bctx.beginPath();
      bctx.moveTo(sx - dx, sy - dy);
      bctx.lineTo(sx + dx, sy + dy);
      bctx.stroke();
    }

    // 4. Seamless Luminous Context Horizon Datum at y = 680 across [0..1000]
    bctx.strokeStyle = 'rgba(14, 165, 233, 0.38)';
    bctx.lineWidth = 6;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y + 1);
    bctx.lineTo(w, ROAD_EDGE_Y + 1);
    bctx.stroke();

    bctx.strokeStyle = PAL.cyanBright;
    bctx.lineWidth = 2.2;
    bctx.beginPath();
    bctx.moveTo(0, ROAD_EDGE_Y);
    bctx.lineTo(w, ROAD_EDGE_Y);
    bctx.stroke();
  }, PANEL_SIZE, PANEL_SIZE);
}

function drawDynamicContextWaves(ctx, t) {
  ctx.save();
  // Silky animated translucent cyan wave crests & drifting token shards
  for (let wIdx = 0; wIdx < 3; wIdx++) {
    const layer = wIdx + 1;
    const phase = t * (0.9 + wIdx * 0.32);
    ctx.strokeStyle =
      wIdx === 1 ? 'rgba(56, 189, 248, 0.42)' : 'rgba(14, 165, 233, 0.28)';
    ctx.lineWidth = wIdx === 1 ? 1.9 : 1.3;
    ctx.beginPath();
    for (let x = 0; x <= PANEL_SIZE; x += 12) {
      const wy = waveHeight(layer, x, phase);
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }

  ctx.lineCap = 'round';
  for (let i = 0; i < DRIFTING_SHARDS.length; i++) {
    const sh = DRIFTING_SHARDS[i];
    const sx = (sh.baseX + t * sh.speed) % PANEL_SIZE;
    const sy = sh.baseY + Math.sin(t * 2.0 + sh.phase) * 5;
    if (Math.hypot(sx - NEEDLE_X, sy - NEEDLE_Y) < 24) continue;
    ctx.strokeStyle = sh.bright
      ? 'rgba(224, 242, 254, 0.62)'
      : 'rgba(56, 189, 248, 0.42)';
    ctx.lineWidth = sh.bright ? 1.8 : 1.3;
    ctx.beginPath();
    ctx.moveTo(sx - sh.len * 0.5, sy);
    ctx.lineTo(sx + sh.len * 0.5, sy);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGoldenNeedleAndRecallPing(ctx, t, lockStrength, rig) {
  ctx.save();

  // 1. Precision Visor Scan Cone Lock-On from Rider's Visor (`rig.beakTip`) to Golden Needle (640, 610)
  if (rig && lockStrength > 0.02) {
    const vx = rig.beakTip.x;
    const vy = rig.beakTip.y;

    const beamG = ctx.createLinearGradient(vx, vy, NEEDLE_X, NEEDLE_Y);
    beamG.addColorStop(0.0, `rgba(56, 189, 248, ${(0.48 * lockStrength).toFixed(2)})`);
    beamG.addColorStop(0.65, `rgba(56, 189, 248, ${(0.26 * lockStrength).toFixed(2)})`);
    beamG.addColorStop(1.0, `rgba(251, 191, 36, ${(0.52 * lockStrength).toFixed(2)})`);

    ctx.fillStyle = beamG;
    ctx.beginPath();
    ctx.moveTo(vx, vy - 3);
    ctx.lineTo(NEEDLE_X - 6, NEEDLE_Y - 24);
    ctx.lineTo(NEEDLE_X + 10, NEEDLE_Y + 22);
    ctx.lineTo(vx, vy + 4);
    ctx.closePath();
    ctx.fill();

    // Central attention lock laser ray
    ctx.strokeStyle = `rgba(254, 240, 138, ${(0.88 * lockStrength).toFixed(2)})`;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.lineTo(NEEDLE_X, NEEDLE_Y);
    ctx.stroke();
  }

  // 2. Ambient + Locked Golden Halo around the Hidden Needle at (640, 610)
  const baseShimmer = 0.55 + 0.25 * Math.sin(t * 4.5);
  const glowR = lerp(26, 62, lockStrength);
  const ng = ctx.createRadialGradient(NEEDLE_X, NEEDLE_Y, 1, NEEDLE_X, NEEDLE_Y, glowR);
  ng.addColorStop(0.0, 'rgba(254, 240, 138, 0.95)');
  ng.addColorStop(0.35, `rgba(251, 191, 36, ${(0.45 + 0.40 * lockStrength).toFixed(2)})`);
  ng.addColorStop(1.0, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.arc(NEEDLE_X, NEEDLE_Y, glowR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Sculpted Blazing Golden Needle at (640, 610)
  ctx.save();
  ctx.translate(NEEDLE_X, NEEDLE_Y);
  ctx.rotate(-0.42 + Math.sin(t * 2.4) * 0.04);
  const needleScale = lerp(0.95, 1.24, lockStrength);
  ctx.scale(needleScale, needleScale);

  // Tapered golden needle shaft + eye
  ctx.fillStyle = PAL.gold;
  ctx.strokeStyle = PAL.goldBright;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-22, 0); // Razor sharp needle tip pointing into the cyan current
  ctx.lineTo(14, -3.4);
  ctx.lineTo(22, 0);
  ctx.lineTo(14, 3.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  //Needle eye cutout
  ctx.fillStyle = PAL.voidSky;
  ctx.beginPath();
  ctx.ellipse(13, 0, 3.6, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cross star glint on needle tip
  if (baseShimmer + lockStrength > 0.6) {
    const glintLen = 8 + lockStrength * 10;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-8 - glintLen, 0);
    ctx.lineTo(-8 + glintLen, 0);
    ctx.moveTo(-8, -glintLen * 0.75);
    ctx.lineTo(-8, glintLen * 0.75);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Concentric `100% RECALL` Target Ping when Rider Approaches x = 450..680!
  if (lockStrength > 0.04) {
    // Two expanding sonar target ping rings
    for (let p = 0; p < 2; p++) {
      const pingU = (t * 1.4 + p * 0.5) % 1.0;
      const pRad = 16 + pingU * 66;
      const pAlpha = (1 - pingU) * lockStrength * 0.9;
      ctx.strokeStyle =
        p === 0
          ? `rgba(251, 191, 36, ${pAlpha.toFixed(2)})`
          : `rgba(56, 189, 248, ${(pAlpha * 0.85).toFixed(2)})`;
      ctx.lineWidth = 2.0 * (1 - pingU * 0.4);
      ctx.beginPath();
      ctx.arc(NEEDLE_X, NEEDLE_Y, pRad, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crisp inner target reticle circle + 4 snapping corner brackets
    const retR = lerp(38, 24, lockStrength);
    ctx.strokeStyle = `rgba(251, 191, 36, ${(0.92 * lockStrength).toFixed(2)})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(NEEDLE_X, NEEDLE_Y, retR, 0, Math.PI * 2);
    ctx.stroke();

    const brk = retR + 7;
    const arm = 8;
    ctx.strokeStyle = `rgba(224, 242, 254, ${(0.95 * lockStrength).toFixed(2)})`;
    ctx.lineWidth = 2.0;
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(NEEDLE_X + sx * brk, NEEDLE_Y + sy * (brk - arm));
      ctx.lineTo(NEEDLE_X + sx * brk, NEEDLE_Y + sy * brk);
      ctx.lineTo(NEEDLE_X + sx * (brk - arm), NEEDLE_Y + sy * brk);
      ctx.stroke();
    }

    // Vertical callout leader rising into serene negative space + `100% RECALL` badge
    const badgeY = 486;
    ctx.strokeStyle = `rgba(251, 191, 36, ${(0.78 * lockStrength).toFixed(2)})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(NEEDLE_X, NEEDLE_Y - retR - 4);
    ctx.lineTo(NEEDLE_X, badgeY + 18);
    ctx.stroke();

    ctx.save();
    ctx.globalAlpha = lockStrength;
    const bw = 152;
    const bh = 32;
    const bx = NEEDLE_X - bw * 0.5;
    const by = badgeY - bh * 0.5;

    ctx.fillStyle = 'rgba(4, 14, 23, 0.90)';
    ctx.strokeStyle = PAL.gold;
    ctx.lineWidth = 1.6;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    // Golden status dot + crisp `100% RECALL` readout
    ctx.fillStyle = PAL.gold;
    ctx.beginPath();
    ctx.arc(bx + 15, badgeY, 4.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PAL.goldBright;
    ctx.font = '700 13.5px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('100% RECALL', bx + 26, badgeY + 0.5);

    ctx.fillStyle = 'rgba(125, 211, 252, 0.78)';
    ctx.font = '600 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POS #640,000 / 1M TOKENS', NEEDLE_X, by - 9);
    ctx.restore();
  }

  ctx.restore();
}

export function render(kit, slot, scene, params) {
  const {
    t = 0,
    pelicanLocalX = 500,
    pedalAngle = 0,
    speedScale = 1.0,
    hidePelican = false,
    isOutroThumbnail = false,
    sync = null,
  } = params || {};

  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Static Baked Vast Midnight-Cyan Negative Space & 1,000,000-Token Context Sea
  const bg = getBakedContextSea(kit);
  if (bg && bg.canvas) {
    ctx.drawImage(bg.canvas, 0, 0);
  }

  const rx = pelicanLocalX;
  const beatPulse = clamp(sync?.pulse ?? (1 - ((t * 2) % 1)), 0, 1);

  // 2. Dynamic Rolling Wave Crests & Drifting Cool-Blue Token Shards
  drawDynamicContextWaves(ctx, t);

  // Compute Cyber-Rider rig
  const showRider = !hidePelican && rx >= -260 && rx <= 1260;
  const rig = showRider
    ? computePelicanRig({
        x: rx,
        y: ROAD_EDGE_Y,
        slope: 0,
        pedalAngle,
        speedScale: speedScale + beatPulse * 0.03,
        time: t,
      })
    : null;

  // Lock-on strength peaks across x = 450..680 (and forced active in Outro thumbnail for clarity)
  const evalX = isOutroThumbnail ? 530 : rx;
  const lockStrength =
    smootherstep(385, 455, evalX) * (1 - smootherstep(675, 765, evalX));

  // 3. Blazing Golden Needle at (640, 610) + Visor Lock-On Beam & `100% RECALL` Target Ping
  drawGoldenNeedleAndRecallPing(ctx, t, lockStrength, rig);

  // 4. Deep-Sea Context Cyber-Rider (`scanBeam: true`)
  if (showRider && rig) {
    // Crisp cyan wake skimming the y = 680 context wave horizon
    const wx0 = clamp(rx - 190, 0, PANEL_SIZE);
    const wx1 = clamp(rx + 25, 0, PANEL_SIZE);
    if (wx1 > wx0) {
      const wg = ctx.createLinearGradient(wx0, 0, wx1, 0);
      wg.addColorStop(0.0, 'rgba(14, 165, 233, 0)');
      wg.addColorStop(0.7, 'rgba(56, 189, 248, 0.72)');
      wg.addColorStop(1.0, lockStrength > 0.4 ? PAL.gold : PAL.cyanIce);
      ctx.strokeStyle = wg;
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(wx0, ROAD_EDGE_Y);
      ctx.lineTo(wx1, ROAD_EDGE_Y);
      ctx.stroke();
    }

    drawRig2D(ctx, rig, {
      featherFill: '#e0f2fe',
      featherShade: '#7dd3fc',
      wingTipDark: '#082f49',
      beakFill: '#38bdf8',
      pouchFill: '#fbbf24',
      legFill: '#bae6fd',
      frameStroke: '#0ea5e9',
      metalStroke: '#38bdf8',
      tireStroke: '#051926',
      inkOutline: '#030d14',
      glowColor: lockStrength > 0.35 ? '#fbbf24' : '#38bdf8',
      halo: lockStrength > 0.45,
      scanBeam: true,
    });
  }

  // 5. Optional Outro Thumbnail Title Bar
  if (isOutroThumbnail && scene) {
    ctx.fillStyle = 'rgba(4, 12, 19, 0.85)';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 92);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 92);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 92);
    ctx.stroke();
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '700 42px system-ui, -apple-system, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} · ${scene.zh}`, 34, PANEL_SIZE - 46);
  }

  ctx.restore();
}
