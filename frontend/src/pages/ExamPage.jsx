import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getExamBySlug } from "../utils/examPages";

const EXAM_SPECS = {
  "SSC CGL": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 70 px · 10-20 KB" },
  "SSC CHSL": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 70 px · 10-20 KB" },
  "SSC MTS": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 70 px · 10-20 KB" },
  "SSC GD": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 70 px · 10-20 KB" },
  "SBI PO": { photo: "200 x 200 px · 20-50 KB", signature: "200 x 80 px · 10-20 KB" },
  "SBI Clerk": { photo: "200 x 200 px · 20-50 KB", signature: "200 x 80 px · 10-20 KB" },
  "IBPS PO": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 80 px · 10-20 KB" },
  "IBPS Clerk": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 80 px · 10-20 KB" },
  "IBPS RRB": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 80 px · 10-20 KB" },
  "RRB NTPC": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 70 px · 10-20 KB" },
  "RRB Group D": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 70 px · 10-20 KB" },
  "RRB JE": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 70 px · 10-20 KB" },
  "JEE Main": { photo: "236 x 295 px · 10-200 KB", signature: "300 x 80 px · 4-30 KB" },
  "JEE Advanced": { photo: "236 x 295 px · 10-200 KB", signature: "300 x 80 px · 4-30 KB" },
  "NEET UG": { photo: "236 x 295 px · 10-200 KB", signature: "300 x 80 px · 4-30 KB" },
  "CUET UG": { photo: "200 x 230 px · 10-300 KB", signature: "200 x 80 px · 4-50 KB" },
  "UPSC CSE": { photo: "200 x 230 px · 20-300 KB", signature: "200 x 80 px · 10-100 KB" },
  "UPSC CDS": { photo: "200 x 230 px · 20-300 KB", signature: "200 x 80 px · 10-100 KB" },
  "UPSC NDA": { photo: "200 x 230 px · 20-300 KB", signature: "200 x 80 px · 10-100 KB" },
  "Delhi Police Constable": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 70 px · 10-20 KB" },
  "Delhi Police SI": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 70 px · 10-20 KB" },
  "UP Police": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 70 px · 10-20 KB" },
  NDA: { photo: "200 x 230 px · 20-300 KB", signature: "200 x 80 px · 10-100 KB" },
  AFCAT: { photo: "200 x 230 px · 20-300 KB", signature: "200 x 80 px · 10-100 KB" },
  "LIC AAO": { photo: "200 x 230 px · 20-50 KB", signature: "200 x 80 px · 10-20 KB" },
  GATE: { photo: "236 x 295 px · 10-500 KB", signature: "300 x 80 px · 4-100 KB" },
};

function SectionCard({ title, children }) {
  return (
    <section style={s.sectionCard}>
      <h2 style={s.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

export default function ExamPage() {
  const { examSlug } = useParams();
  const navigate = useNavigate();
  const exam = getExamBySlug(examSlug);

  useEffect(() => {
    if (!exam) return;
    document.title = `${exam.name} Photo, Signature, Eligibility & Syllabus | FormFixer`;
  }, [exam]);

  if (!exam) {
    return <Navigate to="/" replace />;
  }

  const specs = EXAM_SPECS[exam.name];

  return (
    <div style={s.root}>
      <div style={s.wrap}>
        <button style={s.backBtn} onClick={() => navigate("/")}>← Back</button>

        <div style={s.hero}>
          <span style={s.family}>{exam.family}</span>
          <h1 style={s.title}>{exam.name} Form Guide</h1>
          <p style={s.sub}>{exam.summary}</p>
        </div>

        <div style={s.specGrid}>
          <div style={s.specCard}>
            <p style={s.specLabel}>Photo Requirements</p>
            <p style={s.specValue}>{specs.photo}</p>
            <p style={s.specNote}>Auto white background, resize, and KB adjustment for this exam format.</p>
          </div>
          <div style={s.specCard}>
            <p style={s.specLabel}>Signature Requirements</p>
            <p style={s.specValue}>{specs.signature}</p>
            <p style={s.specNote}>Clean black-ink signature output with exact dimensions and file size.</p>
          </div>
        </div>

        <div style={s.ctaGrid}>
          <button style={s.primaryBtn} onClick={() => navigate(`/tool/photo?exam=${encodeURIComponent(exam.name)}`)}>
            Fix {exam.name} Photo
          </button>
          <button style={s.secondaryBtn} onClick={() => navigate(`/tool/signature?exam=${encodeURIComponent(exam.name)}`)}>
            Fix {exam.name} Signature
          </button>
          <button style={s.secondaryBtn} onClick={() => navigate(`/merger?exam=${encodeURIComponent(exam.name)}`)}>
            Merge Photo + Sign / Date
          </button>
          <button style={s.secondaryBtn} onClick={() => navigate("/pdf/compress")}>
            Compress PDF
          </button>
        </div>

        <SectionCard title="Before You Upload Your Photo">
          <ul style={s.list}>
            {exam.uploadTips.map((item) => (
              <li key={item} style={s.listItem}>{item}</li>
            ))}
          </ul>
          <div style={s.warnPanel}>
            {exam.uploadWarnings.map((item) => (
              <p key={item} style={s.warnText}>{item}</p>
            ))}
          </div>
        </SectionCard>

        <div style={s.infoGrid}>
          <SectionCard title={`${exam.name} Overview`}>
            <p style={s.infoText}>{exam.overview}</p>
          </SectionCard>

          <SectionCard title="Eligibility">
            <p style={s.infoText}>{exam.eligibility}</p>
          </SectionCard>
        </div>

        <div style={s.infoGrid}>
          <SectionCard title="Documents Usually Needed">
            <ul style={s.list}>
              {exam.documents.map((item) => (
                <li key={item} style={s.listItem}>{item}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Syllabus Areas to Track">
            <ul style={s.list}>
              {exam.syllabus.map((item) => (
                <li key={item} style={s.listItem}>{item}</li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <SectionCard title="How FormFixer Helps">
          <p style={s.infoText}>
            Instead of guessing dimensions, background, and file size, you can start with the exact {exam.name} preset and generate a cleaner upload-ready file in one flow.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "radial-gradient(circle at top, #101a31 0%, #070c18 45%)", color: "#f8fafc", fontFamily: "'Segoe UI', sans-serif" },
  wrap: { maxWidth: 1080, margin: "0 auto", padding: "28px 20px 56px" },
  backBtn: { background: "#111827", border: "1px solid #334155", color: "#cbd5e1", padding: "10px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 700 },
  hero: { marginTop: 22, display: "flex", flexDirection: "column", gap: 10 },
  family: { width: "fit-content", padding: "7px 12px", borderRadius: 999, background: "#f9731618", border: "1px solid #f9731635", color: "#fdba74", fontSize: 12, fontWeight: 800 },
  title: { margin: 0, fontSize: "clamp(28px, 5vw, 44px)", lineHeight: 1.08, fontWeight: 900 },
  sub: { margin: 0, color: "#94a3b8", fontSize: 17, lineHeight: 1.65, maxWidth: 760 },
  specGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginTop: 28 },
  specCard: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, padding: 18 },
  specLabel: { margin: "0 0 8px", color: "#f97316", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 },
  specValue: { margin: "0 0 8px", color: "#f1f5f9", fontSize: 18, fontWeight: 800 },
  specNote: { margin: 0, color: "#94a3b8", fontSize: 14, lineHeight: 1.6 },
  ctaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 24 },
  primaryBtn: { background: "linear-gradient(135deg,#f97316,#ea580c)", border: "none", color: "#fff", padding: "14px 18px", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer" },
  secondaryBtn: { background: "#111827", border: "1px solid #334155", color: "#cbd5e1", padding: "14px 18px", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" },
  sectionCard: { marginTop: 24, background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, padding: 20 },
  sectionTitle: { margin: "0 0 12px", fontSize: 22, fontWeight: 800 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 4 },
  infoText: { margin: 0, color: "#94a3b8", fontSize: 15, lineHeight: 1.75 },
  list: { margin: 0, paddingLeft: 18, color: "#cbd5e1", display: "grid", gap: 10 },
  listItem: { lineHeight: 1.7 },
  warnPanel: { marginTop: 16, background: "#451a0335", border: "1px solid #92400e", borderRadius: 14, padding: "14px 16px", display: "grid", gap: 8 },
  warnText: { margin: 0, color: "#fdba74", fontSize: 14, lineHeight: 1.65 },
};
