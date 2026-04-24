import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const PLANS = [
  {
    id: "single", name: "Single Fix", price: 9, period: "one-time",
    credits: 1, validity: "1 download", color: "#22c55e", badge: null,
    tag: "No account needed", icon: "⚡", highlight: false,
    perks: ["1 Clean Download (No Watermark)", "Any Single Feature", "Instant Access"],
    note: null,
  },
  {
    id: "emergency", name: "Emergency Pack", price: 19, period: "7 days",
    credits: 15, validity: "7 Days", color: "#f97316", badge: null,
    tag: "Last-minute form bharne wale", icon: "🚨", highlight: false,
    perks: ["15 Credits", "Valid 7 Days", "All Exam Formats", "Photo + Signature", "Document Size Changer"],
    note: null,
  },
  {
    id: "unlimited", name: "Daily Unlimited", price: 29, period: "month",
    credits: "Unlimited*", validity: "30 Days", color: "#a855f7", badge: "🔥 New",
    tag: "Heavy users & groups", icon: "∞", highlight: true,
    perks: ["Unlimited Operations*", "Valid 30 Days", "All Features", "PDF Editor", "Resume Builder", "Priority Processing"],
    note: "* Fair Usage Policy: max 50 operations/day",
  },
  {
    id: "standard", name: "Standard", price: 59, period: "month",
    credits: 60, validity: "1 Month", color: "#3b82f6", badge: "⭐ Best Seller",
    tag: "Serious aspirants", icon: "🎯", highlight: true,
    perks: ["60 Credits", "Valid 1 Month", "All Exam Formats", "Photo + Signature + Merger", "Document Size Changer", "PDF Editor", "Resume Builder"],
    note: null,
  },
  {
    id: "pro", name: "Pro", price: 139, period: "3 months",
    credits: 150, validity: "3 Months", color: "#ec4899", badge: "💎 Best Value",
    tag: "Power users & coaching centers", icon: "👑", highlight: false,
    perks: ["150 Credits", "Valid 3 Months", "All Features Unlocked", "PDF Editor + Resume Builder", "Merger Feature", "Priority Support", "Early Access to New Tools"],
    note: null,
  },
];

const COMPARISON = [
  { feature: "Photo + Sign Resize",  cafe: "₹20 – ₹50",            us: "₹0 (Free Credits)" },
  { feature: "Document Scanning",    cafe: "₹10 per page",          us: "FREE (Mobile cam)" },
  { feature: "Urgent Form Fix",      cafe: "₹50 – ₹100",           us: "₹9 (Single Fix)" },
  { feature: "Waqt ki Barbadi",      cafe: "1–2 Ghante (Line mein)",us: "Sirf 10 Second" },
  { feature: "Travel Cost",          cafe: "₹20–₹40 (Auto/Petrol)", us: "₹0 (Ghar baithe)" },
  { feature: "Total Kharcha",        cafe: "₹100 – ₹200",          us: "₹9 – ₹59" },
];

// ── Razorpay checkout helper ──────────────────────────────────────────────────
async function openRazorpay({ order, plan, user, onSuccess, onFailure }) {
  // Load Razorpay script dynamically if not already loaded
  if (!window.Razorpay) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const options = {
    key:         order.keyId,
    amount:      order.amount,
    currency:    "INR",
    name:        "Doc Saathi AI",
    description: plan.name,
    order_id:    order.orderId,
    prefill: {
      name:  user?.name  || "",
      email: user?.email || "",
    },
    theme: { color: plan.color },
    modal: { ondismiss: () => onFailure("Payment cancelled.") },
    handler: (response) => onSuccess(response),
  };

  const rzp = new window.Razorpay(options);
  rzp.on("payment.failed", () => onFailure("Payment failed. Please try again."));
  rzp.open();
}

// ── PlanCard ──────────────────────────────────────────────────────────────────
function PlanCard({ plan, onBuy, loading }) {
  return (
    <div style={{
      ...s.planCard,
      borderColor: plan.color,
      borderWidth: plan.highlight ? 2 : 1,
      boxShadow: plan.highlight ? `0 0 20px ${plan.color}20` : "none",
    }}>
      {plan.badge && (
        <div style={{ ...s.badge, background: plan.color }}>{plan.badge}</div>
      )}

      <div style={s.planTop}>
        <div style={{ ...s.planIcon, background: plan.color + "18", color: plan.color }}>{plan.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ ...s.planName, color: plan.color }}>{plan.name}</h3>
          <p style={s.planTag}>{plan.tag}</p>
        </div>
      </div>

      <div style={s.priceRow}>
        <span style={s.rupee}>₹</span>
        <span style={s.priceNum}>{plan.price}</span>
        <span style={s.pricePd}>/ {plan.period}</span>
      </div>

      <div style={s.metaRow}>
        <span style={{ ...s.metaPill, color: plan.color, borderColor: plan.color + "44" }}>
          ⚡ {plan.credits} {typeof plan.credits === "number" ? "credits" : ""}
        </span>
        <span style={s.validity}>🗓 {plan.validity}</span>
      </div>

      <ul style={s.perks}>
        {plan.perks.map(p => (
          <li key={p} style={s.perk}>
            <span style={{ color: plan.color, marginRight: 6, flexShrink: 0 }}>✓</span>{p}
          </li>
        ))}
      </ul>

      {plan.note && <p style={s.fupNote}>{plan.note}</p>}

      <button
        onClick={() => onBuy(plan)}
        disabled={loading}
        style={{ ...s.buyBtn, background: plan.color, opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Opening..." : plan.id === "single" ? "Get Single Fix" : `Buy ${plan.name}`}
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Pricing() {
  const navigate = useNavigate();
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = credits ?? user?.credits ?? 0;
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [payError, setPayError]       = useState("");
  const [paySuccess, setPaySuccess]   = useState("");

  // Import useState
  const { useState } = require("react");

  const handleBuy = async (plan) => {
    setPayError(""); setPaySuccess(""); setLoadingPlan(plan.id);

    try {
      // 1. Create order on backend
      const API = (await import("../api/axios")).default;
      const { data: order } = await API.post("/payment/create-order", { planId: plan.id });

      // 2. Open Razorpay
      await openRazorpay({
        order,
        plan,
        user,
        onSuccess: async (response) => {
          try {
            // 3. Verify on backend
            const { data: result } = await API.post("/payment/verify", {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            // 4. Update credits in store
            updateCredits(result.credits);
            setPaySuccess(`✅ Payment successful! ${result.creditsAdded === "Unlimited" ? "Unlimited access activated" : `${result.creditsAdded} credits added`}. Enjoy ${plan.name}!`);

          } catch (err) {
            setPayError("Payment received but verification failed. Contact support with your payment ID.");
          }
        },
        onFailure: (msg) => {
          setPayError(msg);
        },
      });

    } catch (err) {
      setPayError(err.response?.data?.message || "Could not start payment. Try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div style={s.root}>
      <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} />
        <div style={s.content}>

          <div style={s.pageHdr}>
            <h1 style={s.pageTitle}>💳 Choose Your Plan</h1>
            <p style={s.pageSub}>Designed for Indian aspirants. Pay only for what you need.</p>
          </div>

          {/* Weekly free banner */}
          <div style={s.freeBanner}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🔄</span>
            <div style={{ flex: 1 }}>
              <p style={s.freeTitle}>Weekly Free Refill — 5 Credits Every 7 Days</p>
              <p style={s.freeSub}>Auto-credited on every login after 7 days. No payment needed.</p>
            </div>
            <span style={s.freeBadge}>FREE</span>
          </div>

          {/* Success / Error alerts */}
          {paySuccess && (
            <div style={s.successAlert}>
              {paySuccess}
              <button onClick={() => navigate("/dashboard")} style={s.alertBtn}>Go to Dashboard →</button>
            </div>
          )}
          {payError && (
            <div style={s.errorAlert}>⚠️ {payError}</div>
          )}

          {/* Plans grid */}
          <div style={s.grid}>
            {PLANS.map(plan => (
              <PlanCard
                key={plan.id} plan={plan}
                onBuy={handleBuy}
                loading={loadingPlan === plan.id}
              />
            ))}
          </div>

          <p style={s.payNote}>🔒 Razorpay · UPI · Cards · Net Banking · Paytm · PhonePe · GPay</p>

          {/* Comparison table */}
          <div>
            <h2 style={s.tableTitle}>🏆 Hum Behtar Kyun Hain?</h2>
            <p style={s.tableSub}>Doc Saathi AI vs Cyber Café — Apna Faisla Khud Karo</p>
            <div style={s.table}>
              <div style={s.tableHead}>
                <div style={{ ...s.cell, flex: 2, color: "#64748b", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Feature</div>
                <div style={{ ...s.cell, color: "#ef4444", fontWeight: 700, fontSize: 11 }}>🏪 Cyber Café</div>
                <div style={{ ...s.cell, color: "#22c55e", fontWeight: 700, fontSize: 11 }}>🤖 Doc Saathi AI</div>
              </div>
              {COMPARISON.map((row, i) => (
                <div key={i} style={{ ...s.tableRow, background: i % 2 === 0 ? "#0d1421" : "#070c18" }}>
                  <div style={{ ...s.cell, flex: 2, color: "#94a3b8", fontWeight: 600 }}>{row.feature}</div>
                  <div style={{ ...s.cell, color: "#ef444499" }}>{row.cafe}</div>
                  <div style={{ ...s.cell, color: "#22c55e", fontWeight: 700 }}>{row.us}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={s.cta}>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Still not sure? Start with ₹9 — no commitment.</p>
            <button onClick={() => handleBuy(PLANS[0])} style={s.ctaBtn}>⚡ Get Single Fix for ₹9</button>
          </div>

        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 60 },
  content: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 22, maxWidth: 1100 },

  pageHdr: {}, pageTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 22, margin: "0 0 6px" },
  pageSub: { color: "#64748b", fontSize: 14, margin: 0 },

  freeBanner: { background: "#052e1620", border: "1px solid #14532d", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  freeTitle: { color: "#86efac", fontWeight: 700, fontSize: 14, margin: "0 0 2px" },
  freeSub: { color: "#64748b", fontSize: 12, margin: 0 },
  freeBadge: { background: "#052e16", color: "#86efac", border: "1px solid #14532d", borderRadius: 8, padding: "4px 14px", fontSize: 13, fontWeight: 800, flexShrink: 0 },

  successAlert: { background: "#052e16", border: "1px solid #14532d", borderRadius: 12, padding: "14px 18px", color: "#86efac", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  alertBtn: { background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  errorAlert: { background: "#450a0a30", border: "1px solid #7f1d1d", borderRadius: 12, padding: "14px 18px", color: "#fca5a5", fontSize: 14 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 14, alignItems: "start" },

  planCard: { background: "#0d1421", border: "1px solid", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" },
  badge: { position: "absolute", top: 0, right: 0, borderRadius: "0 14px 0 10px", padding: "3px 10px", fontSize: 10, fontWeight: 800, color: "#fff" },
  planTop: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, marginTop: 4 },
  planIcon: { width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 },
  planName: { fontSize: 14, fontWeight: 800, margin: "0 0 2px", lineHeight: 1.1 },
  planTag: { color: "#475569", fontSize: 10, margin: 0, lineHeight: 1.3 },

  priceRow: { display: "flex", alignItems: "baseline", gap: 2, marginBottom: 10 },
  rupee: { color: "#94a3b8", fontSize: 14, fontWeight: 700 },
  priceNum: { color: "#f1f5f9", fontWeight: 900, fontSize: 28, lineHeight: 1 },
  pricePd: { color: "#64748b", fontSize: 11, marginLeft: 3 },

  metaRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  metaPill: { border: "1px solid", borderRadius: 5, padding: "2px 7px", fontSize: 10, fontWeight: 700 },
  validity: { color: "#64748b", fontSize: 10 },

  perks: { listStyle: "none", padding: 0, margin: "0 0 10px", display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  perk: { color: "#94a3b8", fontSize: 11, display: "flex", alignItems: "flex-start", lineHeight: 1.4 },
  fupNote: { color: "#f59e0b", fontSize: 10, margin: "0 0 10px", fontStyle: "italic" },
  buyBtn: { color: "#fff", border: "none", borderRadius: 9, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%" },

  payNote: { textAlign: "center", color: "#334155", fontSize: 12 },

  tableTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: "0 0 4px" },
  tableSub: { color: "#64748b", fontSize: 13, margin: "0 0 12px" },
  table: { border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden" },
  tableHead: { display: "flex", background: "#111827", padding: "10px 16px", gap: 8 },
  tableRow: { display: "flex", padding: "10px 16px", gap: 8, borderTop: "1px solid #1e293b" },
  cell: { flex: 1, fontSize: 13 },

  cta: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  ctaBtn: { background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 },
};
