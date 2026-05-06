import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080d18] flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
        <Heart className="w-8 h-8 text-slate-600" />
      </div>
      <h1 className="font-display font-bold text-6xl text-slate-700">404</h1>
      <p className="text-slate-400">Page not found.</p>
      <Link to="/" className="btn-primary mt-4">Go Home</Link>
    </div>
  );
}
