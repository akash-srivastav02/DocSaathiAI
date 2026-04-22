export default function TopBar({ user, credits, setShowPricing, onLogout }) {
  return (
    <div style={s.topbar}>
      <div style={s.topbarLeft}>
        <div style={s.mobileLogoRow}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span style={s.brandNameSm}>DocSaathi</span>
        </div>
      </div>
      <div style={s.topbarRight}>
        <div
          style={s.topbarCredits}
          onClick={() => setShowPricing && setShowPricing(true)}
        >
          ⚡ {credits} Credits
        </div>
        <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
      </div>
    </div>
  );
}

const s = {
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: "1px solid #1e293b", background: "#0d1421", position: "sticky", top: 0, zIndex: 10 },
  topbarLeft: { display: "flex", alignItems: "center", gap: 12 },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  topbarCredits: { background: "#f9731620", color: "#f97316", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "1px solid #f9731640" },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 },
  mobileLogoRow: { display: "flex", alignItems: "center", gap: 6 },
  brandNameSm: { fontSize: 18, fontWeight: 800, color: "#f97316" },
};