import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import useIsMobile from "../hooks/useIsMobile";
import { HOME_SECTIONS, TOOL_CATEGORIES } from "../utils/toolCatalog";

function ToolCard({ item, onOpen, compact = false }) {
  const [hovered, setHovered] = useState(false);
  const clickable = Boolean(item.route && item.live !== false);

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onOpen(item.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...s.toolCard,
        ...(compact ? s.toolCardCompact : null),
        ...(clickable ? s.toolCardClickable : s.toolCardDisabled),
        borderColor: hovered && clickable ? `${item.accent}44` : "var(--ff-border)",
        boxShadow: hovered && clickable ? `0 20px 42px ${item.accent}14` : "none",
        transform: hovered && clickable ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div style={s.toolCardTop}>
        <span style={{ ...s.toolIcon, background: `${item.accent}14`, color: item.accent }}>
          {item.icon}
        </span>
        {!item.live && <span style={s.soonBadge}>Coming Soon</span>}
      </div>
      <h3 style={{ ...s.toolTitle, ...(compact ? s.toolTitleCompact : null) }}>{item.label}</h3>
      <p style={{ ...s.toolDesc, ...(compact ? s.toolDescCompact : null) }}>{item.desc}</p>
      <span style={{ ...s.toolFooter, color: clickable ? item.accent : "var(--ff-text-faint)" }}>
        {clickable ? "Open tool" : "Listed for upcoming release"}
      </span>
    </button>
  );
}

function Section({ section, navigate, compact = false }) {
  return (
    <section style={s.section}>
      <div style={s.sectionHead}>
        <div>
          <h2 style={s.sectionTitle}>{section.title}</h2>
          {section.subtitle && <p style={s.sectionSub}>{section.subtitle}</p>}
        </div>
        {section.viewAllLabel && <span style={s.viewAll}>{section.viewAllLabel}</span>}
      </div>

      <div style={{ ...s.cardGrid, ...(compact ? s.cardGridCompact : null) }}>
        {section.items.map((item) => (
          <ToolCard key={item.id} item={item} onOpen={navigate} compact={compact} />
        ))}
      </div>

      {section.pills?.length ? (
        <div style={s.pillRow}>
          {section.pills.map((pill) => (
            <button key={pill.label} type="button" style={s.kbPill} onClick={() => navigate(pill.route)}>
              {pill.label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function Dashboard() {
  const { user, credits, logout } = useStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
  const currentCredits = user ? credits ?? user?.credits ?? 0 : 0;
  const allToolCount = useMemo(
    () => TOOL_CATEGORIES.reduce((sum, category) => sum + category.items.length, 0),
    []
  );

  return (
    <div style={s.root}>
      {user ? (
        <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} activeNav="All Tools" />
      ) : null}

      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : null}

        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : null) }}>
          <section style={s.heroBand}>
            <div style={s.heroCopy}>
              <span style={s.heroBadge}>Complete Document Toolkit</span>
              <h1 style={{ ...s.heroTitle, ...(isMobile ? s.heroTitleMobile : null) }}>
                Welcome to FormFixer Tool Hub
              </h1>
              <p style={s.heroText}>
                Your all-in-one document toolkit for exam photo resize, PDF compression,
                image conversion, signature fixes, and upload-ready browser tools.
              </p>
            </div>
            <div style={s.heroStats}>
              <div style={s.statTile}>
                <strong style={s.statNum}>{allToolCount}+</strong>
                <span style={s.statLabel}>Mapped tools</span>
              </div>
              <div style={s.statTile}>
                <strong style={s.statNum}>{currentCredits}</strong>
                <span style={s.statLabel}>Credits</span>
              </div>
            </div>
          </section>

          {HOME_SECTIONS.map((section) => (
            <Section key={section.id} section={section} navigate={navigate} compact={isMobile} />
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "transparent",
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: { flex: 1, minWidth: 0, overflowX: "hidden" },
  content: {
    maxWidth: 1220,
    margin: "0 auto",
    padding: "28px 24px 56px",
    display: "flex",
    flexDirection: "column",
    gap: 30,
  },
  contentMobile: { padding: "18px 14px 44px", gap: 24 },
  heroBand: {
    display: "flex",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    padding: "28px",
    borderRadius: 22,
    background: "linear-gradient(135deg, #2563eb, #7c3aed 58%, #db2777)",
    color: "#fff",
    boxShadow: "0 26px 60px rgba(37, 99, 235, 0.24)",
  },
  heroCopy: { display: "flex", flexDirection: "column", gap: 10, maxWidth: 720 },
  heroBadge: {
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.2)",
    fontSize: 12,
    fontWeight: 800,
  },
  heroTitle: { margin: 0, fontSize: 46, lineHeight: 1.05, fontWeight: 900, letterSpacing: -1.6 },
  heroTitleMobile: { fontSize: 32, lineHeight: 1.08, letterSpacing: -0.8 },
  heroText: { margin: 0, fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.9)" },
  heroStats: { display: "grid", gap: 12, minWidth: 180, alignContent: "start" },
  statTile: {
    padding: "18px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.18)",
    display: "grid",
    gap: 6,
  },
  statNum: { fontSize: 34, lineHeight: 1, fontWeight: 900 },
  statLabel: { fontSize: 13, color: "rgba(255,255,255,0.86)" },
  section: { display: "grid", gap: 16 },
  sectionHead: { display: "flex", alignItems: "end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  sectionTitle: { margin: 0, color: "var(--ff-text)", fontSize: 34, lineHeight: 1.06, fontWeight: 900, letterSpacing: -0.8 },
  sectionSub: { margin: "6px 0 0", color: "var(--ff-text-soft)", fontSize: 15, lineHeight: 1.7 },
  viewAll: { color: "var(--ff-blue)", fontSize: 14, fontWeight: 800 },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 },
  cardGridCompact: { gridTemplateColumns: "1fr 1fr" },
  toolCard: {
    borderRadius: 18,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-solid)",
    padding: "18px 18px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    textAlign: "left",
    transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
  },
  toolCardCompact: { minHeight: 188 },
  toolCardClickable: { cursor: "pointer" },
  toolCardDisabled: { cursor: "default", opacity: 0.94 },
  toolCardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  toolIcon: {
    minWidth: 44,
    height: 44,
    padding: "0 10px",
    borderRadius: 13,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 0.2,
  },
  soonBadge: {
    padding: "4px 8px",
    borderRadius: 999,
    background: "color-mix(in srgb, var(--ff-orange) 10%, transparent)",
    color: "var(--ff-orange)",
    border: "1px solid color-mix(in srgb, var(--ff-orange) 24%, transparent)",
    fontSize: 10,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  toolTitle: { margin: 0, color: "var(--ff-text)", fontSize: 22, lineHeight: 1.18, fontWeight: 900, letterSpacing: -0.5 },
  toolTitleCompact: { fontSize: 18 },
  toolDesc: { margin: 0, color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.65, minHeight: 46 },
  toolDescCompact: { fontSize: 13 },
  toolFooter: { marginTop: "auto", fontSize: 13, fontWeight: 800 },
  pillRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  kbPill: {
    borderRadius: 18,
    border: "1px solid var(--ff-border)",
    background: "var(--ff-panel-solid)",
    color: "var(--ff-text)",
    padding: "14px 22px",
    fontSize: 30,
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: -0.8,
  },
};
