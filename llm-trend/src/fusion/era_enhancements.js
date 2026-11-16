// src/fusion/era_enhancements.js
// Optical Gallery Atmosphere, Volumetric Light Wash & Photon Micro-Glints
// for 《硅基涌现·大模型二十幕》 (zero ancient-cave/hieroglyph overlays!).

const CODEX_ID_BY_GITHUB_ID = {
  s01_sahara: 'sahara',
  s02_egypt: 'egypt',
  s03_han: 'han',
  s04_tang: 'tang',
  s05_song: 'song',
  s06_qingming: 'qingming',
  s07_maya: 'maya',
  s08_mughal: 'mughal',
  s09_bada: 'bada',
  s10_wayang: 'wayang',
  s11_ukiyoe: 'ukiyoe',
  s12_starry: 'starry',
  s13_scream: 'scream',
  s14_nosferatu: 'nosferatu',
  s15_oscilloscope: 'scope',
  s16_8bit: 'pixel',
  s17_chat: 'chat',
  s18_vaporwave: 'vapor',
  s19_shortvideo: 'shorts',
  s20_code: 'code',
};

export function getCodexSceneId(githubSceneId) {
  return CODEX_ID_BY_GITHUB_ID[githubSceneId] || githubSceneId;
}

function getBakedVignette(kit) {
  return kit.bake2D('llm_panel_optical_vignette_v1', (_g, ctx, _rng, w, h) => {
    ctx.clearRect(0, 0, w, h);
    // Subtle overhead gallery light sheen + gentle corner falloff
    const topWash = ctx.createLinearGradient(0, 0, 0, 260);
    topWash.addColorStop(0, 'rgba(255, 255, 255, 0.045)');
    topWash.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = topWash;
    ctx.fillRect(0, 0, w, 260);

    const vig = ctx.createRadialGradient(500, 480, 320, 500, 500, 720);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(2, 6, 16, 0.28)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  });
}

export function enhanceEraPanel(kit, slot, scene, params, sync) {
  const ctx = slot?.g2d?.drawingContext;
  if (!ctx || !kit) return;

  const vig = getBakedVignette(kit);
  ctx.drawImage(vig.canvas || vig, 0, 0);

  // Subtle beat-reactive road horizon pulse along y = 680
  const beat = sync?.beatPulse || 0;
  if (beat > 0.15 && !params?.isOutroThumbnail) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.28, beat * 0.22);
    ctx.strokeStyle = scene?.frameAccent || '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 680.5);
    ctx.lineTo(1000, 680.5);
    ctx.stroke();
    ctx.restore();
  }
}
