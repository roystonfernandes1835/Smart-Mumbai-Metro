import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import hashlib
import json

# Feature names in order (21 total)
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

class CrowdProphet:
    def __init__(self):
        self.models_dir = os.path.dirname(os.path.abspath(__file__))
        self.best_model_path = os.path.join(self.models_dir, "gradient_boosting.pkl")
        self.mlp_model_path = os.path.join(self.models_dir, "mlp_neural_net.pkl")
        self.rf_model_path = os.path.join(self.models_dir, "random_forest.pkl")
        self.scaler_path = os.path.join(self.models_dir, "scaler.pkl")
        self._set_best_model_path_from_eval()

        # Load models
        try:
            self.model = joblib.load(self.best_model_path)
            self.mlp_model = joblib.load(self.mlp_model_path)
            self.rf_model = joblib.load(self.rf_model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.loaded = True
        except Exception as e:
            print(f"Error loading models: {e}")
            self.loaded = False

        # Comprehensive station data mapping from generate_data.py
        self.station_map = {
            # Line 1
            "Versova": {"id": 1, "line_id": 1, "interchange": 0, "importance": 0.8},
            "D.N. Nagar": {"id": 2, "line_id": 1, "interchange": 1, "importance": 1.5},
            "Azad Nagar": {"id": 3, "line_id": 1, "interchange": 0, "importance": 0.7},
            "Andheri": {"id": 4, "line_id": 1, "interchange": 1, "importance": 2.8},
            "Western Express Highway": {"id": 5, "line_id": 1, "interchange": 0, "importance": 0.9},
            "Chakala": {"id": 6, "line_id": 1, "interchange": 0, "importance": 0.8},
            "Airport Road": {"id": 7, "line_id": 1, "interchange": 0, "importance": 0.9},
            "Marol Naka": {"id": 8, "line_id": 1, "interchange": 1, "importance": 1.2},
            "Saki Naka": {"id": 9, "line_id": 1, "interchange": 0, "importance": 0.8},
            "Asalpha": {"id": 10, "line_id": 1, "interchange": 0, "importance": 0.7},
            "Jagruti Nagar": {"id": 11, "line_id": 1, "interchange": 0, "importance": 0.7},
            "Ghatkopar": {"id": 12, "line_id": 1, "interchange": 1, "importance": 2.5},
            # Line 2A
            "Dahisar East": {"id": 13, "line_id": 2, "interchange": 1, "importance": 1.4},
            "Borivali West": {"id": 18, "line_id": 2, "interchange": 1, "importance": 1.7},
            "Kandivali West": {"id": 20, "line_id": 2, "interchange": 1, "importance": 1.3},
            "Malad West": {"id": 23, "line_id": 2, "interchange": 0, "importance": 1.1},
            "Goregaon West": {"id": 26, "line_id": 2, "interchange": 0, "importance": 1.1},
            "Andheri West": {"id": 29, "line_id": 2, "interchange": 1, "importance": 1.6},
            # Line 3
            "Aarey JVLR": {"id": 30, "line_id": 3, "interchange": 0, "importance": 0.9},
            "BKC": {"id": 39, "line_id": 3, "interchange": 1, "importance": 2.2},
            "Dadar": {"id": 42, "line_id": 3, "interchange": 1, "importance": 2.6},
            "Worli": {"id": 44, "line_id": 3, "interchange": 0, "importance": 1.4},
            "Mahalaxmi": {"id": 47, "line_id": 3, "interchange": 0, "importance": 1.3},
            "CSMT": {"id": 52, "line_id": 3, "interchange": 1, "importance": 2.3},
            "Churchgate": {"id": 54, "line_id": 3, "interchange": 1, "importance": 2.0},
            "Cuffe Parade": {"id": 56, "line_id": 3, "interchange": 0, "importance": 1.2},
            # Line 7
            "Magathane": {"id": 61, "line_id": 7, "interchange": 0, "importance": 1.0},
            "Akurli": {"id": 63, "line_id": 7, "interchange": 0, "importance": 1.0},
            "Dindoshi": {"id": 65, "line_id": 7, "interchange": 0, "importance": 1.1},
            "Gundavali": {"id": 70, "line_id": 7, "interchange": 1, "importance": 1.8},
            # Monorail
            "Chembur": {"id": 71, "line_id": 5, "interchange": 1, "importance": 1.6},
            "Wadala": {"id": 76, "line_id": 5, "interchange": 1, "importance": 1.4},
            "Jacob Circle": {"id": 87, "line_id": 5, "interchange": 1, "importance": 1.2},
        }
        
        # Self-populating fallback for other stations
        self.default_info = {"id": 99, "line_id": 1, "interchange": 0, "importance": 1.0}

        # Constants for mock feature generation
        self.DAILY_RIDERSHIP = {1: 525000, 2: 165000, 3: 170000, 7: 165000, 5: 15000}
        self.STATION_COUNTS = {1: 12, 2: 17, 3: 27, 7: 14, 5: 17}
        self.HOURLY_WEIGHTS = {
            0: 0.02, 1: 0.01, 2: 0.01, 3: 0.01, 4: 0.02, 5: 0.04,
            6: 0.06, 7: 0.09, 8: 0.11, 9: 0.10, 10: 0.06, 11: 0.04,
            12: 0.04, 13: 0.05, 14: 0.04, 15: 0.04, 16: 0.05,
            17: 0.08, 18: 0.10, 19: 0.09, 20: 0.07, 21: 0.05,
            22: 0.04, 23: 0.02
        }
        self.FESTIVAL_DATES = {
            "01-26", "03-14", "08-15", "08-27", "10-12", "11-01", "12-25"
        }
        self.station_profiles = {}
        self._load_station_profiles()

    def _set_best_model_path_from_eval(self):
        eval_path = os.path.abspath(os.path.join(self.models_dir, "..", "evaluation", "results.json"))
        if not os.path.exists(eval_path):
            return
        try:
            with open(eval_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            best_name = data.get("best_model_name", "")
            model_map = {
                "Random Forest Classifier": "random_forest.pkl",
                "Gradient Boosting Classifier": "gradient_boosting.pkl",
                "MLP Neural Network": "mlp_neural_net.pkl",
            }
            model_file = model_map.get(best_name)
            if model_file:
                self.best_model_path = os.path.join(self.models_dir, model_file)
        except Exception:
            # Keep default path when eval file is unavailable/corrupt.
            pass

    def _load_station_profiles(self):
        """Load station metadata from generated dataset so all stations are covered."""
        csv_path = os.path.abspath(os.path.join(self.models_dir, "..", "data", "mumbai_metro_ridership.csv"))
        if not os.path.exists(csv_path):
            return

        try:
            df = pd.read_csv(csv_path)
            if df.empty:
                return

            max_importance = max(float(df["station_importance_score"].max()), 1.0)
            grouped = df.groupby("station_name", as_index=False).agg({
                "station_id": "first",
                "line_id": "first",
                "interchange_flag": "max",
                "station_importance_score": "mean",
                "total_ridership": "mean",
            })

            for _, row in grouped.iterrows():
                name = str(row["station_name"])
                self.station_map[name] = {
                    "id": int(row["station_id"]),
                    "line_id": int(row["line_id"]),
                    "interchange": int(row["interchange_flag"]),
                    "importance": max(0.4, min(3.0, float(row["station_importance_score"]) * (2.8 / max_importance))),
                    "mean_ridership": float(row["total_ridership"]),
                }
                self.station_profiles[name.lower()] = name
        except Exception as e:
            print(f"Warning: station profile load failed: {e}")

    def _station_rng(self, station_name: str, curr_time: datetime):
        seed_text = f"{station_name}|{curr_time.strftime('%Y-%m-%d-%H')}"
        seed = int(hashlib.md5(seed_text.encode("utf-8")).hexdigest()[:8], 16)
        return np.random.default_rng(seed)

    def _weather_and_festival(self, curr_time: datetime):
        month = curr_time.month
        if month in [6, 7, 8, 9]:
            weather = np.random.choice(["Heavy Rain", "Moderate Rain", "Light Rain"], p=[0.35, 0.45, 0.2])
            temp = float(np.random.uniform(24, 30))
            rain_factor = {"Heavy Rain": 1.25, "Moderate Rain": 1.12, "Light Rain": 1.05}[weather]
        elif month in [12, 1, 2]:
            weather = np.random.choice(["Clear", "Partly Cloudy"], p=[0.7, 0.3])
            temp = float(np.random.uniform(18, 28))
            rain_factor = 1.0
        elif month in [3, 4, 5]:
            weather = np.random.choice(["Clear", "Hazy", "Partly Cloudy"], p=[0.5, 0.3, 0.2])
            temp = float(np.random.uniform(30, 40))
            rain_factor = 1.0
        else:
            weather = np.random.choice(["Clear", "Partly Cloudy", "Light Rain"], p=[0.5, 0.35, 0.15])
            temp = float(np.random.uniform(25, 33))
            rain_factor = 1.03 if "Rain" in weather else 1.0

        mm_dd = curr_time.strftime("%m-%d")
        is_festival = 1 if mm_dd in self.FESTIVAL_DATES else 0
        return weather, round(temp, 1), rain_factor, is_festival

    def predict_station_load(self, station_name: str, model_type: str = "best"):
        if not self.loaded:
            return {"error": "Models not loaded"}

        # Case-insensitive lookup across full generated station list
        sinfo = None
        station_lookup = station_name.lower().strip()
        canonical = self.station_profiles.get(station_lookup)
        if canonical and canonical in self.station_map:
            station_name = canonical
            sinfo = self.station_map[canonical]
        else:
            for k, v in self.station_map.items():
                if k.lower() == station_lookup:
                    sinfo = v
                    station_name = k
                    break
        
        if not sinfo:
            # Hash-based deterministic fallback for unknown stations
            s_hash = int(hashlib.md5(station_name.encode("utf-8")).hexdigest()[:8], 16)
            sinfo = {
                "id": (s_hash % 80) + 1,
                "line_id": (s_hash % 4) + 1,
                "interchange": 1 if s_hash % 5 == 0 else 0,
                "importance": 0.6 + (s_hash % 20) / 10.0,
                "mean_ridership": 450.0,
            }

        now = datetime.now()
        dow = now.weekday()
        is_weekend = 1 if dow >= 5 else 0
        
        _, temperature, rain_factor, festival_flag = self._weather_and_festival(now)
        is_holiday = festival_flag

        results = self._generate_forecast(sinfo, now, dow, is_weekend, is_holiday, festival_flag, temperature, rain_factor, model_type)
        
        current_pred = results[0]
        
        return {
            "station": station_name,
            "crowdLevel": current_pred["crowd_level"],
            "trend": "increasing" if results[1]["estimated_ridership"] > current_pred["estimated_ridership"] else "decreasing",
            "confidence": current_pred["confidence"],
            "forecast": [
                {"time": p["time"], "predicted": self._label_to_val(p["crowd_level"])} 
                for p in results[1:]
            ],
            "model_used": model_type,
            "stats": {
                "ridership": current_pred["estimated_ridership"],
                "confidence": current_pred["confidence"]
            }
        }

    def _label_to_val(self, label):
        return {"LOW": 25, "MEDIUM": 58, "HIGH": 88}[label]

    def _generate_forecast(self, sinfo, start_time, dow, is_weekend, is_holiday, festival_flag, temp, rain_factor, model_type):
        sid = sinfo["id"]
        lid = sinfo["line_id"]
        importance = sinfo["importance"]
        interchange = sinfo["interchange"]
        
        # Ensure lid is valid for DAILY_RIDERSHIP
        lid = lid if lid in self.DAILY_RIDERSHIP else 1
        per_station_daily = self.DAILY_RIDERSHIP[lid] / self.STATION_COUNTS[lid] * importance
        
        # Choose model
        if model_type == "mlp":
            model = self.mlp_model
            scale_features = True
        elif model_type == "rf":
            model = self.rf_model
            scale_features = False
        else:
            model = self.model
            scale_features = False

        results = []
        rng = self._station_rng(str(sid), start_time)
        baseline = sinfo.get("mean_ridership", per_station_daily / 24.0)
        prev_rid = max(1.0, baseline * 0.92)
        
        for i in range(7):
            curr_time = start_time + timedelta(hours=i)
            h = curr_time.hour
            hw = self.HOURLY_WEIGHTS[h]
            
            # Predict based on features
            rid = per_station_daily * hw * rain_factor * (1.1 if is_holiday else 1.0) * (0.65 if is_weekend else 1.0)
            rid = max(0.0, rid + rng.normal(0, max(5.0, rid * 0.06)))
            
            peak_hour = 1 if (7 <= h <= 10 or 17 <= h <= 21) else 0
            growth = round((rid - prev_rid) / max(prev_rid, 1) * 100, 2)
            
            feat = [
                sid, lid, curr_time.month, curr_time.day, h, dow, is_weekend, is_holiday, festival_flag,
                temp, rain_factor,
                int(rid * 0.62), int(rid * 0.38), int(rid),
                int(prev_rid), int(per_station_daily * hw * 1.02),
                interchange, peak_hour, round(importance, 4),
                1.0, growth,
                round(rid * 0.96, 1), round(rid * 0.98, 1)
            ]
            
            X = np.array([feat])
            
            if scale_features and self.scaler:
                try: X = self.scaler.transform(X)
                except: pass
            
            pred = model.predict(X)[0]
            proba = model.predict_proba(X)[0]
            label = LABEL_ORDER[pred]
            
            results.append({
                "time": curr_time.strftime("%H:%M"),
                "crowd_level": label,
                "confidence": round(float(max(proba)) * 100, 1),
                "estimated_ridership": int(rid)
            })
            prev_rid = rid
            
        return results
