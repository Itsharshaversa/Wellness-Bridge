"""
Healthcare Demand Prediction ML Microservice
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import numpy as np
import os
from datetime import datetime

app = FastAPI(title="Healthcare ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Model ────────────────────────────────────────────────────────────────
MODEL_PATH = "model/demand_model.pkl"
ENCODER_PATH = "model/label_encoder.pkl"

model = None
label_encoder = None

@app.on_event("startup")
async def load_model():
    global model, label_encoder
    try:
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        print("✅ ML model loaded successfully")
    except Exception as e:
        print(f"⚠️ Could not load model: {e}. Run train_model.py first.")

# ── Schemas ───────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    hospital_id: str
    available_beds: int
    total_beds: int
    ambulances_available: int
    ambulances_total: Optional[int] = 10
    hour_of_day: Optional[int] = None
    day_of_week: Optional[int] = None

class PredictResponse(BaseModel):
    hospital_id: str
    predicted_demand: str
    confidence: float
    alert: Optional[str]
    recommendation: str
    occupancy_rate: float

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ML Service Running 🧠", "model_loaded": model is not None}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run train_model.py first.")

    now = datetime.now()
    hour = req.hour_of_day if req.hour_of_day is not None else now.hour
    day = req.day_of_week if req.day_of_week is not None else now.weekday()

    occupancy_rate = (req.total_beds - req.available_beds) / max(req.total_beds, 1)
    amb_ratio = req.ambulances_available / max(req.ambulances_total or 10, 1)

    # Determine season (rough mapping for India)
    month = now.month
    season = 0  # winter
    if month in [3, 4, 5]: season = 1   # spring
    elif month in [4, 5, 6]: season = 2  # summer
    elif month in [7, 8, 9]: season = 3  # monsoon

    features = np.array([[hour, day, occupancy_rate, amb_ratio, season]])
    pred_encoded = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = float(max(probabilities))

    demand_label = label_encoder.inverse_transform([pred_encoded])[0]

    # Generate alert message
    alert = None
    if demand_label == "high":
        alert = f"⚠️ High demand predicted. Occupancy at {occupancy_rate*100:.0f}%. Consider redirecting patients."
    elif demand_label == "medium" and occupancy_rate > 0.8:
        alert = f"📈 Moderate-high load. Monitor bed availability closely."

    recommendations = {
        "low": "Normal operations. No immediate action needed.",
        "medium": "Moderate load expected. Ensure staff is on standby.",
        "high": "High demand incoming. Activate emergency protocols and notify nearby hospitals.",
    }

    return PredictResponse(
        hospital_id=req.hospital_id,
        predicted_demand=demand_label,
        confidence=round(confidence, 3),
        alert=alert,
        recommendation=recommendations[demand_label],
        occupancy_rate=round(occupancy_rate, 3),
    )

@app.get("/forecast")
def forecast():
    """Returns a 24-hour demand forecast for all hospitals (demo)"""
    if model is None:
        return {"forecast": [], "message": "Model not loaded"}

    now = datetime.now()
    forecast_data = []

    for hour_offset in range(0, 24, 3):
        hour = (now.hour + hour_offset) % 24
        day = now.weekday()
        occupancy = 0.65 + (0.1 * np.sin(hour * 0.3))  # simulated daily pattern
        amb_ratio = 0.6
        season = 3 if now.month in [7, 8, 9] else 0

        features = np.array([[hour, day, occupancy, amb_ratio, season]])
        pred_encoded = model.predict(features)[0]
        demand = label_encoder.inverse_transform([pred_encoded])[0]
        probas = model.predict_proba(features)[0]

        forecast_data.append({
            "hour": hour,
            "demand": demand,
            "confidence": round(float(max(probas)), 3),
            "estimated_occupancy": round(occupancy * 100, 1),
        })

    return {"forecast": forecast_data, "generated_at": now.isoformat()}

@app.get("/health")
def health():
    return {"status": "healthy", "model_ready": model is not None}
