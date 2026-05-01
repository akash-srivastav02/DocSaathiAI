import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getUtilityPageBySlug } from "../utils/utilityPages";

export default function UtilityPage() {
  const { utilitySlug } = useParams();
  const navigate = useNavigate();
  const page = getUtilityPageBySlug(utilitySlug);

  useEffect(() => {
    if (!page) return;
    document.title = `${page.title} Online | FormFixer`;
  }, [page]);

  if (!page) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={s.root}>
      <div style={s.wrap}>
        <button style={s.backBtn} onClick={() => navigate("/")}>← Back</button>
        <div style={s.hero}>
          <span style={s.badge}>{page.category} Utility</span>
          <h1 style={s.title}>{page.title}</h1>
          <p style={s.sub}>
            {page.summary} Use this page when you need a direct online fix without searching across multiple tools.
          </p>
        </div>

        <div style={s.infoGrid}>
          <div style={s.infoCard}>
            <p style={s.infoLabel}>{page.kind === "converter" ? "Format" : "Target Size"}</p>
            <p style={s.infoValue}>{page.kind === "converter" ? page.category : page.targetLabel}</p>
            <p style={s.infoText}>
              {page.kind === "converter"
                ? "The converter will open ready for this file type workflow."
                : "The tool will open with this target already selected."}
            </p>
          </div>
          <div style={s.infoCard}>
            <p style={s.infoLabel}>Best For</p>
            <p style={s.infoValue}>
              {page.bestFor || (page.category === "Image" ? "Photo uploads" : page.category === "PDF" ? "Document uploads" : "File conversion")}
            </p>
            <p style={s.infoText}>Useful for exam portals, college forms, and document verification uploads.</p>
          </div>
        </div>

        <div style={s.ctaBox}>
          <button style={s.primaryBtn} onClick={() => navigate(page.route)}>
            Open {page.title}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "transparent", color: "#f8fafc", fontFamily: "'Segoe UI', sans-serif" },
  wrap: { maxWidth: 920, margin: "0 auto", padding: "28px 20px 56px" },
  backBtn: { background: "#111827", border: "1px solid #334155", color: "#cbd5e1", padding: "10px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700 },
  hero: { marginTop: 22, display: "flex", flexDirection: "column", gap: 10 },
  badge: { width: "fit-content", padding: "7px 12px", borderRadius: 999, background: "#f9731618", border: "1px solid #f9731635", color: "#fdba74", fontSize: 12, fontWeight: 800 },
  title: { margin: 0, fontSize: "clamp(28px, 5vw, 44px)", lineHeight: 1.08, fontWeight: 900 },
  sub: { margin: 0, color: "#94a3b8", fontSize: 17, lineHeight: 1.65, maxWidth: 760 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginTop: 28 },
  infoCard: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, padding: 18 },
  infoLabel: { margin: "0 0 8px", color: "#f97316", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 },
  infoValue: { margin: "0 0 8px", color: "#f1f5f9", fontSize: 18, fontWeight: 800 },
  infoText: { margin: 0, color: "#94a3b8", fontSize: 14, lineHeight: 1.6 },
  ctaBox: { marginTop: 24 },
  primaryBtn: { background: "linear-gradient(135deg,#f97316,#ea580c)", border: "none", color: "#fff", padding: "14px 18px", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" },
};
