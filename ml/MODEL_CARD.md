# Model Card — Exercise Classifier

## Task
Classify a single frame of pose keypoints into one of five exercises:
squat, push-up, dumbbell curl, shoulder press, lunge.

## Input / output
- **Input:** 33 MediaPipe pose landmarks (x, y) → 14 engineered features
  (8 joint angles, 4 vertical joint positions relative to hips, 2 posture
  ratios). See `src/features.py` — the feature order is frozen and shared
  between training (Python) and inference (browser/ONNX).
- **Output:** class label + per-class probabilities.

## Models compared
Random Forest, XGBoost, and an MLP were trained on an identical standardized
feature split (80/20 stratified). Selection metric: macro-F1, tie-broken by
accuracy. Full numbers are in `models/metrics.json`; the confusion matrices
and per-class reports are printed by `train.py`.

Typical result (synthetic bootstrap): all three land around 0.97–0.98 macro-F1,
with the MLP marginally ahead. Squat↔curl is the main source of confusion,
which is expected — they share standing posture and differ mainly in arm
geometry.

## Training data — READ THIS
The shipped model is trained on a **synthetic bootstrap**: pose landmarks
generated from simple biomechanical models of each exercise, with noise
(`src/synth.py`). This is **not** recorded human data. It exists so the full
pipeline (features → train → compare → evaluate → ONNX export → in-browser
inference) runs end-to-end without a camera, and it learns the genuine joint
geometry that separates the exercises.

**To train on real data:** use `src/record.py` to capture your own labeled
frames into `data/poses.csv`, then re-run `src/train.py`. It auto-detects the
CSV and uses it instead of synthetic data. No other change needed.

## Honest limitations
- Metrics reflect separability of idealized/synthetic poses; real-world
  accuracy (varied bodies, camera angles, lighting) will be lower until
  retrained on recorded data.
- Single-frame classifier: it does not use temporal context. A short frame
  window or an LSTM would likely help on real data and is a natural extension.
- Rep counting is handled separately by joint-angle geometry (Phase 5), not by
  this model.

## Files
- `src/features.py` — feature extraction (source of truth)
- `src/synth.py` — synthetic data generator (clearly labeled)
- `src/train.py` — trains, compares, evaluates, exports ONNX
- `src/record.py` — collect real labeled data
- `models/exercise_classifier.onnx` — exported best model
- `models/metrics.json` — metrics for all three models
