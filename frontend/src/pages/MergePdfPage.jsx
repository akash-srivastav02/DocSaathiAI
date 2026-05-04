import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import AuthModal from "../components/AuthModal";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import useIsMobile from "../hooks/useIsMobile";

function dataUrlToBlob(dataUrl) {
  const [header, body] = dataUrl.split(",");
  if (!header || !body) throw new Error("Invalid file data.");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || "application/octet-stream";
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
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

function PreviewCard({ fileCount, pageCount }) {
  return (
    <div style={s.previewCard}>
      <div style={s.previewDoc}>
        <div style={s.previewTop}>
          <span style={s.previewIcon}>PDF</span>
          <div>
            <div style={s.previewTitle}>Merge PDF Preview</div>
            <div style={s.previewMeta}>
              {fileCount} PDF{fileCount === 1 ? "" : "s"} · {pageCount} total page{pageCount === 1 ? "" : "s"}
            </div>
          </div>
        </div>
        <div style={s.previewBody}>Final merged PDF will be watermark-free. One plan use is counted only at final export.</div>
      </div>
    </div>
  );
}

export default function MergePdfPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = user ? (credits ?? user?.credits ?? 0) : 0;

  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const totalSizeMB = useMemo(
    () => (files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2),
    [files]
  );

  const handleFiles = (incomingFiles) => {
    setFileError("");
    setResult(null);
    setDone(false);
    setError("");
    setDownloadUnlocked(false);
    const picked = Array.from(incomingFiles || []);
    if (!picked.length) return;
    const invalid = picked.find((file) => file.type !== "application/pdf");
    if (invalid) {
      setFileError("Only PDF files are allowed.");
      return;
    }
    const nextFiles = [...files, ...picked].slice(0, 20);
    setFiles(nextFiles);
  };

  const moveFile = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= files.length) return;
    const next = [...files];
    [next[index], next[target]] = [next[target], next[index]];
    setFiles(next);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
    setDone(false);
    setDownloadUnlocked(false);
  };

  const handleMerge = async () => {
    setError("");
    if (files.length < 2) return setError("Please upload at least two PDF files.");
    setProcessing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("pdfs", file));
      const { data } = await API.post("/pdf/merge", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setDone(true);
      setDownloadUnlocked(false);
    } catch (err) {
      setError(err.response?.data?.message || "PDF merge failed.");
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
          toolType: "mergepdf",
          examName: `Merge PDF (${files.length} files)`,
          processedUrl: result.url,
        });
        if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);
        setDownloadUnlocked(true);
      }
      await downloadFileFromUrl(result.url, "formfixer_merged_pdf.pdf");
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

  return (
    <div style={s.root}>
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={async () => {
            setShowAuthModal(false);
            await handleDownloadAfterAuth();
          }}
          title="Login to Download Merged PDF"
          subtitle="Preview is available in guest mode. Final merged PDF download needs quick login."
        />
      )}
      {user && <Sidebar credits={currentCredits} planLabel={user?.planLabel} isUnlimited={user?.isUnlimited} onLogout={() => { logout(); navigate("/"); }} />}
      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : (
          <div style={{ ...s.guestBar, ...(isMobile ? s.guestBarMobile : null) }}>
            <span>Preview in guest mode. Login only when you need the final merged PDF.</span>
            <button style={s.guestLoginBtn} onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          </div>
        )}

        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : null), ...(user ? s.contentWithFixedTopbar : null) }}>
          <div style={s.toolHeader}>
            <button style={s.backBtn} onClick={() => navigate(user ? "/dashboard" : "/all-tools")}>Back</button>
            <div>
              <h1 style={s.toolTitle}>Merge PDF</h1>
              <p style={s.toolDesc}>Combine multiple PDF files into one clean final PDF with custom file order.</p>
            </div>
          </div>

          <div style={{ ...s.workspace, ...(isMobile ? s.workspaceMobile : null) }}>
            <div style={s.uploadPanel}>
              <div style={s.panelLabel}>Upload PDFs</div>
              <div
                style={{
                  ...s.uploadZone,
                  ...(isMobile ? s.uploadZoneMobile : null),
                  borderColor: fileError ? "#ef4444" : files.length ? "#3b82f6" : "var(--ff-border)",
                  opacity: done ? 0.5 : 1,
                  pointerEvents: done ? "none" : "auto",
                }}
                onClick={() => !done && document.getElementById("mergePdfInput")?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {files.length ? (
                  <div style={s.filePreview}>
                    <div style={s.bigIcon}>PDF</div>
                    <p style={s.fileName}>{files.length} PDF{files.length === 1 ? "" : "s"} selected</p>
                    <p style={s.fileMeta}>{totalSizeMB} MB total · Drag or browse more to add</p>
                  </div>
                ) : (
                  <>
                    <div style={s.bigIcon}>UP</div>
                    <p style={s.uploadText}>Upload / Drop PDF Files</p>
                    <p style={s.uploadSub}>Supports PDF · up to 20 files</p>
                  </>
                )}
              </div>
              <input
                id="mergePdfInput"
                type="file"
                accept="application/pdf"
                multiple
                style={{ display: "none" }}
                onChange={(e) => handleFiles(e.target.files)}
              />
              {fileError && <p style={s.fileError}>{fileError}</p>}

              {files.length > 0 && (
                <div style={s.fileList}>
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} style={s.fileRow}>
                      <div style={s.fileRowMeta}>
                        <strong style={s.fileRowName}>{index + 1}. {file.name}</strong>
                        <span style={s.fileRowSize}>{Math.round(file.size / 1024)} KB</span>
                      </div>
                      <div style={s.fileRowActions}>
                        <button type="button" style={s.smallAction} onClick={() => moveFile(index, -1)} disabled={index === 0}>Up</button>
                        <button type="button" style={s.smallAction} onClick={() => moveFile(index, 1)} disabled={index === files.length - 1}>Down</button>
                        <button type="button" style={{ ...s.smallAction, color: "#f87171" }} onClick={() => removeFile(index)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={s.configPanel}>
              <div style={s.panelLabel}>Configuration</div>
              <div style={s.configCard}>
                <div style={s.configTitle}>Merge Rules</div>
                <ul style={s.guideList}>
                  <li>Files merge in the same order shown in the list.</li>
                  <li>Use Up and Down to arrange pages before preview.</li>
                  <li>Best for forms, marksheets, certificates, and combined uploads.</li>
                </ul>
              </div>

              <div style={s.configCard}>
                <div style={s.configTitle}>Final Output</div>
                <div style={s.resultPills}>
                  <span style={s.resultPill}>Input: PDF</span>
                  <span style={s.resultPill}>Output: Single PDF</span>
                  <span style={s.resultPill}>Order preserved</span>
                </div>
              </div>

              {!done && (
                <button
                  style={{ ...s.btnPrimary, opacity: files.length < 2 ? 0.55 : 1 }}
                  onClick={handleMerge}
                  disabled={processing || files.length < 2}
                >
                  {processing ? "Merging PDFs..." : "Generate Preview"}
                </button>
              )}
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}

          {done && result && (
            <div style={s.resultCard}>
              <PreviewCard fileCount={result.originalCount} pageCount={result.pageCount} />
              <div style={s.statsRow}>
                <div style={s.statBox}>
                  <div style={s.statValue}>{result.originalCount}</div>
                  <div style={s.statLabel}>Files</div>
                </div>
                <div style={s.statBox}>
                  <div style={s.statValue}>{result.pageCount}</div>
                  <div style={s.statLabel}>Pages</div>
                </div>
                <div style={s.statBox}>
                  <div style={{ ...s.statValue, color: "#22c55e" }}>{result.pdfKB} KB</div>
                  <div style={s.statLabel}>Merged size</div>
                </div>
              </div>
              <p style={s.resultMessage}>Preview ready. Final merged PDF will download watermark-free after one plan use.</p>
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
                <button style={s.btnSecondary} onClick={handleReset}>Merge More PDFs</button>
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
  contentWithFixedTopbar: { paddingTop: 104 },
  toolHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" },
  backBtn: { border: "1px solid var(--ff-border)", background: "var(--ff-panel)", color: "var(--ff-text)", borderRadius: 12, padding: "10px 14px", fontWeight: 700, cursor: "pointer" },
  toolTitle: { fontSize: 38, lineHeight: 1.05, margin: 0, color: "var(--ff-text)", fontWeight: 900 },
  toolDesc: { margin: "8px 0 0", color: "var(--ff-text-soft)", fontSize: 15, lineHeight: 1.7 },
  workspace: { display: "grid", gridTemplateColumns: "minmax(0, 1.08fr) minmax(320px, 0.92fr)", gap: 20, alignItems: "start" },
  workspaceMobile: { display: "flex", flexDirection: "column", gap: 16 },
  uploadPanel: { background: "var(--ff-panel-strong)", border: "1px solid var(--ff-border)", borderRadius: 22, padding: 18 },
  configPanel: { display: "flex", flexDirection: "column", gap: 14 },
  panelLabel: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ff-text-faint)", fontWeight: 700, marginBottom: 12 },
  uploadZone: { minHeight: 248, borderRadius: 22, border: "2px dashed var(--ff-border)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24, background: "color-mix(in srgb, var(--ff-panel) 92%, transparent)", cursor: "pointer", transition: "all 0.2s ease" },
  uploadZoneMobile: { minHeight: 220, padding: 18 },
  bigIcon: { width: 72, height: 72, borderRadius: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, color: "#3b82f6", border: "1px solid #3b82f644", background: "#3b82f61a", marginBottom: 14 },
  uploadText: { color: "var(--ff-text)", fontWeight: 800, fontSize: 18, margin: "0 0 8px" },
  uploadSub: { color: "var(--ff-text-soft)", fontSize: 14, margin: 0 },
  filePreview: { display: "flex", flexDirection: "column", alignItems: "center" },
  fileName: { color: "var(--ff-text)", fontWeight: 800, fontSize: 18, margin: "0 0 6px" },
  fileMeta: { color: "var(--ff-text-soft)", fontSize: 14, margin: 0 },
  fileError: { color: "#fca5a5", fontSize: 13, margin: "10px 0 0" },
  fileList: { marginTop: 14, display: "flex", flexDirection: "column", gap: 10 },
  fileRow: { border: "1px solid var(--ff-border)", background: "var(--ff-panel)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  fileRowMeta: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  fileRowName: { color: "var(--ff-text)", fontSize: 14, lineHeight: 1.4, wordBreak: "break-word" },
  fileRowSize: { color: "var(--ff-text-faint)", fontSize: 12 },
  fileRowActions: { display: "flex", gap: 8, flexWrap: "wrap" },
  smallAction: { border: "1px solid var(--ff-border)", background: "transparent", color: "var(--ff-text-soft)", borderRadius: 10, padding: "6px 10px", fontWeight: 700, cursor: "pointer" },
  configCard: { background: "var(--ff-panel-strong)", border: "1px solid var(--ff-border)", borderRadius: 20, padding: 18 },
  configTitle: { fontSize: 16, fontWeight: 800, color: "var(--ff-text)", marginBottom: 12 },
  guideList: { margin: 0, paddingLeft: 18, color: "var(--ff-text-soft)", display: "grid", gap: 10, lineHeight: 1.65 },
  resultPills: { display: "flex", flexWrap: "wrap", gap: 10 },
  resultPill: { borderRadius: 999, border: "1px solid var(--ff-border)", background: "var(--ff-panel)", color: "var(--ff-text-soft)", padding: "8px 12px", fontSize: 13, fontWeight: 700 },
  btnPrimary: { width: "100%", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 16, padding: "14px 18px", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 16px 32px rgba(249, 115, 22, 0.24)" },
  btnSecondary: { border: "1px solid var(--ff-border)", background: "var(--ff-panel)", color: "var(--ff-text)", borderRadius: 14, padding: "12px 18px", fontWeight: 700, cursor: "pointer" },
  error: { marginTop: 14, color: "#fca5a5", background: "rgba(127,29,29,0.18)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: "12px 14px", fontSize: 14 },
  resultCard: { marginTop: 20, background: "var(--ff-panel-strong)", border: "1px solid var(--ff-border)", borderRadius: 24, padding: 22 },
  previewCard: { borderRadius: 22, background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.16))", border: "1px solid rgba(99,102,241,0.26)", padding: 18 },
  previewDoc: { display: "flex", flexDirection: "column", gap: 14 },
  previewTop: { display: "flex", alignItems: "center", gap: 14 },
  previewIcon: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 900, letterSpacing: "0.08em" },
  previewTitle: { color: "#fff", fontSize: 18, fontWeight: 900 },
  previewMeta: { color: "rgba(255,255,255,0.76)", fontSize: 14, marginTop: 3 },
  previewBody: { color: "rgba(255,255,255,0.84)", fontSize: 14, lineHeight: 1.7 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginTop: 18 },
  statBox: { borderRadius: 18, background: "var(--ff-panel)", border: "1px solid var(--ff-border)", padding: "16px 18px" },
  statValue: { fontSize: 28, fontWeight: 900, color: "var(--ff-text)" },
  statLabel: { color: "var(--ff-text-faint)", fontSize: 13, marginTop: 6 },
  resultMessage: { margin: "16px 0 0", color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.7 },
  resultActions: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 },
};
