// import { create } from "zustand";
// import api from "../services/api";

// const useAuthStore = create((set, get) => ({
//   user: null,
//   token: localStorage.getItem("med_token") || null,
//   isLoading: false,
//   isAuthenticated: !!localStorage.getItem("med_token"),

//   setToken: (token) => {
//     localStorage.setItem("med_token", token);
//     set({ token, isAuthenticated: true });
//     get().fetchMe();
//   },

//   fetchMe: async () => {
//     try {
//       set({ isLoading: true });
//       const { data } = await api.get("/auth/me");
//       set({ user: data, isAuthenticated: true });
//     } catch {
//       localStorage.removeItem("med_token");
//       set({ user: null, token: null, isAuthenticated: false });
//     } finally {
//       set({ isLoading: false });
//     }
//   },

//   logout: () => {
//     localStorage.removeItem("med_token");
//     set({ user: null, token: null, isAuthenticated: false });
//   },

//   updateLocation: async (lat, lng) => {
//     try {
//       await api.put("/auth/location", { lat, lng });
//       set(state => ({
//         user: state.user ? { ...state.user, location: { lat, lng } } : null,
//       }));
//     } catch {}
//   },
// }));

// export default useAuthStore;



import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: {
    _id: "demo123",
    name: "Harshit Demo",
    email: "harshit@demo.com",
    avatar: "",
    role: "admin",        // change to "patient" to test patient view
    location: { lat: 28.6469, lng: 77.3181 },
  },
  token: "demo-token",
  isLoading: false,
  isAuthenticated: true,

  setToken: () => {},
  fetchMe: () => {},
  logout: () => {},
  updateLocation: () => {},
}));

export default useAuthStore;