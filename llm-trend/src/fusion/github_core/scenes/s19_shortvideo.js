// src/fusion/github_core/scenes/s19_shortvideo.js
// Scene 19 · 具身智能走入现实 (2027+ · Embodied Physical AI · 9:16 Vision Feed)
// Framed for the 9:16 vertical cinema-curtain viewport (`x = 218..782`, while filling `0..1000` seamlessly):
// - Warm sunlit-neon real-world smart boulevard connecting cleanly at y = ROAD_EDGE_Y (680)
// - First-person Humanoid Embodied Vision HUD: 3D SLAM point-cloud, semantic bounding boxes
//   (`[AGENT-RIDER 99.8%]`, `[TRAJECTORY: SAFE]`, `[GRASP / BALANCE: LOCKED]`), Lidar horizon ring & depth minimap
// - At x = 640, a sleek friendly Humanoid Robot (`Embodied Unit`) waves to the passing Cyber-Rider,
//   sending floating cyan-coral heart & handshake sync pulses rising along `x = 700..765`!

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

const VX = 218;
const VR = 782;
const VW = VR - VX; // 564px 9:16 hero zone
const HUMANOID_X = 640;

const PAL = {
  obsidian: '#0b0f17',
  slate: '#1e293b',
  teal: '#2dd4bf',
  tealBright: '#5eead4',
  coral: '#fb7185',
  coralHot: '#f43f5e',
  gold: '#fcd34d',
  white: '#ffffff',
};

const SLAM_STATIC_ANCHORS = [
  { x: 268, y: 310, d: 0.8 },
  { x: 312, y: 388, d: 0.6 },
  { x: 356, y: 274, d: 0.9 },
  { x: 418, y: 420, d: 0.5 },
  { x: 472, y: 342, d: 0.7 },
  { x: 548, y: 292, d: 0.85 },
  { x: 590, y: 406, d: 0.55 },
  { x: 688, y: 318, d: 0.75 },
  { x: 734, y: 392, d: 0.45 },
  { x: 295, y: 676, d: 0.25 },
  { x: 410, y: 678, d: 0.22 },
  { x: 525, y: 677, d: 0.22 },
  { x: 715, y: 678, d: 0.25 },
];

function getSunlitBoulevardBackdrop(kit) {
  return kit.bake2D(
    's19_embodied_boulevard_v1',
    (_g, ctx, rng, w, h) => {
      // 1. Warm Golden-Hour Sunlit-Neon Sky (`0..680`)
      const skyG = ctx.createLinearGradient(0, 0, 0, ROAD_EDGE_Y);
      skyG.addColorStop(0.0, '#0f172a');
      skyG.addColorStop(0.36, '#1e293b');
      skyG.addColorStop(0.68, '#4c2d4e');
      skyG.addColorStop(0.88, '#be5a6c');
      skyG.addColorStop(1.0, '#fcd34d');
      ctx.fillStyle = skyG;
      ctx.fillRect(0, 0, w, ROAD_EDGE_Y);

      // Warm low golden sun glow centered inside the 9:16 boulevard corridor (`x = 485, y = 510`)
      const sunG = ctx.createRadialGradient(485, 520, 18, 485, 520, 340);
      sunG.addColorStop(0.0, 'rgba(255, 251, 235, 0.85)');
      sunG.addColorStop(0.28, 'rgba(252, 211, 77, 0.46)');
      sunG.addColorStop(0.62, 'rgba(251, 113, 133, 0.22)');
      sunG.addColorStop(1.0, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = sunG;
      ctx.fillRect(0, 120, w, ROAD_EDGE_Y - 120);

      // Soft sunlit cirrus clouds
      for (let i = 0; i < 14; i++) {
        const cx = 60 + i * 72 + (rng() - 0.5) * 30;
        const cy = 170 + (i % 4) * 46 + (rng() - 0.5) * 16;
        const cw = 90 + rng() * 85;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(254, 215, 170, 0.16)' : 'rgba(251, 113, 133, 0.14)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, cw * 0.5, 11 + rng() * 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Clean Futuristic Real-World Smart City Architecture (`x = 0..1000`, hero detail in `218..782`)
      const buildings = [
        { x: 18, w: 112, topY: 280, col: '#162033', rim: '#38bdf8', sign: 'METRO' },
        { x: 142, w: 96, topY: 325, col: '#1b263b', rim: '#fb7185', sign: '' },
        { x: 246, w: 118, topY: 238, col: '#172236', rim: PAL.teal, sign: 'BIO-BISTRO' },
        { x: 378, w: 104, topY: 304, col: '#1e293b', rim: PAL.gold, sign: 'OPEN LAB' },
        { x: 548, w: 112, topY: 266, col: '#192438', rim: PAL.coral, sign: 'CIVIC AI' },
        { x: 674, w: 114, topY: 224, col: '#151f32', rim: PAL.teal, sign: 'SOLAR PLAZA' },
        { x: 802, w: 94, topY: 312, col: '#1b263b', rim: '#fb7185', sign: '' },
        { x: 906, w: 84, topY: 290, col: '#162033', rim: PAL.teal, sign: 'HUB' },
      ];

      for (const b of buildings) {
        const bh = ROAD_EDGE_Y - 26 - b.topY;
        ctx.fillStyle = b.col;
        ctx.fillRect(b.x, b.topY, b.w, bh);

        // Warm sunlit glass edge highlight
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.35)';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(b.x + 0.5, b.topY + 0.5, b.w - 1, bh);

        // Glass curtain-wall Mullions & Warm Lit Interior Windows
        for (let wy = b.topY + 24; wy < ROAD_EDGE_Y - 64; wy += 24) {
          for (let wx = b.x + 12; wx < b.x + b.w - 18; wx += 22) {
            const warm = rng() > 0.42;
            ctx.fillStyle = warm
              ? 'rgba(253, 224, 71, 0.22)'
              : 'rgba(45, 212, 191, 0.16)';
            ctx.fillRect(wx, wy, 14, 15);
          }
        }

        // Ground-floor warm café / storefront neon awning
        if (b.sign) {
          ctx.fillStyle = 'rgba(11, 15, 23, 0.85)';
          ctx.strokeStyle = b.rim;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.roundRect(b.x + 10, ROAD_EDGE_Y - 66, b.w - 20, 22, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = b.rim;
          ctx.font = '700 9.5px "PelicanMono", monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.sign, b.x + b.w * 0.5, ROAD_EDGE_Y - 55);
        }
      }

      // 3. Sunlit Boulevard Trees & Smart Streetlamps along Pedestrian Promenade (`y = 654..680`)
      const treeXs = [86, 228, 362, 518, 786, 918];
      for (let ti = 0; ti < treeXs.length; ti++) {
        const tx = treeXs[ti];
        // Trunk
        ctx.fillStyle = '#332622';
        ctx.fillRect(tx - 3.5, ROAD_EDGE_Y - 82, 7, 58);
        // Sunlit warm-emerald & golden-rim canopy clusters
        for (const [ox, oy, rad, col] of [
          [-16, -94, 24, '#115e59'],
          [14, -90, 22, '#0f766e'],
          [0, -108, 27, '#14b8a6'],
          [-6, -114, 18, 'rgba(252, 211, 77, 0.45)'],
        ]) {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(tx + ox, ROAD_EDGE_Y + oy, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Promenade Raised Sidewalk Curb (`y = 654..680`)
      ctx.fillStyle = '#273449';
      ctx.fillRect(0, ROAD_EDGE_Y - 26, w, 26);
      ctx.fillStyle = 'rgba(252, 211, 77, 0.45)';
      ctx.fillRect(0, ROAD_EDGE_Y - 26, w, 2);

      // 4. Boulevard Mobility Lane & Asphalt Surface (`y = ROAD_EDGE_Y = 680` .. `1000`)
      const roadG = ctx.createLinearGradient(0, ROAD_EDGE_Y, 0, h);
      roadG.addColorStop(0.0, '#1e293b');
      roadG.addColorStop(0.24, '#151e2e');
      roadG.addColorStop(1.0, '#090d16');
      ctx.fillStyle = roadG;
      ctx.fillRect(0, ROAD_EDGE_Y, w, h - ROAD_EDGE_Y);

      // Subtle asphalt micro-grain
      for (let i = 0; i < 600; i++) {
        const gx = rng() * w;
        const gy = ROAD_EDGE_Y + 4 + rng() * (h - ROAD_EDGE_Y - 8);
        ctx.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.16)';
        ctx.fillRect(gx, gy, 2, 2);
      }

      // Exact y = 680 Glowing Teal-Coral Smart Curb Line across x = 0..1000!
      ctx.strokeStyle = PAL.teal;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(0, ROAD_EDGE_Y);
      ctx.lineTo(w, ROAD_EDGE_Y);
      ctx.stroke();

      // Dashed cycling lane divider at y = 726
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.45)';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([24, 18]);
      ctx.beginPath();
      ctx.moveTo(0, ROAD_EDGE_Y + 46);
      ctx.lineTo(w, ROAD_EDGE_Y + 46);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    PANEL_SIZE,
    PANEL_SIZE
  );
}

function drawCornerBox(ctx, x, y, w, h, color, label, subLabel = '') {
  const len = Math.min(16, w * 0.22, h * 0.22);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  // Crisp corner L-brackets
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);

  ctx.moveTo(x + w - len, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + len);

  ctx.moveTo(x, y + h - len);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + len, y + h);

  ctx.moveTo(x + w - len, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - len);
  ctx.stroke();

  if (label) {
    ctx.font = '700 11px "PelicanMono", monospace';
    const tw = ctx.measureText(label).width + 14;
    ctx.fillStyle = 'rgba(11, 15, 23, 0.88)';
    ctx.fillRect(x, y - 22, tw, 20);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x, y - 22, tw, 20);

    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + 7, y - 12);
  }

  if (subLabel) {
    ctx.font = '700 10px "PelicanMono", monospace';
    const sw = ctx.measureText(subLabel).width + 12;
    ctx.fillStyle = 'rgba(11, 15, 23, 0.86)';
    ctx.fillRect(x, y + h + 4, sw, 18);
    ctx.fillStyle = PAL.white;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(subLabel, x + 6, y + h + 13);
  }
  ctx.restore();
}

/**
 * Draws the sleek friendly Humanoid Robot (`Embodied Unit`) standing at `x = 640` beside the boulevard,
 * turning its head and waving warmly to the passing Cyber-Rider!
 */
function drawFriendlyHumanoidUnit(ctx, localT, riderX) {
  const bx = HUMANOID_X;
  const by = ROAD_EDGE_Y - 12; // Standing on raised promenade curb just behind road line
  const waveAngle = -1.15 + Math.sin(localT * 9.0) * 0.42;
  const lookDir = riderX < bx ? -1 : 1;

  ctx.save();
  // Soft contact shadow on promenade curb
  ctx.fillStyle = 'rgba(9, 13, 22, 0.42)';
  ctx.beginPath();
  ctx.ellipse(bx, by + 2, 28, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Articulated Robotic Legs (standing poised)
  for (const [hipOff, footOff, col] of [[-8, -12, '#cbd5e1'], [8, 11, '#f1f5f9']]) {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 10.5;
    ctx.beginPath();
    ctx.moveTo(bx + hipOff, by - 78);
    ctx.lineTo(bx + hipOff * 1.1, by - 38);
    ctx.lineTo(bx + footOff, by - 2);
    ctx.stroke();

    ctx.strokeStyle = col;
    ctx.lineWidth = 6.8;
    ctx.stroke();

    // Knee rotary actuator LED
    ctx.fillStyle = PAL.teal;
    ctx.beginPath();
    ctx.arc(bx + hipOff * 1.1, by - 38, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Foot boot
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(bx + footOff - 8, by - 5, 18, 7, 3);
    ctx.fill();
  }

  // Left Arm (relaxed balance pose at side)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 9.0;
  ctx.beginPath();
  ctx.moveTo(bx - 18, by - 126);
  ctx.lineTo(bx - 26, by - 96);
  ctx.lineTo(bx - 20, by - 72);
  ctx.stroke();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 5.6;
  ctx.stroke();

  // Sleek Pearl-White & Teal Torso Chassis
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(bx - 20, by - 132);
  ctx.lineTo(bx + 20, by - 132);
  ctx.lineTo(bx + 13, by - 78);
  ctx.lineTo(bx - 13, by - 78);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Embodied Core Heartbeat Arc on Chest
  ctx.fillStyle = PAL.coral;
  ctx.beginPath();
  ctx.arc(bx, by - 110, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.teal;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(bx, by - 110, 9.5, 0, Math.PI * 2);
  ctx.stroke();

  // Neck & Panoramic Visor Head turning toward Cyber-Rider
  ctx.fillStyle = '#334155';
  ctx.fillRect(bx - 5, by - 144, 10, 12);

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(bx - 16, by - 174, 32, 30, 12);
  ctx.fill();
  ctx.stroke();

  // Friendly Glowing Visor + Happy Curved Eye LEDs
  const vxOff = lookDir * 3;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(bx - 12 + vxOff, by - 166, 24, 14, 6);
  ctx.fill();

  ctx.strokeStyle = PAL.tealBright;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(bx - 5 + vxOff, by - 158, 3.2, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(bx + 5 + vxOff, by - 158, 3.2, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();

  // Right Arm Waving Enthusiastically Overhead!
  const shX = bx + 19;
  const shY = by - 126;
  const elX = shX + 18;
  const elY = shY - 18;
  const handX = elX + Math.cos(waveAngle) * 30;
  const handY = elY + Math.sin(waveAngle) * 30;

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 9.0;
  ctx.beginPath();
  ctx.moveTo(shX, shY);
  ctx.lineTo(elX, elY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 5.6;
  ctx.stroke();

  // Tactile Dexterous 5-DOF Hand + Motion Arcs
  ctx.fillStyle = PAL.teal;
  ctx.beginPath();
  ctx.arc(handX, handY, 5.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(45, 212, 191, 0.65)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(elX, elY, 37, -1.65, -0.65);
  ctx.stroke();

  ctx.restore();

  // Semantic Detection Bounding Box on Humanoid Unit
  drawCornerBox(
    ctx,
    bx - 36,
    by - 184,
    76,
    188,
    PAL.coral,
    '[EMBODIED-UNIT 99.7%]',
    '[GESTURE: WAVE_SYNC]'
  );
}

function drawHeartAndHandshakeStream(ctx, localT, riderX, isOutroThumbnail) {
  // Right-edge rising Embodied Social-Sync Telemetry Stream (`x = 700..765`)
  const proximityBoost = isOutroThumbnail
    ? 1.0
    : 0.45 + 0.55 * Math.exp(-Math.pow((riderX - 580) / 220, 2));

  const count = 8;
  for (let i = 0; i < count; i++) {
    const u = (((localT * 0.48 + i / count) % 1) + 1) % 1;
    const py = lerp(648, 250, u);
    const px = 732 + Math.sin(u * Math.PI * 3.2 + i * 1.7) * 22; // strictly within x = 700..765!
    const alpha = Math.sin(Math.PI * u) * (0.55 + 0.45 * proximityBoost);
    const sc = (0.78 + 0.38 * Math.sin(Math.PI * u));
    const isHeart = i % 2 === 0;

    ctx.save();
    ctx.translate(px, py);
    ctx.scale(sc, sc);
    ctx.globalAlpha = clamp(alpha, 0, 0.96);

    if (isHeart) {
      // Glowing Coral-Rose Telemetry Heart
      ctx.fillStyle = PAL.coral;
      ctx.strokeStyle = PAL.white;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.bezierCurveTo(-12, -2, -13, -11, -6, -11);
      ctx.bezierCurveTo(-2, -11, 0, -7, 0, -5);
      ctx.bezierCurveTo(0, -7, 2, -11, 6, -11);
      ctx.bezierCurveTo(13, -11, 12, -2, 0, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Glowing Cyan Handshake / Peer-Sync Capsule (`⇄`)
      ctx.fillStyle = 'rgba(11, 15, 23, 0.85)';
      ctx.strokeStyle = PAL.teal;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 20, 10);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = PAL.tealBright;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-8, -3);
      ctx.lineTo(8, -3);
      ctx.lineTo(4, -6);
      ctx.moveTo(8, 3);
      ctx.lineTo(-8, 3);
      ctx.lineTo(-4, 6);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawEmbodiedVisionHUD(ctx, scene, rig, localT, riderX, isOutroThumbnail) {
  ctx.save();

  // 1. Projected 3D Free-Space Safe Trajectory Carpet on Road (`y = 682..752`, `x = 228..772`)
  const carpetG = ctx.createLinearGradient(VX + 16, ROAD_EDGE_Y, VR - 16, ROAD_EDGE_Y);
  carpetG.addColorStop(0.0, 'rgba(45, 212, 191, 0.05)');
  carpetG.addColorStop(0.5, 'rgba(45, 212, 191, 0.24)');
  carpetG.addColorStop(1.0, 'rgba(45, 212, 191, 0.08)');
  ctx.fillStyle = carpetG;
  ctx.beginPath();
  ctx.moveTo(VX + 24, ROAD_EDGE_Y + 3);
  ctx.lineTo(VR - 24, ROAD_EDGE_Y + 3);
  ctx.lineTo(VR - 6, ROAD_EDGE_Y + 42);
  ctx.lineTo(VX + 6, ROAD_EDGE_Y + 42);
  ctx.closePath();
  ctx.fill();

  // Animated chevron arrows inside safe trajectory corridor
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.45)';
  ctx.lineWidth = 2.0;
  const shift = (localT * 90) % 64;
  for (let cx = VX + 36 + shift; cx < VR - 36; cx += 64) {
    ctx.beginPath();
    ctx.moveTo(cx - 10, ROAD_EDGE_Y + 12);
    ctx.lineTo(cx + 4, ROAD_EDGE_Y + 22);
    ctx.lineTo(cx - 10, ROAD_EDGE_Y + 32);
    ctx.stroke();
  }

  // 2. Real-Time 3D SLAM Point-Cloud Keypoints
  for (let i = 0; i < SLAM_STATIC_ANCHORS.length; i++) {
    const pt = SLAM_STATIC_ANCHORS[i];
    const pulse = 0.5 + 0.5 * Math.sin(localT * 6.5 + i * 1.3);
    ctx.strokeStyle = pt.d < 0.35 ? PAL.teal : pt.d < 0.7 ? PAL.gold : PAL.coral;
    ctx.lineWidth = 1.3;
    const s = 3.5 + pulse * 1.5;
    ctx.beginPath();
    ctx.moveTo(pt.x - s, pt.y);
    ctx.lineTo(pt.x + s, pt.y);
    ctx.moveTo(pt.x, pt.y - s);
    ctx.lineTo(pt.x, pt.y + s);
    ctx.stroke();
  }

  // 3. Dynamic Tracking Bounding Box around the Passing Cyber-Rider!
  if (rig && riderX > 90 && riderX < 910) {
    const bx = rig.root.x - 116;
    const by = rig.head.y - 36;
    const bw = 232;
    const bh = ROAD_EDGE_Y + 8 - by;
    drawCornerBox(
      ctx,
      bx,
      by,
      bw,
      bh,
      PAL.teal,
      '[AGENT-RIDER 99.8%]',
      '[TRAJECTORY: SAFE]'
    );

    // Predicted forward trajectory vector from front wheel
    ctx.strokeStyle = PAL.tealBright;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(rig.frontWheel.x + 48, ROAD_EDGE_Y - 12);
    ctx.lineTo(rig.frontWheel.x + 116, ROAD_EDGE_Y - 12);
    ctx.lineTo(rig.frontWheel.x + 106, ROAD_EDGE_Y - 18);
    ctx.moveTo(rig.frontWheel.x + 116, ROAD_EDGE_Y - 12);
    ctx.lineTo(rig.frontWheel.x + 106, ROAD_EDGE_Y - 6);
    ctx.stroke();

    // Handshake telemetry link arc when Cyber-Rider passes Humanoid (`x = 460..720`)
    if (Math.abs(rig.root.x - HUMANOID_X) < 190) {
      ctx.save();
      ctx.strokeStyle = PAL.coral;
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(rig.head.x + 16, rig.head.y - 6);
      ctx.quadraticCurveTo(
        (rig.head.x + HUMANOID_X) * 0.5,
        rig.head.y - 68,
        HUMANOID_X - 8,
        ROAD_EDGE_Y - 172
      );
      ctx.stroke();
      ctx.restore();
    }
  }

  // 4. First-Person Embodied Visor Header, Lidar Horizon Ring & Depth Minimap (`x = 218..782`)
  // Top Visor Pill (`x = 234..632, y = 24..64`)
  ctx.fillStyle = 'rgba(11, 15, 23, 0.80)';
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.48)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(VX + 16, 24, 398, 40, 10);
  ctx.fill();
  ctx.stroke();

  // Live REC / EGO-CAM dot
  ctx.fillStyle = PAL.coralHot;
  ctx.beginPath();
  ctx.arc(VX + 34, 44, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '700 13.5px "PelicanMono", monospace';
  ctx.fillStyle = PAL.white;
  ctx.fillText(`19 · ${scene?.zh || '具身智能走入现实'}`, VX + 48, 44);

  ctx.font = '600 10.5px "PelicanMono", monospace';
  ctx.fillStyle = PAL.teal;
  ctx.fillText('EGO-SLAM 9:16', VX + 294, 44);

  // Center Lidar Horizon Ring (`cx = 500, cy = 114`)
  const lcx = 500;
  const lcy = 114;
  const lr = 34;
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.46)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(lcx, lcy, lr, 0, Math.PI * 2);
  ctx.stroke();

  const sweepA = localT * 3.6;
  ctx.fillStyle = 'rgba(45, 212, 191, 0.22)';
  ctx.beginPath();
  ctx.moveTo(lcx, lcy);
  ctx.arc(lcx, lcy, lr - 2, sweepA, sweepA + 0.75);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = PAL.coral;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(lcx - lr - 8, lcy);
  ctx.lineTo(lcx - lr + 8, lcy);
  ctx.moveTo(lcx + lr - 8, lcy);
  ctx.lineTo(lcx + lr + 8, lcy);
  ctx.stroke();

  ctx.font = '600 9.5px "PelicanMono", monospace';
  ctx.fillStyle = PAL.tealBright;
  ctx.textAlign = 'center';
  ctx.fillText('LIDAR 360°', lcx, lcy + lr + 13);

  // Top-Right Depth Minimap (`x = 648..766, y = 24..122`)
  const mx = VR - 134;
  const my = 24;
  const mw = 118;
  const mh = 96;
  ctx.fillStyle = 'rgba(11, 15, 23, 0.82)';
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.48)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(mx, my, mw, mh, 10);
  ctx.fill();
  ctx.stroke();

  // Ego-robot FOV wedge inside minimap
  const mCx = mx + mw * 0.5;
  const mBot = my + mh - 14;
  ctx.fillStyle = 'rgba(45, 212, 191, 0.18)';
  ctx.strokeStyle = PAL.teal;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(mCx, mBot);
  ctx.lineTo(mx + 14, my + 20);
  ctx.lineTo(mx + mw - 14, my + 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Humanoid dot + live Cyber-Rider dot on minimap
  ctx.fillStyle = PAL.coral;
  ctx.beginPath();
  ctx.arc(mx + mw * 0.68, my + 48, 3.8, 0, Math.PI * 2);
  ctx.fill();

  const mapRiderU = clamp(riderX / PANEL_SIZE, 0.08, 0.92);
  ctx.fillStyle = PAL.gold;
  ctx.beginPath();
  ctx.arc(mx + 12 + mapRiderU * (mw - 24), my + 58, 4.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '700 9px "PelicanMono", monospace';
  ctx.fillStyle = PAL.white;
  ctx.textAlign = 'center';
  ctx.fillText('DEPTH MAP', mCx, my + 11);

  // 5. Bottom-Left Embodied Balance & Grasp Telemetry Stack (`x = 234..524, y = 744..852`)
  if (!isOutroThumbnail) {
    const tx = VX + 16;
    const ty = 746;
    ctx.fillStyle = 'rgba(11, 15, 23, 0.82)';
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.44)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(tx, ty, 286, 94, 10);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '700 12px "PelicanMono", monospace';
    ctx.fillStyle = PAL.tealBright;
    ctx.fillText('[GRASP / BALANCE: LOCKED]', tx + 14, ty + 22);

    ctx.font = '600 11px "PelicanMono", monospace';
    ctx.fillStyle = PAL.coral;
    ctx.fillText('[TRAJECTORY: SAFE · CLEAR 4.8m]', tx + 14, ty + 46);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('VLA POLICY: 250Hz TORQUE SYNC', tx + 14, ty + 70);
  }

  // Subtle 9:16 Visor Framing Hairlines at x = 218 & x = 782
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.24)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(VX + 6, 84);
  ctx.lineTo(VX + 6, PANEL_SIZE - 104);
  ctx.moveTo(VR - 6, 84);
  ctx.lineTo(VR - 6, PANEL_SIZE - 104);
  ctx.stroke();

  ctx.restore();
}

export function render(kit, slot, scene, params) {
  slot.usedFb = false;
  const ctx = slot.g2d.drawingContext;

  const localT = params?.localT ?? 0;
  const time = params?.t ?? localT;
  const rawRiderX = params?.pelicanLocalX ?? 500;
  const pedalAngle = params?.pedalAngle ?? 0;
  const speedScale = params?.speedScale ?? 1;
  const hidePelican = Boolean(params?.hidePelican);
  const isOutroThumbnail = Boolean(params?.isOutroThumbnail);

  // In Outro thumbnail, frame the Cyber-Rider at x=435 so both the Rider and the x=640 Humanoid shine clearly!
  const effectiveRiderX = isOutroThumbnail ? 435 : rawRiderX;

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Sunlit-Neon Real-World Smart Boulevard (`0..1000`, hero focus in `218..782`)
  const bg = getSunlitBoulevardBackdrop(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Friendly Sleek Humanoid Robot (`Embodied Unit`) waving at x = 640 beside the boulevard
  drawFriendlyHumanoidUnit(ctx, localT, effectiveRiderX);

  // 3. Cyber-Rider gliding along the Boulevard Mobility Lane at y = ROAD_EDGE_Y (`680`)
  const showRider = !hidePelican && rawRiderX >= -260 && rawRiderX <= 1260;
  const rig = showRider
    ? computePelicanRig({
        x: effectiveRiderX,
        y: ROAD_EDGE_Y,
        pedalAngle,
        scale: 1.0,
        slope: 0,
        speedScale,
        time,
      })
    : null;

  if (rig) {
    drawRig2D(ctx, rig, {
      featherFill: '#ffffff',
      featherShade: '#cbd5e1',
      wingTipDark: '#0f172a',
      beakFill: PAL.teal,
      pouchFill: PAL.coral,
      legFill: '#e2e8f0',
      frameStroke: PAL.teal,
      metalStroke: '#64748b',
      tireStroke: '#0b0f17',
      inkOutline: '#090d16',
      glowColor: PAL.tealBright,
      halo: true,
      scanBeam: true,
    });
  }

  // 4. First-Person Embodied Vision SLAM HUD, Bounding Boxes, Lidar Ring & Depth Minimap
  drawEmbodiedVisionHUD(ctx, scene, rig, localT, effectiveRiderX, isOutroThumbnail);

  // 5. Floating Cyan-Coral Heart & Handshake Telemetry Pulses rising along `x = 700..765`
  drawHeartAndHandshakeStream(ctx, localT, effectiveRiderX, isOutroThumbnail);

  // 6. Outro Museum Gallery Tile Strip
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(11, 15, 23, 0.88)';
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 92);
    ctx.fillStyle = PAL.teal;
    ctx.fillRect(0, PANEL_SIZE - 92, PANEL_SIZE, 4);
    ctx.fillStyle = PAL.white;
    ctx.font = '700 46px "PelicanSans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene?.num ?? 19).padStart(2, '0')} ${scene?.zh ?? '具身智能走入现实'}`, 36, PANEL_SIZE - 44);
  }

  ctx.restore();
}
