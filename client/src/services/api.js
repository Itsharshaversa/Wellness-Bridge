import axios from "axios";

const api = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("med_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem("med_token");
//       window.location.href = "/login";
//     }
//     return Promise.reject(err);
//   }
// );
api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;

export const hospitalAPI = {
  getAll: (lat, lng) => api.get(`/api/hospitals?lat=${lat}&lng=${lng}`),
  getById: (id) => api.get(`/api/hospitals/${id}`),
  getBeds: (id) => api.get(`/api/hospitals/${id}/beds`),
  getNearestEmergency: (lat, lng) => api.get(`/api/hospitals/emergency/nearest?lat=${lat}&lng=${lng}`),
  getStats: () => api.get("/api/hospitals/stats/overview"),
};

export const adminAPI = {
  getStats: () => api.get("/api/admin/stats"),
  getHospitals: () => api.get("/api/admin/hospitals"),
  createHospital: (data) => api.post("/api/admin/hospitals", data),
  updateHospital: (id, data) => api.put(`/api/admin/hospitals/${id}`, data),
  updateBeds: (id, data) => api.patch(`/api/admin/hospitals/${id}/beds`, data),
  deleteHospital: (id) => api.delete(`/api/admin/hospitals/${id}`),
  getAlerts: () => api.get("/api/admin/alerts"),
  resolveAlert: (id) => api.patch(`/api/admin/alerts/${id}/resolve`),
  getUsers: () => api.get("/api/admin/users"),
};

export const inventoryAPI = {
  get: (hospitalId) => api.get(`/api/inventory/${hospitalId}`),
  update: (hospitalId, data) => api.put(`/api/inventory/${hospitalId}`, data),
};

export const mlAPI = {
  predict: (hospitalId) => api.get(`/api/ml/predict/${hospitalId}`),
  forecast: () => api.get("/api/ml/forecast"),
};