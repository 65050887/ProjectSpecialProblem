// client/src/store/ecom-store.jsx
import { create } from "zustand";
import axios from "axios";

function safeJSON(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// ถ้ามี .env ให้ตั้ง VITE_API_URL=http://localhost:5000/api
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const useEcomStore = create((set, get) => ({
  // ✅ อ่านจาก localStorage เพื่อให้รีเฟรชแล้วไม่หาย
  token: localStorage.getItem("token") || "",
  user: safeJSON(localStorage.getItem("user"), {}),

  // ✅ ใช้ตอน login/register (ถ้ามี)
  actionSetToken: (token) => {
    const t = token || "";
    set({ token: t });
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  },

  // ✅ ใช้ตอน set/update ข้อมูลผู้ใช้
  actionSetUser: (user) => {
    const u = user || {};
    set({ user: u });
    localStorage.setItem("user", JSON.stringify(u));
  },

  // ✅ ใช้ตอนอัปเดตรูปโปรไฟล์
  actionUpdatePicture: (picture) => {
    const current = get().user || {};
    const merged = { ...current, picture };
    set({ user: merged });
    localStorage.setItem("user", JSON.stringify(merged));
  },

  // ✅ สำคัญ: ใช้ตอน Login (หน้า Login.jsx เรียกตัวนี้)
  actionLogin: async (form) => {
    // form = { email, password }
    const res = await axios.post(`${API}/login`, form);

    const token = res.data?.token;
    const payload = res.data?.payload;

    if (token) get().actionSetToken(token);
    if (payload) get().actionSetUser(payload);

    return res;
  },

  // ✅ เผื่อใช้ตอน Logout
  actionLogout: () => {
    get().actionSetToken("");
    get().actionSetUser({});
  },

  // (เผื่อโค้ดหน้าอื่นอ้างชื่อพวกนี้)
  currentUser: null,
  profile: null,
}));

export default useEcomStore;