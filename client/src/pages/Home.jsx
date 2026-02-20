// client/src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
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
function formatMoney(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("th-TH");
}

function formatDistanceM(m) {
  const num = Number(m);
  if (!Number.isFinite(num)) return "-";
  if (num >= 1000) return `${(num / 1000).toFixed(1)} km`;
  return `${Math.round(num)} m`;
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
  const a = Array.isArray(arr) ? [...arr] : [];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
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

  // ✅ Home ใช้ base แบบไม่มี /api เพื่อเรียก /api/dorm/search
  const API_BASE =
    import.meta?.env?.VITE_API_URL?.replace(/\/?api\/?$/i, "") ||
    import.meta?.env?.VITE_API_BASE_URL ||
    "http://localhost:5000";

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
            name: d?.dorm_name_th || d?.dorm_name_en || "-",
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
  }, [API_BASE]);

  const zones = useMemo(() => {
    const order = ["Chalongkrung 1", "FBT", "Nikom", "Jinda"];
    const set = new Set(dorms.map((d) => d.zone).filter(Boolean));
    return order.filter((z) => set.has(z));
  }, [dorms]);

  const heroDorm = useMemo(() => {
    if (!dorms?.length) return null;
    return dorms[Math.floor(Math.random() * dorms.length)];
  }, [dorms]);

  const heroStudentsLiving = useMemo(() => {
    if (!heroDorm) return null;
    // ถ้ามี total/available คำนวณได้ -> ใช้เลย
    if (Number.isFinite(Number(heroDorm.students_living))) return Number(heroDorm.students_living);
    // fallback: ถ้ามี total_rooms อย่างเดียว ก็โชว์ total_rooms แทน (ยังดีกว่า 0)
    if (Number.isFinite(Number(heroDorm.total_rooms))) return Number(heroDorm.total_rooms);
    return null;
  }, [heroDorm]);

  const stats = useMemo(() => {
    const totalDormitoryNum = Number.isFinite(totalDorms) ? totalDorms : dorms.length;
    const totalRooms = dorms.reduce((s, d) => s + (Number(d.total_rooms) || 0), 0);
    const totalCapacity = "-"; // ยังไม่มี field capacity

    return [
      {
        num: totalDormitoryNum ? totalDormitoryNum.toLocaleString("th-TH") : "-",
        label: "Total Dormitory",
      },
      { num: totalCapacity, label: "Total Capacity" },
      { num: totalRooms ? totalRooms.toLocaleString("th-TH") : "-", label: "Total Rooms" },
    ];
  }, [dorms, totalDorms]);

  // ✅ ปุ่ม category จะส่ง query ไปให้ Search.jsx อ่าน
  const categories = [
    {
      title: "Location",
      subtitle: "Find follow location from KMITL",
      icon: <MapPin size={26} color="white" />,
      pills: [
        { label: "Radius 500 m", params: { distanceMax: 500 } },
        { label: "Radius 1 km", params: { distanceMax: 1000 } },
        { label: "Radius 2 km", params: { distanceMax: 2000 } },
      ],
    },
    {
      title: "Prices",
      subtitle: "Select the right price",
      icon: <BadgeDollarSign size={26} color="white" />,
      pills: [
        { label: "2800 - 3500", params: { priceMin: 2800, priceMax: 3500 } },
        { label: "4000 - 5500", params: { priceMin: 4000, priceMax: 5500 } },
        { label: "6000 up", params: { priceMin: 6000 } },
      ],
    },
    {
      title: "Facilities",
      subtitle: "Find follow facilities",
      icon: <ShieldCheck size={26} color="white" />,
      pills: [
        { label: "Pet Friendly", params: { petFriendly: 1 } },
        { label: "Key card", params: { amenities: "key card" } },
        { label: "Gym", params: { amenities: "gym" } },
      ],
    },
    {
      title: "Dormitory Type",
      subtitle: "Find follow dorm type",
      icon: <Users size={26} color="white" />,
      pills: [
        { label: "Only Male", params: { dormitoryType: "male" } },
        { label: "Only Females", params: { dormitoryType: "female" } },
        { label: "Co-Ed", params: { dormitoryType: "mix" } },
      ],
    },
  ];

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
                Find Your Dormitory Away From Home
              </span>

              <h1 className="font-bold leading-[64px] mb-6" style={{ color: PRIMARY, fontSize: 48 }}>
                Discover Your <br />
                Perfect KMITL <br />
                Dormitory
              </h1>

              <p
                className="max-w-[539px] mb-6 text-[14px] leading-[25px] text-justify"
                style={{ color: PRIMARY }}
              >
                Search through dormitories around KMITL with detailed information, photos, and
                availability. Find the perfect place to call home during your studies.
              </p>

              {/* ค้นหาได้เลย */}
              <div className="mt-4 max-w-[540px]">
                <div
                  className="flex items-center gap-3 rounded-[12px] px-4 py-3"
                  style={{ border: `1px solid ${PRIMARY}` }}
                >
                  <SearchIcon size={18} color={PRIMARY} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") goSearch(q ? { q } : {});
                    }}
                    placeholder="พิมพ์ชื่อหอ / โซน…"
                    className="w-full outline-none text-[14px]"
                    style={{ color: PRIMARY }}
                  />
                  <button
                    className="px-4 py-2 rounded-[10px] text-white font-bold text-[12px]"
                    style={{ background: PRIMARY }}
                    onClick={() => goSearch(q ? { q } : {})}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* HERO IMAGE */}
            <div className="relative w-fit mx-auto">
              <DriveImg
                url={heroDorm?.cover_image_url}
                alt={heroDorm?.name || "Dormitory"}
                className="w-[420px] h-[465px] object-cover rounded-[20px]"
                style={{ cursor: heroDorm ? "pointer" : "default" }}
                onClick={() => heroDorm && goDormDetail(heroDorm)}
              />

              {/* overlay click area */}
              <button
                type="button"
                onClick={() => heroDorm && goDormDetail(heroDorm)}
                className="absolute inset-0 rounded-[20px]"
                style={{ background: "transparent" }}
                aria-label="open-hero-dorm"
              />

              <div
                className="absolute right-[-14px] top-[-14px] rounded-[10px] px-4 py-3 text-white"
                style={{ background: PRIMARY }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-[35px] h-[35px] rounded-full border border-white flex items-center justify-center">
                    <Star size={18} color="white" />
                  </div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <Star size={14} color="white" />
                      <p className="font-bold text-[14px]">
                        {heroDorm ? heroDorm.avg_rating.toFixed(1) : "-"}
                      </p>
                    </div>
                    <p className="font-bold text-[12px]">Average Rating</p>
                  </div>
                </div>
              </div>

              {/* ✅ แก้เป็น Students Living on Dormitory */}
              <div
                className="absolute left-[-14px] bottom-[-14px] rounded-[10px] px-4 py-3 text-white flex items-center gap-3"
                style={{ background: PRIMARY }}
              >
                <div className="w-[35px] h-[35px] rounded-full border border-white flex items-center justify-center">
                  <Users size={18} color="white" />
                </div>
                <p className="font-bold text-[12px] leading-[19px]">
                  {Number.isFinite(heroStudentsLiving) ? heroStudentsLiving.toLocaleString("th-TH") : "-"} Students Living
                  <br /> on Dormitory
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
                กำลังโหลดข้อมูลหอพัก…
              </p>
            </div>
          )}

          {!loadingDorms && dorms.length === 0 && (
            <div className="rounded-[20px] p-6" style={{ border: `1px dashed ${PRIMARY}` }}>
              <p style={{ color: PRIMARY }} className="font-bold">
                ยังไม่พบข้อมูลหอพักจาก API
              </p>
              <p style={{ color: PRIMARY }} className="text-[14px] mt-1">
                เช็คว่า endpoint /api/dorm/search ส่ง dorms[] กลับมาหรือไม่
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
                    All <ChevronRight size={20} color={PRIMARY} />
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
                        <DriveImg
                          url={d.cover_image_url}
                          alt={d.name}
                          className="h-full w-full object-cover"
                        />

                        {d.verified && (
                          <span className="absolute left-4 top-4 inline-flex items-center gap-2 px-3 py-1 rounded-[10px] bg-[#42BD41] text-white text-[14px] leading-[19px]">
                            <BadgeCheck size={18} color="white" />
                            verify
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
                            distance {formatDistanceM(d.distance_m)} from KMITL
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                          <div
                            className="flex items-center gap-2 text-[14px] font-bold leading-[19px]"
                            style={{ color: PRIMARY }}
                          >
                            <Star size={16} color={PRIMARY} />
                            {d.avg_rating.toFixed(1)} ({d.review_count} Review)
                          </div>

                          <div
                            className="flex items-center gap-2 text-[12px] font-bold leading-[19px]"
                            style={{ color: PRIMARY }}
                          >
                            <BadgeDollarSign size={16} color={PRIMARY} />
                            {formatMoney(d.price_min)} - {formatMoney(d.price_max)} / Month
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!loadingDorms && inZone.length === 0 && (
                    <div
                      className="col-span-1 md:col-span-3 rounded-[20px] p-6"
                      style={{ border: `1px dashed ${PRIMARY}` }}
                    >
                      <p style={{ color: PRIMARY }} className="font-bold">
                        โซน {zone} ยังไม่มีข้อมูล
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
              See all Dormitories
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="w-full" style={{ background: BLUE }}>
        <div className="mx-auto w-full max-w-[1296px] px-[72px] py-[50px]">
          <div className="flex flex-col items-center gap-[42px]">
            <div className="text-center">
              <h2 className="text-white font-bold text-[30px] leading-[40px]">Find follow category</h2>
              <p className="text-white text-[20px] leading-[32px] mt-2">
                Choose the search channel that best suits your needs
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8">
              {categories.map((c) => (
                <div
                  key={c.title}
                  className="w-full h-[400px] rounded-[30px] bg-white px-5 py-6 flex flex-col items-center"
                >
                  <div
                    className="w-[65px] h-[65px] rounded-full flex items-center justify-center"
                    style={{ background: PRIMARY }}
                  >
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
                        {c.title === "Prices" ? <span>฿ {p.label}</span> : <span>{p.label}</span>}
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
              <h2 className="text-white font-bold text-[32px] leading-[42px]">Review</h2>
              <p className="text-white text-[20px] leading-[32px] mt-2">
                Experience from student who find dormitory with us
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
              {!reviews.length && (
                <div className="col-span-1 md:col-span-3 rounded-[30px] bg-white px-[28px] py-6">
                  <p className="text-black font-bold text-[16px]">ตอนนี้ยังไม่มีรีวิวจริง ๆ ในระบบ</p>
                  <p className="text-black text-[14px] mt-2">
                    ถ้าคุณเพิ่ม endpoint รีวิว (เช่น /api/reviews หรือ /api/dorm/:id/reviews)
                    เดี๋ยวผมเชื่อมให้ดึงข้อมูลจริงได้เลย
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}