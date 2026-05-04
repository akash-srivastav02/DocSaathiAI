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
        badge: "SEO guides aur tool blogs",
        title: "FormFixer Blog",
        sub: "High-intent guides for exam photo resize, PDF fixes, file conversion, and upload-ready document workflows.",
        latest: "Latest guides",
        readMore: "Read article",
      }
    : {
        badge: "SEO guides and tool blogs",
        title: "FormFixer Blog",
        sub: "High-intent guides for exam photo resize, PDF fixes, file conversion, and upload-ready document workflows.",
        latest: "Latest guides",
        readMore: "Read article",
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
        title="FormFixer Blog | SEO Guides for PDF, Image, and Exam Upload Tools"
        description="Read FormFixer guides for compress image to 20KB, compress PDF to 200KB, merge PDF, split PDF, passport photo sheets, and exam photo workflows."
        canonical={`${SITE_URL}/blog`}
        keywords="FormFixer blog, compress image to 20kb guide, compress pdf to 200kb guide, merge pdf guide, exam photo resize guide"
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
