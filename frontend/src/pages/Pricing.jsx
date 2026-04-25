import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import useIsMobile from "../hooks/useIsMobile";

const PLANS = [
  {
    id: "single",
    name: "Single Fix",
    price: 9,
    period: "one-time",
    credits: 1,
    creditsLabel: "1 Download",
    validity: "Without Watermark",
    color: "#22c55e",
    badge: null,
    tag: "No account needed",
    icon: "⚡",
    highlight: false,
    perks: ["1 Clean Download (No Watermark)", "Any Single Feature", "Instant Access"],
    note: null,
  },
  {
    id: "emergency",
    name: "Emergency Pack",
    price: 19,
    period: "7 days",
    credits: 15,
    validity: "7 Days",
    color: "#f97316",
    badge: null,
    tag: "Last-minute form bharne wale",
    icon: "🚨",
    highlight: false,
    perks: ["15 Credits", "Valid 7 Days", "All Exam Formats", "Photo + Signature", "Document Size Changer"],
    note: null,
  },
  {
    id: "unlimited",
    name: "Daily Unlimited",
    price: 29,
    period: "24 hours",
    credits: "Unlimited*",
    validity: "24 Hours",
    color: "#a855f7",
    badge: "New",
    tag: "Heavy users & groups",
    icon: "∞",
    highlight: true,
    perks: ["Unlimited Operations*", "Valid 24 Hours", "All Features", "PDF Editor", "Resume Builder", "Priority Processing"],
    note: "* Fair Usage Policy: max 50 operations/day",
  },
  {
    id: "standard",
    name: "Standard",
    price: 59,
    period: "month",
    credits: 60,
    validity: "1 Month",
    color: "#3b82f6",
    badge: "Best Seller",
    tag: "Serious aspirants",
    icon: "🎯",
    highlight: true,
    perks: ["60 Credits", "Valid 1 Month", "All Exam Formats", "Photo + Signature + Merger", "Document Size Changer", "PDF Editor", "Resume Builder"],
    note: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: 139,
    period: "3 months",
    credits: 150,
    validity: "3 Months",
    color: "#ec4899",
    badge: "Best Value",
    tag: "Power users & coaching centers",
    icon: "👑",
    highlight: false,
    perks: ["150 Credits", "Valid 3 Months", "All Features Unlocked", "PDF Editor + Resume Builder", "Merger Feature", "Priority Support", "Early Access to New Tools"],
    note: null,
  },
];

const COMPARISON = [
  { feature: "Photo + Sign Resize", cafe: "Rs.20 - Rs.50", us: "Rs.0 (Free Credits)" },
  { feature: "Document Scanning", cafe: "Rs.10 per page", us: "FREE (Mobile cam)" },
  { feature: "Urgent Form Fix", cafe: "Rs.50 - Rs.100", us: "Rs.9 (Single Fix)" },
  { feature: "Waqt ki Barbadi", cafe: "1-2 Ghante (Line mein)", us: "Sirf 10 Second" },
  { feature: "Travel Cost", cafe: "Rs.20-Rs.40 (Auto/Petrol)", us: "Rs.0 (Ghar baithe)" },
  { feature: "Total Kharcha", cafe: "Rs.100 - Rs.200", us: "Rs.9 - Rs.59" },
];

const singleFixPlan = PLANS.find((plan) => plan.id === "single");
const paidPlans = PLANS.filter((plan) => plan.id !== "single");

async function openRazorpay({ order, plan, user, onSuccess, onFailure }) {
  if (!window.Razorpay) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const options = {
    key: order.keyId,
    amount: order.amount,
    currency: "INR",
    name: "FormFixer",
    description: plan.name,
    order_id: order.orderId,
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
    },
    theme: { color: plan.color },
    modal: { ondismiss: () => onFailure("Payment cancelled.") },
    handler: (response) => onSuccess(response),
  };

  const razorpay = new window.Razorpay(options);
  razorpay.on("payment.failed", () => onFailure("Payment failed. Please try again."));
  razorpay.open();
}

function PlanCard({ plan, onBuy, loading, compact }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...s.planCard,
        ...(compact ? s.planCardMobile : null),
        borderColor: plan.color,
        borderWidth: plan.highlight ? 2 : 1,
        boxShadow: isHovered
          ? `0 18px 40px ${plan.color}30`
          : plan.highlight
            ? `0 0 20px ${plan.color}20`
            : "none",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {plan.badge && <div style={{ ...s.badge, background: plan.color }}>{plan.badge}</div>}

      <div style={s.planTop}>
        <div style={{ ...s.planIcon, background: `${plan.color}18`, color: plan.color }}>{plan.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ ...s.planName, ...(compact ? s.planNameMobile : null), color: plan.color }}>{plan.name}</h3>
          <p style={{ ...s.planTag, ...(compact ? s.planTagMobile : null) }}>{plan.tag}</p>
        </div>
      </div>

      <div style={{ ...s.priceRow, ...(compact ? s.priceRowMobile : null) }}>
        <span style={{ ...s.rupee, ...(compact ? s.rupeeMobile : null) }}>Rs.</span>
        <span style={{ ...s.priceNum, ...(compact ? s.priceNumMobile : null) }}>{plan.price}</span>
        <span style={{ ...s.pricePd, ...(compact ? s.pricePdMobile : null) }}>/ {plan.period}</span>
      </div>

      <div style={{ ...s.metaRow, ...(compact ? s.metaRowMobile : null) }}>
        <span style={{ ...s.metaPill, ...(compact ? s.metaPillMobile : null), color: plan.color, borderColor: `${plan.color}44` }}>
          {plan.creditsLabel || `${plan.credits} ${typeof plan.credits === "number" ? "credits" : ""}`}
        </span>
        <span style={{ ...s.validity, ...(compact ? s.validityMobile : null) }}>{plan.validity}</span>
      </div>

      <ul style={s.perks}>
        {plan.perks.map((perk) => (
          <li key={perk} style={{ ...s.perk, ...(compact ? s.perkMobile : null) }}>
            <span style={{ color: plan.color, marginRight: 6, flexShrink: 0 }}>✓</span>
            {perk}
          </li>
        ))}
      </ul>

      {plan.note && <p style={{ ...s.fupNote, ...(compact ? s.fupNoteMobile : null) }}>{plan.note}</p>}

      <button
        onClick={() => onBuy(plan)}
        disabled={loading}
        style={{ ...s.buyBtn, ...(compact ? s.buyBtnMobile : null), background: plan.color, opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Opening..." : `Buy ${plan.name}`}
      </button>
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = credits ?? user?.credits ?? 0;
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");

  const handleBuy = async (plan) => {
    setPayError("");
    setPaySuccess("");
    setLoadingPlan(plan.id);

    try {
      const API = (await import("../api/axios")).default;
      const { data: order } = await API.post("/payment/create-order", { planId: plan.id });

      await openRazorpay({
        order,
        plan,
        user,
        onSuccess: async (response) => {
          try {
            const { data: result } = await API.post("/payment/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            updateCredits(result.credits);
            setPaySuccess(
              `Payment successful! ${
                result.creditsAdded === "Unlimited"
                  ? "Unlimited access activated"
                  : `${result.creditsAdded} credits added`
              }. Enjoy ${plan.name}!`
            );
          } catch {
            setPayError("Payment received but verification failed. Contact support with your payment ID.");
          }
        },
        onFailure: (message) => {
          setPayError(message);
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
        <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : null) }}>
          <div style={s.pageHdr}>
            <h1 style={{ ...s.pageTitle, ...(isMobile ? s.pageTitleMobile : null) }}>Choose Your Plan</h1>
            <p style={{ ...s.pageSub, ...(isMobile ? s.pageSubMobile : null) }}>Designed for Indian aspirants. Pay only for what you need.</p>
          </div>

          <div style={{ ...s.freeBanner, ...(isMobile ? s.bannerMobile : null) }}>
            <span style={s.bannerIcon}>↻</span>
            <div style={{ flex: 1 }}>
              <p style={{ ...s.freeTitle, ...(isMobile ? s.bannerTitleMobile : null) }}>Weekly Free Refill - 5 Credits Every 7 Days</p>
              <p style={{ ...s.freeSub, ...(isMobile ? s.bannerSubMobile : null) }}>Auto-credited on every login after 7 days. No payment needed.</p>
            </div>
            <span style={s.freeBadge}>FREE</span>
          </div>

          <div style={{ ...s.singleBanner, ...(isMobile ? s.bannerMobile : null) }}>
            <span style={s.bannerIcon}>{singleFixPlan.icon}</span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ ...s.singleTitle, ...(isMobile ? s.bannerTitleMobile : null) }}>Single Fix - Rs.{singleFixPlan.price} for 1 Download Without Watermark</p>
              <p style={{ ...s.singleSub, ...(isMobile ? s.bannerSubMobile : null) }}>Best for one urgent form fix. No credit pack needed, just one clean download when you need it.</p>
            </div>
            <div style={{ ...s.singleActionWrap, ...(isMobile ? s.singleActionWrapMobile : null) }}>
              <span style={s.singleBadge}>ONE-TIME</span>
              <button
                onClick={() => handleBuy(singleFixPlan)}
                disabled={loadingPlan === singleFixPlan.id}
                style={{ ...s.singleBtn, ...(isMobile ? s.singleBtnMobile : null), opacity: loadingPlan === singleFixPlan.id ? 0.6 : 1 }}
              >
                {loadingPlan === singleFixPlan.id ? "Opening..." : "Get Single Fix"}
              </button>
            </div>
          </div>

          {paySuccess && (
            <div style={s.successAlert}>
              {paySuccess}
              <button onClick={() => navigate("/dashboard")} style={s.alertBtn}>Go to Dashboard</button>
            </div>
          )}

          {payError && <div style={s.errorAlert}>Warning: {payError}</div>}

          <div style={{ ...s.grid, ...(isMobile ? s.gridMobile : null) }}>
            {paidPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onBuy={handleBuy}
                loading={loadingPlan === plan.id}
                compact={isMobile}
              />
            ))}
          </div>

          <p style={{ ...s.payNote, ...(isMobile ? s.payNoteMobile : null) }}>Razorpay · UPI · Cards · Net Banking · Paytm · PhonePe · GPay</p>

          <div>
            <h2 style={{ ...s.tableTitle, ...(isMobile ? s.tableTitleMobile : null) }}>Hum Behtar Kyun Hain?</h2>
            <p style={{ ...s.tableSub, ...(isMobile ? s.tableSubMobile : null) }}>FormFixer vs Cyber Cafe - Apna Faisla Khud Karo</p>
            <div style={{ ...s.table, ...(isMobile ? s.tableMobile : null) }}>
              <div style={s.tableHead}>
                <div style={{ ...s.cell, flex: 2, color: "#64748b", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Feature</div>
                <div style={{ ...s.cell, color: "#ef4444", fontWeight: 700, fontSize: 11 }}>Cyber Cafe</div>
                <div style={{ ...s.cell, color: "#22c55e", fontWeight: 700, fontSize: 11 }}>FormFixer</div>
              </div>
              {COMPARISON.map((row, index) => (
                <div key={row.feature} style={{ ...s.tableRow, background: index % 2 === 0 ? "#0d1421" : "#070c18" }}>
                  <div style={{ ...s.cell, flex: 2, color: "#94a3b8", fontWeight: 600 }}>{row.feature}</div>
                  <div style={{ ...s.cell, color: "#ef444499" }}>{row.cafe}</div>
                  <div style={{ ...s.cell, color: "#22c55e", fontWeight: 700 }}>{row.us}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...s.cta, ...(isMobile ? s.ctaMobile : null) }}>
            <p style={{ color: "#94a3b8", fontSize: isMobile ? 15 : 14, lineHeight: 1.5, margin: 0 }}>Still not sure? Start with Single Fix for one watermark-free download.</p>
            <button onClick={() => handleBuy(singleFixPlan)} style={{ ...s.ctaBtn, ...(isMobile ? s.ctaBtnMobile : null) }}>Get Single Fix for Rs.{singleFixPlan.price}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 60 },
  content: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 22, maxWidth: 1100, width: "100%", boxSizing: "border-box" },
  contentMobile: { padding: "16px", gap: 18 },

  pageHdr: {},
  pageTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 22, margin: "0 0 6px" },
  pageSub: { color: "#64748b", fontSize: 14, margin: 0 },
  pageTitleMobile: { fontSize: 24, lineHeight: 1.2 },
  pageSubMobile: { fontSize: 15, lineHeight: 1.5 },

  bannerIcon: { fontSize: 20, flexShrink: 0 },
  freeBanner: { background: "#052e1620", border: "1px solid #14532d", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  bannerMobile: { alignItems: "flex-start", gap: 12, padding: "16px 16px" },
  freeTitle: { color: "#86efac", fontWeight: 700, fontSize: 14, margin: "0 0 2px" },
  freeSub: { color: "#64748b", fontSize: 12, margin: 0 },
  bannerTitleMobile: { fontSize: 15, lineHeight: 1.4 },
  bannerSubMobile: { fontSize: 14, lineHeight: 1.55 },
  freeBadge: { background: "#052e16", color: "#86efac", border: "1px solid #14532d", borderRadius: 8, padding: "4px 14px", fontSize: 13, fontWeight: 800, flexShrink: 0 },

  singleBanner: { background: "#0f172a", border: "1px solid #22c55e55", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  singleTitle: { color: "#22c55e", fontWeight: 800, fontSize: 14, margin: "0 0 2px" },
  singleSub: { color: "#94a3b8", fontSize: 12, margin: 0, lineHeight: 1.5 },
  singleActionWrap: { display: "flex", alignItems: "center", gap: 10, marginLeft: "auto", flexWrap: "wrap" },
  singleActionWrapMobile: { marginLeft: 0, width: "100%", justifyContent: "space-between" },
  singleBadge: { background: "#052e16", color: "#86efac", border: "1px solid #14532d", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 800 },
  singleBtn: { background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 9, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  singleBtnMobile: { width: "100%", justifyContent: "center", textAlign: "center", padding: "12px 16px", fontSize: 14 },

  successAlert: { background: "#052e16", border: "1px solid #14532d", borderRadius: 12, padding: "14px 18px", color: "#86efac", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  alertBtn: { background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  errorAlert: { background: "#450a0a30", border: "1px solid #7f1d1d", borderRadius: 12, padding: "14px 18px", color: "#fca5a5", fontSize: 14 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, alignItems: "stretch", width: "100%" },
  gridMobile: { gridTemplateColumns: "1fr", gap: 14 },

  planCard: { background: "#0d1421", border: "1px solid", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", height: "100%", minHeight: 315, width: "100%", boxSizing: "border-box", transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease" },
  planCardMobile: { minHeight: "auto", padding: 18 },
  badge: { position: "absolute", top: 0, right: 0, borderRadius: "0 14px 0 10px", padding: "3px 10px", fontSize: 10, fontWeight: 800, color: "#fff" },
  planTop: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, marginTop: 4 },
  planIcon: { width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 },
  planName: { fontSize: 14, fontWeight: 800, margin: "0 0 2px", lineHeight: 1.1 },
  planTag: { color: "#475569", fontSize: 10, margin: 0, lineHeight: 1.3 },
  planNameMobile: { fontSize: 18, lineHeight: 1.2 },
  planTagMobile: { fontSize: 13, lineHeight: 1.45 },

  priceRow: { display: "flex", alignItems: "baseline", gap: 2, marginBottom: 10 },
  rupee: { color: "#94a3b8", fontSize: 14, fontWeight: 700 },
  priceNum: { color: "#f1f5f9", fontWeight: 900, fontSize: 28, lineHeight: 1 },
  pricePd: { color: "#64748b", fontSize: 11, marginLeft: 3 },
  priceRowMobile: { gap: 4, marginBottom: 12, flexWrap: "wrap" },
  rupeeMobile: { fontSize: 18 },
  priceNumMobile: { fontSize: 36 },
  pricePdMobile: { fontSize: 15, marginLeft: 4 },

  metaRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  metaPill: { border: "1px solid", borderRadius: 5, padding: "2px 7px", fontSize: 10, fontWeight: 700 },
  validity: { color: "#64748b", fontSize: 10 },
  metaRowMobile: { gap: 10, marginBottom: 14 },
  metaPillMobile: { padding: "4px 10px", fontSize: 12, borderRadius: 7 },
  validityMobile: { fontSize: 12 },

  perks: { listStyle: "none", padding: 0, margin: "0 0 10px", display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  perk: { color: "#94a3b8", fontSize: 11, display: "flex", alignItems: "flex-start", lineHeight: 1.4 },
  fupNote: { color: "#f59e0b", fontSize: 10, margin: "0 0 10px", fontStyle: "italic" },
  buyBtn: { color: "#fff", border: "none", borderRadius: 9, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%", marginTop: "auto" },
  perkMobile: { fontSize: 14, lineHeight: 1.55, gap: 2 },
  fupNoteMobile: { fontSize: 12, lineHeight: 1.5 },
  buyBtnMobile: { padding: "12px 0", fontSize: 15 },

  payNote: { textAlign: "center", color: "#334155", fontSize: 12 },
  payNoteMobile: { fontSize: 13, lineHeight: 1.5 },

  tableTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: "0 0 4px" },
  tableSub: { color: "#64748b", fontSize: 13, margin: "0 0 12px" },
  table: { border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden" },
  tableTitleMobile: { fontSize: 20, lineHeight: 1.25 },
  tableSubMobile: { fontSize: 14, lineHeight: 1.55 },
  tableMobile: { overflowX: "auto" },
  tableHead: { display: "flex", background: "#111827", padding: "10px 16px", gap: 8 },
  tableRow: { display: "flex", padding: "10px 16px", gap: 8, borderTop: "1px solid #1e293b" },
  cell: { flex: 1, fontSize: 13 },

  cta: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  ctaBtn: { background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 },
  ctaMobile: { padding: "16px", gap: 14 },
  ctaBtnMobile: { width: "100%", textAlign: "center", padding: "12px 16px", fontSize: 14 },
};
