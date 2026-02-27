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
    return u.fullname || u.name || u.username || u.user?.username || "Sunisa Wongsavate";
  }, [user]);

  const emailText = useMemo(() => {
    return user?.email || user?.user?.email || "Sunisa@kmitl.ac.th";
  }, [user]);

  const pictureUrl = useMemo(() => {
    return user?.picture || user?.user?.picture || "";
  }, [user]);

  // ✅ ใช้ created_at จาก user (มาจาก login payload หรือ currentUser)
  const joinedAt = useMemo(() => {
    return user?.created_at || user?.createdAt || user?.user?.created_at || null;
  }, [user]);

  const daysSinceJoin = useMemo(() => {
    if (!joinedAt) return 0;
    const start = new Date(joinedAt).getTime();
    if (!Number.isFinite(start)) return 0;
    const diff = Date.now() - start;
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [joinedAt]);

  const memberSinceText = useMemo(() => {
    if (!joinedAt) return "-";
    const d = new Date(joinedAt);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, [joinedAt]);

  const stats = useMemo(
    () => ({
      reviews: 1,
      days: daysSinceJoin,
    }),
    [daysSinceJoin]
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    async function pingAuth() {
      if (!token) return;
      setLoading(true);
      try {
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
    <div className="mx-auto flex w-full max-w-6xl gap-10 pt-2 pb-10">
      {/* ✅ Sidebar กว้างเท่ากันกับหน้า Favorites */}
      <div className="w-[340px] shrink-0">
        <UserSidebar />
      </div>

      {/* RIGHT: Profile card */}
      <div className="min-w-0 flex-1">
        <div className="rounded-3xl bg-white p-8 shadow-sm border" style={{borderColor: ORANGE}}>
          {/* Header */}
          <div className="flex items-center gap-5">
            <img
              src={pictureUrl || FALLBACK_IMG}
              alt="profile"
              className="h-[88px] w-[88px] rounded-2xl object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />

            <div className="min-w-0">
              <div className="truncate text-2xl font-extrabold" style={{ color: ORANGE }}>
                {displayName}
              </div>
              <div className="mt-1 truncate text-sm text-gray-600">{emailText}</div>
              <div className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold text-white"
                   style={{ background: ORANGE }}>
                Student
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <StatCard icon={<Star size={18} />} value={stats.reviews} label="Review" />
            <StatCard icon={<CalendarDays size={18} />} value={stats.days} label="Days" />
          </div>

          {/* Actions */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => navigate("/user/profile")}
              className="flex w-full items-center gap-3 rounded-full px-5 py-3 transition hover:shadow-sm"
              style={{ border: `1px solid ${ORANGE}`, background: "white" }}
            >
              <UserIcon size={18} color={ORANGE} />
              <span className="font-extrabold" style={{ color: ORANGE }}>
                Manage Profile
              </span>
            </button>

            <button
              onClick={() => navigate("/user/notifications")}
              className="flex w-full items-center gap-3 rounded-full px-5 py-3 transition hover:shadow-sm"
              style={{ border: `1px solid ${ORANGE}`, background: "white" }}
            >
              <Bell size={18} color={ORANGE} />
              <span className="font-extrabold" style={{ color: ORANGE }}>
                Notification
              </span>
            </button>
          </div>

          {/* optional loading indicator */}
          {loading && <div className="mt-4 text-sm text-gray-500">checking...</div>}

          <div className="mt-8 text-sm text-gray-600">
            Member since {memberSinceText}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl"
           style={{ background: `${ORANGE}1A`, color: ORANGE }}>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-sm text-gray-600">{label}</div>
    </div>
  );
}