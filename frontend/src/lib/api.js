// In Vite dev, hit the Express API on its own port; in production the API
// is served from the same origin as the static frontend.
const API_BASE = import.meta.env.DEV ? "http://localhost:4000/api" : "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("studypath_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error("Could not reach the server. Is the backend running?");
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error("Server returned an unexpected response.");
  }

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getStudents: () => request("/students"),
  getStudent: (id) => request(`/students/${id}`),
  logOutreach: (student_id, method, notes) =>
    request("/outreach", { method: "POST", body: JSON.stringify({ student_id, method, notes }) }),
};
