const sharp = require('sharp');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function encodeJpeg(pipelineFactory, quality, chromaSubsampling = '4:4:4') {
  return pipelineFactory()
    .jpeg({
      quality,
      chromaSubsampling,
      mozjpeg: false,
    })
    .toBuffer();
}

function normalizeFocusBox(focusBox, imageWidth, imageHeight) {
  if (!focusBox) return null;
  const x = Number(focusBox.x);
  const y = Number(focusBox.y);
  const width = Number(focusBox.width);
  const height = Number(focusBox.height);

  if (![x, y, width, height].every(Number.isFinite)) return null;
  if (width <= 0 || height <= 0) return null;

  return {
    x: clamp(x, 0, imageWidth),
    y: clamp(y, 0, imageHeight),
    width: clamp(width, 1, imageWidth),
    height: clamp(height, 1, imageHeight),
  };
}

function buildFocusCrop({ focusBox, imageWidth, imageHeight, targetWidth, targetHeight }) {
  if (!focusBox) return null;

  const aspect = targetWidth / targetHeight;
  const faceCenterX = focusBox.x + focusBox.width / 2;
  const faceCenterY = focusBox.y + focusBox.height / 2;
  let cropHeight = Math.max(focusBox.height * 3.4, focusBox.width * 3.8);
  cropHeight = Math.min(cropHeight, imageHeight);
  let cropWidth = cropHeight * aspect;

  if (cropWidth > imageWidth) {
    cropWidth = imageWidth;
    cropHeight = cropWidth / aspect;
  }

  let cropX = faceCenterX - cropWidth / 2;
  let cropY = faceCenterY - cropHeight * 0.38;
  cropX = clamp(cropX, 0, imageWidth - cropWidth);
  cropY = clamp(cropY, 0, imageHeight - cropHeight);

  return {
    left: Math.round(cropX),
    top: Math.round(cropY),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
}

async function createExamImagePipelineFactory(inputBuffer, {
  width,
  height,
  background = { r: 255, g: 255, b: 255 },
  focusBox = null,
}) {
  const rotated = sharp(inputBuffer).rotate();
  const metadata = await rotated.metadata();
  const imageWidth = metadata.width || width;
  const imageHeight = metadata.height || height;
  const normalizedFocusBox = normalizeFocusBox(focusBox, imageWidth, imageHeight);
  const focusCrop = buildFocusCrop({
    focusBox: normalizedFocusBox,
    imageWidth,
    imageHeight,
    targetWidth: width,
    targetHeight: height,
  });

  return {
    pipelineFactory: () => {
      let pipeline = sharp(inputBuffer).rotate();

      if (focusCrop) {
        pipeline = pipeline.extract(focusCrop);
      }

      return pipeline
        .resize(width, height, {
          fit: 'cover',
          position: focusCrop ? 'centre' : 'top',
          kernel: sharp.kernel.lanczos3,
        })
        .flatten({ background })
        .sharpen({ sigma: 0.8, m1: 1.5, m2: 0.7 });
    },
    focusGuided: Boolean(focusCrop),
  };
}

async function processExamImageBuffer(inputBuffer, { width, height, minKB, maxKB, focusBox = null }) {
  const { pipelineFactory, focusGuided } = await createExamImagePipelineFactory(inputBuffer, {
    width,
    height,
    focusBox,
  });
  const attemptedQualities = [92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72];
  let bestBuffer = null;
  let bestMeta = null;

  for (const quality of attemptedQualities) {
    const buffer = await encodeJpeg(
      pipelineFactory,
      quality,
      quality >= 86 ? '4:4:4' : quality >= 78 ? '4:2:2' : '4:2:0'
    );
    const sizeKB = buffer.length / 1024;

    if (!bestBuffer) {
      bestBuffer = buffer;
      bestMeta = { quality, sizeKB };
    }

    if (sizeKB <= maxKB) {
      bestBuffer = buffer;
      bestMeta = { quality, sizeKB };
      break;
    }

    if (sizeKB < bestMeta.sizeKB) {
      bestBuffer = buffer;
      bestMeta = { quality, sizeKB };
    }
  }

  const finalKB = Math.round(bestMeta.sizeKB);

  return {
    buffer: bestBuffer,
    meta: {
      quality: bestMeta.quality,
      sizeKB: finalKB,
      underMinKB: finalKB < minKB,
      withinMaxKB: finalKB <= maxKB,
      targetMinKB: minKB,
      targetMaxKB: maxKB,
      focusGuided,
    },
  };
}

async function compressImageToTargetBuffer(inputBuffer, { targetKB, qualityBias = 'medium' }) {
  const source = await sharp(inputBuffer).rotate().flatten({ background: { r: 255, g: 255, b: 255 } });
  const metadata = await source.metadata();
  let width = metadata.width || 1200;
  let height = metadata.height || 1200;
  const maxDimension = 2400;

  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const qualityStart = qualityBias === 'high' ? 92 : qualityBias === 'low' ? 76 : 84;
  let bestBuffer = null;
  let bestSizeDiff = Number.POSITIVE_INFINITY;
  let bestInfo = null;

  for (let pass = 0; pass < 7; pass += 1) {
    const passWidth = Math.max(120, Math.round(width));
    const passHeight = Math.max(120, Math.round(height));

    const pipelineFactory = () =>
      sharp(inputBuffer)
        .rotate()
        .resize(passWidth, passHeight, {
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        })
        .flatten({ background: { r: 255, g: 255, b: 255 } });

    for (let quality = qualityStart; quality >= 46; quality -= 6) {
      const buffer = await encodeJpeg(
        pipelineFactory,
        quality,
        quality >= 82 ? '4:4:4' : quality >= 70 ? '4:2:2' : '4:2:0'
      );
      const sizeKB = Math.round(buffer.length / 1024);
      const diff = Math.abs(sizeKB - targetKB);

      if (diff < bestSizeDiff) {
        bestBuffer = buffer;
        bestSizeDiff = diff;
        bestInfo = { width: passWidth, height: passHeight, sizeKB };
      }

      if (sizeKB <= targetKB) {
        return {
          buffer,
          meta: {
            width: passWidth,
            height: passHeight,
            sizeKB,
            withinRange: true,
          },
        };
      }
    }

    width *= 0.88;
    height *= 0.88;
  }

  return {
    buffer: bestBuffer,
    meta: {
      width: bestInfo.width,
      height: bestInfo.height,
      sizeKB: bestInfo.sizeKB,
      withinRange: false,
    },
  };
}

module.exports = {
  clamp,
  processExamImageBuffer,
  compressImageToTargetBuffer,
};
