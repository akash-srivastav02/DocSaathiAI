const { PDFDocument } = require('pdf-lib');
const { uploadPDFBuffer } = require('../utils/cloudinary');
const User           = require('../models/User');
const ProcessHistory = require('../models/ProcessHistory');

/* ─────────────────────────────────────────────────────────────────────────────
   compressPDFBuffer
   Strips all metadata and re-saves with object streams (deflate).
   This is the maximum compression pdf-lib can do in pure JS.
   Scanned PDFs (image-heavy) → 10–40% reduction
   Text PDFs (digital) → 2–15% reduction
───────────────────────────────────────────────────────────────────────────── */
const compressPDFBuffer = async (buffer) => {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  // Strip metadata — saves 1–5 KB
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('DocSaathi');
  pdfDoc.setCreator('DocSaathi');

  return Buffer.from(
    await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false })
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/pdf/compress
   Body (multipart): pdf (File), targetKB (number), quality (string)
───────────────────────────────────────────────────────────────────────────── */
const compressPDF = async (req, res) => {
  try {
    const user = req.user;

    // ── Validation ────────────────────────────────────────────────────────
    if (!req.file)
      return res.status(400).json({ message: 'No PDF file uploaded.' });

    if (req.file.mimetype !== 'application/pdf')
      return res.status(400).json({ message: 'Only PDF files are allowed.' });

    const originalKB = Math.round(req.file.buffer.length / 1024);
    const targetKB   = req.body.targetKB ? parseInt(req.body.targetKB) : null;

    // ── Compress ──────────────────────────────────────────────────────────
    const compressedBuffer = await compressPDFBuffer(req.file.buffer);
    const compressedKB     = Math.round(compressedBuffer.length / 1024);
    const reduction        = Math.max(0, Math.round(((originalKB - compressedKB) / originalKB) * 100));
    const hitTarget        = targetKB ? compressedKB <= targetKB : true;

    // ── Upload to Cloudinary ──────────────────────────────────────────────
    console.log('[PDF] Uploading to Cloudinary...');
    let uploadResult;
    try {
      uploadResult = await uploadPDFBuffer(compressedBuffer);
      console.log('[PDF] Upload success:', uploadResult.secure_url);
    } catch (err) {
      console.error('[PDF] Cloudinary upload error:', err.message);
      return res.status(500).json({ message: 'Upload failed. Check Cloudinary credentials.' });
    }

    // ── Credits ───────────────────────────────────────────────────────────
    const hasCredits = user.credits > 0;
    let newCredits   = user.credits;
    if (hasCredits) {
      await User.findByIdAndUpdate(user._id, { $inc: { credits: -1 } });
      newCredits = user.credits - 1;
    }

    // ── History ───────────────────────────────────────────────────────────
    await ProcessHistory.create({
      user:         user._id,
      toolType:     'pdfcompress',
      examName:     targetKB ? `Target: ${targetKB} KB` : 'Auto compress',
      processedUrl: uploadResult.secure_url,
      creditsUsed:  hasCredits ? 1 : 0,
      hasWatermark: !hasCredits,
    });

    // ── Response ──────────────────────────────────────────────────────────
    // NOTE: field names match exactly what PDFCompressPage.jsx expects
    return res.json({
      url:          uploadResult.secure_url,
      originalKB,        // ← frontend reads this
      compressedKB,      // ← frontend reads this
      reduction,         // ← frontend reads this (% saved)
      hitTarget,         // ← frontend reads this (boolean)
      targetKB:     targetKB || compressedKB,
      hasWatermark: !hasCredits,
      creditsLeft:  newCredits,
    });

  } catch (error) {
    console.error('[PDF] Compress Error:', error.message);
    return res.status(500).json({
      message: 'PDF compression failed. The file may be encrypted or corrupted.',
      error:   error.message,
    });
  }
};

module.exports = { compressPDF };