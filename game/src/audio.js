// Warung Rush — audio.js
// One job: every sound the game makes, synthesized live with WebAudio.
// No audio files, no network — a tiny synth per effect.

let audioCtx = null;

function ctx() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur, type, vol, slideTo) {
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
  gain.gain.setValueAtTime(vol || 0.15, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur);
}

function noise(dur, vol, freq) {
  const ac = ctx();
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq || 1200;
  const gain = ac.createGain();
  gain.gain.value = vol || 0.2;
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start();
}

export const sounds = {
  click() { tone(700, 0.06, 'triangle', 0.12); },
  chop() { noise(0.09, 0.25, 900); tone(180, 0.08, 'square', 0.08); },
  sizzle() { noise(0.5, 0.12, 3200); },
  ding() { tone(880, 0.25, 'sine', 0.18); tone(1320, 0.3, 'sine', 0.12); },
  coin() { tone(988, 0.09, 'square', 0.12); setTimeout(() => tone(1319, 0.16, 'square', 0.12), 70); },
  fail() { tone(220, 0.3, 'sawtooth', 0.12, 110); },
  levelUp() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.15), i * 90)); },
  burn() { noise(0.4, 0.2, 300); tone(150, 0.4, 'sawtooth', 0.1, 60); },
};
