const express = require("express");
const { db } = require("../db");
const { scoreStudent } = require("../lib/riskEngine");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/students — risk-scored student list for the logged-in advisor
router.get("/", requireAuth, (req, res) => {
  try {
    const students = db.findStudentsByAdvisor(req.advisor.id);

    const scored = students.map((s) => ({
      ...s,
      risk: scoreStudent(s),
    }));

    // Highest risk first
    scored.sort((a, b) => b.risk.score - a.risk.score);

    res.json({ students: scored });
  } catch (err) {
    console.error("GET /students error:", err.message);
    res.status(500).json({ error: "Could not load students. Please try again." });
  }
});

// GET /api/students/:id — single student detail + outreach history
router.get("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid student id." });
  }
  try {
    const student = db.findStudentById(id, req.advisor.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found." });
    }

    const outreach = db.findOutreachByStudent(id);

    res.json({ student: { ...student, risk: scoreStudent(student) }, outreach });
  } catch (err) {
    console.error("GET /students/:id error:", err.message);
    res.status(500).json({ error: "Could not load student details." });
  }
});

module.exports = router;
