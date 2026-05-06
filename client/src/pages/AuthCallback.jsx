import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { Heart, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = params.get("token");
    const role = params.get("role");

    if (token) {
      setToken(token);
      setTimeout(() => {
        navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
      }, 1000);
    } else {
      navigate("/login?error=auth_failed", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#080d18] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center">
        <Heart className="w-8 h-8 text-white" />
      </div>
      <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
      <p className="text-slate-400">Signing you in...</p>
    </div>
  );
}
