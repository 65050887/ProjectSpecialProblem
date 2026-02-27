// client\src\components\UserSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { Home as HomeIcon, Users, CalendarDays, Heart } from "lucide-react";

const ORANGE = "#F16323";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function UserSidebar({ className = "" }) {
  const items = [
    { label: "Overview", to: "/user/dashboard", Icon: HomeIcon, isOverview: true },
    { label: "Favorite", to: "/user/favorites", Icon: Heart },
  ];

  return (
    <aside
      className={cn(
        // ✅ ขนาดเหมือนรูป: กว้าง/สูง/เว้น padding เยอะ
        "rounded-[20px] bg-white px-4 pt-8 pb-12",
        // ✅ ทำให้สูงยาวแบบรูป (สูงตาม viewport)
        "min-h-[900px] lg:min-h-[calc(100vh-170px)]",
        className
      )}
      style={{ border: `1px solid ${ORANGE}` }}
    >
      {/* ✅ เว้นช่องเมนูให้ห่างแบบรูป */}
      <div className="flex flex-col gap-10">
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} className="block">
            {({ isActive }) => (
              <SidebarRow
                label={it.label}
                Icon={it.Icon}
                active={isActive}
                isOverview={!!it.isOverview}
              />
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

function SidebarRow({ label, Icon, active, isOverview }) {
  if (isOverview) {
    return (
      <div
        className="flex w-full items-center justify-center gap-3 rounded-full px-4 py-4 font-bold text-[16px] transition hover:opacity-95"
        style={{ background: ORANGE, color: "white" }}
      >
        <Icon className="h-5 w-5 text-white" />
        <span>Overview</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 text-[16px] font-semibold transition",
        active ? "opacity-100" : "opacity-70 hover:opacity-95"
      )}
      style={{ color: ORANGE }}
    >
      <Icon className="h-5 w-5" style={{ color: ORANGE }} />
      <span>{label}</span>
    </div>
  );
}
