// src/fusion/github_core/beat/timeline.js
// Canonical 20-Act LLM Evolution & Future Trends timeline on canonicalT in [0, 137.0],
// paired with 120 BPM pure-code synthesizer synchronization in `time_warp.js`.

export const BPM = 120;
export const BEAT_SEC = 60 / BPM; // 0.5s canonical beat
export const BAR_BEATS = 4;
export const BAR_SEC = BEAT_SEC * BAR_BEATS; // 2.0s canonical bar

export const INTRO_BARS = 2.5;
export const INTRO_SEC = INTRO_BARS * BAR_SEC; // 5.0s canonical intro

export const SCENE_BARS = 3;
export const SCENE_SEC = SCENE_BARS * BAR_SEC; // 6.0s canonical per era
export const NUM_SCENES = 20;
export const SCENES_TOTAL_SEC = NUM_SCENES * SCENE_SEC; // 120.0s (5.0 -> 125.0)

export const OUTRO_BARS = 6;
export const OUTRO_SEC = OUTRO_BARS * BAR_SEC; // 12.0s (125.0 -> 137.0)

export const TOTAL_DURATION = INTRO_SEC + SCENES_TOTAL_SEC + OUTRO_SEC; // 137.0s canonical

export const PANEL_SIZE = 1000;
export const ROAD_EDGE_Y = 680;

export const SCENES = [
  {
    index: 0,
    num: 1,
    imgCode: 'LLM-01',
    id: 's01_sahara',
    zh: '感知机与神经元',
    en: 'Rosenblatt Perceptron · Hardware Relay',
    era: '1958',
    gag: '穿孔纸带与黄铜继电器面板前，初代智能体骑手沿线性超平面切开正负样本点云',
    palette: ['#181410', '#d97706', '#f59e0b', '#fef3c7', '#451a03'],
    frameColor: '#78350f',
    frameAccent: '#f59e0b',
    frameStyle: 'relay',
  },
  {
    index: 1,
    num: 2,
    imgCode: 'LLM-02',
    id: 's02_egypt',
    zh: '反向传播与梯度谷',
    en: 'Backpropagation · Loss Landscape',
    era: '1986',
    gag: '工程蓝图等高线损失曲面上，骑手顺着负梯度箭头疾驰下探全局极小值',
    palette: ['#0c2340', '#38bdf8', '#e0f2fe', '#facc15', '#08172b'],
    frameColor: '#1e3a5f',
    frameAccent: '#38bdf8',
    frameStyle: 'blueprint',
    motionProfile: 'freeze_bar2',
  },
  {
    index: 2,
    num: 3,
    imgCode: 'LLM-03',
    id: 's03_han',
    zh: '词向量语义星图',
    en: 'Word2Vec · Semantic Embedding Space',
    era: '2013',
    gag: '深空高维流形中平行四边形向量法则闪耀，词汇星群随骑手经过自动聚类对齐',
    palette: ['#090d1a', '#818cf8', '#c084fc', '#e2e8f0', '#1e1b4b'],
    frameColor: '#1e1b4b',
    frameAccent: '#818cf8',
    frameStyle: 'cosmos',
  },
  {
    index: 3,
    num: 4,
    imgCode: 'LLM-04',
    id: 's04_tang',
    zh: '注意力机制诞生',
    en: 'Transformer · Multi-Head Attention',
    era: '2017',
    gag: '金色多头注意力光弧横跨圣殿穹顶，Q·Kᵀ权重束实时聚焦在疾驰的骑手身上',
    palette: ['#12101b', '#fbbf24', '#38bdf8', '#fde68a', '#2e1065'],
    frameColor: '#4c1d95',
    frameAccent: '#fbbf24',
    frameStyle: 'gold_tech',
  },
  {
    index: 4,
    num: 5,
    imgCode: 'LLM-05',
    id: 's05_song',
    zh: 'Scaling Law 算力洪流',
    en: 'GPT-3 & Power-Law Supercluster',
    era: '2020',
    gag: '百米液冷超算机柜如北宋巨碑耸立，镜头推近幂律斜坡才看清渺小却坚定的算力骑手',
    palette: ['#060b14', '#22d3ee', '#0ea5e9', '#94a3b8', '#0f172a'],
    frameColor: '#0f172a',
    frameAccent: '#22d3ee',
    frameStyle: 'monolith',
    cameraMode: 'song_zoom',
  },
  {
    index: 5,
    num: 6,
    imgCode: 'LLM-06',
    id: 's06_qingming',
    zh: '对话觉醒与人类对齐',
    en: 'ChatGPT & RLHF Alignment Bridge',
    era: '2022',
    gag: '骑手跃上流式吐字的数据虹桥，闪烁光标与人类偏好金星一路点亮万家灯火',
    palette: ['#0a1916', '#10b981', '#34d399', '#ecfdf5', '#064e3b'],
    frameColor: '#065f46',
    frameAccent: '#34d399',
    frameStyle: 'emerald',
    archBridge: true,
  },
  {
    index: 6,
    num: 7,
    imgCode: 'LLM-07',
    id: 's07_maya',
    zh: '开源生态百模星火',
    en: 'Open-Weight Renaissance & LoRA',
    era: '2023',
    gag: '开源分支树在夜空绽放万千孔明灯，轻量化LoRA适配器模块精准嵌入车架',
    palette: ['#160f1d', '#f97316', '#fb923c', '#fde047', '#3b0764'],
    frameColor: '#7c2d12',
    frameAccent: '#fb923c',
    frameStyle: 'ember',
  },
  {
    index: 7,
    num: 8,
    imgCode: 'LLM-08',
    id: 's08_mughal',
    zh: '原生多模态融合',
    en: 'Native Multimodal Prism',
    era: '2024',
    gag: '图像像素、音频声波与文本词元汇入中央晶体棱镜，折射出统一表征光谱大道',
    palette: ['#0f1021', '#ec4899', '#8b5cf6', '#06b6d4', '#fdf4ff'],
    frameColor: '#581c87',
    frameAccent: '#ec4899',
    frameStyle: 'prism',
  },
  {
    index: 8,
    num: 9,
    imgCode: 'LLM-09',
    id: 's09_bada',
    zh: '百万长上下文记忆海',
    en: 'Million-Token Context · Needle in a Haystack',
    era: '2024',
    gag: '浩瀚留白与翻涌的百万Token数据波涛间，骑手探照灯一束锁定深海金针',
    palette: ['#07131c', '#38bdf8', '#fbbf24', '#e0f2fe', '#0c4a6e'],
    frameColor: '#0c4a6e',
    frameAccent: '#fbbf24',
    frameStyle: 'deep_sea',
  },
  {
    index: 9,
    num: 10,
    imgCode: 'LLM-10',
    id: 's10_wayang',
    zh: 'MoE 混合专家路由',
    en: 'Sparse Mixture-of-Experts Router',
    era: '2024',
    gag: '高速门控路由器按节拍分流脉冲，十六座专家阵列塔中每次仅点亮最优两座',
    palette: ['#0c0a18', '#a855f7', '#22d3ee', '#f472b6', '#1e1b4b'],
    frameColor: '#3b0764',
    frameAccent: '#22d3ee',
    frameStyle: 'router',
  },
  {
    index: 10,
    num: 11,
    imgCode: 'LLM-11',
    id: 's11_ukiyoe',
    zh: '慢思考与深度推理',
    en: 'Test-Time Compute & Chain-of-Thought',
    era: '2025',
    gag: '骑手头顶生长分形思维搜索树，自动剪枝回溯后最优推理主干瞬间镀金贯通',
    palette: ['#0f172a', '#f59e0b', '#38bdf8', '#fef08a', '#1e293b'],
    frameColor: '#1e293b',
    frameAccent: '#f59e0b',
    frameStyle: 'gold_tech',
  },
  {
    index: 11,
    num: 12,
    imgCode: 'LLM-12',
    id: 's12_starry',
    zh: '自主编程智能体',
    en: 'Autonomous Coding Agents & SWE',
    era: '2025',
    gag: '多终端代码流与语法树在车轮前实时铺就悬空光桥，单元测试全绿徽章逐拍亮起',
    palette: ['#0b1215', '#4ade80', '#38bdf8', '#f8fafc', '#14532d'],
    frameColor: '#14532d',
    frameAccent: '#4ade80',
    frameStyle: 'terminal',
  },
  {
    index: 12,
    num: 13,
    imgCode: 'LLM-13',
    id: 's13_scream',
    zh: '万物互联工具协议',
    en: 'Tool Use & MCP Universal Bus',
    era: '2025',
    gag: '环绕式标准接口坞站自动对接搜索、数据库与云端机械臂，指令脉冲一触即达',
    palette: ['#111827', '#60a5fa', '#f43f5e', '#a78bfa', '#1f2937'],
    frameColor: '#1e3a8a',
    frameAccent: '#60a5fa',
    frameStyle: 'dock',
  },
  {
    index: 13,
    num: 14,
    imgCode: 'LLM-14',
    id: 's14_nosferatu',
    zh: '多智能体蜂群协作',
    en: 'Multi-Agent Swarm Orchestration',
    era: '2025',
    gag: '规划、研究、编码与验证多架子智能体编队伴飞，共享黑板消息网格同频共振',
    palette: ['#090d16', '#2dd4bf', '#818cf8', '#f0fdfa', '#134e4a'],
    frameColor: '#134e4a',
    frameAccent: '#2dd4bf',
    frameStyle: 'swarm',
  },
  {
    index: 14,
    num: 15,
    imgCode: 'LLM-15',
    id: 's15_oscilloscope',
    zh: '全双工实时情感交互',
    en: 'Native Omni-Modal Realtime Voice',
    era: '2026',
    gag: '零延迟双向声纹环在强拍交融成李萨如谐波光影，下一拍又丝滑凝回灵动骑手',
    palette: ['#04130d', '#34d399', '#22d3ee', '#a7f3d0', '#064e3b'],
    frameColor: '#064e3b',
    frameAccent: '#34d399',
    frameStyle: 'scope',
  },
  {
    index: 15,
    num: 16,
    imgCode: 'LLM-16',
    id: 's16_8bit',
    zh: '端侧智能与随身算力',
    en: 'On-Device NPU & Pocket Intelligence',
    era: '2026',
    gag: '微缩晶圆像素街区里骑手轻跃低功耗脉冲，智能眼镜与掌上芯片弹出离线加速徽章',
    palette: ['#131836', '#facc15', '#38bdf8', '#f472b6', '#312e81'],
    frameColor: '#312e81',
    frameAccent: '#facc15',
    frameStyle: 'chip',
    quantizeHz: 15,
  },
  {
    index: 16,
    num: 17,
    imgCode: 'LLM-17',
    id: 's17_chat',
    zh: 'AI4Science 科学新范式',
    en: 'AlphaFold · Materials & Fusion Control',
    era: '2026+',
    gag: '蛋白质折叠彩带、新型晶体点阵与磁约束聚变等离子环在深空实验室同步解锁',
    palette: ['#071622', '#22d3ee', '#a3e635', '#f472b6', '#0e7490'],
    frameColor: '#155e75',
    frameAccent: '#a3e635',
    frameStyle: 'science',
  },
  {
    index: 17,
    num: 18,
    imgCode: 'LLM-18',
    id: 's18_vaporwave',
    zh: '交互式物理世界模型',
    en: 'Generative Interactive World Models',
    era: '2026+',
    gag: '神经场实时推演三维重力网格、流体折射与刚体碰撞，骑手所经之处万物即时生成',
    palette: ['#180828', '#e879f9', '#22d3ee', '#818cf8', '#fae8ff'],
    frameColor: '#6b21a8',
    frameAccent: '#22d3ee',
    frameStyle: 'holo',
  },
  {
    index: 18,
    num: 19,
    imgCode: 'LLM-19',
    id: 's19_shortvideo',
    zh: '具身智能走入现实',
    en: 'Embodied Physical AI · 9:16 Vision Feed',
    era: '2027+',
    gag: '丝绒幕布收拢为具身机器人第一视角竖屏，三维语义框精准感知街景并与骑手击掌',
    palette: ['#0b0f17', '#fb7185', '#2dd4bf', '#ffffff', '#1e293b'],
    frameColor: '#1e293b',
    frameAccent: '#2dd4bf',
    frameStyle: 'vision_9_16',
    cameraMode: 'vertical_9_16',
  },
  {
    index: 19,
    num: 20,
    imgCode: 'LLM-20',
    id: 's20_code',
    zh: '自我演进与通用智能黎明',
    en: 'Self-Evolving Pure Code & AGI Horizon',
    era: 'AGI 纪元',
    gag: '复数傅里叶本轮与实时自演化代码共同勾勒硅基骑手，化作通往通用智能的璀璨星门',
    palette: ['#070b14', '#60a5fa', '#c084fc', '#fbbf24', '#f8fafc'],
    frameColor: '#1e293b',
    frameAccent: '#60a5fa',
    frameStyle: 'oled',
  },
].map((s, idx) => ({
  ...s,
  t0: INTRO_SEC + idx * SCENE_SEC,
  t1: INTRO_SEC + (idx + 1) * SCENE_SEC,
  worldX0: idx * PANEL_SIZE,
  worldX1: (idx + 1) * PANEL_SIZE,
}));

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function smootherstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function quantizeTime(t, hz = 10) {
  if (!hz || hz <= 0) return t;
  return Math.floor(t * hz + 1e-6) / hz;
}

export function getBeatState(rawCanonicalT) {
  const t = clamp(rawCanonicalT, 0, TOTAL_DURATION);
  const globalBeat = t / BEAT_SEC;
  const beatIndex = Math.floor(globalBeat + 1e-7);
  const beatFrac = globalBeat - beatIndex;
  const pedalAngle = globalBeat * Math.PI;

  let section = 'scenes';
  let sceneIndex = -1;
  let scene = null;
  let localT = 0;
  let barInScene = 0;
  let beatInScene = 0;

  if (t < INTRO_SEC) {
    section = 'intro';
    localT = t;
  } else if (t < INTRO_SEC + SCENES_TOTAL_SEC) {
    section = 'scenes';
    const st = t - INTRO_SEC;
    sceneIndex = clamp(Math.floor(st / SCENE_SEC), 0, NUM_SCENES - 1);
    scene = SCENES[sceneIndex];
    localT = st - sceneIndex * SCENE_SEC;
    beatInScene = localT / BEAT_SEC;
    barInScene = clamp(Math.floor(localT / BAR_SEC), 0, 2);
  } else {
    section = 'outro';
    localT = t - (INTRO_SEC + SCENES_TOTAL_SEC);
  }

  return {
    t,
    globalBeat,
    beatIndex,
    beatFrac,
    isStrongBeat: beatIndex % 2 === 0,
    isBarDownbeat: section === 'scenes' ? Math.floor(beatInScene + 1e-6) % 4 === 0 : beatIndex % 4 === 0,
    pedalAngle,
    section,
    sceneIndex,
    scene,
    localT,
    barInScene,
    beatInScene,
  };
}

export function getSceneProgress(scene, localT) {
  const s = clamp(localT / SCENE_SEC, 0, 1);
  if (!scene || scene.motionProfile !== 'freeze_bar2') {
    return { u: s, speedScale: 1.0, pedalPhaseOffset: 0 };
  }
  const plateauCenter = 0.5;
  const plateauStrength = 0.72;
  const env = Math.exp(-Math.pow((s - plateauCenter) / 0.14, 2));
  const detour = -0.085 * Math.sin(2 * Math.PI * s) * smoothstep(0.05, 0.22, s) * smoothstep(0.95, 0.78, s);
  const u = clamp(s + detour, 0, 1);
  const speedScale = clamp(1 - plateauStrength * env, 0.15, 1.45);
  const pedalPhaseOffset =
    -1.45 *
    Math.sin(Math.PI * clamp((localT - 1.5) / 3.0, 0, 1)) *
    smoothstep(1.5, 2.1, localT) *
    smoothstep(4.5, 3.9, localT);
  return { u, speedScale, pedalPhaseOffset };
}

export function getPelicanWorldState(canonicalT) {
  if (canonicalT < INTRO_SEC) {
    const tStart = 3.2;
    const dur = INTRO_SEC - tStart;
    const s = clamp((canonicalT - tStart) / dur, 0, 1);
    const s2 = s * s;
    const s3 = s2 * s;
    const s4 = s2 * s2;
    const speedScale = s2 * (3 - 2 * s);
    const mX = (PANEL_SIZE / SCENE_SEC) * dur;
    const worldX = mX * (-0.5 + s3 - 0.5 * s4);
    const endTheta = (INTRO_SEC / BEAT_SEC) * Math.PI;
    const mTheta = (Math.PI / BEAT_SEC) * dur;
    const pedalAngle = endTheta + mTheta * (-0.5 + s3 - 0.5 * s4);
    return { visibleInScroll: canonicalT >= tStart, worldX, speedScale, pedalAngle };
  }

  if (canonicalT < INTRO_SEC + SCENES_TOTAL_SEC) {
    const st = canonicalT - INTRO_SEC;
    const idx = clamp(Math.floor(st / SCENE_SEC), 0, NUM_SCENES - 1);
    const localT = st - idx * SCENE_SEC;
    const scene = SCENES[idx];
    const { u, speedScale, pedalPhaseOffset } = getSceneProgress(scene, localT);
    return {
      visibleInScroll: true,
      worldX: idx * PANEL_SIZE + u * PANEL_SIZE,
      speedScale,
      pedalAngle: (canonicalT / BEAT_SEC) * Math.PI + pedalPhaseOffset,
    };
  }

  const outroElapsed = canonicalT - (INTRO_SEC + SCENES_TOTAL_SEC);
  return {
    visibleInScroll: outroElapsed < 1.0,
    worldX: NUM_SCENES * PANEL_SIZE + (outroElapsed / SCENE_SEC) * PANEL_SIZE,
    speedScale: 1.0,
    pedalAngle: (canonicalT / BEAT_SEC) * Math.PI,
  };
}
