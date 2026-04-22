import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "🏠" },
  { label: "History",   icon: "🕘" },
  { label: "Pricing",   icon: "💳" },
  { label: "Support",   icon: "💬" },
];

export default function Sidebar({ credits, activeNav, setActiveNav, setShowPricing, onLogout }) {
  const navigate = useNavigate();

  const handleNav = (item) => {
    setActiveNav(item);
    if (item === "Pricing") { setShowPricing(true); navigate("/dashboard"); }
    else if (item === "Dashboard") { setShowPricing(false); navigate("/dashboard"); }
  };

  const ringPct = Math.min(credits / 100, 1);
  const circumference = 2 * Math.PI * 26;

  return (
    <div style={s.sidebar}>

      {/* ── Brand ────────────────────────────────────────────────── */}
      <div style={s.brand}>
        <div style={s.brandIconBox}>🤖</div>
        <div style={s.brandText}>
          {/* All on one line, same weight, same size */}
          <span style={s.brandWord}>Doc Saathi </span>
          <span style={s.brandWordAI}>AI</span>
        </div>
      </div>

      {/* ── Credit Ring ──────────────────────────────────────────── */}
      <div style={s.creditWrap}>
        <div style={s.ringOuter}>
          <svg width="76" height="76" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="#1e293b" strokeWidth="5" />
            <circle
              cx="30" cy="30" r="26" fill="none"
              stroke={credits <= 5 ? "#ef4444" : "#f97316"}
              strokeWidth="5"
              strokeDasharray={`${ringPct * circumference} ${circumference}`}
              strokeLinecap="round"
              transform="rotate(-90 30 30)"
              style={{ transition: "all 0.4s" }}
            />
          </svg>
          <div style={s.ringNum}>{credits}</div>
        </div>
        <p style={s.ringLabel}>Credits Remaining</p>
        <button
          style={s.buyBtn}
          onClick={() => { setShowPricing(true); navigate("/dashboard"); }}
        >
          + Buy Credits
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav style={s.nav}>
        {NAV_ITEMS.map(({ label, icon }) => (
          <button
            key={label}
            style={{ ...s.navItem, ...(activeNav === label ? s.navActive : {}) }}
            onClick={() => handleNav(label)}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </nav>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div style={s.footer}>
        <p style={s.footerLine1}>Smarter than Cyber Café</p>
        {onLogout && (
          <button onClick={onLogout} style={s.logoutBtn}>🚪 Logout</button>
        )}
      </div>
    </div>
  );
}

const s = {
  sidebar: {
    width: 220,
    background: "#0a0f1e",
    borderRight: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    padding: "20px 14px",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
  },

  // Brand — all text same size, same weight
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingBottom: 20,
    marginBottom: 20,
    borderBottom: "1px solid #1e293b",
  },
  brandIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#f9731620",
    border: "1px solid #f9731640",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  brandText: {
    display: "flex",
    alignItems: "baseline",
    flexWrap: "nowrap",
  },
  brandWord: {
    fontSize: 15,
    fontWeight: 800,
    color: "#f1f5f9",
    letterSpacing: -0.3,
    whiteSpace: "nowrap",
  },
  brandWordAI: {
    fontSize: 15,
    fontWeight: 800,
    color: "#f97316",
    letterSpacing: -0.3,
  },

  // Credits
  creditWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 20,
    marginBottom: 16,
    borderBottom: "1px solid #1e293b",
  },
  ringOuter: { position: "relative", width: 76, height: 76, marginBottom: 8 },
  ringNum: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f97316",
    fontWeight: 800,
    fontSize: 20,
  },
  ringLabel: { color: "#64748b", fontSize: 11, margin: "0 0 10px" },
  buyBtn: {
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 18px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },

  // Nav
  nav: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    textAlign: "left",
    width: "100%",
    transition: "all 0.15s",
  },
  navActive: { background: "#f9731618", color: "#f97316", fontWeight: 700 },

  // Footer
  footer: { borderTop: "1px solid #1e293b", paddingTop: 14, marginTop: 8 },
  footerLine1: { color: "#334155", fontSize: 11, margin: "0 0 10px" },
  logoutBtn: {
    background: "#1e293b",
    border: "1px solid #374151",
    color: "#64748b",
    borderRadius: 8,
    padding: "7px 12px",
    cursor: "pointer",
    fontSize: 12,
    width: "100%",
    textAlign: "left",
  },
};
