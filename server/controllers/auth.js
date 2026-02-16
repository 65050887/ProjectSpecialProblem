// server/controllers/auth.js
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username) return res.status(400).json({ message: "Username is required" });
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    const user = await prisma.users.findFirst({ where: { email } });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const hashPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        username,
        email,
        password_hash: hashPassword,
      },
    });

    return res.json({ message: "Register Success" });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findFirst({ where: { email } });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Password Invalid!!" });

    const payload = {
      id: user.user_id.toString(),
      email: user.email,
      username: user.username,
    };

    jwt.sign(payload, process.env.SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) {
        console.log("JWT SIGN ERROR:", err);
        return res.status(500).json({ message: "Server Error" });
      }
      return res.json({ payload, token });
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.currentUser = async (req, res) => {
  try {
    // authCheck set req.user ไว้แล้ว
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.users.findFirst({
      where: { email },
      select: {
        user_id: true,
        email: true,
        username: true,
        // ✅ ห้าม select role ถ้าใน schema ไม่มี
      },
    });

    if (!user) return res.status(401).json({ message: "User not found" });

    return res.json({
      user: {
        user_id: user.user_id?.toString(),
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.log("CURRENT USER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
