const express = require("express");
const db = require("../db");
const router = express.Router();

// Get landlords
router.get("/", async (req, res) => {
  const role = req.query.role;
  const [rows] = await db.query("SELECT * FROM users WHERE role=?", [role]);
  res.json(rows);
});

// Delete user (and cascade deletes properties)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM users WHERE id=?", [id]);
  res.json({ message: "Deleted" });
});

module.exports = router;
