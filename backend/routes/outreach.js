const express = require("express");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const VALID_METHODS = ["email", "call", "in-person", "text"];

// POST /api/outreach — log an advisor's outreach attempt
router.post("/", requireAuth, (req, res) => {
  const { student_id, method, notes } = req.body || {};
  const studentIdNum = Number(student_id);

  if (!student_id || !Number.isInteger(studentIdNum)) {
    return res.status(400).json({ error: "A valid student_id is required." });
  }
  if (!method || !VALID_METHODS.includes(method)) {
    return res.status(400).json({
      error: `Method must be one of: ${VALID_METHODS.join(", ")}.`,
    });
  }
  if (notes && notes.length > 2000) {
    return res.status(400).json({ error: "Notes must be under 2000 characters." });
  }

  try {
    const student = db.findStudentById(studentIdNum, req.advisor.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const record = db.insertOutreach({
      student_id: studentIdNum,
      advisor_id: req.advisor.id,
      method,
      notes: notes || null,
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("POST /outreach error:", err.message);
    res.status(500).json({ error: "Could not log outreach. Please try again." });
  }
});

module.exports = router;
