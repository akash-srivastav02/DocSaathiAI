import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import AuthModal from "../components/AuthModal";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

function PdfPreviewCard({ count, pageMode, orientation }) {
  return (
    <div style={s.previewCard}>
      <div style={s.previewDoc}>
        <div style={s.previewDocTop}>
          <span style={{ fontSize: 34 }}>📄</span>
          <div>
            <div style={s.previewDocTitle}>Image to PDF Preview</div>
            <div style={s.previewDocMeta}>
              {count} image{count === 1 ? "" : "s"} · {pageMode === "a4" ? "A4 pages" : "Original-fit pages"} · {orientation}
            </div>
          </div>
        </div>
        <div style={s.previewDocBody}>
          <div>Final PDF will be watermark-free.</div>
          <div>Credits are deducted only at download time.</div>
        </div>
        <div style={s.previewWatermarkLayer}>
          {Array.from({ length: 10 }).map((_, index) => (
            <span key={index} style={s.previewWatermarkText}>FORMFIXER PREVIEW</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ImageToPdfPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = user ? (credits ?? user?.credits ?? 0) : 0;

  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [pageMode, setPageMode] = useState("a4");
  const [orientation, setOrientation] = useState("auto");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const acceptedLabel = useMemo(() => {
    const source = searchParams.get("source");
    if (!source) return "JPG, PNG, WEBP, HEIC";
    return `${source.toUpperCase()} images`;
  }, [searchParams]);

  useEffect(() => {
    const source = searchParams.get("source");
    if (!source) return;
    document.title = `${source.toUpperCase()} to PDF | FormFixer`;
  }, [searchParams]);

  const handleFiles = (incomingFiles) => {
    setFileError("");
    setResult(null);
    setDone(false);
    setError("");
    setDownloadUnlocked(false);

    const picked = Array.from(incomingFiles || []);
    if (!picked.length) return;

    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/heic", "image/heif"];
    const invalid = picked.find((file) => !allowed.includes(file.type));
    if (invalid) {
      setFileError("Only JPG, PNG, WEBP, HEIC, and HEIF images are allowed.");
      setFiles([]);
      return;
    }

    setFiles(picked.slice(0, 20));
  };

  const handleInputChange = (e) => handleFiles(e.target.files);
  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleConvert = async () => {
    setError("");
    if (!files.length) {
      setError("Please upload one or more images first.");
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      formData.append("pageMode", pageMode);
      formData.append("orientation", orientation);

      const { data } = await API.post("/pdf/image-to-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(data);
      setDone(true);
      setDownloadUnlocked(false);
    } catch (err) {
      setError(err.response?.data?.message || "Image to PDF conversion failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAfterAuth = async () => {
    if (!result?.url) return;
    setError("");

    try {
      if (!downloadUnlocked) {
        setDownloading(true);
        const { data } = await API.post("/process/confirm-download", {
          toolType: "imgtopdf",
          examName: `Image to PDF (${files.length} images)`,
          processedUrl: result.url,
        });
        if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);
        setDownloadUnlocked(true);
      }

      const response = await fetch(result.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "formfixer_images_to_pdf.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        return;
      }
      window.open(result.url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await handleDownloadAfterAuth();
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError("");
    setFileError("");
    setDone(false);
    setDownloadUnlocked(false);
  };

  const totalSizeMB = files.length
    ? (files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2)
    : "0.00";

  return (
    <div style={s.root}>
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={async () => {
            setShowAuthModal(false);
            await handleDownloadAfterAuth();
          }}
          title="Login to Download PDF"
          subtitle="Preview is available in guest mode. Final PDF download needs quick login."
        />
      )}
      {user && <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />}
      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : (
          <div style={s.guestBar}>
            <span>Preview in guest mode. Login only when you need the final PDF download.</span>
            <button style={s.guestLoginBtn} onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          </div>
        )}

        <div style={s.toolHeader}>
          <button style={s.backBtn} onClick={() => navigate(user ? "/dashboard" : "/")}>← Back</button>
          <div style={s.toolIcon}>🧾</div>
          <div>
            <h2 style={s.toolTitle}>Image to PDF</h2>
            <p style={s.toolDesc}>Convert multiple images into one PDF · 2 credits on final download</p>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.stepBadge}>Step 1 - Upload Images</div>
          <div
            style={{
              ...s.uploadZone,
              borderColor: fileError ? "#ef4444" : files.length ? "#f97316" : "#374151",
              pointerEvents: done ? "none" : "auto",
              opacity: done ? 0.5 : 1,
            }}
            onClick={() => !done && document.getElementById("imageToPdfInput")?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {files.length ? (
              <div style={s.filePreview}>
                <span style={{ fontSize: 44 }}>🖼️</span>
                <p style={s.fileName}>{files.length} image{files.length === 1 ? "" : "s"} selected</p>
                <p style={s.fileMeta}>{totalSizeMB} MB total · {acceptedLabel}</p>
                {!done && (
                  <button
                    style={s.changeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("imageToPdfInput")?.click();
                    }}
                  >
                    Change Images
                  </button>
                )}
              </div>
            ) : (
              <>
                <span style={{ fontSize: 52 }}>📥</span>
                <p style={s.uploadText}>Click or Drag & Drop your images here</p>
                <p style={s.uploadSub}>Supports {acceptedLabel} · up to 20 images</p>
              </>
            )}
          </div>
          <input
            id="imageToPdfInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            style={{ display: "none" }}
            onChange={handleInputChange}
          />
          {fileError && <p style={s.fileError}>{fileError}</p>}
        </div>

        <div style={s.card}>
          <div style={s.stepBadge}>Step 2 - PDF Layout</div>
          <div style={s.optionGrid}>
            <div style={s.optionBox}>
              <p style={s.optionLabel}>Page Size</p>
              <div style={s.optionRow}>
                {[
                  { id: "a4", label: "A4 PDF" },
                  { id: "original", label: "Original Fit" },
                ].map((item) => (
                  <button
                    key={item.id}
                    style={{
                      ...s.optionBtn,
                      borderColor: pageMode === item.id ? "#f97316" : "#374151",
                      background: pageMode === item.id ? "#f9731618" : "#111827",
                      color: pageMode === item.id ? "#fdba74" : "#cbd5e1",
                    }}
                    onClick={() => setPageMode(item.id)}
                    disabled={done}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={s.optionBox}>
              <p style={s.optionLabel}>Orientation</p>
              <div style={s.optionRow}>
                {[
                  { id: "auto", label: "Auto" },
                  { id: "portrait", label: "Portrait" },
                  { id: "landscape", label: "Landscape" },
                ].map((item) => (
                  <button
                    key={item.id}
                    style={{
                      ...s.optionBtn,
                      borderColor: orientation === item.id ? "#f97316" : "#374151",
                      background: orientation === item.id ? "#f9731618" : "#111827",
                      color: orientation === item.id ? "#fdba74" : "#cbd5e1",
                    }}
                    onClick={() => setOrientation(item.id)}
                    disabled={done}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && <p style={s.error}>{error}</p>}

        {!done && (
          <div style={s.actionRow}>
            <button
              style={{ ...s.btnPrimary, opacity: !files.length ? 0.5 : 1 }}
              onClick={handleConvert}
              disabled={processing || !files.length}
            >
              {processing ? <><span style={s.spinner} /> Generating PDF...</> : "Generate Preview"}
            </button>
          </div>
        )}

        {done && result && (
          <div style={s.resultCard}>
            <PdfPreviewCard count={result.pageCount} pageMode={result.pageMode} orientation={result.orientation} />

            <div style={s.statsRow}>
              <div style={s.statBox}>
                <span style={{ fontSize: 36 }}>🖼️</span>
                <span style={s.statNum}>{result.originalCount}</span>
                <span style={s.statLbl}>Images</span>
              </div>
              <div style={s.arrowCol}>
                <span style={{ fontSize: 28, color: "#374151" }}>→</span>
                <span style={s.reductionPill}>PDF</span>
              </div>
              <div style={s.statBox}>
                <span style={{ fontSize: 36 }}>✅</span>
                <span style={{ ...s.statNum, color: "#86efac" }}>{result.pdfKB} KB</span>
                <span style={s.statLbl}>{result.pageCount} pages</span>
              </div>
            </div>

            <div style={s.msgSuccess}>
              Preview ready. Final PDF will download watermark-free after credit deduction.
            </div>

            <div style={s.engineNote}>
              Conversion engine: <b>FormFixer Image to PDF</b>. Images are auto-arranged into a clean PDF without using third-party website editors.
            </div>

            <div style={s.resultActions}>
              <button onClick={handleDownload} style={s.btnPrimary} disabled={downloading}>
                {downloading
                  ? "Unlocking Download..."
                  : downloadUnlocked
                    ? "Download Again"
                    : "Download Final PDF (2 Credits)"}
              </button>
              <button onClick={handleReset} style={s.btnSecondary}>Convert More Images</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 48 },
  guestBar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 28px 0", color: "#94a3b8", fontSize: 13, flexWrap: "wrap" },
  guestLoginBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 999, padding: "10px 16px", fontWeight: 700, cursor: "pointer" },
  toolHeader: { display: "flex", alignItems: "center", gap: 16, padding: "20px 28px 0" },
  backBtn: { background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0 },
  toolIcon: { width: 56, height: 56, borderRadius: 14, background: "#f9731618", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 },
  toolTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 20, margin: 0 },
  toolDesc: { color: "#64748b", fontSize: 13, marginTop: 4 },
  card: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, margin: "16px 28px 0", padding: "20px 20px 24px" },
  stepBadge: { display: "inline-block", background: "#f97316", color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: 11, fontWeight: 800, marginBottom: 14 },
  uploadZone: { border: "2px dashed", borderRadius: 14, minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#111827", transition: "border-color 0.2s", padding: 24, gap: 8 },
  filePreview: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  fileName: { color: "#f1f5f9", fontWeight: 600, fontSize: 15, margin: 0, textAlign: "center", maxWidth: 340, wordBreak: "break-all" },
  fileMeta: { color: "#64748b", fontSize: 13, margin: 0 },
  changeBtn: { background: "#1e293b", border: "1px solid #374151", color: "#94a3b8", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, marginTop: 6 },
  uploadText: { color: "#94a3b8", fontWeight: 600, fontSize: 15, margin: 0 },
  uploadSub: { color: "#475569", fontSize: 12, margin: 0 },
  fileError: { color: "#ef4444", fontSize: 13, marginTop: 10 },
  optionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 },
  optionBox: { background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 14 },
  optionLabel: { color: "#cbd5e1", fontSize: 12, fontWeight: 700, margin: "0 0 10px" },
  optionRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  optionBtn: { border: "1px solid", borderRadius: 999, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  error: { color: "#ef4444", padding: "8px 28px", fontSize: 14 },
  actionRow: { padding: "16px 28px 0" },
  btnPrimary: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" },
  btnSecondary: { background: "#1e293b", color: "#94a3b8", border: "1px solid #374151", borderRadius: 12, padding: "12px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  spinner: { display: "inline-block", width: 15, height: 15, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  resultCard: { margin: "16px 28px 0", background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, padding: 28 },
  previewCard: { marginBottom: 24, display: "flex", justifyContent: "center" },
  previewDoc: { position: "relative", width: "100%", maxWidth: 420, minHeight: 200, borderRadius: 16, overflow: "hidden", border: "1px solid #334155", background: "linear-gradient(180deg, #f8fafc, #e2e8f0)", color: "#0f172a", padding: 22, boxSizing: "border-box" },
  previewDocTop: { display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 },
  previewDocTitle: { fontWeight: 800, fontSize: 16 },
  previewDocMeta: { fontSize: 12, color: "#475569", marginTop: 4, wordBreak: "break-word" },
  previewDocBody: { marginTop: 28, display: "grid", gap: 8, fontSize: 14, fontWeight: 600, color: "#1e293b", position: "relative", zIndex: 1 },
  previewWatermarkLayer: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", alignContent: "space-evenly", justifyItems: "center", padding: 12, background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(148,163,184,0.12))", pointerEvents: "none" },
  previewWatermarkText: { color: "rgba(15,23,42,0.15)", fontWeight: 900, fontSize: 15, letterSpacing: 2, transform: "rotate(-24deg)" },
  statsRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 24, flexWrap: "wrap" },
  statBox: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  statNum: { fontSize: 28, fontWeight: 900, color: "#f1f5f9" },
  statLbl: { color: "#64748b", fontSize: 13 },
  arrowCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  reductionPill: { borderRadius: 8, padding: "4px 14px", fontSize: 14, fontWeight: 800, background: "#052e16", color: "#86efac", border: "1px solid #14532d" },
  msgSuccess: { background: "#052e16", border: "1px solid #14532d", borderRadius: 12, padding: "14px 18px", color: "#86efac", fontSize: 14, marginBottom: 20, lineHeight: 1.6 },
  engineNote: { color: "#cbd5e1", fontSize: 12, lineHeight: 1.6, marginBottom: 18 },
  resultActions: { display: "flex", gap: 12, flexWrap: "wrap" },
};
