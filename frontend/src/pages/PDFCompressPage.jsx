import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import AuthModal from "../components/AuthModal";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const QUALITY_OPTIONS = [
  { id: "high", icon: "HQ", label: "High Quality", desc: "Less compression, better clarity" },
  { id: "medium", icon: "BL", label: "Balanced", desc: "Good size and readability" },
  { id: "low", icon: "MC", label: "Max Compression", desc: "Smallest file possible" },
];

function PreviewCard({ fileName }) {
  return (
    <div style={s.previewCard}>
      <div style={s.previewDoc}>
        <div style={s.previewTop}>
          <span style={s.previewIcon}>PDF</span>
          <div>
            <div style={s.previewTitle}>Compressed PDF Preview</div>
            <div style={s.previewMeta}>{fileName || "document.pdf"}</div>
          </div>
        </div>
        <div style={s.previewBody}>
          Final PDF download will be watermark-free. Credits are deducted only at final download.
        </div>
      </div>
    </div>
  );
}

export default function PDFCompressPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = user ? (credits ?? user?.credits ?? 0) : 0;

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("KB");
  const [quality, setQuality] = useState("medium");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const targetFromQuery = searchParams.get("target");
    const unitFromQuery = searchParams.get("unit");
    if (targetFromQuery) setTargetValue(targetFromQuery);
    if (unitFromQuery === "KB" || unitFromQuery === "MB") setTargetUnit(unitFromQuery);
  }, [searchParams]);

  const targetKB = (() => {
    const val = parseFloat(targetValue);
    if (!val || val <= 0) return null;
    return targetUnit === "MB" ? Math.round(val * 1024) : Math.round(val);
  })();

  const fileSizeKB = file ? Math.round(file.size / 1024) : 0;

  const handleFile = (selectedFile) => {
    setFileError("");
    setResult(null);
    setDone(false);
    setError("");
    setDownloadUnlocked(false);
    if (!selectedFile) return;

    const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFileError("Only PDF files are accepted.");
      setFile(null);
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setFileError("Maximum allowed size is 20 MB.");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const handleCompress = async () => {
    setError("");
    if (!file) return setError("Please upload a PDF file first.");
    if (!targetKB || targetKB < 1) return setError("Please enter a valid target size.");
    if (targetKB >= fileSizeKB) return setError(`This PDF is already ${fileSizeKB} KB. Choose a smaller target.`);

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("targetKB", targetKB);
      formData.append("quality", quality);
      const { data } = await API.post("/pdf/compress", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ ...data, targetKB });
      setDone(true);
      setDownloadUnlocked(false);
    } catch (err) {
      setError(err.response?.data?.message || "Compression failed.");
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
          toolType: "pdfcompress",
          examName: result.targetKB ? `Target: ${result.targetKB} KB` : "PDF Compress",
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
      link.download = `formfixer_${file?.name || "compressed.pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      if (err.response?.data?.message) return setError(err.response.data.message);
      window.open(result.url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError("");
    setFileError("");
    setDone(false);
    setTargetValue("");
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
          title="Login to Download PDF"
          subtitle="Preview guest mode me available hai. Final watermark-free PDF ke liye login chahiye."
        />
      )}

      {user && <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />}
      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : (
          <div style={s.guestBar}>
            <span>Preview bina login dekh sakte ho. Final download par login lagega.</span>
            <button style={s.guestLoginBtn} onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          </div>
        )}

        <div style={s.content}>
          <div style={s.toolHeader}>
            <button style={s.backBtn} onClick={() => navigate(user ? "/dashboard" : "/all-tools")}>Back</button>
            <div>
              <h1 style={s.toolTitle}>Compress PDF to Exact KB</h1>
              <p style={s.toolDesc}>Set the target size, choose compression style, preview first, then download final PDF.</p>
            </div>
          </div>

          <div style={s.workspace}>
            <div style={s.uploadPanel}>
              <div style={s.panelLabel}>Upload PDF</div>
              <div
                style={{
                  ...s.uploadZone,
                  borderColor: fileError ? "#ef4444" : file ? "#f97316" : "var(--ff-border)",
                  opacity: done ? 0.5 : 1,
                  pointerEvents: done ? "none" : "auto",
                }}
                onClick={() => !done && document.getElementById("pdfFileInput")?.click()}
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
                    <p style={s.fileMeta}>{fileSizeKB} KB</p>
                  </div>
                ) : (
                  <>
                    <div style={s.bigIcon}>UP</div>
                    <p style={s.uploadText}>Upload / Drop PDF Here</p>
                    <p style={s.uploadSub}>Only .pdf files · up to 20 MB</p>
                  </>
                )}
              </div>
              <input id="pdfFileInput" type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
              {fileError && <p style={s.fileError}>{fileError}</p>}
            </div>

            <div style={s.configPanel}>
              <div style={s.panelLabel}>Configuration</div>
              <div style={s.configCard}>
                <div style={s.configTitle}>Target Size</div>
                <div style={s.sizeRow}>
                  <input
                    type="number"
                    min="1"
                    placeholder="200"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    style={s.sizeInput}
                    disabled={done}
                  />
                  <div style={s.unitToggle}>
                    {["KB", "MB"].map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        style={{
                          ...s.unitBtn,
                          background: targetUnit === unit ? "#f97316" : "var(--ff-panel)",
                          color: targetUnit === unit ? "#fff" : "var(--ff-text-soft)",
                          borderColor: targetUnit === unit ? "#f97316" : "var(--ff-border)",
                        }}
                        onClick={() => setTargetUnit(unit)}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
                <p style={s.helperText}>
                  {targetKB ? `Target: ${targetKB} KB` : "Enter the final size you need."}
                </p>
              </div>

              <div style={s.configCard}>
                <div style={s.configTitle}>Compression Style</div>
                <div style={s.optionList}>
                  {QUALITY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      style={{
                        ...s.optionBtn,
                        borderColor: quality === option.id ? "#f97316" : "var(--ff-border)",
                        background: quality === option.id ? "color-mix(in srgb, var(--ff-orange) 10%, transparent)" : "var(--ff-panel)",
                      }}
                      onClick={() => setQuality(option.id)}
                    >
                      <span style={{ ...s.optionIcon, color: quality === option.id ? "#f97316" : "var(--ff-text-faint)" }}>{option.icon}</span>
                      <div>
                        <div style={s.optionTitle}>{option.label}</div>
                        <div style={s.optionDesc}>{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {!done && (
                <button
                  style={{ ...s.btnPrimary, opacity: !file || !targetValue ? 0.55 : 1 }}
                  onClick={handleCompress}
                  disabled={processing || !file || !targetValue}
                >
                  {processing ? "Compressing..." : "Generate Preview"}
                </button>
              )}
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}

          {done && result && (
            <div style={s.resultCard}>
              <PreviewCard fileName={file?.name} />
              <div style={s.statsRow}>
                <div style={s.statBox}>
                  <div style={s.statValue}>{result.originalKB} KB</div>
                  <div style={s.statLabel}>Original</div>
                </div>
                <div style={s.statBox}>
                  <div style={s.statValue} aria-label="reduction">{result.reduction}%</div>
                  <div style={s.statLabel}>Reduced</div>
                </div>
                <div style={s.statBox}>
                  <div style={{ ...s.statValue, color: result.hitTarget ? "#22c55e" : "#f59e0b" }}>{result.compressedKB} KB</div>
                  <div style={s.statLabel}>Compressed</div>
                </div>
              </div>
              <p style={s.resultMessage}>
                {result.hitTarget
                  ? "Preview ready. Final PDF will download watermark-free after credit deduction."
                  : `This PDF could not go below ${result.compressedKB} KB. That is the smallest achievable size for this file.`}
              </p>
              <div style={s.resultActions}>
                <button
                  style={s.btnPrimary}
                  onClick={async () => {
                    if (!user) return setShowAuthModal(true);
                    await handleDownloadAfterAuth();
                  }}
                  disabled={downloading}
                >
                  {downloading ? "Unlocking Download..." : downloadUnlocked ? "Download Again" : "Download Final PDF (2 Credits)"}
                </button>
                <button style={s.btnSecondary} onClick={handleReset}>Process Another</button>
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
  guestLoginBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 999, padding: "10px 16px", fontWeight: 700, cursor: "pointer" },
  content: { maxWidth: 1180, margin: "0 auto", padding: "18px 28px 0" },
  toolHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" },
  backBtn: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", color: "var(--ff-text-soft)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 },
  toolTitle: { color: "var(--ff-text)", fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.08 },
  toolDesc: { color: "var(--ff-text-soft)", fontSize: 14, margin: "6px 0 0", lineHeight: 1.6 },
  workspace: { display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(300px, 0.8fr)", gap: 20, alignItems: "start" },
  uploadPanel: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 18 },
  configPanel: { display: "grid", gap: 14 },
  panelLabel: { color: "var(--ff-text-faint)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  uploadZone: { minHeight: 360, border: "2px dashed", borderRadius: 16, background: "var(--ff-panel)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, cursor: "pointer" },
  filePreview: { display: "grid", justifyItems: "center", gap: 8 },
  bigIcon: { width: 88, height: 88, borderRadius: "50%", background: "color-mix(in srgb, var(--ff-blue) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--ff-blue) 24%, transparent)", color: "var(--ff-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900 },
  fileName: { color: "var(--ff-text)", fontSize: 16, fontWeight: 800, margin: 0, textAlign: "center", wordBreak: "break-word" },
  fileMeta: { color: "var(--ff-text-soft)", fontSize: 13, margin: 0 },
  uploadText: { color: "var(--ff-text)", fontWeight: 800, fontSize: 18, margin: "10px 0 0" },
  uploadSub: { color: "var(--ff-text-soft)", fontSize: 13, margin: "6px 0 0" },
  fileError: { color: "#ef4444", fontSize: 13, margin: "10px 0 0" },
  configCard: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 18 },
  configTitle: { color: "var(--ff-text)", fontSize: 17, fontWeight: 900, marginBottom: 12 },
  sizeRow: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  sizeInput: { width: 150, background: "var(--ff-panel)", border: "1px solid var(--ff-border)", color: "var(--ff-text)", borderRadius: 12, padding: "14px 16px", outline: "none", fontSize: 22, fontWeight: 900 },
  unitToggle: { display: "flex", gap: 8 },
  unitBtn: { border: "1px solid", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 800 },
  helperText: { color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.6, margin: "10px 0 0" },
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
