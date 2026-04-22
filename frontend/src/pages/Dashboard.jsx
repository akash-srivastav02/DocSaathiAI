// import { useNavigate } from "react-router-dom";
// import useStore from "../store/useStore";

// const FEATURES = [
//   { id: "photo",      icon: "📸", label: "Exam Photo",    desc: "Resize & compress per exam spec",  credit: 1 },
//   { id: "signature",  icon: "✍️", label: "Signature",     desc: "Format signature for any exam",    credit: 1 },
//   { id: "crop",       icon: "✂️", label: "Crop Photo",    desc: "Manual crop with aspect ratio",    credit: 1 },
//   { id: "pdfcompress",icon: "🗜️", label: "PDF Compress",  desc: "Shrink PDF to required KB",        credit: 1 },
//   { id: "pdfeditor",  icon: "📝", label: "PDF Editor",    desc: "Edit Admit Cards & form PDFs",     credit: 2 },
//   { id: "resume",     icon: "📄", label: "Resume Builder",desc: "Professional exam-ready CVs",      credit: "1–3" },
// ];

// export default function Dashboard() {
//   const { user, credits, logout } = useStore();
//   const navigate = useNavigate();

//   return (
//     <div style={{ minHeight: "100vh", background: "#070c18", fontFamily: "Segoe UI, sans-serif", color: "#f1f5f9" }}>
//       {/* Top Bar */}
//       <div style={{ background: "#0d1421", borderBottom: "1px solid #1e293b",
//         padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <span style={{ fontSize: 20, fontWeight: 800, color: "#f97316" }}>📋 DocSaathi</span>
//         <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//           <span style={{ background: "#f9731620", color: "#f97316", borderRadius: 20,
//             padding: "6px 14px", fontSize: 13, fontWeight: 700, border: "1px solid #f9731640",
//             cursor: "pointer" }} onClick={() => navigate("/pricing")}>
//             ⚡ {credits ?? user?.credits ?? 0} Credits
//           </span>
//           <button onClick={() => { logout(); navigate("/"); }}
//             style={{ background: "#1e293b", border: "1px solid #374151", color: "#94a3b8",
//               borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>
//             Logout
//           </button>
//         </div>
//       </div>

//       <div style={{ padding: "28px" }}>
//         <h2 style={{ marginBottom: 4 }}>Namaste, {user?.name?.split(" ")[0]} 🙏</h2>
//         <p style={{ color: "#64748b", marginBottom: 28 }}>What would you like to prepare today?</p>

//         {(credits ?? user?.credits ?? 0) <= 3 && (
//           <div style={{ background: "#7c2d1220", border: "1px solid #7c2d12",
//             borderRadius: 10, padding: "10px 16px", color: "#fca57a",
//             fontSize: 13, marginBottom: 20 }}>
//             ⚠️ Low credits!{" "}
//             <span style={{ color: "#f97316", cursor: "pointer", fontWeight: 600 }}
//               onClick={() => navigate("/pricing")}>Buy a plan</span>
//             {" "}or downloads will have a watermark (remove for ₹10).
//           </div>
//         )}

//         <h3 style={{ marginBottom: 16 }}>🛠️ Tools</h3>
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
//           {FEATURES.map(f => (
//             <div key={f.id} onClick={() => navigate(`/tool/${f.id}`)}
//               style={{ background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16,
//                 padding: 20, cursor: "pointer", transition: "border-color 0.2s" }}
//               onMouseEnter={e => e.currentTarget.style.borderColor = "#f97316"}
//               onMouseLeave={e => e.currentTarget.style.borderColor = "#1e293b"}>
//               <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
//               <h4 style={{ margin: "0 0 6px", color: "#f1f5f9" }}>{f.label}</h4>
//               <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: 13 }}>{f.desc}</p>
//               <span style={{ fontSize: 12, color: "#f97316", border: "1px solid #f9731644",
//                 borderRadius: 6, padding: "2px 8px" }}>
//                 {f.credit} credit{typeof f.credit === "string" || f.credit > 1 ? "s" : ""}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const FEATURES = [
  { id: "photo",       icon: "📸", label: "Exam Photo",     desc: "Resize & compress photo per exam spec",        credit: 1,     color: "#3b82f6" },
  { id: "signature",   icon: "✍️", label: "Signature",      desc: "Format your signature for any exam",           credit: 1,     color: "#8b5cf6" },
  { id: "crop",        icon: "✂️", label: "Crop Photo",     desc: "Manual crop with aspect ratio lock",           credit: 1,     color: "#ec4899" },
  { id: "pdfcompress", icon: "🗜️", label: "PDF Compress",   desc: "Shrink PDF to required KB size",               credit: 1,     color: "#f97316" },
  { id: "pdfeditor",   icon: "📝", label: "PDF Editor",     desc: "Edit Admit Cards & form PDFs",                 credit: 2,     color: "#ef4444" },
  { id: "resume",      icon: "📄", label: "Resume Builder", desc: "Professional templates, exam-ready CVs",       credit: "1–3", color: "#22c55e" },
];

const EXAM_SPECS = {
  "SSC CGL":  { photoSize: "20-50 KB",   photoDim: "200×230 px",   sigSize: "10-20 KB", sigDim: "200×70 px", photoFormat: "JPG", bg: "White" },
  "SBI PO":   { photoSize: "20-50 KB",   photoDim: "200×200 px",   sigSize: "10-20 KB", sigDim: "200×80 px", photoFormat: "JPG", bg: "White" },
  "IBPS PO":  { photoSize: "20-50 KB",   photoDim: "200×230 px",   sigSize: "10-20 KB", sigDim: "200×80 px", photoFormat: "JPG", bg: "White" },
  "JEE Main": { photoSize: "10-200 KB",  photoDim: "3.5×4.5 cm",   sigSize: "4-30 KB",  sigDim: "3.5×1.5 cm", photoFormat: "JPG", bg: "White" },
  "NEET UG":  { photoSize: "10-200 KB",  photoDim: "3.5×4.5 cm",   sigSize: "4-30 KB",  sigDim: "3.5×1.5 cm", photoFormat: "JPG", bg: "White" },
};

export default function Dashboard() {
  const { user, credits, logout } = useStore();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [showPricing, setShowPricing] = useState(false);

  return (
    <div style={s.root}>
      <Sidebar
        credits={credits ?? user?.credits ?? 15}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        setShowPricing={setShowPricing}
        onLogout={() => { logout(); navigate("/"); }}
      />
      <div style={s.main}>
        <TopBar
          user={user}
          credits={credits ?? user?.credits ?? 15}
          setShowPricing={setShowPricing}
          onLogout={() => { logout(); navigate("/"); }}
        />

        {showPricing ? (
          <PricingSection />
        ) : (
          <>
            {/* Welcome */}
            <div style={s.welcomeBar}>
              <div>
                <h2 style={s.welcomeTitle}>
                  Namaste, {user?.name?.split(" ")[0]} 🙏
                </h2>
                <p style={s.welcomeSub}>What would you like to prepare today?</p>
              </div>
              <div style={s.creditBadge}>
                <span style={s.creditIcon}>⚡</span>
                <span style={s.creditNum}>{credits ?? user?.credits ?? 15}</span>
                <span style={s.creditLbl}>Credits Left</span>
              </div>
            </div>

            {/* Low credit banner */}
            {(credits ?? user?.credits ?? 15) <= 3 && (
              <div style={s.lowCreditBanner}>
                ⚠️ Low credits!{" "}
                <span style={s.link} onClick={() => setShowPricing(true)}>
                  Buy a plan
                </span>{" "}
                or after 0, downloads will have a watermark (remove for ₹10).
              </div>
            )}

            {/* Tools */}
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>🛠️ Tools</h2>
            </div>
            <div style={s.featuresGrid}>
              {FEATURES.map((f) => (
                <div
                  key={f.id}
                  style={s.featureCard}
                  onClick={() => navigate(`/tool/${f.id}`)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = f.color)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#1e293b")
                  }
                >
                  <div
                    style={{
                      ...s.featureIcon,
                      background: f.color + "18",
                      color: f.color,
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3 style={s.featureLabel}>{f.label}</h3>
                  <p style={s.featureDesc}>{f.desc}</p>
                  <div
                    style={{
                      ...s.featureCreditBadge,
                      color: f.color,
                      borderColor: f.color + "44",
                    }}
                  >
                    {f.credit} credit
                    {typeof f.credit === "string" || f.credit > 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>

            {/* Exam Specs Table */}
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>📋 Popular Exam Requirements</h2>
            </div>
            <div style={s.examTable}>
              <div style={s.examTableHeader}>
                {["Exam", "Photo Size", "Dimensions", "Sig Size", "Sig Dimensions"].map(
                  (h) => (
                    <div key={h} style={s.examTh}>{h}</div>
                  )
                )}
              </div>
              {Object.entries(EXAM_SPECS).map(([exam, sp]) => (
                <div key={exam} style={s.examRow}>
                  <div style={{ ...s.examTd, fontWeight: 700, color: "#f97316" }}>
                    {exam}
                  </div>
                  <div style={s.examTd}>{sp.photoSize}</div>
                  <div style={s.examTd}>{sp.photoDim}</div>
                  <div style={s.examTd}>{sp.sigSize}</div>
                  <div style={s.examTd}>{sp.sigDim}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Pricing Section (inline) ──────────────────────────────────────────────────
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

import API from "../api/axios";

function PricingSection() {
  const { updateCredits } = useStore();
  const navigate = useNavigate();

  const handleBuy = async (planId) => {
    try {
      const { data } = await API.post("/payment/create-order", { planType: planId });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: "INR",
        name: "DocSaathi",
        description: `Buy ${planId} plan`,
        order_id: data.orderId,
        handler: async (response) => {
          const verify = await API.post("/payment/verify", {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          updateCredits(verify.data.credits);
          alert(`✅ Payment successful! ${verify.data.credits} credits added.`);
          navigate("/dashboard");
        },
        theme: { color: "#f97316" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Payment failed. Try again.");
    }
  };

  return (
    <div>
      <div style={s.sectionHeader}>
        <h2 style={s.sectionTitle}>💳 Choose Your Plan</h2>
        <p style={s.sectionSub}>Cheaper than any Cyber Café in India. No hidden fees.</p>
      </div>
      <div style={s.plansGrid}>
        {PLANS.map((plan) => (
          <div key={plan.name} style={{ ...s.planCard, borderColor: plan.color }}>
            {plan.badge && (
              <div style={{ ...s.planBadge, background: plan.color }}>
                {plan.badge}
              </div>
            )}
            <h3 style={{ ...s.planName, color: plan.color }}>{plan.name}</h3>
            <div style={s.planPrice}>
              {plan.price}
              <span style={s.planPeriod}>{plan.period}</span>
            </div>
            <div style={s.planCredits}>{plan.credits} Credits</div>
            <ul style={s.planPerks}>
              {plan.perks.map((p) => (
                <li key={p} style={s.planPerk}>✓ {p}</li>
              ))}
            </ul>
            <button
              onClick={() => handleBuy(plan.id)}
              style={{ ...s.btnPrimary, background: plan.color, marginTop: 8 }}
            >
              Buy {plan.name}
            </button>
          </div>
        ))}
      </div>
      <div style={s.payNote}>
        🔒 Secure via Razorpay · UPI, Cards, Net Banking accepted
      </div>
      <div style={s.cyberNote}>
        💡 <b>DocSaathi vs Cyber Café:</b> They charge ₹20–50 per photo. We charge ₹2–4
        per photo. Same quality, zero travel.
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 40 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 600 },

  welcomeBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 28px 12px", flexWrap: "wrap", gap: 12 },
  welcomeTitle: { color: "#f1f5f9", fontSize: 22, fontWeight: 800, margin: 0 },
  welcomeSub: { color: "#64748b", fontSize: 14, marginTop: 4 },
  creditBadge: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 14, padding: "12px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  creditIcon: { fontSize: 20 },
  creditNum: { color: "#f97316", fontWeight: 900, fontSize: 28, lineHeight: 1 },
  creditLbl: { color: "#64748b", fontSize: 11 },

  lowCreditBanner: { margin: "0 28px 16px", background: "#7c2d1220", border: "1px solid #7c2d12", borderRadius: 10, padding: "10px 16px", color: "#fca57a", fontSize: 13 },

  sectionHeader: { padding: "20px 28px 12px" },
  sectionTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: 0 },
  sectionSub: { color: "#64748b", fontSize: 14, marginTop: 4 },

  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, padding: "0 28px 8px" },
  featureCard: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, padding: 20, cursor: "pointer", transition: "border-color 0.2s" },
  featureIcon: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 },
  featureLabel: { color: "#f1f5f9", fontWeight: 700, fontSize: 15, margin: "0 0 6px" },
  featureDesc: { color: "#64748b", fontSize: 13, margin: "0 0 12px" },
  featureCreditBadge: { display: "inline-block", fontSize: 12, fontWeight: 600, border: "1px solid", borderRadius: 6, padding: "2px 8px" },

  examTable: { margin: "0 28px 24px", border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden" },
  examTableHeader: { display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", background: "#111827", padding: "10px 16px" },
  examTh: { color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase" },
  examRow: { display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", padding: "10px 16px", borderTop: "1px solid #1e293b" },
  examTd: { color: "#94a3b8", fontSize: 13 },

  plansGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, padding: "0 28px 20px" },
  planCard: { background: "#0d1421", border: "2px solid", borderRadius: 20, padding: 24, position: "relative", overflow: "hidden" },
  planBadge: { position: "absolute", top: 0, right: 0, borderRadius: "0 18px 0 12px", padding: "4px 14px", fontSize: 11, fontWeight: 800, color: "#fff" },
  planName: { fontSize: 20, fontWeight: 800, marginBottom: 4 },
  planPrice: { fontSize: 36, fontWeight: 900, color: "#f1f5f9", margin: "8px 0 4px" },
  planPeriod: { fontSize: 16, color: "#64748b", fontWeight: 500 },
  planCredits: { color: "#94a3b8", fontSize: 14, marginBottom: 16 },
  planPerks: { listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 6 },
  planPerk: { color: "#94a3b8", fontSize: 13 },
  payNote: { textAlign: "center", color: "#475569", fontSize: 13, marginBottom: 12, padding: "0 28px" },
  cyberNote: { margin: "0 28px 20px", background: "#052e1620", border: "1px solid #14532d", borderRadius: 12, padding: "12px 16px", color: "#86efac", fontSize: 13 },
  btnPrimary: { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" },
};