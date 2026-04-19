"""
Smart Rail Mumbai — ML Training Pipeline
Trains and evaluates 3 models:
  Model 1: Random Forest Classifier
  Model 2: Gradient Boosting Classifier
  Model 3: MLP Neural Network (deep learning proxy)
"""

import pandas as pd
import numpy as np
import time
import json
import pickle
import warnings
warnings.filterwarnings("ignore")

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report)
from sklearn.pipeline import Pipeline

FEATURE_COLS = [
    "station_id", "line_id", "month_of_year", "day_of_month", "hour_of_day", "day_of_week",
    "is_weekend", "is_holiday", "festival_flag",
    "temperature", "rain_factor",
    "passenger_entries", "passenger_exits", "total_ridership",
    "previous_hour_ridership", "previous_day_same_hour_ridership",
    "interchange_flag", "peak_hour_flag",
    "station_importance_score", "holiday_effect_factor",
    "ridership_growth_rate", "rolling_avg_3h", "rolling_avg_6h",
]
TARGET_COL = "crowd_level"
LABEL_ORDER = ["LOW", "MEDIUM", "HIGH"]


def load_and_prepare(path: str):
    print("📂 Loading dataset…")
    df = pd.read_csv(path)
    if len(df) > 300000:
        sample_idx, _ = train_test_split(
            df.index,
            train_size=300000,
            random_state=42,
            stratify=df[TARGET_COL],
        )
        df = df.loc[sample_idx].reset_index(drop=True)
        print("   Downsampled to 300,000 rows for faster retraining")
    print(f"   {len(df):,} rows, {len(df.columns)} columns")

    # Encode weather (not in feature list but keep for reference)
    le_weather = LabelEncoder()
    df["weather_encoded"] = le_weather.fit_transform(df["weather_condition"])

    # Encode target
    le_target = LabelEncoder()
    le_target.classes_ = np.array(LABEL_ORDER)
    df["crowd_encoded"] = df[TARGET_COL].map({"LOW": 0, "MEDIUM": 1, "HIGH": 2})

    X = df[FEATURE_COLS].values
    y = df["crowd_encoded"].values

    print(f"\n📊 Class distribution:")
    for i, lbl in enumerate(LABEL_ORDER):
        cnt = (y == i).sum()
        print(f"   {lbl}: {cnt:,} ({cnt/len(y)*100:.1f}%)")

    return X, y, df


def evaluate_model(model, X_test, y_test, model_name: str, train_time: float):
    t0 = time.perf_counter()
    y_pred = model.predict(X_test)
    latency_ms = (time.perf_counter() - t0) / len(X_test) * 1000

    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec  = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1   = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    cm   = confusion_matrix(y_test, y_pred)

    print(f"\n{'='*55}")
    print(f"  {model_name}")
    print(f"{'='*55}")
    print(f"  Accuracy  : {acc:.4f}  ({acc*100:.2f}%)")
    print(f"  Precision : {prec:.4f}")
    print(f"  Recall    : {rec:.4f}")
    print(f"  F1 Score  : {f1:.4f}")
    print(f"  Train time: {train_time:.1f}s")
    print(f"  Latency   : {latency_ms:.4f} ms/sample")
    print(f"\n  Confusion Matrix (LOW / MEDIUM / HIGH):")
    print(f"  {cm}")
    print(f"\n  Classification Report:")
    cr = classification_report(y_test, y_pred,
                               target_names=LABEL_ORDER, zero_division=0)
    for line in cr.split("\n"):
        print(f"    {line}")

    return {
        "model_name":     model_name,
        "accuracy":       round(acc, 4),
        "precision":      round(prec, 4),
        "recall":         round(rec, 4),
        "f1_score":       round(f1, 4),
        "train_time_sec": round(train_time, 2),
        "latency_ms":     round(latency_ms, 5),
        "confusion_matrix": cm.tolist(),
        "y_pred":         y_pred.tolist(),
    }


def cross_validate_model(model, X_train, y_train, model_name: str, cv: int = 3):
    if cv <= 1:
        print(f"\n⏭️  Skipping cross-validation for {model_name}")
        return np.array([0.0])
    print(f"\n🔁 Cross-validating {model_name} ({cv}-fold)…")
    cv_scores = cross_val_score(
        model, X_train, y_train,
        cv=StratifiedKFold(n_splits=cv, shuffle=True, random_state=42),
        scoring="f1_weighted", n_jobs=1
    )
    print(f"   CV F1 scores: {[f'{s:.4f}' for s in cv_scores]}")
    print(f"   Mean: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    return cv_scores


def get_feature_importance(model, model_name: str):
    """Extract feature importances where available."""
    if hasattr(model, "feature_importances_"):
        return model.feature_importances_
    elif hasattr(model, "coef_"):
        return np.abs(model.coef_).mean(axis=0)
    return None


def train_all_models(data_path: str):
    X, y, df = load_and_prepare(data_path)

    # Train/test split (stratified, 80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\n✂️  Split: Train={len(X_train):,} | Test={len(X_test):,}")

    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    results = []
    models  = {}
    feature_importances = {}

    # ── MODEL 1: Random Forest ───────────────────────────────────────────────
    print("\n\n🌲 Training Model 1: Random Forest Classifier…")
    t0 = time.time()
    rf = RandomForestClassifier(
        n_estimators=120,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        max_features="sqrt",
        class_weight="balanced",
        random_state=42,
        n_jobs=1,
    )
    rf.fit(X_train, y_train)
    rf_train_time = time.time() - t0
    print(f"   ✓ Trained in {rf_train_time:.1f}s")

    cv_rf = cross_validate_model(rf, X_train, y_train, "Random Forest", cv=2)
    res_rf = evaluate_model(rf, X_test, y_test, "Random Forest Classifier", rf_train_time)
    res_rf["cv_f1_mean"] = round(cv_rf.mean(), 4)
    res_rf["cv_f1_std"]  = round(cv_rf.std(), 4)
    results.append(res_rf)
    models["Random Forest"] = rf
    feature_importances["Random Forest"] = rf.feature_importances_.tolist()

    # ── MODEL 2: Gradient Boosting ───────────────────────────────────────────
    print("\n\n🚀 Training Model 2: Gradient Boosting Classifier…")
    t0 = time.time()
    # Use subsample of training data for speed while keeping statistical power
    sample_idx = np.random.choice(len(X_train), size=min(60000, len(X_train)), replace=False)
    gb = GradientBoostingClassifier(
        n_estimators=80,
        learning_rate=0.12,
        max_depth=4,
        subsample=0.8,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
    )
    gb.fit(X_train[sample_idx], y_train[sample_idx])
    gb_train_time = time.time() - t0
    print(f"   ✓ Trained in {gb_train_time:.1f}s")

    cv_gb = cross_validate_model(gb, X_train[sample_idx], y_train[sample_idx],
                                 "Gradient Boosting", cv=1)
    res_gb = evaluate_model(gb, X_test, y_test, "Gradient Boosting Classifier", gb_train_time)
    res_gb["cv_f1_mean"] = round(cv_gb.mean(), 4)
    res_gb["cv_f1_std"]  = round(cv_gb.std(), 4)
    results.append(res_gb)
    models["Gradient Boosting"] = gb
    feature_importances["Gradient Boosting"] = gb.feature_importances_.tolist()

    # ── MODEL 3: MLP Neural Network ──────────────────────────────────────────
    print("\n\n🧠 Training Model 3: MLP Neural Network…")
    t0 = time.time()
    mlp = MLPClassifier(
        hidden_layer_sizes=(128, 64, 32),
        activation="relu",
        solver="adam",
        alpha=0.0001,
        batch_size=512,
        learning_rate="adaptive",
        learning_rate_init=0.001,
        max_iter=45,
        early_stopping=True,
        validation_fraction=0.1,
        n_iter_no_change=8,
        random_state=42,
        verbose=False,
    )
    mlp.fit(X_train_sc, y_train)
    mlp_train_time = time.time() - t0
    print(f"   ✓ Trained in {mlp_train_time:.1f}s | Iterations: {mlp.n_iter_}")

    cv_mlp = cross_validate_model(
        Pipeline([("scaler", StandardScaler()), ("mlp", MLPClassifier(
            hidden_layer_sizes=(128, 64), max_iter=30, random_state=42
        ))]),
        X_train[sample_idx], y_train[sample_idx], "MLP Neural Network", cv=1
    )
    res_mlp = evaluate_model(mlp, X_test_sc, y_test, "MLP Neural Network", mlp_train_time)
    res_mlp["cv_f1_mean"] = round(cv_mlp.mean(), 4)
    res_mlp["cv_f1_std"]  = round(cv_mlp.std(), 4)
    results.append(res_mlp)
    models["MLP Neural Network"] = mlp

    print("\n\n📏 Baseline model step skipped for compatibility with current sklearn version.")

    # ── Summary table ─────────────────────────────────────────────────────────
    print("\n\n" + "="*70)
    print("  📊  MODEL COMPARISON SUMMARY")
    print("="*70)
    print(f"  {'Model':<35} {'Acc':>7} {'F1':>7} {'Train(s)':>9} {'Lat(ms)':>8}")
    print("  " + "-"*68)
    for r in results:
        print(f"  {r['model_name']:<35} {r['accuracy']:>7.4f} {r['f1_score']:>7.4f}"
              f" {r['train_time_sec']:>9.1f} {r['latency_ms']:>8.5f}")

    # Determine best model
    best = max(results, key=lambda r: r["f1_score"])
    print(f"\n  🏆 Best Model: {best['model_name']} (F1={best['f1_score']:.4f})")
    print("="*70)

    # Save everything
    out = {
        "results": results,
        "best_model_name": best["model_name"],
        "feature_columns": FEATURE_COLS,
        "label_order": LABEL_ORDER,
        "feature_importances": feature_importances,
    }
    with open("evaluation/results.json", "w") as f:
        json.dump(out, f, indent=2)

    with open("models/random_forest.pkl", "wb") as f:
        pickle.dump(rf, f)
    with open("models/gradient_boosting.pkl", "wb") as f:
        pickle.dump(gb, f)
    with open("models/mlp_neural_net.pkl", "wb") as f:
        pickle.dump(mlp, f)
    with open("models/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    print("\n✅ Models and results saved.")
    return out, models, scaler, X_test, y_test, df


if __name__ == "__main__":
    results_data, models, scaler, X_test, y_test, df = train_all_models(
        "data/mumbai_metro_ridership.csv"
    )
