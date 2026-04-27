import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
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
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const normalized = normalizeText(query.trim());
    if (!normalized) return [];

    const examMatches = EXAM_PAGE_DATA
      .filter((exam) =>
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
      .filter((item) =>
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
    <div style={s.root}>
      <header style={s.nav}>
        <div style={s.brand}>
          <img src="/favicon.png" alt="FormFixer logo" style={s.brandIcon} />
          <span style={s.brandText}>FormFixer</span>
        </div>
        <div style={s.navActions}>
          <button style={s.primaryBtn} onClick={() => navigate(user ? "/dashboard" : "/auth")}>
            {user ? "Open Dashboard" : "Login / Sign Up"}
          </button>
        </div>
      </header>

      <main style={s.main}>
        <section style={s.hero}>
          <div style={s.heroBadge}>Built for Indian exam forms</div>
          <h1 style={s.heroTitle}>
            Fix exam photos, signatures and PDFs
            <span style={s.heroAccent}> without the cyber cafe rush</span>
          </h1>
          <p style={s.heroSub}>
            FormFixer helps aspirants resize photos, compress PDFs, crop images and prepare
            upload-ready documents in seconds.
          </p>
          <div style={s.heroActions}>
            <button style={s.primaryBtnLarge} onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              {user ? "Continue to Dashboard" : "Start Exploring"}
            </button>
          </div>
          <div style={s.searchShell}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exam pages, photo size help, or PDF size tools"
              style={s.searchInput}
            />
            {searchResults.length > 0 && (
              <div style={s.searchResults}>
                {searchResults.map((item) => (
                  <button key={item.key} type="button" style={s.searchResultBtn} onClick={() => navigate(item.route)}>
                    <span style={s.searchResultType}>{item.type}</span>
                    <span style={s.searchResultTitle}>{item.title}</span>
                    <span style={s.searchResultSummary}>{item.summary}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={s.examStrip}>
            {EXAMS.map((exam) => (
              <button key={exam.slug} type="button" style={s.examPillBtn} onClick={() => navigate(`/exam/${exam.slug}`)}>
                {exam.name}
              </button>
            ))}
          </div>
        </section>

        <section style={s.metrics}>
          <div style={s.metricCard}>
            <strong style={s.metricNum}>15</strong>
            <span style={s.metricLabel}>Free credits on signup</span>
          </div>
          <div style={s.metricCard}>
            <strong style={s.metricNum}>5</strong>
            <span style={s.metricLabel}>Weekly refill credits</span>
          </div>
          <div style={s.metricCard}>
            <strong style={s.metricNum}>10s</strong>
            <span style={s.metricLabel}>Average processing time</span>
          </div>
        </section>

        <section style={s.featureSection}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>Everything needed for form uploads</h2>
            <p style={s.sectionSub}>Focused tools, simple outputs, and clean mobile experience.</p>
          </div>
          <div style={s.featureGrid}>
            {FEATURES.map((feature) => (
              <button
                key={feature.title}
                type="button"
                style={s.featureCard}
                onClick={() => navigate(feature.route)}
              >
                <span style={s.featureTag}>{feature.tag}</span>
                <h3 style={s.featureTitle}>{feature.title}</h3>
                <p style={s.featureDesc}>{feature.desc}</p>
                <span style={s.featureLink}>Explore tool →</span>
              </button>
            ))}
          </div>
          <p style={s.exploreNote}>
            Users can explore these tools first. Login or signup can happen later when they want a clean download.
          </p>
        </section>

        <section style={s.featureSection}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>Popular size-based tools</h2>
            <p style={s.sectionSub}>Direct pages for common upload limits like 20KB, 50KB, 100KB, and 200KB.</p>
          </div>
          <div style={s.featureGrid}>
            {UTILITY_PAGE_DATA.map((item) => (
              <button
                key={item.slug}
                type="button"
                style={s.featureCard}
                onClick={() => navigate(`/utility/${item.slug}`)}
              >
                <span style={s.featureTag}>{item.category}</span>
                <h3 style={s.featureTitle}>{item.title}</h3>
                <p style={s.featureDesc}>{item.summary}</p>
                <span style={s.featureLink}>Open page →</span>
              </button>
            ))}
          </div>
        </section>

        <section style={s.ctaSection}>
          <h2 style={s.sectionTitle}>Start free, upgrade only when needed</h2>
          <p style={s.sectionSub}>
            Explore the tools first, see the output, and continue only when you actually need a clean download.
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
    background: "radial-gradient(circle at top, #101a31 0%, #070c18 45%)",
    color: "#f8fafc",
    fontFamily: "'Segoe UI', sans-serif",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "18px 20px",
    borderBottom: "1px solid #1e293b",
    background: "rgba(7, 12, 24, 0.78)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 5,
    flexWrap: "wrap",
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandIcon: { width: 34, height: 34, borderRadius: 10, objectFit: "contain" },
  brandText: { fontSize: 20, fontWeight: 800, letterSpacing: -0.3 },
  navActions: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  main: { maxWidth: 1120, margin: "0 auto", padding: "28px 20px 56px" },
  hero: {
    padding: "40px 0 28px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    alignItems: "flex-start",
  },
  heroBadge: {
    background: "#f9731618",
    border: "1px solid #f9731635",
    color: "#fdba74",
    padding: "7px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  heroTitle: { fontSize: "clamp(34px, 7vw, 60px)", lineHeight: 1.02, fontWeight: 900, margin: 0, maxWidth: 850 },
  heroAccent: { color: "#f97316", display: "block" },
  heroSub: { color: "#94a3b8", fontSize: 18, lineHeight: 1.65, margin: 0, maxWidth: 760 },
  heroActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  searchShell: { position: "relative", width: "100%", maxWidth: 760 },
  searchInput: {
    width: "100%",
    background: "#0d1421",
    border: "1px solid #223047",
    color: "#f8fafc",
    borderRadius: 16,
    padding: "16px 18px",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  },
  searchResults: {
    marginTop: 10,
    display: "grid",
    gap: 10,
    background: "#0b1220",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: 12,
  },
  searchResultBtn: {
    background: "#111827",
    border: "1px solid #223047",
    borderRadius: 14,
    padding: "12px 14px",
    display: "grid",
    gap: 4,
    textAlign: "left",
    cursor: "pointer",
    color: "inherit",
    fontFamily: "inherit",
  },
  searchResultType: { color: "#f97316", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 },
  searchResultTitle: { color: "#f8fafc", fontSize: 15, fontWeight: 800 },
  searchResultSummary: { color: "#94a3b8", fontSize: 13, lineHeight: 1.5 },
  primaryBtn: {
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    border: "none",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#111827",
    border: "1px solid #334155",
    color: "#cbd5e1",
    padding: "10px 16px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
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
  },
  secondaryBtnLarge: {
    background: "#111827",
    border: "1px solid #334155",
    color: "#cbd5e1",
    padding: "14px 22px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  examStrip: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 },
  examPillBtn: {
    background: "#0d1421",
    border: "1px solid #223047",
    color: "#cbd5e1",
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    margin: "12px 0 34px",
  },
  metricCard: {
    background: "#0d1421",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: "18px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  metricNum: { color: "#f97316", fontSize: 30, fontWeight: 900, lineHeight: 1 },
  metricLabel: { color: "#94a3b8", fontSize: 14, lineHeight: 1.5 },
  featureSection: { display: "flex", flexDirection: "column", gap: 20, marginBottom: 36 },
  sectionHead: { display: "flex", flexDirection: "column", gap: 6 },
  sectionTitle: { fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 800, margin: 0, lineHeight: 1.2 },
  sectionSub: { color: "#94a3b8", fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 700 },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 },
  featureCard: {
    background: "#0d1421",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: "18px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
    appearance: "none",
    width: "100%",
  },
  featureTag: {
    color: "#f97316",
    background: "#f9731615",
    border: "1px solid #f9731630",
    width: "fit-content",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
  },
  featureTitle: { fontSize: 18, fontWeight: 800, margin: 0 },
  featureDesc: { color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: 0 },
  featureLink: { color: "#f97316", fontSize: 13, fontWeight: 800, marginTop: "auto" },
  exploreNote: { color: "#64748b", fontSize: 14, lineHeight: 1.6, margin: "4px 0 0" },
  ctaSection: {
    background: "linear-gradient(180deg,#0d1421,#0b1220)",
    border: "1px solid #1e293b",
    borderRadius: 20,
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "flex-start",
  },
};
