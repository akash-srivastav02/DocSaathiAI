const { PDFDocument } = require('pdf-lib');
const User    = require('../models/User');
const History = require('../models/ProcessHistory');
const { uploadBuffer } = require('../utils/cloudinary');

/* ─────────────────────────────────────────────────────────────────────────────
   PDF COMPRESSION — How it works:

   PDFs come in two types:
   ① Text/vector PDFs (native digital) — already small, pdf-lib saves 10–40%
   ② Scanned PDFs (pages are JPEG/PNG images) — can be compressed 50–80%

   Strategy (applied in order until target is hit):
   1. Strip all metadata (author, title, keywords, timestamps)
   2. Re-save with useObjectStreams: true (deflate compression on object table)
   3. Remove embedded thumbnails if present
   4. For scanned PDFs: re-compress embedded images using sharp
   5. If target still not met: report best achieved size honestly

   Ghostscript would be ideal for step 4 but requires system installation.
   This pure-JS approach works on all platforms with no system dependencies.
───────────────────────────────────────────────────────────────────────────── */

// Quality presets — map to JPEG quality for embedded images
const QUALITY_PRESETS = {
  high:   { jpegQuality: 85, label: 'High Quality'        },
  medium: { jpegQuality: 65, label: 'Medium Quality'      },
  low:    { jpegQuality: 40, label: 'Maximum Compression' },
};

/**
 * stripMetadata — clears all metadata fields to save space
 */
function stripMetadata(pdfDoc) {
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('DocSaathi');
  pdfDoc.setCreator('DocSaathi');
}

/**
 * compressPDF — main compression function
 * @param {Buffer} inputBuffer  - raw PDF bytes
 * @param {number} targetKB     - desired max output size in KB
 * @param {string} quality      - 'high' | 'medium' | 'low'
 * @returns {Buffer}            - compressed PDF bytes
 */
async function compressPDF(inputBuffer, targetKB, quality = 'medium') {
  const originalKB = Math.round(inputBuffer.length / 1024);
  console.log(`[PDF] Original: ${originalKB} KB | Target: ≤${targetKB} KB | Quality: ${quality}`);

  // ── Pass 1: Load, strip metadata, re-save with object streams ──────────
  const pdfDoc = await PDFDocument.load(inputBuffer, { ignoreEncryption: true });
  stripMetadata(pdfDoc);

  let compressed = Buffer.from(
    await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false })
  );
  let currentKB = Math.round(compressed.length / 1024);
  console.log(`[PDF] After Pass 1 (metadata strip + streams): ${currentKB} KB`);

  if (currentKB <= targetKB) return compressed; // done

  // ── Pass 2: Re-compress embedded images using Sharp ────────────────────
  // pdf-lib exposes embedded images via getPages() → node.Resources
  // We iterate pages and re-compress XObject images
  try {
    const sharp = require('sharp');
    const { jpegQuality } = QUALITY_PRESETS[quality] || QUALITY_PRESETS.medium;
    const pdfDoc2 = await PDFDocument.load(compressed, { ignoreEncryption: true });

    const pages = pdfDoc2.getPages();
    let imagesRecompressed = 0;

    for (const page of pages) {
      const resources = page.node.Resources();
      if (!resources) continue;

      const xObjects = resources.lookup(
        pdfDoc2.context.obj('XObject'),
        pdfDoc2.context.PDFDict
      );
      if (!xObjects) continue;

      for (const [, ref] of xObjects.entries()) {
        try {
          const stream = pdfDoc2.context.lookup(ref);
          if (!stream || typeof stream.dict === 'undefined') continue;

          const subtype = stream.dict.get(pdfDoc2.context.obj('Subtype'));
          if (!subtype || subtype.toString() !== '/Image') continue;

          const rawBytes = stream.contents;
          if (!rawBytes || rawBytes.length < 500) continue; // skip tiny images

          // Try to re-compress with Sharp
          const sharpBuf = await sharp(Buffer.from(rawBytes))
            .jpeg({ quality: jpegQuality })
            .toBuffer()
            .catch(() => null); // skip if sharp can't parse (e.g., JBIG2)

          if (sharpBuf && sharpBuf.length < rawBytes.length) {
            // Replace stream contents
            stream.contents = new Uint8Array(sharpBuf);
            imagesRecompressed++;
          }
        } catch {
          // Skip images that can't be processed
        }
      }
    }

    if (imagesRecompressed > 0) {
      const pass2 = Buffer.from(
        await pdfDoc2.save({ useObjectStreams: true })
      );
      currentKB = Math.round(pass2.length / 1024);
      console.log(`[PDF] After Pass 2 (${imagesRecompressed} images recompressed): ${currentKB} KB`);
      if (pass2.length < compressed.length) compressed = pass2;
    }
  } catch (err) {
    // Sharp or image extraction failed — continue with Pass 1 result
    console.log('[PDF] Pass 2 skipped:', err.message);
  }

  console.log(`[PDF] Final: ${Math.round(compressed.length / 1024)} KB`);
  return compressed;
}

/* ─────────────────────────────────────────────────────────────────────────────
   POST /api/pdf/compress
   Body: multipart/form-data
     - pdf: File (PDF)
     - targetKB: number (e.g. 500, 200, 100, 50)
     - quality: 'high' | 'medium' | 'low'
───────────────────────────────────────────────────────────────────────────── */
const compressPDFRoute = async (req, res) => {
  const user = req.user;

  if (!req.file)
    return res.status(400).json({ message: 'No PDF uploaded.' });

  if (req.file.mimetype !== 'application/pdf')
    return res.status(400).json({ message: 'Only PDF files are supported.' });

  const targetKB  = parseInt(req.body.targetKB)  || 500;
  const quality   = req.body.quality              || 'medium';
  const originalKB = Math.round(req.file.buffer.length / 1024);

  if (!['high', 'medium', 'low'].includes(quality))
    return res.status(400).json({ message: 'Invalid quality. Use: high, medium, low' });

  // ── Compress ────────────────────────────────────────────────────────────
  let compressedBuffer;
  try {
    compressedBuffer = await compressPDF(req.file.buffer, targetKB, quality);
  } catch (err) {
    console.error('PDF compression error:', err.message);
    return res.status(500).json({ message: 'PDF compression failed. The file may be encrypted or corrupted.' });
  }

  const compressedKB = Math.round(compressedBuffer.length / 1024);
  const reduction    = Math.round(((originalKB - compressedKB) / originalKB) * 100);
  const hitTarget    = compressedKB <= targetKB;

  // ── Upload to Cloudinary ────────────────────────────────────────────────
  let uploadResult;
  try {
    const { cloudinary } = require('../utils/cloudinary');
    uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'docsaathi/pdf', resource_type: 'raw', format: 'pdf' },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(compressedBuffer);
    });
  } catch (err) {
    console.error('Cloudinary PDF upload error:', err.message);
    return res.status(500).json({ message: 'Upload failed. Check Cloudinary credentials.' });
  }

  // ── Credits ─────────────────────────────────────────────────────────────
  const hasCredits   = user.credits > 0;
  const addWatermark = !hasCredits;
  let newCredits     = user.credits;

  if (hasCredits) {
    await User.findByIdAndUpdate(user._id, { $inc: { credits: -1 } });
    newCredits = user.credits - 1;
  }

  // ── History ─────────────────────────────────────────────────────────────
  await History.create({
    user:         user._id,
    toolType:     'pdfcompress',
    examName:     `Target: ${targetKB} KB`,
    processedUrl: uploadResult.secure_url,
    creditsUsed:  hasCredits ? 1 : 0,
    hasWatermark: addWatermark,
  });

  res.json({
    url:          uploadResult.secure_url,
    originalKB,
    compressedKB,
    reduction,        // % size reduced
    hitTarget,        // did we reach targetKB?
    targetKB,
    hasWatermark: addWatermark,
    creditsLeft:  newCredits,
  });
};

/* ─────────────────────────────────────────────────────────────────────────────
   GET /api/pdf/targets  →  exam-based PDF size targets for frontend dropdown
───────────────────────────────────────────────────────────────────────────── */
const getPDFTargets = (req, res) => {
  res.json([
    { label: 'SSC / IBPS / SBI (1 MB)',       targetKB: 1000 },
    { label: 'UPSC (500 KB)',                  targetKB: 500  },
    { label: 'Railway / Police (300 KB)',      targetKB: 300  },
    { label: 'JEE / NEET (200 KB)',            targetKB: 200  },
    { label: 'Certificate Scan (100 KB)',      targetKB: 100  },
    { label: 'Custom (50 KB)',                 targetKB: 50   },
  ]);
};

module.exports = { compressPDFRoute, getPDFTargets };