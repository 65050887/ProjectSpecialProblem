// client/src/components/review/ReviewPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Star,
  ChevronsLeft,
  ChevronsRight,
  CalendarDays,
  BadgeCheck,
  ThumbsUp,
  X,
} from "lucide-react";
import WriteReviewModal from "./WriteReviewModal";

const ORANGE = "#F16323";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function pickAny(obj, paths = []) {
  for (const p of paths) {
    const parts = String(p).split(".");
    let cur = obj;
    for (const k of parts) cur = cur?.[k];
    if (cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return null;
}

function formatDateTH(input) {
  if (!input) return "-";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const yearBE = d.getFullYear() + 543;
  return `${day} ${month} ${yearBE}`;
}

function StarsRow({ value = 0 }) {
  const v = Number(value) || 0;
  const full = Math.round(v);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-[18px] w-[18px] text-white", i < full ? "fill-white" : "")}
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

function ReviewCard({ r }) {
  const userName =
    pickAny(r, ["user.username", "user.name", "username", "reviewer_name", "name"]) || "Anonymous";
  const createdAt = pickAny(r, ["created_at", "createdAt", "date"]);
  const rating = Number(pickAny(r, ["rating", "stars", "score"])) || 0;

  // verify: ถ้ายังไม่มี field จริง จะไม่โชว์ (ไม่เดา)
  const verifiedRaw = pickAny(r, ["user.verified", "verified", "is_verified"]);
  const verified =
    verifiedRaw === true ||
    verifiedRaw === 1 ||
    String(verifiedRaw || "").toLowerCase() === "true" ||
    String(verifiedRaw || "") === "1";

  const comment = pickAny(r, ["comment", "content", "text"]) || "-";

  // ถ้ายังไม่มี pros/cons จริง ก็จะเป็น —
  const prosRaw = pickAny(r, ["advantages", "pros"]);
  const consRaw = pickAny(r, ["disadvantages", "cons"]);
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

  const likeCount = Number(pickAny(r, ["like_count"])) || 0;

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
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-[18px] w-[18px] text-yellow-400",
                    i < Math.round(rating) ? "fill-yellow-400" : ""
                  )}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 whitespace-pre-wrap text-[14px] leading-6 text-black/80">{comment}</div>

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
            <div className="inline-flex items-center gap-2 text-[14px] font-bold text-black/70">
              <ThumbsUp className="h-5 w-5" />
              Like ({likeCount})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** อ่าน token แบบรองรับ localStorage หลายรูปแบบ */
function getTokenSmart() {
  try {
    const direct = localStorage.getItem("token");
    if (direct) return direct;

    const raw = localStorage.getItem("ecom-storage");
    if (!raw) return "";
    const obj = JSON.parse(raw);
    // redux-persist มักจะเป็น string ซ้อนใน state
    const stateRaw = obj?.state ? (typeof obj.state === "string" ? JSON.parse(obj.state) : obj.state) : obj;
    return stateRaw?.user?.token || stateRaw?.token || "";
  } catch {
    return "";
  }
}

export default function ReviewPanel({
  dormId,
  apiBase, // เช่น "http://localhost:5000/api"
  pageSize = 2,
  onCountChange, // optional: ส่งจำนวนรีวิวกลับไปอัปเดต badge ที่แท็บ
}) {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [data, setData] = useState({ summary: null, reviews: [] });

  const [page, setPage] = useState(1);

  // modal state
  const [writeOpen, setWriteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const reviewsAll = Array.isArray(data?.reviews) ? data.reviews : [];
  const total = reviewsAll.length;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const reviewsPage = useMemo(() => {
    const start = (page - 1) * pageSize;
    return reviewsAll.slice(start, start + pageSize);
  }, [reviewsAll, page, pageSize]);

  const summary = data?.summary || null;
  const avg = Number(summary?.avg_rating ?? 0);
  const stars = summary?.stars || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setErrMsg("");
      const resp = await fetch(`${apiBase}/dorm/${dormId}/reviews`);
      const json = await resp.json().catch(() => null);

      if (!resp.ok) throw new Error(json?.message || "Fetch reviews failed");

      setData({
        summary: json?.summary || null,
        reviews: json?.reviews || [],
      });

      // reset page
      setPage(1);

      // ส่ง count กลับไปให้ parent ถ้าต้องการ
      if (typeof onCountChange === "function") {
        onCountChange(Number(json?.summary?.review_count ?? (json?.reviews || []).length ?? 0));
      }
    } catch (e) {
      setData({ summary: null, reviews: [] });
      setErrMsg(e?.message || "Reviews not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dormId) return;
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dormId, apiBase]);

  const submitReview = async ({ rating, comment }) => {
    try {
      setSubmitting(true);
      setSubmitErr("");

      const token = getTokenSmart();
      if (!token) {
        setSubmitErr("กรุณา Login ก่อน (ไม่พบ token ใน localStorage)");
        return;
      }

      const resp = await fetch(`${apiBase}/dorm/${dormId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const json = await resp.json().catch(() => null);

      if (!resp.ok) {
        throw new Error(json?.message || "Create review failed");
      }

      // success: ปิด modal แล้ว refresh list
      setWriteOpen(false);
      await fetchReviews();
    } catch (e) {
      setSubmitErr(e?.message || "Failed to create review");
    } finally {
      setSubmitting(false);
    }
  };

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

      {/* Summary */}
      <div className="mt-8 rounded-[18px] bg-white/10 p-6">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center justify-center text-white">
            <div className="text-[48px] font-extrabold leading-none">{avg.toFixed(1)}</div>
            <div className="mt-3">
              <StarsRow value={avg} />
            </div>
            <div className="mt-3 text-[12px] text-white/90">From {total} reviews</div>
          </div>

          <div className="space-y-3">
            <RatingBar star={5} count={stars[5] || 0} total={total} />
            <RatingBar star={4} count={stars[4] || 0} total={total} />
            <RatingBar star={3} count={stars[3] || 0} total={total} />
            <RatingBar star={2} count={stars[2] || 0} total={total} />
            <RatingBar star={1} count={stars[1] || 0} total={total} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-8 border-t border-white/30 pt-8">
        <div className="mb-4 flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Star className="h-5 w-5 fill-white text-white" />
            </span>
            <div className="text-[18px] font-extrabold">Review</div>
          </div>

          <button
            type="button"
            onClick={() => setWriteOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-extrabold text-[#F16323] hover:opacity-95"
          >
            <Star className="h-4 w-4 fill-[#F16323] text-[#F16323]" />
            Write Review
          </button>
        </div>

        {errMsg ? (
          <div className="rounded-2xl bg-white p-6 text-center text-[14px] font-bold text-[#F16323]">
            {errMsg}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-center text-[14px] font-bold text-[#F16323]">
            Loading reviews...
          </div>
        ) : !errMsg && total === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-[14px] font-bold text-[#F16323]">
            ยังไม่มีรีวิวของหอนี้
          </div>
        ) : null}

        <div className="space-y-5">
          {reviewsPage.map((r, idx) => (
            <ReviewCard key={String(r?.review_id || r?.id || idx)} r={r} />
          ))}
        </div>

        {/* Pager */}
        <div className="mt-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={cn(
              "inline-flex items-center gap-3 text-[14px] font-bold text-white/90 hover:text-white",
              page <= 1 ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            <ChevronsLeft className="h-5 w-5" />
            Previous
          </button>

          <div className="text-[12px] font-extrabold text-white/90">
            Page {page}/{totalPages}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      <WriteReviewModal
        open={writeOpen}
        onClose={() => {
          if (!submitting) setWriteOpen(false);
        }}
        onSubmit={submitReview}
        submitting={submitting}
        serverError={submitErr}
      />
    </div>
  );
}
