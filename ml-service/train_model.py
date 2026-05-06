"""
Train a demand prediction model on synthetic hospital data.
Run once: python train_model.py
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
import os

np.random.seed(42)
N = 5000  # samples

# ── Synthetic Dataset ──────────────────────────────────────────────────────────
# Features that affect hospital demand:
# - hour_of_day: emergencies spike at night/evening
# - day_of_week: weekends see more accidents
# - occupancy_rate: current load
# - ambulances_ratio: ambulances available vs total
# - season: monsoon spikes (0=winter, 1=spring, 2=summer, 3=monsoon)

hour = np.random.randint(0, 24, N)
day = np.random.randint(0, 7, N)
occupancy = np.random.uniform(0.3, 1.0, N)
amb_ratio = np.random.uniform(0.1, 1.0, N)
season = np.random.randint(0, 4, N)

# ── Demand Label Logic (realistic rules) ──────────────────────────────────────
demand = []
for i in range(N):
    score = 0

    # Night/evening hours drive emergencies
    if hour[i] in range(20, 24) or hour[i] in range(0, 4):
        score += 2
    elif hour[i] in range(17, 20):
        score += 1

    # Weekends (5, 6) = more accidents
    if day[i] in [5, 6]:
        score += 1

    # High occupancy = high demand
    if occupancy[i] > 0.85:
        score += 3
    elif occupancy[i] > 0.70:
        score += 2
    elif occupancy[i] > 0.55:
        score += 1

    # Low ambulances = high demand scenario
    if amb_ratio[i] < 0.3:
        score += 2
    elif amb_ratio[i] < 0.5:
        score += 1

    # Monsoon (season 3) spikes
    if season[i] == 3:
        score += 1

    # Add noise
    score += np.random.randint(-1, 2)
    score = max(0, score)

    if score <= 2:
        demand.append("low")
    elif score <= 5:
        demand.append("medium")
    else:
        demand.append("high")

df = pd.DataFrame({
    "hour_of_day": hour,
    "day_of_week": day,
    "occupancy_rate": occupancy,
    "ambulances_ratio": amb_ratio,
    "season": season,
    "demand": demand,
})

# ── Train Model ───────────────────────────────────────────────────────────────
le = LabelEncoder()
df["demand_encoded"] = le.fit_transform(df["demand"])

X = df[["hour_of_day", "day_of_week", "occupancy_rate", "ambulances_ratio", "season"]]
y = df["demand_encoded"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print("\n📊 Model Performance:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# ── Save Artifacts ────────────────────────────────────────────────────────────
os.makedirs("model", exist_ok=True)
joblib.dump(model, "model/demand_model.pkl")
joblib.dump(le, "model/label_encoder.pkl")

print("✅ Model saved to model/demand_model.pkl")
print(f"📈 Training accuracy: {model.score(X_train, y_train):.3f}")
print(f"📉 Test accuracy: {model.score(X_test, y_test):.3f}")
