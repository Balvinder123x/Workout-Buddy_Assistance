/**
 * Exercise quality scoring.
 *
 * The 0-100 quality score is a CONSTRUCTED composite of measurable
 * sub-components, not a learned regression target (there's no ground-truth
 * "quality" dataset to train against). Every sub-score is computed from pose
 * geometry accumulated over a set, so each one is explainable:
 *
 *   - ROM        depth/range each rep reaches vs. the ideal for the exercise
 *   - Tempo      consistency of rep duration (steady tempo scores higher)
 *   - Symmetry   left/right joint-angle balance
 *   - Stability  low frame-to-frame jitter in the tracked joint
 *
 * The overall score is a weighted mean of the sub-scores.
 */

export interface QualitySubScores {
  rom: number;
  tempo: number;
  symmetry: number;
  stability: number;
}

export interface QualityScore extends QualitySubScores {
  overall: number;
}

/** A per-rep record the accumulator collects during a set. */
export interface RepRecord {
  bottomAngle: number; // deepest tracked angle reached in the rep
  topAngle: number; // most-extended angle in the rep
  durationMs: number;
  meanSymmetry: number; // mean |left-right| angle diff during the rep (deg)
  meanJitter: number; // mean frame-to-frame angle change (deg)
}

/** Ideal bottom angle (deepest) per exercise for full ROM. */
const IDEAL_BOTTOM: Record<string, number> = {
  squat: 80,
  lunge: 90,
  pushup: 80,
  curl: 45,
  "shoulder-press": 90, // racked position before pressing
};

function clamp(v: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Score a set of reps into sub-scores + overall. */
export function scoreSet(
  exerciseId: string,
  reps: RepRecord[],
): QualityScore {
  if (reps.length === 0) {
    return { rom: 0, tempo: 0, symmetry: 0, stability: 0, overall: 0 };
  }

  const idealBottom = IDEAL_BOTTOM[exerciseId] ?? 90;

  // ROM: how close each rep's depth gets to the ideal. Reaching or exceeding
  // the ideal scores 100; falling short scales down.
  const romScores = reps.map((r) => {
    const reached = Math.max(0, r.topAngle - r.bottomAngle);
    const ideal = Math.max(1, r.topAngle - idealBottom);
    return clamp((reached / ideal) * 100);
  });
  const rom = avg(romScores);

  // Tempo: consistency of rep duration. Lower coefficient of variation = better.
  const durations = reps.map((r) => r.durationMs);
  const meanDur = avg(durations);
  const sd = Math.sqrt(
    avg(durations.map((d) => (d - meanDur) ** 2)),
  );
  const cv = meanDur > 0 ? sd / meanDur : 1;
  const tempo = clamp(100 - cv * 120);

  // Symmetry: smaller mean left/right angle difference = better.
  const symmetry = clamp(
    100 - avg(reps.map((r) => r.meanSymmetry)) * 2.5,
  );

  // Stability: less jitter = better.
  const stability = clamp(
    100 - avg(reps.map((r) => r.meanJitter)) * 4,
  );

  const overall = clamp(
    rom * 0.4 + tempo * 0.2 + symmetry * 0.2 + stability * 0.2,
  );

  return {
    rom: Math.round(rom),
    tempo: Math.round(tempo),
    symmetry: Math.round(symmetry),
    stability: Math.round(stability),
    overall: Math.round(overall),
  };
}

function avg(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((s, v) => s + v, 0) / xs.length;
}
