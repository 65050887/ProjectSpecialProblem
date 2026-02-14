/* prisma/seed.js
 * ✅ Seed DormConnect from CSV (DormMaster)
 * Require: npm i -D csv-parse
 *
 * ENV:
 *  - SHEET_CSV_URL : Google Sheets CSV export URL (public)
 *  - SEED_RESET=1  : reset db before seeding
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/* -------------------------- helpers -------------------------- */

const str = (v) => {
  if (v === undefined || v === null) return "";
  const s = String(v).trim();
  return s === "-" ? "" : s;
};

const normalizeGender = (v) => {
  const s = str(v).toLowerCase();
  if (!s) return "mixed";
  if (["male", "ชาย"].includes(s)) return "male";
  if (["female", "หญิง"].includes(s)) return "female";
  if (["mixed", "รวม", "ชาย/หญิง", "หญิง/ชาย", "ชายหญิง", "หญิงชาย"].includes(s)) return "mixed";
  return "mixed";
};

// parse number from strings like "18", "18.00", "130 (เหมาจ่าย)"
const parseNumber = (v) => {
  const s = str(v).replace(/,/g, "");
  if (!s) return null;
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
};

const toIntOrNull = (v) => {
  const n = parseNumber(v);
  return n === null ? null : Math.trunc(n);
};

const toDecStrOrNull = (v) => {
  const n = parseNumber(v);
  return n === null ? null : n.toFixed(2);
};

// UnsignedTinyInt safe range (0..255). We tighten to months range (0..12) for this project.
const clampTinyIntOrNull = (n, min = 0, max = 12) => {
  if (n === null || n === undefined) return null;
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  const xi = Math.trunc(x);
  if (xi < min || xi > max) return null; // return null to avoid DB error
  return xi;
};

// ✅ Convert Google Drive share URL -> direct image URL
const toDriveDirectUrl = (url) => {
  const s = str(url);
  if (!s) return null;

  // https://drive.google.com/file/d/<ID>/view?... -> https://drive.google.com/uc?export=view&id=<ID>
  const m = s.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;

  // https://drive.google.com/open?id=<ID> -> direct
  const m2 = s.match(/drive\.google\.com\/open\?id=([^&]+)/i);
  if (m2) return `https://drive.google.com/uc?export=view&id=${m2[1]}`;

  // already direct or non-drive url
  return s;
};

const normalizeAmenity = (a) => {
  const s = str(a);
  if (!s) return "";
  const lower = s.toLowerCase();
  if (lower === "wifi" || lower === "wi-fi") return "Wi-Fi";
  return s;
};

const splitAmenities = (text) => {
  const s = str(text);
  if (!s) return [];
  return s
    .split(/,|;|\n|\r/g)
    .map((x) => normalizeAmenity(x.trim()))
    .filter(Boolean);
};

/* -------------------------- fetch with retry -------------------------- */

async function fetchWithRetry(url, { retries = 4, timeoutMs = 45000 } = {}) {
  let lastErr = null;

  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(t);
      return resp;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;

      const isLast = i === retries;
      if (isLast) break;

      // exponential-ish backoff
      const waitMs = 800 * (i + 1);
      console.warn(`⚠️ fetch retry ${i + 1}/${retries} in ${waitMs}ms ...`, e?.message || e);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  throw lastErr;
}

/* -------------------------- load CSV -------------------------- */

async function loadDormMasterCSV() {
  const url = process.env.SHEET_CSV_URL;

  if (url) {
    console.log("🌐 Loading CSV from Google Sheets:", url);
    const resp = await fetchWithRetry(url, { retries: 4, timeoutMs: 45000 });

    if (!resp.ok) {
      throw new Error(`Failed to fetch SHEET_CSV_URL: ${resp.status} ${resp.statusText}`);
    }

    const csv = await resp.text();
    return parse(csv, { columns: true, skip_empty_lines: true, bom: true });
  }

  // fallback: local file
  const filePath = path.join(__dirname, "seed-data", "dorm_master.csv");
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV not found. Provide SHEET_CSV_URL or put file at: ${filePath}`);
  }
  console.log("📄 Loading CSV from local file:", filePath);
  const csv = fs.readFileSync(filePath, "utf8");
  return parse(csv, { columns: true, skip_empty_lines: true, bom: true });
}

/* -------------------------- reset (optional) -------------------------- */

async function resetDatabase() {
  // delete in FK-safe order
  await prisma.favorites.deleteMany();
  await prisma.reviews_Likes.deleteMany();
  await prisma.reviews_replies.deleteMany();
  await prisma.reviews.deleteMany();

  await prisma.dorms_Amenities.deleteMany();
  await prisma.amenities.deleteMany();

  await prisma.dorm_Images.deleteMany();
  await prisma.dorm_Contacts.deleteMany();
  await prisma.room_types.deleteMany();
  await prisma.dorm_Policies.deleteMany();
  await prisma.dorms_Fees.deleteMany();
  await prisma.dorms.deleteMany();
}

/* -------------------------- main seed -------------------------- */

async function main() {
  const shouldReset = str(process.env.SEED_RESET) === "1";
  if (shouldReset) {
    console.log("🧹 SEED_RESET=1 → resetting database...");
    await resetDatabase();
  }

  // 1) Load rows from CSV
  const rowsRaw = await loadDormMasterCSV();

  // ✅ Use dorm_code as primary key, skip empty dorm_code rows
  const rows = rowsRaw.filter((r) => str(r.dorm_code));

  console.log(`📥 Loaded rows: raw=${rowsRaw.length}, usable(with dorm_code)=${rows.length}`);

  // 2) Collect all amenities then upsert master
  const amenityNameSet = new Set();
  for (const r of rows) {
    splitAmenities(r.amenities_text).forEach((a) => amenityNameSet.add(a));
  }
  ["Wi-Fi", "เครื่องปรับอากาศ", "ที่จอดรถ", "เครื่องซักผ้า"].forEach((a) => amenityNameSet.add(a));

  const allAmenityNames = Array.from(amenityNameSet).filter(Boolean);

  console.log(`🧩 Upserting amenities: ${allAmenityNames.length} items`);
  const amenitiesCache = new Map(); // thName -> amenities_id

  for (const thName of allAmenityNames) {
    const row = await prisma.amenities.upsert({
      where: { amenity_name_th: thName },
      update: {},
      create: { amenity_name_th: thName, amenity_name_en: thName },
    });
    amenitiesCache.set(thName, row.amenities_id);
  }

  const findAmenityId = (th) => amenitiesCache.get(th);

  // 3) Upsert dorms
  console.log(`🏠 Seeding dorms: ${rows.length} rows`);

  for (const r of rows) {
    const dorm_code = str(r.dorm_code);
    if (!dorm_code) continue;

    const zone = str(r.zone_th);
    const subzone = str(r.subzone_th);
    const soi = str(r.soi_th);
    const street = str(r.street_th);
    const addressRaw = str(r.address_th);

    const address_th =
      [street, zone ? `โซน${zone}` : "", subzone, soi ? `ซอย ${soi}` : "", addressRaw]
        .filter((x) => str(x))
        .join(" ")
        .trim() || null;

    // fees
    const water_rate = toDecStrOrNull(r.water_rate);
    const electric_rate = toDecStrOrNull(r.electric_rate);

    // deposit & advance rent
    const depositType = str(r.deposit_type).toLowerCase(); // months | amount
    const depositValueInt = toIntOrNull(r.deposit_value);

    // clamp months (0..12). If you need 24, change max to 24.
    const advanceRaw = toIntOrNull(r.advance_rent_months);
    const advance_rent_months = clampTinyIntOrNull(advanceRaw, 0, 12);

    const depositMonthsRaw = depositType === "months" ? depositValueInt : null;
    const security_deposit_months =
      depositType === "months" ? clampTinyIntOrNull(depositMonthsRaw, 0, 12) : null;

    // description / notes
    const noteParts = [];
    if (str(r.note)) noteParts.push(str(r.note));

    if (depositType === "amount" && depositValueInt !== null) {
      noteParts.push(`มัดจำ ${depositValueInt} บาท`);
    }

    if (depositType === "months" && depositValueInt !== null && security_deposit_months === null) {
      noteParts.push(`มัดจำ (ระบุเป็นเดือนแต่ค่าสูงผิดปกติ) ${depositValueInt}`);
    }

    if (advanceRaw !== null && advance_rent_months === null) {
      noteParts.push(`จ่ายล่วงหน้า (เดือน) ค่าสูงผิดปกติ: ${advanceRaw}`);
    }

    const description_th = noteParts.length ? noteParts.join(" | ") : null;

    // coords (Decimal accepts string)
    const latitude = str(r.dorm_lat) ? String(parseNumber(r.dorm_lat) ?? str(r.dorm_lat)) : null;
    const longitude = str(r.dorm_lng) ? String(parseNumber(r.dorm_lng) ?? str(r.dorm_lng)) : null;

    const distance_m = toIntOrNull(r.distance_m);
    const price_min  = toIntOrNull(r.price_min);
    const price_max  = toIntOrNull(r.price_max);

    const total_rooms     = toIntOrNull(r.total_rooms);
    const available_rooms = toIntOrNull(r.available_rooms);

    const verified_status = ["1","true","yes","y","verified"].includes(str(r.verified_status).toLowerCase());
    const avg_rating      = toDecStrOrNull(r.avg_rating);   // Decimal string "0.00"
    const review_count    = toIntOrNull(r.review_count) ?? 0;

    // upsert Dorm by dorm_code
    const dorm = await prisma.dorms.upsert({
      where: { dorm_code },
      update: {
        dorm_name_th: str(r.dorm_name_th) || null,
        dorm_name_en: str(r.dorm_name_en) || null,
        address_th,
        district_th: str(r.district_th) || null,
        province_th: str(r.province_th) || null,
        latitude,
        longitude,
        description_th,

        distance_m,
        price_min,
        price_max,
        total_rooms,
        available_rooms,
        verified_status,
        avg_rating,
        review_count,
      },
      create: {
        dorm_code,
        dorm_name_th: str(r.dorm_name_th) || null,
        dorm_name_en: str(r.dorm_name_en) || null,
        address_th,
        district_th: str(r.district_th) || null,
        province_th: str(r.province_th) || null,
        latitude,
        longitude,
        description_th,

        distance_m,
        price_min,
        price_max,
        total_rooms,
        available_rooms,
        verified_status,
        avg_rating,
        review_count,
      },
    });

    // prevent duplicates: remove child rows for this dorm then recreate
    await prisma.dorm_Contacts.deleteMany({ where: { dorm_id: dorm.dorm_id } });
    await prisma.dorm_Images.deleteMany({ where: { dorm_id: dorm.dorm_id } });
    await prisma.room_types.deleteMany({ where: { dorm_id: dorm.dorm_id } });
    await prisma.dorms_Amenities.deleteMany({ where: { dorm_id: dorm.dorm_id } });

    // contacts
    const phones = [str(r.phone_1), str(r.phone_2)].filter(Boolean);
    if (phones.length) {
      await prisma.dorm_Contacts.createMany({
        data: phones.map((p) => ({ dorm_id: dorm.dorm_id, phone: p })),
      });
    }

    // cover image — convert Drive URL to direct URL before saving
    const cover = toDriveDirectUrl(r.cover_image_url);
    if (cover) {
      await prisma.dorm_Images.createMany({
        data: [{ dorm_id: dorm.dorm_id, image_url: cover, sort_order: 0 }],
      });
    }

    // fees (1:1) — upsert
    if (water_rate !== null || electric_rate !== null || advance_rent_months !== null || security_deposit_months !== null) {
      await prisma.dorms_Fees.upsert({
        where: { dorm_id: dorm.dorm_id },
        update: { water_rate, electric_rate, advance_rent_months, security_deposit_months },
        create: { dorm_id: dorm.dorm_id, water_rate, electric_rate, advance_rent_months, security_deposit_months },
      });
    }

    // policies (1:1) — upsert
    const gender_policy = normalizeGender(r.gender_policy);
    await prisma.dorm_Policies.upsert({
      where: { dorm_id: dorm.dorm_id },
      update: { gender_policy },
      create: {
        dorm_id: dorm.dorm_id,
        gender_policy,
        pet_allowed: null,
        smoking_allowed: null,
        policy_note_th: null,
        policy_note_en: null,
      },
    });

    // room types
    const rooms = [];
    const fanMin = toIntOrNull(r.rent_fan_min);
    const fanMax = toIntOrNull(r.rent_fan_max);
    const airMin = toIntOrNull(r.rent_air_min);
    const airMax = toIntOrNull(r.rent_air_max);

    if (fanMin !== null) {
      rooms.push({ room_type_name_th: "พัดลม", room_type_name_en: "Fan", price_per_month: fanMin, available_rooms: 0 });
      if (fanMax !== null && fanMax !== fanMin) {
        rooms.push({
          room_type_name_th: "พัดลม (ใหญ่)",
          room_type_name_en: "Fan (Large)",
          price_per_month: fanMax,
          available_rooms: 0,
        });
      }
    }

    if (airMin !== null) {
      rooms.push({ room_type_name_th: "แอร์", room_type_name_en: "Air", price_per_month: airMin, available_rooms: 0 });
      if (airMax !== null && airMax !== airMin) {
        rooms.push({
          room_type_name_th: "แอร์ (ใหญ่)",
          room_type_name_en: "Air (Large)",
          price_per_month: airMax,
          available_rooms: 0,
        });
      }
    }

    if (rooms.length) {
      await prisma.room_types.createMany({
        data: rooms.map((x) => ({ ...x, dorm_id: dorm.dorm_id })),
      });
    }

    // amenities connect
    const amenityNames = splitAmenities(r.amenities_text);
    if (amenityNames.length) {
      const rowsToCreate = amenityNames
        .map((th) => ({ dorm_id: dorm.dorm_id, amenities_id: findAmenityId(th) }))
        .filter((x) => x.amenities_id);

      if (rowsToCreate.length) {
        await prisma.dorms_Amenities.createMany({
          data: rowsToCreate,
          skipDuplicates: true,
        });
      }
    }

    console.log(`✅ Seeded dorm: ${dorm_code} (${str(r.dorm_name_th)})`);
  }

  console.log("✅ Seed completed");
}

/* -------------------------- run -------------------------- */

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
