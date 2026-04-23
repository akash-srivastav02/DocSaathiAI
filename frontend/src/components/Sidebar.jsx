import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "🏠", path: "/dashboard" },
  { label: "Vault",     icon: "🗄️",  path: "/vault"     },
  { label: "Pricing",   icon: "💳", path: "/pricing"    },
  { label: "Support",   icon: "💬", path: "/support"    },
];

export default function Sidebar({ credits, onLogout, activeNav, setActiveNav }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use activeNav prop if provided, otherwise derive from location
  const activeLabel = activeNav || NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.label || "Dashboard";

  const ringPct = Math.min((credits || 0) / 100, 1);
  const circ    = 2 * Math.PI * 26;

  return (
    <div style={s.sidebar}>
      {/* Brand */}
      <div style={s.brand}>
        <div style={s.iconBox}>🤖</div>
        <div>
          <span style={s.brandMain}>Doc Saathi </span>
          <span style={s.brandAI}>AI</span>
        </div>
      </div>

      {/* Credit Ring */}
      <div style={s.creditBlock}>
        <div style={s.ringWrap}>
          <svg width="76" height="76" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="#1e293b" strokeWidth="5" />
            <circle cx="30" cy="30" r="26" fill="none"
              stroke={credits <= 5 ? "#ef4444" : "#f97316"} strokeWidth="5"
              strokeDasharray={`${ringPct * circ} ${circ}`} strokeLinecap="round"
              transform="rotate(-90 30 30)" style={{ transition: "all 0.4s" }} />
          </svg>
          <div style={s.ringNum}>{credits}</div>
        </div>
        <p style={s.ringLbl}>Credits Remaining</p>
        <button style={s.buyBtn} onClick={() => navigate("/pricing")}>
          + Buy Credits
        </button>
      </div>

      {/* Nav — direct navigate, no state manipulation */}
      <nav style={s.nav}>
        {NAV_ITEMS.map(({ label, icon, path }) => (
          <button
            key={label}
            style={{ ...s.navBtn, ...(activeLabel === label ? s.navActive : {}) }}
            onClick={() => navigate(path)}
          >
            <span style={{ width: 20, textAlign: "center" }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={s.footer}>
        <p style={s.footerText}>Smarter than Cyber Café</p>
        {onLogout && (
          <button onClick={onLogout} style={s.logoutBtn}>🚪 Logout</button>
        )}
      </div>
    </div>
  );
}

const s = {
  sidebar: { width: 220, background: "#0a0f1e", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", padding: "18px 14px", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  brand: { display: "flex", alignItems: "center", gap: 10, paddingBottom: 18, marginBottom: 18, borderBottom: "1px solid #1e293b" },
  iconBox: { width: 36, height: 36, borderRadius: 9, background: "#f9731620", border: "1px solid #f9731440", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 },
  brandMain: { fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.3 },
  brandAI: { fontSize: 15, fontWeight: 800, color: "#f97316", letterSpacing: -0.3 },
  creditBlock: { display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 18, marginBottom: 14, borderBottom: "1px solid #1e293b" },
  ringWrap: { position: "relative", width: 76, height: 76, marginBottom: 8 },
  ringNum: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316", fontWeight: 800, fontSize: 20 },
  ringLbl: { color: "#64748b", fontSize: 11, margin: "0 0 10px" },
  buyBtn: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  nav: { display: "flex", flexDirection: "column", gap: 2, flex: 1 },
  navBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "none", background: "transparent", color: "#64748b", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, width: "100%", textAlign: "left", transition: "all 0.15s" },
  navActive: { background: "#f9731618", color: "#f97316", fontWeight: 700 },
  footer: { borderTop: "1px solid #1e293b", paddingTop: 14, marginTop: 8 },
  footerText: { color: "#334155", fontSize: 11, margin: "0 0 10px" },
  logoutBtn: { background: "#1e293b", border: "1px solid #374151", color: "#64748b", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 12, width: "100%", textAlign: "left" },
};
