import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "DB", path: "/dashboard" },
  { label: "Vault", icon: "VT", path: "/vault" },
  { label: "Pricing", icon: "INR", path: "/pricing" },
  { label: "Support", icon: "SP", path: "/support" },
];

const MOBILE_TOOL_SECTIONS = [
  {
    title: "Exam",
    items: [
      { label: "Exam Photo", icon: "PH", path: "/tool/photo" },
      { label: "Exam Signature", icon: "SG", path: "/tool/signature" },
      { label: "Photo + Sign / Date", icon: "MX", path: "/merger" },
      { label: "Document Size Changer", icon: "PDF", path: "/pdf/compress" },
    ],
  },
  {
    title: "Document & Utility",
    items: [
      { label: "AI Background Remover", icon: "BG", path: "/tool/bgremove" },
      { label: "Crop & Resize", icon: "CR", path: "/tool/crop" },
      { label: "Image Compressor", icon: "IM", path: "/tool/imgcompress" },
      { label: "PDF Compressor", icon: "PC", path: "/pdf/compress" },
    ],
  },
];

export default function Sidebar({ credits, onLogout, activeNav }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(900);
  const [isOpen, setIsOpen] = useState(false);

  const activeLabel =
    activeNav || NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.label || "Dashboard";

  const ringPct = Math.min((credits || 0) / 100, 1);
  const circumference = 2 * Math.PI * 26;

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, location.pathname]);

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          style={s.mobileToggle}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? "×" : "☰"}
        </button>
      )}

      {isMobile && isOpen && <div style={s.backdrop} onClick={() => setIsOpen(false)} />}

      <aside
        style={{
          ...s.sidebar,
          ...(isMobile ? s.sidebarMobile : null),
          transform: isMobile ? (isOpen ? "translateX(0)" : "translateX(-110%)") : "translateX(0)",
        }}
      >
        {!isMobile ? (
          <>
            <div style={s.brand}>
              <div style={s.iconBox}>
                <img src="/favicon.png" alt="FormFixer logo" style={s.iconImage} />
              </div>
              <div>
                <span style={s.brandMain}>FormFixer</span>
              </div>
            </div>

            <div style={s.creditBlock}>
              <div style={s.ringWrap}>
                <svg width="76" height="76" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#1e293b" strokeWidth="5" />
                  <circle
                    cx="30"
                    cy="30"
                    r="26"
                    fill="none"
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
              <p style={s.ringLbl}>Credits Remaining</p>
              <button style={s.buyBtn} onClick={() => navigate("/pricing")}>
                + Buy Credits
              </button>
            </div>
          </>
        ) : null}

        {isMobile ? (
          <div style={s.mobileToolWrap}>
            <div style={s.mobileSection}>
              <p style={s.mobileSectionLabel}>Tools</p>
              <p style={s.mobileSectionSub}>Choose a tool category and continue.</p>
            </div>

            <div style={s.mobileToolSections}>
              {MOBILE_TOOL_SECTIONS.map((section) => (
                <div key={section.title} style={s.toolSection}>
                  <p style={s.toolSectionTitle}>{section.title}</p>
                  <div style={s.toolList}>
                    {section.items.map(({ label, icon, path }) => (
                      <button
                        key={label}
                        style={{
                          ...s.toolBtn,
                          ...(location.pathname.startsWith(path) ? s.toolBtnActive : null),
                        }}
                        onClick={() => navigate(path)}
                      >
                        <span style={s.toolBtnIcon}>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <nav style={s.nav}>
            {NAV_ITEMS.map(({ label, icon, path }) => (
              <button
                key={label}
                style={{ ...s.navBtn, ...(activeLabel === label ? s.navActive : null) }}
                onClick={() => navigate(path)}
              >
                <span style={s.navBtnIcon}>{icon}</span>
                {label}
              </button>
            ))}
          </nav>
        )}

        <div style={s.footer}>
          {isMobile ? (
            <>
              <p style={s.mobileSectionLabel}>Quick Action</p>
              <div style={s.mobileActionStack}>
                <button style={{ ...s.buyBtn, width: "100%" }} onClick={() => navigate("/pricing")}>
                  + Buy Credits
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={s.footerText}>Smarter than Cyber Cafe</p>
              {onLogout && (
                <button onClick={onLogout} style={s.logoutBtn}>
                  Logout
                </button>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

const s = {
  sidebar: {
    width: 220,
    background: "#0a0f1e",
    borderRight: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
    padding: "18px 14px",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    zIndex: 20,
    boxSizing: "border-box",
  },
  sidebarMobile: {
    position: "fixed",
    left: 0,
    top: 0,
    width: 268,
    maxWidth: "84vw",
    height: "100dvh",
    padding: "82px 14px 24px",
    transition: "transform 0.24s ease",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
    zIndex: 42,
  },
  mobileToggle: {
    position: "fixed",
    top: 14,
    left: 12,
    zIndex: 44,
    width: 40,
    height: 40,
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#f8fafc",
    fontSize: 19,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.68)",
    zIndex: 41,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingBottom: 18,
    marginBottom: 18,
    borderBottom: "1px solid #1e293b",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: "#f9731620",
    border: "1px solid #f9731440",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  iconImage: { width: 24, height: 24, objectFit: "contain", display: "block" },
  brandMain: { fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.3 },
  mobileSection: { paddingBottom: 12, marginBottom: 10, borderBottom: "1px solid #1e293b" },
  mobileSectionLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    margin: "0 0 5px",
  },
  mobileSectionSub: { color: "#64748b", fontSize: 13, lineHeight: 1.5, margin: 0 },
  mobileToolWrap: { display: "flex", flexDirection: "column", gap: 12, flex: 1 },
  mobileToolSections: { display: "flex", flexDirection: "column", gap: 16 },
  toolSection: { display: "flex", flexDirection: "column", gap: 9 },
  toolSectionTitle: { color: "#f1f5f9", fontSize: 13, fontWeight: 800, margin: 0 },
  toolList: { display: "grid", gap: 8 },
  toolBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 12px",
    border: "1px solid #1e293b",
    background: "#0f172a",
    color: "#cbd5e1",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    textAlign: "left",
    width: "100%",
  },
  toolBtnActive: { borderColor: "#f9731650", background: "#f9731618", color: "#f97316" },
  toolBtnIcon: {
    width: 28,
    minWidth: 28,
    textAlign: "center",
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 800,
    color: "inherit",
    letterSpacing: 0.2,
  },
  creditBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: 18,
    marginBottom: 14,
    borderBottom: "1px solid #1e293b",
  },
  ringWrap: { position: "relative", width: 76, height: 76, marginBottom: 8 },
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
  ringLbl: { color: "#64748b", fontSize: 11, margin: "0 0 10px" },
  buyBtn: {
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 18px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  nav: { display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 13px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    width: "100%",
    textAlign: "left",
    transition: "all 0.15s",
  },
  navBtnIcon: {
    width: 26,
    minWidth: 26,
    textAlign: "center",
    fontSize: 11,
    fontWeight: 800,
    color: "inherit",
  },
  navActive: { background: "#f9731618", color: "#f97316", fontWeight: 700 },
  footer: { borderTop: "1px solid #1e293b", paddingTop: 14, marginTop: "auto", paddingBottom: 18, flexShrink: 0 },
  footerText: { color: "#334155", fontSize: 11, margin: "0 0 10px" },
  mobileActionStack: { display: "grid", gap: 10 },
  logoutBtn: {
    background: "#1e293b",
    border: "1px solid #374151",
    color: "#cbd5e1",
    borderRadius: 8,
    padding: "10px 12px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    width: "100%",
    textAlign: "left",
  },
};
