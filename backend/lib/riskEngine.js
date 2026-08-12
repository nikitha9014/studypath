// Rule-based risk scoring engine.
// Mirrors research-backed "ABCs" of dropout early-warning indicators:
// Attendance, Behavior (engagement/LMS activity), and Course performance.
// This is intentionally rule-based and explainable for the MVP rather than
// a trained ML model — documented as a known limitation, not overstated.

function daysSince(dateString) {
  if (!dateString) return Infinity;
  const then = new Date(dateString).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function scoreStudent(student) {
  const reasons = [];
  let score = 0; // higher = more risk

  // Attendance signal
  if (student.attendance_rate < 0.6) {
    score += 40;
    reasons.push(`Attendance is low at ${Math.round(student.attendance_rate * 100)}%, well below the healthy threshold.`);
  } else if (student.attendance_rate < 0.8) {
    score += 20;
    reasons.push(`Attendance is moderate at ${Math.round(student.attendance_rate * 100)}%, worth monitoring.`);
  }

  // Course performance signal
  if (student.gpa < 2.0) {
    score += 35;
    reasons.push(`GPA of ${student.gpa.toFixed(1)} is below the 2.0 academic standing threshold.`);
  } else if (student.gpa < 2.5) {
    score += 15;
    reasons.push(`GPA of ${student.gpa.toFixed(1)} is trending low.`);
  }

  // Behavior/engagement signal
  if (student.assignments_missed >= 4) {
    score += 25;
    reasons.push(`${student.assignments_missed} missed assignments indicates disengagement.`);
  } else if (student.assignments_missed >= 2) {
    score += 10;
    reasons.push(`${student.assignments_missed} missed assignments — an early warning sign.`);
  }

  const inactiveDays = daysSince(student.last_lms_login);
  if (inactiveDays > 14) {
    score += 20;
    reasons.push(`No LMS login in ${inactiveDays} days.`);
  } else if (inactiveDays > 7) {
    score += 8;
    reasons.push(`LMS activity has slowed — last login ${inactiveDays} days ago.`);
  }

  score = Math.min(score, 100);

  let level = "low";
  if (score >= 55) level = "high";
  else if (score >= 25) level = "medium";

  if (reasons.length === 0) {
    reasons.push("No risk indicators detected — attendance, grades, and engagement all look healthy.");
  }

  return { score, level, reasons };
}

module.exports = { scoreStudent };
