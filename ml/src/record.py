"""Record real labeled pose samples for training on genuine data.

This captures pose landmarks from your webcam using MediaPipe (Python) and
appends them to ``data/poses.csv`` with the label you specify. Once you have a
few hundred samples per exercise, re-run ``train.py`` and it will automatically
use this real data instead of the synthetic bootstrap.

CSV schema (one row per frame):
    label, x0, y0, x1, y1, ..., x32, y32
where ``label`` is the class index (see features.CLASSES) and x*/y* are the
normalized landmark coordinates.

Usage:
    python src/record.py --exercise squat --seconds 30

Requires:  pip install mediapipe opencv-python

This is intentionally kept as a standalone utility so the core training
pipeline has no camera dependency.
"""
from __future__ import annotations

import argparse
import csv
import sys
import time
from pathlib import Path

from features import CLASSES

DATA_CSV = Path(__file__).resolve().parent.parent / "data" / "poses.csv"


def main() -> None:
    parser = argparse.ArgumentParser(description="Record labeled pose samples.")
    parser.add_argument(
        "--exercise",
        required=True,
        choices=CLASSES,
        help="Which exercise you will perform on camera.",
    )
    parser.add_argument(
        "--seconds", type=int, default=30, help="How long to record."
    )
    args = parser.parse_args()

    try:
        import cv2
        import mediapipe as mp
    except ImportError:
        print(
            "This tool needs mediapipe + opencv:\n"
            "    pip install mediapipe opencv-python",
            file=sys.stderr,
        )
        sys.exit(1)

    label = CLASSES.index(args.exercise)
    DATA_CSV.parent.mkdir(exist_ok=True)
    write_header = not DATA_CSV.exists()

    mp_pose = mp.solutions.pose
    cap = cv2.VideoCapture(0)
    rows_written = 0

    with (
        mp_pose.Pose(min_detection_confidence=0.5) as pose,
        DATA_CSV.open("a", newline="") as fh,
    ):
        writer = csv.writer(fh)
        if write_header:
            header = ["label"]
            for i in range(33):
                header += [f"x{i}", f"y{i}"]
            writer.writerow(header)

        print(f"Recording '{args.exercise}' for {args.seconds}s. Press q to stop.")
        start = time.time()
        while time.time() - start < args.seconds:
            ok, frame = cap.read()
            if not ok:
                break
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = pose.process(rgb)
            if result.pose_landmarks:
                row = [label]
                for lm in result.pose_landmarks.landmark:
                    row += [lm.x, lm.y]
                writer.writerow(row)
                rows_written += 1
            cv2.imshow("Recording (press q to stop)", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()
    print(f"Wrote {rows_written} frames to {DATA_CSV}")


if __name__ == "__main__":
    main()
