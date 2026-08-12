-- StudyPath database schema
-- Note: SQLite is used for local development simplicity (zero external setup
-- required). Production deployment would target PostgreSQL (e.g. AWS RDS or
-- Cloud SQL), and this schema was intentionally kept portable between the two.

CREATE TABLE IF NOT EXISTS advisors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  major TEXT,
  gpa REAL,
  attendance_rate REAL,       -- 0.0 - 1.0
  assignments_missed INTEGER DEFAULT 0,
  last_lms_login TEXT,        -- ISO date string
  advisor_id INTEGER REFERENCES advisors(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outreach_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES students(id),
  advisor_id INTEGER NOT NULL REFERENCES advisors(id),
  method TEXT NOT NULL,       -- email, call, in-person
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
