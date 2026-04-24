import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const QUALITY_OPTIONS = [
  { id: "high", icon: "🌟", label: "High Quality", desc: "Best clarity, less compression" },
  { id: "medium", icon: "⚖️", label: "Balanced", desc: "Good mix of size and quality" },
  { id: "low", icon: "🗜️", label: "Max Compression", desc: "Smallest file, may lose clarity" },
];

function WatermarkedPdfPreview({ fileName }) {
  return (
    <div style={s.previewCard}>
      <div style={s.previewDoc}>
        <div style={s.previewDocTop}>
          <span style={{ fontSize: 34 }}>📄</span>
          <div>
            <div style={s.previewDocTitle}>Compressed PDF Preview</div>
            <div style={s.previewDocMeta}>{fileName || "document.pdf"}</div>
          </div>
        </div>
        <div style={s.previewDocBody}>
          <div>Final download will be watermark-free.</div>
          <div>Credits are deducted only at download time.</div>
        </div>
        <div style={s.previewWatermarkLayer}>
          {Array.from({ length: 10 }).map((_, index) => (
            <span key={index} style={s.previewWatermarkText}>DOCSAATHI PREVIEW</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PDFCompressPage() {
  const navigate = useNavigate();
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = credits ?? user?.credits ?? 0;

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("KB");
  const [quality, setQuality] = useState("medium");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const getTargetKB = () => {
    const val = parseFloat(targetValue);
    if (!val || val <= 0) return null;
    return targetUnit === "MB" ? Math.round(val * 1024) : Math.round(val);
  };

  const handleFile = (selectedFile) => {
    setFileError("");
    setResult(null);
    setDone(false);
    setError("");
    setDownloadUnlocked(false);

    if (!selectedFile) return;

    const isPDF = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPDF) {
      setFileError("Only PDF files are accepted. Please upload a .pdf file.");
      setFile(null);
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setFileError("File too large. Maximum allowed size is 20 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleInputChange = (e) => handleFile(e.target.files?.[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleCompress = async () => {
    setError("");
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    const targetKB = getTargetKB();
    const fileKB = Math.round(file.size / 1024);

    if (!targetKB || targetKB < 1) {
      setError("Please enter a valid target size like 200 KB or 1.5 MB.");
      return;
    }
    if (targetKB >= fileKB) {
      setError(`Your file is already ${fileKB} KB, so no compression is needed for a ${targetKB} KB target.`);
      return;
    }

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
      setError(err.response?.data?.message || "Compression failed. The PDF may be encrypted or corrupted.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
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
      link.download = `docsaathi_${file?.name || "compressed.pdf"}`;
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

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError("");
    setFileError("");
    setDone(false);
    setTargetValue("");
    setDownloadUnlocked(false);
  };

  const fileSizeKB = file ? Math.round(file.size / 1024) : 0;
  const targetKB = getTargetKB();

  return (
    <div style={s.root}>
      <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} />

        <div style={s.toolHeader}>
          <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Back</button>
          <div style={s.toolIcon}>🗜️</div>
          <div>
            <h2 style={s.toolTitle}>PDF Compression</h2>
            <p style={s.toolDesc}>Preview first, watermark-free PDF on download only · 2 credits</p>
          </div>
        </div>

        <div style={s.card}>
          <div style={s.stepBadge}>Step 1 - Upload PDF</div>
          <div
            style={{
              ...s.uploadZone,
              borderColor: fileError ? "#ef4444" : file ? "#f97316" : "#374151",
              pointerEvents: done ? "none" : "auto",
              opacity: done ? 0.5 : 1,
            }}
            onClick={() => !done && document.getElementById("pdfFileInput")?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {file ? (
              <div style={s.filePreview}>
                <span style={{ fontSize: 52 }}>📄</span>
                <p style={s.fileName}>{file.name}</p>
                <p style={s.fileMeta}>{fileSizeKB} KB · PDF</p>
                {!done && (
                  <button
                    style={s.changeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("pdfFileInput")?.click();
                    }}
                  >
                    Change File
                  </button>
                )}
              </div>
            ) : (
              <>
                <span style={{ fontSize: 52 }}>📥</span>
                <p style={s.uploadText}>Click or Drag & Drop your PDF here</p>
                <p style={s.uploadSub}>Only .pdf files accepted · Max 20 MB</p>
              </>
            )}
          </div>
          <input
            id="pdfFileInput"
            type="file"
            accept=".pdf,application/pdf"
            style={{ display: "none" }}
            onChange={handleInputChange}
          />
          {fileError && <p style={s.fileError}>{fileError}</p>}
        </div>

        <div style={s.card}>
          <div style={s.stepBadge}>Step 2 - Enter Target Size</div>
          <p style={s.hint}>
            What size do you need the PDF to be?
            {fileSizeKB > 0 && (
              <span style={{ color: "#f97316" }}> Your file is currently <b>{fileSizeKB} KB</b>.</span>
            )}
          </p>

          <div style={s.sizeRow}>
            <input
              type="number"
              min="1"
              placeholder="e.g. 200"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              style={s.sizeInput}
              disabled={done}
            />
            <div style={s.unitToggle}>
              {["KB", "MB"].map((unit) => (
                <button
                  key={unit}
                  style={{
                    ...s.unitBtn,
                    background: targetUnit === unit ? "#f97316" : "#111827",
                    color: targetUnit === unit ? "#fff" : "#64748b",
                    borderColor: targetUnit === unit ? "#f97316" : "#374151",
                  }}
                  onClick={() => setTargetUnit(unit)}
                  disabled={done}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {targetKB > 0 && (
            <p style={s.targetHint}>
              Target:{" "}
              <b style={{ color: "#f97316" }}>
                {targetUnit === "MB"
                  ? `${parseFloat(targetValue).toFixed(2)} MB (${targetKB} KB)`
                  : `${targetKB} KB`}
              </b>
              {fileSizeKB > 0 && targetKB < fileSizeKB && (
                <span style={{ color: "#22c55e" }}>
                  {" "}→ reduce by {Math.round(((fileSizeKB - targetKB) / fileSizeKB) * 100)}%
                </span>
              )}
            </p>
          )}
        </div>

        <div style={s.card}>
          <div style={s.stepBadge}>Step 3 - Compression Quality</div>
          <div style={s.qualityGrid}>
            {QUALITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                style={{
                  ...s.qualityBtn,
                  borderColor: quality === option.id ? "#f97316" : "#374151",
                  background: quality === option.id ? "#f9731618" : "#111827",
                }}
                onClick={() => setQuality(option.id)}
                disabled={done}
              >
                <span style={{ fontSize: 22 }}>{option.icon}</span>
                <div>
                  <div style={{ color: quality === option.id ? "#f97316" : "#f1f5f9", fontWeight: 700, fontSize: 14 }}>
                    {option.label}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{option.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <p style={s.error}>{error}</p>}

        {!done && (
          <div style={s.actionRow}>
            <button
              style={{ ...s.btnPrimary, opacity: !file || !targetValue ? 0.5 : 1 }}
              onClick={handleCompress}
              disabled={processing || !file || !targetValue}
            >
              {processing ? <><span style={s.spinner} /> Compressing...</> : "Generate Preview"}
            </button>
          </div>
        )}

        {done && result && (
          <div style={s.resultCard}>
            <WatermarkedPdfPreview fileName={file?.name} />

            <div style={s.statsRow}>
              <div style={s.statBox}>
                <span style={{ fontSize: 36 }}>📄</span>
                <span style={s.statNum}>{result.originalKB} KB</span>
                <span style={s.statLbl}>Original</span>
              </div>
              <div style={s.arrowCol}>
                <span style={{ fontSize: 28, color: "#374151" }}>→</span>
                <span
                  style={{
                    ...s.reductionPill,
                    background: result.reduction >= 10 ? "#052e16" : "#1c1917",
                    color: result.reduction >= 10 ? "#86efac" : "#fca57a",
                    border: `1px solid ${result.reduction >= 10 ? "#14532d" : "#78350f"}`,
                  }}
                >
                  -{result.reduction}%
                </span>
              </div>
              <div style={s.statBox}>
                <span style={{ fontSize: 36 }}>✅</span>
                <span style={{ ...s.statNum, color: result.hitTarget ? "#86efac" : "#fbbf24" }}>
                  {result.compressedKB} KB
                </span>
                <span style={s.statLbl}>Compressed</span>
              </div>
            </div>

            {result.hitTarget ? (
              <div style={s.msgSuccess}>
                Preview ready. Final PDF will download watermark-free after credit deduction.
              </div>
            ) : (
              <div style={s.msgWarning}>
                This PDF cannot be compressed below <b>{result.compressedKB} KB</b>.
                <br /><br />
                Your target was <b>{result.targetKB} KB</b>, but this is the smallest achievable size.
              </div>
            )}

            <div style={s.engineNote}>
              Compression engine: <b>{result.engineLabel || "Basic PDF engine"}</b>.
              {result.canImproveFurther
                ? " Stronger 40-50% compression usually needs Ghostscript installed on the server."
                : " Strong compression mode is active for this server."}
            </div>

            <div style={s.resultActions}>
              <button onClick={handleDownload} style={s.btnPrimary} disabled={downloading}>
                {downloading
                  ? "Unlocking Download..."
                  : downloadUnlocked
                    ? "Download Again"
                    : "Download Final PDF (2 Credits)"}
              </button>
              <button onClick={handleReset} style={s.btnSecondary}>Process Another</button>
            </div>

            {!downloadUnlocked && currentCredits < 2 && (
              <p style={s.previewNote}>
                Download ke liye 2 credits chahiye. <span style={s.buyLink} onClick={() => navigate("/pricing")}>Buy credits →</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 60 },
  toolHeader: { display: "flex", alignItems: "center", gap: 16, padding: "20px 28px 0" },
  backBtn: { background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0 },
  toolIcon: { width: 56, height: 56, borderRadius: 14, background: "#f9731618", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 },
  toolTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 20, margin: 0 },
  toolDesc: { color: "#64748b", fontSize: 13, marginTop: 4 },
  card: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, margin: "16px 28px 0", padding: "20px 20px 24px" },
  stepBadge: { display: "inline-block", background: "#f97316", color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: 11, fontWeight: 800, marginBottom: 14 },
  hint: { color: "#64748b", fontSize: 13, margin: "0 0 14px" },
  uploadZone: { border: "2px dashed", borderRadius: 14, minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#111827", transition: "border-color 0.2s", padding: 24, gap: 8 },
  filePreview: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  fileName: { color: "#f1f5f9", fontWeight: 600, fontSize: 15, margin: 0, textAlign: "center", maxWidth: 340, wordBreak: "break-all" },
  fileMeta: { color: "#64748b", fontSize: 13, margin: 0 },
  changeBtn: { background: "#1e293b", border: "1px solid #374151", color: "#94a3b8", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, marginTop: 6 },
  uploadText: { color: "#94a3b8", fontWeight: 600, fontSize: 15, margin: 0 },
  uploadSub: { color: "#475569", fontSize: 12, margin: 0 },
  fileError: { color: "#ef4444", fontSize: 13, marginTop: 10 },
  sizeRow: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  sizeInput: { background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: "12px 16px", color: "#f1f5f9", fontSize: 22, fontWeight: 700, width: 160, outline: "none" },
  unitToggle: { display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid #374151" },
  unitBtn: { border: "1px solid", padding: "12px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" },
  targetHint: { color: "#94a3b8", fontSize: 13, marginTop: 10 },
  qualityGrid: { display: "flex", flexDirection: "column", gap: 10 },
  qualityBtn: { border: "1px solid", borderRadius: 12, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", transition: "all 0.15s", width: "100%" },
  error: { color: "#ef4444", padding: "8px 28px", fontSize: 14 },
  actionRow: { padding: "16px 28px 0", display: "flex" },
  btnPrimary: { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" },
  btnSecondary: { background: "#1e293b", color: "#94a3b8", border: "1px solid #374151", borderRadius: 12, padding: "12px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  spinner: { display: "inline-block", width: 16, height: 16, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
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
  reductionPill: { borderRadius: 8, padding: "4px 14px", fontSize: 14, fontWeight: 800 },
  msgSuccess: { background: "#052e16", border: "1px solid #14532d", borderRadius: 12, padding: "14px 18px", color: "#86efac", fontSize: 14, marginBottom: 20, lineHeight: 1.6 },
  msgWarning: { background: "#1c0a0522", border: "1px solid #78350f", borderRadius: 12, padding: "14px 18px", color: "#fbbf24", fontSize: 13, marginBottom: 20, lineHeight: 1.7 },
  engineNote: { color: "#cbd5e1", fontSize: 12, lineHeight: 1.6, marginBottom: 18 },
  resultActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  previewNote: { color: "#fca57a", fontSize: 12, marginTop: 16, marginBottom: 0 },
  buyLink: { color: "#f97316", cursor: "pointer", fontWeight: 700 },
};
