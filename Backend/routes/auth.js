const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "Fill all fields" });

  const [userExists] = await db.query("SELECT * FROM users WHERE email=?", [
    email,
  ]);
  if (userExists.length)
    return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    [name, email, hashed, role]
  );

  res.json({ message: "Signup successful" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
  const user = rows[0];
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  req.session.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  res.json(req.session.user);
});

// logout
router.post("/logout", (req, res) => {
  {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  }
});

// Get current user
router.get("/me", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Not logged in" });
  res.json(req.session.user);
});

// forgot password post route
// router.post("/forgot-password", async (req, res) => {
//   const { name, email, role } = req.body;

//   if (!name || !email || !role) {
//     return res.status(400).json({ message: "Please fill all fields" });
//   }

//   try {
//     const [rows] = await db.query(
//       `SELECT * FROM ${users} WHERE name = ? AND email = ? AND role = ?`,
//       [name, email, role]
//     );

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const newPassword = Math.random().toString(36).slice(-8);
//     const hashed = await bcrypt.hash(newPassword, 10);

//     await db.query(
//       `UPDATE ${user} SET password = ? WHERE id = ?`,
//       [hashed, rows[0].id]
//     );

//     return res.json({
//       message: "Password reset successful",
//       newPassword,
//     });
//   } catch (error) {
//     console.error("Error during password reset:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// });

router.post("/forgot-password", async (req, res) => {
  const { name, email, role } = req.body; // match frontend 'fullname'

  if (!name || !email || !role) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  try {
    // query your users table directly
    const [rows] = await db.query(
      `SELECT * FROM users WHERE name = ? AND email = ? AND role = ?`,
      [name, email, role]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPassword = Math.random().toString(36).slice(-8); // random 8-char password
    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashed, rows[0].id]
    );

    return res.json({
      message: "Password reset successful",
      newPassword,
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
