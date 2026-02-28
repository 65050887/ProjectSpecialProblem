// client/src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  ChevronRight,
  Star,
  Users,
  MapPin,
  BadgeCheck,
  BadgeDollarSign,
  ShieldCheck,
} from "lucide-react";

const PRIMARY = "#F16323";
const BLUE = "#0066CC";
const REVIEW_BG = "#F1A323";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

/** ---------- helpers ---------- */
function formatMoney(n, locale = "th-TH") {
  const num = Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString(locale);
}

function formatDistanceM(m, t) {
  const num = Number(m);
  if (!Number.isFinite(num)) return "-";
  if (num >= 1000) return t("home.units.km", { value: (num / 1000).toFixed(1) });
  return t("home.units.m", { value: Math.round(num) });
}

function inferZoneFromAddress(addr = "") {
  const a = String(addr || "").toLowerCase();
  if (
    a.includes("ฉลองกรุง 1") ||
    a.includes("chalong krung 1") ||
    a.includes("chalongkrung 1") ||
    a.includes("chalongkrung") ||
    a.includes("chalong")
  )
    return "Chalongkrung 1";
  if (a.includes("fbt")) return "FBT";
  if (a.includes("นิคม") || a.includes("nikom")) return "Nikom";
  if (a.includes("jinda") || a.includes("จินดา")) return "Jinda";
  return "Chalongkrung 1";
}

function pickRandom(arr, n) {
  // ✅ ทำให้ผลลัพธ์ "คงที่" ไม่สลับเมื่อรีเฟรช
  // เลือกโดยเรียงตาม distance_m ใกล้ก่อน แล้วค่อย tie-break ด้วย id/ชื่อ
  const a = Array.isArray(arr) ? [...arr] : [];

  a.sort((x, y) => {
    const dx = Number(x?.distance_m ?? x?.raw?.distance_m);
    const dy = Number(y?.distance_m ?? y?.raw?.distance_m);

    const ax = Number.isFinite(dx) ? dx : Number.POSITIVE_INFINITY;
    const ay = Number.isFinite(dy) ? dy : Number.POSITIVE_INFINITY;

    if (ax !== ay) return ax - ay;

    const ix = Number(x?.id ?? x?.dorm_id ?? x?.raw?.dorm_id ?? 0);
    const iy = Number(y?.id ?? y?.dorm_id ?? y?.raw?.dorm_id ?? 0);

    if (ix !== iy) return ix - iy;

    const nx = String(x?.name ?? x?.raw?.dorm_name_th ?? x?.raw?.dorm_name_en ?? "");
    const ny = String(y?.name ?? y?.raw?.dorm_name_th ?? y?.raw?.dorm_name_en ?? "");
    return nx.localeCompare(ny, "th", { sensitivity: "base" });
  });

  return a.slice(0, n);
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** ---- Google Drive URL helpers (แก้รูปไม่ขึ้น) ---- */
function driveIdFromUrl(url = "") {
  const s = String(url || "").trim();
  if (!s) return "";

  const m1 = s.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (m1) return m1[1];

  const m2 = s.match(/[?&]id=([^&]+)/i);
  if (m2 && s.includes("drive.google.com")) return m2[1];

  const m3 = s.match(/uc\?export=view&id=([^&]+)/i);
  if (m3) return m3[1];

  return "";
}

function toDriveThumbnail(url = "") {
  const id = driveIdFromUrl(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1200` : String(url || "");
}

function toDriveDirect(url = "") {
  const id = driveIdFromUrl(url);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : String(url || "");
}

/** ---- Image component with fallback: thumb -> direct -> fallback ---- */
function DriveImg({ url, alt, className, style, ...props }) {
  const thumb = toDriveThumbnail(url);
  const direct = toDriveDirect(url);

  const [src, setSrc] = useState(thumb || direct || FALLBACK_IMG);

  useEffect(() => {
    setSrc(thumb || direct || FALLBACK_IMG);
  }, [thumb, direct]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onError={(e) => {
        if (direct && e.currentTarget.src !== direct) {
          setSrc(direct);
          return;
        }
        setSrc(FALLBACK_IMG);
      }}
      {...props}
    />
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(["common"]);

  // ✅ Home ใช้ base แบบไม่มี /api เพื่อเรียก /api/dorm/search
  const API_BASE =
    import.meta?.env?.VITE_API_URL?.replace(/\/?api\/?$/i, "") ||
    import.meta?.env?.VITE_API_BASE_URL ||
    "http://localhost:5000";

  const isEn = String(i18n.language || "th").toLowerCase().startsWith("en");
  const numberLocale = isEn ? "en-US" : "th-TH";

  const [q, setQ] = useState("");
  const [dorms, setDorms] = useState([]);
  const [loadingDorms, setLoadingDorms] = useState(true);

  // ✅ total จาก API (ไม่ใช่นับแค่ 50)
  const [totalDorms, setTotalDorms] = useState(null);

  // รีวิวตอนนี้ยังไม่มี API จริง
  const [reviews] = useState([]);

  function goSearch(params = {}) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      usp.set(k, String(v));
    });
    const qs = usp.toString();
    navigate(qs ? `/search?${qs}` : "/search");
  }

  function goDormDetail(d) {
    const id = d?.id || d?.dorm_id || d?.dorm_code;
    if (!id) return;
    navigate(`/dorm/${id}`);
  }

  const pickDormName = (rawDorm) => {
    const th = rawDorm?.dorm_name_th;
    const en = rawDorm?.dorm_name_en;
    const fallback = rawDorm?.dorm_name_th || rawDorm?.dorm_name_en || "-";
    return isEn ? (en || th || fallback) : (th || en || fallback);
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingDorms(true);

        const r = await fetchJSON(`${API_BASE}/api/dorm/search?page=1&limit=50`);

        const total = Number(r?.total ?? null);
        if (alive) setTotalDorms(Number.isFinite(total) ? total : null);

        const list = Array.isArray(r?.dorms) ? r.dorms : [];

        const mapped = list.map((d) => {
          const totalRooms = d?.total_rooms ?? null;
          const availableRooms = d?.available_rooms ?? null;
          const studentsLiving =
            Number.isFinite(Number(totalRooms)) && Number.isFinite(Number(availableRooms))
              ? Math.max(0, Number(totalRooms) - Number(availableRooms))
              : null;

          return {
            id: d?.dorm_id || d?.dorm_code || d?.id,
            dorm_id: d?.dorm_id,
            dorm_code: d?.dorm_code,
            name: pickDormName(d),
            address: d?.address_th || "",
            zone: inferZoneFromAddress(d?.address_th || ""),
            distance_m: d?.distance_m ?? null,
            price_min: d?.price_min ?? null,
            price_max: d?.price_max ?? null,
            verified: !!d?.verified_status,
            avg_rating: Number(d?.avg_rating ?? 0) || 0,
            review_count: Number(d?.review_count ?? 0) || 0,
            total_rooms: totalRooms,
            available_rooms: availableRooms,
            students_living: studentsLiving,
            cover_image_url: d?.cover_image_url || null,
            raw: d,
          };
        });

        if (alive) setDorms(mapped);
      } catch {
        if (alive) {
          setDorms([]);
          setTotalDorms(null);
        }
      } finally {
        if (alive) setLoadingDorms(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE, i18n.language]);

  const zones = useMemo(() => {
    const order = ["Chalongkrung 1", "FBT", "Nikom", "Jinda"];
    const set = new Set(dorms.map((d) => d.zone).filter(Boolean));
    return order.filter((z) => set.has(z));
  }, [dorms]);

  const heroDorm = useMemo(() => {
    if (!dorms?.length) return null;
    return pickRandom(dorms, 1)[0] || null; // ✅ ตอนนี้คงที่แล้ว
  }, [dorms]);

  const heroStudentsLiving = useMemo(() => {
    if (!heroDorm) return null;
    if (Number.isFinite(Number(heroDorm.students_living))) return Number(heroDorm.students_living);
    if (Number.isFinite(Number(heroDorm.total_rooms))) return Number(heroDorm.total_rooms);
    return null;
  }, [heroDorm]);

  const stats = useMemo(() => {
    const totalDormitoryNum = Number.isFinite(totalDorms) ? totalDorms : dorms.length;
    const totalRooms = dorms.reduce((s, d) => s + (Number(d.total_rooms) || 0), 0);

    return [
      {
        num: totalDormitoryNum ? totalDormitoryNum.toLocaleString(numberLocale) : "-",
        label: t("home.stats.totalDormitory"),
      },
      { num: "-", label: t("home.stats.totalCapacity") },
      { num: totalRooms ? totalRooms.toLocaleString(numberLocale) : "-", label: t("home.stats.totalRooms") },
    ];
  }, [dorms, totalDorms, numberLocale, t]);

  // ✅ ปุ่ม category จะส่ง query ไปให้ Search.jsx อ่าน
  const categories = useMemo(
    () => [
      {
        key: "location",
        title: t("home.category.location.title"),
        subtitle: t("home.category.location.subtitle"),
        icon: <MapPin size={26} color="white" />,
        pills: [
          { label: t("home.category.location.r500"), params: { distanceMax: 500 } },
          { label: t("home.category.location.r1k"), params: { distanceMax: 1000 } },
          { label: t("home.category.location.r2k"), params: { distanceMax: 2000 } },
        ],
      },
      {
        key: "prices",
        title: t("home.category.prices.title"),
        subtitle: t("home.category.prices.subtitle"),
        icon: <BadgeDollarSign size={26} color="white" />,
        pills: [
          { label: t("home.category.prices.p1"), params: { priceMin: 2800, priceMax: 3500 }, isMoney: true },
          { label: t("home.category.prices.p2"), params: { priceMin: 4000, priceMax: 5500 }, isMoney: true },
          { label: t("home.category.prices.p3"), params: { priceMin: 6000 }, isMoney: true },
        ],
      },
      {
        key: "facilities",
        title: t("home.category.facilities.title"),
        subtitle: t("home.category.facilities.subtitle"),
        icon: <ShieldCheck size={26} color="white" />,
        pills: [
          { label: t("home.category.facilities.pet"), params: { petFriendly: 1 } },
          { label: t("home.category.facilities.keycard"), params: { amenities: "key card" } },
          { label: t("home.category.facilities.gym"), params: { amenities: "gym" } },
        ],
      },
      {
        key: "type",
        title: t("home.category.type.title"),
        subtitle: t("home.category.type.subtitle"),
        icon: <Users size={26} color="white" />,
        pills: [
          { label: t("home.category.type.male"), params: { dormitoryType: "male" } },
          { label: t("home.category.type.female"), params: { dormitoryType: "female" } },
          { label: t("home.category.type.mix"), params: { dormitoryType: "mix" } },
        ],
      },
    ],
    [t]
  );

  return (
    <div className="w-full bg-white">
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto w-full max-w-[1190px] px-6 pt-[50px] pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
            <div>
              <span
                className="inline-flex items-center justify-center px-5 py-2 mb-6 text-sm font-bold text-white rounded-[10px]"
                style={{ background: PRIMARY, boxShadow: "0px 4px 4px #FFE0B2" }}
              >
                {t("home.hero.badge")}
              </span>

              <h1 className="font-bold leading-[64px] mb-6" style={{ color: PRIMARY, fontSize: 48 }}>
                {t("home.hero.title1")}
                <br />
                {t("home.hero.title2")}
                <br />
                {t("home.hero.title3")}
              </h1>

              <p className="max-w-[539px] mb-6 text-[14px] leading-[25px] text-justify" style={{ color: PRIMARY }}>
                {t("home.hero.desc")}
              </p>

              {/* Search */}
              <div className="mt-4 max-w-[540px]">
                <div className="flex items-center gap-3 rounded-[12px] px-4 py-3" style={{ border: `1px solid ${PRIMARY}` }}>
                  <SearchIcon size={18} color={PRIMARY} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") goSearch(q ? { q } : {});
                    }}
                    placeholder={t("home.searchPlaceholder")}
                    className="w-full outline-none text-[14px]"
                    style={{ color: PRIMARY }}
                  />
                  <button
                    className="px-4 py-2 rounded-[10px] text-white font-bold text-[12px]"
                    style={{ background: PRIMARY }}
                    onClick={() => goSearch(q ? { q } : {})}
                  >
                    {t("home.searchButton")}
                  </button>
                </div>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="relative w-fit mx-auto">
              <DriveImg
                url={heroDorm?.cover_image_url}
                alt={heroDorm?.name || t("home.dorm.alt")}
                className="w-[420px] h-[465px] object-cover rounded-[20px]"
                style={{ cursor: heroDorm ? "pointer" : "default" }}
                onClick={() => heroDorm && goDormDetail(heroDorm)}
              />

              <button
                type="button"
                onClick={() => heroDorm && goDormDetail(heroDorm)}
                className="absolute inset-0 rounded-[20px]"
                style={{ background: "transparent" }}
                aria-label="open-hero-dorm"
              />

              <div className="absolute right-[-14px] top-[-14px] rounded-[10px] px-4 py-3 text-white" style={{ background: PRIMARY }}>
                <div className="flex items-center gap-4">
                  <div className="w-[35px] h-[35px] rounded-full border border-white flex items-center justify-center">
                    <Star size={18} color="white" />
                  </div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <Star size={14} color="white" />
                      <p className="font-bold text-[14px]">{heroDorm ? heroDorm.avg_rating.toFixed(1) : "-"}</p>
                    </div>
                    <p className="font-bold text-[12px]">{t("home.hero.avgRating")}</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute left-[-14px] bottom-[-14px] rounded-[10px] px-4 py-3 text-white flex items-center gap-3"
                style={{ background: PRIMARY }}
              >
                <div className="w-[35px] h-[35px] rounded-full border border-white flex items-center justify-center">
                  <Users size={18} color="white" />
                </div>
                <p className="font-bold text-[12px] leading-[19px]">
                  {Number.isFinite(heroStudentsLiving) ? heroStudentsLiving.toLocaleString(numberLocale) : "-"}{" "}
                  {t("home.hero.studentsLivingLine1")}
                  <br />
                  {t("home.hero.studentsLivingLine2")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="w-full">
        <div className="mx-auto w-full max-w-[1190px] px-6">
          <div className="flex flex-col items-center">
            <div className="w-full grid grid-cols-1 md:grid-cols-3 text-center gap-10 py-10">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-bold text-[24px] leading-[32px]" style={{ color: PRIMARY }}>
                    {s.num}
                  </p>
                  <p className="text-[20px] leading-[26px]" style={{ color: PRIMARY }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="w-full border-t" style={{ borderColor: "#D9D9D9" }} />
          </div>
        </div>
      </section>

      {/* DORMS BY ZONE */}
      <section className="mx-auto w-full max-w-[1190px] px-6 pt-14 pb-16">
        <div className="flex flex-col gap-[88px]">
          {loadingDorms && (
            <div className="rounded-[20px] p-6" style={{ border: `1px dashed ${PRIMARY}` }}>
              <p style={{ color: PRIMARY }} className="font-bold">
                {t("home.loadingDorms")}
              </p>
            </div>
          )}

          {!loadingDorms && dorms.length === 0 && (
            <div className="rounded-[20px] p-6" style={{ border: `1px dashed ${PRIMARY}` }}>
              <p style={{ color: PRIMARY }} className="font-bold">
                {t("home.noDorms")}
              </p>
              <p style={{ color: PRIMARY }} className="text-[14px] mt-1">
                {t("home.noDormsHint")}
              </p>
            </div>
          )}

          {zones.map((zone) => {
            const inZone = dorms.filter((d) => d.zone === zone);
            const show = pickRandom(inZone, 3);

            return (
              <div key={zone} className="flex flex-col gap-[52px]">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[24px] leading-[32px]" style={{ color: PRIMARY }}>
                    {zone}
                  </h2>

                  <button
                    className="flex items-center gap-1 text-[20px] leading-[26px]"
                    style={{ color: PRIMARY }}
                    onClick={() => goSearch({ zone })}
                  >
                    {t("home.all")} <ChevronRight size={20} color={PRIMARY} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {show.map((d) => (
                    <div
                      key={d.id}
                      className="w-full max-w-[380px] h-[370px] rounded-[20px] overflow-hidden bg-white cursor-pointer"
                      style={{ border: `1px solid ${PRIMARY}` }}
                      onClick={() => goDormDetail(d)}
                    >
                      <div className="relative h-[200px] w-full">
                        <DriveImg url={d.cover_image_url} alt={d.name} className="h-full w-full object-cover" />

                        {d.verified && (
                          <span className="absolute left-4 top-4 inline-flex items-center gap-2 px-3 py-1 rounded-[10px] bg-[#42BD41] text-white text-[14px] leading-[19px]">
                            <BadgeCheck size={18} color="white" />
                            {t("home.verified")}
                          </span>
                        )}
                      </div>

                      <div className="px-6 pt-5 pb-6">
                        <h3 className="font-bold text-[20px] leading-[26px]" style={{ color: PRIMARY }}>
                          {d.name}
                        </h3>

                        <div className="mt-3 flex items-center gap-2">
                          <MapPin size={16} color={PRIMARY} />
                          <p className="text-[16px] leading-[21px]" style={{ color: PRIMARY }}>
                            {t("home.distanceFromKmitl", {
                              value: formatDistanceM(d.distance_m, t),
                            })}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[14px] font-bold leading-[19px]" style={{ color: PRIMARY }}>
                            <Star size={16} color={PRIMARY} />
                            {d.avg_rating.toFixed(1)}{" "}
                            {t("home.reviewCount", { value: d.review_count })}
                          </div>

                          <div className="flex items-center gap-2 text-[12px] font-bold leading-[19px]" style={{ color: PRIMARY }}>
                            <BadgeDollarSign size={16} color={PRIMARY} />
                            {t("home.priceRangePerMonth", {
                              min: formatMoney(d.price_min, numberLocale),
                              max: formatMoney(d.price_max, numberLocale),
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!loadingDorms && inZone.length === 0 && (
                    <div className="col-span-1 md:col-span-3 rounded-[20px] p-6" style={{ border: `1px dashed ${PRIMARY}` }}>
                      <p style={{ color: PRIMARY }} className="font-bold">
                        {t("home.zoneNoData", { zone })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex justify-center pt-2">
            <button
              className="w-[300px] h-[60px] rounded-[20px] text-white font-bold text-[18px] leading-[24px]"
              style={{ background: PRIMARY }}
              onClick={() => goSearch()}
            >
              {t("home.seeAllDorms")}
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="w-full" style={{ background: BLUE }}>
        <div className="mx-auto w-full max-w-[1296px] px-[72px] py-[50px]">
          <div className="flex flex-col items-center gap-[42px]">
            <div className="text-center">
              <h2 className="text-white font-bold text-[30px] leading-[40px]">{t("home.categoryTitle")}</h2>
              <p className="text-white text-[20px] leading-[32px] mt-2">{t("home.categorySubtitle")}</p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8">
              {categories.map((c) => (
                <div key={c.key} className="w-full h-[400px] rounded-[30px] bg-white px-5 py-6 flex flex-col items-center">
                  <div className="w-[65px] h-[65px] rounded-full flex items-center justify-center" style={{ background: PRIMARY }}>
                    {c.icon}
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-black font-bold text-[16px] leading-[25px]">{c.title}</p>
                    <p className="text-black text-[12px] leading-[19px] mt-1">{c.subtitle}</p>
                  </div>

                  <div className="mt-8 w-[170px] flex flex-col gap-5">
                    {c.pills.map((p) => (
                      <button
                        key={p.label}
                        className="h-[30px] w-full rounded-full text-white text-[14px] leading-[22px] flex items-center justify-center gap-2"
                        style={{ background: PRIMARY }}
                        onClick={() => goSearch(p.params)}
                      >
                        {p.isMoney ? <span>{t("home.bahtPrefix", { value: p.label })}</span> : <span>{p.label}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEW */}
      <section className="w-full" style={{ background: REVIEW_BG }}>
        <div className="mx-auto w-full max-w-[1204px] px-[72px] py-[50px] mt-20">
          <div className="flex flex-col items-center gap-12">
            <div className="text-center">
              <h2 className="text-white font-bold text-[32px] leading-[42px]">{t("home.reviewTitle")}</h2>
              <p className="text-white text-[20px] leading-[32px] mt-2">{t("home.reviewSubtitle")}</p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
              {!reviews.length && (
                <div className="col-span-1 md:col-span-3 rounded-[30px] bg-white px-[28px] py-6">
                  <p className="text-black font-bold text-[16px]">{t("home.noReviews")}</p>
                  <p className="text-black text-[14px] mt-2">{t("home.noReviewsHint")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}