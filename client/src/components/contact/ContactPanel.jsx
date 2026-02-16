// client/src/components/contact/ContactPanel.jsx
import React, { useMemo, useState } from "react";
import { Phone, Mail, MapPin, Copy, Check, MessageCircle } from "lucide-react";

const ORANGE = "#F16323";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function pickAny(obj, paths = []) {
  for (const p of paths) {
    const parts = String(p).split(".");
    let cur = obj;
    for (const k of parts) cur = cur?.[k];
    if (cur !== undefined && cur !== null && String(cur).trim() !== "") return cur;
  }
  return null;
}

function normalizePhones(dorm) {
  // รองรับหลายรูปแบบที่ backend อาจส่งมา
  const p1 = pickAny(dorm, ["contacts.0.phone", "phone_1", "phone1", "phone"]);
  const p2 = pickAny(dorm, ["contacts.1.phone", "phone_2", "phone2"]);
  const list = [p1, p2].filter(Boolean).map((x) => String(x).trim());
  // unique
  return Array.from(new Set(list));
}

function buildAddress(dorm) {
  return (
    pickAny(dorm, ["address_th", "address", "address_en"]) ||
    [pickAny(dorm, ["district_th", "district"]), pickAny(dorm, ["province_th", "province"])]
      .filter(Boolean)
      .join(" ") ||
    "-"
  );
}

function copyText(text, onDone) {
  const t = String(text || "").trim();
  if (!t) return;
  // modern
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(t).then(() => onDone?.(), () => {});
    return;
  }
  // fallback
  try {
    const el = document.createElement("textarea");
    el.value = t;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    onDone?.();
  } catch {}
}

function Row({ icon: Icon, label, value, onCopy, copied }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white">
        <Icon className="h-6 w-6" style={{ color: ORANGE }} />
      </div>

      <div className="min-w-0 flex-1 pt-1">
        <div className="text-[16px] font-extrabold text-white">{label} :</div>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <div className="text-[16px] text-white break-words">{value || "-"}</div>

          {value ? (
            <button
              type="button"
              onClick={onCopy}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 transition",
                copied ? "ring-2 ring-white/70" : ""
              )}
              title="Copy"
              aria-label="copy"
            >
              {copied ? <Check className="h-5 w-5 text-white" /> : <Copy className="h-5 w-5 text-white" />}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ContactPanel({ dorm }) {
  const phones = useMemo(() => normalizePhones(dorm), [dorm]);

  const email = pickAny(dorm, ["contacts.0.email", "email"]);
  const lineId = pickAny(dorm, ["contacts.0.line_id", "line_id", "lineId"]);
  const address = buildAddress(dorm);

  // tiny “copied” state ต่อแถว
  const [copiedKey, setCopiedKey] = useState("");

  const doCopy = (key, text) => {
    copyText(text, () => {
      setCopiedKey(key);
      window.clearTimeout(window.__dc_copied_contact);
      window.__dc_copied_contact = window.setTimeout(() => setCopiedKey(""), 900);
    });
  };

  return (
    <div className="mt-6 space-y-8">
      {/* CONTACT CARD */}
      <div className="rounded-[18px] bg-[#F16323] p-8">
        <div className="flex items-center gap-4 text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <Phone className="h-5 w-5 text-white" />
          </span>
          <div className="text-[22px] font-extrabold">Contact</div>
        </div>

        <div className="mt-8 space-y-7">
          {/* Tel: แสดงได้หลายเบอร์ (ตามรูปมี 2 บรรทัด) */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white">
              <Phone className="h-6 w-6" style={{ color: ORANGE }} />
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <div className="text-[16px] font-extrabold text-white">Tel :</div>

              <div className="mt-1 space-y-2">
                {phones.length ? (
                  phones.map((p, idx) => (
                    <div key={idx} className="flex flex-wrap items-center gap-3">
                      <div className="text-[16px] text-white">{p}</div>
                      <button
                        type="button"
                        onClick={() => doCopy(`tel-${idx}`, p)}
                        className={cn(
                          "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 transition",
                          copiedKey === `tel-${idx}` ? "ring-2 ring-white/70" : ""
                        )}
                        title="Copy"
                        aria-label="copy tel"
                      >
                        {copiedKey === `tel-${idx}` ? (
                          <Check className="h-5 w-5 text-white" />
                        ) : (
                          <Copy className="h-5 w-5 text-white" />
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-[16px] text-white">-</div>
                )}
              </div>
            </div>
          </div>

          <Row
            icon={Mail}
            label="Email"
            value={email}
            copied={copiedKey === "email"}
            onCopy={() => doCopy("email", email)}
          />

          <Row
            icon={MessageCircle}
            label="Line"
            value={lineId ? `@${String(lineId).replace(/^@/, "")}` : ""}
            copied={copiedKey === "line"}
            onCopy={() => doCopy("line", lineId ? `@${String(lineId).replace(/^@/, "")}` : "")}
          />

          <Row
            icon={MapPin}
            label="Address"
            value={address}
            copied={copiedKey === "addr"}
            onCopy={() => doCopy("addr", address)}
          />
        </div>
      </div>

      {/* ✅ ลบ Booking for Visiting ทิ้งตามที่ต้องการ -> ไม่ใส่อะไรเพิ่ม */}
    </div>
  );
}
