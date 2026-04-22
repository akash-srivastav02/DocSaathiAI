import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import API from "../api/axios";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

// ─── Correct credits per feature ─────────────────────────────────────────────
const FEATURES = [
  { id: "photo",       icon: "📸", label: "Exam Photo",     credit: 3,     color: "#3b82f6", desc: "Resize & compress photo per exam spec" },
  { id: "signature",   icon: "✍️", label: "Exam Signature", credit: 2,     color: "#8b5cf6", desc: "Format your signature for any exam" },
  { id: "crop",        icon: "✂️", label: "Crop & Resize",  credit: 1,     color: "#ec4899", desc: "Manual crop with aspect ratio lock" },
  { id: "pdfeditor",   icon: "📝", label: "PDF Editor",     credit: 2,     color: "#ef4444", desc: "Edit Admit Cards & form PDFs" },
  { id: "resume",      icon: "📄", label: "Resume Builder", credit: "1–3", color: "#22c55e", desc: "Professional templates, exam-ready CVs" },
];

const FALLBACK_EXAMS = [
  "SSC CGL","SSC CHSL","SSC MTS","SSC GD",
  "SBI PO","SBI Clerk","IBPS PO","IBPS Clerk","IBPS RRB",
  "RRB NTPC","RRB Group D","RRB JE",
  "UPSC CSE","UPSC CDS","UPSC NDA",
  "Delhi Police Constable","Delhi Police SI",
  "JEE Main","JEE Advanced","NEET UG","NEET PG",
  "CUET UG","CUET PG",
  "UP Police","MP Police","Rajasthan Police",
  "DRDO","ISRO","HAL",
  "LIC AAO","LIC HFL",
  "NDA","AFCAT","CDS","GATE","ESE (IES)",
  "Bihar Police","Haryana Police",
];

// ─── SpecBox ──────────────────────────────────────────────────────────────────
function SpecBox({ label, val, icon }) {
  return (
    <div style={s.specBox}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={s.specLabel}>{label}</div>
        <div style={s.specVal}>{val}</div>
      </div>
    </div>
  );
}

// ─── WatermarkModal ───────────────────────────────────────────────────────────
function WatermarkModal({ onDownloadFree, onRemovePaid, onBuyPlan }) {
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>⚠️</div>
        <h3 style={s.modalTitle}>Credits Exhausted</h3>
        <p style={s.modalDesc}>
          Your file is processed but will carry a <b>Doc Saathi AI</b> watermark.
          Choose an option below:
        </p>
        <div style={s.modalBtns}>
          <button style={s.modalBtnFree} onClick={onDownloadFree}>
            <span>📥 Download with Watermark</span>
            <span style={s.badgeFree}>FREE</span>
          </button>
          <button style={s.modalBtnPaid} onClick={onRemovePaid}>
            <span>✨ Remove Watermark</span>
            <span style={s.badgePaid}>₹10 only</span>
          </button>
        </div>
        <button style={s.modalLink} onClick={onBuyPlan}>
          Or buy a plan and save more →
        </button>
      </div>
    </div>
  );
}

// ─── CameraModal ──────────────────────────────────────────────────────────────
function CameraModal({ onCapture, onClose }) {
  const webcamRef = useRef(null);
  const [camError, setCamError] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setCapturing(true);
    try {
      const res  = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
      onCapture(file, imageSrc);
    } finally {
      setCapturing(false);
    }
  }, [onCapture]);

  return (
    <div style={s.overlay}>
      <div style={{ ...s.modal, maxWidth: 460, textAlign: "left" }}>
        <h3 style={{ ...s.modalTitle, textAlign: "left" }}>📷 Live Camera</h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>
          Face the camera clearly. Click Capture when ready.
        </p>

        {camError ? (
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 24,
            color: "#94a3b8", fontSize: 13, textAlign: "center", marginBottom: 14 }}>
            ❌ Camera permission denied.<br />
            Allow camera access in browser settings and try again.
          </div>
        ) : (
          <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 14, background: "#000", lineHeight: 0 }}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ facingMode: "user", width: 420, height: 320 }}
              onUserMediaError={() => setCamError(true)}
              style={{ display: "block", width: "100%" }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {!camError && (
            <button onClick={capture} disabled={capturing}
              style={{ ...s.btnPrimary, flex: 1 }}>
              {capturing ? "📸 Capturing..." : "📸 Capture Photo"}
            </button>
          )}
          <button onClick={onClose} style={{ ...s.btnSecondary, flex: camError ? 1 : 0 }}>
            {camError ? "Close" : "✕ Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ToolPage() {
  const { toolId } = useParams();
  const navigate   = useNavigate();
  const { user, credits, updateCredits, logout } = useStore();
  const [activeNav, setActiveNav]     = useState("Dashboard");
  const [showPricing, setShowPricing] = useState(false);

  // File & preview
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);

  // Exam selection
  const [examList, setExamList]     = useState(FALLBACK_EXAMS);
  const [liveSpecs, setLiveSpecs]   = useState({});
  const [specsLoading, setSpecsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState("");

  // Process state
  const [processing, setProcessing] = useState(false);
  const [done, setDone]             = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");

  // Modals
  const [showCamera, setShowCamera]         = useState(false);
  const [showWatermark, setShowWatermark]   = useState(false);

  const tool         = FEATURES.find((f) => f.id === toolId);
  const needsExam    = ["photo", "signature"].includes(toolId);
  const currentCredits = credits ?? user?.credits ?? 0;

  // Safe credit label
  const creditLabel = (() => {
    const c = tool?.credit;
    if (!c) return "1 credit";
    if (typeof c === "string") return `${c} credits`;
    return `${c} credit${c !== 1 ? "s" : ""}`;
  })();

  // Numeric credits needed for this tool
  const creditsNeeded = (() => {
    const c = tool?.credit;
    if (typeof c === "number") return c;
    return 1; // minimum for string range
  })();

  // Load exam specs
  useEffect(() => {
    API.get("/process/exams")
      .then(({ data }) => {
        setExamList(data.map((e) => e.name));
        const map = {};
        data.forEach((e) => { map[e.name] = e; });
        setLiveSpecs(map);
      })
      .catch(() => {})
      .finally(() => setSpecsLoading(false));
  }, []);

  const liveSpec = liveSpecs[selectedExam]?.[toolId] ?? null;
  const specBoxes = liveSpec ? [
    { label: "Dimensions", val: `${liveSpec.w} × ${liveSpec.h} px`,       icon: "📐" },
    { label: "Size Range",  val: `${liveSpec.minKB}–${liveSpec.maxKB} KB`, icon: "📦" },
    { label: "Format",      val: "JPG (auto-converted)",                    icon: "🖼️" },
    { label: "Background",  val: "White (auto-applied)",                    icon: "🎨" },
  ] : null;

  // ── File handlers ─────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
    setDone(false);
    setResult(null);
    setError("");
  };

  const handleCameraCapture = (capturedFile, previewUrl) => {
    setFile(capturedFile);
    setPreview(previewUrl);
    setShowCamera(false);
    setDone(false);
    setResult(null);
  };

  // ── Process ───────────────────────────────────────────────────────────────
  const handleProcess = async () => {
    if (!file || (needsExam && !selectedExam)) return;
    setProcessing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (needsExam) formData.append("examName", selectedExam);

      const { data } = await API.post(`/process/${toolId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(data);

      // Update credits in store — use actual remaining from server
      if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);

      setDone(true);

      // Show watermark modal if file has watermark
      if (data.hasWatermark) setShowWatermark(true);

    } catch (err) {
      setError(err.response?.data?.message || "Processing failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ── Download — blob forced (no new tab) ───────────────────────────────────
  const handleDownload = async (url) => {
    const targetUrl = url || result?.url;
    if (!targetUrl) return;
    try {
      const response = await fetch(targetUrl);
      const blob     = await response.blob();
      const blobUrl  = URL.createObjectURL(blob);
      const link     = document.createElement("a");
      link.href      = blobUrl;
      link.download  = `docsaathi_${toolId}_${selectedExam || "file"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback if CORS blocks blob fetch
      const link = document.createElement("a");
      link.href = targetUrl;
      link.download = `docsaathi_${toolId}.jpg`;
      link.click();
    }
    setShowWatermark(false);
  };

  const handleReset = () => {
    setFile(null); setPreview(null); setSelectedExam("");
    setDone(false); setResult(null); setError("");
    setShowWatermark(false);
  };

  if (!tool) return (
    <div style={{ color: "#fff", padding: 40, fontFamily: "Segoe UI" }}>
      Tool not found. <span style={{ color: "#f97316", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>Go back</span>
    </div>
  );

  return (
    <div style={s.root}>
      {/* Watermark modal */}
      {showWatermark && (
        <WatermarkModal
          onDownloadFree={() => { setShowWatermark(false); handleDownload(); }}
          onRemovePaid={() => { setShowWatermark(false); navigate("/pricing"); }}
          onBuyPlan={() => { setShowWatermark(false); navigate("/pricing"); }}
        />
      )}

      {/* Camera modal */}
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <Sidebar
        credits={currentCredits} activeNav={activeNav}
        setActiveNav={setActiveNav} setShowPricing={setShowPricing}
        onLogout={() => { logout(); navigate("/"); }}
      />

      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} setShowPricing={setShowPricing} />

        {/* Header */}
        <div style={s.toolHeader}>
          <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Back</button>
          <div style={{ ...s.toolIconBig, background: tool.color + "20", color: tool.color }}>
            {tool.icon}
          </div>
          <div>
            <h2 style={s.toolTitle}>{tool.label}</h2>
            <p style={s.toolDesc}>
              {tool.desc} ·{" "}
              <b style={{ color: tool.color }}>⚡ {creditLabel}</b>
            </p>
          </div>
        </div>

        {/* Low credits warning */}
        {currentCredits < creditsNeeded && (
          <div style={s.warnBox}>
            ⚠️ You need <b>{creditsNeeded} credit{creditsNeeded > 1 ? "s" : ""}</b> but only have <b>{currentCredits}</b>.{" "}
            <span style={s.link} onClick={() => navigate("/pricing")}>Buy credits →</span>
          </div>
        )}

        {/* Exam selector */}
        {needsExam && (
          <div style={s.card}>
            <label style={s.label}>Select Your Exam</label>
            <select
              style={{ ...s.select, opacity: done ? 0.5 : 1 }}
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              disabled={done}
            >
              <option value="">{specsLoading ? "Loading exams..." : "-- Choose Exam --"}</option>
              {examList.map((ex) => <option key={ex} value={ex}>{ex}</option>)}
            </select>

            {selectedExam && specBoxes && (
              <div style={s.specGrid}>
                {specBoxes.map((b) => <SpecBox key={b.label} {...b} />)}
              </div>
            )}
            {selectedExam && liveSpec && (
              <p style={s.specNote}>
                ✅ Will be resized to <b>{liveSpec.w}×{liveSpec.h}px</b> and
                compressed to <b>{liveSpec.minKB}–{liveSpec.maxKB} KB</b> with white background.
              </p>
            )}
            {selectedExam && !liveSpec && !specsLoading && (
              <p style={s.specNote}>📋 Spec will be applied automatically.</p>
            )}
          </div>
        )}

        {/* Upload card */}
        <div style={s.card}>
          <label style={s.label}>Upload or Capture</label>

          {/* Upload zone — disabled after done */}
          <div
            style={{
              ...s.uploadZone,
              opacity: done ? 0.45 : 1,
              pointerEvents: done ? "none" : "auto",
              cursor: done ? "not-allowed" : "pointer",
              borderColor: preview ? "#f97316" : "#374151",
            }}
            onClick={() => !done && document.getElementById("fileIn").click()}
          >
            {preview ? (
              <img src={preview} alt="preview" style={s.preview} />
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 8 }}>⬆️</div>
                <p style={s.uploadText}>Click to Upload or Drag & Drop</p>
                <p style={s.uploadSub}>JPG, PNG, WEBP supported</p>
              </>
            )}
          </div>

          <input id="fileIn" type="file" accept="image/*" style={{ display: "none" }}
            onChange={handleFileChange} disabled={done} />

          {/* Action buttons — disabled after done */}
          <div style={s.uploadBtns}>
            <button
              style={{ ...s.btnSecondary, opacity: done ? 0.4 : 1, cursor: done ? "not-allowed" : "pointer" }}
              onClick={() => !done && document.getElementById("fileIn").click()}
              disabled={done}
            >
              📁 Browse File
            </button>
            <button
              style={{ ...s.btnSecondary, opacity: done ? 0.4 : 1, cursor: done ? "not-allowed" : "pointer" }}
              onClick={() => !done && setShowCamera(true)}
              disabled={done}
            >
              📷 Live Camera
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={s.errorBox}>❌ {error}</div>
        )}

        {/* Process button */}
        {!done && (
          <div style={{ padding: "16px 28px 0" }}>
            <button
              style={{
                ...s.btnPrimary,
                opacity: (!file || (needsExam && !selectedExam) || processing) ? 0.5 : 1,
              }}
              onClick={handleProcess}
              disabled={processing || !file || (needsExam && !selectedExam)}
            >
              {processing
                ? <><span style={s.spinner} /> Processing...</>
                : `⚡ Process Now (${creditLabel})`}
            </button>
          </div>
        )}

        {/* Result */}
        {done && result && (
          <div style={s.resultCard}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
            <h3 style={s.resultTitle}>Your file is ready!</h3>
            <p style={s.resultSub}>
              Size: <b>{result.sizeKB} KB</b> · Dimensions: <b>{result.dimensions}</b>
              {result.withinRange ? " · ✅ Within exam range" : " · ✅ Within max limit"}
              {result.hasWatermark && " · ⚠️ Has Watermark"}
            </p>

            <div style={s.resultActions}>
              <button onClick={() => handleDownload()} style={s.btnPrimary}>
                📥 Download
              </button>
              <button style={s.btnSecondary} onClick={handleReset}>
                🔄 Process Another
              </button>
            </div>

            {result.hasWatermark && (
              <p style={{ color: "#fca57a", fontSize: 13, marginTop: 14 }}>
                Remove watermark for ₹10 →{" "}
                <span style={s.link} onClick={() => navigate("/pricing")}>
                  Or buy a plan
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 48 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },

  toolHeader: { display: "flex", alignItems: "center", gap: 16, padding: "20px 28px 0" },
  backBtn: { background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0 },
  toolIconBig: { width: 52, height: 52, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 },
  toolTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 20, margin: 0 },
  toolDesc: { color: "#64748b", fontSize: 13, marginTop: 4 },

  warnBox: { margin: "14px 28px 0", background: "#451a0320", border: "1px solid #92400e", borderRadius: 10, padding: "10px 16px", color: "#fbbf24", fontSize: 13 },

  card: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, margin: "18px 28px 0", padding: 20 },
  label: { display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 },
  select: { width: "100%", background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" },

  specGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 },
  specBox: { background: "#111827", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 },
  specLabel: { color: "#64748b", fontSize: 11, marginBottom: 2 },
  specVal: { color: "#f97316", fontWeight: 700, fontSize: 13 },
  specNote: { color: "#86efac", fontSize: 13, marginTop: 10, lineHeight: 1.5 },

  uploadZone: { border: "2px dashed", borderRadius: 14, minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111827", marginBottom: 12, overflow: "hidden", transition: "all 0.2s" },
  uploadText: { color: "#94a3b8", fontWeight: 600, fontSize: 14, margin: 0 },
  uploadSub: { color: "#475569", fontSize: 12, marginTop: 4 },
  preview: { maxWidth: "100%", maxHeight: 220, display: "block" },
  uploadBtns: { display: "flex", gap: 10 },

  errorBox: { margin: "10px 28px 0", background: "#450a0a20", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 16px", color: "#fca5a5", fontSize: 14 },

  btnPrimary: { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", transition: "opacity 0.2s" },
  btnSecondary: { background: "#1e293b", color: "#94a3b8", border: "1px solid #374151", borderRadius: 12, padding: "11px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  spinner: { display: "inline-block", width: 16, height: 16, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  resultCard: { margin: "18px 28px 0", background: "#052e16", border: "1px solid #14532d", borderRadius: 16, padding: 28, textAlign: "center" },
  resultTitle: { color: "#86efac", fontWeight: 800, fontSize: 20, margin: 0 },
  resultSub: { color: "#64748b", fontSize: 13, marginTop: 6, marginBottom: 0 },
  resultActions: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 18 },

  // Modals
  overlay: { position: "fixed", inset: 0, background: "#000000aa", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#0d1421", border: "1px solid #374151", borderRadius: 20, padding: "28px 24px", maxWidth: 380, width: "100%", textAlign: "center" },
  modalTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 19, margin: "0 0 8px" },
  modalDesc: { color: "#94a3b8", fontSize: 13, marginBottom: 20, lineHeight: 1.5 },
  modalBtns: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 },
  modalBtnFree: { background: "#1e293b", border: "1px solid #374151", color: "#f1f5f9", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" },
  modalBtnPaid: { background: "linear-gradient(135deg,#f97316,#ea580c)", border: "none", color: "#fff", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" },
  badgeFree: { background: "#22c55e", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11 },
  badgePaid: { background: "#ffffff22", borderRadius: 6, padding: "2px 8px", fontSize: 11 },
  modalLink: { background: "transparent", border: "none", color: "#f97316", fontSize: 13, cursor: "pointer", fontWeight: 600 },
};
