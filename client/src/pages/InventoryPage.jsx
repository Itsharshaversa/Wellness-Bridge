import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Loader2, Wind, Droplet, Activity } from "lucide-react";
import Navbar from "../components/Navbar";
import { inventoryAPI, adminAPI } from "../services/api";

export default function InventoryPage() {
  const { hospitalId } = useParams();
  const [inventory, setInventory] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: inv }, { data: hospitals }] = await Promise.all([
          inventoryAPI.get(hospitalId),
          adminAPI.getHospitals(),
        ]);
        setInventory(inv);
        setHospital(hospitals.find(h => h._id === hospitalId));
      } catch {}
      setIsLoading(false);
    };
    load();
  }, [hospitalId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await inventoryAPI.update(hospitalId, {
        oxygenLevel: inventory.oxygenLevel,
        ventilators: inventory.ventilators,
        ventilatorsAvailable: inventory.ventilatorsAvailable,
        bloodUnits: inventory.bloodUnits,
        items: inventory.items,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setIsSaving(false);
  };

  const updateItem = (index, field, value) => {
    setInventory(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: field === "quantity" || field === "minThreshold" ? parseInt(value) || 0 : value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setInventory(prev => ({
      ...prev,
      items: [...prev.items, { name: "", category: "medicine", quantity: 0, unit: "units", minThreshold: 10 }],
    }));
  };

  const removeItem = (index) => {
    setInventory(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#080d18]"><Navbar />
      <div className="pt-16 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080d18]">
      <Navbar />
      <div className="pt-16 max-w-4xl mx-auto px-4 py-8">
        <Link to="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Inventory Management</h1>
            <p className="text-slate-400 text-sm mt-1">{hospital?.name || hospitalId}</p>
          </div>
          <button onClick={handleSave} disabled={isSaving}
            className="btn-primary flex items-center gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>

        {inventory && (
          <div className="space-y-6">
            {/* Oxygen + Ventilators */}
            <div className="card">
              <h3 className="font-display font-semibold text-white mb-4">Critical Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Wind className="w-3 h-3" /> Oxygen Level (%)</label>
                  <input type="number" min="0" max="100"
                    value={inventory.oxygenLevel}
                    onChange={e => setInventory(p => ({ ...p, oxygenLevel: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
                  <div className="h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${inventory.oxygenLevel < 30 ? "bg-red-500" : inventory.oxygenLevel < 50 ? "bg-yellow-500" : "bg-blue-400"}`}
                      style={{ width: `${inventory.oxygenLevel}%` }} />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Ventilators Total</label>
                  <input type="number" min="0"
                    value={inventory.ventilators}
                    onChange={e => setInventory(p => ({ ...p, ventilators: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1">Ventilators Available</label>
                  <input type="number" min="0"
                    value={inventory.ventilatorsAvailable}
                    onChange={e => setInventory(p => ({ ...p, ventilatorsAvailable: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500" />
                </div>
              </div>
            </div>

            {/* Blood Units */}
            <div className="card">
              <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-400" /> Blood Units
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(inventory.bloodUnits || {}).map(([type, qty]) => (
                  <div key={type}>
                    <label className="text-slate-400 text-xs mb-1 block">{type.replace("_", "-")}</label>
                    <input type="number" min="0" value={qty}
                      onChange={e => setInventory(p => ({
                        ...p,
                        bloodUnits: { ...p.bloodUnits, [type]: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Items Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white">Inventory Items</h3>
                <button onClick={addItem} className="flex items-center gap-1.5 text-sm text-green-400 border border-green-500/30 px-3 py-1.5 rounded-xl hover:bg-green-500/10 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {inventory.items?.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center bg-slate-800/40 rounded-xl p-3">
                    <input type="text" placeholder="Item name" value={item.name}
                      onChange={e => updateItem(i, "name", e.target.value)}
                      className="col-span-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-green-500" />
                    <select value={item.category}
                      onChange={e => updateItem(i, "category", e.target.value)}
                      className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-green-500">
                      {["medicine", "equipment", "oxygen", "ppe", "consumables"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input type="number" placeholder="Qty" value={item.quantity}
                      onChange={e => updateItem(i, "quantity", e.target.value)}
                      className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-green-500" />
                    <input type="text" placeholder="unit" value={item.unit}
                      onChange={e => updateItem(i, "unit", e.target.value)}
                      className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-green-500" />
                    <input type="number" placeholder="Min" value={item.minThreshold}
                      onChange={e => updateItem(i, "minThreshold", e.target.value)}
                      className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-green-500" />
                    <button onClick={() => removeItem(i)} className="col-span-1 flex justify-center text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
