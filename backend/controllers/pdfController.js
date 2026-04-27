const { uploadPDFBuffer } = require('../utils/cloudinary');
const { compressPDFBuffer, convertImagesToPdfBuffer } = require('../lib/pdfEngine');

const compressPDF = async (req, res) => {
  try {
    const user = req.user || null;

    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed.' });
    }

    const originalKB = Math.round(req.file.buffer.length / 1024);
    const targetKB = req.body.targetKB ? parseInt(req.body.targetKB, 10) : null;
    const quality = req.body.quality || 'medium';

    const compressed = await compressPDFBuffer(req.file.buffer, {
      qualityPreset: quality,
      targetKB,
    });
    const compressedBuffer = compressed.buffer;
    const compressedKB = Math.round(compressedBuffer.length / 1024);
    const reduction = Math.max(0, Math.round(((originalKB - compressedKB) / originalKB) * 100));
    const hitTarget = targetKB ? compressedKB <= targetKB : true;

    let uploadResult;
    try {
      uploadResult = await uploadPDFBuffer(compressedBuffer);
    } catch (error) {
      console.error('[PDF] Cloudinary upload error:', error.message);
      return res.status(500).json({ message: 'Upload failed. Check Cloudinary credentials.' });
    }

    const engineLabel = compressed.engine === 'ghostscript' ? 'FormFixer PDF Pro' : 'FormFixer PDF Basic';
    const targetReduction = targetKB
      ? Math.max(0, Math.round(((originalKB - targetKB) / originalKB) * 100))
      : null;

    return res.json({
      url: uploadResult.secure_url,
      originalKB,
      compressedKB,
      reduction,
      hitTarget,
      targetKB: targetKB || compressedKB,
      hasWatermark: true,
      creditsLeft: user ? user.credits : null,
      creditCost: 2,
      engine: compressed.engine,
      engineLabel,
      canImproveFurther: compressed.engine !== 'ghostscript',
      targetReduction,
    });
  } catch (error) {
    console.error('[PDF] Compress Error:', error.message);
    return res.status(500).json({
      message: 'PDF compression failed. The file may be encrypted or corrupted.',
      error: error.message,
    });
  }
};

const imageToPdf = async (req, res) => {
  try {
    const user = req.user || null;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Upload at least one image.' });
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const invalid = req.files.find((file) => !allowed.includes(file.mimetype));
    if (invalid) {
      return res.status(400).json({ message: 'Only JPG, PNG, WEBP, HEIC, and HEIF images are supported.' });
    }

    const pageMode = req.body.pageMode === 'original' ? 'original' : 'a4';
    const orientation = ['auto', 'portrait', 'landscape'].includes(req.body.orientation)
      ? req.body.orientation
      : 'auto';

    const pdfBuffer = await convertImagesToPdfBuffer(
      req.files.map((file) => file.buffer),
      { pageMode, orientation }
    );

    let uploadResult;
    try {
      uploadResult = await uploadPDFBuffer(pdfBuffer, 'formfixer/pdfs');
    } catch (error) {
      console.error('[ImageToPDF] Cloudinary upload error:', error.message);
      return res.status(500).json({ message: 'Upload failed. Check Cloudinary credentials.' });
    }

    return res.json({
      url: uploadResult.secure_url,
      originalCount: req.files.length,
      pageCount: req.files.length,
      pdfKB: Math.round(pdfBuffer.length / 1024),
      hasWatermark: true,
      creditsLeft: user ? user.credits : null,
      creditCost: 2,
      engine: 'formfixer-image-to-pdf',
      pageMode,
      orientation,
    });
  } catch (error) {
    console.error('[ImageToPDF] Error:', error.message);
    return res.status(500).json({
      message: 'Image to PDF conversion failed.',
      error: error.message,
    });
  }
};

module.exports = { compressPDF, imageToPdf };
