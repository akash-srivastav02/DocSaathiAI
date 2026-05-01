import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import useIsMobile from "../hooks/useIsMobile";

const EXAM_TOOLS = [
  {
    id: "photo",
    icon: "📸",
    label: "Exam Photo",
    credit: 2,
    color: "#3b82f6",
    route: "/tool/photo",
    tag: "Most Used",
    tagColor: "#22c55e",
    desc: "Resize and compress to exact portal spec.",
  },
  {
    id: "sign",
    icon: "✍️",
    label: "Exam Signature",
    credit: 2,
    color: "#8b5cf6",
    route: "/tool/signature",
    tag: null,
    desc: "Format signature for any exam form.",
  },
  {
    id: "merger",
    icon: "🪪",
    label: "Photo + Sign / Date",
    credit: 6,
    color: "#f59e0b",
    route: "/merger",
    tag: "New",
    tagColor: "#f97316",
    desc: "Merge photo, signature and date in one output.",
  },
  {
    id: "docsize",
    icon: "📐",
    label: "Document Size Changer",
    credit: 2,
    color: "#f97316",
    route: "/pdf/compress",
    tag: null,
    desc: "Compress PDF to exact KB or MB limits.",
  },
];

const OTHER_TOOLS = [
  {
    id: "crop",
    icon: "✂️",
    label: "Crop & Resize",
    credit: 2,
    color: "#ec4899",
    route: "/tool/crop",
    desc: "Circle, square and manual crop with zoom.",
    soon: false,
  },
  {
    id: "imgcompress",
    icon: "🗜️",
    label: "Image Compressor",
    credit: 2,
    color: "#06b6d4",
    route: "/tool/imgcompress",
    desc: "Reduce JPG or PNG size to target KB.",
    soon: false,
  },
  {
    id: "pdfcompress",
    icon: "📦",
    label: "PDF Compressor",
    credit: 2,
    color: "#a78bfa",
    route: "/pdf/compress",
    desc: "Shrink PDF to your required upload size.",
    soon: false,
  },
  {
    id: "imgtopdf",
    icon: "🧾",
    label: "Image to PDF",
    credit: 2,
    color: "#14b8a6",
    route: "/pdf/image-to-pdf",
    desc: "Convert multiple images into one clean PDF.",
    soon: false,
  },
  {
    id: "pdfeditor",
    icon: "📝",
    label: "PDF Editor",
    credit: 2,
    color: "#ef4444",
    route: "/tool/pdfeditor",
    desc: "Edit admit cards and other PDF text.",
    soon: true,
  },
  {
    id: "resume",
    icon: "📄",
    label: "Resume Builder",
    credit: 2,
    color: "#22c55e",
    route: "/tool/resume",
    desc: "Templates for jobs and internships.",
    soon: true,
  },
  {
    id: "converter",
    icon: "🔄",
    label: "PDF Converter",
    credit: 2,
    color: "#64748b",
    route: null,
    desc: "PDF to Word, JPG, PNG and more.",
    soon: true,
  },
];

const creditLabel = (credit) => `${credit} cr`;

function ExamCard({ tool, onClick, compact }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...s.examCard,
        ...(compact ? s.examCardCompact : null),
        borderColor: isHovered ? tool.color : "#1e293b",
        boxShadow: isHovered ? `0 10px 24px ${tool.color}22` : "none",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onClick={() => onClick(tool.route)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={s.examTop}>
        <div style={{ ...s.examIcon, background: `${tool.color}18`, color: tool.color }}>{tool.icon}</div>
        {tool.tag && (
          <span
            style={{
              ...s.examTag,
              background: `${tool.tagColor}20`,
              color: tool.tagColor,
              border: `1px solid ${tool.tagColor}44`,
            }}
          >
            {tool.tag}
          </span>
        )}
      </div>

      <p style={{ ...s.examLabel, ...(compact ? s.examLabelCompact : null) }}>{tool.label}</p>
      <p style={{ ...s.examDesc, ...(compact ? s.examDescCompact : null) }}>{tool.desc}</p>

      <div style={s.examFooter}>
        <span style={{ ...s.chip, color: tool.color, borderColor: `${tool.color}40` }}>
          {creditLabel(tool.credit)}
        </span>
        <span style={{ color: tool.color, fontWeight: 800, fontSize: compact ? 17 : 16 }}>→</span>
      </div>
    </div>
  );
}

function OtherCard({ tool, onClick, compact }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...s.otherCard,
        ...(compact ? s.otherCardCompact : null),
        borderColor: isHovered && !tool.soon ? tool.color : "#1e293b",
        boxShadow: isHovered && !tool.soon ? `0 8px 18px ${tool.color}18` : "none",
        opacity: tool.soon ? 0.56 : 1,
        cursor: tool.soon ? "default" : "pointer",
      }}
      onClick={() => !tool.soon && tool.route && onClick(tool.route)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ ...s.otherIcon, background: `${tool.color}18`, color: tool.color }}>{tool.icon}</div>
      <div style={s.otherBody}>
        <div style={s.otherRow}>
          <p style={{ ...s.otherLabel, ...(compact ? s.otherLabelCompact : null) }}>{tool.label}</p>
          {tool.soon && <span style={s.soonBadge}>Soon</span>}
        </div>
        <p style={{ ...s.otherDesc, ...(compact ? s.otherDescCompact : null) }}>{tool.desc}</p>
      </div>
      <span style={{ ...s.chipSm, color: tool.color, borderColor: `${tool.color}40` }}>
        {creditLabel(tool.credit)}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user, credits, logout } = useStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
  const currentCredits = user ? (credits ?? user?.credits ?? 0) : 0;
  const firstName = user?.name?.split(" ")[0] || "Guest";
  const isGuest = !user;

  return (
    <div style={s.root}>
      {user && (
        <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
      )}
      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : (
          <div style={s.guestBar}>
            <span>Explore FormFixer freely. Login only when you need to unlock downloads.</span>
              <button style={s.guestLoginBtn} onClick={() => navigate("/auth")}>
                Login / Sign Up
              </button>
          </div>
        )}
        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : null) }}>
          <div style={{ ...s.welcomeRow, ...(isMobile ? s.welcomeRowMobile : null) }}>
            <div>
              <h2 style={{ ...s.welcomeTitle, ...(isMobile ? s.welcomeTitleMobile : null) }}>
                {isMobile
                  ? "Choose a tool"
                  : user
                    ? `Namaste, ${firstName}`
                    : "Choose a tool"}
              </h2>
              <p style={{ ...s.welcomeSub, ...(isMobile ? s.welcomeSubMobile : null) }}>
                {isMobile
                  ? "Open any tool below and continue in seconds."
                  : user
                    ? "Pick the tool you need and prepare your documents quickly."
                    : "Explore tools, generate previews, and login only when you download."}
              </p>
            </div>
            <div
              style={{ ...s.creditCard, ...(isMobile ? s.creditCardMobile : null) }}
              onClick={() => navigate("/pricing")}
            >
              <span style={{ fontSize: 22 }}>⚡</span>
              <span style={s.creditNum}>{currentCredits}</span>
              <span style={s.creditLbl}>Credits</span>
            </div>
          </div>

          {user && currentCredits <= 5 && (
            <div style={s.lowBanner}>
              Warning: Only <b>{currentCredits} credits</b> left.{" "}
              <span style={s.link} onClick={() => navigate("/pricing")}>Buy a plan →</span>
            </div>
          )}

          <section>
            <div style={s.secHead}>
              <div style={s.secHeadLeft}>
                <span style={{ fontSize: 18 }}>📋</span>
                <div>
                  <h2 style={s.secTitle}>Exam Tools</h2>
                  <p style={s.secSub}>Photo, signature and form-ready outputs for exam portals.</p>
                </div>
              </div>
            </div>
            <div style={{ ...s.examGrid, ...(isMobile ? s.examGridMobile : null) }}>
              {EXAM_TOOLS.map((tool) => (
                <ExamCard key={tool.id} tool={tool} onClick={navigate} compact={isMobile} />
              ))}
            </div>
          </section>

          <section>
            <div style={s.secHead}>
              <div style={s.secHeadLeft}>
                <span style={{ fontSize: 18 }}>📦</span>
                <div>
                  <h2 style={s.secTitle}>Document & Utility Tools</h2>
                  <p style={s.secSub}>Crop, compress and clean files for quick submissions.</p>
                </div>
              </div>
            </div>
            <div style={{ ...s.otherGrid, ...(isMobile ? s.otherGridMobile : null) }}>
              {OTHER_TOOLS.map((tool) => (
                <OtherCard key={tool.id} tool={tool} onClick={navigate} compact={isMobile} />
              ))}
            </div>
          </section>

          <div style={s.strip}>
            <b>FormFixer vs Cyber Cafe:</b> They often charge Rs.20-Rs.50 for one small task. You can
            do the same work here faster, from home, and even late at night.
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "transparent", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 48, minWidth: 0 },
  content: {
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    maxWidth: 1120,
    width: "100%",
    boxSizing: "border-box",
  },
  contentMobile: { padding: "16px", gap: 18 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },
  guestBar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "20px 28px 0", color: "#94a3b8", fontSize: 13, flexWrap: "wrap" },
  guestLoginBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 999, padding: "10px 16px", fontWeight: 700, cursor: "pointer" },

  welcomeRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" },
  welcomeRowMobile: { alignItems: "stretch" },
  welcomeTitle: { color: "#f1f5f9", fontSize: 24, fontWeight: 800, margin: 0, lineHeight: 1.2 },
  welcomeTitleMobile: { fontSize: 18, lineHeight: 1.25 },
  welcomeSub: { color: "#64748b", fontSize: 15, marginTop: 6, lineHeight: 1.5 },
  welcomeSubMobile: { fontSize: 14, lineHeight: 1.45, marginTop: 6 },
  creditCard: {
    background: "#0d1421",
    border: "1px solid #1e293b",
    borderRadius: 12,
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: 9,
    cursor: "pointer",
  },
  creditCardMobile: { width: "100%", justifyContent: "center", padding: "12px 16px" },
  creditCardGuest: { borderColor: "#334155" },
  creditNum: { color: "#f97316", fontWeight: 900, fontSize: 24 },
  creditLbl: { color: "#64748b", fontSize: 13 },

  lowBanner: {
    background: "#7c2d1220",
    border: "1px solid #7c2d12",
    borderRadius: 10,
    padding: "10px 16px",
    color: "#fca57a",
    fontSize: 13,
  },

  secHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" },
  secHeadLeft: { display: "flex", alignItems: "flex-start", gap: 10 },
  secTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: "0 0 3px" },
  secSub: { color: "#64748b", fontSize: 14, margin: 0, lineHeight: 1.55 },

  examGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 },
  examGridMobile: { gridTemplateColumns: "1fr" },
  examCard: {
    background: "#0d1421",
    border: "1px solid",
    borderRadius: 13,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
    minHeight: 176,
    boxSizing: "border-box",
  },
  examCardCompact: { minHeight: 138, padding: 14 },
  examTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 },
  examTag: { borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" },
  examIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  examLabel: { color: "#f1f5f9", fontWeight: 700, fontSize: 16, margin: "0 0 6px" },
  examLabelCompact: { fontSize: 18, lineHeight: 1.25, marginBottom: 8 },
  examDesc: { color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.6, flex: 1 },
  examDescCompact: { fontSize: 14, lineHeight: 1.55 },
  examFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  chip: { fontSize: 12, fontWeight: 700, border: "1px solid", borderRadius: 6, padding: "4px 10px" },

  otherGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 },
  otherGridMobile: { gridTemplateColumns: "1fr" },
  otherCard: {
    background: "#0d1421",
    border: "1px solid",
    borderRadius: 12,
    padding: "14px 15px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    transition: "box-shadow 0.15s ease, border-color 0.15s ease",
    minHeight: 74,
    boxSizing: "border-box",
  },
  otherCardCompact: { padding: "14px 15px", minHeight: 78, gap: 12 },
  otherIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 },
  otherBody: { flex: 1, minWidth: 0 },
  otherRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" },
  otherLabel: { color: "#f1f5f9", fontWeight: 700, fontSize: 14, margin: 0 },
  otherLabelCompact: { fontSize: 15 },
  otherDesc: { color: "#64748b", fontSize: 12, margin: 0, lineHeight: 1.45 },
  otherDescCompact: { fontSize: 13, lineHeight: 1.45 },
  soonBadge: { background: "#1e293b", color: "#64748b", fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "1px 6px", flexShrink: 0 },
  chipSm: { fontSize: 11, fontWeight: 700, border: "1px solid", borderRadius: 5, padding: "3px 7px", flexShrink: 0, whiteSpace: "nowrap" },

  strip: {
    background: "#052e1618",
    border: "1px solid #14532d44",
    borderRadius: 12,
    padding: "14px 18px",
    color: "#86efac",
    fontSize: 13,
    lineHeight: 1.6,
  },
};
