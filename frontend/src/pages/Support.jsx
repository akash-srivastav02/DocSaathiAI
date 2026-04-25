import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const FAQS = [
  {
    category: "📸 Exam Photo & Signature",
    items: [
      {
        q: "What is the correct photo size for SSC CGL exam form?",
        a: "SSC CGL requires a photo of 200×230 pixels, in JPG format, between 20 KB and 50 KB. The background must be white. FormFixer automatically resizes and compresses your photo to these exact specifications — no manual editing needed.",
      },
      {
        q: "What photo size is required for SBI PO and SBI Clerk?",
        a: "SBI PO and SBI Clerk exam forms require a photo of 200×200 pixels, JPG format, 20–50 KB with a white background. The signature should be 200×80 pixels, 10–20 KB. FormFixer handles both in seconds.",
      },
      {
        q: "What are JEE Main photo and signature requirements?",
        a: "JEE Main requires a photo of 3.5×4.5 cm (approximately 236×295 px at 96 DPI), 10–200 KB, JPG format. Signature should be 3.5×1.5 cm, 4–30 KB. Our tool auto-converts any image to these specs.",
      },
      {
        q: "My photo is getting rejected on the exam portal. Why?",
        a: "Exam portals reject photos that exceed the maximum KB limit, have the wrong dimensions, or are in the wrong format (e.g., PNG instead of JPG). FormFixer ensures your photo meets all three criteria — correct pixels, correct KB size, and JPG format with white background.",
      },
      {
        q: "Can I use a mobile selfie for exam photo?",
        a: "Yes! Use our Live Camera feature to capture directly from your phone or laptop camera. The photo is automatically cropped, resized, and compressed to exam specifications. Make sure you are in front of a white wall or use a plain background.",
      },
      {
        q: "How is FormFixer different from other photo resize tools?",
        a: "Most tools only resize the image. They don't guarantee the file falls within the KB range required by exam portals. FormFixer uses an intelligent compression algorithm to ensure the output is within the exact KB range — not just the right dimensions.",
      },
    ],
  },
  {
    category: "📄 PDF Compression",
    items: [
      {
        q: "How much can FormFixer compress my PDF?",
        a: "Scanned PDFs (photos of documents) can be compressed by 50–80%. Text-based (digital) PDFs can be compressed by 10–30%. The exact reduction depends on the content. Our tool always shows you the before and after size honestly — if your target cannot be achieved, we tell you clearly.",
      },
      {
        q: "The portal requires PDF under 500 KB but my file is 2 MB. Can this tool help?",
        a: "Yes, this is exactly the use case FormFixer is built for. Upload your PDF, enter 500 as the target KB, and select Max Compression. For scanned documents (certificates, marksheets), we can typically achieve 70–80% reduction.",
      },
      {
        q: "Will compressing my PDF damage the text or make it unreadable?",
        a: "No. For text-based PDFs, our compression only removes metadata and optimizes the object structure — text remains perfectly readable. For image-heavy PDFs, slight quality reduction may occur at Maximum Compression, but it remains legible for official submissions.",
      },
    ],
  },
  {
    category: "💳 Credits & Pricing",
    items: [
      {
        q: "How do credits work on FormFixer?",
        a: "Each tool usage costs a specific number of credits: Exam Photo costs 2 credits, Exam Signature costs 2 credits, Photo+Sign/Date merger costs 6 credits, and Document Size Changer costs 2 credits. Crop, Image Compressor, and PDF Compressor also cost 2 credits each. New users get 15 free credits. Every 7 days, you get 5 free credits automatically.",
      },
      {
        q: "What happens when my credits run out?",
        a: "Your processed file will be ready but will carry a watermark. You can download it free with the watermark, or pay ₹9 for a single clean download without watermark (Single Fix plan).",
      },
      {
        q: "Is there a free option?",
        a: "Yes. You get 15 free credits on signup, and 5 more every 7 days automatically (Weekly Refill). This is enough for most aspirants to process their exam documents at no cost.",
      },
      {
        q: "What is the Single Fix plan?",
        a: "Single Fix is ₹9 for 1 download without watermark. It's for users who don't want to create an account and just need one quick file processed. Perfect for last-minute form submissions.",
      },
      {
        q: "Are payments secure?",
        a: "Yes. All payments are processed via Razorpay, which is RBI-compliant and supports UPI, credit/debit cards, net banking, and wallets. FormFixer never stores your payment details.",
      },
    ],
  },
  {
    category: "🛠️ Technical Help",
    items: [
      {
        q: "Why is my camera not working in the Live Camera feature?",
        a: "Make sure you have allowed camera permission in your browser. In Chrome, click the camera icon in the address bar and select Allow. Then refresh the page and try again. The feature works on all modern browsers including Chrome, Edge, and Firefox.",
      },
      {
        q: "My download opens in a new tab instead of saving. How to fix?",
        a: "This can happen on certain browsers. Right-click the Download button and select 'Save link as'. Alternatively, after the file opens in a new tab, right-click the image and select 'Save image as'. We are working on a fix for all browsers.",
      },
      {
        q: "Is FormFixer available as a mobile app?",
        a: "Currently FormFixer is a web application that works on all mobile browsers. Open docsaathi.in in Chrome on your Android or Safari on iPhone — it works fully. A dedicated Android and iOS app is on our roadmap.",
      },
      {
        q: "Which exams does FormFixer support?",
        a: "We support 40+ Indian competitive exams including SSC CGL, SSC CHSL, SSC MTS, SSC GD, SBI PO, SBI Clerk, IBPS PO, IBPS Clerk, IBPS RRB, RRB NTPC, RRB Group D, UPSC CSE, UPSC CDS, NDA, JEE Main, NEET UG, Delhi Police, UP Police, GATE, and many more. New exams are added regularly.",
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid #1e293b" }}>
      <button
        style={s.faqQ}
        onClick={() => setOpen(!open)}
      >
        <span style={{ flex: 1, textAlign: "left" }}>{q}</span>
        <span style={{ color: "#f97316", fontSize: 18, flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>
          +
        </span>
      </button>
      {open && <div style={s.faqA}>{a}</div>}
    </div>
  );
}

export default function Support() {
  const { user, credits, logout } = useStore();
  const navigate = useNavigate();
  const [activeNav, setActiveNav]     = useState("Support");
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
        <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        <div style={s.content}>

          {/* Header */}
          <div style={s.hero}>
            <h1 style={s.heroTitle}>💬 Help & Support</h1>
            <p style={s.heroSub}>
              Everything you need to know about using FormFixer for your exam form preparation.
            </p>
          </div>

          {/* Contact strip */}
          <div style={s.contactStrip}>
            <div style={s.contactItem}>
              <span style={{ fontSize: 20 }}>📧</span>
              <div>
                <p style={s.contactLabel}>Email Support</p>
                <p style={s.contactVal}>supportformfixer@gmail.com</p>
              </div>
            </div>
            <div style={s.contactItem}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <div>
                <p style={s.contactLabel}>Response Time</p>
                <p style={s.contactVal}>Within 24 hours</p>
              </div>
            </div>
            <div style={s.contactItem}>
              <span style={{ fontSize: 20 }}>🕐</span>
              <div>
                <p style={s.contactLabel}>Working Hours</p>
                <p style={s.contactVal}>24/7 (Tool always available)</p>
              </div>
            </div>
          </div>

          {/* FAQ sections */}
          {FAQS.map((section) => (
            <div key={section.category} style={s.faqSection}>
              <h2 style={s.catTitle}>{section.category}</h2>
              <div style={s.faqCard}>
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}

          {/* Still stuck */}
          <div style={s.stuckCard}>
            <h3 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 17, margin: "0 0 8px" }}>
              Still stuck? 🙋
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 16px" }}>
              Can't find your answer? Send us a message and we'll reply within 24 hours.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="mailto:supportformfixer@gmail.in" style={s.mailBtn}>
                📧 Email Us
              </a>
              <button style={s.backBtn} onClick={() => navigate("/dashboard")}>
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 60 },
  content: { padding: "24px 28px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 860 },

  hero: { padding: "8px 0 4px" },
  heroTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 24, margin: "0 0 8px" },
  heroSub: { color: "#64748b", fontSize: 15, margin: 0, lineHeight: 1.6 },

  contactStrip: { display: "flex", gap: 16, flexWrap: "wrap" },
  contactItem: { display: "flex", alignItems: "center", gap: 12, background: "#0d1421", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 18px", flex: 1, minWidth: 180 },
  contactLabel: { color: "#64748b", fontSize: 11, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 0.5 },
  contactVal: { color: "#f1f5f9", fontWeight: 600, fontSize: 14, margin: 0 },

  faqSection: {},
  catTitle: { color: "#f97316", fontWeight: 800, fontSize: 15, margin: "0 0 12px" },
  faqCard: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden" },
  faqQ: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "transparent", border: "none", color: "#f1f5f9", fontSize: 14, fontWeight: 600, cursor: "pointer", lineHeight: 1.5 },
  faqA: { padding: "0 18px 16px 18px", color: "#94a3b8", fontSize: 13, lineHeight: 1.7 },

  stuckCard: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, padding: "24px 22px" },
  mailBtn: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", textDecoration: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700 },
  backBtn: { background: "#1e293b", border: "1px solid #374151", color: "#94a3b8", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
};
