// client/src/store/ecom-store.jsx
import axios from "axios";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const API = "http://localhost:5000/api";

const ecomStore = (set, get) => ({
  user: null,
  token: null,

  // ✅ Login
  actionLogin: async (form) => {
    const res = await axios.post(`${API}/login`, form);
    set({
      user: res.data.payload,   // payload จาก backend
      token: res.data.token,
    });
    return res;
  },

  // ✅ set user ตรงๆ (ใช้ตอน update profile)
  actionSetUser: (userObj) => {
    set({ user: userObj });
  },

  // ✅ update เฉพาะรูป (และ sync เข้า user ใน store)
  actionUpdatePicture: (newPicture) => {
    const current = get().user || {};
    set({
      user: { ...current, picture: newPicture, avatar: newPicture },
    });
  },

  // (แถม) logout
  actionLogout: () => {
    set({ user: null, token: null });
  },
});

const usePersist = {
  name: "ecom-storage",
  storage: createJSONStorage(() => localStorage),
};

const useEcomStore = create(persist(ecomStore, usePersist));
export default useEcomStore;
