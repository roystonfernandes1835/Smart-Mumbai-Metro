"""
Smart Rail Mumbai — 4-Hour Crowd Level Prediction Engine
Uses the best model (Gradient Boosting) to forecast crowd levels.

Usage:
    python3 prediction/predict.py
"""

import pickle
import numpy as np
from datetime import datetime, timedelta

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
LABEL_ORDER = ["LOW", "MEDIUM", "HIGH"]

DAILY_RIDERSHIP = {1: 525000, 2: 165000, 3: 170000, 7: 165000, 5: 15000}
STATION_COUNTS  = {1: 12, 2: 17, 3: 27, 7: 14, 5: 17}
LINE_CAPACITY   = {1: 2500, 2: 1800, 3: 2400, 7: 1800, 5: 600}

HOURLY_WEIGHTS = {
    0:0.02,1:0.01,2:0.01,3:0.01,4:0.02,5:0.04,6:0.06,7:0.09,
    8:0.11,9:0.10,10:0.06,11:0.04,12:0.04,13:0.05,14:0.04,15:0.04,
    16:0.05,17:0.08,18:0.10,19:0.09,20:0.07,21:0.05,22:0.04,23:0.02
}

STATIONS = {
    4:  {"name": "Andheri",         "line_id": 1, "interchange": 1, "importance": 0.95},
    12: {"name": "Ghatkopar",       "line_id": 1, "interchange": 1, "importance": 0.92},
    8:  {"name": "Marol Naka",      "line_id": 1, "interchange": 1, "importance": 0.72},
    39: {"name": "BKC",             "line_id": 3, "interchange": 1, "importance": 0.88},
    42: {"name": "Dadar",           "line_id": 3, "interchange": 0, "importance": 0.90},
    52: {"name": "CSMT",            "line_id": 3, "interchange": 0, "importance": 0.85},
    54: {"name": "Churchgate",      "line_id": 3, "interchange": 0, "importance": 0.82},
    55: {"name": "Vidhan Bhavan",   "line_id": 3, "interchange": 1, "importance": 0.80},
    18: {"name": "Borivali West",   "line_id": 2, "interchange": 1, "importance": 0.75},
    20: {"name": "Kandivali West",  "line_id": 2, "interchange": 1, "importance": 0.65},
    71: {"name": "Chembur",         "line_id": 5, "interchange": 1, "importance": 0.60},
    76: {"name": "Wadala",          "line_id": 5, "interchange": 1, "importance": 0.55},
    57: {"name": "Dahisar East",    "line_id": 7, "interchange": 1, "importance": 0.55},
}


def load_model(model_path: str = "models/gradient_boosting.pkl"):
    with open(model_path, "rb") as f:
        return pickle.load(f)


def predict_4_hours(
    station_id:     int,
    current_time:   str,          # "HH:MM"
    day_of_week:    int   = 2,    # 0=Mon…6=Sun
    is_holiday:     int   = 0,
    festival_flag:  int   = 0,
    weather:        str   = "Clear",
    temperature:    float = 30.0,
    model=None,
) -> list[dict]:
    """
    Predict crowd level for a station for the next 4 hours.

    Returns list of dicts: {time, hour, crowd_level, confidence, probabilities, estimated_ridership}
    """
    if model is None:
        model = load_model()

    st  = STATIONS.get(station_id, STATIONS[4])
    lid = st["line_id"]
    cap = LINE_CAPACITY[lid]
    per_station_daily = DAILY_RIDERSHIP[lid] / STATION_COUNTS[lid] * st["importance"]

    rain_factor    = 1.22 if "Heavy" in weather else 1.10 if "Moderate" in weather else 1.04 if "Light" in weather else 1.0
    festival_mult  = 1.55 if festival_flag else 1.15 if is_holiday else 1.0
    weekend_factor = 0.68 if day_of_week >= 5 else 1.0
    is_weekend     = 1 if day_of_week >= 5 else 0

    t = datetime.strptime(current_time, "%H:%M")
    prev_rid = per_station_daily * HOURLY_WEIGHTS[t.hour] * 0.92

    results = []
    for i in range(4):
        h = (t.hour + i) % 24
        hw = HOURLY_WEIGHTS[h]
        rid = per_station_daily * hw * rain_factor * festival_mult * weekend_factor
        rid = max(0, rid + np.random.normal(0, rid * 0.04))

        peak_hour = 1 if (7 <= h <= 10 or 17 <= h <= 21) else 0
        growth    = round((rid - prev_rid) / max(prev_rid, 1) * 100, 2)

        feat = [
            station_id, lid, datetime.now().month, datetime.now().day, h, day_of_week, is_weekend, is_holiday, festival_flag,
            temperature, round(rain_factor, 3),
            int(rid * 0.60), int(rid * 0.40), int(rid),
            int(prev_rid), int(per_station_daily * hw * 0.95),
            st["interchange"], peak_hour, round(st["importance"], 4),
            round(1.55 if festival_flag else 1.15 if is_holiday else 1.0, 3),
            growth,
            round(rid * 0.95, 1), round(rid * 0.97, 1),
        ]

        X     = np.array([feat])
        pred  = model.predict(X)[0]
        proba = model.predict_proba(X)[0]
        label = LABEL_ORDER[pred]

        forecast_time = (t + timedelta(hours=i)).strftime("%H:%M")
        results.append({
            "time":                forecast_time,
            "hour":                h,
            "crowd_level":         label,
            "confidence":          round(float(max(proba)) * 100, 1),
            "probabilities": {
                "LOW":    round(float(proba[0]) * 100, 1),
                "MEDIUM": round(float(proba[1]) * 100, 1),
                "HIGH":   round(float(proba[2]) * 100, 1),
            },
            "estimated_ridership": int(rid),
            "load_factor":         round(rid / (cap * hw * 60 / 5 + 0.001), 3),
        })
        prev_rid = rid

    return results


def print_forecast(station_id: int, current_time: str, **kwargs):
    st   = STATIONS.get(station_id, STATIONS[4])
    preds = predict_4_hours(station_id, current_time, **kwargs)
    icons = {"LOW": "🟢", "MEDIUM": "🟡", "HIGH": "🔴"}

    print(f"\n{'═'*48}")
    print(f"  Station : {st['name']}  (Line {st['line_id']})")
    print(f"  Time    : {current_time}")
    cond = f"  Conditions: {kwargs.get('weather','Clear')}"
    if kwargs.get('festival_flag'): cond += " | Festival"
    if kwargs.get('is_holiday'):    cond += " | Holiday"
    print(cond)
    print(f"{'─'*48}")
    print(f"  {'Time':<8} {'Level':<8} {'Confidence':>11} {'Riders':>8}")
    print(f"{'─'*48}")
    for p in preds:
        bar = "█" * int(p["confidence"] / 10)
        print(f"  {p['time']:<8} {icons[p['crowd_level']]} {p['crowd_level']:<6} "
              f"  {p['confidence']:>5.1f}%  {p['estimated_ridership']:>7,}")
    print(f"{'═'*48}\n")


if __name__ == "__main__":
    print("🚇 Smart Rail Mumbai — 4-Hour Crowd Forecast")
    print("   Best Model: Gradient Boosting Classifier (F1 = 0.9839)")

    scenarios = [
        (4,  "08:00", {"day_of_week": 0, "weather": "Clear",      "temperature": 29}),
        (39, "17:30", {"day_of_week": 1, "weather": "Clear",      "temperature": 32}),
        (42, "09:00", {"day_of_week": 2, "is_holiday": 1, "festival_flag": 1, "weather": "Heavy Rain", "temperature": 27}),
        (54, "18:00", {"day_of_week": 3, "weather": "Partly Cloudy", "temperature": 30}),
        (71, "10:00", {"day_of_week": 4, "weather": "Clear",      "temperature": 31}),
        (12, "07:30", {"day_of_week": 0, "weather": "Moderate Rain", "temperature": 26}),
    ]

    model = load_model()
    for sid, t, kwargs in scenarios:
        print_forecast(sid, t, model=model, **kwargs)
