const prisma = require("../config/prisma");

// helper แปลง BigInt -> string กัน JSON พัง
const toStr = (v) => (typeof v === "bigint" ? v.toString() : v);

// GET /api/dorm/:dormId/reviews
exports.listDormReviews = async (req, res) => {
  try {
    const dormId = BigInt(req.params.dormId);

    const reviews = await prisma.reviews.findMany({
      where: {
        dorm_id: dormId,
        deleted_at: null,
      },
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: { user_id: true, username: true },
        },
        replies: {
          where: { deleted_at: null },
          orderBy: { created_at: "asc" },
          include: {
            user: { select: { user_id: true, username: true } },
          },
        },
      },
    });

    const data = reviews.map((r) => ({
      review_id: toStr(r.review_id),
      dorm_id: toStr(r.dorm_id),
      user_id: toStr(r.user_id),
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      user: r.user
        ? { user_id: toStr(r.user.user_id), username: r.user.username }
        : null,
      replies: (r.replies || []).map((rep) => ({
        reply_id: toStr(rep.reply_id),
        review_id: toStr(rep.review_id),
        user_id: toStr(rep.user_id),
        reply_text: rep.reply_text,
        created_at: rep.created_at,
        user: rep.user
          ? { user_id: toStr(rep.user.user_id), username: rep.user.username }
          : null,
      })),
    }));

    return res.json({ ok: true, reviews: data });
  } catch (err) {
    console.log("LIST REVIEWS ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/dorm/:dormId/reviews
// body: { rating, comment }
exports.createDormReview = async (req, res) => {
  try {
    const dormId = BigInt(req.params.dormId);
    const userId = BigInt(req.user.user_id);

    const { rating, comment } = req.body;

    if (rating === undefined || rating === null) {
      return res.status(400).json({ message: "rating is required" });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "rating must be an integer between 1 and 5" });
    }

    // (optional) เช็คว่าหอมีจริงไหม
    const dorm = await prisma.dorms.findUnique({
      where: { dorm_id: dormId },
      select: { dorm_id: true },
    });
    if (!dorm) {
      return res.status(404).json({ message: "Dorm not found" });
    }

    const review = await prisma.reviews.create({
      data: {
        dorm_id: dormId,
        user_id: userId,
        rating: ratingNum,
        comment: comment ?? null,
      },
    });

    return res.json({
      ok: true,
      review: {
        review_id: review.review_id.toString(),
        dorm_id: review.dorm_id.toString(),
        user_id: review.user_id.toString(),
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      },
    });
  } catch (err) {
    console.log("CREATE REVIEW ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

// POST /api/reviews/:reviewId/replies
// body: { reply_text }
exports.replyReview = async (req, res) => {
  try {
    const reviewId = BigInt(req.params.reviewId);
    const userId = BigInt(req.user.user_id);
    const { reply_text } = req.body;

    if (!reply_text) {
      return res.status(400).json({ message: "reply_text is required" });
    }

    // เช็คว่า review มีอยู่จริง และยังไม่ถูกลบ
    const review = await prisma.reviews.findUnique({
      where: { review_id: reviewId },
      select: { review_id: true, deleted_at: true },
    });

    if (!review || review.deleted_at) {
      return res.status(404).json({ message: "Review not found" });
    }

    const reply = await prisma.reviews_replies.create({
      data: {
        review_id: reviewId,
        user_id: userId,
        reply_text,
      },
    });

    return res.json({
      ok: true,
      reply: {
        reply_id: reply.reply_id.toString(),
        review_id: reply.review_id.toString(),
        user_id: reply.user_id.toString(),
        reply_text: reply.reply_text,
        created_at: reply.created_at,
      },
    });
  } catch (err) {
    console.log("REPLY REVIEW ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
