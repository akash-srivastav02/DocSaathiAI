import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import API from "../api/axios";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

// ── All tools with correct credit costs ──────────────────────────────────────
const FEATURES = {
  photo:       { icon: "📸", label: "Exam Photo",       credit: 3, color: "#3b82f6", desc: "Resize & compress photo per exam spec", needsExam: true },
  signature:   { icon: "✍️", label: "Exam Signature",   credit: 2, color: "#8b5cf6", desc: "Format signature for any exam",         needsExam: true },
  imgcompress: { icon: "🖼️", label: "Image Compressor", credit: 1, color: "#a78bfa", desc: "Compress image to target KB",           needsExam: false },
  crop:        { icon: "✂️", label: "Crop & Resize",    credit: 1, color: "#ec4899", desc: "Crop image with aspect ratio lock",     needsExam: false },
  pdfeditor:   { icon: "📝", label: "PDF Editor",       credit: 2, color: "#ef4444", desc: "Edit Admit Cards & form PDFs",          needsExam: false },
  resume:      { icon: "📄", label: "Resume Builder",   credit: 3, color: "#22c55e", desc: "Professional exam-ready CV templates",  needsExam: false },
};

const FALLBACK_EXAMS = [
  "SSC CGL","SSC CHSL","SSC MTS","SSC GD",
  "SBI PO","SBI Clerk","IBPS PO","IBPS Clerk","IBPS RRB",
  "RRB NTPC","RRB Group D","RRB JE",
  "UPSC CSE","UPSC CDS","UPSC NDA",
  "Delhi Police Constable","Delhi Police SI","Delhi Police Head Constable",
  "JEE Main","JEE Advanced","NEET UG","NEET PG",
  "CUET UG","CUET PG",
  "UP Police Constable","UP Police SI","MP Police","Rajasthan Police",
  "Bihar Police","Haryana Police","HP Police",
  "DRDO","ISRO","HAL","BEL",
  "LIC AAO","LIC HFL","NIACL AO",
  "NDA","AFCAT","CDS",
  "GATE","ESE (IES)","CSIR NET","UGC NET",
  "CTET","DSSSB","KVS","NVS",
  "Agniveer Army","Agniveer Navy","Agniveer Air Force",
];

// ─── SpecBox ──────────────────────────────────────────────────────────────────
function SpecBox({ label, val, icon }) {
  return (
    <div style={s.specBox}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={s.specLabel}>{label}</div>
        <div style={s.specVal}>{val}</div>
      </div>
    </div>
  );
}

// ─── Watermark Modal ──────────────────────────────────────────────────────────
function WatermarkModal({ onDownloadFree, onBuyPlan }) {
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
        <h3 style={s.modalTitle}>Credits Exhausted</h3>
        <p style={s.modalDesc}>Your file is ready but will carry a watermark.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
          <button style={s.modalBtnFree} onClick={onDownloadFree}>
            📥 Download with Watermark <span style={s.badgeFree}>FREE</span>
          </button>
          <button style={s.modalBtnPaid} onClick={() => onBuyPlan()}>
            ✨ Remove Watermark <span style={s.badgePaid}>₹9 Single Fix</span>
          </button>
        </div>
        <button style={s.modalLink} onClick={onBuyPlan}>Or buy a plan →</button>
      </div>
    </div>
  );
}

// ─── Camera Modal ─────────────────────────────────────────────────────────────
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
        <h3 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 17, margin: "0 0 10px" }}>📷 Live Camera</h3>
        {camError ? (
          <div style={{ background: "#1e293b", borderRadius: 10, padding: 20, color: "#94a3b8", fontSize: 13, textAlign: "center", marginBottom: 14 }}>
            ❌ Camera permission denied.<br />Allow camera in browser settings, then retry.
          </div>
        ) : (
          <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 14, background: "#000", lineHeight: 0 }}>
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width="100%"
              videoConstraints={{ facingMode: "user", width: 420, height: 320 }}
              onUserMediaError={() => setCamError(true)} style={{ display: "block", width: "100%" }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          {!camError && (
            <button onClick={capture} disabled={capturing}
              style={{ ...s.btnPrimary, flex: 1 }}>
              {capturing ? "Capturing..." : "📸 Capture"}
            </button>
          )}
          <button onClick={onClose}
            style={{ ...s.btnSecondary, flex: camError ? 1 : "unset" }}>
            ✕ {camError ? "Close" : "Cancel"}
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
  const currentCredits = credits ?? user?.credits ?? 0;

  const tool = FEATURES[toolId];

  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [selectedExam, setSelectedExam] = useState("");
  const [examList, setExamList]     = useState(FALLBACK_EXAMS);
  const [liveSpecs, setLiveSpecs]   = useState({});
  const [specsLoading, setSpecsLoading] = useState(true);

  const [processing, setProcessing] = useState(false);
  const [done, setDone]             = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [fieldError, setFieldError] = useState(""); // shows when process clicked without fields

  const [showCamera, setShowCamera]   = useState(false);
  const [showWatermark, setShowWatermark] = useState(false);

  // Load exam specs
  useEffect(() => {
    API.get("/process/exams")
      .then(({ data }) => {
        setExamList(data.map(e => e.name));
        const map = {};
        data.forEach(e => { map[e.name] = e; });
        setLiveSpecs(map);
      })
      .catch(() => {})
      .finally(() => setSpecsLoading(false));
  }, []);

  const liveSpec  = liveSpecs[selectedExam]?.[toolId] ?? null;
  const needsExam = tool?.needsExam ?? false;
  const specBoxes = liveSpec ? [
    { label: "Dimensions", val: `${liveSpec.w} × ${liveSpec.h} px`,       icon: "📐" },
    { label: "Size Range",  val: `${liveSpec.minKB}–${liveSpec.maxKB} KB`, icon: "📦" },
    { label: "Format",      val: "JPG (auto-converted)",                    icon: "🖼️" },
    { label: "Background",  val: "White (auto-applied)",                    icon: "🎨" },
  ] : null;

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
    setDone(false); setResult(null); setError(""); setFieldError("");
  };

  const handleCameraCapture = (capturedFile, previewUrl) => {
    setFile(capturedFile); setPreview(previewUrl);
    setShowCamera(false); setDone(false); setResult(null); setFieldError("");
  };

  const handleProcess = async () => {
    setFieldError("");
    setError("");

    // Validate fields first — show clear message
    if (!file) {
      setFieldError("⬆️ Please upload or capture an image first.");
      return;
    }
    if (needsExam && !selectedExam) {
      setFieldError("📋 Please select your exam from the dropdown.");
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (needsExam) formData.append("examName", selectedExam);

      const endpoint = (toolId === "photo" || toolId === "signature")
        ? `/process/${toolId}`
        : `/process/photo`; // fallback for unbuilt tools

      const { data } = await API.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(data);
      if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);
      setDone(true);
      if (data.hasWatermark) setShowWatermark(true);

      // Save to vault (localStorage)
      try {
        const vaultKey = `vault_${user?._id || "guest"}`;
        const existing = JSON.parse(localStorage.getItem(vaultKey) || "[]");
        existing.unshift({
          id: Date.now(),
          toolType: toolId,
          examName: selectedExam || toolId,
          url: data.url,
          sizeKB: data.sizeKB,
          date: new Date().toISOString(),
        });
        localStorage.setItem(vaultKey, JSON.stringify(existing.slice(0, 50)));
      } catch {}

    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Processing failed.";
      setError(`❌ ${msg}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.url) return;
    try {
      const response = await fetch(result.url);
      const blob     = await response.blob();
      const blobUrl  = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      a.href         = blobUrl;
      a.download     = `docsaathi_${toolId}_${selectedExam || "file"}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // CORS fallback
      const a = document.createElement("a");
      a.href = result.url; a.download = "docsaathi.jpg"; a.click();
    }
    setShowWatermark(false);
  };

  const handleReset = () => {
    setFile(null); setPreview(null); setSelectedExam("");
    setDone(false); setResult(null); setError(""); setFieldError(""); setShowWatermark(false);
  };

  if (!tool) return (
    <div style={{ color: "#fff", padding: 40, fontFamily: "Segoe UI" }}>
      Tool not found.{" "}
      <span style={{ color: "#f97316", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>Go back</span>
    </div>
  );

  return (
    <div style={s.root}>
      {showWatermark && (
        <WatermarkModal
          onDownloadFree={() => { setShowWatermark(false); handleDownload(); }}
          onBuyPlan={() => { setShowWatermark(false); navigate("/pricing"); }}
        />
      )}
      {showCamera && (
        <CameraModal onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}

      <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />

      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} />

        {/* Header */}
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Back</button>
          <div style={{ ...s.toolIcon, background: tool.color + "20", color: tool.color }}>{tool.icon}</div>
          <div>
            <h2 style={s.title}>{tool.label}</h2>
            <p style={s.desc}>{tool.desc} · <b style={{ color: tool.color }}>⚡ {tool.credit} credit{tool.credit > 1 ? "s" : ""}</b></p>
          </div>
        </div>

        {/* Not enough credits warning */}
        {currentCredits < tool.credit && (
          <div style={s.warnBox}>
            ⚠️ Need <b>{tool.credit} credits</b>, have <b>{currentCredits}</b>.{" "}
            <span style={s.link} onClick={() => navigate("/pricing")}>Buy credits →</span>
          </div>
        )}

        {/* Exam selector */}
        {needsExam && (
          <div style={s.card}>
            <label style={s.label}>Select Your Exam</label>
            <select style={{ ...s.select, opacity: done ? 0.5 : 1 }}
              value={selectedExam} onChange={e => setSelectedExam(e.target.value)} disabled={done}>
              <option value="">{specsLoading ? "Loading exams..." : "-- Choose Exam --"}</option>
              {examList.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>

            {selectedExam && specBoxes && (
              <div style={s.specGrid}>
                {specBoxes.map(b => <SpecBox key={b.label} {...b} />)}
              </div>
            )}
            {selectedExam && liveSpec && (
              <p style={s.specNote}>
                ✅ Will resize to <b>{liveSpec.w}×{liveSpec.h}px</b>, compress to <b>{liveSpec.minKB}–{liveSpec.maxKB} KB</b>, white background.
              </p>
            )}
            {selectedExam && !liveSpec && !specsLoading && (
              <p style={s.specNote}>📋 Spec auto-applied during processing.</p>
            )}
          </div>
        )}

        {/* Upload */}
        <div style={s.card}>
          <label style={s.label}>Upload or Capture</label>
          <div
            style={{ ...s.uploadZone, opacity: done ? 0.4 : 1, pointerEvents: done ? "none" : "auto",
              borderColor: preview ? "#f97316" : "#374151" }}
            onClick={() => !done && document.getElementById("fileIn").click()}
          >
            {preview
              ? <img src={preview} alt="preview" style={s.preview} />
              : <>
                  <div style={{ fontSize: 34, marginBottom: 6 }}>⬆️</div>
                  <p style={s.uploadText}>Click to Upload or Drag & Drop</p>
                  <p style={s.uploadSub}>JPG, PNG, WEBP supported</p>
                </>
            }
          </div>
          <input id="fileIn" type="file" accept="image/*" style={{ display: "none" }}
            onChange={handleFileChange} disabled={done} />
          <div style={s.uploadBtns}>
            <button style={{ ...s.btnSecondary, opacity: done ? 0.4 : 1 }}
              onClick={() => !done && document.getElementById("fileIn").click()} disabled={done}>
              📁 Browse File
            </button>
            <button style={{ ...s.btnSecondary, opacity: done ? 0.4 : 1 }}
              onClick={() => !done && setShowCamera(true)} disabled={done}>
              📷 Live Camera
            </button>
          </div>
        </div>

        {/* Field validation error — shown BEFORE process, bright and clear */}
        {fieldError && (
          <div style={s.fieldErrorBox}>{fieldError}</div>
        )}

        {/* API error */}
        {error && (
          <div style={s.errorBox}>{error}</div>
        )}

        {/* Process button */}
        {!done && (
          <div style={{ padding: "14px 24px 0" }}>
            <button style={s.btnPrimary} onClick={handleProcess} disabled={processing}>
              {processing
                ? <><span style={s.spinner} /> Processing...</>
                : `⚡ Process Now (${tool.credit} credit${tool.credit > 1 ? "s" : ""})`}
            </button>
          </div>
        )}

        {/* Result */}
        {done && result && (
          <div style={s.resultCard}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
            <h3 style={s.resultTitle}>Your file is ready!</h3>
            <p style={s.resultSub}>
              <b>{result.sizeKB} KB</b> · <b>{result.dimensions}</b>
              {result.withinRange ? " · ✅ Within exam range" : " · ✅ Within max limit"}
              {result.hasWatermark ? " · ⚠️ Has Watermark" : ""}
            </p>
            <div style={s.resultBtns}>
              <button onClick={handleDownload} style={s.btnPrimary}>📥 Download</button>
              <button onClick={handleReset} style={s.btnSecondary}>🔄 Process Another</button>
            </div>
            {result.hasWatermark && (
              <p style={{ color: "#fca57a", fontSize: 12, marginTop: 12 }}>
                Remove watermark →{" "}
                <span style={s.link} onClick={() => navigate("/pricing")}>Buy a plan (from ₹9)</span>
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
  main: { flex: 1, overflowY: "auto", paddingBottom: 48 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },

  header: { display: "flex", alignItems: "center", gap: 14, padding: "18px 24px 0" },
  backBtn: { background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0 },
  toolIcon: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  title: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: 0 },
  desc: { color: "#64748b", fontSize: 13, marginTop: 3 },

  warnBox: { margin: "12px 24px 0", background: "#451a0320", border: "1px solid #92400e", borderRadius: 10, padding: "10px 14px", color: "#fbbf24", fontSize: 13 },

  card: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 14, margin: "14px 24px 0", padding: 18 },
  label: { display: "block", color: "#94a3b8", fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 },
  select: { width: "100%", background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" },
  specGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 },
  specBox: { background: "#111827", borderRadius: 9, padding: "9px 12px", display: "flex", alignItems: "center", gap: 9 },
  specLabel: { color: "#64748b", fontSize: 10, marginBottom: 1 },
  specVal: { color: "#f97316", fontWeight: 700, fontSize: 13 },
  specNote: { color: "#86efac", fontSize: 12, marginTop: 10, lineHeight: 1.5 },

  uploadZone: { border: "2px dashed", borderRadius: 12, minHeight: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111827", marginBottom: 10, overflow: "hidden", transition: "all 0.2s", cursor: "pointer" },
  uploadText: { color: "#94a3b8", fontWeight: 600, fontSize: 14, margin: 0 },
  uploadSub: { color: "#475569", fontSize: 11, marginTop: 3 },
  preview: { maxWidth: "100%", maxHeight: 200, display: "block" },
  uploadBtns: { display: "flex", gap: 10 },

  // Field error — bright yellow, prominent
  fieldErrorBox: { margin: "10px 24px 0", background: "#451a0380", border: "1px solid #f59e0b", borderRadius: 10, padding: "12px 16px", color: "#fbbf24", fontSize: 14, fontWeight: 600 },
  errorBox: { margin: "10px 24px 0", background: "#450a0a40", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 14 },

  btnPrimary: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" },
  btnSecondary: { background: "#1e293b", color: "#94a3b8", border: "1px solid #374151", borderRadius: 12, padding: "11px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 },
  spinner: { display: "inline-block", width: 15, height: 15, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  resultCard: { margin: "14px 24px 0", background: "#052e16", border: "1px solid #14532d", borderRadius: 14, padding: 24, textAlign: "center" },
  resultTitle: { color: "#86efac", fontWeight: 800, fontSize: 18, margin: 0 },
  resultSub: { color: "#64748b", fontSize: 13, marginTop: 5, marginBottom: 0 },
  resultBtns: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 16 },

  overlay: { position: "fixed", inset: 0, background: "#000000aa", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#0d1421", border: "1px solid #374151", borderRadius: 18, padding: "26px 22px", maxWidth: 360, width: "100%", textAlign: "center" },
  modalTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: "0 0 8px" },
  modalDesc: { color: "#94a3b8", fontSize: 13, marginBottom: 18, lineHeight: 1.5 },
  modalBtnFree: { background: "#1e293b", border: "1px solid #374151", color: "#f1f5f9", borderRadius: 11, padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
  modalBtnPaid: { background: "linear-gradient(135deg,#f97316,#ea580c)", border: "none", color: "#fff", borderRadius: 11, padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
  badgeFree: { background: "#22c55e", color: "#fff", borderRadius: 5, padding: "2px 7px", fontSize: 11 },
  badgePaid: { background: "#ffffff22", borderRadius: 5, padding: "2px 7px", fontSize: 11 },
  modalLink: { background: "transparent", border: "none", color: "#f97316", fontSize: 13, cursor: "pointer", fontWeight: 600 },
};
