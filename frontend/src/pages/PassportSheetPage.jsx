import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "../components/AuthModal";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import API from "../api/axios";
import useStore from "../store/useStore";
import useIsMobile from "../hooks/useIsMobile";

const PAGE_PRESETS = {
  a4: { label: "A4 Portrait", width: 1240, height: 1754 },
  "4x6": { label: "4×6 Print", width: 1200, height: 1800 },
};

const PHOTO_PRESETS = {
  passport: { label: "Passport 35×45mm", width: 295, height: 378 },
  stamp: { label: "Stamp 25×30mm", width: 220, height: 268 },
  square: { label: "Square 1×1", width: 260, height: 260 },
};

const COPY_LAYOUTS = {
  4: { label: "4 Copies", cols: 2, rows: 2 },
  6: { label: "6 Copies", cols: 2, rows: 3 },
  8: { label: "8 Copies", cols: 2, rows: 4 },
  12: { label: "12 Copies", cols: 3, rows: 4 },
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function PreviewSheet({ src }) {
  return (
    <div style={s.previewShell}>
      <img src={src} alt="Passport sheet preview" style={s.previewImage} />
      <div style={s.previewOverlay}>
        {Array.from({ length: 10 }).map((_, index) => (
          <span key={index} style={s.previewWatermark}>FORMFIXER PREVIEW</span>
        ))}
      </div>
    </div>
  );
}

export default function PassportSheetPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(900);
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = user ? (credits ?? user?.credits ?? 0) : 0;

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [pageMode, setPageMode] = useState("a4");
  const [photoPreset, setPhotoPreset] = useState("passport");
  const [copyCount, setCopyCount] = useState("8");
  const [showGuides, setShowGuides] = useState(true);
  const [showLabel, setShowLabel] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("Passport Sheet");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const selectedPage = PAGE_PRESETS[pageMode];
  const selectedPhoto = PHOTO_PRESETS[photoPreset];
  const selectedLayout = COPY_LAYOUTS[copyCount];

  const summary = useMemo(
    () => `${selectedLayout.label} · ${selectedPhoto.label} · ${selectedPage.label}`,
    [selectedLayout.label, selectedPhoto.label, selectedPage.label]
  );

  const handleFileSelection = (chosen) => {
    if (!chosen) return;
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
    setDone(false);
    setResult(null);
    setError("");
    setDownloadUnlocked(false);
  };

  const generateSheet = async () => {
    if (!preview) {
      setError("Please upload a photo first.");
      return;
    }

    setProcessing(true);
    setError("");
    try {
      const img = await loadImage(preview);
      const canvas = document.createElement("canvas");
      canvas.width = selectedPage.width;
      canvas.height = selectedPage.height;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const outerMargin = pageMode === "a4" ? 78 : 62;
      const topLabelHeight = showLabel ? 78 : 0;
      const availableWidth = canvas.width - outerMargin * 2;
      const availableHeight = canvas.height - outerMargin * 2 - topLabelHeight;
      const gapX = 28;
      const gapY = 28;
      const blockWidth = selectedLayout.cols * selectedPhoto.width + (selectedLayout.cols - 1) * gapX;
      const blockHeight = selectedLayout.rows * selectedPhoto.height + (selectedLayout.rows - 1) * gapY;
      const startX = outerMargin + Math.max(0, (availableWidth - blockWidth) / 2);
      const startY = outerMargin + topLabelHeight + Math.max(0, (availableHeight - blockHeight) / 2);

      if (showLabel) {
        ctx.fillStyle = "#0f172a";
        ctx.font = "700 34px Segoe UI";
        ctx.fillText(sheetTitle || "Passport Sheet", outerMargin, outerMargin + 24);
      }

      for (let row = 0; row < selectedLayout.rows; row += 1) {
        for (let col = 0; col < selectedLayout.cols; col += 1) {
          const x = Math.round(startX + col * (selectedPhoto.width + gapX));
          const y = Math.round(startY + row * (selectedPhoto.height + gapY));

          ctx.save();
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, y, selectedPhoto.width, selectedPhoto.height);

          const scale = Math.max(selectedPhoto.width / img.width, selectedPhoto.height / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const drawX = x + (selectedPhoto.width - drawW) / 2;
          const drawY = y + (selectedPhoto.height - drawH) / 2;
          ctx.drawImage(img, drawX, drawY, drawW, drawH);

          if (showGuides) {
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, selectedPhoto.width, selectedPhoto.height);
            ctx.beginPath();
            ctx.moveTo(x - 10, y);
            ctx.lineTo(x + 10, y);
            ctx.moveTo(x, y - 10);
            ctx.lineTo(x, y + 10);
            ctx.moveTo(x + selectedPhoto.width - 10, y);
            ctx.lineTo(x + selectedPhoto.width + 10, y);
            ctx.moveTo(x + selectedPhoto.width, y - 10);
            ctx.lineTo(x + selectedPhoto.width, y + 10);
            ctx.moveTo(x - 10, y + selectedPhoto.height);
            ctx.lineTo(x + 10, y + selectedPhoto.height);
            ctx.moveTo(x, y + selectedPhoto.height - 10);
            ctx.lineTo(x, y + selectedPhoto.height + 10);
            ctx.moveTo(x + selectedPhoto.width - 10, y + selectedPhoto.height);
            ctx.lineTo(x + selectedPhoto.width + 10, y + selectedPhoto.height);
            ctx.moveTo(x + selectedPhoto.width, y + selectedPhoto.height - 10);
            ctx.lineTo(x + selectedPhoto.width, y + selectedPhoto.height + 10);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      const url = canvas.toDataURL("image/jpeg", 0.96);
      setResult({
        url,
        sizeKB: Math.round((url.length * 0.75) / 1024),
        copies: Number(copyCount),
        pageMode,
        photoPreset,
      });
      setDone(true);
      setDownloadUnlocked(false);
    } catch {
      setError("Could not generate the passport photo sheet.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAfterAuth = async () => {
    if (!result?.url) return;
    if (!downloadUnlocked) {
      const { data } = await API.post("/process/confirm-download", {
        toolType: "passportsheet",
        examName: `${selectedPhoto.label} · ${selectedLayout.label}`,
        processedUrl: result.url,
      });
      if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);
      setDownloadUnlocked(true);
    }

    const link = document.createElement("a");
    link.href = result.url;
    link.download = "formfixer_passport_photo_sheet.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async () => {
    if (!user) return setShowAuthModal(true);
    setDownloading(true);
    setError("");
    try {
      await handleDownloadAfterAuth();
    } catch (err) {
      setError(err.response?.data?.message || "Could not unlock download.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setDone(false);
    setResult(null);
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
          title="Login to Download Passport Sheet"
          subtitle="Preview is available first. Final print-ready download needs quick login."
        />
      )}

      {user && (
        <Sidebar
          credits={currentCredits}
          planLabel={user?.planLabel}
          isUnlimited={user?.isUnlimited}
          onLogout={() => { logout(); navigate("/"); }}
        />
      )}

      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : (
          <div style={{ ...s.guestBar, ...(isMobile ? s.guestBarMobile : null) }}>
            <span>Preview first. Login only when you need the final print-ready sheet.</span>
            <button style={s.guestLoginBtn} onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          </div>
        )}

        <div style={{ ...s.content, ...(isMobile ? s.contentMobile : null), ...(user ? s.contentWithFixedTopbar : null) }}>
          <div style={s.toolHeader}>
            <button type="button" style={s.backBtn} onClick={() => navigate(user ? "/dashboard" : "/all-tools")}>Back</button>
            <div>
              <h1 style={s.toolTitle}>Passport Photo Sheet Maker</h1>
              <p style={s.toolDesc}>Create 4, 6, 8, or 12 print-ready photo copies on one page for passport, ID, studio, and form-print use.</p>
            </div>
          </div>

          <div style={{ ...s.workspace, ...(isMobile ? s.workspaceMobile : null) }}>
            <div style={s.uploadPanel}>
              <div style={s.panelLabel}>Upload Photo</div>
              <div
                style={{
                  ...s.uploadZone,
                  borderColor: preview ? "#a855f7" : "var(--ff-border)",
                  opacity: done ? 0.5 : 1,
                  pointerEvents: done ? "none" : "auto",
                }}
                onClick={() => !done && document.getElementById("passportSheetInput")?.click()}
              >
                {preview ? (
                  <img src={preview} alt="passport source" style={s.previewInline} />
                ) : (
                  <>
                    <div style={s.bigIcon}>PS</div>
                    <p style={s.uploadText}>Upload / Drop Passport Photo</p>
                    <p style={s.uploadSub}>Use a clear photo with plain background for best sheet output.</p>
                  </>
                )}
              </div>
              <input
                id="passportSheetInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelection(e.target.files?.[0])}
              />
              <div style={s.uploadActions}>
                <button type="button" style={s.btnSecondary} onClick={() => !done && document.getElementById("passportSheetInput")?.click()} disabled={done}>Browse File</button>
              </div>
            </div>

            <div style={s.configPanel}>
              <div style={s.panelLabel}>Configuration</div>

              <div style={s.configCard}>
                <div style={s.configTitle}>Photo Size</div>
                <div style={s.optionGrid}>
                  {Object.entries(PHOTO_PRESETS).map(([id, item]) => (
                    <button
                      key={id}
                      type="button"
                      style={{
                        ...s.optionBtn,
                        borderColor: photoPreset === id ? "#a855f7" : "var(--ff-border)",
                        background: photoPreset === id ? "color-mix(in srgb, #a855f7 10%, transparent)" : "var(--ff-panel)",
                      }}
                      onClick={() => setPhotoPreset(id)}
                    >
                      <div style={s.optionTitle}>{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.configCard}>
                <div style={s.configTitle}>Copies Per Sheet</div>
                <div style={s.optionGrid}>
                  {Object.entries(COPY_LAYOUTS).map(([id, item]) => (
                    <button
                      key={id}
                      type="button"
                      style={{
                        ...s.optionBtn,
                        borderColor: copyCount === id ? "#a855f7" : "var(--ff-border)",
                        background: copyCount === id ? "color-mix(in srgb, #a855f7 10%, transparent)" : "var(--ff-panel)",
                      }}
                      onClick={() => setCopyCount(id)}
                    >
                      <div style={s.optionTitle}>{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.configCard}>
                <div style={s.configTitle}>Page Layout</div>
                <div style={s.optionGrid}>
                  {Object.entries(PAGE_PRESETS).map(([id, item]) => (
                    <button
                      key={id}
                      type="button"
                      style={{
                        ...s.optionBtn,
                        borderColor: pageMode === id ? "#a855f7" : "var(--ff-border)",
                        background: pageMode === id ? "color-mix(in srgb, #a855f7 10%, transparent)" : "var(--ff-panel)",
                      }}
                      onClick={() => setPageMode(id)}
                    >
                      <div style={s.optionTitle}>{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.configCard}>
                <div style={s.configTitle}>Print Helpers</div>
                <label style={s.checkRow}>
                  <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
                  <span>Show cut guides</span>
                </label>
                <label style={s.checkRow}>
                  <input type="checkbox" checked={showLabel} onChange={(e) => setShowLabel(e.target.checked)} />
                  <span>Add sheet title</span>
                </label>
                {showLabel ? (
                  <input
                    value={sheetTitle}
                    onChange={(e) => setSheetTitle(e.target.value)}
                    style={s.input}
                    placeholder="Passport Sheet"
                  />
                ) : null}
                <p style={s.helperText}>{summary}</p>
              </div>

              {!done && (
                <button type="button" style={s.btnPrimary} onClick={generateSheet} disabled={processing}>
                  {processing ? "Generating Preview..." : "Generate Preview"}
                </button>
              )}

              {error ? <div style={s.errorBox}>{error}</div> : null}
            </div>
          </div>

          {done && result ? (
            <div style={s.resultCard}>
              <div style={s.resultPills}>
                <span style={s.resultPill}>{selectedLayout.label}</span>
                <span style={s.resultPill}>{selectedPhoto.label}</span>
                <span style={s.resultPill}>{selectedPage.label}</span>
                <span style={s.resultPill}>Watermarked preview</span>
              </div>

              <PreviewSheet src={result.url} />

              <p style={s.resultMessage}>Preview ready. Final passport sheet will download watermark-free after one plan use.</p>
              <div style={s.resultActions}>
                <button type="button" style={s.btnPrimary} onClick={handleDownload} disabled={downloading}>
                  {downloading ? "Unlocking Download..." : downloadUnlocked ? "Download Again" : "Download Final Sheet (1 Use)"}
                </button>
                <button type="button" style={s.btnSecondary} onClick={handleReset}>Create Another Sheet</button>
              </div>
            </div>
          ) : null}
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
  backBtn: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", color: "var(--ff-text-soft)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 },
  toolTitle: { color: "var(--ff-text)", fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.08 },
  toolDesc: { color: "var(--ff-text-soft)", fontSize: 14, margin: "6px 0 0", lineHeight: 1.6 },
  workspace: { display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)", gap: 20, alignItems: "start" },
  workspaceMobile: { gridTemplateColumns: "1fr", gap: 16 },
  uploadPanel: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 18 },
  configPanel: { display: "grid", gap: 14 },
  panelLabel: { color: "var(--ff-text-faint)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  uploadZone: { minHeight: 360, border: "2px dashed", borderRadius: 16, background: "var(--ff-panel)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, cursor: "pointer", overflow: "hidden" },
  bigIcon: { width: 88, height: 88, borderRadius: "50%", background: "color-mix(in srgb, #a855f7 12%, transparent)", border: "1px solid color-mix(in srgb, #a855f7 26%, transparent)", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900 },
  uploadText: { color: "var(--ff-text)", fontWeight: 800, fontSize: 18, margin: "10px 0 0" },
  uploadSub: { color: "var(--ff-text-soft)", fontSize: 13, margin: "6px 0 0", textAlign: "center", maxWidth: 440, lineHeight: 1.6 },
  previewInline: { display: "block", maxWidth: "100%", maxHeight: 360, objectFit: "contain" },
  uploadActions: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 },
  configCard: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 18 },
  configTitle: { color: "var(--ff-text)", fontSize: 17, fontWeight: 900, marginBottom: 12 },
  optionGrid: { display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" },
  optionBtn: { border: "1px solid", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", textAlign: "center", minHeight: 54 },
  optionTitle: { color: "var(--ff-text)", fontSize: 14, fontWeight: 800, lineHeight: 1.4 },
  checkRow: { display: "flex", alignItems: "center", gap: 10, color: "var(--ff-text-soft)", fontSize: 14, marginBottom: 10 },
  input: { width: "100%", background: "var(--ff-panel)", border: "1px solid var(--ff-border)", color: "var(--ff-text)", borderRadius: 12, padding: "12px 14px", outline: "none", boxSizing: "border-box" },
  helperText: { margin: "8px 0 0", color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.6 },
  errorBox: { background: "color-mix(in srgb, #ef4444 8%, transparent)", border: "1px solid color-mix(in srgb, #ef4444 26%, transparent)", color: "#fca5a5", borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.6 },
  btnPrimary: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 18px", fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" },
  btnSecondary: { background: "var(--ff-panel)", color: "var(--ff-text-soft)", border: "1px solid var(--ff-border)", borderRadius: 14, padding: "14px 18px", fontWeight: 800, fontSize: 14, cursor: "pointer" },
  resultCard: { marginTop: 18, background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 24 },
  resultPills: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 },
  resultPill: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", color: "var(--ff-text-soft)", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 800 },
  previewShell: { position: "relative", overflow: "hidden", borderRadius: 18, border: "1px solid var(--ff-border)", background: "#fff", margin: "0 auto", maxWidth: 760 },
  previewImage: { display: "block", width: "100%", height: "auto" },
  previewOverlay: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20, padding: 20, pointerEvents: "none" },
  previewWatermark: { alignSelf: "center", justifySelf: "center", transform: "rotate(-24deg)", color: "rgba(15,23,42,0.18)", fontSize: 18, fontWeight: 900, letterSpacing: 1.2, whiteSpace: "nowrap" },
  resultMessage: { color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.7, textAlign: "center", margin: "18px 0" },
  resultActions: { display: "flex", gap: 12, flexWrap: "wrap" },
};
