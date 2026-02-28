// server/controllers/dorm.js
const prisma = require("../config/prisma");

// ✅ BigInt -> string กัน res.json พัง
const jsonSafe = (data) =>
  JSON.parse(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

function toBool(v) {
  if (v === true) return true;
  if (v === false) return false;

  const s = String(v ?? "").trim().toLowerCase();
  return ["1", "true", "yes", "y", "verified"].includes(s);
}

// ✅ ระยะทางแบบ Haversine (เมตร)
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function pickCover(d) {
  return d?.images?.[0]?.image_url ?? null;
}

function calcMinMaxFromRoomTypes(roomTypes = []) {
  const prices = roomTypes
    .map((r) => Number(r?.price_per_month))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!prices.length) return { min: null, max: null };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function toNumberOrNull(v) {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

exports.listDorms = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    const dorms = await prisma.dorms.findMany({
      where: q
        ? {
            OR: [
              { dorm_name_th: { contains: q } },
              { dorm_name_en: { contains: q } },
              { district_th: { contains: q } },
              { province_th: { contains: q } },
              { address_th: { contains: q } },
            ],
          }
        : undefined,
      include: {
        images: { orderBy: { sort_order: "asc" } },
        room_types: true, // fallback min/max
      },
      orderBy: { dorm_id: "desc" },
      take: 50,
    });

    const result = dorms.map((d) => {
      const fallback = calcMinMaxFromRoomTypes(d.room_types);

      const price_min = d.price_min ?? fallback.min;
      const price_max = d.price_max ?? fallback.max;

      return {
        dorm_id: d.dorm_id.toString(),
        dorm_code: d.dorm_code ?? null,

        dorm_name_th: d.dorm_name_th ?? null,
        dorm_name_en: d.dorm_name_en ?? null,
        address_th: d.address_th ?? null,
        district_th: d.district_th ?? null,
        province_th: d.province_th ?? null,

        // ✅ จากชีท
        distance_m: d.distance_m ?? null,
        price_min,
        price_max,
        verified_status: toBool(d.verified_status),
        avg_rating: toNumberOrNull(d.avg_rating) ?? 0,
        review_count: d.review_count ?? 0,
        total_rooms: d.total_rooms ?? null,
        available_rooms: d.available_rooms ?? null,

        cover_image_url: pickCover(d),
      };
    });

    return res.json(jsonSafe({ ok: true, dorms: result }));
  } catch (err) {
    console.log("LIST DORMS ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.searchDorms = async (req, res) => {
  try {
    const qRaw = (req.query.q || "").toString().trim();
    const tokens = qRaw.split(/\s+/).filter(Boolean);

    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 200);
    const skip = (page - 1) * limit;

    // ✅ ถ้าหนูจะ filter ราคาใน search: ใช้ price_min/price_max จาก dorms ได้เลย
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

    const where = {
      AND: [
        tokens.length
          ? {
              AND: tokens.map((t) => ({
                OR: [
                  { dorm_name_th: { contains: t } },
                  { dorm_name_en: { contains: t } },
                  { address_th: { contains: t } },
                  { district_th: { contains: t } },
                  { province_th: { contains: t } },
                ],
              })),
            }
          : {},
        minPrice !== null ? { price_max: { gte: minPrice } } : {},
        maxPrice !== null ? { price_min: { lte: maxPrice } } : {},
      ],
    };

    const [total, dorms] = await Promise.all([
      prisma.dorms.count({ where }),
      prisma.dorms.findMany({
        where,
        include: {
          images: { orderBy: { sort_order: "asc" } },
          room_types: true, // fallback
        },
        orderBy: { dorm_id: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const result = dorms.map((d) => {
      const fallback = calcMinMaxFromRoomTypes(d.room_types);

      const price_min = d.price_min ?? fallback.min;
      const price_max = d.price_max ?? fallback.max;

      return {
        dorm_id: d.dorm_id.toString(),
        dorm_name_th: d.dorm_name_th ?? null,
        dorm_name_en: d.dorm_name_en ?? null,
        address_th: d.address_th ?? null,
        district_th: d.district_th ?? null,
        province_th: d.province_th ?? null,

        // ✅ ส่งไปให้หน้า Search ใช้เลย
        distance_m: d.distance_m ?? null,
        price_min,
        price_max,
        verified_status: toBool(d.verified_status),
        avg_rating: toNumberOrNull(d.avg_rating) ?? 0,
        review_count: d.review_count ?? 0,
        total_rooms: d.total_rooms ?? null,
        available_rooms: d.available_rooms ?? null,

        cover_image_url: pickCover(d),
      };
    });

    return res.json(jsonSafe({ ok: true, q: qRaw, page, limit, total, dorms: result }));
  } catch (err) {
    console.log("SEARCH DORMS ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.compareDorms = async (req, res) => {
  try {
    let ids = req.query.ids;

    if (!ids) return res.status(400).json({ message: "ids is required. Example: ?ids=1,2" });

    if (typeof ids === "string") {
      ids = ids.split(",").map((x) => x.trim()).filter(Boolean);
    }

    if (ids.length < 2) return res.status(400).json({ message: "Please provide at least 2 dorm ids" });
    if (ids.length > 3) return res.status(400).json({ message: "Compare supports up to 3 dorms" });

    const dormIds = ids.map((id) => BigInt(id));

    const dorms = await prisma.dorms.findMany({
      where: { dorm_id: { in: dormIds } },
      include: {
        images: { orderBy: { sort_order: "asc" } },
        fees: true,
        policies: true,
        room_types: true,
        dormAmenities: { include: { amenity: true } },
      },
    });

    const result = dorms.map((d) => {
      const fallback = calcMinMaxFromRoomTypes(d.room_types);
      const price_min = d.price_min ?? fallback.min;
      const price_max = d.price_max ?? fallback.max;

      return {
        dorm_id: d.dorm_id.toString(),
        dorm_name_th: d.dorm_name_th ?? null,
        dorm_name_en: d.dorm_name_en ?? null,
        address_th: d.address_th ?? null,
        district_th: d.district_th ?? null,
        province_th: d.province_th ?? null,

        distance_m: d.distance_m ?? null,
        price_min,
        price_max,
        verified_status: toBool(d.verified_status),
        avg_rating: toNumberOrNull(d.avg_rating) ?? 0,
        review_count: d.review_count ?? 0,

        fees: d.fees
          ? {
              water_rate: d.fees.water_rate?.toString?.() ?? d.fees.water_rate,
              electric_rate: d.fees.electric_rate?.toString?.() ?? d.fees.electric_rate,
              advance_rent_months: d.fees.advance_rent_months,
              security_deposit_months: d.fees.security_deposit_months,
            }
          : null,

        policies: d.policies
          ? {
              gender_policy: d.policies.gender_policy,
              pet_allowed: d.policies.pet_allowed,
              smoking_allowed: d.policies.smoking_allowed,
              policy_note_th: d.policies.policy_note_th,
            }
          : null,

        amenities: (d.dormAmenities || []).map((da) => ({
          amenities_id: da.amenities_id?.toString?.() ?? String(da.amenities_id),
          amenity_name_th: da.amenity?.amenity_name_th ?? null,
          amenity_name_en: da.amenity?.amenity_name_en ?? null,
        })),

        cover_image_url: pickCover(d),
      };
    });

    return res.json(jsonSafe({ ok: true, ids, dorms: result }));
  } catch (err) {
    console.log("COMPARE ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getDormDetail = async (req, res) => {
  try {
    const dormId = BigInt(req.params.dormId);

    const dorm = await prisma.dorms.findUnique({
      where: { dorm_id: dormId },
      include: {
        images: { orderBy: { sort_order: "asc" } },
        contacts: { orderBy: { contact_id: "asc" } },
        fees: true,
        policies: true,
        room_types: { orderBy: { price_per_month: "asc" } },
        dormAmenities: { include: { amenity: true } },
        reviews: {
          where: { deleted_at: null },
          include: {
            user: { select: { user_id: true, username: true } },
            replies: {
              where: { deleted_at: null },
              include: { user: { select: { user_id: true, username: true } } },
              orderBy: { created_at: "asc" },
            },
            likes: true,
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!dorm) return res.status(404).json({ message: "Dorm not found" });

    // ✅ ราคา: ใช้จาก dorms.price_min/price_max ก่อน, ถ้า null ค่อยคำนวณจาก room_types
    const fallback = calcMinMaxFromRoomTypes(dorm.room_types);
    const min_price_per_month = dorm.price_min ?? fallback.min;
    const max_price_per_month = dorm.price_max ?? fallback.max;

    // ✅ rating: ใช้จากชีทถ้ามี (avg_rating / review_count) ถ้าไม่มีค่อยคำนวณจาก reviews
    let avg_rating = toNumberOrNull(dorm.avg_rating);
    let review_count = dorm.review_count;

    if (avg_rating == null) {
      const ratings = (dorm.reviews || [])
        .map((r) => Number(r.rating))
        .filter((n) => Number.isFinite(n));
      avg_rating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    }
    if (review_count == null) {
      review_count = dorm.reviews?.length || 0;
    }

    // ✅ distance: ใช้ distance_m จากชีทก่อน ถ้า null ค่อยคำนวณจาก lat/lng
    let distance_m = dorm.distance_m ?? null;
    if (distance_m == null) {
      const KMITL = { lat: 13.7299, lng: 100.7786 };
      const lat = dorm.latitude != null ? Number(dorm.latitude) : null;
      const lng = dorm.longitude != null ? Number(dorm.longitude) : null;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        distance_m = Math.round(haversineMeters(KMITL.lat, KMITL.lng, lat, lng));
      }
    }

    const payload = {
      dorm: {
        ...dorm,
        dorm_id: dorm.dorm_id.toString(),
        cover_image_url: pickCover(dorm),

        min_price_per_month,
        max_price_per_month,
        avg_rating,
        review_count,

        distance_m,
      },
    };

    return res.json(jsonSafe(payload));
  } catch (err) {
    console.error("GET DORM DETAIL ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/dorm (admin only)
exports.createDorm = async (req, res) => {
  try {
    const data = req.body;

    const dorm = await prisma.dorms.create({
      data: {
        dorm_name_th: data.dorm_name_th,
        dorm_name_en: data.dorm_name_en,
        description_th: data.description_th,
        description_en: data.description_en,
        address_th: data.address_th,
        address_en: data.address_en,
        district_th: data.district_th,
        province_th: data.province_th,
        latitude: data.latitude,
        longitude: data.longitude,

        distance_m: data.distance_m ?? null,
        price_min: data.price_min ?? null,
        price_max: data.price_max ?? null,
        verified_status: data.verified_status ?? false,
        avg_rating: data.avg_rating ?? null,
        review_count: data.review_count ?? 0,
        total_rooms: data.total_rooms ?? null,
        available_rooms: data.available_rooms ?? null,
      },
    });

    return res.json(jsonSafe({ ok: true, dorm: { ...dorm, dorm_id: dorm.dorm_id.toString() } }));
  } catch (err) {
    console.log("CREATE DORM ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.updateDorm = async (req, res) => {
  try {
    const dormId = BigInt(req.params.dormId);
    const data = req.body;

    const dorm = await prisma.dorms.update({
      where: { dorm_id: dormId },
      data,
    });

    return res.json(jsonSafe({ ok: true, dorm: { ...dorm, dorm_id: dorm.dorm_id.toString() } }));
  } catch (err) {
    console.log("UPDATE DORM ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteDorm = async (req, res) => {
  try {
    const dormId = BigInt(req.params.dormId);

    await prisma.dorms.delete({
      where: { dorm_id: dormId },
    });

    return res.json({ ok: true, message: "Dorm deleted" });
  } catch (err) {
    console.log("DELETE DORM ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
