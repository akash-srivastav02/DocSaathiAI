const { uploadPDFBuffer } = require('../utils/cloudinary');
const { compressPDFBuffer } = require('../lib/pdfEngine');

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

    const compressed = await compressPDFBuffer(req.file.buffer, quality);
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
    });
  } catch (error) {
    console.error('[PDF] Compress Error:', error.message);
    return res.status(500).json({
      message: 'PDF compression failed. The file may be encrypted or corrupted.',
      error: error.message,
    });
  }
};

module.exports = { compressPDF };
