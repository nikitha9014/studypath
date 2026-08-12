const META = {
  high: { label: "High Risk", color: "#c0392b", bg: "#fdecea" },
  medium: { label: "Medium Risk", color: "#b7791f", bg: "#fdf3e3" },
  low: { label: "Low Risk", color: "#2f7a4d", bg: "#e9f7ee" },
};

export default function RiskBadge({ level }) {
  const m = META[level] || META.low;
  return (
    <span className="risk-badge" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
  );
}
