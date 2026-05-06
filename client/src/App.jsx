// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useEffect } from "react";
// import useAuthStore from "./store/authStore";

// import LandingPage from "./pages/LandingPage";
// import LoginPage from "./pages/LoginPage";
// import AuthCallback from "./pages/AuthCallback";
// import MapDashboard from "./pages/MapDashboard";
// import PatientDashboard from "./pages/PatientDashboard";
// import AdminDashboard from "./pages/AdminDashboard";
// import HospitalDetail from "./pages/HospitalDetail";
// import InventoryPage from "./pages/InventoryPage";
// import NotFound from "./pages/NotFound";

// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const { isAuthenticated, user, isLoading } = useAuthStore();
//   if (isLoading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
//   if (!isAuthenticated) return <Navigate to="/login" replace />;
//   if (adminOnly && user?.role !== "admin") return <Navigate to="/dashboard" replace />;
//   return children;
// };

// export default function App() {
//   const { token, fetchMe } = useAuthStore();

//   useEffect(() => {
//     if (token) fetchMe();
//   }, []);

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/auth/callback" element={<AuthCallback />} />

//         <Route path="/map" element={
//           <ProtectedRoute><MapDashboard /></ProtectedRoute>
//         } />
//         <Route path="/dashboard" element={
//           <ProtectedRoute><PatientDashboard /></ProtectedRoute>
//         } />
//         <Route path="/hospital/:id" element={
//           <ProtectedRoute><HospitalDetail /></ProtectedRoute>
//         } />
//         <Route path="/admin" element={
//           <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
//         } />
//         <Route path="/admin/inventory/:hospitalId" element={
//           <ProtectedRoute adminOnly><InventoryPage /></ProtectedRoute>
//         } />

//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AuthCallback from "./pages/AuthCallback";
import MapDashboard from "./pages/MapDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import HospitalDetail from "./pages/HospitalDetail";
import InventoryPage from "./pages/InventoryPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/map" element={<MapDashboard />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/hospital/:id" element={<HospitalDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/inventory/:hospitalId" element={<InventoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}