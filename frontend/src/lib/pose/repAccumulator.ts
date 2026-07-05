/**
 * Accumulates per-rep quality data and live form cues during a set.
 *
 * The pose hook calls `push` once per detected frame with the current tracked
 * angle, a symmetry reading, and the frame. The accumulator tracks the current
 * rep's min/max angle, duration, and jitter, and finalizes a RepRecord when a
 * rep completes (detected by the angle returning to the extended position).
 */
import { type RepPhase } from "@/lib/pose/angles";
import { evaluateForm, type FormCue } from "@/lib/pose/formRules";
import { type RepRecord } from "@/lib/pose/quality";
import type { PoseFrame } from "@/lib/pose/types";

interface CurrentRep {
  minAngle: number;
  maxAngle: number;
  startMs: number;
  symmetrySum: number;
  jitterSum: number;
  samples: number;
  lastAngle: number;
}

export class RepAccumulator {
  private exerciseId: string;
  private records: RepRecord[] = [];
  private current: CurrentRep | null = null;
  private lastCues: FormCue[] = [];

  constructor(exerciseId: string) {
    this.exerciseId = exerciseId;
  }

  reset(): void {
    this.records = [];
    this.current = null;
    this.lastCues = [];
  }

  getRecords(): RepRecord[] {
    return this.records;
  }

  getCues(): FormCue[] {
    return this.lastCues;
  }

  /**
   * Feed one frame. `angle` is the tracked joint angle (or null), `symmetry`
   * the |left-right| angle difference in degrees. `phaseChange` signals when
   * the rep state machine completed a rep (down->up transition).
   */
  push(
    frame: PoseFrame,
    angle: number | null,
    symmetry: number,
    phase: RepPhase,
    repCompleted: boolean,
    nowMs: number,
  ): void {
    // Live form cues from the current frame.
    this.lastCues = evaluateForm(this.exerciseId, frame);

    if (angle === null) return;

    // Start a new rep window when we enter the "down" phase.
    if (phase === "down" && this.current === null) {
      this.current = {
        minAngle: angle,
        maxAngle: angle,
        startMs: nowMs,
        symmetrySum: symmetry,
        jitterSum: 0,
        samples: 1,
        lastAngle: angle,
      };
      return;
    }

    if (this.current) {
      this.current.minAngle = Math.min(this.current.minAngle, angle);
      this.current.maxAngle = Math.max(this.current.maxAngle, angle);
      this.current.symmetrySum += symmetry;
      this.current.jitterSum += Math.abs(angle - this.current.lastAngle);
      this.current.samples += 1;
      this.current.lastAngle = angle;
    }

    // Finalize the rep when the state machine says one completed.
    if (repCompleted && this.current) {
      const c = this.current;
      this.records.push({
        bottomAngle: c.minAngle,
        topAngle: c.maxAngle,
        durationMs: Math.max(1, nowMs - c.startMs),
        meanSymmetry: c.symmetrySum / c.samples,
        meanJitter: c.jitterSum / c.samples,
      });
      this.current = null;
    }
  }
}
