import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLanguage from "../hooks/useLanguage";
import useStore from "../store/useStore";
import useIsMobile from "../hooks/useIsMobile";
import useTheme from "../hooks/useTheme";
import { EXAM_PAGE_DATA } from "../utils/examPages";
import { UTILITY_PAGE_DATA } from "../utils/utilityPages";
import Seo from "../components/Seo";

const FEATURES = [
  {
    title: "Exam Photo Resize",
    desc: "Fix SSC, SBI, IBPS, JEE and NEET photo size in seconds.",
    tag: "Photo",
    route: "/tool/photo",
  },
  {
    title: "Signature Resize",
    desc: "Prepare exact signature dimensions and file size for exam forms.",
    tag: "Sign",
    route: "/tool/signature",
  },
  {
    title: "PDF Compression",
    desc: "Compress certificates, marksheets and forms to exact upload limits.",
    tag: "PDF",
    route: "/pdf/compress",
  },
  {
    title: "Image to PDF",
    desc: "Convert JPG, PNG, WEBP and HEIC images into one clean PDF.",
    tag: "Convert",
    route: "/pdf/image-to-pdf",
  },
  {
    title: "Photo + Sign Merger",
    desc: "Merge photo, signature and date into one clean upload-ready file.",
    tag: "Merge",
    route: "/merger",
  },
  {
    title: "Image Compressor",
    desc: "Reduce JPG and PNG files to exact KB limits for forms and portals.",
    tag: "Utility",
    route: "/tool/imgcompress",
  },
];

const DIFFERENTIATORS = [
  {
    title: "One toolkit, not ten tabs",
    desc: "Photo resize, signature fix, PDF compression, merger, and conversion stay together in one browser toolkit.",
  },
  {
    title: "Problem-based discovery",
    desc: "Users can search exact intents like compress image to 20KB or SSC CGL photo resize and land on the right page fast.",
  },
  {
    title: "Built for mobile urgency",
    desc: "Most users come with one urgent file problem, so the flow is optimized for quick fixes on phone without extra friction.",
  },
];

const SEARCH_LINKS = [
  { label: "SSC CGL photo resize", route: "/exam/ssc-cgl" },
  { label: "UPSC CDS photo resize", route: "/exam/upsc-cds" },
  { label: "Compress image to 20KB", route: "/utility/compress-image-to-20kb" },
  { label: "Compress PDF to 200KB", route: "/utility/compress-pdf-to-200kb" },
  { label: "JPG to PDF online", route: "/utility/jpg-to-pdf-online" },
  { label: "NEET UG photo resize", route: "/exam/neet-ug" },
];

const EXAMS = EXAM_PAGE_DATA.filter((exam) =>
  ["SSC CGL", "SSC CHSL", "SBI PO", "IBPS Clerk", "RRB NTPC", "JEE Main", "NEET UG", "UP Police"].includes(exam.name)
);

const normalizeText = (value) => String(value || "").toLowerCase();
const SITE_URL = "https://formfixer.in";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useStore();
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const isMobile = useIsMobile(820);
  const [query, setQuery] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const t = useMemo(() => getThemeStyles(isDark), [isDark]);

  useEffect(() => {
    let frame = null;

    const updateScroll = () => {
      frame = null;
      setScrollY(window.scrollY || 0);
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  const sceneStyle = {
    transform: `translate3d(0, ${Math.min(scrollY * 0.08, 68)}px, 0) scale(${1 + Math.min(scrollY / 5000, 0.03)})`,
  };

  const heroStageStyle = isMobile
    ? { transform: "none" }
    : { transform: `translate3d(0, ${Math.min(scrollY * 0.12, 84)}px, 0)` };

  const stageParallaxVars = isMobile
    ? { "--ff-stage-scroll": "0px", "--ff-stage-rotate": "0deg" }
    : {
        "--ff-stage-scroll": `${Math.min(scrollY * 0.1, 54)}px`,
        "--ff-stage-rotate": `${Math.min(scrollY * 0.01, 4)}deg`,
      };

  const rushAccentStyle = isMobile
    ? { "--ff-rush-scroll": "0px", "--ff-rush-spin": "0deg" }
    : {
        "--ff-rush-scroll": `${Math.min(scrollY * 0.14, 30)}px`,
        "--ff-rush-spin": `${Math.min(scrollY * 0.08, 28)}deg`,
      };

  const searchResults = useMemo(() => {
    const normalized = normalizeText(query.trim());
    if (!normalized) return [];

    const examMatches = EXAM_PAGE_DATA
      .filter(
        (exam) =>
          normalizeText(exam.name).includes(normalized) ||
          normalizeText(exam.family).includes(normalized) ||
          normalizeText(exam.summary).includes(normalized)
      )
      .slice(0, 6)
      .map((exam) => ({
        key: `exam-${exam.slug}`,
                  type: "Exam Page",
        title: exam.name || "Exam Guide",
        summary: exam.summary || "Open the exam page, document rules, and tool links.",
        route: `/exam/${exam.slug}`,
      }));

    const utilityMatches = UTILITY_PAGE_DATA
      .filter(
        (item) =>
          normalizeText(item.title).includes(normalized) ||
          normalizeText(item.summary).includes(normalized) ||
          normalizeText(item.targetLabel).includes(normalized) ||
          normalizeText(item.bestFor).includes(normalized)
      )
      .slice(0, 6)
      .map((item) => ({
        key: `utility-${item.slug}`,
        type: `${item.category || "Utility"} Tool`,
        title: item.title || "Utility Tool",
        summary: item.summary || "Open the matching tool page and continue from there.",
        route: `/utility/${item.slug}`,
      }));

    return [...examMatches, ...utilityMatches].slice(0, 8);
  }, [query]);

  const landingSchema = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "FormFixer",
        alternateName: ["Form Fixer", "From Fixer", "formfixer.in"],
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.png`,
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "FormFixer",
        alternateName: ["Form Fixer", "From Fixer"],
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "FormFixer",
        alternateName: ["Form Fixer", "From Fixer"],
        url: SITE_URL,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web",
        description:
          "FormFixer is a browser document toolkit for exam photo resize, signature resize, PDF compression, image compression, and upload-ready file conversion.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is FormFixer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "FormFixer is an online browser toolkit to resize exam photos, fix signatures, compress PDFs, and solve upload-ready document problems quickly.",
            },
          },
          {
            "@type": "Question",
            name: "Can FormFixer help with SSC CGL photo resize and signature resize?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. FormFixer has exam-specific pages and tools for SSC CGL, SSC CHSL, banking exams, railway exams, JEE, NEET, UPSC, and more.",
            },
          },
          {
            "@type": "Question",
            name: "Why search Form Fixer or FormFixer for exam uploads?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "FormFixer combines exact photo and signature tools, PDF utilities, conversion pages, and exam guides in one place, so users do not need to switch between multiple websites.",
            },
          },
          {
            "@type": "Question",
            name: "Is FormFixer also searched as Form Fixer or from fixer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Users may search FormFixer as Form Fixer, and sometimes even type from fixer by mistake. The official website is formfixer.in.",
            },
          },
        ],
      },
    ],
    []
  );

  return (
    <div
      style={{
        ...s.root,
        ...t.root,
        "--ff-stage-scroll": isMobile ? "0px" : `${Math.min(scrollY * 0.1, 54)}px`,
        "--ff-stage-rotate": isMobile ? "0deg" : `${Math.min(scrollY * 0.01, 4)}deg`,
      }}
    >
      <Seo
        title="FormFixer (Form Fixer) | Official formfixer.in Photo, PDF & Document Tools"
        description="FormFixer, also searched as Form Fixer, is the official formfixer.in toolkit for exam photo resize, signature resize, PDF compression, image conversion, and upload-ready document fixes."
        canonical={SITE_URL}
        keywords="FormFixer, Form Fixer, from fixer, formfixer.in, exam photo resize, signature resize, compress image to 20kb, compress pdf to 200kb, SSC CGL photo resize, JEE Main photo resize, NEET photo resize"
        ldJson={landingSchema}
      />
      <div className="ff-scene" aria-hidden="true" style={sceneStyle}>
        <div className="ff-scene__grid" />
        <div className="ff-scene__ring ff-scene__ring--one" />
        <div className="ff-scene__ring ff-scene__ring--two" />
        <div className="ff-scene__orb ff-scene__orb--orange" />
        <div className="ff-scene__orb ff-scene__orb--blue" />
        <div className="ff-scene__orb ff-scene__orb--green" />
      </div>

      <header style={{ ...s.nav, ...t.nav, ...(isMobile ? s.navMobile : null) }} className="ff-glass">
        <div style={s.brand}>
          <img src="/favicon.png" alt="FormFixer logo" style={s.brandIcon} />
          <span style={{ ...s.brandText, ...t.brandText }}>FormFixer</span>
        </div>
        <div style={{ ...s.navActions, ...(isMobile ? s.navActionsMobile : null) }}>
          <button type="button" style={{ ...s.langBtn, ...t.themeBtn, ...(isMobile ? s.navButtonMobile : null) }} onClick={toggleLanguage}>
            {language === "hi" ? "हिं / EN" : "EN / हिं"}
          </button>
          <button type="button" style={{ ...s.themeBtn, ...t.themeBtn, ...(isMobile ? s.navButtonMobile : null) }} onClick={toggleTheme}>
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            <strong>{theme === "dark" ? "☼" : "☾"}</strong>
          </button>
          <button style={{ ...s.primaryBtn, ...(isMobile ? s.navButtonMobile : null) }} onClick={() => navigate(user ? "/dashboard" : "/all-tools")}>
            {user ? "Open Tool Hub" : "View All Tools"}
          </button>
        </div>
      </header>

      <main style={{ ...s.main, ...(isMobile ? s.mainMobile : null) }}>
          <section style={{ ...s.hero, ...(isMobile ? s.heroMobile : null) }}>
          <div style={{ ...s.heroCopy, ...(isMobile ? s.heroCopyMobile : null) }}>
            <div style={{ ...s.heroBadge, ...t.heroBadge }}>Free browser document tools</div>
            <h1 style={{ ...s.heroTitle, ...t.heroTitle, ...(isMobile ? s.heroTitleMobile : null) }}>
              Resize, convert and fix documents
              <span style={{ ...s.heroAccent, ...t.heroAccent, ...(isMobile ? s.heroAccentMobile : null) }}>
                without switching ten tabs
                <HeroRushAccent style={rushAccentStyle} compact={isMobile} />
              </span>
            </h1>
            <p style={{ ...s.heroSub, ...t.heroSub, ...(isMobile ? s.heroSubMobile : null) }}>
              FormFixer helps users resize exam photos, fix signatures, compress PDFs and images,
              merge files, and solve upload-ready document tasks from one clean tool hub.
            </p>
            <p style={{ ...s.heroTrust, ...t.heroSub, ...(isMobile ? s.heroTrustMobile : null) }}>
              Searching for <strong>Form Fixer</strong>, exam photo resize, signature resize, or
              upload-ready PDF tools? You are in the right place.
            </p>
            <div style={{ ...s.heroActions, ...(isMobile ? s.heroActionsMobile : null) }}>
              <button
                style={{ ...s.primaryBtnLarge, ...(isMobile ? s.heroButtonMobile : null) }}
                onClick={() => navigate(user ? "/dashboard" : "/all-tools")}
              >
                  {user ? "Open Tool Hub" : "Start Exploring"}
              </button>
              <button
                type="button"
                style={{ ...s.secondaryBtnLarge, ...t.secondaryBtnLarge, ...(isMobile ? s.heroButtonMobile : null) }}
                onClick={() =>
                  document.getElementById("ff-tools-grid")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                  Explore Tools
              </button>
            </div>

            <div style={{ ...s.searchShell, ...t.searchShell, ...(isMobile ? s.searchShellMobile : null) }} className="ff-glass">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resize, compress, convert, exam pages, or exact KB tools"
                style={{ ...s.searchInput, ...t.searchInput, ...(isMobile ? s.searchInputMobile : null) }}
              />
              {searchResults.length > 0 && (
                <div style={{ ...s.searchResults, ...t.searchResults }}>
                  {searchResults.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      style={{ ...s.searchResultBtn, ...t.searchResultBtn }}
                      className="ff-hover-lift"
                      onClick={() => navigate(item.route)}
                    >
                      <span style={{ ...s.searchResultType, ...t.searchResultType }}>{item.type}</span>
                      <span style={{ ...s.searchResultTitle, ...t.searchResultTitle }}>{item.title}</span>
                      <span style={{ ...s.searchResultSummary, ...t.searchResultSummary }}>{item.summary}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ ...s.examStrip, ...(isMobile ? s.examStripMobile : null) }}>
              {EXAMS.map((exam) => (
                <button
                  key={exam.slug}
                  type="button"
                  style={{ ...s.examPillBtn, ...t.examPillBtn, ...(isMobile ? s.examPillBtnMobile : null) }}
                  onClick={() => navigate(`/exam/${exam.slug}`)}
                >
                  {exam.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...s.heroStage, ...(isMobile ? s.heroStageMobile : null), ...heroStageStyle }}>
            <WorkflowStage compact={isMobile} style={stageParallaxVars} />
            <div style={{ ...s.heroAside, ...t.searchResults, ...(isMobile ? s.heroAsideMobile : null) }} className="ff-glass ff-hover-lift">
              <div style={s.heroAsideBadge}>Ad-ready utility slot</div>
              <h3 style={{ ...s.heroAsideTitle, ...t.featureTitle }}>Use this space for discovery first</h3>
              <p style={{ ...s.heroAsideText, ...t.featureDesc }}>
                Keep it useful now with high-intent links. If you want, this panel can later host a clean AdSense block without hurting the hero copy.
              </p>
              <div style={s.heroAsideList}>
                <button type="button" style={{ ...s.heroAsideLink, ...t.searchIntentBtn }} onClick={() => navigate("/utility/compress-image-to-20kb")}>
                  Compress image to 20KB
                </button>
                <button type="button" style={{ ...s.heroAsideLink, ...t.searchIntentBtn }} onClick={() => navigate("/pdf/merge")}>
                  Merge PDF online
                </button>
                <button type="button" style={{ ...s.heroAsideLink, ...t.searchIntentBtn }} onClick={() => navigate("/tool/imgconvert")}>
                  Convert PDF or image to JPG
                </button>
              </div>
            </div>
          </div>
        </section>

        <section style={s.metrics}>
          <div style={{ ...s.metricCard, ...t.metricCard }} className="ff-glass ff-hover-lift">
            <strong style={{ ...s.metricNum, ...t.metricNum }}>15</strong>
            <span style={{ ...s.metricLabel, ...t.metricLabel }}>Free exports on signup</span>
          </div>
          <div style={{ ...s.metricCard, ...t.metricCard }} className="ff-glass ff-hover-lift">
            <strong style={{ ...s.metricNum, ...t.metricNum }}>5</strong>
            <span style={{ ...s.metricLabel, ...t.metricLabel }}>Weekly refill exports</span>
          </div>
          <div style={{ ...s.metricCard, ...t.metricCard }} className="ff-glass ff-hover-lift">
            <strong style={{ ...s.metricNum, ...t.metricNum }}>10s</strong>
              <span style={{ ...s.metricLabel, ...t.metricLabel }}>Tool hub in one place</span>
          </div>
        </section>

        <section style={s.featureSection} id="ff-tools-grid">
          <div style={s.sectionHead}>
              <h2 style={{ ...s.sectionTitle, ...t.sectionTitle }}>Popular tools for forms and uploads</h2>
              <p style={{ ...s.sectionSub, ...t.sectionSub }}>
                Start with the most-used tools, then jump into exact KB pages and exam-specific guides when needed.
              </p>
          </div>
          <div style={s.featureGrid}>
            {FEATURES.map((feature) => (
              <button
                key={feature.title}
                type="button"
                style={{ ...s.featureCard, ...t.featureCard }}
                className="ff-glass ff-hover-lift"
                  onClick={() => navigate(feature.route)}
              >
                <span style={{ ...s.featureTag, ...t.featureTag }}>{feature.tag}</span>
                <h3 style={{ ...s.featureTitle, ...t.featureTitle }}>{feature.title}</h3>
                <p style={{ ...s.featureDesc, ...t.featureDesc }}>{feature.desc}</p>
                <span style={{ ...s.featureLink, ...t.featureLink }}>Explore tool →</span>
              </button>
            ))}
          </div>
          <p style={{ ...s.exploreNote, ...t.exploreNote }}>
             Users can explore tools first. Login or signup can happen later only when they want clean downloads.
          </p>
        </section>

        <section style={s.featureSection}>
          <div style={s.sectionHead}>
            <h2 style={{ ...s.sectionTitle, ...t.sectionTitle }}>Popular size-based tools</h2>
            <p style={{ ...s.sectionSub, ...t.sectionSub }}>
              Direct pages for common upload limits like 20KB, 50KB, 100KB, and 200KB.
            </p>
          </div>
          <div style={s.featureGrid}>
            {UTILITY_PAGE_DATA.map((item) => (
              <button
                key={item.slug}
                type="button"
                style={{ ...s.featureCard, ...t.featureCard }}
                className="ff-glass ff-hover-lift"
                onClick={() => navigate(`/utility/${item.slug}`)}
              >
                <span style={{ ...s.featureTag, ...t.featureTag }}>{item.category}</span>
                <h3 style={{ ...s.featureTitle, ...t.featureTitle }}>{item.title}</h3>
                <p style={{ ...s.featureDesc, ...t.featureDesc }}>{item.summary}</p>
                <span style={{ ...s.featureLink, ...t.featureLink }}>Open page →</span>
              </button>
            ))}
          </div>
        </section>

        <section style={{ ...s.advantageSection, ...t.advantageSection }}>
          <div style={s.advantageCopy}>
            <div style={{ ...s.heroBadge, ...t.heroBadge }}>Why users stay</div>
            <h2 style={{ ...s.sectionTitle, ...t.sectionTitle }}>Why FormFixer feels better than generic online tools</h2>
            <p style={{ ...s.sectionSub, ...t.sectionSub }}>
              The tools should feel fast, exact, and easier to discover than generic utility pages.
            </p>
            <div style={s.differentiatorList}>
              {DIFFERENTIATORS.map((item) => (
                <div key={item.title} style={{ ...s.differentiatorCard, ...t.differentiatorCard }} className="ff-glass ff-hover-lift">
                  <h3 style={{ ...s.differentiatorTitle, ...t.differentiatorTitle }}>{item.title}</h3>
                  <p style={{ ...s.differentiatorDesc, ...t.differentiatorDesc }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={s.stageWrap}>
            <div className="ff-stage">
              <div className="ff-stage__panel ff-stage__panel--main">
                <span className="ff-stage__eyebrow">Aspirant Flow</span>
                <strong className="ff-stage__title">Upload → Fix → Preview → Download</strong>
                <p className="ff-stage__text">One smooth workflow instead of guessing file size, switching tabs, and retrying uploads.</p>
              </div>
              <div className="ff-stage__card ff-stage__card--one">
                <span className="ff-stage__chip">Photo</span>
                <strong>Exam preset</strong>
                <small>Resize and KB fix</small>
              </div>
              <div className="ff-stage__card ff-stage__card--two">
                <span className="ff-stage__chip">Merge</span>
                <strong>Photo + Sign / Date</strong>
                <small>One clean output</small>
              </div>
              <div className="ff-stage__card ff-stage__card--three">
                <span className="ff-stage__chip">PDF</span>
                <strong>Compress and convert</strong>
                <small>Upload-ready docs</small>
              </div>
            </div>
          </div>
        </section>

        <section style={s.featureSection}>
          <div style={s.sectionHead}>
            <h2 style={{ ...s.sectionTitle, ...t.sectionTitle }}>Search by exact problem</h2>
            <p style={{ ...s.sectionSub, ...t.sectionSub }}>
              These are the kinds of queries we want to win on Google, and the pages users actually need.
            </p>
          </div>
          <div style={s.searchIntentGrid}>
            {SEARCH_LINKS.map((item) => (
              <button
                key={item.label}
                type="button"
                style={{ ...s.searchIntentBtn, ...t.searchIntentBtn }}
                className="ff-glass ff-hover-lift"
                onClick={() => navigate(item.route)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section style={{ ...s.ctaSection, ...t.ctaSection }} className="ff-glass">
              <h2 style={{ ...s.sectionTitle, ...t.sectionTitle }}>Start free, use the exact tool you need</h2>
              <p style={{ ...s.sectionSub, ...t.sectionSub }}>
              Explore tools first, use exact utility pages, then unlock clean final downloads only when needed.
              </p>
              <button style={s.primaryBtnLarge} onClick={() => navigate(user ? "/dashboard" : "/all-tools")}>
              {user ? "Open Tool Hub" : "Try FormFixer"}
              </button>
        </section>
      </main>
    </div>
  );
}

function WorkflowStage({ compact = false, style = {} }) {
  return (
    <div className={`ff-stage${compact ? " ff-stage--compact" : ""}`} style={style}>
      <div className="ff-stage__panel ff-stage__panel--main">
        <span className="ff-stage__eyebrow">Tool Flow</span>
        <strong className="ff-stage__title">Search - Fix - Preview - Download</strong>
        <p className="ff-stage__text">One connected workflow for exam pages, file fixes, exact KB targets, and final downloads.</p>
      </div>
      <div className="ff-stage__card ff-stage__card--one">
        <span className="ff-stage__chip">Photo</span>
        <strong>Exam preset</strong>
        <small>Resize and KB fix</small>
      </div>
      <div className="ff-stage__card ff-stage__card--two">
        <span className="ff-stage__chip">Merge</span>
        <strong>Photo + Sign / Date</strong>
        <small>One clean output</small>
      </div>
      <div className="ff-stage__card ff-stage__card--three">
        <span className="ff-stage__chip">PDF</span>
        <strong>Compress and convert</strong>
        <small>Upload-ready docs</small>
      </div>
    </div>
  );
}

function HeroRushAccent({ style, compact = false }) {
  return (
    <span className={`ff-rush-accent${compact ? " ff-rush-accent--compact" : ""}`} aria-hidden="true" style={style}>
      <span className="ff-rush-accent__ring" />
      <span className="ff-rush-accent__cube" />
      <span className="ff-rush-accent__spark ff-rush-accent__spark--one" />
      <span className="ff-rush-accent__spark ff-rush-accent__spark--two" />
    </span>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', sans-serif",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "18px 20px",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 8,
    flexWrap: "wrap",
  },
  navMobile: {
    padding: "14px 12px",
    alignItems: "stretch",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandIcon: { width: 34, height: 34, borderRadius: 10, objectFit: "contain" },
  brandText: { fontSize: 21, fontWeight: 900, letterSpacing: -0.5 },
  navActions: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  navActionsMobile: { width: "100%", alignItems: "stretch" },
  navButtonMobile: { flex: "1 1 150px", justifyContent: "center" },
  langBtn: {
    padding: "10px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 800,
    border: "1px solid transparent",
  },
  main: { maxWidth: 1180, margin: "0 auto", padding: "112px 20px 56px", position: "relative", zIndex: 1 },
  mainMobile: { padding: "98px 12px 44px" },
  hero: {
    padding: "28px 0 18px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
    gap: 26,
    alignItems: "start",
  },
  heroMobile: {
    padding: "24px 0 28px",
    gridTemplateColumns: "1fr",
    gap: 18,
  },
  heroCopy: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    alignItems: "flex-start",
    minWidth: 0,
  },
  heroCopyMobile: {
    gap: 16,
  },
  heroBadge: {
    padding: "7px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  heroTitle: {
    fontSize: "clamp(40px, 8vw, 72px)",
    lineHeight: 0.98,
    fontWeight: 950,
    margin: 0,
    maxWidth: 920,
    letterSpacing: -2.4,
  },
  heroTitleMobile: {
    fontSize: "clamp(34px, 11vw, 46px)",
    lineHeight: 1.04,
    letterSpacing: -1.2,
  },
  heroAccent: { display: "inline-flex", alignItems: "center", gap: 16, flexWrap: "wrap" },
  heroAccentMobile: { gap: 10 },
  heroSub: { fontSize: 18, lineHeight: 1.72, margin: 0, maxWidth: 760 },
  heroSubMobile: { fontSize: 15, lineHeight: 1.62 },
  heroTrust: { fontSize: 14, lineHeight: 1.75, margin: 0, maxWidth: 760, opacity: 0.96 },
  heroTrustMobile: { fontSize: 13, lineHeight: 1.7 },
  heroActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  heroActionsMobile: { width: "100%" },
  heroButtonMobile: { width: "100%" },
  heroStage: {
    minWidth: 0,
    minHeight: 300,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    flexDirection: "column",
    gap: 16,
  },
  heroStageMobile: {
    minHeight: 280,
    width: "100%",
    overflow: "hidden",
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  heroAside: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    padding: "18px 18px 16px",
    display: "grid",
    gap: 12,
  },
  heroAsideMobile: {
    maxWidth: "100%",
    padding: "14px",
    gap: 10,
  },
  heroAsideBadge: {
    width: "fit-content",
    borderRadius: 999,
    padding: "5px 10px",
    background: "rgba(249, 115, 22, 0.12)",
    color: "#f97316",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  heroAsideTitle: { margin: 0, fontSize: 22, lineHeight: 1.12, fontWeight: 900 },
  heroAsideText: { margin: 0, fontSize: 14, lineHeight: 1.65 },
  heroAsideList: { display: "grid", gap: 10 },
  heroAsideLink: {
    width: "100%",
    textAlign: "left",
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
  },
  searchShell: { position: "relative", width: "100%", maxWidth: 860, borderRadius: 22, padding: 14 },
  searchShellMobile: { padding: 10, borderRadius: 18 },
  searchInput: {
    width: "100%",
    borderRadius: 16,
    padding: "17px 18px",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  },
  searchInputMobile: { padding: "14px 14px", fontSize: 14, borderRadius: 14 },
  searchResults: {
    marginTop: 10,
    display: "grid",
    gap: 10,
    borderRadius: 16,
    padding: 12,
  },
  searchResultBtn: {
    borderRadius: 14,
    padding: "12px 14px",
    display: "grid",
    gap: 4,
    textAlign: "left",
    cursor: "pointer",
    color: "inherit",
    fontFamily: "inherit",
  },
  searchResultType: { fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 },
  searchResultTitle: { fontSize: 15, fontWeight: 800 },
  searchResultSummary: { fontSize: 13, lineHeight: 1.5 },
  primaryBtn: {
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    border: "none",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 16px 32px rgba(249, 115, 22, 0.22)",
  },
  primaryBtnLarge: {
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    border: "none",
    color: "#fff",
    padding: "14px 22px",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 18px 42px rgba(249, 115, 22, 0.26)",
  },
  secondaryBtnLarge: {
    padding: "14px 22px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  examStrip: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 },
  examStripMobile: { gap: 8, width: "100%" },
  examPillBtn: {
    borderRadius: 999,
    padding: "9px 13px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  examPillBtnMobile: { flex: "1 1 calc(50% - 8px)", minWidth: 132, textAlign: "center" },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    margin: "18px 0 40px",
  },
  metricCard: {
    borderRadius: 16,
    padding: "22px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  metricNum: { fontSize: 34, fontWeight: 900, lineHeight: 1 },
  metricLabel: { fontSize: 14, lineHeight: 1.5 },
  featureSection: { display: "flex", flexDirection: "column", gap: 22, marginBottom: 40 },
  sectionHead: { display: "flex", flexDirection: "column", gap: 6 },
  sectionTitle: {
    fontSize: "clamp(28px, 4vw, 38px)",
    fontWeight: 850,
    margin: 0,
    lineHeight: 1.12,
    letterSpacing: -1.1,
  },
  sectionSub: { fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 700 },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 },
  featureCard: {
    borderRadius: 16,
    padding: "20px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
    appearance: "none",
    width: "100%",
  },
  featureTag: {
    width: "fit-content",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
  },
  featureTitle: { fontSize: 18, fontWeight: 800, margin: 0 },
  featureDesc: { fontSize: 14, lineHeight: 1.65, margin: 0 },
  featureLink: { fontSize: 13, fontWeight: 800, marginTop: "auto" },
  exploreNote: { fontSize: 14, lineHeight: 1.6, margin: "4px 0 0" },
  ctaSection: {
    borderRadius: 20,
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "flex-start",
  },
  advantageSection: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 24,
    alignItems: "center",
    marginBottom: 40,
  },
  advantageCopy: { display: "flex", flexDirection: "column", gap: 14 },
  differentiatorList: { display: "grid", gap: 12 },
  differentiatorCard: { borderRadius: 16, padding: "16px 18px" },
  differentiatorTitle: { margin: "0 0 6px", fontSize: 18, fontWeight: 800 },
  differentiatorDesc: { margin: 0, fontSize: 14, lineHeight: 1.65 },
  stageWrap: { display: "none" },
  searchIntentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  searchIntentBtn: {
    textAlign: "left",
    borderRadius: 14,
    padding: "16px 18px",
    border: "1px solid transparent",
    cursor: "pointer",
    fontWeight: 700,
  },
  themeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
    border: "1px solid transparent",
  },
};

function getThemeStyles(isDark) {
  return isDark
    ? {
        root: {
          background:
            "radial-gradient(circle at top, rgba(15, 34, 68, 0.92) 0%, rgba(7, 12, 24, 1) 54%)",
          color: "#f8fafc",
        },
        nav: { borderBottom: "1px solid rgba(79, 97, 130, 0.26)" },
        brandText: { color: "#f8fafc" },
        heroBadge: {
          background: "rgba(249, 115, 22, 0.12)",
          border: "1px solid rgba(249, 115, 22, 0.26)",
          color: "#fdba74",
        },
        heroTitle: { color: "#f8fafc" },
        heroAccent: { color: "#f97316" },
        heroSub: { color: "#94a3b8" },
        searchInput: {
          background: "rgba(9, 17, 33, 0.92)",
          border: "1px solid rgba(71, 85, 105, 0.26)",
          color: "#f8fafc",
        },
        searchResults: { background: "rgba(6, 12, 23, 0.76)", border: "1px solid rgba(71, 85, 105, 0.22)" },
        searchResultBtn: {
          background: "rgba(17, 24, 39, 0.84)",
          border: "1px solid rgba(71, 85, 105, 0.18)",
        },
        searchResultType: { color: "#f97316" },
        searchResultTitle: { color: "#f8fafc" },
        searchResultSummary: { color: "#94a3b8" },
        secondaryBtnLarge: {
          background: "rgba(15, 23, 42, 0.82)",
          border: "1px solid rgba(96, 165, 250, 0.2)",
          color: "#dbe7f9",
        },
        examPillBtn: {
          background: "rgba(13, 20, 33, 0.82)",
          border: "1px solid rgba(71, 85, 105, 0.2)",
          color: "#d6dfef",
        },
        metricNum: { color: "#f97316" },
        metricLabel: { color: "#9cb0cd" },
        sectionTitle: { color: "#f8fafc" },
        sectionSub: { color: "#94a3b8" },
        featureTag: {
          color: "#f97316",
          background: "rgba(249, 115, 22, 0.08)",
          border: "1px solid rgba(249, 115, 22, 0.2)",
        },
        featureTitle: { color: "#f8fafc" },
        featureDesc: { color: "#94a3b8" },
        featureLink: { color: "#fda75a" },
        exploreNote: { color: "#64748b" },
        differentiatorCard: {},
        differentiatorTitle: { color: "#f8fafc" },
        differentiatorDesc: { color: "#94a3b8" },
        searchIntentBtn: { color: "#e6edf8", borderColor: "rgba(79, 97, 130, 0.2)", background: "rgba(13, 20, 33, 0.72)" },
        themeBtn: {
          background: "rgba(15, 23, 42, 0.72)",
          borderColor: "rgba(96, 165, 250, 0.18)",
          color: "#e5edf7",
        },
      }
    : {
        root: {
          background:
            "radial-gradient(circle at top, rgba(255, 242, 222, 0.95) 0%, rgba(244, 239, 231, 1) 52%)",
          color: "#162033",
        },
        nav: { borderBottom: "1px solid rgba(133, 99, 66, 0.14)" },
        brandText: { color: "#172033" },
        heroBadge: {
          background: "rgba(216, 90, 6, 0.08)",
          border: "1px solid rgba(216, 90, 6, 0.18)",
          color: "#b45309",
        },
        heroTitle: { color: "#162033" },
        heroAccent: { color: "#d85a06" },
        heroSub: { color: "#59697d" },
        searchInput: {
          background: "rgba(255, 250, 244, 0.95)",
          border: "1px solid rgba(133, 99, 66, 0.14)",
          color: "#162033",
        },
        searchResults: { background: "rgba(255, 251, 247, 0.76)", border: "1px solid rgba(133, 99, 66, 0.12)" },
        searchResultBtn: {
          background: "rgba(255, 253, 249, 0.9)",
          border: "1px solid rgba(133, 99, 66, 0.1)",
        },
        searchResultType: { color: "#d85a06" },
        searchResultTitle: { color: "#162033" },
        searchResultSummary: { color: "#617186" },
        secondaryBtnLarge: {
          background: "rgba(255, 252, 247, 0.92)",
          border: "1px solid rgba(37, 99, 235, 0.14)",
          color: "#233148",
        },
        examPillBtn: {
          background: "rgba(255, 253, 249, 0.92)",
          border: "1px solid rgba(133, 99, 66, 0.12)",
          color: "#34445a",
        },
        metricNum: { color: "#d85a06" },
        metricLabel: { color: "#607084" },
        sectionTitle: { color: "#162033" },
        sectionSub: { color: "#5d6b7f" },
        featureTag: {
          color: "#d85a06",
          background: "rgba(216, 90, 6, 0.08)",
          border: "1px solid rgba(216, 90, 6, 0.15)",
        },
        featureTitle: { color: "#162033" },
        featureDesc: { color: "#5d6b7f" },
        featureLink: { color: "#c24c02" },
        exploreNote: { color: "#7a8799" },
        differentiatorCard: {},
        differentiatorTitle: { color: "#162033" },
        differentiatorDesc: { color: "#5d6b7f" },
        searchIntentBtn: { color: "#162033", borderColor: "rgba(133, 99, 66, 0.12)", background: "rgba(255, 251, 246, 0.86)" },
        themeBtn: {
          background: "rgba(255, 252, 247, 0.88)",
          borderColor: "rgba(133, 99, 66, 0.12)",
          color: "#162033",
        },
      };
}
