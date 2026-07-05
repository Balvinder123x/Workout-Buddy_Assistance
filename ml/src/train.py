"""Train and compare exercise-classification models, export the best to ONNX.

Models compared: Random Forest, XGBoost, MLP (scikit-learn).
Metrics: accuracy, macro precision/recall/F1, per-class report, confusion
matrix. The best model by macro-F1 (tie-broken by accuracy) is exported to
ONNX for in-browser inference.

Data source: real labeled frames from ``data/poses.csv`` if present, otherwise
a synthetic bootstrap set (see synth.py). The source used is printed clearly.

Run:  python src/train.py
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

from features import CLASSES, FEATURE_NAMES, N_FEATURES, extract_features

ML_DIR = Path(__file__).resolve().parent.parent
DATA_CSV = ML_DIR / "data" / "poses.csv"
MODELS_DIR = ML_DIR / "models"
MODELS_DIR.mkdir(exist_ok=True)


def load_features() -> tuple[np.ndarray, np.ndarray, str]:
    """Return (X, y, source). Uses real CSV if available, else synthetic."""
    if DATA_CSV.exists():
        raw = np.loadtxt(DATA_CSV, delimiter=",", skiprows=1)
        y = raw[:, 0].astype(np.int64)
        # CSV stores flattened (33*2) landmarks per row after the label.
        lm = raw[:, 1:].reshape(-1, 33, 2)
        X = np.array([extract_features(f) for f in lm], dtype=np.float32)
        return X, y, f"real data ({DATA_CSV.name}, {len(y)} samples)"

    # Synthetic bootstrap.
    from synth import generate_dataset

    lm, y = generate_dataset()
    X = np.array([extract_features(f) for f in lm], dtype=np.float32)
    return X, y, f"synthetic bootstrap ({len(y)} samples)"


def evaluate(name, model, X_test, y_test) -> dict:
    pred = model.predict(X_test)
    return {
        "model": name,
        "accuracy": float(accuracy_score(y_test, pred)),
        "precision_macro": float(
            precision_score(y_test, pred, average="macro", zero_division=0)
        ),
        "recall_macro": float(
            recall_score(y_test, pred, average="macro", zero_division=0)
        ),
        "f1_macro": float(
            f1_score(y_test, pred, average="macro", zero_division=0)
        ),
        "confusion_matrix": confusion_matrix(y_test, pred).tolist(),
        "report": classification_report(
            y_test, pred, target_names=CLASSES, zero_division=0
        ),
    }


def export_onnx(model, scaler, path: Path) -> None:
    """Export a scaler+model pipeline to ONNX."""
    from skl2onnx import to_onnx
    from sklearn.pipeline import Pipeline

    pipe = Pipeline([("scaler", scaler), ("clf", model)])
    # Refit the pipeline on the full standardized space is unnecessary; the
    # scaler is already fit and the model was trained on scaled data, so wrap
    # them and export with a float input of shape [None, N_FEATURES].
    onx = to_onnx(
        pipe,
        np.zeros((1, N_FEATURES), dtype=np.float32),
        options={id(pipe.steps[-1][1]): {"zipmap": False}},
    )
    path.write_bytes(onx.SerializeToString())


def main() -> None:
    X, y, source = load_features()
    print(f"Data source: {source}")
    print(f"Features: {N_FEATURES} -> {FEATURE_NAMES}")
    print(f"Classes: {CLASSES}\n")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Standardize (fit on train only).
    scaler = StandardScaler().fit(X_train)
    X_train_s = scaler.transform(X_train)
    X_test_s = scaler.transform(X_test)

    models = {
        "RandomForest": RandomForestClassifier(
            n_estimators=200, max_depth=12, random_state=42, n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            subsample=0.9,
            random_state=42,
            eval_metric="mlogloss",
        ),
        "MLP": MLPClassifier(
            hidden_layer_sizes=(64, 32),
            max_iter=500,
            random_state=42,
        ),
    }

    results = []
    fitted = {}
    for name, model in models.items():
        model.fit(X_train_s, y_train)
        fitted[name] = model
        res = evaluate(name, model, X_test_s, y_test)
        results.append(res)
        print(f"=== {name} ===")
        print(f"  accuracy={res['accuracy']:.4f}  f1_macro={res['f1_macro']:.4f}")
        print(res["report"])

    # Pick the best by macro-F1, tie-break on accuracy.
    best = max(results, key=lambda r: (r["f1_macro"], r["accuracy"]))
    best_name = best["model"]
    print(f"\nBest model: {best_name} (f1_macro={best['f1_macro']:.4f})")

    # Export best to ONNX.
    onnx_path = MODELS_DIR / "exercise_classifier.onnx"
    export_onnx(fitted[best_name], scaler, onnx_path)
    print(f"Exported ONNX -> {onnx_path}")

    # Save a metrics summary + metadata for the frontend and the model card.
    summary = {
        "data_source": source,
        "classes": CLASSES,
        "feature_names": FEATURE_NAMES,
        "best_model": best_name,
        "results": [
            {k: v for k, v in r.items() if k != "report"} for r in results
        ],
    }
    (MODELS_DIR / "metrics.json").write_text(json.dumps(summary, indent=2))
    print(f"Wrote metrics -> {MODELS_DIR / 'metrics.json'}")


if __name__ == "__main__":
    main()
