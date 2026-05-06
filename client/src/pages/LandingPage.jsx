import { Link } from "react-router-dom";
import { Activity, MapPin, Shield, Zap, Users, BarChart3, ArrowRight, Heart } from "lucide-react";

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="card hover:border-green-500/40 transition-all duration-300 group">
    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
      <Icon className="w-6 h-6 text-green-400" />
    </div>
    <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Stat = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl font-display font-bold text-green-400">{value}</div>
    <div className="text-slate-400 text-sm mt-1">{label}</div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080d18] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#080d18]/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">MedAlert</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/map" className="text-slate-400 hover:text-white text-sm transition-colors">Map</Link>
            <Link to="/login" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-green-400 text-sm font-medium mb-6">
          <Activity className="w-3.5 h-3.5" />
          Real-time Healthcare Platform
        </div>

        <h1 className="font-display font-bold text-5xl md:text-7xl text-white leading-tight mb-6 max-w-4xl mx-auto">
          Emergency Care,
          <span className="text-green-400"> Instantly</span>
          <br />Located
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Find the nearest hospital with available beds in seconds. Real-time tracking of
          beds, ambulances, and ICU units across your city.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/login" className="btn-emergency flex items-center gap-2 text-base">
            Find Emergency Care
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/map" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors border border-slate-700 rounded-2xl px-6 py-3 hover:border-slate-500">
            <MapPin className="w-4 h-4" />
            View Map
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 md:grid-cols-3 gap-8 max-w-md mx-auto border border-slate-800 rounded-2xl p-8 bg-slate-900/40">
          <Stat value="50+" label="Hospitals" />
          <Stat value="10k+" label="Beds Tracked" />
          <Stat value="< 5s" label="Response Time" />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
            Everything you need in an emergency
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Designed for patients, administrators, and healthcare staff to make critical decisions faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Feature icon={MapPin} title="Smart Hospital Routing" desc="Finds nearest hospitals ranked by distance AND bed availability using the Haversine formula." />
          <Feature icon={Zap} title="Emergency Mode" desc="One button activates full emergency data — beds, ICU, ambulances, ETA, and direct call." />
          <Feature icon={Activity} title="Live Bed Matrix" desc="Visual grid showing every bed status — available, occupied, reserved, or maintenance." />
          <Feature icon={Shield} title="Inventory Tracking" desc="Monitor oxygen levels, ventilators, blood units, and critical medical supplies in real-time." />
          <Feature icon={BarChart3} title="ML Demand Prediction" desc="AI predicts hospital load spikes before they happen, helping you plan ahead." />
          <Feature icon={Users} title="Admin Dashboard" desc="Hospital administrators can manage resources, set alerts, and view system-wide analytics." />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center card border-green-500/20">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Activity className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="font-display font-bold text-3xl text-white mb-4">Ready when you need it most</h2>
          <p className="text-slate-400 mb-8">Sign in with Google and access real-time healthcare data for hospitals near you.</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-base">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 px-6 text-center text-slate-500 text-sm">
        <p>Made with ❤️ by Harshit Srivastava</p>
      </footer>
    </div>
  );
}
