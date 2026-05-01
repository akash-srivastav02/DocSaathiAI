import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import useStore from "../store/useStore";
import AuthModal from "../components/AuthModal";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import useIsMobile from "../hooks/useIsMobile";

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
            <span style={s.uploadIcon}>{icon}</span>
            <p style={s.uploadPrimaryText}>Click to upload</p>
            <p style={s.uploadSecondaryText}>JPG, PNG, WEBP</p>
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
          <span key={index} style={s.previewWatermarkText}>FORMFIXER PREVIEW</span>
        ))}
      </div>
    </div>
  );
}

function ModeCard({ accent, badge, title, description, selected, onClick, isMobile }) {
  return (
    <button
      style={{
        ...s.modeBtn,
        ...(isMobile ? s.modeBtnMobile : {}),
        borderColor: selected ? accent : "#374151",
        background: selected ? `${accent}18` : "#111827",
      }}
      onClick={onClick}
    >
      <span style={{ ...s.modeIcon, color: accent, background: `${accent}18` }}>{badge}</span>
      <div style={s.modeCopy}>
        <p style={{ ...s.modeTitle, color: selected ? accent : "#f1f5f9" }}>{title}</p>
        <p style={s.modeDescription}>{description}</p>
        <span style={{ ...s.creditBadge, color: accent, borderColor: `${accent}44` }}>6 credits on download</span>
      </div>
    </button>
  );
}

export default function MergerPage() {
  const navigate = useNavigate();
  const { user, credits, updateCredits, logout } = useStore();
  const isMobile = useIsMobile(640);
  const currentCredits = user ? (credits ?? user?.credits ?? 0) : 0;
  const canvasRef = useRef(null);

  const [mode, setMode] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signFile, setSignFile] = useState(null);
  const [signPreview, setSignPreview] = useState(null);
  const [dateType, setDateType] = useState("today");
  const [dobValue, setDobValue] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [outputUrl, setOutputUrl] = useState(null);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
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
          examName: mode === "sign" ? "Photo + Signature" : "Photo + Date",
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

  const handleDownloadAfterAuth = async () => {
    if (!outputUrl) return;
    setError("");

    try {
      if (!downloadUnlocked) {
        setDownloading(true);
        const { data } = await API.post("/process/confirm-download", {
          toolType: "merger",
          examName: mode === "sign" ? "photo-signature-merger" : "photo-date-merger",
        });
        if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);
        setDownloadUnlocked(true);
      }

      const a = document.createElement("a");
      a.href = outputUrl;
      a.download = `formfixer_${mode === "sign" ? "photo-signature" : "photo-date"}_merged.jpg`;
      a.click();
    } catch (err) {
      setError(err.response?.data?.message || "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    await handleDownloadAfterAuth();
  };

  const handleReset = () => {
    setMode(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setSignFile(null);
    setSignPreview(null);
    setDobValue("");
    setDateType("today");
    setDone(false);
    setOutputUrl(null);
    setError("");
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
          title="Login to Download JPG"
          subtitle="Merged preview guest mode me available hai. Final clean JPG download ke liye login chahiye."
        />
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
      {user && <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />}

      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : (
          <div style={{ ...s.guestBar, ...(isMobile ? s.guestBarMobile : {}) }}>
            <span style={s.guestBarText}>Preview freely. Login sirf final merged JPG download par chahiye.</span>
            <button style={s.guestLoginBtn} onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          </div>
        )}

        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : {}) }}>
          <div style={{ ...s.header, ...(isMobile ? s.headerMobile : {}) }}>
            <div style={{ ...s.headerActions, ...(isMobile ? s.headerActionsMobile : {}) }}>
              <button style={s.backBtn} onClick={() => navigate(user ? "/dashboard" : "/")}>Back</button>
              <div style={s.headerIcon}>MX</div>
            </div>
            <div style={{ ...s.headerCopy, ...(isMobile ? s.headerCopyMobile : {}) }}>
              <h2 style={s.headerTitle}>Photo + Sign / Date Merger</h2>
              <p style={s.headerDesc}>Preview watermarked rahega. Final JPG download par hi {creditCost} credits cut honge.</p>
            </div>
          </div>

          {!downloadUnlocked && user && currentCredits < creditCost && mode && (
            <div style={s.warnBox}>
              Download ke liye <b>{creditCost} credits</b> chahiye, aapke paas <b>{currentCredits}</b> hain.{" "}
              <span style={s.link} onClick={() => navigate("/pricing")}>Buy credits</span>
            </div>
          )}

          <div style={s.card}>
            <div style={s.stepBadge}>Step 1 - Choose What to Merge</div>
            <div style={{ ...s.modeGrid, ...(isMobile ? s.modeGridMobile : {}) }}>
              <ModeCard
                accent="#f59e0b"
                badge="DT"
                title="Photo + Date"
                description="Passport-style photo on top, date in bottom strip."
                selected={mode === "date"}
                onClick={() => { setMode("date"); setDone(false); setOutputUrl(null); setDownloadUnlocked(false); }}
                isMobile={isMobile}
              />
              <ModeCard
                accent="#8b5cf6"
                badge="SG"
                title="Photo + Signature"
                description="Passport-style photo on top, signature in bottom strip."
                selected={mode === "sign"}
                onClick={() => { setMode("sign"); setDone(false); setOutputUrl(null); setDownloadUnlocked(false); }}
                isMobile={isMobile}
              />
            </div>
          </div>

          {mode === "date" && (
            <div style={s.card}>
              <div style={s.stepBadge}>Step 2 - Upload Photo & Select Date</div>
              <div style={{ ...s.twoCol, ...(isMobile ? s.twoColMobile : {}) }}>
                <UploadBox label="Your Photo" icon="PH" preview={photoPreview} onFile={handlePhoto} disabled={done} />
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
              <div style={{ ...s.twoCol, ...(isMobile ? s.twoColMobile : {}) }}>
                <UploadBox label="Your Photo" icon="PH" preview={photoPreview} onFile={handlePhoto} disabled={done} />
                <UploadBox label="Your Signature" icon="SG" preview={signPreview} onFile={handleSign} disabled={done} />
              </div>
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
  root: { display: "flex", minHeight: "100vh", background: "transparent", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 48 },
  guestBar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 24px 0", color: "var(--ff-text-soft)", fontSize: 13, flexWrap: "wrap" },
  guestBarMobile: { padding: "14px 16px 0", gap: 10, alignItems: "flex-start" },
  guestBarText: { lineHeight: 1.55 },
  guestLoginBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 999, padding: "10px 16px", fontWeight: 700, cursor: "pointer", flexShrink: 0 },
  content: { padding: "18px 24px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 880 },
  contentMobile: { padding: "16px", gap: 14 },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },
  header: { display: "flex", alignItems: "center", gap: 16 },
  headerMobile: { flexDirection: "column", alignItems: "stretch", gap: 12 },
  headerActions: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  headerActionsMobile: { justifyContent: "flex-start" },
  headerCopy: { display: "flex", flexDirection: "column", gap: 4 },
  headerCopyMobile: { textAlign: "left" },
  backBtn: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", color: "var(--ff-text-soft)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, flexShrink: 0 },
  headerIcon: { width: 46, height: 46, borderRadius: 12, background: "#f59e0b18", color: "#f59e0b", border: "1px solid #f59e0b2d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, flexShrink: 0 },
  headerTitle: { color: "var(--ff-text)", fontWeight: 800, fontSize: 18, margin: 0, lineHeight: 1.25 },
  headerDesc: { color: "var(--ff-text-soft)", fontSize: 13, margin: 0, lineHeight: 1.5, maxWidth: 520 },
  warnBox: { background: "#451a0320", border: "1px solid #92400e", borderRadius: 10, padding: "10px 14px", color: "#fbbf24", fontSize: 13, lineHeight: 1.5 },
  card: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 16, padding: 18 },
  stepBadge: { display: "inline-block", background: "#f59e0b", color: "#000", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 800, marginBottom: 14 },
  modeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  modeGridMobile: { gridTemplateColumns: "1fr" },
  modeBtn: { border: "2px solid", borderRadius: 14, padding: "18px 16px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14, textAlign: "left", transition: "all 0.15s", minHeight: 112, width: "100%", boxSizing: "border-box" },
  modeBtnMobile: { minHeight: 0, padding: "16px 14px" },
  modeIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0, border: "1px solid rgba(255,255,255,0.04)" },
  modeCopy: { display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: 4, flex: 1, minWidth: 0 },
  modeTitle: { fontWeight: 700, fontSize: 16, margin: 0, lineHeight: 1.25 },
  modeDescription: { color: "#64748b", fontSize: 12, margin: 0, lineHeight: 1.45 },
  creditBadge: { display: "inline-block", border: "1px solid", borderRadius: 999, padding: "4px 8px", fontSize: 11, fontWeight: 700, marginTop: 6 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  twoColMobile: { gridTemplateColumns: "1fr" },
  inputLabel: { color: "var(--ff-text-soft)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" },
  uploadBox: { border: "2px dashed", borderRadius: 12, minHeight: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--ff-panel)", overflow: "hidden", transition: "border-color 0.2s" },
  uploadIcon: { width: 44, height: 44, borderRadius: 12, background: "var(--ff-panel-soft)", color: "var(--ff-text)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, marginBottom: 8 },
  uploadPrimaryText: { color: "var(--ff-text-soft)", fontSize: 12, fontWeight: 600, margin: 0 },
  uploadSecondaryText: { color: "#475569", fontSize: 11, marginTop: 3 },
  uploadPreview: { maxHeight: 120, maxWidth: "100%", borderRadius: 6 },
  dateOption: { border: "1px solid", borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 3, transition: "all 0.15s", textAlign: "left" },
  dateInput: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 8, padding: "10px 12px", color: "var(--ff-text)", fontSize: 14, outline: "none", width: "100%", marginTop: 4, boxSizing: "border-box" },
  select: { width: "100%", background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 10, padding: "11px 14px", color: "var(--ff-text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  errorBox: { background: "#450a0a40", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 14 },
  btnPrimary: { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" },
  btnSecondary: { background: "var(--ff-panel)", color: "var(--ff-text-soft)", border: "1px solid var(--ff-border)", borderRadius: 12, padding: "11px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  resultCard: { background: "color-mix(in srgb, var(--ff-green) 8%, var(--ff-panel-solid))", border: "1px solid color-mix(in srgb, var(--ff-green) 30%, var(--ff-border))", borderRadius: 14, padding: 22, textAlign: "center" },
  resultTitle: { color: "#86efac", fontWeight: 800, fontSize: 18, margin: "0 0 6px" },
  resultNote: { color: "var(--ff-text-soft)", fontSize: 12, margin: "0 0 14px", lineHeight: 1.6 },
  previewShell: { position: "relative", maxWidth: 420, margin: "0 auto 16px", borderRadius: 10, overflow: "hidden", border: "1px solid var(--ff-border)" },
  resultPreview: { display: "block", width: "100%", borderRadius: 10 },
  previewWatermarkLayer: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", alignContent: "space-evenly", justifyItems: "center", padding: 16, background: "linear-gradient(180deg, rgba(2,6,23,0.06), rgba(2,6,23,0.14))", pointerEvents: "none" },
  previewWatermarkText: { color: "rgba(255,255,255,0.18)", fontWeight: 800, fontSize: 15, letterSpacing: 2, transform: "rotate(-24deg)", textShadow: "0 0 10px rgba(0,0,0,0.35)" },
  resultButtons: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" },
};
