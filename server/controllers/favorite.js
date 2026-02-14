const prisma = require("../config/prisma");

// POST /api/favorites
// body: { dormId }
exports.addFavorite = async (req, res) => {
  try {
    const userId = BigInt(req.user.user_id);
    const { dormId } = req.body;

    if (!dormId) {
      return res.status(400).json({ message: "dormId is required" });
    }

    const dorm_id = BigInt(dormId);

    // (optional) เช็คว่าหอมีจริงไหม
    const dorm = await prisma.dorms.findUnique({
      where: { dorm_id },
      select: { dorm_id: true },
    });
    if (!dorm) {
      return res.status(404).json({ message: "Dorm not found" });
    }

    // สร้าง favorite (กันซ้ำด้วย unique constraint)
    const favorite = await prisma.favorites.create({
      data: {
        user_id: userId,
        dorm_id,
      },
    });

    return res.json({
      ok: true,
      favorite: {
        favorite_id: favorite.favorite_id.toString(),
        user_id: favorite.user_id.toString(),
        dorm_id: favorite.dorm_id.toString(),
        created_at: favorite.created_at,
      },
    });
  } catch (err) {
    console.log("ADD FAVORITE ERROR:", err);

    // Prisma unique constraint error: P2002 (user_id + dorm_id ซ้ำ)
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Favorite already exists" });
    }

    return res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/favorites
exports.listFavorites = async (req, res) => {
  try {
    const userId = BigInt(req.user.user_id);

    const favorites = await prisma.favorites.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      include: {
        dorm: true, // จะได้ข้อมูลหอไปด้วย (Dorms)
      },
    });

    // แปลง BigInt เป็น string ก่อนส่งออก
    const data = favorites.map((f) => ({
      favorite_id: f.favorite_id.toString(),
      user_id: f.user_id.toString(),
      dorm_id: f.dorm_id.toString(),
      created_at: f.created_at,
      dorm: f.dorm
        ? { ...f.dorm, dorm_id: f.dorm.dorm_id.toString() }
        : null,
    }));

    return res.json({ ok: true, favorites: data });
  } catch (err) {
    console.log("LIST FAVORITES ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/favorites/:dormId
exports.removeFavorite = async (req, res) => {
  try {
    const userId = BigInt(req.user.user_id);
    const dormId = BigInt(req.params.dormId);

    // หา favorite แถวนี้ก่อน
    const existing = await prisma.favorites.findFirst({
      where: {
        user_id: userId,
        dorm_id: dormId,
      },
      select: { favorite_id: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    await prisma.favorites.delete({
      where: { favorite_id: existing.favorite_id },
    });

    return res.json({ ok: true, message: "Favorite removed" });
  } catch (err) {
    console.log("REMOVE FAVORITE ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
