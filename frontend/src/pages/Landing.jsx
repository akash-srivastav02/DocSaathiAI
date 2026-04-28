import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import useTheme from "../hooks/useTheme";
import { EXAM_PAGE_DATA } from "../utils/examPages";
import { UTILITY_PAGE_DATA } from "../utils/utilityPages";

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
];

const EXAMS = EXAM_PAGE_DATA.filter((exam) =>
  ["SSC CGL", "SSC CHSL", "SBI PO", "IBPS Clerk", "RRB NTPC", "JEE Main", "NEET UG", "UP Police"].includes(exam.name)
);

const normalizeText = (value) => String(value || "").toLowerCase();

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useStore();
  const { theme, isDark, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const t = useMemo(() => getThemeStyles(isDark), [isDark]);

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
        type: "Exam Guide",
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

  return (
    <div style={{ ...s.root, ...t.root }}>
      <div className="ff-scene" aria-hidden="true">
        <div className="ff-scene__grid" />
        <div className="ff-scene__ring ff-scene__ring--one" />
        <div className="ff-scene__ring ff-scene__ring--two" />
        <div className="ff-scene__orb ff-scene__orb--orange" />
        <div className="ff-scene__orb ff-scene__orb--blue" />
        <div className="ff-scene__orb ff-scene__orb--green" />
      </div>

      <header style={{ ...s.nav, ...t.nav }} className="ff-glass">
        <div style={s.brand}>
          <img src="/favicon.png" alt="FormFixer logo" style={s.brandIcon} />
          <span style={{ ...s.brandText, ...t.brandText }}>FormFixer</span>
        </div>
        <div style={s.navActions}>
          <button type="button" style={{ ...s.themeBtn, ...t.themeBtn }} onClick={toggleTheme}>
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            <strong>{theme === "dark" ? "☼" : "☾"}</strong>
          </button>
          <button style={s.primaryBtn} onClick={() => navigate(user ? "/dashboard" : "/auth")}>
            {user ? "Open Dashboard" : "Login / Sign Up"}
          </button>
        </div>
      </header>

      <main style={s.main}>
        <section style={s.hero}>
          <div style={{ ...s.heroBadge, ...t.heroBadge }}>Built for Indian exam forms</div>
          <h1 style={{ ...s.heroTitle, ...t.heroTitle }}>
            Fix exam photos, signatures and PDFs
            <span style={{ ...s.heroAccent, ...t.heroAccent }}> without the cyber cafe rush</span>
          </h1>
          <p style={{ ...s.heroSub, ...t.heroSub }}>
            FormFixer helps aspirants resize photos, compress PDFs, crop images and prepare
            upload-ready documents in seconds.
          </p>
          <div style={s.heroActions}>
            <button style={s.primaryBtnLarge} onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              {user ? "Continue to Dashboard" : "Start Exploring"}
            </button>
            <button
              type="button"
              style={{ ...s.secondaryBtnLarge, ...t.secondaryBtnLarge }}
              onClick={() =>
                document.getElementById("ff-tools-grid")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
            >
              Explore Live Tools
            </button>
          </div>

          <div style={{ ...s.searchShell, ...t.searchShell }} className="ff-glass">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exam pages, photo size help, or PDF size tools"
              style={{ ...s.searchInput, ...t.searchInput }}
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

          <div style={s.examStrip}>
            {EXAMS.map((exam) => (
              <button
                key={exam.slug}
                type="button"
                style={{ ...s.examPillBtn, ...t.examPillBtn }}
                onClick={() => navigate(`/exam/${exam.slug}`)}
              >
                {exam.name}
              </button>
            ))}
          </div>
        </section>

        <section style={s.metrics}>
          <div style={{ ...s.metricCard, ...t.metricCard }} className="ff-glass ff-hover-lift">
            <strong style={{ ...s.metricNum, ...t.metricNum }}>15</strong>
            <span style={{ ...s.metricLabel, ...t.metricLabel }}>Free credits on signup</span>
          </div>
          <div style={{ ...s.metricCard, ...t.metricCard }} className="ff-glass ff-hover-lift">
            <strong style={{ ...s.metricNum, ...t.metricNum }}>5</strong>
            <span style={{ ...s.metricLabel, ...t.metricLabel }}>Weekly refill credits</span>
          </div>
          <div style={{ ...s.metricCard, ...t.metricCard }} className="ff-glass ff-hover-lift">
            <strong style={{ ...s.metricNum, ...t.metricNum }}>10s</strong>
            <span style={{ ...s.metricLabel, ...t.metricLabel }}>Average processing time</span>
          </div>
        </section>

        <section style={s.featureSection} id="ff-tools-grid">
          <div style={s.sectionHead}>
            <h2 style={{ ...s.sectionTitle, ...t.sectionTitle }}>Everything needed for form uploads</h2>
            <p style={{ ...s.sectionSub, ...t.sectionSub }}>
              Focused tools, faster flow, and a more premium mobile-first experience.
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
            Users can explore these tools first. Login or signup can happen later when they want a clean download.
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

        <section style={{ ...s.ctaSection, ...t.ctaSection }} className="ff-glass">
          <h2 style={{ ...s.sectionTitle, ...t.sectionTitle }}>Start free, upgrade only when needed</h2>
          <p style={{ ...s.sectionSub, ...t.sectionSub }}>
            Explore the tools first, see the output, and continue only when you actually need a
            clean download.
          </p>
          <button style={s.primaryBtnLarge} onClick={() => navigate(user ? "/dashboard" : "/auth")}>
            {user ? "Go to Dashboard" : "Try Tools Now"}
          </button>
        </section>
      </main>
    </div>
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
    position: "sticky",
    top: 0,
    zIndex: 8,
    flexWrap: "wrap",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandIcon: { width: 34, height: 34, borderRadius: 10, objectFit: "contain" },
  brandText: { fontSize: 21, fontWeight: 900, letterSpacing: -0.5 },
  navActions: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  main: { maxWidth: 1180, margin: "0 auto", padding: "28px 20px 56px", position: "relative", zIndex: 1 },
  hero: {
    padding: "56px 0 34px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    alignItems: "flex-start",
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
  heroAccent: { display: "block" },
  heroSub: { fontSize: 18, lineHeight: 1.72, margin: 0, maxWidth: 760 },
  heroActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  searchShell: { position: "relative", width: "100%", maxWidth: 860, borderRadius: 22, padding: 14 },
  searchInput: {
    width: "100%",
    borderRadius: 16,
    padding: "17px 18px",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  },
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
  examPillBtn: {
    borderRadius: 999,
    padding: "9px 13px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
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
        themeBtn: {
          background: "rgba(255, 252, 247, 0.88)",
          borderColor: "rgba(133, 99, 66, 0.12)",
          color: "#162033",
        },
      };
}
