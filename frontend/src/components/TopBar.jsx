import { useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

export default function TopBar({ user, credits }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <div style={{ ...s.topbar, ...(isMobile ? s.topbarMobile : null) }}>
      <div style={{ ...s.left, ...(isMobile ? s.leftMobile : null) }}>
        {isMobile && (
          <div style={s.mobileBrandIcon}>
            <img src="/favicon.png" alt="Doc Saathi AI logo" style={s.mobileBrandImage} />
          </div>
        )}
        {isMobile ? (
          <div style={s.mobileIntro}>
            <p style={s.mobileIntroLabel}>Doc Saathi AI</p>
            <p style={s.mobileIntroName}>Welcome, {firstName}</p>
          </div>
        ) : (
          <p style={s.greeting}>
            Welcome, <b style={{ color: "#f1f5f9" }}>{firstName}</b>
          </p>
        )}
      </div>
      <div style={{ ...s.right, ...(isMobile ? s.rightMobile : null) }}>
        <div
          style={{ ...s.creditPill, ...(isMobile ? s.creditPillMobile : null) }}
          onClick={() => navigate("/pricing")}
          title="Buy more credits"
        >
          <span>⚡</span>
          <b style={{ color: "#f97316" }}>{credits ?? 0}</b>
          {!isMobile && <span style={{ color: "#94a3b8", fontSize: 12 }}>Credits</span>}
        </div>
        <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
      </div>
    </div>
  );
}

const s = {
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 24px",
    borderBottom: "1px solid #1e293b",
    background: "#0a0f1e",
    position: "sticky",
    top: 0,
    zIndex: 10,
    gap: 12,
  },
  topbarMobile: { padding: "12px 16px 12px 62px" },
  left: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  leftMobile: { gap: 8 },
  greeting: { color: "#64748b", fontSize: 14, margin: 0 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  rightMobile: { gap: 8 },
  mobileIntro: { minWidth: 0, display: "flex", flexDirection: "column", gap: 1 },
  mobileIntroLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  mobileIntroName: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.35,
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  mobileBrandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "#f9731620",
    border: "1px solid #f9731633",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  mobileBrandImage: { width: 20, height: 20, objectFit: "contain", display: "block" },
  creditPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#f9731614",
    border: "1px solid #f9731630",
    borderRadius: 20,
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: 14,
  },
  creditPillMobile: { padding: "7px 10px", fontSize: 13 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#f97316,#7c3aed)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    flexShrink: 0,
  },
};
