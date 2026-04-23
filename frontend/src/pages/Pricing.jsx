// import { useNavigate } from "react-router-dom";
// import API from "../api/axios";
// import useStore from "../store/useStore";

// const PLANS = [
//   { id: "starter", name: "Starter", price: "₹49", period: "/year",  credits: 25,  color: "#22c55e",
//     perks: ["25 Credits","Valid 1 Year","All Exam Formats","Photo + Signature","PDF Compression"] },
//   { id: "pro",     name: "Pro",     price: "₹299", period: "/year", credits: 100, color: "#f97316", badge: "BEST VALUE",
//     perks: ["100 Credits","Valid 1 Year","All Features","PDF Editor","Resume Builder","Priority Support"] },
//   { id: "special", name: "Special", price: "₹99", period: "/month", credits: 35,  color: "#a855f7", badge: "LIMITED",
//     perks: ["35 Credits","Valid 1 Month","All Features","PDF Editor","Resume Builder","Bonus Templates"] },
// ];

// export default function Pricing() {
//   const navigate = useNavigate();
//   const { updateCredits } = useStore();

//   const handleBuy = async (planId) => {
//     try {
//       const { data } = await API.post("/payment/create-order", { planType: planId });

//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY,
//         amount: data.amount,
//         currency: "INR",
//         name: "DocSaathi",
//         description: `Buy ${planId} plan`,
//         order_id: data.orderId,
//         handler: async (response) => {
//           const verify = await API.post("/payment/verify", {
//             razorpayOrderId: response.razorpay_order_id,
//             razorpayPaymentId: response.razorpay_payment_id,
//             razorpaySignature: response.razorpay_signature,
//           });
//           updateCredits(verify.data.credits);
//           alert(`✅ Payment successful! ${verify.data.credits} credits added.`);
//           navigate("/dashboard");
//         },
//         theme: { color: "#f97316" },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       alert("Payment failed. Try again.");
//     }
//   };

//   return (
//     <div style={{ minHeight: "100vh", background: "#070c18", color: "#f1f5f9",
//       fontFamily: "Segoe UI, sans-serif", padding: 28 }}>
//       <button onClick={() => navigate("/dashboard")}
//         style={{ background: "#1e293b", border: "none", color: "#94a3b8",
//           borderRadius: 8, padding: "8px 14px", cursor: "pointer", marginBottom: 28 }}>
//         ← Back
//       </button>
//       <h2 style={{ marginBottom: 4 }}>💳 Choose Your Plan</h2>
//       <p style={{ color: "#64748b", marginBottom: 28 }}>Cheaper than any Cyber Café in India. No hidden fees.</p>

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
//         gap: 20, maxWidth: 860 }}>
//         {PLANS.map(plan => (
//           <div key={plan.id} style={{ background: "#0d1421", border: `2px solid ${plan.color}`,
//             borderRadius: 20, padding: 24, position: "relative" }}>
//             {plan.badge && (
//               <span style={{ position: "absolute", top: 0, right: 0, background: plan.color,
//                 color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 12px",
//                 borderRadius: "0 18px 0 12px" }}>{plan.badge}</span>
//             )}
//             <h3 style={{ color: plan.color, marginBottom: 4 }}>{plan.name}</h3>
//             <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4 }}>
//               {plan.price}<span style={{ fontSize: 16, color: "#64748b" }}>{plan.period}</span>
//             </div>
//             <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>{plan.credits} Credits</p>
//             <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex",
//               flexDirection: "column", gap: 6 }}>
//               {plan.perks.map(p => (
//                 <li key={p} style={{ color: "#94a3b8", fontSize: 13 }}>✓ {p}</li>
//               ))}
//             </ul>
//             <button onClick={() => handleBuy(plan.id)}
//               style={{ width: "100%", background: plan.color, color: "#fff", border: "none",
//                 borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
//               Buy {plan.name}
//             </button>
//           </div>
//         ))}
//       </div>

//       <div style={{ marginTop: 24, background: "#052e1620", border: "1px solid #14532d",
//         borderRadius: 12, padding: "12px 16px", color: "#86efac", fontSize: 13, maxWidth: 500 }}>
//         💡 <b>DocSaathi vs Cyber Café:</b> They charge ₹20–50 per photo. We charge ₹2–4. Same quality, zero travel.
//       </div>

//       {/* Razorpay SDK */}
//       <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
//     </div>
//   );
// }

import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { useState } from "react";

const PLANS = [
  {
    id: "single", name: "Single Fix", price: "₹9", period: "/download",
    credits: "1", color: "#64748b", badge: "NO WATERMARK",
    perks: ["1 Clean Download", "No Watermark", "Instant Download", "For Emergency Use"],
  },
  {
    id: "daily19", name: "Daily Pass", price: "₹19", period: "/24hrs",
    credits: 15, color: "#06b6d4", badge: "24 HOURS",
    perks: ["15 Credits", "Valid 24 Hours", "All Exam Formats", "Photo + Signature", "PDF Compression"],
  },
  {
    id: "daily29", name: "Daily Unlimited", price: "₹29", period: "/24hrs",
    credits: "Unlimited*", color: "#22c55e", badge: "24 HOURS",
    note: "*50 ops/day",
    perks: ["Unlimited Access", "Fair Usage: 50 ops/day", "Valid 24 Hours", "All Exam Formats", "Photo + Signature", "PDF Compression"],
  },
  {
    id: "monthly59", name: "Monthly", price: "₹59", period: "/month",
    credits: 60, color: "#3b82f6", badge: null,
    perks: ["60 Credits", "Valid 1 Month", "All Exam Formats", "Photo + Signature", "PDF Compression"],
  },
  {
    id: "quarterly139", name: "Quarterly", price: "₹139", period: "/3months",
    credits: 150, color: "#f97316", badge: "BEST VALUE",
    perks: ["150 Credits", "Valid 3 Months", "All Features", "PDF Editor", "Resume Builder", "Priority Support"],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user, credits, updateCredits, logout } = useStore();
  const [activeNav, setActiveNav] = useState("Pricing");
  const [showPricing, setShowPricing] = useState(true);
  const currentCredits = credits ?? user?.credits ?? 0;

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
              <div style={s.planCredits}>{plan.credits} {typeof plan.credits === 'string' ? '' : 'Credits'}</div>
              {plan.note && <div style={{...s.planCredits, fontSize: 11, color: '#f97316', marginTop: -12}}>{plan.note}</div>}
              <ul style={s.planPerks}>
                {plan.perks.map((p) => (
                  <li key={p} style={s.planPerk}>✓ {p}</li>
                ))}
              </ul>
              <button
                onClick={() => handleBuy(plan.id)}
                style={{ ...s.btnPrimary, background: plan.color }}
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
          💡 <b>DocSaathi vs Cyber Café:</b> They charge ₹20–50 per photo. We
          charge ₹2–4 per photo. Same quality, zero travel.
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 40 },
  sectionHeader: { padding: "24px 28px 12px" },
  sectionTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: 0 },
  sectionSub: { color: "#64748b", fontSize: 14, marginTop: 4 },
  plansGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, padding: "0 28px 20px" },
  planCard: { background: "#0d1421", border: "2px solid", borderRadius: 20, padding: 24, position: "relative", overflow: "visible" },
  planBadge: { position: "absolute", top: -2, right: -2, borderRadius: "0 18px 0 12px", padding: "4px 14px", fontSize: 11, fontWeight: 800, color: "#fff", zIndex: 1 },
  planName: { fontSize: 20, fontWeight: 800, marginBottom: 4 },
  planPrice: { fontSize: 36, fontWeight: 900, color: "#f1f5f9", margin: "8px 0 4px" },
  planPeriod: { fontSize: 16, color: "#64748b", fontWeight: 500 },
  planCredits: { color: "#94a3b8", fontSize: 14, marginBottom: 16 },
  planPerks: { listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 6 },
  planPerk: { color: "#94a3b8", fontSize: 13 },
  payNote: { textAlign: "center", color: "#475569", fontSize: 13, marginBottom: 12, padding: "0 28px" },
  cyberNote: { margin: "0 28px 20px", background: "#052e1620", border: "1px solid #14532d", borderRadius: 12, padding: "12px 16px", color: "#86efac", fontSize: 13 },
  btnPrimary: { color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", marginTop: 8 },
};