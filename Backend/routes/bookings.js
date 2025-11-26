const express = require("express");
const db = require("../db");
const router = express.Router();

// Get bookings
router.get("/", async (req, res) => {
  const [rows] = await db.query(
    `SELECT b.*, u.email AS student_email, p.title AS property_title
     FROM bookings b
     JOIN users u ON b.student_id = student.id
     JOIN properties p ON b.property_id = p.id`
  );
  res.json(rows);
});

// Create booking
router.post("/", async (req, res) => {
  const { property_id, student_id, note } = req.body;
  await db.query("INSERT INTO bookings (property_id, student_id, note) VALUES (?,?,?)", [
    property_id,
    student_id,
    note,
  ]);
  res.json({ message: "Booking created" });
});

module.exports = router;
