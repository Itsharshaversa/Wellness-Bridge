import { Heart, ShieldCheck, Chrome } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = "/auth/google";
  };

  return (
    <div className="min-h-screen bg-[#080d18] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white">MedAlert</h1>
          <p className="text-slate-400 mt-2">Healthcare Emergency Platform</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="font-display font-semibold text-xl text-white text-center mb-2">
            Sign in to continue
          </h2>
          <p className="text-slate-400 text-sm text-center mb-8">
            Access real-time hospital data and emergency services
          </p>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-500 text-xs">Secure & Private</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            Your data is protected by Google OAuth 2.0
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <Link to="/" className="hover:text-slate-300 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
