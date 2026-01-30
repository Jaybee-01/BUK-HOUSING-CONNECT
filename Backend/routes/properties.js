const express = require("express");
const db = require("../db");
const router = express.Router();
const upload = require("../config/upload");


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


router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const files = req.files || [];

    // Build full URLs for each file
    const imageUrls = files.map(f => {
      return `http://localhost:3000/uploads/properties/${f.filename}`;
    });

    const {
      title,
      price,
      contact,
      location,
      live_location_link,
      description,
      landlord_id,
      type,
    } = req.body;

    const newProp = {
      title,
      price,
      contact,
      location,
      live_location_link,
      description,
      landlord_id,
      type,
      images: JSON.stringify(imageUrls), 
      verified: false,
      // createdAt: new Date().toISOString(),
    };

    const [result] = await db.execute(
      `INSERT INTO properties 
      (title, price, contact, location, live_location_link, description, landlord_id, type, images, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newProp.title,
        newProp.price,
        newProp.contact,
        newProp.location,
        newProp.live_location_link,
        newProp.description,
        newProp.landlord_id,
        newProp.type,
        newProp.images,
        newProp.verified,
        // newProp.createdAt,
      ],
      
    );

        return res.json({
          id: this.lastID,
          ...newProp,
        });
  } catch (err) {
    console.error("Error creating property:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
