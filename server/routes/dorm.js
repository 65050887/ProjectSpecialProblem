const express = require("express");
const router = express.Router();
const dormController = require("../controllers/dorm");
const { authCheck, adminCheck } = require("../middlewares/authCheck");

router.get("/dorm", dormController.listDorms);
router.get("/dorm/search", dormController.searchDorms);

router.get("/dorm/compare", dormController.compareDorms);
router.get("/dorm/:dormId", dormController.getDormDetail);

// ✅ เพิ่มสำหรับส่งข้อมูลจาก Postman (admin เท่านั้น)
router.post("/dorm", authCheck, adminCheck, dormController.createDorm);
router.put("/dorm/:dormId", authCheck, adminCheck, dormController.updateDorm);
router.delete("/dorm/:dormId", authCheck, adminCheck, dormController.deleteDorm);

module.exports = router
