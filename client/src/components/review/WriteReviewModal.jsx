// client/src/components/review/WriteReviewModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { X, Star } from "lucide-react";

const ORANGE = "#F16323";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
              active ? "bg-yellow-300 border-yellow-300" : "bg-white border-[#F16323]/30 hover:bg-[#F16323]/5"
            )}
            aria-label={`rate ${n}`}
          >
            <Star className={cn("h-6 w-6", active ? "fill-white text-white" : "text-[#F16323]")} />
          </button>
        );
      })}
    </div>
  );
}

export default function WriteReviewModal({
  open,
  onClose,
  onSubmit,
  submitting = false,
  serverError = "",
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!open) return;
    setRating(5);
    setComment("");
  }, [open]);

  const canSubmit = useMemo(() => {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5 && comment.trim().length >= 3;
  }, [rating, comment]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-[680px] max-w-[94vw] overflow-hidden rounded-[24px] border-2 border-[#F16323] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between border-b border-[#F16323]/20 px-6 py-5">
          <div className="text-[18px] font-extrabold text-[#F16323]">Write Review</div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
            aria-label="close"
          >
            <X className="h-6 w-6" style={{ color: ORANGE }} />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="text-[14px] font-extrabold text-[#F16323]">Rating</div>
          <div className="mt-3">
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div className="mt-6 text-[14px] font-extrabold text-[#F16323]">Comment</div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={6}
            placeholder="พิมพ์รีวิวของคุณ..."
            className="mt-3 w-full resize-none rounded-[18px] border border-[#F16323]/25 p-4 text-[14px] outline-none focus:border-[#F16323]"
          />

          {serverError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] font-bold text-red-600">
              {serverError}
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-full border border-[#F16323] px-6 text-[14px] font-extrabold text-[#F16323] hover:bg-[#F16323]/10"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => onSubmit({ rating, comment: comment.trim() })}
              disabled={!canSubmit || submitting}
              className={cn(
                "h-11 rounded-full px-8 text-[14px] font-extrabold text-white shadow",
                !canSubmit || submitting ? "bg-[#F16323]/40 cursor-not-allowed" : "bg-[#F16323] hover:opacity-95"
              )}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}