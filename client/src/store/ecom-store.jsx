import { create } from "zustand";

function safeJSON(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

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

  // (เผื่อโค้ดหน้าอื่นอ้างชื่อพวกนี้)
  currentUser: null,
  profile: null,
}));

export default useEcomStore;