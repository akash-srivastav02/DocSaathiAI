import { useNavigate } from "react-router-dom";

export default function TopBar({ user, credits }) {
  const navigate = useNavigate();

  return (
    <div style={s.topbar}>
      <p style={s.greeting}>
        👋 Welcome, <b style={{ color: "#f1f5f9" }}>{user?.name?.split(" ")[0] || "User"}</b>
      </p>
      <div style={s.right}>
        <div style={s.creditPill} onClick={() => navigate("/pricing")} title="Buy more credits">
          <span>⚡</span>
          <b style={{ color: "#f97316" }}>{credits ?? 0}</b>
          <span style={{ color: "#94a3b8", fontSize: 12 }}>Credits</span>
        </div>
        <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
      </div>
    </div>
  );
}

const s = {
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 24px", borderBottom: "1px solid #1e293b", background: "#0a0f1e", position: "sticky", top: 0, zIndex: 10 },
  greeting: { color: "#64748b", fontSize: 14, margin: 0 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  creditPill: { display: "flex", alignItems: "center", gap: 6, background: "#f9731614", border: "1px solid #f9731630", borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 14 },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 },
};
