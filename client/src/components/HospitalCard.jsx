import { useNavigate } from "react-router-dom";
import { MapPin, Bed, Truck, Clock, Phone, ChevronRight } from "lucide-react";

const OccupancyBar = ({ available, total }) => {
  const pct = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Occupancy</span>
        <span className={pct >= 90 ? "text-red-400" : pct >= 70 ? "text-yellow-400" : "text-green-400"}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default function HospitalCard({ hospital, isEmergency = false }) {
  const navigate = useNavigate();
  const { _id, name, address, availableBeds, totalBeds, icuAvailable, ambulancesAvailable, distance, eta, contact, rating, type } = hospital;

  const typeColors = {
    government: "text-blue-400 bg-blue-400/10",
    private: "text-purple-400 bg-purple-400/10",
    clinic: "text-green-400 bg-green-400/10",
    trauma_center: "text-red-400 bg-red-400/10",
  };

  return (
    <div
      className={`card hover:border-slate-600 cursor-pointer transition-all duration-200 group ${isEmergency && availableBeds === 0 ? "opacity-50" : ""}`}
      onClick={() => navigate(`/hospital/${_id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-display font-semibold text-white text-sm truncate">{name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[type] || typeColors.government}`}>
              {type?.replace("_", " ")}
            </span>
          </div>
          <p className="text-slate-500 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{address}</span>
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0 ml-2 transition-colors" />
      </div>

      {/* Distance + ETA */}
      {distance !== undefined && (
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3 text-green-400" />
            <span className="text-white font-medium">{distance} km</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3 h-3 text-yellow-400" />
            <span className="text-white font-medium">~{eta} min</span>
          </div>
          <div className="flex items-center gap-1 text-xs ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-400">Live</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
          <div className={`text-base font-bold font-display ${availableBeds === 0 ? "text-red-400" : availableBeds < 10 ? "text-yellow-400" : "text-green-400"}`}>
            {availableBeds}
          </div>
          <div className="text-slate-500 text-[10px] mt-0.5">Beds Free</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
          <div className={`text-base font-bold font-display ${icuAvailable === 0 ? "text-red-400" : "text-blue-400"}`}>
            {icuAvailable ?? "—"}
          </div>
          <div className="text-slate-500 text-[10px] mt-0.5">ICU Free</div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
          <div className={`text-base font-bold font-display ${ambulancesAvailable === 0 ? "text-red-400" : "text-yellow-400"}`}>
            {ambulancesAvailable}
          </div>
          <div className="text-slate-500 text-[10px] mt-0.5">Ambulance</div>
        </div>
      </div>

      {/* Occupancy bar */}
      <OccupancyBar available={availableBeds} total={totalBeds} />

      {/* Actions */}
      {isEmergency && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 flex gap-2">
          <a
            href={`tel:${contact?.emergency || contact?.phone}`}
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl py-2 text-xs font-medium transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            Emergency Call
          </a>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/hospital/${_id}`); }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl py-2 text-xs font-medium transition-colors"
          >
            View Details
          </button>
        </div>
      )}
    </div>
  );
}
