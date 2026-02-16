// server\routes\review.js
const express = require("express");
const router = express.Router();

const { authCheck } = require("../middlewares/authCheck");
const reviewController = require("../controllers/review");

// ดูรีวิวของหอ (public ได้)
router.get("/dorm/:dormId/reviews", reviewController.listDormReviews);

// สร้างรีวิว (ต้อง login)
router.post("/dorm/:dormId/reviews", authCheck, reviewController.createDormReview);

// ตอบกลับรีวิว (ต้อง login)
router.post("/reviews/:reviewId/replies", authCheck, reviewController.replyReview);

module.exports = router;
