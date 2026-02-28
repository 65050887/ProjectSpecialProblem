// client/src/pages/Search.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  LayoutGrid,
  List,
  MapPin,
  BadgeCheck,
  Star,
  Heart,
  MessageCircle,
  Users,
  Wifi,
  Car,
  WashingMachine,
  Wind,
  Fan,
  Phone,
  Eye,
  GitCompare,
  RotateCcw,
  Check,
  X,
} from "lucide-react";

import FilterPanel, { DEFAULT_VALUE as FILTER_DEFAULT } from "../components/FilterPanel";

const ORANGE = "#F16323";
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

const ZONES = ["All", "Chalongkrung 1", "FBT", "Nikom", "Jinda"];

// ✅ compare
const COMPARE_KEY = "dc_compare_v1";
const COMPARE_MAX = 4;

/** ---------- helpers ---------- */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function inferZoneFromAddress(addr = "") {
  const a = (addr || "").toLowerCase();
  if (a.includes("ฉลองกรุง 1") || a.includes("chalong krung 1") || a.includes("chalongkrung 1"))
    return "Chalongkrung 1";
  if (a.includes("fbt")) return "FBT";
  if (a.includes("นิคม") || a.includes("nikom")) return "Nikom";
  if (a.includes("จินดา") || a.includes("jinda")) return "Jinda";
  return "Chalongkrung 1";
}

function formatMoney(n, locale = "th-TH") {
  const num = Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString(locale);
}

// ✅ format price range: "4,000 - 5,000" หรือ "4,000+"
function formatPriceRange(min, max, locale = "th-TH") {
  const a = Number(min);
  const b = Number(max);

  const hasA = Number.isFinite(a);
  const hasB = Number.isFinite(b);

  if (hasA && hasB) {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return `${lo.toLocaleString(locale)} - ${hi.toLocaleString(locale)}`;
  }
  if (hasA) return `${a.toLocaleString(locale)}+`;
  if (hasB) return `${b.toLocaleString(locale)}+`;
  return "-";
}

function formatDistance(distance_m, t) {
  const n = Number(distance_m);
  if (!Number.isFinite(n)) return "-";
  if (n < 1000) return t("search.units.m", { ns: "common", value: Math.round(n) });
  return t("search.units.km", { ns: "common", value: (n / 1000).toFixed(1) });
}

/** ---- Google Drive helpers ---- */
function driveIdFromUrl(url = "") {
  const s = String(url || "").trim();
  if (!s) return "";

  const m1 = s.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (m1) return m1[1];

  const m2 = s.match(/[?&]id=([^&]+)/i);
  if (m2 && s.includes("drive.google.com")) return m2[1];

  return "";
}

function toDriveThumbnail(url = "") {
  const s = String(url || "").trim();
  if (!s) return "";
  if (s.includes("drive.google.com/thumbnail")) return s;

  const id = driveIdFromUrl(s);
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;

  return s;
}

function toDriveDirect(url = "") {
  const s = String(url || "").trim();
  if (!s) return "";
  if (s.includes("drive.google.com/uc?export=view")) return s;

  const id = driveIdFromUrl(s);
  if (id) return `https://drive.google.com/uc?export=view&id=${id}`;

  return s;
}

/** ---- amenities helpers ---- */
function normalizeAmenityName(a) {
  const s = String(a || "").trim();
  if (!s) return "";
  return s.replace(/\s+/g, " ");
}

function pickAmenities(d) {
  if (Array.isArray(d?.amenities_preview) && d.amenities_preview.length) {
    return d.amenities_preview.map(normalizeAmenityName).filter(Boolean);
  }

  if (typeof d?.amenities_text === "string" && d.amenities_text.trim()) {
    return d.amenities_text
      .split(/,|;|\n|\r/g)
      .map((x) => normalizeAmenityName(x))
      .filter(Boolean);
  }

  if (Array.isArray(d?.dormAmenities) && d.dormAmenities.length) {
    const list = d.dormAmenities
      .map((x) => x?.amenity?.amenity_name_th || x?.amenity?.amenity_name_en)
      .map(normalizeAmenityName)
      .filter(Boolean);
    if (list.length) return list;
  }

  return [];
}

function amenityIcon(name = "") {
  const t = name.toLowerCase();
  if (t.includes("wi-fi") || t.includes("wifi")) return Wifi;
  if (t.includes("จอดรถ") || t.includes("parking")) return Car;
  if (t.includes("ซัก") || t.includes("laundry") || t.includes("washing")) return WashingMachine;
  return null;
}

/** ---- room type prices ---- */
function extractRoomTypePrices(d) {
  const roomTypes = Array.isArray(d?.room_types) ? d.room_types : [];
  const fanPrices = [];
  const airPrices = [];

  for (const r of roomTypes) {
    const name = String(r?.room_type_name_th || r?.room_type_name_en || r?.room_name || "")
      .toLowerCase()
      .trim();
    const price = Number(r?.price_per_month ?? r?.price_min ?? r?.price ?? null);
    if (!Number.isFinite(price)) continue;

    if (name.includes("พัดลม") || name.includes("fan")) fanPrices.push(price);
    if (name.includes("แอร์") || name.includes("air") || name.includes("ac")) airPrices.push(price);
  }

  const fanMin = fanPrices.length ? Math.min(...fanPrices) : null;
  const airMin = airPrices.length ? Math.min(...airPrices) : null;

  const pMin = Number(d?.price_min ?? d?.min_price_per_month ?? null);
  const pMax = Number(d?.price_max ?? d?.max_price_per_month ?? null);

  return {
    hasFan: fanMin != null || (Number.isFinite(pMin) && pMin > 0),
    hasAir: airMin != null || (Number.isFinite(pMax) && pMax > 0),
    fanMin: fanMin != null ? fanMin : Number.isFinite(pMin) && pMin > 0 ? pMin : null,
    airMin: airMin != null ? airMin : Number.isFinite(pMax) && pMax > 0 ? pMax : null,
  };
}

/** ---- compare storage ---- */
function readCompare() {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function writeCompare(arr) {
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(arr.slice(0, COMPARE_MAX)));
  } catch {
    // ignore
  }
}

/** ---------- ZonePill ---------- */
function ZonePill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-12 rounded-full px-10 text-[14px] font-semibold transition shadow-sm",
        active
          ? "bg-[#F16323] text-white shadow-[0_10px_16px_rgba(241,99,35,0.25)]"
          : "border border-[#F16323] text-[#F16323] hover:bg-[#F16323]/10"
      )}
    >
      {children}
    </button>
  );
}

/** ---------- Toast ---------- */
function Toast({ open, message, onClose }) {
  const { t } = useTranslation(["common"]);
  if (!open) return null;

  return (
    <div className="fixed left-1/2 top-10 z-[999] w-[92%] max-w-[860px] -translate-x-1/2">
      <div className="relative overflow-hidden rounded-[28px] border border-[#F16323]/30 bg-white shadow-[0_18px_34px_rgba(0,0,0,0.20)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
          aria-label={t("actions.close", { ns: "common" })}
        >
          <X className="h-5 w-5 text-[#F16323]" />
        </button>

        <div className="flex flex-col items-center gap-4 px-8 py-10">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#F16323] text-white">
            <Check className="h-9 w-9" />
          </span>
          <div className="text-center text-[28px] font-extrabold text-[#F16323]">{message}</div>
        </div>
      </div>
    </div>
  );
}

/** ---------- CompareBar (bottom fixed) ---------- */
function CompareBar({ count, onClear, onSee }) {
  const { t } = useTranslation(["common"]);
  if (!count) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[998]">
      <div className="bg-[#F16323]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-6 md:px-10">
          <div className="flex items-center gap-5 text-white">
            <div className="text-[22px] font-extrabold">
              {t("search.compareBar.title", { ns: "common" })}
            </div>
            <div className="inline-flex h-12 items-center justify-center rounded-full bg-white px-10 text-[20px] font-extrabold text-[#F16323]">
              {count}/{COMPARE_MAX}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-3 text-[20px] font-semibold text-white hover:opacity-95"
            >
              <RotateCcw className="h-6 w-6" />
              {t("search.compareBar.clear", { ns: "common" })}
            </button>

            <button
              type="button"
              onClick={onSee}
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-10 text-[20px] font-semibold text-[#F16323] shadow hover:opacity-95"
            >
              {t("search.compareBar.seeCompare", { ns: "common" })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ---------- DormCard ---------- */
function DormCard({ dorm, compared, onSeeDetails, onContact, onCompare, numberLocale }) {
  const { t } = useTranslation(["common"]);
  const CARD_W = 373;
  const CARD_H = 600;
  const IMG_H = 289;

  const imgThumb = toDriveThumbnail(dorm?.image);
  const imgDirect = toDriveDirect(dorm?.image);
  const [imgSrc, setImgSrc] = React.useState(imgThumb || imgDirect || FALLBACK_IMG);

  React.useEffect(() => {
    setImgSrc(imgThumb || imgDirect || FALLBACK_IMG);
  }, [imgThumb, imgDirect]);

  const handleImgError = () => {
    if (imgSrc !== imgThumb && imgThumb) return setImgSrc(imgThumb);
    if (imgSrc !== imgDirect && imgDirect) return setImgSrc(imgDirect);
    setImgSrc(FALLBACK_IMG);
  };

  const priceMin = dorm?.priceMin ?? null;
  const priceMax = dorm?.priceMax ?? null;
  const priceText = formatPriceRange(priceMin, priceMax, numberLocale);

  const avg = Number(dorm?.rating ?? 0);
  const reviewCount = Number(dorm?.reviews ?? 0);

  const amenities = (dorm?.amenities || []).slice(0, 3);
  const { hasAir, hasFan, fanMin, airMin } = extractRoomTypePrices(dorm?.raw);

  return (
    <div
      className="overflow-hidden rounded-[20px] border-2 border-[#F16323] bg-white shadow-[0_10px_26px_rgba(0,0,0,0.10)] flex flex-col"
      style={{ width: CARD_W, height: CARD_H }}
    >
      <div
        className="relative w-full overflow-hidden bg-white/5 flex-shrink-0"
        style={{ height: IMG_H }}
      >
        <img
          src={imgSrc}
          alt={dorm?.name || t("search.dorm.alt", { ns: "common" })}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={handleImgError}
        />

        {dorm?.verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-[14px] font-extrabold text-white shadow">
            <BadgeCheck className="h-5 w-5" />
            {t("search.dorm.verified", { ns: "common" })}
          </span>
        )}

        <div className="absolute right-3 top-3 flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F16323] text-white shadow hover:opacity-90"
            aria-label={t("search.dorm.favorite", { ns: "common" })}
            title={t("search.dorm.favorite", { ns: "common" })}
          >
            <Heart className="h-5 w-5" />
          </button>

          <span className="inline-flex items-center gap-2 rounded-full bg-[#F16323] px-3 py-1.5 text-[14px] font-bold text-white shadow">
            <Star className="h-4 w-4 fill-white" />
            {Number.isFinite(avg) ? avg.toFixed(1) : "0.0"}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F16323] text-white shadow hover:opacity-90"
            aria-label={t("search.dorm.comment", { ns: "common" })}
            title={t("search.dorm.comment", { ns: "common" })}
          >
            <MessageCircle className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onCompare}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full shadow hover:opacity-90",
              compared ? "bg-white text-[#F16323] border border-[#F16323]" : "bg-[#F16323] text-white"
            )}
            aria-label={t("search.dorm.compare", { ns: "common" })}
            title={
              compared
                ? t("search.dorm.compareAdded", { ns: "common" })
                : t("search.dorm.compareAdd", { ns: "common" })
            }
          >
            <GitCompare className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 overflow-hidden">
        <div className="text-[20px] font-extrabold leading-tight text-[#F16323] truncate">
          {dorm?.name || "-"}
        </div>

        <div className="mt-2 flex items-center gap-2 text-[#F16323]">
          <MapPin className="h-4 w-4" />
          <span className="text-[16px] font-bold">
            {t("search.dorm.distanceFromKmitl", { ns: "common", value: dorm?.distanceText })}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-[#F16323]">
          <Users className="h-4 w-4" />
          <span className="text-[16px] font-bold">
            {t("search.dorm.availableRooms", {
              ns: "common",
              available: dorm?.availableRooms ?? 0,
              total: dorm?.totalRooms ?? 0,
            })}
          </span>
        </div>

        {/* ✅ amenities: ถ้าว่างให้ "ไม่แสดงอะไร" (เอาขีด — ที่อยู่เหนือราคาออกตามที่ขอ) */}
        {amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((a, idx) => {
              const Icon = amenityIcon(a);
              return (
                <span
                  key={`${a}-${idx}`}
                  className="inline-flex items-center gap-2 rounded-full bg-yellow-300 px-3 py-1 text-[12px] font-extrabold text-[#F16323]"
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {a}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="text-[16px] font-bold text-[#F16323]">
            {t("search.dorm.pricePerMonth", { ns: "common", value: priceText })}
          </div>

          <div className="flex items-center gap-2 text-[#F16323]">
            <Star className="h-4 w-4 fill-[#F16323]" />
            <span className="text-[16px] font-bold">
              {Number.isFinite(avg) ? avg.toFixed(1) : "0.0"} ({reviewCount})
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {hasAir && (
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300 px-3 py-1 text-[14px] font-extrabold text-[#F16323]">
              <Wind className="h-4 w-4" />
              {t("search.dorm.air", { ns: "common" })}
            </span>
          )}
          {hasFan && (
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300 px-3 py-1 text-[14px] font-extrabold text-[#F16323]">
              <Fan className="h-4 w-4" />
              {t("search.dorm.fan", { ns: "common" })}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-4 text-[14px] font-bold text-[#F16323]">
          {hasFan && (
            <div className="flex items-center gap-2">
              <Fan className="h-5 w-5" />
              <span>
                {t("search.dorm.fanPrice", {
                  ns: "common",
                  value: fanMin != null ? formatMoney(fanMin, numberLocale) : "-",
                })}
              </span>
            </div>
          )}
          {hasAir && (
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5" />
              <span>
                {t("search.dorm.airPrice", {
                  ns: "common",
                  value: airMin != null ? formatMoney(airMin, numberLocale) : "-",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-[#F16323] text-[14px] font-bold text-white hover:opacity-90"
            onClick={onSeeDetails}
          >
            <Eye className="h-4 w-4" />
            {t("search.actions.seeDetails", { ns: "common" })}
          </button>

          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-2 rounded-full border-2 border-[#F16323] bg-transparent text-[14px] font-bold text-[#F16323] hover:bg-[#F16323]/10"
            onClick={onContact}
          >
            <Phone className="h-4 w-4" />
            {t("search.actions.contact", { ns: "common" })}
          </button>
        </div>
      </div>
    </div>
  );
}

/** ---------- Search Page ---------- */
export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation(["common"]);

  const isEn = String(i18n.language || "th").toLowerCase().startsWith("en");
  const numberLocale = isEn ? "en-US" : "th-TH";

  const [zone, setZone] = useState("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState("grid");

  // filters
  const [filters, setFilters] = useState(FILTER_DEFAULT);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const clearAllFilters = () => setFilters(FILTER_DEFAULT);

  const [dorms, setDorms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // compare
  const [compareList, setCompareList] = useState(() => readCompare());
  const compareIds = useMemo(
    () => new Set((compareList || []).map((x) => String(x?.id))),
    [compareList]
  );

  // toast
  const [toast, setToast] = useState({ open: false, text: "" });
  const showToast = (text) => {
    setToast({ open: true, text });
    window.clearTimeout(window.__dc_toast);
    window.__dc_toast = window.setTimeout(() => setToast({ open: false, text: "" }), 1400);
  };

  // ✅ zone label TH/EN ตามที่ขอ
  const zoneLabel = (z) => {
    if (z === "All") return t("search.zones.all", { ns: "common" });

    const map = {
      "Chalongkrung 1": { th: "โซนฉลองกรุง 1", en: "Zone Chalongkrung 1" },
      FBT: { th: "โซน FBT", en: "Zone FBT" },
      Nikom: { th: "โซนนิคม", en: "Zone Nikom" },
      Jinda: { th: "โซนจินดา", en: "Zone Jinda" },
    };

    const item = map[z];
    if (!item) return z;

    return isEn ? item.en : item.th;
  };

  // ✅ sync params from URL (Home -> Search)
  useEffect(() => {
    const qParam = (searchParams.get("q") || "").trim();
    const zoneParam = (searchParams.get("zone") || "").trim();

    const distanceMax = (searchParams.get("distanceMax") || "").trim();
    const distanceKm =
      distanceMax === "500"
        ? "0.5"
        : distanceMax === "1000"
        ? "1"
        : distanceMax === "2000"
        ? "2"
        : distanceMax === "3000"
        ? "3"
        : distanceMax === "4000"
        ? "4"
        : distanceMax === "5000"
        ? "5"
        : "";

    const priceMin = (searchParams.get("priceMin") || "").trim();
    const priceMax = (searchParams.get("priceMax") || "").trim();

    const petFriendly = (searchParams.get("petFriendly") || "").trim();
    const amenitiesAll = searchParams.getAll("amenities");
    const amenitiesRaw =
      amenitiesAll.length > 0
        ? amenitiesAll.join(",")
        : (searchParams.get("amenities") || "").trim();

    const dormitoryType = (searchParams.get("dormitoryType") || "").trim();
    const genderParam = (searchParams.get("gender") || "").trim();

    setQ(qParam);

    if (zoneParam && ZONES.includes(zoneParam)) setZone(zoneParam);
    else setZone("All");

    setFilters(() => {
      const next = { ...FILTER_DEFAULT };

      if (distanceKm) next.distance = distanceKm;
      if (priceMin) next.priceMin = priceMin;
      if (priceMax) next.priceMax = priceMax;

      if (petFriendly === "1" || petFriendly.toLowerCase() === "true") next.petFriendly = true;

      if (amenitiesRaw) {
        next.amenities = amenitiesRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const g = (genderParam || dormitoryType || "").toLowerCase();
      if (g === "male" || g === "female" || g === "mix") next.gender = g;

      return next;
    });
  }, [searchParams]);

  const addToCompare = async (d) => {
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const current = readCompare();
    const exists = current.some((x) => String(x?.id) === String(d.id));

    if (exists) {
      const next = current.filter((x) => String(x?.id) !== String(d.id));
      writeCompare(next);
      setCompareList(next);
      showToast(t("search.toast.removeCompareSuccess", { ns: "common" }));
      return;
    }

    if (current.length >= COMPARE_MAX) {
      showToast(t("search.toast.compareFull", { ns: "common", max: COMPARE_MAX }));
      return;
    }

    let detailRaw = d.raw;
    try {
      const resp = await fetch(`${API}/dorm/${d.id}`);
      const json = await resp.json();
      const dormDetail = json?.dorm || json?.data || json;
      if (resp.ok && dormDetail) detailRaw = { ...d.raw, ...dormDetail };
    } catch {}

    const item = {
      id: d.id,
      name: d.name,
      image: d.image,
      verified: d.verified,
      distanceText: d.distanceText,
      priceMin: d.priceMin,
      priceMax: d.priceMax,
      amenities: d.amenities || [],
      rating: d.rating,
      reviews: d.reviews,
      raw: detailRaw,
    };

    const next = [...current, item];
    writeCompare(next);
    setCompareList(next);
    showToast(t("search.toast.addCompareSuccess", { ns: "common" }));
  };

  const clearCompare = () => {
    writeCompare([]);
    setCompareList([]);
    showToast(t("search.toast.clearCompareSuccess", { ns: "common" }));
  };

  const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        params.set("page", "1");
        params.set("limit", "50");

        const url = `${API}/dorm/search?${params.toString()}`;
        const resp = await fetch(url, { signal: controller.signal });
        const data = await resp.json();

        if (!resp.ok) {
          setDorms([]);
          setErrMsg(data?.message || t("search.error.fetchFailed", { ns: "common" }));
          return;
        }

        const mapped = (data?.dorms || []).map((d, idx) => {
          const priceMin =
            d.price_min ?? d.min_price_per_month ?? d.min_price ?? d.priceMin ?? null;
          const priceMax =
            d.price_max ?? d.max_price_per_month ?? d.max_price ?? d.priceMax ?? null;

          const distM = d.distance_m ?? d.distance ?? null;
          const availableRooms = d.available_rooms ?? d.rooms_available ?? d.availableRooms ?? 0;
          const totalRooms = d.total_rooms ?? d.rooms_total ?? d.totalRooms ?? 0;

          const rating = d.avg_rating ?? d.rating ?? 0;
          const reviews = d.review_count ?? d.reviews ?? 0;

          const verifiedRaw = d.verified_status ?? d.verified ?? d.verifiedStatus;
          const verified =
            verifiedRaw === true ||
            verifiedRaw === 1 ||
            String(verifiedRaw ?? "").trim().toLowerCase() === "true" ||
            String(verifiedRaw ?? "").trim() === "1" ||
            String(verifiedRaw ?? "").trim().toLowerCase() === "verified";

          const amenities = pickAmenities(d);

          const imgRaw =
            d.cover_image_url ??
            d.coverImageUrl ??
            d.cover_image ??
            d.images?.[0]?.image_url ??
            null;

          const zoneTextRaw = d.zone_th ?? d.subzone_th ?? d.zone ?? "";
          const zoneMapped =
            zoneTextRaw && typeof zoneTextRaw === "string"
              ? (() => {
                  const z = zoneTextRaw.toLowerCase();
                  if (z.includes("ฉลองกรุง 1") || z.includes("chalong") || z.includes("chalongkrung"))
                    return "Chalongkrung 1";
                  if (z.includes("fbt")) return "FBT";
                  if (z.includes("นิคม") || z.includes("nikom")) return "Nikom";
                  if (z.includes("จินดา") || z.includes("jinda")) return "Jinda";
                  return inferZoneFromAddress(d.address_th);
                })()
              : inferZoneFromAddress(d.address_th);

          const id =
            d.dorm_id ??
            d.id ??
            d.dorm_code ??
            d.dormCode ??
            d.code ??
            `${d.dorm_name_th || "dorm"}-${idx}`;

          return {
            id,
            zone: zoneMapped,
            name:
              (isEn ? d.dorm_name_en || d.dorm_name_th : d.dorm_name_th || d.dorm_name_en) || "-",
            rating: Number(rating) || 0,
            reviews: Number(reviews) || 0,
            priceMin: priceMin != null ? Number(priceMin) : null,
            priceMax: priceMax != null ? Number(priceMax) : null,
            verified,
            distance_m: distM != null ? Number(distM) : null,
            distanceText: formatDistance(distM, t),
            availableRooms: Number(availableRooms) || 0,
            totalRooms: Number(totalRooms) || 0,
            amenities,
            image: imgRaw,
            raw: d,
          };
        });

        setDorms(mapped);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setDorms([]);
        setErrMsg(t("search.error.server", { ns: "common" }));
      } finally {
        setLoading(false);
      }
    };

    const tt = setTimeout(run, 250);
    return () => {
      clearTimeout(tt);
      controller.abort();
    };
  }, [q, API, t, isEn]);

  // apply filters
  const filtered = useMemo(() => {
    const f = filters || FILTER_DEFAULT;

    const priceMinF = Number(String(f.priceMin || "").trim());
    const priceMaxF = Number(String(f.priceMax || "").trim());
    const hasPriceMin = String(f.priceMin || "").trim() !== "" && Number.isFinite(priceMinF);
    const hasPriceMax = String(f.priceMax || "").trim() !== "" && Number.isFinite(priceMaxF);

    const distKm = Number(String(f.distance || "").trim());
    const hasDist = String(f.distance || "").trim() !== "" && Number.isFinite(distKm);
    const maxM = hasDist ? distKm * 1000 : null;

    return dorms
      .filter((d) => (zone === "All" ? true : d.zone === zone))
      .filter((d) => {
        if (f.verifiedOnly && !d.verified) return false;

        if (hasDist) {
          const dm = Number(d.distance_m ?? d.raw?.distance_m ?? null);
          if (!Number.isFinite(dm)) return false;
          if (dm > maxM) return false;
        }

        if (hasPriceMin) {
          const base = Number(d.priceMin ?? d.priceMax ?? 0);
          if (!Number.isFinite(base) || base < priceMinF) return false;
        }
        if (hasPriceMax) {
          const top = Number(d.priceMax ?? d.priceMin ?? 0);
          if (!Number.isFinite(top) || top > priceMaxF) return false;
        }

        const { hasAir, hasFan } = extractRoomTypePrices(d.raw);
        if (f.hasAir && !hasAir) return false;
        if (f.hasFan && !hasFan) return false;

        if (Array.isArray(f.amenities) && f.amenities.length) {
          const setA = new Set((d.amenities || []).map((x) => String(x).toLowerCase()));
          for (const a of f.amenities) {
            if (!setA.has(String(a).toLowerCase())) return false;
          }
        }

        if (f.gender && f.gender !== "any") {
          const gp = String(d.raw?.gender_policy || "").toLowerCase();
          if (f.gender === "male" && !gp.includes("male")) return false;
          if (f.gender === "female" && !gp.includes("female")) return false;
          if (f.gender === "mix" && !gp.includes("mix")) return false;
        }

        if (f.petFriendly) {
          const pet = String(d.raw?.pet_friendly ?? d.raw?.petFriendly ?? "").toLowerCase();
          if (!(pet === "true" || pet === "1" || pet.includes("yes") || pet.includes("allow")))
            return false;
        }

        return true;
      });
  }, [dorms, zone, filters]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((d) => {
      groups[d.zone] = groups[d.zone] || [];
      groups[d.zone].push(d);
    });
    return groups;
  }, [filtered]);

  const zonesToRender = useMemo(() => {
    if (zone !== "All") return [zone];
    const order = ["Chalongkrung 1", "FBT", "Nikom", "Jinda"];
    return order.filter((z) => grouped[z]?.length);
  }, [zone, grouped]);

  return (
    <div className="w-full bg-white">
      <Toast open={toast.open} message={toast.text} onClose={() => setToast({ open: false, text: "" })} />

      <div className={compareList.length ? "pb-28" : ""}>
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 md:px-10">
          <div className="w-full rounded-[28px] border border-black/10 bg-white px-10 py-10 shadow-[0_18px_34px_rgba(0,0,0,0.12)] md:min-h-[320px]">
            <div className="flex items-start justify-between gap-6 pt-10">
              <div>
                <div className="text-[20px] font-semibold tracking-tight text-[#F16323]">
                  {t("search.header.title", { ns: "common" })}
                </div>
                <div className="mt-2 text-[16px] text-[#F16323]/80">
                  {t("search.header.subtitle", { ns: "common" })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/compare")}
                  className="inline-flex h-12 items-center gap-3 rounded-xl bg-[#F16323] px-5 text-[16px] font-regular text-white shadow-[0_10px_18px_rgba(241,99,35,0.25)] hover:opacity-95"
                >
                  <GitCompare className="h-5 w-5" />
                  {t("search.header.compare", { ns: "common" })}
                </button>

                <div className="flex h-12 overflow-hidden rounded-xl border border-[#F16323]">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={cn(
                      "inline-flex w-14 items-center justify-center",
                      view === "grid" ? "bg-[#F16323] text-white" : "bg-white text-[#F16323]"
                    )}
                    aria-label={t("search.view.grid", { ns: "common" })}
                    title={t("search.view.grid", { ns: "common" })}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className={cn(
                      "inline-flex w-14 items-center justify-center",
                      view === "list" ? "bg-[#F16323] text-white" : "bg-white text-[#F16323]"
                    )}
                    aria-label={t("search.view.list", { ns: "common" })}
                    title={t("search.view.list", { ns: "common" })}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex h-12 flex-1 items-center rounded-full border border-[#F16323] bg-white px-6">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("search.header.searchPlaceholder", { ns: "common" })}
                  className="ml-4 h-full w-full bg-transparent text-[16px] font-medium text-[#F16323] outline-none placeholder:text-black/35"
                />
                <SearchIcon className="h-6 w-6 flex-shrink-0 text-[#F16323]" />
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen((s) => !s)}
                className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[#F16323] px-10 text-[18px] font-medium text-[#F16323] hover:bg-[#F16323]/10 md:w-auto"
              >
                <SlidersHorizontal className="h-6 w-6" />
                {filtersOpen
                  ? t("search.header.filtersOpen", { ns: "common" })
                  : t("search.header.filters", { ns: "common" })}
              </button>
            </div>

            <div className="mt-4 text-[12px]">
              {loading && (
                <span className="text-black/50">{t("search.status.loading", { ns: "common" })}</span>
              )}
              {!loading && errMsg && <span className="text-red-500">{errMsg}</span>}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-10 lg:flex-row">
            <aside className={cn("w-full lg:w-[420px]", filtersOpen ? "block" : "hidden")}>
              <div className="lg:sticky lg:top-24">
                <FilterPanel values={filters} onChange={setFilters} onClear={clearAllFilters} />
              </div>
            </aside>

            <main className="flex-1">
              <div className="flex flex-wrap items-center gap-5">
                <div className="text-[16px] font-bold text-[#F16323]">
                  {t("search.zoneFilter.label", { ns: "common" })}
                </div>
                <div className="flex flex-wrap gap-4">
                  {ZONES.map((z) => (
                    <ZonePill key={z} active={zone === z} onClick={() => setZone(z)}>
                      {zoneLabel(z)}
                    </ZonePill>
                  ))}
                </div>
              </div>

              <div className="mt-10 space-y-10">
                {zonesToRender.map((z) => (
                  <section key={z}>
                    <div className="mb-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F16323]/10">
                          <MapPin className="h-5 w-5" style={{ color: ORANGE }} />
                        </span>
                        {/* ✅ หัวข้อโซนแสดง TH/EN ตาม mapping */}
                        <h2 className="text-[20px] font-extrabold text-[#F16323]">
                          {zoneLabel(z)}
                        </h2>
                      </div>
                    </div>

                    {view === "grid" ? (
                      <div
                        className={cn(
                          "grid grid-cols-1 gap-8 md:grid-cols-2",
                          filtersOpen ? "xl:grid-cols-2" : "xl:grid-cols-3"
                        )}
                      >
                        {(grouped[z] || []).map((d) => (
                          <DormCard
                            key={d.id}
                            dorm={d}
                            compared={compareIds.has(String(d.id))}
                            onCompare={() => addToCompare(d)}
                            onSeeDetails={() => navigate(`/dorm/${d.id}`)}
                            onContact={() => navigate(`/dorm/${d.id}?tab=contact`)}
                            numberLocale={numberLocale}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(grouped[z] || []).map((d) => {
                          const listPriceText = formatPriceRange(d.priceMin, d.priceMax, numberLocale);
                          return (
                            <div
                              key={d.id}
                              className="flex flex-col gap-4 rounded-2xl border border-[#F16323] bg-white p-4 shadow-[0_10px_26px_rgba(0,0,0,0.10)] md:flex-row"
                            >
                              <img
                                src={toDriveThumbnail(d.image) || FALLBACK_IMG}
                                alt={d.name}
                                className="h-44 w-full rounded-xl object-cover md:w-72"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                              />

                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <div className="text-[18px] font-extrabold text-[#F16323]">
                                      {d.name}
                                    </div>
                                    <div className="mt-1 text-[14px] font-bold text-[#F16323]">
                                      {t("search.dorm.distanceFromKmitl", {
                                        ns: "common",
                                        value: d.distanceText,
                                      })}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => addToCompare(d)}
                                      className={cn(
                                        "inline-flex h-10 w-10 items-center justify-center rounded-full shadow hover:opacity-90",
                                        compareIds.has(String(d.id))
                                          ? "bg-white text-[#F16323] border border-[#F16323]"
                                          : "bg-[#F16323] text-white"
                                      )}
                                      title={t("search.dorm.compare", { ns: "common" })}
                                      aria-label={t("search.dorm.compare", { ns: "common" })}
                                    >
                                      <GitCompare className="h-5 w-5" />
                                    </button>

                                    <div className="flex items-center gap-2 rounded-full bg-[#F16323] px-3 py-1.5 text-[14px] font-bold text-white">
                                      <Star className="h-4 w-4 fill-white" />
                                      {d.rating.toFixed(1)}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                  <div className="text-[16px] font-bold text-[#F16323]">
                                    {t("search.dorm.pricePerMonth", {
                                      ns: "common",
                                      value: listPriceText,
                                    })}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#F16323] px-5 text-[14px] font-bold text-white hover:opacity-90"
                                      onClick={() => navigate(`/dorm/${d.id}`)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      {t("search.actions.seeDetails", { ns: "common" })}
                                    </button>
                                    <button
                                      type="button"
                                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border-2 border-[#F16323] px-5 text-[14px] font-bold text-[#F16323] hover:bg-[#F16323]/10"
                                      onClick={() => navigate(`/dorm/${d.id}?tab=contact`)}
                                    >
                                      <Phone className="h-4 w-4" />
                                      {t("search.actions.contact", { ns: "common" })}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                ))}

                {!loading && !errMsg && filtered.length === 0 && (
                  <div className="rounded-xl border border-black/10 p-6 text-center text-[12px] text-black/50">
                    {t("search.empty", { ns: "common" })}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      <CompareBar count={compareList.length} onClear={clearCompare} onSee={() => navigate("/compare")} />
    </div>
  );
}