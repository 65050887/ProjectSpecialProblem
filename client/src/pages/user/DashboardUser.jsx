// client/src/pages/user/DashboardUser.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Bell, User as UserIcon, CalendarDays } from "lucide-react";
import useEcomStore from "../../store/ecom-store.jsx";
import UserSidebar from "../../components/UserSidebar";

const ORANGE = "#F16323";
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardUser() {
  const navigate = useNavigate();

  const user = useEcomStore((s) => s.user || s.currentUser || s.profile || null);
  const token = useEcomStore((s) => s.token || null);

  const API_BASE =
    import.meta?.env?.VITE_API_URL?.replace(/\/?api\/?$/i, "") ||
    import.meta?.env?.VITE_API_BASE_URL ||
    "http://localhost:5000";

  const displayName = useMemo(() => {
    const u = user || {};
    return (
      u.fullname ||
      u.name ||
      u.username ||
      u.user?.username ||
      "Sunisa Wongsavate"
    );
  }, [user]);

  const emailText = useMemo(() => {
    return user?.email || user?.user?.email || "Sunisa@kmitl.ac.th";
  }, [user]);

  // --- stats (ตามที่คุณอยากให้เหลือแค่นี้) ---
  const stats = useMemo(() => ({ reviews: 1, days: 24 }), []);

  // (optional) fetch favorites: ตอนนี้ไม่ได้โชว์แล้ว แต่เผื่อคุณต่อในอนาคต
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let alive = true;
    async function pingAuth() {
      if (!token) return;
      setLoading(true);
      try {
        // แค่เช็คว่า token ใช้ได้ (ถ้าไม่อยากเช็ค ลบ useEffect นี้ทิ้งได้)
        await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      } finally {
        if (alive) setLoading(false);
      }
    }
    pingAuth();
    return () => {
      alive = false;
    };
  }, [API_BASE, token]);

  return (
    <div className="w-full">
      {/* 2 คอลัมน์: Sidebar + Profile card */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
        <UserSidebar />

        {/* Profile Card */}
        <section
          className={cn(
            "rounded-[22px] bg-white",
            "px-10 py-10",
            "shadow-[0_18px_34px_rgba(0,0,0,0.06)]"
          )}
          style={{ border: `1px solid ${ORANGE}` }}
        >
          {/* Header */}
          <div className="flex items-start gap-5">
            <img
              src={user?.avatar || FALLBACK_IMG}
              alt={displayName}
              className="h-[56px] w-[56px] rounded-[12px] object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />

            <div className="min-w-0">
              <div
                className="text-[22px] font-bold leading-tight"
                style={{ color: ORANGE }}
              >
                {displayName}
              </div>

              <div className="mt-1 text-[14px]" style={{ color: ORANGE }}>
                {emailText}
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[14px] font-bold"
                   style={{ border: `1px solid ${ORANGE}`, color: ORANGE }}>
                <UserIcon className="h-[20px] w-[16px]" />
                Student
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-7">
              <StatCard
                icon={<Star className="h-5 w-5 text-white" />}
                value={stats.reviews}
                label="Review"
              />
              <StatCard
                icon={<CalendarDays className="h-6 w-6 text-white" />}
                value={stats.days}
                label="Days"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-5">
            <button
              type="button"
              onClick={() => navigate("/user/profile")}
              className="flex w-full items-center gap-3 rounded-full px-5 py-3 transition hover:shadow-sm"
              style={{ border: `1px solid ${ORANGE}`, background: "white" }}
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: ORANGE }}
              >
                <UserIcon className="h-4 w-4 text-white" />
              </span>
              <span className="text-[14px] font-medium" style={{ color: ORANGE }}>
                Manage Profile
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/user/notifications")}
              className="flex w-full items-center gap-3 rounded-full px-5 py-3 transition hover:shadow-sm"
              style={{ border: `1px solid ${ORANGE}`, background: "white" }}
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: ORANGE }}
              >
                <Bell className="h-4 w-4 text-white" />
              </span>
              <span className="text-[14px] font-medium" style={{ color: ORANGE }}>
                Notification
              </span>

              {/* optional loading indicator */}
              {loading && (
                <span className="ml-auto text-[14px]" style={{ color: ORANGE }}>
                  checking...
                </span>
              )}
            </button>
          </div>

          <div className="mt-10 h-px w-full" style={{ background: `${ORANGE}33` }} />

          <div className="mt-6 flex items-center gap-3 text-[14px]" style={{ color: ORANGE }}>
            <CalendarDays className="h-5 w-5 opacity-50" />
            Member since August 2025
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div
      className="h-[150px] w-[150px] rounded-[14px] flex flex-col items-center justify-center gap-3"
      style={{ background: ORANGE }}
    >
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10">
        {icon}
      </div>
      <div className="text-[16px] font-extrabold text-white">{value}</div>
      <div className="text-[12px] font-medium text-white/95">{label}</div>
    </div>
  );
}