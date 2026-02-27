import React from "react";
import { NavLink } from "react-router-dom";
import { Home as HomeIcon, Heart } from "lucide-react";

const ORANGE = "#F16323";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function UserSidebar({ className = "" }) {
  const items = [
    { label: "Overview", to: "/user/dashboard", Icon: HomeIcon },
    { label: "Favorite", to: "/user/favorites", Icon: Heart },
  ];

  return (
    <aside
      className={cn(
        "rounded-[20px] bg-white px-4 pt-8 pb-4",
        "min-h-[700px] lg:min-h-[calc(100vh-170px)]",
        className
      )}
      style={{ border: `1px solid ${ORANGE}` }}
    >
      <div className="flex flex-col gap-10">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              cn(
                "flex w-full items-center justify-center gap-3 rounded-full px-4 py-4 text-[16px] font-bold transition",
                isActive ? "hover:opacity-95" : "opacity-70 hover:opacity-95"
              )
            }
            style={({ isActive }) => ({
              background: isActive ? ORANGE : "transparent",
              color: isActive ? "white" : ORANGE,
            })}
          >
            {({ isActive }) => (
              <>
                <it.Icon
                  className="h-5 w-5"
                  style={{ color: isActive ? "white" : ORANGE }}
                />
                <span>{it.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}