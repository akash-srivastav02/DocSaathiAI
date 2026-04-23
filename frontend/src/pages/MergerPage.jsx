import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const FALLBACK_EXAMS = [
  "SSC CGL","SSC CHSL","SSC MTS","SSC GD",
  "SBI PO","SBI Clerk","IBPS PO","IBPS Clerk","IBPS RRB",
  "RRB NTPC","RRB Group D","UPSC CSE","Delhi Police Constable",
  "JEE Main","NEET UG","NDA","AFCAT","GATE",
  "UP Police","Bihar Police","Agniveer Army",
];

function UploadBox({ label, icon, preview, onFile, disabled }) {
  const id = `inp_${label.replace(/\s/g,"")}`;
  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>{label}</p>
      <div
        style={{
          border: `2px dashed ${preview ? "#f97316" : "#374151"}`,
          borderRadius: 12, minHeight: 130,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer",
          background: "#111827", overflow: "hidden",
          opacity: disabled ? 0.4 : 1, transition: "border-color 0.2s",
        }}
        onClick={() => !disabled && document.getElementById(id).click()}
      >
        {preview
          ? <img src={preview} alt={label} style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6 }} />
          : <>
              <span style={{ fontSize: 30, marginBottom: 6 }}>{icon}</span>
              <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, margin: 0 }}>Click to upload</p>
              <p style={{ color: "#475569", fontSize: 11, marginTop: 3 }}>JPG, PNG, WEBP</p>
            </>
        }
      </div>
      <input id={id} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => onFile(e.target.files[0])} />
    </div>
  );
}

export default function MergerPage() {
  const navigate = useNavigate();
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = credits ?? user?.credits ?? 0;
  const canvasRef = useRef(null);

  // Mode: "date" = Photo + Date, "sign" = Photo + Sign
  const [mode, setMode] = useState(null);

  // Shared
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [exam, setExam]                 = useState("");

  // Date mode
  const [dateType, setDateType]   = useState("today"); // "today" | "dob"
  const [dobValue, setDobValue]   = useState("");

  // Sign mode
  const [signFile, setSignFile]         = useState(null);
  const [signPreview, setSignPreview]   = useState(null);

  const [processing, setProcessing] = useState(false);
  const [done, setDone]             = useState(false);
  const [outputUrl, setOutputUrl]   = useState(null);
  const [error, setError]           = useState("");

  const creditCost = 6; // Both Photo+Date and Photo+Sign cost 6 credits

  const handlePhoto = (f) => { if (!f) return; setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); setDone(false); };
  const handleSign  = (f) => { if (!f) return; setSignFile(f);  setSignPreview(URL.createObjectURL(f));  setDone(false); };

  const loadImage = (src) => new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img); img.onerror = rej; img.src = src;
  });

  const formatDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const todayStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const handleMerge = async () => {
    setError("");
    if (!photoFile) { setError("Please upload your photo."); return; }
    if (mode === "sign" && !signFile) { setError("Please upload your signature."); return; }
    if (mode === "date" && dateType === "dob" && !dobValue) { setError("Please select your date of birth."); return; }
    if (!exam) { setError("Please select your exam."); return; }
    if (currentCredits < creditCost) { setError(`Need ${creditCost} credits, you have ${currentCredits}.`); return; }

    setProcessing(true);
    try {
      const canvas = canvasRef.current;
      canvas.width  = 800;
      canvas.height = 320;
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 320);

      // ── Load & draw photo (left side) ────────────────────────────────
      const photoImg = await loadImage(photoPreview);
      const maxPW = 260, maxPH = 290;
      const pr = Math.min(maxPW / photoImg.width, maxPH / photoImg.height);
      const pw = photoImg.width * pr, ph = photoImg.height * pr;
      const px = 20 + (maxPW - pw) / 2, py = (320 - ph) / 2;
      ctx.drawImage(photoImg, px, py, pw, ph);

      // Photo label box
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(20, 290, 260, 22);
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 11px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PHOTO", 150, 305);
      ctx.textAlign = "left";

      // Divider
      ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(295, 15); ctx.lineTo(295, 305); ctx.stroke();

      // ── Right side ───────────────────────────────────────────────────
      if (mode === "sign") {
        // Signature section
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 11px Segoe UI, sans-serif";
        ctx.fillText("SIGNATURE", 315, 30);

        const signImg = await loadImage(signPreview);
        const maxSW = 440, maxSH = 120;
        const sr = Math.min(maxSW / signImg.width, maxSH / signImg.height);
        const sw = signImg.width * sr, sh = signImg.height * sr;
        const sx = 315 + (maxSW - sw) / 2;
        ctx.drawImage(signImg, sx, 40, sw, sh);

        // Underline
        ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(315, 170); ctx.lineTo(775, 170); ctx.stroke();

        // Exam name
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 11px Segoe UI, sans-serif";
        ctx.fillText("EXAM", 315, 210);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(315, 218, 460, 36);
        ctx.fillStyle = "#f1f5f9";
        ctx.font = "bold 16px Segoe UI, sans-serif";
        ctx.fillText(exam, 325, 241);

      } else {
        // Date section
        const dateStr = dateType === "today" ? todayStr : formatDate(dobValue);
        const dateLabel = dateType === "today" ? "DATE" : "DATE OF BIRTH";

        ctx.fillStyle = "#64748b";
        ctx.font = "bold 11px Segoe UI, sans-serif";
        ctx.fillText(dateLabel, 315, 80);

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(315, 90, 460, 70);
        ctx.fillStyle = "#f97316";
        ctx.font = "bold 32px Segoe UI, sans-serif";
        ctx.fillText(dateStr, 330, 136);

        // Exam name
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 11px Segoe UI, sans-serif";
        ctx.fillText("EXAM", 315, 210);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(315, 218, 460, 36);
        ctx.fillStyle = "#f1f5f9";
        ctx.font = "bold 16px Segoe UI, sans-serif";
        ctx.fillText(exam, 325, 241);
      }

      // Watermark if not enough credits (edge case)
      const output = canvas.toDataURL("image/jpeg", 0.95);
      setOutputUrl(output);
      setDone(true);
      updateCredits(Math.max(0, currentCredits - creditCost));

      // Save to vault
      try {
        const vaultKey = `vault_${user?._id || "guest"}`;
        const existing = JSON.parse(localStorage.getItem(vaultKey) || "[]");
        existing.unshift({ id: Date.now(), toolType: "merger", examName: exam, url: output, sizeKB: Math.round(output.length * 0.75 / 1024), date: new Date().toISOString() });
        localStorage.setItem(vaultKey, JSON.stringify(existing.slice(0, 50)));
      } catch {}

    } catch (err) {
      setError("Merge failed. Please check your image files.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl; a.download = `docsaathi_merged_${exam}.jpg`; a.click();
  };

  const handleReset = () => {
    setMode(null); setPhotoFile(null); setPhotoPreview(null);
    setSignFile(null); setSignPreview(null); setExam("");
    setDobValue(""); setDateType("today");
    setDone(false); setOutputUrl(null); setError("");
  };

  return (
    <div style={s.root}>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} />
        <div style={s.content}>

          {/* Header */}
          <div style={s.hdr}>
            <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Back</button>
            <div style={s.hdrIcon}>🪪</div>
            <div>
              <h2 style={s.hdrTitle}>Photo + Sign / Date Merger</h2>
              <p style={s.hdrDesc}>Combine photo with signature or date for exam forms</p>
            </div>
          </div>

          {currentCredits < (mode === "date" ? 3 : 6) && mode && (
            <div style={s.warnBox}>
              ⚠️ Need <b>{mode === "date" ? 3 : 6} credits</b>, you have <b>{currentCredits}</b>.{" "}
              <span style={s.link} onClick={() => navigate("/pricing")}>Buy credits →</span>
            </div>
          )}

          {/* ── STEP 1: Mode selection ────────────────────── */}
          <div style={s.card}>
            <div style={s.stepBadge}>Step 1 — Choose What to Merge</div>
            <div style={s.modeGrid}>
              <button
                style={{ ...s.modeBtn, borderColor: mode === "date" ? "#f59e0b" : "#374151", background: mode === "date" ? "#f59e0b18" : "#111827" }}
                onClick={() => { setMode("date"); setDone(false); setOutputUrl(null); }}
              >
                <span style={{ fontSize: 28 }}>📅</span>
                <div>
                  <p style={{ color: mode === "date" ? "#f59e0b" : "#f1f5f9", fontWeight: 700, fontSize: 14, margin: "0 0 3px" }}>Photo + Date</p>
                  <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Photo with today's date or your date of birth</p>
                  <span style={{ ...s.creditBadge, color: "#f59e0b", borderColor: "#f59e0b44" }}>⚡ 6 credits</span>
                </div>
              </button>
              <button
                style={{ ...s.modeBtn, borderColor: mode === "sign" ? "#8b5cf6" : "#374151", background: mode === "sign" ? "#8b5cf618" : "#111827" }}
                onClick={() => { setMode("sign"); setDone(false); setOutputUrl(null); }}
              >
                <span style={{ fontSize: 28 }}>✍️</span>
                <div>
                  <p style={{ color: mode === "sign" ? "#8b5cf6" : "#f1f5f9", fontWeight: 700, fontSize: 14, margin: "0 0 3px" }}>Photo + Signature</p>
                  <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Photo alongside your signature on one page</p>
                  <span style={{ ...s.creditBadge, color: "#8b5cf6", borderColor: "#8b5cf644" }}>⚡ 6 credits</span>
                </div>
              </button>
            </div>
          </div>

          {/* ── STEP 2: Inputs (shown only when mode is selected) ─── */}
          {mode === "date" && (
            <div style={s.card}>
              <div style={s.stepBadge}>Step 2 — Upload Photo & Select Date</div>
              <div style={s.twoCol}>
                <UploadBox label="Your Photo" icon="📸" preview={photoPreview} onFile={handlePhoto} disabled={done} />
                <div>
                  <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 10px" }}>Date Type</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      style={{ ...s.dateOpt, borderColor: dateType === "today" ? "#f59e0b" : "#374151", background: dateType === "today" ? "#f59e0b18" : "#111827" }}
                      onClick={() => setDateType("today")} disabled={done}
                    >
                      <span style={{ fontWeight: 700, color: dateType === "today" ? "#f59e0b" : "#f1f5f9", fontSize: 13 }}>📅 Today's Date</span>
                      <span style={{ color: "#64748b", fontSize: 11 }}>{todayStr}</span>
                    </button>
                    <button
                      style={{ ...s.dateOpt, borderColor: dateType === "dob" ? "#f59e0b" : "#374151", background: dateType === "dob" ? "#f59e0b18" : "#111827" }}
                      onClick={() => setDateType("dob")} disabled={done}
                    >
                      <span style={{ fontWeight: 700, color: dateType === "dob" ? "#f59e0b" : "#f1f5f9", fontSize: 13 }}>🎂 Date of Birth</span>
                      <span style={{ color: "#64748b", fontSize: 11 }}>Enter your DOB</span>
                    </button>
                    {dateType === "dob" && (
                      <input type="date" value={dobValue} onChange={e => setDobValue(e.target.value)}
                        style={s.dateInput} disabled={done} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === "sign" && (
            <div style={s.card}>
              <div style={s.stepBadge}>Step 2 — Upload Photo & Signature</div>
              <div style={s.twoCol}>
                <UploadBox label="Your Photo" icon="📸" preview={photoPreview} onFile={handlePhoto} disabled={done} />
                <UploadBox label="Your Signature" icon="✍️" preview={signPreview} onFile={handleSign} disabled={done} />
              </div>
            </div>
          )}

          {/* ── STEP 3: Exam selection ──────────────────────── */}
          {mode && (
            <div style={s.card}>
              <div style={s.stepBadge}>Step 3 — Select Your Exam</div>
              <select style={{ ...s.select, opacity: done ? 0.5 : 1 }}
                value={exam} onChange={e => setExam(e.target.value)} disabled={done}>
                <option value="">-- Choose Exam --</option>
                {FALLBACK_EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>
          )}

          {/* Errors */}
          {error && <div style={s.errorBox}>❌ {error}</div>}

          {/* Process button */}
          {mode && !done && (
            <button
              style={{ ...s.btnPrimary, background: mode === "date" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: mode === "date" ? "#000" : "#fff", opacity: processing ? 0.7 : 1 }}
              onClick={handleMerge} disabled={processing}
            >
              {processing ? <><span style={s.spinner} /> Merging...</> : `🪪 Merge Now (${creditCost} credits)`}
            </button>
          )}

          {/* Result */}
          {done && outputUrl && (
            <div style={s.resultCard}>
              <p style={s.resultTitle}>✅ Merged!</p>
              <img src={outputUrl} alt="merged output" style={{ maxWidth: "100%", borderRadius: 10, marginBottom: 16, border: "1px solid #1e293b" }} />
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
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
  content: { padding: "18px 24px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 800 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },

  hdr: { display: "flex", alignItems: "center", gap: 12 },
  backBtn: { background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0 },
  hdrIcon: { width: 46, height: 46, borderRadius: 12, background: "#f59e0b18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  hdrTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: 0 },
  hdrDesc: { color: "#64748b", fontSize: 13, marginTop: 2 },

  warnBox: { background: "#451a0320", border: "1px solid #92400e", borderRadius: 10, padding: "10px 14px", color: "#fbbf24", fontSize: 13 },

  card: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 14, padding: 18 },
  stepBadge: { display: "inline-block", background: "#f59e0b", color: "#000", borderRadius: 6, padding: "3px 12px", fontSize: 11, fontWeight: 800, marginBottom: 14 },

  modeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  modeBtn: { border: "2px solid", borderRadius: 12, padding: "16px 14px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left", transition: "all 0.15s" },
  creditBadge: { display: "inline-block", border: "1px solid", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginTop: 6 },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  dateOpt: { border: "1px solid", borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3, transition: "all 0.15s", textAlign: "left" },
  dateInput: { background: "#111827", border: "1px solid #374151", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 14, outline: "none", width: "100%", marginTop: 4 },

  select: { width: "100%", background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" },

  errorBox: { background: "#450a0a40", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 14 },

  btnPrimary: { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" },
  btnSecondary: { background: "#1e293b", color: "#94a3b8", border: "1px solid #374151", borderRadius: 12, padding: "11px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  spinner: { display: "inline-block", width: 15, height: 15, border: "2px solid #00000044", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  resultCard: { background: "#0d1421", border: "1px solid #14532d", borderRadius: 14, padding: 22, textAlign: "center" },
  resultTitle: { color: "#86efac", fontWeight: 800, fontSize: 18, margin: "0 0 14px" },
};
