import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Webcam from "react-webcam";
import API from "../api/axios";
import useStore from "../store/useStore";
import AuthModal from "../components/AuthModal";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { getExamByName } from "../utils/examPages";

const FEATURES = {
  photo: { icon: "📸", label: "Exam Photo", credit: 2, color: "#3b82f6", desc: "Resize, compress, and add white background per exam spec", needsExam: true },
  signature: { icon: "✍️", label: "Exam Signature", credit: 2, color: "#8b5cf6", desc: "Format signature for any exam", needsExam: true },
  imgcompress: { icon: "🖼️", label: "Image Compressor", credit: 2, color: "#a78bfa", desc: "Compress image to target KB", needsExam: false },
  crop: { icon: "✂️", label: "Crop & Resize", credit: 2, color: "#ec4899", desc: "Circle, square, and manual crop with zoom controls", needsExam: false },
  pdfeditor: { icon: "📝", label: "PDF Editor", credit: 2, color: "#ef4444", desc: "Edit admit cards and form PDFs", needsExam: false, soon: true },
  resume: { icon: "📄", label: "Resume Builder", credit: 2, color: "#22c55e", desc: "Professional exam-ready CV templates", needsExam: false, soon: true },
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
  { id: "manual", label: "Manual Crop", frameW: 320, frameH: 220, borderRadius: 18, format: "image/jpeg", extension: "jpg" },
];

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
        return {
          url,
          sizeKB,
          width: canvas.width,
          height: canvas.height,
          extension: "jpg",
          withinRange: true,
        };
      }
    }

    workingWidth *= 0.88;
    workingHeight *= 0.88;
  }

  return {
    url: bestUrl,
    sizeKB: bestSizeKB,
    width: bestWidth,
    height: bestHeight,
    extension: "jpg",
    withinRange: false,
  };
}

function SpecBox({ label, value, icon }) {
  return (
    <div style={s.specBox}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={s.specLabel}>{label}</div>
        <div style={s.specValue}>{value}</div>
      </div>
    </div>
  );
}

function WatermarkPreview({ src, label, compact = false }) {
  return (
    <div style={{ ...s.previewShell, maxWidth: compact ? 360 : 420 }}>
      <img src={src} alt={label} style={s.resultImage} />
      <div style={s.previewWatermarkLayer}>
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} style={s.previewWatermarkText}>FORMFIXER PREVIEW</span>
        ))}
      </div>
    </div>
  );
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
      <div style={{ ...s.modal, maxWidth: 460, textAlign: "left" }}>
        <h3 style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 17, margin: "0 0 10px" }}>Live Camera</h3>
        {camError ? (
          <div style={s.cameraError}>
            Camera permission denied. Allow camera in browser settings, then retry.
          </div>
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
        <div style={{ display: "flex", gap: 10 }}>
          {!camError && (
            <button onClick={capture} disabled={capturing} style={{ ...s.btnPrimary, flex: 1 }}>
              {capturing ? "Capturing..." : "Capture"}
            </button>
          )}
          <button onClick={onClose} style={{ ...s.btnSecondary, flex: camError ? 1 : "unset", justifyContent: "center" }}>
            {camError ? "Close" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getCropModeConfig(modeId, manualSize) {
  const base = CROP_MODES.find((item) => item.id === modeId) || CROP_MODES[0];
  if (modeId !== "manual") return base;
  return {
    ...base,
    frameW: manualSize.width,
    frameH: manualSize.height,
  };
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
  if (typeof window === "undefined" || typeof window.FaceDetector === "undefined") {
    return null;
  }

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

  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceW,
    sourceH,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  if (cropMode === "circle") {
    ctx.restore();
  }

  const format = config.format;
  const url = canvas.toDataURL(format, format === "image/jpeg" ? 0.94 : undefined);
  return {
    url,
    width: canvas.width,
    height: canvas.height,
    format,
    extension: config.extension,
    sizeKB: Math.round((url.length * 0.75) / 1024),
  };
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
      <div style={s.cropModeRow}>
        {CROP_MODES.map((mode) => (
          <button
            key={mode.id}
            style={{
              ...s.cropModeBtn,
              borderColor: cropMode === mode.id ? "#ec4899" : "#374151",
              background: cropMode === mode.id ? "#ec489920" : "#111827",
              color: cropMode === mode.id ? "#f9a8d4" : "#cbd5e1",
            }}
            onClick={() => setCropMode(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div style={s.cropCanvasPanel}>
        <div
          style={{
            ...s.cropViewport,
            width: frameW,
            height: frameH,
            borderRadius: cropConfig.borderRadius,
          }}
        >
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
          <div
            style={{
              ...s.cropFrame,
              borderRadius: cropConfig.borderRadius,
              boxShadow: cropMode === "circle"
                ? "0 0 0 9999px rgba(2,6,23,0.58), inset 0 0 0 2px #f9a8d4"
                : "0 0 0 9999px rgba(2,6,23,0.58), inset 0 0 0 2px #f9a8d4",
            }}
          />
        </div>
      </div>

      <div style={s.controlGrid}>
        <label style={s.sliderBlock}>
          <span style={s.sliderLabel}>Zoom</span>
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          <span style={s.sliderValue}>{zoom.toFixed(2)}x</span>
        </label>

        <label style={s.sliderBlock}>
          <span style={s.sliderLabel}>Move Left / Right</span>
          <input
            type="range"
            min={-maxOffsetX}
            max={maxOffsetX}
            step="1"
            value={offsetX}
            onChange={(e) => setOffsetX(Number(e.target.value))}
          />
          <span style={s.sliderValue}>{Math.round(offsetX)} px</span>
        </label>

        <label style={s.sliderBlock}>
          <span style={s.sliderLabel}>Move Up / Down</span>
          <input
            type="range"
            min={-maxOffsetY}
            max={maxOffsetY}
            step="1"
            value={offsetY}
            onChange={(e) => setOffsetY(Number(e.target.value))}
          />
          <span style={s.sliderValue}>{Math.round(offsetY)} px</span>
        </label>

        {cropMode === "manual" && (
          <>
            <label style={s.sliderBlock}>
              <span style={s.sliderLabel}>Manual Width</span>
              <input
                type="range"
                min="220"
                max="420"
                step="2"
                value={manualSize.width}
                onChange={(e) => setManualSize((prev) => ({ ...prev, width: Number(e.target.value) }))}
              />
              <span style={s.sliderValue}>{manualSize.width}px</span>
            </label>

            <label style={s.sliderBlock}>
              <span style={s.sliderLabel}>Manual Height</span>
              <input
                type="range"
                min="160"
                max="360"
                step="2"
                value={manualSize.height}
                onChange={(e) => setManualSize((prev) => ({ ...prev, height: Number(e.target.value) }))}
              />
              <span style={s.sliderValue}>{manualSize.height}px</span>
            </label>
          </>
        )}
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
  const needsExam = tool?.needsExam ?? false;
  const isCropTool = toolId === "crop";
  const isImageCompressTool = toolId === "imgcompress";

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
    if (examFromQuery) {
      setSelectedExam(examFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isImageCompressTool) return;
    const targetFromQuery = searchParams.get("target");
    const unitFromQuery = searchParams.get("unit");

    if (targetFromQuery) {
      setTargetValue(targetFromQuery);
    }
    if (unitFromQuery === "KB" || unitFromQuery === "MB") {
      setTargetUnit(unitFromQuery);
    }
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
  const selectedExamGuide = selectedExam ? getExamByName(selectedExam) : null;
  const effectiveCreditCost = tool.credit;
  const cropConfig = getCropModeConfig(cropMode, manualSize);
  const targetKB = useMemo(() => {
    const numericValue = parseFloat(targetValue);
    if (!numericValue || numericValue <= 0) return null;
    return targetUnit === "MB" ? Math.round(numericValue * 1024) : Math.round(numericValue);
  }, [targetUnit, targetValue]);

  const specBoxes = liveSpec
    ? [
        { label: "Dimensions", value: `${liveSpec.w} x ${liveSpec.h} px`, icon: "📐" },
        { label: "Size Range", value: `${liveSpec.minKB}-${liveSpec.maxKB} KB`, icon: "📦" },
        { label: "Format", value: "JPG (auto-converted)", icon: "🖼️" },
        { label: "Background", value: "White (auto-applied)", icon: "🎨" },
      ]
    : null;

  const resetWorkflow = useCallback(() => {
    setDone(false);
    setResult(null);
    setError("");
    setFieldError("");
    setDownloadUnlocked(false);
  }, []);

  const handleFileChange = (event) => {
    const chosen = event.target.files?.[0];
    if (!chosen) return;
    setFile(chosen);
    setPreview(chosen.type.startsWith("image/") ? URL.createObjectURL(chosen) : null);
    setZoom(isCropTool ? 1.2 : 1);
    setOffsetX(0);
    setOffsetY(0);
    setTargetValue("");
    setTargetUnit("KB");
    setCompressQuality("medium");
    resetWorkflow();
  };

  const handleCameraCapture = (capturedFile, previewUrl) => {
    setFile(capturedFile);
    setPreview(previewUrl);
    setShowCamera(false);
    setZoom(isCropTool ? 1.2 : 1);
    setOffsetX(0);
    setOffsetY(0);
    setTargetValue("");
    setTargetUnit("KB");
    setCompressQuality("medium");
    resetWorkflow();
  };

  const handleProcess = async () => {
    if (tool.soon) return;

    setFieldError("");
    setError("");

    if (!file) {
      setFieldError("Please upload or capture an image first.");
      return;
    }
    if (isImageCompressTool && !targetKB) {
      setFieldError("Please enter the target image size in KB or MB.");
      return;
    }
    if (needsExam && !selectedExam) {
      setFieldError("Please select your exam from the dropdown.");
      return;
    }

    setProcessing(true);
    try {
      let data;

      if (isCropTool) {
        const localCrop = await renderCropImage({
          src: preview,
          cropMode,
          zoom,
          offsetX,
          offsetY,
          manualSize,
        });

        data = {
          url: localCrop.url,
          sizeKB: localCrop.sizeKB,
          dimensions: `${localCrop.width}x${localCrop.height}`,
          withinRange: true,
          hasWatermark: true,
          creditCost: tool.credit,
          extension: localCrop.extension,
        };
      } else if (isImageCompressTool) {
        const compressed = await renderCompressedImage({
          src: preview,
          targetKB,
          qualityBias: compressQuality,
        });

        data = {
          url: compressed.url,
          sizeKB: compressed.sizeKB,
          dimensions: `${compressed.width}x${compressed.height}`,
          withinRange: compressed.withinRange,
          hasWatermark: true,
          creditCost: tool.credit,
          extension: compressed.extension,
          targetKB,
        };
        } else {
          const formData = new FormData();
          formData.append("image", file);
          if (needsExam) formData.append("examName", selectedExam);
          if (toolId === "photo" && preview) {
            const faceBox = await detectPrimaryFace(preview);
            if (faceBox) {
              formData.append("focusBox", JSON.stringify({
                x: faceBox.x,
                y: faceBox.y,
                width: faceBox.width,
                height: faceBox.height,
              }));
            }
          }

          const endpoint =
            toolId === "photo" || toolId === "signature"
            ? `/process/${toolId}`
            : "/process/photo";

        const response = await API.post(endpoint, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        data = response.data;
      }

      setResult(data);
      setDone(true);
      setDownloadUnlocked(false);

      try {
        const vaultKey = `vault_${user?._id || "guest"}`;
        const existing = JSON.parse(localStorage.getItem(vaultKey) || "[]");
        existing.unshift({
          id: Date.now(),
          toolType: toolId,
          examName: selectedExam || tool.label,
          url: data.url,
          sizeKB: data.sizeKB,
          date: new Date().toISOString(),
        });
        localStorage.setItem(vaultKey, JSON.stringify(existing.slice(0, 50)));
      } catch {}
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Processing failed.";
      setError(`Error: ${message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAfterAuth = async () => {
    if (!result?.url) return;
    setError("");

    try {
      if (!downloadUnlocked) {
        setDownloading(true);
        const { data } = await API.post("/process/confirm-download", {
          toolType: toolId,
          examName: selectedExam || (isCropTool ? `${cropMode} crop` : tool.label),
          processedUrl: isCropTool ? "" : result.url,
        });
        if (data.creditsLeft !== undefined) updateCredits(data.creditsLeft);
        setDownloadUnlocked(true);
      }

      if (result.url.startsWith("data:")) {
        const anchor = document.createElement("a");
        anchor.href = result.url;
      anchor.download = `formfixer_${toolId}.${result.extension || "jpg"}`;
        anchor.click();
        return;
      }

      const response = await fetch(result.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `formfixer_${toolId}_${selectedExam || "file"}.jpg`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        return;
      }
      try {
        const anchor = document.createElement("a");
        anchor.href = result.url;
      anchor.download = "formfixer.jpg";
        anchor.click();
      } catch {
        setError("Download failed. Please try again.");
      }
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
    setFile(null);
    setPreview(null);
    setSelectedExam("");
    setZoom(isCropTool ? 1.2 : 1);
    setOffsetX(0);
    setOffsetY(0);
    setManualSize({ width: 320, height: 220 });
    setTargetValue("");
    setTargetUnit("KB");
    setCompressQuality("medium");
    resetWorkflow();
  };

  if (!tool) {
    return (
      <div style={{ color: "#fff", padding: 40, fontFamily: "Segoe UI" }}>
        Tool not found. <span style={{ color: "#f97316", cursor: "pointer" }} onClick={() => navigate("/dashboard")}>Go back</span>
      </div>
    );
  }

  return (
    <div style={s.root}>
      {showCamera && <CameraModal onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={async () => {
            setShowAuthModal(false);
            await handleDownloadAfterAuth();
          }}
          title="Login to Download"
          subtitle="Preview abhi dekh sakte ho. Final file download karne ke liye quick login chahiye."
        />
      )}

      {user && <Sidebar credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />}

      <div style={s.main}>
        {user ? (
          <TopBar user={user} credits={currentCredits} onLogout={() => { logout(); navigate("/"); }} />
        ) : (
          <div style={s.guestBar}>
            <span>Explore freely. Login sirf final download par chahiye.</span>
            <button style={s.guestLoginBtn} onClick={() => setShowAuthModal(true)}>Login / Sign Up</button>
          </div>
        )}

        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(user ? "/dashboard" : "/")}>← Back</button>
          <div style={{ ...s.toolIcon, background: `${tool.color}20`, color: tool.color }}>{tool.icon}</div>
          <div>
              <h2 style={s.title}>{tool.label}</h2>
              <p style={s.desc}>
                {tool.desc} · <b style={{ color: tool.color }}>⚡ {effectiveCreditCost} credits</b>
              </p>
            </div>
          </div>

        {tool.soon && (
          <div style={s.warnBox}>
            <b>{tool.label}</b> is coming soon. We have paused this feature until it is fully ready.
          </div>
        )}

        {!tool.soon && user && currentCredits < effectiveCreditCost && (
          <div style={s.warnBox}>
            Need <b>{effectiveCreditCost} credits</b>, have <b>{currentCredits}</b>.{" "}
            <span style={s.link} onClick={() => navigate("/pricing")}>Buy credits →</span>
          </div>
        )}

        {needsExam && (
          <div style={s.card}>
            <label style={s.label}>Select Your Exam</label>
            <select style={{ ...s.select, opacity: done ? 0.5 : 1 }} value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} disabled={done}>
              <option value="">{specsLoading ? "Loading exams..." : "-- Choose Exam --"}</option>
              {examList.map((exam) => (
                <option key={exam} value={exam}>{exam}</option>
              ))}
            </select>

            {selectedExam && specBoxes && (
              <div style={s.specGrid}>
                {specBoxes.map((box) => <SpecBox key={box.label} {...box} />)}
              </div>
            )}
            {selectedExam && liveSpec && (
              <p style={s.specNote}>
                Final output will be <b>{liveSpec.w}x{liveSpec.h}px</b>, kept within <b>{liveSpec.minKB}-{liveSpec.maxKB} KB</b>, and exported on a <b>clean white background</b>.
              </p>
            )}
            {selectedExamGuide && (
              <p style={s.examGuideLinkWrap}>
                Need full exam guidance?{" "}
                <span style={s.inlineLink} onClick={() => navigate(`/exam/${selectedExamGuide.slug}`)}>
                  Open {selectedExam} guide →
                </span>
              </p>
            )}
            {toolId === "photo" && (
              <div style={s.guidanceBox}>
                <p style={s.guidanceTitle}>Upload a good source photo first</p>
                <ul style={s.guidanceList}>
                  <li>Use a front-facing passport-style photo where your face is clearly visible.</li>
                  <li>Take the photo in bright light. Avoid dark rooms, shadows, and heavy backlight.</li>
                  <li>Stand against a plain wall if possible. Damaged or messy backgrounds reduce output quality.</li>
                  <li>Do not upload far-away, low-resolution, selfie-angle, or cropped social-media photos.</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {!tool.soon && (
          <div style={s.card}>
            <label style={s.label}>{isCropTool ? "Upload or Capture Your Image" : "Upload or Capture"}</label>
            <div
              style={{ ...s.uploadZone, opacity: done ? 0.4 : 1, pointerEvents: done ? "none" : "auto", borderColor: preview ? "#f97316" : "#374151" }}
              onClick={() => !done && document.getElementById("fileIn")?.click()}
            >
              {preview ? (
                <img src={preview} alt="preview" style={s.preview} />
              ) : (
                <>
                  <div style={{ fontSize: 34, marginBottom: 6 }}>⬆️</div>
                  <p style={s.uploadText}>Click to Upload or Drag & Drop</p>
                  <p style={s.uploadSub}>JPG, PNG, WEBP supported</p>
                </>
              )}
            </div>
            <input id="fileIn" type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} disabled={done} />
            <div style={s.uploadBtns}>
              <button style={{ ...s.btnSecondary, opacity: done ? 0.4 : 1, justifyContent: "center" }} onClick={() => !done && document.getElementById("fileIn")?.click()} disabled={done}>
                Browse File
              </button>
              <button style={{ ...s.btnSecondary, opacity: done ? 0.4 : 1, justifyContent: "center" }} onClick={() => !done && setShowCamera(true)} disabled={done}>
                Live Camera
              </button>
            </div>

            {isCropTool && preview && !done && (
              <div style={s.cropPanel}>
                <div style={s.cropHeaderRow}>
                  <div>
                    <p style={s.cropTitle}>Crop Frame</p>
                    <p style={s.cropSub}>Choose circle, square, or manual crop and adjust the image with zoom and position sliders.</p>
                  </div>
                  <div style={s.cropBadge}>2 credits on download</div>
                </div>

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
              </div>
            )}

            {isImageCompressTool && preview && !done && (
              <div style={s.cropPanel}>
                <div style={s.cropHeaderRow}>
                  <div>
                    <p style={s.cropTitle}>Target Size</p>
                    <p style={s.cropSub}>Choose the final image size in KB or MB. We will reduce quality and dimensions to reach it as closely as possible.</p>
                  </div>
                  <div style={s.cropBadge}>2 credits on download</div>
                </div>

                <div style={s.compressTargetGrid}>
                  <label style={s.sliderBlock}>
                    <span style={s.sliderLabel}>Enter Target Size</span>
                    <div style={s.targetRow}>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 100"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        style={s.targetInput}
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
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                    <span style={s.sliderValue}>
                      {targetKB ? `Target: ${targetKB} KB` : "Enter target first"}
                    </span>
                  </label>

                  <div style={s.sliderBlock}>
                    <span style={s.sliderLabel}>Compression Style</span>
                    <div style={s.qualityChipRow}>
                      {[
                        { id: "high", label: "High Quality" },
                        { id: "medium", label: "Balanced" },
                        { id: "low", label: "Max Compression" },
                      ].map((option) => (
                        <button
                          key={option.id}
                          style={{
                            ...s.qualityChip,
                            borderColor: compressQuality === option.id ? "#a78bfa" : "#374151",
                            background: compressQuality === option.id ? "#a78bfa20" : "#111827",
                            color: compressQuality === option.id ? "#ddd6fe" : "#cbd5e1",
                          }}
                          onClick={() => setCompressQuality(option.id)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <span style={s.sliderValue}>Source image will export as JPG for best size reduction.</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {fieldError && <div style={s.fieldErrorBox}>{fieldError}</div>}
        {error && <div style={s.errorBox}>{error}</div>}

        {!done && !tool.soon && (
          <div style={{ padding: "14px 24px 0" }}>
            <button style={s.btnPrimary} onClick={handleProcess} disabled={processing}>
              {processing ? (
                <>
                  <span style={s.spinner} /> Processing...
                </>
              ) : (
                "Generate Preview"
              )}
            </button>
          </div>
        )}

        {done && result && (
          <div style={s.resultCard}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
            <h3 style={s.resultTitle}>Preview Ready</h3>
            <p style={s.resultSub}>
              <b>{result.sizeKB} KB</b> · <b>{result.dimensions}</b>
              {result.withinRange ? " · Within exam range" : " · Within max limit"}
              {" · Watermarked preview"}
            </p>
            <div style={s.previewMeta}>
              Screenshot-safe preview shown below. Credits will be deducted only when you download the final file.
            </div>
            <WatermarkPreview src={result.url} label={tool.label} compact={isCropTool} />
            {isCropTool && (
              <div style={s.cropInfoRow}>
                <span style={s.cropInfoPill}>Mode: {cropMode}</span>
                <span style={s.cropInfoPill}>Zoom: {zoom.toFixed(2)}x</span>
                <span style={s.cropInfoPill}>Frame: {cropConfig.frameW} × {cropConfig.frameH}</span>
              </div>
            )}
            {isImageCompressTool && (
              <div style={s.cropInfoRow}>
                <span style={s.cropInfoPill}>Target: {result.targetKB} KB</span>
                <span style={s.cropInfoPill}>Style: {compressQuality}</span>
                <span style={s.cropInfoPill}>{result.withinRange ? "Target hit" : "Closest possible result"}</span>
              </div>
            )}
            {toolId === "photo" && (
              <div style={s.cropInfoRow}>
                <span style={s.cropInfoPill}>Clean white background</span>
                <span style={s.cropInfoPill}>Exact exam-size export</span>
                <span style={s.cropInfoPill}>{result.processing?.focusGuided ? "Face-guided framing" : "Centered portrait framing"}</span>
              </div>
            )}
            <div style={s.resultBtns}>
              <button onClick={handleDownload} style={s.btnPrimary} disabled={downloading}>
                {downloading
                  ? "Unlocking Download..."
                  : downloadUnlocked
                    ? "Download Again"
                    : `Download Final File (${effectiveCreditCost} credits)`}
              </button>
              <button onClick={handleReset} style={{ ...s.btnSecondary, justifyContent: "center" }}>Process Another</button>
            </div>
            {!downloadUnlocked && user && currentCredits < effectiveCreditCost && (
              <p style={{ color: "#fca57a", fontSize: 12, marginTop: 12 }}>
                Need more credits for download? <span style={s.link} onClick={() => navigate("/pricing")}>Buy a plan →</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", background: "transparent", fontFamily: "'Segoe UI', sans-serif" },
  main: { flex: 1, overflowY: "auto", paddingBottom: 48 },
  guestBar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 24px 0", color: "var(--ff-text-soft)", fontSize: 13, flexWrap: "wrap" },
  guestLoginBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 999, padding: "10px 16px", fontWeight: 700, cursor: "pointer" },
  link: { color: "#f97316", cursor: "pointer", fontWeight: 700 },
  header: { display: "flex", alignItems: "center", gap: 14, padding: "18px 24px 0" },
  backBtn: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", color: "var(--ff-text-soft)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0 },
  toolIcon: { width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
  title: { color: "var(--ff-text)", fontWeight: 800, fontSize: 18, margin: 0 },
  desc: { color: "var(--ff-text-soft)", fontSize: 13, marginTop: 3 },
  warnBox: { margin: "12px 24px 0", background: "#451a0320", border: "1px solid #92400e", borderRadius: 10, padding: "10px 14px", color: "#fbbf24", fontSize: 13 },
  card: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 14, margin: "14px 24px 0", padding: 18 },
  label: { display: "block", color: "var(--ff-text-soft)", fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 },
  select: { width: "100%", background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 10, padding: "11px 14px", color: "var(--ff-text)", fontSize: 14, outline: "none" },
  specGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 },
  specBox: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 9, padding: "9px 12px", display: "flex", alignItems: "center", gap: 9 },
  specLabel: { color: "var(--ff-text-faint)", fontSize: 10, marginBottom: 1 },
  specValue: { color: "#f97316", fontWeight: 700, fontSize: 13 },
  specNote: { color: "#86efac", fontSize: 12, marginTop: 10, lineHeight: 1.5 },
  examGuideLinkWrap: { margin: "10px 0 0", color: "var(--ff-text-soft)", fontSize: 12, lineHeight: 1.5 },
  inlineLink: { color: "#f97316", fontWeight: 700, cursor: "pointer" },
  guidanceBox: { marginTop: 14, background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 12, padding: 14 },
  guidanceTitle: { margin: "0 0 8px", color: "var(--ff-text)", fontSize: 14, fontWeight: 800 },
  guidanceList: { margin: 0, paddingLeft: 18, color: "var(--ff-text-soft)", fontSize: 12, lineHeight: 1.7, display: "grid", gap: 6 },
  uploadZone: { border: "2px dashed", borderRadius: 12, minHeight: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--ff-panel)", marginBottom: 10, overflow: "hidden", transition: "all 0.2s", cursor: "pointer" },
  uploadText: { color: "var(--ff-text-soft)", fontWeight: 600, fontSize: 14, margin: 0 },
  uploadSub: { color: "var(--ff-text-faint)", fontSize: 11, marginTop: 3 },
  preview: { maxWidth: "100%", maxHeight: 220, display: "block" },
  uploadBtns: { display: "flex", gap: 10, flexWrap: "wrap" },
  fieldErrorBox: { margin: "10px 24px 0", background: "#451a0380", border: "1px solid #f59e0b", borderRadius: 10, padding: "12px 16px", color: "#fbbf24", fontSize: 14, fontWeight: 600 },
  errorBox: { margin: "10px 24px 0", background: "#450a0a40", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 14 },
  btnPrimary: { background: "linear-gradient(135deg,#f97316,#ea580c)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" },
  btnSecondary: { background: "var(--ff-panel)", color: "var(--ff-text-soft)", border: "1px solid var(--ff-border)", borderRadius: 12, padding: "11px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, minWidth: 140 },
  spinner: { display: "inline-block", width: 15, height: 15, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  resultCard: { margin: "14px 24px 0", background: "color-mix(in srgb, var(--ff-green) 8%, var(--ff-panel-solid))", border: "1px solid color-mix(in srgb, var(--ff-green) 30%, var(--ff-border))", borderRadius: 14, padding: 24, textAlign: "center" },
  resultTitle: { color: "#86efac", fontWeight: 800, fontSize: 18, margin: 0 },
  resultSub: { color: "#64748b", fontSize: 13, marginTop: 5, marginBottom: 0 },
  previewMeta: { color: "var(--ff-text-soft)", fontSize: 12, marginTop: 12, lineHeight: 1.6 },
  resultBtns: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 16 },
  overlay: { position: "fixed", inset: 0, background: "#000000aa", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 18, padding: "26px 22px", maxWidth: 360, width: "100%", textAlign: "center" },
  previewShell: { position: "relative", maxWidth: 420, margin: "18px auto 0", borderRadius: 14, overflow: "hidden", border: "1px solid #14532d", background: "#03120b" },
  resultImage: { display: "block", width: "100%", maxHeight: 420, objectFit: "contain" },
  previewWatermarkLayer: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1fr 1fr", alignContent: "space-evenly", justifyItems: "center", padding: 16, background: "linear-gradient(180deg, rgba(5,46,22,0.08), rgba(5,46,22,0.18))", pointerEvents: "none" },
  previewWatermarkText: { color: "rgba(255,255,255,0.2)", fontWeight: 800, fontSize: 15, letterSpacing: 2, transform: "rotate(-24deg)", textShadow: "0 0 10px rgba(0,0,0,0.35)" },
  cameraError: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 10, padding: 20, color: "var(--ff-text-soft)", fontSize: 13, textAlign: "center", marginBottom: 14 },
  cameraWrap: { borderRadius: 10, overflow: "hidden", marginBottom: 14, background: "#000", lineHeight: 0 },
  cropPanel: { marginTop: 18, background: "var(--ff-panel-solid)", border: "1px solid var(--ff-border)", borderRadius: 14, padding: 16 },
  cropHeaderRow: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 16 },
  cropTitle: { color: "#f9a8d4", fontWeight: 800, fontSize: 16, margin: 0 },
  cropSub: { color: "var(--ff-text-soft)", fontSize: 12, lineHeight: 1.6, margin: "4px 0 0" },
  cropBadge: { background: "#3f0d2e", color: "#f9a8d4", border: "1px solid #9d174d", borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 700 },
  cropEditorWrap: { display: "grid", gap: 16 },
  cropModeRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  cropModeBtn: { border: "1px solid", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, minWidth: 110 },
  cropCanvasPanel: { display: "flex", justifyContent: "center", padding: "10px 0 2px" },
  cropViewport: { position: "relative", overflow: "hidden", background: "#020617", border: "1px solid #475569", maxWidth: "100%" },
  cropViewportImage: { position: "absolute", objectFit: "cover", userSelect: "none", pointerEvents: "none" },
  cropFrame: { position: "absolute", inset: 0, pointerEvents: "none" },
  controlGrid: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" },
  compressTargetGrid: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" },
  sliderBlock: { display: "grid", gap: 8, background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 12, padding: 12 },
  sliderLabel: { color: "var(--ff-text-soft)", fontSize: 12, fontWeight: 700 },
  sliderValue: { color: "#f9a8d4", fontSize: 12, fontWeight: 700 },
  targetRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  targetInput: { background: "var(--ff-panel)", border: "1px solid var(--ff-border)", borderRadius: 10, padding: "12px 14px", color: "var(--ff-text)", fontSize: 18, fontWeight: 700, width: 150, outline: "none" },
  unitToggle: { display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid #374151" },
  unitBtn: { border: "1px solid", padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  qualityChipRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  qualityChip: { border: "1px solid", borderRadius: 999, padding: "9px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  bgOptionLock: { display: "flex", flexWrap: "wrap", gap: 10 },
  inlineHint: { color: "var(--ff-text-soft)", fontSize: 12, lineHeight: 1.5, alignSelf: "center" },
  bgToolGrid: { display: "grid", gap: 14 },
  bgModeRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  bgModeBtn: { border: "1px solid #374151", background: "#111827", color: "#cbd5e1", borderRadius: 999, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  bgModeBtnActive: { borderColor: "#14b8a6", background: "#14b8a620", color: "#99f6e4" },
  bgSettingRow: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" },
  colorPickerRow: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  colorPicker: { width: 56, height: 42, border: "1px solid #374151", borderRadius: 10, background: "#020617", padding: 4, cursor: "pointer" },
  colorValue: { color: "#cbd5e1", fontSize: 13, fontWeight: 700, letterSpacing: 0.4 },
  cropInfoRow: { display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 14 },
  cropInfoPill: { background: "#111827", color: "#f9a8d4", border: "1px solid #374151", borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 700 },
};
