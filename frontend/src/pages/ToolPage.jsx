import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import API from "../api/axios";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

// ─── Fallback exam list ───────────────────────────────────────────────────────
const FALLBACK_EXAMS = [
  "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD",
  "SBI PO", "SBI Clerk", "IBPS PO", "IBPS Clerk", "IBPS RRB",
  "RRB NTPC", "RRB Group D", "RRB JE",
  "UPSC CSE", "UPSC CDS", "UPSC NDA",
  "Delhi Police Constable", "Delhi Police SI",
  "JEE Main", "JEE Advanced", "NEET UG", "NEET PG",
  "CUET UG", "CUET PG",
  "UP Police", "MP Police", "Rajasthan Police",
  "DRDO", "ISRO", "HAL",
  "LIC AAO", "LIC HFL",
  "CAT", "MAT", "XAT",
  "CLAT", "AILET",
  "NDA", "AFCAT", "CDS",
  "GATE", "ESE (IES)",
  "Bihar Police", "Haryana Police",
];

const FEATURES = [
  { id: "photo",       icon: "📸", label: "Exam Photo",     credit: 1,     color: "#3b82f6", desc: "Resize & compress photo per exam spec" },
  { id: "signature",   icon: "✍️", label: "Signature",      credit: 1,     color: "#8b5cf6", desc: "Format your signature for any exam" },
  { id: "crop",        icon: "✂️", label: "Crop Photo",     credit: 1,     color: "#ec4899", desc: "Manual crop with aspect ratio lock" },
  { id: "pdfcompress", icon: "🗜️", label: "PDF Compress",   credit: 1,     color: "#f97316", desc: "Shrink PDF to required KB size" },
  { id: "pdfeditor",   icon: "📝", label: "PDF Editor",     credit: 2,     color: "#ef4444", desc: "Edit Admit Cards & form PDFs" },
  { id: "resume",      icon: "📄", label: "Resume Builder", credit: "1–3", color: "#22c55e", desc: "Professional templates, exam-ready CVs" },
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
function WatermarkModal({ onDownloadFree, onDownloadPaid, onBuyPlan }) {
  return (
    <div style={s.modalOverlay}>
      <div style={s.modal}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h3 style={s.modalTitle}>Credits Exhausted</h3>
        <p style={s.modalDesc}>
          Your file is ready but will have a DocSaathi watermark. Choose an option:
        </p>
        <div style={s.modalActions}>
          <button style={s.modalBtnFree} onClick={onDownloadFree}>
            📥 Download with Watermark
            <span style={s.freeBadge}>FREE</span>
          </button>
          <button style={s.modalBtnPaid} onClick={onDownloadPaid}>
            ✨ Remove Watermark
            <span style={s.priceBadge}>₹10 only</span>
          </button>
        </div>
        <button style={s.modalPlanBtn} onClick={onBuyPlan}>
          Or Buy a Plan & Save More →
        </button>
      </div>
    </div>
  );
}

// ─── CameraModal (FIX 3) ─────────────────────────────────────────────────────
function CameraModal({ onCapture, onClose }) {
  const webcamRef = useRef(null);
  const [camError, setCamError] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    fetch(imageSrc)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        onCapture(file, imageSrc);
      });
  }, [onCapture]);

  return (
    <div style={s.modalOverlay}>
      <div style={{ ...s.modal, maxWidth: 480 }}>
        <h3 style={s.modalTitle}>📷 Live Camera</h3>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
          Position your face clearly in the frame
        </p>
        {camError ? (
          <div style={{ background: "#1e293b", borderRadius: 12, padding: 24,
            color: "#94a3b8", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
            ❌ Camera not accessible.<br />
            Please allow camera permission in your browser and try again.
          </div>
        ) : (
          <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16, background: "#000" }}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ facingMode: "user", width: 400, height: 400 }}
              style={{ display: "block" }}
              onUserMediaError={() => setCamError(true)}
            />
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          {!camError && (
            <button onClick={capture} style={{ ...s.btnPrimary, flex: 1 }}>
              📸 Capture Photo
            </button>
          )}
          <button
            onClick={onClose}
            style={{ ...s.btnSecondary, flex: camError ? 1 : "unset" }}
          >
            ✕ {camError ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ToolPage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const { user, credits, updateCredits, logout } = useStore();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [showPricing, setShowPricing] = useState(false);

  const [selectedExam, setSelectedExam] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Live exam specs from backend
  const [examList, setExamList] = useState(FALLBACK_EXAMS);
  const [liveSpecs, setLiveSpecs] = useState({});
  const [specsLoading, setSpecsLoading] = useState(true);

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

  const tool = FEATURES.find((f) => f.id === toolId);
  const needsExam = ["photo", "signature"].includes(toolId);
  const currentCredits = credits ?? user?.credits ?? 0;

  // Safe credit label
  const creditLabel = (() => {
    const c = tool?.credit;
    if (typeof c === "string") return `${c} credits`;
    return `${c} credit${c > 1 ? "s" : ""}`;
  })();

  // Live spec boxes
  const liveSpec = liveSpecs[selectedExam]?.[toolId] ?? null;
  const specBoxes = liveSpec
    ? [
        { label: "Dimensions", val: `${liveSpec.w} × ${liveSpec.h} px`,       icon: "📐" },
        { label: "Size Range",  val: `${liveSpec.minKB}–${liveSpec.maxKB} KB`, icon: "📦" },
        { label: "Format",      val: "JPG (auto-converted)",                    icon: "🖼️" },
        { label: "Background",  val: "White (auto-applied)",                    icon: "🎨" },
      ]
    : null;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setUploadedImage(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  };

  // FIX 3 — receive captured photo from camera modal
  const handleCameraCapture = (capturedFile, previewUrl) => {
    setFile(capturedFile);
    setUploadedImage(previewUrl);
    setShowCamera(false);
  };

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
      if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);
      setDone(true);
      if (data.hasWatermark) setShowWatermarkModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Processing failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  // FIX 1 — force download via blob (no new tab)
  const handleDownload = async () => {
    if (!result?.url) return;
    try {
      const response = await fetch(result.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `docsaathi_${toolId}_${selectedExam || "file"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(result.url, "_blank"); // fallback
    }
  };

  const handleReset = () => {
    setDone(false);
    setResult(null);
    setFile(null);
    setUploadedImage(null);
    setSelectedExam("");
    setError("");
    setShowWatermarkModal(false);
  };

  if (!tool) return <div style={{ color: "#fff", padding: 40 }}>Tool not found.</div>;

  return (
    <div style={s.root}>

      {/* Modals */}
      {showWatermarkModal && (
        <WatermarkModal
          onDownloadFree={() => { setShowWatermarkModal(false); handleDownload(); }}
          onDownloadPaid={() => setShowWatermarkModal(false)}
          onBuyPlan={() => { setShowWatermarkModal(false); navigate("/pricing"); }}
        />
      )}
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <Sidebar
        credits={currentCredits}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        setShowPricing={setShowPricing}
        onLogout={() => { logout(); navigate("/"); }}
      />

      <div style={s.main}>
        <TopBar
          user={user}
          credits={currentCredits}
          setShowPricing={setShowPricing}
          onLogout={() => { logout(); navigate("/"); }}
        />

        {/* Tool Header */}
        <div style={s.toolHeader}>
          <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Back</button>
          <div style={{ ...s.toolIconBig, background: tool.color + "22", color: tool.color }}>
            {tool.icon}
          </div>
          <div>
            <h2 style={s.toolTitle}>{tool.label}</h2>
            <p style={s.toolDesc}>{tool.desc} · <b>{creditLabel}</b></p>
          </div>
        </div>

        {/* Exam Selector */}
        {needsExam && (
          <div style={s.card}>
            <label style={s.label}>Select Your Exam</label>
            <select
              style={{ ...s.select, opacity: done ? 0.5 : 1 }}
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              disabled={done}
            >
              <option value="">
                {specsLoading ? "Loading exams..." : "-- Choose Exam --"}
              </option>
              {examList.map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>

            {selectedExam && specBoxes && (
              <div style={s.specGrid}>
                {specBoxes.map((b) => (
                  <SpecBox key={b.label} label={b.label} val={b.val} icon={b.icon} />
                ))}
              </div>
            )}
            {selectedExam && !specBoxes && !specsLoading && (
              <p style={s.specNote}>📋 Spec will be applied automatically during processing.</p>
            )}
            {selectedExam && liveSpec && (
              <p style={s.specNote}>
                ✅ Image will be resized to <b>{liveSpec.w}×{liveSpec.h}px</b> and
                compressed to fit <b>{liveSpec.minKB}–{liveSpec.maxKB} KB</b> with white background.
              </p>
            )}
          </div>
        )}

        {/* Upload Card */}
        <div style={s.card}>
          <label style={s.label}>Upload or Capture</label>

          {/* FIX 2 — disabled after processing */}
          <div
            style={{
              ...s.uploadZone,
              opacity: done ? 0.5 : 1,
              pointerEvents: done ? "none" : "auto",
              cursor: done ? "not-allowed" : "pointer",
            }}
            onClick={() => !done && document.getElementById("fileIn").click()}
          >
            {uploadedImage ? (
              <img src={uploadedImage} alt="preview" style={s.preview} />
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 8 }}>⬆️</div>
                <p style={s.uploadText}>Click to Upload or Drag & Drop</p>
                <p style={s.uploadSub}>JPG, PNG, WEBP supported</p>
              </>
            )}
          </div>

          <input
            id="fileIn"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
            disabled={done}
          />

          <div style={s.uploadBtns}>
            {/* FIX 2 — Browse disabled after processing */}
            <button
              style={{
                ...s.btnSecondary,
                opacity: done ? 0.4 : 1,
                cursor: done ? "not-allowed" : "pointer",
              }}
              onClick={() => !done && document.getElementById("fileIn").click()}
              disabled={done}
            >
              📁 Browse File
            </button>

            {/* FIX 3 — Live Camera opens modal */}
            <button
              style={{
                ...s.btnSecondary,
                opacity: done ? 0.4 : 1,
                cursor: done ? "not-allowed" : "pointer",
              }}
              onClick={() => !done && setShowCamera(true)}
              disabled={done}
            >
              📷 Live Camera
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: "#ef4444", padding: "0 28px", fontSize: 14 }}>{error}</p>
        )}

        {/* Process Button */}
        {!done && (
          <div style={{ padding: "0 28px", marginTop: 16 }}>
            <button
              style={{
                ...s.btnPrimary,
                opacity: !file || (needsExam && !selectedExam) ? 0.5 : 1,
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

        {/* Result Card */}
        {done && result && (
          <div style={s.resultCard}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={s.resultTitle}>Your file is ready!</h3>
            <p style={s.resultSub}>
              Size: <b>{result.sizeKB} KB</b> · Dimensions: <b>{result.dimensions}</b>
              {result.withinRange
                ? " · ✅ Within exam range"
                : " · ✅ Accepted (within max limit)"}
              {result.hasWatermark && " · ⚠️ Has Watermark"}
            </p>

            {/* FIX 1 — Download via blob handler */}
            <div style={s.resultActions}>
              <button onClick={handleDownload} style={s.btnPrimary}>
                📥 Download
              </button>
              <button style={s.btnSecondary} onClick={handleReset}>
                🔄 Process Another
              </button>
            </div>

            {result.hasWatermark && (
              <p style={{ color: "#fca57a", fontSize: 13, marginTop: 12 }}>
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
  main: { flex: 1, overflowY: "auto", paddingBottom: 40 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 600 },

  toolHeader: { display: "flex", alignItems: "center", gap: 16, padding: "20px 28px 0" },
  backBtn: { background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  toolIconBig: { width: 56, height: 56, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 },
  toolTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 20, margin: 0 },
  toolDesc: { color: "#64748b", fontSize: 13, marginTop: 4 },

  card: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, margin: "20px 28px 0", padding: 20 },
  label: { display: "block", color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  select: { width: "100%", background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" },

  specGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 },
  specBox: { background: "#111827", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 },
  specLabel: { color: "#64748b", fontSize: 11, marginBottom: 2 },
  specVal: { color: "#f97316", fontWeight: 700, fontSize: 14 },
  specNote: { color: "#86efac", fontSize: 13, marginTop: 10 },

  uploadZone: { border: "2px dashed #374151", borderRadius: 14, minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111827", marginBottom: 12, overflow: "hidden", transition: "opacity 0.2s" },
  uploadText: { color: "#94a3b8", fontWeight: 600, fontSize: 14 },
  uploadSub: { color: "#475569", fontSize: 12, marginTop: 4 },
  preview: { maxWidth: "100%", maxHeight: 200, borderRadius: 8 },
  uploadBtns: { display: "flex", gap: 10 },

  btnPrimary: { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", width: "100%" },
  btnSecondary: { background: "#1e293b", color: "#94a3b8", border: "1px solid #374151", borderRadius: 12, padding: "11px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  spinner: { display: "inline-block", width: 16, height: 16, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  resultCard: { margin: "20px 28px 0", background: "#052e16", border: "1px solid #14532d", borderRadius: 16, padding: 28, textAlign: "center" },
  resultTitle: { color: "#86efac", fontWeight: 800, fontSize: 20, margin: 0 },
  resultSub: { color: "#64748b", fontSize: 13, marginTop: 6, marginBottom: 20 },
  resultActions: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },

  modalOverlay: { position: "fixed", inset: 0, background: "#00000088", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#0d1421", border: "1px solid #374151", borderRadius: 20, padding: "32px 28px", maxWidth: 380, width: "100%", textAlign: "center" },
  modalTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 20, margin: "0 0 8px" },
  modalDesc: { color: "#94a3b8", fontSize: 14, marginBottom: 20 },
  modalActions: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 },
  modalBtnFree: { background: "#1e293b", border: "1px solid #374151", color: "#f1f5f9", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between" },
  modalBtnPaid: { background: "linear-gradient(135deg, #f97316, #ea580c)", border: "none", color: "#fff", borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "space-between" },
  freeBadge: { background: "#22c55e", color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 11 },
  priceBadge: { background: "#ffffff22", borderRadius: 6, padding: "2px 8px", fontSize: 11 },
  modalPlanBtn: { background: "transparent", border: "none", color: "#f97316", fontSize: 13, cursor: "pointer", fontWeight: 600 },
};
