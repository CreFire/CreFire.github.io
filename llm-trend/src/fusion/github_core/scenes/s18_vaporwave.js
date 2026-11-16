// src/fusion/github_core/scenes/s18_vaporwave.js
// Scene 18 · 交互式物理世界模型 (2026+ · Generative Interactive World Models)
// Synth-magenta, electric-cyan & ultraviolet 3D spatial simulation stage:
// - Real-time perspective 3D gravity-well floor grid (y = 680..1000) warping dynamically underneath `pelicanLocalX`
// - Scanning procedural world-generation wave ahead of the rider materializing latent point-clouds into
//   ray-traced glass spheres, rigid-body polyhedra with impulse vectors, and shimmering fluid caustics!

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
import { makePRNG, hashSeed } from '../kit/kit.js';

const PAL = {
  voidBg: '#160726',
  uvDeep: '#230b3d',
  uvHorizon: '#3b1066',
  magenta: '#e879f9',
  magentaHot: '#f0abfc',
  cyan: '#22d3ee',
  indigo: '#818cf8',
  white: '#fae8ff',
};

const WORLD_OBJECTS = [
  { kind: 'poly', x: 158, y: 332, r: 44, label: 'RIGID-OCTA · m=2.4kg', phase: 0.3 },
  { kind: 'sphere', x: 325, y: 248, r: 58, label: 'IOR=1.52 · DIELECTRIC', phase: 1.1 },
  { kind: 'poly', x: 495, y: 348, r: 48, label: 'COLLIDER · e=0.94', phase: 2.0 },
  { kind: 'sphere', x: 668, y: 236, r: 64, label: 'RAY-TRACED CAUSTIC', phase: 2.8 },
  { kind: 'poly', x: 842, y: 322, r: 46, label: 'SE(3) INERTIA TENSOR', phase: 3.7 },
];

function rot3D(x, y, z, ax, ay) {
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const y2 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;
  return { x: x1, y: y2, z: z2 };
}

function getWorldModelStageBackdrop(kit) {
  return kit.bake2D(
    's18_world_model_stage_v1',
    (_g, ctx, rng, w, h) => {
      // 1. Synth-Magenta, Ultraviolet & Electric-Cyan Spatial Sky Dome
      const skyG = ctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
      skyG.addColorStop(0.0, PAL.voidBg);
      skyG.addColorStop(0.52, PAL.uvDeep);
      skyG.addColorStop(0.86, PAL.uvHorizon);
      skyG.addColorStop(1.0, '#581c87');
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, w, ROAD_EDGE_Y);

      // Radiant Neural-Field Horizon Sun / Latent Core Sphere behind horizon
      const sunG = ctx.createRadialGradient(500, 560, 24, 500, 560, 380);
      sunG.addColorStop(0.0, 'rgba(232, 121, 249, 0.42)');
      sunG.addColorStop(0.42, 'rgba(129, 140, 248, 0.22)');
      sunG.addColorStop(0.75, 'rgba(34, 211, 238, 0.08)');
      sunG.addColorStop(1.0, 'rgba(22, 7, 38, 0)');
      ctx.fillStyle = sunG;
      ctx.fillRect(0, 120, w, ROAD_EDGE_Y - 120);

      // 3D Celestial Spatial Simulation Cage Lines above y = 680
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, ROAD_EDGE_Y);
      ctx.clip();

      ctx.strokeStyle = 'rgba(129, 140, 248, 0.12)';
      ctx.lineWidth = 1.0;
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(500 + i * 32, 48);
        ctx.lineTo(500 + i * 145, ROAD_EDGE_Y);
        ctx.stroke();
      }
      for (const ry of [120, 210, 315, 430, 555]) {
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.lineTo(w, ry);
        ctx.stroke();
      }

      // Distant Procedural Wireframe Terrain Peaks along Horizon (`y = 545..680`)
      const drawWireRidge = (seedOff, baseH, amp, strokeCol, fillCol) => {
        const pts = [];
        for (let x = 0; x <= w; x += 40) {
          const ridge =
            Math.abs(Math.sin(x * 0.007 + seedOff)) * amp +
            Math.abs(Math.cos(x * 0.019 - seedOff * 1.7)) * (amp * 0.42);
          // Taper near panel edges so adjacent edges stay clean
          const edgeEnv = 0.35 + 0.65 * Math.sin((Math.PI * x) / w);
          pts.push({ x, y: ROAD_EDGE_Y - (baseH + ridge * edgeEnv) });
        }
        ctx.fillStyle = fillCol;
        ctx.beginPath();
        ctx.moveTo(0, ROAD_EDGE_Y);
        for (const p of pts) ctx.lineTo(p.x, p.y);
        ctx.lineTo(w, ROAD_EDGE_Y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
          else ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      };

      drawWireRidge(0.8, 18, 92, 'rgba(129, 140, 248, 0.32)', 'rgba(26, 9, 48, 0.72)');
      drawWireRidge(2.4, 8, 56, 'rgba(232, 121, 249, 0.38)', 'rgba(19, 6, 36, 0.85)');

      // Latent Voxel Star-Sparks in Ultraviolet Dome
      for (let i = 0; i < 80; i++) {
        const sx = rng() * w;
        const sy = 56 + rng() * 440;
        ctx.fillStyle =
          i % 3 === 0
            ? 'rgba(232, 121, 249, 0.48)'
            : i % 2 === 0
              ? 'rgba(34, 211, 238, 0.46)'
              : 'rgba(129, 140, 248, 0.42)';
        ctx.fillRect(sx, sy, 2.2, 2.2);
      }
      ctx.restore();

      // 2. Sub-Horizon Spacetime Abyss (`y = ROAD_EDGE_Y = 680` .. `1000`)
      const floorG = ctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
      floorG.addColorStop(0.0, '#1e0936');
      floorG.addColorStop(0.35, '#120522');
      floorG.addColorStop(1.0, '#090212');
      ctx.fillStyle = floorG;
      ctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);
    },
    PANEL_SIZE,
    PANEL_SIZE
  );
}

/**
 * Evaluates real-time spacetime / physics gravity-well vertical displacement `Δy(x, depthU)`
 * right underneath `riderX`! Strictly 0 at `x = 0` and `x = 1000` when `depthU = 0` so road
 * edges at `(0, 680)` and `(1000, 680)` always lock cleanly!
 */
function evalGravityWellDy(x, depthU, riderX, localT, hasRider) {
  if (!hasRider) return 0;
  const edgePin = Math.sin((Math.PI * clamp(x / PANEL_SIZE, 0, 1)));
  const dx = x - riderX;
  const sigma = 112 + depthU * 95;
  const gaussX = Math.exp(-(dx * dx) / (2 * sigma * sigma));
  const depthBell = Math.sin(Math.PI * clamp(depthU * 0.92 + 0.08, 0, 1));
  const ripple = Math.cos(Math.hypot(dx * 0.048, depthU * 9.0) - localT * 9.5) * 5.5 * gaussX;
  const well = (34 * gaussX * depthBell + ripple * depthU) * (depthU < 0.02 ? edgePin : 1.0);
  return Math.max(-6, well);
}

/**
 * Draws the Dynamic Perspective 3D Gravity-Well Floor Grid (`y = 680..1000`)!
 */
function drawGravityWellFloorGrid(ctx, riderX, localT, hasRider) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, ROAD_EDGE_Y - 2, PANEL_SIZE, PANEL_SIZE - ROAD_EDGE_Y + 2);
  ctx.clip();

  // Concentric glow pool at the bottom of the gravity well beneath the rider
  if (hasRider && riderX > -160 && riderX < PANEL_SIZE + 160) {
    const wellG = ctx.createRadialGradient(
      riderX,
      ROAD_EDGE_Y + 46,
      8,
      riderX,
      ROAD_EDGE_Y + 52,
      195
    );
    wellG.addColorStop(0.0, 'rgba(34, 211, 238, 0.36)');
    wellG.addColorStop(0.45, 'rgba(232, 121, 249, 0.24)');
    wellG.addColorStop(1.0, 'rgba(22, 7, 38, 0)');
    ctx.fillStyle = wellG;
    ctx.fillRect(riderX - 210, ROAD_EDGE_Y, 420, 180);
  }

  // 1. Longitudinal perspective lines fanning out from horizon (`y = 680`) to `y = 1000`
  const numCols = 22;
  for (let c = -4; c <= numCols + 4; c++) {
    const uCol = c / numCols;
    const xTop = uCol * PANEL_SIZE;
    const xBot = 500 + (xTop - 500) * 2.35;
    const nearWell = hasRider ? Math.exp(-Math.pow((xTop - riderX) / 140, 2)) : 0;

    ctx.strokeStyle =
      nearWell > 0.25
        ? `rgba(34, 211, 238, ${(0.34 + nearWell * 0.55).toFixed(2)})`
        : 'rgba(232, 121, 249, 0.26)';
    ctx.lineWidth = nearWell > 0.25 ? 1.7 : 1.05;

    ctx.beginPath();
    const steps = 14;
    for (let s = 0; s <= steps; s++) {
      const du = s / steps;
      const depthCurve = du * du;
      const px = lerp(xTop, xBot, depthCurve);
      const basePy = ROAD_EDGE_Y + depthCurve * (PANEL_SIZE - ROAD_EDGE_Y);
      const dy = evalGravityWellDy(px, depthCurve, riderX, localT, hasRider);
      if (s === 0) ctx.moveTo(px, basePy + dy * 0.35);
      else ctx.lineTo(px, basePy + dy);
    }
    ctx.stroke();
  }

  // 2. Transverse horizontal grid lines warping downward into the live gravity well!
  const numRows = 11;
  for (let r = 0; r <= numRows; r++) {
    const uRow = Math.pow(r / numRows, 1.55);
    const baseY = ROAD_EDGE_Y + uRow * (PANEL_SIZE - ROAD_EDGE_Y);
    ctx.strokeStyle =
      r === 0
        ? PAL.cyan
        : r % 2 === 0
          ? 'rgba(34, 211, 238, 0.38)'
          : 'rgba(129, 140, 248, 0.30)';
    ctx.lineWidth = r === 0 ? 2.4 : 1.15;

    ctx.beginPath();
    const xSteps = 44;
    for (let k = 0; k <= xSteps; k++) {
      const px = (k / xSteps) * PANEL_SIZE;
      const dy = evalGravityWellDy(px, uRow, riderX, localT, hasRider);
      const py = baseY + (r === 0 ? dy * 0.28 : dy);
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  ctx.restore();

  // Continuous Canonical Road Reference Rim at y = ROAD_EDGE_Y (`680`) pinned cleanly at x=0 & x=1000!
  ctx.save();
  const rimG = ctx.createLinearGradient(0, ROAD_EDGE_Y, PANEL_SIZE, ROAD_EDGE_Y);
  rimG.addColorStop(0.0, PAL.magenta);
  rimG.addColorStop(0.5, PAL.cyan);
  rimG.addColorStop(1.0, PAL.magenta);
  ctx.strokeStyle = rimG;
  ctx.shadowColor = PAL.cyan;
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, ROAD_EDGE_Y);
  ctx.lineTo(PANEL_SIZE, ROAD_EDGE_Y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws the undulating 3D Fluid Caustics Wave Ribbon materializing behind `scanFrontX`!
 */
function drawFluidCausticsWave(ctx, localT, scanFrontX, isOutroThumbnail) {
  ctx.save();
  const yBase = 485;
  const xStart = 70;
  const xEnd = 930;
  const segs = 54;

  // Fluid surface caustic mesh strips (3 layered interference ribbons)
  for (let layer = 0; layer < 3; layer++) {
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const px = lerp(xStart, xEnd, u);
      const mat = isOutroThumbnail ? 1.0 : smoothstep(px + 90, px - 40, scanFrontX);
      if (mat < 0.02) continue;

      const py =
        yBase +
        layer * 14 +
        Math.sin(u * Math.PI * 6 - localT * 4.2 + layer * 1.1) * 16 * mat +
        Math.cos(u * Math.PI * 11 + localT * 3.1) * 6 * mat;

      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.strokeStyle =
      layer === 0
        ? 'rgba(34, 211, 238, 0.52)'
        : layer === 1
          ? 'rgba(232, 121, 249, 0.44)'
          : 'rgba(129, 140, 248, 0.36)';
    ctx.lineWidth = layer === 0 ? 2.4 : 1.5;
    ctx.stroke();
  }

  // Shimmering caustic cross-nodes & floor caustic spots
  for (let i = 2; i < segs; i += 3) {
    const u = i / segs;
    const px = lerp(xStart, xEnd, u);
    const mat = isOutroThumbnail ? 1.0 : smoothstep(px + 70, px - 30, scanFrontX);
    if (mat < 0.15) continue;

    const py = yBase + Math.sin(u * Math.PI * 6 - localT * 4.2) * 16 * mat;
    ctx.fillStyle = `rgba(250, 232, 255, ${(0.55 * mat).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(px, py, 2.2 * mat, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGlassSphereAndPolyhedra(ctx, localT, scanFrontX, isOutroThumbnail) {
  for (let idx = 0; idx < WORLD_OBJECTS.length; idx++) {
    const obj = WORLD_OBJECTS[idx];
    const bob = Math.sin(localT * 2.6 + obj.phase) * 11;
    const cx = obj.x;
    const cy = obj.y + bob;
    const r = obj.r;

    // `mat = 0`: un-materialized latent point-cloud ahead of scan wave;
    // `mat = 1`: fully materialized ray-traced glass sphere or shaded rigid-body polyhedron!
    const mat = isOutroThumbnail ? 1.0 : smoothstep(cx + 105, cx - 45, scanFrontX);

    // 1. Latent Wireframe / Point-Cloud Proxy (visible when mat < 0.98)
    if (mat < 0.98) {
      const wireA = (1 - mat) * 0.85;
      ctx.save();
      ctx.globalAlpha = wireA;
      ctx.strokeStyle = PAL.indigo;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
      ctx.setLineDash([]);

      // Sparse 3D Gaussian / latent splat points
      for (let p = 0; p < 16; p++) {
        const a = (p / 16) * Math.PI * 2 + localT * 1.4;
        const rad = r * (0.35 + 0.55 * ((p * 7) % 5) / 4);
        ctx.fillStyle = p % 2 === 0 ? PAL.cyan : PAL.magenta;
        ctx.fillRect(cx + Math.cos(a) * rad - 1.5, cy + Math.sin(a) * rad - 1.5, 3, 3);
      }
      ctx.restore();
    }

    // 2. Materialized 3D Ray-Traced Glass Sphere or Rigid-Body Polyhedron
    if (mat > 0.03) {
      ctx.save();
      ctx.globalAlpha = mat;

      if (obj.kind === 'sphere') {
        // Focused refractive caustic ellipse projected onto the simulation floor below!
        const caustG = ctx.createRadialGradient(cx + 12, ROAD_EDGE_Y - 6, 2, cx + 12, ROAD_EDGE_Y - 6, r * 0.85);
        caustG.addColorStop(0.0, 'rgba(34, 211, 238, 0.42)');
        caustG.addColorStop(0.5, 'rgba(232, 121, 249, 0.18)');
        caustG.addColorStop(1.0, 'rgba(22, 7, 38, 0)');
        ctx.fillStyle = caustG;
        ctx.beginPath();
        ctx.ellipse(cx + 12, ROAD_EDGE_Y - 6, r * 0.85, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ray-traced dielectric glass sphere body with inverted internal horizon refraction!
        const sphG = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.34, r * 0.08, cx, cy, r);
        sphG.addColorStop(0.0, 'rgba(255, 255, 255, 0.92)');
        sphG.addColorStop(0.22, 'rgba(34, 211, 238, 0.52)');
        sphG.addColorStop(0.56, 'rgba(29, 10, 56, 0.72)');
        sphG.addColorStop(0.84, 'rgba(232, 121, 249, 0.68)');
        sphG.addColorStop(1.0, 'rgba(34, 211, 238, 0.92)');
        ctx.fillStyle = sphG;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Internal refracted grid arc inside glass sphere
        ctx.strokeStyle = 'rgba(250, 232, 255, 0.48)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.12, r * 0.82, r * 0.26, -0.14, 0, Math.PI);
        ctx.stroke();

        // Fresnel neon rim + crisp specular highlight + secondary exit-caustic glint
        ctx.strokeStyle = PAL.cyan;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.36, cy - r * 0.38, r * 0.18, r * 0.09, -0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(232, 121, 249, 0.85)';
        ctx.beginPath();
        ctx.arc(cx + r * 0.42, cy + r * 0.44, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Rotating 3D Rigid-Body Octahedron with faceted lighting & physics impulse vector!
        const ax = localT * 1.15 + obj.phase;
        const ay = localT * 1.45 + obj.phase * 0.7;
        const rawVerts = [
          [0, -r, 0],
          [0, r, 0],
          [-r, 0, 0],
          [0, 0, r],
          [r, 0, 0],
          [0, 0, -r],
        ];
        const v3 = rawVerts.map(([vx, vy, vz]) => rot3D(vx, vy, vz, ax, ay));
        const faces = [
          [0, 2, 3],
          [0, 3, 4],
          [0, 4, 5],
          [0, 5, 2],
          [1, 3, 2],
          [1, 4, 3],
          [1, 5, 4],
          [1, 2, 5],
        ];
        const sorted = faces
          .map((f, fi) => ({
            f,
            fi,
            z: (v3[f[0]].z + v3[f[1]].z + v3[f[2]].z) / 3,
          }))
          .sort((a, b) => a.z - b.z);

        for (const { f, fi, z } of sorted) {
          const p0 = v3[f[0]];
          const p1 = v3[f[1]];
          const p2 = v3[f[2]];
          const shade = clamp(0.42 + (z / r) * 0.58, 0.2, 1.0);
          ctx.fillStyle =
            fi % 2 === 0
              ? `rgba(${Math.round(129 * shade)}, ${Math.round(140 * shade)}, 248, 0.78)`
              : `rgba(${Math.round(232 * shade)}, ${Math.round(121 * shade)}, 249, 0.74)`;
          ctx.strokeStyle = z > 0 ? PAL.cyan : PAL.magenta;
          ctx.lineWidth = z > 0 ? 1.6 : 0.9;
          ctx.beginPath();
          ctx.moveTo(cx + p0.x, cy + p0.y);
          ctx.lineTo(cx + p1.x, cy + p1.y);
          ctx.lineTo(cx + p2.x, cy + p2.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Rigid-body linear velocity vector arrow `v`
        const vxEnd = cx + r + 26;
        const vyEnd = cy - 16;
        ctx.strokeStyle = PAL.cyan;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(vxEnd, vyEnd);
        ctx.lineTo(vxEnd - 8, vyEnd - 2);
        ctx.moveTo(vxEnd, vyEnd);
        ctx.lineTo(vxEnd - 4, vyEnd + 7);
        ctx.stroke();
      }

      // Crisp World-Model Physics Tag beneath materialized object
      ctx.font = '600 10px "PelicanMono", monospace';
      ctx.fillStyle = PAL.white;
      ctx.textAlign = 'center';
      ctx.fillText(obj.label, cx, cy + r + 18);
      ctx.restore();
    }
  }
}

function drawScanWaveAndHUD(ctx, scene, scanFrontX, isOutroThumbnail) {
  // Scanning Procedural Wave Curtain ahead of the Cyber-Rider!
  if (!isOutroThumbnail && scanFrontX > -40 && scanFrontX < PANEL_SIZE + 80) {
    ctx.save();
    const curtainG = ctx.createLinearGradient(scanFrontX - 75, 0, scanFrontX + 25, 0);
    curtainG.addColorStop(0.0, 'rgba(34, 211, 238, 0)');
    curtainG.addColorStop(0.75, 'rgba(232, 121, 249, 0.18)');
    curtainG.addColorStop(0.95, 'rgba(34, 211, 238, 0.42)');
    curtainG.addColorStop(1.0, 'rgba(34, 211, 238, 0)');
    ctx.fillStyle = curtainG;
    ctx.fillRect(scanFrontX - 75, 46, 100, PANEL_SIZE - 46);

    ctx.strokeStyle = PAL.cyan;
    ctx.shadowColor = PAL.magenta;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(scanFrontX, 46);
    ctx.lineTo(scanFrontX, PANEL_SIZE);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(22, 7, 38, 0.88)';
    ctx.strokeStyle = PAL.cyan;
    ctx.lineWidth = 1.2;
    const tagX = clamp(scanFrontX - 74, 16, PANEL_SIZE - 164);
    ctx.beginPath();
    ctx.roundRect(tagX, 64, 148, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PAL.cyan;
    ctx.font = '700 10.5px "PelicanMono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▶ WORLD-GEN WAVE', tagX + 74, 76);
    ctx.restore();
  }

  // Top Simulation Stage Telemetry Bar
  ctx.fillStyle = 'rgba(16, 4, 30, 0.86)';
  ctx.fillRect(0, 0, PANEL_SIZE, 46);
  ctx.fillStyle = PAL.magenta;
  ctx.fillRect(0, 46, PANEL_SIZE, 1.5);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = '700 15px "PelicanMono", monospace';
  ctx.fillStyle = PAL.magentaHot;
  ctx.fillText(`18 · ${scene?.zh || '交互式物理世界模型'}`, 24, 23);

  ctx.font = '500 12px "PelicanMono", monospace';
  ctx.fillStyle = PAL.cyan;
  ctx.fillText('2026+ · INTERACTIVE 4D PHYSICS & RAY-TRACED WORLD', 316, 23);

  ctx.textAlign = 'right';
  ctx.fillStyle = PAL.indigo;
  ctx.fillText('GRAVITY WELL: LIVE · 60FPS', PANEL_SIZE - 24, 23);
}

export function render(kit, slot, scene, params) {
  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;

  const localT = params?.localT ?? 0;
  const time = params?.t ?? localT;
  const pelicanLocalX = params?.pelicanLocalX ?? 500;
  const pedalAngle = params?.pedalAngle ?? 0;
  const speedScale = params?.speedScale ?? 1;
  const hidePelican = Boolean(params?.hidePelican);
  const isOutroThumbnail = Boolean(params?.isOutroThumbnail);

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Ultraviolet & Synth-Magenta Spatial Simulation Stage
  const bg = getWorldModelStageBackdrop(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  const showRider = !hidePelican && pelicanLocalX >= -260 && pelicanLocalX <= 1260;
  const scanFrontX = isOutroThumbnail ? 940 : pelicanLocalX + 168;

  // 2. Dynamic Perspective 3D Gravity-Well Floor Grid (`y = 680..1000`) Warping Underneath Rider!
  drawGravityWellFloorGrid(ctx, pelicanLocalX, localT, showRider);

  // 3. Scanning Procedural Wave: Fluid Caustics + Ray-Traced Glass Spheres + Rigid-Body Polyhedra
  drawFluidCausticsWave(ctx, localT, scanFrontX, isOutroThumbnail);
  drawGlassSphereAndPolyhedra(ctx, localT, scanFrontX, isOutroThumbnail);

  // 4. Scan Curtain & Top World-Model HUD
  drawScanWaveAndHUD(ctx, scene, scanFrontX, isOutroThumbnail);

  // 5. Cyber-Rider + Synth-Magenta / Electric-Cyan Plasma Wake
  if (showRider) {
    // Dual synthwave light-ribbons trailing behind Tensor Light-Cycle wheels
    for (const [yOff, col] of [[-44, 'rgba(232, 121, 249, 0.78)'], [-16, 'rgba(34, 211, 238, 0.78)']]) {
      const trG = ctx.createLinearGradient(pelicanLocalX - 250, 0, pelicanLocalX - 40, 0);
      trG.addColorStop(0, 'rgba(22, 7, 38, 0)');
      trG.addColorStop(1, col);
      ctx.strokeStyle = trG;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(pelicanLocalX - 250, ROAD_EDGE_Y + yOff);
      ctx.lineTo(pelicanLocalX - 40, ROAD_EDGE_Y + yOff);
      ctx.stroke();
    }

    const rig = computePelicanRig({
      x: pelicanLocalX,
      y: ROAD_EDGE_Y,
      pedalAngle,
      scale: 1.0,
      slope: 0,
      speedScale,
      time,
    });

    drawRig2D(ctx, rig, {
      featherFill: PAL.white,
      featherShade: '#d8b4fe',
      wingTipDark: '#2e1065',
      beakFill: PAL.cyan,
      pouchFill: PAL.magenta,
      legFill: '#f3e8ff',
      frameStroke: PAL.cyan,
      metalStroke: PAL.indigo,
      tireStroke: '#120524',
      inkOutline: '#0d031a',
      glowColor: PAL.magenta,
      halo: true,
      scanBeam: true,
    });
  }

  // 6. Outro Museum Gallery Tile Strip
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(22, 7, 38, 0.88)';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 92);
    ctx.fillStyle = PAL.cyan;
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 4);
    ctx.fillStyle = PAL.white;
    ctx.font = '700 46px "PelicanSans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene?.num ?? 18).padStart(2, '0')} ${scene?.zh ?? '交互式物理世界模型'}`, 36, PANEL_SIZE - 44);
  }

  ctx.restore();
}
