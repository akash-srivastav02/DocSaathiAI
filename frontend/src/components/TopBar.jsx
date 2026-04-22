import { useNavigate } from "react-router-dom";

export default function TopBar({ user, credits, setShowPricing }) {
  const navigate = useNavigate();

  return (
    <div style={s.topbar}>
      {/* Left — page context / greeting (no brand, sidebar has it) */}
      <div style={s.left}>
        <p style={s.greeting}>
          👋 Welcome back, <b style={{ color: "#f1f5f9" }}>{user?.name?.split(" ")[0] || "User"}</b>
        </p>
      </div>

      {/* Right — credits pill + avatar */}
      <div style={s.right}>
        {/* Credits */}
        <div
          style={s.creditPill}
          onClick={() => { setShowPricing?.(true); navigate("/dashboard"); }}
          title="Click to buy credits"
        >
          <span style={s.creditBolt}>⚡</span>
          <span style={s.creditCount}>{credits}</span>
          <span style={s.creditText}>Credits</span>
        </div>

        {/* Avatar */}
        <div style={s.avatarCircle}>
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </div>
  );
}

const s = {
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 28px",
    borderBottom: "1px solid #1e293b",
    background: "#0a0f1e",
    position: "sticky",
    top: 0,
    zIndex: 10,
    minHeight: 58,
  },

  // Left
  left: { display: "flex", alignItems: "center" },
  greeting: { color: "#64748b", fontSize: 14, margin: 0, fontWeight: 400 },

  // Right
  right: { display: "flex", alignItems: "center", gap: 12 },

  creditPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#f9731614",
    border: "1px solid #f9731630",
    borderRadius: 20,
    padding: "7px 16px",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  creditBolt: { fontSize: 14 },
  creditCount: { color: "#f97316", fontWeight: 800, fontSize: 15 },
  creditText:  { color: "#94a3b8", fontWeight: 500, fontSize: 13 },

  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f97316, #7c3aed)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    flexShrink: 0,
  },
};
