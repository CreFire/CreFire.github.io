// src/fusion/github_core/scenes/s17_chat.js
// Scene 17 · AI4Science 科学新范式 (2026+ · AlphaFold, Crystal Lattices & Fusion)
// Deep sapphire-cyan scientific discovery dome with three live 3D procedural holograms:
// Left: 3D-shaded Protein Alpha-Helix & Beta-Sheet Folding Ribbon;
// Center: Glowing Tokamak Magnetic Confinement Plasma Torus;
// Right: Rotating Perovskite / Superconductor 3D Crystal Lattice.

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
  abyss: '#061420',
  domeMid: '#0a2336',
  domeGlow: '#0e3a53',
  cyan: '#22d3ee',
  cyanSoft: 'rgba(34, 211, 238, 0.25)',
  lime: '#a3e635',
  pink: '#f472b6',
  violet: '#c084fc',
  amber: '#fbbf24',
  white: '#f8fafc',
};

const STATIONS = [
  { x: 195, cy: 318, code: 'BIO-FOLD', title: 'AlphaFold · Native 3D', metric: 'pLDDT 96.4', col: PAL.lime },
  { x: 500, cy: 282, code: 'TOKAMAK-RL', title: 'Magnetic Plasma Control', metric: 'Q = 14.2 · 1.5e8 K', col: PAL.pink },
  { x: 805, cy: 318, code: 'CRYSTAL-GNN', title: 'Perovskite Superlattice', metric: 'DFT ΔE -0.42 eV', col: PAL.amber },
];

function rotY(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

function rotX(p, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

function proj3D(p, cx, cy, fov = 380) {
  const sc = fov / Math.max(120, fov - p.z);
  return { x: cx + p.x * sc, y: cy + p.y * sc, z: p.z, sc };
}

function getScienceDomeBackdrop(kit) {
  return kit.bake2D(
    's17_ai4science_dome_v1',
    (_g, ctx, rng, w, h) => {
      // 1. Deep Sapphire-Cyan Scientific Observatory Dome
      const domeG = ctx.createRadialGradient(500, 260, 40, 500, 380, 680);
      domeG.addColorStop(0.0, PAL.domeGlow);
      domeG.addColorStop(0.48, PAL.domeMid);
      domeG.addColorStop(1.0, PAL.abyss);
      ctx.fillStyle = domeG;
      ctx.fillRect(0, 0, w, h);

      // Geodesic dome structural arches & spherical latitude/longitude hairlines
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, ROAD_EDGE_Y);
      ctx.clip();

      ctx.strokeStyle = 'rgba(34, 211, 238, 0.11)';
      ctx.lineWidth = 1.1;
      for (const rad of [210, 330, 450, 570]) {
        ctx.beginPath();
        ctx.arc(500, 660, rad, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = -5; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(500 + i * 28, 52);
        ctx.quadraticCurveTo(500 + i * 115, 340, 500 + i * 175, ROAD_EDGE_Y);
        ctx.stroke();
      }

      // Fine coordinate grid & quantum/physics equations etched on upper glass panels
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.06)';
      ctx.lineWidth = 0.8;
      for (let gy = 90; gy < ROAD_EDGE_Y; gy += 60) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      // Ambient deep-lab dust & photon points
      for (let i = 0; i < 95; i++) {
        const px = rng() * w;
        const py = 56 + rng() * (ROAD_EDGE_Y - 90);
        const r = 0.7 + rng() * 1.4;
        ctx.fillStyle =
          i % 4 === 0
            ? 'rgba(163, 230, 53, 0.35)'
            : i % 3 === 0
              ? 'rgba(244, 114, 182, 0.32)'
              : 'rgba(34, 211, 238, 0.36)';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = '500 10.5px "PelicanMono", monospace';
      ctx.fillStyle = 'rgba(148, 216, 236, 0.30)';
      ctx.textAlign = 'left';
      ctx.fillText('SE(3)-EQUIVARIANT EVOFORMER · ΔG_fold < -14.8 kcal/mol', 36, 82);
      ctx.textAlign = 'center';
      ctx.fillText('∇ × B = μ₀ J  ·  J × B = ∇p  ·  TOROIDAL EQUILIBRIUM', 500, 82);
      ctx.textAlign = 'right';
      ctx.fillText('KOHN-SHAM DFT · E[ρ] = T_s[ρ] + ∫v_ext ρ dr + E_xc[ρ]', w - 36, 82);

      // 2. Three Holographic Cryo-Projector Pedestals & Upward Volumetric Light Cones
      for (const st of STATIONS) {
        const coneG = ctx.createLinearGradient(st.x, ROAD_EDGE_Y - 22, st.x, st.cy - 120);
        if (st.col === PAL.lime) {
          coneG.addColorStop(0, 'rgba(163, 230, 53, 0.18)');
          coneG.addColorStop(0.55, 'rgba(34, 211, 238, 0.06)');
        } else if (st.col === PAL.pink) {
          coneG.addColorStop(0, 'rgba(244, 114, 182, 0.20)');
          coneG.addColorStop(0.55, 'rgba(34, 211, 238, 0.07)');
        } else {
          coneG.addColorStop(0, 'rgba(251, 191, 36, 0.18)');
          coneG.addColorStop(0.55, 'rgba(34, 211, 238, 0.06)');
        }
        coneG.addColorStop(1, 'rgba(6, 20, 32, 0)');

        ctx.fillStyle = coneG;
        ctx.beginPath();
        ctx.moveTo(st.x - 54, ROAD_EDGE_Y - 14);
        ctx.lineTo(st.x - 135, st.cy - 125);
        ctx.lineTo(st.x + 135, st.cy - 125);
        ctx.lineTo(st.x + 54, ROAD_EDGE_Y - 14);
        ctx.closePath();
        ctx.fill();

        // Hologram emitter ring base right above road plane (`y = 656..676`, clear of road track)
        ctx.fillStyle = '#091f30';
        ctx.strokeStyle = st.col;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(st.x, ROAD_EDGE_Y - 12, 58, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();

      // 3. Superconducting Maglev Cryo-Causeway (`y = ROAD_EDGE_Y = 680` .. `1000`)
      const floorG = ctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
      floorG.addColorStop(0.0, '#092234');
      floorG.addColorStop(0.28, '#061724');
      floorG.addColorStop(1.0, '#030b13');
      ctx.fillStyle = floorG;
      ctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

      // Perspective laboratory floor reflection lines
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.09)';
      ctx.lineWidth = 1;
      for (let i = -7; i <= 7; i++) {
        ctx.beginPath();
        ctx.moveTo(500 + i * 72, ROAD_EDGE_Y);
        ctx.lineTo(500 + i * 165, h);
        ctx.stroke();
      }
      for (const ry of [716, 764, 826, 902]) {
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.lineTo(w, ry);
        ctx.stroke();
      }

      // Superconducting Cryo-Magnets & Liquid-Helium Bus below y = 680
      for (let mx = 28; mx < w; mx += 64) {
        ctx.fillStyle = 'rgba(14, 116, 144, 0.34)';
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.42)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(mx, ROAD_EDGE_Y + 12, 44, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = mx % 128 === 28 ? PAL.cyan : PAL.lime;
        ctx.fillRect(mx + 8, ROAD_EDGE_Y + 18, 28, 3);
      }

      // Exact y = 680 Superconducting Horizon Track across x = 0..1000
      ctx.save();
      ctx.strokeStyle = PAL.cyan;
      ctx.shadowColor = PAL.cyan;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(0, ROAD_EDGE_Y);
      ctx.lineTo(w, ROAD_EDGE_Y);
      ctx.stroke();

      ctx.strokeStyle = PAL.lime;
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(0, ROAD_EDGE_Y + 3.5);
      ctx.lineTo(w, ROAD_EDGE_Y + 3.5);
      ctx.stroke();
      ctx.restore();
    },
    PANEL_SIZE,
    PANEL_SIZE
  );
}

/**
 * Left Visualization (`cx = 195, cy = 318`):
 * 3D-Shaded Protein Alpha-Helix & Beta-Sheet Folding Ribbon twisting into native conformation!
 */
function drawProteinFoldingRibbon(ctx, cx, cy, localT, isOutroThumbnail) {
  const fold = isOutroThumbnail ? 1.0 : 0.46 + 0.54 * smootherstep(0.0, 3.6, localT);
  const spinY = localT * 0.68 + 0.35;
  const spinX = 0.28 + Math.sin(localT * 0.9) * 0.08;
  const N = 78;

  const spine = [];
  const edgeA = [];
  const edgeB = [];

  for (let i = 0; i <= N; i++) {
    const u = i / N;
    let x = 0;
    let y = 0;
    let z = 0;
    let halfW = 8.5;
    let kind = 'coil'; // 'helix1' | 'sheet' | 'helix2'

    if (u < 0.38) {
      // Alpha-Helix 1: Tight right-handed 3D spiral barrel
      kind = 'helix1';
      const s = u / 0.38;
      const th = s * Math.PI * 6.5;
      const r = lerp(34, 24, fold);
      x = -42 * fold + Math.cos(th) * r;
      y = lerp(-86, 68, s) * lerp(1.18, 0.86, fold);
      z = Math.sin(th) * r;
      halfW = 9.5;
    } else if (u < 0.68) {
      // Antiparallel Beta-Sheet Pleated Strands (2 strands + hairpin)
      kind = 'sheet';
      const s = (u - 0.38) / 0.30;
      const pleat = Math.sin(s * Math.PI * 10) * 5.5 * fold;
      const hairpin = s < 0.5 ? s * 2 : (1 - s) * 2;
      const strandOff = s < 0.5 ? -13 : 13;
      x = lerp(-10, 14, fold) + strandOff * fold;
      y = lerp(66, -64, hairpin);
      z = pleat + (s < 0.5 ? 10 : -10);
      halfW = s > 0.86 ? (1 - (s - 0.86) / 0.14) * 16 + 2 : 10.5; // Beta-strand arrowhead!
    } else {
      // Alpha-Helix 2: Angled C-terminal spiral locking tertiary pocket
      kind = 'helix2';
      const s = (u - 0.68) / 0.32;
      const th = s * Math.PI * 5.5 + 1.1;
      const r = lerp(32, 22, fold);
      x = 46 * fold + Math.cos(th) * r * 0.92;
      y = lerp(-52, 72, s) * lerp(1.15, 0.88, fold);
      z = Math.sin(th) * r;
      halfW = 9.0;
    }

    let p = rotX(rotY({ x, y, z }, spinY), spinX);
    // Compute local binormal offset for 3D ribbon width
    const twistA = u * Math.PI * 8 * fold + spinY;
    const bx = Math.cos(twistA) * halfW;
    const bz = Math.sin(twistA) * halfW;
    const pa = proj3D({ x: p.x + bx * 0.45, y: p.y - halfW * 0.65, z: p.z + bz }, cx, cy);
    const pb = proj3D({ x: p.x - bx * 0.45, y: p.y + halfW * 0.65, z: p.z - bz }, cx, cy);
    const pc = proj3D(p, cx, cy);

    spine.push({ ...pc, kind, u });
    edgeA.push(pa);
    edgeB.push(pb);
  }

  // Hydrogen-bond / disulfide cross-links locking tertiary fold
  ctx.save();
  ctx.strokeStyle = `rgba(251, 191, 36, ${(0.25 + 0.45 * fold).toFixed(2)})`;
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1.3;
  for (const [i0, i1] of [[8, 62], [18, 56], [34, 46], [24, 70]]) {
    ctx.beginPath();
    ctx.moveTo(spine[i0].x, spine[i0].y);
    ctx.lineTo(spine[i1].x, spine[i1].y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Depth-sort 3D ribbon quads back-to-front
  const quads = [];
  for (let i = 0; i < N; i++) {
    const zAvg = (spine[i].z + spine[i + 1].z) * 0.5;
    quads.push({ i, zAvg });
  }
  quads.sort((a, b) => a.zAvg - b.zAvg);

  for (const { i } of quads) {
    const a0 = edgeA[i];
    const a1 = edgeA[i + 1];
    const b1 = edgeB[i + 1];
    const b0 = edgeB[i];
    const s = spine[i];

    // Normal/depth shading in AlphaFold high-confidence cyan-lime-gold palette
    const light = clamp(0.55 + (s.z / 70) * 0.45, 0.25, 1.0);
    let fillCol;
    let rimCol;
    if (s.kind === 'helix1') {
      fillCol = `rgba(${Math.round(34 * light)}, ${Math.round(211 * light)}, ${Math.round(238 * light)}, 0.94)`;
      rimCol = '#bae6fd';
    } else if (s.kind === 'sheet') {
      fillCol = `rgba(${Math.round(163 * light)}, ${Math.round(230 * light)}, ${Math.round(53 * light)}, 0.95)`;
      rimCol = '#ecfccb';
    } else {
      fillCol = `rgba(${Math.round(251 * light)}, ${Math.round(191 * light)}, ${Math.round(36 * light)}, 0.94)`;
      rimCol = '#fef08a';
    }

    ctx.fillStyle = fillCol;
    ctx.strokeStyle = rimCol;
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(a0.x, a0.y);
    ctx.lineTo(a1.x, a1.y);
    ctx.lineTo(b1.x, b1.y);
    ctx.lineTo(b0.x, b0.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Center Visualization (`cx = 500, cy = 282`):
 * Glowing Tokamak Magnetic Confinement Plasma Torus pulsing with violet-cyan fusion rings!
 */
function drawTokamakPlasmaTorus(ctx, cx, cy, localT) {
  const beatPulse = 0.5 + 0.5 * Math.cos((localT / BEAT_SEC) * Math.PI * 2);
  const R = 92;
  const rCoil = 40;
  const tiltX = 0.62;
  const rotAz = localT * 0.35;

  ctx.save();

  // Helper to draw a toroidal D-coil at azimuth phi
  const drawCoil = (phi, alpha) => {
    ctx.strokeStyle = `rgba(34, 211, 238, ${alpha.toFixed(2)})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const steps = 20;
    for (let k = 0; k <= steps; k++) {
      const th = (k / steps) * Math.PI * 2;
      // Tokamak D-shaped cross-section
      const rad = R + rCoil * Math.cos(th) - 6 * Math.sin(th) * Math.sin(th);
      const yLocal = rCoil * 1.18 * Math.sin(th);
      const p3 = rotX(
        { x: rad * Math.cos(phi), y: yLocal, z: rad * Math.sin(phi) },
        tiltX
      );
      const pt = proj3D(p3, cx, cy, 420);
      if (k === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.stroke();
  };

  // 1. Back-half magnetic confinement coils (`z < 0`)
  const numCoils = 12;
  const coilList = [];
  for (let c = 0; c < numCoils; c++) {
    const phi = rotAz + (c / numCoils) * Math.PI * 2;
    const center3 = rotX({ x: R * Math.cos(phi), y: 0, z: R * Math.sin(phi) }, tiltX);
    coilList.push({ phi, z: center3.z });
  }
  for (const c of coilList) {
    if (c.z < 0) drawCoil(c.phi, 0.34);
  }

  // 2. Central Solenoid Column
  const solTop = proj3D(rotX({ x: 0, y: -56, z: 0 }, tiltX), cx, cy, 420);
  const solBot = proj3D(rotX({ x: 0, y: 56, z: 0 }, tiltX), cx, cy, 420);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(solTop.x, solTop.y);
  ctx.lineTo(solBot.x, solBot.y);
  ctx.stroke();
  ctx.strokeStyle = PAL.cyan;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 3. Glowing Violet-Magenta-Cyan Helical Fusion Plasma Rings (`q = 2.5` twisted magnetic flux!)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const ringSpecs = [
    { q: 2.0, rMinor: 22, col: 'rgba(244, 114, 182, 0.58)', lw: 5.5, phase: localT * 3.8 },
    { q: 3.0, rMinor: 16, col: 'rgba(192, 132, 252, 0.62)', lw: 4.5, phase: -localT * 4.4 },
    { q: -2.0, rMinor: 24, col: 'rgba(34, 211, 238, 0.56)', lw: 4.0, phase: localT * 3.1 + 1.2 },
    { q: 1.0, rMinor: 6, col: `rgba(251, 191, 36, ${(0.65 + 0.25 * beatPulse).toFixed(2)})`, lw: 5.8 + beatPulse * 2.5, phase: localT * 5.0 },
  ];

  for (const rs of ringSpecs) {
    ctx.strokeStyle = rs.col;
    ctx.lineWidth = rs.lw;
    ctx.beginPath();
    const segs = 96;
    for (let s = 0; s <= segs; s++) {
      const phi = (s / segs) * Math.PI * 2;
      const pol = rs.q * phi + rs.phase;
      const rad = R + rs.rMinor * Math.cos(pol);
      const py = rs.rMinor * Math.sin(pol);
      const p3 = rotX({ x: rad * Math.cos(phi), y: py, z: rad * Math.sin(phi) }, tiltX);
      const pt = proj3D(p3, cx, cy, 420);
      if (s === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 4. Front-half magnetic confinement coils (`z >= 0`)
  for (const c of coilList) {
    if (c.z >= 0) drawCoil(c.phi, 0.78);
  }

  ctx.restore();
}

/**
 * Right Visualization (`cx = 805, cy = 318`):
 * Rotating Perovskite / Superconductor 3D Crystal Lattice (`ABX₃` with `BX₆` Octahedra)!
 */
function drawPerovskiteCrystalLattice(ctx, cx, cy, localT) {
  const ay = localT * 0.58 + 0.52;
  const ax = 0.42 + Math.sin(localT * 0.75) * 0.08;
  const cell = 54;

  const transformPt = (gx, gy, gz) => {
    const p3 = rotX(rotY({ x: gx * cell, y: gy * cell, z: gz * cell }, ay), ax);
    return proj3D(p3, cx, cy, 400);
  };

  ctx.save();

  // 1. Unit-cell wireframe lattice (`2x2x2` grid -> coordinates in {-1, 0, 1})
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.24)';
  ctx.lineWidth = 1.0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const pA = transformPt(-1, i, j);
      const pB = transformPt(1, i, j);
      const pC = transformPt(i, -1, j);
      const pD = transformPt(i, 1, j);
      const pE = transformPt(i, j, -1);
      const pF = transformPt(i, j, 1);
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.moveTo(pC.x, pC.y);
      ctx.lineTo(pD.x, pD.y);
      ctx.moveTo(pE.x, pE.y);
      ctx.lineTo(pF.x, pF.y);
      ctx.stroke();
    }
  }

  // 2. Eight `BX₆` Coordination Octahedra centered at `(±0.5, ±0.5, ±0.5)`
  const octCenters = [];
  for (const sx of [-0.5, 0.5]) {
    for (const sy of [-0.5, 0.5]) {
      for (const sz of [-0.5, 0.5]) {
        const cPt = transformPt(sx, sy, sz);
        octCenters.push({ sx, sy, sz, z: cPt.z, cPt });
      }
    }
  }
  octCenters.sort((a, b) => a.z - b.z);

  const atoms = [];
  // A-site cations at integer lattice vertices `{-1, 0, 1}^3` (corner + body center)
  for (let ix = -1; ix <= 1; ix++) {
    for (let iy = -1; iy <= 1; iy++) {
      for (let iz = -1; iz <= 1; iz++) {
        if (Math.abs(ix) + Math.abs(iy) + Math.abs(iz) <= 2) {
          const pt = transformPt(ix, iy, iz);
          atoms.push({ pt, r: ix === 0 && iy === 0 && iz === 0 ? 7.2 : 5.2, col: PAL.amber, glow: '#fef08a' });
        }
      }
    }
  }

  for (const oc of octCenters) {
    const vTop = transformPt(oc.sx, oc.sy - 0.5, oc.sz);
    const vBot = transformPt(oc.sx, oc.sy + 0.5, oc.sz);
    const vL = transformPt(oc.sx - 0.5, oc.sy, oc.sz);
    const vR = transformPt(oc.sx + 0.5, oc.sy, oc.sz);
    const vF = transformPt(oc.sx, oc.sy, oc.sz + 0.5);
    const vBk = transformPt(oc.sx, oc.sy, oc.sz - 0.5);

    const eq = [vL, vF, vR, vBk];
    ctx.fillStyle = 'rgba(34, 211, 238, 0.16)';
    ctx.strokeStyle = 'rgba(163, 230, 53, 0.62)';
    ctx.lineWidth = 1.1;
    for (let k = 0; k < 4; k++) {
      const q0 = eq[k];
      const q1 = eq[(k + 1) % 4];
      for (const apex of [vTop, vBot]) {
        ctx.beginPath();
        ctx.moveTo(apex.x, apex.y);
        ctx.lineTo(q0.x, q0.y);
        ctx.lineTo(q1.x, q1.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Central B-site transition-metal ion + X-site oxygen/halide vertices
    atoms.push({ pt: oc.cPt, r: 5.8, col: PAL.cyan, glow: '#e0f2fe' });
    for (const vx of [vTop, vBot, vL, vR, vF, vBk]) {
      atoms.push({ pt: vx, r: 3.4, col: PAL.pink, glow: '#fbcfe8' });
    }
  }

  // Cooper-pair superconducting orbital wave ring
  ctx.strokeStyle = 'rgba(163, 230, 53, 0.52)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let s = 0; s <= 48; s++) {
    const a = (s / 48) * Math.PI * 2 + localT * 2.4;
    const wave = 1.35 + 0.12 * Math.sin(a * 4 - localT * 6);
    const pt = transformPt(Math.cos(a) * wave, Math.sin(a * 2) * 0.28, Math.sin(a) * wave);
    if (s === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // Depth-sorted 3D shaded atomic spheres (deduplicated slightly by z order)
  atoms.sort((a, b) => a.pt.z - b.pt.z);
  for (let i = 0; i < atoms.length; i += 2) {
    const a = atoms[i];
    const rad = a.r * a.pt.sc;
    ctx.fillStyle = a.col;
    ctx.beginPath();
    ctx.arc(a.pt.x, a.pt.y, rad, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = a.glow;
    ctx.beginPath();
    ctx.arc(a.pt.x - rad * 0.3, a.pt.y - rad * 0.3, rad * 0.34, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawStationTelemetryAndBeams(ctx, scene, rig, localT, isOutroThumbnail) {
  // Top Observatory Header Bar
  ctx.fillStyle = 'rgba(4, 14, 24, 0.84)';
  ctx.fillRect(0, 0, PANEL_SIZE, 46);
  ctx.fillStyle = PAL.cyan;
  ctx.fillRect(0, 46, PANEL_SIZE, 1.5);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = '700 15px "PelicanMono", monospace';
  ctx.fillStyle = PAL.lime;
  ctx.fillText(`17 · ${scene?.zh || 'AI4Science 科学新范式'}`, 24, 23);

  ctx.font = '500 12px "PelicanMono", monospace';
  ctx.fillStyle = PAL.cyan;
  ctx.fillText('2026+ · ALPHAFOLD · TOKAMAK RL · CRYSTAL GNN', 320, 23);

  ctx.textAlign = 'right';
  ctx.fillStyle = PAL.amber;
  ctx.fillText('AUTONOMOUS HYPOTHESIS LOOP: ACTIVE', PANEL_SIZE - 24, 23);

  // Station Holographic Plaques & Rider Sensor-Visor Telemetry Link
  for (const st of STATIONS) {
    const dist = rig ? Math.abs(rig.root.x - st.x) : 999;
    const locked = isOutroThumbnail || (rig && rig.root.x >= st.x - 90);
    const beamAlpha = rig && !isOutroThumbnail ? clamp(1 - dist / 210, 0, 1) : 0;

    if (beamAlpha > 0.04 && rig) {
      ctx.save();
      ctx.strokeStyle = st.col;
      ctx.globalAlpha = beamAlpha * 0.72;
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rig.beakTip.x, rig.beakTip.y);
      ctx.lineTo(st.x, st.cy + 85);
      ctx.stroke();
      ctx.restore();
    }

    const cw = 216;
    const ch = 52;
    const cx0 = st.x - cw * 0.5;
    const cy0 = 468;

    ctx.fillStyle = 'rgba(6, 20, 32, 0.82)';
    ctx.strokeStyle = locked ? st.col : 'rgba(34, 211, 238, 0.32)';
    ctx.lineWidth = locked ? 1.6 : 1.0;
    ctx.beginPath();
    ctx.roundRect(cx0, cy0, cw, ch, 8);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '700 11.5px "PelicanMono", monospace';
    ctx.fillStyle = st.col;
    ctx.fillText(`[${st.code}] ${st.title}`, st.x, cy0 + 18);

    ctx.font = '600 11px "PelicanMono", monospace';
    ctx.fillStyle = locked ? PAL.white : '#94a3b8';
    ctx.fillText(`${st.metric} ${locked ? '✓' : '…'}`, st.x, cy0 + 37);
  }
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

  // 1. Baked Deep Sapphire-Cyan Scientific Discovery Dome & Cryo-Causeway
  const bg = getScienceDomeBackdrop(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Three Majestic Live 3D Scientific Visualizations above y = 680
  drawProteinFoldingRibbon(ctx, STATIONS[0].x, STATIONS[0].cy, localT, isOutroThumbnail);
  drawTokamakPlasmaTorus(ctx, STATIONS[1].x, STATIONS[1].cy, localT);
  drawPerovskiteCrystalLattice(ctx, STATIONS[2].x, STATIONS[2].cy, localT);

  // 3. Cyber-Rider on Superconducting Maglev Causeway
  const showRider = !hidePelican && pelicanLocalX >= -260 && pelicanLocalX <= 1260;
  const rig = showRider
    ? computePelicanRig({
        x: pelicanLocalX,
        y: ROAD_EDGE_Y,
        pedalAngle,
        scale: 1.0,
        slope: 0,
        speedScale,
        time,
      })
    : null;

  // 4. Station Discovery Plaques & Active Sensor Filaments
  drawStationTelemetryAndBeams(ctx, scene, rig, localT, isOutroThumbnail);

  if (rig) {
    // Superconducting Meissner quantum flux wake along y = 680
    const wakeG = ctx.createLinearGradient(rig.root.x - 220, ROAD_EDGE_Y, rig.root.x + 60, ROAD_EDGE_Y);
    wakeG.addColorStop(0, 'rgba(34, 211, 238, 0)');
    wakeG.addColorStop(0.65, 'rgba(163, 230, 53, 0.65)');
    wakeG.addColorStop(1, 'rgba(34, 211, 238, 0.95)');
    ctx.strokeStyle = wakeG;
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(rig.root.x - 220, ROAD_EDGE_Y - 1);
    ctx.lineTo(rig.root.x + 86, ROAD_EDGE_Y - 1);
    ctx.stroke();

    // Soft Floor Mirror Reflection of Cyber-Rider Wheels
    ctx.save();
    ctx.globalAlpha = 0.22;
    for (const w of [rig.rearWheel, rig.frontWheel]) {
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(w.x, ROAD_EDGE_Y + 18, w.r * 0.85, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    drawRig2D(ctx, rig, {
      featherFill: '#f0fdfa',
      featherShade: '#99f6e4',
      wingTipDark: '#0f293a',
      beakFill: PAL.cyan,
      pouchFill: PAL.lime,
      legFill: '#ccfbf1',
      frameStroke: PAL.cyan,
      metalStroke: '#64748b',
      tireStroke: '#081c2b',
      inkOutline: '#041019',
      glowColor: PAL.lime,
      halo: true,
      scanBeam: true,
    });
  }

  // 5. Outro Museum Gallery Tile Strip
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(6, 20, 32, 0.88)';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 92);
    ctx.fillStyle = PAL.lime;
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 4);
    ctx.fillStyle = PAL.white;
    ctx.font = '700 46px "PelicanSans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene?.num ?? 17).padStart(2, '0')} ${scene?.zh ?? 'AI4Science 科学新范式'}`, 36, PANEL_SIZE - 44);
  }

  ctx.restore();
}
