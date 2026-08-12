import { useState, useEffect, useCallback } from "react";
import Login from "./components/Login";
import StudentList from "./components/StudentList";
import StudentDetail from "./components/StudentDetail";
import ErrorBoundary from "./components/ErrorBoundary";
import { api } from "./lib/api";
import "./App.css";

export default function App() {
  const [advisor, setAdvisor] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);
  const [outreach, setOutreach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Restore session on load if a token exists
  useEffect(() => {
    const token = localStorage.getItem("studypath_token");
    if (token) {
      loadStudents();
    } else {
      setLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getStudents();
      setStudents(data.students);
      const stillExists = data.students.some((s) => s.id === activeId);
      if (data.students.length > 0 && (!activeId || !stillExists)) {
        setActiveId(data.students[0].id);
      }
      setAdvisor((prev) => prev || { name: "Advisor" });
    } catch (err) {
      setError(err.message);
      if (err.message.includes("expired") || err.message.includes("Invalid")) {
        localStorage.removeItem("studypath_token");
        setAdvisor(null);
      }
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    api
      .getStudent(activeId)
      .then((data) => {
        if (!cancelled) {
          setActiveStudent(data.student);
          setOutreach(data.outreach);
        }
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  function handleLogin(advisorData) {
    setAdvisor(advisorData);
    loadStudents();
  }

  function handleLogout() {
    localStorage.removeItem("studypath_token");
    setAdvisor(null);
    setStudents([]);
    setActiveId(null);
    setActiveStudent(null);
  }

  function refreshActiveStudent() {
    if (activeId) {
      api.getStudent(activeId).then((data) => {
        setActiveStudent(data.student);
        setOutreach(data.outreach);
      });
    }
  }

  if (!advisor && !localStorage.getItem("studypath_token")) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <header className="app-header">
          <div className="logo">
            <span className="logo-mark">SP</span>
            <span className="logo-text">StudyPath</span>
          </div>
          <button className="btn-secondary" onClick={handleLogout}>Sign Out</button>
        </header>

        {error && <p role="alert" className="banner-error">{error}</p>}

        {loading ? (
          <div className="loading-state" role="status">
            <div className="spinner" />
            <p>Loading your caseload…</p>
          </div>
        ) : (
          <main className="app-main">
            <aside className="list-column">
              <h2 className="column-title">Caseload ({students.length})</h2>
              <StudentList students={students} activeId={activeId} onSelect={setActiveId} />
            </aside>
            <section className="detail-column">
              {activeStudent ? (
                <StudentDetail
                  student={activeStudent}
                  outreach={outreach}
                  onOutreachLogged={refreshActiveStudent}
                />
              ) : (
                <p className="muted">Select a student to view details.</p>
              )}
            </section>
          </main>
        )}
      </div>
    </ErrorBoundary>
  );
}
