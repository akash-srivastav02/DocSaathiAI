const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

const A4_PAGE = { width: 595, height: 842 };

async function compressPDFBufferWithPdfLib(buffer) {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('FormFixer');
  pdfDoc.setCreator('FormFixer');

  return Buffer.from(
    await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false })
  );
}

function resolveGhostscriptBinary() {
  return [
    process.env.GHOSTSCRIPT_PATH,
    'gs',
    'gswin64c',
    'gswin32c',
  ].filter(Boolean);
}

function buildGhostscriptProfile(qualityPreset, targetRatio = null) {
  const aggressiveTarget = targetRatio !== null && targetRatio <= 0.7;
  const veryAggressiveTarget = targetRatio !== null && targetRatio <= 0.55;

  if (qualityPreset === 'high') {
    return {
      preset: '/printer',
      colorResolution: 150,
      grayResolution: 150,
      monoResolution: 300,
      jpegQuality: 88,
    };
  }

  if (qualityPreset === 'low') {
    return {
      preset: '/screen',
      colorResolution: veryAggressiveTarget ? 84 : 96,
      grayResolution: veryAggressiveTarget ? 84 : 96,
      monoResolution: 200,
      jpegQuality: veryAggressiveTarget ? 52 : 58,
    };
  }

  return {
    preset: aggressiveTarget ? '/screen' : '/ebook',
    colorResolution: aggressiveTarget ? 108 : 132,
    grayResolution: aggressiveTarget ? 108 : 132,
    monoResolution: 240,
    jpegQuality: aggressiveTarget ? 62 : 72,
  };
}

function runGhostscript(binary, inputPath, outputPath, qualityPreset, targetRatio) {
  const profile = buildGhostscriptProfile(qualityPreset, targetRatio);

  const args = [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.4',
    '-dNOPAUSE',
    '-dQUIET',
    '-dBATCH',
    `-dPDFSETTINGS=${profile.preset}`,
    '-dDetectDuplicateImages=true',
    '-dCompressFonts=true',
    '-dSubsetFonts=true',
    '-dAutoRotatePages=/None',
    '-dAutoFilterColorImages=false',
    '-dAutoFilterGrayImages=false',
    '-dColorImageFilter=/DCTEncode',
    '-dGrayImageFilter=/DCTEncode',
    `-dJPEGQ=${profile.jpegQuality}`,
    '-dDownsampleColorImages=true',
    '-dDownsampleGrayImages=true',
    '-dDownsampleMonoImages=true',
    '-dColorImageDownsampleType=/Bicubic',
    '-dGrayImageDownsampleType=/Bicubic',
    '-dMonoImageDownsampleType=/Subsample',
    `-dColorImageResolution=${profile.colorResolution}`,
    `-dGrayImageResolution=${profile.grayResolution}`,
    `-dMonoImageResolution=${profile.monoResolution}`,
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

async function compressWithGhostscript(buffer, qualityPreset, targetRatio) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'formfixer-pdf-'));
  const inputPath = path.join(tempDir, 'input.pdf');
  const outputPath = path.join(tempDir, 'output.pdf');

  try {
    await fs.writeFile(inputPath, buffer);

    let lastError = null;
    for (const binary of resolveGhostscriptBinary()) {
      try {
        await runGhostscript(binary, inputPath, outputPath, qualityPreset, targetRatio);
        return await fs.readFile(outputPath);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Ghostscript not available');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function compressPDFBuffer(buffer, options = {}) {
  const qualityPreset = options.qualityPreset || 'medium';
  const targetKB = Number.isFinite(options.targetKB) ? options.targetKB : null;
  const originalKB = Math.max(1, Math.round(buffer.length / 1024));
  const targetRatio = targetKB ? targetKB / originalKB : null;

  try {
    const gsBuffer = await compressWithGhostscript(buffer, qualityPreset, targetRatio);
    return { buffer: gsBuffer, engine: 'ghostscript' };
  } catch {
    const fallback = await compressPDFBufferWithPdfLib(buffer);
    return { buffer: fallback, engine: 'pdf-lib' };
  }
}

async function convertImagesToPdfBuffer(imageBuffers, options = {}) {
  const pageMode = options.pageMode || 'a4';
  const orientation = options.orientation || 'auto';
  const pdfDoc = await PDFDocument.create();

  for (const inputBuffer of imageBuffers) {
    const prepared = await sharp(inputBuffer)
      .rotate()
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
      .toBuffer();

    const metadata = await sharp(prepared).metadata();
    const imgWidth = metadata.width || 1200;
    const imgHeight = metadata.height || 1600;

    const jpgImage = await pdfDoc.embedJpg(prepared);

    let pageWidth;
    let pageHeight;

    if (pageMode === 'original') {
      const baseScale = 0.5;
      pageWidth = Math.max(300, Math.round(imgWidth * baseScale));
      pageHeight = Math.max(300, Math.round(imgHeight * baseScale));
    } else {
      const isLandscape = orientation === 'landscape' || (orientation === 'auto' && imgWidth > imgHeight);
      pageWidth = isLandscape ? A4_PAGE.height : A4_PAGE.width;
      pageHeight = isLandscape ? A4_PAGE.width : A4_PAGE.height;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const margin = pageMode === 'original' ? 18 : 24;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;
    const scale = Math.min(usableWidth / jpgImage.width, usableHeight / jpgImage.height);
    const drawWidth = jpgImage.width * scale;
    const drawHeight = jpgImage.height * scale;
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    page.drawImage(jpgImage, { x, y, width: drawWidth, height: drawHeight });
  }

  return Buffer.from(await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false }));
}

async function mergePdfBuffers(pdfBuffers) {
  const mergedPdf = await PDFDocument.create();

  for (const inputBuffer of pdfBuffers) {
    const sourcePdf = await PDFDocument.load(inputBuffer, { ignoreEncryption: true });
    const pageIndices = sourcePdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return Buffer.from(await mergedPdf.save({ useObjectStreams: true, addDefaultPage: false }));
}

module.exports = {
  compressPDFBuffer,
  convertImagesToPdfBuffer,
  mergePdfBuffers,
};
