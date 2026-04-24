import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const FALLBACK_EXAMS = [
  "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD",
  "SBI PO", "SBI Clerk", "IBPS PO", "IBPS Clerk", "IBPS RRB",
  "RRB NTPC", "RRB Group D", "UPSC CSE", "Delhi Police Constable",
  "JEE Main", "NEET UG", "NDA", "AFCAT", "GATE",
  "UP Police", "Bihar Police", "Agniveer Army",
];

function UploadBox({ label, icon, preview, onFile, disabled }) {
  const id = `inp_${label.replace(/\s/g, "")}`;

  return (
    <div>
      <p style={s.inputLabel}>{label}</p>
      <div
        style={{
          ...s.uploadBox,
          borderColor: preview ? "#f97316" : "#374151",
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={() => !disabled && document.getElementById(id)?.click()}
      >
        {preview ? (
          <img src={preview} alt={label} style={s.uploadPreview} />
        ) : (
          <>
            <span style={{ fontSize: 30, marginBottom: 6 }}>{icon}</span>
            <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, margin: 0 }}>Click to upload</p>
            <p style={{ color: "#475569", fontSize: 11, marginTop: 3 }}>JPG, PNG, WEBP</p>
          </>
        )}
      </div>
      <input
        id={id}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}

function WatermarkedPreview({ src }) {
  return (
    <div style={s.previewShell}>
      <img src={src} alt="merged output preview" style={s.resultPreview} />
      <div style={s.previewWatermarkLayer}>
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} style={s.previewWatermarkText}>DOCSAATHI PREVIEW</span>
        ))}
      </div>
    </div>
  );
}

export default function MergerPage() {
  const navigate = useNavigate();
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = credits ?? user?.credits ?? 0;
  const canvasRef = useRef(null);

  const [mode, setMode] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signFile, setSignFile] = useState(null);
  const [signPreview, setSignPreview] = useState(null);
  const [exam, setExam] = useState("");
  const [dateType, setDateType] = useState("today");
  const [dobValue, setDobValue] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [outputUrl, setOutputUrl] = useState(null);
  const [error, setError] = useState("");
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const creditCost = 6;

  const handlePhoto = (file) => {
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setDone(false);
    setDownloadUnlocked(false);
  };

  const handleSign = (file) => {
    if (!file) return;
    setSignFile(file);
    setSignPreview(URL.createObjectURL(file));
    setDone(false);
    setDownloadUnlocked(false);
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const drawPortraitLayout = async (ctx) => {
    const canvas = canvasRef.current;
    canvas.width = 1200;
    canvas.height = 1600;

    const photoArea = { x: 34, y: 36, w: 1132, h: 1160 };
    const footerArea = { x: 34, y: 1238, w: 1132, h: 300 };

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const photoImg = await loadImage(photoPreview);
    const photoRatio = Math.min(photoArea.w / photoImg.width, photoArea.h / photoImg.height);
    const photoW = photoImg.width * photoRatio;
    const photoH = photoImg.height * photoRatio;
    const photoX = photoArea.x + (photoArea.w - photoW) / 2;
    const photoY = photoArea.y + (photoArea.h - photoH) / 2;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(photoArea.x, photoArea.y, photoArea.w, photoArea.h);
    ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);

    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(44, 1214);
    ctx.lineTo(canvas.width - 44, 1214);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(footerArea.x, footerArea.y, footerArea.w, footerArea.h);
    ctx.textAlign = "center";

    if (mode === "sign") {
      const signImg = await loadImage(signPreview);
      const maxSignW = footerArea.w - 150;
      const maxSignH = 220;
      const signRatio = Math.min(maxSignW / signImg.width, maxSignH / signImg.height);
      const signW = signImg.width * signRatio;
      const signH = signImg.height * signRatio;
      const signX = footerArea.x + (footerArea.w - signW) / 2;
      const signY = footerArea.y + (footerArea.h - signH) / 2 + 4;
      ctx.drawImage(signImg, signX, signY, signW, signH);
    } else {
      const dateStr = dateType === "today" ? todayStr : formatDate(dobValue);
      ctx.fillStyle = "#111827";
      ctx.font = "700 76px Segoe UI, sans-serif";
      ctx.fillText(dateStr, canvas.width / 2, footerArea.y + 150);
      ctx.fillStyle = "#64748b";
      ctx.font = "600 26px Segoe UI, sans-serif";
      ctx.fillText(dateType === "today" ? "Date" : "Date of Birth", canvas.width / 2, footerArea.y + 220);
    }

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 22px Segoe UI, sans-serif";
    ctx.fillText(exam, canvas.width / 2, canvas.height - 28);
    ctx.textAlign = "left";
  };

  const handleMerge = async () => {
    setError("");

    if (!photoFile) {
      setError("Please upload your photo.");
      return;
    }
    if (mode === "sign" && !signFile) {
      setError("Please upload your signature.");
      return;
    }
    if (mode === "date" && dateType === "dob" && !dobValue) {
      setError("Please select your date of birth.");
      return;
    }
    if (!exam) {
      setError("Please select your exam.");
      return;
    }

    setProcessing(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      await drawPortraitLayout(ctx);

      const output = canvas.toDataURL("image/jpeg", 0.96);
      setOutputUrl(output);
      setDone(true);
      setDownloadUnlocked(false);

      try {
        const vaultKey = `vault_${user?._id || "guest"}`;
        const existing = JSON.parse(localStorage.getItem(vaultKey) || "[]");
        existing.unshift({
          id: Date.now(),
          toolType: "merger",
          examName: exam,
          url: output,
          sizeKB: Math.round((output.length * 0.75) / 1024),
          date: new Date().toISOString(),
        });
        localStorage.setItem(vaultKey, JSON.stringify(existing.slice(0, 50)));
      } catch {}
    } catch {
      setError("Merge failed. Please check your image files.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!outputUrl) return;
    setError("");

    try {
      if (!downloadUnlocked) {
        setDownloading(true);
        const { data } = await API.post("/process/confirm-download", {
          toolType: "merger",
          examName: exam,
        });
        if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);
        setDownloadUnlocked(true);
      }

      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = `docsaathi_merged_${exam}.jpg`;
      a.click();
    } catch (err) {
      setError(err.response?.data?.message || "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setMode(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setSignFile(null);
    setSignPreview(null);
    setExam("");
    setDobValue("");
    setDateType("today");
    setDone(false);
    setOutputUrl(null);
    setError("");
    setDownloadUnlocked(false);
  };

  return (
    <div style={s.root}>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
      <div style={s.main}>
        <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        <div style={s.content}>
          <div style={s.header}>
            <button style={s.backBtn} onClick={() => navigate("/dashboard")}>← Back</button>
            <div style={s.headerIcon}>🪪</div>
            <div>
              <h2 style={s.headerTitle}>Photo + Sign / Date Merger</h2>
              <p style={s.headerDesc}>Preview watermarked rahega. Final JPG download par hi 6 credits cut honge.</p>
            </div>
          </div>

          {!downloadUnlocked && currentCredits < 6 && mode && (
            <div style={s.warnBox}>
              Download ke liye <b>6 credits</b> chahiye, aapke paas <b>{currentCredits}</b> hain.{" "}
              <span style={s.link} onClick={() => navigate("/pricing")}>Buy credits →</span>
            </div>
          )}

          <div style={s.card}>
            <div style={s.stepBadge}>Step 1 - Choose What to Merge</div>
            <div style={s.modeGrid}>
              <button
                style={{ ...s.modeBtn, borderColor: mode === "date" ? "#f59e0b" : "#374151", background: mode === "date" ? "#f59e0b18" : "#111827" }}
                onClick={() => { setMode("date"); setDone(false); setOutputUrl(null); setDownloadUnlocked(false); }}
              >
                <span style={{ fontSize: 28 }}>📅</span>
                <div>
                  <p style={{ color: mode === "date" ? "#f59e0b" : "#f1f5f9", fontWeight: 700, fontSize: 14, margin: "0 0 3px" }}>Photo + Date</p>
                  <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Passport-style photo on top, date in bottom strip.</p>
                  <span style={{ ...s.creditBadge, color: "#f59e0b", borderColor: "#f59e0b44" }}>6 credits on download</span>
                </div>
              </button>

              <button
                style={{ ...s.modeBtn, borderColor: mode === "sign" ? "#8b5cf6" : "#374151", background: mode === "sign" ? "#8b5cf618" : "#111827" }}
                onClick={() => { setMode("sign"); setDone(false); setOutputUrl(null); setDownloadUnlocked(false); }}
              >
                <span style={{ fontSize: 28 }}>✍️</span>
                <div>
                  <p style={{ color: mode === "sign" ? "#8b5cf6" : "#f1f5f9", fontWeight: 700, fontSize: 14, margin: "0 0 3px" }}>Photo + Signature</p>
                  <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Passport-style photo on top, signature in bottom strip.</p>
                  <span style={{ ...s.creditBadge, color: "#8b5cf6", borderColor: "#8b5cf644" }}>6 credits on download</span>
                </div>
              </button>
            </div>
          </div>

          {mode === "date" && (
            <div style={s.card}>
              <div style={s.stepBadge}>Step 2 - Upload Photo & Select Date</div>
              <div style={s.twoCol}>
                <UploadBox label="Your Photo" icon="📸" preview={photoPreview} onFile={handlePhoto} disabled={done} />
                <div>
                  <p style={s.inputLabel}>Date Type</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      style={{ ...s.dateOption, borderColor: dateType === "today" ? "#f59e0b" : "#374151", background: dateType === "today" ? "#f59e0b18" : "#111827" }}
                      onClick={() => setDateType("today")}
                      disabled={done}
                    >
                      <span style={{ fontWeight: 700, color: dateType === "today" ? "#f59e0b" : "#f1f5f9", fontSize: 13 }}>Today's Date</span>
                      <span style={{ color: "#64748b", fontSize: 11 }}>{todayStr}</span>
                    </button>

                    <button
                      style={{ ...s.dateOption, borderColor: dateType === "dob" ? "#f59e0b" : "#374151", background: dateType === "dob" ? "#f59e0b18" : "#111827" }}
                      onClick={() => setDateType("dob")}
                      disabled={done}
                    >
                      <span style={{ fontWeight: 700, color: dateType === "dob" ? "#f59e0b" : "#f1f5f9", fontSize: 13 }}>Date of Birth</span>
                      <span style={{ color: "#64748b", fontSize: 11 }}>Use your DOB in the same bottom strip.</span>
                    </button>

                    {dateType === "dob" && (
                      <input type="date" value={dobValue} onChange={(e) => setDobValue(e.target.value)} style={s.dateInput} disabled={done} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === "sign" && (
            <div style={s.card}>
              <div style={s.stepBadge}>Step 2 - Upload Photo & Signature</div>
              <div style={s.twoCol}>
                <UploadBox label="Your Photo" icon="📸" preview={photoPreview} onFile={handlePhoto} disabled={done} />
                <UploadBox label="Your Signature" icon="✍️" preview={signPreview} onFile={handleSign} disabled={done} />
              </div>
            </div>
          )}

          {mode && (
            <div style={s.card}>
              <div style={s.stepBadge}>Step 3 - Select Your Exam</div>
              <select style={{ ...s.select, opacity: done ? 0.5 : 1 }} value={exam} onChange={(e) => setExam(e.target.value)} disabled={done}>
                <option value="">-- Choose Exam --</option>
                {FALLBACK_EXAMS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          )}

          {error && <div style={s.errorBox}>{error}</div>}

          {mode && !done && (
            <button
              style={{
                ...s.btnPrimary,
                background: mode === "date" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                color: mode === "date" ? "#000" : "#fff",
                opacity: processing ? 0.7 : 1,
              }}
              onClick={handleMerge}
              disabled={processing}
            >
              {processing ? "Generating Preview..." : "Generate Preview"}
            </button>
          )}

          {done && outputUrl && (
            <div style={s.resultCard}>
              <p style={s.resultTitle}>Preview Ready</p>
              <p style={s.resultNote}>Screenshot-safe preview shown below. Final download will be clean.</p>
              <WatermarkedPreview src={outputUrl} />
              <div style={s.resultButtons}>
                <button onClick={handleDownload} style={s.btnPrimary} disabled={downloading}>
                  {downloading
                    ? "Unlocking Download..."
                    : downloadUnlocked
                      ? "Download Again"
                      : "Download Final JPG (6 Credits)"}
                </button>
                <button onClick={handleReset} style={s.btnSecondary}>Merge Another</button>
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
  content: { padding: "18px 24px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 820 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },
  header: { display: "flex", alignItems: "center", gap: 12 },
  backBtn: { background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0 },
  headerIcon: { width: 46, height: 46, borderRadius: 12, background: "#f59e0b18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  headerTitle: { color: "#f1f5f9", fontWeight: 800, fontSize: 18, margin: 0 },
  headerDesc: { color: "#64748b", fontSize: 13, marginTop: 2 },
  warnBox: { background: "#451a0320", border: "1px solid #92400e", borderRadius: 10, padding: "10px 14px", color: "#fbbf24", fontSize: 13 },
  card: { background: "#0d1421", border: "1px solid #1e293b", borderRadius: 14, padding: 18 },
  stepBadge: { display: "inline-block", background: "#f59e0b", color: "#000", borderRadius: 6, padding: "3px 12px", fontSize: 11, fontWeight: 800, marginBottom: 14 },
  modeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  modeBtn: { border: "2px solid", borderRadius: 12, padding: "16px 14px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left", transition: "all 0.15s" },
  creditBadge: { display: "inline-block", border: "1px solid", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginTop: 6 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  inputLabel: { color: "#94a3b8", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" },
  uploadBox: { border: "2px dashed", borderRadius: 12, minHeight: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111827", overflow: "hidden", transition: "border-color 0.2s" },
  uploadPreview: { maxHeight: 120, maxWidth: "100%", borderRadius: 6 },
  dateOption: { border: "1px solid", borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3, transition: "all 0.15s", textAlign: "left" },
  dateInput: { background: "#111827", border: "1px solid #374151", borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 14, outline: "none", width: "100%", marginTop: 4, boxSizing: "border-box" },
  select: { width: "100%", background: "#111827", border: "1px solid #374151", borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" },
  errorBox: { background: "#450a0a40", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 14 },
  btnPrimary: { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" },
  btnSecondary: { background: "#1e293b", color: "#94a3b8", border: "1px solid #374151", borderRadius: 12, padding: "11px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  resultCard: { background: "#0d1421", border: "1px solid #14532d", borderRadius: 14, padding: 22, textAlign: "center" },
  resultTitle: { color: "#86efac", fontWeight: 800, fontSize: 18, margin: "0 0 6px" },
  resultNote: { color: "#cbd5e1", fontSize: 12, margin: "0 0 14px", lineHeight: 1.6 },
  previewShell: { position: "relative", maxWidth: 420, margin: "0 auto 16px", borderRadius: 10, overflow: "hidden", border: "1px solid #1e293b" },
  resultPreview: { display: "block", width: "100%", borderRadius: 10 },
  previewWatermarkLayer: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", alignContent: "space-evenly", justifyItems: "center", padding: 16, background: "linear-gradient(180deg, rgba(2,6,23,0.06), rgba(2,6,23,0.14))", pointerEvents: "none" },
  previewWatermarkText: { color: "rgba(255,255,255,0.18)", fontWeight: 800, fontSize: 15, letterSpacing: 2, transform: "rotate(-24deg)", textShadow: "0 0 10px rgba(0,0,0,0.35)" },
  resultButtons: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" },
};
