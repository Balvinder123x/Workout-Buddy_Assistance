"""Synthetic pose-sample generator for bootstrapping the classifier.

IMPORTANT — HONESTY NOTE
========================
This generates SYNTHETIC pose landmarks from simple biomechanical models of
each exercise, not recordings of real humans. It exists so the whole training
/ evaluation / export pipeline runs end-to-end today without a camera. The
model trained on this data learns to separate the exercises by their
characteristic joint geometry, which is a real (if idealized) signal.

To train on REAL data instead, use ``record.py`` to capture your own labeled
frames into ``data/poses.csv`` with the same schema, then re-run training. No
other code changes are needed.

Each exercise is modeled as a body posture with the key joints placed at
plausible normalized (x, y) coordinates, swept through the exercise's range of
motion, with Gaussian jitter to emulate detection noise and body variation.
"""
from __future__ import annotations

import numpy as np

from features import CLASSES

# A neutral standing skeleton: 33 landmarks, (x, y). Only the joints used by
# feature extraction are placed carefully; the rest sit at reasonable spots.
_BASE = np.array(
    [
        [0.50, 0.10],  # 0 nose
        [0.48, 0.09],
        [0.49, 0.09],
        [0.51, 0.09],
        [0.52, 0.09],
        [0.47, 0.10],
        [0.53, 0.10],
        [0.46, 0.11],
        [0.54, 0.11],
        [0.48, 0.13],
        [0.52, 0.13],
        [0.42, 0.25],  # 11 left shoulder
        [0.58, 0.25],  # 12 right shoulder
        [0.40, 0.40],  # 13 left elbow
        [0.60, 0.40],  # 14 right elbow
        [0.39, 0.55],  # 15 left wrist
        [0.61, 0.55],  # 16 right wrist
        [0.38, 0.57],
        [0.62, 0.57],
        [0.39, 0.56],
        [0.61, 0.56],
        [0.40, 0.55],
        [0.60, 0.55],
        [0.44, 0.55],  # 23 left hip
        [0.56, 0.55],  # 24 right hip
        [0.43, 0.75],  # 25 left knee
        [0.57, 0.75],  # 26 right knee
        [0.43, 0.95],  # 27 left ankle
        [0.57, 0.95],  # 28 right ankle
        [0.42, 0.98],
        [0.58, 0.98],
        [0.44, 0.99],
        [0.56, 0.99],
    ],
    dtype=np.float64,
)

L_SHOULDER, R_SHOULDER = 11, 12
L_ELBOW, R_ELBOW = 13, 14
L_WRIST, R_WRIST = 15, 16
L_HIP, R_HIP = 23, 24
L_KNEE, R_KNEE = 25, 26
L_ANKLE, R_ANKLE = 27, 28


def _squat(t: float) -> np.ndarray:
    """t in [0,1] sweeps standing (0) to deep squat (1)."""
    p = _BASE.copy()
    drop = 0.18 * t
    # Hips and knees descend; knees bend forward.
    for i in (L_HIP, R_HIP):
        p[i, 1] += drop
    for i in (L_KNEE, R_KNEE):
        p[i, 1] += drop * 0.4
        p[i, 0] += 0.03 * t * (1 if i == R_KNEE else -1)
    # Torso leans slightly forward.
    for i in (L_SHOULDER, R_SHOULDER):
        p[i, 1] += drop * 0.6
    return p


def _pushup(t: float) -> np.ndarray:
    """Horizontal body; elbows bend as t goes 0 (up) -> 1 (down)."""
    p = _BASE.copy()
    # Rotate to horizontal: compress y range, push body down.
    p[:, 1] = 0.55 + (p[:, 1] - 0.55) * 0.25
    p[:, 1] += 0.05
    # Elbows bend: wrists stay under shoulders, elbows flare down with t.
    bend = 0.12 * t
    for i in (L_ELBOW, R_ELBOW):
        p[i, 1] += bend
    for i in (L_WRIST, R_WRIST):
        p[i, 1] += bend * 1.6
    return p


def _curl(t: float) -> np.ndarray:
    """Standing; forearms lift as t goes 0 (down) -> 1 (up)."""
    p = _BASE.copy()
    lift = 0.28 * t
    for i in (L_WRIST, R_WRIST):
        p[i, 1] -= lift
    for i in (L_ELBOW, R_ELBOW):
        p[i, 1] -= lift * 0.15
    return p


def _shoulder_press(t: float) -> np.ndarray:
    """Standing; arms extend overhead as t goes 0 (racked) -> 1 (locked)."""
    p = _BASE.copy()
    # Start racked: wrists near shoulders.
    for i in (L_WRIST, R_WRIST):
        p[i, 1] = 0.22
    for i in (L_ELBOW, R_ELBOW):
        p[i, 1] = 0.34
    # Press up.
    rise = 0.20 * t
    for i in (L_WRIST, R_WRIST):
        p[i, 1] -= rise
    for i in (L_ELBOW, R_ELBOW):
        p[i, 1] -= rise * 0.8
    return p


def _lunge(t: float) -> np.ndarray:
    """One leg forward, back knee drops as t goes 0 -> 1."""
    p = _BASE.copy()
    drop = 0.16 * t
    # Front (right) knee forward and down; back (left) knee down more.
    p[R_KNEE, 0] += 0.06
    p[R_KNEE, 1] += drop * 0.5
    p[R_ANKLE, 0] += 0.08
    p[L_KNEE, 1] += drop
    p[L_ANKLE, 1] += drop * 0.2
    for i in (L_HIP, R_HIP):
        p[i, 1] += drop * 0.5
    return p


_GENERATORS = {
    "squat": _squat,
    "pushup": _pushup,
    "curl": _curl,
    "shoulder-press": _shoulder_press,
    "lunge": _lunge,
}


def generate_dataset(
    per_class: int = 800,
    noise: float = 0.012,
    seed: int = 42,
) -> tuple[np.ndarray, np.ndarray]:
    """Return (landmarks, labels).

    landmarks: (N, 33, 2) float array
    labels:    (N,) int array of class indices
    """
    rng = np.random.default_rng(seed)
    all_lm = []
    all_y = []
    for cls_idx, cls in enumerate(CLASSES):
        gen = _GENERATORS[cls]
        for _ in range(per_class):
            t = rng.uniform(0.0, 1.0)
            pose = gen(t)
            pose = pose + rng.normal(0.0, noise, size=pose.shape)
            # Small global translation/scale to emulate camera framing.
            pose[:, 0] += rng.normal(0.0, 0.02)
            pose[:, 1] += rng.normal(0.0, 0.02)
            all_lm.append(pose)
            all_y.append(cls_idx)
    return np.array(all_lm, dtype=np.float32), np.array(all_y, dtype=np.int64)
