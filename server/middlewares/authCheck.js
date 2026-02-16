// server/middlewares/authCheck.js
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

exports.authCheck = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization;

    if (!headerToken) {
      return res.status(401).json({ message: "No Token, Authorization" });
    }

    const token = headerToken.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token format invalid" });

    const decode = jwt.verify(token, process.env.SECRET);

    // เช็คใน DB ว่ามี user จริง
    const user = await prisma.users.findFirst({
      where: { email: decode.email },
      select: { user_id: true, email: true, username: true },
    });

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      user_id: user.user_id.toString(),
      email: user.email,
      username: user.username,
    };

    next();
  } catch (err) {
    console.log("AUTHCHECK ERROR:", err);
    return res.status(401).json({ message: "Token Invalid" });
  }
};

// ✅ ถ้าใน schema ยังไม่มี role → adminCheck จะ “กันไว้ก่อน” (ห้ามพัง)
exports.adminCheck = async (req, res, next) => {
  try {
    // ถ้ายังไม่ทำระบบ role จริง ๆ แนะนำให้ปิด route admin ไปก่อน
    return res.status(403).json({ message: "Access Denied: Admin Only (role not implemented)" });
  } catch (err) {
    console.log("ADMINCHECK ERROR:", err);
    return res.status(500).json({ message: "Error Admin access denied" });
  }
};
