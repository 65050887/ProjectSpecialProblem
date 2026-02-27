// server/controllers/auth.js
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, fullname } = req.body;

    const finalEmail = String(email || "").trim().toLowerCase();
    const finalPassword = String(password || "");

    const full =
      String(fullname || [firstName, lastName].filter(Boolean).join(" ")).trim() || "";

    const finalUsername = String(
      username || full || (finalEmail ? finalEmail.split("@")[0] : "")
    ).trim();

    if (!finalUsername) return res.status(400).json({ message: "Username is required" });
    if (!finalEmail) return res.status(400).json({ message: "Email is required" });
    if (!finalPassword) return res.status(400).json({ message: "Password is required" });

    const existed = await prisma.users.findFirst({ where: { email: finalEmail } });
    if (existed) return res.status(400).json({ message: "Email already exists" });

    const hashPassword = await bcrypt.hash(finalPassword, 10);

    await prisma.users.create({
      data: {
        username: finalUsername,
        email: finalEmail,
        password_hash: hashPassword,
        fullname: full || null,
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

    const finalEmail = String(email || "").trim().toLowerCase();
    const user = await prisma.users.findFirst({ where: { email: finalEmail } });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const isMatch = await bcrypt.compare(String(password || ""), user.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Password Invalid!!" });

    const payload = {
      id: user.user_id.toString(),
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      fullname: user.fullname,
      picture: user.picture,
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
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.users.findFirst({
      where: { email },
      select: {
        user_id: true,
        email: true,
        username: true,
        created_at: true,
        fullname: true,
        picture: true,
      },
    });

    if (!user) return res.status(401).json({ message: "User not found" });

    return res.json({
      user: {
        user_id: user.user_id.toString(),
        email: user.email,
        username: user.username,
        created_at: user.created_at,
        fullname: user.fullname,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.log("CURRENT USER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};