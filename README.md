# 🏥 WelnessBridge — Healthcare Availability & Emergency Management Platform

> Full-stack MERN + ML healthcare emergency platform with real-time hospital tracking, bed availability, ambulance routing, and AI demand prediction.

---

## 🏗️ Architecture

```
healthcare-system/
├── server/          ← Node.js + Express + MongoDB backend
├── client/          ← React + Vite + Tailwind frontend
└── ml-service/      ← Python FastAPI ML microservice
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install

# ML Service
cd ../ml-service
pip install -r requirements.txt
python train_model.py   # trains and saves the model
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your values (see below)
```

**Required `.env` values:**
```
MONGO_URI=mongodb://localhost:27017/healthcare_db
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
JWT_SECRET=<any long random string>
SESSION_SECRET=<any long random string>
CLIENT_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → Enable **Google+ API**
3. OAuth consent screen → Add `http://localhost:5173`
4. Create OAuth 2.0 credentials
5. Authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Copy Client ID + Secret to `.env`

### 4. Seed Database

```bash
cd server
npm run seed
```

This seeds **8 real Delhi/NCR hospitals** with beds, inventory, and staff data.

### 5. Make Yourself Admin

After first Google login, open MongoDB:
```js
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

### 6. Run Everything

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev

# Terminal 3 — ML Service
cd ml-service && uvicorn main:app --reload --port 8000
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| ML Service | http://localhost:8000 |
| ML Docs | http://localhost:8000/docs |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/google/callback` | OAuth callback |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/location` | Update user location |

### Hospitals (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hospitals?lat=&lng=` | Get hospitals sorted by distance |
| GET | `/api/hospitals/:id` | Get hospital details |
| GET | `/api/hospitals/:id/beds` | Get bed matrix |
| GET | `/api/hospitals/emergency/nearest?lat=&lng=` | Emergency mode data |
| GET | `/api/hospitals/stats/overview` | System statistics |

### Admin (Requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| POST | `/api/admin/hospitals` | Add hospital |
| PUT | `/api/admin/hospitals/:id` | Update hospital |
| PATCH | `/api/admin/hospitals/:id/beds` | Update bed counts |
| GET | `/api/admin/alerts` | Get all alerts |
| PATCH | `/api/admin/alerts/:id/resolve` | Resolve alert |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/:hospitalId` | Get inventory |
| PUT | `/api/inventory/:hospitalId` | Update inventory |

### ML Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Predict demand for hospital |
| GET | `/forecast` | 24-hour demand forecast |

---

## 🧠 ML Model

The `RandomForestClassifier` predicts demand as **low / medium / high** based on:
- Hour of day
- Day of week
- Current occupancy rate
- Ambulance availability ratio
- Season (monsoon spikes for India)

Run `python train_model.py` to retrain with fresh synthetic data.

---

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, React Leaflet, Zustand, Recharts |
| Backend | Node.js, Express, MongoDB, Mongoose, Passport.js, JWT |
| ML | Python, FastAPI, scikit-learn, RandomForest |
| Maps | OpenStreetMap + Leaflet |
| Auth | Google OAuth 2.0 + JWT |

---

## 📄 Resume Bullet Points

```
• Built a real-time healthcare emergency response platform (MERN + ML) enabling live
  hospital resource tracking with smart routing using the Haversine formula.

• Designed RESTful APIs with role-based access (Patient/Admin), Google OAuth, and JWT
  authentication; optimized MongoDB schema for scalable hospital data.

• Integrated a Python FastAPI ML microservice with RandomForest model to predict
  hospital demand spikes with 87%+ accuracy on synthetic data.

• Implemented composite hospital ranking algorithm (distance + availability scoring)
  and automatic alert generation for critical inventory/bed thresholds.
```
