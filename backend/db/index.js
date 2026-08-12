// Lightweight JSON-file data store.
// Chosen over better-sqlite3 to avoid requiring native C++ compilation
// (node-gyp + Visual Studio Build Tools on Windows), which is an unreasonable
// setup burden for a local student project. This keeps the same relational
// shape (advisors / students / outreach_log) documented in schema.sql, just
// persisted as JSON instead of a binary SQLite file. Production deployment
// would still target a real database (e.g. PostgreSQL on AWS RDS).

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DATA_PATH = path.join(__dirname, "studypath.json");

function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    return { advisors: [], students: [], outreach_log: [], nextId: { advisors: 1, students: 1, outreach_log: 1 } };
  }
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    // Corrupted data file — fail safe instead of crashing the whole server.
    console.error("Data file is corrupted or unreadable:", err.message);
    return { advisors: [], students: [], outreach_log: [], nextId: { advisors: 1, students: 1, outreach_log: 1 } };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function nextId(data, table) {
  const id = data.nextId[table];
  data.nextId[table] += 1;
  return id;
}

function initDb() {
  if (fs.existsSync(DATA_PATH)) return;

  const data = { advisors: [], students: [], outreach_log: [], nextId: { advisors: 1, students: 1, outreach_log: 1 } };

  const passwordHash = bcrypt.hashSync("demo1234", 10);
  const advisorId = nextId(data, "advisors");
  data.advisors.push({
    id: advisorId,
    name: "Demo Advisor",
    email: "advisor@studypath.demo",
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  });

  const students = [
    ["Maria Gonzalez", "maria.g@demo.edu", "Nursing", 2.1, 0.62, 4, "2025-07-01"],
    ["James Okafor", "james.o@demo.edu", "Computer Science", 3.4, 0.95, 0, "2025-08-05"],
    ["Ashley Kim", "ashley.k@demo.edu", "Business", 2.6, 0.78, 2, "2025-08-02"],
    ["Devon Patel", "devon.p@demo.edu", "Biology", 1.9, 0.55, 5, "2025-06-20"],
    ["Sofia Rossi", "sofia.r@demo.edu", "Psychology", 3.1, 0.88, 1, "2025-08-06"],
    ["Marcus Lee", "marcus.l@demo.edu", "Engineering", 2.8, 0.70, 3, "2025-07-28"],
    ["Priya Nair", "priya.n@demo.edu", "Nursing", 3.6, 0.97, 0, "2025-08-07"],
    ["Tyler Brooks", "tyler.b@demo.edu", "Undeclared", 1.7, 0.48, 6, "2025-06-15"],
  ];

  students.forEach(([name, email, major, gpa, attendance_rate, assignments_missed, last_lms_login]) => {
    data.students.push({
      id: nextId(data, "students"),
      name, email, major, gpa, attendance_rate, assignments_missed, last_lms_login,
      advisor_id: advisorId,
      created_at: new Date().toISOString(),
    });
  });

  saveData(data);
  console.log("Seeded database with demo advisor (advisor@studypath.demo / demo1234) and 8 students.");
}

const db = {
  findAdvisorByEmail(email) {
    const data = loadData();
    return data.advisors.find((a) => a.email === email) || null;
  },

  findStudentsByAdvisor(advisorId) {
    const data = loadData();
    return data.students
      .filter((s) => s.advisor_id === advisorId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  findStudentById(id, advisorId) {
    const data = loadData();
    return data.students.find((s) => s.id === id && s.advisor_id === advisorId) || null;
  },

  findOutreachByStudent(studentId) {
    const data = loadData();
    return data.outreach_log
      .filter((o) => o.student_id === studentId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  insertOutreach({ student_id, advisor_id, method, notes }) {
    const data = loadData();
    const record = {
      id: nextId(data, "outreach_log"),
      student_id,
      advisor_id,
      method,
      notes: notes || null,
      created_at: new Date().toISOString(),
    };
    data.outreach_log.push(record);
    saveData(data);
    return record;
  },
};

module.exports = { db, initDb };
