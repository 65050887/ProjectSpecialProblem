// client/src/layouts/LayoutUser.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Moon,
  Globe,
  User,
  Home as HomeIcon,
  Search as SearchIcon,
  LogOut,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import useEcomStore from "../store/ecom-store.jsx";

const ORANGE = "#F16323";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function LayoutUser() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // เมนูย่อยของปุ่ม "..." (เก็บ id ของแจ้งเตือนที่กำลังเปิดเมนู)
  const [notifMenuOpenId, setNotifMenuOpenId] = useState(null);

  // ✅ ปรับชื่อ key ให้เข้ากับ store ของหนูได้
  const user = useEcomStore((s) => s.user || s.currentUser || s.profile || null);
  const actionLogout = useEcomStore((s) => s.actionLogout || null);

  const displayName = useMemo(() => {
    const u = user || {};
    return u.username || u.user?.username || u.payload?.username || "Student";
  }, [user]);

  const emailText = useMemo(() => {
    return user?.email || user?.user?.email || "user@kmitl.ac.th";
  }, [user]);

  const navClass = ({ isActive }) =>
    cn(
      "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition",
      isActive
        ? "bg-[#F16323] text-white shadow-sm"
        : "text-[#F16323] hover:bg-[#F16323]/10"
    );

  // ====== Notifications (mock; ต่อ API ทีหลังได้) ======
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Welcome to DormConnect KMITL !",
      time: "Now",
      isRead: false,
    },
  ]);

  const markNotifRead = (id, read = true) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: read } : n))
    );
    setNotifMenuOpenId(null);
  };

  const deleteNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setNotifMenuOpenId(null);
  };

  const clearAllNotifs = () => {
    setNotifications([]);
    setNotifMenuOpenId(null);
  };

  // ====== click outside + ESC close ======
  const notifWrapRef = useRef(null);
  const profileWrapRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setProfileOpen(false);
        setNotifMenuOpenId(null);
      }
    }

    function onMouseDown(e) {
      const t = e.target;

      // ถ้าคลิกนอก notif dropdown -> ปิด notif และเมนูย่อย
      if (notifWrapRef.current && !notifWrapRef.current.contains(t)) {
        setNotifOpen(false);
        setNotifMenuOpenId(null);
      }

      // ถ้าคลิกนอก profile dropdown -> ปิด profile
      if (profileWrapRef.current && !profileWrapRef.current.contains(t)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-[0_4px_4px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex h-[90px] max-w-7xl items-center justify-between gap-6 px-4 md:px-10">
          {/* Brand */}
          <button
            type="button"
            onClick={() => navigate("/user")}
            className="flex shrink-0 items-center gap-3"
            aria-label="go-user-home"
          >
            {/* Logo */}
            <div className="h-[50px] w-[70px] overflow-hidden rounded-[20px] bg-[#F16323]/10">
              <img
                src="/logo/logo.png"
                alt="DormConnect logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="hidden text-lg font-bold text-[#F16323] sm:block">
              DormConnect KMITL
            </span>
          </button>

          <div className="hidden flex-1 items-center justify-center gap-4 md:flex">
            <NavLink to="/user" end className={navClass}>
              <HomeIcon className="h-5 w-5" />
              HOME
            </NavLink>

            <NavLink to="/user/search" className={navClass}>
              <SearchIcon className="h-5 w-5" />
              Search Dormitories
            </NavLink>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* ===== Notification Button + Dropdown ===== */}
            <div className="relative" ref={notifWrapRef}>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5"
                aria-label="notifications"
                onClick={() => {
                  setNotifOpen((s) => !s);
                  setProfileOpen(false);
                  setNotifMenuOpenId(null);
                }}
              >
                <Bell className="h-6 w-6" style={{ color: ORANGE }} />
              </button>

              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-3 z-50 w-[280px] overflow-hidden rounded-[16px] bg-white"
                  style={{
                    border: `2px solid ${ORANGE}`,
                    boxShadow: "0 18px 34px rgba(0,0,0,0.18)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Bell className="h-5 w-5" style={{ color: ORANGE }} />
                    <div className="text-[16px] font-bold" style={{ color: ORANGE }}>
                      Notification
                    </div>
                  </div>
                  <div className="h-px w-full" style={{ background: `${ORANGE}33` }} />

                  {/* List */}
                  <div className="px-3 py-3">
                    {notifications.length === 0 ? (
                      <div className="rounded-2xl border border-black/10 px-3 py-4 text-[16px] text-black/60">
                        No notifications
                      </div>
                    ) : (
                      <div
                        className="rounded-2xl px-3 py-3"
                        style={{
                          border: `1px solid ${ORANGE}33`,
                          boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                        }}
                      >
                        {notifications.map((n) => (
                          <div key={n.id} className="flex items-start gap-3">
                            {/* avatar circle */}
                            <div
                              className="mt-1 h-8 w-8 rounded-full"
                              style={{ background: ORANGE }}
                            />

                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-3">
                                {/* title */}
                                <div
                                  className={cn(
                                    "leading-snug",
                                    "text-[14px]",
                                    n.isRead ? "font-medium opacity-70" : "font-semibold"
                                  )}
                                  style={{ color: ORANGE }}
                                >
                                  {n.title}
                                </div>

                                {/* More menu */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                                    aria-label="more"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNotifMenuOpenId((cur) =>
                                        cur === n.id ? null : n.id
                                      );
                                    }}
                                  >
                                    <MoreHorizontal
                                      className="h-4 w-4"
                                      style={{ color: ORANGE }}
                                    />
                                  </button>

                                  {notifMenuOpenId === n.id && (
                                    <div
                                      className="absolute right-0 top-full mt-2 z-50 w-[160px] overflow-hidden rounded-xl bg-white"
                                      style={{
                                        border: `1px solid ${ORANGE}33`,
                                        boxShadow: "0 16px 28px rgba(0,0,0,0.16)",
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-black/5"
                                        style={{ color: ORANGE }}
                                        onClick={() => markNotifRead(n.id, true)}
                                      >
                                        Mark as read
                                      </button>

                                      <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-black/5"
                                        style={{ color: ORANGE }}
                                        onClick={() => markNotifRead(n.id, false)}
                                      >
                                        Mark as unread
                                      </button>

                                      <div
                                        className="h-px w-full"
                                        style={{ background: `${ORANGE}22` }}
                                      />

                                      <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-black/5"
                                        style={{ color: "#DC2626" }}
                                        onClick={() => deleteNotif(n.id)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* time */}
                              <div
                                className={cn(
                                  "mt-1",
                                  "text-xs"
                                )}
                                style={{ color: ORANGE }}
                              >
                                {n.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        setNotifMenuOpenId(null);
                        navigate("/user/notifications");
                      }}
                      className="mt-3 w-full rounded-full px-3 py-2 text-sm font-bold"
                      style={{
                        color: ORANGE,
                        border: `1px solid ${ORANGE}55`,
                        background: "white",
                      }}
                    >
                      View all
                    </button>

                    <button
                      type="button"
                      onClick={clearAllNotifs}
                      className="mt-2 w-full rounded-full px-3 py-2 text-sm font-bold"
                      style={{
                        color: "#DC2626",
                        border: "1px solid rgba(220,38,38,0.25)",
                        background: "white",
                      }}
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-[#F16323] hover:bg-[#F16323]/15 md:inline-flex"
              aria-label="theme"
            >
              <Moon className="h-6 w-6" style={{ color: ORANGE }} />
            </button>

            <button
              type="button"
              className="hidden items-center gap-2 rounded-full px-4 py-2 font-bold text-[#F16323] hover:bg-[#F16323]/15 md:inline-flex"
              aria-label="language"
            >
              <Globe className="h-6 w-6" style={{ color: ORANGE }} />
              <span className="text-sm font-bold text-[#F16323]">EN</span>
            </button>

            {/* ===== User Dropdown ===== */}
            <div className="relative" ref={profileWrapRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((s) => !s);
                  setNotifOpen(false);
                  setNotifMenuOpenId(null);
                }}
                className="inline-flex items-center gap-3 rounded-xl bg-[#F16323] px-5 py-3 text-white shadow hover:opacity-95 transition"
              >
                <User className="h-5 w-5" />
                <span className="text-base font-bold">{displayName}</span>
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-3 w-[230px] z-50 overflow-hidden rounded-[18px] bg-[#F16323]"
                  style={{
                    boxShadow: "0 18px 34px rgba(0,0,0,0.18)",
                    padding: "14px 18px 10px",
                  }}
                >
                  {/* Header with user info */}
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#F16323] flex-shrink-0">
                      <User className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-base font-bold text-white leading-tight truncate">
                        {displayName}
                      </div>
                      <div className="text-xs font-normal text-white/90 leading-tight mt-1 truncate">
                        {emailText}
                      </div>
                    </div>
                  </div>

                  <div className="my-4 h-px bg-white/60" />

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/user/dashboard");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-2 rounded-full px-4 py-2 text-left text-sm font-semibold text-[#F16323] bg-white hover:bg-white/95 transition"
                    >
                      <HomeIcon className="h-5 w-5" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate("/user/profile");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-2 text-left text-sm font-semibold text-white hover:opacity-90 transition"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Profile</span>
                    </button>

                    <div className="h-px bg-white/60" />

                    <button
                      type="button"
                      onClick={() => {
                        if (actionLogout) actionLogout();
                        navigate("/");
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-2 text-left text-sm font-semibold text-white hover:opacity-90 transition"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-black/10" />
      </header>

      {/* Page content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
}