import { useNavigate } from "react-router-dom";

const NAV_ITEMS = ["Dashboard", "History", "Pricing", "Support"];

export default function Sidebar({ credits, activeNav, setActiveNav, setShowPricing, onLogout }) {
  const navigate = useNavigate();

  const handleNav = (item) => {
    setActiveNav(item);
    if (item === "Pricing") {
      setShowPricing(true);
      navigate("/dashboard");
    } else if (item === "Dashboard") {
      setShowPricing(false);
      navigate("/dashboard");
    }
  };

  return (
    <div style={s.sidebar}>
      {/* Brand */}
      <div style={s.sideBrand}>
        <span style={{ fontSize: 22 }}>📋</span>
        <span style={s.brandName}>DocSaathi</span>
      </div>

      {/* Credits Ring */}
      <div style={s.sideCredits}>
        <div style={s.creditRing}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="#1e293b" strokeWidth="5" />
            <circle
              cx="30" cy="30" r="26" fill="none" stroke="#f97316" strokeWidth="5"
              strokeDasharray={`${Math.min(credits / 15, 1) * 163} 163`}
              strokeLinecap="round" transform="rotate(-90 30 30)"
            />
          </svg>
          <div style={s.creditRingText}>{credits}</div>
        </div>
        <p style={s.creditRingLabel}>Credits Remaining</p>
        <button
          style={s.buyCreditsBtn}
          onClick={() => { setShowPricing(true); navigate("/dashboard"); }}
        >
          + Buy Credits
        </button>
      </div>

      {/* Nav */}
      <nav style={s.sideNav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            style={{ ...s.sideNavItem, ...(activeNav === item ? s.sideNavActive : {}) }}
            onClick={() => handleNav(item)}
          >
            {item === "Dashboard" && "🏠"}{" "}
            {item === "History" && "🕘"}{" "}
            {item === "Pricing" && "💳"}{" "}
            {item === "Support" && "💬"}{" "}
            {item}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={s.sideBottom}>
        <p style={s.sideTagline}>Cheaper than Cyber Café.</p>
        <p style={s.sideTaglineSub}>Smarter. Faster. Anywhere.</p>
        {onLogout && (
          <button onClick={onLogout} style={s.logoutBtn}>Logout</button>
        )}
      </div>
    </div>
  );
}

const s = {
  sidebar: { width: 240, background: "#0d1421", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", padding: "20px 16px", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  sideBrand: { display: "flex", alignItems: "center", gap: 8, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #1e293b" },
  brandName: { fontSize: 18, fontWeight: 800, color: "#f97316" },
  sideCredits: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24, padding: "16px 0", borderBottom: "1px solid #1e293b" },
  creditRing: { position: "relative", width: 60, height: 60, marginBottom: 8 },
  creditRingText: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316", fontWeight: 800, fontSize: 18 },
  creditRingLabel: { color: "#64748b", fontSize: 12, marginBottom: 10 },
  buyCreditsBtn: { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  sideNav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  sideNavItem: { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "none", background: "transparent", color: "#64748b", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, textAlign: "left", transition: "all 0.2s" },
  sideNavActive: { background: "#f9731618", color: "#f97316", fontWeight: 700 },
  sideBottom: { borderTop: "1px solid #1e293b", paddingTop: 16, marginTop: 8 },
  sideTagline: { color: "#f97316", fontSize: 12, fontWeight: 700, marginBottom: 2 },
  sideTaglineSub: { color: "#475569", fontSize: 11, marginBottom: 10 },
  logoutBtn: { background: "#1e293b", border: "1px solid #374151", color: "#94a3b8", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, width: "100%" },
};