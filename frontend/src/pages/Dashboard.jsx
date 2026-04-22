import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

// ─── Exam Form Tools (always 2×2 grid) ───────────────────────────────────────
const EXAM_TOOLS = [
  {
    id: "photo", icon: "📸", label: "Exam Photo", credit: 3, color: "#3b82f6",
    route: "/tool/photo", tag: "Most Used", tagColor: "#22c55e",
    desc: "Resize & compress to exact exam portal size and KB automatically",
  },
  {
    id: "signature", icon: "✍️", label: "Exam Signature", credit: 2, color: "#8b5cf6",
    route: "/tool/signature", tag: null,
    desc: "Format signature to exact dimensions & file size for any exam form",
  },
  {
    id: "merger", icon: "🪪", label: "Photo + Sign / Date", credit: 6, color: "#f59e0b",
    route: "/tool/merger", tag: "Coming Soon", tagColor: "#475569",
    desc: "Combine photo, signature & date of birth on a single document page",
  },
  {
    id: "docsize", icon: "📐", label: "Document Size Changer", credit: 4, color: "#f97316",
    route: "/pdf/compress", tag: null,
    desc: "Compress any PDF to the exact KB or MB required by the exam portal",
  },
];

// ─── Document & Utility Tools ─────────────────────────────────────────────────
const OTHER_TOOLS = [
  {
    id: "crop",       icon: "✂️", label: "Crop & Resize",   credit: 1,     color: "#ec4899",
    route: "/tool/crop",       desc: "Manually crop any image with aspect-ratio lock",
  },
  {
    id: "pdfcompress",icon: "🗜️", label: "PDF Compressor",  credit: 1,     color: "#06b6d4",
    route: "/pdf/compress",    desc: "Shrink PDF files to any KB or MB target size",
  },
  {
    id: "pdfeditor",  icon: "📝", label: "PDF Editor",       credit: 2,     color: "#ef4444",
    route: "/tool/pdfeditor",  desc: "Edit Admit Cards, fill form fields, add text",
  },
  {
    id: "resume",     icon: "📄", label: "Resume Builder",   credit: "1–3", color: "#22c55e",
    route: "/tool/resume",     desc: "Professional templates for govt & private jobs",
  },
];

// ─── Plans ────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "starter", name: "Starter", price: "₹49", period: "/year",
    credits: 25, color: "#22c55e", badge: null,
    perks: ["25 Credits", "Valid 1 Year", "All Exam Formats", "Photo + Signature", "PDF Compression"],
  },
  {
    id: "pro", name: "Pro", price: "₹299", period: "/year",
    credits: 100, color: "#f97316", badge: "BEST VALUE",
    perks: ["100 Credits", "Valid 1 Year", "All Features", "PDF Editor", "Resume Builder", "Priority Support"],
  },
  {
    id: "special", name: "Special", price: "₹99", period: "/month",
    credits: 35, color: "#a855f7", badge: "LIMITED OFFER",
    perks: ["35 Credits", "Valid 1 Month", "All Features", "PDF Editor", "Resume Builder", "Bonus Templates"],
  },
];

const creditLabel = (c) =>
  typeof c === "string" ? `${c} credits` : `${c} credit${c !== 1 ? "s" : ""}`;

// ─── ExamCard (used inside fixed 2×2 grid) ───────────────────────────────────
function ExamCard({ tool, onClick }) {
  const [hov, setHov] = useState(false);
  const disabled = tool.tag === "Coming Soon";

  return (
    <div
      style={{
        ...s.examCard,
        borderColor: hov && !disabled ? tool.color : "#1e293b",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: hov && !disabled ? `0 6px 20px ${tool.color}20` : "none",
        transform: hov && !disabled ? "translateY(-2px)" : "translateY(0)",
      }}
      onClick={() => !disabled && onClick(tool.route)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Tag */}
      {tool.tag && (
        <span style={{
          ...s.tag,
          background: tool.tagColor + "22",
          color: tool.tagColor,
          border: `1px solid ${tool.tagColor}44`,
        }}>
          {tool.tag}
        </span>
      )}

      <div style={{ ...s.examIcon, background: tool.color + "18", color: tool.color }}>
        {tool.icon}
      </div>
      <h3 style={s.examLabel}>{tool.label}</h3>
      <p style={s.examDesc}>{tool.desc}</p>

      <div style={s.examFooter}>
        <span style={{ ...s.creditChip, color: tool.color, borderColor: tool.color + "40" }}>
          ⚡ {creditLabel(tool.credit)}
        </span>
        {!disabled && <span style={{ color: tool.color, fontSize: 18, fontWeight: 700 }}>→</span>}
      </div>
    </div>
  );
}

// ─── OtherCard (horizontal, equal height) ────────────────────────────────────
function OtherCard({ tool, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{
        ...s.otherCard,
        borderColor: hov ? tool.color : "#1e293b",
      }}
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
      <span style={{ ...s.otherChip, color: tool.color, borderColor: tool.color + "40" }}>
        {creditLabel(tool.credit)}
      </span>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, credits, updateCredits, logout } = useStore();
  const navigate  = useNavigate();
  const [activeNav, setActiveNav]     = useState("Dashboard");
  const [showPricing, setShowPricing] = useState(false);
  const currentCredits = credits ?? user?.credits ?? 0;

  return (
    <div style={s.root}>
      <Sidebar
        credits={currentCredits}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        setShowPricing={setShowPricing}
        onLogout={() => { logout(); navigate("/"); }}
      />

      <div style={s.main}>
        <TopBar
          user={user}
          credits={currentCredits}
          setShowPricing={setShowPricing}
        />

        {showPricing ? (
          <PricingSection updateCredits={updateCredits} setShowPricing={setShowPricing} />
        ) : (
          <div style={s.content}>

            {/* Low credit warning */}
            {currentCredits <= 5 && (
              <div style={s.lowBanner}>
                ⚠️ Only <b>{currentCredits} credits</b> left!{" "}
                <span style={s.link} onClick={() => setShowPricing(true)}>Buy a plan</span>
                {" "}— or downloads will carry a watermark (remove for ₹10).
              </div>
            )}

            {/* ── EXAM FORM TOOLS ─────────────────────────────────────── */}
            <div style={s.examSection}>
              {/* Section header */}
              <div style={s.examHeader}>
                <div style={s.examHeaderLeft}>
                  <span style={{ fontSize: 22 }}>📋</span>
                  <div>
                    <h2 style={s.examHeaderTitle}>Exam Form Tools</h2>
                    <p style={s.examHeaderSub}>
                      Everything needed to fill an exam form — no Cyber Café required
                    </p>
                  </div>
                </div>
                <span style={s.examBadge}>For Form Filling</span>
              </div>

              {/* Fixed 2×2 grid — always exactly 2 columns */}
              <div style={s.examGrid}>
                {EXAM_TOOLS.map((t) => (
                  <ExamCard key={t.id} tool={t} onClick={navigate} />
                ))}
              </div>
            </div>

            {/* ── DOCUMENT & UTILITY TOOLS ────────────────────────────── */}
            <div style={s.otherSection}>
              <div style={s.otherHeader}>
                <span style={s.otherDot} />
                <div>
                  <h2 style={s.otherTitle}>Document & Utility Tools</h2>
                  <p style={s.otherSub}>General-purpose tools for any document task</p>
                </div>
              </div>

              {/* Fixed 2×2 grid */}
              <div style={s.otherGrid}>
                {OTHER_TOOLS.map((t) => (
                  <OtherCard key={t.id} tool={t} onClick={navigate} />
                ))}
              </div>
            </div>

            {/* Comparison strip */}
            <div style={s.strip}>
              💡 <b>Doc Saathi AI vs Cyber Café</b> — They charge ₹20–50 per photo.
              We charge ₹1–2. Same result, zero travel, works at 2 AM.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pricing Section ─────────────────────────────────────────────────────────
function PricingSection({ updateCredits, setShowPricing }) {
  const navigate = useNavigate();

  const handleBuy = async (planId) => {
    try {
      const { data } = await API.post("/payment/create-order", { planType: planId });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount, currency: "INR",
        name: "Doc Saathi AI",
        description: `Buy ${planId} plan`,
        order_id: data.orderId,
        handler: async (res) => {
          const v = await API.post("/payment/verify", {
            razorpayOrderId:   res.razorpay_order_id,
            razorpayPaymentId: res.razorpay_payment_id,
            razorpaySignature: res.razorpay_signature,
          });
          updateCredits(v.data.credits);
          alert(`✅ Payment successful! ${v.data.credits} credits added.`);
          setShowPricing(false);
        },
        theme: { color: "#f97316" },
      };
      new window.Razorpay(options).open();
    } catch {
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div style={s.content}>
      <div style={s.otherHeader}>
        <span style={s.otherDot} />
        <div>
          <h2 style={s.otherTitle}>Choose Your Plan</h2>
          <p style={s.otherSub}>Cheaper than any Cyber Café. No hidden fees.</p>
        </div>
      </div>
      <div style={s.plansGrid}>
        {PLANS.map((plan) => (
          <div key={plan.id} style={{ ...s.planCard, borderColor: plan.color }}>
            {plan.badge && (
              <div style={{ ...s.planBadge, background: plan.color }}>{plan.badge}</div>
            )}
            <h3 style={{ color: plan.color, fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
              {plan.name}
            </h3>
            <div style={{ fontSize: 34, fontWeight: 900, color: "#f1f5f9", margin: "8px 0 2px" }}>
              {plan.price}<span style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>{plan.period}</span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>{plan.credits} Credits</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
              {plan.perks.map((p) => (
                <li key={p} style={{ color: "#94a3b8", fontSize: 13 }}>✓ {p}</li>
              ))}
            </ul>
            <button
              onClick={() => handleBuy(plan.id)}
              style={{ width: "100%", background: plan.color, color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
            >
              Buy {plan.name}
            </button>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", color: "#475569", fontSize: 13, margin: "0 0 12px" }}>
        🔒 Secure via Razorpay · UPI, Cards, Net Banking accepted
      </p>
      <div style={s.strip}>
        💡 <b>Doc Saathi AI vs Cyber Café</b> — They charge ₹20–50 per photo. We charge ₹2–4. Same quality, zero travel.
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 48, minWidth: 0 },
  content: { padding: "20px 28px", display: "flex", flexDirection: "column", gap: 24 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },

  lowBanner: {
    background: "#7c2d1220", border: "1px solid #7c2d12",
    borderRadius: 10, padding: "10px 16px", color: "#fca57a", fontSize: 13,
  },

  // ── Exam section ────────────────────────────────────────────────────────────
  examSection: {
    background: "linear-gradient(135deg, #0d1421 0%, #0f172a 100%)",
    border: "1px solid #1e3a5f",
    borderRadius: 20,
    padding: 20,
  },
  examHeader: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 18, gap: 12, flexWrap: "wrap",
  },
  examHeaderLeft: { display: "flex", alignItems: "flex-start", gap: 12 },
  examHeaderTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 17, margin: "0 0 3px" },
  examHeaderSub: { color: "#64748b", fontSize: 13, margin: 0 },
  examBadge: {
    background: "#1e3a5f", color: "#93c5fd",
    border: "1px solid #1e40af44", borderRadius: 20,
    padding: "4px 14px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
  },

  // Strict 2×2 — no auto-fill
  examGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",   // always exactly 2 columns
    gap: 14,
  },

  // Exam card — all same height via flexbox column
  examCard: {
    background: "#070c18",
    border: "1px solid",
    borderRadius: 16,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    transition: "all 0.18s",
    position: "relative",
    minHeight: 180,
  },
  tag: {
    display: "inline-block", borderRadius: 6,
    padding: "2px 10px", fontSize: 11, fontWeight: 700,
    marginBottom: 10, alignSelf: "flex-start",
  },
  examIcon: {
    width: 46, height: 46, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, marginBottom: 12, flexShrink: 0,
  },
  examLabel: { color: "#f1f5f9", fontWeight: 700, fontSize: 15, margin: "0 0 6px" },
  examDesc:  { color: "#64748b", fontSize: 12, margin: "0", lineHeight: 1.5, flex: 1 },
  examFooter: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginTop: 14,
  },
  creditChip: {
    display: "inline-block", fontSize: 12, fontWeight: 700,
    border: "1px solid", borderRadius: 6, padding: "3px 10px",
  },

  // ── Other tools ─────────────────────────────────────────────────────────────
  otherSection: {},
  otherHeader: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 },
  otherDot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#f97316", flexShrink: 0, marginTop: 6,
  },
  otherTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 16, margin: "0 0 2px" },
  otherSub:   { color: "#64748b", fontSize: 13, margin: 0 },

  // Strict 2×2 for other tools too
  otherGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  // Horizontal card — fixed height
  otherCard: {
    background: "#0d1421",
    border: "1px solid",
    borderRadius: 14,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
    transition: "border-color 0.15s",
    minHeight: 72,
  },
  otherIcon: {
    width: 42, height: 42, borderRadius: 11,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 19, flexShrink: 0,
  },
  otherBody: { flex: 1, minWidth: 0 },
  otherLabel: { color: "#f1f5f9", fontWeight: 700, fontSize: 13, margin: "0 0 3px" },
  otherDesc:  { color: "#64748b", fontSize: 11, margin: 0, lineHeight: 1.4 },
  otherChip: {
    fontSize: 11, fontWeight: 700, border: "1px solid",
    borderRadius: 6, padding: "3px 8px", flexShrink: 0, whiteSpace: "nowrap",
  },

  // Comparison strip
  strip: {
    background: "#052e1618", border: "1px solid #14532d44",
    borderRadius: 12, padding: "12px 16px",
    color: "#86efac", fontSize: 13, lineHeight: 1.5,
  },

  // Plans
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 20, marginBottom: 16,
  },
  planCard: {
    background: "#0d1421", border: "2px solid", borderRadius: 20,
    padding: 22, position: "relative", overflow: "hidden",
  },
  planBadge: {
    position: "absolute", top: 0, right: 0,
    borderRadius: "0 18px 0 12px", padding: "4px 14px",
    fontSize: 11, fontWeight: 800, color: "#fff",
  },
};
