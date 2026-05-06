import { useState } from "react";

const BedTooltip = ({ bed }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-slate-800 border border-slate-600 rounded-lg p-2 text-xs whitespace-nowrap shadow-xl pointer-events-none">
    <div className="font-medium text-white">{bed.id}</div>
    <div className="text-slate-400 capitalize">{bed.type} · {bed.ward}</div>
    <div className={`capitalize font-medium mt-0.5 ${
      bed.status === "available" ? "text-green-400" :
      bed.status === "occupied" ? "text-red-400" :
      bed.status === "reserved" ? "text-yellow-400" : "text-slate-400"
    }`}>{bed.status}</div>
  </div>
);

const BedCell = ({ bed }) => {
  const [hovered, setHovered] = useState(false);
  const colorMap = {
    available: "bed-available",
    occupied: "bed-occupied",
    reserved: "bed-reserved",
    maintenance: "bed-maintenance",
  };

  return (
    <div
      className={`bed-cell ${colorMap[bed.status]} relative`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && <BedTooltip bed={bed} />}
    </div>
  );
};

export default function BedMatrix({ beds = [], summary }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? beds : beds.filter(b => b.status === filter);
  const types = ["all", "available", "occupied", "reserved", "maintenance"];

  return (
    <div className="space-y-4">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: summary.total, color: "text-white" },
            { label: "Available", value: summary.available, color: "text-green-400" },
            { label: "Occupied", value: summary.occupied, color: "text-red-400" },
            { label: "Occupancy", value: `${summary.occupancyRate}%`, color: summary.occupancyRate >= 90 ? "text-red-400" : "text-yellow-400" },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/60 rounded-xl p-3 text-center">
              <div className={`text-xl font-display font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Legend + Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${filter === t ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Occupied</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" /> Reserved</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-600 inline-block" /> Maint.</span>
        </div>
      </div>

      {/* Grid */}
      {beds.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 bg-slate-800/30 rounded-xl p-4">
          {filtered.map((bed) => <BedCell key={bed.id || bed._id} bed={bed} />)}
        </div>
      ) : (
        <div className="bg-slate-800/30 rounded-xl p-8 text-center text-slate-500 text-sm">
          Bed data not available (showing summary only)
        </div>
      )}
    </div>
  );
}
