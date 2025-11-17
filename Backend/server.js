// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const db = require('./db');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // Seed admin user
// app.get('/seedAdmin', async (req, res) => {
//   const [rows] = await db.query("SELECT * FROM users WHERE email = ?", ["admin@buk.com"]);
//   if (rows.length === 0) {
//     await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
//       ["Administrator", "admin@buk.com", "adminpassword", "admin"]);
//     return res.json({ message: "Admin created" });
//   }
//   res.json({ message: "Admin already exists" });
// });

// // Get all users
// app.get('/users', async (req, res) => {
//   const [users] = await db.query("SELECT * FROM users");
//   res.json(users);
// });

// // Login
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const [users] = await db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
//   if (users.length === 0) return res.status(401).json({ message: "Invalid credentials" });
//   res.json(users[0]);
// });

// // Create property
// app.post('/properties', async (req, res) => {
//   const { id, title, description, price } = req.body;
//   await db.query("INSERT INTO properties (id, title, description, price) VALUES (?, ?, ?, ?)", [id, title, description, price]);
//   res.json({ message: "Property added" });
// });

// // Get all properties
// app.get('/properties', async (req, res) => {
//   const [props] = await db.query("SELECT * FROM properties");
//   res.json(props);
// });

// // Add booking
// app.post('/bookings', async (req, res) => {
//   const { id, user_id, property_id, booking_date } = req.body;
//   await db.query("INSERT INTO bookings (id, user_id, property_id, booking_date) VALUES (?, ?, ?, ?)", [id, user_id, property_id, booking_date]);
//   res.json({ message: "Booking created" });
// });

// // Get all bookings
// app.get('/bookings', async (req, res) => {
//   const [bookings] = await db.query("SELECT * FROM bookings");
//   res.json(bookings);
// });

// app.listen(3000, () => console.log("Server running on port 3000"));


const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const propertyRoutes = require("./routes/properties");
const bookingRoutes = require("./routes/bookings");

const app = express();

app.use(cors({ origin: "http://localhost:5500", credentials: true })); // frontend origin
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: "buk-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/properties", propertyRoutes);
app.use("/bookings", bookingRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));
