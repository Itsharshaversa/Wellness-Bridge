import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { AlertTriangle, MapPin, RefreshCw, Navigation, X, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import HospitalCard from "../components/HospitalCard";
import { hospitalAPI } from "../services/api";
import useAuthStore from "../store/authStore";

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const hospitalIcon = (available, total) => {
  const pct = total > 0 ? (available / total) * 100 : 0;
  const color = pct > 30 ? "#22c55e" : pct > 10 ? "#f59e0b" : "#ef4444";
  return L.divIcon({
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${color}60"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const userIcon = L.divIcon({
  html: `<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px #3b82f680"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 13); }, [center]);
  return null;
}

export default function MapDashboard() {
  const { user, updateLocation } = useAuthStore();
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const getLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve({ lat: 28.6469, lng: 77.3181 }) // Ghaziabad default
    );
  });

  const fetchHospitals = useCallback(async (lat, lng, emergency = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = emergency
        ? hospitalAPI.getNearestEmergency(lat, lng)
        : hospitalAPI.getAll(lat, lng);
      const { data } = await endpoint;
      setHospitals(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Could not load hospitals. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initMap = async () => {
    const loc = await getLocation();
    setUserLocation(loc);
    updateLocation(loc.lat, loc.lng);
    await fetchHospitals(loc.lat, loc.lng);
  };

  useEffect(() => { initMap(); }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh || !userLocation) return;
    const interval = setInterval(() => {
      fetchHospitals(userLocation.lat, userLocation.lng, isEmergency);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, userLocation, isEmergency]);

  const handleEmergency = async () => {
    const newState = !isEmergency;
    setIsEmergency(newState);
    if (userLocation) {
      await fetchHospitals(userLocation.lat, userLocation.lng, newState);
    }
  };

  const defaultCenter = userLocation || { lat: 28.6469, lng: 77.3181 };

  return (
    <div className="min-h-screen bg-[#080d18]">
      <Navbar />

      <div className="pt-16 h-screen flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-[380px] w-full md:h-full overflow-y-auto bg-slate-900/60 border-r border-slate-800/60 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800/60 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-white">
                {isEmergency ? "🚨 Emergency Mode" : "Nearby Hospitals"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRefresh(v => !v)}
                  title="Toggle auto-refresh"
                  className={`p-2 rounded-lg transition-colors text-xs flex items-center gap-1 ${autoRefresh ? "bg-green-500/20 text-green-400" : "text-slate-500 hover:text-white"}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => userLocation && fetchHospitals(userLocation.lat, userLocation.lng, isEmergency)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Emergency Button */}
            <button
              onClick={handleEmergency}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                isEmergency
                  ? "bg-red-500 text-white emergency-glow"
                  : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
              }`}
            >
              {isEmergency ? "🚨 EMERGENCY ACTIVE — Tap to Deactivate" : "🚨 EMERGENCY — Find Nearest Hospital"}
            </button>

            {lastUpdated && (
              <p className="text-slate-500 text-xs mt-2 text-center">
                Updated {lastUpdated.toLocaleTimeString()}
                {autoRefresh && <span className="text-green-400 ml-1">· Auto-refreshing</span>}
              </p>
            )}
          </div>

          {/* Hospital List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                <p className="text-slate-400 text-sm">
                  {isEmergency ? "Finding nearest hospitals..." : "Loading hospitals..."}
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <p className="text-slate-400 text-sm">{error}</p>
              </div>
            ) : hospitals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <MapPin className="w-8 h-8 text-slate-600" />
                <p className="text-slate-400 text-sm">No hospitals found in your area</p>
              </div>
            ) : (
              hospitals.map(h => (
                <div key={h._id} onClick={() => setSelectedHospital(h)}>
                  <HospitalCard hospital={h} isEmergency={isEmergency} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {userLocation && (
            <MapContainer
              center={[defaultCenter.lat, defaultCenter.lng]}
              zoom={12}
              className="w-full h-full"
              style={{ minHeight: "400px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <RecenterMap center={userLocation ? [userLocation.lat, userLocation.lng] : null} />

              {/* User location */}
              <Marker position={[defaultCenter.lat, defaultCenter.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>📍 Your Location</strong>
                  </div>
                </Popup>
              </Marker>

              {/* User radius circle */}
              <Circle
                center={[defaultCenter.lat, defaultCenter.lng]}
                radius={10000}
                color="#3b82f6"
                fillColor="#3b82f6"
                fillOpacity={0.04}
                weight={1}
              />

              {/* Hospital markers */}
              {hospitals.map(h => (
                <Marker
                  key={h._id}
                  position={[h.location.lat, h.location.lng]}
                  icon={hospitalIcon(h.availableBeds, h.totalBeds)}
                >
                  <Popup maxWidth={260}>
                    <div className="space-y-2">
                      <strong className="text-white block">{h.name}</strong>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="text-center">
                          <div className="font-bold text-green-400">{h.availableBeds}</div>
                          <div className="text-slate-400">Beds</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-yellow-400">{h.ambulancesAvailable}</div>
                          <div className="text-slate-400">Ambulance</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-blue-400">{h.distance}km</div>
                          <div className="text-slate-400">Away</div>
                        </div>
                      </div>
                      {h.contact?.emergency && (
                        <a href={`tel:${h.contact.emergency}`} className="block text-center text-xs text-red-400 border border-red-500/30 rounded-lg py-1.5 hover:bg-red-500/10">
                          📞 {h.contact.emergency}
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {!userLocation && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900">
              <Navigation className="w-10 h-10 text-green-400 animate-bounce" />
              <p className="text-slate-400">Getting your location...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
