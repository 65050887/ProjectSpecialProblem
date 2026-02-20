// client/src/pages/user/DormDetailUser.jsx
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
  ThumbsUp,
  BadgeCheck,
} from "lucide-react";
import ReviewPanel from "../../components/review/ReviewPanel";
import ContactPanel from "../../components/contact/ContactPanel";


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
  const list = Array.isArray(imgs) ? imgs.map((x) => x?.image_url || x?.url || x).filter(Boolean) : [];
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
        active ? "bg-[#F16323] text-white border-[#F16323]" : "bg-white text-[#F16323] border-[#F16323] hover:bg-[#F16323]/10"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-white" : "text-[#F16323]")} />
      <span className="whitespace-nowrap">{children}</span>
      {rightText ? (
        <span className={cn("font-bold", active ? "text-white/90" : "text-[#F16323]/80")}>{rightText}</span>
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

/** ✅ helpers: ดึงค่าจากหลาย field / หลาย object */
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

/** ---------- date TH (พ.ศ.) ---------- */
function formatDateTH(input) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const yearBE = d.getFullYear() + 543;
  return `${day} ${month} ${yearBE}`;
}

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
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

  const FALLBACK = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

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

/** ✅ Travel UI ตามรูป */
function TravelCard({ icon, title, subtitle, minutesText, costText }) {
  return (
    <div className="rounded-[22px] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,0.10)]">
      <div className="mx-auto flex h-[62px] w-[62px] items-center justify-center rounded-[14px] bg-[#F16323]">{icon}</div>

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

/** ===================== REVIEW UI (เหมือนรูป + ข้อมูลจริง) ===================== */
function StarsRow({ value = 0, size = 18, filledClass = "fill-white", strokeClass = "text-white" }) {
  const v = Number(value) || 0;
  const full = Math.round(v);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-[18px] w-[18px]", strokeClass, i < full ? filledClass : "")}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? clamp01(count / total) : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="flex w-[46px] items-center justify-end gap-1 text-white">
        <span className="font-extrabold">{star}</span>
        <Star className="h-4 w-4 fill-white text-white" />
      </div>

      <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/30">
        <div className="h-full rounded-full bg-yellow-300" style={{ width: `${pct * 100}%` }} />
      </div>

      <div className="w-[28px] text-right font-extrabold text-white">{count}</div>
    </div>
  );
}

function TagPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#F16323] px-4 py-1 text-[12px] font-extrabold text-white">
      {children}
    </span>
  );
}

function ReviewCard({ r, onLike }) {
  const userName =
    pickAny(r, ["user.name", "user.full_name", "user.username", "username", "reviewer_name", "name"]) || "Anonymous";
  const createdAt = pickAny(r, ["created_at", "createdAt", "date", "review_date"]);
  const rating = Number(pickAny(r, ["rating", "stars", "score"])) || 0;

  const verifiedRaw = pickAny(r, ["is_verified", "verified", "user_verified", "user.is_verified", "user.verified"]);
  const verified =
    verifiedRaw === true || verifiedRaw === 1 || String(verifiedRaw || "").toLowerCase() === "true" || String(verifiedRaw || "") === "1";

  const comment =
    pickAny(r, ["comment", "content", "review_text", "text", "message", "description"]) || "-";

  // advantages/disadvantages: รองรับหลายรูปแบบ
  const prosRaw = pickAny(r, ["advantages", "pros", "good_points", "tags_pros", "pros_list"]);
  const consRaw = pickAny(r, ["disadvantages", "cons", "bad_points", "tags_cons", "cons_list"]);
  const pros = Array.isArray(prosRaw)
    ? prosRaw.filter(Boolean)
    : typeof prosRaw === "string"
    ? prosRaw.split(/,|;|\n|\r/g).map((x) => x.trim()).filter(Boolean)
    : [];
  const cons = Array.isArray(consRaw)
    ? consRaw.filter(Boolean)
    : typeof consRaw === "string"
    ? consRaw.split(/,|;|\n|\r/g).map((x) => x.trim()).filter(Boolean)
    : [];

  const likeCount = Number(pickAny(r, ["like_count", "likes", "like", "thumbs_up"])) || 0;

  return (
    <div className="rounded-[18px] bg-white p-6 shadow-[0_10px_22px_rgba(0,0,0,0.10)]">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-black/10" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="truncate text-[16px] font-extrabold text-black">{userName}</div>

                {verified && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-500 px-3 py-1 text-[12px] font-extrabold text-white">
                    <BadgeCheck className="h-4 w-4" />
                    verify
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2 text-[12px] text-black/60">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDateTH(createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StarsRow value={rating} size={18} filledClass="fill-yellow-400" strokeClass="text-yellow-400" />
            </div>
          </div>

          <div className="mt-4 text-[14px] leading-6 text-black/80 whitespace-pre-wrap">{comment}</div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <div className="text-[14px] font-extrabold text-black">Advantages</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {pros.length ? pros.map((t, i) => <TagPill key={i}>{t}</TagPill>) : <div className="text-[12px] text-black/40">—</div>}
              </div>
            </div>

            <div>
              <div className="text-[14px] font-extrabold text-black">Disadvantages</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {cons.length ? cons.map((t, i) => <TagPill key={i}>{t}</TagPill>) : <div className="text-[12px] text-black/40">—</div>}
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-black/10 pt-4">
            <button
              type="button"
              onClick={onLike}
              className="inline-flex items-center gap-2 text-[14px] font-bold text-black/70 hover:text-black"
              title="Like"
            >
              <ThumbsUp className="h-5 w-5" />
              Like ({likeCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewTab({ dorm, reviews, loading, onPrev, onNext, page, totalPages, onOpenWrite }) {
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const total = safeReviews.length;

  const avgDorm = Number(dorm?.avg_rating ?? dorm?.rating ?? 0);
  const avg =
    total > 0
      ? safeReviews.reduce((s, r) => s + (Number(pickAny(r, ["rating", "stars", "score"])) || 0), 0) / total
      : avgDorm;

  const counts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of safeReviews) {
      const v = Math.round(Number(pickAny(r, ["rating", "stars", "score"])) || 0);
      if (v >= 1 && v <= 5) c[v] += 1;
    }
    return c;
  }, [safeReviews]);

  return (
    <div className="mt-6 rounded-[18px] bg-[#F16323] p-8">
      <div className="flex items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-3">
          <Star className="h-6 w-6 fill-white text-white" />
          <div className="text-[20px] font-extrabold">Review & Comments</div>
        </div>

        <div className="rounded-full bg-white px-4 py-2 text-[12px] font-extrabold text-[#F16323]">
          {total} Reviews
        </div>
      </div>

      <div className="mt-8 rounded-[18px] bg-white/10 p-6">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center justify-center text-white">
            <div className="text-[48px] font-extrabold leading-none">{Number(avg || 0).toFixed(1)}</div>
            <div className="mt-3">
              <StarsRow value={avg} size={22} filledClass="fill-white" strokeClass="text-white" />
            </div>
            <div className="mt-3 text-[12px] text-white/90">From {total} reviews</div>
          </div>

          <div className="space-y-3">
            <RatingBar star={5} count={counts[5]} total={total} />
            <RatingBar star={4} count={counts[4]} total={total} />
            <RatingBar star={3} count={counts[3]} total={total} />
            <RatingBar star={2} count={counts[2]} total={total} />
            <RatingBar star={1} count={counts[1]} total={total} />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-white/30 pt-8">
        <div className="mb-4 flex items-center gap-3 text-white">
          <MessageCircleIcon />
          <div className="text-[18px] font-extrabold">Review</div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-center text-[14px] font-bold text-[#F16323]">Loading reviews...</div>
        ) : total === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-[14px] font-bold text-[#F16323]">
            ยังไม่มีรีวิวของหอนี้
          </div>
        ) : null}

        <div className="space-y-5">
          {safeReviews.map((r, idx) => (
            <ReviewCard key={String(pickAny(r, ["review_id", "id"])) || idx} r={r} onLike={() => {}} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <button
            type="button"
            onClick={onPrev}
            disabled={page <= 1}
            className={cn(
              "inline-flex items-center gap-3 text-[14px] font-bold text-white/90 hover:text-white",
              page <= 1 ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            <ChevronsLeft className="h-5 w-5" />
            Previous
          </button>

          <button
            type="button"
            onClick={onOpenWrite}
            className="inline-flex h-14 w-full max-w-[420px] items-center justify-center gap-3 rounded-full bg-yellow-300 px-10 text-[16px] font-extrabold text-white shadow hover:opacity-95"
          >
            <Star className="h-5 w-5 fill-white text-white" />
            Write Review
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={page >= totalPages}
            className={cn(
              "inline-flex items-center gap-3 text-[14px] font-bold text-white/90 hover:text-white",
              page >= totalPages ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            Next
            <ChevronsRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// icon helper (lucide ไม่มีใน import ด้านบน)
function MessageCircleIcon() {
  // ใช้ Star แทน icon review แบบเรียบ ๆ
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
      <Star className="h-5 w-5 fill-white text-white" />
    </span>
  );
}

/** ===================== MAIN ===================== */
export default function DormDetailUser() {
  const params = useParams();
  const dormId = params?.dormId ?? params?.id;

  const navigate = useNavigate();
  const [sp] = useSearchParams();

  // ✅ ใช้ base แบบเดียวกับ SearchUser/HomeUser: ถ้า VITE_API_URL มี /api ให้ strip ออก
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

  // ✅ Reviews state
  const [reviewsAll, setReviewsAll] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsErr, setReviewsErr] = useState("");

  const PAGE_SIZE = 2; // ให้เหมือนรูป (โชว์ 2 ใบต่อหน้า)
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = (sp.get("tab") || "").toLowerCase();
    if (["details", "travel", "review", "contact"].includes(t)) setTab(t);
  }, [sp]);

  // dorm detail
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

  // ✅ ราคา
  const minPrice = dorm?.min_price_per_month ?? dorm?.minPrice ?? dorm?.price_min ?? dorm?.priceMin ?? null;
  const maxPrice = dorm?.max_price_per_month ?? dorm?.maxPrice ?? dorm?.price_max ?? dorm?.priceMax ?? null;

  const priceText =
    minPrice == null && maxPrice == null
      ? "-"
      : minPrice != null && maxPrice != null && minPrice !== maxPrice
      ? `฿ ${formatMoney(minPrice)} - ${formatMoney(maxPrice)} / Month`
      : `฿ ${formatMoney(minPrice ?? maxPrice)} / Month`;

  // ✅ ระยะทาง
  const distanceM = dorm?.distance_m ?? null;
  const distanceText =
    distanceM == null ? "-" : distanceM < 1000 ? `Within ${distanceM} m` : `Within ${(distanceM / 1000).toFixed(1)} km`;

  /** ✅ Fees/Deposit */
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

  /** ✅ fetch reviews (ข้อมูลจริง) */
  useEffect(() => {
    if (!dormId) return;

    const controller = new AbortController();

    const fetchTry = async (url) => {
      const resp = await fetch(url, { signal: controller.signal });
      const json = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(json?.message || "Fetch reviews failed");
      return json;
    };

    const run = async () => {
      try {
        setReviewsLoading(true);
        setReviewsErr("");

        // reset pagination when dorm changes
        setPage(1);

        // ✅ รองรับหลาย endpoint เผื่อ backend ตั้งชื่อไม่ตรงกัน
        const endpoints = [
          `${API}/dorm/${dormId}/reviews`,
          `${API}/review/dorm/${dormId}`,
          `${API}/reviews?dormId=${encodeURIComponent(dormId)}`,
        ];

        let json = null;
        let lastErr = null;

        for (const url of endpoints) {
          try {
            json = await fetchTry(url);
            break;
          } catch (e) {
            lastErr = e;
          }
        }

        if (!json) throw lastErr || new Error("No reviews endpoint matched");

        // ✅ map รูปแบบ response
        const arr =
          json?.reviews ||
          json?.data ||
          json?.items ||
          json?.result ||
          json?.dorm_reviews ||
          [];

        const list = Array.isArray(arr) ? arr : [];

        // ถ้า dorm detail ส่ง reviews มาด้วย ก็ merge/เลือกได้
        const fallbackFromDorm = Array.isArray(dorm?.reviews_list || dorm?.reviews) ? (dorm?.reviews_list || dorm?.reviews) : [];
        const finalList = list.length ? list : fallbackFromDorm;

        setReviewsAll(finalList);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setReviewsAll([]);
        setReviewsErr("Reviews not found / API endpoint not match");
      } finally {
        setReviewsLoading(false);
      }
    };

    run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API, dormId]);

  const totalReviewsCount = useMemo(() => {
    const a = Array.isArray(reviewsAll) ? reviewsAll.length : 0;
    const fromDorm = Number(dorm?.review_count ?? dorm?.reviews ?? 0);
    return a || fromDorm || 0;
  }, [reviewsAll, dorm]);

  const totalPages = useMemo(() => {
    const t = Math.max(1, Math.ceil((reviewsAll?.length || 0) / PAGE_SIZE));
    return t;
  }, [reviewsAll, PAGE_SIZE]);

  const reviewsPage = useMemo(() => {
    const list = Array.isArray(reviewsAll) ? reviewsAll : [];
    const start = (page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }, [reviewsAll, page]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
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
          {/* Header */}
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

          {/* Tabs */}
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
              rightText={`(${totalReviewsCount})`}
            >
              Review
            </TabButton>

            <TabButton active={tab === "contact"} icon={Phone} onClick={() => setTab("contact")}>
              Contact
            </TabButton>
          </div>

          {/* Loading / Error */}
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

          {/* CONTENT */}
          {!loading && !errMsg && dorm && (
            <>
              {/* ✅ Travel Tab */}
              {tab === "travel" && <TravelTab />}

              {/* ✅ Review Tab (ตามรูป + ข้อมูลจริง) */}
              {tab === "review" && (
                <ReviewPanel
                    dormId={dormId}
                    apiBase={API}     // API ในไฟล์เธอคือ `${API_BASE}/api`
                    pageSize={2}      // ให้เหมือนรูป
                    onCountChange={() => {}}
                />
                )}


              {/* ✅ Contact placeholder */}
              {tab === "contact" && <ContactPanel dorm={dorm} />}

              {/* ✅ Details Tab */}
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

                  {/* FEES */}
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

      {/* overlay click close */}
      <button className="fixed inset-0 -z-10 cursor-default" aria-label="overlay" onClick={() => navigate(-1)} type="button" />
    </div>
  );
}