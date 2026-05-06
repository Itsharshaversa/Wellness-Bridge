import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, MapPin, Bed, Truck, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import HospitalCard from "../components/HospitalCard";
import { hospitalAPI } from "../services/api";
import useAuthStore from "../store/authStore";

const StatCard = ({ icon: Icon, label, value, color = "text-green-400", sub }) => (
  <div className="card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const [hospitals, setHospitals] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // Get location
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(loc);
            const [{ data: hosp }, { data: st }] = await Promise.all([
              hospitalAPI.getAll(loc.lat, loc.lng),
              hospitalAPI.getStats(),
            ]);
            setHospitals(hosp.slice(0, 6));
            setStats(st);
            setIsLoading(false);
          },
          async () => {
            // fallback
            const loc = { lat: 28.6469, lng: 77.3181 };
            setUserLocation(loc);
            const [{ data: hosp }, { data: st }] = await Promise.all([
              hospitalAPI.getAll(loc.lat, loc.lng),
              hospitalAPI.getStats(),
            ]);
            setHospitals(hosp.slice(0, 6));
            setStats(st);
            setIsLoading(false);
          }
        );
      } catch {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#080d18]">
      <Navbar />
      <div className="pt-16 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-400 mt-1">Real-time healthcare data for your area</p>
          </div>
          <Link to="/map" className="btn-emergency flex items-center gap-2 self-start">
            🚨 Emergency Map <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Activity} label="Total Hospitals" value={stats?.totalHospitals ?? "—"} />
              <StatCard icon={Bed} label="Available Beds" value={stats?.availableBeds ?? "—"} color="text-green-400" sub={`of ${stats?.totalBeds} total`} />
              <StatCard icon={TrendingUp} label="Occupancy Rate" value={stats ? `${stats.occupancyRate}%` : "—"} color={stats?.occupancyRate >= 80 ? "text-red-400" : "text-yellow-400"} />
              <StatCard icon={Ambulance} label="Ambulances Free" value={stats?.availableAmbulances ?? "—"} color="text-blue-400" sub={`of ${stats?.totalAmbulances} total`} />
            </div>

            {/* Hospital List */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-white">Hospitals Near You</h2>
              <Link to="/map" className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1">
                View all on map <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospitals.map(h => (
                <HospitalCard key={h._id} hospital={h} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
