import RiskBadge from "./RiskBadge";

export default function StudentList({ students, activeId, onSelect }) {
  if (students.length === 0) {
    return <p className="muted">No students found for your caseload.</p>;
  }

  return (
    <div className="student-list">
      {students.map((s) => (
        <button
          key={s.id}
          className={`student-row ${s.id === activeId ? "selected" : ""}`}
          onClick={() => onSelect(s.id)}
          aria-pressed={s.id === activeId}
        >
          <div className="student-row-main">
            <span className="student-name">{s.name}</span>
            <span className="student-major">{s.major}</span>
          </div>
          <RiskBadge level={s.risk.level} />
        </button>
      ))}
    </div>
  );
}
