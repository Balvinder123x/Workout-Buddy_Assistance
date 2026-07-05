/**
 * Voice feedback via the browser's Web Speech API (SpeechSynthesis).
 *
 * Throttled so cues don't overlap or nag: the same message won't repeat within
 * a cooldown window, and speech is skipped while a previous utterance is still
 * playing. No external service — this is a built-in browser capability.
 */
let lastSpoken = "";
let lastSpokenAt = 0;
const COOLDOWN_MS = 4000;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(message: string, enabled: boolean): void {
  if (!enabled || !isSpeechSupported()) return;

  const now = Date.now();
  // Don't repeat the same cue too often, and don't talk over ourselves.
  if (message === lastSpoken && now - lastSpokenAt < COOLDOWN_MS) return;
  if (window.speechSynthesis.speaking) return;

  lastSpoken = message;
  lastSpokenAt = now;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1.05;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
