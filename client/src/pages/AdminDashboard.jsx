import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity, Bed, AlertTriangle, Users, Plus, Check, X, ChevronRight, Loader2, Package, Edit } from "lucide-react";
import Navbar from "../components/Navbar";
import { adminAPI } from "../services/api";

const StatCard = ({ icon: Icon, label, value, color = "text-green-400", sub }) => (
  <div className="card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className={`font-display font-bold text-3xl ${color}`}>{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
      <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [editBeds, setEditBeds] = useState(null); // {id, availableBeds, totalBeds, ...}
  const [newHospital, setNewHospital] = useState({
    name: "", address: "", "location.lat": "", "location.lng": "",
    "contact.phone": "", "contact.emergency": "", totalBeds: "", availableBeds: "",
    icuTotal: "", icuAvailable: "", ambulancesTotal: "", ambulancesAvailable: "", type: "government",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [{ data: st }, { data: h }, { data: al }] = await Promise.all([
        adminAPI.getStats(), adminAPI.getHospitals(), adminAPI.getAlerts(),
      ]);
      setStats(st); setHospitals(h); setAlerts(al);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newHospital.name,
        address: newHospital.address,
        location: { lat: parseFloat(newHospital["location.lat"]), lng: parseFloat(newHospital["location.lng"]) },
        contact: { phone: newHospital["contact.phone"], emergency: newHospital["contact.emergency"] },
        totalBeds: parseInt(newHospital.totalBeds),
        availableBeds: parseInt(newHospital.availableBeds),
        icuTotal: parseInt(newHospital.icuTotal) || 0,
        icuAvailable: parseInt(newHospital.icuAvailable) || 0,
        ambulancesTotal: parseInt(newHospital.ambulancesTotal) || 0,
        ambulancesAvailable: parseInt(newHospital.ambulancesAvailable) || 0,
        type: newHospital.type,
      };
      await adminAPI.createHospital(payload);
      setShowAddHospital(false);
      loadData();
    } catch (err) {
      alert("Failed to add hospital: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateBeds = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateBeds(editBeds.id, {
        availableBeds: parseInt(editBeds.availableBeds),
        totalBeds: parseInt(editBeds.totalBeds),
        icuAvailable: parseInt(editBeds.icuAvailable),
        ambulancesAvailable: parseInt(editBeds.ambulancesAvailable),
      });
      setEditBeds(null);
      loadData();
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleResolveAlert = async (id) => {
    await adminAPI.resolveAlert(id);
    setAlerts(alerts.map(a => a._id === id ? { ...a, isResolved: true } : a));
  };

  const chartData = hospitals.slice(0, 8).map(h => ({
    name: h.name.split(" ")[0],
    available: h.availableBeds,
    occupied: h.totalBeds - h.availableBeds,
  }));

  const tabs = ["overview", "hospitals", "alerts"];

  if (isLoading) return (
    <div className="min-h-screen bg-[#080d18]">
      <Navbar />
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080d18]">
      <Navbar />
      <div className="pt-16 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage hospitals, beds, and alerts</p>
          </div>
          <button onClick={() => setShowAddHospital(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Hospital
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Activity} label="Hospitals" value={stats?.totalHospitals} />
          <StatCard icon={Bed} label="Available Beds" value={stats?.availableBeds} sub={`${stats?.occupancyRate}% occupancy`} color={stats?.occupancyRate >= 80 ? "text-red-400" : "text-green-400"} />
          <StatCard icon={Users} label="Patients" value={stats?.totalPatients} color="text-blue-400" />
          <StatCard icon={AlertTriangle} label="Active Alerts" value={stats?.activeAlerts} color={stats?.activeAlerts > 0 ? "text-red-400" : "text-green-400"} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 w-fit">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === t ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-4">Bed Availability by Hospital</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={4}>
                <XAxis dataKey="name" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "0.75rem", color: "#e2e8f0" }} />
                <Bar dataKey="available" name="Available" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="occupied" name="Occupied" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "hospitals" && (
          <div className="space-y-3">
            {hospitals.map(h => (
              <div key={h._id} className="card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white text-sm">{h.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${h.isActive ? "badge-available" : "badge-occupied"}`}>
                      {h.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">{h.address}</p>
                  <div className="flex gap-4 mt-2 text-xs text-slate-400">
                    <span>Beds: <strong className="text-green-400">{h.availableBeds}</strong>/{h.totalBeds}</span>
                    <span>ICU: <strong className="text-blue-400">{h.icuAvailable}</strong>/{h.icuTotal}</span>
                    <span>Amb: <strong className="text-yellow-400">{h.ambulancesAvailable}</strong>/{h.ambulancesTotal}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setEditBeds({ id: h._id, availableBeds: h.availableBeds, totalBeds: h.totalBeds, icuAvailable: h.icuAvailable, ambulancesAvailable: h.ambulancesAvailable })}
                    className="flex items-center gap-1.5 text-xs border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Update Beds
                  </button>
                  <Link
                    to={`/admin/inventory/${h._id}`}
                    className="flex items-center gap-1.5 text-xs border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" /> Inventory
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="card text-center py-10 text-slate-400">No alerts found</div>
            ) : alerts.map(alert => (
              <div key={alert._id} className={`card flex items-start justify-between gap-4 ${alert.isResolved ? "opacity-50" : ""}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      alert.severity === "critical" ? "badge-occupied" :
                      alert.severity === "high" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" :
                      "badge-warning"
                    }`}>{alert.severity?.toUpperCase()}</span>
                    <span className="text-slate-500 text-xs capitalize">{alert.type?.replace("_", " ")}</span>
                  </div>
                  <p className="text-white text-sm">{alert.message}</p>
                  <p className="text-slate-500 text-xs mt-1">{alert.hospital?.name} · {new Date(alert.createdAt).toLocaleDateString()}</p>
                </div>
                {!alert.isResolved && (
                  <button onClick={() => handleResolveAlert(alert._id)} className="flex items-center gap-1.5 text-xs text-green-400 border border-green-500/30 px-3 py-2 rounded-xl hover:bg-green-500/10 transition-colors flex-shrink-0">
                    <Check className="w-3.5 h-3.5" /> Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Hospital Modal */}
      {showAddHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="font-display font-bold text-white">Add New Hospital</h3>
              <button onClick={() => setShowAddHospital(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddHospital} className="p-5 space-y-4">
              {[
                ["Hospital Name", "name", "text", true],
                ["Address", "address", "text", true],
                ["Latitude", "location.lat", "number", true],
                ["Longitude", "location.lng", "number", true],
                ["Phone", "contact.phone", "text", true],
                ["Emergency Number", "contact.emergency", "text", false],
                ["Total Beds", "totalBeds", "number", true],
                ["Available Beds", "availableBeds", "number", true],
                ["ICU Total", "icuTotal", "number", false],
                ["ICU Available", "icuAvailable", "number", false],
                ["Ambulances Total", "ambulancesTotal", "number", false],
                ["Ambulances Available", "ambulancesAvailable", "number", false],
              ].map(([label, key, type, required]) => (
                <div key={key}>
                  <label className="text-slate-400 text-xs mb-1 block">{label}{required && " *"}</label>
                  <input
                    type={type}
                    step={type === "number" ? "any" : undefined}
                    required={required}
                    value={newHospital[key]}
                    onChange={e => setNewHospital(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Type</label>
                <select value={newHospital.type} onChange={e => setNewHospital(p => ({ ...p, type: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500">
                  <option value="government">Government</option>
                  <option value="private">Private</option>
                  <option value="clinic">Clinic</option>
                  <option value="trauma_center">Trauma Center</option>
                </select>
              </div>
              <button type="submit" className="w-full btn-primary">Add Hospital</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Beds Modal */}
      {editBeds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="font-display font-bold text-white">Update Bed Count</h3>
              <button onClick={() => setEditBeds(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateBeds} className="p-5 space-y-4">
              {[
                ["Total Beds", "totalBeds"],
                ["Available Beds", "availableBeds"],
                ["ICU Available", "icuAvailable"],
                ["Ambulances Available", "ambulancesAvailable"],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="text-slate-400 text-xs mb-1 block">{label}</label>
                  <input type="number" value={editBeds[key] || 0}
                    onChange={e => setEditBeds(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
                </div>
              ))}
              <button type="submit" className="w-full btn-primary">Update</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
