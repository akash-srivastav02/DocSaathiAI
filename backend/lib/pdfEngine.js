const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { PDFDocument } = require('pdf-lib');

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
    'gswin64c',
    'gswin32c',
  ].filter(Boolean);
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
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'formfixer-pdf-'));
  const inputPath = path.join(tempDir, 'input.pdf');
  const outputPath = path.join(tempDir, 'output.pdf');

  try {
    await fs.writeFile(inputPath, buffer);

    let lastError = null;
    for (const binary of resolveGhostscriptBinary()) {
      try {
        await runGhostscript(binary, inputPath, outputPath, qualityPreset);
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

async function compressPDFBuffer(buffer, qualityPreset = 'medium') {
  try {
    const gsBuffer = await compressWithGhostscript(buffer, qualityPreset);
    return { buffer: gsBuffer, engine: 'ghostscript' };
  } catch {
    const fallback = await compressPDFBufferWithPdfLib(buffer);
    return { buffer: fallback, engine: 'pdf-lib' };
  }
}

module.exports = {
  compressPDFBuffer,
};
