const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { PDFDocument } = require('pdf-lib');
const { uploadPDFBuffer } = require('../utils/cloudinary');

async function compressPDFBufferWithPdfLib(buffer) {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('DocSaathi');
  pdfDoc.setCreator('DocSaathi');

  return Buffer.from(
    await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false })
  );
}

function resolveGhostscriptBinary() {
  const candidates = [
    process.env.GHOSTSCRIPT_PATH,
    'gswin64c',
    'gswin32c',
  ].filter(Boolean);

  return candidates;
}

function runGhostscript(binary, inputPath, outputPath, qualityPreset) {
  const preset = qualityPreset === 'high'
    ? '/printer'
    : qualityPreset === 'low'
      ? '/screen'
      : '/ebook';

  const args = [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    '-dNOPAUSE',
    '-dQUIET',
    '-dBATCH',
    `-dPDFSETTINGS=${preset}`,
    '-dDetectDuplicateImages=true',
    '-dCompressFonts=true',
    '-dSubsetFonts=true',
    '-dDownsampleColorImages=true',
    '-dDownsampleGrayImages=true',
    '-dDownsampleMonoImages=true',
    '-dColorImageResolution=144',
    '-dGrayImageResolution=144',
    '-dMonoImageResolution=144',
    `-sOutputFile=${outputPath}`,
    inputPath,
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { windowsHide: true });
    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `Ghostscript exited with code ${code}`));
      }
    });
  });
}

async function compressWithGhostscript(buffer, qualityPreset) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'docsaathi-pdf-'));
  const inputPath = path.join(tempDir, 'input.pdf');
  const outputPath = path.join(tempDir, 'output.pdf');

  try {
    await fs.writeFile(inputPath, buffer);

    let lastError = null;
    for (const binary of resolveGhostscriptBinary()) {
      try {
        await runGhostscript(binary, inputPath, outputPath, qualityPreset);
        const outputBuffer = await fs.readFile(outputPath);
        return outputBuffer;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Ghostscript not available');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function compressPDFBuffer(buffer, qualityPreset) {
  try {
    const gsBuffer = await compressWithGhostscript(buffer, qualityPreset);
    return { buffer: gsBuffer, engine: 'ghostscript' };
  } catch (error) {
    const fallback = await compressPDFBufferWithPdfLib(buffer);
    return { buffer: fallback, engine: 'pdf-lib' };
  }
}

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

    console.log('[PDF] Uploading to Cloudinary...');
    let uploadResult;
    try {
      uploadResult = await uploadPDFBuffer(compressedBuffer);
      console.log('[PDF] Upload success:', uploadResult.secure_url);
    } catch (err) {
      console.error('[PDF] Cloudinary upload error:', err.message);
      return res.status(500).json({ message: 'Upload failed. Check Cloudinary credentials.' });
    }

    const engineLabel = compressed.engine === 'ghostscript' ? 'Ghostscript' : 'Basic PDF engine';

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
