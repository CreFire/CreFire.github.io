// src/fusion/github_core/kit/transitions.js
// Cross-Era Holographic Seam Gate & Token Micro-Physics (`k = 1..19`, `t_cross = 5.0 + 6.0 * k`, `bx = k * 1000`)
// for 《硅基涌现·大模型二十幕》: emits deterministic era-colored token diamonds & data streams
// right as the AI Cyber-Rider crosses from Era `k-1` into Era `k`.

import {
  INTRO_SEC,
  SCENE_SEC,
  NUM_SCENES,
  PANEL_SIZE,
  ROAD_EDGE_Y,
  SCENES,
  clamp,
  lerp,
} from '../beat/timeline.js';
import { makePRNG, hashSeed } from './kit.js';

const PRE_SEC = 0.24;
const POST_SEC = 0.34;
const particleCache = new Map();

function getSeamParticles(k) {
  if (particleCache.has(k)) return particleCache.get(k);
  const rng = makePRNG(hashSeed(`llm_seam_particles_v1_${k}`));
  const pts = [];
  for (let i = 0; i < 18; i++) {
    pts.push({
      t0: lerp(-0.16, 0.08, i / 17),
      life: 0.22 + rng() * 0.18,
      y0: ROAD_EDGE_Y - 24 - rng() * 185,
      vx: 95 + rng() * 210,
      vy: (rng() - 0.52) * 85,
      r: 2.6 + rng() * 4.2,
      colIdx: i % 3,
    });
  }
  particleCache.set(k, pts);
  return pts;
}

export function renderThresholdMicroPhysics(p, _kit, clampedT, cam, pelWorld) {
  if (!pelWorld?.visibleInScroll || clampedT < INTRO_SEC + 1.0) return;

  for (let k = 1; k < NUM_SCENES; k++) {
    const tCross = INTRO_SEC + k * SCENE_SEC;
    const dt = clampedT - tCross;
    if (dt < -PRE_SEC || dt > POST_SEC) continue;

    const bx = k * PANEL_SIZE;
    const halfView = (960 * 0.6) / (cam?.scale || 0.632);
    if (Math.abs(bx - (cam?.camX || 0)) > halfView + 300) continue;

    const nextScene = SCENES[k];
    const pal = nextScene?.palette || ['#0f172a', '#38bdf8', '#fbbf24', '#c084fc'];
    const c1 = p.color(nextScene?.frameAccent || pal[1] || '#38bdf8');
    const c2 = p.color(pal[2] || '#fbbf24');
    const c3 = p.color(pal[3] || '#e2e8f0');
    const cols = [c1, c2, c3];

    const gateEnv = Math.sin(
      clamp((dt + PRE_SEC) / (PRE_SEC + POST_SEC), 0, 1) * Math.PI
    );

    p.push();
    // 1. Subtle vertical holographic laser gate ripple along seam `x = bx`
    p.noFill();
    p.stroke(p.red(c1), p.green(c1), p.blue(c1), Math.round(gateEnv * 145));
    p.strokeWeight(2.4);
    p.line(bx, ROAD_EDGE_Y - 260 * gateEnv, bx, ROAD_EDGE_Y + 36 * gateEnv);

    // 2. Forward-streaming geometric token diamonds
    const pts = getSeamParticles(k);
    p.noStroke();
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      const age = dt - pt.t0;
      if (age < 0 || age > pt.life) continue;
      const u = age / pt.life;
      const alpha = Math.round(Math.sin(u * Math.PI) * 215);
      const px = bx + pt.vx * age;
      const py = pt.y0 + pt.vy * age;
      const rad = pt.r * (1 - u * 0.4);
      const col = cols[pt.colIdx];
      p.fill(p.red(col), p.green(col), p.blue(col), alpha);
      p.quad(px, py - rad, px + rad * 1.4, py, px, py + rad, px - rad * 1.4, py);
    }
    p.pop();
  }
}
