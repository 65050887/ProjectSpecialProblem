// client/src/components/FilterPanel.jsx
import React, { useMemo, useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  MapPin,
  Home,
  Star,
  ArrowUpDown,
  Users,
  Wifi,
  Car,
  WashingMachine,
  Dumbbell,
  Wind,
  KeyRound,
  ShieldCheck,
  Table2,
  BedDouble,
  Sofa,
  Fan,
  Droplets,
  CupSoda,
  PawPrint,
} from "lucide-react";

export const DEFAULT_VALUE = {
  verifiedOnly: false,
  priceMin: "",
  priceMax: "",
  hasAir: false,
  hasFan: false,
  amenities: [],
  gender: "any",

  distance: "",
  roomType: "",
  ratingMin: 0,
  sortBy: "",
  dormitoryType: "",
  petFriendly: false,
  contractPeriod: "",
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/** ✅ custom select dropdown (รองรับ hover ได้ตามดีไซน์ที่ต้องการ) */
function Dropdown({ value, onChange, placeholder, options, ORANGE = "#F16323" }) {
  const [open, setOpen] = useState(false);

  const currentLabel = options.find((o) => o.value === value)?.label || "";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={cn(
          "h-12 w-full rounded-full border-2 border-[#F16323] bg-white px-6 pr-12",
          "text-left text-[16px] font-bold text-[#F16323] outline-none",
          "hover:bg-[#F16323]/5 transition"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {currentLabel || placeholder}
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#F16323] transition",
            open ? "rotate-180" : ""
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 z-30 mt-3 overflow-hidden rounded-[18px]",
            "border-2 border-[#F16323] bg-white shadow-[0_18px_34px_rgba(0,0,0,0.18)]"
          )}
          role="listbox"
        >
          <div className="py-4 px-4 space-y-2">
            {options.map((o) => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-xl px-6 py-4 text-left text-[16px] font-medium transition",
                    "hover:bg-[#F16323]/15 hover:shadow-sm hover:-translate-y-[1px] active:translate-y-0",
                    active ? "text-white" : "text-[#F16323] hover:text-[#D94E16]"
                  )}
                  style={{ background: active ? ORANGE : "transparent" }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => setOpen(false)}
          aria-label="close dropdown"
        />
      )}
    </div>
  );
}

export default function FilterPanel({
  value = DEFAULT_VALUE,
  onChange,
  onClearAll,
  collapsible = false,
  defaultOpen = true,
}) {
  const v = value || DEFAULT_VALUE;

  const ORANGE = "#F16323";
  const YELLOW = "#F6D04D";

  const [openPanel, setOpenPanel] = useState(defaultOpen);

  const [open, setOpen] = useState({
    basic: true,
    facilities: true,
    special: true,
    advanced: true,
  });

  const setField = (key, next) => {
    if (!onChange) return;
    onChange({ ...v, [key]: next });
  };

  const clearLocal = () => {
    if (onClearAll) onClearAll();
    else if (onChange) onChange(DEFAULT_VALUE);
  };

  const activeCount = useMemo(() => {
    let n = 0;
    if (v.verifiedOnly) n++;
    if (String(v.priceMin || "").trim() !== "") n++;
    if (String(v.priceMax || "").trim() !== "") n++;
    if (v.hasAir) n++;
    if (v.hasFan) n++;
    if (Array.isArray(v.amenities) && v.amenities.length) n += v.amenities.length;
    if (v.gender && v.gender !== "any") n++;

    if (String(v.distance || "").trim() !== "") n++;
    if (String(v.roomType || "").trim() !== "") n++;
    if (Number(v.ratingMin || 0) > 0) n++;
    if (String(v.sortBy || "").trim() !== "") n++;
    if (String(v.dormitoryType || "").trim() !== "") n++;
    if (v.petFriendly) n++;
    if (String(v.contractPeriod || "").trim() !== "") n++;

    return n;
  }, [v]);

  const AMENITIES = useMemo(
    () => [
      { key: "wifi", label: "wifi", icon: Wifi },
      { key: "parking", label: "parking", icon: Car },
      { key: "laundry", label: "laundry", icon: WashingMachine },
      { key: "gym", label: "gym", icon: Dumbbell },
      { key: "air", label: "air", icon: Wind },
      { key: "key card", label: "key card", icon: KeyRound },
      { key: "wardrobe", label: "wardrobe", icon: Table2 },
      { key: "fan", label: "fan", icon: Fan },
      { key: "furnitures", label: "furnitures", icon: Sofa },
      { key: "security", label: "security", icon: ShieldCheck },
      { key: "table", label: "table", icon: Table2 },
      { key: "bed", label: "bed", icon: BedDouble },
      { key: "water heatsr", label: "water heatsr", icon: Droplets },
      { key: "drink water", label: "drink water", icon: CupSoda },
    ],
    []
  );

  const toggleAmenity = (name) => {
    const list = Array.isArray(v.amenities) ? v.amenities : [];
    const has = list.includes(name);
    const next = has ? list.filter((x) => x !== name) : [...list, name];
    setField("amenities", next);
  };

  const allSelected = Array.isArray(v.amenities) && v.amenities.length === AMENITIES.length;

  const SectionRow = ({ title, k }) => (
    <button
      type="button"
      className="flex w-full items-center justify-between py-4 text-left"
      onClick={() => setOpen((s) => ({ ...s, [k]: !s[k] }))}
    >
      <span className="text-[18px] font-bold text-[#F16323]">{title}</span>
      <ChevronDown className={cn("h-7 w-7 text-[#F16323] transition", open[k] ? "rotate-180" : "")} />
    </button>
  );

  const LabelRow = ({ icon: Icon, title }) => (
    <div className="mb-3 flex items-center gap-3 text-[#F16323]">
      <Icon className="h-7 w-7" />
      <div className="text-[16px] font-bold">{title}</div>
    </div>
  );

  // Price slider
  const PRICE_MIN = 2000;
  const PRICE_MAX = 10000;
  const PRICE_STEP = 500;

  const priceMinNum = Number(String(v.priceMin || "").trim() || PRICE_MIN);
  const priceMaxNum = Number(String(v.priceMax || "").trim() || PRICE_MAX);

  const minVal = Number.isFinite(priceMinNum) ? Math.max(PRICE_MIN, Math.min(priceMinNum, PRICE_MAX)) : PRICE_MIN;
  const maxVal = Number.isFinite(priceMaxNum) ? Math.max(PRICE_MIN, Math.min(priceMaxNum, PRICE_MAX)) : PRICE_MAX;

  const safeMin = Math.min(minVal, maxVal);
  const safeMax = Math.max(minVal, maxVal);

  const minPct = ((safeMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((safeMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const setPriceMin = (n) => {
    const nextMin = Math.min(n, safeMax);
    setField("priceMin", String(nextMin));
    if (String(v.priceMax || "").trim() === "") setField("priceMax", String(safeMax));
  };
  const setPriceMax = (n) => {
    const nextMax = Math.max(n, safeMin);
    setField("priceMax", String(nextMax));
    if (String(v.priceMin || "").trim() === "") setField("priceMin", String(safeMin));
  };

  // rating
  const ratingMin = Number(v.ratingMin || 0);
  const ratingPct = (Math.max(0, Math.min(ratingMin, 5)) / 5) * 100;

  return (
    <div className="w-full">
      {collapsible && (
        <button
          type="button"
          className="mb-3 inline-flex w-full items-center justify-between rounded-2xl border-2 border-[#F16323] bg-white px-5 py-4"
          onClick={() => setOpenPanel((x) => !x)}
        >
          <span className="text-[18px] font-regular text-[#F16323]">Filters</span>
          <ChevronDown className={cn("h-6 w-6 text-[#F16323] transition", openPanel ? "rotate-180" : "")} />
        </button>
      )}

      <div className={cn("lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2", "scrollbar-hide")}>
        <div
          className={[
            "rounded-[28px] border-2 p-8 bg-white",
            "shadow-[0_18px_34px_rgba(0,0,0,0.18)]",
            collapsible && !openPanel ? "hidden" : "",
          ].join(" ")}
          style={{ borderColor: ORANGE }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[#F16323]">
              <SlidersHorizontal className="h-6 w-6" />
              <div className="text-[18px] font-semibold">Filters</div>
            </div>

            <button
              type="button"
              onClick={clearLocal}
              className="inline-flex items-center gap-3 text-[18px] font-bold text-[#F16323] hover:opacity-90"
            >
              <RotateCcw className="h-6 w-6" />
              Clear
            </button>
          </div>

          {/* Sections */}
          <div className="mt-6">
            {/* Filter Basic */}
            <div className="border-b border-[#F16323]/30 py-4">
              <SectionRow title="Filter Basic" k="basic" />
              {open.basic && (
                <div className="pb-6 pt-3 space-y-7">
                  {/* Price Range */}
                  <div>
                    <LabelRow icon={MapPin} title="Price Range" />

                    <div className="relative h-10">
                      <div className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 rounded-full bg-white border border-[#F16323]/30" />
                      <div
                        className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#F16323]"
                        style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
                      />
                      <div
                        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
                        style={{
                          left: `calc(${minPct}% - 12px)`,
                          background: YELLOW,
                          boxShadow: "0 8px 14px rgba(0,0,0,0.22)",
                        }}
                      />
                      <div
                        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
                        style={{
                          left: `calc(${maxPct}% - 12px)`,
                          background: YELLOW,
                          boxShadow: "0 8px 14px rgba(0,0,0,0.22)",
                        }}
                      />

                      <input
                        type="range"
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        step={PRICE_STEP}
                        value={safeMin}
                        onChange={(e) => setPriceMin(Number(e.target.value))}
                        className="absolute left-0 top-0 h-10 w-full opacity-0"
                      />
                      <input
                        type="range"
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        step={PRICE_STEP}
                        value={safeMax}
                        onChange={(e) => setPriceMax(Number(e.target.value))}
                        className="absolute left-0 top-0 h-10 w-full opacity-0"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[#F16323]">
                      <span className="text-[16px] font-bold">฿ {PRICE_MIN}</span>
                      <span className="text-[16px] font-bold">฿ {PRICE_MAX}</span>
                    </div>
                  </div>

                  {/* Distance */}
                  <div>
                    <LabelRow icon={MapPin} title="Distance from KMITL" />
                    <Dropdown
                      value={v.distance}
                      onChange={(x) => setField("distance", x)}
                      placeholder="Select Distance"
                      options={[
                        { value: "0.5", label: "Radius with in 500 m" },
                        { value: "1", label: "Radius with in 1 km" },
                        { value: "2", label: "Radius with in 2 km" },
                        { value: "3", label: "Radius with in 3 km" },
                        { value: "4", label: "Radius with in 4 km" },
                        { value: "5", label: "Radius with in 5 km" },
                        { value: "5+", label: "Radius with more than in 5 km" },
                      ]}
                      ORANGE={ORANGE}
                    />
                  </div>

                  {/* Room Type */}
                  <div>
                    <LabelRow icon={Home} title="Room Type" />
                    <Dropdown
                      value={v.roomType}
                      onChange={(x) => setField("roomType", x)}
                      placeholder="Select Room Type"
                      options={[
                        { value: "single", label: "Sigle Room" },
                        { value: "twin", label: "Twin Room" },
                      ]}
                      ORANGE={ORANGE}
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <LabelRow icon={Star} title="Rating" />
                    <div className="relative h-10">
                      <div className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 rounded-full bg-white border border-[#F16323]/30" />
                      <div
                        className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#F16323]"
                        style={{ width: `${ratingPct}%` }}
                      />
                      <div
                        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
                        style={{
                          left: `calc(${ratingPct}% - 12px)`,
                          background: YELLOW,
                          boxShadow: "0 8px 14px rgba(0,0,0,0.22)",
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.5}
                        value={Math.max(0, Math.min(ratingMin, 5))}
                        onChange={(e) => setField("ratingMin", Number(e.target.value))}
                        className="absolute left-0 top-0 h-10 w-full opacity-0"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[#F16323]">
                      <span className="inline-flex items-center gap-2 text-[18px] font-bold">
                        <Star className="h-5 w-5" /> 0
                      </span>
                      <span className="inline-flex items-center gap-2 text-[18px] font-bold">
                        <Star className="h-5 w-5" /> 2.5
                      </span>
                      <span className="inline-flex items-center gap-2 text-[18px] font-bold">
                        <Star className="h-5 w-5" /> 5
                      </span>
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <LabelRow icon={ArrowUpDown} title="Sort by" />
                    <Dropdown
                      value={v.sortBy}
                      onChange={(x) => setField("sortBy", x)}
                      placeholder="Select Sort"
                      options={[
                        { value: "price_high", label: "Price : Maximum to Minimum" },
                        { value: "price_low", label: "Price : Minimum to Maximum" },
                        { value: "distance_far", label: "Distance : Far to Near" },
                        { value: "distance_near", label: "Distance : Near to Far" },
                        { value: "rating_good", label: "Rating : Good to Bad" },
                        { value: "rating_bad", label: "Rating : Bad to Good" },
                      ]}
                      ORANGE={ORANGE}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Facilities */}
            <div className="border-b border-[#F16323]/30 py-4">
              <SectionRow title="Facilities" k="facilities" />
              {open.facilities && (
                <div className="pb-6 pt-3">
                  <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                    {AMENITIES.map((a) => {
                      const checked = (v.amenities || []).includes(a.key);
                      const Icon = a.icon;
                      return (
                        <label key={a.key} className="flex cursor-pointer items-center gap-3 text-[#F16323]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAmenity(a.key)}
                            className="peer sr-only"
                          />

                          {/* ✅ FIX: ให้ ✓ โผล่แน่ ๆ โดยคุมที่ span แล้วสั่งลูก svg */}
                          <span
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-md border-2 border-[#F16323] bg-white transition",
                              "peer-checked:bg-[#F16323]",
                              "peer-checked:[&>svg]:opacity-100"
                            )}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 text-white opacity-0 transition"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </span>

                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            <span className="text-[16px] font-bold">{a.label}</span>
                          </div>
                        </label>
                      );
                    })}

                    {/* Select All */}
                    <label className="col-span-2 mt-2 flex cursor-pointer items-center gap-3 text-[#F16323]">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => {
                          if (e.target.checked) setField("amenities", AMENITIES.map((x) => x.key));
                          else setField("amenities", []);
                        }}
                        className="peer sr-only"
                      />

                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md border-2 border-[#F16323] bg-white transition",
                          "peer-checked:bg-[#F16323]",
                          "peer-checked:[&>svg]:opacity-100"
                        )}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-white opacity-0 transition"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>

                      <span className="text-[14px] font-bold">Select All</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Special Need */}
            <div className="border-b border-[#F16323]/30 py-4">
              <SectionRow title="Special Need" k="special" />
              {open.special && (
                <div className="pb-6 pt-3 space-y-7">
                  <div>
                    <LabelRow icon={Users} title="Dormitory Type" />
                    <Dropdown
                      value={v.dormitoryType}
                      onChange={(x) => setField("dormitoryType", x)}
                      placeholder="Select Dormitory Type"
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "mix", label: "Mix" },
                      ]}
                      ORANGE={ORANGE}
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-4 text-[#F16323]">
                    <PawPrint className="h-7 w-7" />
                    <span className="text-[16px] font-bold">Pet Friendly</span>

                    {/* ✅ input จริง (ซ่อนไว้) */}
                    <input
                      type="checkbox"
                      checked={!!v.petFriendly}
                      onChange={(e) => setField("petFriendly", e.target.checked)}
                      className="peer sr-only"
                    />

                    {/* ✅ กล่อง checkbox แบบเดียวกับ Facilities */}
                    <span
                      className={cn(
                        "ml-auto flex h-7 w-7 items-center justify-center rounded-md border-2 border-[#F16323] bg-white transition",
                        "peer-checked:bg-[#F16323]",
                        "peer-checked:[&>svg]:opacity-100"
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-white opacity-0 transition"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                  </label>

                </div>
              )}
            </div>

            {/* Filter Advanced */}
            <div className="py-4">
              <SectionRow title="Filter Advanced" k="advanced" />
              {open.advanced && (
                <div className="pb-2 pt-3">
                  <LabelRow icon={MapPin} title="Contract period" />
                  <Dropdown
                    value={v.contractPeriod}
                    onChange={(x) => setField("contractPeriod", x)}
                    placeholder="Select Contract Period"
                    options={[
                      { value: "3m", label: "3 months" },
                      { value: "6m", label: "6 months" },
                      { value: "1y", label: "1 year" },
                    ]}
                    ORANGE={ORANGE}
                  />
                </div>
              )}
            </div>
          </div>

          {/* bottom button */}
          <div className="pt-8">
            <button
              type="button"
              onClick={clearLocal}
              className="inline-flex h-16 w-full items-center justify-center gap-4 rounded-full bg-[#F16323] px-6 text-[18px] font-semibold text-white hover:opacity-95"
            >
              <RotateCcw className="h-7 w-7" />
              Clear all filter ({activeCount})
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}