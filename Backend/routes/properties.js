const express = require("express");
const db = require("../db");
const router = express.Router();

// Get all properties
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
    SELECT p.*, 
    u.email AS landlord_email,
    (SELECT COUNT(*) FROM bookings b WHERE b.property_id = p.id) AS booked
    FROM properties p 
    JOIN users u ON p.landlord_id = u.id
   `
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching properties:", err);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
});

// Verify/unverify property
router.patch("/:id/verify", async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.query("SELECT verified FROM properties WHERE id=?", [
    id,
  ]);
  if (!rows.length) return res.status(404).json({ message: "Not found" });

  const newStatus = !rows[0].verified;
  await db.query("UPDATE properties SET verified=? WHERE id=?", [
    newStatus,
    id,
  ]);
  res.json({ message: "Updated" });
});

// Delete property
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM properties WHERE id=?", [id]);
  res.json({ message: "Deleted" });
});

// Create a new property
router.post("/", async (req, res) => {
  try {
    const {
      title,
      price,
      contact,
      type,
      location,
      description,
      image,
      landlord_id,
    } = req.body;

    if (!title || !price || !contact || !location || !landlord_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [result] = await db.query(
      `INSERT INTO properties 
       (title, price, contact, type, location, description, image, landlord_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, price, contact, type, location, description, image, landlord_id]
    );

    // Return the newly created property
    const [newProp] = await db.query("SELECT * FROM properties WHERE id=?", [
      result.insertId,
    ]);

    res.status(201).json(newProp[0]);
  } catch (err) {
    console.error("Error creating property:", err);
    res.status(500).json({ message: "Failed to create property" });
  }
});

module.exports = router;
