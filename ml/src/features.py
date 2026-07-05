"""Feature engineering for exercise classification.

Converts a frame of 33 MediaPipe pose landmarks into a fixed-length feature
vector. The SAME transformation must run at training time (Python) and
inference time (in the browser), so this module is the single source of truth
and the feature order is frozen and documented.

Feature vector (per frame), in order:
  - 8 joint angles (both sides): elbow, shoulder, hip, knee
  - 4 normalized vertical positions: wrists and ankles relative to hips
  - 2 aspect ratios describing overall posture (bbox height/width, torso ratio)
Total: 14 features.

Landmarks are the standard MediaPipe Pose indices. Each landmark is (x, y, z,
visibility) with x, y normalized to the image.
"""
from __future__ import annotations

import numpy as np

# Landmark indices (MediaPipe Pose).
NOSE = 0
L_SHOULDER, R_SHOULDER = 11, 12
L_ELBOW, R_ELBOW = 13, 14
L_WRIST, R_WRIST = 15, 16
L_HIP, R_HIP = 23, 24
L_KNEE, R_KNEE = 25, 26
L_ANKLE, R_ANKLE = 27, 28

FEATURE_NAMES = [
    "elbow_angle_left",
    "elbow_angle_right",
    "shoulder_angle_left",
    "shoulder_angle_right",
    "hip_angle_left",
    "hip_angle_right",
    "knee_angle_left",
    "knee_angle_right",
    "wrist_height_left",
    "wrist_height_right",
    "ankle_height_left",
    "ankle_height_right",
    "posture_aspect",
    "torso_ratio",
]
N_FEATURES = len(FEATURE_NAMES)


def _angle(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """Angle at vertex b formed by points a-b-c, in degrees (0-180)."""
    ba = a[:2] - b[:2]
    bc = c[:2] - b[:2]
    denom = (np.linalg.norm(ba) * np.linalg.norm(bc)) + 1e-8
    cosang = np.clip(np.dot(ba, bc) / denom, -1.0, 1.0)
    return float(np.degrees(np.arccos(cosang)))


def extract_features(landmarks: np.ndarray) -> np.ndarray:
    """Turn a (33, >=2) landmark array into an N_FEATURES vector.

    Only x, y are used (columns 0, 1). Extra columns (z, visibility) are
    ignored, so both (33, 2) and (33, 4) inputs work.
    """
    lm = np.asarray(landmarks, dtype=np.float64)
    if lm.ndim != 2 or lm.shape[0] < 33:
        raise ValueError(f"expected (33, >=2) landmarks, got {lm.shape}")

    # Joint angles.
    elbow_l = _angle(lm[L_SHOULDER], lm[L_ELBOW], lm[L_WRIST])
    elbow_r = _angle(lm[R_SHOULDER], lm[R_ELBOW], lm[R_WRIST])
    shoulder_l = _angle(lm[L_ELBOW], lm[L_SHOULDER], lm[L_HIP])
    shoulder_r = _angle(lm[R_ELBOW], lm[R_SHOULDER], lm[R_HIP])
    hip_l = _angle(lm[L_SHOULDER], lm[L_HIP], lm[L_KNEE])
    hip_r = _angle(lm[R_SHOULDER], lm[R_HIP], lm[R_KNEE])
    knee_l = _angle(lm[L_HIP], lm[L_KNEE], lm[L_ANKLE])
    knee_r = _angle(lm[R_HIP], lm[R_KNEE], lm[R_ANKLE])

    # Hip midpoint as a vertical reference.
    hip_y = (lm[L_HIP, 1] + lm[R_HIP, 1]) / 2.0
    shoulder_y = (lm[L_SHOULDER, 1] + lm[R_SHOULDER, 1]) / 2.0

    # Vertical positions relative to hips (positive = above the hips, since
    # image y grows downward we negate).
    wrist_h_l = hip_y - lm[L_WRIST, 1]
    wrist_h_r = hip_y - lm[R_WRIST, 1]
    ankle_h_l = hip_y - lm[L_ANKLE, 1]
    ankle_h_r = hip_y - lm[R_ANKLE, 1]

    # Posture aspect: bounding-box height / width over all points.
    xs, ys = lm[:33, 0], lm[:33, 1]
    width = (xs.max() - xs.min()) + 1e-6
    height = (ys.max() - ys.min()) + 1e-6
    posture_aspect = height / width

    # Torso ratio: shoulder-to-hip vertical span vs. body height.
    torso_ratio = abs(shoulder_y - hip_y) / height

    return np.array(
        [
            elbow_l,
            elbow_r,
            shoulder_l,
            shoulder_r,
            hip_l,
            hip_r,
            knee_l,
            knee_r,
            wrist_h_l,
            wrist_h_r,
            ankle_h_l,
            ankle_h_r,
            posture_aspect,
            torso_ratio,
        ],
        dtype=np.float32,
    )


# Exercise class labels, frozen order (index == model class id).
CLASSES = ["squat", "pushup", "curl", "shoulder-press", "lunge"]
