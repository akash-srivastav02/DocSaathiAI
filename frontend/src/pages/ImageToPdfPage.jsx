import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import AuthModal from "../components/AuthModal";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import useIsMobile from "../hooks/useIsMobile";

function PreviewCard({ count, pageMode, orientation }) {
  return (
    <div style={s.previewCard}>
      <div style={s.previewDoc}>
        <div style={s.previewTop}>
          <span style={s.previewIcon}>PDF</span>
          <div>
            <div style={s.previewTitle}>Image to PDF Preview</div>
            <div style={s.previewMeta}>
              {count} image{count === 1 ? "" : "s"} · {pageMode === "a4" ? "A4 pages" : "Original-fit"} · {orientation}
            </div>
          </div>
        </div>
        <div style={s.previewBody}>Final PDF will be watermark-free. One plan use is counted only at final export.</div>
      </div>
    </div>
  );
}

function dataUrlToBlob(dataUrl) {
  const [header, body] = dataUrl.split(",");
  if (!header || !body) throw new Error("Invalid file data.");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || "application/octet-stream";
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

async function downloadFileFromUrl(fileUrl, fileName) {
  const blob = fileUrl.startsWith("data:")
    ? dataUrlToBlob(fileUrl)
    : await fetch(fileUrl).then((response) => {
        if (!response.ok) throw new Error("Could not fetch file.");
        return response.blob();
      });

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

export default function ImageToPdfPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
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
    if (source) document.title = `${source.toUpperCase()} to PDF | FormFixer`;
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
      setFileError("Only JPG, PNG, WEBP, HEIC and HEIF images are allowed.");
      setFiles([]);
      return;
    }
    setFiles(picked.slice(0, 20));
  };

  const handleConvert = async () => {
    setError("");
    if (!files.length) return setError("Please upload one or more images first.");
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
      await downloadFileFromUrl(result.url, "formfixer_images_to_pdf.pdf");
    } catch (err) {
      if (err.response?.data?.message) return setError(err.response.data.message);
      window.open(result.url, "_blank");
    } finally {
      setDownloading(false);
    }
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
      {user && <Sidebar credits={currentCredits} planLabel={user?.planLabel} isUnlimited={user?.isUnlimited} onLogout={() => { logout(); navigate("/"); }} />}
      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : (
          <div style={{ ...s.guestBar, ...(isMobile ? s.guestBarMobile : null) }}>
            <span>Preview in guest mode. Login only when you need the final PDF download.</span>
            <button style={s.guestLoginBtn} onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          </div>
        )}

        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : null), ...(user && isMobile ? s.contentWithFixedTopbar : null) }}>
          <div style={s.toolHeader}>
            <button style={s.backBtn} onClick={() => navigate(user ? "/dashboard" : "/all-tools")}>Back</button>
            <div>
              <h1 style={s.toolTitle}>Images to PDF Converter</h1>
              <p style={s.toolDesc}>Combine multiple images into one clean PDF with page size and orientation controls.</p>
            </div>
          </div>

          <div style={{ ...s.workspace, ...(isMobile ? s.workspaceMobile : null) }}>
            <div style={s.uploadPanel}>
              <div style={s.panelLabel}>Upload Images</div>
              <div
                style={{
                  ...s.uploadZone,
                  ...(isMobile ? s.uploadZoneMobile : null),
                  borderColor: fileError ? "#ef4444" : files.length ? "#f97316" : "var(--ff-border)",
                  opacity: done ? 0.5 : 1,
                  pointerEvents: done ? "none" : "auto",
                }}
                onClick={() => !done && document.getElementById("imageToPdfInput")?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {files.length ? (
                  <div style={s.filePreview}>
                    <div style={s.bigIcon}>IMG</div>
                    <p style={s.fileName}>{files.length} image{files.length === 1 ? "" : "s"} selected</p>
                    <p style={s.fileMeta}>{totalSizeMB} MB total · {acceptedLabel}</p>
                  </div>
                ) : (
                  <>
                    <div style={s.bigIcon}>UP</div>
                    <p style={s.uploadText}>Upload / Drop Image Files</p>
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
                onChange={(e) => handleFiles(e.target.files)}
              />
              {fileError && <p style={s.fileError}>{fileError}</p>}
            </div>

            <div style={s.configPanel}>
              <div style={s.panelLabel}>Configuration</div>
              <div style={s.configCard}>
                <div style={s.configTitle}>Page Mode</div>
                <div style={s.optionList}>
                  {[
                    { id: "a4", label: "A4 PDF", desc: "Uniform printable pages" },
                    { id: "original", label: "Original Fit", desc: "Keep image fit more natural" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      style={{
                        ...s.optionBtn,
                        borderColor: pageMode === item.id ? "#f97316" : "var(--ff-border)",
                        background: pageMode === item.id ? "color-mix(in srgb, var(--ff-orange) 10%, transparent)" : "var(--ff-panel)",
                      }}
                      onClick={() => setPageMode(item.id)}
                    >
                      <span style={{ ...s.optionIcon, color: pageMode === item.id ? "#f97316" : "var(--ff-text-faint)" }}>PG</span>
                      <div>
                        <div style={s.optionTitle}>{item.label}</div>
                        <div style={s.optionDesc}>{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.configCard}>
                <div style={s.configTitle}>Orientation</div>
                <div style={s.optionList}>
                  {[
                    { id: "auto", label: "Auto", desc: "Pick best orientation automatically" },
                    { id: "portrait", label: "Portrait", desc: "Force vertical pages" },
                    { id: "landscape", label: "Landscape", desc: "Force horizontal pages" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      style={{
                        ...s.optionBtn,
                        borderColor: orientation === item.id ? "#f97316" : "var(--ff-border)",
                        background: orientation === item.id ? "color-mix(in srgb, var(--ff-orange) 10%, transparent)" : "var(--ff-panel)",
                      }}
                      onClick={() => setOrientation(item.id)}
                    >
                      <span style={{ ...s.optionIcon, color: orientation === item.id ? "#f97316" : "var(--ff-text-faint)" }}>OR</span>
                      <div>
                        <div style={s.optionTitle}>{item.label}</div>
                        <div style={s.optionDesc}>{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {!done && (
                <button
                  style={{ ...s.btnPrimary, opacity: !files.length ? 0.55 : 1 }}
                  onClick={handleConvert}
                  disabled={processing || !files.length}
                >
                  {processing ? "Generating PDF..." : "Generate Preview"}
                </button>
              )}
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}

          {done && result && (
            <div style={s.resultCard}>
              <PreviewCard count={result.pageCount} pageMode={result.pageMode} orientation={result.orientation} />
              <div style={s.statsRow}>
                <div style={s.statBox}>
                  <div style={s.statValue}>{result.originalCount}</div>
                  <div style={s.statLabel}>Images</div>
                </div>
                <div style={s.statBox}>
                  <div style={s.statValue}>{result.pageCount}</div>
                  <div style={s.statLabel}>Pages</div>
                </div>
                <div style={s.statBox}>
                  <div style={{ ...s.statValue, color: "#22c55e" }}>{result.pdfKB} KB</div>
                  <div style={s.statLabel}>PDF size</div>
                </div>
              </div>
              <p style={s.resultMessage}>Preview ready. Final PDF will download watermark-free after one plan use.</p>
              <div style={s.resultActions}>
                <button
                  style={s.btnPrimary}
                  onClick={async () => {
                    if (!user) return setShowAuthModal(true);
                    await handleDownloadAfterAuth();
                  }}
                  disabled={downloading}
                >
                  {downloading ? "Unlocking Download..." : downloadUnlocked ? "Download Again" : "Download Final PDF (1 Use)"}
                </button>
                <button style={s.btnSecondary} onClick={handleReset}>Convert More Images</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "transparent", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 56 },
  guestBar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 28px 0", color: "var(--ff-text-soft)", fontSize: 13, flexWrap: "wrap" },
  guestBarMobile: { padding: "84px 14px 0", gap: 10 },
  guestLoginBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 999, padding: "10px 16px", fontWeight: 700, cursor: "pointer" },
  content: { maxWidth: 1180, margin: "0 auto", padding: "18px 28px 0" },
  contentMobile: { padding: "16px 14px 0" },
  contentWithFixedTopbar: { paddingTop: 92 },
  toolHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" },
  backBtn: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", color: "var(--ff-text-soft)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 },
  toolTitle: { color: "var(--ff-text)", fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.08 },
  toolDesc: { color: "var(--ff-text-soft)", fontSize: 14, margin: "6px 0 0", lineHeight: 1.6 },
  workspace: { display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(300px, 0.8fr)", gap: 20, alignItems: "start" },
  workspaceMobile: { gridTemplateColumns: "1fr", gap: 16 },
  uploadPanel: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 18 },
  configPanel: { display: "grid", gap: 14 },
  panelLabel: { color: "var(--ff-text-faint)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  uploadZone: { minHeight: 360, border: "2px dashed", borderRadius: 16, background: "var(--ff-panel)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, cursor: "pointer" },
  uploadZoneMobile: { minHeight: 240, padding: 18 },
  filePreview: { display: "grid", justifyItems: "center", gap: 8 },
  bigIcon: { width: 88, height: 88, borderRadius: "50%", background: "color-mix(in srgb, var(--ff-blue) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--ff-blue) 24%, transparent)", color: "var(--ff-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900 },
  fileName: { color: "var(--ff-text)", fontSize: 16, fontWeight: 800, margin: 0, textAlign: "center", wordBreak: "break-word" },
  fileMeta: { color: "var(--ff-text-soft)", fontSize: 13, margin: 0 },
  uploadText: { color: "var(--ff-text)", fontWeight: 800, fontSize: 18, margin: "10px 0 0" },
  uploadSub: { color: "var(--ff-text-soft)", fontSize: 13, margin: "6px 0 0" },
  fileError: { color: "#ef4444", fontSize: 13, margin: "10px 0 0" },
  configCard: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 18 },
  configTitle: { color: "var(--ff-text)", fontSize: 17, fontWeight: 900, marginBottom: 12 },
  optionList: { display: "grid", gap: 10 },
  optionBtn: { border: "1px solid", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" },
  optionIcon: { minWidth: 34, fontSize: 12, fontWeight: 900 },
  optionTitle: { color: "var(--ff-text)", fontSize: 14, fontWeight: 800 },
  optionDesc: { color: "var(--ff-text-soft)", fontSize: 12, marginTop: 3 },
  btnPrimary: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 18px", fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" },
  btnSecondary: { background: "var(--ff-panel)", color: "var(--ff-text-soft)", border: "1px solid var(--ff-border)", borderRadius: 14, padding: "14px 18px", fontWeight: 800, fontSize: 14, cursor: "pointer" },
  error: { color: "#ef4444", fontSize: 14, margin: "14px 0 0" },
  resultCard: { marginTop: 18, background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 24 },
  previewCard: { marginBottom: 20, display: "flex", justifyContent: "center" },
  previewDoc: { width: "100%", maxWidth: 520, borderRadius: 18, border: "1px solid #cbd5e1", background: "linear-gradient(180deg,#ffffff,#eef2ff)", color: "#162033", padding: 22 },
  previewTop: { display: "flex", alignItems: "center", gap: 12 },
  previewIcon: { width: 48, height: 48, borderRadius: 14, background: "#dbeafe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 },
  previewTitle: { fontSize: 16, fontWeight: 900 },
  previewMeta: { fontSize: 12, color: "#5d6b7f", marginTop: 4 },
  previewBody: { marginTop: 18, fontSize: 14, lineHeight: 1.7, color: "#334155" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginBottom: 18 },
  statBox: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 14, padding: 16, textAlign: "center" },
  statValue: { color: "var(--ff-text)", fontSize: 26, fontWeight: 900 },
  statLabel: { color: "var(--ff-text-soft)", fontSize: 12, marginTop: 4 },
  resultMessage: { color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.7, margin: "0 0 18px" },
  resultActions: { display: "flex", gap: 12, flexWrap: "wrap" },
};
