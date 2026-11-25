// Warung Rush — tiny synthesised sounds. No audio files are shipped:
// every effect is a short WebAudio oscillator or noise burst, built on the
// first user gesture so browsers never block it.

let audioCtx = null;

export function ensureAudio() {
  if (!audioCtx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    } catch (err) {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function tone(freq, seconds, type, volume, when) {
  if (!audioCtx) return;
  const start = audioCtx.currentTime + (when || 0);
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume || 0.12, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + seconds + 0.02);
}

function noiseBurst(seconds, volume, filterFreq) {
  if (!audioCtx) return;
  const length = Math.floor(audioCtx.sampleRate * seconds);
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq || 3000;
  const gain = audioCtx.createGain();
  gain.gain.value = volume || 0.1;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

export function playClick(muted) {
  if (muted || !audioCtx) return;
  tone(660, 0.06, 'square', 0.06);
}

export function playAdd(muted) {
  if (muted || !audioCtx) return;
  tone(520, 0.07, 'triangle', 0.1);
  tone(780, 0.08, 'triangle', 0.08, 0.05);
}

export function playSizzle(muted) {
  if (muted || !audioCtx) return;
  noiseBurst(0.35, 0.12, 4200);
}

export function playDing(muted) {
  if (muted || !audioCtx) return;
  tone(880, 0.12, 'sine', 0.12);
  tone(1318, 0.18, 'sine', 0.1, 0.1);
}

export function playLevelUp(muted) {
  if (muted || !audioCtx) return;
  tone(523, 0.1, 'triangle', 0.1);
  tone(659, 0.1, 'triangle', 0.1, 0.08);
  tone(784, 0.16, 'triangle', 0.12, 0.16);
}

export function playBuzzer(muted) {
  if (muted || !audioCtx) return;
  tone(180, 0.25, 'sawtooth', 0.1);
  tone(140, 0.3, 'sawtooth', 0.1, 0.12);
}

export function playBurn(muted) {
  if (muted || !audioCtx) return;
  noiseBurst(0.5, 0.14, 900);
  tone(220, 0.3, 'sawtooth', 0.08, 0.05);
}
