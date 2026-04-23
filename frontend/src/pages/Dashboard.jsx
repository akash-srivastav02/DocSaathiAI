import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const EXAM_TOOLS = [
  { id: "photo",   icon: "📸", label: "Exam Photo",          credit: 3, color: "#3b82f6", route: "/tool/photo",   tag: "Most Used", tagColor: "#22c55e", desc: "Resize & compress to exact portal spec" },
  { id: "sign",    icon: "✍️", label: "Exam Signature",      credit: 2, color: "#8b5cf6", route: "/tool/signature",tag: null, desc: "Format signature for any exam form" },
  { id: "merger",  icon: "🪪", label: "Photo + Sign / Date", credit: 6, color: "#f59e0b", route: "/merger",       tag: "New", tagColor: "#f97316", desc: "Merge photo, signature & date in one" },
  { id: "docsize", icon: "📐", label: "Document Size Changer",credit: 4, color: "#f97316", route: "/pdf/compress", tag: null, desc: "Compress PDF to exact KB/MB for portal" },
];

const OTHER_TOOLS = [
  { id: "crop",        icon: "✂️", label: "Crop & Resize",    credit: 1,     color: "#ec4899", route: "/tool/crop",        desc: "Crop any image with ratio lock", soon: false },
  { id: "imgcompress", icon: "🗜️", label: "Image Compressor", credit: 1,     color: "#06b6d4", route: "/tool/imgcompress", desc: "Compress JPG/PNG to target KB size", soon: false },
  { id: "pdfcompress", icon: "📦", label: "PDF Compressor",   credit: 1,     color: "#a78bfa", route: "/pdf/compress",     desc: "Shrink PDF to any KB or MB target", soon: false },
  { id: "pdfeditor",   icon: "📝", label: "PDF Editor",       credit: 2,     color: "#ef4444", route: "/tool/pdfeditor",   desc: "Edit Admit Cards, add text to PDFs", soon: false },
  { id: "resume",      icon: "📄", label: "Resume Builder",   credit: "1–3", color: "#22c55e", route: "/tool/resume",      desc: "Templates for govt & private jobs", soon: false },
  { id: "converter",   icon: "🔄", label: "PDF Converter",    credit: 2,     color: "#64748b", route: null,                desc: "PDF ↔ Word, JPG, PNG and more", soon: true },
];

const cLabel = (c) => typeof c === "string" ? `${c} cr` : `${c} cr`;

function ExamCard({ tool, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ ...s.examCard, borderColor: hov ? tool.color : "#1e293b", boxShadow: hov ? `0 4px 14px ${tool.color}18` : "none" }}
      onClick={() => onClick(tool.route)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      {/* Top: icon + tag side by side */}
      <div style={s.examTop}>
        <div style={{ ...s.examIcon, background: tool.color + "18", color: tool.color }}>
          {tool.icon}
        </div>
        {tool.tag && (
          <span style={{ ...s.examTag, background: tool.tagColor + "20", color: tool.tagColor, border: `1px solid ${tool.tagColor}44` }}>
            {tool.tag}
          </span>
        )}
      </div>

      <p style={s.examLabel}>{tool.label}</p>
      <p style={s.examDesc}>{tool.desc}</p>

      <div style={s.examFooter}>
        <span style={{ ...s.chip, color: tool.color, borderColor: tool.color + "40" }}>⚡ {cLabel(tool.credit)}</span>
        <span style={{ color: tool.color, fontWeight: 700, fontSize: 15 }}>→</span>
      </div>
    </div>
  );
}

function OtherCard({ tool, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ ...s.otherCard, borderColor: hov && !tool.soon ? tool.color : "#1e293b", opacity: tool.soon ? 0.55 : 1, cursor: tool.soon ? "default" : "pointer" }}
      onClick={() => !tool.soon && tool.route && onClick(tool.route)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{ ...s.otherIcon, background: tool.color + "18", color: tool.color }}>{tool.icon}</div>
      <div style={s.otherBody}>
        <div style={s.otherRow}>
          <p style={s.otherLabel}>{tool.label}</p>
          {tool.soon && <span style={s.soonBadge}>Soon</span>}
        </div>
        <p style={s.otherDesc}>{tool.desc}</p>
      </div>
      <span style={{ ...s.chipSm, color: tool.color, borderColor: tool.color + "40" }}>{cLabel(tool.credit)}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user, credits, logout } = useStore();
  const navigate = useNavigate();
  const currentCredits = credits ?? user?.credits ?? 0;

  return (
    <div style={s.root}>
      <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} />
        <div style={s.content}>

          {/* Welcome row */}
          <div style={s.welcomeRow}>
            <div>
              <h2 style={s.welcomeTitle}>Namaste, {user?.name?.split(" ")[0]} 🙏</h2>
              <p style={s.welcomeSub}>What do you want to prepare today?</p>
            </div>
            <div style={s.creditCard} onClick={() => navigate("/pricing")}>
              <span style={{ fontSize: 22 }}>⚡</span>
              <span style={s.creditNum}>{currentCredits}</span>
              <span style={s.creditLbl}>Credits</span>
            </div>
          </div>

          {currentCredits <= 5 && (
            <div style={s.lowBanner}>
              ⚠️ Only <b>{currentCredits} credits</b> left.{" "}
              <span style={s.link} onClick={() => navigate("/pricing")}>Buy a plan →</span>
            </div>
          )}

          {/* ── EXAM FORM TOOLS ─────────────────────────────── */}
          <section>
            <div style={s.secHead}>
              <div style={s.secHeadLeft}>
                <span style={{ fontSize: 18 }}>📋</span>
                <div>
                  <h2 style={s.secTitle}>Exam Form Tools</h2>
                  <p style={s.secSub}>Fill exam forms correctly — no Cyber Café needed</p>
                </div>
              </div>
            </div>
            <div style={s.examGrid}>
              {EXAM_TOOLS.map(t => <ExamCard key={t.id} tool={t} onClick={navigate} />)}
            </div>
          </section>

          {/* ── DOCUMENT & UTILITY TOOLS ────────────────────── */}
          <section>
            <div style={s.secHead}>
              <div style={s.secHeadLeft}>
                <span style={{ fontSize: 18 }}>📦</span>
                <div>
                  <h2 style={s.secTitle}>Document & Utility Tools</h2>
                  <p style={s.secSub}>General-purpose tools for documents and files</p>
                </div>
              </div>
            </div>
            <div style={s.otherGrid}>
              {OTHER_TOOLS.map(t => <OtherCard key={t.id} tool={t} onClick={navigate} />)}
            </div>
          </section>

          {/* Comparison strip */}
          <div style={s.strip}>
            💡 <b>Doc Saathi AI vs Cyber Café —</b> They charge ₹20–50 per photo. We charge ₹1–2. Same result, zero travel, works at 2 AM.
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 48, minWidth: 0 },
  content: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 22, maxWidth: 960 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },

  welcomeRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  welcomeTitle: { color: "#f1f5f9", fontSize: 20, fontWeight: 800, margin: 0 },
  welcomeSub: { color: "#64748b", fontSize: 13, marginTop: 3 },
  creditCard: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  creditNum: { color: "#f97316", fontWeight: 900, fontSize: 24 },
  creditLbl: { color: "#64748b", fontSize: 12 },

  lowBanner: { background: "#7c2d1220", border: "1px solid #7c2d12", borderRadius: 10, padding: "10px 16px", color: "#fca57a", fontSize: 13 },

  // Section headers — same structure for alignment
  secHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 10, flexWrap: "wrap" },
  secHeadLeft: { display: "flex", alignItems: "flex-start", gap: 10 },
  secTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 15, margin: "0 0 2px" },
  secSub: { color: "#64748b", fontSize: 12, margin: 0 },

  // Exam section wrapper
  examSection: { background: "linear-gradient(135deg,#0d1421,#0f172a)", border: "1px solid #1e3a5f", borderRadius: 16, padding: 16 },

  // Strict 2×2
  examGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  examCard: { background: "#0d1421", border: "1px solid", borderRadius: 13, padding: 14, display: "flex", flexDirection: "column", cursor: "pointer", transition: "all 0.18s" },
  examTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  examTag: { borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" },
  examIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  examLabel: { color: "#f1f5f9", fontWeight: 700, fontSize: 13, margin: "0 0 4px" },
  examDesc: { color: "#64748b", fontSize: 11, margin: "0", lineHeight: 1.5, flex: 1 },
  examFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  chip: { fontSize: 11, fontWeight: 700, border: "1px solid", borderRadius: 6, padding: "2px 8px" },

  // 3×2 other grid
  otherGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  otherCard: { background: "#0d1421", border: "1px solid", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 11, transition: "border-color 0.15s", minHeight: 64 },
  otherIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 },
  otherBody: { flex: 1, minWidth: 0 },
  otherRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 2 },
  otherLabel: { color: "#f1f5f9", fontWeight: 700, fontSize: 12, margin: 0 },
  otherDesc: { color: "#64748b", fontSize: 11, margin: 0, lineHeight: 1.3 },
  soonBadge: { background: "#1e293b", color: "#64748b", fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "1px 6px", flexShrink: 0 },
  chipSm: { fontSize: 10, fontWeight: 700, border: "1px solid", borderRadius: 5, padding: "2px 6px", flexShrink: 0, whiteSpace: "nowrap" },

  strip: { background: "#052e1618", border: "1px solid #14532d44", borderRadius: 12, padding: "12px 16px", color: "#86efac", fontSize: 12, lineHeight: 1.5 },
};
