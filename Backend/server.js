// server.js
const express = require("express");
// const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db"); // your MySQL connection
const path = require("path");
const multer = require("multer");
const fs = require("fs");

// ensure upload dir exists
const UPLOAD_BASE = path.join(__dirname, "uploads", "properties");
if (!fs.existsSync(UPLOAD_BASE)) fs.mkdirSync(UPLOAD_BASE, { recursive: true });

// configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_BASE);
  },
  filename: function (req, file, cb) {
    // generate unique filename: timestamp-originalname
    const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  },
});

// only accept images
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed!"), false);
  } else {
    cb(null, true);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
}); // 5MB limit

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const propertyRoutes = require("./routes/properties");
const bookingRoutes = require("./routes/bookings");

const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: "http://localhost:5501", // frontend URL
    credentials: true,
  })
);
// app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/properties", propertyRoutes);
app.use("/bookings", bookingRoutes);


// static serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// --- Start server ---
app.listen(3000, () => console.log("Server running on port 3000"));
