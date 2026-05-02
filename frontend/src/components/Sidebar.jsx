import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import { TOOL_CATEGORIES } from "../utils/toolCatalog";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: "DB" },
  { label: "Pricing", path: "/pricing", icon: "INR" },
  { label: "Contact", path: "/support", icon: "CT" },
];

const EXAM_TOOL_LINKS = [
  { label: "Exam Photo", path: "/tool/photo", icon: "PH" },
  { label: "Exam Signature", path: "/tool/signature", icon: "SG" },
  { label: "Photo + Sign / Date", path: "/merger", icon: "MX" },
  { label: "Custom Image Resizer", path: "/tool/crop", icon: "RS" },
];

export default function Sidebar({
  credits,
  onLogout,
  activeNav,
  planLabel = "Free Tier",
  isUnlimited = false,
  showPlanCard = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(960);
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(TOOL_CATEGORIES.map((group, index) => [group.id, index < 3]))
  );

  const activeLabel =
    activeNav || NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.label || "Dashboard";

  const quickAccess = useMemo(() => TOOL_CATEGORIES[0]?.items || [], []);

  return (
    <>
      {isMobile && (
        <button
          type="button"
          style={s.mobileToggle}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? "✕" : "☰"}
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
        {!isMobile && (
          <button type="button" style={s.brand} onClick={() => navigate("/")}>
            <div style={s.brandIconBox}>
              <img src="/favicon.png" alt="FormFixer logo" style={s.brandIcon} />
            </div>
            <div>
              <div style={s.brandTitle}>FormFixer</div>
              <div style={s.brandSub}>Document toolkit</div>
            </div>
          </button>
        )}

        <nav style={s.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              style={{
                ...s.navBtn,
                ...(activeLabel === item.label ? s.navBtnActive : null),
              }}
              onClick={() => navigate(item.path)}
            >
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {showPlanCard ? (
          <div style={s.creditCard}>
            <div style={s.creditNum}>{planLabel}</div>
            <div style={s.creditLabel}>{isUnlimited ? "Unlimited access active" : `${credits ?? 0} downloads left`}</div>
            <button type="button" style={s.buyBtn} onClick={() => navigate("/pricing")}>
              View Tiers
            </button>
          </div>
        ) : null}

        <div style={s.sectionLabel}>Quick Access</div>
        <div style={s.quickAccess}>
          {quickAccess.map((item) => (
            <button
              key={item.id}
              type="button"
              style={s.quickItem}
              onClick={() => item.route && navigate(item.route)}
            >
              <span style={{ ...s.quickIcon, color: item.accent }}>{item.icon}</span>
              <span style={s.quickText}>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={s.sectionLabel}>Exam Tools</div>
        <div style={s.quickAccess}>
          {EXAM_TOOL_LINKS.map((tool) => (
            <button
              key={tool.path}
              type="button"
              style={{
                ...s.quickItem,
                ...(location.pathname.startsWith(tool.path) ? s.quickItemActive : null),
              }}
              onClick={() => navigate(tool.path)}
            >
              <span style={{ ...s.quickIcon, color: "var(--ff-blue)" }}>{tool.icon}</span>
              <span style={s.quickText}>{tool.label}</span>
            </button>
          ))}
        </div>

        <div style={s.groupWrap}>
          {TOOL_CATEGORIES.slice(1).map((group) => (
            <div key={group.id} style={s.groupCard}>
              <button
                type="button"
                style={s.groupHead}
                onClick={() => setOpenGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
              >
                <span>{group.title}</span>
                <span style={s.groupArrow}>{openGroups[group.id] ? "-" : "+"}</span>
              </button>
              {openGroups[group.id] && (
                <div style={s.groupItems}>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!item.route || item.live === false}
                      style={{
                        ...s.groupItem,
                        ...((!item.route || item.live === false) ? s.groupItemDisabled : null),
                      }}
                      onClick={() => item.route && item.live !== false && navigate(item.route)}
                    >
                      <span style={{ ...s.groupItemIcon, color: item.accent }}>{item.icon}</span>
                      <span style={s.groupItemText}>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {onLogout ? (
          <button type="button" style={s.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        ) : null}
      </aside>
    </>
  );
}

const s = {
  sidebar: {
    width: 292,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: "16px 14px 18px",
    background: "linear-gradient(180deg, color-mix(in srgb, var(--ff-panel-solid) 98%, transparent), color-mix(in srgb, var(--ff-panel-soft) 98%, transparent))",
    borderRight: "1px solid var(--ff-border)",
    height: "100vh",
    position: "sticky",
    top: 0,
    overflowY: "auto",
    zIndex: 20,
  },
  sidebarMobile: {
    position: "fixed",
    left: 0,
    top: 0,
    maxWidth: "88vw",
    width: 292,
    height: "100dvh",
    paddingTop: 84,
    transition: "transform .22s ease",
    boxShadow: "0 28px 70px rgba(2, 6, 23, 0.35)",
    zIndex: 42,
  },
  mobileToggle: {
    position: "fixed",
    top: 12,
    left: 12,
    zIndex: 60,
    width: 42,
    height: 42,
    borderRadius: 12,
    border: "1px solid color-mix(in srgb, var(--ff-orange) 22%, var(--ff-border))",
    background: "linear-gradient(180deg, color-mix(in srgb, var(--ff-panel-solid) 94%, transparent), color-mix(in srgb, var(--ff-panel) 96%, transparent))",
    backdropFilter: "blur(14px)",
    color: "var(--ff-text)",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 18,
    boxShadow: "0 14px 30px rgba(2, 6, 23, 0.22)",
  },
  backdrop: { position: "fixed", inset: 0, background: "rgba(2, 6, 23, 0.68)", zIndex: 41 },
  brand: {
    border: "none",
    background: "transparent",
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    textAlign: "left",
    padding: "6px 4px 12px",
    borderBottom: "1px solid var(--ff-border)",
  },
  brandIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(124,58,237,0.16))",
    border: "1px solid color-mix(in srgb, var(--ff-blue) 24%, transparent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  brandIcon: { width: 28, height: 28, objectFit: "contain" },
  brandTitle: { color: "var(--ff-text)", fontSize: 18, fontWeight: 900, letterSpacing: -0.4 },
  brandSub: { color: "var(--ff-text-soft)", fontSize: 13, marginTop: 2 },
  nav: { display: "grid", gap: 8 },
  navBtn: {
    borderRadius: 14,
    border: "1px solid transparent",
    background: "transparent",
    color: "var(--ff-text-soft)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 12px",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 800,
    textAlign: "left",
  },
  navBtnActive: {
    background: "color-mix(in srgb, var(--ff-panel-soft) 94%, transparent)",
    color: "var(--ff-text)",
    borderColor: "var(--ff-border)",
  },
  navIcon: { minWidth: 28, fontSize: 11, fontWeight: 900, color: "var(--ff-orange)" },
  creditCard: {
    borderRadius: 18,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-solid)",
    padding: "18px 16px",
    display: "grid",
    gap: 8,
    justifyItems: "start",
  },
  creditNum: { color: "var(--ff-orange)", fontSize: 28, lineHeight: 1.1, fontWeight: 900 },
  creditLabel: { color: "var(--ff-text-soft)", fontSize: 13 },
  buyBtn: {
    border: "none",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  },
  sectionLabel: {
    color: "var(--ff-text-faint)",
    fontSize: 11,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  quickAccess: {
    borderRadius: 18,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-solid)",
    padding: "12px",
    display: "grid",
    gap: 6,
  },
  quickItem: {
    border: "none",
    background: "transparent",
    color: "var(--ff-text-soft)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 8px",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
  },
  quickIcon: { minWidth: 28, fontSize: 12, fontWeight: 900 },
  quickText: { fontSize: 14, fontWeight: 700 },
  quickItemActive: {
    background: "color-mix(in srgb, var(--ff-blue) 10%, transparent)",
    color: "var(--ff-text)",
    border: "1px solid color-mix(in srgb, var(--ff-blue) 22%, transparent)",
  },
  groupWrap: { display: "grid", gap: 10, marginTop: 2 },
  groupCard: {
    borderRadius: 18,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-solid)",
    overflow: "hidden",
  },
  groupHead: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "var(--ff-text)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 14px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 900,
    textAlign: "left",
  },
  groupArrow: { color: "var(--ff-text-faint)", fontSize: 16, fontWeight: 700 },
  groupItems: { display: "grid", gap: 2, padding: "0 8px 10px" },
  groupItem: {
    border: "none",
    background: "transparent",
    color: "var(--ff-text-soft)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 8px",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
  },
  groupItemDisabled: { cursor: "default", opacity: 0.58 },
  groupItemIcon: { minWidth: 28, fontSize: 11, fontWeight: 900 },
  groupItemText: { fontSize: 13, fontWeight: 700 },
  logoutBtn: {
    marginTop: "auto",
    borderRadius: 12,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-soft)",
    color: "var(--ff-text)",
    padding: "12px 14px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
};
