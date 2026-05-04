import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import PublicTopBar from "../components/PublicTopBar";
import Seo from "../components/Seo";
import useTheme from "../hooks/useTheme";
import { BLOG_POSTS, getBlogPostBySlug } from "../utils/blogPosts";

const SITE_URL = "https://formfixer.in";

export default function BlogPostPage() {
  const { blogSlug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const post = getBlogPostBySlug(blogSlug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const canonical = `${SITE_URL}/blog/${post.slug}`;
  const relatedPosts = BLOG_POSTS.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 3);

  const articleSchema = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.summary,
        url: canonical,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          "@type": "Organization",
          name: "FormFixer",
        },
        publisher: {
          "@type": "Organization",
          name: "FormFixer",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/favicon.png`,
          },
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
    [canonical, post]
  );

  return (
    <div style={{ ...s.root, ...(isDark ? s.rootDark : s.rootLight) }}>
      <Seo
        title={`${post.title} | FormFixer Blog`}
        description={post.summary}
        canonical={canonical}
        keywords={post.keywords}
        type="article"
        ldJson={articleSchema}
      />
      <PublicTopBar />
      <main style={s.main}>
        <div style={s.backRow}>
          <button type="button" style={s.backBtn} onClick={() => navigate("/blog")}>
            Back to Blog
          </button>
        </div>

        <article style={s.articleWrap}>
          <div style={s.hero}>
            <div style={s.heroMeta}>
              <span style={s.heroTag}>{post.category}</span>
              <span style={s.heroDate}>{post.date}</span>
              <span style={s.heroDate}>{post.readTime}</span>
            </div>
            <h1 style={s.title}>{post.title}</h1>
            <p style={s.summary}>{post.summary}</p>
          </div>

          <div style={{ ...s.ctaCard, ...(isDark ? s.cardDark : s.cardLight) }}>
            <div style={s.ctaCopy}>
              <strong style={s.ctaTitle}>Use the matching tool directly</strong>
              <p style={s.ctaText}>{post.intro}</p>
            </div>
            <button type="button" style={s.primaryBtn} onClick={() => navigate(post.ctaRoute)}>
              {post.ctaLabel}
            </button>
          </div>

          <div style={{ ...s.contentCard, ...(isDark ? s.cardDark : s.cardLight) }}>
            {post.sections.map((section) => (
              <section key={section.heading} style={s.section}>
                <h2 style={s.sectionTitle}>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} style={s.paragraph}>
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          <div style={{ ...s.contentCard, ...(isDark ? s.cardDark : s.cardLight) }}>
            <h2 style={s.sectionTitle}>Frequently asked questions</h2>
            <div style={s.faqGrid}>
              {post.faqs.map((item) => (
                <div key={item.q} style={s.faqItem}>
                  <h3 style={s.faqQ}>{item.q}</h3>
                  <p style={s.faqA}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {relatedPosts.length ? (
            <div style={s.relatedWrap}>
              <h2 style={s.sectionTitle}>Related guides</h2>
              <div style={s.relatedGrid}>
                {relatedPosts.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    style={{ ...s.relatedCard, ...(isDark ? s.cardDark : s.cardLight) }}
                    onClick={() => navigate(`/blog/${item.slug}`)}
                  >
                    <span style={s.relatedTag}>{item.category}</span>
                    <strong style={s.relatedTitle}>{item.title}</strong>
                    <span style={s.relatedText}>{item.summary}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </main>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "transparent", fontFamily: "'Segoe UI', sans-serif" },
  rootDark: { color: "#f8fafc" },
  rootLight: { color: "#162033" },
  main: { maxWidth: 1040, margin: "0 auto", padding: "104px 18px 72px" },
  backRow: { marginBottom: 14 },
  backBtn: {
    border: "1px solid rgba(148,163,184,0.18)",
    background: "transparent",
    color: "inherit",
    borderRadius: 999,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  articleWrap: { display: "grid", gap: 20 },
  hero: { display: "grid", gap: 12 },
  heroMeta: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  heroTag: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.18)",
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: 800,
  },
  heroDate: { color: "#94a3b8", fontSize: 13, fontWeight: 700 },
  title: { margin: 0, fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.06, fontWeight: 900 },
  summary: { margin: 0, color: "#94a3b8", fontSize: 18, lineHeight: 1.72 },
  ctaCard: {
    borderRadius: 24,
    border: "1px solid rgba(148,163,184,0.14)",
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
  },
  contentCard: {
    borderRadius: 24,
    border: "1px solid rgba(148,163,184,0.14)",
    padding: 22,
    display: "grid",
    gap: 18,
  },
  cardDark: { background: "rgba(8,16,30,0.84)", boxShadow: "0 18px 44px rgba(2,6,23,0.28)" },
  cardLight: { background: "rgba(255,255,255,0.88)", boxShadow: "0 18px 44px rgba(148,163,184,0.16)" },
  ctaCopy: { display: "grid", gap: 8, maxWidth: 700 },
  ctaTitle: { fontSize: 20, lineHeight: 1.2 },
  ctaText: { margin: 0, color: "#94a3b8", lineHeight: 1.7 },
  primaryBtn: {
    border: "none",
    borderRadius: 999,
    padding: "12px 16px",
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  section: { display: "grid", gap: 10 },
  sectionTitle: { margin: 0, fontSize: 26, lineHeight: 1.12, fontWeight: 900 },
  paragraph: { margin: 0, color: "#cbd5e1", lineHeight: 1.82, fontSize: 16 },
  faqGrid: { display: "grid", gap: 14 },
  faqItem: { display: "grid", gap: 8 },
  faqQ: { margin: 0, fontSize: 19, lineHeight: 1.3, fontWeight: 800 },
  faqA: { margin: 0, color: "#94a3b8", lineHeight: 1.74, fontSize: 15 },
  relatedWrap: { display: "grid", gap: 14 },
  relatedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 },
  relatedCard: {
    borderRadius: 20,
    border: "1px solid rgba(148,163,184,0.14)",
    padding: 18,
    display: "grid",
    gap: 10,
    textAlign: "left",
    color: "inherit",
    cursor: "pointer",
  },
  relatedTag: { color: "#f97316", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 },
  relatedTitle: { fontSize: 18, lineHeight: 1.3 },
  relatedText: { color: "#94a3b8", lineHeight: 1.66, fontSize: 14 },
};
