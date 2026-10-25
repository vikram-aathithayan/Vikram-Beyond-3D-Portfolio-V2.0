"use client";

import { useSyncExternalStore } from "react";
import { profile } from "@/data/profile";

// Plays Vikram's spoken intro. Sources, best first:
//   1. his own recording (profile.introAudio), with a real audio-level analyser
//   2. the most natural neural voice the visitor's browser offers
//   3. timed captions only, where speech synthesis is missing
// The DOM subscribes to the store; visuals read `level` every frame instead,
// so audio level changes don't re-render React.

type State = {
  caption: string;
  /** A sentence is being voiced right now (drives the loudness envelope). */
  speaking: boolean;
  playing: boolean;
  paused: boolean;
  /** Index of the sentence being spoken, and of the word within it (-1 before the first). */
  sentence: number;
  word: number;
  /** 0..1 through the whole intro. */
  progress: number;
  /** Name of the voice in use, e.g. "Vikram's own voice" or "Microsoft Prabhat Online (Natural)". */
  voice: string;
};

const state: State = { caption: "", speaking: false, playing: false, paused: false, sentence: -1, word: -1, progress: 0, voice: "" };

/** Loudness 0..1, updated every animation frame while the intro plays. */
export const level = { value: 0 };

const listeners = new Set<() => void>();
let snapshot = { ...state };

function set(patch: Partial<State>) {
  Object.assign(state, patch);
  snapshot = { ...state };
  listeners.forEach((l) => l());
}

export function useIntro() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
    () => snapshot,
  );
}

export const sentences = profile.intro.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [profile.intro];
export const sentenceWords = sentences.map((s) => s.split(/\s+/));
const totalChars = sentences.reduce((n, s) => n + s.length + 1, 0);
const sentenceStart = sentences.map((_, i) => sentences.slice(0, i).reduce((n, s) => n + s.length + 1, 0));

/** Which sentence and word sit at a character offset into the whole intro. */
function locate(charPos: number) {
  let si = sentences.length - 1;
  for (let i = 0; i < sentences.length; i++) {
    if (charPos < sentenceStart[i] + sentences[i].length + 1) {
      si = i;
      break;
    }
  }
  const within = charPos - sentenceStart[si];
  let wi = -1;
  let c = 0;
  for (const [j, w] of sentenceWords[si].entries()) {
    if (within >= c) wi = j;
    c += w.length + 1;
  }
  return { si, wi };
}

// Every run gets an id so callbacks from a cancelled run can't touch the next one.
let session = 0;
let timers: number[] = [];
let raf = 0;
let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
/** Which source the current run uses; decides how pause works. */
let mode: "audio" | "voice" | "captions" | null = null;

function reset() {
  session++;
  timers.forEach((t) => window.clearTimeout(t));
  timers = [];
  cancelAnimationFrame(raf);
  // Chrome keeps the speech queue paused across cancel() unless it's resumed first.
  window.speechSynthesis?.resume();
  window.speechSynthesis?.cancel();
  if (audio) {
    audio.pause();
    audio = null;
  }
  level.value = 0;
  mode = null;
}

function at(ms: number, fn: () => void, id = session) {
  timers.push(window.setTimeout(() => id === session && fn(), ms));
}

/** End of a run: stop every loop and return the store to idle. */
function settle(id: number) {
  at(
    0,
    () => {
      cancelAnimationFrame(raf);
      level.value = 0;
      mode = null;
      set({ speaking: false, playing: false, paused: false, caption: "", sentence: -1, word: -1, progress: 0 });
    },
    id,
  );
}

const NATURAL = /natural|neural|online/i;
const MALE = /prabhat|andrew|brian|guy|christopher|eric|roger|steffan|ryan|thomas|william|liam|connor|mitchell|male/i;

function pickVoice() {
  const english = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  const prefer: ((v: SpeechSynthesisVoice) => boolean)[] = [
    (v) => /prabhat/i.test(v.name) && NATURAL.test(v.name),
    (v) => v.lang === "en-IN" && NATURAL.test(v.name) && MALE.test(v.name),
    (v) => NATURAL.test(v.name) && MALE.test(v.name),
    (v) => /google uk english male/i.test(v.name),
    (v) => NATURAL.test(v.name),
    (v) => /prabhat|ravi|hemant/i.test(v.name),
    (v) => v.lang === "en-IN",
    (v) => /david|mark|daniel|google us english/i.test(v.name),
  ];
  for (const test of prefer) {
    const hit = english.find(test);
    if (hit) return hit;
  }
  return english[0];
}

/** His own recording: true loudness from an analyser, words placed by time. */
function playRecording(src: string, id: number) {
  mode = "audio";
  const a = new Audio(src);
  audio = a;
  // A broken file fires both onerror and the play() rejection; fall back only once.
  let fellBack = false;
  const fallback = () => {
    if (fellBack || id !== session) return;
    fellBack = true;
    audio = null;
    playVoice(id);
  };
  let analyser: AnalyserNode | null = null;
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
    const node = ctx.createMediaElementSource(a);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    node.connect(analyser);
    analyser.connect(ctx.destination);
  } catch {
    analyser = null;
  }
  const buf = new Uint8Array(128);
  const loop = () => {
    if (id !== session) return;
    if (analyser) {
      analyser.getByteFrequencyData(buf);
      let sum = 0;
      for (let i = 2; i < 48; i++) sum += buf[i];
      level.value = Math.min(1, sum / (46 * 150));
    }
    if (a.duration) {
      const p = a.currentTime / a.duration;
      const { si, wi } = locate(p * totalChars);
      if (si !== state.sentence || wi !== state.word || Math.abs(p - state.progress) > 0.01) {
        set({ progress: p, sentence: si, word: wi, caption: sentences[si] });
      }
    }
    raf = requestAnimationFrame(loop);
  };
  a.onended = () => id === session && settle(id);
  a.onerror = fallback;
  set({ voice: "Vikram's own voice" });
  a.play()
    .then(() => {
      if (id === session) raf = requestAnimationFrame(loop);
    })
    .catch(fallback);
}

/** Browser speech: word boundaries drive the highlight and accents in loudness. */
function playVoice(id: number) {
  const synth = window.speechSynthesis;
  if (!synth) return captionsOnly(id);
  mode = "voice";

  const voice = pickVoice();
  set({ voice: voice?.name ?? "Browser voice" });
  let started = false;
  let pulse = 0;
  let last = performance.now();
  const loop = (now: number) => {
    if (id !== session) return;
    const dt = (now - last) / 1000;
    last = now;
    pulse = Math.max(0, pulse - dt * 3);
    // Speech has a syllable rhythm of ~5 per second; word boundaries add accents.
    const t = now / 1000;
    const syllables = Math.abs(Math.sin(t * 15.7) * Math.sin(t * 4.3 + 1));
    level.value = state.speaking && !state.paused ? Math.min(1, 0.22 + syllables * 0.5 + pulse * 0.35) : 0;
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  // Some browsers expose speechSynthesis but never speak; fall back after 2.5 s.
  at(2500, () => {
    if (started) return;
    synth.cancel();
    captionsOnly(id);
  });

  sentences.forEach((s, i) => {
    const u = new SpeechSynthesisUtterance(s);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "en-IN";
    u.rate = NATURAL.test(voice?.name ?? "") ? 1 : 0.95;
    u.onstart = () => {
      if (id !== session) return;
      started = true;
      set({ caption: s, sentence: i, word: 0, speaking: true, progress: sentenceStart[i] / totalChars });
      pulse = 1;
    };
    u.onboundary = (e) => {
      if (id !== session || e.name === "sentence") return;
      const { wi } = locate(sentenceStart[i] + e.charIndex);
      set({ word: wi, progress: (sentenceStart[i] + e.charIndex) / totalChars });
      pulse = 1;
    };
    u.onend = () => {
      if (id !== session) return;
      set({ word: sentenceWords[i].length, speaking: false });
      if (i === sentences.length - 1) settle(id);
    };
    u.onerror = (e) => {
      if (id !== session || e.error === "interrupted" || e.error === "canceled") return;
      settle(id);
    };
    synth.speak(u);
  });
}

/** No speech at all: step through the words on a timer that honours pause. */
function captionsOnly(id: number) {
  cancelAnimationFrame(raf);
  mode = "captions";
  set({ voice: "Captions" });
  const steps = sentences.flatMap((_, i) =>
    sentenceWords[i].map((__, w) => ({ i, w, gap: w === sentenceWords[i].length - 1 ? 680 : 330 })),
  );
  let n = 0;
  const step = () => {
    if (state.paused) return at(150, step, id);
    if (n >= steps.length) return settle(id);
    const { i, w, gap } = steps[n++];
    const offset = sentenceStart[i] + sentences[i].indexOf(sentenceWords[i][w]);
    set({ caption: sentences[i], sentence: i, word: w, progress: offset / totalChars });
    level.value = 0.6;
    at(140, () => (level.value = 0.25), id);
    at(gap, step, id);
  };
  step();
}

export function playIntro() {
  reset();
  const id = session;
  set({ playing: true, paused: false, caption: sentences[0], sentence: 0, word: -1, progress: 0 });
  if (profile.introAudio) playRecording(profile.introAudio, id);
  else playVoice(id);
}

/** Pause or resume, whichever source is playing. */
export function togglePause() {
  if (!state.playing) return;
  const pausing = !state.paused;
  if (mode === "audio" && audio) {
    if (pausing) audio.pause();
    else void audio.play();
  } else if (mode === "voice") {
    if (pausing) window.speechSynthesis.pause();
    else window.speechSynthesis.resume();
  }
  // Captions-only mode checks `paused` before every step.
  set({ paused: pausing });
}

export function stopIntro() {
  if (!state.playing) return;
  reset();
  settle(session);
}
