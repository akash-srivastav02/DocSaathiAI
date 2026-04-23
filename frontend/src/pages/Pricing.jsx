import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useState } from "react";

const PLANS = [
  {
    id: "unlimited",
    name: "Unlimited",
    price: "₹29",
    period: "24 hours",
    credits: "∞",
    validity: "24 Hours",
    color: "#f97316",
    badge: "🚀 POWER DEAL",
    highlight: true,
    strip: true,
    stripLabel: "💥 Best for Bulk Work — Just ₹29",
    perks: [
      "Unlimited Credits*",
      "Valid 24 Hours Only",
      "FUP: 50 Operations",
      "All Exam Formats",
      "Photo + Signature Resize",
      "PDF Compression",
    ],
    desc: "* Fair Usage Policy — 50 operations max in 24hrs.",
  },
  {
    id: "basic",
    name: "Basic",
    price: "₹19",
    period: "7 days",
    credits: 15,
    validity: "7 Days",
    color: "#22c55e",
    badge: null,
    highlight: false,
    strip: false,
    stripLabel: null,
    perks: [
      "15 Credits",
      "Valid 7 Days",
      "All Exam Formats",
      "Photo + Signature Resize",
      "PDF Compression",
    ],
    desc: "Perfect for a short application sprint.",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹59",
    period: "1 month",
    credits: 60,
    validity: "30 Days",
    color: "#a855f7",
    badge: "POPULAR",
    highlight: false,
    strip: false,
    stripLabel: null,
    perks: [
      "60 Credits",
      "Valid 1 Month",
      "All Exam Formats",
      "Photo + Signature Resize",
      "PDF Compression",
      "PDF Editor",
    ],
    desc: "Ideal for ongoing form submissions.",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: "₹139",
    period: "3 months",
    credits: 150,
    validity: "90 Days",
    color: "#eab308",
    badge: "BEST VALUE",
    highlight: false,
    strip: false,
    stripLabel: null,
    perks: [
      "150 Credits",
      "Valid 3 Months",
      "All Exam Formats",
      "Photo + Signature Resize",
      "PDF Compression",
      "PDF Editor",
      "Resume Builder",
      "Priority Support",
    ],
    desc: "Best rate per credit. Serious applicants.",
  },
];

const COMPARE_ROWS = [
  {
    feature: "Photo + Sign Resize",
    cafe: "₹20 – ₹50",
    us: "₹0 (Free Credits)",
    usGood: true,
  },
  {
    feature: "Document Scanning",
    cafe: "₹10 per page",
    us: "FREE (Mobile Scanner)",
    usGood: true,
  },
  {
    feature: "Urgent Form Fix",
    cafe: "₹50 – ₹100",
    us: "₹9 (Single Fix)",
    usGood: true,
  },
  {
    feature: "Waqt ki Barbadi",
    cafe: "1-2 Ghante (Line mein)",
    us: "Sirf 10 Second ⚡",
    usGood: true,
  },
  {
    feature: "Travelling Cost",
    cafe: "₹20 – ₹40 (Petrol/Auto)",
    us: "₹0 (Ghar Baithe)",
    usGood: true,
  },
  {
    feature: "Total Kharcha",
    cafe: "₹100 – ₹200",
    us: "₹19 – ₹139",
    usGood: true,
    highlight: true,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user, credits, updateCredits, logout } = useStore();
  const [activeNav, setActiveNav] = useState("Pricing");
  const [showPricing, setShowPricing] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const currentCredits = credits ?? user?.credits ?? 0;

  const handleBuy = async (planId) => {
    setLoadingPlan(planId);
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
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSingleFix = async () => {
    setLoadingPlan("single");
    try {
      const { data } = await API.post("/payment/create-order", { planType: "single" });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: "INR",
        name: "DocSaathi",
        description: "Single Fix — Remove Watermark",
        order_id: data.orderId,
        handler: async (response) => {
          const verify = await API.post("/payment/verify", {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          updateCredits(verify.data.credits);
          alert("✅ Watermark removed! Your clean file is ready to download.");
          navigate("/dashboard");
        },
        theme: { color: "#38bdf8" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Payment failed. Try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

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
          onLogout={() => { logout(); navigate("/"); }}
        />

        {/* ── Header ── */}
        <div style={s.header}>
          <div style={s.headerBadge}>💳 Simple Pricing</div>
          <h2 style={s.headerTitle}>Choose Your Plan</h2>
          <p style={s.headerSub}>
            Cheaper than any Cyber Café in India. Pay only for what you need. No hidden fees.
          </p>
        </div>

        {/* ── Single Fix Banner ── */}
        <div style={s.singleFixBanner}>
          <div style={s.sfLeft}>
            <div style={s.sfIconWrap}>
              <span style={s.sfIcon}>🔓</span>
            </div>
            <div>
              <div style={s.sfTitle}>Credits Khatam? No Problem!</div>
              <div style={s.sfDesc}>
                Download karo without watermark — sirf{" "}
                <span style={s.sfHighlight}>₹9</span> mein.
                No plan needed. Pay once, get clean file instantly.
              </div>
              <div style={s.sfTags}>
                <span style={s.sfTag}>✓ No Subscription</span>
                <span style={s.sfTag}>✓ Instant Download</span>
                <span style={s.sfTag}>✓ Pay Only When Needed</span>
              </div>
            </div>
          </div>
          <div style={s.sfRight}>
            <div style={s.sfPrice}>
              ₹9
              <span style={s.sfPerFix}>/fix</span>
            </div>
            <button
              onClick={handleSingleFix}
              disabled={loadingPlan === "single"}
              style={s.sfBtn}
            >
              {loadingPlan === "single" ? "Processing..." : "Remove Watermark →"}
            </button>
            <div style={s.sfNote}>Only when you need it</div>
          </div>
        </div>

        {/* ── Section Label ── */}
        <div style={s.sectionLabel}>
          <div style={s.sectionLine} />
          <span style={s.sectionLabelText}>Or choose a plan for more credits</span>
          <div style={s.sectionLine} />
        </div>

        {/* ── Plans Grid ── */}
        <div style={s.gridWrapper}>
          {/* Row 1: first 2 plans + Unlimited strip card */}
          <div style={s.row}>
            {PLANS.slice(0, 3).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onBuy={handleBuy}
                loading={loadingPlan === plan.id}
              />
            ))}
          </div>
          {/* Row 2: remaining plans centered */}
          <div style={{ ...s.row, justifyContent: "center" }}>
            {PLANS.slice(3).map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onBuy={handleBuy}
                loading={loadingPlan === plan.id}
              />
            ))}
          </div>
        </div>

        {/* ── Cyber Cafe vs DocSaathi ── */}
        <div style={s.vsBox}>
          <div style={s.vsHeader}>
            <div style={s.vsHeaderLeft}>
              <span style={s.vsEmoji}>🏪</span>
              <div>
                <div style={s.vsHeaderTitle}>Cyber Café vs DocSaathi</div>
                <div style={s.vsHeaderSub}>
                  Aap khud decide karo — kaun better hai?
                </div>
              </div>
            </div>
            <div style={s.vsWinnerBadge}>🏆 DocSaathi Wins</div>
          </div>

          <div style={s.vsTableWrap}>
            <table style={s.vsTable}>
              <thead>
                <tr>
                  <th style={{ ...s.vsth, textAlign: "left" }}>Feature</th>
                  <th style={{ ...s.vsth, color: "#ef4444" }}>🏪 Cyber Café</th>
                  <th style={{ ...s.vsth, color: "#22c55e" }}>🤖 DocSaathi AI</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    style={{
                      background: row.highlight
                        ? "#0a1f0a"
                        : i % 2 === 0
                        ? "#0d1421"
                        : "#0a1020",
                    }}
                  >
                    <td style={s.vstdFeature}>{row.feature}</td>
                    <td style={s.vstdCafe}>{row.cafe}</td>
                    <td
                      style={{
                        ...s.vstdUs,
                        fontWeight: row.highlight ? 800 : 600,
                        fontSize: row.highlight ? 14 : 13,
                      }}
                    >
                      {row.us}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={s.vsCta}>
            💡 Toh phir Cyber Café kyun jaao? Ghar baithe karo —{" "}
            <b>watermark remove karo sirf ₹9 mein</b>
          </div>
        </div>

        {/* ── Footer Notes ── */}
        <div style={s.footerNotes}>
          <div style={s.payNote}>
            🔒 Secure via Razorpay &nbsp;·&nbsp; UPI, Cards, Net Banking accepted
          </div>
          <div style={s.fupNote}>
            * <b>Unlimited plan</b> is subject to Fair Usage Policy (FUP).
            Maximum 50 operations within 24 hours.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Plan Card Component
───────────────────────────────────────── */
function PlanCard({ plan, onBuy, loading }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...s.card,
        borderColor: hovered
          ? plan.color
          : plan.strip
          ? plan.color
          : "#1e293b",
        boxShadow: hovered
          ? `0 10px 36px ${plan.color}44`
          : plan.strip
          ? `0 4px 28px ${plan.color}33`
          : "none",
        transform: hovered
          ? "translateY(-6px)"
          : plan.strip
          ? "translateY(-3px)"
          : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Strip Banner */}
      {plan.strip && (
        <div style={{ ...s.stripBanner, background: plan.color }}>
          {plan.stripLabel}
        </div>
      )}

      {/* Badge */}
      {plan.badge && !plan.strip && (
        <div style={{ ...s.badge, background: plan.color }}>{plan.badge}</div>
      )}
      {plan.badge && plan.strip && (
        <div
          style={{
            ...s.badgeStrip,
            color: plan.color,
            borderColor: plan.color,
          }}
        >
          {plan.badge}
        </div>
      )}
      {!plan.badge && <div style={s.badgePlaceholder} />}

      {/* Card Top */}
      <div style={s.cardTop}>
        <div style={{ ...s.planDot, background: plan.color }} />
        <span style={{ ...s.planName, color: plan.color }}>{plan.name}</span>
      </div>

      {/* Price */}
      <div style={s.priceRow}>
        <span style={s.priceAmount}>{plan.price}</span>
        <div style={s.priceRight}>
          <span style={s.pricePeriod}>{plan.period}</span>
          <span
            style={{
              ...s.validityTag,
              background: plan.strip ? plan.color + "22" : "#1e293b",
              color: plan.strip ? plan.color : "#475569",
              border: plan.strip ? `1px solid ${plan.color}55` : "none",
            }}
          >
            {plan.validity}
          </span>
        </div>
      </div>

      {/* Credits Pill */}
      <div
        style={{
          ...s.creditsPill,
          borderColor: plan.color,
          color: plan.color,
          background: plan.strip ? plan.color + "18" : "transparent",
        }}
      >
        {plan.credits}{" "}
        {typeof plan.credits === "number" ? "Credits" : "Unlimited*"}
      </div>

      {/* Desc */}
      <p style={s.planDesc}>{plan.desc}</p>

      {/* Divider */}
      <div style={{ ...s.divider, background: plan.color + "33" }} />

      {/* Perks */}
      <ul style={s.perks}>
        {plan.perks.map((p) => (
          <li key={p} style={s.perk}>
            <span style={{ ...s.checkDot, color: plan.color }}>✓</span>
            {p}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={() => onBuy(plan.id)}
        disabled={loading}
        style={{
          ...s.btn,
          background: plan.strip
            ? hovered
              ? plan.color
              : plan.color + "dd"
            : hovered
            ? plan.color
            : "transparent",
          color: plan.strip ? "#fff" : hovered ? "#fff" : plan.color,
          borderColor: plan.color,
          opacity: loading ? 0.7 : 1,
          fontWeight: plan.strip ? 800 : 700,
          fontSize: plan.strip ? 15 : 14,
        }}
      >
        {loading ? "Processing..." : `Get ${plan.name}`}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   Styles
───────────────────────────────────────── */
const s = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#070c18",
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: {
    flex: 1,
    overflowY: "auto",
    paddingBottom: 48,
  },

  /* Header */
  header: {
    padding: "32px 32px 20px",
    textAlign: "center",
  },
  headerBadge: {
    display: "inline-block",
    background: "#0d1421",
    border: "1px solid #1e293b",
    borderRadius: 20,
    padding: "4px 16px",
    fontSize: 12,
    color: "#64748b",
    marginBottom: 12,
    letterSpacing: 1,
  },
  headerTitle: {
    color: "#f1f5f9",
    fontWeight: 900,
    fontSize: 28,
    margin: "0 0 8px",
  },
  headerSub: {
    color: "#64748b",
    fontSize: 14,
    margin: 0,
  },

  /* Single Fix Banner */
  singleFixBanner: {
    margin: "0 24px 8px",
    background: "linear-gradient(135deg, #0d1f35 0%, #0a1628 100%)",
    border: "1.5px solid #38bdf855",
    borderRadius: 18,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    boxShadow: "0 4px 24px #38bdf811",
  },
  sfLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    flex: 1,
    minWidth: 220,
  },
  sfIconWrap: {
    background: "#38bdf822",
    border: "1.5px solid #38bdf855",
    borderRadius: 14,
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sfIcon: { fontSize: 22 },
  sfTitle: {
    color: "#f1f5f9",
    fontWeight: 800,
    fontSize: 15,
    marginBottom: 6,
  },
  sfDesc: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  sfHighlight: {
    color: "#38bdf8",
    fontWeight: 800,
    fontSize: 15,
  },
  sfTags: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  sfTag: {
    background: "#38bdf811",
    border: "1px solid #38bdf833",
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 11,
    color: "#38bdf8",
    fontWeight: 600,
  },
  sfRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  sfPrice: {
    fontSize: 42,
    fontWeight: 900,
    color: "#38bdf8",
    lineHeight: 1,
    display: "flex",
    alignItems: "flex-end",
    gap: 4,
  },
  sfPerFix: {
    fontSize: 14,
    color: "#475569",
    fontWeight: 500,
    paddingBottom: 6,
  },
  sfBtn: {
    background: "#38bdf8",
    color: "#0a1628",
    border: "none",
    borderRadius: 12,
    padding: "10px 20px",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "opacity 0.2s",
  },
  sfNote: {
    color: "#334155",
    fontSize: 11,
  },

  /* Section Label Divider */
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 24px 8px",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    background: "#1e293b",
    borderRadius: 2,
  },
  sectionLabelText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
    letterSpacing: 0.5,
  },

  /* Grid */
  gridWrapper: {
    padding: "4px 24px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  row: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
  },

  /* Card */
  card: {
    flex: "1 1 200px",
    maxWidth: 280,
    background: "#0d1421",
    border: "1.5px solid",
    borderRadius: 20,
    padding: "20px 20px 20px",
    position: "relative",
    transition: "all 0.25s ease",
    cursor: "default",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  stripBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 11,
    fontWeight: 800,
    color: "#fff",
    padding: "5px 0",
    letterSpacing: 0.8,
    zIndex: 2,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    borderRadius: "0 18px 0 12px",
    padding: "4px 14px",
    fontSize: 10,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: 1,
  },
  badgeStrip: {
    display: "inline-block",
    marginTop: 28,
    marginBottom: 4,
    border: "1px solid",
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1,
    alignSelf: "flex-start",
  },
  badgePlaceholder: { height: 0 },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    marginTop: 28,
  },
  planDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  planName: {
    fontSize: 17,
    fontWeight: 800,
    letterSpacing: 0.5,
  },
  priceRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 12,
  },
  priceAmount: {
    fontSize: 38,
    fontWeight: 900,
    color: "#f1f5f9",
    lineHeight: 1,
  },
  priceRight: {
    display: "flex",
    flexDirection: "column",
    paddingBottom: 4,
    gap: 4,
  },
  pricePeriod: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 500,
  },
  validityTag: {
    fontSize: 11,
    borderRadius: 6,
    padding: "2px 8px",
    fontWeight: 600,
  },
  creditsPill: {
    display: "inline-block",
    border: "1.5px solid",
    borderRadius: 20,
    padding: "3px 14px",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  planDesc: {
    color: "#475569",
    fontSize: 12,
    margin: "0 0 12px",
    fontStyle: "italic",
    lineHeight: 1.5,
  },
  divider: {
    height: 1,
    borderRadius: 2,
    marginBottom: 12,
  },
  perks: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 16px",
    display: "flex",
    flexDirection: "column",
    gap: 7,
    flex: 1,
  },
  perk: {
    color: "#94a3b8",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  checkDot: {
    fontSize: 13,
    fontWeight: 900,
    flexShrink: 0,
  },
  btn: {
    border: "1.5px solid",
    borderRadius: 12,
    padding: "11px 16px",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s ease",
    marginTop: "auto",
  },

  /* Cyber Cafe vs DocSaathi */
  vsBox: {
    margin: "20px 24px 0",
    background: "#0d1421",
    border: "1px solid #1e293b",
    borderRadius: 16,
    overflow: "hidden",
  },
  vsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: "#0a1020",
    borderBottom: "1px solid #1e293b",
    flexWrap: "wrap",
    gap: 10,
  },
  vsHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  vsEmoji: { fontSize: 28 },
  vsHeaderTitle: {
    color: "#f1f5f9",
    fontWeight: 800,
    fontSize: 15,
  },
  vsHeaderSub: {
    color: "#475569",
    fontSize: 12,
    marginTop: 2,
  },
  vsWinnerBadge: {
    background: "#14532d",
    color: "#86efac",
    border: "1px solid #22c55e44",
    borderRadius: 20,
    padding: "4px 14px",
    fontSize: 12,
    fontWeight: 700,
  },
  vsTableWrap: { overflowX: "auto" },
  vsTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  vsth: {
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.5,
    color: "#64748b",
    borderBottom: "1px solid #1e293b",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  vstdFeature: {
    padding: "11px 20px",
    color: "#94a3b8",
    fontWeight: 600,
    fontSize: 13,
    borderBottom: "1px solid #0f172a",
    whiteSpace: "nowrap",
  },
  vstdCafe: {
    padding: "11px 20px",
    color: "#f87171",
    fontSize: 13,
    textAlign: "center",
    borderBottom: "1px solid #0f172a",
    whiteSpace: "nowrap",
  },
  vstdUs: {
    padding: "11px 20px",
    color: "#4ade80",
    fontSize: 13,
    textAlign: "center",
    borderBottom: "1px solid #0f172a",
    whiteSpace: "nowrap",
  },
  vsCta: {
    padding: "14px 20px",
    color: "#86efac",
    fontSize: 13,
    background: "#052e1615",
    borderTop: "1px solid #14532d",
    lineHeight: 1.6,
  },

  /* Footer Notes */
  footerNotes: {
    padding: "20px 24px 0",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  payNote: {
    textAlign: "center",
    color: "#334155",
    fontSize: 13,
    padding: "10px",
    background: "#0d1421",
    borderRadius: 10,
    border: "1px solid #1e293b",
  },
  fupNote: {
    color: "#475569",
    fontSize: 12,
    padding: "0 4",
    lineHeight: 1.6,
  },
};