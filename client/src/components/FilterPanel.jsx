// client/src/components/FilterPanel.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Search as SearchIcon,
  BadgeCheck,
  Ruler,
  DollarSign,
  ListChecks,
  Users,
  Wind,
  Fan,
  PawPrint,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ORANGE = "#F16323";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * ✅ Search.jsx ใช้ shape นี้:
 * - priceMin, priceMax (string/number)
 * - distance (string) = km เช่น "0.5", "1", "2"
 * - amenities (array of string)
 * - verifiedOnly (boolean)
 * - hasAir, hasFan (boolean)
 * - gender ("any" | "male" | "female" | "mix")
 * - petFriendly (boolean)
 */
export const DEFAULT_VALUE = {
  q: "",
  zone: "",

  distance: "",

  priceMin: "",
  priceMax: "",

  amenities: [],

  verifiedOnly: false,

  hasAir: false,
  hasFan: false,

  gender: "any",

  petFriendly: false,
};

function asArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return [];
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

export default function FilterPanel({
  zones = [], // optional
  values,
  onChange,
  onClear,
  onApply, // optional (ถ้าหนูอยากให้กด Apply แล้วค่อยคิวรี)
  showCompareHint = false,
}) {
  const { t } = useTranslation(["filter", "common"]);

  const [openBasic, setOpenBasic] = useState(true);
  const [openAdvanced, setOpenAdvanced] = useState(true);

  // ✅ normalize incoming values to the expected shape
  const local = useMemo(() => {
    const v = values || {};
    return {
      q: v.q ?? DEFAULT_VALUE.q,
      zone: v.zone ?? DEFAULT_VALUE.zone,

      distance: v.distance ?? DEFAULT_VALUE.distance,

      priceMin: v.priceMin ?? DEFAULT_VALUE.priceMin,
      priceMax: v.priceMax ?? DEFAULT_VALUE.priceMax,

      amenities: asArray(v.amenities),

      verifiedOnly: Boolean(v.verifiedOnly ?? DEFAULT_VALUE.verifiedOnly),

      hasAir: Boolean(v.hasAir ?? DEFAULT_VALUE.hasAir),
      hasFan: Boolean(v.hasFan ?? DEFAULT_VALUE.hasFan),

      gender: v.gender ?? DEFAULT_VALUE.gender,

      petFriendly: Boolean(v.petFriendly ?? DEFAULT_VALUE.petFriendly),
    };
  }, [values]);

  const [draft, setDraft] = useState(local);
  useEffect(() => setDraft(local), [local]);

  const setField = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  const sync = () => onChange?.(draft);

  const apply = () => {
    // ถ้า Search.jsx ใช้ filter แบบ live (onChange อย่างเดียว) ก็ปล่อยไว้ได้
    onApply?.(draft);
  };

  const clear = () => {
    setDraft(DEFAULT_VALUE);
    onClear?.();
    onChange?.(DEFAULT_VALUE);
  };

  const distanceOptions = useMemo(
    () => [
      { value: "", label: t("distance.any", { ns: "filter" }) },
      { value: "0.5", label: t("distance.r500m", { ns: "filter" }) },
      { value: "1", label: t("distance.r1km", { ns: "filter" }) },
      { value: "2", label: t("distance.r2km", { ns: "filter" }) },
      { value: "3", label: t("distance.r3km", { ns: "filter" }) },
      { value: "5", label: t("distance.r5km", { ns: "filter" }) },
    ],
    [t]
  );

  const genderOptions = useMemo(
    () => [
      { value: "any", label: t("gender.any", { ns: "filter" }) },
      { value: "male", label: t("gender.male", { ns: "filter" }) },
      { value: "female", label: t("gender.female", { ns: "filter" }) },
      { value: "mix", label: t("gender.mix", { ns: "filter" }) },
    ],
    [t]
  );

  // amenities input as "comma separated"
  const amenitiesText = useMemo(() => (draft.amenities || []).join(", "), [draft.amenities]);

  return (
    <aside className="rounded-[20px] bg-white p-4 shadow-sm border border-black/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" style={{ color: ORANGE }} />
          <div className="text-base font-bold" style={{ color: ORANGE }}>
            {t("title", { ns: "filter" })}
          </div>
        </div>

        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold hover:bg-black/5"
          style={{ color: ORANGE }}
        >
          <RotateCcw className="h-4 w-4" />
          {t("common:actions.clear")}
        </button>
      </div>

      {showCompareHint && (
        <div className="mt-3 rounded-2xl px-3 py-3 text-sm border border-black/10 bg-[#F16323]/5">
          {t("compareHint", { ns: "filter" })}
        </div>
      )}

      {/* Search keyword */}
      <div className="mt-4">
        <div className="text-sm font-bold" style={{ color: ORANGE }}>
          {t("searchLabel", { ns: "filter" })}
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-black/10 px-3 py-2">
          <SearchIcon className="h-4 w-4 opacity-70" />
          <input
            value={draft.q}
            onChange={(e) => setField("q", e.target.value)}
            onBlur={() => onChange?.({ ...draft, q: draft.q })}
            placeholder={t("searchPlaceholder", { ns: "filter" })}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* BASIC */}
      <button
        type="button"
        onClick={() => setOpenBasic((s) => !s)}
        className="mt-4 flex w-full items-center justify-between rounded-2xl px-3 py-3 font-bold hover:bg-black/5"
        style={{ color: ORANGE }}
      >
        <span>{t("basic.title", { ns: "filter" })}</span>
        {openBasic ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {openBasic && (
        <div className="mt-2 space-y-4 rounded-2xl border border-black/10 p-3">
          {/* Distance */}
          <div>
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: ORANGE }}>
              <Ruler className="h-4 w-4" />
              {t("distance.title", { ns: "filter" })}
            </div>
            <select
              className="mt-2 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
              value={draft.distance}
              onChange={(e) => {
                setField("distance", e.target.value);
                setTimeout(() => onChange?.({ ...draft, distance: e.target.value }), 0);
              }}
            >
              {distanceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: ORANGE }}>
              <DollarSign className="h-4 w-4" />
              {t("price.title", { ns: "filter" })}
            </div>

            <div className="mt-2 grid grid-cols-2 gap-3">
              <input
                value={draft.priceMin}
                onChange={(e) => setField("priceMin", e.target.value)}
                onBlur={() => onChange?.({ ...draft, priceMin: draft.priceMin })}
                placeholder={t("price.min", { ns: "filter" })}
                className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
              />
              <input
                value={draft.priceMax}
                onChange={(e) => setField("priceMax", e.target.value)}
                onBlur={() => onChange?.({ ...draft, priceMax: draft.priceMax })}
                placeholder={t("price.max", { ns: "filter" })}
                className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          {/* Verified */}
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.verifiedOnly}
              onChange={(e) => {
                setField("verifiedOnly", e.target.checked);
                setTimeout(() => onChange?.({ ...draft, verifiedOnly: e.target.checked }), 0);
              }}
            />
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="h-4 w-4" style={{ color: ORANGE }} />
              {t("verifiedOnly", { ns: "filter" })}
            </span>
          </label>
        </div>
      )}

      {/* ADVANCED */}
      <button
        type="button"
        onClick={() => setOpenAdvanced((s) => !s)}
        className="mt-4 flex w-full items-center justify-between rounded-2xl px-3 py-3 font-bold hover:bg-black/5"
        style={{ color: ORANGE }}
      >
        <span>{t("advanced.title", { ns: "filter" })}</span>
        {openAdvanced ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {openAdvanced && (
        <div className="mt-2 space-y-4 rounded-2xl border border-black/10 p-3">
          {/* Amenities */}
          <div>
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: ORANGE }}>
              <ListChecks className="h-4 w-4" />
              {t("amenities.title", { ns: "filter" })}
            </div>

            <input
              value={amenitiesText}
              onChange={(e) => {
                const nextArr = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                setDraft((p) => ({ ...p, amenities: nextArr }));
              }}
              onBlur={() => onChange?.({ ...draft, amenities: draft.amenities })}
              placeholder={t("amenities.placeholder", { ns: "filter" })}
              className="mt-2 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
            />
            <div className="mt-1 text-xs text-black/45">
              {t("amenities.hint", { ns: "filter" })}
            </div>
          </div>

          {/* Gender */}
          <div>
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: ORANGE }}>
              <Users className="h-4 w-4" />
              {t("gender.title", { ns: "filter" })}
            </div>

            <select
              className="mt-2 w-full rounded-2xl border border-black/10 px-3 py-2 text-sm outline-none"
              value={draft.gender}
              onChange={(e) => {
                setField("gender", e.target.value);
                setTimeout(() => onChange?.({ ...draft, gender: e.target.value }), 0);
              }}
            >
              {genderOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* AC / Fan */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.hasAir}
                onChange={(e) => {
                  setField("hasAir", e.target.checked);
                  setTimeout(() => onChange?.({ ...draft, hasAir: e.target.checked }), 0);
                }}
              />
              <span className="inline-flex items-center gap-2">
                <Wind className="h-4 w-4" style={{ color: ORANGE }} />
                {t("hasAir", { ns: "filter" })}
              </span>
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.hasFan}
                onChange={(e) => {
                  setField("hasFan", e.target.checked);
                  setTimeout(() => onChange?.({ ...draft, hasFan: e.target.checked }), 0);
                }}
              />
              <span className="inline-flex items-center gap-2">
                <Fan className="h-4 w-4" style={{ color: ORANGE }} />
                {t("hasFan", { ns: "filter" })}
              </span>
            </label>
          </div>

          {/* Pet friendly */}
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.petFriendly}
              onChange={(e) => {
                setField("petFriendly", e.target.checked);
                setTimeout(() => onChange?.({ ...draft, petFriendly: e.target.checked }), 0);
              }}
            />
            <span className="inline-flex items-center gap-2">
              <PawPrint className="h-4 w-4" style={{ color: ORANGE }} />
              {t("petFriendly", { ns: "filter" })}
            </span>
          </label>
        </div>
      )}

      {/* Apply (optional) */}
      <button
        type="button"
        onClick={apply}
        className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white hover:opacity-95"
        style={{ background: ORANGE }}
      >
        {t("apply", { ns: "filter" })}
      </button>
    </aside>
  );
}