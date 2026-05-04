import { useState } from "react";
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

function PreviewCard({ originalPages, extractedPages, selectedPages }) {
  return (
    <div style={s.previewCard}>
      <div style={s.previewDoc}>
        <div style={s.previewTop}>
          <span style={s.previewIcon}>PDF</span>
          <div>
            <div style={s.previewTitle}>Split PDF Preview</div>
            <div style={s.previewMeta}>
              {originalPages} total pages · {extractedPages} extracted
            </div>
          </div>
        </div>
        <div style={s.previewBody}>
          Selected pages: {selectedPages.join(", ")}
        </div>
      </div>
    </div>
  );
}

export default function SplitPdfPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = user ? (credits ?? user?.credits ?? 0) : 0;

  const [file, setFile] = useState(null);
  const [pageSelection, setPageSelection] = useState("");
  const [fileError, setFileError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleFile = (pickedFile) => {
    setFileError("");
    setResult(null);
    setDone(false);
    setError("");
    setDownloadUnlocked(false);
    if (!pickedFile) return;
    if (pickedFile.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      return;
    }
    setFile(pickedFile);
  };

  const handleSplit = async () => {
    setError("");
    if (!file) return setError("Please upload one PDF file.");
    if (!pageSelection.trim()) return setError("Enter page numbers or ranges like 1,3,5-7.");
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("pageSelection", pageSelection.trim());
      const { data } = await API.post("/pdf/split", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setDone(true);
      setDownloadUnlocked(false);
    } catch (err) {
      setError(err.response?.data?.message || "PDF split failed.");
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
          toolType: "splitpdf",
          examName: `Split PDF (${pageSelection.trim()})`,
          processedUrl: result.url,
        });
        if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);
        setDownloadUnlocked(true);
      }
      await downloadFileFromUrl(result.url, "formfixer_split_pdf.pdf");
    } catch (err) {
      if (err.response?.data?.message) return setError(err.response.data.message);
      window.open(result.url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageSelection("");
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
          title="Login to Download Split PDF"
          subtitle="Preview is available in guest mode. Final split PDF download needs quick login."
        />
      )}
      {user && <Sidebar credits={currentCredits} planLabel={user?.planLabel} isUnlimited={user?.isUnlimited} onLogout={() => { logout(); navigate("/"); }} />}
      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : (
          <div style={{ ...s.guestBar, ...(isMobile ? s.guestBarMobile : null) }}>
            <span>Preview in guest mode. Login only when you need the final extracted PDF.</span>
            <button style={s.guestLoginBtn} onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          </div>
        )}

        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : null), ...(user ? s.contentWithFixedTopbar : null) }}>
          <div style={s.toolHeader}>
            <button style={s.backBtn} onClick={() => navigate(user ? "/dashboard" : "/all-tools")}>Back</button>
            <div>
              <h1 style={s.toolTitle}>Split PDF</h1>
              <p style={s.toolDesc}>Extract exact pages from one PDF using numbers or ranges like 1,3,5-7.</p>
            </div>
          </div>

          <div style={{ ...s.workspace, ...(isMobile ? s.workspaceMobile : null) }}>
            <div style={s.uploadPanel}>
              <div style={s.panelLabel}>Upload PDF</div>
              <div
                style={{
                  ...s.uploadZone,
                  ...(isMobile ? s.uploadZoneMobile : null),
                  borderColor: fileError ? "#ef4444" : file ? "#3b82f6" : "var(--ff-border)",
                  opacity: done ? 0.5 : 1,
                  pointerEvents: done ? "none" : "auto",
                }}
                onClick={() => !done && document.getElementById("splitPdfInput")?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {file ? (
                  <div style={s.filePreview}>
                    <div style={s.bigIcon}>PDF</div>
                    <p style={s.fileName}>{file.name}</p>
                    <p style={s.fileMeta}>{Math.round(file.size / 1024)} KB · Ready for page extraction</p>
                  </div>
                ) : (
                  <>
                    <div style={s.bigIcon}>UP</div>
                    <p style={s.uploadText}>Upload / Drop PDF File</p>
                    <p style={s.uploadSub}>Supports one PDF at a time</p>
                  </>
                )}
              </div>
              <input
                id="splitPdfInput"
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {fileError && <p style={s.fileError}>{fileError}</p>}
            </div>

            <div style={s.configPanel}>
              <div style={s.panelLabel}>Configuration</div>
              <div style={s.configCard}>
                <div style={s.configTitle}>Page Selection</div>
                <input
                  value={pageSelection}
                  onChange={(e) => setPageSelection(e.target.value)}
                  placeholder="Example: 1,3,5-7"
                  style={s.textInput}
                />
                <ul style={s.guideList}>
                  <li>Use commas for separate pages: 1,4,9</li>
                  <li>Use dash for ranges: 2-5</li>
                  <li>You can combine both: 1,3,5-7</li>
                </ul>
              </div>

              <div style={s.configCard}>
                <div style={s.configTitle}>Final Output</div>
                <div style={s.resultPills}>
                  <span style={s.resultPill}>Input: 1 PDF</span>
                  <span style={s.resultPill}>Output: Extracted PDF</span>
                  <span style={s.resultPill}>Page order preserved</span>
                </div>
              </div>

              {!done && (
                <button
                  style={{ ...s.btnPrimary, opacity: file && pageSelection.trim() ? 1 : 0.55 }}
                  onClick={handleSplit}
                  disabled={processing || !file || !pageSelection.trim()}
                >
                  {processing ? "Extracting Pages..." : "Generate Preview"}
                </button>
              )}
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}

          {done && result && (
            <div style={s.resultCard}>
              <PreviewCard
                originalPages={result.originalPages}
                extractedPages={result.extractedPages}
                selectedPages={result.selectedPages}
              />
              <div style={s.statsRow}>
                <div style={s.statBox}>
                  <div style={s.statValue}>{result.originalPages}</div>
                  <div style={s.statLabel}>Original pages</div>
                </div>
                <div style={s.statBox}>
                  <div style={s.statValue}>{result.extractedPages}</div>
                  <div style={s.statLabel}>Extracted pages</div>
                </div>
                <div style={s.statBox}>
                  <div style={{ ...s.statValue, color: "#22c55e" }}>{result.pdfKB} KB</div>
                  <div style={s.statLabel}>Final size</div>
                </div>
              </div>
              <p style={s.resultMessage}>Preview ready. Final extracted PDF will download watermark-free after one plan use.</p>
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
                <button style={s.btnSecondary} onClick={handleReset}>Split Another PDF</button>
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
  fileName: { color: "var(--ff-text)", fontWeight: 800, fontSize: 18, margin: "0 0 6px", wordBreak: "break-word", textAlign: "center" },
  fileMeta: { color: "var(--ff-text-soft)", fontSize: 14, margin: 0 },
  fileError: { color: "#fca5a5", fontSize: 13, margin: "10px 0 0" },
  configCard: { borderRadius: 18, border: "1px solid var(--ff-border)", background: "var(--ff-panel-strong)", padding: 16, display: "grid", gap: 12 },
  configTitle: { color: "var(--ff-text)", fontSize: 16, fontWeight: 800 },
  textInput: { width: "100%", borderRadius: 14, border: "1px solid var(--ff-border)", background: "var(--ff-panel)", color: "var(--ff-text)", padding: "12px 14px", fontSize: 15, outline: "none" },
  guideList: { margin: 0, paddingLeft: 18, color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.8, display: "grid", gap: 4 },
  resultPills: { display: "flex", gap: 8, flexWrap: "wrap" },
  resultPill: { borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 700, color: "#93c5fd", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.18)" },
  btnPrimary: { width: "100%", border: "none", borderRadius: 16, padding: "14px 18px", background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" },
  btnSecondary: { border: "1px solid var(--ff-border)", borderRadius: 16, padding: "14px 18px", background: "transparent", color: "var(--ff-text)", fontSize: 15, fontWeight: 800, cursor: "pointer" },
  error: { marginTop: 16, color: "#fca5a5", background: "rgba(127,29,29,0.18)", border: "1px solid rgba(248,113,113,0.36)", borderRadius: 16, padding: "14px 16px" },
  resultCard: { marginTop: 18, borderRadius: 24, border: "1px solid var(--ff-border)", background: "var(--ff-panel-strong)", padding: 18, display: "grid", gap: 16 },
  previewCard: { borderRadius: 20, border: "1px solid var(--ff-border)", background: "var(--ff-panel)", padding: 16 },
  previewDoc: { display: "grid", gap: 12 },
  previewTop: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  previewIcon: { width: 44, height: 44, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#2563eb", background: "#dbeafe", border: "1px solid #93c5fd" },
  previewTitle: { color: "var(--ff-text)", fontSize: 18, fontWeight: 800 },
  previewMeta: { color: "var(--ff-text-soft)", fontSize: 13 },
  previewBody: { color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.7 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 },
  statBox: { borderRadius: 18, border: "1px solid var(--ff-border)", background: "var(--ff-panel)", padding: 16, display: "grid", gap: 8 },
  statValue: { color: "var(--ff-text)", fontSize: 24, fontWeight: 900, lineHeight: 1 },
  statLabel: { color: "var(--ff-text-faint)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" },
  resultMessage: { margin: 0, color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.7 },
  resultActions: { display: "flex", gap: 12, flexWrap: "wrap" },
};
