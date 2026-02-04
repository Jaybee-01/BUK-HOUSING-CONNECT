// server.js
const express = require("express");
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
  }),
);

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
  }),
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
      const hashedPassword = await bcrypt.hash("admin", 10);
      await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Administrator", "admin@buk.com", hashedPassword, "admin"],
      );
      console.log("Admin user created");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  }
})();

// --- Authenticated user info ---
app.get("/me", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json(null);
    }

    // Use [rows] because your DB driver returns an array of [results, fields]
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.session.user.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json(null);
    }

    // Send back the first user found
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(500).json(null);
  }
});

// --- Update Profile ---
app.post("/update-profile", upload.single("profileImage"), async (req, res) => {
  // 1. Check if user is logged in
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.session.user.id;
  const userRole = req.session.user.role;

  // Destructure all possible fields from both Student and Landlord forms
  const { department, regNo, contact } = req.body;

  // 2. Handle Profile Image
  let profilePicPath = req.session.user.profileImage;
  if (req.file) {
    // Relative path for frontend serving
    profilePicPath = `uploads/properties/${req.file.filename}`;
  }

  try {
    await db.query(
      "UPDATE users SET department = ?, regNo = ?, contact = ?, profileImage = ? WHERE id = ?",
      [
        department || req.session.user.department || null,
        regNo || req.session.user.regNo || null,
        contact || req.session.user.contact || null,
        profilePicPath,
        userId,
      ],
    );

    // 4. Update the Session object so fetchLogged() returns fresh data
    if (department) req.session.user.department = department;
    if (regNo) req.session.user.regNo = regNo;
    if (contact) req.session.user.contact = contact;
    req.session.user.profileImage = profilePicPath;

    // 5. Save session explicitly before responding
    // This fixes the issue where the page reloads before the session is written
    req.session.save((err) => {
      if (err) {
        console.error("Session Save Error:", err);
        return res
          .status(500)
          .json({ error: "Session synchronization failed" });
      }
      res.json({
        success: true,
        message: "Profile updated successfully",
        user: req.session.user, // Optional: send back updated user for debugging
      });
    });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Failed to update database" });
  }
});

app.post("/properties/toggle-booked/:id", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const connection = await db.getConnection(); // Get a connection for transaction

  try {
    await connection.beginTransaction();

    // 1. Get current status
    const [prop] = await connection.query(
      "SELECT booked FROM properties WHERE id = ?",
      [id],
    );
    const currentlyBooked = prop[0].booked;

    // 2. Toggle the property status
    await connection.query(
      "UPDATE properties SET booked = 1 - booked WHERE id = ?",
      [id],
    );

    // 3. If we are UNBOOKING (changing 1 to 0), delete the booking records
    if (currentlyBooked == 1) {
      await connection.query("DELETE FROM bookings WHERE property_id = ?", [
        id,
      ]);
    }

    await connection.commit();
    res.json({ success: true, message: "Status updated and records cleared" });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Toggle failed" });
  } finally {
    connection.release();
  }
});

// --- Start server ---
app.listen(3000, () => console.log("Server running on port 3000"));
app.listen(3000, () =>
  console.log("Frontend running on http://localhost:5501"),
);
