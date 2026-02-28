// client/src/pages/DormDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  X,
  Home as HomeIcon,
  MapPin,
  Star,
  Phone,
  Droplets,
  Zap,
  Users,
  PawPrint,
  Ban,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  Footprints,
  Bike,
  Car,
  Bus,
  CalendarDays,
} from "lucide-react";

import ReviewPanel from "../components/review/ReviewPanel";
import ContactPanel from "../components/contact/ContactPanel";

const ORANGE = "#F16323";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatMoney(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("th-TH");
}

function toArrayImages(d) {
  const imgs = d?.images || d?.dorm_images || d?.Dorm_Images || d?.dorm_Images || [];
  const list = Array.isArray(imgs)
    ? imgs.map((x) => x?.image_url || x?.url || x).filter(Boolean)
    : [];
  if (list.length) return list;
  if (d?.cover_image_url) return [d.cover_image_url];
  return [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  ];
}

function PillOutline({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#F16323] px-3 py-1 text-[12px] font-bold text-[#F16323]">
      {children}
    </span>
  );
}

function TabButton({ active, icon: Icon, children, onClick, rightText }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border px-3 text-[14px] font-extrabold transition",
        active
          ? "bg-[#F16323] text-white border-[#F16323]"
          : "bg-white text-[#F16323] border-[#F16323] hover:bg-[#F16323]/10"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-white" : "text-[#F16323]")} />
      <span className="whitespace-nowrap">{children}</span>
      {rightText ? (
        <span className={cn("font-bold", active ? "text-white/90" : "text-[#F16323]/80")}>
          {rightText}
        </span>
      ) : null}
    </button>
  );
}

function AmenityChip({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-300/80 px-3 py-1 text-[12px] font-extrabold text-[#F16323]">
      {children}
    </span>
  );
}

function InfoPair({ icon: Icon, title, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5" style={{ color: ORANGE }} />
      <div>
        <div className="text-[16px] font-extrabold text-[#F16323]">{title}</div>
        <div className="text-[16px] text-[#F16323]">{value ?? "-"}</div>
      </div>
    </div>
  );
}

function toDriveImageUrl(url = "") {
  const s = String(url || "").trim();
  if (!s) return "";
  if (s.includes("drive.google.com/thumbnail")) return s;

  const m1 = s.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (m1) return `https://drive.google.com/thumbnail?id=${m1[1]}&sz=w1200`;

  const m3 = s.match(/[?&]id=([^&]+)/i);
  if (m3 && s.includes("drive.google.com")) {
    return `https://drive.google.com/thumbnail?id=${m3[1]}&sz=w1200`;
  }
  return s;
}

/** helpers */
function pickAny(obj, paths = []) {
  for (const p of paths) {
    const parts = String(p).split(".");
    let cur = obj;
    for (const k of parts) cur = cur?.[k];
    if (cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return null;
}
function toNumberOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function monthText(v) {
  const n = toNumberOrNull(v);
  if (n === null) return v !== undefined && v !== null && v !== "" ? String(v) : "-";
  return `${n} Month`;
}
function rateText(v) {
  if (v === undefined || v === null || v === "") return "-";
  const n = Number(v);
  if (Number.isFinite(n)) return `${n} Baht/Unit`;
  return `${String(v)} Baht/Unit`;
}
function resolveSecurityDepositMonths(dorm) {
  const direct = pickAny(dorm, [
    "fees.security_deposit_months",
    "fees.securityDepositMonths",
    "fees.deposit_months",
    "security_deposit_months",
    "securityDepositMonths",
    "deposit_months",
  ]);
  if (direct != null) return direct;

  const depType = pickAny(dorm, ["deposit_type", "fees.deposit_type", "depositType", "fees.depositType"]);
  const depVal = pickAny(dorm, ["deposit_value", "fees.deposit_value", "depositValue", "fees.depositValue"]);

  const t = String(depType || "").toLowerCase();
  if (depVal != null) {
    if (t.includes("month") || t.includes("เดือน")) return depVal;
    const n = toNumberOrNull(depVal);
    if (n != null) return n;
  }
  return null;
}
function resolveAdvanceRentMonths(dorm) {
  return pickAny(dorm, [
    "fees.advance_rent_months",
    "fees.advanceRentMonths",
    "advance_rent_months",
    "advanceRentMonths",
    "advance_rent_month",
    "advanceRentMonth",
  ]);
}

/** Gallery */
function TwoImageGallery({ images }) {
  const safe = Array.isArray(images) && images.length ? images : [];
  const [idx, setIdx] = useState(0);

  useEffect(() => setIdx(0), [safe.length]);

  const prev = () => setIdx((i) => Math.max(0, i - 2));
  const next = () => setIdx((i) => Math.min(Math.max(0, safe.length - 2), i + 2));

  const left = safe[idx];
  const right = safe[idx + 1] || safe[idx];

  const FALLBACK =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="relative mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="overflow-hidden rounded-[16px] bg-black/5">
          <img
            src={left}
            alt="left"
            className="h-[260px] md:h-[320px] w-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => (e.currentTarget.src = FALLBACK)}
          />
        </div>
        <div className="overflow-hidden rounded-[16px] bg-black/5">
          <img
            src={right}
            alt="right"
            className="h-[260px] md:h-[320px] w-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => (e.currentTarget.src = FALLBACK)}
          />
        </div>
      </div>

      {safe.length > 2 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute -left-2 top-1/2 -translate-y-1/2 rounded-full border border-[#F16323] bg-white p-2 shadow hover:bg-[#F16323]/10"
            aria-label="prev"
          >
            <ChevronsLeft className="h-5 w-5" style={{ color: ORANGE }} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute -right-2 top-1/2 -translate-y-1/2 rounded-full border border-[#F16323] bg-white p-2 shadow hover:bg-[#F16323]/10"
            aria-label="next"
          >
            <ChevronsRight className="h-5 w-5" style={{ color: ORANGE }} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[12px] font-extrabold text-[#F16323] shadow">
            {Math.min(idx + 2, safe.length)}/{safe.length}
          </div>
        </>
      )}
    </div>
  );
}

/** Travel UI */
function TravelCard({ icon, title, subtitle, minutesText, costText }) {
  return (
    <div className="rounded-[22px] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.10)]">
      <div className="mx-auto flex h-[62px] w-[62px] items-center justify-center rounded-[14px] bg-[#F16323]">
        {icon}
      </div>

      <div className="mt-5 text-center">
        <div className="text-[16px] font-extrabold text-[#F16323]">{title}</div>
        <div className="mt-1 text-[12px] text-[#F16323]/80">{subtitle}</div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 text-[#F16323]">
        <div className="flex items-center gap-2 text-[12px] font-bold">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F16323]/10">
            <CalendarDays className="h-4 w-4" />
          </span>
          {minutesText}
        </div>

        <div className="flex items-center gap-2 text-[12px] font-bold">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F16323]/10">
            <span className="text-[13px] font-extrabold">฿</span>
          </span>
          {costText}
        </div>
      </div>
    </div>
  );
}

function TravelTab() {
  return (
    <div className="mt-6 rounded-[18px] bg-[#F16323] p-8">
      <div className="flex items-center gap-3 text-white">
        <TrendingUp className="h-6 w-6" />
        <div className="text-[20px] font-extrabold">Path recommend</div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <TravelCard icon={<Footprints className="h-7 w-7 text-white" />} title="Travel by foot" subtitle="Walking route to kmitl" minutesText="10 minute" costText="Free" />
        <TravelCard icon={<Bike className="h-7 w-7 text-white" />} title="Travel by Bicycle" subtitle="Driving route to kmitl" minutesText="5 minute" costText="Free" />
        <TravelCard icon={<Bike className="h-7 w-7 text-white" />} title="Travel by Motorcycle" subtitle="Driving route to kmitl" minutesText="3 minute" costText="Free" />
        <TravelCard icon={<Car className="h-7 w-7 text-white" />} title="Travel by Car" subtitle="Driving route to kmitl" minutesText="15 minute" costText="Free" />
      </div>

      <div className="mt-12 flex items-center gap-3 text-white">
        <TrendingUp className="h-6 w-6" />
        <div className="text-[20px] font-extrabold">Public Transport</div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <TravelCard icon={<Bike className="h-7 w-7 text-white" />} title="Travel by Motorcycle" subtitle="Driving route to kmitl" minutesText="3 minute" costText="20" />
        <TravelCard icon={<Car className="h-7 w-7 text-white" />} title="Travel by Car" subtitle="Driving route to kmitl" minutesText="15 minute" costText="35 - 60" />
        <TravelCard icon={<Bus className="h-7 w-7 text-white" />} title="Travel by Bus" subtitle="Driving route to kmitl" minutesText="3 minute" costText="20" />
        <TravelCard icon={<Bus className="h-7 w-7 text-white" />} title="Travel by Mini Bus" subtitle="Driving route to kmitl" minutesText="15 minute" costText="30 - 40" />
      </div>
    </div>
  );
}

/** ✅ Modal กลางจอ */
function LoginRequiredModal({ open, title, message, onClose, onGoLogin }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-[520px] max-w-[94vw] overflow-hidden rounded-[22px] border border-[#F16323]/30 bg-white shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F16323] text-white">
              <Star className="h-6 w-6 fill-white text-white" />
            </div>

            <div className="min-w-0">
              <div className="text-[18px] font-extrabold text-[#F16323]">{title}</div>
              <div className="mt-1 text-[14px] text-black/70">{message}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="close modal"
          >
            <X className="h-5 w-5 text-[#F16323]" />
          </button>
        </div>

        <div className="border-t border-black/10" />

        <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#F16323] px-6 text-[14px] font-extrabold text-[#F16323] hover:bg-[#F16323]/10 sm:w-auto"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={onGoLogin}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#F16323] px-7 text-[14px] font-extrabold text-white hover:opacity-95 sm:w-auto"
          >
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>

      <button
        type="button"
        className="fixed inset-0 -z-10 cursor-default"
        aria-label="overlay"
        onClick={onClose}
      />
    </div>
  );
}

/** ✅ เช็ค login แบบรองรับ ecom-storage ด้วย */
function getTokenForLoginCheck() {
  try {
    const t1 = localStorage.getItem("token");
    if (t1) return t1;

    const t2 = localStorage.getItem("access_token");
    if (t2) return t2;

    const raw = localStorage.getItem("ecom-storage");
    if (!raw) return "";
    const obj = JSON.parse(raw);
    const stateRaw = obj?.state
      ? typeof obj.state === "string"
        ? JSON.parse(obj.state)
        : obj.state
      : obj;
    return stateRaw?.user?.token || stateRaw?.token || "";
  } catch {
    return "";
  }
}

export default function DormDetail() {
  const params = useParams();
  const dormId = params?.dormId ?? params?.id;

  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const API_BASE =
    import.meta?.env?.VITE_API_URL?.replace(/\/?api\/?$/i, "") ||
    import.meta?.env?.VITE_API_BASE_URL ||
    "http://localhost:5000";
  const API = `${API_BASE}/api`;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [tab, setTab] = useState("details");
  const [selectedRoom, setSelectedRoom] = useState("");

  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const isLoggedIn = Boolean(getTokenForLoginCheck());

  useEffect(() => {
    const t = (sp.get("tab") || "").toLowerCase();
    if (["details", "travel", "review", "contact"].includes(t)) setTab(t);
  }, [sp]);

  useEffect(() => {
    const controller = new AbortController();
    if (!dormId) return;

    const run = async () => {
      try {
        setLoading(true);
        setErrMsg("");

        const resp = await fetch(`${API}/dorm/${dormId}`, { signal: controller.signal });
        const json = await resp.json().catch(() => null);

        if (!resp.ok) {
          setData(null);
          setErrMsg(json?.message || "Dorm not found");
          return;
        }

        setData(json);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setErrMsg("Server error / CORS / API URL not correct");
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [API, dormId]);

  const dorm = useMemo(() => data?.dorm ?? data, [data]);
  const title = dorm?.dorm_name_th || dorm?.dorm_name_en || "-";
  const desc =
    dorm?.description_th ||
    dorm?.description_en ||
    "View dormitory details, prices, amenities, and contact information";

  const images = useMemo(() => toArrayImages(dorm).map(toDriveImageUrl).filter(Boolean), [dorm]);
  const roomTypes = dorm?.room_types || dorm?.rooms || [];

  const minPrice =
    dorm?.min_price_per_month ?? dorm?.minPrice ?? dorm?.price_min ?? dorm?.priceMin ?? null;
  const maxPrice =
    dorm?.max_price_per_month ?? dorm?.maxPrice ?? dorm?.price_max ?? dorm?.priceMax ?? null;

  const priceText =
    minPrice == null && maxPrice == null
      ? "-"
      : minPrice != null && maxPrice != null && minPrice !== maxPrice
      ? `฿ ${formatMoney(minPrice)} - ${formatMoney(maxPrice)} / Month`
      : `฿ ${formatMoney(minPrice ?? maxPrice)} / Month`;

  const distanceM = dorm?.distance_m ?? null;
  const distanceText =
    distanceM == null
      ? "-"
      : distanceM < 1000
      ? `Within ${distanceM} m`
      : `Within ${(distanceM / 1000).toFixed(1)} km`;

  const waterRate = pickAny(dorm, ["fees.water_rate", "fees.waterRate", "water_rate", "waterRate"]);
  const electricRate = pickAny(dorm, ["fees.electric_rate", "fees.electricRate", "electric_rate", "electricRate"]);
  const securityDeposit = resolveSecurityDepositMonths(dorm);
  const advanceRent = resolveAdvanceRentMonths(dorm);

  const availableRooms = dorm?.available_rooms ?? dorm?.rooms_available ?? 0;

  const amenities =
    dorm?.amenities || (dorm?.dormAmenities || []).map((x) => x?.amenity).filter(Boolean) || [];

  useEffect(() => {
    if (!roomTypes?.length) return;
    const first = roomTypes[0];
    const name = first?.room_type_name_th || first?.room_type_name_en || "Room Type";
    setSelectedRoom(name);
  }, [roomTypes?.length]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      {/* ✅ Modal ต้องอยู่ใน return เท่านั้น */}
      <LoginRequiredModal
        open={loginModalOpen}
        title="ไม่สามารถรีวิวได้"
        message="กรุณาเข้าสู่ระบบก่อน จึงจะสามารถเขียนรีวิวได้"
        onClose={() => setLoginModalOpen(false)}
        onGoLogin={() => {
          setLoginModalOpen(false);
          navigate("/login");
        }}
      />

      <div className="relative w-[680px] md:w-[720px] max-w-[94vw] max-h-[88vh] overflow-auto rounded-[20px] border-2 border-[#F16323] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white hover:bg-[#F16323]/10"
          aria-label="Close"
        >
          <X className="h-6 w-6" style={{ color: ORANGE }} />
        </button>

        <div className="p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-[74px] w-[87px] items-center justify-center rounded-[10px] bg-[#F16323] text-[48px] font-extrabold text-white">
              {String(title).slice(0, 1).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[24px] font-bold text-[#F16323]">{title}</div>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-[#F16323]">
                  <Star className="h-5 w-5 fill-[#F16323]" />
                  <span className="text-[14px]">
                    {Number(dorm?.avg_rating ?? dorm?.rating ?? 0).toFixed(1)} (
                    {Number(dorm?.review_count ?? dorm?.reviews ?? 0)} Review)
                  </span>
                </div>

                <PillOutline>{availableRooms} rooms available</PillOutline>
              </div>

              <div className="mt-2 text-[14px] text-[#F16323]">{desc}</div>
            </div>
          </div>

          <div className="my-5 border-t border-[#F16323]" />

          <div className="flex gap-4">
            <TabButton active={tab === "details"} icon={HomeIcon} onClick={() => setTab("details")}>
              Details
            </TabButton>

            <TabButton active={tab === "travel"} icon={MapPin} onClick={() => setTab("travel")}>
              Travel
            </TabButton>

            <TabButton
              active={tab === "review"}
              icon={Star}
              onClick={() => setTab("review")}
              rightText={`(${Number(dorm?.review_count ?? dorm?.reviews ?? 0)})`}
            >
              Review
            </TabButton>

            <TabButton active={tab === "contact"} icon={Phone} onClick={() => setTab("contact")}>
              Contact
            </TabButton>
          </div>

          {loading && (
            <div className="mt-6 rounded-xl border border-black/10 p-6 text-center text-[12px] text-black/50">
              Loading...
            </div>
          )}
          {!loading && errMsg && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-[12px] text-red-600">
              {errMsg}
            </div>
          )}

          {!loading && !errMsg && dorm && (
            <>
              {tab === "travel" && <TravelTab />}

              {tab === "review" && (
                <ReviewPanel
                  dormId={dormId}
                  apiBase={API}
                  pageSize={2}
                  onCountChange={() => {}}
                  isLoggedIn={isLoggedIn}
                  onLoginRequired={() => setLoginModalOpen(true)}
                />
              )}

              {tab === "contact" && <ContactPanel dorm={dorm} />}

              {tab === "details" && (
                <>
                  <div className="mt-5 flex items-center gap-3 rounded-full bg-[#F16323] p-2">
                    <div className="px-4 text-[16px] font-bold text-white">Select Room Types</div>

                    <div className="flex flex-1 items-center justify-between rounded-full bg-white px-4 py-2">
                      <div className="flex items-center gap-2 text-[14px] font-extrabold text-[#F16323]">
                        <Users className="h-4 w-4" style={{ color: ORANGE }} />
                        <span>{selectedRoom || "Select"}</span>
                      </div>

                      <ChevronDown className="h-5 w-5" style={{ color: ORANGE }} />
                    </div>
                  </div>

                  <TwoImageGallery images={images} />

                  <div className="mt-6 grid gap-6 md:grid-cols-[1fr_240px]">
                    <div>
                      <div className="flex items-center gap-2 text-[20px] font-extrabold text-[#F16323]">
                        <MapPin className="h-6 w-6" style={{ color: ORANGE }} />
                        <span>{distanceText}</span>
                      </div>

                      <div className="mt-3 text-[16px] leading-7 text-[#F16323]/70">{desc}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[20px] font-extrabold text-[#F16323]">{priceText}</div>
                      <div className="mt-2 flex items-center justify-end gap-2 text-[14px] text-[#F16323]">
                        <Users className="h-5 w-5" style={{ color: ORANGE }} />
                        <span>{availableRooms} rooms available</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-8 md:grid-cols-2">
                    <InfoPair icon={Droplets} title="Water" value={rateText(waterRate)} />
                    <InfoPair icon={Zap} title="Electric" value={rateText(electricRate)} />
                    <InfoPair icon={HomeIcon} title="Security Deposit" value={monthText(securityDeposit)} />
                    <InfoPair icon={HomeIcon} title="Advance Rent" value={monthText(advanceRent)} />
                  </div>

                  <div className="mt-10">
                    <div className="text-[18px] font-extrabold text-[#F16323]">Dormitory type</div>
                    <div className="mt-3">
                      <span className="inline-flex rounded-full bg-[#F16323] px-6 py-2 text-[14px] font-extrabold text-white">
                        {dorm?.policies?.gender_policy ?? dorm?.gender_policy ?? "mixed"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-10">
                    <div className="text-[18px] font-extrabold text-[#F16323]">Features & Amenities</div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {(amenities || []).slice(0, 18).map((a, i) => {
                        const name = a?.amenity_name_th || a?.amenity_name_en || String(a);
                        return <AmenityChip key={i}>{name}</AmenityChip>;
                      })}
                      {!amenities?.length && <div className="text-[14px] text-black/40">—</div>}
                    </div>
                  </div>

                  <div className="mt-10 grid gap-8 md:grid-cols-2">
                    <div>
                      <div className="text-[18px] font-extrabold text-[#F16323]">Additional</div>
                      <div className="mt-4 flex items-center gap-3 text-[16px] text-[#F16323]">
                        <PawPrint className="h-6 w-6" style={{ color: ORANGE }} />
                        <span>Pet Friendly</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[18px] font-extrabold text-[#F16323]">Prohibition</div>
                      <div className="mt-4 flex items-center gap-3 text-[16px] text-[#F16323]">
                        <Ban className="h-6 w-6" style={{ color: ORANGE }} />
                        <span>No Smoke</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end gap-2 pb-2">
                    <button
                      type="button"
                      className="h-10 rounded-full border border-[#F16323] px-5 text-[14px] font-extrabold text-[#F16323] hover:bg-[#F16323]/10"
                      onClick={() => navigate(-1)}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <button
        className="fixed inset-0 -z-10 cursor-default"
        aria-label="overlay"
        onClick={() => navigate(-1)}
        type="button"
      />
    </div>
  );
}