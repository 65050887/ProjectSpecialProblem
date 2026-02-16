// client\src\pages\user\FavoritesUser.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, Eye } from "lucide-react";
import UserSidebar from "../../components/UserSidebar";

const ORANGE = "#F16323";
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function formatMoney(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("th-TH");
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

export default function Favorites() {
  const navigate = useNavigate();

  // ✅ ใช้ base เดียวกับหน้าอื่น (ถ้า VITE_API_URL มี /api ให้ strip ออก)
  const API_BASE =
    import.meta?.env?.VITE_API_URL?.replace(/\/?api\/?$/i, "") ||
    import.meta?.env?.VITE_API_BASE_URL ||
    "http://localhost:5000";
  const API = `${API_BASE}/api`;

  // ✅ รองรับ key หลายอัน เผื่อโปรเจคมีของเก่า
  const FAVORITE_KEYS = ["dc_favorites_v1", "dc_fav_v1_3", "favorites_v1"];

  const [favIds, setFavIds] = useState([]);        // ["682","673"...]
  const [items, setItems] = useState([]);          // dorm objects
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // 1) อ่าน favorite ids จาก localStorage
  useEffect(() => {
    const readFavIds = () => {
      for (const k of FAVORITE_KEYS) {
        try {
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) {
            return parsed.map(String);
          }
        } catch {}
      }
      return [];
    };

    setFavIds(readFavIds());
  }, []);

  // helper: เขียนกลับ localStorage (ใช้ key แรกเป็นหลัก)
  const persistFavIds = (nextIds) => {
    const k = FAVORITE_KEYS[0];
    localStorage.setItem(k, JSON.stringify(nextIds));
    setFavIds(nextIds);
  };

  // 2) โหลด dorm detail สำหรับแต่ละ id
  useEffect(() => {
    if (!favIds.length) {
      setItems([]);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      try {
        setLoading(true);
        setErr("");

        const results = await Promise.all(
          favIds.map(async (id) => {
            const resp = await fetch(`${API}/dorm/${id}`, { signal: controller.signal });
            const json = await resp.json().catch(() => null);
            if (!resp.ok) return null;
            return json?.dorm ?? json; // รองรับ response 2 แบบ
          })
        );

        setItems(results.filter(Boolean));
      } catch (e) {
        if (e?.name === "AbortError") return;
        setErr("Failed to load favorites");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [API, favIds]);

  const removeFavorite = (id) => {
    const next = favIds.filter((x) => String(x) !== String(id));
    persistFavIds(next);
    // update list ทันที
    setItems((prev) => prev.filter((d) => String(d?.dorm_id ?? d?.id) !== String(id)));
  };

  const rows = useMemo(() => {
    return items.map((d) => {
      const dormId = String(d?.dorm_id ?? d?.id ?? "");
      const name = d?.dorm_name_th || d?.dorm_name_en || d?.dorm_name || "-";

      const cover =
        toDriveImageUrl(d?.cover_image_url) ||
        toDriveImageUrl(d?.images?.[0]?.image_url) ||
        toDriveImageUrl(d?.Dorm_Images?.[0]?.image_url) ||
        FALLBACK_IMG;

      const distanceM = Number(d?.distance_m);
      const distanceText = Number.isFinite(distanceM)
        ? distanceM < 1000
          ? `distance ${(distanceM / 1000).toFixed(1)} km from kmitl`
          : `distance ${(distanceM / 1000).toFixed(1)} km from kmitl`
        : "distance - from kmitl";

      const rating = Number(d?.avg_rating ?? d?.rating ?? 0);
      const reviewCount = Number(d?.review_count ?? 0);

      const minPrice = d?.min_price_per_month ?? d?.price_min ?? d?.priceMin ?? null;
      const maxPrice = d?.max_price_per_month ?? d?.price_max ?? d?.priceMax ?? null;

      const priceText =
        minPrice == null && maxPrice == null
          ? "-"
          : minPrice != null && maxPrice != null && minPrice !== maxPrice
          ? `฿ ${formatMoney(minPrice)} - ${formatMoney(maxPrice)} / Month`
          : `฿ ${formatMoney(minPrice ?? maxPrice)} / Month`;

      return { dormId, name, cover, distanceText, rating, reviewCount, priceText };
    });
  }, [items]);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
        {/* LEFT: Sidebar */}
        <UserSidebar className="w-full" />

        {/* RIGHT: Content */}
        <div>
          {/* Title */}
          <div className="mb-6 flex items-center gap-3" style={{ color: ORANGE }}>
            <Heart className="h-7 w-7 fill-[#F16323] text-[#F16323]" />
            <div className="text-[20px] font-extrabold">Favorite Dormitory</div>
          </div>

          {/* Loading / Empty / Error */}
          {loading && (
            <div className="rounded-[14px] border p-6 text-center text-[14px] font-bold"
                 style={{ borderColor: ORANGE, color: ORANGE }}>
              Loading favorites...
            </div>
          )}

          {!loading && err && (
            <div className="rounded-[14px] border border-red-200 bg-red-50 p-6 text-center text-[14px] font-bold text-red-600">
              {err}
            </div>
          )}

          {!loading && !err && favIds.length === 0 && (
            <div className="rounded-[14px] border p-10 text-center"
                 style={{ borderColor: ORANGE }}>
              <div className="text-[16px] font-extrabold" style={{ color: ORANGE }}>
                ยังไม่มีรายการโปรด
              </div>
              <div className="mt-2 text-[13px] text-black/50">
                ไปที่ Search แล้วกดหัวใจเพื่อเพิ่มหอเข้ารายการโปรดได้เลย
              </div>
              <button
                type="button"
                onClick={() => navigate("/user/search")}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 font-extrabold text-white"
                style={{ background: ORANGE }}
              >
                Go to Search
              </button>
            </div>
          )}

          {/* List */}
          {!loading && !err && rows.length > 0 && (
            <div className="space-y-6">
              {rows.map((r) => (
                <div
                  key={r.dormId}
                  className="rounded-[16px] border bg-white p-5"
                  style={{ borderColor: ORANGE }}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-5">
                      <div className="h-[86px] w-[150px] overflow-hidden rounded-[14px] bg-black/5">
                        <img
                          src={r.cover}
                          alt={r.name}
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="text-[18px] font-extrabold" style={{ color: ORANGE }}>
                          {r.name}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-[13px]" style={{ color: ORANGE }}>
                          <MapPin className="h-4 w-4" />
                          <span>{r.distanceText}</span>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: ORANGE }}>
                          <Star className="h-4 w-4 fill-[#F16323] text-[#F16323]" />
                          <span>
                            {Number(r.rating).toFixed(1)} ({r.reviewCount} Review)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="text-[14px] font-extrabold" style={{ color: ORANGE }}>
                        {r.priceText}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => removeFavorite(r.dormId)}
                          className="h-10 rounded-full bg-gray-300 px-6 text-[13px] font-bold text-white hover:opacity-90"
                        >
                          Remove
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/user/dorm/${r.dormId}?tab=details`)}
                          className={cn(
                            "inline-flex h-10 items-center gap-2 rounded-full border px-5 text-[13px] font-bold"
                          )}
                          style={{ borderColor: ORANGE, color: ORANGE }}
                        >
                          <Eye className="h-4 w-4" />
                          See detail
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
