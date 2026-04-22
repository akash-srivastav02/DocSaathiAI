import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

// ─── Canvas-based merger — runs entirely in browser (no backend needed) ───────
// Outputs a single JPG image with photo on left, signature + date on right

const DATE_OPTIONS = [
  { id: "today",  label: "Today's Date",   desc: "Auto-filled with current date" },
  { id: "dob",    label: "Date of Birth",  desc: "Enter your DOB manually" },
  { id: "none",   label: "No Date",        desc: "Only photo + signature" },
];

function UploadBox({ label, icon, file, preview, onFile, disabled, accept = "image/*" }) {
  return (
    <div style={bx.wrap}>
      <p style={bx.label}>{label}</p>
      <div
        style={{
          ...bx.zone,
          borderColor: preview ? "#f97316" : "#374151",
          opacity: disabled ? 0.4 : 1,
          pointerEvents: disabled ? "none" : "auto",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={() => document.getElementById(`inp-${label}`).click()}
      >
        {preview ? (
          <img src={preview} alt={label} style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6 }} />
        ) : (
          <>
            <span style={{ fontSize: 32, marginBottom: 6 }}>{icon}</span>
            <p style={bx.uploadText}>Click to upload</p>
            <p style={bx.uploadSub}>{accept === "image/*" ? "JPG, PNG, WEBP" : accept.toUpperCase()}</p>
          </>
        )}
      </div>
      <input id={`inp-${label}`} type="file" accept={accept} style={{ display: "none" }}
        onChange={(e) => onFile(e.target.files[0])} />
      {file && <p style={bx.fname}>{file.name} · {Math.round(file.size / 1024)} KB</p>}
    </div>
  );
}

const bx = {
  wrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: { color: "#94a3b8", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: 0 },
  zone: { border: "2px dashed", borderRadius: 12, minHeight: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#111827", transition: "border-color 0.2s", padding: 12 },
  uploadText: { color: "#94a3b8", fontSize: 13, fontWeight: 600, margin: 0 },
  uploadSub: { color: "#475569", fontSize: 11, marginTop: 3 },
  fname: { color: "#64748b", fontSize: 11, margin: 0 },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MergerPage() {
  const navigate = useNavigate();
  const { user, credits, updateCredits, logout } = useStore();
  const [activeNav, setActiveNav]     = useState("Dashboard");
  const [showPricing, setShowPricing] = useState(false);
  const currentCredits = credits ?? user?.credits ?? 0;

  const [photoFile, setPhotoFile]   = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signFile, setSignFile]     = useState(null);
  const [signPreview, setSignPreview] = useState(null);
  const [dateOption, setDateOption] = useState("today");
  const [dob, setDob]               = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone]             = useState(false);
  const [outputUrl, setOutputUrl]   = useState(null);
  const [error, setError]           = useState("");
  const canvasRef = useRef(null);

  const handlePhoto = (f) => {
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
    setDone(false);
  };

  const handleSign = (f) => {
    if (!f) return;
    setSignFile(f);
    setSignPreview(URL.createObjectURL(f));
    setDone(false);
  };

  const loadImage = (src) => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

  const getTodayStr = () => {
    const d = new Date();
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handleMerge = async () => {
    if (!photoFile) { setError("Please upload your photo."); return; }
    if (!signFile)  { setError("Please upload your signature."); return; }
    if (dateOption === "dob" && !dob) { setError("Please enter your date of birth."); return; }
    if (currentCredits < 6) { setError("You need 6 credits for this feature."); return; }

    setProcessing(true);
    setError("");

    try {
      const photoImg = await loadImage(photoPreview);
      const signImg  = await loadImage(signPreview);

      // Canvas: 800 × 350 px
      const canvas = canvasRef.current;
      canvas.width  = 800;
      canvas.height = 350;
      const ctx = canvas.getContext("2d");

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 350);

      // ── Left panel: Photo (300×350 area, centered) ────────────────────
      const photoMaxW = 280, photoMaxH = 330;
      const photoRatio = Math.min(photoMaxW / photoImg.width, photoMaxH / photoImg.height);
      const photoW = photoImg.width  * photoRatio;
      const photoH = photoImg.height * photoRatio;
      const photoX = 10 + (photoMaxW - photoW) / 2;
      const photoY = (350 - photoH) / 2;
      ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);

      // ── Divider ───────────────────────────────────────────────────────
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(310, 20);
      ctx.lineTo(310, 330);
      ctx.stroke();

      // ── Right panel ───────────────────────────────────────────────────
      // Label: "Signature"
      ctx.fillStyle = "#94a3b8";
      ctx.font      = "bold 12px Segoe UI, sans-serif";
      ctx.fillText("SIGNATURE", 330, 30);

      // Signature image (max 420×140)
      const signMaxW = 430, signMaxH = 130;
      const signRatio = Math.min(signMaxW / signImg.width, signMaxH / signImg.height);
      const signW = signImg.width  * signRatio;
      const signH = signImg.height * signRatio;
      const signX = 330 + (signMaxW - signW) / 2;
      ctx.drawImage(signImg, signX, 40, signW, signH);

      // Signature underline
      ctx.strokeStyle = "#334155";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(330, 180);
      ctx.lineTo(770, 180);
      ctx.stroke();

      // ── Date section ──────────────────────────────────────────────────
      if (dateOption !== "none") {
        const dateStr = dateOption === "today" ? getTodayStr() : dob;

        ctx.fillStyle = "#94a3b8";
        ctx.font      = "bold 12px Segoe UI, sans-serif";
        ctx.fillText(dateOption === "today" ? "DATE" : "DATE OF BIRTH", 330, 220);

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(330, 230, 430, 48);

        ctx.fillStyle = "#f1f5f9";
        ctx.font      = "bold 22px Segoe UI, sans-serif";
        ctx.fillText(dateStr, 350, 262);
      }

      // ── Watermark if no credits ───────────────────────────────────────
      if (currentCredits < 6) {
        ctx.fillStyle = "rgba(249,115,22,0.15)";
        ctx.font      = "bold 48px Segoe UI";
        ctx.save();
        ctx.translate(400, 175);
        ctx.rotate(-20 * Math.PI / 180);
        ctx.fillText("Doc Saathi AI", -160, 0);
        ctx.restore();
      }

      // ── Export ────────────────────────────────────────────────────────
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      setOutputUrl(dataUrl);
      setDone(true);

      // Deduct 6 credits
      updateCredits(Math.max(0, currentCredits - 6));

    } catch (err) {
      setError("Merge failed. Please check your image files and try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const link  = document.createElement("a");
    link.href   = outputUrl;
    link.download = "docsaathi_merged.jpg";
    link.click();
  };

  const handleReset = () => {
    setPhotoFile(null); setPhotoPreview(null);
    setSignFile(null);  setSignPreview(null);
    setDone(false); setOutputUrl(null); setError("");
  };

  return (
    <div style={s.root}>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <Sidebar credits={currentCredits} activeNav={activeNav}
        setActiveNav={setActiveNav} setShowPricing={setShowPricing}
        onLogout={() => { logout(); navigate("/"); }} />

      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} setShowPricing={setShowPricing} />

        <div style={s.content}>
          {/* Header */}
          <div style={s.toolHeader}>
            <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Back</button>
            <div style={s.toolIconWrap}>🪪</div>
            <div>
              <h2 style={s.toolTitle}>Photo + Sign / Date Merger</h2>
              <p style={s.toolDesc}>
                Combine photo, signature & date on one document · <b style={{ color: "#f59e0b" }}>⚡ 6 credits</b>
              </p>
            </div>
          </div>

          {currentCredits < 6 && (
            <div style={s.warnBox}>
              ⚠️ You need <b>6 credits</b> but only have <b>{currentCredits}</b>.{" "}
              <span style={s.link} onClick={() => navigate("/pricing")}>Buy credits →</span>
            </div>
          )}

          {/* Step 1: Uploads */}
          <div style={s.card}>
            <div style={s.stepBadge}>Step 1 — Upload Images</div>
            <div style={s.uploadGrid}>
              <UploadBox label="Photo" icon="📸" file={photoFile}
                preview={photoPreview} onFile={handlePhoto} disabled={done} />
              <UploadBox label="Signature" icon="✍️" file={signFile}
                preview={signPreview} onFile={handleSign} disabled={done} />
            </div>
          </div>

          {/* Step 2: Date option */}
          <div style={s.card}>
            <div style={s.stepBadge}>Step 2 — Date Option</div>
            <div style={s.dateGrid}>
              {DATE_OPTIONS.map((d) => (
                <button key={d.id}
                  style={{
                    ...s.dateBtn,
                    borderColor: dateOption === d.id ? "#f59e0b" : "#374151",
                    background:  dateOption === d.id ? "#f59e0b18" : "#111827",
                    color:       dateOption === d.id ? "#f59e0b" : "#94a3b8",
                  }}
                  onClick={() => setDateOption(d.id)} disabled={done}
                >
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{d.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{d.desc}</span>
                </button>
              ))}
            </div>

            {dateOption === "dob" && (
              <input
                type="text" placeholder="DD/MM/YYYY"
                value={dob} onChange={(e) => setDob(e.target.value)}
                style={s.dobInput} disabled={done}
              />
            )}

            {dateOption === "today" && (
              <p style={s.datePreview}>
                📅 Will use today's date: <b style={{ color: "#f59e0b" }}>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}</b>
              </p>
            )}
          </div>

          {error && <div style={s.errorBox}>❌ {error}</div>}

          {/* Merge button */}
          {!done && (
            <button
              style={{ ...s.btnPrimary, opacity: (!photoFile || !signFile || processing) ? 0.5 : 1 }}
              onClick={handleMerge}
              disabled={processing || !photoFile || !signFile}
            >
              {processing
                ? <><span style={s.spinner} /> Merging...</>
                : "🪪 Merge Now (6 Credits)"}
            </button>
          )}

          {/* Result */}
          {done && outputUrl && (
            <div style={s.resultCard}>
              <p style={s.resultTitle}>✅ Merge Complete!</p>
              <img src={outputUrl} alt="merged" style={s.resultImg} />
              <div style={s.resultActions}>
                <button onClick={handleDownload} style={s.btnPrimary}>📥 Download JPG</button>
                <button onClick={handleReset} style={s.btnSecondary}>🔄 Merge Another</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#070c18", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 48 },
  content: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },

  toolHeader: { display: "flex", alignItems: "center", gap: 14 },
  backBtn: { background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0 },
  toolIconWrap: { width: 50, height: 50, borderRadius: 13, background: "#f59e0b18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 },
  toolTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 19, margin: 0 },
  toolDesc: { color: "#64748b", fontSize: 13, marginTop: 3 },

  warnBox: { background: "#451a0320", border: "1px solid #92400e", borderRadius: 10, padding: "10px 16px", color: "#fbbf24", fontSize: 13 },

  card: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 16, padding: 20 },
  stepBadge: { display: "inline-block", background: "#f59e0b", color: "#000", borderRadius: 6, padding: "3px 12px", fontSize: 11, fontWeight: 800, marginBottom: 16 },

  uploadGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },

  dateGrid: { display: "flex", gap: 10, flexWrap: "wrap" },
  dateBtn: { flex: 1, minWidth: 140, border: "1px solid", borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 2, transition: "all 0.15s" },
  dobInput: { background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 16, outline: "none", marginTop: 14, width: 180 },
  datePreview: { color: "#64748b", fontSize: 13, marginTop: 12 },

  errorBox: { background: "#450a0a20", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 16px", color: "#fca5a5", fontSize: 14 },

  btnPrimary: { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", transition: "opacity 0.2s" },
  btnSecondary: { background: "#1e293b", color: "#94a3b8", border: "1px solid #374151", borderRadius: 12, padding: "11px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  spinner: { display: "inline-block", width: 16, height: 16, border: "2px solid #00000044", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  resultCard: { background: "#0d1421", border: "1px solid #14532d", borderRadius: 16, padding: 24, textAlign: "center" },
  resultTitle: { color: "#86efac", fontWeight: 800, fontSize: 18, margin: "0 0 16px" },
  resultImg: { maxWidth: "100%", borderRadius: 10, marginBottom: 18, border: "1px solid #1e293b" },
  resultActions: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
};
