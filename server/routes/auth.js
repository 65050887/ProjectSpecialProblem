// server/routes/auth.js
const express = require("express");
const router = express.Router();

const authCtrl = require("../controllers/auth");
const { authCheck, adminCheck } = require("../middlewares/authCheck");

// ✅ กันพลาด: ถ้าใครเป็น undefined จะรู้ทันที
if (typeof authCtrl.register !== "function") console.log("❌ register is not a function");
if (typeof authCtrl.login !== "function") console.log("❌ login is not a function");
if (typeof authCtrl.currentUser !== "function") console.log("❌ currentUser is not a function");
if (typeof authCheck !== "function") console.log("❌ authCheck is not a function");
if (typeof adminCheck !== "function") console.log("❌ adminCheck is not a function");

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/current-user", authCheck, authCtrl.currentUser);

// ✅ ถ้ายังไม่ใช้ admin จริง ๆ ให้คอมเมนต์บรรทัดนี้ไปก่อน
router.post("/current-admin", authCheck, adminCheck, authCtrl.currentUser);

module.exports = router;
