const User = require('../models/User');
const History = require('../models/ProcessHistory');
const examSpecs = require('../data/examSpecs');
const { uploadBuffer } = require('../utils/cloudinary');
const { processExamImageBuffer } = require('../lib/imageEngine');

const TOOL_CREDIT_COST = {
  photo: 2,
  signature: 2,
  crop: 2,
  imgcompress: 2,
  pdfcompress: 2,
  merger: 6,
};

const processImage = async (req, res) => {
  const toolType = req.path.replace('/', '');
  const { examName } = req.body;
  const user = req.user || null;
  let focusBox = null;

  if (req.body.focusBox) {
    try {
      focusBox = JSON.parse(req.body.focusBox);
    } catch {
      focusBox = null;
    }
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  if (!examName || !examSpecs[examName]) {
    return res.status(400).json({ message: `Unknown exam: "${examName}".` });
  }

  const spec = examSpecs[examName][toolType];
  if (!spec) {
    return res.status(400).json({ message: `No ${toolType} spec for ${examName}.` });
  }

  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(req.file.mimetype)) {
    return res.status(400).json({ message: 'Only JPG, PNG, WEBP images are supported.' });
  }

  let processed;
  try {
    processed = await processExamImageBuffer(req.file.buffer, {
      width: spec.w,
      height: spec.h,
      minKB: spec.minKB,
      maxKB: spec.maxKB,
      focusBox: toolType === 'photo' ? focusBox : null,
    });
  } catch (error) {
    console.error('[Process] image engine error:', error.message);
    return res.status(500).json({ message: 'Image processing failed.' });
  }

  const finalSizeKB = processed.meta.sizeKB;
  const withinRange = processed.meta.withinMaxKB;
  const creditCost = TOOL_CREDIT_COST[toolType] || 2;

  let uploadResult;
  try {
    uploadResult = await uploadBuffer(processed.buffer, `formfixer/${toolType}`);
  } catch (error) {
    console.error('[Process] cloudinary upload error:', error.message);
    return res.status(500).json({ message: 'Upload failed. Check Cloudinary credentials.' });
  }

  res.json({
    url: uploadResult.secure_url,
    sizeKB: finalSizeKB,
    dimensions: `${spec.w}×${spec.h}`,
    targetMaxKB: spec.maxKB,
    targetMinKB: spec.minKB,
    withinRange,
    hasWatermark: true,
    creditsLeft: user ? user.credits : null,
    creditCost,
    exam: examName,
    type: toolType,
    engine: 'formfixer-image-engine',
    processing: {
      quality: processed.meta.quality,
      underMinKB: processed.meta.underMinKB,
      focusGuided: processed.meta.focusGuided,
    },
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

const getHistory = async (req, res) => {
  const history = await History.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(history);
};

const getExams = async (req, res) => {
  const list = Object.entries(examSpecs).map(([name, spec]) => ({
    name,
    photo: { w: spec.photo.w, h: spec.photo.h, maxKB: spec.photo.maxKB, minKB: spec.photo.minKB },
    signature: { w: spec.signature.w, h: spec.signature.h, maxKB: spec.signature.maxKB, minKB: spec.signature.minKB },
  }));
  res.json(list);
};

module.exports = { processImage, confirmDownload, getHistory, getExams };
