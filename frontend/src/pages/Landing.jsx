import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import useLanguage from "../hooks/useLanguage";
import useStore from "../store/useStore";
import useIsMobile from "../hooks/useIsMobile";
import useTheme from "../hooks/useTheme";
import { EXAM_PAGE_DATA } from "../utils/examPages";
import { UTILITY_PAGE_DATA } from "../utils/utilityPages";

const SITE_URL = "https://formfixer.in";

const FEATURES = [
  {
    title: { en: "Exam Photo Resize", hi: "Exam Photo Resize" },
    desc: { en: "Fix exact size and KB for SSC, JEE, NEET, IBPS and more.", hi: "SSC, JEE, NEET, IBPS aur doosre exams ke liye exact size aur KB set karo." },
    tag: { en: "Photo", hi: "Photo" },
    route: "/tool/photo",
  },
  {
    title: { en: "Signature Resize", hi: "Signature Resize" },
    desc: { en: "Prepare upload-ready signatures for forms and portals.", hi: "Forms aur portals ke liye upload-ready signature banao." },
    tag: { en: "Sign", hi: "Sign" },
    route: "/tool/signature",
  },
  {
    title: { en: "Signature Cleaner", hi: "Signature Cleaner" },
    desc: { en: "Auto clean, trim and darken signatures for clearer uploads.", hi: "Signature ko auto clean, trim aur dark karke clearer upload output pao." },
    tag: { en: "Clean", hi: "Clean" },
    route: "/tool/sigclean",
  },
  {
    title: { en: "Compress PDF", hi: "Compress PDF" },
    desc: { en: "Reduce heavy PDFs for exact upload limits.", hi: "Heavy PDFs ko exact upload limit ke hisaab se reduce karo." },
    tag: { en: "PDF", hi: "PDF" },
    route: "/pdf/compress",
  },
  {
    title: { en: "Merge PDF", hi: "Merge PDF" },
    desc: { en: "Combine multiple PDF files into one clean output.", hi: "Multiple PDF files ko ek clean output me jodo." },
    tag: { en: "Merge", hi: "Merge" },
    route: "/pdf/merge",
  },
  {
    title: { en: "Image Converter", hi: "Image Converter" },
    desc: { en: "Convert image or PDF first page into JPG quickly.", hi: "Image ya PDF ke first page ko quickly JPG me convert karo." },
    tag: { en: "Convert", hi: "Convert" },
    route: "/tool/imgconvert",
  },
];

const QUICK_LINKS = [
  { label: { en: "Compress image to 20KB", hi: "Image ko 20KB tak compress karo" }, route: "/utility/compress-image-to-20kb" },
  { label: { en: "Compress PDF to 200KB", hi: "PDF ko 200KB tak compress karo" }, route: "/utility/compress-pdf-to-200kb" },
  { label: { en: "SSC CGL photo resize", hi: "SSC CGL photo resize" }, route: "/exam/ssc-cgl" },
  { label: { en: "UPSC CDS photo resize", hi: "UPSC CDS photo resize" }, route: "/exam/upsc-cds" },
];

const EXAMS = EXAM_PAGE_DATA.filter((exam) =>
  ["SSC CGL", "SSC CHSL", "SBI PO", "IBPS Clerk", "RRB NTPC", "JEE Main", "NEET UG", "UP Police"].includes(exam.name)
);

const normalizeText = (value) => String(value || "").toLowerCase();

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useStore();
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const isMobile = useIsMobile(820);
  const [query, setQuery] = useState("");

  const copy = language === "hi"
    ? {
        topTools: "सभी टूल्स",
        login: "लॉगिन / साइन अप",
        light: "लाइट मोड",
        dark: "डार्क मोड",
        badge: "फ्री ब्राउज़र डॉक्यूमेंट टूल्स",
        titleA: "Resize, convert",
        titleB: "and fix documents",
        titleC: "without switching tabs",
        sub: "FormFixer एक ऐसा टूल हब है जहाँ एग्जाम फोटो रीसाइज़, सिग्नेचर फिक्स, PDF कंप्रेस, मर्ज और कन्वर्ज़न जैसे ज़रूरी काम एक ही जगह होते हैं।",
        trust: "अगर आप Form Fixer, एग्जाम फोटो रीसाइज़, सिग्नेचर रीसाइज़ या अपलोड-रेडी PDF टूल्स खोज रहे हैं, तो आप सही जगह पर हैं।",
        start: "एक्सप्लोर शुरू करें",
        explore: "टूल्स देखें",
        search: "रीसाइज़, कंप्रेस, कन्वर्ट, एग्जाम पेज या exact KB tools खोजें",
        quick: "क्विक एक्सेस",
        quickText: "यहीं से सबसे ज़्यादा खोजे जाने वाले काम तुरंत शुरू किए जा सकते हैं।",
        quickTitle: "लोकप्रिय शुरुआत",
        popular: "लोकप्रिय टूल्स",
        popularSub: "सबसे ज़्यादा इस्तेमाल होने वाले टूल्स से शुरुआत करें।",
        examSection: "लोकप्रिय परीक्षाएँ",
        examSub: "फोटो और सिग्नेचर की सटीक स्पेक्स वाले रेडी पेज।",
        officialSub: "ऑफिशियल टूल हब",
        openTool: "टूल खोलें →",
        openPage: "पेज खोलें →",
        openHub: "टूल हब खोलें",
        whyTitle: "FormFixer क्यों अलग है",
        why1: "ब्राउज़र में तेज़ प्रोसेसिंग",
        why1Text: "छोटे-छोटे कामों के लिए अलग-अलग साइट बदलने की ज़रूरत नहीं।",
        why2: "एग्जाम-रेडी प्रीसेट्स",
        why2Text: "KB, dimensions और upload workflow को ध्यान में रखकर बनाया गया।",
        why3: "प्राइवेसी-फर्स्ट",
        why3Text: "Preview workflow और lightweight processing इसे ज़्यादा practical बनाते हैं।",
      }
    : {
        topTools: "View All Tools",
        login: "Login / Sign Up",
        light: "Light Mode",
        dark: "Dark Mode",
        badge: "Free browser document tools",
        titleA: "Resize, convert",
        titleB: "and fix documents",
        titleC: "without switching tabs",
        sub: "FormFixer is one clean tool hub for exam photo resize, signature fixes, PDF compression, merging, and upload-ready file conversion.",
        trust: "Searching for Form Fixer, exam photo resize, signature resize, or upload-ready PDF tools? You are in the right place.",
        start: "Start Exploring",
        explore: "Explore Tools",
        search: "Search resize, compress, convert, exam pages, or exact KB tools",
        quick: "Quick access",
        quickText: "Use this space for high-intent entry points instead of leaving it empty.",
        quickTitle: "Popular starting points",
        popular: "Popular tools",
        popularSub: "Start with the most-used tools first.",
        examSection: "Popular exams",
        examSub: "Exact photo and signature pages with ready specs.",
        officialSub: "Official tool hub",
        openTool: "Open tool →",
        openPage: "Open page →",
        openHub: "Open Tool Hub",
        whyTitle: "Why FormFixer feels better",
        why1: "Fast browser workflow",
        why1Text: "No need to keep switching across different small utility sites.",
        why2: "Exam-ready presets",
        why2Text: "Built around KB limits, dimensions, and real upload workflows.",
        why3: "Privacy-first feel",
        why3Text: "Preview-first workflow and lightweight processing make it more practical.",
      };

  const searchResults = useMemo(() => {
    const q = normalizeText(query.trim());
    if (!q) return [];

    const examMatches = EXAM_PAGE_DATA
      .filter((exam) => normalizeText(exam.name).includes(q) || normalizeText(exam.summary).includes(q))
      .slice(0, 4)
      .map((exam) => ({
        key: `exam-${exam.slug}`,
        title: exam.name,
        summary: exam.summary,
        route: `/exam/${exam.slug}`,
      }));

    const utilityMatches = UTILITY_PAGE_DATA
      .filter((item) => normalizeText(item.title).includes(q) || normalizeText(item.summary).includes(q))
      .slice(0, 4)
      .map((item) => ({
        key: `utility-${item.slug}`,
        title: item.title,
        summary: item.summary,
        route: `/utility/${item.slug}`,
      }));

    return [...examMatches, ...utilityMatches].slice(0, 6);
  }, [query]);

  const landingSchema = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "FormFixer",
        alternateName: ["Form Fixer", "from fixer", "formfixer.in"],
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.png`,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "FormFixer",
        alternateName: ["Form Fixer", "from fixer"],
        url: SITE_URL,
      },
    ],
    []
  );

  return (
    <div style={{ ...s.root, ...(isDark ? s.rootDark : s.rootLight) }}>
      <Seo
        title="FormFixer (Form Fixer) | Official formfixer.in Photo, PDF & Document Tools"
        description="FormFixer is the official formfixer.in toolkit for exam photo resize, signature resize, PDF compression, image conversion and upload-ready document fixes."
        canonical={SITE_URL}
        keywords="FormFixer, Form Fixer, from fixer, exam photo resize, signature resize, compress image to 20kb, compress pdf to 200kb"
        ldJson={landingSchema}
      />

      <header style={{ ...s.header, ...(isDark ? s.headerDark : s.headerLight), ...(isMobile ? s.headerMobile : null) }}>
        <button type="button" style={s.brand} onClick={() => navigate("/")}>
          <div style={s.brandIconWrap}>
            <img src="/favicon.png" alt="FormFixer logo" style={s.brandIcon} />
          </div>
          <div style={s.brandCopy}>
            <p style={s.brandTitle}>FormFixer</p>
            <p style={s.brandSub}>{copy.officialSub}</p>
          </div>
        </button>

        <div style={{ ...s.headerActions, ...(isMobile ? s.headerActionsMobile : null) }}>
          <div style={{ ...s.langSwitch, ...(isDark ? s.langSwitchDark : s.langSwitchLight) }}>
            <button
              type="button"
              style={{ ...s.langBtn, ...(language === "en" ? s.langBtnActive : s.langBtnIdle) }}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            <button
              type="button"
              style={{ ...s.langBtn, ...(language === "hi" ? s.langBtnActive : s.langBtnIdle) }}
              onClick={() => setLanguage("hi")}
            >
              HI
            </button>
          </div>

          <button type="button" style={{ ...s.ghostBtn, ...(isDark ? s.ghostBtnDark : s.ghostBtnLight) }} onClick={toggleTheme}>
            {theme === "dark" ? copy.light : copy.dark}
          </button>

          {!user ? (
            <button type="button" style={s.ghostBtnAccent} onClick={() => navigate("/auth")}>
              {copy.login}
            </button>
          ) : null}

          <button type="button" style={s.primaryBtn} onClick={() => navigate(user ? "/dashboard" : "/all-tools")}>
            {user ? copy.openHub : copy.topTools}
          </button>
        </div>
      </header>

      <main style={{ ...s.main, ...(isMobile ? s.mainMobile : null) }}>
        <section style={{ ...s.hero, ...(isMobile ? s.heroMobile : null) }}>
          <div style={s.heroCopy}>
            <div style={s.badge}>{copy.badge}</div>
            <h1 style={{ ...s.heroTitle, ...(isMobile ? s.heroTitleMobile : null) }}>
              <span>{copy.titleA}</span>
              <span>{copy.titleB}</span>
              <span style={s.heroAccent}>{copy.titleC}</span>
            </h1>
            <p style={s.heroSub}>{copy.sub}</p>
            <p style={s.heroTrust}>{copy.trust}</p>

            <div style={{ ...s.heroCtas, ...(isMobile ? s.heroCtasMobile : null) }}>
              <button type="button" style={{ ...s.primaryBtn, ...(isMobile ? s.fullBtn : null) }} onClick={() => navigate(user ? "/dashboard" : "/all-tools")}>
                {user ? copy.openHub : copy.start}
              </button>
              <button type="button" style={{ ...s.secondaryBtn, ...(isDark ? s.secondaryBtnDark : s.secondaryBtnLight), ...(isMobile ? s.fullBtn : null) }} onClick={() => document.getElementById("landing-tools")?.scrollIntoView({ behavior: "smooth" })}>
                {copy.explore}
              </button>
              {!user ? (
                <button type="button" style={{ ...s.secondaryBtn, ...(isDark ? s.secondaryBtnDark : s.secondaryBtnLight), ...(isMobile ? s.fullBtn : null) }} onClick={() => navigate("/auth")}>
                  {copy.login}
                </button>
              ) : null}
            </div>

            <div style={{ ...s.searchWrap, ...(isDark ? s.panelDark : s.panelLight) }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.search}
                style={{ ...s.searchInput, ...(isDark ? s.searchInputDark : s.searchInputLight) }}
              />
              {searchResults.length > 0 ? (
                <div style={s.searchList}>
                  {searchResults.map((item) => (
                    <button key={item.key} type="button" style={{ ...s.searchItem, ...(isDark ? s.cardDark : s.cardLight) }} onClick={() => navigate(item.route)}>
                      <b>{item.title}</b>
                      <span>{item.summary}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ ...s.heroSide, ...(isMobile ? s.heroSideMobile : null) }}>
            <div style={{ ...s.quickCard, ...(isDark ? s.cardDark : s.cardLight) }}>
              <div style={s.quickTag}>{copy.quick}</div>
              <h3 style={s.quickTitle}>{copy.quickTitle}</h3>
              <p style={s.quickText}>{copy.quickText}</p>
              <div style={s.quickLinks}>
                {QUICK_LINKS.map((item) => (
                  <button key={item.route} type="button" style={{ ...s.quickLink, ...(isDark ? s.quickLinkDark : s.quickLinkLight) }} onClick={() => navigate(item.route)}>
                    {item.label[language]}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ ...s.stageCard, ...(isDark ? s.cardDark : s.cardLight) }}>
              <div style={s.stageBadge}>3D Workflow</div>
              <div style={s.stageFrame}>
                <div style={{ ...s.stagePanel, ...s.stagePanelMain }}>
                  <span style={s.stageFlow}>Search → Fix → Preview → Download</span>
                </div>
                <div style={{ ...s.stagePanel, ...s.stagePanelOne }}>
                  <span style={s.stageMiniTag}>Photo</span>
                  <strong style={s.stageMiniTitle}>Exam preset</strong>
                </div>
                <div style={{ ...s.stagePanel, ...s.stagePanelTwo }}>
                  <span style={s.stageMiniTag}>PDF</span>
                  <strong style={s.stageMiniTitle}>Compress & merge</strong>
                </div>
                <div style={{ ...s.stagePanel, ...s.stagePanelThree }}>
                  <span style={s.stageMiniTag}>Sign</span>
                  <strong style={s.stageMiniTitle}>Clean signature</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={s.section}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>{copy.whyTitle}</h2>
          </div>
          <div style={s.infoGrid}>
            <div style={{ ...s.infoCard, ...(isDark ? s.cardDark : s.cardLight) }}>
              <h3 style={s.infoTitle}>{copy.why1}</h3>
              <p style={s.infoText}>{copy.why1Text}</p>
            </div>
            <div style={{ ...s.infoCard, ...(isDark ? s.cardDark : s.cardLight) }}>
              <h3 style={s.infoTitle}>{copy.why2}</h3>
              <p style={s.infoText}>{copy.why2Text}</p>
            </div>
            <div style={{ ...s.infoCard, ...(isDark ? s.cardDark : s.cardLight) }}>
              <h3 style={s.infoTitle}>{copy.why3}</h3>
              <p style={s.infoText}>{copy.why3Text}</p>
            </div>
          </div>
        </section>

        <section style={s.section} id="landing-tools">
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>{copy.popular}</h2>
            <p style={s.sectionSub}>{copy.popularSub}</p>
          </div>
          <div style={s.grid}>
            {FEATURES.map((item) => (
              <button key={item.route} type="button" style={{ ...s.card, ...(isDark ? s.cardDark : s.cardLight) }} onClick={() => navigate(item.route)}>
                <span style={s.cardTag}>{item.tag[language]}</span>
                <h3 style={s.cardTitle}>{item.title[language]}</h3>
                <p style={s.cardText}>{item.desc[language]}</p>
                <span style={s.cardAction}>Open tool →</span>
              </button>
            ))}
          </div>
        </section>

        <section style={s.section}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>{copy.examSection}</h2>
            <p style={s.sectionSub}>{copy.examSub}</p>
          </div>
          <div style={s.grid}>
            {EXAMS.map((exam) => (
              <button key={exam.slug} type="button" style={{ ...s.card, ...(isDark ? s.cardDark : s.cardLight) }} onClick={() => navigate(`/exam/${exam.slug}`)}>
                <span style={s.cardTag}>{exam.family}</span>
                <h3 style={s.cardTitle}>{exam.name}</h3>
                <p style={s.cardText}>{exam.summary}</p>
                <span style={s.cardAction}>Open page →</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  rootDark: {
    background: "radial-gradient(circle at top, rgba(15,34,68,0.92) 0%, rgba(7,12,24,1) 56%)",
    color: "#f8fafc",
  },
  rootLight: {
    background: "radial-gradient(circle at top, rgba(255,242,222,0.95) 0%, rgba(244,239,231,1) 56%)",
    color: "#162033",
  },
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 18px",
    backdropFilter: "blur(18px)",
  },
  headerDark: {
    background: "linear-gradient(180deg, rgba(10,15,30,0.98), rgba(13,20,33,0.94))",
    borderBottom: "1px solid rgba(79,97,130,0.2)",
    boxShadow: "0 18px 40px rgba(2,6,23,0.16)",
  },
  headerLight: {
    background: "linear-gradient(180deg, rgba(255,250,242,0.98), rgba(255,253,248,0.94))",
    borderBottom: "1px solid rgba(133,99,66,0.16)",
    boxShadow: "0 16px 34px rgba(148,163,184,0.12)",
  },
  headerMobile: {
    padding: "12px",
    alignItems: "stretch",
    flexDirection: "column",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "none",
    background: "transparent",
    color: "inherit",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  },
  brandIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "rgba(249,115,22,0.12)",
    border: "1px solid rgba(249,115,22,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  brandIcon: {
    width: 28,
    height: 28,
    objectFit: "contain",
  },
  brandCopy: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  brandTitle: {
    margin: 0,
    fontSize: 21,
    fontWeight: 900,
    lineHeight: 1.1,
  },
  brandSub: {
    margin: 0,
    fontSize: 13,
    color: "#94a3b8",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  headerActionsMobile: {
    width: "100%",
  },
  langSwitch: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 4,
    borderRadius: 999,
    border: "1px solid transparent",
  },
  langSwitchDark: {
    background: "#111827",
    borderColor: "#334155",
  },
  langSwitchLight: {
    background: "#ffffff",
    borderColor: "rgba(133,99,66,0.15)",
  },
  langBtn: {
    minWidth: 42,
    border: "none",
    borderRadius: 999,
    padding: "8px 10px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  langBtnActive: {
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#ffffff",
    boxShadow: "0 10px 22px rgba(249,115,22,0.22)",
  },
  langBtnIdle: {
    background: "transparent",
    color: "#64748b",
  },
  ghostBtn: {
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    border: "1px solid transparent",
  },
  ghostBtnDark: {
    background: "rgba(15,23,42,0.82)",
    borderColor: "rgba(96,165,250,0.18)",
    color: "#e5edf7",
  },
  ghostBtnLight: {
    background: "rgba(255,252,247,0.92)",
    borderColor: "rgba(133,99,66,0.14)",
    color: "#233148",
  },
  ghostBtnAccent: {
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    border: "1px solid rgba(249,115,22,0.3)",
    background: "rgba(249,115,22,0.1)",
    color: "#f97316",
  },
  primaryBtn: {
    border: "none",
    borderRadius: 12,
    padding: "11px 16px",
    fontWeight: 900,
    cursor: "pointer",
    color: "#ffffff",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    boxShadow: "0 16px 32px rgba(249,115,22,0.22)",
  },
  main: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "108px 20px 56px",
  },
  mainMobile: {
    padding: "128px 12px 42px",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1.05fr) minmax(300px,0.95fr)",
    gap: 22,
    alignItems: "start",
    marginBottom: 38,
  },
  heroMobile: {
    gridTemplateColumns: "1fr",
    gap: 16,
  },
  heroCopy: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minWidth: 0,
  },
  badge: {
    width: "fit-content",
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 800,
    color: "#fdba74",
    background: "rgba(249,115,22,0.12)",
    border: "1px solid rgba(249,115,22,0.24)",
  },
  heroTitle: {
    margin: 0,
    display: "grid",
    gap: 4,
    fontSize: "clamp(44px, 8vw, 74px)",
    lineHeight: 0.98,
    fontWeight: 950,
    letterSpacing: -2.2,
  },
  heroTitleMobile: {
    fontSize: "clamp(34px, 11vw, 48px)",
    lineHeight: 1.02,
    letterSpacing: -1.2,
  },
  heroAccent: {
    color: "#f97316",
  },
  heroSub: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.7,
    color: "#94a3b8",
    maxWidth: 760,
  },
  heroTrust: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#94a3b8",
    maxWidth: 760,
  },
  heroCtas: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  heroCtasMobile: {
    width: "100%",
  },
  fullBtn: {
    width: "100%",
  },
  secondaryBtn: {
    borderRadius: 12,
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer",
    border: "1px solid transparent",
  },
  secondaryBtnDark: {
    background: "rgba(15,23,42,0.82)",
    borderColor: "rgba(96,165,250,0.18)",
    color: "#dbe7f9",
  },
  secondaryBtnLight: {
    background: "rgba(255,252,247,0.92)",
    borderColor: "rgba(133,99,66,0.14)",
    color: "#233148",
  },
  searchWrap: {
    borderRadius: 20,
    padding: 12,
    display: "grid",
    gap: 10,
  },
  panelDark: {
    background: "rgba(10,17,31,0.78)",
    border: "1px solid rgba(79,97,130,0.22)",
  },
  panelLight: {
    background: "rgba(255,251,247,0.82)",
    border: "1px solid rgba(133,99,66,0.12)",
  },
  searchInput: {
    width: "100%",
    borderRadius: 14,
    padding: "15px 16px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  searchInputDark: {
    background: "rgba(9,17,33,0.92)",
    border: "1px solid rgba(71,85,105,0.26)",
    color: "#f8fafc",
  },
  searchInputLight: {
    background: "rgba(255,250,244,0.95)",
    border: "1px solid rgba(133,99,66,0.14)",
    color: "#162033",
  },
  searchList: {
    display: "grid",
    gap: 8,
  },
  searchItem: {
    borderRadius: 14,
    padding: "12px 14px",
    textAlign: "left",
    cursor: "pointer",
    border: "1px solid transparent",
    display: "grid",
    gap: 4,
  },
  heroSide: {
    minWidth: 0,
  },
  heroSideMobile: {
    width: "100%",
  },
  quickCard: {
    borderRadius: 22,
    padding: "18px",
    display: "grid",
    gap: 12,
  },
  quickTag: {
    width: "fit-content",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 800,
    background: "rgba(249,115,22,0.12)",
    color: "#f97316",
    textTransform: "uppercase",
  },
  quickTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.1,
    fontWeight: 900,
  },
  quickText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.65,
    color: "#94a3b8",
  },
  quickLinks: {
    display: "grid",
    gap: 10,
  },
  quickLink: {
    width: "100%",
    textAlign: "left",
    borderRadius: 14,
    padding: "14px 14px",
    fontWeight: 800,
    cursor: "pointer",
    border: "1px solid transparent",
  },
  quickLinkDark: {
    background: "rgba(15,23,42,0.72)",
    borderColor: "rgba(79,97,130,0.18)",
    color: "#e6edf8",
  },
  quickLinkLight: {
    background: "rgba(255,251,246,0.86)",
    borderColor: "rgba(133,99,66,0.12)",
    color: "#162033",
  },
  stageCard: {
    borderRadius: 22,
    padding: 18,
    display: "grid",
    gap: 12,
    overflow: "hidden",
  },
  stageBadge: {
    width: "fit-content",
    borderRadius: 999,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 800,
    background: "rgba(59,130,246,0.12)",
    color: "#60a5fa",
    textTransform: "uppercase",
  },
  stageFrame: {
    position: "relative",
    minHeight: 235,
  },
  stagePanel: {
    position: "absolute",
    borderRadius: 20,
    background: "linear-gradient(180deg, rgba(18,24,40,0.96), rgba(11,17,31,0.86))",
    border: "1px solid rgba(96,165,250,0.16)",
    boxShadow: "0 24px 44px rgba(2,6,23,0.28)",
  },
  stagePanelMain: {
    inset: "30px 8px 10px 8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(-2deg)",
  },
  stagePanelOne: {
    top: 2,
    left: 4,
    width: 128,
    padding: 14,
    transform: "rotate(-7deg)",
  },
  stagePanelTwo: {
    bottom: 0,
    left: 26,
    width: 150,
    padding: 14,
    transform: "rotate(8deg)",
  },
  stagePanelThree: {
    top: 40,
    right: 0,
    width: 142,
    padding: 14,
    transform: "rotate(7deg)",
  },
  stageFlow: {
    color: "#f8fafc",
    fontSize: 28,
    lineHeight: 1.08,
    fontWeight: 900,
    letterSpacing: -0.8,
    textAlign: "center",
  },
  stageMiniTag: {
    display: "inline-flex",
    padding: "4px 8px",
    borderRadius: 999,
    background: "rgba(59,130,246,0.16)",
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: 800,
    marginBottom: 8,
  },
  stageMiniTitle: {
    display: "block",
    color: "#f8fafc",
    fontSize: 15,
    lineHeight: 1.3,
    fontWeight: 800,
  },
  section: {
    display: "grid",
    gap: 16,
    marginBottom: 38,
  },
  sectionHead: {
    display: "grid",
    gap: 6,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 38px)",
    lineHeight: 1.12,
    fontWeight: 900,
    letterSpacing: -1,
  },
  sectionSub: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.6,
    color: "#94a3b8",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 14,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  infoCard: {
    borderRadius: 18,
    padding: 18,
    display: "grid",
    gap: 8,
  },
  infoTitle: {
    margin: 0,
    color: "var(--ff-text)",
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 900,
  },
  infoText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 1.65,
  },
  card: {
    borderRadius: 18,
    padding: "18px",
    textAlign: "left",
    cursor: "pointer",
    border: "1px solid transparent",
    display: "grid",
    gap: 10,
  },
  cardDark: {
    background: "rgba(12,20,37,0.88)",
    borderColor: "rgba(79,97,130,0.22)",
    color: "#f8fafc",
  },
  cardLight: {
    background: "rgba(255,252,247,0.88)",
    borderColor: "rgba(133,99,66,0.12)",
    color: "#162033",
  },
  cardTag: {
    width: "fit-content",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 800,
    background: "rgba(249,115,22,0.1)",
    color: "#f97316",
  },
  cardTitle: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 900,
  },
  cardText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6,
    color: "#94a3b8",
  },
  cardAction: {
    fontSize: 13,
    fontWeight: 800,
    color: "#f97316",
  },
};
