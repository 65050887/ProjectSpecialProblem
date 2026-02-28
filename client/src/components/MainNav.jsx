// client/src/components/MainNav.jsx
import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Home, Search, Users, Moon, Globe, User, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";

const MainNav = () => {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation(["common", "auth"]);

  const currentLng = useMemo(() => {
    const lng = String(i18n.language || "th").toLowerCase();
    return lng.startsWith("en") ? "en" : "th";
  }, [i18n.language]);

  const toggleLang = async () => {
    const next = currentLng === "en" ? "th" : "en";
    await changeLanguage(next);
  };

  const navPill = ({ isActive }) =>
    [
      "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition",
      isActive
        ? "bg-[#F16323] text-white shadow-sm"
        : "text-[#F16323] hover:bg-[#F16323]/10",
    ].join(" ");

  const mobileLink = ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
      isActive
        ? "bg-[#F16323] text-white"
        : "text-[#F16323] hover:bg-[#F16323]/10",
    ].join(" ");

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_4px_4px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex h-[90px] max-w-7xl items-center justify-between gap-6 px-4 md:px-10">
        {/* LEFT: Logo + Brand */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => setOpen(false)}
        >
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
        </Link>

        {/* CENTER: Menu (desktop) */}
        <nav className="hidden flex-1 items-center justify-center gap-4 md:flex">
          <NavLink to="/" className={navPill} end>
            <Home className="h-5 w-5" />
            {t("nav.home", { ns: "common" })}
          </NavLink>

          <NavLink to="/search" className={navPill}>
            <Search className="h-5 w-5" />
            {t("nav.searchDormitories", { ns: "common" })}
          </NavLink>
        </nav>

        {/* RIGHT: actions */}
        <div className="flex items-center gap-3">
          {/* theme */}
          <button
            type="button"
            className="hidden h-11 w-11 items-center justify-center rounded-full 10 text-[#F16323] hover:bg-[#F16323]/15 md:inline-flex"
            aria-label={t("actions.theme", { ns: "common" })}
          >
            <Moon className="h-6 w-6" />
          </button>

          {/* language */}
          <button
            type="button"
            className="hidden items-center gap-2 rounded-full 10 px-4 py-2 font-bold text-[#F16323] hover:bg-[#F16323]/15 md:inline-flex"
            aria-label={t("actions.language", { ns: "common" })}
            onClick={toggleLang}
          >
            <Globe className="h-5 w-5" />
            {currentLng.toUpperCase()}
          </button>

          {/* login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#F16323] px-5 py-3 text-sm font-bold text-white hover:bg-[#d9551f]"
            onClick={() => setOpen(false)}
          >
            <User className="h-5 w-5" />
            {t("login", { ns: "auth" })}
          </Link>

          {/* mobile menu button */}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F16323]/10 text-[#F16323] hover:bg-[#F16323]/15 md:hidden"
            aria-label={open ? t("common:actions.close") : t("common:actions.openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden">
          <div className="mx-auto max-w-7xl px-4 pb-4">
            <div className="rounded-2xl border border-black/5 bg-white p-2 shadow-sm">
              <NavLink
                to="/"
                className={mobileLink}
                end
                onClick={() => setOpen(false)}
              >
                <Home className="h-5 w-5" />
                {t("nav.home", { ns: "common" })}
              </NavLink>

              <NavLink
                to="/search"
                className={mobileLink}
                onClick={() => setOpen(false)}
              >
                <Search className="h-5 w-5" />
                {t("nav.searchDormitories", { ns: "common" })}
              </NavLink>

              <NavLink
                to="/community"
                className={mobileLink}
                onClick={() => setOpen(false)}
              >
                <Users className="h-5 w-5" />
                {t("nav.community", { ns: "common" })}
              </NavLink>

              <div className="mt-2 flex items-center justify-between gap-2 px-2 pb-2">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F16323]/10 px-4 py-3 font-bold text-[#F16323] hover:bg-[#F16323]/15"
                >
                  <Moon className="h-5 w-5" />
                  {t("actions.theme", { ns: "common" })}
                </button>
                <button
                  type="button"
                  onClick={toggleLang}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F16323]/10 px-4 py-3 font-bold text-[#F16323] hover:bg-[#F16323]/15"
                >
                  <Globe className="h-5 w-5" />
                  {currentLng.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-px w-full bg-black/10" />
    </header>
  );
};

export default MainNav;