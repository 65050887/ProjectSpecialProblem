// client/src/pages/Compare.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, X, BadgeCheck, MapPin, Star, Eye } from "lucide-react";

const ORANGE = "#F16323";
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

// ✅ ต้องให้ตรงกับ Search.jsx
const COMPARE_KEY = "dc_compare_v1";
const MAX_COMPARE = 4;

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatMoney(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("th-TH");
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

/** ---- compare storage ---- */
function readCompare() {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}
function writeCompare(list) {
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify((list || []).slice(0, MAX_COMPARE)));
  } catch {
    // ignore
  }
}

/** ---- safe getters (อ่านจาก raw รายละเอียดได้หลายชื่อ field) ---- */
function pickDormDetailJson(json) {
  // รองรับหลายรูปแบบ: { dorm: {...} } หรือ {...}
  return json?.dorm ?? json ?? null;
}

function getElectric(item) {
  const d = item?.detail ?? item?.raw ?? item ?? {};
  const v =
    d?.electric_rate ??
    d?.electric ??
    d?.electricRate ??
    d?.electric_price ??
    d?.fees?.electric_rate ??
    d?.fees?.electric ??
    null;

  const type =
    d?.electric_rate_type ??
    d?.electricType ??
    d?.electric_rate_unit ??
    d?.fees?.electric_rate_type ??
    d?.fees?.electricType ??
    "";

  if (v == null || v === "") return "-";
  return `${v} Bath ${type ? `/ ${type}` : "/ Unit"}`;
}

function getWater(item) {
  const d = item?.detail ?? item?.raw ?? item ?? {};
  const v =
    d?.water_rate ??
    d?.water ??
    d?.waterRate ??
    d?.water_price ??
    d?.fees?.water_rate ??
    d?.fees?.water ??
    null;

  const type =
    d?.water_rate_type ??
    d?.waterType ??
    d?.water_rate_unit ??
    d?.fees?.water_rate_type ??
    d?.fees?.waterType ??
    "";

  if (v == null || v === "") return "-";
  return `${v} Bath ${type ? `/ ${type}` : "/ Unit"}`;
}

function getInternet(item) {
  const d = item?.detail ?? item?.raw ?? item ?? {};
  const v =
    d?.internet ??
    d?.internet_fee ??
    d?.internetFee ??
    d?.wifi_fee ??
    d?.wifiFee ??
    null;

  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isFinite(n) && n === 0) return "Free";
  if (Number.isFinite(n)) return `${formatMoney(n)} Bath / month`;
  return String(v);
}

function getDormType(item) {
  const d = item?.detail ?? item?.raw ?? item ?? {};
  const gp = d?.gender_policy ?? d?.dormitoryType ?? d?.gender ?? "";
  const s = String(gp).toLowerCase();
  if (!s) return "-";
  if (s.includes("female")) return "Only Female";
  if (s.includes("male")) return "Only Male";
  if (s.includes("mix")) return "Mixed Dormitory";
  return gp;
}

function getDistanceM(item) {
  const d = item?.detail ?? item?.raw ?? item ?? {};
  const n = Number(d?.distance_m ?? d?.distance ?? item?.distance_m ?? null);
  return Number.isFinite(n) ? n : null;
}

function getRating(item) {
  const d = item?.detail ?? item?.raw ?? item ?? {};
  const n = Number(item?.rating ?? d?.avg_rating ?? d?.rating ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function getMinPrice(item) {
  const d = item?.detail ?? item?.raw ?? item ?? {};
  const n = Number(item?.priceMin ?? d?.price_min ?? d?.min_price_per_month ?? null);
  return Number.isFinite(n) ? n : null;
}

function getMaxPrice(item) {
  const d = item?.detail ?? item?.raw ?? item ?? {};
  const n = Number(item?.priceMax ?? d?.price_max ?? d?.max_price_per_month ?? null);
  return Number.isFinite(n) ? n : null;
}

export default function Compare() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [items, setItems] = useState(() => readCompare());
  const [detailsMap, setDetailsMap] = useState({}); // { [id]: dormDetail }

  // sync ถ้ามีการเปลี่ยน localStorage จากหน้าอื่น (หมายเหตุ: storage event จะยิงเฉพาะคนละ tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === COMPARE_KEY) setItems(readCompare());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ✅ fetch dorm detail เพื่อให้มี water_rate / electric_rate แน่นอน
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const ids = (items || []).map((x) => String(x?.id)).filter(Boolean);
        if (!ids.length) {
          setDetailsMap({});
          return;
        }

        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const resp = await fetch(`${API}/dorm/${id}`, { signal: controller.signal });
              const json = await resp.json().catch(() => null);
              if (!resp.ok) return [id, null];
              return [id, pickDormDetailJson(json)];
            } catch {
              return [id, null];
            }
          })
        );

        const next = {};
        for (const [id, detail] of results) {
          if (detail) next[id] = detail;
        }
        setDetailsMap(next);
      } catch (e) {
        if (e?.name === "AbortError") return;
        // ถ้าพัง ก็ยังให้ UI ทำงานด้วยข้อมูลเดิม
      }
    };

    run();
    return () => controller.abort();
  }, [API, items]);

  const viewItems = useMemo(() => {
    // merge รายละเอียดเข้า item.detail
    return (items || []).map((it) => ({
      ...it,
      detail: detailsMap[String(it?.id)] || null,
    }));
  }, [items, detailsMap]);

  const count = viewItems.length;

  const clearAll = () => {
    writeCompare([]);
    setItems([]);
    setDetailsMap({});
  };

  const removeOne = (id) => {
    const next = (items || []).filter((x) => String(x?.id) !== String(id));
    writeCompare(next);
    setItems(next);
  };

  // ✅ จำนวนคอลัมน์ตามจริง
  const gridStyle = useMemo(() => {
    return { gridTemplateColumns: `220px repeat(${count}, minmax(0, 1fr))` };
  }, [count]);

  const rows = useMemo(
    () => [
      {
        key: "price",
        label: "Price",
        render: (d) => {
          const min = getMinPrice(d);
          const max = getMaxPrice(d);
          if (min == null && max == null) return "-";
          if (min != null && max != null && min !== max) return `฿ ${formatMoney(min)} - ${formatMoney(max)} Bath / month`;
          return `฿ ${formatMoney(min ?? max)} Bath / month`;
        },
      },
      { key: "electric", label: "Fire", render: (d) => getElectric(d) },
      { key: "water", label: "Water", render: (d) => getWater(d) },
      { key: "internet", label: "Internet", render: (d) => getInternet(d) },
      {
        key: "fac",
        label: "Facilities",
        render: (d) =>
          (d.amenities || []).length ? (
            <div className="flex flex-wrap justify-center gap-2">
              {(d.amenities || []).map((a, idx) => (
                <span
                  key={`${a}-${idx}`}
                  className="inline-flex items-center gap-2 rounded-full bg-yellow-300 px-3 py-1 text-[12px] font-extrabold text-[#F16323]"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : (
            "-"
          ),
      },
      {
        key: "type",
        label: "Dormitory Type",
        render: (d) => (
          <span className="inline-flex rounded-full bg-[#F16323] px-6 py-2 text-[12px] font-extrabold text-white">
            {getDormType(d)}
          </span>
        ),
      },
      {
        key: "review",
        label: "Review",
        render: (d) => (
          <span className="inline-flex items-center gap-2 text-[14px] font-extrabold text-[#F16323]">
            <Star className="h-5 w-5 fill-[#F6D04D] text-[#F6D04D]" />
            {getRating(d).toFixed(1)}
          </span>
        ),
      },
    ],
    []
  );

  // ✅ Recommendation (จากรายการที่กำลัง compare)
  const recommendation = useMemo(() => {
    if (!viewItems.length) return null;

    // Best Value: ราคาต่ำสุด (ใช้ minPrice)
    const bestValue = [...viewItems].sort((a, b) => {
      const pa = getMinPrice(a) ?? 9e15;
      const pb = getMinPrice(b) ?? 9e15;
      return pa - pb;
    })[0];

    // Best Review: rating สูงสุด
    const bestReview = [...viewItems].sort((a, b) => getRating(b) - getRating(a))[0];

    // Nearest: distance_m ต่ำสุด
    const nearest = [...viewItems].sort((a, b) => {
      const da = getDistanceM(a) ?? 9e15;
      const db = getDistanceM(b) ?? 9e15;
      return da - db;
    })[0];

    return { bestValue, bestReview, nearest };
  }, [viewItems]);

  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-10">
        {/* HEADER + TABLE WRAP */}
        <div className={cn("rounded-[18px] border border-[#F16323]/40 bg-white", "shadow-[0_18px_34px_rgba(0,0,0,0.10)]")}>
          {/* TOP BAR */}
          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-5">
              <div className="text-[18px] font-extrabold text-[#F16323]">Compare Dormitory</div>

              <div className="inline-flex h-10 items-center justify-center rounded-full bg-[#F16323] px-6 text-[14px] font-extrabold text-white">
                {count}/{MAX_COMPARE}
              </div>

              <button
                type="button"
                onClick={clearAll}
                className="ml-4 inline-flex items-center gap-3 text-[14px] font-bold text-[#F16323] hover:opacity-90"
              >
                <RotateCcw className="h-5 w-5" />
                Clear
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate("/search")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
              aria-label="close"
              title="Back"
            >
              <X className="h-5 w-5 text-[#F16323]" />
            </button>
          </div>

          {/* EMPTY */}
          {count === 0 ? (
            <div className="px-6 pb-10">
              <div className="rounded-2xl border border-[#F16323]/25 bg-[#F16323]/5 p-10 text-center">
                <div className="text-[18px] font-extrabold text-[#F16323]">ยังไม่มีหอที่เลือกมาเปรียบเทียบ</div>
                <div className="mt-2 text-[14px] text-black/50">ไปที่หน้า Search แล้วกดปุ่ม Compare ที่การ์ดหอพักก่อนนะ</div>

                <button
                  type="button"
                  onClick={() => navigate("/search")}
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#F16323] px-8 text-[14px] font-extrabold text-white hover:opacity-95"
                >
                  Go to Search
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TOP CARDS ROW */}
              <div className="grid gap-0 border-t border-[#F16323]/20" style={gridStyle}>
                <div className="bg-[#F4F4F4]" />

                {viewItems.map((d) => (
                  <div key={d.id} className="relative bg-white px-6 py-8">
                    <button
                      type="button"
                      onClick={() => removeOne(d.id)}
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
                      aria-label="remove"
                      title="Remove"
                    >
                      <X className="h-4 w-4 text-[#F16323]" />
                    </button>

                    <div className="mx-auto w-[220px] overflow-hidden rounded-[18px] border border-[#F16323]/25 bg-white shadow-sm">
                      <div className="relative h-[120px] w-full bg-black/5">
                        <img
                          src={toDriveThumbnail(d.image) || FALLBACK_IMG}
                          alt={d.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                        />

                        {d.verified && (
                          <span className="absolute left-2 top-2 inline-flex items-center gap-2 rounded-full bg-green-500 px-3 py-1 text-[12px] font-extrabold text-white">
                            <BadgeCheck className="h-4 w-4" />
                            verify
                          </span>
                        )}
                      </div>

                      <div className="px-4 py-4">
                        <div className="truncate text-[16px] font-extrabold text-[#F16323]">{d.name}</div>

                        <div className="mt-2 flex items-center gap-2 text-[12px] font-bold text-[#F16323]">
                          <MapPin className="h-4 w-4" />
                          distance {d.distanceText ?? "-"} from kmitl
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/dorm/${d.id}`)}
                          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#F16323] text-[12px] font-extrabold text-white hover:opacity-95"
                        >
                          <Eye className="h-4 w-4" />
                          See Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* TABLE */}
              <div className="border-t border-[#F16323]/20">
                {rows.map((r, idx) => (
                  <div key={r.key} className="grid" style={gridStyle}>
                    <div
                      className={cn(
                        "flex items-center justify-center px-4 py-6 text-[13px] font-extrabold text-[#F16323]",
                        idx % 2 === 0 ? "bg-white" : "bg-[#F4F4F4]"
                      )}
                    >
                      {r.label}
                    </div>

                    {viewItems.map((d) => (
                      <div
                        key={`${r.key}-${d.id}`}
                        className={cn(
                          "flex items-center justify-center px-4 py-6 text-center text-[13px] font-bold text-[#F16323]",
                          idx % 2 === 0 ? "bg-white" : "bg-[#F4F4F4]"
                        )}
                      >
                        {typeof r.render === "function" ? r.render(d) : "-"}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* ✅ RECOMMENDATION (อยู่ในหน้า Compare) */}
              {recommendation && (
                <div className="px-6 pb-10 pt-8">
                  <div className="rounded-[18px] border border-[#F16323]/35 bg-white p-6">
                    <div className="text-[18px] font-extrabold text-[#F16323]">Reccommendation from DormConnect</div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div className="rounded-[14px] border border-[#F16323]/35 p-5 text-center">
                        <div className="text-[12px] font-bold text-[#F16323]/80">The Best Value is</div>
                        <div className="mt-3 text-[18px] font-extrabold text-[#F16323]">
                          {recommendation.bestValue?.name ?? "-"}
                        </div>
                      </div>

                      <div className="rounded-[14px] border border-[#F16323]/35 p-5 text-center">
                        <div className="text-[12px] font-bold text-[#F16323]/80">The Best Review is</div>
                        <div className="mt-3 text-[18px] font-extrabold text-[#F16323]">
                          {recommendation.bestReview?.name ?? "-"}
                        </div>
                      </div>

                      <div className="rounded-[14px] border border-[#F16323]/35 p-5 text-center">
                        <div className="text-[12px] font-bold text-[#F16323]/80">The Nearest is</div>
                        <div className="mt-3 text-[18px] font-extrabold text-[#F16323]">
                          {recommendation.nearest?.name ?? "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
