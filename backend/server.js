require("dotenv").config({ quiet: true });
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { initDb } = require("./db");
const { JWT_SECRET } = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const outreachRoutes = require("./routes/outreach");

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const frontendDist = path.join(__dirname, "..", "frontend", "dist");

// Security headers (helmet) — sets sane defaults against common attacks
// (clickjacking, MIME sniffing, etc.) with minimal config needed.
app.use(helmet());

// CORS is restricted to the known frontend origin rather than left wide
// open, since this API handles authenticated student data.
app.use(cors({ origin: FRONTEND_URL }));

app.use(express.json({ limit: "1mb" }));

// Warn loudly if running with the default JWT secret — this should never
// happen outside local development.
if (JWT_SECRET === "dev-only-secret-change-in-production") {
  console.warn(
    "\n⚠️  WARNING: Using the default JWT_SECRET. Set a real secret in your .env file before deploying anywhere beyond localhost.\n"
  );
}

// Basic brute-force protection on login: 10 attempts per 15 minutes per IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
});
app.use("/api/auth/login", loginLimiter);

// Initialize database (creates the JSON store + seeds demo data on first run)
initDb();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "studypath-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/outreach", outreachRoutes);

// Serve the Vite production build so the whole app runs as one service
// (e.g. AWS App Runner on a single port). Build the frontend first:
//   cd frontend && npm run build
app.use(express.static(frontendDist));

// SPA fallback — non-API routes get index.html; unknown API paths stay JSON 404.
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not found." });
  }
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) {
      res.status(404).json({
        error: "Frontend build not found. Run `npm run build` in the frontend folder.",
      });
    }
  });
});

// Centralized error handler — catches anything that slips past route-level
// try/catch, including malformed JSON request bodies (a common crash cause
// found during testing: garbage JSON previously fell through to a generic
// 500 instead of a clear 400).
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body is not valid JSON." });
  }
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Something went wrong on our end." });
});

app.listen(PORT, () => {
  console.log(`StudyPath running on http://localhost:${PORT}`);
});
