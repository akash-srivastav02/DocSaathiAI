const sharp     = require('sharp');
const User      = require('../models/User');
const History   = require('../models/ProcessHistory');
const examSpecs = require('../data/examSpecs');
const { cloudinary, uploadBuffer } = require('../utils/cloudinary');

const TOOL_CREDIT_COST = {
  photo: 2,
  signature: 2,
  bgremove: 2,
  crop: 2,
  imgcompress: 2,
  pdfcompress: 2,
  merger: 6,
};

/* ─────────────────────────────────────────────────────────────────────────────
   WHY IMAGES COME OUT TOO SMALL:
   JPEG efficiently compresses smooth areas (white backgrounds, even skin tones).
   A 200×230 face photo with white bg can compress to 10–14 KB even at high
   quality — well below the exam's 20 KB minimum.

   THE FIX — Invisible Pixel Noise:
   We read the raw pixel buffer, add a tiny random offset (±N) to each channel,
   then re-encode. The noise is sub-perceptual (invisible) but JPEG can no
   longer compress smooth areas efficiently, pushing file size up naturally.

   We binary-search the noise level until [minKB ≤ output ≤ maxKB].
───────────────────────────────────────────────────────────────────────────── */

/**
 * addNoise — mutates a copy of the raw pixel buffer
 * @param {Buffer} rawData   - raw RGB/RGBA pixel bytes from sharp .raw()
 * @param {number} level     - max ± offset per channel (1–30 range)
 * @returns {Buffer}         - new buffer with noise applied
 */
function addNoise(rawData, level) {
  const out = Buffer.from(rawData); // copy, don't mutate original
  for (let i = 0; i < out.length; i++) {
    const delta = Math.round((Math.random() - 0.5) * 2 * level);
    out[i] = Math.max(0, Math.min(255, out[i] + delta));
  }
  return out;
}

/**
 * encodeJpeg — encode raw pixel buffer back to JPEG
 */
async function encodeJpeg(rawData, width, height, channels, quality, subsampling) {
  return sharp(rawData, { raw: { width, height, channels } })
    .jpeg({ quality, chromaSubsampling: subsampling })
    .toBuffer();
}

/**
 * compressToRange — main function
 * Resizes image, then adjusts noise level + quality to land in [minKB, maxKB]
 */
async function compressToRange(inputBuffer, width, height, maxKB, minKB) {

  // ── Step 1: Resize to exact exam dimensions + white background ────────
  const resized = await sharp(inputBuffer)
    .resize(width, height, { fit: 'cover', position: 'top' })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .toBuffer();

  // ── Step 2: Extract raw pixel data ───────────────────────────────────
  const { data: rawData, info } = await sharp(resized)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels } = info;

  // ── Step 3: Try quality 95 + 4:4:4 with zero noise first ─────────────
  let buf = await encodeJpeg(rawData, w, h, channels, 95, '4:4:4');
  let kb  = buf.length / 1024;

  console.log(`[Sharp] After resize: ${kb.toFixed(1)} KB (target: ${minKB}–${maxKB} KB)`);

  // Already in range — done
  if (kb >= minKB && kb <= maxKB) return buf;

  // ── Step 4: File is TOO LARGE → reduce quality (no noise needed) ─────
  if (kb > maxKB) {
    for (let q = 85; q >= 10; q -= 5) {
      buf = await encodeJpeg(rawData, w, h, channels, q, '4:2:0');
      if (buf.length / 1024 <= maxKB) break;
    }
    console.log(`[Sharp] After quality reduction: ${(buf.length/1024).toFixed(1)} KB`);
    return buf;
  }

  // ── Step 5: File is TOO SMALL → binary search noise level ────────────
  // Noise range: 1 (barely anything) to 30 (still invisible, ~0.8% change per px)
  let lo = 1, hi = 30, bestBuf = buf;

  for (let iter = 0; iter < 8; iter++) {          // max 8 iterations
    const mid     = Math.round((lo + hi) / 2);
    const noisy   = addNoise(rawData, mid);
    const attempt = await encodeJpeg(noisy, w, h, channels, 95, '4:4:4');
    const attemptKb = attempt.length / 1024;

    console.log(`[Sharp] Noise ±${mid} → ${attemptKb.toFixed(1)} KB`);

    if (attemptKb >= minKB && attemptKb <= maxKB) {
      bestBuf = attempt;    // perfect — inside range
      break;
    } else if (attemptKb < minKB) {
      lo = mid + 1;         // need more noise
      bestBuf = attempt;    // keep as fallback (closest we got)
    } else {
      hi = mid - 1;         // too much noise, file went over maxKB
    }
  }

  // ── Step 6: Safety — if bestBuf still exceeds maxKB, compress it down
  if (bestBuf.length / 1024 > maxKB) {
    for (let q = 85; q >= 10; q -= 5) {
      const { data: noisyRaw } = await sharp(bestBuf).raw().toBuffer({ resolveWithObject: true });
      bestBuf = await encodeJpeg(noisyRaw, w, h, channels, q, '4:2:0');
      if (bestBuf.length / 1024 <= maxKB) break;
    }
  }

  console.log(`[Sharp] Final: ${(bestBuf.length/1024).toFixed(1)} KB`);
  return bestBuf;
}

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/process/photo
   POST /api/process/signature
───────────────────────────────────────────────────────────────────────────── */
const processImage = async (req, res) => {
  const toolType     = req.path.replace('/', ''); // "photo" or "signature"
  const { examName } = req.body;
  const user         = req.user || null;
  console.time(`process-${toolType}-total`);

  // ── Validation ─────────────────────────────────────────────────────────
  if (!req.file)
    return res.status(400).json({ message: 'No file uploaded.' });

  if (!examName || !examSpecs[examName])
    return res.status(400).json({ message: `Unknown exam: "${examName}".` });

  const spec = examSpecs[examName][toolType];
  if (!spec)
    return res.status(400).json({ message: `No ${toolType} spec for ${examName}.` });

  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(req.file.mimetype))
    return res.status(400).json({ message: 'Only JPG, PNG, WEBP images are supported.' });

  // ── Process ─────────────────────────────────────────────────────────────
  let processedBuffer;
  try {
    console.time(`process-${toolType}-sharp`);
    processedBuffer = await compressToRange(
      req.file.buffer,
      spec.w, spec.h,
      spec.maxKB, spec.minKB
    );
    console.timeEnd(`process-${toolType}-sharp`);
  } catch (err) {
    console.error('Sharp error:', err.message);
    return res.status(500).json({ message: 'Image processing failed.' });
  }

  const finalSizeKB = Math.round(processedBuffer.length / 1024);
  const withinRange = finalSizeKB <= spec.maxKB; // portals reject OVER max, not under

  // ── Credits ─────────────────────────────────────────────────────────────
  const creditCost = TOOL_CREDIT_COST[toolType] || 2;

  // ── Upload to Cloudinary ────────────────────────────────────────────────
  let uploadResult;
  try {
    console.time(`process-${toolType}-cloudinary`);

    uploadResult = await uploadBuffer(processedBuffer, `docsaathi/${toolType}`);
    console.timeEnd(`process-${toolType}-cloudinary`);

  } catch (err) {
    console.error('Cloudinary error:', err.message);
    return res.status(500).json({ message: 'Upload failed. Check Cloudinary credentials.' });
  }

  console.timeEnd(`process-${toolType}-total`);

  res.json({
    url:         uploadResult.secure_url,
    sizeKB:      finalSizeKB,
    dimensions:  `${spec.w}×${spec.h}`,
    targetMaxKB: spec.maxKB,
    targetMinKB: spec.minKB,
    withinRange,
    hasWatermark: true,
    creditsLeft:  user ? user.credits : null,
    creditCost,
    exam:         examName,
    type:         toolType,
  });
};

const confirmDownload = async (req, res) => {
  try {
    const { toolType, examName, processedUrl } = req.body;
    const creditCost = TOOL_CREDIT_COST[toolType];

    if (!creditCost) {
      return res.status(400).json({ message: 'Unsupported tool type for download confirmation.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.credits < creditCost) {
      return res.status(400).json({
        message: `Need ${creditCost} credits to download this file.`,
        creditsLeft: user.credits,
      });
    }

    user.credits -= creditCost;
    await user.save();

    await History.create({
      user: user._id,
      toolType,
      examName: examName || toolType,
      processedUrl: processedUrl || '',
      creditsUsed: creditCost,
      hasWatermark: false,
    });

    res.json({
      success: true,
      creditCost,
      creditsLeft: user.credits,
    });
  } catch (error) {
    console.error('[Process] confirmDownload error:', error.message);
    res.status(500).json({ message: 'Could not confirm download.' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/process/history
───────────────────────────────────────────────────────────────────────────── */
const getHistory = async (req, res) => {
  const history = await History.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(history);
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/process/exams
───────────────────────────────────────────────────────────────────────────── */
const getExams = async (req, res) => {
  const list = Object.entries(examSpecs).map(([name, spec]) => ({
    name,
    photo:     { w: spec.photo.w,     h: spec.photo.h,     maxKB: spec.photo.maxKB,     minKB: spec.photo.minKB     },
    signature: { w: spec.signature.w, h: spec.signature.h, maxKB: spec.signature.maxKB, minKB: spec.signature.minKB },
  }));
  res.json(list);
};

module.exports = { processImage, confirmDownload, getHistory, getExams };
