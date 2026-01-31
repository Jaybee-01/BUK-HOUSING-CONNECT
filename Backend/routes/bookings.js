const express = require("express");
const db = require("../db");
const router = express.Router();

// Get bookings
// router.get("/", async (req, res) => {
//   try {
//   const [rows] = await db.query(
//     `SELECT b.*, u.email AS student_email, p.title AS property_title
//      FROM bookings b
//      JOIN users u ON b.student_id = u.id
//      JOIN properties p ON b.property_id = p.id`
//   );
//   res.json(rows);
//   } catch (err) {
//     console.error("Error fetching bookings:", err);
//     res.status(500).json({ message: "Failed to fetch bookings" });
//   }
// });

router.get("/landlord", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "landlord") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        b.id, 
        b.createdAt, 
        b.note,
        p.title AS property_title, 
        u.name AS student_name, 
        u.email AS student_email 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.student_id = u.id
      WHERE p.landlord_id = ?
    `,
      [req.session.user.id],
    );

    res.json(rows);
  } catch (err) {
    console.error("SQL Error:", err.message);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Create booking
router.post("/", async (req, res) => {
  const { property_id, student_id, note } = req.body;

  if (!property_id || !student_id) {
    return res
      .status(400)
      .json({ message: "property_id and student_id are required" });
  }

  try {
    // checking if already booked
    const [existing] = await db.query(
      "SELECT * FROM bookings WHERE property_id = ? AND student_id = ?",
      [property_id, student_id],
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "This property has already been booked." });
    }

    await db.query(
      "INSERT INTO bookings (property_id, student_id, note) VALUES (?,?,?)",
      [property_id, student_id, note],
    );
    res.json({ message: "Booking created" });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

module.exports = router;
