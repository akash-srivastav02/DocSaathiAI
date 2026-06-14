import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PublicTopBar from "../components/PublicTopBar";
import Seo from "../components/Seo";
import useLanguage from "../hooks/useLanguage";
import useTheme from "../hooks/useTheme";
import { BLOG_POSTS } from "../utils/blogPosts";

const SITE_URL = "https://formfixer.in";

export default function BlogIndexPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isDark } = useTheme();

  const copy = language === "hi"
    ? {
        badge: "Exam SEO guides aur traffic blogs",
        title: "FormFixer Blog",
        sub: "High-intent exam guides for SSC, UPSC, NEET, JEE, banking forms, and passport photo preparation. Built to grow search traffic and future ad revenue.",
        latest: "Latest guides",
        readMore: "Read article",
        featured: "Featured for search intent",
        adLabel: "Ad space",
      }
    : {
        badge: "Exam SEO guides and traffic blogs",
        title: "FormFixer Blog",
        sub: "High-intent exam guides for SSC, UPSC, NEET, JEE, banking forms, and passport photo preparation. Built to grow search traffic and future ad revenue.",
        latest: "Latest guides",
        readMore: "Read article",
        featured: "Featured for search intent",
        adLabel: "Ad space",
      };

  const blogSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "FormFixer Blog",
      url: `${SITE_URL}/blog`,
      blogPost: BLOG_POSTS.slice(0, 10).map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        url: `${SITE_URL}/blog/${post.slug}`,
        datePublished: post.date,
        description: post.summary,
      })),
    }),
    []
  );

  return (
    <div style={{ ...s.root, ...(isDark ? s.rootDark : s.rootLight) }}>
      <Seo
        title="FormFixer Blog | Exam SEO Guides for SSC, UPSC, NEET, JEE and Form Uploads"
        description="Read FormFixer exam guides for SSC, UPSC, NEET, JEE, IBPS and passport photo preparation. Structured for search traffic and future Google Ads monetization."
        canonical={`${SITE_URL}/blog`}
        keywords="FormFixer blog, SSC CGL photo size guide, UPSC CDS photo resize guide, NEET photo size guide, JEE Main photo size guide"
        type="website"
        ldJson={blogSchema}
      />
      <PublicTopBar />
      <main style={s.main}>
        <section style={s.hero}>
          <span style={s.badge}>{copy.badge}</span>
          <h1 style={s.title}>{copy.title}</h1>
          <p style={s.sub}>{copy.sub}</p>
        </section>

        <section style={s.featureRow}>
          <div style={{ ...s.featureCard, ...(isDark ? s.cardDark : s.cardLight) }}>
            <p style={s.featureEyebrow}>{copy.featured}</p>
            <h2 style={s.featureTitle}>Rank for high-intent exam searches</h2>
            <p style={s.featureText}>Every article links directly to an exam page or passport photo workflow so traffic can move from Google search into the product without signup friction.</p>
          </div>
          <div style={{ ...s.adCard, ...(isDark ? s.cardDark : s.cardLight) }}>
            <span style={s.adTag}>{copy.adLabel}</span>
            <strong style={s.adTitle}>Responsive blog ad slot</strong>
            <p style={s.adText}>Use this block later for Google Ads display units after content starts getting indexed and impressions begin to grow.</p>
          </div>
        </section>

        <section style={s.section}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>{copy.latest}</h2>
          </div>
          <div style={s.grid}>
            {BLOG_POSTS.map((post) => (
              <article key={post.slug} style={{ ...s.card, ...(isDark ? s.cardDark : s.cardLight) }}>
                <div style={s.cardTop}>
                  <span style={s.cardTag}>{post.category}</span>
                  <span style={s.cardMeta}>{post.readTime}</span>
                </div>
                <h3 style={s.cardTitle}>{post.title}</h3>
                <p style={s.cardText}>{post.summary}</p>
                <div style={s.cardBottom}>
                  <span style={s.cardDate}>{post.date}</span>
                  <button type="button" style={s.cardBtn} onClick={() => navigate(`/blog/${post.slug}`)}>
                    {copy.readMore}
                  </button>
                </div>
              </article>
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
    background: "transparent",
    fontFamily: "'Segoe UI', sans-serif",
  },
  rootDark: { color: "#f8fafc" },
  rootLight: { color: "#162033" },
  main: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "108px 18px 72px",
  },
  hero: {
    display: "grid",
    gap: 12,
    padding: "18px 0 14px",
  },
  badge: {
    width: "fit-content",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.18)",
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: 800,
  },
  title: {
    margin: 0,
    fontSize: "clamp(32px, 6vw, 54px)",
    lineHeight: 1.04,
    fontWeight: 900,
  },
  sub: {
    margin: 0,
    maxWidth: 860,
    color: "#94a3b8",
    fontSize: 18,
    lineHeight: 1.7,
  },
  section: { marginTop: 18 },
  featureRow: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  sectionHead: { marginBottom: 18 },
  sectionTitle: { margin: 0, fontSize: 24, fontWeight: 900 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  card: {
    borderRadius: 22,
    border: "1px solid rgba(148,163,184,0.14)",
    padding: 20,
    display: "grid",
    gap: 14,
  },
  cardDark: {
    background: "rgba(8,16,30,0.84)",
    boxShadow: "0 18px 44px rgba(2,6,23,0.28)",
  },
  cardLight: {
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 18px 44px rgba(148,163,184,0.16)",
  },
  featureCard: {
    borderRadius: 22,
    border: "1px solid rgba(148,163,184,0.14)",
    padding: 22,
    display: "grid",
    gap: 10,
  },
  featureEyebrow: { margin: 0, color: "#f97316", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 },
  featureTitle: { margin: 0, fontSize: 26, lineHeight: 1.18, fontWeight: 900 },
  featureText: { margin: 0, color: "#94a3b8", lineHeight: 1.75, fontSize: 15 },
  adCard: {
    borderRadius: 22,
    border: "1px dashed rgba(249,115,22,0.34)",
    padding: 22,
    display: "grid",
    gap: 10,
    alignContent: "start",
  },
  adTag: {
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(249,115,22,0.12)",
    color: "#f97316",
    border: "1px solid rgba(249,115,22,0.18)",
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
  },
  adTitle: { fontSize: 20, lineHeight: 1.2 },
  adText: { margin: 0, color: "#94a3b8", lineHeight: 1.7, fontSize: 14 },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTag: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(249,115,22,0.12)",
    border: "1px solid rgba(249,115,22,0.18)",
    color: "#f97316",
    fontSize: 12,
    fontWeight: 800,
  },
  cardMeta: { color: "#94a3b8", fontSize: 12, fontWeight: 700 },
  cardTitle: { margin: 0, fontSize: 22, lineHeight: 1.24, fontWeight: 900 },
  cardText: { margin: 0, color: "#94a3b8", lineHeight: 1.72, fontSize: 15 },
  cardBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardDate: { color: "#64748b", fontSize: 13, fontWeight: 700 },
  cardBtn: {
    border: "none",
    borderRadius: 999,
    padding: "10px 14px",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
};
