import { useState } from "react";
import RiskBadge from "./RiskBadge";
import { api } from "../lib/api";

export default function StudentDetail({ student, outreach, onOutreachLogged }) {
  const [method, setMethod] = useState("email");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleLogOutreach(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      await api.logOutreach(student.id, method, notes.trim());
      setNotes("");
      setSuccess(true);
      onOutreachLogged();
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <h2>{student.name}</h2>
          <p className="muted">{student.major} · GPA {student.gpa.toFixed(1)}</p>
        </div>
        <RiskBadge level={student.risk.level} />
      </div>

      <div className="reasons-card">
        <h3>Why this student is flagged</h3>
        <ul>
          {student.risk.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="metrics-row">
        <div className="metric"><span className="metric-label">Attendance</span><span>{Math.round(student.attendance_rate * 100)}%</span></div>
        <div className="metric"><span className="metric-label">Missed assignments</span><span>{student.assignments_missed}</span></div>
        <div className="metric"><span className="metric-label">Last LMS login</span><span>{student.last_lms_login}</span></div>
      </div>

      <form className="outreach-form" onSubmit={handleLogOutreach}>
        <h3>Log Outreach</h3>
        <label htmlFor="method">Method</label>
        <select id="method" value={method} onChange={(e) => setMethod(e.target.value)} disabled={saving}>
          <option value="email">Email</option>
          <option value="call">Phone Call</option>
          <option value="text">Text</option>
          <option value="in-person">In Person</option>
        </select>
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={saving}
          placeholder="e.g. Discussed tutoring resources, student agreed to attend office hours."
        />
        {error && <p role="alert" className="field-error">{error}</p>}
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Log Outreach"}
        </button>
        {success && <span className="toast" role="status">Outreach logged ✓</span>}
      </form>

      <div className="outreach-history">
        <h3>Outreach History</h3>
        {outreach.length === 0 ? (
          <p className="muted small">No outreach logged yet.</p>
        ) : (
          <ul>
            {outreach.map((o) => (
              <li key={o.id}>
                <strong>{o.method}</strong> — {new Date(o.created_at).toLocaleDateString()}
                {o.notes && <p className="muted small">{o.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
