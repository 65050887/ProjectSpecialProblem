// client/src/pages/DormDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "lucide-react";

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
  const imgs =
    d?.images ||
    d?.dorm_images ||
    d?.Dorm_Images ||
    d?.dorm_Images ||
    [];
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

/** รูป 2 ใบ + ลูกศรซ้าย/ขวา */
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

export default function DormDetail() {
  const params = useParams();
  const dormId = params?.dormId ?? params?.id;

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [tab, setTab] = useState("details");

  const [selectedRoom, setSelectedRoom] = useState("");

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

  const images = useMemo(() => {
    return toArrayImages(dorm).map(toDriveImageUrl).filter(Boolean);
  }, [dorm]);

  const roomTypes = dorm?.room_types || dorm?.rooms || [];

  // ✅ ราคา: รองรับ min/max หลายชื่อ + แสดงช่วง
  const minPrice =
    dorm?.min_price_per_month ??
    dorm?.minPrice ??
    dorm?.price_min ??
    dorm?.priceMin ??
    null;

  const maxPrice =
    dorm?.max_price_per_month ??
    dorm?.maxPrice ??
    dorm?.price_max ??
    dorm?.priceMax ??
    null;

  const priceText =
    minPrice == null && maxPrice == null
      ? "-"
      : minPrice != null && maxPrice != null && minPrice !== maxPrice
        ? `฿ ${formatMoney(minPrice)} - ${formatMoney(maxPrice)} / Month`
        : `฿ ${formatMoney(minPrice ?? maxPrice)} / Month`;

  // ✅ ระยะทาง: อ่าน distance_m จาก backend
  const distanceM = dorm?.distance_m ?? null;
  const distanceText =
    distanceM == null
      ? "-"
      : distanceM < 1000
        ? `Within ${distanceM} m`
        : `Within ${(distanceM / 1000).toFixed(1)} km`;

  const waterRate = dorm?.fees?.water_rate ?? dorm?.water_rate;
  const electricRate = dorm?.fees?.electric_rate ?? dorm?.electric_rate;
  const securityDeposit =
    dorm?.fees?.security_deposit_months ?? dorm?.security_deposit_months;
  const advanceRent = dorm?.fees?.advance_rent_months ?? dorm?.advance_rent_months;

  const availableRooms = dorm?.available_rooms ?? dorm?.rooms_available ?? 0;

  const amenities =
    dorm?.amenities ||
    (dorm?.dormAmenities || []).map((x) => x?.amenity).filter(Boolean) ||
    [];

  useEffect(() => {
    if (!roomTypes?.length) return;
    const first = roomTypes[0];
    const name = first?.room_type_name_th || first?.room_type_name_en || "Room Type";
    setSelectedRoom(name);
  }, [roomTypes?.length]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-[680px] md:w-[720px] max-w-[94vh] max-h-[88vh] overflow-auto rounded-[20px] border-2 border-[#F16323] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
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
                  <div className="text-[20px] font-extrabold text-[#F16323]">
                    {priceText}
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-2 text-[14px] text-[#F16323]">
                    <Users className="h-5 w-5" style={{ color: ORANGE }} />
                    <span>{availableRooms} rooms available</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <InfoPair icon={Droplets} title="Water" value={waterRate ? `${waterRate} Bath/Unit` : "-"} />
                <InfoPair icon={Zap} title="Fire" value={electricRate ? `${electricRate} Bath/Unit` : "-"} />
                <InfoPair icon={HomeIcon} title="Security Deposit" value={securityDeposit != null ? `${securityDeposit} Month` : "-"} />
                <InfoPair icon={HomeIcon} title="Advance Rent" value={advanceRent != null ? `${advanceRent} Month` : "-"} />
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
