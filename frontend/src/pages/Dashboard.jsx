import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const EXAM_TOOLS = [
  {
    id: "photo", icon: "📸", label: "Exam Photo", credit: 3, color: "#3b82f6",
    route: "/tool/photo", tag: "Most Used", tagColor: "#22c55e",
    desc: "Resize & compress to exact exam portal spec automatically",
  },
  {
    id: "signature", icon: "✍️", label: "Exam Signature", credit: 2, color: "#8b5cf6",
    route: "/tool/signature", tag: null,
    desc: "Format signature to exact dimensions & KB for any exam",
  },
  {
    id: "merger", icon: "🪪", label: "Photo + Sign / Date", credit: 6, color: "#f59e0b",
    route: "/merger", tag: "New", tagColor: "#f97316",
    desc: "Merge photo, signature & DOB or today's date on one page",
  },
  {
    id: "docsize", icon: "📐", label: "Document Size Changer", credit: 4, color: "#f97316",
    route: "/pdf/compress", tag: null,
    desc: "Compress PDF to exact KB or MB required by exam portal",
  },
];

const OTHER_TOOLS = [
  { id: "crop",      icon: "✂️", label: "Crop & Resize",  credit: 1,     color: "#ec4899", route: "/tool/crop",      desc: "Crop any image with aspect ratio lock" },
  { id: "pdfcompress",icon:"🗜️", label: "PDF Compressor", credit: 1,     color: "#06b6d4", route: "/pdf/compress",    desc: "Shrink PDF to any KB or MB target" },
  { id: "pdfeditor", icon: "📝", label: "PDF Editor",     credit: 2,     color: "#ef4444", route: "/tool/pdfeditor",  desc: "Edit Admit Cards, add text to PDFs" },
  { id: "resume",    icon: "📄", label: "Resume Builder", credit: "1–3", color: "#22c55e", route: "/tool/resume",     desc: "Templates for govt & private jobs" },
];

const cLabel = (c) => typeof c === "string" ? `${c} cr` : `${c} cr`;

// ── ExamCard ──────────────────────────────────────────────────────────────────
function ExamCard({ tool, onClick }) {
  const [hov, setHov] = useState(false);
  const isSoon = false; // merger is now active

  return (
    <div
      style={{
        ...s.examCard,
        borderColor: hov ? tool.color : "#1e293b",
        boxShadow: hov ? `0 4px 16px ${tool.color}18` : "none",
        transform: hov ? "translateY(-1px)" : "none",
        cursor: "pointer",
      }}
      onClick={() => onClick(tool.route)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Top row: icon left, tag right */}
      <div style={s.examCardTop}>
        <div style={{ ...s.examIcon, background: tool.color + "18", color: tool.color }}>
          {tool.icon}
        </div>
        {tool.tag && (
          <span style={{
            ...s.examTag,
            background: tool.tagColor + "22",
            color: tool.tagColor,
            border: `1px solid ${tool.tagColor}44`,
          }}>
            {tool.tag}
          </span>
        )}
      </div>

      <h3 style={s.examLabel}>{tool.label}</h3>
      <p style={s.examDesc}>{tool.desc}</p>

      {/* Footer */}
      <div style={s.examFooter}>
        <span style={{ ...s.chip, color: tool.color, borderColor: tool.color + "44" }}>
          ⚡ {cLabel(tool.credit)}
        </span>
        <span style={{ color: tool.color, fontSize: 16, fontWeight: 700 }}>→</span>
      </div>
    </div>
  );
}

// ── OtherCard ─────────────────────────────────────────────────────────────────
function OtherCard({ tool, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ ...s.otherCard, borderColor: hov ? tool.color : "#1e293b" }}
      onClick={() => onClick(tool.route)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ ...s.otherIcon, background: tool.color + "18", color: tool.color }}>
        {tool.icon}
      </div>
      <div style={s.otherBody}>
        <p style={s.otherLabel}>{tool.label}</p>
        <p style={s.otherDesc}>{tool.desc}</p>
      </div>
      <span style={{ ...s.chipSm, color: tool.color, borderColor: tool.color + "44" }}>
        {cLabel(tool.credit)}
      </span>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, credits, logout } = useStore();
  const navigate = useNavigate();
  const [activeNav, setActiveNav]     = useState("Dashboard");
  const [showPricing, setShowPricing] = useState(false);
  const currentCredits = credits ?? user?.credits ?? 0;

  return (
    <div style={s.root}>
      <Sidebar
        credits={currentCredits} activeNav={activeNav}
        setActiveNav={setActiveNav} setShowPricing={setShowPricing}
        onLogout={() => { logout(); navigate("/"); }}
      />
      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} setShowPricing={setShowPricing} />

        {showPricing
          ? <PricingSection setShowPricing={setShowPricing} />
          : <MainContent navigate={navigate} currentCredits={currentCredits} setShowPricing={setShowPricing} />
        }
      </div>
    </div>
  );
}

function MainContent({ navigate, currentCredits, setShowPricing }) {
  return (
    <div style={s.content}>
      {currentCredits <= 5 && (
        <div style={s.lowBanner}>
          ⚠️ Only <b>{currentCredits} credits</b> left.{" "}
          <span style={s.link} onClick={() => setShowPricing(true)}>Buy a plan →</span>
        </div>
      )}

      {/* ── EXAM FORM TOOLS ─────────────────────────────────────────────── */}
      <div style={s.examSection}>
        <div style={s.examHeader}>
          <div style={s.examHeaderLeft}>
            <span style={{ fontSize: 20 }}>📋</span>
            <div>
              <h2 style={s.examHeaderTitle}>Exam Form Tools</h2>
              <p style={s.examHeaderSub}>Fill your exam form correctly — no Cyber Café needed</p>
            </div>
          </div>
          <span style={s.examBadge}>For Form Filling</span>
        </div>

        <div style={s.examGrid}>
          {EXAM_TOOLS.map((t) => <ExamCard key={t.id} tool={t} onClick={navigate} />)}
        </div>
      </div>

      {/* ── UTILITY TOOLS ───────────────────────────────────────────────── */}
      <div>
        <div style={s.sectionHead}>
          <span style={s.dot} />
          <div>
            <h2 style={s.sectionTitle}>Document & Utility Tools</h2>
            <p style={s.sectionSub}>General-purpose tools for any document task</p>
          </div>
        </div>
        <div style={s.otherGrid}>
          {OTHER_TOOLS.map((t) => <OtherCard key={t.id} tool={t} onClick={navigate} />)}
        </div>
      </div>

      {/* Comparison strip */}
      <div style={s.strip}>
        💡 <b>Doc Saathi AI vs Cyber Café —</b> They charge ₹20–50 per photo. We charge ₹1–2. Same result, zero travel, works at 2 AM.
      </div>
    </div>
  );
}

// ── Pricing Section ───────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "starter", name: "Student Special", price: "₹49", period: "/30 days",
    credits: 50, color: "#f97316", badge: "🏆 Best Seller",
    tag: "Serious aspirants",
    perks: ["50 Credits","Valid 30 Days","All Exam Formats","Photo + Signature","PDF Compression","Document Size Changer"],
  },
  {
    id: "pro", name: "Aspirant Pro", price: "₹99", period: "/60 days",
    credits: 120, color: "#a855f7", badge: "Heavy Users",
    tag: "Group study / Heavy users",
    perks: ["120 Credits","Valid 60 Days","All Features","PDF Editor","Resume Builder","Priority Support"],
  },
  {
    id: "emergency", name: "Emergency Pack", price: "₹19", period: "/24 hours",
    credits: 15, color: "#ef4444", badge: "⚡ Urgent",
    tag: "Last-minute form bharne wale",
    perks: ["15 Credits","Valid 24 Hours","All Exam Formats","Quick Download","Instant Access"],
  },
];

function PricingSection({ setShowPricing }) {
  const COMPARISON = [
    { feature: "Photo + Sign Resize",   cafe: "₹20 – ₹50",          us: "₹0 (Free Credits)" },
    { feature: "Document Scanning",     cafe: "₹10 per page",        us: "FREE (Mobile Scanner)" },
    { feature: "Urgent Form Fix",       cafe: "₹50 – ₹100",         us: "₹9 (Single Fix)" },
    { feature: "Waqt ki Barbadi",       cafe: "1–2 Ghante (Line)",   us: "Sirf 10 Second" },
    { feature: "Travel Cost",           cafe: "₹20–₹40 (Petrol)",    us: "₹0 (Ghar baithe)" },
    { feature: "Total Kharcha",         cafe: "₹100 – ₹200",        us: "₹9 – ₹49" },
  ];

  return (
    <div style={s.content}>
      <div style={s.sectionHead}>
        <span style={s.dot} />
        <div>
          <h2 style={s.sectionTitle}>Choose Your Plan</h2>
          <p style={s.sectionSub}>Designed for Indian aspirants. No subscriptions. Pay once, use fully.</p>
        </div>
      </div>

      {/* Single Fix card */}
      <div style={s.singleFixCard}>
        <div>
          <h3 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 17, margin: "0 0 4px" }}>
            ⚡ Single Fix — ₹9
          </h3>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
            1 Download without watermark. No login needed. Jo sirf ek file chahiye unke liye.
          </p>
        </div>
        <button style={{ ...s.btnSm, background: "#22c55e", color: "#fff" }}>
          Get It Now
        </button>
      </div>

      {/* Weekly Free */}
      <div style={s.freeCard}>
        <div>
          <h3 style={{ color: "#86efac", fontWeight: 800, fontSize: 16, margin: "0 0 4px" }}>
            🔄 Weekly Free Refill — 5 Credits Every 7 Days
          </h3>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
            Auto-credited every week. Just login and get your 5 free credits automatically.
          </p>
        </div>
        <span style={{ background: "#052e16", color: "#86efac", border: "1px solid #14532d", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
          FREE
        </span>
      </div>

      {/* Plan cards */}
      <div style={s.plansGrid}>
        {PLANS.map((plan) => (
          <div key={plan.id} style={{ ...s.planCard, borderColor: plan.color }}>
            {plan.badge && (
              <div style={{ ...s.planBadge, background: plan.color }}>{plan.badge}</div>
            )}
            <h3 style={{ color: plan.color, fontSize: 17, fontWeight: 800, margin: "0 0 2px" }}>
              {plan.name}
            </h3>
            <p style={{ color: "#475569", fontSize: 12, margin: "0 0 10px" }}>{plan.tag}</p>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#f1f5f9", lineHeight: 1 }}>
              {plan.price}<span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>{plan.period}</span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 13, margin: "6px 0 14px" }}>
              {plan.credits} Credits
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 5 }}>
              {plan.perks.map((p) => <li key={p} style={{ color: "#94a3b8", fontSize: 12 }}>✓ {p}</li>)}
            </ul>
            <button style={{ width: "100%", background: plan.color, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Buy {plan.name}
            </button>
          </div>
        ))}
      </div>

      <p style={{ textAlign: "center", color: "#334155", fontSize: 12, margin: "0 0 20px" }}>
        🔒 Secure via Razorpay · UPI, Cards, Net Banking, Wallets accepted
      </p>

      {/* Comparison table */}
      <div style={s.sectionHead}>
        <span style={s.dot} />
        <div>
          <h2 style={s.sectionTitle}>Hum Behtar Kyun Hain? 🏆</h2>
          <p style={s.sectionSub}>Doc Saathi AI vs Cyber Café — Apna Faisla Khud Karo</p>
        </div>
      </div>

      <div style={s.table}>
        <div style={s.tableHead}>
          <div style={{ ...s.tableCell, flex: 2, color: "#64748b" }}>Feature</div>
          <div style={{ ...s.tableCell, color: "#ef4444" }}>🏪 Cyber Café</div>
          <div style={{ ...s.tableCell, color: "#22c55e" }}>🤖 Doc Saathi AI</div>
        </div>
        {COMPARISON.map((row, i) => (
          <div key={i} style={{ ...s.tableRow, background: i % 2 === 0 ? "#0d1421" : "#070c18" }}>
            <div style={{ ...s.tableCell, flex: 2, color: "#94a3b8", fontWeight: 600 }}>{row.feature}</div>
            <div style={{ ...s.tableCell, color: "#ef444488" }}>{row.cafe}</div>
            <div style={{ ...s.tableCell, color: "#22c55e", fontWeight: 700 }}>{row.us}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 48, minWidth: 0 },
  content: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },

  lowBanner: { background: "#7c2d1220", border: "1px solid #7c2d12", borderRadius: 10, padding: "10px 16px", color: "#fca57a", fontSize: 13 },

  // Exam section
  examSection: { background: "linear-gradient(135deg,#0d1421,#0f172a)", border: "1px solid #1e3a5f", borderRadius: 18, padding: 18 },
  examHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" },
  examHeaderLeft: { display: "flex", alignItems: "flex-start", gap: 10 },
  examHeaderTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 16, margin: "0 0 2px" },
  examHeaderSub: { color: "#64748b", fontSize: 12, margin: 0 },
  examBadge: { background: "#1e3a5f", color: "#93c5fd", border: "1px solid #1e40af44", borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 },

  // 2×2 exam grid
  examGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  // Exam card — compact
  examCard: {
    background: "#070c18", border: "1px solid", borderRadius: 14, padding: 14,
    display: "flex", flexDirection: "column", transition: "all 0.18s", minHeight: 0,
  },
  examCardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 },
  examTag: { borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 },
  examIcon: { width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  examLabel: { color: "#f1f5f9", fontWeight: 700, fontSize: 13, margin: "0 0 5px" },
  examDesc: { color: "#64748b", fontSize: 11, margin: "0", lineHeight: 1.5, flex: 1 },
  examFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  chip: { display: "inline-block", fontSize: 11, fontWeight: 700, border: "1px solid", borderRadius: 6, padding: "2px 8px" },

  // Other tools
  sectionHead: { display: "flex", alignItems: "flex-start", gap: 10 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#f97316", flexShrink: 0, marginTop: 6 },
  sectionTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 15, margin: "0 0 2px" },
  sectionSub: { color: "#64748b", fontSize: 12, margin: 0 },
  otherGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 },
  otherCard: { background: "#0d1421", border: "1px solid", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "border-color 0.15s", minHeight: 64 },
  otherIcon: { width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 },
  otherBody: { flex: 1, minWidth: 0 },
  otherLabel: { color: "#f1f5f9", fontWeight: 700, fontSize: 12, margin: "0 0 2px" },
  otherDesc: { color: "#64748b", fontSize: 11, margin: 0, lineHeight: 1.3 },
  chipSm: { fontSize: 10, fontWeight: 700, border: "1px solid", borderRadius: 5, padding: "2px 7px", flexShrink: 0, whiteSpace: "nowrap" },

  strip: { background: "#052e1618", border: "1px solid #14532d44", borderRadius: 12, padding: "12px 16px", color: "#86efac", fontSize: 12, lineHeight: 1.5 },

  // Pricing
  singleFixCard: { background: "#0d1421", border: "1px solid #22c55e44", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  freeCard: { background: "#052e1618", border: "1px solid #14532d", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  btnSm: { border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 },
  plansGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  planCard: { background: "#0d1421", border: "2px solid", borderRadius: 16, padding: 18, position: "relative", overflow: "hidden" },
  planBadge: { position: "absolute", top: 0, right: 0, borderRadius: "0 14px 0 10px", padding: "3px 12px", fontSize: 10, fontWeight: 800, color: "#fff" },

  // Table
  table: { border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden" },
  tableHead: { display: "flex", background: "#111827", padding: "10px 16px", gap: 8 },
  tableRow: { display: "flex", padding: "10px 16px", gap: 8, borderTop: "1px solid #1e293b" },
  tableCell: { flex: 1, fontSize: 13 },
};
