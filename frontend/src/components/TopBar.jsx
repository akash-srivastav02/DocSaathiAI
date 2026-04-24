import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const ACCOUNT_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Vault", path: "/vault" },
  { label: "Pricing", path: "/pricing" },
  { label: "Support", path: "/support" },
];

export default function TopBar({ user, credits, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(900);
  const firstName = user?.name?.split(" ")[0] || "User";
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

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
        <div style={s.avatarWrap}>
          <button
            type="button"
            style={s.avatarBtn}
            onClick={() => setShowMenu((prev) => !prev)}
            aria-label="Open account menu"
          >
            <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
          </button>

          {showMenu && (
            <div style={{ ...s.accountMenu, ...(isMobile ? s.accountMenuMobile : null) }}>
              <div style={s.accountHead}>
                <p style={s.accountBrand}>Doc Saathi AI</p>
                <p style={s.accountName}>{firstName}</p>
              </div>
              <div style={s.accountLinks}>
                {ACCOUNT_LINKS.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    style={{
                      ...s.accountLink,
                      ...(location.pathname.startsWith(item.path) ? s.accountLinkActive : null),
                    }}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
                {onLogout && (
                  <button type="button" style={s.accountLogout} onClick={onLogout}>
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
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
    padding: "14px 28px",
    borderBottom: "1px solid #1e293b",
    background: "#0a0f1e",
    position: "sticky",
    top: 0,
    zIndex: 10,
    gap: 12,
  },
  topbarMobile: { padding: "12px 16px 12px 62px" },
  left: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  leftMobile: { gap: 10 },
  greeting: { color: "#94a3b8", fontSize: 17, margin: 0, lineHeight: 1.4 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  rightMobile: { gap: 8 },
  mobileIntro: { minWidth: 0, display: "flex", flexDirection: "column", gap: 1 },
  mobileIntroLabel: {
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: -0.2,
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  mobileIntroName: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 600,
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
    padding: "7px 15px",
    cursor: "pointer",
    fontSize: 15,
  },
  creditPillMobile: { padding: "8px 11px", fontSize: 13 },
  avatarWrap: { position: "relative" },
  avatarBtn: { background: "transparent", border: "none", padding: 0, cursor: "pointer" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#f97316,#7c3aed)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 15,
    flexShrink: 0,
  },
  accountMenu: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    width: 190,
    background: "#0d1421",
    border: "1px solid #263246",
    borderRadius: 14,
    boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
    padding: 10,
    zIndex: 30,
  },
  accountMenuMobile: { width: 210 },
  accountHead: { padding: "6px 6px 10px", borderBottom: "1px solid #1e293b", marginBottom: 8 },
  accountBrand: { color: "#f1f5f9", fontSize: 13, fontWeight: 800, margin: 0 },
  accountName: { color: "#94a3b8", fontSize: 12, margin: "4px 0 0" },
  accountLinks: { display: "grid", gap: 6 },
  accountLink: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "transparent",
    color: "#cbd5e1",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  accountLinkActive: { background: "#f9731618", color: "#f97316" },
  accountLogout: {
    width: "100%",
    textAlign: "left",
    border: "1px solid #374151",
    background: "#1e293b",
    color: "#e2e8f0",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
  },
};
