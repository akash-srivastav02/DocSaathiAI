import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import useTheme from "../hooks/useTheme";

const ACCOUNT_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Tracker", path: "/tracker" },
  { label: "Pricing", path: "/pricing" },
  { label: "Support", path: "/support" },
];

export default function TopBar({ user, credits, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(900);
  const { theme, isDark, toggleTheme } = useTheme();
  const firstName = user?.name?.split(" ")[0] || "User";
  const [showMenu, setShowMenu] = useState(false);
  const t = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  return (
    <div style={{ ...s.topbar, ...t.topbar, ...(isMobile ? s.topbarMobile : null) }}>
      <div style={{ ...s.left, ...(isMobile ? s.leftMobile : null) }}>
        {isMobile && (
          <div style={{ ...s.mobileBrandIcon, ...t.mobileBrandIcon }}>
            <img src="/favicon.png" alt="FormFixer logo" style={s.mobileBrandImage} />
          </div>
        )}
        {isMobile ? (
          <div style={s.mobileIntro}>
            <p style={{ ...s.mobileIntroLabel, ...t.mobileIntroLabel }}>FormFixer</p>
            <p style={{ ...s.mobileIntroName, ...t.mobileIntroName }}>Welcome, {firstName}</p>
          </div>
        ) : (
          <p style={{ ...s.greeting, ...t.greeting }}>
            Welcome, <b style={t.greetingStrong}>{firstName}</b>
          </p>
        )}
      </div>

      <div style={{ ...s.right, ...(isMobile ? s.rightMobile : null) }}>
        <button type="button" style={{ ...s.themeBtn, ...t.themeBtn }} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "☼" : "☾"}
        </button>

        <div
          style={{ ...s.creditPill, ...t.creditPill, ...(isMobile ? s.creditPillMobile : null) }}
          onClick={() => navigate("/pricing")}
          title="Buy more credits"
        >
          <span>⚡</span>
          <b style={{ color: "#f97316" }}>{credits ?? 0}</b>
          {!isMobile && <span style={{ ...s.creditLabel, ...t.creditLabel }}>Credits</span>}
        </div>

        <div style={s.avatarWrap}>
          <button
            type="button"
            style={s.avatarBtn}
            onClick={() => setShowMenu((prev) => !prev)}
            aria-label="Open account menu"
          >
            <div style={{ ...s.avatar, ...t.avatar }}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
          </button>

          {showMenu && (
            <div style={{ ...s.accountMenu, ...t.accountMenu, ...(isMobile ? s.accountMenuMobile : null) }}>
              <div style={{ ...s.accountHead, ...t.accountHead }}>
                <p style={{ ...s.accountBrand, ...t.accountBrand }}>FormFixer</p>
                <p style={{ ...s.accountName, ...t.accountName }}>{firstName}</p>
              </div>
              <div style={s.accountLinks}>
                {ACCOUNT_LINKS.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    style={{
                      ...s.accountLink,
                      ...t.accountLink,
                      ...(location.pathname.startsWith(item.path) ? s.accountLinkActive : null),
                      ...(location.pathname.startsWith(item.path) ? t.accountLinkActive : null),
                    }}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
                {onLogout && (
                  <button type="button" style={{ ...s.accountLogout, ...t.accountLogout }} onClick={onLogout}>
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
    position: "sticky",
    top: 0,
    zIndex: 10,
    gap: 12,
  },
  topbarMobile: { padding: "12px 16px 12px 62px" },
  left: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  leftMobile: { gap: 10 },
  greeting: { fontSize: 17, margin: 0, lineHeight: 1.4 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  rightMobile: { gap: 8 },
  mobileIntro: { minWidth: 0, display: "flex", flexDirection: "column", gap: 1 },
  mobileIntroLabel: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: -0.2,
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  mobileIntroName: {
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  mobileBrandImage: { width: 20, height: 20, objectFit: "contain", display: "block" },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 15,
  },
  creditPill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    padding: "7px 15px",
    cursor: "pointer",
    fontSize: 15,
  },
  creditPillMobile: { padding: "8px 11px", fontSize: 13 },
  creditLabel: { fontSize: 12 },
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
    borderRadius: 14,
    padding: 10,
    zIndex: 30,
  },
  accountMenuMobile: { width: 210 },
  accountHead: { padding: "6px 6px 10px", marginBottom: 8 },
  accountBrand: { fontSize: 13, fontWeight: 800, margin: 0 },
  accountName: { fontSize: 12, margin: "4px 0 0" },
  accountLinks: { display: "grid", gap: 6 },
  accountLink: {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "transparent",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  accountLinkActive: {},
  accountLogout: {
    width: "100%",
    textAlign: "left",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
  },
};

const darkTheme = {
  topbar: {
    borderBottom: "1px solid rgba(79,97,130,0.18)",
    background: "linear-gradient(180deg, rgba(10,15,30,0.88), rgba(13,20,33,0.76))",
    backdropFilter: "blur(18px)",
  },
  mobileBrandIcon: { background: "#f9731620", border: "1px solid #f9731633" },
  mobileIntroLabel: { color: "#f1f5f9" },
  mobileIntroName: { color: "#94a3b8" },
  greeting: { color: "#94a3b8" },
  greetingStrong: { color: "#f1f5f9" },
  themeBtn: { color: "#e2e8f0", background: "#111827", borderColor: "#334155" },
  creditPill: { background: "#f9731614", border: "1px solid #f9731630" },
  creditLabel: { color: "#94a3b8" },
  avatar: { boxShadow: "0 10px 28px rgba(124, 58, 237, 0.24)" },
  accountMenu: { background: "#0d1421", border: "1px solid #263246", boxShadow: "0 18px 40px rgba(0,0,0,0.35)" },
  accountHead: { borderBottom: "1px solid #1e293b" },
  accountBrand: { color: "#f1f5f9" },
  accountName: { color: "#94a3b8" },
  accountLink: { color: "#cbd5e1" },
  accountLinkActive: { background: "#f9731618", color: "#f97316" },
  accountLogout: { border: "1px solid #374151", background: "#1e293b", color: "#e2e8f0" },
};

const lightTheme = {
  topbar: {
    borderBottom: "1px solid rgba(133, 99, 66, 0.14)",
    background: "linear-gradient(180deg, rgba(255,250,242,0.88), rgba(255,253,248,0.76))",
    backdropFilter: "blur(18px)",
  },
  mobileBrandIcon: { background: "rgba(216, 90, 6, 0.08)", border: "1px solid rgba(216, 90, 6, 0.18)" },
  mobileIntroLabel: { color: "#162033" },
  mobileIntroName: { color: "#6b7789" },
  greeting: { color: "#6b7789" },
  greetingStrong: { color: "#162033" },
  themeBtn: { color: "#162033", background: "#fff", borderColor: "rgba(133, 99, 66, 0.15)" },
  creditPill: { background: "rgba(216, 90, 6, 0.08)", border: "1px solid rgba(216, 90, 6, 0.18)" },
  creditLabel: { color: "#64748b" },
  avatar: { boxShadow: "0 10px 28px rgba(216, 90, 6, 0.16)" },
  accountMenu: { background: "#fffdf8", border: "1px solid rgba(133, 99, 66, 0.16)", boxShadow: "0 18px 40px rgba(148, 163, 184, 0.22)" },
  accountHead: { borderBottom: "1px solid rgba(133, 99, 66, 0.12)" },
  accountBrand: { color: "#162033" },
  accountName: { color: "#6b7789" },
  accountLink: { color: "#334155" },
  accountLinkActive: { background: "rgba(216, 90, 6, 0.08)", color: "#d85a06" },
  accountLogout: { border: "1px solid rgba(133, 99, 66, 0.16)", background: "#f5efe6", color: "#233148" },
};
