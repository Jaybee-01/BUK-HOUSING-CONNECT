const express = require("express");
const db = require("../db");
const router = express.Router();

// Get all properties
router.get("/", async (req, res) => {
  const [rows] = await db.query(
    "SELECT p.*, u.email AS landlord_email FROM properties p JOIN users u ON p.landlord_id = u.id"
  );
  res.json(rows);
});

// Verify/unverify property
router.patch("/:id/verify", async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.query("SELECT verified FROM properties WHERE id=?", [id]);
  if (!rows.length) return res.status(404).json({ message: "Not found" });

  const newStatus = !rows[0].verified;
  await db.query("UPDATE properties SET verified=? WHERE id=?", [newStatus, id]);
  res.json({ message: "Updated" });
});

// Delete property
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM properties WHERE id=?", [id]);
  res.json({ message: "Deleted" });
});

module.exports = router;
