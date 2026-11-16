// src/openings/gold_svg/scene.js
// Live 60fps 4K `<svg>` 3-Strip Silicon Tensor Forge Stage (`616x720`) for 《硅基涌现·大模型二十幕》:
// - Strip 0 (`01 晶圆光刻`): Cyan EUV Wafer Lithography & Concentric Die Grid
// - Strip 1 (`02 矩阵熔铸`): Gold Quantum Tensor Core & Twin Electromagnetic Plasma Hammers
// - Strip 2 (`03 脉冲涌现`): Violet-Emerald Multi-Head Attention Neural Synapse Web
// - Syncs with `/` Diagonal Shutter Curtain Wipe (`wipeU` in `[0..1]`) opening into the 12-Era LLM Accordion!

import { SVG_NS, el } from './defs.js';

function buildStripScene(parent, mode) {
  const palettes = {
    litho: {
      bg: '#07111f',
      primary: '#38bdf8',
      secondary: '#0ea5e9',
      accent: '#fbbf24',
      dim: '#1e3a5f',
    },
    tensor: {
      bg: '#120e07',
      primary: '#fbbf24',
      secondary: '#f59e0b',
      accent: '#38bdf8',
      dim: '#78350f',
    },
    synapse: {
      bg: '#0e091c',
      primary: '#a855f7',
      secondary: '#22d3ee',
      accent: '#f472b6',
      dim: '#3b0764',
    },
  };
  const pal = palettes[mode] || palettes.tensor;
  const g = el('g', {}, parent);

  // Subtle background panel tint
  el('rect', { x: -80, y: 0, width: 780, height: 720, fill: pal.bg }, g);

  // Perspective floor & ceiling grid lines
  const gridG = el('g', { stroke: pal.dim, 'stroke-width': '1', opacity: '0.55' }, g);
  for (let i = -5; i <= 5; i++) {
    el('line', { x1: 310 + i * 42, y1: 540, x2: 310 + i * 115, y2: 720 }, gridG);
    el('line', { x1: 310 + i * 42, y1: 180, x2: 310 + i * 115, y2: 0 }, gridG);
  }
  for (const fy of [540, 575, 618, 668]) {
    el('line', { x1: -60, y1: fy, x2: 700, y2: fy }, gridG);
  }

  // Concentric Silicon Wafer / Orbital Rings around Forge Center (310, 360)
  const cx = 310;
  const cy = 360;
  const orbitRing1 = el(
    'circle',
    {
      cx,
      cy,
      r: '210',
      fill: 'none',
      stroke: pal.primary,
      'stroke-width': '1.4',
      'stroke-dasharray': '8 6',
      opacity: '0.45',
    },
    g
  );
  const orbitRing2 = el(
    'circle',
    {
      cx,
      cy,
      r: '148',
      fill: 'none',
      stroke: pal.accent,
      'stroke-width': '1.8',
      'stroke-dasharray': '22 10',
      opacity: '0.68',
    },
    g
  );

  // Wafer die micro-grid inside Strip 0 / Synapse nodes inside Strip 2
  const detailG = el('g', {}, g);
  if (mode === 'litho') {
    for (let gx = -4; gx <= 4; gx++) {
      for (let gy = -4; gy <= 4; gy++) {
        if (gx * gx + gy * gy > 18) continue;
        el(
          'rect',
          {
            x: cx + gx * 36 - 14,
            y: cy + gy * 36 - 14,
            width: '28',
            height: '28',
            fill: 'none',
            stroke: pal.primary,
            'stroke-width': '0.9',
            opacity: '0.36',
          },
          detailG
        );
      }
    }
  } else if (mode === 'synapse') {
    for (let k = 0; k < 16; k++) {
      const a = (k * Math.PI * 2) / 16;
      const nx = cx + Math.cos(a) * 185;
      const ny = cy + Math.sin(a) * 185;
      el(
        'line',
        {
          x1: cx,
          y1: cy,
          x2: nx.toFixed(1),
          y2: ny.toFixed(1),
          stroke: k % 2 === 0 ? pal.primary : pal.secondary,
          'stroke-width': '1.2',
          opacity: '0.42',
        },
        detailG
      );
      el(
        'circle',
        { cx: nx.toFixed(1), cy: ny.toFixed(1), r: '5.5', fill: pal.accent, opacity: '0.85' },
        detailG
      );
    }
  }

  // Twin Electromagnetic Tensor Hammers (Upper & Lower Piston Rams) + Left/Right Laser Arms
  const upperRam = el('g', {}, g);
  el(
    'rect',
    { x: cx - 34, y: 40, width: 68, height: 140, rx: '6', fill: '#0f172a', stroke: pal.primary, 'stroke-width': '2.2' },
    upperRam
  );
  el(
    'polygon',
    {
      points: `${cx - 56},180 ${cx + 56},180 ${cx + 38},218 ${cx - 38},218`,
      fill: pal.primary,
      opacity: '0.88',
    },
    upperRam
  );

  // Lower Anvil Pedestal
  const pedestal = el('g', {}, g);
  el(
    'polygon',
    {
      points: `${cx - 95},540 ${cx + 95},540 ${cx + 58},456 ${cx - 58},456`,
      fill: '#0f172a',
      stroke: pal.primary,
      'stroke-width': '2.4',
    },
    pedestal
  );
  el(
    'line',
    { x1: cx - 64, y1: 456, x2: cx + 64, y2: 456, stroke: pal.accent, 'stroke-width': '4' },
    pedestal
  );

  // Left & Right Articulated Laser/Manipulator Arms converging on (cx, cy)
  const leftBeam = el(
    'line',
    { x1: 28, y1: 250, x2: cx - 44, y2: cy, stroke: pal.accent, 'stroke-width': '2.8', 'stroke-linecap': 'round' },
    g
  );
  const rightBeam = el(
    'line',
    { x1: 588, y1: 250, x2: cx + 44, y2: cy, stroke: pal.primary, 'stroke-width': '2.8', 'stroke-linecap': 'round' },
    g
  );

  // Central Levitating 4D Tensor Hypercube Core
  const coreGroup = el('g', {}, g);
  const outerDiamond = el(
    'polygon',
    {
      points: '0,-58 58,0 0,58 -58,0',
      fill: 'none',
      stroke: pal.primary,
      'stroke-width': '3.0',
    },
    coreGroup
  );
  const innerSquare = el(
    'rect',
    {
      x: -28,
      y: -28,
      width: 56,
      height: 56,
      fill: pal.accent,
      opacity: '0.85',
      stroke: '#ffffff',
      'stroke-width': '1.8',
    },
    coreGroup
  );

  // Radial Shockwave Ring & 12 Spark Rays on Forge Beat Impact!
  const shockCircle = el(
    'circle',
    {
      cx,
      cy,
      r: '40',
      fill: 'none',
      stroke: '#ffffff',
      'stroke-width': '3.2',
      opacity: '0',
    },
    g
  );

  const sparks = [];
  const sparkG = el('g', { 'stroke-linecap': 'round' }, g);
  for (let s = 0; s < 12; s++) {
    sparks.push(
      el(
        'line',
        {
          x1: cx,
          y1: cy,
          x2: cx,
          y2: cy,
          stroke: s % 2 === 0 ? '#fde047' : '#38bdf8',
          'stroke-width': '2.6',
          opacity: '0',
        },
        sparkG
      )
    );
  }

  // Strip Header Label Tag
  const tagText =
    mode === 'litho'
      ? '01 · EUV LITHOGRAPHY'
      : mode === 'tensor'
        ? '02 · TENSOR FORGE'
        : '03 · SYNAPSE EMERGENCE';
  el(
    'text',
    {
      x: cx,
      y: 690,
      fill: pal.primary,
      'font-family': 'monospace',
      'font-size': '13',
      'font-weight': '700',
      'text-anchor': 'middle',
      opacity: '0.78',
    },
    g
  ).textContent = tagText;

  return {
    update(realT) {
      // Strike rhythm every 0.5s (120 BPM), peaking at 0.15, 0.65, 1.15...
      const beatPhase = ((realT - 0.15) % 0.5 + 0.5) % 0.5;
      const impact = Math.exp(-beatPhase * 11.0);
      const ramDrop = Math.pow(impact, 0.65) * 86;

      upperRam.setAttribute('transform', `translate(0, ${ramDrop.toFixed(1)})`);
      orbitRing1.setAttribute('transform', `rotate(${(realT * 24).toFixed(1)} ${cx} ${cy})`);
      orbitRing2.setAttribute('transform', `rotate(${(-realT * 38).toFixed(1)} ${cx} ${cy})`);

      const coreScale = 1 + impact * 0.24;
      const coreRot = realT * 52;
      coreGroup.setAttribute(
        'transform',
        `translate(${cx}, ${cy}) rotate(${coreRot.toFixed(1)}) scale(${coreScale.toFixed(3)})`
      );
      outerDiamond.setAttribute('stroke-width', (2.6 + impact * 2.4).toFixed(2));
      innerSquare.setAttribute('opacity', (0.65 + impact * 0.35).toFixed(2));

      const beamY = 230 + Math.sin(realT * 7.5) * 42;
      leftBeam.setAttribute('y1', beamY.toFixed(1));
      rightBeam.setAttribute('y1', (480 - beamY + 230).toFixed(1));
      leftBeam.setAttribute('opacity', (0.45 + impact * 0.55).toFixed(2));
      rightBeam.setAttribute('opacity', (0.45 + impact * 0.55).toFixed(2));

      const shockR = 48 + (1 - impact) * 165;
      shockCircle.setAttribute('r', shockR.toFixed(1));
      shockCircle.setAttribute('opacity', (impact * 0.85).toFixed(2));

      for (let s = 0; s < sparks.length; s++) {
        const ang = (s * Math.PI * 2) / sparks.length + Math.floor((realT + 0.35) * 2) * 0.27;
        const r0 = 36 + (1 - impact) * 110;
        const r1 = r0 + 18 + impact * 34;
        sparks[s].setAttribute('x1', (cx + Math.cos(ang) * r0).toFixed(1));
        sparks[s].setAttribute('y1', (cy + Math.sin(ang) * r0).toFixed(1));
        sparks[s].setAttribute('x2', (cx + Math.cos(ang) * r1).toFixed(1));
        sparks[s].setAttribute('y2', (cy + Math.sin(ang) * r1).toFixed(1));
        sparks[s].setAttribute('opacity', (impact * 0.92).toFixed(2));
      }
    },
  };
}

export function createGoldPrintmakingForgeSvg(svgRoot, stageW = 616, stageH = 720) {
  svgRoot.setAttribute('xmlns', SVG_NS);
  svgRoot.setAttribute('viewBox', `0 0 ${stageW} ${stageH}`);
  svgRoot.innerHTML = '';

  const defs = el('defs', {}, svgRoot);
  const clip0 = el('clipPath', { id: 'gf-clip-0' }, defs);
  const poly0 = el('polygon', {}, clip0);
  const clip1 = el('clipPath', { id: 'gf-clip-1' }, defs);
  const poly1 = el('polygon', {}, clip1);
  const clip2 = el('clipPath', { id: 'gf-clip-2' }, defs);
  const poly2 = el('polygon', {}, clip2);

  const wipeClip = el('clipPath', { id: 'gf-shutter-wipe' }, defs);
  const wipePoly = el(
    'polygon',
    { points: `-20,0 ${stageW + 20},0 ${stageW + 20},${stageH} -20,${stageH}` },
    wipeClip
  );

  const shutterRoot = el('g', { 'clip-path': 'url(#gf-shutter-wipe)' }, svgRoot);
  const slideContent = el('g', {}, shutterRoot);

  el('rect', { x: -120, y: 0, width: stageW + 240, height: stageH, fill: '#070b14' }, slideContent);

  const strip0G = el('g', { 'clip-path': 'url(#gf-clip-0)' }, slideContent);
  const inst0 = buildStripScene(strip0G, 'litho');

  const strip1G = el('g', { 'clip-path': 'url(#gf-clip-1)' }, slideContent);
  const inst1 = buildStripScene(strip1G, 'tensor');

  const strip2G = el('g', { 'clip-path': 'url(#gf-clip-2)' }, slideContent);
  const inst2 = buildStripScene(strip2G, 'synapse');

  const seamLine1 = el('line', { stroke: '#38bdf8', 'stroke-width': '2.2', opacity: '0.92' }, slideContent);
  const seamLine2 = el('line', { stroke: '#fbbf24', 'stroke-width': '2.2', opacity: '0.92' }, slideContent);

  // Right-side continuation of double precision frame
  const coverFrameG = el('g', { fill: 'none', 'pointer-events': 'none' }, slideContent);
  el(
    'rect',
    {
      x: '-315.92',
      y: '28.08',
      width: '903.84',
      height: '663.84',
      stroke: 'rgba(56, 189, 248, 0.62)',
      'stroke-width': '0.95',
    },
    coverFrameG
  );
  el(
    'rect',
    {
      x: '-307.28',
      y: '36.72',
      width: '886.56',
      height: '646.56',
      stroke: 'rgba(251, 191, 36, 0.46)',
      'stroke-width': '0.60',
    },
    coverFrameG
  );

  const shutterGlowLine = el(
    'line',
    { stroke: '#38bdf8', 'stroke-width': '4.2', opacity: '0', 'stroke-linecap': 'round' },
    svgRoot
  );

  function setSeams(s1Top, s1Bot, s2Top, s2Bot) {
    poly0.setAttribute(
      'points',
      `-140,0 ${s1Top.toFixed(1)},0 ${s1Bot.toFixed(1)},${stageH} -140,${stageH}`
    );
    poly1.setAttribute(
      'points',
      `${s1Top.toFixed(1)},0 ${s2Top.toFixed(1)},0 ${s2Bot.toFixed(1)},${stageH} ${s1Bot.toFixed(1)},${stageH}`
    );
    poly2.setAttribute(
      'points',
      `${s2Top.toFixed(1)},0 ${stageW + 140},0 ${stageW + 140},${stageH} ${s2Bot.toFixed(1)},${stageH}`
    );

    seamLine1.setAttribute('x1', s1Top.toFixed(1));
    seamLine1.setAttribute('y1', '0');
    seamLine1.setAttribute('x2', s1Bot.toFixed(1));
    seamLine1.setAttribute('y2', String(stageH));

    seamLine2.setAttribute('x1', s2Top.toFixed(1));
    seamLine2.setAttribute('y1', '0');
    seamLine2.setAttribute('x2', s2Bot.toFixed(1));
    seamLine2.setAttribute('y2', String(stageH));
  }

  setSeams(363, 113, 478, 251);

  return {
    renderAt(realT, localPolys, wipeU = 0) {
      if (localPolys && localPolys.length >= 3) {
        setSeams(
          localPolys[0].localTopR,
          localPolys[0].localBotR,
          localPolys[1].localTopR,
          localPolys[1].localBotR
        );
      }

      if (wipeU <= 0.001) {
        wipePoly.setAttribute(
          'points',
          `-20,0 ${stageW + 20},0 ${stageW + 20},${stageH} -20,${stageH}`
        );
        slideContent.removeAttribute('transform');
        shutterGlowLine.setAttribute('opacity', '0');
      } else {
        const slant = 236;
        const globalEdgeTop = (960 + slant) * (1 - wipeU);
        const edgeTop = globalEdgeTop - 344;
        const edgeBot = edgeTop - slant;
        wipePoly.setAttribute(
          'points',
          `-140,0 ${edgeTop.toFixed(1)},0 ${edgeBot.toFixed(1)},${stageH} -140,${stageH}`
        );

        const pushX = -96 * wipeU;
        slideContent.setAttribute('transform', `translate(${pushX.toFixed(1)}, 0)`);

        shutterGlowLine.setAttribute('x1', edgeTop.toFixed(1));
        shutterGlowLine.setAttribute('y1', '0');
        shutterGlowLine.setAttribute('x2', edgeBot.toFixed(1));
        shutterGlowLine.setAttribute('y2', String(stageH));
        shutterGlowLine.setAttribute('opacity', (Math.sin(wipeU * Math.PI) * 0.95).toFixed(2));
      }

      inst0.update(realT);
      inst1.update(realT);
      inst2.update(realT);
    },
  };
}
