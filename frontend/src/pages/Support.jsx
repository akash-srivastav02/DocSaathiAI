import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import useIsMobile from "../hooks/useIsMobile";

const FAQS = [
  {
    category: "Exam Photo & Signature",
    icon: "PH",
    color: "#f97316",
    items: [
      {
        q: "What is the correct photo size for SSC CGL exam form?",
        a: "SSC CGL requires a photo of 200x230 pixels, in JPG format, between 20 KB and 50 KB. The background must be white. FormFixer automatically resizes and compresses your photo to these exact specifications.",
      },
      {
        q: "What photo size is required for SBI PO and SBI Clerk?",
        a: "SBI PO and SBI Clerk exam forms require a photo of 200x200 pixels, JPG format, 20-50 KB with a white background. The signature should be 200x80 pixels, 10-20 KB. FormFixer handles both in seconds.",
      },
      {
        q: "What are JEE Main photo and signature requirements?",
        a: "JEE Main requires a photo of 3.5x4.5 cm, approximately 236x295 px at 96 DPI, 10-200 KB, JPG format. Signature should be 3.5x1.5 cm, 4-30 KB. Our tool converts images to these specs.",
      },
      {
        q: "My photo is getting rejected on the exam portal. Why?",
        a: "Exam portals reject photos that exceed the KB limit, have the wrong dimensions, use the wrong format, or have an unsuitable background. FormFixer checks the important upload requirements before you download.",
      },
      {
        q: "Can I use a mobile selfie for exam photo?",
        a: "Yes. Use a clear front-facing photo with good light and a plain background. The tool crops, resizes and compresses it to the selected exam requirement.",
      },
      {
        q: "How is FormFixer different from other photo resize tools?",
        a: "Most tools resize only the image dimensions. FormFixer also targets the required KB range, format and exam-ready output so the file is easier to upload without trial and error.",
      },
    ],
  },
  {
    category: "PDF Compression",
    icon: "PDF",
    color: "#3b82f6",
    items: [
      {
        q: "How much can FormFixer compress my PDF?",
        a: "Scanned PDFs can often be reduced by 50-80%. Text-based PDFs usually compress by 10-30%. The exact result depends on the file content, and the tool shows the before and after size clearly.",
      },
      {
        q: "The portal requires PDF under 500 KB but my file is 2 MB. Can this tool help?",
        a: "Yes. Upload your PDF, enter 500 as the target KB, and choose a compression mode. Scanned certificates and marksheets usually compress more than digital text PDFs.",
      },
      {
        q: "Will compressing my PDF damage the text or make it unreadable?",
        a: "For text-based PDFs, compression mainly removes extra data and optimizes the file. For image-heavy PDFs, maximum compression can reduce image quality, but the output is intended to stay readable for submissions.",
      },
    ],
  },
  {
    category: "Credits & Pricing",
    icon: "INR",
    color: "#22c55e",
    items: [
      {
        q: "How do credits work on FormFixer?",
        a: "Each tool usage costs credits. Exam Photo, Exam Signature and Document Size Changer cost 2 credits, while Photo + Sign / Date costs 6 credits. New users get 15 free credits and receive 5 more every 7 days.",
      },
      {
        q: "What happens when my credits run out?",
        a: "You can buy a plan from Pricing. Single Fix is useful for one urgent clean download, while Starter and Pro are better for repeated use.",
      },
      {
        q: "Is there a free option?",
        a: "Yes. You get 15 credits on signup and 5 more every 7 days. That is enough for many first-time users to prepare exam documents without paying.",
      },
      {
        q: "What is the Single Fix plan?",
        a: "Single Fix is Rs.9 for one clean download. It is designed for users who need one file quickly and do not want a full plan.",
      },
      {
        q: "Are payments secure?",
        a: "Payments are processed through Razorpay, which supports UPI, cards, net banking and wallets. FormFixer does not store your payment details.",
      },
    ],
  },
  {
    category: "Technical Help",
    icon: "HL",
    color: "#8b5cf6",
    items: [
      {
        q: "Why is my camera not working in the Live Camera feature?",
        a: "Check that camera permission is allowed in your browser, then refresh the page. In Chrome or Edge, use the camera or lock icon near the address bar to manage permissions.",
      },
      {
        q: "My download opens in a new tab instead of saving. How do I fix it?",
        a: "If this happens, right-click the Download button and choose Save link as. If the image opens in a new tab, right-click it and choose Save image as.",
      },
      {
        q: "Is FormFixer available as a mobile app?",
        a: "FormFixer currently works in mobile browsers such as Chrome on Android and Safari on iPhone. A dedicated app can be added later.",
      },
      {
        q: "Which exams does FormFixer support?",
        a: "FormFixer supports common Indian competitive exam uploads such as SSC, SBI, IBPS, RRB, UPSC, NDA, JEE Main, NEET UG, Delhi Police, UP Police, GATE and more.",
      },
    ],
  },
];

const CONTACTS = [
  { label: "Email Support", value: "supportformfixer@gmail.com", icon: "EM", color: "#f97316" },
  { label: "Response Time", value: "Within 24 hours", icon: "24", color: "#3b82f6" },
  { label: "Tool Hours", value: "Available 24/7", icon: "ON", color: "#22c55e" },
];

const LEGAL_LINKS = [
  {
    label: "Privacy Policy",
    value: "How we process uploads, payments, and account data.",
    path: "/privacy-policy",
    icon: "PP",
    color: "#8b5cf6",
  },
  {
    label: "Terms & Conditions",
    value: "Usage rules, credits, fair-use, and service limits.",
    path: "/terms-and-conditions",
    icon: "TC",
    color: "#0ea5e9",
  },
];

function FAQItem({ q, a, color, compact }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={s.faqItem}>
      <button type="button" style={{ ...s.faqQ, ...(compact ? s.faqQMobile : null) }} onClick={() => setOpen(!open)}>
        <span style={s.questionText}>{q}</span>
        <span style={{ ...s.plus, color, transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
      </button>
      {open && <div style={{ ...s.faqA, ...(compact ? s.faqAMobile : null) }}>{a}</div>}
    </div>
  );
}

export default function Support() {
  const { user, credits, logout } = useStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
  const currentCredits = credits ?? user?.credits ?? 0;

  return (
    <div style={s.root}>
      <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : null) }}>
          <div style={{ ...s.pageHdr, ...(isMobile ? s.pageHdrMobile : null) }}>
            <div>
              <h1 style={{ ...s.pageTitle, ...(isMobile ? s.pageTitleMobile : null) }}>Help & Support</h1>
              <p style={{ ...s.pageSub, ...(isMobile ? s.pageSubMobile : null) }}>
                Answers for exam photos, signatures, PDFs, credits and downloads.
              </p>
            </div>
            <button type="button" style={s.dashboardBtn} onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
          </div>

          <div style={{ ...s.contactGrid, ...(isMobile ? s.contactGridMobile : null) }}>
            {CONTACTS.map((item) => (
              <div key={item.label} style={s.contactItem}>
                <span style={{ ...s.contactIcon, background: `${item.color}18`, color: item.color }}>{item.icon}</span>
                <div style={s.contactBody}>
                  <p style={s.contactLabel}>{item.label}</p>
                  <p style={{ ...s.contactVal, ...(isMobile ? s.contactValMobile : null) }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...s.quickCard, ...(isMobile ? s.quickCardMobile : null) }}>
            <div>
              <p style={s.quickTitle}>Need a direct reply?</p>
              <p style={s.quickText}>Send your issue with the exam name, target size and a screenshot if the portal shows an error.</p>
            </div>
            <a href="mailto:supportformfixer@gmail.com" style={s.mailBtn}>Email Support</a>
          </div>

          <div>
            <div style={s.secHead}>
              <div style={s.secHeadLeft}>
                <span style={{ ...s.secIcon, background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>LG</span>
                <div>
                  <h2 style={s.secTitle}>Policies & Trust</h2>
                  <p style={s.secSub}>Important legal pages for privacy, payments, and platform usage.</p>
                </div>
              </div>
            </div>
            <div style={{ ...s.contactGrid, ...(isMobile ? s.contactGridMobile : null) }}>
              {LEGAL_LINKS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  style={{ ...s.contactItem, ...s.legalItem }}
                  onClick={() => navigate(item.path)}
                >
                  <span style={{ ...s.contactIcon, background: `${item.color}18`, color: item.color }}>{item.icon}</span>
                  <div style={s.contactBody}>
                    <p style={s.contactLabel}>{item.label}</p>
                    <p style={{ ...s.legalVal, ...(isMobile ? s.contactValMobile : null) }}>{item.value}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {FAQS.map((section) => (
            <section key={section.category}>
              <div style={s.secHead}>
                <div style={s.secHeadLeft}>
                  <span style={{ ...s.secIcon, background: `${section.color}18`, color: section.color }}>{section.icon}</span>
                  <div>
                    <h2 style={s.secTitle}>{section.category}</h2>
                    <p style={s.secSub}>{section.items.length} common questions</p>
                  </div>
                </div>
              </div>
              <div style={s.faqCard}>
                {section.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} color={section.color} compact={isMobile} />
                ))}
              </div>
            </section>
          ))}

          <div style={{ ...s.bottomCard, ...(isMobile ? s.bottomCardMobile : null) }}>
            <div>
              <h3 style={s.bottomTitle}>Still stuck?</h3>
              <p style={s.bottomText}>The fastest path is to email the exact portal requirement and what went wrong.</p>
            </div>
            <div style={s.bottomActions}>
              <a href="mailto:supportformfixer@gmail.com" style={s.mailBtn}>Email Us</a>
              <button type="button" style={s.backBtn} onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "transparent", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 60, minWidth: 0 },
  content: {
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 22,
    maxWidth: 960,
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  contentMobile: { padding: "16px", gap: 18 },

  pageHdr: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  pageHdrMobile: { alignItems: "stretch" },
  pageTitle: { color: "var(--ff-text)", fontWeight: 800, fontSize: 24, margin: "0 0 6px", lineHeight: 1.2 },
  pageTitleMobile: { fontSize: 24 },
  pageSub: { color: "var(--ff-text-soft)", fontSize: 15, margin: 0, lineHeight: 1.5 },
  pageSubMobile: { fontSize: 14, lineHeight: 1.55 },
  dashboardBtn: {
    background: "var(--ff-panel-solid)",
    border: "1px solid var(--ff-border)",
    color: "var(--ff-text-soft)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },

  contactGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  contactGridMobile: { gridTemplateColumns: "1fr" },
  contactItem: {
    background: "var(--ff-panel-solid)",
    border: "1px solid var(--ff-border)",
    borderRadius: 14,
    padding: "15px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  contactIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 900,
    flexShrink: 0,
  },
  contactBody: { minWidth: 0 },
  contactLabel: { color: "var(--ff-text-faint)", fontSize: 11, margin: "0 0 3px", textTransform: "uppercase", fontWeight: 800, letterSpacing: 0.4 },
  contactVal: { color: "var(--ff-text)", fontWeight: 800, fontSize: 14, margin: 0, overflowWrap: "anywhere", lineHeight: 1.35 },
  contactValMobile: { fontSize: 15 },
  legalItem: { textAlign: "left", cursor: "pointer", width: "100%" },
  legalVal: { color: "var(--ff-text-soft)", fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1.45, textAlign: "left" },

  quickCard: {
    background: "color-mix(in srgb, var(--ff-orange) 9%, var(--ff-panel-solid))",
    border: "1px solid color-mix(in srgb, var(--ff-orange) 24%, var(--ff-border))",
    borderRadius: 14,
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
  },
  quickCardMobile: { alignItems: "stretch", padding: 16 },
  quickTitle: { color: "var(--ff-orange)", fontWeight: 800, fontSize: 14, margin: "0 0 3px" },
  quickText: { color: "var(--ff-text-soft)", fontSize: 13, margin: 0, lineHeight: 1.55 },

  secHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 10 },
  secHeadLeft: { display: "flex", alignItems: "center", gap: 10 },
  secIcon: { width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 },
  secTitle: { color: "var(--ff-text)", fontWeight: 800, fontSize: 17, margin: "0 0 2px" },
  secSub: { color: "var(--ff-text-faint)", fontSize: 12, margin: 0 },
  faqCard: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 14, overflow: "hidden" },
  faqItem: { borderTop: "1px solid var(--ff-border)" },
  faqQ: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", background: "transparent", border: "none", color: "var(--ff-text)", fontSize: 14, fontWeight: 800, cursor: "pointer", lineHeight: 1.45 },
  faqQMobile: { padding: "15px 16px", fontSize: 14, alignItems: "flex-start" },
  questionText: { flex: 1, textAlign: "left" },
  plus: { fontSize: 18, fontWeight: 900, flexShrink: 0, transition: "transform 0.18s ease" },
  faqA: { padding: "0 18px 17px", color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.7 },
  faqAMobile: { padding: "0 16px 16px", fontSize: 14, lineHeight: 1.65 },

  bottomCard: {
    background: "var(--ff-panel-solid)",
    border: "1px solid var(--ff-border)",
    borderRadius: 14,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
  },
  bottomCardMobile: { alignItems: "stretch", padding: 16 },
  bottomTitle: { color: "var(--ff-text)", fontWeight: 800, fontSize: 17, margin: "0 0 4px" },
  bottomText: { color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.6, margin: 0 },
  bottomActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  mailBtn: {
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 800,
    textAlign: "center",
    border: "none",
  },
  backBtn: {
    background: "var(--ff-panel-soft)",
    border: "1px solid var(--ff-border)",
    color: "var(--ff-text-soft)",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  },
};
