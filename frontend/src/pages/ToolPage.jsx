import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Webcam from "react-webcam";
import API from "../api/axios";
import useStore from "../store/useStore";
import AuthModal from "../components/AuthModal";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const FEATURES = {
  photo: {
    icon: "PH",
    label: "Exam Photo",
    credit: 2,
    color: "#3b82f6",
    desc: "Resize, compress, and prepare exam-ready photo output.",
    needsExam: true,
    uploadLabel: "Upload passport-style source photo",
  },
  signature: {
    icon: "SG",
    label: "Exam Signature",
    credit: 2,
    color: "#8b5cf6",
    desc: "Resize and fit signature to exact exam requirements.",
    needsExam: true,
    uploadLabel: "Upload signature image",
  },
  imgcompress: {
    icon: "IC",
    label: "Image Compressor",
    credit: 2,
    color: "#14b8a6",
    desc: "Compress image to exact KB or MB target.",
    needsExam: false,
    uploadLabel: "Upload image to compress",
  },
  crop: {
    icon: "CR",
    label: "Crop & Resize",
    credit: 2,
    color: "#ec4899",
    desc: "Circle, square and manual crop with zoom and position controls.",
    needsExam: false,
    uploadLabel: "Upload image to crop",
  },
  pdfeditor: {
    icon: "PE",
    label: "PDF Editor",
    credit: 2,
    color: "#ef4444",
    desc: "Upcoming PDF text editing tools.",
    needsExam: false,
    soon: true,
  },
  resume: {
    icon: "RB",
    label: "Resume Builder",
    credit: 2,
    color: "#22c55e",
    desc: "Upcoming ATS-friendly resume builder.",
    needsExam: false,
    soon: true,
  },
};

const FALLBACK_EXAMS = [
  "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD", "SBI PO", "SBI Clerk", "IBPS PO", "IBPS Clerk",
  "IBPS RRB", "RRB NTPC", "RRB Group D", "RRB JE", "UPSC CSE", "UPSC CDS", "UPSC NDA",
  "Delhi Police Constable", "Delhi Police SI", "JEE Main", "JEE Advanced", "NEET UG", "CUET UG",
  "UP Police Constable", "GATE", "CTET", "Agniveer Army",
];

const CROP_MODES = [
  { id: "circle", label: "Circle", frameW: 280, frameH: 280, borderRadius: "50%", format: "image/png", extension: "png" },
  { id: "square", label: "Square", frameW: 280, frameH: 280, borderRadius: 18, format: "image/jpeg", extension: "jpg" },
  { id: "manual", label: "Manual", frameW: 320, frameH: 220, borderRadius: 18, format: "image/jpeg", extension: "jpg" },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function detectPrimaryFace(src) {
  if (typeof window === "undefined" || typeof window.FaceDetector === "undefined") return null;
  try {
    const img = await loadImage(src);
    const bitmap = await createImageBitmap(img);
    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    const detections = await detector.detect(bitmap);
    bitmap.close();
    return detections?.[0]?.boundingBox || null;
  } catch {
    return null;
  }
}

function getCropModeConfig(modeId, manualSize) {
  const base = CROP_MODES.find((item) => item.id === modeId) || CROP_MODES[0];
  if (modeId !== "manual") return base;
  return { ...base, frameW: manualSize.width, frameH: manualSize.height };
}

async function renderCompressedImage({ src, targetKB, qualityBias }) {
  const img = await loadImage(src);
  let workingWidth = img.width;
  let workingHeight = img.height;
  let bestUrl = "";
  let bestSizeKB = Infinity;
  let bestWidth = img.width;
  let bestHeight = img.height;

  const maxDimension = 2400;
  if (workingWidth > maxDimension || workingHeight > maxDimension) {
    const ratio = Math.min(maxDimension / workingWidth, maxDimension / workingHeight);
    workingWidth = Math.round(workingWidth * ratio);
    workingHeight = Math.round(workingHeight * ratio);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  for (let pass = 0; pass < 7; pass += 1) {
    canvas.width = Math.max(120, Math.round(workingWidth));
    canvas.height = Math.max(120, Math.round(workingHeight));
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const qualityStart = qualityBias === "high" ? 0.92 : qualityBias === "low" ? 0.72 : 0.84;
    for (let quality = qualityStart; quality >= 0.4; quality -= 0.06) {
      const url = canvas.toDataURL("image/jpeg", quality);
      const sizeKB = Math.round((url.length * 0.75) / 1024);

      if (sizeKB < bestSizeKB) {
        bestUrl = url;
        bestSizeKB = sizeKB;
        bestWidth = canvas.width;
        bestHeight = canvas.height;
      }

      if (sizeKB <= targetKB) {
        return { url, sizeKB, width: canvas.width, height: canvas.height, extension: "jpg", withinRange: true };
      }
    }

    workingWidth *= 0.88;
    workingHeight *= 0.88;
  }

  return { url: bestUrl, sizeKB: bestSizeKB, width: bestWidth, height: bestHeight, extension: "jpg", withinRange: false };
}

async function renderCropImage({ src, cropMode, zoom, offsetX, offsetY, manualSize }) {
  const config = getCropModeConfig(cropMode, manualSize);
  const img = await loadImage(src);
  const frameW = config.frameW;
  const frameH = config.frameH;
  const baseScale = Math.max(frameW / img.width, frameH / img.height);
  const renderedW = img.width * baseScale * zoom;
  const renderedH = img.height * baseScale * zoom;
  const left = (frameW - renderedW) / 2 + offsetX;
  const top = (frameH - renderedH) / 2 + offsetY;
  const scale = baseScale * zoom;
  const sourceX = clamp((0 - left) / scale, 0, img.width);
  const sourceY = clamp((0 - top) / scale, 0, img.height);
  const sourceW = clamp(frameW / scale, 1, img.width - sourceX);
  const sourceH = clamp(frameH / scale, 1, img.height - sourceY);

  const canvas = document.createElement("canvas");
  const outputScale = 2;
  canvas.width = Math.round(frameW * outputScale);
  canvas.height = Math.round(frameH * outputScale);
  const ctx = canvas.getContext("2d");

  if (cropMode === "circle") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, canvas.width, canvas.height);
  if (cropMode === "circle") ctx.restore();

  const format = config.format;
  const url = canvas.toDataURL(format, format === "image/jpeg" ? 0.94 : undefined);
  return {
    url,
    width: canvas.width,
    height: canvas.height,
    format,
    extension: config.extension,
    sizeKB: Math.round((url.length * 0.75) / 1024),
    withinRange: true,
  };
}

function CameraModal({ onCapture, onClose }) {
  const webcamRef = useRef(null);
  const [camError, setCamError] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    setCapturing(true);
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
      onCapture(file, imageSrc);
    } finally {
      setCapturing(false);
    }
  }, [onCapture]);

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <h3 style={s.modalTitle}>Live Camera</h3>
        {camError ? (
          <div style={s.cameraError}>Camera permission denied. Allow camera in browser settings, then retry.</div>
        ) : (
          <div style={s.cameraWrap}>
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
        <div style={s.modalActions}>
          {!camError && (
            <button type="button" onClick={capture} disabled={capturing} style={s.btnPrimary}>
              {capturing ? "Capturing..." : "Capture"}
            </button>
          )}
          <button type="button" onClick={onClose} style={s.btnSecondary}>{camError ? "Close" : "Cancel"}</button>
        </div>
      </div>
    </div>
  );
}

function CropEditor({
  preview,
  cropMode,
  setCropMode,
  manualSize,
  setManualSize,
  zoom,
  setZoom,
  offsetX,
  setOffsetX,
  offsetY,
  setOffsetY,
  imageNaturalSize,
}) {
  const cropConfig = useMemo(() => getCropModeConfig(cropMode, manualSize), [cropMode, manualSize]);
  const frameW = cropConfig.frameW;
  const frameH = cropConfig.frameH;
  const naturalW = imageNaturalSize.width || frameW;
  const naturalH = imageNaturalSize.height || frameH;
  const baseScale = Math.max(frameW / naturalW, frameH / naturalH);
  const renderedW = naturalW * baseScale * zoom;
  const renderedH = naturalH * baseScale * zoom;
  const maxOffsetX = Math.max(0, (renderedW - frameW) / 2);
  const maxOffsetY = Math.max(0, (renderedH - frameH) / 2);

  useEffect(() => {
    setOffsetX((prev) => clamp(prev, -maxOffsetX, maxOffsetX));
    setOffsetY((prev) => clamp(prev, -maxOffsetY, maxOffsetY));
  }, [maxOffsetX, maxOffsetY, setOffsetX, setOffsetY]);

  return (
    <div style={s.cropEditorWrap}>
      <div style={s.modeRow}>
        {CROP_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            style={{
              ...s.pillToggle,
              borderColor: cropMode === mode.id ? "#ec4899" : "var(--ff-border)",
              background: cropMode === mode.id ? "color-mix(in srgb, #ec4899 10%, transparent)" : "var(--ff-panel)",
              color: cropMode === mode.id ? "#ec4899" : "var(--ff-text-soft)",
            }}
            onClick={() => setCropMode(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div style={s.cropCanvasWrap}>
        <div style={{ ...s.cropViewport, width: frameW, height: frameH, borderRadius: cropConfig.borderRadius }}>
          <img
            src={preview}
            alt="crop preview"
            style={{
              ...s.cropViewportImage,
              width: renderedW,
              height: renderedH,
              left: (frameW - renderedW) / 2 + offsetX,
              top: (frameH - renderedH) / 2 + offsetY,
            }}
          />
          <div style={{ ...s.cropMask, borderRadius: cropConfig.borderRadius }} />
        </div>
      </div>

      <div style={s.controlGrid}>
        <label style={s.controlCard}>
          <span style={s.controlLabel}>Zoom</span>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          <span style={s.controlValue}>{zoom.toFixed(2)}x</span>
        </label>

        <label style={s.controlCard}>
          <span style={s.controlLabel}>Left / Right</span>
          <input type="range" min={-maxOffsetX} max={maxOffsetX} step="1" value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} />
          <span style={s.controlValue}>{Math.round(offsetX)} px</span>
        </label>

        <label style={s.controlCard}>
          <span style={s.controlLabel}>Up / Down</span>
          <input type="range" min={-maxOffsetY} max={maxOffsetY} step="1" value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} />
          <span style={s.controlValue}>{Math.round(offsetY)} px</span>
        </label>

        {cropMode === "manual" && (
          <>
            <label style={s.controlCard}>
              <span style={s.controlLabel}>Manual Width</span>
              <input type="range" min="220" max="420" step="2" value={manualSize.width} onChange={(e) => setManualSize((prev) => ({ ...prev, width: Number(e.target.value) }))} />
              <span style={s.controlValue}>{manualSize.width}px</span>
            </label>

            <label style={s.controlCard}>
              <span style={s.controlLabel}>Manual Height</span>
              <input type="range" min="160" max="360" step="2" value={manualSize.height} onChange={(e) => setManualSize((prev) => ({ ...prev, height: Number(e.target.value) }))} />
              <span style={s.controlValue}>{manualSize.height}px</span>
            </label>
          </>
        )}
      </div>
    </div>
  );
}

function PreviewImage({ src, label }) {
  return (
    <div style={s.previewShell}>
      <img src={src} alt={label} style={s.previewImage} />
      <div style={s.previewOverlay}>
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} style={s.previewWatermark}>FORMFIXER PREVIEW</span>
        ))}
      </div>
    </div>
  );
}

export default function ToolPage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, credits, updateCredits, logout } = useStore();
  const currentCredits = user ? (credits ?? user?.credits ?? 0) : 0;

  const tool = FEATURES[toolId];
  const isCropTool = toolId === "crop";
  const isImageCompressTool = toolId === "imgcompress";
  const needsExam = tool?.needsExam ?? false;

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedExam, setSelectedExam] = useState("");
  const [examList, setExamList] = useState(FALLBACK_EXAMS);
  const [liveSpecs, setLiveSpecs] = useState({});
  const [specsLoading, setSpecsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [downloadUnlocked, setDownloadUnlocked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cropMode, setCropMode] = useState("circle");
  const [zoom, setZoom] = useState(1.2);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [manualSize, setManualSize] = useState({ width: 320, height: 220 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("KB");
  const [compressQuality, setCompressQuality] = useState("medium");

  useEffect(() => {
    API.get("/process/exams")
      .then(({ data }) => {
        setExamList(data.map((exam) => exam.name));
        const specsMap = {};
        data.forEach((exam) => {
          specsMap[exam.name] = exam;
        });
        setLiveSpecs(specsMap);
      })
      .catch(() => {})
      .finally(() => setSpecsLoading(false));
  }, []);

  useEffect(() => {
    const examFromQuery = searchParams.get("exam");
    if (examFromQuery) setSelectedExam(examFromQuery);
  }, [searchParams]);

  useEffect(() => {
    if (!isImageCompressTool) return;
    const targetFromQuery = searchParams.get("target");
    const unitFromQuery = searchParams.get("unit");
    if (targetFromQuery) setTargetValue(targetFromQuery);
    if (unitFromQuery === "KB" || unitFromQuery === "MB") setTargetUnit(unitFromQuery);
  }, [isImageCompressTool, searchParams]);

  useEffect(() => {
    if (!preview) {
      setImageNaturalSize({ width: 0, height: 0 });
      return;
    }
    let active = true;
    loadImage(preview)
      .then((img) => {
        if (active) setImageNaturalSize({ width: img.width, height: img.height });
      })
      .catch(() => {
        if (active) setImageNaturalSize({ width: 0, height: 0 });
      });
    return () => {
      active = false;
    };
  }, [preview]);

  const liveSpec = liveSpecs[selectedExam]?.[toolId] ?? null;
  const targetKB = useMemo(() => {
    const numericValue = parseFloat(targetValue);
    if (!numericValue || numericValue <= 0) return null;
    return targetUnit === "MB" ? Math.round(numericValue * 1024) : Math.round(numericValue);
  }, [targetValue, targetUnit]);

  const handleFileSelection = (chosen) => {
    if (!chosen) return;
    setFile(chosen);
    setPreview(chosen.type.startsWith("image/") ? URL.createObjectURL(chosen) : null);
    setZoom(1.2);
    setOffsetX(0);
    setOffsetY(0);
    setDone(false);
    setResult(null);
    setError("");
    setFieldError("");
    setDownloadUnlocked(false);
  };

  const handleProcess = async () => {
    if (!tool || tool.soon) return;
    setFieldError("");
    setError("");

    if (!file) return setFieldError("Please upload an image first.");
    if (needsExam && !selectedExam) return setFieldError("Please choose your exam first.");

    setProcessing(true);
    try {
      if (isCropTool) {
        const cropResult = await renderCropImage({
          src: preview,
          cropMode,
          zoom,
          offsetX,
          offsetY,
          manualSize,
        });
        setResult({
          ...cropResult,
          dimensions: `${cropResult.width} x ${cropResult.height}`,
          creditCost: tool.credit,
          kind: "local",
        });
        setDone(true);
        return;
      }

      if (isImageCompressTool) {
        if (!targetKB) return setFieldError("Please enter target size first.");
        const compressed = await renderCompressedImage({
          src: preview,
          targetKB,
          qualityBias: compressQuality,
        });
        setResult({
          ...compressed,
          targetKB,
          dimensions: `${compressed.width} x ${compressed.height}`,
          creditCost: tool.credit,
          kind: "local",
        });
        setDone(true);
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("examName", selectedExam);

      if (toolId === "photo" && preview) {
        const faceBox = await detectPrimaryFace(preview);
        if (faceBox) {
          formData.append("focusBox", JSON.stringify(faceBox));
        }
      }

      const { data } = await API.post(`/process/${toolId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ ...data, kind: "remote" });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAfterAuth = async () => {
    if (!result) return;
    if (!downloadUnlocked) {
      const processedUrl = result.url || preview || "";
      const examName = selectedExam || tool.label;
      const { data } = await API.post("/process/confirm-download", {
        toolType: toolId,
        examName,
        processedUrl,
      });
      if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);
      setDownloadUnlocked(true);
    }

    const href = result.url || result.urlData || result.url;
    const link = document.createElement("a");
    link.href = href;
    link.download = `formfixer_${toolId}.${result.extension || "jpg"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async () => {
    if (!user) return setShowAuthModal(true);
    setDownloading(true);
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
    setFieldError("");
    setDownloadUnlocked(false);
  };

  if (!tool) {
    navigate("/all-tools");
    return null;
  }

  return (
    <div style={s.root}>
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={async () => {
            setShowAuthModal(false);
            await handleDownloadAfterAuth();
          }}
          title={`Login to Download ${tool.label}`}
          subtitle="Preview is available first. Final download needs quick login."
        />
      )}

      {showCamera && <CameraModal onCapture={(capturedFile, previewUrl) => { handleFileSelection(capturedFile); setPreview(previewUrl); setShowCamera(false); }} onClose={() => setShowCamera(false)} />}

      {user && <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />}
      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : (
          <div style={s.guestBar}>
            <span>Use preview first. Login only when you want the final clean download.</span>
            <button style={s.guestLoginBtn} onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          </div>
        )}

        <div style={s.content}>
          <div style={s.toolHeader}>
            <button type="button" style={s.backBtn} onClick={() => navigate(user ? "/dashboard" : "/all-tools")}>Back</button>
            <div>
              <h1 style={s.toolTitle}>{tool.label}</h1>
              <p style={s.toolDesc}>{tool.desc} · {tool.credit} credits on final download</p>
            </div>
          </div>

          {tool.soon ? (
            <div style={s.soonCard}>
              <h2 style={s.soonTitle}>{tool.label} is coming soon</h2>
              <p style={s.soonText}>The catalog is ready. The processor for this tool is the next build step.</p>
            </div>
          ) : (
            <>
              <div style={s.workspace}>
                <div style={s.uploadPanel}>
                  <div style={s.panelLabel}>Upload Area</div>
                  <div
                    style={{
                      ...s.uploadZone,
                      borderColor: preview ? tool.color : "var(--ff-border)",
                      opacity: done ? 0.5 : 1,
                      pointerEvents: done ? "none" : "auto",
                    }}
                    onClick={() => !done && document.getElementById("toolFileInput")?.click()}
                  >
                    {preview ? (
                      <img src={preview} alt="preview" style={s.previewImageInline} />
                    ) : (
                      <>
                        <div style={{ ...s.bigIcon, color: tool.color, borderColor: `${tool.color}33`, background: `${tool.color}12` }}>
                          {tool.icon}
                        </div>
                        <p style={s.uploadText}>{tool.uploadLabel}</p>
                        <p style={s.uploadSub}>JPG, PNG, WEBP supported</p>
                      </>
                    )}
                  </div>
                  <input id="toolFileInput" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileSelection(e.target.files?.[0])} disabled={done} />
                  <div style={s.uploadActions}>
                    <button type="button" style={s.btnSecondary} onClick={() => !done && document.getElementById("toolFileInput")?.click()} disabled={done}>Browse File</button>
                    <button type="button" style={s.btnSecondary} onClick={() => !done && setShowCamera(true)} disabled={done}>Live Camera</button>
                  </div>

                  {isCropTool && preview && !done && (
                    <CropEditor
                      preview={preview}
                      cropMode={cropMode}
                      setCropMode={setCropMode}
                      manualSize={manualSize}
                      setManualSize={setManualSize}
                      zoom={zoom}
                      setZoom={setZoom}
                      offsetX={offsetX}
                      setOffsetX={setOffsetX}
                      offsetY={offsetY}
                      setOffsetY={setOffsetY}
                      imageNaturalSize={imageNaturalSize}
                    />
                  )}
                </div>

                <div style={s.configPanel}>
                  <div style={s.panelLabel}>Configuration</div>

                  {needsExam && (
                    <div style={s.configCard}>
                      <div style={s.configTitle}>Select Exam</div>
                      <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} style={s.select}>
                        <option value="">-- Choose Exam --</option>
                        {examList.map((exam) => (
                          <option key={exam} value={exam}>{exam}</option>
                        ))}
                      </select>
                      {specsLoading ? (
                        <p style={s.helperText}>Loading exam specs...</p>
                      ) : liveSpec ? (
                        <div style={s.specGrid}>
                          <div style={s.specBox}><span style={s.specKey}>Dimensions</span><strong style={s.specVal}>{liveSpec.w} × {liveSpec.h}px</strong></div>
                          <div style={s.specBox}><span style={s.specKey}>Size</span><strong style={s.specVal}>{liveSpec.minKB}-{liveSpec.maxKB} KB</strong></div>
                        </div>
                      ) : (
                        <p style={s.helperText}>Choose an exam to see exact dimensions and file size.</p>
                      )}
                    </div>
                  )}

                  {!isCropTool && !isImageCompressTool && (
                    <div style={s.configCard}>
                      <div style={s.configTitle}>Photo Guidance</div>
                      <ul style={s.guideList}>
                        <li>Use a front-facing, clearly visible source photo or signature.</li>
                        <li>Prefer good lighting and plain background for better output quality.</li>
                        <li>Avoid low-resolution or heavily cropped social-media images.</li>
                      </ul>
                    </div>
                  )}

                  {isImageCompressTool && (
                    <div style={s.configCard}>
                      <div style={s.configTitle}>Target Size</div>
                      <div style={s.sizeRow}>
                        <input type="number" min="1" placeholder="100" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} style={s.sizeInput} />
                        <div style={s.modeRow}>
                          {["KB", "MB"].map((unit) => (
                            <button
                              key={unit}
                              type="button"
                              style={{
                                ...s.pillToggle,
                                borderColor: targetUnit === unit ? tool.color : "var(--ff-border)",
                                background: targetUnit === unit ? `${tool.color}14` : "var(--ff-panel)",
                                color: targetUnit === unit ? tool.color : "var(--ff-text-soft)",
                              }}
                              onClick={() => setTargetUnit(unit)}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={s.modeRow}>
                        {[
                          { id: "high", label: "High Quality" },
                          { id: "medium", label: "Balanced" },
                          { id: "low", label: "Max Compression" },
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            style={{
                              ...s.pillToggle,
                              borderColor: compressQuality === option.id ? tool.color : "var(--ff-border)",
                              background: compressQuality === option.id ? `${tool.color}14` : "var(--ff-panel)",
                              color: compressQuality === option.id ? tool.color : "var(--ff-text-soft)",
                            }}
                            onClick={() => setCompressQuality(option.id)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <p style={s.helperText}>{targetKB ? `Target: ${targetKB} KB` : "Enter the final size you need."}</p>
                    </div>
                  )}

                  {isCropTool && (
                    <div style={s.configCard}>
                      <div style={s.configTitle}>Crop Output</div>
                      <p style={s.helperText}>Use circle for profile photo crops, square for regular uploads, and manual for custom aspect ratio images.</p>
                    </div>
                  )}

                  {fieldError && <div style={s.errorBox}>{fieldError}</div>}
                  {error && <div style={s.errorBox}>{error}</div>}

                  {!done && (
                    <button type="button" style={s.btnPrimary} onClick={handleProcess} disabled={processing}>
                      {processing ? "Generating Preview..." : "Generate Preview"}
                    </button>
                  )}
                </div>
              </div>

              {done && result && (
                <div style={s.resultCard}>
                  <PreviewImage src={result.url} label={tool.label} />
                  <div style={s.statsRow}>
                    <div style={s.statBox}>
                      <div style={s.statValue}>{result.sizeKB} KB</div>
                      <div style={s.statLabel}>Output size</div>
                    </div>
                    <div style={s.statBox}>
                      <div style={s.statValue}>{result.dimensions}</div>
                      <div style={s.statLabel}>Dimensions</div>
                    </div>
                    <div style={s.statBox}>
                      <div style={{ ...s.statValue, color: result.withinRange ? "#22c55e" : "#f59e0b" }}>
                        {result.withinRange ? "OK" : "BEST"}
                      </div>
                      <div style={s.statLabel}>{result.withinRange ? "Target hit" : "Closest result"}</div>
                    </div>
                  </div>

                  <div style={s.resultPills}>
                    {isCropTool && <span style={s.resultPill}>Mode: {cropMode}</span>}
                    {isImageCompressTool && <span style={s.resultPill}>Target: {result.targetKB} KB</span>}
                    {toolId === "photo" && <span style={s.resultPill}>{result.processing?.focusGuided ? "Face-guided framing" : "Centered framing"}</span>}
                    <span style={s.resultPill}>Watermarked preview</span>
                  </div>

                  <p style={s.resultMessage}>Preview ready. Credits are deducted only when you download the final file.</p>
                  <div style={s.resultActions}>
                    <button type="button" style={s.btnPrimary} onClick={handleDownload} disabled={downloading}>
                      {downloading ? "Unlocking Download..." : downloadUnlocked ? "Download Again" : `Download Final File (${tool.credit} credits)`}
                    </button>
                    <button type="button" style={s.btnSecondary} onClick={handleReset}>Process Another</button>
                  </div>
                </div>
              )}
            </>
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
  workspace: { display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)", gap: 20, alignItems: "start" },
  uploadPanel: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 18 },
  configPanel: { display: "grid", gap: 14 },
  panelLabel: { color: "var(--ff-text-faint)", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  uploadZone: { minHeight: 360, border: "2px dashed", borderRadius: 16, background: "var(--ff-panel)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, cursor: "pointer", overflow: "hidden" },
  bigIcon: { width: 88, height: 88, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, border: "1px solid" },
  uploadText: { color: "var(--ff-text)", fontWeight: 800, fontSize: 18, margin: "12px 0 0" },
  uploadSub: { color: "var(--ff-text-soft)", fontSize: 13, margin: "6px 0 0" },
  previewImageInline: { display: "block", maxWidth: "100%", maxHeight: 340, objectFit: "contain" },
  uploadActions: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 },
  configCard: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 18 },
  configTitle: { color: "var(--ff-text)", fontSize: 17, fontWeight: 900, marginBottom: 12 },
  select: { width: "100%", background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 12, padding: "12px 14px", color: "var(--ff-text)", fontSize: 14, outline: "none" },
  helperText: { color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.6, margin: "10px 0 0" },
  specGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 },
  specBox: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 12, padding: 12, display: "grid", gap: 4 },
  specKey: { color: "var(--ff-text-faint)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4 },
  specVal: { color: "var(--ff-text)", fontSize: 14, fontWeight: 900 },
  guideList: { margin: 0, paddingLeft: 18, color: "var(--ff-text-soft)", fontSize: 13, lineHeight: 1.75, display: "grid", gap: 6 },
  modeRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  pillToggle: { border: "1px solid", borderRadius: 999, padding: "10px 14px", fontSize: 12, fontWeight: 800, cursor: "pointer" },
  sizeRow: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  sizeInput: { width: 150, background: "var(--ff-panel)", border: "1px solid var(--ff-border)", color: "var(--ff-text)", borderRadius: 12, padding: "14px 16px", outline: "none", fontSize: 22, fontWeight: 900 },
  cropEditorWrap: { display: "grid", gap: 16, marginTop: 18 },
  cropCanvasWrap: { display: "flex", justifyContent: "center", padding: "8px 0" },
  cropViewport: { position: "relative", overflow: "hidden", background: "#020617", border: "1px solid #475569", maxWidth: "100%" },
  cropViewportImage: { position: "absolute", objectFit: "cover", userSelect: "none", pointerEvents: "none" },
  cropMask: { position: "absolute", inset: 0, boxShadow: "0 0 0 9999px rgba(2,6,23,0.58), inset 0 0 0 2px #f9a8d4", pointerEvents: "none" },
  controlGrid: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" },
  controlCard: { display: "grid", gap: 8, background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 12, padding: 12 },
  controlLabel: { color: "var(--ff-text-soft)", fontSize: 12, fontWeight: 700 },
  controlValue: { color: "#f9a8d4", fontSize: 12, fontWeight: 800 },
  errorBox: { background: "color-mix(in srgb, #ef4444 8%, transparent)", border: "1px solid color-mix(in srgb, #ef4444 26%, transparent)", color: "#fca5a5", borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.6 },
  btnPrimary: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 14, padding: "14px 18px", fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" },
  btnSecondary: { background: "var(--ff-panel)", color: "var(--ff-text-soft)", border: "1px solid var(--ff-border)", borderRadius: 14, padding: "14px 18px", fontWeight: 800, fontSize: 14, cursor: "pointer" },
  resultCard: { marginTop: 18, background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 24 },
  previewShell: { position: "relative", maxWidth: 520, margin: "0 auto 20px", borderRadius: 18, overflow: "hidden", border: "1px solid var(--ff-border)", background: "#03120b" },
  previewImage: { display: "block", width: "100%", maxHeight: 420, objectFit: "contain" },
  previewOverlay: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", alignContent: "space-evenly", justifyItems: "center", padding: 16, background: "linear-gradient(180deg, rgba(5,46,22,0.08), rgba(5,46,22,0.18))", pointerEvents: "none" },
  previewWatermark: { color: "rgba(255,255,255,0.2)", fontWeight: 800, fontSize: 15, letterSpacing: 2, transform: "rotate(-24deg)", textShadow: "0 0 10px rgba(0,0,0,0.35)" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, marginBottom: 18 },
  statBox: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 14, padding: 16, textAlign: "center" },
  statValue: { color: "var(--ff-text)", fontSize: 22, fontWeight: 900, wordBreak: "break-word" },
  statLabel: { color: "var(--ff-text-soft)", fontSize: 12, marginTop: 4 },
  resultPills: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 },
  resultPill: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", color: "var(--ff-text-soft)", borderRadius: 999, padding: "7px 10px", fontSize: 12, fontWeight: 800 },
  resultMessage: { color: "var(--ff-text-soft)", fontSize: 14, lineHeight: 1.7, textAlign: "center", margin: "0 0 18px" },
  resultActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  soonCard: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 28 },
  soonTitle: { color: "var(--ff-text)", margin: "0 0 10px", fontSize: 24, fontWeight: 900 },
  soonText: { color: "var(--ff-text-soft)", margin: 0, fontSize: 14, lineHeight: 1.7 },
  overlay: { position: "fixed", inset: 0, background: "#000000aa", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: 22, maxWidth: 460, width: "100%" },
  modalTitle: { color: "var(--ff-text)", fontSize: 18, fontWeight: 900, margin: "0 0 12px" },
  cameraWrap: { borderRadius: 12, overflow: "hidden", marginBottom: 14, background: "#000", lineHeight: 0 },
  cameraError: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 10, padding: 18, color: "var(--ff-text-soft)", fontSize: 13, marginBottom: 14 },
  modalActions: { display: "flex", gap: 10, flexWrap: "wrap" },
};
