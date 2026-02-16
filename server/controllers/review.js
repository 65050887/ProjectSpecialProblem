// server/controllers/review.js
const prisma = require("../config/prisma");

// GET /api/dorm/:dormId/reviews
exports.listDormReviews = async (req, res) => {
  try {
    const dormId = BigInt(req.params.dormId);

    const reviews = await prisma.reviews.findMany({
      where: { dorm_id: dormId, deleted_at: null },
      orderBy: { created_at: "desc" },
      include: {
        user: { select: { user_id: true, username: true } },
        replies: {
          where: { deleted_at: null },
          orderBy: { created_at: "asc" },
          include: { user: { select: { user_id: true, username: true } } },
        },
        likes: true,
      },
    });

    const count = reviews.length;
    const avg = count === 0 ? 0 : reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / count;

    res.json({
      dormId: dormId.toString(),
      summary: {
        avg_rating: Number(avg.toFixed(1)),
        review_count: count,
        stars: [1, 2, 3, 4, 5].reduce((acc, star) => {
          acc[star] = reviews.filter((r) => Number(r.rating) === star).length;
          return acc;
        }, {}),
      },
      reviews: reviews.map((r) => ({
        review_id: r.review_id.toString(),
        dorm_id: r.dorm_id.toString(),
        rating: Number(r.rating),
        comment: r.comment,
        created_at: r.created_at,
        user: {
          user_id: r.user.user_id.toString(),
          username: r.user.username,
        },
        replies: (r.replies || []).map((rp) => ({
          reply_id: rp.reply_id.toString(),
          reply_text: rp.reply_text,
          created_at: rp.created_at,
          user: {
            user_id: rp.user.user_id.toString(),
            username: rp.user.username,
          },
        })),
        like_count: (r.likes || []).length,
      })),
    });
  } catch (err) {
    console.log("listDormReviews error:", err);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

// POST /api/dorm/:dormId/reviews (authCheck)
exports.createDormReview = async (req, res) => {
  try {
    const dormId = BigInt(req.params.dormId);
    const userId = BigInt(req.user.user_id);

    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be 1-5" });
    }
    if (!comment) {
      return res.status(400).json({ message: "comment is required" });
    }

    const exists = await prisma.reviews.findFirst({
      where: { dorm_id: dormId, user_id: userId, deleted_at: null },
      select: { review_id: true },
    });
    if (exists) {
      return res.status(409).json({ message: "You already reviewed this dorm" });
    }

    const created = await prisma.reviews.create({
      data: { dorm_id: dormId, user_id: userId, rating, comment },
      include: { user: { select: { user_id: true, username: true } } },
    });

    const agg = await prisma.reviews.aggregate({
      where: { dorm_id: dormId, deleted_at: null },
      _avg: { rating: true },
      _count: { review_id: true },
    });

    await prisma.dorms.update({
      where: { dorm_id: dormId },
      data: {
        avg_rating: agg._avg.rating ?? 0,
        review_count: agg._count.review_id ?? 0,
      },
    });

    res.status(201).json({
      message: "Review created",
      review: {
        review_id: created.review_id.toString(),
        dorm_id: created.dorm_id.toString(),
        rating: Number(created.rating),
        comment: created.comment,
        created_at: created.created_at,
        user: {
          user_id: created.user.user_id.toString(),
          username: created.user.username,
        },
      },
    });
  } catch (err) {
    console.log("createDormReview error:", err);
    res.status(500).json({ message: "Failed to create review" });
  }
};

// POST /api/reviews/:reviewId/replies (authCheck)
exports.replyReview = async (req, res) => {
  try {
    const reviewId = BigInt(req.params.reviewId);
    const userId = BigInt(req.user.user_id);
    const reply_text = String(req.body.reply_text || "").trim();

    if (!reply_text) return res.status(400).json({ message: "reply_text is required" });

    const reply = await prisma.reviews_replies.create({
      data: { review_id: reviewId, user_id: userId, reply_text },
      include: { user: { select: { user_id: true, username: true } } },
    });

    res.status(201).json({
      message: "Reply created",
      reply: {
        reply_id: reply.reply_id.toString(),
        review_id: reply.review_id.toString(),
        reply_text: reply.reply_text,
        created_at: reply.created_at,
        user: {
          user_id: reply.user.user_id.toString(),
          username: reply.user.username,
        },
      },
    });
  } catch (err) {
    console.log("replyReview error:", err);
    res.status(500).json({ message: "Failed to reply review" });
  }
};
