import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Phone, MapPin, Star, Bed, Truck, Loader2, Activity, Droplet, Wind } from "lucide-react";
import Navbar from "../components/Navbar";
import BedMatrix from "../components/BedMatrix";
import { hospitalAPI, inventoryAPI, mlAPI } from "../services/api";

const InfoRow = ({ label, value, color = "" }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
    <span className="text-slate-400 text-sm">{label}</span>
    <span className={`font-medium text-sm ${color || "text-white"}`}>{value}</span>
  </div>
);

const DemandBadge = ({ demand }) => {
  const colors = { low: "badge-available", medium: "badge-warning", high: "badge-occupied" };
  return <span className={colors[demand] || "badge-warning"}>{demand?.toUpperCase()} demand</span>;
};

export default function HospitalDetail() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [beds, setBeds] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [activeTab, setActiveTab] = useState("beds");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [{ data: h }, { data: b }] = await Promise.all([
          hospitalAPI.getById(id),
          hospitalAPI.getBeds(id),
        ]);
        setHospital(h);
        setBeds(b);

        // Load inventory + prediction in background
        inventoryAPI.get(id).then(r => setInventory(r.data)).catch(() => {});
        mlAPI.predict(id).then(r => setPrediction(r.data)).catch(() => {});
      } catch {
        // handle error
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#080d18]">
      <Navbar />
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    </div>
  );

  if (!hospital) return (
    <div className="min-h-screen bg-[#080d18]">
      <Navbar />
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Hospital not found.</p>
      </div>
    </div>
  );

  const tabs = ["beds", "inventory", "info", "ml"];

  return (
    <div className="min-h-screen bg-[#080d18]">
      <Navbar />
      <div className="pt-16 max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="font-display font-bold text-2xl text-white">{hospital.name}</h1>
                <span className="badge-available capitalize">{hospital.type?.replace("_", " ")}</span>
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5" /> {hospital.address}
              </p>
              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{hospital.rating}</span>
                <span className="text-slate-500 ml-1">rating</span>
              </div>
            </div>

            {/* Contact */}
            <div className="flex gap-2 flex-wrap">
              {hospital.contact?.phone && (
                <a href={`tel:${hospital.contact.phone}`} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white transition-colors">
                  <Phone className="w-4 h-4 text-green-400" /> {hospital.contact.phone}
                </a>
              )}
              {hospital.contact?.emergency && (
                <a href={`tel:${hospital.contact.emergency}`} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-2 text-sm text-red-400 transition-colors">
                  🚨 Emergency
                </a>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {[
              { label: "Available Beds", value: hospital.availableBeds, total: hospital.totalBeds, color: hospital.availableBeds < 10 ? "text-red-400" : "text-green-400" },
              { label: "ICU Available", value: hospital.icuAvailable, total: hospital.icuTotal, color: hospital.icuAvailable === 0 ? "text-red-400" : "text-blue-400" },
              { label: "Ambulances", value: hospital.ambulancesAvailable, total: hospital.ambulancesTotal, color: "text-yellow-400" },
              { label: "Occupancy", value: `${hospital.totalBeds > 0 ? Math.round(((hospital.totalBeds - hospital.availableBeds) / hospital.totalBeds) * 100) : 0}%`, color: "text-white" },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/60 rounded-xl p-3 text-center">
                <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
                {s.total !== undefined && <div className="text-slate-500 text-xs">of {s.total}</div>}
                <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === t ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {t === "ml" ? "🧠 AI Predict" : t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card">
          {activeTab === "beds" && beds && (
            <BedMatrix beds={beds.beds} summary={beds.summary} />
          )}

          {activeTab === "inventory" && (
            inventory ? (
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-white">Inventory Status</h3>

                {/* Oxygen + Ventilators */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300 text-sm font-medium">Oxygen Level</span>
                    </div>
                    <div className={`text-3xl font-display font-bold ${inventory.oxygenLevel < 30 ? "text-red-400" : inventory.oxygenLevel < 50 ? "text-yellow-400" : "text-green-400"}`}>
                      {inventory.oxygenLevel}%
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${inventory.oxygenLevel}%` }} />
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-300 text-sm font-medium">Ventilators</span>
                    </div>
                    <div className="text-3xl font-display font-bold text-purple-400">
                      {inventory.ventilatorsAvailable}
                    </div>
                    <div className="text-slate-500 text-xs mt-1">of {inventory.ventilators} total</div>
                  </div>
                </div>

                {/* Blood Units */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplet className="w-4 h-4 text-red-400" />
                    <span className="text-slate-300 text-sm font-medium">Blood Units Available</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(inventory.bloodUnits || {}).map(([type, qty]) => (
                      <div key={type} className="text-center bg-slate-900/60 rounded-lg p-2">
                        <div className={`text-base font-display font-bold ${qty < 5 ? "text-red-400" : qty < 10 ? "text-yellow-400" : "text-green-400"}`}>{qty}</div>
                        <div className="text-slate-500 text-[10px] mt-0.5">{type.replace("_", "-")}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items table */}
                <div className="space-y-2">
                  {(inventory.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-800/40 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-slate-500 text-xs capitalize">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-display font-bold text-sm ${item.quantity <= item.minThreshold ? "text-red-400" : "text-green-400"}`}>
                          {item.quantity} {item.unit}
                        </p>
                        {item.quantity <= item.minThreshold && (
                          <span className="text-xs text-red-400">⚠ Low stock</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">Inventory data unavailable</div>
            )
          )}

          {activeTab === "info" && (
            <div className="space-y-2">
              <InfoRow label="Hospital Type" value={hospital.type?.replace("_", " ")} />
              <InfoRow label="Total Beds" value={hospital.totalBeds} />
              <InfoRow label="ICU Capacity" value={hospital.icuTotal} />
              <InfoRow label="Total Ambulances" value={hospital.ambulancesTotal} />
              <InfoRow label="Phone" value={hospital.contact?.phone || "—"} />
              <InfoRow label="Emergency" value={hospital.contact?.emergency || "—"} color="text-red-400" />
              <InfoRow label="Email" value={hospital.contact?.email || "—"} />
              <div className="mt-4">
                <p className="text-slate-400 text-sm mb-2">Services</p>
                <div className="flex flex-wrap gap-2">
                  {(hospital.services || []).map(s => (
                    <span key={s} className="badge-available capitalize">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ml" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-white">AI Demand Prediction</h3>
              {prediction ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-xs mb-2">Predicted Demand</p>
                      <DemandBadge demand={prediction.predicted_demand} />
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                      <p className="text-slate-400 text-xs mb-2">Confidence</p>
                      <p className="text-white font-display font-bold text-xl">{Math.round(prediction.confidence * 100)}%</p>
                    </div>
                  </div>
                  {prediction.alert && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
                      {prediction.alert}
                    </div>
                  )}
                  <div className="bg-slate-800/40 rounded-xl p-4">
                    <p className="text-slate-400 text-xs mb-1">Recommendation</p>
                    <p className="text-white text-sm">{prediction.recommendation}</p>
                  </div>
                  {prediction.fallback && (
                    <p className="text-slate-500 text-xs">⚠ ML service offline — showing fallback prediction</p>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-10 gap-3">
                  <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                  <span className="text-slate-400 text-sm">Loading prediction...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
