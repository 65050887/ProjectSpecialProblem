const express = require("express");
const router = express.Router();

const { authCheck } = require("../middlewares/authCheck"); // ✅ เพิ่มบรรทัดนี้

const favoriteController = require("../controllers/favorite");

// ลองทำ endpoint ทดสอบก่อน
// router.get("/favorite", (req, res) => {
//   res.json({ ok: true, message: "favorite route OK" });
// });

// เพิ่มรายการโปรด
router.post("/favorites", authCheck, favoriteController.addFavorite);

// ดูรายการโปรด
router.get("/favorites", authCheck, favoriteController.listFavorites);

// ลบรายการโปรด
router.delete("/favorites/:dormId", authCheck, favoriteController.removeFavorite);

module.exports = router;
