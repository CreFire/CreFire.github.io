// src/fusion/github_core/rig/pelican.js
// Parametric Skeletal Rig for 《硅基涌现·大模型二十幕》:
// Protagonist: 「硅基领航员 Agent-01」 riding the 「算力光轮单车 (Tensor Light-Cycle)」.
// Keeps full joint-field & export compatibility (`solveTwoBoneIK`, `computePelicanRig`, `drawRig2D`)
// with exact analytical two-bone leg IK and continuous phase across all 20 era frames.

export function solveTwoBoneIK(rx, ry, tx, ty, L1, L2, bendSign = -1) {
  let dx = tx - rx;
  let dy = ty - ry;
  let d = Math.hypot(dx, dy);
  const minD = Math.abs(L1 - L2) + 1e-3;
  const maxD = L1 + L2 - 1e-3;
  if (d < minD) d = minD;
  if (d > maxD) {
    const k = maxD / d;
    dx *= k;
    dy *= k;
    d = maxD;
  }
  const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const clampedCos = Math.max(-1, Math.min(1, cosA));
  const angleBase = Math.atan2(dy, dx);
  const angleOffset = bendSign * Math.acos(clampedCos);
  const kneeAngle = angleBase + angleOffset;
  return {
    x: rx + L1 * Math.cos(kneeAngle),
    y: ry + L1 * Math.sin(kneeAngle),
    hipAngle: kneeAngle,
  };
}

/**
 * Computes full deterministic joint & spline rig for AI Cyber-Rider + Tensor Cycle at `(x, groundY)`.
 */
export function computePelicanRig({
  x = 500,
  y = 680,
  pedalAngle = 0,
  wheelAngle = null,
  scale = 1.0,
  slope = 0,
  speedScale = 1.0,
  poseMode = 'normal',
  lissajousMix = 0,
  time = 0,
} = {}) {
  const wheelR = 46;
  const wAngle = wheelAngle !== null ? wheelAngle : x / wheelR;

  const motionAmp = Math.min(1.2, Math.max(0.08, speedScale));
  const bob = -3.0 * Math.sin(2 * pedalAngle) * motionAmp;
  const nod = 0.032 * Math.sin(2 * pedalAngle - 0.4) * motionAmp;
  const scarfWave1 = Math.sin(time * 9.5 - 0.6) * 8.5 * motionAmp;
  const scarfWave2 = Math.cos(time * 11.2 - 1.4) * 12.0 * motionAmp;

  // Bicycle geometry around ground contact (0, 0), facing +X
  const rearWheel = { x: -86, y: -wheelR, r: wheelR, angle: wAngle };
  const frontWheel = { x: 86, y: -wheelR, r: wheelR, angle: wAngle };
  const bb = { x: -8, y: -wheelR };
  const crankR = 21;

  const rightPedal = {
    x: bb.x + crankR * Math.cos(pedalAngle),
    y: bb.y + crankR * Math.sin(pedalAngle),
  };
  const leftPedal = {
    x: bb.x - crankR * Math.cos(pedalAngle),
    y: bb.y - crankR * Math.sin(pedalAngle),
  };

  // Aero Tensor-Cycle diamond chassis + swept cockpit handlebar
  const seatCluster = { x: -34, y: -110 };
  const saddle = { x: -39, y: -117 };
  const headTop = { x: 56, y: -114 };
  const headBot = { x: 64, y: -90 };
  const stemTop = { x: 55, y: -130 };
  const handleGrip = { x: 42, y: -133 };

  // Cyber-Rider humanoid-agent torso, helmet, visor & streaming data scarf
  const isFreeze = poseMode === 'egypt_freeze';
  const hip = { x: -36, y: -125 + bob };
  const bodyCenter = { x: -12, y: -150 + bob, rx: 32, ry: 22, tilt: -0.42 };
  const chest = { x: 12, y: -171 + bob };
  const neckC1 = { x: 18, y: -183 + bob };
  const neckC2 = { x: 22, y: -193 + bob * 1.05 };
  const head = {
    x: isFreeze ? 26 : 25,
    y: -206 + bob * 1.08,
    r: 17.5,
    angle: isFreeze ? 0 : nod,
  };

  // Panoramic optic visor & forward sensor cone (aliased to beak* for full compatibility with s20 Fourier contour!)
  const beakUpperBase = { x: head.x + 4, y: head.y - 7 };
  const beakLowerBase = { x: head.x + 3, y: head.y + 7 };
  const beakTip = {
    x: head.x + 24,
    y: head.y - 1 + Math.sin(head.angle) * 6,
  };
  const pouchBelly = {
    x: head.x + 14,
    y: head.y + 12,
  };

  // Twin neural sensor antennae on helmet crown
  const crest1 = { x: head.x - 12, y: head.y - 24 - 1.5 * Math.sin(time * 7) };
  const crest2 = { x: head.x - 19, y: head.y - 18 - 1.5 * Math.cos(time * 7) };

  // Flowing Token Data Scarf streaming behind shoulders (aliased to tailTip for silhouette continuity)
  const scarfAnchor = { x: chest.x - 8, y: chest.y - 4 };
  const scarfCtrl1 = { x: -36, y: -182 + bob + scarfWave1 * 0.6 };
  const scarfCtrl2 = { x: -74, y: -172 + bob + scarfWave1 };
  const tailTip = { x: -112, y: -164 + bob * 0.8 + scarfWave2 };

  // Articulated cybernetic arm reaching to handlebar
  const wingShoulder = { x: 8, y: -168 + bob };
  const wingElbow = { x: 22, y: -146 + bob * 0.65 };
  const wingTip = { x: handleGrip.x, y: handleGrip.y };

  // Analytical two-bone IK legs (bendSign = -1 bends human/android knee forward toward +X!)
  const footPadOffsetY = -5;
  const leftKnee = solveTwoBoneIK(
    hip.x + 3,
    hip.y + 4,
    leftPedal.x,
    leftPedal.y + footPadOffsetY,
    53,
    53,
    -1
  );
  const rightKnee = solveTwoBoneIK(
    hip.x - 2,
    hip.y + 4,
    rightPedal.x,
    rightPedal.y + footPadOffsetY,
    53,
    53,
    -1
  );

  const cosS = Math.cos(slope) * scale;
  const sinS = Math.sin(slope) * scale;
  const xf = (pt) => {
    let px = pt.x;
    let py = pt.y;
    if (lissajousMix > 0.001) {
      const ph = time * 14 + px * 0.045 + py * 0.035;
      const lx = 112 * Math.sin(3 * time * 5.0 + px * 0.03);
      const ly = 112 * Math.sin(4 * time * 5.0 + py * 0.03 + 0.9) - 115;
      px = px * (1 - lissajousMix) + lx * lissajousMix + Math.sin(ph) * 5.5 * lissajousMix;
      py = py * (1 - lissajousMix) + ly * lissajousMix;
    }
    return {
      ...pt,
      x: x + px * cosS - py * sinS,
      y: y + px * sinS + py * cosS,
    };
  };

  return {
    root: { x, y, scale, slope },
    poseMode,
    pedalAngle,
    wheelAngle: wAngle,
    time,
    rearWheel: { ...xf(rearWheel), r: wheelR * scale },
    frontWheel: { ...xf(frontWheel), r: wheelR * scale },
    bb: xf(bb),
    leftPedal: xf(leftPedal),
    rightPedal: xf(rightPedal),
    seatCluster: xf(seatCluster),
    saddle: xf(saddle),
    headTop: xf(headTop),
    headBot: xf(headBot),
    stemTop: xf(stemTop),
    handleGrip: xf(handleGrip),
    hip: xf(hip),
    bodyCenter: {
      ...xf(bodyCenter),
      rx: bodyCenter.rx * scale,
      ry: bodyCenter.ry * scale,
      tilt: bodyCenter.tilt + slope,
    },
    tailTip: xf(tailTip),
    scarfAnchor: xf(scarfAnchor),
    scarfCtrl1: xf(scarfCtrl1),
    scarfCtrl2: xf(scarfCtrl2),
    chest: xf(chest),
    neckC1: xf(neckC1),
    neckC2: xf(neckC2),
    head: { ...xf(head), r: head.r * scale, angle: head.angle + slope },
    beakUpperBase: xf(beakUpperBase),
    beakLowerBase: xf(beakLowerBase),
    beakTip: xf(beakTip),
    pouchBelly: xf(pouchBelly),
    crest1: xf(crest1),
    crest2: xf(crest2),
    wingShoulder: xf(wingShoulder),
    wingElbow: xf(wingElbow),
    wingTip: xf(wingTip),
    leftHip: xf({ x: hip.x + 3, y: hip.y + 4 }),
    rightHip: xf({ x: hip.x - 2, y: hip.y + 4 }),
    leftKnee: xf(leftKnee),
    rightKnee: xf(rightKnee),
    leftFoot: xf({ x: leftPedal.x, y: leftPedal.y + footPadOffsetY }),
    rightFoot: xf({ x: rightPedal.x, y: rightPedal.y + footPadOffsetY }),
  };
}

/**
 * Draws the AI Cyber-Rider (`硅基领航员 Agent-01`) + Tensor Light-Cycle on any 2D context.
 * Accepts both legacy style keys (`featherFill`, `beakFill`, `pouchFill`, `frameStroke`, `wireframeColor`, `silhouetteColor`)
 * and cyber-specific options (`visorColor`, `scarfColor`, `glowColor`, `halo`, `scanBeam`).
 */
export function drawRig2D(ctx, rig, style = {}) {
  const s = rig.root.scale;
  const {
    silhouetteColor = null,
    wireframeColor = null,
    featherFill = '#e2e8f0', // Armor primary shell
    featherShade = '#94a3b8', // Armor secondary plate
    wingTipDark = '#1e293b', // Joint dark chassis
    beakFill = '#38bdf8', // Panoramic optic visor glow
    pouchFill = '#fbbf24', // Flowing token scarf / energy core accent
    legFill = '#cbd5e1', // Cybernetic limb armor
    frameStroke = '#22d3ee', // Tensor Cycle frame primary
    metalStroke = '#64748b', // Mechanical struts & cranks
    tireStroke = '#0f172a', // Stealth carbon tire
    inkOutline = '#090d16', // Crisp outline
    glowColor = null,
    halo = false,
    scanBeam = false,
    lineScale = 1.0,
  } = style;

  const isSil = Boolean(silhouetteColor);
  const isWire = Boolean(wireframeColor);
  const strokeMain = isWire ? wireframeColor : isSil ? silhouetteColor : inkOutline;
  const accentGlow = isWire ? wireframeColor : glowColor || beakFill;
  const lw = (w) => Math.max(0.75, w * s * lineScale);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isWire && style.glow) {
    ctx.shadowColor = style.glow;
    ctx.shadowBlur = 10 * s;
  }

  // Ground neon contact reflection / shadow
  if (!isSil && !isWire) {
    const midX = (rig.rearWheel.x + rig.frontWheel.x) * 0.5;
    const gndY = (rig.rearWheel.y + rig.frontWheel.y) * 0.5 + rig.rearWheel.r;
    const rg = ctx.createRadialGradient(midX, gndY, 4 * s, midX, gndY, 118 * s);
    rg.addColorStop(0, 'rgba(34, 211, 238, 0.24)');
    rg.addColorStop(0.55, 'rgba(8, 15, 28, 0.32)');
    rg.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.ellipse(midX, gndY + 2 * s, 118 * s, 11 * s, rig.root.slope, 0, Math.PI * 2);
    ctx.fill();
  }

  const drawWheel = (w) => {
    // Tensor vector spokes (8 radial + inner harmonic ring)
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : metalStroke;
    ctx.lineWidth = lw(1.35);
    const numSpokes = 8;
    for (let i = 0; i < numSpokes; i++) {
      const a = w.angle + (i * Math.PI * 2) / numSpokes;
      ctx.beginPath();
      ctx.moveTo(w.x + Math.cos(a) * (8 * s), w.y + Math.sin(a) * (8 * s));
      ctx.lineTo(w.x + Math.cos(a) * (w.r - 4 * s), w.y + Math.sin(a) * (w.r - 4 * s));
      ctx.stroke();
    }

    // Inner glowing energy rim
    if (!isSil) {
      ctx.strokeStyle = isWire ? wireframeColor : accentGlow;
      ctx.lineWidth = lw(2.3);
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r - 5.2 * s, 0, Math.PI * 2);
      ctx.stroke();

      // Spinning phase node on rim
      const nodeA = w.angle * 1.5;
      ctx.fillStyle = isWire ? wireframeColor : pouchFill;
      ctx.beginPath();
      ctx.arc(
        w.x + Math.cos(nodeA) * (w.r - 5.2 * s),
        w.y + Math.sin(nodeA) * (w.r - 5.2 * s),
        2.8 * s,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Outer stealth tire
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : tireStroke;
    ctx.lineWidth = lw(isWire ? 2.6 : 5.0);
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
    ctx.stroke();

    // Hub core
    ctx.fillStyle = isWire ? wireframeColor : isSil ? silhouetteColor : accentGlow;
    ctx.strokeStyle = strokeMain;
    ctx.lineWidth = lw(1.6);
    ctx.beginPath();
    ctx.arc(w.x, w.y, 6.2 * s, 0, Math.PI * 2);
    if (!isWire) ctx.fill();
    ctx.stroke();
  };

  const drawLeg = (hipPt, kneePt, footPt, pedalPt, isFar = false) => {
    // Crank arm
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : metalStroke;
    ctx.lineWidth = lw(3.4);
    ctx.beginPath();
    ctx.moveTo(rig.bb.x, rig.bb.y);
    ctx.lineTo(pedalPt.x, pedalPt.y);
    ctx.stroke();

    const plateColor = isFar ? featherShade : legFill;
    // Thigh & Shin articulated cybernetic struts
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : strokeMain;
    ctx.lineWidth = lw(8.4);
    ctx.beginPath();
    ctx.moveTo(hipPt.x, hipPt.y);
    ctx.lineTo(kneePt.x, kneePt.y);
    ctx.lineTo(footPt.x, footPt.y);
    ctx.stroke();

    if (!isSil && !isWire) {
      ctx.strokeStyle = plateColor;
      ctx.lineWidth = lw(5.2);
      ctx.beginPath();
      ctx.moveTo(hipPt.x, hipPt.y);
      ctx.lineTo(kneePt.x, kneePt.y);
      ctx.lineTo(footPt.x, footPt.y);
      ctx.stroke();
    }

    // Glowing knee servo ring
    ctx.fillStyle = isWire ? wireframeColor : isSil ? silhouetteColor : accentGlow;
    ctx.beginPath();
    ctx.arc(kneePt.x, kneePt.y, 3.3 * s, 0, Math.PI * 2);
    ctx.fill();

    // Cyber boot clipped onto pedal
    ctx.fillStyle = isWire ? 'transparent' : isSil ? silhouetteColor : wingTipDark;
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : accentGlow;
    ctx.lineWidth = lw(1.6);
    ctx.beginPath();
    ctx.moveTo(footPt.x - 5 * s, footPt.y - 2 * s);
    ctx.lineTo(footPt.x + 14 * s, footPt.y + 2 * s);
    ctx.lineTo(footPt.x + 12 * s, footPt.y + 6.5 * s);
    ctx.lineTo(footPt.x - 6 * s, footPt.y + 5.5 * s);
    ctx.closePath();
    if (!isWire) ctx.fill();
    ctx.stroke();

    // Pedal platform
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : pouchFill;
    ctx.lineWidth = lw(3.2);
    ctx.beginPath();
    ctx.moveTo(pedalPt.x - 7.5 * s, pedalPt.y + 2 * s);
    ctx.lineTo(pedalPt.x + 7.5 * s, pedalPt.y + 2 * s);
    ctx.stroke();
  };

  // 1. Streaming Luminous Token Scarf (behind torso)
  if (rig.scarfAnchor) {
    ctx.save();
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : pouchFill;
    ctx.lineWidth = lw(isWire ? 2.4 : 7.5);
    ctx.beginPath();
    ctx.moveTo(rig.scarfAnchor.x, rig.scarfAnchor.y);
    ctx.bezierCurveTo(
      rig.scarfCtrl1.x,
      rig.scarfCtrl1.y,
      rig.scarfCtrl2.x,
      rig.scarfCtrl2.y,
      rig.tailTip.x,
      rig.tailTip.y
    );
    ctx.stroke();

    if (!isSil && !isWire) {
      ctx.strokeStyle = accentGlow;
      ctx.lineWidth = lw(2.2);
      ctx.beginPath();
      ctx.moveTo(rig.scarfAnchor.x - 2 * s, rig.scarfAnchor.y + 4 * s);
      ctx.bezierCurveTo(
        rig.scarfCtrl1.x,
        rig.scarfCtrl1.y + 6 * s,
        rig.scarfCtrl2.x + 6 * s,
        rig.scarfCtrl2.y + 7 * s,
        rig.tailTip.x + 10 * s,
        rig.tailTip.y + 8 * s
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2. Far leg
  drawLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);

  // 3. Wheels
  drawWheel(rig.rearWheel);
  drawWheel(rig.frontWheel);

  // 4. Drive belt & Tensor Crank Core
  ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : metalStroke;
  ctx.lineWidth = lw(1.8);
  ctx.beginPath();
  ctx.moveTo(rig.rearWheel.x, rig.rearWheel.y - 5 * s);
  ctx.lineTo(rig.bb.x, rig.bb.y - 11 * s);
  ctx.moveTo(rig.rearWheel.x, rig.rearWheel.y + 5 * s);
  ctx.lineTo(rig.bb.x, rig.bb.y + 11 * s);
  ctx.stroke();

  // 5. Aero Tensor-Cycle Diamond Chassis
  if (!isSil && !isWire) {
    ctx.strokeStyle = strokeMain;
    ctx.lineWidth = lw(7.2);
    ctx.beginPath();
    ctx.moveTo(rig.rearWheel.x, rig.rearWheel.y);
    ctx.lineTo(rig.seatCluster.x, rig.seatCluster.y);
    ctx.lineTo(rig.headTop.x, rig.headTop.y);
    ctx.lineTo(rig.headBot.x, rig.headBot.y);
    ctx.lineTo(rig.bb.x, rig.bb.y);
    ctx.closePath();
    ctx.moveTo(rig.seatCluster.x, rig.seatCluster.y);
    ctx.lineTo(rig.bb.x, rig.bb.y);
    ctx.moveTo(rig.headTop.x, rig.headTop.y);
    ctx.lineTo(rig.frontWheel.x, rig.frontWheel.y);
    ctx.stroke();
  }

  ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : frameStroke;
  ctx.lineWidth = lw(4.2);
  ctx.beginPath();
  ctx.moveTo(rig.rearWheel.x, rig.rearWheel.y);
  ctx.lineTo(rig.seatCluster.x, rig.seatCluster.y);
  ctx.lineTo(rig.headTop.x, rig.headTop.y);
  ctx.lineTo(rig.headBot.x, rig.headBot.y);
  ctx.lineTo(rig.bb.x, rig.bb.y);
  ctx.closePath();
  ctx.moveTo(rig.seatCluster.x, rig.seatCluster.y);
  ctx.lineTo(rig.bb.x, rig.bb.y);
  ctx.moveTo(rig.headTop.x, rig.headTop.y);
  ctx.lineTo(rig.frontWheel.x, rig.frontWheel.y);
  ctx.stroke();

  // Glowing Tensor Core at Bottom Bracket
  ctx.fillStyle = isWire ? wireframeColor : isSil ? silhouetteColor : pouchFill;
  ctx.strokeStyle = strokeMain;
  ctx.lineWidth = lw(1.8);
  ctx.beginPath();
  ctx.arc(rig.bb.x, rig.bb.y, 9.5 * s, 0, Math.PI * 2);
  if (!isWire) ctx.fill();
  ctx.stroke();

  // Seatpost, Aero Saddle & Cockpit Handlebar
  ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : metalStroke;
  ctx.lineWidth = lw(3.4);
  ctx.beginPath();
  ctx.moveTo(rig.seatCluster.x, rig.seatCluster.y);
  ctx.lineTo(rig.saddle.x, rig.saddle.y);
  ctx.moveTo(rig.headTop.x, rig.headTop.y);
  ctx.lineTo(rig.stemTop.x, rig.stemTop.y);
  ctx.lineTo(rig.handleGrip.x, rig.handleGrip.y);
  ctx.stroke();

  ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : wingTipDark;
  ctx.lineWidth = lw(5.2);
  ctx.beginPath();
  ctx.moveTo(rig.saddle.x - 12 * s, rig.saddle.y);
  ctx.lineTo(rig.saddle.x + 11 * s, rig.saddle.y + 1 * s);
  ctx.stroke();

  // 6. Cyber-Rider Aerodynamic Torso Chassis
  ctx.fillStyle = isWire ? 'transparent' : isSil ? silhouetteColor : featherFill;
  ctx.strokeStyle = strokeMain;
  ctx.lineWidth = lw(2.5);
  ctx.beginPath();
  ctx.moveTo(rig.hip.x - 10 * s, rig.hip.y - 2 * s);
  ctx.quadraticCurveTo(
    rig.bodyCenter.x - 14 * s,
    rig.bodyCenter.y - 18 * s,
    rig.chest.x - 4 * s,
    rig.chest.y - 11 * s
  );
  ctx.lineTo(rig.chest.x + 14 * s, rig.chest.y + 2 * s);
  ctx.quadraticCurveTo(
    rig.bodyCenter.x + 14 * s,
    rig.bodyCenter.y + 16 * s,
    rig.hip.x + 8 * s,
    rig.hip.y + 8 * s
  );
  ctx.closePath();
  if (!isWire) ctx.fill();
  ctx.stroke();

  // Chest neural spine core line
  if (!isSil && !isWire) {
    ctx.strokeStyle = accentGlow;
    ctx.lineWidth = lw(2.2);
    ctx.beginPath();
    ctx.moveTo(rig.hip.x + 1 * s, rig.hip.y - 2 * s);
    ctx.lineTo(rig.chest.x + 4 * s, rig.chest.y - 2 * s);
    ctx.stroke();
  }

  // 7. Near Leg
  drawLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  // 8. Helmet & Panoramic Luminous Optic Visor
  // Neck collar
  ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : wingTipDark;
  ctx.lineWidth = lw(7.5);
  ctx.beginPath();
  ctx.moveTo(rig.chest.x + 3 * s, rig.chest.y - 6 * s);
  ctx.lineTo(rig.head.x - 2 * s, rig.head.y + 8 * s);
  ctx.stroke();

  // Optional forward sensor scan cone
  if (scanBeam && !isSil) {
    ctx.save();
    const beamG = ctx.createLinearGradient(
      rig.beakTip.x,
      rig.beakTip.y,
      rig.beakTip.x + 120 * s,
      rig.beakTip.y + 18 * s
    );
    beamG.addColorStop(0, 'rgba(56, 189, 248, 0.38)');
    beamG.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = beamG;
    ctx.beginPath();
    ctx.moveTo(rig.beakTip.x - 2 * s, rig.beakTip.y - 4 * s);
    ctx.lineTo(rig.beakTip.x + 125 * s, rig.beakTip.y - 22 * s);
    ctx.lineTo(rig.beakTip.x + 125 * s, rig.beakTip.y + 42 * s);
    ctx.lineTo(rig.beakTip.x - 2 * s, rig.beakTip.y + 5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Aero Cyber-Helmet dome
  ctx.fillStyle = isWire ? 'transparent' : isSil ? silhouetteColor : featherFill;
  ctx.strokeStyle = strokeMain;
  ctx.lineWidth = lw(2.5);
  ctx.beginPath();
  ctx.arc(rig.head.x, rig.head.y, rig.head.r, 0, Math.PI * 2);
  if (!isWire) ctx.fill();
  ctx.stroke();

  // Twin neural antennae (`crest1`, `crest2`)
  ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : accentGlow;
  ctx.lineWidth = lw(2.1);
  ctx.beginPath();
  ctx.moveTo(rig.head.x - 5 * s, rig.head.y - 13 * s);
  ctx.lineTo(rig.crest1.x, rig.crest1.y);
  ctx.moveTo(rig.head.x - 10 * s, rig.head.y - 9 * s);
  ctx.lineTo(rig.crest2.x, rig.crest2.y);
  ctx.stroke();
  if (!isSil) {
    ctx.fillStyle = isWire ? wireframeColor : pouchFill;
    ctx.beginPath();
    ctx.arc(rig.crest1.x, rig.crest1.y, 2.4 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Panoramic Glowing Visor
  if (!isSil) {
    ctx.fillStyle = isWire ? 'transparent' : beakFill;
    ctx.strokeStyle = isWire ? wireframeColor : strokeMain;
    ctx.lineWidth = lw(1.8);
    ctx.beginPath();
    ctx.moveTo(rig.head.x + 1 * s, rig.head.y - 7 * s);
    ctx.quadraticCurveTo(
      rig.head.x + 21 * s,
      rig.head.y - 6 * s,
      rig.head.x + 19 * s,
      rig.head.y + 5 * s
    );
    ctx.quadraticCurveTo(
      rig.head.x + 8 * s,
      rig.head.y + 7 * s,
      rig.head.x + 1 * s,
      rig.head.y + 3 * s
    );
    ctx.closePath();
    if (!isWire) ctx.fill();
    ctx.stroke();

    // Crisp white specular glint on visor
    if (!isWire) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lw(1.5);
      ctx.beginPath();
      ctx.moveTo(rig.head.x + 5 * s, rig.head.y - 3.5 * s);
      ctx.lineTo(rig.head.x + 15 * s, rig.head.y - 2.5 * s);
      ctx.stroke();
    }
  }

  // Optional CoT / AGI Golden Reasoning Halo above helmet
  if (halo && !isSil) {
    ctx.save();
    ctx.strokeStyle = pouchFill;
    ctx.lineWidth = lw(2.0);
    ctx.beginPath();
    ctx.ellipse(rig.head.x, rig.head.y - 26 * s, 20 * s, 5.5 * s, -0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 9. Foreground Articulated Arm gripping handlebar
  ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : strokeMain;
  ctx.lineWidth = lw(7.2);
  ctx.beginPath();
  ctx.moveTo(rig.wingShoulder.x, rig.wingShoulder.y);
  ctx.lineTo(rig.wingElbow.x, rig.wingElbow.y);
  ctx.lineTo(rig.wingTip.x, rig.wingTip.y);
  ctx.stroke();

  if (!isSil && !isWire) {
    ctx.strokeStyle = featherShade;
    ctx.lineWidth = lw(4.4);
    ctx.beginPath();
    ctx.moveTo(rig.wingShoulder.x, rig.wingShoulder.y);
    ctx.lineTo(rig.wingElbow.x, rig.wingElbow.y);
    ctx.lineTo(rig.wingTip.x, rig.wingTip.y);
    ctx.stroke();

    ctx.fillStyle = accentGlow;
    ctx.beginPath();
    ctx.arc(rig.wingShoulder.x, rig.wingShoulder.y, 3.4 * s, 0, Math.PI * 2);
    ctx.arc(rig.wingElbow.x, rig.wingElbow.y, 2.8 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
