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
    creditsLabel: "1 clean download",
    validity: "One-time",
    color: "#22c55e",
    badge: null,
    tag: "One clean file when you need it",
    icon: "SF",
    highlight: false,
    perks: ["1 Clean Download", "No watermark", "Perfect for urgent one-off use"],
    note: null,
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    period: "30 days",
    credits: 40,
    validity: "30 Days",
    color: "#f97316",
    badge: "Most Popular",
    tag: "Best for regular use",
    icon: "ST",
    highlight: true,
    perks: ["40 Credits", "Valid 30 Days", "All core tools", "Best for regular aspirants"],
    note: null,
  },
  {
    id: "pro",
    name: "Pro Unlimited",
    price: 79,
    period: "30 days",
    credits: "Unlimited*",
    validity: "30 Days",
    color: "#8b5cf6",
    badge: "Best Value",
    tag: "Best for heavy daily use",
    icon: "PR",
    highlight: true,
    perks: ["Unlimited operations*", "Valid 30 Days", "All features", "Best for heavy daily use"],
    note: "* Fair usage policy: max 80 operations/day",
  },
];

const COMPARISON = [
  {
    feature: "Exam-ready photo sizing",
    cafe: "Depends on operator",
    sites: "Usually generic resize only",
    us: "Built for exam specs",
  },
  {
    feature: "Photo + sign + date merge",
    cafe: "Extra charge or manual work",
    sites: "Often split across tools",
    us: "One guided flow",
  },
  {
    feature: "Start free",
    cafe: "No",
    sites: "Usually limited",
    us: "15 credits + 5 every 7 days",
  },
  {
    feature: "Urgent one-time fix",
    cafe: "Rs.50 - Rs.100",
    sites: "Plans or signup first",
    us: "Rs.9 Single Fix",
  },
  {
    feature: "Mobile-friendly use",
    cafe: "Visit shop required",
    sites: "Mixed experience",
    us: "Built for phone and desktop",
  },
  {
    feature: "Time needed",
    cafe: "Travel + wait",
    sites: "Tool hopping",
    us: "Few minutes in one place",
  },
  {
    feature: "Convenience",
    cafe: "Go outside and pay per task",
    sites: "Use multiple websites",
    us: "One workspace for common tasks",
  },
  {
    feature: "Total expected spend",
    cafe: "Rs.100 - Rs.200",
    sites: "Varies across tools",
    us: "Rs.0 - Rs.79",
  },
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
            <span style={{ color: plan.color, marginRight: 6, flexShrink: 0 }}>+</span>
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
            <p style={{ ...s.pageSub, ...(isMobile ? s.pageSubMobile : null) }}>Start free, pay only when you need more downloads.</p>
          </div>

          <div style={{ ...s.freeBanner, ...(isMobile ? s.bannerMobile : null) }}>
            <span style={s.bannerIcon}>FR</span>
            <div style={{ flex: 1 }}>
              <p style={{ ...s.freeTitle, ...(isMobile ? s.bannerTitleMobile : null) }}>Free - 15 credits + 5 every 7 days</p>
              <p style={{ ...s.freeSub, ...(isMobile ? s.bannerSubMobile : null) }}>Try the tools first. No payment needed to get started.</p>
            </div>
            <span style={s.freeBadge}>FREE</span>
          </div>

          <div style={{ ...s.singleBanner, ...(isMobile ? s.bannerMobile : null) }}>
            <span style={s.bannerIcon}>{singleFixPlan.icon}</span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ ...s.singleTitle, ...(isMobile ? s.bannerTitleMobile : null) }}>Single Fix - Rs.{singleFixPlan.price} for 1 clean download</p>
              <p style={{ ...s.singleSub, ...(isMobile ? s.bannerSubMobile : null) }}>Best for one urgent file when you do not need a full plan.</p>
            </div>
            <div style={{ ...s.singleActionWrap, ...(isMobile ? s.singleActionWrapMobile : null) }}>
              <span style={s.singleBadge}>ONE-TIME</span>
              <span style={s.singleInfo}>Used for one final download after preview.</span>
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
            <h2 style={{ ...s.tableTitle, ...(isMobile ? s.tableTitleMobile : null) }}>Compare Your Options</h2>
            <p style={{ ...s.tableSub, ...(isMobile ? s.tableSubMobile : null) }}>See how FormFixer compares with cyber cafes and typical online tools.</p>
            <div style={{ ...s.table, ...(isMobile ? s.tableMobile : null) }}>
              <div style={s.tableHead}>
                <div style={{ ...s.cell, flex: 1.55, color: "#64748b", fontWeight: 700, fontSize: 11, textTransform: "uppercase" }}>Feature</div>
                <div style={{ ...s.cell, color: "#ef4444", fontWeight: 700, fontSize: 11 }}>Cyber Cafe</div>
                <div style={{ ...s.cell, color: "#f59e0b", fontWeight: 700, fontSize: 11 }}>Other Sites</div>
                <div style={{ ...s.cell, color: "#22c55e", fontWeight: 700, fontSize: 11 }}>FormFixer</div>
              </div>
              {COMPARISON.map((row, index) => (
                <div key={row.feature} style={{ ...s.tableRow, background: index % 2 === 0 ? "#0d1421" : "#070c18" }}>
                  <div style={{ ...s.cell, flex: 1.55, color: "#94a3b8", fontWeight: 600 }}>{row.feature}</div>
                  <div style={{ ...s.cell, color: "#ef444499" }}>{row.cafe}</div>
                  <div style={{ ...s.cell, color: "#fbbf24" }}>{row.sites}</div>
                  <div style={{ ...s.cell, color: "#22c55e", fontWeight: 700 }}>{row.us}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...s.cta, ...(isMobile ? s.ctaMobile : null) }}>
            <p style={{ color: "#94a3b8", fontSize: isMobile ? 15 : 14, lineHeight: 1.6, margin: 0 }}>
              Free credits are enough for many first-time users. Choose a paid plan only if you need more downloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 60 },
  content: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 22, maxWidth: 960, width: "100%", boxSizing: "border-box" },
  contentMobile: { padding: "16px", gap: 18 },

  pageHdr: {},
  pageTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 22, margin: "0 0 6px" },
  pageSub: { color: "#64748b", fontSize: 14, margin: 0 },
  pageTitleMobile: { fontSize: 24, lineHeight: 1.2 },
  pageSubMobile: { fontSize: 15, lineHeight: 1.5 },

  bannerIcon: { fontSize: 16, fontWeight: 800, flexShrink: 0 },
  freeBanner: { background: "#052e1620", border: "1px solid #14532d", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  bannerMobile: { alignItems: "flex-start", gap: 12, padding: "16px" },
  freeTitle: { color: "#86efac", fontWeight: 700, fontSize: 14, margin: "0 0 2px" },
  freeSub: { color: "#64748b", fontSize: 12, margin: 0, lineHeight: 1.55 },
  bannerTitleMobile: { fontSize: 15, lineHeight: 1.45 },
  bannerSubMobile: { fontSize: 14, lineHeight: 1.6 },
  freeBadge: { background: "#052e16", color: "#86efac", border: "1px solid #14532d", borderRadius: 8, padding: "4px 14px", fontSize: 13, fontWeight: 800, flexShrink: 0 },

  singleBanner: { background: "#0f172a", border: "1px solid #22c55e55", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  singleTitle: { color: "#22c55e", fontWeight: 800, fontSize: 14, margin: "0 0 2px" },
  singleSub: { color: "#94a3b8", fontSize: 12, margin: 0, lineHeight: 1.55 },
  singleActionWrap: { display: "flex", alignItems: "center", gap: 10, marginLeft: "auto", flexWrap: "wrap" },
  singleActionWrapMobile: { marginLeft: 0, width: "100%", justifyContent: "space-between" },
  singleBadge: { background: "#052e16", color: "#86efac", border: "1px solid #14532d", borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 800 },
  singleInfo: { color: "#64748b", fontSize: 12, lineHeight: 1.5 },

  successAlert: { background: "#052e16", border: "1px solid #14532d", borderRadius: 12, padding: "14px 18px", color: "#86efac", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  alertBtn: { background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  errorAlert: { background: "#450a0a30", border: "1px solid #7f1d1d", borderRadius: 12, padding: "14px 18px", color: "#fca5a5", fontSize: 14 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, alignItems: "stretch", width: "100%" },
  gridMobile: { gridTemplateColumns: "1fr", gap: 14 },

  planCard: { background: "#0d1421", border: "1px solid", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", height: "100%", minHeight: 318, width: "100%", boxSizing: "border-box", transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease" },
  planCardMobile: { minHeight: "auto", padding: 18 },
  badge: { position: "absolute", top: 0, right: 0, borderRadius: "0 14px 0 10px", padding: "3px 10px", fontSize: 10, fontWeight: 800, color: "#fff" },
  planTop: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, marginTop: 4 },
  planIcon: { width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 },
  planName: { fontSize: 16, fontWeight: 800, margin: "0 0 2px", lineHeight: 1.15 },
  planTag: { color: "#475569", fontSize: 11, margin: 0, lineHeight: 1.4 },
  planNameMobile: { fontSize: 18, lineHeight: 1.2 },
  planTagMobile: { fontSize: 13, lineHeight: 1.5 },

  priceRow: { display: "flex", alignItems: "baseline", gap: 2, marginBottom: 10 },
  rupee: { color: "#94a3b8", fontSize: 14, fontWeight: 700 },
  priceNum: { color: "#f1f5f9", fontWeight: 900, fontSize: 30, lineHeight: 1 },
  pricePd: { color: "#64748b", fontSize: 12, marginLeft: 3 },
  priceRowMobile: { gap: 4, marginBottom: 12, flexWrap: "wrap" },
  rupeeMobile: { fontSize: 18 },
  priceNumMobile: { fontSize: 36 },
  pricePdMobile: { fontSize: 15, marginLeft: 4 },

  metaRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  metaPill: { border: "1px solid", borderRadius: 999, padding: "4px 9px", fontSize: 11, fontWeight: 700 },
  validity: { color: "#64748b", fontSize: 11 },
  metaRowMobile: { gap: 10, marginBottom: 14 },
  metaPillMobile: { padding: "5px 11px", fontSize: 12, borderRadius: 999 },
  validityMobile: { fontSize: 12 },

  perks: { listStyle: "none", padding: 0, margin: "0 0 10px", display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  perk: { color: "#94a3b8", fontSize: 12, display: "flex", alignItems: "flex-start", lineHeight: 1.45 },
  perkMobile: { fontSize: 14, lineHeight: 1.55 },
  fupNote: { color: "#f59e0b", fontSize: 11, margin: "0 0 10px", fontStyle: "italic", lineHeight: 1.5 },
  fupNoteMobile: { fontSize: 12, lineHeight: 1.55 },
  buyBtn: { color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%", marginTop: "auto" },
  buyBtnMobile: { padding: "12px 0", fontSize: 15 },

  payNote: { textAlign: "center", color: "#334155", fontSize: 12 },
  payNoteMobile: { fontSize: 13, lineHeight: 1.5 },

  tableTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: "0 0 4px" },
  tableSub: { color: "#64748b", fontSize: 13, margin: "0 0 12px" },
  tableTitleMobile: { fontSize: 20, lineHeight: 1.25 },
  tableSubMobile: { fontSize: 14, lineHeight: 1.55 },
  table: { border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden" },
  tableMobile: { overflowX: "auto" },
  tableHead: { display: "flex", background: "#111827", padding: "10px 16px", gap: 8 },
  tableRow: { display: "flex", padding: "10px 16px", gap: 8, borderTop: "1px solid #1e293b" },
  cell: { flex: 1, fontSize: 13 },

  cta: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  ctaMobile: { padding: "16px", gap: 14 },
};
