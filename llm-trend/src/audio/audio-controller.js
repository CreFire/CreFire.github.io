// src/audio/audio-controller.js
// 100% Pure-Code Real-Time 48kHz Stereo Synthesizer (`silicon-emergence-synth`)
// Zero external audio files, zero LZMA blobs: synthesizes 5 musical acts across 146.0s @ 120 BPM
// (FM Silicon Forge Anvil, Analog SVF Bass, Lush Stereo SuperSaw Pad, Token Arpeggiator,
// Cybernetic Lead Melody, Electronic Kick/Snare/Hat & Stereo Hall Delay/Reverb) inside an AudioWorklet!

const WORKLET_CODE = `
const BPM = 120;
const BEAT_SEC = 0.5;
const SIXTEENTH_SEC = 0.125;
const TAU = Math.PI * 2;

function midiToHz(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

// Progression table by 4-bar phrase or section:
// Returns { root, chord: [midi...],arp: [midi...], scale: [midi offsets] }
function getHarmonyAt(t) {
  // Intro (0..10s): D pedal mysterious -> awakening
  if (t < 10.0) {
    if (t < 3.6) {
      return { bass: 38, chord: [50, 57, 62, 69], arp: [62, 69, 74, 76] };
    }
    const bar = Math.floor((t - 3.6) / 1.6) % 4;
    const prog = [
      { bass: 38, chord: [50, 57, 62, 65], arp: [62, 65, 69, 74] }, // Dm
      { bass: 34, chord: [46, 53, 58, 62], arp: [58, 62, 65, 70] }, // Bb
      { bass: 41, chord: [53, 57, 60, 65], arp: [60, 65, 69, 72] }, // F
      { bass: 33, chord: [45, 52, 57, 61], arp: [57, 61, 64, 69] }, // A
    ];
    return prog[bar];
  }

  // Outro (130..146s): Warm celestial Dmaj9 resolution
  if (t >= 130.0) {
    const sub = Math.floor((t - 130.0) / 4.0) % 4;
    const outroProg = [
      { bass: 38, chord: [50, 57, 62, 66, 69], arp: [62, 66, 69, 73] }, // Dmaj7
      { bass: 35, chord: [47, 54, 59, 62, 66], arp: [59, 62, 66, 69] }, // Bm7
      { bass: 43, chord: [43, 50, 55, 59, 66], arp: [55, 59, 62, 66] }, // Gmaj7
      { bass: 33, chord: [45, 52, 57, 62, 64], arp: [57, 62, 64, 69] }, // Asus4 -> A
    ];
    return outroProg[sub];
  }

  const st = t - 10.0; // 0..120s across 20 scenes (6s = 3 bars each, or 2s per bar)
  const bar = Math.floor(st / 2.0) % 4;

  // Act IV (100..130s, Scenes 16-20): Key lift +2 semitones (E minor / D -> G -> Bm -> A / F#m -> D -> A -> E)
  if (t >= 100.0) {
    const climaxProg = [
      { bass: 42, chord: [54, 57, 61, 66], arp: [66, 69, 73, 78] }, // F#m
      { bass: 38, chord: [50, 57, 62, 66], arp: [62, 66, 69, 74] }, // D
      { bass: 33, chord: [45, 52, 57, 61], arp: [61, 64, 69, 73] }, // A
      { bass: 40, chord: [52, 56, 59, 64], arp: [64, 68, 71, 76] }, // E
    ];
    return climaxProg[bar];
  }

  // Act II (40..70s): Uplifting Bb -> C -> Dm -> F
  if (t >= 40.0 && t < 70.0) {
    const act2Prog = [
      { bass: 34, chord: [46, 53, 58, 62], arp: [62, 65, 70, 74] }, // Bb
      { bass: 36, chord: [48, 55, 60, 64], arp: [60, 64, 67, 72] }, // C
      { bass: 38, chord: [50, 57, 62, 65], arp: [62, 65, 69, 74] }, // Dm
      { bass: 41, chord: [53, 57, 60, 65], arp: [65, 69, 72, 77] }, // F
    ];
    return act2Prog[bar];
  }

  // Act I (10..40s) & Act III (70..100s): Heroic Dm -> Bb -> F -> C
  const heroProg = [
    { bass: 38, chord: [50, 57, 62, 65], arp: [62, 65, 69, 74] }, // Dm
    { bass: 34, chord: [46, 53, 58, 62], arp: [58, 62, 65, 70] }, // Bb
    { bass: 41, chord: [53, 57, 60, 65], arp: [60, 65, 69, 72] }, // F
    { bass: 36, chord: [48, 55, 60, 64], arp: [60, 64, 67, 72] }, // C
  ];
  return heroProg[bar];
}

// Memorable cybernetic lead melody phrases indexed by 16th-note step in a 4-bar (64-step) cycle
const LEAD_MOTIF_A = [
  74, -1, -1, 74,  77, -1, 76, -1,  74, -1, 69, -1,  -1, -1, 65, 69,
  70, -1, -1, 70,  74, -1, 72, -1,  69, -1, -1, -1,  -1, -1, -1, -1,
  72, -1, -1, 72,  77, -1, 76, -1,  72, -1, 69, -1,  65, -1, 69, -1,
  67, -1, 72, -1,  76, -1, 74, -1,  72, -1, -1, -1,  -1, -1, -1, -1,
];

const LEAD_MOTIF_CLIMAX = [
  78, -1, 81, -1,  85, -1, 81, -1,  78, -1, 73, -1,  76, -1, 78, -1,
  74, -1, 78, -1,  81, -1, 86, -1,  85, -1, -1, -1,  -1, -1, 81, 85,
  81, -1, 76, -1,  73, -1, 76, -1,  81, -1, 85, -1,  88, -1, 85, -1,
  83, -1, 80, -1,  76, -1, 80, -1,  83, -1, -1, -1,  -1, -1, -1, -1,
];

function polyBlep(t, dt) {
  if (t < dt) {
    const u = t / dt;
    return u + u - u * u - 1.0;
  } else if (t > 1.0 - dt) {
    const u = (t - 1.0) / dt;
    return u * u + u + u + 1.0;
  }
  return 0.0;
}

class SiliconEmergenceSynth extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.duration = options?.processorOptions?.duration || 146.0;
    this.sr = sampleRate || 48000;
    this.running = false;
    this.time = 0;
    this.reportCounter = 0;
    this.lastStepIndex = -1;

    // Oscillator phases
    this.bassPhase = 0;
    this.subPhase = 0;
    this.arpPhase = 0;
    this.leadPhase = 0;
    this.leadPhase2 = 0;
    this.padPhases = [0, 0.17, 0.43, 0.71, 0.89];

    // Envelopes & active frequencies
    this.kickEnv = 0;
    this.kickPhase = 0;
    this.snareEnv = 0;
    this.hatEnv = 0;
    this.anvilEnv = 0;
    this.anvilPhase1 = 0;
    this.anvilPhase2 = 0;
    this.anvilFreq = 587.33;

    this.bassFreq = 73.42;
    this.bassEnv = 0;
    this.bassLp1 = 0;
    this.bassLp2 = 0;

    this.arpFreq = 293.66;
    this.arpEnv = 0;

    this.leadFreq = 587.33;
    this.leadTargetFreq = 587.33;
    this.leadEnv = 0;

    this.noiseState = 0x12345678;

    // Stereo ping-pong delay buffers (dotted 8th = 0.375s @ 120 BPM)
    this.delayLenL = Math.floor(0.375 * this.sr);
    this.delayLenR = Math.floor(0.250 * this.sr);
    this.delayBufL = new Float32Array(this.delayLenL);
    this.delayBufR = new Float32Array(this.delayLenR);
    this.delayIdxL = 0;
    this.delayIdxR = 0;

    // Simple lush stereo comb/allpass reverb tail
    this.revLen1 = Math.floor(0.037 * this.sr);
    this.revLen2 = Math.floor(0.043 * this.sr);
    this.revBuf1 = new Float32Array(this.revLen1);
    this.revBuf2 = new Float32Array(this.revLen2);
    this.revIdx1 = 0;
    this.revIdx2 = 0;

    this.port.onmessage = ({ data }) => {
      if (!data) return;
      if (data.type === 'play') {
        this.running = true;
      } else if (data.type === 'pause') {
        this.running = false;
      } else if (data.type === 'seek') {
        this.time = Math.max(0, Math.min(this.duration, Number(data.time) || 0));
        this.lastStepIndex = -1;
      }
    };
  }

  nextNoise() {
    let x = this.noiseState;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.noiseState = x;
    return (x | 0) / 2147483648;
  }

  triggerStep(stepIdx, t) {
    const stepInBar = ((stepIdx % 16) + 16) % 16;
    const harm = getHarmonyAt(t);

    // 1. Intro Silicon Forge Metallic Anvil Strikes (0..3.6s) + Scene-boundary Accent Chimes
    if (t < 3.6) {
      if (stepInBar % 4 === 1) {
        this.anvilEnv = 1.0;
        this.anvilFreq = stepInBar === 1 ? 587.33 : 880.0;
      }
    } else if (t >= 10.0 && t < 130.0) {
      // Subtle crystal chime at every 6.0s scene boundary (every 48 16th-steps from 10.0s)
      const sceneStep = stepIdx - 80;
      if (sceneStep >= 0 && sceneStep % 48 === 0) {
        this.anvilEnv = 0.55;
        this.anvilFreq = t >= 100.0 ? 1108.73 : 880.0;
      }
    } else if (t >= 130.0 && stepInBar === 0 && Math.floor(t / 2) % 2 === 0) {
      this.anvilEnv = 0.35;
      this.anvilFreq = 1174.66;
    }

    // 2. Drums (Kick, Snare, Hi-Hat)
    if (t >= 3.6 && t < 130.0) {
      const isCoTBreak = t >= 70.0 && t < 74.0;
      if (!isCoTBreak) {
        if (stepInBar % 4 === 0) {
          this.kickEnv = t < 10.0 ? 0.65 : 1.0;
          this.kickPhase = 0;
        } else if (t >= 40.0 && stepInBar === 14) {
          this.kickEnv = 0.55;
          this.kickPhase = 0;
        }
        if (t >= 10.0 && (stepInBar === 4 || stepInBar === 12)) {
          this.snareEnv = t >= 40.0 ? 0.85 : 0.48;
        }
        if (stepInBar % 2 === 1 || (t >= 76.0 && stepInBar % 1 === 0)) {
          this.hatEnv = stepInBar % 4 === 2 ? 0.55 : 0.24;
        }
      } else if (stepInBar === 0) {
        this.kickEnv = 0.5;
        this.kickPhase = 0;
      }
    }

    // 3. Driving 8th/16th Bassline
    if (t >= 3.6 && t < 142.0) {
      if (t >= 130.0) {
        if (stepInBar === 0) {
          this.bassFreq = midiToHz(harm.bass);
          this.bassEnv = 0.65;
        }
      } else if (stepInBar % 2 === 0) {
        const oct = stepInBar % 4 === 2 && t >= 22.0 ? 12 : 0;
        this.bassFreq = midiToHz(harm.bass + oct);
        this.bassEnv = stepInBar % 4 === 0 ? 0.95 : 0.72;
      }
    }

    // 4. 16th-Note Token Arpeggiator
    if (t >= 3.6 && t < 143.0) {
      const arpNotes = harm.arp;
      const note = arpNotes[stepIdx % arpNotes.length] + (t >= 100.0 && stepInBar >= 12 ? 12 : 0);
      this.arpFreq = midiToHz(note);
      this.arpEnv = t >= 130.0 ? 0.35 : 0.68;
    }

    // 5. Cybernetic Lead Melody (active in main acts)
    if (t >= 16.0 && t < 130.0) {
      const motif = t >= 100.0 ? LEAD_MOTIF_CLIMAX : LEAD_MOTIF_A;
      const mStep = ((stepIdx - 80) % 64 + 64) % 64;
      const mNote = motif[mStep];
      if (mNote > 0) {
        const shift = t >= 40.0 && t < 70.0 && mStep < 16 ? 2 : 0;
        this.leadTargetFreq = midiToHz(mNote + shift);
        if (this.leadEnv < 0.08) this.leadFreq = this.leadTargetFreq;
        this.leadEnv = 0.85;
      }
    }
  }

  process(_inputs, outputs) {
    const out = outputs[0];
    if (!out || out.length === 0) return true;
    const outL = out[0];
    const outR = out[1] || out[0];
    const n = outL.length;
    const invSr = 1 / this.sr;

    if (!this.running) {
      outL.fill(0);
      if (outR !== outL) outR.fill(0);
      return true;
    }

    for (let i = 0; i < n; i++) {
      const t = this.time;
      if (t >= this.duration) {
        this.running = false;
        outL[i] = 0;
        if (outR !== outL) outR[i] = 0;
        continue;
      }

      const stepIdx = Math.floor(t / SIXTEENTH_SEC);
      if (stepIdx !== this.lastStepIndex) {
        this.lastStepIndex = stepIdx;
        this.triggerStep(stepIdx, t);
      }

      // Master fade-in & fade-out
      const masterFade =
        Math.min(1, t / 0.12) * Math.min(1, Math.max(0, (this.duration - t) / 2.2));

      // --- Voice 1: Sub-Kick ---
      let kickSig = 0;
      if (this.kickEnv > 0.0005) {
        const kFreq = 46 + 135 * Math.pow(this.kickEnv, 5);
        this.kickPhase = (this.kickPhase + kFreq * invSr) % 1.0;
        kickSig = Math.sin(this.kickPhase * TAU) * this.kickEnv * 0.62;
        this.kickEnv *= 1 - 9.5 * invSr;
      }

      // --- Voice 2: Snare & Brushed Hi-Hat ---
      let percL = 0;
      let percR = 0;
      if (this.snareEnv > 0.0005 || this.hatEnv > 0.0005) {
        const nz = this.nextNoise();
        if (this.snareEnv > 0.0005) {
          const sn = nz * this.snareEnv * 0.24;
          percL += sn;
          percR += sn * 0.92;
          this.snareEnv *= 1 - 14.0 * invSr;
        }
        if (this.hatEnv > 0.0005) {
          const ht = nz * this.hatEnv * 0.11;
          percL += ht * 0.8;
          percR += ht * 1.15;
          this.hatEnv *= 1 - 38.0 * invSr;
        }
      }

      // --- Voice 3: FM Silicon Crystal Anvil / Bell ---
      let anvilSig = 0;
      if (this.anvilEnv > 0.0004) {
        const f1 = this.anvilFreq;
        const f2 = f1 * 2.756; // Inharmonic metallic crystal ratio
        this.anvilPhase1 = (this.anvilPhase1 + f1 * invSr) % 1.0;
        this.anvilPhase2 = (this.anvilPhase2 + f2 * invSr) % 1.0;
        const mod = Math.sin(this.anvilPhase2 * TAU) * this.anvilEnv * 2.4;
        anvilSig = Math.sin(this.anvilPhase1 * TAU + mod) * this.anvilEnv * 0.26;
        this.anvilEnv *= 1 - 4.8 * invSr;
      }

      // --- Voice 4: Analog PolyBLEP Saw + Sub Bass with 2-Pole SVF Lowpass ---
      let bassSig = 0;
      if (this.bassEnv > 0.0005 || t < 3.8) {
        const bf = t < 3.6 ? 36.71 : this.bassFreq;
        const dt = bf * invSr;
        this.bassPhase = (this.bassPhase + dt) % 1.0;
        this.subPhase = (this.subPhase + dt * 0.5) % 1.0;
        let saw = 2.0 * this.bassPhase - 1.0 - polyBlep(this.bassPhase, dt);
        const sub = Math.sin(this.subPhase * TAU);
        const env = t < 3.6 ? Math.min(0.65, t * 0.24) : this.bassEnv;
        const cutoff = Math.min(0.42, (160 + 1350 * env * env) * invSr * 2.0);
        this.bassLp1 += cutoff * (saw - this.bassLp1);
        this.bassLp2 += cutoff * (this.bassLp1 - this.bassLp2);
        bassSig = (this.bassLp2 * 0.68 + sub * 0.52) * env * 0.34;
        this.bassEnv *= 1 - 6.2 * invSr;
      }

      // --- Voice 5: Token Pluck Arpeggiator ---
      let arpL = 0;
      let arpR = 0;
      if (this.arpEnv > 0.0005) {
        const dt = this.arpFreq * invSr;
        this.arpPhase = (this.arpPhase + dt) % 1.0;
        const tri = 1.0 - 4.0 * Math.abs(Math.round(this.arpPhase - 0.25) - (this.arpPhase - 0.25));
        const saw = 2.0 * this.arpPhase - 1.0 - polyBlep(this.arpPhase, dt);
        const sig = (tri * 0.65 + saw * 0.35) * this.arpEnv * 0.14;
        const pan = 0.5 + 0.35 * Math.sin(t * 1.8);
        arpL = sig * (1 - pan * 0.5);
        arpR = sig * (0.5 + pan * 0.5);
        this.arpEnv *= 1 - 11.5 * invSr;
      }

      // --- Voice 6: Lush Stereo Warm Pad ---
      const harm = getHarmonyAt(t);
      const padLevel = t < 3.6 ? 0.06 : t >= 130.0 ? 0.12 : 0.085;
      let padL = 0;
      let padR = 0;
      for (let c = 0; c < 4; c++) {
        const note = harm.chord[c % harm.chord.length];
        const pf = midiToHz(note) * (1 + (c - 1.5) * 0.0018);
        this.padPhases[c] = (this.padPhases[c] + pf * invSr) % 1.0;
        const s = Math.sin(this.padPhases[c] * TAU) + 0.35 * Math.sin(this.padPhases[c] * TAU * 2);
        if (c % 2 === 0) padL += s;
        else padR += s;
      }
      padL *= padLevel * 0.25;
      padR *= padLevel * 0.25;

      // --- Voice 7: Soaring Dual-Oscillator Cybernetic Lead ---
      let leadL = 0;
      let leadR = 0;
      if (this.leadEnv > 0.0005) {
        // Gentle portamento glide
        this.leadFreq += (this.leadTargetFreq - this.leadFreq) * 0.0035;
        const vibrato = 1 + 0.0032 * Math.sin(t * 34.0);
        const dt1 = this.leadFreq * vibrato * invSr;
        const dt2 = dt1 * 1.0045;
        this.leadPhase = (this.leadPhase + dt1) % 1.0;
        this.leadPhase2 = (this.leadPhase2 + dt2) % 1.0;
        const osc1 = 2.0 * this.leadPhase - 1.0 - polyBlep(this.leadPhase, dt1);
        const osc2 = 2.0 * this.leadPhase2 - 1.0 - polyBlep(this.leadPhase2, dt2);
        const lSig = (osc1 + osc2) * 0.5 * this.leadEnv * 0.13;
        leadL = lSig * 0.95;
        leadR = lSig * 1.05;
        this.leadEnv *= 1 - 2.6 * invSr;
      }

      // --- Stereo Ping-Pong Delay & Warm Hall Reverb ---
      const sendL = arpL * 0.65 + leadL * 0.72 + anvilSig * 0.8 + padL * 0.35;
      const sendR = arpR * 0.65 + leadR * 0.72 + anvilSig * 0.8 + padR * 0.35;

      const dL = this.delayBufL[this.delayIdxL];
      const dR = this.delayBufR[this.delayIdxR];
      this.delayBufL[this.delayIdxL] = sendL + dR * 0.36;
      this.delayBufR[this.delayIdxR] = sendR + dL * 0.36;
      this.delayIdxL = (this.delayIdxL + 1) % this.delayLenL;
      this.delayIdxR = (this.delayIdxR + 1) % this.delayLenR;

      const r1 = this.revBuf1[this.revIdx1];
      const r2 = this.revBuf2[this.revIdx2];
      this.revBuf1[this.revIdx1] = (sendL + dL * 0.5) * 0.4 + r2 * 0.52;
      this.revBuf2[this.revIdx2] = (sendR + dR * 0.5) * 0.4 + r1 * 0.52;
      this.revIdx1 = (this.revIdx1 + 1) % this.revLen1;
      this.revIdx2 = (this.revIdx2 + 1) % this.revLen2;

      let mixL = kickSig + bassSig + percL + anvilSig + arpL + padL + leadL + dL * 0.28 + r1 * 0.24;
      let mixR = kickSig + bassSig + percR + anvilSig + arpR + padR + leadR + dR * 0.28 + r2 * 0.24;

      // Soft analog tanh limiter
      mixL = Math.tanh(mixL * 1.15) * masterFade;
      mixR = Math.tanh(mixR * 1.15) * masterFade;

      outL[i] = mixL;
      if (outR !== outL) outR[i] = mixR;

      this.time += invSr;
    }

    this.reportCounter += n;
    if (this.reportCounter >= 768 || !this.running) {
      this.reportCounter = 0;
      this.port.postMessage({ time: this.time, running: this.running });
    }
    return true;
  }
}

registerProcessor('silicon-emergence-synth', SiliconEmergenceSynth);
`;

export class AudioController {
  constructor(manifest, onUpdate) {
    this.manifest = manifest || { duration: 146.0 };
    this.onUpdate = onUpdate;
    this.time = 0;
    this.running = false;
    this.volume = 0.85;
    this.muted = false;
    this.context = null;
    this.master = null;
    this.node = null;
    this.ready = null;
  }

  preload() {
    return Promise.resolve(true);
  }

  async ensureContext() {
    if (!this.context) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioCtx({ sampleRate: 48000, latencyHint: 'playback' });
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(this.context.destination);

      const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      this.ready = this.context.audioWorklet
        .addModule(blobUrl)
        .finally(() => URL.revokeObjectURL(blobUrl));
    }
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    await this.ready;
  }

  async ensureSynth() {
    if (this.node) return;
    this.onLoading?.(true);
    try {
      this.node = new AudioWorkletNode(this.context, 'silicon-emergence-synth', {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        processorOptions: { duration: this.manifest.duration || 146.0 },
      });
      this.node.port.onmessage = ({ data }) => {
        this.time = data.time;
        this.running = data.running;
        this.onUpdate?.(data);
      };
      this.node.connect(this.master);
      this.node.port.postMessage({ type: 'seek', time: this.time });
    } finally {
      this.onLoading?.(false);
    }
  }

  async play() {
    await this.ensureContext();
    const dur = this.manifest.duration || 146.0;
    if (this.time >= dur - 0.05) {
      this.seek(0);
    }
    await this.ensureSynth();
    this.node.port.postMessage({ type: 'seek', time: this.time });
    this.node.port.postMessage({ type: 'play' });
    this.running = true;
    this.onUpdate?.({ time: this.time, running: true });
  }

  pause() {
    this.node?.port.postMessage({ type: 'pause' });
    this.running = false;
    this.onUpdate?.({ time: this.time, running: false });
  }

  seek(time) {
    const dur = this.manifest.duration || 146.0;
    this.time = Math.max(0, Math.min(dur, time));
    this.node?.port.postMessage({ type: 'seek', time: this.time });
    this.onUpdate?.({ time: this.time, running: this.running });
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(
        this.muted ? 0 : this.volume,
        this.context.currentTime,
        0.015
      );
    }
  }
}
