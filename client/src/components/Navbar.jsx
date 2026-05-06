import { Link, useNavigate, useLocation } from "react-router-dom";
import { Heart, MapPin, LayoutDashboard, LogOut, ShieldCheck, User } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white">MedAlert</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/map" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/map") ? "bg-green-500/10 text-green-400" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
            <MapPin className="w-4 h-4" /> Map
          </Link>
          <Link to="/dashboard" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/dashboard") ? "bg-green-500/10 text-green-400" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/admin") ? "bg-green-500/10 text-green-400" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full ring-2 ring-slate-700" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="hidden sm:block text-slate-300">{user?.name?.split(" ")[0]}</span>
            {user?.role === "admin" && (
              <span className="badge-warning text-xs">Admin</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
