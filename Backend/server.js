// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db"); // your MySQL connection

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const propertyRoutes = require("./routes/properties");
const bookingRoutes = require("./routes/bookings");

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: "http://localhost:5500", // frontend URL
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: "buk-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

// Auto-seed Admin User
(async () => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      "admin@buk.com",
    ]);
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash("adminpassword", 10);
      await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Administrator", "admin@buk.com", hashedPassword, "admin"]
      );
      console.log("Admin user created");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  }
})();

// --- Authenticated user info ---
app.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ loggedIn: false });
  res.json(req.session.user);
});

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/properties", propertyRoutes);
app.use("/bookings", bookingRoutes);

// express serve the upload folder
app.use("/uploads", express.static("uploads"));

// --- Start server ---
app.listen(3000, () => console.log("Server running on port 3000"));
